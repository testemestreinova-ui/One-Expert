import type { AgentType } from "./database.types";

// Corpo da requisição POST /api/chat
export interface ChatRequest {
  message: string;
  conversationId: string;
  workspaceId: string;
}

// Corpo da requisição POST /api/agents
export interface AgentRequest {
  agentType: AgentType;
  action: string;
  payload: Record<string, unknown>;
  workspaceId: string;
}

// Resposta padrão de erros da API
export interface ApiError {
  error: string;
  code?: string;
}

// Resultado de Server Actions
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
