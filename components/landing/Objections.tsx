import { Eyebrow, Section } from "@/components/ui/Section";

const objecoes = [
  {
    pergunta: "Funciona no meu WhatsApp?",
    resposta:
      "Sim. Conectamos ao WhatsApp Business através da API oficial da Meta. Você autoriza o acesso, sem precisar trocar de número.",
  },
  {
    pergunta: "Preciso saber programação?",
    resposta:
      "Não. Você só preenche um formulário com as informações da sua empresa. A gente cuida de toda a configuração técnica.",
  },
  {
    pergunta: "E se a IA não souber responder?",
    resposta:
      "Ela transfere a conversa para sua equipe automaticamente, seguindo as regras que você definir.",
  },
];

export function Objections() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Perguntas frequentes</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Antes de você perguntar
      </h2>
      <div className="mt-10 flex flex-col gap-4">
        {objecoes.map((o) => (
          <div key={o.pergunta} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="font-semibold text-white">{o.pergunta}</p>
            <p className="mt-2 text-sm text-white/60">{o.resposta}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
