import { LESSON_ANCHORS, routes } from '@/app/routes';
import { findProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { type TimerNotice } from '@/features/timers/notify';
import { type TimerRecord } from '@/features/timers/timers';

export interface TimerContext {
  lessonTitle: string;
  /** Pozice kroku v dílenském režimu (1…N); 0, když krok v obsahu už neexistuje. */
  position: number;
  /** Adresa kroku tam, odkud se časovač spustil (běžná lekce, nebo dílenský režim). */
  url: string;
}

type TimerRef = Pick<TimerRecord, 'projectSlug' | 'lessonSlug' | 'stepId'> &
  Partial<Pick<TimerRecord, 'origin'>>;

/** Adresa kroku `position` (1…N; 0 = lekce/dílenský režim od začátku) podle původu časovače. */
function stepUrl(timer: TimerRef, position: number): string {
  if (timer.origin === 'lesson') {
    return routes.lesson(
      timer.projectSlug,
      timer.lessonSlug,
      position > 0 ? LESSON_ANCHORS.step(position) : undefined,
    );
  }
  return routes.lessonFocus(
    timer.projectSlug,
    timer.lessonSlug,
    position > 0 ? position : undefined,
  );
}

/** Kde časovač v obsahu leží: název lekce a adresa kroku. */
export function timerContext(
  timer: TimerRef,
  find: (slug: string) => ProjectDefinition | undefined = findProject,
): TimerContext {
  const lesson = find(timer.projectSlug)?.lessons.find((l) => l.slug === timer.lessonSlug);
  const index = lesson ? lesson.steps.findIndex((s) => s.id === timer.stepId) : -1;
  const position = index + 1;
  return { lessonTitle: lesson?.title ?? '', position, url: stepUrl(timer, position) };
}

/**
 * Kam pokračovat po čekání (odkaz v události kalendáře): krok, který čekání blokuje
 * (`blocksStepId`), jinak krok po kroku s čekáním. Bez nich krok s čekáním.
 */
export function timerContinueUrl(
  timer: TimerRef & Pick<TimerRecord, 'waitId'>,
  find: (slug: string) => ProjectDefinition | undefined = findProject,
): string {
  const steps = find(timer.projectSlug)?.lessons.find((l) => l.slug === timer.lessonSlug)?.steps;
  const index = steps ? steps.findIndex((s) => s.id === timer.stepId) : -1;
  if (!steps || index === -1) return stepUrl(timer, 0);
  const blocks = steps[index]!.waits?.find((w) => w.id === timer.waitId)?.blocksStepId;
  const blocked = blocks ? steps.findIndex((s) => s.id === blocks) : -1;
  const next = blocked !== -1 ? blocked : Math.min(index + 1, steps.length - 1);
  return stepUrl(timer, next + 1);
}

/** Zda čekání časovače v obsahu blokuje pozdější krok (`blocksStepId`). */
export function waitBlocksLaterStep(
  timer: Pick<TimerRecord, 'projectSlug' | 'lessonSlug' | 'stepId' | 'waitId'>,
  find: (slug: string) => ProjectDefinition | undefined = findProject,
): boolean {
  const step = find(timer.projectSlug)
    ?.lessons.find((l) => l.slug === timer.lessonSlug)
    ?.steps.find((s) => s.id === timer.stepId);
  return step?.waits?.some((w) => w.id === timer.waitId && w.blocksStepId !== undefined) ?? false;
}

/** Text ohlášení doběhlého časovače. */
export function timerNotice(
  timer: TimerRecord,
  find: (slug: string) => ProjectDefinition | undefined = findProject,
): TimerNotice {
  const ctx = timerContext(timer, find);
  const where = ctx.position > 0 ? `Krok ${ctx.position}` : 'Lekce';
  return {
    id: timer.id,
    title: `Hotovo: ${timer.label}`,
    body: ctx.lessonTitle ? `${where} · ${ctx.lessonTitle}` : 'Čekání skončilo.',
    url: ctx.url,
  };
}
