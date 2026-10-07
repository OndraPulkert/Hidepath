import { routes } from '@/app/routes';
import { findProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { type TimerNotice } from '@/features/timers/notify';
import { type TimerRecord } from '@/features/timers/timers';

export interface TimerContext {
  lessonTitle: string;
  /** Pozice kroku v dílenském režimu (1…N); 0, když krok v obsahu už neexistuje. */
  position: number;
  /** Adresa kroku v dílenském režimu. */
  url: string;
}

/** Kde časovač v obsahu leží: název lekce a adresa kroku. */
export function timerContext(
  timer: Pick<TimerRecord, 'projectSlug' | 'lessonSlug' | 'stepId'>,
  find: (slug: string) => ProjectDefinition | undefined = findProject,
): TimerContext {
  const lesson = find(timer.projectSlug)?.lessons.find((l) => l.slug === timer.lessonSlug);
  const index = lesson ? lesson.steps.findIndex((s) => s.id === timer.stepId) : -1;
  const position = index + 1;
  return {
    lessonTitle: lesson?.title ?? '',
    position,
    url: routes.lessonFocus(
      timer.projectSlug,
      timer.lessonSlug,
      position > 0 ? position : undefined,
    ),
  };
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
