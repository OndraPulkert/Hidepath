import { describe, expect, it } from 'vitest';

import {
  BLOCK_ORIGIN,
  CALIBRATION_Y,
  PRACTICE_SHEET,
  ROUGH_MARGIN_MM,
  STRIP_ORIGIN,
  buildCoinHolderPracticeSvg,
  practiceFileStem,
} from './coin-card-holder-practice.ts';
import { coinCardHolderLayout } from '../src/lib/geometry/coin-card-holder.ts';
import {
  PRACTICE_STRIP,
  practiceSpecFor,
  practiceStripLayout,
} from '../src/lib/geometry/coin-card-holder-practice.ts';

const nums = (re: RegExp, s: string): number[][] =>
  [...s.matchAll(re)].map((m) => m.slice(1).map(Number));

describe('cvičný proužek k lekci 4 (pouzdro s mincí) – geometrie', () => {
  it.each([
    [1.2, 15.69, 8.66, 114.35, null],
    [1.5, 16.63, 9.92, 116.55, 1],
  ])('kůže %s mm: ohyby z modelu pásu, délka proužku', (t, a, b, len, skive) => {
    const P = practiceStripLayout(t);
    const L = coinCardHolderLayout(practiceSpecFor(t));
    expect(P.foldAMm).toBe(L.foldBackFrontMm);
    expect(P.foldBMm).toBe(L.foldFrontInnerMm);
    expect([P.foldAMm, P.foldBMm, P.stripLengthMm]).toEqual([a, b, len]);
    expect(P.foldSkiveThicknessMm).toBe(skive);
    expect(P.stripLengthMm).toBeCloseTo(3 * PRACTICE_STRIP.panelWidthMm + a + b, 6);
  });

  it.each([1.2, 1.5])('kůže %s mm: 6 otvorů na panel, krajní 5 mm, zrcadlené přes ohyby', (t) => {
    const P = practiceStripLayout(t);
    expect(P.holesPerPanel).toBe(6);
    expect(P.endHoleOffsetMm).toBe(5);
    expect(P.seamYMm).toBe(36.5);
    const [back, front, inner] = P.holeXsMm;
    expect(back[0]).toBe(5);
    expect(P.backX1Mm - back[5]).toBeCloseTo(5, 6);
    expect(front[0] - P.frontX0Mm).toBeCloseTo(5, 6);
    expect(P.frontX1Mm - front[5]).toBeCloseTo(5, 6);
    expect(inner[0] - P.innerX0Mm).toBeCloseTo(5, 6);
    expect(P.stripLengthMm - inner[5]).toBeCloseTo(5, 6);
    // Zrcadlení: vzdálenost od čáry ohybu je na obou stranách ohybu stejná.
    for (let i = 0; i < 6; i++) {
      expect(P.backX1Mm - back[5 - i]).toBeCloseTo(front[i] - P.frontX0Mm, 6);
      expect(inner[i] - P.innerX0Mm).toBeCloseTo(P.frontX1Mm - front[5 - i], 6);
    }
  });
});

describe.each([1.2, 1.5])('cvičný list pro kůži %s mm', (t) => {
  const svg = buildCoinHolderPracticeSvg(t);
  const P = practiceStripLayout(t);

  it('je A4 na výšku 1:1 s kontrolní úsečkou přesně 50 mm', () => {
    expect(svg).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
    const [[x0, y0, x1, y1]] = nums(
      /class="calibration" d="M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/g,
      svg,
    );
    expect(x1 - x0).toBeCloseTo(50, 6);
    expect(y0).toBe(y1);
    expect(svg).toContain('musí měřit přesně 50 mm');
  });

  it('obrys proužku má rozměry z modelu a leží uvnitř okraje 1,5 cm', () => {
    const [[x, y, h1, v, h2]] = nums(
      /class="outline" d="M([\d.]+) ([\d.]+) H([\d.]+) V([\d.]+) H([\d.]+) Z"/g,
      svg,
    );
    expect(x).toBe(STRIP_ORIGIN.x);
    expect(h1 - x).toBeCloseTo(P.stripLengthMm, 6);
    expect(v - y).toBeCloseTo(40, 6);
    expect(h2).toBe(x);
    expect(x - BLOCK_ORIGIN.x).toBe(ROUGH_MARGIN_MM);
    expect(BLOCK_ORIGIN.x + P.stripLengthMm + 2 * ROUGH_MARGIN_MM).toBeLessThanOrEqual(
      PRACTICE_SHEET.widthMm - PRACTICE_SHEET.marginMm,
    );
    expect(BLOCK_ORIGIN.y + 40 + 2 * ROUGH_MARGIN_MM).toBeLessThan(CALIBRATION_Y);
  });

  it('čáry ohybů ohraničují pásma A a B, 18 teček otvorů na čáře švu 3,5 mm od dolní hrany', () => {
    const folds = nums(/class="fold" d="M([\d.]+) /g, svg).map(([x]) => x - STRIP_ORIGIN.x);
    expect(folds[1] - folds[0]).toBeCloseTo(P.foldAMm, 6);
    expect(folds[3] - folds[2]).toBeCloseTo(P.foldBMm, 6);
    const holes = nums(/class="hole" cx="([\d.]+)" cy="([\d.]+)"/g, svg);
    expect(holes).toHaveLength(18);
    for (const [, cy] of holes) expect(STRIP_ORIGIN.y + 40 - cy).toBeCloseTo(3.5, 6);
    expect(holes.map(([cx]) => Math.round((cx - STRIP_ORIGIN.x) * 100) / 100)).toEqual(
      P.holeXsMm.flat(),
    );
    expect(svg).toContain(`OHYB A ${String(P.foldAMm).replace('.', ',')}`);
    expect(svg).toContain(`OHYB B ${String(P.foldBMm).replace('.', ',')}`);
  });

  it('přední panel z líce, zadní a vnitřní z rubu; list jde na líc', () => {
    expect(svg.match(/>otvory z LÍCE</g)?.length).toBe(1);
    expect(svg.match(/>otvory z RUBU</g)?.length).toBe(2);
    expect(svg).toContain('páskou na LÍC kůže');
  });

  it('šrafa ztenčení jen u kůže 1,5 mm: ohyb B a 3 mm na obě strany', () => {
    const zone = nums(/class="skive-zone" x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g, svg);
    if (t === 1.2) {
      expect(zone).toHaveLength(0);
      expect(svg).toContain('ohyby se neztenčují');
    } else {
      expect(zone).toHaveLength(1);
      expect(zone[0][1]).toBeCloseTo(P.foldBMm + 6, 6);
      expect(zone[0][0] - STRIP_ORIGIN.x).toBeCloseTo(P.frontX1Mm - 3, 6);
    }
  });
});

it('soubory: 1,5 mm bez přípony, 1,2 mm s příponou jako listy pásu', () => {
  expect(practiceFileStem(1.5)).toBe('pouzdro-mince-cvicny-prouzek');
  expect(practiceFileStem(1.2)).toBe('pouzdro-mince-cvicny-prouzek-kuze-1-2mm');
});
