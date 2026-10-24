import { describe, expect, it } from 'vitest';

import {
  OBRAT,
  OBRAT_COINS,
  OBRAT_TEST_SETS,
  checkObrat,
  flapEdgeY,
  obratCapacityAudit,
  obratCells,
  obratCoinFit,
  obratLayerStacks,
  obratLeatherLayout,
  obratParts,
  obratBandRetraction,
  obratReview,
} from './obrat-wallet';

describe('OBRAT R10 – zjednodušená konstrukce s rezervami', () => {
  it('výchozí střih projde všemi kontrolami a vejde se na A4 kůže', () => {
    expect(checkObrat(OBRAT)).toEqual([]);
    expect(obratLeatherLayout(OBRAT).fits).toBe(true);
  });

  it('má šest dílů z jedné usně, T1 a P s jedním ohybem', () => {
    const parts = obratParts(OBRAT);
    expect(parts.map((p) => p.id)).toEqual(['T1', 'T2', 'P', 'T3', 'K', 'KC']);
    const by = Object.fromEntries(parts.map((p) => [p.id, p]));
    expect(by.T1!.lines.filter((l) => l.kind === 'fold')).toHaveLength(1);
    expect(by.P!.lines.filter((l) => l.kind === 'fold')).toHaveLength(1);
    expect(by.T1!.lines.filter((l) => l.kind === 'trim')).toHaveLength(1);
    expect(by.T1!.height).toBeCloseTo(
      OBRAT.height + OBRAT.flapFoldAllowance + OBRAT.flapTrimReserve + OBRAT.flapEndY,
    );
    expect(by.T3!.width).toBe(95.5);
    expect(by.K!.width).toBe(13);
    expect(by.KC!.width).toBe(17);
  });

  it('patice jsou na rozměrech listu, objímky až podle obtisku', () => {
    const marks = obratParts(OBRAT).flatMap((p) => p.marks.map((m) => `${p.id}:${m.label}`));
    expect(marks).toEqual(['T2:A – patice', 'T2:C – patice', 'P:odlehčení', 'T3:B – patice']);
  });

  it('B je na volném konci v jazýčku T3, mimo dutiny', () => {
    expect(OBRAT.snapB.x).toBeLessThan(OBRAT.cellSeams[0] - OBRAT.seamOffset);
    expect(checkObrat({ ...OBRAT, snapB: { x: 18, y: 59 } })).toContain(
      'B zasahuje k levému švu dutin.',
    );
    expect(checkObrat({ ...OBRAT, coinTab: { left: 4, bottomY: 64 } })).toContain(
      'Příruba patice B není celá pod jazýčkem.',
    );
  });

  it('rezervy z kontroly vyrobitelnosti (R10): C 3 mm od švu klopy, kryt A mimo lepené pásy', () => {
    const c = OBRAT.snapC;
    expect(flapEdgeY(OBRAT, c.x) - OBRAT.seamOffset - (c.y + OBRAT.coverRadius)).toBeGreaterThan(3);
    const a = OBRAT.snapA;
    expect(a.y - OBRAT.coverRadius - OBRAT.lidBottomY).toBeGreaterThanOrEqual(2.5);
    expect(checkObrat({ ...OBRAT, snapA: { x: 11, y: 77.25 } })).toContain(
      'Kryt A zasahuje do lepeného pásu boku.',
    );
    expect(checkObrat({ ...OBRAT, snapC: { x: 86, y: 25.5 } })).toContain(
      'Kryt C zasahuje do výkusu.',
    );
  });

  it('C respektuje šikmou hranu klopy i ozdobný šev', () => {
    expect(flapEdgeY(OBRAT, 108)).toBe(38);
    expect(checkObrat({ ...OBRAT, snapC: { x: 88, y: 29 } })).toContain(
      'C nemá rezervu od švu klopy.',
    );
  });

  it('víčko ani předek mincí nezasahují do ohybu závěsu, lepidlo odpovídá dutinám', () => {
    expect(checkObrat({ ...OBRAT, lidEndX: 102 })).toContain('Víčko zasahuje do ohybu závěsu.');
    expect(checkObrat({ ...OBRAT, lidEndTaper: 4 })).toContain(
      'Šikmý konec víčka nekryje pravý šev dutin.',
    );
    expect(checkObrat({ ...OBRAT, glueBand: 5 })).toContain(
      'Lepený pás T3 nesouhlasí s průnikem lepidla do dutin.',
    );
  });

  it('kapacita: 5 Kč podle ČNB, zkušební skladby projdou, čtveřice s 50 Kč ne', () => {
    expect(OBRAT_COINS['5']).toMatchObject({ diameter: 23, thickness: 1.85 });
    expect(obratCells(OBRAT).map((c) => c.usableWidth)).toEqual([34, 34]);
    for (const set of OBRAT_TEST_SETS)
      set.cells.forEach((stack, i) =>
        expect(obratCoinFit(OBRAT, i, stack).passesEnvelope).toBe(true),
      );
    const four = obratCapacityAudit(OBRAT, 4);
    expect(four).toHaveLength(126);
    expect(four.filter((r) => r.coins.includes('50')).every((r) => r.split === null)).toBe(true);
    expect(obratCoinFit(OBRAT, 0, ['50', '20']).passesEnvelope).toBe(false);
  });

  it('tloušťky jsou nominální součty, výška druků zůstává neznámá', () => {
    const l = obratLayerStacks(OBRAT, ['50']);
    expect(l.coinZone.nominalMm).toBeCloseTo(12.69);
    expect(obratLayerStacks(OBRAT, ['20', '10']).coinZone.nominalMm).toBeCloseTo(15.24);
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
  });

  it('pás má přídavek na vyboulení přes mince a objímka A zůstane od jeho konce', () => {
    expect(obratBandRetraction(OBRAT, [])).toBeLessThan(1);
    expect(obratBandRetraction(OBRAT, ['20', '10'])).toBeCloseTo(3.605);
    expect(obratParts(OBRAT).find((p) => p.id === 'P')!.width).toBe(110);
    expect(checkObrat({ ...OBRAT, bandEndAllowance: 0 })).toContain(
      'Plný pás nedosáhne do 2 mm od levé hrany.',
    );
  });
});
