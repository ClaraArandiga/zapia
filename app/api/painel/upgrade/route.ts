import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { cancelarAssinatura, criarAssinatura } from "@/lib/stripe";

const PRECOS: Record<string, number> = { upsell: 74, downsell: 54 };
const TITULOS: Record<string, string> = {
  upsell: "ZapIA + Atualização e Relatório",
  downsell: "ZapIA + Relatório Semanal",
};

// Mesma chave de emergência do /api/checkout. Reverte com PAGAMENTO_HABILITADO=true na Vercel.
const PAGAMENTO_HABILITADO = process.env.PAGAMENTO_HABILITADO === "true";

const upgradeSchema = z.object({
  plano: z.enum(["upsell", "downsell"]),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = upgradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "plano inválido" }, { status: 400 });
  }

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, lead_id, nome_empresa")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json({ error: "cliente não encontrado" }, { status: 404 });
  }

  const { data: lead } = await service
    .from("leads")
    .select("email, empresa")
    .eq("id", cliente.lead_id)
    .single();

  if (!lead?.email) {
    return NextResponse.json({ error: "cadastro sem e-mail para a assinatura" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!PAGAMENTO_HABILITADO) {
    await service.from("leads").update({ plano_contratado: parsed.data.plano }).eq("id", cliente.lead_id);
    await service.from("assinaturas").upsert(
      {
        lead_id: cliente.lead_id,
        gateway_subscription_id: `sem-pagamento-${cliente.lead_id}`,
        status: "active",
        valor: PRECOS[parsed.data.plano],
      },
      { onConflict: "gateway_subscription_id" }
    );

    return NextResponse.json({ initPoint: `${siteUrl}/painel?sucesso=upgrade` });
  }

  // cancela a assinatura atual, se houver uma ativa/pendente, antes de criar a nova
  const { data: assinaturaAtual } = await service
    .from("assinaturas")
    .select("gateway_subscription_id, status")
    .eq("lead_id", cliente.lead_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assinaturaAtual && ["active", "trialing", "past_due"].includes(assinaturaAtual.status)) {
    try {
      await cancelarAssinatura(assinaturaAtual.gateway_subscription_id);
    } catch (err) {
      console.error("Erro ao cancelar assinatura anterior no upgrade:", err);
    }
  }

  const { initPoint } = await criarAssinatura({
    leadId: cliente.lead_id,
    titulo: `${TITULOS[parsed.data.plano]} para ${lead.empresa}`,
    preco: PRECOS[parsed.data.plano],
    payerEmail: lead.email,
    backUrl: `${siteUrl}/painel?sucesso=upgrade`,
  });

  await service.from("leads").update({ plano_contratado: parsed.data.plano }).eq("id", cliente.lead_id);

  return NextResponse.json({ initPoint });
}
