import { type PrepCheckRecord } from '@/features/prep/types';
import { nextUpdatedAt } from '@/features/sync/merge';

export interface PrepCheckInput {
  projectSlug: string;
  lessonSlug: string;
  itemKey: string;
  checked: boolean;
}

/** Najde záznam položky podle přirozeného klíče (projekt, lekce, položka). */
export function findPrepCheck(
  records: readonly PrepCheckRecord[],
  { projectSlug, lessonSlug, itemKey }: Omit<PrepCheckInput, 'checked'>,
): PrepCheckRecord | undefined {
  return records.find(
    (r) => r.projectSlug === projectSlug && r.lessonSlug === lessonSlug && r.itemKey === itemKey,
  );
}

/**
 * Úplný záznam zaškrtnutí. Existující záznam si nechá `id`, `userId` i `createdAt`, takže zápis
 * je idempotentní. Odškrtnutí se ukládá jako `checked: false` (ne smazání), aby se při
 * synchronizaci novější odškrtnutí nepřepsalo starším zaškrtnutím. `updatedAt` je vždy pozdější
 * než stav `existing` (viz `nextUpdatedAt`).
 */
export function applyPrepCheck(
  existing: PrepCheckRecord | undefined,
  input: PrepCheckInput,
  id: string,
  now: string,
): PrepCheckRecord {
  return {
    id: existing?.id ?? id,
    userId: existing?.userId ?? null,
    projectSlug: input.projectSlug,
    lessonSlug: input.lessonSlug,
    itemKey: input.itemKey,
    checked: input.checked,
    createdAt: existing?.createdAt ?? now,
    updatedAt: nextUpdatedAt(existing?.updatedAt, Date.parse(now)),
  };
}

/** Nahradí (nebo přidá) záznam se stejným přirozeným klíčem. */
export function replacePrepCheck(
  records: readonly PrepCheckRecord[],
  record: PrepCheckRecord,
): PrepCheckRecord[] {
  const rest = records.filter(
    (r) =>
      !(
        r.projectSlug === record.projectSlug &&
        r.lessonSlug === record.lessonSlug &&
        r.itemKey === record.itemKey
      ),
  );
  return [...rest, record];
}
