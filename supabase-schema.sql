create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  child_name text not null check (char_length(child_name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (id, parent_id)
);

create table if not exists public.favorite_places (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  child_id uuid not null,
  relationship text not null check (relationship in ('papa', 'maman', 'ami', 'autre')),
  label text not null check (char_length(label) between 1 and 50),
  address text not null check (char_length(address) between 1 and 240),
  created_at timestamptz not null default now(),
  foreign key (child_id, parent_id)
    references public.child_profiles (id, parent_id) on delete cascade
);

create index if not exists child_profiles_parent_id_idx
  on public.child_profiles (parent_id);
create index if not exists favorite_places_child_id_idx
  on public.favorite_places (child_id, parent_id);

alter table public.child_profiles enable row level security;
alter table public.favorite_places enable row level security;

revoke all on table public.child_profiles from anon;
revoke all on table public.favorite_places from anon;
grant select, insert, update, delete on table public.child_profiles to authenticated;
grant select, insert, update, delete on table public.favorite_places to authenticated;

drop policy if exists "Parents manage their child profiles" on public.child_profiles;
create policy "Parents manage their child profiles"
  on public.child_profiles
  for all
  to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

drop policy if exists "Parents manage their favorite places" on public.favorite_places;
create policy "Parents manage their favorite places"
  on public.favorite_places
  for all
  to authenticated
  using (parent_id = (select auth.uid()))
  with check (
    parent_id = (select auth.uid())
    and exists (
      select 1
      from public.child_profiles
      where child_profiles.id = favorite_places.child_id
        and child_profiles.parent_id = (select auth.uid())
    )
  );
