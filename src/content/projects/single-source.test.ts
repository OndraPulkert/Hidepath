import {
  BELT_ACTIVE_FIELD_ID,
  BELT_CONFIG_FIELD_PREFIX,
  LEGACY_BELT_MARKING_ID,
  LEGACY_BELT_RECORD_IDS,
  LEGACY_LID_RECORD_IDS,
  LID_SHEETS_FIELD_ID,
  projects,
} from '@/content/projects';
import { legacyLidOffer } from '@/features/lid-wallet/lid-sheets-state';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { DEFAULT_LID_GENERATOR_FORM } from '@/lib/patterns/lid-wallet-input';

/**
 * Pravidlo jediného zdroje: každá vstupní hodnota se zadává na jednom místě. Co spotřebuje
 * formulář („Váš pásek“, „Listy pro vaši kůži“), se v lekcích nezapisuje ani nepřipomíná
 * z jiného zápisu – lekce ho jen ukazují (`beltRecalls`, `lidSheetRecalls`). Zápisník lekcí je
 * pro výsledky zkoušek a rozhodnutí, která jinde zadaná nejsou.
 */

/** Id, která patří formulářům (nebo jejich převodu), ne polím lekcí. */
const FORM_OWNED = new Set<string>([
  ...Object.values(LEGACY_LID_RECORD_IDS),
  ...Object.values(LEGACY_BELT_RECORD_IDS),
  LEGACY_BELT_MARKING_ID,
  LID_SHEETS_FIELD_ID,
  BELT_ACTIVE_FIELD_ID,
]);

const isFormOwned = (id: string) => FORM_OWNED.has(id) || id.startsWith(BELT_CONFIG_FIELD_PREFIX);

describe('jediný zdroj vstupních hodnot (všechny projekty)', () => {
  for (const project of projects) {
    it(`${project.slug}: žádné pole lekce nezdvojuje pole formuláře`, () => {
      const steps = project.lessons.flatMap((l) =>
        l.steps.map((step) => ({ where: `${l.order}/${step.id}`, step })),
      );
      const duplicates = steps.flatMap(({ where, step }) => [
        ...(step.records ?? [])
          .filter((f) => isFormOwned(f.id))
          .map((f) => `${where} zapisuje ${f.id}`),
        ...(step.recalls ?? [])
          .filter((r) => isFormOwned(r.fieldId))
          .map((r) => `${where} připomíná ${r.fieldId}`),
        ...(step.waits ?? [])
          .filter((w) => w.initialFromField !== undefined && isFormOwned(w.initialFromField))
          .map((w) => `${where} bere dobu z ${w.initialFromField}`),
      ]);
      expect(duplicates).toEqual([]);
    });
  }

  it('každé id pole lekce je v projektu jen jednou (žádné dvojí zadání téže hodnoty)', () => {
    for (const project of projects) {
      const ids = project.lessons.flatMap((l) =>
        l.steps.flatMap((s) => (s.records ?? []).map((f) => f.id)),
      );
      expect(
        ids.filter((id, i) => ids.indexOf(id) !== i),
        project.slug,
      ).toEqual([]);
    }
  });

  it('Víčko: každé staré pole lekce se převede do formuláře listů (nic se neztratí)', () => {
    const at = '2026-10-07T10:00:00.000Z';
    for (const [key, fieldId] of Object.entries(LEGACY_LID_RECORD_IDS)) {
      const value = key === 'sheetsOutsideLimits' ? 'outside-limits' : 0.77;
      const record: LessonRecordEntry = {
        id: crypto.randomUUID(),
        userId: null,
        projectSlug: 'lid-wallet',
        lessonSlug: 'x',
        fieldId,
        value,
        contentVersion: 1,
        createdAt: at,
        updatedAt: at,
      };
      const offer = legacyLidOffer([record], 'lid-wallet');
      expect(offer, fieldId).not.toBeNull();
      const changed =
        JSON.stringify(offer!.form) !== JSON.stringify(DEFAULT_LID_GENERATOR_FORM) ||
        offer!.trialOutsideLimits !== null;
      expect(changed, fieldId).toBe(true);
    }
  });
});
