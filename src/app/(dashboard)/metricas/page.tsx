import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MetricasClient } from "@/components/metricas/MetricasClient";

export const dynamic = "force-dynamic";

export default async function MetricasPage() {
  const supabase = await createClient();
  const admin = createAdminClient() as any;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberships } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1) as { data: Array<{ workspace_id: string }> | null };

  const workspaceId = memberships?.[0]?.workspace_id ?? null;

  // Busca métricas dos últimos 30 dias
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().split("T")[0];

  const { data: metrics } = workspaceId
    ? await supabase
        .from("metrics")
        .select("*")
        .eq("workspace_id", workspaceId)
        .gte("date", sinceStr)
        .order("date", { ascending: false })
    : { data: [] };

  // Busca leads para contagens
  const { data: leads } = workspaceId
    ? await supabase
        .from("leads")
        .select("status, score, created_at")
        .eq("workspace_id", workspaceId)
    : { data: [] };

  // Busca campanhas ativas
  const { data: campaigns } = workspaceId
    ? await supabase
        .from("campaigns")
        .select("status, budget, metrics")
        .eq("workspace_id", workspaceId)
    : { data: [] };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-8 py-5 flex-shrink-0">
        <h1 className="text-base font-semibold text-white">Métricas</h1>
        <p className="text-sm text-white/40 mt-0.5">
          KPIs e performance do seu negócio em tempo real
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MetricasClient
          metrics={(metrics as any[]) ?? []}
          leads={(leads as any[]) ?? []}
          campaigns={(campaigns as any[]) ?? []}
          workspaceId={workspaceId ?? ""}
        />
      </div>
    </div>
  );
}
