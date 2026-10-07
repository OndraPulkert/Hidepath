import { useMemo } from 'react';
import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { type StepExtrasProps } from '@/components/lessons/step-extras';
import { indexRecordFields, resolveRecall } from '@/features/notebook/findings';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { typo } from '@/lib/utils/format';

/**
 * Připomínky dříve zapsaných hodnot (`step.recalls`), např. „Výsečník, který vám sedl
 * v lekci 3: 2 mm“. Nezapsanou hodnotu ukáže jako „zatím nezapsáno“ s odkazem na lekci,
 * kde se zapisuje (u téže lekce jen číslo kroku).
 */
export function StepRecalls({ project, lesson, step }: StepExtrasProps) {
  const records = useLessonRecords(project.slug);
  const fields = useMemo(() => indexRecordFields(project), [project]);
  if (!step.recalls || records.isPending) return null;
  const entries = records.data ?? [];
  const resolved = step.recalls.map((recall) => resolveRecall(project, recall, entries, fields));

  return (
    <ul aria-label="Z vašeho zápisníku" className="flex flex-col gap-2">
      {resolved.map((r) => {
        if (r.status === 'unknown') return null;
        const source = r.location;
        const sameLesson = source.lesson.slug === lesson.slug;
        return (
          <li
            key={r.recall.fieldId}
            className="rounded-md border border-line bg-parchment px-4 py-3 text-body"
          >
            <span className="text-ink-2">{typo(r.recall.label)}: </span>
            {r.status === 'recorded' ? (
              <>
                <strong className="font-semibold text-leather">{typo(r.display)}</strong>
                {r.target === 'warn' ? <span className="text-cognac-deep"> (mimo cíl)</span> : null}
              </>
            ) : (
              <span className="text-ink-2">
                zatím nezapsáno –{' '}
                {sameLesson ? (
                  `krok ${source.stepIndex + 1} této lekce`
                ) : (
                  <Link
                    to={routes.lesson(project.slug, source.lesson.slug)}
                    className="inline-flex min-h-touch items-center text-leather underline hover:text-cognac"
                  >
                    lekce {source.lesson.order} →
                  </Link>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
