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
 * Valida o header X-Hub-Signature-256 do webhook da Meta usando o segredo do
 * App (WHATSAPP_APP_SECRET). Só é aplicada se a variável estiver configurada,
 * útil em desenvolvimento local.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validating-payloads
 */
export function assinaturaWhatsappValida(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!signatureHeader) return false;

  const esperado = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (esperado.length !== signatureHeader.length) return false;

  return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(signatureHeader));
}
