"use client";

import { useState } from "react";

export function BotaoGerenciarAssinatura({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrirPortal() {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/painel/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setErro(data.error ?? "Não foi possível abrir o gerenciamento da assinatura.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={abrirPortal}
        disabled={loading}
        className={className || "text-sm text-brand-400 hover:underline disabled:opacity-60"}
      >
        {loading ? "Abrindo..." : "Gerenciar assinatura →"}
      </button>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
}
