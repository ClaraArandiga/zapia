"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";

const incluso = [
  "IA personalizada com as informações da sua empresa",
  "Conexão com seu WhatsApp Business (via API oficial da Meta)",
  "Configuração de produtos, preços e FAQ",
  "Regras de transferência para atendimento humano",
];

type Plano = "base" | "upsell" | "downsell";

const PRECOS: Record<Plano, number> = { base: 47, upsell: 74, downsell: 54 };

function CheckoutContent() {
  const params = useSearchParams();
  const leadId = params.get("lead");
  const status = params.get("status");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [plano, setPlano] = useState<Plano>("base");

  async function iniciarPagamento() {
    if (!leadId) {
      setErro("Não encontramos seu cadastro. Volte e preencha o formulário novamente.");
      return;
    }
    if (!termosAceitos) {
      setErro("É preciso aceitar os Termos de Uso para continuar.");
      return;
    }
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, termosAceitos, plano }),
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
      <h1 className="mt-2 text-3xl font-bold text-white">Seu atendente de IA no WhatsApp</h1>
      <p className="mt-4 text-white/60">
        Configuramos uma IA personalizada para atender seus clientes automaticamente. Assinatura
        mensal, cancele quando quiser.
      </p>

      <ul className="mt-8 flex w-full flex-col gap-3 text-left">
        {incluso.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80"
          >
            <span className="mt-0.5 text-brand-400">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-10 w-full text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">
          Escolha seu plano
        </p>

        <button
          type="button"
          onClick={() => setPlano("base")}
          className={`mt-4 w-full rounded-2xl border p-5 text-left transition ${
            plano === "base" ? "border-brand-400 bg-brand-500/5" : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Essencial</span>
            <span className="text-lg font-bold text-white">R$47<span className="text-sm font-normal text-white/50">/mês</span></span>
          </div>
          <p className="mt-1 text-sm text-white/60">
            Seu atendente de IA respondendo clientes 24h, treinado com as informações da sua
            empresa.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPlano("upsell")}
          className={`relative mt-4 w-full rounded-2xl border-2 p-5 text-left transition ${
            plano === "upsell" ? "border-brand-400 bg-brand-500/10" : "border-brand-500/40 bg-brand-500/5"
          }`}
        >
          <span className="absolute -top-3 left-5 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-ink-900">
            Mais escolhido
          </span>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Essencial + Atualização e Relatório</span>
            <span className="text-lg font-bold text-white">
              R$74<span className="text-sm font-normal text-white/50">/mês</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-white/70">
            Seu negócio muda toda semana: preço novo, produto novo, promoção de fim de semana. Sem
            esse plano, cada atualização depende de mexer no sistema. Com ele, você mesma atualiza
            em segundos, direto do seu painel.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">✓</span> Edite produtos, preços e respostas
              quando quiser, sem esperar
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">✓</span> Relatório semanal de desempenho no
              seu painel: conversas, clientes atendidos, transferências
            </li>
          </ul>
        </button>

        <button
          type="button"
          onClick={() => setPlano("downsell")}
          className={`mt-4 w-full rounded-2xl border p-5 text-left transition ${
            plano === "downsell" ? "border-brand-400 bg-brand-500/5" : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Ou só o Relatório Semanal</span>
            <span className="text-lg font-bold text-white">
              R$54<span className="text-sm font-normal text-white/50">/mês</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-white/60">
            Não quer editar agora? Tudo bem. Pelo menos acompanhe os números: quantas pessoas seu
            bot atendeu essa semana e quanto isso tirou de trabalho da sua equipe.
          </p>
        </button>
      </div>

      {status === "failure" && (
        <p className="mt-4 text-sm text-red-400">
          O pagamento não foi concluído. Você pode tentar novamente abaixo.
        </p>
      )}
      {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}

      <label className="mt-8 flex items-start gap-3 text-left text-sm text-white/70">
        <input
          type="checkbox"
          checked={termosAceitos}
          onChange={(e) => setTermosAceitos(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        Li e aceito os{" "}
        <Link href="/termos" target="_blank" className="text-brand-400 hover:underline">
          Termos de Uso
        </Link>
        , incluindo os limites de responsabilidade sobre respostas dadas pela IA.
      </label>

      <Button
        onClick={iniciarPagamento}
        disabled={loading || !termosAceitos}
        className="mt-4 w-full disabled:opacity-60"
      >
        {loading ? "Redirecionando..." : `Quero minha IA (R$${PRECOS[plano]}/mês) →`}
      </Button>

      <p className="mt-4 text-xs text-white/40">
        Pagamento processado com segurança pelo Mercado Pago.
      </p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
