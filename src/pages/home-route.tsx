import { Navigate } from 'react-router';

import { resolveHomeRoute } from '@/app/routes';
import { isEnrolled } from '@/features/progress/types';
import { useEnrollments } from '@/features/progress/use-progress';

/** Kořen: se zápisem do kteréhokoli projektu na přehled, bez něj na onboarding. */
export function HomeRoute() {
  const { data: enrollments, isLoading } = useEnrollments();
  if (isLoading) {
    return (
      <p role="status" className="px-page py-10 text-ink-2">
        Načítání…
      </p>
    );
  }
  return <Navigate to={resolveHomeRoute((enrollments ?? []).some(isEnrolled))} replace />;
}
