import { equipmentList } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { projectDefinitionSchema } from '@/content/schema';

describe('obsah – pouzdro s vsazenou mincí', () => {
  it('projekt odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(coinCardHolderProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('každý list střihu má v registru soubor', () => {
    const urls = patternSheetUrlsFor(coinCardHolderProject.slug);
    for (const sheet of coinCardHolderProject.patternSheets!.sheets) {
      expect(urls[sheet.id], sheet.id).toMatch(/pouzdro-mince-.*\.svg/);
    }
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of coinCardHolderProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('lekce jsou seřazené 1..n a prerekvizity ukazují jen zpět', () => {
    const order = new Map(coinCardHolderProject.lessons.map((l) => [l.slug, l.order]));
    coinCardHolderProject.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
      for (const p of lesson.prerequisiteLessons) {
        expect(order.get(p)!).toBeLessThan(lesson.order);
      }
    });
  });

  it('id záběrů jsou unikátní napříč projektem', () => {
    const ids = [
      ...coinCardHolderProject.media.map((m) => m.id),
      ...coinCardHolderProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dostupné záběry mají src nebo ilustraci, plánované ne', () => {
    const all = coinCardHolderProject.lessons.flatMap((l) => [
      ...l.media,
      ...l.steps.flatMap((s) => s.media),
    ]);
    for (const m of all) {
      if (m.status === 'available') expect(Boolean(m.src ?? m.illustration), m.id).toBe(true);
      else expect(m.src, m.id).toBeUndefined();
    }
  });
});
