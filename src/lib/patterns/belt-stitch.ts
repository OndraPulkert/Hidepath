/**
 * Ozdobný steh na pásku (projekt 04, volitelná lekce 7): sedlářský steh podél obou dlouhých hran
 * hotového pásku. Čisté funkce bez Reactu; čísla ukazuje „Váš pásek“ a kroky lekce 7.
 *
 * Linie vede jen tělem pásu (jedna vrstva): začíná na úrovni otvoru pro nýt blíž k ohybu
 * (rub tohoto úseku zakryje přehnutý konec, takže začátek nitě zmizí mezi vrstvami) a končí
 * jednu rozteč před tvarem konce (hrot ani oblouk se neobchází). Délka pásu je spočítaná
 * z obvodu, ne změřená, proto jsou počty otvorů a nit přibližné („asi“).
 */
import {
  type BeltEndSpec,
  type BeltTipShape,
  type BeltTipSpec,
  tipShapeLengthMm,
} from '../geometry/belt-end';

/** Linie stehu od hrany: zhruba tloušťka pásu (3,5–3,7 mm), zaokrouhleno; lekce 7 ji ověřuje na odřezku. */
export const STITCH_OFFSET_MM = 4;
/** Rozteč otvorů: vidličky WUTA Type B 4 mm z projektu 01 (notes-vybaveni.md). */
export const STITCH_SPACING_MM = 4;
/**
 * Nit na šev: 5× délka švu. public/animace/delka-nite.html dává 5× přes tři vrstvy (asi 3,6 mm,
 * stejně jako pás 3,5–3,7 mm). Šev se tu nedělí (výjimka z tipu „přes 1,5 m“ tamtéž), protože
 * napojení na jedné vrstvě by bylo vidět.
 */
export const THREAD_FACTOR = 5;
/** Tamtéž: + 25–30 cm na jehly a konce. */
export const THREAD_RESERVE_M = 0.3;
/** Nit na zkoušku na odřezku, jako nácvik v projektu 01. */
export const PRACTICE_THREAD_M = 0.6;
/** Nit Slam se prodává po 20 m (CraftPoint). */
export const THREAD_SPOOL_M = 20;

export interface BeltStitchEdge {
  /** Nejdelší linie mezi začátkem a koncem, mm. */
  maxLengthMm: number;
  /** Otvory na jednu hranu (s otvory na obou koncích). */
  holes: number;
  /** Délka švu jedné hrany: (otvory − 1) × rozteč, mm. */
  seamMm: number;
  /** Nit na jednu hranu, m (nahoru na 0,1 m). */
  threadM: number;
}

export interface BeltStitchPlan {
  offsetMm: number;
  spacingMm: number;
  /** Začátek linie od ohybu u přezky = střed otvoru pro nýt blíž k ohybu. */
  startFromFoldMm: number;
  /** Totéž od konce pásu u přezky (rozložený konec). */
  startFromEndMm: number;
  /** Konec linie od vrcholu konce: tvar konce + jedna rozteč, nahoru na celé mm. */
  stopFromApexMm: number;
  /** Mezera mezi linií a hlavou nýtu (střed pásu), mm. */
  clearanceToRivetHeadMm: number;
  /** Na jednu hranu; `null` bez obvodu (délka pásu chybí). */
  perEdge: BeltStitchEdge | null;
  /** Obě hrany + nit na zkoušku, m; `null` bez obvodu. */
  totalThreadM: number | null;
  /** Kolik cívek 20 m; `null` bez obvodu. */
  spools: number | null;
}

const EPS = 1e-9;
const ceil10 = (v: number): number => Math.ceil(v * 10 - EPS) / 10;
const round1 = (v: number): number => Math.round(v * 10) / 10;

/**
 * Linie a nit ozdobného stehu pro pásek. `strapLengthMm` je délka pásu z obvodu
 * (`BeltConfigResult.strap.lengthMm`); bez ní se spočítá jen poloha linie.
 */
export function beltStitchPlan(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  shape: BeltTipShape,
  strapLengthMm: number | null,
): BeltStitchPlan {
  const spacingMm = STITCH_SPACING_MM;
  const offsetMm = STITCH_OFFSET_MM;
  const startFromFoldMm = end.rivetOffsetsMm[0];
  const startFromEndMm = round1(end.tailLengthMm + startFromFoldMm);
  const stopFromApexMm = Math.ceil(tipShapeLengthMm(tip, shape) + spacingMm - EPS);
  const clearanceToRivetHeadMm = round1(end.beltWidthMm / 2 - end.rivetHeadMm / 2 - offsetMm);

  let perEdge: BeltStitchEdge | null = null;
  if (strapLengthMm !== null) {
    const maxLengthMm = round1(strapLengthMm - startFromEndMm - stopFromApexMm);
    const holes = Math.floor(maxLengthMm / spacingMm + EPS) + 1;
    const seamMm = (holes - 1) * spacingMm;
    const threadM = ceil10((THREAD_FACTOR * seamMm) / 1000 + THREAD_RESERVE_M);
    perEdge = { maxLengthMm, holes, seamMm, threadM };
  }
  const totalThreadM = perEdge ? round1(2 * perEdge.threadM + PRACTICE_THREAD_M) : null;
  return {
    offsetMm,
    spacingMm,
    startFromFoldMm,
    startFromEndMm,
    stopFromApexMm,
    clearanceToRivetHeadMm,
    perEdge,
    totalThreadM,
    spools: totalThreadM === null ? null : Math.ceil(totalThreadM / THREAD_SPOOL_M - EPS),
  };
}
