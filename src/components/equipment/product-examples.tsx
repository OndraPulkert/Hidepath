import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { type ProductExample } from '@/content/schema';
import { formatCzk, formatDateCs, typo } from '@/lib/utils/format';

const availabilityLabel: Record<ProductExample['availability'], string | null> = {
  in_stock: null,
  unavailable: 'při ověření vyprodáno',
  preorder: 'na objednávku',
};

/**
 * „Doporučené výrobky“ z prototypu – jen ověřené odkazy s datem kontroly.
 * Odkazy vedou do obchodů třetích stran; aplikace nic neprodává.
 */
export function ProductExamples({ examples }: { examples: readonly ProductExample[] }) {
  if (examples.length === 0) return null;
  const checked = [...new Set(examples.map((e) => e.checkedAt))].sort().at(-1);
  // Dostupné příklady první, aby začátečník neklikal do vyprodaného.
  const rank = { in_stock: 0, preorder: 1, unavailable: 2 } as const;
  const sorted = [...examples].sort((a, b) => rank[a.availability] - rank[b.availability]);

  return (
    <section aria-labelledby="priklady">
      <h2 id="priklady" className="mb-2 text-h2">
        Ověřené příklady výrobků
      </h2>
      <ul className="flex flex-col gap-3">
        {sorted.map((e) => {
          const label = availabilityLabel[e.availability];
          return (
            <li key={e.url}>
              <Card className="flex flex-col gap-2 transition-colors hover:border-line-strong">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-leather no-underline hover:text-leather"
                >
                  <span className="text-body font-semibold">{typo(e.title)}</span>
                  <span className="text-body font-medium text-leather">
                    {formatCzk(e.priceCents)}
                    {e.priceNote ? (
                      <span className="ml-1 text-meta font-normal text-ink-2">{e.priceNote}</span>
                    ) : null}
                    <span aria-hidden> ↗</span>
                    <span className="sr-only"> (otevře se v novém okně, obchod třetí strany)</span>
                  </span>
                </a>
                <p className="flex flex-wrap items-center gap-2 text-meta text-ink-2">
                  <span>{e.shop}</span>
                  {label ? <Tag tone="optional">{label}</Tag> : null}
                </p>
                {e.note ? <p className="text-body text-ink-2">{typo(e.note)}</p> : null}
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-meta text-ink-2">
        Odkazy vedou do obchodů třetích stran, Hidepath z nákupu nic nemá. Ceny ověřeny{' '}
        {checked ? formatDateCs(checked) : ''} a mohou se změnit.
      </p>
    </section>
  );
}
