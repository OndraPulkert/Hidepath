import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Spodní lišta akcí (lekce): sticky bottom, canvas pozadí, horní linka,
 * padding respektující safe-area. Nikdy nepřekrývá obsah – rodič má spodní odsazení.
 * Grid `auto auto 1fr`: Zpět · Na později · Dokončit.
 */
export function StickyActionBar({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      aria-label="Akce lekce"
      className={cn(
        'sticky bottom-0 z-10 -mx-4 grid grid-cols-[auto_auto_1fr] items-center gap-2',
        'border-t border-line bg-canvas px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
