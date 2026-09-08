import { screen, within } from '@testing-library/react';

import { renderApp, setOnline } from '@/test/render';

describe('AppShell', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('vykreslí brand, čtyři položky navigace a zvýrazní aktivní', async () => {
    renderApp('/shopping/veg-tan-leather');

    const nav = await screen.findByRole('navigation', { name: 'Hlavní navigace' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual([
      'Přehled',
      'Nákupy',
      'Dílna',
      'Projekt a lekce',
    ]);
    expect(within(nav).getByRole('link', { name: 'Nákupy' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('From first cut to finished craft.')).toBeInTheDocument();
  });

  it('kořenová adresa vede na onboarding bez horní navigace', async () => {
    const { router } = renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /první kožený výrobek/i }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
    expect(screen.queryByRole('navigation', { name: 'Hlavní navigace' })).not.toBeInTheDocument();
  });

  it('neznámá adresa uvnitř shellu zobrazí stránku 404', async () => {
    renderApp('/neexistuje');
    expect(
      await screen.findByRole('heading', { level: 1, name: /tuhle stránku nemáme/i }),
    ).toBeInTheDocument();
  });

  it('offline stav zobrazí viditelný pruh', async () => {
    setOnline(false);
    renderApp('/dashboard');
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Offline');
  });

  it('online bez čekajících změn hlásí synchronizaci jen pro čtečky', async () => {
    renderApp('/dashboard');
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Vše synchronizováno');
    expect(status).toHaveClass('sr-only');
  });
});
