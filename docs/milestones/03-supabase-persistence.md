# Milník 3 – Supabase persistence a přihlášení

Datum: 2026-09-07

## Co vzniklo

- **Databáze** (`supabase/migrations/20260907120000_init.sql`): tabulky `profiles`,
  `project_enrollments`, `inventory_items`, `lesson_progress`, `checkpoint_progress` podle §8 –
  UUID, `timestamptz`, `created_at`/`updated_at` s triggerem, unikátní klíče, CHECK na stavy
  (`locked` do DB nejde). RLS na všech tabulkách: select/insert/update/delete jen pro
  `auth.uid() = user_id`; anonymní role nemá k datům přístup. Profil vzniká triggerem při
  založení účtu. `projectSlug` zůstává text (příprava na budoucí uživatelské projekty).
- **Typy** generované z databáze: `pnpm db:types` → `src/lib/supabase/database.types.ts`.
- **Klient** (`src/lib/supabase/client.ts`): jen URL + anon key z `VITE_*`. Bez konfigurace je
  `null` a aplikace běží lokálně bez účtu; ochrana tras se zapíná automaticky s konfigurací.
- **Přihlášení magic linkem** (PKCE): `LoginPage` volá `signInWithOtp`, návratová adresa cestuje
  přes `/auth/callback?returnTo=…` (`buildEmailRedirectUrl`, bezpečné jen relativní cesty).
  Stavy: odesíláme, odesláno (s „poslat znovu“), chyby včetně rate limitu a vypršelého odkazu.
  Odhlášení v navigaci.
- **Relace** (`SessionProvider`): `getSession` + `onAuthStateChange`; `RequireAuth` rozhoduje
  přes čistou `decideRouteGuard`.
- **Repozitáře nad Supabase** (`features/data/supabase-repositories.ts`): stejné rozhraní jako
  lokální kolekce. Řádky se validují Zodem, upsert jde přes `id`; kolize přirozeného klíče
  (stejná položka z druhého zařízení) se sloučí do existujícího řádku.
- **Výběr zdroje dat** (`DataProvider`): přihlášený + Supabase → cloud, jinak lokální úložiště.
  Při změně uživatele se vyprázdní cache dotazů. Po prvním přihlášení se lokálně pořízená data
  přenesou do účtu (`migrateLocalData`, last-write-wins podle `updatedAt`) a lokální kopie smaže.
- **Skripty**: `pnpm db:start`, `pnpm db:reset`, `pnpm db:types`, `pnpm test:db`
  (integrační test RLS proti lokální instanci; service-role key jen v tomto skriptu).

## Ověření

| Kontrola                  | Výsledek                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typecheck, lint, prettier | bez chyb                                                                                                                                                                                                            |
| unit testy                | 120 testů (nové: magic link, přenos lokálních dat, ochrana tras se zapnutou relací)                                                                                                                                 |
| `pnpm test:db`            | 3 integrační testy proti lokální Supabase: izolace uživatelů (select/insert/update cizích dat odmítnuto), idempotentní upsert + sloučení kolize, zápis projektu/lekce/bodů, CHECK odmítne `locked`, trigger profilu |
| build                     | OK                                                                                                                                                                                                                  |

## Hostovaný projekt

Založen přes CLI (viz [docs/deploy/supabase.md](../deploy/supabase.md)): ref `wbniutsavsyqrmokbdlj`,
region Frankfurt, migrace aplikovaná, auth konfigurace pushnutá, RLS ověřené integračními testy
i proti hostované instanci. Před nasazením zbývá doplnit doménu aplikace do redirect URL a dát
`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` do prostředí nasazení; volitelně vlastní SMTP.

## End-to-end ověření (lokální Supabase + Mailpit)

Skriptem v Playwrightu nad produkčním buildem: `/workshop` → `/login?returnTo=%2Fworkshop` → odeslání
odkazu → e-mail v Mailpitu → klik na odkaz → `/auth/callback` → `/workshop` s tlačítkem Odhlásit →
přepnutí paličky na „Mám“ zapsalo řádek do `inventory_items` pod správným `user_id` → lokálně
pořízený nůž se po přihlášení přenesl do účtu a lokální kopie se smazala → reload drží relaci →
Odhlásit vrátí na `/login?returnTo=…`.

Poznámka k lokálnímu Dockeru: hodiny VM byly o ~2 s napřed, první požadavek po přihlášení občas
vrátil 401 „JWT issued at future“. Přenos lokálních dat proto zkouší až 3× s odstupem; v produkci
(NTP) se to neprojevuje.

## Známé nedostatky

- Magic link jsem ověřil lokálně (Mailpit na `http://127.0.0.1:54324`), ne s reálným poštovním serverem.
- Bez připojení k síti cloud repozitáře selžou s viditelnou chybou; offline zápisy a fronta přijdou v Milníku 4.
- Bundle roste o supabase-js (~+120 kB gzip); rozdělení podle tras zůstává pro M4/M5.
