import { type EquipmentRequirement, type EquipmentStatus } from '@/content/schema';
import { computeEquipmentReadiness, isEquipmentReady } from '@/features/inventory/readiness';
import { inventoryOf, item } from '@/test/factories';

const req = (slug: string, priority: EquipmentRequirement['priority']): EquipmentRequirement => ({
  equipmentSlug: slug,
  priority,
  reason: 'test',
  specification: 'test',
});

const project = {
  equipment: [
    req('knife', 'required'),
    req('chisels', 'required'),
    req('glue', 'recommended'),
    req('beveler', 'later'),
  ],
};

describe('isEquipmentReady', () => {
  it.each<[EquipmentStatus, boolean]>([
    ['owned', true],
    ['ordered', false],
    ['want_to_buy', false],
  ])('%s → %s', (status, expected) => {
    expect(isEquipmentReady(status)).toBe(expected);
  });
});

describe('computeEquipmentReadiness', () => {
  it('prázdný inventář = vše chybí', () => {
    const r = computeEquipmentReadiness(project, {});
    expect(r).toMatchObject({
      total: 4,
      owned: 0,
      ordered: 0,
      wantToBuy: 4,
      ownedRatio: 0,
      requiredReady: false,
    });
    expect(r.byPriority.required.missing).toEqual(['knife', 'chisels']);
  });

  it('objednané se nepočítá jako připravené, ale odděluje se od chybějícího', () => {
    const r = computeEquipmentReadiness(
      project,
      inventoryOf(item('knife', 'owned'), item('chisels', 'ordered')),
    );
    expect(r.byPriority.required).toMatchObject({
      total: 2,
      owned: 1,
      ordered: 1,
      wantToBuy: 0,
      missing: ['chisels'],
    });
    expect(r.requiredReady).toBe(false);
    expect(r.ownedRatio).toBeCloseTo(0.25);
    expect(r.orderedRatio).toBeCloseTo(0.25);
  });

  it('doporučené a pozdější položky nikdy neblokují připravenost', () => {
    const r = computeEquipmentReadiness(
      project,
      inventoryOf(item('knife', 'owned'), item('chisels', 'owned')),
    );
    expect(r.requiredReady).toBe(true);
    expect(r.byPriority.recommended.missing).toEqual(['glue']);
    expect(r.byPriority.later.missing).toEqual(['beveler']);
  });
});
