import {
  type EquipmentCatalog,
  type ProductExample,
  type ProjectDefinition,
  type ShoppingPlanLine,
} from '@/content/schema';
import { getEquipmentStatus, type InventoryState } from '@/features/inventory/types';

export interface ResolvedPlanLine {
  equipmentSlug: string;
  equipmentName: string;
  example: ProductExample;
  quantity: number;
  purpose?: string;
  lineCents: number;
  /** Položku už uživatel má – v součtu „zbývá koupit“ není. */
  owned: boolean;
}

export interface ShopGroup {
  shop: string;
  lines: readonly ResolvedPlanLine[];
  totalCents: number;
  remainingCents: number;
}

export interface ResolvedShoppingPlan {
  title: string;
  /** Obchody v pořadí podle první zmínky v plánu. */
  shops: readonly ShopGroup[];
  totalCents: number;
  remainingCents: number;
  /** Řádky, jejichž příklad byl při ověření vyprodaný nebo na objednávku. */
  notInStockCount: number;
  /** Nejstarší a nejnovější datum ověření cen v plánu (ISO). */
  checkedFrom: string;
  checkedTo: string;
  skipped: readonly { equipmentSlug: string; equipmentName: string; reason: string }[];
}

/** Najde v katalogu příklad, na který řádek plánu odkazuje (URL + varianta). */
export function findPlanExample(
  line: ShoppingPlanLine,
  catalog: EquipmentCatalog,
): ProductExample | undefined {
  const matches = (catalog[line.equipmentSlug]?.examples ?? []).filter(
    (e) => e.url === line.url && e.variant === line.variant,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * „Co koupit“: nákupní plán projektu rozpadnutý po obchodech, s cenami z ověřených příkladů
 * v katalogu. Vrací `null`, když projekt plán nemá. Řádek bez dohledatelného příkladu je chyba
 * obsahu (hlídá ji test) – v aplikaci se jen vynechá.
 */
export function resolveShoppingPlan(
  project: Pick<ProjectDefinition, 'shoppingPlan'>,
  catalog: EquipmentCatalog,
  inventory: InventoryState,
): ResolvedShoppingPlan | null {
  const plan = project.shoppingPlan;
  if (!plan) return null;
  const byShop = new Map<string, ResolvedPlanLine[]>();
  for (const line of plan.lines) {
    const example = findPlanExample(line, catalog);
    if (!example) {
      if (import.meta.env.DEV)
        console.error(`[plan] ${line.equipmentSlug}: příklad ${line.url} není v katalogu`);
      continue;
    }
    const resolved: ResolvedPlanLine = {
      equipmentSlug: line.equipmentSlug,
      equipmentName: catalog[line.equipmentSlug]?.name ?? line.equipmentSlug,
      example,
      quantity: line.quantity,
      ...(line.purpose ? { purpose: line.purpose } : {}),
      lineCents: example.priceCents * line.quantity,
      owned: getEquipmentStatus(inventory, line.equipmentSlug) === 'owned',
    };
    byShop.set(example.shop, [...(byShop.get(example.shop) ?? []), resolved]);
  }
  const shops: ShopGroup[] = [...byShop].map(([shop, lines]) => ({
    shop,
    lines,
    totalCents: lines.reduce((s, l) => s + l.lineCents, 0),
    remainingCents: lines.filter((l) => !l.owned).reduce((s, l) => s + l.lineCents, 0),
  }));
  const all = shops.flatMap((s) => s.lines);
  const dates = all.map((l) => l.example.checkedAt).sort();
  return {
    title: plan.title,
    shops,
    totalCents: shops.reduce((s, g) => s + g.totalCents, 0),
    remainingCents: shops.reduce((s, g) => s + g.remainingCents, 0),
    notInStockCount: all.filter((l) => l.example.availability !== 'in_stock').length,
    checkedFrom: dates[0] ?? '',
    checkedTo: dates.at(-1) ?? '',
    skipped: plan.skipped.map((s) => ({
      ...s,
      equipmentName: catalog[s.equipmentSlug]?.name ?? s.equipmentSlug,
    })),
  };
}
