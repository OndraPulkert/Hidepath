import { useState } from 'react';

import { type StepExtrasProps } from '@/components/lessons/step-extras';
import { Button } from '@/components/ui/button';
import { type StepWait } from '@/content/schema';
import { buildTimerIcs, icsFileName } from '@/features/timers/ics';
import { timerContext } from '@/features/timers/timer-links';
import {
  adjustMinutes,
  findTimer,
  formatAgo,
  formatEndsAt,
  formatMinutes,
  formatRemaining,
  formatWaitRange,
  offersCalendar,
  remainingMs,
  timerStatus,
  waitDurationBounds,
  type TimerRecord,
} from '@/features/timers/timers';
import {
  hasUnfired,
  useNotificationPermission,
  useNow,
  useTimerActions,
  useTimers,
} from '@/features/timers/use-timers';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/**
 * Časovače čekání kroku (`step.waits`): volba doby, „Spustit X min“, odpočet a hotovo.
 * Stav drží úložiště časovačů, takže odpočet přežije přechod mezi stránkami i reload.
 */
export function StepTimers({ project, lesson, step }: StepExtrasProps) {
  const timers = useTimers();
  const waits = step.waits ?? [];
  const now = useNow(hasUnfired(timers));
  if (waits.length === 0) return null;

  const stepTimers = waits
    .map((w) =>
      findTimer(timers, {
        projectSlug: project.slug,
        lessonSlug: lesson.slug,
        stepId: step.id,
        waitId: w.id,
      }),
    )
    .filter((t): t is TimerRecord => t !== undefined);

  return (
    <div className="flex flex-col gap-3">
      {waits.map((wait) => (
        <WaitTimer
          key={wait.id}
          wait={wait}
          projectSlug={project.slug}
          lessonSlug={lesson.slug}
          lessonTitle={lesson.title}
          stepId={step.id}
          timers={timers}
          now={now}
        />
      ))}
      {stepTimers.length > 0 ? <NotifyPrompt /> : null}
    </div>
  );
}

function WaitTimer({
  wait,
  projectSlug,
  lessonSlug,
  lessonTitle,
  stepId,
  timers,
  now,
}: {
  wait: StepWait;
  projectSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  stepId: string;
  timers: readonly TimerRecord[];
  now: number;
}) {
  const ref = { projectSlug, lessonSlug, stepId, waitId: wait.id };
  const timer = findTimer(timers, ref);
  const bounds = waitDurationBounds(wait);
  const [minutes, setMinutes] = useState(bounds.initial);
  const { start, cancel, dismiss } = useTimerActions();
  const status = timer ? timerStatus(timer, now) : null;
  const headingId = `cekani-${stepId}-${wait.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-3 rounded-md border p-4',
        status === 'done' ? 'border-forest bg-forest-tint' : 'border-line bg-paper',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h4 id={headingId} className="text-body font-semibold">
          <span aria-hidden>⏱ </span>
          {typo(wait.label)}
        </h4>
        <p className="text-meta text-ink-2">
          {wait.basis === 'manufacturer'
            ? 'Orientačně, řiďte se návodem na obalu.'
            : `Podle lekce: ${formatWaitRange(wait)}`}
        </p>
      </div>

      {!timer ? (
        <div className="flex flex-wrap items-center gap-2">
          {bounds.adjustable ? (
            <div role="group" aria-label="Doba čekání" className="flex items-center gap-1">
              <Button
                variant="secondary"
                className="w-touch px-0 text-[20px]"
                aria-label="Kratší"
                disabled={minutes <= bounds.min}
                onClick={() => setMinutes((m) => adjustMinutes(m, -1, bounds))}
              >
                −
              </Button>
              <output
                aria-live="polite"
                className="min-w-[5.5rem] text-center font-mono text-body font-semibold"
              >
                {formatMinutes(minutes)}
              </output>
              <Button
                variant="secondary"
                className="w-touch px-0 text-[20px]"
                aria-label="Delší"
                disabled={minutes >= bounds.max}
                onClick={() => setMinutes((m) => adjustMinutes(m, 1, bounds))}
              >
                +
              </Button>
            </div>
          ) : null}
          <Button
            variant="forest"
            onClick={() => start({ ...ref, label: wait.label, durationMin: minutes })}
          >
            Spustit {formatMinutes(minutes)}
          </Button>
        </div>
      ) : status === 'running' ? (
        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span
              role="timer"
              aria-label={`Zbývá ${formatRemaining(remainingMs(timer, now))}`}
              className="font-mono text-stat font-semibold tabular-nums"
            >
              {formatRemaining(remainingMs(timer, now))}
            </span>
            <span className="text-meta text-ink-2">hotovo {formatEndsAt(timer.endsAt, now)}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => cancel(timer.id)}>
              Zrušit časovač
            </Button>
            {offersCalendar(timer.durationMin) ? (
              <Button variant="ghost" onClick={() => downloadIcs(timer, lessonTitle)}>
                Přidat do kalendáře
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-body font-semibold text-forest">
            ✓ Hotovo
            {now - timer.endsAt >= 60_000 ? (
              <span className="font-normal text-ink-2">
                {' '}
                · doběhlo {formatAgo(now - timer.endsAt)}
              </span>
            ) : null}
          </p>
          <Button
            variant="secondary"
            className="self-start bg-paper"
            onClick={() => dismiss(timer.id)}
          >
            Rozumím
          </Button>
        </div>
      )}
    </section>
  );
}

/** Nabídka systémových upozornění; o povolení se žádá jen tímto tlačítkem. */
function NotifyPrompt() {
  const { permission, request } = useNotificationPermission();
  if (permission === 'granted') return null;
  if (permission === 'default') {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="ghost" className="self-start" onClick={() => void request()}>
          Upozornit mě, až čekání skončí
        </Button>
        <p className="text-meta text-ink-2">
          Na iPhonu to funguje jen v aplikaci přidané na plochu.
        </p>
      </div>
    );
  }
  return (
    <p className="text-meta text-ink-2">
      Pípne jen otevřený Hidepath. Když ho zavřete, uvidíte po návratu, co mezitím doběhlo.
    </p>
  );
}

function downloadIcs(timer: TimerRecord, lessonTitle: string) {
  const ctx = timerContext(timer);
  const ics = buildTimerIcs({
    timer,
    lessonTitle,
    url: new URL(ctx.url, window.location.origin).toString(),
    now: Date.now(),
  });
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = icsFileName(timer.label);
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
