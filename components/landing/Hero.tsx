import { ButtonLink } from "@/components/ui/Button";
import { Nav } from "@/components/landing/Nav";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-ink-800 to-ink-900">
      <Nav />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-28 pt-16 text-center">
        <p className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          Atendimento automático no WhatsApp com IA
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Quantos clientes sua empresa perde por não responder o WhatsApp na hora?
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Transforme seu WhatsApp em um atendente de IA que trabalha 24h por dia: responde,
          qualifica, agenda e vende sem depender de alguém estar online.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/lead">Quero minha IA no WhatsApp →</ButtonLink>
          <ButtonLink href="#demonstracao" variant="ghost">
            Ver demonstração
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
