import { Link } from 'react-router';

import { PrintMountBadge } from '@/components/projects/print-mount-badge';
import {
  type ConditionalPrintGroup,
  type OverviewPrintRow,
  type PrintList,
} from '@/features/overview/project-overview';
import { conditionLead } from '@/features/prep/lesson-prep';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

function PrintRowText({ row, lessonOrder }: { row: OverviewPrintRow; lessonOrder?: number }) {
  return (
    <>
      <Link to={row.href} className="font-semibold whitespace-nowrap text-leather">
        {row.sheetLabel} · {row.copies}×
      </Link>{' '}
      {typo(row.purpose)}
      {row.paper ? ` (${typo(row.paper)})` : ''}
      {lessonOrder !== undefined ? ` · lekce ${lessonOrder}` : ''}
      {row.mount ? <PrintMountBadge text={row.mount} className="mt-1 flex w-fit" /> : null}
    </>
  );
}

function ConditionalGroup({ group }: { group: ConditionalPrintGroup }) {
  return (
    <div>
      <p className="font-semibold">{typo(conditionLead(group.condition))}</p>
      <ul className="flex flex-col gap-1 pl-3">
        {group.rows.map((r, i) => (
          <li key={`${r.sheetId}-${i}`}>
            <PrintRowText row={r} lessonOrder={r.lessonOrder} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Výpis tisku: povinné výtisky po lekcích se součtem „Celkem vytisknout“, pod nimi tlumeně výtisky
 * jen v případě potřeby (každý se svou podmínkou, mimo součet). Data skládá `splitPrintList`.
 */
export function PrintListView({ list, className }: { list: PrintList; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} data-print-list="">
      {list.required.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-md border border-line bg-canvas px-3 py-2">
          {list.required.map((g) => (
            <div key={g.lessonSlug}>
              <p className="text-meta font-semibold">Lekce {g.lessonOrder}</p>
              <ul className="flex flex-col gap-1 text-meta text-ink-2">
                {g.rows.map((r, i) => (
                  <li key={`${r.sheetId}-${i}`}>
                    <PrintRowText row={r} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="border-t border-dashed border-line pt-2 text-meta">
            <span className="font-semibold">Celkem vytisknout: </span>
            {list.totals.map((t) => `${t.sheetLabel} ${t.copies}×`).join(', ')}
          </p>
        </div>
      ) : null}
      {list.conditional.length > 0 ? (
        <div
          data-print-conditional=""
          className="flex flex-col gap-2 rounded-md border border-dashed border-line px-3 py-2 text-meta text-ink-2"
        >
          <p className="font-semibold">Jen v případě potřeby (do součtu se nepočítá)</p>
          {list.conditional.map((c) => (
            <ConditionalGroup key={c.condition} group={c} />
          ))}
        </div>
      ) : null}
      {list.cardboardNote ? (
        <p className="text-meta text-ink-2" data-cardboard-note="">
          {typo(list.cardboardNote)}
        </p>
      ) : null}
    </div>
  );
}
