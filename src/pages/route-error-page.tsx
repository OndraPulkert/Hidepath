import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { NotFoundPage } from '@/pages/not-found-page';

/** Hranice chyb routeru: 404 zobrazí stránku „nenalezeno“, ostatní chyby obecnou omluvu. */
export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="px-page">
        <NotFoundPage />
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[640px] flex-1 px-page pt-[clamp(24px,6vw,72px)] pb-24">
        <div className="mb-8">
          <Brand asText />
        </div>
        <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Něco se pokazilo</h1>
        <p className="mb-6 text-lead text-ink-2">
          Aplikace narazila na neočekávanou chybu. Váš postup zůstává uložený; zkuste stránku načíst
          znovu.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Načíst znovu</Button>
          <Button variant="secondary" asChild>
            <Link to={routes.dashboard} className="no-underline">
              Zpět na přehled
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
