import type { AIProvider, ContextoEmpresa, MensagemConversa } from "./index";

/**
 * Provedor Anthropic (Claude). Stub para a próxima etapa.
 * Requer ANTHROPIC_API_KEY em .env.local e o pacote "@anthropic-ai/sdk"
 * (ainda não instalado neste projeto, pois o webhook do WhatsApp não existe).
 */
export const anthropicProvider: AIProvider = {
  async responder(contexto: ContextoEmpresa, historico: MensagemConversa[]) {
    throw new Error(
      "anthropicProvider ainda não implementado. Próxima etapa (webhook do WhatsApp). " +
        "Instale @anthropic-ai/sdk e implemente a chamada à Messages API aqui, usando " +
        "contexto.promptSistema como system prompt."
    );
  },
};
