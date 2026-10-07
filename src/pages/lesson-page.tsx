import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { LESSON_ANCHORS, routes } from '@/app/routes';
import { StickyActionBar } from '@/components/layout/sticky-action-bar';
import { CheckpointList } from '@/components/lessons/checkpoint-list';
import { LessonLockNotice } from '@/components/lessons/lesson-lock-notice';
import { LessonNotes } from '@/components/lessons/lesson-notes';
import { LessonPrep } from '@/components/lessons/lesson-prep';
import { MediaSlot } from '@/components/lessons/media-slot';
import { StepExtras } from '@/components/lessons/step-extras';
import { StepList } from '@/components/lessons/step-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NoticeBox } from '@/components/ui/notice-box';
import { Tag } from '@/components/ui/tag';
import { findProject } from '@/content/projects';
import { lessonBodiesFor } from '@/content/projects/lesson-bodies';
import { type ProjectDefinition } from '@/content/schema';
import { isCheckpointCompleted } from '@/features/progress/types';
import { useCompleteLesson, useToggleCheckpoint } from '@/features/progress/use-progress';
import { useProjectState } from '@/features/projects/use-project-state';
import { NotFoundPage } from '@/pages/not-found-page';
import { formatOrdinalCode, typo } from '@/lib/utils/format';

export function LessonPage() {
  const { projectSlug = '', lessonSlug = '' } = useParams<'projectSlug' | 'lessonSlug'>();
  const project = findProject(projectSlug);
  const lesson = project?.lessons.find((l) => l.slug === lessonSlug);
  if (!project || !lesson) return <NotFoundPage />;
  return <LessonView project={project} lessonSlug={lesson.slug} />;
}

/**
 * Detail lekce – úzký sloupec pro telefon na stole. Všechna pravidla (zámek, canComplete)
 * přicházejí z doménové vrstvy; komponenta je jen vykresluje.
 */
function LessonView({ project, lessonSlug }: { project: ProjectDefinition; lessonSlug: string }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const lesson = project.lessons.find((l) => l.slug === lessonSlug)!;
  const { journey, inventory, progress, isLoading } = useProjectState(project);

  // Kotva v adrese (#kontrolni-body, #krok-N): posunout na ni po vykreslení i po načtení dat
  // (příprava nahoře změní výšku). Efekt běží až po obnovení polohy (ScrollRestoration).
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    target?.scrollIntoView?.({ block: 'start' });
  }, [hash, isLoading]);
  const view = journey.lessonViews.find((v) => v.slug === lesson.slug)!;
  const toggle = useToggleCheckpoint(project.slug);
  const complete = useCompleteLesson(project.slug);

  const phase = project.phases.find((p) => p.slug === lesson.phaseSlug);
  const locked = view.status === 'locked';
  const ordered = [...project.lessons].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((l) => l.slug === lesson.slug);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  const nextView = next ? journey.lessonViews.find((v) => v.slug === next.slug) : undefined;
  const Body = lessonBodiesFor(project.slug)[lesson.slug];

  const finish = async () => {
    if (!view.canComplete) return;
    await complete.mutateAsync(lesson.slug);
    // Po dokončení dál jen tam, kde jde pokračovat: na další lekci, pokud není zamčená, jinak na přehled projektu.
    const nextUnlocked = nextView?.blockers.missingEquipment.length === 0;
    await navigate(
      next && nextUnlocked ? routes.lesson(project.slug, next.slug) : routes.project(project.slug),
    );
  };

  return (
    <article className="mx-auto -mb-24 flex max-w-[720px] flex-col gap-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
      <nav
        aria-label="Navigace lekce"
        className="flex items-center justify-between gap-3 text-body"
      >
        <Link to={routes.project(project.slug)} className="inline-flex min-h-touch items-center">
          ← Fáze projektu
        </Link>
        <span className="font-mono text-meta text-ink-2">
          Lekce {formatOrdinalCode(lesson.order)} / {formatOrdinalCode(project.lessons.length)}
        </span>
        <Link to={routes.dashboard} className="inline-flex min-h-touch items-center">
          Přehled
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <div>
          {view.status === 'completed' ? (
            <Tag tone="done">✓ Hotovo</Tag>
          ) : locked ? (
            <Tag tone="locked">Zamčeno</Tag>
          ) : view.isCurrent ? (
            <Tag tone="current">Aktuální krok</Tag>
          ) : (
            <Tag tone="ready">Dostupné</Tag>
          )}
        </div>
        <p className="text-body text-ink-2">
          <span aria-hidden>⏱ </span>asi {lesson.estimatedMinutes}&nbsp;min
          {phase ? ` · ${phase.name}` : ''}
        </p>
        <h1 className="text-[clamp(30px,8vw,44px)]">{typo(lesson.title)}</h1>
        <p className="text-lead">
          <strong>Cíl:</strong> <span className="text-ink-2">{typo(lesson.goal)}</span>
        </p>
        <Button asChild variant="secondary" className="self-start">
          <Link to={routes.lessonFocus(project.slug, lesson.slug)} className="no-underline">
            Dílenský režim <span aria-hidden>→</span>
          </Link>
        </Button>
      </header>

      {locked ? <LessonLockNotice project={project} blockers={view.blockers} /> : null}

      {lesson.media[0] ? <MediaSlot media={lesson.media[0]} aspect="photo" /> : null}

      <LessonPrep project={project} lesson={lesson} inventory={inventory} />

      {Body ? (
        <section className="max-w-prose text-body-lg [&_a]:text-leather [&_a]:underline [&_a:hover]:text-cognac [&_p+p]:mt-3">
          <Body />
        </section>
      ) : null}

      <section aria-labelledby="postup">
        <h2 id="postup" className="mb-4 border-b border-line pb-2 text-h2">
          Postup
        </h2>
        <StepList
          steps={lesson.steps}
          template={project.template}
          projectSlug={project.slug}
          renderStepExtras={(step) => (
            <StepExtras project={project} lesson={lesson} step={step} timerOrigin="lesson" />
          )}
        />
      </section>

      {lesson.commonMistakes.length > 0 ? (
        <NoticeBox kind="mistakes" title="Časté chyby">
          <ul>
            {lesson.commonMistakes.map((m) => (
              <li key={m}>{typo(m)}</li>
            ))}
          </ul>
        </NoticeBox>
      ) : null}

      {lesson.safety.length > 0 ? (
        <NoticeBox kind="safety" title="Bezpečnost">
          <ul>
            {lesson.safety.map((s) => (
              <li key={s}>{typo(s)}</li>
            ))}
          </ul>
        </NoticeBox>
      ) : null}

      <Card
        id={LESSON_ANCHORS.checkpoints}
        tone="forest"
        className="flex scroll-mt-24 flex-col gap-2"
      >
        <h2 className="text-h2">Kontrolní body</h2>
        <p id="dokoncit-napoveda" className="text-meta text-ink-2">
          {locked
            ? 'Body půjde odškrtávat, až bude lekce odemčená.'
            : view.status === 'completed'
              ? 'Lekce je hotová. Body zůstávají pro kontrolu.'
              : 'Lekci dokončíte, až budou splněné všechny povinné body.'}
        </p>
        <CheckpointList
          lessonSlug={lesson.slug}
          checkpoints={lesson.checkpoints}
          isCompleted={(slug) => isCheckpointCompleted(progress, lesson.slug, slug)}
          onToggle={(slug, completed) =>
            toggle.mutate({ lessonSlug: lesson.slug, checkpointSlug: slug, completed })
          }
          disabled={locked || view.status === 'completed' || isLoading}
        />
      </Card>

      <LessonNotes project={project} lesson={lesson} />

      <p className="text-meta text-ink-2">
        Text lekce je návrh a projde odbornou korekturou. Pokud něco nesedí s tím, co vidíte na
        stole, dejte nám vědět.
      </p>

      <StickyActionBar className="mt-4">
        <Button
          variant="secondary"
          size="lg"
          className="bg-paper"
          disabled={!prev}
          asChild={Boolean(prev)}
        >
          {prev ? (
            <Link to={routes.lesson(project.slug, prev.slug)} className="no-underline">
              Zpět
            </Link>
          ) : (
            'Zpět'
          )}
        </Button>
        <Button variant="secondary" size="lg" className="bg-paper" asChild>
          <Link to={routes.project(project.slug)} className="no-underline">
            Na později
          </Link>
        </Button>
        {view.status === 'completed' ? (
          <Button variant="forest" size="lg" asChild={Boolean(next)} disabled={!next}>
            {next ? (
              <Link
                to={routes.lesson(project.slug, next.slug)}
                className="text-white no-underline hover:text-white"
              >
                Další lekce →
              </Link>
            ) : (
              'Hotovo'
            )}
          </Button>
        ) : (
          <Button
            variant="forest"
            size="lg"
            disabled={!view.canComplete || complete.isPending || isLoading}
            onClick={() => void finish()}
          >
            Dokončit {view.completedRequiredCheckpoints}/{view.totalRequiredCheckpoints}
          </Button>
        )}
      </StickyActionBar>
    </article>
  );
}
