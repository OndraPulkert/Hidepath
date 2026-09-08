import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

export const cardVariants = cva('rounded-card', {
  variants: {
    tone: {
      /** Běžná karta: paper + 1 px linka, bez stínu. */
      paper: 'border border-line bg-paper text-leather',
      /** Tmavá „next action“ karta – jen jedna na obrazovce. */
      leather: 'relative overflow-hidden bg-leather text-canvas',
      /** Box kontrolního bodu / štítek Připraveno. */
      forest: 'border border-forest bg-forest-tint text-leather',
      /** Bezpečnostní upozornění. */
      cognac: 'border border-cognac bg-cognac-tint text-leather',
      /** Časté chyby. */
      brass: 'border border-brass bg-transparent text-leather',
      /** Zámek / placeholder – čárkovaný rámeček. */
      dashed: 'border border-dashed border-line-strong bg-paper text-leather',
    },
    padding: {
      none: 'p-0',
      md: 'p-5',
      lg: 'p-6 sm:p-7',
    },
  },
  defaultVariants: { tone: 'paper', padding: 'md' },
});

export interface CardProps extends ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

export function Card({ className, tone, padding, ...props }: CardProps) {
  return (
    <div data-slot="card" className={cn(cardVariants({ tone, padding }), className)} {...props} />
  );
}

/** Dekor čárkovaných kružnic pro tmavou kartu (podle prototypu). */
export function CardDashedDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-15 size-80 rounded-full border border-dashed border-canvas/18"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -bottom-28 size-[420px] rounded-full border border-dashed border-canvas/12"
      />
    </>
  );
}
