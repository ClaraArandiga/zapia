import { ButtonLink } from "@/components/ui/Button";
import { Nav } from "@/components/landing/Nav";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-ink-800 to-ink-900">
      <Nav />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-28 pt-16 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Quantas vendas sua empresa está perdendo porque ninguém respondeu o WhatsApp?
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Enquanto sua equipe trabalha, almoça e dorme, seus clientes continuam mandando mensagens.
        </p>
        <p className="mt-4 max-w-xl text-white/70">
          O <strong className="text-white">ZapIA coloca um atendente de IA no seu WhatsApp</strong>{" "}
          para responder em segundos, 24 horas por dia, tirar dúvidas, qualificar interessados,
          agendar horários e conduzir conversas até a compra.
        </p>
        <p className="mt-4 max-w-xl font-semibold text-white">
          Sem precisar contratar ninguém. Sem programação. Sem precisar ficar online.
        </p>
        <div className="mt-10">
          <ButtonLink href="/lead">Quero parar de perder vendas →</ButtonLink>
        </div>
      </div>
    </section>
  );
}
