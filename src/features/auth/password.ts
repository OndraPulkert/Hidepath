import {
  type AuthErrorLike,
  isNetworkError,
  isRateLimited,
  OFFLINE_MESSAGE,
} from '@/features/auth/auth-errors';

/**
 * Přihlášení heslem – hlavní cesta pro instalovanou PWA na iPhonu (odkaz z e-mailu se otevře
 * v Safari s odděleným úložištěm). Heslo si uživatel nastaví po prvním přihlášení odkazem
 * (Účet → Heslo); registrace heslem na přihlašovací stránce není. Tady jsou jen čistá pravidla.
 */

/**
 * Musí odpovídat `[auth] minimum_password_length` a `password_requirements` v
 * supabase/config.toml (pushnuto na hostovaný projekt). Hlídá to test.
 */
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_RULES_HINT = `Aspoň ${PASSWORD_MIN_LENGTH} znaků, malá i velká písmena a číslice.`;

export const NO_PASSWORD_HINT = 'Ještě nemáte heslo? Přihlaste se odkazem a nastavte si ho v Účtu.';

export const PASSWORD_SAVED_MESSAGE =
  'Heslo uloženo – v aplikaci na ploše se teď přihlaste e-mailem a heslem.';

const REAUTH_MESSAGE =
  'Z bezpečnostních důvodů teď heslo změnit nejde. Přihlaste se znovu odkazem a hned heslo nastavte.';

/** Kontrola nového hesla před odesláním (stejná pravidla jako server, ať chyba přijde hned). */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length === 0) return 'Zadejte nové heslo.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Heslo je krátké. ${PASSWORD_RULES_HINT}`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return `Heslo je slabé. ${PASSWORD_RULES_HINT}`;
  }
  if (password !== confirm) return 'Hesla se neshodují.';
  return null;
}

/**
 * Chyba přihlášení heslem. Neprozrazuje, jestli účet existuje: špatné heslo, neexistující účet
 * i účet bez hesla (založený odkazem) dostanou stejnou hlášku. Surový text ze serveru nikdy.
 */
export function describeSignInError(error: AuthErrorLike): string {
  if (isNetworkError(error)) return OFFLINE_MESSAGE;
  if (isRateLimited(error)) return 'Příliš mnoho pokusů. Počkejte pár minut a zkuste to znovu.';
  return `E-mail nebo heslo nesedí. ${NO_PASSWORD_HINT}`;
}

/** Chyba nastavení hesla (`updateUser({ password })`). */
export function describeUpdatePasswordError(error: AuthErrorLike): string {
  if (isNetworkError(error)) return OFFLINE_MESSAGE;
  if (error.code === 'weak_password' || error.name === 'AuthWeakPasswordError') {
    return `Heslo je slabé. ${PASSWORD_RULES_HINT}`;
  }
  if (error.code === 'same_password') return 'Nové heslo musí být jiné než současné.';
  if (
    error.code === 'reauthentication_needed' ||
    error.code === 'reauthentication_not_valid' ||
    error.code === 'session_not_found' ||
    error.name === 'AuthSessionMissingError'
  ) {
    return REAUTH_MESSAGE;
  }
  if (isRateLimited(error)) return 'Příliš mnoho pokusů. Počkejte pár minut a zkuste to znovu.';
  return 'Heslo se nepodařilo uložit. Zkuste to prosím za chvíli.';
}
