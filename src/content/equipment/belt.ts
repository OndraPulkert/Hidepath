import { type EquipmentDefinition, type ProductExample } from '@/content/schema';

/**
 * Položky katalogu, které přibyly s projektem 04 (pásek, docs/zadani/opasek-postup.md
 * a opasek-parametry.md). Každý příklad je ze stránky načtené 8. 10. 2026 (CraftPoint přes
 * `…/products/<handle>.js`, Andexnite přes Store API, ostatní z HTML). Co stránka neuvádí, je
 * v textu označené „ověřte“. Šířka pásku se volí, proto pás a přezka mají příklady pro každou
 * šířku 28–45 mm, kterou obchod má. Texty jsou NÁVRH (reviewStatus: draft).
 */

const VERIFIED_NOTE =
  'Rozsah odpovídá ověřeným nabídkám českých e-shopů (viz příklady níže). Před nákupem ověřte.';

const CHECKED = '2026-10-08';

const draft = <T extends Omit<EquipmentDefinition, 'reviewStatus'>>(e: T): EquipmentDefinition => ({
  ...e,
  reviewStatus: 'draft',
});

const CRAFTPOINT_STRAP_URL =
  'https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm';

/** CraftPoint řemen 3–3,5 mm podle šířky (jen šířky 28–45 mm, které aplikace pustí). */
const craftpointStrap = (widthMm: number, priceCzk: number): ProductExample => ({
  title: `Řemen z přírodní kůže 3–3,5 mm, 130–140 cm, šířka ${widthMm} mm`,
  shop: 'CraftPoint',
  url: CRAFTPOINT_STRAP_URL,
  variant: `${widthMm} mm`,
  priceCents: priceCzk * 100,
  note: 'Třísločiněná italská kůže. Obchod uvádí délku 130–140 cm a že stačí na obvod pasu 95–115 cm; počítejte se 130 cm.',
  availability: 'in_stock',
  checkedAt: CHECKED,
});

const KRUPSON_STRAP_URL =
  'https://www.krupson.cz/hovezi-kuze-na-opasek-prirodni--4-cm-delka--130-cm/';

const krupsonStrap = (lengthCm: number, priceCzk: number): ProductExample => ({
  title: `Hovězí kůže na opasek, přírodní, 4 cm, ${lengthCm} cm`,
  shop: 'Křupson',
  url: KRUPSON_STRAP_URL,
  variant: `${lengthCm} cm`,
  priceCents: priceCzk * 100,
  note: 'Jen šířka 40 mm, tloušťka 3,5–4 mm. Delší délky pro obvod nad 106,5 cm. Činění stránka neuvádí, ověřte u prodejce.',
  availability: 'in_stock',
  checkedAt: CHECKED,
});

const PRONG_UNVERIFIED = 'Typ trnu stránka neuvádí: na fotce ověřte, že má jeden trn.';

export const beltEquipment: readonly EquipmentDefinition[] = [
  draft({
    slug: 'belt-strap',
    name: 'Kůže – hotový pás na opasek 3–4 mm',
    englishName: 'Veg-tan belt strap',
    category: 'material',
    shortDescription:
      'Pás z třísločiněné kůže v šířce přezky. Z něj je celý pásek; poutko je z odřezku.',
    purpose:
      'Hotový pás (řemen) s rovnými hranami ušetří řezání dlouhého pruhu. Šířka pásu = vnitřní světlost přezky. Délku spočítá tabulka „Váš pásek“ z obvodu: obvod + přehnutí u přezky + vzdálenost od prostřední dírky ke konci (pro 5 dírek po 25 mm obvod + 234,3 mm).',
    buyingGuide: [
      { label: 'Činění', value: 'třísločiněná („veg-tan“), přírodní' },
      { label: 'Šířka', value: 'stejná jako vnitřní světlost přezky; aplikace počítá 28–45 mm' },
      {
        label: 'Tloušťka',
        value: '3,0–4,0 mm; po dodání změřte na řezu a podle ní vyberte dřík nýtu',
      },
      { label: 'Délka', value: 'aspoň „nejkratší délka“ z tabulky Váš pásek' },
    ],
    cautions: [
      'Pás 130 cm stačí do obvodu 106,5 cm (5 dírek po 25 mm). Na větší obvod kupte delší.',
      'CraftPoint slibuje 130–140 cm; s 140 cm nepočítejte.',
      'Tloušťka v názvu je rozpětí. Skutečnou změřte až na dodaném pásu.',
    ],
    avoid: [
      {
        title: 'Pás 2–2,5 mm',
        reason:
          'na opasek s přezkou na dvou nýtech je příliš tenký; podklady počítají s 3,0–4,0 mm.',
      },
    ],
    alternatives: [],
    priceRange: { minCents: 22_800, maxCents: 37_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena závisí na šířce (CraftPoint 28/30 mm 228 Kč až 45 mm 313 Kč) a u Křupsonu na délce.`,
    alsoUsedFor: [],
    examples: [
      craftpointStrap(28, 228),
      craftpointStrap(30, 228),
      craftpointStrap(33, 256),
      craftpointStrap(35, 256),
      craftpointStrap(38, 285),
      craftpointStrap(40, 285),
      craftpointStrap(45, 313),
      krupsonStrap(130, 299),
      krupsonStrap(150, 329),
      krupsonStrap(180, 379),
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'belt-strap-main',
        kind: 'photo',
        caption: 'Srolovaný přírodní pás na opasek a posuvka měřící jeho tloušťku na řezu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'belt-buckle',
    name: 'Přezka na opasek, jednotrnová',
    englishName: 'Single-prong belt buckle',
    category: 'forming',
    shortDescription: 'Vnitřní světlost = šířka pásu. Jeden trn, ne dva.',
    purpose:
      'Přezka určuje šířku pásku: „přezka 40 mm“ znamená vnitřní světlost 40 mm a pás 40 mm. Konec u přezky (ovál pro trn, dva nýty, přehnutí) je spočítaný pro přezku s jedním trnem.',
    buyingGuide: [
      { label: 'Velikost', value: 'vnitřní světlost = šířka pásu' },
      { label: 'Typ', value: 'jednotrnová; ne dvoutrnová ani rolnová' },
      { label: 'Trn', value: 'po dodání změřte u kořene: Ø dírek = trn + 0,5 mm' },
    ],
    cautions: [
      'Typ trnu má na stránce ověřený jen CraftPoint u mosazných přezek („s jedním trnem“). U ostatních ověřte na fotce.',
      'Přezku 45 mm má jen Andexnite (2 ks, typ trnu neuvádí); CraftPoint ani Leatory 45 mm nemají.',
    ],
    avoid: [
      {
        title: 'Dvoutrnová přezka',
        reason: 'konec u přezky má jeden ovál pro jeden trn a jednu řadu dírek.',
      },
    ],
    alternatives: [],
    priceRange: { minCents: 7_500, maxCents: 27_900 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Nejlevnější jsou Andexnite (75–95 Kč), mosazné z CraftPointu stojí 251–279 Kč.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Mosazná opasková přezka 40 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/mosazna-opaskova-prezka-40mm',
        priceCents: 27_900,
        note: 'Stránka uvádí „s jedním trnem“. Pás 40 mm a nýty jsou ve stejném obchodě.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Mosazná opasková přezka 35 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/mosazna-opaskova-prezka-35mm',
        priceCents: 25_100,
        note: 'Stránka uvádí jeden trn.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Mosazná opasková přezka 30 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/mosazna-opaskova-prezka-30mm',
        priceCents: 25_100,
        note: 'Stránka uvádí „s jedním trnem“.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka z nerezové oceli 40 mm, kartáčovaná',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/opaskova-prezka-z-nerezove-oceli-40-mm-kartacovana',
        priceCents: 23_900,
        note: `Nerez AISI 304. ${PRONG_UNVERIFIED}`,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka z nerezové oceli 35 mm, kartáčovaná',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/opaskova-prezka-z-nerezove-oceli-35-mm-kartacovana',
        priceCents: 22_200,
        note: PRONG_UNVERIFIED,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka 40 mm, staromosaz',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/opaskova-prezka-40-mm-staromosaz/',
        priceCents: 9_500,
        note: `Nejlevnější 40 mm; skladem 52 ks. ${PRONG_UNVERIFIED} Další obchod = další poštovné.`,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Kovová přezka 30 mm, staromosaz',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/kovova-prezka-30-mm-staromosaz-2/',
        priceCents: 7_500,
        note: PRONG_UNVERIFIED,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Kovová přezka 45 mm, nikl',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/kovova-prezka-45-mm-nikl/',
        priceCents: 26_000,
        note: `Jediná ověřená 45 mm; skladem 2 ks, vnější rozměr 6 × 8 cm. ${PRONG_UNVERIFIED}`,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka staromosaz 40 mm (#6988)',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/opaskove-prezky/-6988-opaskova-prezka-staromosaz-40mm/',
        priceCents: 11_460,
        note: PRONG_UNVERIFIED,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka staromosaz 35 mm (#6981)',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/opaskove-prezky/-6981-opaskova-prezka-staromosaz-35mm/',
        priceCents: 10_360,
        note: PRONG_UNVERIFIED,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opasková přezka staromosaz 30 mm (#6980)',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/opaskove-prezky/-6980-opaskova-prezka-staromosaz-30mm/',
        priceCents: 9_910,
        note: PRONG_UNVERIFIED,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'belt-buckle-main',
        kind: 'photo',
        caption: 'Jednotrnová přezka 40 mm, posuvka měří vnitřní světlost a trn u kořene',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'chicago-screws',
    name: 'Šroubovací nýty (chicago screws)',
    englishName: 'Chicago screws',
    category: 'forming',
    shortDescription: 'Dva nýty drží přezku na přehnutém konci. Délka dříku podle tloušťky pásu.',
    purpose:
      'Šroubovací nýt má hlavičku s dutým dříkem a šroubek. Prochází oběma vrstvami přehnutého konce. Drží, jen když je dřík o 1–1,5 mm kratší než spoj (2 × tloušťka pásu). Přezka jde později vyměnit.',
    buyingGuide: [
      {
        label: 'Dřík',
        value:
          '2 × tloušťka pásu − 1,5 až − 1 mm; 10/6 sedí na pás 3,5–3,75 mm (tabulka Váš pásek)',
      },
      { label: 'Hlavička', value: 'Ø 10 mm (s ní počítá kapsa pro poutko)' },
      { label: 'Kusů', value: '2' },
    ],
    cautions: [
      'Delší dřík než spoj: hlavička dosedne na dřík dřív, než přitlačí kůži, a nýt se viklá.',
      'Dřík kratší o víc než 1,5 mm nedosáhne do závitu.',
      'Sedlářský knoflík (sam browne stud) není šroubovací nýt.',
    ],
    avoid: [],
    alternatives: [],
    priceRange: { minCents: 1_600, maxCents: 14_000 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Spodní mez jsou 2 kusy 10/6 z CraftPointu (8 Kč/ks), horní balení 10 ks z Andexnite.`,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Šroubovací nýty 10/6 mm, stříbrné',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6-mm-stribrne',
        priceCents: 800,
        priceNote: 'za kus; 10 ks za 69 Kč',
        note: 'Hlavička 10, dřík 6 mm: na pás 3,5–3,75 mm. CraftPoint jinou délku nemá.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Šroubovací nýty 10/6 mm, bronz (staré zlato)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6mm-bronz-stare-zlato',
        priceCents: 800,
        priceNote: 'za kus; 10 ks za 69 Kč',
        note: 'Na pás 3,5–3,75 mm; barva k mosazné přezce.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Šroubovací nýty 10/6 mm, černý nikl',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6mm-cerny-nikl',
        priceCents: 800,
        priceNote: 'za kus; 10 ks za 69 Kč',
        note: 'Na pás 3,5–3,75 mm.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Opaskový šroubek nikl přes mosaz, hladký, profi',
        shop: 'Leatory',
        url: 'https://www.leatory.cz/nyty--ozdoby-a-ostatni/opaskovy-sroubek-nikl-pres-mosaz-hladky-profi/',
        variant: 'dřík 6 mm',
        priceCents: 1_900,
        priceNote: 'za kus',
        note: 'Hlavička 10, tělo Ø 5, dřík 6 mm: na pás 3,5–3,75 mm. Obchod má i 10 a 13 mm, na tento pásek moc dlouhé.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Šroubovací nýt Ø 9 × 5 mm, černý nikl, 10 ks',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/sroubovaci-nyt-o-9-x-5-mm-o-95-x-6-mm-cerny-nikl-10-ks/',
        variant: '9 × 5 mm',
        priceCents: 14_000,
        priceNote: 'za 10 ks',
        note: 'Podle názvu hlavička 9, dřík 5 mm: na pás 3,0–3,25 mm. Délku dříku si před objednávkou potvrďte u prodejce.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Šroubovací nýt Ø 9,5 × 6,5 mm, černý nikl, 10 ks',
        shop: 'Andexnite',
        url: 'https://andexnite.cz/produkt/sroubovaci-nyt-o-9-x-5-mm-o-95-x-6-mm-cerny-nikl-10-ks/',
        variant: '9,5 × 6,5 mm',
        priceCents: 14_000,
        priceNote: 'za 10 ks',
        note: 'Podle názvu dřík 6,5 mm: na pás 3,75–4,0 mm. Délku dříku si před objednávkou potvrďte u prodejce.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'chicago-screws-main',
        kind: 'photo',
        caption: 'Rozšroubovaný nýt 10/6 vedle přehnutého konce pásu se dvěma otvory Ø 6 mm',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'hole-punch-6mm',
    name: 'Výsečník Ø 6 mm',
    englishName: 'Round hollow punch 6 mm',
    category: 'cutting',
    shortDescription: 'Otvory pro nýty a oba konce oválu pro trn.',
    purpose:
      'Kulatý dutý výsečník Ø 6 mm proseká čtyři otvory pro dva šroubovací nýty a oba konce oválu, kterým prochází trn přezky.',
    buyingGuide: [
      { label: 'Typ', value: 'dutý kruhový výsečník, ne plný průbojník na kov' },
      { label: 'Průměr', value: '6 mm' },
    ],
    cautions: [
      'Revolverový děrovač 2–4,5 mm šestku nepokryje.',
      'Jeden otvor Ø 6 mm na špatném místě uprostřed pásu je zkažený pás. Vysekávejte jen značky, které jsou opravdu otvory.',
    ],
    avoid: [{ title: 'Plný průbojník na kov', reason: 'kůži jen promáčkne, díru neudělá.' }],
    alternatives: [],
    priceRange: { minCents: 2_900, maxCents: 13_100 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 6 mm)',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 6 mm',
        priceCents: 2_900,
        priceNote: 'za kus',
        note: 'Stejná objednávka jako pás, přezka a nýty.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Kruhový výsečník Format 6 mm',
        shop: 'Enaradinastroje',
        url: 'https://www.enaradinastroje.cz/kruhovy-vysecnik-format-6mm/',
        priceCents: 13_100,
        note: 'Skladem do 48 hodin. Jestli čistě prosekne 3,5 mm kůži, ověřte na odřezku.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'hole-punch-6mm-main',
        kind: 'photo',
        caption: 'Výsečník Ø 6 mm na konci oválu pro trn, obtaženého šídlem na rubu pásu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: 'belt-end-punch',
    name: 'Výsečník na konec opasku',
    englishName: 'Belt end punch',
    category: 'cutting',
    shortDescription:
      'Vysekne zaoblený konec nebo špičku jedním úderem. Jen když budete dělat víc pásků.',
    purpose:
      'Tvarový výsečník v šířce pásu nahradí řez nožem u konce pásu. Pro jeden pásek se nevyplatí; destička nebo list 2 a nůž podél ocelového pravítka stačí.',
    buyingGuide: [
      { label: 'Velikost', value: 'stejná jako šířka pásu' },
      { label: 'Tvar', value: 'zaoblený konec, nebo hrot (šipka)' },
    ],
    cautions: [
      'Tvar hrotu výsečníku se nemusí shodovat s hrotem na destičce a listu 2 (sklon a vrchol R4). Ověřte na odřezku.',
      'Hrot má CraftPoint jen pro 35 a 40 mm.',
    ],
    avoid: [],
    alternatives: [
      {
        title: 'Nůž podél ocelového pravítka',
        reason: 'rovné boky špičky; vrchol a oblouk od ruky v několika tazích.',
      },
    ],
    priceRange: { minCents: 39_300, maxCents: 56_300 },
    priceSource: 'verified',
    priceNote: VERIFIED_NOTE,
    alsoUsedFor: [],
    examples: [
      {
        title: 'Výsečník na zakulacení konců opasku 15–45 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecnik-na-zakulaceni-koncu-opasku-15-45mm',
        priceCents: 39_300,
        note: 'Velikost podle šířky pásu; v době ověření všechny skladem.',
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Výsečník na konce opasku do šipky 35 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecnik-na-konce-opasku-do-sipky-35-40mm',
        variant: '35 mm',
        priceCents: 50_700,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
      {
        title: 'Výsečník na konce opasku do šipky 40 mm',
        shop: 'CraftPoint',
        url: 'https://craft-point.cz/products/vysecnik-na-konce-opasku-do-sipky-35-40mm',
        variant: '40 mm',
        priceCents: 56_300,
        availability: 'in_stock',
        checkedAt: CHECKED,
      },
    ],
    commonlyAtHome: false,
    media: [
      {
        id: 'belt-end-punch-main',
        kind: 'photo',
        caption: 'Výsečník na zaoblený konec přiložený na konec pásu na děrovací desce',
        status: 'planned',
      },
    ],
  }),
];
