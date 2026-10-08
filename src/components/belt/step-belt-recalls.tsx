import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { type BeltRecallKey, type ProjectDefinition } from '@/content/schema';
import { activeBeltOutcome, beltFact } from '@/features/belt/active-belt';
import { beltMarking, plateCheckFromRecords } from '@/features/belt/belt-marking';
import { useSavedBelts } from '@/features/belt/use-saved-belts';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { typo } from '@/lib/utils/format';

/**
 * Hodnoty aktivního pásku pod krokem (`step.beltRecalls`), např. „Šířka = přezka: 40 mm“.
 * Bez pásku odkáže na „Váš pásek“, kde se zadává. Jediný zdroj je aktivní pásek; čím se značí,
 * se odvodí z kontroly destičky (lekce 1) a tabulky.
 */
export function StepBeltRecalls({
  project,
  keys,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
  keys: readonly BeltRecallKey[];
}) {
  const { active, isPending } = useSavedBelts(project);
  const records = useLessonRecords(project.slug);
  if (isPending || records.isPending) return null;
  const outcome = activeBeltOutcome(active);
  const result = outcome?.ok ? outcome.result : null;
  const marking = beltMarking(plateCheckFromRecords(records.data ?? [], project.slug), result);
  const change = (
    <Link
      to={routes.beltConfig(project.slug)}
      className="inline-flex min-h-touch items-center text-leather underline hover:text-cognac"
    >
      {active ? 'změnit ve Váš pásek →' : 'zadejte ve Váš pásek →'}
    </Link>
  );
  if (!active) {
    return (
      <p className="rounded-md border border-line bg-parchment px-4 py-3 text-body text-ink-2">
        Pásek zatím není zadaný – {change}
      </p>
    );
  }
  return (
    <ul
      aria-label={`Z aktivního pásku: ${active.name}`}
      className="flex flex-col gap-1 rounded-md border border-line bg-parchment px-4 py-3 text-body"
    >
      {keys.map((key) => {
        const fact = beltFact(key, active, result, marking);
        return (
          <li key={key}>
            <span className="text-ink-2">{typo(fact.label)} (Váš pásek): </span>
            {fact.value === null ? (
              <span className="text-ink-2">
                {key === 'strapLength' || key === 'waist'
                  ? 'zadejte obvod'
                  : 'pásek nejde spočítat'}
              </span>
            ) : (
              <strong className="font-semibold text-leather">{typo(fact.value)}</strong>
            )}
          </li>
        );
      })}
      <li>{change}</li>
    </ul>
  );
}
