import { useRegisterSW } from 'virtual:pwa-register/react';

export interface AppUpdateState {
  /** Service worker má připravenou novou verzi a čeká na potvrzení. */
  updateAvailable: boolean;
  /** Aplikace je připravená fungovat offline (první precache dokončený). */
  offlineReady: boolean;
  applyUpdate: () => Promise<void>;
  dismissOfflineReady: () => void;
}

/**
 * Registrace service workeru s režimem `prompt`: aktualizace se neaplikuje tiše,
 * uživatel ji potvrdí ve stavovém pruhu.
 */
export function useAppUpdate(): AppUpdateState {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('[pwa] Registrace service workeru se nezdařila', error);
    },
  });

  return {
    updateAvailable: needRefresh,
    offlineReady,
    applyUpdate: () => updateServiceWorker(true),
    dismissOfflineReady: () => {
      setOfflineReady(false);
    },
  };
}
