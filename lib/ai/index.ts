/**
 * Camada de IA plugável para o motor do bot (próxima etapa, ainda não é
 * chamada por nenhuma rota do funil de vendas).
 *
 * Troque o provedor via AI_PROVIDER=anthropic|openai em .env.local.
 * Quando o webhook do WhatsApp for implementado, ele deve chamar
 * `getAIProvider().responder(...)` em vez de falar diretamente com
 * Anthropic ou OpenAI.
 */

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
  const provider = process.env.AI_PROVIDER ?? "anthropic";

  if (provider === "openai") {
    const { openaiProvider } = require("./openai") as typeof import("./openai");
    return openaiProvider;
  }

  const { anthropicProvider } = require("./anthropic") as typeof import("./anthropic");
  return anthropicProvider;
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

Transfira para um humano quando: ${config.quandoTransferirHumano ?? "o cliente pedir explicitamente"}`;
}
