import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { newId } from '@/features/data/local-collection';
import {
  appBeeper,
  browserNotifyEnv,
  closeTimerNotification,
  notificationSupport,
  notifyTimersDone,
  requestNotificationPermission,
  type NotificationSupport,
} from '@/features/timers/notify';
import { timerNotice } from '@/features/timers/timer-links';
import { claimDueAcrossTabs, timerStore } from '@/features/timers/timer-store';
import {
  cancelTimer,
  dismissTimer,
  nextEndsAt,
  startTimer,
  type StartTimerInput,
  type TimerRecord,
} from '@/features/timers/timers';

/** Všechny časovače na zařízení (živě, i ze změn v jiné kartě). */
export function useTimers(): readonly TimerRecord[] {
  return useSyncExternalStore(timerStore.subscribe, timerStore.getSnapshot, timerStore.getSnapshot);
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
const isVisible = () => document.visibilityState === 'visible';

/**
 * Aktuální čas pro odpočet. Tiká po 1 s jen když `enabled` a stránka je vidět – skrytá
 * karta nepálí baterii; po návratu se čas hned obnoví.
 */
export function useNow(enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  const visible = useSyncExternalStore(subscribeVisibility, isVisible, () => true);
  useEffect(() => {
    if (!enabled || !visible) return;
    const tick = () => setNow(Date.now());
    // Po návratu na stránku obnovit čas hned, ne až za sekundu.
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
      // Poslední tik při vypnutí: časovač se ohlásí (firedAt) těsně po konci, ale poslední
      // tik mohl přijít ještě před koncem – bez něj by zamrzl na „0:01“ a nezobrazil „Hotovo“.
      tick();
    };
  }, [enabled, visible]);
  return now;
}

/**
 * Zda má smysl tikat: některý nezavřený časovač ještě nebyl ohlášený (běží, nebo právě
 * doběhl a čeká na ohlášení). Nezávisí na čase, takže jde volat při renderu.
 */
export function hasUnfired(timers: readonly TimerRecord[]): boolean {
  return timers.some((t) => t.dismissedAt === null && t.firedAt === null);
}

export function useTimerActions() {
  const start = useCallback((input: StartTimerInput) => {
    // Tapnutí na „Spustit“ odemkne zvuk – mobilní prohlížeče jinak pípnutí nepustí.
    appBeeper.unlock();
    timerStore.update((timers) => startTimer(timers, input, Date.now(), newId()));
  }, []);
  const cancel = useCallback((id: string) => {
    timerStore.update((timers) => cancelTimer(timers, id));
    void closeTimerNotification(id, browserNotifyEnv(appBeeper));
  }, []);
  const dismiss = useCallback((id: string) => {
    timerStore.update((timers) => dismissTimer(timers, id, Date.now()));
    void closeTimerNotification(id, browserNotifyEnv(appBeeper));
  }, []);
  return { start, cancel, dismiss };
}

let permissionListeners = new Set<() => void>();
const subscribePermission = (cb: () => void) => {
  permissionListeners.add(cb);
  return () => {
    permissionListeners.delete(cb);
  };
};
const getPermission = (): NotificationSupport =>
  notificationSupport({
    Notification:
      typeof window !== 'undefined' && 'Notification' in window ? window.Notification : undefined,
  });

/** Stav povolení notifikací a žádost o něj (jen z tlačítka „Upozornit mě“). */
export function useNotificationPermission() {
  const permission = useSyncExternalStore(subscribePermission, getPermission, () => 'unsupported');
  const request = useCallback(async () => {
    const result = await requestNotificationPermission(browserNotifyEnv(appBeeper));
    for (const l of permissionListeners) l();
    return result;
  }, []);
  return { permission, request };
}

/** Jen pro testy: zapomene posluchače povolení. */
export function resetPermissionListenersForTests() {
  permissionListeners = new Set();
}

/**
 * Hlídá doběhnutí časovačů a ohlásí každý právě jednou: naplánuje kontrolu na nejbližší
 * konec a kontroluje i při návratu na stránku (zavřená či uspaná PWA časovač nespustí –
 * ohlásí se po návratu). Montuje se jednou: v AppShellu a v dílenském režimu.
 */
export function useTimerDriver() {
  const timers = useTimers();
  const waiting = hasUnfired(timers);

  // Časovač přežije reload i znovuspuštění PWA, AudioContext ne – a bez gesta ho prohlížeč
  // (hlavně iOS) nepustí. Dokud se na něco čeká, první klepnutí kamkoli zvuk znovu odemkne.
  useEffect(() => {
    if (!waiting) return;
    const events = ['pointerdown', 'keydown', 'touchend'] as const;
    const unlock = () => {
      appBeeper.unlock();
      remove();
    };
    const remove = () => {
      for (const type of events) document.removeEventListener(type, unlock, true);
    };
    for (const type of events) document.addEventListener(type, unlock, true);
    return remove;
  }, [waiting]);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      // Pod zámkem sdíleným kartami: stejný časovač ohlásí jen jedna karta.
      void claimDueAcrossTabs(
        timerStore,
        () => Date.now(),
        (due) =>
          void notifyTimersDone(
            due.map((t) => timerNotice(t)),
            browserNotifyEnv(appBeeper),
          ),
      ).catch((error: unknown) => {
        console.error('[timers] Ohlášení časovačů selhalo', error);
      });
    };
    check();
    const next = nextEndsAt(timers, Date.now());
    // setTimeout má strop ~24,8 dne; delší čekání nemáme, ale pojistka neuškodí.
    const delay = next === null ? null : Math.min(2 ** 31 - 1, Math.max(0, next - Date.now()) + 50);
    const id = delay === null ? undefined : window.setTimeout(check, delay);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    return () => {
      cancelled = true;
      if (id !== undefined) window.clearTimeout(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
    };
  }, [timers]);
}
