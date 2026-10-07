/** Minimální tvar chyby ze Supabase Auth (AuthError), aby šla pravidla testovat bez klienta. */
export interface AuthErrorLike {
  message: string;
  code?: string | undefined;
  name?: string | undefined;
  status?: number | undefined;
}

export const OFFLINE_MESSAGE =
  'Nepodařilo se spojit se serverem. Zkontrolujte připojení a zkuste to znovu.';

export function isNetworkError(error: AuthErrorLike): boolean {
  return error.name === 'AuthRetryableFetchError' || /fetch|network/i.test(error.message);
}

export function isRateLimited(error: AuthErrorLike): boolean {
  return error.code === 'over_request_rate_limit' || /rate limit|too many/i.test(error.message);
}
