# Pouzdro na karty s vsazenou mincí – střih (NÁVRH v4)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry se počítají z karty (54 × 85,6, 4 ks
  po 0,76 mm), tloušťky bankovek, průměru mince a přídavků; kontroly hlídají kolize (výřez × jazyk
  × druk × kapsa × průchodka, prstenec okna, šev dna, A4).
- Kresba: `scripts/coin-card-holder.ts` → `docs/generated/pouzdro-mince-sablona.svg` + `.pdf`
  (**A4 na šířku**, 1:1, kalibrační úsečka 50 mm). Pás je přes 200 mm dlouhý, na výšku se nevejde.
- Postup skládání: `docs/generated/pouzdro-mince-postup.svg` + `.pdf` (A4 na šířku, 8 kroků od
  vyříznutí po hotové pouzdro zepředu a zezadu; proporce z modelu, ne 1:1).
- Průměr mince je **proměnná**: `pnpm pattern:coin-holder --coin 50kc` (27,5 mm), `20kc`
  (26 mm, třináctihran), `10kc` (24,5), `5kc` (23), `decision` (40, předloha) nebo číslo v mm
  (`--coin 30` i `--coin=30`). `--window 30` = průměr okna podle výsečníku, který máš.
  `--simple` = bez vnitřního panelu (jedna kapsa, kratší pás). Každá odchylka jde do vlastního
  souboru (`…-mince-27-5mm`, `…-okno-30mm`, `…-bez-vnitrniho-panelu`), verzovaný výchozí střih se
  nepřepíše; list postupu se generuje jen pro výchozí střih. Neznámý přepínač je chyba.
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

| Prvek           | Rozměr (mince 40)                            | Poznámka                                                                                  |
| --------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Panel           | 63 × 91,1 mm (všechny tři)                   | karta 54 + 2 × 1,5 vůle + 2 × 3 k ohybu; výška = šev dna 3,5 + karta + 2                  |
| Ohyb A          | 12,63 mm                                     | zadní↔přední, obepíná karty + vnitřní panel + bankovky: π·(6,54/2 + 0,75)                 |
| Ohyb B          | 7,13 mm                                      | přední↔vnitřní, obepíná jen karty: π·(3,04/2 + 0,75)                                      |
| Pás             | 208,76 × 91,1 mm + jazyk nad ním             | tři panely + dva ohyby                                                                    |
| Jazyk           | 32 mm široký, řez 43,3 mm (bez rezervy 38,3) | u levého konce pásu, konec R10; přes celý obsah 17,3 + k druku 10 + přesah 11 + rezerva 5 |
| Výřez na prst   | oblouk U: 2 × R28 + dno přes ohyb A          | po složení čtvrtkruh R28 v rohu předního i zadního panelu, odkryje 24,5 mm karty          |
| Průchodka       | otvor Ø 5, 9 mm od hran vnitřního panelu     | po složení padne přesně do rohu s výřezem, vidět z obou stran                             |
| Druk            | patice 10 mm pod horní hranou předku         | u pravého boku, na ose jazyka                                                             |
| Kapsa s mincí   | 55 × 54,5 mm, horní rohy R10, dolní R6       | samostatný díl 1,2 mm; 29,3 mm pod horní hranou, 4 mm od boků                             |
| Okno            | Ø 32 (výsečník po celých mm)                 | prstenec 4 mm; vyseká se před přišitím                                                    |
| Forma pro důlek | otvor Ø 44, deska ≥ 74 × 74, tl. ≥ 8 mm      | mince + 2 × 1,2 + vůle 1,6; hranu otvoru zaoblit                                          |

Jak se to skládá: vnitřní panel se ohne ohybem B za přední, zadní panel se ohybem A přehne přes
všechno. Vrstvy odpředu: přední (líc ven, kapsa s mincí) – karty – vnitřní – bankovky – zadní
(líc ven, motiv). Obě boční hrany jsou ohyby a nešijí se, dno se prošije skrz všechny tři vrstvy
(15 otvorů, rozteč 4 mm, 3,5 mm od hrany). Otvory dna se sekají až po složení; tečky na šabloně
udávají jen počet a polohu na předním panelu.

Jazyk vybíhá u levého konce pásu (zadní panel); po přeložení ohybem A skončí u pravého boku,
přehne se přes horní hranu a zapne drukem na přední panel – **druk je shora**, jako u předlohy.
Klobouček se osazuje až po zkoušce s vloženými kartami i bankovkami, pak se jazyk zkrátí na
čárkovanou čáru a rohy se znovu zaoblí R10.

**Pás se obkresluje na LÍC** (hladkou stranu), stejně jako to dělá výrobce na videu. Kresba je
pohled zvenku: přední panel je nakreslený tak, jak bude vidět na hotovém kusu.

### Odchylky od předlohy a nejistoty

- Rozměry nejsou odměřené z cizího střihu; poměry (jazyk ≈ polovina šířky, výřez R28, druk 10 mm
  pod hranou, kapsa ≈ 30 mm pod hranou) jsou odhad z fotek s mincí 40 mm jako měřítkem.
- Pořadí panelů v pásu (zadní – přední – vnitřní) je odvozené z toho, kde na záběrech leží jazyk,
  výřez a průchodka; jiné pořadí by dalo jiné umístění průchodky.
- Předloha má podél boků řady dírek bez nitě – ozdoba, střih je nekreslí.
- Tloušťku bankovek (2 mm) a počet karet (4) je nutné ověřit na papírovém modelu s tím, co nosíš.

## Funkce a kapacita (spočteno z modelu)

- **Karty:** mezi boky 57 mm, karta 54 → 1,5 mm na stranu; karta sedí 3,5 mm pod horní hranou.
  Pro 6 karet se ohyby i jazyk prodlouží (ohyb B 9,5, ohyb A 15, jazyk +2,4 mm), rezerva jazyka
  5 mm to pokryje, ohyby ne – přegenerovat s `cardsCount`.
- **Bankovky** (ČNB 140–170 × 69–74, euro 120–160 × 62–82): přeložené **na třetiny**
  (47–57 × 69–74) se do zadní kapsy vejdou, napůl ne (70–85 > 57).
- **Mince:** zasouvá se shora, vyjímá se palcem oknem posunutím nahoru. Nad mincí 5 mm kůže.
- **Kapsa vs. výřez:** horní roh kapsy má 3 mm od oblouku výřezu, dno kapsy 3,8 mm nad švem dna.

## Nářadí navíc oproti prvnímu pouzdru

- Osazovač druku pro klobouček 12,5 mm, druk s dříkem na 2 × 1,5 mm, průbojník na dřík.
- Průchodka Ø 5 (dvoudílná s podložkou), osazovač, průbojník 5 mm.
- Kruhový výsečník 32 mm na okno (nebo `--window` podle toho, co seženeš).
- Forma: překližka/HDPE ≥ 8 mm s otvorem Ø 44 (děrovka 44 mm), rovná přítlačná deska, 2–4 svěrky.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Pás 209 × 135 mm (s jazykem) a odřezek na kapsu ≥ 70 × 70 se vejdou na **jeden arch A4**
(297 × 210). Barvené třísločiněné lícové usně 1,2 mm z italské koželužny, A4 = 251 Kč, A5 = 57 Kč:

| Barva                                                                                                                                     | Poznámka                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Verde (lahvová zeleň)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde)                                | nejblíž předloze Red Forest; výrobce ji výslovně doporučuje na pouzdra na karty a k mosaznému kování |
| [Blu (tmavě modrá)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu)                                      | stejná řada                                                                                          |
| [Rosso (červená)](https://craft-point.cz/products/trislocinena-hovezi-licova-kuze-1-2-mm-rosso)                                           | stejná řada                                                                                          |
| [T. moro (tmavě hnědá)](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro), Karamelová, Whisky, Černá, Giallo | stejná řada, klasické odstíny                                                                        |
| [Čokoládová 1,5 mm](https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm), A4 222 Kč                                      | jediná barvená 1,5 mm                                                                                |

Doporučení: **celé pouzdro z Verde 1,2 mm** – šev dna jde skrz tři vrstvy, s 1,2 mm je to 3,6 mm
místo 4,5 mm. Model pak spustit s `bodyThicknessMm: 1.2` (ohyby a jazyk se zkrátí). Tvarování za
mokra nejdřív zkusit na A5 stejné barvy.

## Postup

1. Vyříznout pás podle šablony (obkreslené na líc) a odřezek na kapsu ≥ 70 × 70.
2. Kapsa: do odřezku orýsovat obrys a prosekat otvory švu (U od 10 mm pod horní hranou), pak
   navlhčit, položit **lícem dolů** na formu, na rub minci, přiklopit deskou, stáhnout svěrkami,
   nechat zaschnout.
3. Vyříznout obrys kapsy se středem na důlku a vyseknout okno (kapsa lícem dolů na formě, pod dno
   špalík).
4. Přišít kapsu na přední panel (29,3 mm pod horní hranou, 4 mm od boků), osadit patici druku.
5. Složit: vnitřní panel ohybem B za přední, zadní panel ohybem A přes všechno.
6. Slepit dno, orýsovat 3,5 mm od hrany, prosekat skrz všechny vrstvy a prošít.
7. Osadit průchodku do vnitřního panelu, protáhnout šňůrku.
8. Vložit karty i bankovky, přehnout jazyk, obtisknout patici, osadit klobouček, jazyk zkrátit.
9. Srazit a zaleštit hrany (i oblouk výřezu).

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
