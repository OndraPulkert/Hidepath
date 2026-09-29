/**
 * Peněženka LUSK – geometrie výrobního střihu v milimetrech.
 *
 * Návrh a všechny výpočty: docs/zadani/penezenka-navrh.md (oddíl 14 = tabulka parametrů, oddíl 15
 * = změny po kontrole). Tady je jen přepis vzorců z oddílu 14 do kódu, aby šel střih vygenerovat
 * a zkontrolovat. **NÁVRH k ověření na prototypu** – nic tu není odměřené z hotového kusu.
 *
 * Konstrukce: jeden díl D1 (useň 1,2 mm) přeložený ve dně lícem ven a prošitý třemi svislými švy.
 * Vlevo **karetní zóna** (karty na výšku, bankovky na třetiny za nimi), vpravo **lusk** – mincovní
 * trubice vytvarovaná za mokra na trnu T1 na dutinu pro dvě vrstvy mincí. V ústí lusku sedí
 * **středový práh** z podložek D2 Ø 8. Průzor je na obou stěnách lusku.
 *
 * Souřadnice (jako v dokumentu):
 * - **x** zleva doprava na rozvinutém dílu při pohledu na **líc** (0 = levá hrana, W = pravá),
 * - **u** na každé stěně od konce pásma ohybu (u = 0) k horní hraně,
 * - na rozvinutém dílu y = F/2 + u (přední stěna) a y = −(F/2 + u) (zadní); obě stěny mají stejné
 *   x, ohyb zrcadlí jen y. Na **rubu** je x zrcadlené: x_rub = W − x.
 */

export interface MinimalWalletSpec {
  /** Karta ISO/IEC 7810 ID-1: 85,60 × 53,98 × 0,76 mm. */
  cardWidthMm: number;
  cardHeightMm: number;
  cardThicknessMm: number;
  /** Počet karet ve stavu B a C (brief kap. 24) a ve zkoušce „4 karty bez bankovek“. */
  cardsB: number;
  cardsC: number;
  /** Rezerva na složené bankovky (převzato z pouzdra s mincí) – ověřit posuvkou. */
  billsThicknessMm: number;
  /** Výška bankovek ČNB (69–74 mm). */
  billHeightMinMm: number;
  billHeightMaxMm: number;
  /** Tloušťka kůže D1 – změřit. */
  leatherMm: number;
  /** Největší a nejmenší nošená mince (50 Kč 27,5 mm; nejmenší ≈ 20 mm – ověřit). */
  coinDiameterMaxMm: number;
  coinDiameterMinMm: number;
  /** Tloušťka nejtlustší mince (2,5 mm u 50 Kč – ověřit). */
  coinThicknessMaxMm: number;
  /** Vrstvy mincí v dutině a mincí v řadě pod prahem. */
  coinLayers: number;
  coinsPerRow: number;
  /** v_c: svislá vůle dutiny nad dvě vrstvy mincí. */
  cavityClearanceMm: number;
  /** v_b: boční vůle mince v trnu (šířka trnu u ústí = D_max + v_b). */
  sideClearanceMm: number;
  /** Zúžení trnu ke dnu (šířka u konce = b − zúžení), aby šel po vyschnutí vytáhnout. */
  mandrelTaperMm: number;
  /** r: poloměr podélných hran trnu. */
  mandrelEdgeRadiusMm: number;
  /** Délka trnu nad ústím na držení. */
  mandrelHandleMm: number;
  /** s_ins: rezerva obvodu lusku na zasunutí trnu, stažení stehy a přetok lepidla. */
  insertReserveMm: number;
  /** s_c: rezerva karetní zóny nad stav C (ruční řez, poloha čáry, stažení stehy). */
  cardZoneReserveMm: number;
  /** Přetok lepidla na jeden okraj pruhu, se kterým musí konstrukce počítat i s maskovací páskou. */
  glueOverflowMm: number;
  /** e: čára švu od hrany; g: lepení za čáru švu; rozteč vidliček. */
  seamOffsetMm: number;
  glueBeyondSeamMm: number;
  stitchPitchMm: number;
  /** u_g: kde začíná lepení nad ohybem; u_h: nejnižší otvor. */
  glueStartMm: number;
  lowestHoleMm: number;
  /** D_w: průměr podložky prahu; a_w: střed podložky pod horní hranou lusku. */
  washerDiameterMm: number;
  washerFromTopMm: number;
  /** k_w: vůle nejvýš stojící mince pod podložkou. */
  coinBelowWasherMm: number;
  /** Δ: schod lusku nad karetní zónou; R_s: vydutý schod (výsečník Ø 2·R_s). */
  stepMm: number;
  stepRadiusMm: number;
  /** R_o: vypouklé horní rohy. */
  outerCornerRadiusMm: number;
  /** m_k: nejmenší vzdálenost horní hrany karty pod hranou kapsy (kontroluje se ve stavu C). */
  minCardBelowEdgeMm: number;
  /** Průzor na obou stěnách lusku: šířka (= výsečník konců), délka, horní konec pod hranou. */
  windowWidthMm: number;
  windowLengthMm: number;
  windowFromTopMm: number;
  /** Nejmenší pevný můstek mezi horním koncem průzoru a podložkou. */
  windowBelowWasherMm: number;
  /** Výkus na palec (přední stěna) a na bankovky (zadní): šířka a hloubka, dno R = šířka/2. */
  thumbNotchWidthMm: number;
  thumbNotchDepthMm: number;
  billNotchWidthMm: number;
  billNotchDepthMm: number;
  notchCornerRadiusMm: number;
  /** Maker's mark: střed (x, u) na přední stěně a největší rozměr. */
  markXMm: number;
  markUMm: number;
  markSizeMm: number;
  /** Kolik musí nejméně vyčnívat 50 Kč z ústí po posunu palcem. */
  minCoinProtrusionMm: number;
  /** Šířka kusu karetní zóny ve zkušebním lusku (kvůli vnitřnímu dělicímu švu). */
  testCardPartMm: number;
  /** Mincí v řadě ve zkušebním lusku. */
  testCoinsPerRow: number;
  /** Krok zaokrouhlení šířek zón (na nejbližší násobek). */
  roundStepMm: number;
}

export const DEFAULT_MINIMAL_WALLET: MinimalWalletSpec = {
  cardWidthMm: 53.98,
  cardHeightMm: 85.6,
  cardThicknessMm: 0.76,
  cardsB: 4,
  cardsC: 6,
  billsThicknessMm: 2.0,
  billHeightMinMm: 69,
  billHeightMaxMm: 74,
  leatherMm: 1.2,
  coinDiameterMaxMm: 27.5,
  coinDiameterMinMm: 20,
  coinThicknessMaxMm: 2.5,
  coinLayers: 2,
  coinsPerRow: 3,
  cavityClearanceMm: 1.0,
  sideClearanceMm: 1.5,
  mandrelTaperMm: 0.5,
  mandrelEdgeRadiusMm: 1.0,
  mandrelHandleMm: 25,
  insertReserveMm: 2.0,
  cardZoneReserveMm: 1.0,
  glueOverflowMm: 0.5,
  seamOffsetMm: 3.5,
  glueBeyondSeamMm: 1.0,
  stitchPitchMm: 4,
  glueStartMm: 5,
  lowestHoleMm: 6,
  washerDiameterMm: 8,
  washerFromTopMm: 6,
  coinBelowWasherMm: 1.5,
  stepMm: 6,
  stepRadiusMm: 6,
  outerCornerRadiusMm: 4,
  minCardBelowEdgeMm: 1.9,
  windowWidthMm: 12,
  windowLengthMm: 50,
  windowFromTopMm: 14,
  windowBelowWasherMm: 4,
  thumbNotchWidthMm: 30,
  thumbNotchDepthMm: 18,
  billNotchWidthMm: 20,
  billNotchDepthMm: 28,
  notchCornerRadiusMm: 2,
  markXMm: 17,
  markUMm: 14,
  markSizeMm: 10,
  minCoinProtrusionMm: 8,
  testCardPartMm: 20,
  testCoinsPerRow: 2,
  roundStepMm: 0.5,
};

/** Arch kůže A4 (na výšku), na který se musí vejít D1 a zkušební lusk vedle sebe. */
export const LEATHER_SHEET = { widthMm: 210, heightMm: 297 } as const;
/** Tiskový list A4 na výšku a jeho okraj. */
export const PRINT_SHEET = { widthMm: 210, heightMm: 297, marginMm: 10 } as const;
/** Místo nad dílem na listu (nadpis) a pod ním (popisky, kontrolní úsečka). */
export const SHEET_HEADER_MM = 22;
export const SHEET_FOOTER_MM = 34;
/** Délka kontrolní úsečky na každém listu. */
export const CALIBRATION_MM = 50;

/** Svislý šev: čára x, horní a dolní otvor, počet otvorů. */
export interface Seam {
  id: 'L' | 'D' | 'P';
  name: string;
  x: number;
  uTop: number;
  uBottom: number;
  holes: number;
}

/** Lepený pruh v souřadnicích líce: x0–x1, u0–u1 (platí pro obě stěny). */
export interface GlueStrip {
  id: 'L' | 'D' | 'P';
  x0: number;
  x1: number;
  u0: number;
  u1: number;
}

export interface MinimalWalletLayout {
  t: number;
  /** Obsah karetní zóny: 4 karty bez bankovek, stav B, stav C. */
  content4Mm: number;
  contentBMm: number;
  contentCMm: number;
  /** κ′ = π·t − 2t: délka navíc po neutrální ose kolem dvou vypouklých a dvou vydutých rohů. */
  kappaMm: number;
  /** Potřebná délka stěny karetní zóny (w_k + obsah + κ′). */
  needCardZone4Mm: number;
  needCardZoneBMm: number;
  needCardZoneCMm: number;
  /** S_c a rezervy ve stavech. */
  cardZoneMm: number;
  reserve4Mm: number;
  reserveBMm: number;
  reserveCMm: number;
  /** Dutina lusku c, trn b × c (u ústí) a b_end (u konce), P = polovina obvodu trnu po neutrální ose. */
  cavityMm: number;
  mandrelWidthMm: number;
  mandrelEndWidthMm: number;
  mandrelLengthMm: number;
  mandrelDepthMm: number;
  halfPerimeterMm: number;
  podZoneMm: number;
  /** Nejširší trn, který projde bez šikmých přechodů (b + S_l − P). */
  mandrelMaxWidthMm: number;
  /** Ohyb dna: přídavek F, neutrální a vnitřní poloměr. */
  foldMm: number;
  foldNeutralRadiusMm: number;
  foldInnerRadiusMm: number;
  /**
   * Kulatá distanční tyčka do ohybu při lepení a děrování naplocho (kroky 11, 13) – NE trn T1.
   * Průměr = 2 × R_i, sedí přesně ve vnitřním poloměru ohybu a čouhá jen R_i nad plochu, takže
   * (na rozdíl od plochého trnu 29 × 6 položeného napříč) nezasahuje do lepených pruhů ani děrování
   * (oddíl 15, B1).
   */
  foldSpacerDiameterMm: number;
  /** Výšky stěn. */
  podHeightMm: number;
  cardHeightMm: number;
  lengthMm: number;
  /** x souřadnice. */
  seamLeftX: number;
  cardZoneX0: number;
  cardZoneX1: number;
  seamDividerX: number;
  podX0: number;
  podX1: number;
  seamRightX: number;
  widthMm: number;
  cardCenterX: number;
  podCenterX: number;
  /** Vydutý schod: střed kruhu (x, u) a poloměr. */
  stepCenterX: number;
  stepCenterU: number;
  /** Středy vypouklých horních rohů. */
  cornerLeft: { x: number; u: number };
  cornerRight: { x: number; u: number };
  /** Podložky: střed u a hrany. */
  washerU: number;
  washerBottomU: number;
  washerTopU: number;
  /** Průzor (obě stěny): x hrany, středy koncových kruhů. */
  windowX0: number;
  windowX1: number;
  windowCenterBottomU: number;
  windowCenterTopU: number;
  windowBottomU: number;
  windowTopU: number;
  /** Výkusy: x hrany, střed dna (u) a dno. */
  thumbNotch: { x0: number; x1: number; centerU: number; bottomU: number; r: number };
  billNotch: { x0: number; x1: number; centerU: number; bottomU: number; r: number };
  /** Švy a lepení. */
  seams: Seam[];
  holesTotal: number;
  stitchesTotal: number;
  glue: GlueStrip[];
  /** Tloušťky [mm]. */
  thicknessPodMm: number;
  thicknessA: { cardMin: number; cardMax: number; max: number };
  thicknessB: { card: number; max: number };
  thicknessC: { card: number; max: number };
  maxLayersInSeam: number;
  /** Šířky: u dna vždy W, nahoře odhad podle stavu (model čočky, ověřit). */
  podProjectionMm: number;
  topWidthA: number;
  topWidthB: number;
  topWidthC: number;
  /** Hotová výška lusku a karetní zóny. */
  finishedHeightMm: number;
  finishedCardHeightMm: number;
  /** Karta: kolik je pod hranou u stěny, ve stavu C (stažení ohybem) a kolik vyčnívá ve výkusu. */
  cardBelowEdgeMm: number;
  foldShortfallCMm: number;
  cardBelowEdgeCMm: number;
  cardProtrusionMinMm: number;
  cardProtrusionMaxMm: number;
  /** Bankovka ve výkusu na bankovky. */
  billProtrusionMinMm: number;
  billProtrusionMaxMm: number;
  /** Mince: sloupec pod prahem, vyčnívání po posunu palcem (= D − a_p), dotažení pod práh. */
  coinColumnTopU: number;
  coinProtrusionMaxMm: number;
  coinProtrusionMinMm: number;
  coinPullDownMm: number;
  /** Zkušební lusk: šířka, délka, výška stěny, švy, průzor. */
  test: {
    widthMm: number;
    lengthMm: number;
    wallHeightMm: number;
    seams: Seam[];
    glue: GlueStrip[];
    podCenterX: number;
    windowCenterBottomU: number;
    windowCenterTopU: number;
    washerU: number;
  };
}

const PI = Math.PI;

/** Zaokrouhlení na nejbližší násobek `step` (polovina nahoru). */
export function roundTo(v: number, step: number): number {
  return Math.round(v / step + 1e-9) * step;
}

/** Zaokrouhlení nahoru na násobek `step`. */
export function roundUpTo(v: number, step: number): number {
  return Math.ceil(v / step - 1e-9) * step;
}

/** Otvory švu od horního otvoru dolů po rozteči, nejnižší nejméně `lowest`. */
function seamHoles(
  uTop: number,
  lowest: number,
  pitch: number,
): { holes: number; uBottom: number } {
  const holes = Math.floor((uTop - lowest) / pitch + 1e-9) + 1;
  return { holes, uBottom: uTop - (holes - 1) * pitch };
}

/**
 * Vodorovná projekce stěny karetní zóny: stěna jde od okraje lepení svisle o (h/2 − t) nahoru
 * a pak přes obsah. Délka mimo obsah a rohy (S − w − π·t)/2 na stranu se nakloní, projekce je
 * w + 2·d + 2·t/2·2. Hrubý model (ověřit na prototypu, 13.4 #18).
 */
function cardZoneProjection(S: number, w: number, h: number, t: number): number {
  const ls = (S - w - PI * t) / 2;
  const rise = Math.abs(h / 2 - t);
  const d = ls > rise ? Math.sqrt(ls * ls - rise * rise) : 0;
  return w + 2 * d + 2 * t;
}

export function minimalWalletLayout(
  spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET,
): MinimalWalletLayout {
  const t = spec.leatherMm;
  const step = spec.roundStepMm;
  const e = spec.seamOffsetMm;
  const g = spec.glueBeyondSeamMm;
  const wk = spec.cardWidthMm;

  const content4Mm = spec.cardsB * spec.cardThicknessMm;
  const contentBMm = spec.cardsB * spec.cardThicknessMm + spec.billsThicknessMm;
  const contentCMm = spec.cardsC * spec.cardThicknessMm + spec.billsThicknessMm;
  const kappaMm = PI * t - 2 * t;
  const needCardZone4Mm = wk + content4Mm + kappaMm;
  const needCardZoneBMm = wk + contentBMm + kappaMm;
  const needCardZoneCMm = wk + contentCMm + kappaMm;
  // S_c se zaokrouhluje NAHORU, aby rezerva nad stavem C nikdy neklesla pod s_c.
  const cardZoneMm = roundUpTo(needCardZoneCMm + spec.cardZoneReserveMm, step);

  const cavityMm = spec.coinLayers * spec.coinThicknessMaxMm + spec.cavityClearanceMm;
  const b = spec.coinDiameterMaxMm + spec.sideClearanceMm;
  const r = spec.mandrelEdgeRadiusMm;
  const halfPerimeterMm = b - 2 * r + (cavityMm - 2 * r) + PI * (r + t / 2);
  const podZoneMm = roundTo(halfPerimeterMm + spec.insertReserveMm, step);

  const foldNeutralRadiusMm = (cavityMm + t) / 2;
  const foldInnerRadiusMm = foldNeutralRadiusMm - t / 2;
  const foldMm = (PI / 2) * (cavityMm + t);

  const podHeightMm =
    spec.coinsPerRow * spec.coinDiameterMaxMm +
    spec.coinBelowWasherMm +
    spec.washerFromTopMm +
    spec.washerDiameterMm / 2;
  const cardHeightMm = podHeightMm - spec.stepMm;
  const lengthMm = 2 * podHeightMm + foldMm;

  const seamLeftX = e;
  const cardZoneX0 = e + g;
  const cardZoneX1 = cardZoneX0 + cardZoneMm;
  const seamDividerX = cardZoneX1 + g;
  const podX0 = seamDividerX + g;
  const podX1 = podX0 + podZoneMm;
  const seamRightX = podX1 + g;
  const widthMm = seamRightX + e;
  const cardCenterX = (cardZoneX0 + cardZoneX1) / 2;
  const podCenterX = (podX0 + podX1) / 2;

  const Rs = spec.stepRadiusMm;
  const stepCenterX = seamDividerX - e - Rs;
  const stepCenterU = podHeightMm;
  const Ro = spec.outerCornerRadiusMm;

  const washerU = podHeightMm - spec.washerFromTopMm;
  const washerBottomU = washerU - spec.washerDiameterMm / 2;
  const washerTopU = washerU + spec.washerDiameterMm / 2;

  const wp = spec.windowWidthMm;
  const windowCenterTopU = podHeightMm - spec.windowFromTopMm - wp / 2;
  const windowCenterBottomU = windowCenterTopU - (spec.windowLengthMm - wp);

  const notch = (w: number, depth: number) => ({
    x0: cardCenterX - w / 2,
    x1: cardCenterX + w / 2,
    centerU: cardHeightMm - depth + w / 2,
    bottomU: cardHeightMm - depth,
    r: w / 2,
  });
  const thumbNotch = notch(spec.thumbNotchWidthMm, spec.thumbNotchDepthMm);
  const billNotch = notch(spec.billNotchWidthMm, spec.billNotchDepthMm);

  const pitch = spec.stitchPitchMm;
  const lowest = spec.lowestHoleMm;
  const mk = (id: Seam['id'], name: string, x: number, uTop: number): Seam => ({
    id,
    name,
    x,
    uTop,
    ...seamHoles(uTop, lowest, pitch),
  });
  const seams = [
    mk('L', 'levý', seamLeftX, cardHeightMm - e),
    mk('D', 'dělicí', seamDividerX, podHeightMm - e),
    mk('P', 'pravý', seamRightX, podHeightMm - e),
  ];
  const holesTotal = seams.reduce((s, q) => s + q.holes, 0);
  const glue: GlueStrip[] = [
    { id: 'L', x0: 0, x1: seamLeftX + g, u0: spec.glueStartMm, u1: cardHeightMm },
    {
      id: 'D',
      x0: seamDividerX - g,
      x1: seamDividerX + g,
      u0: spec.glueStartMm,
      u1: podHeightMm,
    },
    { id: 'P', x0: seamRightX - g, x1: widthMm, u0: spec.glueStartMm, u1: podHeightMm },
  ];

  // Lusk: horní plocha trnu po neutrální ose, zbytek S_l jde šikmo k okraji lepení.
  const topArc = b - 2 * r + 2 * (PI / 2) * (r + t / 2);
  const slant = (podZoneMm - topArc) / 2;
  const drop = cavityMm / 2 - r - t / 2;
  const slantH = slant > drop ? Math.sqrt(slant * slant - drop * drop) : 0;
  const podProjectionMm = b + 2 * (t / 2 + slantH);
  const side = e + g;
  const topWidth = (h: number | null): number =>
    side +
    (h === null ? cardZoneMm : cardZoneProjection(cardZoneMm, wk, h, t)) +
    2 * g +
    podProjectionMm +
    side;

  const cardBelowEdgeMm = cardHeightMm - spec.cardHeightMm;
  const foldShortfallCMm = Math.max(0, (PI / 2) * (contentCMm + t) - foldMm);
  const cardBelowEdgeCMm = cardBelowEdgeMm - foldShortfallCMm / 2;
  // Přední karta u stěny stojí dolní hranou v u ≈ 0; karta dál od stěny sedne v oblouku níž
  // (roh karty v oblouku vnitřního poloměru R_i: √(R_i² − (R_i − t_k)²) – hrubý odhad, ověřit).
  const ri = foldInnerRadiusMm;
  const tk = spec.cardThicknessMm;
  const cardSink = ri > tk ? Math.sqrt(ri * ri - (ri - tk) * (ri - tk)) : 0;
  const cardProtrusionMaxMm = spec.cardHeightMm - thumbNotch.bottomU;
  const cardProtrusionMinMm = cardProtrusionMaxMm - Math.max(0, cardSink);

  const coinColumnTopU = spec.coinsPerRow * spec.coinDiameterMaxMm;
  const protrusion = (D: number): number => D - spec.windowFromTopMm;

  const tW = 2 * e + 4 * g + spec.testCardPartMm + podZoneMm;
  const tH =
    spec.testCoinsPerRow * spec.coinDiameterMaxMm +
    spec.coinBelowWasherMm +
    spec.washerFromTopMm +
    spec.washerDiameterMm / 2;
  const tDivider = e + 2 * g + spec.testCardPartMm;
  const tRight = tDivider + 2 * g + podZoneMm;
  const tSeams = [
    mk('L', 'levý', e, tH - e),
    mk('D', 'dělicí', tDivider, tH - e),
    mk('P', 'pravý', tRight, tH - e),
  ];
  const tGlue: GlueStrip[] = [
    { id: 'L', x0: 0, x1: e + g, u0: spec.glueStartMm, u1: tH },
    { id: 'D', x0: tDivider - g, x1: tDivider + g, u0: spec.glueStartMm, u1: tH },
    { id: 'P', x0: tRight - g, x1: tW, u0: spec.glueStartMm, u1: tH },
  ];
  const tWindowTop = tH - spec.windowFromTopMm - wp / 2;
  // Průzor zkušebního lusku má stejný horní konec vůči hraně; dole je kratší o chybějící mince.
  const tWindowBottom = Math.min(
    tWindowTop -
      (spec.windowLengthMm - wp) +
      (spec.coinsPerRow - spec.testCoinsPerRow) * spec.coinDiameterMaxMm,
    tWindowTop,
  );

  return {
    t,
    content4Mm: round(content4Mm),
    contentBMm: round(contentBMm),
    contentCMm: round(contentCMm),
    kappaMm: round(kappaMm),
    needCardZone4Mm: round(needCardZone4Mm),
    needCardZoneBMm: round(needCardZoneBMm),
    needCardZoneCMm: round(needCardZoneCMm),
    cardZoneMm,
    reserve4Mm: round(cardZoneMm - needCardZone4Mm),
    reserveBMm: round(cardZoneMm - needCardZoneBMm),
    reserveCMm: round(cardZoneMm - needCardZoneCMm),
    cavityMm: round(cavityMm),
    mandrelWidthMm: round(b),
    mandrelEndWidthMm: round(b - spec.mandrelTaperMm),
    mandrelDepthMm: round(podHeightMm + foldInnerRadiusMm),
    mandrelLengthMm: round(podHeightMm + foldInnerRadiusMm + spec.mandrelHandleMm),
    halfPerimeterMm: round(halfPerimeterMm),
    podZoneMm,
    mandrelMaxWidthMm: round(b + podZoneMm - halfPerimeterMm),
    foldMm: round(foldMm),
    foldNeutralRadiusMm: round(foldNeutralRadiusMm),
    foldInnerRadiusMm: round(foldInnerRadiusMm),
    foldSpacerDiameterMm: round(2 * foldInnerRadiusMm),
    podHeightMm: round(podHeightMm),
    cardHeightMm: round(cardHeightMm),
    lengthMm: round(lengthMm),
    seamLeftX,
    cardZoneX0,
    cardZoneX1: round(cardZoneX1),
    seamDividerX: round(seamDividerX),
    podX0: round(podX0),
    podX1: round(podX1),
    seamRightX: round(seamRightX),
    widthMm: round(widthMm),
    cardCenterX: round(cardCenterX),
    podCenterX: round(podCenterX),
    stepCenterX: round(stepCenterX),
    stepCenterU: round(stepCenterU),
    cornerLeft: { x: Ro, u: round(cardHeightMm - Ro) },
    cornerRight: { x: round(widthMm - Ro), u: round(podHeightMm - Ro) },
    washerU: round(washerU),
    washerBottomU: round(washerBottomU),
    washerTopU: round(washerTopU),
    windowX0: round(podCenterX - wp / 2),
    windowX1: round(podCenterX + wp / 2),
    windowCenterBottomU: round(windowCenterBottomU),
    windowCenterTopU: round(windowCenterTopU),
    windowBottomU: round(windowCenterBottomU - wp / 2),
    windowTopU: round(windowCenterTopU + wp / 2),
    thumbNotch: roundNotch(thumbNotch),
    billNotch: roundNotch(billNotch),
    seams,
    holesTotal,
    stitchesTotal: holesTotal - seams.length,
    glue: glue.map(roundGlue),
    thicknessPodMm: round(cavityMm + 2 * t),
    thicknessA: {
      cardMin: round(2 * t),
      cardMax: round(2 * t + contentBMm),
      max: round(Math.max(cavityMm + 2 * t, 2 * t + contentBMm)),
    },
    thicknessB: {
      card: round(2 * t + contentBMm),
      max: round(Math.max(cavityMm + 2 * t, 2 * t + contentBMm)),
    },
    thicknessC: {
      card: round(2 * t + contentCMm),
      max: round(Math.max(cavityMm + 2 * t, 2 * t + contentCMm)),
    },
    maxLayersInSeam: 2,
    podProjectionMm: round(podProjectionMm),
    topWidthA: round(topWidth(null)),
    topWidthB: round(topWidth(contentBMm)),
    topWidthC: round(topWidth(contentCMm)),
    finishedHeightMm: round(podHeightMm + foldInnerRadiusMm + t),
    finishedCardHeightMm: round(cardHeightMm + foldInnerRadiusMm + t),
    cardBelowEdgeMm: round(cardBelowEdgeMm),
    foldShortfallCMm: round(foldShortfallCMm),
    cardBelowEdgeCMm: round(cardBelowEdgeCMm),
    cardProtrusionMinMm: round(cardProtrusionMinMm),
    cardProtrusionMaxMm: round(cardProtrusionMaxMm),
    billProtrusionMinMm: round(spec.billHeightMinMm - billNotch.bottomU),
    billProtrusionMaxMm: round(spec.billHeightMaxMm - billNotch.bottomU),
    coinColumnTopU: round(coinColumnTopU),
    coinProtrusionMaxMm: round(protrusion(spec.coinDiameterMaxMm)),
    coinProtrusionMinMm: round(protrusion(spec.coinDiameterMinMm)),
    coinPullDownMm: round(podHeightMm - washerBottomU),
    test: {
      widthMm: round(tW),
      lengthMm: round(2 * tH + foldMm),
      wallHeightMm: round(tH),
      seams: tSeams,
      glue: tGlue.map(roundGlue),
      podCenterX: round(tDivider + g + podZoneMm / 2),
      windowCenterBottomU: round(tWindowBottom),
      windowCenterTopU: round(tWindowTop),
      washerU: round(tH - spec.washerFromTopMm),
    },
  };
}

function roundNotch(n: MinimalWalletLayout['thumbNotch']): MinimalWalletLayout['thumbNotch'] {
  return {
    x0: round(n.x0),
    x1: round(n.x1),
    centerU: round(n.centerU),
    bottomU: round(n.bottomU),
    r: round(n.r),
  };
}

function roundGlue(s: GlueStrip): GlueStrip {
  return { ...s, x0: round(s.x0), x1: round(s.x1), u0: round(s.u0), u1: round(s.u1) };
}

/** x na rubu (díl otočený přes svislou osu): x_rub = W − x. */
export function toBackSide(x: number, widthMm: number): number {
  return round(widthMm - x);
}

/**
 * Kontroly střihu. Vrací seznam problémů česky (prázdný = v pořádku). Hlídá kolize výřezů,
 * vůle zón, počty otvorů, vrstvy ve švech a to, že se díl vejde na A4 (kůže i tisk).
 */
export function checkMinimalWallet(spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET): string[] {
  const p: string[] = [];
  const positive: (keyof MinimalWalletSpec)[] = [
    'cardWidthMm',
    'cardHeightMm',
    'cardThicknessMm',
    'leatherMm',
    'coinDiameterMaxMm',
    'coinDiameterMinMm',
    'coinThicknessMaxMm',
    'stitchPitchMm',
    'washerDiameterMm',
    'windowWidthMm',
    'windowLengthMm',
    'roundStepMm',
  ];
  for (const k of positive) {
    const v = spec[k];
    if (!(typeof v === 'number' && Number.isFinite(v) && v > 0)) {
      p.push(`${k} musí být kladné číslo (je ${String(v)}).`);
    }
  }
  if (p.length > 0) return p;
  if (
    !Number.isInteger(spec.cardsB) ||
    !Number.isInteger(spec.cardsC) ||
    spec.cardsC < spec.cardsB
  ) {
    p.push('Počty karet musí být celá čísla a stav C nesmí mít méně karet než stav B.');
  }
  if (spec.cardsC < 4 || spec.cardsC > 6) {
    p.push(`Brief chce 4–6 karet; stav C má ${spec.cardsC}.`);
  }
  if (spec.coinDiameterMinMm > spec.coinDiameterMaxMm) {
    p.push('Nejmenší mince je větší než největší.');
  }
  const L = minimalWalletLayout(spec);
  const t = spec.leatherMm;
  const e = spec.seamOffsetMm;

  // Karetní zóna: stav C se musí vejít i při přetoku lepidla z obou okrajů, rezerva ≥ tolerance.
  const lossC = 2 * spec.glueOverflowMm;
  if (L.cardZoneMm - lossC < L.needCardZoneCMm - 1e-9) {
    p.push(
      `Karetní zóna S_c ${fmt(L.cardZoneMm)} mm po přetoku lepidla (−${fmt(lossC)}) nepojme stav C (potřeba ${fmt(L.needCardZoneCMm)} mm).`,
    );
  }
  if (L.reserveCMm < spec.cardZoneReserveMm - spec.roundStepMm / 2 - 1e-9) {
    p.push(
      `Rezerva karetní zóny ve stavu C je ${fmt(L.reserveCMm)} mm, menší než výrobní tolerance ${fmt(spec.cardZoneReserveMm)} mm.`,
    );
  }
  if (spec.cardHeightMm + L.foldInnerRadiusMm < 0) p.push('Karta je záporná.');
  // Distanční tyčka v ohybu (kroky 11, 13): smí čouhat nad plochu jen do začátku lepení,
  // jinak by bránila lepeným pruhům i děrování (B1, oddíl 15) – stejná vada jako u plochého trnu.
  if (L.foldSpacerDiameterMm / 2 >= spec.glueStartMm) {
    p.push(
      `Distanční tyčka Ø ${fmt(L.foldSpacerDiameterMm)} mm by čněla do pásma lepení (lepení od u = ${fmt(spec.glueStartMm)} mm).`,
    );
  }

  // Lusk: trn musí projít i po přetoku lepidla, a širší trn než b_max by se nevešel.
  const lossL = 2 * spec.glueOverflowMm;
  if (L.podZoneMm - lossL < L.halfPerimeterMm - 1e-9) {
    p.push(
      `Lusk S_l ${fmt(L.podZoneMm)} mm po přetoku lepidla (−${fmt(lossL)}) je užší než polovina obvodu trnu ${fmt(L.halfPerimeterMm)} mm – trn neprojde.`,
    );
  }
  if (L.mandrelEndWidthMm < spec.coinDiameterMaxMm + 0.5) {
    p.push(
      `Trn u konce ${fmt(L.mandrelEndWidthMm)} mm nechá minci ${fmt(spec.coinDiameterMaxMm)} mm boční vůli pod 0,5 mm.`,
    );
  }
  if (L.cavityMm < spec.coinLayers * spec.coinThicknessMaxMm + 0.5) {
    p.push(`Dutina ${fmt(L.cavityMm)} mm je na ${spec.coinLayers} vrstvy mincí moc těsná.`);
  }
  // Práh: podložka uprostřed musí ležet pod každou mincí (W_i < 2D − D_w).
  if (L.mandrelWidthMm >= 2 * spec.coinDiameterMinMm - spec.washerDiameterMm) {
    p.push(
      `Mince Ø ${fmt(spec.coinDiameterMinMm)} může v lusku šířky ${fmt(L.mandrelWidthMm)} podložku Ø ${fmt(spec.washerDiameterMm)} minout (podmínka b < 2D − D_w).`,
    );
  }
  if (spec.coinBelowWasherMm < 1 || L.coinColumnTopU > L.washerBottomU - 1 + 1e-9) {
    p.push(
      `Sloupec ${spec.coinsPerRow} mincí (do u = ${fmt(L.coinColumnTopU)}) sahá skoro do prahu (podložka od u = ${fmt(L.washerBottomU)}, vůle pod 1 mm nepokryje polohu podložky ±0,5).`,
    );
  }
  if (L.washerTopU > L.podHeightMm - 1) {
    p.push('Podložka prahu sahá k horní hraně lusku (méně než 1 mm).');
  }
  // Průzor: pevný můstek pod podložkou, užší než nejmenší mince, uvnitř rovné plochy trnu.
  if (L.windowTopU > L.washerBottomU - spec.windowBelowWasherMm + 1e-9) {
    p.push(
      `Průzor končí v u = ${fmt(L.windowTopU)}, jen ${fmt(L.washerBottomU - L.windowTopU)} mm pod podložkou (minimum ${fmt(spec.windowBelowWasherMm)}).`,
    );
  }
  if (spec.windowWidthMm >= spec.coinDiameterMinMm) {
    p.push(`Průzor ${fmt(spec.windowWidthMm)} mm je širší než nejmenší mince – vypadla by.`);
  }
  const flatHalf = L.mandrelEndWidthMm / 2 - spec.mandrelEdgeRadiusMm;
  if (spec.windowWidthMm / 2 > flatHalf - 1) {
    p.push('Průzor zasahuje do zaoblení trnu (méně než 1 mm od rovné plochy).');
  }
  if (L.windowBottomU < spec.glueStartMm + 5) {
    p.push(`Průzor sahá do u = ${fmt(L.windowBottomU)}, příliš blízko ohybu dna.`);
  }
  if (L.windowCenterBottomU > L.windowCenterTopU) {
    p.push('Průzor je kratší než jeho šířka.');
  }
  if (L.coinProtrusionMaxMm < spec.minCoinProtrusionMm) {
    p.push(
      `Mince Ø ${fmt(spec.coinDiameterMaxMm)} po posunu palcem vyčnívá jen ${fmt(L.coinProtrusionMaxMm)} mm (minimum ${fmt(spec.minCoinProtrusionMm)}); průzor musí končit výš.`,
    );
  }
  if (L.coinProtrusionMinMm <= 2) {
    p.push(
      `Nejmenší mince Ø ${fmt(spec.coinDiameterMinMm)} se v ústí průzorem skoro nechytí (přesah ${fmt(L.coinProtrusionMinMm)} mm).`,
    );
  }
  // Karty.
  if (L.cardBelowEdgeCMm < spec.minCardBelowEdgeMm - 1e-9) {
    p.push(
      `Karta je ve stavu C jen ${fmt(L.cardBelowEdgeCMm)} mm pod hranou kapsy (minimum ${fmt(spec.minCardBelowEdgeMm)}).`,
    );
  }
  const notchIn = (n: MinimalWalletLayout['thumbNotch'], name: string): void => {
    if (n.x0 < L.cardZoneX0 + 3 || n.x1 > L.cardZoneX1 - 3) {
      p.push(`${name} zasahuje k lepení karetní zóny (méně než 3 mm).`);
    }
    if (n.bottomU < spec.glueStartMm + 10) p.push(`${name} je hlubší než půl kapsy.`);
    if (n.r < spec.notchCornerRadiusMm) p.push(`${name} je užší než zaoblení rohů.`);
  };
  notchIn(L.thumbNotch, 'Výkus na palec');
  notchIn(L.billNotch, 'Výkus na bankovky');
  if (L.cardProtrusionMinMm < 12) {
    p.push(`Karta vyčnívá ve výkusu jen ${fmt(L.cardProtrusionMinMm)} mm (palec potřebuje ≥ 12).`);
  }
  if (L.billProtrusionMinMm < 8) {
    p.push(`Bankovka vyčnívá v zadním výkusu jen ${fmt(L.billProtrusionMinMm)} mm (minimum 8).`);
  }
  if (L.billNotch.bottomU < L.thumbNotch.bottomU - spec.billNotchDepthMm) {
    p.push('Výkus na bankovky je nelogicky hluboký.');
  }
  // Schod a horní otvory.
  if (L.stepCenterX < L.thumbNotch.x1 + 3) {
    p.push('Vydutý schod lusku koliduje s výkusem na palec.');
  }
  if (spec.stepMm > spec.stepRadiusMm + 1e-9) {
    p.push(
      'Schod je vyšší než poloměr vydutého oblouku – oblouk by nedosáhl na hranu karetní zóny.',
    );
  }
  const [sl, sd, sr] = L.seams as [Seam, Seam, Seam];
  const du = sd.uTop - L.stepCenterU;
  const arcX = L.stepCenterX + Math.sqrt(Math.max(0, spec.stepRadiusMm ** 2 - du * du));
  if (sd.x - arcX < 3 - 1e-9) {
    p.push(`Horní otvor dělicího švu je jen ${fmt(sd.x - arcX)} mm od hrany schodu.`);
  }
  const cornerDist = (s: Seam, c: { x: number; u: number }): number =>
    spec.outerCornerRadiusMm - Math.hypot(s.x - c.x, s.uTop - c.u);
  if (cornerDist(sl, L.cornerLeft) < e - 0.5 || cornerDist(sr, L.cornerRight) < e - 0.5) {
    p.push('Horní otvor krajního švu je v zaobleném rohu moc blízko hrany.');
  }
  for (const s of L.seams) {
    if (s.uBottom < spec.lowestHoleMm - 1e-9) {
      p.push(
        `Nejnižší otvor švu ${s.name} (u = ${fmt(s.uBottom)}) je pod u_h = ${fmt(spec.lowestHoleMm)}.`,
      );
    }
    if (s.uBottom <= spec.glueStartMm) {
      p.push(`Nejnižší otvor švu ${s.name} leží pod začátkem lepení.`);
    }
    if (s.holes < 10) p.push(`Šev ${s.name} má jen ${s.holes} otvorů.`);
  }
  if (spec.stitchPitchMm < 3 || spec.stitchPitchMm > 5) {
    p.push(`Rozteč stehů ${fmt(spec.stitchPitchMm)} mm je mimo 3–5 mm.`);
  }
  if (spec.seamOffsetMm < 3 || spec.seamOffsetMm > 4) {
    p.push(`Šev ${fmt(spec.seamOffsetMm)} mm od hrany je mimo 3–4 mm (brief kap. 13).`);
  }
  if (spec.glueStartMm >= spec.lowestHoleMm) {
    p.push('Lepení musí začínat pod nejnižším otvorem.');
  }
  // Maker's mark: mimo šev, výkus, průzor i ohyb.
  const m = spec.markSizeMm / 2;
  if (spec.markXMm - m < sl.x + 3) {
    p.push('Značka je moc blízko levého švu.');
  }
  if (spec.markUMm - m < spec.glueStartMm || spec.markUMm + m > L.thumbNotch.bottomU - 3) {
    p.push('Značka zasahuje k ohybu dna nebo k výkusu na palec.');
  }
  if (spec.markXMm + m > L.cardZoneX1 - 3) p.push('Značka zasahuje k dělicímu švu.');
  // Tloušťka a vrstvy.
  if (L.maxLayersInSeam * t > 3.0) {
    p.push(`Šev jde skrz ${fmt(L.maxLayersInSeam * t)} mm – vidličky 4 mm to neprorazí najednou.`);
  }
  if (L.thicknessC.max > 10) {
    p.push(`Tloušťka ve stavu C ${fmt(L.thicknessC.max)} mm je přes 10 mm.`);
  }
  // A4: arch kůže (D1 + zkušební lusk vedle sebe) a tiskový list.
  if (L.widthMm + L.test.widthMm > LEATHER_SHEET.widthMm || L.lengthMm > LEATHER_SHEET.heightMm) {
    p.push(
      `D1 (${fmt(L.widthMm)} × ${fmt(L.lengthMm)}) a zkušební lusk (${fmt(L.test.widthMm)}) se nevejdou vedle sebe na arch A4.`,
    );
  }
  const printable =
    PRINT_SHEET.heightMm - 2 * PRINT_SHEET.marginMm - SHEET_HEADER_MM - SHEET_FOOTER_MM;
  if (L.lengthMm > printable) {
    p.push(
      `D1 (${fmt(L.lengthMm)} mm) se nevejde na tiskový list A4 (místo ${fmt(printable)} mm).`,
    );
  }
  if (
    L.widthMm + L.test.widthMm + 6 > PRINT_SHEET.widthMm - 2 * PRINT_SHEET.marginMm + 1e-9 ||
    L.test.lengthMm > printable
  ) {
    p.push('Pohled na rub a zkušební lusk se nevejdou vedle sebe na tiskový list A4.');
  }
  if (L.mandrelLengthMm > printable) p.push('Trn se nevejde na tiskový list A4.');
  return p;
}

export function assertMinimalWallet(spec: MinimalWalletSpec): void {
  const problems = checkMinimalWallet(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatný střih peněženky LUSK:\n- ${problems.join('\n- ')}`);
  }
}

/** Číslo s desetinnou čárkou pro hlášky (na 0,01 mm, bez zbytečných nul). */
export function fmt(v: number): string {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}
