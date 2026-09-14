"use client";

import { useState, useTransition } from "react";
import { pausarIA, retomarIA } from "@/app/painel/actions";

export function PausarIA({ ativo }: { ativo: boolean }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!ativo) {
    return (
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-sm font-semibold text-white">Seu atendimento automático está pausado.</p>
        <p className="mt-1 text-sm text-white/60">
          Seu WhatsApp não está respondendo mensagens novas neste momento.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => retomarIA())}
          className="mt-4 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
        >
          {pending ? "Reativando..." : "Quero minha IA de volta"}
        </button>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">
        Pausar atendimento
      </h2>

      {!confirmando ? (
        <>
          <p className="mt-2 text-sm text-white/60">
            Precisa dar uma pausa? Você pode desligar o atendimento automático a qualquer momento e
            ligar de novo quando quiser, sem perder nenhuma configuração.
          </p>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="mt-4 rounded-full border border-red-500/40 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20"
          >
            Pausar atendimento automático
          </button>
        </>
      ) : (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-white">Tem certeza que quer pausar?</p>
          <p className="mt-1 text-sm text-white/60">
            Enquanto estiver pausado, seu WhatsApp para de responder automaticamente. As mensagens
            continuam chegando, só não terão resposta até você reativar.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(async () => {
                await pausarIA();
                setConfirmando(false);
              })}
              className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
            >
              {pending ? "Pausando..." : "Sim, pausar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
