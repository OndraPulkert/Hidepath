import { describe, expect, it } from 'vitest';

import {
  type BeltEndSpec,
  type BeltTipSpec,
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  DEFAULT_MULTI_PLATE,
  adjustmentRangeMm,
  apexToLastHoleMm,
  apexToMiddleHoleMm,
  checkBeltTipSpec,
  checkMultiPlate,
  holeOffsetsFromApexMm,
  middleHoleIndex,
  multiPlateLayout,
  multiPlateMinBeltWidthMm,
  tipHalfWidthAtMm,
  tipLengthMm,
  tipTangentPoint,
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

describe('tvar anglické špičky', () => {
  const tip = (over: Partial<BeltTipSpec> = {}): BeltTipSpec => ({ ...DEFAULT_BELT_TIP, ...over });

  it('vrchol je zaoblený, ne ostrý', () => {
    expect(DEFAULT_BELT_TIP.noseRadiusMm).toBeGreaterThan(0);
    // Ostrý triangl by ve 1 mm od vrcholu měl poloviční šířku 0,52 mm; oblouk r = 4 mm dá 2,6 mm.
    expect(tipHalfWidthAtMm(DEFAULT_BELT_TIP, 1)).toBeGreaterThan(2);
  });

  it('bok je na zaoblení vrcholu tečný', () => {
    const tan = tipTangentPoint(DEFAULT_BELT_TIP);
    const r = DEFAULT_BELT_TIP.noseRadiusMm;
    // Bod dotyku musí ležet na kružnici o poloměru r se středem na střednici ve výšce r.
    expect(Math.hypot(tan.halfWidthMm, r - tan.fromApexMm)).toBeCloseTo(r, 3);
    expect(tan.fromApexMm).toBeCloseTo(2.35, 2);
    expect(tan.halfWidthMm).toBeCloseTo(3.64, 2);
  });

  it('délka hrotu je odvozená a odpovídá měření pro 40 i 35 mm pás', () => {
    // Odměřeno z PDF CraftPoint: pás 40 mm → rovný bok dosáhne plné šířky 38,4 mm
    // pod vrcholem, pás 35 mm → 32,7 mm. Sklon boku je u obou stejný (0,452 / 0,454),
    // takže délka hrotu není vstup, ale důsledek šířky.
    expect(tipLengthMm(DEFAULT_BELT_TIP)).toBeCloseTo(38.4, 0);
    expect(Math.abs(tipLengthMm(DEFAULT_BELT_TIP) - 38.4)).toBeLessThan(0.25);
    const narrow = tip({ beltWidthMm: 34.92 });
    expect(Math.abs(tipLengthMm(narrow) - 32.7)).toBeLessThan(0.25);
  });

  it('profil úzkého pásu odpovídá odměřenému 35mm pásu do 0,15 mm', () => {
    const narrow = tip({ beltWidthMm: 34.92 });
    const measured: [number, number][] = [
      [1.0, 2.56],
      [2.0, 3.45],
      [3.0, 3.96],
      [4.0, 4.42],
      [10.0, 7.18],
      [20.0, 11.66],
      [30.0, 16.23],
    ];
    for (const [y, half] of measured) {
      expect(Math.abs(tipHalfWidthAtMm(narrow, y) - half)).toBeLessThan(0.15);
    }
  });

  it('profil odpovídá špičce odměřené z PDF CraftPoint do 0,15 mm', () => {
    // Levá hrana odečtená z renderu 300 dpi, přepočtená na poloviční šířku.
    const measured: [number, number][] = [
      [0.5, 1.92],
      [1.0, 2.69],
      [1.5, 3.19],
      [2.5, 3.74],
      [3.0, 3.95],
      [3.5, 4.17],
      [4.0, 4.42],
      [21.0, 12.105],
      [38.0, 19.685],
    ];
    for (const [y, half] of measured) {
      // 0,15 mm: jeden konstantní sklon 0,453 pokrývá naměřené 0,4521 (pás 40 mm)
      // i 0,4542 (pás 35 mm). Rozdíl je pod přesností řezu nožem.
      expect(Math.abs(tipHalfWidthAtMm(DEFAULT_BELT_TIP, y) - half)).toBeLessThan(0.15);
    }
  });

  it('na začátku a na konci hrotu dává krajní hodnoty', () => {
    expect(tipHalfWidthAtMm(DEFAULT_BELT_TIP, 0)).toBe(0);
    expect(tipHalfWidthAtMm(DEFAULT_BELT_TIP, tipLengthMm(DEFAULT_BELT_TIP))).toBeCloseTo(20, 6);
  });

  it('odmítne ostrý hrot, nulový sklon i přehnané zaoblení', () => {
    expect(checkBeltTipSpec(tip({ noseRadiusMm: 0 })).join(' ')).toContain('ostrý hrot');
    expect(checkBeltTipSpec(tip({ taperSlope: 0 })).join(' ')).toContain('taperSlope');
    expect(checkBeltTipSpec(tip({ noseRadiusMm: 40 })).join(' ')).toContain('příliš velké');
  });
});

describe('univerzální deska pro všechny šířky', () => {
  const L = multiPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP);

  it('rozvržení projde kontrolami', () => {
    expect(checkMultiPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP)).toEqual([]);
  });

  it('koncové body zkosení pro všechny šířky leží na jedné přímce', () => {
    // Tohle je důvod, proč jedna deska stačí: jeden pár boků obsahuje každou šířku.
    for (const w of [30, 32, 35, 38, 40, 45]) {
      const t = { ...DEFAULT_BELT_TIP, beltWidthMm: w };
      // Poloviční šířka na konci hrotu se musí rovnat w/2 – tedy bod leží na téže přímce.
      expect(tipHalfWidthAtMm(t, tipLengthMm(t))).toBeCloseTo(w / 2, 6);
      // A tatáž funkce pro nejširší desku dá v té výšce stejnou hodnotu.
      const widest = { ...DEFAULT_BELT_TIP, beltWidthMm: 45 };
      expect(tipHalfWidthAtMm(widest, tipLengthMm(t))).toBeCloseTo(w / 2, 6);
    }
  });

  it('má správnou délku a polohy značek', () => {
    expect(L.plateWidthMm).toBe(45);
    expect(L.plateLengthMm).toBe(405);
    expect(L.tipHoleYs).toEqual([94.3, 119.3, 144.3, 169.3, 194.3]);
    expect(L.middleHoleY).toBeCloseTo(144.3, 6);
    expect(L.foldY).toBe(315);
    expect(L.rivetYs).toEqual([241.8, 289.5, 340.5, 388.2]);
    expect(L.slotY0).toBeCloseTo(302.5, 6);
    expect(L.slotY1).toBeCloseTo(327.5, 6);
    expect(L.bottomY).toBe(405);
  });

  it('spodní hrana desky je konec pásu, aby se podle ní dalo odříznout', () => {
    expect(L.bottomY - L.foldY).toBeCloseTo(DEFAULT_BELT_END.tailLengthMm, 6);
  });

  it('značky mimo osu leží na pásu i u nejužší podporované šířky', () => {
    const min = multiPlateMinBeltWidthMm(DEFAULT_MULTI_PLATE);
    expect(min).toBe(28);
    // U pásu 28 mm je hrana 14 mm od osy, značka 12 mm – tedy 2 mm od hrany.
    expect(min / 2 - DEFAULT_MULTI_PLATE.offAxisMarkMm).toBeCloseTo(2, 6);
  });

  it('odmítne desku užší než pás', () => {
    const problems = checkMultiPlate(DEFAULT_BELT_END, { ...DEFAULT_BELT_TIP, beltWidthMm: 50 });
    expect(problems.join(' ')).toContain('užší než pás');
  });

  it('odmítne rozvržení, kde by se značky dostaly k sobě blíž než minimální můstek', () => {
    const tight = { ...DEFAULT_MULTI_PLATE, apexToFoldMm: 250 };
    expect(checkMultiPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, tight).length).toBeGreaterThan(0);
  });

  it('odmítne značky mimo osu příliš u hrany desky', () => {
    const wide = { ...DEFAULT_MULTI_PLATE, offAxisMarkMm: 21 };
    expect(checkMultiPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, wide).join(' ')).toContain(
      'k hraně desky',
    );
  });
});
