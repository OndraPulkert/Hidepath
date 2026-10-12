import type { LessonDefinition, ProjectDefinition } from '@/content/schema';

/** Povinné a volitelné lekce projektu; čas projektu (`estimatedHours`) popisuje jen povinné. */
export function lessonCounts(project: Pick<ProjectDefinition, 'lessons'>): {
  required: number;
  optional: number;
} {
  const optional = project.lessons.filter((l) => l.optional).length;
  return { required: project.lessons.length - optional, optional };
}

/** „6 lekcí + 1 volitelná“, bez volitelných jen „3 lekcí“ (tvar jako dosud na kartách projektu). */
export function lessonCountLabel(project: Pick<ProjectDefinition, 'lessons'>): string {
  const { required, optional } = lessonCounts(project);
  const base = `${required} lekcí`;
  if (optional === 0) return base;
  return `${base} + ${optional} ${optional === 1 ? 'volitelná' : 'volitelné'}`;
}

/**
 * Kam po dokončení lekce: na další povinnou lekci. Volitelné lekce za ní se přeskočí (projekt je
 * hotový bez nich, další krok je dokončit projekt). Z volitelné lekce vede dál další lekce v pořadí.
 */
export function nextLessonAfterFinish(
  lessons: readonly LessonDefinition[],
  currentSlug: string,
): LessonDefinition | undefined {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((l) => l.slug === currentSlug);
  if (index < 0) return undefined;
  const rest = ordered.slice(index + 1);
  return ordered[index]!.optional ? rest[0] : rest.find((l) => !l.optional);
}
