import {
  buildLoginUrl,
  decideRouteGuard,
  isSafeReturnTo,
  readReturnTo,
  type Session,
} from '@/features/auth/session';

const anonymous: Session = { status: 'anonymous', user: null };
const loading: Session = { status: 'loading', user: null };
const authenticated: Session = {
  status: 'authenticated',
  user: { id: 'u1', email: 'test@example.com' },
};

describe('buildLoginUrl', () => {
  it('připojí návratovou adresu jako returnTo', () => {
    expect(buildLoginUrl('/login', '/shopping/veg-tan-leather?x=1')).toBe(
      '/login?returnTo=%2Fshopping%2Fveg-tan-leather%3Fx%3D1',
    );
  });

  it('odmítne absolutní URL a protocol-relative adresy', () => {
    expect(buildLoginUrl('/login', 'https://evil.example')).toBe('/login');
    expect(buildLoginUrl('/login', '//evil.example')).toBe('/login');
  });

  it('nepřidává returnTo na samotný login', () => {
    expect(buildLoginUrl('/login', '/login')).toBe('/login');
  });
});

describe('readReturnTo', () => {
  it('přečte a dekóduje bezpečnou adresu', () => {
    expect(readReturnTo('?returnTo=%2Fdashboard', '/')).toBe('/dashboard');
  });

  it('přihlašovací cesty jako návratovou adresu ignoruje', () => {
    expect(readReturnTo('?returnTo=%2Flogin', '/dashboard')).toBe('/dashboard');
    expect(readReturnTo('?returnTo=%2Fauth%2Fcallback', '/dashboard')).toBe('/dashboard');
  });

  it('při chybějící nebo nebezpečné hodnotě vrátí fallback', () => {
    expect(readReturnTo('', '/dashboard')).toBe('/dashboard');
    expect(readReturnTo('?returnTo=https%3A%2F%2Fevil.example', '/dashboard')).toBe('/dashboard');
  });
});

describe('isSafeReturnTo', () => {
  it.each(['/', '/dashboard', '/projects/card-holder/lessons/01?x=1'])('povolí %s', (v) => {
    expect(isSafeReturnTo(v)).toBe(true);
  });

  it.each(['', 'dashboard', '//x', 'http://x', '/a b', '/a\\b'])('odmítne %s', (v) => {
    expect(isSafeReturnTo(v)).toBe(false);
  });
});

describe('decideRouteGuard', () => {
  const base = { loginPath: '/login', currentUrl: '/workshop' };

  it('s vypnutou ochranou vždy propouští', () => {
    expect(decideRouteGuard({ ...base, guardEnabled: false, session: anonymous })).toEqual({
      kind: 'allow',
    });
  });

  it('přihlášeného propustí', () => {
    expect(decideRouteGuard({ ...base, guardEnabled: true, session: authenticated })).toEqual({
      kind: 'allow',
    });
  });

  it('během načítání čeká', () => {
    expect(decideRouteGuard({ ...base, guardEnabled: true, session: loading })).toEqual({
      kind: 'wait',
    });
  });

  it('nepřihlášeného pošle na login s návratovou adresou', () => {
    expect(decideRouteGuard({ ...base, guardEnabled: true, session: anonymous })).toEqual({
      kind: 'redirect',
      to: '/login?returnTo=%2Fworkshop',
    });
  });
});
