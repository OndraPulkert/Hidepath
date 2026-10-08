/**
 * Parametrický pásek (projekt 04): uživatel volí šířku (= světlost přezky), změřenou tloušťku,
 * obvod, tvar konce a případně dírky; vše ostatní se spočítá. Čisté funkce bez Reactu.
 *
 * Meze a pravidla jsou z docs/zadani/opasek-parametry.md (zadání 2026-10-08), kontroly
 * z modelu src/lib/geometry/belt-end.ts. Co podklady nemají, hlásí `warnings` jako
 * „ověřte na odřezku“ nebo „ověřte u prodejce“ – nic se nedomýšlí.
 */
import {
  type BeltEndSpec,
  type BeltTipShape,
  type BeltTipSpec,
  DEFAULT_BELT_END,
  DEFAULT_BELT_PLATE,
  DEFAULT_BELT_TIP,
  type BeltPlateSpec,
  adjustmentRangeMm,
  apexToMiddleHoleMm,
  beltPlateLayout,
  checkBeltEndSpec,
  checkBeltTipSpec,
  foldedSlotOpeningMm,
  holeOffsetsFromApexMm,
  keeperStripLengthMm,
  middleHoleIndex,
  rivetPostRangeMm,
  tipShapeLengthMm,
  totalStrapLengthMm,
} from '../geometry/belt-end';
import {
  type BeltSheet,
  TIP_LANDSCAPE_MAX_REACH_MM,
  buildBeltSheets,
  buildBuckleSheet,
  cz,
  tipSheetOrientation,
} from './belt-sheets';

/** Tvar konce s dírkami tak, jak ho volí uživatel. */
export type BeltTip = 'hrot' | 'zaobleny';

const SHAPE: Readonly<Record<BeltTip, BeltTipShape>> = { hrot: 'point', zaobleny: 'round' };

export const BELT_TIP_LABELS: Readonly<Record<BeltTip, string>> = {
  hrot: 'hrot',
  zaobleny: 'zaoblený',
};

export interface BeltConfigInput {
  /** Šířka pásu = vnitřní světlost přezky, mm. */
  widthMm: number;
  /** Tloušťka pásu změřená na řezu, mm (libovolná hodnota v mezích, např. 3,6). */
  thicknessMm: number;
  /** Obvod (ohyb u přezky → nošená dírka), mm. Chybí = délka pásu se nespočítá. */
  waistMm?: number | undefined;
  tip: BeltTip;
  /** Počet dírek (3 / 5 / 7); chybí = 5. */
  holeCount?: number | undefined;
  /** Rozteč dírek, mm; chybí = 25. */
  holeSpacingMm?: number | undefined;
  /**
   * Vrchol konce → první dírka, mm. Chybí = jako na destičce (94,3 mm; u zaobleného konce
   * podle oblouku destičky, pro 30 mm 89,3 mm).
   */
  apexToFirstHoleMm?: number | undefined;
  /** Ø dírky pro trn, mm; chybí = 5. Pravidlo: trn u kořene + 0,5 mm. */
  holeDiameterMm?: number | undefined;
}

/**
 * Meze v aplikaci (docs/zadani/opasek-parametry.md, oddíl 1). Model sám pustí víc; užší mez
 * dává destička a podklady. Obvod a horní mez rozteče jsou jen pojistka proti překlepu.
 */
export const BELT_LIMITS = {
  widthMm: { min: 28, max: 45 },
  /** Pás z postupu (krok 3); změřená hodnota se nezaokrouhluje, dřík se počítá z ní. */
  thicknessMm: { min: 3, max: 4 },
  waistMm: { min: 600, max: 1500 },
  holeCounts: [3, 5, 7] as const,
  /** Dolní mez rozteče počítá model (Ø + můstek), tady jen pojistka proti překlepu. */
  holeSpacingMaxMm: 50,
  /** Realeather „1″–4″“; dolní mez počítá model (konec + Ø/2 + můstek). */
  apexToFirstHoleMaxMm: 100,
  /** 4,5 mm CraftPoint, 5 mm postup, 6 mm výsečník na nýty. */
  holeDiameterMm: { min: 4.5, max: 6, step: 0.5 },
} as const;

/** Výchozí hodnoty z podkladů: 5 dírek po 25 mm, Ø 5 mm (postup a `DEFAULT_BELT_TIP`). */
export const DEFAULT_HOLE_COUNT = DEFAULT_BELT_TIP.holeCount;
export const DEFAULT_HOLE_SPACING_MM = DEFAULT_BELT_TIP.holeSpacingMm;
export const DEFAULT_HOLE_DIAMETER_MM = DEFAULT_BELT_TIP.holeDiameterMm;

const EPS = 1e-9;
const onStep = (v: number, step: number): boolean =>
  Math.abs(v / step - Math.round(v / step)) < 1e-6;

/**
 * Odstup první dírky, který dává destička: u hrotu 94,3 mm, u zaobleného konce podle oblouku.
 * Oblouky jsou soustředné a největší (40 mm) končí na vrcholu řady, takže konec užšího
 * oblouku leží o (40 − šířka)/2 blíž k dírkám. `null`, když destička pro tu šířku oblouk nemá.
 */
export function plateApexToFirstHoleMm(
  widthMm: number,
  tip: BeltTip,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): number | null {
  if (tip === 'hrot') return DEFAULT_BELT_TIP.apexToFirstHoleMm;
  if (!plate.roundedWidthsMm.includes(widthMm)) return null;
  const widest = Math.max(...plate.roundedWidthsMm);
  return round1(DEFAULT_BELT_TIP.apexToFirstHoleMm - (widest - widthMm) / 2);
}

const round1 = (v: number): number => Math.round(v * 10) / 10;

/** Odstup první dírky, se kterým se počítá: zadaný, jinak podle destičky, jinak 94,3 mm. */
export function effectiveApexToFirstHoleMm(input: BeltConfigInput): number {
  return (
    input.apexToFirstHoleMm ??
    plateApexToFirstHoleMm(input.widthMm, input.tip) ??
    DEFAULT_BELT_TIP.apexToFirstHoleMm
  );
}

/** Specifikace modelu pro zadání. Konec u přezky je pevný (BFLG), mění se šířka a tloušťka. */
export function beltSpecsFor(input: BeltConfigInput): { end: BeltEndSpec; tip: BeltTipSpec } {
  return {
    end: { ...DEFAULT_BELT_END, beltWidthMm: input.widthMm, beltThicknessMm: input.thicknessMm },
    tip: {
      ...DEFAULT_BELT_TIP,
      beltWidthMm: input.widthMm,
      holeCount: input.holeCount ?? DEFAULT_HOLE_COUNT,
      holeSpacingMm: input.holeSpacingMm ?? DEFAULT_HOLE_SPACING_MM,
      holeDiameterMm: input.holeDiameterMm ?? DEFAULT_HOLE_DIAMETER_MM,
      apexToFirstHoleMm: effectiveApexToFirstHoleMm(input),
    },
  };
}

/** Nejmenší odstup první dírky, který model pustí (konec + Ø/2 + můstek). */
export function minApexToFirstHoleMm(input: BeltConfigInput): number {
  const { tip } = beltSpecsFor(input);
  return tipShapeLengthMm(tip, SHAPE[input.tip]) + tip.holeDiameterMm / 2 + tip.minLigamentMm;
}

/**
 * Co v zadání neplatí: meze aplikace a kontroly modelu, česky. Prázdný seznam = lze spočítat
 * i vytisknout.
 */
export function checkBeltConfig(input: BeltConfigInput): string[] {
  const problems: string[] = [];
  const L = BELT_LIMITS;
  const { widthMm, thicknessMm } = input;
  if (!Number.isInteger(widthMm) || widthMm < L.widthMm.min || widthMm > L.widthMm.max) {
    problems.push(`Šířka musí být celé číslo ${L.widthMm.min}–${L.widthMm.max} mm.`);
  }
  if (
    !Number.isFinite(thicknessMm) ||
    thicknessMm < L.thicknessMm.min - EPS ||
    thicknessMm > L.thicknessMm.max + EPS
  ) {
    problems.push(
      'Tloušťka musí být 3,0–4,0 mm (zadejte změřenou hodnotu, např. 3,6). S tenčím nebo silnějším pásem postup nepočítá.',
    );
  }
  if (
    input.waistMm !== undefined &&
    (!Number.isFinite(input.waistMm) ||
      input.waistMm < L.waistMm.min ||
      input.waistMm > L.waistMm.max)
  ) {
    problems.push(`Obvod musí být ${L.waistMm.min / 10}–${L.waistMm.max / 10} cm.`);
  }
  const count = input.holeCount ?? DEFAULT_HOLE_COUNT;
  if (!(L.holeCounts as readonly number[]).includes(count)) {
    problems.push('Počet dírek musí být 3, 5 nebo 7.');
  }
  const spacing = input.holeSpacingMm ?? DEFAULT_HOLE_SPACING_MM;
  if (!(spacing > 0) || spacing > L.holeSpacingMaxMm) {
    problems.push(`Rozteč dírek musí být větší než 0 a nejvýš ${L.holeSpacingMaxMm} mm.`);
  }
  const d = input.holeDiameterMm ?? DEFAULT_HOLE_DIAMETER_MM;
  if (
    !Number.isFinite(d) ||
    d < L.holeDiameterMm.min - EPS ||
    d > L.holeDiameterMm.max + EPS ||
    !onStep(d, L.holeDiameterMm.step)
  ) {
    problems.push('Ø dírky musí být 4,5, 5,0, 5,5 nebo 6,0 mm.');
  }
  const apex = effectiveApexToFirstHoleMm(input);
  if (!(apex > 0) || apex > L.apexToFirstHoleMaxMm + EPS) {
    problems.push(`Odstup první dírky musí být větší než 0 a nejvýš ${L.apexToFirstHoleMaxMm} mm.`);
  }
  // Bez platných základních hodnot by kontroly modelu hlásily nesmysly.
  if (problems.length > 0) return problems;

  const { end, tip } = beltSpecsFor(input);
  problems.push(
    ...checkBeltEndSpec(end).map(modelMessage),
    ...checkBeltTipSpec(tip, SHAPE[input.tip]).map(modelMessage),
  );
  const minApex = minApexToFirstHoleMm(input);
  if (tip.apexToFirstHoleMm < minApex - EPS) {
    // Model řekne jen můstek; uživatel potřebuje číslo, které zadat (nahoru na 0,1 mm).
    problems.push(`Odstup první dírky aspoň ${cz(Math.ceil(minApex * 10 - 1e-6) / 10)} mm.`);
  }
  return problems;
}

/** Hlášení modelu bez interních názvů polí (ty jsou pro skript). */
function modelMessage(problem: string): string {
  return problem
    .replace(/^holeCount/, 'Počet dírek')
    .replace(/^holeSpacingMm/, 'Rozteč dírek')
    .replace(/^holeDiameterMm/, 'Ø dírky')
    .replace(/^apexToFirstHoleMm/, 'Odstup první dírky')
    .replace(/^beltWidthMm/, 'Šířka')
    .replace(/^beltThicknessMm/, 'Tloušťka')
    .replace(/(\d)\.(\d)/g, '$1,$2');
}

/* ------------------------------------------------------------------------- */
/* Nákup                                                                      */
/* ------------------------------------------------------------------------- */

/**
 * Hotové pásy ověřené 2026-10-08 (CraftPoint přes `<url>.js`, Křupson z HTML; dřív
 * docs/content/sablony-zdroje.md, 2026-09-10). Ceny a dostupnost se mění, aplikace je ukazuje
 * s datem. Katalog vybavení (`src/content/equipment/belt.ts`) má tytéž nabídky.
 */
export const STRAP_SOURCES_CHECKED = '8. 10. 2026';

interface StrapSource {
  shop: string;
  url: string;
  /** Tloušťka, kterou obchod uvádí (nominál). */
  thicknessMm: readonly [number, number];
  /**
   * Nejsilnější pás, který po doručení ještě naměříte u tohoto nominálu. Tloušťka se měří až
   * po dodání, takže filtruje s tolerancí: CraftPoint 3–3,5 mm přijde 3,5–3,75 mm
   * (docs/zadani/opasek-postup.md, krok 3).
   */
  measuredMaxMm: number;
  /** Délky, které obchod zaručuje (u rozpětí „130–140 cm“ ta kratší). */
  lengthsCm: readonly number[];
  /** Cena podle šířky (mm) a délky; šířka, která chybí, se neprodává. */
  priceCzk: (widthMm: number, lengthCm: number) => number | undefined;
  note?: string;
}

const CRAFTPOINT_STRAP_PRICES: Readonly<Record<number, number>> = {
  15: 182,
  19: 182,
  20: 182,
  24: 205,
  25: 205,
  28: 228,
  30: 228,
  33: 256,
  35: 256,
  38: 285,
  40: 285,
  45: 313,
  50: 336,
};

const KRUPSON_40MM_PRICES: Readonly<Record<number, number>> = { 130: 299, 150: 329, 180: 379 };

const STRAP_SOURCES: readonly StrapSource[] = [
  {
    shop: 'CraftPoint – Řemen z přírodní kůže 3–3,5 mm, 130–140 cm',
    url: 'https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm',
    thicknessMm: [3, 3.5],
    measuredMaxMm: 3.75,
    // Obchod slibuje 130–140 cm; počítá se s kratší.
    lengthsCm: [130],
    priceCzk: (w) => CRAFTPOINT_STRAP_PRICES[w],
    note: 'třísločiněná; délka podle obchodu 130–140 cm',
  },
  {
    shop: 'Křupson – Hovězí kůže na opasek, přírodní 4 cm',
    url: 'https://www.krupson.cz/hovezi-kuze-na-opasek-prirodni--4-cm-delka--130-cm/',
    thicknessMm: [3.5, 4],
    measuredMaxMm: 4,
    lengthsCm: [130, 150, 180],
    priceCzk: (w, len) => (w === 40 ? KRUPSON_40MM_PRICES[len] : undefined),
  },
];

export interface StrapOffer {
  shop: string;
  url: string;
  lengthCm: number;
  priceCzk: number;
  note?: string | undefined;
}

export type ShoppingStatus = 'overeno' | 'overte';

export interface BeltShoppingLine {
  /** Co koupit, např. „Přezka 40 mm, jednotrnová“. */
  item: string;
  quantity: number;
  /** Podrobnost nebo důvod („dřík 5,5–6,0 mm“). */
  detail: string;
  /** `overeno` = zdroj v podkladech; `overte` = podklady nemají, ověřte u prodejce. */
  status: ShoppingStatus;
  /** Ověřené nabídky (jen pás). */
  offers?: StrapOffer[];
}

/**
 * Šířky, pro které má katalog jednotrnovou přezku s typem trnu ověřeným na stránce obchodu
 * (CraftPoint, mosazné 30, 35 a 40 mm, „s jedním trnem“, 2026-10-08). 45 mm má jen Andexnite
 * (2 ks, typ trnu neuvádí).
 */
const VERIFIED_BUCKLE_WIDTHS_MM: readonly number[] = [30, 35, 40];

/**
 * Výsečníky se zdrojem v podkladech (docs/content/notes-vybaveni.md, docs/zadani/opasek-postup.md):
 * 4,5 mm v sadě CraftPoint 2–5 mm, 5 mm (Format, CraftPoint), 6 mm CraftPoint. 5,5 mm zdroj nemá
 * (sady jdou po celých mm).
 */
const VERIFIED_PUNCH_MM: readonly number[] = [4.5, 5, 6];
const punchStatus = (d: number): ShoppingStatus =>
  VERIFIED_PUNCH_MM.some((v) => Math.abs(v - d) < EPS) ? 'overeno' : 'overte';

/**
 * Šroubovací nýty z katalogu (`src/content/equipment/belt.ts`, `chicago-screws`, ověřeno
 * 8. 10. 2026) podle délky dříku. `confirmed` = dřík uvádí stránka výrobku; u Andexnite je
 * jen v názvu a katalog píše „délku dříku si potvrďte u prodejce“.
 */
export interface ChicagoScrewOption {
  postMm: number;
  /** Krátký popis pro tabulku a nákup. */
  product: string;
  /** Příklad v katalogu: URL a varianta (shodné s `ProductExample`). */
  url: string;
  variant?: string;
  /** Kolik kusů (nebo balení) koupit na 2 nýty: CraftPoint a Leatory po kusech, Andexnite po 10 ks. */
  quantity: number;
  confirmed: boolean;
}

export const CHICAGO_SCREW_OPTIONS: readonly ChicagoScrewOption[] = [
  {
    postMm: 6,
    product: 'CraftPoint 10/6, 8 Kč/ks',
    url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6-mm-stribrne',
    quantity: 2,
    confirmed: true,
  },
  {
    postMm: 6,
    product: 'Leatory opaskový šroubek, dřík 6 mm, 19 Kč/ks',
    url: 'https://www.leatory.cz/nyty--ozdoby-a-ostatni/opaskovy-sroubek-nikl-pres-mosaz-hladky-profi/',
    variant: 'dřík 6 mm',
    quantity: 2,
    confirmed: true,
  },
  {
    postMm: 5,
    product: 'Andexnite Ø 9 × 5 mm (dřík jen podle názvu)',
    url: 'https://andexnite.cz/produkt/sroubovaci-nyt-o-9-x-5-mm-o-95-x-6-mm-cerny-nikl-10-ks/',
    variant: '9 × 5 mm',
    quantity: 1,
    confirmed: false,
  },
  {
    postMm: 6.5,
    product: 'Andexnite Ø 9,5 × 6,5 mm (dřík jen podle názvu)',
    url: 'https://andexnite.cz/produkt/sroubovaci-nyt-o-9-x-5-mm-o-95-x-6-mm-cerny-nikl-10-ks/',
    variant: '9,5 × 6,5 mm',
    quantity: 1,
    confirmed: false,
  },
];

const r2 = (v: number): number => Math.round(v * 100) / 100;

/**
 * Dřík šroubovacího nýtu pro změřenou tloušťku (postup, krok 3): spoj = 2 × tloušťka, dřík
 * o 1–1,5 mm kratší. Počítá se z přesné hodnoty, nic se nezaokrouhluje na „běžné“ délky.
 */
export function rivetPostMm(thicknessMm: number): {
  minMm: number;
  maxMm: number;
  /** Dřík nýtu z katalogu, který do rozsahu padne; `null`, když žádný. */
  postMm: number | null;
  /** Nýt s dříkem potvrzeným na stránce výrobku, nebo `null`. */
  verified: string | null;
  /** Nýty z katalogu, jejichž dřík do rozsahu padne (potvrzené první). */
  options: ChicagoScrewOption[];
} {
  const range = rivetPostRangeMm({ ...DEFAULT_BELT_END, beltThicknessMm: thicknessMm });
  const minMm = r2(range.minMm);
  const maxMm = r2(range.maxMm);
  const options = CHICAGO_SCREW_OPTIONS.filter(
    (o) => o.postMm >= minMm - EPS && o.postMm <= maxMm + EPS,
  ).sort((a, b) => Number(b.confirmed) - Number(a.confirmed));
  const confirmed = options.find((o) => o.confirmed);
  return {
    minMm,
    maxMm,
    postMm: options[0]?.postMm ?? null,
    verified: confirmed?.product ?? null,
    options,
  };
}

function strapOffers(widthMm: number, thicknessMm: number, neededCm: number | null): StrapOffer[] {
  const offers: StrapOffer[] = [];
  for (const s of STRAP_SOURCES) {
    if (thicknessMm < s.thicknessMm[0] - EPS || thicknessMm > s.measuredMaxMm + EPS) continue;
    const length = s.lengthsCm.find((len) => neededCm === null || len >= neededCm);
    if (length === undefined) continue;
    const price = s.priceCzk(widthMm, length);
    if (price === undefined) continue;
    const nominal = `nominál ${cz(s.thicknessMm[0])}–${cz(s.thicknessMm[1])} mm, po doručení přeměřte`;
    const note = s.note ? `${s.note}; ${nominal}` : nominal;
    offers.push({ shop: s.shop, url: s.url, lengthCm: length, priceCzk: price, note });
  }
  return offers;
}

/* ------------------------------------------------------------------------- */
/* Destička                                                                   */
/* ------------------------------------------------------------------------- */

export interface PlateRowCheck {
  /** Řada destičky: 1 hrot, 2 zaoblený konec, 3 konec u přezky. */
  row: 1 | 2 | 3;
  label: string;
  ok: boolean;
  /** Proč ne (prázdné, když `ok`). */
  reasons: string[];
}

export interface PlateCompatibility {
  /** Destička pokryje oba konce; jinak vytiskněte listy. */
  usable: boolean;
  rows: [PlateRowCheck, PlateRowCheck];
  /** Má destička vodicí linku pro tuhle šířku (30/35/40/45)? Jinak příčná stupnice. */
  guideLine: boolean;
}

/**
 * Jde použít dodanou destičku (MK Plexi)? Pravidlo z docs/zadani/opasek-parametry.md, oddíl 5:
 * šířka v rozsahu destičky, 5 dírek po 25 mm, odstup jako na destičce a u zaobleného konce
 * jen šířky s obloukem (40 a 30 mm). Tloušťka ani Ø dírky nevadí (destička značí středy).
 */
export function plateCompatibility(
  input: BeltConfigInput,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): PlateCompatibility {
  const layout = beltPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP, plate);
  const { tip } = beltSpecsFor(input);
  const w = input.widthMm;
  const inRange = w >= layout.minBeltWidthMm && w <= layout.maxBeltWidthMm;
  const rangeReason = `destička je pro šířky ${layout.minBeltWidthMm}–${layout.maxBeltWidthMm} mm`;

  const buckle: PlateRowCheck = {
    row: 3,
    label: 'Řada 3 – konec u přezky',
    ok: inRange,
    reasons: inRange ? [] : [rangeReason],
  };

  const reasons: string[] = [];
  if (!inRange) reasons.push(rangeReason);
  if (input.tip === 'zaobleny' && !plate.roundedWidthsMm.includes(w)) {
    reasons.push(
      `oblouk je jen pro ${[...plate.roundedWidthsMm].sort((a, b) => a - b).join(' a ')} mm`,
    );
  }
  if (tip.holeCount !== DEFAULT_BELT_TIP.holeCount) {
    reasons.push(`destička má ${DEFAULT_BELT_TIP.holeCount} dírek`);
  }
  if (Math.abs(tip.holeSpacingMm - DEFAULT_BELT_TIP.holeSpacingMm) > EPS) {
    reasons.push(`rozteč na destičce je ${cz(DEFAULT_BELT_TIP.holeSpacingMm)} mm`);
  }
  const plateApex = plateApexToFirstHoleMm(w, input.tip, plate);
  if (plateApex !== null && Math.abs(tip.apexToFirstHoleMm - plateApex) > EPS) {
    reasons.push(`odstup první dírky na destičce je ${cz(plateApex)} mm`);
  }
  const end: PlateRowCheck = {
    row: input.tip === 'hrot' ? 1 : 2,
    label: input.tip === 'hrot' ? 'Řada 1 – hrot' : 'Řada 2 – zaoblený konec',
    ok: reasons.length === 0,
    reasons,
  };
  return {
    usable: buckle.ok && end.ok,
    rows: [buckle, end],
    guideLine: plate.guideWidthsMm.includes(w),
  };
}

/* ------------------------------------------------------------------------- */
/* Výsledek                                                                   */
/* ------------------------------------------------------------------------- */

export interface BeltConfigResult {
  input: BeltConfigInput;
  shape: BeltTipShape;
  end: BeltEndSpec;
  tip: BeltTipSpec;
  /** Krátký popis, např. „40 mm · 3,5 mm · hrot · 5 dírek“. */
  label: string;
  strap: {
    /** Obvod + přehnutí + vrchol → prostřední dírka; `null` bez obvodu. */
    lengthMm: number | null;
    /** Co se k obvodu přičítá (výchozí 234,3 mm). */
    allowanceMm: number;
    /** Nejkratší celé cm, které stačí; `null` bez obvodu. */
    minLengthCm: number | null;
  };
  /** Délka tvarovaného konce: hrot, nebo poloměr půlkruhu. */
  tipLengthMm: number;
  holes: {
    count: number;
    spacingMm: number;
    diameterMm: number;
    /** Vzdálenosti od vrcholu konce. */
    fromApexMm: number[];
    middleIndex: number;
    middleFromApexMm: number;
    /** ± kolik jde pásek povolit nebo utáhnout. */
    adjustmentMm: number;
  };
  keeper: { lengthMm: number; widthMm: number };
  rivet: ReturnType<typeof rivetPostMm>;
  buckleEnd: {
    /** Ovál pro trn: délka × šířka; ohyb ho půlí. */
    slotLengthMm: number;
    slotWidthMm: number;
    foldedOpeningMm: number;
    /** Ohyb od konce pásu. */
    foldFromEndMm: number;
    /** Ovál od konce pásu (od–do). */
    slotFromEndMm: [number, number];
    /** Středy otvorů pro nýty od konce pásu (4 otvory = 2 nýty). */
    rivetHolesFromEndMm: [number, number, number, number];
    rivetHoleMm: number;
  };
  buckle: { widthMm: number; verified: boolean };
  plate: PlateCompatibility;
  /**
   * List 2 na výšku, na šířku (7 dírek a delší rozvržení), nebo `null`, když se na A4 nevejde
   * ani na šířku. Čísla platí i tak, jen listy se netisknou (`sheets`).
   */
  tipSheetOrientation: 'portrait' | 'landscape' | null;
  /** Jdou vytisknout listy A4? Když ne, `message` říká proč a čím značit. */
  sheets: BeltSheetsAvailability;
  shopping: BeltShoppingLine[];
  /** Co podklady neověřují. Výpočet platí, jen to vyzkoušejte. */
  warnings: string[];
}

/**
 * Jde vytisknout list 2 (dírky a konec)? List 1 (konec u přezky a poutko) na dírkách nezávisí
 * a tiskne se vždy; `printable: false` znamená, že se nevejde jen list 2.
 */
export type BeltSheetsAvailability = { printable: true } | { printable: false; message: string };

/**
 * Vejde se list 2 na A4? Když ne, pásek se dál spočítá a list 1 se vytiskne, jen dírky a konec
 * se značí podle čísel v tabulce.
 */
export function beltSheetsAvailability(
  input: BeltConfigInput,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): BeltSheetsAvailability {
  const { tip } = beltSpecsFor(input);
  if (tipSheetOrientation(tip) !== null) return { printable: true };
  const reach = holeOffsetsFromApexMm(tip).at(-1) ?? 0;
  const row3 = plateCompatibility(input, plate).rows[0].ok;
  return {
    printable: false,
    message:
      `List 2 se na A4 nevejde: poslední dírka je ${cz(r1(reach))} mm od konce, list A4 pojme nejvýš ${cz(TIP_LANDSCAPE_MAX_REACH_MM)} mm. ` +
      'Dírky a konec značte podle čísel v tabulce. ' +
      (row3
        ? 'List 1 (konec u přezky a poutko) se vytiskne, nebo konec u přezky značte řadou 3 destičky.'
        : 'List 1 (konec u přezky a poutko) se vytiskne.'),
  };
}

export type BeltConfigOutcome =
  { ok: true; result: BeltConfigResult } | { ok: false; problems: string[] };

const r1 = (v: number): number => Math.round(v * 10) / 10;

/** Popis sestavy pro nadpis skupiny listů a „Moje pásky“. */
export function beltConfigLabel(input: BeltConfigInput): string {
  const count = input.holeCount ?? DEFAULT_HOLE_COUNT;
  return `${cz(input.widthMm)} mm · ${cz(input.thicknessMm)} mm · ${BELT_TIP_LABELS[input.tip]} · ${count} dírek`;
}

/** Spočítá všechno, co ze zadání plyne, nebo vrátí, co v zadání neplatí. */
export function deriveBeltConfig(input: BeltConfigInput): BeltConfigOutcome {
  const problems = checkBeltConfig(input);
  if (problems.length > 0) return { ok: false, problems };
  const { end, tip } = beltSpecsFor(input);
  const shape = SHAPE[input.tip];
  const fromApex = holeOffsetsFromApexMm(tip);
  const allowanceMm = r1(end.tailLengthMm + apexToMiddleHoleMm(tip));
  const lengthMm =
    input.waistMm === undefined ? null : r1(totalStrapLengthMm(input.waistMm, end, tip));
  const minLengthCm = lengthMm === null ? null : Math.ceil(lengthMm / 10 - EPS);
  const fold = end.tailLengthMm;
  const [near, far] = end.rivetOffsetsMm;
  const rivet = rivetPostMm(input.thicknessMm);
  const buckleVerified = VERIFIED_BUCKLE_WIDTHS_MM.includes(input.widthMm);
  const orientation = tipSheetOrientation(tip);
  const keeper = { lengthMm: keeperStripLengthMm(end), widthMm: end.keeperWidthMm };

  const warnings: string[] = [];
  if (tip.holeCount !== DEFAULT_BELT_TIP.holeCount) {
    warnings.push(`Podklady znají jen 5 dírek. ${tip.holeCount} dírek ověřte na odřezku.`);
  }
  if (Math.abs(tip.holeSpacingMm - DEFAULT_BELT_TIP.holeSpacingMm) > EPS) {
    warnings.push('Podklady mají rozteč 25 mm. Jinou rozteč ověřte na odřezku.');
  }
  const postRange = `${cz(rivet.minMm)}–${cz(rivet.maxMm)} mm`;
  if (rivet.postMm === null) {
    warnings.push(
      `Dřík ${postRange}: takový nýt v ověřených nabídkách není. Ověřte u prodejce a utažení na odřezku.`,
    );
  } else if (rivet.verified === null) {
    warnings.push(
      `Nýt s dříkem ${cz(rivet.postMm)} mm má délku dříku jen v názvu (${rivet.options[0]!.product}). Ověřte u prodejce a utažení na odřezku.`,
    );
  }
  if (input.tip === 'zaobleny') {
    warnings.push('Zaoblený konec je spočítaný, ne vyzkoušený. Ověřte na odřezku.');
  }
  warnings.push('Délka poutka je spočítaná, ne vyzkoušená. Ověřte na odřezku.');

  const shopping: BeltShoppingLine[] = [];
  const offers = strapOffers(input.widthMm, input.thicknessMm, minLengthCm);
  shopping.push({
    item: `Pás z třísločiněné kůže ${cz(input.widthMm)} mm, ${cz(input.thicknessMm)} mm`,
    quantity: 1,
    detail:
      minLengthCm === null
        ? `délka = obvod + ${cz(allowanceMm)} mm (zadejte obvod)`
        : `aspoň ${minLengthCm} cm (obvod + ${cz(allowanceMm)} mm)`,
    status: offers.length > 0 ? 'overeno' : 'overte',
    offers,
  });
  shopping.push({
    item: `Přezka ${cz(input.widthMm)} mm, jednotrnová`,
    quantity: 1,
    detail: buckleVerified
      ? 'vnitřní světlost = šířka pásu; jednotrnovou ověřeno u CraftPointu (mosazná), u jiných přezek typ trnu ověřte na fotce'
      : 'vnitřní světlost = šířka pásu; v podkladech neověřená, ověřte u prodejce',
    status: buckleVerified ? 'overeno' : 'overte',
  });
  shopping.push({
    item: `Šroubovací nýt (chicago), dřík ${rivet.postMm === null ? postRange : `${cz(rivet.postMm)} mm`}`,
    quantity: 2,
    detail: `dřík ${postRange} na spoj 2 × ${cz(input.thicknessMm)} mm; ${
      rivet.verified ??
      (rivet.options[0]
        ? `${rivet.options[0].product}, ověřte u prodejce`
        : 'ověřený nýt s takovým dříkem nemáme, ověřte u prodejce')
    }`,
    status: rivet.verified ? 'overeno' : 'overte',
  });
  shopping.push({
    item: `Výsečník Ø ${cz(tip.holeDiameterMm)} mm`,
    quantity: 1,
    detail:
      punchStatus(tip.holeDiameterMm) === 'overeno'
        ? 'dírky pro trn; Ø = trn u kořene + 0,5 mm'
        : 'dírky pro trn; Ø = trn u kořene + 0,5 mm; tuto velikost podklady nemají, ověřte u prodejce',
    status: punchStatus(tip.holeDiameterMm),
  });
  if (Math.abs(tip.holeDiameterMm - end.rivetHoleMm) > EPS) {
    shopping.push({
      item: `Výsečník Ø ${cz(end.rivetHoleMm)} mm`,
      quantity: 1,
      detail: 'otvory pro nýty a konce oválu',
      status: punchStatus(end.rivetHoleMm),
    });
  }

  return {
    ok: true,
    result: {
      input,
      shape,
      end,
      tip,
      label: beltConfigLabel(input),
      strap: { lengthMm, allowanceMm, minLengthCm },
      tipLengthMm: r1(tipShapeLengthMm(tip, shape)),
      holes: {
        count: tip.holeCount,
        spacingMm: tip.holeSpacingMm,
        diameterMm: tip.holeDiameterMm,
        fromApexMm: fromApex.map(r1),
        middleIndex: middleHoleIndex(tip),
        middleFromApexMm: r1(apexToMiddleHoleMm(tip)),
        adjustmentMm: r1(adjustmentRangeMm(tip)),
      },
      keeper,
      rivet,
      buckleEnd: {
        slotLengthMm: end.slotLengthMm,
        slotWidthMm: end.slotWidthMm,
        foldedOpeningMm: foldedSlotOpeningMm(end),
        foldFromEndMm: fold,
        slotFromEndMm: [r1(fold - end.slotLengthMm / 2), r1(fold + end.slotLengthMm / 2)],
        rivetHolesFromEndMm: [r1(fold - far), r1(fold - near), r1(fold + near), r1(fold + far)],
        rivetHoleMm: end.rivetHoleMm,
      },
      buckle: { widthMm: input.widthMm, verified: buckleVerified },
      plate: plateCompatibility(input),
      tipSheetOrientation: orientation,
      sheets: beltSheetsAvailability(input),
      shopping,
      warnings,
    },
  };
}

/**
 * Tiskové listy (SVG 1:1) pro platné zadání: list 1 vždy, list 2, když se vejde na A4
 * (`beltSheetsAvailability`).
 */
export function beltSheetsFor(
  input: BeltConfigInput,
): { ok: true; label: string; sheets: BeltSheet[] } | { ok: false; problems: string[] } {
  const problems = checkBeltConfig(input);
  if (problems.length > 0) return { ok: false, problems };
  const { end, tip } = beltSpecsFor(input);
  const sheets: BeltSheet[] = beltSheetsAvailability(input).printable
    ? buildBeltSheets(end, tip, SHAPE[input.tip])
    : [buildBuckleSheet(end)];
  return { ok: true, label: beltConfigLabel(input), sheets };
}

/* ------------------------------------------------------------------------- */
/* Formulář                                                                   */
/* ------------------------------------------------------------------------- */

/** Jak uživatel obvod změřil (postup, krok 1). Míra je v obou případech stejná. */
export type WaistSource = 'pasek' | 'metr';

/** Stav formuláře „Váš pásek“: textová pole tak, jak je uživatel napsal. */
export interface BeltConfigForm {
  /** mm */
  width: string;
  /** mm */
  thickness: string;
  /** cm */
  waist: string;
  waistSource: WaistSource;
  tip: BeltTip;
  holeCount: string;
  /** mm; prázdné = 25 */
  holeSpacing: string;
  /** mm; prázdné = podle destičky */
  apexToFirst: string;
  /** mm; prázdné = 5 */
  holeDiameter: string;
}

export const DEFAULT_BELT_FORM: BeltConfigForm = {
  width: '40',
  thickness: '3,5',
  waist: '',
  waistSource: 'pasek',
  tip: 'hrot',
  holeCount: String(DEFAULT_HOLE_COUNT),
  holeSpacing: '',
  apexToFirst: '',
  holeDiameter: '',
};

/** Číslo z pole formuláře (čárka i tečka); `undefined`, když to číslo není. */
export function parseNumber(raw: string): number | undefined {
  const t = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return undefined;
  const v = Number(t);
  return Number.isFinite(v) ? v : undefined;
}

/**
 * Přečte formulář na zadání. Prázdné volitelné pole = výchozí hodnota. Chyby jsou česky;
 * meze a kontroly modelu hlídá až `deriveBeltConfig`.
 */
export function parseBeltConfigForm(
  form: BeltConfigForm,
): { input: BeltConfigInput } | { problems: string[] } {
  const problems: string[] = [];
  const required = (raw: string, message: string): number | undefined => {
    const v = parseNumber(raw);
    if (v === undefined) problems.push(message);
    return v;
  };
  const optional = (raw: string, message: string): number | undefined => {
    if (raw.trim() === '') return undefined;
    const v = parseNumber(raw);
    if (v === undefined) problems.push(message);
    return v;
  };
  const widthMm = required(form.width, 'Zadejte šířku v mm (např. 40).');
  const thicknessMm = required(form.thickness, 'Zadejte změřenou tloušťku v mm (např. 3,5).');
  const waistCm = optional(form.waist, 'Obvod zadejte v cm (např. 95).');
  const holeCount = optional(form.holeCount, 'Počet dírek: 3, 5 nebo 7.');
  const holeSpacingMm = optional(form.holeSpacing, 'Rozteč zadejte v mm (např. 25).');
  const apexToFirstHoleMm = optional(form.apexToFirst, 'Odstup zadejte v mm (např. 94,3).');
  const holeDiameterMm = optional(form.holeDiameter, 'Ø dírky zadejte v mm (např. 5).');
  if (problems.length > 0 || widthMm === undefined || thicknessMm === undefined) {
    return { problems };
  }
  return {
    input: {
      widthMm,
      thicknessMm,
      waistMm: waistCm === undefined ? undefined : r1(waistCm * 10),
      tip: form.tip,
      holeCount,
      holeSpacingMm,
      apexToFirstHoleMm,
      holeDiameterMm,
    },
  };
}

/** Zpět na formulář (načtení uloženého pásku). */
export function beltConfigToForm(input: BeltConfigInput, waistSource: WaistSource): BeltConfigForm {
  const num = (v: number | undefined): string => (v === undefined ? '' : cz(v));
  return {
    width: cz(input.widthMm),
    thickness: cz(input.thicknessMm),
    waist: input.waistMm === undefined ? '' : cz(input.waistMm / 10),
    waistSource,
    tip: input.tip,
    holeCount: String(input.holeCount ?? DEFAULT_HOLE_COUNT),
    holeSpacing: num(input.holeSpacingMm),
    apexToFirst: num(input.apexToFirstHoleMm),
    holeDiameter: num(input.holeDiameterMm),
  };
}
