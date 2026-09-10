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

### Tři věci, které je potřeba vědět, než ji poprvé použiješ

1. **Značí se šídlem, ne tužkou.** Ořezaná tužka je kužel: ve 3 mm nad hrotem má 2,3–3,3 mm,
   takže se do 2mm otvoru zanoří jen po tuhu a **hrot zůstane 0,5–1,5 mm nad kůží** — nedosáhne.
   Použij **kulaté rýsovací šídlo** (to z pouzdra na karty; ve 3 mm nad hrotem má 0,6 mm).
   Tupé šídlo projde otvory, ale ne 1mm sloty zaobleného konce.
   - **U dírek a nýtů krouži šídlem po stěně otvoru.** Šídlo se v otvoru samo necentruje (vůle
     ± 0,7 mm), ale vykroužený prstenec Ø 1,4 mm má střed přesně tam, kde má být — a celý zmizí
     ve vyseknuté dírce.
   - **U dvou značek linie ohybu naklápěj šídlo stejným směrem.** Opačné náklony pootočí spojnici
     přes 40 mm šířky o 2° a přezka bude nakřivo; stejný náklon posune obě značky stejně a linie
     zůstane rovnoběžná.
   - Do **výřezu špičky** se šídlo dostane prakticky až k vrcholu: 0,2 mm od vrcholu je výřez
     ještě 2,5 mm široký. Tam se obtahuje hrana výřezu, žádná vůle se neřeší.
2. **Při vyrovnávání se dívej svisle dolů, ne pod úhlem.** Gravírování je jen na jedné straně
   a dělí ho od kůže 3 mm akrylátu, takže při pohledu 30° od svislice se linka zdá posunutá
   o **1,7 mm** — víc než celá přesnost, o kterou se snažíme. Při pohledu shora je chyba nulová.
   Otvory a výřezy paralaxou netrpí, šídlo se kůže fyzicky dotkne.
   _(Dřív tu stálo „používej gravírovanou stranou dolů". To je špatná rada: gravírování je
   jednostranné, takže obrácením destičky se celý layout zrcadlí — zkosený roh skončí vpravo,
   „levá hrana = konec pásu" přestane platit a čísla se čtou zrcadlově.)_
3. **Nic z toho není odzkoušené v praxi.** Geometrie je ověřená proti třem komerčním šablonám
   a křížově proti naší tiskové verzi, ale destičku jsem nikdy nedržel v ruce ani já, ani ty.
   První pásek je zkouška — proto se před objednáním akrylátu vyplatí vytisknout kontrolní PDF
   a projít si celý postup na papírové verzi a odřezku.

### Jak se destička používá

1. **Přilož destičku a srovnej obě hrany pásu na pár linek pro svou šířku** (např. „40").
   Tím je destička vystředěná — **střednici na pás rýsovat nemusíš**, k tomu ty linky jsou.
   Přes čirý akrylát na hrany pásu vidíš. Šířku mimo linky (38, 32, 33 mm…) vystředíš podle
   **příčné milimetrové stupnice**: obě hrany musí ležet na stejném čísle.
   **Pás můžeš položit lícem i rubem nahoru** — každá řada je zrcadlově symetrická k vlastní ose,
   takže se obrácením pásu nic nezrcadlí. Destička zůstává gravírováním nahoru vždy; obrací se
   pás, ne destička.
2. **Nejdřív srovnej konec pásu na kolmo** — o něj se opírá celá řada 3. A zkontroluj, že
   délka pásu stačí: potřebuješ **obvod + 234,3 mm**.
3. **Sraz a zalešti dlouhé hrany** na plocho rozloženém pásu, **před montáží**. Je to 2,4 m
   práce, tedy většina projektu, a po sešroubování je zdvojený konec neohrabaný.
4. **Konec u přezky (řada 3):** **levou hranou destičky přesně na konec pásu**. Označ šídlem
   4 otvory pro nýty a 2 značky linie ohybu, obtáhni ovál pro trn.
5. Vysekni 6mm otvory pro nýty a **oba konce oválu** (Ø 6 mm) — razník zarovnej na obtažené
   oblouky, ne doprostřed rýhy. Boky oválu pak veď nožem **tečně k oběma vyseknutým dírám**,
   ne po rýze: šídlo se opírá o hranu výřezu v horním líci destičky, takže obtažený ovál vyjde
   o 0,3 mm z každé strany menší (24,4 × 5,4 mm místo 25 × 6) a trn by se dřel.
   Spoj obě značky ohybu pravítkem. **Zónu ohybu navlhči** a ohni ji **kolem příčky přezky**,
   ne přes hranu — 4 mm třísločiněné kůže nasucho do malého rádiusu popraská.
   **Navlékni poutko** a teprve pak sešroubuj oba nýty (kapka zajišťovače závitů nebo lak;
   nýty v nejzatíženějším místě se povolují).
6. **Vyzkoušej pásek na sobě** a označ, kam padne trn. To je prostřední dírka.
7. **Konec se špičkou — vyber si tvar:** řada 1 pro **hrot**, řada 2 pro **zaoblený konec**.
   Přilož tak, aby **prostřední otvor** (ten se dvěma rozlišovacími po stranách) ležel na té
   značce, a hrany pásu opět na linky své šířky. Označ zbylé 4 dírky a obtáhni tvar konce:
   u řady 1 vnitřní hranu výřezu **jen dokud nedojdeš k hraně pásu** (dál je výřez záměrně širší),
   u řady 2 ten slot, který se dotýká linky tvé šířky. Slot je z celé destičky nejlépe vedený
   prvek — šídlo v něm má vůli jen ± 0,2 mm a musí stát skoro svisle, takže se nedá pokazit.
8. Vysekni 4,5mm dírky a nakonec vyřízni konec pásu — **veď nůž tak, aby rýhu odebral**.
   Obtažená linka leží ze stejného důvodu jako u oválu 0,3 mm dovnitř tvaru (obtažený hrot vyjde
   38,9 mm místo 38,5 mm) a řez po její vnější straně to vyrovná. **Označit dírky i tvar konce musíš
   v jednom přiložení** — registrovat destičku na už vyseknutou dírku Ø 4,5 mm je nepřesné
   a právě „jedno přiložení, žádná kumulace chyby" je důvod, proč jsou v jedné řadě.

**Před objednáním** vytiskni kontrolní PDF na **A4 na šířku na 100 %** a přeměř obrys: musí být
**215 × 184 mm**. Obrys sám je kalibrace. Na výtisku si zároveň zkus **projít celý postup šídlem**
včetně 1mm slotů zaobleného konce — jestli se do nich tvoje šídlo dostane, poznáš na papíře
zdarma.

### Délka dříku šroubovacího nýtu — vybírej pás 3,0–3,5 mm

Ověřené pravidlo pro šroubovací nýty (chicago screws): **délka dříku má být o 1–1,5 mm kratší než
celková tloušťka sešroubovaných vrstev.** Označení „10/6“ znamená **hlavička Ø 10 mm, dřík 6 mm**
— není to průměr a délka.

Zdvojený konec u přezky je 2 × tloušťka pásu:

| Tloušťka pásu | Zdvojený konec | Potřebný dřík | Vyjde s 10/6? |
| ------------- | -------------- | ------------- | ------------- |
| 3,0 mm        | 6,0 mm         | 4,5–5,0 mm    | ano           |
| 3,5 mm        | 7,0 mm         | 5,5–6,0 mm    | ano, na hranu |
| 4,0 mm        | 8,0 mm         | 6,5–7,0 mm    | **ne**        |

CraftPoint má v nabídce jen **10/6**, delší dřík ne. Proto: **kup pás 3,0–3,5 mm**, ne 4 mm.
Shodou okolností to je přesně rozsah, který požaduje i sama předloha (3,0–4,0 mm), a CraftPoint
takový pás v šířce 40 mm skladem má (287 Kč, ověřeno 2026-09-10). Kdo už 4mm pás má, musí sehnat
nýt s dříkem 7 mm jinde, nebo konec u přezky **ztenčit ve zdvojené zóně** (to je ale práce
s ostrým nožem na nejzatíženějším místě pásku — pro první projekt to nedoporučuju).

Destička na tloušťce nezávisí: kontroluje se v ní jen to, že pás není nad 5 mm.

### Poutko: žádné otvory navíc

Poutko **nepotřebuje vlastní otvory**. Je to smyčka navlečená na zdvojenou část konce a **uvězněná
v kapse mezi dvěma nýty** — přesně k tomu ten druhý nýt je. Proto má destička čtyři otvory (dva
nýty), a ne jen dva.

Druhá varianta, kdy se oba konce pásku poutka upnou **pod nýt**, by taky žádné otvory navíc
nevyžadovala (poutko by nýtový otvor sdílelo), ale nešla by sešroubovat: pás + pás + dva konce
poutka po 2 mm je o **4 mm víc** než samotný zdvojený konec, a už ten je na dřík 6 mm hraniční
(viz níže). Poutko tedy musí být volné v kapse.

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

## Text poptávky (pro destičku)

> Dobrý den,
>
> rád bych poptal vyřezání laserem podle přiloženého souboru.
>
> **Soubor:** `opasek-desticka.svg` — vektorový, měřítko **1:1**, **1 jednotka = 1 mm**.
> Prosím **neměnit měřítko**; rozměry jsou funkční, jde o šablonu pro řemeslnou výrobu.
> Kdybyste potřebovali jiný formát, pošlu **DXF v milimetrech** (nebo PDF v křivkách).
>
> **Hotový díl: 215 × 184 mm** (list v souboru má 5 mm rezervu kolem). Orientace na desce
> libovolná, klidně pootočte.
>
> **Materiál:** **litý (GS) čirý** akrylát **3 mm**. Litý kvůli žebrům 1,5 mm a čistotě řezu,
> čirý proto, že se přes destičku dívám na rysku na materiálu — průhlednost je funkční požadavek.
>
> **Počet:** prosím nacenit **1 ks i 2 ks** (chtěl bych mít náhradu).
>
> **Dvě vrstvy:**
>
> - `REZ` (červená #FF0000) = **řez**
> - `GRAVIROVANI` (modrá #0000FF) = **gravírování**
>
> Vrstvy jsou i pojmenované (`inkscape:label`). Gravírování jsou jen vodicí linky, stupnice
> a čísla; **čísla jsou vektorové tahy, ne živý text**, takže není potřeba žádný font.
> V řezu není text ani výplň a všechny kontury jsou uzavřené.
>
> **Prosím o tento postup:**
>
> 1. nejdřív **gravírování**, pak vnitřní geometrie, **obrys až nakonec** (jinak se díl uvolní
>    a tenká žebra i odpadní srpky se pohnou),
> 2. gravírování **vektorově, jedním průchodem, nízký výkon** — ne rastrem,
> 3. řez **na střednici, kerf nekompenzovat** (potřebuji, aby vzájemné vzdálenosti otvorů
>    odpovídaly souboru do **0,2 mm**; absolutní poloha na desce nehraje roli),
> 4. **bez jakéhokoli dokončení** — nebrousit, neleštit plamenem, nebubnovat,
> 5. **fólii ponechte** a balte prosím na tvrdou podložku.
>
> **Na co upozorňuji:**
>
> - **Čtyři vnořené sloty 1,0 mm** v jedné řadě mají mezi sebou **žebra 1,5 mm**. Je to záměr.
>   Pokud je váš kerf nad 0,25 mm, dejte prosím vědět a pošlu verzi s užšími sloty.
> - **Otvory Ø 2 mm** jsou značicí, mají zůstat malé — neslučovat a nezvětšovat. Vím, že to je pod
>   obvyklým pravidlem „minimální průměr ≈ tloušťka materiálu“; **prosím potvrďte, že je ve 3mm
>   litém akrylu spolehlivě protáhnete** (nesmí zůstat zaslepené ani výrazně kónické — prostrkuje
>   se jimi šídlo). Kdyby to byl problém, dejte vědět a upravím soubor.
> - Otvor **Ø 4 mm** v rohu je na zavěšení.
> - **Zkosený levý horní roh** je záměrný, je to značka orientace.
> - **Vyříznutý trojúhelník** a **ovál** jsou funkční výřezy, prosím nevynechávat.
> - Čtyři tenké srpky uvnitř slotů jsou **odpad**, propadnou roštem — díl je v pořádku.
> - Ve gravírování je **kontrolní kóta 50 mm**; podle ní si po vyřezání ověřím měřítko.
>
> Prosím o cenu a termín. Děkuji.

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

Materiál na vlastní řezání: **čirý** akrylát 3 mm, formát 500 × 250 mm stačí. Cenu tu neuvádím —
jediný odkaz, který jsem ověřil, vedl na variantu „hladké **opál**“, tedy mléčnou, a průhlednost je
u téhle destičky funkční požadavek (dívám se přes ni na rysku). A 3 mm už odlamovacím nožem
neuřízneš, potřebuješ lupenkovku a pilníky.
