import { Section } from "@/components/ui/Section";

export function Contato() {
  return (
    <Section className="border-t border-white/5 text-center">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">Ainda com dúvidas?</h2>
      <p className="mt-4 text-white/60">Entre em contato com nossa equipe:</p>
      <a
        href="mailto:zapia.contato@gmail.com"
        className="mt-3 inline-block text-lg font-semibold text-brand-400 hover:underline"
      >
        zapia.contato@gmail.com
      </a>
    </Section>
  );
}
