"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [sessaoPronta, setSessaoPronta] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoPronta(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessaoPronta(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    setErro(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    setCarregando(false);

    if (error) {
      setErro("Não foi possível salvar a nova senha. O link pode ter expirado.");
      return;
    }

    router.push("/painel/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <span className="text-lg font-bold text-white">
        Zap<span className="text-brand-400">IA</span>{" "}
        <span className="font-normal text-white/40">painel</span>
      </span>

      {!sessaoPronta ? (
        <p className="mt-4 text-white/60">
          Abra esta página pelo link que você recebeu por e-mail para redefinir sua senha.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-white/60">Crie sua nova senha.</p>

          <form onSubmit={salvarSenha} className="mt-8 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Nova senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={campoClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirmar nova senha</label>
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={campoClass}
              />
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
