import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { trocarPorTokenLongaDuracao } from "@/lib/whatsapp";

const conectarSchema = z.object({
  leadId: z.string().uuid(),
  code: z.string().min(1),
  phoneNumberId: z.string().min(1),
  wabaId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = conectarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_WHATSAPP_APP_ID;
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "Conexão com WhatsApp não configurada no servidor" },
      { status: 500 }
    );
  }

  const { leadId, code, phoneNumberId, wabaId } = parsed.data;

  // troca o código de autorização do Embedded Signup por um access token
  const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl);
  if (!tokenRes.ok) {
    console.error("Erro ao trocar código por token:", await tokenRes.text());
    return NextResponse.json(
      { error: "Não foi possível confirmar a conexão com a Meta" },
      { status: 502 }
    );
  }

  const tokenData = await tokenRes.json();
  const accessTokenCurto: string | undefined = tokenData.access_token;

  if (!accessTokenCurto) {
    return NextResponse.json(
      { error: "Não foi possível confirmar a conexão com a Meta" },
      { status: 502 }
    );
  }

  // troca imediatamente por um token de longa duração (~60 dias), pra não
  // precisar reconectar toda hora; a renovação automática cuida do resto
  let accessToken = accessTokenCurto;
  let tokenExpiraEm: string | null = null;

  try {
    const longaDuracao = await trocarPorTokenLongaDuracao(accessTokenCurto);
    accessToken = longaDuracao.accessToken;
    tokenExpiraEm = longaDuracao.expiraEm;
  } catch (err) {
    console.error("Erro ao trocar por token de longa duração, usando o de curta duração:", err);
  }

  // inscreve o app no webhook desse WhatsApp Business Account, senão a Meta
  // não manda as mensagens desse número para app/api/webhooks/whatsapp
  const subRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!subRes.ok) {
    console.error("Erro ao inscrever o app no WABA:", await subRes.text());
    // segue mesmo assim: a autorização foi concluída, mas fica registrado pra investigar
  }

  const supabase = getSupabaseServiceClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("empresa, segmento")
    .eq("id", leadId)
    .single();

  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  const dadosCliente = {
    lead_id: leadId,
    nome_empresa: lead?.empresa ?? "Empresa",
    segmento: lead?.segmento ?? null,
    whatsapp_phone_number_id: phoneNumberId,
    whatsapp_business_account_id: wabaId,
    whatsapp_access_token: accessToken,
    token_expira_em: tokenExpiraEm,
    ativo: true,
  };

  if (clienteExistente) {
    await supabase.from("clientes").update(dadosCliente).eq("id", clienteExistente.id);
  } else {
    await supabase.from("clientes").insert(dadosCliente);
  }

  return NextResponse.json({ ok: true });
}
