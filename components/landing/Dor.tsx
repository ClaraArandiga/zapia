import { Section } from "@/components/ui/Section";

export function Dor() {
  return (
    <Section className="border-t border-white/5 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Seu cliente não sabe que você está ocupado.
        </h2>
        <p className="mt-6 text-lg text-white/70">Ele só sabe que mandou uma mensagem.</p>
        <p className="mt-2 text-lg text-white/70">E se ninguém responder...</p>
        <p className="mt-2 text-xl font-semibold text-white">
          ele pode simplesmente chamar o seu concorrente.
        </p>
        <p className="mt-8 text-white/60">
          Quantas pessoas já perguntaram preço, disponibilidade ou prazo e ficaram esperando uma
          resposta?
        </p>
        <p className="mt-2 text-white/60">Quantas dessas pessoas você nunca mais viu?</p>
        <p className="mt-6 text-lg font-semibold text-red-400">
          Cada conversa sem resposta pode ser uma venda perdida.
        </p>
      </div>
    </Section>
  );
}
