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
    expect(r.keeper).toEqual({ lengthMm: 120, widthMm: 12 });
    expect(r.rivet).toMatchObject({ minMm: 5.5, maxMm: 6, postMm: 6 });
    expect(r.rivet.verified).toMatch(/10\/6/);
    expect(r.buckleEnd.rivetHolesFromEndMm).toEqual([16.8, 64.5, 115.5, 163.2]);
    expect(r.buckleEnd.slotFromEndMm).toEqual([77.5, 102.5]);
    expect(r.buckleEnd.foldedOpeningMm).toBe(12.5);
    expect(r.buckle).toEqual({ widthMm: 40, verified: true });
    expect(r.plate.usable).toBe(true);
    expect(r.tipSheetOrientation).toBe('portrait');
    expect(r.sheets).toEqual({ printable: true });
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
    // 3 vrstvy (zdvojený konec + volný konec) + π × 1,2 mm poutka + 15 mm přeplátování.
    expect([at(30, 3), at(30, 3.5), at(30, 4)]).toEqual([97, 100, 103]);
    expect([at(35, 3), at(40, 3.5)]).toEqual([107, 120]);
    expect([at(45, 3), at(45, 3.5), at(45, 4)]).toEqual([127, 130, 133]);
    expect(at(40, 3.5)).toBe(keeperStripLengthMm(DEFAULT_BELT_END));
  });

  it('dřík nýtu podle tloušťky: potvrzený dřík jen u 6 mm (10/6) pro 3,5–3,75 mm', () => {
    expect([3, 3.25, 3.5, 3.75, 4].map((t) => rivetPostMm(t).postMm)).toEqual([5, 5, 6, 6, 6.5]);
    expect(rivetPostMm(3).verified).toBeNull();
    expect(rivetPostMm(3.75).verified).not.toBeNull();
    expect(rivetPostMm(4).verified).toBeNull();
    const r = derive({ ...base, thicknessMm: 4 });
    expect(r.warnings.join(' ')).toMatch(/dříkem 6,5 mm má délku dříku jen v názvu/);
    expect(r.shopping.find((l) => l.item.startsWith('Šroubovací'))!.status).toBe('overte');
  });

  it('dřík z přesné změřené tloušťky (2 × t − 1,5 až 2 × t − 1)', () => {
    // 3,6 mm: 5,7–6,2 mm, 10/6 sedí.
    expect(rivetPostMm(3.6)).toMatchObject({ minMm: 5.7, maxMm: 6.2, postMm: 6 });
    expect(rivetPostMm(3.6).verified).toMatch(/10\/6/);
    // 3,4 mm: 5,3–5,8 mm – žádný nýt z ověřených nabídek, nic se nedomýšlí.
    const r = rivetPostMm(3.4);
    expect(r).toMatchObject({ minMm: 5.3, maxMm: 5.8, postMm: null, verified: null, options: [] });
    const d = derive({ ...base, thicknessMm: 3.4 });
    const line = d.shopping.find((l) => l.item.startsWith('Šroubovací'))!;
    expect(line.item).toBe('Šroubovací nýt (chicago), dřík 5,3–5,8 mm');
    expect(line.status).toBe('overte');
    expect(line.detail).toMatch(/ověřený nýt s takovým dříkem nemáme/);
    expect(d.warnings.join(' ')).toMatch(/Dřík 5,3–5,8 mm: takový nýt v ověřených nabídkách není/);
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
    const shopsOf = (r: ReturnType<typeof derive>) =>
      r.shopping[0]!.offers!.map((o) => [o.shop, o.lengthCm, o.priceCents]);
    const r40 = derive({ ...base, waistMm: 950 });
    // Od nejlevnější; výchozí zůstává CraftPoint (jedna zásilka s přezkou a nýty).
    expect(shopsOf(r40)).toEqual([
      ['Ecocase', 130, 27_900],
      ['CraftPoint', 130, 28_500],
      ['Imago', 130, 29_900],
      ['Křupson', 130, 29_900],
    ]);
    expect(r40.shopping[0]!.defaultOffer!.shop).toBe('CraftPoint');
    const r30 = derive({ ...base, widthMm: 30, waistMm: 950 });
    expect(shopsOf(r30).map(([, , c]) => c)).toEqual([22_800, 24_900, 25_900]);
    expect(r30.buckle.verified).toBe(true);
    const r45 = derive({ ...base, widthMm: 45, waistMm: 950 });
    expect(r45.buckle.verified).toBe(false);
    expect(r45.shopping[1]!.status).toBe('overte');
    // CraftPoint slibuje 130–140 cm: nad 106,5 cm obvodu už jeho pás nestačí. Imago a Křupson
    // činění neuvádějí, takže se samy nevyberou a pás je „ověřte“.
    const long = derive({ ...base, waistMm: 1070 }).shopping[0]!;
    expect(long.offers!.map((o) => o.shop)).toEqual(['Imago', 'Křupson']);
    expect(long.defaultOffer).toBeNull();
    expect(long.status).toBe('overte');
    // 32 mm CraftPoint nemá; Dva pásovci ano (skladem, třísločiněná).
    const r32 = derive({ ...base, widthMm: 32 }).shopping[0]!;
    expect(r32.status).toBe('overeno');
    expect(r32.defaultOffer!.shop).toBe('Dva pásovci');
    // 4 mm je mimo CraftPoint 3,0–3,5: výchozí Leatory 3,9 mm.
    const thick = derive({ ...base, thicknessMm: 4, waistMm: 950 }).shopping[0]!;
    expect(thick.defaultOffer!.shop).toBe('Leatory');
    expect(thick.offers!.map((o) => o.shop)).toEqual(['Leatory', 'Imago', 'Křupson', 'Andexnite']);
    expect(derive({ ...base, waistMm: 1200 }).shopping[0]!.offers!.map((o) => o.lengthCm)).toEqual([
      150, 150,
    ]);
  });

  it('nákup: na objednávku se pás sám nevybere, zůstane v nabídkách', () => {
    const r38 = derive({ ...base, widthMm: 38, waistMm: 950 }).shopping[0]!;
    expect(r38.defaultOffer!.shop).toBe('CraftPoint');
    const r44 = derive({ ...base, widthMm: 44, waistMm: 950 }).shopping[0]!;
    expect(r44.offers!.map((o) => [o.shop, o.availability])).toEqual([['Dva pásovci', 'preorder']]);
    expect(r44.defaultOffer).toBeNull();
    expect(r44.status).toBe('overte');
  });

  it('výsečník 6 mm jen jednou, když jsou dírky taky 6 mm', () => {
    const items = derive({ ...base, holeDiameterMm: 6 }).shopping.map((l) => l.item);
    expect(items.filter((i) => i.startsWith('Výsečník'))).toEqual(['Výsečník Ø 6 mm']);
  });
});

describe('parametrický pásek – meze', () => {
  it('pustí celý rozsah šířek 28–45 a libovolnou tloušťku 3,0–4,0', () => {
    for (let w = 28; w <= 45; w++) {
      for (const t of [3, 3.1, 3.25, 3.4, 3.5, 3.6, 3.75, 3.85, 4]) {
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
    expect(checkBeltConfig({ ...base, thicknessMm: 3.6 })).toEqual([]);
    expect(checkBeltConfig({ ...base, thicknessMm: 4.25 })[0]).toMatch(/3,0–4,0/);
    expect(checkBeltConfig({ ...base, thicknessMm: 2.9 })[0]).toMatch(/3,0–4,0/);
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

  it('když se dírky nevejdou na A4 ani na šířku, čísla spočítá a jen listy netiskne', () => {
    const input = { ...base, holeCount: 7, holeSpacingMm: 30, apexToFirstHoleMm: 100 };
    expect(checkBeltConfig(input)).toEqual([]);
    const r = derive({ ...input, waistMm: 950 });
    expect(r.holes.fromApexMm).toEqual([100, 130, 160, 190, 220, 250, 280]);
    expect(r.strap.lengthMm).toBe(950 + 90 + 190);
    expect(r.tipSheetOrientation).toBeNull();
    expect(r.sheets.printable).toBe(false);
    if (r.sheets.printable) return;
    expect(r.sheets.message).toMatch(/^List 2 se na A4 nevejde/);
    expect(r.sheets.message).toMatch(/list A4 pojme nejvýš 258 mm/);
    expect(r.sheets.message).toMatch(/Dírky a konec značte podle čísel v tabulce/);
    expect(r.sheets.message).toMatch(/List 1 \(konec u přezky a poutko\) se vytiskne/);
    // Regrese: list 1 na dírkách nezávisí, takže se vytiskne i bez listu 2.
    const sheets = beltSheetsFor(input);
    if (!sheets.ok) throw new Error(sheets.problems.join());
    expect(sheets.sheets.map((s) => s.id)).toEqual(['prezka']);
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
    expect(round7.sheets[1]!.orientation).toBe('landscape');
    expect(round7.sheets[1]!.title).toMatch(/zaoblený/);
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

describe('parametrický pásek – nálezy kontroly pásku (2026-10-08, kolo 2)', () => {
  it('naměřený pás 3,51–3,75 mm z CraftPointu zůstane v nabídce (tolerance dodávky)', () => {
    // Regrese: CraftPoint prodává 3–3,5 mm a pás přijde 3,5–3,75 mm (postup, krok 3);
    // naměřená hodnota nesmí vyřadit právě ten pás, který uživatel koupil.
    for (const [w, t] of [
      [35, 3.6],
      [30, 3.55],
      [35, 3.75],
    ] as const) {
      const strap = derive({ ...base, widthMm: w, thicknessMm: t, waistMm: 1000 }).shopping[0]!;
      expect(strap.status, `${w}/${t}`).toBe('overeno');
      expect(strap.defaultOffer!.shop).toBe('CraftPoint');
      expect(strap.defaultOffer!.note).toMatch(/po doručení přeměřte/);
    }
    const r40 = derive({ ...base, thicknessMm: 3.6, waistMm: 1000 }).shopping[0]!;
    expect(r40.offers!.map((o) => o.shop)).toEqual(
      expect.arrayContaining(['CraftPoint', 'Křupson']),
    );
    // Nad toleranci (3,76 mm a víc) CraftPoint už ne; 3,8 mm má Leatory.
    const r35 = derive({ ...base, widthMm: 35, thicknessMm: 3.8 }).shopping[0]!;
    expect(r35.offers!.map((o) => o.shop)).not.toContain('CraftPoint');
    expect(r35.defaultOffer!.shop).toBe('Leatory');
  });
});
