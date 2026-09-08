import { Navigate, Outlet, useLocation } from 'react-router';

import { appConfig } from '@/app/config';
import { routes } from '@/app/routes';
import { decideRouteGuard } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';

/**
 * Ochrana autentizovaných tras. Rozhodnutí dělá čistá funkce decideRouteGuard;
 * komponenta ho jen provede. Bez nakonfigurovaného Supabase je ochrana vypnutá.
 */
export function RequireAuth() {
  const location = useLocation();
  const { session } = useSession();
  const decision = decideRouteGuard({
    guardEnabled: appConfig.authGuardEnabled,
    session,
    currentUrl: `${location.pathname}${location.search}`,
    loginPath: routes.login,
  });

  switch (decision.kind) {
    case 'allow':
      return <Outlet />;
    case 'wait':
      return (
        <p role="status" className="px-page py-10 text-ink-2">
          Ověřujeme přihlášení…
        </p>
      );
    case 'redirect':
      return <Navigate to={decision.to} replace />;
  }
}
