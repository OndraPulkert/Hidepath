import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils/cn';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'min-h-touch w-full rounded-md border border-line bg-paper px-3.5 text-body text-leather',
        'placeholder:text-ink-2/70 hover:border-line-strong',
        'focus-visible:border-cognac focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-cognac',
        'disabled:opacity-45',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('mb-1.5 block text-meta font-medium text-ink-2', className)}
      {...props}
    />
  );
}
