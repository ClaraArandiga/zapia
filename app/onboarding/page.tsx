"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConectarWhatsapp } from "@/components/onboarding/ConectarWhatsapp";
import { Footer } from "@/components/ui/Footer";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

function OnboardingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const leadId = params.get("lead");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [whatsappConectado, setWhatsappConectado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!leadId) {
      setErro("Link inválido. Volte para a página de obrigado e clique em continuar.");
      return;
    }
    if (!whatsappConectado) {
      setErro("Conecte seu WhatsApp Business antes de continuar.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmarSenha = String(form.get("confirmar_senha") ?? "");

    if (senha.length < 8) {
      setErro("A senha do painel precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setErro(null);

    form.delete("confirmar_senha");
    const payload = {
      lead_id: leadId,
      autorizou_meta: whatsappConectado,
      ...Object.fromEntries(form.entries()),
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível enviar o formulário.");
        setLoading(false);
        return;
      }

      router.push("/onboarding/concluido");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Passo 3 de 3</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Vamos configurar sua IA</h1>
      <p className="mt-3 text-white/60">
        Estas informações são usadas exclusivamente para configurar seu atendente. Nunca pedimos a
        senha do seu WhatsApp. A conexão é feita pela autorização oficial da Meta.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <div>
          <label className={labelClass}>Número do WhatsApp Business *</label>
          <input name="whatsapp_business_number" required placeholder="(11) 99999-9999" className={campoClass} />
        </div>

        {leadId && (
          <ConectarWhatsapp leadId={leadId} onConectado={() => setWhatsappConectado(true)} />
        )}

        <div>
          <label className={labelClass}>Produtos/serviços e preços</label>
          <textarea name="produtos_servicos" rows={3} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Perguntas frequentes e respostas</label>
          <textarea name="faq" rows={4} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Formas de pagamento</label>
          <input name="formas_pagamento" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Política de troca/cancelamento</label>
          <textarea name="politica_troca_cancelamento" rows={2} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Endereço/localização</label>
          <input name="endereco_localizacao" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Como funciona o atendimento/venda/agendamento</label>
          <textarea name="como_funciona_atendimento" rows={2} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Quando o bot deve passar para um humano</label>
          <textarea name="quando_transferir_humano" rows={2} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Contato da equipe humana</label>
          <input name="contato_equipe_humana" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Observações</label>
          <textarea name="observacoes" rows={2} className={campoClass} />
        </div>

        <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
          <p className="text-sm font-semibold text-brand-400">Crie o acesso ao seu painel</p>
          <p className="mt-1 text-xs text-white/50">
            Com esse login você acompanha o que seu atendente está fazendo e revisa as
            configurações sempre que quiser.
          </p>
          <div className="mt-4">
            <label className={labelClass}>E-mail de acesso *</label>
            <input name="email_painel" type="email" required className={campoClass} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Senha *</label>
              <input name="senha" type="password" required minLength={8} className={campoClass} />
            </div>
            <div>
              <label className={labelClass}>Confirmar senha *</label>
              <input name="confirmar_senha" type="password" required minLength={8} className={campoClass} />
            </div>
          </div>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <Button
          type="submit"
          disabled={loading || !whatsappConectado}
          className="mt-2 disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Concluir configuração"}
        </Button>
      </form>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <OnboardingContent />
      </Suspense>
      <Footer />
    </>
  );
}
