import { act, screen, waitFor, within } from '@testing-library/react';

import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { setActiveProjectPreference } from '@/features/projects/active-project-preference';
import { resolveShoppingPlan } from '@/features/shopping/plan';
import { formatCzk, typo } from '@/lib/utils/format';
import { enrollment, item } from '@/test/factories';
import { createTestRepositories, renderApp } from '@/test/render';

/** Porovnání bez ohledu na druh mezer (Intl dává nezlomitelné mezery). */
const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ');
const planText = () => norm(planCard().textContent);

const planCard = () =>
  screen
    .getByRole('heading', { level: 2, name: /^Sestava:/ })
    .closest<HTMLElement>('[aria-labelledby="co-koupit"]')!;

/** Nákupní seznam ukazuje „Co koupit“ aktivního projektu a při přepnutí projektu ho vymění. */
describe('nákupní seznam – přepínání projektů 01 a 02', () => {
  afterEach(() => setActiveProjectPreference(null));

  async function setup() {
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment(cardHolderProject.slug),
      id: crypto.randomUUID(),
    });
    await repositories.enrollments.upsert({
      ...enrollment(coinCardHolderProject.slug),
      id: crypto.randomUUID(),
    });
    // Společné nářadí (jeden košík): palička už je doma.
    await repositories.inventory.upsert({ ...item('mallet', 'owned'), id: crypto.randomUUID() });
    return repositories;
  }

  it('každý projekt má vlastní plán, součet i „zbývá koupit“; přepnutí je vymění', async () => {
    const repositories = await setup();
    const owned = { mallet: item('mallet', 'owned') };
    const plan01 = resolveShoppingPlan(cardHolderProject, equipmentCatalog, owned)!;
    const plan02 = resolveShoppingPlan(coinCardHolderProject, equipmentCatalog, owned)!;
    expect(plan01.totalCents).not.toBe(plan02.totalCents);

    setActiveProjectPreference(cardHolderProject.slug);
    renderApp('/shopping', { repositories });

    expect(
      await screen.findByRole('heading', { level: 2, name: typo(plan01.title) }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${cardHolderProject.title} · Vybavení`)).toBeInTheDocument();
    await waitFor(() =>
      expect(planText()).toContain(`zbývá koupit ${norm(formatCzk(plan01.remainingCents))}`),
    );
    expect(planText()).toContain(`${norm(formatCzk(plan01.totalCents))}celkem`);
    expect(within(planCard()).queryByText('Tentokrát nekupujete')).not.toBeInTheDocument();

    act(() => setActiveProjectPreference(coinCardHolderProject.slug));

    expect(
      await screen.findByRole('heading', { level: 2, name: typo(plan02.title) }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: typo(plan01.title) }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(`${coinCardHolderProject.title} · Vybavení`)).toBeInTheDocument();
    await waitFor(() =>
      expect(planText()).toContain(`zbývá koupit ${norm(formatCzk(plan02.remainingCents))}`),
    );
    expect(planText()).toContain(`${norm(formatCzk(plan02.totalCents))}celkem`);
    expect(within(planCard()).getByText('Tentokrát nekupujete')).toBeInTheDocument();
    // Odkazy na detail položky nesou slug aktivního projektu.
    expect(within(planCard()).getAllByRole('link', { name: /Palička/ })[0]).toHaveAttribute(
      'href',
      `/shopping/mallet?projekt=${coinCardHolderProject.slug}`,
    );

    act(() => setActiveProjectPreference(cardHolderProject.slug));
    expect(
      await screen.findByRole('heading', { level: 2, name: typo(plan01.title) }),
    ).toBeInTheDocument();
    expect(within(planCard()).getAllByRole('link', { name: /Palička/ })[0]).toHaveAttribute(
      'href',
      `/shopping/mallet?projekt=${cardHolderProject.slug}`,
    );
  });
});

/** Projekt 03: nejvíc obchodů a jako jediný ceny v haléřích. */
describe('nákupní seznam – peněženka Víčko (projekt 03)', () => {
  afterEach(() => setActiveProjectPreference(null));

  it('ukáže plán s 8 obchody, haléřové ceny a „zbývá koupit“; řádky se sečtou na součet obchodu', async () => {
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment(lidWalletProject.slug),
      id: crypto.randomUUID(),
    });
    await repositories.inventory.upsert({ ...item('mallet', 'owned'), id: crypto.randomUUID() });
    const plan = resolveShoppingPlan(lidWalletProject, equipmentCatalog, {
      mallet: item('mallet', 'owned'),
    })!;
    expect(plan.shops).toHaveLength(8);

    setActiveProjectPreference(lidWalletProject.slug);
    renderApp('/shopping', { repositories });

    expect(
      await screen.findByRole('heading', { level: 2, name: typo(plan.title) }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(planText()).toContain(`zbývá koupit ${norm(formatCzk(plan.remainingCents))}`),
    );
    expect(planText()).toContain(`${norm(formatCzk(plan.totalCents))}celkem v 8 obchodech`);
    // Haléřové ceny se nezaokrouhlují: 10 × 19,90 Kč = 199 Kč, 5 × 13,50 Kč = 67,50 Kč.
    expect(planText()).toContain('10 × 19,90 Kč');
    expect(planText()).toContain('5 × 13,50 Kč67,50 Kč');
    expect(planText()).toContain('1 × 4,80 Kč4,80 Kč');
    expect(within(planCard()).getByText(/Mějte doma nebo dokupte/)).toBeInTheDocument();

    // Zobrazené řádky každého obchodu se sečtou na zobrazený součet obchodu.
    const parse = (t: string) =>
      Number(
        norm(t)
          .replace(/[^\d,]/g, '')
          .replace(',', '.'),
      );
    const groups = within(planCard()).getAllByRole('group');
    expect(groups).toHaveLength(8);
    for (const group of groups) {
      const summary = group.querySelector('summary')!;
      const shopTotal = parse(summary.lastElementChild!.textContent ?? '');
      const lineTotals = [...group.querySelectorAll('li span.w-20')].map((el) =>
        parse(el.textContent ?? ''),
      );
      expect(Math.round(lineTotals.reduce((a, b) => a + b, 0) * 100)).toBe(
        Math.round(shopTotal * 100),
      );
    }
  });
});
