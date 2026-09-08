import { Link } from 'react-router';

import { appConfig } from '@/app/config';
import { routes } from '@/app/routes';
import { cn } from '@/lib/utils/cn';

export interface BrandProps {
  /** Bez odkazu (např. na onboardingu, kde nemá kam vést). */
  asText?: boolean;
  className?: string;
}

export function Brand({ asText = false, className }: BrandProps) {
  const content = (
    <>
      <span className="font-serif text-[22px] font-semibold tracking-[0.01em] text-leather">
        {appConfig.name}
      </span>
      <span className="font-serif text-meta text-ink-2 italic">{appConfig.tagline}</span>
    </>
  );
  const classes = cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-0 no-underline', className);

  if (asText) {
    return <div className={classes}>{content}</div>;
  }
  return (
    <Link
      to={routes.dashboard}
      className={cn(classes, 'hover:text-leather')}
      aria-label="Hidepath – přehled"
    >
      {content}
    </Link>
  );
}
