import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { type Repositories } from '@/features/data/repositories';
import {
  type CheckpointProgressRecord,
  checkpointKey,
  type EnrollmentRecord,
  isEnrolled,
  type LessonProgressRecord,
  type ProgressState,
} from '@/features/progress/types';

export function useEnrollments() {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    queryKey: queryKeys.enrollments(scope),
    queryFn: () => repos.enrollments.list(),
  });
}

/** Zápis do projektu, pokud není archivovaný. */
export function useEnrollment(projectSlug: string) {
  const query = useEnrollments();
  const found = query.data?.find((e) => e.projectSlug === projectSlug);
  return { ...query, enrollment: isEnrolled(found) ? found : null };
}

/** Idempotentní: pro stejný projekt znovu použije existující záznam (unikátní `(user, project)`). */
export function useEnrollProject() {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  return useMutation({
    scope: mutationScopes.enrollments(scope),
    mutationFn: async ({
      projectSlug,
      contentVersion,
    }: {
      projectSlug: string;
      contentVersion: number;
    }) => {
      const existing = (await repos.enrollments.list()).find((e) => e.projectSlug === projectSlug);
      const now = nowIso();
      const record: EnrollmentRecord = {
        id: existing?.id ?? newId(),
        userId: existing?.userId ?? null,
        projectSlug,
        contentVersion,
        status: 'active',
        startedAt: existing?.startedAt ?? now,
        completedAt: null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return repos.enrollments.upsert(record);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<EnrollmentRecord[]>(queryKeys.enrollments(scope), (prev) => [
        ...(prev ?? []).filter((e) => e.projectSlug !== saved.projectSlug),
        saved,
      ]);
    },
  });
}

export function useCompleteProject() {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  return useMutation({
    scope: mutationScopes.enrollments(scope),
    mutationFn: (enrollment: EnrollmentRecord) => {
      const now = nowIso();
      return repos.enrollments.upsert({
        ...enrollment,
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<EnrollmentRecord[]>(queryKeys.enrollments(scope), (prev) =>
        (prev ?? []).map((e) => (e.id === saved.id ? saved : e)),
      );
    },
  });
}

async function loadProgress(repos: Repositories, projectSlug: string): Promise<ProgressState> {
  const [lessons, checkpoints] = await Promise.all([
    repos.lessonProgress.list(),
    repos.checkpointProgress.list(),
  ]);
  return {
    lessons: Object.fromEntries(
      lessons.filter((l) => l.projectSlug === projectSlug).map((l) => [l.lessonSlug, l]),
    ),
    checkpoints: Object.fromEntries(
      checkpoints
        .filter((c) => c.projectSlug === projectSlug)
        .map((c) => [checkpointKey(c.lessonSlug, c.checkpointSlug), c]),
    ),
  };
}

export function useProgress(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    queryKey: queryKeys.progress(scope, projectSlug),
    queryFn: () => loadProgress(repos, projectSlug),
  });
}

interface ToggleVariables {
  lessonSlug: string;
  checkpointSlug: string;
  completed: boolean;
}

/**
 * Přepne kontrolní bod. Záznamy (včetně UUID) vznikají nad NAČTENÝM stavem a putují do
 * `mutationFn` přes variables, takže úložiště i cache sdílí tentýž objekt. Mutace téhož
 * projektu běží sériově (`scope`); odpověď serveru (např. sloučené id) se zapíše do cache.
 */
export function useToggleCheckpoint(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.progress(scope, projectSlug);

  const mutation = useMutation({
    scope: mutationScopes.progress(scope, projectSlug),
    mutationFn: async ({
      checkpoint,
      lesson,
    }: {
      checkpoint: CheckpointProgressRecord;
      lesson: LessonProgressRecord | null;
    }) => {
      const saved = await repos.checkpointProgress.upsert(checkpoint);
      const lessonRecord = lesson ? await repos.lessonProgress.upsert(lesson) : null;
      return { saved, lessonRecord };
    },
    onMutate: ({ checkpoint, lesson }) => {
      const previous = queryClient.getQueryData<ProgressState>(key) ?? {
        lessons: {},
        checkpoints: {},
      };
      queryClient.setQueryData<ProgressState>(key, {
        lessons: lesson ? { ...previous.lessons, [lesson.lessonSlug]: lesson } : previous.lessons,
        checkpoints: {
          ...previous.checkpoints,
          [checkpointKey(checkpoint.lessonSlug, checkpoint.checkpointSlug)]: checkpoint,
        },
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: ({ saved, lessonRecord }) => {
      queryClient.setQueryData<ProgressState>(key, (prev) => {
        const base = prev ?? { lessons: {}, checkpoints: {} };
        return {
          lessons: lessonRecord
            ? { ...base.lessons, [lessonRecord.lessonSlug]: lessonRecord }
            : base.lessons,
          checkpoints: {
            ...base.checkpoints,
            [checkpointKey(saved.lessonSlug, saved.checkpointSlug)]: saved,
          },
        };
      });
    },
  });

  const build = useCallback(
    async ({ lessonSlug, checkpointSlug, completed }: ToggleVariables) => {
      const state = await queryClient.ensureQueryData<ProgressState>({
        queryKey: key,
        queryFn: () => loadProgress(repos, projectSlug),
      });
      const now = nowIso();
      const existing = state.checkpoints[checkpointKey(lessonSlug, checkpointSlug)];
      const checkpoint: CheckpointProgressRecord = {
        id: existing?.id ?? newId(),
        userId: existing?.userId ?? null,
        projectSlug,
        lessonSlug,
        checkpointSlug,
        completed,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      const currentLesson = state.lessons[lessonSlug];
      const lesson: LessonProgressRecord | null =
        !currentLesson || currentLesson.status === 'available'
          ? {
              id: currentLesson?.id ?? newId(),
              userId: currentLesson?.userId ?? null,
              projectSlug,
              lessonSlug,
              status: 'in_progress',
              startedAt: currentLesson?.startedAt ?? now,
              completedAt: null,
              createdAt: currentLesson?.createdAt ?? now,
              updatedAt: now,
            }
          : null;
      return { checkpoint, lesson };
    },
    [key, projectSlug, queryClient, repos],
  );

  return {
    mutate: (vars: ToggleVariables) => {
      void build(vars)
        .then((built) => mutation.mutateAsync(built))
        .catch(() => {
          /* chyba je ve stavovém pruhu */
        });
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}

/** Označí lekci za hotovou. Volající musí ověřit `canComplete` z doménové vrstvy. */
export function useCompleteLesson(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.progress(scope, projectSlug);

  return useMutation({
    scope: mutationScopes.progress(scope, projectSlug),
    mutationFn: async (lessonSlug: string) => {
      const state = await queryClient.ensureQueryData<ProgressState>({
        queryKey: key,
        queryFn: () => loadProgress(repos, projectSlug),
      });
      const existing = state.lessons[lessonSlug];
      const now = nowIso();
      return repos.lessonProgress.upsert({
        id: existing?.id ?? newId(),
        userId: existing?.userId ?? null,
        projectSlug,
        lessonSlug,
        status: 'completed',
        startedAt: existing?.startedAt ?? now,
        completedAt: now,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<ProgressState>(key, (prev) => ({
        lessons: { ...(prev?.lessons ?? {}), [saved.lessonSlug]: saved },
        checkpoints: prev?.checkpoints ?? {},
      }));
    },
  });
}
