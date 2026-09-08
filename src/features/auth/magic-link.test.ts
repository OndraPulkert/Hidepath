import { buildEmailRedirectUrl, readAuthError } from '@/features/auth/magic-link';

describe('buildEmailRedirectUrl', () => {
  it('sestaví callback s návratovou adresou', () => {
    expect(buildEmailRedirectUrl('https://app.example', '/auth/callback', '/workshop')).toBe(
      'https://app.example/auth/callback?returnTo=%2Fworkshop',
    );
  });

  it('nebezpečnou návratovou adresu vynechá', () => {
    expect(
      buildEmailRedirectUrl('https://app.example', '/auth/callback', 'https://evil.example'),
    ).toBe('https://app.example/auth/callback');
  });
});

describe('readAuthError', () => {
  it('bez chyby vrátí null', () => {
    expect(readAuthError('?code=abc', '')).toBeNull();
  });

  it('přeloží vypršelý odkaz', () => {
    expect(
      readAuthError(
        '',
        '#error=access_denied&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toMatch(/vypršel|platný/);
  });

  it('surový text z URL nikdy nevrací', () => {
    expect(readAuthError('?error=access_denied&error_description=Volejte+800+123', '')).toBe(
      'Přihlášení se nepodařilo. Nechte si poslat nový odkaz.',
    );
  });
});
