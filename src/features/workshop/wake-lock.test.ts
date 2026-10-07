import {
  createWakeLockController,
  describeWakeLock,
  type WakeLockEnv,
  type WakeLockSentinelLike,
} from '@/features/workshop/wake-lock';

class FakeSentinel implements WakeLockSentinelLike {
  released = false;
  private listeners: (() => void)[] = [];
  release = vi.fn(async () => {
    this.drop();
    return Promise.resolve();
  });
  addEventListener(_type: 'release', listener: () => void) {
    this.listeners.push(listener);
  }
  /** Prohlížeč zámek uvolní (skrytá stránka). */
  drop() {
    if (this.released) return;
    this.released = true;
    for (const l of this.listeners) l();
  }
}

function fakeDocument() {
  const target = new EventTarget();
  const doc = {
    visibilityState: 'visible' as DocumentVisibilityState,
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
  };
  const setVisibility = (v: DocumentVisibilityState) => {
    doc.visibilityState = v;
    target.dispatchEvent(new Event('visibilitychange'));
  };
  return { doc: doc as unknown as WakeLockEnv['document'], setVisibility };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('createWakeLockController', () => {
  it('bez API je unsupported a nic nežádá', async () => {
    const { doc } = fakeDocument();
    const c = createWakeLockController({ wakeLock: undefined, document: doc });
    expect(c.getState()).toBe('unsupported');
    await c.enable();
    expect(c.getState()).toBe('unsupported');
  });

  it('zapne zámek a při uvolnění prohlížečem ho po návratu na stránku obnoví', async () => {
    const { doc, setVisibility } = fakeDocument();
    const sentinels: FakeSentinel[] = [];
    const request = vi.fn(async () => {
      const s = new FakeSentinel();
      sentinels.push(s);
      return Promise.resolve(s);
    });
    const c = createWakeLockController({ wakeLock: { request }, document: doc });
    const listener = vi.fn();
    c.subscribe(listener);

    await c.enable();
    expect(c.getState()).toBe('active');
    expect(listener).toHaveBeenCalled();

    // Stránka zmizí: prohlížeč zámek uvolní.
    setVisibility('hidden');
    sentinels[0]!.drop();
    expect(c.getState()).toBe('idle');

    setVisibility('visible');
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
    expect(c.getState()).toBe('active');
  });

  it('odmítnutí je denied', async () => {
    const { doc } = fakeDocument();
    const c = createWakeLockController({
      wakeLock: { request: async () => Promise.reject(new DOMException('no', 'NotAllowedError')) },
      document: doc,
    });
    await c.enable();
    expect(c.getState()).toBe('denied');
  });

  it('disable uvolní zámek a přestane ho obnovovat', async () => {
    const { doc, setVisibility } = fakeDocument();
    const sentinel = new FakeSentinel();
    const request = vi.fn(async () => Promise.resolve(sentinel));
    const c = createWakeLockController({ wakeLock: { request }, document: doc });
    await c.enable();
    await c.disable();
    expect(sentinel.release).toHaveBeenCalled();
    expect(c.getState()).toBe('idle');
    setVisibility('visible');
    await flush();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('souběžné zapnutí (StrictMode) požádá jen jednou a nic nenechá viset', async () => {
    const { doc } = fakeDocument();
    const sentinels: FakeSentinel[] = [];
    const request = vi.fn(async () => {
      const s = new FakeSentinel();
      sentinels.push(s);
      return Promise.resolve(s);
    });
    const c = createWakeLockController({ wakeLock: { request }, document: doc });
    const first = c.enable();
    void c.disable();
    const second = c.enable();
    await Promise.all([first, second]);
    expect(request).toHaveBeenCalledTimes(1);
    expect(c.getState()).toBe('active');
  });

  it('zámek získaný až po disable hned uvolní', async () => {
    const { doc } = fakeDocument();
    const sentinel = new FakeSentinel();
    let resolve: (s: FakeSentinel) => void = () => undefined;
    const request = vi.fn(() => new Promise<FakeSentinel>((r) => (resolve = r)));
    const c = createWakeLockController({ wakeLock: { request }, document: doc });
    const pending = c.enable();
    await c.disable();
    resolve(sentinel);
    await pending;
    expect(sentinel.release).toHaveBeenCalled();
    expect(c.getState()).toBe('idle');
  });
});

describe('describeWakeLock', () => {
  it('mluví česky jen tam, kde je co říct', () => {
    expect(describeWakeLock('idle')).toBeNull();
    expect(describeWakeLock('active')).toEqual({
      tone: 'ok',
      text: 'Obrazovka zůstane rozsvícená.',
    });
    expect(describeWakeLock('unsupported')?.tone).toBe('warn');
    expect(describeWakeLock('unsupported')?.text).toMatch(/neumí nechat obrazovku rozsvícenou/);
    expect(describeWakeLock('denied')?.text).toMatch(/nepodařilo/);
  });
});
