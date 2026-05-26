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
