import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <Section className="border-t border-white/5 text-center">
      <p className="mx-auto max-w-lg text-sm font-semibold uppercase tracking-widest text-red-400">
        Cada mensagem sem resposta pode ser uma venda perdida
      </p>
      <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Quero automatizar meu WhatsApp
      </h2>
      <div className="mt-8">
        <ButtonLink href="/lead">Quero minha IA no WhatsApp →</ButtonLink>
      </div>
    </Section>
  );
}
