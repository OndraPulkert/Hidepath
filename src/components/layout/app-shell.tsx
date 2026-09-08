import { Outlet, useLocation, useMatch } from 'react-router';

import { routePatterns } from '@/app/routes';

import { TopNav } from '@/components/layout/top-nav';
import { ConnectionStatus } from '@/components/sync/connection-status';

/**
 * Aplikační shell: sticky navigace, stavový pruh synchronizace a hlavní obsah
 * s max šířkou 1200 px a paddingem clamp(16px, 4vw, 48px). Obsah se při změně
 * trasy jemně animuje (hp-in).
 */
export function AppShell() {
  const { pathname } = useLocation();
  const isLesson = useMatch(routePatterns.lesson) !== null;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav hideOnMobile={isLesson} />
      <ConnectionStatus />
      <main
        id="obsah"
        key={pathname}
        className="mx-auto w-full max-w-app flex-1 animate-hp-in px-page pt-[clamp(16px,3vw,40px)] pb-24"
      >
        <Outlet />
      </main>
    </div>
  );
}
