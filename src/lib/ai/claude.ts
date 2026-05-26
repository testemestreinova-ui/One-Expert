import Anthropic from "@anthropic-ai/sdk";

// Instância singleton do cliente Anthropic — só usada no servidor
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não está definida nas variáveis de ambiente.");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

// Modelos disponíveis
export const MODELS = {
  // Modelo principal — respostas dos agentes (inteligente + rápido)
  MAIN: "claude-sonnet-4-6" as const,
  // Modelo leve — classificação de intenção, extração de memória (barato)
  FAST: "claude-haiku-4-5-20251001" as const,
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];
