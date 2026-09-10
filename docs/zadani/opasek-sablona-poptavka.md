# Poptávka na vyřezání šablony opasku (text k odeslání)

## Doporučená varianta: jedna univerzální deska

`pnpm pattern:belt-end --multi` → `docs/generated/opasek-sablona-univerzalni-deska.svg`

**Jedna deska 45 × 405 mm pro pásky šířky 28–45 mm.** Funguje proto, že polohy všech otvorů podél
pásu na šířce nezávisí a koncové body zkosení špičky pro všechny šířky leží na jedné a téže přímce
(ověřeno pro 30 / 32 / 35 / 38 / 40 / 45 mm). Zkosení se obtáhne a **stop určí hrana kupovaného
pásu** — proto na desce nejsou žádné značky velikostí, byly by zbytečné a rozbíjely by hranu, po
které se vede šídlo.

Deska nese: zkosenou špičku s obloukem vrcholu, 5 dírek pro trn, dva rozlišovací otvory
u prostřední dírky, vyrovnávací drážku na ose, otvor na zavěšení, vyříznutou drážku pro trn,
4 otvory pro nýty a 2 značky linie ohybu mimo osu. Spodní hrana desky je konec pásu, dá se podle
ní označit odříznutí.

**Materiál musí být ČIRÝ akrylát 3–4 mm** — přes desku se dívá na narýsovanou střednici pásu
a vyrovnává se podle úzké drážky. U neprůhledného materiálu deska nefunguje.

Poutko na desce záměrně není: jeho délka závisí na šířce i tloušťce pásu a měří se na složeném
pásku, takže univerzální díl pro něj neexistuje. Vyřízne se z odřezku podle míry.

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
> **Materiál:** **čirý** akrylát (plexisklo) **3 mm** (klidně 4 mm, deska je dlouhá).
> Průhlednost je funkční požadavek, ne estetika — přes šablonu se dívám na rysku na materiálu.
>
> **Počet:** 1 ks.
>
> V souboru je **1 jednotka = 1 mm**. Úzká drážka **1,5 mm** na ose je vyrovnávací a je funkční —
> prosím nevyplňovat ani nevynechávat.
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
