import { useMemo } from 'react';

import { BELT_CONFIG_LESSON_SLUG } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { useLessonRecords, useSaveLessonRecord } from '@/features/notebook/use-lesson-records';
import {
  type SavedBelt,
  newSavedBeltFieldId,
  savedBeltsFromRecords,
  serializeSavedBelt,
} from '@/features/belt/saved-belts';
import { type BeltConfigInput, type WaistSource } from '@/lib/patterns/belt-config';

/**
 * „Moje pásky“ projektu: seznam, uložení (nový nebo přepsat podle id pole) a smazání.
 * Ukládá přes zápisník (`lesson_records`), takže funguje offline a synchronizuje se s účtem.
 */
export function useSavedBelts(project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>) {
  const records = useLessonRecords(project.slug);
  const save = useSaveLessonRecord(project);
  const belts: SavedBelt[] = useMemo(
    () => (records.data ? savedBeltsFromRecords(records.data, project.slug) : []),
    [records.data, project.slug],
  );
  return {
    belts,
    isPending: records.isPending,
    isSaving: save.isPending,
    error: save.error,
    /** Uloží pásek; `fieldId` = přepsat existující. Vrací id pole uloženého pásku. */
    saveBelt: async (
      name: string,
      input: BeltConfigInput,
      waistSource: WaistSource,
      fieldId: string = newSavedBeltFieldId(),
    ): Promise<string> => {
      await save.mutateAsync({
        lessonSlug: BELT_CONFIG_LESSON_SLUG,
        fieldId,
        value: serializeSavedBelt(name, input, waistSource),
      });
      return fieldId;
    },
    removeBelt: async (fieldId: string): Promise<void> => {
      await save.mutateAsync({ lessonSlug: BELT_CONFIG_LESSON_SLUG, fieldId, value: null });
    },
  };
}
