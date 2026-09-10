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

| Věc                                      | Kde a kolik                                                                                                              | Poznámka                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Kruhový průbojník na dírky pro trn       | CraftPoint jednotlivé 2–20 mm **od 29 Kč**; sada 7 ks (2–5 mm) 396 Kč; revolverový děrovač 2–4,5 mm 510 Kč               | Průměr se odečte od trnu vybrané přezky. Druhý průměr na šroubovací nýty podle jejich dříku.             |
| Otvor pro trn přezky (podélný průřez)    | CraftPoint podélný otvor 16/20 mm **od 1 083 Kč**                                                                        | **Nekupovat.** Standardní levné řešení: vyrazit kruhovým průbojníkem oba konce otvoru a spojit je nožem. |
| Hotový pás z přírodní kůže               | CraftPoint „Řemen z přírodní kůže 3,0–3,5 mm, 140 cm, 15–80 mm“ **184 Kč** (2–2,5 mm 155 Kč, 4,5–5 mm 120–130 cm 241 Kč) | Šablona žádá 3,0–4,0 mm. Tím padá potřeba dlouhého řezu z celé kůže.                                     |
| Opasková přezka 40 mm                    | CraftPoint nerez kartáčovaná **241 Kč** skladem, mosazná 252 Kč skladem                                                  | Gun metal 167 Kč byl při ověření vyprodaný.                                                              |
| Šroubovací nýty (chicago screws) 10/6 mm | CraftPoint **od 8 Kč/ks**, potřeba 2 ks                                                                                  | Utáhnou se šroubovákem, žádný lis ani razníky.                                                           |

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
