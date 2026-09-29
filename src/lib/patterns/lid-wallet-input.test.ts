import { DEFAULT_LID_WALLET, lidWalletVariant } from '@/lib/geometry/lid-wallet';
import {
  type LidMeasuredInput,
  lidSheetsForMeasured,
  lidSpecFromMeasured,
  lidVariantLabel,
  parseMm,
} from '@/lib/patterns/lid-wallet-input';
import { buildLidSheets } from '@/lib/patterns/lid-wallet-sheets';

const base: LidMeasuredInput = {
  p1Mm: 1.0,
  dividerMm: 0.6,
  liningMm: 0.6,
  skiveFold: false,
  skiveHinge: false,
};

describe('listy peněženky Víčko pro změřenou kůži v prohlížeči', () => {
  it('čte desetinnou čárku i tečku a odmítne, co není číslo', () => {
    expect(parseMm('0,85')).toBe(0.85);
    expect(parseMm(' 0.9 ')).toBe(0.9);
    expect(parseMm('')).toBeUndefined();
    expect(parseMm('0,8 mm')).toBeUndefined();
    expect(parseMm('-1')).toBeUndefined();
  });

  it('výchozí tloušťky dají výchozí střih (stejné listy jako v aplikaci)', () => {
    const r = lidSheetsForMeasured(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.spec).toEqual(DEFAULT_LID_WALLET);
    expect(r.sheets).toEqual(buildLidSheets(DEFAULT_LID_WALLET));
  });

  it('dává totéž co generátor s --divider/--lining/--p1 a zálohami B1 a B2', () => {
    const r = lidSheetsForMeasured({
      p1Mm: 0.9,
      dividerMm: 0.8,
      liningMm: 0.9,
      skiveFold: true,
      skiveHinge: false,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const expected = lidWalletVariant({
      p1Mm: 0.9,
      dividerMm: 0.8,
      liningMm: 0.9,
      bottomFoldSkiveMm: 0.6,
    });
    expect(r.spec).toEqual(expected);
    expect(r.sheets).toEqual(buildLidSheets(expected));
    expect(r.label).toBe('P1 0,9 · přepážky 0,8 · L1 0,9 · ohyb dna ztenčený na 0,6');
    const hinge = lidSpecFromMeasured({ ...base, skiveHinge: true });
    expect('spec' in hinge && hinge.spec.hingeSkiveMm).toBe(0.6);
  });

  it('P1 do 0,05 mm od 1,0 bere jako výchozí 1,0, od 0,05 jako změřenou (krok 0(a))', () => {
    const near = lidSpecFromMeasured({ ...base, p1Mm: 0.96 });
    expect('spec' in near && near.spec.leatherMm).toBe(1.0);
    const far = lidSpecFromMeasured({ ...base, p1Mm: 0.95 });
    expect('spec' in far && far.spec.leatherMm).toBe(0.95);
  });

  it('přepážky nad 0,92 mm a hodnoty mimo meze odmítne česky, listy nevzniknou', () => {
    const thick = lidSheetsForMeasured({ ...base, dividerMm: 1.0 });
    expect(thick.ok).toBe(false);
    if (!thick.ok) expect(thick.problems.length).toBeGreaterThan(0);
    const out = lidSheetsForMeasured({ ...base, p1Mm: 2, liningMm: 0.1 });
    expect(out).toEqual({
      ok: false,
      problems: [
        'Tloušťka P1 musí být mezi 0,6 a 1,4 mm.',
        'Tloušťka podšívky L1 musí být mezi 0,3 a 1,2 mm.',
      ],
    });
  });

  it('popis sestavy uvádí obě zálohy B', () => {
    expect(lidVariantLabel(lidWalletVariant({ hingeSkiveMm: 0.6, bottomFoldSkiveMm: 0.6 }))).toBe(
      'P1 1,0 · přepážky 0,6 · L1 0,6 · ohyb dna ztenčený na 0,6 · závěs ztenčený na 0,6',
    );
  });
});
