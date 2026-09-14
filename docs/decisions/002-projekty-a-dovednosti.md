# ADR 002 – Více projektů, dovednosti odvozené z pokroku

Datum: 2026-09-13 · Stav: přijato

## Kontext

Hidepath má být průvodce **cestou učení** brašnářství, kde je pouzdro na karty první zastávka,
ne jediný cíl. Externí revize (2026-09-13) správně upozornila, že aplikace je zadrátovaná na
pouzdro: jeho definici přímo importovalo **sedm souborů mimo obsah** – routy, onboarding,
přehled, lekce, dílna, nákupy i detail položky. Druhý projekt (peněženka, pásek) by znamenal
zásah do každého z nich.

Revize zároveň navrhla oddělit **dokončený výrobek** od **zvládnuté dovednosti**: odškrtnutá
lekce šití neznamená, že si v šití věříš, a technika společná více projektům (sedlářský steh,
sražení hran, lepení) by měla mít vlastní návod, na který projekty odkážou.

Datový model pokroku je dnes v Supabase: `project_enrollments`, `lesson_progress`
a `checkpoint_progress`, poslední klíčovaná `project_slug / lesson_slug / checkpoint_slug`.
Tabulky jsou už generické pro víc projektů. Pojem „dovednost" v kódu neexistuje; v obsahu je
jen `skills: string[]` jako popisky „co se naučíš" na stránce projektu.

Zároveň platí, že **žádný projekt nebyl fyzicky vyroben podle portálu**. Rozhodovat o struktuře
učení podle odhadu je přesně chyba, kterou stálo pět revizních kol u šablony opasku.

## Rozhodnutí

1. **Jediné místo, které pouzdro jmenuje, je registr projektů** `src/content/projects/index.ts`
   (`projects`, `findProject`, `startingProject`). Stránky si aktivní projekt berou přes
   `useActiveProject()` v `src/features/projects/`; dlouhé texty lekcí přes `lessonBodiesFor(slug)`.
   Test `coupling.test.ts` hlídá, že nic v `src/app`, `src/pages` ani `src/features` neimportuje
   `card-holder/` přímo ani nezná jeho slug jako literál.

2. **Dovednosti se odvozují, neukládají.** Dovednost = pojmenovaná množina checkpointů napříč
   projekty; je zvládnutá, když jsou splněné. Je to čistá funkce nad `checkpoint_progress`,
   patří do `src/lib`, je testovatelná a **nevyžaduje novou tabulku ani migraci** nad živými
   daty. Toto rozhodnutí se dělá teď, protože je dnes zdarma a za půl roku (s daty uživatelů)
   drahé.

3. **Struktura pro víc projektů se staví z osnov, ne z odhadu.** Před druhým projektem vzniknou
   osnovy peněženky a pásku jako obsahové dokumenty (`docs/content/osnova-*.md`). Teprve tři
   osnovy vedle sebe ukážou, co je společné a co patří konkrétnímu výrobku; z toho vzniknou
   sdílené návody technik. Aplikace se pro víc projektů rozšíří až s druhým skutečným projektem.

4. **Pořadí prací:** fyzická výroba pouzdra podle portálu → seznam míst, kde uživatel tápal →
   teprve pak dělení lekce 6, „nedaří se mi" a ukázky. Body 1–3 tohoto ADR na výrobě nezávisí
   a dělají se souběžně.

5. **Trénink před každým projektem, ne všechno najednou** (návrh autora, 2026-09-14). Každý projekt
   má vlastní tréninkovou fázi – pouzdro ji už má („04 Trénink na odřezku") – a její obsah se
   **odvozuje**: techniky, které projekt potřebuje, minus techniky už natrénované v předchozích
   projektech. Jednotkou dovednosti je **technika + třída materiálu** (řez 1,2 mm ≠ řez 3,5 mm),
   takže stará technika v novém materiálu se trénuje znovu. Stará technika ve stejném materiálu
   se nabízí jako **volitelné připomenutí** (zkrácené cvičení, jde přeskočit), protože dovednost
   vyprchává. Důsledek pro nákup: odřezky a nástroje na trénink se kupují **s projektem**, ze
   stejného materiálu, ne dopředu.

## Důsledky

- Přidání druhého projektu = jeden záznam v registru, jeden řádek v `lessonBodiesFor`
  a rozhodnutí v `useActiveProject()` podle zápisu; žádná stránka se nemění.
- `useActiveProject()` dnes vrací `startingProject`. Je to hook, ne konstanta, aby přechod na
  volbu podle zápisu nevyžadoval úpravu volajících.
- Model dovedností se **nezavádí**, dokud neexistuje druhý projekt – do té doby není co
  propojovat. Zavede se jako odvozený, ne ukládaný.
- `CARD_HOLDER_SLUG` v `src/app/routes.ts` zrušen; navigace používá `startingProject.slug`.
- Routy tím získaly závislost na obsahu (`@/content/projects`). Obsah je čistá data bez závislosti
  na aplikaci, cyklus nevzniká; MDX těla lekcí jsou v samostatném modulu, aby se do rout netahala.

## Co zůstává otevřené

- Jak se vybírá aktivní projekt, když má uživatel zápisů víc (poslední aktivní? volba na
  přehledu?). Rozhodne se s druhým projektem.
- Zda mají mít dovednosti vlastní stránku („připomenout a procvičit"), nebo jen odkaz na
  sdílený návod techniky. Rozhodne se podle seznamu zádrhelů z první výroby.
