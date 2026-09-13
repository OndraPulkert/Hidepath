# 03c – Cesta učení: odvázání od pouzdra, ADR 002, osnovy, poznámky od ponku

Datum: 2026-09-13

## Kontext

Tři externí revize portálu (2026-09-13) se shodly na dvou věcech: Hidepath má být průvodce
**cestou učení**, ne návod na jeden výrobek, a **nikdo podle něj nic fyzicky nevyrobil**.
Rozhodování o struktuře učení podle odhadu je přesně chyba, kterou stálo pět revizních kol
u šablony opasku. Proto se udělalo jen to, co na fyzické výrobě nezávisí a přitom brání
zamčení do jednoho projektu – a jeden nástroj, který tu výrobu zaznamená.

## Co se udělalo

### 1. Aplikace už nejmenuje pouzdro (commit `d88194c`)

Definici pouzdra přímo importovalo sedm souborů mimo obsah. Teď ho jmenuje jediné místo –
registr projektů (`startingProject`). Stránky si aktivní projekt berou přes
`useActiveProject()`, texty lekcí přes `lessonBodiesFor(slug)`. `coupling.test.ts` hlídá,
že nic v `src/app`, `src/pages` ani `src/features` neimportuje `card-holder/` přímo ani
nezná slug jako literál.

### 2. ADR 002 – dovednosti se odvozují, neukládají

`docs/decisions/002-projekty-a-dovednosti.md`. Dovednost = množina checkpointů napříč
projekty; čistá funkce nad `checkpoint_progress`, žádná tabulka, žádná migrace nad živými
daty. Model se zavede až s druhým projektem.

### 3. Osnovy pásku a peněženky

`docs/content/osnova-opasek.md`, `osnova-penezenka.md` – obsah bez UI, z ověřených podkladů,
neověřené body označené. Vedle pouzdra ukazují, co je společné (steh, hrany, lepení, značení
podle šablony) a co patří jen výrobku.

### 4. Poznámky od ponku

Pole „Poznámka k této lekci" na stránce každé lekce, i zamčené. Ukládá se při opuštění pole
(telefon na stole, ruka na šídle – žádné tlačítko Uložit). Prázdný text záznam smaže.
Tlačítko **Zkopírovat všechny poznámky** složí poznámky k projektu do textu seřazeného podle
lekcí a dá ho do schránky; když schránka není dostupná, zobrazí text k ručnímu zkopírování.

Datový model: `Repositories.lessonNotes`, kolekce `hidepath.v1.lesson_notes`, přirozený klíč
`(projectSlug, lessonSlug)`, záznam ve stejném tvaru jako ostatní (id, userId, časy), aby šel
v Milníku 4 beze změny zařadit do synchronizace. **Do té doby zůstává v zařízení i při
přihlášení** – `DataProvider` skládá cloudové kolekce s lokálními poznámkami
(`CloudRepositories = Omit<Repositories, 'lessonNotes'>`); poznámky se nepřenášejí do účtu
a nepočítají se jako „lokální data k přenosu".

Proč právě toto a teď: je to nástroj na sběr seznamu míst, kde skutečný začátečník tápe –
recenzentův bod 6, můj návrh „zasekl jsem se tady" i doporučený další krok všech tří revizí.
Bez pole přímo v lekci ten seznam skončí na papírku vedle lepidla. Z něj se pak odvíjí dělení
lekce 6, pomoc „nedaří se mi" i to, které záběry natočit.

## Soubory

- `src/features/notes/types.ts`, `format-notes.ts`, `use-lesson-notes.ts`
- `src/components/lessons/lesson-notes.tsx`, `src/components/ui/input.tsx` (`Textarea`)
- `src/features/data/repositories.ts`, `query-keys.ts`, `data-provider.tsx`,
  `supabase-repositories.ts`, `migrate-local-data.ts`
- `src/pages/lesson-page.tsx`
- testy: `format-notes.test.ts`, `lesson-notes.test.tsx`

## Ověření

`tsc -b`, `eslint`, `prettier --check` čisté; **253 testů** (6 nových); `build:local` prošel.
Testy poznámek jdou přes celou aplikaci (skutečné trasy, in-memory úložiště): uložení při
opuštění pole, idempotence k lekci, přežití reloadu, smazání prázdným textem, export do
schránky s hlavičkou, názvem lekce a textem.

Při psaní testu se ukázala chyba, která by potkala i uživatele na pomalejším telefonu: pole
bylo při načítání dotazu `disabled`, takže psaní před doběhnutím dotazu se ztratilo. Pole se
nezamyká – čte se z tohoto zařízení, tedy okamžitě, a rozepsaný text má přednost.

Responzivitu jsem v prohlížeči znovu nespouštěl: komponenta skládá stávající primitiva
(Card, Label, Textarea ve stylu Input, Button) v jednosloupcovém rozvržení stránky lekce,
které je na telefon navržené. Kontrola v Chromu s přihlášením zůstává na uživateli.

## Nedostatky

- Poznámky jsou jen v zařízení. Na telefonu u ponku a na počítači u vývoje se nepotkají –
  přenáší je export do schránky. Synchronizace s Milníkem 4.
- Poznámka je k lekci, ne ke kroku. Číslo kroku píše uživatel do textu; je to záměr (méně
  UI, jeden pohled), ale kdyby se ukázalo, že zádrhely potřebují přesnější adresu, půjde
  klíč rozšířit o checkpoint bez změny tvaru záznamu.
- Bez fotky. Recenzentův bod 6 počítá s fotkou výrobku; ta potřebuje úložiště souborů
  a patří k „záznamu pokusů", až bude co fotit.

## Další krok – nezačíná se

Fyzická výroba pouzdra podle portálu s poznámkami u každé lekce. Vývoj se pak řídí tím
seznamem, ne odhadem.
