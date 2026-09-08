import { equipmentList } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { equipmentDefinitionSchema, projectDefinitionSchema } from '@/content/schema';

describe('obsah – validace schématem', () => {
  it('každá položka vybavení odpovídá schématu a má unikátní slug', () => {
    const slugs = new Set<string>();
    for (const item of equipmentList) {
      const result = equipmentDefinitionSchema.safeParse(item);
      expect(result.success, `${item.slug}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      expect(slugs.has(item.slug)).toBe(false);
      slugs.add(item.slug);
    }
  });

  it('projekt pouzdra na karty odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(cardHolderProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of cardHolderProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('lekce jsou seřazené 1..n a prerekvizity ukazují jen zpět', () => {
    const order = new Map(cardHolderProject.lessons.map((l) => [l.slug, l.order]));
    cardHolderProject.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
      for (const p of lesson.prerequisiteLessons) {
        expect(order.get(p)!).toBeLessThan(lesson.order);
      }
    });
  });

  it('id záběrů jsou unikátní napříč obsahem', () => {
    const ids = [
      ...equipmentList.flatMap((e) => e.media.map((m) => m.id)),
      ...cardHolderProject.media.map((m) => m.id),
      ...cardHolderProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dostupné záběry mají src nebo ilustraci, plánované ne', () => {
    const all = cardHolderProject.lessons.flatMap((l) => [
      ...l.media,
      ...l.steps.flatMap((s) => s.media),
    ]);
    for (const m of all) {
      if (m.status === 'available') expect(Boolean(m.src ?? m.illustration), m.id).toBe(true);
      else expect(m.src, m.id).toBeUndefined();
    }
  });

  it('příklady výrobků mají https odkaz, cenu a datum ověření', () => {
    const examples = equipmentList.flatMap((e) => e.examples.map((x) => ({ slug: e.slug, ...x })));
    expect(examples.length).toBeGreaterThan(10);
    for (const x of examples) {
      expect(x.url.startsWith('https://'), `${x.slug}: ${x.url}`).toBe(true);
      expect(x.url.includes('utm_'), `${x.slug}: odkaz bez sledovacích parametrů`).toBe(false);
      expect(x.priceCents).toBeGreaterThan(0);
      expect(x.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
