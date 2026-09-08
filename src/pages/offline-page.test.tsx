import { screen } from '@testing-library/react';

import { renderApp, setOnline } from '@/test/render';

describe('OfflinePage', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('bez připojení vysvětlí, proč obsah není dostupný', async () => {
    setOnline(false);
    renderApp('/offline');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Jste offline' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/není stažená do zařízení/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zpět na přehled' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('po obnovení připojení to řekne', async () => {
    setOnline(true);
    renderApp('/offline');
    expect(await screen.findByText(/připojení je zpět/i)).toBeInTheDocument();
  });
});
