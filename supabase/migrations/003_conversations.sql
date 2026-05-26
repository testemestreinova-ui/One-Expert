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
