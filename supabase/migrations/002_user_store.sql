-- VibeOS — User key-value store for cloud sync (migration 002)
-- Maps each localStorage key to its full JSON value per user.
-- Avoids column-by-column mapping for rich local types.

create table if not exists user_store (
  user_id    uuid    not null references auth.users(id) on delete cascade,
  key        text    not null,
  value      jsonb   not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create or replace function handle_user_store_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_store_updated_at
  before update on user_store
  for each row execute function handle_user_store_updated_at();

alter table user_store enable row level security;

create policy "user_store: user owns rows"
  on user_store for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
