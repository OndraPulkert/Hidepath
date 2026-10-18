# OBRAT R06 — jedna useň 1,2 mm a kontrolovaná redukce vrstev

> **Nahrazeno:** aktuální konstrukce je [R09 — zjednodušení](iterace-09-zjednoduseni.md). Tento dokument je historický.

18. 10. 2026. Aktuální konstrukční posouzení po požadavku autora vše zapracovat a ověřovat. Nahrazuje pracovní 1mm variantu z iterace 05. **Fyzický prototyp zatím nebyl doložen.** Předložené dvě varianty jsou podklad pro konstrukční a vzhledové rozhodnutí, nikoli hotový výrobní projekt.

## Co je skutečně přepracováno

1. Všechny díly, kryty druků a nácvik **z jedné 1,2mm usně**, bez domácího ztenčování, podšívky nebo kozinky. Tuhost konkrétní usně není z nominální tloušťky známá a ověří se vzorkem.
2. **Odstraněná celoplošná přepážka mezi kartami a bankovkami.** Bankovky napůl leží přímo za čtyřmi kartami ve společné kapse. Není to samostatná bankovková kapsa. Tato změna šetří jednu vrstvu, jeden hlavní díl a jednu vrstvu ve společném U-švu.
3. Druk **B přesunutý z čela prostřední mince do pevného levého lemu mincovního nosiče**. Jeho protikus bude na levé části mincovní klopy. Není nutné mačkat druk přímo proti minci. Ve stejném lemu, níže a s odstupem, je druhá polovina A.
4. Zůstává samostatná horní klopa s **C**, nad pásem, bez zasunutí pod něj. Karty i bankovky jsou dostupné při A+B zapnutých.
5. Předek mincí zůstává jeden plochý přířez dělený rovnými švy. Žádné tvarované košíčky z obrázků. Způsob připojení a rozvinutí klop je dál fyzická vývojová úloha.

Změna počtu komor a zrušení bankovkové přepážky nejsou již schválené vzhledové změny. Původní obrázky schváleného směru se tím automaticky nestávají výrobními předlohami R06. Předchozí detaily nejsou zachované za cenu neproveditelné konstrukce.

## Dvě posouzené varianty

| Varianta            | Půdorys těla bez místního vyklenutí | Mincovní komory                  | Význam                                                                                                                                                      |
| ------------------- | ----------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kompaktní kandidát  | **108 × 90 mm**                     | dvě, mezi švy 38 + 38            | Doporučený výchozí prototyp pro jednoduchou výrobu a původní malou velikost; viditelně jiný rytmus švů, vyžaduje posouzení autora.                          |
| Zachování tří komor | **128 × 90 mm**                     | tři, mezi švy 30,5 + 34,5 + 31,5 | Větší šířka za zachování tří oddělených míst. Největší mince patří do prostřední komory. Není vydávána za rozměrově stejný produkt jako původních 108 × 88. |

Rozměry jsou zvolené pracovní obálky splňující popsaný model, nikoli důkaz globálně nejmenší možné konstrukce. Původní 108mm tělo se třemi komorami v tomto uspořádání **neprojde** kontrolou deklarované jedné 50 Kč po započtení místa pro druky, lepidla a ruční odchylky.

[Srovnání obou variant](obrat-r06-konstrukcni-srovnani.svg) je deterministický nákres z modelu, ne další estetická vizualizace. Kování B je v něm označením rezervované zóny; délka a rozvinutí jeho klopy ještě nejsou potvrzené.

## Jediný zdroj čísel a reprodukce

- Model: `src/lib/geometry/obrat-wallet.ts`.
- Testy: `src/lib/geometry/obrat-wallet.test.ts`.
- Generátor: `scripts/obrat-review.ts`.
- Příkaz: `node --import tsx scripts/obrat-review.ts`, případně `pnpm pattern:wallet-obrat-review`.
- Výsledek: [kontrolní JSON](obrat-r06-kontrola.json), srovnávací SVG a [zkouška dutin 1:1 na A4](obrat-r06-zkouska-dutin-a4.svg).

Výstup je výslovně `dimensional-screening-only`, fyzické ověření `not-performed`. Úspěšný test neoznačuje peněženku za vyrobitelnou a neprokazuje retenci.

## Změřený vstup proti odhadu

**Ověřeno z primárních zdrojů 18. 10. 2026:**

- [ČNB: 1 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/1-kc/index.html): Ø 20, tloušťka 1,85, tolerance průměru ±0,1 a tloušťky ±0,13.
- [ČNB: 2 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/2-kc/index.html): Ø 21,5, tloušťka 1,85, stejné uvedené rozměrové tolerance.
- [ČNB: 10 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/10-kc/index.html): Ø 24,5, tloušťka 2,55, tolerance ±0,1 a ±0,05.
- [ČNB: 20 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/20-kc/index.html): Ø 26, tloušťka 2,55, tolerance ±0,1 a ±0,05.
- [ČNB: 50 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/50-kc/index.html): Ø 27,5, tloušťka **2,55**, nikoli dřívější zjednodušení 2,5; tolerance ±0,1 a ±0,05.
- [ČNB: 5000 Kč](https://www.cnb.cz/cs/bankovky-a-mince/bankovky/5000-kc/): 170 × 74 s tolerancí ±1,5, tedy po přeložení nominální maximální obálka 85,75 × 75,5 bez dodatečné rezervy přehybu.

Použití 1,2mm usně pro peněženku dokládá například [originální specifikace střihu Denali](https://www.rmleathersupply.com/products/copy-of-rm-010-the-denali-luxury-billfold-wallet-digital-pattern-skill-2), která připouští 0,8–1,2. **Neověřuje tím OBRAT, jediný materiál ve všech jeho vrstvách ani začátečnickou obtížnost**; Denali je označená jako mírně pokročilá.

Karty 85,60 × 53,98 × 0,76 jsou dosavadní vstup projektu, ne nově doložená rozměrová tolerance karet. Ověří se se skutečnými kartami včetně případného reliéfu. Tloušťka tří bankovek napůl **1,1 mm je pracovní odhad**, nikoli údaj ČNB nebo nové měření. Stejně jsou pracovní předpoklady lepidla, ručních odchylek a vůlí níže. Jejich změna musí přepočítat výsledek.

## Jak se kontrolují dutiny

Místo mezi levými švy začíná až na x 24. Přední mincovní díl má levý řez na x 20,5. Druky A a B mají rezervované středy x 12 a obálku příruby do Ø 12; mezi přírubou a řezem zbývá 2,5. To je **prostorový limit**, ne konkrétní vybraný druk a ne potvrzený odstup doporučený výrobcem.

Z rozteče mezi švy se odečítá 0,5 mm lepidla na každé straně a další 1 mm celkové ruční odchylky. Pracovní potřeba dutiny je větší průměr mince včetně tolerance + součet tlouštěk stohu včetně tolerancí + 2 mm manipulační rezervy. Tento vzorec je konzervativní vstupní obálka, nikoli výpočet skutečného vyklenutí a tření usně.

Kompaktní varianta má využitelnou šířku **36 mm** a hloubku **34 mm** v každé komoře. Jedna 50 Kč potřebuje v modelu 27,6 + 2,6 + 2 = **32,2 mm**, dvojice 1+2 Kč potřebuje **27,56 mm**. Dvojice 50+50 Kč potřebuje **34,8 mm**, tedy neprojde hloubkou. Proto nejsou čtyři padesátikoruny deklarovaná kapacita ani při dvou širokých komorách.

U tříkomorové varianty vyjdou šířky **28,5 / 32,5 / 29,5** a stejná hloubka 34. Posuzovaná skladba je 1+2 Kč / 50 Kč / 10 Kč. Její šířkové rezervy v prostřední a poslední komoře jsou jen **0,3 mm nad již odečtenými přídavky**. Je tedy citlivější a vyžaduje obzvlášť důsledný odřezkový test. Nelze ji nazvat spolehlivě vyřešenou pouhým průchodem vstupní obálky.

## Redukce vrstev a pravdivá tloušťka

V hlavní kapse jsou jen dvě kožené stěny. Zkušební hlavní U-šev je přes dvě vrstvy, nominálně 2,4 mm, při modelovém skutečném maximu 1,3 na kusu 2,6. Hodnota 1,3 je screeningový vstup k přeměření, nikoli tolerance konkrétního prodejce.

V místě, kde se překládá mincovní klopa přes obsah, je pět kožených vrstev. Pod koncem její klopy mohou být jen čtyři; tato oblast sama neudává maximum peněženky. Kryty A/C a samotné kování jsou další lokální zesílení a nejsou v následujících součtech.

| Obsah v posuzovaném místě                | Původních 6 vrstev po 1,2 | Nových 5 vrstev po 1,2 |
| ---------------------------------------- | ------------------------- | ---------------------- |
| 4 karty + 3 bankovky napůl + jedna 50 Kč | **13,89 mm**              | **12,69 mm**           |
| Stejné, místo 50 Kč dvojice 1+2 Kč       | 15,04 mm                  | **13,84 mm**           |
| Stejné, místo 50 Kč dvojice 10+20 Kč     | 16,44 mm                  | **15,24 mm**           |

To jsou nominální součty materiálů při lokálním překrytí, nikoli změřená maxima: navíc působí lepidlo, nit, prostor dutin, kování a způsob rozložení obsahu. U čtyř libovolných mincí nelze garantovat tenkou peněženku. Původní univerzální slib 12 mm se ruší, protože jej výpočet nepodporuje. Jedna useň a snadnější výroba jsou splnitelné konstrukční podmínky; uživatelská přijatelnost skutečné tloušťky zatím není potvrzená.

## Jednodušší kusovník a montáž

Základ má tři větší přířezy: tělo se zkrácenou horní klopou a integrálním bočním nosičem, přední stěnu společné kapsy a předek mincí. Dále klopu mincí a malé kryty kování ze stejné kůže. Plná bankovková přepážka odpadá. Přesný počet krytů a osazení závisí na konkrétním kování a jeho hladkém rubu.

Pořadí:

1. Odřezkový šev a kování ve skutečné 1,2mm usni, včetně krytů. Vybrat skutečný typ druku podle montážní tloušťky a požadované síly.
2. Izolovaný vzorek dvou mincovních dutin z přiloženého A4 listu. Neověřuje B, ohyb ani retenci.
3. Samostatný **celý** mincovní modul včetně lemu, A/B a klopy. Teprve ten může ověřit zavírání a rohy. Jeho rozvinutí je nutné ještě dokončit; nepřenášet ho z produktového obrázku.
4. Řez skutečného těla a přední stěny; před sestavením dokončit otevřené hrany, osadit pevné poloviny A a C a zakrýt rub. B leží na levém lemu nosiče mimo dutiny.
5. Mincovní modul přišít naplocho na rozložené tělo. Integrální boční ohyb zůstává bez lepidla a švu.
6. Sešít společnou kapsu naplocho přes dvě vrstvy. Mincovní díl je rozložený stranou; nevšitý omylem do hlavního švu.
7. Přes skutečný obsah dopasovat volné části klop a protikusy. Ověřit C při A+B zavřených a naopak. Žádné nastavování v desetinách mm.
8. Zkouška celého prototypu, tloušťky a nošení; teprve potom finální návod a skutečná stavba začátečníkem.

**Žádný konkrétní druk zatím není schválený.** Například [Weaver Line 20](https://www.weaverleathersupply.com/products/line-20-snaps-2206) má podle dodavatele čepičku 1/2 palce a trn 1/4 palce, tedy čepičku přibližně 12,7 mm; do našeho Ø 12 limitu se automaticky nevejde a není nákupním doporučením. Označení „malý druk“ nestačí. Potřebujeme jeho skutečné rozměry, způsob osazení a přípravek pro danou tloušťku.

Konkrétní kandidát k doplnění údajů je [THK / Hasi-Hato Segma Small 10 mm](https://www.rmleathersupply.com/products/copy-of-thk-hasi-hato-segma-snaps-solid-brass-base-metal). Dodavatel uvádí čepičku 10 mm, materiál do 3 mm a odpovídající osazovací nástroje. Neuvádí tím minimální vhodnou tloušťku, největší průměr všech přírub, výšku zapnuté sestavy ani sílu otevření. Proto údaj „do 3 mm“ sám nepotvrzuje správné osazení jedné vrstvy 1,2 mm. Nejde o pokyn k nákupu ani o důvod přidávat vyztužovací vrstvy bez nového přepočtu.

## Co je ještě otevřené a proč nevzniká finální kurz

Nově existuje kontrolovaný rozměrový model, automatické kontroly kolizí a kapacit, testy chybových variant, srovnávací kresba a **izolovaný** tiskový vzorek. Neexistuje zatím ověřené rozvinutí bočního přehybu a klopy B, konkrétní kování ani fyzické výsledky. Ani prostorový screening není plnohodnotná dynamická simulace.

Před další estetickou vizualizací a výrobní animací je nutné vyřešit reálné kování a klopy, ověřit celý modul a vyrobit prototyp. [Protokol](protokol-overeni.md) zůstává zdrojem fyzických výsledků; příprava do aplikace pokračuje podle [aktualizované osnovy](../../content/osnova-obrat.md). Původní schválený vzhled se nemá bez posouzení autora tiše zaměnit za větší či dvoukomorový kus.
