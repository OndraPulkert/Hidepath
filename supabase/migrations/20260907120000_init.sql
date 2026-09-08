-- Hidepath – základní schéma (IMPLEMENTATION.md §8).
-- UUID primární klíče, timestamptz, created_at/updated_at, RLS na každé tabulce s uživatelskými daty.

create extension if not exists "pgcrypto";

-- Společný trigger pro updated_at -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -------------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: delete own" on public.profiles
  for delete using (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profil vznikne automaticky s účtem.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- project_enrollments -----------------------------------------------------------------------
create table public.project_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null,
  content_version integer not null,
  status text not null check (status in ('active', 'completed', 'archived')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug)
);

alter table public.project_enrollments enable row level security;

create policy "enrollments: select own" on public.project_enrollments
  for select using (auth.uid() = user_id);
create policy "enrollments: insert own" on public.project_enrollments
  for insert with check (auth.uid() = user_id);
create policy "enrollments: update own" on public.project_enrollments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "enrollments: delete own" on public.project_enrollments
  for delete using (auth.uid() = user_id);

create trigger project_enrollments_set_updated_at
  before update on public.project_enrollments
  for each row execute function public.set_updated_at();

-- inventory_items ----------------------------------------------------------------------------
-- id generuje klient (idempotentní offline upsert).
create table public.inventory_items (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  equipment_slug text not null,
  status text not null check (status in ('want_to_buy', 'ordered', 'owned')),
  purchase_price_cents integer check (purchase_price_cents is null or purchase_price_cents >= 0),
  currency text not null default 'CZK',
  shop_name text,
  purchased_at date,
  notes text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, equipment_slug)
);

alter table public.inventory_items enable row level security;

create policy "inventory: select own" on public.inventory_items
  for select using (auth.uid() = user_id);
create policy "inventory: insert own" on public.inventory_items
  for insert with check (auth.uid() = user_id);
create policy "inventory: update own" on public.inventory_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inventory: delete own" on public.inventory_items
  for delete using (auth.uid() = user_id);

create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- lesson_progress ----------------------------------------------------------------------------
-- `locked` se neukládá; odvozuje se z prerekvizit a vybavení.
create table public.lesson_progress (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null,
  lesson_slug text not null,
  status text not null check (status in ('available', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug, lesson_slug)
);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress: select own" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "lesson_progress: insert own" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "lesson_progress: update own" on public.lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress: delete own" on public.lesson_progress
  for delete using (auth.uid() = user_id);

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- checkpoint_progress ------------------------------------------------------------------------
create table public.checkpoint_progress (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_slug text not null,
  lesson_slug text not null,
  checkpoint_slug text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_slug, lesson_slug, checkpoint_slug)
);

alter table public.checkpoint_progress enable row level security;

create policy "checkpoint_progress: select own" on public.checkpoint_progress
  for select using (auth.uid() = user_id);
create policy "checkpoint_progress: insert own" on public.checkpoint_progress
  for insert with check (auth.uid() = user_id);
create policy "checkpoint_progress: update own" on public.checkpoint_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checkpoint_progress: delete own" on public.checkpoint_progress
  for delete using (auth.uid() = user_id);

create trigger checkpoint_progress_set_updated_at
  before update on public.checkpoint_progress
  for each row execute function public.set_updated_at();

-- Indexy pro čtení podle uživatele (RLS filtruje přes user_id).
create index inventory_items_user_idx on public.inventory_items (user_id);
create index lesson_progress_user_project_idx on public.lesson_progress (user_id, project_slug);
create index checkpoint_progress_user_project_idx on public.checkpoint_progress (user_id, project_slug);
create index project_enrollments_user_idx on public.project_enrollments (user_id);

-- Oprávnění: tabulky smí používat jen přihlášení uživatelé (RLS omezí řádky na vlastní).
-- Anonymní role nemá k uživatelským datům přístup vůbec.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.project_enrollments to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.checkpoint_progress to authenticated;
-- service_role (jen server/administrace, nikdy v klientu) obchází RLS a potřebuje plná práva.
grant all on all tables in schema public to service_role;
grant usage on schema public to authenticated, service_role;
