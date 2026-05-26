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
