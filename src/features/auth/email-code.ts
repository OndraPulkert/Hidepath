import { type AuthErrorLike, isNetworkError, OFFLINE_MESSAGE } from '@/features/auth/auth-errors';
import { type StorageLike } from '@/features/data/local-collection';

export type { AuthErrorLike } from '@/features/auth/auth-errors';

/**
 * Přihlášení kódem z e-mailu (Supabase e-mailové OTP). Instalovaná PWA na iPhonu odkaz z e-mailu
 * nedostane – Mail ho otevře v Safari, které má oddělené úložiště. Kód se proto opíše do aplikace.
 * Tady jsou jen čistá pravidla; stránka přihlášení je jen skládá.
 *
 * Krok s kódem je VOLITELNÝ a výchozí VYPNUTÝ: kód se do e-mailu dostane jen z vlastní šablony,
 * a tu Supabase na free tieru povolí jen s vlastním SMTP. Bez něj iPhone používá heslo
 * (`password.ts`). Zapíná se při buildu `VITE_AUTH_EMAIL_CODE=1` – viz docs/deploy/prihlaseni-kodem.md.
 */

/** Zda aplikace po odeslání e-mailu ukáže krok „Opište kód“. Hodnota se čte při buildu (Vite). */
export function isEmailCodeEnabled(
  flag: string | undefined = import.meta.env.VITE_AUTH_EMAIL_CODE,
): boolean {
  return flag === '1';
}

/** Supabase povoluje délku kódu 6–10 číslic (`auth.email.otp_length`, výchozí 6). */
export const CODE_MIN_LENGTH = 6;
export const CODE_MAX_LENGTH = 10;

/** Supabase pustí další e-mail se kódem stejnému uživateli nejdřív po 60 s (`max_frequency`). */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Platnost kódu i odkazu (`auth.email.otp_expiry`, výchozí 3600 s). */
export const CODE_EXPIRY_SECONDS = 3600;

const CODE_RE = new RegExp(`^\\d{${CODE_MIN_LENGTH},${CODE_MAX_LENGTH}}$`);

/** Odstraní mezery a pomlčky, které vzniknou při opisování nebo vložení („123 456“). */
export function normalizeCode(input: string): string {
  return input.replace(/[\s-]/g, '');
}

export function isValidCode(code: string): boolean {
  return CODE_RE.test(code);
}

/** Zbývající sekundy do povoleného dalšího odeslání (zaokrouhleno nahoru, nikdy záporné). */
export function secondsUntil(resendAt: number, now: number): number {
  return Math.max(0, Math.ceil((resendAt - now) / 1000));
}

/** Supabase při překročení limitu vrací „… you can only request this after 42 seconds“. */
export function readRetryAfterSeconds(message: string): number | null {
  const match = /after (\d+) seconds?/i.exec(message);
  return match ? Number(match[1]) : null;
}

export type SendFailure =
  | { kind: 'cooldown'; retryAfterSeconds: number; message: string }
  | { kind: 'error'; message: string };

/** Přeloží chybu odeslání e-mailu. Surový text ze serveru se nikdy nezobrazuje. */
export function describeSendError(error: AuthErrorLike, codeEnabled = true): SendFailure {
  const retryAfter = readRetryAfterSeconds(error.message);
  if (retryAfter !== null || error.code === 'over_request_rate_limit') {
    const seconds = retryAfter ?? RESEND_COOLDOWN_SECONDS;
    return {
      kind: 'cooldown',
      retryAfterSeconds: seconds,
      message: `E-mail jsme posílali před chvílí. Nový můžete poslat za ${seconds} s.`,
    };
  }
  if (error.code === 'over_email_send_rate_limit' || /rate limit|too many/i.test(error.message)) {
    return {
      kind: 'error',
      message: codeEnabled
        ? 'Odeslali jsme teď příliš mnoho e-mailů. Zkuste to později, nebo použijte kód z posledního e-mailu.'
        : 'Odeslali jsme teď příliš mnoho e-mailů. Zkuste to později, nebo použijte odkaz z posledního e-mailu.',
    };
  }
  if (isNetworkError(error)) return { kind: 'error', message: OFFLINE_MESSAGE };
  if (/invalid/i.test(error.message) || error.code === 'email_address_invalid') {
    return {
      kind: 'error',
      message: 'E-mailovou adresu se nepodařilo použít. Zkontrolujte ji a zkuste to znovu.',
    };
  }
  return { kind: 'error', message: 'E-mail se nepodařilo odeslat. Zkuste to prosím za chvíli.' };
}

/**
 * Přeloží chybu ověření kódu. Supabase vrací pro špatný i vypršelý kód stejné `otp_expired`
 * („Token has expired or is invalid“); vypršení proto poznáme podle času odeslání.
 */
export function describeVerifyError(error: AuthErrorLike, sentAt: number, now: number): string {
  if (error.code === 'over_request_rate_limit' || /rate limit|too many/i.test(error.message)) {
    return 'Příliš mnoho pokusů. Počkejte pár minut a zkuste to znovu.';
  }
  if (isNetworkError(error)) return OFFLINE_MESSAGE;
  if (now - sentAt >= CODE_EXPIRY_SECONDS * 1000) {
    return 'Kód už vypršel. Nechte si poslat nový.';
  }
  return 'Kód nesedí. Zkontrolujte ho; platí jen kód z posledního e-mailu.';
}

/** Rozpracované přihlášení – přežije přepnutí do Mailu a zpět i reload PWA. */
export interface PendingLogin {
  email: string;
  sentAt: number;
  resendAt: number;
}

export const PENDING_LOGIN_KEY = 'hidepath:pending-login';

/** Nové rozpracované přihlášení hned po odeslání e-mailu; další odeslání až po odpočtu. */
export function startPendingLogin(email: string, at: number = Date.now()): PendingLogin {
  return { email, sentAt: at, resendAt: at + RESEND_COOLDOWN_SECONDS * 1000 };
}

export function savePendingLogin(storage: StorageLike | null, pending: PendingLogin): void {
  try {
    storage?.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending));
  } catch {
    /* Bez úložiště krok s kódem jen nepřežije reload. */
  }
}

export function clearPendingLogin(storage: StorageLike | null): void {
  try {
    storage?.removeItem(PENDING_LOGIN_KEY);
  } catch {
    /* nic */
  }
}

/** Vrátí uložené přihlášení, jen pokud je platné a kód ještě nevypršel. */
export function readPendingLogin(storage: StorageLike | null, now: number): PendingLogin | null {
  try {
    const raw = storage?.getItem(PENDING_LOGIN_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isPendingLogin(value)) return null;
    if (now - value.sentAt >= CODE_EXPIRY_SECONDS * 1000) return null;
    return value;
  } catch {
    return null;
  }
}

function isPendingLogin(value: unknown): value is PendingLogin {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.email === 'string' &&
    v.email.includes('@') &&
    typeof v.sentAt === 'number' &&
    Number.isFinite(v.sentAt) &&
    typeof v.resendAt === 'number' &&
    Number.isFinite(v.resendAt)
  );
}

/**
 * localStorage, nebo `null`, když ho prohlížeč nepovolí (privátní režim, zablokovaná data).
 * Ne sessionStorage: iOS aplikaci z plochy při přepnutí do Mailu často ukončí a sessionStorage
 * by se ztratil – uživatel by po návratu nevěděl, kam kód opsat. Záznam drží jen e-mail a časy,
 * po vypršení kódu se neuplatní a smaže se po přihlášení i odhlášení.
 */
export function resolvePendingLoginStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
