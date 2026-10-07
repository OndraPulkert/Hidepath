import { z } from 'zod';

import { type StorageLike, StorageWriteError } from '@/features/data/local-collection';

/**
 * Outbox: fronta změn, které ještě nedošly na server (IMPLEMENTATION.md §10). Malý řez
 * Milníku 4 nad localStorage místo IndexedDB. Čisté funkce nad polem + tenký obal nad
 * úložištěm. Na každou entitu a přirozený klíč je ve frontě nejvýš jedna změna: novější
 * zápis starší nahradí (na serveru stejně platí jen poslední stav).
 */

export const SYNC_ENTITIES = [
  'lesson_records',
  'lesson_prep_checks',
  'inventory_items',
  'lesson_notes',
] as const;
export type SyncEntity = (typeof SYNC_ENTITIES)[number];

/**
 * `deferred` = server tabulku entity (zatím) nemá, např. migrace ještě není nasazená. Změna
 * zůstává v zařízení, nepočítá se jako čekající ani selhaná (žádný pruh s chybou) a zkusí se
 * znovu až po `nextAttemptAt`.
 */
export type MutationStatus = 'pending' | 'syncing' | 'failed' | 'deferred';

export interface PendingMutation {
  /** Id této verze změny. Nová změna téhož klíče dostane nové id. */
  id: string;
  userId: string;
  entity: SyncEntity;
  /** Přirozený klíč záznamu (např. `lid-wallet/p1-thickness`). */
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: unknown;
  createdAt: string;
  attempts: number;
  status: MutationStatus;
  lastError?: string;
  /**
   * Nejdřívější čas dalšího pokusu (epoch ms): po selhání podle backoffu, u „syncing“ čas,
   * po kterém se odesílání považuje za přerušené (záložka zavřená uprostřed požadavku).
   */
  nextAttemptAt?: number;
}

const mutationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  entity: z.enum(SYNC_ENTITIES),
  entityId: z.string().min(1),
  operation: z.enum(['upsert', 'delete']),
  payload: z.unknown(),
  createdAt: z.string(),
  attempts: z.number().int().min(0),
  status: z.enum(['pending', 'syncing', 'failed', 'deferred']),
  lastError: z.string().optional(),
  nextAttemptAt: z.number().optional(),
});

/** Načte frontu z JSON; poškozené položky zahodí (nikdy nespadne). */
export function parseOutbox(raw: string | null): PendingMutation[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: PendingMutation[] = [];
  for (const item of parsed) {
    const result = mutationSchema.safeParse(item);
    if (result.success) out.push(result.data as PendingMutation);
  }
  return out;
}

export interface NewMutation {
  id: string;
  userId: string;
  entity: SyncEntity;
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: unknown;
  createdAt: string;
}

/** Přidá změnu; existující změnu téže entity a klíče nahradí (pozice ve frontě zůstane). */
export function enqueue(queue: readonly PendingMutation[], next: NewMutation): PendingMutation[] {
  const mutation: PendingMutation = { ...next, attempts: 0, status: 'pending' };
  const index = queue.findIndex((m) => m.entity === next.entity && m.entityId === next.entityId);
  if (index === -1) return [...queue, mutation];
  const copy = [...queue];
  copy[index] = mutation;
  return copy;
}

/** Jak dlouho smí odesílání trvat, než ho jiná záložka považuje za přerušené. */
export const SYNCING_TIMEOUT_MS = 60_000;

/**
 * Pokus o odeslání začal. S `now` si změna pamatuje, kdy se odesílání považuje za přerušené:
 * zavře-li se záložka uprostřed požadavku, jiná otevřená záložka změnu po čase odešle sama
 * (jinak by „syncing“ viselo až do dalšího spuštění aplikace).
 */
export function markAttempt(
  queue: readonly PendingMutation[],
  id: string,
  now?: number,
): PendingMutation[] {
  return queue.map((m) =>
    m.id === id
      ? {
          ...m,
          status: 'syncing' as const,
          attempts: m.attempts + 1,
          ...(now === undefined ? {} : { nextAttemptAt: now + SYNCING_TIMEOUT_MS }),
        }
      : m,
  );
}

/** Pokus selhal: změna zůstává ve frontě s chybou a časem dalšího pokusu. */
export function markFailed(
  queue: readonly PendingMutation[],
  id: string,
  error: string,
  now: number,
): PendingMutation[] {
  return queue.map((m) =>
    m.id === id
      ? {
          ...m,
          status: 'failed' as const,
          lastError: error,
          nextAttemptAt: now + backoffMs(m.attempts),
        }
      : m,
  );
}

/** Jak dlouho počkat, než se znovu zkusí entita, jejíž tabulka na serveru chybí. */
export const DEFERRED_RETRY_MS = 30 * 60_000;

/** Server tabulku entity nemá: změna zůstává v zařízení a zkusí se po `until`. */
export function markDeferred(
  queue: readonly PendingMutation[],
  id: string,
  until: number,
): PendingMutation[] {
  return queue.map((m) => {
    if (m.id !== id) return m;
    const { lastError: _lastError, ...rest } = m;
    return { ...rest, status: 'deferred' as const, nextAttemptAt: until };
  });
}

/** Server změnu potvrdil. Odstraní ji jen tehdy, když ji mezitím nenahradila novější. */
export function acknowledge(queue: readonly PendingMutation[], id: string): PendingMutation[] {
  return queue.filter((m) => m.id !== id);
}

/** Po pádu nebo zavření aplikace uprostřed odesílání se „syncing“ vrací na „pending“. */
export function recoverInterrupted(queue: readonly PendingMutation[]): PendingMutation[] {
  return queue.map((m) => (m.status === 'syncing' ? { ...m, status: 'pending' as const } : m));
}

/** Změny, které je teď vhodné odeslat. `force` ignoruje čekání po selhání (tlačítko „Zkusit znovu“). */
export function dueMutations(
  queue: readonly PendingMutation[],
  now: number,
  options: { entity?: SyncEntity; force?: boolean } = {},
): PendingMutation[] {
  return queue.filter((m) => {
    if (options.entity !== undefined && m.entity !== options.entity) return false;
    // Odesílání v běhu (i v jiné záložce) nepřerušovat; po vypršení je to přerušený pokus.
    if (m.status === 'syncing') return m.nextAttemptAt !== undefined && m.nextAttemptAt <= now;
    // Chybějící tabulka: ani „Zkusit znovu“ nepomůže, čeká se na uplynutí odkladu.
    if (m.status === 'deferred') return m.nextAttemptAt === undefined || m.nextAttemptAt <= now;
    return (
      options.force === true ||
      m.status === 'pending' ||
      m.nextAttemptAt === undefined ||
      m.nextAttemptAt <= now
    );
  });
}

/**
 * Kdy nejdřív zkusit znovu selhané, odložené (nebo přerušené odesílané) změny (ms od `now`);
 * `null` = nic nečeká na opakování.
 */
export function nextRetryDelay(queue: readonly PendingMutation[], now: number): number | null {
  const times = queue
    .filter(
      (m) =>
        m.status === 'failed' ||
        m.status === 'deferred' ||
        (m.status === 'syncing' && m.nextAttemptAt !== undefined),
    )
    .map((m) => Math.max(0, (m.nextAttemptAt ?? now) - now));
  return times.length === 0 ? null : Math.min(...times);
}

const BACKOFF_BASE_MS = 2_000;
const BACKOFF_MAX_MS = 5 * 60_000;

/** Exponenciální čekání: 2 s, 4 s, 8 s … nejvýš 5 min. */
export function backoffMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  return Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.min(exponent, 20));
}

export interface OutboxSummary {
  pendingCount: number;
  failedCount: number;
}

/** Odložené změny (chybějící tabulka) se nepočítají: nejsou porucha ani nic, co by šlo urychlit. */
export function summarizeOutbox(queue: readonly PendingMutation[]): OutboxSummary {
  return {
    pendingCount: queue.filter((m) => m.status !== 'deferred').length,
    failedCount: queue.filter((m) => m.status === 'failed').length,
  };
}

/**
 * Outbox uložený v `Storage`. Čte vždy z úložiště (jiná záložka mohla frontu změnit),
 * zápis je synchronní, takže jedna operace je vůči ostatním v téže záložce atomická.
 */
export interface OutboxStore {
  readonly key: string;
  list(): PendingMutation[];
  /** Atomická úprava fronty čistou funkcí. */
  update(fn: (queue: PendingMutation[]) => PendingMutation[]): PendingMutation[];
  summary(): OutboxSummary;
  /** Změnu fronty (i z jiné záložky přes `notifyExternalChange`) ohlásí odběratelům. */
  subscribe(listener: () => void): () => void;
  notifyExternalChange(): void;
}

export function createOutboxStore(storage: StorageLike, key: string): OutboxStore {
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const read = () => parseOutbox(storage.getItem(key));
  const write = (queue: PendingMutation[]) => {
    try {
      if (queue.length === 0) storage.removeItem(key);
      else storage.setItem(key, JSON.stringify(queue));
    } catch (cause) {
      throw new StorageWriteError(key, cause);
    }
  };

  // Odesílání přerušené zavřením aplikace se při startu vrátí do fronty.
  const initial = read();
  if (initial.some((m) => m.status === 'syncing')) write(recoverInterrupted(initial));

  return {
    key,
    list: read,
    update(fn) {
      const next = fn(read());
      write(next);
      emit();
      return next;
    },
    summary: () => summarizeOutbox(read()),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notifyExternalChange: emit,
  };
}
