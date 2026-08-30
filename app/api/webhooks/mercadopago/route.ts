import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { buscarAssinatura, buscarPagamento } from "@/lib/mercadopago";

/** Mapeia o status bruto do Mercado Pago para o status do lead no funil. */
function statusAssinaturaParaLead(status: string): "pago" | "cancelado" | null {
  if (status === "authorized") return "pago";
  if (status === "cancelled" || status === "paused") return "cancelado";
  return null;
}

/**
 * Valida a assinatura do webhook do Mercado Pago (header x-signature).
 * Em produção, MERCADOPAGO_WEBHOOK_SECRET é obrigatório. Sem ele, o evento é
 * rejeitado (evita que qualquer pessoa forje uma notificação e libere um
 * pagamento/assinatura sem pagar de verdade). Em desenvolvimento local,
 * segue permissivo se a variável não estiver configurada.
 * https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
function assinaturaValida(request: Request, paymentId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

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

  const entityId: string | undefined =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? undefined;
  const type: string | undefined = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (!entityId || (type !== "payment" && type !== "subscription_preapproval")) {
    // outros tipos de evento (ex: merchant_order) são ignorados
    return NextResponse.json({ ok: true });
  }

  if (!assinaturaValida(request, entityId)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (type === "subscription_preapproval") {
    const assinatura = await buscarAssinatura(entityId);
    const leadId = assinatura.external_reference;
    const status = assinatura.status ?? "unknown";
    const valor = assinatura.auto_recurring?.transaction_amount ?? null;

    await supabase.from("assinaturas").upsert(
      {
        mp_preapproval_id: String(entityId),
        lead_id: leadId ?? null,
        status,
        valor,
        raw_payload: assinatura as any,
      },
      { onConflict: "mp_preapproval_id" }
    );

    const novoStatusLead = statusAssinaturaParaLead(status);
    if (leadId && novoStatusLead) {
      await supabase.from("leads").update({ status: novoStatusLead }).eq("id", leadId);
    }

    return NextResponse.json({ ok: true });
  }

  const pagamento = await buscarPagamento(entityId);
  const leadId = pagamento.external_reference;
  const status = pagamento.status ?? "unknown";
  const valor = pagamento.transaction_amount ?? null;

  await supabase
    .from("pagamentos")
    .upsert(
      {
        mp_payment_id: String(entityId),
        lead_id: leadId ?? null,
        status,
        valor,
        raw_payload: pagamento as any,
      },
      { onConflict: "mp_payment_id" }
    );

  if (leadId && status === "approved") {
    await supabase
      .from("leads")
      .update({ status: "pago", mp_payment_id: String(entityId) })
      .eq("id", leadId);
  }

  return NextResponse.json({ ok: true });
}

// O Mercado Pago pode chamar via GET em alguns fluxos legados de IPN.
export async function GET(request: Request) {
  return POST(request);
}
