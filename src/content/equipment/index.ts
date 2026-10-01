import { lidWalletEquipment } from '@/content/equipment/lid-wallet';
import { type EquipmentCatalog, type EquipmentDefinition } from '@/content/schema';

/**
 * Katalog vybavení. Texty jsou NÁVRH (reviewStatus: draft) – před publikací projdou korekturou
 * někoho, kdo kůži šije. Ceny jsou orientační rozsahy podle prototypu a ověření z 2026-09-04
 * (docs/content/notes-vybaveni.md); žádné odkazy na obchody.
 */

const VERIFIED_NOTE =
  'Rozsah odpovídá ověřeným nabídkám českých e-shopů (viz příklady níže). Před nákupem ověřte.';

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
      {
        label: 'Množství',
        value:
          'přířez A4 na pouzdro (oba díly se vejdou i s rezervou) + 2× A5 téže kůže na trénink lekcí 1–4',
      },
      {
        label: 'Barva',
        value:
          'přírodní nebo probarvená v koželužně (např. koňak, whisky); vlastní barvení až na dalších projektech',
      },
    ],
    cautions: [
      'Přířezy A5–A2 v této tloušťce prodává CraftPoint; jinde je často potřeba přířez poptat, celá kůže stojí tisíce korun.',
      'Na trénink řezu a děrování (lekce 1–3) stačí levné odřezky, i štípenka (spodní vrstva kůže bez líce). Na lepení a steh v lekci 4 je lepší tenká třísločiněná – nejjednodušší jsou dvě A5 téže kůže. Finální díly řežte z lícové kůže, štípenka se chová jinak.',
      'Kůže má lícovou (hladkou) a rubovou (vláknitou) stranu. U pouzdra na karty se šablona kreslí na rub; u pouzdra s vsazenou mincí se pás kreslí na líc – kresba je tam pohled zvenku.',
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
    // A4 183–251 Kč podle odstínu + 2× A5 à 57 Kč na trénink (CraftPoint, ověřeno 2026-09-29).
    priceRange: { minCents: 29_700, maxCents: 36_500 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Přířez A4 plus dvě A5 na trénink.`,
    alsoUsedFor: ['Pouzdro na karty', 'Klíčenka', 'Peněženka bifold', 'Pouzdro s mincí'],
    examples: [
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – juchtová (přírodní)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        priceCents: 18_300,
        variant: 'A4 (30 × 21 cm)',
        priceNote: 'větší přířez A3 za 365 Kč',
        note: 'Nejlevnější odstín téže kůže. Na pouzdro A4, na trénink lekcí 1–4 přihoďte 2× A5 – stejná kůže, stejné chování, bez dalšího poštovného. U pouzdra s mincí pro ni platí listy pro kůži 1,2 mm (bez ztenčení ohybu B).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – juchtová (přírodní)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        priceCents: 5_700,
        variant: 'A5 (21 × 15 cm)',
        note: 'Levný přířez na trénink: u pouzdra s mincí na tvarovací zkoušku v lekci 2 (dva kusy 57,5 × 57,5 mm), zkoušku druku v lekci 3 a lepení a steh v lekci 4.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – Blu',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
        priceCents: 25_100,
        variant: 'A4 (30 × 21 cm)',
        priceNote: 'větší přířez A3 za 502 Kč',
        note: 'Modře probarvená lícová useň 1,2 mm. U pouzdra s mincí se do A4 vejde pás těla 240,35 × 104,1 mm (listy pro kůži 1,2 mm, bez ztenčení ohybu B).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – Blu',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
        priceCents: 5_700,
        variant: 'A5 (21 × 15 cm)',
        note: 'Stejná kůže jako pás: do A5 se vejde kapsa 57,5 × 57,5 mm i zkušební proužek na ohyby asi 130 × 40 mm z lekce 5.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – Whisky',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hovezi-licova-kuze-trislocinena-1-2-mm-whisky',
        priceCents: 25_100,
        priceNote: 'A4; A5 57 Kč, A3 502 Kč. Stejné ceny mají odstíny karamelová a t. moro.',
        note: 'Lícová kůže 1,2 mm probarvená do odstínu whisky, tedy spodní hranice doporučené tloušťky. Na pouzdro stačí A4. U pouzdra s mincí pro ni platí listy pro kůži 1,2 mm (bez ztenčení ohybu B).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Kožené odřezky – štípenka 1,5–2,2 mm',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/kozene-odrezky-stipenka/',
        priceCents: 3_500,
        priceNote: 'za 100 g',
        note: 'Jen na trénink řezu a děrování (lekce 1–3). Na lepení a steh v lekci 4 radši dvě A5 třísločiněné; na finální díly ne, štípenka se chová jinak než lícová kůže.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,5 mm – Čokoládová',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-cokoladova-1-5-mm',
        priceCents: 22_300,
        priceNote: 'A4',
        note: 'Horní hranice doporučené tloušťky, barvená. Pro ni jsou výchozí listy pouzdra s mincí (kůže 1,5 mm).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Třísločiněná hovězí lícová kůže 1,2 mm – Verde (lahvová zeleň)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-verde',
        priceCents: 25_100,
        priceNote: 'A4',
        note: 'U pouzdra s mincí odpadá ztenčení ohybu B; platí pro ni listy pro kůži 1,2 mm, stejně jako pro ostatní kůže 1,2 mm z této nabídky.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
      {
        title: 'Sedlářský půlměsíc (head knife, round knife)',
        reason:
          'ikonický půlkruhový nůž z videí umí řez, ztenčování i seřezávání hran v jednom, ale musí být ostrý jako břitva a udržet ho takový je samostatná dovednost. V ČR stojí 1 350–2 700 Kč. Na pouzdro nepřinese nic, co neudělá odlamovací nůž za 69 Kč.',
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
    priceRange: { minCents: 6_800, maxCents: 25_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Nůž na kůži s odlamovací čepelí 18 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/nuz-na-kuzi-s-odlamovaci-cepeli-18mm',
        priceCents: 6_800,
        note: 'Kovové tělo, 18 mm čepel. Náhradní čepele (10 ks) prodává obchod zvlášť za 35 Kč.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
    priceRange: { minCents: 6_000, maxCents: 22_300 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Řezací pravítko s protiskluzovou vložkou 30 cm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/rezaci-pravitko-s-protiskluzovou-vlozkou-20cm-30cm',
        variant: '30 cm',
        priceCents: 22_300,
        note: 'Kov s gumovou vložkou, nepodjíždí. Dražší než pravítko z papírnictví, ale drží na kůži. Varianta 30 cm skladem (29. 9. 2026), 20 cm (137 Kč) vyprodaná.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
    priceRange: { minCents: 19_400, maxCents: 40_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'Oboustranná samoobnovovací řezací podložka A3',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/oboustranna-samoobnovovaci-rezaci-podlozka-a3-craftpoint',
        priceCents: 19_400,
        note: 'Pracovní plocha 43 × 28 cm, oboustranná.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
        note: 'Polyetylenové prkénko, přesně ten materiál, co se pod děrování používá. 8 mm stačí na tenkou kůži; položte ho na pevný stůl, ne na řezací podložku. Online se prodává po dvou kusech, v obchodním domě jednotlivě.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Podložka (prkénko) pro děrování',
        shop: 'Šijeme z kůže',
        url: 'https://www.sijemezkuze.cz/podlozka-prkenko-pro-derovani-p1507',
        priceCents: 6_000,
        note: 'Levná plastová deska určená přímo pod děrování. Na první projekt stačí; rozměry obchod neuvádí.',
        availability: 'in_stock',
        checkedAt: '2026-09-18',
      },
      {
        title: 'Děrovací podložka OKA – M (20 × 15 cm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/derovaci-podlozka-oka-m',
        priceCents: 73_600,
        note: 'Pryžová podložka z Japonska, která tlumí úder a šetří hroty vidliček. Profesionální volba, na první projekt zbytečně drahá.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Podložka řezací Tandy Leather, 15 × 15 cm, 1,3 cm (poundo board)',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/prislusenstvi-naradi/podlozka-rezaci/',
        priceCents: 23_300,
        note: 'Klasická pryžová deska „poundo“ od Tandy. Tlumí úder a šetří hroty; malý formát stačí pod vidličku i výsečník. Verze 30 × 30 cm za 666 Kč jen na dotaz.',
        availability: 'in_stock',
        checkedAt: '2026-09-18',
      },
      {
        title: 'Řezací a děrovací podložka polyuretan, 15 × 15 až 30 × 60 cm, 5 mm',
        shop: 'Corium',
        url: 'https://www.corium.cz/rezaci-a-derovaci-podlozka-polyuretan/',
        priceCents: 29_900,
        note: 'Průhledný vysokohustotní polyuretan, čtyři velikosti. Jen 5 mm silná – pod ni patří pevný stůl. Při ověření na objednávku s dodáním kolem poloviny října.',
        availability: 'preorder',
        checkedAt: '2026-09-18',
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
      'Neleštěné hroty kůži trhají místo řezání a steh je pak roztřepený. Po doručení přitiskněte vidličky rukou na odřezek: hroty mají být v jedné přímce, stejně dlouhé a stopa má být čistý zářez, ne trhaná dírka. Trhané hroty jde doleštit velmi jemným smirkem.',
      'Levné sady 4 mm se stejným složením (1 + 2 + 4 + 6 hrotů) nabízí několik obchodů za 338 až 639 Kč. Podle ceny se u nich kvalita poznat nedá – vyšší cena bývá marží, ne lepší ocelí. Doložitelně lepší nástroj je až kalená francouzská sada, která stojí přes 700 Kč.',
      'Tlučte paličkou, ne kovovým kladivem. Hroty se jinak ohnou.',
      'Kupte obě velikosti (2 a víc hrotů). S jednou velikostí rohy nevyjdou.',
      'Pro pouzdro s mincí musí mít vidličky rozteč přesně 4 mm – s 3,85 mm otvory dna po složení nelícují.',
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
      {
        title: 'Kupovat vidličky po jednom kusu',
        reason:
          'některé obchody je prodávají jednotlivě; na pouzdro stačí dvojhrot a šesti- nebo čtyřhrot, sada s jednohrotem není nutná',
      },
    ],
    priceRange: { minCents: 33_700, maxCents: 120_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Levné sady 4 mm od ~340 Kč; kalené francouzské sady od ~740 Kč.`,
    alsoUsedFor: ['Pouzdro na karty', 'Peněženka bifold', 'Pásek na hodinky', 'Pouzdro s mincí'],
    examples: [
      {
        title: 'Děrovače na švy 4 mm – sada 4 kusů',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/derovace-na-svy-4mm-sada-4-kusu',
        priceCents: 33_700,
        note: 'Sada 1 + 2 + 4 + 6 hrotů, rozteč 4 mm. K niti 0,6 mm sedí. Levná varianta pro první projekt.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Vidličky na děrování nebo značení kůže 4 mm, sada 4 ks',
        shop: 'Kutil-Florenc',
        url: 'https://kutil-florenc.cz/vidlickay-na-derovani-nebo-znaceni-kuze-4-mm-cele-sada-4ks-p5734',
        priceCents: 34_900,
        note: 'Ocel, hroty 1 + 2 + 4 + 6, délka 100 mm – prakticky totéž za 11 Kč víc. Obchod má i kůži a knihařskou kost, takže ušetříte druhou dopravu.',
        availability: 'in_stock',
        checkedAt: '2026-09-09',
      },
      {
        title: 'Sada děrovacích dlátek na kůži 4 mm (1 + 2 + 4 + 6 hrotů)',
        shop: 'Imago',
        url: 'https://www.imago.cz/sada-derovacich-dlatek-na-kuzi-4mm',
        priceCents: 63_900,
        note: 'Stejné složení sady, ale téměř dvojnásobná cena a při ověření jen na objednání.',
        availability: 'preorder',
        checkedAt: '2026-09-09',
      },
      {
        title: 'Děrovací dlátka na kůži 4 mm, sada 4 ks (1 + 2 + 4 + 6 hrotů)',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/derovaci-dlatka-na-kuze-4-mm-sada-4-ks-3/',
        priceCents: 58_500,
        note: 'Při ověření vyprodané. Obchod prodává i třísločiněnou kůži.',
        availability: 'unavailable',
        checkedAt: '2026-09-09',
      },
      {
        title: 'Francouzské děrovače na švy 3,38 mm, sada 3 ks (2 + 5 + 10 hrotů)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/francouzske-derovace-na-svy-3-38-mm-sada-3-ks',
        priceCents: 73_600,
        note: 'Kalená ocel a jemnější rozteč, tedy elegantnější steh. Až jako druhá koupě: menší otvory se na prvním stehu protahují těžko a desetihrot potřebuje pevný stůl.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
        checkedAt: '2026-09-29',
      },
      {
        title: 'Jehly sedlářské tupé (velikosti 1–3, Ø 1,3 / 1,2 / 1,0 mm)',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/jehly-sedlarske-tupe/',
        priceCents: 1_000,
        priceNote: 'za kus',
        note: 'Bez značky. K niti 0,6 mm se hodí jen nejtenčí velikost (Ø 1,0 mm, 6 cm). Při ověření byla skladem jen velikost 1 (7 cm, Ø 1,3 mm), která je na tenkou kůži a nit 0,6 mm příliš silná – v tom případě sáhněte po John James 004.',
        availability: 'unavailable',
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
        title: 'Nitě Slam – béžová, 20 m',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/nite-slam-bezova-beige-20m',
        variant: '0,6 mm',
        priceCents: 4_000,
        note: 'Splétaný voskovaný polyester C.T.Point; vyberte tloušťku 0,6 mm. Tmavší odstín schová první nepřesnosti. Tloušťka 0,6 mm skladem (29. 9. 2026), stejně jako 0,8 mm (42 Kč) a 1,0 mm (44 Kč).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
        title: 'Palička nylonová s výměnnými úderníky 250 g, Yato YT-4631',
        shop: 'INNA-KT (nářadí)',
        url: 'https://www.inna-kt.cz/palicka-nylonova--s-drevenou-nasadou-250-g--yato/',
        priceCents: 21_400,
        note: 'Klempířská palička s bílým nylonovým a červeným polyuretanovým úderníkem Ø 28 mm, 250 g – hmotnost i hlava pro vidličky akorát. Nejlevnější nylonová varianta u nás; prodávají ji desítky obchodů s nářadím (Promistry, ahprofi, motora) za 215–280 Kč.',
        availability: 'in_stock',
        checkedAt: '2026-09-18',
      },
      {
        title: 'Palička s plastovými konci Narex',
        shop: 'Corium',
        url: 'https://www.corium.cz/palicka-s-plastovymi-konci-narex/',
        priceCents: 19_900,
        note: 'Montážní palička českého výrobce s výměnnými plastovými úderníky. Při ověření z externího skladu, počítejte s delším dodáním.',
        availability: 'preorder',
        checkedAt: '2026-09-18',
      },
      {
        title: 'Horizontální palička na kůži (nylon, 380 g)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        priceCents: 50_800,
        note: 'Nylonová hlava hroty nezničí a neodskakuje. Investice, která vydrží; na první projekt není nutná.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
        reason:
          'pro první projekt často lepší volba než lepidlo: neteče, nezapáchá, nemusí zasychat a nemůže potřísnit líc kůže, kde je skvrna nevratná. Nalepí se na rub jen podél hran, kde půjde steh; pod stehem občas lepí na jehlu',
      },
    ],
    priceRange: { minCents: 8_900, maxCents: 31_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena je za lepidlo nebo pásku; špachtle na nanášení (129 Kč) je příslušenství navíc.`,
    alsoUsedFor: ['Pouzdro na karty', 'Peněženka bifold', 'Pouzdro s mincí'],
    examples: [
      {
        title: "Fiebing's Leather Craft Cement 118 ml",
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/fiebings-leather-craft-cement-lepidlo-na-kuzi-118-ml',
        priceCents: 30_900,
        note: 'Vodní báze, bez výparů, přebytek se smyje vodou. Doporučená volba; dražší než rozpouštědlová lepidla.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Špachtle na nanášení lepidla',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/spachtle-na-nanaseni-lepidla',
        priceCents: 12_900,
        note: 'Příslušenství, ne lepidlo: lepidlo se jí rozetře v tenké vrstvě jen do úzkého pruhu u hrany, bez prstů. Do ceny položky se nepočítá.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Pattex Butapren bezbarvý 35 ml',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/pattex-butapren-bezbarvy-35-ml',
        priceCents: 6_900,
        note: 'Rozpouštědlové kontaktní lepidlo. Levné a drží okamžitě, ale zapáchá a vyžaduje větrání. Až druhá volba.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Transparentní oboustranná páska na kůži 5 nebo 10 mm, 50 m',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/transparentni-paska-na-kuzi-oboustranna-5mm-10mm-50mb',
        priceCents: 8_900,
        note: 'Pro pouzdro zvolte šířku 5 mm, aby páska zůstala pod linií stehu a nelepila zevnitř na karty. Při ověření 29. 9. 2026 byly obě šířky skladem (5 mm 89 Kč, 10 mm 119 Kč); podobná úzká oboustranná páska z papírnictví poslouží stejně.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
    name: 'Smirkový papír 180–400',
    englishName: 'Sandpaper',
    category: 'finishing',
    shortDescription:
      'Srovná hrany po sešití a zdrsní líc kůže před lepením. Běžný brusný papír z hobbymarketu.',
    purpose:
      'Dvě práce. Po sešití dvou vrstev hrany nikdy nelícují dokonale – jemným brusným papírem na rovné destičce se srovnají do jedné roviny a teprve pak má smysl je leštit. A před lepením se hrubším papírem zdrsní hladký líc kůže v místě spoje, protože z neporušeného líce kontaktní lepidlo snadno pustí.',
    buyingGuide: [
      {
        label: 'Zrnitost',
        value:
          '180–240 na zdrsnění lepené plochy, 220–400 na srovnání hran, 600–800 volitelně na dohlazení',
      },
      { label: 'Množství', value: 'jeden arch stačí na několik projektů' },
    ],
    cautions: [
      'Na srovnání hran papír přidržte na rovné destičce (dřevo, tvrdý plast) a hranou po něm tahejte. Volný papír v ruce hranu zaoblí nepravidelně.',
      'Na zdrsnění líce naopak papír omotejte kolem úzkého hranolku širokého 1–2 cm a jezděte s ním po kůži ležící na stole. Úzký hranolek udrží zdrsněný pás v mezích.',
      'Bruste jen do momentu, kdy jsou vrstvy v rovině. Víc ubírá materiál z dílu.',
      'Líc zdrsňujte výhradně v místě, které druhý díl zakryje. Matné škrábance na viditelné ploše už nezmizí.',
    ],
    avoid: [{ title: 'Hrubší než 150', reason: 'trhá vlákna kůže a hranu roztřepí' }],
    alternatives: [
      { title: 'Pilník na nehty (jemná strana)', reason: 'na malé pouzdro postačí' },
      {
        title: 'Brusná destička na kůži („brousek“, 100/180)',
        reason:
          'hotová destička s brusnou plochou na obou stranách, drží se lépe než volný arch; hrubší stranu 100 použijte jen na zdrsnění lepené plochy, na hrany je moc hrubá',
      },
    ],
    // Dva archy na plátně (180 + 240) à 11 Kč až brousek 55 Kč (ověřeno 2026-09-29 / 2026-09-09).
    priceRange: { minCents: 2_200, maxCents: 5_500 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Dva archy ve zrnitostech podle projektu (u pouzdra 180 a 240) nebo jeden brousek.`,
    alsoUsedFor: ['Všechny projekty z třísločiněné kůže'],
    examples: [
      {
        title: 'Brusný arch na plátně 230 × 280 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        priceCents: 1_100,
        variant: 'zrnitost 180',
        priceNote: 'za arch',
        note: 'Hrubší z dvojice: zdrsnění lepené plochy dna a kapsy. Plátno se netrhá jako papír.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Brusný arch na plátně 230 × 280 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        priceCents: 1_100,
        variant: 'zrnitost 240',
        priceNote: 'za arch',
        note: 'Jemnější z dvojice: srovnání sešitých hran do roviny před leštěním. Jemnější než 240 obchod v této řadě nemá; na volitelné dohlazení má vodní brusný papír od zrnitosti 800.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Brusný arch na plátně 230 × 280 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        priceCents: 1_100,
        variant: 'zrnitost 120',
        priceNote: 'za arch',
        note: 'Hrubší arch: na kov (otřep a rohy kovového dílu na desce), na hrany kůže je hrubý.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Brusný arch na plátně 230 × 280 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        priceCents: 1_100,
        variant: 'zrnitost 80',
        priceNote: 'za arch',
        note: 'Hrubý arch na ubírání materiálu na hranolku; na hrany kůže je moc hrubý.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Brousek na kůži 18 × 3 cm, zrnitost 100/180',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/brousek-na-kuzi/',
        priceCents: 5_500,
        note: 'Brusná destička se dvěma zrnitostmi – hotová varianta místo archu na destičce. Obchod ji popisuje na obrušování hran před hlazením; strana 100 se hodí i na zdrsnění lepené plochy, na hrany je hrubá.',
        availability: 'in_stock',
        checkedAt: '2026-09-09',
      },
    ],
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
        title: 'Tokonole 120 ml (Seiwa), bezbarvá',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/tokonole-120-ml-2',
        priceCents: 33_900,
        note: 'Japonská pasta na hrany, často k vidění ve videonávodech. 120 ml vydrží na mnoho projektů. Bezbarvá verze zachová přirozený odstín kůže.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Dřevěné hladítko na hrany',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/drevene-hladitko-na-hrany',
        priceCents: 8_000,
        note: 'Základní dřevěné leštítko s drážkami pro různé tloušťky. Na pouzdro stačí.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
        checkedAt: '2026-09-29',
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
    priceRange: { minCents: 22_300, maxCents: 46_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Všechny šité projekty'],
    examples: [
      {
        title: 'Wing divider / sedlářské kružítko 150 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/wing-divider-sedlarske-kruzitko-150-mm',
        priceCents: 22_300,
        note: 'Ocelové kružítko s aretací ramen. Pro první projekt nejlepší poměr ceny a užitku.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Trasovací kružítko CraftPoint 150 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/trasovaci-kruzitko-craftpoint-150-mm',
        priceCents: 42_200,
        note: 'Dražší verze se šroubovým nastavením rozteče. Přesnější, ale pro pouzdro zbytečné.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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
    shortDescription:
      'Srazí ostrou hranu do oblouku, aby po zaleštění vypadala jako jeden celek. Pro první projekt není nutný.',
    purpose:
      'Odebere z hrany tenký proužek a zaoblí ji. Na jedné vrstvě 1,2–1,5 mm je efekt malý, ale na sešité hraně pouzdra (dvě vrstvy, asi 3 mm) je rozdíl vidět: zaoblená hrana se leští rychleji a výsledek je hladší. Bez něj hranu srovnáte smirkem a zaleštíte, jen to dá víc práce.',
    buyingGuide: [
      {
        label: 'Velikost',
        value: 'nejmenší nabízená (č. 0–1; u značení S/M/L velikost S) pro kůži 1,2–1,5 mm',
      },
    ],
    cautions: [
      'Vyžaduje ostrý nástroj a cvik; tupý ořezávač hranu trhá. Levné kusy se často musí nejdřív nabrousit.',
      'Velikost se udává jako šířka záběru, ne tloušťka kůže. Pro sešitou hranu pouzdra (asi 3 mm) sedí záběr kolem 1 mm, u značení S/M/L velikost S.',
      'Před finálním dílem si tah vyzkoušejte na odřezku; jeden příliš hluboký záběr hranu ztenčí nevratně.',
    ],
    avoid: [],
    alternatives: [{ title: 'Smirkový papír 400', reason: 'hranu lehce zaoblí bez rizika' }],
    priceRange: { minCents: 30_000, maxCents: 70_000 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Pouzdro na karty', 'Pásek', 'Peněženka bifold', 'Pouzdro s mincí'],
    examples: [
      {
        title: 'Hranořízek, velikosti 1–4 (záběr 0,8 / 1,0 / 1,2 / 1,4 mm)',
        shop: 'Sedlářské nářadí',
        url: 'https://sedlarskenaradi.cz/hranorizek-velikost-0-8-1-4mm/',
        priceCents: 42_000,
        note: 'Obchod ho popisuje jako vhodný pro tenčí kůže. Pro pouzdro velikost 1 nebo 2; při ověření byla skladem velikost 3 (1,2 mm), která ubere víc.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Hranořízek, velikosti S 0,8 mm / M 1 mm / L 1,2 mm',
        shop: 'Imago',
        url: 'https://www.imago.cz/hranorizek',
        priceCents: 44_900,
        note: 'Pro pouzdro velikost S. Stejná cenová hladina jako u konkurence.',
        availability: 'in_stock',
        checkedAt: '2026-09-07',
      },
      {
        title: 'Hranořízek, velikost M (záběr 1 mm)',
        shop: 'Homago',
        url: 'https://www.homago.cz/p/hranorizek-velikost-m',
        priceCents: 44_900,
        note: 'Prohnuté ostří, takže hrana vyjde zaoblená. Velikost M obchod uvádí pro kůži 1,5–3,5 mm; na jednu vrstvu 1,2 mm sáhněte po menší velikosti.',
        availability: 'in_stock',
        checkedAt: '2026-09-08',
      },
      {
        title: 'Hranořízek ze santalového dřeva, velikosti 1–5',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/hranorizek-ze-santaloveho-dreva-12345',
        priceCents: 56_500,
        note: 'Dražší dřevěná rukojeť. Vyplatí se jen tehdy, když objednáváte u stejného obchodu a nechcete platit druhou dopravu.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
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

  draft({
    slug: 'stitching-pony',
    name: 'Sedlářský koník',
    englishName: 'Stitching pony',
    category: 'stitching',
    shortDescription:
      'Svěrka, která drží díl při šití, aby byly obě ruce volné. Pro pouzdro se dá obejít.',
    purpose:
      'Sedlářský steh se šije dvěma jehlami současně, takže na držení dílu nezbývá ruka. Koník je dřevěná svěrka s čelistmi potaženými kůží: díl se do ní upne a obě ruce zůstanou volné pro jehly. Švy vyjdou rovnoměrněji, protože se díl mezi stehy neposouvá, a práce je výrazně méně únavná. Na dlouhých švech pásku nebo peněženky je to rozdíl znatelný, u pouzdra na karty je nejdelší šev 100 mm a zvládnete ho i mezi koleny.',
    buyingGuide: [
      { label: 'Šířka čelistí', value: 'stačí 6 cm; na pásek je lepší 10 cm a víc' },
      {
        label: 'Uchycení',
        value: 'stolní (šroubem k desce stolu) nebo se sedátkem, na které si sednete',
      },
      { label: 'Čelisti', value: 'potažené kůží nebo koženkou, aby neotlačily líc' },
      { label: 'Magnety', value: 'volitelné, drží jehly při přerušení práce' },
    ],
    cautions: [
      'Utahujte jen tak, aby díl držel. Přetažené čelisti nechají na líci stopu, kterou už nespravíte.',
      'Stolní variantu potřebujete přišroubovat k desce; zkontrolujte, že se rozsah svěrky vejde na vaši tloušťku stolu.',
      'Koník kvalitu stehu sám nezlepší. Rozteč a kolmost otvorů určují vidličky.',
    ],
    avoid: [],
    alternatives: [
      { title: 'Mezi koleny', reason: 'u malých dílů běžná a plně funkční varianta' },
      {
        title: 'Truhlářská svěrka a dvě dřevěné destičky',
        reason: 'díl se sevře mezi destičky a svěrka se upne ke stolu; domácí náhrada za nulu',
      },
      { title: 'Velký kancelářský klip na hraně stolu', reason: 'na krátký šev postačí' },
    ],
    priceRange: { minCents: 69_900, maxCents: 199_900 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: ['Peněženka bifold', 'Pásek', 'Pouzdro na nůž', 'Pouzdro s mincí'],
    examples: [
      {
        title: 'Sedlářský koník s podstavcem',
        shop: 'Kutil-Florenc',
        url: 'https://www.kutil-florenc.cz/sedlarsky-konik-p5764',
        priceCents: 69_900,
        note: 'Nejlevnější ověřená varianta. Podstavec místo šroubování ke stolu.',
        availability: 'in_stock',
        checkedAt: '2026-09-09',
      },
      {
        title: 'Sedlářský koník CraftPoint',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sedlarsky-konik-craftpoint',
        priceCents: 153_400,
        note: 'Dvě polohy uchycení dílu a magnety na jehly po stranách.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Sedlářský koník Ivan Leather, otočné čelisti potažené kůží',
        shop: 'Corium',
        url: 'https://www.corium.cz/sedlarsky-konik/',
        priceCents: 199_900,
        note: 'Čelisti se dají aretovat v libovolné poloze. Upíná se do svěráku pracovního stolu, takže sám o sobě nestojí.',
        availability: 'preorder',
        checkedAt: '2026-09-09',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'stitching-pony-main',
        kind: 'photo',
        caption: 'Sedlářský koník s upnutým dílem pouzdra, obě ruce volné pro jehly',
        status: 'planned',
      },
    ],
  }),
  draft({
    slug: 'safety-skiver',
    name: 'Ztenčovač s vyměnitelnou čepelí (safety skiver)',
    englishName: 'Safety skiver',
    category: 'cutting',
    shortDescription:
      'Seřezává rub kůže u hrany do klínu, aby přehyb nebo lepený spoj neměl schod. U pouzdra na karty se nepoužívá, u pouzdra s mincí ztenčuje celé pásmo přes ohyb B.',
    purpose:
      'Kde se kůže přehýbá nebo lepí přes sebe, vznikne dvojnásobná tloušťka a tuhý schod: okraj kapsy peněženky, přehnutý lem, konec pásku u přezky, nebo – jinak než u hrany – celé pásmo přes ohyb, jako ohyb B pouzdra s mincí. Ztenčovač (skiving) odebírá z rubu tenké hobliny na šířku 5–20 mm od hrany, nebo v pásu přes celou šířku ohybu, takže se dvě vrstvy potkají bez hrbolu a ohyb je poddajnější. Bezpečnostní varianta má žiletkovou čepel v kovovém držáku s dorazem, nebrousí se, jen se mění čepel. U pouzdra na karty není co ztenčovat: vrstvy 1,2 mm se lepí naplocho a hrana se srazí a zaleští jako celek. U pouzdra s mincí ztenčuje celé pásmo ohybu B (asi 16 mm) na 1 mm, aby líc kůže 1,5 mm v ostrém ohybu nepraskal – u kůže 1,2 mm se ztenčení přeskakuje. U prvního pásku se ohyb u přezky záměrně neztenčuje, je to nejvíc namáhané místo a řez je nevratný.',
    buyingGuide: [
      { label: 'Typ', value: 'safety skiver s vyměnitelnou čepelí, ne broušený french skiver' },
      {
        label: 'Čepele',
        value: '3 v balení; přikoupit 10 náhradních, u nás se zvlášť neprodávají',
      },
      { label: 'Materiál', value: 'kovový držák; plastové se kroutí a čepel v nich hraje' },
    ],
    cautions: [
      'Nejdřív na odřezcích: skiver se drží skoro naplocho a odebírá tenké hobliny. První pokusy prořezávají skrz.',
      'Ztenčovat jen tam, kde se kůže přehýbá nebo překrývá. Na volné hraně to průřez jen zeslabí.',
      'Čepel vyměnit, když začne trhat místo řezat. Tupá čepel se zakusuje a vytrhává vlákna.',
    ],
    avoid: [
      {
        title: 'Hranořízek (edge beveler) jako náhrada',
        reason:
          'sráží jen roh hrany, tloušťku kůže nemění; je to jiný nástroj se stejným slovem „skiving“ v názvech obchodů',
      },
      {
        title: 'French skiver na začátek',
        reason:
          'musí se pravidelně brousit na podložce a trénovat úhel; pro první ztenčení je žiletková varianta shovívavější',
      },
    ],
    alternatives: [
      {
        title: 'Řezák s odlamovací čepelí naplocho',
        reason: 'nouzově jde ztenčit i běžným nožem, ale bez dorazu je hloubka nerovnoměrná',
      },
    ],
    priceRange: { minCents: 8_900, maxCents: 56_500 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Levný safety skiver je z AliExpressu (2–4 týdny; od 7/2026 k ceně přičtěte clo 3 € za položku, tedy asi 75 Kč); český obchod má jen french skiver.`,
    alsoUsedFor: [
      'Peněženka bifold',
      'Pásek (přehnutý konec, u dalších kusů)',
      'Lemování tašek',
      'Pouzdro s mincí (ztenčení ohybu B)',
    ],
    examples: [
      {
        title: 'Safety skiver, kovový držák, 3 čepele',
        shop: "AliExpress (Stone's Store)",
        url: 'https://www.aliexpress.com/item/1005007039414652.html',
        priceCents: 8_900,
        note: 'Bezpečnostní ztenčovač s dorazem. Choice, sčítá se s ostatními Choice položkami do dopravy zdarma. Náhradní čepele prodejce zvlášť nemá.',
        availability: 'in_stock',
        checkedAt: '2026-09-17',
      },
      {
        title: 'Náhradní čepele do safety skiveru, 10 ks',
        shop: 'AliExpress',
        url: 'https://www.aliexpress.com/item/1005006851063544.html',
        priceCents: 3_900,
        priceNote: 'za 10 ks',
        note: 'Standardní čepel „safety skiver / safety beveler“, stejný systém sdílí strander na řemínky. Choice.',
        availability: 'in_stock',
        checkedAt: '2026-09-17',
      },
      {
        title: 'French skiver ze santalového dřeva 6 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/french-skiver-ze-santaloveho-dreva-6mm',
        priceCents: 56_500,
        note: 'Klasický broušený ztenčovač. Kvalitní, ale vyžaduje ostření (podložka 394 Kč) a trénink úhlu.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'safety-skiver-main',
        kind: 'photo',
        caption: 'Ztenčení rubu kůže u hrany safety skiverem na odřezku, hobliny a vzniklý klín',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'coin-forming-block',
    name: 'Forma na tvarování důlku',
    englishName: 'Coin dimple forming block',
    category: 'forming',
    shortDescription: 'Deska s kulatým otvorem, do které se za mokra vtlačí kůže s mincí.',
    purpose:
      'Do otvoru přesně o minci větší se navlhčená kůže s mincí na rubu vtlačí a nechá zaschnout – vznikne pevný důlek, který minci drží. Otvor musí sedět na velikost mince (mince + 2× kůže kapsy 1,2 mm + vůle 1,6 mm); víko z druhé desky formu uzavírá a rozkládá tlak svěrek rovnoměrně.',
    buyingGuide: [
      { label: 'Materiál', value: 'překližka nebo tvrdý plast, tloušťka 10–12 mm (min. 8 mm)' },
      {
        label: 'Velikost',
        value:
          'dva kusy aspoň 61,5 × 61,5 mm pro výchozí minci 50 Kč (74 × 74 mm pro minci 40 mm), forma i víko; ideálně 8 × 8 cm kvůli vyložení svěrek',
      },
      {
        label: 'Otvor',
        value:
          'Ø 31,5 mm pro výchozí minci 50 Kč (27,5 mm), vykružovákem 32 mm; Ø 44 mm pro minci 40 mm z předlohy; jiný průměr podle vlastní mince (list KAPSA)',
      },
      {
        label: 'Vrtání',
        value:
          'vykružovací pila (hole saw) 32 mm pro výchozí minci 50 Kč, na aku vrtačku; Forstnerův vrták jen s průměrem, který na otvor sedí (32 mm) – v ověřené sadě 15–35 mm pro 50 Kč není',
      },
    ],
    cautions: [
      'Dostupné vrtáky nemusí trefit přesný průměr – o 0,5–1,5 mm větší otvor (32 místo 31,5 u mince 50 Kč, 45 místo 44 u mince 40 mm, 30 místo 28,5 u mince 10 Kč) nejspíš půjde, jen okraj důlku bude měkčí; neověřeno, nejdřív vyzkoušejte na odřezku. Hranu otvoru navíc zaobleňte smirkem – ostrá hrana by v kůži udělala rýhu.',
      'Vrtejte na 1. rychlost bez příklepu, s nabitou baterií; průměry kolem 44–45 mm (mince 40 mm) jsou pro menší aku vrtačky nejnáročnější, 32 mm je snazší. Provrtejte do půlky, desku otočte a dokončete z druhé strany podle dírky středicího vrtáku.',
      'List KAPSA má otvor formy nakreslený 1:1 pro danou minci – vytiskněte ho na 100 % a nalepte na desku, ať je střed přesný.',
      'Bez vykružováku jde otvor i navrtat dokola děrami 5–6 mm těsně u čáry, střed vylomit a dopilovat na čáru.',
    ],
    avoid: [
      {
        title: 'Plexisklo/polystyren na víko',
        reason:
          'OBI pod „plexisklo“ prodává polystyren: 2 mm se pod svěrkou prohne, 4 mm je jen jako velká deska za přes tisíc korun a pod šroubovou svěrkou může prasknout. Překližka je tužší a levnější.',
      },
      {
        title: 'Diamantová vykružovací pila na dlaždice',
        reason:
          'v OBI se prodává i vykružovací pila na dlaždice za 919 Kč – je na kámen, ne na dřevo.',
      },
    ],
    alternatives: [
      {
        title: 'Odřezek překližky z přířezu',
        reason:
          'stačí kousek 8 × 8 cm; přířez dělá HORNBACH (ne na všech prodejnách, předem zavolat), BAUHAUS (min. rozměr desky 250 × 500 mm) a OBI (jen zúčastněné prodejny) – ne všude a ne vždy zadarmo, cenu si na místě ověřte.',
      },
      {
        title: 'Staré plastové prkénko z domácnosti',
        reason: 'když je aspoň 8 mm silné, poslouží místo překližky.',
      },
    ],
    priceRange: { minCents: 9_900, maxCents: 9_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena je za sadu vykružovacích pil LUX-TOOLS s 32 mm pro výchozí minci 50 Kč (99 Kč). Nabídky jen pro minci 40 mm (BAUHAUS 299 Kč, HiKOKI 195 Kč) a sada Forstnerových vrtáků (179 Kč, pro mince 20 a 10 Kč) jsou níže jako varianty a do ceny se nepočítají, stejně jako překližka.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'LUX-TOOLS Sada vykružovacích pil, 7 ks',
        shop: 'OBI',
        url: 'https://www.obi.cz/vykruzovaci-pily/lux-sada-vykruzovacich-pil-7-ks/p/1698885',
        priceCents: 9_900,
        note: 'Průměry 25, 32, 38, 45, 50, 56, 62 mm, univerzální unášecí talíř a středicí vrták, na dřevo. Pokryje 32 mm (výchozí mince 50 Kč, o 0,5 mm víc než potřebných 31,5 mm) i 45 mm (mince 40 mm, o 1 mm víc než potřebných 44 mm) – obojí vyzkoušet na odřezku. Dostupnost na prodejně neověřena.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Sada Forstnerových vrtáků (sukovníků) 15–35 mm, 5 ks',
        shop: 'OBI',
        url: 'https://www.obi.cz/vrtaky-do-dreva/sada-forstnerovych-vrtaku-15-mm-35-mm-5dilna/p/2021962',
        priceCents: 17_900,
        note: 'Jen pro jiné mince než výchozí: průměry 15, 20, 25, 30, 35 mm, pro měkké dřevo a překližku; z ní 30 mm na minci 20 Kč nebo 10 Kč. Pro výchozí minci 50 Kč (otvor 31,5 mm) se nehodí – 30 mm je menší než otvor, 35 mm o 3,5 mm větší. Dostupnost na prodejně neověřena.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Sada vykružovacích pil ø 19–82 mm, 12 ks',
        shop: 'BAUHAUS',
        url: 'https://www.bauhaus.cz/sada-vykruzovacich-pil-21443110',
        priceCents: 29_900,
        note: 'Varianta 40 mm: má přesně 44 mm a 2 unášecí hlavičky, do dřeva a překližky. Jen online, na prodejnách není; nemá 32 mm pro výchozí minci 50 Kč.',
        availability: 'in_stock',
        checkedAt: '2026-09-27',
      },
      {
        title: 'Pilový vykružovák HiKOKI Ø 44 mm',
        shop: 'HORNBACH',
        url: 'https://www.hornbach.cz/p/pilovy-vykruzovak-hikoki-o-44-mm/5578355/',
        priceCents: 19_500,
        note: 'Varianta 40 mm: bimetal, přesně 44 mm, na výchozí minci 50 Kč se nehodí. Skladem na prodejně. Stránka neuvádí, jestli je v balení unášecí talíř – na prodejně se zeptat, jinak dokoupit.',
        availability: 'in_stock',
        checkedAt: '2026-09-27',
      },
      {
        title: 'Překližka borová 10 × 600 × 1200 mm',
        shop: 'HORNBACH',
        url: 'https://www.hornbach.cz/p/preklizka-borova-10-x-600-x-1200-mm/6571171/',
        priceCents: 48_900,
        note: 'Na formu zbytečně velká celá deska – výhodnější je poptat odřezek v přířezu (HORNBACH, BAUHAUS, vybrané OBI). Dostupnost na prodejně neověřena.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'coin-forming-block-main',
        kind: 'photo',
        caption: 'Dvoudílná forma z překližky s vyvrtaným otvorem a smirkem zaoblenou hranou',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'clamps',
    name: 'Svěrky',
    englishName: 'Clamps',
    category: 'forming',
    shortDescription:
      'Stáhnou formu na tvarování důlku rovnoměrně ze dvou stran, než kůže s mincí zaschne.',
    purpose:
      'Dvě svěrky proti sobě rovnoměrně stáhnou formu a víko přes navlhčenou kůži s mincí, aby se víko nenaklonilo a důlek vyšel souměrný.',
    buyingGuide: [
      { label: 'Počet', value: '2–4 kusy, vždy v párech proti sobě' },
      {
        label: 'Vyložení',
        value: 'aspoň tak hluboko, aby dosáhly na střed formy 8 × 8 cm',
      },
      { label: 'Typ', value: 'truhlářské (rychlosvěrky) nebo šroubové z temperované litiny' },
    ],
    cautions: [
      'Vyložení je, jak hluboko od okraje desky svěrka dosáhne. Otvor s mincí proto musí být blíž než asi 4 cm od hrany formy, jinak svěrka tlačí vedle mince, ne na ni.',
      'Dvě svěrky dejte vždy proti sobě (z každé strany jednu), aby se víko nenaklonilo.',
    ],
    avoid: [
      {
        title: 'Jedna svěrka uprostřed',
        reason: 'víko se nakloní.',
      },
      {
        title: 'Předimenzovaná šroubová svěrka (přes 500 Kč/ks)',
        reason: 'na formu 8 × 8 cm je zbytečně silná; levnější varianty stačí stejně.',
      },
    ],
    alternatives: [
      {
        title: 'Truhlářský svěrák přišroubovaný ke stolu',
        reason: 'vyplatí se, jen pokud ho využijete i jinde – stojí přes 700 Kč.',
      },
    ],
    priceRange: { minCents: 10_900, maxCents: 23_800 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [],
    examples: [
      {
        title: 'ELLIX sada truhlářských svěrek 150 × 50 a 200 × 50 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/upinaci-nastroje/ellix-sada-truhlarskych-sverek-2dilna/p/5400296',
        priceCents: 10_900,
        priceNote: 'za 2 ks',
        note: 'Stačí s formou 8 × 8 cm. Dostupnost na prodejně neověřena.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Šroubová svěrka z temperované litiny 250 × 80 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/upinaci-nastroje/sroubova-sverka-z-temperovane-litiny-250-x-80-mm/p/5410782',
        priceCents: 11_900,
        priceNote: 'za kus, kupte 2',
        note: 'Vyložení 80 mm, pevnější sevření; nejlepší poměr ceny a výkonu z ověřených nabídek. Dostupnost na prodejně neověřena.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'clamps-main',
        kind: 'photo',
        caption: 'Dvě svěrky proti sobě stahující formu s víkem na tvarování důlku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'snap-fastener',
    name: 'Druk (patice, klobouček) s aplikátorem',
    englishName: 'Snap fastener + setter',
    category: 'forming',
    shortDescription:
      'Kovové zapínání jazyka, pro tento střih s kloboučkem Ø 12 mm (Prym Anorak s aplikátorem). Patice se osazuje naplocho před složením, klobouček až podle obtisku na hotovém kuse.',
    purpose:
      'Druk má dvě poloviny: dřík (patice) s hlavičkou jde na přední panel, klobouček se zdířkou na jazyk (skladbu dílů a pořadí osazení u konkrétního druku ukazuje návod na obalu). Dřík se osadí naplocho z rubu předního panelu ještě před složením pásu, hlavička zůstane na jeho líci. Klobouček se osadí až na konci na líc jazyka, přesně na místo, které se otisklo přiložením přes hlavičku po přeložení jazyka přes horní hranu; zdířka na jeho rubu pak na hlavičku zacvakne. Každá polovina svírá jen jednu vrstvu kůže těla (1,2 nebo 1,5 mm). Střih počítá od v4.11 s kloboučkem Ø 12 mm (Prym Anorak 12 mm): od horní hrany předního panelu zůstane 3,5 mm (minimum 2), od boků jazyka 10,5 mm a od konce zkráceného jazyka 5 mm. Model projde i s kloboučkem 13,5 mm (2,75 / 9,75 / 4,25 mm) a 15 mm (2 / 9 / 3,5 mm – k horní hraně jen těsné minimum), rozložení střihu se nemění. Příruba patice na rubu předního panelu smí mít nejvýš Ø 11 mm, jinak by tlačila na karty – po nákupu ji změřte.',
    buyingGuide: [
      {
        label: 'Velikost kloboučku',
        value: '12 mm (doporučeno); 13,5 mm projde, 15 mm je k horní hraně těsné (2 mm)',
      },
      {
        label: 'Aplikátor',
        value:
          'u Prym Anorak 12 mm je aplikátor s nástavci v balení a osazuje se paličkou; jinak osazovač podle druku (např. Tandy 8108-10 k WUK 5/6)',
      },
      {
        label: 'Otvor pro dřík',
        value:
          'velikost obchod neuvádí – řiďte se návodem v balení, nebo zkuste na odřezku od nejmenšího výsečníku (2 mm, pak 3 mm), pokud návod otvor vyžaduje; výsečník viz položka „Malý výsečník 2 / 3 mm“ (CraftPoint, 29 Kč)',
      },
      {
        label: 'Příruba patice',
        value: 'nejvýš Ø 11 mm (na rubu předního panelu nesmí tlačit na karty) – změřit po nákupu',
      },
      { label: 'Dřík', value: 'na jednu vrstvu kůže 1,2–1,5 mm (ne na dvě vrstvy)' },
    ],
    cautions: [
      'Celý druk nejdřív vyzkoušejte na odřezku stejné kůže jako tělo (lekce 3), teprve pak na pásu. Obchod u Prym Anorak uvádí „textilie vyrobené z jemné kůže“; třísločiněná kůže 1,2–1,5 mm je tužší – jestli dřík v jedné vrstvě dobře roznýtuje a druk jde zavřít i otevřít, ověřte na odřezku.',
      'Velikost otvoru pro dřík a klobouček obchod neuvádí. Řiďte se návodem na obalu; když otvor vyžaduje a velikost neuvádí, zkuste na odřezku nejdřív nejmenší výsečník (2 mm) a teprve když dřík neprojde, o krok větší (3 mm). Moc velký otvor a dřík se v kůži viklá.',
      'Dřík (patice) se osazuje naplocho z rubu předního panelu ještě před složením pásu – v uzavřeném pouzdru už na něj nedosáhnete.',
      'Klobouček se naopak osazuje až úplně nakonec, podle obtisku hlavičky na přeloženém jazyku, ne podle odhadované značky.',
      'Aplikátorem z balení a paličkou na tvrdé podložce, kolmo a přesně na značku; pořadí dílů a strana aplikátoru podle návodu na obalu.',
      'Patice (dřík) na rubu předního panelu nesmí zasahovat pod horní hranu karet (15 mm pod horní hranou). Střed patice je 9,5 mm pod hranou, takže příruba smí mít nejvýš Ø 11 mm – po nákupu ji posuvným měřítkem změřte, ověřit na prototypu.',
    ],
    avoid: [
      {
        title: 'Stiskací knoflíky Prym Jersey',
        reason:
          'podle obchodu jsou pro tenčí a pružné látky a místo otvoru se uchytí vroubkovaným kroužkem – do tuhé třísločiněné kůže se nehodí.',
      },
    ],
    alternatives: [
      {
        title: 'Knoflíky stiskací s kroužkem Ø 13,5 mm na silné látky (Stoklasa)',
        reason:
          'levnější, s mini lisem v balení, podle prodejce na materiál 1–3 mm; klobouček 13,5 mm model projde (od horní hrany 2,75 mm). Na třísločiněné kůži ověřit na odřezku.',
      },
      {
        title: 'Druky WUK Ø 15 mm s mini lisem (Dřevěný svět)',
        reason:
          'podle prodejce na látky 0,5–1,5 mm; klobouček 15 mm nechá k horní hraně předního panelu jen 2 mm (minimum) – těsné.',
      },
      {
        title: 'Druky WUK 5/6 (13,5 mm) + hlavičkář Tandy 8108-10 (Leatory)',
        reason:
          'kožedělná sada, ale dražší (48,90 + 499 Kč) a výsečník na dřík se kupuje zvlášť; jestli je u hlavičkáře kovadlinka, stránka jasně neříká.',
      },
    ],
    priceRange: { minCents: 18_900, maxCents: 18_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena = Prym Anorak 12 mm s aplikátorem, 10 ks (189 Kč). Malý výsečník 2 nebo 3 mm na otvor pro dřík (29 Kč, jen pokud ho návod druku vyžaduje) je samostatná položka „Malý výsečník 2 / 3 mm“ a do ceny druku se nepočítá. Alternativy (Stoklasa 134,96 Kč, WUK 15 mm 172 Kč, WUK 5/6 + Tandy 547,90 Kč) jsou níže a do ceny se nepočítají.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Knoflík stiskací ANORAK s aplikátorem – PRYM (varianta 12 mm)',
        shop: 'Ráj šití',
        url: 'https://www.raj-siti.cz/knoflik-stiskaci-anorak-s-aplikatorem-prym_z77891/',
        priceCents: 18_900,
        priceNote: 'za balení 10 ks s aplikátorem a nástavci, potřebujete 1; 15 mm za 197 Kč',
        note: 'Doporučený: klobouček Ø 12 mm, podle obchodu nerezová ocel, střední uzavírací síla, osazuje se kladivem (paličkou), trojnožkou nebo kleštěmi Vario. Obchod uvádí „textilie vyrobené z jemné kůže“ – na třísločiněné kůži 1,2–1,5 mm nejdřív vyzkoušet na odřezku. Velikost otvoru pro dřík neuvádí (návod v balení).',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Knoflíky stiskací s kroužkem Ø 13,5 mm na silné látky',
        shop: 'Stoklasa',
        url: 'https://www.stoklasa.cz/knofliky-stiskaci-s-krouzkem-13-5-mm-na-silne-latky-x161360',
        priceCents: 13_496,
        priceNote: 'za kartu 10 ks s mini lisem',
        note: 'Alternativa: podle prodejce na tloušťku materiálu 1–3 mm, nýtuje se plastovým mini lisem z balení. Klobouček 13,5 mm – od horní hrany předku 2,75 mm. Na kůži ověřit na odřezku.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Knoflíky stiskací s pérkem WUK Ø 15 mm, staromosaz',
        shop: 'Dřevěný svět',
        url: 'https://www.drevenysvet.online/knoflik-stiskaci-wuk-15-mm-staromosaz/?variantId=430498',
        priceCents: 17_200,
        priceNote: 'za kartu 10 ks s mini lisem',
        note: 'Alternativa, těsná: podle prodejce na látky 0,5–1,5 mm; klobouček 15 mm nechá k horní hraně předního panelu jen 2 mm (minimum modelu). Obchod uvádí „odesíláme do tří dnů“.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Nýtovací knoflíky stiskací – druky WUK 5/6 Nikl, 10 ks',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/nyty--ozdoby-a-ostatni/nytovaci-knofliky-stiskaci-druky-wuk-5-6-nikl-10ks/',
        priceCents: 4_890,
        priceNote: 'za balení 10 ks, potřebujete 1; osazovač se kupuje zvlášť',
        note: 'Dražší alternativa s hlavičkářem Tandy: klobouček Ø 13,5 mm, podle prodejce na kůži 0,5–1,5 mm, osazuje se sadou Tandy 8108-10 nebo 8105-00. Délka dříku pro jednu vrstvu 1,2 mm neuvedená – zeptat se prodejce.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Hlavičkář k nýtování druků Tandy 8108-10',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/prislusenstvi-naradi/hlavickar-k-nytovani-druku/',
        priceCents: 49_900,
        note: 'Jen k alternativě WUK 5/6 (u Prym Anorak je aplikátor v balení). Jestli je v balení i kovadlinka, stránka jasně neříká – ověřte u prodejce.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'snap-fastener-main',
        kind: 'photo',
        caption:
          'Rozložený druk – dřík, hlavička, zdířka, klobouček a aplikátor z balení – vedle odřezku kůže na zkoušku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'grommet',
    name: 'Průchodka Ø 5 mm a osazovač',
    englishName: 'Grommet + setter',
    category: 'forming',
    shortDescription:
      'Volitelné kovové očko v rohu vnitřního panelu, kterým prochází šňůrka. Dvoudílná s podložkou, osazuje se naplocho.',
    purpose:
      'Průchodka je dvoudílné kovové očko s podložkou, na otvor Ø 5 mm v jedné vrstvě kůže těla (1,2 nebo 1,5 mm); zpevní otvor, aby se netrhal, a může jím procházet šňůrka. V pouzdru s mincí je od v4.11 **volitelná** (výchozí listy otvor pro ni nemají); pokud ji chcete, sedí v rohu vnitřního panelu, 9 mm od obou hran, a osazuje se naplocho ještě před složením pásu – osazovačem na kovadlince, nebo ručním mini lisem, pokud je v balení (průchodky ze Stoklasy). Hezčí strana jde na rub vnitřního panelu – po složení je to strana vidět zepředu výřezem.',
    buyingGuide: [
      { label: 'Průměr', value: 'Ø 5 mm, dvoudílná s podložkou' },
      {
        label: 'Sada',
        value:
          'osazovač s kovadlinkou nebo ruční mini lis (ten je v balení průchodek ze Stoklasy) a kruhový výsečník na otvor Ø 5 mm (dutý s břitem, ne plný průbojník na kov)',
      },
      { label: 'Materiál', value: 'mosaz nebo poniklovaná ocel' },
      {
        label: 'Trubička (dřík)',
        value:
          'musí projít otvorem Ø 5 mm v jedné vrstvě kůže 1,2–1,5 mm (vnější průměr ověřit u prodejce)',
      },
    ],
    cautions: [
      'Otvor pro průchodku vysekněte kulatým výsečníkem (dutý, s břitem), ne plným průbojníkem na kov – ten kůži jen promáčkne.',
      'Hezčí strana průchodky patří na rub vnitřního panelu, protože po složení je právě rub vidět zepředu výřezem.',
      'Osaďte ji naplocho do vnitřního panelu před složením; po složení je roh s průchodkou vidět výřezem zepředu i zezadu, ale sáhnout na ni už nejde.',
      'Obchody často uvádí velikost podle vnitřního průměru (světlosti) hotového očka, ne podle otvoru v kůži – před nákupem si ověřte vnější průměr trubičky, aby prošla otvorem Ø 5 mm v jedné vrstvě kůže 1,2–1,5 mm.',
      'Vnější průměr trubičky k datu ověření (29. 9. 2026) neuvádí žádný obchod. Zeptejte se prodejce: „Projde trubička průchodky otvorem Ø 5 mm a osadí se (roznýtuje) v jedné vrstvě kůže 1,2 mm?“ Vnější Ø 8 mm u Stoklasy je nejspíš průměr límce, ne trubičky – neověřeno.',
    ],
    avoid: [
      {
        title: 'Plný „průbojník“ (Narex apod.) místo výsečníku',
        reason:
          'hobbymarkety prodávají pod slovem „průbojník“ plný trn na kov, který díru do kůže neudělá, jen ji promáčkne.',
      },
    ],
    alternatives: [],
    priceRange: { minCents: 6_953, maxCents: 6_953 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Jediná ověřená nabídka: 20 párů průchodek s mini lisem (69,53 Kč); vhodnost pro otvor Ø 5 mm v kůži 1,2 mm je neověřená (viz upozornění).`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Průchodky s podložkou vnitřní Ø 4 mm, vnější Ø 8 mm, 20 párů s mini lisem',
        shop: 'Stoklasa',
        url: 'https://www.stoklasa.cz/pruchodky-s-podlozkou-vnitrni-4-mm-vnejsi-8-mm-x137410',
        priceCents: 6_953,
        priceNote: 'za blistr 20 párů, potřebujete 1 průchodku',
        note: 'Mosaz, dvoudílná, mini lis v balení; prodejce uvádí materiál 1–3 mm a výšku 5 mm. Vnější průměr trubičky neuvádí – jestli projde otvorem Ø 5 mm a osadí se v jedné vrstvě 1,2 mm, zjistěte u prodejce (ověřit na odřezku). Barva se volí v e-shopu.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'grommet-main',
        kind: 'photo',
        caption: 'Dvoudílná průchodka s podložkou a osazovačem vedle otvoru v rohu panelu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'round-punch-32mm',
    name: 'Kruhový výsečník na okno Ø 20 mm',
    englishName: 'Round hollow punch, window',
    category: 'cutting',
    shortDescription:
      'Vyseknutí okna kapsy, kterým je vidět mince: Ø 20 mm pro výchozí minci 50 Kč. Dutý výsečník, ne plný průbojník.',
    purpose:
      'Okno (kruh kůže uprostřed kapsy) se vyseká jedním úderem dutého kruhového výsečníku Ø 20 mm pro výchozí minci 50 Kč (27,5 mm); kolem něj zůstává prstenec kůže 3,75 mm, který drží minci, aby oknem nevypadla. Prstenec je od v4.11 užší než dřív (4 mm) – že minci udrží, ověříte na odřezku z tvarovací zkoušky (lekce 2) dřív, než vyseknete okno do skutečné kapsy. Jen pro variantu s mincí 40 mm z předlohy je potřeba Ø 32 mm (prstenec 4 mm).',
    buyingGuide: [
      {
        label: 'Typ',
        value: 'dutý kruhový výsečník (hollow punch) s ostrým břitem, ne plný průbojník',
      },
      {
        label: 'Průměr',
        value:
          '20 mm pro výchozí minci 50 Kč (prstenec 3,75 mm); volitelně 32 mm pro minci 40 mm (prstenec 4 mm)',
      },
      {
        label: 'Záloha',
        value:
          'volitelně Ø 18 mm (CraftPoint, 58 Kč) pro případ, že zkouška Ø 20 mm na odřezku nevyjde – stojí za to přihodit do stejné objednávky',
      },
      {
        label: 'Podložka',
        value: 'měkčí PU/pryž (OKA, Tandy) tlumí úder líp než tvrdá deska',
      },
    ],
    cautions: [
      'Prstenec 3,75 mm je užší, než s jakým střih počítal dřív (4 mm). Na odřezku z tvarovací zkoušky (lekce 2) vyseknutým oknem ověřte, že mince v důlku drží: zatřesení oknem dolů a zatlačení na minci směrem k oknu. Když oknem projde, zapište to a Ø 20 mm do skutečné kapsy nesekejte: na dalším odřezku zkuste menší průměr (stejná nabídka CraftPointu má i Ø 18 mm, 29. 9. 2026 za 58 Kč skladem; prstenec pak 4,75 mm) – ověřit na odřezku.',
      'Sekejte kolmo, vystředěné podle kružnice okna narýsované na rubu kapsy před tvarováním (nebo podle stejně širokého prstence kůže kolem důlku).',
      'Kapsu při vysekávání okna položte lícem dolů zpátky na formu (nad otvorem) a pod důlek podložte špalík užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a zároveň širší než okno (přes 20 mm, u mince 40 mm přes 32 mm) – má se dotýkat jen dna důlku zespodu, ne ho nadzvedávat.',
      'Jestli výsečník čistě prosekne kůži 1,2 mm jedním úderem, ověřte na odřezku.',
      'Jen pro minci 40 mm: Stoklasa prodává výsečník v několika průměrech na jedné stránce (25/26/28/32 mm) – v košíku zkontrolujte, že je vybraný a skladem právě 32 mm. Pro výchozí minci 50 Kč ho nekupujte.',
    ],
    avoid: [{ title: 'Plný průbojník na kov', reason: 'kůži jen promáčkne, díru neudělá.' }],
    alternatives: [],
    priceRange: { minCents: 6_900, maxCents: 6_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena je za Ø 20 mm pro výchozí minci 50 Kč (CraftPoint, 69 Kč). Ø 32 mm pro variantu s mincí 40 mm (704–745 Kč) je níže jako varianta a do ceny se nepočítá – kupuje se jen jeden z nich.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 20 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        priceCents: 6_900,
        priceNote: 'za kus (varianta 20 mm)',
        note: 'Ø 20 mm pro okno výchozí mince 50 Kč. Výsečník na kůži; v nabídce vyberte průměr 20 mm.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Kruhový výsečník Format 32 mm',
        shop: 'Enaradinastroje',
        url: 'https://www.enaradinastroje.cz/kruhovy-vysecnik-format-32mm/',
        priceCents: 74_500,
        note: 'Varianta 40 mm: jen pro minci 40 mm, pro výchozí 50 Kč se nehodí. Podle prodejce na kůži, pryž, plsť a pěnové materiály. Skladem do 48 hodin.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Výsečník, děrovač na látky 25 / 26 / 28 / 32 mm (varianta 32 mm)',
        shop: 'Stoklasa',
        url: 'https://www.stoklasa.cz/vysecnik-derovac-na-latky-25-mm-26-mm-28-mm-32-mm-x143127',
        priceCents: 70_437,
        priceNote: 'za kus',
        note: 'Varianta 40 mm: jen pro minci 40 mm. Určený na látky – na kůži 1,2 mm ověřit na odřezku; skladovost varianty 32 mm zkontrolujte v košíku.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'round-punch-32mm-main',
        kind: 'photo',
        caption: 'Kruhový výsečník položený nad kůží s vyznačeným středem okna',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'hole-punch-5mm',
    name: 'Výsečník Ø 5 mm',
    englishName: 'Round hollow punch 5 mm',
    category: 'cutting',
    shortDescription:
      'Otvor pro volitelnou průchodku. Malý dutý výsečník, běžná velikost v nabídce obchodů.',
    purpose:
      'Kulatý dutý výsečník Ø 5 mm proseká otvor pro dvoudílnou průchodku. V pouzdru s mincí je od v4.11 potřeba jen k volitelné průchodce.',
    buyingGuide: [
      { label: 'Typ', value: 'dutý kruhový výsečník, ne plný průbojník na kov' },
      { label: 'Průměr', value: '5 mm (běžná velikost)' },
    ],
    cautions: ['Vysekávejte na tvrdé podložce, kolmo.'],
    avoid: [
      {
        title: 'Plný „průbojník“ 5 mm z hobbymarketu (Narex apod.)',
        reason: 'je to plný trn na kov, díru do kůže neudělá, jen ji promáčkne.',
      },
    ],
    alternatives: [],
    priceRange: { minCents: 12_500, maxCents: 39_400 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Jednotlivě Ø 5 mm bylo u CraftPointu k datu ověření (29. 9. 2026) vyprodané (29 Kč); dostupné jsou Format 5 mm (125 Kč) a sada 2–5 mm (394 Kč), která velikost 5 mm také obsahuje.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Kruhový výsečník Format 5 mm',
        shop: 'Enaradinastroje',
        url: 'https://www.enaradinastroje.cz/kruhovy-vysecnik-format-5mm/',
        priceCents: 12_500,
        note: 'Podle prodejce na kůži, pryž, plsť a pěnové materiály; skladem do 48 hodin. Jestli čistě prosekne kůži, ověřte na odřezku.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        priceCents: 2_900,
        priceNote: 'za kus',
        note: 'Jednotlivé průměry 2–20 mm se objednávají podle výběru; 5 mm bylo v době ověření (i 29. 9. 2026) vyprodané, 6 mm skladem.',
        availability: 'unavailable',
        checkedAt: '2026-09-29',
      },
      {
        title: 'Sada výsečníků na kůži 7 velikostí (2–5 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sada-vysecniku-na-kuzi-7-velikosti-2-5mm',
        priceCents: 39_400,
        note: 'Rukojeť + 7 vyměnitelných hrotů 2 / 2,5 / 3 / 3,5 / 4 / 4,5 / 5 mm. Řeší otvor pro průchodku, i když je jednotlivý hrot Ø 5 mm zrovna vyprodaný.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'hole-punch-5mm-main',
        kind: 'photo',
        caption: 'Malý kruhový výsečník Ø 5 mm položený vedle otvoru pro průchodku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'small-hole-punch',
    name: 'Malý výsečník 2 / 3 mm',
    englishName: 'Round hollow punch 2–3 mm',
    category: 'cutting',
    shortDescription:
      'Otvor pro dřík a trn kloboučku druku – jen pokud ho návod druku vyžaduje. Malý dutý výsečník.',
    purpose:
      'Velikost otvoru pro dřík druku Prym Anorak obchod neuvádí. Když návod v balení otvor vyžaduje a velikost neuvádí, zkouší se na odřezku od nejmenšího výsečníku (2 mm) a teprve když dřík neprojde, o krok větší (3 mm). Když návod otvor nevyžaduje, výsečník nepotřebujete.',
    buyingGuide: [
      { label: 'Typ', value: 'dutý kruhový výsečník, ne plný průbojník na kov' },
      {
        label: 'Průměr',
        value: '2 mm; 3 mm jen pro případ, že dřík otvorem 2 mm neprojde (ověřit na odřezku)',
      },
      {
        label: 'Objednávka',
        value:
          'stojí za to přihodit do stejné objednávky u CraftPointu jako výsečník okna (stejná nabídka 2–20 mm)',
      },
    ],
    cautions: [
      'Jen pokud návod druku otvor vyžaduje. Návod je v balení druku, takže když druk ještě nemáte, výsečník radši přihoďte do objednávky.',
      'Moc velký otvor a dřík se v kůži viklá – proto nejdřív 2 mm, na odřezku.',
    ],
    avoid: [{ title: 'Plný průbojník na kov', reason: 'kůži jen promáčkne, díru neudělá.' }],
    alternatives: [],
    priceRange: { minCents: 2_900, maxCents: 2_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena je za jeden výsečník 2 mm (CraftPoint, 29 Kč); 3 mm stojí stejně a kupuje se jen tehdy, když ho zkouška na odřezku ukáže jako potřebný.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta 2 mm nebo 3 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        priceCents: 2_900,
        priceNote: 'za kus',
        note: 'Jen pokud návod druku vyžaduje otvor pro dřík nebo klobouček: na odřezku začít nejmenším (2 mm), větší (3 mm) až když dřík neprojde. 2 i 3 mm skladem.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'small-hole-punch-main',
        kind: 'photo',
        caption: 'Malý kruhový výsečník 2 mm vedle dříku druku na odřezku',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'corner-template',
    name: 'Rohová šablona (ocelová „květina“)',
    englishName: 'Corner radius template',
    category: 'cutting',
    shortDescription:
      'Vede nůž nebo šídlo při zaoblování rohů na daný poloměr. Pro tento střih se hodí lob R6 a R10.',
    purpose:
      'Kovová nebo akrylová šablona s několika oblouky různého poloměru na jednom kotouči (loby, číslované podle průměru). Přiložením správného lobu obtáhnete nebo vedete nůž po stejném rádiusu na všech rozích. Pro tento střih se hodí lob 12 (R6, dolní rohy kapsy) a lob 20 (R10, jazyk, horní rohy kapsy).',
    buyingGuide: [
      {
        label: 'Typ',
        value: 'ocelová „květina“ (kotouč s otvory různého průměru) nebo akrylová L-šablona',
      },
      {
        label: 'Poloměry',
        value: 'aspoň R6 a R10; R2,5 (roh výřezu) žádná dostupná šablona nemá přesně',
      },
      {
        label: 'Materiál',
        value: 'ocel odolá noži jako vodítku; akryl je jen na obtahování tužkou nebo šídlem',
      },
    ],
    cautions: [
      'Číslo na lobu ocelové „květiny“ je průměr, ne poloměr: lob 12 = R6, lob 20 = R10.',
      'Akrylová hrana se noži jako vodítko nehodí, jen na obtažení; jako vodítko nože poslouží jen ocelová varianta.',
      'V ČR nebyl nalezen obchod s ocelovou variantou; počítejte s dovozem z AliExpressu a od 7/2026 s clem asi 3 € za položku.',
    ],
    avoid: [],
    alternatives: [
      {
        title: 'Obtažení mince nebo víčka',
        reason: 'R6 = Ø 12 mm – stačí obtáhnout minci nebo víčko tohoto průměru.',
      },
      {
        title: 'Akrylová šablona rohy a kruhy (Leatory, Tandy)',
        reason:
          'český sklad, ale rohy jen v palcových poloměrech (1/8″–2″), R6 sedí jen přibližně (1/4″ = 6,35 mm) a je to jen vodítko na obtažení, ne na nůž.',
      },
    ],
    priceRange: { minCents: 14_700, maxCents: 36_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Ceny z AliExpressu jsou bez cla; od 7/2026 přičtěte asi 3 € (cca 75 Kč) za položku.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Ocelová „květina“, Metal Corner Cutting Ruler',
        shop: 'AliExpress',
        url: 'https://www.aliexpress.com/item/1005006129649426.html',
        priceCents: 14_700,
        note: 'Loby Ø 6–24 mm (R3–R12), oblouky R11,5–21,5, dírky na značení 1–4 mm. Lob Ø 12 = R6, lob Ø 20 = R10 – oba poloměry tohoto střihu.',
        availability: 'in_stock',
        checkedAt: '2026-09-17',
      },
      {
        title: 'Sada nerezových šablon „Rounded Arc-shaped ruler“',
        shop: 'AliExpress',
        url: 'https://www.aliexpress.com/item/1005009345256631.html',
        priceCents: 25_900,
        note: 'L-šablona s poloměry R5/10/12,5/15/20, navíc kruhy a úhelník.',
        availability: 'in_stock',
        checkedAt: '2026-09-17',
      },
      {
        title: 'Akrylová šablona rohy a kruhy (Tandy)',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/prislusenstvi-naradi/akrylova-sablona-rohy-a-kruhy-2/',
        priceCents: 36_000,
        note: 'Čirý akryl 3 mm, rohy 1/8″–2″ (3–50 mm) a kruhy 1/4″–2″ v palcových krocích; R6 sedí jen přibližně, jen na obtažení, ne jako vodítko nože.',
        availability: 'in_stock',
        checkedAt: '2026-09-29',
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'corner-template-main',
        kind: 'photo',
        caption: 'Ocelová rohová šablona přiložená na roh kapsy, obtažení tužkou podle lobu',
        status: 'planned',
      },
    ],
  }),
  draft({
    slug: 'masking-tape',
    name: 'Maskovací (malířská) krepová páska 25 mm',
    englishName: 'Masking tape',
    category: 'cutting',
    shortDescription:
      'Přidrží papírovou šablonu na kůži, ohraničí úzké pásy lepidla a poslouží na značky. Jedna role na všechny projekty.',
    purpose:
      'Papírová páska, která jde strhnout bez zbytků. Šablonu vystřiženou nahrubo s okrajem 1–2 cm jí přilepíte na kůži za okraje, aby se při propichování značek a řezání skrz papír po vytištěné čáře neposunula – to je hlavní způsob přenesení šablony ve všech třech projektech. U peněženky Víčko s ní navíc ohraničíte úzké pásy lepení (G2b, hranice G3, Tokonole jen mimo lepená místa) a označíte značku magnetu. Jedna role 25 mm vystačí na všechny tři projekty.',
    buyingGuide: [
      { label: 'Šířka', value: 'kolem 25 mm (užší na úzké pásy lepení jde natrhnout podélně)' },
      {
        label: 'Lepivost',
        value: 'nízká – „na citlivé povrchy“ (sensitive); běžná malířská jen po zkoušce na odřezku',
      },
      { label: 'Délka', value: 'stačí nejkratší role (25 m)' },
    ],
    cautions: [
      'Pásku nejdřív vyzkoušejte na odřezku téže kůže, hlavně na líci. Silnější páska může na líci nechat lesklou stopu nebo na rubu vytrhnout vlákna.',
      'Strhávejte ji pomalu, pod ostrým úhlem (páska skoro rovnoběžně s kůží), ne kolmo nahoru. Na kůži ji nenechávejte déle, než je potřeba.',
      'Šablonu lepte jen na okrajích, ne přes linii řezu – nůž by šel přes pásku a řez by uhnul.',
      'Šablona se při řezání skrz papír rozřeže, je na jedno použití: na každý další kus vytiskněte novou.',
    ],
    avoid: [
      {
        title: 'Kancelářská průhledná páska (izolepa)',
        reason: 'lepí silně, z líce trhá vlákna a nechává lepidlo',
      },
      {
        title: 'Lepicí páska typu „duct tape“ nebo izolační páska',
        reason: 'na kůži nechá lepkavou stopu, nedá se natrhnout na úzký pás',
      },
    ],
    alternatives: [
      {
        title: 'Malířská páska z papírnictví nebo hobby marketu',
        reason: 'jakákoli papírová maskovací páska kolem 19–25 mm poslouží, po zkoušce na odřezku',
      },
      {
        title: 'Svorky nebo závaží na šablonu',
        reason:
          'u obkreslování stačí; při řezání skrz šablonu (hlavní způsob), na hranice lepení a značky je potřeba páska',
      },
    ],
    // tesa Basic 50 m 55 Kč (OBI) až tesa Professional Sensitive 25 m 139 Kč (OBI), ověřeno 2026-10-01.
    priceRange: { minCents: 5_500, maxCents: 13_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Jedna role na všechny projekty.`,
    alsoUsedFor: ['Všechny projekty'],
    examples: [
      {
        title: 'tesa Maskovací páska Professional SENSITIVE pro citlivé povrchy, 25 m × 25 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/lepici-pasky/tesa-maskovaci-paska-professional-sensitive-pro-citlive-povrchy-25-m-x-25-mm/p/4754180',
        priceCents: 13_900,
        note: 'Stránka uvádí: na citlivé povrchy, v interiéru odstranitelná do 14 dnů bez zbytků lepidla, růžová. Nízká lepivost je pro šablonu na líci nejbezpečnější volba; i tak nejdřív zkuste na odřezku. Online „Do nákupního košíku“, dodání 2–3 pracovní dny; dostupnost v prodejně ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-10-01',
      },
      {
        title: 'Maskovací páska tesa Perfect Sensitive 25 mm × 25 m',
        shop: 'HORNBACH',
        url: 'https://www.hornbach.cz/p/paska-maskovaci-perfect-sensitive-25-mm-x-25-m/8182032/',
        priceCents: 11_500,
        note: 'Páska na citlivé povrchy bez rozpouštědel, podle stránky odstranitelná beze zbytku do 14 dnů. Online dodání asi 1–2 pracovní dny, na prodejně Praha při ověření 38 ks.',
        availability: 'in_stock',
        checkedAt: '2026-10-01',
      },
      {
        title: 'tesa Maskovací páska Basic, 50 m × 25 mm',
        shop: 'OBI',
        url: 'https://www.obi.cz/lepici-pasky/tesa-maskovaci-paska-basic-50-m-x-25-mm/p/5190558',
        priceCents: 5_500,
        note: 'Běžná malířská páska z polokrepového papíru, trhá se rukou, podle stránky jde odstranit beze zbytků. Lepí silněji než Sensitive – na líc kůže jen po zkoušce na odřezku. Online „Do nákupního košíku“; dostupnost v prodejně ověřit.',
        availability: 'in_stock',
        checkedAt: '2026-10-01',
      },
    ],
    commonlyAtHome: true,
    media: [
      {
        id: 'masking-tape-main',
        kind: 'photo',
        caption:
          'Papírová šablona vystřižená s okrajem, přilepená maskovací páskou za okraje na kůži, nůž řeže skrz papír po vytištěné čáře podél pravítka',
        status: 'planned',
      },
    ],
  }),
  ...lidWalletEquipment,
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
  forming: 'Tvarování a kování',
};
