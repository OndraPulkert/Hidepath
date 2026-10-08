/**
 * Hotové pásy na opasek z ověřených obchodů (8. 10. 2026) a výběr výchozí nabídky. Čisté funkce
 * bez Reactu. Data ze stránek obchodů: CraftPoint `<url>.js`, Shoptet varianty (Leatory, Dva
 * pásovci, Ecocase, Křupson), WooCommerce Store API (Andexnite), JSON-LD a ceny variant (Imago),
 * HTML (Sedlářské nářadí). Katalog vybavení (`src/content/equipment/belt.ts`, `belt-strap`) má
 * tytéž nabídky jako příklady; shodu hlídá test projektu. Co jsme neověřili, je
 * v docs/content/notes-vybaveni.md jako „neověřeno“ a sem nepatří.
 */

export type StrapAvailability = 'in_stock' | 'preorder' | 'unavailable';

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
  shipping: string;
  /** Tloušťka, činění, sklad – krátce. */
  note: string;
  checkedAt: string;
}

const EPS = 1e-9;
const czk = (table: Readonly<Record<number, number>>) => (w: number) =>
  table[w] === undefined ? undefined : table[w] * 100;

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
    shipping: 'cenu dopravy jsme neověřili; pás, přezka i nýty v jedné zásilce',
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
    shipping: 'Zásilkovna 89 Kč, pás 130 cm možná jako nadrozměr',
    note: 'krupon 3,8–4 mm; „na objednávku“ až 2–3 týdny',
  },
];

/** Nabídky pro šířku, změřenou tloušťku a nejkratší délku, od nejlevnější. */
export function strapOffers(
  widthMm: number,
  thicknessMm: number,
  neededCm: number | null,
): StrapOffer[] {
  const offers: StrapOffer[] = [];
  for (const s of STRAP_SOURCES) {
    if (thicknessMm < s.measuredMm[0] - EPS || thicknessMm > s.measuredMm[1] + EPS) continue;
    const lengthCm = s.lengthsCm.find(
      (len) => (neededCm === null || len >= neededCm) && s.priceCents(widthMm, len) !== undefined,
    );
    if (lengthCm === undefined) continue;
    offers.push({
      shop: s.shop,
      product: s.product,
      url: s.url(widthMm),
      variant: s.variant(widthMm, lengthCm),
      lengthCm,
      priceCents: s.priceCents(widthMm, lengthCm)!,
      availability: s.availability(widthMm, lengthCm),
      tanningVerified: s.tanningVerified,
      shipping: s.shipping,
      note: `${s.note}; po doručení přeměřte`,
      checkedAt: STRAP_OFFERS_CHECKED_AT,
    });
  }
  return offers.sort((a, b) => a.priceCents - b.priceCents);
}

/**
 * Výchozí nabídka: CraftPoint, když ho šířka, tloušťka a délka pustí (pás, přezka i nýty v jedné
 * zásilce). Jinak nejlevnější skladem s ověřeným činěním. Nikdy nabídka na objednávku,
 * vyprodaná nebo bez uvedeného činění – ta zůstane jen v „Kde jinde koupit“.
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
