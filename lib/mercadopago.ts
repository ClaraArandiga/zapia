import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Mercado Pago não configurado: defina MERCADOPAGO_ACCESS_TOKEN em .env.local"
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

/**
 * Cria uma assinatura (Preapproval) para cobrança mensal recorrente.
 * Retorna a URL (init_point) para o cliente autorizar o pagamento recorrente
 * numa página hospedada pelo Mercado Pago.
 *
 * Importante: diferente da Preference, o Preapproval não aceita
 * notification_url por requisição. O webhook precisa estar configurado no
 * painel do Mercado Pago (Developers > sua aplicação > Webhooks), assinando
 * os tópicos "Assinaturas" (subscription_preapproval) e "Pagamentos".
 */
export async function criarAssinatura(params: {
  leadId: string;
  titulo: string;
  preco: number;
  payerEmail: string;
  backUrl?: string;
}) {
  const client = getClient();
  const preapproval = new PreApproval(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const result = await preapproval.create({
    body: {
      reason: params.titulo,
      external_reference: params.leadId,
      payer_email: params.payerEmail,
      back_url: params.backUrl ?? `${siteUrl}/obrigado?lead=${params.leadId}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: params.preco,
        currency_id: "BRL",
      },
    },
  });

  return {
    preapprovalId: result.id as string,
    initPoint: result.init_point as string,
  };
}

/** Busca uma assinatura pelo id (usado no webhook, para confirmar o evento). */
export async function buscarAssinatura(preapprovalId: string) {
  const client = getClient();
  const preapproval = new PreApproval(client);
  return preapproval.get({ id: preapprovalId });
}

/** Cancela uma assinatura (usado ao trocar de plano: cancela a antiga antes de criar a nova). */
export async function cancelarAssinatura(preapprovalId: string) {
  const client = getClient();
  const preapproval = new PreApproval(client);
  return preapproval.update({ id: preapprovalId, body: { status: "cancelled" } });
}

/** Busca um pagamento pelo id (usado no webhook, para confirmar o evento). */
export async function buscarPagamento(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
