import { Eyebrow, Section } from "@/components/ui/Section";

const beneficios = [
  { titulo: "Responde instantaneamente", desc: "Nenhum cliente espera. A IA responde em segundos, a qualquer hora." },
  { titulo: "Qualifica leads", desc: "Identifica quem está pronto para comprar antes de chegar num humano." },
  { titulo: "Tira dúvidas", desc: "Preços, prazos, horários e políticas, sempre com a informação certa." },
  { titulo: "Agenda", desc: "Marca horários automaticamente, sem trocar mensagem manual." },
  { titulo: "Vende", desc: "Conduz o cliente do interesse até o fechamento." },
  { titulo: "Transfere para humanos", desc: "Sabe a hora certa de passar a conversa pra sua equipe." },
];

export function Benefits() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Benefícios</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Um atendente completo, sem folga e sem custo de CLT
      </h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {beneficios.map((b) => (
          <div key={b.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold text-white">{b.titulo}</h3>
            <p className="mt-2 text-sm text-white/60">{b.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
