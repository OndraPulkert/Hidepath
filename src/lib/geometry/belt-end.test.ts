import { describe, expect, it } from 'vitest';

import {
  type BeltEndSpec,
  type BeltTipSpec,
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  adjustmentRangeMm,
  apexToLastHoleMm,
  apexToMiddleHoleMm,
  checkBeltTipSpec,
  holeOffsetsFromApexMm,
  middleHoleIndex,
  totalStrapLengthMm,
  checkBeltEndSpec,
  doubledPerimeterMm,
  foldedSlotOpeningMm,
  keeperGapMm,
  keeperPocketClearMm,
  keeperStripLengthMm,
  ligamentMm,
  sideMarginMm,
  tailAfterFarRivetMm,
} from './belt-end.ts';

const spec = (over: Partial<BeltEndSpec> = {}): BeltEndSpec => ({ ...DEFAULT_BELT_END, ...over });

describe('rozměry konce opasku', () => {
  it('výchozí rozměry projdou kontrolou', () => {
    expect(checkBeltEndSpec(DEFAULT_BELT_END)).toEqual([]);
  });

  it('spočítá můstek mezi drážkou a bližším nýtem', () => {
    // 25,5 − 3 (poloměr otvoru) − 12,5 (polovina drážky) = 10
    expect(ligamentMm(DEFAULT_BELT_END)).toBeCloseTo(10, 6);
  });

  it('odmítne kombinaci drážky CraftPointu s nýty BFLG (regrese)', () => {
    // Přesně chyba první verze šablony: drážka 40 mm a nýt 25,5 mm dají můstek 2,5 mm.
    const bad = spec({ slotLengthMm: 40, slotWidthMm: 8 });
    expect(ligamentMm(bad)).toBeCloseTo(2.5, 6);
    expect(checkBeltEndSpec(bad).join(' ')).toContain('Můstek mezi drážkou');
  });

  it('kapsa pro poutko je rozteč nýtů a světlá kapsa je o průměr menší', () => {
    expect(keeperGapMm(DEFAULT_BELT_END)).toBeCloseTo(47.7, 6);
    expect(keeperPocketClearMm(DEFAULT_BELT_END)).toBeCloseTo(41.7, 6);
  });

  it('hlásí poutko širší než kapsa', () => {
    expect(checkBeltEndSpec(spec({ keeperWidthMm: 50 })).join(' ')).toContain('se nevejde');
  });

  it('hlásí příliš krátký přehnutý konec', () => {
    // 78 − (73,2 + 3) = 1,8 mm za nýtem
    expect(tailAfterFarRivetMm(spec({ tailLengthMm: 78 }))).toBeCloseTo(1.8, 6);
    expect(checkBeltEndSpec(spec({ tailLengthMm: 78 })).join(' ')).toContain('Za vzdálenějším');
  });

  it('hlásí nevzestupné polohy nýtů', () => {
    expect(checkBeltEndSpec(spec({ rivetOffsetsMm: [73.2, 25.5] })).join(' ')).toContain(
      'vzestupné',
    );
  });

  it('hlásí malý můstek k boční hraně u úzkého pásu', () => {
    // pás 14 mm: 7 − 3 = 4 mm k hraně
    expect(sideMarginMm(spec({ beltWidthMm: 14 }))).toBeCloseTo(4, 6);
    expect(checkBeltEndSpec(spec({ beltWidthMm: 14 })).join(' ')).toContain('boční hraně');
  });

  it('ohyb půlí drážku, takže složený otvor je poloviční', () => {
    expect(foldedSlotOpeningMm(DEFAULT_BELT_END)).toBeCloseTo(12.5, 6);
  });

  it('délka poutka je obvod zdvojené části plus přeplátování', () => {
    // 2 × (40 + 2 × 4) = 96; 96 + 15 = 111
    expect(doubledPerimeterMm(DEFAULT_BELT_END)).toBeCloseTo(96, 6);
    expect(keeperStripLengthMm(DEFAULT_BELT_END)).toBe(111);
  });

  it('tloušťka pásu mění jen délku poutka', () => {
    expect(keeperStripLengthMm(spec({ beltThicknessMm: 3 }))).toBe(107);
    expect(keeperStripLengthMm(spec({ beltThicknessMm: 5 }))).toBe(115);
  });
});

describe('konec se špičkou a dírkami', () => {
  const tip = (over: Partial<BeltTipSpec> = {}): BeltTipSpec => ({ ...DEFAULT_BELT_TIP, ...over });

  it('výchozí rozměry projdou kontrolou', () => {
    expect(checkBeltTipSpec(DEFAULT_BELT_TIP)).toEqual([]);
  });

  it('rozvrhne pět dírek po 25 mm od 94,3 mm za hrotem', () => {
    expect(holeOffsetsFromApexMm(DEFAULT_BELT_TIP)).toEqual([94.3, 119.3, 144.3, 169.3, 194.3]);
  });

  it('prostřední dírka je třetí a je 144,3 mm od hrotu', () => {
    expect(middleHoleIndex(DEFAULT_BELT_TIP)).toBe(2);
    expect(apexToMiddleHoleMm(DEFAULT_BELT_TIP)).toBeCloseTo(144.3, 6);
    expect(apexToLastHoleMm(DEFAULT_BELT_TIP)).toBeCloseTo(194.3, 6);
  });

  it('rozsah nastavení je dvě dírky na každou stranu, tedy 50 mm', () => {
    expect(adjustmentRangeMm(DEFAULT_BELT_TIP)).toBeCloseTo(50, 6);
  });

  it('odmítne párový počet dírek', () => {
    expect(checkBeltTipSpec(tip({ holeCount: 4 })).join(' ')).toContain('párový');
  });

  it('odmítne rozteč, která nechá mezi dírkami málo kůže', () => {
    expect(checkBeltTipSpec(tip({ holeSpacingMm: 9 })).join(' ')).toContain('mezi dírkami');
  });

  it('odmítne dírku příliš blízko za hrotem', () => {
    expect(checkBeltTipSpec(tip({ apexToFirstHoleMm: 42 })).join(' ')).toContain('koncem hrotu');
  });

  it('spočítá celkovou délku pásu z naměřeného obvodu', () => {
    // 950 + 90 (přehnutý konec této šablony) + 144,3 (od hrotu k prostřední dírce)
    expect(totalStrapLengthMm(950, DEFAULT_BELT_END, DEFAULT_BELT_TIP)).toBeCloseTo(1184.3, 6);
  });

  it('reprodukuje délku, kterou uvádí generátor CraftPoint (kontrola měření)', () => {
    // CraftPoint pro obvod 95 cm uvádí díl 1174,3 mm a má přehnutý konec 80 mm.
    // 950 + 80 + 144,3 = 1174,3 – souhlas na desetinu ověřuje obě odměřené hodnoty.
    const craftPointEnd: BeltEndSpec = { ...DEFAULT_BELT_END, tailLengthMm: 80 };
    expect(totalStrapLengthMm(950, craftPointEnd, DEFAULT_BELT_TIP)).toBeCloseTo(1174.3, 6);
    // A pro druhou ověřenou konfiguraci: obvod 85 cm → hotový rozměr 108 cm.
    expect(totalStrapLengthMm(850, craftPointEnd, DEFAULT_BELT_TIP)).toBeCloseTo(1074.3, 6);
  });
});
