import { createContext, type ReactNode, useContext } from 'react';

import { useAppUpdate, type AppUpdateState } from '@/lib/pwa/use-app-update';

const noop = () => {
  /* bez service workeru není co aktualizovat */
};

const fallbackState: AppUpdateState = {
  updateAvailable: false,
  offlineReady: false,
  applyUpdate: () => Promise.resolve(),
  dismissOfflineReady: noop,
};

const AppUpdateContext = createContext<AppUpdateState>(fallbackState);

/**
 * Registruje service worker jednou na kořeni aplikace (nezávisle na tom,
 * která trasa je vykreslená) a sdílí stav aktualizace se stavovým pruhem.
 */
export function AppUpdateProvider({ children }: { children: ReactNode }) {
  const state = useAppUpdate();
  return <AppUpdateContext value={state}>{children}</AppUpdateContext>;
}

export function useAppUpdateState(): AppUpdateState {
  return useContext(AppUpdateContext);
}
