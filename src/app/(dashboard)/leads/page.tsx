import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LeadsClient } from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const admin = createAdminClient() as any;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Workspace via admin (bypassa RLS circular)
  const { data: memberships } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1) as { data: Array<{ workspace_id: string }> | null };

  const workspaceId = memberships?.[0]?.workspace_id ?? null;

  // Leads via RLS normal (policy usa is_workspace_member SECURITY DEFINER)
  const { data: leads } = workspaceId
    ? await supabase
        .from("leads")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-8 py-5 flex-shrink-0">
        <h1 className="text-base font-semibold text-white">Leads</h1>
        <p className="text-sm text-white/40 mt-0.5">
          CRM inteligente gerenciado pelo Agente Nexus
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <LeadsClient
          initialLeads={(leads as any[]) ?? []}
          workspaceId={workspaceId ?? ""}
        />
      </div>
    </div>
  );
}
