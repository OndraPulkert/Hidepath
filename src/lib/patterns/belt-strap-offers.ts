/**
 * Hotové pásy na opasek z ověřených obchodů (8. 10. 2026), přírodní i barvené, a výběr výchozí
 * nabídky podle barvy. Čisté funkce bez Reactu. Data ze stránek obchodů: CraftPoint `<url>.js`, Shoptet varianty (Leatory, Dva
 * pásovci, Ecocase, Křupson), WooCommerce Store API (Andexnite), JSON-LD a ceny variant (Imago),
 * HTML (Sedlářské nářadí). Katalog vybavení (`src/content/equipment/belt.ts`, `belt-strap`) má
 * tytéž nabídky jako příklady; shodu hlídá test projektu. Co jsme neověřili, je
 * v docs/content/notes-vybaveni.md jako „neověřeno“ a sem nepatří.
 */

export type StrapAvailability = 'in_stock' | 'preorder' | 'unavailable';

/**
 * Barva pásu. `prirodni` = nebarvený přírodní pás (výchozí, první pásek), ostatní jsou hotové
 * barvené pásy z ověřených obchodů. Hodnoty jsou slug (zápisník, „Moje pásky“).
 */
export const STRAP_COLORS = [
  'prirodni',
  'svetle-hneda',
  'hneda',
  'tmave-hneda',
  'konak',
  'tabak',
  'cerna',
  'modra',
  'bordo',
  'zelena',
] as const;
export type StrapColor = (typeof STRAP_COLORS)[number];

/** Barvy barevných pásů v pořadí pro výběr. */
export const DYED_STRAP_COLORS: readonly Exclude<StrapColor, 'prirodni'>[] = STRAP_COLORS.filter(
  (c): c is Exclude<StrapColor, 'prirodni'> => c !== 'prirodni',
);

/** Název barvy malými písmeny (do vět a popisků). */
export const STRAP_COLOR_LABELS: Readonly<Record<StrapColor, string>> = {
  prirodni: 'přírodní',
  'svetle-hneda': 'světle hnědá',
  hneda: 'hnědá',
  'tmave-hneda': 'tmavě hnědá',
  konak: 'koňak',
  tabak: 'tabák',
  cerna: 'černá',
  modra: 'modrá',
  bordo: 'bordó',
  zelena: 'tmavě zelená',
};

export const isStrapColor = (v: unknown): v is StrapColor =>
  typeof v === 'string' && (STRAP_COLORS as readonly string[]).includes(v);

/** Barevný pás (cokoli kromě přírodního). */
export const isDyedStrap = (color: StrapColor | undefined): boolean =>
  color !== undefined && color !== 'prirodni';

/** Datum ověření všech nabídek (ISO). */
export const STRAP_OFFERS_CHECKED_AT = '2026-10-08';

export interface StrapSource {
  shop: string;
  /** Výrobek, jak se jmenuje v obchodě (zkráceně). */
  product: string;
  /** Odkaz podle šířky (Leatory má pro 28–29 mm jiný výrobek). */
  url: (widthMm: number) => string;
  /** Tloušťka, kterou obchod uvádí (nominál). */
  thicknessMm: readonly [number, number];
  /**
   * Naměřená tloušťka, při které nabídku ještě ukážeme. Tloušťka se měří až po dodání:
   * CraftPoint 3–3,5 mm přijde 3,5–3,75 mm (docs/zadani/opasek-postup.md, krok 3); u ostatních
   * nominál ± 0,1 mm (Leatory ± 0,1 mm uvádí, Dva pásovci „odchylka v desetinách mm“).
   */
  measuredMm: readonly [number, number];
  /** Délky, které obchod zaručuje (u rozpětí „130–140 cm“ ta kratší). */
  lengthsCm: readonly number[];
  /** Cena v haléřích s DPH podle šířky (mm) a délky; chybí = šířka se neprodává. */
  priceCents: (widthMm: number, lengthCm: number) => number | undefined;
  availability: (widthMm: number, lengthCm: number) => StrapAvailability;
  /** Varianta příkladu v katalogu (spolu s URL ho jednoznačně určuje). */
  variant: (widthMm: number, lengthCm: number) => string;
  /** Obchod na stránce uvádí třísločiněnou kůži. */
  tanningVerified: boolean;
  color: StrapColor;
  /** Doprava v ČR, jak ji uvádí obchod (nebo „neověřeno“). */
  shipping: string;
  note: string;
}

export interface StrapOffer {
  shop: string;
  product: string;
  url: string;
  variant: string;
  lengthCm: number;
  priceCents: number;
  availability: StrapAvailability;
  tanningVerified: boolean;
  color: StrapColor;
  shipping: string;
  /** Tloušťka, činění, sklad – krátce. */
  note: string;
  checkedAt: string;
}

const EPS = 1e-9;
const czk = (table: Readonly<Record<number, number>>) => (w: number) =>
  table[w] === undefined ? undefined : table[w] * 100;

/** Doprava CraftPointu (kurýr z Polska, ověřeno 8. 10. 2026). */
const CRAFTPOINT_SHIPPING = 'kurýr 150 Kč, zdarma od 2 000 Kč; pás, přezka i nýty v jedné zásilce';

/** CraftPoint: šířka → Kč (ceny 130–140 cm, `.js`). Aplikace pouští 28–45 mm. */
const CRAFTPOINT_CZK: Readonly<Record<number, number>> = {
  28: 228,
  30: 228,
  33: 256,
  35: 256,
  38: 285,
  40: 285,
  45: 313,
};

/** Leatory: šířka → haléře za 130 / 140 / 150 cm (Shoptet `necessaryVariantData`). */
const LEATORY_CENTS: Readonly<Record<number, readonly [number, number, number]>> = {
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
const LEATORY_LENGTHS_CM = [130, 140, 150] as const;

/** Dva pásovci, přírodní: 32 mm skladem >5 ks; 38 a 44 mm mají záporný sklad = řežou se. */
const DVAPASOVCI_CZK: Readonly<Record<number, number>> = { 32: 286, 38: 338, 44: 394 };

/** Imago: šířka → délka → Kč (cena varianty s DPH; přepínač na stránce ukazuje u 150 a 180 cm méně). */
const IMAGO_CZK: Readonly<Record<number, Readonly<Record<number, number>>>> = {
  30: { 130: 249, 150: 279, 180: 329 },
  40: { 130: 299, 150: 329, 180: 379 },
};

const KRUPSON_40MM_CZK: Readonly<Record<number, number>> = { 130: 299, 150: 329, 180: 379 };

const ANDEXNITE_CZK: Readonly<Record<number, number>> = { 30: 255, 35: 285, 40: 320 };

export const STRAP_SOURCES: readonly StrapSource[] = [
  {
    shop: 'CraftPoint',
    product: 'Řemen z přírodní kůže 3–3,5 mm, 130–140 cm',
    url: () => 'https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm',
    thicknessMm: [3, 3.5],
    measuredMm: [3, 3.75],
    lengthsCm: [130],
    priceCents: czk(CRAFTPOINT_CZK),
    availability: () => 'in_stock',
    variant: (w) => `${w} mm`,
    tanningVerified: true,
    color: 'prirodni',
    shipping: CRAFTPOINT_SHIPPING,
    note: 'třísločiněná italská kůže, 3–3,5 mm (přijde 3,5–3,75 mm), délka 130–140 cm',
  },
  {
    shop: 'Leatory',
    product: 'Řemen na opasek 3,9 mm, přírodní, řez na míru',
    url: (w) =>
      w < 30
        ? 'https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-5-29-mm/'
        : 'https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-30-50-mm/',
    thicknessMm: [3.9, 3.9],
    measuredMm: [3.8, 4],
    lengthsCm: LEATORY_LENGTHS_CM,
    priceCents: (w, len) => {
      const i = LEATORY_LENGTHS_CM.indexOf(len as (typeof LEATORY_LENGTHS_CM)[number]);
      return i < 0 ? undefined : LEATORY_CENTS[w]?.[i];
    },
    availability: () => 'in_stock',
    variant: (w, len) => `${w} mm, ${len} cm`,
    tanningVerified: true,
    color: 'prirodni',
    shipping: 'Zásilkovna nebo PPL 79 Kč',
    note: 'třísločiněná hlazenice z ČR, 3,9 ± 0,1 mm; řez na míru, vyřízení 2–3 dny',
  },
  {
    shop: 'Dva pásovci',
    product: 'Přířez kůže na opasek, přírodní hovězina',
    url: () => 'https://www.dvapasovci.cz/prirezy-kuze-na-opasky/',
    thicknessMm: [3.5, 3.5],
    measuredMm: [3.4, 3.6],
    lengthsCm: [125],
    priceCents: czk(DVAPASOVCI_CZK),
    availability: (w) => (w === 32 ? 'in_stock' : 'preorder'),
    variant: (w) => `${w} mm`,
    tanningVerified: true,
    color: 'prirodni',
    shipping: 'PPL, cenu stránka neuvádí',
    note: 'třísločiněná, 3,5 mm, délka 125–140 cm; 38 a 44 mm řežou na objednávku',
  },
  {
    shop: 'Ecocase',
    product: 'Kožený řemen na opasky, světle hnědý (A)',
    url: () => 'https://www.ecocase.cz/kuze/kozeny-remen-na-opasky-svetle-hnedy-a/',
    thicknessMm: [3.6, 3.6],
    measuredMm: [3.5, 3.7],
    lengthsCm: [130],
    priceCents: czk({ 30: 259, 35: 269, 40: 279 }),
    availability: () => 'in_stock',
    variant: (w) => `${w} mm`,
    tanningVerified: true,
    color: 'svetle-hneda',
    shipping: 'Balíkovna, Zásilkovna, PPL; cenu stránka neuvádí',
    note: 'třísločiněný krupon, světle hnědý, 3,6 mm, délka 130–140 cm',
  },
  {
    shop: 'Imago',
    product: 'Hovězí kůže na opasek, přírodní',
    url: (w) =>
      w === 30
        ? 'https://www.imago.cz/hovezi-kuze-na-opasek'
        : 'https://www.imago.cz/kuze-na-opasek-prirodni-4cm',
    thicknessMm: [3.5, 4],
    measuredMm: [3.5, 4],
    lengthsCm: [130, 150, 180],
    priceCents: (w, len) => {
      const czkValue = IMAGO_CZK[w]?.[len];
      return czkValue === undefined ? undefined : czkValue * 100;
    },
    availability: () => 'in_stock',
    variant: (w, len) => `${w} mm, ${len} cm`,
    tanningVerified: false,
    color: 'prirodni',
    shipping: 'GLS výdejní místo 59 Kč, Balíkovna 69 Kč',
    note: '3,5–4 mm',
  },
  {
    shop: 'Křupson',
    product: 'Hovězí kůže na opasek, přírodní 4 cm',
    url: () => 'https://www.krupson.cz/hovezi-kuze-na-opasek-prirodni--4-cm-delka--130-cm/',
    thicknessMm: [3.5, 4],
    measuredMm: [3.5, 4],
    lengthsCm: [130, 150, 180],
    priceCents: (w, len) =>
      w === 40 && KRUPSON_40MM_CZK[len] !== undefined ? KRUPSON_40MM_CZK[len] * 100 : undefined,
    availability: () => 'in_stock',
    variant: (_w, len) => `${len} cm`,
    tanningVerified: false,
    color: 'prirodni',
    shipping: 'Balíkovna 79 Kč, GLS výdejní místo 75 Kč',
    note: 'totéž zboží jako Imago, 3,5–4 mm',
  },
  {
    shop: 'Andexnite',
    product: 'Hovězí kůže na opasek, přírodní, 130 cm, 3,9–4,1 mm',
    url: () => 'https://andexnite.cz/produkt/hovezi-kuze-na-opasek-prirodni-130-cm-3-9-4-1-mm/',
    thicknessMm: [3.9, 4.1],
    measuredMm: [3.9, 4.1],
    lengthsCm: [130],
    priceCents: czk(ANDEXNITE_CZK),
    availability: () => 'in_stock',
    variant: (w) => `${w} mm`,
    tanningVerified: false,
    color: 'prirodni',
    shipping: 'objednávka do 500 Kč 120 Kč (obchodní podmínky)',
    note: '3,9–4,1 mm',
  },
  {
    shop: 'Andexnite',
    product: 'Hovězí kůže na opasek, přírodní, 140 cm, 3,1–3,4 mm',
    url: () => 'https://andexnite.cz/produkt/hovezi-kuze-na-opasek-prirodni-140-cm-3-1-3-4-mm/',
    thicknessMm: [3.1, 3.4],
    measuredMm: [3.1, 3.4],
    lengthsCm: [140],
    priceCents: czk(ANDEXNITE_CZK),
    availability: () => 'in_stock',
    variant: (w) => `${w} mm`,
    tanningVerified: false,
    color: 'prirodni',
    shipping: 'objednávka do 500 Kč 120 Kč (obchodní podmínky)',
    note: '3,1–3,4 mm, délka 140 cm',
  },
  {
    shop: 'Sedlářské nářadí',
    product: 'Kožený řemen 130, síla 3,8–4 mm',
    url: () => 'https://sedlarskenaradi.cz/kozeny-remen-130-sila-3-8-4mm/',
    thicknessMm: [3.8, 4],
    measuredMm: [3.8, 4],
    lengthsCm: [130],
    priceCents: czk({ 30: 183, 35: 214, 45: 275 }),
    availability: () => 'in_stock',
    variant: (w) => `${w} mm`,
    tanningVerified: false,
    color: 'prirodni',
    shipping: 'Zásilkovna 89 Kč, pás 130 cm možná jako nadrozměr',
    note: 'krupon 3,8–4 mm; „na objednávku“ až 2–3 týdny',
  },
];

/* ------------------------------------------------------------------------- */
/* Barvené pásy (ověřeno 8. 10. 2026)                                         */
/* ------------------------------------------------------------------------- */

type DyedColor = Exclude<StrapColor, 'prirodni'>;

/** CraftPoint barvené řemeny 3,0–3,5 mm: šířka → Kč (`.js`, všechny barvy stejně). */
const CRAFTPOINT_DYED_CZK: Readonly<Record<number, number>> = {
  28: 234,
  30: 234,
  33: 262,
  35: 262,
  38: 291,
  40: 291,
  45: 313,
};

/** CraftPoint řemeny 3,5–4 mm v šířkách 33 a 38 mm (Maya, Buffalo). */
const CRAFTPOINT_33_38_CZK: Readonly<Record<number, number>> = { 33: 313, 38: 336 };

const craftpointDyed = (
  color: DyedColor,
  handle: string,
  product: string,
  note: string,
): StrapSource => ({
  shop: 'CraftPoint',
  product,
  url: () => `https://craft-point.cz/products/${handle}`,
  thicknessMm: [3, 3.5],
  measuredMm: [3, 3.6],
  lengthsCm: [130],
  priceCents: czk(CRAFTPOINT_DYED_CZK),
  availability: () => 'in_stock',
  variant: (w) => `${w} mm`,
  tanningVerified: true,
  color,
  shipping: CRAFTPOINT_SHIPPING,
  note,
});

const craftpoint3338 = (
  color: DyedColor,
  handle: string,
  product: string,
  lengthCm: number,
  tanningVerified: boolean,
  note: string,
): StrapSource => ({
  shop: 'CraftPoint',
  product,
  url: () => `https://craft-point.cz/products/${handle}`,
  thicknessMm: [3.5, 4],
  measuredMm: [3.5, 4],
  lengthsCm: [lengthCm],
  priceCents: czk(CRAFTPOINT_33_38_CZK),
  availability: () => 'in_stock',
  variant: (w) => `${w} mm`,
  tanningVerified,
  color,
  shipping: CRAFTPOINT_SHIPPING,
  note,
});

const leatoryDyed = (color: 'hneda' | 'cerna'): StrapSource => {
  const suffix = color === 'hneda' ? 'hnedy' : 'cerny';
  return {
    shop: 'Leatory',
    product: `Řemen na opasek 3,9 mm, ${color === 'hneda' ? 'hnědý' : 'černý'}, řez na míru`,
    url: (w) =>
      `https://www.leatory.cz/kozene-remeny/remen-na-opasek-tloustka-3-9mm--sirka-${w < 30 ? '5-29' : '30-50'}-mm-${suffix}/`,
    thicknessMm: [3.9, 3.9],
    measuredMm: [3.8, 4],
    lengthsCm: LEATORY_LENGTHS_CM,
    // Ceny barvených jsou stejné jako u přírodního (Shoptet varianty, všechny šířky 28–45 mm).
    priceCents: (w, len) => {
      const i = LEATORY_LENGTHS_CM.indexOf(len as (typeof LEATORY_LENGTHS_CM)[number]);
      return i < 0 ? undefined : LEATORY_CENTS[w]?.[i];
    },
    availability: () => 'in_stock',
    variant: (w, len) => `${w} mm, ${len} cm`,
    tanningVerified: true,
    color,
    shipping: 'Zásilkovna nebo PPL 79 Kč',
    note: 'probarvená třísločiněná hlazenice z ČR, 3,9 ± 0,1 mm; řez na míru, vyřízení 2–3 dny',
  };
};

/**
 * Dva pásovci, barvené přířezy: 32 mm skladem víc než 5 ks, 38 a 44 mm mají záporný sklad
 * (řežou se). U tabáku stránka počet kusů neuvádí, jen „Skladem“.
 */
const dvapasovciDyed = (
  color: DyedColor,
  slug: string,
  product: string,
  lengthCm: number,
  tanningVerified: boolean,
  note: string,
  stockKnown = true,
): StrapSource => ({
  shop: 'Dva pásovci',
  product,
  url: () => `https://www.dvapasovci.cz/prirezy-kuze-na-opasky-${slug}/`,
  thicknessMm: [3.5, 3.5],
  measuredMm: [3.4, 3.6],
  lengthsCm: [lengthCm],
  priceCents: czk(DVAPASOVCI_CZK),
  availability: (w) => (!stockKnown || w === 32 ? 'in_stock' : 'preorder'),
  variant: (w) => `${w} mm`,
  tanningVerified,
  color,
  shipping: 'PPL, cenu stránka neuvádí',
  note,
});

const ecocaseDyed = (
  color: DyedColor,
  slug: string,
  product: string,
  thicknessMm: number,
  lengthCm: number,
  note: string,
  variantPrefix = '',
): StrapSource => ({
  shop: 'Ecocase',
  product,
  url: () => `https://www.ecocase.cz/kuze/${slug}/`,
  thicknessMm: [thicknessMm, thicknessMm],
  measuredMm: [thicknessMm - 0.1, thicknessMm + 0.1],
  lengthsCm: [lengthCm],
  priceCents: czk({ 30: 259, 35: 269, 40: 279 }),
  availability: () => 'in_stock',
  variant: (w) => `${variantPrefix}${w} mm`,
  tanningVerified: true,
  color,
  shipping: 'Balíkovna, Zásilkovna, PPL; cenu stránka neuvádí',
  note,
});

const imagoDyed = (color: 'hneda' | 'cerna'): StrapSource => ({
  shop: 'Imago',
  product: `Hovězí kůže na opasek, ${STRAP_COLOR_LABELS[color]}`,
  url: (w) =>
    w === 30
      ? `https://www.imago.cz/hovezi-kuze-na-opasek-${color}`
      : `https://www.imago.cz/kuze-na-opasek-${color}-4cm`,
  thicknessMm: [3.5, 4],
  measuredMm: [3.5, 4],
  lengthsCm: [130, 150, 180],
  priceCents: (w, len) => {
    const czkValue = IMAGO_CZK[w]?.[len];
    return czkValue === undefined ? undefined : czkValue * 100;
  },
  availability: () => 'in_stock',
  variant: (w, len) => `${w} mm, ${len} cm`,
  tanningVerified: false,
  color,
  shipping: 'GLS výdejní místo 59 Kč, Balíkovna 69 Kč',
  note: 'probarvená hovězí kůže, 3,5–4 mm',
});

/** Andexnite: tloušťka a délka z názvu výrobku; jen šířky skladem (vyprodané vynecháno). */
const andexniteDyed = (
  color: DyedColor,
  slug: string,
  product: string,
  thicknessMm: readonly [number, number],
  lengthCm: number,
  prices: Readonly<Record<number, number>>,
): StrapSource => ({
  shop: 'Andexnite',
  product,
  url: () => `https://andexnite.cz/produkt/${slug}/`,
  thicknessMm,
  measuredMm: thicknessMm,
  lengthsCm: [lengthCm],
  priceCents: czk(prices),
  availability: () => 'in_stock',
  variant: (w) => `${w} mm`,
  tanningVerified: false,
  color,
  shipping: 'objednávka do 500 Kč 120 Kč (obchodní podmínky)',
  note: `${czRange(thicknessMm)} mm, délka ${lengthCm} cm; činění ani probarvení stránka neuvádí`,
});

const czRange = ([a, b]: readonly [number, number]): string =>
  a === b
    ? String(a).replace('.', ',')
    : `${String(a).replace('.', ',')}–${String(b).replace('.', ',')}`;

const ANDEXNITE_STD_CZK: Readonly<Record<number, number>> = { 30: 255, 35: 285, 40: 320 };

/** Barvené pásy. Bez uvedeného činění (`tanningVerified: false`) se nikdy nevyberou samy. */
export const DYED_STRAP_SOURCES: readonly StrapSource[] = [
  craftpointDyed(
    'tmave-hneda',
    'sedlarsky-remen-z-prave-kuze-30-35mm-140cm-15-80mm-tmave-hneda',
    'Sedlářský řemen z pravé kůže 3,0–3,5 mm, 130–140 cm, tmavě hnědý',
    'třísločiněná, z vazu, tovární povrchová úprava; 3,0–3,5 mm, délka 130–140 cm',
  ),
  craftpointDyed(
    'cerna',
    'remen-z-prave-kuze-3-0-3-5mm-140cm-15-80mm-cerny',
    'Řemen z pravé kůže 3,0–3,5 mm, 130–140 cm, černý',
    'třísločiněná, z vazu, tovární povrchová úprava; 3,0–3,5 mm, délka 130–140 cm',
  ),
  craftpointDyed(
    'konak',
    'kozeny-remen-3-0-3-5mm-140cm-15-80mm-konak',
    'Kožený řemen 3,0–3,5 mm, 130–140 cm, koňak',
    'třísločiněná, z vazu, z výroby nabarvená; 3,0–3,5 mm, délka 130–140 cm',
  ),
  craftpoint3338(
    'bordo',
    'kozeny-remen-maya-35-4mm-130-140cm-33-38mm-bordeaux',
    'Kožený řemen Maya 3,5–4 mm, 130–140 cm, bordeaux',
    130,
    true,
    'třísločiněná Maya (Il Ponte), povrchově upravená, 3,5–4 mm, délka 130–140 cm; obchod píše k 33 mm přezku 35 mm, k 38 mm přezku 40 mm',
  ),
  craftpoint3338(
    'zelena',
    'remen-z-kuze-maya-3-5-4mm-130-140cm-33-38mm-foresta',
    'Řemen z kůže Maya 3,5–4 mm, 130–140 cm, foresta (tmavě zelená)',
    130,
    true,
    'třísločiněná Maya (Il Ponte), tmavě zelená, 3,5–4 mm, délka 130–140 cm; obchod píše k 33 mm přezku 35 mm, k 38 mm přezku 40 mm',
  ),
  craftpoint3338(
    'konak',
    'remen-z-buvoli-kuze-buffalo-handwax-35-4mm-140cm-33-38mm-konak',
    'Řemen z buvolí kůže Buffalo Handwax 3,5–4 mm, 140 cm, koňak',
    140,
    false,
    'latigo (kombinované činění, ne třísločiněná), pull-up, 3,5–4 mm, délka 140–150 cm',
  ),
  leatoryDyed('hneda'),
  leatoryDyed('cerna'),
  dvapasovciDyed(
    'hneda',
    'hneda--razba-bark',
    'Přířez kůže na opasek, hnědá, ražba bark',
    120,
    true,
    'třísločiněná, plně probarvená, ražba Bark, 3,5 mm, délka 120–140 cm; 38 a 44 mm řežou na objednávku',
  ),
  dvapasovciDyed(
    'cerna',
    'cerna',
    'Přířez kůže na opasek, černá hovězina',
    130,
    false,
    'plnolícová, matná, 3,5 mm, délka 130–140 cm; 38 a 44 mm řežou na objednávku',
  ),
  dvapasovciDyed(
    'tabak',
    'tabak',
    'Přířez kůže na opasek, tabák',
    130,
    false,
    'barvená na tabákový odstín, 3,5 mm, délka 130–140 cm; počet kusů stránka neuvádí',
    false,
  ),
  dvapasovciDyed(
    'konak',
    'london',
    'Přířez kůže na opasek, london (koňak)',
    130,
    false,
    'barvená na koňakový odstín, 3,5 mm, délka 130–140 cm; 38 a 44 mm řežou na objednávku',
  ),
  dvapasovciDyed(
    'modra',
    'modra-hovezina',
    'Přířez kůže na opasek, modrá hovězina',
    130,
    false,
    'matná, 3,5 mm, délka 130–140 cm; 38 a 44 mm řežou na objednávku',
  ),
  ecocaseDyed(
    'cerna',
    'kozeny-remen-na-opasky',
    'Kožený řemen na opasky, černý matný',
    3.7,
    120,
    'třísločiněný krupon, černý matný, 3,7 mm, délka 120–140 cm; probarvení stránka neuvádí',
    'matná, ',
  ),
  ecocaseDyed(
    'tmave-hneda',
    'kozeny-remen-na-opasky-hnedy-a',
    'Kožený řemen na opasky, tmavě hnědý (A)',
    3,
    130,
    'třísločiněný krupon, tmavě hnědý, 3 mm, délka 130–140 cm; probarvení stránka neuvádí',
  ),
  ecocaseDyed(
    'svetle-hneda',
    'kozeny-remen-na-opasky-svetle-hnedy-b-',
    'Kožený řemen na opasky, světle hnědý (B)',
    3.6,
    130,
    'třísločiněný krupon, světle hnědý, 3,6 mm, délka 130–140 cm; probarvení stránka neuvádí',
  ),
  imagoDyed('hneda'),
  imagoDyed('cerna'),
  andexniteDyed(
    'tmave-hneda',
    'hovezi-kuze-na-opasek-tmave-hneda-140-155cm-3-4-3-6-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 140–155 cm, 3,4–3,6 mm',
    [3.4, 3.6],
    140,
    ANDEXNITE_STD_CZK,
  ),
  andexniteDyed(
    'tmave-hneda',
    'hovezi-kuze-na-opasek-tmave-hneda-130cm-3-4-3-7-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,4–3,7 mm',
    [3.4, 3.7],
    130,
    { 30: 255, 35: 280, 40: 320 },
  ),
  andexniteDyed(
    'tmave-hneda',
    'hovezi-kuze-na-opasek-tmave-hneda-130cm-3-2-3-3-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,2–3,3 mm',
    [3.2, 3.3],
    130,
    { 30: 245, 35: 280, 40: 320 },
  ),
  andexniteDyed(
    'tmave-hneda',
    'hovezi-kuze-na-opasek-tmave-hneda-130-cm-3-1-3-2-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 130 cm, 3,1–3,2 mm',
    [3.1, 3.2],
    130,
    { 40: 320 },
  ),
  andexniteDyed(
    'tmave-hneda',
    'hovezi-kuze-na-opasek-tmave-hneda-125-cm-3-0-3-2-mm',
    'Hovězí kůže na opasek, tmavě hnědá, 125 cm, 3,0–3,2 mm',
    [3, 3.2],
    125,
    { 30: 255, 35: 280 },
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-140-145cm-3-6-3-9-mm',
    'Hovězí kůže na opasek, hnědá, 140–145 cm, 3,6–3,9 mm',
    [3.6, 3.9],
    140,
    ANDEXNITE_STD_CZK,
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4-3-6mm',
    'Hovězí kůže na opasek, hnědá, 145 cm, 3,4–3,6 mm',
    [3.4, 3.6],
    145,
    ANDEXNITE_STD_CZK,
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4-3-6mm-2',
    'Hovězí kůže na opasek, hnědá, 125 cm, 3,4–3,6 mm',
    [3.4, 3.6],
    125,
    ANDEXNITE_STD_CZK,
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-145-cm-3-4mm',
    'Hovězí kůže na opasek, hnědá, 145 cm, 3,4 mm',
    [3.4, 3.4],
    145,
    ANDEXNITE_STD_CZK,
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-130-cm-3-8-3-9-mm',
    'Hovězí kůže na opasek, hnědá, 125–130 cm, 3,8–3,9 mm',
    [3.8, 3.9],
    125,
    { 30: 255, 40: 320 },
  ),
  andexniteDyed(
    'hneda',
    'hovezi-kuze-na-opasek-hneda-130cm-3-0-3-2-mm',
    'Hovězí kůže na opasek, hnědá, 130 cm, 3,0–3,2 mm',
    [3, 3.2],
    130,
    { 35: 280 },
  ),
  andexniteDyed(
    'cerna',
    'hovezi-kuze-na-opasek-cerna-125-cm-3-5-3-8-mm-kopirovat',
    'Hovězí kůže na opasek, černá, 125 cm, 3,5–3,8 mm',
    [3.5, 3.8],
    125,
    { 35: 280 },
  ),
  andexniteDyed(
    'cerna',
    'hovezi-kuze-na-opasek-cerna-125cm-39-41-mm',
    'Hovězí kůže na opasek, černá, 125 cm, 3,9–4,1 mm',
    [3.9, 4.1],
    125,
    { 30: 225, 35: 260, 40: 290 },
  ),
];

/** Všechny pásy: přírodní (`STRAP_SOURCES`) i barvené. */
export const ALL_STRAP_SOURCES: readonly StrapSource[] = [...STRAP_SOURCES, ...DYED_STRAP_SOURCES];

/** Barvy, pro které je aspoň jedna ověřená nabídka (výběr ve formuláři). */
export const OFFERED_STRAP_COLORS: readonly StrapColor[] = STRAP_COLORS.filter((c) =>
  ALL_STRAP_SOURCES.some((s) => s.color === c),
);

/**
 * Nejkratší prodávaná délka, která stačí (≥ `neededCm`); `null`, když žádná. Bez potřebné
 * délky (`null`, obvod nezadaný) nejkratší prodávaná.
 */
export function nearestSoldLengthCm(
  lengthsCm: readonly number[],
  neededCm: number | null,
): number | null {
  const enough = lengthsCm.filter((len) => neededCm === null || len >= neededCm - EPS);
  return enough.length > 0 ? Math.min(...enough) : null;
}

/** Nabídky pro šířku, změřenou tloušťku, nejkratší délku a barvu, od nejlevnější. */
export function strapOffers(
  widthMm: number,
  thicknessMm: number,
  neededCm: number | null,
  color: StrapColor = 'prirodni',
): StrapOffer[] {
  const offers: StrapOffer[] = [];
  for (const s of ALL_STRAP_SOURCES) {
    if (s.color !== color) continue;
    if (thicknessMm < s.measuredMm[0] - EPS || thicknessMm > s.measuredMm[1] + EPS) continue;
    const lengthCm = nearestSoldLengthCm(
      s.lengthsCm.filter((len) => s.priceCents(widthMm, len) !== undefined),
      neededCm,
    );
    if (lengthCm === null) continue;
    offers.push({
      shop: s.shop,
      product: s.product,
      url: s.url(widthMm),
      variant: s.variant(widthMm, lengthCm),
      lengthCm,
      priceCents: s.priceCents(widthMm, lengthCm)!,
      availability: s.availability(widthMm, lengthCm),
      tanningVerified: s.tanningVerified,
      color: s.color,
      shipping: s.shipping,
      note: `${s.note}; po doručení přeměřte`,
      checkedAt: STRAP_OFFERS_CHECKED_AT,
    });
  }
  return offers.sort((a, b) => a.priceCents - b.priceCents);
}

/**
 * Výchozí nabídka (nabídky jsou už jen jedné barvy): CraftPoint, když ho šířka, tloušťka
 * a délka pustí (pás, přezka i nýty v jedné zásilce). Jinak nejlevnější skladem s ověřeným
 * činěním. Nikdy nabídka na objednávku, vyprodaná nebo bez uvedeného činění – ta zůstane jen
 * v „Kde jinde koupit“. Platí stejně pro přírodní i barevný pás.
 */
export function defaultStrapOffer(offers: readonly StrapOffer[]): StrapOffer | null {
  const eligible = offers.filter((o) => o.availability === 'in_stock' && o.tanningVerified);
  return (
    eligible.find((o) => o.shop === 'CraftPoint') ??
    [...eligible].sort((a, b) => a.priceCents - b.priceCents)[0] ??
    null
  );
}

/** Krátký popis skladu pro UI. */
export const STRAP_AVAILABILITY_LABELS: Readonly<Record<StrapAvailability, string>> = {
  in_stock: 'skladem',
  preorder: 'na objednávku',
  unavailable: 'vyprodáno',
};

/**
 * Barva na hrany pro barevný pás: Fiebing's Edge Kote 118 ml z katalogu (`edge-paint`), jen
 * odstíny, které katalog má ověřené (CraftPoint, skladem 8. 10. 2026). Odstín ke kůži se podle
 * názvu jen odhaduje: ověřte na odřezku. Jiné barvy pásu ověřenou barvu na hrany nemají.
 */
export const EDGE_PAINT_URLS: Readonly<Partial<Record<StrapColor, string>>> = {
  hneda: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-hneda',
  'tmave-hneda': 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-tmave-hneda',
  cerna: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-cerna',
};
