import { createMemoryStorage } from '@/features/data/local-collection';
import { createTimerStore, TIMERS_STORAGE_KEY } from '@/features/timers/timer-store';
import {
  dismissTimer,
  startTimer,
  type StartTimerInput,
  type TimerRecord,
} from '@/features/timers/timers';

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
