"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { montarPromptSistema } from "@/lib/ai";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  const supabase = await getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    redirect(`/painel/login?erro=${encodeURIComponent("E-mail ou senha inválidos")}`);
  }

  redirect("/painel");
}

export async function signOut() {
  const supabase = await getSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/painel/login");
}

/** Garante sessão válida e retorna o cliente dono dessa conta (nunca outro). */
async function exigirCliente() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/painel/login");
  }

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, lead_id, nome_empresa, segmento")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) {
    await supabase.auth.signOut();
    redirect(`/painel/login?erro=${encodeURIComponent("Conta não encontrada.")}`);
  }

  return cliente;
}

export async function salvarInformacoes(formData: FormData) {
  const cliente = await exigirCliente();
  const service = getSupabaseServiceClient();

  const { data: lead } = await service
    .from("leads")
    .select("plano_contratado")
    .eq("id", cliente.lead_id)
    .single();

  if (lead?.plano_contratado !== "upsell") {
    redirect(`/painel?erro=${encodeURIComponent("Seu plano não inclui edição. Faça upgrade para editar.")}`);
  }

  const campo = (nome: string) => String(formData.get(nome) ?? "").trim() || null;

  const dados = {
    tom_de_voz: campo("tom_de_voz"),
    horario_atendimento: campo("horario_atendimento"),
    endereco_localizacao: campo("endereco_localizacao"),
    formas_pagamento: campo("formas_pagamento"),
    politica_troca_cancelamento: campo("politica_troca_cancelamento"),
    quando_transferir_humano: campo("quando_transferir_humano"),
    contato_equipe_humana: campo("contato_equipe_humana"),
    produtos_servicos: campo("produtos_servicos"),
    faq: campo("faq"),
  };

  const promptSistema = montarPromptSistema({
    nomeEmpresa: cliente.nome_empresa,
    segmento: cliente.segmento ?? "",
    tomDeVoz: dados.tom_de_voz,
    horarioAtendimento: dados.horario_atendimento,
    produtosServicos: dados.produtos_servicos,
    faq: dados.faq,
    formasPagamento: dados.formas_pagamento,
    politicaTrocaCancelamento: dados.politica_troca_cancelamento,
    quandoTransferirHumano: dados.quando_transferir_humano,
  });

  await service
    .from("empresa_config")
    .upsert({ cliente_id: cliente.id, ...dados, prompt_sistema: promptSistema }, { onConflict: "cliente_id" });

  revalidatePath("/painel");
  revalidatePath("/painel/editar");
  redirect("/painel?sucesso=1");
}
