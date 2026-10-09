import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import { routes } from '@/app/routes';
import { BeltStartCard } from '@/components/belt/belt-start-card';
import { GlossaryCard } from '@/components/glossary/glossary-card';
import { MediaSlot } from '@/components/lessons/media-slot';
import { ProjectFindings } from '@/components/notebook/project-findings';
import { AssembledIllustration } from '@/components/illustrations/assembled';
import { TEMPLATE_LEGEND, TemplateIllustration } from '@/components/illustrations/template';
import { LessonList } from '@/components/projects/lesson-list';
import { PatternSheetList } from '@/components/projects/pattern-sheet-list';
import { ProjectOverviewCard } from '@/components/projects/project-overview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { LoadingNotice } from '@/components/ui/loading-notice';
import { equipmentCatalog } from '@/content/equipment';
import { difficultyLabels, findProject } from '@/content/projects';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { type ProjectDefinition } from '@/content/schema';
import { isBeltConfigProject } from '@/features/belt/active-belt';
import { getEquipmentStatus } from '@/features/inventory/types';
import { hasOverview } from '@/features/overview/project-overview';
import { findCurrentLesson } from '@/features/progress/lesson-availability';
import { useActiveProject } from '@/features/projects/use-active-project';
import { useProjectState } from '@/features/projects/use-project-state';
import { useSwitchProject } from '@/features/projects/use-switch-project';
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
  const { journey, readiness, inventory, isLoading, enrollment } = useProjectState(project);
  const activeProject = useActiveProject();
  const { start, switchTo, isPending, isError } = useSwitchProject();
  const { hash } = useLocation();
  // Kotva v adrese (#dily-a-zkratky, #postup-v-kostce z lekce): posunout na ni až po načtení dat.
  useEffect(() => {
    if (!hash || isLoading) return;
    document
      .getElementById(decodeURIComponent(hash.slice(1)))
      ?.scrollIntoView?.({ block: 'start' });
  }, [hash, isLoading]);
  if (isLoading) return <LoadingNotice />;
  const isActive = activeProject.slug === project.slug;
  const current = findCurrentLesson(journey.lessonViews);
  const lessonPhases = journey.phases.filter((p) => p.kind === 'lessons');

  return (
    <>
      {isBeltConfigProject(project) ? <BeltStartCard project={project} className="mb-8" /> : null}
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
                {project.estimatedHours.min}–{project.estimatedHours.max}&nbsp;hodin
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
          {isActive ? null : (
            <div className="flex flex-col gap-2 rounded-card border border-dashed border-line p-4">
              <p className="text-body text-ink-2">
                {enrollment
                  ? 'Přehled, dílna a nákupy teď ukazují jiný projekt.'
                  : 'Tento projekt ještě nemáte založený. Přehled, dílna a nákupy teď ukazují jiný projekt.'}
              </p>
              <div>
                <Button
                  disabled={isPending}
                  onClick={() => {
                    if (enrollment) switchTo(project);
                    else void start(project);
                  }}
                >
                  {enrollment ? 'Pracovat na tomto projektu' : 'Začít tento projekt'}
                </Button>
              </div>
              {isError ? (
                <p role="alert" className="text-meta text-cognac-deep">
                  Projekt se nepodařilo založit. Zkuste to znovu.
                </p>
              ) : null}
            </div>
          )}
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
            ) : journey.totalLessons > 0 && journey.completedLessons === journey.totalLessons ? (
              <Button asChild>
                <Link to={routes.dashboard} className="text-white no-underline hover:text-white">
                  {isActive ? 'Dokončit projekt na přehledu' : 'Všechny lekce hotové'}
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
              <Link
                to={
                  isBeltConfigProject(project)
                    ? routes.beltConfig(project.slug)
                    : routes.template(project.slug)
                }
                className="no-underline"
              >
                {project.template
                  ? 'Vytisknout šablonu 1:1'
                  : isBeltConfigProject(project)
                    ? 'Váš pásek a listy A4'
                    : 'Vytisknout listy střihu 1:1'}
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

      {hasOverview(project) ? <ProjectOverviewCard project={project} className="mt-10" /> : null}

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
          <ProjectFindings project={project} />
          {project.glossary ? <GlossaryCard glossary={project.glossary} /> : null}
          {project.template ? (
            <Card className="flex flex-col gap-3">
              <Kicker>Šablona 1:1</Kicker>
              <TemplateIllustration
                template={project.template}
                title={`Šablona: ${project.title}`}
              />
              <ul className="flex flex-col gap-1 text-meta text-ink-2">
                <li>
                  <span
                    aria-hidden
                    className="mr-2 inline-block w-6 border-t border-leather align-middle"
                  />
                  {TEMPLATE_LEGEND.outline}
                </li>
                <li>
                  <span
                    aria-hidden
                    className="mr-2 inline-block w-6 border-t border-dashed border-cognac align-middle"
                  />
                  {TEMPLATE_LEGEND.stitch}
                </li>
                {project.template.glueBandMm ? (
                  <li>
                    <span
                      aria-hidden
                      className="mr-2 inline-block w-6 border-t-2 border-dotted border-ink-2 align-middle"
                    />
                    {TEMPLATE_LEGEND.glue}
                  </li>
                ) : null}
                <li>
                  <span
                    aria-hidden
                    className="mr-2 inline-block h-3 w-6 border-l border-leather align-middle"
                  />
                  {TEMPLATE_LEGEND.tick}
                </li>
                <li>
                  <span aria-hidden className="mr-2 inline-flex w-6 justify-center align-middle">
                    <span className="inline-block size-2 rounded-full border border-leather" />
                  </span>
                  {TEMPLATE_LEGEND.prick}
                </li>
                <li>
                  <span aria-hidden className="mr-2 inline-flex w-6 justify-center align-middle">
                    <span className="inline-block size-2 rounded-full border border-cognac" />
                  </span>
                  {TEMPLATE_LEGEND.punch}
                </li>
              </ul>
              <p className="text-meta text-ink-2">{typo(project.template.printNote)}</p>
              <Kicker className="mt-2">Jak vypadá sestavené</Kicker>
              <AssembledIllustration
                template={project.template}
                title={`Schéma hotového pouzdra: ${project.title}`}
              />
            </Card>
          ) : null}
          {project.patternSheets ? (
            <Card className="flex flex-col gap-3">
              <Kicker>Listy střihu</Kicker>
              <PatternSheetList
                sheets={project.patternSheets.sheets}
                urls={patternSheetUrlsFor(project.slug)}
              />
              <p className="text-meta text-ink-2">{typo(project.patternSheets.printNote)}</p>
              {project.patternSheets.variantsNote ? (
                <p className="text-meta text-ink-2">{typo(project.patternSheets.variantsNote)}</p>
              ) : null}
            </Card>
          ) : null}

          {project.practiceSheets ? (
            <Card className="flex flex-col gap-3">
              <Kicker>Cvičné listy</Kicker>
              <PatternSheetList
                sheets={project.practiceSheets.sheets}
                urls={patternSheetUrlsFor(project.slug)}
              />
              <p className="text-meta text-ink-2">{typo(project.practiceSheets.printNote)}</p>
              <Button variant="secondary" asChild className="self-start">
                <Link to={routes.practiceSheets(project.slug)} className="no-underline">
                  Vytisknout cvičné listy 1:1
                </Link>
              </Button>
            </Card>
          ) : null}

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
                      to={routes.shoppingItem(req.equipmentSlug, project.slug)}
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
