import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { MediaSlot } from '@/components/lessons/media-slot';
import { PhaseRail } from '@/components/projects/phase-rail';
import { Button } from '@/components/ui/button';
import { Card, CardDashedDecor } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { LoadingNotice } from '@/components/ui/loading-notice';
import { ProgressBar } from '@/components/ui/progress-bar';
import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { difficultyLabels } from '@/content/projects';
import { type NextAction } from '@/features/progress/next-action';
import { useCompleteProject } from '@/features/progress/use-progress';
import { useProjectState } from '@/features/projects/use-project-state';
import { formatCzk, formatPercent, pluralizeCs, typo } from '@/lib/utils/format';

export function DashboardPage() {
  const project = cardHolderProject;
  const state = useProjectState(project);
  const completeProject = useCompleteProject();
  const { journey, readiness, budget, nextAction } = state;
  const phase = journey.currentPhase;

  if (state.isLoading) return <LoadingNotice />;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <Kicker className="mb-1.5">
            Projekt {project.code} · {project.title}
          </Kicker>
          <h1 className="text-[clamp(28px,3.5vw,40px)]">
            {nextAction.kind === 'project_completed' ? (
              <>Hotovo. Pouzdro je vaše.</>
            ) : (
              <>
                Dobrý den. Jste ve fázi <em className="text-cognac">{phase.name}</em>.
              </>
            )}
          </h1>
        </div>
        <dl className="flex flex-wrap gap-7">
          <div>
            <dt className="kicker">Celá cesta</dt>
            <dd className="font-serif text-[28px] leading-[1.1] font-medium">
              {formatPercent(journey.overallRatio)}
            </dd>
            <dd className="text-[12px] text-ink-2">
              fáze {journey.currentPhaseNumber} ze {journey.phases.length}
            </dd>
          </div>
          <div>
            <dt className="kicker">Aktuální fáze · {phase.name}</dt>
            <dd className="font-serif text-[28px] leading-[1.1] font-medium text-cognac">
              {formatPercent(phase.ratio)}
            </dd>
            <dd className="text-[12px] text-ink-2">{phase.detail}</dd>
          </div>
        </dl>
      </header>

      <div className="mb-7">
        <PhaseRail phases={journey.phases} />
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] items-stretch gap-4">
        <Card
          tone="leather"
          padding="lg"
          className="flex min-h-[300px] flex-col gap-4 lg:col-span-2 lg:row-span-2"
        >
          <CardDashedDecor />
          <NextActionContent
            action={nextAction}
            onCompleteProject={() => state.enrollment && completeProject.mutate(state.enrollment)}
          />
        </Card>

        <Link to={routes.shopping} className="no-underline hover:text-leather">
          <Card className="flex h-full flex-col gap-2.5 transition-colors hover:border-cognac">
            <Kicker>Vybavení</Kicker>
            <p className="font-serif text-stat font-medium">
              {readiness.owned}{' '}
              <span className="text-[18px] text-ink-2">z {readiness.total} položek připraveno</span>
            </p>
            <ProgressBar
              value={readiness.ownedRatio}
              secondary={readiness.orderedRatio}
              label="Připravenost vybavení"
              size="sm"
            />
            <p className="text-meta text-ink-2">
              {readiness.ordered} objednáno · {readiness.wantToBuy} k nákupu · nezbytné:{' '}
              {readiness.byPriority.required.owned} z {readiness.byPriority.required.total}
            </p>
          </Card>
        </Link>

        <Card className="flex flex-col gap-2.5">
          <Kicker>Orientační zbývající rozpočet</Kicker>
          <p className="font-serif text-stat font-medium">{formatCzk(budget.totalCents)}</p>
          <p className="text-meta text-ink-2">
            Nezbytné {formatCzk(budget.requiredCents)} · doporučené{' '}
            {formatCzk(budget.recommendedCents)}
            {budget.orderedCents > 0 ? ` · z toho objednáno ${formatCzk(budget.orderedCents)}` : ''}
          </p>
        </Card>

        <Link to={routes.project(project.slug)} className="no-underline hover:text-leather">
          <Card
            padding="none"
            className="flex h-full flex-col overflow-hidden transition-colors hover:border-cognac"
          >
            {project.media[0] ? (
              <MediaSlot
                media={project.media[0]}
                template={project.template}
                aspect="auto"
                className="rounded-none border-0 border-b"
              />
            ) : null}
            <div className="flex flex-col gap-1 px-5 pt-4 pb-5">
              <Kicker>První projekt</Kicker>
              <p className="font-serif text-h2 font-medium">{project.title}</p>
              <p className="text-meta text-ink-2">
                {difficultyLabels[project.difficulty]} · {project.estimatedHours.min}–
                {project.estimatedHours.max} h · {project.lessons.length} lekcí · šablona 1:1
              </p>
            </div>
          </Card>
        </Link>

        <Card className="flex flex-col gap-3">
          <Kicker>Kam dál</Kicker>
          <nav aria-label="Rychlé odkazy" className="flex flex-col gap-2">
            <QuickLink
              to={routes.shopping}
              label="Nákupní seznam"
              meta={`${readiness.wantToBuy} k nákupu`}
            />
            <QuickLink
              to={routes.workshop}
              label="Moje dílna"
              meta={pluralizeCs(readiness.owned, ['položka', 'položky', 'položek'])}
            />
            <QuickLink
              to={routes.project(project.slug)}
              label="Lekce"
              meta={`${journey.completedLessons} z ${journey.totalLessons} hotovo`}
            />
          </nav>
        </Card>
      </div>
    </>
  );
}

function NextActionContent({
  action,
  onCompleteProject,
}: {
  action: NextAction;
  onCompleteProject: () => void;
}) {
  const project = cardHolderProject;
  switch (action.kind) {
    case 'choose_project':
      return (
        <>
          <Kicker className="text-brass">Začínáme</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Vyberte si první projekt.
          </h2>
          <div className="relative mt-auto">
            <Button asChild>
              <Link to={routes.onboarding} className="text-white no-underline hover:text-white">
                Vybrat projekt
              </Link>
            </Button>
          </div>
        </>
      );
    case 'review_equipment':
      return (
        <>
          <Kicker className="text-brass">Co udělat právě teď</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Projděte si, co budete k pouzdru potřebovat.
          </h2>
          <p className="max-w-[52ch] text-body text-canvas-soft">
            Nákupní seznam rozdělí vybavení na nezbytné, doporučené a to, co stačí koupit později.
            Označte, co máte, a lekce se začnou odemykat.
          </p>
          <div className="relative mt-auto flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to={routes.shopping} className="text-white no-underline hover:text-white">
                Otevřít nákupní seznam
              </Link>
            </Button>
            <span className="text-meta text-canvas-muted">
              {pluralizeCs(action.missingRequired, [
                'nezbytná položka chybí',
                'nezbytné položky chybí',
                'nezbytných položek chybí',
              ])}
            </span>
          </div>
        </>
      );
    case 'continue_lesson': {
      const blocker = action.blockerAhead;
      const blockerName = blocker
        ? (equipmentCatalog[blocker.equipmentSlug]?.name ?? blocker.equipmentSlug)
        : null;
      return (
        <>
          <Kicker className="text-brass">Pokračovat, kde jste skončili</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Lekce {action.order}: {action.title}
          </h2>
          <p className="max-w-[52ch] text-body text-canvas-soft">{typo(action.goal)}</p>
          <div className="relative mt-auto flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link
                to={routes.lesson(project.slug, action.lessonSlug)}
                className="text-white no-underline hover:text-white"
              >
                Pokračovat lekcí {action.order}
              </Link>
            </Button>
            {blocker ? (
              <span className="text-meta text-canvas-muted">
                {blockerName}: {blocker.status === 'ordered' ? 'objednáno, na cestě' : 'chybí'} ·{' '}
                {blocker.status === 'ordered' ? 'po doručení' : 'po nákupu'} se odemkne lekce{' '}
                {blocker.unlocksLessonOrder}
              </span>
            ) : null}
          </div>
        </>
      );
    }
    case 'wait_for_equipment': {
      const first = action.missing[0];
      const name = first
        ? (equipmentCatalog[first.equipmentSlug]?.name ?? first.equipmentSlug)
        : '';
      return (
        <>
          <Kicker className="text-brass">Čeká se na vybavení</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Lekce {action.order} čeká na vybavení: {name}.
          </h2>
          <p className="max-w-[52ch] text-body text-canvas-soft">
            {first?.status === 'ordered'
              ? 'Všechny dostupné lekce máte hotové. Až zásilka dorazí, označte položku jako „Mám“ a další lekce se odemkne.'
              : 'Všechny dostupné lekce máte hotové. Další se odemkne, až budete mít tuto položku.'}
          </p>
          <div className="relative mt-auto flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link
                to={first ? routes.shoppingItem(first.equipmentSlug) : routes.shopping}
                className="text-white no-underline hover:text-white"
              >
                Otevřít položku
              </Link>
            </Button>
          </div>
        </>
      );
    }
    case 'complete_project':
      return (
        <>
          <Kicker className="text-brass">Poslední krok</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Všechny lekce máte hotové.
          </h2>
          <p className="max-w-[52ch] text-body text-canvas-soft">
            Prohlédněte si pouzdro, vložte karty a označte projekt za dokončený. Postup zůstane
            uložený.
          </p>
          <div className="relative mt-auto">
            <Button variant="forest" onClick={onCompleteProject}>
              Označit projekt za hotový
            </Button>
          </div>
        </>
      );
    case 'project_completed':
      return (
        <>
          <Kicker className="text-brass">Projekt dokončen</Kicker>
          <h2 className="max-w-[22ch] text-[clamp(26px,3vw,34px)] text-canvas">
            Máte za sebou celou cestu.
          </h2>
          <p className="max-w-[52ch] text-body text-canvas-soft">
            Další projekty přidáme, až bude pouzdro ověřené prvními uživateli. Lekce si můžete
            kdykoli projít znovu.
          </p>
          <div className="relative mt-auto">
            <Button
              variant="secondary"
              className="border-canvas/40 text-canvas hover:bg-canvas/10"
              asChild
            >
              <Link to={routes.project(project.slug)} className="no-underline">
                Zpět k lekcím
              </Link>
            </Button>
          </div>
        </>
      );
  }
}

function QuickLink({ to, label, meta }: { to: string; label: string; meta: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-touch items-center justify-between gap-3 rounded-control border border-line px-3.5 text-body font-medium text-leather no-underline hover:bg-parchment hover:text-leather"
    >
      <span>{label}</span>
      <span className="text-meta text-ink-2">{meta} →</span>
    </Link>
  );
}
