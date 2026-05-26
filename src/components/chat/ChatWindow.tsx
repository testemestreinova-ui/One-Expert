"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils/cn";
import { AGENT_CONFIG } from "@/lib/utils/constants";
import type { AgentType } from "@/types/database.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface ChatWindowProps {
  agentType: AgentType;
  initialConversationId?: string;
}

export function ChatWindow({ agentType, initialConversationId }: ChatWindowProps) {
  const agent = AGENT_CONFIG[agentType];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function adjustTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, agentType, conversationId }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const data = JSON.parse(raw);
            if (data.type === "start" && data.conversationId) {
              setConversationId(data.conversationId);
            } else if (data.type === "chunk") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            } else if (data.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, streaming: false } : m
                )
              );
            } else if (data.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: `Erro: ${data.message}`,
                        streaming: false,
                      }
                    : m
                )
              );
            }
          } catch {
            // ignore malformed SSE line
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Não consegui processar sua mensagem. Tente novamente.",
                streaming: false,
              }
            : m
        )
      );
    }

    setIsLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full pb-16 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${agent.color}15` }}
            >
              {agent.icon}
            </div>
            <p className="text-base font-medium text-white mb-1">Olá! Sou o {agent.name}.</p>
            <p className="text-sm text-white/40 text-center max-w-xs">
              {agentWelcome[agentType]}
            </p>

            {/* Suggestion pills */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
              {agentSuggestions[agentType].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.07] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} agent={agent} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-6 py-4">
        <div
          className={cn(
            "flex items-end gap-3 bg-[#111111] border rounded-2xl px-4 py-3 transition-all",
            isLoading ? "border-white/[0.06]" : "border-white/[0.08] focus-within:border-white/[0.15]"
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunte algo para o ${agent.name}...`}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white/85 placeholder:text-white/25 outline-none resize-none disabled:cursor-not-allowed leading-relaxed"
            style={{ maxHeight: "160px" }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
              input.trim() && !isLoading
                ? "bg-[#2ecc71] hover:bg-[#27ae60] text-black"
                : "bg-white/[0.06] text-white/20 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.667 1.333 7.333 8.667M14.667 1.333 10 14.667l-2.667-6L1.333 6z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-2">
          {agent.name} · {agent.subtitle} · Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  agent,
}: {
  message: Message;
  agent: (typeof AGENT_CONFIG)[AgentType];
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5",
          isUser ? "bg-white/[0.08] text-white/60" : ""
        )}
        style={!isUser ? { backgroundColor: `${agent.color}20` } : undefined}
      >
        {isUser ? "V" : agent.icon}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-white/[0.06] text-white/85 text-sm leading-relaxed"
            : "bg-[#111111] border border-white/[0.06]"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="agent-prose">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : null}
            {message.streaming && !message.content && (
              <span className="inline-flex gap-1 items-center py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-subtle" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-subtle"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-subtle"
                  style={{ animationDelay: "0.4s" }}
                />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const agentWelcome: Record<AgentType, string> = {
  acquisition:
    "Estou pronto para analisar suas campanhas, diagnosticar métricas e maximizar seu ROAS.",
  content: "Posso criar roteiros para Reels, copys de alta conversão e seu calendário editorial.",
  sales: "Vou ajudar a qualificar leads, construir scripts de venda e aumentar sua conversão.",
};

const agentSuggestions: Record<AgentType, string[]> = {
  acquisition: [
    "Analise meu CAC de R$ 45 no Meta Ads",
    "Como otimizar campanhas para professores?",
    "Qual o ROAS ideal para edtech?",
  ],
  content: [
    "Crie um roteiro de Reels sobre inovação pedagógica",
    "Escreva uma sequência de 5 e-mails de nurturing",
    "Monte um calendário editorial para o mês",
  ],
  sales: [
    "Crie um script de WhatsApp para leads frios",
    "Como contornar a objeção 'é caro'?",
    "Monte um funil de 7 dias de follow-up",
  ],
};
