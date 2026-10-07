import { NavLink, useLocation } from 'react-router';

import { isNavItemActive, primaryNavItemsFor } from '@/app/routes';
import { useSession } from '@/features/auth/session-provider';
import { useDataContext } from '@/features/data/data-provider';
import { useActiveProject } from '@/features/projects/use-active-project';
import { Brand } from '@/components/layout/brand';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Sticky horní navigace podle prototypu: brand vlevo, čtyři položky vpravo,
 * aktivní položka má leather výplň. Na úzkém displeji se položky zalomí pod brand.
 */
function unsentChanges(count: number): string {
  if (count === 1) return '1 změna ještě není odeslaná';
  if (count <= 4) return `${count} změny ještě nejsou odeslané`;
  return `${count} změn ještě není odeslaných`;
}

export interface TopNavProps {
  /** Na lekci (telefon na stole) navigace na malých displejích zbytečně ubírá místo – skryje se. */
  hideOnMobile?: boolean;
}

export function TopNav({ hideOnMobile = false }: TopNavProps) {
  const { pathname } = useLocation();
  const { session, signOut } = useSession();
  const { sync } = useDataContext();
  const activeProject = useActiveProject();

  // Odhlášení smaže lokální kopii dat uživatele z prohlížeče – nejdřív odeslat, co čeká,
  // a když to nejde (offline), zeptat se, než se neodeslané změny ztratí.
  const handleSignOut = async () => {
    if (sync) {
      await sync.flush({ force: true });
      const { pendingCount } = sync.getSnapshot();
      if (
        pendingCount > 0 &&
        !window.confirm(
          `${unsentChanges(pendingCount)} do účtu (bez připojení). Po odhlášení se z tohoto zařízení smažou. Přesto odhlásit?`,
        )
      )
        return;
    }
    await signOut();
  };

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
          {primaryNavItemsFor(activeProject.slug).map((item) => {
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
              onClick={() => void handleSignOut()}
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
