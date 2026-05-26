"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  score: number;
  notes: string | null;
  tags: string[];
  created_at: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "text-sky-400", bg: "bg-sky-400/10" },
  contacted: { label: "Contactado", color: "text-blue-400", bg: "bg-blue-400/10" },
  qualified: { label: "Qualificado", color: "text-amber-400", bg: "bg-amber-400/10" },
  converted: { label: "Convertido", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  lost: { label: "Perdido", color: "text-red-400", bg: "bg-red-400/10" },
};

const SOURCE_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  google: "Google",
  organic: "Orgânico",
  referral: "Indicação",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
};

interface Props {
  initialLeads: Lead[];
  workspaceId: string;
}

export function LeadsClient({ initialLeads, workspaceId }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    const supabase = createClient();
    await (supabase as any).from("leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este lead?")) return;
    setDeletingId(id);
    const supabase = createClient();
    await (supabase as any).from("leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  }

  function onLeadAdded(lead: Lead) {
    setLeads((prev) => [lead, ...prev]);
    setShowModal(false);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of Object.keys(STATUS_CONFIG)) {
      c[s] = leads.filter((l) => l.status === s).length;
    }
    return c;
  }, [leads]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-8 py-4 flex items-center gap-3 border-b border-white/[0.06]">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="5" /><path d="m10.5 10.5 3 3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-white/[0.15] transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {([["all", "Todos"], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])] as [string, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as LeadStatus | "all")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  statusFilter === key
                    ? "bg-white/[0.1] text-white"
                    : "text-white/40 hover:text-white/65 hover:bg-white/[0.05]"
                )}
              >
                {label}
                <span className="ml-1.5 text-white/30">{counts[key] ?? 0}</span>
              </button>
            )
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/chat/sales"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all"
          >
            <span>🎯</span> Perguntar ao Nexus
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#2ecc71] hover:bg-[#27ae60] text-black transition-colors"
          >
            <span>+</span> Novo Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="text-3xl">👥</div>
            <p className="text-sm font-medium text-white/50">
              {leads.length === 0 ? "Nenhum lead cadastrado ainda" : "Nenhum lead encontrado"}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-sm text-white/70 transition-all"
              >
                Adicionar primeiro lead
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/[0.06]">
                <th className="pb-3 font-medium text-white/35 pr-6">Nome</th>
                <th className="pb-3 font-medium text-white/35 pr-6">Contato</th>
                <th className="pb-3 font-medium text-white/35 pr-6">Origem</th>
                <th className="pb-3 font-medium text-white/35 pr-6">Status</th>
                <th className="pb-3 font-medium text-white/35 pr-6 w-32">Score</th>
                <th className="pb-3 font-medium text-white/35 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((lead) => {
                const st = STATUS_CONFIG[lead.status];
                return (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-6">
                      <div className="font-medium text-white/85">{lead.name}</div>
                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded text-white/40">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pr-6">
                      <div className="text-white/55">{lead.email ?? "—"}</div>
                      {lead.phone && <div className="text-white/35 text-xs mt-0.5">{lead.phone}</div>}
                    </td>
                    <td className="py-3.5 pr-6">
                      <span className="text-white/45">
                        {lead.source ? SOURCE_LABELS[lead.source] ?? lead.source : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-lg border-0 outline-none cursor-pointer",
                          st.bg, st.color
                        )}
                        style={{ backgroundColor: "transparent" }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k} className="bg-[#1a1a1a] text-white">
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${lead.score}%`,
                              backgroundColor: lead.score >= 70 ? "#10b981" : lead.score >= 40 ? "#f59e0b" : "#6b7280",
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/40 w-6 text-right">{lead.score}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={deletingId === lead.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary bar */}
      {leads.length > 0 && (
        <div className="border-t border-white/[0.06] px-8 py-3 flex items-center gap-6">
          <span className="text-xs text-white/30">{filtered.length} de {leads.length} leads</span>
          <div className="flex gap-4">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => counts[k] > 0 && (
              <span key={k} className={cn("text-xs", v.color)}>
                {v.label}: {counts[k]}
              </span>
            ))}
          </div>
          {leads.length > 0 && (
            <span className="ml-auto text-xs text-white/30">
              Score médio: {Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length)}
            </span>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showModal && (
        <AddLeadModal
          workspaceId={workspaceId}
          onClose={() => setShowModal(false)}
          onAdded={onLeadAdded}
        />
      )}
    </div>
  );
}

function AddLeadModal({
  workspaceId,
  onClose,
  onAdded,
}: {
  workspaceId: string;
  onClose: () => void;
  onAdded: (lead: Lead) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "new" as LeadStatus,
    score: 50,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: err } = await (supabase as any)
      .from("leads")
      .insert({
        workspace_id: workspaceId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source || null,
        status: form.status,
        score: form.score,
        notes: form.notes.trim() || null,
      })
      .select("*")
      .single();

    if (err) {
      setError("Erro ao adicionar lead. Tente novamente.");
      setLoading(false);
      return;
    }

    onAdded(data as Lead);
  }

  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/[0.2] transition-all";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Novo Lead</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4 4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/45">Nome *</label>
            <input
              type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome completo" required className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/45">E-mail</label>
              <input
                type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com" className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/45">WhatsApp</label>
              <input
                type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999" className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/45">Origem</label>
              <select
                value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={cn(inputClass, "cursor-pointer")}
              >
                <option value="">Selecionar...</option>
                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#1a1a1a]">{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/45">Status</label>
              <select
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                className={cn(inputClass, "cursor-pointer")}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#1a1a1a]">{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/45">Score de qualificação</label>
              <span className="text-xs font-semibold text-white/70">{form.score}/100</span>
            </div>
            <input
              type="range" min={0} max={100} value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="w-full accent-[#2ecc71] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/45">Observações</label>
            <textarea
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contexto sobre o lead..."
              rows={2}
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#2ecc71] hover:bg-[#27ae60] disabled:opacity-50 text-black transition-colors"
            >
              {loading ? "Salvando..." : "Adicionar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
