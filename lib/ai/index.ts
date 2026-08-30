/**
 * Camada de IA plugável, usada pelo webhook do WhatsApp
 * (app/api/webhooks/whatsapp/route.ts) para responder aos clientes finais.
 *
 * Troque o provedor via AI_PROVIDER=gemini|anthropic|openai em .env.local
 * (só o Gemini está implementado de verdade por enquanto).
 */

/** Tag que o modelo inclui na resposta quando não consegue ajudar sozinho. */
export const TAG_TRANSFERIR_HUMANO = "[[TRANSFERIR_HUMANO]]";

export interface MensagemConversa {
  autor: "cliente" | "bot";
  texto: string;
}

export interface ContextoEmpresa {
  nomeEmpresa: string;
  promptSistema: string;
}

export interface AIProvider {
  responder(contexto: ContextoEmpresa, historico: MensagemConversa[]): Promise<string>;
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  if (provider === "openai") {
    const { openaiProvider } = require("./openai") as typeof import("./openai");
    return openaiProvider;
  }

  if (provider === "anthropic") {
    const { anthropicProvider } = require("./anthropic") as typeof import("./anthropic");
    return anthropicProvider;
  }

  const { geminiProvider } = require("./gemini") as typeof import("./gemini");
  return geminiProvider;
}

export function montarPromptSistema(config: {
  nomeEmpresa: string;
  segmento: string;
  tomDeVoz?: string | null;
  horarioAtendimento?: string | null;
  produtosServicos?: string | null;
  faq?: string | null;
  formasPagamento?: string | null;
  politicaTrocaCancelamento?: string | null;
  quandoTransferirHumano?: string | null;
}) {
  return `Você é o atendente virtual da empresa ${config.nomeEmpresa} (segmento: ${config.segmento}).
Responda utilizando exclusivamente as informações fornecidas abaixo. Se não souber a resposta, diga
que vai verificar com a equipe e ofereça transferir para um humano.

Tom de voz: ${config.tomDeVoz ?? "cordial e direto"}
Horário de atendimento: ${config.horarioAtendimento ?? "não informado"}

Produtos/serviços:
${config.produtosServicos ?? "não informado"}

Perguntas frequentes:
${config.faq ?? "não informado"}

Formas de pagamento: ${config.formasPagamento ?? "não informado"}
Política de troca/cancelamento: ${config.politicaTrocaCancelamento ?? "não informado"}

Transfira para um humano quando: ${config.quandoTransferirHumano ?? "o cliente pedir explicitamente"}

Se não conseguir ajudar ou o cliente pedir para falar com uma pessoa, inclua a tag ${TAG_TRANSFERIR_HUMANO} em algum lugar da sua resposta (o sistema remove essa tag antes de enviar a mensagem).`;
}
