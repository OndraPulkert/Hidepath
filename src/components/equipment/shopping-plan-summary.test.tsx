import { screen, within } from '@testing-library/react';

import { ShoppingPlanSummary } from '@/components/equipment/shopping-plan-summary';
import { equipmentCatalog } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { resolveShoppingPlan } from '@/features/shopping/plan';
import { formatCzk } from '@/lib/utils/format';
import { renderWithProviders } from '@/test/render';

describe('ShoppingPlanSummary', () => {
  it('ukáže celkovou cenu, obchody se součty, odkazy do obchodů a vynechané položky', async () => {
    const plan = resolveShoppingPlan(coinCardHolderProject, equipmentCatalog, {})!;
    renderWithProviders(
      <ShoppingPlanSummary plan={plan} projectSlug={coinCardHolderProject.slug} />,
    );
    const card = await screen.findByRole('heading', { name: /Sestava: mince 50 Kč/ });
    const root = card.closest('[data-slot="card"]') ?? document.body;
    expect(
      within(root as HTMLElement).getByText(formatCzk(plan.totalCents).replace(/\s/g, ' ')),
    ).toBeInTheDocument();
    for (const shop of plan.shops) {
      expect(within(root as HTMLElement).getByText(shop.shop)).toBeInTheDocument();
    }
    const links = within(root as HTMLElement)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(links).toContain(
      'https://www.raj-siti.cz/knoflik-stiskaci-anorak-s-aplikatorem-prym_z77891/',
    );
    expect(within(root as HTMLElement).getByText(/Tentokrát nekupujete/)).toBeInTheDocument();
    expect(within(root as HTMLElement).getByText(/vše bylo skladem/)).toBeInTheDocument();
  });
});
