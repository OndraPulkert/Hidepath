/**
 * Peněženka VÍČKO – geometrie výrobního střihu v milimetrech.
 *
 * Návrh a všechny výpočty: docs/zadani/penezenka-vicko.md (oddíl 12 = tabulka parametrů, oddíl 13
 * = změny po kontrole). Tady jsou vzorce z oddílu 12 přepsané do kódu, aby šel střih vygenerovat
 * a zkontrolovat. **NÁVRH k ověření na prototypu** – nic tu není odměřené z hotového kusu.
 *
 * Konstrukce: jeden pás P1 (useň 1,0) – přední stěna F, ohyb dna, zadní stěna B s okénky, plochý
 * závěs se dvěma přehyby, pás víčka a jazýček s magnetem. Uvnitř přepážky D1 (dno karet, přepážka
 * karty / bankovky) a D2 (přední stěna dvou sloupců mincí). Zepředu dozadu: 6 karet – bankovky
 * napůl na celou šířku – 2 sloupce po 2 mincích. Magnet dosedá na plíšek pod dnem karet.
 *
 * Souřadnice (jako v dokumentu):
 * - **x** šířka zleva při pohledu zepředu (0 … W), všechno je souměrné podle W/2,
 * - **y** výška od vnějšího líce ohybu dna (y = 0),
 * - **v** podél rozvinutého pásu P1 od horní hrany F (v = 0) ke konci jazýčku.
 */

export interface LidWalletSpec {
  /** Karta ISO/IEC 7810 ID-1 (na šířku): 85,60 × 53,98 × 0,76 mm. */
  cardWidthMm: number;
  cardHeightMm: number;
  cardThicknessMm: number;
  /** Karet nejvýš (stav C) a ve stavu B. */
  cardsMax: number;
  cardsB: number;
  /** Pole magnetického proužku od dlouhé hrany karty (z kola 3, v ISO 7811 ověřit). */
  stripeNearMm: number;
  stripeFarMm: number;
  /** Bankovek ve stavu B a C, list bankovky a rezerva přehybu (ověřit posuvkou). */
  billsB: number;
  billsC: number;
  billSheetMm: number;
  billFoldReserveMm: number;
  /** Bankovky ČNB napůl: výška 69–74, šířka 70–85 (ověřit posuvkou). */
  billHeightMinMm: number;
  billHeightMaxMm: number;
  billHalfWidthMinMm: number;
  billHalfWidthMaxMm: number;
  /** Mince: největší 50 Kč Ø 27,5 × 2,5, nejmenší 1 Kč Ø 20 × 1,85 (ověřit posuvkou). */
  coinDiameterMaxMm: number;
  coinThicknessMaxMm: number;
  coinDiameterMinMm: number;
  coinThicknessMinMm: number;
  coinsPerColumn: number;
  /** Useň P1 (celý pás: F, ohyb dna, B, závěs, víčko, jazýček). */
  leatherMm: number;
  /**
   * Ztenčení pásu ohybu dna a pásu závěsu (z rubu). null = neztenčuje se, ohyb i závěs mají
   * tloušťku P1 (výchozí od Kola 6). Číslo = záloha, když ve zkoušce ohybu V12 popraská
   * líc nebo závěs zkušebního kusu neprojde (0,6; Kolo 8).
   */
  bottomFoldSkiveMm: number | null;
  hingeSkiveMm: number | null;
  /**
   * Přepážky D1/D2 a podšívka jazýčku L1 (výchozí 0,6). Po změření koupené usně se zadá skutečná
   * tloušťka (generátor `--divider`, `--lining`, Kolo 9); D1 a D2 mají v modelu jednu tloušťku.
   */
  dividerMm: number;
  liningMm: number;
  /** Přířez L1 (š × v) a horní hrana L1 nad středem magnetu (ryska na šabloně, list 4). */
  liningBlankWidthMm: number;
  liningBlankHeightMm: number;
  liningTopAboveMagnetMm: number;
  /**
   * Šev S7 kolem L1 (obšití konce jazýčku, výchozí od Kola 6): boky tolik od hrany jazýčku,
   * horní řada tolik pod horní hranou L1, otvory nejméně tolik od kraje magnetu.
   */
  liningSeamFromEdgeMm: number;
  liningSeamBelowTopMm: number;
  liningSeamMagnetClearanceMm: number;
  /** Magnet Ø × t, remanence (předpoklad pro odhad pole, třídu ověřit u prodejce), plíšek. */
  magnetDiameterMm: number;
  magnetThicknessMm: number;
  magnetRemanenceT: number;
  plateThicknessMm: number;
  /** k: posun víčka na přírůstek obsahu pod závěsem (plochý závěs ≈ 1,0; měřit P0-3). */
  kDesign: number;
  /** Největší k, se kterým se ještě počítá tabulka „co když“ (nad ním přepočet, oddíl 4.1). */
  kMax: number;
  /** δ: o kolik (× tloušťka obsahu) sedí obsah nad čarou lepení klínového dna (měřit P0-6). */
  wedgeLiftNom: number;
  wedgeLiftMax: number;
  /** e: čára švu od hrany; g: lepení za čáru švu; rozteč vidliček. */
  seamOffsetMm: number;
  glueBeyondSeamMm: number;
  stitchPitchMm: number;
  /** v_k: rezerva šířky kapsy nad obsah; v_c: vůle sloupce nad Ø + t mince. */
  cardPocketReserveMm: number;
  coinColumnReserveMm: number;
  /** Dno bankovek a vůle nejvyšší bankovky pod stropem. */
  billFloorMm: number;
  billTopClearanceMm: number;
  /** Nejmenší odstup středu magnetu od proužku (z kontroly 3D modelu). */
  stripeClearanceMinMm: number;
  /** Nejmenší odstup vršku magnetu pod čarou dna karet (schod F nad dnem, kontrola 2). */
  stepMarginMm: number;
  /** Střed magnetu nad špičkou jazýčku; ztenčený klín špičky; rezerva magnetu na plíšku. */
  magnetFromTipMm: number;
  tipSkiveMm: number;
  /** Rezerva špičky jazýčku nad začátkem rovné části F ve stavu A. */
  tipClearanceMm: number;
  plateMarginMm: number;
  /** Boční přesah plíšku za magnet (šířka plíšku = Ø magnetu + 2×). */
  plateSideMarginMm: number;
  /** Horní hrana plíšku pod čarou dna karet (karty na plíšku nestojí). */
  plateBelowFloorMm: number;
  /** Hloubka kapsy karet (horní hrana F nad čarou dna karet). */
  cardPocketDepthMm: number;
  /**
   * Vnitřní poloměr přehybů závěsu (předpoklad; od Kola 9 se závěs tvaruje zavřený přes obsah
   * stavu B bez kopyta, k měří krok 16) a vložka ohybu dna (2 vrstvy starých karet 2 × 0,76 = 1,52
   * nebo jiný rovný pás 1,5; Kolo 9).
   */
  hingeInnerRadiusMm: number;
  bottomSpacerMm: number;
  /**
   * Šířka pásu ohybu dna a pásu závěsu (v pásu závěsu se nelepí ani nešije; ztenčuje se jen
   * v záloze).
   */
  skiveBandMm: number;
  /**
   * Přesah ztenčeného pásu závěsu (záloha B) za začátek závěsu a za konec závěsu ve stavu C;
   * pás pak pokryje oba přehyby ve všech stavech A–C (Kolo 8).
   */
  hingeSkiveOverlapMm: number;
  /**
   * Náběh na každém okraji ztenčeného pásu závěsu (krok 4(b)): přechod z plné tloušťky na
   * ztenčení. Pás závěsu v záloze B je zóna plného ztenčení, náběh leží vně něj (Kolo 8).
   */
  skiveTaperMm: number;
  /** Čára lepení dna mincí pod čarou dna karet; spodní hrana D2 pod S1. */
  coinFloorBelowCardFloorMm: number;
  d2BelowS1Mm: number;
  /** Délka klínu (ztenčení do nuly) od spodní hrany D2 nahoru; musí skončit pod S1. */
  d2SkiveWedgeMm: number;
  /** D1 a D2 pod stropem. */
  d1BelowCeilingMm: number;
  d2BelowCeilingMm: number;
  /** Okénko bankovek (uprostřed zad skrz D2 + B): šířka = výsečník konců, y od–do. */
  billWindowWidthMm: number;
  billWindowBottomMm: number;
  billWindowTopMm: number;
  /** Kontakt bříška prstu v okénku (pro výpočet tahu, 12–15, ověřit). */
  fingerContactMm: number;
  /** Okénka mincí (jen B): šířka a dolní konec nad čarou dna mincí. */
  coinWindowWidthMm: number;
  coinWindowAboveFloorMm: number;
  /** Jazýček: šířka, R špičky, rezerva na ořez, vyduté napojení. */
  tongueWidthMm: number;
  tongueTipRadiusMm: number;
  tongueReserveMm: number;
  tongueJoinRadiusMm: number;
  /**
   * Rohy: pás víčka, tělo dole (0 = hranaté, výchozí od Kola 6; zaoblení R4 jen volitelně),
   * horní hrana F, D1 nahoře.
   */
  bandCornerRadiusMm: number;
  bodyCornerRadiusMm: number;
  frontTopCornerRadiusMm: number;
  d1CornerRadiusMm: number;
  /** Mezera hrany pásu víčka nad horní hranou F ve stavu C (bez přesahu = bez pruhu 12,36). */
  lidGapAtFullMm: number;
  /** Šev dna karet S6 vynechá pás ± tolik kolem osy (plíšek + jazýček). */
  s6ClearFromAxisMm: number;
  /** Nejnižší otvor bočních švů. */
  lowestHoleMm: number;
  /** Krok zaokrouhlení (výšky, šířky). */
  roundStepMm: number;
  /**
   * Přesah vložky dna za boky dílu (na každé straně): ohyb má oporu po celé šířce, boky se
   * nevyplňují lepidlem (hranaté rohy, Kolo 6).
   */
  bottomSpacerOverhangMm: number;
  /**
   * Dotyk bříška palce (odhad ~12, ověřit): posun horní mince okénkem sloupce (oddíl 4.5). Výřez
   * pro palec má vlastní rozměry níž, takže úprava výřezu podle P0-4 posun mince nemění.
   */
  thumbContactMm: number;
  /** Šířka výřezu pro palec (= Ø výsečníku dna) a hloubka pod horní hranou F (oddíl 4.6). */
  thumbNotchWidthMm: number;
  thumbNotchDepthMm: number;
  /** Rohy ústí výřezu pro palec (vypouklé, zaoblit brusným papírem). */
  thumbNotchCornerRadiusMm: number;
  /**
   * Rezerva rohů ústí výřezu od boků jazýčku nad boční tolerancí magnetu (plateSideMarginMm):
   * i jazýček posunutý bočně o celou toleranci přikryje výřez včetně rohů.
   */
  thumbNotchSideReserveMm: number;
  /** O kolik může dno bankovek ležet níž než billFloorMm (tolerance 1,0–2,0, oddíl 4.4). */
  billFloorToleranceMm: number;
}

export const DEFAULT_LID_WALLET: LidWalletSpec = {
  cardWidthMm: 85.6,
  cardHeightMm: 53.98,
  cardThicknessMm: 0.76,
  cardsMax: 6,
  cardsB: 2,
  stripeNearMm: 5.54,
  stripeFarMm: 15.82,
  billsB: 1,
  billsC: 3,
  billSheetMm: 0.1,
  billFoldReserveMm: 0.5,
  billHeightMinMm: 69,
  billHeightMaxMm: 74,
  billHalfWidthMinMm: 70,
  billHalfWidthMaxMm: 85,
  coinDiameterMaxMm: 27.5,
  coinThicknessMaxMm: 2.5,
  coinDiameterMinMm: 20,
  coinThicknessMinMm: 1.85,
  coinsPerColumn: 2,
  leatherMm: 1.0,
  bottomFoldSkiveMm: null,
  hingeSkiveMm: null,
  dividerMm: 0.6,
  liningMm: 0.6,
  liningBlankWidthMm: 24,
  liningBlankHeightMm: 22,
  liningTopAboveMagnetMm: 10,
  liningSeamFromEdgeMm: 4,
  liningSeamBelowTopMm: 3,
  liningSeamMagnetClearanceMm: 2,
  magnetDiameterMm: 8,
  magnetThicknessMm: 1.5,
  magnetRemanenceT: 1.45,
  plateThicknessMm: 0.5,
  kDesign: 1.0,
  kMax: 1.24,
  wedgeLiftNom: 0.5,
  wedgeLiftMax: 1.0,
  seamOffsetMm: 3,
  glueBeyondSeamMm: 1,
  stitchPitchMm: 4,
  cardPocketReserveMm: 0.8,
  coinColumnReserveMm: 1.0,
  billFloorMm: 2.0,
  billTopClearanceMm: 3.0,
  stripeClearanceMinMm: 7.9,
  stepMarginMm: 2.5,
  magnetFromTipMm: 7,
  tipSkiveMm: 2.5,
  tipClearanceMm: 0.3,
  plateMarginMm: 0.5,
  plateSideMarginMm: 3.0,
  plateBelowFloorMm: 2.0,
  cardPocketDepthMm: 36,
  hingeInnerRadiusMm: 1.0,
  bottomSpacerMm: 1.5,
  skiveBandMm: 8,
  hingeSkiveOverlapMm: 1.0,
  skiveTaperMm: 2.0,
  coinFloorBelowCardFloorMm: 3.0,
  d2BelowS1Mm: 4.0,
  d2SkiveWedgeMm: 3.0,
  d1BelowCeilingMm: 1.0,
  d2BelowCeilingMm: 0.5,
  billWindowWidthMm: 15,
  billWindowBottomMm: 25,
  billWindowTopMm: 70,
  fingerContactMm: 15,
  coinWindowWidthMm: 12,
  coinWindowAboveFloorMm: 5,
  tongueWidthMm: 20,
  tongueTipRadiusMm: 10,
  tongueReserveMm: 5,
  tongueJoinRadiusMm: 4,
  bandCornerRadiusMm: 4,
  bodyCornerRadiusMm: 0,
  frontTopCornerRadiusMm: 2,
  d1CornerRadiusMm: 3,
  lidGapAtFullMm: 0.5,
  s6ClearFromAxisMm: 12,
  lowestHoleMm: 5.5,
  roundStepMm: 0.5,
  bottomSpacerOverhangMm: 5,
  thumbContactMm: 12,
  thumbNotchWidthMm: 10,
  thumbNotchDepthMm: 12,
  thumbNotchCornerRadiusMm: 1,
  thumbNotchSideReserveMm: 1,
  billFloorToleranceMm: 1.0,
};

/** Kolik se odstřihne z hrany karet vložky dna, která jde do ohybu (Kolo 9, zaoblené rohy karet). */
export const LID_SPACER_EDGE_TRIM_MM = 4;

/** Záložní ztenčení ohybu dna / závěsu (záloha B), když neprojde V12 nebo závěs zkušebního kusu. */
export const LID_SKIVE_FALLBACK_MM = 0.6;
/** Záloha A: celý P1 z koupené usně 0,8 bez ztenčení. */
export const LID_P1_FALLBACK_MM = 0.8;

/** Tloušťka P1 v ohybu dna (bez ztenčení = tloušťka P1). */
export function bottomFoldThickness(spec: LidWalletSpec): number {
  return spec.bottomFoldSkiveMm ?? spec.leatherMm;
}

/** Tloušťka P1 v závěsu (bez ztenčení = tloušťka P1). */
export function hingeThickness(spec: LidWalletSpec): number {
  return spec.hingeSkiveMm ?? spec.leatherMm;
}

/**
 * Varianta střihu podle V12 a zkušebního kusu (oddíl 13, Kolo 8): jiná tloušťka P1 (záloha A 0,8),
 * nebo záložní ztenčení ohybu dna či závěsu (záloha B 0,6); od Kola 9 i změřená tloušťka přepážek
 * D1/D2 a podšívky L1. Ostatní vstupy zůstávají.
 */
export function lidWalletVariant(
  v: {
    p1Mm?: number;
    bottomFoldSkiveMm?: number | null;
    hingeSkiveMm?: number | null;
    dividerMm?: number;
    liningMm?: number;
  },
  base: LidWalletSpec = DEFAULT_LID_WALLET,
): LidWalletSpec {
  return {
    ...base,
    leatherMm: v.p1Mm ?? base.leatherMm,
    dividerMm: v.dividerMm ?? base.dividerMm,
    liningMm: v.liningMm ?? base.liningMm,
    bottomFoldSkiveMm:
      v.bottomFoldSkiveMm === undefined ? base.bottomFoldSkiveMm : v.bottomFoldSkiveMm,
    hingeSkiveMm: v.hingeSkiveMm === undefined ? base.hingeSkiveMm : v.hingeSkiveMm,
  };
}

/** Tiskový list A4 na výšku a jeho okraj (P1 je dlouhý 226 mm, proto menší okraj a hlavička). */
export const PRINT_SHEET = { widthMm: 210, heightMm: 297, marginMm: 8 } as const;
export const SHEET_HEADER_MM = 14;
export const SHEET_FOOTER_MM = 30;
export const CALIBRATION_MM = 50;

/** Obsah peněženky v jednom stavu (oddíl 7). */
export interface ContentState {
  id: 'A' | 'K1' | 'B' | 'Bbrief' | 'Bm' | 'C';
  label: string;
  cards: number;
  bills: number;
  /** Mince v levém / pravém sloupci. */
  coins: [number, number];
  /** Horní mince sloupce je pod závěsem (plný sloupec nebo mince posunutá ke stropu). */
  coinUnderHinge: boolean;
}

export const CONTENT_STATES: ContentState[] = [
  { id: 'A', label: 'A prázdná', cards: 0, bills: 0, coins: [0, 0], coinUnderHinge: false },
  { id: 'K1', label: '1 karta', cards: 1, bills: 0, coins: [0, 0], coinUnderHinge: false },
  {
    id: 'B',
    label: 'B 2 karty, 1 bankovka, 1 mince',
    cards: 2,
    bills: 1,
    coins: [1, 0],
    coinUnderHinge: false,
  },
  {
    id: 'Bm',
    label: 'B, mince posunutá ke stropu',
    cards: 2,
    bills: 1,
    coins: [1, 0],
    coinUnderHinge: true,
  },
  {
    id: 'Bbrief',
    label: 'B podle briefu (kap. 24): 4 karty, 2 bankovky, 3 mince',
    cards: 4,
    bills: 2,
    coins: [2, 1],
    coinUnderHinge: false,
  },
  {
    id: 'C',
    label: 'C 6 karet, 3 bankovky, 4 mince',
    cards: 6,
    bills: 3,
    coins: [2, 2],
    coinUnderHinge: true,
  },
];

/**
 * Stavy obsahu pro daný střih: plný stav C má vždy cardsMax karet (tabulka výše je pro výchozích 6),
 * jinak by návrh pro 5 karet počítal závěs a posun karet se 6 kartami.
 */
export function contentStatesFor(spec: LidWalletSpec): ContentState[] {
  return CONTENT_STATES.map((s) =>
    s.id === 'C' && s.cards !== spec.cardsMax
      ? { ...s, cards: spec.cardsMax, label: `C ${spec.cardsMax} karet, 3 bankovky, 4 mince` }
      : s,
  );
}

/** Stav magnetu, karet a víčka v jednom stavu obsahu. */
export interface StateResult {
  state: ContentState;
  /** Obsah pod závěsem T (mezi vnitřkem B a lícem přední karty / D1). */
  hingeContentMm: number;
  /** Délka závěsu po střednici, kterou obsah spotřebuje. */
  hingePathMm: number;
  /** Střed magnetu, špička, vršek magnetu, hrana pásu víčka – při k návrhovém a k max. */
  magnetY: number;
  magnetYkMax: number;
  tipY: number;
  tipYkMax: number;
  magnetTopY: number;
  magnetTopYkMax: number;
  bandEdgeY: number;
  bandEdgeYkMax: number;
  /** Magnet celý na plíšku (s rezervou) při k návrhovém / k max. */
  onPlate: boolean;
  onPlateKMax: boolean;
  /** Odstup vršku magnetu pod čarou dna karet. */
  stepMarginMm: number;
  stepMarginKMaxMm: number;
  /** Karty: spodní hrana (δ nom), horní hrana při δ nom a δ max, posun ke stropu. */
  cardBottomNomY: number | null;
  cardTopNomY: number | null;
  cardTopMaxY: number | null;
  cardShiftNomMm: number | null;
  /** Vyčnívání přední karty nad F (δ nom). */
  cardProtrusionMm: number | null;
  /** Nejnižší proužek (karta sedí přímo na čáře, δ = 0) a odstup od středu magnetu. */
  stripeClearanceMm: number | null;
  stripeClearanceKMaxMm: number | null;
  /** Odhad pole v nejbližším bodě proužku (dipól, ±30 %, bez stínění plíškem). */
  fieldMilliTesla: number | null;
  fieldKMaxMilliTesla: number | null;
  /** Největší tloušťka v tomto stavu a v které zóně. */
  thicknessMaxMm: number;
  thicknessZone: string;
}

export interface SeamRow {
  id: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';
  name: string;
  /**
   * Díl, na kterém se otvory značí na rozvinutém P1 (F / B), až po složení (body), nebo na
   * konci jazýčku podle šablony (tongue, S7 kolem L1; y = poloha ve stavu B).
   */
  where: 'F' | 'B' | 'body' | 'tongue';
  layers: string;
  thicknessMm: number;
  holes: { x: number; y: number }[];
}

/** Lepená plocha v souřadnicích peněženky (x, y) na stěně F nebo B pásu P1. */
export interface GlueArea {
  id: string;
  what: string;
  wall: 'F' | 'B';
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Slot {
  cx: number;
  y0: number;
  y1: number;
  width: number;
}

export interface LidWalletLayout {
  /** Obsah pod závěsem v B a v C (s mincí nahoře), ΔT. */
  contentCardsBillsCMm: number;
  hingeContentAMm: number;
  hingeContentBMm: number;
  hingeContentCMm: number;
  /** Šířky: obálka F–D2 (karty + D1 + bankovky) a kapsa karet mezi pásy G2b (jen karty). */
  cardPocketNeedMm: number;
  cardSlotNeedMm: number;
  pocketMm: number;
  widthMm: number;
  columnNeedMm: number;
  columnMm: number;
  centerBandMm: number;
  pocketX0: number;
  pocketX1: number;
  columnLeft: [number, number];
  columnRight: [number, number];
  centerBand: [number, number];
  axisX: number;
  seamSideX: [number, number];
  seamColumnX: [number, number];
  cardPocketX: [number, number];
  /** Výšky. */
  flatFromY: number;
  cardFloorY: number;
  s6Y: number;
  ceilingY: number;
  hingeStartY: number;
  heightMm: number;
  frontTopY: number;
  coinFloorY: number;
  s1Y: number;
  d2BottomY: number;
  d2TopY: number;
  d1TopY: number;
  d1BottomY: number;
  /** Magnet: poloha ve stavu B (lepí se na hotovém kusu), vzdálenost hrany pásu. */
  magnetYB: number;
  magnetYBMin: number;
  magnetYBMax: number;
  /** V okně ⟨min; max⟩ leží aspoň jeden bod mřížky 0,05 (jinak je okno lepení nepoužitelně úzké). */
  magnetYBOnGrid: boolean;
  bandFromMagnetMm: number;
  plate: { x0: number; x1: number; y0: number; y1: number };
  magnetX: [number, number];
  tongueX: [number, number];
  /** Tloušťka ohybu dna a závěsu (bez ztenčení = P1), poloměr střednice závěsu r_m. */
  bottomFoldMm: number;
  hingeMm: number;
  hingeMidRadiusMm: number;
  /** Mezera magnet – plíšek (L1 + F). */
  magnetPlateGapMm: number;
  /**
   * L1 a šev S7 kolem ní v souřadnicích konce jazýčku: u = od osy jazýčku, h = nad špičkou.
   * Otvory jdou po U kolem magnetu (levý bok zdola, horní řada, pravý bok shora), ke špičce je
   * šev otevřený – mezi magnetem a špičkou (3 mm) se steh nevejde.
   */
  lining: {
    topAboveTipMm: number;
    bottomAboveTipMm: number;
    seamHoles: { u: number; h: number }[];
    /** Nejmenší odstup otvoru S7 od kraje magnetu a od hrany jazýčku. */
    seamToMagnetMm: number;
    seamToEdgeMm: number;
  };
  /** Rozvinutý P1 (v). */
  v: {
    frontEnd: number;
    foldArc: number;
    foldAxis: number;
    backStart: number;
    /**
     * Hrana vložky dna na rubu B (Kolo 9): vložka leží na rubu B, F se přes ni přehne a oblouk
     * ohybu začíná právě u její hrany, takže hrana leží o půl oblouku za osou ohybu (rýhou) směrem
     * k B: v = osa + oblouk/2 (= začátek rovné B). Ověřit na odřezku V12.
     */
    insertEdge: number;
    hingeStart: number;
    hingeLenB: number;
    hingeEnd: number;
    rearCrease: number;
    frontCrease: number;
    bandEnd: number;
    tip: number;
    cutEnd: number;
    foldBand: [number, number];
    hingeBand: [number, number];
  };
  /** Délky úseků (state B) pro kontrolu součtu. */
  bandLenB: number;
  tongueLenB: number;
  p1LengthMm: number;
  /** Poloha, kde začíná pás ztenčení závěsu na B (y). */
  hingeBandStartY: number;
  /** Okénka. */
  coinWindows: [Slot, Slot];
  billWindow: Slot;
  /** Švy a lepení. */
  seams: SeamRow[];
  holesTotal: number;
  stitchesTotal: number;
  glue: GlueArea[];
  topGlueY: number;
  /** Díly D1, D2 (v souřadnicích peněženky) a jejich přířezy. */
  d1: { x0: number; x1: number; y0: number; y1: number };
  d2: { x0: number; x1: number; y0: number; y1: number };
  /** Bankovky: boční vůle, vůle pod stropem, vyčnívání po posunu okénkem (min / max výška). */
  billSidePlayMm: [number, number];
  billTopClearanceMm: number;
  billPushMm: number;
  billProtrusionMm: [number, number];
  billWindowCoverX: [number, number];
  /** Mince: délka sloupce (horší δ), vůle, vyčnívání horní mince po posunu palcem, jízda samotné. */
  columnLengthMm: number;
  columnPlayMm: number;
  coinProtrusionMm: number;
  singleCoinTravelMm: [number, number];
  /**
   * Výřez pro palec v horní hraně F (U: dno půlkruh výsečníkem, boky nožem, rohy ústí vypouklé).
   * bottomY = nejnižší bod, centerY = střed výsečníku; exposedCardMm = kolik přední karty je na ose
   * vidět nad dnem výřezu (min / max přes stavy); tipNarrowerMm = délka konce jazýčku (od špičky),
   * která je užší než výřez a může do něj při zavírání klesnout; tipNarrowerShiftedMm = totéž pro
   * jazýček posunutý bočně o toleranci magnetu (nad výřezem pak visí jen jedna strana konce);
   * cornerToTongueMm = odstup rohů ústí od boků jazýčku (bez posunu).
   */
  thumbNotch: {
    cx: number;
    x0: number;
    x1: number;
    radius: number;
    depthMm: number;
    bottomY: number;
    centerY: number;
    topY: number;
    cornerRadiusMm: number;
    exposedCardMm: [number, number];
    tipNarrowerMm: number;
    tipNarrowerShiftedMm: number;
    cornerToTongueMm: number;
  };
  /**
   * Riziko R4 – karta omylem v oddílu bankovek (stojí na dně bankovek). Proužkem dolů leží přímo
   * za magnetem (jen z odstup ve tloušťce); proužkem nahoru je nejbližší hrana proužku nad
   * nejvyšší polohou magnetu (stav C + tahle karta navíc pod závěsem, k max); pole proužkem nahoru
   * počítá Δz bez plíšku (plíšek končí pod proužkem). lowFloor = dno bankovek o toleranci níž.
   */
  misplacedCard: {
    dzMm: number;
    stripeDownY: [number, number];
    magnetSpanY: [number, number];
    stripeDownOverlapsMagnet: boolean;
    stripeUpY: number;
    /** Nejvyšší střed magnetu se zbloudilou kartou navíc (C + 1 karta, k max). */
    magnetHighWithCardY: number;
    stripeUpDzMm: number;
    stripeUpClearanceMm: number;
    stripeUpClearanceLowFloorMm: number;
    stripeUpFieldMilliTesla: number;
    /** Správně vložená karta proužkem nahoru (kapsa karet, δ = 0, k max). */
    cardPocketStripeUpClearanceMm: number;
  };
  /** Vějíř karet v kapse F–D1 (celá karta / jen část v kapse, hloubka kapsy). */
  fanDeg: [number, number];
  /** Stavy obsahu. */
  states: StateResult[];
  thicknessMaxMm: number;
  maxLayersInSeam: number;
  maxSeamThicknessMm: number;
  /**
   * Vložka ohybu dna (oddíl 5.8, list 4) – jediný přípravek od Kola 9 (závěs se tvaruje přes obsah
   * stavu B, bez kopyta a opěrky).
   */
  bottomSpacer: {
    widthMm: number;
    depthMm: number;
    /**
     * Vložka ze starých karet (výchozí od Kola 9): tolik vrstev karet na sebe, aby tloušťka byla
     * co nejblíž vložce, a tolik karet vedle sebe (na délku), aby pokryly šířku vložky.
     */
    fromCards: {
      layers: number;
      cardsPerLayer: number;
      cards: number;
      thicknessMm: number;
      lengthMm: number;
      heightMm: number;
      /**
       * O kolik se u každé karty odstřihne hrana, která jde do ohybu (zaoblené rohy karet u spoje
       * nesmí zůstat; poloměr rohu nemáme změřený, ověřit pohledem po střihu).
       */
      edgeTrimMm: number;
      /** Přebytek délky v jedné vrstvě (2 karty vedle sebe − šířka vložky), ustřihne se z jednoho konce. */
      excessMm: number;
    };
  };
}

const PI = Math.PI;
const MU0 = 4 * PI * 1e-7;

export function roundTo(v: number, step: number): number {
  return Math.round(v / step + 1e-9) * step;
}
export function roundUpTo(v: number, step: number): number {
  return Math.ceil(v / step - 1e-9) * step;
}
export function roundDownTo(v: number, step: number): number {
  return Math.floor(v / step + 1e-9) * step;
}

/** Tloušťka bankovek napůl: 2 listy × n + rezerva přehybu (0 bez bankovek). */
export function billsThickness(spec: LidWalletSpec, n: number): number {
  return n > 0 ? 2 * spec.billSheetMm * n + spec.billFoldReserveMm : 0;
}

/** Obsah pod závěsem T = 2 t_D + n_k t_k + t_bn + t_c (horní mince pod závěsem). */
export function hingeContent(spec: LidWalletSpec, s: ContentState): number {
  return (
    2 * spec.dividerMm +
    s.cards * spec.cardThicknessMm +
    billsThickness(spec, s.bills) +
    (s.coinUnderHinge ? spec.coinThicknessMaxMm : 0)
  );
}

/**
 * Délka plochého závěsu po střednici, kterou spotřebuje obsah T: dva čtvrtoblouky poloměru
 * r_m = r_i + t_h/2 a plochý vrch (T + t_h − 2 r_m). Když je obsah tenčí než 2 r_m − t_h (= 2 r_i),
 * vrch se zúží na půlkruh poloměru (T + t_h)/2. t_h = tloušťka závěsu (bez ztenčení = P1).
 */
export function hingePath(spec: LidWalletSpec, T: number): number {
  const th = hingeThickness(spec);
  const rm = spec.hingeInnerRadiusMm + th / 2;
  const span = T + th;
  return span >= 2 * rm ? span + (PI - 2) * rm : (PI * span) / 2;
}

/** Poloviční šířka jazýčku ve výšce h nad špičkou (konec R_t, rovné boky nad ním). */
function tongueHalfWidthAt(spec: LidWalletSpec, h: number): number {
  const rt = spec.tongueTipRadiusMm;
  const flat = spec.tongueWidthMm / 2 - rt;
  if (h >= rt) return spec.tongueWidthMm / 2;
  if (h <= 0) return flat;
  return flat + Math.sqrt(rt * rt - (rt - h) ** 2);
}

/** Délka konce jazýčku (R špičky rt, od špičky), kde je jazýček užší než 2 · half. */
function tipNarrower(rt: number, half: number): number {
  return half >= rt ? rt : rt - Math.sqrt(rt * rt - half * half);
}

/** Pole osově magnetovaného válečku jako dipólu v bodě (dy vedle, dz v ose), v mT. */
export function dipoleFieldMilliTesla(spec: LidWalletSpec, dy: number, dz: number): number {
  const r = Math.hypot(dy, dz) * 1e-3;
  const vol = PI * (spec.magnetDiameterMm / 2) ** 2 * spec.magnetThicknessMm * 1e-9;
  const m = (spec.magnetRemanenceT * vol) / MU0;
  const cos = dz / Math.hypot(dy, dz);
  return ((1e-7 * m) / r ** 3) * Math.sqrt(1 + 3 * cos * cos) * 1000;
}

/** Úhel vějíře: 85,6 cos θ + h sin θ = š kapsy (nejmenší θ > 0), ve stupních. */
function fanAngle(w: number, h: number, pocket: number): number {
  // w cos θ + h sin θ = R cos(θ − φ), R = √(w² + h²), φ = atan(h / w)
  const R = Math.hypot(w, h);
  const phi = Math.atan2(h, w);
  if (pocket >= R) return 90;
  // Při θ = 0 je šířka w < š kapsy a do θ = φ roste: první průsečík je θ = φ − acos(š / R).
  return ((phi - Math.acos(pocket / R)) * 180) / PI;
}

export function lidWalletLayout(spec: LidWalletSpec = DEFAULT_LID_WALLET): LidWalletLayout {
  const step = spec.roundStepMm;
  const e = spec.seamOffsetMm;
  const g = spec.glueBeyondSeamMm;
  const tP = spec.leatherMm;
  const tD = spec.dividerMm;
  const tk = spec.cardThicknessMm;
  const rMag = spec.magnetDiameterMm / 2;

  /* Šířky (oddíl 5.1). Obálka F–D2 obsahuje karty + D1 + bankovky, obálka F–D1 jen karty. */
  const billsC = billsThickness(spec, spec.billsC);
  const contentCardsBillsCMm = spec.cardsMax * tk + tD + billsC;
  const cardPocketNeedMm = spec.cardWidthMm + contentCardsBillsCMm + spec.cardPocketReserveMm;
  // Kapsa karet mezi pásy G2b (boky D1 přilepené k F, každý široký g) musí pojmout jen karty:
  // 85,6 + n · 0,76 + 0,8. Kapsa F–D2 je o 2g širší, takže šířka je větší z obou podmínek
  // (dřív se brala jen obálka F–D2 a pro 5 karet vyšla kapsa karet o 0,2 mm úzká).
  const cardSlotNeedMm = spec.cardWidthMm + spec.cardsMax * tk + spec.cardPocketReserveMm;
  const pocketMm = Math.max(
    roundUpTo(cardPocketNeedMm, step),
    roundUpTo(cardSlotNeedMm, step) + 2 * g,
  );
  const widthMm = pocketMm + 2 * (e + g);
  const axisX = widthMm / 2;
  const pocketX0 = e + g;
  const pocketX1 = widthMm - e - g;
  const columnNeedMm = spec.coinDiameterMaxMm + spec.coinThicknessMaxMm + spec.coinColumnReserveMm;
  const columnMm = roundUpTo(columnNeedMm, step);
  const centerBandMm = pocketMm - 2 * columnMm;
  const columnLeft: [number, number] = [pocketX0, pocketX0 + columnMm];
  const columnRight: [number, number] = [pocketX1 - columnMm, pocketX1];
  const centerBand: [number, number] = [columnLeft[1], columnRight[0]];
  const seamColumnX: [number, number] = [columnLeft[1] + g, columnRight[0] - g];
  // D1 je u boků přilepená k F v pásu široké g, kapsa karet je mezi těmi pásy.
  const cardPocketX: [number, number] = [pocketX0 + g, pocketX1 - g];

  /* Stavy obsahu pod závěsem. */
  const contentStates = contentStatesFor(spec);
  const T = (id: ContentState['id']): number =>
    hingeContent(
      spec,
      contentStates.find((s) => s.id === id)!,
    );
  const TA = T('A');
  const TB = T('B');
  const TC = T('C');
  const PA = hingePath(spec, TA);
  const PB = hingePath(spec, TB);
  const PC = hingePath(spec, TC);

  /* Výšky (oddíl 5.1, 4.1–4.3). Ohyb dna a závěs mají od Kola 6 tloušťku P1 (bez ztenčení). */
  const tFold = bottomFoldThickness(spec);
  const tHinge = hingeThickness(spec);
  const flatFromY = spec.bottomSpacerMm / 2 + tFold;
  const d = spec.magnetFromTipMm;
  // Poloha magnetu ve stavu B: nejníž tak, aby špička ve stavu A ležela na rovné části F;
  // nejvýš tak, aby vršek magnetu ve stavu C zůstal o stepMargin pod čarou dna karet.
  const magnetYBMin = flatFromY + spec.tipClearanceMm + d + spec.kDesign * (PB - PA);
  // Dno karet musí splnit dvě podmínky zároveň: (a) vršek magnetu ve stavu C je při k návrhovém
  // stepMargin pod dnem karet, (b) plíšek (plateBelowFloor pod dnem karet, rezerva plateMargin
  // nahoře) obalí vršek magnetu ve stavu C i při horším k max (SF1 z nezávislého ověření).
  const cardFloorYStep = magnetYBMin + spec.kDesign * (PC - PB) + rMag + spec.stepMarginMm;
  const cardFloorYPlate =
    magnetYBMin + spec.plateBelowFloorMm + spec.plateMarginMm + rMag + spec.kMax * (PC - PB);
  const magnetMaxFor = (cf: number): number =>
    Math.min(
      cf - spec.stepMarginMm - rMag - spec.kDesign * (PC - PB),
      cf - spec.plateBelowFloorMm - spec.plateMarginMm - rMag - spec.kMax * (PC - PB),
    );
  // Okno lepení magnetu ⟨min; max⟩ musí obsahovat bod mřížky 0,05. Když ho po zaokrouhlení dna
  // karet nahoru neobsahuje (např. přepážky 0,69–0,71, Kolo 9), zvedne se dno karet o jeden krok.
  const cardFloorRaw = roundUpTo(Math.max(cardFloorYStep, cardFloorYPlate), step);
  const cardFloorY =
    roundUpTo(magnetYBMin, 0.05) <= roundDownTo(magnetMaxFor(cardFloorRaw), 0.05) + 1e-9
      ? cardFloorRaw
      : cardFloorRaw + step;
  const magnetYBMax = magnetMaxFor(cardFloorY);
  // Poloha lepení: střed okna na 0,1; když tam neleží, nejbližší bod mřížky 0,05 uvnitř okna.
  // Zaokrouhluje se až uvnitř ⟨min; max⟩, aby hodnota nepřelezla mez (dřív round() po ořezu
  // na max dal pro 5 karet a P1 0,8 hodnotu 11,577 > 11,5766 a kontrola plíšku padala).
  const magnetYBMid = roundTo((magnetYBMin + magnetYBMax) / 2, 0.1);
  const magnetYBGrid: [number, number] = [
    roundUpTo(magnetYBMin, 0.05),
    roundDownTo(magnetYBMax, 0.05),
  ];
  const magnetYBOnGrid = magnetYBGrid[0] <= magnetYBGrid[1] + 1e-9;
  const magnetYB = round(
    magnetYBMid >= magnetYBMin - 1e-9 && magnetYBMid <= magnetYBMax + 1e-9
      ? magnetYBMid
      : magnetYBOnGrid
        ? Math.min(Math.max(roundTo(magnetYBMid, 0.05), magnetYBGrid[0]), magnetYBGrid[1])
        : Math.floor(Math.max(magnetYBMin, Math.min(magnetYBMid, magnetYBMax)) * 1000) / 1000,
  );
  const s6Y = cardFloorY - g;
  const liftC = spec.wedgeLiftNom * spec.cardsMax * tk;
  const ceilingY = roundUpTo(
    Math.max(
      spec.billFloorMm + spec.billHeightMaxMm + spec.billTopClearanceMm,
      cardFloorY + liftC + spec.cardHeightMm,
    ),
    step,
  );
  const hingeStartY = ceilingY - spec.hingeInnerRadiusMm;
  const heightMm = ceilingY + tHinge;
  const frontTopY = cardFloorY + spec.cardPocketDepthMm;
  const coinFloorY = cardFloorY - spec.coinFloorBelowCardFloorMm;
  const s1Y = coinFloorY - g;
  const d2BottomY = s1Y - spec.d2BelowS1Mm;
  const d2TopY = ceilingY - spec.d2BelowCeilingMm;
  const d1TopY = ceilingY - spec.d1BelowCeilingMm;
  const d1BottomY = spec.billFloorMm;

  /* Magnet na jazýčku a plíšek. */
  const magnetAt = (P: number, k: number): number => magnetYB + k * (P - PB);
  const yMC = magnetAt(PC, spec.kDesign);
  // Spodní hrana plíšku: nejnižší magnet ve stavu A přes k 1,0 … k max **a přes celé okno lepení**
  // (od y_m,B,min), s rezervou plateMargin i dole. Dřív se brala jen poloha ve stavu A při k 1,0
  // a výchozí y_m,B, takže při k max zbývalo dole 0,08 mm a magnet nalepený u spodní meze okna
  // z plíšku sjel (audit Kola 7).
  const yLowest = Math.min(
    ...[spec.kDesign, spec.kMax].flatMap((k) => [magnetAt(PA, k), magnetYBMin + k * (PA - PB)]),
  );
  const plate = {
    x0: axisX - (rMag + spec.plateSideMarginMm),
    x1: axisX + (rMag + spec.plateSideMarginMm),
    y0: roundDownTo(yLowest - rMag - spec.plateMarginMm, step),
    y1: cardFloorY - spec.plateBelowFloorMm,
  };
  const bandFromMagnetMm = frontTopY + spec.lidGapAtFullMm - yMC;
  const tongueX: [number, number] = [
    axisX - spec.tongueWidthMm / 2,
    axisX + spec.tongueWidthMm / 2,
  ];
  const magnetX: [number, number] = [axisX - rMag, axisX + rMag];

  /* Rozvinutý P1 (oddíl 5.3). */
  const foldArc = PI * (spec.bottomSpacerMm / 2 + tFold / 2);
  const frontEnd = frontTopY - flatFromY;
  const backStart = frontEnd + foldArc;
  const hingeStart = backStart + (hingeStartY - flatFromY);
  const hingeLenB = PB;
  const hingeEnd = hingeStart + hingeLenB;
  const rm = spec.hingeInnerRadiusMm + tHinge / 2;
  const bandEdgeB = magnetYB + bandFromMagnetMm;
  const bandLenB = hingeStartY - bandEdgeB;
  const bandEnd = hingeEnd + bandLenB;
  const tipB = magnetYB - d;
  const tongueLenB = bandEdgeB - tipB;
  const tip = bandEnd + tongueLenB;
  const cutEnd = tip + spec.tongueReserveMm;
  const hb = spec.skiveBandMm / 2;
  const hingeMid = (hingeStart + hingeEnd) / 2;
  // Pás závěsu: 8 mm kolem závěsu ve stavu B. Když se závěs ztenčuje (záloha B, --skive-hinge),
  // musí plné ztenčení pokrýt oba přehyby ve všech stavech i při k max. Pás je proto zóna plného
  // ztenčení hingeStart − 1 … konec závěsu ve stavu C při k max + 1; náběhy skiveTaperMm leží vně
  // pásu (Kolo 8; dřív byly náběhy uvnitř a přední přehyb padl na konec plné zóny). Spodní kraj
  // se nezužuje, lepení G3 a otvory S4/S5 se nemění.
  const hingeBandPlain: [number, number] = [hingeMid - hb, hingeMid + hb];
  const hingeLenCkMax = PB + spec.kMax * (PC - PB);
  const hingeBand: [number, number] =
    spec.hingeSkiveMm === null
      ? hingeBandPlain
      : [
          Math.min(hingeBandPlain[0], hingeStart - spec.hingeSkiveOverlapMm),
          Math.max(hingeBandPlain[1], hingeStart + hingeLenCkMax + spec.hingeSkiveOverlapMm),
        ];
  const v = {
    frontEnd,
    foldArc,
    foldAxis: frontEnd + foldArc / 2,
    backStart,
    insertEdge: frontEnd + foldArc / 2 + foldArc / 2,
    hingeStart,
    hingeLenB,
    hingeEnd,
    rearCrease: hingeStart + (PI / 4) * rm,
    frontCrease: hingeEnd - (PI / 4) * rm,
    bandEnd,
    tip,
    cutEnd,
    foldBand: [frontEnd + foldArc / 2 - hb, frontEnd + foldArc / 2 + hb] as [number, number],
    hingeBand,
  };
  const hingeBandStartY = hingeStartY - (hingeStart - v.hingeBand[0]);

  /* Švy (oddíl 5.6). Boční řada: F top leží přesně mezi dvěma otvory. */
  const p = spec.stitchPitchMm;
  const lastHoleMax = hingeBandStartY - 3;
  const sideHoles: number[] = [];
  {
    let y = frontTopY - p / 2;
    while (y - p >= spec.lowestHoleMm - 1e-9) y -= p;
    for (; y <= lastHoleMax + 1e-9; y += p) sideHoles.push(round(y));
  }
  const xGrid = (lo: number, hi: number, skip = 0): number[] => {
    const xs: number[] = [];
    for (let j = -Math.floor(axisX / p) - 1; j <= Math.floor(axisX / p) + 1; j++) {
      const x = axisX + p * j;
      if (x >= lo - 1e-9 && x <= hi + 1e-9 && Math.abs(x - axisX) >= skip - 1e-9) xs.push(round(x));
    }
    return xs;
  };
  const s1Xs = xGrid(e + 6.5, widthMm - e - 6.5);
  const s6Xs = xGrid(e + 6.5, widthMm - e - 6.5, spec.s6ClearFromAxisMm);
  const colHoles = sideHoles.filter((y) => y >= s1Y + p - 1e-9);
  const lay = (y: number): { layers: string; t: number } =>
    y < d2BottomY
      ? { layers: 'F + B', t: 2 * tP }
      : y < frontTopY
        ? { layers: 'F + D2 + B', t: 2 * tP + tD }
        : { layers: 'D2 + B', t: tP + tD };
  const sideMax = Math.max(...sideHoles.map((y) => lay(y).t));
  // S7 kolem L1 (Kolo 6): U kolem magnetu – horní řada pod horní hranou L1, boky dolů po rozteči,
  // dokud je otvor ≥ e od hrany jazýčku (na oblouku R_t) a ≥ vůle od kraje magnetu.
  const liningTop = d + spec.liningTopAboveMagnetMm;
  const s7Half =
    Math.floor((2 * (spec.tongueWidthMm / 2 - spec.liningSeamFromEdgeMm)) / p) * (p / 2);
  const s7TopH = liningTop - spec.liningSeamBelowTopMm;
  const toMagnet = (u: number, h: number): number => Math.hypot(u, h - d) - rMag;
  const toEdge = (u: number, h: number): number => tongueHalfWidthAt(spec, h) - Math.abs(u);
  const s7Side: number[] = [];
  for (let h = s7TopH - p; h > spec.tipSkiveMm - 1e-9; h -= p) {
    if (toEdge(s7Half, h) < e - 1e-9) break;
    if (toMagnet(s7Half, h) < spec.liningSeamMagnetClearanceMm - 1e-9) break;
    s7Side.push(round(h));
  }
  const s7Top: number[] = [];
  for (let u = -s7Half; u <= s7Half + 1e-9; u += p) s7Top.push(round(u));
  const s7Holes: { u: number; h: number }[] = [
    ...[...s7Side].reverse().map((h) => ({ u: -s7Half, h })),
    ...s7Top.map((u) => ({ u, h: round(s7TopH) })),
    ...s7Side.map((h) => ({ u: s7Half, h })),
  ];
  const lining = {
    topAboveTipMm: round(liningTop),
    bottomAboveTipMm: round(liningTop - spec.liningBlankHeightMm),
    seamHoles: s7Holes,
    seamToMagnetMm: round(Math.min(...s7Holes.map((q) => toMagnet(q.u, q.h)))),
    seamToEdgeMm: round(Math.min(...s7Holes.map((q) => toEdge(q.u, q.h)))),
  };
  const seams: SeamRow[] = [
    {
      id: 'S1',
      name: 'dno mincí',
      where: 'B',
      layers: 'D2 + B',
      thicknessMm: tP + tD,
      holes: s1Xs.map((x) => ({ x, y: s1Y })),
    },
    {
      id: 'S2',
      name: 'sloupec L',
      where: 'B',
      layers: 'D2 + B',
      thicknessMm: tP + tD,
      holes: colHoles.map((y) => ({ x: seamColumnX[0], y })),
    },
    {
      id: 'S3',
      name: 'sloupec P',
      where: 'B',
      layers: 'D2 + B',
      thicknessMm: tP + tD,
      holes: colHoles.map((y) => ({ x: seamColumnX[1], y })),
    },
    {
      id: 'S4',
      name: 'bok L',
      where: 'body',
      layers: 'F + B / F + D2 + B / D2 + B',
      thicknessMm: sideMax,
      holes: sideHoles.map((y) => ({ x: e, y })),
    },
    {
      id: 'S5',
      name: 'bok P',
      where: 'body',
      layers: 'F + B / F + D2 + B / D2 + B',
      thicknessMm: sideMax,
      holes: sideHoles.map((y) => ({ x: widthMm - e, y })),
    },
    {
      id: 'S6',
      name: 'dno karet',
      where: 'F',
      layers: 'F + D1',
      thicknessMm: tP + tD,
      holes: s6Xs.map((x) => ({ x, y: s6Y })),
    },
    {
      id: 'S7',
      name: 'obšití L1',
      where: 'tongue',
      layers: 'jazýček + L1',
      thicknessMm: tP + spec.liningMm,
      holes: s7Holes.map((q) => ({ x: round(axisX + q.u), y: round(tipB + q.h) })),
    },
  ];
  const holesTotal = seams.reduce((s, q) => s + q.holes.length, 0);
  // S6 má dvě části (vlevo a vpravo), každá má svůj konec.
  const stitchesTotal = holesTotal - seams.length - 1;

  /* Lepení (oddíl 5.7). Lepení G3b/G3c končí těsně pod pásem ztenčení závěsu, ne až v přehybu
     (nález K1: přesah lepidla přes začátek ztenčení, SF/nit8 z nezávislého ověření). */
  const topGlueY = hingeBandStartY;
  const glueRaw: GlueArea[] = [
    { id: 'G1', what: 'plíšek K2 → rub F', wall: 'F', ...plate },
    {
      id: 'G2',
      what: 'D1 (rub) → rub F, dno karet',
      wall: 'F',
      x0: pocketX0,
      x1: pocketX1,
      y0: d1BottomY,
      y1: cardFloorY,
    },
    {
      id: 'G2b',
      what: 'boky D1 → rub F',
      wall: 'F',
      x0: pocketX0,
      x1: pocketX0 + g,
      y0: cardFloorY,
      y1: frontTopY - 1,
    },
    {
      id: 'G2b',
      what: 'boky D1 → rub F',
      wall: 'F',
      x0: pocketX1 - g,
      x1: pocketX1,
      y0: cardFloorY,
      y1: frontTopY - 1,
    },
    {
      id: 'G3a',
      what: 'D2 (rub) → rub B, dno mincí',
      wall: 'B',
      x0: 0,
      x1: widthMm,
      y0: d2BottomY,
      y1: coinFloorY,
    },
    {
      id: 'G3b',
      what: 'D2 → B, bok L',
      wall: 'B',
      x0: 0,
      x1: pocketX0,
      y0: coinFloorY,
      y1: topGlueY,
    },
    {
      id: 'G3b',
      what: 'D2 → B, bok P',
      wall: 'B',
      x0: pocketX1,
      x1: widthMm,
      y0: coinFloorY,
      y1: topGlueY,
    },
    {
      id: 'G3c',
      what: 'D2 → B, střed',
      wall: 'B',
      x0: centerBand[0],
      x1: centerBand[1],
      y0: coinFloorY,
      y1: topGlueY,
    },
    {
      id: 'G4',
      what: 'rub F ↔ líc D2, bok L',
      wall: 'F',
      x0: 0,
      x1: pocketX0,
      y0: d2BottomY,
      y1: frontTopY,
    },
    {
      id: 'G4',
      what: 'rub F ↔ líc D2, bok P',
      wall: 'F',
      x0: pocketX1,
      x1: widthMm,
      y0: d2BottomY,
      y1: frontTopY,
    },
    {
      id: 'G4',
      what: 'rub F ↔ rub B, bok L',
      wall: 'F',
      x0: 0,
      x1: pocketX0,
      y0: flatFromY,
      y1: d2BottomY,
    },
    {
      id: 'G4',
      what: 'rub F ↔ rub B, bok P',
      wall: 'F',
      x0: pocketX1,
      x1: widthMm,
      y0: flatFromY,
      y1: d2BottomY,
    },
    {
      id: 'G4',
      what: 'rub B ↔ rub F, bok L',
      wall: 'B',
      x0: 0,
      x1: pocketX0,
      y0: flatFromY,
      y1: d2BottomY,
    },
    {
      id: 'G4',
      what: 'rub B ↔ rub F, bok P',
      wall: 'B',
      x0: pocketX1,
      x1: widthMm,
      y0: flatFromY,
      y1: d2BottomY,
    },
  ];
  const glue = glueRaw.map((q) => ({
    ...q,
    x0: round(q.x0),
    x1: round(q.x1),
    y0: round(q.y0),
    y1: round(q.y1),
  }));

  /* Okénka (oddíl 4.4, 4.5). */
  const coinWindowY0 = coinFloorY + spec.coinWindowAboveFloorMm;
  const coinWindowY1 = colHoles[colHoles.length - 1]!;
  const coinWindows: [Slot, Slot] = [
    {
      cx: (columnLeft[0] + columnLeft[1]) / 2,
      y0: coinWindowY0,
      y1: coinWindowY1,
      width: spec.coinWindowWidthMm,
    },
    {
      cx: (columnRight[0] + columnRight[1]) / 2,
      y0: coinWindowY0,
      y1: coinWindowY1,
      width: spec.coinWindowWidthMm,
    },
  ];
  const billWindow: Slot = {
    cx: axisX,
    // Dolní hrana nesmí ke švu S1 blíž než 3 mm (kontrola níže); když dno karet vzroste (SF1,
    // fallback magnetu), okénko se návrhové hodnotě nevzdálí, jen se posune nahoru s S1.
    y0: Math.max(spec.billWindowBottomMm, s1Y + 3),
    y1: spec.billWindowTopMm,
    width: spec.billWindowWidthMm,
  };

  /* Bankovky. */
  const billPushMm = billWindow.y1 - billWindow.y0 - spec.fingerContactMm;
  const mouthY = Math.max(d1TopY, d2TopY);
  const billProtrusionMm: [number, number] = [
    spec.billFloorMm + spec.billHeightMinMm + billPushMm - mouthY,
    spec.billFloorMm + spec.billHeightMaxMm + billPushMm - mouthY,
  ];
  const billWindowCoverX: [number, number] = [
    pocketX1 - spec.billHalfWidthMinMm,
    pocketX0 + spec.billHalfWidthMinMm,
  ];

  /* Mince. */
  const coinLiftMax = spec.wedgeLiftMax * spec.coinThicknessMaxMm;
  const coinLiftNom = spec.wedgeLiftNom * spec.coinThicknessMaxMm;
  const columnLengthMm = ceilingY - (coinFloorY + coinLiftMax);
  const columnPlayMm = columnLengthMm - spec.coinsPerColumn * spec.coinDiameterMaxMm;
  // Horní mince (sloupec plný, δ nom): bříško palce se dotýká na ~12 mm, posune ji k hornímu konci okénka.
  const topCoinBottom = coinFloorY + coinLiftNom + spec.coinDiameterMaxMm;
  const thumb = spec.thumbContactMm;
  const coinPush = coinWindowY1 - (topCoinBottom + thumb);
  const coinProtrusionMm = topCoinBottom + spec.coinDiameterMaxMm + Math.max(0, coinPush) - d2TopY;
  const singleCoinTravelMm: [number, number] = [
    ceilingY - (coinFloorY + coinLiftNom) - spec.coinDiameterMaxMm,
    ceilingY - (coinFloorY + spec.wedgeLiftNom * spec.coinThicknessMinMm) - spec.coinDiameterMinMm,
  ];

  /* Stavy. */
  const stripeDz = spec.magnetThicknessMm / 2 + spec.liningMm + tP;
  const states: StateResult[] = contentStates.map((s) => {
    const Tn = hingeContent(spec, s);
    const P = hingePath(spec, Tn);
    const yM = magnetAt(P, spec.kDesign);
    const yMk = magnetAt(P, spec.kMax);
    const on = (y: number): boolean =>
      y - rMag >= plate.y0 + spec.plateMarginMm - 1e-9 &&
      y + rMag <= plate.y1 - spec.plateMarginMm + 1e-9;
    const hasCards = s.cards > 0;
    const lift = spec.wedgeLiftNom * s.cards * tk;
    const liftMax = spec.wedgeLiftMax * s.cards * tk;
    const cardBottomNomY = hasCards ? cardFloorY + lift : null;
    const stripe = cardFloorY + spec.stripeNearMm;
    const nCoins = Math.max(s.coins[0], s.coins[1]);
    const coinBottom = s.coinUnderHinge
      ? ceilingY - nCoins * spec.coinDiameterMaxMm
      : coinFloorY + coinLiftNom;
    const th = thicknessFor(spec, s, {
      frontTopY,
      d2BottomY,
      coinSpan: nCoins > 0 ? [coinBottom, coinBottom + nCoins * spec.coinDiameterMaxMm] : null,
      magnetY: yM,
      bandEdgeY: yM + bandFromMagnetMm,
    });
    return {
      state: s,
      hingeContentMm: round(Tn),
      hingePathMm: round(P),
      magnetY: round(yM),
      magnetYkMax: round(yMk),
      tipY: round(yM - d),
      tipYkMax: round(yMk - d),
      magnetTopY: round(yM + rMag),
      magnetTopYkMax: round(yMk + rMag),
      bandEdgeY: round(yM + bandFromMagnetMm),
      bandEdgeYkMax: round(yMk + bandFromMagnetMm),
      onPlate: on(yM),
      onPlateKMax: on(yMk),
      stepMarginMm: round(cardFloorY - yM - rMag),
      stepMarginKMaxMm: round(cardFloorY - yMk - rMag),
      cardBottomNomY: cardBottomNomY === null ? null : round(cardBottomNomY),
      cardTopNomY: hasCards ? round(cardFloorY + lift + spec.cardHeightMm) : null,
      cardTopMaxY: hasCards ? round(cardFloorY + liftMax + spec.cardHeightMm) : null,
      cardShiftNomMm: hasCards ? round(ceilingY - (cardFloorY + lift + spec.cardHeightMm)) : null,
      cardProtrusionMm: hasCards ? round(cardFloorY + lift + spec.cardHeightMm - frontTopY) : null,
      stripeClearanceMm: hasCards ? round(stripe - yM) : null,
      stripeClearanceKMaxMm: hasCards ? round(stripe - yMk) : null,
      fieldMilliTesla: hasCards ? round(dipoleFieldMilliTesla(spec, stripe - yM, stripeDz)) : null,
      fieldKMaxMilliTesla: hasCards
        ? round(dipoleFieldMilliTesla(spec, stripe - yMk, stripeDz))
        : null,
      thicknessMaxMm: round(th.max),
      thicknessZone: th.zone,
    };
  });

  /* Výřez pro palec v horní hraně F (kolo 4). Dno je půlkruh výsečníkem Ø šířky, nad ním rovné
     boky nožem. Šířka je omezená tím, aby rohy ústí přikryl i jazýček posunutý bočně o toleranci
     magnetu (plateSideMarginMm); leží na ose pod jazýčkem, daleko od pásů G2b/G4 a švů S4/S5/S6. */
  const notchR = spec.thumbNotchWidthMm / 2;
  const notchDepth = spec.thumbNotchDepthMm;
  const withCards = states.filter((q) => q.cardProtrusionMm !== null);
  const rt = spec.tongueTipRadiusMm;
  const thumbNotch = {
    cx: axisX,
    x0: axisX - notchR,
    x1: axisX + notchR,
    radius: notchR,
    depthMm: notchDepth,
    bottomY: frontTopY - notchDepth,
    centerY: frontTopY - notchDepth + notchR,
    topY: frontTopY,
    cornerRadiusMm: spec.thumbNotchCornerRadiusMm,
    exposedCardMm: [
      round(Math.min(...withCards.map((q) => q.cardProtrusionMm!)) + notchDepth),
      round(Math.max(...withCards.map((q) => q.cardProtrusionMm!)) + notchDepth),
    ] as [number, number],
    tipNarrowerMm: round(tipNarrower(rt, notchR)),
    tipNarrowerShiftedMm: round(tipNarrower(rt, notchR + spec.plateSideMarginMm)),
    cornerToTongueMm: round(axisX - notchR - spec.thumbNotchCornerRadiusMm - tongueX[0]),
  };

  /* R4: karta omylem v oddílu bankovek (stojí na dně bankovek, δ = 0). */
  const magnetLow = Math.min(...states.map((q) => Math.min(q.magnetY, q.magnetYkMax)));
  const magnetHigh = Math.max(...states.map((q) => Math.max(q.magnetY, q.magnetYkMax)));
  const misplacedDz = stripeDz + spec.plateThicknessMm + tD;
  const stripeDownY: [number, number] = [
    spec.billFloorMm + spec.stripeNearMm,
    spec.billFloorMm + spec.stripeFarMm,
  ];
  const stripeUpY = spec.billFloorMm + spec.cardHeightMm - spec.stripeFarMm;
  // Zbloudilá karta je sama obsahem pod závěsem: nejhorší je stav C + tahle karta, k max.
  const stateC = contentStates.find((q) => q.id === 'C')!;
  const kHigh = Math.max(spec.kDesign, spec.kMax);
  const magnetHighWithCard = magnetAt(
    hingePath(spec, hingeContent(spec, { ...stateC, cards: stateC.cards + 1 })),
    kHigh,
  );
  const stripeUpDz = stripeDz + tD;
  const stripeUpClearanceMm = stripeUpY - magnetHighWithCard;
  const misplacedCard = {
    dzMm: round(misplacedDz),
    stripeDownY: [round(stripeDownY[0]), round(stripeDownY[1])] as [number, number],
    magnetSpanY: [round(magnetLow - rMag), round(magnetHigh + rMag)] as [number, number],
    stripeDownOverlapsMagnet:
      stripeDownY[0] < magnetHigh + rMag && stripeDownY[1] > magnetLow - rMag,
    stripeUpY: round(stripeUpY),
    magnetHighWithCardY: round(magnetHighWithCard),
    stripeUpDzMm: round(stripeUpDz),
    stripeUpClearanceMm: round(stripeUpClearanceMm),
    stripeUpClearanceLowFloorMm: round(stripeUpClearanceMm - spec.billFloorToleranceMm),
    stripeUpFieldMilliTesla: round(dipoleFieldMilliTesla(spec, stripeUpClearanceMm, stripeUpDz)),
    cardPocketStripeUpClearanceMm: round(
      cardFloorY + spec.cardHeightMm - spec.stripeFarMm - magnetHigh,
    ),
  };

  /* Vložka ohybu dna (SF5, Kolo 6, Kolo 9: ze 2 vrstev starých karet, 2 dvojice vedle sebe). */
  const bottomSpacer = {
    // Kolo 6: vložka přesahuje boky dílu, ohyb má oporu po celé šířce (boky se nevyplňují).
    widthMm: round(widthMm + 2 * spec.bottomSpacerOverhangMm),
    // hloubka = klemovaná zóna 20 mm (krok 11) + rezerva na uchopení při vysunutí
    depthMm: 25,
  };
  const cardLayers = Math.max(1, Math.round(spec.bottomSpacerMm / tk));
  const cardsPerLayer = Math.ceil(bottomSpacer.widthMm / spec.cardWidthMm - 1e-9);
  const fromCards = {
    layers: cardLayers,
    cardsPerLayer,
    cards: cardLayers * cardsPerLayer,
    thicknessMm: round(cardLayers * tk),
    lengthMm: round(cardsPerLayer * spec.cardWidthMm),
    heightMm: spec.cardHeightMm,
    edgeTrimMm: LID_SPACER_EDGE_TRIM_MM,
    excessMm: round(cardsPerLayer * spec.cardWidthMm - bottomSpacer.widthMm),
  };

  return {
    contentCardsBillsCMm: round(contentCardsBillsCMm),
    hingeContentAMm: round(TA),
    hingeContentBMm: round(TB),
    hingeContentCMm: round(TC),
    cardPocketNeedMm: round(cardPocketNeedMm),
    cardSlotNeedMm: round(cardSlotNeedMm),
    pocketMm,
    widthMm,
    columnNeedMm: round(columnNeedMm),
    columnMm,
    centerBandMm,
    pocketX0,
    pocketX1,
    columnLeft,
    columnRight,
    centerBand,
    axisX,
    seamSideX: [e, widthMm - e],
    seamColumnX,
    cardPocketX,
    flatFromY: round(flatFromY),
    cardFloorY,
    s6Y,
    ceilingY,
    hingeStartY,
    heightMm: round(heightMm),
    frontTopY,
    coinFloorY,
    s1Y,
    d2BottomY,
    d2TopY,
    d1TopY,
    d1BottomY,
    magnetYB,
    magnetYBMin: round(magnetYBMin),
    magnetYBMax: round(magnetYBMax),
    magnetYBOnGrid,
    bandFromMagnetMm: round(bandFromMagnetMm),
    plate,
    magnetX,
    tongueX,
    bottomFoldMm: round(tFold),
    hingeMm: round(tHinge),
    hingeMidRadiusMm: round(rm),
    magnetPlateGapMm: round(spec.liningMm + tP),
    lining,
    v: {
      ...v,
      frontEnd: round(v.frontEnd),
      foldArc: round(v.foldArc),
      foldAxis: round(v.foldAxis),
      backStart: round(v.backStart),
      insertEdge: round(v.insertEdge),
      hingeStart: round(v.hingeStart),
      hingeLenB: round(v.hingeLenB),
      hingeEnd: round(v.hingeEnd),
      rearCrease: round(v.rearCrease),
      frontCrease: round(v.frontCrease),
      bandEnd: round(v.bandEnd),
      tip: round(v.tip),
      cutEnd: round(v.cutEnd),
      foldBand: [round(v.foldBand[0]), round(v.foldBand[1])],
      hingeBand: [round(v.hingeBand[0]), round(v.hingeBand[1])],
    },
    bandLenB: round(bandLenB),
    tongueLenB: round(tongueLenB),
    p1LengthMm: round(cutEnd),
    hingeBandStartY: round(hingeBandStartY),
    coinWindows,
    billWindow,
    seams,
    holesTotal,
    stitchesTotal,
    glue,
    topGlueY,
    d1: { x0: pocketX0, x1: pocketX1, y0: d1BottomY, y1: d1TopY },
    d2: { x0: -1, x1: widthMm + 1, y0: d2BottomY, y1: d2TopY },
    billSidePlayMm: [pocketMm - spec.billHalfWidthMaxMm, pocketMm - spec.billHalfWidthMinMm],
    billTopClearanceMm: round(ceilingY - spec.billFloorMm - spec.billHeightMaxMm),
    billPushMm,
    billProtrusionMm: [round(billProtrusionMm[0]), round(billProtrusionMm[1])],
    billWindowCoverX,
    columnLengthMm: round(columnLengthMm),
    columnPlayMm: round(columnPlayMm),
    coinProtrusionMm: round(coinProtrusionMm),
    singleCoinTravelMm: [round(singleCoinTravelMm[0]), round(singleCoinTravelMm[1])],
    thumbNotch,
    misplacedCard,
    fanDeg: [
      round(fanAngle(spec.cardWidthMm, spec.cardHeightMm, cardPocketX[1] - cardPocketX[0])),
      round(fanAngle(spec.cardWidthMm, spec.cardPocketDepthMm, cardPocketX[1] - cardPocketX[0])),
    ],
    states,
    thicknessMaxMm: Math.max(...states.map((s) => s.thicknessMaxMm)),
    maxLayersInSeam: 3,
    maxSeamThicknessMm: round(Math.max(...seams.map((s) => s.thicknessMm))),
    bottomSpacer: { ...bottomSpacer, fromCards },
  };
}

/**
 * Největší tloušťka ve stavu (oddíl 7) po zónách: K = sloupce mincí, S = pás pod jazýčkem,
 * magnet, přesah víčka přes F, dole pod dnem karet.
 */
function thicknessFor(
  spec: LidWalletSpec,
  s: ContentState,
  y: {
    frontTopY: number;
    d2BottomY: number;
    magnetY: number;
    bandEdgeY: number;
    /** Svislý rozsah mincí ve sloupci (null = bez mincí). */
    coinSpan: [number, number] | null;
  },
): { max: number; zone: string } {
  const tP = spec.leatherMm;
  const tD = spec.dividerMm;
  const cards = s.cards * spec.cardThicknessMm;
  const bills = billsThickness(spec, s.bills);
  const coin = y.coinSpan ? spec.coinThicknessMaxMm : 0;
  const body = tP + cards + tD + bills + tD + tP; // F nebo víčko + … + B, bez mince
  // Přesah víčka přes F (pás y hrana víčka … horní hrana F) a jestli v něm leží mince.
  const overlap = y.bandEdgeY < y.frontTopY - 1e-9 ? tP : 0;
  const coinInOverlap =
    y.coinSpan !== null && y.coinSpan[1] > y.bandEdgeY && y.coinSpan[0] < y.frontTopY;
  const d2AtMagnet = y.magnetY + spec.magnetDiameterMm / 2 > y.d2BottomY ? tD : 0;
  const zones: [string, number][] = [
    ['K se mincí', body + coin + (coinInOverlap ? overlap : 0)],
    ['přesah víčka přes F', body + overlap + (coinInOverlap ? coin : 0)],
    ['S pod jazýčkem', body + tP],
    [
      'magnet',
      tP +
        spec.magnetThicknessMm +
        spec.liningMm +
        tP +
        spec.plateThicknessMm +
        tD +
        bills +
        d2AtMagnet +
        tP,
    ],
    ['dole', tP + tD + bills + tP],
  ];
  let best = zones[0]!;
  for (const z of zones) if (z[1] > best[1] + 1e-9) best = z;
  return { max: best[1], zone: best[0] };
}

/**
 * Kontroly střihu. Vrací seznam problémů česky (prázdný = v pořádku).
 */
export function checkLidWallet(spec: LidWalletSpec = DEFAULT_LID_WALLET): string[] {
  const p: string[] = [];
  const positive: (keyof LidWalletSpec)[] = [
    'cardWidthMm',
    'cardHeightMm',
    'cardThicknessMm',
    'leatherMm',
    'dividerMm',
    'liningMm',
    'coinDiameterMaxMm',
    'coinDiameterMinMm',
    'coinThicknessMaxMm',
    'magnetDiameterMm',
    'magnetThicknessMm',
    'stitchPitchMm',
    'billWindowWidthMm',
    'coinWindowWidthMm',
    'thumbContactMm',
    'thumbNotchWidthMm',
    'thumbNotchDepthMm',
    'tongueWidthMm',
    'bottomSpacerMm',
    'kDesign',
    'kMax',
    'roundStepMm',
  ];
  for (const k of positive) {
    const val = spec[k];
    if (!(typeof val === 'number' && Number.isFinite(val) && val > 0)) {
      p.push(`${k} musí být kladné číslo (je ${String(val)}).`);
    }
  }
  if (p.length > 0) return p;
  if (!Number.isInteger(spec.cardsMax) || spec.cardsMax < 4 || spec.cardsMax > 6) {
    p.push(`Brief chce 4–6 karet; návrh má ${spec.cardsMax}.`);
  }
  for (const k of ['bottomFoldSkiveMm', 'hingeSkiveMm'] as const) {
    const val = spec[k];
    if (val !== null && !(Number.isFinite(val) && val > 0 && val < spec.leatherMm)) {
      p.push(`${k} musí být null (bez ztenčení) nebo mezi 0 a tloušťkou P1 (je ${String(val)}).`);
    }
  }
  if (p.length > 0) return p;
  if (spec.kMax < spec.kDesign) p.push('k max nesmí být menší než návrhové k.');
  if (spec.coinDiameterMinMm > spec.coinDiameterMaxMm)
    p.push('Nejmenší mince je větší než největší.');
  const L = lidWalletLayout(spec);
  const r = spec.magnetDiameterMm / 2;

  // Šířky.
  if (L.pocketMm < L.cardPocketNeedMm - 1e-9) {
    p.push(
      `Kapsa ${fmt(L.pocketMm)} mm nepojme kartu + obsah stavu C (potřeba ${fmt(L.cardPocketNeedMm)}).`,
    );
  }
  const cardOnly =
    spec.cardWidthMm + spec.cardsMax * spec.cardThicknessMm + spec.cardPocketReserveMm;
  if (L.cardPocketX[1] - L.cardPocketX[0] < cardOnly - 1e-9) {
    p.push(
      `Kapsa karet mezi boky D1 ${fmt(L.cardPocketX[1] - L.cardPocketX[0])} mm je užší než ${fmt(cardOnly)} (karty + vůle).`,
    );
  }
  if (L.columnMm < spec.coinDiameterMaxMm + spec.coinThicknessMaxMm - 1e-9) {
    p.push(
      `Sloupec ${fmt(L.columnMm)} mm neobalí minci Ø ${fmt(spec.coinDiameterMaxMm)} × ${fmt(spec.coinThicknessMaxMm)} (potřeba ≥ Ø + t).`,
    );
  }
  if (L.centerBandMm < spec.tongueWidthMm + 2 * 3) {
    p.push(`Střední lepený pás ${fmt(L.centerBandMm)} mm je užší než jazýček + 2 × 3 mm.`);
  }
  if (L.magnetX[0] - L.columnLeft[1] < 10 - 1e-9) {
    p.push(
      `Magnet je jen ${fmt(L.magnetX[0] - L.columnLeft[1])} mm od sloupce mincí (minimum 10, ocelové mince).`,
    );
  }
  if (spec.billHalfWidthMaxMm > L.pocketMm - 2) {
    p.push(
      `Bankovka napůl ${fmt(spec.billHalfWidthMaxMm)} mm se do kapsy ${fmt(L.pocketMm)} nevejde s vůlí 2 mm.`,
    );
  }

  // Výšky a retence.
  if (L.ceilingY - spec.billFloorMm - spec.billHeightMaxMm < spec.billTopClearanceMm - 1e-9) {
    p.push('Nejvyšší bankovka nemá pod stropem požadovanou vůli.');
  }
  if (L.columnLengthMm < spec.coinsPerColumn * spec.coinDiameterMaxMm + 1 - 1e-9) {
    p.push(
      `Sloupec je dlouhý ${fmt(L.columnLengthMm)} mm (horší δ), ${spec.coinsPerColumn} mince Ø ${fmt(spec.coinDiameterMaxMm)} potřebují ${fmt(spec.coinsPerColumn * spec.coinDiameterMaxMm + 1)}.`,
    );
  }
  if (L.ceilingY - L.d2TopY >= spec.coinThicknessMinMm) {
    p.push(
      `Mezera nad D2 ${fmt(L.ceilingY - L.d2TopY)} mm pustí minci ${fmt(spec.coinThicknessMinMm)} mm do bankovek.`,
    );
  }
  if (L.d1TopY > L.ceilingY - 0.5 + 1e-9) p.push('D1 sahá až do závěsu.');
  if (L.coinFloorY > L.cardFloorY - 1 + 1e-9) {
    p.push('Dno mincí musí ležet pod čarou dna karet (schod karet by naklonil spodní minci).');
  }
  if (L.s1Y < L.d2BottomY + spec.d2SkiveWedgeMm + 1 - 1e-9) {
    p.push(
      `Šev S1 (y ${fmt(L.s1Y)}) prochází klínem ztenčení D2 (y ${fmt(L.d2BottomY)}–${fmt(L.d2BottomY + spec.d2SkiveWedgeMm)}), kde je D2 jen zlomek tloušťky.`,
    );
  }
  for (const y of L.seams.find((s) => s.id === 'S4')!.holes.map((h) => h.y)) {
    if (Math.abs(y - L.d2BottomY) < 1.5) {
      p.push(
        `Spodní hrana D2 (y ${fmt(L.d2BottomY)}) je jen ${fmt(Math.abs(y - L.d2BottomY))} mm od otvoru bočního švu.`,
      );
    }
    if (Math.abs(y - L.frontTopY) < 1.9) {
      p.push(`Horní hrana F (y ${fmt(L.frontTopY)}) neleží mezi otvory bočního švu.`);
    }
  }
  const side = L.seams.find((s) => s.id === 'S4')!.holes;
  if (side[side.length - 1]!.y > L.hingeBandStartY - 3 + 1e-9) {
    p.push('Horní otvor bočního švu je méně než 3 mm pod pásem závěsu.');
  }
  if (L.topGlueY > L.hingeStartY + 1e-9) p.push('Lepení sahá do přehybu závěsu.');

  // Magnet, plíšek, proužek.
  const A = L.states.find((s) => s.state.id === 'A')!;
  const C = L.states.find((s) => s.state.id === 'C')!;
  for (const s of L.states) {
    if (!s.onPlate) {
      p.push(
        `Stav ${s.state.label}: magnet (y ${fmt(s.magnetY - r)}–${fmt(s.magnetTopY)}) není celý na plíšku y ${fmt(L.plate.y0)}–${fmt(L.plate.y1)} s rezervou ${fmt(spec.plateMarginMm)}.`,
      );
    }
    if (!s.onPlateKMax) {
      p.push(
        `Stav ${s.state.label} při k ${fmt(spec.kMax)}: magnet (y ${fmt(s.magnetYkMax - r)}–${fmt(s.magnetTopYkMax)}) není celý na plíšku y ${fmt(L.plate.y0)}–${fmt(L.plate.y1)} s rezervou ${fmt(spec.plateMarginMm)}.`,
      );
    }
    if (s.stripeClearanceMm !== null && s.stripeClearanceMm < spec.stripeClearanceMinMm - 1e-9) {
      p.push(
        `Stav ${s.state.label}: proužek karty je jen ${fmt(s.stripeClearanceMm)} mm od středu magnetu (minimum ${fmt(spec.stripeClearanceMinMm)}).`,
      );
    }
    if (
      s.stripeClearanceKMaxMm !== null &&
      s.stripeClearanceKMaxMm < spec.stripeClearanceMinMm - 1e-9
    ) {
      p.push(
        `Stav ${s.state.label} při k ${fmt(spec.kMax)}: proužek je jen ${fmt(s.stripeClearanceKMaxMm)} mm od magnetu.`,
      );
    }
    if (s.stepMarginMm < spec.stepMarginMm - 1e-9) {
      p.push(
        `Stav ${s.state.label}: vršek magnetu je jen ${fmt(s.stepMarginMm)} mm pod dnem karet (minimum ${fmt(spec.stepMarginMm)}).`,
      );
    }
    if (s.magnetTopYkMax > L.cardFloorY + 1e-9) {
      p.push(
        `Stav ${s.state.label} při k ${fmt(spec.kMax)}: vršek magnetu (y ${fmt(s.magnetTopYkMax)}) vyjede nad dno karet ${fmt(L.cardFloorY)} a z plíšku.`,
      );
    }
    if (s.cardShiftNomMm !== null && s.cardShiftNomMm < 0) {
      p.push(`Stav ${s.state.label}: karty narážejí do závěsu (posun ${fmt(s.cardShiftNomMm)}).`);
    }
  }
  if (!L.magnetYBOnGrid) {
    p.push(
      `Okno pro lepení magnetu ve stavu B y ${fmt(L.magnetYBMin)}–${fmt(L.magnetYBMax)} je užší než krok 0,05 – na hotovém kusu se nedá trefit.`,
    );
  }
  if (L.magnetYB < L.magnetYBMin - 1e-9 || L.magnetYB > L.magnetYBMax + 1e-9) {
    p.push(
      `Poloha magnetu ve stavu B y ${fmt(L.magnetYB)} leží mimo okno ${fmt(L.magnetYBMin)}–${fmt(L.magnetYBMax)}.`,
    );
  }
  if (L.plate.y0 < L.flatFromY - 1e-9) {
    p.push(
      `Plíšek (od y ${fmt(L.plate.y0)}) zasahuje pod rovnou část F (od ${fmt(L.flatFromY)}) do ohybu dna.`,
    );
  }
  if (A.tipY < L.flatFromY - 1e-9) {
    p.push(
      `Ve stavu A leží špička jazýčku v y ${fmt(A.tipY)}, pod rovnou částí F (od ${fmt(L.flatFromY)}).`,
    );
  }
  if (A.tipYkMax < 0.5) p.push(`Při k ${fmt(spec.kMax)} ve stavu A špička přečnívá dno peněženky.`);
  if (L.plate.y1 > L.cardFloorY - 1 + 1e-9) p.push('Karty by stály na plíšku.');
  if (C.fieldMilliTesla !== null && C.fieldMilliTesla > 10) {
    p.push(
      `Odhad pole u proužku ve stavu C ${fmt(C.fieldMilliTesla)} mT je nad 1/3 koercivity LoCo (~30 mT).`,
    );
  }
  if (spec.magnetFromTipMm - r < 3 - 1e-9) p.push('Magnet je méně než 3 mm od špičky jazýčku.');
  if (spec.tipSkiveMm > spec.magnetFromTipMm - r - 0.5 + 1e-9) {
    p.push('Ztenčení špičky zasahuje pod magnet (magnet by se naklonil).');
  }
  if (spec.tongueTipRadiusMm > spec.tongueWidthMm / 2 + 1e-9)
    p.push('R špičky je větší než půl jazýčku.');
  if (spec.tongueWidthMm < spec.magnetDiameterMm + 2 * 5) {
    p.push('Jazýček nemá kolem magnetu ≥ 5 mm lepení L1 do stran.');
  }
  // L1 a šev S7 kolem ní (Kolo 6).
  if (L.lining.bottomAboveTipMm > -1e-9) {
    p.push(
      `Přířez L1 (${fmt(spec.liningBlankHeightMm)} mm, horní hrana ${fmt(L.lining.topAboveTipMm)} nad špičkou) nesahá přes špičku jazýčku – po ořezu by L1 chyběla na konci.`,
    );
  }
  if (spec.liningBlankWidthMm < spec.tongueWidthMm + 2 - 1e-9) {
    p.push('Přířez L1 není aspoň o 2 mm širší než jazýček (ořez načisto s jazýčkem).');
  }
  const s7 = L.seams.find((s) => s.id === 'S7')!;
  const s7TopRow = s7.holes.filter(
    (h) => Math.abs(h.y - Math.max(...s7.holes.map((q) => q.y))) < 1e-6,
  );
  if (s7.holes.length - s7TopRow.length < 2) {
    p.push('Šev S7 kolem L1 nemá po stranách magnetu ani jeden otvor (jazýček je na něj úzký).');
  }
  if (L.lining.seamToMagnetMm < spec.liningSeamMagnetClearanceMm - 1e-9) {
    p.push(
      `Otvor švu S7 je jen ${fmt(L.lining.seamToMagnetMm)} mm od kraje magnetu (minimum ${fmt(spec.liningSeamMagnetClearanceMm)}).`,
    );
  }
  if (L.lining.seamToEdgeMm < spec.seamOffsetMm - 1e-9) {
    p.push(
      `Otvor švu S7 je jen ${fmt(L.lining.seamToEdgeMm)} mm od hrany jazýčku (minimum ${fmt(spec.seamOffsetMm)}).`,
    );
  }
  const bandC = C.bandEdgeY - L.frontTopY;
  if (bandC < -1e-9 || bandC > 1.5 + 1e-9) {
    p.push(`Hrana pásu víčka je ve stavu C ${fmt(bandC)} mm od horní hrany F (cíl 0–1,5).`);
  }

  // Výřez pro palec v horní hraně F (kolo 4).
  const n = L.thumbNotch;
  const notchSideMin = spec.plateSideMarginMm + spec.thumbNotchSideReserveMm;
  if (
    n.x0 - n.cornerRadiusMm - L.tongueX[0] < notchSideMin - 1e-9 ||
    L.tongueX[1] - (n.x1 + n.cornerRadiusMm) < notchSideMin - 1e-9
  ) {
    p.push(
      `Výřez pro palec x ${fmt(n.x0)}–${fmt(n.x1)} (s rohy R${fmt(n.cornerRadiusMm)}) nepřikryje jazýček x ${fmt(L.tongueX[0])}–${fmt(L.tongueX[1])} posunutý bočně o ${fmt(spec.plateSideMarginMm)} mm s rezervou ${fmt(spec.thumbNotchSideReserveMm)} (rohy ústí musí být od boků jazýčku ≥ ${fmt(notchSideMin)}) – hrana jazýčku by přes roh výřezu zachytávala.`,
    );
  }
  if (n.x0 - n.cornerRadiusMm < L.cardPocketX[0] + 30 - 1e-9) {
    p.push('Výřez pro palec zasahuje k bočním pásům G2b/G4 a švům S4/S5.');
  }
  if (n.bottomY < L.cardFloorY + spec.cardPocketDepthMm / 2 - 1e-9) {
    p.push(
      `Dno výřezu pro palec (y ${fmt(n.bottomY)}) je níž než polovina hloubky kapsy karet nad dnem (${fmt(L.cardFloorY + spec.cardPocketDepthMm / 2)}).`,
    );
  }
  if (n.tipNarrowerMm > spec.tipSkiveMm + 1e-9) {
    p.push(
      `Konec jazýčku je užší než výřez pro palec na ${fmt(n.tipNarrowerMm)} mm, víc než ztenčený klín ${fmt(spec.tipSkiveMm)} – při zavírání by se špička mohla zachytit.`,
    );
  }
  for (const s of L.states) {
    if (Math.max(s.magnetTopY, s.magnetTopYkMax) > n.bottomY - 3 + 1e-9) {
      p.push(`Stav ${s.state.label}: magnet leží u výřezu pro palec (méně než 3 mm pod dnem).`);
    }
  }

  // R4: karta omylem v oddílu bankovek, vložená proužkem nahoru.
  if (L.misplacedCard.stripeUpClearanceLowFloorMm < spec.stripeClearanceMinMm - 1e-9) {
    p.push(
      `Karta v oddílu bankovek proužkem nahoru má proužek jen ${fmt(L.misplacedCard.stripeUpClearanceLowFloorMm)} mm nad magnetem (minimum ${fmt(spec.stripeClearanceMinMm)}).`,
    );
  }

  // Okénka.
  if (spec.billWindowWidthMm > spec.coinDiameterMinMm - 5 + 1e-9) {
    p.push(
      `Okénko bankovek ${fmt(spec.billWindowWidthMm)} mm: mince Ø ${fmt(spec.coinDiameterMinMm)} v oddílu bankovek by mohla vypadnout (max Ø − 5).`,
    );
  }
  const bw = L.billWindow;
  if (bw.cx - bw.width / 2 < L.seamColumnX[0] + 3 || bw.cx + bw.width / 2 > L.seamColumnX[1] - 3) {
    p.push('Okénko bankovek je méně než 3 mm od švů sloupců (musí být v lepeném středu D2 + B).');
  }
  if (
    bw.cx - bw.width / 2 < L.billWindowCoverX[0] ||
    bw.cx + bw.width / 2 > L.billWindowCoverX[1]
  ) {
    p.push('Nejužší bankovka nemusí překrýt celé okénko bankovek.');
  }
  if (bw.y0 < L.s1Y + 3) p.push('Okénko bankovek sahá ke spodnímu švu S1.');
  if (L.billProtrusionMm[0] < 15 - 1e-9) {
    p.push(`Nízká bankovka vyčnívá po posunu jen ${fmt(L.billProtrusionMm[0])} mm (cíl ≥ 15).`);
  }
  if (spec.coinWindowWidthMm >= spec.coinDiameterMinMm) {
    p.push('Okénko mincí je širší než nejmenší mince – vypadla by.');
  }
  for (const w of L.coinWindows) {
    if (w.y1 > L.hingeBandStartY - 3) p.push('Okénko mincí sahá k závěsu.');
    if (w.y0 < L.s1Y + 3) p.push('Okénko mincí sahá ke spodnímu švu S1.');
  }
  if (L.coinProtrusionMm < 8 - 1e-9) {
    p.push(`Horní mince po posunu palcem vyčnívá jen ${fmt(L.coinProtrusionMm)} mm (minimum 8).`);
  }

  // Švy a tloušťky.
  for (const s of L.seams) {
    if (s.thicknessMm > 3.0 + 1e-9)
      p.push(`Šev ${s.id} jde skrz ${fmt(s.thicknessMm)} mm (max 3,0).`);
  }
  if (spec.stitchPitchMm !== 4) p.push('Vidličky jsou přesně 4 mm (poučení z minulých projektů).');
  if (spec.seamOffsetMm < 3 || spec.seamOffsetMm > 4) {
    p.push(`Šev ${fmt(spec.seamOffsetMm)} mm od hrany je mimo 3–4 mm (brief kap. 13).`);
  }
  if (L.thicknessMaxMm > 12 + 1e-9) {
    p.push(`Plná tloušťka ${fmt(L.thicknessMaxMm)} mm je nad přijatou hranicí ≈ 12.`);
  }

  // Tisk.
  const printable =
    PRINT_SHEET.heightMm - 2 * PRINT_SHEET.marginMm - SHEET_HEADER_MM - SHEET_FOOTER_MM;
  if (L.p1LengthMm > printable) {
    p.push(
      `P1 (${fmt(L.p1LengthMm)} mm) se nevejde na tiskový list A4 (místo ${fmt(printable)} mm).`,
    );
  }
  if (L.widthMm > PRINT_SHEET.widthMm - 2 * PRINT_SHEET.marginMm - 70) {
    p.push('Vedle P1 nezbude na listu místo na popisky.');
  }
  return p;
}

export function assertLidWallet(spec: LidWalletSpec): void {
  const problems = checkLidWallet(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatný střih peněženky VÍČKO:\n- ${problems.join('\n- ')}`);
  }
}

/** Číslo s desetinnou čárkou pro hlášky (na 0,01 mm, bez zbytečných nul). */
export function fmt(v: number): string {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}
