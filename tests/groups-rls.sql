-- Run AFTER supabase-groups.sql in a test Supabase project.
-- All fixtures and writes are rolled back. No credentials or real users are needed.
-- Successful completion prints no errors. A failed assertion aborts the transaction.
begin;
create temporary table travel_test_fixture(a uuid,b uuid,c uuid,g uuid,token text);
insert into travel_test_fixture values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),null,null);
insert into auth.users(id,email) select a,a::text||'@example.invalid' from travel_test_fixture;
insert into auth.users(id,email) select b,b::text||'@example.invalid' from travel_test_fixture;
insert into auth.users(id,email) select c,c::text||'@example.invalid' from travel_test_fixture;
 grant select,update on travel_test_fixture to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select a::text from travel_test_fixture),true);
do $$ declare result jsonb; begin
 result:=public.travel_create_group('Test privé','Alice');
 update travel_test_fixture set g=(result->>'group_id')::uuid, token=result->>'token';
 if (select count(*) from public.travel_groups)<>1 then raise exception 'owner cannot read group'; end if;
 insert into public.travel_messages(group_id,user_id,body) select g,a,'Message privé' from travel_test_fixture;
 insert into storage.objects(bucket_id,name) select 'travel-gallery',g::text||'/'||a::text||'/test.jpg' from travel_test_fixture;
 perform public.travel_share_location((select g from travel_test_fixture),48.86,2.34,15);
end $$;
select set_config('request.jwt.claim.sub',(select c::text from travel_test_fixture),true);
do $$ declare denied boolean:=false; begin
 if exists(select 1 from public.travel_groups) then raise exception 'outsider reads groups'; end if;
 if exists(select 1 from public.travel_members) then raise exception 'outsider reads membership'; end if;
 if exists(select 1 from public.travel_messages) then raise exception 'outsider reads chat'; end if;
 if exists(select 1 from public.travel_locations) then raise exception 'outsider reads GPS'; end if;
 if exists(select 1 from public.travel_media) then raise exception 'outsider reads media'; end if;
 if exists(select 1 from storage.objects where bucket_id='travel-gallery') then raise exception 'outsider reads private objects'; end if;
 begin insert into storage.objects(bucket_id,name) select 'travel-gallery',g::text||'/'||c::text||'/intrusion.jpg' from travel_test_fixture; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'outsider uploads media'; end if;
 denied:=false;
 begin perform public.travel_share_location((select g from travel_test_fixture),40,2,10); exception when others then denied:=true; end;
 if not denied then raise exception 'outsider publishes GPS'; end if;
 denied:=false;
 begin insert into public.travel_messages(group_id,user_id,body) select g,c,'Intrusion' from travel_test_fixture; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'outsider sends chat'; end if;
 denied:=false;
 begin perform public.travel_invite((select g from travel_test_fixture)); exception when others then denied:=true; end;
 if not denied then raise exception 'outsider creates invitation'; end if;
end $$;
select set_config('request.jwt.claim.sub',(select b::text from travel_test_fixture),true);
select public.travel_join_group((select token from travel_test_fixture),'Bob');
do $$ declare denied boolean:=false; begin
 if (select count(*) from public.travel_messages)<>1 then raise exception 'member cannot read chat'; end if;
 if (select count(*) from public.travel_locations)<>1 then raise exception 'member cannot read live GPS'; end if;
 if (select count(*) from storage.objects where bucket_id='travel-gallery')<>1 then raise exception 'member cannot read gallery'; end if;
 begin insert into storage.objects(bucket_id,name) select 'travel-gallery',g::text||'/'||a::text||'/spoof.jpg' from travel_test_fixture; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'member uploads as another user'; end if;
 denied:=false;
 begin perform invite_hash from public.travel_groups; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'member can read invitation hash'; end if;
 denied:=false;
 begin insert into public.travel_messages(group_id,user_id,body) select g,a,'Spoofed author' from travel_test_fixture; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'member can impersonate another author'; end if;
 denied:=false;
 begin update public.travel_groups set destination='Hijacked'; exception when insufficient_privilege then denied:=true; end;
 if exists(select 1 from public.travel_groups where destination='Hijacked') then raise exception 'member edits owner plan'; end if;
 perform public.travel_share_location((select g from travel_test_fixture),40,-3,20);
 insert into public.travel_messages(group_id,user_id,body) select g,b,'Message de Bob' from travel_test_fixture;
 perform public.travel_remove_member((select g from travel_test_fixture),(select b from travel_test_fixture));
 if exists(select 1 from public.travel_messages) then raise exception 'former member still reads chat'; end if;
 if exists(select 1 from public.travel_locations) then raise exception 'former member still reads GPS'; end if;
 if exists(select 1 from storage.objects where bucket_id='travel-gallery') then raise exception 'former member still reads gallery'; end if;
end $$;
select set_config('request.jwt.claim.sub',(select a::text from travel_test_fixture),true);
do $$ begin
 if (select count(*) from public.travel_messages)<>2 then raise exception 'leaving erased shared history'; end if;
 if (select count(*) from public.travel_locations)<>1 then raise exception 'leaving did not erase own location'; end if;
end $$;
reset role;
update public.travel_locations set expires_at=now()-interval '1 second';
set local role authenticated;
do $$ begin if exists(select 1 from public.travel_locations) then raise exception 'expired GPS remains readable'; end if; end $$;
reset role;
set local role anon;
do $$ declare denied boolean:=false; begin
 begin perform public.travel_create_group('Anon','Anon'); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'anonymous can create a group'; end if;
end $$;
reset role;
rollback;
