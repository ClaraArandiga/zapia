import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";

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
    .select("id, status")
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

  return NextResponse.json({ ok: true });
}
