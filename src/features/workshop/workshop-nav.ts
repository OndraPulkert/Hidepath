import { type LessonDefinition, type StepWait } from '@/content/schema';
import { sameWait, remainingMs, timerStatus, type TimerRecord } from '@/features/timers/timers';

/**
 * Navigace dílenského režimu. Pozice 0 = „Než začnete“ (příprava), 1…N = kroky lekce
 * (stejně jako `?krok=N` v adrese).
 */
export function stepPositionCount(lesson: Pick<LessonDefinition, 'steps'>): number {
  return lesson.steps.length + 1;
}

/**
 * Pozice z parametru `?krok=`. Chybějící nebo neplatná hodnota = 0 (od začátku),
 * číslo za koncem se ořízne na poslední krok.
 */
export function parseStepParam(
  raw: string | null,
  lesson: Pick<LessonDefinition, 'steps'>,
): number {
  if (raw === null || !/^\d+$/.test(raw.trim())) return 0;
  const n = Number.parseInt(raw.trim(), 10);
  return Math.min(n, lesson.steps.length);
}

export interface StepNeighbors {
  prev: number | null;
  next: number | null;
}

export function stepNeighbors(
  position: number,
  lesson: Pick<LessonDefinition, 'steps'>,
): StepNeighbors {
  const last = lesson.steps.length;
  return {
    prev: position > 0 ? position - 1 : null,
    next: position < last ? position + 1 : null,
  };
}

/** Čekání, které musí doběhnout, než se pustíte do kroku. */
export interface StepBlocker {
  wait: StepWait;
  /** Pozice kroku, ve kterém se čeká (1…N). */
  fromPosition: number;
  fromStepId: string;
  state: 'not-started' | 'running';
  /** Zbývá do konce (jen u běžícího). */
  remainingMs: number;
}

/**
 * Čekání z dřívějších kroků, která blokují krok na `position` (`blocksStepId`) a ještě
 * nedoběhla – buď běží, nebo je uživatel nespustil. Doběhlé či zavřené časovače neblokují.
 */
export function stepBlockers(
  lesson: Pick<LessonDefinition, 'slug' | 'steps'>,
  projectSlug: string,
  position: number,
  timers: readonly TimerRecord[],
  now: number,
): StepBlocker[] {
  const target = lesson.steps[position - 1];
  if (!target) return [];
  const out: StepBlocker[] = [];
  lesson.steps.forEach((step, index) => {
    for (const wait of step.waits ?? []) {
      if (wait.blocksStepId !== target.id) continue;
      const ref = { projectSlug, lessonSlug: lesson.slug, stepId: step.id, waitId: wait.id };
      // Jedno čekání má nejvýš jeden záznam (startTimer starší nahradí), i zavřený.
      const timer = timers.find((t) => sameWait(t, ref));
      if (timer && timerStatus(timer, now) !== 'running') continue;
      out.push({
        wait,
        fromPosition: index + 1,
        fromStepId: step.id,
        state: timer ? 'running' : 'not-started',
        remainingMs: timer ? remainingMs(timer, now) : 0,
      });
    }
  });
  return out;
}

/** Text upozornění před blokovaným krokem. */
export function describeBlocker(
  blocker: StepBlocker,
  formatRemaining: (ms: number) => string,
): string {
  if (blocker.state === 'running') {
    return `Počkejte, až doběhne „${blocker.wait.label}“ (ještě ${formatRemaining(blocker.remainingMs)}).`;
  }
  return `Nejdřív spusťte a nechte doběhnout „${blocker.wait.label}“ v kroku ${blocker.fromPosition}.`;
}

/** Zda klávesová zkratka nemá přebít psaní do pole formuláře. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== 'function') return false;
  const el = target as HTMLElement;
  if (el.isContentEditable) return true;
  return el.closest('input, textarea, select, [contenteditable="true"]') !== null;
}
