import { type EquipmentDefinition } from '@/content/schema';
import { formatCzkRange } from '@/lib/utils/format';

export const priceSourceLabels: Record<EquipmentDefinition['priceSource'], string> = {
  verified: 'ověřený rozsah',
  estimate: 'odhad',
  unknown: 'před nákupem zjistit',
};

/** Cena do řádku položky; neověřená cena se neukazuje jako „0 Kč“. */
export function formatPriceRange(
  definition: Pick<EquipmentDefinition, 'priceRange' | 'priceSource'>,
): string {
  if (definition.priceSource === 'unknown') return 'Cena neověřena';
  return formatCzkRange(definition.priceRange.minCents, definition.priceRange.maxCents);
}
