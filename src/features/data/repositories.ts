import {
  type CollectionRepository,
  createStorageCollection,
  type StorageLike,
} from '@/features/data/local-collection';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonRecordEntry, lessonRecordKey } from '@/features/notebook/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { type PrepCheckRecord, prepCheckKey } from '@/features/prep/types';
import {
  type CheckpointProgressRecord,
  type EnrollmentRecord,
  type LessonProgressRecord,
} from '@/features/progress/types';

export interface Repositories {
  /** Inventář. S účtem přes synchronizovanou kolekci (lokál + outbox), funguje i offline. */
  inventory: CollectionRepository<InventoryItem>;
  enrollments: CollectionRepository<EnrollmentRecord>;
  lessonProgress: CollectionRepository<LessonProgressRecord>;
  checkpointProgress: CollectionRepository<CheckpointProgressRecord>;
  /**
   * Poznámky od ponku. Bez účtu v prohlížeči, s účtem přes synchronizovanou kolekci. Dokud
   * server tabulku `lesson_notes` nemá, zůstávají v lokální kopii účtu a odejdou později.
   */
  lessonNotes: CollectionRepository<LessonNoteRecord>;
  /** Zápisník (hodnoty polí z kroků). S účtem přes synchronizovanou kolekci (lokál + outbox). */
  lessonRecords: CollectionRepository<LessonRecordEntry>;
  /** Zaškrtnuté položky „Připravte si“. S účtem přes synchronizovanou kolekci. */
  prepChecks: CollectionRepository<PrepCheckRecord>;
}

/** Kolekce, které cloud může (ještě) nemít; dokud chybí, provider použije lokální. */
export type OptionalCloudCollections = 'lessonRecords' | 'prepChecks' | 'lessonNotes';

/**
 * Kolekce, které má cloud. Zápisník, příprava a poznámky jsou volitelné: bez nich zůstávají
 * v zařízení a nepřenášejí se.
 */
export type CloudRepositories = Omit<Repositories, OptionalCloudCollections> &
  Partial<Pick<Repositories, OptionalCloudCollections>>;

export const STORAGE_KEYS = {
  inventory: 'hidepath.v1.inventory',
  enrollments: 'hidepath.v1.enrollments',
  lessonProgress: 'hidepath.v1.lesson_progress',
  checkpointProgress: 'hidepath.v1.checkpoint_progress',
  lessonNotes: 'hidepath.v1.lesson_notes',
  lessonRecords: 'hidepath.v1.lesson_records',
  prepChecks: 'hidepath.v1.lesson_prep_checks',
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
  lessonRecords: (r: LessonRecordEntry) => lessonRecordKey(r.projectSlug, r.fieldId),
  prepChecks: (r: PrepCheckRecord) => prepCheckKey(r.projectSlug, r.lessonSlug, r.itemKey),
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
    lessonRecords: createStorageCollection(
      storage,
      STORAGE_KEYS.lessonRecords,
      naturalKeys.lessonRecords,
    ),
    prepChecks: createStorageCollection(storage, STORAGE_KEYS.prepChecks, naturalKeys.prepChecks),
  };
}
