import { Outlet, ScrollRestoration } from 'react-router';

import { useServiceWorkerOpenMessages } from '@/lib/pwa/use-sw-open-messages';

/**
 * Kořen tras: nová stránka začíná nahoře (např. tisk z „Připravte si“ uprostřed lekce),
 * Zpět vrátí původní pozici. Klíčem je cesta, takže změna jen `?…` (filtr, krok dílenského
 * režimu) pozici nemění.
 */
export function RootLayout() {
  useServiceWorkerOpenMessages();
  return (
    <>
      <ScrollRestoration getKey={(location) => location.pathname} />
      <Outlet />
    </>
  );
}
