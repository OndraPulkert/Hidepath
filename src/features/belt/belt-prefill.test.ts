import { describe, expect, it } from 'vitest';

import { LEGACY_BELT_RECORD_IDS as BELT_RECORD_IDS } from '@/content/projects';
import { activeBeltOutcome, resolveActiveBelt } from '@/features/belt/active-belt';
import {
  LEGACY_BELT_NAME,
  beltFormInitial,
  legacyBeltOffer,
  legacyBeltPrefill as beltConfigPrefill,
  punchForProngMm,
} from '@/features/belt/belt-prefill';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { DEFAULT_BELT_FORM } from '@/lib/patterns/belt-config';

/** Výpočet z aktivního pásku (u starých zápisů z nich, dokud nejsou uložené). */
const beltNumbersFromNotebook = (entries: LessonRecordEntry[], slug: string) => {
  const { active, legacy } = resolveActiveBelt(entries, slug);
  if (!active && legacy && legacy.problems.length > 0) {
    return { ok: false as const, problems: legacy.problems };
  }
  return activeBeltOutcome(active);
};

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

describe('převod starých zápisů lekce 1 na „Váš pásek“', () => {
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
      prongMm: 4.5,
    });
  });

  it('vezme barvu pásu; neznámá barva se ignoruje', () => {
    const prefill = beltConfigPrefill(
      [entry(BELT_RECORD_IDS.width, 40), entry(BELT_RECORD_IDS.color, 'cerna')],
      SLUG,
    );
    expect(prefill!.form.color).toBe('cerna');
    expect(prefill!.filled).toEqual(['šířka', 'barva']);
    const unknown = beltConfigPrefill(
      [entry(BELT_RECORD_IDS.width, 40), entry(BELT_RECORD_IDS.color, 'fialova')],
      SLUG,
    );
    expect(unknown!.form.color).toBe('prirodni');
    expect(unknown!.filled).toEqual(['šířka']);
    const outcome = beltNumbersFromNotebook(
      [entry(BELT_RECORD_IDS.width, 32), entry(BELT_RECORD_IDS.color, 'hneda')],
      SLUG,
    );
    expect(outcome!.ok && outcome!.result.input.color).toBe('hneda');
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

describe('převod starých dat na uložený pásek (jednou)', () => {
  const legacy = [entry(BELT_RECORD_IDS.width, 35), entry(BELT_RECORD_IDS.waist, 95)];

  it('bez uloženého pásku nabídne staré zápisy jako pásek a počítá z nich', () => {
    const offer = legacyBeltOffer(legacy, SLUG)!;
    expect(offer).toMatchObject({
      name: LEGACY_BELT_NAME,
      waistSource: 'pasek',
      input: { widthMm: 35, waistMm: 950, thicknessMm: 3.5, tip: 'hrot' },
      filled: ['šířka', 'obvod'],
    });
    const state = resolveActiveBelt(legacy, SLUG);
    expect(state.active).toMatchObject({
      source: 'notebook',
      fieldId: null,
      name: LEGACY_BELT_NAME,
    });
    expect(beltFormInitial(state)).toMatchObject({
      form: { width: '35', waist: '95' },
      loadedFieldId: null,
      name: LEGACY_BELT_NAME,
      legacy: { filled: ['šířka', 'obvod'], problems: [] },
    });
  });

  it('jakmile je uložený pásek, nabídka zmizí a staré zápisy se už nepoužijí', () => {
    const savedEntry = entry(
      newSavedBeltFieldId(),
      serializeSavedBelt('Hnědý', { widthMm: 40, thicknessMm: 3.6, tip: 'hrot' }, 'metr', {
        prongMm: 4.2,
        scrapFromStrap: true,
      }),
    );
    expect(legacyBeltOffer([...legacy, savedEntry], SLUG)).toBeNull();
    const state = resolveActiveBelt([...legacy, savedEntry], SLUG);
    expect(state.legacy).toBeNull();
    expect(state.active).toMatchObject({ source: 'saved', name: 'Hnědý', input: { widthMm: 40 } });
    expect(beltFormInitial(state)).toMatchObject({
      form: { width: '40', thickness: '3,6', waistSource: 'metr' },
      prong: '4,2',
      scrapFromStrap: true,
      loadedFieldId: savedEntry.fieldId,
      name: 'Hnědý',
      legacy: null,
    });
  });

  it('bez starých zápisů i pásku není co převádět', () => {
    expect(legacyBeltOffer([], SLUG)).toBeNull();
    expect(beltFormInitial(resolveActiveBelt([], SLUG))).toBeNull();
  });

  it('staré zápisy, které nejdou spočítat, se nabídnou, ale aktivní pásek z nich není', () => {
    const offer = legacyBeltOffer([entry(BELT_RECORD_IDS.prong, 5.8)], SLUG)!;
    expect(offer.input).toBeNull();
    expect(offer.problems).toHaveLength(1);
    expect(resolveActiveBelt([entry(BELT_RECORD_IDS.prong, 5.8)], SLUG).active).toBeNull();
  });
});

describe('trn → Ø dírky', () => {
  it('trn + 0,5 mm nahoru na výsečník po 0,5 mm, nejméně 4,5 mm', () => {
    expect(punchForProngMm(4.5)).toEqual({ punchMm: 5, how: 'trn + 0,5 mm', problem: null });
    expect(punchForProngMm(4.2).punchMm).toBe(5);
    expect(punchForProngMm(4.2).how).toBe('trn + 0,5 mm, nahoru na výsečník po 0,5 mm');
    expect(punchForProngMm(3).punchMm).toBe(4.5);
    expect(punchForProngMm(5.8).problem).toMatch(/moc silný/);
  });
});
