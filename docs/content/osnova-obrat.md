# Projekt v aplikaci: Peněženka OBRAT

> **R09 (18. 10. 2026):** osnova níže je historická. Aktuální lekce, listy a pořadí jsou v aplikaci a v [R09 — zjednodušení](../design/obrat/iterace-09-zjednoduseni.md).

**Po auditu R08:** označení obtížnosti je Vývojový — neověřený; lekce 6–10 jsou pevně zablokované nezávisle na uloženém postupu. Výrobní čas se u vývojových projektů nezobrazuje. Viz [náprava](../design/obrat/iterace-08-audit-a-naprava.md).

**Historická aktualizace:** OBRAT je nyní registrovaný jako `obrat-wallet`, kód 05, vývojový projekt. Má deset lekcí s kroky, zápisy a kontrolami, tisk izolovaných dutin a interaktivní přehled zapínání. Finální rozvinutí, kompletní výrobní střih a začátečnické ověření nadále chybějí. Níže uvedená osnova popisuje i budoucí cílový stav, nikoli hotový ověřený kurz.

> **Vzhled:** autor po animaci R06 preferuje původní produktový pohled iterace 03. Dvoukomorová R06 není přijatá jako jeho náhrada. Další konstrukce se řídí [zapsanou preferencí](../design/obrat/rozhodnuti-vzhled-po-r06.md); technické výsledky R06 nepozbývají platnost.

18. 10. 2026. Stav: **příprava projektu, fyzická funkčnost neověřena**. Autor požaduje pozdější zařazení do stejného systému lekcí, animací, střihů a zápisníku jako ostatní projekty. Základní verze má používat **jeden druh a jednu tloušťku kůže**, ne sestavu různých usní. Registrace mezi hotové výrobní návody až po splnění ověřovacího protokolu.

Konstrukční směr: [iterace 03](../design/obrat/iterace-03-nezavisla-horni-klopa.md) určuje nezávislé otevírání, [iterace 04](../design/obrat/iterace-04-vyroba-pro-zacatecniky.md) jednoduchou výrobu. Aktuální materiál a změny konstrukce určuje [R06 — jedna useň 1,2 mm](../design/obrat/iterace-06-jedna-kuze-1-2mm.md): bez plné bankovkové přepážky, se společnou kapsou a mincovním kováním mimo komory. Obrázky z imagegenu nejsou dokladem fyzického ověření ani zdrojem výrobních rozměrů.

## Cíl

Kompaktní peněženka na čtyři karty, dvě až tři bankovky napůl a tři až čtyři běžné mince. Horní druk C otevírá karty a bankovky při zavřených A+B. Mincovní pás se otevírá doprava a nevisí pod peněženkou. R06 předkládá dvě komory při 108 × 90 nebo tři při 128 × 90; tato viditelná změna a měřená tloušťka vyžadují posouzení autora. Cíl je jeden druh 1,2mm usně ve všech dílech. Původní univerzální slib 12 mm se nepotvrdil.

## Podoba v aplikaci po ověření

Pracovní slug `obrat-wallet`, název **Peněženka OBRAT**. Navázat na stávající registr projektů, MDX texty, `patternSheets` / `practiceSheets`, `animationLink()` a záznamy v lekcích. Nepřidávat zvláštní stránkový nebo datový systém jen pro tento výrobek.

| Lekce                                      | Obsah                                                                                          | Názorná podpora a kontrola                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 01 — Výběr materiálu a měření              | Jeden ověřený materiál, změřená tloušťka, velikost přířezu podle rozložení a rezerva na nácvik | Sdílená animace posuvky; zápis tloušťky a označení konkrétní usně.                |
| 02 — Papírová zkouška a orientace dílů     | Půdorys v kapse, líc/rub, která kapsa je na co, A/B/C                                          | Vlastní animace otevření; papír ověřuje pouze obrys a orientaci.                  |
| 03 — Nácvik švu a druků                    | Dvě a tři vrstvy stejné kůže, zvolený druk s krytem                                            | Sdílený sedlářský steh a osazení druku; fotografie skutečného vzorku.             |
| 04 — Mincovní modul z odřezků              | Zvolený počet plochých komor a kování v odděleném lemu                                         | Vlastní animace skládání, lepení, dělicích švů a klopy; povinný výsledek zkoušky. |
| 05 — Přenos a řez                          | Ověřené listy 1:1, kalibrace, přířez těla s bočním pásem                                       | Sdílený řez a oblouky; vlastní pohled na rozvinuté tělo a zaoblený kořen.         |
| 06 — Otevřené hrany a pevné poloviny druků | Dokončit přístupné hrany, A/B/C, kryty ze stejné kůže                                          | Vlastní rozpad kování s orientací; fotografie rubu před uzavřením.                |
| 07 — Mincovní pás naplocho                 | Klopa a společný předek na rozloženém těle                                                     | Vlastní animace skutečného pořadí; žádné modelové šití skrz dutinu.               |
| 08 — Hlavní kapsy                          | Zadní tělo a přední stěna společné kapsy, U-šev přes dvě vrstvy                                | Vlastní řez vrstvami a animace lepení; kontrola nezalepených dutin.               |
| 09 — Dopasování klop a druků               | Skutečný obsah, boční ohyb, přenos pohyblivých polovin A/B/C                                   | Vlastní animace přenosu pozic, bez zadávání návodu k děrování z odhadu.           |
| 10 — Dokončení a přejímka                  | Hrany, retence, přístup, tloušťka a záznam výsledků                                            | Sdílené hrany, vlastní kontrola použití; měření a skutečné fotografie.            |

Toto je osnova, nikoli deset již hotových a ověřených lekcí. Časy, spotřeba, nákupní přířez a přesné výrobní hodnoty se doplní po skutečné stavbě. Každá lekce bude mít vybavení, pořadí kroků, kontrolní body, chyby a nápravy a relevantní poznámky či měření.

## Animace

Plán vlastních stránek v `public/animace/`: `obrat-pouzivani`, `obrat-dily`, `obrat-mince`, `obrat-vrstvy`, `obrat-druky`. Jména jsou pracovní, soubory zatím neexistují. Každá část bude propojená přímo s příslušným krokem lekce. Řez, sedlářský steh, hrany, měření a základní osazení druku znovu využijí společné návody.

Výrobní animace musí vzniknout z **téhož ověřeného rozměrového modelu jako tiskové listy**, nikoli překreslením produktové vizualizace. Musí zobrazit orientaci líc/rub, skutečné vrstvy, přístup nástroje a odpovídající poloviny druků. Virtuální model neověřuje sílu druku, pružnost ani únavu usně.

## Tiskové podklady

- Ověřený střih 1:1 s kalibrační úsečkou, obrysy, identifikací dílů a orientací.
- Oddělené mapy lepení a švů, aby se nezaměnily s řezy.
- Cvičný proužek na skutečné vrstvy a zvolený druk.
- Odřezkový mincovní modul.
- Papírový obrys a kontrolní list zkoušek.

Pohyblivé poloviny druků označit podle potvrzené metody dopasování; nefixovat jejich polohu jen podle neověřeného 3D obrázku. Tisková kalibrace a formát A4 musí projít kontrolou.

## Pořadí implementace a zařazení

1. R06: model pro jednu 1,2mm kůži a strojové kontroly dutin, kování a vrstev jsou připravené. Zbývá konkrétní kování, rozvinutí klop a bočního ohybu; vybrat a posoudit variantu dvou/tří komor.
2. Nácvik a mincovní modul ze stejného materiálu; zápis do [protokolu](../design/obrat/protokol-overeni.md).
3. Celý kožený prototyp, opravy střihu, zkouška podle skutečného postupu.
4. Postup zkusí začátečník bez konstruktérských zásahů; opravit nejasnosti.
5. Z uzavřeného modelu připravit konečné listy a výrobní animace, doplnit fotografie a skutečnou spotřebu.
6. Připravit obsah v `src/content/projects/obrat-wallet/`, případné sdílené vybavení a záznamy zkoušek.
7. Zaregistrovat projekt v `src/content/projects/index.ts`, těla v `lesson-bodies.ts`, listy v `pattern-sheets.ts` a animace v `src/content/animations.ts`.
8. Ověřit schéma, návaznost lekcí, existenci médií, shodu rozměrů, tisk a mobilní/offline zobrazení. Databázové změny nepřidávat, pokud vystačí stávající obecné záznamy.

Do splnění fyzických kroků se nevytváří dojem hotového ověřeného projektu v nabídce. Pokud autor později požádá o testování prototypu přímo v aplikaci, může přibýt výslovně označená zkušební verze; tím se neoznačí za ověřenou.
