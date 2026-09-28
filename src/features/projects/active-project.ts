import { type ProjectDefinition } from '@/content/schema';
import { type EnrollmentRecord, isEnrolled } from '@/features/progress/types';

/**
 * Který projekt je aktivní (přehled, dílna a nákupy se řídí jím). Čistá funkce:
 * 1. projekt zvolený na přehledu (`preferredSlug`), pokud existuje a je do něj zápis,
 * 2. jinak projekt s naposledy změněným aktivním zápisem, pak s dokončeným,
 * 3. bez zápisu první zastávka cesty (`fallback`).
 * Archivovaný zápis se nepočítá; volba bez zápisu se ignoruje, aby přehled nikdy neukazoval
 * projekt, do kterého uživatel nevstoupil.
 */
export function resolveActiveProject(
  projects: readonly ProjectDefinition[],
  enrollments: readonly EnrollmentRecord[],
  preferredSlug: string | null,
  fallback: ProjectDefinition,
): ProjectDefinition {
  const known = new Map(projects.map((p) => [p.slug, p]));
  const enrolled = enrollments.filter((e) => isEnrolled(e) && known.has(e.projectSlug));
  if (preferredSlug && enrolled.some((e) => e.projectSlug === preferredSlug)) {
    return known.get(preferredSlug) ?? fallback;
  }
  const latest = (status: EnrollmentRecord['status']) =>
    enrolled
      .filter((e) => e.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const pick = latest('active') ?? latest('completed');
  return (pick && known.get(pick.projectSlug)) ?? fallback;
}
