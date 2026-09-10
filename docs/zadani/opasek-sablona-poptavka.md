# Poptávka na vyřezání šablony opasku (text k odeslání)

## Doporučená varianta: jedna plochá destička

`pnpm pattern:belt-end --multi` →
`docs/generated/opasek-desticka.svg` (řezací soubor) a
`docs/generated/opasek-desticka-kontrolni-tisk.pdf` (papírová kontrola před objednáním).

**Destička 215 × 184 mm, čirý akrylát 3 mm, pro pásky 28–45 mm.** Tři řady:

- **Řada 1 – HROT.** Vyříznutý tvar anglické špičky, 5 otvorů pro dírky na trn, dva rozlišovací
  otvory u prostřední dírky.
- **Řada 2 – ZAOBLENÝ KONEC.** Čtyři soustředné sloty (r = 15 / 17,5 / 20 / 22,5 mm), 5 otvorů
  pro dírky, dva rozlišovací. **Konec každého slotu leží přesně na lince své šířky**, takže se
  linky a oblouky označují navzájem a oblouky nepotřebují čísla.
- **Řada 3 – KONEC U PŘEZKY.** Vyříznutý ovál pro trn, 4 otvory pro nýty, 2 značky linie ohybu.
  Umisťuje se **podle levé krátké hrany destičky = konec pásu**.
- **Gravírované vodicí linky pro šířky 30 / 35 / 40 / 45 mm** s čísly — ve všech třech řadách.
- **Příčná milimetrová stupnice** ve všech řadách pro šířky bez linky a **podélné pravítko**
  (135 mm) u horní hrany na měření délky pásku na poutko.
- **Zkosený levý horní roh** značí, která krátká hrana je konec pásu.
- **Závěsný otvor Ø 4 mm** v pravém dolním rohu.

Řady 1 a 2 mají **stejné polohy dírek** a liší se jen tvarem konce — vybereš si, jaký konec chceš.
Obě se umisťují podle prostřední dírky.

Jedna destička stačí na všechny šířky proto, že polohy všech otvorů podél pásu na šířce nezávisí
a koncové body zkosení špičky pro všechny šířky leží na jedné a téže přímce. Zaoblený konec je
naopak polokruh o poloměru `w/2`, tedy pro každou šířku jiný — proto ty čtyři vnořené oblouky.

**Žebra mezi oblouky mají 1,5 mm.** Je to záměr a stejně to mají komerční destičky, ale znamená
to, že destičku je lepší nosit naplocho a neupustit.

### Poutko: žádné otvory navíc

Poutko **nepotřebuje vlastní otvory**. Je to smyčka navlečená na zdvojenou část konce a **uvězněná
v kapse mezi dvěma nýty** — přesně k tomu ten druhý nýt je. Proto má destička čtyři otvory (dva
nýty), a ne jen dva.

Druhá varianta, kdy se oba konce pásku poutka upnou **pod nýt**, by taky žádné otvory navíc
nevyžadovala (poutko by nýtový otvor sdílelo), ale **s našimi nýty nejde**: pás 4 + pás 4 + dva
konce poutka po 2 mm = **12 mm**, a šroubovací nýt 10/6 obchod uvádí jako vhodný pro dvě vrstvy
o celkem 4,5–5 mm. Dřík 6 mm na 12 mm nestačí.

Kapsa mezi nýty je **47,7 mm**, takže poutko v ní má vůli:

| Šířka poutka | Vůle v kapse |
| ------------ | ------------ |
| 12 mm        | 35,7 mm      |
| 20 mm        | 27,7 mm      |
| 25 mm        | 22,7 mm      |

V praxi to nevadí, protože poutkem prochází volný konec pásku a ten ho drží na místě. Kdo chce
poutko těsné, ať posune bližší nýt dál nebo vzdálenější blíž (`rivetOffsetsMm`) a destičku
vygeneruje znovu — kontroly ohlásí, kdyby se tím zúžil můstek u drážky.

**Délka pásku na poutko** se nepočítá, ale **měří na složeném konci**: obtoč kolem něj papírový
pásek, označ přeplátování a délku odečti na podélném pravítku destičky. Orientačně
2 × (šířka pásu + 2 × tloušťka) + 15 mm, pro pás 40 × 4 mm tedy 111 mm.

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
> Gravírované linky a čísla prosím **nepřesouvat** — jejich poloha je funkční.
>
> **Dvě vrstvy:** `cut` (černá, #000000) = **řez**, `engrave` (modrá, #0000FF) = **gravírování**.
> Ve gravírování jsou vodicí linky šířek a čísla; **čísla jsou vektorové tahy, ne živý text**,
> takže není potřeba žádný font. Řez neobsahuje text ani výplň, všechny kontury jsou uzavřené.
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
