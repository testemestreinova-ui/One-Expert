import { getAnthropicClient, MODELS } from "./claude";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AgentType } from "@/types/database.types";

interface Memory {
  id: string;
  memory_type: "summary" | "fact" | "preference";
  content: string;
  relevance: number;
}

export async function fetchMemories(
  workspaceId: string,
  agentType: AgentType,
  limit = 30
): Promise<Memory[]> {
  const admin = createAdminClient() as any;
  const now = new Date().toISOString();

  const { data } = await admin
    .from("agent_memories")
    .select("id, memory_type, content, relevance")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", agentType)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("relevance", { ascending: false })
    .limit(limit);

  return (data ?? []) as Memory[];
}

export function formatMemoriesForPrompt(memories: Memory[]): string {
  if (memories.length === 0) return "";

  const facts = memories.filter((m) => m.memory_type === "fact");
  const prefs = memories.filter((m) => m.memory_type === "preference");
  const summaries = memories.filter((m) => m.memory_type === "summary");

  const lines: string[] = [
    "",
    "---",
    "MEMÓRIAS (aprendidas em conversas anteriores com este usuário):",
  ];

  if (facts.length > 0) {
    lines.push("\nFATOS DO NEGÓCIO:");
    facts.forEach((m) => lines.push(`• ${m.content}`));
  }
  if (prefs.length > 0) {
    lines.push("\nPREFERÊNCIAS DO USUÁRIO:");
    prefs.forEach((m) => lines.push(`• ${m.content}`));
  }
  if (summaries.length > 0) {
    lines.push("\nCONVERSAS ANTERIORES:");
    summaries.forEach((m) => lines.push(`• ${m.content}`));
  }

  lines.push(
    "---",
    "Use essas memórias para personalizar suas respostas. Não mencione que está usando memórias a menos que o usuário pergunte diretamente."
  );

  return lines.join("\n");
}

// Extrai e salva memórias novas da conversa — chamado em background, não bloqueia o stream
export async function extractAndSaveMemories(
  workspaceId: string,
  agentType: AgentType,
  conversation: Array<{ role: string; content: string }>
): Promise<void> {
  if (conversation.length < 2) return;

  try {
    const anthropic = getAnthropicClient();

    const recentTurns = conversation.slice(-8);
    const dialogText = recentTurns
      .map((m) => `${m.role === "user" ? "Usuário" : "Agente"}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `Analise a conversa abaixo e extraia apenas informações NOVAS e RELEVANTES para memorizar sobre o usuário ou negócio dele.

Retorne um JSON com este formato exato:
{"memories": [{"type": "fact|preference|summary", "content": "texto conciso max 200 chars", "relevance": 0.1-1.0}]}

Tipos:
- "fact": dado concreto do negócio (métrica, produto, público, orçamento, resultado real)
- "preference": como o usuário prefere trabalhar (formato, nível de detalhe, tom, ferramenta favorita)
- "summary": tópico estratégico importante discutido (decisão, problema ou plano relevante)

Regras:
- Extraia no máximo 4 memórias por conversa
- Só memorize o que for realmente útil em conversas futuras
- Se não houver nada relevante, retorne {"memories": []}
- Retorne APENAS o JSON, nenhum texto adicional

CONVERSA:
${dialogText}`;

    const response = await anthropic.messages.create({
      model: MODELS.FAST,
      max_tokens: 600,
      messages: [{ role: "user", content: extractionPrompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const parsed = JSON.parse(jsonMatch[0]);
    const memories: Array<{ type: string; content: string; relevance: number }> =
      parsed.memories ?? [];

    if (memories.length === 0) return;

    const admin = createAdminClient() as any;
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    for (const mem of memories.slice(0, 4)) {
      if (!mem.content?.trim() || !["fact", "preference", "summary"].includes(mem.type)) continue;

      await admin.from("agent_memories").insert({
        workspace_id: workspaceId,
        agent_type: agentType,
        memory_type: mem.type,
        content: mem.content.trim().slice(0, 500),
        relevance: Math.min(1.0, Math.max(0.1, Number(mem.relevance) || 0.5)),
        // Summaries expiram em 30 dias; facts e preferences são permanentes
        expires_at: mem.type === "summary" ? thirtyDays : null,
      });
    }
  } catch {
    // Extração de memória é best-effort — nunca bloqueia o fluxo principal
  }
}
