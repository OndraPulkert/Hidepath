import { useCallback } from 'react';

import { type ProjectDefinition } from '@/content/schema';
import { useEnrollProject } from '@/features/progress/use-progress';
import { setActiveProjectPreference } from '@/features/projects/active-project-preference';

/**
 * Založení a přepnutí aktivního projektu (přehled i stránka projektu). Nezačatý projekt se
 * zapíše a teprve po úspěšném zápisu se stane aktivním; chyba se neztratí jako nezachycený
 * promise, ukáže ji `isError`.
 */
export function useSwitchProject() {
  const enroll = useEnrollProject();
  const start = useCallback(
    async (project: ProjectDefinition): Promise<boolean> => {
      try {
        await enroll.mutateAsync({
          projectSlug: project.slug,
          contentVersion: project.contentVersion,
        });
      } catch {
        return false;
      }
      setActiveProjectPreference(project.slug);
      return true;
    },
    [enroll],
  );
  const switchTo = useCallback((project: ProjectDefinition) => {
    setActiveProjectPreference(project.slug);
  }, []);
  return { start, switchTo, isPending: enroll.isPending, isError: enroll.isError };
}
