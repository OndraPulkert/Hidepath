import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

/** Wrapper segmentu: paper + linka, r 10, padding 4. Potomci jsou tlačítka min-h 44, r 8. */
export function Segment({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-md border border-line bg-paper p-1',
        className,
      )}
      {...props}
    />
  );
}

export interface SegmentButtonProps extends ComponentProps<'button'> {
  active: boolean;
  /** Barva aktivního stavu. */
  activeClassName?: string;
}

export function SegmentButton({
  active,
  activeClassName = 'bg-leather text-canvas',
  className,
  children,
  ...props
}: SegmentButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={props.role ? undefined : active}
      className={cn(
        'inline-flex min-h-touch items-center justify-center gap-1 rounded-control px-4 text-body font-semibold whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac',
        active ? activeClassName : 'bg-transparent text-leather hover:bg-parchment',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
