import { Section } from "@/components/ui/Section";

export function Configuracao() {
  return (
    <Section className="border-t border-white/5">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Seu atendente não dorme. Não falta. Não tira folga.
        </h2>
        <p className="mt-4 text-white/70">E, principalmente:</p>
        <p className="mt-1 text-xl font-semibold text-white">não deixa seu cliente esperando.</p>
        <p className="mt-6 text-white/60">
          O ZapIA responde automaticamente, seguindo as informações, o tom e as regras da sua
          empresa.
        </p>
        <p className="mt-6 text-white/70">Você fornece:</p>
        <p className="mt-2 font-semibold text-white">
          Produtos • Preços • Horários • Serviços • Políticas • Perguntas frequentes
        </p>
        <p className="mt-6 text-white/60">E nós configuramos sua IA para atender seus clientes.</p>
      </div>
    </Section>
  );
}
