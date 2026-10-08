import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { LESSON_ANCHORS, PROJECT_OVERVIEW_ANCHOR, routes } from '@/app/routes';
import { GlossaryText } from '@/components/glossary/glossary-term';
import { Card } from '@/components/ui/card';
import { type ProjectDefinition } from '@/content/schema';
import {
  type NumberedPoint,
  type OverviewProject,
  type NumberedSection,
  formatNumberRanges,
  numberOverview,
  overviewAroundLesson,
  overviewPrints,
  pointNumbersForLesson,
  printTotals,
} from '@/features/overview/project-overview';
import { cn } from '@/lib/utils/cn';
import { initiallyOpenOnWide } from '@/lib/utils/disclosure';
import { typo } from '@/lib/utils/format';

function pointHref(project: ProjectDefinition, p: NumberedPoint): string {
  return routes.lesson(
    project.slug,
    p.point.lessonSlug,
    p.stepNumber === undefined ? undefined : LESSON_ANCHORS.step(p.stepNumber),
  );
}

function Summary({ kicker, title }: { kicker: string; title: string }) {
  return (
    <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
      <span className="flex flex-col">
        <span className="kicker">{kicker}</span>
        <span className="font-serif text-h2 font-medium">{title}</span>
      </span>
      <span
        aria-hidden
        className="text-[20px] text-ink-2 transition-transform group-open:rotate-180"
      >
        ▾
      </span>
    </summary>
  );
}

/** Výtisky z „Vytisknout“ lekcí a součet po listech. */
function OverviewPrints({ project, lessons }: { project: ProjectDefinition; lessons: string[] }) {
  const groups = overviewPrints(project, lessons);
  const totals = printTotals(groups);
  return (
    <div className="mt-2 flex flex-col gap-2 rounded-md border border-line bg-canvas px-3 py-2">
      {groups.map((g) => (
        <div key={g.lessonSlug}>
          <p className="text-meta font-semibold">Lekce {g.lessonOrder}</p>
          <ul className="flex flex-col gap-1 text-meta text-ink-2">
            {g.rows.map((r, i) => (
              <li key={`${r.sheetId}-${i}`}>
                <span className="font-semibold whitespace-nowrap text-leather">
                  {r.sheetLabel} · {r.copies}×
                </span>{' '}
                {typo(r.purpose)}
                {r.paper ? ` (${typo(r.paper)})` : ''}
                {r.condition ? ` – ${typo(r.condition)}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="border-t border-dashed border-line pt-2 text-meta">
        <span className="font-semibold">Celkem: </span>
        {totals.map((t) => `${t.sheetLabel} ${t.copies}×`).join(', ')}
      </p>
    </div>
  );
}

function PointItem({
  project,
  item,
  compact,
  highlighted,
}: {
  project: ProjectDefinition;
  item: NumberedPoint;
  compact: boolean;
  highlighted: boolean;
}) {
  const entries = project.glossary?.entries;
  const { point } = item;
  const showDetails = !compact || highlighted;
  return (
    <li
      value={item.number}
      aria-current={highlighted ? 'step' : undefined}
      className={cn(
        'flex gap-3 rounded-md py-2',
        compact && 'px-2',
        highlighted && 'bg-cognac-tint',
        compact && !highlighted && 'text-ink-2',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-leather font-serif text-[15px] font-medium',
          highlighted && 'border-cognac-deep bg-cognac-deep text-white',
        )}
      >
        {item.number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn('text-body', highlighted && 'font-medium')}>
          <GlossaryText text={typo(point.text)} entries={entries} />
        </p>
        {showDetails && point.later ? (
          <p className="text-meta text-ink-2">
            <span className="font-semibold text-cognac-deep">Až později: </span>
            <GlossaryText text={typo(point.later)} entries={entries} />
          </p>
        ) : null}
        {!compact && point.printsFrom ? (
          <OverviewPrints project={project} lessons={point.printsFrom} />
        ) : null}
        <Link
          to={pointHref(project, item)}
          className="inline-flex min-h-touch items-center self-start text-meta"
        >
          Lekce {item.lessonOrder} <span aria-hidden>&nbsp;→</span>
        </Link>
      </div>
    </li>
  );
}

function OverviewSections({
  project,
  sections,
  highlightLesson,
}: {
  project: ProjectDefinition;
  sections: NumberedSection[];
  highlightLesson?: string;
}) {
  const compact = highlightLesson !== undefined;
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="border-b border-line pb-1 text-[17px] font-semibold">{section.title}</h3>
          {section.note ? <p className="mt-1 text-meta text-ink-2">{typo(section.note)}</p> : null}
          <ol className="mt-1 flex flex-col">
            {section.points.map((item) => (
              <PointItem
                key={item.point.id}
                project={project}
                item={item}
                compact={compact}
                highlighted={item.point.lessonSlug === highlightLesson}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/**
 * Karta „Postup v kostce“ na stránce projektu: číslované body celé stavby s odkazy na kroky
 * lekcí, u bodu tisku výtisky z lekcí. Na telefonu sbalená, na širší obrazovce rozbalená.
 */
export function ProjectOverviewCard({
  project,
  className,
}: {
  project: OverviewProject;
  className?: string;
}) {
  const [open, setOpen] = useState(() => initiallyOpenOnWide(PROJECT_OVERVIEW_ANCHOR));
  const sections = useMemo(() => numberOverview(project.overview, project), [project]);
  const count = sections.reduce((n, s) => n + s.points.length, 0);
  return (
    <Card id={PROJECT_OVERVIEW_ANCHOR} className={cn('scroll-mt-24', className)}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group">
        <Summary kicker={`Postup v kostce · ${count} bodů`} title="Co dělat, po pořadí" />
        <div className="mt-3 flex flex-col gap-4">
          {project.overview.intro ? (
            <p className="text-body text-ink-2">{typo(project.overview.intro)}</p>
          ) : null}
          <OverviewSections project={project} sections={sections} />
        </div>
      </details>
    </Card>
  );
}

/**
 * „Kde jste v postupu“ nahoře v lekci: které body přehledu lekce pokrývá. Rozbalením se ukážou
 * zvýrazněné body této lekce s bodem před a za nimi a odkaz na celý přehled.
 */
export function LessonOverviewBox({
  project,
  lessonSlug,
}: {
  project: OverviewProject;
  lessonSlug: string;
}) {
  const sections = useMemo(() => numberOverview(project.overview, project), [project]);
  const numbers = pointNumbersForLesson(sections, lessonSlug);
  const count = sections.reduce((n, s) => n + s.points.length, 0);
  if (numbers.length === 0) return null;
  const range = formatNumberRanges(numbers);
  return (
    <Card padding="none" className="px-4 py-1">
      <details className="group">
        <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span className="text-body">
            <span className="mr-2 kicker">Kde jste v postupu</span>
            <span className="whitespace-nowrap">
              {numbers.length === 1 ? 'bod' : 'body'} <strong>{range}</strong> z {count}
            </span>
          </span>
          <span
            aria-hidden
            className="text-[18px] text-ink-2 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="flex flex-col gap-3 pb-3">
          <OverviewSections
            project={project}
            sections={overviewAroundLesson(sections, lessonSlug)}
            highlightLesson={lessonSlug}
          />
          <Link to={routes.projectOverview(project.slug)} className="text-meta">
            Celý postup v kostce na stránce projektu
          </Link>
        </div>
      </details>
    </Card>
  );
}
