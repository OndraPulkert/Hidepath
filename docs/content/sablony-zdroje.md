# Zdroje volných šablon (rešerše 2026-09-10)

Dotaz autora: existují volné šablony na pásek pro budoucí projekt?

Pozor na jednu věc: pásek šablonu v tom smyslu jako pouzdro na karty vlastně nepotřebuje – je to pruh
kůže. Cenu má šablona ve čtyřech věcech: tvar špičky, výpočet délky z obvodu pasu, rozteč a umístění
dírek, a řešení konce u přezky. Podle toho jsou zdroje níže hodnocené.

## Doporučeno: CraftPoint Patterns – Kožený opasek

<https://patterns.craft-point.com/cs/pattern/kozeny-opasek> (ověřeno 2026-09-10)

Parametrický generátor, česky, zdarma. Podle stránky:

- **Parametry:** obvod pasu (měřený od ohybu u přezky k aktuálně používané dírce), šířka
  „35 mm (do společenských kalhot)“ nebo „40 mm (do džínů)“, tvar konce zaoblený nebo anglický hrot.
- **PDF:** 1:1 s „50 mm kalibračním čtvercem“, tisk na A4 na 100 % bez přizpůsobení stránce.
- **Materiál:** „3,0–4,0 mm pás z třísločiněné kůže (hotový z obchodu)“, spotřeba 459 cm²,
  s 20 % prořezem 550 cm².
- **Kování:** jedna přezka 40 mm a dva chicago screws 10/6 mm. **Šití není potřeba.**

Dva důsledky pro nás:

1. Kalibrační čtverec + tisk na 100 % je přesně postup, který používá i naše vlastní šablona. Autor
   tedy bude umět obojí bez nového učení.
2. Chicago screws místo nýtů znamenají, že pásek nepotřebuje ani ruční lis, ani sadu razníků.
   Potvrzuje to poznámku v [notes-vybaveni.md](notes-vybaveni.md), že lis je u pásku volitelný.

Licence: stránka uvádí „Všechny střihy jsou zdarma — a to i pro komerční využití“. To se vztahuje na
výrobu a prodej hotových věcí. **Šíření jejich PDF v naší aplikaci je jiná otázka a bylo by potřeba
ji s nimi vyjasnit** – odkaz na generátor je bezpečnější cesta.

## Další volné zdroje

| Zdroj                                                                                                                                | Cena    | Ověřeno    | Poznámka                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [Vasile and Pavel – Leather Belt Minimalist](https://vasileandpavel.com/products/leather-belt-minimalist-free-pdf-pattern-and-video) | $0.00   | 2026-09-10 | PDF + videotutoriál, tisk A4 i US Letter, označeno „Beginner“. Prochází se přes košík, takže pravděpodobně vyžaduje objednávku/účet. |
| [Weaver Leather Supply – Western Fashion Belt Pattern](https://www.weaverleathersupply.com/products/western-fashion-belt-pattern)    | $0.00   | 2026-09-10 | Zdarma, s videem. Šířky ani formát papíru stránka neuvádí. Western styl, dámský.                                                     |
| DG Saddlery – belt taper pattern                                                                                                     | zdarma? | neověřeno  | Podle výsledků hledání zdarma, ale stránka vrátila HTTP 429 a nepodařilo se ji přečíst.                                              |

## Placené, jen pro srovnání

[Buckleguy – Belt Leather Pattern](https://www.buckleguy.com/belt-leather-pattern-pdf-template/), 6 USD:
šířky 1¼" a 1½", obsahuje instrukce k tisku, montážní schéma a výkroje. Označeno jako „intermediate“.
Nekupovat, dokud CraftPoint stačí.

## Kde pásek není

- [Makesupply – Free Leather Templates](https://projects.makesupply.co/templates/free-leather-templates/):
  bez registrace, ale žádné pásky ani popruhy (peněženky, pouzdra, obaly na zápisníky).
- [Maker's Leather Supply – Free Patterns](https://makersleathersupply.com/collections/free-patterns):
  19 šablon za $0.00, ale žádný pásek.

## Ostatní volné šablony CraftPoint (pro pozdější projekty)

Generátor má 45 šablon zdarma v osmi kategoriích, z toho 8 v „Opasky a popruhy“. Slugy zjištěné
2026-09-10 pod `patterns.craft-point.com/cs/pattern/`: `kozeny-opasek`, `kozene-voditko`,
`obojek-pro-male-psy`, `obojek-pro-velke-psy`, `reminek-na-hodinky`, `poutko-na-ruku`,
`penezenka-bifold`, `slim-penezenka-bifold`, `slim-pouzdro-na-karty`, `pouzdro-na-nuz`,
`obal-na-zapisnik-a5`, `vizitkar` a další.

## Co pásek navíc potřebuje proti pouzdru na karty (ověřeno 2026-09-10)

Dotaz autora: budou k pásku potřeba speciální nástroje a jak náročný projekt to bude? Vychází se
z varianty podle šablony CraftPoint, tedy hotový pás z obchodu + přezka + dva šroubovací nýty,
**bez šití**.

### Nutné navíc

| Věc                                      | Kde a kolik                                                                                                              | Poznámka                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Kruhové průbojníky **4,5 mm a 6 mm**     | CraftPoint jednotlivé 2–20 mm **od 29 Kč/ks**; sada 7 ks (2–5 mm) 396 Kč; revolverový děrovač 2–4,5 mm 510 Kč            | Průměry určuje šablona: 4,5 mm dírky pro trn, 6 mm otvory pro šroubovací nýty. Revolverový děrovač 2–4,5 mm tedy 6 mm nepokryje. |
| Otvor pro trn přezky (podélný průřez)    | CraftPoint podélný otvor 16/20 mm **od 1 083 Kč**                                                                        | **Nekupovat.** Standardní levné řešení: vyrazit kruhovým průbojníkem oba konce otvoru a spojit je nožem.                         |
| Hotový pás z přírodní kůže               | CraftPoint „Řemen z přírodní kůže 3,0–3,5 mm, 140 cm, 15–80 mm“ **184 Kč** (2–2,5 mm 155 Kč, 4,5–5 mm 120–130 cm 241 Kč) | Šablona žádá 3,0–4,0 mm. Tím padá potřeba dlouhého řezu z celé kůže.                                                             |
| Opasková přezka 40 mm                    | CraftPoint nerez kartáčovaná **241 Kč** skladem, mosazná 252 Kč skladem                                                  | Gun metal 167 Kč byl při ověření vyprodaný.                                                                                      |
| Šroubovací nýty (chicago screws) 10/6 mm | CraftPoint **od 8 Kč/ks**, potřeba 2 ks                                                                                  | Utáhnou se šroubovákem, žádný lis ani razníky.                                                                                   |

Hrubý součet nového nákupu: **cca 470–520 Kč.**

### Co už máme a využije se jinak

- **Odlamovací nůž:** na 3–4 mm kůži je potřeba víc tahů než na 1,8 mm. Zvládne to, ale je to nejtěžší část, pokud se řeže z celé kůže.
- **Ořezávač hran a pasta s leštítkem:** u pásku výrazně důležitější než u pouzdra. Hrana měří kolem 2,4 m místo 30 cm a je 4 mm vysoká. Tady se ořezávač hran vyplatí z „Kup později“ posunout.
- **Vidličky, jehly, nit, palička, sedlářský koník:** u varianty se šroubovacími nýty **vůbec nejsou potřeba**.

### Volitelné, ne nutné

- **Řezačka řemenů (strap cutter)** – to je ten nástroj z videí. Sedlářské nářadí: Craftplus 790 Kč skladem (rozsah 0,5–5 cm), celokovová profi 1 990 Kč (rozsah 1–6 cm, není skladem; bere 18 mm odlamovací čepele). **Má smysl jen když se řeže pás z celé kůže.** S hotovým pásem z obchodu je zbytečná.
- **Průbojník na konec pásku:** zaoblení 15–45 mm 396 Kč, šipkový/anglický hrot 35/40 mm od 510 Kč. Špičku jde vyříznout nožem podle šablony.

### Náročnost

Technicky **jednodušší než pouzdro na karty**, protože se šroubovacími nýty se vůbec nešije, a šití
je v naší cestě ta nejnáročnější dovednost. Náročnější je ve třech věcech:

1. **Jeden dlouhý naprosto rovný řez** (~120 cm) ve 3–4 mm kůži. Každé zaváhání je vidět po celé délce. Hotový pás z obchodu tenhle problém úplně odstraní – proto ho šablona doporučuje.
2. **Umístění dírek.** Musí být v ose a rovnoměrné, průřez pro trn přesně na středové ose, jinak pásek sedí nakřivo.
3. **Množství hran.** Asi 2,4 m hrany vysoké 4 mm. Není to obtížné, jen dlouhé; tady spolkne projekt většinu času.

Souhrn: **nižší nároky na dovednost, vyšší na trpělivost.** Dobrý druhý projekt. Časový odhad je můj,
neověřený: s hotovým pásem odpadne řezání a zbyde špička, dírky a hrany.

Varianta pro toho, kdo chce využít steh z pouzdra: konec u přezky se dá místo nýtů prošít. Pak jsou
potřeba vidličky a jehly, ale děruje se přes dvě vrstvy 4 mm kůže, což je výrazně tvrdší práce než
u pouzdra. Do prvního pásku bych to nedával.

### Hotové pásy na opasek – ověřená dostupnost 2026-09-10

Ano, hotový nařezaný pás je běžné zboží a je to doporučená cesta: dvě dlouhé hrany přijdou už rovně
nařezané, takže padá ta nejtěžší část projektu.

**Metodická poznámka (důležitá pro každé další ověřování CraftPointu).** Čtení produktových stránek
CraftPointu přes automatický fetch hlásí u všech variant „Varianta je vyprodaná nebo nedostupná“,
i když jsou skladem – načte se stav přepínače variant před výběrem, ne skutečná dostupnost. Kvůli
tomu tento dokument nejdřív tvrdil, že CraftPoint má pásy i kůži vyprodané. **Neplatí to.**

Spolehlivý způsob: k jakékoli jejich URL přidat `.js` a přečíst JSON s variantami, např.

```
curl -sL https://craft-point.cz/products/<slug>.js
```

JSON má u každé varianty `available` a `price` (v haléřích). Tím se zároveň zjistí, že **cena se
u pásů liší podle šířky**, což HTML stránka neuvádí.

Skutečný stav u „Řemen z přírodní kůže 3–3,5 mm, 140 cm“ (ověřeno 2026-09-10, všechny šířky skladem):
15/19/20 mm 184 Kč, 24/25 mm 207 Kč, 28/30 mm 230 Kč, 33/35 mm 258 Kč, **38/40 mm 287 Kč**,
45 mm 315 Kč, 50 mm 338 Kč. Pro 4cm pásek je tedy relevantní cena **287 Kč**, ne 184 Kč.

| Produkt                                                                                                                                 | Síla             | Délka              | Šířky      | Cena                                  | Stav                                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------ | ---------- | ------------------------------------- | ------------------------------------------------- |
| [Sedlářské nářadí – Kožený řemen 130](https://sedlarskenaradi.cz/kozeny-remen-130-sila-3-8-4mm/)                                        | 3,8–4 mm         | 130 cm             | 2,0–6,0 cm | **122 Kč**                            | Skladem 130 × 2,0 cm; ostatní rozměry 2–3 týdny.  |
| [CraftPoint – Řemen z přírodní kůže, šířka 40 mm](https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm)           | 3,0–3,5 mm       | 140 cm             | 15–80 mm   | **287 Kč** (40 mm)                    | **Skladem** všechny šířky. Třísločiněná, italská. |
| [Křupson – Hovězí kůže na opasek, přírodní 4 cm](https://www.krupson.cz/hovezi-kuze-na-opasek-prirodni--4-cm-delka--130-cm/)            | 3,5–4 mm         | 130 / 150 / 180 cm | 4 cm       | **299 / 329 / 379 Kč**                | **Skladem všechny délky.**                        |
| [Imago – Hovězí kůže na opasek, přírodní 4 cm](https://www.imago.cz/kuze-na-opasek-prirodni-4cm)                                        | 3,5–4 mm         | neuvedena          | 4 cm       | **299 Kč**                            | Skladem. Způsob činění stránka neuvádí.           |
| [skladkuzetvurce.cz – Kožené pásy na výrobu opasků](https://www.skladkuzetvurce.cz/kuzetvorba/Kozene-pasy-na-vyrobu-opasku-c1_22_3.htm) | 2,5 / 3,5 / 4 mm | neuvedena          | na dotaz   | ceny se ze stránky nepodařilo přečíst | Nekatalogové šířky řežou na telefonickou žádost.  |

Doporučení: **CraftPoint 40 mm za 287 Kč** (výslovně třísločiněná, skladem) nebo **Křupson 130 cm za
299 Kč**. **Sedlářské nářadí za 122 Kč** je výrazně nejlevnější, ale na šířku 4 cm uvádí dodací dobu
2–3 týdny „z důvodu nepravidelných dodávek kvalitních kůží“.

Na co si dát pozor při výběru:

- **Síla 3,0–4,0 mm** podle šablony. Všechny tři varianty výše sedí.
- **Délka** musí být aspoň taková, jakou spočítá generátor z obvodu pasu (obvod plus ohyb u přezky
  a konec za dírkami). 130 cm pokryje většinu pasů, při nejistotě 150 cm.
- **Činění.** Třísločiněná (veg-tan) kůže se dá barvit a hrany se dají leštit. Imago činění neuvádí,
  což je u pásku na leštění hran podstatné – doptat se. Sedlářské nářadí uvádí krupon, CraftPoint
  výslovně třísločiněné.
- Hotový pás **neznamená hotové hrany.** Hrany se pořád srazí a zaleští, jen se nemusí řezat.

### Přezky na 4cm pásek – ověřeno 2026-09-10

Pravidlo: údaj „40 mm“ u přezky je **vnitřní světlost**, tedy šířka pásu, který do ní projde. Na 4cm
pásek se kupuje přezka 40 mm. Šablona CraftPoint žádá jednu přezku 40 mm a dva šroubovací nýty.

Typy, které se na pásek prodávají:

- **Trnová (single prong)** – jeden trn, prochází jednou dírkou. Standard a to, s čím počítá šablona.
- **Rolnová (roller)** – na příčce je otočná rolna, pás po ní lépe klouže a méně se odírá. Jinak stejné použití.
- **Dvoutrnová (double prong)** – dva trny, potřebuje dvě dírky vedle sebe. Western/workwear vzhled a o jedno děrování na každou pozici víc.

| Přezka                                                                                                          | Typ                | Cena             | Stav          |
| --------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------- | ------------- |
| [andexnite – Opasková přezka 40 mm, staromosaz](https://andexnite.cz/produkt/opaskova-prezka-40-mm-staromosaz/) | trnová             | **95 Kč**        | 53 ks skladem |
| [Leatory](https://www.leatory.cz/opaskove-prezky/) #32 / #34, staromosaz                                        | trnová             | **134,40 Kč**    | 18 / 4 ks     |
| Leatory #28 staromosaz / nikl přes mosaz                                                                        | trnová             | 149,80–154,20 Kč | 9 / 20 ks     |
| Leatory #40 staromosaz / nikl / stříbro                                                                         | trnová             | 191,60–301,80 Kč | 9–13 ks       |
| Leatory #2434, staromosaz / staronikl                                                                           | rolnová            | 162,90–173,90 Kč | 9 / 10 ks     |
| Leatory #910R, staromosaz                                                                                       | dvoutrnová + rolna | 189,40 Kč        | 6 ks          |
| CraftPoint, nerez kartáčovaná / mosazná                                                                         | trnová             | 241 / 252 Kč     | skladem       |
| CraftPoint, kartáčovaný gun metal                                                                               | trnová             | 167 Kč           | vyprodáno     |

Doporučení: trnová 40 mm, nejlevnější ověřená je andexnite za 95 Kč. Leatory má největší výběr
modelů a stavů skladem. Rolnová verze je pohodlnější, ale u prvního pásku to není rozdíl, který by se
za příplatek poznal. Dvoutrnovou nebrat – zdvojnásobuje děrování.

Co v seznamu materiálu šablony **není**: **poutko** (keeper), tedy oko, které drží volný konec pásu.
Dá se vyříznout z odřezku kůže a slepit nebo prošít do kroužku, nebo se vynechá. Zohlednit, až se
bude psát obsah projektu.

## Peněženka – kolik kůže a jaká (ověřeno 2026-09-10)

Generátor CraftPoint má dvě varianty a u obou spočítá plochu:

| Šablona                                                                                    | Plocha dílů | S 20 % prořezem | Generátor doporučuje | Rozměr po složení            |
| ------------------------------------------------------------------------------------------ | ----------- | --------------- | -------------------- | ---------------------------- |
| [Peněženka bifold](https://patterns.craft-point.com/cs/pattern/penezenka-bifold)           | 605 cm²     | **726 cm²**     | „2 × A4“             | 9,6 × 9,4 cm                 |
| [Slim peněženka bifold](https://patterns.craft-point.com/cs/pattern/slim-penezenka-bifold) | 472 cm²     | **566 cm²**     | „1 × A4“             | 9,6 × 9,0 cm, karty do 89 mm |

Parametry u obou: poloviční šířka, výška, počet kapes na karty (u bifoldu 2–4 kaskádovitě, každá
další přidá 16 mm) a rozteč stehu (3,0 mm diamant, 3,38 mm francouzská, 4,0 mm diamant, 1 mm kulatá
po 4 mm). Kování žádné, **šije se** – délka švu 0,4 m, potřeba asi 2 m nitě, tedy jedna cívka 20 m
vystačí. To je ta samá nit, kterou kupujeme na pouzdro.

**Tloušťka: „třísločiněná kůže 1.2 mm (vnější i vnitřní část)“.** To je spodní hranice našeho
katalogového rozsahu 1,2–1,5 mm, takže je to **stejná kůže jako na pouzdro**, jen víc.

Kolik kupovat: A4 je 623,7 cm², A3 je 1 247 cm². Slim se do A4 teoreticky vejde (566 cm²), ale
zbývá 10 % rezervy – při první peněžence to nestačí na to, aby se dal jeden díl přeříznout znovu.
**Na obě varianty kupovat A3.**

Ověřená dostupnost 1,2 mm třísločiněné lícové kůže u CraftPointu (přes `.js`, 2026-09-10):

| Kůže                                                                                                      | A4     | A3         | A2       |
| --------------------------------------------------------------------------------------------------------- | ------ | ---------- | -------- |
| [Juchtová (nejlevnější)](https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm) | 184 Kč | **367 Kč** | 734 Kč   |
| [Karamelová](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-1-2-mm-karamelova)           | 252 Kč | **504 Kč** | 1 008 Kč |
| [Whisky](https://craft-point.cz/products/hovezi-licova-kuze-trislocinena-1-2-mm-whisky)                   | 252 Kč | 504 Kč     | 1 008 Kč |
| [T. moro](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro)                  | 252 Kč | 504 Kč     | –        |

Vše skladem kromě A5 u varianty Whisky. Další odstíny ve stejné tloušťce: giallo, blu, verde, rosso.

**Pozn. k opravě katalogu:** položka `veg-tan-leather` má u příkladu „Whisky“ zapsáno
`availability: 'unavailable'` s datem 2026-09-07 na základě špatného čtení stránky. A4, A3 i A2 jsou
skladem – při další revizi obsahu opravit a přidat juchtovou jako levnější příklad.

## Jak se u pásku měří délka (ověřeno 2026-09-10)

Dotaz autora podle dvou obrázků z videa (tabulka velikostí a schéma s kótami): co znamená „distance
to the middle hole“ a „total length of ordered belt“ a jak se to měří.

### Co obrázky říkají

Schéma kótuje pásek od **vnějšího konce přezky**:

- **Distance to the middle hole** – od konce přezky k **prostřední** dírce. To je to číslo, které se
  na daném webu vybírá jako velikost pásku; v tabulce se „size of your belt“ a „distance to the
  middle hole“ rovnají (36 → 36″/92 cm).
- **Total length of ordered belt** – celková délka hotového pásku od konce přezky po špičku.
- **10 cm / 4″** – konec pásu za poslední dírkou.
- **Removable loop** – poutko, které se dá vyjmout.

V tabulce je rozdíl mezi oběma sloupci u všech deseti řádků **konstantní: 18 cm** (7″). Je to konec
za prostřední dírkou: zbývající dírky plus těch 10 cm špičky.

Instrukce na obrázku jsou to podstatné: **neodhaduj z velikosti kalhot.** Vezmi pásek, který nosíš,
a změř ho od přezky k dírce, kterou skutečně používáš.

### Proč zrovna prostřední dírka

Aby se dalo utáhnout i povolit. Při rozteči 25 mm dávají dvě dírky na každou stranu rozsah asi
±5 cm, což pokryje změnu hmotnosti i rozdíl mezi tenkými a silnými kalhotami. Kdyby padla vaše míra
na první dírku, pásek se dá jen povolovat.

### Jak to řeší generátor CraftPoint

Stejným způsobem, jen s jiným počátečním bodem. Podle stránky generátoru:

- Vstup je **„Obvod pasu (cm) – Změř stávající opasek od ohybu u přezky po dírku, kterou používáš“**.
  Tedy tatáž metoda jako ve videu, ale od **ohybu** kůže kolem příčky přezky, ne od vnějšího konce
  přezky. Jsou to dva různé body vzdálené o délku přezky, takže se čísla mezi oběma systémy
  nedají zaměňovat.
- Šablona pak „spočítá celkovou délku podle tvého obvodu pasu, **rozvrhne 5 dírek** a označí ohyb pro
  přezku i otvor pro trn“. Prostřední z pěti dírek odpovídá zadané míře – tedy stejný princip jako
  „middle hole“ ve videu.
- Kontrolní příklad z výchozího nastavení: pro **obvod 95 cm** vyjde díl **1 174,3 × 40 mm** a
  „hotový rozměr 118 cm × 40 mm (obvod 95 cm na prostřední dírce)“. Celková délka je tedy asi
  o 23 cm větší než zadaná míra; rozdíl proti 18 cm z videa jde na účet jiného počátečního bodu
  a jiného rozvržení dírek.

### Další čísla, která generátor uvádí

- Průměry otvorů: **4,5 mm** dírky pro trn, **6 mm** otvory pro šroubovací nýty. Drážka pro trn se
  **vyřezává**, na ni průbojník potřeba není.
- Postup: přenést značky → vysekat otvory a vyříznout drážku → seříznout a uhladit hrany
  (hranořízek, Tokonole, hladítko) → ohnout konec kolem přezky a zajistit šroubovacími nýty.
- Náročnost ●○○ „vhodné pro začátečníky“, doba práce **1,5–3 h**. To je nezávislé potvrzení odhadu
  výše, že pásek je jednodušší než pouzdro.
- Šití: „Tento projekt nevyžaduje šití.“

### Když žádný pásek k měření nemám

Generátor i tabulka z videa předpokládají, že je co změřit. Bez referenčního pásku:

**Metoda 1 – krejčovský metr provlečený poutky.** Obleč si kalhoty, ve kterých budeš pásek nosit
(a zastrč košili, pokud ji tak nosíš), provleč metr nebo provázek poutky a utáhni na sílu, jakou
bys chtěl mít pásek. Naměřený obvod je **přímo to číslo, které generátor chce**. Vychází to
geometricky: zapnutý pásek tvoří smyčku od ohybu u přezky kolem těla zpět k dírce, do které padá
trn, a trn je uchycený na příčce v ohybu. Metr vede skoro tou samou cestou; rozdíl dělá jen tloušťka
kůže, tedy pár milimetrů proti rozteči dírek 25 mm.

**Metoda 2 – změřit pas kalhot naplocho.** Horší, ale poslouží jako kontrola prvního čísla. Poutka
leží o kousek dál od těla a nezohledňuje se zastrčená košile.

Retailové pravidlo „velikost kalhot + 2 palce“ existuje, ale je to jen hrubý odhad pro objednání
hotového pásku. Na vlastní výrobu ho nepoužívat.

**A hlavně: dírky děrovat naposledy.** Pás z obchodu má 130 cm, tedy rezervu. Postup, který
odstraňuje riziko špatné míry úplně:

1. Přenést ze šablony ohyb a otvory pro nýty, ohnout konec kolem přezky a sešroubovat nýty.
2. Pásek si vzít na sebe, provléknout poutky a utáhnout na pohodlí.
3. Označit, kam padá trn – **to je prostřední dírka**.
4. Zkontrolovat, že značka odpovídá tomu, co šablona vykreslila. Pokud ne, věřit tělu, ne číslu.
5. Vysekat 4,5mm dírky, po dvou na každou stranu s roztečí 25 mm.
6. Až teď odříznout konec asi 10 cm za poslední dírkou a vyříznout špičku podle šablony.

Cena za tuhle jistotu je jen to, že se špička řeže na konci místo na začátku. Až se bude psát obsah
projektu pásek, tohle pořadí kroků do něj patří.

### Tvarování konců pásku

Pásek má dva konce a jen jeden z nich se tvaruje.

**Špička (volný konec).** Generátor nabízí dvě varianty:

- **Anglická špička** – dva rovné řezy podél pravítka, které se sbíhají do hrotu na středové ose.
  Pravítko odvede práci, jen hrot musí být přesně na ose. Na první pásek jednodušší varianta.
- **Zaoblená** – u 40mm pásku je to radius kolem 20 mm. Technika je stejná jako u rohů a výřezu na
  palec v lekci 5: **krátké tečnové řezy a pak dohladit smirkem** omotaným kolem tužky nebo hranolku.
  Jeden dlouhý oblouk jedním tahem se nedaří, nůž uhne a hrana má schody.

Rozdíl proti pouzdru je tloušťka: 3–4 mm místo 1,8 mm, tedy počítat se třemi až čtyřmi lehkými tahy
místo dvou. Čepel držet kolmo, netlačit. Obrys kreslit na rub, aby na líci nezůstala rýha (pravidlo
z lekce 5).

**Konec u přezky se netvaruje.** Zůstává rovný, jen se v něm vyseknou 6mm otvory pro nýty, vyřízne
drážka pro trn a konec se ohne v označeném místě. Drážku nejjednodušeji tak, že se vyseknou 4,5mm
otvory na obou koncích drážky a spojí se nožem.

**Co k tomu není potřeba nový nástroj.** Generátor v seznamu nářadí uvádí jen odlamovací nůž 18 mm,
řezací podložku a řezací pravítko; hranořízek, Tokonole, hladítko a špachtli označuje jako volitelné.
Existují průbojníky na jeden úder – zaoblení konce 15–45 mm 396 Kč, anglický hrot 35/40 mm od 510 Kč
(CraftPoint) – ale jsou to komfortní nástroje, ne nutnost.

**Otevřená otázka: ohyb u přezky.** Postup v generátoru říká jen „Ohni konec kolem přezky v místě
ohybu a zajisti šroubovacími nýty“, nic o navlhčení. Jestli ohyb 3–4 mm kůže nasucho poznamená líc,
je potřeba **vyzkoušet na odřezku pásu**, než se ohne skutečný pásek. Do obsahu projektu to nepsat,
dokud to nebude ověřené.

**Ztenčení (skiving) v místě ohybu** viz samostatnou sekci níže – souvisí s poutkem a dřívější
tvrzení „bez poutka to nikde nevadí“ je potřeba upřesnit.

**Pořadí:** špička se řeže až po zkoušce na těle a po vysekání dírek (viz sekci výše).

### Zkosení (skiving) u přezky a poutko – ověřeno 2026-09-10

Dotaz autora: ve videích konce pásku „nějak orezávají“ a dávají tam poutko. Jde o **zkosení
(skiving)** – ztenčení kůže v místě ohybu. Termín potvrzuje slovník CraftPointu, který u round knife
uvádí, že umožňuje „dlouhé, rovné řezy, složité křivky a také **zkosení (skiving)** kůže“.

**Proč se to dělá.** Ohnutý konec ze 3–4 mm kůže má ve dvou vrstvách 6–8 mm. To je tuhý hrbol hned
za přezkou: netiskne se k tělu, pásek v poutkách kalhot nesedí rovně a je to nejvíc vidět. Ztenčená
kůže se navíc ochotněji ohne – vnější vlákna v ohybu jsou v tahu.

**Souvislost s poutkem, kterou autor správně vytušil.** Poutko se navléká přes **zdvojenou** část,
ale volný konec pásku, který jím pak prochází, má jen jednu vrstvu. Bez zkosení musí být poutko
dimenzované na 8 mm a volný konec v něm potom chrastí. Se zkosením vyjde jedna velikost poutka
těsná na obojí. **Tím se upřesňuje dřívější poznámka v tomto dokumentu, že bez poutka zkosení
nevadí: s poutkem vadí.** (Tohle je úvaha z geometrie, ne citace návodu – vyzkoušet na odřezku.)

**Poutko v šabloně CraftPoint není.** Ověřeno v seznamu kování generátoru: „40mm opasková přezka
× 1“ a „Šroubovací nýty (Chicago šrouby) × 2“, nic víc. Kdo poutko chce, dělá si ho sám:

- Z tenčího pruhu kůže než je pásek – ideálně **z odřezku 1,2 mm kůže z pouzdra na karty**.
- Slepit nebo prošít do kroužku, spoj na spodní straně.
- Navléknout **před** ohnutím konce, aby zůstalo mezi přezkou a nýty a nesklouzlo. Schéma z videa ho
  označuje jako „removable loop“, tedy varianta, kdy se dá vyjmout.
- Obvod měřit kolem **zdvojené** části, ne kolem volného konce.

**Nástroje na zkosení (ověřeno přes `.js` 2026-09-10):**

| Nástroj                                                                                                           | Cena           | Stav                  |
| ----------------------------------------------------------------------------------------------------------------- | -------------- | --------------------- |
| [French skiver ze santalového dřeva 6 mm](https://craft-point.cz/products/french-skiver-ze-santaloveho-dreva-6mm) | 567 Kč         | **skladem**           |
| [French skiver CraftPoint 10 mm](https://craft-point.cz/products/french-skiver-craftpoint-10mm)                   | 911 Kč         | nedostupné            |
| Sedlářský půlměsíc                                                                                                | 1 350–2 727 Kč | viz notes-vybaveni.md |

Doporučení pro první pásek: **zkosení vynechat** a poutko udělat z tenkého odřezku dimenzované na
zdvojenou část. Když bude hrbol vadit, je zkosení ta oprava a French skiver za 567 Kč nejlevnější
cesta – ale je to nástroj, který se musí brousit a natrénovat, stejně jako půlměsíc.

### Zkosení: jak daleko a jak hluboko – NEOVĚŘENO

Dotaz autora. Hledal jsem 2026-09-10 zdroj s konkrétními čísly (generátor CraftPoint, jejich slovník
včetně článků `co-je-kozeny-pasek` a `prezka-na-pasek-co-to-je`, web search byl nedostupný).
**Žádný z nich hloubku zkosení ani délku ohybu neuvádí.** Do obsahu tedy žádné číslo nepsat.

Co se z geometrie a ze šablony odvodit dá:

- **Jak daleko:** není to volba, je to na vytištěné šabloně. Generátor „označí ohyb pro přezku“,
  takže zóna k zkosení je **od linie ohybu ke konci pásu** – ta část, která se přehne a lehne na
  hlavní pás. Za linii ohybu se nezkosuje, tam pásek zůstává jednovrstvý a viditelný.
- **Jak hluboko – pouze aritmetika, ne ověřený postup:** cíl je, aby zdvojené místo nebylo výrazně
  tlustší než zbytek pásku. Při pásu 4 mm to znamená ztenčit přehnutý konec někam k 1–1,5 mm.
  **Vyzkoušet na odřezku pásu**, přehnout ho kolem přezky a změřit, než se sáhne na skutečný pásek.
- **Proč to na první pásek nedělat:** ohyb u přezky je nejvíc zatížené místo celého pásku – táhne
  přes něj celá síla a drží ho jen dva nýty. Zkosení tam ubírá průřez a je nevratné. Experimentovat
  s tím na díle, který se nedá vyměnit, je špatný nápad.

Až to autor vyzkouší na odřezku, doplnit sem naměřenou hodnotu jako ověřenou.

### Nezávislé potvrzení parametrů pásku

Článek [co-je-kozeny-pasek](https://craft-point.cz/blogs/slovnik/co-je-kozeny-pasek) (CraftPoint,
ověřeno 2026-09-10) uvádí nezávisle na generátoru:

- **„pět dírek v odstupech 25 mm“** – shodné s generátorem i se schématem z videa.
- Tloušťky: **3,5–4 mm** klasický pásek do džínů, **2,5–3 mm** společenský, **minimálně 4 mm**
  pracovní.
- Šířky: **38 nebo 40 mm** do džínů, **30 nebo 32 mm** společenský, **45 mm** pracovní.
- Vnitřní šířka přezky musí odpovídat šířce pásku.
- Rozteč ozdobného stehu u společenského pásku 3 nebo 4 mm.

Volba 40 mm / 3,0–4,0 mm / 5 dírek po 25 mm v generátoru tedy odpovídá běžné praxi.

## Analýza BFLG-Belt-Hole-Template.pdf (Black Flag Leather Goods)

Soubor `docs/BFLG-Belt-Hole-Template.pdf` – **v repu není verzovaný** (`*.pdf` je v `.gitignore`,
protože je to cizí šablona s logem výrobce a repozitář je public; verzujeme jen odměřenou geometrii
níže). 2 strany, Letter (612 × 792 pt), Inkscape 1.4.2,
vytvořeno 2025-10-12. Strana 1 je titulní s logem a QR kódem na videonávod na YouTube (návod jsem
neviděl). Strana 2 je samotná šablona.

**Co to je:** šablona **jen konce u přezky** – ve třech šířkách 1½″, 1¼″ a 1″. Není v ní špička ani
rozvržení dírek pro trn. Poznámka na listu: „Hole size may vary, depending on your buckle.“

**Geometrie odměřená z PDF** (render 300 dpi, měřeno na střednici; **y-rozvržení je u všech tří
šířek totožné**):

| Prvek                     | Poloha / rozměr                                                  |
| ------------------------- | ---------------------------------------------------------------- |
| Šířky pásu                | 37,7 / 31,3 / 25,0 mm ≈ **1½″ (38,1) / 1¼″ (31,75) / 1″ (25,4)** |
| **Linie ohybu**           | **střed drážky pro trn**                                         |
| Drážka pro trn            | **25,0 mm dlouhá × 5,7 mm široká**, na střednici                 |
| První pár otvorů pro nýty | **± 25,5 mm od ohybu** (≈ 1″)                                    |
| Druhý pár otvorů pro nýty | **± 73,2 mm od ohybu**                                           |
| Průměr otvorů             | **≈ 5,7 mm** (tedy 6mm průbojník)                                |
| Zaoblený konec pásu       | **90,1 mm od ohybu** → **délka přehnutého konce je 90 mm**       |
| Zubatý okraj dole         | jen značka, že list končí, není to tvar k vyříznutí              |

Oba páry otvorů jsou k ohybu **přesně symetrické** (25,55 / 25,55 a 73,24 / 73,22 mm), takže po
přehnutí na sebe sednou a projde jimi jeden nýt. Drážka je „stadion“ 25 × 5,7 mm, tedy přesně to,
co vznikne **dvěma 6mm otvory ve vzdálenosti ± 9,7 mm od ohybu spojenými nožem** – potvrzuje to
postup navržený výše.

**Křížové ověření proti generátoru CraftPoint:** souhlasí **6mm otvory pro nýty**, **dva nýty**
i to, že se drážka pro trn **vyřezává**, ne vysekává. Šablona navíc dává číslo, které generátor
neuvádí: **přehnutý konec 90 mm** – použitelné jako referenční hodnota pro zónu zkosení.

**Na co pozor při použití:**

1. **Žádná z šířek není 40 mm.** 1½″ = 38,1 mm. Náš plán je 40mm pásek. Rozvržení otvorů leží na
   střednici, takže na 40mm pásu funguje; neodpovídá jen obrys šířky.
2. **Není tam kalibrační čtverec**, na rozdíl od šablony CraftPoint. Kontrola tisku je proto změřit
   šířku sloupce: 1″ musí vyjít **≈ 25,4 mm**, 1½″ **≈ 38,1 mm**. V samotném PDF mi vycházejí asi
   o 0,4 mm méně (24,98 / 37,68), takže ±0,5 mm je v normě.
3. **Je to Letter, ne A4.** Tisknout na 100 % bez přizpůsobení stránce a zkontrolovat, že se
   krajní sloupce neodřízly.
4. Je to jiný výrobce než CraftPoint, takže 90 mm nemusí odpovídat jejich rozvržení. **Před použitím
   porovnat s linií ohybu na vytištěném PDF z generátoru.**

## Odměřená geometrie PDF z generátoru CraftPoint (2026-09-10)

PDF jsem si vygeneroval sám (Playwright, tlačítko „Stáhnout střih v PDF“) ve výchozím nastavení:
**obvod pasu 95 cm, šířka 40 mm, anglická špička**. Vlastní délka se s obvodem mění, ale konec
u přezky by měl být stejný.

Struktura: **6 stran** – strana 1 je titulní s nastavením, materiály, díly, postupem a kalibračním
čtvercem 50 × 50 mm; strany 2–6 jsou listy 1/5 až 5/5 s dílem 1174,3 × 40 mm rozděleným po délce,
spojované přes „joins sheet N“ / „overlap with the line on sheet N“. Vše A4, tisk na 100 %.
**Šířka pásu na výtisku měří přesně 40,0 mm** (ověřeno na renderu 300 dpi).

### List 1/5 – konec se špičkou

| Prvek                        | Poloha (od horní hrany listu)                   |
| ---------------------------- | ----------------------------------------------- |
| Anglická špička              | 23,96–61,98 mm, tedy **hrot je 38,1 mm dlouhý** |
| Dírka pro trn 1              | 118,28 mm                                       |
| Dírka pro trn 2              | 143,26 mm                                       |
| Dírka pro trn 3 (prostřední) | 168,32 mm                                       |
| Dírka pro trn 4              | 193,29 mm                                       |
| Dírka pro trn 5              | 218,27 mm                                       |

**Rozestupy dírek: 24,98 / 25,06 / 24,98 / 24,98 mm → 25 mm.** Průměr dírek odměřen 4,83 mm včetně
tahu linky, nominálně tedy **4,5 mm**, jak uvádí postup. Od hrotu k první dírce **94,3 mm** – dobře
odpovídá „10 cm / 4″“ ze schématu z videa.

### List 5/5 – konec u přezky (to, na co se autor ptal)

| Prvek                                  | Poloha na listu | **Vzdálenost od linie ohybu** |
| -------------------------------------- | --------------- | ----------------------------- |
| Horní konec drážky (Ø 8 mm)            | 90,30 mm        | **−16,0 mm**                  |
| **Linie ohybu (čárkovaná)**            | 106,30 mm       | **0**                         |
| Dolní konec drážky (Ø 8 mm, s křížkem) | 122,30 mm       | **+16,0 mm**                  |
| Otvor pro nýt (Ø 6 mm, s křížkem)      | 171,28 mm       | **+65,0 mm**                  |
| Konec pásu                             | 186,27 mm       | **+80,0 mm**                  |

- **Drážka pro trn je 40 mm dlouhá a 8 mm široká** a linie ohybu ji **přesně půlí** (−16 / +16 mm).
  Vznikne dvěma Ø8 otvory ±16 mm od ohybu spojenými nožem.
- **Přehnutý konec je 80 mm dlouhý** (od ohybu ke konci pásu). To je zóna, o které se mluví
  u zkosení – u BFLG šablony vyšlo 90 mm, takže stejný řádový rozsah.
- Ohyb je uprostřed drážky, takže po přehnutí obě poloviny drážky splynou v jeden otvor, kterým
  prochází trn, a příčka přezky sedí v ohybu.

### Proč je otvor pro nýt jen pod ohybem a ne nad ním

Otvor Ø6 je jen jeden a leží **na přehnutém konci**, 65 mm od ohybu. Po přehnutí se dostane nad
hlavní pás do polohy −65 mm, kde šablona **schválně nic neznačí**: polohu určuje přehnutý konec.
Postup je tedy vysekat otvor v konci, přehnout a protlačit/označit skrz do hlavního pásu, čímž je
zaručené, že otvory sednou na sebe. BFLG to řeší opačně – značí **dva páry** otvorů symetricky
(±25,5 a ±73,2 mm) a počítá s děrováním naplocho před ohnutím.

### Nalezená nesrovnalost v šabloně CraftPoint

Titulní strana uvádí v materiálech „**Šroubovací nýty (Chicago šrouby) × 2**“ a v postupu
„Vysekni 4,5mm otvory, **6mm otvory pro nýty**“ (množné číslo), ale ve výkresu je označený
**jediný** Ø6 otvor. Buď v šabloně chybí druhá poloha nýtu, nebo se „× 2“ vztahuje na dvoudílnost
šroubovacího nýtu (hlavička + šroubek). Rozlišit to z PDF nejde. Při ceně 8 Kč/ks je bezpečné
koupit dva. **Pro nás poučení: v našich vlastních šablonách musí seznam materiálu a značky ve
výkresu souhlasit, jinak si uživatel nemá jak ověřit, co je správně.**

## Vlastní šablona: konec opasku se 4 otvory a poutkem

`pnpm pattern:belt-end` → `docs/generated/opasek-konec-u-prezky.svg` + `.pdf` (A4, 1:1, PDF je
ignorovaný jako výstup, SVG je verzované). Generátor: `scripts/belt-buckle-end.ts`, parametry
v `DEFAULTS`.

Doplňuje šablonu CraftPointu tam, kde ona poutko neumožňuje: má **dva nýty**, tedy **čtyři otvory**
symetrické k ohybu, a mezi nimi kapsu, ve které poutko zůstane uvězněné.

| Prvek            | Hodnota                         | Odkud                                                                                      |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Šířka pásu       | 40 mm                           | zadání                                                                                     |
| Drážka pro trn   | 40 × 8 mm, ohyb ji půlí         | odměřeno z PDF CraftPoint                                                                  |
| Ø otvoru pro nýt | 6 mm                            | odměřeno z PDF CraftPoint + BFLG                                                           |
| Nýty             | **± 25,5 a ± 73,2 mm** od ohybu | odměřeno z BFLG                                                                            |
| Kapsa pro poutko | **47,7 mm**                     | rozdíl obou poloh nýtů                                                                     |
| Přehnutý konec   | 90 mm                           | odměřeno z BFLG                                                                            |
| Zaoblení konce   | půlkruh r = 20 mm               | **volba této šablony**                                                                     |
| Poutko           | pásek **111 × 12 mm**           | **volba této šablony**: obvod zdvojené části 2 × (40 + 2 × 4) = 96 mm + 15 mm přeplátování |

Nýty se kupují **2 kusy**, ne 4 – každý prochází oběma vrstvami.

**Ověření výstupu** (render 300 dpi, stejný postup jako u cizích šablon): list A4 209,9 × 297,0 mm,
šířka pásu **39,96 mm**, kalibrační čtverec **50,04 × 50,00 mm**, prvky na střednici v 58,76 /
106,47 / 115,95 / **132,00 (ohyb)** / 147,96 / 157,44 / 205,19 / 221,95 mm – tedy nýty ± 73,2
a ± 25,5 mm a konce drážky ± 16 mm od ohybu, symetricky do 0,1 mm. Při první verzi měření odhalilo
kolizi popisky s kalibračním čtvercem; opraveno přesunem čtverce.

Délka poutka a zaoblení konce jsou **spočítané, ne ověřené praxí** – před řezáním vyzkoušet na
odřezku. Zvlášť poutko: 12mm pásek má v kapse 47,7 mm vůli, takže se bude posouvat. Kdo chce poutko
těsné, ať posune nýty blíž k sobě (parametr `rivetOffsetsMm`) a šablonu vygeneruje znovu.
