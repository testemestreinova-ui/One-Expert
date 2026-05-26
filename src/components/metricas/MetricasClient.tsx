"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface MetricRow {
  id: string;
  date: string;
  metric_type: string;
  value: number;
  platform: string | null;
}

interface LeadRow {
  status: string;
  score: number;
  created_at: string;
}

interface CampaignRow {
  status: string;
  budget: number | null;
  metrics: Record<string, number>;
}

interface Props {
  metrics: MetricRow[];
  leads: LeadRow[];
  campaigns: CampaignRow[];
  workspaceId: string;
}

function kpiValue(metrics: MetricRow[], type: string): number {
  const rows = metrics.filter((m) => m.metric_type === type);
  if (rows.length === 0) return 0;
  return rows.reduce((sum, m) => sum + m.value, 0) / rows.length;
}

function kpiSum(metrics: MetricRow[], type: string): number {
  return metrics.filter((m) => m.metric_type === type).reduce((sum, m) => sum + m.value, 0);
}

export function MetricasClient({ metrics, leads, campaigns }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState<"7d" | "30d">("30d");

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - (period === "7d" ? 7 : 30));

  const filteredMetrics = useMemo(
    () => metrics.filter((m) => new Date(m.date) >= cutoff),
    [metrics, period]
  );

  const filteredLeads = useMemo(
    () => leads.filter((l) => new Date(l.created_at) >= cutoff),
    [leads, period]
  );

  // KPIs calculados
  const totalLeads = leads.length;
  const newLeads = filteredLeads.length;
  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.length)
    : 0;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);

  const cacAvg = kpiValue(filteredMetrics, "cac");
  const cplAvg = kpiValue(filteredMetrics, "cpl");
  const roasAvg = kpiValue(filteredMetrics, "roas");
  const ctrAvg = kpiValue(filteredMetrics, "ctr");
  const spend = kpiSum(filteredMetrics, "spend");

  // Pipeline de leads
  const leadsByStatus = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  const hasData = totalLeads > 0 || metrics.length > 0 || campaigns.length > 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header com período */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
          {(["7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              {p === "7d" ? "7 dias" : "30 dias"}
            </button>
          ))}
        </div>

        {!hasData && (
          <button
            onClick={() => router.push("/chat/acquisition")}
            className="text-xs text-[#2ecc71] hover:underline"
          >
            Conectar dados com Atlas →
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="Total de Leads"
          value={totalLeads.toString()}
          sub={`+${newLeads} nos últimos ${period === "7d" ? "7" : "30"} dias`}
          color="emerald"
          icon="👥"
        />
        <KPICard
          label="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          sub={`${convertedLeads} convertidos`}
          color={conversionRate >= 5 ? "emerald" : conversionRate >= 2 ? "amber" : "red"}
          icon="🎯"
        />
        <KPICard
          label="Score Médio"
          value={avgScore.toString()}
          sub="de 0 a 100"
          color={avgScore >= 70 ? "emerald" : avgScore >= 40 ? "amber" : "neutral"}
          icon="⭐"
        />
        <KPICard
          label="Campanhas Ativas"
          value={activeCampaigns.length.toString()}
          sub={totalBudget > 0 ? `R$ ${totalBudget.toLocaleString("pt-BR")} orçamento` : "Sem orçamento"}
          color="blue"
          icon="📢"
        />
      </div>

      {/* Ads KPIs */}
      {(cacAvg > 0 || cplAvg > 0 || roasAvg > 0 || ctrAvg > 0) ? (
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-4">Performance de Anúncios</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard label="CAC médio" value={`R$ ${cacAvg.toFixed(0)}`} sub="Custo por aquisição" color="neutral" icon="💸" />
            <KPICard label="CPL médio" value={`R$ ${cplAvg.toFixed(0)}`} sub="Custo por lead" color="neutral" icon="💰" />
            <KPICard label="ROAS médio" value={`${roasAvg.toFixed(1)}x`} sub="Retorno sobre gasto" color={roasAvg >= 3 ? "emerald" : "amber"} icon="📈" />
            <KPICard label="CTR médio" value={`${ctrAvg.toFixed(2)}%`} sub="Taxa de clique" color="neutral" icon="🖱️" />
          </div>
          {spend > 0 && (
            <p className="mt-3 text-xs text-white/30">
              Total investido no período: R$ {spend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      ) : null}

      {/* Pipeline de Leads */}
      <div>
        <h2 className="text-sm font-medium text-white/50 mb-4">Pipeline de Leads</h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
          {[
            { key: "new",       label: "Novos",       color: "bg-sky-500",     count: leadsByStatus.new },
            { key: "contacted", label: "Contatados",  color: "bg-blue-500",    count: leadsByStatus.contacted },
            { key: "qualified", label: "Qualificados",color: "bg-amber-500",   count: leadsByStatus.qualified },
            { key: "converted", label: "Convertidos", color: "bg-emerald-500", count: leadsByStatus.converted },
            { key: "lost",      label: "Perdidos",    color: "bg-red-500/60",  count: leadsByStatus.lost },
          ].map(({ key, label, color, count }) => {
            const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-24 text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-white/60 w-8 flex-shrink-0">{count}</span>
                <span className="text-xs text-white/20 w-10 flex-shrink-0 text-right">
                  {pct > 0 ? `${pct.toFixed(0)}%` : ""}
                </span>
              </div>
            );
          })}

          {totalLeads === 0 && (
            <p className="text-center text-xs text-white/20 py-4">
              Nenhum lead ainda.{" "}
              <button onClick={() => router.push("/leads")} className="text-[#2ecc71] hover:underline">
                Adicionar leads →
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Empty state completo */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-base font-semibold text-white mb-2">Sem dados ainda</h3>
          <p className="text-sm text-white/30 max-w-xs leading-relaxed">
            Adicione leads, crie campanhas ou registre métricas para ver seu painel em ação.
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => router.push("/leads")}
              className="px-4 py-2 text-xs bg-white/5 text-white/60 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Ir para Leads
            </button>
            <button
              onClick={() => router.push("/chat/acquisition")}
              className="px-4 py-2 text-xs bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20 rounded-lg hover:bg-[#2ecc71]/20 transition-colors"
            >
              Falar com Atlas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type KPIColor = "emerald" | "amber" | "red" | "blue" | "neutral";

function KPICard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: KPIColor;
  icon: string;
}) {
  const colorMap: Record<KPIColor, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    blue: "text-blue-400",
    neutral: "text-white",
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/30">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-semibold ${colorMap[color]} mb-1`}>{value}</p>
      <p className="text-xs text-white/25">{sub}</p>
    </div>
  );
}
