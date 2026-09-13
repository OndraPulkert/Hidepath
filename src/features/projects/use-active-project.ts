import { startingProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';

/**
 * Projekt, se kterým uživatel právě pracuje. Dnes existuje jediný, takže je to
 * první zastávka cesty učení; až budou projekty dva, rozhodne tady zápis
 * (enrollment) a stránky se nemění. Je to hook, ne konstanta, právě proto, aby
 * ten přechod nevyžadoval úpravu volajících.
 */
export function useActiveProject(): ProjectDefinition {
  return startingProject;
}
