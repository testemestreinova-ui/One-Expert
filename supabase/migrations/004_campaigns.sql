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
