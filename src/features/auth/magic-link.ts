import { RETURN_TO_PARAM, isSafeReturnTo } from '@/features/auth/session';

/** URL, na kterou se uživatel vrátí z e-mailu; návratová adresa cestuje v query. */
export function buildEmailRedirectUrl(
  origin: string,
  callbackPath: string,
  returnTo: string,
): string {
  const url = new URL(callbackPath, origin);
  if (isSafeReturnTo(returnTo)) url.searchParams.set(RETURN_TO_PARAM, returnTo);
  return url.toString();
}

/**
 * Chybová hláška z callbacku Supabase. Do UI se dostávají jen vlastní texty podle `error_code`
 * / známých vzorů; surový `error_description` z URL se nikdy nezobrazuje (podvržený odkaz by
 * mohl do důvěryhodné karty vložit libovolný text).
 */
export function readAuthError(search: string, hash: string): string | null {
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('error_code') ?? hashParams.get('error_code');
  const description = params.get('error_description') ?? hashParams.get('error_description');
  const error = params.get('error') ?? hashParams.get('error');
  if (!code && !description && !error) return null;
  const haystack = `${code ?? ''} ${description ?? ''}`;
  if (/otp_expired|expired/i.test(haystack)) return 'Odkaz už vypršel. Nechte si poslat nový.';
  if (/invalid|bad_code_verifier|pkce/i.test(haystack)) {
    return 'Odkaz není platný. Otevřete ho ve stejném prohlížeči, kde jste o něj požádali, nebo si nechte poslat nový.';
  }
  return 'Přihlášení se nepodařilo. Nechte si poslat nový odkaz.';
}
