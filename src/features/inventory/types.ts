import { type EquipmentStatus } from '@/content/schema';

/** Záznam inventáře (odpovídá tabulce `inventory_items`, IMPLEMENTATION.md §8). */
export interface InventoryItem {
  /** UUID generované klientem – offline upsert je idempotentní. */
  id: string;
  /** Vlastník; v Milníku 2 (lokální data bez účtu) `null`. */
  userId: string | null;
  equipmentSlug: string;
  status: EquipmentStatus;
  purchasePriceCents: number | null;
  currency: string;
  shopName: string | null;
  /** ISO datum (YYYY-MM-DD). */
  purchasedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Stav inventáře podle slugu vybavení. Chybějící položka = `want_to_buy`. */
export type InventoryState = Readonly<Record<string, InventoryItem>>;

export const DEFAULT_EQUIPMENT_STATUS: EquipmentStatus = 'want_to_buy';

export function getEquipmentStatus(inventory: InventoryState, slug: string): EquipmentStatus {
  return inventory[slug]?.status ?? DEFAULT_EQUIPMENT_STATUS;
}
