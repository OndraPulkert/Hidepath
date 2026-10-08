import { describe, expect, it } from 'vitest';

import { equipmentCatalog } from '@/content/equipment';
import {
  BELT_ACTIVE_FIELD_ID,
  LEGACY_BELT_RECORD_IDS as BELT_RECORD_IDS,
} from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import {
  BELT_CONFIG_PLAN_SLUGS,
  BELT_FALLBACK_BASIS,
  beltBudgetPrices,
  beltPlanBasis,
  beltPlanView,
  beltPrepPlan,
} from '@/features/belt/belt-shopping';
import { LEGACY_BELT_NAME } from '@/features/belt/belt-prefill';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { buildLessonPrep } from '@/features/prep/lesson-prep';
import { EMPTY_PROGRESS } from '@/features/progress/types';
import { computeRemainingBudget } from '@/features/shopping/budget';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import { type BeltConfigInput } from '@/lib/patterns/belt-config';

const SLUG = beltProject.slug;
const plan = beltProject.shoppingPlan!;

const entry = (
  fieldId: string,
  value: number | string | null,
  updatedAt = '2026-10-08T10:00:00.000Z',
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: SLUG,
  lessonSlug: 'vas-pasek',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: updatedAt,
  updatedAt,
});

const saved = (name: string, input: BeltConfigInput, updatedAt?: string) =>
  entry(newSavedBeltFieldId(), serializeSavedBelt(name, input, 'pasek'), updatedAt);

const prepPlan = (entries: LessonRecordEntry[]) => {
  const out = beltPrepPlan(plan, entries, SLUG, equipmentCatalog);
  if (!out) throw new Error('bez plánu');
  return out;
};

const lineOf = (p: ReturnType<typeof prepPlan>['plan'], slug: string) =>
  p.lines.filter((l) => l.equipmentSlug === slug);

describe('nákup podle pásku', () => {
  it('bez sestavy nic – platí plán projektu (40 mm)', () => {
    expect(beltPlanBasis([], SLUG)).toBeNull();
    expect(beltPrepPlan(plan, [], SLUG, equipmentCatalog)).toBeNull();
  });

  it('nejnovější uložený pásek má přednost před starými zápisy lekce 1', () => {
    const basis = beltPlanBasis(
      [
        entry(BELT_RECORD_IDS.width, 30),
        saved('Starý', { widthMm: 35, thicknessMm: 3.5, tip: 'hrot' }, '2026-10-01T10:00:00.000Z'),
        saved('Nový', { widthMm: 30, thicknessMm: 3.6, tip: 'hrot' }, '2026-10-07T10:00:00.000Z'),
      ],
      SLUG,
    );
    expect(basis).toMatchObject({ name: 'Nový', source: 'saved', input: { widthMm: 30 } });
  });

  it('zvolený aktivní pásek má přednost před nejnovějším', () => {
    const old = saved(
      'Starý',
      { widthMm: 35, thicknessMm: 3.5, tip: 'hrot' },
      '2026-10-01T10:00:00.000Z',
    );
    const entries = [
      old,
      saved('Nový', { widthMm: 30, thicknessMm: 3.6, tip: 'hrot' }, '2026-10-07T10:00:00.000Z'),
      entry(BELT_ACTIVE_FIELD_ID, old.fieldId),
    ];
    expect(beltPlanBasis(entries, SLUG)).toMatchObject({ name: 'Starý', input: { widthMm: 35 } });
    expect(prepPlan(entries).basis).toMatch(/^podle pásku: Starý \(35 mm/);
    // Zvolený pásek mezitím smazaný (náhrobek): platí zase nejnovější.
    const deleted = [...entries, entry(old.fieldId, null, '2026-10-08T11:00:00.000Z')];
    expect(beltPlanBasis(deleted, SLUG)).toMatchObject({ name: 'Nový' });
  });

  it('odřezek z téhož pásu: pás o 15 cm delší, nejbližší délka, kterou obchod prodává', () => {
    const input = { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 } as const;
    const plain = prepPlan([saved('Bez', input)]);
    expect(lineOf(plain.plan, 'belt-strap')[0]!.purpose).toMatch(/aspoň 119 cm$/);
    const withScrap = prepPlan([
      entry(
        newSavedBeltFieldId(),
        serializeSavedBelt('S', input, 'pasek', { scrapFromStrap: true }),
      ),
    ]);
    // 119 + 15 = 134 cm: CraftPoint (130 cm) nestačí.
    const strap = lineOf(withScrap.plan, 'belt-strap');
    expect(strap.every((l) => !l.url.includes('craft-point'))).toBe(true);
    expect(
      strap[0]?.purpose ??
        withScrap.plan.skipped.find((x) => x.equipmentSlug === 'belt-strap')!.reason,
    ).toMatch(/134 cm/);
  });

  it('bez uloženého pásku čísla ze starých zápisů lekce 1 (převod)', () => {
    const basis = beltPlanBasis([entry(BELT_RECORD_IDS.width, 35)], SLUG);
    expect(basis).toMatchObject({ name: LEGACY_BELT_NAME, source: 'notebook' });
    expect(basis!.input.widthMm).toBe(35);
  });

  it('35 mm × 3,5 mm: pás ve variantě 35 mm, mosazná přezka 35 mm, nýt 10/6', () => {
    const out = prepPlan([
      saved('Hnědý', { widthMm: 35, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 }),
    ]);
    expect(out.basis).toBe('podle pásku: Hnědý (35 mm · 3,5 mm · hrot · 5 dírek)');
    expect(lineOf(out.plan, 'belt-strap')).toEqual([
      expect.objectContaining({ variant: '35 mm', quantity: 1 }),
    ]);
    expect(lineOf(out.plan, 'belt-strap')[0]!.purpose).toMatch(/aspoň 119 cm/);
    expect(lineOf(out.plan, 'belt-buckle')).toEqual([
      expect.objectContaining({
        url: 'https://craft-point.cz/products/mosazna-opaskova-prezka-35mm',
      }),
    ]);
    expect(lineOf(out.plan, 'chicago-screws')).toEqual([
      expect.objectContaining({
        url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6-mm-stribrne',
        quantity: 2,
      }),
    ]);
    expect(out.plan.title).toMatch(/^Podle pásku „Hnědý“/);
  });

  it('45 mm × 4 mm: pás z Leatory, přezka bez ověřeného trnu, nýt 6,5 mm jen podle názvu', () => {
    const out = prepPlan([saved('Pracovní', { widthMm: 45, thicknessMm: 4, tip: 'hrot' })]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([
      expect.objectContaining({ variant: '45 mm, 130 cm', quantity: 1 }),
    ]);
    const buckle = lineOf(out.plan, 'belt-buckle');
    expect(buckle).toHaveLength(1);
    expect(buckle[0]!.purpose).toMatch(/typ trnu .* ověřte na fotce/);
    const screws = lineOf(out.plan, 'chicago-screws');
    expect(screws).toEqual([expect.objectContaining({ variant: '9,5 × 6,5 mm', quantity: 1 })]);
    expect(screws[0]!.purpose).toMatch(/dřík jen podle názvu, ověřte u prodejce/);
  });

  it('pás bez výchozí nabídky (jen bez uvedeného činění) jde do „neplánováno“, nic se nevybere', () => {
    const out = prepPlan([
      saved('Dlouhý', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 1070 }),
    ]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([]);
    expect(out.plan.skipped.find((s) => s.equipmentSlug === 'belt-strap')!.reason).toMatch(
      /Kde jinde koupit/,
    );
  });

  it('44 mm: pás jen na objednávku se do plánu sám nedostane', () => {
    const out = prepPlan([saved('Široký', { widthMm: 44, thicknessMm: 3.5, tip: 'hrot' })]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([]);
  });

  it('4 mm, 40 mm, obvod 110 cm: Leatory v délce 140 cm', () => {
    const out = prepPlan([
      saved('Silný', { widthMm: 40, thicknessMm: 4, tip: 'hrot', waistMm: 1100 }),
    ]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([
      expect.objectContaining({ variant: '40 mm, 140 cm' }),
    ]);
  });

  it('3,4 mm: dřík 5,3–5,8 mm v ověřených nabídkách není – žádný nýt se nedomýšlí', () => {
    const out = prepPlan([saved('Tenčí', { widthMm: 40, thicknessMm: 3.4, tip: 'hrot' })]);
    expect(lineOf(out.plan, 'chicago-screws')).toEqual([]);
    expect(out.plan.skipped.find((s) => s.equipmentSlug === 'chicago-screws')!.reason).toMatch(
      /dřík 5,3–5,8 mm .* Ověřte u prodejce/,
    );
  });

  it('28 mm: přezka v katalogu není, jde do „neplánováno“ s důvodem', () => {
    const out = prepPlan([saved('Úzký', { widthMm: 28, thicknessMm: 3.5, tip: 'hrot' })]);
    expect(lineOf(out.plan, 'belt-buckle')).toEqual([]);
    expect(out.plan.skipped.find((s) => s.equipmentSlug === 'belt-buckle')!.reason).toMatch(
      /Přezku 28 mm v ověřených nabídkách nemáme/,
    );
    expect(lineOf(out.plan, 'belt-strap')[0]!.variant).toBe('28 mm');
  });

  it('každý řádek plánu dohledá příklad v katalogu a ostatní položky zůstanou', () => {
    for (const widthMm of [28, 30, 33, 35, 38, 40, 45]) {
      for (const thicknessMm of [3, 3.25, 3.5, 3.6, 3.75, 4]) {
        const out = prepPlan([saved('X', { widthMm, thicknessMm, tip: 'hrot', waistMm: 900 })]);
        const resolved = resolveShoppingPlan({ shoppingPlan: out.plan }, equipmentCatalog, {});
        const resolvedCount = resolved!.shops.reduce((n, s) => n + s.lines.length, 0);
        expect(resolvedCount, `${widthMm}/${thicknessMm}`).toBe(out.plan.lines.length);
        const others = plan.lines.filter(
          (l) => !(BELT_CONFIG_PLAN_SLUGS as readonly string[]).includes(l.equipmentSlug),
        );
        expect(out.plan.lines.filter((l) => others.includes(l))).toEqual(others);
        for (const slug of BELT_CONFIG_PLAN_SLUGS) {
          const inLines = out.plan.lines.some((l) => l.equipmentSlug === slug);
          const inSkipped = out.plan.skipped.some((s) => s.equipmentSlug === slug);
          expect(inLines !== inSkipped, `${widthMm}/${thicknessMm} ${slug}`).toBe(true);
        }
      }
    }
  });

  it('„Připravte si“ ukáže řádky podle pásku a z čeho jsou', () => {
    const lesson = beltProject.lessons.find((l) => l.requiredEquipment.includes('belt-buckle'))!;
    const planOverride = beltPrepPlan(
      plan,
      [saved('Do obleku', { widthMm: 30, thicknessMm: 3.5, tip: 'hrot' })],
      SLUG,
      equipmentCatalog,
    );
    const view = buildLessonPrep({
      project: beltProject,
      lesson,
      catalog: equipmentCatalog,
      inventory: {},
      progress: EMPTY_PROGRESS,
      checks: [],
      planOverride,
    });
    expect(view.planBasis).toBe('podle pásku: Do obleku (30 mm · 3,5 mm · hrot · 5 dírek)');
    const buckle = view.equipment.find((e) => e.slug === 'belt-buckle')!;
    expect(buckle.planLines.map((l) => l.title)).toEqual(['Mosazná opasková přezka 30 mm']);
    const strap = view.equipment.find((e) => e.slug === 'belt-strap')!;
    expect(strap.planLines.map((l) => l.variant)).toEqual(['30 mm']);

    const fallback = buildLessonPrep({
      project: beltProject,
      lesson,
      catalog: equipmentCatalog,
      inventory: {},
      progress: EMPTY_PROGRESS,
      checks: [],
    });
    expect(fallback.planBasis).toBeUndefined();
    expect(
      fallback.equipment.find((e) => e.slug === 'belt-buckle')!.planLines.map((l) => l.title),
    ).toEqual(['Mosazná opasková přezka 40 mm']);
  });

  it('výsečník na dírky podle Ø pásku, ne vždy 5 mm', () => {
    // Regrese: plán vždy kupoval Format 5 mm, i když pásek měl dírky Ø 4,5, 5,5 nebo 6 mm.
    const at = (holeDiameterMm: number) =>
      prepPlan([saved('X', { widthMm: 35, thicknessMm: 3.5, tip: 'hrot', holeDiameterMm })]);
    const d5 = at(5);
    expect(lineOf(d5.plan, 'hole-punch-5mm')).toEqual([
      expect.objectContaining({
        url: 'https://www.enaradinastroje.cz/kruhovy-vysecnik-format-5mm/',
      }),
    ]);
    expect(d5.equipmentNames?.['hole-punch-5mm']).toBeUndefined();
    const d45 = at(4.5);
    expect(lineOf(d45.plan, 'hole-punch-5mm')).toEqual([
      expect.objectContaining({
        url: 'https://craft-point.cz/products/sada-vysecniku-na-kuzi-7-velikosti-2-5mm',
      }),
    ]);
    expect(lineOf(d45.plan, 'hole-punch-5mm')[0]!.purpose).toMatch(/Ø 4,5 mm/);
    expect(d45.equipmentNames?.['hole-punch-5mm']).toBe('Výsečník Ø 4,5 mm (dírky pro trn)');
    const d55 = at(5.5);
    expect(lineOf(d55.plan, 'hole-punch-5mm')).toEqual([]);
    expect(d55.plan.skipped.find((s) => s.equipmentSlug === 'hole-punch-5mm')!.reason).toMatch(
      /Ø 5,5 mm .* ověřte u prodejce/,
    );
    const d6 = at(6);
    expect(lineOf(d6.plan, 'hole-punch-5mm')).toEqual([]);
    expect(d6.plan.skipped.find((s) => s.equipmentSlug === 'hole-punch-5mm')!.reason).toMatch(
      /výsečníkem Ø 6 mm/,
    );
    expect(lineOf(d6.plan, 'hole-punch-6mm')[0]!.purpose).toMatch(/dírky pro trn/);
  });

  it('„Připravte si“ u lekce 6 neukazuje 5 mm u pásku s Ø 4,5', () => {
    const lesson = beltProject.lessons.find((l) => l.slug === '06-holes-and-tip')!;
    const planOverride = beltPrepPlan(
      plan,
      [saved('Úzké dírky', { widthMm: 30, thicknessMm: 3.5, tip: 'hrot', holeDiameterMm: 4.5 })],
      SLUG,
      equipmentCatalog,
    );
    const view = buildLessonPrep({
      project: beltProject,
      lesson,
      catalog: equipmentCatalog,
      inventory: {},
      progress: EMPTY_PROGRESS,
      checks: [],
      planOverride,
    });
    const punch = view.equipment.find((e) => e.slug === 'hole-punch-5mm')!;
    expect(punch.name).toBe('Výsečník Ø 4,5 mm (dírky pro trn)');
    expect(punch.planLines.map((l) => l.title)).toEqual([
      'Sada výsečníků na kůži 7 velikostí (2–5 mm)',
    ]);
  });

  it('zápisník s trnem, který nejde spočítat: „Připravte si“ to řekne, neukáže potichu 40 mm', () => {
    const out = beltPrepPlan(
      plan,
      [entry(BELT_RECORD_IDS.width, 30), entry(BELT_RECORD_IDS.prong, 5.8)],
      SLUG,
      equipmentCatalog,
    );
    expect(out).not.toBeNull();
    expect(out!.plan).toBe(plan);
    expect(out!.basis).toMatch(
      /^podle plánu projektu \(pásek 40 mm\): zápisy z lekce 1 nejdou spočítat/,
    );
    expect(out!.basis).toMatch(/Trn 5,8 mm je na výsečníky 4,5–6 mm moc silný/);
  });
});

describe('nákup podle barvy pásku', () => {
  const paintLines = (p: typeof plan) => p.lines.filter((l) => l.equipmentSlug === 'edge-paint');
  const paintSkip = (p: typeof plan) => p.skipped.find((s) => s.equipmentSlug === 'edge-paint');

  it('přírodní (i starý pásek bez barvy): barva na hrany se nekupuje, důvod zůstane', () => {
    const out = prepPlan([saved('Přírodní', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' })]);
    expect(paintLines(out.plan)).toEqual([]);
    expect(paintSkip(out.plan)!.reason).toMatch(/^Jen u barevného pásku/);
    expect(lineOf(out.plan, 'leather-balm')[0]!.purpose).toBe(
      'přírodní pás bez barvení; nejdřív na odřezku',
    );
    expect(out.plan.title).not.toMatch(/barva na hrany/);
  });

  it('černý: černý pás, Edge Kote černá hned za balzámem, balzám jen když na odřezku vyhoví', () => {
    const out = prepPlan([
      saved('Černý', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950, color: 'cerna' }),
    ]);
    expect(out.basis).toBe('podle pásku: Černý (40 mm · 3,5 mm · hrot · 5 dírek · černá)');
    expect(lineOf(out.plan, 'belt-strap')).toEqual([
      expect.objectContaining({
        url: 'https://craft-point.cz/products/remen-z-prave-kuze-3-0-3-5mm-140cm-15-80mm-cerny',
        variant: '40 mm',
      }),
    ]);
    expect(lineOf(out.plan, 'belt-strap')[0]!.purpose).toMatch(/^černá, šířka 40 mm/);
    expect(paintLines(out.plan)).toEqual([
      expect.objectContaining({
        url: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-cerna',
        quantity: 1,
      }),
    ]);
    expect(paintLines(out.plan)[0]!.purpose).toMatch(/ověřte na odřezku/);
    expect(paintSkip(out.plan)).toBeUndefined();
    const slugs = out.plan.lines.map((l) => l.equipmentSlug);
    expect(slugs.indexOf('edge-paint')).toBe(slugs.indexOf('leather-balm') + 1);
    expect(lineOf(out.plan, 'leather-balm')[0]!.purpose).toMatch(/jen když na odřezku vyhoví/);
    expect(out.plan.title).toMatch(/balzám a barva na hrany jsou pro tuto sestavu/);
    const resolved = resolveShoppingPlan({ shoppingPlan: out.plan }, equipmentCatalog, {})!;
    expect(resolved.shops.reduce((n, s) => n + s.lines.length, 0)).toBe(out.plan.lines.length);
  });

  it('tabák: pás bez uvedeného činění se nevybere, barvu na hrany v tomto odstínu nemáme', () => {
    const out = prepPlan([
      saved('Tabák', { widthMm: 32, thicknessMm: 3.5, tip: 'hrot', color: 'tabak' }),
    ]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([]);
    expect(out.plan.skipped.find((s) => s.equipmentSlug === 'belt-strap')!.reason).toMatch(
      /^Barevný pás \(tabák\) 32 mm, 3,5 mm .*Kde jinde koupit/,
    );
    expect(paintLines(out.plan)).toEqual([]);
    expect(paintSkip(out.plan)!.reason).toMatch(/^Barevný pás \(tabák\): barvu na hrany/);
  });

  it('každá barva: plán dohledá všechny řádky a každá položka sestavy je buď v plánu, nebo vynechaná', () => {
    for (const color of ['hneda', 'tmave-hneda', 'cerna', 'konak', 'modra', 'bordo'] as const) {
      for (const widthMm of [30, 32, 33, 38, 40]) {
        const out = prepPlan([saved('X', { widthMm, thicknessMm: 3.5, tip: 'hrot', color })]);
        const resolved = resolveShoppingPlan({ shoppingPlan: out.plan }, equipmentCatalog, {});
        expect(resolved!.shops.reduce((n, s) => n + s.lines.length, 0)).toBe(out.plan.lines.length);
        for (const slug of BELT_CONFIG_PLAN_SLUGS) {
          const inLines = out.plan.lines.some((l) => l.equipmentSlug === slug);
          const inSkipped = out.plan.skipped.some((s) => s.equipmentSlug === slug);
          expect(inLines !== inSkipped, `${color} ${widthMm} ${slug}`).toBe(true);
        }
      }
    }
  });

  it('„Připravte si“ lekce 3: barva na hrany u barevného podle pásku, u přírodního s důvodem', () => {
    const lesson = beltProject.lessons.find((l) => l.slug === '03-long-edges')!;
    const view = (entries: LessonRecordEntry[]) =>
      buildLessonPrep({
        project: beltProject,
        lesson,
        catalog: equipmentCatalog,
        inventory: {},
        progress: EMPTY_PROGRESS,
        checks: [],
        planOverride: beltPrepPlan(plan, entries, SLUG, equipmentCatalog),
      }).equipment.find((e) => e.slug === 'edge-paint')!;
    const dyed = view([
      saved('Hnědý', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', color: 'tmave-hneda' }),
    ]);
    expect(dyed.planLines.map((l) => l.title)).toEqual([
      "Fiebing's Edge Kote 118 ml – tmavě hnědá",
    ]);
    expect(dyed.optional).toBe(true);
    const natural = view([saved('Přírodní', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' })]);
    expect(natural.planLines).toEqual([]);
    expect(natural.skippedReason).toMatch(/^Jen u barevného pásku/);
  });

  it('rozpočet: barva na hrany jen u barevného pásku, s cenou ověřeného odstínu', () => {
    const budget = (entries: LessonRecordEntry[]) =>
      beltPlanView(plan, entries, SLUG, equipmentCatalog).budgetPrices['edge-paint'];
    expect(budget([])).toBe('not-needed');
    expect(budget([saved('P', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' })])).toBe('not-needed');
    expect(
      budget([saved('Č', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', color: 'cerna' })]),
    ).toEqual({ cents: 26_900 });
    expect(
      budget([saved('T', { widthMm: 32, thicknessMm: 3.5, tip: 'hrot', color: 'tabak' })]),
    ).toBe('unpriced');
    const natural = computeRemainingBudget(
      beltProject,
      equipmentCatalog,
      {},
      beltPlanView(plan, [], SLUG, equipmentCatalog).budgetPrices,
    );
    expect(natural.lines.map((l) => l.equipmentSlug)).not.toContain('edge-paint');
  });
});

describe('Co koupit a rozpočet podle pásku', () => {
  const priceOf = (p: typeof plan, slug: string) =>
    p.lines
      .filter((l) => l.equipmentSlug === slug)
      .reduce((sum, l) => sum + findPlanExample(l, equipmentCatalog)!.priceCents * l.quantity, 0);

  it('bez sestavy plán projektu (40 mm) s poznámkou a cenami jeho řádků', () => {
    const view = beltPlanView(plan, [], SLUG, equipmentCatalog);
    expect(view.plan).toBe(plan);
    expect(view.basis).toBe(BELT_FALLBACK_BASIS);
    expect(view.basis).toBe('podle plánu projektu (pásek 40 mm)');
    expect(view.budgetPrices['belt-buckle']).toEqual({ cents: priceOf(plan, 'belt-buckle') });
    expect(view.budgetPrices['hole-punch-5mm']).toEqual({
      cents: priceOf(plan, 'hole-punch-5mm'),
    });
  });

  it('s uloženým páskem stejný plán i poznámka jako „Připravte si“', () => {
    const entries = [saved('Do obleku', { widthMm: 30, thicknessMm: 3.5, tip: 'hrot' })];
    const view = beltPlanView(plan, entries, SLUG, equipmentCatalog);
    const prep = beltPrepPlan(plan, entries, SLUG, equipmentCatalog)!;
    expect(view.plan).toEqual(prep.plan);
    expect(view.basis).toBe('podle pásku: Do obleku (30 mm · 3,5 mm · hrot · 5 dírek)');
    expect(view.budgetPrices['belt-buckle']).toEqual({
      cents: priceOf(view.plan, 'belt-buckle'),
    });
    const resolved = resolveShoppingPlan({ shoppingPlan: view.plan }, equipmentCatalog, {})!;
    const buckle = resolved.shops
      .flatMap((s) => s.lines)
      .find((l) => l.equipmentSlug === 'belt-buckle')!;
    expect(buckle.example.title).toBe('Mosazná opasková přezka 30 mm');
  });

  it('rozpočet: dírky Ø 6 mm = výsečník Ø 5 mm se nekupuje, nic bez ověřené nabídky je bez ceny', () => {
    const view = beltPlanView(
      plan,
      [saved('Široké dírky', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', holeDiameterMm: 6 })],
      SLUG,
      equipmentCatalog,
    );
    expect(view.budgetPrices['hole-punch-5mm']).toBe('not-needed');
    const withSix = computeRemainingBudget(beltProject, equipmentCatalog, {}, view.budgetPrices);
    expect(withSix.lines.map((l) => l.equipmentSlug)).not.toContain('hole-punch-5mm');

    const withoutBuckle = {
      ...plan,
      lines: plan.lines.filter((l) => l.equipmentSlug !== 'belt-buckle'),
    };
    expect(beltBudgetPrices(withoutBuckle, equipmentCatalog, 5)['belt-buckle']).toBe('unpriced');
  });

  it('pásek, který nejde spočítat: plán projektu, poznámka řekne proč', () => {
    const view = beltPlanView(
      plan,
      [entry(BELT_RECORD_IDS.width, 30), entry(BELT_RECORD_IDS.prong, 5.8)],
      SLUG,
      equipmentCatalog,
    );
    expect(view.plan).toBe(plan);
    expect(view.basis).toMatch(/^podle plánu projektu \(pásek 40 mm\): zápisy z lekce 1/);
  });
});
