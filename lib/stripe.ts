import Stripe from "stripe";

function getClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe não configurado: defina STRIPE_SECRET_KEY em .env.local");
  }

  return new Stripe(secretKey);
}

/**
 * Cria uma assinatura mensal recorrente via Stripe Checkout.
 * Retorna a URL da página de pagamento hospedada pela Stripe, pra onde o
 * cliente é redirecionado pra confirmar o cartão.
 *
 * O preço é montado na hora (price_data), sem precisar cadastrar Produtos
 * fixos no painel da Stripe: cada plano (base/upsell/downsell) tem valor
 * diferente, então isso evita ficar mantendo 3 Prices sincronizados lá.
 */
export async function criarAssinatura(params: {
  leadId: string;
  titulo: string;
  preco: number;
  payerEmail: string;
  backUrl?: string;
}) {
  const stripe = getClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.payerEmail,
    client_reference_id: params.leadId,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: params.titulo },
          unit_amount: Math.round(params.preco * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: { leadId: params.leadId },
    },
    success_url: params.backUrl ?? `${siteUrl}/obrigado?lead=${params.leadId}`,
    cancel_url: `${siteUrl}/checkout?lead=${params.leadId}&status=failure`,
  });

  return { initPoint: session.url as string };
}

/** Busca uma assinatura pelo id (usado no webhook, para confirmar o evento). */
export async function buscarAssinatura(subscriptionId: string) {
  const stripe = getClient();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/** Cancela uma assinatura (usado ao trocar de plano: cancela a antiga antes de criar a nova). */
export async function cancelarAssinatura(subscriptionId: string) {
  const stripe = getClient();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Cria uma sessão do Portal de Cobrança da Stripe, onde o próprio cliente
 * consegue ver, cancelar ou atualizar a forma de pagamento da assinatura dele,
 * sem precisar falar com a gente.
 */
export async function criarSessaoPortal(customerId: string, returnUrl: string) {
  const stripe = getClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
