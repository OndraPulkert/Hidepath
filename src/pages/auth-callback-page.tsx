import { Link, Navigate, useLocation } from 'react-router';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { readAuthError } from '@/features/auth/magic-link';
import { readReturnTo } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';

/**
 * Návrat z e-mailového odkazu. Supabase klient vymění kód z URL za relaci sám
 * (detectSessionInUrl); stránka jen počká na relaci a přesměruje na návratovou adresu.
 */
export function AuthCallbackPage() {
  const location = useLocation();
  const { session } = useSession();
  const returnTo = readReturnTo(location.search, routes.dashboard);
  const error = readAuthError(location.search, location.hash);

  if (session.status === 'authenticated') return <Navigate to={returnTo} replace />;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[520px] flex-1 px-page pt-[clamp(24px,6vw,72px)] pb-24">
        <div className="mb-8">
          <Brand asText />
        </div>
        {error || session.status === 'anonymous' ? (
          <Card tone="dashed" role="alert">
            <h1 className="text-h2">Přihlášení se nepodařilo</h1>
            <p className="mt-2 text-body">
              {error ?? 'Odkaz už není platný nebo byl použitý. Nechte si poslat nový.'}
            </p>
            <Button className="mt-4" asChild>
              <Link to={routes.login} className="text-white no-underline hover:text-white">
                Zpět na přihlášení
              </Link>
            </Button>
          </Card>
        ) : (
          <p role="status" className="text-lead text-ink-2">
            Dokončujeme přihlášení…
          </p>
        )}
      </main>
    </div>
  );
}
