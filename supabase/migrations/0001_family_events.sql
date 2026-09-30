-- Makmoura: one family = one ordered stream of events.
-- Every device (both parents, every child's tablet) reads the same events in the same order,
-- so they all agree. Row Level Security keeps each family's events to that family.
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- ---------- tables ----------
create table if not exists public.families (
  id           uuid primary key default gen_random_uuid(),
  child_code   text not null unique,     -- 6 digits: a child's tablet joins with it (child rights only)
  partner_code text not null unique,     -- 8 letters: the other parent joins with it (full rights)
  created_by   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table if not exists public.members (
  family_id  uuid not null references public.families (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('parent', 'child')),
  child_id   text,                        -- on a child's device: which child it is
  role       text,                        -- on a parent's device: 'بابا' or 'ماما'
  joined_at  timestamptz not null default now(),
  primary key (family_id, user_id),
  check (kind = 'parent' or child_id is not null)
);

create table if not exists public.events (
  seq        bigint generated always as identity primary key,
  family_id  uuid not null references public.families (id) on delete cascade,
  actor      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type       text not null,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists events_family_seq on public.events (family_id, seq);
create unique index if not exists events_family_eid on public.events (family_id, (payload ->> 'eid'));

-- ---------- who am I in this family ----------
create or replace function public.is_member(f uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.family_id = f and m.user_id = auth.uid());
$$;

create or replace function public.is_parent(f uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.family_id = f and m.user_id = auth.uid() and m.kind = 'parent');
$$;

create or replace function public.my_child(f uuid) returns text
language sql stable security definer set search_path = '' as $$
  select m.child_id from public.members m where m.family_id = f and m.user_id = auth.uid() and m.kind = 'child' limit 1;
$$;

-- ---------- row level security ----------
alter table public.families enable row level security;
alter table public.members  enable row level security;
alter table public.events   enable row level security;

drop policy if exists "members read their family" on public.families;
create policy "members read their family" on public.families
  for select to authenticated using (public.is_member(id));

drop policy if exists "members see each other" on public.members;
create policy "members see each other" on public.members
  for select to authenticated using (public.is_member(family_id));

drop policy if exists "members read events" on public.events;
create policy "members read events" on public.events
  for select to authenticated using (public.is_member(family_id));

-- parents may write anything; a child's device only its own ticks, celebrations and the day change
drop policy if exists "parents and children write events" on public.events;
create policy "parents and children write events" on public.events
  for insert to authenticated with check (
    actor = auth.uid() and (
      public.is_parent(family_id)
      or (
        public.my_child(family_id) is not null
        and type in ('markDone', 'undoDone', 'celebrate', 'seeSurprise', 'rollover')
        and (type = 'rollover' or payload ->> 'childId' = public.my_child(family_id))
      )
    )
  );

-- ---------- joining ----------
create or replace function public.gen_digits(n int) returns text
language sql volatile set search_path = '' as $$
  select string_agg(floor(random() * 10)::int::text, '') from generate_series(1, n);
$$;

create or replace function public.gen_letters(n int) returns text
language sql volatile set search_path = '' as $$
  -- no 0/O or 1/I/L, so the code is easy to read out loud
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, n);
$$;

-- a parent with a new account makes the family
create or replace function public.create_family(parent_role text) returns public.families
language plpgsql volatile security definer set search_path = '' as $$
declare fam public.families;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  -- one family per parent account: return the existing one
  select f.* into fam from public.families f join public.members m on m.family_id = f.id
    where m.user_id = auth.uid() and m.kind = 'parent' limit 1;
  if found then return fam; end if;
  loop
    begin
      insert into public.families (child_code, partner_code) values (public.gen_digits(6), public.gen_letters(8)) returning * into fam;
      exit;
    exception when unique_violation then -- try another code
    end;
  end loop;
  insert into public.members (family_id, user_id, kind, role) values (fam.id, auth.uid(), 'parent', parent_role);
  return fam;
end;
$$;

-- the other parent joins with the 8-letter code
create or replace function public.join_as_parent(code text, parent_role text) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select id into fid from public.families where partner_code = upper(trim(code));
  if fid is null then raise exception 'wrong code'; end if;
  insert into public.members (family_id, user_id, kind, role) values (fid, auth.uid(), 'parent', parent_role)
    on conflict (family_id, user_id) do update set kind = 'parent', role = excluded.role, child_id = null;
  return fid;
end;
$$;

-- a child's tablet: first see who is in the family (names and looks only), then pick yourself
create or replace function public.peek_family(code text) returns table (child_id text, name text, avatar text)
language sql stable security definer set search_path = '' as $$
  with fam as (select id from public.families where child_code = trim(code))
  select e.payload -> 'child' ->> 'id', e.payload -> 'child' ->> 'name', e.payload -> 'child' ->> 'avatar'
  from public.events e join fam on e.family_id = fam.id
  where e.type = 'addChild'
    and not exists (select 1 from public.events r where r.family_id = fam.id and r.type = 'removeChild'
                    and r.payload ->> 'childId' = e.payload -> 'child' ->> 'id')
  union
  select c ->> 'id', c ->> 'name', c ->> 'avatar'
  from public.events e join fam on e.family_id = fam.id, jsonb_array_elements(e.payload -> 'shared' -> 'children') c
  where e.type = 'import'
    and not exists (select 1 from public.events r where r.family_id = fam.id and r.type = 'removeChild'
                    and r.payload ->> 'childId' = c ->> 'id');
$$;

create or replace function public.join_as_child(code text, child text) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select id into fid from public.families where child_code = trim(code);
  if fid is null then raise exception 'wrong code'; end if;
  if not exists (select 1 from public.peek_family(code) p where p.child_id = child) then raise exception 'no such child'; end if;
  insert into public.members (family_id, user_id, kind, child_id) values (fid, auth.uid(), 'child', child)
    on conflict (family_id, user_id) do update set kind = 'child', child_id = excluded.child_id
    where public.members.kind = 'child';
  return fid;
end;
$$;

-- ---------- access for the app (tables are not exposed automatically) ----------
grant usage on schema public to authenticated;
grant select on public.families, public.members to authenticated;
grant select, insert on public.events to authenticated;
revoke all on function public.create_family(text), public.join_as_parent(text, text),
  public.peek_family(text), public.join_as_child(text, text) from public, anon;
grant execute on function public.create_family(text), public.join_as_parent(text, text),
  public.peek_family(text), public.join_as_child(text, text), public.is_member(uuid),
  public.is_parent(uuid), public.my_child(uuid) to authenticated;

-- ---------- live updates ----------
do $$ begin
  alter publication supabase_realtime add table public.events;
exception when duplicate_object then null;
end $$;
