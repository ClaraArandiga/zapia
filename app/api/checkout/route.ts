import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { criarAssinatura } from "@/lib/mercadopago";

const checkoutSchema = z.object({
  leadId: z.string().uuid(),
  termosAceitos: z.literal(true, {
    errorMap: () => ({ message: "É preciso aceitar os Termos de Uso" }),
  }),
  politicaAceita: z.literal(true, {
    errorMap: () => ({ message: "É preciso aceitar a Política de Privacidade" }),
  }),
  plano: z.enum(["base", "upsell", "downsell"]).default("base"),
});

// Fonte da verdade dos preços fica no servidor. Nunca confiar num valor vindo do cliente.
const PRECOS: Record<string, number> = { base: 47, upsell: 74, downsell: 54 };

const TITULOS: Record<string, string> = {
  base: "ZapIA",
  upsell: "ZapIA + Atualização e Relatório",
  downsell: "ZapIA + Relatório Semanal",
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos ou termos/política não aceitos" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, empresa, email")
    .eq("id", parsed.data.leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  if (!lead.email) {
    return NextResponse.json(
      { error: "Este cadastro não tem e-mail, necessário para criar a assinatura" },
      { status: 400 }
    );
  }

  await supabase
    .from("leads")
    .update({
      termos_aceitos_em: new Date().toISOString(),
      politica_privacidade_aceita_em: new Date().toISOString(),
      plano_contratado: parsed.data.plano,
    })
    .eq("id", lead.id);

  const preco = PRECOS[parsed.data.plano];

  const { initPoint } = await criarAssinatura({
    leadId: lead.id,
    titulo: `${TITULOS[parsed.data.plano]} para ${lead.empresa}`,
    preco,
    payerEmail: lead.email,
  });

  return NextResponse.json({ initPoint });
}
