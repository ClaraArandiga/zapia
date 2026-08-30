import { Eyebrow, Section } from "@/components/ui/Section";

const beneficios = [
  {
    icone: "⚡",
    titulo: "Responder em segundos",
    desc: "Seu cliente recebe uma resposta rápida, a qualquer hora do dia ou da noite.",
  },
  {
    icone: "🎯",
    titulo: "Qualificar interessados",
    desc: "Identifica quem realmente está pronto para comprar antes de passar a conversa para sua equipe.",
  },
  {
    icone: "💬",
    titulo: "Tirar dúvidas",
    desc: "Preços, produtos, horários, prazos, serviços e políticas, usando as informações da sua empresa.",
  },
  {
    icone: "📅",
    titulo: "Agendar",
    desc: "Marca horários automaticamente sem você precisar ficar trocando dezenas de mensagens.",
  },
  {
    icone: "💰",
    titulo: "Conduzir vendas",
    desc: "Leva o cliente do primeiro contato até o próximo passo da compra.",
  },
  {
    icone: "👤",
    titulo: "Transferir para humanos",
    desc: "Quando a conversa precisar de uma pessoa, a IA passa para sua equipe.",
  },
];

export function Benefits() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Benefícios</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Agora, seu WhatsApp nunca fica sozinho.
      </h2>
      <p className="mt-4 max-w-2xl text-white/60">
        Imagine ter alguém respondendo seus clientes 24 horas por dia, mesmo quando sua equipe
        está offline.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {beneficios.map((b) => (
          <div key={b.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-2xl">{b.icone}</span>
            <h3 className="mt-3 text-lg font-semibold text-white">{b.titulo}</h3>
            <p className="mt-2 text-sm text-white/60">{b.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
