import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import {
  type EquipmentCatalog,
  type EquipmentDefinition,
  type ProductExample,
  projectDefinitionSchema,
} from '@/content/schema';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import { inventoryOf, item } from '@/test/factories';

const ex = (shop: string, url: string, priceCents: number, extra: Partial<ProductExample> = {}) =>
  ({
    title: url,
    shop,
    url,
    priceCents,
    availability: 'in_stock',
    checkedAt: '2026-09-29',
    ...extra,
  }) satisfies ProductExample;

const def = (slug: string, examples: ProductExample[]): EquipmentDefinition => ({
  slug,
  name: `Název ${slug}`,
  englishName: slug,
  category: 'cutting',
  shortDescription: 'x',
  purpose: 'x',
  buyingGuide: [],
  cautions: [],
  avoid: [],
  alternatives: [],
  priceRange: { minCents: 0, maxCents: 0 },
  priceSource: 'unknown',
  priceNote: 'x',
  alsoUsedFor: [],
  examples,
  commonlyAtHome: false,
  media: [],
  reviewStatus: 'draft',
});

const LEATHER = 'https://a.cz/kuze';
const catalog: EquipmentCatalog = {
  leather: def('leather', [
    ex('A', LEATHER, 25_100, { variant: 'A4' }),
    ex('A', LEATHER, 5_700, { variant: 'A5' }),
  ]),
  needles: def('needles', [ex('A', 'https://a.cz/jehly', 1_500, { checkedAt: '2026-09-07' })]),
  clamps: def('clamps', [ex('B', 'https://b.cz/sverky', 10_900, { availability: 'preorder' })]),
  beveler: def('beveler', []),
};

const project = {
  shoppingPlan: {
    title: 'Sestava',
    lines: [
      { equipmentSlug: 'leather', url: LEATHER, variant: 'A4', quantity: 1 },
      { equipmentSlug: 'clamps', url: 'https://b.cz/sverky', quantity: 1 },
      { equipmentSlug: 'leather', url: LEATHER, variant: 'A5', quantity: 2, purpose: 'trénink' },
      { equipmentSlug: 'needles', url: 'https://a.cz/jehly', quantity: 4 },
    ],
    skipped: [{ equipmentSlug: 'beveler', reason: 'tentokrát ne' }],
  },
};

describe('findPlanExample', () => {
  it('rozliší varianty pod stejnou URL a bez varianty nenajde nic', () => {
    expect(findPlanExample(project.shoppingPlan.lines[2]!, catalog)?.priceCents).toBe(5_700);
    expect(findPlanExample({ equipmentSlug: 'leather', url: LEATHER, quantity: 1 }, catalog)).toBe(
      undefined,
    );
    expect(
      findPlanExample({ equipmentSlug: 'needles', url: LEATHER, quantity: 1 }, catalog),
    ).toBeUndefined();
  });
});

describe('resolveShoppingPlan', () => {
  it('bez plánu vrátí null', () => {
    expect(resolveShoppingPlan({}, catalog, {})).toBeNull();
  });

  it('seskupí řádky po obchodech v pořadí první zmínky a sečte množství × cenu', () => {
    const plan = resolveShoppingPlan(project, catalog, {})!;
    expect(plan.shops.map((s) => s.shop)).toEqual(['A', 'B']);
    const a = plan.shops[0]!;
    expect(a.lines.map((l) => l.lineCents)).toEqual([25_100, 11_400, 6_000]);
    expect(a.totalCents).toBe(42_500);
    expect(plan.totalCents).toBe(53_400);
    expect(plan.remainingCents).toBe(53_400);
    expect(plan.notInStockCount).toBe(1);
    expect(plan.checkedFrom).toBe('2026-09-07');
    expect(plan.checkedTo).toBe('2026-09-29');
    expect(plan.skipped[0]!.equipmentName).toBe('Název beveler');
    expect(a.lines[1]!.purpose).toBe('trénink');
  });

  it('položku, kterou uživatel má, označí a do „zbývá koupit“ nepočítá', () => {
    const plan = resolveShoppingPlan(project, catalog, inventoryOf(item('needles', 'owned')))!;
    expect(plan.shops[0]!.lines.find((l) => l.equipmentSlug === 'needles')!.owned).toBe(true);
    expect(plan.totalCents).toBe(53_400);
    expect(plan.remainingCents).toBe(47_400);
  });

  it('volitelný řádek ukáže s cenou, ale do součtů ho nepočítá', () => {
    const plan = resolveShoppingPlan(
      {
        shoppingPlan: {
          ...project.shoppingPlan,
          lines: [
            ...project.shoppingPlan.lines,
            {
              equipmentSlug: 'leather',
              url: LEATHER,
              variant: 'A5',
              quantity: 1,
              optional: true as const,
              purpose: 'jen když',
            },
          ].filter((_, i) => i !== 2),
        },
      },
      catalog,
      {},
    )!;
    const optional = plan.shops[0]!.lines.find((l) => l.optional)!;
    expect(optional.lineCents).toBe(5_700);
    expect(plan.shops[0]!.totalCents).toBe(25_100 + 6_000);
    expect(plan.totalCents).toBe(25_100 + 6_000 + 10_900);
    expect(plan.remainingCents).toBe(plan.totalCents);
  });

  it('řádek bez příkladu v katalogu vynechá', () => {
    const plan = resolveShoppingPlan(
      {
        shoppingPlan: {
          ...project.shoppingPlan,
          lines: [{ equipmentSlug: 'needles', url: 'https://a.cz/neni', quantity: 1 }],
        },
      },
      catalog,
      {},
    )!;
    expect(plan.shops).toEqual([]);
    expect(plan.totalCents).toBe(0);
  });
});

describe('schéma nákupního plánu', () => {
  const base = coinCardHolderProject;
  const plan = base.shoppingPlan!;

  it('odmítne plán, který o nezbytné položce nic neříká', () => {
    const result = projectDefinitionSchema.safeParse({
      ...base,
      shoppingPlan: {
        ...plan,
        lines: plan.lines.filter((l) => l.equipmentSlug !== 'clamps'),
      },
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('neříká nic o clamps');
  });

  it('odmítne vybavení mimo projekt a položku zároveň koupenou i vynechanou', () => {
    const outside = projectDefinitionSchema.safeParse({
      ...base,
      shoppingPlan: {
        ...plan,
        skipped: [...plan.skipped, { equipmentSlug: 'grommet', reason: 'x' }],
      },
    });
    expect(JSON.stringify(outside.error?.issues)).toContain('grommet, které v projektu není');
    const both = projectDefinitionSchema.safeParse({
      ...base,
      shoppingPlan: {
        ...plan,
        skipped: [...plan.skipped, { equipmentSlug: 'mallet', reason: 'x' }],
      },
    });
    expect(JSON.stringify(both.error?.issues)).toContain('zároveň ke koupi i vynechané');
  });
});
