import Link from "next/link";
import { AGENT_CONFIG } from "@/lib/utils/constants";

const agentColors: Record<string, string> = {
  acquisition: "border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5",
  content: "border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/5",
  sales: "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5",
};

const agentDescriptions: Record<string, string> = {
  acquisition:
    "Análise de tráfego pago, CAC, ROAS, campanhas no Meta e Google Ads, estratégias de aquisição.",
  content:
    "Roteiros para Reels, copywriting, calendário editorial, scripts de aula e posts de autoridade.",
  sales:
    "Gestão de leads, follow-up, scripts de vendas, análise de conversão e CRM inteligente.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5">
        <h1 className="text-base font-semibold text-white">Chat com IA</h1>
        <p className="text-sm text-white/40 mt-0.5">Converse com os agentes especializados do UNE Expert</p>
      </div>

      {/* Agent selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white">Como posso ajudar?</h2>
            <p className="text-white/40 text-sm">Escolha um agente especializado para começar</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(Object.entries(AGENT_CONFIG) as [string, typeof AGENT_CONFIG[keyof typeof AGENT_CONFIG]][]).map(
              ([key, agent]) => (
                <Link
                  key={key}
                  href={`/chat/${key}`}
                  className={`group flex flex-col gap-4 p-5 bg-[#111111] border rounded-2xl transition-all animate-fade-in ${agentColors[key]}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${agent.color}18` }}
                    >
                      {agent.icon}
                    </div>
                    <svg
                      className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors mt-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.333 8h9.334M8 3.333 12.667 8 8 12.667" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-white text-sm">{agent.name}</div>
                    <div className="text-xs font-medium" style={{ color: agent.color }}>
                      {agent.subtitle}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mt-2">
                      {agentDescriptions[key]}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-white/25">
              Powered by Claude Sonnet · Memória persistente por workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
