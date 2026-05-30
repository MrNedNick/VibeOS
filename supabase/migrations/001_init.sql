-- VibeOS — Initial database schema
-- Run in Supabase SQL Editor (or via supabase db push)
-- All tables have: id (uuid PK), user_id (FK → auth.users), created_at, updated_at
-- RLS: every table allows SELECT/INSERT/UPDATE/DELETE only for auth.uid() = user_id

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Helper: auto-update updated_at ──────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  status        text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority      text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  category      text check (category in ('work','learning','training','personal','goal')),
  due_date      date,
  linked_goal_id uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger tasks_updated_at before update on tasks
  for each row execute function handle_updated_at();

alter table tasks enable row level security;

create policy "tasks: user owns rows"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- HABITS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists habits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  frequency   text not null default 'daily' check (frequency in ('daily','weekdays','weekends','custom')),
  color       text,
  icon        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger habits_updated_at before update on habits
  for each row execute function handle_updated_at();

alter table habits enable row level security;

create policy "habits: user owns rows"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- HABIT LOGS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists habit_logs (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  habit_id  uuid not null references habits(id) on delete cascade,
  date      date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

alter table habit_logs enable row level security;

create policy "habit_logs: user owns rows"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  category    text not null default 'personal'
                check (category in ('career','health','skill','personal','financial')),
  target_date date,
  progress    int not null default 0 check (progress between 0 and 100),
  status      text not null default 'active' check (status in ('active','completed','paused')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger goals_updated_at before update on goals
  for each row execute function handle_updated_at();

alter table goals enable row level security;

create policy "goals: user owns rows"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- MILESTONES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists milestones (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  goal_id    uuid not null references goals(id) on delete cascade,
  title      text not null,
  done       boolean not null default false,
  "order"    int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger milestones_updated_at before update on milestones
  for each row execute function handle_updated_at();

alter table milestones enable row level security;

create policy "milestones: user owns rows"
  on milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  content    text,
  pinned     boolean not null default false,
  type       text default 'note'
               check (type in ('note','plan','idea','journal','learning','training','reference')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_updated_at before update on notes
  for each row execute function handle_updated_at();

alter table notes enable row level security;

create policy "notes: user owns rows"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- LEARNING PLANS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists learning_plans (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  description       text,
  target_hours      int not null default 10,
  sessions_per_week int not null default 3,
  status            text not null default 'active' check (status in ('active','completed','paused')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger learning_plans_updated_at before update on learning_plans
  for each row execute function handle_updated_at();

alter table learning_plans enable row level security;

create policy "learning_plans: user owns rows"
  on learning_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- LEARNING SESSIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists learning_sessions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_id      uuid not null references learning_plans(id) on delete cascade,
  date         date not null,
  duration_min int not null default 0,
  notes        text,
  created_at   timestamptz not null default now()
);

alter table learning_sessions enable row level security;

create policy "learning_sessions: user owns rows"
  on learning_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAINING PLANS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists training_plans (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  sport             text not null default 'general',
  sessions_per_week int not null default 3,
  goal_description  text,
  status            text not null default 'active' check (status in ('active','completed','paused')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger training_plans_updated_at before update on training_plans
  for each row execute function handle_updated_at();

alter table training_plans enable row level security;

create policy "training_plans: user owns rows"
  on training_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAINING LOGS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists training_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_id      uuid references training_plans(id) on delete set null,
  date         date not null,
  duration_min int not null default 0,
  distance_km  numeric(6,2),
  notes        text,
  feeling      smallint check (feeling between 1 and 5),
  created_at   timestamptz not null default now()
);

alter table training_logs enable row level security;

create policy "training_logs: user owns rows"
  on training_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER SETTINGS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists user_settings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  theme             text default 'dark',
  locale            text default 'en',
  openweather_city  text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','demo','pro')),
  settings_json     jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger user_settings_updated_at before update on user_settings
  for each row execute function handle_updated_at();

alter table user_settings enable row level security;

create policy "user_settings: user owns row"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE USER SETTINGS ON SIGNUP
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
