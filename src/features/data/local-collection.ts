/**
 * Minimální lokální kolekce záznamů s klíčem `id`, uložená v `Storage` (localStorage).
 * Rozhraní odpovídá tomu, co v Milníku 4 nahradí Dexie: seznam a idempotentní upsert.
 * Upsert je idempotentní podle `id` i podle přirozeného klíče (např. `equipmentSlug`),
 * aby dva zápisy téže položky nikdy nevytvořily dva řádky.
 */
export interface CollectionRepository<T extends { id: string }> {
  list(): Promise<T[]>;
  upsert(record: T): Promise<T>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Chyba zápisu do úložiště (plný disk, privátní režim) – UI ji zobrazí, neskrývá. */
export class StorageWriteError extends Error {
  constructor(key: string, cause: unknown) {
    super(`Zápis do úložiště selhal (${key}).`, { cause });
    this.name = 'StorageWriteError';
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function createStorageCollection<T extends { id: string }>(
  storage: StorageLike,
  key: string,
  naturalKey?: (record: T) => string,
): CollectionRepository<T> {
  const read = (): T[] => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };
  const write = (records: T[]) => {
    try {
      storage.setItem(key, JSON.stringify(records));
    } catch (cause) {
      throw new StorageWriteError(key, cause);
    }
  };

  return {
    list: async () => Promise.resolve(read()),
    upsert: async (record) => {
      if (!isUuid(record.id)) {
        throw new Error(`Záznam musí mít UUID, dostal „${record.id}“ (${key}).`);
      }
      const records = read();
      const natural = naturalKey?.(record);
      const index = records.findIndex(
        (r) => r.id === record.id || (natural !== undefined && naturalKey?.(r) === natural),
      );
      // Při shodě přirozeného klíče zůstává původní id řádku – stejně jako v databázi.
      const next = index === -1 ? record : { ...record, id: records[index]!.id };
      if (index === -1) records.push(next);
      else records[index] = next;
      write(records);
      return Promise.resolve(next);
    },
    remove: async (id) => {
      write(read().filter((r) => r.id !== id));
      return Promise.resolve();
    },
    clear: async () => {
      storage.removeItem(key);
      return Promise.resolve();
    },
  };
}

/** In-memory Storage pro testy a prostředí bez localStorage. */
export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

export interface ResolvedStorage {
  storage: StorageLike;
  /** `false` = jen paměť; data nepřežijí zavření záložky a UI to musí říct. */
  persistent: boolean;
}

export function resolveBrowserStorage(): ResolvedStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probe = '__hidepath_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return { storage: window.localStorage, persistent: true };
    }
  } catch {
    /* Safari private mode apod. */
  }
  return { storage: createMemoryStorage(), persistent: false };
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
