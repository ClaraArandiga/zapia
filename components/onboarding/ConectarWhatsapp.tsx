"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

type Status = "idle" | "conectando" | "conectado" | "erro";

export function ConectarWhatsapp({
  leadId,
  onConectado,
}: {
  leadId: string;
  onConectado: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [sdkPronto, setSdkPronto] = useState(false);
  const dadosSignup = useRef<{ phoneNumberId?: string; wabaId?: string }>({});

  useEffect(() => {
    if (window.FB) {
      setSdkPronto(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB!.init({ appId: process.env.NEXT_PUBLIC_WHATSAPP_APP_ID, version: "v21.0" });
      setSdkPronto(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.facebook.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          dadosSignup.current = {
            phoneNumberId: data.data?.phone_number_id,
            wabaId: data.data?.waba_id,
          };
        }
      } catch {
        // mensagens de outra origem/formato são ignoradas
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function conectar() {
    if (!window.FB) return;
    setStatus("conectando");

    window.FB.login(
      (response: any) => {
        const code = response?.authResponse?.code;
        if (!code) {
          setStatus("erro");
          return;
        }
        // dá um instante pro evento "message" com phone_number_id/waba_id chegar
        setTimeout(() => finalizarConexao(code), 1000);
      },
      {
        config_id: process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { sessionInfoVersion: "3" },
      }
    );
  }

  async function finalizarConexao(code: string) {
    const { phoneNumberId, wabaId } = dadosSignup.current;

    if (!phoneNumberId || !wabaId) {
      setStatus("erro");
      return;
    }

    try {
      const res = await fetch("/api/whatsapp/conectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, code, phoneNumberId, wabaId }),
      });

      if (!res.ok) {
        setStatus("erro");
        return;
      }

      setStatus("conectado");
      onConectado();
    } catch {
      setStatus("erro");
    }
  }

  return (
    <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
      <p className="text-sm text-white/70">
        Conecte seu WhatsApp Business oficialmente pela Meta. Não pedimos sua senha em nenhum
        momento.
      </p>
      <button
        type="button"
        onClick={conectar}
        disabled={!sdkPronto || status === "conectando" || status === "conectado"}
        className="mt-3 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-brand-400 disabled:opacity-60"
      >
        {status === "conectado"
          ? "WhatsApp conectado ✓"
          : status === "conectando"
            ? "Conectando..."
            : "Conectar WhatsApp Business"}
      </button>
      {status === "erro" && (
        <p className="mt-2 text-sm text-red-400">Não foi possível conectar. Tente novamente.</p>
      )}
    </div>
  );
}
