import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { type ProductExample } from '@/content/schema';
import { type ExampleGroup, groupProductExamples } from '@/features/equipment/group-examples';
import { formatCzk, formatCzkRange, formatDateCs, pluralizeCs, typo } from '@/lib/utils/format';

const availabilityLabel: Record<ProductExample['availability'], string | null> = {
  in_stock: null,
  unavailable: 'při ověření vyprodáno',
  preorder: 'na objednávku',
};

const availabilityCell: Record<ProductExample['availability'], string> = {
  in_stock: 'skladem',
  unavailable: 'vyprodáno',
  preorder: 'na objednávku',
};

/** Od kolika variant se tabulka sbalí, aby karta nezabrala několik obrazovek. */
const COLLAPSE_ROWS = 8;

function ExternalHint() {
  return (
    <>
      <span aria-hidden> ↗</span>
      <span className="sr-only"> (otevře se v novém okně, obchod třetí strany)</span>
    </>
  );
}

function SingleExample({ group }: { group: ExampleGroup }) {
  const row = group.rows[0];
  if (!row) return null;
  const e = row.example;
  const label = availabilityLabel[e.availability];
  return (
    <Card className="flex flex-col gap-2 transition-colors hover:border-line-strong">
      <a
        href={e.url}
        target="_blank"
        rel="noreferrer noopener"
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-leather no-underline hover:text-leather"
      >
        <span className="text-body font-semibold">{typo(group.title)}</span>
        <span className="text-body font-medium text-leather">
          {formatCzk(e.priceCents)}
          {e.priceNote ? (
            <span className="ml-1 text-meta font-normal text-ink-2">{typo(e.priceNote)}</span>
          ) : null}
          <ExternalHint />
        </span>
      </a>
      <p className="flex flex-wrap items-center gap-2 text-meta text-ink-2">
        <span>{e.shop}</span>
        {label ? <Tag tone="optional">{label}</Tag> : null}
      </p>
      {e.note ? <p className="text-body text-ink-2">{typo(e.note)}</p> : null}
    </Card>
  );
}

function VariantTable({ group, collapsed }: { group: ExampleGroup; collapsed: boolean }) {
  const perRowDate = group.checkedAt === null;
  return (
    // Úzký displej: tabulka se posouvá uvnitř karty, nikdy celá stránka.
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full text-left text-body">
        <caption className={collapsed ? 'sr-only' : 'mb-1 text-left kicker'}>
          Varianty a ceny
          <span className="sr-only">{typo(` – ${group.title}, ${group.shop}`)}</span>
        </caption>
        <thead>
          <tr className="text-meta text-ink-2">
            <th scope="col" className="py-1 pr-3 font-medium">
              Varianta
            </th>
            <th scope="col" className="py-1 pr-3 text-right font-medium">
              Cena
            </th>
            <th scope="col" className="py-1 font-medium">
              Dostupnost
            </th>
            {perRowDate ? (
              <th scope="col" className="py-1 pl-4 font-medium">
                Ověřeno
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {group.rows.map((r) => (
            <tr key={`${r.example.url} ${r.label}`} className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pr-3 font-medium whitespace-nowrap">
                {group.url === null ? (
                  <a
                    href={r.example.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-leather"
                  >
                    {typo(r.label)}
                    <ExternalHint />
                  </a>
                ) : (
                  typo(r.label)
                )}
              </th>
              <td className="py-1.5 pr-3 text-right whitespace-nowrap tabular-nums">
                {formatCzk(r.example.priceCents)}
                {r.priceNote ? (
                  <span className="block text-meta whitespace-normal text-ink-2">
                    {typo(r.priceNote)}
                  </span>
                ) : null}
              </td>
              <td
                className={
                  r.example.availability === 'in_stock'
                    ? 'py-1.5 whitespace-nowrap text-ink-2'
                    : 'py-1.5 font-medium whitespace-nowrap text-cognac-deep'
                }
              >
                {availabilityCell[r.example.availability]}
              </td>
              {perRowDate ? (
                <td className="py-1.5 pl-4 whitespace-nowrap text-ink-2">
                  {formatDateCs(r.example.checkedAt)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariantGroup({ group }: { group: ExampleGroup }) {
  const count = pluralizeCs(group.rows.length, ['varianta', 'varianty', 'variant']);
  const collapsed = group.rows.length > COLLAPSE_ROWS;
  const rowNotes = group.rows.filter((r) => r.note);
  const allSoldOut = group.availability === 'unavailable';
  const price = (
    <span className="text-body font-medium whitespace-nowrap text-leather">
      {formatCzkRange(group.minPriceCents, group.maxPriceCents)}
      {group.priceNote ? (
        <span className="ml-1 text-meta font-normal text-ink-2">{typo(group.priceNote)}</span>
      ) : null}
    </span>
  );
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {group.url ? (
          <a
            href={group.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-leather no-underline hover:text-leather"
          >
            <span className="text-body font-semibold">{typo(group.title)}</span>
            <span>
              {price}
              <ExternalHint />
            </span>
          </a>
        ) : (
          <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-body font-semibold">{typo(group.title)}</span>
            {price}
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-2">
          <span>{group.shop}</span>
          <span aria-hidden>·</span>
          <span>{count}</span>
          {group.checkedAt ? (
            <>
              <span aria-hidden>·</span>
              <span>ověřeno {formatDateCs(group.checkedAt)}</span>
            </>
          ) : null}
          {allSoldOut ? <Tag tone="optional">při ověření vyprodáno</Tag> : null}
        </p>
      </div>
      {group.note ? <p className="text-body text-ink-2">{typo(group.note)}</p> : null}
      {collapsed ? (
        <details className="rounded-control border border-line px-3 py-2 sm:px-4">
          <summary className="min-h-touch cursor-pointer content-center text-body font-medium">
            Varianty a ceny ({count})
          </summary>
          <div className="pb-2">
            <VariantTable group={group} collapsed />
          </div>
        </details>
      ) : (
        <VariantTable group={group} collapsed={false} />
      )}
      {rowNotes.length > 0 ? (
        <ul className="flex flex-col gap-1 text-body text-ink-2">
          {rowNotes.map((r) => (
            <li key={`${r.example.url} ${r.label}`}>
              <span className="font-medium text-leather">{typo(r.label)}:</span>{' '}
              {typo(r.note ?? '')}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

/**
 * „Doporučené výrobky“ z prototypu – jen ověřené odkazy s datem kontroly.
 * Varianty téhož výrobku (šířka, délka, zrnitost…) se slijí do jedné karty s tabulkou;
 * data zůstávají po variantách, protože na ně odkazují nákupní plány.
 * Odkazy vedou do obchodů třetích stran; aplikace nic neprodává.
 */
export function ProductExamples({ examples }: { examples: readonly ProductExample[] }) {
  if (examples.length === 0) return null;
  const checked = [...new Set(examples.map((e) => e.checkedAt))].sort().at(-1);
  // Skupiny s dostupnou variantou první, aby začátečník neklikal do vyprodaného.
  const groups = groupProductExamples(examples);

  return (
    <section aria-labelledby="priklady">
      <h2 id="priklady" className="mb-2 text-h2">
        Ověřené příklady výrobků
      </h2>
      <ul className="flex flex-col gap-3">
        {groups.map((g) => (
          <li key={g.key}>
            {g.rows.length === 1 ? <SingleExample group={g} /> : <VariantGroup group={g} />}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-meta text-ink-2">
        Odkazy vedou do obchodů třetích stran, Hidepath z nákupu nic nemá. Ceny ověřeny{' '}
        {checked ? formatDateCs(checked) : ''} a mohou se změnit.
      </p>
    </section>
  );
}
