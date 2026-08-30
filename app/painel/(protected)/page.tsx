import Link from "next/link";
import { getSupabaseAuthClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { BotaoUpgrade } from "@/components/painel/BotaoUpgrade";

const campo = (label: string, valor: string | null | undefined) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm text-white/80">{valor || "Não configurado"}</dd>
  </div>
);

const statTile = (valor: number | string, rotulo: string, icone: string) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
    <p className="text-2xl">{icone}</p>
    <p className="mt-1 text-3xl font-bold text-white">{valor}</p>
    <p className="mt-1 text-xs text-white/50">{rotulo}</p>
  </div>
);

function formatarTempo(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
}

function tempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

const statusLabel: Record<string, string> = {
  ativa: "Em andamento",
  transferida_humano: "Com atendente humano",
  encerrada: "Encerrada",
};

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
    .select("id, lead_id, nome_empresa, segmento, whatsapp_phone_number_id, ativo, created_at")
    .eq("user_id", user!.id)
    .single();

  const [{ data: lead }, { data: empresaConfig }, { data: assinatura }] = await Promise.all([
    service.from("leads").select("plano_contratado").eq("id", cliente!.lead_id).maybeSingle(),
    service.from("empresa_config").select("*").eq("cliente_id", cliente!.id).maybeSingle(),
    service
      .from("assinaturas")
      .select("status, valor, created_at")
      .eq("lead_id", cliente!.lead_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const plano = lead?.plano_contratado ?? "base";
  const temRelatorio = plano === "upsell" || plano === "downsell";
  const podeEditar = plano === "upsell";

  const diasAtivo = cliente
    ? Math.max(1, Math.floor((Date.now() - new Date(cliente.created_at).getTime()) / 86400000))
    : 0;

  let relatorio: {
    conversas: number;
    mensagens: number;
    transferidas: number;
    conversasTotais: number;
    mensagensTotais: number;
    recentes: { id: string; numero: string; status: string; ultimaMensagemEm: string }[];
  } | null = null;

  if (temRelatorio) {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: conversas },
      { count: transferidas },
      { count: conversasTotais },
      { data: todasConversas },
      { data: conversasRecentes },
    ] = await Promise.all([
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
      service
        .from("conversas")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", cliente!.id),
      service.from("conversas").select("id").eq("cliente_id", cliente!.id),
      service
        .from("conversas")
        .select("id, numero_cliente_final, status, ultima_mensagem_em")
        .eq("cliente_id", cliente!.id)
        .order("ultima_mensagem_em", { ascending: false })
        .limit(5),
    ]);

    const idsConversas = (todasConversas ?? []).map((c) => c.id);
    let mensagens = 0;
    let mensagensTotais = 0;
    if (idsConversas.length) {
      const [{ count: recentesCount }, { count: totaisCount }] = await Promise.all([
        service
          .from("mensagens")
          .select("id", { count: "exact", head: true })
          .in("conversa_id", idsConversas)
          .gte("created_at", seteDiasAtras),
        service
          .from("mensagens")
          .select("id", { count: "exact", head: true })
          .in("conversa_id", idsConversas),
      ]);
      mensagens = recentesCount ?? 0;
      mensagensTotais = totaisCount ?? 0;
    }

    relatorio = {
      conversas: conversas ?? 0,
      mensagens,
      transferidas: transferidas ?? 0,
      conversasTotais: conversasTotais ?? 0,
      mensagensTotais,
      recentes: (conversasRecentes ?? []).map((c) => ({
        id: c.id,
        numero: c.numero_cliente_final,
        status: c.status,
        ultimaMensagemEm: c.ultima_mensagem_em,
      })),
    };
  }

  // estimativa conservadora: cada mensagem do bot poupa ~2min de atendimento manual
  const minutosEconomizados = relatorio ? relatorio.mensagens * 2 : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {cliente!.nome_empresa}</h1>
          <p className="mt-1 text-sm text-white/60">Resumo do seu atendente de IA no WhatsApp.</p>
        </div>
        <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          🟢 Bot ativo há {diasAtivo} {diasAtivo === 1 ? "dia" : "dias"}
        </span>
      </div>

      {sucesso === "upgrade" && (
        <p className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-sm text-brand-400">
          Assinatura confirmada! O relatório aparece assim que o Mercado Pago liberar o pagamento
          (pode levar alguns minutos).
        </p>
      )}
      {sucesso && sucesso !== "upgrade" && (
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
          {campo(
            "Assinatura",
            assinatura
              ? `${assinatura.status === "authorized" ? "Ativa" : assinatura.status} · R$ ${assinatura.valor}/mês`
              : "Aguardando confirmação"
          )}
        </dl>
      </section>

      {relatorio ? (
        <section className="mt-6 rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-400">
            O que seu atendente fez por você
          </h2>

          <div className="mt-5 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Tempo estimado economizado essa semana
            </p>
            <p className="mt-1 text-4xl font-bold text-brand-400">
              {formatarTempo(minutosEconomizados)}
            </p>
            <p className="mt-1 text-xs text-white/40">
              considerando ~2 min por mensagem que seu atendente respondeu sozinho
            </p>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/40">
            Últimos 7 dias
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {statTile(relatorio.conversas, "conversas", "💬")}
            {statTile(relatorio.mensagens, "mensagens trocadas", "📨")}
            {statTile(relatorio.transferidas, "transferidas p/ humano", "🤝")}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/40">
            Desde que você começou
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {statTile(relatorio.conversasTotais, "conversas no total", "📈")}
            {statTile(relatorio.mensagensTotais, "mensagens no total", "🗂️")}
          </div>

          {relatorio.recentes.length > 0 && (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/40">
                Atividade recente
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {relatorio.recentes.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm"
                  >
                    <span className="text-white/80">{c.numero}</span>
                    <span className="text-white/50">{statusLabel[c.status] ?? c.status}</span>
                    <span className="text-xs text-white/40">{tempoRelativo(c.ultimaMensagemEm)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : (
        <section className="mt-6 overflow-hidden rounded-2xl border border-brand-500/30 bg-brand-500/5 p-6">
          <h2 className="text-sm font-semibold text-brand-400">
            Quer acompanhar o desempenho do seu atendente?
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Com o plano Essencial + Atualização e Relatório, você edita suas informações quando
            quiser e vê toda semana quantas conversas o bot fechou, quantas mensagens trocou e
            quanto tempo isso economizou da sua equipe.
          </p>

          <div className="relative mt-5">
            <div aria-hidden="true" className="pointer-events-none grid gap-4 blur-sm sm:grid-cols-3">
              {statTile(24, "conversas", "💬")}
              {statTile(112, "mensagens trocadas", "📨")}
              {statTile("3h 40min", "tempo economizado", "⏱️")}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BotaoUpgrade
                plano="upsell"
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
              >
                Desbloquear relatório (27/mês) →
              </BotaoUpgrade>
            </div>
          </div>
        </section>
      )}

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
    </div>
  );
}
