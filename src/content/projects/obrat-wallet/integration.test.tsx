import { screen } from '@testing-library/react';
import { renderApp } from '@/test/render';

describe('OBRAT v běžných stránkách aplikace', () => {
  it('zobrazuje projekt s lekcemi a přiznaným stavem prototypu', async () => {
    renderApp('/projects/obrat-wallet');
    expect(await screen.findByRole('heading', { name: 'Peněženka OBRAT' })).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /Jak OBRAT funguje a co do něj patří/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/prototyp zatím nikdo neušil/)).toBeInTheDocument();
  });
});
