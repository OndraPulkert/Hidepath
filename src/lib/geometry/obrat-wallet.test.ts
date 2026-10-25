import { describe, expect, it } from 'vitest';

import {
  OBRAT,
  OBRAT_COINS,
  OBRAT_REVISION,
  OBRAT_TEST_SETS,
  checkObrat,
  flapEdgeY,
  obratCapacityAudit,
  obratCells,
  obratClearances,
  obratCoinFit,
  obratGlueField,
  obratLayerStacks,
  obratLeatherLayout,
  obratLidEndX,
  obratParts,
  obratReview,
} from './obrat-wallet';

describe('OBRAT R11 – přišitá kapsa na mince', () => {
  it('výchozí střih projde všemi kontrolami a vejde se na A4 kůže', () => {
    expect(OBRAT_REVISION).toBe('R11');
    expect(checkObrat(OBRAT)).toEqual([]);
    const layout = obratLeatherLayout(OBRAT);
    expect(layout.fits).toBe(true);
    expect(layout.columnHeight).toBe(295);
    expect(layout.sideWidth).toBe(98);
  });

  it('má pět dílů z jedné usně: T1 a P s jedním ohybem, P a T3 přes celou šířku', () => {
    const parts = obratParts(OBRAT);
    expect(parts.map((p) => p.id)).toEqual(['T1', 'T2', 'P', 'T3', 'K']);
    const by = Object.fromEntries(parts.map((p) => [p.id, p]));
    expect(parts.map((p) => [p.id, p.face, p.width, p.height])).toEqual([
      ['T1', 'rub', 108, 146],
      ['T2', 'líc', 108, 75],
      ['P', 'rub', 108, 66],
      ['T3', 'líc', 108, 40],
      ['K', 'rub', 17, 17],
    ]);
    expect(by.T1!.lines.filter((l) => l.kind === 'fold')).toHaveLength(1);
    expect(by.P!.lines.filter((l) => l.kind === 'fold')).toHaveLength(1);
    expect(by.T1!.lines.filter((l) => l.kind === 'trim')).toHaveLength(1);
  });

  it('patice B na T3, C na T2, dva odlehčovací otvory v rozích zářezů P; A ani závěs už nejsou', () => {
    const marks = obratParts(OBRAT).flatMap((p) =>
      p.marks.map((m) => `${p.id}:${m.label}:${m.x};${m.y}`),
    );
    expect(marks).toEqual([
      'T2:C – patice:88;10.5',
      'P:odlehčení:7.5;26',
      'P:odlehčení:100.5;26',
      'T3:B – patice:54;8',
    ]);
    expect(OBRAT).not.toHaveProperty('snapA');
    expect(OBRAT).not.toHaveProperty('bandEndAllowance');
  });

  it('B je uprostřed v lepeném poli mezi dutinami', () => {
    expect(OBRAT.snapB).toEqual({ x: 54, y: 58 });
    expect(OBRAT.snapB.x).toBe(OBRAT.width / 2);
    expect(obratGlueField(OBRAT)).toEqual([40, 68]);
    const k = obratClearances(OBRAT);
    expect(k.capToDivider).toBe(7.5);
    expect(k.capToMouth).toBe(2);
    expect(k.capToLidFreeEdge).toBe(4);
    expect(k.capToLidEnd).toBe(38.5);
    expect(k.flangeToGlueField).toBe(8.5);
    expect(checkObrat({ ...OBRAT, snapB: { x: 30, y: 58 } })).toContain(
      'B není v poli mezi dutinami.',
    );
    expect(checkObrat({ ...OBRAT, snapB: { x: 46, y: 58 } })).toContain(
      'B zasahuje k dělicímu švu.',
    );
    expect(checkObrat({ ...OBRAT, snapB: { x: 54, y: 56 } })).toContain(
      'Příruba patice B není celá v lepeném poli pod T3.',
    );
    expect(checkObrat({ ...OBRAT, snapB: { x: 54, y: 60 } })).toContain(
      'Víčko nepřesahuje objímku B o 3 mm.',
    );
  });

  it('víčko má oba konce šikmé zrcadlově o 2,5 mm, od linie švu 4 mm u ohybu', () => {
    expect(obratLidEndX(OBRAT, OBRAT.lidFoldY)).toBe(7.5);
    expect(obratLidEndX(OBRAT, OBRAT.lidBottomY)).toBe(10);
    const review = obratReview(OBRAT);
    expect(review.lid.atFold).toEqual([7.5, 100.5]);
    expect(review.lid.atFreeEdge).toEqual([10, 98]);
    const P = obratParts(OBRAT).find((p) => p.id === 'P')!;
    // obrys P je souměrný podle svislé osy
    const xs = [...P.outline.matchAll(/([\d.]+) ([\d.]+)/g)].map((m) => Number(m[1]));
    for (const x of xs) expect(xs.some((o) => Math.abs(o - (OBRAT.width - x)) < 1e-6)).toBe(true);
    expect(obratClearances(OBRAT).lidFoldToSeam).toBe(4);
    expect(checkObrat({ ...OBRAT, lidInset: 6.5 })).toContain(
      'Konec víčka u ohybu je blíž než 3,5 mm k linii švu.',
    );
    expect(checkObrat({ ...OBRAT, lidInset: 14 })).toContain(
      'Víčko nechává u boku nekryté ústí, kudy projde mince.',
    );
  });

  it('dutiny 37 + 37 mm pojmou zkušební skladby, všechny trojice i čtveřice', () => {
    expect(OBRAT_COINS['5']).toMatchObject({ diameter: 23, thickness: 1.85 });
    expect(obratCells(OBRAT).map((c) => [c.left, c.right, c.seamSpan, c.usableWidth])).toEqual([
      [3.5, 40.5, 37, 35],
      [67.5, 104.5, 37, 35],
    ]);
    for (const set of OBRAT_TEST_SETS)
      set.cells.forEach((stack, i) =>
        expect(obratCoinFit(OBRAT, i, stack).passesEnvelope).toBe(true),
      );
    expect(obratCoinFit(OBRAT, 1, ['20', '10']).widthReserve).toBe(1.7);
    expect(obratCapacityAudit(OBRAT, 3).every((r) => r.split)).toBe(true);
    expect(obratCapacityAudit(OBRAT, 4).every((r) => r.split)).toBe(true);
    expect(obratClearances(OBRAT).dividerLength).toBe(28);
    expect(checkObrat({ ...OBRAT, dividerBottomGap: 3.5 })).toContain(
      'Dělicí šev nevychází na celé rozteče vidliček.',
    );
    expect(checkObrat({ ...OBRAT, dividerSeams: [35.5, 72.5] })).toContain(
      'Zkušební skladba „3 mince s 50 Kč“ neprojde obálkou.',
    );
  });

  it('lepení: tělo 5 mm, modul 4 mm, P na T2 celou plochou od y 52', () => {
    expect(OBRAT.bodyGlue).toBe(5);
    expect(OBRAT.faceGlueTop).toBe(52);
    expect(obratClearances(OBRAT).reliefToFaceGlue).toBe(1);
    expect(checkObrat({ ...OBRAT, faceGlueTop: 51.5 })).toContain(
      'Lepená plocha P–T2 zasahuje k odlehčovacímu otvoru.',
    );
    expect(checkObrat({ ...OBRAT, faceGlueTop: 57 })).toContain(
      'Mezi ústím a lepenou plochou P–T2 zůstává škvíra, kam zapadne mince.',
    );
  });

  it('vyboulení jen dopředu: 20 + 10 potřebuje vytvarovat T3, samotná 50 ne', () => {
    expect(obratCoinFit(OBRAT, 1, ['20', '10']).needsForming).toBe(true);
    expect(obratCoinFit(OBRAT, 0, ['50']).needsForming).toBe(false);
    expect(checkObrat({ ...OBRAT, glueBand: 5 })).toContain(
      'Lepený pás P–T3 nesouhlasí s průnikem lepidla do dutin.',
    );
  });

  it('klopa, C a kryt K Ø 17 zůstávají jako v R10', () => {
    expect(flapEdgeY(OBRAT, 108)).toBe(38);
    expect(OBRAT.snapC).toEqual({ x: 88, y: 25.5 });
    const k = obratClearances(OBRAT);
    expect(k.lidFoldToFlap15).toBeCloseTo(6.56, 2);
    expect(k.coverCToBodyGlue).toBe(6.5);
    expect(checkObrat({ ...OBRAT, snapC: { x: 88, y: 29 } })).toContain(
      'C nemá rezervu od švu klopy.',
    );
    expect(checkObrat({ ...OBRAT, snapC: { x: 86, y: 25.5 } })).toContain(
      'Kryt C zasahuje do výkusu.',
    );
  });

  it('tloušťky jsou nominální součty, U-šev kapsy jde přes 4 vrstvy', () => {
    const l = obratLayerStacks(OBRAT, ['50']);
    expect(l.coinZone.nominalMm).toBeCloseTo(12.69);
    const l2 = obratLayerStacks(OBRAT, ['20', '10']);
    expect(l2.coinZone.nominalMm).toBeCloseTo(15.24);
    expect(l2.coinZoneBelowLid.nominalMm).toBeCloseTo(14.04);
    expect(l.pocketSeam).toMatchObject({ leatherLayers: 4, nominalMm: 4.8, withGlueMm: 5.5 });
    expect(l.snapB.snapHeightMm).toBeNull();
    expect(l.measuredMaximum).toBeNull();
  });

  it('zastaví nesmyslné vstupy a neověřené výsledky neoznačí za fyzicky ověřené', () => {
    expect(checkObrat({ ...OBRAT, width: Number.NaN })).not.toEqual([]);
    expect(checkObrat({ ...OBRAT, measuredLeatherMax: 1 })).not.toEqual([]);
    expect(() => obratCoinFit(OBRAT, 5, ['1'])).toThrow();
    const review = obratReview(OBRAT);
    expect(review.physicalVerification).toBe('not-performed');
    expect(review.errors).toEqual([]);
    expect(review.openPhysicalChecks.some((t) => t.includes('4 vrstvy'))).toBe(true);
  });
});
