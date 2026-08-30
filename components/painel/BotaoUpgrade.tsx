"use client";

import { useState } from "react";

export function BotaoUpgrade({
  plano = "upsell",
  className = "",
  children,
}: {
  plano?: "upsell" | "downsell";
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function upgradar() {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/painel/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();

      if (!res.ok || !data.initPoint) {
        setErro(data.error ?? "Não foi possível iniciar o upgrade.");
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
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={upgradar} disabled={loading} className={className}>
        {loading ? "Redirecionando..." : children}
      </button>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
}
