import { useRegisterSW } from 'virtual:pwa-register/react';

import { applyUpdate } from '@/lib/pwa/apply-update';

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
    applyUpdate: () =>
      applyUpdate({
        getWaiting: async () =>
          'serviceWorker' in navigator
            ? (await navigator.serviceWorker.getRegistration())?.waiting
            : null,
        skipWaiting: () => updateServiceWorker(true),
        reload: () => window.location.reload(),
      }),
    dismissOfflineReady: () => {
      setOfflineReady(false);
    },
  };
}
