import { describe, expect, it } from 'vitest';

import { BELT_RECORD_IDS } from '@/content/projects';
import { beltConfigPrefill, beltNumbersFromNotebook } from '@/features/belt/belt-prefill';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { DEFAULT_BELT_FORM } from '@/lib/patterns/belt-config';

const SLUG = 'pasek-test';
const entry = (
  fieldId: string,
  value: number | string | null,
  projectSlug = SLUG,
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug,
  lessonSlug: 'x',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: '2026-10-08T10:00:00.000Z',
  updatedAt: '2026-10-08T10:00:00.000Z',
});

describe('předvyplnění „Váš pásek“ ze zápisníku', () => {
  it('bez zápisů nic', () => {
    expect(beltConfigPrefill([], SLUG)).toBeNull();
    expect(beltNumbersFromNotebook([], SLUG)).toBeNull();
  });

  it('vezme šířku, tloušťku, obvod, konec a Ø dírky z trnu', () => {
    const prefill = beltConfigPrefill(
      [
        entry(BELT_RECORD_IDS.width, 35),
        entry(BELT_RECORD_IDS.thickness, 3.75),
        entry(BELT_RECORD_IDS.waist, 98.5),
        entry(BELT_RECORD_IDS.tip, 'zaobleny'),
        entry(BELT_RECORD_IDS.prong, 4.5),
      ],
      SLUG,
    );
    expect(prefill).toEqual({
      form: {
        ...DEFAULT_BELT_FORM,
        width: '35',
        thickness: '3,75',
        waist: '98,5',
        tip: 'zaobleny',
        holeDiameter: '5',
      },
      filled: ['šířka', 'tloušťka', 'obvod', 'konec', 'Ø dírky (trn + 0,5 mm)'],
      problems: [],
    });
  });

  it('ignoruje jiný projekt, vymazané pole a neznámý konec', () => {
    expect(
      beltConfigPrefill(
        [
          entry(BELT_RECORD_IDS.width, 30, 'jiny'),
          entry(BELT_RECORD_IDS.thickness, null),
          entry(BELT_RECORD_IDS.tip, 'spicaty'),
        ],
        SLUG,
      ),
    ).toBeNull();
  });

  it('„vaše čísla“ pro lekce: ze zápisníku rovnou výpočet', () => {
    const out = beltNumbersFromNotebook(
      [entry(BELT_RECORD_IDS.width, 40), entry(BELT_RECORD_IDS.waist, 95)],
      SLUG,
    );
    expect(out).toMatchObject({ ok: true, result: { strap: { minLengthCm: 119 } } });
    // Změřená tloušťka se nezaokrouhluje: 3,6 mm projde a dřík se počítá z ní.
    expect(beltNumbersFromNotebook([entry(BELT_RECORD_IDS.thickness, 3.6)], SLUG)).toMatchObject({
      ok: true,
      result: { rivet: { minMm: 5.7, maxMm: 6.2, postMm: 6 } },
    });
    expect(beltNumbersFromNotebook([entry(BELT_RECORD_IDS.thickness, 4.2)], SLUG)).toMatchObject({
      ok: false,
    });
  });

  it('Ø dírky z trnu zaokrouhlí nahoru na velikost výsečníku (po 0,5 mm)', () => {
    const at = (prong: number) =>
      beltConfigPrefill([entry(BELT_RECORD_IDS.prong, prong)], SLUG)!.form.holeDiameter;
    expect(at(4)).toBe('4,5');
    expect(at(4.2)).toBe('5');
    expect(at(4.5)).toBe('5');
    expect(at(4.6)).toBe('5,5');
    expect(beltNumbersFromNotebook([entry(BELT_RECORD_IDS.prong, 4.2)], SLUG)).toMatchObject({
      ok: true,
      result: { holes: { diameterMm: 5 } },
    });
  });

  it('tenký trn (≤ 3,5 mm) dá nejmenší výsečník 4,5 mm, ne Ø 4 mimo meze', () => {
    // Regrese: trn 3,5 → Ø 4,0 a celé „Vaše čísla“ skončila chybou „Ø dírky musí být …“.
    const prefill = beltConfigPrefill(
      [entry(BELT_RECORD_IDS.width, 30), entry(BELT_RECORD_IDS.prong, 3.5)],
      SLUG,
    )!;
    expect(prefill.form.holeDiameter).toBe('4,5');
    expect(prefill.filled).toContain('Ø dírky (trn + 0,5 mm, nejmenší výsečník 4,5 mm)');
    expect(prefill.problems).toEqual([]);
    expect(
      beltNumbersFromNotebook(
        [entry(BELT_RECORD_IDS.width, 30), entry(BELT_RECORD_IDS.prong, 3.5)],
        SLUG,
      ),
    ).toMatchObject({ ok: true, result: { holes: { diameterMm: 4.5 } } });
    expect(beltConfigPrefill([entry(BELT_RECORD_IDS.prong, 2.8)], SLUG)!.form.holeDiameter).toBe(
      '4,5',
    );
  });

  it('silný trn (nad 5,5 mm) hlásí srozumitelně, že je na výsečníky moc silný', () => {
    const entries = [entry(BELT_RECORD_IDS.width, 40), entry(BELT_RECORD_IDS.prong, 5.8)];
    const prefill = beltConfigPrefill(entries, SLUG)!;
    expect(prefill.problems).toEqual([
      'Trn 5,8 mm je na výsečníky 4,5–6 mm moc silný (potřeba Ø 6,5 mm). Zkontrolujte měření trnu, nebo zvolte jinou přezku.',
    ]);
    expect(beltNumbersFromNotebook(entries, SLUG)).toEqual({
      ok: false,
      problems: prefill.problems,
    });
  });
});
