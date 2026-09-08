import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';
import { NoticeBox } from '@/components/ui/notice-box';
import { equipmentCatalog } from '@/content/equipment';
import { type ProjectDefinition } from '@/content/schema';
import { type LessonBlockers } from '@/features/progress/lesson-availability';

/** Proč je lekce zamčená a kam jít: chybějící položka → detail v nákupním seznamu, prerekvizita → lekce. */
export function LessonLockNotice({
  project,
  blockers,
}: {
  project: ProjectDefinition;
  blockers: LessonBlockers;
}) {
  const missing = blockers.missingEquipment;
  const prereqs = blockers.incompletePrerequisites
    .map((slug) => project.lessons.find((l) => l.slug === slug))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <NoticeBox kind="lock" title="Lekce je zamčená">
      {missing.length > 0 ? (
        <p>
          Čeká na:{' '}
          {missing.map((m, i) => (
            <span key={m.equipmentSlug}>
              {i > 0 ? ', ' : ''}
              <strong>{equipmentCatalog[m.equipmentSlug]?.name ?? m.equipmentSlug}</strong> (
              {m.status === 'ordered' ? 'objednáno' : 'chybí'})
            </span>
          ))}
          . Objednané položky se počítají jako připravené až po doručení, kdy je označíte „Mám“.
        </p>
      ) : null}
      {prereqs.length > 0 ? (
        <p className={missing.length > 0 ? 'mt-2' : ''}>
          Nejdřív dokončete {prereqs.map((l) => `lekci ${l.order}`).join(' a ')}.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {missing[0] ? (
          <Button variant="secondary" asChild>
            <Link to={routes.shoppingItem(missing[0].equipmentSlug)} className="no-underline">
              {missing.length > 1
                ? 'Nákupní seznam →'
                : `${equipmentCatalog[missing[0].equipmentSlug]?.name ?? 'Položka'} →`}
            </Link>
          </Button>
        ) : null}
        {prereqs[0] ? (
          <Button variant="secondary" asChild>
            <Link to={routes.lesson(project.slug, prereqs[0].slug)} className="no-underline">
              Otevřít lekci {prereqs[0].order} →
            </Link>
          </Button>
        ) : null}
      </div>
    </NoticeBox>
  );
}
