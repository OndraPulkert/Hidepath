import {
  type EquipmentPriority,
  type EquipmentRequirement,
  type EquipmentStatus,
  type ProjectDefinition,
} from '@/content/schema';
import { getEquipmentStatus, type InventoryState } from '@/features/inventory/types';

/** Připravenost: jen `owned` se počítá. `ordered` je na cestě, `want_to_buy` chybí. */
export function isEquipmentReady(status: EquipmentStatus): status is 'owned' {
  return status === 'owned';
}

export interface PriorityReadiness {
  total: number;
  owned: number;
  ordered: number;
  wantToBuy: number;
  /** Slugy položek, které nejsou `owned`. */
  missing: readonly string[];
  /** owned / total (tmavá část progress baru). */
  ownedRatio: number;
  /** ordered / total (světlejší část progress baru). */
  orderedRatio: number;
}

export interface EquipmentReadiness {
  total: number;
  owned: number;
  ordered: number;
  wantToBuy: number;
  /** owned / total – pro progress bar (tmavá část). */
  ownedRatio: number;
  /** ordered / total – světlejší část progress baru. */
  orderedRatio: number;
  byPriority: Record<EquipmentPriority, PriorityReadiness>;
  /** Jen nezbytné položky rozhodují o připravenosti projektu. */
  requiredReady: boolean;
}

function summarize(
  items: readonly EquipmentRequirement[],
  inventory: InventoryState,
): PriorityReadiness {
  const result = {
    total: items.length,
    owned: 0,
    ordered: 0,
    wantToBuy: 0,
    missing: [] as string[],
  };
  for (const item of items) {
    const status = getEquipmentStatus(inventory, item.equipmentSlug);
    if (status === 'owned') result.owned += 1;
    else {
      result.missing.push(item.equipmentSlug);
      if (status === 'ordered') result.ordered += 1;
      else result.wantToBuy += 1;
    }
  }
  return {
    ...result,
    ownedRatio: result.total === 0 ? 1 : result.owned / result.total,
    orderedRatio: result.total === 0 ? 0 : result.ordered / result.total,
  };
}

export function computeEquipmentReadiness(
  project: Pick<ProjectDefinition, 'equipment'>,
  inventory: InventoryState,
): EquipmentReadiness {
  const byPriority: Record<EquipmentPriority, PriorityReadiness> = {
    required: summarize(
      project.equipment.filter((e) => e.priority === 'required'),
      inventory,
    ),
    recommended: summarize(
      project.equipment.filter((e) => e.priority === 'recommended'),
      inventory,
    ),
    later: summarize(
      project.equipment.filter((e) => e.priority === 'later'),
      inventory,
    ),
  };
  const all = summarize(project.equipment, inventory);
  return {
    total: all.total,
    owned: all.owned,
    ordered: all.ordered,
    wantToBuy: all.wantToBuy,
    ownedRatio: all.ownedRatio,
    orderedRatio: all.orderedRatio,
    byPriority,
    requiredReady: byPriority.required.missing.length === 0,
  };
}
