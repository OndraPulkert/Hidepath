# Poptávka na vyřezání šablony opasku (text k odeslání)

## Doporučená varianta: jedna plochá destička

`pnpm pattern:belt-end --multi` →
`docs/generated/opasek-desticka.svg` (řezací soubor),
`opasek-desticka.dxf` (totéž jako DXF R12 v milimetrech, oblouky jako `ARC`, dvě vrstvy),
`opasek-desticka-rez.dxf` (jen řez, pro automatické kalkulačky),
`opasek-desticka-plochy.svg` a `opasek-desticka-plochy.dxf` (gravírování jako uzavřené plochy
0,25 mm — **jen pro řezárnu, která gravíruje rastrem a čáry neumí**; šířku lze změnit přes
`--engrave-width`),
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

Krátká verze k odeslání. Technické detaily jsou pod ní — **neposílej je hned**, jsou na doptání.

> **Předmět:** Poptávka – vyřezání laserem, 1 díl z čirého litého akrylátu 3 mm
>
> Dobrý den,
>
> rád bych si nechal vyřezat jeden díl — je to značkovací šablona na kožený opasek, dělám si ji
> pro sebe. Nespěchám.
>
> - **Rozměr:** 215 × 184 mm
> - **Materiál:** **litý (GS) čirý** akrylát **3 mm**. Litý a čirý je tady podmínka: dívám se
>   přes destičku na kůži a gravírování musí být bílé, což extrudovaný neudělá. Kdybyste ve 3 mm
>   měli jen extrudovaný nebo jinou barvu, prosím napište mi, radši počkám.
> - **Počet:** prosím nacenit 1 ks i 2 ks
> - **Data:** v příloze `.dxf`, `.svg` a `.pdf` — tentýž díl, vyberte si, co vám sedne.
>   Vše **1:1 v milimetrech**, prosím neměnit měřítko.
> - **Vrstvy:** červená = řez, modrá = gravírování (gravírování je většina práce)
>
> Tři věci k tomu dílu: prosím **nezrcadlit** (není symetrický), **obrys řezat až nakonec**
> (uvnitř jsou tenká žebra 1,5 mm, která se po uvolnění dílu pohnou) a **žádné dokončení** —
> nebrousit, neleštit plamenem ani nežíhat, rozměry potřebuju přesně podle souboru.
>
> Kdyby vám na tom dílu něco přišlo hraniční — jsou tam otvory Ø 2 mm a ta žebra 1,5 mm —
> napište mi prosím, soubor rád upravím.
>
> Dá se to poslat přepravcem? Adresa … (doplnit). Prosím zabalit naplocho mezi kartony, akrylát
> se snadno odštípne. Prosím o cenu a termín včetně dopravy.
>
> Děkuji,
> … (jméno, telefon, e-mail)

### Technické detaily (na doptání, neposílat hned)

Tohle si nech pro případ, že se doptají, nebo že první dílna odpoví, že si tím není jistá.
Věcně je to všechno pravda, ale v prvním mailu to jen odrazuje — půlka z toho vysvětluje
řezárně její vlastní řemeslo.

| Věc                  | Detail                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tolerance            | obrys ± 0,5 mm stačí; na vzájemných roztečích otvorů potřebuji ± 0,2 mm. Absolutní poloha na desce nehraje roli.                                                                                                                                                                       |
| Rozsah práce         | gravírování ~4 700 mm tahů, řez ~1 630 mm ve 24 uzavřených konturách                                                                                                                                                                                                                   |
| Kerf                 | Sloty čtyř oblouků mají nominálně 1,0 mm a řežou se na střednici, takže vyjdou o kerf širší a žebra o kerf užší (rozteč středních poloměrů je konstantní 2,5 mm, takže slot + žebro = 2,5 mm vždy). Na požádání pošlu verzi se slotem 1,0 − kerf. Rozteče středů otvorů kerf neposune. |
| Otvory Ø 2 mm        | 16 ks ve 3mm materiálu, tedy pod pravidlem „min. průměr ≈ tloušťka". Musí být průchozí a ne výrazně kónické — prostrkuje se jimi šídlo.                                                                                                                                                |
| Fólie                | na gravírované straně sundat (přes fólii vektorově gravírovat nejde), na druhé nechat. Pak zkontrolovat, že všech 16 otvorů a 4 oblouky jsou průchozí — fólie ráda přidrží výřezek.                                                                                                    |
| Pořadí oblouků       | r22,5 → r15 → r20 → r17,5, ne postupně vedle sebe: dva řezy 1,5 mm od sebe hned po sobě dají oba HAZ do jednoho žebra.                                                                                                                                                                 |
| Gravírování          | vektorově, jeden průchod, nízký výkon — ne rastrem. Číslice jsou tahy, ne živý text, takže není potřeba font.                                                                                                                                                                          |
| Řez                  | jeden průchod, ne dva na nižší výkon; ofuk zapnutý (lesklou hranu tu nepotřebuji).                                                                                                                                                                                                     |
| Žíhání               | nežíhat: srazí litý PMMA o 0,3–0,5 %, tedy 0,3–0,5 mm přes 100mm rozteč otvorů.                                                                                                                                                                                                        |
| Tloušťka             | litá tabule má na 3 mm běžně ± 10 %; pokud je volba, kus z horní poloviny tolerance.                                                                                                                                                                                                   |
| Druhý důvod pro litý | nízké vnitřní napětí, tedy menší riziko crazingu u 1,3mm žeber vedle svěží HAZ.                                                                                                                                                                                                        |
| Obsah souboru        | 16× Ø 2 mm, 1× Ø 4 mm (závěsný), 4 oblouky, 1 ovál, 1 trojúhelníkový výřez, obrys se zkoseným levým horním rohem a třemi rohy R3. Zkosení je orientační značka, ne chyba.                                                                                                              |
| Kontrola měřítka     | ve gravírování je kóta 50 mm                                                                                                                                                                                                                                                           |
| Čistota souboru      | v řezu není text ani výplň, žádný `transform`, všechny kontury uzavřené; vrstvy pojmenované i přes `inkscape:label`                                                                                                                                                                    |
| Srpky                | čtyři odpadní srpky uvnitř oblouků jsou 47–71 mm dlouhé, roštem nepropadnou; průchodnost oblouků se dá zkusit drátem Ø 0,8 mm                                                                                                                                                          |

**Před odesláním doplň:** jméno, telefon, dodací adresu nebo osobní odběr, požadovaný termín
a jestli jsi fyzická osoba nebo máš IČ. Bez toho se řezárna dvakrát doptá.

## Kam poptávku poslat

Ověřeno **2026-09-11** načtením stránek provozoven. **Ceny žádná z nich neuvádí, dělají se na
dotaz** – poptat radši dvě až tři, u jednorázového malého kusu se liší i násobně.

### Doporučené: prodejci akrylátu, kteří mají vlastní laser

Tohle je klíčové kritérium. Kdo akrylát prodává, ten **má lité (GS) skladem** a nemusí se řešit,
jestli sežene 3mm čirý GS. Kdo jen řeže dodaný materiál, u toho si ho musíš koupit sám.

| Provozovna                                                | Co ověřeno                                                                                                                                                                                                                                                                                                                                     | Kontakt                                        |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **ALT s.r.o.**, Praha 9 Letňany, Beranových 130           | Na stránce laseru **výslovně píší „extrudované (XT) nebo lité (GS)"** – jediní, kdo ten rozdíl sám pojmenuje. PMMA až 30 mm, čtyři lasery, gravírování vektorově i rastrem, sklad přířezů, výslovně zvou i kutily.                                                                                                                             | <alt@alt.cz>, +420 283 920 766, po–pá 9–17     |
| **plexi.cz** (MK Plexi), Praha 4 Modřany, Mezi Vodami 17a | PMMA až 50 mm, **kusová výroba, termín 1–5 dní**, gravírování vektorově i rastrem. GS/XT rozdíl znají (u backlight desek uvádějí „výhradně lité (GS)"). Data berou z Corelu, AutoCADu, Illustratoru a vektorových programů.                                                                                                                    | <plexi@plexi.cz>                               |
| **LIFE VORÁČ** (levne-gravirovani.cz), Jedovnice u Brna   | Plexi **do 6 mm na formátu 630 × 350 mm** (naše destička se vejde), na silnější mají velký laser 3 × 2 m. Gravírování ano. Formáty **cdr, dwg, eps**. GS/XT nerozlišují – je potřeba se doptat.                                                                                                                                                | <life@life.cz>, +420 603 501 700               |
| **Gravírování Klaban**, Kobylnice 50 u Mladé Boleslavi    | **Výslovně od 1 kusu** a **výslovně posílají**: „Zakázky přijímáme z celé České republiky a hotové výrobky zasíláme prostřednictvím dopravce." Chtějí „vektorová data s jasně vyznačenými řeznými liniemi" a v poptávce materiál, rozměr, počet a termín. Tloušťky ani GS/XT neuvádějí — na to se doptat. Menší provoz, řežou i přírodní kůži. | <info@gravirovani-klaban.cz>, +420 604 621 934 |

**Doporučené pořadí:** ALT a plexi.cz oslovit oba (jsou to prodejci akrylátu s laserem, tedy
nejmenší riziko u materiálu), a jako třetí LIFE VORÁČ, když chceš cenu z Moravy.

**Když nechceš nikam jezdit:** jediný, u koho je zaslání po ČR **ověřené na jejich stránce**, je
**Klaban** (citace v tabulce). U ALT a plexi.cz jsem to nedohledal — na kontaktní stránce ALT
o dopravě nic není. Neznamená to, že neposílají; destička váží asi 130 g a je plochá, takže je to
otázka jednoho řádku v poptávce. Jen s tím počítej, že u prvních dvou je to nezodpovězená otázka,
ne hotová informace.

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
