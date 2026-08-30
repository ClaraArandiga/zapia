import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Section } from "@/components/ui/Section";

export function Offer() {
  return (
    <Section id="oferta" className="border-t border-white/5">
      <div className="mx-auto max-w-xl rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent p-10 text-center">
        <Eyebrow>Oferta</Eyebrow>
        <h2 className="text-3xl font-bold text-white">Seu próprio atendente de IA no WhatsApp</h2>
        <p className="mt-4 text-white/70">
          Configuramos uma IA personalizada com as informações da sua empresa para atender seus
          clientes automaticamente.
        </p>
        <p className="mt-8 text-5xl font-bold text-white">
          R$ 47<span className="text-lg font-normal text-white/50">/mês</span>
        </p>
        <p className="mt-2 text-sm text-white/50">Cancele quando quiser.</p>
        <ButtonLink href="/lead" className="mt-8 w-full">
          Quero meu atendente de IA →
        </ButtonLink>
      </div>
    </Section>
  );
}
