import {
  type CollectionRepository,
  createStorageCollection,
  newId,
  type StorageLike,
  StorageWriteError,
} from '@/features/data/local-collection';
import { naturalKeys } from '@/features/data/repositories';
import { isStaleWriteError } from '@/features/data/supabase-repositories';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { mergeRemote, type SyncRecord } from '@/features/sync/merge';
import {
  acknowledge,
  createOutboxStore,
  dueMutations,
  enqueue,
  markAttempt,
  markFailed,
  nextRetryDelay,
  type OutboxStore,
  type OutboxSummary,
  summarizeOutbox,
  type SyncEntity,
} from '@/features/sync/outbox';

/**
 * Synchronizovaná kolekce (lokálně nejdřív, §10): čtení jde vždy z lokální kopie, zápis
 * 1) uloží lokálně, 2) zařadí změnu do outboxu, 3) zkusí ji odeslat. Selhaná změna zůstává
 * ve frontě s chybou a zkouší se znovu (driver: start, online, návrat do záložky, backoff).
 * Odstraní se až po potvrzení serverem. Server se starší zápis odmítne (stale) → pull.
 */

export interface OwnedSyncRecord extends SyncRecord {
  userId: string | null;
}

/** Lokální kopie s atomickým přepsáním celé kolekce (výsledek pullu). */
export interface LocalCache<T extends { id: string }> extends CollectionRepository<T> {
  replaceAll(records: T[]): Promise<void>;
}

export function createStorageCache<T extends { id: string }>(
  storage: StorageLike,
  key: string,
  naturalKey: (record: T) => string,
): LocalCache<T> {
  return {
    ...createStorageCollection(storage, key, naturalKey),
    replaceAll: async (records) => {
      try {
        storage.setItem(key, JSON.stringify(records));
      } catch (cause) {
        throw new StorageWriteError(key, cause);
      }
      return Promise.resolve();
    },
  };
}

export interface FlushResult {
  sent: number;
  failed: number;
  stale: number;
}

export interface SyncedCollection<T extends OwnedSyncRecord> extends CollectionRepository<T> {
  readonly entity: SyncEntity;
  /** Odešle čekající změny této kolekce. `force` = i ty, které čekají na další pokus. */
  flush(options?: { force?: boolean }): Promise<FlushResult>;
  /** Stáhne stav ze serveru a sloučí ho do lokální kopie. */
  pull(): Promise<{ changed: boolean }>;
}

export interface SyncedCollectionOptions<T extends OwnedSyncRecord> {
  entity: SyncEntity;
  userId: string;
  local: LocalCache<T>;
  remote: CollectionRepository<T>;
  outbox: OutboxStore;
  naturalKey: (record: T) => string;
  /** Lokální kopie se změnila zvenku (pull, oprava id po odeslání). */
  onChange?: (() => void) | undefined;
  now?: (() => number) | undefined;
  isOnline?: (() => boolean) | undefined;
}

export function browserIsOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/** Jednoduchý zámek: lokální čtení-úprava-zápis neproběhnou proloženě. */
function createLock() {
  let tail: Promise<unknown> = Promise.resolve();
  return <R>(fn: () => Promise<R>): Promise<R> => {
    const run = tail.then(fn, fn);
    tail = run.catch(() => undefined);
    return run;
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createSyncedCollection<T extends OwnedSyncRecord>(
  options: SyncedCollectionOptions<T>,
): SyncedCollection<T> {
  const { entity, userId, local, remote, outbox, naturalKey } = options;
  const now = options.now ?? Date.now;
  const isOnline = options.isOnline ?? browserIsOnline;
  const withLock = createLock();
  const changed = () => options.onChange?.();

  /** Klíče, které se během běžícího stažení zařadily do fronty (viz `pull`). */
  const activePulls = new Set<Set<string>>();

  const enqueueChange = (operation: 'upsert' | 'delete', key: string, payload: unknown) => {
    for (const touched of activePulls) touched.add(key);
    outbox.update((queue) =>
      enqueue(queue, {
        id: newId(),
        userId,
        entity,
        entityId: key,
        operation,
        payload,
        createdAt: new Date(now()).toISOString(),
      }),
    );
  };

  let flushing: Promise<FlushResult> | null = null;
  let again = false;
  let againForce = false;

  const flushOnce = async (force: boolean): Promise<FlushResult> => {
    const result: FlushResult = { sent: 0, failed: 0, stale: 0 };
    if (!isOnline()) return result;
    for (const mutation of dueMutations(outbox.list(), now(), { entity, force })) {
      if (mutation.userId !== userId) continue;
      outbox.update((queue) => markAttempt(queue, mutation.id, now()));
      try {
        if (mutation.operation === 'upsert') {
          const payload = mutation.payload as T;
          const saved = await remote.upsert(payload);
          await withLock(async () => {
            const stillCurrent = outbox.list().some((m) => m.id === mutation.id);
            outbox.update((queue) => acknowledge(queue, mutation.id));
            // Novější lokální zápis téhož klíče má přednost; jinak převezmi stav serveru.
            if (stillCurrent) {
              if (saved.id !== payload.id) await local.remove(payload.id);
              await local.upsert(saved);
              if (saved.id !== payload.id) changed();
            }
          });
        } else {
          const { id } = mutation.payload as { id: string };
          await remote.remove(id);
          outbox.update((queue) => acknowledge(queue, mutation.id));
        }
        result.sent += 1;
      } catch (error) {
        if (isStaleWriteError(error)) {
          outbox.update((queue) => acknowledge(queue, mutation.id));
          result.stale += 1;
        } else {
          outbox.update((queue) => markFailed(queue, mutation.id, errorMessage(error), now()));
          result.failed += 1;
        }
      }
    }
    if (result.stale > 0) await pull();
    return result;
  };

  const flush = (flushOptions: { force?: boolean } = {}): Promise<FlushResult> => {
    if (flushing) {
      again = true;
      againForce ||= flushOptions.force === true;
      return flushing;
    }
    flushing = (async () => {
      const total: FlushResult = { sent: 0, failed: 0, stale: 0 };
      let force = flushOptions.force === true;
      try {
        do {
          again = false;
          const r = await flushOnce(force);
          total.sent += r.sent;
          total.failed += r.failed;
          total.stale += r.stale;
          force = againForce;
          againForce = false;
        } while (again);
        return total;
      } finally {
        // Synchronně s koncem smyčky: další volání flush() už spustí nový běh.
        flushing = null;
      }
    })();
    return flushing;
  };

  const flushInBackground = () => {
    flush().catch((error: unknown) => {
      console.error(`[sync] Odeslání změn (${entity}) selhalo`, error);
    });
  };

  const pendingKeysNow = () =>
    outbox
      .list()
      .filter((m) => m.entity === entity)
      .map((m) => m.entityId);

  const pull = async (): Promise<{ changed: boolean }> => {
    // Klíče čekající před stažením nebo zapsané během něj: jejich změna mohla odejít
    // a potvrdit se, zatímco server posílal starší snímek. Bez nich by čerstvě odeslaný
    // zápis lokálně zmizel (nebo by se vrátil právě smazaný řádek) až do dalšího stažení.
    const touched = new Set(pendingKeysNow());
    activePulls.add(touched);
    let serverRecords: T[];
    try {
      serverRecords = await remote.list();
    } catch (error) {
      activePulls.delete(touched);
      throw error;
    }
    const merged = await withLock(async () => {
      activePulls.delete(touched);
      const pendingKeys = new Set([...touched, ...pendingKeysNow()]);
      const result = mergeRemote(await local.list(), serverRecords, naturalKey, pendingKeys);
      if (result.changed) await local.replaceAll(result.records);
      for (const record of result.resend) enqueueChange('upsert', naturalKey(record), record);
      return result;
    });
    if (merged.changed) changed();
    if (merged.resend.length > 0) flushInBackground();
    return { changed: merged.changed };
  };

  return {
    entity,
    list: () => local.list(),

    async upsert(record) {
      const saved = await withLock(async () => {
        const stored = await local.upsert({ ...record, userId });
        enqueueChange('upsert', naturalKey(stored), stored);
        return stored;
      });
      flushInBackground();
      return saved;
    },

    async remove(id) {
      await withLock(async () => {
        const existing = (await local.list()).find((r) => r.id === id);
        await local.remove(id);
        if (existing) enqueueChange('delete', naturalKey(existing), { id });
      });
      flushInBackground();
    },

    async clear() {
      await withLock(async () => {
        outbox.update((queue) => queue.filter((m) => m.entity !== entity));
        await local.clear();
      });
      await remote.clear();
    },

    flush,
    pull,
  };
}

// --- Ovladač synchronizace jednoho uživatele -------------------------------------------------

export type SyncSnapshot = OutboxSummary;

export interface SyncController {
  /** Odešle čekající změny všech kolekcí. */
  flush(options?: { force?: boolean }): Promise<void>;
  /** Odešle změny a pak stáhne stav serveru. */
  sync(): Promise<void>;
  /** Stabilní snímek pro `useSyncExternalStore` (stejný obsah = stejný objekt). */
  getSnapshot(): SyncSnapshot;
  subscribe(listener: () => void): () => void;
  /** Za kolik ms zkusit znovu selhané změny; `null` = nic nečeká na opakování. */
  retryDelay(): number | null;
  /** Volat při `storage` události: změnu z jiné záložky ohlásí odběratelům. */
  handleStorageEvent(key: string | null): void;
}

export function createSyncController(options: {
  outbox: OutboxStore;
  collections: readonly SyncedCollection<OwnedSyncRecord>[];
  /** Klíče lokálních kopií ve stejném pořadí jako `collections` (změny z jiné záložky). */
  cacheKeys?: readonly string[] | undefined;
  /** Lokální kopie se změnila jinak než zápisem z UI (pull, jiná záložka); `null` = nevíme která. */
  onRemoteChange?: ((entity: SyncEntity | null) => void) | undefined;
  now?: (() => number) | undefined;
}): SyncController {
  const { outbox, collections } = options;
  const now = options.now ?? Date.now;
  let snapshot: SyncSnapshot | null = null;

  const compute = (): SyncSnapshot => {
    const next = summarizeOutbox(outbox.list());
    if (snapshot?.pendingCount === next.pendingCount && snapshot.failedCount === next.failedCount) {
      return snapshot;
    }
    snapshot = next;
    return next;
  };

  const logged = (label: string) => (error: unknown) => {
    console.error(`[sync] ${label} selhalo`, error);
  };

  const flush = async (flushOptions?: { force?: boolean }) => {
    await Promise.all(
      collections.map((c) =>
        c.flush(flushOptions).then(() => undefined, logged(`Odeslání (${c.entity})`)),
      ),
    );
  };

  return {
    flush,
    async sync() {
      await flush();
      await Promise.all(
        collections.map((c) => c.pull().then(() => undefined, logged(`Stažení (${c.entity})`))),
      );
    },
    getSnapshot: compute,
    subscribe(listener) {
      return outbox.subscribe(listener);
    },
    retryDelay: () => nextRetryDelay(outbox.list(), now()),
    handleStorageEvent(key) {
      if (key === null) {
        outbox.notifyExternalChange();
        options.onRemoteChange?.(null);
        return;
      }
      if (key === outbox.key) outbox.notifyExternalChange();
      const index = options.cacheKeys?.indexOf(key) ?? -1;
      const collection = index === -1 ? undefined : collections[index];
      if (collection) options.onRemoteChange?.(collection.entity);
    },
  };
}

// --- Sestavení pro přihlášeného uživatele ----------------------------------------------------

/** Lokální klíče v cloud režimu jsou per uživatel; anonymní data mají `hidepath.v1.*`. */
export function userSyncKeys(userId: string) {
  const prefix = `hidepath.v1.u.${userId}`;
  return {
    lessonRecords: `${prefix}.lesson_records`,
    prepChecks: `${prefix}.lesson_prep_checks`,
    outbox: `${prefix}.outbox`,
  } as const;
}

export interface UserSync {
  lessonRecords: SyncedCollection<LessonRecordEntry>;
  prepChecks: SyncedCollection<PrepCheckRecord>;
  controller: SyncController;
}

export function createUserSync(options: {
  storage: StorageLike;
  userId: string;
  remote: {
    lessonRecords: CollectionRepository<LessonRecordEntry>;
    prepChecks: CollectionRepository<PrepCheckRecord>;
  };
  onRemoteChange?: ((entity: SyncEntity | null) => void) | undefined;
  now?: (() => number) | undefined;
  isOnline?: (() => boolean) | undefined;
}): UserSync {
  const { storage, userId, remote } = options;
  const keys = userSyncKeys(userId);
  const outbox = createOutboxStore(storage, keys.outbox);
  const common = { userId, outbox, now: options.now, isOnline: options.isOnline };

  const lessonRecords = createSyncedCollection<LessonRecordEntry>({
    ...common,
    entity: 'lesson_records',
    local: createStorageCache(storage, keys.lessonRecords, naturalKeys.lessonRecords),
    remote: remote.lessonRecords,
    naturalKey: naturalKeys.lessonRecords,
    onChange: () => options.onRemoteChange?.('lesson_records'),
  });
  const prepChecks = createSyncedCollection<PrepCheckRecord>({
    ...common,
    entity: 'lesson_prep_checks',
    local: createStorageCache(storage, keys.prepChecks, naturalKeys.prepChecks),
    remote: remote.prepChecks,
    naturalKey: naturalKeys.prepChecks,
    onChange: () => options.onRemoteChange?.('lesson_prep_checks'),
  });

  const controller = createSyncController({
    outbox,
    collections: [lessonRecords, prepChecks],
    cacheKeys: [keys.lessonRecords, keys.prepChecks],
    onRemoteChange: options.onRemoteChange,
    now: options.now,
  });

  return { lessonRecords, prepChecks, controller };
}
