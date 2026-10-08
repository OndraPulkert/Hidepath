import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { type BudgetPriceOverride, type RemainingBudget } from '@/features/shopping/budget';
import { formatCzk, pluralizeCs, typo } from '@/lib/utils/format';

/**
 * Rozpad orientačního rozpočtu: nezbytné · doporučené · později (· objednáno · bez ceny).
 * Sdílí ho „Vybavení“ i přehled, aby části vždy dávaly dohromady velké číslo.
 */
export function budgetBreakdownText(
  budget: RemainingBudget,
  firstLabel: 'nezbytné' | 'Nezbytné' = 'nezbytné',
): string {
  return (
    `${firstLabel} ${formatCzk(budget.requiredCents)} · doporučené ${formatCzk(budget.recommendedCents)}` +
    (budget.laterCents > 0 ? ` · později ${formatCzk(budget.laterCents)}` : '') +
    (budget.orderedCents > 0 ? ` · z toho objednáno ${formatCzk(budget.orderedCents)}` : '') +
    (budget.unpricedCount > 0
      ? ` · bez ${pluralizeCs(budget.unpricedCount, ['položky', 'položek', 'položek'])} s neověřenou cenou`
      : '')
  );
}

/**
 * Pásek: položky, jejichž cena v rozpočtu je z plánu (Co koupit), ne odhad. Barva na hrany jen
 * u barveného pásu (jinak se nekupuje); balzám zůstává odhadem.
 */
export function beltPlanPricedItems(budgetPrices: Readonly<Record<string, BudgetPriceOverride>>) {
  const edgePaint = budgetPrices['edge-paint'];
  return typeof edgePaint === 'object'
    ? 'Pás, přezka, nýty, výsečník na dírky a barva na hrany'
    : 'Pás, přezka, nýty a výsečník na dírky';
}

/**
 * Vysvětlení, z čeho je orientační rozpočet (projekt s nákupním plánem). Na „Vybavení“ je Co
 * koupit nad souhrnem (`link` ne), na přehledu na něj vede odkaz.
 */
export function BudgetBasisNote({
  beltPlan,
  link = false,
  className,
}: {
  beltPlan?:
    | { basis: string; budgetPrices: Readonly<Record<string, BudgetPriceOverride>> }
    | null
    | undefined;
  link?: boolean;
  className?: string;
}) {
  const coKoupit = link ? (
    <Link to={routes.shopping} className="underline">
      Co koupit
    </Link>
  ) : (
    'Co koupit'
  );
  if (beltPlan) {
    return (
      <p className={className}>
        {typo(`${beltPlanPricedItems(beltPlan.budgetPrices)} ${beltPlan.basis}, ceny z `)}
        {coKoupit}. Ostatní položky odhadem ze středů cenových rozsahů.
      </p>
    );
  }
  return (
    <p className={className}>
      Odhad ze středů cenových rozsahů všech položek seznamu, včetně těch, které plán tentokrát
      vynechává. Kolik zaplatíte za doporučenou sestavu, ukazuje {coKoupit}
      {link ? '' : ' výše'}.
    </p>
  );
}
