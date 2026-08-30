import { Footer } from "@/components/ui/Footer";

export default function OnboardingConcluidoPage() {
  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-3xl">
          🎉
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Recebemos tudo!</h1>
        <p className="mt-4 text-white/60">
          Seu WhatsApp já está conectado e sua IA configurada. Se precisar ajustar alguma coisa,
          é só entrar em contato com a gente.
        </p>
      </main>
      <Footer />
    </>
  );
}
