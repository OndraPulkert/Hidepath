import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[640px] py-10">
      <p className="mb-2 kicker">Chyba 404</p>
      <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Tuhle stránku nemáme</h1>
      <p className="mb-6 text-lead text-ink-2">
        Adresa neodpovídá žádné části Hidepath. Vraťte se na přehled a pokračujte odtud.
      </p>
      <Button asChild>
        <Link to={routes.dashboard} className="text-white no-underline hover:text-white">
          Zpět na přehled
        </Link>
      </Button>
    </div>
  );
}
