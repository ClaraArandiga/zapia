import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { buscarPagamento } from "@/lib/mercadopago";

/**
 * Valida a assinatura do webhook do Mercado Pago (header x-signature).
 * Só é aplicada se MERCADOPAGO_WEBHOOK_SECRET estiver configurado. Sem ele,
 * o evento é processado sem validação (útil em desenvolvimento local).
 * https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
function assinaturaValida(request: Request, paymentId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v1));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // notificações antigas (IPN) chegam só via query string
  }

  const paymentId: string | undefined =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? undefined;
  const type: string | undefined = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (type !== "payment" || !paymentId) {
    // outros tipos de evento (ex: merchant_order) são ignorados
    return NextResponse.json({ ok: true });
  }

  if (!assinaturaValida(request, paymentId)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const pagamento = await buscarPagamento(paymentId);
  const leadId = pagamento.external_reference;
  const status = pagamento.status ?? "unknown";
  const valor = pagamento.transaction_amount ?? null;
  const preferenceId = (pagamento as any).order?.id ?? null;

  const supabase = getSupabaseServiceClient();

  await supabase
    .from("pagamentos")
    .upsert(
      {
        mp_payment_id: String(paymentId),
        lead_id: leadId ?? null,
        mp_preference_id: preferenceId,
        status,
        valor,
        raw_payload: pagamento as any,
      },
      { onConflict: "mp_payment_id" }
    );

  if (leadId && status === "approved") {
    await supabase
      .from("leads")
      .update({ status: "pago", mp_payment_id: String(paymentId) })
      .eq("id", leadId);
  }

  return NextResponse.json({ ok: true });
}

// O Mercado Pago pode chamar via GET em alguns fluxos legados de IPN.
export async function GET(request: Request) {
  return POST(request);
}
