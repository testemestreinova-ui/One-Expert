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
