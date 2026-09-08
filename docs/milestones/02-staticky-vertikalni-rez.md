# Milník 2 – statický vertikální řez

Datum: 2026-09-07 · Navazuje na [plán](./02-plan.md) a [ADR 001](../decisions/001-media-v-lekcich.md).

## Co vzniklo

- **Schéma obsahu** (`src/content/schema.ts`): Zod schémata pro vybavení, požadavky projektu,
  fáze, lekce s kroky a kontrolními body, sloty médií, šablonu 1:1 a projekt. Projekt se validuje
  včetně křížových odkazů (prerekvizity, fáze, vybavení, povinný kontrolní bod).
- **Obsah** (`src/content/`): 13 položek vybavení s detailem (k čemu slouží, co koupit, na co si
  dát pozor, nekupujte, alternativy, orientační ceny s poznámkou o zdroji), projekt Pouzdro na
  karty se 6 lekcemi ve 3 fázích, 6 MDX textů lekcí, šablona 1:1 (zadní díl 100 × 70, přední kapsa
  100 × 58, steh 3,5 mm, kontrolní úsečka 50 mm). Vše `reviewStatus: draft`.
  Oproti prototypu: rozteč „3,85–4 mm“ a nová položka „Tvrdá deska pod děrování“ (nezbytná,
  běžně doma) – důvod v `docs/content/notes-vybaveni.md`.
- **Doménové funkce** (čisté, testované, `src/features/`):
  - `inventory/readiness.ts` – připravenost; jen `owned` se počítá, blokují jen nezbytné.
  - `progress/lesson-availability.ts` – zámky lekcí (prerekvizity + nezbytné vybavení), aktuální
    lekce, `canComplete`; `locked` se nikdy neukládá.
  - `progress/journey.ts` – jediná funkce postupu: fáze, „Celá cesta“, „Aktuální fáze“ z povinných
    úkolů (výběr projektu, nezbytné vybavení, povinné kontrolní body, dokončení projektu).
  - `progress/next-action.ts` – co udělat právě teď (tmavá karta na přehledu).
  - `shopping/budget.ts` – zbývající rozpočet (nezbytné / doporučené zvlášť, objednané zůstává
    a je označené), „Evidované náklady“ vs. „Investováno“.
- **Lokální data** (`src/features/data/`): kolekce v localStorage s rozhraním `list/upsert`
  a klientskými UUID, repozitáře přes `DataProvider`, React Query hooky s optimistickými zápisy
  (inventář, zápis do projektu, kontrolní body, dokončení lekce, dokončení projektu). Rozhraní je
  připravené na výměnu za Supabase (M3) a Dexie + outbox (M4).
- **View model** `features/projects/use-project-state.ts` – komponenty čtou jen spočítané hodnoty.
- **Obrazovky podle prototypu**: onboarding (výběr projektu + „Co už máte doma?“), přehled
  (fázová lišta, next-action karta se všemi stavy, vybavení, rozpočet, kam dál), nákupní seznam
  (souhrn, filtry, segment stavu, skupiny), detail položky, dílna (kategorie, formulář cena /
  obchod / datum s RHF + Zod), přehled projektu (fáze, lekce se stavem, šablona, vybavení),
  detail lekce pro telefon (cíl, připravte si, MDX text, kroky s médii, časté chyby, bezpečnost,
  kontrolní body, zámek s odkazem, sticky lišta), tisková šablona 1:1 (`/projects/:slug/template`,
  SVG v milimetrech, `@page A4`).
- **Média** (ADR 001): komponenta `MediaSlot` – plánovaný záběr ukazuje popisek, dostupná
  ilustrace se kreslí inline (4 SVG: šablona, odsazení stehu, sedlářský steh, úhel čepele), video
  se otevírá online. `pnpm content:shot-list` generuje `docs/content/shot-list.md` (47 slotů,
  43 k natočení).

## Ověření

| Kontrola                       | Výsledek                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`               | bez chyb                                                                                                                                                    |
| `pnpm lint`                    | bez chyb i varování                                                                                                                                         |
| `pnpm format:check`            | bez rozdílů                                                                                                                                                 |
| `pnpm test`                    | 15 souborů, 118 testů (pravidla připravenosti, blokování, prerekvizity, postup, rozpočet, next action, validace obsahu, lokální kolekce, hlavní cesta v UI) |
| `pnpm build`                   | OK, precache 19 položek (~648 KiB)                                                                                                                          |
| Screenshoty 1280 / 390 px      | přehled, nákupy, detail položky, dílna, projekt, lekce 2 (aktuální), lekce 3 (zamčená), šablona, onboarding – bez přetečení, bez chyb v konzoli             |
| Hlavní cesta (integrační test) | onboarding → zápis projektu a „Mám“ z domova → přepnutí stavu položky → odemknutí lekce po doplnění nezbytného → odškrtání bodů → Dokončit → další lekce    |

## Známé nedostatky

- Veškerý odborný text je návrh ke korektuře; šablona není ověřená na skutečné kůži.
- Fotky a videa neexistují, všech 43 záběrů je ve stavu „natočit“ (seznam v `docs/content/shot-list.md`).
- Data jsou jen v prohlížeči tohoto zařízení (localStorage). Účet a synchronizace přijdou v M3/M4.
- JS bundle ~600 kB (gzip 185 kB); rozdělení podle tras má smysl až s M3 (Supabase klient).
- Stav „Připravenost nezbytného“ na nákupním seznamu počítá jen nezbytné položky (prototyp ukazoval
  jiné číslo bez definice); definice je záměrně jednoznačná.
- Tisk šablony přes prohlížeč místo PDF souboru; PDF doplníme po ověření šablony.
