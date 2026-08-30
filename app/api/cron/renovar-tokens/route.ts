import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { trocarPorTokenLongaDuracao } from "@/lib/whatsapp";

const DIAS_ANTES_DE_RENOVAR = 7;

/**
 * Renova o token de WhatsApp de clientes cujo token está perto de expirar.
 * Chamada diariamente pelo Vercel Cron (ver vercel.json), protegida pelo
 * header Authorization com CRON_SECRET.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const limite = new Date(Date.now() + DIAS_ANTES_DE_RENOVAR * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseServiceClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, whatsapp_access_token, token_expira_em")
    .eq("ativo", true)
    .not("whatsapp_access_token", "is", null)
    .not("token_expira_em", "is", null)
    .lte("token_expira_em", limite);

  const resultados: { clienteId: string; ok: boolean }[] = [];

  for (const cliente of clientes ?? []) {
    try {
      const { accessToken, expiraEm } = await trocarPorTokenLongaDuracao(cliente.whatsapp_access_token);
      await supabase
        .from("clientes")
        .update({ whatsapp_access_token: accessToken, token_expira_em: expiraEm })
        .eq("id", cliente.id);
      resultados.push({ clienteId: cliente.id, ok: true });
    } catch (err) {
      console.error(`Erro ao renovar token do cliente ${cliente.id}:`, err);
      resultados.push({ clienteId: cliente.id, ok: false });
    }
  }

  return NextResponse.json({ renovados: resultados.length, resultados });
}
