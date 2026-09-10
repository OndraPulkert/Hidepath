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
