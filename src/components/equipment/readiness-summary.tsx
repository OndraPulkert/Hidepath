import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BudgetBasisNote, budgetBreakdownText } from '@/components/equipment/budget-note';
import { type BeltPlanView } from '@/features/belt/belt-shopping';
import { type EquipmentReadiness } from '@/features/inventory/readiness';
import { type RemainingBudget } from '@/features/shopping/budget';
import { formatCzk, formatPercent } from '@/lib/utils/format';

/**
 * Souhrn nad nákupním seznamem: připravenost nezbytného, počet, očekávané náklady, vysvětlení.
 * Má-li projekt nákupní plán („Co koupit“), je rozpočet jen orientační ze všech položek seznamu
 * (středy cenových rozsahů, i položky, které plán vynechává) – `hasShoppingPlan` to v UI řekne,
 * aby se dvě různé částky na stránce nepletly.
 */
export function ReadinessSummary({
  readiness,
  budget,
  hasShoppingPlan = false,
  beltPlan,
}: {
  readiness: EquipmentReadiness;
  budget: RemainingBudget;
  hasShoppingPlan?: boolean;
  /** Pásek: ceny položek sestavy jsou z tohoto plánu (Co koupit), ostatní odhadem. */
  beltPlan?: Pick<BeltPlanView, 'basis' | 'budgetPrices'> | null | undefined;
}) {
  const req = readiness.byPriority.required;
  const explanation = readiness.requiredReady
    ? 'Vše nezbytné máte. Lekce, které na vybavení čekaly, jsou odemčené.'
    : req.ordered > 0 && req.wantToBuy === 0
      ? 'Vše nezbytné je koupeno nebo objednáno. Objednané zatím nepočítáme jako připravené; lekce se odemknou po doručení.'
      : 'Nezbytné položky odemykají lekce. Doporučené usnadní práci, ale nikdy neblokují.';

  return (
    <Card className="grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-6">
      <div>
        <Kicker>Připravenost nezbytného vybavení</Kicker>
        <p className="mt-1 font-serif text-stat font-medium">{formatPercent(req.ownedRatio)}</p>
        <ProgressBar
          value={req.ownedRatio}
          secondary={req.orderedRatio}
          label="Připravenost nezbytného vybavení"
          size="sm"
          className="mt-2 max-w-[240px]"
        />
        <p className="mt-1.5 text-meta text-ink-2">tmavá část = mám · světlá = objednáno</p>
      </div>
      <div>
        <Kicker>Nezbytné</Kicker>
        <p className="mt-1 font-serif text-stat font-medium">
          {req.owned} z {req.total}
        </p>
        <p className="mt-1.5 text-meta text-ink-2">bez nich nelze začít</p>
      </div>
      <div>
        <Kicker>{hasShoppingPlan ? 'Orientační rozpočet' : 'Očekávané náklady'}</Kicker>
        <p className="mt-1 font-serif text-stat font-medium">{formatCzk(budget.totalCents)}</p>
        <p className="mt-1.5 text-meta text-ink-2">{budgetBreakdownText(budget)}</p>
        {hasShoppingPlan || beltPlan ? (
          <BudgetBasisNote beltPlan={beltPlan} className="mt-1.5 text-meta text-ink-2" />
        ) : null}
      </div>
      <p className="self-center text-body text-ink-2">{explanation}</p>
    </Card>
  );
}
