import { NavLink, useLocation } from 'react-router';

import { isNavItemActive, primaryNavItems } from '@/app/routes';
import { useSession } from '@/features/auth/session-provider';
import { Brand } from '@/components/layout/brand';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Sticky horní navigace podle prototypu: brand vlevo, čtyři položky vpravo,
 * aktivní položka má leather výplň. Na úzkém displeji se položky zalomí pod brand.
 */
export interface TopNavProps {
  /** Na lekci (telefon na stole) navigace na malých displejích zbytečně ubírá místo – skryje se. */
  hideOnMobile?: boolean;
}

export function TopNav({ hideOnMobile = false }: TopNavProps) {
  const { pathname } = useLocation();
  const { session, signOut } = useSession();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b border-line bg-canvas px-page py-3.5 print:hidden',
        hideOnMobile && 'max-sm:static max-sm:hidden',
      )}
    >
      <a
        href="#obsah"
        className="sr-only rounded-control bg-leather px-3 py-2 text-canvas focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30"
      >
        Přeskočit na obsah
      </a>
      <div className="mx-auto flex max-w-app flex-wrap items-center gap-x-4 gap-y-1.5">
        <Brand className="mr-auto" />
        <nav aria-label="Hlavní navigace" className="flex flex-wrap gap-1">
          {primaryNavItems.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  buttonVariants({ variant: active ? 'leather' : 'secondary', size: 'nav' }),
                  'no-underline',
                  !active &&
                    'border-transparent text-leather hover:bg-parchment hover:text-leather',
                  active && 'hover:text-canvas',
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        {session.status === 'authenticated' ? (
          <div className="flex items-center gap-2 text-meta text-ink-2">
            <span
              className="hidden max-w-[24ch] truncate sm:inline"
              title={session.user?.email ?? undefined}
            >
              {session.user?.email}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label={session.user?.email ? `Odhlásit (${session.user.email})` : 'Odhlásit'}
              className="min-h-touch rounded-control px-3 text-[14px] font-semibold text-leather hover:bg-parchment"
            >
              Odhlásit
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
