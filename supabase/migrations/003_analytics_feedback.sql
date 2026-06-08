-- VibeOS — Analytics events + Feedback entries (migration 003)
-- analytics_events: behavioral interaction tracking (S18 T11)
-- feedback_entries: user mood/NPS feedback (S18 T11)

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists analytics_events (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  type       text        not null,
  module     text,
  feature    text,
  session_id text,
  timestamp  timestamptz not null,
  payload    jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_user_ts
  on analytics_events(user_id, timestamp);

alter table analytics_events enable row level security;

create policy "analytics_events: user owns rows"
  on analytics_events for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FEEDBACK ENTRIES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists feedback_entries (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  score       smallint    not null,
  comment     text,
  timestamp   timestamptz not null,
  session_id  text,
  app_version text,
  created_at  timestamptz not null default now()
);

alter table feedback_entries enable row level security;

create policy "feedback_entries: user owns rows"
  on feedback_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
