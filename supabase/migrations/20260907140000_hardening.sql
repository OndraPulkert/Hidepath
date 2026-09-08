-- Hardening po bezpečnostním review (2026-09-07).

-- 1) authenticated nesmí mít TRUNCATE (obchází RLS), REFERENCES ani TRIGGER; anon nic.
revoke truncate, references, trigger on all tables in schema public from authenticated;
revoke all on all tables in schema public from anon;

-- 2) Budoucí tabulky: anon žádná práva, authenticated bez TRUNCATE/REFERENCES/TRIGGER.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke truncate, references, trigger on tables from authenticated;

-- 3) Trigger funkce: pevný search_path; updated_at respektuje hodnotu dodanou klientem
--    (last-write-wins podle času editace, ne času synchronizace – §10).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at is null or new.updated_at = old.updated_at then
    new.updated_at = pg_catalog.now();
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- 4) Konzistence dokončení projektu.
alter table public.project_enrollments
  add constraint project_enrollments_completed_consistent
  check ((status = 'completed') = (completed_at is not null));
