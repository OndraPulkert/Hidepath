import {
  closeTimerNotification,
  createBeeper,
  decideChannels,
  notificationSupport,
  notifyTimersDone,
  requestNotificationPermission,
  type AudioContextCtor,
  type NotifyEnv,
  type TimerNotice,
} from '@/features/timers/notify';

const notice: TimerNotice = {
  id: 't1',
  title: 'Hotovo: Zavadnutí lepidla',
  body: 'Krok 1 · Lepení',
  url: '/projects/card-holder/lessons/04/focus?krok=1',
};

function env(overrides: Partial<NotifyEnv> = {}) {
  const beeper = { unlock: vi.fn(), beep: vi.fn() };
  const vibrate = vi.fn(() => true);
  const showNotification = vi.fn(async () => Promise.resolve());
  const base: NotifyEnv = {
    Notification: { permission: 'granted', requestPermission: vi.fn() },
    getRegistration: async () => Promise.resolve({ showNotification }),
    vibrate,
    beeper,
    isVisible: () => false,
    ...overrides,
  };
  return { env: base, beeper, vibrate, showNotification };
}

describe('decideChannels', () => {
  it('na viditelné stránce stačí zvuk a upozornění v aplikaci', () => {
    expect(decideChannels(true, 'granted')).toEqual({ system: false, sound: true });
  });
  it('na pozadí s povolením systémová notifikace', () => {
    expect(decideChannels(false, 'granted')).toEqual({ system: true, sound: false });
  });
  it('na pozadí bez povolení aspoň zvuk', () => {
    for (const s of ['default', 'denied', 'unsupported'] as const) {
      expect(decideChannels(false, s)).toEqual({ system: false, sound: true });
    }
  });
});

describe('notifyTimersDone', () => {
  it('na pozadí s povolením ukáže notifikaci přes service worker s tagem a adresou', async () => {
    const { env: e, showNotification, beeper } = env();
    await expect(notifyTimersDone([notice], e)).resolves.toBe('system');
    expect(showNotification).toHaveBeenCalledWith('Hotovo: Zavadnutí lepidla', {
      body: 'Krok 1 · Lepení',
      tag: 'hidepath-timer-t1',
      icon: '/icons/icon-192.png',
      data: { url: notice.url },
    });
    expect(beeper.beep).not.toHaveBeenCalled();
  });

  it('bez registrace service workeru spadne do aplikace (pípnutí + vibrace)', async () => {
    const {
      env: e,
      beeper,
      vibrate,
    } = env({ getRegistration: async () => Promise.resolve(undefined) });
    await expect(notifyTimersDone([notice], e)).resolves.toBe('in-app');
    expect(beeper.beep).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('chyba notifikace neshodí ohlášení – pípne', async () => {
    const { env: e, beeper } = env({
      getRegistration: async () =>
        Promise.resolve({ showNotification: async () => Promise.reject(new Error('x')) }),
    });
    await expect(notifyTimersDone([notice], e)).resolves.toBe('in-app');
    expect(beeper.beep).toHaveBeenCalled();
  });

  it('viditelná stránka notifikaci neukazuje, jen pípne', async () => {
    const { env: e, showNotification, beeper } = env({ isVisible: () => true });
    await notifyTimersDone([notice], e);
    expect(showNotification).not.toHaveBeenCalled();
    expect(beeper.beep).toHaveBeenCalledTimes(1);
  });

  it('bez vibrací a s chybou vibrace pořád funguje', async () => {
    const { env: e } = env({
      isVisible: () => true,
      vibrate: () => {
        throw new Error('no');
      },
    });
    await expect(notifyTimersDone([notice], e)).resolves.toBe('in-app');
    const { env: e2 } = env({ isVisible: () => true, vibrate: undefined });
    await expect(notifyTimersDone([notice], e2)).resolves.toBe('in-app');
  });

  it('prázdný seznam nic nedělá', async () => {
    const { env: e, beeper, showNotification } = env();
    await notifyTimersDone([], e);
    expect(beeper.beep).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();
  });
});

describe('povolení notifikací', () => {
  it('bez Notification API je unsupported', async () => {
    expect(notificationSupport({ Notification: undefined })).toBe('unsupported');
    await expect(requestNotificationPermission({ Notification: undefined })).resolves.toBe(
      'unsupported',
    );
  });

  it('žádost vrátí odpověď prohlížeče', async () => {
    const api = {
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn(async () => Promise.resolve('granted' as NotificationPermission)),
    };
    expect(notificationSupport({ Notification: api })).toBe('default');
    await expect(requestNotificationPermission({ Notification: api })).resolves.toBe('granted');
  });

  it('chyba žádosti vrátí aktuální stav', async () => {
    const api = {
      permission: 'denied' as NotificationPermission,
      requestPermission: async () => Promise.reject(new Error('blocked')),
    };
    await expect(requestNotificationPermission({ Notification: api })).resolves.toBe('denied');
  });
});

describe('createBeeper', () => {
  function fakeAudio(initialState = 'suspended') {
    const oscillators: { start: ReturnType<typeof vi.fn> }[] = [];
    const resume = vi.fn(async () => Promise.resolve());
    const param = () => ({
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    });
    let instances = 0;
    class Ctx {
      state = initialState;
      currentTime = 0;
      destination = {} as AudioNode;
      constructor() {
        instances++;
      }
      resume = resume;
      createOscillator() {
        const osc = {
          type: '',
          frequency: param(),
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        oscillators.push(osc);
        return osc as unknown as OscillatorNode;
      }
      createGain() {
        return { gain: param(), connect: vi.fn() } as unknown as GainNode;
      }
    }
    return {
      Ctor: Ctx as unknown as AudioContextCtor,
      oscillators,
      resume,
      count: () => instances,
    };
  }

  it('unlock vytvoří a probudí jeden AudioContext, beep zahraje tři tóny', () => {
    const audio = fakeAudio();
    const beeper = createBeeper(audio.Ctor);
    beeper.unlock();
    beeper.unlock();
    expect(audio.count()).toBe(1);
    expect(audio.resume).toHaveBeenCalled();
    beeper.beep();
    expect(audio.oscillators).toHaveLength(3);
  });

  it('probudí i kontext přerušený systémem (iOS „interrupted“ po návratu z pozadí)', () => {
    const audio = fakeAudio('interrupted');
    createBeeper(audio.Ctor).beep();
    expect(audio.resume).toHaveBeenCalled();
  });

  it('běžící kontext znovu neprobouzí', () => {
    const audio = fakeAudio('running');
    createBeeper(audio.Ctor).beep();
    expect(audio.resume).not.toHaveBeenCalled();
  });

  it('bez Web Audio nic nedělá a nespadne', () => {
    const beeper = createBeeper(undefined);
    expect(() => {
      beeper.unlock();
      beeper.beep();
    }).not.toThrow();
  });
});

describe('closeTimerNotification', () => {
  it('zavře systémovou notifikaci časovače podle tagu („Rozumím“ v aplikaci)', async () => {
    const close = vi.fn();
    const getNotifications = vi.fn(async () => Promise.resolve([{ close }]));
    await closeTimerNotification('t1', {
      getRegistration: async () => Promise.resolve({ showNotification: vi.fn(), getNotifications }),
    });
    expect(getNotifications).toHaveBeenCalledWith({ tag: 'hidepath-timer-t1' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('bez service workeru nebo s chybou nic neshodí', async () => {
    await expect(
      closeTimerNotification('t1', { getRegistration: undefined }),
    ).resolves.toBeUndefined();
    await expect(
      closeTimerNotification('t1', { getRegistration: async () => Promise.reject(new Error('x')) }),
    ).resolves.toBeUndefined();
  });
});
