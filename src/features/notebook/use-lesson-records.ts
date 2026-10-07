import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type ProjectDefinition } from '@/content/schema';
import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type RecordValue } from '@/features/notebook/values';
import { nextUpdatedAt } from '@/features/sync/merge';

/** Zápisy zápisníku jednoho projektu (včetně vymazaných – `value: null`). */
export function useLessonRecords(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    // Lokální kopie (i s účtem – outbox): číst a zapisovat i offline, nečekat na síť.
    networkMode: 'always',
    queryKey: queryKeys.lessonRecords(scope, projectSlug),
    queryFn: async () =>
      (await repos.lessonRecords.list()).filter((r) => r.projectSlug === projectSlug),
  });
}

export interface SaveLessonRecordInput {
  lessonSlug: string;
  fieldId: string;
  /** `null` = vymazat. */
  value: RecordValue;
}

/**
 * Uloží hodnotu pole zápisníku. Idempotentní podle (projekt, pole): existující zápis si nechá
 * id i createdAt. Vymazání zapíše `value: null` (náhrobek), aby se při synchronizaci nevrátila
 * stará hodnota z jiného zařízení; vymazání pole, které zapsané nikdy nebylo, nic nezapíše.
 */
export function useSaveLessonRecord(project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const projectSlug = project.slug;
  const key = queryKeys.lessonRecords(scope, projectSlug);
  return useMutation({
    networkMode: 'always',
    scope: mutationScopes.lessonRecords(scope, projectSlug),
    mutationFn: async ({ lessonSlug, fieldId, value }: SaveLessonRecordInput) => {
      const existing = (await repos.lessonRecords.list()).find(
        (r) => r.projectSlug === projectSlug && r.fieldId === fieldId,
      );
      // Nic nového: vymazat nezapsané, nebo zapsat totéž do téže lekce.
      if (value === null && (existing?.value ?? null) === null) return existing ?? null;
      if (existing?.value === value && existing.lessonSlug === lessonSlug) return existing;
      const now = nowIso();
      const record: LessonRecordEntry = {
        id: existing?.id ?? newId(),
        userId: existing?.userId ?? null,
        projectSlug,
        lessonSlug,
        fieldId,
        value,
        contentVersion: project.contentVersion,
        createdAt: existing?.createdAt ?? now,
        // Vždy po známém stavu (i ze serveru), jinak by úpravu přebil zápis z hodin „napřed“.
        updatedAt: nextUpdatedAt(existing?.updatedAt, Date.parse(now)),
      };
      return repos.lessonRecords.upsert(record);
    },
    onSuccess: (saved) => {
      if (!saved) return;
      queryClient.setQueryData<LessonRecordEntry[]>(key, (prev) => [
        ...(prev ?? []).filter((r) => r.fieldId !== saved.fieldId),
        saved,
      ]);
    },
  });
}
