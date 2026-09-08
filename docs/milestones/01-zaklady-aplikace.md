# Milník 1 – základy aplikace

Datum: 2026-09-04

## Co vzniklo

- **Projekt**: Vite 8 + React 19 + TypeScript strict (`noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`), alias `@/` → `src/`, pnpm, Node 22 (`.nvmrc`).
- **Nástroje**: ESLint (typescript-eslint type-checked, react-hooks, react-refresh), Prettier
  s Tailwind pluginem, Vitest + Testing Library (jsdom), skript `pnpm check`.
- **Design tokeny**: Tailwind 4 `@theme` v `src/styles/globals.css` podle
  `styleguide/hidepath.theme.css` (barvy, fonty Spectral / Albert Sans, velikosti textu, rádiusy,
  dotykové rozměry, animace `hp-in`). Utility `kicker`, `washed`, `px-page`, `pb-safe`.
- **Základní komponenty** (`src/components/ui`): Button (primary / secondary / forest / ghost /
  leather, velikosti md 44 px, lg 52 px, nav), Card (paper / leather / forest / cognac / brass /
  dashed), Tag (stavové štítky s explicitním textem), Kicker, Input + Label, PageHeader,
  ScaffoldNotice (poctivé označení rozpracované části).
- **Shell**: sticky horní navigace s brandem a čtyřmi položkami (aktivní = leather výplň),
  `main` max 1200 px s paddingem `clamp(16px, 4vw, 48px)`, stavový pruh připojení,
  sticky spodní lišta lekce se safe-area (`StickyActionBar`).
- **Routing** (`src/app/routes.ts`, `router.tsx`): všechny trasy z IMPLEMENTATION.md §6,
  `/` → onboarding (rozhodnutí `resolveHomeRoute`), hranice chyb, 404. Ochrana tras
  (`RequireAuth`) je připravená, rozhoduje čistá funkce `decideRouteGuard`; zapne se v Milníku 3
  (`appConfig.authGuardEnabled`). Návratová adresa přes `returnTo` s ochranou proti open redirectu.
- **PWA**: manifest (cs, standalone, canvas barvy), ikony 192/512/maskable/apple-touch, Workbox
  `generateSW` – precache app shellu, SPA navigation fallback, cache-first pro Google Fonts,
  registrace v režimu `prompt` (aktualizace je viditelný stav s tlačítkem „Aktualizovat“).
- **Offline**: stránka `/offline` (součást precache), hook `useOnlineStatus`
  (`useSyncExternalStore`), pruh „Offline“ ve shellu.
- **Doménové zárodky**: `features/sync/sync-status.ts` (popis stavu synchronizace včetně
  skloňování), `features/auth/session.ts` (typy relace, přesměrování), `lib/utils/format.ts`
  (Kč, procenta, kódy kroků, české plurály).

## Ověření

| Kontrola            | Výsledek                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`    | bez chyb                                                                                                                                      |
| `pnpm lint`         | bez chyb i varování                                                                                                                           |
| `pnpm format:check` | bez rozdílů                                                                                                                                   |
| `pnpm test`         | 7 souborů, 46 testů, vše prošlo                                                                                                               |
| `pnpm build`        | build OK, precache 19 položek (~505 KiB)                                                                                                      |
| Responzivita        | screenshoty 1280 px a 390 px pro dashboard, onboarding, nákupy, lekci, login, offline, 404 – bez horizontálního přetečení, bez chyb v konzoli |
| Service worker      | registrován na produkčním náhledu, manifest nalinkovaný                                                                                       |

## Známé nedostatky

- Stránky jsou scaffoldy: nesou hlavičku, rozložení a text, co přijde, ale ne obsah projektu.
  Tlačítka ve spodní liště lekce a odeslání na loginu jsou záměrně neaktivní.
- Ochrana tras je vypnutá až do Milníku 3; `RequireAuth` používá zástupnou relaci.
- Stavový pruh zatím nezná počet čekajících změn ani chyby synchronizace (outbox v Milníku 4).
- Ikony jsou zástupné, odvozené z motivu prototypu; finální brand asset je potřeba dodat.
- JS bundle má ~460 kB (gzip 144 kB); rozdělení podle tras má smysl až s obsahem lekcí (MDX).
- Prototypem inspirovaný obsah (texty karet) je návrh a projde korekturou.
