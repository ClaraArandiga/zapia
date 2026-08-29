"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const campoClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

export default function LeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/leads", {
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

      router.push(`/checkout?lead=${data.id}`);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Passo 1 de 3</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Conte sobre sua empresa</h1>
      <p className="mt-3 text-white/60">
        Essas informações vão ser usadas para entender seu projeto antes do pagamento. Depois de
        pagar, você preenche os dados técnicos para a implantação.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <div>
          <label className={labelClass}>Seu nome *</label>
          <input name="nome" required className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Empresa *</label>
          <input name="empresa" required className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Segmento *</label>
          <input name="segmento" required placeholder="Ex: loja de roupas, clínica, restaurante" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Seu WhatsApp para contato *</label>
          <input name="whatsapp_contato" required placeholder="(11) 99999-9999" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="email" type="email" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>O que sua empresa vende?</label>
          <textarea name="o_que_vende" rows={2} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>O que você quer que a IA faça?</label>
          <textarea name="objetivo_bot" rows={2} placeholder="Vender, agendar, tirar dúvidas, captar leads..." className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Principais dúvidas dos seus clientes</label>
          <textarea name="duvidas_frequentes" rows={2} className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Tom de voz desejado</label>
          <input name="tom_de_voz" placeholder="Formal, descontraído, premium..." className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Horário de atendimento</label>
          <input name="horario_atendimento" className={campoClass} />
        </div>
        <div>
          <label className={labelClass}>Instagram ou site</label>
          <input name="instagram_ou_site" className={campoClass} />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <Button type="submit" disabled={loading} className="mt-2 disabled:opacity-60">
          {loading ? "Enviando..." : "Continuar para pagamento →"}
        </Button>
      </form>
    </main>
  );
}
