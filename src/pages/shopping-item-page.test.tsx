import { screen } from '@testing-library/react';

import { animationPages } from '@/content/animations';
import { equipmentCatalog } from '@/content/equipment';
import { renderApp } from '@/test/render';

/** Detail nástroje: „Údržba“ vede na animaci ostření, jen u nástrojů, které ji mají. */
describe('detail nástroje – údržba', () => {
  it('ořezávač hran nabízí animaci ostření', async () => {
    renderApp('/shopping/edge-beveler');
    expect(await screen.findByRole('heading', { level: 2, name: 'Údržba' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Jak naostřit ořezávač hran/ });
    expect(link).toHaveAttribute('href', animationPages.bevelerSharpening.path);
  });

  it.each([
    'round-punch-32mm',
    'hole-punch-5mm',
    'small-hole-punch',
    'hole-punch-6mm',
    'round-punches-8-14',
  ])('%s nabízí animaci ostření výsečníku', async (slug) => {
    expect(equipmentCatalog[slug]?.animationLinks).toEqual([
      { href: animationPages.punchSharpening.path, label: animationPages.punchSharpening.title },
    ]);
    renderApp(`/shopping/${slug}`);
    const link = await screen.findByRole('link', { name: /Jak naostřit výsečník/ });
    expect(link).toHaveAttribute('href', animationPages.punchSharpening.path);
  });

  it('nástroj bez animace údržbu neukazuje', async () => {
    renderApp('/shopping/mallet');
    expect(
      await screen.findByRole('heading', { level: 2, name: 'K čemu slouží' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Údržba' })).not.toBeInTheDocument();
  });
});
