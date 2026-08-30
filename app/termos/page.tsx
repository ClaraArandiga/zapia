import { Footer } from "@/components/ui/Footer";

const secaoClass = "mt-8";
const tituloClass = "text-lg font-semibold text-white";
const paragrafoClass = "mt-2 text-sm leading-relaxed text-white/70";

export default function TermosPage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
        <p className="mt-3 text-sm text-white/50">Última atualização: agosto de 2026.</p>

        <section className={secaoClass}>
          <h2 className={tituloClass}>1. O que é o ZapIA</h2>
          <p className={paragrafoClass}>
            O ZapIA é um serviço de assinatura mensal que conecta um assistente de inteligência
            artificial ao WhatsApp Business da sua empresa, respondendo seus clientes finais com
            base nas informações que você mesma fornece (produtos, preços, políticas, horários
            etc.).
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>2. Sua responsabilidade pelas informações fornecidas</h2>
          <p className={paragrafoClass}>
            A IA responde exclusivamente com base no que você cadastra no formulário de implantação
            e no painel. Você é responsável por manter essas informações corretas e atualizadas
            (preços, prazos, políticas de troca etc.). O ZapIA não verifica a veracidade do
            conteúdo fornecido.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>3. Limitações da inteligência artificial</h2>
          <p className={paragrafoClass}>
            Você reconhece e aceita que respostas geradas por inteligência artificial podem
            eventualmente conter erros, imprecisões ou interpretações incorretas ("alucinações"),
            mesmo quando as informações fornecidas estão corretas. O ZapIA se esforça para reduzir
            esse risco (o assistente é instruído a responder só com base no que foi informado e a
            transferir para um humano quando não tiver certeza), mas não garante que 100% das
            respostas serão precisas o tempo todo.
          </p>
          <p className={paragrafoClass}>
            Você é responsável por supervisionar o atendimento prestado pelo assistente,
            especialmente em decisões sensíveis (valores, prazos legais, questões de saúde ou
            segurança), e por corrigir rapidamente qualquer informação errada identificada.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>4. Limitação de responsabilidade</h2>
          <p className={paragrafoClass}>
            Na máxima extensão permitida pela lei, o ZapIA não se responsabiliza por danos
            indiretos, lucros cessantes, perda de clientes ou vendas decorrentes de respostas dadas
            pelo assistente virtual, inclusive quando baseadas em informações fornecidas por você.
            Quando aplicável, a responsabilidade total do ZapIA por qualquer reclamação relacionada
            ao serviço fica limitada ao valor pago por você nos últimos 3 (três) meses de
            assinatura.
          </p>
          <p className={paragrafoClass}>
            Nada nestes Termos exclui direitos garantidos pelo Código de Defesa do Consumidor que
            não possam ser limitados por contrato.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>5. Disponibilidade do serviço</h2>
          <p className={paragrafoClass}>
            O ZapIA depende de serviços de terceiros (Meta/WhatsApp, provedor de inteligência
            artificial, Mercado Pago, infraestrutura de nuvem). Não garantimos disponibilidade
            ininterrupta e não nos responsabilizamos por indisponibilidade causada por esses
            terceiros.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>6. Assinatura e cancelamento</h2>
          <p className={paragrafoClass}>
            O ZapIA é cobrado como assinatura mensal recorrente (R$47/mês, salvo alteração
            comunicada previamente) via Mercado Pago. Você pode cancelar quando quiser diretamente
            no Mercado Pago; o acesso permanece ativo até o fim do período já pago.
          </p>
          <p className={paragrafoClass}>
            Garantia de 7 dias: se você não ficar satisfeita nos primeiros 7 dias após a primeira
            cobrança, devolvemos o valor pago. É só entrar em contato pelo canal abaixo.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>7. Uso aceitável</h2>
          <p className={paragrafoClass}>
            Você concorda em não usar o ZapIA para fins ilegais, para enviar spam, conteúdo
            enganoso, discurso de ódio, ou qualquer uso que viole os termos da própria Meta/WhatsApp
            para contas comerciais. O descumprimento pode levar à suspensão do serviço.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>8. Dados e privacidade</h2>
          <p className={paragrafoClass}>
            Coletamos os dados necessários para operar o serviço (seus dados de cadastro,
            conversas do seu assistente com clientes finais, dados de pagamento processados pelo
            Mercado Pago). Não vendemos esses dados a terceiros. Você pode solicitar a exclusão dos
            seus dados a qualquer momento pelo contato abaixo, nos termos da Lei Geral de Proteção
            de Dados (LGPD).
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>9. Alterações</h2>
          <p className={paragrafoClass}>
            Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas
            pelo e-mail cadastrado ou pelo WhatsApp de contato informado no cadastro.
          </p>
        </section>

        <section className={secaoClass}>
          <h2 className={tituloClass}>10. Contato</h2>
          <p className={paragrafoClass}>
            Dúvidas sobre estes Termos:{" "}
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
