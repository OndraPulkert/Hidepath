import { type SyncController } from '@/features/sync/synced-collection';
import { startSyncDriver, type SyncDriverEnv } from '@/features/sync/use-sync-driver';

function createEnv() {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const visibility = new Set<() => void>();
  const state = { online: true, visible: true };
  const env: SyncDriverEnv = {
    addWindowListener(type, listener) {
      const set = listeners.get(type) ?? new Set();
      set.add(listener);
      listeners.set(type, set);
      return () => set.delete(listener);
    },
    addVisibilityListener(listener) {
      visibility.add(listener);
      return () => visibility.delete(listener);
    },
    isVisible: () => state.visible,
    isOnline: () => state.online,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
  const fire = (type: string, event: Event = new Event(type)) => {
    for (const l of listeners.get(type) ?? []) l(event);
  };
  const fireVisibility = () => {
    for (const l of visibility) l();
  };
  const listenerCount = () =>
    [...listeners.values()].reduce((n, s) => n + s.size, 0) + visibility.size;
  return { env, state, fire, fireVisibility, listenerCount };
}

function createController(overrides: Partial<SyncController> = {}) {
  const subscribers = new Set<() => void>();
  const controller: SyncController = {
    flush: vi.fn(async () => Promise.resolve()),
    sync: vi.fn(async () => Promise.resolve()),
    getSnapshot: () => ({ pendingCount: 0, failedCount: 0 }),
    subscribe: (listener) => {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    retryDelay: vi.fn(() => null),
    unsentCount: () => 0,
    handleStorageEvent: vi.fn(),
    ...overrides,
  };
  const emit = () => {
    for (const s of subscribers) s();
  };
  return { controller, emit, subscribers };
}

describe('startSyncDriver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('při startu synchronizuje (online)', async () => {
    const { env } = createEnv();
    const { controller } = createController();
    const stop = startSyncDriver(controller, env);
    await vi.runAllTimersAsync();
    expect(controller.sync).toHaveBeenCalledTimes(1);
    stop();
  });

  it('offline při startu nic neposílá; po události online synchronizuje', async () => {
    const { env, state, fire } = createEnv();
    state.online = false;
    const { controller } = createController();
    const stop = startSyncDriver(controller, env);
    await vi.runAllTimersAsync();
    expect(controller.sync).not.toHaveBeenCalled();

    state.online = true;
    fire('online');
    await vi.runAllTimersAsync();
    expect(controller.sync).toHaveBeenCalledTimes(1);
    stop();
  });

  it('návrat do záložky synchronizuje, skrytí ne', async () => {
    const { env, state, fireVisibility } = createEnv();
    const { controller } = createController();
    const stop = startSyncDriver(controller, env);
    await vi.runAllTimersAsync();

    state.visible = false;
    fireVisibility();
    await vi.runAllTimersAsync();
    expect(controller.sync).toHaveBeenCalledTimes(1);

    state.visible = true;
    fireVisibility();
    await vi.runAllTimersAsync();
    expect(controller.sync).toHaveBeenCalledTimes(2);
    stop();
  });

  it('souběžné spouštěče se spojí do jednoho běhu', async () => {
    const { env, fire, fireVisibility } = createEnv();
    let release!: () => void;
    const sync = vi.fn(
      async () =>
        new Promise<void>((r) => {
          release = r;
        }),
    );
    const { controller } = createController({ sync });
    const stop = startSyncDriver(controller, env);
    fire('online');
    fireVisibility();
    expect(sync).toHaveBeenCalledTimes(1);
    release();
    await vi.runAllTimersAsync();
    stop();
  });

  it('po selhání naplánuje opakování podle backoffu outboxu', async () => {
    const { env } = createEnv();
    let delay: number | null = 4_000;
    const { controller } = createController({ retryDelay: vi.fn(() => delay) });
    const stop = startSyncDriver(controller, env);
    await vi.advanceTimersByTimeAsync(0);
    expect(controller.flush).not.toHaveBeenCalled();

    delay = null; // po dalším pokusu už nic nečeká
    await vi.advanceTimersByTimeAsync(4_000);
    expect(controller.flush).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(controller.flush).toHaveBeenCalledTimes(1);
    stop();
  });

  it('změna fronty (nový neúspěch) přeplánuje opakování; prodleva má spodní mez', async () => {
    const { env } = createEnv();
    let delay: number | null = null;
    const { controller, emit } = createController({ retryDelay: vi.fn(() => delay) });
    const stop = startSyncDriver(controller, env);
    await vi.advanceTimersByTimeAsync(0);

    delay = 0;
    emit();
    await vi.advanceTimersByTimeAsync(999);
    expect(controller.flush).not.toHaveBeenCalled();
    delay = null;
    await vi.advanceTimersByTimeAsync(1);
    expect(controller.flush).toHaveBeenCalledTimes(1);
    stop();
  });

  it('storage událost předá klíč ovladači', () => {
    const { env, fire } = createEnv();
    const { controller } = createController();
    const stop = startSyncDriver(controller, env);
    const event = new Event('storage') as StorageEvent;
    Object.defineProperty(event, 'key', { value: 'hidepath.v1.u.x.outbox' });
    fire('storage', event);
    expect(controller.handleStorageEvent).toHaveBeenCalledWith('hidepath.v1.u.x.outbox');
    stop();
  });

  it('chyba synchronizace aplikaci neshodí', async () => {
    const { env } = createEnv();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { controller } = createController({
      sync: vi.fn(async () => Promise.reject(new Error('boom'))),
    });
    const stop = startSyncDriver(controller, env);
    await vi.runAllTimersAsync();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
    stop();
  });

  it('stop odpojí posluchače a zruší naplánované opakování', async () => {
    const { env, listenerCount } = createEnv();
    const { controller, subscribers } = createController({ retryDelay: vi.fn(() => 5_000) });
    const stop = startSyncDriver(controller, env);
    await vi.advanceTimersByTimeAsync(0);
    stop();
    expect(listenerCount()).toBe(0);
    expect(subscribers.size).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(controller.flush).not.toHaveBeenCalled();
  });
});
