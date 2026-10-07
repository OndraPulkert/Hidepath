/* global self, clients */
/**
 * Doplněk service workeru (workbox importScripts): kliknutí na notifikaci doběhlého časovače
 * otevře krok lekce – zaostří existující okno aplikace, jinak otevře nové.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const path = typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/';
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        await client.focus();
        if ('navigate' in client && client.url !== target) {
          try {
            await client.navigate(target);
          } catch {
            // Nekontrolované okno navigovat nejde – stačí, že je v popředí.
          }
        }
        return;
      }
      await clients.openWindow(target);
    })(),
  );
});
