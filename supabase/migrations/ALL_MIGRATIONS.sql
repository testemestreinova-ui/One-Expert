-- =============================================
-- MIGRATION 001 — PROFILES & AUTH TRIGGER
-- =============================================
-- Perfil público de cada usuário, sincronizado
-- automaticamente com auth.users via trigger.

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user'
                check (role in ('user', 'admin', 'owner')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índice para busca por email
create index if not exists profiles_email_idx on public.profiles(email);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger: cria perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- =============================================
-- MIGRATION 002 — WORKSPACES & MEMBROS
-- =============================================
-- Cada empresa/usuário tem seu workspace.
-- Um usuário pode pertencer a vários workspaces.

create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  logo_url    text,
  plan        text not null default 'starter'
                check (plan in ('starter', 'plus', 'ultra')),
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists workspaces_slug_idx on public.workspaces(slug);

create or replace trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

-- Membros do workspace
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'member'
                  check (role in ('owner', 'admin', 'member')),
  joined_at     timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_idx
  on public.workspace_members(workspace_id);

-- Função auxiliar: cria workspace padrão para novo usuário
create or replace function public.create_default_workspace(
  p_user_id uuid,
  p_user_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_slug text;
  v_counter int := 0;
begin
  -- Gera slug único a partir do nome
  v_slug := lower(regexp_replace(p_user_name, '[^a-z0-9]', '-', 'g'));
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  v_slug := trim(both '-' from v_slug);

  -- Garante unicidade
  while exists (select 1 from public.workspaces where slug = v_slug || case when v_counter = 0 then '' else '-' || v_counter::text end) loop
    v_counter := v_counter + 1;
  end loop;

  if v_counter > 0 then
    v_slug := v_slug || '-' || v_counter::text;
  end if;

  -- Cria workspace
  insert into public.workspaces (name, slug)
  values (p_user_name || '''s Workspace', v_slug)
  returning id into v_workspace_id;

  -- Adiciona usuário como owner
  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, p_user_id, 'owner');

  return v_workspace_id;
end;
$$;

-- Trigger: cria workspace padrão quando perfil é criado
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.create_default_workspace(
    new.id,
    coalesce(new.full_name, split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();
-- =============================================
-- MIGRATION 003 — CONVERSATIONS, MESSAGES & AGENT_MEMORIES
-- =============================================

-- Conversas com os agentes
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  agent_type    text not null
                  check (agent_type in ('acquisition', 'content', 'sales')),
  title         text,
  status        text not null default 'active'
                  check (status in ('active', 'archived')),
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists conversations_workspace_idx
  on public.conversations(workspace_id);
create index if not exists conversations_user_idx
  on public.conversations(user_id);
create index if not exists conversations_created_idx
  on public.conversations(created_at desc);

create or replace trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- Mensagens dentro de cada conversa
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  role             text not null
                     check (role in ('user', 'assistant', 'system')),
  content          text not null,
  agent_type       text
                     check (agent_type in ('acquisition', 'content', 'sales')),
  tokens_used      integer not null default 0,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages(conversation_id);
create index if not exists messages_created_idx
  on public.messages(created_at asc);

-- Trigger: atualiza updated_at da conversa quando nova mensagem chega
create or replace function public.handle_new_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create or replace trigger on_message_created
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- Memória persistente dos agentes por workspace
create table if not exists public.agent_memories (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  agent_type    text not null
                  check (agent_type in ('acquisition', 'content', 'sales')),
  memory_type   text not null
                  check (memory_type in ('summary', 'fact', 'preference')),
  content       text not null,
  relevance     float not null default 1.0,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists agent_memories_workspace_agent_idx
  on public.agent_memories(workspace_id, agent_type);
create index if not exists agent_memories_relevance_idx
  on public.agent_memories(relevance desc);
-- =============================================
-- MIGRATION 004 — CAMPAIGNS & CONTENTS
-- =============================================

-- Campanhas de marketing geradas pelo Agente Atlas
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  platform      text
                  check (platform in ('meta', 'google', 'tiktok', 'linkedin', 'email')),
  status        text not null default 'draft'
                  check (status in ('draft', 'active', 'paused', 'finished')),
  objective     text,
  budget        numeric(10, 2),
  cac_target    numeric(10, 2),
  ctr_target    numeric(5, 2),
  -- Criativos gerados: copies, hooks, headlines, estrutura de conjuntos
  content       jsonb not null default '{}',
  -- Métricas reais de performance (preenchidas manualmente ou via integração futura)
  metrics       jsonb not null default '{}',
  generated_by  text not null default 'agent',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists campaigns_workspace_idx
  on public.campaigns(workspace_id);
create index if not exists campaigns_status_idx
  on public.campaigns(status);
create index if not exists campaigns_platform_idx
  on public.campaigns(platform);

create or replace trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.handle_updated_at();

-- Conteúdos gerados pelo Agente Vox
create table if not exists public.contents (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  type          text not null
                  check (type in ('post', 'carousel', 'reel', 'thread', 'email', 'script', 'hook')),
  platform      text
                  check (platform in ('instagram', 'tiktok', 'youtube', 'linkedin', 'email')),
  title         text,
  body          text not null,
  status        text not null default 'draft'
                  check (status in ('draft', 'approved', 'published')),
  -- Hashtags, emojis, notas de design, etc.
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists contents_workspace_idx
  on public.contents(workspace_id);
create index if not exists contents_type_idx
  on public.contents(type);
create index if not exists contents_platform_idx
  on public.contents(platform);
create index if not exists contents_status_idx
  on public.contents(status);
create index if not exists contents_created_idx
  on public.contents(created_at desc);
-- =============================================
-- MIGRATION 005 — LEADS, INTERAÇÕES & MÉTRICAS
-- =============================================

-- CRM de leads gerenciado pelo Agente Nexus
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  source        text,   -- 'meta_ads', 'google', 'organic', 'referral', etc.
  status        text not null default 'new'
                  check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  score         integer not null default 0
                  check (score between 0 and 100),
  notes         text,
  tags          text[] not null default '{}',
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists leads_workspace_idx
  on public.leads(workspace_id);
create index if not exists leads_status_idx
  on public.leads(status);
create index if not exists leads_score_idx
  on public.leads(score desc);
create index if not exists leads_created_idx
  on public.leads(created_at desc);

create or replace trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- Histórico de interações com cada lead
create table if not exists public.lead_interactions (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  type        text
                check (type in ('email', 'whatsapp', 'call', 'note', 'meeting')),
  content     text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists lead_interactions_lead_idx
  on public.lead_interactions(lead_id);

-- KPIs e métricas do workspace (série temporal)
create table if not exists public.metrics (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  date          date not null,
  metric_type   text not null,  -- 'cac', 'ctr', 'cpl', 'roas', 'new_leads', etc.
  value         numeric not null,
  platform      text,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  -- Evita duplicatas: uma métrica por tipo/data/plataforma
  unique (workspace_id, date, metric_type, platform)
);

create index if not exists metrics_workspace_date_idx
  on public.metrics(workspace_id, date desc);
create index if not exists metrics_type_idx
  on public.metrics(metric_type);
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
drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select"
  on public.workspace_members for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

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
