import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CampanhasClient } from "@/components/campanhas/CampanhasClient";

export const dynamic = "force-dynamic";

export default async function CampanhasPage() {
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

  const { data: campaigns } = workspaceId
    ? await supabase
        .from("campaigns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-8 py-5 flex-shrink-0">
        <h1 className="text-base font-semibold text-white">Campanhas</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Gerencie suas campanhas de tráfego pago com o Agente Atlas
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <CampanhasClient
          initialCampaigns={(campaigns as any[]) ?? []}
          workspaceId={workspaceId ?? ""}
        />
      </div>
    </div>
  );
}
