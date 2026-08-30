import { Eyebrow, Section } from "@/components/ui/Section";

const mensagens = [
  { autor: "cliente", texto: "Oi, vocês têm o tênis Runner 42 no tamanho 40?" },
  {
    autor: "bot",
    texto:
      "Oi! Temos sim ✅ O Runner 42 no tamanho 40 está por R$ 349,90. Quer que eu separe um par pra você retirar hoje ou prefere entrega?",
  },
  { autor: "cliente", texto: "Pode ser entrega. Qual o prazo?" },
  {
    autor: "bot",
    texto:
      "Entregamos em até 2 dias úteis na sua região. Posso já confirmar o pedido e te enviar o link de pagamento?",
  },
];

export function Demo() {
  return (
    <Section id="demonstracao">
      <Eyebrow>Demonstração</Eyebrow>
      <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        Veja o que seu cliente enxergaria.
      </h2>
      <p className="mt-4 max-w-xl text-white/60">
        A IA responde no tom da sua empresa, usando só as informações que você fornece: preços,
        catálogo, horários e políticas.
      </p>

      <div className="mt-10 max-w-md rounded-3xl border border-white/10 bg-ink-800 p-4 shadow-2xl">
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
          <div className="h-9 w-9 rounded-full bg-brand-500" />
          <div>
            <p className="text-sm font-semibold text-white">Sua Empresa</p>
            <p className="text-xs text-brand-400">online agora</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {mensagens.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.autor === "bot"
                  ? "self-start rounded-tl-sm bg-white/10 text-white"
                  : "self-end rounded-tr-sm bg-brand-500 text-ink-900"
              }`}
            >
              {m.texto}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 max-w-md font-semibold text-white">
        É isso que acontece enquanto você faz outras coisas.
      </p>
    </Section>
  );
}
