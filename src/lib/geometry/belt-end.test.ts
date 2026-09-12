import { describe, expect, it } from 'vitest';

import {
  type BeltEndSpec,
  type BeltTipSpec,
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  DEFAULT_BELT_PLATE,
  adjustmentRangeMm,
  apexToLastHoleMm,
  apexToMiddleHoleMm,
  checkBeltTipSpec,
  checkBeltPlate,
  holeOffsetsFromApexMm,
  middleHoleIndex,
  beltPlateLayout,
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
  rivetPostRangeMm,
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

  it('světlá kapsa pro poutko se počítá z hlaviček nýtů, ne z otvorů', () => {
    expect(keeperGapMm(DEFAULT_BELT_END)).toBeCloseTo(47.7, 6);
    // Poutko se opírá o hlavičky Ø 10 mm, ne o otvory Ø 6 mm: 47,7 − 10 = 37,7.
    expect(keeperPocketClearMm(DEFAULT_BELT_END)).toBeCloseTo(37.7, 6);
  });

  it('spočítá délku dříku nýtu a odhalí, že 6 mm na 4mm pás nestačí', () => {
    // Pravidlo z praxe: dřík o 1–1,5 mm kratší než tloušťka spoje (2× pás).
    const r = rivetPostRangeMm(DEFAULT_BELT_END);
    expect(r.minMm).toBeCloseTo(6.5, 6);
    expect(r.maxMm).toBeCloseTo(7, 6);
    expect(6, 'nýt 10/6 má dřík 6 mm').toBeLessThan(r.minMm);
    const thin = rivetPostRangeMm({ ...DEFAULT_BELT_END, beltThicknessMm: 3.5 });
    expect(6).toBeGreaterThanOrEqual(thin.minMm);
    expect(6).toBeLessThanOrEqual(thin.maxMm);
  });

  it('odmítne drážku širší než dlouhou a nekladné rozměry', () => {
    expect(checkBeltEndSpec({ ...DEFAULT_BELT_END, slotWidthMm: 30 }).join(' ')).toContain(
      'protnul sám sebou',
    );
    expect(checkBeltEndSpec({ ...DEFAULT_BELT_END, beltThicknessMm: 0 }).join(' ')).toContain(
      'beltThicknessMm musí být kladné',
    );
    expect(checkBeltEndSpec({ ...DEFAULT_BELT_END, rivetHeadMm: 6 }).join(' ')).toContain(
      'rivetHeadMm musí být větší',
    );
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

describe('plochá destička pro všechny šířky', () => {
  const L = beltPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP);

  it('kontrola žeber počítá s kerfem, ne s nominálem', () => {
    // `roundedSlotAsCutMm` neměla jedinou aserci: návrat kontroly na nominální
    // šířku slotu (tedy přesně ta chyba, kterou kerfové kolo opravovalo) byl zelený.
    const L = beltPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP, DEFAULT_BELT_PLATE);
    expect(L.roundedSlotAsCutMm).toBeCloseTo(
      DEFAULT_BELT_PLATE.roundedSlotWidthMm + DEFAULT_BELT_PLATE.kerfMm,
      9,
    );
    expect(L.roundedSlotAsCutMm).toBeGreaterThan(L.roundedSlotWidthMm);

    // Rozteč středních poloměrů je 2,5 mm, takže žebro po řezu je 2,5 − (1 + kerf).
    // S kerfem 0,2 vyjde 1,3 mm (limit 1,2 → projde), s kerfem 0,4 vyjde 1,1 mm
    // (limit 1,2 → musí spadnout). Kdyby kontrola měřila nominál, prošly by obě.
    const wide = { ...DEFAULT_BELT_PLATE, kerfMm: 0.4 };
    const problems = checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, wide);
    expect(problems.join(' '), 'kerf 0,4 mm musí shodit kontrolu žeber').toMatch(/[Žž]ebro/);
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, DEFAULT_BELT_PLATE)).toEqual([]);
  });

  it('sideMarginMm počítá s tím širším z otvorů, ne s tím prvním', () => {
    // Ve výchozí konfiguraci je rivetHoleMm === slotWidthMm === 6, takže záměna
    // max/min nebyla poznat. Tenhle případ je rozliší.
    const wideSlot = { ...DEFAULT_BELT_END, slotWidthMm: 10, rivetHoleMm: 6 };
    const wideRivet = { ...DEFAULT_BELT_END, slotWidthMm: 6, rivetHoleMm: 10 };
    expect(sideMarginMm(wideSlot)).toBeCloseTo(DEFAULT_BELT_END.beltWidthMm / 2 - 5, 9);
    expect(sideMarginMm(wideRivet)).toBeCloseTo(DEFAULT_BELT_END.beltWidthMm / 2 - 5, 9);
  });

  it('rozvržení projde kontrolami', () => {
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP)).toEqual([]);
  });

  it('koncové body zkosení pro všechny šířky leží na jedné přímce', () => {
    // Tohle je důvod, proč jeden vyříznutý tvar špičky stačí na každou šířku.
    const widest = { ...DEFAULT_BELT_TIP, beltWidthMm: DEFAULT_BELT_PLATE.maxBeltWidthMm };
    for (const w of [30, 32, 35, 38, 40, 45]) {
      const t = { ...DEFAULT_BELT_TIP, beltWidthMm: w };
      expect(tipHalfWidthAtMm(widest, tipLengthMm(t))).toBeCloseTo(w / 2, 6);
    }
  });

  it('je kompaktní destička, ne dlouhý pásek', () => {
    expect(L.plateWidthMm).toBe(215);
    expect(L.plateHeightMm).toBe(184);
    expect(L.minBeltWidthMm).toBe(28);
    expect(L.maxBeltWidthMm).toBe(45);
  });

  it('řada se špičkou drží špičku i všech pět dírek, aby stačilo jedno přiložení', () => {
    [110, 85, 60, 35, 10].forEach((x, i) => {
      expect(L.tipHoleXs[i]!, `dírka ${i + 1}`).toBeCloseTo(x, 6);
    });
    expect(L.middleHoleX).toBeCloseTo(60, 6);
    // Vrchol špičky je 144,3 mm od prostřední dírky, stejně jako na tiskové šabloně.
    expect(L.tipApexX - L.middleHoleX).toBeCloseTo(apexToMiddleHoleMm(DEFAULT_BELT_TIP), 6);
  });

  it('levá hrana destičky je konec pásu, takže ohyb leží 90 mm od ní', () => {
    expect(L.foldX).toBeCloseTo(DEFAULT_BELT_END.tailLengthMm, 6);
    [-73.2, -25.5, 25.5, 73.2].forEach((d, i) => {
      expect(L.rivetXs[i]! - L.foldX, `nýt ${i + 1}`).toBeCloseTo(d, 6);
    });
  });

  it('má tři řady a jsou od sebe dál než nejširší pás', () => {
    expect(L.roundedRowY - L.tipRowY).toBeGreaterThan(L.maxBeltWidthMm);
    expect(L.buckleRowY - L.roundedRowY).toBeGreaterThan(L.maxBeltWidthMm);
  });

  it('zaoblený konec: soustředné oblouky s konstantními žebry', () => {
    expect(L.roundedArcs.length).toBe(DEFAULT_BELT_PLATE.guideWidthsMm.length);
    // Společný střed. Varianta se společným vrcholem by se v něm sbíhala a žebra
    // by tam měla nulovou šířku.
    const centres = new Set(L.roundedArcs.map((a) => a.centreX));
    expect(centres.size, 'oblouky musí být soustředné').toBe(1);
    const radii = L.roundedArcs.map((a) => a.radiusMm).sort((a, b) => a - b);
    expect(radii).toEqual([15, 17.5, 20, 22.5]);
    for (let i = 1; i < radii.length; i++) {
      const rib = radii[i]! - radii[i - 1]! - L.roundedSlotWidthMm;
      expect(rib, `žebro mezi ${radii[i - 1]!} a ${radii[i]!}`).toBeCloseTo(1.5, 6);
    }
  });

  it('konec každého oblouku leží na lince své šířky, takže se označují navzájem', () => {
    for (const arc of L.roundedArcs) {
      const line = L.guides.find((g) => Math.abs(g.offsetMm - arc.radiusMm) < 1e-9);
      expect(line, `linka pro oblouk ${arc.beltWidthMm} mm`).toBeDefined();
      expect(line!.beltWidthMm).toBe(arc.beltWidthMm);
    }
  });

  it('odmítne slot, do kterého se nedostane šídlo', () => {
    // Dřík běžného kulatého šídla má 3 mm nad hrotem 0,6 mm; tupé 1,2 mm.
    const narrow = { ...DEFAULT_BELT_PLATE, roundedSlotWidthMm: 0.6 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, narrow).join(' ')).toContain(
      'rýsovací šídlo',
    );
  });

  it('výřez špičky je u vrcholu dost široký na šídlo', () => {
    // 0,2 mm od vrcholu má výřez 2,5 mm, tedy víc než dřík i tupého šídla (1,2 mm).
    expect(2 * tipHalfWidthAtMm(DEFAULT_BELT_TIP, 0.2)).toBeGreaterThan(1.2);
    expect(2 * tipHalfWidthAtMm(DEFAULT_BELT_TIP, 0.2)).toBeCloseTo(2.5, 1);
  });

  it('odmítne příliš tenká žebra mezi oblouky', () => {
    const thin = { ...DEFAULT_BELT_PLATE, roundedSlotWidthMm: 2 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, thin).join(' ')).toContain('Žebro');
  });

  it('nejužší podporovaná šířka projde, o milimetr širší značky mimo osu už ne', () => {
    // Dřív tu byla tautologie: minBeltWidthMm = 2*(offAxis+2), takže levá strana
    // byla identicky 2 pro jakékoli vstupy a test nemohl selhat.
    expect(
      checkBeltPlate(DEFAULT_BELT_END, { ...DEFAULT_BELT_TIP, beltWidthMm: L.minBeltWidthMm }),
    ).toEqual([]);
    const tooWide = { ...DEFAULT_BELT_PLATE, offAxisMarkMm: L.maxBeltWidthMm / 2 - 1 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, tooWide).join(' ')).toContain(
      'mimo nejširší',
    );
  });

  it('odmítne prázdný i přeplněný seznam vodicích šířek', () => {
    const empty = { ...DEFAULT_BELT_PLATE, guideWidthsMm: [] };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, empty).join(' ')).toContain(
      'prázdné',
    );
    const many = { ...DEFAULT_BELT_PLATE, guideWidthsMm: [26, 30, 35, 40, 45] };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, many).join(' ')).toContain(
      'maximum jsou 4',
    );
  });

  it('odmítne destičku užší než pás', () => {
    const problems = checkBeltPlate(DEFAULT_BELT_END, { ...DEFAULT_BELT_TIP, beltWidthMm: 50 });
    expect(problems.join(' ')).toContain('užší než pás');
  });

  it('odmítne příliš malý rozestup řad', () => {
    const tight = { ...DEFAULT_BELT_PLATE, rowPitchMm: 46 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, tight).join(' ')).toContain(
      'Mezi řadou',
    );
  });

  it('vyříznutá špička se zužuje SMĚREM OD dírek, ne k nim', () => {
    // Regrese: první verze měla trojúhelník obráceně – pás by se rozšiřoval za vrcholem.
    // Vrchol musí být dál od dírek než široký konec.
    const nearestHole = Math.max(...L.tipHoleXs);
    expect(L.tipFarX).toBeGreaterThan(nearestHole);
    expect(L.tipApexX).toBeGreaterThan(L.tipFarX);
    // Vrchol je 144,3 mm od prostřední dírky, jako na tiskové šabloně.
    expect(L.tipApexX - L.middleHoleX).toBeCloseTo(apexToMiddleHoleMm(DEFAULT_BELT_TIP), 6);
  });

  it('podélné pravítko pokryje i nejdelší pásek na poutko', () => {
    expect(L.rulerLengthMm).toBeGreaterThanOrEqual(L.maxKeeperStripMm);
    // Přehnaně velký výřez špičky posune jeho široký konec doleva a pravítko zkrátí.
    const huge = { ...DEFAULT_BELT_PLATE, tipCutoutOversizeMm: 40 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, huge).join(' ')).toContain(
      'Pravítko má',
    );
  });

  it('vyříznutá špička je širší než nejširší pás, aby její příčná hrana nebyla na kůži', () => {
    expect(L.tipCutoutHalfMm).toBeGreaterThan(L.maxBeltWidthMm / 2);
    // U nejširšího podporovaného pásu leží uzavírací hrana 5 mm za jeho okrajem.
    expect(L.tipCutoutHalfMm - L.maxBeltWidthMm / 2).toBeCloseTo(5, 6);
    const flush = { ...DEFAULT_BELT_PLATE, tipCutoutOversizeMm: 0 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, flush).join(' ')).toContain(
      'ležela na kůži',
    );
  });

  it('zkosení rohu nesmí zasáhnout do pásma, kde leží pás', () => {
    expect(L.strapEndChamferMm).toBeGreaterThan(0);
    const big = { ...DEFAULT_BELT_PLATE, strapEndChamferMm: 20 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, big).join(' ')).toContain(
      'zkosení levého horního rohu',
    );
  });

  it('odmítne značky mimo osu mimo nejširší pás', () => {
    const wide = { ...DEFAULT_BELT_PLATE, offAxisMarkMm: 22 };
    expect(checkBeltPlate(DEFAULT_BELT_END, DEFAULT_BELT_TIP, wide).join(' ')).toContain(
      'mimo nejširší',
    );
  });
});
