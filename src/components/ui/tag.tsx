import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Stavový štítek. Stav nikdy nevyjadřujeme jen barvou – text štítku je vždy
 * explicitní („Připraveno“, „Objednáno · na cestě“, „Chybí“, „Zamčeno“).
 */
export const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-meta font-bold whitespace-nowrap',
  {
    variants: {
      tone: {
        ready: 'bg-forest-tint text-forest',
        ordered: 'bg-brass-tint text-brass-deep',
        missing: 'bg-cognac-tint text-cognac-deep',
        optional: 'bg-parchment text-ink-2',
        locked: 'bg-parchment text-ink-2',
        done: 'bg-forest-tint text-forest',
        current: 'bg-cognac-tint text-cognac-deep',
        neutral: 'bg-parchment text-leather',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface TagProps extends ComponentProps<'span'>, VariantProps<typeof tagVariants> {}

export function Tag({ className, tone, ...props }: TagProps) {
  return <span data-slot="tag" className={cn(tagVariants({ tone }), className)} {...props} />;
}
