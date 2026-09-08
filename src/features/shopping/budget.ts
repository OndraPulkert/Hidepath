import {
  type EquipmentCatalog,
  type EquipmentDefinition,
  type EquipmentPriority,
  type ProjectDefinition,
} from '@/content/schema';
import { getEquipmentStatus, type InventoryState } from '@/features/inventory/types';

/** Orientační cena položky = střed rozsahu zaokrouhlený na desetikoruny. */
export function estimatedPriceCents(definition: Pick<EquipmentDefinition, 'priceRange'>): number {
  const mid = (definition.priceRange.minCents + definition.priceRange.maxCents) / 2;
  return Math.round(mid / 1000) * 1000;
}

export interface BudgetLine {
  equipmentSlug: string;
  priority: EquipmentPriority;
  status: 'want_to_buy' | 'ordered';
  /** Orientační cena, nebo skutečná cena, pokud ji uživatel u objednané položky zadal. */
  estimatedCents: number;
  source: 'estimate' | 'recorded';
}

export interface RemainingBudget {
  /** Součet za položky, které nejsou `owned` (včetně objednaných). */
  totalCents: number;
  requiredCents: number;
  recommendedCents: number;
  laterCents: number;
  /** Část z totalCents, která připadá na objednané položky – v UI označit „objednáno“. */
  orderedCents: number;
  lines: readonly BudgetLine[];
}

/**
 * Zbývající rozpočet (IMPLEMENTATION.md §9): součet orientačních cen položek, které nejsou
 * `owned`. Objednaná položka v nákladech zůstává a je označená; má-li zadanou skutečnou cenu,
 * počítá se ta místo odhadu.
 */
export function computeRemainingBudget(
  project: Pick<ProjectDefinition, 'equipment'>,
  catalog: EquipmentCatalog,
  inventory: InventoryState,
): RemainingBudget {
  const lines: BudgetLine[] = [];
  for (const req of project.equipment) {
    const status = getEquipmentStatus(inventory, req.equipmentSlug);
    if (status === 'owned') continue;
    const item = inventory[req.equipmentSlug];
    const def = catalog[req.equipmentSlug];
    if (!def) {
      if (import.meta.env.DEV)
        console.error(`[budget] položka ${req.equipmentSlug} není v katalogu`);
      continue;
    }
    const recorded = status === 'ordered' ? item?.purchasePriceCents : null;
    lines.push({
      equipmentSlug: req.equipmentSlug,
      priority: req.priority,
      status,
      estimatedCents: recorded ?? estimatedPriceCents(def),
      source: recorded != null ? 'recorded' : 'estimate',
    });
  }
  const sum = (pred: (l: BudgetLine) => boolean) =>
    lines.filter(pred).reduce((s, l) => s + l.estimatedCents, 0);
  return {
    totalCents: sum(() => true),
    requiredCents: sum((l) => l.priority === 'required'),
    recommendedCents: sum((l) => l.priority === 'recommended'),
    laterCents: sum((l) => l.priority === 'later'),
    orderedCents: sum((l) => l.status === 'ordered'),
    lines,
  };
}

export interface RecordedCosts {
  ownedCount: number;
  /** Součet zadaných skutečných cen u vlastněných položek. */
  recordedCents: number;
  /** Počet vlastněných položek bez zadané ceny. */
  withoutPriceCount: number;
  /** „Evidované náklady“ když ceny chybí, „Investováno“ jen když jsou úplné. */
  label: 'Evidované náklady' | 'Investováno';
}

export function computeRecordedCosts(inventory: InventoryState): RecordedCosts {
  const owned = Object.values(inventory).filter((i) => i.status === 'owned');
  const withPrice = owned.filter((i) => i.purchasePriceCents != null);
  const withoutPriceCount = owned.length - withPrice.length;
  return {
    ownedCount: owned.length,
    recordedCents: withPrice.reduce((s, i) => s + (i.purchasePriceCents ?? 0), 0),
    withoutPriceCount,
    label: withoutPriceCount === 0 && owned.length > 0 ? 'Investováno' : 'Evidované náklady',
  };
}
