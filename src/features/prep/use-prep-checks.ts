import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { applyPrepCheck, findPrepCheck, replacePrepCheck } from '@/features/prep/checks';
import { type PrepCheckRecord } from '@/features/prep/types';

/** Zaškrtnutí „Připravte si“ jednoho projektu (všechny lekce). */
export function usePrepChecks(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    // Lokální kopie (i s účtem – outbox): číst a zapisovat i offline, nečekat na síť.
    networkMode: 'always',
    queryKey: queryKeys.prepChecks(scope, projectSlug),
    queryFn: async () =>
      (await repos.prepChecks.list()).filter((c) => c.projectSlug === projectSlug),
  });
}

export interface SetPrepCheckVariables {
  lessonSlug: string;
  itemKey: string;
  checked: boolean;
}

/**
 * Zaškrtne / odškrtne položku přípravy. Záznam vzniká nad aktuálním obsahem úložiště
 * (idempotentně podle přirozeného klíče), cache se mění hned a při chybě se vrátí.
 */
export function useSetPrepCheck(projectSlug: string) {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.prepChecks(scope, projectSlug);

  return useMutation({
    networkMode: 'always',
    scope: mutationScopes.prepChecks(scope, projectSlug),
    mutationFn: async (vars: SetPrepCheckVariables) => {
      const input = { projectSlug, ...vars };
      const existing = findPrepCheck(await repos.prepChecks.list(), input);
      return repos.prepChecks.upsert(applyPrepCheck(existing, input, newId(), nowIso()));
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PrepCheckRecord[]>(key);
      const input = { projectSlug, ...vars };
      const current = previous ?? [];
      queryClient.setQueryData<PrepCheckRecord[]>(
        key,
        replacePrepCheck(
          current,
          applyPrepCheck(findPrepCheck(current, input), input, newId(), nowIso()),
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<PrepCheckRecord[]>(key, (prev) =>
        replacePrepCheck(prev ?? [], saved),
      );
    },
  });
}
