"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";

function ObrigadoContent() {
  const params = useSearchParams();
  const leadId = params.get("lead");
  const pendente = params.get("status") === "pending";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-3xl">
        {pendente ? "⏳" : "✅"}
      </div>
      <h1 className="mt-6 text-3xl font-bold text-white">
        {pendente ? "Pagamento em processamento" : "Pagamento confirmado!"}
      </h1>
      <p className="mt-4 text-white/60">
        {pendente
          ? "Assim que a confirmação chegar do Mercado Pago, liberamos o próximo passo. Isso pode levar alguns minutos."
          : "Agora vamos configurar sua IA. Precisamos de mais alguns detalhes técnicos sobre o WhatsApp e o funcionamento do seu atendimento."}
      </p>

      {leadId && (
        <ButtonLink href={`/onboarding?lead=${leadId}`} className="mt-8">
          Continuar para configuração →
        </ButtonLink>
      )}
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={null}>
      <ObrigadoContent />
    </Suspense>
  );
}
