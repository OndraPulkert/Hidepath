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
40 a 30 mm** — oblouk je pro každou šířku jiný, takže mimo tyhle dvě pro něj na destičce není
slot (řezárna odmítla 1mm sloty pro čtyři šířky, viz `sablony-zdroje.md`, 2026-09-15). Tři řady, každá s vygravírovaným číslem u levé hrany:

- **Řada 1 – HROT.** Vyříznutý tvar anglické špičky (**vrchol je oblouk r = 4 mm, ne ostrý
  hrot** — tak to má i předloha, ze které je odměřený), 5 otvorů pro dírky na trn a dva
  gravírované křížky nad a pod prostřední dírkou.
- **Řada 2 – ZAOBLENÝ KONEC.** Dva soustředné sloty 2 mm (r = 20 a 15 mm, tedy pás 40 a 30 mm),
  žebro mezi nimi 3 mm, 5 otvorů pro dírky a tytéž dva křížky. **Konec každého slotu leží přesně na lince své šířky**, takže se
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
naopak polokruh o poloměru `w/2`, tedy pro každou šířku jiný — proto vnořené oblouky, a jen dva.

**Žebro mezi oblouky má v souboru 3 mm, na hotovém díle 3 − kerf**, tedy s kerfem 0,2 mm
(potvrdila MK Plexi) asi 2,8 mm. Je to nejslabší místo dílu: **destičku nosit naplocho
a neupustit.** Dřívější verze se čtyřmi oblouky měla sloty 1 mm a žebra 1,5 mm; řezárna ji
odmítla (viz `sablony-zdroje.md`, 2026-09-15).

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
> Tři věci k tomu dílu: prosím **nezrcadlit** (není symetrický), **nejdřív gravírovat a obrys
> řezat až úplně nakonec** (uvnitř jsou tenká žebra 3 mm, která se po uvolnění dílu pohnou)
> a **žádné dokončení** — nebrousit, neleštit plamenem ani nežíhat, rozměry potřebuju přesně
> podle souboru.
>
> Kdyby vám na tom dílu něco přišlo hraniční — jsou tam otvory Ø 2 mm a ta žebra 3 mm —
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

| Věc                  | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tolerance            | obrys ± 0,5 mm stačí; na vzájemných roztečích otvorů potřebuji ± 0,2 mm. Absolutní poloha na desce nehraje roli.                                                                                                                                                                                                                                                                                                                       |
| Rozsah práce         | gravírování **4 525 mm** tahů, řez **1 625 mm** ve 24 uzavřených konturách (přeměřeno u verze se 4 oblouky, dnes o něco méně)                                                                                                                                                                                                                                                                                                          |
| Kerf                 | Sloty dvou oblouků mají nominálně 2 mm a řežou se na střednici, takže vyjdou o kerf širší a žebro o kerf užší (rozteč středních poloměrů je 5 mm, takže slot + žebro = 5 mm vždy). Rozteče středů otvorů kerf neposune.                                                                                                                                                                                                                |
| Otvory Ø 2 mm        | 16 ks ve 3mm materiálu, tedy pod pravidlem „min. průměr ≈ tloušťka". Musí být průchozí a ne výrazně kónické — prostrkuje se jimi šídlo.                                                                                                                                                                                                                                                                                                |
| Fólie                | na gravírované straně sundat (přes fólii vektorově gravírovat nejde), na druhé nechat. Pak zkontrolovat, že všech 16 otvorů a 2 oblouky jsou průchozí — fólie ráda přidrží výřezek.                                                                                                                                                                                                                                                    |
| Pořadí oblouků       | u dvou oblouků na pořadí nezáleží (žebro 3 mm). Platilo pro dřívější čtyři oblouky s žebry 1,5 mm.                                                                                                                                                                                                                                                                                                                                     |
| Gravírování          | vektorově, jeden průchod, nízký výkon — ne rastrem. Číslice jsou tahy, ne živý text, takže není potřeba font. **Pro variantu `-plochy` platí opak:** je určená k rastrování a plochy se místy překrývají (rohy číslic, křížení značek), takže je potřeba vyplnit je jako **sjednocení** — nekombinovat do jedné křivky s pravidlem even-odd, jinak zůstanou průnikové plošky nevygravírované, včetně středu křížků u prostřední dírky. |
| Řez                  | jeden průchod, ne dva na nižší výkon; ofuk zapnutý (lesklou hranu tu nepotřebuji).                                                                                                                                                                                                                                                                                                                                                     |
| Žíhání               | nežíhat: srazí litý PMMA o 0,3–0,5 %, tedy 0,3–0,5 mm přes 100mm rozteč otvorů.                                                                                                                                                                                                                                                                                                                                                        |
| Tloušťka             | litá tabule má na 3 mm běžně ± 10 %; pokud je volba, kus z horní poloviny tolerance.                                                                                                                                                                                                                                                                                                                                                   |
| Druhý důvod pro litý | nízké vnitřní napětí, tedy menší riziko crazingu u 1,3mm žeber vedle svěží HAZ.                                                                                                                                                                                                                                                                                                                                                        |
| Obsah souboru        | 16× Ø 2 mm, 1× Ø 4 mm (závěsný), 2 oblouky, 1 ovál, 1 trojúhelníkový výřez, obrys se zkoseným levým horním rohem a třemi rohy R3. Zkosení je orientační značka, ne chyba.                                                                                                                                                                                                                                                              |
| Kontrola měřítka     | ve gravírování je kóta 50 mm                                                                                                                                                                                                                                                                                                                                                                                                           |
| Čistota souboru      | v řezu není text ani výplň, žádný `transform`, všechny kontury uzavřené; vrstvy pojmenované i přes `inkscape:label`                                                                                                                                                                                                                                                                                                                    |
| Srpky                | dva odpadní srpky uvnitř oblouků jsou asi 47 a 63 mm dlouhé (π × r), roštem nepropadnou; průchodnost oblouků se dá zkusit drátem Ø 0,8 mm                                                                                                                                                                                                                                                                                              |

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

### Další ověřené provozovny (2026-09-14)

Rešerše na dotaz, zda existují další výrobci. Ověřeno načtením stránek; u žádné z nich nejsou na
webu tloušťky ani rozlišení lité/extrudované, takže **věta o materiálu v poptávce je u nich
klíčová**. Řazeno podle toho, jak pravděpodobně mají lité (GS) skladem.

| Provozovna              | Kde                                    | Co ověřeno                                                                                                                                                                                                                         | Kontakt                                                   |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **TITAN-Multiplast**    | Smržovka (Liberecko)                   | Zpracovatel plastů se skladem „přes 1 100 tun" – lité GS téměř jistě mají. PMMA 0,5–50 mm, laser 350 W, plocha 2,2 × 3,2 m, „zvlášť malé díly z akrylátu se složitými tvary", gravírování ano. Technický poradce Tomáš Strózewski. | <tomas.strozewski@titan-multiplast.cz>, +420 483 360 901  |
| **R-DESIGN PLAST**      | Ostrožská Nová Ves (Uherskohradišťsko) | Zpracovatel plastů (ohýbání, frézování, laser), „spolupracujeme s klienty po celé ČR". Řezání i gravírování PMMA. Nejbližší **zpracovatel** k Olomouci, ~100 km.                                                                   | <info@r-designplast.cz>, +420 774 84 99 95                |
| **Smart Case Solution** | **Olomouc**, Bořivojova 235/1          | „Přesné laserové řezání všech nekovových materiálů" + gravírování, akrylátové výrobky na fotkách. Podrobnosti odkazují na weby nasijuti.cz a hanackadilna.cz. Lokální – kdyby se něco kazilo, dá se tam dojít.                     | <info@smartcasesolution.com>, +420 724 006 527            |
| **i-reklama**           | **Olomouc**, Brněnská 110/49           | Reklamní dílna, „laser je vhodný k řezání některých plastických hmot a plexiskla" (stojánky, kapsy). Gravírování ano. Reklamní provozy mívají skladem **extrudované** – na lité se doptat výslovně.                                | <ireklama@email.cz>, +420 736 674 245 (Stanislav Pavelka) |
| **Gravoservis**         | Čelákovice (Praha-východ)              | „Rychlá výroba již od jednoho kusu", gravírování i řezání, po celé ČR. Reklamní gravírování – lité na dotaz.                                                                                                                       | <info@gravoservis.cz>, +420 721 777 100                   |

**Kdo má lité (GS) čiré 3 mm jistě skladem (ověřeno 2026-09-14):**

| Provozovna                                                              | Důkaz                                                                                                                                                                                                                                                       | Jistota                                                         |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **TITAN-Multiplast** (e-shop multiplast.cz)                             | Produktová stránka „Plexisklo čiré 3 mm PLEXIGLAS® GS": **Skladem**, 946 Kč/m² s DPH, „Desky je u nás možné obrobit na požadovaný rozměr a tvar" CNC nebo laserem. E-shop pro koncové zákazníky, „1 400 vyřízených zakázek měsíčně", žádný minimální odběr. | **jistá** – jediný, u koho to není potřeba ověřovat dotazem     |
| plexi.cz                                                                | „Plexisklo lité" a „Plexisklo extrudované" jako oddělené položky katalogu, přířezy na míru, laser                                                                                                                                                           | téměř jistá (3 mm konkrétně na stránce není)                    |
| ALT                                                                     | „extrudované (XT) nebo lité (GS)", „sklad přířezů hlavně čirého plexiskla"                                                                                                                                                                                  | pravděpodobná – nerozlišují, co je skladem                      |
| Klaban                                                                  | z odpovědi: „momentálně nemám skladem, ověřím u dodavatele"                                                                                                                                                                                                 | **nemá**                                                        |
| R-DESIGN PLAST, Smart Case Solution, i-reklama, Gravoservis, LIFE VORÁČ | na webu nic o litém                                                                                                                                                                                                                                         | neověřeno – reklamní a textilní provozy mívají spíš extrudované |

Pro naši destičku 225 × 194 mm je to 0,044 m², tedy materiál za **~41 Kč** při ceně TITANu. Cena
zakázky je práce, ne materiál – a u dílny, která lité shání u dodavatele, se k práci přidá čekání.

**Vyřazeno:** PROPERUS Olomouc (jen gravírování, neřeže), GraPro.cz (na webu výslovně „extrudované
plexisklo do 5 mm" – přesně to, co nechceme), Grupol a podobné kalkulačky (plech).

**Doporučení:** neoslovovat všechny. Tři nabídky (ALT, plexi.cz, Klaban) už běží; smysl má přidat
nejvýš dvě: **TITAN-Multiplast** (materiál jistý, velký provoz zvyklý na kusovku) a jednu
olomouckou (**Smart Case Solution**) kvůli blízkosti – kdyby destička přišla s vadou, řeší se to
osobně za odpoledne, ne poštou za týden.

### Kam to neposílat

- **Automatické online kalkulačky řezání laserem** typu **Grupol** vypadají ideálně (nahraješ DXF,
  cenu vidíš hned), ale jsou to **pálírny plechu**: v nabídce mají ALU, CRS a HRS, tedy hliník
  a ocel. **Plexi neřežou a gravírování nedělají.**
- Obecně: kalkulačka, která chce „pouze tvar výpalku bez textů", umí naceňovat **jen řezané
  kontury**. Naše destička je ze tří čtvrtin gravírování (4 525 mm proti 1 625 mm řezu), takže
  by z ní vyšel obrys a 17 děr — a nic z toho, co destičku dělá použitelnou.

## Odpovědi řezáren (stav 2026-09-15)

| Řezárna  | Odpověď                                                                                                                                                                                                                                                       | Stav                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Klaban   | 2 300 Kč (1 ks) / 2 900 Kč (2 ks) s dopravou, GS není skladem, chce gravír jako plochy                                                                                                                                                                        | draží, náhradní                          |
| MK Plexi | kalkulace 180230: **934,44 Kč s DPH** vč. balného a PPL, GS čiré 3 mm; gravír na pohledovou stranu; sloty 1 mm „se spečou“; ostré špičky nevyrobí; laser v opravě                                                                                             | **vybraná**, soubory upraveny (viz níže) |
| ALT      | bez odpovědi                                                                                                                                                                                                                                                  | —                                        |
| TITAN    | nabídka NA26009382 (2026-09-17, Marek Růžička): 1 ks **2 323 Kč s DPH** (1 800 + pošta 120 bez DPH), 2 ks po 1 400 Kč bez DPH; GS 3 mm; navrhují gravír **dvojitou linkou** pro viditelnost (dražší), bez ní „nepatrně“ levnější; delší termín kvůli vytížení | odmítnuto, zakázka už u MK Plexi         |

Úprava souborů podle připomínek MK Plexi je popsaná v `docs/content/sablony-zdroje.md`
(_Šesté kolo_): sloty zaobleného konce 2 mm místo 1 mm (dva oblouky místo čtyř, žebro 3 mm)
a zaoblení vnitřních rohů výřezu špičky R2. Ostatní geometrie beze změny.

### Druhá odpověď MK Plexi (2026-09-15, na dotaz, které špičky)

Screenshot z Corelu: konce slotů zaobleného konce (koncové půlkruhy stočené dovnitř → nulové
špičky), paprsek 0,2 mm, ostré vnitřní rohy zaoblují na 1–1,5 mm, **sloty 2 mm a mezery 3 mm
stačí**. Opraveno (`sablony-zdroje.md`, _Druhá odpověď MK Plexi_), sada přegenerována.

### Odpověď pro MK Plexi (odesláno 2026-09-16 s opravenou sadou)

> Dobrý den, paní Spálenská,
>
> děkuji za screenshot, teď je to jasné. Ty špičky byla chyba v mém souboru: koncové půlkruhy
> slotů byly otočené dovnitř. Opravil jsem to, konce slotů jsou hladké, sloty mají 2 mm a mezery
> mezi nimi 3 mm, oblouky jsou dva místo čtyř. Dva vnitřní rohy výřezu špičky jsem zaoblil na R2.
> Zbytek destičky je beze změny.
>
> V příloze posílám opravenou sadu: `opasek-desticka.dxf` (řez + gravír ve vrstvách REZ
> a GRAVIROVANI), `opasek-desticka.svg` (totéž), `opasek-desticka-rez.dxf` (jen řez)
> a `opasek-desticka-1-1.pdf` (kontrola měřítka, obrys 215 × 184 mm). Prosím řezat podle těchto
> dat, ne podle původních. Gravírování vektorově čárou na pohledovou stranu, díl nezrcadlit,
> řeznou spáru nekompenzovat. Obrys je v souboru uložený jako poslední prvek. Kdybyste gravírování
> raději dělali jako plochy, mám připravenou i tuto variantu a pošlu ji na vyžádání.
>
> Kalkulaci č. 180230 potvrzuji. Pošlete mi prosím podklady k úhradě zálohy, uhradím ji hned.
> Celý příští týden (21.–27. 9.) jsem mimo ČR, proto prosím zásilku PPL odesílat nejdřív
> v pondělí 28. 9.; s termínem po opravě laseru to tedy nijak nespěchá.
>
> S pozdravem
> Ondřej Pulkert

Přílohy: `docs/generated/opasek-desticka.dxf`, `opasek-desticka.svg`, `opasek-desticka-rez.dxf`,
`opasek-desticka-1-1.pdf`. Neposílat: `-plochy.*`, `-vysvetlivky.svg`, `-kontrolni-tisk.pdf`,
náhledy.

### Zakázka zadána (2026-09-16)

MK Plexi potvrdila, že upravená data „jsou použitelná“, poslala zálohovou fakturu (kalkulace
180230, 934,44 Kč s DPH vč. balného a PPL) a zařadila zakázku do výroby s odesláním PPL
**nejpozději v úterý 29. 9. 2026**. Vyráběná sada = stav repa v tagu `vyroba-2026-09-16`
(`docs/generated/opasek-desticka.svg/.dxf`, `-rez.dxf`, `-1-1.pdf`). Od této chvíle se soubory
destičky nemění; případné další úpravy jsou nová verze pro další kus.

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
