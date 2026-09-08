import { type PhaseProgress } from '@/features/progress/journey';
import { cn } from '@/lib/utils/cn';

/** Fázová lišta: 6 sloupců, pruh 4 px, forest hotové / cognac aktuální s dílčím %. */
export function PhaseRail({ phases }: { phases: readonly PhaseProgress[] }) {
  return (
    <ol
      aria-label="Fáze cesty"
      className="grid [grid-template-columns:repeat(6,minmax(0,1fr))] gap-1.5 max-sm:[grid-template-columns:repeat(3,minmax(0,1fr))]"
    >
      {phases.map((phase) => (
        <li
          key={phase.slug}
          className="flex flex-col gap-2"
          aria-current={phase.isCurrent ? 'step' : undefined}
        >
          <span className="block h-1 overflow-hidden rounded-[2px] bg-parchment">
            <span
              className={cn(
                'block h-full',
                phase.isComplete ? 'bg-forest' : phase.isCurrent ? 'bg-cognac' : 'bg-transparent',
              )}
              style={{ width: `${Math.round(phase.ratio * 100)}%` }}
            />
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-ink-2">{phase.code}</span>
            <span
              className={cn(
                'text-[12px] leading-tight',
                phase.isCurrent ? 'font-semibold text-leather' : 'text-ink-2',
              )}
            >
              {phase.name}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
