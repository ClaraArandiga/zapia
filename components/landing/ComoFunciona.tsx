import { Eyebrow, Section } from "@/components/ui/Section";

const passos = [
  {
    numero: "01",
    titulo: "Conte sobre sua empresa",
    desc: "Você informa seus produtos, serviços, horários, preços e as principais regras do seu atendimento.",
  },
  {
    numero: "02",
    titulo: "Nós configuramos sua IA",
    desc: "Criamos o atendente de acordo com as informações e o tom da sua empresa.",
  },
  {
    numero: "03",
    titulo: "Conecte seu WhatsApp",
    desc: "Você autoriza a conexão com o WhatsApp Business.",
  },
  {
    numero: "04",
    titulo: "Comece a atender",
    desc: "Sua IA passa a responder seus clientes automaticamente.",
  },
];

export function ComoFunciona() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Como funciona</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Você não precisa entender de tecnologia.
      </h2>
      <p className="mt-4 max-w-2xl text-white/60">Nós cuidamos da parte técnica.</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {passos.map((p) => (
          <div key={p.numero} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-400">
              {p.numero}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{p.titulo}</h3>
            <p className="mt-2 text-sm text-white/60">{p.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center font-semibold text-white">
        Você não precisa programar nada.
      </p>
    </Section>
  );
}
