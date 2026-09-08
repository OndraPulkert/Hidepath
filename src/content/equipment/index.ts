import { type EquipmentCatalog, type EquipmentDefinition } from '@/content/schema';

/**
 * Katalog vybavení. Texty jsou NÁVRH (reviewStatus: draft) – před publikací projdou korekturou
 * někoho, kdo kůži šije. Ceny jsou orientační rozsahy podle prototypu a ověření z 2026-09-04
 * (docs/content/notes-vybaveni.md); žádné odkazy na obchody.
 */

const VERIFIED_NOTE =
  'Rozsah odpovídá ověřeným nabídkám českých e-shopů (viz příklady níže). Před nákupem ověřte.';
const ESTIMATE_NOTE = 'Odhad, zatím bez ověřené nabídky. Před nákupem ověřte.';

const draft = <T extends Omit<EquipmentDefinition, 'reviewStatus'>>(e: T): EquipmentDefinition => ({
  ...e,
  reviewStatus: 'draft',
});

export const equipmentList: readonly EquipmentDefinition[] = [
  draft({
    slug: 'veg-tan-leather',
    name: 'Kůže – třísločiněná hovězina 1,2–1,5 mm',
    englishName: 'Veg-tan leather',
    category: 'material',
    shortDescription: 'Z ní pouzdro vzniká. Tloušťka 1,2–1,5 mm se dobře řeže i šije a drží tvar.',
    purpose:
      'Třísločiněná (vegetabilně činěná) hovězina je pevná, drží tvar a dá se u ní zaleštit hrana. Pro pouzdro na karty stačí kus zhruba velikosti A4 a několik odřezků na trénink.',
    buyingGuide: [
      { label: 'Činění', value: 'třísločiněná („veg-tan“), ne chromočiněná' },
      { label: 'Tloušťka', value: '1,2–1,5 mm (karty se vejdou, pouzdro není tlusté)' },
      { label: 'Množství', value: 'přířez A4 na pouzdro + odřezky na trénink' },
      {
        label: 'Barva',
        value:
          'přírodní nebo probarvená v koželužně (např. koňak, whisky); vlastní barvení až na dalších projektech',
      },
    ],
    cautions: [
      'Přířezy A4/A3 v této tloušťce většina obchodů nenabízí v katalogu. Napište prodejci a poptejte přířez; celá kůže stojí tisíce korun.',
      'Na trénink řezu a děrování stačí levné odřezky, i štípenka (spodní vrstva kůže bez líce). Finální díly ale řežte z lícové kůže, štípenka se chová jinak.',
      'Kůže má lícovou (hladkou) a rubovou (vláknitou) stranu. Šablonu kreslete na rub.',
    ],
    avoid: [
      {
        title: 'Chromočiněná měkká kůže',
        reason: 'je poddajná, hrana se nedá zaleštit a pouzdro nedrží tvar',
      },
      {
        title: 'Kůže tlustší než 1,5 mm',
        reason: 'pouzdro bude tuhé a tlusté, dvě vrstvy se hůř děrují a šijí',
      },
      { title: '„Ekokůže“ a koženka', reason: 'jsou to plasty, steh v nich trhá a hrany se drolí' },
    ],
    alternatives: [
      {
        title: 'Odřezky z kožařských dílen',
        reason:
          'na trénink stačí; dílny a obchody je často prodávají po balíčcích za desítky korun',
      },
    ],
    priceRange: { minCents: 35_000, maxCents: 60_000 },
    priceSource: 'estimate',
    priceNote: `${ESTIMATE_NOTE} Cena za přířez zhruba A4 včetně odřezků.`,
    alsoUsedFor: ['Pouzdro na karty', 'Klíčenka', 'Peněženka bifold'],
    examples: [
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – Whisky',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hovezi-licova-kuze-trislocinena-1-2-mm-whisky',
        priceCents: 25_200,
        priceNote: 'základní cena; přířezy A5–A2 se prodávají zvlášť, cena podle velikosti',
        note: 'Lícová kůže 1,2 mm probarvená do odstínu whisky, tedy spodní hranice doporučené tloušťky. Na pouzdro stačí A4. V době ověření byly všechny velikosti vyprodané.',
        availability: 'unavailable',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Kožené odřezky – štípenka 1,5–2,2 mm',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/kozene-odrezky-stipenka/',
        priceCents: 3_500,
        priceNote: 'za 100 g',
        note: 'Jen na trénink řezu, děrování a stehu (lekce 1–4). Na finální díly ne, štípenka se chová jinak než lícová kůže.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'veg-tan-leather-main',
        kind: 'photo',
        caption: 'Přířez přírodní třísločiněné kůže, povrch lícové strany zblízka',
        status: 'planned',
      },
      {
        id: 'veg-tan-leather-back',
        kind: 'photo',
        caption: 'Rubová vláknitá strana kůže vedle lícové pro srovnání',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'utility-knife',
    name: 'Odlamovací nůž s novou čepelí',
    englishName: 'Utility knife',
    category: 'cutting',
    shortDescription:
      'Na rovné řezy kůže. Stačí kvalitní odlamovací nůž, kožařský nůž nepotřebujete.',
    purpose:
      'Rovné řezy podél pravítka. Odlamovací nůž má vždy ostrou čepel po odlomení segmentu, což je pro začátečníka důležitější než tvar nože.',
    buyingGuide: [
      { label: 'Šířka čepele', value: '18 mm (tuhá, neohýbá se)' },
      { label: 'Zámek', value: 'pevná aretace čepele, ne posuvník bez zámku' },
      { label: 'Čepele', value: 'balení náhradních; na kůži tupí rychle' },
    ],
    cautions: [
      'Tupá čepel je nebezpečnější než ostrá: klouže a vyžaduje sílu. Odlamujte segment při prvním zadrhnutí.',
      'Řežte na dva až tři lehké tahy, ne na jeden silový.',
    ],
    avoid: [
      { title: 'Nůž s úzkou čepelí 9 mm', reason: 'čepel se při řezu kůže ohýbá a řez uteče' },
      {
        title: 'Kožařský (ševcovský) nůž na první projekt',
        reason: 'vyžaduje broušení a cvik; přijde vhod až u tvarovaných řezů',
      },
    ],
    alternatives: [
      { title: 'Nůž, který už máte doma', reason: 'stačí, pokud má 18 mm čepel a nové segmenty' },
      {
        title: 'Modelářský nůž (skalpel) jako doplněk',
        reason:
          'na zaoblené rohy a drobné detaily; na dlouhé rovné řezy podél pravítka je odlamovací nůž lepší',
      },
    ],
    priceRange: { minCents: 6_900, maxCents: 25_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Nůž na kůži s odlamovací čepelí 18 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/nuz-na-kuzi-s-odlamovaci-cepeli-18mm',
        priceCents: 6_900,
        note: 'Kovové tělo, 18 mm čepel. Náhradní čepele (10 ks) prodává obchod zvlášť za 35 Kč.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: true,
    media: [
      {
        id: 'utility-knife-main',
        kind: 'photo',
        caption: 'Odlamovací nůž s 18 mm čepelí ležící na řezací podložce',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'steel-ruler',
    name: 'Kovové pravítko 30 cm',
    englishName: 'Steel ruler',
    category: 'cutting',
    shortDescription: 'Vede čepel při řezu. Plastové pravítko nůž poškodí a zkřiví řez.',
    purpose:
      'Vodicí hrana pro nůž a měřítko pro šablonu. Ocel čepel nepoškodí a hrana zůstane rovná.',
    buyingGuide: [
      { label: 'Materiál', value: 'ocel nebo nerez; hliník se poškrábe a zubatí' },
      { label: 'Délka', value: '30 cm stačí na pouzdro i peněženku' },
      { label: 'Spodní strana', value: 'protiskluzová (korek nebo guma) je velká výhoda' },
    ],
    cautions: [
      'Pravítko držte prsty dál od hrany, po které jede čepel.',
      'Před řezem zkontrolujte, že se pravítko nepohnulo. Jeden zkušební tah bez tlaku.',
    ],
    avoid: [
      { title: 'Plastové pravítko', reason: 'čepel ho ořeže a další řezy už nejsou rovné' },
      { title: 'Skládací metr', reason: 'nemá pevnou vodicí hranu' },
    ],
    alternatives: [
      {
        title: 'Ocelové pravítko z papírnictví nebo hobbymarketu',
        reason: 'není třeba speciální kožařské',
      },
    ],
    priceRange: { minCents: 6_000, maxCents: 22_400 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Řezací pravítko s protiskluzovou vložkou 30 cm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/rezaci-pravitko-s-protiskluzovou-vlozkou-20cm-30cm',
        priceCents: 22_400,
        note: 'Kov s gumovou vložkou, nepodjíždí. Dražší než pravítko z papírnictví, ale drží na kůži. V době ověření vyprodané.',
        availability: 'unavailable',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: true,
    media: [
      {
        id: 'steel-ruler-main',
        kind: 'photo',
        caption: 'Ocelové pravítko 30 cm položené na kůži, hrana připravená pro řez',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'cutting-mat',
    name: 'Řezací podložka A3',
    englishName: 'Cutting mat',
    category: 'cutting',
    shortDescription: 'Chrání stůl a čepel. A3 stačí na všechny první projekty.',
    purpose:
      'Samohojivá podložka pod řezání. Chrání stůl, neotupuje čepel a mřížka pomáhá s rovnými řezy.',
    buyingGuide: [
      { label: 'Velikost', value: 'A3 (45 × 30 cm); kůži nejdřív hrubě nařežete na menší kusy' },
      { label: 'Typ', value: 'samohojivá, oboustranná' },
    ],
    cautions: [
      'Na podložce nikdy netlučte vidličky. Hroty ji rozsekají a samohojivá vrstva se zničí. Pod děrování patří tvrdá deska.',
      'Neskladujte ji stočenou ani na slunci, zkroutí se.',
    ],
    avoid: [
      {
        title: 'Kartón nebo dřevěné prkénko na řezání',
        reason: 'čepel se rychle otupí a řez uteče',
      },
    ],
    alternatives: [
      { title: 'Podložka A4 z papírnictví', reason: 'na pouzdro stačí, na peněženku už bude malá' },
    ],
    priceRange: { minCents: 20_000, maxCents: 40_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Oboustranná samoobnovovací řezací podložka A3',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/oboustranna-samoobnovovaci-rezaci-podlozka-a3-craftpoint',
        priceCents: 19_500,
        note: 'Pracovní plocha 43 × 28 cm, oboustranná.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'cutting-mat-main',
        kind: 'photo',
        caption: 'Řezací podložka A3 s mřížkou, na ní kůže a pravítko',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'punching-board',
    name: 'Tvrdá deska pod děrování',
    englishName: 'Punching board (HDPE)',
    category: 'stitching',
    shortDescription:
      'Pod kůži při děrování. Chrání hroty vidliček i stůl a nahrazuje řezací podložku.',
    purpose:
      'Při děrování se hroty prorazí skrz kůži a musí do něčeho tvrdého, ale ne kovového. Plastová deska (HDPE, prkénko) hroty nezničí a zvuk úderu je tlumený.',
    buyingGuide: [
      { label: 'Materiál', value: 'HDPE / PE plast, tloušťka 8–20 mm' },
      { label: 'Velikost', value: 'aspoň 20 × 30 cm' },
    ],
    cautions: [
      'Nikdy neděrujte přímo na řezací podložce ani na stole.',
      'Pod desku dejte něco těžkého a tlumícího, třeba složený ručník; úder je pak přesnější a tišší.',
    ],
    avoid: [{ title: 'Kovová nebo kamenná deska', reason: 'hroty vidliček se otupí nebo zlomí' }],
    alternatives: [
      {
        title: 'Plastové kuchyňské prkénko (HDPE/PE)',
        reason:
          'z hobbymarketu, IKEA nebo domácnosti; bílé, hladké, aspoň 8 mm silné; přesně ten materiál, co se pod děrování používá',
      },
      {
        title: 'Silný odřezek kůže 4 mm a víc',
        reason: 'tradiční řešení; položte ho na tvrdý podklad',
      },
    ],
    priceRange: { minCents: 5_000, maxCents: 74_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Horní hranice je profesionální pryžová podložka; začátečníkovi stačí spodní.`,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'LEGITIM kuchyňské prkénko, bílé, 34 × 24 cm, 8 mm',
        shop: 'IKEA',
        url: 'https://www.ikea.com/cz/cs/p/legitim-kuchynske-prkenko-bila-90202268/',
        priceCents: 5_900,
        note: 'Polyetylenové prkénko, přesně ten materiál, co se pod děrování používá. 8 mm stačí na tenkou kůži; položte ho na pevný stůl, ne na řezací podložku.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Podložka (prkénko) pro děrování',
        shop: 'Šijeme z kůže',
        url: 'https://www.sijemezkuze.cz/podlozka-prkenko-pro-derovani-p1507',
        priceCents: 6_000,
        note: 'Levná plastová deska určená přímo pod děrování. Na první projekt stačí; rozměry obchod neuvádí.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Děrovací podložka OKA – M (20 × 15 cm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/derovaci-podlozka-oka-m',
        priceCents: 73_900,
        note: 'Pryžová podložka z Japonska, která tlumí úder a šetří hroty vidliček. Profesionální volba, na první projekt zbytečně drahá.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: true,
    media: [
      {
        id: 'punching-board-main',
        kind: 'photo',
        caption: 'Bílá HDPE deska na stole, na ní odřezek kůže a vidličky připravené k úderu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'stitching-chisels',
    name: 'Děrovací vidličky 3,85–4 mm',
    englishName: 'Pricking irons / stitching chisels',
    category: 'stitching',
    shortDescription: 'Prorazí řadu pravidelných otvorů pro steh. Bez nich nejde ručně šít rovně.',
    purpose:
      'Děrovací vidličky vytlačí do kůže řadu šikmých otvorů ve stejné rozteči. Sedlářský steh se pak šije právě těmito otvory, takže je rovný a pravidelný bez cviku. Použijete je na každém šitém projektu.',
    buyingGuide: [
      {
        label: 'Rozteč',
        value: '3,85 nebo 4 mm (rozdíl začátečník nepozná; k oběma patří nit 0,6 mm)',
      },
      { label: 'Sada', value: '2 hroty na rohy + 4 nebo 6 hrotů na rovné úseky' },
      { label: 'Tvar hrotu', value: 'diamantový nebo šikmý „francouzský“, leštěný' },
      { label: 'Materiál', value: 'nástrojová ocel, ne pozink' },
      { label: 'Podložka', value: 'tvrdý plast (HDPE) pod kůži, ne řezací podložka' },
    ],
    cautions: [
      'Rozteč se udává různě: 3,85 mm mezi hroty odpovídá asi 7 stehům na palec. Neplést s šířkou hrotu.',
      'Neleštěné hroty kůži trhají místo řezání a steh je pak roztřepený.',
      'Tlučte paličkou, ne kovovým kladivem. Hroty se jinak ohnou.',
      'Kupte obě velikosti (2 a víc hrotů). S jednou velikostí rohy nevyjdou.',
    ],
    avoid: [
      {
        title: 'Sedlářské kolečko + šídlo',
        reason: 'pro začátečníka pomalé a nepravidelné, hodí se až později',
      },
      {
        title: 'Vidličky s plochými širokými hroty (lacing chisel)',
        reason: 'jsou na tkanice, ne na šití; otvory jsou příliš velké',
      },
      {
        title: 'Rozteč 3 mm s nití 0,6 mm',
        reason:
          'k jemné rozteči patří tenčí nit 0,4–0,5 mm; pro první projekt zůstaňte u 3,85–4 mm a 0,6 mm',
      },
      { title: 'Sady s jediným hrotem', reason: 'otvory nevyjdou rovnoměrně' },
    ],
    alternatives: [
      {
        title: 'Poloviční sada 2 + 4 hroty',
        reason: 'levnější; rovné úseky děrujete na více úderů',
      },
      {
        title: 'Půjčit si na první projekt',
        reason: 'kožařské dílny a kurzy někdy půjčují; ověřte rozteč',
      },
    ],
    priceRange: { minCents: 34_000, maxCents: 120_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Levné sady 4 mm od ~340 Kč; přesně 3,85 mm bývá výrazně dražší.`,
    alsoUsedFor: ['Pouzdro na karty', 'Peněženka bifold', 'Pásek na hodinky'],
    examples: [
      {
        title: 'Děrovače na švy 4 mm – sada 4 kusů',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/derovace-na-svy-4mm-sada-4-kusu',
        priceCents: 33_800,
        note: 'Sada 1 + 2 + 4 + 6 hrotů, rozteč 4 mm. K niti 0,6 mm sedí. Levná varianta pro první projekt.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'stitching-chisels-main',
        kind: 'photo',
        caption: 'Sada děrovacích vidliček se 2 a 6 hroty položená na kůži',
        status: 'planned',
      },
      {
        id: 'stitching-chisels-tips',
        kind: 'photo',
        caption: 'Detail leštěných hrotů vidliček zblízka, viditelný šikmý tvar',
        status: 'planned',
      },
      {
        id: 'stitching-chisels-in-use',
        kind: 'photo',
        caption: 'Vidličky držené kolmo na kůži, palička nad nimi, ruka mimo dráhu úderu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'harness-needles',
    name: 'Sedlářské jehly',
    englishName: 'Harness needles',
    category: 'stitching',
    shortDescription:
      'Jehly s tupou (poloostrou) špičkou a velkým očkem. Šije se dvěma najednou, kupte čtyři.',
    purpose:
      'Sedlářský steh se šije dvěma jehlami proti sobě. Tupá špička projde předem proraženým otvorem a nezachytí vlákna kůže ani nit druhé jehly.',
    buyingGuide: [
      { label: 'Typ', value: 'sedlářské, tupé (harness needles)' },
      {
        label: 'Velikost',
        value: 'k niti 0,6 mm tenčí velikost (např. John James 004, Ø 0,86 mm)',
      },
      { label: 'Počet', value: '4 kusy – šijete dvěma, dvě do zálohy' },
    ],
    cautions: [
      'U jehel John James platí: vyšší číslo = tenčí jehla. Velikost 1/0 je na silnou nit 0,8–1 mm.',
      'Jehla se při protahování otvorem občas ohne. Nerovnejte ji, vyměňte.',
    ],
    avoid: [
      {
        title: 'Ostré šicí jehly z galanterie',
        reason: 'propíchnou nit druhé jehly a poškodí kůži',
      },
      { title: 'Jehly s malým očkem', reason: 'voskovaná nit 0,6 mm se do nich nenavlékne' },
    ],
    alternatives: [],
    priceRange: { minCents: 4_000, maxCents: 12_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Jednotlivě kolem 15 Kč za kus.`,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'Sedlářské jehly John James velikost 004',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sedlarske-jehly-john-james-velikost-004',
        priceCents: 1_500,
        priceNote: 'za kus, kupte 4',
        note: 'Délka 48 mm, Ø 0,86 mm, poloostrá špička – správná velikost k niti 0,6 mm.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Jehly sedlářské tupé, Ø 1,0 mm, 6–7 cm',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/jehly-sedlarske-tupe/',
        priceCents: 1_000,
        priceNote: 'za kus, kupte 4',
        note: 'Bez značky, tupá špička. Pro nit 0,6 mm zvolte nejtenčí průměr 1,0 mm; otvorem od vidliček 4 mm projde s mírně větším odporem než John James 004.',
        availability: 'in_stock',
        checkedAt: '2026-09-08',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'harness-needles-main',
        kind: 'photo',
        caption: 'Dvě sedlářské jehly s navlečenou nití, detail očka a tupé špičky',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'waxed-thread',
    name: 'Voskovaná nit 0,6 mm',
    englishName: 'Waxed thread',
    category: 'stitching',
    shortDescription:
      'Polyesterová voskovaná nit drží uzly a neroztřepí se. Přibližně 0,6 mm sedí k rozteči 3,85–4 mm.',
    purpose:
      'Nit pro sedlářský steh. Vosk drží steh utažený, chrání ho před vlhkostí a nit se neroztřepí při protahování otvory.',
    buyingGuide: [
      {
        label: 'Tloušťka',
        value: '0,6 mm (k rozteči 3,85–4 mm; pro jemnější rozteč patří tenčí nit)',
      },
      { label: 'Materiál', value: 'splétaný voskovaný polyester' },
      { label: 'Délka', value: '20 m stačí na pouzdro i trénink' },
      { label: 'Barva', value: 'tmavší schová nepřesnosti prvních stehů' },
    ],
    cautions: [
      'Na šev počítejte délku asi 4× délky švu; tři šité strany pouzdra měří dohromady asi 18 cm, s rezervou tedy zhruba 1 m nitě.',
      'Tlustší nit (0,8 mm) do otvorů 3,85–4 mm nejde a steh vypadá přeplněný.',
    ],
    avoid: [
      { title: 'Nevoskovaná šicí nit', reason: 'roztřepí se a steh povolí' },
      { title: 'Lněná nit bez vosku', reason: 'krásná, ale vyžaduje voskování a víc cviku' },
    ],
    alternatives: [],
    priceRange: { minCents: 4_000, maxCents: 25_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Malé cívky 20 m od ~40 Kč; velké cívky dražší.`,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'Nitě Slam – béžová, 0,6 mm, 20 m',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/nite-slam-bezova-beige-20m',
        priceCents: 4_100,
        note: 'Splétaný voskovaný polyester C.T.Point; vyberte tloušťku 0,6 mm. Tmavší odstín schová první nepřesnosti. V době ověření vyprodané.',
        availability: 'unavailable',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Voskované polyesterové nitě 0,65 mm, 67 m',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/voskovane-polyesterove-nite-0-65mm/',
        priceCents: 18_900,
        note: 'Kulatá voskovaná nit, 28 barev, výrobce neuvedený. Třikrát víc metrů než malá cívka Slam; vyplatí se, pokud počítáte s dalšími projekty. Tmavší odstín schová první nepřesnosti.',
        availability: 'in_stock',
        checkedAt: '2026-09-08',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'waxed-thread-main',
        kind: 'photo',
        caption: 'Cívka voskované nitě 0,6 mm v přírodní barvě vedle hotového stehu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'mallet',
    name: 'Palička',
    englishName: 'Maul / mallet',
    category: 'stitching',
    shortDescription:
      'Na vidličky se tluče paličkou z plastu, gumy nebo syrové kůže, kovové kladivo hroty zničí.',
    purpose:
      'Tlumený úder do děrovacích vidliček. Palička z plastu, gumy nebo syrové kůže chrání hroty i sluch.',
    buyingGuide: [
      {
        label: 'Materiál hlavy',
        value: 'gumová nebo plastová (poly, nylon); syrová kůže je luxus',
      },
      { label: 'Hmotnost', value: 'lehčí, kolem 250–400 g; těžká palička unavuje' },
    ],
    cautions: [
      'Gumová palička trochu odskakuje; udeřte jednou pevně, ne mnohokrát lehce.',
      'Tlučte kolmo. Šikmý úder ohne hroty a otvory nevyjdou v řadě.',
    ],
    avoid: [{ title: 'Kovové kladivo', reason: 'zničí hroty vidliček a dělá ostré rány' }],
    alternatives: [
      { title: 'Gumová palička z hobbymarketu', reason: 'nejlevnější funkční varianta' },
    ],
    priceRange: { minCents: 11_000, maxCents: 60_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'Palička gumová malá',
        shop: 'Sklad Kůžetvůrce',
        url: 'https://www.skladkuzetvurce.cz/kuzetvorba/Palicka-gumova-mala-d93.htm',
        priceCents: 11_200,
        note: 'Nejlevnější funkční varianta. Guma trochu odskakuje, udeřte jednou pevně.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Horizontální palička na kůži (nylon, 380 g)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        priceCents: 51_000,
        note: 'Nylonová hlava hroty nezničí a neodskakuje. Investice, která vydrží; na první projekt není nutná.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'mallet-main',
        kind: 'photo',
        caption: 'Kožařská palička ležící na stole vedle vidliček',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'contact-cement',
    name: 'Kontaktní lepidlo na kůži',
    englishName: 'Contact cement',
    category: 'gluing',
    shortDescription:
      'Přidrží díly u sebe před děrováním, aby se neposunuly. Jde nahradit oboustrannou páskou.',
    purpose:
      'Před děrováním dvou vrstev je potřeba díly spojit, aby otvory prošly oběma přesně. Lepidlo drží jen pomocně, pevnost dává steh.',
    buyingGuide: [
      {
        label: 'Typ',
        value:
          'kontaktní na vodní bázi (nanáší se na obě plochy, chvíli odvětrá, přitiskne); rozpouštědlové jen jako nouzovka',
      },
      { label: 'Množství', value: 'malá tuba 35–50 ml vydrží na několik projektů' },
    ],
    cautions: [
      'Dejte přednost lepidlu na vodní bázi: nemá výpary a přebytek se smyje vodou. Rozpouštědlová lepidla (často s toluenem) používejte jen v dobře větrané místnosti, s aplikátorem, ne prsty.',
      'Lepidlo nanášejte jen do pásu podél hrany, kde půjde steh. Na líci kůže je skvrna nevratná.',
    ],
    avoid: [
      { title: 'Vteřinové lepidlo', reason: 'ztvrdne, zkřehne a na líci udělá skvrnu' },
      { title: 'Tavná pistole', reason: 'vrstva je tlustá a vidličky ji neprorazí čistě' },
    ],
    alternatives: [
      {
        title: 'Oboustranná páska 5 mm',
        reason: 'čisté a bez zápachu; pod stehem občas lepí na jehlu',
      },
    ],
    priceRange: { minCents: 7_000, maxCents: 31_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Pouzdro na karty', 'Peněženka bifold'],
    examples: [
      {
        title: "Fiebing's Leather Craft Cement 118 ml",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-leather-craft-cement-lepidlo-na-kuzi-118-ml',
        priceCents: 30_900,
        note: 'Vodní báze, bez výparů, přebytek se smyje vodou. Doporučená volba; dražší než rozpouštědlová lepidla.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Pattex Butapren bezbarvý 35 ml',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/pattex-butapren-bezbarvy-35-ml',
        priceCents: 6_900,
        note: 'Rozpouštědlové kontaktní lepidlo. Levné a drží okamžitě, ale zapáchá a vyžaduje větrání. Až druhá volba.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'contact-cement-main',
        kind: 'photo',
        caption: 'Tuba kontaktního lepidla a špachtle, tenký pás lepidla podél hrany kůže',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'sandpaper',
    name: 'Smirkový papír 220–400',
    englishName: 'Sandpaper',
    category: 'finishing',
    shortDescription:
      'Srovná hrany po sešití do jedné roviny před leštěním. Běžný brusný papír z hobbymarketu.',
    purpose:
      'Po sešití dvou vrstev hrany nikdy nelícují dokonale. Jemným brusným papírem na rovné destičce se srovnají do jedné roviny; teprve pak má smysl hrany leštit.',
    buyingGuide: [
      { label: 'Zrnitost', value: '220–400 na srovnání; 600–800 volitelně na dohlazení' },
      { label: 'Množství', value: 'jeden arch stačí na několik projektů' },
    ],
    cautions: [
      'Papír přidržte na rovné destičce (dřevo, tvrdý plast) a hranou po něm tahejte. Volný papír v ruce hranu zaoblí nepravidelně.',
      'Bruste jen do momentu, kdy jsou vrstvy v rovině. Víc ubírá materiál z dílu.',
    ],
    avoid: [{ title: 'Hrubší než 150', reason: 'trhá vlákna kůže a hranu roztřepí' }],
    alternatives: [{ title: 'Pilník na nehty (jemná strana)', reason: 'na malé pouzdro postačí' }],
    priceRange: { minCents: 2_000, maxCents: 5_000 },
    priceSource: 'estimate',
    priceNote: ESTIMATE_NOTE,
    alsoUsedFor: ['Všechny projekty z třísločiněné kůže'],
    examples: [],
    commonlyAtHome: true,
    media: [
      {
        id: 'sandpaper-main',
        kind: 'photo',
        caption:
          'Arch brusného papíru přidržený na dřevěné destičce, hrana pouzdra tažená po papíru',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'edge-burnisher',
    name: 'Pasta na hrany + leštítko',
    englishName: 'Tokonole + burnisher',
    category: 'finishing',
    shortDescription:
      'Zahladí a zaleští řezané hrany. Bez toho pouzdro funguje, ale vypadá nedodělaně.',
    purpose:
      'Hrany třísločiněné kůže se po navlhčení nebo natření pastou třením leštítkem zhutní a zalesknou. Je to poslední krok, který dělá rozdíl mezi „domácí“ a „hotovou“ věcí.',
    buyingGuide: [
      { label: 'Pasta', value: 'Tokonole nebo podobná pasta na hrany, malé balení' },
      { label: 'Leštítko', value: 'dřevěné s drážkami pro různé tloušťky' },
    ],
    cautions: [
      'Před leštěním hrany srovnejte smirkovým papírem 220–400 na rovné destičce.',
      'Pasta na líci kůže zanechá lesklou skvrnu. Pracujte jen na hraně.',
    ],
    avoid: [
      { title: 'Barvy na hrany (edge paint)', reason: 'jiná technika, vyžaduje víc vrstev a cvik' },
    ],
    alternatives: [
      { title: 'Voda a kus plátna nebo hladké dřevo', reason: 'funguje, jen to trvá déle' },
    ],
    priceRange: { minCents: 18_000, maxCents: 45_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Součet pasty a leštítka.`,
    alsoUsedFor: ['Všechny projekty z třísločiněné kůže'],
    examples: [
      {
        title: 'Tokonole 120 ml (Seiwa), přírodní',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/tokonole-120-ml-2',
        priceCents: 33_900,
        note: 'Japonská pasta na hrany, často k vidění ve videonávodech. 120 ml vydrží na mnoho projektů. Přírodní (čirá) verze se hodí na přírodní kůži.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Dřevěné hladítko na hrany',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/drevene-hladitko-na-hrany',
        priceCents: 8_100,
        note: 'Základní dřevěné leštítko s drážkami pro různé tloušťky. Na pouzdro stačí.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Dřevěné hladítko na kůži',
        shop: 'Imago',
        url: 'https://www.imago.cz/drevene-hladitko-na-kuzi',
        priceCents: 9_900,
        note: 'Tvrdé dřevo, čtyři drážky pro různé tloušťky. Pastu na hrany kupte zvlášť.',
        availability: 'preorder',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'edge-burnisher-main',
        kind: 'photo',
        caption: 'Dřevěné leštítko a kelímek pasty na hrany, vedle zaleštěná a nezaleštěná hrana',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'scratch-awl',
    name: 'Rýsovací šídlo (hruška)',
    englishName: 'Scratch awl',
    category: 'cutting',
    shortDescription:
      'Obkreslí šablonu a narýsuje linii stehu na kůži. Ostrá špička nechá jen jemnou stopu.',
    purpose:
      'Kulaté šídlo s ostrou špičkou v hruškovité rukojeti. Obkreslujete jím obrys šablony na rub kůže a rýsujete linii stehu 3,5 mm od hrany. Na rozdíl od tužky nerozmazává a stopa po sešití zmizí.',
    buyingGuide: [
      { label: 'Typ', value: 'kulaté rýsovací šídlo, ne diamantové (to je na propichování stehů)' },
      { label: 'Rukojeť', value: 'hruška – drží se celou dlaní, hrot se nekroutí' },
    ],
    cautions: [
      'Rýsujte lehce, jen viditelnou stopu. Hluboká rýha zůstane vidět i po sešití.',
      'Na líci kůže rýsujte jen linii stehu, kterou steh zakryje. Obrys dílů kreslete na rub.',
      'Hrot je ostrý; odkládejte ho hrotem od sebe nebo zapíchnutý do odřezku.',
    ],
    avoid: [
      { title: 'Propisovačka nebo fix', reason: 'na kůži se rozpije a nejde odstranit' },
      { title: 'Diamantové šídlo na rýsování', reason: 'řeže vlákna a linie se roztřepí' },
    ],
    alternatives: [
      {
        title: 'Tupá sedlářská jehla nebo kancelářská sponka',
        reason: 'na obtažení šablony stačí, drží se hůř',
      },
      { title: 'Tužka na rub kůže', reason: 'na obrys ano, na linii stehu na líci ne' },
    ],
    priceRange: { minCents: 5_000, maxCents: 15_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Sedlářské šídlo hruška',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sedlarske-sidlo-hruska',
        priceCents: 5_200,
        note: 'Ocelový hrot, dřevěná hruška, 11 cm. Na obkreslení šablony a rýsování linie stehu přesně to, co je potřeba.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'scratch-awl-main',
        kind: 'photo',
        caption:
          'Rýsovací šídlo s hruškovitou rukojetí obtahuje okraj papírové šablony na rubu kůže',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'wing-divider',
    name: 'Rýsovací kružítko',
    englishName: 'Wing divider',
    category: 'cutting',
    shortDescription:
      'Vyrýsuje linii stehu ve stálé vzdálenosti od hrany. Nahradí ho pravítko a tupé šídlo.',
    purpose:
      'Jeden hrot vedete po hraně, druhý rýsuje linii ve stálé vzdálenosti (pro pouzdro 3,5 mm). Vidličky pak přiložíte na tuto linii.',
    buyingGuide: [{ label: 'Typ', value: 'kružítko s aretačním šroubem, hroty lehce zatupené' }],
    cautions: [
      'Rýsujte lehce, jen stopu. Hluboká rýha je vidět i po šití.',
      'Kupte kružítko s aretačním šroubem. Bez aretace se rozteč během rýsování posune a linie uteče.',
      'Nastavte 3,5 mm podle pravítka a před rýsováním zkuste na odřezku.',
    ],
    avoid: [
      { title: 'Školní kružítko s tuhou', reason: 'nedrží rozteč a hrot kůži trhá' },
      {
        title: 'Drážkovač (stitching groover) na první projekt',
        reason: 'vyřezává do kůže drážku; u tenké kůže 1,2–1,5 mm ji zeslabí, stačí rýsovaná linie',
      },
    ],
    alternatives: [
      {
        title: 'Pravítko a tupá jehla',
        reason: 'na rovné hrany pouzdra stačí; rohy se dokreslí podle šablony',
      },
    ],
    priceRange: { minCents: 22_400, maxCents: 46_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'Wing divider / sedlářské kružítko 150 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/wing-divider-sedlarske-kruzitko-150-mm',
        priceCents: 22_400,
        note: 'Ocelové kružítko s aretací ramen. Pro první projekt nejlepší poměr ceny a užitku.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Trasovací kružítko CraftPoint 150 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/trasovaci-kruzitko-craftpoint-150-mm',
        priceCents: 42_400,
        note: 'Dražší verze se šroubovým nastavením rozteče. Přesnější, ale pro pouzdro zbytečné.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Kružidlo na značení linií – velké, černěná ocel (152 mm)',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/kruzidlo-na-znaceni-linii-velke/',
        priceCents: 46_000,
        note: 'Tradiční sedlářské kružidlo. Kvalitní, ale nejdražší z trojice.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'wing-divider-main',
        kind: 'photo',
        caption: 'Kovové rýsovací kružítko vedené po hraně kůže, viditelná jemná linie stehu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'edge-beveler',
    name: 'Ořezávač hran',
    englishName: 'Edge beveler',
    category: 'finishing',
    shortDescription: 'Srazí ostrou hranu do oblouku. Pro první projekt stačí hrany jen zaleštit.',
    purpose:
      'Odebere z hrany kůže tenký proužek a zaoblí ji, takže se po zaleštění hrana jeví jako jeden celek. U tenké kůže 1,2–1,5 mm je efekt malý.',
    buyingGuide: [
      {
        label: 'Velikost',
        value: 'nejmenší nabízená (č. 0–1; u značení S/M/L velikost S) pro kůži 1,2–1,5 mm',
      },
    ],
    cautions: ['Vyžaduje ostrý nástroj a cvik; tupý ořezávač hranu trhá.'],
    avoid: [],
    alternatives: [{ title: 'Smirkový papír 400', reason: 'hranu lehce zaoblí bez rizika' }],
    priceRange: { minCents: 30_000, maxCents: 70_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Pásek', 'Peněženka bifold'],
    examples: [
      {
        title: 'Hranořízek (velikost S 0,8 mm / M 1 mm / L 1,2 mm)',
        shop: 'Imago',
        url: 'https://www.imago.cz/hranorizek',
        priceCents: 44_900,
        note: 'Pro kůži 1,2–1,5 mm velikost S nebo M. Až na další projekty.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'edge-beveler-main',
        kind: 'photo',
        caption: 'Ořezávač hran velikosti 1 a odebraný tenký proužek kůže',
        status: 'planned',
      },
    ],
  }),
];

export const equipmentCatalog: EquipmentCatalog = Object.fromEntries(
  equipmentList.map((e) => [e.slug, e]),
);

export function getEquipment(slug: string): EquipmentDefinition {
  const found = equipmentCatalog[slug];
  if (!found) throw new Error(`Neznámé vybavení: ${slug}`);
  return found;
}

export const equipmentCategoryLabels: Record<EquipmentDefinition['category'], string> = {
  material: 'Materiál',
  cutting: 'Řezání a rýsování',
  stitching: 'Šití',
  gluing: 'Lepení',
  finishing: 'Úprava hran',
};
