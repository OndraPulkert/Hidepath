import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * Kliknutí na notifikaci časovače v okně, které service worker ještě neřídí (první návštěva),
 * nemůže worker navigovat – pošle adresu zprávou `hidepath-open` (public/sw-notifications.js)
 * a aplikace na ni přejde sama. Jen adresy uvnitř aplikace.
 */
export function useServiceWorkerOpenMessages() {
  const navigate = useNavigate();
  useEffect(() => {
    const container = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker;
    if (!container) return;
    const onMessage = (event: Event) => {
      const data: unknown = (event as MessageEvent).data;
      if (typeof data !== 'object' || data === null) return;
      const { type, url } = data as { type?: unknown; url?: unknown };
      if (type !== 'hidepath-open' || typeof url !== 'string') return;
      let target: URL;
      try {
        target = new URL(url, window.location.origin);
      } catch {
        return;
      }
      if (target.origin !== window.location.origin) return;
      void navigate(target.pathname + target.search + target.hash);
    };
    container.addEventListener('message', onMessage);
    return () => container.removeEventListener('message', onMessage);
  }, [navigate]);
}
