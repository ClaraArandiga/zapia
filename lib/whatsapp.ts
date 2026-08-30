import crypto from "crypto";

/** Envia uma mensagem de texto pelo WhatsApp Cloud API usando o token do cliente. */
export async function enviarMensagemWhatsapp(params: {
  phoneNumberId: string;
  accessToken: string;
  para: string;
  texto: string;
}) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${params.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.para,
      type: "text",
      text: { body: params.texto },
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`WhatsApp respondeu ${res.status}: ${erro}`);
  }

  return res.json();
}

/**
 * Troca um token de usuário (de curta duração, ou um de longa duração perto de
 * expirar) por um novo token de longa duração (~60 dias). Usado tanto na
 * conexão inicial (Embedded Signup, ver app/api/whatsapp/conectar) quanto na
 * renovação periódica (app/api/cron/renovar-tokens).
 */
export async function trocarPorTokenLongaDuracao(tokenAtual: string) {
  const appId = process.env.NEXT_PUBLIC_WHATSAPP_APP_ID;
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("WhatsApp App ID/Secret não configurados");
  }

  const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", tokenAtual);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao trocar por token de longa duração: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const accessToken: string | undefined = data.access_token;
  const expiresInSegundos: number | undefined = data.expires_in;

  if (!accessToken) {
    throw new Error("Meta não retornou access_token na troca");
  }

  return {
    accessToken,
    expiraEm: expiresInSegundos ? new Date(Date.now() + expiresInSegundos * 1000).toISOString() : null,
  };
}

const TAMANHO_MAXIMO_MIDIA = 15 * 1024 * 1024; // 15MB, margem confortável abaixo do limite do Gemini

/** Baixa uma imagem/áudio recebido no WhatsApp e retorna pronto para enviar à IA. */
export async function baixarMidiaWhatsapp(
  mediaId: string,
  accessToken: string
): Promise<{ mimeType: string; dadosBase64: string }> {
  const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) {
    throw new Error(`Erro ao buscar metadados da mídia: ${metaRes.status}`);
  }
  const meta = await metaRes.json();

  if (meta.file_size && meta.file_size > TAMANHO_MAXIMO_MIDIA) {
    throw new Error(`Mídia grande demais (${meta.file_size} bytes)`);
  }

  const arquivoRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!arquivoRes.ok) {
    throw new Error(`Erro ao baixar arquivo de mídia: ${arquivoRes.status}`);
  }

  const buffer = await arquivoRes.arrayBuffer();
  if (buffer.byteLength > TAMANHO_MAXIMO_MIDIA) {
    throw new Error(`Mídia grande demais (${buffer.byteLength} bytes)`);
  }

  return {
    // a Meta manda "audio/ogg; codecs=opus"; o Gemini só quer o tipo base
    mimeType: String(meta.mime_type ?? "application/octet-stream").split(";")[0].trim(),
    dadosBase64: Buffer.from(buffer).toString("base64"),
  };
}

/**
 * Valida o header X-Hub-Signature-256 do webhook da Meta usando o segredo do
 * App (WHATSAPP_APP_SECRET). Em produção é obrigatório. Sem ele, o evento é
 * rejeitado (evita que qualquer pessoa forje uma notificação e gaste sua cota
 * de IA ou mande mensagens em nome dos seus clientes). Em desenvolvimento
 * local, segue permissivo se a variável não estiver configurada.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validating-payloads
 */
export function assinaturaWhatsappValida(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader) return false;

  const esperado = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (esperado.length !== signatureHeader.length) return false;

  return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(signatureHeader));
}
