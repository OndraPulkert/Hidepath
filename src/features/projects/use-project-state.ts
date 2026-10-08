import { useMemo } from 'react';

import { equipmentCatalog } from '@/content/equipment';
import { type ProjectDefinition } from '@/content/schema';
import { isBeltConfigProject as hasBeltConfig } from '@/features/belt/active-belt';
import { type BeltPlanView, beltPlanView } from '@/features/belt/belt-shopping';
import { useDataContext } from '@/features/data/data-provider';
import { computeEquipmentReadiness, type EquipmentReadiness } from '@/features/inventory/readiness';
import { type InventoryState } from '@/features/inventory/types';
import { useInventory } from '@/features/inventory/use-inventory';
import { computeJourney, type JourneyProgress } from '@/features/progress/journey';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { computeNextAction, type NextAction } from '@/features/progress/next-action';
import {
  EMPTY_PROGRESS,
  type EnrollmentRecord,
  isEnrolled,
  type ProgressState,
} from '@/features/progress/types';
import { useEnrollment, useProgress } from '@/features/progress/use-progress';
import {
  computeRecordedCosts,
  computeRemainingBudget,
  type RecordedCosts,
  type RemainingBudget,
} from '@/features/shopping/budget';

export interface ProjectState {
  /** Data ještě nejsou načtená (nebo probíhá přenos do účtu) – UI nemá zobrazovat ani měnit hodnoty. */
  isLoading: boolean;
  enrollment: EnrollmentRecord | null;
  inventory: InventoryState;
  progress: ProgressState;
  readiness: EquipmentReadiness;
  journey: JourneyProgress;
  nextAction: NextAction;
  budget: RemainingBudget;
  costs: RecordedCosts;
  /**
   * Pásek: nákup podle uloženého pásku (jako „Připravte si“), jinak plán projektu 40 mm.
   * Z něj je „Co koupit“ i rozpočet. `null` u ostatních projektů.
   */
  beltPlan: BeltPlanView | null;
}

/** Projekt, jehož nákup se řídí sestavou pásku z „Váš pásek“. */
const isBeltConfigProject = (project: ProjectDefinition): boolean =>
  hasBeltConfig(project) && project.shoppingPlan !== undefined;

/**
 * Jediný view model projektu: načte data a spočítá vše přes sdílené doménové funkce.
 * Komponenty z něj jen čtou; žádná z nich nepočítá připravenost, zámky ani postup sama.
 */
export function useProjectState(project: ProjectDefinition): ProjectState {
  const inventoryQuery = useInventory();
  const progressQuery = useProgress(project.slug);
  const { enrollment, isLoading: enrollmentLoading } = useEnrollment(project.slug);
  const { migration } = useDataContext();
  const isBelt = isBeltConfigProject(project);
  const recordsQuery = useLessonRecords(project.slug);
  const recordsData = isBelt ? recordsQuery.data : undefined;

  const inventoryData = inventoryQuery.data;
  const progressData = progressQuery.data;
  const isLoading =
    inventoryQuery.isLoading ||
    progressQuery.isLoading ||
    enrollmentLoading ||
    (isBelt && recordsQuery.isLoading) ||
    migration.status === 'running';

  return useMemo(() => {
    const inventory = inventoryData ?? {};
    const progress = progressData ?? EMPTY_PROGRESS;
    const readiness = computeEquipmentReadiness(project, inventory);
    const journey = computeJourney(project, { enrollment, inventory, progress });
    const beltPlan =
      isBelt && project.shoppingPlan
        ? beltPlanView(project.shoppingPlan, recordsData ?? [], project.slug, equipmentCatalog)
        : null;
    return {
      isLoading,
      enrollment,
      inventory,
      progress,
      readiness,
      journey,
      nextAction: computeNextAction(project, journey, readiness, isEnrolled(enrollment)),
      budget: computeRemainingBudget(project, equipmentCatalog, inventory, beltPlan?.budgetPrices),
      costs: computeRecordedCosts(inventory),
      beltPlan,
    };
  }, [project, inventoryData, progressData, enrollment, isLoading, isBelt, recordsData]);
}
