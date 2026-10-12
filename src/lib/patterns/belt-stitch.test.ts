import { describe, expect, it } from 'vitest';

import { DEFAULT_BELT_END, DEFAULT_BELT_TIP, holeOffsetsFromApexMm } from '../geometry/belt-end';
import { type BeltConfigInput, beltSpecsFor, deriveBeltConfig } from './belt-config';
import {
  PRACTICE_THREAD_M,
  STITCH_OFFSET_MM,
  STITCH_SPACING_MM,
  THREAD_SPOOL_M,
  beltStitchPlan,
} from './belt-stitch';

const derive = (input: BeltConfigInput) => {
  const out = deriveBeltConfig(input);
  if (!out.ok) throw new Error(out.problems.join('\n'));
  return out.result;
};

describe('ozdobný steh na pásku (lekce 7)', () => {
  it('příklad 40 × 3,5 mm, hrot, obvod 950 mm', () => {
    const r = derive({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 });
    expect(r.strap.lengthMm).toBe(1184.3);
    const s = r.stitch;
    expect(s.offsetMm).toBe(4);
    expect(s.spacingMm).toBe(4);
    expect(s.startFromFoldMm).toBe(25.5);
    expect(s.startFromEndMm).toBe(115.5);
    expect(s.stopFromApexMm).toBe(43);
    expect(s.perEdge).toEqual({ maxLengthMm: 1025.8, holes: 257, seamMm: 1024, threadM: 5.5 });
    expect(s.totalThreadM).toBe(11.6);
    expect(s.spools).toBe(1);
  });

  it('zaoblený konec 40 mm končí 24 mm od vrcholu', () => {
    const s = derive({ widthMm: 40, thicknessMm: 3.5, tip: 'zaobleny', waistMm: 950 }).stitch;
    expect(s.stopFromApexMm).toBe(24);
    expect(s.perEdge).toMatchObject({ holes: 262, seamMm: 1044, threadM: 5.6 });
    expect(s.totalThreadM).toBe(11.8);
  });

  it('konec u hrotu 28 / 30 / 35 / 45 mm', () => {
    const stop = (widthMm: number) =>
      derive({ widthMm, thicknessMm: 3.5, tip: 'hrot' }).stitch.stopFromApexMm;
    expect([28, 30, 35, 45].map(stop)).toEqual([30, 32, 37, 48]);
  });

  it('nejdelší pás 130 cm (obvod 1065 mm) stačí jedna cívka 20 m', () => {
    const r = derive({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 1065 });
    expect(r.strap.lengthMm).toBe(1299.3);
    expect(r.stitch.perEdge).toMatchObject({ holes: 286, threadM: 6 });
    expect(r.stitch.totalThreadM).toBe(12.6);
    expect(r.stitch.totalThreadM!).toBeLessThanOrEqual(THREAD_SPOOL_M);
    expect(r.stitch.spools).toBe(1);
  });

  it.each([28, 30, 35, 40, 45])(
    'šířka %i mm: linie míjí hlavy nýtů, oválu i dírky a končí před první dírkou',
    (widthMm) => {
      for (const tip of ['hrot', 'zaobleny'] as const) {
        if (tip === 'zaobleny' && widthMm !== 30 && widthMm !== 40) continue;
        for (const holeDiameterMm of [4.5, 5, 6]) {
          const input: BeltConfigInput = {
            widthMm,
            thicknessMm: 3.5,
            tip,
            holeDiameterMm,
            waistMm: 900,
          };
          const r = derive(input);
          const s = r.stitch;
          expect(s.clearanceToRivetHeadMm).toBeGreaterThanOrEqual(4);
          // Dírky i ovál (šířka 6) jsou uprostřed pásu.
          expect(
            widthMm / 2 - Math.max(holeDiameterMm, 6) / 2 - STITCH_OFFSET_MM,
          ).toBeGreaterThanOrEqual(4);
          const { tip: spec } = beltSpecsFor(input);
          const firstHole = holeOffsetsFromApexMm(spec)[0]!;
          expect(s.stopFromApexMm).toBeLessThan(firstHole - holeDiameterMm / 2);
          expect(s.perEdge!.seamMm).toBeGreaterThan(0);
        }
      }
    },
  );

  it('bez obvodu se spočítá jen linie', () => {
    const s = derive({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot' }).stitch;
    expect(s.perEdge).toBeNull();
    expect(s.totalThreadM).toBeNull();
    expect(s.spools).toBeNull();
    expect(s.stopFromApexMm).toBe(43);
  });

  it('nit celkem = obě hrany + zkouška; otvory po rozteči 4 mm', () => {
    const s = beltStitchPlan(DEFAULT_BELT_END, DEFAULT_BELT_TIP, 'point', 1000);
    const e = s.perEdge!;
    expect(e.seamMm).toBe((e.holes - 1) * STITCH_SPACING_MM);
    expect(e.seamMm).toBeLessThanOrEqual(e.maxLengthMm);
    expect(e.maxLengthMm - e.seamMm).toBeLessThan(STITCH_SPACING_MM);
    expect(s.totalThreadM).toBeCloseTo(2 * e.threadM + PRACTICE_THREAD_M, 6);
  });
});
