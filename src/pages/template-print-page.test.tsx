import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { renderApp } from '@/test/render';

/** Listy peněženky Víčko pro změřenou kůži se generují přímo na stránce tisku (lekce 1). */
describe('tisk listů – peněženka Víčko pro změřenou kůži', () => {
  it('vygeneruje 4 listy pro zadané tloušťky a zaškrtne je k tisku místo výchozích', async () => {
    const user = userEvent.setup();
    renderApp(routes.template(lidWalletProject.slug));

    await user.type(await screen.findByLabelText('Přepážky D1/D2, mm'), '0,8');
    await user.type(screen.getByLabelText('Podšívka L1, mm'), '0,9');
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy' }));

    expect(await screen.findByText(/jsou připravené níže a zaškrtnuté k tisku/)).toHaveTextContent(
      /P1 1,0 · přepážky 0,8 · L1 0,9/,
    );
    const group = screen.getByText(
      'Pro změřenou kůži: P1 1,0 · přepážky 0,8 · L1 0,9',
    ).parentElement!;
    const boxes = within(group).getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    for (const b of boxes) expect(b).toBeChecked();
    // Výchozí listy zůstanou k výběru, ale nezaškrtnuté.
    expect(screen.getByRole('checkbox', { name: /^List 1.*líce\s?Pás P1 101/ })).not.toBeChecked();
    const images = screen.getAllByRole('img', { name: /^List střihu:/ });
    expect(images).toHaveLength(4);
    for (const img of images) expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    expect(decodeURIComponent(images[3]!.getAttribute('src')!)).toContain('D1/D2 0,8 · L1 0,9');
  });

  it('přepážky nad 0,92 mm odmítne a nic nevygeneruje', async () => {
    const user = userEvent.setup();
    renderApp(routes.template(lidWalletProject.slug));

    await user.type(await screen.findByLabelText('Přepážky D1/D2, mm'), '1,0');
    await user.type(screen.getByLabelText('Podšívka L1, mm'), '0,9');
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy' }));

    expect(await screen.findByText(/Listy nevznikly/)).toBeInTheDocument();
    expect(screen.queryByText(/^Pro změřenou kůži:/)).not.toBeInTheDocument();
  });
});
