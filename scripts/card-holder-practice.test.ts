import { describe, expect, it } from 'vitest';

import {
  BLOCK_H,
  BLOCK_W,
  FOOTER_TOP,
  LAYERS,
  PRACTICE_SHAPE,
  PRACTICE_SHEET,
  ROUGH_MARGIN_MM,
  blockOrigin,
  buildPracticeSheetSvg,
  offcutFootprint,
} from './card-holder-practice.ts';

const svg = buildPracticeSheetSvg();

function layer(id: string): string {
  const m = new RegExp(`<g id="${id}"[^>]*>(.*?)</g>(?=<g id=|</svg>)`, 's').exec(svg);
  if (!m) throw new Error(`Vrstva ${id} chybí`);
  return m[1];
}

/** Rozsah souřadnic (x, y) příkazů M/L/H/V/A v cestě. */
function bbox(d: string): { x0: number; y0: number; x1: number; y1: number } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const m of d.matchAll(/([ML])([\d.]+) ([\d.]+)/g)) {
    xs.push(Number(m[2]));
    ys.push(Number(m[3]));
  }
  for (const m of d.matchAll(/A[\d.]+ [\d.]+ 0 [01] [01] ([\d.]+) ([\d.]+)/g)) {
    xs.push(Number(m[1]));
    ys.push(Number(m[2]));
  }
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

describe('cvičná šablona k lekci 2 (pouzdro na karty)', () => {
  it('je A4 na výšku s vrstvami CUT a GUIDE, text jen v GUIDE', () => {
    expect(svg).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
    expect([...svg.matchAll(/<g id="([A-Z]+)"/g)].map((m) => m[1])).toEqual([...LAYERS]);
    expect(layer('CUT')).not.toContain('<text');
  });

  it('má kontrolní úsečku přesně 50 mm a pokyn k tisku na 100 %', () => {
    const cal = /class="calibration" d="M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/.exec(svg)!;
    expect(Number(cal[3]) - Number(cal[1])).toBeCloseTo(50, 6);
    expect(cal[2]).toBe(cal[4]);
    expect(svg).toContain('PRINT AT 100% / ACTUAL SIZE');
  });

  it('tři obrysy 60 × 40 mm, každý uvnitř čárkovaného okraje 1,5 cm', () => {
    const outlines = [...layer('CUT').matchAll(/class="outline" d="([^"]+)"/g)].map((m) => m[1]);
    const margins = [...layer('GUIDE').matchAll(/class="rough-margin" d="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(outlines).toHaveLength(3);
    expect(margins).toHaveLength(3);
    outlines.forEach((d, i) => {
      const b = bbox(d);
      expect(b.x1 - b.x0).toBeCloseTo(PRACTICE_SHAPE.widthMm, 6);
      expect(b.y1 - b.y0).toBeCloseTo(PRACTICE_SHAPE.heightMm, 6);
      const o = blockOrigin(i);
      expect(b.x0 - o.x).toBeCloseTo(ROUGH_MARGIN_MM, 6);
      expect(b.y0 - o.y).toBeCloseTo(ROUGH_MARGIN_MM, 6);
    });
    expect(margins.map((d) => d.includes('A'))).toEqual([false, false, false]);
  });

  it('tvar 2 má roh R10 a tvar 3 výřez 20 × 12 mm s dnem R10 a dvěma tečkami na hraně', () => {
    const outlines = [...layer('CUT').matchAll(/class="outline" d="([^"]+)"/g)].map((m) => m[1]);
    expect(outlines[0]).not.toContain('A');
    expect(outlines[1]).toMatch(/A10 10 0 0 1 /);
    expect(outlines[2]).toMatch(/A10 10 0 0 0 /);
    const { x, y } = blockOrigin(2);
    const top = y + ROUGH_MARGIN_MM;
    const xc = x + ROUGH_MARGIN_MM + PRACTICE_SHAPE.widthMm / 2;
    // Nejhlubší bod výřezu je 12 mm pod hranou (konec rovných boků 2 mm + poloměr 10 mm).
    expect(outlines[2]).toContain(`L${xc - 10} ${top + 2} A10 10 0 0 0 ${xc + 10} ${top + 2}`);
    const pricks = [...layer('GUIDE').matchAll(/class="prick" cx="([\d.]+)" cy="([\d.]+)"/g)].map(
      (m) => [Number(m[1]), Number(m[2])],
    );
    expect(pricks).toEqual([
      [xc - 10, top],
      [xc + 10, top],
    ]);
  });

  it('výřez se řeže jako v lekci 5: krátkými rovnými řezy od čáry k čáře, ne obloukem', () => {
    const text = svg.replace(/<[^>]+>/g, ' ');
    expect(text).toContain('krátké rovné řezy, každý od čáry k čáře');
    expect(text).not.toContain('výřez pomalu');
  });

  it('bloky se nepřekrývají a nezasahují do patičky ani mimo list', () => {
    for (let i = 0; i < 3; i++) {
      const o = blockOrigin(i);
      expect(o.x).toBeGreaterThanOrEqual(PRACTICE_SHEET.marginMm);
      expect(o.x + BLOCK_W).toBeLessThanOrEqual(PRACTICE_SHEET.widthMm - PRACTICE_SHEET.marginMm);
      if (i > 0) expect(o.y).toBeGreaterThan(blockOrigin(i - 1).y + BLOCK_H);
    }
    expect(blockOrigin(2).y + BLOCK_H).toBeLessThanOrEqual(FOOTER_TOP);
  });

  it('na odřezku 210 × 80 mm zaberou tři tvary 210 × 40 mm, s okrajem papíru 70 mm na výšku', () => {
    expect(offcutFootprint()).toEqual({ widthMm: 210, heightMm: 40, paperHeightMm: 70 });
    expect(svg).toContain('210 × 40 mm kůže');
  });
});
