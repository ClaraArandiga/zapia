import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { salvarInformacoes } from "@/app/painel/actions";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

export default async function PainelEditarPage() {
  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, lead_id")
    .eq("user_id", user!.id)
    .single();

  const [{ data: lead }, { data: empresaConfig }] = await Promise.all([
    service.from("leads").select("plano_contratado").eq("id", cliente!.lead_id).maybeSingle(),
    service.from("empresa_config").select("*").eq("cliente_id", cliente!.id).maybeSingle(),
  ]);

  if (lead?.plano_contratado !== "upsell") {
    redirect(
      `/painel?erro=${encodeURIComponent("Seu plano não inclui edição. Fale com a gente pra fazer upgrade.")}`
    );
  }

  return (
    <div>
      <Link href="/painel" className="text-sm text-white/50 hover:text-white">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Editar informações</h1>
      <p className="mt-2 text-sm text-white/60">
        Ao salvar, seu atendente já passa a responder com as informações novas.
      </p>

      <form action={salvarInformacoes} className="mt-8 flex flex-col gap-5">
        <div>
          <label className={labelClass}>Tom de voz</label>
          <input name="tom_de_voz" defaultValue={empresaConfig?.tom_de_voz ?? ""} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Horário de atendimento</label>
          <input
            name="horario_atendimento"
            defaultValue={empresaConfig?.horario_atendimento ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Produtos/serviços e preços</label>
          <textarea
            name="produtos_servicos"
            rows={4}
            defaultValue={empresaConfig?.produtos_servicos ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Perguntas frequentes e respostas</label>
          <textarea name="faq" rows={4} defaultValue={empresaConfig?.faq ?? ""} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Formas de pagamento</label>
          <input
            name="formas_pagamento"
            defaultValue={empresaConfig?.formas_pagamento ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Política de troca/cancelamento</label>
          <textarea
            name="politica_troca_cancelamento"
            rows={2}
            defaultValue={empresaConfig?.politica_troca_cancelamento ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Endereço/localização</label>
          <input
            name="endereco_localizacao"
            defaultValue={empresaConfig?.endereco_localizacao ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Quando transferir para humano</label>
          <textarea
            name="quando_transferir_humano"
            rows={2}
            defaultValue={empresaConfig?.quando_transferir_humano ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>Contato da equipe humana</label>
          <input
            name="contato_equipe_humana"
            defaultValue={empresaConfig?.contato_equipe_humana ?? ""}
            className={campoClass}
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-ink-900 hover:bg-brand-400"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
