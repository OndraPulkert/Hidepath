import { type ProjectDefinition } from '@/content/schema';
import { type EquipmentReadiness } from '@/features/inventory/readiness';
import {
  findCurrentLesson,
  findNextUnfinishedLesson,
  type LessonView,
} from '@/features/progress/lesson-availability';
import { type JourneyProgress } from '@/features/progress/journey';

export interface BlockerAhead {
  equipmentSlug: string;
  status: 'ordered' | 'want_to_buy';
  unlocksLessonOrder: number;
}

export type NextAction =
  | { kind: 'choose_project' }
  | { kind: 'review_equipment'; missingRequired: number }
  | {
      kind: 'continue_lesson';
      lessonSlug: string;
      order: number;
      title: string;
      goal: string;
      /** Nejbližší zamčená lekce dál v cestě a položka, na kterou čeká. */
      blockerAhead: BlockerAhead | null;
    }
  | {
      kind: 'wait_for_equipment';
      lessonSlug: string;
      order: number;
      title: string;
      missing: readonly { equipmentSlug: string; status: 'ordered' | 'want_to_buy' }[];
    }
  | { kind: 'complete_project' }
  | { kind: 'project_completed' };

/**
 * Co má uživatel udělat právě teď (tmavá karta na přehledu). Pořadí:
 * bez projektu → výběr; žádné nezbytné vybavení ve stavu Mám a žádná dostupná lekce → nákupní
 * seznam; dostupná lekce → pokračovat; jinak čekání na vybavení; vše hotové → dokončení projektu.
 */
export function computeNextAction(
  project: ProjectDefinition,
  journey: JourneyProgress,
  readiness: EquipmentReadiness,
  enrolled: boolean,
): NextAction {
  if (!enrolled) return { kind: 'choose_project' };
  if (journey.currentPhase.kind === 'completion') {
    return journey.currentPhase.isComplete
      ? { kind: 'project_completed' }
      : { kind: 'complete_project' };
  }

  const current = findCurrentLesson(journey.lessonViews);
  if (current) {
    const lesson = project.lessons.find((l) => l.slug === current.slug)!;
    return {
      kind: 'continue_lesson',
      lessonSlug: lesson.slug,
      order: lesson.order,
      title: lesson.title,
      goal: lesson.goal,
      blockerAhead: findBlockerAhead(journey.lessonViews, current),
    };
  }

  const next = findNextUnfinishedLesson(journey.lessonViews);
  if (next && next.blockers.missingEquipment.length > 0) {
    const lesson = project.lessons.find((l) => l.slug === next.slug)!;
    if (readiness.byPriority.required.owned === 0) {
      return {
        kind: 'review_equipment',
        missingRequired: readiness.byPriority.required.missing.length,
      };
    }
    return {
      kind: 'wait_for_equipment',
      lessonSlug: lesson.slug,
      order: lesson.order,
      title: lesson.title,
      missing: next.blockers.missingEquipment,
    };
  }

  if (next) {
    // Nekonzistentní stav (lekce blokovaná jen prerekvizitou, která není hotová a není aktuální):
    // nejbezpečnější je poslat uživatele do lekce, kde uvidí důvod zámku.
    const lesson = project.lessons.find((l) => l.slug === next.slug)!;
    return {
      kind: 'continue_lesson',
      lessonSlug: lesson.slug,
      order: lesson.order,
      title: lesson.title,
      goal: lesson.goal,
      blockerAhead: null,
    };
  }
  return { kind: 'complete_project' };
}

function findBlockerAhead(views: readonly LessonView[], current: LessonView): BlockerAhead | null {
  const nextLocked = views.find(
    (v) =>
      v.order > current.order && v.status === 'locked' && v.blockers.missingEquipment.length > 0,
  );
  const first = nextLocked?.blockers.missingEquipment[0];
  if (!nextLocked || !first) return null;
  return {
    equipmentSlug: first.equipmentSlug,
    status: first.status,
    unlocksLessonOrder: nextLocked.order,
  };
}
