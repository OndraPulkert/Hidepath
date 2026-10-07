/* global self, clients */
/**
 * Doplněk service workeru (workbox importScripts): kliknutí na notifikaci doběhlého časovače
 * otevře krok lekce – zaostří existující okno aplikace, jinak otevře nové.
 *
 * Okno, které tento worker ještě neřídí (první návštěva po instalaci – clientsClaim je
 * vypnutý), navigovat nejde; dostane adresu zprávou `hidepath-open` a přejde na ni samo
 * (src/lib/pwa/use-sw-open-messages.ts). Známá mezera: dokud běží starší worker bez této
 * obsluhy (aktualizace čeká na potvrzení), kliknutí nic neudělá – upozornění v aplikaci
 * se ale ukáže po návratu.
 */

/** Cílová adresa jen v rámci aplikace (ne `//jiny.web`, `/\jiny.web` ani absolutní URL). */
function notificationTarget(data) {
  const home = new URL('/', self.location.origin);
  try {
    const url = new URL(typeof data.url === 'string' ? data.url : '/', self.location.origin);
    return url.origin === self.location.origin ? url : home;
  } catch {
    return home;
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = notificationTarget(event.notification.data || {});
  const target = url.href;
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        await client.focus();
        if (client.url === target) return;
        try {
          if (!('navigate' in client)) throw new TypeError('navigate není k dispozici');
          await client.navigate(target);
        } catch {
          // Nekontrolované okno navigovat nejde – ať přejde samo (zpráva do aplikace).
          client.postMessage({ type: 'hidepath-open', url: url.pathname + url.search + url.hash });
        }
        return;
      }
      await clients.openWindow(target);
    })(),
  );
});
