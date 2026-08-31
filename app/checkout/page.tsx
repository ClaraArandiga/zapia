"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { ConfiancaBadges } from "@/components/ui/ConfiancaBadges";

type Plano = "base" | "upsell" | "downsell";
type Etapa = "oferta" | "downsell";

function CheckoutContent() {
  const params = useSearchParams();
  const leadId = params.get("lead");
  const status = params.get("status");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("oferta");

  async function iniciarPagamento(plano: Plano) {
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

  function quererSoAIA() {
    if (!termosAceitos) {
      setErro("É preciso aceitar os Termos de Uso para continuar.");
      return;
    }
    setErro(null);
    setEtapa("downsell");
  }

  const termosCheckbox = (
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
      .
    </label>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Passo 2 de 3</p>

      {etapa === "oferta" ? (
        <>
          <h1 className="mt-2 text-3xl font-bold text-white">Seu atendente de IA no WhatsApp</h1>

          <div className="mt-8 w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              Você também pode gostar
            </p>
            <div className="mt-3 rounded-2xl border-2 border-brand-400 bg-brand-500/10 p-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Tenha sua IA Sempre Atualizada &amp; Relatórios</span>
                <span className="text-2xl font-bold text-brand-400">
                  +27<span className="text-sm font-normal text-white/50">/mês</span>
                </span>
              </div>
              <p className="mt-2 text-sm text-white/70">
                Edite sua IA quando quiser e acompanhe, toda semana, o que está funcionando e onde
                você pode vender ainda mais com relatórios completos do que seu atendente fez por
                você.
              </p>
              <button
                type="button"
                onClick={() => iniciarPagamento("upsell")}
                disabled={loading}
                className="mt-4 w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-900 transition hover:bg-brand-400 disabled:opacity-60"
              >
                Adicionar (+27/mês) →
              </button>
            </div>
          </div>

          <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-white/80">IA no WhatsApp</span>
              <span className="text-lg font-semibold text-white/80">
                47<span className="text-sm font-normal text-white/40">/mês</span>
              </span>
            </div>
            <Button
              onClick={quererSoAIA}
              disabled={loading}
              variant="ghost"
              className="mt-3 w-full disabled:opacity-60"
            >
              Quero minha IA (47/mês) →
            </Button>
          </div>

          {status === "failure" && (
            <p className="mt-4 text-sm text-red-400">
              O pagamento não foi concluído. Você pode tentar novamente abaixo.
            </p>
          )}
          {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
          {termosCheckbox}
        </>
      ) : (
        <>
          <h1 className="mt-2 text-3xl font-bold text-white">Antes de continuar...</h1>

          <div className="mt-8 w-full rounded-2xl border-2 border-brand-400 bg-brand-500/10 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">+ Relatório Semanal</span>
              <span className="text-2xl font-bold text-brand-400">
                +7<span className="text-sm font-normal text-white/50">/mês</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Acompanhe toda semana quantas pessoas o bot atendeu.
            </p>
            <button
              type="button"
              onClick={() => iniciarPagamento("downsell")}
              disabled={loading}
              className="mt-4 w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-900 transition hover:bg-brand-400 disabled:opacity-60"
            >
              Sim, quero o relatório (+7/mês) →
            </button>
          </div>

          {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
          {termosCheckbox}

          <button
            type="button"
            onClick={() => iniciarPagamento("base")}
            disabled={loading}
            className="mt-4 w-full rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 disabled:opacity-60"
          >
            {loading ? "Redirecionando..." : "Não, quero só a IA (47/mês) →"}
          </button>

          <button
            type="button"
            onClick={() => setEtapa("oferta")}
            className="mt-6 text-xs text-white/30 hover:text-white/50"
          >
            ← Voltar
          </button>
        </>
      )}

      <div className="mt-14 w-full">
        <ConfiancaBadges />
      </div>
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
