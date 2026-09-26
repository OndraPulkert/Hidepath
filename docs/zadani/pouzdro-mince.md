# Pouzdro na karty s vsazenou mincí – střih (NÁVRH v4.1)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry se počítají z karty (54 × 85,6, 4 ks
  po 0,76 mm), tloušťky bankovek, průměru mince a přídavků; kontroly hlídají kolize (výřez × jazyk
  × druk × kapsa × průchodka, prstenec okna, šev dna, A4).
- Kresba: `scripts/coin-card-holder.ts` → **dva listy 1:1** s kalibrační úsečkou 50 mm:
  `docs/generated/pouzdro-mince-sablona.svg` + `.pdf` (pás, **A4 na šířku** – je 236 mm dlouhý) a
  `docs/generated/pouzdro-mince-kapsa.svg` + `.pdf` (kapsa s mincí a otvor formy, A4 na výšku).
- Postup skládání: `docs/generated/pouzdro-mince-postup.svg` + `.pdf` (A4 na šířku, 8 kroků od
  vyříznutí po hotové pouzdro zepředu a zezadu; proporce z modelu, ne 1:1).
- Průměr mince je **proměnná**: `pnpm pattern:coin-holder --coin 50kc` (27,5 mm), `20kc`
  (26 mm, třináctihran), `10kc` (24,5), `5kc` (23), `decision` (40, předloha) nebo číslo v mm
  (`--coin 30` i `--coin=30`). `--window 30` = průměr okna podle výsečníku, který máš.
  Každá odchylka jde do vlastního souboru (`…-mince-27-5mm`, `…-okno-30mm`), verzovaný výchozí
  střih se nepřepíše; list postupu se generuje jen pro výchozí střih. Neznámý nebo zdvojený
  přepínač je chyba. Varianta bez vnitřního panelu je zakázaná (jeden bok by zůstal otevřený).
- Strana jazyka je ve specifikaci (`tabSide: 'right'` = zepředu jazyk vpravo, výřez s průchodkou
  vlevo – jako předloha; `'left'` dá zrcadlový střih).

## Konstrukce (v4 – podle záběrů skládání, papírové šablony a fotek hotového kusu)

Ze záběrů je jisté: **dno je prošité bílou nití, boční hrany jsou ohyby** (zadní strana hotového
kusu nemá na jedné hraně žádné dírky), uvnitř jsou **dvě kapsy oddělené stěnou** a roh této
stěny s průchodkou je vidět výřezem zepředu i zezadu. Tomu odpovídá jeden pás:

```
[JAZYK]
[ZADNÍ panel][ohyb A][PŘEDNÍ panel][ohyb B][VNITŘNÍ panel]
```

| Prvek           | Rozměr (mince 40)                            | Poznámka                                                                                                                                                      |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel           | 72 × 104,1 mm (všechny tři)                  | rozměr předlohy (≈ 72–78 × 100–110 z fotek); šev dna 3,5 + karta 85,6 + 15                                                                                    |
| Ohyb A          | 16,63 mm                                     | zadní↔přední: π/2 · odstup přední↔zadní (10,59); karty i bankovky mají každé 1,3 mm vůle                                                                      |
| Ohyb B          | 9,13 mm                                      | přední↔vnitřní: π/2 · (kůže + karty + vůle 1,3) (předloha ≈ 11–13)                                                                                            |
| Perforace ohybů | Ø 1,5, 3 řady v ohybu A, 2 v užším ohybu B   | jako předloha; můstek 1,5 mm k čáře ohybu i mezi otvory                                                                                                       |
| Pás             | 241,8 × 104,1 mm + jazyk nad ním             | tři panely + dva ohyby                                                                                                                                        |
| Jazyk           | 33 mm široký, řez 44,5 mm                    | u levého konce pásu, konec R10; oblouk 19 (z odstupu zadního a předního panelu) + k druku 9,5 + přesah 11 + rezerva 5; zkracuje se 11 mm za osazený klobouček |
| Výřez na prst   | výkus U: 2 × čtvrtkruh R34 + dno přes ohyb A | po složení čtvrtkruh R34 v rohu předního i zadního panelu, odkryje 19 mm karty                                                                                |
| Průchodka       | Ø 5, 9 mm od hran vnitřního panelu           | po složení v rohu s výřezem, **nad kartami** (karty začínají 15 mm pod hranou)                                                                                |
| Druk            | patice 9,5 mm pod horní hranou předku        | u pravého boku na ose jazyka; příruba patice (≈ Ø 10) končí 14,5 mm, nad kartami                                                                              |
| Kapsa s mincí   | 55 × 54,5 mm, horní rohy R10, dolní R6       | list 2; na předek 36,55 mm pod horní hranou, 8,5 mm od boků                                                                                                   |
| Okno            | Ø 32 (výsečník po celých mm)                 | prstenec 4 mm (předloha má okno skoro přes celou minci, drží hůř)                                                                                             |
| Forma pro důlek | otvor Ø 44, deska ≥ 74 × 74, tl. ≥ 8 mm      | mince + 2 × 1,2 + vůle 1,6; hranu otvoru zaoblit                                                                                                              |

Jak se to skládá: vnitřní panel se ohne ohybem B za přední, zadní panel se ohybem A přehne přes
všechno. Vrstvy odpředu: přední (líc ven, kapsa s mincí) – karty – vnitřní – bankovky – zadní
(líc ven, motiv). Obě boční hrany jsou ohyby a nešijí se, dno se prošije skrz všechny tři vrstvy
(17 otvorů na panel, rozteč 4 mm, 3,5 mm od hrany). Tečky jsou na všech třech panelech zrcadlené
přes ohyby, dají se prosekat naplocho (jako u předlohy) a po složení lícují.

Jazyk vybíhá u levého konce pásu (zadní panel); po přeložení ohybem A skončí u pravého boku,
přehne se přes horní hranu a zapne drukem na přední panel – **druk je shora**, jako u předlohy.
Klobouček se osazuje až po zkoušce s vloženými kartami i bankovkami, pak se jazyk zkrátí 11 mm za
střed kloboučku (čárkovaná čára je jen orientační) a rohy se znovu zaoblí R10.

**Pás se obkresluje na LÍC** (hladkou stranu), stejně jako to dělá výrobce na videu. Kresba je
pohled zvenku: přední panel je nakreslený tak, jak bude vidět na hotovém kusu.

Mezi kořenem jazyka a výkusem zůstávají 3 mm rovné hrany a oblouček R2 v kořeni jazyka; roh
výkusu zabrousit.

Zadní kapsa (bankovky) je na straně jazyka otevřená i do boku – zadní panel tam končí volnou
hranou, drží jen šev dna. Předloha to má stejně (na fotce s bankovkami vějíř vychází právě tam).

### Odchylky od předlohy a nejistoty

- Rozměry nejsou odměřené z cizího střihu; poměry (jazyk ≈ polovina šířky, výřez R34, druk 9,5 mm
  pod hranou, kapsa ≈ 37 mm pod hranou) jsou odhad z fotek s mincí 40 mm jako měřítkem.
- Pořadí panelů v pásu (zadní – přední – vnitřní) je odvozené z toho, kde na záběrech leží jazyk,
  výřez a průchodka; jiné pořadí by dalo jiné umístění průchodky.
- Tloušťku bankovek (2 mm) a počet karet (4) je nutné ověřit na papírovém modelu s tím, co nosíš.

## Funkce a kapacita (spočteno z modelu)

- **Karty:** panel 72 mm, karta 54 → karty mají v kapse vůli (jako předloha), sedí na švu dna
  15 mm pod horní hranou. Pro 6 karet se ohyb B prodlouží na 9,5, ohyb A na 15 a jazyk o 2,4 mm
  (rezerva 5 mm to pokryje, ohyby ne – přegenerovat s `cardsCount`); 8 karet už nevychází.
- **Bankovky** (ČNB 140–170 × 69–74): složené **napůl** mají 69–74 mm napříč a vejdou se do zadní
  kapsy do 1000 Kč (tisícovka 74 mm na doraz); dvoutisícovka a pětitisícovka jen na třetiny.
- **Vytahování:** karty předním výřezem (palec na odkrytých 19 mm karty), bankovky zadním
  výřezem nebo bokem u jazyka.
- **Kování nad kartami:** příruba patice druku končí 14,5 mm a průchodky 14 mm pod horní hranou (ověřit s koupeným drukem),
  karty začínají v 15 mm. Průchodka dvoudílná s podložkou (hladká z obou stran).
- **Mince:** zasouvá se shora, vyjímá se palcem oknem posunutím nahoru. Nad mincí 5 mm kůže.
- **Kapsa vs. výřez a jazyk:** horní roh kapsy 5,4 mm od oblouku výřezu, zkrácený jazyk končí
  20,5 mm pod hranou, kapsa začíná v 36,55 mm; dno kapsy 9,5 mm nad švem dna. Při zapnutém
  jazyku karty nevyndáš (jazyk kryje 33 mm ze 72) – stejně jako u předlohy.

## Nářadí navíc oproti prvnímu pouzdru

- Osazovač druku pro klobouček 12,5 mm, druk s dříkem na 2 × 1,5 mm, průbojník na dřík.
- Průchodka Ø 5 (dvoudílná s podložkou), osazovač, průbojník 5 mm.
- Kruhový výsečník 32 mm na okno (nebo `--window` podle toho, co seženeš).
- Forma: překližka/HDPE ≥ 8 mm s otvorem Ø 44 (děrovka 44 mm), rovná přítlačná deska, 2–4 svěrky.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Pás 242 × 149 mm (s jazykem) potřebuje arch A4 (297 × 210); odřezek na kapsu ≥ 70 × 70 se vedle
nevejde, je potřeba ještě kus A5 (nebo větší arch). Barvené třísločiněné lícové usně 1,2 mm z italské koželužny, A4 = 251 Kč, A5 = 57 Kč:

| Barva                                                                                                                                     | Poznámka                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Verde (lahvová zeleň)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde)                                | nejblíž předloze Red Forest; výrobce ji výslovně doporučuje na pouzdra na karty a k mosaznému kování |
| [Blu (tmavě modrá)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu)                                      | stejná řada                                                                                          |
| [Rosso (červená)](https://craft-point.cz/products/trislocinena-hovezi-licova-kuze-1-2-mm-rosso)                                           | stejná řada                                                                                          |
| [T. moro (tmavě hnědá)](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro), Karamelová, Whisky, Černá, Giallo | stejná řada, klasické odstíny                                                                        |
| [Čokoládová 1,5 mm](https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm), A4 222 Kč                                      | jediná barvená 1,5 mm                                                                                |

Doporučení: **celé pouzdro z Verde 1,2 mm** – šev dna jde skrz tři vrstvy, s 1,2 mm je to 3,6 mm
místo 4,5 mm. Model pak spustit s `bodyThicknessMm: 1.2` (ohyby 6,7 a 11,7 mm, jazyk 39,6 mm). Tvarování za
mokra nejdřív zkusit na A5 stejné barvy.

## Postup

1. Vyříznout pás podle listu 1 (obkreslený na líc) a odřezek na kapsu ≥ 70 × 70. Prosekat
   perforace ohybů a otvory dna na všech třech panelech (naplocho). Zaleštit hrany, které budou po složení uvnitř (horní hrana vnitřního panelu,
   oblouk výkusu, jazyk).
2. Kapsa (list 2): do odřezku orýsovat obrys a prosekat otvory švu, pak navlhčit, položit
   **lícem dolů** na formu, na rub minci, přiklopit deskou, stáhnout svěrkami, nechat zaschnout.
3. Vyříznout obrys kapsy se středem na důlku a vyseknout okno.
4. Přišít kapsu na přední panel (36,55 mm pod horní hranou, 8,5 mm od boků), osadit patici druku
   a **průchodku do vnitřního panelu – obojí naplocho, před složením**.
5. Složit: vnitřní panel ohybem B za přední, zadní panel ohybem A přes všechno.
6. Slepit dno (otvory prosekané naplocho lícují) a prošít skrz všechny vrstvy.
7. Vložit karty i bankovky, které nosíš, přehnout jazyk, obtisknout patici, osadit klobouček,
   jazyk zkrátit 11 mm za střed kloboučku a zaoblit R10.
8. Srazit a zaleštit vnější hrany. Protáhnout šňůrku průchodkou.

## Co je nutné ověřit před řezáním kůže

- Papírový model s kartami a bankovkami: obě boční hrany musí jít ohnout bez tahu, jazyk dosáhnout
  na patici, průchodka musí po složení padnout do výřezu.
- Důlek na odřezku: po zaschnutí se obrys kapsy vejde a mince vklouzne.
- Šev dna skrz tři vrstvy: zkusit na odřezcích, jestli ho zvládneš šídlem/vidličkou.

## Historie návrhu

- v1 (2026-09-18 ráno): obdélník s chlopní přes celou šířku a dělicím panelem – zamítnuto.
- v2/v2.1: jeden díl s úzkým jazykem, výřez v zadním panelu, nižší přední panel – špatně
  přečtené záběry.
- v3/v3.1: přední panel plné výšky, výřez v předku, ohyb ve dně a šité boky – vzhled zepředu
  seděl, konstrukce ne (předloha má dno šité a boky ohnuté).
- **v4 (2026-09-19):** podle záběrů skládání, papírové šablony na kůži a zadní strany hotového
  kusu – pás tří panelů ohýbaný na obou bocích, šité jen dno, vnitřní panel dělí karty a
  bankovky a nese průchodku, výřez jako oblouk U přes ohyb A, list A4 na šířku, obkreslení na líc.
- **v4.1 (2026-09-26):** výřez opraven na výkus (kresba měla zaoblený roh a palec by kartu
  nechytil). Po dvou posudcích rozměr předlohy 72 × 104 mm (kování bylo na kartách, bankovky jen
  na třetiny), perforace ohybů, oblouk jazyka π·stoh/2, průchodka naplocho ve 4. kroku, kapsa a
  forma na druhém listu, opravy zrcadlené varianty, přísnější kontroly A4 a CLI.
- v4.4 (2026-09-26): virtuální složení (test na nakresleném SVG) ukázalo, že bankovky neměly vůli
  a jazyk byl o 2 mm krátký – ohyby se teď počítají z odstupů vrstev (každá kapsa 1,3 mm vůle) a
  oblouk jazyka ze skutečného odstupu zadního a předního panelu.
- v4.2 (2026-09-26): vůle 2 mm v obou ohybech, patice 9,5 mm pod hranou (příruba nad kartami),
  rezerva jazyka 7 mm a zkracování podle kloboučku, otvory dna na všech panelech naplocho.
