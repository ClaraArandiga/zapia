"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/painel/redefinir-senha`,
    });

    setCarregando(false);

    if (error) {
      setErro("Não foi possível enviar o link agora. Tente novamente em instantes.");
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <span className="text-lg font-bold text-white">
        Zap<span className="text-brand-400">IA</span>{" "}
        <span className="font-normal text-white/40">painel</span>
      </span>

      {enviado ? (
        <>
          <p className="mt-4 text-white/80">
            Se esse e-mail estiver cadastrado, enviamos um link para você redefinir sua senha.
          </p>
          <Link href="/painel/login" className="mt-6 text-sm text-brand-400 hover:underline">
            ← Voltar para o login
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-white/60">
            Informe o e-mail usado no cadastro. Vamos te enviar um link para criar uma nova senha.
          </p>

          <form onSubmit={enviarLink} className="mt-8 flex flex-col gap-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={campoClass}
              />
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
            >
              {carregando ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>

          <Link href="/painel/login" className="mt-6 text-sm text-white/50 hover:text-white/80">
            ← Voltar para o login
          </Link>
        </>
      )}
    </main>
  );
}
