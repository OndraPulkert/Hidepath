import {
  type CollectionRepository,
  createStorageCollection,
  type StorageLike,
} from '@/features/data/local-collection';
import { type InventoryItem } from '@/features/inventory/types';
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
}

export const STORAGE_KEYS = {
  inventory: 'hidepath.v1.inventory',
  enrollments: 'hidepath.v1.enrollments',
  lessonProgress: 'hidepath.v1.lesson_progress',
  checkpointProgress: 'hidepath.v1.checkpoint_progress',
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
  };
}
