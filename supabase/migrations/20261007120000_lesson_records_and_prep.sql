-- Zápisník (lesson_records) a „Připravte si“ (lesson_prep_checks).
-- Obě tabulky se synchronizují přes lokální outbox (last-write-wins podle updated_at, §10).
-- Starší zápis z offline zařízení nesmí přepsat novější řádek: trigger reject_stale_update
-- ho tiše zahodí (UPDATE vrátí 0 řádků) a klient si pak stáhne novější stav.

-- Funkce: odmítnout zastaralý zápis ------------------------------------------------------------
create or replace function public.reject_stale_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end;
$$;

revoke execute on function public.reject_stale_update() from public, anon, authenticated;

-- lesson_records -------------------------------------------------------------------------------
-- Hodnota pole ze zápisníku: číslo, text nebo hodnota volby; null = vymazáno (náhrobek).
create table public.lesson_records (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lesson_slug text not null check (lesson_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  field_id text not null check (field_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  value jsonb,
  content_version integer not null check (content_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug, field_id),
  constraint lesson_records_value_scalar
    check (value is null or jsonb_typeof(value) in ('number', 'string')),
  -- Délka ve znacích (ne v bajtech): text z UI má nejvýš 1000 znaků a s diakritikou
  -- a escapováním JSON by se do 2000 bajtů nemusel vejít a zasekl by se v outboxu.
  constraint lesson_records_value_size
    check (value is null or char_length(value #>> '{}') <= 2000)
);

alter table public.lesson_records enable row level security;

create policy "lesson_records: select own" on public.lesson_records
  for select using (auth.uid() = user_id);
create policy "lesson_records: insert own" on public.lesson_records
  for insert with check (auth.uid() = user_id);
create policy "lesson_records: update own" on public.lesson_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_records: delete own" on public.lesson_records
  for delete using (auth.uid() = user_id);

-- Triggery stejné události běží v abecedním pořadí názvů: „…_a_reject_stale“ musí běžet
-- PŘED „…_set_updated_at“, jinak by set_updated_at přepsal čas a starý zápis by prošel.
create trigger lesson_records_a_reject_stale
  before update on public.lesson_records
  for each row execute function public.reject_stale_update();

create trigger lesson_records_set_updated_at
  before update on public.lesson_records
  for each row execute function public.set_updated_at();

-- lesson_prep_checks ---------------------------------------------------------------------------
-- Zaškrtnutá položka „Připravte si“; item_key např. print:pattern-sheets:<id>, req:<id>, mat:<slug>.
create table public.lesson_prep_checks (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lesson_slug text not null check (lesson_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  item_key text not null check (char_length(item_key) between 1 and 120),
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug, lesson_slug, item_key)
);

alter table public.lesson_prep_checks enable row level security;

create policy "lesson_prep_checks: select own" on public.lesson_prep_checks
  for select using (auth.uid() = user_id);
create policy "lesson_prep_checks: insert own" on public.lesson_prep_checks
  for insert with check (auth.uid() = user_id);
create policy "lesson_prep_checks: update own" on public.lesson_prep_checks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_prep_checks: delete own" on public.lesson_prep_checks
  for delete using (auth.uid() = user_id);

create trigger lesson_prep_checks_a_reject_stale
  before update on public.lesson_prep_checks
  for each row execute function public.reject_stale_update();

create trigger lesson_prep_checks_set_updated_at
  before update on public.lesson_prep_checks
  for each row execute function public.set_updated_at();

-- Oprávnění: jen přihlášení (RLS omezí na vlastní řádky); anon nic; bez TRUNCATE/REFERENCES/TRIGGER.
revoke all on public.lesson_records from anon;
revoke all on public.lesson_prep_checks from anon;
revoke all on public.lesson_records from authenticated;
revoke all on public.lesson_prep_checks from authenticated;
grant select, insert, update, delete on public.lesson_records to authenticated;
grant select, insert, update, delete on public.lesson_prep_checks to authenticated;
grant all on public.lesson_records to service_role;
grant all on public.lesson_prep_checks to service_role;
