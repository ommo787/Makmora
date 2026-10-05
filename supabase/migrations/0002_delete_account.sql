-- Makmoura: let a parent delete their own account from inside the app (Google Play requires it).
-- If they were the family's only parent, the whole family goes with them (children, tasks, history).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create or replace function public.delete_my_account() returns void
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  -- families where this is the last parent: remove them entirely
  delete from public.families f
  where exists (select 1 from public.members m where m.family_id = f.id and m.user_id = uid and m.kind = 'parent')
    and not exists (select 1 from public.members o where o.family_id = f.id and o.kind = 'parent' and o.user_id <> uid);
  -- the account itself (its memberships and events in other families go with it)
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
