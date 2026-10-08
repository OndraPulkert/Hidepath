import {
  BELT_PLATE_CHECK,
  BELT_PLATE_CHECK_ID,
  LEGACY_BELT_MARKING,
  LEGACY_BELT_MARKING_ID,
} from '@/content/projects';
import { beltMarking, plateCheckFromRecords } from '@/features/belt/belt-marking';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { deriveBeltConfig } from '@/lib/patterns/belt-config';

const entry = (fieldId: string, value: string, updatedAt = '2026-10-07T10:00:00.000Z') =>
  ({
    id: crypto.randomUUID(),
    userId: null,
    projectSlug: 'belt',
    lessonSlug: 'x',
    fieldId,
    value,
    contentVersion: 1,
    createdAt: updatedAt,
    updatedAt,
  }) satisfies LessonRecordEntry;

const resultFor = (widthMm: number, tip: 'hrot' | 'zaobleny') => {
  const outcome = deriveBeltConfig({ widthMm, thicknessMm: 3.5, tip });
  if (!outcome.ok) throw new Error(outcome.problems.join(' '));
  return outcome.result;
};

describe('pásek – čím značit (odvozené z kontroly destičky a tabulky)', () => {
  it('kontrola destičky ze zápisníku; stará volba „jen listy“ se čte jako odchylka', () => {
    expect(plateCheckFromRecords([], 'belt')).toBeNull();
    expect(plateCheckFromRecords([entry(BELT_PLATE_CHECK_ID, BELT_PLATE_CHECK.ok)], 'belt')).toBe(
      'ok',
    );
    expect(
      plateCheckFromRecords([entry(LEGACY_BELT_MARKING_ID, LEGACY_BELT_MARKING.sheets)], 'belt'),
    ).toBe('deviation');
    // Zapsaná kontrola má přednost před starou volbou.
    expect(
      plateCheckFromRecords(
        [
          entry(LEGACY_BELT_MARKING_ID, LEGACY_BELT_MARKING.sheets),
          entry(BELT_PLATE_CHECK_ID, BELT_PLATE_CHECK.ok),
        ],
        'belt',
      ),
    ).toBe('ok');
    expect(
      plateCheckFromRecords([entry(LEGACY_BELT_MARKING_ID, LEGACY_BELT_MARKING.plate)], 'belt'),
    ).toBeNull();
  });

  it('po řadách podle tabulky; odchylka destičky = jen listy', () => {
    const fits = resultFor(40, 'hrot');
    expect(beltMarking('ok', fits)).toBe('řada 3 destičkou · řada 1 destičkou');
    expect(beltMarking('deviation', fits)).toBe('jen listy 1 a 2 (destička neprošla kontrolou)');
    expect(beltMarking(null, fits)).toContain('destičku nejdřív zkontrolujte');
    // Zaoblený konec 35 mm: oblouk na destičce jen pro 40 a 30 mm.
    expect(beltMarking('ok', resultFor(35, 'zaobleny'))).toBe('řada 3 destičkou · řada 2 list 2');
    expect(beltMarking('ok', null)).toBeNull();
  });
});
