import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { montarPromptSistema } from "@/lib/ai";

const onboardingSchema = z.object({
  lead_id: z.string().uuid(),
  whatsapp_business_number: z.string().min(8),
  autorizou_meta: z.boolean(),
  produtos_servicos: z.string().optional(),
  faq: z.string().optional(),
  formas_pagamento: z.string().optional(),
  politica_troca_cancelamento: z.string().optional(),
  endereco_localizacao: z.string().optional(),
  como_funciona_atendimento: z.string().optional(),
  quando_transferir_humano: z.string().optional(),
  contato_equipe_humana: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, status, empresa, segmento, tom_de_voz, horario_atendimento")
    .eq("id", parsed.data.lead_id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  if (lead.status === "novo") {
    return NextResponse.json(
      { error: "Pagamento ainda não confirmado para este lead" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("onboarding_respostas").insert(parsed.data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("leads").update({ status: "implantado" }).eq("id", parsed.data.lead_id);

  // se o WhatsApp já foi conectado (Embedded Signup), monta e guarda o prompt do bot
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("lead_id", parsed.data.lead_id)
    .maybeSingle();

  if (cliente) {
    const promptSistema = montarPromptSistema({
      nomeEmpresa: lead.empresa,
      segmento: lead.segmento,
      tomDeVoz: lead.tom_de_voz,
      horarioAtendimento: lead.horario_atendimento,
      produtosServicos: parsed.data.produtos_servicos ?? null,
      faq: parsed.data.faq ?? null,
      formasPagamento: parsed.data.formas_pagamento ?? null,
      politicaTrocaCancelamento: parsed.data.politica_troca_cancelamento ?? null,
      quandoTransferirHumano: parsed.data.quando_transferir_humano ?? null,
    });

    await supabase
      .from("empresa_config")
      .upsert(
        {
          cliente_id: cliente.id,
          tom_de_voz: lead.tom_de_voz,
          horario_atendimento: lead.horario_atendimento,
          endereco_localizacao: parsed.data.endereco_localizacao ?? null,
          formas_pagamento: parsed.data.formas_pagamento ?? null,
          politica_troca_cancelamento: parsed.data.politica_troca_cancelamento ?? null,
          quando_transferir_humano: parsed.data.quando_transferir_humano ?? null,
          contato_equipe_humana: parsed.data.contato_equipe_humana ?? null,
          prompt_sistema: promptSistema,
        },
        { onConflict: "cliente_id" }
      );
  }

  return NextResponse.json({ ok: true });
}
