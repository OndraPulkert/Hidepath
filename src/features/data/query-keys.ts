/**
 * Klíče dotazů jsou vždy prefixované rozsahem dat (`local` bez účtu, jinak id uživatele).
 * Data dvou účtů se tak v cache nikdy nepotkají a přepnutí uživatele nevyžaduje mazání cache.
 */
export const queryKeys = {
  inventory: (scope: string) => [scope, 'inventory'] as const,
  enrollments: (scope: string) => [scope, 'enrollments'] as const,
  progress: (scope: string, projectSlug: string) => [scope, 'progress', projectSlug] as const,
};

/** Mutace v jednom scope běží sériově – zabrání dvěma souběžným INSERTům téže entity. */
export const mutationScopes = {
  inventory: (scope: string) => ({ id: `${scope}:inventory` }),
  enrollments: (scope: string) => ({ id: `${scope}:enrollments` }),
  progress: (scope: string, projectSlug: string) => ({ id: `${scope}:progress:${projectSlug}` }),
};

export const LOCAL_SCOPE = 'local';
