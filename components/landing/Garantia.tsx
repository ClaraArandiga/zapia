import { Eyebrow, Section } from "@/components/ui/Section";
import { ConfiancaBadges } from "@/components/ui/ConfiancaBadges";

export function Garantia() {
  return (
    <Section className="border-t border-white/5">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Garantia</Eyebrow>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Teste sem assumir o risco.
        </h2>
        <p className="mt-6 text-white/70">
          Você tem <strong className="text-white">7 dias para experimentar o ZapIA</strong>.
        </p>
        <p className="mt-4 text-white/70">
          Se você decidir que não é para você, basta solicitar o cancelamento dentro do prazo.
        </p>
        <p className="mt-4 text-lg font-semibold text-white">
          Você recebe 100% do seu dinheiro de volta.
        </p>
        <p className="mt-2 text-white/60">Sem burocracia.</p>
      </div>
      <div className="mt-10">
        <ConfiancaBadges />
      </div>
    </Section>
  );
}
