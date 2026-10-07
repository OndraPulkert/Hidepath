/**
 * Rozsvícená obrazovka v dílenském režimu (Screen Wake Lock API). Prohlížeč zámek uvolní,
 * když stránka zmizí z popředí, proto se při návratu (`visibilitychange`) žádá znovu.
 * Bez API (starší Safari, iOS PWA před 18.4) je stav `unsupported` a UI to řekne.
 */
export type WakeLockState = 'idle' | 'active' | 'unsupported' | 'denied';

export interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

export interface WakeLockEnv {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> } | undefined;
  document: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;
}

export interface WakeLockController {
  getState: () => WakeLockState;
  /** Začne držet obrazovku rozsvícenou (a drží ji i po návratu na stránku). */
  enable: () => Promise<void>;
  /** Přestane držet obrazovku a uvolní zámek. */
  disable: () => Promise<void>;
  subscribe: (listener: () => void) => () => void;
}

export function createWakeLockController(env: WakeLockEnv): WakeLockController {
  const listeners = new Set<() => void>();
  let state: WakeLockState = env.wakeLock ? 'idle' : 'unsupported';
  let sentinel: WakeLockSentinelLike | null = null;
  let wanted = false;

  const setState = (next: WakeLockState) => {
    if (next === state) return;
    state = next;
    for (const l of listeners) l();
  };

  let pending: Promise<void> | null = null;

  const acquire = (): Promise<void> => {
    if (!env.wakeLock || !wanted) return Promise.resolve();
    if (sentinel && !sentinel.released) return Promise.resolve();
    // Souběžné žádosti (StrictMode, rychlé přepnutí karty) sloučit do jedné.
    pending ??= request().finally(() => {
      pending = null;
    });
    return pending;
  };

  const request = async () => {
    if (!env.wakeLock) return;
    try {
      const s = await env.wakeLock.request('screen');
      if (!wanted) {
        await s.release().catch(() => undefined);
        return;
      }
      sentinel = s;
      s.addEventListener('release', () => {
        // Uvolnil ho prohlížeč (skrytá stránka, úspora baterie). Pokud ho pořád chceme,
        // vrátí ho další `visibilitychange`; do té doby ukazujeme, že neplatí.
        if (sentinel === s) sentinel = null;
        if (wanted && env.document.visibilityState === 'visible') void acquire();
        else if (wanted) setState('idle');
      });
      setState('active');
    } catch {
      setState('denied');
    }
  };

  const onVisibility = () => {
    if (env.document.visibilityState === 'visible') void acquire();
  };

  return {
    getState: () => state,
    async enable() {
      if (!env.wakeLock) return;
      if (!wanted) {
        wanted = true;
        env.document.addEventListener('visibilitychange', onVisibility);
      }
      await acquire();
    },
    async disable() {
      if (!wanted) return;
      wanted = false;
      env.document.removeEventListener('visibilitychange', onVisibility);
      const s = sentinel;
      sentinel = null;
      if (s && !s.released) await s.release().catch(() => undefined);
      if (env.wakeLock) setState('idle');
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Stav pro UI: co uživateli říct. `null` = nic neříkat (zatím čekáme na odpověď). */
export function describeWakeLock(
  state: WakeLockState,
): { tone: 'ok' | 'warn'; text: string } | null {
  switch (state) {
    case 'active':
      return { tone: 'ok', text: 'Obrazovka zůstane rozsvícená.' };
    case 'unsupported':
      return {
        tone: 'warn',
        text: 'Tento prohlížeč neumí nechat obrazovku rozsvícenou. Prodlužte si zhasínání displeje v nastavení telefonu.',
      };
    case 'denied':
      return {
        tone: 'warn',
        text: 'Obrazovku se nepodařilo nechat rozsvícenou (třeba kvůli úspoře baterie). Prodlužte si zhasínání displeje v nastavení telefonu.',
      };
    case 'idle':
      return null;
  }
}
