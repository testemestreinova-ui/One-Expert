import type { AgentType } from "@/types/database.types";

export const AGENT_CONFIG: Record<
  AgentType,
  { name: string; subtitle: string; icon: string; color: string; colorClass: string }
> = {
  acquisition: {
    name: "Atlas",
    subtitle: "Tráfego & Aquisição",
    icon: "📡",
    color: "#3b82f6",
    colorClass: "text-blue-400",
  },
  content: {
    name: "Vox",
    subtitle: "Conteúdo & Autoridade",
    icon: "✍️",
    color: "#8b5cf6",
    colorClass: "text-violet-400",
  },
  sales: {
    name: "Nexus",
    subtitle: "Vendas & Relacionamento",
    icon: "🎯",
    color: "#10b981",
    colorClass: "text-emerald-400",
  },
};

export const APP_NAME = "UNE Expert Business";

export const PLANS = {
  starter: { label: "Starter", price: 47.9 },
  plus: { label: "Plus", price: 67.9 },
  ultra: { label: "Ultra", price: 107.9 },
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CHAT: "/chat",
  CAMPANHAS: "/campanhas",
  CONTEUDO: "/conteudo",
  LEADS: "/leads",
  METRICAS: "/metricas",
  CONFIGURACOES: "/configuracoes",
} as const;
