/** Záznamy postupu (tabulky `lesson_progress`, `checkpoint_progress`, `project_enrollments`). */

export type StoredLessonStatus = 'available' | 'in_progress' | 'completed';

interface BaseRecord {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; v Milníku 2 (lokální data bez účtu) `null`. */
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressRecord extends BaseRecord {
  projectSlug: string;
  lessonSlug: string;
  status: StoredLessonStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CheckpointProgressRecord extends BaseRecord {
  projectSlug: string;
  lessonSlug: string;
  checkpointSlug: string;
  completed: boolean;
}

export type EnrollmentStatus = 'active' | 'completed' | 'archived';

export interface EnrollmentRecord extends BaseRecord {
  projectSlug: string;
  contentVersion: number;
  status: EnrollmentStatus;
  startedAt: string;
  completedAt: string | null;
}

export function checkpointKey(lessonSlug: string, checkpointSlug: string): string {
  return `${lessonSlug}/${checkpointSlug}`;
}

/** Stav postupu jednoho projektu. `locked` se nikdy neukládá, odvozuje se. */
export interface ProgressState {
  lessons: Readonly<Record<string, LessonProgressRecord>>;
  /** Klíč: `${lessonSlug}/${checkpointSlug}`. */
  checkpoints: Readonly<Record<string, CheckpointProgressRecord>>;
}

export const EMPTY_PROGRESS: ProgressState = { lessons: {}, checkpoints: {} };

export function isCheckpointCompleted(
  progress: ProgressState,
  lessonSlug: string,
  checkpointSlug: string,
): boolean {
  return progress.checkpoints[checkpointKey(lessonSlug, checkpointSlug)]?.completed ?? false;
}

/** „Má projekt?“ – platí pro aktivní i dokončený zápis; archivovaný se nepočítá. */
export function isEnrolled(
  enrollment: EnrollmentRecord | null | undefined,
): enrollment is EnrollmentRecord {
  if (!enrollment) return false;
  return enrollment.status !== 'archived';
}
