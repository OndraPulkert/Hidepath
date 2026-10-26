import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LESSON_ANCHORS, routes } from '@/app/routes';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Kicker } from '@/components/ui/kicker';
import { projects } from '@/content/projects';
import {
  buildGuideIndex,
  groupGuides,
  searchGuides,
  type GuideLessonUse,
  type GuidePage,
} from '@/features/guides/guide-index';
import { useActiveProject } from '@/features/projects/use-active-project';
import { pluralizeCs, typo } from '@/lib/utils/format';

/** Parametr dotazu s hledaným textem, aby hledání přežilo návrat z animace. */
export const GUIDES_QUERY_PARAM = 'q';

const guideIndex = buildGuideIndex(projects);

/**
 * Návody: všechny animace na jednom místě, s hledáním přes názvy animací, částí a kroků
 * i kroků lekcí, které na ně odkazují. Hledá se jen v obsahu aplikace, takže funguje offline.
 */
export function GuidesPage() {
  const activeProject = useActiveProject();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(GUIDES_QUERY_PARAM) ?? '';
  const groups = useMemo(
    () => groupGuides(guideIndex, projects, activeProject.slug),
    [activeProject.slug],
  );
  const matches = useMemo(() => searchGuides(guideIndex, query), [query]);
  const stepCount = guideIndex.reduce((n, p) => n + p.steps.length, 0);

  const setQuery = (value: string) =>
    setSearchParams(value ? { [GUIDES_QUERY_PARAM]: value } : {}, { replace: true });

  return (
    <>
      <header className="mb-6">
        <Kicker className="mb-1.5">Animace a názorné postupy</Kicker>
        <h1 className="text-[clamp(28px,3.5vw,40px)]">Návody</h1>
        <p className="mt-2 text-meta text-ink-2">
          {pluralizeCs(guideIndex.length, ['animace', 'animace', 'animací'])} ·{' '}
          {pluralizeCs(stepCount, ['krok', 'kroky', 'kroků'])}
        </p>
      </header>

      <form role="search" className="mb-8 max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
        <Label htmlFor="guides-search">Hledat v návodech</Label>
        <Input
          id="guides-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="např. kružítko, roh, druk, hrany"
          autoComplete="off"
          enterKeyHint="search"
        />
      </form>

      {query.trim() ? (
        <section aria-labelledby="guides-results">
          <h2 id="guides-results" className="sr-only">
            Výsledky hledání
          </h2>
          <p className="mb-4 text-meta text-ink-2" aria-live="polite">
            {matches.length === 0
              ? 'Nic nenalezeno. Zkuste jiné nebo kratší slovo.'
              : pluralizeCs(matches.length, ['animace', 'animace', 'animací'])}
          </p>
          <ul className="grid gap-3">
            {matches.map((m) => (
              <li key={m.page.key}>
                <Card className="grid gap-3">
                  <PageHeading page={m.page} />
                  {m.steps.length > 0 ? (
                    <ul className="grid gap-1.5">
                      {m.steps.map((s) => (
                        <li key={s.anchor}>
                          <a href={s.href} className="text-body">
                            <span className="font-semibold">{s.anchor}</span> {typo(s.title)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {m.pageMatch ? <SectionLinks page={m.page} /> : null}
                  {m.uses.length > 0 ? <MatchedLessonSteps uses={m.uses} /> : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="mt-8 first:mt-0" aria-labelledby={`g-${group.id}`}>
            <div className="mb-3 border-b border-line pb-2">
              <h2 id={`g-${group.id}`} className="text-h2">
                {group.title}
              </h2>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {group.pages.map((page) => (
                <li key={page.key}>
                  <Card className="grid h-full content-start gap-3">
                    <PageHeading page={page} />
                    <SectionLinks page={page} />
                    {page.uses.length > 0 ? <LessonUses uses={page.uses} /> : null}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function PageHeading({ page }: { page: GuidePage }) {
  return (
    <div>
      <h3 className="text-step font-semibold">
        {/* Obyčejný odkaz: animace jsou statické stránky mimo SPA (offline z precache). */}
        <a href={page.href}>▶ {typo(page.title)}</a>
      </h3>
      {page.steps.length > 0 ? (
        <p className="text-meta text-ink-2">
          {pluralizeCs(page.steps.length, ['krok', 'kroky', 'kroků'])}
        </p>
      ) : null}
    </div>
  );
}

function SectionLinks({ page }: { page: GuidePage }) {
  if (page.sections.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Části">
      {page.sections.map((s) => (
        <li key={s.anchor}>
          <a
            href={s.href}
            className="inline-flex min-h-touch items-center rounded-control border border-line px-3 text-[14px] text-leather no-underline hover:bg-parchment"
          >
            {typo(s.label)}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Lekce, které na animaci odkazují, po projektech: „Šikmina: lekce 6, 9“. */
function LessonUses({ uses }: { uses: readonly GuideLessonUse[] }) {
  const byProject = new Map<string, { title: string; lessons: Map<string, GuideLessonUse> }>();
  for (const u of uses) {
    const project = byProject.get(u.projectSlug) ?? { title: u.projectTitle, lessons: new Map() };
    if (!project.lessons.has(u.lessonSlug)) project.lessons.set(u.lessonSlug, u);
    byProject.set(u.projectSlug, project);
  }
  return (
    <ul className="grid gap-0.5 text-meta text-ink-2">
      {[...byProject.entries()].map(([slug, { title, lessons }]) => (
        <li key={slug}>
          {title}: lekce{' '}
          {[...lessons.values()].map((u, i) => (
            <span key={u.lessonSlug}>
              {i > 0 ? ', ' : null}
              <Link to={routes.lesson(u.projectSlug, u.lessonSlug)} title={u.lessonTitle}>
                {u.lessonOrder}
              </Link>
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

/** Nalezené kroky lekcí, které na animaci odkazují; odkaz vede přímo na krok. */
function MatchedLessonSteps({ uses }: { uses: readonly GuideLessonUse[] }) {
  return (
    <ul className="grid gap-1 text-meta text-ink-2">
      {uses.map((u) => (
        <li key={`${u.projectSlug}/${u.lessonSlug}/${u.stepNumber}`}>
          <Link to={routes.lesson(u.projectSlug, u.lessonSlug, LESSON_ANCHORS.step(u.stepNumber))}>
            {u.projectTitle}, lekce {u.lessonOrder}, krok {u.stepNumber}
          </Link>
          : {typo(u.stepTitle)}
        </li>
      ))}
    </ul>
  );
}
