import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { criarSessaoPortal } from "@/lib/stripe";

export async function POST() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, lead_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json({ error: "cliente não encontrado" }, { status: 404 });
  }

  const { data: assinatura } = await service
    .from("assinaturas")
    .select("gateway_customer_id")
    .eq("lead_id", cliente.lead_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assinatura?.gateway_customer_id) {
    return NextResponse.json(
      { error: "Nenhuma assinatura encontrada pra gerenciar ainda." },
      { status: 404 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = await criarSessaoPortal(assinatura.gateway_customer_id, `${siteUrl}/painel`);

  return NextResponse.json({ url });
}
