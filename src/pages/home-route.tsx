import { Navigate } from 'react-router';

import { resolveHomeRoute } from '@/app/routes';
import { startingProject } from '@/content/projects';
import { useEnrollment } from '@/features/progress/use-progress';

/** Kořen: s aktivním projektem na přehled, bez něj na onboarding. */
export function HomeRoute() {
  const { enrollment, isLoading } = useEnrollment(startingProject.slug);
  if (isLoading) {
    return (
      <p role="status" className="px-page py-10 text-ink-2">
        Načítání…
      </p>
    );
  }
  return <Navigate to={resolveHomeRoute(enrollment !== null)} replace />;
}
