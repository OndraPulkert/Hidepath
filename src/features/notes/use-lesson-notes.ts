import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { buildLessonNote, type LessonNoteRecord } from '@/features/notes/types';

export function useLessonNotes(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    // Lokální kopie (i s účtem – outbox): číst a zapisovat i offline, nečekat na síť.
    networkMode: 'always',
    queryKey: queryKeys.lessonNotes(scope, projectSlug),
    queryFn: async () =>
      (await repos.lessonNotes.list()).filter((n) => n.projectSlug === projectSlug),
  });
}

/**
 * Uloží poznámku k lekci. Prázdný text poznámku vymaže (náhrobek s prázdným textem, aby se
 * při synchronizaci nevrátila z jiného zařízení). Idempotentní podle (projekt, lekce).
 */
export function useSaveLessonNote(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.lessonNotes(scope, projectSlug);
  return useMutation({
    networkMode: 'always',
    scope: mutationScopes.lessonNotes(scope, projectSlug),
    mutationFn: async ({ lessonSlug, text }: { lessonSlug: string; text: string }) => {
      const existing = (await repos.lessonNotes.list()).find(
        (n) => n.projectSlug === projectSlug && n.lessonSlug === lessonSlug,
      );
      const record = buildLessonNote(
        existing,
        { projectSlug, lessonSlug, text },
        newId(),
        nowIso(),
      );
      if (!record) return { lessonSlug, saved: existing ?? null };
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
