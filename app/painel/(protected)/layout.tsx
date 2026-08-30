import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { signOut } from "@/app/painel/actions";

export default async function PainelProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/painel/login");
  }

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, nome_empresa")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente) {
    await supabase.auth.signOut();
    redirect(`/painel/login?erro=${encodeURIComponent("Conta não encontrada.")}`);
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-white">
            Zap<span className="text-brand-400">IA</span>{" "}
            <span className="font-normal text-white/40">painel</span>
          </span>
          <span className="text-sm text-white/50">{cliente.nome_empresa}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <Link href="/painel" className="hover:text-white">
            Início
          </Link>
          <span>{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-white/15 px-4 py-1.5 hover:bg-white/5"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
