import { describe, expect, it } from 'vitest';

import { DEFAULT_COIN_CARD_HOLDER, coinCardHolderLayout } from '@/lib/geometry/coin-card-holder';

/**
 * Verzovaný střih pouzdra s mincí (docs/generated/pouzdro-mince-sablona.svg) musí odpovídat
 * modelu: rozměry dílů v popiskách, průměr okna, kalibrační úsečka 50 mm, stránka A4 1:1.
 */
const svgs: Record<string, string> = import.meta.glob('/docs/generated/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const sheet = Object.entries(svgs).find(([k]) => k.endsWith('/pouzdro-mince-sablona.svg'))?.[1];
const cz = (n: number): string => (Math.round(n * 1000) / 1000).toString().replace('.', ',');

describe('střih pouzdra s mincí', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const L = coinCardHolderLayout(spec);

  it('existuje a je to A4 na výšku v milimetrech', () => {
    expect(sheet).toBeDefined();
    expect(sheet).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
  });

  it('popisky dílů odpovídají modelu', () => {
    expect(sheet).toContain(`${cz(L.panelWidthMm)} × ${cz(L.frontHeightMm)} mm`);
    expect(sheet).toContain(`${cz(L.panelWidthMm)} × ${cz(L.backHeightMm)} mm`);
    expect(sheet).toContain(`${cz(L.panelWidthMm)} × ${cz(L.dividerHeightMm)} mm`);
    expect(sheet).toContain(`okno Ø ${cz(L.windowDiameterMm)}`);
    expect(sheet).toContain(`mince Ø ${cz(spec.coinDiameterMm)}`);
    expect(sheet).toContain(`otvor Ø ${cz(L.formHoleDiameterMm)}`);
    expect(sheet).toContain(`${L.sideSeamHoles} otvorů na stranu`);
  });

  it('kalibrační úsečka měří 50 mm', () => {
    // Krajní značky jsou svislé úsečky ±2 mm kolem základny, základna sama je o 2 mm níž.
    const m = /M([\d.]+) ([\d.]+) V[\d.]+ M\1 ([\d.]+) H([\d.]+)/.exec(sheet ?? '');
    expect(m).not.toBeNull();
    expect(Number(m![4]) - Number(m![1])).toBeCloseTo(50, 6);
    expect(Number(m![3]) - Number(m![2])).toBeCloseTo(2, 6);
  });

  it('okno a mince jsou soustředné kružnice s poloměry z modelu', () => {
    const circles = [...(sheet ?? '').matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)]
      .map((m) => ({ cx: Number(m[1]), cy: Number(m[2]), r: Number(m[3]) }))
      .filter((c) => c.r > 5);
    const window = circles.find((c) => Math.abs(c.r - L.windowDiameterMm / 2) < 0.01);
    const coin = circles.find((c) => Math.abs(c.r - spec.coinDiameterMm / 2) < 0.01);
    expect(window, 'okno').toBeDefined();
    expect(coin, 'mince').toBeDefined();
    expect(window!.cx).toBeCloseTo(coin!.cx, 3);
    expect(window!.cy).toBeCloseTo(coin!.cy, 3);
  });

  it('počet teček stehu na bočních švech těla odpovídá modelu (2 panely × 2 strany)', () => {
    const dots = (sheet ?? '').match(/<circle [^>]*r="0\.45" fill/g) ?? [];
    // tělo: 4 švy; dělicí panel: 2 švy → 6 × holes; kapsa s mincí tečky nemá.
    expect(dots.length).toBe(6 * L.sideSeamHoles);
  });

  it('žádný prvek nevystupuje ze stránky', () => {
    const nums = [...(sheet ?? '').matchAll(/(?:cx|x)="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(Math.max(...nums)).toBeLessThanOrEqual(210);
    const ys = [...(sheet ?? '').matchAll(/(?:cy|y)="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(Math.max(...ys)).toBeLessThanOrEqual(297);
  });
});
