import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

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
 * Cria uma preferência de checkout (Checkout Pro) para um lead específico.
 * Retorna a URL (init_point) para redirecionar o cliente ao pagamento hospedado
 * pelo Mercado Pago.
 */
export async function criarPreferenciaCheckout(params: {
  leadId: string;
  titulo: string;
  preco: number;
}) {
  const client = getClient();
  const preference = new Preference(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // O Mercado Pago exige que back_urls.success seja uma URL pública para usar
  // auto_return; em localhost ele rejeita a preferência, então desativamos
  // auto_return nesse caso (o resto do fluxo funciona normalmente).
  const isPublicUrl = !siteUrl.includes("localhost");

  const result = await preference.create({
    body: {
      items: [
        {
          id: "atendente-ia-whatsapp",
          title: params.titulo,
          quantity: 1,
          unit_price: params.preco,
          currency_id: "BRL",
        },
      ],
      external_reference: params.leadId,
      back_urls: {
        success: `${siteUrl}/obrigado?lead=${params.leadId}`,
        pending: `${siteUrl}/obrigado?lead=${params.leadId}&status=pending`,
        failure: `${siteUrl}/checkout?lead=${params.leadId}&status=failure`,
      },
      ...(isPublicUrl ? { auto_return: "approved" as const } : {}),
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    },
  });

  return {
    preferenceId: result.id as string,
    initPoint: result.init_point as string,
  };
}

/** Busca um pagamento pelo id (usado no webhook, para confirmar o evento). */
export async function buscarPagamento(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
