# Poptávka na vyřezání šablony opasku (text k odeslání)

## Doporučená varianta: jedna plochá destička

`pnpm pattern:belt-end --multi` → `docs/generated/opasek-desticka.svg`

**Destička 270 × 127 mm, čirý akrylát 3 mm, pro pásky 28–45 mm.** Dvě řady:

- **Horní řada – špička a dírky pro trn.** Vyříznutý tvar špičky, 5 otvorů pro dírky, dva
  rozlišovací otvory u prostřední dírky. Umisťuje se **podle prostřední dírky**.
- **Dolní řada – konec u přezky.** Vyříznutý ovál pro trn, 4 otvory pro nýty, 2 značky linie
  ohybu. Umisťuje se **podle levé krátké hrany destičky = konec pásu**.
- **Zkosený levý horní roh** značí, která krátká hrana je konec pásu.
- **Závěsný otvor Ø 4 mm** v pravém dolním rohu.

Jedna destička stačí na všechny šířky proto, že polohy všech otvorů podél pásu na šířce nezávisí
a koncové body zkosení špičky pro všechny šířky leží na jedné a téže přímce. Zkosení se obtáhne
a **stop určí hrana kupovaného pásu**.

### Jak se destička používá

1. **Narýsuj na pás střednici** (dva body ve w/2 od hrany, spojit pravítkem). Přes čirý akrylát ji
   uvidíš a podle ní destičku vystředíš — proto musí být materiál průhledný.
2. **Konec u přezky:** přilož destičku dolní řadou na konec pásu, **levou hranou destičky přesně na
   konec pásu**. Označ šídlem 4 otvory pro nýty a 2 značky linie ohybu, obtáhni ovál pro trn.
3. Vysekni 6mm otvory pro nýty a konce oválu, ovál mezi nimi vyřízni nožem. Spoj obě značky ohybu
   pravítkem. Navlékni poutko, ohni konec kolem přezky, sešroubuj nýty.
4. **Vyzkoušej pásek na sobě** a označ, kam padne trn. To je prostřední dírka.
5. **Špička:** přilož destičku horní řadou tak, aby **prostřední otvor** (ten se dvěma
   rozlišovacími po stranách) ležel na té značce. Označ zbylé 4 dírky a obtáhni zkosení špičky —
   **jen dokud nedojdeš k hraně pásu**, dál už je výřez záměrně širší než pás.
6. Vysekni 4,5mm dírky a nakonec vyřízni špičku.

Poutko na destičce záměrně není: jeho délka závisí na šířce i tloušťce pásu a měří se na složeném
pásku. Vyřízne se z odřezku podle míry.

## Varianta na míru jedné šířce

Řezací soubory generuje `pnpm pattern:belt-end --laser`:

```
docs/generated/opasek-sablona-40mm-laser.svg
docs/generated/opasek-sablona-35mm-laser.svg   (pnpm pattern:belt-end --width 35 --laser)
```

Soubor je **1:1 v milimetrech**, list 210 mm široký. Obsahuje tři díly: konec u přezky, konec se
špičkou a pásek na poutko.

## Text poptávky

> Dobrý den,
>
> rád bych poptal vyřezání laserem podle přiloženého souboru.
>
> **Soubor:** `opasek-sablona-40mm-laser.svg` — vektorový, v měřítku **1:1**, jednotky milimetry.
> Prosím **neměnit měřítko ani soubor nepřizpůsobovat formátu**; rozměry jsou funkční, jde
> o šablonu pro řemeslnou výrobu.
>
> **Materiál:** **čirý** akrylát (plexisklo) **3 mm**.
> Průhlednost je funkční požadavek, ne estetika — přes destičku se dívám na rysku na materiálu.
>
> **Počet:** 1 ks.
>
> V souboru je **1 jednotka = 1 mm**. **Zkosený levý horní roh** je záměrný, je to značka
> orientace. **Vyříznutý trojúhelníkový tvar** a **ovál** jsou funkční výřezy, prosím nevynechávat.
>
> **Soubor je jen na řez** — jedna vrstva `cut`, žádný text, žádná výplň, všechny kontury uzavřené.
> Není potřeba nic gravírovat.
>
> **Přesnost:** potřebuji, aby vzájemné vzdálenosti otvorů odpovídaly souboru **do 0,2 mm**.
> Absolutní poloha na desce nehraje roli.
>
> **Otvory Ø 2 mm** jsou značicí, mají zůstat malé — neslučovat je a nezvětšovat.
> Otvor **Ø 4 mm** je na zavěšení šablony.
> **Zářezy v bočních hranách** jsou součástí obrysu, jsou záměrné a nejsou to vady kontury.
> **Kompenzaci kerfu prosím neřešte**, u šablony na kůži nehraje roli.
> V souboru je **1 jednotka = 1 mm**, list je 210 mm široký.
>
> Prosím o cenu a termín. Pokud potřebujete jiný formát, pošlu DXF nebo PDF v křivkách.
>
> Děkuji

## Kam poptávku poslat

Ověřeno 2026-09-10, že berou vektorová data a řežou od jednoho kusu. **Ceny žádná z nich neuvádí,
dělají se na dotaz.**

| Provozovna                | Odkaz                                                                 | Poznámka                                                            |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| plexi.cz                  | <https://www.plexi.cz/zakazkova-vyroba/rezani-a-gravirovani-laserem/> | řezání i gravírování plexi                                          |
| TITAN-Multiplast          | <https://www.titan-multiplast.cz/sluzby/rezani-plastu-laserem>        | plasty 0,5–50 mm                                                    |
| MK Plexi, Praha 4 Modřany | —                                                                     | stroj na tenké malé díly, berou Corel/AutoCAD/Illustrator i vektory |
| Levné gravírování         | <https://www.levne-gravirovani.cz/rezani-plastu-a-plexiskla>          | plasty a plexi                                                      |

Poptat radši dvě až tři, ceny za jednorázový malý kus se dost liší.

## Varianta bez řezárny

Když nechceš čekat ani platit za zakázku:

1. Vytiskni **tiskovou** verzi (`opasek-sablona-40mm.pdf`) na **samolepicí A4** na 100 %.
2. Přeměř kalibrační čtverec — musí být 50 × 50 mm.
3. Nalep na **PVC nebo PP desku 1–2 mm**.
4. Prořízni oboje naráz odlamovacím nožem na řezací podložce, po několika lehkých tazích.
5. V každém středu otvoru udělej dírku **1,5–2 mm** (vrtáček nebo rozpálený hrot).
6. Na hranách vyřízni **zářezy** v místě linie ohybu a prostřední dírky.

Tahle šablona se **obtahuje šídlem**, neřeže se podle ní nožem — 1–2 mm hrana je nízká a čepel po
ní přejede. Pro vedení nože je potřeba akrylát 3 mm a víc; to je celý důvod, proč jsou v profi
videích silné akrylové šablony.

Materiál na vlastní řezání: akrylát 3 mm 500 × 250 mm za 199 Kč (Hornbach, ověřeno 2026-09-10) —
ale 3 mm už odlamovacím nožem neuřízneš, potřebuješ lupenkovku a pilníky.
