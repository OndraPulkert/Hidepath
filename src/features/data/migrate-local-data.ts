import { type CollectionRepository } from '@/features/data/local-collection';
import { nowIso } from '@/features/data/local-collection';
import {
  naturalKeys,
  type CloudRepositories,
  type Repositories,
} from '@/features/data/repositories';
import { mergeNoteForMigration } from '@/features/notes/types';

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

/**
 * Sloučení kolize (záznam v zařízení i v účtu): co nahrát, nebo `null` = přeskočit.
 * Bez něj platí last-write-wins.
 */
export type ResolveConflict<T> = (local: T, remote: T) => T | null;

export function planMigration<T extends Timestamped>(
  local: readonly T[],
  remote: readonly T[],
  naturalKey: (record: T) => string,
  resolve?: ResolveConflict<T>,
): MigrationPlan<T> {
  const remoteByKey = new Map(remote.map((r) => [naturalKey(r), r]));
  const toUpload: T[] = [];
  const skipped: T[] = [];
  for (const record of local) {
    const existing = remoteByKey.get(naturalKey(record));
    if (!existing) {
      toUpload.push(record);
    } else if (resolve) {
      const merged = resolve(record, existing);
      if (merged) toUpload.push({ ...merged, id: existing.id });
      else skipped.push(record);
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
  resolve?: ResolveConflict<T>,
): Promise<MigrationSummary> {
  const localRecords = await local.list();
  if (localRecords.length === 0) return { uploaded: 0, skipped: 0 };
  await refreshFromServer(remote, resolve !== undefined);
  const remoteRecords = await remote.list();
  const plan = planMigration(localRecords, remoteRecords, naturalKey, resolve);
  for (const record of plan.toUpload) {
    if (signal?.aborted) throw new DOMException('Přenos přerušen', 'AbortError');
    await remote.upsert(record);
  }
  // Lokální kopii smažeme až po úspěšném nahrání celé kolekce.
  await local.clear();
  return { uploaded: plan.toUpload.length, skipped: plan.skipped.length };
}

/**
 * Synchronizovaná kolekce účtu čte z lokální kopie, která je na novém zařízení (nebo před
 * prvním stažením) prázdná. Plán by pak kolizi s řádkem v účtu neviděl: zápis by na serveru
 * buď přepsal text účtu, nebo ho trigger `reject_stale_update` zahodil. Proto nejdřív stáhnout.
 * Bez spojení: last-write-wins kolekce pokračují (server starší zápis odmítne), ale slučování
 * (`required`, poznámky) bez stavu účtu nejde – přenos selže a data zůstanou v prohlížeči.
 */
async function refreshFromServer(remote: object, required: boolean): Promise<void> {
  const { pull } = remote as { pull?: unknown };
  if (typeof pull !== 'function') return;
  try {
    await (pull as () => Promise<unknown>).call(remote);
  } catch (error) {
    if (required) throw error;
  }
}

export interface MigrationOptions {
  /**
   * Jen poznámky od ponku: ostatní data se do účtu už přenesla dřív, poznámky ale do té doby
   * zůstávaly v zařízení i s účtem a přenesou se při první synchronizaci.
   */
  notesOnly?: boolean | undefined;
}

/**
 * Přenese všechny lokální kolekce do účtu. Bez lokálních dat neudělá jediný vzdálený dotaz.
 * Zápisník, přípravu a poznámky přenáší, jen když je cloud má; jinak zůstanou v zařízení.
 */
export async function migrateLocalData(
  local: Repositories,
  remote: CloudRepositories,
  signal?: AbortSignal,
  options: MigrationOptions = {},
): Promise<MigrationSummary> {
  // Text poznámky se při kolizi nepřepíše starším ani novějším: oba texty se spojí.
  const notes = remote.lessonNotes
    ? [
        migrateCollection(
          local.lessonNotes,
          remote.lessonNotes,
          naturalKeys.lessonNotes,
          signal,
          (device, account) => mergeNoteForMigration(device, account, nowIso()),
        ),
      ]
    : [];
  const results = await Promise.all([
    ...notes,
    ...(options.notesOnly ? [] : migrateOtherCollections(local, remote, signal)),
  ]);
  return results.reduce(
    (sum, r) => ({ uploaded: sum.uploaded + r.uploaded, skipped: sum.skipped + r.skipped }),
    {
      uploaded: 0,
      skipped: 0,
    },
  );
}

function migrateOtherCollections(
  local: Repositories,
  remote: CloudRepositories,
  signal?: AbortSignal,
): Promise<MigrationSummary>[] {
  return [
    ...(remote.lessonRecords
      ? [
          migrateCollection(
            local.lessonRecords,
            remote.lessonRecords,
            naturalKeys.lessonRecords,
            signal,
          ),
        ]
      : []),
    ...(remote.prepChecks
      ? [migrateCollection(local.prepChecks, remote.prepChecks, naturalKeys.prepChecks, signal)]
      : []),
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
  ];
}

/**
 * Má lokální úložiště vůbec něco k přenosu? Levná kontrola bez dotazů do sítě. Zápisník,
 * přípravu a poznámky počítá, jen když je `remote` má (jinak se nepřenášejí).
 */
export async function hasLocalData(
  local: Repositories,
  remote?: CloudRepositories,
  options: MigrationOptions = {},
): Promise<boolean> {
  const notes = remote?.lessonNotes ? [local.lessonNotes.list()] : [];
  const lists = await Promise.all(
    options.notesOnly
      ? notes
      : [
          local.enrollments.list(),
          local.inventory.list(),
          local.lessonProgress.list(),
          local.checkpointProgress.list(),
          ...(remote?.lessonRecords ? [local.lessonRecords.list()] : []),
          ...(remote?.prepChecks ? [local.prepChecks.list()] : []),
          ...notes,
        ],
  );
  return lists.some((l) => l.length > 0);
}
