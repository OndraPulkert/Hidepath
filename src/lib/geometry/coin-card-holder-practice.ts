/**
 * Cvičný proužek k lekci 4 pouzdra s vsazenou mincí (skládání a šev tří vrstev na odřezku).
 *
 * Proužek má stejné pořadí jako pás ([ZADNÍ][ohyb A][PŘEDNÍ][ohyb B][VNITŘNÍ]), jen panely jsou
 * zkrácené na 30 mm a výška na 40 mm. **Ohyby se nezkracují**: jejich přídavek závisí na tloušťce
 * kůže a obsahu kapes, ne na šířce panelu, a bere se z modelu pásu (`coinCardHolderLayout`) pro
 * danou tloušťku těla. Šev dna se počítá stejně jako na listu PÁS: od čáry ohybu i od konce
 * aspoň `stitchOffset`, řada vystředěná na panelu a zrcadlená přes střed ohybu.
 */
import {
  DEFAULT_COIN_CARD_HOLDER,
  coinCardHolderLayout,
  foldSkiveFor,
  type CoinCardHolderSpec,
} from './coin-card-holder.ts';

/** Rozměry cvičného proužku z lekce 4: tři panely po 30 mm, výška 40 mm, kus kůže asi 130 × 50. */
export const PRACTICE_STRIP = {
  panelWidthMm: 30,
  heightMm: 40,
  /** Kus kůže z materiálů lekce 4 (s rezervou na konce). */
  pieceLengthMm: 130,
  /**
   * Výška kusu: proužek a nahoře i dole 5 mm odpadu, kam padnou kroužky konců čar ohybů
   * (2 mm za čarou řezu, jako na listu PÁS). Vejde se do pruhu 57,5 mm podél hrany přířezu
   * (kapsa 57,5 × 57,5 vedle proužku, nákupní plán).
   */
  pieceHeightMm: 50,
} as const;

/** Tloušťky těla, pro které má lekce 4 čísla (1,2 mm výchozí sestava, 1,5 mm se ztenčením B). */
export const PRACTICE_THICKNESSES = [1.2, 1.5] as const;

export interface PracticeStripLayout {
  bodyThicknessMm: number;
  /** Ztenčení ohybu B (mm) nebo null, když se u této tloušťky neztenčuje. */
  foldSkiveThicknessMm: number | null;
  foldSkiveMarginMm: number;
  panelWidthMm: number;
  heightMm: number;
  foldAMm: number;
  foldBMm: number;
  /** Hranice panelů zleva při pohledu na líc (jako list PÁS): zadní, ohyb A, přední, ohyb B, vnitřní. */
  backX1Mm: number;
  frontX0Mm: number;
  frontX1Mm: number;
  innerX0Mm: number;
  stripLengthMm: number;
  /** Šev dna: y od horní hrany, rozteč, počet otvorů na panel, odstup krajního otvoru od čáry ohybu/konce. */
  seamYMm: number;
  stitchOffsetMm: number;
  stitchPitchMm: number;
  holesPerPanel: number;
  endHoleOffsetMm: number;
  /** x všech otvorů po panelech [zadní, přední, vnitřní], zleva doprava. */
  holeXsMm: [number[], number[], number[]];
  /** Kolik zbude na každém konci kusu `pieceLengthMm`, když se obrys vystředí. */
  pieceReserveEachEndMm: number;
  /** Kolik zbude nahoře i dole na kusu `pieceHeightMm`, když se obrys vystředí. */
  pieceReserveTopBottomMm: number;
}

/** Spec pásu pro tloušťku těla, stejně jako přepínač `--thickness` generátoru pásu. */
export function practiceSpecFor(bodyThicknessMm: number): CoinCardHolderSpec {
  return {
    ...DEFAULT_COIN_CARD_HOLDER,
    bodyThicknessMm,
    foldSkiveThicknessMm: foldSkiveFor(bodyThicknessMm),
  };
}

export function practiceStripLayout(bodyThicknessMm: number): PracticeStripLayout {
  const spec = practiceSpecFor(bodyThicknessMm);
  const L = coinCardHolderLayout(spec);
  const pw = PRACTICE_STRIP.panelWidthMm;
  const so = spec.stitchOffsetMm;
  const pitch = spec.stitchPitchMm;
  const foldA = L.foldBackFrontMm;
  const foldB = L.foldFrontInnerMm;
  const backX1 = pw;
  const frontX0 = round(backX1 + foldA);
  const frontX1 = round(frontX0 + pw);
  const innerX0 = round(frontX1 + foldB);
  const stripLength = round(innerX0 + pw);

  const holes = Math.floor((pw - 2 * so) / pitch + 1e-9) + 1;
  const run = (holes - 1) * pitch;
  const endOffset = round((pw - run) / 2);
  const row = (x0: number): number[] =>
    Array.from({ length: holes }, (_, i) => round(x0 + i * pitch));
  // Přední panel vystředěný, zadní a vnitřní zrcadlené přes střed ohybu (jako list PÁS).
  const front = row(frontX0 + endOffset);
  const cA = (backX1 + frontX0) / 2;
  const cB = (frontX1 + innerX0) / 2;
  const back = front.map((x) => round(2 * cA - x)).reverse();
  const inner = front.map((x) => round(2 * cB - x)).reverse();

  return {
    bodyThicknessMm,
    foldSkiveThicknessMm: spec.foldSkiveThicknessMm,
    foldSkiveMarginMm: spec.foldSkiveMarginMm,
    panelWidthMm: pw,
    heightMm: PRACTICE_STRIP.heightMm,
    foldAMm: foldA,
    foldBMm: foldB,
    backX1Mm: backX1,
    frontX0Mm: frontX0,
    frontX1Mm: frontX1,
    innerX0Mm: innerX0,
    stripLengthMm: stripLength,
    seamYMm: round(PRACTICE_STRIP.heightMm - so),
    stitchOffsetMm: so,
    stitchPitchMm: pitch,
    holesPerPanel: holes,
    endHoleOffsetMm: endOffset,
    holeXsMm: [back, front, inner],
    pieceReserveEachEndMm: round((PRACTICE_STRIP.pieceLengthMm - stripLength) / 2),
    pieceReserveTopBottomMm: round((PRACTICE_STRIP.pieceHeightMm - PRACTICE_STRIP.heightMm) / 2),
  };
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
