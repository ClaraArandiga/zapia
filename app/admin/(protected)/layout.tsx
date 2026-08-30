import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { signOut } from "@/app/admin/actions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-white">
            Zap<span className="text-brand-400">IA</span>{" "}
            <span className="font-normal text-white/40">admin</span>
          </span>
          <nav className="flex items-center gap-4 text-sm text-white/60">
            <Link href="/admin" className="hover:text-white">
              Leads
            </Link>
            <Link href="/admin/clientes" className="hover:text-white">
              Clientes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
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
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
