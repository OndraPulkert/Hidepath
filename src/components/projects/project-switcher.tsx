import { useRef } from 'react';
import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { difficultyLabels, projects } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { type EnrollmentRecord, isEnrolled } from '@/features/progress/types';
import { useEnrollments } from '@/features/progress/use-progress';
import { useSwitchProject } from '@/features/projects/use-switch-project';
import { cn } from '@/lib/utils/cn';

const statusLabels = {
  active: 'Rozpracovaný',
  completed: 'Hotový',
  none: 'Nezačatý',
} as const;

function statusOf(enrollment: EnrollmentRecord | undefined): keyof typeof statusLabels {
  if (!isEnrolled(enrollment)) return 'none';
  return enrollment.status === 'completed' ? 'completed' : 'active';
}

/**
 * Seznam projektů na přehledu s přepínačem aktivního projektu (ADR 002). Přepnutí jen změní,
 * kterým projektem se řídí přehled, dílna a nákupy; postup ostatních projektů zůstává.
 * Nezačatý projekt se tlačítkem „Začít projekt“ zapíše a rovnou se stane aktivním.
 */
export function ProjectSwitcher({ activeProject }: { activeProject: ProjectDefinition }) {
  const { data: enrollments } = useEnrollments();
  const { start, switchTo, isPending, isError } = useSwitchProject();
  // Tlačítko přepnutého projektu zmizí; fokus se přesune na kartu, aby neskončil na <body>.
  const cardRef = useRef<HTMLDivElement>(null);
  if (projects.length < 2) return null;

  const focusCard = () => cardRef.current?.focus();

  return (
    <Card
      ref={cardRef}
      tabIndex={-1}
      aria-labelledby="vase-projekty"
      className="flex flex-col gap-3 outline-none"
    >
      <Kicker id="vase-projekty">Vaše projekty</Kicker>
      <p className="sr-only" aria-live="polite">
        Aktivní projekt: {activeProject.title}
      </p>
      <ul className="flex flex-col divide-y divide-dashed divide-line">
        {projects.map((project) => {
          const enrollment = enrollments?.find((e) => e.projectSlug === project.slug);
          const status = statusOf(enrollment);
          const isActive = project.slug === activeProject.slug;
          return (
            <li
              key={project.slug}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
              aria-current={isActive ? 'true' : undefined}
            >
              <div className="min-w-0">
                <p className="kicker">
                  Projekt {project.code} ·{' '}
                  <span className={cn(isActive && 'text-cognac')}>
                    {isActive
                      ? status === 'completed'
                        ? 'Aktivní · hotový'
                        : 'Pracujete na něm'
                      : statusLabels[status]}
                  </span>
                </p>
                <Link
                  to={routes.project(project.slug)}
                  className="font-serif text-h2 font-medium no-underline"
                >
                  {project.title}
                </Link>
                <p className="text-meta text-ink-2">
                  {difficultyLabels[project.difficulty]} · {project.lessons.length} lekcí
                </p>
              </div>
              {isActive ? null : status === 'none' ? (
                <Button
                  variant="secondary"
                  aria-label={`Začít projekt ${project.title}`}
                  disabled={isPending}
                  onClick={() => {
                    void start(project).then((ok) => ok && focusCard());
                  }}
                >
                  Začít projekt
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  aria-label={`Přepnout na projekt ${project.title}`}
                  disabled={isPending}
                  onClick={() => {
                    switchTo(project);
                    focusCard();
                  }}
                >
                  Přepnout na tento projekt
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {isError ? (
        <p role="alert" className="text-meta text-cognac-deep">
          Projekt se nepodařilo založit. Zkuste to znovu.
        </p>
      ) : null}
    </Card>
  );
}
