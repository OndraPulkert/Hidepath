import { type StorageLike } from '@/features/data/local-collection';
import {
  dueUnfired,
  markFired,
  parseTimers,
  pruneTimers,
  type TimerRecord,
} from '@/features/timers/timers';

/** Časovače žijí jen na zařízení – nesynchronizují se do účtu. */
export const TIMERS_STORAGE_KEY = 'hidepath.v1.timers';

export interface TimerStore {
  /** Stabilní snapshot (stejná reference, dokud se data nezmění) pro useSyncExternalStore. */
  getSnapshot: () => readonly TimerRecord[];
  /** Přečte čerstvý stav z úložiště, upraví ho a zapíše. Vrací nový stav. */
  update: (updater: (timers: readonly TimerRecord[]) => TimerRecord[]) => readonly TimerRecord[];
  /**
   * Převezme doběhlé, dosud neohlášené časovače: nejdřív do úložiště zapíše `firedAt`
   * a teprve pak je vrátí k ohlášení. Druhá karta nebo druhý běh tak stejný časovač
   * neohlásí znovu.
   */
  claimDue: (now: number) => TimerRecord[];
  subscribe: (listener: () => void) => () => void;
}

export interface TimerStoreOptions {
  /** Okno pro událost `storage` (změna z jiné karty). */
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'> | undefined;
  now?: () => number;
}

const EMPTY: readonly TimerRecord[] = Object.freeze([]);

export function createTimerStore(
  storage: StorageLike | null,
  { target, now = Date.now }: TimerStoreOptions = {},
): TimerStore {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cached: readonly TimerRecord[] = EMPTY;
  // Bez úložiště (zakázané cookies, privátní režim) drží časovače aspoň paměť karty.
  let memory: string | null = null;

  // Po selhání zápisu (plné úložiště, Safari v privátním režimu) platí paměť karty,
  // jinak by čtení vracelo starý stav z úložiště a nový časovač by „zmizel“.
  let storageFailed = false;

  const readRaw = (): string | null => {
    if (!storage || storageFailed) return memory;
    try {
      return storage.getItem(TIMERS_STORAGE_KEY);
    } catch {
      return memory;
    }
  };

  const read = (): readonly TimerRecord[] => {
    const raw = readRaw();
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    if (!raw) {
      cached = EMPTY;
      return cached;
    }
    try {
      cached = parseTimers(JSON.parse(raw));
    } catch {
      cached = EMPTY;
    }
    return cached;
  };

  const emit = () => {
    for (const l of listeners) l();
  };

  const write = (timers: readonly TimerRecord[]) => {
    const raw = timers.length === 0 ? null : JSON.stringify(timers);
    memory = raw;
    if (storage) {
      try {
        if (raw === null) storage.removeItem(TIMERS_STORAGE_KEY);
        else storage.setItem(TIMERS_STORAGE_KEY, raw);
        storageFailed = false;
      } catch {
        storageFailed = true;
        // Plné nebo zakázané úložiště: časovač aspoň doběhne v této kartě.
      }
    }
    emit();
  };

  const onStorage = (event: Event) => {
    const key = (event as StorageEvent).key;
    if (key === null || key === TIMERS_STORAGE_KEY) emit();
  };

  return {
    getSnapshot: read,
    update(updater) {
      const next = pruneTimers(updater(read()), now());
      write(next);
      return read();
    },
    claimDue(at) {
      const current = read();
      const due = dueUnfired(current, at);
      if (due.length === 0) return [];
      write(
        markFired(
          current,
          due.map((t) => t.id),
          at,
        ),
      );
      return due.map((t) => ({ ...t, firedAt: at }));
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) target?.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) target?.removeEventListener('storage', onStorage);
      };
    },
  };
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Sdílené úložiště časovačů aplikace (localStorage). */
export const timerStore: TimerStore = createTimerStore(browserStorage(), {
  target: typeof window === 'undefined' ? undefined : window,
});
