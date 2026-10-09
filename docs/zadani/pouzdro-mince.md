# Pouzdro na karty s vsazenou mincí – střih (NÁVRH v4.12)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry z karty (54 × 85,6, 4 ks po 0,76 mm),
  tloušťky bankovek, průměru mince, tloušťky kůže a přídavků; kontroly hlídají kolize (výřez ×
  jazyk × druk × kapsa, u varianty i průchodka; prstenec okna, příruba patice, šev dna, ztenčení, A4).
- Kresba (`scripts/coin-card-holder.ts`), všechny listy 1:1 s kalibrační úsečkou 50 mm:
  - `pouzdro-mince-papirovy-model.svg/.pdf` – **papírový model** (A4 na šířku): stejný obrys jako
    pás, bez otvorů; čísla kroků u ohybů, rámeček karty, místo pro kapsu, čára švu, kontrolní
    seznam a sloupec „zapsat při zkoušce“.
  - `pouzdro-mince-sablona.svg/.pdf` – **pás** (A4 na šířku, je 243 mm dlouhý).
  - `pouzdro-mince-kapsa.svg/.pdf` – **kapsa s mincí a otvor formy** (A4 na výšku).
  - `pouzdro-mince-postup.svg/.pdf` – postup skládání v 8 krocích (ilustrace, ne 1:1).
  - `pouzdro-mince-vse.pdf` – **všechno v jednom PDF** (A4 na šířku: papírový model, pás, kapsa
    otočená o 90° – měřítko zůstává 1:1 –, postup).
- **Výchozí mince je od v4.10 česká padesátikoruna (27,5 mm); od v4.11 okno Ø 20 mm, druk
  12 mm a bez průchodky.** Mince 40 mm z předlohy je varianta.
- Přepínače (`pnpm pattern:coin-holder …`): `--coin 40` (mince 40 mm z předlohy, totéž
  `--coin decision`; dále `50kc`, `20kc`, `10kc`, `5kc` nebo číslo v mm), `--window 18` (průměr
  okna podle výsečníku), `--cards 6` (počet karet v přední kapse, 1–6), `--thickness 1.2`
  (tloušťka kůže těla; pod 1,3 mm se ztenčení ohybu vypne), `--grommet` (bez hodnoty: vrátí
  volitelnou průchodku ve vnitřním panelu se stejnou geometrií jako do v4.10). Každá odchylka jde
  do vlastních souborů (`…-mince-40mm`, `…-okno-18mm`, `…-karty-6`, `…-kuze-1-2mm`,
  `…-pruchodka`); verzovaný výchozí střih se nepřepíše. Neznámý nebo zdvojený přepínač je chyba.
  PDF se v repu neverzují, vzniknou lokálně tímto příkazem.
- **Generátor bez přepínačů kreslí minci 50 Kč a kůži 1,5 mm** (soubory bez přípony). **V aplikaci
  je ale od 2026-10-07 výchozí (předem zaškrtnutá) skupina listů pro kůži 1,2 mm** (např. Blu nebo
  Verde, bez ztenčení ohybu B; soubory `…-kuze-1-2mm` z `pnpm pattern:coin-holder --thickness 1.2`);
  listy pro 1,5 mm jsou v aplikaci varianta. List KAPSA je pro obě tloušťky stejný (kapsa je
  vždycky z 1,2 mm). Verzované varianty: `--thickness 1.2`, `--coin 40`, `--coin 40 --thickness
1.2` a záložní list kapsy `--window 18` (jen `pouzdro-mince-kapsa-okno-18mm.svg`, v aplikaci
  nezaškrtnutý list „Kapsa – záložní okno Ø 18 mm“).
- Cvičný list k lekci 4 (`scripts/coin-card-holder-practice.ts`, `pnpm pattern:coin-holder-practice`,
  geometrie `src/lib/geometry/coin-card-holder-practice.ts`): **cvičný proužek** (A4 na výšku, 1:1,
  úsečka 50 mm) – tři panely po 30 mm × 40 mm, ohyby A a B z modelu pásu pro danou tloušťku
  (nezkracují se, závisí na kůži a obsahu, ne na délce panelu), čára švu 3,5 mm od dolní hrany,
  6 otvorů na panel (rozteč 4, krajní 5 mm od čáry ohybu i od konce) zrcadlených přes střed ohybu,
  kroužky k propíchnutí (šídlem skrz papír i kůži, stejně jako tečky dna, aby byly vidět i na
  rubu) na koncích čar ohybů a švu asi 1 mm od hrany (jako konce čar ohybů na pásu
  v lekci 5), u 1,5 mm šrafa ztenčení ohybu B (± 3 mm) s kroužky i na jejích okrajích.
  Kůže 1,2 mm: 114,35 × 40, ohyb A 15,69, ohyb B 8,66 (`pouzdro-mince-cvicny-prouzek-kuze-1-2mm.svg`,
  v aplikaci předem zaškrtnutý); kůže 1,5 mm: 116,55 × 40, ohyb A 16,63, ohyb B 9,92
  (`pouzdro-mince-cvicny-prouzek.svg`). Na kusu 130 × 40 zbude na každém konci 7,8 / 6,7 mm
  rezervy. Kus i proužek jsou vysoké 40 mm: list se dole ustřihne přesně po obrysu a jeho dolní
  hrana se přiloží na rovnou dolní hranu kusu kůže (šev 3,5 mm se měří od ní), po délce vystředit;
  pravítkem ověřit, že kroužky švu leží 3,5 mm od hrany. V aplikaci na stránce Cvičné listy, odkaz
  z kroku „Vyřízněte cvičný proužek“ v lekci 4.

## Konstrukce (podle záběrů skládání, papírové šablony a fotek hotového kusu)

Dno je prošité, boční hrany jsou ohyby, uvnitř jsou dvě kapsy oddělené stěnou a roh stěny je vidět
výřezem zepředu i zezadu (předloha v něm má průchodku se šňůrkou; u nás je od v4.11 volitelná).
Jeden pás:

```
[JAZYK]
[ZADNÍ panel][ohyb A][PŘEDNÍ panel][ohyb B][VNITŘNÍ panel]
```

| Prvek           | Rozměr (kůže 1,5 mm, mince 50 Kč)               | Poznámka                                                                                            |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Panel           | 72 × 104,1 mm (všechny tři)                     | karta 54 + vůle 2 × 1,5 + okraj 2 × 7,5; šev dna 3,5 + karta 85,6 + 15 (kování nad kartami)         |
| Hotové pouzdro  | ≈ 82 × 104 mm                                   | panel 72 + vnější oblouk ohybu A ≈ 6,0 + ohybu B ≈ 3,7 (`foldedWidthMm`)                            |
| Ohyb A          | 16,63 mm                                        | zadní↔přední: π/2 · odstup vrstev; karty i bankovky mají každé 1,3 mm vůle                          |
| Ohyb B          | 9,92 mm                                         | přední↔vnitřní: π/2 · (kůže + karty + vůle) + 0,79 za ztenčení na 1 mm                              |
| Ztenčení        | ohyb B + 3 mm na obě strany, na 1 mm z rubu     | šrafa na listu; protažení lícu v ohybu B klesne z ≈ 26 % na ≈ 16 %; ohyb A se neztenčuje            |
| Pás             | 242,6 × 104,1 mm + jazyk nad ním                | tři panely + dva ohyby                                                                              |
| Jazyk           | 33 mm široký, řez 44,5 mm                       | u levého konce pásu, konec R10; oblouk 19 + k druku 9,5 + přesah 11 + rezerva 5                     |
| Výřez na prst   | předek čtvrtkruh R34, zadek čtvrtelipsa 39 × 34 | na zadku přechází hrana jazyka plynule do výkusu; roh výřezu na předku zaoblený R2,5                |
| Průchodka       | jen volitelně (`--grommet`): Ø 5, 9 mm od hran  | výchozí listy ji nemají; s ní po složení v rohu s výřezem, 16 mm uvnitř oblouku, nad kartami        |
| Druk            | klobouček Ø 12, patice 9,5 mm pod hranou předku | u pravého boku na ose jazyka; příruba patice smí mít nejvýš Ø 11 (končí 15 mm, karty začínají v 15) |
| Kapsa s mincí   | 42,5 × 42 mm, horní rohy R10, dolní R6          | list kapsy; na předek 41,8 mm pod horní hranou, 14,75 mm od boků (mince 40: 55 × 54,5, 35,55 / 8,5) |
| Okno            | Ø 20 (výsečník po celých mm)                    | prstenec 3,75 mm – držení ověřit na odřezku (mince 40: Ø 32, prstenec 4)                            |
| Forma pro důlek | otvor Ø 31,5, deska ≥ 61,5 × 61,5, tl. ≥ 8 mm   | mince + 2 × 1,2 + vůle 1,6; hranu otvoru zaoblit (mince 40: Ø 44, deska ≥ 74 × 74)                  |

Skládání: vnitřní panel ohybem B za přední, zadní panel ohybem A přes všechno. Vrstvy odpředu:
přední (líc ven, kapsa s mincí) – karty – vnitřní – bankovky – zadní (líc ven, motiv). Obě boční
hrany jsou ohyby, dno se prošije skrz tři vrstvy (17 otvorů na panel, rozteč 4, 3,5 mm od hrany).
Tečky jsou na všech třech panelech zrcadlené přes ohyby (řada vystředěná na panelu, krajní otvor
(72 − 16 × 4) / 2 = 4 mm od čáry ohybu i od hrany), prosekají se naplocho a po složení lícují.

Jazyk vybíhá u levého konce pásu (zadní panel); po přeložení ohybem A skončí u pravého boku,
přehne se přes horní hranu a zapne drukem na přední panel – **druk je shora**, jako u předlohy.
Pás je nastřižený na nejhorší případ (panely rozevřené až k horní hraně); ve skutečnosti druk
okraj stáhne, oblouk je štíhlý a jazyk vyjde delší – klobouček se osazuje podle obtisku patice a
jazyk se zkrátí 11 mm za střed kloboučku (čárkovaná čára je jen orientační), rohy znovu R10.

**Pás se přenáší na LÍC** (hladkou stranu), jako to dělá výrobce na videu: šablona vystřižená
nahrubo se přilepí maskovací páskou na líc, šídlem se propíchnou značky a řeže se skrz papír po
vytištěné čáře (lekce 5; text na listu PÁS to od v4.12 říká stejně, dřív „obkreslit“). Kresba je
pohled zvenku: přední panel je nakreslený tak, jak bude vidět.

Výkus zadního panelu je o 5 mm širší než předního (39 vs. 34 mm u horní hrany, u ohybu stejný);
rozdíl schová vnitřní panel mezi nimi. Přední výkus končí zaoblením R2,5 až 36,4 mm od ohybu, takže
shora je vidět jen schodek ≈ 2,6 mm na horní hraně.

### Odchylky od předlohy a nejistoty

- Rozměry nejsou odměřené z cizího střihu; poměry (jazyk ≈ polovina šířky, výřez R34, druk 9,5 mm
  pod hranou, kapsa ≈ 36 mm pod hranou) jsou odhad z fotek s mincí 40 mm jako měřítkem.
- Pořadí panelů v pásu (zadní – přední – vnitřní) je odvozené z toho, kde na záběrech leží jazyk,
  výřez a průchodka.
- Tloušťku bankovek (2 mm) a počet karet (4) ověřit na papírovém modelu s tím, co nosíš.
- Průchodka z předlohy je od v4.11 jen volitelná (`--grommet`), výchozí pouzdro ji nemá.
- Prstenec kolem okna 3,75 mm (okno Ø 20 u mince 50 Kč) je užší než dřívější minimum 4 mm. Jestli
  minci udrží, se nedá spočítat – **ověřit na odřezku z tvarovací zkoušky** (mince v důlku,
  vyseknuté okno, zatřesení oknem dolů a zatlačení na minci z rubu; lekce 2).

## Funkce a kapacita (spočteno z modelu a virtuálním složením v testech)

- **Karty:** panel 72, karta 54 → karty mají v kapse vůli (jako předloha), stojí na švu dna 15 mm
  pod horní hranou; výřez jich odkryje 19 mm. `--cards 6`: ohyb B 12,3, ohyb A 19,0, jazyk +2,4 mm
  (list se ještě vejde na A4); 7 karet už ne.
- **Bankovky** (ČNB 140–170 × 69–74): složené napůl se vejdou do zadní kapsy do 1000 Kč
  (tisícovka 74 mm na doraz); dvoutisícovka a pětitisícovka mají stejnou výšku 74 mm a napůl
  82 a 85 mm, takže se vejdou také (kapsa je ≈ 100 mm hluboká) – ověřit na papírovém modelu.
- **Vytahování:** karty předním výřezem (palcem), bankovky bokem u jazyka (zadní kapsa je tam
  otevřená i do boku, stejně jako u předlohy). Při zapnutém jazyku karty nevyndáš.
- **Mince:** zasouvá se shora, vyjímá se palcem oknem posunutím nahoru. Nad důlkem 5 mm kůže (nad samotnou mincí ≈ 7 mm, mince posunutá v důlku nahoru aspoň 6,2 mm).
- **Kapsa vs. výřez a jazyk (mince 50 Kč):** horní roh kapsy 13,4 mm od oblouku výřezu, zkrácený
  jazyk končí 20,5 mm pod hranou, kapsa začíná v 41,8 mm (mezera 21,3 mm); dno kapsy 16,8 mm nad
  švem dna. U mince 40 mm: 5,2 mm, kapsa v 35,55 mm (mezera 15 mm), dno 10,6 mm nad švem.
- **Rub vnitřního panelu** je vidět výřezem předku nad kartami – zapečetit ho (Tokonole nebo
  gum tragacanth) v kroku 1.

## Nářadí a materiál navíc oproti prvnímu pouzdru

- Bezpečnostní ztenčovač (skiver) na ohyb B (jen u kůže 1,5 mm); vidličky s roztečí **přesně 4 mm**
  (s 3,85 mm by 17 otvorů vyšlo o 2,4 mm kratší a panely by po složení nelícovaly).
- Druk: **klobouček + zdířka** na jazyk, **patice (dřík) + hlavička** na přední panel (skladbu
  dílů u konkrétního druku ukazuje návod na obalu). Každá polovina svírá jen jednu vrstvu kůže
  těla, dřík tedy na jednu vrstvu 1,2–1,5 mm (ne 2 × 1,5). Od v4.11 **Prym Anorak 12 mm
  s aplikátorem** (aplikátor s nástavci je v balení, osazuje se paličkou; viz „Druk 12 mm“ níže).
  Velikost otvoru pro dřík obchod neuvádí: podle návodu v balení, nebo zkouška na odřezku od
  nejmenšího výsečníku (2 mm, pak 3 mm), pokud návod otvor vyžaduje. Obchod uvádí „jemnou kůži“,
  třísločiněná 1,2 je tužší – **celý druk nejdřív na odřezku** (lekce 3), teprve pak na pás.
  Osazovač Tandy je jen alternativa k drukům WUK 5/6.
- Průchodka jen volitelně (`--grommet`): dvoudílná s podložkou do otvoru 5 mm, na jednu vrstvu
  kůže; osazovač s kovadlinkou nebo mini lis, výsečník 5 mm. Hezčí strana průchodky na rub
  vnitřního panelu (ten je vidět zepředu výřezem). Ve výchozím vybavení není.
- Kruhový výsečník **20 mm** na okno výchozí mince 50 Kč (CraftPoint, 69 Kč; 32 mm jen pro minci
  40 mm; nebo `--window` podle toho, co seženeš).
- Forma: překližka/HDPE ≥ 8 mm s otvorem Ø 31,5 (korunka 32 mm na unášeči ze sady Extol; u mince 40 mm Ø 44), rovná
  přítlačná deska, 2–4 svěrky.
  Co koupit, jak formu vyvrtat aku vrtačkou a otvory pro další mince:
  [pouzdro-mince-forma.md](pouzdro-mince-forma.md).
- Kontaktní lepidlo, kostěná rozhrnovačka (bone folder), sponky s podložkou, potravinová fólie.
- Nit: voskovaná polyesterová 0,6 mm (0,8 mm do otvorů vidliček 4 mm nejde). Orientačně ≈ 4 × délka
  švu + 25–30 cm, přes tři vrstvy 5 ×: šev dna (64 mm skrz 4,5 mm kůže) ≈ 0,6 m, šev kapsy (23
  otvorů, u mince 40 mm 31) ≈ 0,8 m; bere se 0,8 m s rezervou (krátký šev odřezku délku neprokáže).
- Barva na hrany (barvená useň má světlý řez; nejdřív zkouška na odřezku v lekci 4), smirkový
  papír, leštidlo na hrany. Odstín k Blu v katalogu ověřený není (ověřená jen Fiebing's Edge Kote
  hnědá, tmavě hnědá a černá) – v nákupním plánu mimo součet, cena neověřena.
- Maskovací páska je v projektu povinná: šablona PÁS (hlavní způsob), list KAPSA, ohraničení
  nezapečetěného proužku.

### Druk 12 mm (Prym Anorak) – kontrola modelem (v4.11)

Výchozí `snapDiameterMm` je od v4.11 **12 mm** (Prym Anorak 12 mm s aplikátorem, Ráj šití,
189 Kč / 10 ks, ověřeno 29. 9. 2026). Model projde všemi kontrolami pro obě mince i obě tloušťky
kůže s kloboučkem 12, 13,5 i 15 mm a **rozložení střihu se nemění** (pásmo kapsy určuje konec
jazyka s rezervou, 25,5 + 2 = 27,5 mm, ne klobouček). Odstupy kloboučku:

| Odstup                                                   | 12 mm (výchozí) | 13,5 mm         | 15 mm           |
| -------------------------------------------------------- | --------------- | --------------- | --------------- |
| horní hrana předního panelu (minimum `snapClearance` 2)  | 3,5 mm          | 2,75 mm         | 2 mm (těsné)    |
| boky jazyka (šířka 33, minimum 3)                        | 10,5 mm         | 9,75 mm         | 9 mm            |
| konec zkráceného jazyka (11 mm za středem)               | 5 mm            | 4,25 mm         | 3,5 mm          |
| pravý bok předního panelu                                | 10,5 mm         | 9,75 mm         | 9 mm            |
| vodorovně ke konci zaoblení výřezu na horní hraně předku | 13,09 mm        | 12,34 mm        | 11,59 mm        |
| horní hrana kapsy (mince 50 Kč / 40 mm)                  | 26,3 / 20,05 mm | 25,55 / 19,3 mm | 24,8 / 18,55 mm |

Jazyk (33 mm) je širší než klobouček s okraji (12 + 2 × 3 = 18 mm). **Příruba patice** na rubu
předního panelu smí mít nejvýš **Ø 11 mm** (`snapFlangeMaxMm` = 2 × (15 − 9,5)): střed patice je
9,5 mm pod horní hranou a karty začínají v 15 mm. Model počítá s přírubou ≈ Ø 10; u Prym Anorak
průměr příruby neuvedený – **po nákupu změřit, ověřit na prototypu**. Velikost otvoru pro dřík
obchod neuvádí (návod v balení, nebo zkouška od nejmenšího výsečníku). Klobouček 15 mm (WUK
15 mm) nechá k horní hraně jen minimum 2 mm – těsné.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Pás 243 × 149 mm (s jazykem) potřebuje arch A4 (297 × 210). Kůže na kapsu ≥ 57,5 × 57,5
(u mince 40 mm ≥ 70 × 70) se pod pás vejde jen těsně (zbývá pruh ≈ 61 mm, rozvržení ověřit na
arši); jistější je ještě kus A5. Barvené třísločiněné lícové usně 1,2 mm
z italské koželužny, A4 = 250 Kč, A5 = 57 Kč:

| Barva                                                                                                                                     | Poznámka                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Verde (lahvová zeleň)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde)                                | nejblíž předloze Red Forest; výrobce ji výslovně doporučuje na pouzdra na karty a k mosaznému kování |
| [Blu (tmavě modrá)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu)                                      | stejná řada                                                                                          |
| [Rosso (červená)](https://craft-point.cz/products/trislocinena-hovezi-licova-kuze-1-2-mm-rosso)                                           | stejná řada                                                                                          |
| [T. moro (tmavě hnědá)](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro), Karamelová, Whisky, Černá, Giallo | stejná řada, klasické odstíny                                                                        |
| [Čokoládová 1,5 mm](https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm), A4 222 Kč                                      | barvená 1,5 mm – pro ni jsou výchozí listy                                                           |

Doporučení: **Verde 1,2 mm** – šev dna jde skrz tři vrstvy, s 1,2 mm je to 3,6 mm místo 4,5 mm, a
ztenčování odpadá. Listy pak vygenerovat `pnpm pattern:coin-holder --thickness 1.2` (ohyb A 15,7,
ohyb B 8,7, jazyk 43,1 mm). Tvarování za mokra nejdřív zkusit na A5 stejné barvy.

Sestava nákupního plánu v aplikaci: **Blu 1,2 mm** – A4 na pás; A5 na kapsu 57,5 × 57,5 a cvičný
proužek 130 × 40 (lekce 4) vedle sebe podél jedné hrany (zaberou 187,5 × 57,5), ze zbylého pruhu
≈ 210 × 92 odřezky na zkoušku druku a obtisku patice (lekce 3) a barvy na hrany (lekce 4) – stejná
kůže jako tělo. Juchtová A5 1,2 mm jen na dva odřezky 57,5 × 57,5 pro tvarovací zkoušku (lekce 2).

## Postup

0. **Papírový model:** vytisknout na papír 160 g, nalepit na tenkou lepenku (krabice od
   cereálií), vystřihnout, ohyby jen přehnout do smyčky (nepřekládat na ostro), vložit karty a
   bankovky, projít kontrolní seznam a zapsat výsledky. Papír prokáže polohu jazyka a kloboučku,
   výřez, vytahování karty a místo pro kapsu; přídavky ohybů neprokáže (je tenčí).
1. **Pás:** šablonu přilepit páskou na líc, šídlem přes list přenést na kůži konce čar ohybů A i B,
   rohy místa pro kapsu, střed patice (u varianty i průchodky) a všechny tečky dna, pak vyříznout
   skrz papír (výřez plynule; rovné strany podle ocelového pravítka položeného na pás, ne na odpad –
   když nůž ujede, poškodí odpad; rohy přesně podle šablony, ne do ostra: 2× R10 na konci jazyka,
   vypouklé R2,5 u výřezu na předku a 3× R6 – dole na zadním panelu, nahoře i dole na volném konci
   vnitřního; po čáře pomalu bez pravítka, krátkými tahy, jako rohy pouzdra na karty). Kapsa se
   dělá ze samostatného kusu kůže 1,2 mm ≥ 57,5 × 57,5 (forma Ø 31,5 počítá s 1,2 mm; i když je
   pás z 1,5 mm).
   **Čáry ohybů na rub:** propíchnuté konce všech 4 čar ohybů (A i B, u obou hran) spojit na rubu
   tužkou podle pravítka; podle nich se v kroku 5 navlhčí pásma ohybů.
   **Ztenčení ohybu B (jen u kůže 1,5 mm):** propíchnuté kroužky na okrajích šrafy (ohyb B ± 3 mm)
   spojit na rubu a v tomto pásu ztenčit z rubu na 1 mm.
   Na listu PÁS jsou všechny body k propíchnutí kroužky (1 mm od hrany na koncích čar ohybů
   a okrajů šrafy; v rozích místa pro kapsu 1 mm dovnitř na úhlopříčce zaobleného rohu, kapsa je
   zakryje), střed patice křížkem; na papírovém modelu má křížek patice i klobouček.
   Pak prosekat otvory dna na všech třech panelech (naplocho): **přední panel z líce, zadní
   a vnitřní z rubu** (podle propíchnutých teček). Ohyb panel zrcadlově převrátí; šikmé otvory
   proseknuté ze stejné strany by se po složení zkřížily a jehla by jimi neprošla. Rub ve spodním
   proužku 0–3,5 mm (lepí se) nezapečeťovat; hrany, na které se po složení špatně dostane, obarvit
   a zaleštit hned. Zaleštit hrany, které budou uvnitř (horní
   hrana vnitřního panelu, oblouk výkusu – celé U přes ohyb A, čtvrtkruh R34 na předku
   i čtvrtelipsa na zadku –, jazyk), a zapečetit rub vnitřního panelu: proužek 0–3,5 mm přelepit
   maskovací páskou podél čáry švu, pastu v tenké vrstvě přetřít leštítkem (kolik vrstev, ověřit
   na odřezku), na líc ne (lesklá skvrna).
2. **Kapsa** (list kapsy): do odřezku orýsovat obrys a prosekat otvory švu, pak navlhčit, položit
   **lícem dolů** na formu, na rub minci, přiklopit deskou, stáhnout svěrkami, nechat zaschnout.
   Obrys i kružnice okna se orýsují na rub podle 2. výtisku vystřiženého po obrysu, do kterého je
   předem vyseknuté okno tím výsečníkem, kterým se bude sekat okno v kůži (na desce na sekání,
   výsečník přesně na vytištěné kružnici, vystředit pomůžou osy); kružnice se obtáhne tužkou po
   vnitřní hraně otvoru, takže má přesně velikost výsečníku. Šablona se schová – po tvarování se
   podle ní rozmazaná čára obtáhne znovu (přes důlek neleží rovně, jen pomoc).
   Předtím na odřezku z tvarovací zkoušky vyseknout okno Ø 20 a ověřit, že prstenec 3,75 mm
   minci udrží (zatřesení oknem dolů, zatlačení z rubu); když ne, okno menší (Ø 18 mm na druhém
   odřezku a k tomu nová šablona: list „Kapsa – záložní okno Ø 18 mm“, `--window 18`). List KAPSA
   tedy 3× (forma, značky na líci, šablona s oknem), při záložním okně Ø 18 mm navíc 1× záložní
   list. Když minci neudrží ani Ø 18 mm, do kapsy se okno nesekne a na dalším odřezku se zkusí
   hlubší důlek (ověřit). Výsečník Ø 18 mm je v nákupním plánu jako volitelný řádek mimo součet
   (CraftPoint, varianta 18 mm, 57 Kč, skladem 8. 10. 2026). Dost hluboký důlek: číslo model nemá (tloušťku mince nepočítá); mince vložená z rubu nemá
   nad okolní rub vyčnívat – ověřit na odřezku. Špalík pod důlek (tip, ověřit): kus kulaté
   dřevěné tyčky Ø 21–31 mm s rovným koncem.
3. Vyříznout obrys kapsy podle orýsování (forma vystředěná na křížek, aby důlek seděl s otvory) a vyseknout okno (kapsa lícem dolů na formě, pod dno
   špalík; výsečník na narýsovanou kružnici, rozhoduje ale prstenec kůže kolem důlku stejně široký
   po celém obvodu).
4. Přišít kapsu na přední panel (41,8 mm pod horní hranou, 14,75 mm od boků; u mince 40 mm
   35,55 / 8,5): kapsu s už
   proseknutými otvory přilepit na značky, vidličkami proseknout jejími otvory i přední panel
   (naplocho na desce) a přišít. Osadit patici druku **naplocho, před složením** – dřík z rubu,
   hlavička na líci předního panelu (druk předtím vyzkoušený na odřezku); volitelnou průchodku
   do vnitřního panelu stejně.
5. **Ohyby:** pásma ohybů navlhčit, nejdřív vnitřní panel ohybem B za přední, pak zadní ohybem A
   přes všechno. Ohnout kolem skutečného obsahu (karty a bankovky zabalené v potravinové fólii),
   přejet rozhrnovačkou, sepnout sponkami přes podložku, před zaschnutím zkontrolovat, že otvory
   dna na sousedních panelech lícují (když ne: dokud je kůže vlhká, ohyb rozevřít a přeložit znovu;
   malý zbytek srovnají jehly při lepení; větší posun: nelepit, po zaschnutí posun změřit a ohyb s ním vyzkoušet na novém cvičném proužku postupem z lekce 4), a nechat zaschnout. Tady líc nejspíš praskne, když se ohne
   nasucho nebo na ostro.
6. **Dno:** kontaktní lepidlo jen na pruh pod čáru švu (0–3,5 mm od hrany; karty stojí na švu,
   lepidlo výš by ubralo hloubku). Spoje jsou dva: přední↔vnitřní (rub předního + rub
   vnitřního) a vnitřní↔zadní (líc vnitřního + rub zadního); lepit **po jednom**. Zaschlý ohyb
   rozevřít jen tolik, aby šel proužek natřít (zhruba do pravého úhlu, ne úplně naplocho – suchý
   neztenčený ohyb A by mohl na líci prasknout), zdrsnit, natřít v tenké rovnoměrné vrstvě,
   nechat zavadnout, přeložit a před přitlačením zarovnat jehlami přes otvory (kontaktní lepidlo
   po dotyku nejde posunout). Prošít sedlářským stehem skrz všechny vrstvy, na začátku i na konci
   dva zpětné stehy, a zkontrolovat rub (trochu méně pravidelný než líc je normální, stehy ale
   stejně utažené, v jedné řadě, bez smyček); nit raději 0,8 m (pravidlo „Jak odměřit nit“ dává pro tři
   vrstvy ≈ 0,6 m, 0,8 m je rezerva pro začátečníka; krátký šev odřezku to neprokáže).
7. Vložit karty i bankovky, které nosíš, přehnout jazyk, obtisknout patici (obtisk na rubu jazyka
   určuje střed kloboučku, kružnice na šabloně je jen orientační; střed doporučeně propíchnout
   šídlem na líc – vyzkoušeno předem na odřezku v lekci 3), osadit klobouček, ověřit, že druk drží a jde znovu
   rozepnout, jazyk zkrátit 11 mm za střed kloboučku (měřit na líci) a zaoblit R10.
8. Dno přebrousit do roviny (tři vrstvy), srazit z obou vnějších líců (brusným papírem, ořezávač hran jen
   pokud ho máš), obarvit (podle návodu na obalu, před leštěním nechat zaschnout – ověřit na
   odřezku) a zaleštit vnější hrany včetně zkráceného konce jazyka. U volitelné
   průchodky protáhnout šňůrku.

## Co zapsat při zkoušce na papíře (a podle čeho upravit střih)

1. Klobouček: o kolik mm od značky se patice obtiskla (propíchnout skrz) a kterým směrem; kolik
   jazyka zbývá za ním (cíl 11 + rezerva).
2. Kolik karty je vidět ve výřezu (cíl 19 mm) a jestli jde palcem vysunout.
3. Bankovky: které jdou napůl, kolik mm přečnívají nahoře a v boku.
4. Konec jazyka ↔ horní hrana kapsy (cíl ≈ 21 mm po zkrácení, u mince 40 mm ≈ 15 mm).
5. Počet karet a tloušťka bankovek, které opravdu nosíš (vs. 4 × 0,76 a 2 mm) – podle toho
   `--cards`.

U varianty s průchodkou (`--grommet`) přibude bod „průchodka: je celý kroužek vidět zepředu
i zezadu?“ (list papírového modelu ho pak má jako bod 3).

## Co střih nemá

Ražený motiv na zadním panelu (vlastní razník) a dekorativní řady dírek podél boků. Obojí lze
doplnit ručně, do generátoru to nepatří.

## Historie návrhu

- v1 (2026-09-18 ráno): obdélník s chlopní přes celou šířku a dělicím panelem – zamítnuto.
- v2/v2.1: jeden díl s úzkým jazykem, výřez v zadním panelu, nižší přední panel – špatně
  přečtené záběry.
- v3/v3.1: přední panel plné výšky, výřez v předku, ohyb ve dně a šité boky – vzhled zepředu
  seděl, konstrukce ne (předloha má dno šité a boky ohnuté).
- v4 (2026-09-19): podle záběrů skládání, papírové šablony a zadní strany hotového kusu – pás tří
  panelů ohýbaný na obou bocích, šité jen dno, vnitřní panel dělí karty a bankovky a nese
  průchodku, výřez jako oblouk U přes ohyb A, list A4 na šířku, obkreslení na líc.
- v4.1 (2026-09-26): výřez opraven na výkus; rozměr předlohy 72 × 104 (kování nad kartami,
  bankovky napůl); perforace ohybů; průchodka naplocho ve 4. kroku; kapsa na vlastním listu.
- v4.2: vůle v ohybech, patice nad kartami, rezerva jazyka a zkracování podle kloboučku, otvory dna
  na všech panelech naplocho.
- v4.3: perforace podle šířky pásma (můstek 1,5 mm), kontroly přídavku ohybu a rozteče.
- v4.4: virtuální složení nakresleného střihu jako test – ukázalo, že bankovky neměly vůli a jazyk
  byl o 2 mm krátký; ohyby z odstupů vrstev, oblouk jazyka ze skutečného odstupu panelů.
- v4.5: hrana jazyka přechází na zadním panelu plynule do výkusu (bez „zubu“), jako šablona
  předlohy.
- v4.6 (2026-09-27): papírový model jako samostatný list, vyznačené ztenčení ohybů, vše v jednom
  PDF.
- v4.7 (2026-09-27): po řemeslném posudku – ztenčuje se jen ohyb B (a neperforuje se), přídavek
  ohybu B +0,79 mm za posun neutrální osy, roh výřezu R2,5, přepínače `--cards` a `--thickness`,
  papírový model s místem pro kapsu, čarou švu, přírubou patice a seznamem k zapsání, dílenské
  kroky (mokření ohybů, lepení dna, nit, přenos ztenčení na rub, zapečetění rubu vnitřního panelu).
- v4.8 (2026-09-27): šrafa ztenčení jako vektorové čáry (v PDF se nerastruje), pohled zezadu
  v postupu kreslí výřez stejnou čtvrtelipsou jako šablona, jednotné názvy listů (PÁS, KAPSA),
  skloňování počtu karet, přísnější virtuální složení (vůle ≥ 1,2 mm, klobouček ±0,3 mm) a testy
  zrcadlené varianty, ztenčení a papírového modelu pro minci 27,5 mm.
  Po revizi kódu: přídavek za ztenčení ohybu A (režim AB) už neprodlužuje jazyk, čára švu dna
  končí uvnitř zaoblených rohů, `--cards` jen 1–6 (víc se nevejde na A4), odsazené pokračování
  řádků v seznamu k zapsání, testy názvů souborů a automatického vypnutí ztenčení.
  Po řemeslné kontrole: návod na přenesení ztenčení na rub přímo na listu PÁS, kapsa výslovně
  ze samostatné kůže 1,2 mm, forma vystředěná na křížek a obrys kapsy podle orýsování, rozměr
  hotového pouzdra s oblouky ohybů (≈ 82 × 104), opravené tvrzení o dvou- a pětitisícovce,
  schodek výkusu 2,6 mm, cena A4 250 Kč, položka „přesah bankovek“ v seznamu k zapsání.
- v4.9 (2026-09-28): **perforace ohybů odstraněny** – na předloze nebyly doložené (poznámka
  „jako předloha“ vznikla nejspíš záměnou s ozdobnými dírkami na bocích); ohyb A se jen ohne
  a jeho ohyb se ověří na odřezku. Kapsa se přišije tak, že se přilepí na značky a jejími
  otvory se vidličkami prosekne i přední panel. Listy pro kůži 1,2 mm (bez ztenčení).
- v4.9 (doplněno po řemeslné kontrole 2026-09-28): vidličky přesně 4 mm; druk čtyřdílný, každá
  polovina na jednu vrstvu 1,5 mm (dříve chybně „2 × 1,5“); otvory dna předního panelu z líce,
  zadního a vnitřního z rubu (jinak se šikmé otvory po složení zkříží); přenos čar ohybů, místa
  kapsy a teček dna šídlem; lepení dna po jednom spoji, ohyb rozevřít jen asi do pravého úhlu;
  lepený proužek nezapečeťovat; nit na dno 0,8 m.
- v4.9 (doplněno 2026-09-28 večer): na listu KAPSA osy přes celý díl i přes otvor formy – kůže se
  na formě vystředí osami (osy na kůži na osy desky), ne křížkem, který je pod kůží schovaný;
  zaoblení R2,5 v rohu výřezu je vypouklé (vyřízne se nožem). Listy i pro minci 50 Kč s kůží
  1,2 mm. Kroky listu postupu jako samostatné obrázky do lekcí.
- v4.10 (2026-09-29): **výchozí mince je padesátikoruna** (27,5 mm) – autor nemá minci 40 mm.
  Výchozí listy bez přípony jsou pro 50 Kč: okno Ø 19 mm (prstenec 4,25), otvor formy Ø 31,5 mm
  (deska ≥ 61,5 × 61,5), kapsa 42,5 × 42 mm 41,8 mm pod horní hranou a 14,75 mm od boků, šev
  kapsy 23 otvorů; pás a jazyk se nemění (242,55 × 104,1, jazyk 44,49; u kůže 1,2 mm 240,35 a
  43,07). Mince 40 mm z předlohy je varianta `--coin 40` se soubory `…-mince-40mm`; verzované
  jsou i kombinace s kůží 1,2 mm. Kontrola kloboučku 13,5 mm (WUK 5/6): projde beze změny
  rozložení, odstupy v tabulce výše. Výsečník na okno přednostně Ø 19 mm; ověřené nákupní
  příklady (29. 9. 2026) pro výsečník okna, výsečník 5 mm, druky WUK 5/6 s osazovačem a
  průchodky – u průchodek není uvedený vnější průměr trubičky (dotaz na prodejce).
- v4.11 (2026-09-29): tři rozhodnutí autora. (1) **Okno Ø 20 mm** pro minci 50 Kč: nejmenší
  prstenec `minCoinRingMm` snížen ze 4 na 3,75 mm, okno se dál odvozuje z mince (27,5 − 2 × 3,75
  = 20, prstenec 3,75; mince 40 mm zůstává Ø 32, prstenec 4). Snížené minimum mění i variantu
  `--coin 10kc`: okno Ø 17 mm místo 16, prstenec 3,75 mm místo 4,25 (20 Kč a 5 Kč beze změny,
  Ø 18 a Ø 15); držení u 10 Kč nikdo nezkoušel – ověřit na odřezku, nebo `--window 16`. Držení mince je nutné ověřit na
  odřezku z tvarovací zkoušky – nový krok a povinný kontrolní bod v lekci 2 (mince v důlku,
  vyseknuté okno, zatřesení a zatlačení). Výsečník okna přednostně CraftPoint Ø 20 mm (69 Kč,
  skladem 29. 9. 2026); Format 19 mm z nabídky vypadl, Ø 32 mm zůstává jen pro minci 40 mm.
  (2) **Druk Prym Anorak 12 mm s aplikátorem** (Ráj šití, 189 Kč / 10 ks, skladem): výchozí
  `snapDiameterMm` 12 (dřív 12,5); odstupy kloboučku 3,5 / 10,5 / 5 mm (tabulka výše), rozložení
  beze změny; příruba patice nejvýš Ø 11 mm (`snapFlangeMaxMm`), po nákupu změřit. Velikost otvoru
  pro dřík obchod neuvádí – návod v balení, nebo zkouška od nejmenšího výsečníku (2 / 3 mm,
  CraftPoint 29 Kč); obchod uvádí „jemnou kůži“, proto druk nejdřív na odřezku (lekce 3, nový
  kontrolní bod změřené příruby). Osazovač Tandy už není nutný, jen alternativa k WUK 5/6;
  alternativy Stoklasa 13,5 mm (134,96 Kč) a WUK 15 mm (172 Kč, k horní hraně jen 2 mm); nevhodné
  Prym Jersey (vroubkovaný kroužek pro pružné látky). (3) **Bez průchodky ve výchozí verzi:**
  výchozí listy nemají otvor, papírový model ani postup ji nekreslí a seznam k zapsání se čísluje
  1–5; `grommet: true` / `--grommet` ji vrátí se stejnou geometrií (soubory `…-pruchodka`).
  Průchodka a výsečník 5 mm nejsou ve vybavení projektu ani v lekcích (zůstávají v katalogu,
  varianta se šňůrkou jen přes `--grommet`). Do vybavení projektu přibyl malý výsečník 2 / 3 mm
  (`small-hole-punch`, doporučený, jen pokud návod druku vyžaduje otvor); záložní výsečník okna
  Ø 18 mm je zmíněný u výsečníku okna. Když zkouška Ø 20 mm nevyjde, lekce 2 vede na druhý
  odřezek a Ø 18 mm (prstenec 4,75 mm); list KAPSA se použije na vystředění dál.
- v4.12 (2026-10-07, obsah lekcí, geometrie beze změny): v aplikaci je **výchozí kůže těla 1,2 mm**
  (předem zaškrtnuté listy, lekce, vybavení), 1,5 mm se ztenčením ohybu B je varianta. Text na
  listu PÁS a v kroku 1 postupu: „přilepit páskou na líc, propíchnout značky, řezat skrz papír“
  místo „obkreslit“. Záložní list kapsy s oknem Ø 18 mm (`--window 18`) jako volitelný list
  v aplikaci (místo příkazu generátoru v lekci 2). Lekce: čáry ohybů tužkou na rub (lekce 5,
  navlhčení podle nich v lekci 7), cvičný proužek v lekci 4 (cvičný list „Cvičný proužek pro lekci 4“ pro 1,2 i 1,5 mm z
  `pnpm pattern:coin-holder-practice`, nebo ruční odměření),
  zkouška obtisku patice na odřezku (lekce 3) a barvy na hrany (lekce 4), co dělat, když otvory
  po složení nelícují, pečetění rubu s páskou na proužku 0–3,5 mm, rozhodnutí po papírovém modelu,
  vizuální kontrola hloubky důlku a tip na špalík; odkazy z lekcí na Listy střihu. Odřezky na
  druk z Blu A5 místo juchtové. Maskovací páska povinná, barva na hrany doporučená (bez ověřené
  ceny odstínu). Lekce 5: zaoblení rohů pásu podle šablony (R10, R2,5, R6) a pravítko na pásu,
  ne na odpadu; lekce 4 a cvičný list: dolní hrana listu na dolní hranu kusu kůže, kontrola švu
  3,5 mm pravítkem; krok lekce 5 „Vyřízněte pás skrz papír“ odkazuje i na krok animace C3 (rohy).
