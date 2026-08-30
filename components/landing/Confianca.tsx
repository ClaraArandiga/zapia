import { Eyebrow, Section } from "@/components/ui/Section";
import { ConfiancaBadges } from "@/components/ui/ConfiancaBadges";

export function Confianca() {
  return (
    <Section className="border-t border-white/5">
      <div className="text-center">
        <Eyebrow>Compre com confiança</Eyebrow>
        <h2 className="mx-auto max-w-xl text-3xl font-bold text-white sm:text-4xl">
          Sem risco pra você
        </h2>
      </div>
      <div className="mt-10">
        <ConfiancaBadges />
      </div>
    </Section>
  );
}
