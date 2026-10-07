import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  createWakeLockController,
  type WakeLockEnv,
  type WakeLockState,
} from '@/features/workshop/wake-lock';

function browserWakeLockEnv(): WakeLockEnv {
  const nav = navigator as Navigator & { wakeLock?: WakeLockEnv['wakeLock'] };
  return { wakeLock: nav.wakeLock, document };
}

/** Drží obrazovku rozsvícenou, dokud je komponenta připojená. Vrací stav pro UI. */
export function useWakeLock(): WakeLockState {
  const [controller] = useState(() => createWakeLockController(browserWakeLockEnv()));
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  );
  useEffect(() => {
    void controller.enable();
    return () => {
      void controller.disable();
    };
  }, [controller]);
  return state;
}
