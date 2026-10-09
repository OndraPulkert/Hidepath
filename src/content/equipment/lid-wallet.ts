import { type EquipmentDefinition } from '@/content/schema';

/**
 * Položky katalogu, které přibyly s projektem 03 (peněženka Víčko, docs/zadani/penezenka-vicko.md,
 * oddíl 10 a 10.1). Každý příklad je ze stránky načtené 29. 9. 2026 (useň P1 9. 10. 2026; CraftPoint přes `…/products/
 * <handle>.js`, ostatní obchody přes HTML). Co stránka neuvádí, je v textu označené „ověřit“.
 * Texty jsou NÁVRH (reviewStatus: draft).
 */

const VERIFIED_NOTE =
  'Rozsah odpovídá ověřeným nabídkám českých e-shopů (viz příklady níže). Před nákupem ověřte.';

const draft = <T extends Omit<EquipmentDefinition, 'reviewStatus'>>(e: T): EquipmentDefinition => ({
  ...e,
  reviewStatus: 'draft',
});

export const lidWalletEquipment: readonly EquipmentDefinition[] = [
  draft({
    slug: 'veg-tan-leather-1mm',
    name: 'Kůže – třísločiněná useň kolem 1,0 mm na míru',
    englishName: 'Veg-tan leather 1 mm',
    category: 'material',
    shortDescription:
      'Pás P1 peněženky Víčko: přední stěna, ohyb dna, záda, závěs, víčko i jazýček z jednoho kusu.',
    purpose:
      'Peněženka Víčko je z jednoho pásu třísločiněné usně kolem 1,0 mm. Useň musí být pevná (ne měkká nappa), protože pás drží tvar ohybu dna i závěsu. Zkušební i finální kus se řežou ze stejné kůže, aby zkouška ohybu V12 a zkušební kus ověřily přesně ten materiál, ze kterého bude finální kus.',
    buyingGuide: [
      { label: 'Činění', value: 'třísločiněná lícová useň, pevná' },
      {
        label: 'Tloušťka',
        value:
          'co nejblíž 1,0 mm (obchod ji prodává jako 1–1,2 mm); tlustší P1 snižuje hranici přepážek; po dodání změřit posuvkou na několika místech',
      },
      {
        label: 'Množství',
        value:
          '10 dm² jako obdélník 20 × 50 cm: dva přířezy P1 110 × 240 mm (zkušební a finální kus) a odřezky na zkoušku ohybu V12 a podložku pro šev S7',
      },
    ],
    cautions: [
      'Když se změřená tloušťka liší od 1,0 o 0,05 mm a víc, listy se musí vygenerovat pro změřenou tloušťku (přepínač --p1), jinak nesedí oblouk ohybu dna ani délka závěsu.',
      'Obchod kůži na dm² nařeže na míru a požadovaný rozměr přijímá v poznámce k objednávce (v poradně sám uvádí příklad „20 × 50 cm“). Dodané množství může upravit a rozdíl promítne do ceny. Od objednávky kůže řezané na míru nejde odstoupit (§ 1837 občanského zákoníku) a při nepřevzetí obchod účtuje storno 50 % hodnoty kůže. Zdroj: poradna obchodu „Řezání kůže na míru – počet dodaných dm2 a jakosti kůže“ (sijemezkuze.cz/poradna), načteno 29. 9. 2026.',
    ],
    avoid: [
      {
        title: 'Měkká chromočiněná nappa a podšívkové usně',
        reason: 'pás nedrží tvar ohybu ani závěsu',
      },
      { title: 'Štípenka', reason: 'nemá líc' },
    ],
    alternatives: [],
    // 10 dm² × 19,50 Kč (Šijeme z kůže, třísločiněná hnědá 1–1,2 mm, ověřeno 9. 10. 2026) až 10 dm² ×
    // 22,50 Kč (pull-up 0,8–1,2 mm, ověřeno 9. 10. 2026). Kaštan 0,9–1 mm p4698 obchod stáhl (stránka
    // vrací 404, hledání „kaštan“ nabízí jen usně 1,3 mm a silnější).
    priceRange: { minCents: 19_500, maxCents: 22_500 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} 10 dm² × 19,50–22,50 Kč/dm², bez poštovného (poštovné neověřené). Obchod může dodané množství upravit podle skutečného kusu a rozdíl promítne do ceny.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Třísločiněná kůže hnědá – 3 různé síly',
        shop: 'Šijeme z kůže',
        url: 'https://www.sijemezkuze.cz/trislocinena-kuze-hneda-3-ruzne-sily-p4704-8013',
        variant: '1–1,2 mm',
        priceCents: 1_950,
        priceNote: 'za dm² (16,12 Kč bez DPH)',
        note: 'Náhrada za kaštan 0,9–1 mm (staženo z nabídky). Obchod ji uvádí jako pevnou, tuhou a tvarově stálou, vhodnou na peněženky a tvarování za mokra. P1 zkušebního i finálního kusu. Objednat 10 dm² a do poznámky napsat „Prosím v jednom kuse jako obdélník 20 × 50 cm, z pevné části kůže, co nejblíž 1,0 mm“. Tloušťku po dodání změřit a listy vygenerovat pro změřenou P1. Tlustší P1 snižuje hranici přepážek (P1 1,1 → nejvýš 0,80 mm, 1,2 → 0,60 mm): formulář listů ji ukáže. U P1 1,1 a víc pak čokoládová kozinka 0,7–0,9 mm na D2 nemusí projít.',
        availability: 'in_stock',
        checkedAt: '2026-10-09',
      },
      {
        title: 'Pull Up Crazy horse třísločiněný 0,8–1,2 mm hnědý (varianta od 5 dm²)',
        shop: 'Šijeme z kůže',
        url: 'https://www.sijemezkuze.cz/pull-up-crazy-horse-trislocineny-0-8-1-2-mm-hnedy-top-kvalita-od-5-dm2-nebo-cely-kus-za-zvyhodnenou-cenu-p4777-8033',
        priceCents: 2_250,
        priceNote: 'za dm² (18,60 Kč bez DPH), minimální odběr 5 dm²',
        note: 'Záloha, když 1–1,2 mm dojde. Obchod ji uvádí jako lehce změkčenou a voskovanou (pull-up, v ohybu světlá): pás ohybu a závěsu nemusí držet tvar, ověří to zkouška ohybu V12 a zkušební kus. Lepidlo a barvu hran nejdřív zkusit na odřezku. Tloušťku po dodání změřit.',
        availability: 'in_stock',
        checkedAt: '2026-10-09',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'veg-tan-leather-1mm-main',
        kind: 'photo',
        caption: 'Obdélník třísločiněné usně 20 × 50 cm s vyznačenými přířezy P1',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'veg-tan-leather-0-8',
    name: 'Kůže – třísločiněná useň 0,8 mm (jen záloha A)',
    englishName: 'Veg-tan leather 0.8 mm',
    category: 'material',
    shortDescription:
      'Jen když ve zkoušce ohybu V12 popraská líc usně 1,0: celý pás P1 z usně 0,8, nic se neztenčuje.',
    purpose:
      'Záloha A peněženky Víčko. Kupuje se až podle výsledku zkoušky ohybu V12, ne předem. Listy se pro ni generují přepínačem --p1 0.8.',
    buyingGuide: [
      { label: 'Činění', value: 'pevná třísločiněná useň' },
      {
        label: 'Kus',
        value:
          'záloha A platí pro zkušební i finální kus: jako u usně 1,0 jeden kus 20 × 50 cm (2 přířezy P1 110 × 240 mm vedle sebe a z pruhu vedle nich odřezek 30 × 40 mm na zopakování V12); jeden P1 potřebuje kus aspoň 11 × 24 cm',
      },
    ],
    cautions: [
      'Pevnou třísločiněnou useň 0,8 v potřebném kusu se v obchodech ověřit nepodařilo. Před koupí ověřit u prodejce.',
      'Kus jen 11 × 24 cm stačí na jediný P1: na zkušební i finální kus by pak useň chyběla.',
    ],
    avoid: [],
    alternatives: [
      {
        title: 'Záloha B: ztenčení pásu ohybu na 0,6',
        reason:
          'jen když useň 0,8 nejde sehnat nebo ve V12 popraská i ona (listy --skive-fold 0.6)',
      },
    ],
    priceRange: { minCents: 0, maxCents: 0 },
    priceSource: 'unknown',
    priceNote:
      'Cenu zatím nemáme odkud vzít: ověřený obchod s pevnou třísločiněnou usní 0,8 v potřebném kusu nemáme.',
    alsoUsedFor: [],
    examples: [],
    commonlyAtHome: false,
    media: [],
  }),

  draft({
    slug: 'thin-goatskin',
    name: 'Kozinka třísločiněná 0,6–0,9 mm (přepážky a podšívka)',
    englishName: 'Thin veg-tan goatskin',
    category: 'material',
    shortDescription:
      'Tenké přepážky D1 a D2 a podšívka jazýčku L1. Dvě barvy, aby bylo vidět, kam patří karta a kam bankovka.',
    purpose:
      'Přepážka D1 (dno karet, přepážka karty / bankovky) a podšívka L1 jsou z nebarvené kozinky, přepážka D2 (stěna sloupců mincí) z čokoládové. Kontrast světlé a tmavé přepážky zmenšuje riziko, že se karta omylem zasune do oddílu bankovek k magnetu (riziko R4).',
    buyingGuide: [
      { label: 'Činění', value: 'třísločiněná kozinka' },
      {
        label: 'Tloušťka',
        value:
          'nejlépe 0,7–0,8 mm, nejvýš 0,92 mm (silnější přepážky generátor listů odmítne); po dodání změřit',
      },
      {
        label: 'Množství',
        value:
          'nebarvená: 2 × D1 93 × 79,5 mm a 3 × L1 24 × 22 mm (obchod prodává jen celé listy, nejmenší 0,55 m² vystačí mnohonásobně), čokoládová 5 dm² (2 × D2 103 × 64 mm)',
      },
    ],
    cautions: [
      'Listy peněženky se generují pro změřenou tloušťku přepážek (přepínač --divider, zadává se větší z D1 a D2) a podšívky (--lining). Čísla v postupu se pak berou z rámečku „Čísla pro postup“ na listu 4.',
      'Kus silnější než 0,92 mm na přepážku nepoužijte: vyřízněte díl z tenčího místa, nebo kupte tenčí kozinku.',
      'Nebarvenou kozinku nejvýš 0,9 mm česká nabídka k 7. 10. 2026 nemá: nebarvená kozinka ze Šijeme z kůže je teď 0,8–1,3 mm a CraftPoint kozinku nevede. Proto příklad z Lederversand Berlin (Německo). Ceny jsou v eurech včetně německé DPH 19 %; jestli se pro českého zákazníka přepočítají na 21 %, ověřte v košíku.',
      'U čokoládové kozinky do poznámky k objednávce: kusy nejvýš 0,9 mm, nejlépe 0,7–0,8 mm. Jestli je čistě třísločiněná, ověřit u prodejce.',
    ],
    avoid: [],
    alternatives: [],
    // Nebarvená: list 0,45 m² z 2. jakosti (27,00 €) až list 0,55 m² z 1. jakosti (38,50 €),
    // Lederversand Berlin, ověřeno 7. 10. 2026; přepočet kurzem ČNB 24,430 Kč/€ ze 7. 10. 2026.
    // Čokoládová: 5 dm² × 13,50 (Šijeme z kůže, ověřeno 29. 9. 2026).
    priceRange: { minCents: 72_711, maxCents: 100_806 },
    priceSource: 'verified',
    priceNote:
      'Rozsah odpovídá ověřeným nabídkám (viz příklady níže). Před nákupem ověřte. Nebarvená kozinka: celý list 27,00 € (2. jakost) až 38,50 € (1. jakost), v korunách přepočteno kurzem ČNB ze 7. 10. 2026 (24,430 Kč/€), orientačně. Poštovné do Česka 16,99 € (Economy, objednávka do 99,99 €) nebo 19,99 € (DHL) se nepočítá. Čokoládová 5 dm² (67,50 Kč) ze Šijeme z kůže, bez poštovného (poštovné neověřené).',
    alsoUsedFor: [],
    examples: [
      {
        title:
          'Ziegenleder pflanzlich gegerbt natur-braun 0,6–0,8 mm #z125 (kozinka třísločiněná, nebarvená)',
        shop: 'Lederversand Berlin',
        url: 'https://www.lederversand-berlin.de/Ziegennappa-z125',
        variant: 'list 0,55 m²',
        priceCents: 94_056,
        foreignPrice: '38,50 €',
        priceNote:
          'za celý list 38,50 € (s německou DPH 19 %), přepočet kurzem ČNB ze 7. 10. 2026 orientačně; poštovné do Česka 16,99 € (Economy) nebo 19,99 € (DHL). Větší listy 0,60–0,75 m² za 42,00–52,50 €.',
        note: 'Světlá přepážka D1 a podšívka L1. Podle obchodu třísločiněná a nebarvená. Prodává se jen po celých listech. Po dodání změřit; kusy nad 0,92 mm na přepážku nepoužít.',
        availability: 'in_stock',
        checkedAt: '2026-10-07',
      },
      {
        title: 'Ziegenleder naturell pflanzliche Gerbung ungefärbt 0,6–0,8 mm 2. Sortierung #z125b',
        shop: 'Lederversand Berlin',
        url: 'https://www.lederversand-berlin.de/z125b',
        variant: 'list 0,45 m²',
        priceCents: 65_961,
        foreignPrice: '27,00 €',
        priceNote:
          'za celý list 27,00 € (s německou DPH 19 %), přepočet kurzem ČNB ze 7. 10. 2026 orientačně; poštovné jako u #z125',
        note: 'Levnější varianta: stejná kůže ve 2. jakosti, s viditelnými přírodními vadami (jizvy, štípance od hmyzu). Na malé díly D1 a L1 stačí, vady obejděte.',
        availability: 'in_stock',
        checkedAt: '2026-10-07',
      },
      {
        title: 'Kozinka třísločiněná čokoládová 0,7–0,9 mm',
        shop: 'Šijeme z kůže',
        url: 'https://www.sijemezkuze.cz/kozinka-trislocinena-cokoladova-0-7-0-9-mm-p4851',
        priceCents: 1_350,
        priceNote: 'za dm² (11,16 Kč bez DPH), minimální odběr 5 dm²',
        note: 'Tmavá přepážka D2 v kontrastu k D1. Hranice přepážek klesá s tloušťkou P1 (P1 1,1 → nejvýš 0,80 mm): D2 vyřízněte až po změření P1, z tenčího místa kusu.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'thin-goatskin-main',
        kind: 'photo',
        caption: 'Světlá nebarvená a čokoládová kozinka vedle sebe, posuvka měří tloušťku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'round-punches-8-14',
    name: 'Výsečníky Ø 8, 10, 12 a 14 mm',
    englishName: 'Round hollow punches 8–14 mm',
    category: 'cutting',
    shortDescription:
      'Vyduté konce výřezů peněženky Víčko: napojení jazýčku, výřez pro palec, okénka mincí a okénko bankovek.',
    purpose:
      'Každý vydutý konec výřezu se nejdřív vysekne výsečníkem a teprve pak se k tečnám díry dořízne rovně nožem. Ø 8 dělá vyduté napojení jazýčku na pás (R4), Ø 10 dno výřezu pro palec (R5), Ø 12 konce okének mincí (R6), Ø 14 konce okénka bankovek (R7). Jinou velikost střih nepotřebuje, generátor je vypisuje na listu 1.',
    buyingGuide: [
      { label: 'Typ', value: 'dutý kruhový výsečník na kůži, ne plný průbojník' },
      { label: 'Průměry', value: 'Ø 8, 10, 12 a 14 mm, po jednom kusu' },
    ],
    cautions: [
      'Ø 15 v nabídce CraftPointu není. Okénko bankovek je proto od Kola 11 široké 14 mm pro výsečník Ø 14.',
      'Ostrost a čistotu výseku ověřit na odřezku.',
      'Výsečník Ø 10 poslouží i k podložce s otvorem pro šev S7 (lekce Magnet, podšívka L1 a šev S7).',
    ],
    avoid: [{ title: 'Plný průbojník na kov', reason: 'kůži jen promáčkne, díru neudělá.' }],
    alternatives: [],
    // Ø 8 29 Kč + Ø 10 35 Kč + Ø 12 40 Kč + Ø 14 46 Kč (CraftPoint `.js`, ceny potvrzené 8. 10. 2026).
    priceRange: { minCents: 15_000, maxCents: 15_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Součet čtyř výsečníků Ø 8, 10, 12 a 14 mm, bez poštovného.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 8 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 8 mm',
        priceCents: 2_900,
        priceNote: 'za kus',
        note: 'Vyduté napojení jazýčku na pás víčka (R4).',
        availability: 'in_stock',
        checkedAt: '2026-10-08',
      },
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 10 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 10 mm',
        priceCents: 3_500,
        priceNote: 'za kus',
        note: 'Dno výřezu pro palec v horní hraně přední stěny (R5) a otvor podložky pro šev S7. V době ověření (8. 10. 2026) vyprodaný.',
        availability: 'unavailable',
        checkedAt: '2026-10-08',
      },
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 12 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 12 mm',
        priceCents: 4_000,
        priceNote: 'za kus',
        note: 'Konce dvou okének mincí 12 × 48 mm (R6).',
        availability: 'in_stock',
        checkedAt: '2026-10-08',
      },
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 14 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 14 mm',
        priceCents: 4_600,
        priceNote: 'za kus',
        note: 'Konce okénka bankovek 14 × 45 mm (R7).',
        availability: 'in_stock',
        checkedAt: '2026-10-08',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'round-punches-8-14-main',
        kind: 'photo',
        caption: 'Čtyři výsečníky Ø 8, 10, 12 a 14 mm vedle vyseknutých konců okének na odřezku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'neodymium-magnet',
    name: 'Neodymový magnet Ø 8 mm, axiální',
    englishName: 'Neodymium disc magnet 8 mm',
    category: 'forming',
    shortDescription:
      'Zámek víčka: magnet na konci jazýčku dosedá na plíšek zalepený v přední stěně.',
    purpose:
      'Magnet Ø 8 × 1,5 mm se lepí epoxidem na rub jazýčku, přikryje ho podšívka L1 a obšije šev S7. Protikusem je ocelový plíšek, takže na polaritě nezáleží. Kupují se 3 ks (zkušební kus, finální kus a hledací magnet na nalezení plíšku) a po dvou silnějších a slabších magnetech stejného Ø 8 na výměnu, kdyby víčko na zkušebním kusu drželo slabě nebo moc silně: vyměněný magnet zůstane zalepený na zkušebním kuse, druhý stejný je na finální.',
    buyingGuide: [
      { label: 'Rozměr', value: 'Ø 8 × 1,5 mm (výměna: Ø 8 × 2 silnější, Ø 8 × 1 slabší)' },
      { label: 'Magnetizace', value: 'axiální (póly na plochých stranách)' },
      { label: 'Povrch', value: 'niklovaný' },
      { label: 'Počet', value: '3 ks výchozích + 2 silnější + 2 slabší' },
    ],
    cautions: [
      'Třídu a přídržnou sílu ověřit u prodejce. Odhad pole v návrhu počítá s třídou kolem N42–N52; Ø 8 × 1,5 v této třídě se v prověřených českých obchodech nenašel. Jestli magnet N35 udrží víčko přes mezeru 1,6 mm, ukáže až zkouška Z-1 na zkušebním kusu (ověřit na prototypu).',
      'Síly udávané různými obchody se mezi sebou nedají přímo srovnat, každý je počítá jinak. Rozhodne zkušební kus.',
      'Jiná tloušťka magnetu mění tloušťku peněženky u magnetu: zadejte ji ve formuláři „Listy pro vaši kůži“ na stránce Listy střihu (lekce 11). Když s ní střih neplatí, aplikace listy nevytvoří a napíše proč.',
      'Neodym je křehký: na magnet netlouct paličkou a nepáčit ho ostrou hranou.',
    ],
    avoid: [
      {
        title: 'Magnet s jiným průměrem (třeba Ø 10 × 2)',
        reason:
          'je to jiná záloha s přepočtem; model ji po Kole 6 odmítne, protože vedle Ø 10 se v jazýčku 20 mm nevejde šev S7',
      },
    ],
    alternatives: [],
    // 3 × 4,04 Kč (ELIDIS) až navíc 2 × 4,80 + 2 × 3,40 Kč (Orodian), ověřeno 29. 9. 2026.
    // Jeden obchod na všechny tři rozměry se nenašel (29. 9. 2026): Ø 8 × 1,5 má z prověřených
    // obchodů jen ELIDIS a ten nemá Ø 8 × 1; Orodian, MAGSY ani Unimagnet nemají Ø 8 × 1,5.
    priceRange: { minCents: 1_212, maxCents: 2_852 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} 3 výchozí magnety, případně se dvěma silnějšími a dvěma slabšími na výměnu; bez poštovného. Všechny tři rozměry v jednom obchodě nejsou (29. 9. 2026): Ø 8 × 1,5 má z prověřených obchodů jen ELIDIS, který nemá Ø 8 × 1, a Orodian, MAGSY ani Unimagnet nemají Ø 8 × 1,5. Proto dva obchody a dvoje poštovné: ELIDIS podle stránky DPD 130 Kč bez DPH při platbě převodem nebo online (160 Kč bez DPH na dobírku), osobní odběr v Odoleně Vodě zdarma; Orodian podle stránky Zásilkovna na odběrné místo 69 Kč, na adresu od 99 Kč.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Neodymový magnet válec N35 D8 × 1,5 mm (MNDPR8x1,5)',
        shop: 'ELIDIS',
        url: 'https://magnety.elidis.cz/neodymovy-magnet-valec-n35-d8x1-5mm',
        priceCents: 404,
        priceNote: 'za kus, potřebujete 3',
        note: 'Výchozí magnet Ø 8 × 1,5, niklovaný, skladem 4 588 ks. Věta o směru magnetizace je na stránce neúplná („magnetováno přes rozměr“ bez rozměru), axiální magnetizaci ověřit u prodejce. Síla odtrhu 6,53 N je podle stránky orientační výpočet. Poštovné podle stránky Doprava a osobní odběr: DPD 130 Kč bez DPH (převodem nebo online), 160 Kč bez DPH na dobírku, osobní odběr zdarma. Minimální objednávku ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Neodymový magnet válec N45 D8 × 2 mm (MNDPR8x2N45)',
        shop: 'ELIDIS',
        url: 'https://magnety.elidis.cz/neodymovy-magnet-valec-n45-d8x2mm',
        priceCents: 1_977,
        priceNote: 'za kus',
        note: 'Silnější magnet u ELIDIS (N45), skladem 208 ks. Slabší Ø 8 × 1 ELIDIS nemá, takže do jednoho obchodu se nákup nevejde; silnější magnet je levnější u Orodianu spolu se slabším. Popis na stránce uvádí rozměr D 8 × 1,5 a sílu 6,53 N jako u magnetu 8 × 1,5 a směr magnetizace čitelně neuvádí: rozpor s názvem i magnetizaci ověřit u prodejce.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Neodymový magnet válec 8 × 2 mm – N38',
        shop: 'Orodian',
        url: 'https://orodian.cz/magnet/valec-8x2-n38/',
        priceCents: 480,
        priceNote: 'za kus',
        note: 'Silnější (tlustší) magnet na výměnu. Stránka uvádí axiální magnetizaci (rovnoběžně s výškou) a sílu 0,8 kg, skladem přes 100 000 ks. Poštovné podle stránky Doručení a platba: Zásilkovna na odběrné místo 69 Kč, na adresu od 99 Kč.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Neodymový magnet válec 8 × 1 mm – N38',
        shop: 'Orodian',
        url: 'https://orodian.cz/magnet/neodymovy-magnet-valec-8x1-mm-n38/',
        priceCents: 340,
        priceNote: 'za kus',
        note: 'Slabší (tenčí) magnet na výměnu. Stránka uvádí axiální magnetizaci (rovnoběžně s výškou) a sílu 0,39 kg, skladem přes 50 000 ks. Ø 8 × 1 ELIDIS nenabízí, proto druhý obchod.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Neodymový magnet válec pr. 8 × 1 N 80 °C, VMM6-N40',
        shop: 'MAGSY',
        url: 'https://e-shop.magsy.cz/neodymovy-magnet-valec-pr-8x1-n/',
        priceCents: 300,
        priceNote: 'za kus',
        note: 'Slabší magnet jinde: N40, niklovaný, magnetovaný rovnoběžně s osou, skladem (>5 ks).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Neodymový magnet kotouč Ø 8 mm, v. 2 mm, síla 1 kg (KT-08-02-N)',
        shop: 'Unimagnet',
        url: 'https://www.unimagnet.cz/neodymovy-magnet-kotouc-8-mm-v-2-mm-sila-1-kg_z643/',
        priceCents: 300,
        priceNote: 'za kus',
        note: 'Silnější magnet jinde: N38, poniklovaný. Směr magnetizace u výrobku uvedený není, ověřit u prodejce.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'neodymium-magnet-main',
        kind: 'photo',
        caption: 'Neodymový magnet Ø 8 × 1,5 mm vedle plíšku 14 × 20,5 mm',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'steel-sheet',
    name: 'Pozinkovaný ocelový plech 0,5 mm',
    englishName: 'Galvanised steel sheet 0.5 mm',
    category: 'forming',
    shortDescription:
      'Z něj se vyřízne plíšek K2 14 × 20,5 mm, na který dosedá magnet. Přilepí se na rub přední stěny.',
    purpose:
      'Plíšek je kotva magnetu: leží mezi rubem přední stěny a přepážkou D1 pod dnem karet a obaluje magnet v celém rozsahu poloh víčka. Musí být z magnetické oceli s povrchovou ochranou. Z jedné tabule se vyříznou 2 plíšky (zkušební a finální kus) s velkou rezervou.',
    buyingGuide: [
      { label: 'Materiál', value: 'pozinkovaný ocelový plech (magnetický)' },
      { label: 'Tloušťka', value: '0,5 mm (varianta 0,8 jen podle zkušebního kusu)' },
      { label: 'Kus', value: 'nejmenší tabule stačí, plíšek má 14 × 20,5 mm' },
    ],
    cautions: [
      'Plech vyzkoušejte magnetem už v obchodě. Austenitická nerez je prakticky nemagnetická, nepoužít.',
      'Hrany plíšku zabrousit a přelakovat bezbarvým lakem na nehty: železo s vlhkou třísločiněnou usní dává tmavé skvrny.',
      'Plech 0,75 místo 0,8 by bylo potřeba ověřit na prototypu a tloušťku dosadit do modelu.',
    ],
    avoid: [{ title: 'Nerezový plech', reason: 'austenitická nerez magnet skoro nedrží' }],
    alternatives: [],
    priceRange: { minCents: 8_900, maxCents: 11_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Jedna tabule 250 × 500 × 0,5 mm.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Arcansas pozinkovaný ocelový plech hladký 500 × 250 × 0,5 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/plechy/arcansas-pozinkovany-ocelovy-plech-hladky-500-x-250-x-0-5-mm/p/6110340',
        priceCents: 10_900,
        note: 'Stránka nabízí dodání domů balíkem (doprava 49 Kč) i vyzvednutí v prodejně. Dostupnost v prodejně ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Hladký plech ocel pozinkovaná, 250 × 500 × 0,5 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/plechy/hladky-plech-ocel-pozinkovana-250-x-500-x-0-5-mm/p/5289186',
        priceCents: 11_900,
        note: 'Dodání domů podle stránky teď není možné, jen rezervace a vyzvednutí v prodejně. Dostupnost v prodejně ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Kantoflex hladký plech 250 × 500 × 0,5 mm, pozinkovaná ocel',
        shop: 'BAUHAUS',
        url: 'https://www.bauhaus.cz/kantoflex-hladky-plech-10244804',
        priceCents: 8_900,
        note: 'Podle stránky dostupné online, v odborných centrech nedostupné. Poštovné ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'steel-sheet-main',
        kind: 'photo',
        caption:
          'Tabule pozinkovaného plechu s vyznačeným plíškem 14 × 20,5 mm a magnetem na zkoušku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'hacksaw',
    name: 'Pilka na kov',
    englishName: 'Hacksaw',
    category: 'cutting',
    shortDescription: 'Na vyříznutí plíšku 14 × 20,5 mm z ocelového plechu 0,5 mm.',
    purpose:
      'Plíšek K2 se z tabule plechu vyřízne pilovým listem na kov (v rámu nebo v ruce). Náhradou je plech naříznout nožem u pravítka a v rýze ho zlomit ohýbáním sem a tam (ověřit na odřezku plechu).',
    buyingGuide: [{ label: 'Typ', value: 'malá pilka na kov s pilovým listem' }],
    cautions: [
      'Jestli je pilový list v balení, ověřit na obalu nebo u prodejce.',
      'Otřep a rohy R3 po řezu zabrousit brusným papírem zrnitosti 120 na desce.',
    ],
    avoid: [],
    alternatives: [
      {
        title: 'Naříznout nožem a zlomit',
        reason: 'plech naříznout u pravítka a v rýze zlomit ohýbáním (ověřit na odřezku)',
      },
    ],
    priceRange: { minCents: 10_900, maxCents: 10_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [],
    examples: [
      {
        title: 'LUX-TOOLS Mini pila na kov 250 mm Classic',
        shop: 'OBI',
        url: 'https://www.obi.cz/pilky-a-pilniky/lux-mini-pila-na-kov-250-mm-classic/p/3316536',
        priceCents: 10_900,
        note: 'Pro pilové listy 250 a 300 mm, stránka uvádí list z bimetalu. Jestli je list v balení, ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'hacksaw-main',
        kind: 'photo',
        caption: 'Mini pilka na kov řeže plíšek z tabule plechu upnuté na okraji stolu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'epoxy-glue',
    name: 'Dvousložkový epoxid (rychlý)',
    englishName: 'Two-part epoxy',
    category: 'gluing',
    shortDescription:
      'Přilepí magnet na zdrsněný rub jazýčku. Kontaktní lepidlo na niklu drží špatně.',
    purpose:
      'Magnet se lepí rychlým dvousložkovým epoxidem na zdrsněný rub jazýčku. Podšívka L1 se přes něj lepí kontaktním lepidlem, až když epoxid ztuhne. Před zatížením víčka (zavírání, zkouška držení) se nechá 24 h vytvrdit.',
    buyingGuide: [
      { label: 'Typ', value: 'dvousložkový epoxid, rychletuhnoucí' },
      { label: 'Množství', value: 'nejmenší balení stačí' },
    ],
    cautions: [
      'Časy tuhnutí porovnejte s návodem na obalu.',
      'Přilnavost k niklu magnetu a ke zdrsněné usni ověřit na zkušebním kusu (ověřit na prototypu).',
    ],
    avoid: [],
    alternatives: [],
    priceRange: { minCents: 18_900, maxCents: 18_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Den Braven Tekutý kov 24 ml',
        shop: 'OBI',
        url: 'https://www.obi.cz/lepidla/den-braven-tekuty-kov-24-ml/p/6734214',
        priceCents: 18_900,
        note: 'Stránka ho popisuje jako rychletuhnoucí dvousložkové epoxidové lepidlo hlavně na kovy, ale také na kůže; počáteční schnutí 4–6 min, manipulace 15–30 min, maximální pevnost za 24 h, spoj tmavě šedý. Dostupnost v prodejně ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'epoxy-glue-main',
        kind: 'photo',
        caption: 'Dvousložkový epoxid namíchaný na kartičce vedle magnetu a jazýčku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'digital-caliper',
    name: 'Posuvné měřítko – digitální nebo analogové (s noniem)',
    englishName: 'Caliper',
    category: 'cutting',
    shortDescription:
      'Změří tloušťku dodané kůže, bankovek a vložky dna. Bez něj se listy nedají vygenerovat pro skutečnou kůži.',
    purpose:
      'Peněženka Víčko se počítá z tloušťek: listy se generují pro změřenou tloušťku P1, přepážek a podšívky, vložka dna má mít 1,5 mm a značka magnetu se měří od spodní hrany. Posuvkou se měří i poloha rysky u zkoušky ohybu V12 a rozměry bankovek u papírového modelu.',
    buyingGuide: [
      {
        label: 'Typ',
        value:
          'posuvka digitální nebo analogová (s noniem), rozsah 150 mm (návrh střihu víc nežádá)',
      },
      {
        label: 'Rozlišení',
        value:
          'digitální ukáže 0,01 mm, analogová 0,1 mm (s 20 čárkami nonia 0,05 mm). Setiny se hodí u značky magnetu (okno lepení může mít jen 0,13 mm) a u meze přepážek 0,92 mm – doporučení autora obsahu, ne požadavek návrhu',
      },
    ],
    cautions: [
      'Kůži měřte na několika místech kusu (krok 0 postupu).',
      'Analogová: celé milimetry čtěte na stupnici vlevo od nuly nonia, desetiny u čárky nonia, která se kryje s čárkou stupnice. Ukazuje to animace „Jak měřit posuvkou“ u lekce 1.',
      'Rozložené bankovky jsou delší než 150 mm: délku měřte ocelovým pravítkem, posuvkou jen tloušťku a rozměry složené bankovky.',
    ],
    avoid: [],
    alternatives: [],
    priceRange: { minCents: 89_900, maxCents: 89_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Měření tloušťky kůže u dalších projektů'],
    examples: [
      {
        title: 'Měřítko digitální posuvné, 150 mm (CONNEX)',
        shop: 'UNI HOBBY',
        url: 'https://unihobby.cz/meritko-digitalni-posuvne-150-mm',
        priceCents: 89_900,
        note: 'Rozlišení 0,01 mm, přesnost ±0,03 mm. E-shop skladem, v prodejnách podle stránky po několika kusech. Levnější digitální posuvka poslouží stejně; jinou jsme neověřovali.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'digital-caliper-main',
        kind: 'photo',
        caption: 'Posuvka měří tloušťku kozinky na okraji kusu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'edge-paint',
    name: 'Barva na hrany',
    englishName: 'Edge paint',
    category: 'finishing',
    shortDescription:
      'Kontrastní horní hrana přepážky D1: na první pohled je vidět, kde končí karty a začínají bankovky.',
    purpose:
      'Horní hrana přepážky D1 se natře barvou na hrany v tónu kontrastním k D1 (v tónu D2) párátkem ve 2 tenkých vrstvách. Ústí karet a bankovek jsou těsně za sebou, barevná hrana zmenšuje riziko, že se karta zasune omylem k bankovkám a k magnetu (riziko R4).',
    buyingGuide: [
      { label: 'Tón', value: 'kontrastní k nebarvené D1, blízký čokoládové D2' },
      { label: 'Množství', value: 'nejmenší balení' },
    ],
    cautions: [
      'Přilnavost na hraně kozinky 0,6–0,9 mm ověřit na odřezku.',
      'Shodu tónu s D2 podle fotky v obchodě ověřit nejde.',
      'Mezi vrstvami nechat 20–30 min (ověřit podle návodu barvy).',
    ],
    avoid: [],
    alternatives: [],
    priceRange: { minCents: 26_900, maxCents: 26_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [
      'Obarvení řezaných hran barvené kůže před leštěním (pouzdro s vsazenou mincí, lekce 4, 5, 6 a 8)',
      'Hrany barevného pásku před leštěním (pásek, lekce 2, 3 a 6)',
    ],
    examples: [
      {
        title: "Fiebing's Edge Kote 118 ml – tmavě hnědá",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-tmave-hneda',
        priceCents: 26_900,
        note: 'Nejblíž čokoládové D2. Obchod ji popisuje jako barvu na hrany výrobků z pravé kůže.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: "Fiebing's Edge Kote 118 ml – hnědá",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-hneda',
        priceCents: 26_900,
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: "Fiebing's Edge Kote 118 ml – černá",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-cerna',
        priceCents: 26_900,
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'edge-paint-main',
        kind: 'photo',
        caption: 'Horní hrana světlé přepážky D1 natřená tmavě hnědou barvou na hrany',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'leather-balm',
    name: 'Balzám na kůži',
    englishName: 'Leather balm',
    category: 'finishing',
    shortDescription:
      'Konečná úprava hotové peněženky, hlavně na závěs. Snášenlivost s usní ověřit na odřezku.',
    purpose:
      'Poslední krok peněženky Víčko: tenká vrstva balzámu hlavně na pás závěsu, který se při každém otevření ohýbá. Návrh střihu neurčuje konkrétní přípravek, jen to, že se snášenlivost s usní ověří na odřezku.',
    buyingGuide: [
      { label: 'Typ', value: 'balzám na hladkou třísločiněnou useň' },
      { label: 'Množství', value: 'nejmenší balení' },
    ],
    cautions: [
      'Nejdřív na odřezku ze stejné usně: balzám může useň ztmavit nebo změnit lesk.',
      'Příklad níže obchod popisuje jako přípravek, který jemně tónuje a změkčuje vlákna a který nezajišťuje voděodolnost. Jestli změkčení závěsu nevadí, ověřit na prototypu.',
    ],
    avoid: [],
    alternatives: [],
    priceRange: { minCents: 26_900, maxCents: 26_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Konečná úprava dalších výrobků z třísločiněné usně'],
    examples: [
      {
        title: "Fiebing's Leather Balm With Atom Wax (balzám s voskem) – 118 ml",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-leather-balm-with-atom-wax-balzam-s-voskem-118-ml',
        priceCents: 26_900,
        note: 'Balzám s tekutým voskem. Podle obchodu jemně tónuje, změkčuje vlákna a po vyleštění dává saténový lesk; voděodolnost nezajišťuje.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'leather-balm-main',
        kind: 'photo',
        caption: 'Balzám nanášený hadříkem na pás závěsu hotové peněženky',
        status: 'planned',
      },
    ],
  }),
];
