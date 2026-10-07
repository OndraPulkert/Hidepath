import { useEffect, useEffectEvent, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { LESSON_ANCHORS, LESSON_FOCUS_STEP_PARAM, routes } from '@/app/routes';
import { LessonPrep } from '@/components/lessons/lesson-prep';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ActiveTimersBar } from '@/components/workshop/active-timers-bar';
import { FocusStep } from '@/components/workshop/focus-step';
import { findProject } from '@/content/projects';
import { type LessonDefinition, type ProjectDefinition } from '@/content/schema';
import { useProjectState } from '@/features/projects/use-project-state';
import { formatRemaining } from '@/features/timers/timers';
import { hasUnfired, useNow, useTimers } from '@/features/timers/use-timers';
import { describeWakeLock } from '@/features/workshop/wake-lock';
import { useWakeLock } from '@/features/workshop/use-wake-lock';
import {
  describeBlocker,
  isTypingTarget,
  parseStepParam,
  stepBlockers,
  stepNeighbors,
} from '@/features/workshop/workshop-nav';
import { NotFoundPage } from '@/pages/not-found-page';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/**
 * Dílenský režim lekce: celá obrazovka mimo AppShell, jeden krok po druhém s velkým písmem,
 * velkými tlačítky Zpět/Další (i šipkami na klávesnici), časovači čekání a rozsvícenou
 * obrazovkou. Krok je v adrese (`?krok=N`, 0 = „Než začnete“), takže přežije reload.
 */
export function LessonFocusPage() {
  const { projectSlug = '', lessonSlug = '' } = useParams<'projectSlug' | 'lessonSlug'>();
  const project = findProject(projectSlug);
  const lesson = project?.lessons.find((l) => l.slug === lessonSlug);
  if (!project || !lesson) return <NotFoundPage />;
  return <FocusView key={`${project.slug}/${lesson.slug}`} project={project} lesson={lesson} />;
}

function FocusView({ project, lesson }: { project: ProjectDefinition; lesson: LessonDefinition }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const position = parseStepParam(searchParams.get(LESSON_FOCUS_STEP_PARAM), lesson);
  const { prev, next } = stepNeighbors(position, lesson);
  const { inventory } = useProjectState(project);
  const wakeLock = describeWakeLock(useWakeLock());
  const timers = useTimers();
  const now = useNow(hasUnfired(timers));
  const step = position > 0 ? lesson.steps[position - 1] : undefined;
  const total = lesson.steps.length;

  const blockers = stepBlockers(lesson, project.slug, position, timers, now);
  const nextBlockers = next === null ? [] : stepBlockers(lesson, project.slug, next, timers, now);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastPosition = useRef(position);
  useEffect(() => {
    // Fokus na nadpis až po přechodu na jiný krok (ne při prvním vykreslení), ať čtečka
    // oznámí nový krok a Tab pokračuje od jeho začátku.
    if (lastPosition.current === position) return;
    lastPosition.current = position;
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [position]);

  const go = (target: number | null) => {
    if (target === null) return;
    setSearchParams(
      (params) => {
        const nextParams = new URLSearchParams(params);
        nextParams.set(LESSON_FOCUS_STEP_PARAM, String(target));
        return nextParams;
      },
      { replace: true },
    );
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isTypingTarget(event.target)) return;
    if (event.key === 'ArrowRight' && next !== null) {
      event.preventDefault();
      go(next);
    } else if (event.key === 'ArrowLeft' && prev !== null) {
      event.preventDefault();
      go(prev);
    }
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-page py-2">
          <Button asChild variant="secondary" className="bg-paper">
            <Link
              to={routes.lesson(
                project.slug,
                lesson.slug,
                position > 0 ? LESSON_ANCHORS.step(position) : undefined,
              )}
              className="no-underline"
            >
              <span aria-hidden>✕</span> Ukončit
            </Link>
          </Button>
          <p className="text-right font-mono text-meta text-ink-2" aria-live="polite">
            {position === 0 ? 'Než začnete' : `Krok ${position} / ${total}`}
          </p>
        </div>
        <ProgressBar
          size="sm"
          value={position / total}
          label={`Postup lekce: krok ${position} z ${total}`}
          className="rounded-none"
        />
      </header>

      <ActiveTimersBar
        currentStep={
          step ? { projectSlug: project.slug, lessonSlug: lesson.slug, stepId: step.id } : undefined
        }
      />

      <main
        id="obsah"
        className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-6 px-page pt-5 pb-8"
      >
        <div className="flex flex-col gap-2">
          <p className="kicker">Dílenský režim</p>
          <h1 className="text-[clamp(18px,4.5vw,22px)] text-ink-2">{typo(lesson.title)}</h1>
          {wakeLock ? (
            <p
              role="status"
              className={cn(
                'text-meta',
                wakeLock.tone === 'warn'
                  ? 'rounded-md border border-brass bg-brass-tint px-3 py-2 text-leather'
                  : 'text-ink-2',
              )}
            >
              {wakeLock.tone === 'ok' ? <span aria-hidden>☀ </span> : null}
              {wakeLock.text}
            </p>
          ) : null}
        </div>

        {blockers.length > 0 ? (
          <div
            role="note"
            aria-label="Ještě se čeká"
            className="flex flex-col gap-1 rounded-md border border-cognac bg-cognac-tint px-4 py-3 text-body"
          >
            {blockers.map((b) => (
              <div key={`${b.fromStepId}/${b.wait.id}`} className="flex flex-col items-start">
                <p>
                  <span aria-hidden>⏳ </span>
                  {typo(describeBlocker(b, formatRemaining))}
                </p>
                {b.state === 'not-started' ? (
                  <button
                    type="button"
                    className="inline-flex min-h-touch items-center font-semibold text-cognac-deep underline underline-offset-3"
                    onClick={() => go(b.fromPosition)}
                  >
                    Ke kroku {b.fromPosition}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {step ? (
          <FocusStep
            project={project}
            lesson={lesson}
            step={step}
            position={position}
            headingRef={headingRef}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-[clamp(26px,6.5vw,36px)] leading-tight focus-visible:outline-offset-4"
            >
              Než začnete
            </h2>
            <p className="text-lead text-ink-2">
              Připravte si všechno na stůl. Pak šipkou nebo tlačítkem Další přejděte na první krok.
            </p>
            <LessonPrep project={project} lesson={lesson} inventory={inventory} />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 z-10 border-t border-line bg-canvas">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2 px-page pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
          {nextBlockers.length > 0 ? (
            <p className="text-meta text-ink-2">
              <span aria-hidden>⏳ </span>
              Další krok čeká na „{typo(nextBlockers[0]!.wait.label)}“
              {nextBlockers[0]!.state === 'running'
                ? ` (ještě ${formatRemaining(nextBlockers[0]!.remainingMs)})`
                : ''}
              .
            </p>
          ) : null}
          <div
            role="group"
            aria-label="Navigace kroků"
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-3"
          >
            <Button
              variant="secondary"
              size="lg"
              className="bg-paper text-[17px]"
              disabled={prev === null}
              onClick={() => go(prev)}
            >
              <span aria-hidden>←</span> Zpět
            </Button>
            {next !== null ? (
              <Button variant="forest" size="lg" className="text-[17px]" onClick={() => go(next)}>
                {position === 0 ? 'Začít' : 'Další'} <span aria-hidden>→</span>
              </Button>
            ) : (
              <Button asChild variant="forest" size="lg" className="text-[17px]">
                <Link
                  to={routes.lesson(project.slug, lesson.slug, LESSON_ANCHORS.checkpoints)}
                  className="text-white no-underline hover:text-white"
                >
                  Ke kontrolním bodům
                </Link>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
