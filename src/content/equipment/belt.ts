import { type EquipmentDefinition, type ProductExample } from '@/content/schema';

/**
 * Položky katalogu, které přibyly s projektem 04 (pásek, docs/zadani/opasek-postup.md
 * a opasek-parametry.md). Každý příklad je ze stránky načtené 8. 10. 2026 (CraftPoint přes
 * `…/products/<handle>.js`, Andexnite přes Store API, Shoptet obchody z dat variant, ostatní
 * z HTML). Pásy jsou zrcadlem `src/lib/patterns/belt-strap-offers.ts` (shodu hlídá test). Co stránka neuvádí, je
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
  color: 'přírodní',
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
  note: 'Jen šířka 40 mm, tloušťka 3,5–4 mm. Totéž zboží jako Imago. Činění stránka neuvádí, ověřte u prodejce. Doprava Balíkovna 79 Kč, GLS výdejní místo 75 Kč.',
  availability: 'in_stock',
  color: 'přírodní',
  checkedAt: CHECKED,
});

/**
 * Leatory řeže pás 3,9 mm na míru po 1 mm šířky a 10 cm délky (Shoptet varianty). V katalogu
 * jsou délky 130, 140 a 150 cm pro šířky 28–45 mm; haléře za 130 / 140 / 150 cm.
 */
const LEATORY_STRAP_CENTS: Readonly<Record<number, readonly [number, number, number]>> = {
  28: [17_840, 19_210, 20_580],
  29: [18_480, 19_900, 21_320],
  30: [19_110, 20_580, 22_050],
  31: [19_750, 21_270, 22_790],
  32: [20_390, 21_960, 23_520],
  33: [21_030, 22_640, 24_260],
  34: [21_660, 23_330, 24_990],
  35: [22_300, 24_010, 25_730],
  36: [22_940, 24_700, 26_460],
  37: [23_570, 25_390, 27_200],
  38: [24_210, 26_070, 27_930],
  39: [24_850, 26_760, 28_670],
  40: [25_480, 27_440, 29_400],
  41: [26_120, 28_130, 30_140],
  42: [26_760, 28_820, 30_870],
  43: [27_400, 29_500, 31_610],
  44: [28_030, 30_190, 32_340],
  45: [28_670, 30_870, 33_080],
};

const leatoryStraps = (): ProductExample[] =>
  Object.entries(LEATORY_STRAP_CENTS).flatMap(([width, cents]) =>
    [130, 140, 150].map((lengthCm, i) => ({
      title: `Řemen na opasek 3,9 mm, přírodní, ${width} mm × ${lengthCm} cm`,
      shop: 'Leatory',
      url:
        Number(width) < 30
          ? 'https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-5-29-mm/'
          : 'https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-30-50-mm/',
      variant: `${width} mm, ${lengthCm} cm`,
      priceCents: cents[i]!,
      note: 'Třísločiněná hlazenice z ČR, 3,9 ± 0,1 mm. Řežou na míru, vyřízení 2–3 dny. Doprava Zásilkovna nebo PPL 79 Kč.',
      availability: 'in_stock' as const,
      color: 'přírodní',
      checkedAt: CHECKED,
    })),
  );

const DVAPASOVCI_URL = 'https://www.dvapasovci.cz/prirezy-kuze-na-opasky/';

const dvapasovciStrap = (
  widthMm: number,
  priceCzk: number,
  availability: ProductExample['availability'],
): ProductExample => ({
  title: `Přířez kůže na opasek, přírodní hovězina, ${widthMm} mm`,
  shop: 'Dva pásovci',
  url: DVAPASOVCI_URL,
  variant: `${widthMm} mm`,
  priceCents: priceCzk * 100,
  note:
    availability === 'in_stock'
      ? 'Třísločiněná, 3,5 mm, délka 125–140 cm. Skladem víc než 5 ks. Doprava PPL, cenu stránka neuvádí.'
      : 'Třísločiněná, 3,5 mm, délka 125–140 cm. Stránka píše „skladem“, ale sklad je záporný: řežou na objednávku. Doprava PPL, cenu stránka neuvádí.',
  availability,
  color: 'přírodní',
  checkedAt: CHECKED,
});

const ecocaseStrap = (widthMm: number, priceCzk: number): ProductExample => ({
  title: `Kožený řemen na opasky, světle hnědý (A), ${widthMm} mm`,
  shop: 'Ecocase',
  url: 'https://www.ecocase.cz/kuze/kozeny-remen-na-opasky-svetle-hnedy-a/',
  variant: `${widthMm} mm`,
  priceCents: priceCzk * 100,
  note: 'Třísločiněný krupon, barvený, 3,6 mm, délka 130–140 cm. Skladem víc než 5 ks. Se seříznutými hranami o 20 Kč dráž. Doprava jen po ČR, cenu stránka neuvádí.',
  availability: 'in_stock',
  color: 'světle hnědá',
  checkedAt: CHECKED,
});

const imagoStrap = (widthMm: 30 | 40, lengthCm: number, priceCzk: number): ProductExample => ({
  title: `Hovězí kůže na opasek, přírodní, ${widthMm / 10} cm, ${lengthCm} cm`,
  shop: 'Imago',
  url:
    widthMm === 30
      ? 'https://www.imago.cz/hovezi-kuze-na-opasek'
      : 'https://www.imago.cz/kuze-na-opasek-prirodni-4cm',
  variant: `${widthMm} mm, ${lengthCm} cm`,
  priceCents: priceCzk * 100,
  note: `Tloušťka 3,5–4 mm. Činění stránka neuvádí, ověřte u prodejce.${lengthCm > 130 ? ' Přepínač délek na stránce ukazuje nižší cenu než košík, počítejte s touto.' : ''} Doprava GLS výdejní místo 59 Kč, Balíkovna 69 Kč.`,
  availability: 'in_stock',
  color: 'přírodní',
  checkedAt: CHECKED,
});

const andexniteStrap = (
  product: '130-cm-3-9-4-1-mm' | '140-cm-3-1-3-4-mm',
  widthMm: number,
  priceCzk: number,
): ProductExample => {
  const long = product === '140-cm-3-1-3-4-mm';
  return {
    title: `Hovězí kůže na opasek, přírodní, ${long ? '140 cm, 3,1–3,4 mm' : '130 cm, 3,9–4,1 mm'}, ${String(widthMm / 10).replace('.', ',')} cm`,
    shop: 'Andexnite',
    url: `https://andexnite.cz/produkt/hovezi-kuze-na-opasek-prirodni-${product}/`,
    variant: `${widthMm} mm`,
    priceCents: priceCzk * 100,
    note: 'Skladem, počet kusů neuveden. Činění stránka neuvádí, ověřte u prodejce. Doprava u objednávky do 500 Kč 120 Kč.',
    availability: 'in_stock',
    color: 'přírodní',
    checkedAt: CHECKED,
  };
};

const sedlarskeStrap = (widthMm: number, priceCzk: number): ProductExample => ({
  title: `Kožený řemen 130, síla 3,8–4 mm, ${widthMm} mm`,
  shop: 'Sedlářské nářadí',
  url: 'https://sedlarskenaradi.cz/kozeny-remen-130-sila-3-8-4mm/',
  variant: `${widthMm} mm`,
  priceCents: priceCzk * 100,
  note: 'Krupon, délka 130 cm, 40 mm nemá. Činění u výrobku neuvedeno, ověřte. Stránka píše „skladem“ i „na objednávku 2–3 týdny“. Zásilkovna 89 Kč, pás 130 cm možná jako nadrozměr.',
  availability: 'in_stock',
  color: 'přírodní',
  checkedAt: CHECKED,
});

/* Barvené pásy (projekt 04 – barevný pásek), ověřeno 8. 10. 2026. Zrcadlo `DYED_STRAP_SOURCES`. */

const CRAFTPOINT_SHIPPING_NOTE = 'Doprava kurýrem 150 Kč, zdarma od 2 000 Kč.';

const craftpointDyedStraps = (
  color: string,
  handle: string,
  title: string,
  note: string,
  prices: Readonly<Record<number, number>>,
): ProductExample[] =>
  Object.entries(prices).map(([width, czk]) => ({
    title: `${title}, šířka ${width} mm`,
    shop: 'CraftPoint',
    url: `https://craft-point.cz/products/${handle}`,
    variant: `${width} mm`,
    priceCents: czk * 100,
    note: `${note} ${CRAFTPOINT_SHIPPING_NOTE}`,
    availability: 'in_stock' as const,
    color,
    checkedAt: CHECKED,
  }));

const CRAFTPOINT_DYED_CZK = { 28: 234, 30: 234, 33: 262, 35: 262, 38: 291, 40: 291, 45: 313 };
const CRAFTPOINT_33_38_CZK = { 33: 313, 38: 336 };

const leatoryDyedStraps = (color: 'hnědý' | 'černý'): ProductExample[] => {
  const suffix = color === 'hnědý' ? 'hnedy' : 'cerny';
  return Object.entries(LEATORY_STRAP_CENTS).flatMap(([width, cents]) =>
    [130, 140, 150].map((lengthCm, i) => ({
      title: `Řemen na opasek 3,9 mm, ${color}, ${width} mm × ${lengthCm} cm`,
      shop: 'Leatory',
      url: `https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-${Number(width) < 30 ? '5-29' : '30-50'}-mm-${suffix}/`,
      variant: `${width} mm, ${lengthCm} cm`,
      priceCents: cents[i]!,
      note: 'Probarvená třísločiněná hlazenice z ČR, 3,9 ± 0,1 mm. Řežou na míru, vyřízení 2–3 dny. Doprava Zásilkovna nebo PPL 79 Kč.',
      availability: 'in_stock' as const,
      color: color === 'hnědý' ? 'hnědá' : 'černá',
      checkedAt: CHECKED,
    })),
  );
};

/** Dva pásovci, barvené: 32 mm skladem víc než 5 ks, 38 a 44 mm záporný sklad (řežou se). */
const dvapasovciDyedStraps = (
  color: string,
  slug: string,
  title: string,
  note: string,
  stockKnown = true,
): ProductExample[] =>
  (
    [
      [32, 286],
      [38, 338],
      [44, 394],
    ] as const
  ).map(([widthMm, czk]) => {
    const inStock = !stockKnown || widthMm === 32;
    return {
      title: `${title}, ${widthMm} mm`,
      shop: 'Dva pásovci',
      url: `https://www.dvapasovci.cz/prirezy-kuze-na-opasky-${slug}/`,
      variant: `${widthMm} mm`,
      priceCents: czk * 100,
      note: `${note} ${
        !stockKnown
          ? 'Stránka píše „skladem“, počet kusů neuvádí.'
          : inStock
            ? 'Skladem víc než 5 ks.'
            : 'Stránka píše „skladem“, ale sklad je záporný: řežou na objednávku.'
      } Doprava PPL, cenu stránka neuvádí.`,
      availability: inStock ? ('in_stock' as const) : ('preorder' as const),
      color,
      checkedAt: CHECKED,
    };
  });

const ecocaseDyedStraps = (
  color: string,
  slug: string,
  title: string,
  note: string,
  variantPrefix = '',
): ProductExample[] =>
  (
    [
      [30, 259],
      [35, 269],
      [40, 279],
    ] as const
  ).map(([widthMm, czk]) => ({
    title: `${title}, ${widthMm} mm`,
    shop: 'Ecocase',
    url: `https://www.ecocase.cz/kuze/${slug}/`,
    variant: `${variantPrefix}${widthMm} mm`,
    priceCents: czk * 100,
    note: `${note} Skladem víc než 5 ks. Se seříznutými hranami o 20 Kč dráž. Doprava jen po ČR, cenu stránka neuvádí.`,
    availability: 'in_stock' as const,
    color,
    checkedAt: CHECKED,
  }));

const imagoDyedStraps = (color: 'hnědá' | 'černá'): ProductExample[] => {
  const slug = color === 'hnědá' ? 'hneda' : 'cerna';
  return ([30, 40] as const).flatMap((widthMm) =>
    (
      [
        [130, widthMm === 30 ? 249 : 299],
        [150, widthMm === 30 ? 279 : 329],
        [180, widthMm === 30 ? 329 : 379],
      ] as const
    ).map(([lengthCm, czk]) => ({
      title: `Hovězí kůže na opasek, ${color}, ${widthMm / 10} cm, ${lengthCm} cm`,
      shop: 'Imago',
      url:
        widthMm === 30
          ? `https://www.imago.cz/hovezi-kuze-na-opasek-${slug}`
          : `https://www.imago.cz/kuze-na-opasek-${slug}-4cm`,
      variant: `${widthMm} mm, ${lengthCm} cm`,
      priceCents: czk * 100,
      note: `Probarvená hovězí kůže, 3,5–4 mm. Činění stránka neuvádí, ověřte u prodejce.${lengthCm > 130 ? ' Přepínač délek na stránce ukazuje nižší cenu než košík, počítejte s touto.' : ''} Doprava GLS výdejní místo 59 Kč, Balíkovna 69 Kč.`,
      availability: 'in_stock' as const,
      color,
      checkedAt: CHECKED,
    })),
  );
};

/** Andexnite, barvené: jen šířky skladem (vyprodané vynechány). Tloušťka a délka z názvu. */
const andexniteDyedStraps = (
  color: string,
  slug: string,
  title: string,
  prices: Readonly<Record<number, number>>,
): ProductExample[] =>
  Object.entries(prices).map(([width, czk]) => ({
    title: `${title}, ${String(Number(width) / 10).replace('.', ',')} cm`,
    shop: 'Andexnite',
    url: `https://andexnite.cz/produkt/${slug}/`,
    variant: `${width} mm`,
    priceCents: czk * 100,
    note: 'Činění ani probarvení stránka neuvádí, ověřte u prodejce. Doprava u objednávky do 500 Kč 120 Kč.',
    availability: 'in_stock' as const,
    color,
    checkedAt: CHECKED,
  }));

const ANDEXNITE_STD_CZK = { 30: 255, 35: 285, 40: 320 };

/** Pořadí barev v katalogu (jako výběr ve „Váš pásek“): od světlé k tmavé, pak ostatní. */
const DYED_COLOR_ORDER = [
  'světle hnědá',
  'hnědá',
  'tmavě hnědá',
  'koňak',
  'tabák',
  'černá',
  'modrá',
  'bordó',
  'tmavě zelená',
];

/** Barvené pásy seřazené podle barvy (stabilně: uvnitř barvy v pořadí obchodů níže). */
const dyedStraps = (): ProductExample[] =>
  unsortedDyedStraps().sort(
    (a, b) => DYED_COLOR_ORDER.indexOf(a.color ?? '') - DYED_COLOR_ORDER.indexOf(b.color ?? ''),
  );

const unsortedDyedStraps = (): ProductExample[] => [
  ...craftpointDyedStraps(
    'tmavě hnědá',
    'sedlarsky-remen-z-prave-kuze-30-35mm-140cm-15-80mm-tmave-hneda',
    'Sedlářský řemen z pravé kůže 3,0–3,5 mm, 130–140 cm, tmavě hnědý',
    'Třísločiněná, z vazu, tovární povrchová úprava (probarvení obchod neuvádí).',
    CRAFTPOINT_DYED_CZK,
  ),
  ...craftpointDyedStraps(
    'černá',
    'remen-z-prave-kuze-3-0-3-5mm-140cm-15-80mm-cerny',
    'Řemen z pravé kůže 3,0–3,5 mm, 130–140 cm, černý',
    'Třísločiněná, z vazu, tovární povrchová úprava (probarvení obchod neuvádí).',
    CRAFTPOINT_DYED_CZK,
  ),
  ...craftpointDyedStraps(
    'koňak',
    'kozeny-remen-3-0-3-5mm-140cm-15-80mm-konak',
    'Kožený řemen 3,0–3,5 mm, 130–140 cm, koňak',
    'Třísločiněná, z vazu, z výroby nabarvená (probarvení obchod neuvádí).',
    CRAFTPOINT_DYED_CZK,
  ),
  ...craftpointDyedStraps(
    'bordó',
    'kozeny-remen-maya-35-4mm-130-140cm-33-38mm-bordeaux',
    'Kožený řemen Maya 3,5–4 mm, 130–140 cm, bordeaux',
    'Třísločiněná kůže Maya (Il Ponte), povrchově upravená. Obchod píše k 33 mm přezku 35 mm, k 38 mm přezku 40 mm.',
    CRAFTPOINT_33_38_CZK,
  ),
  ...craftpointDyedStraps(
    'tmavě zelená',
    'remen-z-kuze-maya-3-5-4mm-130-140cm-33-38mm-foresta',
    'Řemen z kůže Maya 3,5–4 mm, 130–140 cm, foresta (tmavě zelená)',
    'Třísločiněná kůže Maya (Il Ponte). Obchod píše k 33 mm přezku 35 mm, k 38 mm přezku 40 mm.',
    CRAFTPOINT_33_38_CZK,
  ),
  ...craftpointDyedStraps(
    'koňak',
    'remen-z-buvoli-kuze-buffalo-handwax-35-4mm-140cm-33-38mm-konak',
    'Řemen z buvolí kůže Buffalo Handwax 3,5–4 mm, 140 cm, koňak',
    'Latigo (kombinované činění, ne třísločiněná), pull-up, délka 140–150 cm.',
    CRAFTPOINT_33_38_CZK,
  ),
  ...leatoryDyedStraps('hnědý'),
  ...leatoryDyedStraps('černý'),
  ...dvapasovciDyedStraps(
    'hnědá',
    'hneda--razba-bark',
    'Přířez kůže na opasek, hnědá, ražba bark',
    'Třísločiněná, plně probarvená, 3,5 mm, délka 120–140 cm.',
  ),
  ...dvapasovciDyedStraps(
    'černá',
    'cerna',
    'Přířez kůže na opasek, černá hovězina',
    'Plnolícová, matná, 3,5 mm, délka 130–140 cm. Činění stránka neuvádí, ověřte u prodejce.',
  ),
  ...dvapasovciDyedStraps(
    'tabák',
    'tabak',
    'Přířez kůže na opasek, tabák',
    'Barvená na tabákový odstín, 3,5 mm, délka 130–140 cm. Činění stránka neuvádí, ověřte u prodejce.',
    false,
  ),
  ...dvapasovciDyedStraps(
    'koňak',
    'london',
    'Přířez kůže na opasek, london (koňak)',
    'Barvená na koňakový odstín, 3,5 mm, délka 130–140 cm. Činění stránka neuvádí, ověřte u prodejce.',
  ),
  ...dvapasovciDyedStraps(
    'modrá',
    'modra-hovezina',
    'Přířez kůže na opasek, modrá hovězina',
    'Matná, 3,5 mm, délka 130–140 cm. Činění stránka neuvádí, ověřte u prodejce.',
  ),
  ecocaseStrap(30, 259),
  ecocaseStrap(35, 269),
  ecocaseStrap(40, 279),
  ...ecocaseDyedStraps(
    'černá',
    'kozeny-remen-na-opasky',
    'Kožený řemen na opasky, černý matný',
    'Třísločiněný krupon, 3,7 mm, délka 120–140 cm; vedle je černá lesklá 2,7 mm, ta je na pásek tenká.',
    'matná, ',
  ),
  ...ecocaseDyedStraps(
    'tmavě hnědá',
    'kozeny-remen-na-opasky-hnedy-a',
    'Kožený řemen na opasky, tmavě hnědý (A)',
    'Třísločiněný krupon, 3 mm, délka 130–140 cm.',
  ),
  ...ecocaseDyedStraps(
    'světle hnědá',
    'kozeny-remen-na-opasky-svetle-hnedy-b-',
    'Kožený řemen na opasky, světle hnědý (B)',
    'Třísločiněný krupon, 3,6 mm, délka 130–140 cm.',
  ),
  ...imagoDyedStraps('hnědá'),
  ...imagoDyedStraps('černá'),
  ...andexniteDyedStraps(
    'tmavě hnědá',
    'hovezi-kuze-na-opasek-tmave-hneda-140-155cm-3-4-3-6-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 140–155 cm, 3,4–3,6 mm',
    ANDEXNITE_STD_CZK,
  ),
  ...andexniteDyedStraps(
    'tmavě hnědá',
    'hovezi-kuze-na-opasek-tmave-hneda-130cm-3-4-3-7-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,4–3,7 mm',
    { 30: 255, 35: 280, 40: 320 },
  ),
  ...andexniteDyedStraps(
    'tmavě hnědá',
    'hovezi-kuze-na-opasek-tmave-hneda-130cm-3-2-3-3-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,2–3,3 mm',
    { 30: 245, 35: 280, 40: 320 },
  ),
  ...andexniteDyedStraps(
    'tmavě hnědá',
    'hovezi-kuze-na-opasek-tmave-hneda-130-cm-3-1-3-2-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,1–3,2 mm',
    { 40: 320 },
  ),
  ...andexniteDyedStraps(
    'tmavě hnědá',
    'hovezi-kuze-na-opasek-tmave-hneda-125-cm-3-0-3-2-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 125 cm, 3,0–3,2 mm',
    { 30: 255, 35: 280 },
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-140-145cm-3-6-3-9-mm',
    'Hovězí kůže na opasek, hnědá, 140–145 cm, 3,6–3,9 mm',
    ANDEXNITE_STD_CZK,
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4-3-6mm',
    'Hovězí kůže na opasek, hnědá, 145 cm, 3,4–3,6 mm',
    ANDEXNITE_STD_CZK,
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4-3-6mm-2',
    'Hovězí kůže na opasek, hnědá, 125 cm, 3,4–3,6 mm',
    ANDEXNITE_STD_CZK,
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4mm',
    'Hovězí kůže na opasek, hnědá, 145 cm, 3,4 mm',
    ANDEXNITE_STD_CZK,
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-130-cm-3-8-3-9-mm',
    'Hovězí kůže na opasek, hnědá, 125–130 cm, 3,8–3,9 mm',
    { 30: 255, 40: 320 },
  ),
  ...andexniteDyedStraps(
    'hnědá',
    'hovezi-kuze-na-opasek-hneda-130cm-3-0-3-2-mm',
    'Hovězí kůže na opasek, hnědá, 130 cm, 3,0–3,2 mm',
    { 35: 280 },
  ),
  ...andexniteDyedStraps(
    'černá',
    'hovezi-kuze-na-opasek-cerna-125-cm-3-5-3-8-mm-kopirovat',
    'Hovězí kůže na opasek, černá, 125 cm, 3,5–3,8 mm',
    { 35: 280 },
  ),
  ...andexniteDyedStraps(
    'černá',
    'hovezi-kuze-na-opasek-cerna-125cm-39-41-mm',
    'Hovězí kůže na opasek, černá, 125 cm, 3,9–4,1 mm',
    { 30: 225, 35: 260, 40: 290 },
  ),
];

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
      { label: 'Činění', value: 'třísločiněná („veg-tan“)' },
      {
        label: 'Barva',
        value:
          'přírodní (výchozí, natře se balzámem), nebo barevný; u barevného řezané hrany obarvíte barvou na hrany',
      },
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
      'Činění uvádí CraftPoint (kromě latiga Buffalo), Leatory, Ecocase a u Dvou pásovců přírodní a hnědý bark. U ostatních barev Dvou pásovců, Imaga, Křupsonu, Andexnite a Sedlářského nářadí ho ověřte u prodejce.',
      'Barevný pás bývá barvený jen na povrchu: řezaná hrana je světlá. Probarvení uvádí jen Leatory, Dva pásovci (bark) a Imago.',
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
    priceRange: { minCents: 17_840, maxCents: 39_400 },
    priceSource: 'verified',
    priceNote: `${VERIFIED_NOTE} Cena závisí na šířce a délce: Leatory 28 mm × 130 cm 178,40 Kč, CraftPoint 228–313 Kč, Dva pásovci 44 mm 394 Kč.`,
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
      ...leatoryStraps(),
      dvapasovciStrap(32, 286, 'in_stock'),
      dvapasovciStrap(38, 338, 'preorder'),
      dvapasovciStrap(44, 394, 'preorder'),
      imagoStrap(30, 130, 249),
      imagoStrap(30, 150, 279),
      imagoStrap(30, 180, 329),
      imagoStrap(40, 130, 299),
      imagoStrap(40, 150, 329),
      imagoStrap(40, 180, 379),
      andexniteStrap('130-cm-3-9-4-1-mm', 30, 255),
      andexniteStrap('130-cm-3-9-4-1-mm', 35, 285),
      andexniteStrap('130-cm-3-9-4-1-mm', 40, 320),
      andexniteStrap('140-cm-3-1-3-4-mm', 30, 255),
      andexniteStrap('140-cm-3-1-3-4-mm', 35, 285),
      andexniteStrap('140-cm-3-1-3-4-mm', 40, 320),
      sedlarskeStrap(30, 183),
      sedlarskeStrap(35, 214),
      sedlarskeStrap(45, 275),
      ...dyedStraps(),
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
        priceCents: 50_600,
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
