import { useMemo } from 'react';

import { BELT_ACTIVE_FIELD_ID, BELT_CONFIG_LESSON_SLUG } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { type ActiveBeltState, resolveActiveBelt } from '@/features/belt/active-belt';
import { useLessonRecords, useSaveLessonRecord } from '@/features/notebook/use-lesson-records';
import {
  type SavedBeltExtras,
  newSavedBeltFieldId,
  serializeSavedBelt,
} from '@/features/belt/saved-belts';
import { type BeltConfigInput, type WaistSource } from '@/lib/patterns/belt-config';

const NO_ENTRIES: never[] = [];

/**
 * „Moje pásky“ a aktivní pásek projektu: seznam, aktivní pásek, uložení (nový nebo přepsat
 * podle id pole), smazání a volba aktivního. Ukládá přes zápisník (`lesson_records`), takže
 * funguje offline a synchronizuje se s účtem.
 */
export function useSavedBelts(project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>) {
  const records = useLessonRecords(project.slug);
  const save = useSaveLessonRecord(project);
  const entries = records.data ?? NO_ENTRIES;
  const state: ActiveBeltState = useMemo(
    () => resolveActiveBelt(entries, project.slug),
    [entries, project.slug],
  );
  const setActive = async (fieldId: string): Promise<void> => {
    await save.mutateAsync({
      lessonSlug: BELT_CONFIG_LESSON_SLUG,
      fieldId: BELT_ACTIVE_FIELD_ID,
      value: fieldId,
    });
  };
  return {
    ...state,
    isPending: records.isPending,
    isSaving: save.isPending,
    error: save.error,
    /**
     * Uloží pásek a nastaví ho jako aktivní (lekce a nákup se řídí naposledy upraveným);
     * `fieldId` = přepsat existující. Vrací id pole uloženého pásku.
     */
    saveBelt: async (
      name: string,
      input: BeltConfigInput,
      waistSource: WaistSource,
      extras: SavedBeltExtras = {},
      fieldId: string = newSavedBeltFieldId(),
    ): Promise<string> => {
      await save.mutateAsync({
        lessonSlug: BELT_CONFIG_LESSON_SLUG,
        fieldId,
        value: serializeSavedBelt(name, input, waistSource, extras),
      });
      await setActive(fieldId);
      return fieldId;
    },
    removeBelt: async (fieldId: string): Promise<void> => {
      await save.mutateAsync({ lessonSlug: BELT_CONFIG_LESSON_SLUG, fieldId, value: null });
    },
    setActive,
  };
}
