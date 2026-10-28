-- NaVigue: private travel groups. Run once in the project's Supabase SQL Editor.
-- Additive migration; does not alter existing family tables.
begin;
create table if not exists public.travel_groups (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 80),
  destination text not null default '' check (char_length(destination) <= 240),
  travel_date date, description text not null default '' check (char_length(description) <= 2000),
  invite_hash text not null, invite_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists public.travel_members (
  group_id uuid references public.travel_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 50),
  joined_at timestamptz not null default now(), primary key(group_id,user_id)
);
create index if not exists travel_members_user_idx on public.travel_members(user_id);
create table if not exists public.travel_messages (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.travel_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists travel_messages_group_time_idx on public.travel_messages(group_id,created_at desc);
create table if not exists public.travel_locations (
  group_id uuid not null, user_id uuid not null, lat double precision not null check(lat between -90 and 90),
  lon double precision not null check(lon between -180 and 180), accuracy double precision not null check(accuracy between 0 and 100000),
  updated_at timestamptz not null default now(), expires_at timestamptz not null,
  primary key(group_id,user_id),
  foreign key(group_id,user_id) references public.travel_members(group_id,user_id) on delete cascade
);
create table if not exists public.travel_media (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.travel_groups(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  path text not null unique, mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime')),
  caption text not null default '' check(char_length(caption)<=240), created_at timestamptz not null default now(),
  check (split_part(path,'/',1)=group_id::text and split_part(path,'/',2)=user_id::text and char_length(path)<200)
);
create index if not exists travel_media_group_time_idx on public.travel_media(group_id,created_at desc);

-- Security-definer membership lookup avoids recursive RLS on the membership table.
create or replace function public.travel_is_member(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.travel_members where group_id=g and user_id=(select auth.uid()));
$$;
create or replace function public.travel_is_owner(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.travel_groups where id=g and owner_id=(select auth.uid()));
$$;
revoke all on function public.travel_is_member(uuid), public.travel_is_owner(uuid) from public, anon;
grant execute on function public.travel_is_member(uuid), public.travel_is_owner(uuid) to authenticated;

alter table public.travel_groups enable row level security;
alter table public.travel_members enable row level security;
alter table public.travel_messages enable row level security;
alter table public.travel_locations enable row level security;
alter table public.travel_media enable row level security;
revoke all on public.travel_groups, public.travel_members, public.travel_messages, public.travel_locations, public.travel_media from anon, authenticated;
grant select(id,owner_id,name,destination,travel_date,description,created_at) on public.travel_groups to authenticated;
grant update(destination,travel_date,description) on public.travel_groups to authenticated;
grant select on public.travel_members to authenticated;
grant select on public.travel_messages to authenticated;
grant insert(group_id,user_id,body) on public.travel_messages to authenticated;
grant select,delete on public.travel_locations to authenticated;
grant select,delete on public.travel_media to authenticated;
grant insert(group_id,user_id,path,mime_type,caption) on public.travel_media to authenticated;

drop policy if exists "travel groups read" on public.travel_groups;
create policy "travel groups read" on public.travel_groups for select to authenticated using(public.travel_is_member(id));
drop policy if exists "travel plans edit" on public.travel_groups;
create policy "travel plans edit" on public.travel_groups for update to authenticated using(public.travel_is_owner(id)) with check(public.travel_is_owner(id));
drop policy if exists "travel members read" on public.travel_members;
create policy "travel members read" on public.travel_members for select to authenticated using(public.travel_is_member(group_id));
drop policy if exists "travel messages read" on public.travel_messages;
create policy "travel messages read" on public.travel_messages for select to authenticated using(public.travel_is_member(group_id));
drop policy if exists "travel messages send" on public.travel_messages;
create policy "travel messages send" on public.travel_messages for insert to authenticated with check(user_id=(select auth.uid()) and public.travel_is_member(group_id));
drop policy if exists "travel positions read" on public.travel_locations;
create policy "travel positions read" on public.travel_locations for select to authenticated using(public.travel_is_member(group_id) and expires_at>now());
drop policy if exists "travel positions stop" on public.travel_locations;
create policy "travel positions stop" on public.travel_locations for delete to authenticated using(user_id=(select auth.uid()));
drop policy if exists "travel media read" on public.travel_media;
create policy "travel media read" on public.travel_media for select to authenticated using(public.travel_is_member(group_id));
drop policy if exists "travel media add" on public.travel_media;
create policy "travel media add" on public.travel_media for insert to authenticated with check(user_id=(select auth.uid()) and public.travel_is_member(group_id));
drop policy if exists "travel media remove" on public.travel_media;
create policy "travel media remove" on public.travel_media for delete to authenticated using(user_id=(select auth.uid()) or public.travel_is_owner(group_id));

create or replace function public.travel_create_group(group_name text, member_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g uuid; token text := replace(gen_random_uuid()::text,'-',''); u uuid := auth.uid();
begin
 if u is null then raise exception 'Connexion requise'; end if;
 if (select count(*) from public.travel_groups where owner_id=u)>=30 then raise exception 'Limite de groupes atteinte'; end if;
 insert into public.travel_groups(owner_id,name,invite_hash,invite_expires_at) values(u,btrim(group_name),encode(sha256(convert_to(token,'UTF8')),'hex'),now()+interval '7 days') returning id into g;
 insert into public.travel_members(group_id,user_id,nickname) values(g,u,btrim(member_name));
 return jsonb_build_object('group_id',g,'token',token);
end $$;
create or replace function public.travel_join_group(invite_token text, member_name text) returns uuid
language plpgsql security definer set search_path='' as $$
declare g uuid; u uuid := auth.uid();
begin
 if u is null then raise exception 'Connexion requise'; end if;
 if invite_token !~ '^[0-9a-f]{32}$' then raise exception 'Invitation invalide'; end if;
 select id into g from public.travel_groups where invite_hash=encode(sha256(convert_to(invite_token,'UTF8')),'hex') and invite_expires_at>now() for update;
 if g is null then raise exception 'Invitation invalide ou expirée'; end if;
 if (select count(*) from public.travel_members where group_id=g)>=50 and not public.travel_is_member(g) then raise exception 'Groupe complet'; end if;
 insert into public.travel_members(group_id,user_id,nickname) values(g,u,btrim(member_name)) on conflict(group_id,user_id) do nothing;
 return g;
end $$;
create or replace function public.travel_invite(g uuid) returns text
language plpgsql security definer set search_path='' as $$
declare token text := replace(gen_random_uuid()::text,'-','');
begin
 if not public.travel_is_owner(g) then raise exception 'Action réservée au créateur'; end if;
 update public.travel_groups set invite_hash=encode(sha256(convert_to(token,'UTF8')),'hex'),invite_expires_at=now()+interval '7 days' where id=g;
 return token;
end $$;
create or replace function public.travel_remove_member(g uuid, member_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not(public.travel_is_owner(g) or auth.uid()=member_id) then raise exception 'Accès refusé'; end if;
 if exists(select 1 from public.travel_groups where id=g and owner_id=member_id) then raise exception 'Le créateur doit rester membre du groupe'; end if;
 delete from public.travel_members where group_id=g and user_id=member_id;
end $$;

-- Server timestamps and a short lease prevent a closed/lost browser appearing live indefinitely.
-- There is no location history: each update replaces the member's last point.
create or replace function public.travel_share_location(g uuid, latitude double precision, longitude double precision, precision_m double precision) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.travel_is_member(g) then raise exception 'Accès refusé'; end if;
 delete from public.travel_locations where expires_at<now();
 insert into public.travel_locations(group_id,user_id,lat,lon,accuracy,updated_at,expires_at)
 values(g,auth.uid(),latitude,longitude,precision_m,clock_timestamp(),clock_timestamp()+interval '90 seconds')
 on conflict(group_id,user_id) do update set lat=excluded.lat,lon=excluded.lon,accuracy=excluded.accuracy,updated_at=excluded.updated_at,expires_at=excluded.expires_at;
end $$;

revoke all on function public.travel_create_group(text,text), public.travel_join_group(text,text), public.travel_invite(uuid), public.travel_remove_member(uuid,uuid), public.travel_share_location(uuid,double precision,double precision,double precision) from public, anon;
grant execute on function public.travel_create_group(text,text), public.travel_join_group(text,text), public.travel_invite(uuid), public.travel_remove_member(uuid,uuid), public.travel_share_location(uuid,double precision,double precision,double precision) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('travel-gallery','travel-gallery',false,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Compare textual UUIDs, avoiding cast errors from malformed object paths.
drop policy if exists "travel gallery read" on storage.objects;
create policy "travel gallery read" on storage.objects for select to authenticated using(bucket_id='travel-gallery' and exists(select 1 from public.travel_members m where m.group_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid())));
drop policy if exists "travel gallery upload" on storage.objects;
create policy "travel gallery upload" on storage.objects for insert to authenticated with check(bucket_id='travel-gallery' and split_part(name,'/',2)=(select auth.uid())::text and exists(select 1 from public.travel_members m where m.group_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid())));
drop policy if exists "travel gallery remove" on storage.objects;
create policy "travel gallery remove" on storage.objects for delete to authenticated using(bucket_id='travel-gallery' and exists(select 1 from public.travel_members m where m.group_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid())) and (split_part(name,'/',2)=(select auth.uid())::text or exists(select 1 from public.travel_groups g where g.id::text=split_part(name,'/',1) and g.owner_id=(select auth.uid()))));

do $$ declare t text; begin
 if not exists(select 1 from pg_publication where pubname='supabase_realtime') then create publication supabase_realtime; end if;
 foreach t in array array['travel_groups','travel_members','travel_messages','travel_locations','travel_media'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then execute format('alter publication supabase_realtime add table public.%I',t); end if;
 end loop;
end $$;
notify pgrst, 'reload schema';
commit;
