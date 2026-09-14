import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase";

/** Mapeia o status bruto da assinatura na Stripe para o status do lead no funil. */
function statusAssinaturaParaLead(status: Stripe.Subscription.Status): "pago" | "cancelado" | null {
  if (status === "active" || status === "trialing") return "pago";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") return "cancelado";
  return null;
}

async function upsertAssinatura(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  subscription: Stripe.Subscription,
  leadId: string | null
) {
  const valor = subscription.items.data[0]?.price?.unit_amount;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  await supabase.from("assinaturas").upsert(
    {
      gateway_subscription_id: subscription.id,
      gateway_customer_id: customerId,
      lead_id: leadId,
      status: subscription.status,
      valor: valor != null ? valor / 100 : null,
      raw_payload: subscription as any,
    },
    { onConflict: "gateway_subscription_id" }
  );

  const novoStatusLead = statusAssinaturaParaLead(subscription.status);
  if (leadId && novoStatusLead) {
    await supabase.from("leads").update({ status: novoStatusLead }).eq("id", leadId);
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  let event: Stripe.Event;

  if (secret) {
    if (!signature) {
      return NextResponse.json({ error: "assinatura ausente" }, { status: 401 });
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      console.error("Erro ao validar assinatura do webhook da Stripe:", err);
      return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // em produção, STRIPE_WEBHOOK_SECRET é obrigatório (evita eventos forjados liberando acesso sem pagar)
    return NextResponse.json({ error: "webhook não configurado" }, { status: 401 });
  } else {
    event = JSON.parse(rawBody);
  }

  const supabase = getSupabaseServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertAssinatura(supabase, subscription, session.client_reference_id);
    }
    return NextResponse.json({ ok: true });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const leadId = subscription.metadata?.leadId ?? null;
    await upsertAssinatura(supabase, subscription, leadId);
    return NextResponse.json({ ok: true });
  }

  // outros eventos (invoice.paid, payment_method.attached etc.) não afetam o status do lead
  return NextResponse.json({ ok: true });
}
