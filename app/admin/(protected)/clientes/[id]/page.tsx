import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { excluirCliente } from "@/app/admin/actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();

  const [{ data: cliente }, { data: empresaConfig }] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single(),
    supabase.from("empresa_config").select("*").eq("cliente_id", id).maybeSingle(),
  ]);

  if (!cliente) notFound();

  return (
    <div>
      <Link href="/admin/clientes" className="text-sm text-white/50 hover:text-white">
        ← Voltar para clientes
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{cliente.nome_empresa}</h1>
        <form action={excluirCliente}>
          <input type="hidden" name="id" value={cliente.id} />
          <button
            type="submit"
            className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Excluir
          </button>
        </form>
      </div>
      <div className="mt-8 max-w-2xl">
        <ClienteForm cliente={cliente} empresaConfig={empresaConfig ?? undefined} />
      </div>
    </div>
  );
}
