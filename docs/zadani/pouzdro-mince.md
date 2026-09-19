# Pouzdro na karty s vsazenou mincí – střih (NÁVRH v3)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu, videa a fotek Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět:
pouzdro s vsazenou mincí“). Kandidát na **druhé pouzdro** (ADR 002: druhý kus jako obměna
prvního), až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – rozměry se počítají z karty (54 × 85,6, 4 ks
  po 0,76 mm), průměru mince a přídavků; kontroly hlídají kolize (jazyk × kapsa × druk, výřez ×
  druk × průchodka × kapsa, prstenec okna, boční švy, A4).
- Kresba: `scripts/coin-card-holder.ts` → `docs/generated/pouzdro-mince-sablona.svg` + `.pdf`
  (A4 na výšku, 1:1, kalibrační úsečka 50 mm).
- Postup skládání jako obrázky: `docs/generated/pouzdro-mince-postup.svg` + `.pdf` (A4 na šířku,
  8 kroků od vyříznutí po hotové pouzdro zepředu a zezadu; proporce z modelu, ne 1:1).
- Průměr mince je **proměnná**: `pnpm pattern:coin-holder --coin 50kc` (27,5 mm), `20kc`
  (26 mm, třináctihran), `10kc` (24,5), `5kc` (23), `decision` (40, předloha) nebo číslo v mm
  (`--coin 30` i `--coin=30`). `--window 30` = průměr okna podle výsečníku, který máš.
  `--divider` přidá dělicí panel – **s formou se na jeden A4 nevejde u žádné z pojmenovaných
  mincí** (kontrola to odmítne; předloha panel nemá, volba zůstává v modelu). Každá odchylka od výchozího střihu jde do jiného souboru
  (`…-mince-27-5mm`, `…-okno-30mm`, `…-delici-panel`), verzovaný výchozí střih se nepřepíše;
  list postupu se generuje jen pro výchozí střih. Varianta pro 50 Kč je v repu.
  Tloušťka kůže těla (`bodyThicknessMm`) není přepínač – mění se v `DEFAULT_COIN_CARD_HOLDER`.
- Strana jazyka je ve specifikaci (`tabSide: 'right'` = jazyk u pravé hrany při pohledu zepředu,
  výřez s průchodkou vlevo – tak to má předloha; `'left'` dá zrcadlový střih). Kresba i postup se
  řídí modelem, ne stranou natvrdo.

## Konstrukce (v3 – podle fotek hotového kusu a záběrů střihu, 2026-09-18 večer)

**Jeden díl přeložený ve spodní hraně, sešitý po bocích**, plus samostatná kapsa s mincí:

| Prvek           | Rozměr (mince 40)                      | Poznámka                                                                                              |
| --------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Zadní panel     | 66 × 87,6 mm                           | karta + 2 mm; motiv/ražení sem; horní hrana rovná od rohu ke kořeni jazyka                            |
| Přední panel    | 66 × 87,6 mm                           | **stejně vysoký jako zadní** (předloha) – karty jsou celé schované; nese kapsu a patici               |
| Ohyb            | 7,13 mm                                | π·(karty/2 + kůže/2), spočteno pro 4 karty a kůži 1,5 mm                                              |
| Jazyk           | 33 mm široký, řez 35,5 mm dlouhý       | u **pravé** hrany zadního panelu (zepředu vpravo), konec zaoblený obdélník R10                        |
| Rezerva jazyka  | 5 mm                                   | řez je delší o rezervu; po zkoušce s kartami a osazení kloboučku se zkrátí (čárkovaná čára)           |
| Výřez na prst   | čtvrtkruh R30 v horním rohu **předku** | na straně průchodky (zepředu vlevo); odkryje 28 mm karty a průchodku zadního panelu                   |
| Průchodka       | otvor Ø 5, 9 mm od hran                | **levý** horní roh zadního panelu; po přeložení je vidět výřezem předku, šňůrka                       |
| Kapsa s mincí   | 55 × 52,5 mm, horní rohy R10, dolní R6 | samostatný díl 1,2 mm; šev po třech stranách od 10 mm pod horní hranou; **řeže se až po vytvarování** |
| Okno            | Ø 32 (výsečník po celých mm)           | prstenec 4 mm; **vyseká se před přišitím**                                                            |
| Forma pro důlek | otvor Ø 44 v desce 74 × 74, tl. ≥ 8 mm | mince + 2 × 1,2 + vůle 1,6 (kůže po vyschnutí sedne); hranu otvoru zaoblit; dřevo/překližka/HDPE      |
| Tělo celkem     | 66 × 217,8 mm                          | jazyk + zadní + ohyb + přední; vejde se na A4 na výšku                                                |

Jak jazyk dosáhne na druk: z horní hrany zadního panelu obloukem přes karty a horní hranu předku
(π·(obsah/2 + kůže/2) = 9,5 mm), pak po předku 10 mm k patici, plus 11 mm přesah za druk (jako
u předlohy, ≈ 4 mm kůže za okrajem kloboučku), plus 5 mm rezerva. Klobouček na jazyku je ve výkresu na spočtené poloze, ale **osazuje se až po
zkoušce s vloženými kartami** (obtisknout patici) – skutečná délka oblouku závisí na tuhosti kůže
a počtu karet (±3 mm), proto rezerva a zkrácení až nakonec.

Boční švy: 3,5 mm od hrany, rozteč 4 mm, **tečky počítané od ohybu na obou panelech**, takže po
přeložení lícují otvor na otvor. Na straně jazyka běží šev po celé výšce (21 otvorů), na straně
výřezu končí pod výřezem (13 otvorů) – nad ním přední panel není. Předloha má podél boků
dekorativní řady dírek bez nitě; to je ozdoba, ne konstrukce.

Kapsa s mincí leží na předku pod jazykem a drukem; u mince 40 mm je posunutá níž tak, aby její
horní roh zůstal 3 mm od oblouku výřezu (30,1 mm pod horní hranou předku, 5,5 mm od boků, dno
2 mm nad pásmem ohybu; hrana kapsy 2 mm od bočního švu – menší mince mají větší rezervu).

**Tělo obkreslit na RUB (masnou stranu) kůže.** Lícem ven pak vyjde jazyk zepředu vpravo a
výřez s průchodkou vlevo jako u předlohy; obkreslené na líc by vyšlo zrcadlově. Z toho plyne:
tečky bočních švů na šabloně udávají **počet a polohu od ohybu**, nepředsekávají se na rubu –
po přeložení a slepení boků se orýsuje 3,5 mm od hrany na líci předku a prosekají obě vrstvy
najednou (počítat od ohybu). Poloha kapsy se na líc přenese propíchnutím čtyř rohů šídlem
(30,1 mm pod horní hranou, 5,5 mm od boků). Kapsa se obkresluje na **líc** až po vytvarování,
se středem na důlku – její šev je na líci.

Kůže: tělo 1,5 mm (nebo 1,2 mm, viz Materiál), kapsa s mincí 1,2 mm (musí se tvarovat).

### Vědomé odchylky od předlohy

- Předloha je zřejmě **ovinutá přes boky** (boční hrany jsou ohyby, dno prošité bílou nití, boční
  řady dírek ozdobné) a u průchodky má víc než dvě vrstvy. Náš střih má ohyb ve dně a boční švy
  s nití – pro ruční výrobu začátečníka jednodušší a s méně díly. Zepředu i zezadu vypadá jako
  předloha, jen zadní panel je celý (u předlohy má vnější vrstva zadního panelu stejný výřez).
- Rozměry nejsou odměřené z cizího střihu; poměry (šířka jazyka ≈ polovina, výřez R30, druk
  10 mm pod hranou) jsou odhad z fotek s mincí 40 mm jako měřítkem.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Díly se vejdou na **jeden arch A4**: tělo 66 × 218 v jednom sloupci, odřezek na kapsu ≥ 70 × 70
vedle (kapsa 55 × 52,5 se z něj řeže až po vytvarování). Barvené
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

## Postup (podle videa výrobce; okno u nás před přišitím, výrobce ho seká později)

1. Vyříznout tělo podle šablony (obkreslené na rub); hrany, které nebudou v švu, srazit. Výřez
   na prst řezat plynule podle šablony, roh výřezu u horní hrany lehce zabrousit. Kapsu zatím
   **neřezat** – jen odřezek s přídavkem (≥ 70 × 70).
2. Kapsa: odřezek kůže 1,2 mm navlhčit, položit **lícem dolů** na formu, na rub
   minci, zatlačit do otvoru, přiklopit rovnou deskou, stáhnout svěrkami, nechat zaschnout.
3. Po zaschnutí **vyříznout obrys kapsy** podle šablony se středem na důlku.
4. **Vyseknout okno** velkým kruhovým výsečníkem: kapsa lícem dolů na formě, pod dno důlku
   špalík (kůže leží rovně, nic se nedeformuje), jedna rána paličkou.
5. Přišít kapsu na přední panel (na líc) po třech stranách, otevřenou hranou k horní hraně
   předku; osadit patici druku.
6. Přeložit tělo, slepit boky, orýsovat 3,5 mm od hrany na líci předku, prosekat obě vrstvy
   najednou od ohybu (21 otvorů u jazyka, 13 u výřezu) a prošít.
7. Osadit průchodku do zadního panelu (je vidět výřezem předku), protáhnout šňůrku.
8. Druk: vložit karty, přehnout jazyk, obtisknout patici, osadit klobouček; **pak** jazyk zkrátit
   na čárkovanou čáru (nebo podle skutečné polohy kloboučku) a rohy znovu zaoblit R10.
9. Srazit a zaleštit hrany. Minci zasunout shora; vyjímá se zatlačením zespodu okénkem.

## Co je nutné ověřit před řezáním kůže

- Papírový model s kartami: jazyk musí po zapnutí ležet na předku bez tahu; když je krátký,
  zvětšit `cardsCount` (tloušťka obsahu) a přegenerovat.
- Důlek na odřezku: tvarování za mokra plochu kolem důlku mírně stáhne; ověřit, že se obrys kapsy
  po zaschnutí pořád vejde a okno sedí soustředně, a že mince po vyschnutí do důlku vklouzne
  (vůle 1,6 mm ve formě).
- Okno: použít výsečník, který máš (`--window`), prstenec ≥ 4 mm; u 10 Kč (24,5 mm) vyjde okno
  16 mm, tedy z mince málo vidět – zvážit větší minci.
- Přídavek na ohyb 7 mm pro 4 karty a kůži 1,5 mm: ověřit s kartami, při více kartách přidat.
- Výřez R30: na papíru zkusit, že palcem kartu z pouzdra vysuneš a že průchodka se šňůrkou není
  v cestě.

## Co střih nemá

Ražený motiv na zadním panelu (vlastní razník) a dekorativní řady dírek podél švů. Vše lze
doplnit ručně, do generátoru to nepatří.

## Historie návrhu

- v1 (2026-09-18 ráno): obdélník s chlopní přes celou šířku a dělicím panelem. Dva nezávislé
  posudky: chlopeň se lámala na úrovni předku a s kartami by se nezapnula (fatální); otvor
  formy bez tloušťky kůže; kapsa bez rovné plochy kolem důlku; ohyb bez přídavku na karty.
- v2 (2026-09-18 odpoledne): jeden díl s úzkým jazykem u kraje, průchodka, bez dělicího panelu.
  Omylem půlkruhový výřez na prst v zadním panelu vedle jazyka a nižší přední panel (karty
  vyčnívající o 8 mm) – špatně přečtené záběry střihu. Jazyk počítán přes tloušťku obsahu, forma
  = mince + 2 × kůže, kapsa s rovnou plochou, okno po celých mm.
- v2.1 (večer): jazyk zepředu vpravo, průchodka vlevo (`tabSide`); společný obrys pro střih i
  postup; opravy z kontroly kódu (varianty do vlastních souborů, konec jazyka s menším R, popisek
  formy, znaménkové a sloučené kontroly, `--coin=`, tvrdší testy).
- v3 (večer): podle fotek hotového kusu a řemeslného posudku – **přední panel stejně vysoký jako
  zadní, čtvrtkruhový výřez R30 v předku na straně průchodky, zadní panel s rovnou hranou, jazyk
  33 mm s konci R10 a rezervou 5 mm na zkrácení, forma s vůlí 1,6 a tloušťkou ≥ 8 mm, boční švy
  u výřezu kratší, na listu pokyn obkreslit na rub**. Konstrukce těla (ohyb ve dně, boční švy)
  ponechána jako vědomá odchylka.
- v3.1 (2026-09-19): po řemeslném posudku v3 (geometrie i handedness potvrzeny simulací
  přeložení) opravena vrstva instrukcí: tečky švů = počet, sekat až přes obě vrstvy z líce;
  poloha kapsy číselně + propíchnout rohy; kapsa se řeže až po vytvarování (buňka 1 postupu
  kreslí odřezek); přesah jazyka za druk 11 mm; deska formy 74 × 74 se zaoblenou hranou; kapsa
  55 × 52,5 (2 mm od bočního švu); popisek kalibrace uvnitř okraje; zkrácení jazyka s novým
  zaoblením; opraven zbytkový segment v pohledu zezadu.
