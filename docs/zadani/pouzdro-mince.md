# Pouzdro na karty s vsazenou mincí – střih (NÁVRH v4.9)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry z karty (54 × 85,6, 4 ks po 0,76 mm),
  tloušťky bankovek, průměru mince, tloušťky kůže a přídavků; kontroly hlídají kolize (výřez ×
  jazyk × druk × kapsa × průchodka, prstenec okna, šev dna, ztenčení, A4).
- Kresba (`scripts/coin-card-holder.ts`), všechny listy 1:1 s kalibrační úsečkou 50 mm:
  - `pouzdro-mince-papirovy-model.svg/.pdf` – **papírový model** (A4 na šířku): stejný obrys jako
    pás, bez otvorů; čísla kroků u ohybů, rámeček karty, místo pro kapsu, čára švu, kontrolní
    seznam a sloupec „zapsat při zkoušce“.
  - `pouzdro-mince-sablona.svg/.pdf` – **pás** (A4 na šířku, je 243 mm dlouhý).
  - `pouzdro-mince-kapsa.svg/.pdf` – **kapsa s mincí a otvor formy** (A4 na výšku).
  - `pouzdro-mince-postup.svg/.pdf` – postup skládání v 8 krocích (ilustrace, ne 1:1).
  - `pouzdro-mince-vse.pdf` – **všechno v jednom PDF** (A4 na šířku: papírový model, pás, kapsa
    otočená o 90° – měřítko zůstává 1:1 –, postup).
- Přepínače (`pnpm pattern:coin-holder …`): `--coin 50kc` (27,5 mm; dále `20kc`, `10kc`, `5kc`,
  `decision` nebo číslo v mm), `--window 30` (průměr okna podle výsečníku), `--cards 6` (počet karet
  v přední kapse, 1–6), `--thickness 1.2` (tloušťka kůže těla; pod 1,3 mm se ztenčení ohybu vypne).
  Každá odchylka jde do vlastních souborů (`…-mince-27-5mm`, `…-okno-30mm`, `…-karty-6`,
  `…-kuze-1-2mm`); verzovaný výchozí střih se nepřepíše. Neznámý nebo zdvojený přepínač je chyba.
  PDF se v repu neverzují, vzniknou lokálně tímto příkazem.
- **Výchozí listy jsou pro kůži 1,5 mm** (např. Čokoládová). Pro Verde 1,2 mm vygeneruj
  `pnpm pattern:coin-holder --thickness 1.2`.

## Konstrukce (podle záběrů skládání, papírové šablony a fotek hotového kusu)

Dno je prošité, boční hrany jsou ohyby, uvnitř jsou dvě kapsy oddělené stěnou a roh stěny s
průchodkou je vidět výřezem zepředu i zezadu. Jeden pás:

```
[JAZYK]
[ZADNÍ panel][ohyb A][PŘEDNÍ panel][ohyb B][VNITŘNÍ panel]
```

| Prvek           | Rozměr (kůže 1,5 mm, mince 40)                  | Poznámka                                                                                    |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Panel           | 72 × 104,1 mm (všechny tři)                     | karta 54 + vůle 2 × 1,5 + okraj 2 × 7,5; šev dna 3,5 + karta 85,6 + 15 (kování nad kartami) |
| Hotové pouzdro  | ≈ 82 × 104 mm                                   | panel 72 + vnější oblouk ohybu A ≈ 6,0 + ohybu B ≈ 3,7 (`foldedWidthMm`)                    |
| Ohyb A          | 16,63 mm                                        | zadní↔přední: π/2 · odstup vrstev; karty i bankovky mají každé 1,3 mm vůle                  |
| Ohyb B          | 9,92 mm                                         | přední↔vnitřní: π/2 · (kůže + karty + vůle) + 0,79 za ztenčení na 1 mm                      |
| Ztenčení        | ohyb B + 3 mm na obě strany, na 1 mm z rubu     | šrafa na listu; protažení lícu v ohybu B klesne z ≈ 26 % na ≈ 16 %; ohyb A se neztenčuje    |
| Pás             | 242,6 × 104,1 mm + jazyk nad ním                | tři panely + dva ohyby                                                                      |
| Jazyk           | 33 mm široký, řez 44,5 mm                       | u levého konce pásu, konec R10; oblouk 19 + k druku 9,5 + přesah 11 + rezerva 5             |
| Výřez na prst   | předek čtvrtkruh R34, zadek čtvrtelipsa 39 × 34 | na zadku přechází hrana jazyka plynule do výkusu; roh výřezu na předku zaoblený R2,5        |
| Průchodka       | Ø 5, 9 mm od hran vnitřního panelu              | po složení v rohu s výřezem, 16 mm uvnitř oblouku, nad kartami                              |
| Druk            | patice 9,5 mm pod horní hranou předku           | u pravého boku na ose jazyka; příruba patice (≈ Ø 10) končí 14,5 mm, karty začínají v 15    |
| Kapsa s mincí   | 55 × 54,5 mm, horní rohy R10, dolní R6          | list kapsy; na předek 35,55 mm pod horní hranou, 8,5 mm od boků                             |
| Okno            | Ø 32 (výsečník po celých mm)                    | prstenec 4 mm (předloha má okno skoro přes celou minci, drží hůř)                           |
| Forma pro důlek | otvor Ø 44, deska ≥ 74 × 74, tl. ≥ 8 mm         | mince + 2 × 1,2 + vůle 1,6; hranu otvoru zaoblit                                            |

Skládání: vnitřní panel ohybem B za přední, zadní panel ohybem A přes všechno. Vrstvy odpředu:
přední (líc ven, kapsa s mincí) – karty – vnitřní – bankovky – zadní (líc ven, motiv). Obě boční
hrany jsou ohyby, dno se prošije skrz tři vrstvy (17 otvorů na panel, rozteč 4, 3,5 mm od hrany).
Tečky jsou na všech třech panelech zrcadlené přes ohyby, prosekají se naplocho a po složení lícují.

Jazyk vybíhá u levého konce pásu (zadní panel); po přeložení ohybem A skončí u pravého boku,
přehne se přes horní hranu a zapne drukem na přední panel – **druk je shora**, jako u předlohy.
Pás je nastřižený na nejhorší případ (panely rozevřené až k horní hraně); ve skutečnosti druk
okraj stáhne, oblouk je štíhlý a jazyk vyjde delší – klobouček se osazuje podle obtisku patice a
jazyk se zkrátí 11 mm za střed kloboučku (čárkovaná čára je jen orientační), rohy znovu R10.

**Pás se obkresluje na LÍC** (hladkou stranu), jako to dělá výrobce na videu. Kresba je pohled
zvenku: přední panel je nakreslený tak, jak bude vidět.

Výkus zadního panelu je o 5 mm širší než předního (39 vs. 34 mm u horní hrany, u ohybu stejný);
rozdíl schová vnitřní panel mezi nimi. Přední výkus končí zaoblením R2,5 až 36,4 mm od ohybu, takže
shora je vidět jen schodek ≈ 2,6 mm na horní hraně.

### Odchylky od předlohy a nejistoty

- Rozměry nejsou odměřené z cizího střihu; poměry (jazyk ≈ polovina šířky, výřez R34, druk 9,5 mm
  pod hranou, kapsa ≈ 36 mm pod hranou) jsou odhad z fotek s mincí 40 mm jako měřítkem.
- Pořadí panelů v pásu (zadní – přední – vnitřní) je odvozené z toho, kde na záběrech leží jazyk,
  výřez a průchodka.
- Tloušťku bankovek (2 mm) a počet karet (4) ověřit na papírovém modelu s tím, co nosíš.

## Funkce a kapacita (spočteno z modelu a virtuálním složením v testech)

- **Karty:** panel 72, karta 54 → karty mají v kapse vůli (jako předloha), stojí na švu dna 15 mm
  pod horní hranou; výřez jich odkryje 19 mm. `--cards 6`: ohyb B 12,3, ohyb A 19,0, jazyk +2,4 mm
  (list se ještě vejde na A4); 7 karet už ne.
- **Bankovky** (ČNB 140–170 × 69–74): složené napůl se vejdou do zadní kapsy do 1000 Kč
  (tisícovka 74 mm na doraz); dvoutisícovka a pětitisícovka mají stejnou výšku 74 mm a napůl
  82 a 85 mm, takže se vejdou také (kapsa je ≈ 100 mm hluboká) – ověřit na papírovém modelu.
- **Vytahování:** karty předním výřezem (palcem), bankovky bokem u jazyka (zadní kapsa je tam
  otevřená i do boku, stejně jako u předlohy). Při zapnutém jazyku karty nevyndáš.
- **Mince:** zasouvá se shora, vyjímá se palcem oknem posunutím nahoru. Nad mincí 5 mm kůže.
- **Kapsa vs. výřez a jazyk:** horní roh kapsy 5,2 mm od oblouku výřezu, zkrácený jazyk končí
  20,5 mm pod hranou, kapsa začíná v 35,55 mm; dno kapsy 10,6 mm nad švem dna.
- **Rub vnitřního panelu** je vidět výřezem předku nad kartami – zapečetit ho (Tokonole nebo
  gum tragacanth) v kroku 1.

## Nářadí a materiál navíc oproti prvnímu pouzdru

- Bezpečnostní ztenčovač (skiver) na ohyb B (jen u kůže 1,5 mm); vidlička 4 mm.
- Osazovač druku pro klobouček 12,5 mm, druk s dříkem na 2 × 1,5 mm, průbojník na dřík.
- Průchodka Ø 5 (dvoudílná s podložkou), osazovač, průbojník 5 mm.
- Kruhový výsečník 32 mm na okno (nebo `--window` podle toho, co seženeš).
- Forma: překližka/HDPE ≥ 8 mm s otvorem Ø 44 (děrovka 44 mm), rovná přítlačná deska, 2–4 svěrky.
  Co koupit, jak formu vyvrtat aku vrtačkou a otvory pro další mince:
  [pouzdro-mince-forma.md](pouzdro-mince-forma.md).
- Kontaktní lepidlo, kostěná rozhrnovačka (bone folder), sponky s podložkou, potravinová fólie.
- Nit: voskovaná polyesterová 0,6–0,8 mm. Orientačně ≈ 4 × délka švu + konce: šev dna (64 mm skrz
  4,5 mm kůže) ≈ 0,6 m, šev kapsy (31 otvorů) ≈ 0,8 m. Ověřit na odřezku.
- Barva na hrany (barvená useň má světlý řez), smirkový papír, leštidlo na hrany.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Pás 243 × 149 mm (s jazykem) potřebuje arch A4 (297 × 210); kůže na kapsu ≥ 70 × 70 se vedle
nevejde, je potřeba ještě kus A5 (nebo větší arch). Barvené třísločiněné lícové usně 1,2 mm
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

## Postup

0. **Papírový model:** vytisknout na papír 160 g, nalepit na tenkou lepenku (krabice od
   cereálií), vystřihnout, ohyby jen přehnout do smyčky (nepřekládat na ostro), vložit karty a
   bankovky, projít kontrolní seznam a zapsat výsledky. Papír prokáže polohu jazyka a kloboučku,
   výřez, průchodku, vytahování karty a místo pro kapsu; přídavky ohybů neprokáže (je tenčí).
1. **Pás:** obkreslit na líc, vyříznout (výřez plynule). Kapsa se dělá ze samostatného kusu kůže
   1,2 mm ≥ 70 × 70 (forma Ø 44 počítá s 1,2 mm; i když je pás z 1,5 mm).
   **Ztenčení ohybu B:** šídlem propíchnout oba konce obou čar ohybu B skrz, na rubu je spojit,
   odsadit 3 mm na obě strany a v tomto pásu ztenčit z rubu na 1 mm. Pak prosekat otvory dna na
   všech třech panelech (naplocho). Zaleštit hrany, které budou uvnitř (horní
   hrana vnitřního panelu, oblouk výkusu, jazyk), a zapečetit rub vnitřního panelu.
2. **Kapsa** (list kapsy): do odřezku orýsovat obrys a prosekat otvory švu, pak navlhčit, položit
   **lícem dolů** na formu, na rub minci, přiklopit deskou, stáhnout svěrkami, nechat zaschnout.
3. Vyříznout obrys kapsy podle orýsování (forma vystředěná na křížek, aby důlek seděl s otvory) a vyseknout okno (kapsa lícem dolů na formě, pod dno
   špalík).
4. Přišít kapsu na přední panel (35,55 mm pod horní hranou, 8,5 mm od boků): kapsu s už
   proseknutými otvory přilepit na značky, vidličkami proseknout jejími otvory i přední panel
   (naplocho na desce) a přišít. Osadit patici druku
   a **průchodku do vnitřního panelu – obojí naplocho, před složením**.
5. **Ohyby:** pásma ohybů navlhčit, nejdřív vnitřní panel ohybem B za přední, pak zadní ohybem A
   přes všechno. Ohnout kolem skutečného obsahu (karty a bankovky zabalené v potravinové fólii),
   přejet rozhrnovačkou, sepnout sponkami přes podložku a nechat zaschnout. Tady líc nejspíš
   praskne, když se ohne nasucho nebo na ostro.
6. **Dno:** kontaktní lepidlo jen na pruh pod čáru švu (0–3,5 mm od hrany; karty stojí na švu,
   lepidlo výš by ubralo hloubku). Lícovou stranu vnitřního panelu v tom pruhu zdrsnit. Nanést
   naplocho, nechat zavadnout, přeložit a před přitlačením zarovnat jehlami přes otvory (kontaktní
   lepidlo po dotyku nejde posunout). Prošít skrz všechny vrstvy.
7. Vložit karty i bankovky, které nosíš, přehnout jazyk, obtisknout patici, osadit klobouček,
   jazyk zkrátit 11 mm za střed kloboučku a zaoblit R10.
8. Dno přebrousit do roviny (tři vrstvy), srazit, obarvit a zaleštit vnější hrany. Protáhnout
   šňůrku průchodkou.

## Co zapsat při zkoušce na papíře (a podle čeho upravit střih)

1. Klobouček: o kolik mm od značky se patice obtiskla (propíchnout skrz) a kterým směrem; kolik
   jazyka zbývá za ním (cíl 11 + rezerva).
2. Kolik karty je vidět ve výřezu (cíl 19 mm) a jestli jde palcem vysunout.
3. Průchodka: je celý kroužek vidět zepředu i zezadu?
4. Bankovky: které jdou napůl, kolik mm přečnívají nahoře a v boku.
5. Konec jazyka ↔ horní hrana kapsy (cíl ≈ 15 mm po zkrácení).
6. Počet karet a tloušťka bankovek, které opravdu nosíš (vs. 4 × 0,76 a 2 mm) – podle toho
   `--cards`.

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
