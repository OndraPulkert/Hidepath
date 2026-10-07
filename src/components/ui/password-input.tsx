import { type ComponentProps, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

/**
 * Pole pro heslo s tlačítkem Zobrazit/Skrýt (44 px). Při odeslání formuláře se heslo znovu skryje,
 * aby ho Klíčenka iOS poznala jako heslo a nabídla uložení.
 */
export function PasswordInput({ className, id, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const hide = () => setVisible(false);
    form.addEventListener('submit', hide);
    return () => form.removeEventListener('submit', hide);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        type={visible ? 'text' : 'password'}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn('pr-24', className)}
        {...props}
      />
      <button
        type="button"
        aria-controls={id}
        aria-label={visible ? 'Skrýt heslo' : 'Zobrazit heslo'}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 inline-flex min-h-touch min-w-touch items-center justify-center rounded-r-md px-3 text-meta font-semibold text-cognac hover:bg-cognac/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cognac"
      >
        {visible ? 'Skrýt' : 'Zobrazit'}
      </button>
    </div>
  );
}
