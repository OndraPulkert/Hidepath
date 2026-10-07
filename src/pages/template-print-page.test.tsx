import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import { StepList } from '@/components/lessons/step-list';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { renderApp, renderWithProviders } from '@/test/render';

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

  it('zadá výsledky P0 a tloušťku magnetu (lekce 2, 10 a 11) spolu s tloušťkami kůže', async () => {
    const user = userEvent.setup();
    renderApp(routes.template(lidWalletProject.slug));

    await user.type(await screen.findByLabelText('Přepážky D1/D2, mm'), '0,8');
    await user.type(screen.getByLabelText('Podšívka L1, mm'), '0,9');
    await user.click(screen.getByText('Výsledky P0 a jiný magnet (lekce 2, 10 a 11)'));
    await user.type(screen.getByLabelText('k (P0-3, lekce 10)'), '1,3');
    await user.type(screen.getByLabelText('Tloušťka magnetu Ø 8, mm (lekce 11)'), '2');
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy' }));

    expect(await screen.findByText(/jsou připravené níže a zaškrtnuté k tisku/)).toHaveTextContent(
      /P1 1,0 · přepážky 0,8 · L1 0,9 · k 1,3 · magnet Ø 8 × 2/,
    );
  });

  it('nesmyslnou hodnotu P0 odmítne česky a nic nevygeneruje', async () => {
    const user = userEvent.setup();
    renderApp(routes.template(lidWalletProject.slug));

    await user.type(await screen.findByLabelText('Přepážky D1/D2, mm'), '0,8');
    await user.type(screen.getByLabelText('Podšívka L1, mm'), '0,9');
    await user.click(screen.getByText('Výsledky P0 a jiný magnet (lekce 2, 10 a 11)'));
    await user.type(screen.getByLabelText('Tloušťka magnetu Ø 8, mm (lekce 11)'), '0');
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy' }));

    expect(await screen.findByText(/Listy nevznikly/)).toBeInTheDocument();
    expect(screen.getByText('Tloušťka magnetu: zadejte kladné číslo.')).toBeInTheDocument();
    expect(screen.queryByText(/^Pro změřenou kůži:/)).not.toBeInTheDocument();
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

/** Projekt 01 má obdélníkovou šablonu a vedle ní cvičnou šablonu k lekci 2 na vlastní stránce. */
describe('tisk – pouzdro na karty: šablona a cvičná šablona', () => {
  it('stránka šablony zůstává obdélníková šablona 1:1', async () => {
    renderApp(routes.template(cardHolderProject.slug));
    expect(
      await screen.findByRole('heading', { name: /^Šablona 1:1 · Pouzdro na karty/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('tištěná šablona má čárky na koncích výřezu a výšky kapsy 56 mm a linii stehu po zaoblení', async () => {
    renderApp(routes.template(cardHolderProject.slug));
    const svg = await screen.findByRole('img', { name: /^Šablona 1:1: Pouzdro na karty/ });
    const marks = [...svg.querySelectorAll('[data-mark]')];
    // Rozložení: okraj 12 mm, zadní díl 100 × 70 nahoře, přední kapsa o 10 mm níž (y 92).
    expect(marks.map((m) => [m.getAttribute('data-mark'), m.getAttribute('d')])).toEqual([
      ['height', 'M12 26 L20 26'],
      ['height', 'M112 26 L104 26'],
      ['thumb-cutout-end', 'M42 92 L42 89'],
      ['thumb-cutout-end', 'M82 92 L82 89'],
    ]);
    expect(svg).toHaveTextContent('krátká čárka = značka k propíchnutí šídlem (lekce 5 a 6)');
    const stitch = [...svg.querySelectorAll('path[stroke-dasharray]')].map((p) =>
      p.getAttribute('d'),
    );
    expect(stitch).toContain(
      'M15.5 98 L15.5 142 A2.5 2.5 0 0 0 18 144.5 L106 144.5 A2.5 2.5 0 0 0 108.5 142 L108.5 98',
    );
  });

  it('lekce 5 odkazuje z kontroly tisku na tisk šablony', () => {
    const lesson5 = cardHolderProject.lessons.find((l) => l.order === 5)!;
    renderWithProviders(
      <StepList
        steps={lesson5.steps.filter((s) => s.id === 'print-check')}
        template={undefined}
        projectSlug={cardHolderProject.slug}
      />,
    );
    expect(screen.getByRole('link', { name: /Vytisknout šablonu 1:1/ })).toHaveAttribute(
      'href',
      routes.template(cardHolderProject.slug),
    );
  });

  it('cvičné listy nabídnou cvičnou šablonu zaškrtnutou k tisku', async () => {
    renderApp(routes.practiceSheets(cardHolderProject.slug));
    expect(
      await screen.findByRole('heading', { name: /^Cvičné listy 1:1 · Pouzdro na karty/ }),
    ).toBeInTheDocument();
    const box = screen.getByRole('checkbox', { name: /Cvičná šablona: řez podle přilepené/ });
    expect(box).toBeChecked();
    const img = screen.getByRole('img', { name: /^List střihu: Cvičná šablona/ });
    expect(img.getAttribute('src')).toBeTruthy();
    expect(screen.getByText(/musí mít přesně/)).toHaveTextContent('50 mm');
  });

  it('lekce 2 odkazuje z cvičení na tisk cvičné šablony', async () => {
    renderApp(routes.lesson(cardHolderProject.slug, '02-straight-cut'));
    expect(
      await screen.findByRole('heading', { name: 'Vyzkoušejte řez podle přilepené šablony' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vytisknout cvičnou šablonu 1:1/ })).toHaveAttribute(
      'href',
      routes.practiceSheets(cardHolderProject.slug),
    );
  });

  it('projekt bez cvičných listů na jejich trase ukáže 404', async () => {
    renderApp(routes.practiceSheets(lidWalletProject.slug));
    expect(
      await screen.findByRole('heading', { name: 'Tuhle stránku nemáme' }),
    ).toBeInTheDocument();
  });
});

/** Projekt 02: výchozí střih je pro kůži 1,2 mm, lekce odkazují na listy střihu. */
describe('tisk – pouzdro s vsazenou mincí', () => {
  it('předem zaškrtne listy pro kůži 1,2 mm, ne pro 1,5 mm ani záložní okno', async () => {
    renderApp(routes.template(coinCardHolderProject.slug));
    expect(
      await screen.findByRole('checkbox', { name: /^Pás \(šablona\)Tři panely/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /^Pás \(šablona\)\s–\skůže 1,5\smm/ }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /^Kapsa\s–\száložní okno Ø\s18\smm/ }),
    ).not.toBeChecked();
  });

  it('cvičné listy předem zaškrtnou proužek pro kůži 1,2 mm, ne pro 1,5 mm', async () => {
    renderApp(routes.practiceSheets(coinCardHolderProject.slug));
    expect(
      await screen.findByRole('checkbox', { name: /^Cvičný proužek pro lekci 4Proužek 114,35/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /^Cvičný proužek pro lekci 4\s–\skůže 1,5\smm/ }),
    ).not.toBeChecked();
  });

  it('lekce 4 odkazuje z cvičného proužku na cvičné listy', async () => {
    renderApp(routes.lesson(coinCardHolderProject.slug, '04-fold-and-stitch-scrap'));
    expect(
      await screen.findByRole('heading', { name: /^Vyřízněte\scvičný proužek/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vytisknout cvičnou šablonu 1:1/ })).toHaveAttribute(
      'href',
      routes.practiceSheets(coinCardHolderProject.slug),
    );
  });

  it('lekce 1 odkazuje z tisku listu na stránku listů střihu', async () => {
    renderApp(routes.lesson(coinCardHolderProject.slug, '01-paper-model'));
    expect(
      await screen.findByRole('heading', { name: /^Vytiskněte\sa\szkontrolujte list$/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Listy střihu 1:1 k tisku/ })).toHaveAttribute(
      'href',
      routes.template(coinCardHolderProject.slug),
    );
  });
});
