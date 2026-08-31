import { Footer } from "@/components/ui/Footer";

const secaoClass = "mt-8";
const tituloClass = "text-lg font-semibold text-white";
const paragrafoClass = "mt-2 text-sm leading-relaxed text-white/70";

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-white/50">Última atualização: agosto de 2026.</p>

        <section className={secaoClass}>
          <h2 className={tituloClass}>1. Quais dados coletamos</h2>
          <p className={paragrafoClass}>
            Coletamos os dados que você fornece no cadastro e na implantação (nome, empresa,
            e-mail, WhatsApp de contato, informações do seu negócio), os dados de pagamento
            processados pelo Mercado Pago, e o conteúdo das conversas trocadas entre seu
            assistente de IA e seus clientes finais no WhatsApp, necessário para o funcionamento
            do serviço.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>2. Para que usamos esses dados</h2>
          <p className={paragrafoClass}>
            Usamos seus dados para operar o assistente de IA, processar sua assinatura, dar
            suporte, cumprir obrigações legais e melhorar o serviço. Não usamos os dados das
            conversas dos seus clientes finais para nenhuma outra finalidade além de fazer o
            assistente funcionar.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>3. Com quem compartilhamos</h2>
          <p className={paragrafoClass}>
            Compartilhamos dados apenas com os provedores necessários para operar o serviço:
            Meta/WhatsApp (envio e recebimento de mensagens), o provedor de inteligência
            artificial que gera as respostas, Mercado Pago (processamento de pagamento) e nossa
            infraestrutura de hospedagem e banco de dados. Não vendemos seus dados nem os dados
            dos seus clientes finais a terceiros.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>4. Por quanto tempo guardamos</h2>
          <p className={paragrafoClass}>
            Guardamos seus dados enquanto sua conta estiver ativa e pelo tempo necessário para
            cumprir obrigações legais e fiscais depois disso. Você pode pedir a exclusão a
            qualquer momento, conforme o item 6 abaixo.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>5. Segurança</h2>
          <p className={paragrafoClass}>
            Adotamos medidas técnicas razoáveis para proteger seus dados, como controle de acesso
            e criptografia em trânsito. Nenhum sistema é 100% livre de risco, e nos comprometemos
            a te avisar em caso de incidente que afete seus dados pessoais.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>6. Seus direitos (LGPD)</h2>
          <p className={paragrafoClass}>
            Nos termos da Lei Geral de Proteção de Dados, você pode solicitar a qualquer momento a
            confirmação, o acesso, a correção ou a exclusão dos seus dados pessoais, além de
            informações sobre com quem eles são compartilhados. É só entrar em contato pelo canal
            abaixo.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>7. Alterações</h2>
          <p className={paragrafoClass}>
            Podemos atualizar esta Política periodicamente. Mudanças relevantes serão comunicadas
            pelo e-mail cadastrado ou pelo WhatsApp de contato informado no cadastro.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>8. Contato</h2>
          <p className={paragrafoClass}>
            Dúvidas sobre esta Política ou pedidos relacionados aos seus dados:{" "}
            <a href="mailto:zapia.contato@gmail.com" className="text-brand-400 hover:underline">
              zapia.contato@gmail.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
