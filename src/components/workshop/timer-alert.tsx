import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { timerContext } from '@/features/timers/timer-links';
import { formatAgo, type TimerRecord } from '@/features/timers/timers';
import { typo } from '@/lib/utils/format';

/** Za jak dlouho po konci říct „doběhlo před X“ (aplikace byla zavřená nebo na pozadí). */
const LATE_MS = 60_000;

/**
 * Upozornění na doběhlé časovače. Zůstává, dokud ho uživatel nezavře („Rozumím“);
 * zvuk a notifikace zazní jen jednou (hlídá je `useTimerDriver`).
 */
export function TimerAlert({
  timers,
  now,
  onDismiss,
}: {
  timers: readonly TimerRecord[];
  now: number;
  onDismiss: (id: string) => void;
}) {
  return (
    <div role="alert" className="border-b border-forest bg-forest-tint px-page py-3 text-leather">
      <ul className="mx-auto flex max-w-app flex-col gap-3">
        {timers.map((t) => {
          const ctx = timerContext(t);
          const late = now - t.endsAt >= LATE_MS;
          return (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="flex flex-col">
                <span className="text-body font-semibold">
                  <span aria-hidden>✓ </span>Hotovo: {typo(t.label)}
                </span>
                <span className="text-meta text-ink-2">
                  {ctx.position > 0 ? `Krok ${ctx.position}` : 'Lekce'}
                  {ctx.lessonTitle ? ` · ${typo(ctx.lessonTitle)}` : ''}
                  {late ? ` · doběhlo ${formatAgo(now - t.endsAt)}` : ''}
                </span>
              </p>
              <div className="flex gap-2">
                <Button asChild variant="secondary" className="bg-paper">
                  <Link to={ctx.url} className="no-underline">
                    Ke kroku
                  </Link>
                </Button>
                <Button variant="forest" onClick={() => onDismiss(t.id)}>
                  Rozumím
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
