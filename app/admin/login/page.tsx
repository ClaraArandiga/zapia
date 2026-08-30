import { signIn } from "@/app/admin/actions";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <span className="text-lg font-bold text-white">
        Zap<span className="text-brand-400">IA</span>{" "}
        <span className="font-normal text-white/40">admin</span>
      </span>
      <p className="mt-1 text-sm text-white/60">Entre com sua conta de administradora.</p>

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="email" type="email" required className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Senha</label>
          <input name="senha" type="password" required className={campoClass} />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          className="mt-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-ink-900 hover:bg-brand-400"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
