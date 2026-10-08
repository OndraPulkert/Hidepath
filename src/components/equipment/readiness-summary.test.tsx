import { screen } from '@testing-library/react';

import { ReadinessSummary } from '@/components/equipment/readiness-summary';
import { equipmentCatalog } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { computeEquipmentReadiness } from '@/features/inventory/readiness';
import { computeRemainingBudget } from '@/features/shopping/budget';
import { formatCzk } from '@/lib/utils/format';
import { renderWithProviders } from '@/test/render';

describe('ReadinessSummary', () => {
  const readiness = computeEquipmentReadiness(coinCardHolderProject, {});
  const budget = computeRemainingBudget(coinCardHolderProject, equipmentCatalog, {});

  it('u projektu s nákupním plánem vysvětlí, že rozpočet je orientační a sestavu ukazuje Co koupit', async () => {
    renderWithProviders(<ReadinessSummary readiness={readiness} budget={budget} hasShoppingPlan />);
    expect(await screen.findByText('Orientační rozpočet')).toBeInTheDocument();
    expect(screen.getByText(/ukazuje Co koupit výše/)).toBeInTheDocument();
    expect(screen.queryByText('Očekávané náklady')).not.toBeInTheDocument();
  });

  it('bez plánu zůstává původní popisek bez odkazu na Co koupit', async () => {
    renderWithProviders(<ReadinessSummary readiness={readiness} budget={budget} />);
    expect(await screen.findByText('Očekávané náklady')).toBeInTheDocument();
    expect(screen.queryByText(/Co koupit/)).not.toBeInTheDocument();
  });

  it('rozpad rozpočtu ukáže i „později“, aby části daly dohromady celkovou částku', async () => {
    expect(budget.laterCents).toBeGreaterThan(0);
    renderWithProviders(<ReadinessSummary readiness={readiness} budget={budget} hasShoppingPlan />);
    const later = await screen.findByText(
      new RegExp(`později ${formatCzk(budget.laterCents).replace(/\s/g, ' ')}`),
    );
    expect(later).toBeInTheDocument();
    expect(budget.requiredCents + budget.recommendedCents + budget.laterCents).toBe(
      budget.totalCents,
    );
  });

  it('u barveného pásku řekne, že i barva na hrany je cenou z Co koupit', async () => {
    renderWithProviders(
      <ReadinessSummary
        readiness={readiness}
        budget={budget}
        hasShoppingPlan
        beltPlan={{
          basis: 'podle pásku: Černý',
          budgetPrices: { 'edge-paint': { cents: 26_900 } },
        }}
      />,
    );
    expect(
      await screen.findByText(
        /^Pás, přezka, nýty, výsečník na dírky a barva na hrany podle pásku: Černý, ceny z Co koupit\./,
      ),
    ).toBeInTheDocument();
  });

  it('u přírodního pásku barvu na hrany mezi cenami z plánu neuvádí', async () => {
    renderWithProviders(
      <ReadinessSummary
        readiness={readiness}
        budget={budget}
        hasShoppingPlan
        beltPlan={{ basis: 'podle pásku: Hnědý', budgetPrices: { 'edge-paint': 'not-needed' } }}
      />,
    );
    expect(
      await screen.findByText(/^Pás, přezka, nýty a výsečník na dírky podle pásku: Hnědý/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/barva na hrany/)).not.toBeInTheDocument();
  });
});
