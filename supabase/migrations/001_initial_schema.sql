-- Mission Control - Initial Schema
-- Virtual AI Office with 5 Agents

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- AGENTS TABLE
-- ============================================
create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  role text not null,
  model text not null,
  personality text not null,
  avatar_color text not null default '#6366f1',
  status text not null default 'idle' check (status in ('idle', 'working', 'talking', 'reviewing', 'offline')),
  position_x float not null default 0,
  position_y float not null default 0,
  current_task_id uuid,
  last_active_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TASKS TABLE
-- ============================================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  parent_task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'review', 'completed', 'failed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_agent_id uuid references public.agents(id) on delete set null,
  created_by text not null default 'user',
  result text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add FK for agent current_task
alter table public.agents
  add constraint fk_agent_current_task
  foreign key (current_task_id) references public.tasks(id) on delete set null;

-- ============================================
-- MESSAGES TABLE (Message Bus)
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  from_agent_id uuid references public.agents(id) on delete set null,
  to_agent_id uuid references public.agents(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  type text not null default 'chat' check (type in ('chat', 'task_assignment', 'status_update', 'review_request', 'review_result', 'system', 'user_input')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- AGENT STATES (for tracking detailed state over time)
-- ============================================
create table public.agent_states (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  state text not null,
  details text,
  created_at timestamptz default now()
);

-- ============================================
-- TASK LOGS (audit trail)
-- ============================================
create table public.task_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  action text not null,
  details text,
  tokens_used integer default 0,
  cost_usd numeric(10, 6) default 0,
  created_at timestamptz default now()
);

-- ============================================
-- AGENT CONNECTIONS (visual lines between agents)
-- ============================================
create table public.agent_connections (
  id uuid primary key default uuid_generate_v4(),
  from_agent_id uuid not null references public.agents(id) on delete cascade,
  to_agent_id uuid not null references public.agents(id) on delete cascade,
  type text not null default 'communication' check (type in ('communication', 'task_delegation', 'review')),
  active boolean not null default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 seconds')
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_assigned on public.tasks(assigned_agent_id);
create index idx_tasks_parent on public.tasks(parent_task_id);
create index idx_messages_task on public.messages(task_id);
create index idx_messages_from on public.messages(from_agent_id);
create index idx_messages_to on public.messages(to_agent_id);
create index idx_messages_created on public.messages(created_at desc);
create index idx_agent_states_agent on public.agent_states(agent_id);
create index idx_task_logs_task on public.task_logs(task_id);
create index idx_agent_connections_active on public.agent_connections(active) where active = true;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_agents_updated_at
  before update on public.agents
  for each row execute function public.update_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

-- ============================================
-- CLEANUP EXPIRED CONNECTIONS (function)
-- ============================================
create or replace function public.cleanup_expired_connections()
returns void as $$
begin
  update public.agent_connections
  set active = false
  where active = true and expires_at < now();
end;
$$ language plpgsql;

-- ============================================
-- ENABLE REALTIME
-- ============================================
alter publication supabase_realtime add table public.agents;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.agent_connections;

-- ============================================
-- ROW LEVEL SECURITY (permissive for now)
-- ============================================
alter table public.agents enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.agent_states enable row level security;
alter table public.task_logs enable row level security;
alter table public.agent_connections enable row level security;

-- Allow all operations for authenticated and anon (dev mode)
create policy "Allow all on agents" on public.agents for all using (true) with check (true);
create policy "Allow all on tasks" on public.tasks for all using (true) with check (true);
create policy "Allow all on messages" on public.messages for all using (true) with check (true);
create policy "Allow all on agent_states" on public.agent_states for all using (true) with check (true);
create policy "Allow all on task_logs" on public.task_logs for all using (true) with check (true);
create policy "Allow all on agent_connections" on public.agent_connections for all using (true) with check (true);
