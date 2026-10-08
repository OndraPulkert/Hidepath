import { type LidSheetRecallKey, type ProjectDefinition } from '@/content/schema';
import { lidSheetFact } from '@/features/lid-wallet/lid-sheets-state';
import { useLidSheets } from '@/features/lid-wallet/use-lid-sheets';
import { typo } from '@/lib/utils/format';

/**
 * Hodnoty z formuláře „Listy pro vaši kůži“ pod krokem (`step.lidSheetRecalls`), jen ke čtení,
 * i s mezí spočítanou z nich, např. „Vaše tloušťky: P1 1,1 · D1 0,9 · D2 0,8 · L1 0,9 mm →
 * přepážky max 0,80 mm ✗“. Měnit se dají jen ve formuláři (odkaz `lid-sheets` pod krokem).
 */
export function StepLidSheetRecalls({
  project,
  keys,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
  keys: readonly LidSheetRecallKey[];
}) {
  const state = useLidSheets(project);
  if (state.isPending) return null;
  return (
    <div className="flex flex-col gap-1 rounded-md border border-line bg-parchment px-4 py-3 text-body">
      <ul aria-label="Z formuláře Listy pro vaši kůži" className="flex flex-col gap-1">
        {keys.map((key) => {
          const fact = lidSheetFact(key, state);
          return (
            <li key={key}>
              <span className="text-ink-2">{typo(fact.label)}: </span>
              {fact.value === null ? (
                <span className="text-ink-2">zatím nezadané ve formuláři listů</span>
              ) : (
                <strong className="font-semibold text-leather">{typo(fact.value)}</strong>
              )}
              {fact.check ? (
                <span
                  className={
                    fact.check.ok === null
                      ? 'block text-ink-2'
                      : fact.check.ok
                        ? 'block text-forest'
                        : 'block text-cognac-deep'
                  }
                >
                  {fact.check.ok === null ? null : (
                    <>
                      <span aria-hidden>{fact.check.ok ? '✓ ' : '✗ '}</span>
                      <span className="sr-only">{fact.check.ok ? 'V pořádku: ' : 'Pozor: '}</span>
                    </>
                  )}
                  {typo(fact.check.text)}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {state.source === 'notebook' ? (
        <p role="note" className="text-meta text-cognac-deep">
          {typo(
            'Převzato ze starých zápisů lekcí, zatím neuložené. Ve formuláři listů je zkontrolujte a uložte.',
          )}
        </p>
      ) : null}
      {state.newerLegacy ? (
        <p role="note" className="text-meta text-cognac-deep">
          {typo(
            `V zápisníku jsou novější hodnoty (${state.newerLegacy.filled.join(', ')}). Ve formuláři listů je zkontrolujte a uložte.`,
          )}
        </p>
      ) : null}
    </div>
  );
}
