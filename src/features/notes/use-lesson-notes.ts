import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { type LessonNoteRecord } from '@/features/notes/types';

export function useLessonNotes(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    queryKey: queryKeys.lessonNotes(scope, projectSlug),
    queryFn: async () =>
      (await repos.lessonNotes.list()).filter((n) => n.projectSlug === projectSlug),
  });
}

/**
 * Uloží poznámku k lekci. Prázdný text záznam smaže – poznámka bez obsahu není
 * informace a v exportu by jen překážela. Idempotentní podle (projekt, lekce):
 * existující záznam si nechá id i createdAt.
 */
export function useSaveLessonNote(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.lessonNotes(scope, projectSlug);
  return useMutation({
    scope: mutationScopes.lessonNotes(scope, projectSlug),
    mutationFn: async ({ lessonSlug, text }: { lessonSlug: string; text: string }) => {
      const existing = (await repos.lessonNotes.list()).find(
        (n) => n.projectSlug === projectSlug && n.lessonSlug === lessonSlug,
      );
      if (text.trim().length === 0) {
        if (existing) await repos.lessonNotes.remove(existing.id);
        return { lessonSlug, saved: null as LessonNoteRecord | null };
      }
      const now = nowIso();
      const record: LessonNoteRecord = {
        id: existing?.id ?? newId(),
        userId: existing?.userId ?? null,
        projectSlug,
        lessonSlug,
        text,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return { lessonSlug, saved: await repos.lessonNotes.upsert(record) };
    },
    onSuccess: ({ lessonSlug, saved }) => {
      queryClient.setQueryData<LessonNoteRecord[]>(key, (prev) => {
        const rest = (prev ?? []).filter((n) => n.lessonSlug !== lessonSlug);
        return saved ? [...rest, saved] : rest;
      });
    },
  });
}
