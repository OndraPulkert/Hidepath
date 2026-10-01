import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';

describe('obsah – pouzdro na karty: nákupní plán „Co koupit“', () => {
  const plan = cardHolderProject.shoppingPlan!;

  it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10. 2026)', () => {
    for (const line of plan.lines) {
      const example = findPlanExample(line, equipmentCatalog);
      expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
      expect(example!.availability, line.url).toBe('in_stock');
      expect(example!.checkedAt, line.url).toBe(
        line.equipmentSlug === 'masking-tape' ? '2026-10-01' : '2026-09-29',
      );
    }
  });

  it('pokryje každou nezbytnou i doporučenou položku projektu, bez vynechání', () => {
    const planned = new Set(plan.lines.map((l) => l.equipmentSlug));
    for (const req of cardHolderProject.equipment) {
      if (req.priority !== 'later')
        expect(planned.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
    expect(plan.skipped).toEqual([]);
  });

  it('kůže: A4 na pouzdro a 2× A5 téže kůže 1,2 mm na trénink lekcí 1–4', () => {
    const leather = plan.lines.filter((l) => l.equipmentSlug === 'veg-tan-leather');
    expect(leather.map((l) => [l.variant, l.quantity])).toEqual([
      ['A4 (30 × 21 cm)', 1],
      ['A5 (21 × 15 cm)', 2],
    ]);
    expect(new Set(leather.map((l) => l.url)).size).toBe(1);
    expect(findPlanExample(leather[0]!, equipmentCatalog)!.title).toContain('1,2 mm');
    expect(leather[0]!.purpose).toContain('100 × 70 mm');
    expect(leather[0]!.purpose).toContain('100 × 56 mm');
    const pieces = cardHolderProject.template!.pieces;
    expect(pieces.map((p) => `${p.widthMm} × ${p.heightMm}`)).toEqual(['100 × 70', '100 × 56']);
  });

  it('nářadí bere ze stejných příkladů jako projekt 02 (jeden košík)', () => {
    const coinLines = coinCardHolderProject.shoppingPlan!.lines;
    for (const line of plan.lines) {
      if (line.equipmentSlug === 'veg-tan-leather') continue;
      const same = coinLines.some(
        (c) =>
          c.equipmentSlug === line.equipmentSlug &&
          c.url === line.url &&
          c.variant === line.variant,
      );
      expect(same, `${line.equipmentSlug} ${line.url}`).toBe(true);
    }
  });

  it('součet po obchodech: CraftPoint 2 881 Kč + IKEA 118 Kč + OBI 139 Kč = 3 138 Kč', () => {
    const resolved = resolveShoppingPlan(cardHolderProject, equipmentCatalog, {})!;
    const lines = resolved.shops.flatMap((s) => s.lines);
    expect(lines).toHaveLength(plan.lines.length);
    expect(resolved.shops.map((s) => [s.shop, s.totalCents])).toEqual([
      ['CraftPoint', 288_100],
      ['IKEA', 11_800],
      ['OBI', 13_900],
    ]);
    expect(resolved.totalCents).toBe(313_800);
    expect(resolved.notInStockCount).toBe(0);
    expect(resolved.checkedFrom).toBe('2026-09-29');
    expect(resolved.checkedTo).toBe('2026-10-01');
  });
});
