import { type PhaseDefinition, type ProjectDefinition } from '@/content/schema';
import { computeEquipmentReadiness } from '@/features/inventory/readiness';
import { type InventoryState } from '@/features/inventory/types';
import { computeLessonViews, type LessonView } from '@/features/progress/lesson-availability';
import { type EnrollmentRecord, type ProgressState } from '@/features/progress/types';

export interface PhaseProgress {
  slug: string;
  code: string;
  name: string;
  kind: PhaseDefinition['kind'];
  /** Splněné / celkem povinné úkoly fáze. */
  done: number;
  total: number;
  ratio: number;
  isComplete: boolean;
  isCurrent: boolean;
  /** Krátký popis pro UI, např. „0 ze 3 lekcí“ nebo „7 z 9“. */
  detail: string;
  lessons: readonly LessonView[];
}

export interface JourneyProgress {
  phases: readonly PhaseProgress[];
  currentPhase: PhaseProgress;
  /** Index aktuální fáze od 1 (pro „fáze 4 ze 6“). */
  currentPhaseNumber: number;
  /** Celá cesta: splněné povinné úkoly / všechny povinné úkoly. */
  overallRatio: number;
  completedLessons: number;
  totalLessons: number;
  lessonViews: readonly LessonView[];
}

export interface JourneyInput {
  enrollment: EnrollmentRecord | null;
  inventory: InventoryState;
  progress: ProgressState;
}

/**
 * Jediná sdílená funkce pro postup (IMPLEMENTATION.md §9): počítá se z povinných úkolů –
 * výběr projektu, nezbytné vybavení ve stavu Mám, povinné kontrolní body lekcí, označení
 * projektu za hotový. Nikdy z navštívených obrazovek.
 */
export function computeJourney(project: ProjectDefinition, input: JourneyInput): JourneyProgress {
  const lessonViews = computeLessonViews(project, input.inventory, input.progress);
  const readiness = computeEquipmentReadiness(project, input.inventory);
  const enrolled = input.enrollment !== null;
  const projectCompleted = input.enrollment?.status === 'completed';

  const phases: PhaseProgress[] = project.phases.map((phase) => {
    let done = 0;
    let total = 0;
    let detail = '';
    let lessons: LessonView[] = [];

    switch (phase.kind) {
      case 'enrollment':
        total = 1;
        done = enrolled ? 1 : 0;
        detail = enrolled ? 'vybráno' : 'čeká na výběr';
        break;
      case 'equipment': {
        const r = readiness.byPriority.required;
        total = r.total;
        done = r.owned;
        detail = `${r.owned} z ${r.total} nezbytných`;
        break;
      }
      case 'lessons': {
        const slugs = new Set(
          project.lessons.filter((l) => l.phaseSlug === phase.slug).map((l) => l.slug),
        );
        lessons = lessonViews.filter((v) => slugs.has(v.slug));
        total = lessons.reduce((sum, v) => sum + v.totalRequiredCheckpoints, 0);
        done = lessons.reduce(
          (sum, v) =>
            sum +
            (v.status === 'completed'
              ? v.totalRequiredCheckpoints
              : v.completedRequiredCheckpoints),
          0,
        );
        const completedLessons = lessons.filter((v) => v.status === 'completed').length;
        detail = `${completedLessons} ${lessons.length === 1 ? 'z 1 lekce' : `ze ${lessons.length} lekcí`}`;
        break;
      }
      case 'completion':
        total = 1;
        done = projectCompleted ? 1 : 0;
        detail = projectCompleted ? 'projekt hotový' : 'čeká na dokončení';
        break;
    }

    const ratio = total === 0 ? 1 : done / total;
    // Fáze lekcí je hotová až dokončením lekcí (tlačítko Dokončit), ne pouhým odškrtáním bodů.
    const isComplete =
      phase.kind === 'lessons' ? lessons.every((v) => v.status === 'completed') : ratio >= 1;
    return {
      slug: phase.slug,
      code: phase.code,
      name: phase.name,
      kind: phase.kind,
      done,
      total,
      ratio,
      isComplete,
      isCurrent: false,
      detail,
      lessons,
    };
  });

  // Aktuální fáze: je-li dostupná (nebo rozpracovaná) lekce, je to fáze této lekce – i když
  // ještě chybí část vybavení pro pozdější lekce. Jinak první nedokončená fáze, jinak poslední.
  const currentLesson = lessonViews.find((v) => v.isCurrent);
  const lessonPhase = currentLesson
    ? phases.find((p) => p.lessons.some((v) => v.slug === currentLesson.slug))
    : undefined;
  const firstIncomplete = phases.findIndex((p) => !p.isComplete);
  const currentPhase =
    (enrolled ? lessonPhase : undefined) ??
    phases[firstIncomplete === -1 ? phases.length - 1 : firstIncomplete];
  if (!currentPhase) throw new Error('Projekt nemá žádné fáze.');
  currentPhase.isCurrent = true;

  const totalTasks = phases.reduce((s, p) => s + p.total, 0);
  const doneTasks = phases.reduce((s, p) => s + p.done, 0);

  return {
    phases,
    currentPhase,
    currentPhaseNumber: phases.indexOf(currentPhase) + 1,
    overallRatio: totalTasks === 0 ? 0 : doneTasks / totalTasks,
    completedLessons: lessonViews.filter((v) => v.status === 'completed').length,
    totalLessons: lessonViews.length,
    lessonViews,
  };
}
