import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { Tag } from '@/components/ui/tag';
import { type ResolvedShoppingPlan } from '@/features/shopping/plan';
import { formatCzk, formatDateCs, pluralizeCs, typo } from '@/lib/utils/format';

const availabilityLabel = {
  in_stock: 'skladem',
  preorder: 'na objednávku',
  unavailable: 'vyprodáno',
} as const;

/**
 * „Co koupit“: nákupní plán projektu po obchodech. Jen zobrazuje výsledek
 * `resolveShoppingPlan` – ceny, obchody a dostupnost jsou z ověřených příkladů v katalogu.
 */
export function ShoppingPlanSummary({
  plan,
  projectSlug,
  basis,
}: {
  plan: ResolvedShoppingPlan;
  projectSlug: string;
  /** Podle čeho je plán (pásek: „podle pásku: …“ nebo „podle plánu projektu (pásek 40 mm)“). */
  basis?: string | undefined;
}) {
  const hasOwned = plan.remainingCents !== plan.totalCents;
  const hasForeignPrice = plan.shops.some((g) => g.lines.some((l) => l.example.foreignPrice));
  return (
    <Card className="mb-6 flex flex-col gap-4" aria-labelledby="co-koupit">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <Kicker>Co koupit</Kicker>
          <h2 id="co-koupit" className="mt-1 text-h2">
            {typo(plan.title)}
          </h2>
          {basis ? <p className="mt-1 text-meta text-ink-2">{typo(`Nákup ${basis}`)}</p> : null}
        </div>
        <p className="text-right">
          <span className="font-serif text-stat font-medium">{formatCzk(plan.totalCents)}</span>
          <span className="block text-meta text-ink-2">
            celkem v {pluralizeCs(plan.shops.length, ['obchodě', 'obchodech', 'obchodech'])}, bez
            poštovného
            {hasOwned ? ` · zbývá koupit ${formatCzk(plan.remainingCents)}` : ''}
          </span>
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {plan.shops.map((group) => (
          <li key={group.shop}>
            <details className="rounded-control border border-line px-4 py-2">
              <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-x-4 text-body font-semibold">
                <span>
                  {group.shop}
                  <span className="ml-2 text-meta font-normal text-ink-2">
                    {pluralizeCs(group.lines.length, ['položka', 'položky', 'položek'])}
                  </span>
                </span>
                <span>{formatCzk(group.totalCents)}</span>
              </summary>
              <ul className="mt-2 flex flex-col divide-y divide-line">
                {group.lines.map((line) => (
                  <li
                    key={`${line.equipmentSlug} ${line.example.url} ${line.example.variant ?? ''}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <a
                        href={line.example.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-body font-medium text-leather"
                      >
                        {typo(line.example.title)}
                        {line.example.variant ? ` – ${line.example.variant}` : ''}
                        <span aria-hidden> ↗</span>
                        <span className="sr-only">
                          {' '}
                          (otevře se v novém okně, obchod třetí strany)
                        </span>
                      </a>
                      <span className="block text-meta text-ink-2">
                        <Link
                          to={routes.shoppingItem(line.equipmentSlug, projectSlug)}
                          className="text-ink-2"
                        >
                          {line.equipmentName}
                        </Link>
                        {line.purpose ? ` · ${typo(line.purpose)}` : ''}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-body">
                      {line.owned ? <Tag tone="ready">máte</Tag> : null}
                      {line.example.availability !== 'in_stock' ? (
                        <Tag tone="optional">{availabilityLabel[line.example.availability]}</Tag>
                      ) : null}
                      <span className="whitespace-nowrap">
                        {line.quantity} × {line.example.foreignPrice ? '≈ ' : ''}
                        {formatCzk(line.example.priceCents)}
                        {line.example.foreignPrice ? (
                          <span className="block text-meta text-ink-2">
                            {line.example.foreignPrice}, přepočet orientačně
                          </span>
                        ) : null}
                      </span>
                      <span className="w-20 text-right font-medium whitespace-nowrap">
                        {formatCzk(line.lineCents)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>

      {plan.skipped.length > 0 ? (
        <div>
          <p className="text-meta font-semibold text-ink-2">Tentokrát nekupujete</p>
          <ul className="mt-1 flex flex-col gap-1 text-meta text-ink-2">
            {plan.skipped.map((s) => (
              <li key={s.equipmentSlug}>
                <Link to={routes.shoppingItem(s.equipmentSlug, projectSlug)} className="text-ink-2">
                  {s.equipmentName}
                </Link>
                {' – '}
                {typo(s.reason)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {plan.alsoNeeded.length > 0 ? (
        <div>
          <p className="text-meta font-semibold text-ink-2">
            Mějte doma nebo dokupte (bez ověřené ceny, mimo součet)
          </p>
          <ul className="mt-1 list-disc pl-5 text-meta text-ink-2">
            {plan.alsoNeeded.map((thing) => (
              <li key={thing}>{typo(thing)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-meta text-ink-2">
        Ceny a dostupnost ověřeny{' '}
        {plan.checkedFrom === plan.checkedTo
          ? formatDateCs(plan.checkedTo)
          : `mezi ${formatDateCs(plan.checkedFrom)} a ${formatDateCs(plan.checkedTo)}`}
        {plan.notInStockCount > 0
          ? ` · ${pluralizeCs(plan.notInStockCount, ['položka nebyla', 'položky nebyly', 'položek nebylo'])} skladem`
          : ' · vše bylo skladem'}
        {hasForeignPrice ? ' · ceny v cizí měně jsou v Kč jen orientačním přepočtem' : ''}. Odkazy
        vedou do obchodů třetích stran, Hidepath z nákupu nic nemá.
      </p>
    </Card>
  );
}
