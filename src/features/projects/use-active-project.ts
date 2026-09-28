import { projects, startingProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { useEnrollments } from '@/features/progress/use-progress';
import { resolveActiveProject } from '@/features/projects/active-project';
import { useActiveProjectPreference } from '@/features/projects/active-project-preference';

/**
 * Projekt, se kterým uživatel právě pracuje: volba z přehledu, jinak poslední zápis, jinak
 * první zastávka cesty (pravidla v `resolveActiveProject`). Stránky se na konkrétní projekt
 * nikdy neodkazují (ADR 002).
 */
export function useActiveProject(): ProjectDefinition {
  const { data: enrollments } = useEnrollments();
  const preferred = useActiveProjectPreference();
  return resolveActiveProject(projects, enrollments ?? [], preferred, startingProject);
}
