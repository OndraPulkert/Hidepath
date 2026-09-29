# Peněženka LUSK – návrh (NÁVRH k ověření na prototypu)

Stav: **návrh k ověření na papírovém modelu, zkušebním lusku a prvním koženém kusu**, ne lekce.
**Verze 3 (po nezávislém ověření, 2026-09-28):** co se změnilo a proč, je v oddílu 15. Výrobní střih 1:1
generuje `pnpm pattern:wallet` do `docs/generated/penezenka-*.svg/.pdf` (oddíl 14.4).
Vznikl 2026-09-28 podle zadání [`DESIGN_BRIEF.md`](DESIGN_BRIEF.md) (kap. 1–31). Poučení z
projektu pouzdra s mincí ([`pouzdro-mince.md`](pouzdro-mince.md),
[`pouzdro-mince-forma.md`](pouzdro-mince-forma.md)) a nástroje z
[`../content/notes-vybaveni.md`](../content/notes-vybaveni.md) jsou převzaté jako zdroj, konstrukce ne.

**Značení:** „kap. N“ = kapitola briefu, „oddíl N“ = oddíl tohoto dokumentu.

**Pravidlo dokumentu:** každé číslo je buď vypočtené (výpočet je uvedený), nebo převzaté
z repozitáře (karta 85,60 × 53,98 × 0,76 mm; bankovky ČNB 140–170 × 69–74 mm; mince 50 Kč Ø 27,5,
20 Kč Ø 26, 10 Kč Ø 24,5 z `pouzdro-mince-forma.md`; výsečníky OBI 6/8/10/12/15 a vidličky 4 mm
z `notes-vybaveni.md`). Co jisté není, je označené **„ověřit na prototypu“**. Nejsou tu žádné ceny,
odkazy do obchodů ani bezpečnostní rady navíc.

---

## 1. Shrnutí

**Lusk** je peněženka z **jednoho kusu třísločiněné lícové usně 1,2 mm**, přeložená ve dně
a prošitá **třemi rovnými svislými švy**. Vzniknou dvě zóny vedle sebe:

- **karetní zóna** (plochá kapsa) pro 4–6 karet na výšku a bankovky složené na třetiny za nimi,
- **lusk** – mincovní trubice podél pravého okraje, za mokra vytvarovaná na dřevěném trnu na dutinu
  6,0 mm pro dvě vrstvy mincí (6 × 50 Kč). Jak stálý ten tvar je pod tlakem v kapse a po navlhčení,
  prokáže až zkouška (13.4 #9).

Mince hlídá **středový výškový práh** ze dvou až čtyř kožených podložek Ø 8 mm v ústí lusku; mezera
prahu se ladí podle změřené nejtenčí mince. **Signature detail** je **párový průzor** 12 × 50 mm na
přední i zadní stěně lusku: palec a ukazováček jím minci sevřou a posunou přes práh, až z ústí
vyčnívá, a pak ji prsty vytáhnou. Žádný hardware.

| Veličina         | Hodnota                                                                                                                                                                       | Kde spočteno |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Přířez D1        | **112,0 × 199,3 mm**                                                                                                                                                          | 8.2          |
| Hotová peněženka | šířka **112 mm u dna** (W, ve všech stavech), nahoře ≈ 106 (C) – 109,5 (prázdná) mm; výška 98,2 mm (lusk) / 92,2 mm (karty); obdélník, do kterého se vejde: **112 × 98,2 mm** | 8.1          |
| Tloušťka         | 8,4 mm prázdná (jen v pruhu lusku), 8,4 mm stav B, 8,96 mm stav C                                                                                                             | 9            |
| Švy              | 3 švy skrz 2 × 1,2 mm, rozteč 4,0 mm, 64 otvorů                                                                                                                               | 8.4          |
| Díly             | D1 tělo + D2 podložky prahu Ø 8 (2–4 ks); přípravek T1 trn                                                                                                                    | 8.2, 8.6     |

---

## 2. Neznámé vstupy, na kterých návrh stojí

- **Tloušťky mincí** nikdo nezměřil. Hodnota **2,5 mm u 50 Kč** je převzatá z konceptů. Tloušťky
  a průměry mincí 1–5 Kč jsou neznámé; pro nejmenší minci počítá návrh s **Ø ≈ 20 mm (ověřit)**.
  **První krok je změřit posuvkou** (13.4).
- **Tloušťka bankovek** také není změřená. **Rezerva 2,0 mm** na několik složených bankovek je
  převzatá z pouzdra s mincí. Ověřit posuvkou na svazku, který opravdu nosíš.
- **Skutečná tloušťka kůže** (nominálně 1,2 mm) a **skutečná tloušťka překližky na trn**
  (nominálně 6 mm) – změřit; všechny rozměry jsou v oddílu 14 zapsané jako vzorce, takže se přepočítají.

---

## 3. Fáze 1 – Mechanické principy (shrnutí všech konceptů)

Vzniklo 13 konceptů ve dvou kolech. Druhé kolo mělo vlastní číslování, a proto má ID K7–K13
v závorce původní označení. Kategorie povinné podle kap. 14 jsou pokryté:

- **extrémně jednoduchý:** K1, K7
- **převážně jeden kus:** K2, K6, K8
- **wet-forming:** K3, K9
- **experimentální:** K4, K11, K13
- **minimální tloušťka:** K5, K10
- **jiný princip:** K6, K12

„Tloušťka C“ znamená 6 karet, několik bankovek a 6 mincí. U všech konceptů je spočítaná stejnou
metodou: součet vrstev v nejtlustší zóně.

| ID       | Název               | Kategorie                  | Základní princip                                                        | Tloušťka C   | Kde leží mince vůči kartám |
| -------- | ------------------- | -------------------------- | ----------------------------------------------------------------------- | ------------ | -------------------------- |
| K1       | Sloupec             | extrémně jednoduchý, 1 kus | U‑ohyb, 3 svislé švy, úzký sloupec mincí vedle karet, jazyk jako zátka  | 8,6 mm       | vedle                      |
| K2       | Zámek zavřením      | 1 kus                      | dvojklopa, ústí mincí u hřbetu přitlačí protější panel                  | 13,1–15,6 mm | na sobě                    |
| K3       | Práh                | wet-forming                | tvarované koryto 3 mm pod kartami, retence nevytvarovaným pruhem u ústí | 8,2 mm       | pod (koplanárně)           |
| K4       | Rty                 | experimentální             | tvarovaná čočka se štěrbinou, mačkací princip bez pružiny               | 15,2 mm      | na sobě                    |
| K5       | Hnízda              | min. tloušťka              | distanční vrstva s kruhovými lůžky, mince sevřená přesahem 0,1 mm       | 7,8 mm       | pod                        |
| K6       | Zámek na zámek      | jiný (bez šití)            | origami obálka, Z‑sklad kapsy, zámek jazyk‑do‑štěrbiny                  | 9,8–12,3 mm  | pod                        |
| K7 (K1)  | Kolej               | extrémně jednoduchý        | měkký kanál vedle karet, drží jen tření                                 | 9,0 mm       | vedle                      |
| K8 (K2)  | Brána do hřbetu     | 1 kus                      | kniha, všechna ústí míří do hřbetu                                      | 13,9–16,4 mm | na sobě                    |
| K9 (K3)  | Kolébky             | wet-forming                | dvě tvarované vany na 3 mince jako podnos, zámek zavřením knihy         | 13,0 mm      | na sobě                    |
| K10 (K4) | Tuhá dráha s prahem | min. tloušťka              | laminovaný rám 5,0 mm, výškový práh v ústí, okénko                      | 8,6 mm       | vedle                      |
| K11 (K5) | Stisková pusa       | experimentální             | tvarované rty otevírané stiskem konců                                   | 15,5 mm      | na sobě                    |
| K12 (K6) | Zpětná klapka       | jiný                       | jednosměrný ventil z kůže se zarážkou v ústí koleje                     | 9,0 mm       | vedle                      |
| K13 (K7) | Hřbetní napínák     | experimentální             | pásek, který se zavřením napne přes mince                               | 13,3–17,4 mm | na sobě                    |

**Co z fáze 1 plyne:** tloušťka se dělí do dvou skupin. Mince vedle karet nebo pod nimi dávají
8,2–9,0 mm. Mince na kartách dávají 13–17 mm, protože vrstvy se sčítají: mince 2,5–5,0 + kůže
1,2–2,4 navíc. Rozdíl je přímý důsledek kap. 10 a rozhoduje o všem dalším.

---

## 4. Fáze 2 – Kritika konceptů (shrnutí)

Porota používala dvě vylučovací kontroly (porotce 1):

- **(a)** Leží mince vedle karet?
- **(b)** Drží mince tvar nebo geometrie, a ne tření, tlak obsahu nebo vratná pružnost kůže?
  Třísločiněná useň pruží málo a vytahuje se.

Porotce 2 přidal **přehlédnutou chybu všech výškových prahů**. Mince je plochý kotouč, takže příčný
práh přes celou šířku dráhy musí kůži zvednout skoro po celé šířce mince. U K10 zbývá mezi mincí
a lištou jen asi 1 mm na každou stranu. Plát se tam neprohne, jen se smýká nebo stlačuje.

| ID  | Por. 1 | Por. 2 | Ø        | Fatální / hlavní vada                                                                                                             | Verdikt                | Co přenášíme dál                                                                              |
| --- | ------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| K10 | 7      | 6,5    | **6,75** | šití skrz 6,8 mm; příčný práh a lišta 1 mm (smyk); kalibrace podle neznámé t_min; okénko oslabuje práh; karty se 4 kusy volné     | **do fáze 3**          | výškový práh (nezávisí na průměru), dutina definovaná tvarem, okénko, zadní výkus na bankovky |
| K3  | 5,5    | 7      | **6,25** | u dna ohyb drží vrstvy ~3 mm od sebe, takže tam práh neexistuje; práh přes celou šířku (smyk); vytahání; 6 mincí jen s vyboulením | **do fáze 3**          | wet-forming místo laminátu; výdej posunem palcem s „cvaknutím“                                |
| K1  | 6      | 6      | **6,0**  | zátka drží třením; LIFO a dva kroky; rohy štěrbiny se trhají; ohyb nastřižený na plný stav zeje                                   | **do fáze 3** jako K1′ | U‑ohyb jako dno bez švu; 3 rovné švy skrz 2 vrstvy; děrovat po slepení skrz obě vrstvy        |
| K9  | 4,5    | 5      | 4,75     | vrství mince na karty (13 mm); kniha bez uzávěru se pootevře                                                                      | vyřadit                | tvarovací forma z lišt bez vykružováku; tvar zaručí počet vrstev                              |
| K12 | 4,5    | 3,5    | 4,0      | výdej dvěma rukama s prstem v ústí; 6 mincí se do 30 mm nevejde                                                                   | vyřadit                | tvarová zarážka jako záloha, kdyby práh selhal                                                |
| K5  | 3,5    | 4      | 3,75     | sevření přesahem 0,1 mm (kap. 23); 6 lůžek = výška 125 mm                                                                         | vyřadit                | tloušťku má zaručit konstrukce, ne obsah                                                      |
| K7  | 3      | 3      | 3,0      | drží jen tření, ústí nahoru otevřené                                                                                              | vyřadit                | referenční minimum 9,0 mm; detent podle průměru pro rozsah 20–27,5 mm nefunguje               |
| K2  | 2,5    | 2,5    | 2,5      | vrstvy na sobě; zámek závisí na množství bankovek                                                                                 | vyřadit                | zámek má dělat kůže, ne obsah                                                                 |
| K6  | 2      | 2,5    | 2,25     | bez stehů se rozloží; 4 vrstvy = 4,8 mm na hraně                                                                                  | vyřadit                | labyrint z přeplátování jako levný doplněk                                                    |
| K4  | 2      | 2      | 2,0      | tlak stehna čočku otevře; kůže nemá vratnou sílu                                                                                  | vyřadit                | –                                                                                             |
| K8  | 2      | 2      | 2,0      | vrstvy na sobě; kniha se sama nezavře; pás 366 mm                                                                                 | vyřadit                | „ústí míří do ohybu“                                                                          |
| K11 | 2      | 1,5    | 1,75     | stisk nezkrátí tětivu (konce jsou na tuhé stěně)                                                                                  | vyřadit                | mechanismus nesmí stát na vratném pružení kůže                                                |
| K13 | 2      | 1,5    | 1,75     | zdvih 3,77 mm na ±0,5 mm; creep                                                                                                   | vyřadit                | zámek zavřením musí fungovat tvarem, ne napětím                                               |

**Obecná poučení z fáze 2 (platí pro všechny další návrhy):**

1. Mince vedle karet, nikdy na nich.
2. Retence musí působit přes **tloušťku** mince. Průměr se u českých mincí mění o 7,5 mm
   (20 → 27,5), takže detent podle průměru nefunguje.
3. Mezera, na které retence stojí, musí být **definovaná tvarem**. Měkká čočka má v obvodu rezervu
   a mince projde bez odporu.
4. Výškový práh nesmí být příčný přes celou šířku, protože plochá mince by musela zvednout kůži po
   celé šířce. Patří **jen do středu** (porotce 2).
5. Na konce štěrbin a švů patří kruhové zakončení a zpětné stehy.
6. Z pouzdra s mincí: šikmé vidličky se ohybem zrcadlí, proto děrovat až po slepení skrz obě vrstvy
   najednou. Přídavek ohybu je π/2 · (obsah + vůle + kůže).

---

## 5. Fáze 3 – Tři nejlepší směry

Vybrané směry odpovídají TOP 3 obou porotců: **A = K10**, **B = K3**, **C = K1′**. Každý má
zapracované opravy z fáze 2. Do všech tří se přenáší oprava porotce 2: práh je **dvojice středových
podložek**, ne příčný pruh.

### Společné vstupy a vzorce

- **Karta:** 53,98 × 85,60 mm, 6 karet = 6 × 0,76 = 4,56 mm, 4 karty = 3,04 mm.
- **Bankovky:** rezerva 2,0 mm (ověřit). Na třetiny 46,7–56,7 × 69–74 mm (140/3 až 170/3). Na
  čtvrtiny 35–42,5 × 69–74 nebo 70–85 × 34,5–37 mm.
- **Plochá kapsa (čočka):** plochá šířka mezi švy S ≥ šířka předmětu + tloušťka obsahu + tolerance.
  Důvod: obvod 2S obalí průřez předmětu 2w + 2h. (Ve fázi 6 zpřesněno o posun neutrální osy
  kolem rohů obsahu κ′ = π · t − 2t, viz 8.2.)
- **Přídavek ohybu:** π/2 · (obsah + vůle + kůže). Počítá se po neutrální ose.
- **Středový práh:** podložka Ø 8 mm (výsečník 8 mm, sada OBI 6/8/10/12/15) nalepená uprostřed ústí
  na vnitřní straně.
  - Výška zbylé mezery: h = t_min − 0,5 až 0,8 mm, kde t_min je tloušťka nejtenčí nošené mince
    (ZMĚŘIT).
  - Tloušťka podložky na každé straně: p = (c − h)/2, kde c je výška dutiny.
  - **Proč práh funguje pro každou minci:** podložka je uprostřed a boční vůle je malá, takže ji
    mince vždy přejede. Střed mince může uhnout nejvýš o (W_i − D)/2. Pro dráhu W_i = 29 a nejmenší
    minci D ≈ 20 (ověřit) je to 4,5 mm; okraj podložky (4 mm od osy) i tak leží pod mincí, protože
    4,5 + 4 = 8,5 < poloměr mince 10 mm. Obecně stačí W_i < 2D − D_podložky.
  - **Proč se práh dá překonat:** plát se prohne jen lokálně o (t − h)/2 na stranu. Nemusí se
    zvedat po celé šířce jako u příčného prahu.

### Směr A – „Rám“ (K10 s opravami)

**Konstrukce**

- **D1 lícový plát:** 1 ks, useň 1,0 mm, 211 × 95 mm, přeložený na levém boku. Přídavek ohybu
  π/2 · (6,56 + 1 + 1,0) = 13,4 mm.
- **D2 rozpěrka ve tvaru ležatého „E“:** spodní lišta 99 × 6, dělicí 6 × 89, pravá 6 × 89. Oproti
  K10 jen **dvě vrstvy místo čtyř**: odřezek opaskové usně 3,5–3,7 mm (pokud zbyde z opasku, ověřit)
  - 1,2 mm ≈ 4,8–4,9 mm, s lepidlem ≈ 5,0 mm. Varianta bez opaskové kůže: 4 × 1,2 mm.
- **D3 práh:** 2 středové podložky Ø 8 v ústí dráhy (oprava porotce 2), jedna na každém plátu.
- **Spojení:** rám se přilepí na rub jednoho plátu, plát se přeloží a obvod (dno + pravý bok)
  a dělicí lišta se prošijí skrz 1,0 + 4,9 + 1,0 = 6,9 mm.

**Karty:** 4–6 ks na výšku v levé zóně 57,5 mm, stojí na spodní liště. Přístup výkusem R12
v předním plátu.

**Bankovky:** na třetiny (max 56,7 × 74) za kartami. Povinný zadní výkus R15, takže bankovky jdou
vytáhnout nezávisle na kartách.

**Mince**

- Tuhá dutina 5,0 mm na 2 vrstvy × 3 mince, tedy kapacita 6. Sedmá se nevejde.
- Proti vypadnutí chrání středový práh.
- Výdej: ústím dolů, palcem v okénku posunout nejbližší minci přes práh.
- Okénko je jen v předním plátu, 10 × 50 mm, konce výsečníkem Ø 10. Začíná 4 mm pod pásmem
  podložek, aby práh neoslabovalo.

**Rozměry:** ≈ 104 × 95 mm.

| Stav    | Karetní zóna                  | Mincovní zóna         | Celkem                           |
| ------- | ----------------------------- | --------------------- | -------------------------------- |
| prázdná | –                             | –                     | 6,8–6,9 mm (rám po celém obvodu) |
| B       | 1,0 + 3,04 + 2,0 + 1,0 = 7,04 | 7,0                   | ≈ 7,0 mm                         |
| C       | 1,0 + 4,56 + 2,0 + 1,0 = 8,56 | 1,0 + 5,0 + 1,0 = 7,0 | ≈ 8,6 mm                         |

**Výroba**

- **Obtížnost:** vysoká.
- **Nástroje:** nůž, pravítko, lepidlo, výsečníky 8/10, aku vrtačka s vrtákem ~1,2 mm, vidličky jen
  na značení.
- **Přípravek:** vrtací vodítko, lišta z překližky 10 mm s předvrtanými otvory po 4 mm, kterou se
  vrtá skrz rám. Samotná papírová šablona nestačí (porotce 1).
- **Nejtěžší krok:** kolmé předvrtání a šití skrz 6,9 mm. Když řada otvorů na rubu uteče, šev je
  křivý a nejde opravit.
- **Riziko:** delaminace rámu a velký objem práce na hranách 6,9 mm. Karty se 4 kusy mají vůli
  5,0 − 3,04 − 2,0 ≈ 0 mm bez bankovek, s bankovkami je vůle v rámu větší a karty drží hůř. Ověřit.

### Směr B – „Práh pod kartami“ (K3 s opravami)

**Konstrukce**

- **D1:** 1 ks, useň 1,2 mm, pás 100 × 184 mm, U‑ohyb dole.
- **Koryto:** přední vrstva se za mokra vytvaruje do koryta 3 mm hlubokého a 31,5 mm širokého.
  - Forma: překližka 10 mm, drážka 31,5 × 84 mm. Konce se vyvrtají vykružovákem 32 mm (sada OBI)
    a mezi nimi se odřízne.
  - Šířka drážky podle vzorce z pouzdra s mincí: 27,5 + 2 × 1,2 + 1,6.
- **D2 práh:** 2 středové podložky v bočním ústí místo nevytvarovaného pruhu (oprava obou porotců).
- **Oprava porotce 1:** dolní roh ústí se zajistí dvěma stehy a slepením, aby ohyb dna nedržel
  mezeru 3 mm.
- **Švy:** 2 boční svislé a 1 vodorovný dělicí. Pravý bok v pásmu koryta zůstane nešitý, to je ústí.
  Na konci dělicího švu 2 zpětné stehy.

**Karty:** 4–6 ks na šířku nahoře. Vnitřní šířka 85,6 + 6,56 + 1,5 = 93,66 ≈ 93,7 mm (obsah stavu C
6 × 0,76 + 2,0 = 6,56), hloubka 56 mm, výkus R15.

**Bankovky:** na čtvrtiny (85 × 35–37) za kartami. Na třetiny (56,7 × 74) by se do hloubky 56 mm
nevešly, protože 56,7 > 56. Doplněn zadní výkus.

**Mince**

- Jedna vrstva v korytě: 3 mince 50 Kč (82,5 mm z 83,7 mm délky), menší mince spíš 4.
- 6 mincí jde jen ve dvou vrstvách. Zadní vrstva kůže je ale měkká, vyboulí se o 2 mm a mezera
  u prahu pak **není definovaná**, takže stav C drží jen napůl. To je poctivá hranice směru.
- Výdej: palcem zvenku posunout minci korytem k boku, přes práh vyjede s cvaknutím.

**Rozměry:** ≈ 100 × 91 mm.

| Stav    | Karetní zóna                 | Zóna mincí                   | Celkem   |
| ------- | ---------------------------- | ---------------------------- | -------- |
| prázdná | 2,4                          | 1,2 + 3 + 1,2 = 5,4 (koryto) | 5,4 mm   |
| B       | 1,2 + 3,04 + 2,0 + 1,2 = 7,4 | 5,4                          | ≈ 7,4 mm |
| C       | 1,2 + 4,56 + 2,0 + 1,2 = 9,0 | 2,4 + 5,0 = 7,4 + vyboulení  | ≈ 9,0 mm |

**Výroba**

- **Obtížnost:** střední.
- **Nástroje:** vykružovák 32 mm, pila, 2 svěrky, rovné víko z překližky, výsečník 8.
- **Nejtěžší krok:** rovnoměrné vytvarování dlouhého koryta. Protažení ≈ 8 · 3² / (3 · 32) ≈ 0,75 mm
  ≈ 2,3 %, spočteno v K3. Na odřezku ověřit mělké konce a zvrásnění.
- **Riziko:** vytvarované koryto na líci trvale vystupuje. Pod tlakem v kapse může tvar povolit
  (ověřit).

### Směr C – „Sloupec se zámkem“ (K1′)

**Konstrukce**

- **D1:** 1 ks, useň 1,2 mm, 103 × 187 mm + jazyk nad sloupcem. U‑ohyb dole, 3 svislé švy (levý,
  dělicí, pravý).
- **Zúžené ústí:** pravý šev se v horních 15 mm sbíhá, takže ústí sloupce má 30 mm (27,5 + 2,5, pro
  jednu minci ve vrstvě).
- **Zámek:** jazyk 30 mm se přehne přes ústí a zasune do vodorovné štěrbiny 32 mm v předním dílu.
  - Délka jazyka: 28 + přídavek π/2 · (5,0 + 1,2) = 9,7 mm → ≈ 38 mm.
  - Konce štěrbiny zakončit výsečníkem Ø 3 proti natržení (porotce 1).
- Děrovat až po slepení okrajů skrz obě vrstvy.

**Karty:** 4–6 ks na výšku v zóně 62,0 mm (53,98 + 6,56 + 1,5 = 62,04), hloubka 88 mm, výkus R14.

**Bankovky:** na třetiny (max 56,7 × 74, vejde se do 62,0 × 88) za kartami, zadní výkus.

**Mince**

- Měkký sloupec 34 mm = 27,5 + 5,0 + 1,5 podle vzorce čočky pro dvě vrstvy. Kapacita 6 ve dvou
  vrstvách.
- Proti vypadnutí chrání tvarový zámek jazyk‑do‑štěrbiny, který nezávisí na průměru mince.
- Výdej: vytáhnout jazyk, naklonit, vyjede horní mince (LIFO). Konkrétní minci nevybereš.

**Rozměry:** ≈ 103 × 96 mm (92 + oblouk jazyka ≈ (5,0 + 2,4)/2 ≈ 3,7).

| Stav    | Karetní zóna                 | Sloupec                              | Celkem   |
| ------- | ---------------------------- | ------------------------------------ | -------- |
| prázdná | 2,4                          | 2,4, v ústí s jazykem 3,6            | 3,6 mm   |
| B       | 1,2 + 3,04 + 2,0 + 1,2 = 7,4 | –                                    | ≈ 7,4 mm |
| C       | 1,2 + 4,56 + 2,0 + 1,2 = 9,0 | 2,4 + 5,0 + 1,2 (jazyk v ústí) = 8,6 | ≈ 9,0 mm |

**Výroba**

- **Obtížnost:** nízká.
- **Nástroje:** nůž, pravítko, vidličky, výsečník 3 mm, lepidlo.
- **Nejtěžší krok:** poloha štěrbiny vůči přehnutému jazyku a mokré přehnutí jazyka, které nesmí být
  na ostro (hrozí prasknutí líce).
- **Riziko:** jazyk se časem zlomí v přehybu. Když je odjištěný, mince se vysypou.

---

## 6. Fáze 4 – Porovnání

Hodnocení 1–5, kde 5 je nejlepší. Konstrukce a použitelnost mají přednost před vzhledem (kap. 17).

| Kritérium              | A Rám                                 | B Práh pod kartami                             | C Sloupec se zámkem                 |
| ---------------------- | ------------------------------------- | ---------------------------------------------- | ----------------------------------- |
| Kompaktnost            | 3: 104 × 95, prázdná 6,9, plná 8,6    | 4: 100 × 91, 5,4 / 9,0                         | 4: 103 × 96, 3,6 / 9,0              |
| Jednoduchost           | 2: rám, vodítko, kalibrace            | 3: forma a tvarování                           | 4: jen jazyk a štěrbina navíc       |
| Ergonomie              | 4: okénko, vidíš nominál, jedna mince | 4: posun palcem a „cvak“ jednou rukou          | 2: dva kroky, LIFO, riziko vysypání |
| Vyrobitelnost          | 2: šití skrz 6,9 mm                   | 3: forma, sušení přes noc                      | 5: rovné švy skrz 2,4 mm            |
| Počet dílů             | 2: plát + 6 proužků rámu + 2 podložky | 4: 1 + 2 podložky                              | 5: 1                                |
| Počet švů / otvorů     | 2: 3 švy, ~70 otvorů skrz 6,9 mm      | 3: 3 švy + zajištění rohu, ~60 otvorů skrz 2,4 | 3: 3 švy, ~66 otvorů skrz 2,4       |
| Překrývající se vrstvy | 2: na obvodu 1,0 + 4,9 + 1,0          | 5: max 2 vrstvy                                | 4: 2 vrstvy, 3 v ústí s jazykem     |
| Bezpečnost mincí       | 4: tuhá dutina, práh na tloušťku      | 3: definovaná jen 1 vrstva, 6 mincí nejistě    | 4 zamčeno, 1 odemčeno               |
| Přístup ke kartám      | 3: se 4 kartami volné                 | 4: na šířku, výkus                             | 4: na výšku, výkus                  |
| Přístup k bankovkám    | 4: třetiny, zadní výkus               | 3: čtvrtiny, zadní výkus                       | 4: třetiny, zadní výkus             |
| Životnost              | 3: delaminace, pláty 1,0 povolí       | 2: koryto se zploští, práh se vytahá           | 3: přehyb jazyka, roh štěrbiny      |
| Vizuální čistota       | 3: masivní hrana, okénko              | 4: čistá plocha, reliéf koryta                 | 3: jazyk a štěrbina na líci         |
| Originalita            | 4                                     | 4                                              | 3                                   |
| **Součet (max 65)**    | **38**                                | **46**                                         | **48**                              |

(Verze 1 měla v řádku švů jen text bez bodů a součty 39/46/46 nevycházely; přepočteno v oddílu 15.)

**Čtení tabulky:**

- **C vede součtem** (48) díky výrobě a počtu dílů, ale má nejhorší ergonomii (2) a mince jsou
  bezpečné jen zamčené. **B** (46) má dobrý výdej a slabou kapacitu a životnost. Součet tu
  nerozhoduje – rozhoduje, kdo splní kap. 9 bez výjimky.
- **A** prohrává výrobou a díly, ale jako jediný splní všechny body kap. 9 najednou: definovaná
  dutina na 6 mincí, retence nezávislá na průměru, výdej jedné mince, žádná boule, žádný tlak na
  karty.
- **Závěr pro fázi 5:** vybírám **princip směru A**, tedy výškový práh ve **dutině definované
  tvarem**, a iteruji ho prostředky z B a C. Z B beru wet-forming místo laminátu, z C jeden kus,
  U‑ohyb a rovné švy skrz 2 vrstvy. Cílem je odstranit právě ty položky, kde A v tabulce prohrává
  (jednoduchost, vyrobitelnost, díly, životnost), a neztratit přitom bezpečnost mincí.

---

## 7. Fáze 5 – Finální koncept: LUSK

> Rozměry v této kapitole jsou už **opravené fází 6 a oběma kontrolami** (oprava prvního zápisu je
> v 8.0, změny po kontrole v oddílu 15).

**Název: Lusk.** Mince leží v tuhém „lusku“ podél pravého okraje jako semena a úzký průzor je
ukazuje. Název popisuje konstrukci, ne ozdobu.

### 7.1 Princip jednou větou

Jeden kus kůže 1,2 mm je přeložený ve dně a prošitý třemi rovnými švy; vzniknou dvě zóny vedle sebe –
plochá kapsa na karty a bankovky a **lusk**, mincovní trubice vytvarovaná za mokra kolem dřevěného
trnu na dutinu pro dvě vrstvy mincí, kterou hlídá **středový výškový práh** ze dvou až čtyř malých
kožených podložek v ústí. Že tvar lusku vydrží tlak v kapse a pot, tvrdíme až po zkoušce 13.4 #9.

### 7.2 Iterace od směru A k Lusku (co bylo odstraněno a proč)

| #   | Změna                                                          | Důvod                                                                                                                                                                                                                    | Co zmizelo                                                                                  |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 1   | Příčný práh → **středové podložky Ø 8**                        | Plochá mince nemusí zvedat kůži po celé šířce, plát se prohne jen lokálně (porotce 2). Podložky jdou vyměnit, takže práh se dá naladit po změření mincí.                                                                 | smyk kůže u lišt, nedosažitelná síla pro 50 Kč                                              |
| 2   | Laminovaný rám → **lusk vytvarovaný za mokra na trnu**         | Dutinu nedrží rozpěrka, ale tvar ohnuté kůže. Stěny lusku se jen ohýbají; **ve spodních rozích lusku a u konců švů je místní protažení nebo zvlnění** (dvojitě zakřivená plocha) – ověřit na zkušebním lusku (13.4 #10). | 6 proužků rámu, lepení laminátu, delaminace, šití skrz 6,9 mm, vrtací vodítko, hrany 6,9 mm |
| 3   | Ohyb na boku (A) → **ohyb ve dně** (C)                         | Dno lusku je zaoblená smyčka ohybu, takže se na dně nic nezmačká. Při šitém dnu by se trubice musela u švu zploštit do ostrého sevření a líc by v rohu praskal.                                                          | šev dna                                                                                     |
| 4   | Dva různé ohyby → **jeden ohyb pro obě zóny**                  | Karetní zóna ve stavu C (6,56 mm) a dutina lusku (6,0 mm) mají skoro stejnou tloušťku, takže jeden přídavek sedí oběma (výpočet v 8.2).                                                                                  | různé přídavky, schod na dně                                                                |
| 5   | Jeden průzor → **průzor na obou stěnách** (verze 2)            | Mince má v dutině vůli a leží, kam ji dostane gravitace. Když leží u zadní stěny, palec přes jednu štěrbinu nedosáhne (13.4 #13). Dvěma průzory ji palec a ukazováček sevřou z obou stran.                               | – (otvor přibyl, má funkci)                                                                 |
| 6   | Rovná horní hrana → **lusk o 6 mm vyšší než karetní zóna**     | Obě ústí jsou oddělená, v kapse poznáš hmatem, kde jsou mince, a nad práh zbude místo bez prodloužení karetní kapsy.                                                                                                     | záměna ústí, zbytečně hluboká kapsa na karty                                                |
| 7   | Tvarovat před šitím → **šít naplocho, tvarovat až sešité**     | Díry se prosekají skrz obě slepené vrstvy najednou naplocho, takže odpadá zrcadlení šikmých vidliček i nepodepřené děrování vedle vyboulené trubice.                                                                     | problém zrcadlení, podkládání při děrování                                                  |
| –   | **Zvažováno a zamítnuto:** jazyk nebo víko (C)                 | Je to druhý krok při placení (kap. 11) a lusk s prahem ho nepotřebuje.                                                                                                                                                   | –                                                                                           |
| –   | **Zvažováno a zamítnuto:** tvarovaná vana natahováním (B)      | Protažení 2–7 % podle hloubky a tvar se zploští. Ohyb kolem trnu natahuje kůži jen v rozích.                                                                                                                             | –                                                                                           |
| –   | **Záloha, ne součást návrhu:** tvarová zarážka z K12           | Použít jen tehdy, když podložky na prototypu nepodrží nejmenší minci při třesení.                                                                                                                                        | –                                                                                           |
| –   | **Záloha, ne součást návrhu:** stavěcí proužky podél švů lusku | Jen když lusk pod zátěží ztratí dutinu (13.4 #9). Přidají vrstvu do švu, proto ne jako výchozí stav.                                                                                                                     | –                                                                                           |

### 7.3 Konstrukce (přehled; přesně v 8.2)

- **D1 Tělo:** 1 ks, třísločiněná lícová useň 1,2 mm, pevná (ne valchovaná), přířez 112,0 × 199,3 mm.
- **D2 Podložka prahu:** Ø 8 mm z odřezku 1,0 nebo 1,2 mm, 2–4 ks (1–2 na každou stěnu podle
  kalibrace).
- **T1 Trn** (přípravek, forma lusku): překližka 6 mm, 29,0 mm u ústí → 28,5 mm u konce, délka 122 mm.
- **Hardware:** žádný. **Vrstvy:** ve švech a na hranách všude nejvýš 2 vrstvy (2,4 mm). Podložky
  prahu jsou uvnitř ústí, v žádném švu ani na hraně.

**Proč jedna tloušťka 1,2 mm na celé tělo (kap. 5):**

- 1,0 mm by dávalo měkký lusk a slabý práh.
- 1,5 mm by přidalo 2 × 0,3 = 0,6 mm ke každé zóně, zvětšilo přídavek ohybu o π/2 · 0,3 = 0,47 mm,
  ztížilo ohyb dna (u pouzdra s mincí bylo kvůli 1,5 mm nutné ztenčování) a švy by šly skrz 3,0 mm.
- Protože je tělo jeden kus, tloušťka se nedá lišit po dílech. Jemnost doladí jen podložky 1,0/1,2 mm.

**Skládání a spojení (pořadí v oddílu 11):** na rozvinutý díl se nanese lepidlo jen na úzké pruhy
pod třemi švy (8.5), díl se přeloží v ohybu dna lícem ven a slepí, švy se prosekají skrz obě vrstvy
najednou a sešijí sedlářským stehem, lusk se tvaruje až na sešitém kusu.

### 7.4 Karty (kap. 6)

- **Počet:** 4–6 karet na výšku v levé zóně, stojí na dně ohybu.
- **Přístup:** výkus na palec v přední stěně – U šířky 30 mm, hloubky 18 mm, dno R15. Přední karta
  z něj vyčnívá **13,6–15,6 mm** (podle toho, jak hluboko sedne v oblouku ohybu, 8.2), palec ji
  vysune nahoru (práh pro palec 12 mm, 13.4 #16).
- **Nevypadávání:** horní hrana karty je **2,0–2,4 mm pod hranou kapsy, ve stavu C 1,96 mm**
  (ohyb dna stáhne stěny o 0,44 mm, 8.2). Karty drží tření napjaté čočky. Čočka se mezi „4 karty bez
  bankovek“ a stavem C liší o 3,52 mm obsahu, takže **jedna šířka S_c nemůže být těsná pro oba
  stavy**. Priorita podle kap. 6: _nevypadávat_ má přednost před pohodlím, stav C ale nesmí být
  pod výrobní tolerancí (S_c v 8.2). Retence 4 karet se řeší **tvarem**: čočka se za mokra
  zafixuje na maketě stavu B (8.6), a když karty vypadávají, maketa se zúží (13.4 #14), S_c ne.
- **Kde karta drží:** přední výkus (x 21–51 od u = 70) a zadní výkus (x 26–46 od u = 60) se v x
  překrývají. V pásu x 26–46 nad u = 70 na kartu netlačí žádná stěna; retenci nese spodních 70 mm
  karty a boky x 4,5–26 a 46–67,5. Zadní výkus je proto zúžený z 34 na 20 mm (oddíl 15).
- **Vrácení:** do ústí karetní zóny. Vyšší lusk vedle funguje jako vodítko hrany.

### 7.5 Bankovky (kap. 7)

- **Skládání:** v repozitáři je jen rozsah délek bankovek ČNB 140–170 mm (řádek 14); který nominál má
  kterou přesnou délku, není sourcováno – **ověřit posuvkou na skutečných bankovkách** (13.4 #17).
  Bankovka, která na třetiny vyjde užší než karta (53,98 mm, tedy délka do 3 × 53,98 ≈ 162 mm), se
  skládá **na třetiny** (Z‑sklad): 46,7–53,98 × 69–74 mm – čočku nerozšiřuje. Delší bankovka (nad
  ~162 mm, v rozsahu ČNB tedy až 170 mm) by na třetiny vyšla širší než karta (170/3 ≈ 56,7 mm), proto
  **na čtvrtiny** (dvakrát napůl přes délku): 35–42,5 × 69–74 mm. Který nominál (100/200/500/1000/
  2000/5000 Kč) padne do které kategorie, se ověří stejnou zkouškou.
- **Umístění:** za kartami, u zadní stěny. Horní hrana bankovek je 88 − 74 = 14 až 88 − 69 = 19 mm
  pod hranou kapsy.
- **Přístup:** výkus 20 × 28 mm v **zadní** stěně (dno R10, x 26–46). Odkryje 69 − 60 = 9 až
  74 − 60 = 14 mm bankovky; výkus je u horní hrany bankovky (u = 69) široký 2 · √(10² − 1²) ≈ 19,9 mm,
  takže bankovku chytí dva prsty. Palec ji vysune nezávisle na kartách.
- **Volnost do strany:** bankovka na třetiny 46,7–53,98 mm leží v zóně 63 mm, má tedy do strany
  9–16,3 mm vůle a drží ji jen přítlak karet. Vypadávání bankovek při výdeji mince zkouší 13.4 #20.

### 7.6 Mince – odpovědi na kap. 9

Geometrie výdeje (8.2): podložky svírají plochu mince, dokud ji překrývají (u 84–92). Mince, která
leží u prahu, sahá od u = 84 − D dolů. Průzor končí u = 80, takže palec ji posune nejvýš o
80 − (84 − D) = D − 4 mm a mince pak z ústí (u = 94) vyčnívá **D − a_p = D − 14 mm**: 50 Kč
(Ø 27,5) **13,5 mm**, nejmenší mince (Ø ≈ 20, ověřit) **≈ 6 mm**; od toho ještě ubere šířka kontaktu
palce. Sama přes práh nevypadne, protože ji podložky pořád svírají.

1. **Vkládání (dva pohyby):** minci zasunout hranou do ústí lusku mezi podložky, pak ji **palcem
   v průzoru stáhnout dolů pod práh** – o 94 − 84 = 10 mm (prst se do dutiny 6 × 29 mm nevejde).
   Palec minci přes průzor zachytí, protože mince zasunutá k hraně ústí překrývá průzor o D − 14 mm
   (50 Kč 13,5 mm). Lusk se u ústí lokálně roztáhne o (t − h)/2 na stranu.
2. **Vytahování (dva pohyby, bez převracení):** peněženku držet vodorovně nebo jen mírně skloněnou
   ústím lusku k dlani, **palcem a ukazováčkem sevřít minci přes oba průzory** a posunout ji k ústí,
   až vyčnívá (≈ 8–13,5 mm u 50 Kč, horní mez D − a_p = 13,5 mm spočtená výše), pak ji prsty druhé
   ruky – nebo stejné ruky po přehmatu – vytáhnout. Gravitace k prahu není potřeba, takže se neobrací
   ústí karetní zóny dolů a nevypadávají karty ani bankovky (13.4 #20). Kolik mm vyčnívá a jestli jde
   uchopit jednou rukou, se změří (13.4 #21); u nejmenší mince je to ≈ 6 mm – **ověřit**, zda jde
   chytit nehty.
3. **Jedna mince:** ano. Protože h < t_min, práh propustí vždy jen jednu. Průzorem je vidět nominál
   u prahu. Vybrat libovolnou minci ze sloupce ale nejde, dostaneš tu, která je u hrdla – přiznaná
   slabina proti podnosu K9. Minci ze zadní vrstvy sevřeš přes zadní průzor (13.4 #13).
4. **Proti vypadnutí:** mezera h < t_min u středových podložek, dutina daná tvarem lusku, průchod
   jen s ohnutím stěny. Tlak v kapse lusk stlačuje (h se zmenší), opakované protlačování mincí ho
   naopak rozevírá (h se zvětší) – **dva protichůdné vlivy, ověřit** (13.4 #9, #22).
5. **Prázdný:** lusk drží tvar, pokud obstojí 13.4 #9; nic nevisí. Zvenku je vidět podélný reliéf.
6. **Maximum:** 2 vrstvy × 3 mince 50 Kč = 6 (dutina 6,0 ≥ 2 × 2,5 + 1,0). Čtyři mince v řadě se
   vejdou jen při průměru do 84 / 4 = 21 mm – průměry 1–5 Kč neznáme, ověřit. Sedmá padesátikoruna se
   pod práh nevejde a zůstane v ústí, takže kapacitu je vidět.
7. **Tlak na karty:** ne. Lusk je samostatná zóna za dělicím švem.
8. **Boule:** ne. Tloušťka lusku je 8,4 mm bez ohledu na obsah (dokud drží tvar).
9. **Přírůstek tloušťky:** 0 mm ve stavu C (8,4 < 8,96). Prázdná peněženka je v pruhu lusku o 6,0 mm
   tlustší než samotný cardholder – vědomá cena.
10. **Po letech:** dva protichůdné vlivy. Tlak v kapse lusk zplošťuje a h zmenšuje; každý průchod
    50 Kč ale rozevře stěny o 2,5 − h právě u ústí, kde jsou podložky 2 mm pod volnou hranou a 19,5 mm
    od švů – tam je tubus nejméně podepřený, a kůže se opakovanou zátěží dotvaruje (stejný důvod,
    proč byl zamítnut K13). Ústí se tak může trvale otevřít a h vzrůst. **Ověřit** 200 průchody
    (13.4 #22); když h vzroste o ≥ 0,2 mm, počítat s pravidelným přidáváním podložek (napsat do
    návodu). Podložky jdou vyměnit pinzetou přes ústí; lepené na rub se mohou odlupovat (13.4 #23).
    Pot a vlhko mohou tvar lusku vracet k plochému (13.4 #9). **Riziko cinkání:** tři mince v jedné
    vrstvě mají v dutině 6,0 mm vůli 6,0 − 2,5 = 3,5 mm; ověřit, případně snížit c na 5,5.

### 7.7 Ergonomie (kap. 11)

- **Z kapsy:** zaoblené dno bez švu jde do kapsy první. Lusk je „páteř“, za kterou se peněženka
  vytahuje, a brání prohýbání karet.
- **Jednou rukou:** palec na výkusu = karta, prsty na zadním výkusu = bankovka. **Mince jednou
  rukou jen zčásti:** posunout ji přes oba průzory jde jednou rukou, vytáhnout ji z ústí spíš
  druhou rukou (ověřit, 13.4 #21).
- **Nejpoužívanější karta:** patří dopředu, výkusem vyjede jedním tahem. **Vrácení:** jeden pohyb
  shora.
- **Zaplacení mincí:** peněženku neotáčet; palec a ukazováček sevřou minci přes oba průzory
  a posunou k ústí, pak se mince vytáhne prsty. **Dva pohyby**, bez odjišťování.
- **Vrácení mince:** zasunout do ústí a palcem v průzoru stáhnout ≈ 10 mm dolů pod práh. **Dva
  pohyby.**
- **Hmatová orientace:** lusk je o 6 mm vyšší a tlustší, v kapse se bez dívání pozná, kde jsou mince.

### 7.8 Signature detail (kap. 20): párový průzor lusku

Dvě úzké svislé štěrbiny 12 × 50 mm s kulatými konci (výsečník Ø 12 ze sady OBI) proti sobě na přední
i zadní stěně lusku, na ose lusku x = 88,5, u 30–80 (14–64 mm pod horní hranou), tedy 4 mm pod
pásmem podložek, aby práh neoslabovaly. Proti výkusu na bankovky (x 26–46) nekolidují.

- **Ovládání:** palec a ukazováček jimi sahají přímo na minci z obou stran, sevřou ji a posunou.
- **Stavoznak:** vidíš, jestli a jaké mince máš.
- **Bezpečnost:** 12 mm je méně než průměr nejmenší mince (≈ 20 mm, ověřit), takže jím nic nevypadne.
- **Výroba:** kulaté konce z výsečníku jsou zakončení proti natržení – tvar vzniká z pevnosti.

Spolu s luskem vystupujícím 6 mm nad karty je to jediný výrazný prvek produktu a celý je funkční.
Žádné jiné otvory, ozdobné švy ani ražby.

### 7.9 Maker's mark (kap. 21)

- **Místo:** přední stěna, levý dolní roh karetní zóny, střed x = 17 mm, u = 14 mm (souřadnice v 8.2),
  značka nejvýš 10 × 10 mm.
- **Proč tam:** není tam šev (levý šev x = 3,5, okraj značky x = 12 → 8,5 mm), výkus (začíná u = 70)
  ani průzor; je v rohu, ne dominantní; při placení je přední stěna nahoře; jedna rovná vrstva bez
  tvarování (mokří se jen lusk x 69,5–107,5 a pásmo ohybu, značka je mimo).
- **Postup:** **razit naplocho** po kroku 8 (před lepením) na tvrdé podložce, při tvarování (krok 15)
  místo značky chránit suchým hadříkem.

### 7.10 Vizuální charakter (kap. 19)

- **Silueta:** plochá deska s jedním měkkým podélným reliéfem, který vystupuje nad horní hranu.
  Charakter dává konstrukce: ohyb místo švu ve dně, tři rovné souběžné švy, lusk s párovým průzorem.
- **Hrany:** horní vnější rohy **vypouklé R4**; přechod z karetní hrany na lusk **vydutý R6**
  (výsečník Ø 12); dno tvoří oblouk ohybu a z boku je vidět průřez lusku.
- **Nit:** v barvě kůže nebo o tón tmavší. Kontrastní by zdůraznila tři švy – legitimní, všechny jsou
  nosné.
- **Povrch:** hladký líc, hrany zaleštěné.

### 7.11 Lusk proti směrům z fáze 3

| Kritérium                      | A                 | B                           | C              | **Lusk**                                         |
| ------------------------------ | ----------------- | --------------------------- | -------------- | ------------------------------------------------ |
| Rozměr / tloušťka C            | 104 × 95 / 8,6    | 100 × 91 / 9,0              | 103 × 96 / 9,0 | **112 (u dna) × 98,2 / 9,0**, nahoře ≈ 106–109,5 |
| Prázdná (max)                  | 6,9 po celé ploše | 5,4                         | 3,6            | 8,4 v pruhu lusku, jinak 2,4 (u dna víc, viz 9)  |
| Díly                           | ~9                | 3                           | 1              | **1 + 2–4 podložky**                             |
| Šití skrz                      | 6,9 mm            | 2,4                         | 2,4            | **2,4 mm, 64 otvorů**                            |
| Kapacita s definovanou retencí | 6                 | 3–4                         | 6 (zamčeno)    | **6**                                            |
| Kroky při placení mincí        | 1                 | 1                           | 2              | **2** (posunout, vytáhnout; ověřit)              |
| Přípravky                      | vrtací vodítko    | forma s drážkou, vykružovák | žádné          | **trn z lišty překližky**                        |

(Rozměry A, B, C jsou odhady fáze 3 bez rozboru pásma ohybu; u Lusku je šířka u dna spočtená, 8.1.)

**Lusk zůstává v nevýhodě ve čtyřech bodech:** prázdná peněženka má v pruhu lusku 8,4 mm; konkrétní
minci ze sloupce nevybereš; placení mincí má dva pohyby; je široký 112 mm, protože karta (53,98)
a mince (27,5) leží vedle sebe a pásmo ohybu u dna se nezúží. První dvě jsou přiznaná cena za
retenci, která nestojí na tření.

---

## 8. Fáze 6 – Technický návrh

### 8.0 Opravy oproti prvnímu zápisu fáze 5

Při přepočtu vyšlo sedm chyb. Opravené hodnoty jsou v kap. 7 i všude dál. **Hodnoty ve sloupci „Je“
jsou stav verze 1; po kontrole se dál změnily S_c (63,0), S_l (38,0), W (112,0), model κ a hotová
šířka – viz oddíl 15.**

| #   | Bylo                                                 | Proč špatně                                                                                                                                                                                     | Je (verze 1)                                                                                                                |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Lepit pruh 3,5 mm **na obě strany** každé čáry švu   | Lepidlo by ubralo 3,5 mm z každé strany karetní zóny i lusku (lusk by měl volných 30 mm místo 37 a trn by nešel zasunout).                                                                      | Vnější švy: lepit od hrany do 1 mm za čáru švu. Dělicí šev: pruh jen ±1 mm. Volné šířky zón se měří **mezi okraji lepení**. |
| 2   | S_c = 61 (karta + obsah + 0,5)                       | Chyběl posun neutrální osy kůže kolem rohů obsahu. (Verze 1 ho počítala jako π · t/2 = 1,88 mm, správně je π · t − 2t = 1,37 mm, oddíl 15.)                                                     | S_c = 62,5 mm; ve verzi 2 **63,0** (8.2).                                                                                   |
| 3   | Hotová šířka „92–98 mm“                              | Od šířky kapsy se odečetla tloušťka obsahu a chyběly okraje lepení u lusku.                                                                                                                     | ≈ 100–108 mm; ve verzi 2 **112 u dna, 106–109,5 nahoře** (8.1).                                                             |
| 4   | Lusk H_l = 92, práh 2–10 mm pod hranou               | Sloupec tří padesátikorun může stát až od čáry ohybu (u = 0), tedy do 82,5 mm; podložka začínala na 82 → **mince by stála v prahu**.                                                            | **H_l = 94 mm** → podložka od u = 84, rezerva 1,5 mm (8.2).                                                                 |
| 5   | Karetní zóna H_c = 86, „karta 3,4 mm pod hranou“     | 3,4 mm platí jen pro kartu v nejhlubším místě dna; přední karta leží u stěny výš (u ≥ 0) a byla by 0,4 mm pod hranou.                                                                           | **H_c = 88 mm** → 2,4 mm pod hranou u stěny, ve stavu C 1,96; schod lusku zůstává 6 mm.                                     |
| 6   | Nejdelší bankovky (horní mez rozsahu ČNB) na třetiny | Při délce 170 mm (horní mez sourcovaného rozsahu) mají na třetiny 56,7 mm, jsou širší než karta a rozšířily by čočku o 2,7 mm; který nominál to skutečně je, repozitář nesourcuje – **ověřit**. | Kratší bankovky (do ~162 mm) na třetiny, **nejdelší na čtvrtiny** (7.5).                                                    |
| 7   | Švy a lepení až k čáře ohybu                         | U dna je mezi stěnami mezera 6 mm (ohyb), dvě vrstvy tam nejde slepit naplocho.                                                                                                                 | Lepení končí **5 mm nad začátkem ohybu**, nejnižší otvor nejméně 6 mm (8.4, 8.5).                                           |

### 8.1 Celkové rozměry

Souřadnice: **x** zleva doprava na rozvinutém dílu (pohled na **líc**, přední stěna nahoře), **u** na
každé stěně od okraje pásma ohybu k horní hraně (u = 0 je místo, kde ohyb dna přechází v rovnou
stěnu). **Na rubu je x zrcadlené: x_rub = W − x** (díl otočený přes svislou osu, 8.5).

**Šířka u dna = W = 112,0 mm ve všech stavech.** Pásmo ohybu je válec s osou v x a jeho délka v x se
nemění (kůže neteče). Zóny se nad u = 5 stahují do čoček a sešité pruhy se proto mírně nakloní:
**peněženka je dole širší než nahoře** (lichoběžník) a na výšce 0–5 mm nad ohybem se u nelepených
konců švů musí rozdíl zvlnit. Tahle plocha se nedá rozvinout do roviny, šířky nahoře jsou jen
odhad modelu.

**Šířka nahoře** (odhad) = okraje + projekce zón:

| Stav                       | Levý okraj (0 → okraj lepení) | Karetní zóna (projekce) | Dělicí pruh | Lusk (projekce) | Pravý okraj | **Nahoře**     | **U dna** |
| -------------------------- | ----------------------------- | ----------------------- | ----------- | --------------- | ----------- | -------------- | --------- |
| A prázdná (stěny naplocho) | 4,5                           | 63,0                    | 2,0         | 35,5            | 4,5         | **≈ 109,5 mm** | 112,0     |
| B                          | 4,5                           | 60,9                    | 2,0         | 35,5            | 4,5         | **≈ 107,4 mm** | 112,0     |
| C                          | 4,5                           | 59,6                    | 2,0         | 35,5            | 4,5         | **≈ 106,1 mm** | 112,0     |

**Obdélník, do kterého se peněženka vejde: W × H = 112,0 × 98,2 mm.**

Projekce karetní zóny (model: stěna vystoupá svisle o h/2 − t, kolem dvou vypouklých a dvou vydutých
rohů po neutrální ose přidá π · t − 2t = 1,37 mm, zbytek se nakloní):

- délka mimo obsah a rohy na stranu Ls = (S_c − w_k − π · t)/2 = (63,0 − 53,98 − 3,77)/2 = 2,63 mm,
- vodorovně d = √(Ls² − (h/2 − t)²): B (h = 5,04) √(2,63² − 1,32²) = 2,27; C (h = 6,56) √(2,63² − 2,08²)
  = 1,60 mm,
- projekce = w_k + 2d + 2t: B 60,9; C 59,6 mm. Stav A = S_c, když stěny leží naplocho.

Projekce lusku (tvar daný trnem 29 × 6, R1):

- obvod horní plochy trnu po neutrální ose (29 − 2) + 2 · π/2 · (1 + 0,6) = 32,03 mm,
- na šikmé přechody k lepení zbývá (38,0 − 32,03)/2 = 2,99 mm na stranu, výškový rozdíl
  (3 − 1) − 0,6 = 1,4 mm → vodorovně √(2,99² − 1,4²) = 2,64 mm,
- projekce = 29 + 2 · (0,6 + 2,64) = **35,5 mm**.

**Výška** (stejná ve všech stavech): lusk H_l + vnitřní poloměr ohybu + kůže = 94 + 3,0 + 1,2 =
**98,2 mm**; karetní zóna 88 + 4,2 = **92,2 mm**. (Neutrální poloměr ohybu (6,0 + 1,2)/2 = 3,6,
vnitřní 3,6 − 0,6 = 3,0.)

**Tloušťka:** prázdná 8,4 mm (jen pás lusku; karetní zóna 2,4–7,44, viz 9), stav B 8,4 mm, stav C
**8,96 mm**.

### 8.2 Díly

#### D1 – Tělo

| Položka     | Hodnota                                                                                                                                                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funkce      | přední a zadní stěna, dno (ohyb), karetní zóna, lusk, obě ústí                                                                                                                                                                                                                                                             |
| Materiál    | třísločiněná hovězí lícová useň, pevná, ne valchovaná                                                                                                                                                                                                                                                                      |
| Tloušťka    | 1,2 mm (změřit; vše v oddílu 14 se přepočítá z t)                                                                                                                                                                                                                                                                          |
| Přířez      | **112,0 × 199,3 mm** (obdélník před výřezy); na A4 (210 × 297) zbude pruh 98 × 297 na zkušební lusk 69 × 144,3 a podložky                                                                                                                                                                                                  |
| Orientace   | obkreslit na **líc** (list 1); ohyb lícem ven; horní polovina výkresu = přední stěna (průzor, výkus na palec, značka), dolní = zadní stěna (průzor, výkus na bankovky). **Lepení se značí na rubu podle listu 2, kde je x zrcadlené (x_rub = W − x).** Hned po vyříznutí napsat na rub tužkou „L“ k hraně na straně lusku. |
| Směr vláken | obecné řemeslné pravidlo říká, že podél páteře se useň tahá méně; u přířezu A4 to ale nemusí být poznat. Odřezek natáhnout rukou v obou směrech a **směr, který se tahá méně, dát podél x** (napříč peněženkou), protože čočka kapsy i lusk se roztahují v x. Ověřit na prototypu.                                         |

**Rozměry v x (od levé hrany líce):**

| Prvek                                      | x [mm]                | Výpočet                                 |
| ------------------------------------------ | --------------------- | --------------------------------------- |
| levá hrana                                 | 0                     |                                         |
| levý šev (čára)                            | 3,5                   | e = 3,5                                 |
| konec levého lepení / začátek karetní zóny | 4,5                   | e + g, g = 1,0                          |
| karetní zóna volně                         | 4,5 – 67,5            | S_c = 63,0                              |
| střed karetní zóny (výkusy)                | 36,0                  | (4,5 + 67,5)/2                          |
| dělicí lepení                              | 67,5 – 69,5           | 2g                                      |
| dělicí šev (čára)                          | 68,5                  | 4,5 + 63,0 + 1                          |
| lusk volně                                 | 69,5 – 107,5          | S_l = 38,0                              |
| střed lusku (průzory, podložky, trn)       | 88,5                  | (69,5 + 107,5)/2                        |
| pravé lepení / pravý šev (čára)            | 107,5 – 112,0 / 108,5 |                                         |
| pravá hrana                                | 112,0                 | W = 3,5 + 1 + 63,0 + 2 + 38,0 + 1 + 3,5 |

**Výpočet S_c (karetní zóna):** stěna čočky musí obalit obsah šířky w_k a tloušťky h. Nejkratší
možná délka stěny po neutrální ose je se svislou stěnou u švu: vystoupá o h/2 − t, obejde dva
vypouklé rohy (kolem obsahu) a dva vyduté (u okraje lepení), každý čtvrtkruh s poloměrem t/2, tedy
S_min = w_k + h + π · t − 2t (κ′ = π · t − 2t = 1,37 mm). Delší stěna se jen nakloní.

- stav C: 53,98 + 6,56 + 1,37 = **61,91 mm**; stav B: 60,39 mm; 4 karty bez bankovek: 58,39 mm,
- rezerva s_c = 1,0 mm na ruční řez a polohu čáry (±0,5) a stažení stehy (8.7),
- S_c = round₀,₅ **nahoru** (61,91 + 1,0 = 62,91) = **63,0 mm**,
- rezervy: C 63,0 − 61,91 = **1,09 mm**; B 2,61 mm; 4 karty bez bankovek 4,61 mm (volné – retence
  tvarem na maketě, 8.6, 13.4 #14),
- i při přetoku lepidla 0,5 mm z obou okrajů zbude 62,0 ≥ 61,91 (maskovací páska, 8.5).
- Ve verzi 1 bylo S_c = 62,5 s rezervou „0,08 mm“ podle nadsazeného κ = π · t/2 = 1,885; se
  správným κ′ by měla 0,59 mm, pořád pod tolerancí (oddíl 15).

**Výpočet S_l (lusk):**
obvod poloviny trnu po neutrální ose P = (b − 2r) + (c − 2r) + π · (r + t/2) = (29 − 2) + (6 − 2) +
π · 1,6 = 27 + 4 + 5,03 = 36,03 mm; + s_ins = 2,0 mm na zasunutí trnu do mokré kůže, stažení stehy
a přetok lepidla = 38,03 → round₀,₅ = **S_l = 38,0**. Trn, který projde bez šikmých přechodů:
b_max = 29 + (38,0 − 36,03) = **30,97 mm**. I při přetoku 0,5 mm z obou okrajů lusku zbývá 37,0 >
P = 36,03.

**Rozměry v délce (od horní hrany přední stěny lusku dolů):**

| Prvek                      | Hodnota    | Výpočet                       |
| -------------------------- | ---------- | ----------------------------- |
| přední stěna lusku         | 94,0       | H_l                           |
| pásmo ohybu                | 11,31      | F = π/2 · (c + t) = π/2 · 7,2 |
| zadní stěna lusku          | 94,0       | H_l                           |
| **celkem**                 | **199,31** | 2 · 94 + 11,31                |
| karetní část (horní hrany) | 187,31     | 2 · 88 + 11,31                |

- **H_l = 94:** sloupec 3 × 27,5 = 82,5 + rezerva pod prahem 1,5 + spodní okraj podložky 6 + 4 = 10
  → 94. Nejvýš stojící mince (u stěny, u = 0 až 82,5) končí 1,5 mm pod podložkou (u = 84).
- **H_c = 88 = H_l − 6:** karta 85,6 u stěny (dolní hrana u = 0) končí 2,4 mm pod hranou; karta dál
  od stěny sedne v oblouku ohybu níž (dolní roh až u ≈ −√(3,0² − (3,0 − 0,76)²) = −2,0), v nejhlubším
  místě dna (u = −3,0) je 5,4 mm pod hranou.
- **Ohyb:** stejný pro obě zóny. Karetní zóna ve stavu C by chtěla π/2 · (6,56 + 1,2) = 12,19 mm,
  chybí 0,88 mm → každá stěna se stáhne o 0,44 mm, horní hrana karetní zóny klesne o 0,44 mm (karta
  pořád 1,96 mm pod hranou; kontrola ve stavu C s m_k = 1,9, 14.2). Ve stavu B by stačilo
  π/2 · (5,04 + 1,2) = 9,80 mm, přebytek 1,5 mm udělá dno karetní zóny o 0,75 mm hlubší.
- **Vyčnívání karty ve výkusu:** 85,6 − 70 = 15,6 mm u karty u stěny, 15,6 − 2,0 = 13,6 mm u karty,
  která sedla v oblouku → **13,6–15,6 mm**.

**Obrys (obě stěny zrcadlově přes pásmo ohybu, x stejné):**

- horní hrana karetní zóny u = 88 od x = 0 do x = 59,0,
- **vydutý schod R6:** výsečník Ø 12, střed (x = 59,0; u = 94); oblouk z (59,0; 88) do (65,0; 94).
  Střed leží přesně na horní hraně obdélníku přířezu, horní polovina kruhu je mimo díl, levá je odpad
  nad u = 88, výsečník tedy bere jen odpad. Roh v (65,0; 94), kde oblouk potká hranu lusku (90°),
  zaoblit smirkem ≈ R1. Vlevo od dělicího švu zůstává nad u = 88 pruh 67,5 − 65,0 = 2,5 mm nelepené
  kůže (kus stěny karetní kapsy – vodítko); horní otvor dělicího švu (68,5; 90,5) je od oblouku
  68,5 − (59 + √(6² − 3,5²)) = 4,6 mm.
- horní hrana lusku u = 94 od x = 65,0 do x = 112,0,
- **vypouklé rohy R4:** vlevo nahoře (střed x = 4; u = 84), vpravo nahoře (střed x = 108,0; u = 90),
- boky x = 0 a x = 112,0 rovně přes celou délku včetně pásma ohybu.

**Výřezy:**

| Prvek             | Stěna              | Poloha a tvar                                                                                                             | Výpočet / důvod                                                                                                                                                          |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Výkus na palec    | přední             | U šířky 30 (x 21,0–51,0), dno R15 se středem (36,0; 85) → dno u = 70; svislé boky u 85–88; rohy u horní hrany vypouklé R2 | hloubka 18; přední karta vyčnívá 13,6–15,6 mm                                                                                                                            |
| Výkus na bankovky | zadní              | U šířky 20 (x 26,0–46,0), dno R10 se středem (36,0; 70) → dno u = 60; boky u 70–88; rohy R2                               | hloubka 28; bankovka 69–74 vysoká vyčnívá 9–14 mm; užší než přední výkus, aby zadní stěna podepřela kartu v x 21–26 a 46–51                                              |
| Průzor            | **přední i zadní** | štěrbina 12 mm, středy koncových kruhů Ø 12 v (88,5; 36) a (88,5; 74) → u 30–80; rovné řezy x = 82,5 a 94,5               | 14–64 mm pod hranou 94; od podložky (u = 84) 4 mm; leží v rovné ploše trnu (u konce 28,5 − 2 · 1 = 26,5 široké, x 75,25–101,75); obě stěny stejně, po složení proti sobě |
| Středy podložek   | obě (rub)          | (88,5; 88), **nepropichovat** – zaměřit zevnitř podle průzoru (krok 16)                                                   | 6 mm pod hranou 94, na ose průzoru                                                                                                                                       |
| Maker's mark      | přední (líc)       | střed (17; 14), max 10 × 10                                                                                               | 7.9                                                                                                                                                                      |

**Geometrie výdeje mince (kontrola pro generátor):** mince u prahu leží v u (84 − D) až 84.
Vyčnívání po posunu palcem = (u_p2 + w_p/2) − (u_w − D_w/2 − D) − (H_l − (u_w − D_w/2)) = D − a_p:
Ø 27,5 → 80 − 56,5 − 10 = **13,5 mm ≥ 8** ✓; Ø 20 → 80 − 64 − 10 = **6,0 mm** (pod 8 – ověřit,
13.4 #21). Posunout průzor výš nejde: 4 mm pod podložkou je podmínka pevnosti prahu. Kdyby 6 mm
nestačilo, varianta D_w = 6 (výsečník 6), a_w = 5, a_p = 12 dá u Ø 20 vyčnívání 8 mm za cenu menší
plochy lepení podložky (13.4 #23) – rozhodnout po prototypu.

#### D2 – Podložka prahu

| Položka   | Hodnota                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funkce    | středový výškový práh v ústí lusku, mezera h < t_min                                                                                                                         |
| Materiál  | odřezek téže usně 1,2 mm, případně 1,0 mm                                                                                                                                    |
| Rozměr    | Ø 8 mm (výsečník 8), okraj po nalepení zaoblit smirkem do kopulky                                                                                                            |
| Počet     | 2–4 ks (1–2 na každou stěnu) + náhradní                                                                                                                                      |
| Orientace | **rubem na rub stěny** (lepí se rub na rub), líc podložky do dutiny, aby mince klouzala po hladké straně                                                                     |
| Poloha    | střed (x = 88,5; u = 88) na rubu přední i zadní stěny, proti sobě; zaměřit zevnitř: na ose průzoru, 6 mm pod hranou ústí; zadní podložku přiložit proti přední sevřením ústí |

Tloušťka na stranu p = (c − h)/2, h = t_min − 0,5 až 0,8 mm. Kombinace z 1,0 a 1,2 mm dávají součet
obou stran p₁ + p₂ ∈ {2,0; 2,2; 2,4; 3,0; 3,2; 3,4; 3,6; 4,0; 4,2; 4,4; 4,6; 4,8} → h = 6,0 − (p₁ + p₂)
∈ {4,0; 3,8; 3,6; 3,0; 2,8; 2,6; 2,4; 2,0; 1,8; 1,6; 1,4; 1,2} mm. Součty 2,0–2,4 dávají h 3,6–4,0, to
je nad t_max = 2,5 a jako práh nemají smysl. **Kroky po 0,2 mm jsou jen v pásmu p₁ + p₂ 4,0–4,8
(h 1,2–2,0)**, jinde 0,4–0,6 mm; doladit přebroušením rubu podložky. Když je k dispozici jen 1,2 mm:
h ∈ {3,6; 2,4; 1,2} a zbytek broušením. Když se dvě podložky na sobě odlupují (dvě lepené spáry),
použít jednu silnější přebroušenou na p (13.4 #23).

**Příklad výpočtu (čísla jsou hypotetická, jen pro ukázku vzorce):** kdyby nejtenčí nošená mince
měla t_min = 1,8 mm → h = 1,0–1,3 → p₁ + p₂ = 4,7–5,0 → 2 × 1,2 na jedné a 1,2 + 1,2 na druhé straně
(4,8 → h = 1,2). Skutečnou hodnotu určí měření (13.4 #1).

**Hardware:** žádný. Důvod: uzávěr ani spona nejsou potřeba – mince drží práh, karty a bankovky čočka.
Druk nebo magnet by přidaly díl, vrstvu a krok při placení (kap. 9, 11) bez funkce, kterou konstrukce
nemá.

### 8.3 Hrany

| Hrana                                              | Vrstvy | Typ                                            | Úprava                                                                                                    | Kdy                                                          |
| -------------------------------------------------- | ------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| horní hrany karetní zóny (přední i zadní)          | 1      | řezaná, viditelná                              | beveling líce (nejmenší beveler; na 1,2 mm jen lehce, ověřit na odřezku), broušení, burnishing s Tokonole | před lepením                                                 |
| výkus na palec, výkus na bankovky                  | 1      | řezaná, viditelná                              | totéž                                                                                                     | před lepením                                                 |
| schod R6 a horní hrana lusku                       | 1      | řezaná, viditelná, ústí mincí                  | totéž; ústí lusku hladké, mince přes něj jezdí                                                            | před lepením, přeleštit po tvarování (krok 15b)              |
| průzory (obě stěny)                                | 1      | řezaná, viditelná, leží na nich prsty          | broušení a burnishing kulatým kolíkem; beveling líce                                                      | před lepením, přeleštit po tvarování (krok 15b)              |
| boky v pásmu ohybu a spodních 5 mm boků (u < 5)    | 1      | řezaná, viditelná (u dna se vrstvy rozcházejí) | beveling líce, broušení, burnishing                                                                       | před lepením – po složení se k nim nedostaneš ze strany rubu |
| levý a pravý bok nad u = 5                         | 2      | řezaná, viditelná, **leštěná**                 | zarovnat (broušení na destičce), beveling obou líců, broušení, burnishing                                 | po šití                                                      |
| obvod podložek D2                                  | 1      | skrytá (uvnitř lusku)                          | zaoblit smirkem do kopulky                                                                                | po nalepení                                                  |
| pruh 65,0–67,5 nad u = 88 (vodítko u dělicího švu) | 1 + 1  | viditelná, obě vrstvy volné                    | jako horní hrany                                                                                          | před lepením                                                 |

Beveling: jen tam, kde je hrana viditelná a hmatatelná. Skryté hrany uvnitř lusku (kromě ústí)
nevznikají, protože lusk je z ohybu a švů.

### 8.4 Šití

Sedlářský steh, voskovaná nit 0,6 mm, dvě jehly. **Rozteč 4,0 mm** (sada vidliček 4 mm; při 3,85 mm
se počty změní, ale kvůli děrování skrz obě vrstvy najednou nic nelícuje zrcadlově – rozteč je volná).
Všechny švy jdou skrz 2 × 1,2 = 2,4 mm. Otvory se počítají **od horního konce dolů** (horní konec je
na očích a na ústí), dolní konec padne, kam vyjde, ale nejméně 6 mm nad u = 0. **Otvory se na díl
nepřenášejí ze střihu** – čáry a horní otvory se rýsují až na slepeném kusu z líce přední stěny
(krok 12); vrstva STITCH ve střihu slouží ke kontrole.

| Šev        | x     | Začátek (horní otvor)        | Konec (dolní otvor) | Od hrany                  | Otvorů | Stehů  | Výpočet                                      |
| ---------- | ----- | ---------------------------- | ------------------- | ------------------------- | ------ | ------ | -------------------------------------------- |
| levý       | 3,5   | u = 84,5 (3,5 pod hranou 88) | u = 8,5             | 3,5                       | **20** | 19     | ⌊(84,5 − 6)/4⌋ + 1 = 20; 84,5 − 19 · 4 = 8,5 |
| dělicí     | 68,5  | u = 90,5 (3,5 pod hranou 94) | u = 6,5             | uprostřed pruhu 67,5–69,5 | **22** | 21     | ⌊(90,5 − 6)/4⌋ + 1 = 22; 90,5 − 21 · 4 = 6,5 |
| pravý      | 108,5 | u = 90,5                     | u = 6,5             | 3,5                       | **22** | 21     | totéž                                        |
| **celkem** |       |                              |                     |                           | **64** | **61** |                                              |

- Horní otvory v rozích R4: bod (3,5; 84,5) je 0,71 mm od středu rohu (4; 84), tedy 4 − 0,71 = 3,29 mm
  od hrany; vpravo (108,5; 90,5) vůči (108,0; 90) stejně 3,29 mm. ✓
- **Zpětné stehy:** 2 na horním konci každého švu (ústí je nejnamáhanější), 2 na dolním.
- **Nit orientačně:** 4 × (délka švu + 2 · 2 · 4 mm zpětných stehů): levý 4 · (76 + 16) = 0,37 m,
  dělicí a pravý 4 · (84 + 16) = 0,40 m → **≈ 1,2 m + konce** na navlečení a zapošití. Ověřit na
  zkušebním lusku (pravidlo „4 × délka“ je převzaté z `pouzdro-mince.md`).

### 8.5 Lepení

Lepí se **rub na rub** (rub se nezdrsňuje), kontaktní lepidlo na kůži, jen tyto pruhy na obou
stěnách. **Lepidlo se nanáší na rub, a tam je x zrcadlené: x_rub = W − x = 112,0 − x** (list 2
střihu):

| Pruh        | x na líci            | **x na rubu** (od levé hrany rubu = hrana lusku „L“) | u      | Důvod                                                  |
| ----------- | -------------------- | ---------------------------------------------------- | ------ | ------------------------------------------------------ |
| levý        | 0 – 4,5              | 107,5 – 112,0                                        | 5 – 88 | od hrany do 1 mm za čáru švu; otvory jdou skrz slepené |
| dělicí      | 67,5 – 69,5          | **42,5 – 44,5**                                      | 5 – 94 | ±1 mm kolem čáry 68,5; víc by ubralo šířku zón         |
| pravý       | 107,5 – 112,0        | 0 – 4,5                                              | 5 – 94 | jako levý                                              |
| podložky D2 | Ø 8 kolem (88,5; 88) | Ø 8 kolem (23,5; 88)                                 |        | až po tvarování (oddíl 11, krok 16), nepropichovat     |

Krajní pruhy jsou shodné (4,5 mm), chyba zrcadlení se projeví jen na dělicím pruhu: odměřený na rubu
67,5–69,5 od hrany _karet_ by padl doprostřed karetní zóny (na líci 42,5–44,5), šev by šel nelepeným
místem a lepidlo by zúžilo karetní zónu. Proto se hned po vyříznutí napíše na rub „L“ k hraně lusku
a dělicí pruh se měří **od hrany L**.

**Maskovací páska:** před nanesením lepidla olepit na rubu vnitřní okraje pruhů papírovou
maskovací páskou (x_rub = 4,5; 42,5; 44,5; 107,5), nanést lepidlo, pásku strhnout a nechat zavadnout.
Přetok 0,5 mm na oba okraje by ubral 1,0 mm ze S_c i S_l (8.7) – s páskou se to nestane, a kdyby
ano, konstrukce to ještě snese (S_c 62,0 ≥ 61,91, S_l 37,0 > 36,03).

**Nelepí se:** plochy zón, pásmo ohybu, spodních 5 mm pruhů (u < 5 – tam se stěny rozcházejí do
mezery ohybu 6 mm; stoupání 3 mm na 5 mm výšky, ověřit na zkušebním lusku, jestli roh nepraská nebo
se nevlní – případně konec lepení posunout na u = 8 a nejnižší otvor na ≥ 9), pruh 65,0–67,5 nad u = 88
(vodítko karty). Rub v lepených pruzích **nezapečeťovat**.

### 8.6 Wet-forming a přípravky

Tvaruje se jen **lusk a pásmo ohybu, až po sešití**. Není to forma s dutinou, ale trn – stěny lusku
se jen ohýbají; ve spodních rozích lusku a u konců švů je místní protažení nebo zvlnění (ověřit na
zkušebním lusku, 13.4 #10).

**Trn T1 je jen pro tento krok (15), ne pro lepení a děrování (11, 13).** Dřív, naplocho, drží ohyb
otevřený **kulatá distanční tyčka Ø 6 mm** (řádek níž) – plochý trn 29 × 6 mm položený napříč by
svou šířkou stál nastojato podél stěn skoro až k u = 26 a bránil lepeným pruhům i děrování (B1,
oddíl 15).

| Přípravek                          | Rozměr                                                                                                                                                                                   | Výpočet / poznámka                                                                                                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Distanční tyčka** (kroky 11, 13) | kulatá, Ø 6,0 mm (= c), délka ≥ 120 mm (přes celou šířku W = 112)                                                                                                                        | leží v ohybu naplocho, dokud je díl nesešitý a netvarovaný; sedí ve vnitřním poloměru ohybu R_i = 3,0 mm a čouhá jen ≈ R_i = 3 mm nad plochu, pod začátek lepení u_g = 5 – na rozdíl od trnu T1 nebrání lepeným pruhům ani děrování |
| **T1 Trn**                         | překližka tl. c = 6,0 mm (skutečnou změřit), šířka **29,0 mm u ústí → 28,5 mm u konce**, délka **122 mm** = vnitřní hloubka 97 + 25 na držení (z materiálu ≥ 29 × 125 s rezervou na řez) | 29 = 27,5 + 1,5 boční vůle; 97 = vnitřní hloubka lusku 94 + R_i 3,0. Zúžení ke dnu, aby šel po vyschnutí vytáhnout: u konce 28,5 − 27,5 = 1,0 mm boční vůle, pořád víc než vůle 2 vrstev                                            |
| – podélné hrany                    | zaoblit R1 smirkem                                                                                                                                                                       | v rovině líce vnější vrstvy mincí (2,5 mm od středu) je dutina u konce široká 26,5 + 2 · √(1 − 0,5²) = 28,23 ≥ 27,5 ✓                                                                                                               |
| – spodní konec                     | zaoblit přes tloušťku na plný půlkruh R3                                                                                                                                                 | sedne do vnitřku ohybu (vnitřní poloměr 3,0)                                                                                                                                                                                        |
| – povrch                           | obalit potravinovou fólií, pod fólii na horní konec tahací poutko                                                                                                                        | mokrá třísločiněná useň může od materiálu zabarvit (převzato z `pouzdro-mince-forma.md` pro kov; u dřeva ověřit). Poutko: za něj se trn vytahuje, ne za ústí lusku                                                                  |
| **Maketa karetní zóny**            | 4 staré karty + přeložený papír 2 mm ve fólii = 5,04 mm (stav B)                                                                                                                         | ohyb a čočka karetní zóny se zafixují na běžný stav; když 4 karty vypadávají, tenčí maketa 3 karty + papír (13.4 #14)                                                                                                               |
| **Přítlačné desky**                | 2 × překližka ≥ 10 mm, ≈ 125 × 110 mm                                                                                                                                                    | větší než hotový kus 112 × 98,2                                                                                                                                                                                                     |
| **Svěrky**                         | 2–4                                                                                                                                                                                      | tlačit jen lehce – rozměr určuje trn, ne síla                                                                                                                                                                                       |

Protože trn má tloušťku přesně c, **trn je měřidlo dutiny**: když změřená překližka má např. 5,5 mm,
dutina bude 5,5 a podložky se spočítají z c = 5,5 (oddíl 14).

**Vytažení trnu:** trn má po neutrální ose jen S_l − P = 1,97 mm vůle na celý obvod a zasychající
useň se na něj stahuje (míra neznámá, ověřit). Proto: po 1–2 h (kůže ještě vlhká, ověřit) trn za
poutko povytáhnout o 10–20 mm a zase zasunout, aby se nepřisál; po vyschnutí vytahovat za poutko,
ústí lusku přidržet prsty u švů. Zkouší se na zkušebním lusku (13.4 #24).

### 8.7 Výrobní tolerance (kap. 23) – kde má konstrukce rezervu

Předpoklady návrhu (ne změřené hodnoty): ruční řez ±0,5 mm, tloušťka kůže v rámci kusu ±0,1 mm.

| Zdroj nepřesnosti                  | Dopad                                                                                            | Rezerva v konstrukci                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Tloušťka kůže** (t ± 0,1)        | ohyb ± π/2 · 0,1 = ±0,16 mm; lusk zvenku ± 0,2; čočka ± 0,11                                     | ohyb rozdílu nevadí (karetní zóna má 1,5 mm přebytek v B); vše přepočítatelné z t (oddíl 14)                      |
| **Ruční řez a poloha čáry** (±0,5) | S_c, S_l ± 0,5 (šířky se řežou jako jeden kus – chyba je v poloze čar švu a lepení, ne v obrysu) | S_c: rezerva ve stavu C 1,09 mm, v B 2,61. S_l: trn projde do šířky 30,97, i při S_l = 37,5 do 30,47 ✓            |
| **Přetok lepidla** (±0,5 na okraj) | S_c, S_l −0,5 až −1,0                                                                            | maskovací páska (8.5); i bez ní S_c 62,0 ≥ 61,91 a S_l 37,0 > P 36,03 (b_max 29,97, trn 29 projde)                |
| **Poloha čáry švu**                | šev ± 0,5 posune hranici zón                                                                     | čáry švu se rýsují až na slepeném kusu od hrany (3,5 mm) a dělicí od 68,5 měřeno od levé hrany líce               |
| **Stažení stehy**                  | stěny se u švu zvlní, zóny se zúží o desetiny mm                                                 | S_l má s_ins = 2,0 na stažení, zasunutí trnu a přetok; S_c má s_c = 1,0                                           |
| **Vytahání kůže**                  | čočka se rozšíří – karty volnější                                                                | se 4 kartami vůle 4,61 mm – retence tvarem (maketa, 8.6), **ověřit** vypadávání (13.4 #14)                        |
| **Wet-forming**                    | lusk může po vyschnutí povolit nebo se zúžit                                                     | geometrii dutiny určuje trn (6,0 × 29 → 28,5), ne ruka; podložky se ladí až na vytvarovaném kusu; stálost 13.4 #9 |
| **Mezera prahu h**                 | tady by rozhodovalo ±0,1 mm                                                                      | **proto se h nenavrhuje, ale kalibruje** na hotovém lusku (kombinace podložek, broušení); podložky jdou vyměnit   |
| **Poloha podložek** (± 0,5)        | posun prahu vůči minci                                                                           | mince končí 1,5 mm pod podložkou, průzor 4 mm pod ní                                                              |
| **Konec lepení u dna**             | roh se vlní, pokud je přechod 6 mm → 0 moc strmý                                                 | lze posunout na u = 8 bez změny ostatního (otvory pak od u ≥ 9)                                                   |

**Nic v konstrukci nefunguje jen při ±0,1 mm** – jediné takové místo (h) se ladí vyměnitelnými díly.

---

## 9. Fáze 7 – Simulace použití

Tloušťky: kůže t = 1,2; karta 0,76; bankovky 2,0 (neověřeno); mince 50 Kč 2,5 (neověřeno); dutina
lusku c = 6,0; podložky p₁, p₂ (příklad 2,4 a 2,4 → h = 1,2).

### Tabulka vrstev

| Místo                     | Stav A (prázdná)                                                                               | Stav B (4 karty, bankovky, 3 mince)      | Stav C (6 karet, bankovky, 6 mincí)   |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| levý okraj x 0–4,5        | 1,2 + 1,2 = **2,4**                                                                            | 2,4                                      | 2,4                                   |
| karetní zóna x 4,5–67,5   | 1,2 + (0 až 5,04) + 1,2 = **2,4–7,44** (podle toho, jak moc si stěny pamatují maketu – ověřit) | 1,2 + 3,04 + 2,0 + 1,2 = **7,44**        | 1,2 + 4,56 + 2,0 + 1,2 = **8,96**     |
| dno karetní zóny (ohyb)   | vnitřní mezera ≈ 5,04 (maketa) → ≈ 7,4                                                         | 7,44                                     | obsah rozevře ohyb na 6,56 → **8,96** |
| dělicí pruh x 67,5–69,5   | 2,4                                                                                            | 2,4                                      | 2,4                                   |
| lusk x 69,5–107,5         | 1,2 + 6,0 + 1,2 = **8,4**                                                                      | 8,4 (mince 2,5 v jedné vrstvě, vůle 3,5) | 8,4 (2 × 2,5 = 5,0, vůle 1,0)         |
| ústí lusku u podložek     | 1,2 + p₁ + h + p₂ + 1,2 = 8,4 (6 kožených kusů v řezu, ale jen 2 stěny; žádný šev ani hrana)   | 8,4                                      | 8,4                                   |
| lusk v místě průzorů      | 2 stěny s otvorem, vnější tvar 8,4                                                             | 8,4                                      | 8,4                                   |
| dno lusku (ohyb)          | vnitřní poloměr 3,0 → 8,4                                                                      | 8,4                                      | 8,4                                   |
| pravý okraj x 107,5–112,0 | 2,4                                                                                            | 2,4                                      | 2,4                                   |
| **maximum**               | **8,4**                                                                                        | **8,4**                                  | **8,96**                              |
| šířka nahoře / u dna      | ≈ 109,5 / 112,0                                                                                | ≈ 107,4 / 112,0                          | ≈ 106,1 / 112,0                       |

Nejvíc vrstev kůže ve švu nebo na hraně: **2 (2,4 mm)** všude.

### Stav A – prázdná

- **Drží tvar?** Lusk ano, pokud obstojí zkouška 13.4 #9 (vytvarovaný na trnu). Karetní zóna je
  plochá kapsa; dno je zafixované na maketě 5,04, takže u dna zůstane mírně rozevřená smyčka – ne
  „kapka“, protože přídavek odpovídá obsahu, který se nosí.
- **Volné části?** Pruh 65,0–67,5 nad u = 88 (dvě volné vrstvy 2,5 mm × max 6 mm) – je to vodítko,
  nelepí se. Jinak nic.
- **Deformace?** Otevřené konce ohybu na bocích (u < 5) jsou vidět jako průřez trubky dna – to je
  přiznaný detail, ne vada. Mince ani karta jimi neprojdou: otvor má výšku ≤ 5 + 3,0 = 8 mm,
  nejmenší mince ≈ 20 mm (ověřit), karta 85,6 mm. Dole je peněženka širší (112) než nahoře (≈ 109,5).

### Stav B – běžné použití

- Karty: vůle v čočce 2,61 mm, přední karta vyčnívá ve výkusu 13,6–15,6 mm → palcem ven jedním pohybem.
- Bankovky: za kartami, zadním výkusem vyčnívá 9–14 mm.
- 3 mince: leží v jedné i dvou vrstvách, pod prahem je sloupec do u = 82,5, rezerva 1,5 mm. V dutině
  mají vůli 6,0 − 2,5 = 3,5 mm a leží u přední nebo zadní stěny podle toho, jak je peněženka
  natočená. Palec přes jeden průzor by na minci u zadní stěny musel zajet 1,2 + 3,5 = 4,7 mm hluboko,
  což bříško palce štěrbinou 12 mm neudělá (reálně 1–2 mm, ověřit) – proto **průzor na obou stěnách**:
  mince se sevře palcem a ukazováčkem z obou stran.
- Výdej bez převracení (7.6): 50 Kč se posune o až 23,5 mm a z ústí vyčnívá ≈ 13,5 mm minus kontakt
  palce, pak se vytáhne prsty.
- Tloušťka 8,4 mm dává lusk; karetní zóna 7,44 je tenčí.

### Stav C – maximum

- **Deformace/napětí:** čočka karetní zóny má rezervu 1,09 mm nad nejkratší možnou stěnu (8.2) –
  stěny jsou napjaté a karty drží pevněji, šestá karta půjde první týdny ztuha. Ohyb dna karetní zóny
  se rozevře z 5,04 na 6,56, na to chybí 0,88 mm délky → horní hrana karetní zóny klesne o 0,44 mm
  (karta stále 1,96 mm pod hranou). **Ověřit na prototypu**, jestli se 6 karet + bankovky vejdou bez
  násilí (13.4 #15).
- **Šířka u dna:** pásmo ohybu zůstává 112 mm, karetní zóna nahoře má projekci jen 59,6 místo 63,0 –
  rozdíl 3,4 mm (s luskem 3,4 + 2,5 = 5,9 mm) se musí zvlnit ve výšce 0–5 mm nad ohybem u nelepených
  konců švů. **Riziko „uší“ nebo zvlnění v rozích dna karetní zóny** – ověřit a vyfotit (13.4 #18).
- **Tloušťka:** 8,96 mm (karetní zóna), lusk 8,4 – mince tloušťku nezvětšují.
- **Přístup:** výkus funguje stejně; zadní výkus stejně.
- **Bezpečnost obsahu:** 6 mincí 50 Kč = 2 řady × 82,5 mm pod prahem ✓; sedmá zůstane v ústí nad
  prahem – je vidět a cítit. Ve stavu C leží u prahu často mince ze zadní vrstvy – sevře se přes
  zadní průzor. Karty: napjatá čočka. Bankovky: za kartami, přitlačené.
- Nejistá místa jsou v 13.4; návrh v žádném stavu nestojí na přesnosti pod výrobní tolerancí.

---

## 10. Fáze 8 – Prototype review (kap. 25)

| Otázka                                            | Odpověď                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dá se skutečně vyrobit ručně?**                 | Ano. Řezání nožem a výsečníky 8/12, lepení tří pruhů přes maskovací pásku, děrování vidličkami skrz 2,4 mm (vidličky 4 mm prorazí 2 × 1,2 samy – `notes-vybaveni.md`), sedlářský steh, tvarování na trnu z překližky se svěrkami. Žádný lis, vykružovák ani forma s dutinou. Nejtěžší kroky: tvarování lusku, vytažení trnu a rohy dna.                                 |
| **Potřebujeme všechny díly?**                     | D1 ano. D2 (podložky) jsou jediný díl navíc a nesou celou retenci mincí; bez nich by lusk byl K7 „Kolej“ (drží jen tření).                                                                                                                                                                                                                                              |
| **Potřebujeme všechny švy?**                      | Levý a pravý uzavírají boky, dělicí odděluje mince od karet a zároveň je jednou stěnou lusku. Šev dna nahradil ohyb. Žádný šev není ozdobný.                                                                                                                                                                                                                            |
| **Nemůže něco vypadnout?**                        | Mince: práh h < t_min (kalibrace); průzory 12 mm < nejmenší mince; boční otvory u dna ≤ 8 mm. Karty: 2,0–2,4 mm pod hranou + tření; **se 4 kartami bez bankovek nejisté – ověřit dnem vzhůru (13.4 #14).** Při výdeji mince se peněženka neotáčí (7.6), vypadávání při placení zkouší 13.4 #20. Bankovky: za kartami, přitlačené čočkou; samostatně (bez karet) ověřit. |
| **Nepřekrývá se někde příliš mnoho vrstev?**      | Ne. Švy a hrany max 2 × 1,2 = 2,4 mm. V ústí lusku je v řezu 6 kusů kůže (stěna, 2 podložky, 2 podložky, stěna), ale mimo šev a hranu a celková tloušťka tam je stejných 8,4 mm.                                                                                                                                                                                        |
| **Dá se pohodlně vytáhnout jedna karta?**         | Přední ano – výkus 30 × 18, vyčnívá 13,6–15,6 mm. Karty za ní se vytahují až po přední (nebo celým svazkem a zpět); pořadí je na uživateli.                                                                                                                                                                                                                             |
| **Dá se pohodlně vytáhnout jedna mince?**         | Ano, ta u prahu, ale **dvěma pohyby**: sevřít přes oba průzory a posunout (50 Kč vyčnívá ≈ 13,5 mm minus kontakt palce), pak vytáhnout prsty. U nejmenší mince vyčnívá jen ≈ 6 mm – ověřit (13.4 #21). Konkrétní nominál ze sloupce ne.                                                                                                                                 |
| **Jdou bankovky vložit bez boje?**                | Kratší bankovky na třetiny (≤ 53,98 × 74) ano, šířka pod šířkou karty. Nejdelší (délka blízko horní meze rozsahu ČNB 170 mm, který nominál to je – ověřit) na čtvrtiny. Ve stavu C je čočka napjatá – vložení bankovky za 6 karet ověřit.                                                                                                                               |
| **Bude produkt fungovat i po vytahání kůže?**     | Lusk: tvar drží trnem vytvarovaná kůže – **dokud to nepotvrdí 13.4 #9, je to předpoklad**. Tlak v kapse h zmenšuje, opakované protlačování mincí ho zvětšuje (13.4 #22). Práh: vyměnitelné podložky. Karetní zóna: stav C s rezervou 1,09 mm; se 4 kartami je volnější – retence tvarem na maketě.                                                                      |
| **Existuje jednodušší řešení stejného problému?** | Jednodušší jsou K7 (bez prahu, jen tření – vypadává) a C (jazyk – dva kroky, vysypání). Jednodušší varianta Lusku by vynechala tvarování a nechala lusk jako plochou čočku 38 mm s podložkami – ale pak mezera u prahu není definovaná tvarem (poučení 3 z fáze 2). Proto ne. Hardware není žádný.                                                                      |

---

## 11. Výrobní postup (kap. 29, pořadí pro tuto konstrukci)

**Zásada děrování:** díl se ohýbá ve dně, přední a zadní stěna jsou po přeložení zrcadlové. Šikmé
otvory vidliček proseknuté na každé stěně zvlášť ze stejné strany by se po složení **zkřížily** (chyba
z pouzdra s mincí). Proto se **neděruje naplocho před přeložením**, ale **až po slepení pruhů, skrz
obě vrstvy najednou, z líce přední stěny** – jeden úder udělá souhlasný otvor v obou vrstvách a zrcadlení
nehraje roli.

0. **Měření:** posuvkou tloušťka a průměr všech nošených mincí, tloušťka kůže na více místech,
   tloušťka překližky na trn, tloušťka svazku bankovek. Zapsat (tabulka v 13.4) a přepočítat
   parametry (oddíl 14, `pnpm pattern:wallet`).
1. **Zkušební lusk** (13.2, list 3 střihu) – před celým kusem. Podle něj případně upravit S_l, konec
   lepení a h.
2. **Přípravky:** trn T1 29 → 28,5 × 6 × 122 mm (hrany R1, konec R3, fólie, poutko), maketa karetní
   zóny (5,04 mm ve fólii), 2 přítlačné desky.
3. **Tisk střihu** (`docs/generated/penezenka-vse.pdf`) na 100 %, zkontrolovat kontrolní úsečku
   50 mm na každém listu.
4. **Obkreslit na líc** (hladkou stranu) podle listu 1 a vyříznout obdélník 112,0 × 199,3. Hned
   napsat tužkou na rub „L“ k hraně na straně lusku.
5. **Otvory výsečníky** (dřív než rovné řezy, které k nim vedou): schod Ø 12 se středem (59,0; 94)
   na obou stěnách, konce průzorů Ø 12 v (88,5; 36) a (88,5; 74) **na obou stěnách**. Na HDPE desce.
6. **Řezy nožem:** horní hrany u = 88 k výsečníku schodu, průzory (dvě rovné čáry mezi kruhy),
   výkus na palec (přední), výkus na bankovky (zadní), rohy R4, rohy výkusů R2.
7. **Značení:** konce pásma ohybu na bocích (u = 0 obou stěn) tužkou na rub podle značek vně obrysu;
   okraje lepených pruhů **na rubu podle listu 2** (x_rub = W − x, dělicí pruh 42,5–44,5 od hrany L);
   místo značky na líci. **Středy podložek nepropichovat** (díra by byla vidět na líci u ústí) –
   podložky se zaměří až zevnitř (krok 16). Čáry švu se zatím **nerýsují** (budou na slepeném kusu).
8. **Předběžné dokončení jednovrstvých hran:** horní hrany, schod, ústí lusku, oba výkusy, oba
   průzory, boky v pásmu ohybu a spodních 5 mm boků a pruh vodítka – bevel líce, smirek, Tokonole,
   burnishing.
   8b. **Branding naplocho:** místo (17; 14) navlhčit a razit na tvrdé podložce, dokud je díl rovný.
9. **Zapečetit rub** v pásmu ústí lusku (x 69,5–107,5, u 80–94, vyznačeno na listu 2 střihu, S1) a v okolí průzorů, aby mince
   klouzaly; lepené pruhy a místa podložek **nezapečeťovat**. (Jestli Tokonole na rubu přežije
   pozdější navlhčení, ověřit na zkušebním lusku.)
10. **Lepidlo na rozvinutý díl:** na rubu olepit vnitřní okraje pruhů maskovací páskou, nanést
    kontaktní lepidlo na oba pruhy každé stěny (levý, dělicí, pravý; u od 5), pásku strhnout, nechat
    zavadnout.
11. **Přeložit a slepit:** do ohybu položit **kulatou distanční tyčku Ø 6 mm** (drát nebo kulatinu,
    **ne trn T1** – ten je plochý 29 × 6 mm a je na tvarování lusku až po šití, 8.6; položený napříč
    by svou šířkou 29 mm stál nastojato podél stěn skoro až k u = 26, lepené pruhy od u = 5 by se
    pod ním nedotkly a spodní otvory by se prosekávaly přes něj – B1, oddíl 15). Kulatá tyčka Ø 6 mm
    sedí přesně ve vnitřním poloměru ohybu R_i = 3,0 mm a čouhá nad plochu jen ≈ 3 mm, pod začátek
    lepení (u_g = 5). Mezi lepené pruhy vložit papírový separační list, zarovnat boky a horní hrany
    obou stěn a list postupně vytahovat od ohybu nahoru, pruh po pruhu přitlačit. Kontaktní lepidlo
    po dotyku nejde posunout – přeložení šikmo o 1° posune dělicí pruh na 94 mm výšky o
    94 · tan 1° ≈ 1,6 mm, proto zarovnávat před každým dotykem. Přitlačit po celé délce. **Tyčku
    nechat v ohybu** (drží dno rovné i při děrování).
12. **Rýsovat čáry švu** na líci přední stěny: x = 3,5 a 108,5 (3,5 od hran), x = 68,5 od levé hrany
    líce; horní otvory u = 84,5 (levý) a 90,5 (dělicí, pravý).
13. **Děrovat** vidličkami 4 mm **z líce přední stěny, skrz obě vrstvy, na HDPE desce**, kolmo; začít
    horním otvorem a jít dolů; nejnižší otvor ≥ u = 6 (levý 8,5; ostatní 6,5). Pod nejspodnější
    otvory podložit tak, aby slepený pruh ležel rovně. Pak **vyjmout distanční tyčku z ohybu**.
14. **Šít** sedlářským stehem, každý šev od horního konce: 2 zpětné stehy nahoře, dolů, 2 zpětné stehy
    dole, zapošít.
15. **Wet-forming:** navlhčit houbičkou lusk a pásmo ohybu (nemáčet; švy co nejméně; místo značky
    chránit suchým hadříkem), počkat, až začne světlat; zasunout trn ústím až na dno lusku, maketu do
    karetní zóny; rozhrnovačkou uhladit stěny lusku k trnu a podél švů, **přes okraje průzorů
    neuhlazovat**, jen stěny mimo štěrbinu; lehce sevřít mezi deskami. Po 1–2 h trn za poutko
    povytáhnout o 10–20 mm a zasunout zpět (8.6). Sušit přes noc. Vytáhnout trn za poutko (ústí
    přidržet u švů) a maketu.
    15b. **Oprava hran po tvarování:** po vyschnutí přeleštit hrany ústí lusku, schodu a obou průzorů
    (smirek podle potřeby, Tokonole, burnishing).
16. **Kalibrace prahu:** podložky Ø 8 (1,0/1,2 mm) zaměřit zevnitř – střed na ose průzoru x = 88,5,
    6 mm pod hranou ústí; přední přichytit dočasně oboustrannou páskou pinzetou přes ústí, zadní
    přiložit proti přední sevřením ústí. Zkoušet 50 Kč palcem, nejtenčí minci třesením (13.4); upravit
    kombinaci. Pak nalepit kontaktním lepidlem, okraje zaoblit smirkem.
17. **Hrany boků** (2 vrstvy, u ≥ 5): zarovnat broušením na destičce, bevel obou líců, smirek,
    burnishing s Tokonole.
18. **Finální úprava (volitelná):** použít úpravu, na kterou jsi zvyklý, **nejdřív na zkušebním
    lusku**. Ověřit, že nezměkčí tvar lusku (znovu změřit dutinu) a nezmění průchod mince přes práh.
    Konkrétní přípravek tu není – `notes-vybaveni.md` žádný neuvádí.
19. **Kontrola** podle 13.4 (stav A/B/C).

---

## 12. Nástroje a materiál

Jen z kap. 4 briefu a z `notes-vybaveni.md` / `pouzdro-mince-forma.md`. Ceny se tu neuvádějí;
ověřené příklady s datem jsou v `notes-vybaveni.md`.

**Nástroje (kap. 4):**

- ostrý nůž na kůži, kovové pravítko, šídlo (rýsovací)
- děrovací vidličky 4 mm (sada 1 + 2 + 4 + 6 hrotů), palička (gumová nebo nylonová), deska pod
  děrování z HDPE (ne do řezací podložky – `notes-vybaveni.md`)
- dvě sedlářské jehly (John James 004 pro nit 0,6), voskovaná nit 0,6 mm
- lepidlo na kůži (kontaktní; vodní báze jako první volba dle `notes-vybaveni.md`), případně
  oboustranná páska 5 mm na dočasné přichycení podložek
- edge beveler, smirkový papír 180–400 na rovné destičce, burnisher (leštítko), Tokonole
- kruhové výsečníky **8** (podložky) a **12** (konce průzorů, schod) – obojí v sadě OBI 6/8/10/12/15
- svěrky 2–4, jednoduché dřevěné přípravky (trn, přítlačné desky)
- volitelně kostěná rozhrnovačka (bone folder) na uhlazení lusku k trnu

**Mimo seznam kap. 4, ale nutné:** posuvné měřítko na mince, kůži a překližku (bez něj se práh nedá
spočítat). Pinzeta, houbička, potravinová fólie, papírová maskovací páska, kancelářský papír jako
separační list, **kulatá distanční tyčka Ø 6 mm** (drát nebo kulatina, délka ≥ 120 mm – do ohybu při
lepení a děrování, kroky 11 a 13; **ne trn T1**, B1 v oddílu 15) – z domova.

**Materiál:**

- třísločiněná lícová useň 1,2 mm, pevná: arch **A4 (210 × 297)** stačí na D1 (112,0 × 199,3),
  zkušební lusk (69 × 144,3, 13.2) i podložky – rozvržení: D1 u jedné delší hrany, zbylý pruh
  98 × 297 na zkušební lusk a podložky. Tréninkový odřezek téže usně (A5) doporučen.
- překližka 6 mm na trn (≥ 29 × 125, trn 122 + rezerva na řez), překližka ≥ 10 mm na 2 desky
  ≈ 125 × 110
- kulatá tyč nebo silný drát Ø 6 mm, délka ≥ 120 mm (distanční tyčka do ohybu, kroky 11 a 13)
- 4 staré karty a papír na maketu

---

## 13. Plán prvního fyzického prototypu (kap. 31 bod 13)

Tři stupně, každý odpovídá na jinou otázku. Po každém zapsat hodnoty a přepočítat parametry v oddílu 14.

### 13.1 Papírový model 1:1

Papír 160 g nalepený na tenkou lepenku, vystřihnout celý D1 podle listu 1 včetně výkusů a průzorů,
ohyb jen přehnout do smyčky (ne na ostro), boky a dělicí šev slepit páskou v pruzích z 8.5.

Papír **prokáže:** polohu a velikost výkusů (kolik karty a bankovky je vidět), jestli se 6 karet +
bankovky vejdou na šířku, polohu průzorů vůči prstům, polohu značky, celkové rozměry v ruce a v kapse.
**Neprokáže:** lusk, práh, ohyb dna (papír je tenčí a netvaruje se) – porotce 2.

### 13.2 Zkušební lusk z kůže (před celým kusem)

Odřezek téže usně 1,2 mm, **69 × 144,3 mm** (list 3 střihu). Šířka 3,5 + 1 + 20 + 2 + 38 + 1 + 3,5
= 69: vlevo kus karetní zóny 20 mm, aby **dělicí šev ležel uvnitř** jako na celém kusu (pruh lepení
jen 2 mm, pod ním nelepeno, z obou stran otevřené zóny a kůže bez volné hrany – nejrizikovější místo
dna, sedlová deformace). Délka pro sloupec 2 mincí: 2 · (2 · 27,5 + 1,5 + 10) + 11,31 = 144,31.
Tři švy po 15 otvorech (u 63 → 7), průzor na obou stěnách u 30–52,5 (stejný horní konec vůči hraně
jako celý kus). Stejný postup jako kroky 7–16: lepení pruhů od u = 5 (na rubu dopočtené pozice
přímo na listu 3 střihu, S3, ne jen vzorec), děrování skrz obě vrstvy, šití, tvarování na trnu
(kroky 11 a 13 ale bez trnu – jen kulatá distanční tyčka Ø 6 mm, B1), podložky.

### 13.3 První celý kus z kůže

Podle oddílu 11, s hodnotami opravenými ze 13.1 a 13.2.

### 13.4 Co změřit a zapsat, podle čeho upravit

| #   | Co                                                                                              | Jak                                                                                                                                             | Zapsat                                                                           | Podle toho upravit                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Mince                                                                                           | posuvka, každý nošený nominál                                                                                                                   | t, D                                                                             | t_min → h = t_min − 0,5…0,8 → p₁ + p₂; t_max → c = 2 · t_max + 1,0; D_max → b = D_max + 1,5, H_l; D_min → vyčnívání D_min − a_p                                                                        |
| 2   | Kůže                                                                                            | posuvka, 5 míst archu                                                                                                                           | t                                                                                | t ve všech vzorcích (F, S_c, S_l)                                                                                                                                                                      |
| 3   | Překližka trnu                                                                                  | posuvka                                                                                                                                         | skutečné c                                                                       | c = tloušťka trnu; p₁ + p₂ z nového c                                                                                                                                                                  |
| 4   | Svazek bankovek                                                                                 | posuvka, stlačený prsty                                                                                                                         | h_bank                                                                           | h_B, h_C → S_c                                                                                                                                                                                         |
| 5   | Zasunutí trnu do mokrého lusku                                                                  | zkušební lusk                                                                                                                                   | šlo / nešlo / s jakou silou                                                      | nešlo → S_l + 0,5                                                                                                                                                                                      |
| 6   | Průchod 50 Kč přes práh: výdej i **vracení dvoukrokem** (zasunout, palcem stáhnout pod práh)    | zkušební lusk                                                                                                                                   | jde / nejde; počet a tloušťka podložek                                           | nejde → h + 0,2 (tenčí podložka)                                                                                                                                                                       |
| 7   | Nejtenčí mince, 20 zatřesení hlavou dolů                                                        | zkušební lusk                                                                                                                                   | kolik vypadlo                                                                    | vypadla → h − 0,2; když nepomůže ani nejvyšší podložka → záloha K12 (tvarová zarážka)                                                                                                                  |
| 8   | Cinkání                                                                                         | zatřást se 3 mincemi                                                                                                                            | slyšet / neslyšet                                                                | výrazné → c = 5,5 (trn 5,5)                                                                                                                                                                            |
| 9   | **Tvar lusku pod zátěží a po navlhčení**                                                        | zkušební lusk se 3 mincemi zatížit definovaně (8 h na sedáku židle pod sezením, nebo závažím – hodnotu zapsat), pak navlhčit a nechat vyschnout | posuvkou dutina u ústí (u = 88) i uprostřed, před / po; pak vložit a vydat 50 Kč | kritérium: dutina u ústí ≥ c − 0,5 a 50 Kč projde palcem. Neprojde → záloha: stavěcí proužky uvnitř podél obou švů lusku (vložené do lepeného pruhu, +1 vrstva ve švu); h znovu zkalibrovat            |
| 10  | Roh dna (přechod lepení → ohyb) **u vnitřního dělicího švu** a zvlnění ve spodních rozích lusku | zkušební lusk (3 švy)                                                                                                                           | praskl / vlní se / v pořádku; foto                                               | vada → konec lepení u = 8, nejnižší otvor ≥ 9                                                                                                                                                          |
| 11  | Lepený a sešitý spoj po navlhčení a vyschnutí                                                   | zkušební lusk                                                                                                                                   | drží / odlepil se                                                                | odlepil → při tvarování švy nemáčet; jiné lepidlo                                                                                                                                                      |
| 12  | Tokonole na rubu po navlhčení                                                                   | zkušební lusk                                                                                                                                   | klouže / nelepí                                                                  | problém → zapečetit ústí až po tvarování                                                                                                                                                               |
| 13  | Stav B, 1 mince **u zadní stěny**: vydat 10× sevřením přes oba průzory                          | celý kus                                                                                                                                        | úspěšnost x/10                                                                   | < 8/10 → průzory širší nebo delší dolů (horní konec zůstává)                                                                                                                                           |
| 14  | 4 karty bez bankovek, dnem vzhůru, 20 zatřesení                                                 | celý kus                                                                                                                                        | vypadla / nevypadla                                                              | vypadla → **tenčí maketa** (3 karty + papír) a znovu tvarovat karetní zónu; S_c se nemění. Stejná volba S_c jako #15 – priorita podle kap. 6: nevypadávat má přednost, ale ne za cenu, že neprojde #15 |
| 15  | 6 karet + bankovky                                                                              | celý kus                                                                                                                                        | vejdou bez násilí / ne                                                           | ne → S_c + 0,5 (a znovu #14)                                                                                                                                                                           |
| 16  | Kolik karty je vidět ve výkusu a jestli jde palcem ven                                          | papír i kůže                                                                                                                                    | mm                                                                               | < 12 mm → výkus hlubší o rozdíl                                                                                                                                                                        |
| 17  | Kolik bankovky je vidět v zadním výkusu                                                         | papír i kůže                                                                                                                                    | mm pro 100 Kč a 1000 Kč                                                          | < 8 mm → výkus hlubší                                                                                                                                                                                  |
| 18  | Hotové rozměry A / B / C                                                                        | pravítko, posuvka                                                                                                                               | šířka **u dna i nahoře**, výška, tloušťka; **foto rohů dna ve stavu C**          | srovnat s 8.1 a kap. 9; „uši“ v rozích → konec lepení u = 8                                                                                                                                            |
| 19  | Spotřeba nitě na jeden šev                                                                      | zkušební lusk                                                                                                                                   | m                                                                                | opravit 8.4                                                                                                                                                                                            |
| 20  | Výdej mincí s plnou peněženkou                                                                  | celý kus: 4 karty + 1 bankovka, vydat 3 mince přesně podle 7.6                                                                                  | kolik karet a bankovek vypadlo                                                   | vypadávají → retence karetní zóny tenčí maketou (#14), ne změnou postupu výdeje                                                                                                                        |
| 21  | Vyčnívání mince po posunu                                                                       | celý kus                                                                                                                                        | mm pro 50 Kč a nejmenší minci; jde uchopit jednou rukou?                         | nejmenší < 5 mm a nejde chytit → varianta D_w 6, a_w 5, a_p 12 (8.2)                                                                                                                                   |
| 22  | Dotvarování ústí                                                                                | zkušební lusk: 200 průchodů 50 Kč přes práh                                                                                                     | h před / po; pak znovu #7                                                        | h vzroste o ≥ 0,2 → pravidelně přidávat podložky, napsat do návodu                                                                                                                                     |
| 23  | Únava podložek                                                                                  | zkušební lusk: 100 vložení a 100 výdejů 50 Kč                                                                                                   | drží / odlupuje se; změna h                                                      | odlupují se → jedna silnější podložka místo dvou; zvážit Ø 10 a průzor u 29–79 (a_p ≥ a_w + 5 + 4 = 15)                                                                                                |
| 24  | Vytažení trnu po vyschnutí                                                                      | zkušební lusk                                                                                                                                   | šlo / nešlo / poškodilo ústí nebo šev                                            | nešlo nebo poškodilo → S_l + 0,5 (s_ins = 2,5)                                                                                                                                                         |

---

## 14. Parametry pro generátor střihu

Všechny rozměry D1, D2, T1 a zkušebního lusku jde spočítat z této tabulky. Délky v mm. „Vstup“ =
měřená nebo převzatá hodnota, „návrh“ = zvolená konstanta, „odvozeno“ = vzorec. Kód:
`src/lib/geometry/minimal-wallet.ts` (výchozí hodnoty = tato tabulka, kontroly s českými hláškami).

### 14.1 Vstupy

| Parametr                       | Značka    | Hodnota | Typ   | Zdroj / poznámka                |
| ------------------------------ | --------- | ------- | ----- | ------------------------------- |
| šířka karty                    | w_k       | 53,98   | vstup | ISO karta                       |
| výška karty                    | h_k       | 85,60   | vstup |                                 |
| tloušťka karty                 | t_k       | 0,76    | vstup |                                 |
| karty stav B / C               | n_B / n_C | 4 / 6   | vstup | brief kap. 24                   |
| rezerva bankovky               | t_bn      | 2,0     | vstup | **ověřit** (převzato z pouzdra) |
| výška bankovky                 | h_bn      | 69–74   | vstup | ČNB                             |
| tloušťka kůže                  | t         | 1,2     | vstup | **změřit**                      |
| průměr největší mince          | D_max     | 27,5    | vstup | 50 Kč                           |
| průměr nejmenší mince          | D_min     | ≈ 20    | vstup | **ověřit**                      |
| tloušťka nejtlustší mince      | t_max     | 2,5     | vstup | **ověřit**                      |
| tloušťka nejtenčí nošené mince | t_min     | ?       | vstup | **změřit**; jen pro D2          |
| počet vrstev mincí             | n_v       | 2       | návrh |                                 |
| mincí v řadě                   | n_r       | 3       | návrh |                                 |

### 14.2 Návrhové konstanty

| Parametr                                     | Značka           | Hodnota                                                                                   | Důvod                                                                    |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| svislá vůle dutiny                           | v_c              | 1,0                                                                                       | 2 vrstvy mincí nesmí drhnout                                             |
| boční vůle lusku                             | v_b              | 1,5                                                                                       | mince 27,5 v šířce 29                                                    |
| zúžení trnu ke dnu                           | –                | 0,5                                                                                       | vytažení po vyschnutí (8.6)                                              |
| poloměr hran trnu                            | r                | 1,0                                                                                       | smirkem                                                                  |
| rezerva na zasunutí trnu                     | s_ins            | **2,0**                                                                                   | zasunutí, stažení stehy, přetok lepidla                                  |
| rezerva karetní zóny nad stav C              | s_c              | **1,0**                                                                                   | ±0,5 řez a čára, stažení stehy                                           |
| přetok lepidla na okraj (kontrola)           | –                | 0,5                                                                                       | 8.7                                                                      |
| vzdálenost švu od hrany                      | e                | 3,5                                                                                       | brief kap. 13 (3–4)                                                      |
| přesah lepení za čáru švu                    | g                | 1,0                                                                                       | otvory skrz slepené                                                      |
| rozteč stehů                                 | p_s              | 4,0                                                                                       | sada vidliček 4 mm                                                       |
| průměr podložky                              | D_w              | 8                                                                                         | výsečník 8                                                               |
| střed podložky pod hranou lusku              | a_w              | 6                                                                                         |                                                                          |
| vůle mince pod podložkou                     | k_w              | 1,5                                                                                       | ±0,5 poloha podložky + řez                                               |
| rezerva h pod t_min                          | δ                | 0,5–0,8                                                                                   | kalibrace                                                                |
| schod lusku nad kartami                      | Δ                | 6                                                                                         | hmat, vodítko                                                            |
| min. karta pod hranou (kontrola ve stavu C)  | m_k              | 1,9                                                                                       | ve stavu C 1,96                                                          |
| poloměr schodu (vydutý)                      | R_s              | 6                                                                                         | výsečník 12                                                              |
| poloměr vnějších rohů                        | R_o              | 4                                                                                         |                                                                          |
| konec lepení / min. nejnižší otvor nad u = 0 | u_g / u_h        | 5 / 6                                                                                     | ověřit (13.4 #10)                                                        |
| průzor (obě stěny) šířka / délka / od hrany  | w_p / l_p / a_p  | **12** / 50 / 14                                                                          | a_p ≥ a_w + D_w/2 + 4 = 14; w_p < D_min                                  |
| min. vyčnívání 50 Kč po posunu (kontrola)    | –                | 8                                                                                         | D_max − a_p = 13,5                                                       |
| výkus na palec šířka / hloubka               | w_v1 / d_v1      | 30 / 18                                                                                   | dno R = w/2                                                              |
| výkus na bankovky šířka / hloubka            | w_v2 / d_v2      | **20** / 28                                                                               | dno R = w/2                                                              |
| zaoblení rohů výkusů                         | R_v              | 2                                                                                         |                                                                          |
| značka střed / max. rozměr                   | (x_m, u_m) / s_m | (17; 14) / 10                                                                             |                                                                          |
| zaokrouhlení S_c / S_l                       |                  | 0,5 nahoru / 0,5 nejbližší                                                                | S_c nahoru, aby rezerva nikdy neklesla pod s_c                           |
| kontrolní úsečka / text tisku                |                  | 50 mm / „PRINT AT 100% / ACTUAL SIZE“, „Tisk na 100 %“, „měřítko 1:1“                     | kap. 28, na každém listu (vrstva GUIDE)                                  |
| zarovnávací značky                           |                  | čárky 3 mm vně obrysu na x = 0 a x = W v u = 0 obou stěn; nad horními hranami v x_k a x_p | kap. 26, vrstva GUIDE; tužkou na rub, **nezařezávat** do viditelné hrany |
| šířka kusu karet ve zkušebním lusku          | S_test           | 20                                                                                        | dělicí šev uvnitř (13.2)                                                 |

### 14.3 Odvozené hodnoty

| Parametr                                      | Značka          | Vzorec                                                                      | Hodnota                                  |
| --------------------------------------------- | --------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| obsah karetní zóny: 4 karty / B / C           | h_4 / h_B / h_C | n_B · t_k / n_B · t_k + t_bn / n_C · t_k + t_bn                             | 3,04 / 5,04 / 6,56                       |
| korekce neutrální osy čočky                   | κ′              | π · t − 2t                                                                  | 1,37                                     |
| nejkratší stěna ve stavu C                    | S_min,C         | w_k + h_C + κ′                                                              | 61,91                                    |
| volná šířka karetní zóny                      | S_c             | round₀,₅↑(S_min,C + s_c)                                                    | 63,0 (z 62,91)                           |
| rezervy C / B / 4 karty                       |                 | S_c − S_min                                                                 | 1,09 / 2,61 / 4,61                       |
| dutina lusku (= tloušťka trnu)                | c               | n_v · t_max + v_c                                                           | 6,0                                      |
| šířka trnu u ústí / u konce                   | b / b_e         | D_max + v_b / b − 0,5                                                       | 29,0 / 28,5                              |
| polovina obvodu trnu po neutrální ose         | P               | (b − 2r) + (c − 2r) + π · (r + t/2)                                         | 36,03                                    |
| volná šířka lusku                             | S_l             | round₀,₅(P + s_ins)                                                         | 38,0                                     |
| nejširší trn bez šikmých přechodů             | b_max           | b + S_l − P                                                                 | 30,97                                    |
| přídavek ohybu dna                            | F               | π/2 · (c + t)                                                               | 11,31                                    |
| neutrální / vnitřní poloměr ohybu             | R_n / R_i       | (c + t)/2 / R_n − t/2                                                       | 3,6 / 3,0                                |
| Ø distanční tyčky do ohybu (kroky 11, 13; B1) | –               | 2 · R_i; kontrola: polovina < u_g, jinak by čněla do lepení                 | 6,0 (3,0 < u_g = 5 ✓)                    |
| výška lusku                                   | H_l             | n_r · D_max + k_w + a_w + D_w/2                                             | 94,0                                     |
| výška karetní zóny                            | H_c             | H_l − Δ; kontrola ve stavu C H_c − h_k − (π/2 · (h_C + t) − F)/2 ≥ m_k      | 88,0 (1,96 ≥ 1,9 ✓)                      |
| délka dílu                                    | L               | 2 · H_l + F                                                                 | 199,31                                   |
| délka trnu                                    |                 | H_l + R_i + 25                                                              | 122 (hloubka 97)                         |
| čára levého švu                               | x_L             | e                                                                           | 3,5                                      |
| karetní zóna                                  | [x₁, x₂]        | [e + g, e + g + S_c]                                                        | [4,5; 67,5]                              |
| čára dělicího švu                             | x_D             | x₂ + g                                                                      | 68,5                                     |
| lusk                                          | [x₃, x₄]        | [x_D + g, x_D + g + S_l]                                                    | [69,5; 107,5]                            |
| čára pravého švu                              | x_R             | x₄ + g                                                                      | 108,5                                    |
| šířka dílu                                    | W               | x_R + e                                                                     | 112,0                                    |
| střed karetní zóny                            | x_k             | (x₁ + x₂)/2                                                                 | 36,0                                     |
| střed lusku                                   | x_p             | (x₃ + x₄)/2                                                                 | 88,5                                     |
| střed schodu                                  | (x_s, u_s)      | (x_D − e − R_s, H_l)                                                        | (59,0; 94)                               |
| středy podložek                               | (x_p, u_w)      | u_w = H_l − a_w                                                             | (88,5; 88)                               |
| průzor, středy konců                          | u_p1, u_p2      | u_p2 − (l_p − w_p), H_l − a_p − w_p/2                                       | 36, 74 (průzor u 30–80)                  |
| vyčnívání mince po posunu                     |                 | (u_p2 + w_p/2) − (u_w − D_w/2 − D) − (H_l − (u_w − D_w/2)) = D − a_p        | 13,5 (D_max ≥ 8 ✓) / 6,0 (D_min, ověřit) |
| dotažení mince pod práh                       |                 | H_l − (u_w − D_w/2)                                                         | 10                                       |
| výkus na palec, střed dna / dno               | u               | H_c − d_v1 + w_v1/2 / H_c − d_v1                                            | 85 / 70                                  |
| výkus na bankovky, střed dna / dno            | u               | H_c − d_v2 + w_v2/2 / H_c − d_v2                                            | 70 / 60                                  |
| vyčnívání karty / bankovky                    |                 | h_k − dno výkusu (− 2,0 v oblouku) / h_bn − dno                             | 13,6–15,6 / 9–14                         |
| horní otvor levého švu                        | u_L0            | H_c − e                                                                     | 84,5                                     |
| horní otvor dělicího a pravého                | u_D0            | H_l − e                                                                     | 90,5                                     |
| počet otvorů švu                              | n               | ⌊(u₀ − u_h)/p_s⌋ + 1                                                        | 20 / 22 / 22                             |
| nejnižší otvor                                | u_n             | u₀ − (n − 1) · p_s                                                          | 8,5 / 6,5 / 6,5                          |
| lepené pruhy (líc)                            |                 | [0; x_L + g], [x_D − g; x_D + g], [x_R − g; W]; u od u_g do horní hrany     | 0–4,5 · 67,5–69,5 · 107,5–112            |
| lepené pruhy (rub)                            |                 | x_rub = W − x                                                               | 107,5–112 · 42,5–44,5 · 0–4,5            |
| mezera prahu                                  | h               | t_min − δ                                                                   | ? (po měření)                            |
| podložky celkem                               | p₁ + p₂         | c − h, z kombinací 1,0/1,2                                                  | ?                                        |
| tloušťka lusku zvenku                         | T_l             | c + 2t                                                                      | 8,4                                      |
| tloušťka B / C                                | T_B / T_C       | 2t + h_B / 2t + h_C                                                         | 7,44 / 8,96                              |
| projekce lusku                                |                 | b + 2 · (t/2 + √(((S_l − (b − 2r + π · (r + t/2)))/2)² − (c/2 − r − t/2)²)) | 35,5                                     |
| šířka u dna / nahoře A, B, C                  |                 | W / odhad 8.1                                                               | 112,0 / 109,5; 107,4; 106,1              |
| hotová výška                                  | H               | H_l + R_i + t                                                               | 98,2                                     |
| zkušební lusk                                 |                 | šířka 2e + 4g + S_test + S_l; délka 2 · (2 · D_max + k_w + a_w + D_w/2) + F | 69 × 144,3                               |

**Souřadnice pro kreslení:** x od levé hrany líce; y na rozvinutém dílu od osy ohybu, přední stěna
y = F/2 + u (horní hrana lusku y = 99,66), zadní stěna y = −(F/2 + u). Obě stěny mají stejné x
(ohyb zrcadlí jen y); pohled na rub má x_rub = W − x. Vrstvy SVG podle kap. 27:

- **CUT:** jen řezná geometrie, žádný text (N6): obrys, výkusy, oba průzory, schod; na listu 3 obrys
  zkušebního lusku, trnu a podložek,
- **STITCH:** čáry a otvory tří švů jen na přední stěně s poznámkou „otvory přenést až na slepený kus
  z líce přední stěny (krok 12)“ – děruje se skrz obě,
- **FOLD:** konce ohybu u = 0 obou stěn a osa ohybu,
- **GLUE:** na listu 1 obrys pruhů, na listu 2 (**pohled RUB**, x zrcadlené) šrafované pruhy
  s hranami maskovací pásky a rozměry dělicího pruhu od hrany L; ořezáno obrysem dílu, aby krajní
  pruhy nepřekreslovaly zaoblené rohy R4 (N4),
- **GUIDE:** kružnice výsečníků, středy podložek (nepropichovat), osy zón, značka, obrys trnu
  29 → 28,5 od u = −R_i do u = H_l, zarovnávací značky, kóty, texty, kontrolní úsečka 50 mm, popisky
  legendy vrstev (N6); na listu 2 navíc pásmo zapečetění rubu v ústí lusku x 69,5–107,5, u 80–94
  (S1, krok 9) a stejné zarovnávací značky jako na listu 1 (N5).

### 14.4 Vygenerované soubory

`pnpm pattern:wallet` (skript `scripts/minimal-wallet.ts`, PDF přes Playwright a Chrome) zapíše do
`docs/generated/`:

| Soubor                         | Obsah                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `penezenka-sablona.svg/.pdf`   | list 1, A4 na výšku: D1 z líce 112 × 199,31 – obrys, výřezy, švy s 64 otvory, ohyb, značky, rozměry |
| `penezenka-rub.svg/.pdf`       | list 2: D1 z rubu (x_rub = W − x) – lepené pruhy, maskovací páska, značka „L“                       |
| `penezenka-pripravky.svg/.pdf` | list 3: zkušební lusk ZL 69 × 144,31, trn T1 (půdorys a bok), 6 podložek D2                         |
| `penezenka-vse.pdf`            | všechny tři listy                                                                                   |

Jiná změřená tloušťka kůže: `pnpm pattern:wallet --thickness 1.3` (soubory `penezenka-kuze-1-3mm-*`).
Golden test (`scripts/generator-golden.test.ts`) hlídá, že zapsané SVG odpovídají kódu; virtuální
složení (`scripts/minimal-wallet.test.ts`) ověřuje, že se průzory, rohy, schod a podložky obou stěn
po přeložení kryjí a že lepení z rubu kryje všechny otvory.

---

## 15. Změny po kontrole

Dvě nezávislé kontroly (2026-09-28) našly vady verze 1. U každého nálezu je, co se změnilo.
Z = závažný (serious), D = drobný (minor).

### Kontrola 1

| #         | Nález                                                                                                                  | Co se změnilo                                                                                                                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1-1 (Z)  | Palec přes jeden průzor nedosáhne na minci u zadní stěny (vůle 3,5 mm); „jednou rukou“ stojí na neověřeném předpokladu | **Průzor na obou stěnách** jako výchozí stav (7.2 #5, 7.8, 8.2 Výřezy), šířka **12 mm** (výsečník Ø 12), u 30–80 beze změny (u_p2 = 94 − 14 − 6 = 74); text výdeje „palcem a ukazováčkem, druhá ruka vytáhne“ (7.6, 7.7); zkouška 13.4 #13: stav B, mince u zadní stěny, 10 výdejů |
| K1-2 (Z)  | Výdej hlavou dolů obrací i karty a bankovky                                                                            | Výdej **bez převracení**, sevřením přes oba průzory (7.6 bod 2, 7.7); zkouška 13.4 #20 (4 karty + 1 bankovka, 3 mince); vypadávání se řeší maketou, ne postupem                                                                                                                    |
| K1-3 (Z)  | S_c = 62,5 má ve stavu C rezervu 0,08 mm < tolerance; #14 a #15 si odporují                                            | S_c přepočteno se správným κ′ (K2-5) a rezervou s_c = 1,0: **S_c = 63,0**, rezerva C 1,09 mm. (Kontrola navrhovala 63,5 se starým κ; se správným κ′ dává 63,0 stejnou rezervu ≥ 1,0 a je o 0,5 mm těsnější pro 4 karty.) Retence 4 karet tvarem – tenčí maketa (13.4 #14)          |
| K1-4 (Z)  | Značení na rubu bez zrcadlení → dělicí lepení doprostřed karetní zóny; propíchnuté středy podložek viditelné na líci   | Pohled **RUB** s x_rub = W − x (8.5, list 2 střihu); dělicí pruh na rubu **42,5–44,5 od hrany L**; „L“ na rub hned po vyříznutí (krok 4); středy podložek **nepropichovat**, zaměřit zevnitř podle průzoru (krok 7, 16, D2)                                                        |
| K1-5 (Z)  | Trn má ≈ 1 mm vůle, vytažení po vyschnutí nezkoušeno                                                                   | Trn **zúžený 29,0 → 28,5**, tahací poutko pod fólií, povytažení po 1–2 h (8.6, krok 15); s S_l 38 je vůle 1,97; zkouška 13.4 #24                                                                                                                                                   |
| K1-6 (Z)  | Přetok lepidla 0,5 mm zablokuje trn; pruh 2 mm se štětcem těžko drží                                                   | **Maskovací páska** (8.5, krok 10, list 2); **s_ins = 2,0 → S_l = 38,0**, b_max 30,97, projekce lusku 35,5; W + 1,0                                                                                                                                                                |
| K1-7 (Z)  | Retence stojí na „tvar je stálý“; plochá stěna s průzorem se může zploštit                                             | Tvrzení o stálosti zmírněno (1, 7.1, 7.6, 10); #9 rozšířen o definovanou zátěž, navlhčení, měření dutiny u ústí a kritérium ≥ c − 0,5; záloha stavěcí proužky (7.2)                                                                                                                |
| K1-8 (D)  | Kroky 10–13 fyzicky nejednoznačné                                                                                      | Přeskládáno: 10 = lepidlo na rozvinutý díl přes masku, 11 = trn napříč do ohybu, separační list, vytahovat od ohybu; trn zůstává při děrování, vyjme se před šitím (krok 13)                                                                                                       |
| K1-9 (D)  | Podložky se mohou odloupnout                                                                                           | Únavová zkouška 13.4 #23 (100 + 100); záloha jedna silnější podložka, Ø 10 s a_p 15 (průzor u 29–79)                                                                                                                                                                               |
| K1-10 (D) | Tvarování zdrsní začištěné hrany                                                                                       | Krok **15b** přeleštění ústí, schodu a průzorů; při kroku 15 neuhlazovat přes okraj průzoru                                                                                                                                                                                        |
| K1-11 (D) | „Jen ohyb bez protažení“ neplatí pro spodní rohy                                                                       | Formulace opravena (7.2 #2, 8.6); #10 zapisuje i zvlnění ve spodních rozích lusku                                                                                                                                                                                                  |
| K1-12 (D) | Ražba na hotovém kusu na měkkém podkladu                                                                               | **Razit naplocho** po kroku 8 (krok 8b), při tvarování místo chránit hadříkem (7.9, krok 15)                                                                                                                                                                                       |
| K1-13 (D) | Chybí finální úprava                                                                                                   | Krok 18 „finální úprava (volitelná)“ bez konkrétního přípravku, nejdřív na zkušebním lusku                                                                                                                                                                                         |
| K1-14 (D) | Chybí 1:1 pattern, SVG a PDF; nejasné, zda přenášet otvory                                                             | Vygenerováno (14.4) s vrstvami CUT/STITCH/FOLD/GLUE/GUIDE, pohledem RUB, textem tisku a úsečkou 50 mm; ve STITCH poznámka „přenést až na slepený kus (krok 12)“, 8.4                                                                                                               |

### Kontrola 2

| #         | Nález                                                                                   | Co se změnilo                                                                                                                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K2-1 (Z)  | Mince „nevypadne“ – podložky ji svírají, průzor dovolí posun jen 23,5 mm                | Výdej = **dva pohyby** (posunout, až vyčnívá, pak vytáhnout) (7.6, 7.7, 10); kontrola vyčnívání D − a_p ≥ 8 pro 50 Kč (14.3, kód); D_min dává 6 mm – přiznáno, zkouška 13.4 #21 a varianta D_w 6; 7.11 kroky při placení **2**                                                                                                  |
| K2-2 (Z)  | Vložení nemůže „cvaknout“ – mince musí ještě 10 mm dolů                                 | Vrácení = zasunout a **palcem stáhnout pod práh ≈ 10 mm** (7.6 bod 1, 7.7); „cvakne“ vypuštěno; #6 zkouší i vracení                                                                                                                                                                                                             |
| K2-3 (Z)  | Hotová šířka 100–108 platí jen nahoře, u dna je W                                       | Šířka uvedena jako **112 u dna, 106–109,5 nahoře**, obdélník **112 × 98,2** (1, 7.11, 8.1, 9); riziko „uší“ ve stavu C (9); #18 měří šířku u dna i nahoře a fotí rohy                                                                                                                                                           |
| K2-4 (Z)  | Zkušební lusk nemá vnitřní dělicí šev                                                   | Zkušební lusk rozšířen o 20 mm karetní zóny: **69 × 144,3**, tři švy, dělicí uvnitř (13.2, 14.3, list 3); #10 výslovně pro vnitřní šev                                                                                                                                                                                          |
| K2-5 (Z)  | Karty drží jen čočka; #14 a #15 se vylučují; κ = π · t/2 nadsazené (správně π · t − 2t) | Model opraven na **κ′ = 1,37** (8.2, 14.3); S_c = 63,0 z nejkratší stěny + tolerance (viz K1-3 – navrhované 60,5 by stav C nechalo bez tolerance, v rozporu s kap. 23); #14 a #15 popsány jako jedna volba s prioritou; **zadní výkus zúžen 34 → 20 mm** (x 26–46, R10) a přiznáno, že retenci nese spodních 70 mm a boky (7.4) |
| K2-6 (Z)  | „Po vytahání drží pevněji“ je jednostranné                                              | 7.6 bod 10 a 10: dva protichůdné vlivy; test 13.4 #22 (200 průchodů, pak #7)                                                                                                                                                                                                                                                    |
| K2-7 (D)  | Chybí součet 4,0 v kombinacích podložek, „kroky 0,2“ neplatí                            | Množina doplněna o 4,0 → h 2,0; kroky 0,2 jen v pásmu 4,0–4,8; součty s h ≥ t_max označené jako nesmyslné (D2)                                                                                                                                                                                                                  |
| K2-8 (D)  | Řádek švů bez bodů, součty nesedí                                                       | Body A 2, B 3, C 3; součty **38 / 46 / 48**; „Čtení tabulky“ přepsáno – C vede součtem, výběr stojí na kap. 9 (6)                                                                                                                                                                                                               |
| K2-9 (D)  | Obrácená nerovnost vyčnívání karty; stav C 1,96 < m_k 2,0                               | „13,6–15,6 mm“ (7.4, 8.2, 9, 10); „2,0–2,4 pod hranou, ve stavu C 1,96“; kontrola vedená pro stav C s m_k = 1,9 (14.2, 14.3)                                                                                                                                                                                                    |
| K2-10 (D) | Hodnota 5,76 ve směrech B a C bez výpočtu                                               | Nahrazena 6,56: B 93,7, C 62,0 (5)                                                                                                                                                                                                                                                                                              |
| K2-11 (D) | Tři různé délky trnu, GUIDE 29 × 94                                                     | Sjednoceno: trn **122** (hloubka 97 + 25), materiál ≥ 29 × 125 s rezervou na řez; v GUIDE trn od u = −R_i do u = H_l (8.6, 12, 14.3)                                                                                                                                                                                            |
| K2-12 (D) | Parametry pro generátor bez náležitostí PDF a zarovnávacích značek                      | 14.2 doplněna o úsečku 50 mm, texty tisku a zarovnávací značky (vně obrysu, ne zářezy do viditelné hrany); přiřazeno k vrstvě GUIDE (14.3)                                                                                                                                                                                      |
| K2-13 (D) | Pruh 2 mm štětcem těžko dodržitelný; tolerance nepočítá s přetokem                      | Maskovací páska (8.5, krok 10); řádek „přetok lepidla“ v 8.7 s kontrolou S_c 62,0 ≥ 61,91 a S_l 37,0 > 36,03                                                                                                                                                                                                                    |

**Co se neopravilo (a proč):**

- **Vyčnívání nejmenší mince (≈ 6 mm < 8 mm).** Posunout průzor výš nejde (pevnost prahu), menší
  podložka zhorší lepení. Rozhodne až zkouška 13.4 #21; varianta je popsaná v 8.2.
- **S_c podle návrhu K2 (60,5 na stav B)** nepřijato – stav C by potřeboval +1,4 mm protažení, a to
  odporuje kap. 6 i 23. Zvolen kompromis 63,0 z opraveného modelu; retence 4 karet tvarem.
- **Zadní výkus mimo přední v x** – v zóně 63 mm to nejde bez výkusu u švu; zúžen a přiznán.
- **Dotvarování ústí, stálost lusku, odlupování podložek** se výpočtem vyřešit nedají – jsou to
  zkoušky 13.4 #9, #22, #23 na zkušebním lusku, dřív než se řeže celý kus.

### Po nezávislém ověření

Třetí, nezávislá kontrola (2026-09-28) našla jednu blokující vadu (fyzicky nemožný krok) a šest
drobných nálezů. B = blocker, S = serious, N = nit.

| #   | Nález                                                                                                                                                                                                                                             | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Trn 6 × 29 mm položený napříč do ohybu jako 6mm distance (kroky 11, 13, list 2 střihu) je fyzicky nemožný: šířkou 29 mm by stál nastojato podél stěn (u ≈ 0–26), lepené pruhy od u = 5 by se nedotkly a spodní otvory by se prosekávaly přes něj. | Nahrazeno **kulatou distanční tyčkou Ø 6 mm**, která sedí ve vnitřním poloměru ohybu R_i = 3,0 mm a čouhá jen ≈ 3 mm nad plochu (kroky 11, 13; 8.6 nová tabulka a poznámka; §12 nástroje i materiál; list 2 střihu, krok 4 postupu). Model dostal odvozenou hodnotu `foldSpacerDiameterMm` (14.3) a kontrolu, že polovina jejího průměru zůstane pod začátkem lepení u_g (`src/lib/geometry/minimal-wallet.ts`). |
| S1  | Pásmo zapečetění rubu v ústí lusku (x 69,5–107,5, u 80–94, krok 9) nebylo na listu 2 (pohled rub) vůbec vidět.                                                                                                                                    | Vykresleno ve vrstvě GUIDE na listu 2 (obě stěny) jako orámovaná zóna s popiskem a čísly; krok 9 na něj odkazuje (14.3, oddíl 11).                                                                                                                                                                                                                                                                               |
| S2  | Konkrétní délky bankovek podle nominálu (1000 Kč, 2000 Kč, 5000 Kč) nejsou v repozitáři sourcované – jen rozsah ČNB 140–170 mm.                                                                                                                   | 7.5 přepsáno na sourcovaný rozsah: dělení na třetiny/čtvrtiny je odvozené jen z porovnání s šířkou karty (53,98 mm → mez ≈ 162 mm), který nominál kam padne, je označeno **ověřit** (13.4 #17). Stejně upraveny odkazy v 8.0 (řádek 6) a 10.                                                                                                                                                                     |
| S3  | List 3 (zkušební lusk) neměl žádná čísla lepení na rubu, jen odkaz na vzorec.                                                                                                                                                                     | Přidán sloupec „ZL – lepení na rubu (x_rub od hrany L)“ dopočtený z modelu (`mirroredGlue`) přímo na listu 3: levý 64,5–69, dělicí 42,5–44,5, pravý 0–4,5 (u 5–66,5).                                                                                                                                                                                                                                            |
| N1  | Řádek „t_max = 2,5 …“ (8.2, u D2) byl omylem zalomený jako markdown citace (`>`).                                                                                                                                                                 | Sloučeno zpět do běžného odstavce, doplněno spojovací „to je nad“.                                                                                                                                                                                                                                                                                                                                               |
| N2  | „≈ 8–13 mm u 50 Kč“ (7.6 bod 2) neodpovídalo přesné hodnotě 13,5 mm použité všude jinde.                                                                                                                                                          | Sjednoceno na „≈ 8–13,5 mm“ s odkazem na výpočet D − a_p výše.                                                                                                                                                                                                                                                                                                                                                   |
| N3  | List 1 počítal „nahoře ≈“ funkcí `Math.round` (celá čísla 106–109), dokument uvádí 106,1–109,5.                                                                                                                                                   | Sheet teď zaokrouhluje na 1 desetinné místo (nová pomocná `cz1`), shoduje se s dokumentem.                                                                                                                                                                                                                                                                                                                       |
| N4  | GLUE obdélníky krajních pruhů (levý, pravý) na listech 1–3 přesahovaly obrys do zaoblených rohů R4.                                                                                                                                               | Každý list má `<clipPath>` podle vlastního obrysu dílu a GLUE geometrie je do něj ořezaná (`Sheet.clipPath`, listy 1–3).                                                                                                                                                                                                                                                                                         |
| N5  | List 2 (rub) neměl zarovnávací značky (konce ohybu, středy zón), které má list 1.                                                                                                                                                                 | Doplněny stejné značky – se správně otočeným směrem „ven“, protože pohled na rub je zrcadlený (x_rub = W − x).                                                                                                                                                                                                                                                                                                   |
| N6  | Text legendy vrstev („CUT řez“ apod.) byl vykreslený do vrstvy podle svého vzorku, takže vrstva CUT obsahovala i text.                                                                                                                            | Popisky legendy jsou teď vždy ve vrstvě GUIDE (jen barva odpovídá vrstvě); CUT obsahuje jen řeznou geometrii. Přidán test, že vrstva CUT neobsahuje `<text>`.                                                                                                                                                                                                                                                    |

Regenerováno `pnpm pattern:wallet`; nové testy v `src/lib/geometry/minimal-wallet.test.ts` a
`scripts/minimal-wallet.test.ts` hlídají distanční tyčku, ořez GLUE rohů, pásmo zapečetění na listu 2,
zarovnávací značky na listu 2 a to, že vrstva CUT neobsahuje text.
