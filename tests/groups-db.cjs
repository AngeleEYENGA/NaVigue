// Usage: node tests/groups-db.cjs <absolute path to @electric-sql/pglite>
// Runs genuine PostgreSQL RLS in a disposable in-memory database.
// The small auth/storage scaffolding mirrors the Supabase primitives used here;
// Realtime delivery and the actual Storage HTTP service still need a hosted test.
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const {PGlite}=await import(process.argv[2] || '@electric-sql/pglite');
  const db=new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,storage,public to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant select,insert,delete on storage.objects to authenticated;
  `);
  await db.exec(fs.readFileSync(path.join(__dirname,'..','supabase-groups.sql'),'utf8'));
  await db.exec(fs.readFileSync(path.join(__dirname,'groups-rls.sql'),'utf8'));
  console.log('PASS: migration and PostgreSQL RLS: outsiders denied, member access, spoof prevention, owner privileges, leave/revocation, GPS expiry, anonymous denial');
  await db.close();
})().catch(error=>{console.error(error.message);process.exitCode=1;});
