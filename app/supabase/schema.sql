create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  elo_petanque integer not null default 1000 check (elo_petanque >= 0),
  elo_flechettes integer not null default 1000 check (elo_flechettes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  sport text not null check (sport in ('petanque', 'flechettes')),
  date timestamptz not null default now(),
  participants jsonb not null check (jsonb_typeof(participants) = 'array'),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists players_elo_petanque_idx
  on public.players (elo_petanque desc);

create index if not exists players_elo_flechettes_idx
  on public.players (elo_flechettes desc);

create index if not exists matches_sport_date_idx
  on public.matches (sport, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
before update on public.players
for each row
execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.matches enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.players to anon, authenticated;
grant select, insert, update on public.matches to anon, authenticated;

drop policy if exists "ranking players are readable" on public.players;
create policy "ranking players are readable"
on public.players
for select
to anon, authenticated
using (true);

drop policy if exists "ranking players can be created" on public.players;
create policy "ranking players can be created"
on public.players
for insert
to anon, authenticated
with check (true);

drop policy if exists "ranking players can be updated" on public.players;
create policy "ranking players can be updated"
on public.players
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "ranking matches are readable" on public.matches;
create policy "ranking matches are readable"
on public.matches
for select
to anon, authenticated
using (true);

drop policy if exists "ranking matches can be created" on public.matches;
create policy "ranking matches can be created"
on public.matches
for insert
to anon, authenticated
with check (true);

drop policy if exists "ranking matches can be updated" on public.matches;
create policy "ranking matches can be updated"
on public.matches
for update
to anon, authenticated
using (true)
with check (true);
