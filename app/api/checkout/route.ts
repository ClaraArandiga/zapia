import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { criarAssinatura } from "@/lib/mercadopago";

const checkoutSchema = z.object({
  leadId: z.string().uuid(),
  termosAceitos: z.literal(true, {
    errorMap: () => ({ message: "É preciso aceitar os Termos de Uso" }),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos ou termos não aceitos" }, { status: 400 });
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
    .update({ termos_aceitos_em: new Date().toISOString() })
    .eq("id", lead.id);

  const preco = Number(process.env.NEXT_PUBLIC_OFERTA_PRECO ?? "47.00");

  const { initPoint } = await criarAssinatura({
    leadId: lead.id,
    titulo: `ZapIA para ${lead.empresa}`,
    preco,
    payerEmail: lead.email,
  });

  return NextResponse.json({ initPoint });
}
