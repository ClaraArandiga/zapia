"use client";

import { useState } from "react";
import { salvarCliente } from "@/app/admin/actions";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

interface Cliente {
  id: string;
  nome_empresa: string;
  segmento: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_business_account_id: string | null;
  whatsapp_access_token: string | null;
  ativo: boolean;
}

interface EmpresaConfig {
  tom_de_voz: string | null;
  horario_atendimento: string | null;
  endereco_localizacao: string | null;
  formas_pagamento: string | null;
  politica_troca_cancelamento: string | null;
  quando_transferir_humano: string | null;
  contato_equipe_humana: string | null;
  prompt_sistema: string | null;
}

export function ClienteForm({
  cliente,
  empresaConfig,
}: {
  cliente?: Cliente;
  empresaConfig?: EmpresaConfig;
}) {
  const [nomeEmpresa, setNomeEmpresa] = useState(cliente?.nome_empresa ?? "");
  const [segmento, setSegmento] = useState(cliente?.segmento ?? "");
  const [tomDeVoz, setTomDeVoz] = useState(empresaConfig?.tom_de_voz ?? "");
  const [horarioAtendimento, setHorarioAtendimento] = useState(empresaConfig?.horario_atendimento ?? "");
  const [formasPagamento, setFormasPagamento] = useState(empresaConfig?.formas_pagamento ?? "");
  const [politicaTroca, setPoliticaTroca] = useState(empresaConfig?.politica_troca_cancelamento ?? "");
  const [quandoTransferir, setQuandoTransferir] = useState(empresaConfig?.quando_transferir_humano ?? "");
  const [produtosServicos, setProdutosServicos] = useState("");
  const [faq, setFaq] = useState("");
  const [promptSistema, setPromptSistema] = useState(empresaConfig?.prompt_sistema ?? "");
  const [gerando, setGerando] = useState(false);

  async function gerarPrompt() {
    setGerando(true);
    try {
      const res = await fetch("/api/admin/gerar-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa,
          segmento,
          tomDeVoz,
          horarioAtendimento,
          produtosServicos,
          faq,
          formasPagamento,
          politicaTrocaCancelamento: politicaTroca,
          quandoTransferirHumano: quandoTransferir,
        }),
      });
      const data = await res.json();
      if (data.promptSistema) setPromptSistema(data.promptSistema);
    } finally {
      setGerando(false);
    }
  }

  return (
    <form action={salvarCliente} className="flex flex-col gap-5">
      {cliente && <input type="hidden" name="id" value={cliente.id} />}

      <div>
        <label className={labelClass}>Nome da empresa *</label>
        <input
          name="nome_empresa"
          required
          value={nomeEmpresa}
          onChange={(e) => setNomeEmpresa(e.target.value)}
          className={campoClass}
        />
      </div>
      <div>
        <label className={labelClass}>Segmento</label>
        <input
          name="segmento"
          value={segmento}
          onChange={(e) => setSegmento(e.target.value)}
          className={campoClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Phone Number ID (Meta)</label>
          <input
            name="whatsapp_phone_number_id"
            defaultValue={cliente?.whatsapp_phone_number_id ?? ""}
            className={campoClass}
          />
        </div>
        <div>
          <label className={labelClass}>WhatsApp Business Account ID</label>
          <input
            name="whatsapp_business_account_id"
            defaultValue={cliente?.whatsapp_business_account_id ?? ""}
            className={campoClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Access Token do WhatsApp</label>
        <input
          name="whatsapp_access_token"
          defaultValue={cliente?.whatsapp_access_token ?? ""}
          className={campoClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" name="ativo" defaultChecked={cliente?.ativo ?? true} className="h-4 w-4" />
        Ativo (recebe e responde mensagens)
      </label>

      <hr className="border-white/10" />

      <div>
        <label className={labelClass}>Tom de voz</label>
        <input
          name="tom_de_voz"
          value={tomDeVoz}
          onChange={(e) => setTomDeVoz(e.target.value)}
          className={campoClass}
        />
      </div>
      <div>
        <label className={labelClass}>Horário de atendimento</label>
        <input
          name="horario_atendimento"
          value={horarioAtendimento}
          onChange={(e) => setHorarioAtendimento(e.target.value)}
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
        <label className={labelClass}>Formas de pagamento</label>
        <input
          name="formas_pagamento"
          value={formasPagamento}
          onChange={(e) => setFormasPagamento(e.target.value)}
          className={campoClass}
        />
      </div>
      <div>
        <label className={labelClass}>Política de troca/cancelamento</label>
        <textarea
          name="politica_troca_cancelamento"
          rows={2}
          value={politicaTroca}
          onChange={(e) => setPoliticaTroca(e.target.value)}
          className={campoClass}
        />
      </div>
      <div>
        <label className={labelClass}>Quando transferir para humano</label>
        <textarea
          name="quando_transferir_humano"
          rows={2}
          value={quandoTransferir}
          onChange={(e) => setQuandoTransferir(e.target.value)}
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

      <hr className="border-white/10" />

      <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
        <p className="text-sm font-semibold text-brand-400">Gerar o prompt do bot</p>
        <p className="mt-1 text-xs text-white/50">
          Preencha produtos/FAQ aqui e clique em gerar. O resultado cai na caixa de prompt abaixo,
          que você ainda pode editar à mão antes de salvar.
        </p>
        <div className="mt-3">
          <label className={labelClass}>Produtos/serviços e preços</label>
          <textarea
            rows={3}
            value={produtosServicos}
            onChange={(e) => setProdutosServicos(e.target.value)}
            className={campoClass}
          />
        </div>
        <div className="mt-3">
          <label className={labelClass}>Perguntas frequentes</label>
          <textarea rows={3} value={faq} onChange={(e) => setFaq(e.target.value)} className={campoClass} />
        </div>
        <button
          type="button"
          onClick={gerarPrompt}
          disabled={gerando}
          className="mt-3 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
        >
          {gerando ? "Gerando..." : "Gerar prompt"}
        </button>
      </div>

      <div>
        <label className={labelClass}>Prompt do sistema (o que a IA realmente usa)</label>
        <textarea
          name="prompt_sistema"
          rows={10}
          value={promptSistema}
          onChange={(e) => setPromptSistema(e.target.value)}
          className={`${campoClass} font-mono text-xs`}
        />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-ink-900 hover:bg-brand-400"
      >
        Salvar cliente
      </button>
    </form>
  );
}
