-- Poznámky od ponku (lesson_notes) a ochrana inventáře před zastaralým zápisem.
-- Obě tabulky se synchronizují přes lokální outbox (last-write-wins podle updated_at, §10).

-- lesson_notes ---------------------------------------------------------------------------------
-- Jedna poznámka na lekci. Prázdný text = vymazáno (náhrobek): smazání řádku by se při
-- synchronizaci z jiného zařízení vrátilo. Délka ve znacích odpovídá limitu pole v UI
-- (LESSON_NOTE_MAX_LENGTH = 4000).
create table public.lesson_notes (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lesson_slug text not null check (lesson_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug, lesson_slug),
  constraint lesson_notes_text_size check (char_length(text) <= 4000)
);

alter table public.lesson_notes enable row level security;

create policy "lesson_notes: select own" on public.lesson_notes
  for select using (auth.uid() = user_id);
create policy "lesson_notes: insert own" on public.lesson_notes
  for insert with check (auth.uid() = user_id);
create policy "lesson_notes: update own" on public.lesson_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_notes: delete own" on public.lesson_notes
  for delete using (auth.uid() = user_id);

-- Triggery stejné události běží v abecedním pořadí názvů: „…_a_reject_stale“ musí běžet
-- PŘED „…_set_updated_at“, jinak by set_updated_at přepsal čas a starý zápis by prošel.
create trigger lesson_notes_a_reject_stale
  before update on public.lesson_notes
  for each row execute function public.reject_stale_update();

create trigger lesson_notes_set_updated_at
  before update on public.lesson_notes
  for each row execute function public.set_updated_at();

-- Oprávnění: jen přihlášení (RLS omezí na vlastní řádky); anon nic; bez TRUNCATE/REFERENCES/TRIGGER.
revoke all on public.lesson_notes from anon;
revoke all on public.lesson_notes from authenticated;
grant select, insert, update, delete on public.lesson_notes to authenticated;
grant all on public.lesson_notes to service_role;

-- inventory_items: odmítnout zastaralý zápis -------------------------------------------------
-- Inventář se nově zapisuje lokálně a odchází z outboxu i po hodinách offline. Klientské
-- razítko (nextUpdatedAt) je jen pozdější než stav známý v tomto zařízení; novější změnu
-- z jiného zařízení nezná. Bez triggeru by ji starší offline zápis na serveru přepsal.
create trigger inventory_items_a_reject_stale
  before update on public.inventory_items
  for each row execute function public.reject_stale_update();
