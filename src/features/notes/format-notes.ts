import { type ProjectDefinition } from '@/content/schema';
import { type LessonNoteRecord } from '@/features/notes/types';

/**
 * Poznámky k projektu jako prostý text k odeslání – sem, zkušenému řemeslníkovi,
 * nebo jen do vlastního e-mailu. Řazení podle pořadí lekcí, prázdné poznámky se
 * vynechají. Čistá funkce, aby šla testovat bez UI.
 */
export function formatProjectNotes(
  project: Pick<ProjectDefinition, 'title' | 'lessons'>,
  notes: readonly LessonNoteRecord[],
  now: Date = new Date(),
): string {
  const byLesson = new Map(notes.map((n) => [n.lessonSlug, n]));
  const ordered = [...project.lessons].sort((a, b) => a.order - b.order);
  const sections = ordered.flatMap((lesson) => {
    const note = byLesson.get(lesson.slug);
    const text = note?.text.trim();
    if (!text) return [];
    return [`${String(lesson.order).padStart(2, '0')} ${lesson.title}\n${text}`];
  });
  if (sections.length === 0) return '';
  const date = now.toISOString().slice(0, 10);
  return [`Poznámky od ponku – ${project.title} (${date})`, '', ...sections].join('\n\n');
}

/** Kolik lekcí má neprázdnou poznámku. */
export function countNotedLessons(notes: readonly LessonNoteRecord[]): number {
  return notes.filter((n) => n.text.trim().length > 0).length;
}
