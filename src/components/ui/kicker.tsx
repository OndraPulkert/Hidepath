import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

/** Malý uppercase nadpis nad sekcí („Projekt 01 · Pouzdro na karty“). */
export function Kicker({ className, ...props }: ComponentProps<'p'>) {
  return <p data-slot="kicker" className={cn('kicker', className)} {...props} />;
}
