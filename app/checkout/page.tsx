"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const incluso = [
  "IA personalizada com as informações da sua empresa",
  "Conexão com seu WhatsApp Business (via API oficial da Meta)",
  "Configuração de produtos, preços e FAQ",
  "Regras de transferência para atendimento humano",
];

function CheckoutContent() {
  const params = useSearchParams();
  const leadId = params.get("lead");
  const status = params.get("status");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function iniciarPagamento() {
    if (!leadId) {
      setErro("Não encontramos seu cadastro. Volte e preencha o formulário novamente.");
      return;
    }
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();

      if (!res.ok || !data.initPoint) {
        setErro(data.error ?? "Não foi possível iniciar o pagamento.");
        setLoading(false);
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Passo 2 de 3</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        Seu atendente de IA no WhatsApp por apenas R$47/mês
      </h1>
      <p className="mt-4 text-white/60">
        Configuramos uma IA personalizada para atender seus clientes automaticamente. Assinatura
        mensal, cancele quando quiser.
      </p>

      <ul className="mt-8 flex w-full flex-col gap-3 text-left">
        {incluso.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
            <span className="mt-0.5 text-brand-400">✓</span>
            {item}
          </li>
        ))}
      </ul>

      {status === "failure" && (
        <p className="mt-4 text-sm text-red-400">
          O pagamento não foi concluído. Você pode tentar novamente abaixo.
        </p>
      )}
      {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}

      <Button onClick={iniciarPagamento} disabled={loading} className="mt-8 w-full disabled:opacity-60">
        {loading ? "Redirecionando..." : "Quero minha IA →"}
      </Button>

      <p className="mt-4 text-xs text-white/40">
        Pagamento processado com segurança pelo Mercado Pago.
      </p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
