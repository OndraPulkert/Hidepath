import { cn } from '@/lib/utils/cn';

export interface ProgressBarProps {
  /** 0–1, tmavá část (mám / hotovo). */
  value: number;
  /** 0–1, světlejší část za tmavou (objednáno). */
  secondary?: number;
  tone?: 'forest' | 'cognac';
  size?: 'sm' | 'md';
  label: string;
  className?: string;
}

/** Progress bar podle styleguidu: 6–8 px, parchment podklad, forest výplň, brass .55 pro objednané. */
export function ProgressBar({
  value,
  secondary = 0,
  tone = 'forest',
  size = 'md',
  label,
  className,
}: ProgressBarProps) {
  const primary = Math.min(1, Math.max(0, value));
  const extra = Math.min(1 - primary, Math.max(0, secondary));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(primary * 100)}
      className={cn(
        'flex w-full overflow-hidden rounded-[4px] bg-parchment',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
    >
      <div
        className={cn('h-full', tone === 'forest' ? 'bg-forest' : 'bg-cognac')}
        style={{ width: `${primary * 100}%` }}
      />
      {extra > 0 ? (
        <div className="h-full bg-brass/55" style={{ width: `${extra * 100}%` }} />
      ) : null}
    </div>
  );
}
