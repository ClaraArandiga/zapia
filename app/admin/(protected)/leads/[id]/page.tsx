import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { atualizarStatusLead } from "@/app/admin/actions";

const campo = (label: string, valor: string | null | undefined) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm text-white/80">{valor || "-"}</dd>
  </div>
);

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();

  const [{ data: lead }, { data: onboarding }, { data: assinaturas }, { data: pagamentos }] =
    await Promise.all([
      supabase.from("leads").select("*").eq("id", id).single(),
      supabase.from("onboarding_respostas").select("*").eq("lead_id", id).maybeSingle(),
      supabase
        .from("assinaturas")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("pagamentos")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!lead) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-white/50 hover:text-white">
        ← Voltar para leads
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{lead.empresa}</h1>
        <form action={atualizarStatusLead} className="flex items-center gap-2">
          <input type="hidden" name="leadId" value={lead.id} />
          <select
            name="status"
            defaultValue={lead.status}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="novo">Novo</option>
            <option value="pago">Pago</option>
            <option value="implantado">Implantado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-brand-400"
          >
            Atualizar status
          </button>
        </form>
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
          Formulário inicial
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {campo("Nome", lead.nome)}
          {campo("Segmento", lead.segmento)}
          {campo("WhatsApp de contato", lead.whatsapp_contato)}
          {campo("E-mail", lead.email)}
          {campo("O que vende", lead.o_que_vende)}
          {campo("Objetivo do bot", lead.objetivo_bot)}
          {campo("Dúvidas frequentes", lead.duvidas_frequentes)}
          {campo("Tom de voz", lead.tom_de_voz)}
          {campo("Horário de atendimento", lead.horario_atendimento)}
          {campo("Instagram/site", lead.instagram_ou_site)}
        </dl>
      </section>

      {onboarding && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
            Implantação
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {campo("Número do WhatsApp Business", onboarding.whatsapp_business_number)}
            {campo("Autorizou a Meta", onboarding.autorizou_meta ? "Sim" : "Não")}
            {campo("Produtos/serviços", onboarding.produtos_servicos)}
            {campo("FAQ", onboarding.faq)}
            {campo("Formas de pagamento", onboarding.formas_pagamento)}
            {campo("Política de troca/cancelamento", onboarding.politica_troca_cancelamento)}
            {campo("Endereço/localização", onboarding.endereco_localizacao)}
            {campo("Como funciona o atendimento", onboarding.como_funciona_atendimento)}
            {campo("Quando transferir para humano", onboarding.quando_transferir_humano)}
            {campo("Contato da equipe humana", onboarding.contato_equipe_humana)}
            {campo("Observações", onboarding.observacoes)}
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
          Assinatura
        </h2>
        {assinaturas?.length ? (
          <ul className="mt-4 flex flex-col gap-2">
            {assinaturas.map((a) => (
              <li key={a.id} className="flex justify-between text-sm text-white/70">
                <span>{a.status}</span>
                <span>{a.valor ? `R$ ${a.valor}` : "-"}</span>
                <span className="text-white/40">
                  {new Date(a.created_at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-white/40">Nenhuma assinatura registrada ainda.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
          Pagamentos avulsos
        </h2>
        {pagamentos?.length ? (
          <ul className="mt-4 flex flex-col gap-2">
            {pagamentos.map((p) => (
              <li key={p.id} className="flex justify-between text-sm text-white/70">
                <span>{p.status}</span>
                <span>{p.valor ? `R$ ${p.valor}` : "-"}</span>
                <span className="text-white/40">
                  {new Date(p.created_at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-white/40">Nenhum pagamento avulso registrado.</p>
        )}
      </section>
    </div>
  );
}
