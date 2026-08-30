import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase";

export default async function AdminClientesPage() {
  const supabase = getSupabaseServiceClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome_empresa, segmento, whatsapp_phone_number_id, ativo, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="mt-1 text-sm text-white/60">{clientes?.length ?? 0} clientes cadastrados.</p>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-brand-400"
        >
          + Novo cliente
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Segmento</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map((c) => (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-white">{c.nome_empresa}</td>
                <td className="px-4 py-3 text-white/70">{c.segmento || "-"}</td>
                <td className="px-4 py-3 text-white/70">
                  {c.whatsapp_phone_number_id ? "Conectado" : "Não conectado"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.ativo ? "bg-brand-500/20 text-brand-400" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {c.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/clientes/${c.id}`}
                    className="inline-block rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:border-brand-400 hover:text-brand-400"
                  >
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
            {!clientes?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  Nenhum cliente ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
