import { screen } from '@testing-library/react';
import { renderApp } from '@/test/render';

describe('Šikmina v běžných stránkách aplikace', () => {
  it('zobrazuje projekt s lekcemi a přiznaným stavem prototypu', async () => {
    renderApp('/projects/obrat-wallet');
    expect(await screen.findByRole('heading', { name: 'Peněženka Šikmina' })).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /Jak Šikmina funguje a co do ní patří/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/prototyp zatím nikdo neušil/)).toBeInTheDocument();
  });
});
