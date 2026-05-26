import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient, MODELS } from "@/lib/ai/claude";
import { AGENT_PROMPTS } from "@/lib/ai/agents";
import type { AgentType } from "@/types/database.types";

export const runtime = "nodejs";
export const maxDuration = 60;

const encode = (text: string) => new TextEncoder().encode(text);
const sse = (data: Record<string, unknown>) => encode(`data: ${JSON.stringify(data)}\n\n`);

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { message, agentType, conversationId } = body as {
    message: string;
    agentType: AgentType;
    conversationId?: string;
  };

  if (!message?.trim() || !agentType) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  if (!AGENT_PROMPTS[agentType]) {
    return NextResponse.json({ error: "Tipo de agente inválido" }, { status: 400 });
  }

  // Supabase JS 2.x has type inference issues with manually-written Database types.
  // Using `any` cast here is intentional — runtime is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Admin client bypassa RLS para lookup do workspace (a política workspace_members_select
  // tem auto-referência circular — fix permanente está no SQL abaixo)
  const admin = createAdminClient() as any;
  const { data: memberships } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1) as { data: Array<{ workspace_id: string }> | null };

  const workspaceId = memberships?.[0]?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 400 });
  }

  // Cria ou reutiliza conversa
  let convId = conversationId;
  if (!convId) {
    const title = message.slice(0, 80).trim();
    const { data: conv, error: convErr } = await db
      .from("conversations")
      .insert({ workspace_id: workspaceId, user_id: user.id, agent_type: agentType, title, status: "active" })
      .select("id")
      .single() as { data: { id: string } | null; error: unknown };

    if (convErr || !conv) {
      return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 });
    }
    convId = conv.id;
  }

  // Busca histórico recente
  const { data: history } = await db
    .from("messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(30) as { data: Array<{ role: string; content: string }> | null };

  // Salva mensagem do usuário
  await db.from("messages").insert({
    conversation_id: convId,
    role: "user",
    content: message.trim(),
  });

  // Sem API key configurada — retorna aviso amigável
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("sua_chave")) {
    const warningStream = new ReadableStream({
      start(controller) {
        controller.enqueue(sse({ type: "start", conversationId: convId }));
        controller.enqueue(
          sse({
            type: "chunk",
            content:
              "⚠️ **Chave da API Anthropic não configurada.**\n\nAdicione sua `ANTHROPIC_API_KEY` no arquivo `.env.local` para ativar os agentes de IA.\n\n```\nANTHROPIC_API_KEY=sk-ant-...\n```",
          })
        );
        controller.enqueue(sse({ type: "done" }));
        controller.close();
      },
    });
    return new Response(warningStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
    });
  }

  // Stream da resposta do agente via Claude
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        controller.enqueue(sse({ type: "start", conversationId: convId }));

        const anthropic = getAnthropicClient();
        const claudeStream = await anthropic.messages.create({
          model: MODELS.MAIN,
          max_tokens: 2048,
          system: AGENT_PROMPTS[agentType],
          messages: [
            ...(history ?? []).map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: message.trim() },
          ],
          stream: true,
        });

        for await (const chunk of claudeStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            fullContent += text;
            controller.enqueue(sse({ type: "chunk", content: text }));
          }
        }

        // Persiste resposta do agente
        if (fullContent) {
          await db.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: fullContent,
          });
        }

        controller.enqueue(sse({ type: "done", conversationId: convId }));
      } catch (err) {
        let msg = err instanceof Error ? err.message : "Erro desconhecido";
        if (msg.includes("credit balance") || msg.includes("insufficient_quota")) {
          msg = "Saldo insuficiente na conta Anthropic. Adicione créditos em console.anthropic.com.";
        } else if (msg.includes("authentication")) {
          msg = "Chave da API Anthropic inválida. Verifique ANTHROPIC_API_KEY no .env.local.";
        }
        controller.enqueue(sse({ type: "error", message: msg }));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
