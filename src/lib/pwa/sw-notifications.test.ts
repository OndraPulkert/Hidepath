// Kód service workeru (public/) jako text – spustí se nad falešným `self` a `clients`.
import workerSource from '../../../public/sw-notifications.js?raw';

/** Spustí public/sw-notifications.js nad falešným `self` / `clients` a vrátí obsluhu kliknutí. */
function loadWorker(windows: FakeClient[]) {
  const listeners = new Map<string, (event: unknown) => void>();
  const self = {
    location: { origin: 'https://hidepath.test' },
    addEventListener: (type: string, fn: (event: unknown) => void) => listeners.set(type, fn),
  };
  const clients = {
    matchAll: vi.fn(async () => Promise.resolve(windows)),
    openWindow: vi.fn(async () => Promise.resolve(null)),
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- kód service workeru z public/
  const run = new Function('self', 'clients', workerSource) as (s: unknown, c: unknown) => void;
  run(self, clients);
  const click = async (url: unknown) => {
    let done: Promise<unknown> = Promise.resolve();
    listeners.get('notificationclick')?.({
      notification: { close: vi.fn(), data: { url } },
      waitUntil: (p: Promise<unknown>) => {
        done = p;
      },
    });
    await done;
  };
  return { click, clients };
}

interface FakeClient {
  url: string;
  focus: ReturnType<typeof vi.fn>;
  navigate: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
}

function client(url: string, navigate: () => Promise<unknown>): FakeClient {
  return {
    url,
    focus: vi.fn(async () => Promise.resolve()),
    navigate: vi.fn(navigate),
    postMessage: vi.fn(),
  };
}

const STEP = '/projects/card-holder/lessons/04-saddle-stitch/focus?krok=1';

describe('sw-notifications.js – kliknutí na notifikaci časovače', () => {
  it('otevře krok v existujícím okně aplikace', async () => {
    const win = client('https://hidepath.test/dashboard', async () => Promise.resolve(null));
    const { click } = loadWorker([win]);
    await click(STEP);
    expect(win.focus).toHaveBeenCalled();
    expect(win.navigate).toHaveBeenCalledWith(`https://hidepath.test${STEP}`);
  });

  it('okno, které service worker ještě neřídí (první návštěva), dostane adresu zprávou', async () => {
    const win = client('https://hidepath.test/dashboard', async () =>
      Promise.reject(new TypeError('not the active service worker')),
    );
    const { click } = loadWorker([win]);
    await click(STEP);
    expect(win.postMessage).toHaveBeenCalledWith({ type: 'hidepath-open', url: STEP });
  });

  it.each(['//evil.example/x', '/\\evil.example', 'https://evil.example/', 42])(
    'adresu mimo aplikaci (%s) neotevře – vede na úvod',
    async (url) => {
      const { click, clients } = loadWorker([]);
      await click(url);
      expect(clients.openWindow).toHaveBeenCalledWith('https://hidepath.test/');
    },
  );
});
