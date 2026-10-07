import { type StorageLike } from '@/features/data/local-collection';
import { waitBlocksLaterStep } from '@/features/timers/timer-links';
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
   * a teprve pak je vrátí k ohlášení. Druhý běh v téže kartě tak stejný časovač neohlásí
   * znovu; mezi kartami (různé procesy) to zaručí až `claimDueAcrossTabs`.
   */
  claimDue: (now: number) => TimerRecord[];
  subscribe: (listener: () => void) => () => void;
}

export interface TimerStoreOptions {
  /** Okno pro událost `storage` (změna z jiné karty). */
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'> | undefined;
  now?: () => number;
  /** Zavřené časovače, které úklid nesmaže (viz `pruneTimers`). */
  keepDismissed?: (timer: TimerRecord) => boolean;
}

const EMPTY: readonly TimerRecord[] = Object.freeze([]);

export function createTimerStore(
  storage: StorageLike | null,
  { target, now = () => Date.now(), keepDismissed }: TimerStoreOptions = {},
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
      const next = pruneTimers(updater(read()), now(), keepDismissed);
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

/** Zámek sdílený kartami (podmnožina `navigator.locks`). */
export interface TabLocks {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

/** Jak dlouho držet zámek po převzetí: zápis do localStorage se do jiných karet (procesů)
 * nepropíše okamžitě – druhá karta by jinak ještě četla `firedAt: null`. */
export const CLAIM_HOLD_MS = 1000;

function browserLocks(): TabLocks | undefined {
  if (typeof navigator === 'undefined' || !('locks' in navigator)) return undefined;
  return navigator.locks;
}

/**
 * Převezme doběhlé časovače pod zámkem sdíleným všemi kartami a ohlásí je (`announce`) jen
 * v kartě, která je převzala. Zámek drží ještě `CLAIM_HOLD_MS`, než se zápis `firedAt`
 * rozšíří do ostatních karet. Bez `navigator.locks` (starší prohlížeče) převezme přímo.
 */
export async function claimDueAcrossTabs(
  store: Pick<TimerStore, 'claimDue'>,
  now: () => number,
  announce: (due: TimerRecord[]) => void,
  locks: TabLocks | undefined = browserLocks(),
): Promise<void> {
  const claim = () => {
    const due = store.claimDue(now());
    if (due.length > 0) announce(due);
    return due.length;
  };
  if (!locks) {
    claim();
    return;
  }
  await locks.request('hidepath-timers-claim', async () => {
    if (claim() > 0) await new Promise((resolve) => setTimeout(resolve, CLAIM_HOLD_MS));
  });
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
  keepDismissed: (timer) => waitBlocksLaterStep(timer),
});
