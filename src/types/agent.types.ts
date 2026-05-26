import type { AgentType } from "./database.types";

export type { AgentType };

export interface AgentDefinition {
  id: AgentType;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  systemPrompt: string;
  capabilities: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentType?: AgentType;
  createdAt?: string;
}

export interface StreamChunk {
  chunk: string;
  agentType: AgentType;
}

export interface OrchestrateParams {
  message: string;
  workspaceId: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  onStream: (chunk: string, agentType: AgentType) => void;
}

export interface OrchestrateResult {
  response: string;
  agentType: AgentType;
}

export interface MemoryEntry {
  type: "fact" | "preference" | "summary";
  content: string;
}
