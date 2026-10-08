import { describe, expect, it } from 'vitest';

import {
  SAVED_BELT_NAME_MAX,
  isSavedBeltFieldId,
  newSavedBeltFieldId,
  parseSavedBeltValue,
  savedBeltNameProblem,
  savedBeltsFromRecords,
  serializeSavedBelt,
} from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type BeltConfigInput } from '@/lib/patterns/belt-config';

const SLUG = 'pasek-test';
const entry = (
  fieldId: string,
  value: string | null,
  updatedAt = '2026-10-08T10:00:00.000Z',
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: SLUG,
  lessonSlug: 'vas-pasek',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: '2026-10-08T10:00:00.000Z',
  updatedAt,
});

const input: BeltConfigInput = {
  widthMm: 35,
  thicknessMm: 3.5,
  waistMm: 955,
  tip: 'zaobleny',
  holeCount: 7,
};

describe('Moje pásky', () => {
  it('id pole projde kontrolou slugu v databázi', () => {
    const id = newSavedBeltFieldId('0F8FAD5B-D9CB-469F-A165-70867728950E');
    expect(id).toBe('belt-config-0f8fad5b-d9cb-469f-a165-70867728950e');
    expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(isSavedBeltFieldId(id)).toBe(true);
    expect(isSavedBeltFieldId('belt-width')).toBe(false);
  });

  it('uložit a přečíst vrátí totéž; JSON se vejde do 2000 znaků', () => {
    const raw = serializeSavedBelt(' Hnědý do džínů ', input, 'metr');
    expect(parseSavedBeltValue(raw)).toEqual({
      name: 'Hnědý do džínů',
      waistSource: 'metr',
      input,
    });
    const longest = serializeSavedBelt(
      'ř'.repeat(SAVED_BELT_NAME_MAX),
      {
        ...input,
        holeSpacingMm: 22.5,
        apexToFirstHoleMm: 94.3,
        holeDiameterMm: 4.5,
      },
      'pasek',
    );
    expect(longest.length).toBeLessThan(2000);
  });

  it('poškozená hodnota se přeskočí', () => {
    expect(parseSavedBeltValue('{')).toBeNull();
    expect(parseSavedBeltValue(42)).toBeNull();
    expect(parseSavedBeltValue(JSON.stringify({ v: 2 }))).toBeNull();
  });

  it('seznam: jen pásky, bez smazaných, podle názvu, poslední zápis vyhrává', () => {
    const a = newSavedBeltFieldId();
    const b = newSavedBeltFieldId();
    const belts = savedBeltsFromRecords(
      [
        entry('belt-width', null),
        entry(a, serializeSavedBelt('Žlutý', input, 'pasek')),
        entry(b, serializeSavedBelt('Černý', input, 'pasek')),
        entry(b, serializeSavedBelt('Černý 2', input, 'pasek'), '2026-10-08T11:00:00.000Z'),
        entry(newSavedBeltFieldId(), null),
      ],
      SLUG,
    );
    expect(belts.map((x) => x.name)).toEqual(['Černý 2', 'Žlutý']);
  });

  it('název: povinný a nejvýš 60 znaků', () => {
    expect(savedBeltNameProblem('  ')).toMatch(/Zadejte název/);
    expect(savedBeltNameProblem('x'.repeat(61))).toMatch(/60 znaků/);
    expect(savedBeltNameProblem('Pracovní 45')).toBeNull();
  });
});
