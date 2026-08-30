import Link from "next/link";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";

const campo = (label: string, valor: string | null | undefined) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm text-white/80">{valor || "Não configurado"}</dd>
  </div>
);

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  const { sucesso, erro } = await searchParams;

  const supabase = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = getSupabaseServiceClient();
  const { data: cliente } = await service
    .from("clientes")
    .select("id, lead_id, nome_empresa, segmento, whatsapp_phone_number_id, ativo")
    .eq("user_id", user!.id)
    .single();

  const [{ data: lead }, { data: empresaConfig }] = await Promise.all([
    service.from("leads").select("plano_contratado").eq("id", cliente!.lead_id).maybeSingle(),
    service.from("empresa_config").select("*").eq("cliente_id", cliente!.id).maybeSingle(),
  ]);

  const plano = lead?.plano_contratado ?? "base";
  const temRelatorio = plano === "upsell" || plano === "downsell";
  const podeEditar = plano === "upsell";

  let relatorio: { conversas: number; mensagens: number; transferidas: number } | null = null;

  if (temRelatorio) {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: conversas }, { count: transferidas }, { data: conversasRecentes }] = await Promise.all([
      service
        .from("conversas")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", cliente!.id)
        .gte("created_at", seteDiasAtras),
      service
        .from("conversas")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", cliente!.id)
        .eq("status", "transferida_humano")
        .gte("created_at", seteDiasAtras),
      service.from("conversas").select("id").eq("cliente_id", cliente!.id),
    ]);

    const idsConversas = (conversasRecentes ?? []).map((c) => c.id);
    let mensagens = 0;
    if (idsConversas.length) {
      const { count } = await service
        .from("mensagens")
        .select("id", { count: "exact", head: true })
        .in("conversa_id", idsConversas)
        .gte("created_at", seteDiasAtras);
      mensagens = count ?? 0;
    }

    relatorio = { conversas: conversas ?? 0, mensagens, transferidas: transferidas ?? 0 };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Olá, {cliente!.nome_empresa}</h1>
      <p className="mt-1 text-sm text-white/60">Resumo do seu atendente de IA no WhatsApp.</p>

      {sucesso && (
        <p className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-sm text-brand-400">
          Informações atualizadas! Seu atendente já está usando os dados novos.
        </p>
      )}
      {erro && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {erro}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">Status</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {campo("WhatsApp", cliente!.whatsapp_phone_number_id ? "Conectado" : "Ainda não conectado")}
          {campo("Atendimento", cliente!.ativo ? "Ativo" : "Pausado")}
          {campo(
            "Plano",
            plano === "upsell"
              ? "Essencial + Atualização e Relatório"
              : plano === "downsell"
                ? "Essencial + Relatório Semanal"
                : "Essencial"
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
            Configurações atuais
          </h2>
          {podeEditar && (
            <Link href="/painel/editar" className="text-sm text-brand-400 hover:underline">
              Editar →
            </Link>
          )}
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {campo("Tom de voz", empresaConfig?.tom_de_voz)}
          {campo("Horário de atendimento", empresaConfig?.horario_atendimento)}
          {campo("Produtos/serviços", empresaConfig?.produtos_servicos)}
          {campo("Perguntas frequentes", empresaConfig?.faq)}
          {campo("Formas de pagamento", empresaConfig?.formas_pagamento)}
          {campo("Política de troca/cancelamento", empresaConfig?.politica_troca_cancelamento)}
          {campo("Quando transferir para humano", empresaConfig?.quando_transferir_humano)}
          {campo("Contato da equipe humana", empresaConfig?.contato_equipe_humana)}
        </dl>
      </section>

      {relatorio ? (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
            Relatório semanal (últimos 7 dias)
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-3xl font-bold text-white">{relatorio.conversas}</p>
              <p className="mt-1 text-xs text-white/50">conversas</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-3xl font-bold text-white">{relatorio.mensagens}</p>
              <p className="mt-1 text-xs text-white/50">mensagens trocadas</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-3xl font-bold text-white">{relatorio.transferidas}</p>
              <p className="mt-1 text-xs text-white/50">transferidas p/ humano</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-6">
          <h2 className="text-sm font-semibold text-brand-400">
            Quer acompanhar o desempenho do seu atendente?
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Com o plano Essencial + Atualização e Relatório, você edita suas informações quando
            quiser e vê toda semana quantas conversas o bot fechou, quantas viraram cliente e
            quantas precisaram de um humano. Fale com a gente pelo{" "}
            <a href="mailto:zapia.contato@gmail.com" className="underline">
              zapia.contato@gmail.com
            </a>{" "}
            para fazer upgrade.
          </p>
        </section>
      )}
    </div>
  );
}
