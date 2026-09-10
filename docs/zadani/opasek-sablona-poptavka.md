# Poptávka na vyřezání šablony opasku (text k odeslání)

## Doporučená varianta: jedna plochá destička

`pnpm pattern:belt-end --multi` →
`docs/generated/opasek-desticka.svg` (řezací soubor),
`opasek-desticka.dxf` (totéž jako DXF R12 v milimetrech, oblouky jako `ARC`, dvě vrstvy),
`opasek-desticka-rez.dxf` (jen řez, pro automatické kalkulačky),
`opasek-desticka-1-1.pdf` (tentýž díl v křivkách, další záložní formát),
`opasek-desticka-kontrolni-tisk.pdf` (papírová kontrola na A4 před objednáním) a
`opasek-desticka-vysvetlivky.svg` (popisky, **NEposílat řezárně** — má šedou geometrii
a vrstvy `NEREZAT`/`NEGRAVIROVAT`, aby se nedal splést s výrobním souborem; je **zmenšený
na A4, tedy ne 1:1**, takže se z něj nesmí měřit).
PDF jsou gitignorovaná (SVG a DXF ne), generují se tímhle příkazem.

**Destička 215 × 184 mm, čirý litý akrylát 3 mm.** Pro **hrot a konec u přezky zvládne
28–45 mm** (přes příčnou stupnici jakoukoli šířku v tom rozsahu), pro **zaoblený konec jen
30 / 35 / 40 / 45 mm** — oblouk je pro každou šířku jiný, takže mimo tyhle čtyři pro něj na
destičce není slot. Tři řady, každá s vygravírovaným číslem u levé hrany:

- **Řada 1 – HROT.** Vyříznutý tvar anglické špičky (**vrchol je oblouk r = 4 mm, ne ostrý
  hrot** — tak to má i předloha, ze které je odměřený), 5 otvorů pro dírky na trn a dva
  gravírované křížky nad a pod prostřední dírkou.
- **Řada 2 – ZAOBLENÝ KONEC.** Čtyři soustředné sloty (r = 15 / 17,5 / 20 / 22,5 mm), 5 otvorů
  pro dírky a tytéž dva křížky. **Konec každého slotu leží přesně na lince své šířky**, takže se
  linky a oblouky označují navzájem a oblouky nepotřebují čísla. Je to zároveň kontrola: když
  obtahovaný oblouk nekončí přesně na obou hranách pásu, je vzatý špatný slot.
- **Řada 3 – KONEC U PŘEZKY.** Vyříznutý ovál pro trn, 4 otvory pro nýty **v jedné přímce**
  a 2 značky linie ohybu **mimo tuhle přímku**, spojené gravírovanou čárkovanou linkou.
  Všech šest otvorů je stejně velkých, takže na tom rozlišení záleží: do značek ohybu se nic
  neprorazí. Řada se umisťuje **podle levé krátké hrany destičky = konec pásu**.
- **Gravírované vodicí linky pro šířky 30 / 35 / 40 / 45 mm** s čísly — ve všech třech řadách.
- **Příčná milimetrová stupnice** ve všech řadách pro šířky bez linky (čte se odstup hrany od
  střednice, tedy pás 38 mm → obě hrany na 19) a **podélné pravítko 0–145 mm** u horní hrany na
  měření délky pásku na poutko. **Nula pravítka je sama levá hrana destičky**, aby se o ni dal
  měřený pásek opřít.
- **Zkosený levý horní roh** značí, která krátká hrana je konec pásu.
- **Závěsný otvor Ø 4 mm** u pravé dolní hrany, 2 mm pod pásmem nejširšího pásu.

Řady 1 a 2 mají **stejné polohy dírek** a liší se jen tvarem konce — vybereš si, jaký konec chceš.
Obě se umisťují podle prostřední dírky.

Jedna destička stačí na všechny šířky proto, že polohy všech otvorů podél pásu na šířce nezávisí
a koncové body zkosení špičky pro všechny šířky leží na jedné a téže přímce. Zaoblený konec je
naopak polokruh o poloměru `w/2`, tedy pro každou šířku jiný — proto ty čtyři vnořené oblouky.

**Žebra mezi oblouky mají v souboru 1,5 mm, na hotovém díle 1,5 − kerf**, tedy s běžným kerfem
0,2 mm asi 1,3 mm. Je to záměr a stejně to mají komerční destičky, ale je to nejslabší místo
dílu: **destičku nosit naplocho a neupustit.** A je to zároveň cena za volbu 3 mm — silnější
materiál by byl odolnější (4 mm je 2,4× tuhčí), ale do 1mm slotu už se nevejde šídlo
a značicí otvor Ø 2 mm by byl jen poloviční proti tloušťce.

### Jak se používá a co k tomu koupit

Je to samostatný dokument: [`opasek-postup.md`](opasek-postup.md). Patří tam nákupní seznam
(pozor na průbojník Ø 6 mm), metoda měření obvodu, tabulka délek pásu, tloušťka 3,5 mm
a celý postup značení a montáže.

## Varianta na míru jedné šířce

Řezací soubory generuje `pnpm pattern:belt-end --laser`:

```
docs/generated/opasek-sablona-40mm-laser.svg
docs/generated/opasek-sablona-35mm-laser.svg   (pnpm pattern:belt-end --width 35 --laser)
```

Soubor je **1:1 v milimetrech**. Obsahuje tři díly: konec u přezky, konec se špičkou a pásek
na poutko. Je to starší varianta — destička ji nahrazuje a doporučuju ji.

## Text poptávky (pro destičku)

> Dobrý den,
>
> rád bych poptal vyřezání laserem podle přiloženého souboru.
>
> **Příloha je jediná: `opasek-desticka.svg`** — vektor, měřítko **1:1**, **1 jednotka = 1 mm**.
> Kdyby vám SVG nesedělo, mám i **`opasek-desticka-1-1.pdf`** (tentýž díl v křivkách, stránka
> 225 × 194 mm) — napište a pošlu.
> Cokoli s `vysvetlivky` v názvu je jen popisný obrázek pro mě, **nevyrábět**.
>
> **Hotový díl: 215 × 184 mm**, list v souboru má 5 mm rezervu kolem.
> Na obrys prosím toleranci **± 0,5 mm**; na čem mi záleží, jsou **vzájemné rozteče otvorů,
> tam potřebuji ± 0,2 mm**. Absolutní poloha na desce nehraje roli.
>
> **Materiál: litý (GS) čirý akrylát 3 mm.** Litý je tady podmínka, ne preference, a to ze dvou
> důvodů: litý PMMA **gravíruje bíle a neprůhledně**, zatímco extrudovaný gravíruje téměř čiře —
> a celá funkce téhle destičky je čtení gravírovaných linek přes materiál. Druhý důvod je nízké
> vnitřní napětí kvůli 1,5mm žebrům (viz níže). **Čirý**, ne opál ani satén: dívám se přes
> destičku na rysku na kůži. Kdybyste ve 3 mm měli jen extrudovaný nebo jinou barvu, prosím
> **nezahajujte výrobu a napište mi** — jinou tloušťku ani jiný typ nechci, radši počkám.
> Pokud máte volbu, prosím kus z **horní poloviny tolerance** (≥ 3,0 mm); litá tabule má na
> 3 mm běžně ± 10 % a všechny mé rozměry jsou počítané na 3 mm.
>
> **Počet:** prosím nacenit **1 ks i 2 ks** (chtěl bych mít náhradu).
>
> **Rozsah práce**, ať se to dá nacenit: **gravírování 764 tahů / ~4 700 mm**,
> **řez 24 uzavřených kontur / ~1 630 mm**. Gravírování je tedy víc než dvakrát tolik jako řez
> a jsou to hlavně milimetrové rysky, kde hlava nenabere rychlost. Kdyby vám v náhledu vyšlo
> víc řezání než gravírování, budou zaměněné vrstvy.
>
> **Dvě vrstvy:**
>
> - `REZ` (červená #FF0000) = **řez**
> - `GRAVIROVANI` (modrá #0000FF) = **gravírování**
>
> Vrstvy jsou i pojmenované (`inkscape:label`). Gravírování jsou jen vodicí linky, stupnice
> a čísla; **čísla jsou vektorové tahy, ne živý text**, takže není potřeba žádný font.
> V řezu není text ani výplň, žádný `transform` a všechny kontury jsou uzavřené.
>
> **Prosím o tento postup:**
>
> 1. **Pootočit na desce ano, zrcadlit ne.** Gravírování musí být na téže straně a v téže
>    orientaci jako v souboru — díl je chirální (zkosený roh vlevo nahoře je orientační značka
>    a celé rozvržení se od levé hrany referencuje).
> 2. Nejdřív **gravírování**, pak vnitřní geometrie, **obrys až nakonec** — jinak se díl uvolní
>    a tenká žebra i odpadní srpky se pohnou.
> 3. Gravírování **vektorově, jedním průchodem, nízký výkon** — ne rastrem.
> 4. Řez prosím **jedním průchodem**, ne dvěma na nižší výkon: dvojí teplo do 1,5mm žeber
>    a do 2mm otvorů nemá co přinést.
> 5. **Čtyři vnořené oblouky řežte nesousedně** (r22,5 → r15 → r20 → r17,5), ne postupně
>    dovnitř. Dva řezy 1,5 mm od sebe hned po sobě dají obě tepelně ovlivněné zóny do jednoho
>    tenkého žebra; nesousedné pořadí dá každému žebru čas vychladnout.
> 6. **Ofuk zapnutý.** Vím, že bez něj je hrana lesklejší, ale u těch žeber chci plamen dál
>    od materiálu — a leštěnou hranu tu nepotřebuji vůbec.
> 7. **Bez jakéhokoli dokončení a bez temperování.** Nebrousit, neleštit plamenem
>    a hlavně prosím **nežíhat / netemperovat**: žíhání litého PMMA srazí díl o 0,3–0,5 %,
>    což je přes 100mm rozteč otvorů 0,3–0,5 mm — dvojnásobek tolerance, o kterou tu jde.
> 8. **Fólii na gravírované (horní) straně prosím sundejte** — přes fólii vektorově gravírovat
>    nejde. Na spodní straně ji nechte a balte prosím na tvrdou podložku.
>
> **Dvě věci, které bych rád potvrdil, než začnete:**
>
> - **Otvory Ø 2 mm** (je jich 16) ve 3mm materiálu. Vím, že je to pod obvyklým pravidlem
>   „minimální průměr ≈ tloušťka"; potřebuji, aby byly **průchozí a ne výrazně kónické** —
>   prostrkuje se jimi rýsovací šídlo. Prosím potvrďte, že to u vás vyjde.
> - **Váš kerf pro 3mm GS.** Sloty čtyř oblouků mají v souboru nominálně 1,0 mm a rozteč
>   středních poloměrů je konstantní 2,5 mm, takže **slot + žebro = 2,5 mm vždycky**: při řezu
>   na střednici bez kompenzace vyjde slot 1,0 + kerf a žebro 1,5 − kerf. S kerfem 0,2 mm to je
>   slot 1,2 a žebro 1,3 mm, s čím počítám. **Napište mi prosím svůj kerf a pošlu soubor se
>   slotem 1,0 − kerf**, ať na díle vyjde slot 1,0 a žebra 1,5 mm. Rozteče středů otvorů kerf
>   neposune, ty kompenzujte podle své praxe.
>
> **Na co ještě upozorňuji:**
>
> - **Otvory Ø 2 mm** jsou značicí — neslučovat a nezvětšovat.
> - Otvor **Ø 4 mm** u pravé dolní hrany je na zavěšení.
> - **Zkosený levý horní roh** je záměrná značka orientace; ostatní tři rohy jsou **zaoblené R3**
>   (ostrý roh je na 3mm akrylátu iniciátor odštípnutí).
> - **Vyříznutý trojúhelník** a **ovál** jsou funkční výřezy, prosím nevynechávat.
> - Čtyři tenké srpky uvnitř oblouků jsou odpad, ale **roštem nepropadnou** (jsou 47–71 mm
>   dlouhé). Prosím vyjměte je a zkontrolujte, že **všemi čtyřmi oblouky projde drát Ø 0,8 mm**
>   a **všech 16 otvorů Ø 2 mm je průchozích** — fólie ráda přidrží výřezek.
> - Ve gravírování je **kontrolní kóta 50 mm**; podle ní si po vyřezání ověřím měřítko.
>
> **Počet a obsah souboru pro kontrolu:** 16× Ø 2 mm, 1× Ø 4 mm, 4 oblouky, 1 ovál,
> 1 trojúhelníkový výřez, obrys se zkoseným rohem.
>
> Prosím o cenu a termín. Vyzvednu osobně / pošlete na adresu … (doplnit).
>
> Děkuji,
> … (jméno, telefon, e-mail)

**Před odesláním doplň:** jméno, telefon, dodací adresu nebo osobní odběr, požadovaný termín
a jestli jsi fyzická osoba nebo máš IČ. Bez toho se řezárna dvakrát doptá.

## Kam poptávku poslat

Ověřeno **2026-09-11** načtením stránek provozoven. **Ceny žádná z nich neuvádí, dělají se na
dotaz** – poptat radši dvě až tři, u jednorázového malého kusu se liší i násobně.

### Doporučené: prodejci akrylátu, kteří mají vlastní laser

Tohle je klíčové kritérium. Kdo akrylát prodává, ten **má lité (GS) skladem** a nemusí se řešit,
jestli sežene 3mm čirý GS. Kdo jen řeže dodaný materiál, u toho si ho musíš koupit sám.

| Provozovna                                                | Co ověřeno                                                                                                                                                                                                                  | Kontakt                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **ALT s.r.o.**, Praha 9 Letňany, Beranových 130           | Na stránce laseru **výslovně píší „extrudované (XT) nebo lité (GS)"** – jediní, kdo ten rozdíl sám pojmenuje. PMMA až 30 mm, čtyři lasery, gravírování vektorově i rastrem, sklad přířezů, výslovně zvou i kutily.          | <alt@alt.cz>, +420 283 920 766, po–pá 9–17     |
| **plexi.cz** (MK Plexi), Praha 4 Modřany, Mezi Vodami 17a | PMMA až 50 mm, **kusová výroba, termín 1–5 dní**, gravírování vektorově i rastrem. GS/XT rozdíl znají (u backlight desek uvádějí „výhradně lité (GS)"). Data berou z Corelu, AutoCADu, Illustratoru a vektorových programů. | <plexi@plexi.cz>                               |
| **LIFE VORÁČ** (levne-gravirovani.cz), Jedovnice u Brna   | Plexi **do 6 mm na formátu 630 × 350 mm** (naše destička se vejde), na silnější mají velký laser 3 × 2 m. Gravírování ano. Formáty **cdr, dwg, eps**. GS/XT nerozlišují – je potřeba se doptat.                             | <life@life.cz>, +420 603 501 700               |
| **Gravírování Klaban**, Kobylnice 50 u Mladé Boleslavi    | **Výslovně od 1 kusu**, řezání i gravírování, „nejvhodnější jsou vektorová data s jasně vyznačenými řeznými liniemi". Tloušťky ani GS/XT neuvádějí. Menší provoz, řežou i přírodní kůži.                                    | <info@gravirovani-klaban.cz>, +420 604 621 934 |

**Doporučené pořadí:** ALT a plexi.cz oslovit oba (jsou to prodejci akrylátu s laserem, tedy
nejmenší riziko u materiálu), a jako třetí LIFE VORÁČ, když chceš cenu z Moravy.

### Kam to neposílat

- **Automatické online kalkulačky řezání laserem** typu **Grupol** vypadají ideálně (nahraješ DXF,
  cenu vidíš hned), ale jsou to **pálírny plechu**: v nabídce mají ALU, CRS a HRS, tedy hliník
  a ocel. **Plexi neřežou a gravírování nedělají.**
- Obecně: kalkulačka, která chce „pouze tvar výpalku bez textů", umí naceňovat **jen řezané
  kontury**. Naše destička je ze tří čtvrtin gravírování (~4 700 mm proti ~1 630 mm řezu), takže
  by z ní vyšel obrys a 17 děr — a nic z toho, co destičku dělá použitelnou.

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
