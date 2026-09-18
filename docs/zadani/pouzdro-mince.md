# Pouzdro na karty s vsazenou mincí – střih (NÁVRH)

Stav: **návrh k ověření na papíru a odřezku**, ne lekce. Vznikl 2026-09-18 na přání autora podle
produktu a videa Red Forest Leather (rozbor v `docs/content/notes-vybaveni.md`, „Námět: pouzdro
s vsazenou mincí“). Je to kandidát na **druhé pouzdro** podle ADR 002 („druhý kus s obměnou“),
až bude první pouzdro fyzicky hotové.

## Co generátor dělá

- Model: `src/lib/geometry/coin-card-holder.ts` – všechny rozměry se počítají z rozměru karty
  (54 × 85,6), průměru mince a přídavků; kontroly hlídají kolize (druk × kapsa, chlopeň × kapsa,
  prstenec kolem okna, vejde se na A4).
- Kresba: `scripts/coin-card-holder.ts` → `docs/generated/pouzdro-mince-sablona.svg` + `.pdf`
  (A4 na výšku, 1:1, kalibrační úsečka 50 mm).
- Průměr mince je **proměnná**: `pnpm pattern:coin-holder --coin 50kc` (27,5 mm), `20kc` (26 mm,
  třináctihran), `10kc` (24,5), `5kc` (23), `decision` (40, předloha) nebo libovolné číslo v mm.
  Jiná než výchozí mince zapíše soubor s příponou `-mince-<průměr>mm` (27,5 → `-mince-27-5mm`); varianta pro 50 Kč je v repu.

## Konstrukce

| Díl             | Rozměr (mince 40)         | Poznámka                                                              |
| --------------- | ------------------------- | --------------------------------------------------------------------- |
| Tělo            | 66 × 178,2 mm             | přední panel 75,6 + ohyb 6 + zadní panel 78,6 + chlopeň 18; jeden kus |
| Dělicí panel    | 66 × 75,6 mm              | vložený mezi panely, vzniknou dvě kapsy (karty / bankovky)            |
| Kapsa s mincí   | 51 × 49,5 mm              | horní rohy R10, dolní R6, šev po třech stranách, horní hrana otevřená |
| Okno            | Ø 31 mm                   | mince − 2 × prstenec 4,5; **řeže se až po přišití kapsy**             |
| Forma pro důlek | otvor Ø 41, deska 70 × 70 | dřevo / HDPE, ne kůže; přiklopit rovnou deskou a stáhnout svěrkami    |

Odvozené hodnoty a jejich zdroj:

- šířka panelu = karta 54 + 2 × vůle 1,5 + 2 × (steh 3,5 + rezerva 1) = 66;
- výška předního panelu = karta 85,6 − 10 mm úchopu; zadní panel o 3 mm vyšší (přes obsah);
- chlopeň = 9 mm k druku + 9 mm přesah; druk Ø 12,5 na ose panelu, 9 mm pod horní hranou;
- boční švy: 3,5 mm od hrany, rozteč 4 mm, **tečky od ohybu**, aby si přední, zadní i dělicí panel
  po přeložení odpovídaly otvor na otvor (18 otvorů na stranu);
- kapsa s mincí: vůle 1 mm po stranách, 4 mm přesah nad mincí; 6 mm nad ohybem.

Kůže: tělo a dělicí panel 1,5 mm, kapsa s mincí 1,2 mm (musí se tvarovat). Odhad z fotek
předlohy ±0,3 mm.

## Materiál (ověřeno 2026-09-18, CraftPoint, skladem)

Díly se vejdou na **jeden arch A4**: tělo 66 × 178 + dělicí panel 66 × 76 v jednom sloupci
(254 mm), kapsa 51 × 50 vedle. Barvené třísločiněné lícové usně 1,2 mm z italské koželužny,
továrně upravený hladký povrch, A4 = 251 Kč, A5 = 57 Kč:

| Barva                                                                                                                                             | Poznámka                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Verde (lahvová zeleň)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde)                                        | nejblíž předloze Red Forest; výrobce ji výslovně doporučuje na pouzdra na karty a k mosaznému kování |
| [Blu (tmavě modrá)](https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu)                                              | stejná řada                                                                                          |
| [Rosso (červená)](https://craft-point.cz/products/trislocinena-hovezi-licova-kuze-1-2-mm-rosso)                                                   | stejná řada                                                                                          |
| [T. moro (tmavě hnědá)](https://craft-point.cz/products/hovezi-kuze-licova-trislocinena-1-2-mm-t-moro), Karamelová, Whisky, Černá, Giallo (žlutá) | stejná řada, klasické odstíny                                                                        |
| [Čokoládová 1,5 mm](https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm), A4 222 Kč                                              | jediná barvená 1,5 mm; kdo chce tužší tělo, kombinuje s 1,2 mm na kapsu                              |

Doporučení: **celé pouzdro z jednoho archu A4 Verde 1,2 mm** (251 Kč). Tělo z 1,2 mm je u pouzdra
na karty běžné, kapsa s mincí 1,2 mm potřebuje kvůli tvarování, a jedna kůže znamená stejný
odstín i patinu na všech dílech. Kdo trvá na 1,5 mm těle, vezme čokoládovou 1,5 mm (A4) a kapsu
z odřezku 1,2 mm v ladícím odstínu (T. moro). Barvená useň má světlý řez: hrany buď zaleštit
a nechat kontrast, nebo dobarvit barvou na hrany (CraftPoint má pero i váleček). Tvarování za
mokra na barvené kůži: nejdřív zkusit na A5 stejné barvy (57 Kč), některé úpravy povrchu při
namočení flekatí.

Andexnite má barvené třísločiněné usně 0,8–1,6 mm také, ale katalog se strojově načíst nepodařilo
(kategorie prázdná v HTML); pro tento návrh stačí CraftPoint, kde se objednává i ostatní.

## Postup (podle videa výrobce)

1. Vyříznout tělo a dělicí panel, srazit hrany, které nebudou v švu.
2. Kapsu: kus kůže 1,2 mm větší než díl navlhčit, položit na formu, přiložit minci, zatlačit do
   otvoru, přiklopit rovnou deskou, stáhnout svěrkami, nechat zaschnout (hodiny až přes noc).
3. Po zaschnutí **vyříznout obrys kapsy** podle šablony se středem na důlku.
4. Přišít kapsu na přední panel po třech stranách (horní hrana zůstává otevřená).
5. **Vyříznout okno** velkým kruhovým výsečníkem (Ø = mince − 9) na dně důlku, přes obě vrstvy
   ne – jen kapsu; pod kapsu podložit destičku.
6. Vložit dělicí panel, přeložit tělo, prošít oba boky skrz tři vrstvy.
7. Osadit druk (patice na přední panel, klobouček na chlopeň).
8. Srazit a zaleštit hrany. Minci zasunout shora; vyjímá se vytlačením prstem.

## Co je nutné ověřit před řezáním kůže

- Papírový model: složit, zkontrolovat, že chlopeň dosáhne k druku a karty jdou vyndat.
- Důlek na odřezku: tvarování za mokra plochu kolem důlku mírně stáhne; ověřit, že se obrys
  kapsy po zaschnutí pořád vejde a okno sedí soustředně.
- Průměr okna vůči konkrétní minci: prstenec 4,5 mm je volba; u malých mincí (10 Kč) zvážit
  3,5–4 mm, aby z mince něco zbylo vidět (okno 24,5 − 9 = 15,5 mm).
- Přídavek na ohyb 6 mm pro kůži 1,5 mm + dělicí panel + karty: ověřit na papíru s kartami.

## Co střih nemá

Ražený motiv na zadním panelu (vlastní razník), průchodku na šňůrku, dekorativní řady dírek.
Vše lze doplnit ručně, do generátoru to nepatří.
