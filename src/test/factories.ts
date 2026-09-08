import { type EquipmentStatus } from '@/content/schema';
import { type InventoryItem, type InventoryState } from '@/features/inventory/types';
import {
  type CheckpointProgressRecord,
  type EnrollmentRecord,
  type LessonProgressRecord,
} from '@/features/progress/types';

const NOW = '2026-09-07T10:00:00.000Z';

export function item(
  slug: string,
  status: EquipmentStatus,
  extra: Partial<InventoryItem> = {},
): InventoryItem {
  return {
    id: `id-${slug}`,
    userId: null,
    equipmentSlug: slug,
    status,
    purchasePriceCents: null,
    currency: 'CZK',
    shopName: null,
    purchasedAt: null,
    notes: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}

export function inventoryOf(...items: InventoryItem[]): InventoryState {
  return Object.fromEntries(items.map((i) => [i.equipmentSlug, i]));
}

export function enrollment(
  projectSlug: string,
  extra: Partial<EnrollmentRecord> = {},
): EnrollmentRecord {
  return {
    id: `enr-${projectSlug}`,
    userId: null,
    projectSlug,
    contentVersion: 1,
    status: 'active',
    startedAt: NOW,
    completedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}

export function lessonDone(projectSlug: string, lessonSlug: string): LessonProgressRecord {
  return {
    id: `lp-${lessonSlug}`,
    userId: null,
    projectSlug,
    lessonSlug,
    status: 'completed',
    startedAt: NOW,
    completedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function checkpointDone(
  projectSlug: string,
  lessonSlug: string,
  checkpointSlug: string,
  completed = true,
): CheckpointProgressRecord {
  return {
    id: `cp-${lessonSlug}-${checkpointSlug}`,
    userId: null,
    projectSlug,
    lessonSlug,
    checkpointSlug,
    completed,
    createdAt: NOW,
    updatedAt: NOW,
  };
}
