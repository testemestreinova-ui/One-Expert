"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Platform = "meta" | "google" | "tiktok" | "linkedin" | "email";
type Status = "draft" | "active" | "paused" | "finished";

interface Campaign {
  id: string;
  name: string;
  platform: Platform | null;
  status: Status;
  objective: string | null;
  budget: number | null;
  cac_target: number | null;
  ctr_target: number | null;
  metrics: Record<string, number>;
  created_at: string;
}

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bg: string; icon: string }> = {
  meta:     { label: "Meta Ads",    color: "text-blue-400",   bg: "bg-blue-400/10",   icon: "M" },
  google:   { label: "Google Ads",  color: "text-red-400",    bg: "bg-red-400/10",    icon: "G" },
  tiktok:   { label: "TikTok Ads",  color: "text-pink-400",   bg: "bg-pink-400/10",   icon: "T" },
  linkedin: { label: "LinkedIn",    color: "text-sky-400",    bg: "bg-sky-400/10",    icon: "in" },
  email:    { label: "E-mail",      color: "text-amber-400",  bg: "bg-amber-400/10",  icon: "@" },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  draft:    { label: "Rascunho", color: "text-white/50",   bg: "bg-white/5",        dot: "bg-white/30" },
  active:   { label: "Ativa",    color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  paused:   { label: "Pausada",  color: "text-amber-400",   bg: "bg-amber-400/10",   dot: "bg-amber-400" },
  finished: { label: "Encerrada", color: "text-white/30",  bg: "bg-white/5",        dot: "bg-white/20" },
};

interface Props {
  initialCampaigns: Campaign[];
  workspaceId: string;
}

export function CampanhasClient({ initialCampaigns, workspaceId }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0);

  async function updateStatus(id: string, status: Status) {
    const db = supabase as any;
    await db.from("campaigns").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  async function deleteCampaign(id: string) {
    const db = supabase as any;
    await db.from("campaigns").delete().eq("id", id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Barra superior */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
        {/* Filtros */}
        <div className="flex gap-1">
          {(["all", "active", "paused", "draft", "finished"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {s === "all" ? "Todas" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Stats rápidos */}
        <span className="text-xs text-white/30">
          {activeCampaigns} ativas · R$ {totalBudget.toLocaleString("pt-BR")} orçamento total
        </span>

        <button
          onClick={() => router.push("/chat/acquisition")}
          className="px-3 py-1.5 text-xs text-[#2ecc71] border border-[#2ecc71]/20 rounded-lg hover:bg-[#2ecc71]/10 transition-colors"
        >
          Criar com Atlas
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-xs bg-[#2ecc71] text-black font-medium rounded-lg hover:bg-[#2ecc71]/90 transition-colors"
        >
          + Nova campanha
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm text-white/40">
              {filter === "all"
                ? "Nenhuma campanha ainda. Crie uma com o Agente Atlas."
                : `Nenhuma campanha ${STATUS_CONFIG[filter as Status].label.toLowerCase()}.`}
            </p>
            <button
              onClick={() => router.push("/chat/acquisition")}
              className="mt-4 px-4 py-2 text-xs bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20 rounded-lg hover:bg-[#2ecc71]/20 transition-colors"
            >
              Criar com Agente Atlas →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                onStatusChange={updateStatus}
                onDelete={deleteCampaign}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddCampaignModal
          workspaceId={workspaceId}
          onClose={() => setShowModal(false)}
          onAdd={(c) => {
            setCampaigns((prev) => [c, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  onStatusChange,
  onDelete,
}: {
  campaign: Campaign;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const statusCfg = STATUS_CONFIG[campaign.status];
  const platformCfg = campaign.platform ? PLATFORM_CONFIG[campaign.platform] : null;

  const metrics = campaign.metrics as Record<string, number> ?? {};
  const spend = metrics.spend ?? 0;
  const leads = metrics.leads ?? 0;
  const cac = leads > 0 ? spend / leads : 0;
  const roas = metrics.roas ?? 0;

  return (
    <div
      className="group flex items-center gap-4 px-5 py-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Plataforma */}
      {platformCfg ? (
        <div className={`w-9 h-9 rounded-lg ${platformCfg.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-xs font-bold ${platformCfg.color}`}>{platformCfg.icon}</span>
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-white/20">?</span>
        </div>
      )}

      {/* Nome + objetivo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{campaign.name}</p>
        <p className="text-xs text-white/30 truncate mt-0.5">
          {campaign.objective ?? (platformCfg?.label ?? "Sem plataforma")}
        </p>
      </div>

      {/* Métricas */}
      <div className="flex gap-6 text-right flex-shrink-0">
        <div>
          <p className="text-xs text-white/30">Orçamento</p>
          <p className="text-sm font-medium text-white">
            {campaign.budget ? `R$ ${campaign.budget.toLocaleString("pt-BR")}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/30">Leads</p>
          <p className="text-sm font-medium text-white">{leads || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-white/30">CAC</p>
          <p className="text-sm font-medium text-white">
            {cac > 0 ? `R$ ${cac.toFixed(0)}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/30">ROAS</p>
          <p className={`text-sm font-medium ${roas >= 3 ? "text-emerald-400" : roas > 0 ? "text-amber-400" : "text-white"}`}>
            {roas > 0 ? `${roas.toFixed(1)}x` : "—"}
          </p>
        </div>
      </div>

      {/* Status */}
      <select
        value={campaign.status}
        onChange={(e) => onStatusChange(campaign.id, e.target.value as Status)}
        className={`text-xs font-medium px-2.5 py-1 rounded-lg border-0 outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.color}`}
        style={{ appearance: "none" }}
      >
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>

      {/* Delete */}
      {hovered && (
        <button
          onClick={() => {
            if (confirm("Excluir campanha?")) onDelete(campaign.id);
          }}
          className="p-1.5 text-white/20 hover:text-red-400 transition-colors rounded flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

function AddCampaignModal({
  workspaceId,
  onClose,
  onAdd,
}: {
  workspaceId: string;
  onClose: () => void;
  onAdd: (campaign: Campaign) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    platform: "" as Platform | "",
    objective: "",
    budget: "",
    cac_target: "",
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);

    const db = supabase as any;
    const payload: any = {
      workspace_id: workspaceId,
      name: form.name.trim(),
      platform: form.platform || null,
      objective: form.objective.trim() || null,
      budget: form.budget ? Number(form.budget) : null,
      cac_target: form.cac_target ? Number(form.cac_target) : null,
      status: "draft",
      content: {},
      metrics: {},
      generated_by: "manual",
    };

    const { data } = await db.from("campaigns").insert(payload).select().single() as { data: Campaign | null };
    if (data) onAdd(data);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Nova Campanha</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Nome da campanha *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Black Friday — Meta Ads 2025"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Plataforma</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value as Platform | "" })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20"
            >
              <option value="">Selecionar...</option>
              {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Objetivo</label>
            <input
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Ex: Gerar leads para o curso Mestre Inova"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Orçamento (R$)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Meta CAC (R$)</label>
              <input
                type="number"
                value={form.cac_target}
                onChange={(e) => setForm({ ...form, cac_target: e.target.value })}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-white/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 px-4 py-2.5 text-sm bg-[#2ecc71] text-black font-medium rounded-lg hover:bg-[#2ecc71]/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Criar campanha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
