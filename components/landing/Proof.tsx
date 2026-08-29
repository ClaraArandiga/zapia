import { Eyebrow, Section } from "@/components/ui/Section";

const numeros = [
  { valor: "24h", label: "de atendimento sem pausa" },
  { valor: "< 5s", label: "tempo médio de resposta" },
  { valor: "100%", label: "das dúvidas frequentes cobertas" },
];

export function Proof() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Resultados</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        O que muda no seu atendimento
      </h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {numeros.map((n) => (
          <div key={n.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-4xl font-bold text-brand-400">{n.valor}</p>
            <p className="mt-2 text-sm text-white/60">{n.label}</p>
          </div>
        ))}
      </div>

      <blockquote className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/80">
        &ldquo;Antes eu perdia venda porque respondia o WhatsApp só depois do expediente. Hoje o
        atendimento acontece na hora, mesmo de madrugada.&rdquo;
        <footer className="mt-4 text-sm text-white/50">Dono de loja, cliente do produto</footer>
      </blockquote>
    </Section>
  );
}
