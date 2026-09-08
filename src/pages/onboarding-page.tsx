import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { MediaSlot } from '@/components/lessons/media-slot';
import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { difficultyLabels } from '@/content/projects';
import { type EquipmentStatus } from '@/content/schema';
import { useInventory, useUpdateInventoryItem } from '@/features/inventory/use-inventory';
import { buildLoginUrl } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';
import { useEnrollment, useEnrollProject } from '@/features/progress/use-progress';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/**
 * Onboarding: 1) výběr projektu, 2) „Co už máte doma?“ – běžné věci se rovnou označí jako Mám.
 * Bez horní navigace. Po dokončení vznikne zápis do projektu a jde se na přehled.
 */
export function OnboardingPage() {
  const project = cardHolderProject;
  const navigate = useNavigate();
  const { enrollment, isLoading } = useEnrollment(project.slug);
  const { session, authAvailable } = useSession();
  const [step, setStep] = useState<1 | 2>(1);
  const [previousStatus, setPreviousStatus] = useState<Record<string, EquipmentStatus>>({});
  const inventory = useInventory();
  const updateItem = useUpdateInventoryItem();
  const enroll = useEnrollProject();

  const canEnterApp = !authAvailable || session.status === 'authenticated';
  if (!isLoading && enrollment && canEnterApp) return <Navigate to={routes.dashboard} replace />;

  const homeItems = project.equipment
    .map((req) => equipmentCatalog[req.equipmentSlug])
    .filter((d): d is NonNullable<typeof d> => Boolean(d?.commonlyAtHome));
  const ownedCount = homeItems.filter((d) => inventory.data?.[d.slug]?.status === 'owned').length;

  const finish = async () => {
    await enroll.mutateAsync({ projectSlug: project.slug, contentVersion: project.contentVersion });
    // Bez účtu je výběr uložený v prohlížeči; po přihlášení se přenese do účtu.
    const needsLogin = authAvailable && session.status !== 'authenticated';
    await navigate(needsLogin ? buildLoginUrl(routes.login, routes.dashboard) : routes.dashboard, {
      replace: true,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[920px] flex-1 animate-hp-in px-page pt-[clamp(16px,3vw,40px)] pb-24">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <Brand asText />
          <Kicker className="tracking-[0.06em]">Krok {step} ze 2</Kicker>
        </div>

        {step === 1 ? (
          <>
            <h1 className="mb-3 text-[clamp(32px,4.5vw,48px)]">
              Vyrobíte si první kožený výrobek. Krok za krokem, od nákupu po poslední steh.
            </h1>
            <p className="mb-9 max-w-[60ch] text-lead text-ink-2">
              Nepotřebujete žádné zkušenosti ani nástroje. Hidepath vám řekne, co přesně koupit, jak
              si připravit stůl a co udělat právě teď.
            </p>
            <h2 className="mb-3.5 text-h2">Vyberte první projekt</h2>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex flex-col gap-3 rounded-card border border-cognac/50 bg-paper p-4 text-left text-leather transition-colors hover:border-cognac focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac"
              >
                {project.media[0] ? (
                  <MediaSlot
                    media={project.media[0]}
                    template={project.template}
                    aspect="photo"
                    className="aspect-[16/10]"
                  />
                ) : null}
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-[21px] font-medium">{project.title}</span>
                  <span className="rounded-control bg-forest-tint px-2.5 py-1 text-[12px] font-bold text-forest">
                    Doporučeno
                  </span>
                </span>
                <dl className="grid grid-cols-3 gap-2 text-meta text-ink-2">
                  <div>
                    <dt className="text-[11px] tracking-[0.06em] uppercase">Obtížnost</dt>
                    <dd className="font-semibold text-leather">
                      {difficultyLabels[project.difficulty]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.06em] uppercase">Čas</dt>
                    <dd className="font-semibold text-leather">
                      {project.estimatedHours.min}–{project.estimatedHours.max} h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.06em] uppercase">Lekce</dt>
                    <dd className="font-semibold text-leather">{project.lessons.length}</dd>
                  </div>
                </dl>
              </button>
              <Card
                className="flex flex-col justify-center gap-2 border-dashed text-ink-2"
                tone="dashed"
              >
                <span className="font-serif text-[21px] font-medium text-ink-2">
                  Další projekty
                </span>
                <p className="text-body">
                  Klíčenka a peněženka přijdou, až bude pouzdro na karty ověřené prvními uživateli.
                </p>
              </Card>
            </div>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-[clamp(30px,4vw,42px)]">Co už máte doma?</h1>
            <p className="mb-7 max-w-[60ch] text-body-lg text-ink-2">
              Tyto věci se běžně najdou v domácnosti. Označte, co máte, a nákupní seznam se o to
              zkrátí. Cokoliv jde později změnit.
            </p>
            <ul className="mb-8 grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-3">
              {homeItems.map((d) => {
                const current = inventory.data?.[d.slug]?.status;
                const owned = current === 'owned';
                // Odkliknutí vrátí předchozí stav (např. Objednáno), ne vždy „Chci koupit“.
                const revertTo = previousStatus[d.slug] ?? 'want_to_buy';
                return (
                  <li key={d.slug}>
                    <button
                      type="button"
                      aria-pressed={owned}
                      onClick={() => {
                        if (!owned)
                          setPreviousStatus((prev) => ({
                            ...prev,
                            [d.slug]: current ?? 'want_to_buy',
                          }));
                        updateItem.mutate({
                          equipmentSlug: d.slug,
                          patch: { status: owned ? revertTo : 'owned' },
                        });
                      }}
                      className={cn(
                        'flex min-h-touch w-full items-center gap-3 rounded-md border bg-paper p-3 text-left transition-colors hover:border-cognac',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac',
                        owned ? 'border-forest' : 'border-line',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'inline-flex size-7 shrink-0 items-center justify-center rounded-control border-[1.5px] text-[15px] font-bold',
                          owned
                            ? 'border-forest bg-forest text-white'
                            : 'border-line-strong bg-paper',
                        )}
                      >
                        {owned ? '✓' : ''}
                      </span>
                      <span>
                        <span className="block text-body font-semibold">{d.name}</span>
                        <span className="block text-meta text-ink-2">
                          {typo(d.shortDescription)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => void finish()} disabled={enroll.isPending}>
                {authAvailable && session.status !== 'authenticated'
                  ? 'Připravit můj plán a přihlásit se'
                  : 'Připravit můj plán'}
              </Button>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Zpět
              </Button>
              <span className="text-meta text-ink-2">
                Máte {ownedCount} z {homeItems.length} běžných věcí
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
