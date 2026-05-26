import { notFound } from "next/navigation";
import { AGENT_CONFIG } from "@/lib/utils/constants";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { AgentType } from "@/types/database.types";

interface Props {
  params: Promise<{ agent: string }>;
}

const VALID_AGENTS: AgentType[] = ["acquisition", "content", "sales"];

export default async function AgentChatPage({ params }: Props) {
  const { agent } = await params;

  if (!VALID_AGENTS.includes(agent as AgentType)) notFound();

  const agentType = agent as AgentType;
  const config = AGENT_CONFIG[agentType];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${config.color}15` }}
        >
          {config.icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{config.name}</div>
          <div className="text-xs font-medium" style={{ color: config.color }}>
            {config.subtitle}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] animate-pulse" />
          <span className="text-xs text-white/35">Online</span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow agentType={agentType} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return VALID_AGENTS.map((agent) => ({ agent }));
}
