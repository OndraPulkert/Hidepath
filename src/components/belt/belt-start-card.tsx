import { useId } from 'react';
import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { type ProjectDefinition } from '@/content/schema';
import { useSavedBelts } from '@/features/belt/use-saved-belts';
import { beltConfigLabel } from '@/lib/patterns/belt-config';
import { typo } from '@/lib/utils/format';

/**
 * „Začněte tady: Váš pásek“ – vstup do projektu pásku (stránka projektu a přehled). Bez pásku
 * vyzve k zadání, s páskem ukáže aktivní pásek a vede na jeho úpravu.
 */
export function BeltStartCard({
  project,
  className,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
  className?: string;
}) {
  const id = useId();
  const { active, isPending } = useSavedBelts(project);
  const saved = active?.source === 'saved' ? active : null;
  return (
    <Card
      role="region"
      tone="cognac"
      className={className ? `flex flex-col gap-3 ${className}` : 'flex flex-col gap-3'}
      aria-labelledby={`${id}-title`}
    >
      <div>
        <Kicker>{saved ? 'Váš pásek' : 'První krok'}</Kicker>
        <h2 id={`${id}-title`} className="text-h2">
          {saved ? saved.name : 'Začněte tady: Váš pásek'}
        </h2>
      </div>
      {isPending ? null : saved ? (
        <p className="text-body text-ink-2">
          {typo(
            `${beltConfigLabel(saved.input)}. Podle něj počítají lekce, „Připravte si“ i nákup.`,
          )}
        </p>
      ) : (
        <p className="max-w-prose text-body text-ink-2">
          {typo(
            'Zadejte šířku podle přezky, tloušťku, obvod, konec a barvu. Aplikace spočítá, co koupit (délku pásu, přezku, šrouby, výsečníky), a nakreslí listy A4. Podle pásku pak počítají všechny lekce.',
          )}
        </p>
      )}
      <Button asChild className="self-start">
        <Link
          to={routes.beltConfig(project.slug)}
          className="text-white no-underline hover:text-white"
        >
          {saved ? 'Upravit Váš pásek' : 'Otevřít Váš pásek'} <span aria-hidden>→</span>
        </Link>
      </Button>
    </Card>
  );
}
