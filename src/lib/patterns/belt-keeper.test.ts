import { describe, expect, it } from 'vitest';

import { DEFAULT_BELT_END, keeperStripLengthMm } from '../geometry/belt-end';
import {
  KEEPER_EXAMPLE_INPUT,
  KEEPER_OTHER_LEATHER_MM,
  keeperBlockText,
  keeperBreakdown,
  keeperCalculation,
  measuredDiffText,
  measuredIgnoredText,
  keeperExampleText,
  keeperPieceCm,
  keeperSkive,
  keeperSkiveText,
  keeperStripText,
} from './belt-keeper';

describe('poutko – délka a kus pásu', () => {
  it('40 × 3,5 mm z téhož řemene: obvod 101 + π × 3,5 + 15 = 127 mm, kus 14 cm', () => {
    const c = keeperCalculation({ beltWidthMm: 40, beltThicknessMm: 3.5 });
    expect(c).toMatchObject({
      fromStrap: true,
      thicknessMm: 3.5,
      computedWrapMm: 101,
      measuredWrapMm: null,
      wrapMm: 101,
      bendMm: 11,
      overlapMm: 15,
      lengthMm: 127,
      widthMm: 12,
      pieceCm: 14,
    });
    // Stejný vzorec jako model (3 vrstvy + π × tloušťka poutka + přeplátování).
    expect(c.lengthMm).toBe(keeperStripLengthMm({ ...DEFAULT_BELT_END, keeperThicknessMm: 3.5 }));
    expect(keeperStripText(c)).toBe('12 × 127 mm');
  });

  it('z jiné kůže: výchozí 1,2 mm dává dnešních 120 mm a pás se neprodlužuje', () => {
    const c = keeperCalculation({ beltWidthMm: 40, beltThicknessMm: 3.5, fromStrap: false });
    expect(KEEPER_OTHER_LEATHER_MM).toBe(1.2);
    expect(c).toMatchObject({ fromStrap: false, thicknessMm: 1.2, lengthMm: 120, pieceCm: 0 });
    expect(c.skive).toBeNull();
    expect(c.lengthMm).toBe(keeperStripLengthMm(DEFAULT_BELT_END));
    // Zadaná tloušťka jiné kůže se použije.
    expect(
      keeperCalculation({
        beltWidthMm: 40,
        beltThicknessMm: 3.5,
        fromStrap: false,
        otherThicknessMm: 2,
      }).lengthMm,
    ).toBe(Math.round(101 + Math.PI * 2 + 15));
  });

  it('změřený obvod přepíše spočítaný (proužek kolem 3 vrstev)', () => {
    const c = keeperCalculation({ beltWidthMm: 40, beltThicknessMm: 3.5, measuredWrapMm: 104 });
    expect(c).toMatchObject({
      computedWrapMm: 101,
      measuredWrapMm: 104,
      wrapMm: 104,
      lengthMm: 130,
    });
    expect(keeperBreakdown(c)[0]!.value).toBe('104 mm (změřený proužkem; spočítaný 101 mm)');
    // Prázdný nebo nesmyslný zápis = spočítaný obvod.
    for (const m of [null, undefined, 0, -3, Number.NaN]) {
      expect(
        keeperCalculation({ beltWidthMm: 40, beltThicknessMm: 3.5, measuredWrapMm: m }).lengthMm,
      ).toBe(127);
    }
  });

  it('kus pásu = délka + 10 mm, nahoru na cm', () => {
    expect(keeperPieceCm(127)).toBe(14);
    expect(keeperPieceCm(120)).toBe(13);
    expect(keeperPieceCm(121)).toBe(14);
  });

  it('rozpis: obvod + přídavek na tloušťku + 15 mm přeplátování', () => {
    const lines = keeperBreakdown(keeperCalculation({ beltWidthMm: 40, beltThicknessMm: 3.5 }));
    expect(lines).toEqual([
      { label: 'Obvod 3 vrstev', value: '101 mm (spočítaný: 2 × (40 + 3 × 3,5))' },
      { label: 'Přídavek na tloušťku', value: '+ 11 mm (π × 3,5 mm, tloušťka poutka)' },
      { label: 'Přeplátování', value: '+ 15 mm' },
      { label: 'Délka proužku', value: '= 127 mm (na celé mm)' },
    ]);
  });

  it('příklad pod kalkulačkou je spočítaný, ne opsaný', () => {
    expect(KEEPER_EXAMPLE_INPUT).toEqual({
      beltWidthMm: 40,
      beltThicknessMm: 3.5,
      fromStrap: true,
    });
    expect(keeperExampleText()).toBe(
      'Příklad: pás 40 × 3,5 mm, poutko z téhož řemene. Obvod 2 × (40 + 3 × 3,5) = 101 mm, přídavek π × 3,5 = 11 mm, přeplátování 15 mm: 101 + 11 + 15 = 127, tedy proužek 12 × 127 mm. Z pásu na něj uřízněte kus 14 cm.',
    );
  });
});

describe('poutko – ztenčení konců', () => {
  it('3,5 mm: klín 15 mm, konec 0,5–1 mm, v polovině asi 2,2 mm, spoj nejvýš 4,5 mm', () => {
    expect(keeperSkive(3.5)).toEqual({ wedgeMm: 15, endMm: [0.5, 1], midMm: 2.2, jointMaxMm: 4.5 });
    expect(keeperSkiveText(keeperSkive(3.5))).toBe(
      'klín 15 mm, na samém konci 0,5–1 mm, v polovině asi 2,2 mm; spoj na sucho nejvýš asi 4,5 mm',
    );
    expect(keeperSkive(4).jointMaxMm).toBe(5);
  });
});

describe('poutko: změřený obvod, špalík a spoj', () => {
  const mine = { beltWidthMm: 40, beltThicknessMm: 3.5, fromStrap: true } as const;

  it('změřený obvod mimo ± 15 % od spočítaného se nepoužije a kalkulačka řekne proč', () => {
    // Překlep 10 místo 101 mm: proužek zůstane ze spočítaného obvodu.
    const typo = keeperCalculation({ ...mine, measuredWrapMm: 10 });
    expect(typo.measuredWrapMm).toBeNull();
    expect(typo.measuredIgnoredMm).toBe(10);
    expect(typo.lengthMm).toBe(127);
    expect(measuredIgnoredText(typo)).toMatch(/liší o víc než 15 %: počítám se spočítaným/);
    // Obvod změřený na pásu 40 mm u pásku 30 × 3,0 mm (spočítaný 78 mm) je o víc než 15 % jiný.
    expect(
      keeperCalculation({ beltWidthMm: 30, beltThicknessMm: 3, measuredWrapMm: 101 })
        .measuredWrapMm,
    ).toBeNull();
    // 105 mm (o 4 % víc) se použije.
    const ok = keeperCalculation({ ...mine, measuredWrapMm: 105 });
    expect(ok.measuredWrapMm).toBe(105);
    expect(ok.lengthMm).toBe(131);
    expect(measuredIgnoredText(ok)).toBeNull();
  });

  it('změřený obvod dá jiný kus než nákup: kalkulačka to řekne', () => {
    const base = keeperCalculation(mine);
    expect(measuredDiffText(base, base)).toBeNull();
    const c = keeperCalculation({ ...mine, measuredWrapMm: 108 });
    expect(c.pieceCm).toBe(15);
    expect(measuredDiffText(c, base)).toBe(
      'Se změřeným obvodem je proužek 12 × 134 mm. Nákup, list 1 a lekce 2 počítají se spočítaným obvodem (12 × 127 mm). Kus pásu 15 cm je delší než 14 cm v nákupu a v lekci 2: ověřte, že vám pás stačí. Proužek řežte podle změřeného.',
    );
  });

  it('špalík: užší než pás, nejvýš 3 vrstvy pásu; spoj z pásu i z jiné kůže', () => {
    const c = keeperCalculation(mine);
    expect(c.block).toEqual({ widthMm: 35, maxThicknessMm: 10 });
    expect(c.jointMm).toBe(4.5);
    expect(keeperBlockText(c)).toBe(
      'asi 35 mm široký (užší než pás), nejvýš 10 mm silný (vnitřek poutka jsou 3 vrstvy pásu); spoj asi 4,5 mm',
    );
    const narrow = keeperCalculation({ beltWidthMm: 28, beltThicknessMm: 3 });
    expect(narrow.block).toEqual({ widthMm: 23, maxThicknessMm: 9 });
    const other = keeperCalculation({ ...mine, fromStrap: false });
    expect(other.jointMm).toBe(2.4);
  });
});
