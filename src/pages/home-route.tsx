import { Navigate } from 'react-router';

import { CARD_HOLDER_SLUG, resolveHomeRoute } from '@/app/routes';
import { useEnrollment } from '@/features/progress/use-progress';

/** Kořen: s aktivním projektem na přehled, bez něj na onboarding. */
export function HomeRoute() {
  const { enrollment, isLoading } = useEnrollment(CARD_HOLDER_SLUG);
  if (isLoading) {
    return (
      <p role="status" className="px-page py-10 text-ink-2">
        Načítání…
      </p>
    );
  }
  return <Navigate to={resolveHomeRoute(enrollment !== null)} replace />;
}
