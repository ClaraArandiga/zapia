import type { AIProvider, ContextoEmpresa, MensagemConversa } from "./index";

const MODELO_PADRAO = "gemini-3.6-flash";

/** Provedor Google Gemini (plano gratuito). Chamada direta via REST, sem SDK. */
export const geminiProvider: AIProvider = {
  async responder(contexto: ContextoEmpresa, historico: MensagemConversa[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini não configurado: defina GEMINI_API_KEY em .env.local");
    }

    const modelo = process.env.GEMINI_MODEL ?? MODELO_PADRAO;

    const contents = historico.map((m) => ({
      role: m.autor === "bot" ? "model" : "user",
      parts: [
        ...(m.midia
          ? [{ inline_data: { mime_type: m.midia.mimeType, data: m.midia.dadosBase64 } }]
          : []),
        { text: m.texto },
      ],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: contexto.promptSistema }] },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            // Atendimento simples não precisa de raciocínio longo; reduz custo/latência.
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
      }
    );

    if (!res.ok) {
      const erro = await res.text();
      throw new Error(`Gemini respondeu ${res.status}: ${erro}`);
    }

    const data = await res.json();
    const texto: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto) {
      throw new Error("Gemini não retornou texto na resposta");
    }

    return texto.trim();
  },
};
