import { describe, expect, it } from 'vitest';

import { BELT_ACTIVE_FIELD_ID, LEGACY_BELT_RECORD_IDS } from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import {
  ACTIVE_BELT_SUMMARY_KEYS,
  activeBeltOutcome,
  beltFact,
  chosenBeltFieldId,
  isBeltConfigProject,
  resolveActiveBelt,
} from '@/features/belt/active-belt';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type BeltConfigInput } from '@/lib/patterns/belt-config';

const SLUG = 'pasek-test';
const entry = (
  fieldId: string,
  value: number | string | null,
  updatedAt = '2026-10-08T10:00:00.000Z',
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: SLUG,
  lessonSlug: 'vas-pasek',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: updatedAt,
  updatedAt,
});
const saved = (name: string, input: BeltConfigInput, updatedAt?: string) =>
  entry(newSavedBeltFieldId(), serializeSavedBelt(name, input, 'pasek'), updatedAt);

describe('zápisy lekce 1 novější než uložený pásek', () => {
  const belt = saved(
    'Hnědý',
    { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 },
    '2026-10-05T10:00:00.000Z',
  );

  it('starší zápisy se nenabízejí (pásek je z nich uložený)', () => {
    const old = entry(LEGACY_BELT_RECORD_IDS.thickness, 3.6, '2026-10-01T10:00:00.000Z');
    expect(resolveActiveBelt([old, belt], SLUG).newerLegacy).toBeNull();
  });

  it('novější tloušťka a trn se doplní do formuláře pásku, nic se neztratí', () => {
    const state = resolveActiveBelt(
      [
        belt,
        entry(LEGACY_BELT_RECORD_IDS.width, 40, '2026-10-01T10:00:00.000Z'),
        entry(LEGACY_BELT_RECORD_IDS.thickness, 3.6, '2026-10-06T10:00:00.000Z'),
        entry(LEGACY_BELT_RECORD_IDS.prong, 4.2, '2026-10-06T10:00:00.000Z'),
      ],
      SLUG,
    );
    // Lekce, nákup i rozpočet dál počítají z uloženého pásku, dokud ho uživatel neuloží.
    expect(state.active).toMatchObject({ name: 'Hnědý', input: { thicknessMm: 3.5 } });
    expect(state.newerLegacy?.filled).toEqual([
      'tloušťka',
      'Ø dírky (trn + 0,5 mm, nahoru na výsečník po 0,5 mm)',
    ]);
    expect(state.newerLegacy?.form).toMatchObject({
      width: '40',
      thickness: '3,6',
      waist: '95',
      holeDiameter: '5',
    });
    expect(state.newerLegacy?.prongMm).toBe(4.2);
  });
});

describe('aktivní pásek', () => {
  it('jen projekt s „Váš pásek“', () => {
    expect(isBeltConfigProject(beltProject)).toBe(true);
    expect(isBeltConfigProject(cardHolderProject)).toBe(false);
  });

  it('bez pásku a bez starých zápisů není', () => {
    expect(resolveActiveBelt([], SLUG)).toEqual({
      belts: [],
      active: null,
      legacy: null,
      newerLegacy: null,
    });
    expect(activeBeltOutcome(null)).toBeNull();
  });

  it('volba platí, dokud zvolený pásek existuje; jinak naposledy uložený', () => {
    const a = saved(
      'A',
      { widthMm: 30, thicknessMm: 3.5, tip: 'hrot' },
      '2026-10-01T10:00:00.000Z',
    );
    const b = saved(
      'B',
      { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' },
      '2026-10-05T10:00:00.000Z',
    );
    expect(resolveActiveBelt([a, b], SLUG).active).toMatchObject({ name: 'B', source: 'saved' });
    const choice = entry(BELT_ACTIVE_FIELD_ID, a.fieldId);
    expect(chosenBeltFieldId([a, b, choice], SLUG)).toBe(a.fieldId);
    expect(resolveActiveBelt([a, b, choice], SLUG).active).toMatchObject({
      name: 'A',
      fieldId: a.fieldId,
    });
    // Volba ukazuje na neexistující pásek: platí nejnovější.
    const stale = entry(BELT_ACTIVE_FIELD_ID, 'belt-config-neni');
    expect(resolveActiveBelt([a, b, stale], SLUG).active).toMatchObject({ name: 'B' });
    // Volba jiného projektu se nepočítá.
    expect(chosenBeltFieldId([{ ...choice, projectSlug: 'jiny' }], SLUG)).toBeNull();
  });

  it('staré zápisy lekce 1 se nepoužijí, když je uložený pásek', () => {
    const state = resolveActiveBelt(
      [
        entry(LEGACY_BELT_RECORD_IDS.width, 35),
        saved('Uložený', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' }),
      ],
      SLUG,
    );
    expect(state.legacy).toBeNull();
    expect(state.active?.input.widthMm).toBe(40);
  });
});

describe('hodnoty aktivního pásku', () => {
  const state = resolveActiveBelt(
    [
      entry(
        newSavedBeltFieldId(),
        serializeSavedBelt(
          'Hnědý',
          { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950, color: 'hneda' },
          'pasek',
          { prongMm: 4.5, scrapFromStrap: true },
        ),
      ),
    ],
    SLUG,
  );
  const active = state.active!;
  const outcome = activeBeltOutcome(active)!;
  const result = outcome.ok ? outcome.result : null;
  const fact = (key: Parameters<typeof beltFact>[0]) => beltFact(key, active, result).value;

  it('zadání i spočítaná čísla', () => {
    expect(fact('width')).toBe('40 mm');
    expect(fact('thickness')).toBe('3,5 mm');
    expect(fact('waist')).toBe('95 cm');
    expect(fact('tip')).toBe('hrot');
    expect(fact('color')).toBe('hnědá');
    expect(fact('holeDiameter')).toBe('5 mm (trn 4,5 mm)');
    expect(fact('strapLength')).toBe('aspoň 119 cm + 15 cm na odřezek');
    expect(fact('keeper')).toBe('120 × 12 mm');
    expect(fact('rivet')).toBe('2 ks, dřík 6 mm (rozsah 5,5–6 mm)');
    expect(fact('holes')).toBe('94,3 / 119,3 / 144,3 / 169,3 / 194,3 mm · 5 × Ø 5 mm');
    expect(fact('middleHole')).toBe('144,3 mm');
    expect(ACTIVE_BELT_SUMMARY_KEYS).toEqual(['waist', 'strapLength', 'keeper', 'rivet', 'holes']);
  });

  it('bez výpočtu jen zadání; spočítaná čísla chybí', () => {
    expect(beltFact('keeper', active, null).value).toBeNull();
    expect(beltFact('width', active, null).value).toBe('40 mm');
  });
});
