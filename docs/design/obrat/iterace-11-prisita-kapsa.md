# OBRAT R11 — přišitá kapsa na mince (návrh)

24. 10. 2026. **Schváleno a zapracované do modelu R11** (`src/lib/geometry/obrat-wallet.ts`, listy 1–2, nákres); úpravy z kontrol jsou v oddílech „Implementace v modelu“ a „Rozhodnutí z kontrol“ na konci. Prototyp zatím neušitý. Vychází z [iterace 10](iterace-10-rezervy.md). Autor odmítl závěs pásu (opotřebení, vzhled otevírání) a rozhodl: kapsa na mince je **pevně přišitá na líci T2** (boky a dno), bez závěsu a bez druku A. K mincím se jde jen přes B: víčko (ohnutý horní okraj zadního dílu P) se odklopí naplno. Karty a bankovky dál přes C. Druky jen dva: B a C. Víčko má šikmé konce na obou stranách, zrcadlově (rozhodnutí autora).

Čísla spočítal skript nad modelem R10 (`OBRAT`, `obratCoinFit`, `obratCells`, `obratCapacityAudit`, `flapEdgeY`; varianty přes `{...OBRAT, ...}`). Souřadnice zavřeného předku: x zleva, y od ohybu klopy, mm. Co je předpoklad, je označené v oddílu „Ověřeno a předpoklady“.

## Rozhodnutí v kostce

- **Kapsa přes celou šířku těla** (x 0–108, y 50–90), P a T3 všité do jednoho U-švu těla. Žádný vlastní šev kapsy, uvnitř kapsy na karty žádné stehy.
- **B uprostřed:** dutiny jsou krajní (vnějším bokem je boční šev těla), mezi nimi slepené pole 27 mm s paticí B (54; 58). Víčko drží druk v polovině délky, ne na konci.
- **Dutiny 37 + 37 mm** mezi švy (R10: 36 + 36): rezerva pro 20 + 10 Kč 1,7 mm místo 0,7 mm.
- **Víčko** 93 mm u ohybu (x 7,5–100,5), 88 mm na volné hraně (x 10–98), šikmé konce o 2,5 mm na každé straně, rohy volné hrany R4. Od linie bočního švu 4 mm u ohybu, 6,5 mm na volné hraně.
- **Dutiny se uzavřou až U-švem těla.** Modul P + T3 se v lekci 6 ušije jen dělicími švy a U-linie se do něj **předem prorazí** (2 vrstvy). Na zkoušku modulu se dírami provizorně prošije pomocná nit, pak se vytáhne. V lekci 8 slouží díry modulu jako vodítko vidliček přes všechny 4 vrstvy.

## 1. Konstrukce kapsy – varianty

| Varianta                                                   | Švy                                       | Vrstvy ve švu                                                            | Dutiny                                                                                                 | Vzhled                                              | Verdikt                                                                                                   |
| ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **A. Přes celou šířku, všitá do U-švu těla**               | 1 U-šev (jedna nit) + 2 krátké dělicí švy | dno a boky kapsy 4 (4,8 mm, max. 5,2 + lepidlo ≈ 5,5), boky nad kapsou 2 | 37 + 37 mm, hloubka 35 mm využitelně (rezerva 1,7)                                                     | čistý předek, jedna linie stehu po obvodu, tři pole | **zvoleno**                                                                                               |
| B. Užší vsazená kapsa s vlastním U-švem přes T2            | vlastní U-šev kapsy + U-šev těla          | 3                                                                        | dno kapsy musí být nad švem těla: vlastní šev dna y 80,5 → hloubka 29 mm, **chybí 4,3 mm** pro 20 + 10 | dvě rovnoběžné linie stehu                          | nevyjde: ústí by muselo na y 45,7, ohyb víčka 43,7 a klopa by končila nad dnem výkusu (38)                |
| B′. Vsazená jen boky, dno ve švu těla                      | 2 boční švy kapsy + U-šev těla            | dno stejně 4, boky 3                                                     | jako A                                                                                                 | dvě linie po stranách                               | nevyjde: boční stehy (x 10,5 / 97,5) uvnitř kapsy na karty, hrana vystředěné karty jen 0,7 mm od nich     |
| C. Krátký P jen pod víčkem, spodní hrana P přilepená na T2 | 1 U-šev                                   | dno 3                                                                    | spodek dutiny je T2, na hraně P schod 1,2 mm                                                           | jako A                                              | zamítnuto: mince se zachytí o schod, lepená hrana zatížená mincemi, modul nejde vyzkoušet před sestavením |

**B vlevo nebo uprostřed** (obě s dutinami 37 + 37, víčko 7,5–100,5, šikmé konce 2,5):

| Co                          | B uprostřed (54; 58)                 | B vlevo (17,5; 58), nejblíž R10           |
| --------------------------- | ------------------------------------ | ----------------------------------------- |
| Volný konec víčka od B      | 46,5 mm na obě strany                | 83 mm vpravo                              |
| Klobouček B od konce víčka  | 38,5 mm                              | **2,0 mm** (víc nejde: pole 3,5–30,5)     |
| Klobouček B od dělicího švu | 7,5 mm                               | 7 mm                                      |
| Vzhled                      | souměrný: dutina – pole s B – dutina | jako R10: pole s druhem vlevo, dvě dutiny |

Volí se **B uprostřed**. Víčko je teď venku a nic jiného ho nedrží (v R10 leželo mezi T3 a T2 pod zapnutým pásem). S druhem na konci by se 83 mm víčka zvedalo a zachytávalo v kapse kalhot. Rozhoduje autor (otevřená otázka 1).

## 2. Rozměry R11

Beze změny proti R10: tělo 108 × 90, useň 1,2 mm, šev 3,5 mm, ramena T2 y 15, výkus, klopa (hrana po seříznutí y 42 vlevo, 38 vpravo, rezerva 6 mm), C (88; 25,5) s krytem Ø 17, ohyb víčka y 48, ústí T3 y 50, spodní hrana víčka y 68, přídavek víčka na ohyb 4 mm, odlehčovací otvor Ø 2.

| Parametr            | R10                               | R11                                                                                                                |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Kapsa               | pás P 110 × 42 se závěsem vpravo  | P a T3 přes celou šířku 0–108, všité do U-švu těla                                                                 |
| Dutiny (švy)        | 24 / 60 / 96                      | boční šev 3,5 · dělicí 40,5 · dělicí 67,5 · boční šev 104,5                                                        |
| Dělicí švy          | od y 53 do dna (součást švu T3)   | y 53–81 (28 mm = 7 roztečí, 5,5 mm nad linií dna), samostatné rovné švy v modulu                                   |
| B                   | (12; 58) v jazýčku T3             | (54; 58) v poli mezi dutinami                                                                                      |
| A, kryt K Ø 13      | (12; 77,25)                       | **odpadá**                                                                                                         |
| Víčko               | 0–100,5, šikmý konec jen u závěsu | 7,5–100,5 u ohybu, 10–98 na volné hraně, šikmé oba konce (2,5 mm)                                                  |
| Zářez P             | jeden, u závěsu                   | dva: P vedle víčka (x 0–7,5 a 100,5–108) končí na y 50, roh zářezu s otvorem Ø 2 ve středu (7,5; 50) a (100,5; 50) |
| Lepený pás těla     | vlevo a dole 5, vpravo 6          | všude 5                                                                                                            |
| Přídavek konce pásu | 2 mm                              | odpadá                                                                                                             |

### Díly

| Díl | Rozměr    | Strana listu | Poznámka                                                                                                                                           |
| --- | --------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | 108 × 146 | rub          | beze změny, jen pravý lepený pás 5 mm                                                                                                              |
| T2  | 108 × 75  | líc          | jen patice C; na líci šrafa „zdrsnit + lepidlo“ pro P (viz pásy); bez A a bez šrafy závěsu                                                         |
| P   | 108 × 66  | **rub**      | spodek 0–108 × y 50–90, víčko 24 mm (20 + 4 přídavek) od ohybu y 48; rohy dna R6, horní vnější rohy R1, volná hrana víčka R4; U-linie a dělicí švy |
| T3  | 108 × 40  | líc          | obrys = spodek P (y 50–90), rohy dna R6, horní R1; poloha se nerýsuje, lícuje s boky a dnem P; U-linie, dělicí švy, patice B                       |
| K   | Ø 17, 1 × | rub          | jen kryt C; papírové kolečko Ø 13 zůstane na listu jako měrka objímek (ne z kůže)                                                                  |

P leží **lícem k T2**. Víčko se přehne dopředu přes ústí T3 rubem dovnitř, takže zvenku je líc. T3 kryje rub P všude kromě víčka. Mezi ohybem (y 48) a ústím (y 50) je rub P vidět jen při otevřeném víčku. Vedle víčka končí P i T3 na y 50, hrany lícují.

### Lepené pásy

| Spoj            | Kde                                                                                                            | Pozn.                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| T1 rub – T2 rub | 5 mm podél boků (T1 do výšky ramen) a dna                                                                      | jako R10, vpravo užší                                                   |
| P rub – T3 rub  | 4 mm podél boků a dna (0,5 mm za šev), celé pole mezi dutinami x 40–68 (0,5 mm za dělicí švy) včetně příruby B | pod dutinami nic                                                        |
| P líc – T2 líc  | oba líce zdrsnit: 5 mm podél boků (od y 50) a dna; **celá plocha od y 52 (viz Rozhodnutí 25. 10.)**            | celá plocha nemá okraj, od kterého by se loupala, a nenechá škvíru za P |

## 3. Jak a kdy se uzavřou dutiny

Dutiny mají vnější bok a dno ve švu těla, takže hotové jsou až po lekci 8. Zkouška retence musí přijít dřív, než se zničí T1 a T2. Postup:

1. **Lekce 6 – modul naplocho:** otvory (B, 2 × Ø 2), hrany, patice B do T3, T3 lepit na P (pásy výše), líc P zdrsnit pro T2 celou plochou (před dělicími švy, plocha je kříží), ušít oba dělicí švy (y 53 → 81, konce dvojitým stehem).
2. **Prorazit U-linii modulu** z líce T3 přes P + T3 (2 vrstvy, ≈ 2,7 mm): boky od díry 2 mm pod horní hranou (y 52) dolů, rohy dvojhrotem, dno; mezera se dorovná uprostřed dna jednohrotem. Asi 43 děr. **Nešít.**
3. Pomocnou nit provléct U-linií, dutiny vytvarovat navlhko přes 20 + 10 Kč ve fólii a ohnout víčko navlhko (asi 24 h, 25. 10.), seříznout na 20 mm od hřbetu ohybu, objímka B obtiskem.
4. **Zkouška:** U-linií provléct pomocnou nit jednoduchým stehem (jedna jehla). Dutiny mají přesně konečný rozměr. Skladba 50 | 20 + 10, zavřít B, 30× zatřást ústím dolů, pak 1 Kč | 1 Kč; B 50×; pod konce víčka s mincemi se nesmí zasunout karta (0,76 mm). Kapsa přichycená lícem P na tuhý karton. Pak pomocnou nit vytáhnout.
5. **Lekce 8:** modul přilepit na T2 (hrany lícují s tělem), vidličky vkládat hroty do děr modulu a prorážet T2 + T1. Nad kapsou pokračovat přes 2 vrstvy nahoru k y 18–20 (3–5 mm pod ramenem). Celý U-šev jednou nití.

Proč ne jinak: modul s trvale ušitým U by šev těla nemohl projít stejnými dírami (vidlička by přesekla nit) a dva švy vedle sebe kazí vzhled. Bez předem proražených děr by šlo retenci vyzkoušet až na hotové peněžence. Předem proražené díry navíc půlí odpor při prorážení 4 vrstev.

Záloha, když vidličky 4 vrstvami neprojdou nebo nejdou vytáhnout: dírami modulu prorazit jen T2 + T1 dvojhrotem nebo jednohrotem, díru po díře.

## 4. Dopady na ostatní díly

- **T1:** beze změny (pravý pás 5 mm). **T2:** odpadá patice A a šrafa závěsu, přibude zdrsněná a lepená plocha pro P (25. 10. celá plocha). **Klopa a C:** beze změny. Mezera klopy se měří k hřbetu ohybu víčka 15 mm od levého boku: cíl 6,5 mm (jmenovitě 6,56), vpravo 10 mm.
- **Druky:** 2 + 1 zkušební (R10: 3 + 1). Každá polovina v jedné vrstvě: patice B v T3, objímka B ve víčku (P), patice C v T2, objímka C v klopě.
- **Kapsa na karty:** světlost mezi lepenými pásy 98 mm (bankovka napůl s rezervou potřebuje 89,75), stehy uvnitř žádné. Kryt C končí na x 96,5, lepený pás začíná na x 103.
- **Kapacita mincí** (obálka, ne měření): s dutinami 37 + 37 projdou všechny 3mincové (56/56) i 4mincové skladby (126/126), některé ale jen s rezervou 0,2 mm (50 + 20 v jedné dutině). Doporučení z lekce 1 zůstává: 50 Kč sama, zkušební skladby beze změny, extra milimetr je rezerva, ne kapacita.

### Tloušťky (nominálně, bez lepidla a kování; obdoba `obratLayerStacks`)

| Místo                                                        | Vrstvy usně | mm                                                         |
| ------------------------------------------------------------ | ----------- | ---------------------------------------------------------- |
| Mince pod víčkem (T1, T2, P, T3, víčko) + 4 karty + bankovky | 5           | 12,69 s 50 Kč, 15,24 s 20 + 10 Kč (jako R10)               |
| Mince pod víčkem níž (y 68–86)                               | 4           | 14,04 s 20 + 10 Kč                                         |
| B + karty a bankovky                                         | 5           | 10,14 + výška zapnutého druku (lekce 4)                    |
| C + bankovky                                                 | 4           | 5,9 + výška druku                                          |
| U-šev dno a boky kapsy                                       | 4           | 4,8 (při 1,3 mm usni 5,2; se třemi vrstvami lepidla ≈ 5,5) |
| U-šev boky nad kapsou                                        | 2           | 2,4                                                        |
| Modul při prorážení v lekci 6                                | 2           | 2,4 (≈ 2,7)                                                |

### Kůže a listy

- **A4 kůže:** sloupec T1 146 + T2 75 + P 66 + 2 mezery = 295 mm (jako R10). T3 108 × 40 se vejde jen na výšku vedle sloupce (volno 98 mm), pod ním K. Na A4 má T3 tah usně napříč; na doporučené A3 ho položte stejně jako P.
- **List 1:** T1 beze změny, jen šrafa pravého pásu 5 mm.
- **List 2:** T2 (C, plocha P na líci), P (víčko se šikmými konci, 2 otvory Ø 2, šrafa pro T3, U-linie a dělicí švy), T3 (U-linie, dělicí švy, B), K Ø 17 a papírové kolečko Ø 13 na kontrolu. Výškově jako R10: T2 y 36, P ≈ 122, T3 ≈ 199–239, K ≈ 244.

### Papírový model (lekce 5)

T1, T2, P a T3 z kartonu. T3 přilepit páskou na P (boky a dno lícují), víčko ohnout přes T3. Modul přilepit na T2 a T2 na T1, boky a dno lícují. Vložit karty, bankovky a do pravé dutiny mince 20 + 10. Kontrola: klopa zakryje karty i výkus, mezera hrana klopy – hřbet víčka 15 mm od levého boku asi 6,5 mm. Se zavřenou klopou jde víčko odklopit naplno a mince vyndat. Konce víčka neleží na linii švu (≥ 4 mm). Měření konce pásu z R10 odpadá.

## 5. Osnova lekcí 3–10 (změny proti R10)

| Lekce       | Co se mění                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2        | Dva druky: C klopa, B víčko mincí na přední kapse. Nákup 2 + 1 druk. T3 108 × 40.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 3 Nácvik    | Šev přes 2 vrstvy beze změny. **Místo makety závěsu: šev přes 4 vrstvy.** Dva páry proužků 70 × 25: pár „T1 + T2“ slepit rubem v pásu 5 mm, pár „P + T3“ rubem v pásu 4 mm a prorazit samotný linií 3,5 mm. Líce zdrsnit, páry slepit, vidličky vložit do děr a prorazit vše. Zapsat: prošly hroty, šly vytáhnout, neposunuly se vrstvy? Změřit tloušťku stohu a délku hrotů (hroty ≥ stoh + 2 mm). Ušít. **Zkušební dutina:** kus 44 × 40 na 55 × 45 (37 mm mezi švy). **Ohyb víčka:** proužek 40 × 25 se zářezem a otvorem Ø 2 ohnout navlhko přes druhý proužek, do druhého dne; pak 50× odklopit naplno: líc v ohybu ani u otvoru nepraská, víčko se vrací. |
| 4 Druk      | Beze změny. Lepený jazýček = patice B v poli mezi dutinami.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 5 Model     | Viz výše; čtyři díly, kontrola klopy a otevření víčka pod zavřenou klopou.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 6 Modul     | Řez P a T3 (otvory Ø 2 a B předem), čáru ohybu přenést na rub P, hrany víčka, zářezů a ústí T3, patice B, lepení T3 na P, dělicí švy, **proražení U-linie bez šití**, vytvarování dutin přes mince a ohyb víčka navlhko, seříznutí na 20 mm, objímka B, **zkouška s pomocnou nití**, nit vytáhnout. Zkouška místa A odpadá.                                                                                                                                                                                                                                                                                                                                     |
| 7 Tělo      | T1, T2, K Ø 17. Jen patice C a kryt C.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8 Sestavení | Zdrsnit líc T2 celou plochou (líc P už z lekce 6), maskovací páska podél horního okraje plochy; mince ve fólii v dutinách při lisování. Slepit T1 + T2, pak modul na T2. Prorazit U: kapsa přes díry modulu, boky nad kapsou přes 2 vrstvy. **Jedna nit kolem dokola**, dvojité stehy u děr y 52 a na koncích. Hrany po obvodu (dno 4 vrstvy). Odpadá šití dvěma nitěmi a dvě rozteče bez stehu.                                                                                                                                                                                                                                                                |
| 9 Uzávěry   | Odpadá objímka A. Mezera klopy se měří k hřbetu ohybu víčka. Obtisk C, seříznutí, ozdobný šev, objímka C. Kontrola: otevřít jen C → víčko zavřené; otevřít jen B → klopa zavřená; 30× stisk s 50 \| 20 + 10: B se samo nerozepne, konce víčka neodstávají.                                                                                                                                                                                                                                                                                                                                                                                                      |
| 10 Zkoušky  | Samostatný přístup: 20× C, 20× B. Třesení, tloušťka, záznam.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## 6. Kolize a vůle R11 (min. vzdálenosti, mm)

| Co – proti čemu                                                                  | Vůle                                                                                                         | Požadavek / poznámka                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Konec víčka u ohybu – linie bočního švu                                          | 4,0                                                                                                          | jako R10 u závěsu (100,5 vs 104,5)                                 |
| Konec víčka na volné hraně – linie švu                                           | 6,5                                                                                                          |                                                                    |
| Konec víčka – hrana těla                                                         | 7,5 / 10                                                                                                     |                                                                    |
| Otvor Ø 2 (7,5; 50) – linie švu / lepený pás P–T3 / boční pás P–T2 / plocha P–T2 | 3,0 / 2,5 / 1,5 / 1,0                                                                                        | horní okraj plochy ohraničit páskou                                |
| Nekryté ústí u boku (šev – víčko na y 50)                                        | 4,25                                                                                                         | mince ≥ 20 mm neprojde                                             |
| Klobouček B – ústí T3 (y 50)                                                     | 2,0                                                                                                          | = hardwareGap (jako R10)                                           |
| Klobouček B – volná hrana víčka (y 68)                                           | 4,0                                                                                                          | ≥ 3                                                                |
| Klobouček B – dělicí šev                                                         | 7,5                                                                                                          | ≥ 2 + polovina švu                                                 |
| Klobouček B – konec víčka                                                        | 38,5                                                                                                         | (při B vlevo jen 2,0)                                              |
| Příruba B – okraj lepeného pole / ústí                                           | 8,5 / 2,5                                                                                                    | příruba celá pod T3 a v lepidle                                    |
| Dělicí šev – ústí / linie dna                                                    | 3 / 5,5                                                                                                      | bez společné díry s U-švem                                         |
| Hřbet víčka – hrana klopy                                                        | 6,56 vlevo (15 mm od boku), 10 vpravo                                                                        | ≥ 6 (lekce 9)                                                      |
| Klobouček B – hrana zavřené klopy                                                | 12                                                                                                           | klopa ho nikdy nepřekryje                                          |
| Otevírání víčka – klopa                                                          | k vyndání mincí naplno; kolem 150–160° dosedne klobouček B na klopu u její hrany (y 32–44, hrana klopy y 40) | výška kloboučku 2,5 mm je předpoklad; klobouček může klopu otlačit |
| Kryt C – lepený pás vpravo / rameno T2                                           | 6,5 / 2                                                                                                      | jako R10                                                           |
| Hrana vystředěné karty – lepený pás                                              | 6,2                                                                                                          | uvnitř kapsy žádný steh                                            |
| Vidlička na boku kapsy – víčko                                                   | 3,5                                                                                                          | víčko při prorážení nechat zavřené nebo odklopené, nezasahuje      |

## Ověřeno a předpoklady

**Spočítané:** všechna čísla v tabulkách výše (skript nad modelem R10, `obratCoinFit`, `obratCapacityAudit`, `flapEdgeY`). Potřeba obálky: 50 Kč 32,2 mm, 20 + 10 Kč 33,3 mm; dutina 37 mm dává využitelně 35 × 35 mm. Varianty B a B′ selžou na číslech výše.

**Předpoklady (neověřené):**

- Délka hrotů vidliček ≥ 7,5 mm. Výrobci ji neuvádějí, změří se v lekci 3.
- Lepidlo ≈ 0,1 mm na spoj.
- Klobouček B 2,5 mm nad lícem víčka.
- Ohyb oblouku víčka spotřebuje 3–4 mm (víčko se proto seřezává).
- Víčko drží tvar ohybu i 46 mm od druku.
- Pomocná nit dá stejnou retenci jako konečný šev.

## Otevřené otázky pro autora

1. **B uprostřed (doporučeno) nebo vlevo** jako u R10: vlevo je víčko o 83 mm volné a B jen 2 mm od konce víčka.
2. **Šikmé konce víčka:** zvoleno 2,5 mm (jako R10). 4 mm také projde (víčko na volné hraně 11,5–96,5, k linii švu 8 mm), konec je pak výrazněji šikmý.
3. **Dutiny 37 + 37** (pole B 27 mm) nebo 36 + 36 (pole 29 mm, rezerva 20 + 10 Kč jen 0,7 mm).
4. **P na T2 celou plochou** (25. 10. místo horního pásu): žádná škvíra za P, spoj se neloupe.
5. **Zkouška modulu s pomocnou nití** v předem proražených dírách: doporučeno místo svorek.

## Rizika

- **Prorážení 4 vrstev (≈ 5,5 mm)** začátečníkem: hroty uváznou nebo se vrstvy posunou. Zmírní to předem proražené díry modulu, nácvik v lekci 3 a záloha dvojhrotem nebo jednohrotem.
- **Volné konce víčka venku:** odstávání přes vyboulení mincí, zachytávání v kapse, ohyb povoluje. Zkouší se v lekcích 6, 9 a 10. Když neprojde, další krok je kratší a víc šikmý konec víčka, ne další druk.
- **Lícování modulu s tělem:** díry modulu jsou 3,5 mm od jeho hrany. Když se P a T3 posunou proti T1 a T2, šev nebude rovnoběžný s hranou. Proto lepit za mokra a srovnat hrany před zaschnutím.
- **Lepení líc na líc** (P na T2) drží jen na zdrsněném povrchu. Zkouška v lekci 3 při 4vrstvém vzorku.
- **Otlačení klopy kloboučkem B**, když se víčko odklopí naplno (hrana klopy a ozdobný šev nad x 48–60).
- **Rub P mezi ohybem a ústím** (2 mm) je při otevřeném víčku vidět. Jen vzhled.

## Implementace v modelu (24. 10. 2026)

Model `src/lib/geometry/obrat-wallet.ts` (R11), listy 1–2 a nákres odpovídají tomuto návrhu. Upřesnění při implementaci:

- **Šikmý konec víčka na listu:** 2,5 mm platí na volné hraně po seříznutí (y 68, x 10–98). Na listu je šikmá hrana prodloužená přes rezervu 4 mm, řezná hrana víčka má proto x 10,5–97,5 (zkosení 3 mm na 24 mm). Rohy R4 jsou na řezné hraně; po seříznutí víčka na 20 mm je potřeba rohy R4 znovu zaoblit.
- **P na listu:** RUB nahoru, x jako na zavřeném předku (díl je souměrný, zrcadlení nehraje roli). Na rubu P: šrafa lepidla pro T3 (boky a dno 4 mm, pole x 40–68 od ústí po dno), ohyb y 48 a poloha ústí T3 y 50 mezi otvory, U-linie modulu a dělicí švy. Plocha P–T2 je na líci P, proto je nakreslená jen na líci T2 (od 25. 10. celá plocha od y 52, boky 5 mm od y 50); na P se přenáší z papírového T2.
- **Linie v modulu:** U-linie modulu začíná na y 52 (2 mm pod ústím), dělicí švy y 53–81 (28 mm = 7 roztečí 4 mm, 5,5 mm nad linií dna; `checkObrat` hlídá celé rozteče).
- **Kontroly** (`checkObrat`, `obratClearances`) přebírají vůle z oddílu 6. Prahy: konec víčka u ohybu ≥ 3,5 mm od linie švu, odlehčovací otvor ≥ 2 mm od linie švu a ≥ 1 mm od lepených pásů, klobouček B ≥ 2 mm od ústí, konce víčka a klopy, ≥ 3,75 mm od dělicích švů, víčko přesahuje B o ≥ 3 mm, příruba B ≥ 1 mm uvnitř lepeného pole, lepená plocha P–T2 začíná nejvýš 3 mm pod ústím (od 25. 10. místo horního pásu), nekryté ústí u boku menší než polovina nejmenší mince.

## Cíl mezery klopy v lekcích

Mezera se měří 15 mm od levého boku (u boku je roh klopy R8). Tam má jmenovitě 6,56 mm, proto lekce 5 a 9 používají cíl 6,5 mm (u levé hrany pak vyjde asi 6 mm, jak hlídá `checkObrat`). Záloha při prorážení 4 vrstev je dvojhrot nebo jednohrot, díru po díře.

## Rozhodnutí z kontrol (24. 10. 2026)

- **Dělicí šev 28 mm** (y 53–81, `dividerBottomGap` 5,5): 30 mm by mezi pevnými krajními dírami vyšlo na 7,5 rozteče.
- **Tělo se lepí ve dvou krocích:** líc T2 zdrsnit (dokud je T2 samostatný a rovný), pak T1 + T2 (rub na rub) do druhého dne; pak přilepit modul, zase do druhého dne. Teprve potom U-šev.
- **Líc P se zdrsní v lekci 6** před šitím dělicích švů (lepená plocha přechází přes jejich stehy; stehy na líci P poklepat).
- **Lepení líc na líc** se zkouší v lekci 3 na čtyřvrstvém vzorku.
- **Každé lepení vytvrdne přes noc** pod závažím, než se prorazí nebo šije.
- Záloha při prorážení 4 vrstev: dvojhrot nebo jednohrot, ne kosodélníkové šídlo.

## Rozhodnutí po kontrole 25. 10. 2026

- **P na T2 celou plochou** (místo bočních pásů a horního pásu y 52–57 s mezerou 16 mm kolem B). Lepí se celý líc P od y 52 dolů, u boků pásy 5 mm už od ústí y 50. Důvod: tah z B při rozepínání jde přes pole s B do P; s mezerou za B se horní pás loupal od konců mezery. Celou plochou nemá spoj odkud se loupat a zmizí i škvíra za P. Příruba B leží mezi T3 a P, lepení P–T2 se jí netýká. Pásy y 52–57 a mezera 16 mm v tabulkách výše už neplatí.
- **Víčko se k vyndání mincí odklápí naplno** (až se lehce opře o klopu), ne na 90°: ohyb je 2 mm nad ústím a na 90° stojí víčko nad ústím jako stříška.
- **Zkouška modulu v lekci 6** se dělá s modulem přichyceným lícem P na tuhý karton, protože po přilepení na T2 se dutina vyboulí jen dopředu.
- **Dutiny se v lekci 6 vytvarují navlhko přes mince 20 + 10 Kč** (spolu s ohybem víčka; U-linií je provlečená pomocná nit, kapsa na kartonu, schne asi 24 h). P je přilepený na T2, dutina se vyboulí jen dopředu a T3 musí obejít průměr i dvakrát stoh: pro 20 + 10 Kč asi 38 mm proti využitelným 35 mm. Model to hlásí jako `needsForming` v `obratCoinFit`.
- **Víčko zastaví klobouček B** kolem 150–160° (ne 170°); na vyndání mincí to stačí, klopu se nesmí tlačit.
- **Výkus na palec v ústí T3** (asi 18 × 5 mm, pod víčkem) zatím ne; nejdřív vyzkoušet na papírovém modelu.
- **Název pro uživatele: Šikmina** (podle šikmé klopy). OBRAT zůstává jen jako interní označení (slug `obrat-wallet`, soubory, kód), aby se nerozbily odkazy ani uložený postup.
