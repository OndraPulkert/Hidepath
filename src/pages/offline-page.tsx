import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnlineStatus } from '@/lib/pwa/use-online-status';

/**
 * Explicitní offline stránka. Je součástí precachovaného app shellu,
 * takže se zobrazí i bez připojení.
 */
export function OfflinePage() {
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[640px] flex-1 animate-hp-in px-page pt-[clamp(24px,6vw,72px)] pb-24">
        <div className="mb-8">
          <Brand asText />
        </div>
        <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Jste offline</h1>
        <p className="mb-6 text-lead text-ink-2">
          {online
            ? 'Připojení je zpět. Můžete pokračovat tam, kde jste skončili.'
            : 'Tato část aplikace zatím není stažená do zařízení, proto ji bez připojení nezobrazíme.'}
        </p>

        <Card tone="dashed" className="mb-6">
          <p className="text-body">
            Stahování projektu do zařízení připravujeme. Až bude k dispozici, budou lekce a šablona
            dostupné i bez signálu a změny udělané offline se odešlou po připojení.
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to={routes.dashboard} className="text-white no-underline hover:text-white">
              Zpět na přehled
            </Link>
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Zkusit znovu
          </Button>
        </div>
      </main>
    </div>
  );
}
