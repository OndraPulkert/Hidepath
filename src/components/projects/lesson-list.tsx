import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { equipmentCatalog } from '@/content/equipment';
import { type ProjectDefinition } from '@/content/schema';
import { type LessonView } from '@/features/progress/lesson-availability';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/** Seznam lekcí ve fázi: kruh 40 px, titul 17/600, stav textem, čas vpravo. */
export function LessonList({
  project,
  views,
}: {
  project: ProjectDefinition;
  views: readonly LessonView[];
}) {
  return (
    <ol className="divide-y divide-dashed divide-line">
      {views.map((view) => {
        const lesson = project.lessons.find((l) => l.slug === view.slug);
        if (!lesson) return null;
        const subtitle = describe(view, lesson.goal);
        return (
          <li key={view.slug}>
            <Link
              to={routes.lesson(project.slug, lesson.slug)}
              className="flex min-h-touch items-start gap-4 py-3.5 text-leather no-underline hover:text-leather"
              aria-current={view.isCurrent ? 'step' : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] font-serif text-[18px] font-medium',
                  view.status === 'completed' && 'border-forest bg-forest text-white',
                  view.isCurrent && 'border-cognac bg-cognac text-white',
                  view.status === 'locked' && 'border-dashed border-line-strong text-ink-2',
                  view.status === 'available' && !view.isCurrent && 'border-leather',
                )}
              >
                {view.status === 'completed' ? '✓' : lesson.order}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-step font-semibold',
                    view.status === 'locked' && 'text-ink-2',
                  )}
                >
                  {lesson.title}
                </span>
                <span className="block text-meta text-ink-2">{typo(subtitle)}</span>
              </span>
              <span className="shrink-0 pt-1 text-meta text-ink-2">
                {lesson.estimatedMinutes} min
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function describe(view: LessonView, goal: string): string {
  if (view.status === 'completed') return 'Hotovo';
  if (view.status === 'locked') {
    const m = view.blockers.missingEquipment[0];
    if (m) {
      const name = equipmentCatalog[m.equipmentSlug]?.name ?? m.equipmentSlug;
      return `Zamčeno · chybí: ${name} (${m.status === 'ordered' ? 'objednáno, na cestě' : 'k nákupu'})`;
    }
    const p = view.blockers.incompletePrerequisites.length;
    return p > 0 ? 'Zamčeno · nejdřív dokončete předchozí lekci' : 'Zamčeno';
  }
  if (view.status === 'in_progress')
    return `Rozpracováno · ${view.completedRequiredCheckpoints} z ${view.totalRequiredCheckpoints} bodů`;
  return goal;
}
