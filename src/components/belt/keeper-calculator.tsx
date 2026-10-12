import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { RecordFieldInput } from '@/components/notebook/step-record-fields';
import { KEEPER_WRAP_FIELD_ID } from '@/content/projects';
import { type LessonDefinition, type LessonStep, type ProjectDefinition } from '@/content/schema';
import { activeBeltOutcome } from '@/features/belt/active-belt';
import { useSavedBelts } from '@/features/belt/use-saved-belts';
import { latestEntriesByField } from '@/features/notebook/findings';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { formatDecimal } from '@/features/notebook/values';
import { keeperInputOf } from '@/lib/patterns/belt-config';
import {
  keeperBreakdown,
  keeperCalculation,
  keeperExampleText,
  keeperSkiveText,
  keeperStripText,
  measuredDiffText,
  measuredIgnoredText,
} from '@/lib/patterns/belt-keeper';
import { typo } from '@/lib/utils/format';

const mm = (v: number) => `${formatDecimal(v)} mm`;

/**
 * Kalkulačka délky poutka pod krokem lekce 4 (`step.beltCalculator: 'keeper'`). Šířku, tloušťku
 * a volbu poutka čte z aktivního pásku (jediný zdroj, mění se ve „Váš pásek“); jediné vlastní
 * pole je obvod 3 vrstev změřený proužkem (pole zápisníku kroku), který přepíše spočítaný obvod.
 * Výpočet je `keeperCalculation` (src/lib/patterns/belt-keeper.ts).
 */
export function KeeperCalculator({
  project,
  lesson,
  step,
}: {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  step: LessonStep;
}) {
  const { active, isPending } = useSavedBelts(project);
  const records = useLessonRecords(project.slug);
  if (isPending || records.isPending) return null;
  const field = step.records?.find((f) => f.id === KEEPER_WRAP_FIELD_ID);
  const entry = latestEntriesByField(records.data ?? [], project.slug).get(KEEPER_WRAP_FIELD_ID);
  const measured = typeof entry?.value === 'number' ? entry.value : null;
  const outcome = activeBeltOutcome(active);
  const input = outcome?.ok ? outcome.result.input : null;
  const calc = input
    ? keeperCalculation({ ...keeperInputOf(input), measuredWrapMm: measured })
    : null;
  const ignored = calc ? measuredIgnoredText(calc) : null;
  const diff = calc && outcome?.ok ? measuredDiffText(calc, outcome.result.keeper) : null;
  const change = (
    <Link
      to={routes.beltConfig(project.slug)}
      className="inline-flex min-h-touch items-center text-leather underline hover:text-cognac"
    >
      {active ? 'změnit ve Váš pásek →' : 'zadejte ve Váš pásek →'}
    </Link>
  );

  return (
    <section
      aria-label="Kalkulačka poutka"
      className="flex flex-col gap-3 rounded-md border border-line bg-paper p-4"
    >
      <p className="kicker">Kalkulačka poutka</p>
      {calc && input ? (
        <p className="text-body text-ink-2">
          {typo(
            `Z aktivního pásku: šířka ${mm(input.widthMm)}, tloušťka ${mm(input.thicknessMm)}, poutko ${
              calc.fromStrap
                ? `z téhož řemene (tloušťka poutka ${mm(calc.thicknessMm)})`
                : `z jiné kůže ${mm(calc.thicknessMm)}`
            }. `,
          )}
          {change}
        </p>
      ) : (
        <p className="text-body text-ink-2">
          {active ? 'Pásek nejde spočítat – ' : 'Pásek zatím není zadaný – '}
          {change}
        </p>
      )}
      {field ? (
        <RecordFieldInput project={project} lesson={lesson} field={field} entry={entry} />
      ) : null}
      {calc ? (
        <>
          <p className="text-body">
            <span className="text-ink-2">Proužek: </span>
            <strong className="font-semibold text-leather">{typo(keeperStripText(calc))}</strong>
            {calc.fromStrap ? (
              <span className="text-ink-2">
                {typo(` · kus pásu ${calc.pieceCm} cm (délka + 10 mm rezerva)`)}
              </span>
            ) : null}
          </p>
          {ignored || diff ? (
            <p role="note" className="text-body font-medium text-cognac-deep">
              {typo(ignored ?? diff ?? '')}
            </p>
          ) : null}
          <dl className="flex flex-col gap-1 text-body">
            {keeperBreakdown(calc).map((line) => (
              <div key={line.label} className="flex flex-wrap gap-x-2">
                <dt className="text-ink-2">{typo(line.label)}:</dt>
                <dd>{typo(line.value)}</dd>
              </div>
            ))}
          </dl>
          {calc.skive ? (
            <p className="text-meta text-ink-2">
              {typo(`Konce poutka z pásu: ${keeperSkiveText(calc.skive)}.`)}
            </p>
          ) : null}
        </>
      ) : null}
      <p className="text-meta text-ink-2">{typo(keeperExampleText())}</p>
    </section>
  );
}
