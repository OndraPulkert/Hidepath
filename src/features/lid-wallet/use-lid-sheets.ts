import { useMemo } from 'react';

import { LID_SHEETS_FIELD_ID, LID_SHEETS_LESSON_SLUG } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import {
  type LidSheetsState,
  resolveLidSheets,
  serializeLidSheets,
} from '@/features/lid-wallet/lid-sheets-state';
import { useLessonRecords, useSaveLessonRecord } from '@/features/notebook/use-lesson-records';
import { type LidGeneratorForm } from '@/lib/patterns/lid-wallet-input';

const NO_ENTRIES: never[] = [];

/**
 * Formulář „Listy pro vaši kůži“ (Víčko): stav pro lekce a uložení. Ukládá přes zápisník
 * (`lesson_records`), takže funguje offline a synchronizuje se s účtem.
 */
export function useLidSheets(project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>) {
  const records = useLessonRecords(project.slug);
  const save = useSaveLessonRecord(project);
  const entries = records.data ?? NO_ENTRIES;
  const state: LidSheetsState = useMemo(
    () => resolveLidSheets(entries, project.slug),
    [entries, project.slug],
  );
  return {
    ...state,
    isPending: records.isPending,
    isSaving: save.isPending,
    /** Uloží formulář (jediný zdroj); `trialOutsideLimits` = jak dopadly poslední listy. */
    saveForm: async (form: LidGeneratorForm, trialOutsideLimits: boolean | null) => {
      await save.mutateAsync({
        lessonSlug: LID_SHEETS_LESSON_SLUG,
        fieldId: LID_SHEETS_FIELD_ID,
        value: serializeLidSheets(form, trialOutsideLimits),
      });
    },
  };
}
