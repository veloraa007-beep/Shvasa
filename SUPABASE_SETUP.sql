create table if not exists public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  distractions text not null default '',
  goals text not null default '',
  peak_time text not null default ''
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline text,
  priority text not null default 'med' check (priority in ('low', 'med', 'high')),
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null,
  duration integer not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  last_completed_date date
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists unique_user_token on public.device_tokens(user_id, token);

alter table public.tasks alter column id set default gen_random_uuid();
alter table public.tasks alter column priority set default 'med';
alter table public.tasks alter column status set default 'todo';
alter table public.focus_sessions alter column id set default gen_random_uuid();

alter table public.user_profile enable row level security;
alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.streaks enable row level security;
alter table public.device_tokens enable row level security;

create policy "own profile" on public.user_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own focus sessions" on public.focus_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streaks" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
