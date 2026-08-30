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
      , incluindo os limites de responsabilidade sobre respostas dadas pela IA.
    </label>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Passo 2 de 3</p>

      {etapa === "oferta" ? (
        <>
          <h1 className="mt-2 text-3xl font-bold text-white">Seu atendente de IA no WhatsApp</h1>
          <p className="mt-4 text-white/60">
            Configuramos uma IA personalizada para atender seus clientes automaticamente.
            Assinatura mensal, cancele quando quiser.
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

          <div className="mt-8 w-full rounded-2xl border border-brand-400 bg-brand-500/5 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">IA no WhatsApp</span>
              <span className="text-2xl font-bold text-white">
                R$47<span className="text-sm font-normal text-white/50">/mês</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Seu atendente de IA respondendo clientes 24h, treinado com as informações da sua
              empresa.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-white/50">
              <span aria-hidden="true">🛡️</span> Garantia de 7 dias.
            </p>
            <Button onClick={quererSoAIA} disabled={loading} className="mt-4 w-full disabled:opacity-60">
              Quero minha IA (R$47/mês) →
            </Button>
          </div>

          <div className="mt-6 w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Você também pode gostar
            </p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">+ Atualização e Relatório</span>
                <span className="text-lg font-bold text-brand-400">+R$27<span className="text-sm font-normal text-white/50">/mês</span></span>
              </div>
              <p className="mt-2 text-sm text-white/70">
                Seu negócio muda toda semana: preço novo, produto novo, promoção de fim de semana.
                Sem isso, cada atualização depende de mexer no sistema. Com esse extra, você mesma
                atualiza em segundos, direto do seu painel, e ainda acompanha toda semana quantas
                conversas o bot fechou.
              </p>
              <button
                type="button"
                onClick={() => iniciarPagamento("upsell")}
                disabled={loading}
                className="mt-4 w-full rounded-full border border-brand-400 py-3 text-sm font-semibold text-brand-400 transition hover:bg-brand-500/10 disabled:opacity-60"
              >
                Adicionar por +R$27/mês (R$74 no total) →
              </button>
            </div>
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
          <p className="mt-4 text-white/60">
            Você optou por só a IA. Sem problema, mas que tal pelo menos acompanhar o que ela está
            fazendo pelo seu negócio?
          </p>

          <div className="mt-8 w-full rounded-2xl border border-brand-400 bg-brand-500/5 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">+ Relatório Semanal</span>
              <span className="text-2xl font-bold text-brand-400">
                +R$7<span className="text-sm font-normal text-white/50">/mês</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Toda semana, direto no seu painel: quantas pessoas seu bot atendeu, quantas conversas
              viraram cliente e quanto isso tirou de trabalho da sua equipe. Por menos de R$0,25 por
              dia.
            </p>
            <Button
              onClick={() => iniciarPagamento("downsell")}
              disabled={loading}
              className="mt-4 w-full disabled:opacity-60"
            >
              Sim, quero o relatório (+R$7/mês) →
            </Button>
          </div>

          {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
          {termosCheckbox}

          <button
            type="button"
            onClick={() => iniciarPagamento("base")}
            disabled={loading}
            className="mt-4 text-sm text-white/50 underline hover:text-white/80 disabled:opacity-60"
          >
            {loading ? "Redirecionando..." : "Não, quero só a IA (R$47/mês) →"}
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

      <p className="mt-6 text-xs text-white/40">
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
