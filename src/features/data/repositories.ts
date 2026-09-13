import {
  type CollectionRepository,
  createStorageCollection,
  type StorageLike,
} from '@/features/data/local-collection';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import {
  type CheckpointProgressRecord,
  type EnrollmentRecord,
  type LessonProgressRecord,
} from '@/features/progress/types';

export interface Repositories {
  inventory: CollectionRepository<InventoryItem>;
  enrollments: CollectionRepository<EnrollmentRecord>;
  lessonProgress: CollectionRepository<LessonProgressRecord>;
  checkpointProgress: CollectionRepository<CheckpointProgressRecord>;
  /**
   * Poznámky od ponku. Zatím **jen v tomto zařízení** i při přihlášení – nesynchronizují
   * se a nepřenášejí do účtu (viz `data-provider`). Zařadí se do synchronizace v Milníku 4.
   */
  lessonNotes: CollectionRepository<LessonNoteRecord>;
}

/** Kolekce, které má cloud; poznámky zůstávají v zařízení a doplní je provider. */
export type CloudRepositories = Omit<Repositories, 'lessonNotes'>;

export const STORAGE_KEYS = {
  inventory: 'hidepath.v1.inventory',
  enrollments: 'hidepath.v1.enrollments',
  lessonProgress: 'hidepath.v1.lesson_progress',
  checkpointProgress: 'hidepath.v1.checkpoint_progress',
  lessonNotes: 'hidepath.v1.lesson_notes',
  /** Prefix příznaku „lokální data už přenesena do účtu <userId>“. */
  migrated: 'hidepath.v1.migrated',
} as const;

/** Přirozené klíče odpovídají unikátním omezením v databázi (§8). */
export const naturalKeys = {
  inventory: (r: InventoryItem) => r.equipmentSlug,
  enrollments: (r: EnrollmentRecord) => r.projectSlug,
  lessonProgress: (r: LessonProgressRecord) => `${r.projectSlug}/${r.lessonSlug}`,
  checkpointProgress: (r: CheckpointProgressRecord) =>
    `${r.projectSlug}/${r.lessonSlug}/${r.checkpointSlug}`,
  lessonNotes: (r: LessonNoteRecord) => `${r.projectSlug}/${r.lessonSlug}`,
};

/** Lokální repozitáře (bez účtu). V Milníku 4 přibude Dexie + outbox. */
export function createLocalRepositories(storage: StorageLike): Repositories {
  return {
    inventory: createStorageCollection(storage, STORAGE_KEYS.inventory, naturalKeys.inventory),
    enrollments: createStorageCollection(
      storage,
      STORAGE_KEYS.enrollments,
      naturalKeys.enrollments,
    ),
    lessonProgress: createStorageCollection(
      storage,
      STORAGE_KEYS.lessonProgress,
      naturalKeys.lessonProgress,
    ),
    checkpointProgress: createStorageCollection(
      storage,
      STORAGE_KEYS.checkpointProgress,
      naturalKeys.checkpointProgress,
    ),
    lessonNotes: createStorageCollection(
      storage,
      STORAGE_KEYS.lessonNotes,
      naturalKeys.lessonNotes,
    ),
  };
}
