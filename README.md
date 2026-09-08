# Hidepath

Instalovatelná webová aplikace (PWA), která provede úplného začátečníka prvním koženým
výrobkem: od nákupu správných nástrojů a materiálu až po hotové pouzdro na karty.

Produktová a technická specifikace: [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).
Vizuální systém: [`styleguide/`](./styleguide), schválený prototyp: [`prototype/`](./prototype).

## Stack

React 19 · Vite 8 · TypeScript (strict) · React Router 8 · Tailwind CSS 4 · TanStack Query ·
React Hook Form + Zod · vite-plugin-pwa (Workbox) · Vitest + Testing Library · Playwright (E2E, Milník 5) ·
Supabase (Milník 3) · Dexie (Milník 4)

## Požadavky

- Node.js **22.22+** (soubor `.nvmrc` → `nvm use`)
- pnpm 10 (`corepack enable` nebo `npm i -g pnpm`)

## Spuštění

```bash
pnpm install
pnpm dev            # vývojový server (service worker je ve vývoji vypnutý)
pnpm build          # typecheck + produkční build do dist/ (vyžaduje hostované VITE_SUPABASE_*)
pnpm build:local    # produkční build pro lokální ověření (povolí lokální Supabase nebo režim bez účtu)
pnpm preview        # náhled produkčního buildu včetně service workeru
```

## Kontroly

```bash
pnpm typecheck      # tsc -b
pnpm lint           # ESLint (typescript-eslint, react-hooks)
pnpm format:check   # Prettier
pnpm test           # Vitest (jsdom)
pnpm content:shot-list  # vygeneruje docs/content/shot-list.md ze slotů médií
pnpm check          # vše výše
```

## Konfigurace prostředí a Supabase

Zkopírujte `.env.example` do `.env.local`. Do klientského buildu se dostanou pouze proměnné
s prefixem `VITE_`, tedy jen veřejné hodnoty (Supabase URL a anon key). **Service-role key
nikdy nepatří do klienta ani do repozitáře.** Bez těchto hodnot běží aplikace lokálně bez účtu.

Lokální Supabase (vyžaduje Docker a Supabase CLI):

```bash
pnpm db:start       # db, auth, API, Studio (http://127.0.0.1:54323), Mailpit (http://127.0.0.1:54324); bez storage/realtime/edge
pnpm db:stop        # zastaví kontejnery, data zůstanou
pnpm db:reset       # znovu aplikuje migrace ze supabase/migrations
pnpm db:types       # regeneruje src/lib/supabase/database.types.ts
pnpm test:db        # integrační testy RLS proti lokální instanci
```

Hodnoty pro `.env.local` vypíše `supabase status` (API URL a anon key). Hostovaný projekt a jeho
správu popisuje [docs/deploy/supabase.md](./docs/deploy/supabase.md).

## Struktura

```
src/
├── app/          router, providers, definice tras (routes.ts), veřejná konfigurace
├── components/   ui/, layout/, sync/, equipment/, lessons/, projects/, illustrations/ (SVG)
├── content/      Zod schéma, katalog vybavení, projekt Pouzdro na karty + MDX texty lekcí
├── features/     doménová logika a data: inventory, progress, shopping, projects, data, auth, sync
├── lib/          pwa/ (online stav, aktualizace SW), utils/ (cn, formátování)
├── pages/        stránky tras
├── styles/       globals.css – Tailwind @theme s Hidepath tokeny
└── test/         setup, render helpery s in-memory repozitáři, mocky
scripts/          content:shot-list – generátor seznamu záběrů
public/icons/     PWA ikony (SVG zdroje + PNG)
docs/             milestones/ (záznam po milnících), decisions/ (ADR), content/ (poznámky, seznam záběrů)
```

Pravidla: doménová logika (připravenost, odemykání, postup, synchronizace) žije mimo React
komponenty. Komponenty konzumují spočítané view modely. Texty jsou česky; odborný obsah je
návrh, který před publikací projde korekturou.

## Stav

- [x] Milník 1 – základy aplikace ([docs/milestones/01-zaklady-aplikace.md](./docs/milestones/01-zaklady-aplikace.md))
- [x] Milník 2 – statický vertikální řez ([shrnutí](./docs/milestones/02-staticky-vertikalni-rez.md), [review a opravy](./docs/milestones/02b-review-a-opravy.md), [plán](./docs/milestones/02-plan.md), [ADR 001 média v lekcích](./docs/decisions/001-media-v-lekcich.md))
- [x] Milník 3 – Supabase persistence a magic-link přihlášení ([shrnutí](./docs/milestones/03-supabase-persistence.md), [review a opravy](./docs/milestones/03b-review-a-opravy.md))
- [ ] Milník 4 – offline data a synchronizace
- [ ] Milník 5 – kvalita a nasazení
