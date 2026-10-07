import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { createMemoryStorage } from '@/features/data/local-collection';
import {
  claimDueAcrossTabs,
  createTimerStore,
  TIMERS_STORAGE_KEY,
  timerStore,
} from '@/features/timers/timer-store';
import {
  dismissTimer,
  startTimer,
  type StartTimerInput,
  type TimerRecord,
} from '@/features/timers/timers';
import { stepBlockers } from '@/features/workshop/workshop-nav';

const T0 = Date.UTC(2026, 9, 7, 10, 0, 0);
const MIN = 60_000;
const input: StartTimerInput = {
  projectSlug: 'card-holder',
  lessonSlug: '04-glue',
  stepId: 'glue',
  waitId: 'tack',
  label: 'Zavadnutí lepidla',
  durationMin: 10,
};

describe('createTimerStore', () => {
  it('zapíše a přečte časovače z úložiště', () => {
    const storage = createMemoryStorage();
    const store = createTimerStore(storage, { now: () => T0 });
    store.update((t) => startTimer(t, input, T0, 'a'));
    expect(JSON.parse(storage.getItem(TIMERS_STORAGE_KEY)!)).toHaveLength(1);

    // Nový „běh aplikace“ nad stejným úložištěm (reload) časovač vidí.
    const reloaded = createTimerStore(storage, { now: () => T0 });
    expect(reloaded.getSnapshot()).toEqual([
      expect.objectContaining({ id: 'a', endsAt: T0 + 10 * MIN }),
    ]);
  });

  it('snapshot má stabilní referenci, dokud se data nezmění', () => {
    const store = createTimerStore(createMemoryStorage());
    const a = store.getSnapshot();
    expect(store.getSnapshot()).toBe(a);
    store.update((t) => startTimer(t, input, T0, 'a'));
    const b = store.getSnapshot();
    expect(b).not.toBe(a);
    expect(store.getSnapshot()).toBe(b);
  });

  it('poškozená data v úložišti nic neshodí', () => {
    const storage = createMemoryStorage();
    storage.setItem(TIMERS_STORAGE_KEY, '{nejde to');
    expect(createTimerStore(storage).getSnapshot()).toEqual([]);
  });

  it('když zápis do úložiště selže (plné úložiště), drží časovač aspoň v paměti karty', () => {
    const storage = createMemoryStorage();
    storage.setItem(TIMERS_STORAGE_KEY, '[]');
    const full = {
      ...storage,
      getItem: (key: string) => storage.getItem(key),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: (key: string) => storage.removeItem(key),
    };
    const store = createTimerStore(full, { now: () => T0 });
    store.update((t) => startTimer(t, input, T0, 'a'));
    expect(store.getSnapshot()).toEqual([expect.objectContaining({ id: 'a' })]);
    expect(store.claimDue(T0 + 11 * MIN)).toEqual([expect.objectContaining({ id: 'a' })]);
    expect(store.claimDue(T0 + 12 * MIN)).toEqual([]);
  });

  it('prázdný seznam klíč smaže', () => {
    const storage = createMemoryStorage();
    const store = createTimerStore(storage);
    store.update((t) => startTimer(t, input, T0, 'a'));
    store.update(() => []);
    expect(storage.getItem(TIMERS_STORAGE_KEY)).toBeNull();
  });

  it('upozorní posluchače na změnu', () => {
    const store = createTimerStore(createMemoryStorage());
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.update((t) => startTimer(t, input, T0, 'a'));
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.update(() => []);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reaguje na událost storage z jiné karty', () => {
    const target = new EventTarget();
    const store = createTimerStore(createMemoryStorage(), { target: target as unknown as Window });
    const listener = vi.fn();
    store.subscribe(listener);
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'jiny-klic' }));
    expect(listener).not.toHaveBeenCalled();
    target.dispatchEvent(Object.assign(new Event('storage'), { key: TIMERS_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('claimDue zapíše firedAt dřív, než časovač vrátí – druhá karta ho neohlásí znovu', () => {
    const storage = createMemoryStorage();
    const tabA = createTimerStore(storage);
    const tabB = createTimerStore(storage);
    tabA.update((t) => startTimer(t, input, T0, 'a'));

    expect(tabA.claimDue(T0 + 5 * MIN)).toEqual([]);
    const claimed = tabA.claimDue(T0 + 10 * MIN);
    expect(claimed.map((t) => t.firedAt)).toEqual([T0 + 10 * MIN]);
    expect((JSON.parse(storage.getItem(TIMERS_STORAGE_KEY)!) as TimerRecord[])[0]!.firedAt).toBe(
      T0 + 10 * MIN,
    );
    expect(tabB.claimDue(T0 + 11 * MIN)).toEqual([]);
    expect(tabA.claimDue(T0 + 12 * MIN)).toEqual([]);
  });

  it('update uklidí zavřené časovače starší než den', () => {
    let now = T0;
    const store = createTimerStore(createMemoryStorage(), { now: () => now });
    store.update((t) => startTimer(t, input, T0, 'a'));
    store.update((t) => dismissTimer(t, 'a', T0));
    expect(store.getSnapshot()).toHaveLength(1);
    now = T0 + 25 * 60 * MIN;
    store.update((t) => [...t]);
    expect(store.getSnapshot()).toEqual([]);
  });

  it('bez úložiště (zakázané) drží časovače aspoň v paměti', () => {
    const store = createTimerStore(null);
    store.update((t) => startTimer(t, input, T0, 'a'));
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('plné úložiště zápis nepřeruší', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
      removeItem: () => undefined,
    };
    const store = createTimerStore(storage);
    expect(() => store.update((t) => startTimer(t, input, T0, 'a'))).not.toThrow();
    expect(store.getSnapshot()).toHaveLength(1);
  });
});

describe('timerStore aplikace – zavřená blokující čekání', () => {
  const HOUR = 60 * MIN;
  const lesson = lidWalletProject.lessons.find((l) =>
    l.steps.some((s) => s.id === 'dry' && s.waits?.some((w) => w.blocksStepId === 'inspect')),
  )!;
  const ref = {
    projectSlug: 'lid-wallet',
    lessonSlug: lesson.slug,
    stepId: 'dry',
    waitId: 'overnight',
  };
  const inspect = lesson.steps.findIndex((s) => s.id === 'inspect') + 1;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
  });
  afterEach(() => {
    timerStore.update(() => []);
    vi.useRealTimers();
  });

  it('dokončené a zavřené čekání po dni úklidu dál neblokuje navazující krok', () => {
    vi.setSystemTime(T0);
    timerStore.update((t) =>
      startTimer(t, { ...ref, label: 'Schnutí', durationMin: 720 }, T0, 'a'),
    );
    vi.setSystemTime(T0 + 13 * HOUR);
    timerStore.update((t) => dismissTimer(t, 'a', Date.now()));
    // O dva dny později jiná akce s časovači (spustí úklid zavřených).
    vi.setSystemTime(T0 + 60 * HOUR);
    timerStore.update((t) => startTimer(t, { ...input, durationMin: 10 }, Date.now(), 'b'));

    expect(
      stepBlockers(lesson, 'lid-wallet', inspect, timerStore.getSnapshot(), Date.now()),
    ).toEqual([]);
  });

  it('zavřené čekání, které nic neblokuje, se po dni uklidí', () => {
    vi.setSystemTime(T0);
    timerStore.update((t) => startTimer(t, input, T0, 'a'));
    timerStore.update((t) => dismissTimer(t, 'a', T0 + 11 * MIN));
    vi.setSystemTime(T0 + 30 * HOUR);
    timerStore.update((t) => [...t]);
    expect(timerStore.getSnapshot()).toEqual([]);
  });
});

describe('claimDueAcrossTabs – dvě karty v různých procesech', () => {
  /** Úložiště dvou karet: zápis jedné karty druhá uvidí až po `delay` ms (jako localStorage v Chromu). */
  function delayedPair(delay: number) {
    const maps = [new Map<string, string>(), new Map<string, string>()] as const;
    const tab = (self: 0 | 1) => {
      const other = maps[self === 0 ? 1 : 0];
      return {
        getItem: (k: string) => maps[self].get(k) ?? null,
        setItem: (k: string, v: string) => {
          maps[self].set(k, v);
          setTimeout(() => other.set(k, v), delay);
        },
        removeItem: (k: string) => {
          maps[self].delete(k);
          setTimeout(() => other.delete(k), delay);
        },
      };
    };
    return { a: tab(0), b: tab(1), maps };
  }

  /** Zámek sdílený kartami (navigator.locks): volání se řadí za sebe. */
  function fakeLocks() {
    let tail: Promise<unknown> = Promise.resolve();
    return {
      request<T>(_name: string, callback: () => Promise<T>): Promise<T> {
        const run = tail.then(callback);
        tail = run.catch(() => undefined);
        return run;
      },
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('doběhlý časovač ohlásí jen jedna karta', async () => {
    const { a, b, maps } = delayedPair(30);
    const raw = JSON.stringify(startTimer([], input, T0 - 20 * MIN, 'x'));
    maps[0].set(TIMERS_STORAGE_KEY, raw);
    maps[1].set(TIMERS_STORAGE_KEY, raw);
    const tabA = createTimerStore(a, { now: () => T0 });
    const tabB = createTimerStore(b, { now: () => T0 });
    const locks = fakeLocks();
    const announced: string[] = [];

    const both = Promise.all([
      claimDueAcrossTabs(
        tabA,
        () => T0,
        (due) => announced.push(...due.map((t) => `A:${t.id}`)),
        locks,
      ),
      claimDueAcrossTabs(
        tabB,
        () => T0,
        (due) => announced.push(...due.map((t) => `B:${t.id}`)),
        locks,
      ),
    ]);
    await vi.runAllTimersAsync();
    await both;

    expect(announced).toEqual(['A:x']);
  });

  it('bez navigator.locks převezme časovače přímo', async () => {
    const store = createTimerStore(createMemoryStorage(), { now: () => T0 });
    store.update((t) => startTimer(t, input, T0 - 20 * MIN, 'x'));
    const announced: string[] = [];
    await claimDueAcrossTabs(
      store,
      () => T0,
      (due) => announced.push(...due.map((t) => t.id)),
      undefined,
    );
    expect(announced).toEqual(['x']);
  });
});
