# Zadání: generátor 1:1 tiskové šablony koženého opasku

Samostatné zadání pro AI agenta. Neodkazuje na žádný existující kód — všechna čísla jsou uvedená
níže. Agent má dodat program, který vygeneruje tiskovou šablonu, a ověřit ji měřením výstupu.

## 1. Cíl

Program (jazyk libovolný, doporučeně TypeScript/Python), který vygeneruje **dvoustránkové PDF ve
formátu A4 v měřítku 1:1** se šablonou obou konců koženého opasku:

- **Strana 1** – konec u přezky: přehnutý konec se čtyřmi otvory pro nýty (dva nýty přes dvě vrstvy)
  a kapsou pro poutko; navíc pásek na poutko jako samostatný díl.
- **Strana 2** – konec se špičkou: anglická špička a pět dírek pro trn přezky.

Šablona se tiskne, nalepí na tvrdý podklad a vyřízne. Podle ní se pak přenášejí značky na kůži.

## 2. Vstupy

| Parametr          | Výchozí | Rozsah | Poznámka                                      |
| ----------------- | ------- | ------ | --------------------------------------------- |
| `beltWidthMm`     | 40      | 15–80  | šířka pásu; jediný parametr z příkazové řádky |
| `beltThicknessMm` | 4       | 2–5    | vstupuje **pouze** do délky poutka            |

Všechno ostatní jsou konstanty z odstavce 3 a 4.

## 3. Konstanty a odvozená geometrie

### 3.1 Konec u přezky

| Konstanta                               | Hodnota                   |
| --------------------------------------- | ------------------------- |
| Délka drážky pro trn                    | **25 mm**                 |
| Šířka drážky pro trn                    | **6 mm**                  |
| Průměr otvoru pro nýt                   | **6 mm**                  |
| Průměr hlavičky nýtu                    | **10 mm**                 |
| Vzdálenosti nýtů od ohybu               | **25,5 mm** a **73,2 mm** |
| Délka přehnutého konce od ohybu         | **90 mm**                 |
| Zobrazená část hlavního pásu nad ohybem | 90 mm                     |
| Šířka pásku poutka                      | 12 mm                     |
| Přídavek na přeplátování poutka         | 15 mm                     |
| Nejmenší přijatelný můstek kůže         | **6 mm**                  |

Odvozené hodnoty:

```
mustek            = 25,5 − 6/2 − 25/2                     = 10,0 mm
konceDrazkyOdOhybu= ±(25/2 − 6/2)                          = ±9,5 mm
kapsaProPoutko    = 73,2 − 25,5                            = 47,7 mm   (rozteč středů)
kapsaSvetla       = 47,7 − rivetHead(10)                   = 37,7 mm
obvodZdvojene     = 2 × (beltWidth + 2 × beltThickness)
delkaPoutka       = round(obvodZdvojene + 15)
```

Pro 40 × 4 mm: obvod 96 mm, poutko **111 mm**. Pro 35 × 4 mm: obvod 86 mm, poutko **101 mm**.

**Linie ohybu půlí drážku pro trn.** Oba páry otvorů leží k ohybu symetricky, aby po přehnutí
sedly na sebe a prošel jimi jeden nýt.

### 3.2 Konec se špičkou

| Konstanta                    | Hodnota                                      |
| ---------------------------- | -------------------------------------------- |
| Sklon boku špičky `s`        | **0,453** (mm poloviční šířky na 1 mm délky) |
| Poloměr zaoblení vrcholu `r` | **4 mm**                                     |
| Průměr dírky pro trn         | **4,5 mm**                                   |
| Počet dírek                  | **5** (musí být nepárový)                    |
| Rozteč dírek                 | **25 mm**                                    |
| Od vrcholu k první dírce     | **94,3 mm**                                  |

**Délka hrotu není vstup, je odvozená.** Bok je tečný k oblouku vrcholu; z podmínky tečnosti:

```
tecnaPolovicniSirka = r / sqrt(1 + s²)                       = 3,6436 mm
tecnaOdVrcholu      = r − s × tecnaPolovicniSirka            = 2,3495 mm
delkaHrotu          = tecnaOdVrcholu + (beltWidth/2 − tecnaPolovicniSirka) / s
```

Pro 40 mm → **38,46 mm**; pro 35 mm → **32,94 mm**.

Poloviční šířka špičky ve vzdálenosti `y` od vrcholu:

```
y ≤ 0                    → 0
y ≤ tecnaOdVrcholu       → sqrt(r² − (r − y)²)          (oblouk vrcholu)
y < delkaHrotu           → tecnaPolovicniSirka + s × (y − tecnaOdVrcholu)
y ≥ delkaHrotu           → beltWidth / 2
```

Další odvozené hodnoty (nezávislé na šířce):

```
dirkyOdVrcholu     = [94,3; 119,3; 144,3; 169,3; 194,3] mm
prostredniDirka    = 144,3 mm od vrcholu   (třetí z pěti)
rozsahNastaveni    = ±50 mm                (dvě dírky na každou stranu)
celkovaDelkaPasu   = namerenyObvod + 90 + 144,3 = namerenyObvod + 234,3 mm
```

`namerenyObvod` je vzdálenost od ohybu u přezky k dírce, kterou nositel používá.

## 4. Kontroly, které musí program provést před kreslením

Program **odmítne** vygenerovat šablonu, pokud kterákoli neplatí. Každá musí být pokrytá testem.

1. Můstek mezi koncem drážky a hranou bližšího otvoru pro nýt ≥ 6 mm.
   Tedy `blizsiNyt − prumerOtvoru/2 − delkaDrazky/2 ≥ 6`.
2. Za vzdálenějším nýtem zbývá do konce pásu ≥ 6 mm.
   Tedy `delkaKonce − (vzdalenejsiNyt + prumerOtvoru/2) ≥ 6`.
3. Můstek od otvoru nebo drážky k boční hraně pásu ≥ 6 mm.
   Tedy `beltWidth/2 − max(prumerOtvoru, sirkaDrazky)/2 ≥ 6`.
4. Polohy nýtů jsou vzestupné.
5. Šířka poutka ≤ světlá délka kapsy mezi nýty.
6. Počet dírek pro trn je nepárový (jinak neexistuje prostřední).
7. Můstek mezi dírkami pro trn `rozteč − průměr` ≥ 6 mm.
8. Mezi koncem hrotu a první dírkou ≥ 6 mm.
9. `noseRadiusMm > 0` a `taperSlope > 0`.
10. Tečná poloviční šířka < `beltWidth/2` (zaoblení se do šířky vejde).

## 5. Rozvržení na listu (mm od levého a horního okraje A4)

Jde o funkční, ověřené rozvržení; agent ho může změnit, pokud projdou akceptační kritéria.

**Strana 1:** levá hrana pásu `x = 22`; linie ohybu `y = 132`; pás od `y = 42` (nahoře otevřený,
neřezat) do `y = 222` s **plochým** zakončením. Kalibrační čtverec
`x = 150…200`, `y = 30…80`. Pásek na poutko vodorovně od `x = 22`, `y = 232`, výška 12 mm, se
stupnicí po 10 mm. Poznámky od `y = 258`, řádkování 4,2 mm.

**Strana 2:** levá hrana pásu `x = 22`; vrchol špičky `y = 45` na střednici; pás dole otevřený,
končí 12 mm za poslední dírkou. Kalibrační čtverec stejně jako na straně 1.

Kresba: obrys plnou linkou 0,3 mm; linie ohybu **čárkovaně, výrazně** (např. červeně);
střednice slabě čárkovaně; každý otvor jako kružnice se **záměrným křížkem** ve středu — bez
křížku se poloha nedá přenést šídlem. Kóta kapsy pro poutko odlišnou barvou.

## 6. Požadavky na výstup

- **PDF A4 (210 × 297 mm), měřítko přesně 1:1.** Souřadnice v milimetrech, žádné přepočty na
  „pixely“.
- Na **každé** straně **kalibrační čtverec 50 × 50 mm** s textem, aby si uživatel po vytištění
  ověřil měřítko. Bez něj je šablona nepoužitelná.
- V hlavičce každé strany pokyn: tisk na A4 na 100 %, bez „přizpůsobit stránce“.
- Kromě PDF vygenerovat i SVG (kvůli verzování a kontrole textů).
- Název souboru nese šířku, např. `opasek-sablona-40mm.pdf`.

## 7. Popisky (česky, přesně)

Všechny texty česky, čísla **s desetinnou čárkou**. Popisky, které závisí na šířce pásu, se
**musí počítat**, ne psát ručně:

- titulek `Opasek <šířka> mm — strana 1: konec u přezky` (resp. `strana 2: konec se špičkou`)
- `hrot <délkaHrotu> mm`
- `Poutko — pásek <délkaPoutka> × 12 mm (obvod zdvojené části <obvod> mm + 15 mm přeplátování)`

Popisky nezávislé na šířce (u všech šířek stejné):

- `nýt ± 73,2 mm od ohybu`, `nýt ± 25,5 mm od ohybu`
- `drážka 25 × 6 mm, ohyb ji půlí`
- `můstek u drážky 10 mm`
- `kapsa pro poutko 47,7 mm (světlá 37,7 mm)`
- `konec pásu 90 mm od ohybu`
- `OHYB (příčka přezky)`
- `vrchol zaoblený r = 4 mm (není ostrý hrot)`
- `rozteč 25 mm`, `PROSTŘEDNÍ DÍRKA = tvoje míra`, `144,3 mm od hrotu`
- `nastavení ± 50 mm (2 dírky sem i tam)`
- `Dírky Ø 4,5 mm, 5 kusů, rozteč 25 mm.`
- `CELKOVÁ DÉLKA PÁSU = naměřený obvod + 234,3 mm`

Postup na straně 1 (čtyři kroky, v tomto pořadí — pořadí je věcné, ne kosmetické):

1. Přenes značky na rub pásu: ohyb, drážku i všechny čtyři otvory.
2. Vysekni 6mm otvory pro nýty i konce drážky (stejný průbojník), drážku mezi nimi vyřízni nožem.
3. **Navlékni poutko na přehnutý konec. Teprve pak ohni konec kolem přezky.**
4. Sešroubuj oba nýty. Poutko zůstane uvězněné v kapse mezi nimi.

Plus poznámka: `Nýty: 2 kusy, každý prochází oběma vrstvami — proto jsou otvory čtyři.`

Na straně 2 uvést, že se obvod měří na stávajícím opasku od ohybu u přezky k používané dírce,
a že se dírky děrují až po zkoušce na těle a špička se odřezává jako poslední krok.

## 8. Akceptační kritéria

Agent musí výstup **změřit**, ne jen vykreslit. Postup: `pdftoppm -gray -r 300` a odečet poloh
tmavých pixelů (1 px = 0,0847 mm). Pro **každou** generovanou šířku musí platit:

| Kontrola                        | Cíl                                     | Tolerance                        |
| ------------------------------- | --------------------------------------- | -------------------------------- |
| Rozměr listu                    | 210 × 297 mm                            | 0,3 mm                           |
| Kalibrační čtverec (obě strany) | 50 × 50 mm                              | 0,2 mm                           |
| Šířka pásu (obě strany)         | `beltWidthMm`                           | 0,25 mm                          |
| Poloha linie ohybu              | podle rozvržení                         | 0,25 mm                          |
| Čtyři polohy nýtů vůči ohybu    | ±25,5 a ±73,2 mm                        | 0,2 mm                           |
| Oba konce drážky vůči ohybu     | ±9,5 mm                                 | 0,2 mm                           |
| Konec pásu vůči ohybu           | 90 mm                                   | 0,25 mm                          |
| Délka pásku na poutko           | dle výpočtu                             | 0,4 mm                           |
| Pět dírek vůči vrcholu špičky   | 94,3 / 119,3 / 144,3 / 169,3 / 194,3 mm | 0,2 mm                           |
| Čtyři rozteče dírek             | 25 mm                                   | 0,15 mm                          |
| Délka hrotu                     | dle výpočtu                             | 1,6 mm (rameno přechází plynule) |

Dále musí projít **textová kontrola**: program (nebo test) přečte vygenerované SVG, vezme šířku
z názvu souboru, spočítá z ní hodnoty a ověří, že je popisky obsahují. Bez toho se zadrátovaná
hodnota v textu nepozná.

Profil špičky lze navíc ověřit proti těmto naměřeným bodům (poloviční šířka v mm ve vzdálenosti od
vrcholu, pás 40 mm) — tolerance 0,15 mm:

```
0,5 → 1,92   1,0 → 2,69   1,5 → 3,19   2,5 → 3,74   3,0 → 3,95
3,5 → 4,17   4,0 → 4,42   21,0 → 12,105   38,0 → 19,685
```

A pro pás 35 mm (tolerance 0,15 mm):

```
1,0 → 2,56   2,0 → 3,45   3,0 → 3,96   4,0 → 4,42
10,0 → 7,18   20,0 → 11,66   30,0 → 16,23
```

## 9. Známé pasti

Tohle jsou skutečné chyby, které při tvorbě téhle šablony vznikly. Vyhnout se jim.

1. **Nemíchat rozměry z různých předloh.** Jedna zdrojová šablona měla drážku 40 mm, druhá 25 mm.
   Kombinace „drážka 40 mm“ + „nýt 25,5 mm od ohybu“ nechá mezi drážkou a otvorem **2,5 mm** kůže,
   a to v nejzatíženějším místě pásku, kde na něj táhne celá síla a drží ho dva nýty. Proto je
   kontrola můstku v odstavci 4 povinná a proto jsou všechny rozměry konce u přezky z jednoho zdroje.
2. **Anglická špička není ostrý trojúhelník.** Vrchol je oblouk r ≈ 4 mm, na který jsou boky
   tečné. Ostrý trojúhelník se od skutečného tvaru u vrcholu liší až o **2,4 mm**. Praktický důvod:
   ostrý hrot z kůže se krabatí a třepí a nožem se přesně nevyřízne.
3. **Nezadrátovat šířku do textů.** Titulek `Opasek 40 mm` zůstal konstantní, takže šablona pro
   35mm pásek tvrdila 40 mm. Geometrie přitom byla správně — chybu tedy nezachytily žádné
   geometrické testy. Každý údaj závislý na šířce musí být počítaný a pokrytý textovou kontrolou.
4. **Délka hrotu není konstanta.** Vychází ze šířky, sklonu boku a zaoblení vrcholu. Zadrátovaná
   hodnota je pro jinou šířku špatná.
5. **Při ověřování skenováním renderu vzorkovat víc míst.** Čárkovaná linie ohybu může na
   zvolené souřadnici padnout do mezery mezi čárkami a „zmizet“.

## 10. Provenience čísel

Aby agent nevydával odhady za měření:

**Odměřeno** z produkčních šablon třetích stran (render 300 dpi): šířka pásu, drážka 25 × 6 mm
půlená ohybem, Ø otvoru pro nýt 6 mm, polohy nýtů ±25,5 a ±73,2 mm, délka přehnutého konce 90 mm,
dírky pro trn Ø 4,5 mm v počtu 5 s roztečí 25 mm, 94,3 mm od vrcholu, sklon boku špičky 0,453
a zaoblení vrcholu 4 mm.

**Zvoleno** (spočítané, ne odzkoušené v praxi): **ploché** zakončení přehnutého konce (tak to má
i předloha, ze které je rozvržení odměřené), šířka poutka 12 mm, přeplátování 15 mm, minimální
můstek 6 mm (jeden průměr otvoru), rozvržení na listu.

Nezávislé potvrzení, které agent může použít jako kontrolu: pro obvod 95 cm vychází celková délka
dílu 95 + 8 + 14,43 = **117,43 cm** a pro 85 cm **107,43 cm**; obojí odpovídá délkám, které uvádí
veřejný generátor střihů, ze kterého část rozměrů pochází (ten má přehnutý konec 80 mm, ne 90 mm).

**Neověřené a k vyzkoušení na odřezku:** délka poutka, hloubka případného zkosení kůže v ohybu
a to, zda ohyb 3–4 mm kůže nasucho poznamená líc.
