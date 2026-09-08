import {
  type EquipmentStatus,
  type LessonDefinition,
  type LessonStatus,
  type ProjectDefinition,
} from '@/content/schema';
import { isEquipmentReady } from '@/features/inventory/readiness';
import { getEquipmentStatus, type InventoryState } from '@/features/inventory/types';
import { isCheckpointCompleted, type ProgressState } from '@/features/progress/types';

export interface MissingEquipment {
  equipmentSlug: string;
  status: Exclude<EquipmentStatus, 'owned'>;
}

export interface LessonBlockers {
  missingEquipment: readonly MissingEquipment[];
  incompletePrerequisites: readonly string[];
}

export interface LessonView {
  slug: string;
  order: number;
  status: LessonStatus;
  /** První lekce, která není hotová a je dostupná (nebo rozpracovaná). */
  isCurrent: boolean;
  blockers: LessonBlockers;
  completedRequiredCheckpoints: number;
  totalRequiredCheckpoints: number;
  completedCheckpoints: number;
  totalCheckpoints: number;
  /** Dokončit lze jen dostupnou lekci se všemi povinnými body. */
  canComplete: boolean;
}

/**
 * Lekce je dostupná, když jsou hotové všechny prerekvizity a všechno nezbytné vybavení
 * lekce je `owned`. Blokovat může jen vybavení s prioritou `required` v projektu;
 * doporučené položky uvedené u lekce se do zámku nepočítají.
 */
export function computeLessonBlockers(
  project: Pick<ProjectDefinition, 'equipment'>,
  lesson: LessonDefinition,
  inventory: InventoryState,
  progress: ProgressState,
): LessonBlockers {
  const requiredInProject = new Set(
    project.equipment.filter((e) => e.priority === 'required').map((e) => e.equipmentSlug),
  );
  const missingEquipment: MissingEquipment[] = [];
  for (const slug of lesson.requiredEquipment) {
    if (!requiredInProject.has(slug)) continue;
    const status = getEquipmentStatus(inventory, slug);
    if (!isEquipmentReady(status)) {
      missingEquipment.push({ equipmentSlug: slug, status });
    }
  }
  const incompletePrerequisites = lesson.prerequisiteLessons.filter(
    (p) => progress.lessons[p]?.status !== 'completed',
  );
  return { missingEquipment, incompletePrerequisites };
}

export function computeLessonViews(
  project: ProjectDefinition,
  inventory: InventoryState,
  progress: ProgressState,
): LessonView[] {
  const views = [...project.lessons]
    .sort((a, b) => a.order - b.order)
    .map((lesson): LessonView => {
      const blockers = computeLessonBlockers(project, lesson, inventory, progress);
      const stored = progress.lessons[lesson.slug]?.status;
      const required = lesson.checkpoints.filter((c) => c.required);
      const completedRequired = required.filter((c) =>
        isCheckpointCompleted(progress, lesson.slug, c.slug),
      ).length;
      const completedAll = lesson.checkpoints.filter((c) =>
        isCheckpointCompleted(progress, lesson.slug, c.slug),
      ).length;
      const blocked =
        blockers.missingEquipment.length > 0 || blockers.incompletePrerequisites.length > 0;

      let status: LessonStatus;
      if (stored === 'completed') status = 'completed';
      else if (blocked) status = 'locked';
      else if (stored === 'in_progress') status = 'in_progress';
      else status = 'available';

      return {
        slug: lesson.slug,
        order: lesson.order,
        status,
        isCurrent: false,
        blockers,
        completedRequiredCheckpoints: completedRequired,
        totalRequiredCheckpoints: required.length,
        completedCheckpoints: completedAll,
        totalCheckpoints: lesson.checkpoints.length,
        canComplete: !blocked && stored !== 'completed' && completedRequired === required.length,
      };
    });

  const current = views.find((v) => v.status === 'available' || v.status === 'in_progress');
  if (current) current.isCurrent = true;
  return views;
}

export function findCurrentLesson(views: readonly LessonView[]): LessonView | undefined {
  return views.find((v) => v.isCurrent);
}

/** První nehotová lekce bez ohledu na zámek – pro „čeká na …“ hlášky. */
export function findNextUnfinishedLesson(views: readonly LessonView[]): LessonView | undefined {
  return views.find((v) => v.status !== 'completed');
}
