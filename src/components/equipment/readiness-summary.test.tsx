import { screen } from '@testing-library/react';

import { ReadinessSummary } from '@/components/equipment/readiness-summary';
import { equipmentCatalog } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { computeEquipmentReadiness } from '@/features/inventory/readiness';
import { computeRemainingBudget } from '@/features/shopping/budget';
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
});
