/** Nejdéle tak dlouho se čeká na aktivaci nové verze, pak se stránka obnoví i tak. */
export const ACTIVATE_TIMEOUT_MS = 4000;

export interface ApplyUpdateDeps {
  /** Čekající (nainstalovaný, neaktivní) service worker, pokud nějaký je. */
  getWaiting: () => Promise<ServiceWorker | null | undefined>;
  /** Pošle čekajícímu workeru SKIP_WAITING (vite-plugin-pwa `updateServiceWorker`). */
  skipWaiting: () => Promise<void>;
  reload: () => void;
  timeoutMs?: number;
}

/**
 * Aktivuje čekající verzi a obnoví stránku. Plugin sám obnovuje jen při `controllerchange`,
 * který stránka bez řídícího workeru (první návštěva, tvrdé obnovení; clientsClaim je
 * vypnutý) nedostane – klik na „Aktualizovat“ by pak nic neudělal. Proto se čeká na
 * aktivaci čekajícího workeru (nejdéle `timeoutMs`) a obnoví se vždy.
 */
export async function applyUpdate({
  getWaiting,
  skipWaiting,
  reload,
  timeoutMs = ACTIVATE_TIMEOUT_MS,
}: ApplyUpdateDeps): Promise<void> {
  const waiting = await getWaiting().catch(() => null);
  if (waiting) {
    const activated = new Promise<void>((resolve) => {
      const done = () => {
        if (waiting.state === 'activated' || waiting.state === 'redundant') resolve();
      };
      waiting.addEventListener('statechange', done);
      setTimeout(resolve, timeoutMs);
    });
    await skipWaiting();
    await activated;
  }
  reload();
}
