import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase";

const statusLabel: Record<string, string> = {
  novo: "Novo",
  pago: "Pago",
  implantado: "Implantado",
  cancelado: "Cancelado",
};

const statusColor: Record<string, string> = {
  novo: "bg-white/10 text-white/70",
  pago: "bg-brand-500/20 text-brand-400",
  implantado: "bg-blue-500/20 text-blue-400",
  cancelado: "bg-red-500/20 text-red-400",
};

export default async function AdminLeadsPage() {
  const supabase = getSupabaseServiceClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, nome, empresa, email, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Leads</h1>
      <p className="mt-1 text-sm text-white/60">{leads?.length ?? 0} cadastros no funil.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => (
              <tr key={lead.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="text-white hover:text-brand-400">
                    {lead.empresa}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white/70">{lead.nome}</td>
                <td className="px-4 py-3 text-white/70">{lead.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[lead.status] ?? ""}`}
                  >
                    {statusLabel[lead.status] ?? lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {!leads?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  Nenhum lead ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
