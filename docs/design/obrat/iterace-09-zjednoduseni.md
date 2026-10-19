# OBRAT R09 — zjednodušená konstrukce pro začátečníka

18. 10. 2026. Autor schválil zjednodušení: hlavní je vyrobitelnost začátečníkem, vzhled stejný nebo podobný předloze [iterace 03](obrat-iterace-03-nezavisla-klopa.png). Nahrazuje R06–R08. **Střih je úplný, prototyp zatím neušitý.**

- Model a kontroly: `src/lib/geometry/obrat-wallet.ts` (testy vedle).
- Listy 1:1: `pnpm pattern:wallet-obrat` → `docs/generated/obrat-list-1-telo.svg`, `obrat-list-2-dily.svg`.
- Nákres: `public/projekty/obrat/konstrukce.svg`. Kontrolní výstup: [obrat-r09-kontrola.json](obrat-r09-kontrola.json).

## Co se změnilo proti R08 a proč

| R08                                               | R09                                                                           | Důvod                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nosič je součástí zad a obtáčí bok plné peněženky | Samostatný pás P 110 × 42, pravým koncem všitý do pravého švu těla (3 vrstvy) | Délka skoro nezávisí na náplni: vyboulení přes mince zkrátí pás o 0,5–3,6 mm (pracovní odhad: přímka přes předpokládaný úsek 6 mm, ne mechanika ohybu), střih má přídavek 2 mm; zda stačí, ukáže papírový model a rozhodne kožený kus |
| Víčko přišité nad ústím (šev neměl místo)         | Víčko je ohnutý horní okraj P; mince z ústí padají do ohybu                   | Žádný šev nad ústím, mince drží i ohyb                                                                                                                                                                                                |
| Patice B v lemu, rub B vidět zvenku               | Patice B v jazýčku T3 na volném konci, schovaná mezi T3 a P                   | Zvenku je vidět jen A, dutiny zůstanou volné                                                                                                                                                                                          |
| Polohy druků dopasovat přes obsah                 | Patice A, B, C pevně na listu; objímky obtiskem                               | Stejná metoda jako u pouzdra na mince                                                                                                                                                                                                 |
| Délka klopy odhadem                               | Klopa s rezervou 4 mm, seřízne se přes obsah na mezeru 6 mm                   | Nezávisí na odhadu přehybu                                                                                                                                                                                                            |
| Kování neurčené                                   | Prym Anorak 12 mm s aplikátorem, každá polovina v jedné vrstvě                | Uživatel ho má a aplikace ho už používá                                                                                                                                                                                               |

Kontrola po prvním návrhu R09 zamítla B uprostřed na dělicím švu: lepený kruh kolem patice zúžil ústí dutin tak, že by padesátikoruna neprošla. Proto jazýček na volném konci.

## Díly (jedna useň 1,2 mm, vše se vejde na A4)

| Díl             | Rozměr    | Strana listu | Poznámka                                                                                          |
| --------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------- |
| T1 záda + klopa | 108 × 144 | rub          | Ohyb, klopa 54 / 50 mm od ohybu (přehyb 8 + rezerva 4), šikmá hrana, orientační čára po seříznutí |
| T2 přední stěna | 108 × 74  | líc          | Ramena y 16, výkus do y 38, patice A (12,5; 77) a C (88; 27), šrafa konce P 6 mm                  |
| P pás + víčko   | 110 × 66  | rub          | Pás 42 mm, víčko 24 mm (do y 69 + přehyb 3), zářez s odlehčením Ø 2 mm u závěsu                   |
| T3 předek mincí | 95,5 × 39 | líc          | Dutiny 36 + 36 mm mezi švy, jazýček s paticí B (12; 59)                                           |
| K kryt          | Ø 13, 2 × | rub          | Přes patice A a C uvnitř kapsy                                                                    |

Rohy: klopa R8, tělo R6, víčko R4, T3 R2 (u ústí R1), zářez P R1 a R1,5; na listech jsou popsané, šablona rohu klopy R8 je na listu 1 (karton, lekce 9). Souřadnice jsou v zavřeném čelním pohledu (x zleva, y od ohybu klopy). Lepidlo pod T3 jen v pásech 4 mm od okraje (0,5 mm za šev) a na celém jazýčku, pod dělicím švem ne. Pás se ohýbá na kraji šrafy (x 102); víčko i T3 končí před ní. Kontroly v modelu: rezervy druků od hran, švů, výkusu a šikmé klopy; příruba B pod jazýčkem; víčko kryje objímku B; nic nezasahuje do ohybu závěsu; zkušební skladby mincí projdou obálkou; díly se vejdou na A4.

## Pořadí výroby (vše naplocho)

1. Mincovní modul: otvory, hrany ústí a víčka, patice B do jazýčku T3, T3 lepit a šít na rub P, ohnout víčko, objímka B obtiskem. **Zkouška třesením a 30× B před řezem těla.**
2. T1 (s rezervou), T2, K: otvory, horní hrana T2, patice A a C, kryty K.
3. T2 na T1, konec P na zdrsněnou šrafu T2. Se zavřeným pásem prorazit pravý bok, roh a dno po konec šrafy; s odklopeným pásem zbytek dna a levý bok. Jeden U-šev.
4. Objímka A obtiskem; klopu se zapnutým A seříznout přes obsah na mezeru 6 mm vlevo; ozdobný šev a hrany klopy; objímka C obtiskem. Před vyseknutím objímek kontrola papírovým kolečkem K: aspoň 1,5 mm od hrany a švu.

## Kapacita a tloušťka (výpočet, ne měření)

Dutina: využitelně 34 × 34 mm. Zkušební skladby: 50 | 20 + 10, 20 + 10 | 5 + 1, 2 + 1 | 2 + 1. Padesátikoruna vždy sama v dutině; při nejvýš dvou mincích v dutině neprojde žádná čtveřice s 50 Kč (ČNB rozměry, vč. 5 Kč).

Nad mincemi 5 vrstev usně: 12,69 mm s 50 Kč, 15,24 mm s 20 + 10 Kč, bez lepidla a kování. U druků přibude výška zapnutého druku (měří se v lekci 4). Maximum se měří až na prototypu.

## Vzhled proti předloze 03

Stejné: široká zaoblená klopa se šikmou hranou, C vpravo, mezera nad pásem, pás se třemi poli a A vlevo. Jiné: levé pole je užší (24 mm), vpravo je úzký pruh se švem závěsu, horní hrana pásu je ohyb víčka.

## Neověřeno – rozhodne prototyp

| Co                                                   | Kde se ověří                           |
| ---------------------------------------------------- | -------------------------------------- |
| Prym Anorak v jedné vrstvě 1,2 mm, výška druku       | Lekce 4                                |
| Retence mincí pod ohnutým víčkem s B na volném konci | Mincovní modul, lekce 6 (30 zatřesení) |
| Lepený jazýček B při opakovaném rozepínání           | Lekce 6 (30× B)                        |
| Ohyb závěsu pásu a víčka v konkrétní usni            | Lekce 3 a 8                            |
| Délka klopy přes obsah                               | Lekce 5 (model) a 9 (seříznutí)        |
| A hned vedle vyvýšeného místa s B (výška druku B)    | Lekce 6 (zkouška místa pro A), lekce 9 |
| Přídavek pásu 2 mm přes plné dutiny (odhad zkrácení) | Lekce 5 (papír), rozhodne kožený kus   |
| Skutečná tloušťka, nošení                            | Lekce 10                               |

Projekt má obtížnost „Vývojový — neověřený“, dokud podle těchto lekcí nevznikne funkční kus. Pak se podle zápisů opraví střih a štítek se změní na Začátečník.
