import { screen, within } from '@testing-library/react';

import { ProductExamples } from '@/components/equipment/product-examples';
import { getEquipment } from '@/content/equipment';
import { renderWithProviders } from '@/test/render';

describe('ProductExamples', () => {
  it('pás na opasek: přírodní rozbalený, barevné po barvách sbalené', async () => {
    renderWithProviders(<ProductExamples examples={getEquipment('belt-strap').examples} />);
    expect(await screen.findByRole('heading', { name: /^Přírodní/ })).toBeInTheDocument();
    const summaries = [...document.querySelectorAll('details > summary')]
      .map((s) => s.textContent ?? '')
      .filter((t) => !t.startsWith('Varianty'));
    expect(summaries.map((t) => t.split(' · ')[0])).toEqual([
      'Světle hnědá',
      'Hnědá',
      'Tmavě hnědá',
      'Koňak',
      'Tabák',
      'Černá',
      'Modrá',
      'Bordó',
      'Tmavě zelená',
    ]);
    const black = [...document.querySelectorAll('details')].find((d) =>
      d.querySelector('summary')?.textContent?.startsWith('Černá'),
    )!;
    expect(black).not.toHaveAttribute('open');
    expect(
      within(black)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toContain('https://craft-point.cz/products/remen-z-prave-kuze-3-0-3-5mm-140cm-15-80mm-cerny');
  });

  it('výrobek bez barev: bez nadpisů barev', async () => {
    renderWithProviders(<ProductExamples examples={getEquipment('belt-buckle').examples} />);
    expect(
      await screen.findByRole('heading', { name: 'Ověřené příklady výrobků' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Přírodní/ })).toBeNull();
  });
});
