import { type EquipmentCatalog, type EquipmentDefinition } from '@/content/schema';
import { inventoryOf, item } from '@/test/factories';
import {
  computeRecordedCosts,
  computeRemainingBudget,
  estimatedPriceCents,
} from '@/features/shopping/budget';

const def = (slug: string, min: number, max: number): EquipmentDefinition => ({
  slug,
  name: slug,
  englishName: slug,
  category: 'cutting',
  shortDescription: 'x',
  purpose: 'x',
  buyingGuide: [],
  cautions: [],
  avoid: [],
  alternatives: [],
  priceRange: { minCents: min, maxCents: max },
  priceSource: 'estimate',
  priceNote: 'x',
  alsoUsedFor: [],
  examples: [],
  commonlyAtHome: false,
  media: [],
  reviewStatus: 'draft',
});

const catalog: EquipmentCatalog = {
  knife: def('knife', 8_000, 25_000), // střed 16 500 → 17 000
  chisels: def('chisels', 40_000, 120_000), // 80 000
  glue: def('glue', 10_000, 20_000), // 15 000
  beveler: def('beveler', 30_000, 70_000), // 50 000
};

const project = {
  equipment: [
    { equipmentSlug: 'knife', priority: 'required' as const, reason: '', specification: '' },
    { equipmentSlug: 'chisels', priority: 'required' as const, reason: '', specification: '' },
    { equipmentSlug: 'glue', priority: 'recommended' as const, reason: '', specification: '' },
    { equipmentSlug: 'beveler', priority: 'later' as const, reason: '', specification: '' },
  ],
};

describe('estimatedPriceCents', () => {
  it('bere střed rozsahu zaokrouhlený na desetikoruny', () => {
    expect(estimatedPriceCents(catalog.knife!)).toBe(17_000);
    expect(estimatedPriceCents(catalog.glue!)).toBe(15_000);
  });
});

describe('computeRemainingBudget', () => {
  it('sčítá jen položky, které nemám, s odděleným součtem nezbytných a doporučených', () => {
    const b = computeRemainingBudget(project, catalog, inventoryOf(item('knife', 'owned')));
    expect(b.requiredCents).toBe(80_000);
    expect(b.recommendedCents).toBe(15_000);
    expect(b.laterCents).toBe(50_000);
    expect(b.totalCents).toBe(145_000);
    expect(b.orderedCents).toBe(0);
  });

  it('objednaná položka zůstává v nákladech a je označená', () => {
    const b = computeRemainingBudget(project, catalog, inventoryOf(item('chisels', 'ordered')));
    expect(b.orderedCents).toBe(80_000);
    expect(b.lines.find((l) => l.equipmentSlug === 'chisels')?.status).toBe('ordered');
  });

  it('objednaná položka se zadanou skutečnou cenou zůstává v nákladech se skutečnou cenou', () => {
    const b = computeRemainingBudget(
      project,
      catalog,
      inventoryOf(item('chisels', 'ordered', { purchasePriceCents: 69_000 })),
    );
    const line = b.lines.find((l) => l.equipmentSlug === 'chisels');
    expect(line).toMatchObject({ status: 'ordered', estimatedCents: 69_000, source: 'recorded' });
    expect(b.orderedCents).toBe(69_000);
  });

  it('vše vlastněné = nula', () => {
    const inv = inventoryOf(
      item('knife', 'owned'),
      item('chisels', 'owned'),
      item('glue', 'owned'),
      item('beveler', 'owned'),
    );
    expect(computeRemainingBudget(project, catalog, inv).totalCents).toBe(0);
  });
});

describe('computeRecordedCosts', () => {
  it('bez cen říká Evidované náklady a počet položek bez ceny', () => {
    const c = computeRecordedCosts(
      inventoryOf(item('knife', 'owned'), item('glue', 'owned', { purchasePriceCents: 12_000 })),
    );
    expect(c).toEqual({
      ownedCount: 2,
      recordedCents: 12_000,
      withoutPriceCount: 1,
      label: 'Evidované náklady',
    });
  });

  it('s úplnými cenami smí říct Investováno', () => {
    const c = computeRecordedCosts(
      inventoryOf(item('knife', 'owned', { purchasePriceCents: 15_000 })),
    );
    expect(c.label).toBe('Investováno');
  });

  it('objednané a chtěné položky do nákladů dílny nepatří', () => {
    const c = computeRecordedCosts(
      inventoryOf(item('knife', 'ordered', { purchasePriceCents: 15_000 })),
    );
    expect(c.ownedCount).toBe(0);
    expect(c.recordedCents).toBe(0);
  });
});
