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
    pergunta: "Posso usar meu número atual?",
    resposta:
      "Sim. A conexão é feita com o número que você já usa, sem precisar criar um novo ou perder o histórico de contatos.",
  },
  {
    pergunta: "E se a IA não souber responder alguma coisa?",
    resposta:
      "Ela transfere a conversa para sua equipe automaticamente, seguindo as regras que você definir.",
  },
  {
    pergunta: "A IA pode responder no tom da minha empresa?",
    resposta:
      "Sim. A configuração é feita com base nas informações e no tom que você fornece, para soar como a sua empresa e não como um robô genérico.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta: "Sim. Não existe fidelidade. Você cancela quando quiser, direto pelo seu painel.",
  },
  {
    pergunta: "E se eu comprar e não gostar?",
    resposta:
      "Você tem 7 dias de garantia. Se decidir que não é para você, é só solicitar o cancelamento dentro do prazo e recebe 100% do valor de volta.",
  },
];

export function Objections() {
  return (
    <Section className="border-t border-white/5">
      <Eyebrow>Perguntas frequentes</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Perguntas que você provavelmente está fazendo
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
