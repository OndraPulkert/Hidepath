import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  checkBeltTipSpec,
  keeperStripLengthMm,
  tipLengthMm,
} from '../geometry/belt-end';
import {
  type BeltConfigInput,
  DEFAULT_BELT_FORM,
  beltConfigToForm,
  beltSheetsFor,
  checkBeltConfig,
  deriveBeltConfig,
  minApexToFirstHoleMm,
  parseBeltConfigForm,
  plateApexToFirstHoleMm,
  plateCompatibility,
  rivetPostMm,
} from './belt-config';

const base: BeltConfigInput = { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' };

const derive = (input: BeltConfigInput) => {
  const out = deriveBeltConfig(input);
  if (!out.ok) throw new Error(out.problems.join('\n'));
  return out.result;
};

describe('parametrický pásek – výpočet', () => {
  it('výchozí pásek 40 × 3,5 mm odpovídá podkladům (opasek-parametry.md)', () => {
    const r = derive({ ...base, waistMm: 950 });
    expect(r.strap.allowanceMm).toBe(234.3);
    expect(r.strap.lengthMm).toBe(1184.3);
    expect(r.strap.minLengthCm).toBe(119);
    expect(r.holes.fromApexMm).toEqual([94.3, 119.3, 144.3, 169.3, 194.3]);
    expect(r.holes.middleFromApexMm).toBe(144.3);
    expect(r.holes.adjustmentMm).toBe(50);
    expect(r.tipLengthMm).toBe(38.5);
    expect(r.keeper).toEqual({ lengthMm: 109, widthMm: 12 });
    expect(r.rivet).toMatchObject({ minMm: 5.5, maxMm: 6, postMm: 6 });
    expect(r.rivet.verified).toMatch(/10\/6/);
    expect(r.buckleEnd.rivetHolesFromEndMm).toEqual([16.8, 64.5, 115.5, 163.2]);
    expect(r.buckleEnd.slotFromEndMm).toEqual([77.5, 102.5]);
    expect(r.buckleEnd.foldedOpeningMm).toBe(12.5);
    expect(r.buckle).toEqual({ widthMm: 40, verified: true });
    expect(r.plate.usable).toBe(true);
    expect(r.tipSheetOrientation).toBe('portrait');
  });

  it('130 cm stačí do obvodu 106,5 cm, 140 cm do 116,5 cm', () => {
    expect(derive({ ...base, waistMm: 1065 }).strap.minLengthCm).toBe(130);
    expect(derive({ ...base, waistMm: 1066 }).strap.minLengthCm).toBe(131);
    expect(derive({ ...base, waistMm: 1165 }).strap.minLengthCm).toBe(140);
  });

  it('bez obvodu spočítá všechno kromě délky pásu', () => {
    const r = derive(base);
    expect(r.strap.lengthMm).toBeNull();
    expect(r.strap.minLengthCm).toBeNull();
    expect(r.shopping[0]!.detail).toMatch(/zadejte obvod/);
  });

  it('délka hrotu podle šířky (tabulka v podkladech)', () => {
    const lengths = [28, 30, 35, 40, 45].map((w) => derive({ ...base, widthMm: w }).tipLengthMm);
    expect(lengths).toEqual([25.2, 27.4, 32.9, 38.5, 44]);
  });

  it('poutko podle šířky a tloušťky (tabulka v podkladech)', () => {
    const at = (w: number, t: number) =>
      derive({ ...base, widthMm: w, thicknessMm: t }).keeper.lengthMm;
    expect([at(30, 3), at(30, 3.5), at(30, 4)]).toEqual([87, 89, 91]);
    expect([at(45, 3), at(45, 3.5), at(45, 4)]).toEqual([117, 119, 121]);
    expect(at(40, 3.5)).toBe(keeperStripLengthMm(DEFAULT_BELT_END));
  });

  it('dřík nýtu podle tloušťky: ověřený jen 10/6 pro 3,5–3,75 mm', () => {
    expect([3, 3.25, 3.5, 3.75, 4].map((t) => rivetPostMm(t).postMm)).toEqual([5, 5, 6, 6, 7]);
    expect(rivetPostMm(3).verified).toBeNull();
    expect(rivetPostMm(3.75).verified).not.toBeNull();
    expect(rivetPostMm(4).verified).toBeNull();
    const r = derive({ ...base, thicknessMm: 4 });
    expect(r.warnings.join(' ')).toMatch(/dříkem 7 mm nemáme ověřený/);
    expect(r.shopping.find((l) => l.item.startsWith('Šroubovací'))!.status).toBe('overte');
  });

  it('zaoblený konec: poloměr = šířka/2, varování k ověření', () => {
    const r = derive({ ...base, tip: 'zaobleny', widthMm: 35 });
    expect(r.tipLengthMm).toBe(17.5);
    expect(r.shape).toBe('round');
    expect(r.warnings.join(' ')).toMatch(/Zaoblený konec .* Ověřte na odřezku/);
  });

  it('7 dírek: delší pás, větší rozsah, list na šířku, varování', () => {
    const r = derive({ ...base, holeCount: 7, waistMm: 950 });
    expect(r.strap.allowanceMm).toBe(259.3);
    expect(r.holes.adjustmentMm).toBe(75);
    expect(r.tipSheetOrientation).toBe('landscape');
    expect(r.warnings.join(' ')).toMatch(/jen 5 dírek/);
    expect(r.plate.usable).toBe(false);
  });

  it('nákup: přezka ověřená pro 30, 35 a 40 mm, pás podle šířky a tloušťky', () => {
    const r40 = derive({ ...base, waistMm: 950 });
    const strap = r40.shopping[0]!;
    expect(strap.offers!.map((o) => [o.lengthCm, o.priceCzk])).toEqual([
      [130, 285],
      [130, 299],
    ]);
    const r30 = derive({ ...base, widthMm: 30, waistMm: 950 });
    expect(r30.shopping[0]!.offers!.map((o) => o.priceCzk)).toEqual([228]);
    expect(r30.buckle.verified).toBe(true);
    const r45 = derive({ ...base, widthMm: 45, waistMm: 950 });
    expect(r45.buckle.verified).toBe(false);
    expect(r45.shopping[1]!.status).toBe('overte');
    // CraftPoint slibuje 130–140 cm: nad 106,5 cm obvodu už jeho pás nestačí.
    expect(derive({ ...base, waistMm: 1070 }).shopping[0]!.offers!.map((o) => o.shop)).toEqual([
      expect.stringMatching(/^Křupson/),
    ]);
    // 32 mm CraftPoint v nabídce neměl; 4 mm je mimo jeho 3,0–3,5.
    expect(derive({ ...base, widthMm: 32 }).shopping[0]!.status).toBe('overte');
    expect(
      derive({ ...base, thicknessMm: 4, waistMm: 950 }).shopping[0]!.offers!.map((o) => o.shop),
    ).toEqual([expect.stringMatching(/^Křupson/)]);
    expect(derive({ ...base, waistMm: 1200 }).shopping[0]!.offers!.map((o) => o.lengthCm)).toEqual([
      150,
    ]);
  });

  it('výsečník 6 mm jen jednou, když jsou dírky taky 6 mm', () => {
    const items = derive({ ...base, holeDiameterMm: 6 }).shopping.map((l) => l.item);
    expect(items.filter((i) => i.startsWith('Výsečník'))).toEqual(['Výsečník Ø 6 mm']);
  });
});

describe('parametrický pásek – meze', () => {
  it('pustí celý rozsah šířek 28–45 a tlouštěk 3,0–4,0 po 0,25', () => {
    for (let w = 28; w <= 45; w++) {
      for (const t of [3, 3.25, 3.5, 3.75, 4]) {
        for (const tip of ['hrot', 'zaobleny'] as const) {
          expect(checkBeltConfig({ widthMm: w, thicknessMm: t, tip }), `${w}/${t}/${tip}`).toEqual(
            [],
          );
        }
      }
    }
  });

  it('odmítne šířku, tloušťku a obvod mimo meze česky', () => {
    expect(checkBeltConfig({ ...base, widthMm: 27 })[0]).toMatch(/Šířka musí být/);
    expect(checkBeltConfig({ ...base, widthMm: 40.5 })[0]).toMatch(/celé číslo/);
    expect(checkBeltConfig({ ...base, thicknessMm: 3.6 })[0]).toMatch(/po 0,25/);
    expect(checkBeltConfig({ ...base, thicknessMm: 4.25 })[0]).toMatch(/3,0–4,0/);
    expect(checkBeltConfig({ ...base, waistMm: 500 })[0]).toMatch(/60–150 cm/);
    expect(checkBeltConfig({ ...base, holeCount: 4 })[0]).toMatch(/3, 5 nebo 7/);
    expect(checkBeltConfig({ ...base, holeDiameterMm: 5.2 })[0]).toMatch(/Ø dírky/);
  });

  it('kontroly modelu: rozteč a odstup za hrotem, česká desetinná čárka', () => {
    expect(checkBeltConfig({ ...base, holeSpacingMm: 10 })).toEqual([
      'Můstek mezi dírkami je 5,00 mm, minimum 6 mm.',
    ]);
    expect(checkBeltConfig({ ...base, widthMm: 45, apexToFirstHoleMm: 50 })[0]).toMatch(
      /koncem hrotu .* 3,52 mm/,
    );
  });

  it('nejmenší odstup první dírky: 47,0 mm u 40 mm, 52,5 mm u 45 mm (hrot)', () => {
    expect(minApexToFirstHoleMm(base)).toBeCloseTo(47.0, 1);
    expect(minApexToFirstHoleMm({ ...base, widthMm: 45 })).toBeCloseTo(52.5, 1);
    expect(minApexToFirstHoleMm({ ...base, tip: 'zaobleny' })).toBe(20 + 2.5 + 6);
  });

  it('zaoblený konec má vlastní kontrolu odstupu (r + Ø/2 + můstek)', () => {
    expect(checkBeltConfig({ ...base, tip: 'zaobleny', apexToFirstHoleMm: 28 })[0]).toMatch(
      /koncem oblouku/,
    );
    expect(checkBeltConfig({ ...base, tip: 'zaobleny', apexToFirstHoleMm: 30 })).toEqual([]);
    // Model sám: výchozí hrot pořád stejné hlášení.
    expect(checkBeltTipSpec({ ...DEFAULT_BELT_TIP, apexToFirstHoleMm: 40 })[0]).toMatch(
      /koncem hrotu/,
    );
  });

  it('když se dírky nevejdou na A4 ani na šířku, řekne to', () => {
    const p = checkBeltConfig({ ...base, holeCount: 7, holeSpacingMm: 30, apexToFirstHoleMm: 100 });
    expect(p[0]).toMatch(/list A4 pojme nejvýš 258 mm/);
  });

  it('délka hrotu z modelu sedí s `tipLengthMm`', () => {
    expect(derive({ ...base, widthMm: 33 }).tipLengthMm).toBe(
      Math.round(tipLengthMm({ ...DEFAULT_BELT_TIP, beltWidthMm: 33 }) * 10) / 10,
    );
  });
});

describe('destička (MK Plexi)', () => {
  it('hrot jde pro 28–45 s 5 dírkami po 25 mm', () => {
    for (const w of [28, 33, 45])
      expect(plateCompatibility({ ...base, widthMm: w }).usable).toBe(true);
  });

  it('zaoblený konec jen pro 40 a 30 mm; u 30 mm první dírka 89,3 mm', () => {
    expect(plateCompatibility({ ...base, tip: 'zaobleny' }).usable).toBe(true);
    const c35 = plateCompatibility({ ...base, tip: 'zaobleny', widthMm: 35 });
    expect(c35.usable).toBe(false);
    expect(c35.rows[0].ok).toBe(true);
    expect(c35.rows[1]).toMatchObject({
      row: 2,
      ok: false,
      reasons: ['oblouk je jen pro 30 a 40 mm'],
    });
    expect(plateApexToFirstHoleMm(30, 'zaobleny')).toBe(89.3);
    expect(plateApexToFirstHoleMm(35, 'zaobleny')).toBeNull();
    const r30 = derive({ ...base, tip: 'zaobleny', widthMm: 30 });
    expect(r30.holes.fromApexMm[0]).toBe(89.3);
    expect(r30.plate.usable).toBe(true);
  });

  it('jiný počet, rozteč nebo odstup dírek = vytisknout listy', () => {
    const c = plateCompatibility({
      ...base,
      holeCount: 3,
      holeSpacingMm: 20,
      apexToFirstHoleMm: 80,
    });
    expect(c.usable).toBe(false);
    expect(c.rows[1].reasons).toEqual([
      'destička má 5 dírek',
      'rozteč na destičce je 25 mm',
      'odstup první dírky na destičce je 94,3 mm',
    ]);
  });

  it('tloušťka ani Ø dírky destičku neovlivní; vodicí linka jen pro 30/35/40/45', () => {
    const c = plateCompatibility({ ...base, widthMm: 38, thicknessMm: 4, holeDiameterMm: 6 });
    expect(c.usable).toBe(true);
    expect(c.guideLine).toBe(false);
    expect(plateCompatibility(base).guideLine).toBe(true);
  });
});

describe('formulář', () => {
  it('přečte čárku i tečku, prázdné volitelné = výchozí, obvod v cm', () => {
    const parsed = parseBeltConfigForm({ ...DEFAULT_BELT_FORM, waist: '95,5', thickness: '3.75' });
    expect(parsed).toEqual({
      input: {
        widthMm: 40,
        thicknessMm: 3.75,
        waistMm: 955,
        tip: 'hrot',
        holeCount: 5,
        holeSpacingMm: undefined,
        apexToFirstHoleMm: undefined,
        holeDiameterMm: undefined,
      },
    });
  });

  it('chybějící šířka a nečíslo hlásí česky', () => {
    const parsed = parseBeltConfigForm({ ...DEFAULT_BELT_FORM, width: '', waist: 'abc' });
    expect(parsed).toEqual({
      problems: ['Zadejte šířku v mm (např. 40).', 'Obvod zadejte v cm (např. 95).'],
    });
  });

  it('formulář → zadání → formulář vrátí totéž', () => {
    const form = {
      ...DEFAULT_BELT_FORM,
      width: '35',
      thickness: '3,25',
      waist: '102,5',
      tip: 'zaobleny' as const,
      holeCount: '7',
      holeSpacing: '22',
      holeDiameter: '4,5',
      waistSource: 'metr' as const,
    };
    const parsed = parseBeltConfigForm(form);
    if ('problems' in parsed) throw new Error(parsed.problems.join());
    expect(beltConfigToForm(parsed.input, 'metr')).toEqual(form);
  });
});

describe('listy v prohlížeči', () => {
  it('vrátí dva listy, list 2 podle tvaru a počtu dírek', () => {
    const point = beltSheetsFor(base);
    if (!point.ok) throw new Error(point.problems.join());
    expect(point.sheets.map((s) => [s.id, s.orientation])).toEqual([
      ['prezka', 'portrait'],
      ['spicka', 'portrait'],
    ]);
    const round7 = beltSheetsFor({ ...base, tip: 'zaobleny', holeCount: 7 });
    if (!round7.ok) throw new Error(round7.problems.join());
    expect(round7.sheets[1].orientation).toBe('landscape');
    expect(round7.sheets[1].title).toMatch(/zaoblený/);
  });

  it('neplatné zadání listy nekreslí', () => {
    expect(beltSheetsFor({ ...base, widthMm: 50 })).toMatchObject({ ok: false });
  });
});

describe('parametrický pásek – nálezy kontroly (2026-10-08)', () => {
  it('výsečník bez zdroje v podkladech (5,5 mm) není „v podkladech“', () => {
    const punch = (d: number) =>
      derive({ ...base, holeDiameterMm: d }).shopping.find((l) =>
        l.item.startsWith(`Výsečník Ø ${String(d).replace('.', ',')} mm`),
      )!.status;
    expect(punch(5.5)).toBe('overte');
    expect(punch(4.5)).toBe('overeno');
    expect(punch(5)).toBe('overeno');
    expect(punch(6)).toBe('overeno');
  });

  it('nulová rozteč a odstup: srozumitelné české hlášení', () => {
    expect(checkBeltConfig({ ...base, holeSpacingMm: 0 })).toEqual([
      'Rozteč dírek musí být větší než 0 a nejvýš 50 mm.',
    ]);
    expect(checkBeltConfig({ ...base, apexToFirstHoleMm: 0 })).toEqual([
      'Odstup první dírky musí být větší než 0 a nejvýš 100 mm.',
    ]);
  });

  it('krátký odstup první dírky: hlášení řekne nejmenší odstup', () => {
    expect(checkBeltConfig({ ...base, widthMm: 45, apexToFirstHoleMm: 50 })).toContain(
      'Odstup první dírky aspoň 52,5 mm.',
    );
  });
});
