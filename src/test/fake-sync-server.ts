import { type CollectionRepository } from '@/features/data/local-collection';
import { naturalKeys } from '@/features/data/repositories';
import { RemoteTableMissingError, StaleWriteError } from '@/features/data/supabase-repositories';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { type UserSyncRemote } from '@/features/sync/synced-collection';

/**
 * Falešný Supabase pro testy synchronizace. Chová se jako SQL v `supabase/migrations`:
 * - RLS: každý uživatel vidí a mění jen své řádky;
 * - unikátní přirozený klíč: zápis pod jiným id se sloučí do existujícího řádku;
 * - `reject_stale_update`: starší `updated_at` → `StaleWriteError` (lze vypnout = tabulka
 *   bez triggeru, jako inventory_items před migrací 20261008120000);
 * - `set_updated_at`: stejné `updated_at` → čas serveru;
 * - chybějící tabulka (migrace neproběhla) → `RemoteTableMissingError` (PGRST205);
 * - výpadek sítě → obyčejná chyba „Failed to fetch“.
 */
interface Row {
  id: string;
  userId: string | null;
  updatedAt: string;
}

export interface FakeTableOptions {
  staleGuard?: boolean;
  missing?: boolean;
}

export interface FakeTable<T extends Row> {
  readonly name: string;
  /** Všechny řádky (všech uživatelů) – pohled service role. */
  rows(): T[];
  /** Přímý zápis do tabulky (data z jiného zařízení, bez klienta). */
  seed(record: T): void;
  /** Repozitář přihlášeného uživatele (RLS). */
  remoteFor(userId: string): CollectionRepository<T>;
  state: { missing: boolean; staleGuard: boolean; requests: number };
}

export function createFakeTable<T extends Row>(
  name: string,
  naturalKey: (record: T) => string,
  server: { offline: () => boolean; now: () => number },
  options: FakeTableOptions = {},
): FakeTable<T> {
  let rows: T[] = [];
  const state = {
    missing: options.missing ?? false,
    staleGuard: options.staleGuard ?? true,
    requests: 0,
  };
  const request = (operation: string) => {
    state.requests += 1;
    if (server.offline()) throw new Error('Failed to fetch');
    if (state.missing) {
      throw new RemoteTableMissingError(
        operation,
        name,
        new Error(`Could not find the table 'public.${name}' in the schema cache`),
      );
    }
  };
  const key = (userId: string | null, record: T) => `${userId ?? ''}|${naturalKey(record)}`;

  return {
    name,
    rows: () => rows.map((r) => ({ ...r })),
    seed(record) {
      rows = [...rows.filter((r) => key(r.userId, r) !== key(record.userId, record)), record];
    },
    state,
    remoteFor(userId) {
      return {
        async list() {
          request('select');
          return Promise.resolve(rows.filter((r) => r.userId === userId).map((r) => ({ ...r })));
        },
        async upsert(record) {
          request('upsert');
          const old = rows.find(
            (r) => r.id === record.id || key(r.userId, r) === key(userId, record),
          );
          if (old && old.userId !== userId) throw new Error('new row violates row-level security');
          let next = { ...record, id: old?.id ?? record.id, userId } as T;
          if (old) {
            const incoming = Date.parse(record.updatedAt);
            const current = Date.parse(old.updatedAt);
            if (state.staleGuard && incoming < current) throw new StaleWriteError(name);
            if (incoming === current) {
              next = { ...next, updatedAt: new Date(server.now()).toISOString() };
            }
          }
          rows = [...rows.filter((r) => r !== old), next];
          return Promise.resolve({ ...next });
        },
        async remove(id) {
          request('delete');
          rows = rows.filter((r) => !(r.id === id && r.userId === userId));
          return Promise.resolve();
        },
        async clear() {
          request('delete');
          rows = rows.filter((r) => r.userId !== userId);
          return Promise.resolve();
        },
      };
    },
  };
}

export interface FakeSyncServer {
  network: { online: boolean };
  lessonRecords: FakeTable<LessonRecordEntry>;
  prepChecks: FakeTable<PrepCheckRecord>;
  inventory: FakeTable<InventoryItem>;
  lessonNotes: FakeTable<LessonNoteRecord>;
  remoteFor(userId: string): UserSyncRemote;
}

export function createFakeSyncServer(
  options: {
    now?: () => number;
    inventory?: FakeTableOptions;
    lessonNotes?: FakeTableOptions;
  } = {},
): FakeSyncServer {
  const network = { online: true };
  const server = { offline: () => !network.online, now: options.now ?? Date.now };
  const lessonRecords = createFakeTable<LessonRecordEntry>(
    'lesson_records',
    naturalKeys.lessonRecords,
    server,
  );
  const prepChecks = createFakeTable<PrepCheckRecord>(
    'lesson_prep_checks',
    naturalKeys.prepChecks,
    server,
  );
  const inventory = createFakeTable<InventoryItem>(
    'inventory_items',
    naturalKeys.inventory,
    server,
    options.inventory,
  );
  const lessonNotes = createFakeTable<LessonNoteRecord>(
    'lesson_notes',
    naturalKeys.lessonNotes,
    server,
    options.lessonNotes,
  );
  return {
    network,
    lessonRecords,
    prepChecks,
    inventory,
    lessonNotes,
    remoteFor: (userId) => ({
      lessonRecords: lessonRecords.remoteFor(userId),
      prepChecks: prepChecks.remoteFor(userId),
      inventory: inventory.remoteFor(userId),
      lessonNotes: lessonNotes.remoteFor(userId),
    }),
  };
}
