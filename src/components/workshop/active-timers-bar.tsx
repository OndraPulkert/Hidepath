import { Link } from 'react-router';

import { TimerAlert } from '@/components/workshop/timer-alert';
import { timerContext } from '@/features/timers/timer-links';
import { activeTimers, formatRemaining, remainingMs, timerStatus } from '@/features/timers/timers';
import {
  hasUnfired,
  useNow,
  useTimerActions,
  useTimerDriver,
  useTimers,
} from '@/features/timers/use-timers';
import { typo } from '@/lib/utils/format';

export interface ActiveTimersBarProps {
  /** Krok, který je právě na obrazovce – jeho běžící časovače už ukazuje sám krok. */
  currentStep?: { projectSlug: string; lessonSlug: string; stepId: string } | undefined;
}

/**
 * Pruh běžících časovačů a upozornění na doběhlé. Zároveň hlídá doběhnutí (ohlásí ho
 * zvukem nebo notifikací). Bez časovačů nevykreslí nic.
 */
export function ActiveTimersBar({ currentStep }: ActiveTimersBarProps) {
  useTimerDriver();
  const timers = useTimers();
  const now = useNow(hasUnfired(timers));
  const { dismiss } = useTimerActions();
  const active = activeTimers(timers);
  if (active.length === 0) return null;

  const done = active.filter((t) => timerStatus(t, now) === 'done');
  const running = active.filter(
    (t) => timerStatus(t, now) === 'running' && !isOnStep(t, currentStep),
  );

  return (
    <div className="flex flex-col print:hidden">
      {done.length > 0 ? <TimerAlert timers={done} now={now} onDismiss={dismiss} /> : null}
      {running.length > 0 ? (
        <nav
          aria-label="Běžící časovače"
          className="border-b border-line bg-brass-tint px-page py-1.5"
        >
          <ul className="mx-auto flex max-w-app flex-wrap gap-x-4 gap-y-1">
            {running.map((t) => (
              <li key={t.id}>
                <Link
                  to={timerContext(t).url}
                  className="inline-flex min-h-touch items-center gap-2 text-meta text-leather no-underline hover:text-cognac"
                >
                  <span aria-hidden>⏱</span>
                  <span>{typo(t.label)}</span>
                  <span className="font-mono font-semibold tabular-nums">
                    <span className="sr-only">zbývá </span>
                    {formatRemaining(remainingMs(t, now))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

function isOnStep(
  timer: { projectSlug: string; lessonSlug: string; stepId: string },
  step: ActiveTimersBarProps['currentStep'],
): boolean {
  return (
    step?.projectSlug === timer.projectSlug &&
    timer.lessonSlug === step.lessonSlug &&
    timer.stepId === step.stepId
  );
}
