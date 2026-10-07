import { useEffect } from 'react';

import { type SyncController } from '@/features/sync/synced-collection';

/**
 * Kdy synchronizovat: při startu, po návratu připojení, po návratu do záložky a po
 * selhání s exponenciálním čekáním (backoff z outboxu). Změny z jiné záložky (`storage`)
 * ohlásí stavovému pruhu i cache dotazů. Logika je bez Reactu (`startSyncDriver`), hook ji
 * jen zapne na dobu, kdy je komponenta připojená.
 */
export interface SyncDriverEnv {
  addWindowListener(type: 'online' | 'storage', listener: (event: Event) => void): () => void;
  addVisibilityListener(listener: () => void): () => void;
  isVisible(): boolean;
  isOnline(): boolean;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export function browserSyncDriverEnv(): SyncDriverEnv {
  return {
    addWindowListener(type, listener) {
      window.addEventListener(type, listener);
      return () => window.removeEventListener(type, listener);
    },
    addVisibilityListener(listener) {
      document.addEventListener('visibilitychange', listener);
      return () => document.removeEventListener('visibilitychange', listener);
    },
    isVisible: () => document.visibilityState !== 'hidden',
    isOnline: () => navigator.onLine !== false,
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (handle) => window.clearTimeout(handle as number),
  };
}

/** Nejkratší a nejdelší prodleva naplánovaného opakování (ochrana proti zahlcení i usnutí). */
const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 5 * 60_000;

export function startSyncDriver(controller: SyncController, env: SyncDriverEnv): () => void {
  let stopped = false;
  let timer: unknown = null;
  let running: Promise<void> | null = null;

  const clearTimer = () => {
    if (timer !== null) env.clearTimeout(timer);
    timer = null;
  };

  const scheduleRetry = () => {
    clearTimer();
    if (stopped || !env.isOnline()) return;
    const delay = controller.retryDelay();
    if (delay === null) return;
    const ms = Math.min(MAX_RETRY_MS, Math.max(MIN_RETRY_MS, delay));
    timer = env.setTimeout(() => {
      timer = null;
      void run(() => controller.flush());
    }, ms);
  };

  const run = (task: () => Promise<void>): Promise<void> => {
    if (stopped || !env.isOnline()) return Promise.resolve();
    // Souběžné spouštěče (online + visibilitychange) se spojí do jednoho běhu.
    running ??= task()
      .catch((error: unknown) => {
        console.error('[sync] Synchronizace selhala', error);
      })
      .finally(() => {
        running = null;
        scheduleRetry();
      });
    return running;
  };

  const sync = () => void run(() => controller.sync());

  const unsubscribe = controller.subscribe(() => {
    if (!running) scheduleRetry();
  });
  const offOnline = env.addWindowListener('online', sync);
  const offStorage = env.addWindowListener('storage', (event) => {
    controller.handleStorageEvent((event as StorageEvent).key ?? null);
  });
  const offVisibility = env.addVisibilityListener(() => {
    if (env.isVisible()) sync();
  });

  sync();

  return () => {
    stopped = true;
    clearTimer();
    unsubscribe();
    offOnline();
    offStorage();
    offVisibility();
  };
}

export function useSyncDriver(controller: SyncController | null) {
  useEffect(() => {
    if (!controller) return;
    return startSyncDriver(controller, browserSyncDriverEnv());
  }, [controller]);
}
