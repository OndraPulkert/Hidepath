# OBRAT R10 — rezervy z kontroly vyrobitelnosti

24. 10. 2026. Před papírovým modelem prošly R09 čtyři nezávislé kontroly: průchod výrobou krok za krokem, náročnost pro začátečníka, materiál a nářadí, rizika návrhu. Žádný krok nebyl fyzicky nemožný, ale několik míst mělo rezervu 0–0,5 mm proti přesnosti začátečníka ±0,5–1 mm. Autor schválil celý balík změn. Konstrukce a vzhled zůstávají jako v [iteraci 09](iterace-09-zjednoduseni.md). **Prototyp zatím neušitý.**

## Změny střihu (model `src/lib/geometry/obrat-wallet.ts`)

| Co                           | R09                                            | R10                                            | Proč                                                                            |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Ústí dutin, jazýček a víčko  | ústí y 51, jazýček a víčko do y 69, B (12; 59) | ústí y 50, jazýček a víčko do y 68, B (12; 58) | A měla k víčku a jazýčku rezervu 0; hloubka dutin roste z rezervy 0,7 na 1,7 mm |
| A                            | (12,5; 77)                                     | (12; 77,25)                                    | rezerva k T3, víčku a lepeným pásům 0,5–1,25 mm místo 0                         |
| Lepený pás těla vlevo a dole | 6 mm                                           | 5 mm (`BODY_GLUE`), vpravo dál 6 mm            | kryt K u A zasahoval do lepidla                                                 |
| C                            | (88; 27)                                       | (88; 25,5)                                     | kolečko K mělo ke švu klopy 1,74 mm při požadavku 1,5; teď 3,24 mm              |
| Rezerva klopy                | 4 mm                                           | 6 mm (T1 108 × 146)                            | pokryje přehyb až 14 mm                                                         |
| Ramena T2                    | y 16                                           | y 15                                           | díry pravého boku vychází 2 mm nad a pod hranou pásu, ne 1 mm nad ní            |
| Přídavek víčka na ohyb       | 3 mm                                           | 4 mm                                           | víčko se zarovná s jazýčkem seříznutím naplocho                                 |
| Kryt K u C                   | Ø 13                                           | Ø 17 (`coverRadiusC`)                          | lepený prstenec přes přírubu 1 mm byl málo; u A zůstává Ø 13                    |

Kontroly `checkObrat` projdou, díly se vejdou na A4 kůže (sloupec 295 mm), kapacita mincí se nemění (3 mince 50/56, 4 mince 70/126).

## Změny postupu (lekce)

- Lekce 3: maketa závěsu přes tři vrstvy (50× ohyb), zkušební dutina 20 + 10 a 50 Kč, ohyb víčka nasucho a navlhko. Lekce 4: lepený jazýček s paticí do druhého dne, 50× druk a 20× karta.
- Lekce 2 a 6: celou kůži nemáčet, ohyb víčka navlhčit a nechat do druhého dne pod závažím; zkouška B 50×; zkouška místa A s podloženým zapnutým drukem.
- Lekce 7: nejdřív T1 z rubu, pak kůži otočit a T2 na líc; kryty pod závažím, zkouška 20× kartou.
- Lekce 8: pravý bok prorazit a ušít se zavřeným pásem jako první (první díra 2 mm pod hranou P, poslední v rohu nejvýš 4 mm od pravé hrany, mimo ohyb pásu); pak s odklopeným pásem dno od 8 mm od pravé hrany a levý bok druhou nití.
- Lekce 9: objímka A bez mincí a s kontrolou kolečka K i k jazýčku a víčku; obtisk C před seříznutím a seříznutí nejvýš o 5 mm méně, než zbývá od kolečka K k hraně; ozdobný šev z líce s podloženou klopou, 3 mm před ohybem.

## Kontrola kolizí (R10)

Díly, kování ani švy se nekříží a nic není zakryté ve chvíli, kdy se prorází, šije nebo osazuje. Jediná kolize nástroje: první díra dna 8 mm od pravé hrany by ležela pod ohybem odklopeného pásu – dno začíná 12 mm od pravé hrany (dvě rozteče bez stehu). Proti rozteklému lepidlu u krytu K na A a u konce víčka (1,5 mm od lepidla závěsu) ohraničuje lekce 8 okraje páskou. Rohová díra leží celá v lepeném pruhu.

Záloha, když zkouška místa pro A v lekci 6 nevyjde (pás nedosedne lehce kvůli schodu víčka a jazýčku): `lidBottomY` a `coinTab.bottomY` 67 a `snapA` (12; 78) – mezera A–víčko 5 mm, `checkObrat` bez chyb, kapacita beze změny.

## Stále neověřené

Platí tabulka z iterace 09. Navíc: lepený jazýček B a kryty K (zkouška v lekci 4; kryt K u A je jen 0,5 mm od lepeného pásu, T1 tam přechází schod 1,2 mm), ohyb víčka navlhko na konkrétní usni (lekce 3), obtisk C před seříznutím jako vodítko pro seříznutí (lekce 9).
