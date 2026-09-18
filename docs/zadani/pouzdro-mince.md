# Pouzdro na karty s vsazenou mincí – střih (NÁVRH)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry se počítají z karty (54 × 85,6, 4 ks
  po 0,76 mm), průměru mince a přídavků; kontroly hlídají kolize (jazyk × kapsa × druk, výřez ×
  průchodka, prstenec okna, boční švy, A4).
- Kresba: `scripts/coin-card-holder.ts` → `docs/generated/pouzdro-mince-sablona.svg` + `.pdf`
  (A4 na výšku, 1:1, kalibrační úsečka 50 mm).
- Postup skládání jako obrázky: `docs/generated/pouzdro-mince-postup.svg` + `.pdf` (A4 na šířku,
  8 kroků od vyříznutí po hotové pouzdro zepředu a zezadu; proporce z modelu, ne 1:1).
- Průměr mince je **proměnná**: `pnpm pattern:coin-holder --coin 50kc` (27,5 mm), `20kc`
  (26 mm, třináctihran), `10kc` (24,5), `5kc` (23), `decision` (40, předloha) nebo číslo v mm
  (`--coin 30` i `--coin=30`). `--window 30` = průměr okna podle výsečníku, který máš.
  `--divider` přidá dělicí panel – **s mincí 40 mm se na A4 nevejde** (kontrola to odmítne),
  s 50 Kč a menšími ano. Každá odchylka od výchozího střihu jde do jiného souboru
  (`…-mince-27-5mm`, `…-okno-30mm`, `…-delici-panel`), verzovaný výchozí střih se nepřepíše;
  list postupu se generuje jen pro výchozí střih. Varianta pro 50 Kč je v repu.
  Tloušťka kůže těla (`bodyThicknessMm`) není přepínač – mění se v `DEFAULT_COIN_CARD_HOLDER`.
- Strana jazyka je ve specifikaci (`tabSide: 'right'` = jazyk u pravé hrany při pohledu zepředu,
  průchodka vlevo – tak to má předloha; `'left'` dá zrcadlový střih). Kresba i postup se řídí
  modelem, ne stranou natvrdo.
  Jiná než výchozí mince zapíše soubor `…-mince-<průměr>mm` (27,5 → `-mince-27-5mm`); varianta
  pro 50 Kč je v repu.

## Konstrukce (v2 – horní hrana NEODPOVÍDÁ předloze, viz „Otevřené body“ dole)

**Jeden díl ve tvaru L**, přeložený ve spodní hraně:

| Prvek           | Rozměr (mince 40)                    | Poznámka                                                                           |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| Přední panel    | 66 × 77,6 mm                         | karta − 8 mm: karty vyčnívají, dají se chytit; nese kapsu s mincí a patici druku   |
| Ohyb            | 7,13 mm                              | π·(karty/2 + kůže/2), spočteno pro 4 karty a kůži 1,5 mm                           |
| Zadní panel     | 66 × 87,6 mm                         | karta + 2 mm: kryje karty celé; motiv/ražení sem                                   |
| Jazyk           | 26 mm široký, 38,5 mm dlouhý         | u **pravé** hrany zadního panelu (při pohledu zepředu, jako předloha), půlkruh R13 |
| Výřez na prst   | půlkruh R12 hned za jazykem          | odkryje 10 mm karty pro prst                                                       |
| Průchodka       | otvor Ø 5, 9 mm od hran              | **levý** horní roh zadního panelu (naproti jazyku), šňůrka                         |
| Kapsa s mincí   | 57 × 53 mm, horní rohy R10, dolní R6 | samostatný díl 1,2 mm; šev po třech stranách od 10 mm pod horní hranou             |
| Okno            | Ø 32 (výsečník po celých mm)         | prstenec 4 mm; **vyseká se před přišitím**                                         |
| Forma pro důlek | otvor Ø 43 v desce 63 × 63           | mince + 2 × 1,2 + 0,6 vůle; dřevo nebo HDPE                                        |
| Tělo celkem     | 66 × 210,8 mm                        | jazyk + zadní + ohyb + přední; vejde se na A4 na výšku                             |

Jak jazyk dosáhne na druk: z horní hrany zadního panelu obloukem přes karty a přední panel
(π·(obsah/2 + kůže/2) = 9,5 mm), pak dolů po předku o 10 mm (rozdíl výšek panelů) a dalších
10 mm k patici, plus 9 mm přesah za druk. Klobouček na jazyku je ve výkresu na spočtené poloze,
ale **osazuje se až po zkoušce s vloženými kartami** (obtisknout patici) – tloušťka obsahu se
liší podle počtu karet.

Boční švy: 3,5 mm od hrany, rozteč 4 mm, jen tam, kde se panely překrývají (od ohybu po horní
hranu předku), 18 otvorů na stranu, **tečky počítané od ohybu na obou panelech**, takže po
přeložení lícují otvor na otvor. Nad předním panelem zůstává zadní panel jednovrstvý, bez stehu
(předloha tam má dekorativní řady dírek – to je ozdoba, ne konstrukce).

Kůže: tělo 1,5 mm (nebo 1,2 mm, viz Materiál), kapsa s mincí 1,2 mm (musí se tvarovat).

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Díly se vejdou na **jeden arch A4**: tělo 66 × 211 v jednom sloupci, kapsa 57 × 53 vedle. Barvené
třísločiněné lícové usně 1,2 mm z italské koželužny, továrně upravený hladký povrch, A4 = 251 Kč,
A5 = 57 Kč:

| Barva                                                                                                                                     | Poznámka                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Verde (lahvová zeleň)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde)                                | nejblíž předloze Red Forest; výrobce ji výslovně doporučuje na pouzdra na karty a k mosaznému kování |
| [Blu (tmavě modrá)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu)                                      | stejná řada                                                                                          |
| [Rosso (červená)](https://craft-point.cz/products/trislocinena-hovezi-licova-kuze-1-2-mm-rosso)                                           | stejná řada                                                                                          |
| [T. moro (tmavě hnědá)](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro), Karamelová, Whisky, Černá, Giallo | stejná řada, klasické odstíny                                                                        |
| [Čokoládová 1,5 mm](https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm), A4 222 Kč                                      | jediná barvená 1,5 mm; kdo chce tužší tělo, kombinuje s 1,2 mm na kapsu                              |

Doporučení: **celé pouzdro z jednoho archu A4 Verde 1,2 mm** (251 Kč) – u pouzdra na karty
běžná tloušťka, jeden odstín i patina na všech dílech; model pak spustit s `bodyThicknessMm: 1.2`
(ohyb a jazyk se zkrátí). Barvená useň má světlý řez: hrany zaleštit s kontrastem nebo dobarvit
(CraftPoint má pero i váleček na hrany). Tvarování za mokra nejdřív zkusit na A5 stejné barvy
(57 Kč), některé povrchové úpravy při namočení flekatí.

Meze střihu pro minci 40 mm: hrana kapsy leží přesně 1 mm od bočního švu panelu a dno kapsy
3,3 mm nad pásmem ohybu – obojí na minimu kontroly. Větší mince než 40 mm se do šířky 66 mm
nevejde; menší mince mají rezervu.

## Postup (podle videa výrobce)

1. Vyříznout tělo (tvar L) podle šablony; hrany, které nebudou v švu, srazit.
2. Kapsa: kus kůže 1,2 mm větší než díl navlhčit, položit **lícem dolů** na formu, na rub
   minci, zatlačit do otvoru, přiklopit rovnou deskou, stáhnout svěrkami, nechat zaschnout.
3. Po zaschnutí **vyříznout obrys kapsy** podle šablony se středem na důlku.
4. **Vyseknout okno** velkým kruhovým výsečníkem: kapsa lícem dolů na formě, pod dno důlku
   špalík (kůže leží rovně, nic se nedeformuje), jedna rána paličkou.
5. Přišít kapsu na přední panel po třech stranách, otevřenou hranou k horní hraně předku.
6. Přeložit tělo, prošít oba boky skrz dvě vrstvy (tečky od ohybu lícují).
7. Osadit průchodku, protáhnout šňůrku.
8. Druk: patici na přední panel; klobouček na jazyk až po zkoušce s vloženými kartami.
9. Srazit a zaleštit hrany. Minci zasunout shora; vyjímá se zatlačením zespodu okénkem.

## Co je nutné ověřit před řezáním kůže

- Papírový model s kartami: jazyk musí po zapnutí ležet na předku bez tahu; když je krátký,
  zvětšit `cardsCount` (tloušťka obsahu) a přegenerovat.
- Důlek na odřezku: tvarování za mokra plochu kolem důlku mírně stáhne; ověřit, že se obrys kapsy
  po zaschnutí pořád vejde a okno sedí soustředně.
- Okno: použít výsečník, který máš (`--window`), prstenec ≥ 4 mm; u 10 Kč (24,5 mm) vyjde okno
  16 mm, tedy z mince málo vidět – zvážit větší minci.
- Přídavek na ohyb 7 mm pro 4 karty a kůži 1,5 mm: ověřit s kartami, při více kartách přidat.

## Co střih nemá

Ražený motiv na zadním panelu (vlastní razník) a dekorativní řady dírek podél švů. Vše lze
doplnit ručně, do generátoru to nepatří.

## Otevřené body po kontrole proti předloze (2026-09-18 večer)

Řemeslný posudek (agent, 13 produktových fotek) a moje porovnání se snímky z videa se shodují:

- **Výřez na prst je u předlohy velký čtvrtkruh (R ≈ 30) v horním rohu PŘEDNÍHO panelu** na
  straně průchodky; odkrývá vnitřní vrstvu s průchodkou. Zadní panel má rovnou horní hranu od
  rohu ke kořeni jazyka. Náš půlkruhový výřez R12 v zadním panelu je vymyšlený prvek.
- **Přední panel je u předlohy stejně vysoký jako zadní** (karty nevyčnívají o 8 mm; horní
  hrana předku lícuje s horní hranou zadního panelu u jazyka).
- **Jazyk je širší** (≈ 33 mm, tj. polovina šířky), konec zaoblený obdélník R ≈ 10–12, ne plný
  půlkruh.
- Předloha je zřejmě **ovinutá přes boky** (boční hrany jsou ohyby, dno je prošité bílou nití,
  boční řady dírek jsou ozdobné, bez nitě) a u průchodky má víc než dvě vrstvy. Naše konstrukce
  „ohyb ve dně + boční švy“ je odchylka – pro ruční výrobu jednodušší, ale je nutné ji tak
  označit, ne psát „věrně předloze“.
- Rezerva konce jazyka: klobouček 9 mm od konce při nejistotě polohy ±3 mm je málo; jazyk
  řezat o 4–5 mm delší a zkrátit až po zkoušce.
- Forma: vůle 0,6 mm může po vyschnutí kůže (smrštění 1–2 %) minci sevřít – zvážit Ø 44;
  tloušťka desky formy chybí (≥ 6 mm).
- Na list doplnit, na kterou stranu kůže se šablona obkresluje (rub/líc) – rozhoduje o tom, zda
  jazyk vyjde zepředu vpravo.

Rozhodnutí o v3 (přepracování horní hrany) čeká na autora.

## Historie návrhu

- v1 (2026-09-18 ráno): obdélník s chlopní přes celou šířku a dělicím panelem. Dva nezávislé
  posudky: chlopeň se lámala na úrovni předku a s kartami by se nezapnula (fatální); otvor
  formy bez tloušťky kůže; kapsa bez rovné plochy kolem důlku; ohyb bez přídavku na karty.
- v2 (2026-09-18 odpoledne): podle fotek skutečného střihu předlohy – tvar L s úzkým jazykem,
  výřez na prst, průchodka, bez dělicího panelu, karty vyčnívají nad přední panel. Jazyk počítán
  přes tloušťku obsahu, forma = mince + 2 × kůže, kapsa s rovnou plochou, okno po celých mm.
- v2.1 (2026-09-18 večer): kontrola hotového vzhledu proti fotkám předlohy – jazyk je u ní při
  pohledu zepředu **vpravo** a průchodka vlevo; v2 to měla zrcadlově. Strana jazyka je teď
  parametr (`tabSide`), obrys těla kreslí jedna funkce pro střih i postup, kontrola můstku mezi
  výřezem a průchodkou počítá se znaménkem (překryv se dřív schoval za absolutní hodnotu).
  Nezávislá kontrola kódu (agent) na v2: opraveno přepisování verzovaného střihu variantami
  `--window`/`--divider` (vlastní název souboru), konec jazyka s menším poloměrem (dřív jeden
  oblouk přes celou šířku, SVG ho natáhl na půlkruh a jazyk byl o 7 mm delší), popisek formy
  přes řeznou hranu těla na listu pro 50 Kč, tautologická a duplicitní hlášení kontrol, tvrdší
  testy střihu (poloha čar ohybu, obrys kapsy vůči oknu, počet otvorů švu z délky U, vodicí
  obrys kapsy na předku).
