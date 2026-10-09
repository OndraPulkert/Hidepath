# Pásek: parametry na výběr (zadání 2026-10-08)

Pásek není jeden výrobek. Uživatel si volí **šířku, tloušťku, obvod a konec**; vše ostatní se
z nich spočítá. Meze plynou z kontrol v [`src/lib/geometry/belt-end.ts`](../../src/lib/geometry/belt-end.ts)
(`checkBeltEndSpec`, `checkBeltTipSpec`, `checkBeltPlate`) a z podkladů
[`sablony-zdroje.md`](../content/sablony-zdroje.md), [`notes-vybaveni.md`](../content/notes-vybaveni.md)
a [`opasek-postup.md`](opasek-postup.md). Co zdroj nemá, je označené **ověřte na odřezku**.

Můstek (`minLigamentMm`) je ve všech kontrolách **6 mm**.

## 1. Parametry

| Parametr                                  | Výchozí                                         | Rozsah v aplikaci                           | Proč tahle mez                                                                                                                                                                                                                                                                                                                                                                                         | Co mění                                                                                                     |
| ----------------------------------------- | ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Šířka** = vnitřní světlost přezky       | 40 mm                                           | **28–45 mm**, celé mm                       | Model sám pustí 18 až ≈ 82,8 mm (dolní: můstek k boční hraně u otvoru Ø 6, `checkBeltEndSpec`; horní: mezera hrot–první dírka, při 82,9 klesne pod 6 mm). Užší mez dává destička (28–45, `minBeltWidthMm`/`maxBeltWidthMm`) a zdroje: běžné šířky 30/32, 38/40, 45, u dodavatelů 35. Rozvržení konce u přezky je odměřené z BFLG pro 25–38 mm a na 40 mm použité přes střednici; mimo 28–45 neověřené. | délka hrotu, oblouk zaobleného konce, délka poutka, přezka a pás v nákupu, cena pásu, použitelnost destičky |
| **Tloušťka** (změřená na řezu)            | **3,5 mm**                                      | **3,0–4,0 mm**, změřená hodnota (např. 3,6) | Postup krok 3 a nákupní seznam: pás 3,0–4,0 mm, nýt podle tloušťky. Model hlídá jen > 0. Dřík se počítá z přesné hodnoty; nýt z ověřených nabídek, který do rozsahu padne, nebo „žádný, ověřte u prodejce“. Nabídky pásu filtruje s tolerancí dodávky: CraftPoint (nominál 3–3,5) do naměřených 3,75 mm.                                                                                               | délka dříku nýtu (`rivetPostRangeMm`), délka poutka, výška podložek pod destičku                            |
| **Obvod** (ohyb u přezky → nošená dírka)  | žádný, uživatel změří                           | 60–150 cm                                   | Jen pojistka proti překlepu, ne řemeslná mez. Model nemá omezení.                                                                                                                                                                                                                                                                                                                                      | délka pásu k nákupu, výběr délky pásu (130/140/150 cm)                                                      |
| **Konec**                                 | uživatel volí (obě varianty)                    | `hrot` / `zaoblený`                         | Hrot: sklon 0,453 a vrchol R4 (CraftPoint, odměřeno pro 35 i 40 mm). Zaoblený: polokruh r = šířka/2.                                                                                                                                                                                                                                                                                                   | tvar listu 2, řada destičky (1 nebo 2), délka hrotu                                                         |
| **Počet dírek**                           | 5                                               | 3 / 5 / 7                                   | Model: lichý počet ≥ 1 (jinak není prostřední dírka). Zdroje znají jen 5 (CraftPoint generátor i slovník). 3 a 7: **ověřte na odřezku**.                                                                                                                                                                                                                                                               | délka pásu, rozsah nastavení (±(n−1)/2 × rozteč), délka listu 2                                             |
| **Rozteč dírek**                          | 25 mm                                           | 25 mm; jiná jen s varováním, min. Ø + 6 mm  | Zdroje: 25 mm (CraftPoint, slovník, video). Model: rozteč − Ø dírky ≥ 6 mm, tedy pro Ø 5 aspoň 11 mm.                                                                                                                                                                                                                                                                                                  | polohy dírek, délka pásu, rozsah nastavení                                                                  |
| **Vrchol → první dírka**                  | 94,3 mm                                         | od meze modelu do 100 mm                    | CraftPoint 94,3 mm; Realeather „1″–4″“, tedy 25–100 mm. Model u hrotu: délka hrotu + Ø/2 + 6 mm, tedy 47,0 mm u 40 mm a 52,5 mm u 45 mm (Ø 5). U zaobleného konce: r (= šířka/2) + Ø/2 + 6 mm, tedy 28,5 mm u 40 mm a 31,0 mm u 45 mm (Ø 5) – `checkBeltTipSpec` s tvarem `round`.                                                                                                                     | polohy dírek, délka pásu                                                                                    |
| **Ø dírky pro trn**                       | **5 mm**                                        | trn u kořene + 0,5 mm                       | Postup: u přezky 40 mm 4,5 nebo 5 mm, 5 mm je běžná velikost. U jiné přezky změřte trn. Model: rozteč a boční můstek.                                                                                                                                                                                                                                                                                  | výsečník v nákupu                                                                                           |
| **Konec u přezky** (ovál, nýty, přehnutí) | ovál 25 × 6, nýty ±25,5 / ±73,2, přehnutí 90 mm | **pevné**                                   | Jediný zdroj s dvěma nýty (BFLG), stejné pro 1″–1½″. Kontroly: můstek ovál–nýt 10 mm, za nýtem 13,8 mm, kapsa 37,7 mm. CraftPoint má jiný konec (ovál 40 × 8, jeden nýt, 80 mm) – nemíchat.                                                                                                                                                                                                            | délka pásu (+90 mm), řada 3                                                                                 |
| **Ø otvoru pro nýt a konce oválu**        | 6 mm                                            | pevné                                       | CraftPoint (6mm otvory pro nýty) i BFLG (5,7 mm). Ovál 6 mm = výsečník na jeho konce.                                                                                                                                                                                                                                                                                                                  | výsečník 6 mm v nákupu                                                                                      |
| **Šířka poutka**                          | **12 mm**                                       | 12 mm; model pustí do 37,7 mm               | Rozhodnutí 2026-10-08. Model: poutko ≤ světlá kapsa mezi hlavičkami nýtů (47,7 − 10 mm). Jiná šířka: **ověřte na odřezku**.                                                                                                                                                                                                                                                                            | list 1 (pásek na poutko)                                                                                    |
| **Přeplátování poutka**                   | 15 mm                                           | pevné                                       | Volba šablony, neověřeno praxí.                                                                                                                                                                                                                                                                                                                                                                        | délka poutka                                                                                                |

## 2. Co se z toho spočítá

| Výstup              | Vzorec (funkce v `belt-end.ts`)                                             | Výchozí (40 × 3,5, 5 dírek)          |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| Délka pásu k nákupu | obvod + 90 + vrchol→první dírka + (n − 1)/2 × rozteč (`totalStrapLengthMm`) | obvod + 234,3 mm                     |
| Dírky od vrcholu    | vrchol→první + i × rozteč (`holeOffsetsFromApexMm`)                         | 94,3 / 119,3 / 144,3 / 169,3 / 194,3 |
| Délka hrotu         | `tipLengthMm` (šířka, sklon 0,453, R4)                                      | 38,5 mm                              |
| Poutko              | 2 × (šířka + 3 × tloušťka) + π × 1,2 + 15 (`keeperStripLengthMm`), zaokr.   | 120 × 12 mm                          |
| Dřík nýtu           | 2 × tloušťka − 1,5 až − 1 (`rivetPostRangeMm`)                              | 5,5–6,0 mm → 10/6                    |
| Ovál                | 25 × 6 mm, ohyb ho půlí → otvor 12,5 mm (`foldedSlotOpeningMm`)             | nemění se                            |
| Nýty od ohybu       | ±25,5 a ±73,2 mm                                                            | nemění se                            |

Délka hrotu podle šířky: 28 → 25,2 · 30 → 27,4 · 32 → 29,6 · 35 → 32,9 · 38 → 36,2 · 40 → 38,5 ·
45 → 44,0 mm.

Poutko (mm) podle šířky a tloušťky. Obepíná **3 vrstvy**: přehnutý konec, pás a volný konec pásku,
který jím po zapnutí prochází; π × 1,2 mm je tloušťka poutka (odřezek 1,2 mm) v ohybech.
(Revize 2026-10-08: dřív 2 vrstvy, poutko vycházelo asi o 11 mm kratší a volný konec by se do něj
nevešel.)

| Šířka | 3,0 | 3,5 | 4,0 |
| ----- | --- | --- | --- |
| 30    | 97  | 100 | 103 |
| 35    | 107 | 110 | 113 |
| 40    | 117 | 120 | 123 |
| 45    | 127 | 130 | 133 |

Délka pásu: s výchozím rozvržením stačí pás 130 cm do obvodu **106,5 cm**. Nad to je potřeba pás
se zaručenou větší délkou: Křupson 150 / 180 cm (jen šířka 40 mm). CraftPoint slibuje „130–140 cm“,
s 140 cm proto nepočítejte; pro jiné šířky ověřte u prodejce. Každá dírka navíc na každou stranu
přidá 25 mm.

## 3. Nýt podle tloušťky (postup krok 3)

| Tloušťka   | Dřík       | Co koupit | Ověřený zdroj                                                                     |
| ---------- | ---------- | --------- | --------------------------------------------------------------------------------- |
| 3,0 mm     | 4,5–5,0 mm | dřík 5 mm | **žádný** (CraftPoint nemá; Andexnite řada 5 mm jen z výkresu)                    |
| 3,25 mm    | 5,0–5,5 mm | dřík 5 mm | **žádný**                                                                         |
| **3,5 mm** | 5,5–6,0 mm | **10/6**  | CraftPoint 10/6, 8 Kč/ks; Andexnite Ø 9,5 × 6 (dřík 5,8) byl 2026-09-16 vyprodaný |
| 3,75 mm    | 6,0–6,5 mm | 10/6      | CraftPoint 10/6                                                                   |
| 4,0 mm     | 6,5–7,0 mm | dřík 7 mm | **žádný** ověřený (Andexnite řada 6,8 mm jen z výkresu)                           |

Aplikace počítá dřík z přesné změřené tloušťky (2 × t − 1,5 až 2 × t − 1) a nabídne nýt z ověřených
nabídek, jehož dřík do rozsahu padne (CraftPoint 6 mm a Leatory 1/4" = 6,35 mm s dříkem na stránce; Andexnite 5 a
6,5 mm jen podle názvu, „ověřte u prodejce“). Když nepadne žádný (např. 3,4 mm → 5,3–5,8 mm),
napíše „ověřený nýt s takovým dříkem nemáme, ověřte u prodejce“.

## 4. Přezka a pás v nákupu

Přezka „40 mm“ = vnitřní světlost = šířka pásu. Kupujte **jednotrnovou** stejné šířky.

| Šířka | Proč běžná (slovník CraftPoint) | Pás (CraftPoint 3–3,5 mm, 130–140 cm, ověřeno 2026-10-08) | Jednotrnová přezka s ověřeným trnem      |
| ----- | ------------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| 30/32 | společenský                     | 30 mm 228 Kč (32 mm v nabídce není)                       | **ano** 30 mm (CraftPoint mosazná)       |
| 35    | běžná u dodavatelů pásů         | 35 mm 256 Kč                                              | **ano** (CraftPoint mosazná)             |
| 38/40 | do džínů                        | 38/40 mm 284 Kč                                           | **ano** (CraftPoint mosazná)             |
| 45    | pracovní                        | 45 mm 313 Kč                                              | **ne** (jen Andexnite, 2 ks, typ trnu ?) |

Ceny z 2026-10-08 (`src/content/equipment/belt.ts`); před nákupem znovu ověřte. CraftPoint u pásu
slibuje 130–140 cm, aplikace počítá se 130 cm. Andexnite a Leatory mají přezky 30–40 mm levněji,
typ trnu ale stránka neuvádí.

## 5. Destička (MK Plexi, dodaná) – co pokryje

| Řada / prvek                | Pokryté šířky                        | Pevné na destičce                                         | Mimo rozsah                                               |
| --------------------------- | ------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Vodicí linky                | 30 / 35 / 40 / 45                    | –                                                         | jiné šířky 28–45 přes příčnou stupnici (hrana na šířka/2) |
| **Řada 3** – konec u přezky | **28–45** (značky ohybu ±12 mm)      | ovál 25 × 6, nýty ±25,5 / ±73,2, přehnutí 90 mm           | pod 28 nebo nad 45: tiskový list                          |
| **Řada 1** – hrot           | **28–45** (výřez 55 mm, sklon stálý) | 5 dírek po 25 mm, první 94,3 mm od vrcholu, R4            | jiný počet / rozteč / odstup: tiskový list                |
| **Řada 2** – zaoblený       | **jen 40 a 30**                      | oblouky r 20 a 15 (soustředné), 5 dírek po 25 mm          | 35 a 45: kružítko r = šířka/2 nebo tiskový list           |
| Řada 2 – odstup první dírky | 40: 94,3 mm · 30: **89,3 mm**        | oblouky mají společný střed, konec 30 mm leží o 5 mm blíž | –                                                         |
| Pravítko 0–145 mm           | poutko do 139 mm (45 × 5 mm)         | –                                                         | –                                                         |
| Tloušťka                    | destička na ní nezávisí              | –                                                         | podložky pod destičku stejně silné jako pás               |

**Pravidlo pro aplikaci:** destičku nabídněte, když šířka ∈ 28–45, počet dírek = 5, rozteč = 25 mm,
odstup = 94,3 mm a (konec = hrot, nebo konec = zaoblený a šířka ∈ {30, 40}). Jinak „vytiskněte listy“.

## 6. Tiskové listy – stav (2026-10-08)

Kreslení listů je v [`src/lib/patterns/belt-sheets.ts`](../../src/lib/patterns/belt-sheets.ts);
skript `scripts/belt-buckle-end.ts` je jen zapisuje. Aplikace je kreslí v prohlížeči
(formulář „Váš pásek“, `browserGenerator: 'belt-config'`, výpočet v
[`src/lib/patterns/belt-config.ts`](../../src/lib/patterns/belt-config.ts)).

| Věc                     | Stav                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Šířka                   | aplikace 28–45 mm (celé mm); skript dál `--width` 15–80 mm                                                                                              |
| Tloušťka                | vstup 3,0–4,0 mm, libovolná změřená hodnota; mění délku poutka na listu 1, dřík nýtu je ve výsledcích                                                   |
| Konec                   | list 2 kreslí hrot i zaoblený konec (půlkruh r = šířka/2)                                                                                               |
| Počet dírek             | do 195,6 mm od konce list na výšku; do 258 mm na šířku (7 dírek); dál aplikace čísla spočítá a vytiskne jen list 1 (dírky a konec „značte podle čísel“) |
| Výchozí listy 35/40 mm  | přegenerované `pnpm pattern:belt-end --multi` (hlídá `scripts/generator-golden.test.ts`); texty ve vykání                                               |
| Generování v prohlížeči | hotové                                                                                                                                                  |

## 7. Kontrola destičky po dodání

Podle zadání v [`opasek-sablona-poptavka.md`](opasek-sablona-poptavka.md) a modelu
(`beltPlateLayout`). Měřte ocelovým pravítkem nebo posuvkou, polohy od **levé krátké hrany**.
Řezané otvory a sloty vyjdou o kerf (~0,2 mm) větší než v souboru; rozteče středů ne.

- [ ] Obrys **215 × 184 mm** (± 0,5 mm). Levý horní roh zkosený 5 mm, ostatní tři zaoblené R3.
- [ ] Gravírovaná kóta **50 mm** měří 50 mm.
- [ ] Materiál čirý, gravír čitelný; čísla řad 1/2/3 a linek **nejsou zrcadlená**.
- [ ] Pravítko u horní hrany: **0 na levé hraně**, čitelné do 145 mm.
- [ ] Vodicí linky 30 / 35 / 40 / 45 s čísly ve všech třech řadách; příčná stupnice po 1 mm.
- [ ] **Řada 1:** 5 otvorů Ø 2 mm, středy **10 / 35 / 60 / 85 / 110 mm** (rozteč 25 ± 0,2 mm);
      nad a pod prostředním (60 mm) dva gravírované křížky; výřez hrotu s vrcholem R4 na **204,3 mm**.
- [ ] **Řada 2:** 5 otvorů jako řada 1; **2 oblouky** (r 20 a 15 mm, slot 2 mm), vrchol oblouku 40
      na 204,3 mm, oblouku 30 na 199,3 mm; konec každého oblouku leží na lince své šířky.
- [ ] **Řada 3:** 4 otvory pro nýty v jedné přímce na **16,8 / 64,5 / 115,5 / 163,2 mm**;
      ovál **77,5–102,5 mm** (25 × 6 mm); 2 značky ohybu na **90 mm**, ±12 mm od osy, spojené čárkovanou linkou.
- [ ] Všech **16 otvorů Ø 2 mm** průchozích, šídlo projde; závěsný otvor Ø 4 mm vpravo dole.
- [ ] Oba sloty řady 2 průchozí, odpad vypadl, žebro mezi nimi celé, bez prasklin.
- [ ] Hrany bez natavení a otřepů, fólie z gravírované strany sundaná.
- [ ] Destička položená na kontrolní tisk (`opasek-desticka-kontrolni-tisk.pdf`, A4 na šířku, 100 %,
      nejdřív přeměřte jeho obrys) kryje všechny otvory a výřezy.

Odchylka nad toleranci: vyfoťte ji s měřidlem, napište řezárně a destičku zatím nepoužívejte.
