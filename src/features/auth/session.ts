/**
 * Typy relace a čistá pravidla přesměrování. Reálné načítání relace ze Supabase
 * přijde v Milníku 3; UI už teď pracuje jen s těmito typy.
 */
export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SessionUser {
  id: string;
  email: string | null;
}

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
}

export const RETURN_TO_PARAM = 'returnTo';

/**
 * Sestaví URL přihlášení s návratovou adresou. Přijímá pouze relativní cesty,
 * aby nešlo přesměrovat na cizí web.
 */
export function buildLoginUrl(loginPath: string, returnTo: string): string {
  if (!isSafeReturnTo(returnTo) || returnTo === loginPath) return loginPath;
  return `${loginPath}?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`;
}

/** Vrátí bezpečnou návratovou adresu z query stringu, nebo fallback. */
export function readReturnTo(search: string, fallback: string): string {
  const value = new URLSearchParams(search).get(RETURN_TO_PARAM);
  if (!value || !isSafeReturnTo(value) || isAuthPath(value)) return fallback;
  return value;
}

/** Přihlašovací a callback stránky nejsou platný cíl návratu (smyčka přesměrování). */
export function isAuthPath(value: string): boolean {
  return /^\/(login|auth\/)/.test(value);
}

/** Relativní cesta začínající jedním lomítkem (ne `//host`, ne absolutní URL). */
export function isSafeReturnTo(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !/[\\\s]/.test(value);
}

/**
 * Rozhodne, zda chráněná trasa smí vykreslit obsah, čekat, nebo přesměrovat.
 * Pokud je ochrana vypnutá (Milník 1–2), vždy propouští.
 */
export type GuardDecision = { kind: 'allow' } | { kind: 'wait' } | { kind: 'redirect'; to: string };

export function decideRouteGuard(input: {
  guardEnabled: boolean;
  session: Session;
  currentUrl: string;
  loginPath: string;
}): GuardDecision {
  if (!input.guardEnabled) return { kind: 'allow' };
  switch (input.session.status) {
    case 'authenticated':
      return { kind: 'allow' };
    case 'loading':
      return { kind: 'wait' };
    case 'anonymous':
      return { kind: 'redirect', to: buildLoginUrl(input.loginPath, input.currentUrl) };
  }
}
