# Pouzdro s mincí – forma na důlek: nákup a výroba

Doplněk k [pouzdro-mince.md](pouzdro-mince.md). Tady je, co koupit a jak vyrobit formu na důlek
kapsy, když máš doma jen aku vrtačku. Ceny a obsah balení jsou ověřené na webech obchodů
**2026-09-27**. Skladovost na konkrétní prodejně ověřená není, zobrazí se na stránce po výběru
prodejny.

Vrtačka, se kterou se počítá: **Fieldmann 14,4 V Li-ion, sklíčidlo 2–13 mm.**

## Jaký otvor ve formě pro kterou minci

Otvor = mince + 2 × kůže kapsy 1,2 mm + vůle 1,6 mm (viz model `formHoleDiameterMm`). Na listu
KAPSA pro danou minci je otvor formy nakreslený 1:1 (`pnpm pattern:coin-holder --coin 50kc`,
obdobně `20kc`, `10kc`).

| Mince         | Průměr mince | Potřebný otvor | Čím ho vyvrtat                                                  |
| ------------- | ------------ | -------------- | --------------------------------------------------------------- |
| výchozí 40 mm | 40 mm        | **44 mm**      | vykružovák 44 (BAUHAUS), nebo 45 z OBI (o 1 mm víc – vyzkoušet) |
| 50 Kč         | 27,5 mm      | **31,5 mm**    | vykružovák 32 mm (sada OBI) ✓                                   |
| 20 Kč         | 26 mm        | **30 mm**      | sukovník 30 mm (sada OBI) ✓ přesně                              |
| 10 Kč         | 24,5 mm      | **28,5 mm**    | sukovník 30 mm (o 1,5 mm víc – vyzkoušet na odřezku)            |

Větší otvor než potřebný (45 místo 44, 30 místo 28,5) nejspíš půjde, jen okraj důlku bude měkčí.
Neověřeno – vždycky nejdřív zkusit na odřezku kůže.

## Co koupit

### Vrtáky (stačí dvě sady z OBI, nic dalšího k nim dokupovat netřeba)

- [LUX-TOOLS Sada vykružovacích pil, 7 ks – OBI](https://www.obi.cz/vykruzovaci-pily/lux-sada-vykruzovacich-pil-7-ks/p/1698885),
  **99 Kč**. Průměry 25, 32, 38, 45, 50, 56, 62 mm, univerzální unášecí talíř a středicí vrták
  8 mm, na dřevo. Z ní 32 mm (50 Kč) a 45 mm (mince 40).
- [Sada Forstnerových vrtáků (sukovníků) 15–35 mm, 5 ks – OBI](https://www.obi.cz/vrtaky-do-dreva/sada-forstnerovych-vrtaku-15-mm-35-mm-5dilna/p/2021962),
  **179 Kč**. Průměry 15, 20, 25, 30, 35 mm, pro měkké dřevo a překližku (DIN 7483). Z ní 30 mm
  (20 Kč, 10 Kč). Stejná sada je i v
  [UNI HOBBY](https://www.unihobby.cz/sada-sukovniku-15-35-mm) (164,46 Kč).

Obě sady dohromady **278 Kč**. Síla stopek na stránkách uvedená není (obvykle 8–10 mm), do
sklíčidla 2–13 mm by se měly vejít – na prodejně zkontrolovat na balení.

Alternativy k vykružovací sadě OBI:

- [Sada vykružovacích pil ø 19–82 mm, 12 ks – BAUHAUS](https://www.bauhaus.cz/sada-vykruzovacich-pil-21443110),
  **299 Kč**, má **přesně 44 mm** a 2 hlavičky (unašeče), do dřeva a překližky, hloubka vrtu až
  25 mm. **Jen online**, na prodejnách není. Nemá 32 mm (mezi 25,5 a 36 nic).
- [Pilový vykružovák HiKOKI Ø 44 mm – HORNBACH](https://www.hornbach.cz/p/pilovy-vykruzovak-hikoki-o-44-mm/5578355/),
  **195 Kč**, bimetal, na prodejně skladem. Stránka neuvádí, jestli je v balení unašeč – na
  prodejně se zeptat, jinak dokoupit.
- Nekupovat: [LUX-TOOLS vykružovací pila Professional ø 44 mm – OBI](https://www.obi.cz/vykruzovaci-pily/lux-tools-vykruzovaci-pila-professional-se-stredicim-vrtakem-pr-44-mm/p/6316145)
  (919 Kč) je diamantová **na dlaždice**, ne na dřevo.

### Překližka

Tloušťka **10–12 mm** (min. 8 mm). Potřebuješ jen dva kusy ≥ 74 × 74 mm (forma a víko), ideálně
8 × 8 cm.

- Nejlevněji: zeptat se v přířezu na **odřezek**. Přířez mají
  [HORNBACH](https://www.hornbach.cz/sluzby/prirez/) (ne na všech prodejnách – předem zavolat),
  [BAUHAUS](https://www.bauhaus.cz/prirez-dreva) (ve všech odborných centrech, **minimální rozměr
  desky 250 × 500 mm**) a [OBI](https://www.obi.cz/prodejna/sluzby/prirez-dreva) (jen zúčastněné
  prodejny).
- Celá deska: [Překližka borová 10 × 600 × 1200 mm – HORNBACH](https://www.hornbach.cz/p/preklizka-borova-10-x-600-x-1200-mm/6571171/),
  489 Kč – na formu zbytečně velká.
- Poslouží i jakékoli prkno ≥ 8 mm nebo staré plastové prkénko, co máš doma.
- Baumax (dnes BM Česko, polský majitel): přířez na oficiálních stránkách neověřen – zavolat.

Co říct v přířezu:

> „Dobrý den, potřebuju kus překližky 10 až 12 milimetrů, co nejmenší, třeba 25 × 50 centimetrů.
> Nemáte nějaký zbytek z přířezu? A kdyby ne, uřízli byste mi z desky takový kus?“

Když se ptají, na co: „Dělám si formu, vyvrtám do ní díru 44 milimetrů vykružovákem.“

### Svěrky

| Co                                                                                                                                                       | Cena          | Poznámka                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| [ELLIX sada truhlářských svěrek 150 × 50 a 200 × 50 mm – OBI](https://www.obi.cz/upinaci-nastroje/ellix-sada-truhlarskych-sverek-2dilna/p/5400296)       | 109 Kč / 2 ks | **stačí** s formou 8 × 8 cm                                           |
| [Šroubová svěrka z temperované litiny 250 × 80 mm – OBI](https://www.obi.cz/upinaci-nastroje/sroubova-sverka-z-temperovane-litiny-250-x-80-mm/p/5410782) | 119 Kč / ks   | vyložení 80 mm, pevnější; **nejlepší poměr** (2 ks = 238 Kč)          |
| [Bessey TPN-BE-2K 25/120 – OBI](https://www.obi.cz/upinaci-nastroje/bessey-sroubova-sverka-z-temperovane-litiny-tpn-be-2k-25-120/p/6498182)              | 599 Kč / ks   | zbytečná                                                              |
| [LUX-TOOLS svěrák Classic 100 mm – OBI](https://www.obi.cz/upinaci-nastroje/lux-sverak-100-mm-classic/p/2657203)                                         | 799 Kč        | jen když ho využiješ i jinde; musí se přišroubovat k pracovnímu stolu |

**Plexisklo na víko nekupovat.** OBI prodává jako „plexisklo“ polystyren: 2 mm se pod svěrkou
prohne, 4 mm je jen jako deska 0,5 × 1 m za 1 079 Kč a pod šroubovou svěrkou může prasknout. Víko
z překližky je tužší a zadarmo.

### Z domova

Odpadní prkno pod desku při vrtání, smirkový papír (asi zrnitost 120) na zaoblení hrany otvoru,
potravinová fólie na minci, houbička a voda.

## Vyložení svěrky (proč forma 8 × 8 cm)

Vyložení = jak hluboko od okraje desky svěrka dosáhne (délka čelistí). U ELLIX 50 mm – dál od
hrany netlačí. Otvor s mincí proto musí být blíž než ~4 cm od hrany, jinak svěrka tlačí vedle
mince.

```
  Špatně: otvor uprostřed velké desky        Dobře: forma 8 × 8 cm, otvor uprostřed
  ┌──────────────────────────────────┐       ┌───────────┐
  │▓▓▓▓▓▓▓│                          │       │           │
  │▓ sem ▓│         ( otvor )        │       │   ( ◯ )   │  střed 4 cm od každé hrany
  │▓▓▓▓▓▓▓│                          │       │           │
  └──────────────────────────────────┘       └───────────┘
   ◄ 5 cm ► svěrka otvor nestiskne
```

Dvě svěrky dát proti sobě (z každé strany jednu), aby se víko nenaklonilo.

## Výroba formy

1. Vytisknout list KAPSA na 100 % (zkontrolovat úsečku 50 mm), vystřihnout kružnici „OTVOR FORMY
   PRO DŮLEK“ a nalepit na desku 8 × 8 cm.
2. Desku upnout svěrkou ke stolu, pod ni odpadní prkno.
3. Vrtat na **1. rychlost, bez příklepu**, netlačit silou, s nabitou baterií (vykružovák 45 mm je
   pro 14,4 V nejnáročnější). Vykružovákem provrtat do půlky, desku otočit a dokončit z druhé
   strany podle dírky středicího vrtáku. Sukovník občas vytáhnout kvůli pilinám.
4. Horní hranu otvoru zaoblit smirkem (ostrá hrana by v kůži udělala rýhu).
5. Bez vykružováku: navrtat dokola díry 5–6 mm těsně uvnitř čáry, střed vylomit, dopilovat na
   čáru (pilník nebo smirk kolem lahve).

## Tvarování důlku

1. Třísločiněná kůže 1,2 mm ≥ 70 × 70; orýsovat obrys a prosekat otvory švu **před** navlhčením.
2. Minci zabalit do potravinové fólie (mokrá třísločiněná kůže může od kovu tmavě zabarvit).
3. Navlhčit houbičkou (nemáčet), počkat, až začne zase světlat.
4. Kůži lícem dolů na formu, křížek nad středem otvoru; minci na rub nad otvor; přiklopit víkem;
   dvěma svěrkami proti sobě rovnoměrně stáhnout.
5. Nechat úplně zaschnout (jistější přes noc).
6. Vyříznout obrys podle orýsování, kapsu lícem dolů zpět na formu, pod důlek špalík a vyseknout
   okno.

Nejdřív celé zkusit na odřezku. Mělký nebo na okraji zvrásněný důlek = kůže málo vlhká nebo slabě
stažená; kůže moc ztenčená = moc mokrá nebo přetažená.
