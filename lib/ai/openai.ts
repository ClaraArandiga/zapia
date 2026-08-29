import type { AIProvider, ContextoEmpresa, MensagemConversa } from "./index";

/**
 * Provedor OpenAI. Stub para a próxima etapa.
 * Requer OPENAI_API_KEY em .env.local e o pacote "openai"
 * (ainda não instalado neste projeto, pois o webhook do WhatsApp não existe).
 */
export const openaiProvider: AIProvider = {
  async responder(contexto: ContextoEmpresa, historico: MensagemConversa[]) {
    throw new Error(
      "openaiProvider ainda não implementado. Próxima etapa (webhook do WhatsApp). " +
        "Instale o pacote openai e implemente a chamada ao Chat Completions aqui, usando " +
        "contexto.promptSistema como mensagem de sistema."
    );
  },
};
