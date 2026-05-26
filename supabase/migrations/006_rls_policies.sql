-- =============================================
-- MIGRATION 006 — ROW LEVEL SECURITY (RLS)
-- =============================================
-- RLS garante que cada usuário só veja dados
-- dos workspaces aos quais pertence.
-- Regra central: workspace_isolation.

-- Habilita RLS em todas as tabelas
alter table public.profiles        enable row level security;
alter table public.workspaces      enable row level security;
alter table public.workspace_members enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.agent_memories  enable row level security;
alter table public.campaigns       enable row level security;
alter table public.contents        enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_interactions enable row level security;
alter table public.metrics         enable row level security;

-- -----------------------------------------------
-- PROFILES
-- -----------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- -----------------------------------------------
-- WORKSPACES
-- -----------------------------------------------
drop policy if exists "workspaces_select_member" on public.workspaces;
create policy "workspaces_select_member"
  on public.workspaces for select
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- -----------------------------------------------
-- WORKSPACE MEMBERS
-- -----------------------------------------------
-- Política simplificada sem auto-referência circular (evita infinite recursion)
drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select"
  on public.workspace_members for select
  using (user_id = auth.uid());

-- -----------------------------------------------
-- Função auxiliar reutilizada em todas as políticas
-- de tabelas com workspace_id
-- -----------------------------------------------
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- -----------------------------------------------
-- CONVERSATIONS
-- -----------------------------------------------
drop policy if exists "conversations_workspace_isolation" on public.conversations;
create policy "conversations_workspace_isolation"
  on public.conversations for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- -----------------------------------------------
-- MESSAGES
-- -----------------------------------------------
drop policy if exists "messages_via_conversation" on public.messages;
create policy "messages_via_conversation"
  on public.messages for all
  using (
    conversation_id in (
      select id from public.conversations
      where public.is_workspace_member(workspace_id)
    )
  );

-- -----------------------------------------------
-- AGENT MEMORIES
-- -----------------------------------------------
drop policy if exists "agent_memories_workspace_isolation" on public.agent_memories;
create policy "agent_memories_workspace_isolation"
  on public.agent_memories for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- -----------------------------------------------
-- CAMPAIGNS
-- -----------------------------------------------
drop policy if exists "campaigns_workspace_isolation" on public.campaigns;
create policy "campaigns_workspace_isolation"
  on public.campaigns for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- -----------------------------------------------
-- CONTENTS
-- -----------------------------------------------
drop policy if exists "contents_workspace_isolation" on public.contents;
create policy "contents_workspace_isolation"
  on public.contents for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- -----------------------------------------------
-- LEADS
-- -----------------------------------------------
drop policy if exists "leads_workspace_isolation" on public.leads;
create policy "leads_workspace_isolation"
  on public.leads for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- -----------------------------------------------
-- LEAD INTERACTIONS
-- -----------------------------------------------
drop policy if exists "lead_interactions_via_lead" on public.lead_interactions;
create policy "lead_interactions_via_lead"
  on public.lead_interactions for all
  using (
    lead_id in (
      select id from public.leads
      where public.is_workspace_member(workspace_id)
    )
  );

-- -----------------------------------------------
-- METRICS
-- -----------------------------------------------
drop policy if exists "metrics_workspace_isolation" on public.metrics;
create policy "metrics_workspace_isolation"
  on public.metrics for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
