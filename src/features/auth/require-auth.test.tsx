import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';

import type * as ConfigModule from '@/app/config';
import { AppProviders } from '@/app/providers';
import { appRoutes } from '@/app/router';
import { type Session } from '@/features/auth/session';
import { createTestRepositories } from '@/test/render';

vi.mock('@/app/config', async (importOriginal) => {
  const actual = await importOriginal<typeof ConfigModule>();
  return { appConfig: { ...actual.appConfig, authGuardEnabled: true } };
});

function renderAt(url: string, session: Session) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [url] });
  render(
    <AppProviders repositories={createTestRepositories()} initialSession={session}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe('RequireAuth se zapnutou ochranou', () => {
  it('nepřihlášeného pošle na login s návratovou adresou', async () => {
    const router = renderAt('/workshop', { status: 'anonymous', user: null });
    await screen.findByRole('heading', { level: 1, name: 'Přihlášení' });
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe('?returnTo=%2Fworkshop');
  });

  it('během načítání relace čeká', async () => {
    renderAt('/workshop', { status: 'loading', user: null });
    expect(await screen.findByRole('status')).toHaveTextContent(/ověřujeme přihlášení/i);
  });

  it('přihlášeného propustí a v navigaci ukáže odhlášení', async () => {
    renderAt('/workshop', {
      status: 'authenticated',
      user: { id: 'u1', email: 'test@example.com' },
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Moje dílna' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Odhlásit/ })).toBeInTheDocument();
  });

  it('přihlášený na loginu je přesměrován na návratovou adresu', async () => {
    const router = renderAt('/login?returnTo=%2Fshopping', {
      status: 'authenticated',
      user: { id: 'u1', email: null },
    });
    await screen.findByRole('heading', { level: 1, name: 'Nákupní seznam' });
    expect(router.state.location.pathname).toBe('/shopping');
  });

  it('onboarding je veřejný – nepřihlášený vybere projekt a teprve pak jde na login', async () => {
    const router = renderAt('/onboarding', { status: 'anonymous', user: null });
    expect(
      await screen.findByRole('heading', { level: 1, name: /první kožený výrobek/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
  });

  it('kořen je chráněný – nepřihlášeného pošle na login', async () => {
    const router = renderAt('/', { status: 'anonymous', user: null });
    await screen.findByRole('heading', { level: 1, name: 'Přihlášení' });
    expect(router.state.location.pathname).toBe('/login');
  });
});
