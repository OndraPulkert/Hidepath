import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { setActiveProjectPreference } from '@/features/projects/active-project-preference';
import { enrollment } from '@/test/factories';
import { createTestRepositories, renderApp } from '@/test/render';

/** Přepínač projektů na přehledu (ADR 002, dodatek 2026-09-28). */
describe('více projektů', () => {
  afterEach(() => setActiveProjectPreference(null));

  it('druhý projekt se z přehledu založí a stane se aktivním', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment(cardHolderProject.slug),
      id: crypto.randomUUID(),
    });
    renderApp('/dashboard', { repositories });

    expect(await screen.findByText(/Projekt 01 · Pouzdro na karty$/)).toBeInTheDocument();
    await user.click(
      await screen.findByRole('button', { name: `Začít projekt ${coinCardHolderProject.title}` }),
    );

    await waitFor(async () => {
      const list = await repositories.enrollments.list();
      expect(list.map((e) => e.projectSlug).sort()).toEqual(
        [cardHolderProject.slug, coinCardHolderProject.slug].sort(),
      );
    });
    expect(
      await screen.findByText(`Projekt 02 · ${coinCardHolderProject.title}`),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projekt a lekce' })).toHaveAttribute(
      'href',
      `/projects/${coinCardHolderProject.slug}`,
    );
  });

  it('přepnutí vyhraje nad novějším zápisem a vydrží nové načtení aplikace', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    // Novější zápis má druhý projekt – bez volby by byl aktivní on.
    await repositories.enrollments.upsert({
      ...enrollment(cardHolderProject.slug),
      id: crypto.randomUUID(),
      updatedAt: '2026-09-01T10:00:00.000Z',
    });
    await repositories.enrollments.upsert({
      ...enrollment(coinCardHolderProject.slug),
      id: crypto.randomUUID(),
      updatedAt: '2026-09-20T10:00:00.000Z',
    });
    const first = renderApp('/dashboard', { repositories });
    expect(
      await screen.findByText(`Projekt 02 · ${coinCardHolderProject.title}`),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: `Přepnout na projekt ${cardHolderProject.title}` }),
    );
    expect(await screen.findByText(/Projekt 01 · Pouzdro na karty$/)).toBeInTheDocument();

    first.unmount();
    renderApp('/dashboard', { repositories });
    expect(await screen.findByText(/Projekt 01 · Pouzdro na karty$/)).toBeInTheDocument();
  });

  it('jen se zápisem do druhého projektu vede kořen na přehled toho projektu', async () => {
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment(coinCardHolderProject.slug),
      id: crypto.randomUUID(),
    });
    const { router } = renderApp('/', { repositories });
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
    expect(
      await screen.findByText(`Projekt 02 · ${coinCardHolderProject.title}`),
    ).toBeInTheDocument();
  });

  it('tisková stránka druhého projektu nabízí listy střihu, výchozí jsou zaškrtnuté', async () => {
    renderApp(`/projects/${coinCardHolderProject.slug}/template`);
    await screen.findByRole('heading', { level: 1, name: /Listy střihu 1:1/ });
    const byId = new Map(
      screen.getAllByRole('checkbox').map((c) => [c.id, (c as HTMLInputElement).checked]),
    );
    for (const sheet of coinCardHolderProject.patternSheets!.sheets) {
      expect(byId.get(`sheet-${sheet.id}`), sheet.id).toBe(!sheet.variant);
    }
    expect(screen.getAllByRole('img', { name: /^List střihu:/ })).toHaveLength(
      coinCardHolderProject.patternSheets!.sheets.filter((s) => !s.variant).length,
    );
  });
  it('třetí projekt (peněženka Víčko) je v přepínači a tiskne 4 listy výchozího střihu', async () => {
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment(cardHolderProject.slug),
      id: crypto.randomUUID(),
    });
    renderApp('/dashboard', { repositories });
    expect(
      await screen.findByRole('button', { name: `Začít projekt ${lidWalletProject.title}` }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Projekt 03 ·/)).toBeInTheDocument();
  });

  it('tisková stránka peněženky Víčko nabízí všechny 4 listy zaškrtnuté', async () => {
    renderApp(`/projects/${lidWalletProject.slug}/template`);
    await screen.findByRole('heading', { level: 1, name: /Listy střihu 1:1/ });
    // Zaškrtávátka listů (formulář „Listy pro vaši kůži“ má vlastní zaškrtávátka záloh).
    const boxes = screen.getAllByRole('checkbox').filter((c) => c.id.startsWith('sheet-'));
    expect(boxes.map((c) => c.id).sort()).toEqual(
      lidWalletProject.patternSheets!.sheets.map((s) => `sheet-${s.id}`).sort(),
    );
    expect(boxes.every((c) => (c as HTMLInputElement).checked)).toBe(true);
    expect(screen.getAllByRole('img', { name: /^List střihu:/ })).toHaveLength(4);
  });
});
