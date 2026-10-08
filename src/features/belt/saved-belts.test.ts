import { describe, expect, it } from 'vitest';

import {
  SAVED_BELT_NAME_MAX,
  type SavedBelt,
  decideSavedBeltSave,
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

  describe('uložení: přepsat načtený, nový, nebo zeptat se', () => {
    const belt = (fieldId: string, name: string): SavedBelt => ({
      fieldId,
      name,
      input,
      waistSource: 'pasek',
      updatedAt: '2026-10-08T10:00:00.000Z',
    });
    const belts = [belt('belt-config-a', 'Hnědý'), belt('belt-config-b', 'Černý')];
    const decide = (
      name: string,
      mode: 'update' | 'new',
      loadedFieldId: string | null = 'belt-config-a',
    ) => decideSavedBeltSave({ name, belts, mode, loadedFieldId, newFieldId: 'belt-config-new' });

    it('načtený pásek se přepíše na místě, i s novým názvem', () => {
      expect(decide('Hnědý', 'update')).toEqual({
        kind: 'write',
        write: { fieldId: 'belt-config-a', outcome: 'updated' },
      });
      expect(decide('Hnědý do džínů', 'update')).toEqual({
        kind: 'write',
        write: { fieldId: 'belt-config-a', outcome: 'updated' },
      });
    });

    it('„Uložit jako nový“ založí nový záznam', () => {
      expect(decide('Hnědý 2', 'new')).toEqual({
        kind: 'write',
        write: { fieldId: 'belt-config-new', outcome: 'created' },
      });
    });

    it('název jiného pásku: zeptat se; „Přepsat“ ho nahradí', () => {
      // Přejmenování načteného na název jiného: zapíše se do načteného, druhý se smaže.
      expect(decide(' černý ', 'update')).toEqual({
        kind: 'confirm-overwrite',
        conflict: belts[1],
        write: {
          fieldId: 'belt-config-a',
          removeFieldId: 'belt-config-b',
          outcome: 'overwritten',
        },
      });
      // Nový se stejným názvem: přepíše ten existující.
      expect(decide('Hnědý', 'new')).toEqual({
        kind: 'confirm-overwrite',
        conflict: belts[0],
        write: { fieldId: 'belt-config-a', outcome: 'overwritten' },
      });
      expect(decide('Černý', 'new', null)).toMatchObject({
        kind: 'confirm-overwrite',
        write: { fieldId: 'belt-config-b' },
      });
    });

    it('načtený pásek mezitím smazaný: uloží se jako nový', () => {
      expect(decide('Zelený', 'update', 'belt-config-gone')).toEqual({
        kind: 'write',
        write: { fieldId: 'belt-config-new', outcome: 'created' },
      });
    });

    it('neplatný název nic nezapíše', () => {
      expect(decide('  ', 'update')).toMatchObject({ kind: 'invalid' });
    });
  });
});
