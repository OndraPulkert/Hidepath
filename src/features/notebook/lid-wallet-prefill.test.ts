import { LID_RECORD_IDS, LID_V12_VARIANTS } from '@/content/projects/lid-wallet/record-ids';
import { lidGeneratorPrefill } from '@/features/notebook/lid-wallet-prefill';
import { type LessonRecordEntry } from '@/features/notebook/types';
import {
  DEFAULT_LID_GENERATOR_FORM,
  type LidMeasuredInput,
  lidSheetsForMeasured,
  parseLidGeneratorForm,
} from '@/lib/patterns/lid-wallet-input';

const entry = (
  fieldId: string,
  value: number | string | null,
  extra: Partial<LessonRecordEntry> = {},
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: 'lid-wallet',
  lessonSlug: 'x',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
  ...extra,
});

const prefillOf = (entries: LessonRecordEntry[]) => lidGeneratorPrefill(entries, 'lid-wallet');

/** Předvyplnění → stejné čtení jako formulář → listy. */
function sheetsFromPrefill(entries: LessonRecordEntry[]) {
  const prefill = lidGeneratorPrefill(entries, 'lid-wallet');
  if (!prefill) throw new Error('nic nepředvyplněno');
  const parsed = parseLidGeneratorForm(prefill.form);
  if ('problems' in parsed) throw new Error(parsed.problems.join(' '));
  return { prefill, input: parsed.input, result: lidSheetsForMeasured(parsed.input) };
}

describe('Víčko – předvyplnění listů ze zápisníku', () => {
  it('bez zápisů nic nepředvyplní', () => {
    expect(prefillOf([])).toBeNull();
    expect(prefillOf([entry(LID_RECORD_IDS.p1Thickness, null)])).toBeNull();
    // Zápisy jiného projektu se nepočítají.
    expect(
      prefillOf([entry(LID_RECORD_IDS.p1Thickness, 0.95, { projectSlug: 'card-holder' })]),
    ).toBeNull();
  });

  it('tloušťky z lekce 1 dají stejné listy jako ruční zadání', () => {
    const { prefill, input, result } = sheetsFromPrefill([
      entry(LID_RECORD_IDS.p1Thickness, 0.95),
      entry(LID_RECORD_IDS.d1Thickness, 0.7),
      entry(LID_RECORD_IDS.d2Thickness, 0.8),
      entry(LID_RECORD_IDS.liningThickness, 0.9),
    ]);
    expect(prefill.form).toMatchObject({ p1: '0,95', divider: '0,8', lining: '0,9' });
    expect(prefill.filled).toEqual(['P1', 'přepážky (větší z D1 a D2)', 'podšívka L1']);

    const manual: LidMeasuredInput = {
      p1Mm: 0.95,
      dividerMm: 0.8,
      liningMm: 0.9,
      skiveFold: false,
      skiveHinge: false,
      p0: {},
    };
    expect(input).toEqual(manual);
    const expected = lidSheetsForMeasured(manual);
    expect(result.ok).toBe(true);
    expect(result).toEqual(expected);

    // Stejný výsledek jako ruční vyplnění formuláře.
    const typed = parseLidGeneratorForm({
      ...DEFAULT_LID_GENERATOR_FORM,
      p1: '0,95',
      divider: '0,8',
      lining: '0.9',
    });
    expect('input' in typed && lidSheetsForMeasured(typed.input)).toEqual(expected);
  });

  it('přepážky jen z obou D1 a D2 (jedna sama by mohla být ta menší)', () => {
    const prefill = prefillOf([
      entry(LID_RECORD_IDS.d1Thickness, 0.7),
      entry(LID_RECORD_IDS.liningThickness, 0.9),
    ]);
    expect(prefill?.form.divider).toBe('');
    expect(prefill?.filled).toEqual(['podšívka L1']);
  });

  it('záloha A dá P1 0,8 místo změřeného kaštanu, záloha B1 zaškrtne ztenčení ohybu', () => {
    const a = prefillOf([
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.v12Variant, LID_V12_VARIANTS.backupA),
    ]);
    expect(a?.form.p1).toBe('0,8');
    expect(a?.form.skiveFold).toBe(false);

    const { prefill, input, result } = sheetsFromPrefill([
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.d1Thickness, 0.6),
      entry(LID_RECORD_IDS.d2Thickness, 0.6),
      entry(LID_RECORD_IDS.liningThickness, 0.6),
      entry(LID_RECORD_IDS.v12Variant, LID_V12_VARIANTS.backupB1),
    ]);
    expect(prefill.form.skiveFold).toBe(true);
    expect(prefill.form.skiveHinge).toBe(false);
    expect(input.skiveFold).toBe(true);
    expect(result).toEqual(
      lidSheetsForMeasured({
        p1Mm: 1,
        dividerMm: 0.6,
        liningMm: 0.6,
        skiveFold: true,
        skiveHinge: false,
        p0: {},
      }),
    );
    expect(result.ok && result.label).toContain('ohyb dna ztenčený na 0,6');
  });

  it('Z-2 záloha B2 vrátí P1 z lekce 1 (useň 0,8 se neztenčuje) a zaškrtne B2, po A z V12 i B1', () => {
    const afterZ2 = prefillOf([
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.z2Result, 'cracks-backup-b2'),
    ]);
    expect(afterZ2?.form).toMatchObject({ p1: '1,0', skiveHinge: true, skiveFold: false });
    expect(afterZ2?.filled).toContain('záloha B2 (P1 z usně 1,0)');

    const afterV12A = prefillOf([
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.v12Variant, LID_V12_VARIANTS.backupA),
      entry(LID_RECORD_IDS.p1BackupAThickness, 0.82),
      entry(LID_RECORD_IDS.z2Result, 'cracks-backup-b2'),
    ]);
    expect(afterV12A?.form).toMatchObject({ p1: '1,0', skiveHinge: true, skiveFold: true });
  });

  it('výchozí varianta nic nemění', () => {
    const prefill = prefillOf([entry(LID_RECORD_IDS.v12Variant, LID_V12_VARIANTS.default)]);
    expect(prefill).toBeNull();
  });

  it('celé tloušťky ukáže s desetinnou čárkou jako formulář („1,0“)', () => {
    const prefill = prefillOf([
      entry(LID_RECORD_IDS.p1Thickness, 1),
      entry(LID_RECORD_IDS.d1Thickness, 1),
      entry(LID_RECORD_IDS.d2Thickness, 0.6),
      entry(LID_RECORD_IDS.liningThickness, 0.6),
    ]);
    expect(prefill?.form).toMatchObject({ p1: '1,0', divider: '1,0', lining: '0,6' });
  });

  it('P0, k z lekce 10 a magnet dají stejné listy jako ruční zadání', () => {
    const { prefill, input, result } = sheetsFromPrefill([
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.d1Thickness, 0.8),
      entry(LID_RECORD_IDS.d2Thickness, 0.75),
      entry(LID_RECORD_IDS.liningThickness, 0.9),
      entry(LID_RECORD_IDS.p0K, 1.1),
      entry(LID_RECORD_IDS.kMeasured, 1.3),
      entry(LID_RECORD_IDS.magnetThickness, 2),
    ]);
    expect(prefill.form.p0).toMatchObject({ k: '1,3', magnetThickness: '2' });
    expect(prefill.filled).toContain('k');
    expect(prefill.filled).toContain('tloušťka magnetu');
    const manual: LidMeasuredInput = {
      p1Mm: 1,
      dividerMm: 0.8,
      liningMm: 0.9,
      skiveFold: false,
      skiveHinge: false,
      p0: { k: 1.3 },
      magnetThicknessMm: 2,
    };
    expect(input).toEqual(manual);
    expect(result).toEqual(lidSheetsForMeasured(manual));
    expect(result.ok && result.label).toBe(
      'P1 1,0 · přepážky 0,8 · L1 0,9 · k 1,3 · magnet Ø 8 × 2',
    );
  });

  it('bez k z lekce 10 vezme k z P0-3; bankovky a zvednutí se přenesou všechny', () => {
    const prefill = prefillOf([
      entry(LID_RECORD_IDS.p0K, 1.1),
      entry(LID_RECORD_IDS.cardLift, 2.5),
      entry(LID_RECORD_IDS.coinLift, 1.25),
      entry(LID_RECORD_IDS.billSheet, 0.11),
      entry(LID_RECORD_IDS.billHeightMin, 70),
      entry(LID_RECORD_IDS.billHeightMax, 74),
      entry(LID_RECORD_IDS.billHalfWidthMin, 63),
      entry(LID_RECORD_IDS.billHalfWidthMax, 76),
    ]);
    expect(prefill?.form.p0).toEqual({
      k: '1,1',
      cardLift: '2,5',
      coinLift: '1,25',
      billSheet: '0,11',
      billHeightMin: '70',
      billHeightMax: '74',
      billHalfWidthMin: '63',
      billHalfWidthMax: '76',
      magnetThickness: '',
    });
    // Tloušťky kůže zůstávají k vyplnění; výchozí P1 1,0 platí dál.
    expect(prefill?.form).toMatchObject({ p1: '1,0', divider: '', lining: '' });
    const parsed = parseLidGeneratorForm({ ...prefill!.form, divider: '0,6', lining: '0,6' });
    expect('input' in parsed && parsed.input.p0).toEqual({
      k: 1.1,
      cardLiftMm: 2.5,
      coinLiftMm: 1.25,
      billSheetMm: 0.11,
      billHeightMinMm: 70,
      billHeightMaxMm: 74,
      billHalfWidthMinMm: 63,
      billHalfWidthMaxMm: 76,
    });
  });

  it('nejnovější zápis pole vyhraje a text v číselném poli se ignoruje', () => {
    const prefill = prefillOf([
      entry(LID_RECORD_IDS.liningThickness, 0.7, { updatedAt: '2026-10-01T00:00:00.000Z' }),
      entry(LID_RECORD_IDS.liningThickness, 0.9, { updatedAt: '2026-10-05T00:00:00.000Z' }),
      entry(LID_RECORD_IDS.p1Thickness, 'tlustá'),
    ]);
    expect(prefill?.form.lining).toBe('0,9');
    expect(prefill?.form.p1).toBe('1,0');
  });
});

describe('Víčko – čtení formuláře', () => {
  it('chybějící tloušťky a špatné P0 vrátí všechny problémy najednou', () => {
    const parsed = parseLidGeneratorForm({
      ...DEFAULT_LID_GENERATOR_FORM,
      p1: '',
      p0: { ...DEFAULT_LID_GENERATOR_FORM.p0, magnetThickness: '0' },
    });
    expect(parsed).toEqual({
      problems: [
        'Zadejte tloušťku P1 v mm (např. 0,95).',
        'Zadejte tloušťku přepážek v mm – větší z D1 a D2 (např. 0,8).',
        'Zadejte tloušťku podšívky L1 v mm (např. 0,9).',
        'Tloušťka magnetu: zadejte kladné číslo.',
      ],
    });
  });
});
