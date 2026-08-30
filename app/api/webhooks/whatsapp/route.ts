import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { assinaturaWhatsappValida, enviarMensagemWhatsapp } from "@/lib/whatsapp";
import { getAIProvider, montarPromptSistema, TAG_TRANSFERIR_HUMANO } from "@/lib/ai";
import type { MensagemConversa } from "@/lib/ai";

/** Handshake de verificação do webhook, chamado uma vez ao configurar no painel da Meta. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "verify_token inválido" }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!assinaturaWhatsappValida(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const mensagem = value?.messages?.[0];
  const phoneNumberId = value?.metadata?.phone_number_id;

  if (!mensagem || !phoneNumberId || mensagem.type !== "text") {
    // status de entrega, mensagens de mídia (fora do escopo por enquanto) etc.
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseServiceClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome_empresa, segmento, whatsapp_access_token")
    .eq("whatsapp_phone_number_id", phoneNumberId)
    .eq("ativo", true)
    .maybeSingle();

  if (!cliente) {
    // número não pertence a nenhum cliente ativo do ZapIA
    return NextResponse.json({ ok: true });
  }

  const numeroClienteFinal: string = mensagem.from;
  const textoRecebido: string = mensagem.text?.body ?? "";
  const whatsappMessageId: string = mensagem.id;

  // idempotência: a Meta pode reenviar a mesma notificação mais de uma vez
  const { data: jaProcessada } = await supabase
    .from("mensagens")
    .select("id")
    .eq("whatsapp_message_id", whatsappMessageId)
    .maybeSingle();

  if (jaProcessada) {
    return NextResponse.json({ ok: true });
  }

  let { data: conversa } = await supabase
    .from("conversas")
    .select("id, status")
    .eq("cliente_id", cliente.id)
    .eq("numero_cliente_final", numeroClienteFinal)
    .maybeSingle();

  if (!conversa) {
    const { data: novaConversa } = await supabase
      .from("conversas")
      .insert({ cliente_id: cliente.id, numero_cliente_final: numeroClienteFinal })
      .select("id, status")
      .single();
    conversa = novaConversa;
  }

  if (!conversa) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("mensagens").insert({
    conversa_id: conversa.id,
    remetente: "cliente_final",
    texto: textoRecebido,
    whatsapp_message_id: whatsappMessageId,
  });

  await supabase
    .from("conversas")
    .update({ ultima_mensagem_em: new Date().toISOString() })
    .eq("id", conversa.id);

  if (conversa.status === "transferida_humano") {
    // um humano já assumiu essa conversa; o bot para de responder
    return NextResponse.json({ ok: true });
  }

  const { data: empresaConfig } = await supabase
    .from("empresa_config")
    .select("*")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  const { data: produtos } = await supabase
    .from("produtos")
    .select("nome, descricao, preco")
    .eq("cliente_id", cliente.id)
    .eq("ativo", true);

  const { data: faqs } = await supabase.from("faq").select("pergunta, resposta").eq("cliente_id", cliente.id);

  let promptSistema = empresaConfig?.prompt_sistema;

  if (!promptSistema) {
    promptSistema = montarPromptSistema({
      nomeEmpresa: cliente.nome_empresa,
      segmento: cliente.segmento ?? "",
      tomDeVoz: empresaConfig?.tom_de_voz,
      horarioAtendimento: empresaConfig?.horario_atendimento,
      produtosServicos: produtos?.length
        ? produtos.map((p) => `${p.nome} - R$ ${p.preco}${p.descricao ? `: ${p.descricao}` : ""}`).join("\n")
        : null,
      faq: faqs?.length ? faqs.map((f) => `P: ${f.pergunta}\nR: ${f.resposta}`).join("\n\n") : null,
      formasPagamento: empresaConfig?.formas_pagamento,
      politicaTrocaCancelamento: empresaConfig?.politica_troca_cancelamento,
      quandoTransferirHumano: empresaConfig?.quando_transferir_humano,
    });

    if (empresaConfig) {
      await supabase.from("empresa_config").update({ prompt_sistema: promptSistema }).eq("cliente_id", cliente.id);
    }
  }

  const { data: historicoMensagens } = await supabase
    .from("mensagens")
    .select("remetente, texto")
    .eq("conversa_id", conversa.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const historico: MensagemConversa[] = (historicoMensagens ?? [])
    .reverse()
    .map((m) => ({ autor: m.remetente === "bot" ? "bot" : "cliente", texto: m.texto }));

  let respostaTexto: string;
  let precisaTransferir = false;

  try {
    respostaTexto = await getAIProvider().responder(
      { nomeEmpresa: cliente.nome_empresa, promptSistema },
      historico
    );
  } catch (err) {
    console.error("Erro ao chamar a IA:", err);
    respostaTexto = "Desculpa, tive um problema técnico agora. Já vou chamar alguém da equipe pra te ajudar.";
    precisaTransferir = true;
  }

  if (respostaTexto.includes(TAG_TRANSFERIR_HUMANO)) {
    respostaTexto = respostaTexto.replace(TAG_TRANSFERIR_HUMANO, "").trim();
    precisaTransferir = true;
  }

  if (precisaTransferir) {
    await supabase.from("conversas").update({ status: "transferida_humano" }).eq("id", conversa.id);
  }

  await supabase.from("mensagens").insert({
    conversa_id: conversa.id,
    remetente: "bot",
    texto: respostaTexto,
  });

  try {
    await enviarMensagemWhatsapp({
      phoneNumberId,
      accessToken: cliente.whatsapp_access_token,
      para: numeroClienteFinal,
      texto: respostaTexto,
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem via WhatsApp:", err);
  }

  return NextResponse.json({ ok: true });
}
