import { useId, useState } from 'react';
import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { type ProjectDefinition } from '@/content/schema';
import { ACTIVE_BELT_SUMMARY_KEYS, activeBeltOutcome, beltFact } from '@/features/belt/active-belt';
import { useSavedBelts } from '@/features/belt/use-saved-belts';
import { beltConfigLabel } from '@/lib/patterns/belt-config';
import { typo } from '@/lib/utils/format';

/**
 * „Aktivní pásek“ nahoře v každé lekci pásku: název, sestava, obvod a hlavní čísla z výpočtu.
 * S více uloženými pásky jde aktivní vybrat; „Změnit“ vede na „Váš pásek“, jediné místo, kde
 * se parametry zadávají.
 */
export function ActiveBeltCard({
  project,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
}) {
  const id = useId();
  const { active, belts, newerLegacy, isPending, isSaving, setActive } = useSavedBelts(project);
  const [error, setError] = useState(false);
  if (isPending) return null;

  if (!active) {
    return (
      <Card
        role="region"
        tone="dashed"
        className="flex flex-col gap-2"
        aria-labelledby={`${id}-title`}
      >
        <Kicker id={`${id}-title`}>Aktivní pásek</Kicker>
        <p className="text-body">
          {typo(
            'Pásek zatím není zadaný. Čísla v lekci (délka, poutko, šrouby, dírky) spočítá „Váš pásek“.',
          )}
        </p>
        <Button asChild className="self-start">
          <Link
            to={routes.beltConfig(project.slug)}
            className="text-white no-underline hover:text-white"
          >
            Zadat Váš pásek <span aria-hidden>→</span>
          </Link>
        </Button>
      </Card>
    );
  }

  const outcome = activeBeltOutcome(active);
  const result = outcome?.ok ? outcome.result : null;
  const choose = async (fieldId: string) => {
    setError(false);
    try {
      await setActive(fieldId);
    } catch {
      setError(true);
    }
  };

  return (
    <Card role="region" className="flex flex-col gap-3" aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <Kicker id={`${id}-title`}>Aktivní pásek</Kicker>
          <p className="font-serif text-h2 font-medium">{active.name}</p>
          <p className="text-meta text-ink-2">{typo(beltConfigLabel(active.input))}</p>
        </div>
        <Button asChild variant="secondary">
          <Link to={routes.beltConfig(project.slug)} className="no-underline">
            Změnit <span aria-hidden>→</span>
          </Link>
        </Button>
      </div>
      {belts.length > 1 && active.fieldId ? (
        <div>
          <label htmlFor={`${id}-pick`} className="mb-1.5 block text-meta font-medium text-ink-2">
            Pracuji na pásku
          </label>
          <select
            id={`${id}-pick`}
            value={active.fieldId}
            disabled={isSaving}
            onChange={(e) => void choose(e.target.value)}
            className="min-h-touch w-full max-w-sm rounded-md border border-line bg-paper px-3 text-body text-leather focus-visible:outline-2 focus-visible:outline-cognac"
          >
            {belts.map((b) => (
              <option key={b.fieldId} value={b.fieldId}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {active.source === 'notebook' ? (
        <p role="note" className="text-meta text-cognac-deep">
          {typo('Čísla ze starých zápisů lekce 1, zatím neuložená. Uložte je ve „Váš pásek“.')}
        </p>
      ) : null}
      {newerLegacy ? (
        <p role="note" className="text-meta text-cognac-deep">
          {typo(
            `V zápisníku lekce 1 jsou novější hodnoty (${newerLegacy.filled.join(', ')}). Ve „Váš pásek“ je zkontrolujte a pásek uložte.`,
          )}
        </p>
      ) : null}
      {outcome && !outcome.ok ? (
        <div role="alert" className="text-body text-cognac-deep">
          <p className="font-medium">Pásek nejde spočítat:</p>
          <ul className="list-disc pl-5">
            {outcome.problems.map((p) => (
              <li key={p}>{typo(p)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <dl className="grid gap-x-4 gap-y-1 text-body sm:grid-cols-[auto_1fr]">
          {ACTIVE_BELT_SUMMARY_KEYS.map((key) => {
            const fact = beltFact(key, active, result);
            return (
              <div key={key} className="contents">
                <dt className="text-ink-2">{typo(fact.label)}</dt>
                <dd className="mb-1 font-medium sm:mb-0">
                  {fact.value === null ? 'zadejte obvod' : typo(fact.value)}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {error ? (
        <p role="alert" className="text-meta text-cognac-deep">
          Volba se neuložila. Zkuste to znovu.
        </p>
      ) : null}
    </Card>
  );
}
