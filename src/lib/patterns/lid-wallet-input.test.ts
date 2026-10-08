import { DEFAULT_LID_WALLET, lidWalletVariant } from '@/lib/geometry/lid-wallet';
import {
  EMPTY_LID_P0_FIELDS,
  type LidMeasuredInput,
  lidBaseWithP0,
  lidMaxDividerMm,
  lidP0ModelValues,
  lidSheetsForMeasured,
  lidSpecFromMeasured,
  lidVariantLabel,
  parseLidP0Fields,
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

  it('hranice přepážek 0,92 platí pro P1 1,0, tlustší P1 ji snižuje (lekce 1, oddíl 10.1)', () => {
    const at = (p1Mm: number) => lidMaxDividerMm(lidWalletVariant({ p1Mm }));
    expect(at(0.8)).toBe(1.12);
    expect(at(0.9)).toBe(1.02);
    expect(at(1.0)).toBe(0.92);
    expect(at(1.05)).toBe(0.87);
    expect(at(1.1)).toBe(0.8);
    expect(at(1.2)).toBe(0.6);
  });

  it('přepážky nad hranicí pro změřenou P1 odmítne s radou, i když se P1 zaokrouhlí na 1,0', () => {
    const r = lidSheetsForMeasured({ ...base, p1Mm: 1.05, dividerMm: 0.9 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.problems[0]).toBe(
        'Přepážky 0,9 mm jsou při P1 1,05 mm moc tlusté: projdou nejvýš 0,87 mm. Vyřízněte je z tenčího místa kozinky, nebo kupte tenčí.',
      );
    }
    // P1 1,04 je v toleranci (výchozí střih 1,0), ale plná tloušťka s přepážkami 0,92 by byla 12,08.
    const snapped = lidSheetsForMeasured({ ...base, p1Mm: 1.04, dividerMm: 0.92 });
    expect(snapped.ok).toBe(false);
    if (!snapped.ok) expect(snapped.problems[0]).toContain('projdou nejvýš 0,88 mm');
    expect(lidSheetsForMeasured({ ...base, p1Mm: 1.04, dividerMm: 0.88 }).ok).toBe(true);
    expect(lidSheetsForMeasured({ ...base, dividerMm: 0.92 }).ok).toBe(true);
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

  it('hodnoty modelu pro P0: k 1,0 do 1,24, zvednutí 2,28 a 1,25 mm, magnet 1,5', () => {
    expect(lidP0ModelValues()).toEqual({
      k: 1.0,
      kMax: 1.24,
      cardLiftMm: 2.28,
      coinLiftMm: 1.25,
      billSheetMm: 0.1,
      billHeightMinMm: 69,
      billHeightMaxMm: 74,
      billHalfWidthMinMm: 70,
      billHalfWidthMaxMm: 85,
      magnetThicknessMm: 1.5,
    });
  });

  it('P0 podle modelu a k do 1,24 nechají výchozí střih', () => {
    const m = lidP0ModelValues();
    const same = lidSheetsForMeasured({
      ...base,
      p0: {
        k: 1.24,
        cardLiftMm: m.cardLiftMm,
        coinLiftMm: m.coinLiftMm,
        billSheetMm: 0.1,
        billHeightMinMm: 69,
        billHeightMaxMm: 74,
        billHalfWidthMinMm: 70,
        billHalfWidthMaxMm: 85,
      },
      magnetThicknessMm: 1.5,
    });
    expect(same.ok && same.spec).toEqual(DEFAULT_LID_WALLET);
    expect(same.ok && same.label).toBe('P1 1,0 · přepážky 0,6 · L1 0,6');
    expect(lidBaseWithP0({ k: 0.9 })).toEqual(DEFAULT_LID_WALLET);
  });

  it('k nad 1,24 dosadí do kDesign i kMax (oddíl 12.3) a zvedne dno karet a výšku', () => {
    const r = lidSheetsForMeasured({ ...base, p0: { k: 1.3 } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const expected = { ...DEFAULT_LID_WALLET, kDesign: 1.3, kMax: 1.3 };
    expect(r.spec).toEqual(expected);
    expect(r.sheets).toEqual(buildLidSheets(expected));
    expect(r.sheets).not.toEqual(buildLidSheets(DEFAULT_LID_WALLET));
    expect(r.label).toBe('P1 1,0 · přepážky 0,6 · L1 0,6 · k 1,3');
  });

  it('zvednutí na klínu převede na δ (Δ_k = δ · 6 · 0,76, Δ_c = δ · 2,5) a bere větší', () => {
    // Karty 3,42 mm → δ 0,75; mince bez zadání → δ modelu 0,5.
    expect(lidBaseWithP0({ cardLiftMm: 3.42 })).toEqual({
      ...DEFAULT_LID_WALLET,
      wedgeLiftNom: 0.75,
      wedgeLiftMax: 1.0,
    });
    // Mince 3,0 mm → δ 1,2 nad δ max 1,0: zvedne se i δ max.
    expect(lidBaseWithP0({ cardLiftMm: 1.0, coinLiftMm: 3.0 })).toEqual({
      ...DEFAULT_LID_WALLET,
      wedgeLiftNom: 1.2,
      wedgeLiftMax: 1.2,
    });
    const r = lidSheetsForMeasured({ ...base, p0: { cardLiftMm: 3.42 } });
    expect(r.ok && r.label).toBe(
      'P1 1,0 · přepážky 0,6 · L1 0,6 · zvednutí karet 3,42 a mincí 1,88',
    );
  });

  it('bankovky a tloušťku magnetu dosadí přímo do vstupů modelu', () => {
    const r = lidSheetsForMeasured({
      ...base,
      p0: { billSheetMm: 0.12, billHeightMaxMm: 75, billHalfWidthMaxMm: 86 },
      magnetThicknessMm: 2,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const expected = {
      ...DEFAULT_LID_WALLET,
      billSheetMm: 0.12,
      billHeightMaxMm: 75,
      billHalfWidthMaxMm: 86,
      magnetThicknessMm: 2,
    };
    expect(r.spec).toEqual(expected);
    expect(r.sheets).toEqual(buildLidSheets(expected));
    expect(r.label).toBe(
      'P1 1,0 · přepážky 0,6 · L1 0,6 · bankovky v 69–75, napůl 70–86, list 0,12 · magnet Ø 8 × 2',
    );
  });

  it('s tloušťkami kůže a zálohou platí P0 najednou; co model odmítne, vrátí česky', () => {
    const r = lidSheetsForMeasured({
      ...base,
      dividerMm: 0.8,
      skiveHinge: true,
      p0: { k: 1.3 },
    });
    expect(r.ok && r.spec).toEqual(
      lidWalletVariant(
        { dividerMm: 0.8, liningMm: 0.6, p1Mm: 1.0, hingeSkiveMm: 0.6 },
        { ...DEFAULT_LID_WALLET, kDesign: 1.3, kMax: 1.3 },
      ),
    );
    // Bez zvednutí na klínu je sloupec mincí krátký (počítá s δ max): listy nevzniknou.
    const flat = lidSheetsForMeasured({ ...base, p0: { cardLiftMm: 0, coinLiftMm: 0 } });
    expect(flat.ok).toBe(false);
    if (!flat.ok) expect(flat.problems.join(' ')).toMatch(/Sloupec je dlouhý/);
  });

  it('pole P0 a magnetu: prázdné = model, jinak číslo; chyby česky', () => {
    expect(parseLidP0Fields(EMPTY_LID_P0_FIELDS)).toEqual({ p0: {} });
    expect(
      parseLidP0Fields({
        ...EMPTY_LID_P0_FIELDS,
        k: '1,3',
        cardLift: '0',
        billHeightMin: '68.5',
        magnetThickness: '2',
      }),
    ).toEqual({ p0: { k: 1.3, cardLiftMm: 0, billHeightMinMm: 68.5 }, magnetThicknessMm: 2 });
    expect(parseLidP0Fields({ ...EMPTY_LID_P0_FIELDS, k: 'asi 1', magnetThickness: '0' })).toEqual({
      problems: ['k: zadejte kladné číslo.', 'Tloušťka magnetu: zadejte kladné číslo.'],
    });
    expect(parseLidP0Fields({ ...EMPTY_LID_P0_FIELDS, billHeightMin: '76' })).toEqual({
      problems: ['Nejmenší výška bankovky 76 mm je větší než největší 74 mm.'],
    });
  });
});
