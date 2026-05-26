"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { AGENT_CONFIG } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database.types";

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside className="w-[220px] flex-shrink-0 h-full bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-[18px] border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#2ecc71] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-[13px] leading-none">U</span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white leading-tight">UNE Expert</div>
            <div className="text-[11px] text-[#2ecc71] leading-tight">Business</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto">
        <NavItem href="/chat" label="Chat com IA" active={active("/chat")}>
          <IconChat />
        </NavItem>

        {/* Agent sub-items */}
        <div className="pl-2 space-y-px">
          {(Object.entries(AGENT_CONFIG) as [string, typeof AGENT_CONFIG[keyof typeof AGENT_CONFIG]][]).map(
            ([key, agent]) => (
              <Link
                key={key}
                href={`/chat/${key}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all",
                  pathname === `/chat/${key}`
                    ? "text-white/80 bg-white/[0.05]"
                    : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: agent.color }}
                />
                <span>{agent.name}</span>
                <span className="text-[10px] text-white/20 truncate">{agent.subtitle}</span>
              </Link>
            )
          )}
        </div>

        <Divider />

        <NavItem href="/campanhas" label="Campanhas" active={active("/campanhas")}>
          <IconCampaign />
        </NavItem>
        <NavItem href="/conteudo" label="Conteúdo" active={active("/conteudo")}>
          <IconContent />
        </NavItem>
        <NavItem href="/leads" label="Leads" active={active("/leads")}>
          <IconLeads />
        </NavItem>
        <NavItem href="/metricas" label="Métricas" active={active("/metricas")}>
          <IconMetrics />
        </NavItem>

        <Divider />

        <NavItem href="/configuracoes" label="Configurações" active={active("/configuracoes")}>
          <IconSettings />
        </NavItem>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] text-white/60 font-medium">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/70 truncate">
              {profile?.full_name ?? "Usuário"}
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sair"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-white/25 hover:text-white/55 flex-shrink-0"
          >
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all",
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
      )}
    >
      <span className="w-4 h-4 flex-shrink-0">{children}</span>
      {label}
    </Link>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.06] my-1.5 mx-1" />;
}

function IconChat() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4L1.333 14.667V3.333A1.333 1.333 0 0 1 2.667 2h10A1.333 1.333 0 0 1 14 3.333z" />
    </svg>
  );
}

function IconCampaign() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5.333H2.667A.667.667 0 0 0 2 6v4a.667.667 0 0 0 .667.667H4L4 13.333" />
      <path d="M12 2C12 2 14 4.667 14 8s-2 6-2 6" />
      <path d="M12 5.333C12 5.333 13.333 6.444 13.333 8s-1.333 2.667-1.333 2.667" />
    </svg>
  );
}

function IconContent() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.333 1.333H4A1.333 1.333 0 0 0 2.667 2.667v10.666A1.333 1.333 0 0 0 4 14.667h8a1.333 1.333 0 0 0 1.333-1.334V5.333z" />
      <path d="M9.333 1.333v4h4M5.333 8.667h5.334M5.333 11.333h5.334M5.333 6h2" />
    </svg>
  );
}

function IconLeads() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.667 14v-1.333A2.667 2.667 0 0 0 8 10H3.333A2.667 2.667 0 0 0 .667 12.667V14" />
      <circle cx="5.667" cy="5.333" r="2.667" />
      <path d="M15.333 14v-1.333a2.667 2.667 0 0 0-2-2.58M10.667 2.087a2.667 2.667 0 0 1 0 5.16" />
    </svg>
  );
}

function IconMetrics() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.333 12L5.333 8 8.667 10.667 14.667 4" />
      <path d="M11.333 4h3.334v3.333" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.333v1.334M8 13.333v1.334M3.757 3.757l.943.943M11.3 11.3l.943.943M1.333 8h1.334M13.333 8h1.334M3.757 12.243l.943-.943M11.3 4.7l.943-.943" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M6 14H3.333A1.333 1.333 0 0 1 2 12.667V3.333A1.333 1.333 0 0 1 3.333 2H6M10.667 11.333 14 8l-3.333-3.333M14 8H6" />
    </svg>
  );
}
