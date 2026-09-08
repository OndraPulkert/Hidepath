# Hidepath — styleguide pro implementaci

Tagline: **From first cut to finished craft.**
Charakter: moderní vzdělávací produkt × prémiový leathercraft magazín × klidná dílna. Materiál je patrný z fotografie, typografie a barev, ne ze skeuomorfismu. Žádné pilulky, žádné imitace kůže, žádné kovové gradienty.

## 1. Barvy

| token | hex | použití |
|---|---|---|
| canvas | #F4EFE6 | pozadí aplikace |
| parchment | #E7DCCB | neaktivní pruhy, tinty, jemné pozadí |
| paper | #FBF8F2 | karty, řádky seznamu, segmenty |
| cognac | #A85F32 | jediný akční akcent: primární tlačítko, odkazy, aktuální fáze |
| cognac-deep | #7E4423 | hover/pressed koňaku, text na cognac-tint |
| cognac-tint | #F1E1D3 | štítek Nezbytné / Chybí, bezpečnostní box |
| leather | #2B211C | text, navigace, tmavá „next action“ karta |
| forest | #33483B | hotovo, Mám, kontrolní bod, tlačítko Dokončit krok |
| forest-tint | #E1E7E0 | štítek Připraveno, box kontrolního bodu |
| brass | #B08A57 | objednáno, box Časté chyby |
| brass-tint | #F3EBDD | štítek Objednáno |
| success | #5E7A5B | potvrzení (tlumená, nikdy neon) |
| ink-2 | #6B5F57 | sekundární text |
| line | rgba(43,33,28,.14) | dělicí linky, okraje karet |
| line-strong | rgba(43,33,28,.34) | výraznější linky, okraje secondary tlačítek |

Pravidla: jeden koňakový akcent na obrazovku; stav nikdy jen barvou (vždy ✓ / text); leather-fill pouze pro text a jednu kartu na dashboardu; kontrast textu min. 4.5:1 (cognac na canvas použij jen pro ≥ 15 px semibold nebo použij cognac-deep).

## 2. Typografie

- Nadpisy: **Spectral** 500 (italic 400 pro anglické termíny). Google Fonts, podporuje češtinu.
- UI / instrukce: **Albert Sans** 400 / 500 / 600 / 700.
- Kód / kóty: ui-monospace (Menlo, SF Mono).

| role | písmo | velikost / váha | line-height |
|---|---|---|---|
| h1 | Spectral | 40–48 (clamp 28–48 podle šířky) / 500 | 1.1–1.15 |
| h2 | Spectral | 22–24 / 500 | 1.15 |
| číslo (stat) | Spectral | 28–34 / 500 | 1.1 |
| EN termín | Spectral italic | 15–18 / 400, ink-2 | 1.3 |
| titul řádku | Albert Sans | 19 / 600 | 1.3 |
| krok postupu | Albert Sans | 17 / 600 | 1.35 |
| tělo | Albert Sans | 15–16 / 400 | 1.5–1.6 |
| meta | Albert Sans | 13 / 400, ink-2 | 1.45 |
| kicker | Albert Sans | 12 / 400, uppercase, letter-spacing .08em | 1.3 |
| kód | mono | 11–12 | 1.3 |

Minimum 15 px pro instrukce; 13 px jen pro meta a štítky. Bez negativního prokladu znaků.

## 3. Geometrie a mezery

- Rádius: ovládací prvky 8 px · karty malé / obrázky 10 px · karty 16 px · kruh kroku 50 %.
- Mezery: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40.
- Dotykové cíle: min. 44 px; spodní lišta lekce 52 px.
- Linky: 1 px `line`; čárkované 1 px pro oddělovače řádků a šablony; čárkované kružnice jako dekor na tmavé kartě.
- Stíny: žádné (elevace linkou a barvou pozadí).
- Fotografie: filter `saturate(.72) contrast(.92) brightness(1.04)`, rádius 10/16.
- Layout: max-width 1200, padding clamp(16px, 4vw, 48px); gridy `repeat(auto-fit, minmax(300px, 1fr))`, přechod na jeden sloupec bez media queries.

## 4. Komponenty

| komponenta | specifikace |
|---|---|
| Button primary | bg cognac, text #fff, r 8, min-h 44, padding 10×20, 15/600; hover #8F5029; active cognac-deep; disabled opacity .45 |
| Button secondary | transparent, border 1 px line-strong, text leather; hover bg rgba(43,33,28,.07) |
| Button forest (lekce) | jako primary, bg forest; hover #26382D; min-h 52 |
| Button ghost/link | transparent, text cognac, min-h 44 |
| Stav položky (segment) | wrapper paper + border line, r 10, padding 4; 3 tlačítka min-h 44, r 8, 15/600; aktivní: bg forest (Mám) / brass (Objednáno) / cognac (Chci koupit), text #fff, prefix ✓ |
| Filtr (segment) | stejný wrapper; aktivní bg leather, text canvas |
| Stavový štítek | r 8, padding 6×12, 13/700; Připraveno forest-tint/forest · Objednáno · na cestě brass-tint/brass · Chybí cognac-tint/cognac-deep · Chybí · volitelné parchment/ink-2 · Zamčeno parchment/ink-2 · Hotovo forest-tint/forest · Aktuální krok cognac-tint/cognac-deep |
| Karta | bg paper, border 1 px line, r 16, padding 20–24 |
| Next-action karta | bg leather, text canvas, kicker brass, r 16, dekor čárkované kružnice rgba(244,239,230,.12–.18) |
| Řádek seznamu | flex-wrap; foto 84×84 r 10; název 19/600 + EN italic; popis 15 ink-2 max 64ch; cena 15/500 + odkaz „detail →“; segment stavu; oddělovač 1 px dashed line; padding 20×0 |
| Krok postupu | kruh 40 px, border 1.5 px leather, číslo Spectral 18; titul 17/600; tělo 15 ink-2 |
| Kontrolní bod | box forest-tint, border forest, r 16; checkbox 28 px r 8 border 1.5 forest, checked bg forest ✓ #fff; řádek min-h 44 |
| Upozornění | Časté chyby: border brass, transparent · Bezpečnost: border cognac, bg cognac-tint · Zámek: border 1 px dashed line-strong, bg paper |
| Fázová lišta | 6 sloupců; pruh 4 px r 2 bg parchment, fill forest (hotové) / cognac (aktuální, dílčí %); label kód mono 01–06 + název 12 px |
| Progress bar | 6–8 px r 3–4, bg parchment, fill forest (mám) + brass .55 (objednáno) |
| Spodní lišta lekce | sticky bottom, bg canvas, border-top line, padding 12×16 + safe-area; grid `auto auto 1fr`; Zpět · Na později · Dokončit |
| Navigace | sticky top, bg canvas, border-bottom line; brand Spectral 22/600 + tagline italic 13; položky r 8 min-h 40, aktivní bg leather |
| Input | bg paper, border line, r 10, min-h 44, 15 px, focus border cognac |
| Foto slot | drop zóna, aspect 4/3 · 3/2 · 16/10, washed filtr |

Focus: `outline: 2px solid cognac; outline-offset: 2px`.

## 5. Stavy dat (pravidla)

- Položka: `want` (Chci koupit) · `ordered` (Objednáno) · `have` (Mám).
- Připravenost: **jen `have` se počítá**; `ordered` = na cestě, nepočítá se; `want` = chybí.
- Skupiny: `ess` Nezbytné · `rec` Doporučené · `later` Kup později. Lekci blokují jen nezbytné položky ve stavu ≠ have; doporučené nikdy („Chybí · volitelné“).
- Lekce: hotová · aktuální (první nehotová a odemčená) · zamčená (blokovaná nezbytnou položkou) · budoucí.
- Fáze cesty (6): Výběr projektu · Vybavení · Příprava místa · Trénink na odřezku · Výroba pouzdra · Hodnocení. Zvlášť se zobrazuje „Celá cesta %“ a „Aktuální fáze %“.
- Postup se ukládá automaticky (localStorage / účet).
- Odborný obsah (vidličky 3,85 mm, nit ≈ 0,6 mm) je vzorový; před implementací projde korekturou.

## 6. Tailwind theme

Viz `hidepath.tailwind.js` (v4: `hidepath.theme.css`).
