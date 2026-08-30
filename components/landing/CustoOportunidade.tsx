import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function CustoOportunidade() {
  return (
    <Section className="border-t border-white/5">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Quanto custa uma venda que você não respondeu?
        </h2>
        <p className="mt-6 text-white/70">
          Imagine que apenas <strong className="text-white">uma pessoa por mês</strong> deixe de
          comprar porque demorou demais para receber uma resposta.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent p-8 text-center">
        <p className="text-white/70">Agora compare isso com:</p>
        <p className="mt-4 text-5xl font-bold text-white">
          47<span className="text-lg font-normal text-white/50">/mês</span>
        </p>
        <p className="mt-6 text-white/60">
          Menos de <strong className="text-white">R$1,60 por dia</strong> para ter um atendente
          digital trabalhando no seu WhatsApp 24 horas por dia.
        </p>
        <p className="mt-6 font-semibold text-white">
          Se ele recuperar uma única venda que seria perdida, pode praticamente se pagar.
        </p>
        <ButtonLink href="/lead" className="mt-8 w-full">
          Quero meu atendente de IA →
        </ButtonLink>
      </div>
    </Section>
  );
}
