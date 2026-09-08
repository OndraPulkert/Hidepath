import { Link, useParams } from 'react-router';

import { routes } from '@/app/routes';
import { MediaSlot } from '@/components/lessons/media-slot';
import { AssembledIllustration } from '@/components/illustrations/assembled';
import { TemplateIllustration } from '@/components/illustrations/template';
import { LessonList } from '@/components/projects/lesson-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { LoadingNotice } from '@/components/ui/loading-notice';
import { equipmentCatalog } from '@/content/equipment';
import { difficultyLabels, findProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { getEquipmentStatus } from '@/features/inventory/types';
import { findCurrentLesson } from '@/features/progress/lesson-availability';
import { useProjectState } from '@/features/projects/use-project-state';
import { NotFoundPage } from '@/pages/not-found-page';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

export function ProjectPage() {
  const { projectSlug = '' } = useParams<'projectSlug'>();
  const project = findProject(projectSlug);
  if (!project) return <NotFoundPage />;
  return <ProjectView project={project} />;
}

function ProjectView({ project }: { project: ProjectDefinition }) {
  const { journey, readiness, inventory, isLoading } = useProjectState(project);
  if (isLoading) return <LoadingNotice />;
  const current = findCurrentLesson(journey.lessonViews);
  const lessonPhases = journey.phases.filter((p) => p.kind === 'lessons');

  return (
    <>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8">
        {project.media[0] ? (
          <MediaSlot media={project.media[0]} template={project.template} aspect="auto" />
        ) : null}

        <div className="flex flex-col gap-5">
          <div>
            <Kicker className="mb-1.5">Projekt {project.code}</Kicker>
            <h1 className="text-[clamp(32px,4.5vw,48px)]">{project.title}</h1>
            <p className="mt-3 max-w-prose text-body-lg text-ink-2">{project.description}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="kicker">Obtížnost</dt>
              <dd className="font-serif text-h2 font-medium">
                {difficultyLabels[project.difficulty]}
              </dd>
            </div>
            <div>
              <dt className="kicker">Čas výroby</dt>
              <dd className="font-serif text-h2 font-medium">
                {project.estimatedHours.min}–{project.estimatedHours.max}\u00a0hodin
              </dd>
            </div>
            <div>
              <dt className="kicker">Vybavení</dt>
              <dd className="font-serif text-h2 font-medium">
                {readiness.owned} / {readiness.total}
              </dd>
            </div>
          </dl>
          <div>
            <Kicker className="mb-2">Naučíte se</Kicker>
            <ul className="flex flex-wrap gap-2">
              {project.skills.map((s) => (
                <li
                  key={s}
                  className="rounded-control border border-line bg-paper px-3 py-1.5 text-meta font-medium"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            {current ? (
              <Button asChild>
                <Link
                  to={routes.lesson(project.slug, current.slug)}
                  className="text-white no-underline hover:text-white"
                >
                  {current.status === 'in_progress' ? 'Pokračovat lekcí' : 'Začít lekci'}{' '}
                  {current.order}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link to={routes.shopping} className="no-underline">
                  Doplnit vybavení
                </Link>
              </Button>
            )}
            <Button variant="secondary" asChild>
              <Link to={routes.template(project.slug)} className="no-underline">
                Vytisknout šablonu 1:1
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <a href="#vybaveni" className="no-underline">
                Potřebné vybavení
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8">
        <section aria-labelledby="faze">
          <h2 id="faze" className="mb-4 text-[26px]">
            Fáze projektu
          </h2>
          {lessonPhases.map((phase) => (
            <div key={phase.slug} className="mb-6">
              <Kicker className="mb-1">{phase.name}</Kicker>
              <LessonList project={project} views={phase.lessons} />
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <Kicker>Šablona 1:1</Kicker>
            <TemplateIllustration template={project.template} title={`Šablona: ${project.title}`} />
            <ul className="flex flex-col gap-1 text-meta text-ink-2">
              <li>
                <span
                  aria-hidden
                  className="mr-2 inline-block w-6 border-t border-leather align-middle"
                />
                plná čára = obrys dílu, řežte podle ní
              </li>
              <li>
                <span
                  aria-hidden
                  className="mr-2 inline-block w-6 border-t border-dashed border-cognac align-middle"
                />
                čárkovaná = linie stehu, neřezat (rýsuje se na kůži)
              </li>
            </ul>
            <p className="text-meta text-ink-2">{typo(project.template.printNote)}</p>
            <Kicker className="mt-2">Jak vypadá sestavené</Kicker>
            <AssembledIllustration
              template={project.template}
              title={`Schéma hotového pouzdra: ${project.title}`}
            />
          </Card>

          <Card id="vybaveni" className="flex scroll-mt-24 flex-col gap-2">
            <Kicker>Potřebné vybavení</Kicker>
            <ul className="divide-y divide-dashed divide-line">
              {project.equipment.map((req) => {
                const status = getEquipmentStatus(inventory, req.equipmentSlug);
                const name = equipmentCatalog[req.equipmentSlug]?.name ?? req.equipmentSlug;
                return (
                  <li
                    key={req.equipmentSlug}
                    className="flex items-center justify-between gap-3 py-2 text-body"
                  >
                    <Link
                      to={routes.shoppingItem(req.equipmentSlug)}
                      className={cn(
                        'inline-flex min-h-touch items-center text-leather no-underline hover:text-cognac',
                        status !== 'owned' && 'text-ink-2',
                      )}
                    >
                      {name}
                    </Link>
                    <span
                      className={cn(
                        'text-meta font-bold',
                        status === 'owned' && 'text-forest',
                        status === 'ordered' && 'text-brass',
                        status === 'want_to_buy' &&
                          (req.priority === 'required' ? 'text-cognac-deep' : 'text-ink-2'),
                      )}
                    >
                      {status === 'owned'
                        ? 'mám'
                        : status === 'ordered'
                          ? 'objednáno'
                          : req.priority === 'required'
                            ? 'chybí'
                            : req.priority === 'later'
                              ? 'až později'
                              : 'chybí · volitelné'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
