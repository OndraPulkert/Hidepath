import { type CollectionRepository } from '@/features/data/local-collection';
import { naturalKeys, type Repositories } from '@/features/data/repositories';

/**
 * Přenos dat pořízených bez účtu (localStorage) do účtu po prvním přihlášení.
 * Čistý plán: co nahrát, co přeskočit. Pravidlo last-write-wins podle `updatedAt` (§10).
 */
export interface Timestamped {
  id: string;
  updatedAt: string;
}

export interface MigrationPlan<T> {
  toUpload: T[];
  skipped: T[];
}

export function planMigration<T extends Timestamped>(
  local: readonly T[],
  remote: readonly T[],
  naturalKey: (record: T) => string,
): MigrationPlan<T> {
  const remoteByKey = new Map(remote.map((r) => [naturalKey(r), r]));
  const toUpload: T[] = [];
  const skipped: T[] = [];
  for (const record of local) {
    const existing = remoteByKey.get(naturalKey(record));
    if (!existing) {
      toUpload.push(record);
    } else if (Date.parse(record.updatedAt) > Date.parse(existing.updatedAt)) {
      // Lokální je novější: zapíše se pod id vzdáleného řádku, aby nevznikl duplicitní přirozený klíč.
      toUpload.push({ ...record, id: existing.id });
    } else {
      skipped.push(record);
    }
  }
  return { toUpload, skipped };
}

export interface MigrationSummary {
  uploaded: number;
  skipped: number;
}

async function migrateCollection<T extends Timestamped>(
  local: CollectionRepository<T>,
  remote: CollectionRepository<T>,
  naturalKey: (record: T) => string,
  signal?: AbortSignal,
): Promise<MigrationSummary> {
  const localRecords = await local.list();
  if (localRecords.length === 0) return { uploaded: 0, skipped: 0 };
  const remoteRecords = await remote.list();
  const plan = planMigration(localRecords, remoteRecords, naturalKey);
  for (const record of plan.toUpload) {
    if (signal?.aborted) throw new DOMException('Přenos přerušen', 'AbortError');
    await remote.upsert(record);
  }
  // Lokální kopii smažeme až po úspěšném nahrání celé kolekce.
  await local.clear();
  return { uploaded: plan.toUpload.length, skipped: plan.skipped.length };
}

/** Přenese všechny lokální kolekce do účtu. Bez lokálních dat neudělá jediný vzdálený dotaz. */
export async function migrateLocalData(
  local: Repositories,
  remote: Repositories,
  signal?: AbortSignal,
): Promise<MigrationSummary> {
  const results = await Promise.all([
    migrateCollection(local.enrollments, remote.enrollments, naturalKeys.enrollments, signal),
    migrateCollection(local.inventory, remote.inventory, naturalKeys.inventory, signal),
    migrateCollection(
      local.lessonProgress,
      remote.lessonProgress,
      naturalKeys.lessonProgress,
      signal,
    ),
    migrateCollection(
      local.checkpointProgress,
      remote.checkpointProgress,
      naturalKeys.checkpointProgress,
      signal,
    ),
  ]);
  return results.reduce(
    (sum, r) => ({ uploaded: sum.uploaded + r.uploaded, skipped: sum.skipped + r.skipped }),
    {
      uploaded: 0,
      skipped: 0,
    },
  );
}

/** Má lokální úložiště vůbec něco k přenosu? Levná kontrola bez dotazů do sítě. */
export async function hasLocalData(local: Repositories): Promise<boolean> {
  const lists = await Promise.all([
    local.enrollments.list(),
    local.inventory.list(),
    local.lessonProgress.list(),
    local.checkpointProgress.list(),
  ]);
  return lists.some((l) => l.length > 0);
}
