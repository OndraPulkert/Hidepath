/**
 * Ohlášení doběhlého časovače. Systémová notifikace jen s povolením (o které se žádá
 * výhradně z tlačítka „Upozornit mě“) a přes service worker; jinak upozornění v aplikaci,
 * krátké pípnutí (Web Audio, odemčené tapnutím na „Spustit“) a vibrace, kde jsou.
 */

export type NotificationSupport = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationApi {
  permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
}

export interface SwRegistrationLike {
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  getNotifications?(filter?: { tag?: string }): Promise<readonly { close(): void }[]>;
}

/** Tag systémové notifikace časovače – stejné čekání se nezobrazí dvakrát a jde zavřít. */
export function timerNotificationTag(id: string): string {
  return `hidepath-timer-${id}`;
}

export interface NotifyEnv {
  Notification?: NotificationApi | undefined;
  /** Registrace service workeru; bez SW (vývoj, nepodporovaný prohlížeč) undefined. */
  getRegistration?: (() => Promise<SwRegistrationLike | undefined>) | undefined;
  vibrate?: ((pattern: number[]) => boolean) | undefined;
  beeper?: Beeper | undefined;
  /** Zda je stránka právě vidět. */
  isVisible: () => boolean;
}

export function notificationSupport(env: Pick<NotifyEnv, 'Notification'>): NotificationSupport {
  return env.Notification ? env.Notification.permission : 'unsupported';
}

/** Požádá o povolení notifikací. Volat jen z kliknutí uživatele. */
export async function requestNotificationPermission(
  env: Pick<NotifyEnv, 'Notification'>,
): Promise<NotificationSupport> {
  if (!env.Notification) return 'unsupported';
  try {
    return await env.Notification.requestPermission();
  } catch {
    return env.Notification.permission;
  }
}

export interface NotifyChannels {
  system: boolean;
  sound: boolean;
}

/**
 * Kudy ohlásit: když je stránka vidět, stačí upozornění v aplikaci se zvukem. Na pozadí
 * systémová notifikace (je-li povolená), jinak aspoň zvuk – upozornění v aplikaci uvidí
 * uživatel po návratu.
 */
export function decideChannels(visible: boolean, support: NotificationSupport): NotifyChannels {
  if (visible) return { system: false, sound: true };
  return support === 'granted' ? { system: true, sound: false } : { system: false, sound: true };
}

export interface TimerNotice {
  /** Id časovače – tag notifikace, aby se stejné čekání nezobrazilo dvakrát. */
  id: string;
  title: string;
  body: string;
  /** Kam vede kliknutí na notifikaci. */
  url: string;
}

export type NotifyResult = 'system' | 'in-app';

const VIBRATION = [300, 150, 300, 150, 300];

/** Ohlásí doběhlé časovače. Volat až po zápisu `firedAt` (timerStore.claimDue). */
export async function notifyTimersDone(
  notices: readonly TimerNotice[],
  env: NotifyEnv,
): Promise<NotifyResult> {
  if (notices.length === 0) return 'in-app';
  const channels = decideChannels(env.isVisible(), notificationSupport(env));
  if (channels.system) {
    const shown = await showSystemNotifications(notices, env);
    if (shown) return 'system';
  }
  env.beeper?.beep();
  try {
    env.vibrate?.(VIBRATION);
  } catch {
    // Vibrace je jen bonus.
  }
  return 'in-app';
}

async function showSystemNotifications(
  notices: readonly TimerNotice[],
  env: NotifyEnv,
): Promise<boolean> {
  try {
    const registration = await env.getRegistration?.();
    if (!registration) return false;
    for (const n of notices) {
      await registration.showNotification(n.title, {
        body: n.body,
        tag: timerNotificationTag(n.id),
        icon: '/icons/icon-192.png',
        data: { url: n.url },
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Zavře už zobrazenou systémovou notifikaci časovače (uživatel ho zavřel nebo zrušil v aplikaci),
 * aby v liště nezůstalo zastaralé „Hotovo“. Jen pokus – chyba nic neshodí.
 */
export async function closeTimerNotification(
  id: string,
  env: Pick<NotifyEnv, 'getRegistration'>,
): Promise<void> {
  try {
    const registration = await env.getRegistration?.();
    const shown = await registration?.getNotifications?.({ tag: timerNotificationTag(id) });
    for (const n of shown ?? []) n.close();
  } catch {
    // Notifikace zmizí nejpozději po klepnutí.
  }
}

// ---------------------------------------------------------------------------
// Zvuk

export interface Beeper {
  /** Odemkne zvuk – volat z tapnutí (mobilní prohlížeče jinak zvuk nepustí). */
  unlock(): void;
  beep(): void;
}

interface AudioContextLike {
  state: string;
  currentTime: number;
  destination: AudioNode;
  resume(): Promise<void>;
  createOscillator(): OscillatorNode;
  createGain(): GainNode;
}

export type AudioContextCtor = new () => AudioContextLike;

/** Tři krátká pípnutí přes Web Audio. Bez Web Audio nedělá nic. */
export function createBeeper(Ctor: AudioContextCtor | undefined): Beeper {
  let ctx: AudioContextLike | null = null;
  const ensure = (): AudioContextLike | null => {
    if (!Ctor) return null;
    try {
      ctx ??= new Ctor();
      // 'suspended' bez gesta i 'interrupted' (iOS po návratu z pozadí) – obojí probudit.
      if (ctx.state !== 'running' && ctx.state !== 'closed')
        void ctx.resume().catch(() => undefined);
      return ctx;
    } catch {
      return null;
    }
  };
  return {
    unlock() {
      ensure();
    },
    beep() {
      const c = ensure();
      if (!c) return;
      try {
        for (let i = 0; i < 3; i++) {
          const start = c.currentTime + i * 0.35;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(start);
          osc.stop(start + 0.27);
        }
      } catch {
        // Zvuk je doplněk upozornění v aplikaci.
      }
    },
  };
}

/** Prostředí prohlížeče pro ohlášení. */
export function browserNotifyEnv(beeper: Beeper): NotifyEnv {
  const hasNotification = typeof window !== 'undefined' && 'Notification' in window;
  const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined;
  return {
    Notification: hasNotification ? window.Notification : undefined,
    // `serviceWorker.ready` bez registrace nikdy nedoběhne – proto getRegistration().
    getRegistration: sw ? () => sw.getRegistration() : undefined,
    vibrate:
      typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
        ? (pattern) =>
            // Bez dřívějšího tapnutí na stránku (po reloadu) Chrome vibraci zablokuje a vypíše
            // chybu do konzole – v tom případě ji ani nezkoušet.
            hasUserActivation() ? navigator.vibrate(pattern) : false
        : undefined,
    beeper,
    isVisible: () => typeof document === 'undefined' || document.visibilityState === 'visible',
  };
}

/** Zda uživatel na stránku už klepl (bez API, např. starší Safari, předpokládáme ano). */
function hasUserActivation(): boolean {
  const nav = navigator as { userActivation?: { hasBeenActive: boolean } };
  return nav.userActivation?.hasBeenActive ?? true;
}

function audioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

/** Sdílené pípátko aplikace (jeden AudioContext). */
export const appBeeper: Beeper = createBeeper(audioContextCtor());
