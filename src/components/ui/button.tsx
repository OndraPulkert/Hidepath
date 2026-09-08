import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-control whitespace-nowrap',
    'font-sans text-body font-semibold transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac',
    'disabled:pointer-events-none disabled:opacity-45',
  ],
  {
    variants: {
      variant: {
        /** Jediný koňakový akcent na obrazovce. */
        primary: 'bg-cognac text-white hover:bg-cognac-hover active:bg-cognac-deep',
        secondary:
          'border border-line-strong bg-transparent text-leather hover:bg-leather/7 active:bg-leather/14',
        /** Tlačítko „Dokončit krok“ v lekci. */
        forest: 'bg-forest text-white hover:bg-forest-hover active:bg-forest-hover',
        ghost: 'bg-transparent text-cognac hover:bg-cognac/10 active:bg-cognac/18',
        /** Aktivní položka navigace / filtru. */
        leather: 'border border-leather bg-leather text-canvas',
      },
      size: {
        md: 'min-h-touch px-5 py-2.5',
        /** Spodní lišta lekce – 52 px. */
        lg: 'min-h-bar px-5 py-3',
        nav: 'min-h-10 px-4 py-2 text-[14px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Vykreslí potomka (např. odkaz) se styly tlačítka. */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}
