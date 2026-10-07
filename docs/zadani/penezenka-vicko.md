# Peněženka VÍČKO – technický návrh, verze 2 po kontrole (NÁVRH k ověření na prototypu)

Stav: **návrh k ověření na papírovém modelu P0, zkoušce ohybu V12 a zkušebním kusu**
(oddíl 11), ne lekce a ne hotový střih. Vychází z konceptu F2 „Víčko“ v [`penezenka-kolo3.md`](penezenka-kolo3.md)
a ze zadání [`DESIGN_BRIEF.md`](DESIGN_BRIEF.md) (kap. 22–31). Tam, kde se liší, platí **skladba podle
rozhodnutí autora** (karty – bankovky napůl – mince ve dvou sloupcích), **opravy z kontroly 3D modelu**
(oddíl 3), **opravy ze dvou kontrol verze 1** (oddíl 13, „Změny po kontrole“) a **úpravy kola 4
schválené autorem** (výřez pro palec, ochrana proti R4, plíšek 0,8, oprava šířky; oddíl 13, „Kolo 4“)
a **úpravy kola 5** (domácí dílna, zúžený výřez pro palec, opravy textu; oddíl 13, „Kolo 5“) a
**rozhodnutí kola 6** (ohyb dna a závěs bez ztenčení, L1 z usně 0,6 a obšitá, hranaté spodní rohy;
oddíl 13, „Kolo 6“) a **rozhodnutí kola 8** (zjednodušené domácí zkoušky: P0, V12 a zkušební kus
místo přípravného bloku, plíšek 14 × 20,5, výměna magnetu; oddíl 13, „Kolo 8“) a **zjednodušení kola 9**
(závěs bez kopyta a opěrky, tvarovaný zavřený přes obsah; poloha hrany vložky dna; vložka ze starých
karet; jeden nákup kůže; přepínače pro změřenou tloušťku přepážek; oddíl 13, „Kolo 9“).

**Značení:** „kap. N“ = kapitola briefu, „oddíl N“ = oddíl tohoto dokumentu. Délky jsou v mm.

**Pravidlo dokumentu:** každé číslo je buď vypočtené (výpočet je uvedený), nebo převzaté z repozitáře:
karta 85,60 × 53,98 × 0,76; pole magnetického proužku 5,54–15,82 od dlouhé hrany (z kola 3,
v normě ISO 7811 ověřit); bankovky ČNB 140/146/152 × 69 a 158/164/170 × 74; mince 50 Kč Ø 27,5 ×
2,5 a 1 Kč Ø 20 × 1,85; výsečníky Ø 8/10/12/14 (Kolo 11); vidličky 4 mm. Co jisté není, je označené
**„ověřit“**. Ceny, obchody a odkazy jsou jen u nákupu kůže (oddíl 10.1).

**Generátor:** všechny rozměry z oddílů 4–7 a 12 počítá `src/lib/geometry/lid-wallet.ts` a kreslí
`pnpm pattern:wallet-lid` do `docs/generated/penezenka-vicko-*.svg/.pdf` (4 listy A4, 1:1). Když se po
prototypu změní vstup (oddíl 12.1), přepočítá se všechno najednou a kontroly v kódu hlásí česky, co
přestalo platit.

**Souřadnice:** x = šířka 0–101 zleva při pohledu zepředu, y = výška od spodní hrany (vnější líc
ohybu dna je y = 0), z = tloušťka, dopředu je líc přední stěny. **v** je souřadnice podél rozvinutého
pásu P1 na střihu (oddíl 5.3). Všechno je souměrné podle osy x = 50,5.

---

## 1. Shrnutí

**Víčko** je peněženka do zadní kapsy o rozměrech **101 × 83,5 mm**. Tvoří ji jeden pás třísločiněné
usně 1,0 mm (P1), který je dole přeložený, vzadu vede nahoru, přes horní hranu přechází v **plochý
závěs se dvěma přehyby** a vpředu končí jako **víčko s jazýčkem**. Ve výchozím střihu se **nic
neztenčuje** (ohyb dna i závěs mají 1,0; ztenčení je jen záloha, oddíl 5.8). Uvnitř jsou dvě tenké
přepážky, ve výchozím střihu 0,6 mm (koupené kozinky se změří a listy se vygenerují pro jejich
tloušťku, krok 0). Oddíly jdou zepředu dozadu:

1. **karty** (6 ks) na zvednutém a **sešitém** dně, po otevření z přední stěny vyčnívají 18,4–20,3 mm;
   uprostřed horní hrany F je **výřez pro palec** U 10 × 12, v něm je přední karta vidět 30,4–32,3 mm
   (výřez pomáhá **jen s přední kartou**; k zadní kartě se jde vyndáním předních),
2. **bankovky složené jednou napůl**, na celou šířku (kapsa 93),
3. **mince**: dva svislé sloupce po 2 mincích (4 × 50 Kč se vejdou), na zádech okénko pro palec.

Zavřené víčko přikryje ústí všech oddílů. Drží ho **magnet na konci jazýčku**, který dosedá na plíšek
zalepený v přední stěně **pod dnem karet**. Magnet je na jazýčku pod podšívkou L1, kterou kolem
magnetu drží lepení i šev S7. Proužek karty je od středu magnetu ve všech stavech ≥ 13,7 mm (při
horším k 1,24 ≥ 12,27, požadavek ≥ 7,9; oddíl 4.2). Plíšek obaluje magnet **v celém rozsahu k
1,0–1,24** ve všech stavech (dřív jen při k 1,0, viz oddíl 13 „Po nezávislém ověření“).
Karty s magnetickým proužkem se vkládají **proužkem k horní hraně (k víčku)**, horní hrana D1 je
natřená kontrastní barvou a D2 je v kontrastním tónu – to zmenšuje otevřené riziko R4 (karta omylem
v oddílu bankovek, oddíl 4.2).

| Veličina               | Hodnota                                                                                                                                                                          | Kde |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Půdorys                | **101 × 83,5** (když P0-6 ukáže, že karty na klínu dna nesedí výš, 101 × 81,0)                                                                                                   | 5.1 |
| Tloušťka (obálka)      | A 4,2 (lokálně 6,2 u magnetu) · B 7,92 · **plná 11,36 v pásu mincí**, střed 9,86, dole 3,7; pruh 12,36 u hrany víčka už nevzniká                                                 | 7   |
| Díly                   | kožené 3 (P1, D1, D2) + podšívka jazýčku L1 z usně 0,6; kování: magnet Ø 8 × 1,5 a plíšek 14 × 20,5 × 0,5                                                                        | 5.2 |
| Švy                    | 7 švů (S7 obšívá L1), **107 otvorů**, rozteč 4,0 mm, nejvýš 3 vrstvy (2,6 mm)                                                                                                    | 5.6 |
| Ztenčení               | **žádné** (ohyb dna i závěs 1,0); záloha A celý P1 z usně 0,8, záloha B ztenčení na 0,6 (rozhodne V12 a zkušební kus)                                                            | 5.8 |
| Bankovky               | všechny ČNB 100–5000 Kč napůl (70–85 × 69–74), boční vůle 23–8 mm, nahoře vůle 6,5–11,5 mm; po posunu okénkem vyčnívají 19–24 mm                                                 | 4.4 |
| Mince                  | 2 sloupce 31 × 57, 4 × 50 Kč; okénka 12 × 48                                                                                                                                     | 4.5 |
| Magnet ↔ proužek karty | ≥ 13,7 mm (k 1,0) / ≥ 12,27 (k 1,24), odhad pole ≤ 3,38 / 4,69 mT (neodstíněno, ověřit na prototypu, volitelně V5)                                                               | 4.2 |
| Závěs                  | plochý, 1,0 bez ztenčení, tvarovaný **zavřený přes obsah stavu B** (bez kopyta, Kolo 9); otevřené víčko samo nestojí, u bankovek a mincí ho drží palec; výdrž ověří zkušební kus | 5.8 |
| Výřez pro palec        | U 10 × 12 v horní hraně F na ose (x 45,5–55,5, dno y 50), pod jazýčkem i posunutým o 3 mm; jen pro přední kartu; **ověřit na papírovém modelu P0**                               | 4.6 |
| Karta v bankovkách     | proužkem dolů ~3,5 mm za magnetem (R4 otevřené); **proužkem k horní hraně ≥ 19,9 mm** (18,9 při dně bankovek o 1 mm níž; pravidlo v návodu)                                      | 4.2 |

**Oproti zadání autora je peněženka o 2 mm širší (101 místo 99) a o ~2 mm vyšší.** Důvod: kapsa, kterou
tvoří F a D2, musí obalit kartu i tloušťku všeho, co je mezi nimi (karty, D1, bankovky; oddíl 5.1),
karty na klínovém dně sedí výš než čára lepení (oddíl 5.1) a neztenčený ohyb dna a závěs (Kolo 6)
přidají dohromady 0,9 mm (dno karet 25,5 → 26,0, závěs 0,6 → 1,0). Při šířce 99 by se vešly jen 3 karty:
kapsa karet mezi pásy G2b potřebuje pro 4 karty 85,6 + 4 · 0,76 + 0,8 = 89,44 > 89 (šířka 99 dává
kapsu 89). Pro 4 karty vychází šířka 99,5, pro 5 karet 100,5 (model, oddíl 13, nález K2-3 a Kolo 5).

---

## 2. Princip a každodenní používání

**Retence:** tvoří ji zavřené víčko a pevné hranice oddílů, nezávisí na tření ani na plnosti.
Karty, bankovky i mince mají zboku švy nebo lepení, zespodu dno a shora plochý závěs. Jediný pohyb,
který jim zbývá, je posun nahoru až k závěsu: karty 0,24 mm (stav C, plný) až 1,76 mm (stav B, 2 karty)
– podle modelu (`cardShiftNomMm`, oddíl 12.3), bankovky 6,5 (výška 74) až 11,5 mm
(výška 69), mince v plném sloupci 2,0–3,3 mm. Přes horní hrany přepážek se nic nedostane, protože
mezera mezi nimi a stropem je jen 0,5 (D2) a 1,0 (D1) – ověřit P2-1.

**Otevření:** palcem nadzvedni špičku jazýčku (je dole na přední straně, 2,2–10,8 mm nad spodní
hranou) a víčko zvedni nahoru. Závěs je od Kola 9 tvarovaný **zavřený přes obsah** (krok 16), takže
otevřené víčko **samo nestojí** a pruží zpátky nad ústí. Při kartě to nevadí (víčko zvedneš a kartu
vytáhneš), **u bankovek a mincí drží víčko palec ruky, která peněženku drží**, ostatní prsty téže
ruky jsou na zádech u okének – ověřit P0-8 a na zkušebním kusu. Víčko se nemá překlápět až na záda
(zakrylo by okénka a závěs by se ohýbal opačně, oddíl 5.8), stačí ho držet zhruba svisle.

| Úkon         | Pohyby                    | Jak                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Karta**    | otevřít → vzít → zavřít   | Přední karta vyčnívá 18,4–20,3 mm nad přední stěnu, ve výřezu pro palec uprostřed 30,4–32,3 mm. Chytíš ji a vytáhneš, nebo ji palcem ve výřezu vysuneš třením nahoru. Výřez slouží **jen přední kartě**. Pro zadní kartu přední karty vyndáš a pak je vrátíš (rozhodnutí kola 6, oddíl 4.6; čas změří P0-4 a V10).                                                                           |
| **Bankovka** | otevřít → posunout → vzít | Palec ruky, která peněženku drží, drží víčko otevřené. Ukazováček téže ruky vloží do **okénka bankovek** uprostřed zad (14 × 45) a jedním tahem posune svazek o 30 mm nahoru. Bankovka pak vyčnívá 19–24 mm nad ústí, i nízká stokoruna. Druhá ruka ji vezme (ověřit P0-8).                                                                                                                  |
| **Mince**    | otevřít → posunout → vzít | Palec držící ruky drží víčko, ukazováček nebo prostředník téže ruky v **okénku sloupce** (12 × 48) posune horní minci. Ta vyčnívá 9,5 mm, nebo vyjede celá, když posuneš spodní (oddíl 4.5). Druhá ruka minci vezme (ověřit P0-8).                                                                                                                                                           |
| **Vložení**  | otevřít → zasunout        | Kartu vložíš do první štěrbiny u přední stěny (na straně jazýčku), před přepážku D1 s barevnou horní hranou; kartu s magnetickým proužkem **proužkem k horní hraně (k víčku)**, karet bez proužku se to netýká. Bankovku mezi D1 a D2, minci za D2 do levého nebo pravého sloupce. Ústí jsou tři štěrbiny těsně za sebou (riziko R4), proto má D1 barevnou hranu a D2 je v kontrastním tónu. |
| **Zavření**  | 1                         | Víčko sklopíš dopředu (samo se k tomu vrací) a jazýček položíš dolů po přední stěně. Magnet si plíšek najde sám (plíšek je 20,5 mm vysoký) a udrží víčko zavřené (ověřit na zkušebním kusu).                                                                                                                                                                                                 |

**Čemu se vyhnout:** otevřenou peněženku neotáčet dnem vzhůru, protože volné karty vypadnou (stejně
jako v kole 3). **Karta omylem vložená do oddílu bankovek** by tam proužkem dolů ležela přímo za
magnetem (~3,5 mm). Proto platí pravidlo **„karty s proužkem vkládat proužkem k horní hraně (k víčku)“**:
omylem vložená karta má pak proužek ≥ 19,9 mm nad magnetem (≥ 18,9, když dno bankovek leží o 1 mm
níž; oddíl 4.2). Přeplněnou peněženku (plný stav C a k tomu karta v bankovkách) návrh nepokrývá
(riziko R12). Návod na
to upozorní (krok 22), ale **za vyřešené to nepovažujeme**: pravidlo se dá porušit a je to pořád
otevřené riziko R4, které doma ověří jen volitelná zkouška V5 (oddíl 11, důkladné ověření). Boky D1 jsou přilepené k F (G2b), takže kolem boků se
karta k bankovkám nedostane.

---

## 3. Finální rozhodnutí proti kolu 3 (a proč)

Tabulka shrnuje rozhodnutí z verze 1 po kontrole 3D modelu. Co se změnilo po dvou kontrolách verze 1,
je podrobně v oddílu 13.

| #   | Kolo 3 (F2)                                                        | Teď                                                                                                                                                                                | Proč / výpočet                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | karty vpředu; bankovky na třetiny a sloupec mincí vedle sebe vzadu | karty – **bankovky napůl na celou šířku** – **2 sloupce mincí** úplně vzadu                                                                                                        | rozhodnutí autora                                                                                                                                                                                                                                                                                                |
| 2   | magnet mezi pásy proužku (y 47,8–52,5), víčko končí nad kartami    | **magnet na jazýčku pod dnem karet** (y 5,2–21,8 ve všech stavech, k 1,0), plíšek pod dnem karet                                                                                   | Kontrola doporučila prodloužit víčko o ~3,3 mm. To nestačí: mezi pásy proužku zbývá pro střed magnetu s odstupem 7,9 jen 22,34 − 1,5 − 2 × 7,9 = **5,04 mm**, ale špička víčka se s plností posune o ΔP = 12,07 − 3,46 = **8,6 mm** (prázdná → plná se 4 mincemi, oddíl 4.1). Pod dnem karet žádný proužek není. |
| 3   | plech 0,5 zapuštěný do vybrání v rubu F                            | plíšek leží mezi F a D1 v lepeném pásu, **bez vybrání**, y 3,5–24 (obaluje magnet v celém okně lepení i při k max, ne jen 2 mm pod dnem karet)                                     | Ruční vybrání 14 × 17 do hloubky 0,5 je riskantní. Karty na plíšku nestojí.                                                                                                                                                                                                                                      |
| 4   | záplata 16 × 16 přes magnet (přečnívala jazýček 14 mm)             | **podšívka konce jazýčku L1** (useň 0,6), nalepí se s přesahem, ořízne načisto s jazýčkem 20 a obšije švem S7                                                                      | Nemůže přečnívat. Magnet má kolem sebe 6 mm lepení do stran a 3 mm ke špičce, šev S7 ho obchází do U 2 mm od kraje.                                                                                                                                                                                              |
| 5   | okénko bankovek 30 × 12 → stokoruna vyčnívala 5,5 mm               | **okénko 14 × 45** (do Kola 10 15 × 45) uprostřed zad skrz D2 + B, tah 30 mm                                                                                                       | Stokoruna 69 s dnem v y 2 má horní hranu v 71, po posunu o 30 v 101, tedy **19 mm nad ústím** (82,0). Šířka 14 ≤ Ø 20 − 5 = 15 (rezerva 6 mm do Ø mince), mince 1 Kč okénkem nepropadne; konce výsečníkem Ø 14 (Kolo 11).                                                                                        |
| 6   | sloupec mincí y 2,5–78, samotná mince ujela ~56 mm                 | **dno mincí y 23**, sloupec 57 (2 × 27,5 + 2,0)                                                                                                                                    | Plný sloupec má vůli 2,0–3,3 mm. Samotná mince ujede 30,75 (50 Kč) až 38,6 (1 Kč). To se neřeší za cenu velikosti, jen ověří (P2-8).                                                                                                                                                                             |
| 7   | pod dnem karet uvedeno 4,8 (kontrola: 7,61)                        | přepočteno po pásech: **3,7** (dole, plná) a **7,9** (místo magnetu, plná)                                                                                                         | Pod dnem karet jsou jen F, D1, bankovky a B, v místě magnetu navíc jazýček, magnet, L1, plíšek a spodek D2 (oddíl 7).                                                                                                                                                                                            |
| 8   | výška 79 (kontrola: 80,7 s ohybem dna a závěsem)                   | **83,5** včetně ohybu dna, zvednutí karet na klínu dna a tloušťky závěsu                                                                                                           | strop = max(dno bankovek 2 + 74 + 3; dno karet 26 + ½ · 4,56 + 53,98 = 82,26) → 82,5; + závěs 1,0 (oddíl 5.1)                                                                                                                                                                                                    |
| 9   | vějíř karet ~6° neřešen                                            | spočteno: 6,3° celá karta, 11,3° nad přední stěnou → **test V10**                                                                                                                  | 85,6 · cos θ + h · sin θ = 91 (kapsa mezi G2b) pro h = 53,98 a 36                                                                                                                                                                                                                                                |
| 10  | 1 přepážka D ve švech (F + D + B)                                  | D1 přilepená dole (G2) a u boků (G2b) a **sešitá** švem S6, D2 ve švech                                                                                                            | S D1 ve švu by byly 4 vrstvy. Všechny švy mají nejvýš 3 vrstvy.                                                                                                                                                                                                                                                  |
| 11  | závěs „tvarovaný, aby stál“                                        | závěs **1,0 bez ztenčení (Kolo 6), plochý se dvěma přehyby**, od Kola 9 tvarovaný **zavřený přes obsah stavu B** bez kopyta a opěrky; zálohy 0,8 a 0,6 podle V12 a zkušebního kusu | oddíl 5.8. Plochý vrch dá k ≈ 1,0 (magnet se posouvá jen o přírůstek obsahu, k měří krok 16). Otevřené víčko samo nestojí, drží ho palec (rozhodnutí kola 9; dřív mezipoloha Z2, oddíl 13).                                                                                                                      |

---

## 4. Návrhové výpočty

### 4.1 Poloha víčka podle plnosti

Závěs obepíná **všechno, co je pod ním**: D1 + D2 + karty + bankovky **+ horní mince sloupce**, když
sahá ke stropu (plný sloupec 2 × 50 Kč má horní minci v y ~51,8–79,3, po posunu až 82,5; závěs začíná
v y 81,5). Proto:

T = 2 · t_D + n_k · t_k + t_bn + t_c,top, kde t_bn = 0,2 · n_bn + 0,5 (0,1 na list krát 2 listy napůl,
plus 0,5 rezerva přehybu, **ověřit posuvkou na 10 bankovkách**) a t_c,top = 2,5, když je horní mince
pod závěsem, jinak 0.

**Geometrie závěsu je jedna: plochý vrch se dvěma přehyby** (vnitřní poloměr r_i = 1,0 je
předpoklad; od Kola 9 se závěs tvaruje přes obsah stavu B bez kopyta, skutečný tvar zachytí k z kroku 16). Závěs má od Kola 6 tloušťku t_h = 1,0 (bez ztenčení), poloměr střednice je tedy
r_m = r_i + t_h / 2 = 1,5 (se ztenčením na 0,6 byl 1,3). Délka závěsu po střednici, kterou obsah
spotřebuje:

- když T + t_h ≥ 2 r_m, tedy T ≥ 2 r_i = 2,0: P(T) = (T + 1,0) + (π − 2) · 1,5 = T + 2,712 (dva
  čtvrtoblouky a plochý vrch, **k = 1,0**),
- když je obsah tenčí (T < 2,0), vrch se zúží na půlkruh: P(T) = π · (T + 1,0) / 2.

| Stav                                          | T    | P(T)   |
| --------------------------------------------- | ---- | ------ |
| A prázdná                                     | 1,20 | 3,456  |
| 1 karta                                       | 1,96 | 4,650  |
| **B** (2 karty, 1 bankovka, 1 mince dole)     | 3,42 | 6,132  |
| B podle briefu (4 karty, 2 bankovky, 3 mince) | 5,14 | 7,852  |
| B, mince posunutá ke stropu (Bm)              | 5,92 | 8,632  |
| **C** (6 karet, 3 bankovky, 4 × 50 Kč)        | 9,36 | 12,072 |

Rozdíly, na kterých závisí poloha magnetu, se proti závěsu 0,6 skoro nemění (P_B − P_A = 2,676 místo
2,677, P_C − P_B = 5,94 beze změny), protože nad T ≥ 2,0 roste P(T) s obsahem stejně. Delší je jen
samotný závěs (o 0,63 ve stavu B) a o 0,4 vyšší vnější vrch peněženky. Záloha A (celý P1 0,8):
r_m = 1,4, P(T) = T + 2,398; záloha B (závěs ztenčený na 0,6): r_m = 1,3, P(T) = T + 2,084 (oddíl 5.8).

Magnet se lepí **na hotové peněžence ve stavu B** do y_m,B = 11,9 (krok 18, poloha se určí v kroku 17).
Tím odpadne tolerance střihu i tvarování. Pak **y_m = y_m,B + k · (P(T) − P(T_B))**, návrh k = 1,0.
Kdyby se závěs nevytvaroval plochý a byl spíš kulatý, k naroste až k π/2. Generátor proto kontroluje
i k = 1,24 a teď (po nezávislém ověření, oddíl 13) hlídá, že plíšek obalí magnet **v celém rozsahu
k 1,0–1,24**, ne jen při k = 1,0 – dřív se to kontrolovalo jen do čáry dna karet, ne do konce plíšku.
**P0-3 k změří.**

### 4.2 Magnet a proužek karty

Dno karet (čára lepení G2 a šev S6) je v y_cf = 26,0. Nejnižší možná hrana proužku je u karty, která
sedí přímo na čáře (bez zvednutí na klínu): **y 26,0 + 5,54 = 31,54**.

| Stav           | y_m (k 1,0 / 1,24) | vršek magnetu (k 1,0 / 1,24) | odstup od proužku (k 1,0 / 1,24) | pole (odhad, k 1,0 / 1,24) |
| -------------- | ------------------ | ---------------------------- | -------------------------------- | -------------------------- |
| A              | 9,22 / 8,58        | 13,22 / 12,58                | (bez karet)                      | –                          |
| 1 karta        | 10,42 / 10,06      | 14,42 / 14,06                | 21,1 / 21,5                      | 0,9 / 0,9 mT               |
| B              | 11,90              | 15,90                        | 19,6                             | 1,1 mT                     |
| B podle briefu | 13,62 / 14,03      | 17,62 / 18,03                | 17,9 / 17,5                      | 1,5 / 1,6 mT               |
| Bm             | 14,40 / 15,00      | 18,40 / 19,00                | 17,1 / 16,5                      | 1,7 / 1,9 mT               |
| **C**          | **17,84** / 19,27  | 21,84 / 23,27                | **13,7** / 12,27                 | **3,38** / 4,69 mT         |

Vršek magnetu zůstává ve všech stavech i při k 1,24 celý na plíšku (y do 24,0, s rezervou 0,5 tedy do
23,5; oddíl 4.3) – to je oprava z nezávislého ověření (SF1, oddíl 13): dřív kontrola hlídala jen dno
karet, ne konec plíšku, a vršek magnetu ve stavu C při k 1,24 plíšek přečníval o 0,8 mm.

Odhad pole: dipól m = B_r · V / μ₀ = 1,45 · (π · 4² · 1,5 · 10⁻⁹) / (4π · 10⁻⁷) ≈ 0,087 A·m²
(B_r 1,45 T je předpoklad pro třídu kolem N42–N52, **ověřit u prodejce**). Střed magnetu leží
0,75 + 0,6 (L1) + 1,0 (F) = 2,35 před rovinou přední karty. Stav C: r = √(13,7² + 2,35²) = 13,90 mm,
B ≈ 10⁻⁷ · m / r³ · √(1 + 3 cos²θ) ≈ **3,38 mT**. U LoCo karet se uvádí ≈ 300 Oe
(≈ 30 mT), u HiCo ≈ 2 750 Oe (hodnoty z kola 2, ověřit). Rezerva je ≈ 9× pro LoCo. Dipól je v této
vzdálenosti jen hrubý model (±30 %). **Stínicí účinek plíšku se nepočítá, ověřit ho jde jen volitelnou zkouškou V5.**

**Mince:** magnet je v x 46,5–54,5, sloupce mincí končí v x 35 a začínají v x 66. Bočně je to
11,5 mm od kraje magnetu, navíc ~5 mm v z (za kartami a bankovkami).

**Pozor – karta v oddílu bankovek (R4):** stojí na dně bankovek y 2,0 (δ = 0). Od magnetu ji v
tloušťce dělí magnet/2 + L1 + F + plíšek + D1 = 0,75 + 0,6 + 1,0 + 0,5 + 0,6 = **3,45 mm**
(`misplacedCard.dzMm`). Model počítá oba způsoby vložení (`misplacedCard`):

- **proužkem dolů:** proužek leží v y 2,0 + 5,54 až 2,0 + 15,82, tedy 7,54–17,82, přesně ve výšce
  magnetu (ve všech stavech i při k 1,24 y 4,58–23,27). Je přímo za magnetem ve vzdálenosti ~3,5 mm.
  Dipólový odhad tu neplatí (vzdálenost je menší než poloměr magnetu). Plíšek 0,5 pod magnetem Ø 8 se
  nejspíš nasytí (ověřit), stínění je nejisté.
- **proužkem k horní hraně:** spodní hrana proužku je v y 2,0 + 53,98 − 15,82 = **40,16**. Zbloudilá
  karta je sama obsahem pod závěsem, takže zvedne víčko o k · 0,76. Nejvýš je magnet ve stavu C s touto
  kartou navíc při k 1,24: 19,27 + 1,24 · 0,76 = **20,21** (`misplacedCard.magnetHighWithCardY`). Odstup
  je tedy 40,16 − 20,21 = **19,95 mm**. Když dno bankovek leží o 1 mm níž (tolerance 1,0–2,0 z oddílu
  4.4), je to 18,95. Plíšek končí v y 24,0, u proužku v y 40 tedy není: Δz = 0,75 + 0,6 + 1,0 + 0,6 =
  **2,95** (plíšek tu není). Odhad pole ≈ 1,1 mT (dipól, neodstíněno, ověřit, volitelně V5). Kontrola v kódu
  hlídá, že i horší z obou čísel je ≥ 7,9. Pozn.: stav C s kartou navíc je nad kapacitou (7 karet
  pod závěsem); vršek magnetu je pak 24,21, tedy nad koncem plíšku 24,0. **Přeplněná peněženka je
  mimo rozsah návrhu** (rozhodnutí kola 6, riziko R12, oddíl 8).

Z toho plyne pravidlo **„karty s proužkem vkládat proužkem k horní hraně (k víčku)“** (upozornění
v návodu, krok 22). Slovo „nahoru“ se nepoužívá, protože se dá vyložit jako „proužkem ven“. Pravidlo
chrání jen při omylu, tedy právě když uživatel nedává pozor, a týká se jen karet s magnetickým
proužkem (hlavně hotelové a parkovací). Správně vložená karta má pak v kapse karet proužek ≥ 44,8 mm
nad magnetem, ale leží v y ~64,2–76,7 (26,0 až 28,3 + 53,98 − 15,82 / − 5,54), celý nad hranou F
(62,0), tedy v pásu, za který kartu prsty berou. Proužek se tak při každém vytažení odírá – zahrnuto
do V5(a). Kontroly v tabulce výše přitom dál počítají s horším případem (proužek dole), pravidlo je
rezerva navíc, ne ochrana ani podmínka návrhu. Karta v bankovkách proužkem dolů zůstává **otevřené
riziko**, ověřit ho jde jen volitelnou V5 (oddíl 11, důkladné ověření).

### 4.3 Plíšek pokryje magnet ve všech stavech (i při k max – oprava SF1)

Magnet Ø 8 musí ležet celý na plíšku **v celém rozsahu k 1,0–1,24**, nahoře i dole s rezervou 0,5
(jedna podmínka pro dokument i kód: vršek ≤ y_pl2 − 0,5 a spodek ≥ y_pl1 + 0,5, počítaná zvlášť pro
k 1,0 i pro k 1,24; rezervu dole kód hlídá od Kola 7). Nezávislé
ověření (SF1, oddíl 13) našlo, že stará verze hlídala jen k = 1,0 – při k 1,24 vršek magnetu ve stavu C
přečníval tehdejší konec plíšku o 0,8 mm. Hodnoty po Kole 6 (ohyb dna a závěs 1,0 bez ztenčení, L1 0,6):

- spodní hrana plíšku se počítá z nejnižší možné polohy magnetu: stav A při k 1,24 a magnet
  nalepený na spodní mez okna y_m,B,min 11,73 (níž): 11,73 − 1,24 · 2,676 = 8,41, y_pl1 =
  ⌊8,41 − 4 − 0,5⌋₀,₅ = **3,5** (Kolo 7; dřív ⌊9,22 − 4 − 0,5⌋₀,₅ = 4,5 jen ze stavu A při k 1,0),
- nejníž (A, k 1,0): y_m = 9,22 → spodek magnetu 5,22 ≥ 3,5 + 0,5 = 4,0 ✓,
- nejníž (A, k 1,24): y_m = 8,58 → spodek 4,58 ≥ 4,0 ✓ (k hraně plíšku 1,08, dřív jen 0,08),
- nejvýš (C, k 1,0): y_m = 17,84 → vršek 21,84 ≤ 24,0 − 0,5 = 23,5 ✓,
- nejvýš (C, k 1,24): y_m = 19,27 → vršek 23,27 ≤ 23,5 ✓ (rezerva 0,23 mm), hlídané kódem,
- **plíšek y 3,5–24,0 (20,5 mm)**, x 43,5–57,5 (14 mm = Ø 8 + 2 × 3 boční tolerance, oddíl 12.2), horní
  hrana **2,0 pod dnem karet**, takže karty na plíšku nestojí. Proti Kolu 6 (14 × 19,5, y 4,5–24,0)
  je plíšek o 1 mm delší dolů (Kolo 7, oddíl 13), leží pořád na rovné části F (od y 1,75). Do
  vyznačeného pásu ohybu 8 mm (na F do y 3,79) zasahuje o 0,29: ve výchozím střihu se tam nic
  neztenčuje a G2 tam lepí taky, v záloze B se ztenčeným ohybem leží spodních ~0,2 mm plíšku na
  náběhu ztenčení – ověřit na prototypu,
- vršek magnetu je ve stavu C **4,16 pod čarou dna karet** (návrhové minimum 2,5, teď se ale řídí
  podmínkou plíšku při k 1,24, ne touhle). Svazek karet ale sedí na klínu dna výš (odhad 28,3), takže
  schod F nad kartami začíná ~6,4 mm nad magnetem. Držení magnetu se proto posuzuje na zkušebním
  kusu, kde schod je (volitelná V4 na sestavě se schodem),
- špička jazýčku leží 7,0 pod středem magnetu. Nejníž je v y 2,22 (A, k 1,0), tedy na rovné části přední
  stěny (ta začíná v y 1,75 = vložka 0,75 + ohyb 1,0) s rezervou 0,47. Při k 1,24 klesne špička ve
  stavu A na y 1,58 – to už je pod začátkem rovné části (1,58 < 1,75), ale pořád nad spodní hranou
  (0,5, kontrola v kódu) – **viz nit 1, oddíl 13**.

Jak vzniklo dno karet 26,0: nejnižší poloha magnetu ve stavu B, aby špička ve stavu A ležela na rovné
části F: y_m,B,min = 1,75 + 0,3 + 7,0 + (6,132 − 3,456) = 11,73. Podmínka „vršek magnetu ve stavu C je
při k 1,0 aspoň 2,5 pod dnem karet“ dává ⌈11,73 + 5,94 + 4 + 2,5⌉₀,₅ = 24,5. Přísnější je podmínka
plíšku při k 1,24: dno karet = ⌈11,73 + 2,0 + 0,5 + 4 + 1,24 · 5,94⌉₀,₅ = ⌈25,59⌉₀,₅ = **26,0** (se
ztenčeným ohybem dna 0,6 to bylo ⌈25,20⌉₀,₅ = 25,5; neztenčený ohyb posune rovnou část F o 0,4 výš
a dno karet tím přeskočí na další půlmilimetr). Nejvyšší poloha magnetu ve stavu B je pak
min(26,0 − 2,5 − 4 − 5,94; 26,0 − 2,0 − 0,5 − 4 − 1,24 · 5,94) = min(13,56; 12,13) = **12,13** (druhá
podmínka, plíšek při k max, je přísnější). Návrh bere střed rozsahu ⟨11,73; 12,13⟩ zaokrouhlený na 0,1:
**y_m,B = 11,9**. Plíšek y 3,5–24,0 obalí magnet s rezervou 0,5 nahoře i dole **v celém tomto okně**
a při k 1,0 i 1,24 (Kolo 7). Při lepení v kroku 18 tedy stačí trefit 11,9 s odchylkou −0,17 / +0,23
(tolerance rýsování ±0,3 z oddílu 6 se do okna vejde jen zčásti, proto se značka v kroku 17 dělá
pečlivě a kontroluje). Když se magnet posune víc, platí všechno dál, jen se zmenší rezerva nahoře
(stav C při k 1,24) nebo dole (stav A při k 1,24) – ověřit P2-5.

**Záloha A (celý P1 z usně 0,8, bez ztenčení):** rovná část F od y 1,55,
y_m,B,min = 1,55 + 0,3 + 7,0 + 2,677 = 11,53, dno karet ⌈25,39⌉₀,₅ = **25,5**, rozsah ⟨11,53; 11,63⟩ → **y_m,B = 11,6**, plíšek
y 3,5–23,5 (20 mm; do Kola 6 4,0–23,5). Magnet (k 1,0 / 1,24): A 8,92 / 8,28, B 11,6, Bm 14,1 / 14,7, C 17,54 / 18,97; vršek ve
stavu C při k 1,24 je 22,97 ≤ 23,0 (rezerva jen 0,03 mm), spodek ve stavu A při k 1,24 4,28 ≥ 3,5 + 0,5.
Proužek ve stavu C 13,5 / 12,07 ≥ 7,9. Kontroly modelu projdou (`pnpm pattern:wallet-lid --p1 0.8`,
test v modelu); rozsah pro lepení magnetu je ale úzký (0,1 mm), polohu stejně určí hotový kus
(krok 17).

### 4.4 Bankovky – vejdou se? (odpověď na dotaz autora)

**Ano, všechny.** Rozměry jsou převzaté z repozitáře a před střihem se **ověří posuvkou**.

| Bankovka | Celá     | Napůl   | Boční vůle v 93 | Horní hrana (dno 1,0–2,0) | Pod ústím D2 82,0 | Po posunu okénkem o 30 |
| -------- | -------- | ------- | --------------- | ------------------------- | ----------------- | ---------------------- |
| 100 Kč   | 140 × 69 | 70 × 69 | 23              | 70–71                     | 11–12             | vyčnívá **19**         |
| 200 Kč   | 146 × 69 | 73 × 69 | 20              | 70–71                     | 11–12             | **19**                 |
| 500 Kč   | 152 × 69 | 76 × 69 | 17              | 70–71                     | 11–12             | **19**                 |
| 1000 Kč  | 158 × 74 | 79 × 74 | 14              | 75–76                     | 6–7               | **24**                 |
| 2000 Kč  | 164 × 74 | 82 × 74 | 11              | 75–76                     | 6–7               | **24**                 |
| 5000 Kč  | 170 × 74 | 85 × 74 | 8               | 75–76                     | 6–7               | **24**                 |

Poslední sloupec je z modelu (`billProtrusionMm`, dno napevno 2,0), proto je pro obě výšky bankovky
jedno číslo, ne rozsah; sloupec „Pod ústím“ pořád ukazuje rozsah, protože počítá s tolerancí dna 1,0–2,0.

- Vysoká bankovka 74 má nahoře 6,5 mm do stropu (82,5) a 5,5 mm pod horní hranou D1 (81,5). Závěsu se
  nedotkne.
- Nízká 69 leží o 5 mm hlouběji, proto se nevytahuje prsty shora, ale **okénkem zezadu 14 × 45**
  (x 43,5–57,5, y 25–70, konce R7 výsečníkem Ø 14, středy y 32 a 63; do Kola 10 15 × 45 s Ø 15,
  který CraftPoint nenabízí). Délka se nemění, proto tah i vyčnívání zůstávají. Bříško prstu se dotýká na ~15 mm (odhad 12–15, ověřit), tah je
  45 − 15 = **30 mm**. Okénko je nad spodní hranou D2 (18) i nad S1 (22, odstup 3 mm = minimum kontroly).
- Každá bankovka široká ≥ 70 překryje v kapse x 4–97 vždy pás x 27–74 (97 − 70 až 4 + 70), tedy celé
  okénko. Okénko je od švů sloupců S2/S3 (x 36 a 65) **7,5 mm** (dřív 7), od sloupců mincí (x 35 a 66) 8,5 mm,
  od švu S1 (y 22) 3 mm a leží celé v lepeném středu D2 + B. Mince 1 Kč Ø 20 okénkem 14 nepropadne
  (kontrola modelu: šířka ≤ Ø − 5).
- Míchat nominály jde (např. 5000 + 100 Kč). Tloušťka 3 bankovek napůl ≈ 1,1 (ověřit).

### 4.5 Mince

Sloupec: světlá šířka **31,0** = Ø 27,5 + t 2,5 + vůle 1,0. Stěny D2 i B jsou u obou okrajů přilepené,
takže aby obalily minci, potřebuje každá ≥ Ø + t (stejné pravidlo „šířka + tloušťka obsahu minus vůle“
jako u kapsy karet). Délka od dna y 23,0 po strop 82,5, zmenšená o zvednutí mince na klínu dna (horší
případ 1,0 · 2,5): 82,5 − 23,0 − 2,5 = **57,0 ≥ 2 × 27,5 + 1**. Vejdou se 2 mince nad sebou, celkem
**4 mince**. Tři 1 Kč (60) se nevejdou.

- Okénko v B: **12 × 48** (y 28–76, konce R6), uprostřed sloupce (x 13,5–25,5 a 75,5–87,5).
  Šířka 12 < Ø 20 nejmenší mince, takže mince okénkem neprojde.
- **Horní mince (plný sloupec):** spodní mince sedí od 23,0 + 1,25 (klín, odhad) = 24,25, horní od 51,75.
  Palec (dotyk ~12) ji posune o 76 − (51,75 + 12) = 12,25 (76 = poslední otvor sloupce, oddíl 5.6).
  Horní hrana je pak v y 91,5, **9,5 mm nad ústím** (D2 82,0), tětiva 2 · √(9,5 · 18) ≈ 26 mm se dá
  chytit. Posunem spodní mince horní vyjede celá.
- **Samotná mince:** ujede 82,5 − 24,25 − 27,5 = 30,75 (50 Kč) až 38,6 (1 Kč) a může cinkat. Neřeší se
  za cenu velikosti, **ověří se (P2-8)**.
- **Prázdný sloupec:** D2 leží na B, sloupec je plochý (1,6 mm).

### 4.6 Výřez pro palec v horní hraně F (kolo 4, zúžený v kole 5, ověřit na papírovém modelu P0)

Autor schválil výřez uprostřed horní hrany F a v kole 6 rozhodl, že **výřez je pomůcka jen pro
přední kartu**. Palec ve výřezu sáhne na líc přední karty. Když na ni tlačí, posouvá svazek dozadu
k D1, ne dopředu, takže tlakem na líc se přední karty dopředu neodkloní. Výřez dá dvě věci: přední
karta je na ose vidět o 12 mm víc a dá se **palcem vysunout třením nahoru**. K zadním kartám výřez
přístup nedává: zadní kartu vytáhneš tak, že přední karty vyndáš. Rovinný vějíř v kapse 91 dává jen
6,3° (oddíl 8, otázka 6). Jiné řešení pro zadní karty (poutko, pásek pod svazkem) se nehledá
(rozhodnutí kola 6, oddíl 13).

**Tvar (list 1 a 2, vrstva CUT):** U na ose x 50,5. Dno je půlkruh R5 z výsečníku Ø 10 (střed y 55,0,
na P1 v 7,0), nad ním rovné boky nožem až k hraně F, rohy ústí vypouklé R1 (zaoblit brusným papírem).
Výřez je x 45,5–55,5, dno y 50,0 (v 12,0), s rohy ústí x 44,5–56,5.

**Rozměr z modelu (`thumbNotch`, vstupy `thumbNotchWidthMm`, `thumbNotchDepthMm`):**

- šířka **10**: rohy ústí musí přikrýt i jazýček posunutý bočně o celou boční toleranci magnetu 3 mm
  (plíšek je 14 = Ø 8 + 2 × 3 právě kvůli ní, oddíl 4.3, 12.2) a ještě s rezervou 1 mm. Rohy x 44,5
  a 56,5 jsou od boků jazýčku (40,5 a 60,5) **4 mm = 3 + 1**. Původní U 12 × 12 s rohy R2 mělo u rohů
  jen 2 mm a jazýček posunutý o 3 mm by přejížděl přes roh výřezu (nález kola 5),
- hloubka **12** (beze změny): přední karta je na ose vidět 18,36 + 12 = **30,4 mm** (1 karta) až
  20,26 + 12 = **32,3 mm** (6 karet, na klínu dna),
- rozměry výřezu jsou teď samostatné vstupy. Dřív byly svázané s dotykem palce `thumbContactMm` (12),
  ze kterého se počítá i posun horní mince okénkem sloupce (oddíl 4.5). Úprava výřezu podle P0-4 tak
  posun mince nezmění. Bříško palce (odhad 12) do výřezu 10 zapadne jen zčásti – **ověřit P0-4**.

**Hranice (hlídá je kontrola v kódu):**

- **Víčko výřez vždy přikryje souvislou kůží, i posunuté bočně o 3 mm.** Kontrola: odstup rohů ústí
  od boků jazýčku ≥ boční tolerance 3 + rezerva 1. Pás víčka v ose plynule pokračuje do jazýčku, jeho
  spodní hrana je jen za vydutým napojením R4 (x < 36,5 a > 64,5). Hrana pásu víčka proto nad výřezem
  neleží v žádném stavu (A 53,88, B 56,56, C 62,5; při k 1,24 53,24–63,93), nemá o co zachytit.
- **Magnet ani špička nad výřezem neleží.** Vršek magnetu je nejvýš v y 23,27 (C, k 1,24), špička
  nejvýš v y 12,27, dno výřezu 50,0. Magnet je od výřezu ≥ 26 mm (kontrola chce ≥ 3). Šev S7 na
  jazýčku (horní řada 14 nad špičkou, nejvýš y 26,3) leží taky pod dnem výřezu.
- **Zavírání:** jazýček přejíždí přes výřez. Je širší (20) než výřez (10), do výřezu může klesnout jen
  konec špičky R10, který je užší než 10, tedy 10 − √(10² − 5²) = **1,34 mm** od špičky. To je celé
  v ztenčeném klínu 2,5 (kontrola: ≤ ztenčení špičky). Když je jazýček posunutý bočně o 3 mm, visí nad
  výřezem jedna strana konce na 10 − √(10² − 8²) = **4,0 mm** (`tipNarrowerShiftedMm`), druhá leží na
  F – ověřit P0-4. Limit poklesu „nejvýš o tloušťku F (1,0) na líc přední karty“ platí **jen při
  plném svazku**, který přední kartu zezadu drží. Ve stavu A (bez karet) je za výřezem jen volná D1
  (lepí se jen G2b u boků), při 1–2 kartách s málo bankovkami volná karta. Tlak ruky při zavírání je
  může vtlačit dozadu a konec špičky může klesnout pod vnitřní líc F, zachytit se o dno U zespodu nebo
  zajet za F do kapsy karet. **Nejhorší je stav A a 1 karta**, proto je P0-4 a P2-7 zkoušejí výslovně.
  Když špička zajíždí: zkosit i vnitřní (rubovou) hranu dna U, zkrátit ztenčený klín tak, aby užší
  konec špičky nebyl tenčí než F, nebo výřez dál zúžit (v mezích tohoto oddílu).
- **Boky kapsy a švy:** pásy G2b (x 4–5 a 96–97), G4 (x 0–4 a 97–101) a švy S4/S5 (x 3 a 98) jsou od
  rohů výřezu 39,5 mm a víc (kontrola chce ≥ 30 od vnitřní hrany G2b). Horní hranu F drží u boků G4
  a zdvojený steh 60–64. S6 (y 25) je 25 mm pod dnem výřezu. Pevnostně výřez F neoslabuje: dno
  R5 je oblé, bez vrubu, a tah karet napíná F od ohybu dna.
- **Horní hrana F u výřezu:** výřez rozdělí volnou horní hranu F na dvě části po ~40 mm (x 4–44,5
  a 56,5–97). Při plném svazku se konce u výřezu můžou časem odklopit dopředu („ouška“) a hrana se
  zvlní, což by zhoršilo vzhled i dosednutí jazýčku. Zmírnění: hranu důkladně vyleštit a zpevnit
  (krok 6), vyztužovat se nemusí. Ověřit P2-7 po 50 cyklech.
- **Retence karet se nemění.** Drží je boky G2b, sešité dno a zavřené víčko (oddíl 2), výřez neubírá
  ani jedno a při zavřeném víčku přes něj leží jazýček. Karta (85,6) výřezem neprojde, mince 1 Kč
  (Ø 20) taky ne, výřez vede jen do kapsy karet. F na ose drží kartu 50 − 26 = 24 mm nad dnem
  karet, víc než polovinu hloubky kapsy (18, návrhové pravidlo v kódu), mimo výřez celých 36. Karta
  s vystouplým písmem nebo prohnutá karta se při zasouvání v pruhu výřezu vrací z otvoru pod F a může
  se zachytit o vnitřní hranu dna U, proto se zkosí a zaoblí i ta (krok 6) a P0-4 to zkouší.
- **Tloušťka:** v pásu S na ose ubude nad y 50 vrstva F (1,0), nejtlustší místo 11,36 se nemění.

**Rizika (R11):** jazýček leží přes výřez a může se do něj časem vtlačit (důlek na líci víčka),
špička se o hranu výřezu může zachytit a hrana F u výřezu se může odklopit. Tuhost a tloušťku kůže
papírový model P0 neukáže, proto se výřez ověří na **zkušebním kusu** (Z-3, podrobněji P2-7, oddíl 11);
zkouška V11 na odřezku je jen volitelná (důkladné ověření). Když výřez nepomůže, dá se vynechat, nic jiného na
něm nezávisí.

---

## 5. FÁZE 6 – technický návrh

### 5.1 Celkové rozměry

| Rozměr       | Hodnota                                  | Výpočet                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Šířka W      | **101,0**                                | kapsu tvoří F a D2 slepené v G4, uvnitř jsou karty, D1 i bankovky: 85,6 + (6 · 0,76 + 0,6 + 1,1) + 0,8 = 92,66 → 93,0. Kapsa karet mezi pásy G2b potřebuje 85,6 + 6 · 0,76 + 0,8 = 90,96 → 91,0, s pásy 2 · g navíc 93,0. W_c = max(93,0; 93,0) = **93,0**; W = W_c + 2 · (e 3,0 + g 1,0) = 101,0. Pro 5 karet: max(92,0; 90,5 + 2,0) = 92,5, W 100,5 (oprava kola 4) |
| Kapsa karet  | 91,0 (x 5–96)                            | mezi boky D1 přilepenými v G2b: 91 ≥ 85,6 + 4,56 + 0,8 = 90,96 (teď je to přímo druhý člen W_c, oddíl 13, Kolo 4)                                                                                                                                                                                                                                                     |
| Výška H      | **83,5**                                 | strop y_ceil = ⌈max(2,0 + 74 + 3,0; 26,0 + 0,5 · 4,56 + 53,98)⌉₀,₅ = ⌈82,26⌉ = 82,5; + závěs 1,0 (bez ztenčení). Když P0-6 změří zvednutí karet ≈ 0, strop 80,0 a H 81,0                                                                                                                                                                                              |
| Tloušťka     | 4,2 (6,2) / 7,92 / **11,36** (A / B / C) | oddíl 7                                                                                                                                                                                                                                                                                                                                                               |
| Dno karet    | y_cf = 26,0                              | z polohy magnetu a plíšku (oddíl 4.3, SF1; neztenčený ohyb dna ho posunul z 25,5). Karty na klínu lepení sedí odhadem o ½ · tloušťky svazku výš (6 karet: 28,3), **měřit P0-6**                                                                                                                                                                                       |
| Přední stěna | horní hrana y_Ft = 62,0                  | y_cf + hloubka kapsy 36. Vyčnívání přední karty 62,0 → 18,4 (1 karta) až 20,3 (6 karet)                                                                                                                                                                                                                                                                               |
| Výřez F      | U 10 × 12, x 45,5–55,5, dno y 50,0       | šířka 10 (rohy 4 mm od boků jazýčku = boční tolerance 3 + rezerva 1), hloubka 12; dno R5 výsečníkem Ø 10, rohy ústí R1; ve výřezu je přední karta vidět 30,4–32,3 (oddíl 4.6)                                                                                                                                                                                         |
| Dno mincí    | y 23,0                                   | 3,0 pod dnem karet; spodní šev S1 y 22,0 + lepení 1,0; spodní hrana D2 y 18,0 leží mezi otvory bočního švu (16 a 20)                                                                                                                                                                                                                                                  |
| Závěs        | od y 81,5                                | y_ceil − r_i 1,0                                                                                                                                                                                                                                                                                                                                                      |
| Rohy dole    | hranaté                                  | rozhodnutí kola 6: spodní rohy se nezaoblují, hrana se jen zabrousí a vyleští (zaoblení R4 jen volitelně, oddíl 5.5)                                                                                                                                                                                                                                                  |

### 5.2 Díly

| ID     | Název / funkce                                                                                   | Rozměr střihu                                                                                                                                                  | Tloušťka, ztenčení                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Materiál                                                                                                                                                                                                                                   | Orientace                                                            |
| ------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **P1** | pás: přední stěna F – ohyb dna – zadní stěna B (okénka) – závěs – pás víčka – jazýček s magnetem | **101,0 × 231,7**, jazýček 20 široký v v 175,0–231,7 (z toho 5 mm rezerva na ořez špičky), obrys v oddílu 5.3                                                  | 1,0 **bez ztenčení** (Kolo 6): ohyb dna za mokra přes vložku 1,5 s rýhou z rubu na ose v 62,21, hrana vložky na rubu B v 64,18 (Kolo 9; zkouška V12), závěs 1,0 (V12 a zkušební kus). Zálohy: A celý P1 z usně 0,8; B ztenčit pás ohybu nebo pás závěsu na 0,6 (krok 4) – **v-souřadnice pásů ber z listu 1 dané varianty** (tabulka v 5.8; ve výchozím střihu ohyb v 58,21–66,21, závěs v 142,99–150,99, v záloze jinde). Posledních **2,5 mm** špičky jazýčku do klínu brusným papírem (až po ořezu) | třísločiněná lícová useň (veg-tan), pevná, ne měkká nappa                                                                                                                                                                                  | líc ven (vnější strany F, B, víčka); rub dovnitř                     |
| **D1** | přepážka karty / bankovky; svým lepeným a sešitým pásem tvoří **zvednuté dno karet**             | **93,0 × 79,5**, horní rohy R3                                                                                                                                 | 0,6 ve výchozím střihu; koupenou useň změřit a listy vygenerovat pro skutečnou tloušťku (`--divider`, oddíl 12.4)                                                                                                                                                                                                                                                                                                                                                                                      | tenká třísločiněná useň; **horní hrana natřená barvou na hrany v tónu kontrastním k D1** (R4, přilnavost ověřit na odřezku)                                                                                                                | **rub dopředu** (lepí se rub na rub k F), **líc dozadu** k bankovkám |
| **D2** | přední stěna sloupců mincí a zadní stěna bankovek; střed a boky slepené s B                      | **103,0 × 64,0**, po sešití bočních švů se zarovná na 101,0                                                                                                    | 0,6; **spodní hrana ztenčená do nuly** (klín 3 mm, končí pod S1 – SF9), aby se o ni nezachytila bankovka                                                                                                                                                                                                                                                                                                                                                                                               | tenká třísločiněná useň **v tónu kontrastním k D1** (R4: ústí bankovek je vidět; dřív jen volitelně)                                                                                                                                       | **líc dopředu** k bankovkám, rub dozadu (lepí se na rub B)           |
| **L1** | podšívka konce jazýčku, kryje magnet                                                             | přířez 24 × 22, horní hrana 10 nad středem magnetu (ryska na šabloně, list 4), ořízne se načisto s koncem jazýčku (20 šířka, konec R10), pak se obšije švem S7 | **0,6** ve výchozím střihu, z nebarvené kozinky jako D1 (Kolo 6, 10.1; skutečnou změřit, krok 0), neztenčovat; mezera magnet–plíšek 1,6 (L1 0,6 + F 1,0), sílu ověří zkušební kus                                                                                                                                                                                                                                                                                                                      | useň                                                                                                                                                                                                                                       | líc k přední stěně                                                   |
| **K1** | magnet                                                                                           | **Ø 8 × 1,5**, axiálně magnetovaný                                                                                                                             | –                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | neodymový, niklovaný; **velikost, třídu a přídržnou sílu ověřit u prodejce**                                                                                                                                                               | na rubu jazýčku pod L1; polarita nehraje roli (protikus je ocel)     |
| **K2** | plíšek, kotva magnetu                                                                            | **14 × 20,5** (Kolo 7, dřív 19,5), rohy R3, hrany zabroušené a **přelakované**                                                                                 | 0,5 (varianta 0,8, oddíl 5.4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | magnetická ocel s povrchovou ochranou (pozinkovaná nebo lakovaná, nebo feritická nerez). **Austenitická nerez je prakticky nemagnetická, nepoužít.** Před koupí ověřit magnetem. Pro domácí dílnu: pozinkovaný ocelový plech 0,5 (krok 2). | mezi rubem F a D1                                                    |

Rozměry dílů v peněžence: D1 x 4–97, y 2,0–81,5. D2 x 0–101, y 18,0–82,0.

### 5.3 Rozvinutý pás P1 (souřadnice v od horní hrany F)

| Úsek           | v                             | Vztah k y peněženky     | Délka / poznámka                                                                                                                                                                  |
| -------------- | ----------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| přední stěna F | 0 – 60,25                     | y = 62,0 − v            | 62,0 − 1,75. Rovná část končí v y 1,75 = vložka/2 0,75 + ohyb 1,0.                                                                                                                |
| ohyb dna       | 60,25 – 64,18                 | –                       | vnitřní poloměr 0,75 (vložka 1,5 = obsah 1,1 + vůle). Ohyb 1,0 bez ztenčení: oblouk π · (0,75 + 0,5) = **3,93** (se ztenčením na 0,6 byl 3,30). Čára ohybu (rýha z rubu) v 62,21. |
| zadní stěna B  | 64,18 – 143,93                | y = v − 62,43           | 1,75 → 81,5                                                                                                                                                                       |
| závěs          | 143,93 – 150,06               | –                       | P(T_B) = 6,13 ve stavu B (závěs 1,0, r_m 1,5). Přehyby (osa čtvrtoblouků) v 145,10 a 148,88. Pás závěsu (nelepit, nešít) v 142,99–150,99.                                         |
| pás víčka      | 150,06 – 175,00               | y = 231,56 − v (stav B) | 24,94; spodní hrana pásu ve stavu B v y 56,56                                                                                                                                     |
| jazýček        | 175,00 – 226,66 (+5 → 231,66) | y = 231,56 − v (stav B) | šířka 20 (x 40,5–60,5), napojení na pás vyduté R4. Špička ve stavu B v y 4,9, magnet v v 219,66 (y 11,9).                                                                         |

Kontrola: 60,25 + 3,93 + 79,75 + 6,13 + 24,94 + 51,66 = 226,66 (+ 5 rezerva = 231,66). Proti verzi se
ztenčením (230,1) je P1 o 1,6 mm delší: oblouk dna o 0,63, závěs o 0,63 a F, B i jazýček každý o 0,1
(dno karet a strop jsou o 0,5 výš, rovná část F a B začíná o 0,4 výš). P1 se vejde na
list A4 na výšku (místo 297 − 2 · 8 − 14 − 30 = 237).

Délka pásu víčka vychází z podmínky, že **hrana pásu ve stavu C leží 0,5 nad horní hranou F**
(y_fe,C = 62,5): L_fm = 62,5 − 17,84 = 44,66 nad magnetem. Víčko tak v plném stavu nepřesahuje na F
nad mincemi a pruh 12,36 nevzniká.

### 5.4 Kování – poloha a zapuštění

| Prvek       | Poloha                                                                                | Jak se zapouští                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K2 plíšek   | rub F, x 43,5–57,5, y 3,5–24,0 (v 38,0–58,5)                                          | Nalepí se kontaktním lepidlem (přilnavost k oceli ověřit na odřezku) **až po mokrém ohybu dna** a přelepí se D1 (G2). Bez vybrání, vytvoří hrbolek 0,5 do oddílu bankovek. Hrany zabrousit a přelakovat (železo s vlhkou třísločiněnou usní dává tmavé skvrny). Šířka plíšku = Ø magnetu + 2 × 3 mm boční tolerance (oddíl 12.2), délka obaluje magnet v celém rozsahu k 1,0–1,24 (SF1) a v celém okně lepení magnetu, s rezervou 0,5 nahoře i dole (Kolo 7).                                                                                                                                                                                                                                                                                                                                                                                                      |
| K1 magnet   | rub jazýčku, střed na ose x 50,5, **7,0 nad špičkou**; na peněžence ve stavu B y 11,9 | Poloha se určí **na hotové peněžence** (krok 17): najít plíšek zkušebním magnetem, označit y_m,B z rámečku „Čísla pro postup“ na listu 4 (výchozí střih 11,9), přenést na rub jazýčku ryskami na bocích. Přilepit (krok 18, G5) spolu s L1 (G6). Magnet drží sevření pod L1 (≥ 6 mm lepení do stran, ≥ 3 mm ke špičce) a **šev S7 kolem L1** (výchozí od Kola 6, oddíl 5.6). Kontaktní lepidlo drží na niklu podle kontroly kola 5 špatně, proto se magnet lepí dvousložkovým epoxidem na zdrsněný rub jazýčku a L1 přes něj kontaktním lepidlem, **až když epoxid ztuhne** (krok 18; přilnavost ověří zkušební kus, volitelně V4(b) na odřezku). Magnet je přitahovaný do L1, takže L1 nese při každém otevření 2–4 N – výdrž ověří zkušební kus (volitelně cyklická V4(b) na odřezku se švem S7). Magnet se dá na hotovém kusu vyměnit (níže, „Výměna magnetu“). |
| L1 podšívka | rub konce jazýčku, horní hrana 10 nad středem magnetu (17 nad špičkou)                | Přířez 24 × 22 z usně 0,6 se přilepí přes magnet (přitlačit prsty nebo převalovat hladkým kolíkem, **přes magnet paličkou netlouct**, krok 18), dole přesahuje budoucí špičku o 5. Po zaschnutí se **jazýček i L1 seříznou najednou** podle šablony konce jazýčku (R10, krok 19) a obšijí švem **S7** (krok 20): 8 otvorů do U kolem magnetu, 2,1 mm od jeho kraje, ke špičce otevřené. Nemůže přečnívat.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Přídržná síla není spočtená, protože závisí na třídě magnetu a na mezeře **1,6** (L1 0,6 + F 1,0; se
L1 0,4 byla 1,4 – větší mezera sílu zmenší, o kolik, ukáže až zkušební kus). **Kritérium domácích
zkoušek (Kolo 8)** na zkušebním kusu: zavřené víčko vydrží zatřesení i otočení dnem vzhůru, drží
**proti pružení závěsu** a otevře se jedním prstem (závěs tvarovaný zavřený přes obsah vrací víčko
k zavřené poloze, magnet proti tomu nemusí nic držet – ověřit na zkušebním kusu). Čísla z kola 3
(odtržení kolmo 2–4 N, ve smyku ≥ 1,2 N) se měří jen ve volitelné V4. Když magnet drží slabě nebo moc
silně, vymění se za jiný magnet stejného Ø 8 (níže, „Výměna magnetu“). Další zálohy jsou magnet
Ø 10 × 2 nebo plíšek 0,8. **Záloha se nesmí jen vyměnit, musí se přepočítat:** větší poloměr magnetu
(5 místo 4) a d_mt 8,0 zvednou podle oddílu 4.3 dno karet na 28,0, strop na 84,5 (H 85,5), plíšek
y 3,5–26,0 (šířka Ø 10 + 2 × 3 = 16 mm; do Kola 6 4,5–26,0) a y_m,B na 12,9; odstup proužku ve stavu C je pak 14,7.
Tloušťka v místě magnetu vzroste na **8,4** (stále pod 11,36). Po Kole 6 ale model zálohu Ø 10
**odmítne**: vedle magnetu Ø 10 se v jazýčku 20 nevejde šev S7 (otvor ≥ 2 mm od magnetu a ≥ 3 od
hrany; vyjde až s jazýčkem 24 **a přířezem L1 ≥ 26**, protože přířez musí být aspoň o 2 širší než
jazýček; S7 pak má 9 otvorů a leží přesně na hranici 2,0 mm od kraje magnetu, 3,54 od hrany) a
P1 237,66 přeleze tiskovou plochu 237 – to je pak jediná kontrola, která neprojde. Kdyby zkušební kus zálohu Ø 10 opravdu
vyžádal, musí se rozšířit jazýček a zkrátit hlavička listu nebo tisknout P1 na dva listy (test
v modelu to hlídá).

**Plíšek 0,8 – přepočet (kolo 4, čísla po Kole 6):** model s tloušťkou plíšku 0,8 projde všemi
kontrolami a geometrie se nemění: dno karet 26,0, strop 82,5, H 83,5, plíšek y 3,5–24,0 i poloha
magnetu na tloušťce plíšku nezávisí. Změní se jen tloušťka v místě magnetu o 0,3 (stav A 6,2 → **6,5**,
C 7,9 → 8,2; nejtlustší místo 11,36 zůstává), hrbolek do oddílu bankovek 0,5 → 0,8 a odstup karty
omylem v bankovkách v tloušťce 3,45 → **3,75** (oddíl 4.2). **Přídržnou sílu ale model spočítat
neumí** (viz výše: závisí na třídě magnetu, na mezeře 1,6 a na tom, jestli se plíšek nasytí), takže se nedá
ukázat, že zůstane v cíli V4 **2–4 N**. Silnější plíšek se nasytí méně, síla tedy spíš vzroste než
klesne (ověřit), a horní mez 4 N hlídá, aby šlo víčko otevřít a L1 vydržela cyklické odtrhávání.
Proto **výchozí zůstává 0,5 a 0,8 je varianta**: do finálního kusu se 0,8 vezme, jen když na
zkušebním kusu nepomůže ani výměna magnetu Ø 8 (níže). Jestli 0,8 pak víčko udrží a jde otevřít
jedním prstem, je neověřené – **ověřit na prototypu** (volitelně V4(a) a (d) z odřezků, oba plíšky
stejným postupem). Že plíšek 0,8 pole u karty v bankovkách **zčásti odstíní** víc než 0,5, je jen
předpoklad, **nic nezaručuje – ověřit, volitelně V5**.

**Výměna magnetu na hotovém kusu (Kolo 8).** Plíšek je od kroku 12 pod D1 a švem S6 a vyměnit nejde.
Magnet ano: sedí na rubu jazýčku jen pod L1 a švem S7. Když víčko na zkušebním nebo finálním kusu
drží slabě (při zatřesení nebo otočení dnem vzhůru se otevře, nebo neudrží pružení závěsu) nebo moc
silně (jedním prstem nejde otevřít, L1 se odtrhává), postupuje se takto. Celý postup je
**neověřený – ověřit na prototypu**, napřed na zkušebním kusu.

1. **Vypárat S7:** stehy na líci jazýčku přestřihnout malými nůžkami nebo páráčkem (kůži
   nenaříznout) a nit vytáhnout. Otvory S7 v jazýčku zůstanou a použijí se znovu.
2. **Odlepit L1** (kontaktní lepidlo po celé ploše): pomalu odloupnout od horní hrany ke špičce.
   **Počítej s novou L1:** L1 a jazýček jsou v posledních 2,5 mm zbroušené do společného klínu
   0,5–0,7 (krok 19), takže L1 se ve špičce při odloupnutí nejspíš roztrhne. Jestli jde L1 sundat bez
   poškození rubu jazýčku, ověřit na prototypu. Nová L1 se vyřízne z nebarvené kozinky jako D1 (přířez 24 × 22).
3. **Sundat magnet** (epoxid na zdrsněném rubu jazýčku): neodym je křehký, proto na něj netlouct
   a nepáčit ostrou hranou (krok 18). Jak se epoxid od kůže oddělí bez poškození rubu jazýčku, ověřit
   na prototypu. Zbytky lepidla opatrně obrousit brusným papírem a rub znovu zdrsnit.
4. **Nový magnet stejného Ø 8:** silnější (vyšší třída nebo tlustší), nebo slabší (nižší třída nebo
   tenčí). Třídu, tloušťku a sílu **ověřit u prodejce**. Stejný průměr nechá beze změny polohu
   magnetu (střed na ose, 7,0 nad špičkou), plíšek (obalení magnetu počítá s Ø 8, oddíl 4.3) i
   otvory S7 (odstup od kraje magnetu, oddíl 5.6). Jiná tloušťka magnetu změní tloušťku peněženky
   u magnetu, odstup karty v bankovkách v tloušťce a odhad pole (oddíl 4.2): dosadit ji do
   `magnetThicknessMm` (oddíl 12.1), spustit `pnpm pattern:wallet-lid` a přečíst kontroly. Magnet
   s jiným Ø (třeba Ø 10 × 2) je jiná záloha s přepočtem (výše), na hotový kus nepasuje.
5. **Znovu lepit a šít:** magnet epoxidem na stejné místo (osa x 50,5, 7,0 nad špičkou; místo
   ohraničují otvory S7), nechat ztuhnout, pak L1 kontaktním lepidlem (krok 18, přes magnet
   netlouct). Novou L1 přilepit s přesahem a oříznout podle hran hotového jazýčku (jazýček se
   znovu neřeže). Potom znovu zbrousit klín posledních 2,5 mm špičky jako v kroku 19 (brusným papírem
   na hranolku, jen mezi špičkou a ryskou 2,5 mm od špičky, hrana na konci asi 0,5–0,7), jinak zůstane
   špička tlustší a látka kapsy ji může chytit (R5). Po 24 h vytvrzení (oddíl 9.1) propíchnout z líce
   jazýčku jehlou starými otvory S7 i skrz L1 a S7 ušít znovu (krok 20; u tlustšího magnetu podložku
   s otvorem zesílit o rozdíl tloušťky). Nakonec hrany jazýčku znovu brousit, zkosit a leštit (konec
   kroku 20). Jestli staré otvory druhé šití vydrží, ověřit na prototypu.

### 5.5 Hrany

| Hrana                                         | Typ                             | Úprava                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| boční hrany těla (F + D2 + B, 2,0–2,6)        | řezaná, viditelná               | po sešití zarovnat nožem (D2 přečnívá 1 mm), obrousit, **zkosit z obou líců**, leštit jako jeden svazek                                                                                                                                                                                                                                                                                                                                                             |
| spodní rohy těla                              | **hranaté** (výchozí od Kola 6) | nezaoblovat, nic nevyplňovat: bok u ohybu dna jen zarovnat se zbytkem boku, **zabrousit a vyleštit** (krok 15). Očko ohybu (mezera po vložce 1,5) na boku zůstane vidět, vzhled ověřit na P2. _Volitelně_ rohy R4: mezeru ohybu v pásech x 0–6 a 95–101 nejdřív vyplnit lepidlem s odřezky (1,0 + 0,6), pak R4 nožem skrz F + B, nebo brusným papírem podle šablony; ověřit na odřezku.                                                                             |
| horní hrana F (y 62,0), rohy R2               | viditelná, ústí karet           | zkosit (zaoblit brusným papírem na hranolku) z líce, leštit **před lepením G4**; rohy R2 nožem, dočistit papírem                                                                                                                                                                                                                                                                                                                                                    |
| výřez pro palec v F (U 10 × 12, rohy ústí R1) | vydutý, viditelný               | **výsečník Ø 10** přes šablonu se středem na ose v y 55,0 (v 7,0), potom rovné řezy **nožem** od hrany F k tečnám díry, zastavit přesně na tečně; rohy ústí R1 **brusným papírem**, ne nožem (krok 5). **Zaoblit** z líce i z rubu (přes líc přejíždí špička jazýčku, o rubovou hranu dna U se může zachytit karta), vnitřek brousit a **leštit** kolíkem Ø 8 v aku vrtačce spolu s horní hranou F před lepením G4 (krok 6). Ověřit P0-4 a na zkušebním kusu (P2-7) |
| pás víčka – spodní hrana a boky, rohy R4      | viditelná, vypouklé rohy        | nožem; zkosit z líce, leštit na plocho před sestavením                                                                                                                                                                                                                                                                                                                                                                                                              |
| napojení jazýčku na pás R4                    | **vyduté**                      | **výsečník Ø 8**, tečné rovné řezy nožem                                                                                                                                                                                                                                                                                                                                                                                                                            |
| boky jazýčku                                  | viditelná                       | zkosit z líce, leštit                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| špička jazýčku R10 (jazýček + L1)             | vypouklá, viditelná             | nožem podle šablony **po nalepení magnetu i L1** (krok 19, oba naráz), pak obšít S7 (krok 20). Klín **nedělat nožem**, ale zbrousit brusným papírem na hranolku z líce i z rubu jen v posledních 2,5 mm (ryska), aby látka kapsy nechytla hranu (V3) a magnet neležel na ztenčeném místě. Stačí, když je hrana na konci asi 0,5–0,7 a zaoblená.                                                                                                                     |
| okénka mincí 12 × 48 (jen B, 1,0)             | vyduté konce R6                 | **výsečník Ø 12** na obou koncích (středy y 34 a 70), rovné řezy nožem; konce brousit papírem na kolíku Ø 8 v aku vrtačce, zkosit z líce, leštit **před sestavením**                                                                                                                                                                                                                                                                                                |
| okénko bankovek 14 × 45 (D2 + B slepené, 1,6) | vyduté konce R7                 | **výsečník Ø 14** na obou koncích (středy y 32 a 63), rovné řezy nožem skrz obě vrstvy **po lepení G3**; leštit jako svazek                                                                                                                                                                                                                                                                                                                                         |
| horní hrana D1 (y 81,5), rohy R3              | vnitřní, viditelná              | obrousit, leštit a **natřít barvou na hrany v tónu kontrastním k D1** párátkem ve 2 tenkých vrstvách (R4: je vidět hranice karty / bankovky; pruh je jen 0,6 široký, víc pomůže výrazně odlišná barva D1 a D2 – rozhodne P0-9; přilnavost na 0,6 ověřit na odřezku) před lepením                                                                                                                                                                                    |
| horní hrana D2 (y 82,0)                       | vnitřní, viditelná              | obrousit, lehce zaoblit (přes ni vede závěs), leštit před lepením                                                                                                                                                                                                                                                                                                                                                                                                   |
| spodní hrana D2 (y 18,0)                      | skrytá                          | zbrousit do tenka brusným papírem na hranolku (klín 3 mm, končí pod S1 – SF9), nožem neztenčovat; aby nedělala schod pro bankovky                                                                                                                                                                                                                                                                                                                                   |
| boky závěsu (1,0; v záloze B 0,6)             | viditelné                       | lehce leštit, nezkosovat                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### 5.6 Šití

Pravidla: vidličky přesně **4,0 mm**, sedlový steh, na obou koncích každého švu **2 otvory zpět**.
Všechno se děruje **zepředu dozadu** (z líce F, nad F z líce D2; S1–S3 z líce D2; S7 z líce jazýčku) a vidlička se drží
vždy stejně natočená při pohledu na tu lícovou stranu, ze které se děruje, s horní hranou od sebe.
Tím mají šikmé otvory na zádech u všech švů stejný sklon. Boční švy se děrují až po složení skrz
všechny vrstvy najednou, takže se nic ohybem nezrcadlí. **Výjimka je S7** (tvar U): na svislých bocích
se vidlička otočí o 90°, postup je v kroku 20.

**Všechny prvky jsou souměrné podle x 50,5, rýsování nezáleží na stranách. Směr šikmých otvorů určuje
jen uvedené pravidlo.** Značka „L“ se dává na rub F a na rub B zvlášť.

| Šev              | Kde                                                | Vrstvy                                                              | Otvory                                                                                                                                  | Počet                    | Kdy / odkud                                                                               |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| **S1** dno mincí | y 22,0 (v 84,43), 4,0 nad spodní hranou D2         | D2 + B (1,6)                                                        | x = 50,5 ± 4j: **10,5 … 90,5**                                                                                                          | **21**, 20 stehů         | krok 10, z líce D2                                                                        |
| **S2** sloupec L | x 36                                               | D2 + B (1,6)                                                        | y 28 … 76                                                                                                                               | **13**, 12 stehů         | krok 10, z líce D2; začátek u ústí 76                                                     |
| **S3** sloupec P | x 65                                               | D2 + B (1,6)                                                        | y 28 … 76                                                                                                                               | **13**, 12 stehů         | jako S2                                                                                   |
| **S4** bok L     | x 3,0 od hrany                                     | y 8–16: F + B (2,0) · 20–60: F + D2 + B (2,6) · 64–76: D2 + B (1,6) | y = 8 + 4i: **8 … 76**                                                                                                                  | **18**, 17 stehů         | krok 14, po G4, z líce F (nad F z líce D2); začátek 76                                    |
| **S5** bok P     | x 98,0                                             | jako S4                                                             | jako S4                                                                                                                                 | **18**, 17 stehů         | jako S4                                                                                   |
| **S6** dno karet | y 25,0 (v 37), 1,0 pod čarou dna karet             | F + D1 (1,6)                                                        | x 10,5 … 38,5 a 62,5 … 90,5 (2 × 8)                                                                                                     | **16**, 2 × 7 stehů      | krok 13, po mokrém ohybu a G2, F naplocho lícem nahoru, B visí přes hranu stolu, z líce F |
| **S7** obšití L1 | konec jazýčku, U kolem magnetu, ke špičce otevřené | jazýček + L1 (1,6)                                                  | boky x 44,5 a 56,5 (4 od hrany jazýčku) ve výšce 6 a 10 nad špičkou; horní řada x 44,5 … 56,5 ve 14 nad špičkou (3 pod horní hranou L1) | **8**, 7 stehů           | krok 20, po ořezu špičky, přes šablonu z listu 4, z líce jazýčku                          |
| **Celkem**       |                                                    | nejvýš 3 vrstvy (2,6)                                               |                                                                                                                                         | **107 otvorů**, 99 stehů |                                                                                           |

- **Horní hrana F (y 62,0) leží přesně mezi otvory 60 a 64.** Steh 60 → 64 se **zdvojí**,
  protože zpevňuje ústí karet (jak přesně zdvojit, ověřit na zkušebním kusu). Děruje se ve třech
  úsecích, které se nepřekrývají: y 8–52 z líce F, y 56–68 po jednom otvoru (56 a 60 z líce F, 64 a 68
  z líce D2) a y 72–76 z líce D2. V úseku y 56–68 každý otvor zarovnat
  podle rysky: bez vidličky s 1 zubem nasadit dvouzubou vidličku krajním zubem do posledního hotového
  otvoru, druhý zub prorazí jen jeden nový otvor, zub pokaždé na pevnou vrstvu. Schod F/D2 vyrovná odřezek 1,0: leží na líci D2 těsně u horní hrany F,
  aby vidlička stála rovně, a otvory 64 a 68 jdou i skrz něj (rozhodnutí autora 7. 10. 2026, Kolo 15). Jak ho držet – ověřit na zkušebním kuse.
- Spodní hrana D2 (y 18,0) leží mezi otvory 16 a 20 (2 mm od obou).
- Poslední otvor 76 je 4,57 pod pásem závěsu (y 80,57). V závěsu nejsou stehy ani lepidlo.
- S6 vynechá pás x 38,5–62,5 (plíšek x 43,5–57,5 s okrajem 4 a pás pod jazýčkem x 40,5–60,5). Střed
  drží jen lepení G2 a zakrývá ho jazýček.
- Spodní šev S1 končí 7,5 od bočních švů (x 10,5 vs. 3,0). Roh sloupce drží lepení G3 (do x 4).
- **S7 kolem L1** (výchozí od Kola 6): otvory jsou ≥ 2,1 mm od kraje magnetu a ≥ 3,2 mm od hrany
  jazýčku (kontrola v kódu chce ≥ 2 a ≥ 3). Mezi magnetem a špičkou (3 mm) se steh nevejde, proto je
  U ke špičce otevřené; spodní konce S7 (6 nad špičkou) jsou nad ztenčeným klínem 2,5. Šijí se jen
  2 vrstvy (jazýček + L1), přes F ani plíšek šev nevede; plíšek je až za F. Nit na líci L1 leží mezi
  L1 a F a může mezeru magnet–plíšek o něco zvětšit – **ověřit na zkušebním kusu** (volitelně V4(b)
  na odřezku se švem). Vidlička i jehly jsou ocelové a magnet je přitahuje: děrovat opatrně,
  s kouskem jazýčku pevně na podložce, nejdřív na odřezku. Stehy budou vidět na líci víčka (schváleno autorem, Kolo 6).
- Nit: tenká voskovaná, která projde otvory vidliček 4 mm (ověřit na odřezku). Délka orientačně
  4 × délka švu + 25–30 cm rezervy, tj. 2 × 15 cm na konce (ověřit na zkušebním švu); u S4 a S5,
  které jdou v y 20–60 přes tři vrstvy (F + D2 + B), 5 × délka švu (návod „Jak odměřit nit“).
- Čáru švu rýsuj až na slepeném kusu: kružidlem nebo rýhovačem 3,0 od hrany F a B (x 3,0), ne od
  přečnívající D2 (x −1; zarovná se až v kroku 15): nad horní hranou F je to 4,0 od hrany D2, nebo čáru
  jen prodloužit u pravítka. Bez kružidla tužkou u pravítka podle čárkované čáry 3,0 na proužku z listu 4
  (proužek levou hranou na hranu F, konce čáry propíchnout a spojit). Polohy otvorů S4/S5 přenes z
  papírového proužku na listu 4.

### 5.7 Lepení

Kontaktní lepidlo na kůži. Lepená místa na lícové straně se nejdřív zdrsní brusným papírem.
**Tokonole** se nanáší jen mimo lepená místa (brání přilnutí lepidla), hranice lepení je třeba
přelepit páskou. Souřadnice y jsou v peněžence (list 2 je kreslí na rubu P1).

| ID      | Co na co                                 | Oblast (x, y)                                                                                                          | Poznámka                                                                                                                                                                              |
| ------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1**  | K2 plíšek → rub F                        | x 43,5–57,5, y 3,5–24,0                                                                                                | celá plocha plíšku; až po mokrém ohybu dna                                                                                                                                            |
| **G2**  | D1 (rub) → rub F                         | x 4–97, **y 2,0–26,0**, přes plíšek                                                                                    | horní hranice lepení = čára dna karet, **dno karet ještě drží šev S6** (y 25,0). Přetok nad 26,0 hned setřít.                                                                         |
| **G2b** | boky D1 → rub F                          | x 4–5 a 96–97, y 26,0–61,0                                                                                             | karta se kolem boku D1 nedostane do bankovek; kapsa karet mezi pásy 91                                                                                                                |
| **G3a** | D2 (rub) → rub B, dno mincí              | x 0–101, y 18,0–23,0                                                                                                   | lepí se o 1,0 za čáru S1 (otvory jdou skrz slepené)                                                                                                                                   |
| **G3b** | D2 → B, boky                             | x 0–4 a 97–101, y 23,0–80,57                                                                                           |                                                                                                                                                                                       |
| **G3c** | D2 → B, střed                            | **x 35–66, y 23,0–80,57**                                                                                              | lepí se **jen k pásu závěsu** (80,57), ne až k horní hraně D2 (82,0) – zůstává mezera 1,43 mm, aby lepidlo nezasáhlo do pásu závěsu (nit 8, oddíl 13). Mezi okraji lepení sloupec 31. |
| **G4**  | rub F ↔ líc D2 (zdrsnit) · rub F ↔ rub B | pásy x 0–4 a 97–101: F–D2 v y 18,0–62,0; F–B v y 1,75–18,0                                                             | až po G1/G2 a S6. Mezi okraji G4 je kapsa 93.                                                                                                                                         |
| **G5**  | K1 magnet → rub jazýčku                  | Ø 8 na značce (krok 18, poloha se určí v kroku 17)                                                                     |                                                                                                                                                                                       |
| **G6**  | L1 → rub jazýčku                         | celý přířez L1 přes magnet (krok 18)                                                                                   | pak ořez načisto spolu s jazýčkem (krok 19) a šev S7 (krok 20)                                                                                                                        |
| nelepit | –                                        | pás závěsu, kapsa karet, oddíl bankovek, sloupce mincí, D1 nad y 26,0 (kromě G2b), rub pásu víčka a jazýčku (kromě L1) | Lepidlo v závěsu by ho vyztužilo a lámalo by se.                                                                                                                                      |

### 5.8 Mokré tvarování a přípravky

**Ohyb dna (statický) – dělá se před lepením G1/G2**, aby plíšek nebyl u vlhké usně. Od Kola 6 se
**neztenčuje**: ohýbá se plná useň 1,0 za mokra přes vložku 1,5. Nejdřív se ale udělá **zkouška V12**
(oddíl 11; povinná, asi 10 min práce a přes noc schnutí) ještě před řezem P1: odřezek usně 1,0 namočit
a přehnout lícem ven přes vložku 1,5. Když líc v ohybu popraská, platí **přednostně záloha A** (celý P1 z usně 0,8,
nic se neztenčuje). Záloha B (ztenčení pásu ohybu na 0,6, krok 4) jen když useň 0,8 nejde sehnat nebo ve V12 popraská i ona; pás ve v podle listu 1 varianty `--skive-fold 0.6`, tedy v 57,80–65,80, ne 58,21–66,21 výchozího střihu – tabulka níže).
Samotné odpružení ohybu po V12 důvodem k záloze není (rozhodnutí kola 8).

Postup: na rub vytlač **rýhu na ose ohybu v 62,21** (výchozí střih; jinak osa z rámečku na listu 4; tupým hrotem u pravítka, bez řezu; rýha je na
vnitřní straně ohybu), osu vyznač ryskou i na obou bocích dílu. **Hrana vložky nejde na rýhu** (Kolo 9):
vložka leží na rubu B a F se přes ni přehne, takže oblouk ohybu (3,93) začíná u hrany vložky a jeho
střed má padnout na rýhu. Hrana vložky tedy leží o půl oblouku za rýhou směrem k B:
v_vložka = osa + oblouk / 2 = 62,21 + 3,93 / 2 = **64,18** (`v.insertEdge`, ve výchozím střihu; jinak
z rámečku na listu 4). Na rozvinutém P1 je to začátek rovné B. Model přitom počítá ohyb jako půlkruh
kolem **půlkulatého nosu** vložky (vnitřní poloměr 0,75, střednice 3,93); hrana 64,18 je pak tečná
čára, kde se useň od vložky odklání. Vložka z karet má ale hranu **odstřiženou rovně** (hranatá 1,52):
useň se ohne kolem dvou rohů, střednice je asi 1,52 + π · 0,5 = 3,09 a střed ohybu leží asi 1,54 za
hranou vložky, ne 1,96. Skutečná kůže ostré rohy přesně nekopíruje, takže výsledek bude někde mezi
(rozdíl nejvýš asi 0,4 mm) – **rozhodne odřezek V12**: na odřezku vyznač rýhu i čáru hrany vložky
1,96 od sebe (i ryskami na bocích), vložku polož hranou na čáru a po vyschnutí změř posuvkou na boku
odřezku, o kolik je ryska rýhy od vrcholu ohybu. Když je to víc než 0,3 mm, posuň na P1 čáru hrany
vložky o tuto odchylku směrem od vrcholu k rýze (leží-li rýha od vrcholu blíž k F, posuň čáru k F). Čára hrany vložky je na listu 1 i 2
(vrstva FOLD, trojúhelníčky u boků, popisek); vyznač ji na rubu i ryskami na bocích.
Pás ohybu navlhči houbičkou (časy v oddílu 9.1), vložku polož na rub B hranou na čáru hrany vložky
(ve výchozím střihu 64,18; vložka leží na B, její hrana míří k F, na straně F vložka neleží) a F přehni nahoru přes **vložku 1,5** (rozměr **aspoň 111 × 25**; z karet vyjde asi 111 × 50, výšku karet nezkracovat), tak bude ohyb kolmý na pás.
**Vložka (Kolo 9, nic se nekupuje):** 2 vrstvy starých karet na sobě (2 × 0,76 = **1,52**; model
s 1,52 posune osu i hranu vložky jen o 0,01–0,02 mm, kontroly projdou), v každé vrstvě 2 karty
vedle sebe kratšími hranami k sobě (2 × 85,6 = 171,2 ≥ 111). Dlouhou hranu, která jde do ohybu,
u všech karet odstřihni rovně o **4 mm**, aby u spoje nezůstaly zaoblené rohy karet (hrana vložky
musí být rovná po celé šířce; po střihu zkontroluj pohledem, že zaoblení zmizelo). Výšku karet
nezkracuj (49,98 po střihu ≥ 25 stačí). Každá vrstva je o 60,2 delší než 111: v jedné vrstvě
přebytek ustřihni zleva, v druhé zprava, takže spoje obou vrstev leží proti sobě posunuté (asi 25 mm
od opačných konců). Vrstvy slepíš lepicí páskou. Stačí i jakýkoli jiný rovný tuhý pás 1,5 mm (tloušťku změřit
posuvkou). Proti SF5 (oddíl 13) se tím řeší délka: jedna karta 85,6 je na 111 krátká, dvě vedle sebe
ne. Jestli vložka z karet ohyb udrží rovný, ověřit na odřezku V12.
Vložka je o 5 mm na každé straně širší než díl, aby ohyb
měl oporu po celé šířce i u boků – boky se po Kole 6 nevyplňují lepidlem (hranaté rohy, oddíl 5.5).
Mezi vlhký líc a prkénka dej potravinovou fólii, aby na líci nezůstaly otisky a skvrny od
dřeva. Spodních 20 mm stáhni mezi dvěma prkénky svěrkami a nech vyschnout přes noc (12–24 h, ne
u topení; ověřit). Vložku pak vysuň bokem. Boky ještě nejsou slepené, takže F jde potom odklopit do
~90° na lepení G1/G2 (F rubem nahoru na desce, B stojí nahoru, krok 12) a šití S6 (F lícem nahoru,
B visí přes hranu stolu, krok 13). Když ohyb po vyschnutí trochu odpruží, udrží ho lepení G4 a boční
švy S4/S5 (rozhodnutí kola 8). Jestli G4 u ohybu pak nepovoluje, ukáže zkušební kus (P2-2) – ověřit
na prototypu.

**Závěs (desetitisíce ohybů).** Materiál a tvar:

- **1,0 bez ztenčení** (Kolo 6), z rubu nic neubírat, líc ven. Pás závěsu 8 mm (výchozí v 142,99–150,99, v záloze
  podle tabulky níže) jen vymezuje místo, kde se nelepí ani nešije. Líc závěsu při ohnutí ověří
  **V12** (rozhodnutí kola 8: pokrývá ohyb dna i neztenčený závěs; ohyb přes vložku 1,5 má vnitřní
  poloměr 0,75, přehyby závěsu 1,0). Únavu V12 neukáže: jestli závěs vydrží běžné používání a víčko
  drží tvar, ověří **zkušební kus** (oddíl 11); desetitisíce cyklů zkouší jen volitelná V6. Když
  neprojde: **záloha A** celý P1 z koupené usně 0,8 (nic se neztenčuje), a teprve jako **poslední
  možnost záloha B** – ztenčit pás závěsu na 0,6 z rubu (přijatelně 0,6–0,8, okraje pásu náběh, ne
  schod; krok 4). Ztenčený pás závěsu je od Kola 8 širší než 8 mm a je to zóna **plného ztenčení**:
  sahá od nejméně 1 mm před začátkem závěsu do 1 mm za jeho konec v plném stavu C i při k 1,24, takže
  oba přehyby leží v plném ztenčení ve všech stavech (15,1 mm, `--skive-hinge 0.6`: v 142,68–157,80).
  **Náběh 2 mm na každé straně leží vně pásu** (140,68–142,68 a 157,80–159,80). Spodní náběh tak
  zasahuje pod horní 2 mm lepení G3 (poslední otvor S4/S5 i okénko mincí zůstávají nejméně 1 mm pod
  ním); jestli G3 na náběhu drží, ověřit na prototypu. Čísla všech variant jsou v tabulce níže,
- žádné stehy (poslední otvor 4,57 pod pásem) ani lepidlo,
- **plochý vrch se dvěma přehyby**, od Kola 9 **bez kopyta**: formou je peněženka s obsahem stavu B
  (krok 16; obsah pod závěsem T_B = 3,42 z modelu, oddíl 4.1). Přehyby a plochý vrch se tvarují přes
  horní hrany D1/D2 a obsah; jestli vrch vyjde plochý (k ≈ 1,0), ukáže měření k v kroku 16,
- zavřený závěs se ohýbá kolem obsahu. Vnitřní poloměr přehybů 1,0 je **předpoklad** (dřív ho
  dávala hrana kopyta R1, bez kopyta tvar určují horní hrany D1/D2 a karet, zaoblené v kroku 6);
  délka P1 i rezerva špičky s ním počítají dál, ověří ho měření k v kroku 16 a poloha špičky na
  zkušebním kusu. **Při otevření se ale ohýbá i opačně**
  (líc dovnitř): když se víčko překlopí až na záda, vznikne v pásu závěsu ostrý lom bez jádra. Závěs
  tak dostává střídavý ohyb, a to je pro únavu horší než ohyb jedním směrem. Závěs tvarovaný zavřený
  se vrací k zavřené poloze, na záda se sám nepřeklápí; v návodu stačí víčko při vyndávání držet
  palcem zhruba svisle, ne tlačit na záda (krok 22). Volitelná V6 zkouší střídavý cyklus. Jestli je
  tlustší neztenčený závěs v lomu náchylnější k prasklinám líce, se tu nepředpokládá – ukáže
  zkušební kus (důkladně V6),
- o výdrži rozhodne **zkušební kus** (důkladně volitelná V6), nic se tu nepředpokládá. Jiný materiál se nevymýšlí, jen „zkusit jinou
  useň, ověřit“.

**Zálohy ohybu dna a závěsu – čísla z modelu** (každá varianta projde kontrolami modelu; generuje se
přepínačem, soubory dostanou příponu, výchozí střih se nepřepíše):

| Varianta                          | Kdy                                                                | Přepínač `pnpm pattern:wallet-lid …` | Ohyb / závěs | H    | P1    | Dno karet | y_m,B | Plíšek y | Max. tloušťka A (u magnetu) / B / C | Mezera magnet–plíšek | Proužek C (k 1,0 / 1,24) |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------ | ------------ | ---- | ----- | --------- | ----- | -------- | ----------------------------------- | -------------------- | ------------------------ |
| **výchozí**                       | V12 i zkušební kus projdou                                         | –                                    | 1,0 / 1,0    | 83,5 | 231,7 | 26,0      | 11,9  | 3,5–24,0 | 6,2 / 7,92 / 11,36                  | 1,6                  | 13,7 / 12,27             |
| **A** celý P1 z usně 0,8          | ve V12 popraská líc, nebo závěs 1,0 na zkušebním kusu neprojde     | `--p1 0.8`                           | 0,8 / 0,8    | 82,8 | 230,2 | 25,5      | 11,6  | 3,5–23,5 | 5,6 / 7,52 / 10,96                  | 1,4                  | 13,5 / 12,07             |
| **B** ohyb dna ztenčený na 0,6    | ve V12 popraská líc a záloha A nejde (useň 0,8 nesehnaná / praská) | `--skive-fold 0.6`                   | 0,6 / 1,0    | 83,0 | 230,7 | 25,5      | 11,5  | 3,5–23,5 | 6,2 / 7,92 / 11,36                  | 1,6                  | 13,6 / 12,17             |
| **B** závěs ztenčený na 0,6       | poslední možnost (závěs zkušebního kusu neprojde ani v záloze A)   | `--skive-hinge 0.6`                  | 1,0 / 0,6    | 83,1 | 231,0 | 26,0      | 11,9  | 3,5–24,0 | 6,2 / 7,92 / 11,36                  | 1,6                  | 13,7 / 12,27             |
| **B** obojí (rozměry jako Kolo 5) | ve V12 popraská líc a závěs neprojde ani v záloze A                | `--skive-fold 0.6 --skive-hinge 0.6` | 0,6 / 0,6    | 82,6 | 230,1 | 25,5      | 11,5  | 3,5–23,5 | 6,2 / 7,92 / 11,36                  | 1,6                  | 13,6 / 12,17             |

Obě tabulky platí pro přepážky a L1 0,6. **S koupenými kozinkami (0,7–0,9) se čísla mění** (při
přepážkách 0,8 je H 83,0, P1 230,86, osa ohybu 61,71, hrana vložky 63,68, dno karet 25,5, plíšek
3,5–23,5, y_m,B 11,6 a okno lepení jen 11,50–11,63), proto je ber z rámečku **„Čísla pro postup“ na
listu 4** listů vygenerovaných pro změřenou tloušťku (krok 0(a)).

Sloupec „Max. tloušťka“: ve stavu A je nejtlustší místo u magnetu (lokálně, obálka stavu A je 4,2
ve výchozím střihu, oddíl 1 a 7), ve stavech B a C pás mincí.

**Čísla pro postup podle varianty** (z modelu; na listech varianty jsou stejná čísla, kroky 2–20
berou hodnoty odsud nebo z listů varianty, ne z textu výchozího střihu):

| Varianta     | Kóta P1 (krok 1) | Osa ohybu v (rýha) | Pás ohybu v | Závěs v (stav B) | Pás závěsu v  | Přehyby v       | G2 y / S6 y (krok 12–13) | Plíšek y (krok 12) | Hrana víčka A / B / C (krok 16, k 1,0) | Při k 1,24 A / C | Značka magnetu y_m,B (krok 17) | Okno lepení y_m,B |
| ------------ | ---------------- | ------------------ | ----------- | ---------------- | ------------- | --------------- | ------------------------ | ------------------ | -------------------------------------- | ---------------- | ------------------------------ | ----------------- |
| výchozí      | 231,66           | 62,21              | 58,21–66,21 | 143,93–150,06    | 142,99–150,99 | 145,10 / 148,88 | 2,0–26,0 / 25,0          | 3,5–24,0           | 53,9 / 56,6 / 62,5                     | 53,2 / 63,9      | 11,9                           | 11,73–12,13       |
| A `--p1 0.8` | 230,23           | 61,76              | 57,76–65,76 | 143,01–148,83    | 141,92–149,92 | 144,11 / 147,73 | 2,0–25,5 / 24,5          | 3,5–23,5           | 53,4 / 56,1 / 62,0                     | 52,7 / 63,4      | 11,6                           | 11,53–11,63       |
| B ohyb 0,6   | 230,73           | 61,80              | 57,80–65,80 | 143,10–149,23    | 142,17–150,17 | 144,28 / 148,05 | 2,0–25,5 / 24,5          | 3,5–23,5           | 53,4 / 56,1 / 62,0                     | 52,7 / 63,4      | 11,5                           | 11,33–11,63       |
| B závěs 0,6  | 231,03           | 62,21              | 58,21–66,21 | 143,93–149,43    | 142,68–157,80 | 144,95 / 148,41 | 2,0–26,0 / 25,0          | 3,5–24,0           | 53,9 / 56,6 / 62,5                     | 53,2 / 63,9      | 11,9                           | 11,73–12,13       |
| B obojí      | 230,10           | 61,80              | 57,80–65,80 | 143,10–148,60    | 141,85–156,97 | 144,12 / 147,58 | 2,0–25,5 / 24,5          | 3,5–23,5           | 53,4 / 56,1 / 62,0                     | 52,7 / 63,4      | 11,5                           | 11,33–11,63       |

Pás závěsu v řádcích „B závěs“ a „B obojí“ je zóna plného ztenčení; náběh 2 mm leží vně pásu na obou
stranách (krok 4(b)). Ve výchozím střihu a v zálohách bez ztenčení závěsu pás jen vymezuje místo, kde
se nelepí ani nešije.

Hrana víčka se v kroku 16 měří jako y (od spodní hrany), ne jako vzdálenost od horní hrany F; horní
hrana F je ve výchozím střihu a v záloze B závěs v y 62,0, v ostatních zálohách v y 61,5.

Záloha A mění i ostatní části P1 (F, B, víčko a jazýček 0,8): jiná tuhost jazýčku a mezera magnet–plíšek
1,4 (menší mezera sílu spíš zvětší, o kolik – ověřit), vzhled a tuhost F a B ověří zkušební kus (P2),
který se pak dělá taky z usně 0,8. Když se varianta změní až po zkušebním kusu (závěs neprojde), je
finální kus v nové variantě neověřený – ověřit na prototypu, nejlépe dalším zkušebním kusem. Kapsa 93 na
tloušťce P1 nezávisí, šířka 101 zůstává. U zálohy A je rozsah pro lepení magnetu jen 11,53–11,63
(oddíl 4.3). Polohu magnetu ve všech variantách určuje hotový kus (krok 17).

**Tvarování závěsu (výchozí od Kola 9, krok 16):** bez kopyta a bez opěrky. Do hotové peněženky
(po krocích 1–15) vlož obsah **stavu B z modelu**: 2 staré karty do kapsy karet a místo bankovky
místo bankovky papír (aby bankovka nezvlhla): kancelářský papír asi 70 × 65, přeložený
nebo položený v několika vrstvách na sebe, až posuvka ukáže asi **0,7 mm** (tloušťka bankovky napůl
v modelu, oddíl 4.1; obyčejný proužek přeložený jednou je o hodně tenčí), nebo skutečnou bankovku
zabalenou ve fólii, mince ne (ve stavu B leží dole a na závěs nepůsobí). Obsah pod závěsem je pak
T_B = 3,42 jako ve výpočtu. Navlhči houbičkou **jen pás závěsu** (nenamáčet celé), víčko zavři přes
obsah, jazýček polož po přední stěně a nech přes noc (12–24 h, ne u topení; ověřit) zavřené pod
lehkou zátěží (kniha). **Formou je peněženka s obsahem**, závěs se pak dál zaběhne používáním.
Magnet v tu chvíli ještě není (krok 18). Mezi vlhký závěs a knihu dej potravinovou fólii.

Důsledek: **otevřené víčko samo nestojí** a pruží zpátky nad ústí (dřívější chování Z1, riziko R2).
Při kartě to nevadí; u bankovek a mincí ho drží palec ruky, která peněženku drží (oddíl 2, P0-8,
zkušební kus Z-2). Model na tom nezávisí: poloha magnetu, plíšek a kontroly počítají jen s k (1,0
návrh, 1,24 kontrola) a stavy obsahu, tvar otevřeného víčka v nich není. Měření k v kroku 16 platí
beze změny. Dřívější mezipoloha Z2 (kopyto, opěrka 30°) je jen v historii (oddíl 13, Kolo 9).

Když P0 nebo zkušební kus ukáže, že palec víčko pohodlně neudrží, dá se okénko bankovek posunout
mimo stopu jazýčku (např. x 27–42, stále v pásu x 27–74) a okénka mincí zkrátit shora, aby šlo víčko
otevřít víc dozadu (ověřit P0-8).

---

## 6. Výrobní tolerance

Předpoklad (ne změřeno): ruční řez ±0,5, tloušťka usně v kusu ±0,1, rýsování ±0,3.

| Rozměr                     | Návrh                              | Při toleranci               | Následek / proč to nevadí                                                                                                                                                |
| -------------------------- | ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| kapsa F–D2 93,0            | mezi okraji G4                     | 92,5–93,5                   | nejméně 92,5 ≥ 85,6 + 6,26 = 91,86 (obsah C bez vůle). Plný stav zkusit na P0-7.                                                                                         |
| kapsa karet 91,0           | mezi pásy G2b                      | 90,5–91,5                   | 90,5 ≥ 85,6 + 4,56 = 90,16                                                                                                                                               |
| sloupec 31,0               | mezi okraji G3                     | 30,5–31,5                   | 30,5 ≥ Ø + t = 30,0. Na P0 ověřit, že 50 Kč volně klouže.                                                                                                                |
| strop 82,5 vs. bankovka 74 | vůle 6,5                           | ±1                          | ≥ 5,5 zůstává                                                                                                                                                            |
| posun karet 0,24 (C)       | strop − horní hrana karty na klínu | závisí na Δ_k (P0-6)        | Když karty sedí výš (δ 1,0 → horní hrana 84,5), tlačí na závěs a víčko ujede nahoru. Pak čáru G2/S6 posunout dolů o (Δ_k − 2,28).                                        |
| dno karet 26,0             | hranice G2 + S6                    | ±0,5                        | Posune vyčnívání karet a odstup proužku (≥ 13,2).                                                                                                                        |
| poloha magnetu             | lepí se na hotovém kusu ve stavu B | zbývá nejistota k a plnosti | plíšek 20,5 mm; rezerva nad povinnými 0,5 nahoře 1,66 (k 1,0) a 0,23 (k 1,24), dole 0,58 (k 1,24); obalí magnet v celém okně lepení 11,73–12,13 (oddíl 4.3, SF1, Kolo 7) |
| hrana pásu víčka (C)       | y_fe = y_m + 44,66 = 62,5          | ±1                          | 61,5–63,5: přesah na F do 0,5 nebo mezera do 1,5                                                                                                                         |
| délka závěsu               | 6,13 (B)                           | –                           | vyrovná ořez špičky jazýčku (rezerva 5)                                                                                                                                  |
| stažení stehem             | –                                  | ~0,2–0,5 na šev (ověřit)    | Boky se zarovnávají až po šití, D2 má +1 na stranu.                                                                                                                      |
| vytahání kůže              | –                                  | kapsy se uvolní             | Retence nezávisí na sevření. Širší sloupec víc cinká (P2-8).                                                                                                             |

Nic nefunguje jen při ±0,1 mm. Jediné citlivé místo (magnet vůči plíšku) se nastavuje na hotovém kusu.

---

## 7. FÁZE 7 – simulace použití

Tloušťky: P1 1,0 (F, B, víčko, jazýček, ohyb dna i závěs bez ztenčení) · D1 0,6 · D2 0,6 · L1 0,6 · magnet 1,5 · plíšek 0,5 ·
karta 0,76 · bankovky t_bn (0,7 / 1,1) · mince 2,5 (50 Kč, horší případ).

Zóny: **K** = sloupce mincí (x 4–35, 66–97) · **S** = střední pás pod jazýčkem (x 40,5–60,5, bez
mincí) · **Kr** = okraje se švy (x 0–4, 97–101). Plnou tloušťku po pásech počítá i generátor
(`thicknessFor`).

### Stav A – prázdná

| Zóna, y                          | Vrstvy                                      | Součet                |
| -------------------------------- | ------------------------------------------- | --------------------- |
| Kr, 1,75–18 / 18–62 / 62–81,5    | F+B / F+D2+B / D2+B (+ víčko nad F)         | 2,0 / 2,6 / 1,6 (2,6) |
| dole, 1,75–18                    | F + D1 + B                                  | 2,6                   |
| K, 18–62                         | F + D1 + D2 + B                             | 3,2                   |
| K, přesah víčka na F (y 53,9–62) | víčko + F + D1 + D2 + B                     | 4,2                   |
| S, 26–62                         | jazýček + F + D1 + D2 + B                   | 4,2                   |
| S, magnet (y 5,2–13,2)           | jazýček + magnet + L1 + F + plíšek + D1 + B | **6,2**               |

Magnet y 9,22, špička 2,22, hrana pásu víčka 53,88 (přesah na F 8,1). Proužek zde není.

Drží tvar? Tělo drží ohyb dna a 6 švů, nahoře je vytvarovaný plochý závěs. Prázdný závěs (T 1,2 < 2,0)
se nad D2 zúží z plochého vrchu na oblouk, vypadá jako mírně oblý vrch – **ověřit vzhled** (P2-2).

### Stav B – 2 karty, 1 bankovka, 1 mince (test priority 1)

Mince 50 Kč ve sloupci L na dně (y ~24,3–51,8).

| Zóna, y                   | Vrstvy                                                 | Součet   |
| ------------------------- | ------------------------------------------------------ | -------- |
| K-L s mincí               | F + 2 karty + D1 + bankovka + D2 + mince + B           | **7,92** |
| K-P bez mince, 26–62      | F + karty + D1 + bankovka + D2 + B                     | 5,42     |
| K, přesah víčka (56,6–62) | víčko + 5,42                                           | 6,42     |
| dole, 1,75–18             | F + D1 + bankovka + B                                  | 3,30     |
| S, 26–62                  | jazýček + F + karty + D1 + bankovka + D2 + B           | 6,42     |
| S, magnet (y 7,9–15,9)    | jazýček + magnet + L1 + F + plíšek + D1 + bankovka + B | 6,90     |

Magnet **y 11,9**, špička 4,9, hrana pásu 56,56 (přesah 5,4), odstup proužku 19,6.
Když se mince posune ke stropu (Bm), obsah pod závěsem je 5,92, magnet 14,4, odstup 17,1.

Retence (víčko zavřené):

- **2 karty** stojí na dně 26,0 (na klínu odhadem ~26,8) a nahoru se posunou o ~1,8 ke stropu. Do stran
  nemohou, jejich spodních 35 mm je v kapse F mezi pásy G2b a švy.
- **1 bankovka** se posune ke stropu o 6,5 (výška 74) až 11,5 (výška 69), její horní hrana dojede až do
  82,5 = strop. Nad D1 (81,5) je mezera jen 1,0 pod plochým závěsem a nad D2 (82,0) 0,5. Aby se bankovka
  přehnula do kapsy karet nebo za D2, musela by se do té mezery ohnout. Při 2 kartách před D1 je navíc
  ústí karet zaplněné. **Při 0–1 kartě to jistě neplatí, ověřit P2-1** (0 karet, 1 × 5000 Kč, dnem
  vzhůru, třást). Když bankovka přeleze D1, zvýšit D1 o 0,5 až na strop (D1 dosedne na závěs).
- **1 mince (i 1 Kč)** nahoru narazí do plochého závěsu. Mezera mezi D2 (82,0) a stropem (82,5) je
  0,5 < 1,85, a to jen při plochém závěsu (k ≈ 1). V ústí sloupce je D2 volná a 0,6 tenká, mince ji
  může odtlačit dopředu. Mimo sloupce je D2 přilepená až k horní hraně. **Ověřit P2-1** (1 Kč za D2,
  stav A i B, 30× zatřást dnem vzhůru). Když přeleze, prodloužit D2 o 0,5 nahoru, aby dosedala na závěs.
- Síly: obsah dnem vzhůru při 5 g tlačí na závěs ≈ 1 N (odhad z kola 3). Víčko to přenese jako tah do
  jazýčku a magnet ho nese ve smyku: μ (0,4, ověřit) × přítlak (cíl ≥ 3 N) ≥ 1,2 N (měří jen volitelná V4; doma stačí zkušební kus). Když magnet
  ujede, vyjede po plíšku ještě 8,1 mm (vršek 15,9 → hrana 24,0), než by se odtrhl.

Ergonomie: přední karta vyčnívá 18,7. Bankovka po posunu o 30 vyčnívá 19–24. Horní mince po posunu
9,5, nebo vyjede celá (oddíl 4.5).

### Stav B podle briefu – 4 karty, 2 bankovky, 3 mince (kap. 24)

Brief zadává pro stav B jinou skladbu než rozhodnutí autora (2 karty, 1 bankovka, 1 mince výše):
**4 karty, několik bankovek, 3 mince**. Model to počítá jako samostatný stav (`Bbrief`, oddíl 4.1–4.2),
tady 2 bankovky a mince 2 + 1 (levý sloupec plný, pravý s jednou):

| Zóna           | Vrstvy                                                                                                 | Součet    |
| -------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| K se mincí     | F + 4 karty + D1 + 2 bankovky + D2 + mince + B (+ přesah víčka, mince do něj zasahuje)                 | **10,64** |
| S pod jazýčkem | jazýček + F + 4 karty + D1 + 2 bankovky + D2 + B                                                       | 8,14      |
| magnet         | jazýček + magnet + L1 + F + plíšek + D1 + 2 bankovky + B (bez D2 – magnet ještě pod jeho dolní hranou) | 7,10      |
| dole           | F + D1 + 2 bankovky + B                                                                                | 3,50      |

Magnet y 13,62 (k 1,24: 14,03), špička 6,62, hrana pásu 58,28 (o 3,72 pod horní hranou F – lem víčka tu
ještě leží na F), odstup od proužku 17,92 (k 1,24: 17,51), odhad pole 1,51 / 1,62 mT. Vršek magnetu je
8,38 mm pod dnem karet (nad minimum 2,5) a magnet zůstává celý na plíšku i při k 1,24 (SF1).

Tloušťka **10,64** mm je mezi stavy B (7,92) a C (11,36), pod přijatou hranicí ≈ 12. Retence a
ergonomie jsou stejné jako ve stavu B výše (karty do stran nemohou přes G2b, bankovka i mince narazí
do plochého závěsu, dokud nejsou plné).

### Stav C – 6 karet, 3 bankovky, 4 × 50 Kč

Oba sloupce 2 × 50 Kč (y ~24,3–79,3, horní mince pod závěsem).

| Zóna, y                                | Vrstvy                                                      | Součet    |
| -------------------------------------- | ----------------------------------------------------------- | --------- |
| K s mincí, 26–62                       | F + 6 karet + D1 + 3 bankovky + D2 + mince + B              | **11,36** |
| K nad F (62–82,5)                      | víčko + karty + D1 + bankovky + D2 + mince + B              | 11,36     |
| K, 23–26 (pod schodem karet)           | F + D1 + bankovky + D2 + mince + B                          | 6,80      |
| dole, 1,75–18                          | F + D1 + bankovky + B                                       | **3,70**  |
| S, 26–62                               | jazýček + F + karty + D1 + bankovky + D2 + B                | **9,86**  |
| S, magnet (y 13,8–21,8, zčásti nad D2) | jazýček + magnet + L1 + F + plíšek + D1 + bankovky + D2 + B | 7,90      |

Magnet **17,84** (k 1,24: 19,27), špička 10,84, hrana pásu 62,5 (mezera 0,5 nad F, přesah nad mincemi
není). Odstup od proužku 13,7 (k 1,24: 12,27).

- **Deformace:** kapsa F–D2 93 obalí kartu + 6,26 obsahu s vůlí 0,8. Plný stav zkusit na P0-7.
- **Tloušťka:** 11,36 v pásu mincí je pod přijatou hranicí ≈ 12. Střed 9,86, dole 3,7. Dno je
  klínové a lépe zajíždí do kapsy.
- **Přístup:** vyčnívání přední karty 20,3 (karty sedí na klínu výš), ve výřezu pro palec 32,3.
  Bankovky tlačí bříško přes D2 + B.
- **Bezpečnost obsahu:** stejná jako B. Závěs na tlustším obsahu víc obepíná a magnet leží výš, stále
  na plíšku i při k 1,24 (SF1).
- **Zkroucení víčka:** když je plný jen jeden sloupec, posune se víčko nad ním víc než nad středem.
  Tuhé víčko 1,0 to zprůměruje nebo se zkroutí – **měřit P0-3 zvlášť nad sloupci a nad středem**.
- **Pozn.:** stav C podle briefu (kap. 24) má 6 mincí. Tahle skladba má z rozhodnutí autora kapacitu
  **4 mince** (2 sloupce × 2). Stav B podle briefu (4 karty, 2 bankovky, 3 mince) je spočtený zvlášť výše.
- **Schod dna karet:** spodních ~4 mm mincí (y 24,3–28,3) leží pod svazkem karet, schod 4,56 je
  před D1 a bankovkami. Mince za D2 ho cítí jen jako mírné sevření dole, ověřit na P0-7.

---

## 8. FÁZE 8 – prototype review (kap. 25)

| #   | Otázka                          | Odpověď                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Dá se vyrobit ručně?            | Ano, i v domácí dílně s náhradami z oddílu 10. Nůž, výsečníky Ø 8/10/12/14, vidličky 4 mm, **nic se neztenčuje** (ztenčení pásů je jen záloha B, krok 4), kontaktní lepidlo a epoxid, pilový list na kov na plíšek, vložka dna ze starých karet (jediný přípravek, Kolo 9), posuvka. Nejsložitější je lepit magnet na hotovém kusu a obšít L1 kolem něj (kroky 17–20).                                                                               |
| 2   | Potřebujeme všechny díly?       | P1 ano. D1 tvoří dno karet a odděluje je od bankovek. D2 je stěna mincí. L1 kryje magnet. Kování nese zámek (priorita 1). Nic navíc.                                                                                                                                                                                                                                                                                                                 |
| 3   | Potřebujeme všechny švy?        | S2 až S5 ano (hranice oddílů). S1 a **S6** nesou dna mincí a karet, která by samotné lepení drželo jen na odlupování (mince narážejí, karty působí jako klín do spáry). Oba zůstávají. **S7** drží L1 kolem magnetu, který L1 při každém otevření odtrhává (rozhodnutí kola 6).                                                                                                                                                                      |
| 4   | Nemůže něco vypadnout?          | Při zavřeném víčku ne (oddíl 7B, ověřit P2-1). Při otevřeném a obráceném vypadnou volné karty, bankovky a mince (R6). Magnet ve smyku a proti pružení závěsu nutně ověřit na zkušebním kusu (zatřást, otočit dnem vzhůru; volitelně V4).                                                                                                                                                                                                             |
| 5   | Nepřekrývá se příliš vrstev?    | Švy mají nejvýš 3 vrstvy (2,6), S7 jen 2 (1,6). Nejtlustší pás 11,36 tvoří obsah, kůže v něm je jen 3,2.                                                                                                                                                                                                                                                                                                                                             |
| 6   | Dá se vytáhnout jedna karta?    | Přední ano, vyčnívá 18,4–20,3, a palcem ve **výřezu pro palec U 10 × 12** se dá vysunout třením nahoru (výřez slouží jen přední kartě, oddíl 4.6). Zadní: rovinný vějíř v kapse 91 dovolí 6,3° pro celou kartu a 11,3° pro část nad F (85,6 cos θ + h sin θ = 91), na vějíř to nestačí, a tlak palce na líc přední karty tlačí svazek dozadu, ne dopředu. Zadní kartu tak vytáhneš až po vyndání předních (rozhodnutí kola 6). Čas změří P0-4 a V10. |
| 7   | Dá se vytáhnout jedna mince?    | Ano. Horní se posune o 12 a vyčnívá 9,5. Samotná se posune a dotlačí za hranu (oddíl 4.5).                                                                                                                                                                                                                                                                                                                                                           |
| 8   | Jdou bankovky vložit bez boje?  | Ústí má šířku 93 a bankovky napůl 70–85. Vyndání okénkem.                                                                                                                                                                                                                                                                                                                                                                                            |
| 9   | Bude fungovat po vytahání kůže? | Retence nestojí na sevření. Vytahání zvětší jen cinkání mincí a trochu posune polohu víčka (plíšek 20,5, rezerva nahoře při k 1,24 jen 0,23).                                                                                                                                                                                                                                                                                                        |
| 10  | Existuje jednodušší řešení?     | Kratší víčko s magnetem mezi pásy proužku by ušetřilo ~40 mm kůže, ale s plností nevychází (oddíl 3 #2). Bez kování by šlo zasunout špičku pod poutko (záloha z kola 3, piplavé). Zůstává jazýček s magnetem.                                                                                                                                                                                                                                        |

**Rizika:**

- **R1** Závěs 1,0 bez ztenčení, únava, střídavý ohyb při otevření až na záda: V12 a zkušební kus
  (volitelně V6); zálohy A (P1 0,8) a B (ztenčení 0,6), oddíl 5.8.
- **R2** Víčko odstává nebo otevřené padá na ústí: od Kola 9 **přijaté** (závěs tvarovaný zavřený, víčko samo nestojí); u bankovek a mincí ho drží palec držící ruky. Ověřit P0-8, P2-10 a na zkušebním kusu (Z-2).
- **R3** Magnet ve smyku, proti pružení závěsu a u schodu nad svazkem karet: zkušební kus (volitelně
  V4); slabý nebo moc silný magnet se vymění (oddíl 5.4).
- **R4 (otevřené)** Karta vložená do oddílu bankovek proužkem dolů je u magnetu ~3,5 mm. Tři ústí
  jsou těsně za sebou. Zmírnění: pravidlo **„karty s proužkem vkládat proužkem k horní hraně (k
  víčku)“** (proužek je pak ≥ 19,9 mm od magnetu, ≥ 18,9 při dně o 1 mm níž; oddíl 4.2), upozornění v návodu (krok 22), horní
  hrana D1 v kontrastní barvě, D2 v kontrastním tónu, boky D1 přilepené (G2b). Pravidlo se dá
  porušit, proto riziko zůstává otevřené. Ověřit ho jde jen volitelnou V5.
- **R5** Látka kapsy zvedne špičku jazýčku při zasouvání dnem napřed (V3).
- **R6** Otevřená a obrácená peněženka vysype obsah.
- **R7** Samotná mince cinká (P2-8).
- **R8** Okénka na zádech ukazují obsah. Je to záměr, dá se hned zkontrolovat, kolik mincí nosíš.
- **R9** Karty a mince sedí na klínovém dně výš, než se počítá (P0-6).
- **R10** k > 1,24 (závěs se nevytvaruje plochý): dno karet a výška se musí zvednout (oddíl 12.3).
- **R11** Výřez pro palec: špička jazýčku se o něj při zavírání zachytí (nejhůř ve stavu A a s 1
  kartou, nebo s jazýčkem posunutým bočně), jazýček se do výřezu časem vtlačí, nebo se horní hrana F
  u výřezu odklopí (oddíl 4.6; P0-4, zkušební kus Z-3, podrobněji P2-7, volitelně V11).
- **R12 (mimo rozsah návrhu)** Přeplněná peněženka: plný stav C a k tomu karta omylem v oddílu
  bankovek (7 karet pod závěsem) zvedne magnet při k 1,24 na y 20,21, vršek 24,21 je nad koncem plíšku
  24,0 a magnet může z plíšku částečně sjet (horší držení víčka). Návrh ani kontroly v modelu tento
  stav nepokrývají a plíšek se kvůli němu neprodlužuje (rozhodnutí kola 6). V návodu stačí pravidlo
  z kroku 22 (karty jen do přední štěrbiny).
- **R13** Neztenčený ohyb dna 1,0: líc může v ohybu popraskat nebo ohyb odpružit. Zkouška V12 na
  odřezku před řezem P1; když líc popraská, přednostně záloha A (P1 0,8), B (ztenčení na 0,6) jen když A nejde, oddíl 5.8.
  Odpružení samo důvod k záloze není, ohyb udrží G4 a švy (Kolo 8).
- **R14** Šev S7 u magnetu: ocelová vidlička a jehly jsou k magnetu přitahované, nit na líci L1 může
  zvětšit mezeru magnet–plíšek. Ověří zkušební kus (volitelně V4(b) na odřezku se švem), oddíl 5.6.

---

## 9. Výrobní postup

**Čísla v krocích jsou jen pro výchozí střih** (P1 1,0, D1/D2 a L1 0,6). S koupenými kozinkami
(0,7–0,9, oddíl 10.1) a v zálohách se skoro vždy liší. Proto v kroku 0(a) vygeneruješ listy pro
změřenou kůži a **všechna čísla bereš z rámečku „Čísla pro postup“ na listu 4 těchto listů**: kóta
P1, osa ohybu, hrana vložky, pás závěsu, konec G3, plíšek, G2 a S6, očekávaná hrana víčka, značka
magnetu y_m,B a okno lepení. Číslo v textu kroku je jen příklad výchozího střihu. Nejcitlivější je
značka magnetu v kroku 17: s přepážkami 0,8 je okno lepení jen 11,50–11,63 (0,13 mm), ne 11,73–12,13.

0. **Před stavbou: nákup, listy, přípravky a tři povinné kroky** (rozhodnutí kola 8; rozpis večerů
   v 9.1). Dlouhé zkoušky z dřívějších verzí (V4 na odřezcích, V5, V6, V11) jsou jen volitelné
   **důkladné ověření** na konci oddílu 11. Žádný krok postupu na ně nečeká. V tomto pořadí:
   (0) **Nákup a měření:** objednat kůži podle 10.1 a ostatní podle seznamu v oddílu 10. Po dodání
   změřit posuvkou na několika místech P1 (kaštan), D1 (nebarvená kozinka), D2 (čokoládová) a L1
   (z nebarvené kozinky) a zapsat.
   (a) **Listy pro změřenou kůži:** `pnpm pattern:wallet-lid --divider <větší z D1 a D2> --lining <L1>`,
   a když se P1 liší od 1,0 o 0,05 a víc, přidej `--p1 <změřená P1>` (oddíl 12.4). Kontroly ohlásí
   česky, co neplatí (přepážky nad 0,92 střih odmítne, 10.1). Vytiskni 1:1 soubor `…-vse.pdf` s příponou
   (když vše vyjde 0,6 a 1,0, jsou to výchozí listy `penezenka-vicko-vse.pdf`) a zkontroluj úsečku
   50 mm (kap. 28). Úsečka neodhalí chybu měřítka 0,5 % (na P1 asi 1,2 mm), proto změř i kótu P1 na
   listu 1 a porovnej ji s rámečkem „Čísla pro postup“ na listu 4 (výchozí střih 231,66; tolerance
   ±0,5), jinak list znovu vytiskni.
   (b) **Přípravek:** jediný je vložka dna **aspoň 111 × 25 × 1,5** (o 5 mm na každé straně širší než díl; z karet
   vyjde asi 111 × 50, výška karet se nezkracuje, oddíl 5.8):
   ze 4 starých karet, 2 vrstvy na sobě (2 × 0,76 = 1,52), v každé 2 karty vedle sebe, spoje posunuté,
   slepit páskou, zkrátit na 111 a hranu do ohybu odstřihnout rovně o 4 mm; nebo jiný rovný pás 1,5 (oddíl 5.8,
   `bottomSpacer`, list 4). Vložka je ve všech variantách stejná. Kopyto ani opěrka závěsu se od Kola 9
   nedělají (závěs se tvaruje přes obsah, krok 16). Šablonu konce jazýčku z listu 4 (R10 s magnetem, ztenčením špičky, ryskou horní
   hrany L1 a otvory S7) a šablonu výřezu pro palec z listu 1 nalep na tvrdý papír a vyřízni **až po
   P0** (krok 0(c)): na variantě z V12 nezávisí, ale P0-4 může změnit výřez a P0-6 výšku. Když P0
   změnil vstupy, vyřízni je z nově vytištěných listů. Použiješ je na zkušebním i finálním kusu.
   (c) **Povinný krok 1 – papírový model P0** z vytištěných listů (oddíl 11, P0): vejde se 6 karet,
   bankovky složené napůl a 4 mince, víčko se zavře a výřez pro palec funguje. Co P0 změní ve
   vstupech, se přepočítá dřív, než se tisknou listy pro kůži.
   (d) **Povinný krok 2 – zkouška ohybu V12** (oddíl 11; asi 10 min práce, pak přes noc schnutí) na
   jednom odřezku kaštanu (P1 obou kusů je ze stejné kůže, 10.1; dva odřezky jen když zkušební kus
   děláš z jiné kůže, pak variantu určí horší výsledek). Namočit a přehnout lícem ven přes vložku 1,5
   a změřit polohu rýhy vůči vrcholu ohybu (oddíl 5.8). Varianta platí pro zkušební i finální kus
   (9.1). Projde, když líc nepopraská;
   platí pro ohyb dna i pro neztenčený závěs. Neprojde → **přednostně záloha A** (celý P1 z usně 0,8, nic se neztenčuje); záloha B
   (ztenčení, krok 4) jen když A nejde (useň 0,8 nesehnaná, nebo ve V12 popraská i ona) a V12 zopakovat na odřezku zvolené varianty. Odpružení samo důvodem k záloze
   není. Useň 0,8 na P1 kupuj až podle V12.
   (e) **Povinný krok 3 – zkušební kus** ze stejného kaštanu (oddíl 11): celý postup kroků 1–21 ve
   variantě z V12. Ověří magnet (zavřené víčko vydrží zatřesení a otočení dnem vzhůru a otevře se jedním
   prstem), závěs (otevřené víčko jde palcem udržet, po běžném používání bez prasklin), výřez pro palec a
   retenci obsahu; mimochodem i lepidlo na plíšek (G1), barvu na hrany a šití S7 u magnetu.
   **Finální kus se řídí tím, co na zkušebním kusu fungovalo** (vyměněný magnet, oddíl 5.4; jiná
   varianta, oddíl 5.8; úprava výřezu, oddíl 4.6). Teprve pak se řeže P1 finálního kusu.
1. **Listy pro řez a šablony:** platí listy z kroku 0(a). Když P0, V12 nebo zkušební kus něco
   změnily, vygeneruj listy znovu **jedním příkazem se vším, co platí**: záloha z V12 (např.
   `--skive-fold 0.6`; v záloze A zadej `--p1` změřenou tloušťku usně 0,8), k tomu
   `--divider <D>` (větší z D1 a D2) a `--lining <L1>` a případně `--p1 <změřená P1>`. Vytiskni je a znovu zkontroluj úsečku 50 mm a kótu
   P1 podle rámečku na listu 4 (tolerance ±0,5). **Hodnoty z P0** (k, δ pro Δ_k a Δ_c, t_bn, rozměry
   bankovek) přepínač nemá: dosadí se do `DEFAULT_LID_WALLET` v `src/lib/geometry/lid-wallet.ts`
   (pole `kDesign`, `kMax`, `wedgeLiftNom`, `wedgeLiftMax`, `billSheetMm`, `billFoldReserveMm`,
   `billHeightMinMm`, `billHeightMaxMm`, `billHalfWidthMinMm`, `billHalfWidthMaxMm`; oddíl 12.1) a pak
   se spustí stejný příkaz. Formulář „Listy pro vaši kůži“ v aplikaci je má (část „Výsledky P0 a jiný
   magnet“): k, zvednutí karet Δ_k a mincí Δ_c, bankovky a tloušťku magnetu (`magnetThicknessMm`) dosadí
   do stejných polí (`src/lib/patterns/lid-wallet-input.ts`: k nad k max → `kDesign` = `kMax` = k;
   δ = větší z Δ_k / (n_k · t_k) a Δ_c / t_c). Teprve pak nalep na tvrdý papír a vyřízni šablony z listu 1 (obrys pásu
   s okénky a otvory švů; použije se v krocích 2, 5 a 13) a zbylé šablony z listu 4 (okénka – kontrola
   polohy okének mincí v kroku 5 a okénka bankovek v kroku 8, plíšek – rozměr na plech v kroku 2,
   proužek otvorů S4/S5 v kroku 14).
2. **Řez:** P1 101 × kóta P1 z rámečku na listu 4 (výchozí střih 231,66; rovné řezy nožem u pravítka, obrys jazýčku a pásu podle listu 1, výřez
   pro palec až v kroku 5: horní hranu F řezat rovně u pravítka i přes výřez, který list 1 v obrysu má).
   Dokud je list 1 přilepený na líci, propíchnout skrz něj konce osy ohybu, čáry hrany vložky dna a
   přehybů závěsu u boků a středy výsečníků: Ø 8, Ø 12 okének mincí, Ø 10 výřezu a **Ø 14 okénka
   bankovek** (to se vysekává až v kroku 8 z líce B, kam se pak list 1 přiložit nedá). **Napojení jazýčku na pás** je vyduté (R4): **výsečník Ø 8**, pak tečné
   rovné řezy nožem (oddíl 5.5).
   D1 93 × 79,5 (nebarvená kozinka), D2 103 × 64 (čokoládová kozinka), L1 24 × 22 (z nebarvené
   kozinky jako D1, 10.1; tloušťka podle měření z kroku 0). **K2** 14 × 20,5 ve výchozím střihu
   (jinak rozměr z listu 3 a 4 dané varianty, např. při přepážkách 0,8 14 × 20) z pozinkovaného ocelového plechu 0,5
   (magnetem vyzkoušet už v obchodě): řezat pilovým listem na kov (v rámu nebo v ruce), nebo plech
   naříznout nožem u pravítka a v rýze ho zlomit ohýbáním sem a tam. Rohy R3 a otřep brusným papírem
   zrnitosti 120 na desce (nebo brusnou násadou v aku vrtačce), hrany **přelakovat** bezbarvým lakem na
   nehty.
3. **Značení na rub** (tužka, nezařezávat): osa ohybu dna a pás závěsu (nelepit, nešít) podle
   listu 2 a rámečku na listu 4 (výchozí střih v 62,21 a 142,99–150,99), hranice lepení G1–G4, okénka mincí a poloha D1 a D2,
   tedy to, co kreslí list 2. Čáry švů S1–S3 a S6 ani okénko bankovek na rub nepatří: list 2 je nekreslí,
   středy okénka bankovek jsou na líci z kroku 2 a švy se přenášejí z líce (kroky 9 a 13). Papír se na kůži
   obkreslit skrz nedá, proto: list 2
   nalep na tvrdý papír a vyřízni po obrysu, přilož ho na rub, rohy lepených ploch a konce čar
   propíchni jehlou do kůže a tečky spoj tužkou u pravítka. Osu ohybu dna, čáru hrany vložky dna (z rámečku na listu 4, výchozí 64,18; posunutou podle V12,
   oddíl 5.8; použije se v kroku 11) a přehyby závěsu (kontrola v kroku 16) vyznač
   navíc ryskou na obou bocích dílu. Všechno je souměrné podle x 50,5, na stranách nezáleží. „L“
   napiš zvlášť na rub F a na rub B. Otvory švů S1–S3 a S6 se později přenášejí přes šablonu z listu 1
   přiloženou na líc: propíchnou se jehlou a děrují vidličkou (S1–S3 v krocích 9 a 10 – šablona na líci B,
   děruje se z líce D2; S6 v kroku 13 – šablona na líci F).
4. **Rýha ohybu dna (výchozí, bez ztenčení):** na rubu vytlač podél osy ohybu (v z rámečku na
   listu 4, výchozí 62,21) rýhu tupým
   hrotem u ocelového pravítka (nic neřezat, stejný tlak po celé šířce; nejdřív na odřezku z V12).
   Pás závěsu se nijak neupravuje.
   **Záloha B (ohyb dna: jen když ve V12 popraská líc a záloha A nejde; závěs: poslední možnost, když závěs zkušebního kusu neprojde ani v záloze A):** nejdřív vygenerovat střih s
   `--skive-fold 0.6` / `--skive-hinge 0.6` (jiné délky P1, oddíl 5.8) a pak ztenčit z rubu pás ohybu
   nebo pás závěsu z 1,0 na 0,6 **v poloze podle listu 1 dané varianty** (např. `--skive-fold 0.6`:
   ohyb v 57,80–65,80, závěs se nemění; obojí: ohyb 57,80–65,80, závěs 141,85–156,97 na plno, náběh vně; tabulka v 5.8).
   Souřadnice výchozího střihu (58,21–66,21 a 142,99–150,99) v záloze neplatí. Přijatelný výsledek je
   **0,6–0,8** (polohu magnetu určí až hotový kus v kroku 17, změnu k zachytí měření v kroku 16).
   Okraje pásu jsou náběh, ne schod. V tomto pořadí:
   (a) **Nejlépe v dílně:** nechat pás ztenčit v ševcovské nebo brašnářské dílně se zvonovým
   ztenčovačem (rovný pás ohybu 8 × 101 včetně náběhů; pás závěsu 15,1 × 101 celý na plno a náběh
   2 mm vně pásu na obou stranách). P1 předat nařezaný s pásem vyznačeným na rubu a dílně to říct.
   (b) **Když to nejde:** brusným papírem zrnitosti 80 na rovném hranolku, pás ohraničit maskovací
   páskou; u pásu ohybu 8 mm brousit na plno střed 4 mm a 2 mm na každé straně nechat jako náběh; pás
   závěsu (15,1 mm) brousit na plno celý mezi čarami a náběh 2 mm udělat vně čar na každé straně
   (plné ztenčení musí pokrýt oba přehyby i v plném stavu). Nožem jen
   hrubě ubírat a nikdy ne blíž než na 0,8.
   (c) Tloušťku kontrolovat posuvkou (levná digitální, oddíl 10).
   (d) Nejdřív na odřezku. Stejným postupem (b) se ztenčí odřezek pro opakování V12 (krok 0(d)).
   Spodní hranu D2 (klín 3, končí pod S1 – SF9) zbrousit do tenka brusným papírem, nožem neztenčovat
   (to platí vždy, i ve výchozím střihu).
5. **Okénka mincí** v B z líce B (středy propíchnuté v kroku 2), na tvrdé desce: šablonou okénka z listu 4
   jen zkontrolovat polohu a před sekáním ji sejmout; Ø 12 na koncích (středy y 34 a 70), rovné řezy. Zkosit, leštit.
   **Výřez pro palec** v horní hraně F z líce F, na tvrdé desce (funkci ověří zkušební kus; volitelně předem V11 na odřezku): výsečník Ø 10 přes šablonu (zůstává přiložená) se
   středem na ose v 7,0 od horní hrany F (y 55,0), potom rovné řezy nožem od hrany F k tečnám díry,
   zastavit přesně na tečně. Rohy ústí R1 nedělat nožem, zaoblit brusným papírem (list 1). Nejdřív na
   papírovém modelu P0 (P0-4).
6. **Předběžné dokončení:** horní hrany D1 a D2, horní hrana F i s výřezem pro palec, spodní hrana
   a boky pásu víčka, boky jazýčku (brousit smirkem 220–400 na rovné destičce, zkosit z líce – bez
   zkosovače zaoblit brusným papírem na hranolku –, leštit; horní hrany D1 a D2 jen brousit a leštit,
   viz 5.5). Výřez pro palec zaoblit z líce **i z rubu** (o rubovou hranu dna U se může
   zachytit karta), vnitřek brousit a leštit kolíkem Ø 8 v aku vrtačce. Horní hranu D1 natřít barvou na
   hrany v tónu kontrastním k D1 párátkem ve 2 tenkých vrstvách (nejdřív na odřezku 0,6). Tokonole na
   plochy podle 5.7 (lepená místa přelepit páskou).
7. **G3:** D2 rubem na rub B: dno y 18–23, boky a střed **jen do y 80,57** (čára na listu 2; v záloze čára na listu 2 varianty, například `--skive-hinge 0.6`: 80,25, obojí: 79,75),
   horních 1,43 mm D2 (ve výchozím střihu) nelepit (pás závěsu). Hranici lepení přelepit maskovací páskou. D2
   přesahuje 1 mm na každé straně. Přitlačit.
8. **Okénko bankovek** skrz D2 + B z líce B: Ø 14 na koncích (středy x 50,5, y 32 a 63, propíchnuté
   v kroku 2; polohu zkontrolovat šablonou okénka z listu 4), rovné řezy u pravítka od tečny k tečně.
   Zkosit, leštit.
9. **Rýsování a značení S1–S3 na líci D2:** list 1 (P1 z líce) na líc D2 přiložit nejde, proto
   jedno z dvou (nejdřív na odřezku D2 + B): (a) šablonu P1 z listu 1 přiložit na líc B podle obrysu
   a všechny otvory S1–S3 propíchnout jehlou skrz B i přilepenou D2, pak na líci D2 děrovat do vpichů;
   nebo (b) přiložit D2 z listu 3 na líc D2 podle hran (díl je souměrný, rub / líc nevadí); přes vyříznutou
   šablonu se obkreslit nedá, proto konce čar S1 (y 22,0) a S2 / S3 (x 36 a 65) propíchnout jehlou skrz
   šablonu, šablonu sejmout a vpichy spojit tužkou u pravítka; otvory odměřit po 4 mm: S1 od osy x 50,5 na obě strany,
   S2 / S3 od horního otvoru y 76 dolů (v záloze čísla z listu 1 varianty).
10. **Děrovat S1, S2, S3** z líce D2 (na PE desce), vidlička vždy stejně natočená při pohledu na líc D2
    s horní hranou od sebe. **Šít S1–S3**, konce 2 otvory zpět.
11. **Mokrý ohyb dna** 1,0 přes vložku 1,5 (oddíl 5.8): pás ohybu navlhčit, vložku (aspoň 111 × 25) položit na
    rub B **hranou na čáru hrany vložky** (na listu 1 a 2, v z rámečku na listu 4, výchozí 64,18;
    1,96 za rýhou z kroku 4 směrem k B; rysky na obou bocích; posunutá podle měření V12, oddíl 5.8),
    aby střed ohybu padl na rýhu; F přehnout přes vložku lícem ven, fólie mezi líc a prkénka, stáhnout
    svěrkami (bez svěrek náhrada z oddílu 10), sušit přes noc, vložku vysunout bokem.
12. **G1 + G2 + G2b:** F položit naplocho **rubem nahoru** na PE desku, celou na desce, ohyb dna u hrany
    desky; B (s přilepenou a sešitou D2) stojí nad ohybem nahoru, ohyb dna zůstává ~90°. B nejde
    nechat viset dolů přes hranu jako v kroku 13: tam leží F lícem nahoru, s rubem nahoru by se ohyb
    musel přehnout obráceně. Vyschlý ohyb chce odpružit zpátky k F, proto B zezadu opřít o knihu nebo
    krabičku a horní hranu B k ní přichytit kolíčkem nebo páskou, aby se B nesklopila na lepidlo. Plíšek (0,5; 0,8 jen jako varianta finálního kusu, oddíl 5.4) na rub F
    (y z rámečku na listu 4, výchozí 3,5–24), pak D1 rubem na rub F (G2 z rámečku, výchozí y 2–26,
    a boky x 4–5 / 96–97, výchozí do y 61), přes plíšek. Po tomto kroku už plíšek vyměnit nejde (magnet ano, oddíl 5.4). D1 má šířku přesně 93 bez montážní vůle, proto: na D1 i na
    rub F vyznačit osu x 50,5 a D1 přikládat podle osy (chyba se rozdělí na obě strany), zdola od y 2
    nahoru. Pásy G2b (1 mm) ohraničit maskovací páskou z obou stran a lepidlo nanášet párátkem, aby
    nepřeteklo do kapsy karet. **Pásku strhnout hned po nanesení lepidla**, ještě než zavadne a než se
    přiloží D1, jinak zůstane zalepená pod D1. Po přiložení změřit: kapsa mezi pásy G2b ≥ 90,5 a D1 od hrany F
    ≥ 3,5 mm (jinak zasáhne do S4 na x 3). Přitlačit paličkou přes desku položenou na D1 (F leží
    na PE desce, takže úder má oporu).
13. **S6:** F otočit a položit naplocho lícem nahoru na PE desku u hrany stolu, B nechat viset přes hranu
    (ohyb dna na hraně desky), aby F ležela celá na podložce. Otvory podle šablony z listu 1 přiložené
    na líc F (propíchnout jehlou a děrovat vidličkou přesně jako u S1–S3 v kroku 10), v y S6 z rámečku
    na listu 4 (výchozí 25; x 10,5…38,5 a 62,5…90,5), vidlička natočená jako v kroku 10 při pohledu na
    líc F s horní hranou od sebe. Šít, konce 2 zpět.
14. **G4** (boční pásy F–D2 a F–B): díl nejdřív nanečisto složit a zkontrolovat, teprve pak nanést
    lepidlo. Kontaktní lepidlo chytne hned při dotyku, proto přikládat **od ohybu dna nahoru** a F
    přitom rovnat podle boků B. Na slepeném kusu narýsuj **čáru švu 3,0 od hrany** (kružidlem nebo
    rýhovačem 3,0, bez nich tužkou u pravítka podle proužku z listu 4, oddíl 5.6) a otvory **S4, S5**
    přenes z papírového proužku otvorů (list 4), počítáno od **76** dolů. **Děrovat S4, S5** zepředu
    skrz všechny vrstvy ve třech úsecích (y 8–52 z líce F; 56–68 po jednom otvoru, 56 a 60 z líce F,
    64 a 68 z líce D2, s odřezkem 1,0 na líci D2 těsně u hrany F; 72–76 z líce D2; oddíl 5.6). Šít od 76
    dolů, steh 60–64 zdvojit (jak, ověřit na zkušebním kusu), konce 2 zpět.
15. **Boky:** zarovnat nožem na 101,0 (D2 přečnívá), **spodní rohy nechat hranaté** (nic
    nevyplňovat, nezaoblovat), brousit, zkosit z obou líců, leštit – i u ohybu dna. (Volitelně rohy R4
    s výplní mezery ohybu, oddíl 5.5; rozhodnutí kola 6.)
16. **Tvarování závěsu** přes obsah (oddíl 5.8): do peněženky 2 staré karty a místo bankovky papír
    asi 70 × 65 přeložený nebo ve vrstvách, až posuvka ukáže asi 0,7 mm (nebo bankovku ve fólii;
    stav B), navlhčit jen pás závěsu, víčko zavřít přes obsah a nechat přes noc
    zavřené pod knihou (fólie mezi závěs a knihu). Kopyto ani opěrka nejsou potřeba. Rysky přehybů z kroku 3 jen ukazují, kde model přehyby se
    stavem B čeká (tvar dává obsah, ne rysky): po zavření zkontrolovat, jestli přehyby vyšly zhruba
    u nich, jinou polohu zapsat k měření k (r_i 1,0 je předpoklad, oddíl 5.8). Pak **změřit k:** poloha
    hrany pásu víčka jako y od spodní hrany (když měříš od horní hrany F, y = y_Ft − naměřená vzdálenost)
    ve stavech A, B a C (se 4 × 50 Kč), zvlášť nad sloupci a nad
    středem, stejně jako v P0-3. Spočítej **k = (y_C − y_A) / (P(C) − P(A))**; dělitel je v rámečku na listu 4 (výchozí střih 8,62, oddíl 4.1; při přepážkách 0,8 8,39).
    Model dává očekávané polohy v rámečku na listu 4 (výchozí střih **A 53,9 / B 56,6 / C 62,5**,
    při horším k 1,24 A 53,2 a C 63,9). **Když k > 1,24:** na zkušebním
    kusu k zapiš a přepočítej střih pro finální kus (`kDesign`, `kMax`, oddíl 12.3); na hotovém kusu
    už přepočet nic nezmění (dno karet, plíšek i výška jsou dané), jde jen nosit méně (omezit plnost).
    Po vyschnutí se víčko vrací zavřené a **otevřené samo nestojí**. Tak to má být (oddíl 5.8), při
    bankovkách a mincích ho drží palec.
17. **Poloha magnetu:** stav B (2 staré karty, v bankovkách 1 bankovka nebo papír 0,7 z kroku 16 –
    **ne karta**, bez mincí). Zkušebním magnetem najdi po líci F hrany plíšku (mají vyjít y plíšku
    z rámečku na listu 4, výchozí 3,5 a 24,0) a označ páskou **značku y_m,B z rámečku** (výchozí 11,9).
    Okno lepení je tamtéž (výchozí 11,73–12,13). S přepážkami 0,8 je jen 11,50–11,63, tedy asi
    0,13 mm: značku proto **měř posuvkou** od spodní hrany a po nalepení pásky přeměř. Zavři víčko a ryskami na
    bocích jazýčku přenes značku na jazýček.
18. **G5 + G6:** rub konce jazýčku zdrsnit. Magnet na rub jazýčku (střed na značce a ose) přilepit
    **dvousložkovým epoxidem** (doba zpracování podle obalu) a nechat ztuhnout (podle návodu epoxidu, orientačně 30 min –
    ověřit), aby se magnet při natírání a přikládání L1 neposunul z osy. Teprve pak natřít rub jazýčku
    kolem magnetu a L1 (nebarvená kozinka) kontaktním lepidlem, nechat zavadnout a L1 přiložit horní hranou
    na rysku 10 mm nad středem magnetu (šablona, list 4). Přitlačit prsty nebo převalovat hladkým
    kolíkem, **přes magnet paličkou netlouct** (neodym se může odštípnout). Peněženku polož
    na záda, víčko narovnej nahoru (v přímce se zády, ne přehnuté na záda) a pás víčka zatiž knihou
    mimo magnet. Magnet musí být aspoň pár cm od plíšku, jinak ho plíšek přitáhne. Víčko se samo
    zavírá (krok 16), bez zátěže ho nenechávej. Nechat 24 h
    vytvrdit, teprve pak šít S7 (krok 20) a zkoušet držení víčka.
19. **Ořez špičky a boků L1:** 7,0 pod značkou (rysky z kroku 17) podle šablony, nožem **skrz jazýček
    i L1 najednou**; zároveň seříznout i boky L1 načisto s boky jazýčku (přířez 24 je o 2 mm na každé
    straně širší než jazýček 20) (střed oblouku R10 leží 10,0 nad špičkou, tj. 3,0 nad středem magnetu). Pak **jen
    posledních 2,5 mm** špičky zbrousit do klínu **brusným papírem na hranolku** z líce i z rubu,
    ne nožem (na malém slepeném kousku by nůž sklouzl, odtrhl L1 nebo narazil na magnet). Brousit
    jen mezi špičkou a ryskou 2,5 mm od špičky; dál od špičky než ryska nebrousit. Stačí, když je hrana na konci asi 0,5–0,7 a zaoblená. (Dřív se
    řezalo před lepením magnetu a L1 zvlášť – sjednoceno po nezávislém ověření, SF6, oddíl 13.)
20. **S7 a hrany jazýčku:** šablonu konce jazýčku z listu 4 přilož na líc jazýčku podle obrysu špičky
    a propíchni jehlou 8 otvorů S7 (U kolem magnetu, ke špičce otevřené, oddíl 5.6). **Podložka:**
    jazýček leží rubem dolů a magnet s L1 z rubu vystupuje asi o 1,5 mm, kus by se na podložce
    kolébal. Proto si připrav podložku s otvorem: dva odřezky usně 1,0 slepené na sebe (nebo odřezek
    desky 2 mm), uprostřed proseknuté výsečníkem Ø 10. Magnet leží v otvoru, kůže kolem naplocho
    (otvory S7 jsou asi 6,1 od středu magnetu, otvor podložky má poloměr 5, takže pod nimi je plná
    podložka). Podložku polož na PE desku. **Děrování:** z líce jazýčku vidličkou 4 mm; svislé boky
    (x 44,5 a 56,5) dvouzubou částí vidličky svisle, horní řadu (14 nad špičkou) vodorovně, rohové
    otvory (44,5 / 14 a 56,5 / 14) jen jedním krajním zubem nasazeným do otvoru řady. Na bocích je
    vidlička otočená o 90°, natočení zubů zvol tak, aby šikmé otvory na líci jazýčku měly stejný sklon
    jako v horní řadě – vyzkoušet na odřezku. Paličkou lehce, vidlička i jehly jsou ocelové
    a magnet je přitahuje. **Náhrada:** otvory předpíchnout jehlou na propichování přes šablonu a
    vidličkou je jen dorazit, nebo je bez vidličky zvětšit jehlou (ověřit na odřezku). Šij sedlovým
    stehem, konce 2 otvory zpět. Pak hrany jazýčku brousit, zkosit, leštit.
21. **Konečná úprava:** balzám (hlavně na závěs, snášenlivost ověřit na odřezku), volitelně slepá
    značka na F vlevo dole mimo jazýček a švy.
22. **Upozornění pro uživatele** (přiložit k peněžence, krátce): „Karty zasouvej do první štěrbiny
    u přední stěny (na straně jazýčku), kartu s magnetickým proužkem proužkem k horní hraně (k víčku).
    Do štěrbiny za barevnou hranou patří jen bankovky: karta by tam ležela u magnetu a mohla by přijít
    o proužek. Při vyndávání bankovky a mince drž víčko palcem, netlač ho až na záda. Při zavírání
    přitlač jazýček dole u magnetu, ne uprostřed. Otevřenou peněženku neotáčej dnem vzhůru.“ Důvod je v oddílu 4.2 (R4) a 4.6 (R11). Pravidlo riziko jen zmenšuje,
    ověřit ho jde jen volitelnou V5.
23. **Testy** podle oddílu 11: na zkušebním kusu povinné zkoušky Z-1 až Z-4 (a podle chuti další
    P2), na finálním kusu stačí zkontrolovat, že víčko drží, otevře se jedním prstem a otevřené jde palcem udržet.

### 9.1 Časy schnutí a lepení

Hodnoty jsou orientační, **ověřit podle návodu konkrétního lepidla a barvy** a na odřezku.

| Úkon                                | Jak a jak dlouho                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| kontaktní lepidlo (G1–G4, G6)       | nanést na obě strany, nechat zavadnout 10–15 min, spojit a přitlačit; děrovat a šít nejdřív za 1 h, plně zatížit za 24 h |
| epoxid magnetu (G5)                 | dvousložkový epoxid (doba zpracování podle obalu); než se víčko zatíží zavíráním nebo zkouškou držení, 24 h              |
| barva na hrany                      | 2 tenké vrstvy, mezi nimi 20–30 min                                                                                      |
| navlhčení třísločiněné usně         | houbičkou, pak počkat, až se barva usně skoro vrátí k suché (5–10 min), teprve potom ohnout nebo tvarovat                |
| ohyb dna (krok 11), závěs (krok 16) | sušit přes noc (12–24 h), ne u topení                                                                                    |

**Harmonogram (orientační; časy lepidel podle návodu, ověřit; počty večerů jsou odhad, ne
změřené).** Před prvním kusem jsou **2 večery přípravy** a noc schnutí V12. Jeden kus pak podle
rozpisu níže zabere **6 večerů** a tři až čtyři noci schnutí; kdo je zkušenější, může sloučit
první a druhý večer a také třetí a čtvrtý, pak jsou to **4 večery** (odtud rozsah 4–6 večerů).
Zkušební i finální kus se stavějí stejným rozpisem, žádný večer nečeká na dlouhé zkoušky:

- **Předem:** objednávka podle 10.1 a seznamu v oddílu 10 (krok 0(0)); čeká se na dodání.
- **1. večer přípravy:** krok 0(0)–(b): změřit dodanou kůži, vygenerovat a vytisknout listy pro
  změřenou tloušťku, kontrola úsečky i kóty P1, přípravek (vložka dna ze starých karet).
- **2. večer přípravy:** **P0** papírový model (krok 0(c)); když P0 změní vstupy, přepočítat
  a vytisknout nové listy (krok 1). Pak šablony konce jazýčku a výřezu (krok 0(b)) z platných listů.
  Na konci **V12** (krok 0(d)) na jednom odřezku kaštanu: orýhovat, namočit, přehnout přes vložku,
  na noc stáhnout mezi prkénky.
- **Další den:** odřezek V12 prohlédnout a změřit rýhu vůči vrcholu ohybu → výchozí střih, nebo
  záloha; varianta platí pro zkušební i finální kus. V záloze A koupit useň 0,8 a V12 zopakovat na ní
  (další noc); v záloze B odřezek ztenčit (krok 4), V12 zopakovat a vygenerovat listy varianty
  (krok 1).
- **Zkušební kus:**
  - **1. večer:** kroky 1–6 (listy, řez P1, D1, D2, L1 a plíšku K2 s lakováním hran, značení na rub,
    rýha ohybu, okénka mincí a výřez pro palec, předběžné dokončení hran včetně barvy na D1 ve 2
    vrstvách a Tokonole). Ve výchozím střihu se nic neztenčuje, krok 4 je jen rýha ohybu; v záloze B
    ztenčení z dílny už hotové, nebo v tomto večeru brusným papírem.
  - **2. večer:** kroky 7–10 (G3, mezi lepením a děrováním aspoň 1 h; okénko bankovek, rýsování,
    děrování a šití S1–S3), na noc krok 11 (mokrý ohyb dna).
  - **3. večer:** kroky 12–13 (G1/G2/G2b, mezi lepením a S6 aspoň 1 h), plíšek 0,5.
  - **4. večer:** kroky 14–15 (G4, mezi lepením a děrováním S4/S5 aspoň 1 h; boky zarovnat a vyleštit,
    rohy hranaté, bez výplně), na noc krok 16 (tvarování závěsu přes obsah).
  - **5. večer:** měření k (krok 16), kroky 17–18, na noc (24 h) vytvrzení magnetu.
  - **6. večer:** kroky 19–21 (ořez špičky, šev S7 kolem L1, hrany jazýčku), pak povinné zkoušky
    zkušebního kusu Z-1 až Z-4 (oddíl 11).
- **Několik dní běžného používání zkušebního kusu** (délku zvol sám): závěs bez prasklin, víčko pořád
  drží zavřené. Když magnet drží slabě nebo moc silně, vyměnit ho (oddíl 5.4) a zkusit znovu.
- **Finální kus** stejným rozpisem (1.–6. večer), s tím, co na zkušebním kusu fungovalo; na konci
  krok 22 a kontrola z kroku 23. P1 je ze stejného kaštanu, V12 už proběhla; když se useň P1
  mezitím změní, udělat před 1. večerem finálního kusu V12 na odřezku nové usně (noc schnutí).

---

## 10. Nástroje a materiál (bez cen a odkazů)

**Materiál** (zkušební i finální kus; odškrtni, co máš):

- [ ] **kůže, jedna objednávka z 10.1:** kaštan 20 × 50 cm (P1 zkušebního i finálního kusu,
      odřezky na V12, krok 4(d) a podložku S7), nebarvená kozinka 5 dm² (D1 a L1), čokoládová
      kozinka 5 dm² (D2); po dodání změřit (krok 0(0))
- [ ] useň 0,8 **jen v záloze A**, kupuje se až podle V12. Záloha A platí pro zkušební i finální kus,
      proto stejně jako u usně 1,0 kus 20 × 50 cm (2 × přířez P1 110 × 240 a odřezek 30 × 40 na
      zopakování V12); kus 11 × 24 cm stačí jen na jeden P1
- [ ] magnet Ø 8 × 1,5 axiální: **3 ks** (zkušební kus, finální kus, hledací na krok 17) + po
      **1 silnějším a 1 slabším** stejného Ø 8 na výměnu (oddíl 5.4), pokud je prodejce nabízí;
      velikost, třídu a sílu ověřit u prodejce
- [ ] pozinkovaný ocelový plech 0,5 na **2 plíšky** (rozměr z listu 3, výchozí 14 × 20,5; magnetem ověřit v obchodě);
      plech 0,8 (oddíl 5.4) jen když na zkušebním kusu nepomůže ani výměna magnetu, kupuje se až pak
- [ ] bezbarvý lak (na nehty) na hrany plíšku
- [ ] kontaktní lepidlo na kůži
- [ ] dvousložkový epoxid (doba zpracování podle obalu) na magnet
- [ ] barva na hrany v tónu D2 (horní hrana D1, přilnavost ověřit)
- [ ] Tokonole
- [ ] voskovaná nit (i na šev S7)
- [ ] balzám na kůži
- [ ] potravinová fólie (ohyb dna, závěs)
- [ ] **4 staré karty** na vložku dna (oddíl 5.8; nebo jiný rovný pás 1,5) a lepicí páska
- [ ] 2 staré karty a kancelářský papír na tvarování závěsu (krok 16) a krok 17, pár dalších starých
      karet na drobné zkoušky

Deska na kopyto ani karton na opěrku se od Kola 9 nekupují. Na volitelné důkladné ověření (oddíl 11)
navíc: pásky a odřezky usně na V4, V5, V6 a V11, další magnety a kousky plíšku 0,5 a 0,8 do sestav,
obětované LoCo karty pro V5.

**Nástroje:** nůž, ocelové pravítko, podložka na řezání · tvrdá PE deska pod děrování · vidličky
4 mm · palička · 2 sedlářské jehly · výsečníky Ø 8, 10, 12, 14 (víc střih nepotřebuje, model je vypisuje na listu 1; Ø 15 od Kola 11 ne) · brusný papír (80, 120 a jemnější)
· rovný hranolek · dřevěný kolík Ø 8 · aku vrtačka · svěrky · pilový list na kov · jehla na
propichování · tupý hrot na rýhu ohybu dna (krok 4; třeba vypsaná propiska, ověřit na odřezku) ·
tužka, maskovací páska, párátka · nůžky (karty vložky dna) ·
**2 hladká prkénka** (mokrý ohyb dna, krok 11; i náhrada šicího svěráku, tabulka náhrad níže).
**Ve výchozím střihu nejsou potřeba žádné nástroje na ztenčování** – ztenčuje se jen v záloze B
(krok 4: dílna se zvonovým ztenčovačem, nebo brusný papír 80 na hranolku).
**Jediný nástroj, který je třeba dokoupit (pokud ho nemáš): levná digitální posuvka** – bez ní se nedají zkontrolovat tloušťky usní
(P2-4; v záloze B i ztenčení, krok 4) ani rozměry bankovek (P0-1).

**Náhrady za nástroje, které v domácí dílně nejsou** (postup kola 5; ověřit na odřezku):

| Nástroj z původního seznamu         | Náhrada                                                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| zkosovač hran                       | hrany zaoblit (ne srazit) brusným papírem na hranolku                                                                                     |
| leštítko                            | dřevěný kolík Ø 8 upnutý do aku vrtačky na nízké otáčky, s vodou nebo Tokonole                                                            |
| (vyduté hrany: výřez, konce okének) | brusný papír namotaný na kolíku Ø 8 v aku vrtačce                                                                                         |
| kružidlo nebo rýhovač 3,0           | čáru švu rýsovat tužkou u pravítka podle proužku z listu 4                                                                                |
| nůžky na plech a pilník (K2)        | pilový list na kov, nebo naříznout nožem a zlomit ohýbáním; rohy a otřep brusným papírem (krok 2)                                         |
| ztenčovač (pásy 8 mm, jen záloha B) | dílna se zvonovým ztenčovačem, jinak brusný papír 80 na hranolku (krok 4)                                                                 |
| vidlička s 1 a 2 zuby               | krajní zub vícezubé vidličky nasadit do posledního otvoru (oddíl 5.6)                                                                     |
| siloměr na zavazadla (volitelná V4) | kuchyňská váha a provázek (100 g ≈ 1 N)                                                                                                   |
| lupa (V12, volitelně V6)            | fotit mobilem makrem                                                                                                                      |
| šicí svěrák                         | dvě prkýnka stažená svěrkou                                                                                                               |
| svěrky (ohyb dna, V6, V12, šití)    | prkénka zatížit knihami nebo závažím, nebo stáhnout silnými gumičkami či kancelářskými klipy; tlak ověřit na odřezku, jinak svěrky koupit |

### 10.1 Nákup kůže (zkušební a finální kus)

Jediné místo dokumentu s obchody, odkazy a cenami. **Od Kola 9 jedna objednávka v jednom českém
obchodě** (Šijeme z kůže), která pokryje zkušební i finální kus. Odkazy a ceny **ověřeno 29. 9. 2026**
na stránkách produktů, s DPH, **bez poštovného (poštovné ověřené není)**. Ceny i sklad se mění, před
objednávkou je znovu zkontrolujte. Kůže na dm² obchod nařeže na míru; podle stránky obchodu se
kůže nařezaná na míru nedá vrátit.

**Objednávka (Šijeme z kůže):**

| Co           | Produkt                                                                                                                                   | Cena         | Množství                                                                          | Na co                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| P1, useň 1,0 | [Třísločiněná kůže kaštan 0,9–1 mm](https://www.sijemezkuze.cz/trislocinena-kuze-kastan-0-9-1-mm-p4698)                                   | 19,90 Kč/dm² | 10 dm² = **199 Kč**; do poznámky: „Prosím v jednom kuse jako obdélník 20 × 50 cm“ | P1 zkušebního i finálního kusu (2 × přířez 110 × 240) a odřezky na V12 (30 × 40), krok 4(d) a podložku S7 |
| D1 + L1      | [Kozinka třísločiněná nebarvená valchovaná 0,8–1 mm](https://www.sijemezkuze.cz/kozinka-trislocinena-nebarvena-valchovana-0-8-1-mm-p4906) | 13,90 Kč/dm² | 5 dm² = **69,50 Kč**                                                              | 2 × D1 93 × 79,5 (zkušební a finální), 3 × L1 24 × 22 (i náhradní), zkouška barvy                         |
| D2           | [Kozinka třísločiněná čokoládová 0,7–0,9 mm](https://www.sijemezkuze.cz/kozinka-trislocinena-cokoladova-0-7-0-9-mm-p4851)                 | 13,50 Kč/dm² | 5 dm² = **67,50 Kč**                                                              | 2 × D2 103 × 64 a odřezek                                                                                 |
| **Celkem**   |                                                                                                                                           |              | **336 Kč** + poštovné (neověřené)                                                 |                                                                                                           |

**Výsečníky (Kolo 11, jen kdo je nemá):** [CraftPoint – Výsečníky na kůži 2-20mm](https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu),
průměr dle výběru. Ověřeno **29. 9. 2026** přes `…/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu.js`
(ne z HTML stránky): nabídka 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20 mm, **Ø 15 v ní není**. Potřebné
Ø 8 (29 Kč), Ø 10 (35 Kč), Ø 12 (40 Kč), Ø 14 (46 Kč) byly skladem, celkem **150 Kč** s DPH bez
poštovného (neověřené). Kvalitu a ostrost ověřit na odřezku.

Kontrast D1 / D2 dává přírodní světlá proti čokoládové (R4). Barvu na horní hranu D1 zvolit v tónu
D2. Useň 0,8 na zálohu A se kupuje až po neúspěšné V12 (příloha níže).

**Po dodání změřit posuvkou** P1 a obě kozinky na několika místech kusu (tloušťka 0,8–1 a 0,7–0,9
je rozsah z názvu produktu, skutečnou tloušťku určí až měření). Pak vygenerovat listy pro naměřenou
tloušťku: `pnpm pattern:wallet-lid --divider <větší z D1 a D2> --lining <L1>` (krok 0(a), oddíl 12.4).
**P1 změř taky:** když se liší od 1,0 o 0,05 a víc, přidej `--p1 <změřená>` (oblouk ohybu a závěs
se počítají z tloušťky P1). Podle modelu projdou přepážky jen do **0,92** (při 0,9 je plná tloušťka
**11,96**, při 0,93 **12,02** a při 1,0 **12,16**, to je nad hranicí ≈ 12 a skript střih odmítne).
Model má pro D1 i D2 jednu tloušťku (zadává se větší z obou), takže **kus D1 nebo D2 silnější než
0,92 nejde použít**: vyřízni díl z tenčího místa kusu, nebo kup tenčí kozinku. Horní část rozsahu
nebarvené kozinky (0,8–1) tak střih odmítne. Podšívka L1 do 1,0 plnou tloušťku v pásu mincí nemění,
ale mezera magnet–plíšek vzroste z 1,6 na 1,6 + (t_L − 0,6), při L1 0,9 na 1,9: magnet drží slaběji
(Z-1, případně silnější magnet podle 5.4). Mez L1 1,0 je jen doporučení: model sílu magnetu
nepočítá a přepínač `--lining` přijme i silnější L1 (až 1,2) bez varování. Měkkost kozinek
D1/D2 nevadí, nenesou tvar.

**Proč musí mít zkušební kus stejné činění a podobnou tloušťku.** Zkušební kus ověřuje právě to, co
závisí na materiálu: V12 (praská líc v ohybu přes vložku 1,5?), mokré tvarování ohybu dna (krok 11)
a závěsu (krok 16), závěs bez prasklin (Z-2) a magnet přes mezeru L1 + F (Z-1). Proto je P1 obou kusů
ze stejné kůže (jedna V12 stačí, zkušební kus ověří přesně finální materiál) a tloušťku změřit
posuvkou (oblouk v oddílu 5.3 je počítaný pro 1,0; jinou tloušťku zadej `--p1`, viz výše).

**Na co se zeptat prodejce (do poznámky k objednávce):** „Dobrý den, prosím kaštan 0,9–1 mm v jednom
kuse jako obdélník 20 × 50 cm, pokud možno z pevné části kůže bez vad a co nejblíž 1,0 mm. U kozinek
prosím kusy nejvýš 0,9 mm, nejlépe 0,7–0,8 mm (silnější nepoužiji). Jsou obě kozinky čistě
třísločiněné?“

**Příloha – dřívější průzkum (29. 9. 2026, jen pro případ, že objednávka nevyjde):** náhradní P1:
Šijeme z kůže, třísločiněná hnědá, varianta 1–1,2 mm (19,50 Kč/dm²; při 1,2 změřit a zadat t_P),
nebo Kůže Vlček, hovězí světle hnědá 1–1,2 lícová (A4 112 Kč; může být měkčí, ověřit u prodejce).
Záloha A (useň 0,8): pevnou třísločiněnou 0,8 v kusu aspoň 11 × 24 cm se ověřit nepodařilo; kandidát
je Pull Up Crazy Horse 0,8–1,2 ze Šijeme z kůže (22,50 Kč/dm², ověřit u prodejce), jinak záloha B
(oddíl 5.8). Useň přesně 0,6 žádný prověřený obchod nenabízí. Zahraniční obchod (Decocuir, useň
0,5 a 1,0) se nedoporučuje, doručení do ČR ověřené není. Nedoporučeno: kraje hlazenice (tloušťka
0,7–1,5 v jednom kusu), štípenka (nemá líc), měkké podšívkové usně a chromočiněná nappa.

---

## 11. Plán prvního prototypu

**Povinné před řezem finálního kusu jsou tři kroky** (krok 0, rozhodnutí kola 8): papírový model
**P0**, zkouška ohybu **V12** a **zkušební kus**. Dlouhé zkoušky (V4 měření na odřezcích,
V5 týden u magnetu, V6 10 000 cyklů, V11) jsou jen volitelné **důkladné ověření** na konci oddílu;
harmonogram (9.1) na ně nečeká a žádný krok postupu na nich nezávisí.

### P0 – papírový model 1:1 (povinný, 2. večer přípravy)

Z tvrdšího papíru podle listů 1–3 slep P1, D1 a D2 (lepicí páska místo švů), dovnitř skutečné karty,
bankovky a mince. **Minimum:** vejde se 6 karet (P0-7), bankovky složené napůl (P0-1, P0-2), 4 mince
(P0-5, P0-7), víčko se zavře (P0-3, P0-8) a výřez pro palec funguje (P0-4).

| #    | Co ověřit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Co zapsat                   | Jak upravit                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| P0-1 | vejdou se všechny bankovky 100–5000 Kč napůl? (posuvkou rozměry a tloušťka 10 ks)                                                                                                                                                                                                                                                                                                                                                                                                                    | rozměry, t_bn(1), t_bn(3)   | jiná t_bn → přepočet T a tloušťky (oddíl 12)                                                                                               |
| P0-2 | jde nízká 100 Kč okénkem posunout a chytit?                                                                                                                                                                                                                                                                                                                                                                                                                                                          | vyčnívání v mm (cíl ≥ 15)   | < 15 → prodloužit okénko dolů                                                                                                              |
| P0-3 | **k**: poloha rysky na jazýčku ve stavech A, B, C, **C se 2 + 2 mincemi nahoře**, zvlášť nad sloupci a nad středem                                                                                                                                                                                                                                                                                                                                                                                   | y_A, y_B, y_C → k = Δy / ΔP | k > 1,24 → zvednout dno karet a výšku (oddíl 12.3) nebo přijmout menší plnost                                                              |
| P0-4 | **výřez pro palec 10 × 12** (pomůcka jen pro přední kartu) s 1, 2 a 6 kartami: (a) vysunout přední kartu palcem ve výřezu třením nahoru, (b) vytáhnout zadní kartu po vyndání předních; u obou úspěch a čas. Vysouvá se svazek s přední kartou? Zasunout kartu s vystouplým písmem a prohnutou kartu – zachytí se o dno U? Zavírání 20× ve stavech **A (bez karet), 1 karta**, B a C, navíc s jazýčkem posunutým o 3 mm vlevo i vpravo: zachytí se špička o výřez, zajede pod hranu dna U nebo za F? | jde / nejde, jak, čas       | nejde → upravit výřez jen v mezích oddílu 4.6 (jazýček ho musí přikrýt i posunutý o 3 mm), zkosit rubovou hranu dna U, nebo výřez vynechat |
| P0-5 | mince: vysunutí jedné, vložení do ústí; 50 Kč ve sloupci volně klouže                                                                                                                                                                                                                                                                                                                                                                                                                                | jde / nejde                 | délka okénka, šířka sloupce                                                                                                                |
| P0-6 | **zvednutí na klínu dna:** výška spodní hrany svazku 6 karet nad čarou G2 a sloupce 2 × 50 Kč nad G3a                                                                                                                                                                                                                                                                                                                                                                                                | Δ_k, Δ_c                    | Δ_k ≠ 2,28 nebo Δ_c ≠ 1,25 → dosadit (oddíl 12.1), přepočítat strop a výšku, případně posunout čáry lepení dolů                            |
| P0-7 | plný stav: 6 karet + 3 bankovky + 4 × 50 Kč v kapse 93                                                                                                                                                                                                                                                                                                                                                                                                                                               | těsné / volné               | těsné → kapacita 5 karet nebo menší t_bn                                                                                                   |
| P0-8 | celý sled s otevřeným víčkem: palec držící ruky drží víčko (samo nestojí, Kolo 9), ukazováček v okénku bankovek nebo prst v okénku sloupce, druhá ruka bere                                                                                                                                                                                                                                                                                                                                          | jde / nejde                 | nejde → okénko bankovek mimo stopu jazýčku (oddíl 5.8)                                                                                     |
| P0-9 | zasunout kartu u boku za D1 a omylem do ústí bankovek; je ústí bankovek vidět (barevná hrana D1, kontrastní D2)?                                                                                                                                                                                                                                                                                                                                                                                     | jde / nejde                 | výraznější barva hrany D1, rysky                                                                                                           |

### V12 – zkouška ohybu (povinná, asi 10 min práce a přes noc schnutí)

Jeden odřezek kaštanu (aspoň 30 × 40) **ze stejné kůže, ze které bude P1** obou kusů (10.1); druhý
odřezek jen když zkušební kus děláš z jiné kůže (variantu pak určí horší výsledek). Odřezek z rubu
orýhuj (krok 4), rýhu vyznač ryskami i na bocích, namoč a přehni lícem ven přes vložku 1,5 (vložka ze
starých karet z kroku 0(b), hranou na čáru 1,96 za rýhou), stáhni mezi prkénky a nech přes noc
vyschnout (krok 11). Po vyschnutí vložku vyjmi a prohlédni líc v ohybu (lupou nebo fotkou makrem).
Pak posuvkou na boku odřezku změř, o kolik je ryska rýhy od vrcholu ohybu: **víc než 0,3 mm → čáru
hrany vložky na P1 posunout o tuto odchylku** (směr a důvod v oddílu 5.8), do 0,3 mm nech čáru
z listu. Podle rozhodnutí kola 8 zkouška pokrývá
**ohyb dna i neztenčený závěs** (ohyb přes vložku 1,5 má vnitřní poloměr 0,75, přehyby závěsu 1,0).

| Výsledek                  | Rozhodnutí                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| líc nepopraskal           | **výchozí střih** (ohyb dna i závěs 1,0)                                                                                                                                                                                                                      |
| líc popraskal             | **přednostně záloha A** (celý P1 z usně 0,8, `--p1 0.8`; V12 zopakovat na odřezku 0,8). **Záloha B** (ztenčit pás ohybu na 0,6, `--skive-fold 0.6`, krok 4; V12 zopakovat na ztenčeném odřezku) jen když A nejde. Závěs se ztenčuje jen podle zkušebního kusu |
| popraská i záloha         | zkusit jinou useň do P1 (ověřit), neřezat                                                                                                                                                                                                                     |
| ohyb po vyschnutí odpruží | **není důvod k záloze** (Kolo 8): ohyb udrží lepení G4 a švy S4/S5; odpružení jen zapsat, jestli G4 u ohybu nepovoluje, ukáže zkušební kus (P2-2)                                                                                                             |

### Zkušební kus (povinný)

Celá peněženka podle kroků 1–21 ve variantě z V12, ze stejného kaštanu jako finální kus (10.1;
tloušťku ověřit posuvkou), s plíškem 0,5. Nejdřív čtyři povinné zkoušky, pak podle chuti další testy P2 níže.
**Finální kus se řídí tím, co tady fungovalo.**

| #   | Co ověřit                                                                                                                                                                                                                 | Projde                                                                        | Když ne                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Z-1 | **Magnet (V4 v praxi):** ve stavech A, B a C víčko zavřít, zatřást a otočit dnem vzhůru; pak otevřít jedním prstem za špičku jazýčku                                                                                      | víčko zůstane zavřené (i proti pružení závěsu) a otevře se jedním prstem      | drží slabě nebo moc silně → **vyměnit magnet** za silnější / slabší stejného Ø 8 (oddíl 5.4) a zkusit znovu; finální kus dostane ten, který fungoval. Nepomůže ani to → plíšek 0,8 do finálního kusu (oddíl 5.4, ověřit) |
| Z-2 | **Závěs:** otevřené víčko jde palcem držící ruky udržet tak, že bankovka jde okénkem vysunout a mince vzít (P0-8, P2-10; samo stát nemusí, Kolo 9); po několika dnech běžného používání prohlédnout líc a rub pásu závěsu | jde, žádná prasklina                                                          | praskliny → finální kus v záloze A (`--p1 0.8`), až když ani ta nestačí, záloha B (`--skive-hinge 0.6`, oddíl 5.8); palec víčko neudrží → úkony z konce oddílu 5.8                                                       |
| Z-3 | **Výřez pro palec:** gesta z P0-4 v kůži (vysunout přední kartu, zadní po vyndání předních), zavírání ve stavu A, s 1 kartou a s jazýčkem posunutým o 3 mm; po dnech používání odklopení hrany F a důlek (P2-7)           | špička se nezachytí ani nezajede pod F, hrana F se neodklopí, důlek nevznikne | upravit v mezích oddílu 4.6 (zaoblit, zkosit rub dna U, zúžit), nebo výřez ve finálním kusu vynechat                                                                                                                     |
| Z-4 | **Retence (P2-1):** stav B zavřít, 30× prudce zatřást dnem vzhůru; 1 Kč za D2 ve stavu A i B; 0 karet + 1 × 5000 Kč                                                                                                       | nic se nepřesune do jiného oddílu ani nevypadne                               | úpravy z oddílu 7 (D1 nebo D2 o 0,5 výš, až na strop)                                                                                                                                                                    |

Když se varianta změní až po zkušebním kusu (Z-2), je finální kus v nové variantě neověřený – ověřit
na prototypu, nejlépe dalším zkušebním kusem.

### P2 – další testy na zkušebním kusu (doporučené)

| #     | Test                                                                                                                                                                                                                                                                     | Zapsat                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| P2-1  | V1: stav B (2 karty, 100 Kč napůl, 1 Kč), zavřít, 30× prudce zatřást dnem vzhůru, 10× pád z 30 cm. Navíc: 1 Kč za D2 ve stavu A i B (nepřelezla do bankovek?); 0 karet + 1 × 5000 Kč (nepřelezla D1?)                                                                    | co se kam posunulo           |
| P2-2  | V2: totéž se 4 × 50 Kč a stavem C; vzhled prázdné (oblost vrchu), hranatých spodních rohů a očka ohybu dna na bocích; G4 u ohybu dna nepovoluje                                                                                                                          | totéž, foto                  |
| P2-3  | V3: den v zadní kapse se sezením, 20× zasunout a vytáhnout (dnem i vrchem napřed)                                                                                                                                                                                        | zvedla látka špičku?         |
| P2-4  | posuvkou tloušťka po zónách K, S a dole ve stavech A, B, C                                                                                                                                                                                                               | porovnat s oddílem 7         |
| P2-5  | poloha hrany pásu víčka a magnetu ve stavech A, C (se 2 + 2 mincemi), zvlášť nad sloupci a nad středem                                                                                                                                                                   | k (potvrdit P0-3), zkroucení |
| P2-6  | V7: každá bankovka okénkem, vyčnívání                                                                                                                                                                                                                                    | mm                           |
| P2-7  | V10: vytažení zadní ze 6 karet po vyndání předních a vysunutí přední výřezem pro palec, 10×, gesta z P0-4; zavírání ve stavu A a s 1 kartou – zajela špička pod hranu dna U? Po 50 cyklech: odklopení horní hrany F u výřezu (mm), vtlačil se jazýček do výřezu (důlek)? | čas, jak, mm                 |
| P2-8  | V8: jedna mince 1 Kč a 50 Kč, třást, cinká? Vysunutí jedné mince                                                                                                                                                                                                         | subjektivně 1–5, jde / nejde |
| P2-9  | V6 v reálu: 1 000× otevřít a zavřít, úhel volného víčka (jen zapsat; samo stát nemusí, Kolo 9), jde palcem udržet? odstává zavřený pás víčka? (mezera v rozích, cíl ≤ 1,5)                                                                                               | úhel, mm                     |
| P2-10 | celý sled „otevřít – posunout – vzít“ jednou rukou + druhou rukou bez přidržování víčka                                                                                                                                                                                  | jde / nejde                  |

### Důkladné ověření (volitelné, mimo harmonogram)

Nic z toho není podmínkou stavby: na žádnou z těchto zkoušek nečeká žádný krok postupu a harmonogram
(9.1) je neobsahuje. Hodí se, když chceš čísla místo „drží / nedrží“ (síla magnetu, stínění,
počet cyklů závěsu), nebo když zkušební kus ukáže problém a je potřeba najít příčinu.

| #   | Test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Zapsat                                                | Rozhodnutí                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V4  | **Z odřezků (volitelné, doplní Z-1):** (a) Na sestavě F + plíšek + D1 s položeným svazkem 6 karet nad čarou dna (schod) a magnetem 1–5 mm pod schodem (jazýček + magnet + L1 **0,6**, mezera magnet–plíšek 1,6) změř siloměrem (nebo kuchyňskou váhou a provázkem, 100 g ≈ 1 N) odtržení kolmo (cíl 2–4 N) a ve smyku (cíl ≥ 1,2 N), 5× každé; i při k 1,24 (magnet je celý na plíšku i tam, oddíl 4.3, SF1). (b) 1 000 odtržení na odřezku jazýček + magnet (epoxid) + L1 0,6 **obšitá švem S7**, po 24 h vytvrzení; zároveň ověří přilnavost epoxidu k niklu, děrování S7 u magnetu (krok 20) a jestli nit S7 na líci L1 zvětší mezeru. (d) (a) zopakovat s plíškem 0,8 (oddíl 5.4). (e) V záloze A (P1 0,8) (a) zopakovat s F 0,8. (c) na hotovém kusu je od Kola 8 povinná zkouška Z-1 zkušebního kusu.                                                                                   | N, průměr, povolilo L1 nebo S7?                       | málo → magnet Ø 10 × 2 nebo plíšek 0,8, **přepočítat** (oddíl 5.4; Ø 10 potřebuje širší jazýček a přířez L1 kvůli S7); 0,8 jen když vyjde 2–4 N. L1 povolí i se S7 → lepidlo a postup lepení změnit, ověřit znovu. Z-1 nedrží → výměna magnetu stejného Ø 8 (oddíl 5.4)                                                                                                                                    |
| V5  | Obětovaná LoCo karta (stará hotelová) a stará bankovní karta. **(b) a (d) z odřezků** (týden, mimo harmonogram): sestava F + plíšek + D1 jako ve V4(a), za D1 karta, magnet na odřezku jazýčku přitažený k plíšku, celé stažené gumičkou; **(a) a (c) až na hotovém kusu**: (a) v kapse karet týden, 50× vytáhnout a vrátit (proužek správně vložené karty leží v místě úchopu nad F, sledovat i jeho opotřebení); (b) **nejhorší případ: LoCo karta v oddílu bankovek proužkem dolů, týden**; (c) proužek u hrany plíšku, magnet v nejvyšší poloze; (d) LoCo karta v oddílu bankovek **proužkem k horní hraně** (podle pravidla, proužek ≥ 19,9 mm od magnetu), týden; (b) a (d) s plíškem 0,5 i 0,8. Pak zkusit na zámku nebo čtečce, pokud to jde.                                                                                                                                         | funguje / nefunguje                                   | (a) nefunguje → změřit pole, posun dna karet výš. (b) nefunguje → konstrukční vada: zablokovat dno bankovek pod magnetem nebo tvrdé varování v návodu                                                                                                                                                                                                                                                      |
| V6  | **Závěs, 10 000 cyklů (doplní V12 a Z-2):** 3 pásky **101 × 80** (šířka jako peněženka, pás závěsu 8 mm uprostřed délky): (a) **1,0 neztenčený (výchozí)**, (b) useň 0,8 (záloha A), (c) 1,0 ztenčený na 0,6 (záloha B, ztenčení krokem 4(b)). **Tvarování na pásku (jako krok 16):** pásek přehnout zavřený přes 2 staré karty + papír složený na ~0,7 podle posuvky (krok 16; obsah stavu B bez D1/D2 je 2,22, ověřit, že se pásek jen blíží tvaru na peněžence), navlhčit jen pás, přes noc pod knihou. **Střídavý cyklus:** polovinu B upnout mezi dvě prkénka (svěrky nebo náhrada z oddílu 10) tak, aby pás závěsu začínal těsně nad nimi; volnou polovinu zavřít dopředu přes **vložku dna 1,5** (blízko obsahu stavu A 1,2) → otevřít až na doraz dozadu (líc na líc), 10 000× ručně. Po 1 000 / 5 000 / 10 000 fotkou mobilem makrem (nebo lupou) prohlédnout líc i rub pásu závěsu. | prasklina líce ano/ne a po kolika cyklech             | **Projde = po 10 000 cyklech žádná prasklina líce viditelná na makrofotce**, ani vlasová (přísné kritérium, pásek je jen vzorek). (a) projde → výchozí střih potvrzený. Jinak (b) projde → záloha A (`--p1 0.8`); až když neprojde ani ta, (c) → záloha B (`--skive-hinge 0.6`). Když praská všechno: omezit otevření (v návodu napsat, že víčko se nepřeklápí na záda), zkusit jinou useň do P1 (ověřit). |
| V11 | **Výřez pro palec v kůži** (volitelně před vyříznutím do P1, doplní Z-3): do odřezku 1,0 vyseknout výřez U 10 × 12 přesně podle listu 1 (postup kroku 5, hrany podle kroku 6). Přes něj 50× přetáhnout odřezek jazýčku se zbroušenou špičkou (i posunutý o 3 mm), pak jazýček nechat 2 dny zatížený knihou.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | zachytila se špička? důlek na jazýčku ano/ne, hloubka | zachytává → zaoblit hrany víc, zkosit rub dna U; důlek → výřez zúžit nebo vynechat (oddíl 4.6)                                                                                                                                                                                                                                                                                                             |

**Jak podle toho upravit:** každou změřenou hodnotu (t_bn, k, Δ_k, Δ_c, síla magnetu, rozměry bankovek)
dosaď do vstupů (oddíl 12.1). Přepínačem jdou zadat jen tloušťky usní (`--p1`, `--divider`,
`--lining`) a zálohy (`--skive-fold`, `--skive-hinge`); ostatní se dosadí do `DEFAULT_LID_WALLET`
v `src/lib/geometry/lid-wallet.ts` (pole podle kroku 1). Formulář „Listy pro vaši kůži“ v aplikaci má
k, zvednutí na klínu, bankovky a tloušťku magnetu (krok 1); sílu magnetu ne.
Pak spusť `pnpm pattern:wallet-lid` se stejnými přepínači jako v kroku 0(a). Mění se jen vstupy, vzorce
zůstávají. Po P2 zapiš odchylky do tohoto dokumentu jako „Verze 3“.

---

## 12. Parametry pro generátor

Vše je v `DEFAULT_LID_WALLET` v `src/lib/geometry/lid-wallet.ts`.

### 12.1 Vstupy (měřit / převzato)

| Parametr                                         | Značka                     | Hodnota               | Stav                                                                                                                     |
| ------------------------------------------------ | -------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| karta š × v × t                                  | w_k, h_k, t_k              | 85,60 / 53,98 / 0,76  | převzato                                                                                                                 |
| počet karet max / ve stavu B                     | n_k                        | 6 / 2                 | návrh                                                                                                                    |
| pole proužku od dlouhé hrany                     | a_1, a_2                   | 5,54 / 15,82          | převzato z kola 3, ověřit (ISO 7811)                                                                                     |
| bankovka napůl š min–max / v min–max             | w_bn, h_bn                 | 70–85 / 69–74         | ověřit posuvkou                                                                                                          |
| list bankovky / rezerva přehybu                  | t_p, r_bn                  | 0,10 / 0,5            | **ověřit**                                                                                                               |
| mince max Ø / t, min Ø / t                       | D_max, t_c; D_min, t_c,min | 27,5 / 2,5; 20 / 1,85 | ověřit posuvkou                                                                                                          |
| useň P1 / D / L1                                 | t_P, t_D, t_L              | 1,0 / 0,6 / 0,6       | návrh, měřit skutečné (L1 od Kola 6 z usně D1/D2); koupené kozinky změřit a zadat `--divider`, `--lining` (12.4, Kolo 9) |
| ztenčení ohybu dna / závěsu                      | t_f, t_h                   | žádné (= t_P 1,0)     | Kolo 6; záloha A t_P 0,8, záloha B 0,6 (`bottomFoldSkiveMm`, `hingeSkiveMm`; V12, zkušební kus)                          |
| magnet Ø / t / B_r; plíšek t                     | D_m, t_m, B_r; t_pl        | 8 / 1,5 / 1,45 T; 0,5 | ověřit u prodejce; plíšek 0,8 jen jako varianta (5.4)                                                                    |
| dotyk bříška palce                               | d_p                        | 12                    | odhad, ověřit (posun mince okénkem sloupce; výřez pro palec má od kola 5 vlastní rozměry)                                |
| dno bankovek níž o nejvýš                        | –                          | 1,0                   | tolerance 1,0–2,0 (oddíl 4.4)                                                                                            |
| faktor posunu víčka návrh / kontrola             | k, k_max                   | 1,0 / 1,24            | **měřit P0-3**                                                                                                           |
| zvednutí obsahu na klínu dna (× t) nominál / max | δ                          | 0,5 / 1,0             | **měřit P0-6** (Δ_k = δ · n_k · t_k, Δ_c = δ · t_c)                                                                      |

### 12.2 Návrhové konstanty

| Parametr                                                                   | Značka     | Hodnota                                                                     | Důvod                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vzdálenost švu od hrany / lepení za švem                                   | e, g       | 3,0 / 1,0                                                                   | kap. 13 (3–4); otvory skrz slepené                                                                                                                                                                                                                                                            |
| rozteč                                                                     | p_s        | 4,0                                                                         | vidličky 4 mm                                                                                                                                                                                                                                                                                 |
| rezerva kapsy / vůle sloupce                                               | v_k, v_c   | 0,8 / 1,0                                                                   | kolo 3; 30,5 ≥ 30 i při −0,5                                                                                                                                                                                                                                                                  |
| dno bankovek / vůle bankovky nahoře                                        | y_nf, s_n  | 2,0 / 3,0                                                                   | ověřit                                                                                                                                                                                                                                                                                        |
| nejmenší odstup proužku                                                    | –          | 7,9                                                                         | kontrola 3D modelu                                                                                                                                                                                                                                                                            |
| vršek magnetu pod dnem karet                                               | –          | 2,5                                                                         | schod F nad svazkem karet                                                                                                                                                                                                                                                                     |
| střed magnetu nad špičkou / ztenčení špičky                                | d_mt       | 7,0 / 2,5                                                                   | L1 ≥ 3 za magnetem; ztenčení nesmí pod magnet                                                                                                                                                                                                                                                 |
| L1 přířez / horní hrana nad středem magnetu                                | –          | 24 × 22 / 10                                                                | L1 přesahuje špičku o 5 (ořez s jazýčkem)                                                                                                                                                                                                                                                     |
| S7: od hrany jazýčku / pod horní hranou L1 / od kraje magnetu              | –          | 4 / 3 / ≥ 2                                                                 | Kolo 6; otvory ≥ e 3 od hrany i na oblouku R10 (kontrola)                                                                                                                                                                                                                                     |
| špička nad rovnou částí F ve stavu A                                       | –          | 0,3                                                                         |                                                                                                                                                                                                                                                                                               |
| rezerva magnetu na plíšku / plíšek pod dnem karet                          | –          | 0,5 / 2,0                                                                   | karty na plíšku nestojí; **teď platí i při k max** (SF1)                                                                                                                                                                                                                                      |
| boční přesah plíšku za magnet                                              | –          | 3,0                                                                         | šířka plíšku = Ø magnetu + 2 × 3 (SF8)                                                                                                                                                                                                                                                        |
| klín ztenčení D2 (od spodní hrany)                                         | –          | 3,0                                                                         | musí skončit pod S1, aspoň 1 mm rezervy (SF9)                                                                                                                                                                                                                                                 |
| hloubka kapsy karet                                                        | –          | 36                                                                          | vyčnívání ~18                                                                                                                                                                                                                                                                                 |
| vnitřní poloměr přehybů závěsu / vložka dna                                | r_i, T_bot | 1,0 / 1,5                                                                   | r_i je předpoklad (tvaruje se přes obsah, k měří krok 16); vložka = obsah 1,1 + vůle, ze 2 vrstev karet 1,52 (Kolo 9)                                                                                                                                                                         |
| pás ohybu dna / pás závěsu; přesah ztenčeného pásu závěsu                  | b          | 8; 1,0 (`hingeSkiveOverlapMm`)                                              | v pásu závěsu se nelepí ani nešije; ztenčuje se jen v záloze B. Ztenčený pás závěsu (`--skive-hinge`) je zóna plného ztenčení od začátku závěsu − 1 do konce závěsu ve stavu C při k max + 1 (15,1 mm), spodní kraj zůstává jako u pásu 8; náběh 2 mm (`skiveTaperMm`) leží vně pásu (Kolo 8) |
| dno mincí pod dnem karet / D2 pod S1                                       | –          | 3,0 / 4,0                                                                   | D2 18 mezi otvory 16 a 20                                                                                                                                                                                                                                                                     |
| D1 / D2 pod stropem                                                        | –          | 1,0 / 0,5                                                                   | nic nepřeleze (0,5 < 1,85)                                                                                                                                                                                                                                                                    |
| okénko bankovek š / y / dotyk prstu                                        | –          | 14 / 25–70 / 15                                                             | ≤ Ø 20 − 5; výsečník z nabídky (Kolo 11); tah 30; y0 se zvedne, kdyby S1 + 3 bylo výš (SF1)                                                                                                                                                                                                   |
| okénko mincí š / dolní konec nad dnem mincí                                | –          | 12 / 5                                                                      | < Ø 20                                                                                                                                                                                                                                                                                        |
| jazýček š / R špičky / rezerva / vyduté                                    | –          | 20 / 10 / 5 / R4                                                            |                                                                                                                                                                                                                                                                                               |
| výřez pro palec š / hloubka / rohy ústí / rezerva rohů nad boční tolerancí | –          | 10 / 12 / R1 / ≥ 1                                                          | oddíl 4.6; rohy ≥ 3 + 1 od boků jazýčku (jazýček posunutý o 3 výřez přikryje), dno ≥ y_cf + ½ · 36                                                                                                                                                                                            |
| hrana víčka nad F ve stavu C                                               | –          | 0,5                                                                         | bez pruhu 12,36                                                                                                                                                                                                                                                                               |
| S6 vynechá ± od osy                                                        | –          | 12                                                                          | plíšek + jazýček                                                                                                                                                                                                                                                                              |
| nejnižší otvor bočních švů                                                 | –          | ≥ 5,5 (vychází 8)                                                           | nad ohybem dna                                                                                                                                                                                                                                                                                |
| spodní rohy těla                                                           | –          | 0 (hranaté)                                                                 | Kolo 6; R4 jen volitelně (`bodyCornerRadiusMm`)                                                                                                                                                                                                                                               |
| přesah vložky dna za boky                                                  | –          | 5,0                                                                         | ohyb má oporu po celé šířce (boky se nevyplňují)                                                                                                                                                                                                                                              |
| hrana vložky dna na rubu B                                                 | –          | osa ohybu + oblouk / 2                                                      | oblouk ohybu začíná u hrany vložky, jeho střed padne na rýhu (Kolo 9, `v.insertEdge`, ověřit V12)                                                                                                                                                                                             |
| vrstvy SVG                                                                 | –          | CUT, STITCH, FOLD, GLUE, GUIDE; úsečka 50 mm; „PRINT AT 100% / ACTUAL SIZE“ | kap. 27–28                                                                                                                                                                                                                                                                                    |

### 12.3 Odvozené hodnoty

| Veličina                                  | Vzorec                                                                                                                                                                                                                                                                                                                                                                                                     | Hodnota                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| kapsa F–D2                                | W_c = max(⌈w_k + (n_k t_k + t_D + t_bn,max) + v_k⌉₀,₅; ⌈w_k + n_k t_k + v_k⌉₀,₅ + 2g) – druhý člen je kapsa karet mezi G2b (oprava kola 4)                                                                                                                                                                                                                                                                 | 93,0 (5 karet: 92,5)                                                   |
| šířka                                     | W = W_c + 2(e + g)                                                                                                                                                                                                                                                                                                                                                                                         | 101,0 (5 karet: 100,5)                                                 |
| kapsa karet (mezi G2b)                    | W_c − 2g ≥ w_k + n_k t_k + v_k (teď platí vždy, druhý člen W_c)                                                                                                                                                                                                                                                                                                                                            | 91 ≥ 90,96 ✓                                                           |
| sloupec                                   | c = ⌈D_max + t_c + v_c⌉₀,₅                                                                                                                                                                                                                                                                                                                                                                                 | 31,0                                                                   |
| střední lepený pás / švy sloupců          | W_s = W_c − 2c; x_L = e + g + c + g                                                                                                                                                                                                                                                                                                                                                                        | 31,0 (x 35–66); 36 a 65                                                |
| obsah pod závěsem                         | T = 2t_D + n_k t_k + t_bn + t_c,top                                                                                                                                                                                                                                                                                                                                                                        | A 1,20 / B 3,42 / Bbrief 5,14 / C 9,36                                 |
| délka závěsu                              | r_m = r_i + t_h/2; P(T) = T + t_h + (π − 2) r_m, pro T + t_h < 2 r_m P = π (T + t_h)/2                                                                                                                                                                                                                                                                                                                     | r_m 1,5; 3,46 / 6,13 / 7,85 / 12,07                                    |
| magnet                                    | y_m = y_m,B + k (P(T) − P(T_B))                                                                                                                                                                                                                                                                                                                                                                            | oddíl 4.2                                                              |
| magnet ve stavu B                         | y_m,B,min = y_fl + 0,3 + d_mt + k (P_B − P_A); y_m,B,max = min[y_cf − 2,5 − r − k (P_C − P_B); y_cf − 2,0 − 0,5 − r − k_max (P_C − P_B)]; y_m,B = střed ⟨min, max⟩ na 0,1, když leží v okně, jinak nejbližší bod mřížky 0,05 uvnitř okna (Kolo 7; bez bodu mřížky kontrola ohlásí příliš úzké okno)                                                                                                        | 11,73 … 12,13 → 11,9                                                   |
| dno karet                                 | y_cf = ⌈max[y_m,B,min + k (P_C − P_B) + D_m/2 + 2,5; y_m,B,min + 2,0 + 0,5 + D_m/2 + k_max (P_C − P_B)]⌉₀,₅ – druhý člen (plíšek při k max) je teď přísnější (SF1); když pak okno lepení magnetu y_m,B,max − y_m,B,min je užší než **0,1 mm** (`magnetWindowMinMm`, Kolo 11; do Kola 10 stačil bod mřížky 0,05), o krok 0,5 výš, nejvýš o 2 kroky, jinak kontrola odmítne česky (např. přepážky 0,72–0,76) | 26,0                                                                   |
| strop                                     | y_ceil = ⌈max(y_nf + h_bn,max + s_n; y_cf + δ n_k t_k + h_k)⌉₀,₅                                                                                                                                                                                                                                                                                                                                           | 82,5                                                                   |
| výška / začátek závěsu                    | H = y_ceil + t_h; y_ceil − r_i                                                                                                                                                                                                                                                                                                                                                                             | 83,5 / 81,5                                                            |
| rovná část F a B od                       | y_fl = T_bot/2 + t_f                                                                                                                                                                                                                                                                                                                                                                                       | 1,75                                                                   |
| horní hrana F                             | y_Ft = y_cf + 36                                                                                                                                                                                                                                                                                                                                                                                           | 62,0                                                                   |
| dno mincí / S1 / spodek D2                | y_cf − 3; − g; − 4                                                                                                                                                                                                                                                                                                                                                                                         | 23,0 / 22,0 / 18,0                                                     |
| délka sloupce                             | y_ceil − (y_cfl + δ_max t_c) ≥ 2 D_max + 1                                                                                                                                                                                                                                                                                                                                                                 | 57,0 ≥ 56 ✓                                                            |
| plíšek                                    | y_pl1 = ⌊min(y_m,B,min; y_m,B) − k_max (P_B − P_A) − D_m/2 − 0,5⌋₀,₅ (nejnižší magnet v okně lepení, Kolo 7); y_pl2 = y_cf − 2; kontrola y_pl1 + 0,5 ≤ y_m − D_m/2 a y_m + D_m/2 ≤ y_pl2 − 0,5 ve všech stavech, i při k_max                                                                                                                                                                               | 3,5 / 24,0; 21,84 ≤ 23,5 ✓ (k 1,24: 23,27 ≤ 23,5 ✓; dole 4,58 ≥ 4,0 ✓) |
| odstup proužku                            | y_cf + a_1 − y_m,C ≥ 7,9                                                                                                                                                                                                                                                                                                                                                                                   | 13,7 ✓ (k 1,24: 12,27 ✓)                                               |
| hrana pásu víčka                          | L_fm = y_Ft + 0,5 − y_m,C; y_fe = y_m + L_fm                                                                                                                                                                                                                                                                                                                                                               | 44,66; C 62,5                                                          |
| otvory boků                               | y_i = y_Ft − 2 − 4i dolů do ≥ 5,5, nahoru do y_hb − 3                                                                                                                                                                                                                                                                                                                                                      | 8…76 → 18                                                              |
| otvory sloupců / S1 / S6                  | boční mřížka od S1 + 4; x = W/2 ± 4j v [e + 6,5; W − e − 6,5], S6 bez \|x − W/2\| < 12                                                                                                                                                                                                                                                                                                                     | 13 / 21 / 16                                                           |
| otvory S7 (kolem L1)                      | horní řada ve výšce d_mt + 10 − 3 nad špičkou, u = ±(2 + 4j) od −s_7 do s_7 po 4, kde s_7 = ⌊2 (š_j/2 − 4) / 4⌋ · 2 = 6 (u −6, −2, 2, 6, tedy x 44,5 / 48,5 / 52,5 / 56,5); boky dolů po 4, dokud je otvor ≥ 3 od hrany a ≥ 2 od kraje magnetu                                                                                                                                                             | 4 + 2 × 2 = 8; celkem 107 otvorů, 99 stehů                             |
| délka P1                                  | (y_Ft − y_fl) + π(T_bot/2 + t_f/2) + (y_hs − y_fl) + P_B + pás + jazýček + 5                                                                                                                                                                                                                                                                                                                               | 231,66                                                                 |
| hrana vložky dna (rub B)                  | v_vl = v_Fe + π(T_bot/2 + t_f/2) = osa ohybu + oblouk / 2 (= začátek rovné B)                                                                                                                                                                                                                                                                                                                              | 64,18 (osa 62,21 + 1,96); vložka 1,52: 64,20                           |
| tloušťka max                              | t_P + n_k t_k + t_D + t_bn + t_D + t_c + t_P                                                                                                                                                                                                                                                                                                                                                               | 11,36                                                                  |
| výřez pro palec                           | š 10, hloubka 12 (samostatné vstupy); dno y_Ft − 12; rohy ústí od boků jazýčku ≥ 3 + 1; konec špičky užší než výřez R_t − √(R_t² − (š/2)²) ≤ ztenčení 2,5 (posunutý o 3: R_t − √(R_t² − (š/2 + 3)²), jen informace); magnet ≥ 3 pod dnem                                                                                                                                                                   | 10 × 12, dno 50,0; rohy 4,0 ✓; 1,34 ≤ 2,5 ✓ (posunutý 4,0); 26,7 ✓     |
| karta v bankovkách proužkem k horní hraně | y_nf + h_k − a_2 − y_m(C + 1 karta, k max); s dnem o 1,0 níž; Δz bez plíšku 2,95                                                                                                                                                                                                                                                                                                                           | 40,16 − 20,21 = 19,95; 18,95 ≥ 7,9 ✓                                   |

**Když P0-3 změří k > 1,24:** generátor s `kDesign` = `kMax` = změřené k sám zvedne dno karet a strop
(oba členy vzorce výše splynou, protože 2,0 + 0,5 = 2,5). Např. k 1,24 → dno karet 26,5, H 84,0,
P1 232,6; k π/2 → dno karet 29,5, H 87,0 a P1 240,6 se už nevejde na A4 (kontrola to ohlásí, spolu
s příliš nízkým vyčníváním bankovky – okénko by se muselo posunout). Tehdy je lepší závěs přetvarovat
(plošší vrch při tvarování v kroku 16), nebo přijmout menší plnost.

### 12.4 Výstupy generátoru

`pnpm pattern:wallet-lid` zapíše do `docs/generated/`:

- **penezenka-vicko-sablona.svg/.pdf** (list 1) – P1 z líce: obrys (CUT) s výřezem pro palec v
  horní hraně F (CUT i na listu 2), okénka mincí, S1–S3 a S6
  (STITCH), ohyb dna a přehyby závěsu (FOLD), **hrana vložky dna** (FOLD, trojúhelníčky u boků a popisek, i na listu 2), pás ohybu dna
  s rýhou a pás závěsu (ztenčení jen v záloze B),
  okénko bankovek (řeže se po G3), křížky na středech všech výsečníků (Ø 8, 10, 12, 14), značky S4/S5
  (GUIDE; oblouky rohů těla jen při volitelném zaoblení), odkaz na S7 u jazýčku,
- **penezenka-vicko-rub.svg/.pdf** (list 2) – P1 z rubu: lepené plochy G1–G4 (GLUE, oříznuté do
  obrysu), poloha D1, D2 a plíšku, pořadí lepení, značky „L“,
- **penezenka-vicko-dily.svg/.pdf** (list 3) – D1, D2 (s lepením), L1, K2; u D1 barevná horní hrana,
  u D2 kontrastní tón (R4),
- **penezenka-vicko-pripravky.svg/.pdf** (list 4) – šablona konce jazýčku (R10, magnet, ztenčení
  2,5, přířez L1 s ryskou horní hrany, **otvory S7** ve STITCH), šablony okének a plíšku, proužek
  otvorů S4/S5 s čárkovanou čárou švu 3,0 od levé hrany, vložka dna aspoň 111 × 25 ze starých karet s vyznačenou hranou do ohybu, tvarování závěsu
  přes obsah (Kolo 9; kopyto, Z2 a Z1 vypadly) a rámeček **„Čísla pro postup“** dané varianty
  (kóta P1, osa ohybu, hrana vložky, pás závěsu, konec G3, plíšek, G2 a S6, hrana víčka A/B/C,
  značka magnetu y_m,B a okno lepení; kroky 0–17 berou čísla odsud),
- **penezenka-vicko-vse.pdf** – všechny listy.

**Zálohy (Kolo 6):** `pnpm pattern:wallet-lid --p1 0.8` (záloha A), `--skive-fold 0.6` a
`--skive-hinge 0.6` (záloha B, lze kombinovat) zapíší stejné listy s příponou v názvu, např.
`penezenka-vicko-p1-0-8-sablona.svg`, `penezenka-vicko-ohyb-0-6-zaves-0-6-vse.pdf`. Verzované výchozí
listy se nepřepíšou a golden test hlídá jen je.

**Změřená tloušťka koupené usně (Kolo 9):** `--divider <mm>` (přepážky D1 a D2; model má pro obě
jednu tloušťku, zadej větší z naměřených) a `--lining <mm>` (podšívka L1), každý v rozsahu 0,3–1,2
(mimo rozsah skript odmítne česky, např. „--divider potřebuje číslo mezi 0,3 a 1,2 mm“). Soubory dostanou příponu `-d-0-8`, `-l1-0-9` (např.
`pnpm pattern:wallet-lid --divider 0.8 --lining 0.9` → `penezenka-vicko-d-0-8-l1-0-9-sablona.svg`),
lze kombinovat se zálohami (`--p1 0.8 --divider 0.9` → `-p1-0-8-d-0-9`). Když kontroly neprojdou,
skript nic nezapíše a vypíše česky, co neplatí, např. „Plná tloušťka 12,16 mm je nad přijatou
hranicí ≈ 12.“ (přepážky 1,0). Podle modelu projdou přepážky 0,3–0,92 (0,9: plná tloušťka 11,96,
dno karet 25,5, H 83,0, y_m,B 11,5; 0,93 dá 12,02). Okno lepení magnetu má vždy aspoň 0,1 mm
(Kolo 11): dno karet je pro přepážky 0,6 / 0,7 / 0,72 / 0,8 / 0,9 **26,0 / 26,0 / 26,0 / 25,5 / 25,5**
(okno 0,41 / 0,52 / 0,54 / 0,14 / 0,25 mm); u 0,72–0,76 by dno 25,5 dalo jen 0,04–0,09 mm, proto se
zvedne na 26,0 (H 83,5). Podšívka L1 mění jen mezeru magnet–plíšek (u 1,0
na 2,0) a tloušťku u magnetu; doporučená mez 1,0 je jen v textu, model nad ní nic nehlídá. Neznámý nebo opakovaný přepínač skript odmítne,
samotné „--“ (zvyk z npm) ignoruje a hodnota rovná výchozímu střihu (`--p1 1`) zapíše výchozí listy
bez přípony.

Každý list: A4 na výšku, 1:1, vrstvy `<g id="CUT|STITCH|FOLD|GLUE|GUIDE">`, text **nikdy v CUT**
(v GUIDE, ale i v STITCH, FOLD a GLUE – popisky švů, ohybů a lepení jsou přímo v jejich vrstvě),
kontrolní úsečka 50 mm a „PRINT AT 100% / ACTUAL SIZE“. Golden test (`scripts/generator-golden.test.ts`)
hlídá, že zapsané `.svg` odpovídají generátoru – PDF soubory jsou v `.gitignore` (binární, neediffovatelné)
a golden test je nekontroluje, jen ručně přes `pnpm pattern:wallet-lid`.

---

## 13. Změny po kontrole

Verzi 1 prověřily dvě nezávislé kontroly (K1 = výrobní a uživatelská, K2 = výpočetní). Tabulka říká,
co se s každým nálezem stalo. **Dokument** = opraveno v textu, **model** = zapracováno v generátoru
a hlídané testem nebo kontrolou, **P0/V…** = zůstává k ověření na prototypu.

### Blocker a serious

| Nález                                                                                                          | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                      | Stav                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **K1-1, K2-1 (blocker)** T nepočítá s horní mincí pod závěsem, magnet vyjede z plíšku a blíž než 7,9 k proužku | T = 2t_D + n_k t_k + t_bn + t_c,top, mezní stav 4 × 50 Kč (T_C 9,36). Závěs plochý (k ≈ 1). Dno karet zvednuté z 23,5 na 24,0, y_m,B 11,4, plíšek y 4–22 (z návrhu K1 „y_m,B 11,0, plíšek 3–23“ se vzala podmínka, ne čísla, protože plíšek teď končí 2 mm pod dnem karet podle K1-2). C: vršek magnetu 21,34 ≤ 21,5, odstup 12,2 (k 1,24: 10,8). Zkroucení víčka nad jedním sloupcem → P0-3/P2-5. | dokument + model (test „proužek ≥ 7,9 ve všech stavech, i při k 1,24“); k měřit P0-3 |
| **K2-2 (blocker)** sloupec 29 neobalí minci 27,5 × 2,5                                                         | c = Ø + t + v = 27,5 + 2,5 + 1,0 = 31,0. Sloupce x 4–35 a 66–97, střed 35–66, švy x 36 a 65, okénka mincí x 13,5–25,5 a 75,5–87,5, magnet 11,5 od sloupců.                                                                                                                                                                                                                                         | dokument + model (kontrola „Sloupec … neobalí minci“); P0-5 volné klouzání           |
| **K1-2 (serious)** dno karet drží jen okraj lepení, karty ho klínem odlupují                                   | Šev **S6** přes F + D1 v y 23, x 10,5–38,5 a 62,5–90,5 (2 × 8 otvorů), střed vynechá plíšek a pás pod jazýčkem. Plíšek končí 2,0 pod dnem karet (y 22), karty na něm nestojí.                                                                                                                                                                                                                      | dokument + model                                                                     |
| **K1-3, K2-6 (serious)** Z1 se samo zavírá, sklopené víčko zakrývá okénka, tři ruce                            | Výchozí tvarování **Z2** v mezipoloze ~120°, Z1 jen srovnávací vzorek. V6/P0-8/P2-9/P2-10 mají kritérium „víčko stojí samo a nezakrývá okénka“. V4 na vytvarovaném kusu. Záložní úkony (palec drží víčko, okénko mimo stopu jazýčku) v oddílu 5.8.                                                                                                                                                 | dokument + list 4; ověřit P0-8, V6                                                   |
| **K1-4, K2-6 (serious)** závěs se ohýbá oběma směry do ostrého lomu, V6 to nezkouší                            | V6 = střídavý cyklus zavřít přes 1,2 → otevřít na doraz dozadu, 5 000 a 10 000×, lupou líc i rub. Při praskání omezit otevření (Z2), jiný materiál jen „zkusit jinou useň, ověřit“. Tvrzení „ostrý lom nikdy nevznikne“ odstraněno.                                                                                                                                                                | dokument; ověřit V6                                                                  |
| **K1-5 (serious)** 1 Kč přeleze D2 do bankovek a propadne okénkem 20                                           | Okénko bankovek **15 × 45** (Ø 20 − 5), konce R7,5 výsečníkem Ø 15. D2 přilepená uprostřed a u boků až k horní hraně (G3b/G3c do 79,5), mezera nad D2 0,5 jen při plochém závěsu. P2-1 doplněn o 1 Kč za D2 ve stavu A i B; když přeleze, prodloužit D2 nahoru.                                                                                                                                    | dokument + model (kontrola šířky okénka); ověřit P2-1                                |
| **K1-6, K2-8 (serious)** karta omylem v oddílu bankovek ~3 mm od magnetu                                       | Boky D1 přilepené k F (G2b, x 4–5 a 96–97), karta boky neobejde. D2 volitelně kontrastní (od Kola 4 povinně, viz níže). V5 doplněn o LoCo kartu v bankovkách proužkem dolů (týden) a o hranu plíšku jako pól. V kroku 17 proužek papíru místo karty. **Zapsáno jako otevřené riziko R4**, ne vyřešené.                                                                                             | dokument + model (G2b); **otevřené**, rozhodne V5                                    |
| **K2-3 (serious)** kapsa 91 počítá jen karty, ne D1 + bankovky                                                 | W_c = 85,6 + 6,26 + 0,8 = 92,66 → **93**, **W = 101** (o 2 mm víc, než chtěl autor). Kapsa karet mezi G2b 91. Alternativa se šířkou 99 by pojala jen 3 karty: kapsa karet mezi G2b potřebuje pro 4 karty 85,6 + 3,04 + 0,8 = 89,44 > 89 (opraveno v Kole 5; starší výpočet 90,94 počítal jen obálku F–D2). Pro 4 karty vychází W 99,5. Plný stav zkusit P0-7.                                      | dokument + model                                                                     |
| **K2-4 (serious)** výška 79,6 předpokládá plochý závěs, magnet kulatý                                          | Jedna geometrie: plochý závěs se dvěma přehyby na kopytě (r_i 1,0), k = 1,0 pro T ≥ 2,0. Délka po střednici P(T) = T + 0,6 + (π − 2) · 1,3 = 5,50 ve stavu B. Kontrola uvedla 6,6 = 2 · 1,3 + T_B + t_sk; to by platilo pro přehyby bez odečtu rovných úseků, rozdíl 1,1 pokryje rezerva 5 mm na ořez špičky. Když P0-3 dá k > 1,24, přepočet podle 12.3.                                          | dokument + model; k měřit P0-3                                                       |
| **K2-5 (serious)** dna tvořená čarou lepení jsou klín, obsah sedí výš                                          | Zvednutí δ · t jako vstup (nominál 0,5, max 1,0, měřit P0-6). Strop počítá s kartami na klínu: 24 + 2,28 + 53,98 = 80,26 → 80,5 (H 81,1). Délka sloupce počítá s δ_max: 57 ≥ 56. Při δ 1,0 by karty tlačily na závěs 2 mm → posunout čáru G2/S6 dolů.                                                                                                                                              | dokument + model; měřit P0-6                                                         |
| **K2-7 (serious)** magnet u schodu nad svazkem karet se nakloní                                                | Vršek magnetu ve stavu C 2,66 pod čarou dna karet (návrh ≥ 2,5; K2 chtěla ~3). Karty sedí na klínu výš (~26,3), takže skutečný schod je ~5 mm nad magnetem. V4 se dělá na sestavě se schodem a magnetem 1–5 mm pod ním.                                                                                                                                                                            | dokument + model (kontrola odstupu od dna karet); ověřit V4                          |

### Minor

| Nález                                                      | Co se změnilo                                                                                                                             | Stav                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| K1 plíšek u vlhkého ohybu (skvrny od železa)               | Pořadí: mokrý ohyb (krok 11) → G1 + G2 + G2b + S6 (kroky 12–13) → G4. Hrany plíšku přelakovat.                                            | dokument + list 2                             |
| K1 magnet táhne L1, ztenčená špička pod magnetem           | Ztenčení jen posledních 2,5 mm (magnet začíná 3,0 od špičky). V4 s 1 000 odtrženími, záloha obšití konce jazýčku 3 mm od okraje.          | dokument + model (kontrola ztenčení) + list 4 |
| K1 vidlička přes schod F/D2 u otvorů 58/62                 | V úseku y 54–66 vidlička s 1–2 zuby, každý otvor podle rysky, podložka 1,0 pod hranou F.                                                  | dokument                                      |
| K1 rohy R4 přes mezeru ohybu dna                           | Mezeru v pásech x 0–6 a 95–101 vyplnit lepidlem s odřezkem 1,5 před řezem, nebo rohy jen zkosit; ověřit P1.                               | dokument                                      |
| K1 „x_rub = 99 − x“ plete                                  | Nahrazeno větou o souměrnosti a pravidlu natočení vidličky; „L“ zvlášť na rub F a rub B.                                                  | dokument + list 2                             |
| K1, K2 bankovka přeleze D1 (posun 3 platí jen pro 74)      | Opraveno zdůvodnění (posun 4,5–9,5, horní hrana až ke stropu). D1 zvýšená na 79,5 (1,0 pod stropem). P2-1: 0 karet + 5000 Kč.             | dokument + model                              |
| K2 záloha Ø 10 × 2: plíšek a odstup, aritmetika 8,5        | Záloha se přepočítá generátorem (dno karet 27,5, plíšek 4–25,5, odstup 14,6 – čísla po SF1, oddíl „Po nezávislém ověření“), tloušťka 8,2. | dokument + model (test zálohy)                |
| K2 obálka tloušťky, pruh 12,36                             | Shrnutí uvádí A 4,2 (6,0), B 7,92, C 11,36. Hrana víčka v C 0,5 nad F, pruh 12,36 nevzniká.                                               | dokument + model                              |
| K2 rezerva plíšku 0,6 vs. 0,5                              | Jedna podmínka: vršek ≤ y_pl2 − 0,5.                                                                                                      | dokument + model                              |
| K2 šablona R10 „střed 3,0 nad špičkou“                     | Opraveno: střed oblouku 10,0 nad špičkou, tj. 3,0 nad středem magnetu.                                                                    | dokument + list 4                             |
| K2 tah okénka 30 při dotyku 12–15                          | Okénko prodlouženo dolů na y 25–70 (45 mm), tah 30 i při dotyku 15.                                                                       | dokument + model                              |
| K2 mince doprostřed na čáru lepidla, schod spodní hrany D2 | G3c lepená až k horní hraně D2, spodní hrana D2 ztenčená do nuly (klín ~5).                                                               | dokument + model + list 3                     |

### Po nezávislém ověření

Třetí kontrola (nezávislé ověření verze 2) našla devět „should-fix“ nálezů a jedenáct drobností (nitů).
Číslování SF a nit je z té kontroly, ne z K1/K2 výše.

| Nález                                                                                                                                                 | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                 | Stav                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **SF1** magnet ve stavu C při k 1,24 (y 22,77) přečníval starý plíšek (y 4–22) o 0,8 mm                                                               | Dno karet teď musí splnit dvě podmínky zároveň, ne jen jednu: vršek magnetu je při k 1,0 aspoň 2,5 pod dnem karet **a** plíšek obalí magnet i při k 1,24. Druhá je přísnější: dno karet **24,0 → 25,5**, y_m,B **11,4 → 11,5**, plíšek **4,0–22,0 → 4,0–23,5** (19,5 mm, ne 18). Kontrola teď hlídá `onPlateKMax` pro každý stav (dřív se počítalo, ale nevyhodnocovalo). Výška vzrostla na 82,6 (z 81,1), viz oddíly 4.2, 4.3, 5.4, 7, 12.3. | dokument + model (test „i při k max je magnet celý na plíšku“)        |
| **SF4** kopyto závěsu bylo jen „3 staré karty“, bez rozměrů                                                                                           | Rozměry z modelu: 89 (š, = kapsa karet 91 − 2 vůle) × 71,5 (v, ≥ strop − dno karet 56,5 + rukojeť 15) × 2,22 (tloušťka, = obsah stavu B bez D1/D2), horní hrana R1. Materiál: deska (překližka/HDPE), ne karty – na tenhle rozměr už nestačí. Opěrka Z2 dostala taky rozměry: 111 × 82,6, klín 30° hluboký 47,7 mm. Oddíl 5.8, list 4.                                                                                                        | dokument + model (`hingeJig`, `supportBlock`) + list 4                |
| **SF5** vložka dna 90 × 25 „ze 2 starých karet“ nejde vyříznout (karta 85,6 je kratší) a boky x 0–7,7 by při ohybu neměly oporu                       | Vložka teď 89 × 25 (š = W − 2 × 6, odvozeno od pásů, které stejně doplňuje lepidlo v kroku 15), z tvrdé desky 1,5 mm (překližka/HDPE), ne z karet. Boky x 0–6 a 95–101 vložka nepodpírá záměrně – vyplní se lepidlem v kroku 15 (beze změny), teď je to v dokumentu i u samotné vložky výslovně napsané.                                                                                                                                      | dokument + model (`bottomSpacer`) + list 4                            |
| **SF6** tři protichůdná pořadí ořezu špičky (list 1 text „až po nalepení magnetu“, krok 18 v postupu „ořez před lepením“, oddíl 5.5 „po nalepení L1“) | Sjednoceno na: **krok 18** = nalepit magnet (G5) i L1 (G6), **krok 19** = ořez špičky R10 skrz jazýček + L1 najednou podle rysek z kroku 17. Opraveno na listu 1 (text u šablony), v postupu (kroky 18–19 prohozené) i v oddílu 5.4/5.5.                                                                                                                                                                                                      | dokument + list 1, list 4                                             |
| **SF7** Prettier rozlámal tři vzorce do odstavců, které markdown čte jako odrážky (řádek začínal „− …“)                                               | Přepsáno na plynulý text bez zalomení přesně na znaménku (oddíly 4.1, 4.3, 4.5).                                                                                                                                                                                                                                                                                                                                                              | dokument                                                              |
| **SF8** plíšek u záložního magnetu Ø 10 měl natvrdo `axisX ± 7`, nederivované z Ø magnetu                                                             | `plate.x0/x1` = `axisX ± (r + plateSideMarginMm)`, `plateSideMarginMm` 3,0 je teď pojmenovaný vstup (oddíl 12.2). Pro výchozí Ø 8 vychází stejná šířka 14 mm, pro Ø 10 vyjde 16 mm.                                                                                                                                                                                                                                                           | dokument + model (`plateSideMarginMm`)                                |
| **SF9** šev S1 procházel klínem ztenčení D2, kde je D2 jen 0,1–0,5 mm tlustá – přesně tam, kde mince tlačí                                            | Klín zkrácen z „~5 mm“ na **3 mm** (`d2SkiveWedgeMm`), takže končí 1 mm pod S1 (S1 je vždy přesně 4 mm nad spodní hranou D2). Kontrola hlídá, že mezi koncem klínu a S1 zůstane ≥ 1 mm plné tloušťky. Švy G3a beze změny (nejsou v klínu).                                                                                                                                                                                                    | dokument + model (kontrola „S1 prochází klínem ztenčení D2“) + list 3 |

**Nity 1–11** (drobnosti, číslováno podle nezávislého ověření):

1. Špička jazýčku ve stavu A dipne při k 1,24 pod začátek rovné části F (y 1,18 < 1,35) – zdokumentováno
   v oddílu 4.3, kontrola dál hlídá jen ať nepřečnívá přes spodní hranu (> 0,5), což platí. **Po Kole 6**
   (neztenčený ohyb dna) jsou čísla y 1,58 < 1,75, platí to samé.
2. Vyčnívání bankovek sjednoceno na jedno číslo z modelu (`billProtrusionMm`, dno napevno 2,0):
   **19,5 mm** (výška 69) / **24,5 mm** (výška 74) všude v dokumentu, místo tří různých rozsahů
   (21–26, 20–21/25–26).
3. Posun karet popsán čísly z modelu se jmény stavů (0,24 mm stav C, 1,76 mm stav B), ne vágním
   „0,2–1,8“.
4. „text jen v GUIDE“ opraveno na pravdu: text nikdy není v CUT, ale je v GUIDE, STITCH, FOLD i GLUE
   (popisky švů, ohybů, lepení) – oddíl 12.4.
5. Přidaná simulace stavu B podle briefu (4 karty, 2 bankovky, 3 mince) v oddílu 7, spočtená modelem
   jako samostatný stav `Bbrief`.
6. Osy S1–S3 jsou značené na listu 1 (P1 líc) i na listu 3 (D1/D2); S6 na listu 1. List 2 (rub) teď
   navíc textem odkazuje, kde otvory hledat, aby nebylo nutné mezi listy hádat.
7. Plocha G4, kterou je třeba zdrsnit na lící straně D2, je teď vyznačená i na listu 3 (dřív jen v
   tabulce lepení, oddíl 5.7).
8. Lepení G3b/G3c teď končí na pásu ztenčení závěsu (y 79,75), ne až na horní hraně D2 (81,5) – dřív
   se lepidlo posledních ~1,75 mm překrývalo se ztenčeným pásem.
9. Přidané středové značky (osa x 50,5) na listu 1/2 (P1) i listu 3 (D1, D2).
10. Opraven překlep „ve mezipoloze“ → „v mezipoloze“ (list 4) a odstraněn zastaralý titulek
    „x_rub = 101 − x“ na listu 2 (nahrazen prostou větou o souměrnosti, stejně jako u K1 nálezu
    „x_rub = 99 − x plete“ výše).
11. PDF soubory (`docs/generated/*.pdf`) jsou v `.gitignore` a golden test
    (`scripts/generator-golden.test.ts`) je záměrně nekontroluje (binární, nediffovatelné) – jen
    `.svg`; zmíněno v oddílu 12.4.

### Kolo 4 – úpravy schválené autorem

Autor po verzi 2 schválil pět úprav. Šířka 101 a 6 karet zůstávají.

| Úprava                                                        | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Stav                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Výřez pro palec** v horní hraně F                           | U 12 × 12 na ose (x 44,5–56,5, dno y 49,5, výsečník Ø 12 + nůž, rohy ústí R2), **v Kole 5 zúženo na U 10 × 12** (viz níže). Leží celý pod jazýčkem, takže ho víčko ve všech stavech přikryje souvislou kůží a hrana pásu nad ním není; magnet (nejvýš 22,87) i špička (11,87) jsou hluboko pod ním. G2b, G4, S4/S5 i S6 jsou daleko, retence karet se nemění (oddíl 4.6).                                                                                                                                                                                          | dokument + model (`thumbNotch`, kontroly a testy) + list 1, 2 (CUT); **ověřit P0-4**, P2-7 |
| **Ochrana proti R4**                                          | Horní hrana D1 natřená barvou na hrany v kontrastním tónu, D2 v kontrastním tónu (dřív volitelně). Pravidlo **„karty vkládat proužkem nahoru“** (v Kole 5 přeformulováno na „proužkem k horní hraně (k víčku)“): karta omylem v bankovkách má proužek 40,16 − 19,81 = 20,35 mm nad magnetem (19,35 při dně o 1 mm níž; Kolo 5 opravilo původních 21,29, které nepočítalo s tím, že karta sama zvedne víčko), místo ~3,3 mm proužkem dolů. Upozornění pro uživatele v postupu (krok 22), v oddílu 2 a v riziku R4. Riziko zůstává otevřené, pravidlo se dá porušit. | dokument + model (`misplacedCard`, kontrola ≥ 7,9, test ≥ 20,3) + list 3; rozhodne V5      |
| **Plíšek 0,8**                                                | Přepočteno podle oddílu 5.4: geometrie beze změny, tloušťka u magnetu +0,3 (A 6,3), odstup R4 v tloušťce 3,55. Sílu model spočítat neumí, a tak se nedá ukázat, že zůstane v cíli V4 2–4 N (silnější plíšek ji spíš zvedne). Proto **výchozí zůstává 0,5, 0,8 je varianta**, rozhodne V4 a stínění V5.                                                                                                                                                                                                                                                             | dokument + model (test varianty 0,8); ověřit V4, V5                                        |
| **Chyba šířky v modelu**                                      | Šířka počítala jen obálku F–D2 a vynechala kapsu karet mezi pásy G2b (85,6 + n · 0,76 + 0,8). Pro 5 karet vycházela šířka 100 a kapsa karet 90 < 90,2, vlastní kontrola modelu selhala. Teď W_c = max(obálka F–D2; kapsa karet + 2 · G2b): 5 karet → **100,5**, 6 karet → **101** (beze změny). Stav C má teď vždy tolik karet, kolik je `cardsMax` (dřív napevno 6). Výrok „horní hrana F y 60“ v dokumentu není, všude je správně y 61,5.                                                                                                                        | model + test (5 → 100,5, 6 → 101)                                                          |
| **Stupňované oddíly karet** (zadní karty výš) – **zamítnuto** | Posouzeno a zamítnuto: (1) dno karet je dané polohou magnetu a plíšku (25,5, oddíl 4.3), níž jít nemůže, schod by musel růst nahoru; (2) se zadní skupinou 3 karet o schod s výš vychází strop ⌈25,5 + s + 0,5 · 3 · 0,76 + 53,98⌉₀,₅ = 84,0–85,0 pro s 3–4, výška **84,6–85,6** místo 82,6; (3) schod ukáže zadní karty jen o **3–4 mm**, méně než dotyk palce 12; (4) přepážka navíc (0,6) zvedne plnou tloušťku 11,36 na **~12,0**, na přijatou hranici.                                                                                                        | dokument; místo toho výřez pro palec                                                       |

### Kolo 5 – domácí dílna, výřez pro palec a opravy textu

Tři nezávislé kontroly (domácí dílna, geometrie, používání) prošly verzi po Kole 4. Šířka 101, výška,
6 karet a skladba vrstev se nemění. Zapracováno:

| Nález                                                                    | Co se změnilo                                                                                                                                                                                                                                                                                                                                                   | Stav                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Výřez pro palec: rohy ústí jen 2 mm od boků jazýčku** (should-fix)     | Jazýček se může bočně posunout o ±3 (proto plíšek 14). Výřez zúžen z U 12 × 12 na **U 10 × 12** (výsečník Ø 10, rohy R1): rohy ústí x 44,5–56,5 jsou 4 mm od boků jazýčku = tolerance 3 + rezerva 1. Kontrola v kódu teď hlídá tuto podmínku (dřív jen odstup 2). Hloubka 12 a viditelná karta 30,4–32,3 beze změny. Konec špičky užší než výřez 2,0 → 1,34 mm. | model (`thumbNotchWidthMm`, kontrola, testy) + list 1, 2; ověřit V11, P0-4 |
| Výřez svázaný s posunem mince přes `thumbContactMm` (nit)                | Samostatné vstupy `thumbNotchWidthMm` 10 a `thumbNotchDepthMm` 12; `thumbContactMm` 12 zůstává jen pro posun mince (9,5 mm beze změny). Test hlídá, že změna výřezu posun mince nemění.                                                                                                                                                                         | model + test                                                               |
| Jak výřez funguje – fyzikálně obráceně (should-fix)                      | Tlak palce na líc přední karty tlačí svazek dozadu. Oddíly 2, 4.6 a 8/6 přepsány: palcem vysuneš přední kartu třením nahoru, zadní kartu tehdy mělo zpřístupnit odtažení předních shora dopředu do výřezu nebo jejich vyndání. **Kolo 6 to zúžilo:** výřez je jen pro přední kartu, zadní = vyndat přední; P0-4 zkouší dvě gesta.                               | dokument; ověřit P0-4, V10                                                 |
| Pokles špičky ve stavu A a s 1 kartou; jazýček posunutý o 3 (should-fix) | Oddíl 4.6: limit 1,0 platí jen při plném svazku. P0-4 a P2-7 výslovně zkoušejí stav A, 1 kartu a jazýček posunutý o 3 mm vlevo i vpravo (`tipNarrowerShiftedMm` 4,0). Nápravy: zkosit rub dna U, zkrátit klín, zúžit výřez.                                                                                                                                     | dokument + model (informace); ověřit P0-4, P2-7                            |
| Výřez: rizika závisí na kůži, P0 je neukáže (should-fix)                 | Nový test **V11** na odřezku kůže před vyříznutím výřezu do P1. Postup řezu v kroku 5 (výsečník, řezy k tečnám, rohy brusným papírem), leštění kolíkem ve vrtačce v kroku 6.                                                                                                                                                                                    | dokument                                                                   |
| Odklopení horní hrany F u výřezu, vystouplé písmo (nity)                 | Věta v 4.6, kontrola po 50 cyklech v P2-7, zkosení rubové hrany dna U (krok 6), zasunutí karty s vystouplým písmem a prohnuté karty v P0-4.                                                                                                                                                                                                                     | dokument                                                                   |
| Kontrola odstupu výřezu od G2b (nit)                                     | Kontrola teď chce ≥ 30 od vnitřní hrany G2b (dřív ~5), dokument uvádí skutečných 39,5. Komentář v testu opraven na x < 36,5 / > 64,5.                                                                                                                                                                                                                           | model + test                                                               |
| Odstup „proužkem nahoru“ nepočítal s kartou samotnou (nit)               | Magnet pro kartu v bankovkách se počítá ve stavu C + tahle karta: 19,81, odstup **20,35** (19,35 při dně o 1 mm níž), test ≥ 20,3 / 19,3.                                                                                                                                                                                                                       | model + test                                                               |
| Δz proužku nahoře počítal s plíškem (nit)                                | Plíšek končí v y 23,5, u proužku v y 40 není: Δz 2,75 (`stripeUpDzMm`), 3,25 / 3,55 jen pro proužek dolů. Pole ≈ 1,0 mT.                                                                                                                                                                                                                                        | model + test                                                               |
| Pravidlo „proužkem nahoru“ je nejasné (should-fix)                       | „Proužkem k horní hraně (k víčku)“, jen pro karty s proužkem. V 4.2 poznámka, že proužek správně vložené karty leží v místě úchopu; V5(a) sleduje jeho opotřebení. Krok 22 přepsán podle kontroly (štěrbina u přední stěny, přitlačit jazýček dole).                                                                                                            | dokument                                                                   |
| Věta o šířce 99 (should-fix)                                             | Při šířce 99 se vejdou jen 3 karty (kapsa karet 89 < 89,44 pro 4). Oddíl 1 a řádek K2-3.                                                                                                                                                                                                                                                                        | dokument (ověřeno modelem: 3 → 99, 4 → 99,5)                               |
| Ztenčení pásů 8 mm začátečníkem (blocker)                                | Krok 4: z rubu, náběh místo schodu, přijatelně 0,6–0,8; nejlépe v dílně se zvonovým ztenčovačem, jinak brusný papír s maskovací páskou, nožem ne pod 0,8; posuvka; odřezek jako vzorek V6(b). Rozměry a vrstvy beze změny.                                                                                                                                      | dokument                                                                   |
| G3 v kroku 7 „až k horní hraně“ (should-fix)                             | Krok 7: boky a střed jen do y 79,75, horních 1,75 mm nelepit, hranici přelepit páskou.                                                                                                                                                                                                                                                                          | dokument                                                                   |
| Nástroje, které stavitel nemá (should-fix)                               | Oddíl 10: tabulka náhrad, posuvka jako jediný nákup. Oddíly 5.5, 5.6, 8/1 a kroky podle toho.                                                                                                                                                                                                                                                                   | dokument                                                                   |
| Plíšek se nemá čím vyrobit (should-fix)                                  | Krok 2: pozinkovaný plech 0,5 (magnet v obchodě), pilový list na kov nebo naříznout a zlomit, rohy brusným papírem, lak na nehty. List 4 „rohy R3 brusným papírem“.                                                                                                                                                                                             | dokument + list 4                                                          |
| Klín špičky nožem přes jazýček + L1 (should-fix)                         | Krok 19 a 5.5: zbrousit brusným papírem na hranolku, ne blíž než 2,5 od špičky, hrana 0,5–0,7.                                                                                                                                                                                                                                                                  | dokument                                                                   |
| Časy schnutí (should-fix)                                                | Nový oddíl 9.1 s časy (ověřit podle návodu lepidla) a harmonogram na 4 večery.                                                                                                                                                                                                                                                                                  | dokument                                                                   |
| Přenos čar z listu 2 na kůži (should-fix)                                | Krok 3: šablona na tvrdém papíře, propíchnout jehlou, spojit tužkou; rysky na bocích.                                                                                                                                                                                                                                                                           | dokument                                                                   |
| D1 bez montážní vůle, G2b 1 mm (should-fix)                              | Krok 12: osa x 50,5 na D1 i F, maskovací páska a párátko, přikládat zdola, změřit kapsu ≥ 90,5 a odstup ≥ 3,5.                                                                                                                                                                                                                                                  | dokument                                                                   |
| Magnet kontaktním lepidlem na niklu (should-fix)                         | Krok 18 a 5.4: epoxid na zdrsněný jazýček, L1 kontaktním, lepit s víčkem otevřeným dozadu nebo s ocelí pod stolem; 24 h před V4. Obšití hned jako výchozí stav je otevřená otázka.                                                                                                                                                                              | dokument; ověřit V4b                                                       |
| Kopyto 2,22, opěrka, Z1 (nit)                                            | Kopyto 2,0–2,5 z koupené desky (model `hingeJig.thicknessRangeMm`, list 4), opěrka z kartonu nebo kniha, Z1 volitelné.                                                                                                                                                                                                                                          | dokument + model + list 4                                                  |
| Ohyb dna kolmo, ochrana líce (nit)                                       | 5.8 a krok 11: ryska na obou bocích, vložka hranou na čáru, fólie mezi líc a prkénka, svěrky.                                                                                                                                                                                                                                                                   | dokument                                                                   |
| Spodní hrana D2 nožem (nit); barevný pruh D1 (nit)                       | D2 brousit papírem; barvu párátkem ve 2 vrstvách, účinnější je výrazně odlišná barva D1 a D2 (rozhodne P0-9).                                                                                                                                                                                                                                                   | dokument                                                                   |
| Měřítko tisku, čára D1 přes výřez, značka osy ve výřezu (nity)           | Krok 1: změřit i kótu P1 = 230,1. List 2: obdélník D1 oříznutý obrysem P1. Značka osy na listech 1 a 2 posunutá pod dno výřezu (v 12,5–15,5).                                                                                                                                                                                                                   | dokument + list 1, 2                                                       |
| G4 – pořadí přikládání (nit)                                             | Krok 14: nanečisto složit, pak lepit od ohybu dna nahoru a rovnat podle boků B.                                                                                                                                                                                                                                                                                 | dokument                                                                   |
| K1-6 „D2 volitelně kontrastní“ (nit)                                     | Doplněno „(od Kola 4 povinně)“.                                                                                                                                                                                                                                                                                                                                 | dokument                                                                   |

**Otázky pro autora z Kola 5 – všechny rozhodnuté v Kole 6** (co se kvůli nim změnilo, je v tabulce
„Kolo 6“ níže):

1. **Účel výřezu pro palec.** ✅ **Rozhodnuto (a):** výřez zůstává jako pomůcka **jen pro přední
   kartu**; zadní karta = vyndat přední. Jiné řešení (poutko, pásek pod svazkem) se nehledá.
2. **Ohyb dna bez ztenčení.** ✅ **Rozhodnuto: neztenčovat.** Ohyb 1,0 za mokra přes vložku 1,5
   s rýhou z rubu, předem zkouška **V12** na namočeném odřezku; když líc popraská, záloha ztenčení
   na 0,6.
3. **Závěs bez ručního ztenčení.** ✅ **Rozhodnuto: neztenčovat** (1,0), podle **V6** na zkušebním
   kusu. Záloha A: celý P1 z koupené usně 0,8 bez ztenčení. Záloha B (poslední možnost): ztenčení
   na 0,6.
4. **L1 z usně 0,6** místo 0,4. ✅ **Rozhodnuto: ano.** Mezera magnet–plíšek 1,6, tloušťka u magnetu o 0,2
   větší; sílu ověří V4.
5. **Spodní rohy těla bez zaoblení.** ✅ **Rozhodnuto: hranaté** jako výchozí, hrana se jen
   zabrousí a vyleští; výplň mezery a řez R4 zůstávají jen jako volitelná poznámka.
6. **Plíšek jako hotový kulatý protikus.** ✅ **Rozhodnuto: ne**, zůstává řezaný ocelový plíšek
   14 × 19,5 × 0,5. Jen zapsáno, nic se nemění.
7. **Obšití L1 hned jako výchozí stav.** ✅ **Rozhodnuto: ano**, šev S7 kolem L1 (stehy budou vidět
   na líci víčka).
8. **Přeplněná peněženka.** ✅ **Rozhodnuto: mimo rozsah návrhu.** Plíšek se neprodlužuje, zapsáno
   jako riziko R12 (oddíl 8).

### Kolo 6 – rozhodnutí autora k otázkám Kola 5 (změny)

Šířka 101, 6 karet a skladba oddílů zůstávají. Kvůli neztenčenému ohybu dna se posunulo dno karet
a s ním všechno nad ním; kontroly modelu procházejí pro výchozí střih i pro obě zálohy.

| Rozhodnutí                   | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Stav                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1 Výřez jen pro přední kartu | Oddíly 1, 2, 4.6, 8/6, P0-4 a P2-7: nikde se už netvrdí, že výřez zpřístupní zadní karty; zadní karta = vyndat přední. P0-4 zkouší jen dvě gesta.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | dokument; ověřit P0-4                                                         |
| 2 Ohyb dna 1,0 bez ztenčení  | `bottomFoldSkiveMm: null`. Rovná část F a B od y 1,35 → **1,75**, oblouk ohybu 3,30 → **3,93**, y_m,B,min 11,33 → 11,73, **dno karet 25,5 → 26,0** (podmínka plíšku při k 1,24), strop 82,0 → 82,5, horní hrana F 61,5 → 62,0, S1/dno mincí/D2 o 0,5 výš, D1 93 × 79,0 → 79,5, otvory boků 7,5…75,5 → 8…76, okénka mincí y 28–76, výřez pro palec dno y 50. Krok 4 = rýha z rubu, nová zkouška **V12**, záloha ztenčení (`--skive-fold 0.6`).                                                                                                                                                                                                                                          | dokument + model + testy + listy 1–4; ověřit V12                              |
| 3 Závěs 1,0 bez ztenčení     | `hingeSkiveMm: null`. r_m 1,3 → **1,5**, P(T) = T + 2,712 (P_B 5,50 → 6,13, P_C 11,44 → 12,07), P_B − P_A a P_C − P_B skoro beze změny. H 82,6 → **83,5**, **P1 230,1 → 231,66**. Magnet ve stavu B **11,9** (A 9,22 / 8,58, B 11,9, Bm 14,4 / 15,0, C 17,84 / 19,27 při k 1,0 / 1,24), **plíšek y 4,5–24,0** (rozměr 14 × 19,5 beze změny; v Kole 7 prodloužen na 3,5–24,0, 14 × 20,5) obalí magnet ve všech stavech pro k 1,0–1,24 (rezerva nahoře 0,23, dole 0,08), proužek ≥ 13,7 / 12,27. Hrana pásu víčka A 53,9 / B 56,6 / C 62,5. Tabulka záloh A (`--p1 0.8`: H 82,8, P1 230,2, dno karet 25,5, y_m,B 11,6) a B (`--skive-hinge 0.6`) v oddílu 5.8; V6 zkouší čtyři varianty. | dokument + model (`lidWalletVariant`, přepínače generátoru, testy obou záloh) |
| 4 L1 z usně 0,6              | `liningMm` 0,4 → 0,6. Mezera magnet–plíšek **1,4 → 1,6**, tloušťka u magnetu +0,2 (A 6,0 → 6,2, C 7,7 → 7,9), odstup karty v bankovkách v tloušťce 3,25 → 3,45, Δz proužku nahoře 2,75 → 2,95, střed magnetu před kartou 2,15 → 2,35 (pole ve stavu C 3,38 mT). Materiál: L1 ze stejné usně jako D1/D2.                                                                                                                                                                                                                                                                                                                                                                                | dokument + model + list 3; síla V4                                            |
| 5 Hranaté spodní rohy        | `bodyCornerRadiusMm` 4 → 0. Z postupu vypadla výplň mezery ohybu a řez R4 (krok 15), na listu 1 už nejsou oblouky rohů. Vložka dna 89 × 25 → **111 × 25** (přesahuje boky o 5, ohyb má oporu po celé šířce, `bottomSpacerOverhangMm`). Zaoblení R4 jen jako volitelná poznámka v oddílu 5.5.                                                                                                                                                                                                                                                                                                                                                                                           | dokument + model + listy 1, 4; vzhled P2-2                                    |
| 6 L1 obšitá (S7)             | Nový šev **S7** v modelu: U kolem magnetu (boky x 44,5 a 56,5 ve výšce 6 a 10 nad špičkou, horní řada 14 nad špičkou), **8 otvorů, 7 stehů**, 2 vrstvy 1,6, ≥ 2,1 mm od magnetu, ≥ 3,2 od hrany; ke špičce otevřený, protože mezi magnetem a špičkou jsou jen 3 mm. Přes F ani plíšek nevede. Celkem **107 otvorů, 99 stehů**. Otvory na šabloně jazýčku (list 4), krok 20, oddíl 5.5 a 5.6, V4(b) na odřezku se švem. Kontroly v kódu: S7 musí mít otvory vedle magnetu, odstup od magnetu a hrany. Záloha magnet Ø 10 × 2 teď potřebuje jazýček 24 a přířez L1 ≥ 26 (test; oprava textu v Kole 7).                                                                                   | dokument + model + testy + list 1, 4; ověřit V4b                              |
| 7 Plíšek zůstává             | Jen zapsáno (otázka 6 výše).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | dokument                                                                      |
| 8 Přeplnění mimo rozsah      | Riziko **R12** v oddílu 8, poznámky v oddílech 2 a 4.2 (vršek magnetu 24,21 > konec plíšku 24,0).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | dokument                                                                      |
| Materiál a harmonogram       | Oddíl 10: bez nástrojů na ztenčování (jen v záloze B), useň 0,4 vypadla, přibyla useň 0,8 na V6(b) a zálohu A, tupý hrot na rýhu, odřezky na V6/V11/V12. Oddíl 9.1: V12 a V6 v 0. večeru, S7 v 5. večeru.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | dokument                                                                      |

### Kolo 7 – audit geometrie a postupu

Nezávislý audit (geometrie a výrobní postup) po Kole 6. Šířka 101, 6 karet, skladba oddílů
a rozhodnutí Kol 4–6 zůstávají. Zapracováno:

| Nález                                                                                                                                                                                                                                         | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                               | Stav                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Plíšek dole bez rezervy** (should-fix): spodní hrana se počítala jen ze stavu A při k 1,0 a výchozího y_m,B; při k 1,24 zbývalo 0,08 mm, magnet nalepený u spodní meze okna 11,73 z plíšku sjel, pro 4 karty s P1 0,8 / 0,9 kontrola padala | Spodní hrana plíšku z nejnižšího magnetu přes k 1,0–1,24 **a přes celé okno lepení** (od y_m,B,min), rezerva 0,5 i dole (`onPlate`). Plíšek **y 4,5–24,0 → 3,5–24,0, 14 × 19,5 → 14 × 20,5** (záloha A a zálohy se ztenčeným ohybem 3,5–23,5, 14 × 20; Ø 10 3,5–26,0). Okno lepení 11,73–12,13 je teď celé použitelné s rezervou. Rozhodnutí Kola 6 „řezaný ocelový plíšek“ platí, mění se jen odvozená délka. Nová kontrola: plíšek leží na rovné části F. | model + testy (4 / 5 karet s P1 0,8 a 0,9, celé okno) + listy 1–4 + dokument (1, 3, 4.3, 5.2, 5.4, 5.7, 5.8, 6, 8, 9, 12.3) |
| **Zaokrouhlení y_m,B nad mez okna** (should-fix): pro 5 karet + P1 0,8 vyšlo 11,577 > 11,5766                                                                                                                                                 | Poloha se vybírá až uvnitř okna: střed na 0,1, jinak bod mřížky 0,05 v okně (11,55); když žádný není, kontrola ohlásí příliš úzké okno.                                                                                                                                                                                                                                                                                                                     | model + testy                                                                                                               |
| Zastaralé „4,5 až 9,5“ u bankovek (should-fix)                                                                                                                                                                                                | Oddíl 2 a stav B: posun ke stropu 6,5 (výška 74) až 11,5 (výška 69).                                                                                                                                                                                                                                                                                                                                                                                        | dokument                                                                                                                    |
| Souřadnice pásů ztenčení jen pro výchozí střih (should-fix)                                                                                                                                                                                   | Oddíl 5.8: tabulka „Čísla pro postup podle varianty“ (kóta P1, osa a pás ohybu, závěs, pás závěsu, přehyby, G2 / S6, plíšek, hrana víčka A / B / C, y_m,B a okno lepení). 5.2 a krok 4: pás podle listu 1 dané varianty. Poznámka na začátku oddílu 9.                                                                                                                                                                                                      | dokument                                                                                                                    |
| Vzorec S7 v 12.3, záloha Ø 10 bez L1 ≥ 26, chybějící D2 ve stavu B podle briefu, nit 1, sloupec tloušťky v 5.8 (nity)                                                                                                                         | Opraveno: u = ±(2 + 4j); „a přířez L1 ≥ 26“, S7 přesně na hranici 2,0; „+ D2“; nit 1 s čísly 1,58 < 1,75; sloupec „Max. tloušťka A (u magnetu) / B / C“ s poznámkou.                                                                                                                                                                                                                                                                                        | dokument                                                                                                                    |
| Generátor: „--“ z pnpm, opakovaný přepínač, `--p1 1` (nit)                                                                                                                                                                                    | Samotné „--“ se ignoruje, opakovaný přepínač se odmítne, hodnota rovná výchozímu střihu se zapíše bez přípony. List 1: tloušťka usně vždy na 1 desetinné místo (1,0).                                                                                                                                                                                                                                                                                       | generátor + testy                                                                                                           |
| **V4 a V5 až na hotovém kusu, plíšek je ale nalepený už v kroku 12** (blocker)                                                                                                                                                                | V4 rozdělena: z odřezků (a), (b), (d), (e) v kroku 0, na hotovém kusu jen (c). V5(b), (d) z odřezků v kroku 0 (týden). Tehdy obojí muselo skončit před krokem 12 (přípravný blok asi 9 dní). **Kolo 8 to zrušilo:** V4 z odřezků a V5 jsou jen volitelné, držení magnetu ověří zkušební kus (Z-1) a magnet se dá vyměnit (oddíl 5.4).                                                                                                                       | dokument                                                                                                                    |
| V6 se jen „rozjela“, řez P1 hned další večer; V6 bez kritéria, pásek 101 × 30 nejde upnout, vložka 1,2 (should-fix)                                                                                                                           | V6 v přípravném bloku (Z2 přes noc, 10 000 cyklů za 1–2 dny), řez P1 a nákup usně 0,8 až po rozhodnutí. Pásky 101 × 80, upnutí mezi prkénky, tvarování Z2 na pásku, vložka dna 1,5, kritérium „žádná prasklina líce na makrofotce po 10 000“; stojící víčko až P2-9. **Od Kola 8** je V6 jen volitelná, závěs ověří V12 a zkušební kus (Z-2).                                                                                                               | dokument                                                                                                                    |
| Šablony a tisk v kroku 0 před kontrolou měřítka a před volbou varianty (should-fix)                                                                                                                                                           | Krok 0: tisk a kontrola → přípravky → zkoušky → rozhodnutí; krok 1: listy varianty, kontrola kóty P1, teprve pak šablony z listu 1 a zbytek listu 4.                                                                                                                                                                                                                                                                                                        | dokument                                                                                                                    |
| V11, G1, barva a P0 chyběly v harmonogramu (should-fix)                                                                                                                                                                                       | Krok 0(c) a přípravný blok v 9.1; P0 jako samostatný večer předem. **Od Kola 8** harmonogram bez přípravného bloku (9.1), P0 v kroku 0(c).                                                                                                                                                                                                                                                                                                                  | dokument                                                                                                                    |
| S7: vidlička na U, kolébání na hrbolku magnetu (should-fix)                                                                                                                                                                                   | Krok 20: podložka s otvorem Ø 10, boky svisle dvouzubou částí, horní řada vodorovně, rohy jedním zubem, náhrada předpíchnutím; výjimka v 5.6.                                                                                                                                                                                                                                                                                                               | dokument; ověřit V4(b)                                                                                                      |
| Magnety a odřezky nestačí (should-fix)                                                                                                                                                                                                        | Oddíl 10: magnety aspoň 7, useň 1,0 / 0,8 / 0,6 s plochami na zkoušky, LoCo karty na sestavy V5. **Od Kola 8:** 3 magnety (7 jen pro volitelné ověření).                                                                                                                                                                                                                                                                                                    | dokument                                                                                                                    |
| Epoxid a L1 kontaktním hned, L1 paličkou (should-fix)                                                                                                                                                                                         | Krok 18 a 5.4: nechat epoxid ztuhnout (orientačně 30 min, ověřit), L1 přitlačit prsty nebo kolíkem, přes magnet netlouct.                                                                                                                                                                                                                                                                                                                                   | dokument                                                                                                                    |
| V12 bez prahu odpružení a bez varianty 0,8 (nit)                                                                                                                                                                                              | Práh ≤ 2 mm na 20 mm (návrhový, ověřit), jiná useň když praskne i 0,6, V12 i na 0,8 v záloze A. **Od Kola 8** práh zrušen, rozhoduje jen popraskaný líc.                                                                                                                                                                                                                                                                                                    | dokument                                                                                                                    |
| S1–S3 z líce D2 podle listu 1, chybné odkazy, boky L1, svěrky, S6 naplocho (nity)                                                                                                                                                             | Krok 9 (propíchnout z líce B přes list 1, nebo list 3 na líc D2); krok 13 → „kroku 10“; krok 1 „v krocích 2, 5 a 13“; krok 4(d) a krok 0; krok 19 boky L1; náhrada svěrek v oddílu 10; krok 13 F naplocho u hrany stolu.                                                                                                                                                                                                                                    | dokument                                                                                                                    |

**Otázky pro autora z Kola 7 – všechny rozhodnuté v Kole 8** (co se kvůli nim změnilo, je v tabulce
„Kolo 8“ níže):

1. **Delší plíšek.** ✅ **Rozhodnuto: plíšek zůstává 14 × 20,5** (y 3,5–24,0; v záloze A a v zálohách
   se ztenčeným ohybem 14 × 20). Spodních 0,29 mm leží v pásu ohybu (oddíl 4.3).
2. **Držení víčka na hotovém kusu nevyjde.** ✅ **Rozhodnuto: plíšek vyměnit nejde, magnet ano.**
   Vypárat S7, odlepit L1, vyměnit magnet za silnější nebo slabší stejného Ø 8, znovu přilepit
   a přešít (postup v oddílu 5.4, „Výměna magnetu“; ověřit na prototypu).
3. **Odpružení ohybu po V12.** ✅ **Rozhodnuto: v pořádku.** Ohyb udrží lepení G4 a švy. Důvodem
   k záloze je jen popraskaný líc.
4. **Přípravný blok 9 dní.** ✅ **Rozhodnuto: nahrazen zjednodušeným domácím programem** – tři
   povinné kroky (P0, V12, zkušební kus z levné kůže), dlouhé zkoušky jen jako volitelné důkladné
   ověření.

### Kolo 8 – zjednodušené domácí zkoušky a rozhodnutí k otázkám Kola 7

Rozměry, 6 karet, skladba oddílů a výchozí střih se nemění (listy výchozího střihu beze změny).
Zapracováno:

| Rozhodnutí / nález                                                 | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Stav                                                        |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Zjednodušený program zkoušek** (otázka 4)                        | Místo přípravného bloku ~9 dní tři povinné kroky před řezem finálního kusu: **P0** (6 karet, bankovky napůl, 4 mince, zavření víčka, výřez), **V12** (asi 10 min + schnutí, kritérium „líc nepopraská“, pokrývá ohyb dna i závěs; neprojde → záloha A nebo B) a **zkušební kus z levné kůže** se zkouškami Z-1 až Z-4 (magnet, závěs, výřez, retence). V4 z odřezků, V5, V6 a V11 jsou jen volitelné „důkladné ověření“. Nikde už neplatí, že dlouhé zkoušky musí skončit před krokem 12. Krok 0, 9.1 (večery přípravy, zkušebního a finálního kusu), oddíl 11, odkazy v oddílech 1, 2, 4, 5, 7, 8, 10 a 12.                                                                                                                                 | dokument + komentáře v kódu                                 |
| Plíšek 14 × 20,5 (otázka 1)                                        | Jen zapsáno.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | dokument                                                    |
| Výměna magnetu (otázka 2)                                          | Oddíl 5.4: postup ve 5 krocích, stejný Ø 8 nechá polohu, plíšek i S7 beze změny, jiná tloušťka magnetu se přepočte (`magnetThicknessMm`). V4 a Z-1 odkazují na výměnu, krok 12 říká „magnet ano“. Nejisté kroky (odlepení L1, sundání magnetu z epoxidu, druhé šití starými otvory) jsou označené „ověřit na prototypu“.                                                                                                                                                                                                                                                                                                                                                                                                                     | dokument; ověřit na prototypu                               |
| Odpružení po V12 (otázka 3)                                        | Oddíly 5.8, 8 (R13) a V12: odpružení se jen zapíše, zálohu vyvolá jen popraskaný líc. Práh 2 mm vypadl.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | dokument                                                    |
| **Ztenčený pás závěsu nepokryl přední přehyb ve stavu C** (Kolo 6) | Při `--skive-hinge 0.6` ležel přední přehyb ve stavu C (v 154,35) 3,7 mm za pásem 8 mm (do 150,68). Pás se teď v záloze rozšíří na začátek závěsu − 1 … konec závěsu ve stavu C při k 1,24 + 1 (`hingeSkiveOverlapMm` 1,0; spodní kraj se nezužuje, lepení G3 a otvory S4/S5 beze změny) a je to zóna plného ztenčení; náběhy 2 mm (`skiveTaperMm`) leží vně pásu (po kontrole Kola 8: původní pás 142,68–156,37 měl náběhy uvnitř a přední přehyb 154,35 padl 0,02 mm od konce plné zóny, při k 1,24 do náběhu): **142,68–157,80** (15,12 mm), obojí **141,85–156,97**. Přední přehyb ve stavu C při k 1,24 (155,78, obojí 154,95) je 2,0 mm a zadní přehyb 2,3 mm uvnitř plné zóny. Výchozí střih (bez ztenčení) má pás dál 142,99–150,99. | model + test + listy variant + dokument (5.8, krok 4, 12.2) |
| Kontrola Kola 8: harmonogram (should-fix)                          | 9.1: 2 večery přípravy (tisk a přípravky; P0, šablony a V12), zkušební i finální kus 6 večerů (1. večer kroky 1–6, 2. večer kroky 7–10 a ohyb na noc), zkušenější 4 (odtud rozsah 4–6). V12 rovnou na odřezku levné i finální usně, variantu určí horší výsledek.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | dokument (9.1, krok 0, V12)                                 |
| Kontrola Kola 8: P0 mění vstupy, výměna magnetu (should-fix)       | Krok 1: po změně vstupů z P0 nové listy a kontrola kóty P1 i ve výchozím střihu; šablony jazýčku a výřezu až po P0 (krok 0(b)). 5.4: počítat s novou L1, po ořezu znovu klín špičky (krok 19) a hrany jazýčku (krok 20); oddíl 10: náhradní silnější a slabší magnet Ø 8 koupit hned.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | dokument                                                    |
| Kontrola Kola 8: odkazy (nity)                                     | G4 u ohybu → P2-2, R11 → Z-3 (podrobněji P2-7), V10 patří k P2-7, krok 7 odkazuje na list 2 varianty, poznámky „Od Kola 8“ v tabulce Kola 7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | dokument + komentář v kódu                                  |

**Doplněno po Kole 8 (rozhodnutí autora):** když ve V12 popraská líc, platí **přednostně záloha A** (celý P1 z usně 0,8, nic se neztenčuje). Záloha B (ruční ztenčení na 0,6) je jen poslední možnost, když useň 0,8 nejde sehnat nebo ve V12 popraská i ona. Upraveno v oddílech 5.8, 8 (R13), 9 (kroky 0(d) a 4) a v tabulce V12.

### Doplněno 29. 9. 2026 – nákup kůže

Nový oddíl 10.1: kde koupit kůži na zkušební a finální kus, kolik (P1 kus 20 × 25 cm, na oba kusy
20 × 50 cm; D1 a D2 po 5 dm² nebo 20 × 30 cm), ověřené ceny a sklad k 29. 9. 2026 a dotazy na
prodejce. Useň 0,6 ani pevnou 0,8 se v ověřených obchodech sehnat nepodařilo; náhrady jsou 0,5
(Decocuir) nebo kozinky 0,7–1,0 se změřením t_D a t_L. Rozměry výchozího střihu se nemění; listy
pro změřenou tloušťku kozinek (krok 0(a)) mají jiné rozměry (např. přepážky 0,8: H 83,0, P1 230,86).

### Kolo 9 – zjednodušení schválené autorem

Rozměry výchozího střihu se nemění (101 × 83,5, P1 231,66, dno karet 26,0, y_m,B 11,9, plíšek
3,5–24,0); na listech přibyla čára hrany vložky dna a list 4 je bez kopyta a Z2.

| Rozhodnutí / nález                                            | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Stav                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Závěs bez kopyta a opěrky**                                 | Výchozí tvarování: do peněženky obsah stavu B z modelu (2 staré karty, proužek papíru 0,7 místo 1 bankovky; mince stavu B leží dole), navlhčit jen pás závěsu, víčko zavřít přes obsah a nechat přes noc pod knihou; závěs se pak zaběhne používáním. Otevřené víčko samo nestojí (dřívější chování Z1, R2 přijaté), u bankovek a mincí ho drží palec držící ruky (oddíl 2, 5.8, R2, krok 16 a 22, P0-8, Z-2, P2-9, V6). Z modelu i generátoru vypadly `hingeJig`, `supportBlock`, `hingeJigSlideClearanceMm`, `hingeJigHandleMm`; z nástrojů deska HDPE/překližka a pilka na dřevo/plast (pilový list na kov na plíšek zůstává). Magnet, plíšek a k na Z2 nezávisely (model počítá jen s k 1,0 / 1,24 a stavy obsahu); měření k v kroku 16 zůstává. | model + test + listy + dokument; ověřit na zkušebním kusu   |
| Historie: **Z2**                                              | Do Kola 8 se závěs tvaroval na kopytě 89 × 71,5 × 2,0–2,5 v mezipoloze ~120° s opěrkou 30° (111 × 83,5, klín 48,2), aby otevřené víčko stálo samo (K1-3, K2-6, SF4). Vypadlo kvůli jednoduchosti.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | historie                                                    |
| **Poloha vložky dna**                                         | Oblouk ohybu dna (3,93) začíná u hrany vložky, takže hrana nesmí na rýhu: leží na rubu B o půl oblouku za osou, **v 64,18** (osa 62,21 + 1,96; `v.insertEdge` = osa + oblouk / 2 = začátek rovné B). Čára s trojúhelníčky a popiskem je na listu 1 i 2 (FOLD), text kroku 11 a oddílu 5.8 opravený, test v modelu i generátoru.                                                                                                                                                                                                                                                                                                                                                                                                                      | model + test + listy; ověřit na odřezku V12                 |
| **Vložka ze starých karet**                                   | 2 vrstvy karet (1,52) × 2 karty vedle sebe (171,2 ≥ 111), výška 53,98 ≥ 25; slepit páskou, hranu do ohybu odstřihnout rovně. S 1,52 místo 1,5 se osa a hrana vložky posunou o 0,01–0,02 a P1 o 0,01, dno karet, H a y_m,B se nemění (test). Nic se nekupuje; jiný rovný pás 1,5 taky stačí. Řeší délku z SF5.                                                                                                                                                                                                                                                                                                                                                                                                                                        | model (`bottomSpacer.fromCards`) + test + list 4 + dokument |
| **Jeden nákup kůže**                                          | Oddíl 10.1: jedna objednávka ze Šijeme z kůže (kaštan 10 dm² 199 Kč, kozinka nebarvená 5 dm² 69,50 Kč, čokoládová 5 dm² 67,50 Kč, celkem 336 Kč bez poštovného), po dodání změřit; starší průzkum zkrácen do přílohy, Decocuir už nedoporučen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | dokument                                                    |
| **Přepínače `--divider`, `--lining`**                         | Změřená tloušťka D1/D2 a L1 (0,3–1,2), přípona `-d-…`, `-l1-…`, kombinace se zálohami, chybná hodnota a neplatný střih skončí českou hláškou bez zapsání listů. Podle modelu projdou přepážky 0,5–0,92 (0,9 → plná 11,96; 1,0 → 12,16, odmítnuto) a L1 do 1,0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | generátor + test + dokument (12.4, krok 1, 10.1)            |
| **Úzké okno lepení magnetu** (nalezeno při kontrole přepážek) | Přepážky 0,69–0,71 zaokrouhlily dno karet na 25,5 a okno y_m,B (např. 11,61–11,63) nemělo bod mřížky 0,05 – kontrola by střih odmítla. Dno karet se teď v takovém případě zvedne o krok 0,5 (0,70 → dno 26,0, okno 11,61–12,13). Výchozí střih a zálohy beze změny.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | model + test                                                |

### Kolo 10 – kontrola postupu pro koupenou kůži

Výchozí střih se nemění. Postup počítá s tím, že koupené kozinky (0,7–0,9) dají jiná čísla než
výchozí 0,6.

| Nález                                          | Co se změnilo                                                                                                                                                                                                                                                      | Stav                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| **Čísla pro změřenou tloušťku** (blocker)      | List 4 má rámeček „Čísla pro postup“ (kóta P1, osa ohybu, hrana vložky, pás závěsu, G3, plíšek, G2, S6, hrana víčka, y_m,B, okno lepení, u okna pod 0,2 mm upozornění). Kroky 0–17 berou čísla odsud; úvod oddílu 9 to říká.                                       | generátor + test + dokument |
| **Nákup a měření na začátku**                  | Krok 0(0) nákup a měření, krok 0(a) listy pro změřenou kůži (`--divider`, `--lining`, `--p1`) ještě před P0; krok 1 jen přegeneruje jedním příkazem, hodnoty z P0 do `DEFAULT_LID_WALLET`. Harmonogram 9.1 podle toho.                                             | dokument                    |
| **Hrana vložky dna u rovně odstřižené vložky** | Model počítá půlkulatý nos (hrana 1,96 za rýhou); u hranaté vložky vychází asi 1,54. V12 změří odchylku rýhy od vrcholu ohybu, nad 0,3 mm se čára posune (oddíl 5.8, V12). Vložka: hranu odstřihnout o 4 mm, přebytek 60,2 v každé vrstvě z opačné strany (model). | model + test + list 4; V12  |
| **Mez přepážek 0,92, P1 změřit**               | 10.1: kus nad 0,92 nejde použít, dotaz na prodejce „nejvýš 0,9“; P1 mimo 1,0 ± 0,05 se zadá `--p1`. Hláška o rozsahu s desetinnou čárkou. L1 nad 1,0 model nehlídá (napsáno).                                                                                      | dokument + generátor + test |
| **Závěs bez kopyta: text**                     | Krok 16: papír ~0,7 podle posuvky, co dělat při k > 1,24, víčko po vyschnutí samo nestojí; krok 18 lepí magnet s víčkem narovnaným nahoru a zatíženým (ne překlopeným na záda); poloměr 1,0 je předpoklad; odkaz na Z2 z 5.4 pryč.                                 | dokument                    |
| **Jeden kaštan, jeden nákupní seznam**         | Zkušební kus je ze stejného kaštanu, V12 na jednom odřezku; oddíl 10 má odškrtávací seznam s počty; L1 je z nebarvené kozinky.                                                                                                                                     | dokument                    |

### Kolo 11 – výsečník okénka bankovek a okno lepení magnetu

Výchozí střih (přepážky 0,6) má stejné rozměry (101 × 83,5, P1 231,66, dno karet 26,0, y_m,B 11,9);
mění se jen okénko bankovek na listech 1, 3 a 4.

| Nález                                                     | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Stav                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Výsečník Ø 15 nejde koupit**                            | CraftPoint nabízí Ø 14 a 16, ne 15 (ověřeno 29. 9. 2026 přes `.js`, oddíl 10.1). Okénko bankovek **15 × 45 → 14 × 45**, konce R7 výsečníkem Ø 14 (středy y 32 a 63), x 43,5–57,5. Délka y 25–70 a dotyk prstu 15 zůstávají, takže tah je dál **30 mm** a bankovky vyčnívají 19 (69) / 24 (74) mm nad ústí. Od švů S2/S3 7,5 mm (dřív 7), od sloupců 8,5, od S1 3; nejužší bankovka překryje pás x 27–74; 1 Kč Ø 20 nepropadne (14 ≤ 15). Užší okénko o 1 mm dá prstu méně místa – ověřit P0-8.                 | model + test + listy 1, 3, 4 + dokument                          |
| **Seznam výsečníků**                                      | Střih potřebuje přesně **Ø 8** (napojení jazýčku R4), **Ø 10** (výřez pro palec), **Ø 12** (okénka mincí), **Ø 14** (okénko bankovek). Model je vypíše (`lidWalletPunches`) a list 1 je má v „Výřezy“; kontrola odmítne česky průměr, který v nabídce není (např. „Výsečník Ø 15 (okénko bankovek) není v nabídce …“). Dřívější „6/8/10/12/15“ v úvodu opraveno.                                                                                                                                               | model + test + list 1 + dokument (úvod, 5.5, 8, 9, 10, 10.1, 12) |
| **Okno lepení magnetu 0,04–0,07 mm** (přepážky 0,72–0,74) | Podmínka Kola 9 (bod mřížky 0,05) pustila okna 0,04–0,09 mm (0,72–0,76 s dnem karet 25,5), rukou netrefitelná. Nově musí mít okno aspoň **0,1 mm** (`magnetWindowMinMm`, jako záloha A 0,108), jinak se dno karet zvedne o 0,5 (nejvýš 2×), a co ani tak neprojde, kontrola odmítne česky. Dno karet: 0,6 / 0,7 / 0,72 / 0,8 / 0,9 → **26,0 / 26,0 / 26,0 / 25,5 / 25,5**, okno 0,41 / 0,52 / 0,54 / 0,14 / 0,25. Varianta 5 karet + P1 0,8 (okno 0,05) dostane dno 25,0 a y_m,B 11,8. Test 0,69–0,75 po 0,01. | model + test + dokument (12, 12.4)                               |

### Kolo 12 – poloha dílu při lepení plíšku a D1

| Nález                                              | Co se změnilo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Stav                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Krok 12 lepil na svislou F** (připomínka autora) | Na svislou F se špatně lepí a palička přes desku nemá oporu. Nově leží F naplocho **rubem nahoru** na PE desce a B s D2 stojí nad ohybem nahoru (opřená a přichycená, aby se ohyb nesklopil zpátky na lepidlo), ohyb dna zůstává ~90°. Viset dolů přes hranu stolu jako v kroku 13 B nemůže: tam leží F lícem nahoru, s rubem nahoru by se ohyb musel přehnout obráceně. Pásky kolem pásů G2b se strhnou hned po nanesení lepidla, před přiložením D1. Mokrý ohyb je v kroku 12 suchý a vložka venku (krok 11), pásy G2b 1 mm se nemění. Tabulka švů (S6) a oddíl 5.8 opravené. | dokument + aplikace (lekce 8) |

### Kolo 13 – kontrola lekcí v aplikaci proti zadání

Rozměry ani model se nemění.

| Nález                                         | Co se změnilo                                                                                                                                                                                                            | Stav             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Středy okénka bankovek se na líc B nedostaly  | Krok 2: přes list 1 přilepený na líci propíchnout i středy Ø 14 (a konce čáry hrany vložky); krok 8 seká z líce B do vpichů, polohu kontroluje šablona okénka z listu 4 (krok 1 říká, kde se šablony z listu 4 použijí). | dokument + lekce |
| Čára hrany vložky se na P1 nevyznačovala      | Krok 3: čára hrany vložky dna (z rámečku, posunutá podle V12) na rubu a ryskami na bocích; krok 11 ji používá.                                                                                                           | dokument + lekce |
| Rysky přehybů závěsu bez použití              | Krok 16: rysky jen ke kontrole, kde přehyby vyšly; tvar dává obsah.                                                                                                                                                      | dokument + lekce |
| Výřez pro palec při řezu P1                   | Krok 2: horní hrana F se řeže rovně i přes výřez z obrysu listu 1, výřez až v kroku 5.                                                                                                                                   | dokument + lekce |
| Vložka dna 111 × 25 proti „výšku nezkracovat“ | 25 je nejmenší výška; z karet vyjde asi 111 × 50.                                                                                                                                                                        | dokument + lekce |
| Useň 0,8 na zálohu A                          | Záloha A platí pro zkušební i finální kus: kus 20 × 50 cm jako u usně 1,0 (oddíl 10), ne 11 × 24 cm.                                                                                                                     | dokument + lekce |
| Plíšek 0,8 bez nákupu                         | Oddíl 10: plech 0,8 se kupuje, až když na zkušebním kusu nepomůže výměna magnetu; rozměr plíšku z listu 3 platí, listy se negenerují znovu (oddíl 5.4).                                                                  | dokument + lekce |

### Kolo 14 – nejasnosti v lekcích 4, 5, 6 a 9

Rozměry ani model se nemění. Listy 1, 2 a 4 se mění jen v popiscích a značkách.

| Nález                                                 | Co se změnilo                                                                                                                                                                                                              | Stav                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Krok 3 chtěl na rubu čáry S1–S3, S6 a okénko bankovek | List 2 je nekreslí (12.4) a švy se přenášejí z líce (kroky 9, 10 a 13), středy okénka bankovek z kroku 2. Na rub jen to, co kreslí list 2. „Propichují se vidličkou přes šablonu“ → propíchnout jehlou, děrovat vidličkou. | dokument + lekce + list 2 |
| Krok 9 (b) „obkreslit čáry“                           | Přes vyříznutou šablonu to nejde: konce čar propíchnout jehlou a spojit tužkou u pravítka (jako v kroku 3).                                                                                                                | dokument + lekce          |
| Krok 14: úseky děrování se překrývaly                 | Tři úseky podle otvorů modelu: 8–52 z líce F, 56–68 po jednom (56, 60 z líce F; 64, 68 z líce D2), 72–76 z líce D2. Odřezek 1,0 na líc D2 k hraně F (vyrovná schod), zdvojení 60–64 ověřit na zkušebním kusu.              | dokument + lekce          |
| Čára švu 3,0 u přečnívající D2                        | 3,0 od hrany F a B (x 3,0), nad F 4,0 od hrany D2 (D2 x −1); proužek na listu 4 má čárkovanou čáru 3,0.                                                                                                                    | dokument + lekce + list 4 |
| Krok 5: strana a šablona                              | Okénka mincí z líce B, šablona jen na kontrolu; výřez z líce F, výsečník přes šablonu. Bezpečnost výsečníku jako v lekci 6; „aku vrtačka“ jako ve vybavení.                                                                | dokument + lekce          |
| Listy 1 a 2 odkazovaly na kroky zadání                | Odkazy na lekce (lekce 5, 6, 11, pořadí lekce 6–9); křížky na středech všech výsečníků na listu 1 (i Ø 12 a Ø 8).                                                                                                          | generátor + test          |

### Kolo 15 – odřezek pod vidličkou u schodu F/D2 (rozhodnutí autora 7. 10. 2026)

Rozměry, model ani listy se nemění.

| Nález                                            | Co se změnilo                                                                                                                                                                                                                | Stav             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Poloha odřezku 1,0 při děrování S4, S5 (krok 14) | Autor potvrdil (7. 10. 2026): odřezek 1,0 leží na **líci D2** těsně u horní hrany F a vyrovnává schod F/D2; otvory **64 a 68** jdou i skrz něj. Poloha už není „ověřit“; ověřit na zkušebním kuse zůstává jen, jak ho držet. | dokument + lekce |

### Co zůstává neověřené

Doma to ověří tři povinné kroky (P0, V12, zkušební kus), čísla dají jen volitelné zkoušky:
k plochého závěsu (P0-3), zvednutí obsahu na klínu dna Δ_k a Δ_c (P0-6), plný stav v kapse 93 (P0-7),
neztenčený ohyb dna 1,0 i první ohnutí závěsu (V12), poloha hrany vložky dna 1,96 za rýhou a vložka
ze starých karet (V12), tvar závěsu tvarovaného přes obsah a držení otevřeného víčka palcem (P0-8,
Z-2), únava neztenčeného
závěsu 1,0 (zkušební kus Z-2, volitelně V6; případně zálohy A a B), držení magnetu přes mezeru 1,6
proti pružení závěsu a u schodu (Z-1, síla v N jen volitelná V4), výměna magnetu na hotovém kusu
(oddíl 5.4), šev S7 u magnetu a L1 0,6 při opakovaném otevírání (zkušební kus, volitelně V4(b)),
stínění plíškem a karta v oddílu bankovek (jen volitelná V5, riziko R4 otevřené), cinkání samotné
mince (P2-8), vytažení zadní karty po vyndání předních a výřez pro palec pro přední kartu (P0-4, Z-3,
P2-7 s V10, volitelně V11), barevná hrana D1 a pravidlo „proužkem k horní hraně“ (P0-9, volitelně
V5), epoxid na niklu magnetu (zkušební kus), vzhled hranatých rohů s očkem ohybu (P2-2), časy
schnutí (podle návodu lepidla), plíšek 0,8 (neověřený, oddíl 5.4), tloušťka bankovek napůl a rozměry
bankovek (posuvkou), třída a síla magnetu (u prodejce).
