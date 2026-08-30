import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <Section className="border-t border-white/5 text-center">
      <p className="mx-auto max-w-lg text-lg text-white/70">
        Seu próximo cliente pode estar mandando mensagem agora.
      </p>
      <p className="mx-auto mt-2 max-w-lg text-white/60">E ele não sabe que você está ocupado.</p>
      <p className="mx-auto mt-1 max-w-lg font-semibold text-white">
        Ele só sabe que ninguém respondeu.
      </p>
      <p className="mx-auto mt-6 max-w-lg text-white/60">
        Não deixe uma venda depender de alguém estar online.
      </p>
      <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Coloque seu WhatsApp para trabalhar 24 horas por dia.
      </h2>
      <div className="mt-8">
        <ButtonLink href="/lead">Quero parar de perder vendas →</ButtonLink>
      </div>
      <p className="mt-5 text-sm text-white/50">47/mês • 7 dias de garantia • Cancele quando quiser</p>
    </Section>
  );
}
