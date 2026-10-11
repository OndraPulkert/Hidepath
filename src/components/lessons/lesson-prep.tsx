import { type ReactNode, useId, useMemo, useRef } from 'react';
import { Link } from 'react-router';

import { PrintMountBadge } from '@/components/projects/print-mount-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tag } from '@/components/ui/tag';
import { equipmentCatalog } from '@/content/equipment';
import {
  type EquipmentStatus,
  type LessonDefinition,
  type ProjectDefinition,
} from '@/content/schema';
import { beltPrepPlan } from '@/features/belt/belt-shopping';
import { useDataContext } from '@/features/data/data-provider';
import { type InventoryState } from '@/features/inventory/types';
import { useUpdateInventoryItem } from '@/features/inventory/use-inventory';
import {
  buildLessonPrep,
  conditionLead,
  groupByCondition,
  type LessonPrepView,
  type PrepEquipmentItem,
  type PrepMaterialItem,
  type PrepPrintItem,
  type PrepRequirementItem,
} from '@/features/prep/lesson-prep';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { usePrepChecks, useSetPrepCheck } from '@/features/prep/use-prep-checks';
import { EMPTY_PROGRESS } from '@/features/progress/types';
import { useProgress } from '@/features/progress/use-progress';
import { cn } from '@/lib/utils/cn';
import { formatCzk, formatOrdinalCode, pluralizeCs, typo } from '@/lib/utils/format';

export interface LessonPrepProps {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  inventory: InventoryState;
}

/**
 * „Připravte si“ – kontrolní seznam před lekcí: Vytisknout / Nástroje / Materiál / Z předchozích
 * lekcí. „Mám“ u nástroje přepíná stav v inventáři (stejná data jako nákupní seznam), ostatní
 * položky se ukládají jako zaškrtnutí přípravy. Všechna pravidla jsou v `buildLessonPrep`.
 */
export function LessonPrep({ project, lesson, inventory }: LessonPrepProps) {
  const headingId = useId();
  const progressQuery = useProgress(project.slug);
  const checksQuery = usePrepChecks(project.slug);
  const recordsQuery = useLessonRecords(project.slug);
  const setCheck = useSetPrepCheck(project.slug);
  const updateInventory = useUpdateInventoryItem();
  const { migration } = useDataContext();
  // Stav nástroje před „Mám“ (např. Objednáno), aby ho zrušení „Mám“ vrátilo – ne vždy
  // „Chci koupit“, které by zahodilo objednávku.
  const statusBeforeOwned = useRef(new Map<string, EquipmentStatus>());

  const progress = progressQuery.data ?? EMPTY_PROGRESS;
  const checks = checksQuery.data;
  const records = recordsQuery.data;
  // Pásek: nákup u nástrojů podle aktivního pásku (šířka, přezka, dřík nýtu), jinak 40 mm.
  const planOverride = useMemo(
    () =>
      project.patternSheets?.browserGenerator === 'belt-config' && project.shoppingPlan
        ? beltPrepPlan(project.shoppingPlan, records ?? [], project.slug, equipmentCatalog)
        : null,
    [project, records],
  );
  const view = useMemo(
    () =>
      buildLessonPrep({
        project,
        lesson,
        catalog: equipmentCatalog,
        inventory,
        progress,
        checks: checks ?? [],
        planOverride,
      }),
    [project, lesson, inventory, progress, checks, planOverride],
  );
  const checksLoading = checksQuery.isLoading || migration.status === 'running';
  const { done, total } = view.summary;

  const toggleCheck = (itemKey: string, checked: boolean) =>
    setCheck.mutate({ lessonSlug: lesson.slug, itemKey, checked });

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={headingId} className="text-h2">
            Připravte si
          </h2>
          {total > 0 ? (
            <p className="text-body font-semibold" aria-live="polite">
              Připraveno {done}/{total}
            </p>
          ) : null}
        </div>
        {total > 0 ? (
          <ProgressBar value={done / total} size="sm" label={`Připraveno ${done} z ${total}`} />
        ) : null}
      </div>

      {view.prints.length > 0 ? (
        <PrintGroup
          view={view}
          disabled={checksLoading}
          onToggle={(key, checked) => toggleCheck(key, checked)}
        />
      ) : null}

      {view.equipment.length > 0 ? (
        <PrepGroup title="Nástroje" note={view.planBasis ? `Nákup ${view.planBasis}` : undefined}>
          {view.equipment.map((item) => (
            <EquipmentRow
              key={item.slug}
              item={item}
              disabled={migration.status === 'running'}
              onToggle={(checked) => {
                const before = inventory[item.slug]?.status;
                if (checked && before && before !== 'owned') {
                  statusBeforeOwned.current.set(item.slug, before);
                }
                updateInventory.mutate({
                  equipmentSlug: item.slug,
                  patch: {
                    status: checked
                      ? 'owned'
                      : (statusBeforeOwned.current.get(item.slug) ?? 'want_to_buy'),
                  },
                });
              }}
            />
          ))}
        </PrepGroup>
      ) : null}

      {view.materials.length > 0 ? (
        <PrepGroup title="Materiál">
          {view.materials.map((item) => (
            <MaterialRow
              key={item.key}
              item={item}
              disabled={checksLoading}
              onToggle={(checked) => toggleCheck(item.key, checked)}
            />
          ))}
        </PrepGroup>
      ) : null}

      {view.requires.length > 0 ? (
        <PrepGroup title="Z předchozích lekcí">
          {view.requires.map((item) => (
            <RequirementRow
              key={item.key}
              item={item}
              disabled={checksLoading}
              onToggle={(checked) => toggleCheck(item.key, checked)}
            />
          ))}
        </PrepGroup>
      ) : null}

      {setCheck.isError || updateInventory.isError ? (
        <p role="alert" className="text-body text-cognac-deep">
          Uložení se nepovedlo. Zkuste to prosím znovu.
        </p>
      ) : null}
    </section>
  );
}

function PrepGroup({
  title,
  note,
  children,
}: {
  title: string;
  /** Poznámka pod nadpisem (např. podle jakého pásku je nákup). */
  note?: string | undefined;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <h3 id={id} className="text-step font-semibold">
        {title}
      </h3>
      {note ? <p className="text-meta text-ink-2">{typo(note)}</p> : null}
      <ul aria-labelledby={id} className="divide-y divide-dashed divide-line">
        {children}
      </ul>
    </div>
  );
}

/**
 * „Vytisknout“: povinné výtisky se součtem „Celkem vytisknout“, pod nimi tlumeně výtisky jen
 * v případě potřeby (s podmínkou, mimo součet i mimo „Připraveno“).
 */
function PrintGroup({
  view,
  disabled,
  onToggle,
}: {
  view: LessonPrepView;
  disabled: boolean;
  onToggle: (key: string, checked: boolean) => void;
}) {
  const id = useId();
  const conditionalId = useId();
  const required = view.prints.filter((p) => !p.optional);
  const conditional = view.prints.filter((p) => p.optional);
  const row = (item: PrepPrintItem) => (
    <PrintRow
      key={item.key}
      item={item}
      disabled={disabled}
      onToggle={(checked) => onToggle(item.key, checked)}
    />
  );
  return (
    <div>
      <h3 id={id} className="text-step font-semibold">
        Vytisknout
      </h3>
      {view.cardboardNote ? (
        <p className="text-meta text-ink-2" data-cardboard-note="">
          {typo(view.cardboardNote)}
        </p>
      ) : null}
      {required.length > 0 ? (
        <ul aria-labelledby={id} className="divide-y divide-dashed divide-line">
          {required.map(row)}
        </ul>
      ) : null}
      {view.printTotals.length > 0 ? (
        <p className="border-t border-dashed border-line pt-2 text-meta" data-print-total="">
          <span className="font-semibold">Celkem vytisknout: </span>
          {view.printTotals.map((t) => typo(`${t.title} ${t.copies}×`)).join(', ')}
        </p>
      ) : null}
      {conditional.length > 0 ? (
        <div
          data-print-conditional=""
          className="mt-3 rounded-md border border-dashed border-line px-3 pt-2 text-ink-2"
        >
          <p id={conditionalId} className="text-meta font-semibold">
            Jen v případě potřeby (do součtu se nepočítá)
          </p>
          {groupByCondition(conditional).map((g) => (
            <div key={g.condition ?? ''} className="pt-2" data-print-condition="">
              {g.condition ? (
                <p className="text-meta font-semibold">{typo(conditionLead(g.condition))}</p>
              ) : null}
              <ul aria-labelledby={conditionalId} className="divide-y divide-dashed divide-line">
                {g.items.map(row)}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface RowProps<T> {
  item: T;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
}

function PrepRow({
  name,
  checked,
  disabled,
  onToggle,
  children,
}: {
  /** Název položky pro čtečky (doplní „Mám: …“). */
  name: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-body">{children}</div>
      <HaveToggle name={name} checked={checked} disabled={disabled} onToggle={onToggle} />
    </li>
  );
}

/** Velké tlačítko „Mám“ (přepínač). Stav je vždy i v textu (✓), nejen barvou. */
function HaveToggle({
  name,
  checked,
  disabled,
  onToggle,
}: {
  name: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onToggle(!checked)}
      className={cn(
        'inline-flex min-h-touch min-w-[5.5rem] shrink-0 items-center justify-center gap-1 rounded-control px-4 text-body font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac',
        'disabled:pointer-events-none disabled:opacity-45',
        checked
          ? 'bg-forest text-white hover:bg-forest-hover'
          : 'border border-line-strong text-leather hover:bg-leather/7',
      )}
    >
      {checked ? <span aria-hidden>✓</span> : null}
      Mám<span className="sr-only">: {name}</span>
    </button>
  );
}

const Meta = ({ children }: { children: ReactNode }) => (
  <span className="text-meta text-ink-2">{children}</span>
);

function PrintRow({ item, disabled, onToggle }: RowProps<PrepPrintItem>) {
  const details = [
    item.copies !== undefined ? pluralizeCs(item.copies, ['výtisk', 'výtisky', 'výtisků']) : null,
    item.paper ? typo(item.paper) : null,
  ].filter(Boolean);
  return (
    <PrepRow
      name={item.purpose ? `${item.title} – ${item.purpose}` : item.title}
      checked={item.checked}
      disabled={disabled}
      onToggle={onToggle}
    >
      <Link to={item.href} className="self-start text-leather hover:text-cognac">
        {typo(item.title)} <span aria-hidden>→</span>
      </Link>
      {details.length > 0 || item.purpose ? (
        <Meta>
          {item.purpose ? typo(item.purpose) : ''}
          {details.length > 0 && item.purpose ? ' · ' : ''}
          {details.join(' · ')}
        </Meta>
      ) : null}
      {item.mount ? <PrintMountBadge text={item.mount} /> : null}
      {item.fromSteps ? (
        <Meta>
          {item.fromSteps.length === 1 ? 'Krok' : 'Kroky'} {item.fromSteps.join(', ')}
        </Meta>
      ) : null}
    </PrepRow>
  );
}

function EquipmentRow({ item, disabled, onToggle }: RowProps<PrepEquipmentItem>) {
  return (
    <PrepRow name={item.name} checked={item.checked} disabled={disabled} onToggle={onToggle}>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          to={item.href}
          className={cn(
            'no-underline hover:text-cognac',
            item.priority === 'required' ? 'text-leather' : 'text-ink-2',
          )}
        >
          {typo(item.name)}
        </Link>
        {item.priority === 'recommended' ? <Tag tone="optional">Doporučené</Tag> : null}
        {item.status === 'ordered' ? <Tag tone="ordered">Objednáno · na cestě</Tag> : null}
      </span>
      {item.planLines.map((line) => (
        <Meta key={`${line.shop} ${line.title} ${line.variant ?? ''}`}>
          V plánu: {line.quantity} × {typo(line.title)}
          {line.variant ? ` – ${line.variant}` : ''} · {line.shop} · {formatCzk(line.lineCents)}
          {line.optional && line.purpose ? ` · ${typo(line.purpose)}` : ''}
        </Meta>
      ))}
      {item.skippedReason ? <Meta>{typo(item.skippedReason)}</Meta> : null}
    </PrepRow>
  );
}

function MaterialRow({ item, disabled, onToggle }: RowProps<PrepMaterialItem>) {
  return (
    <PrepRow name={item.text} checked={item.checked} disabled={disabled} onToggle={onToggle}>
      <span className="text-ink-2">{typo(item.text)}</span>
      {item.shoppingHref ? (
        <Link to={item.shoppingHref} className="self-start text-meta text-leather">
          Na nákupním seznamu <span aria-hidden>→</span>
        </Link>
      ) : null}
    </PrepRow>
  );
}

function RequirementRow({ item, disabled, onToggle }: RowProps<PrepRequirementItem>) {
  return (
    <PrepRow name={item.label} checked={item.checked} disabled={disabled} onToggle={onToggle}>
      <span>{typo(item.label)}</span>
      {item.note ? <Meta>{typo(item.note)}</Meta> : null}
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link to={item.fromLesson.href} className="text-meta text-leather">
          Lekce {formatOrdinalCode(item.fromLesson.order)}: {typo(item.fromLesson.title)}
        </Link>
        {item.fromLessonCompleted ? (
          <Tag tone="done">✓ Hotovo</Tag>
        ) : (
          <Tag tone="optional">Lekce ještě není hotová</Tag>
        )}
      </span>
    </PrepRow>
  );
}
