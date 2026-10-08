import { describe, expect, it } from 'vitest';

import { equipmentCatalog } from '@/content/equipment';
import { BELT_RECORD_IDS } from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import {
  BELT_CONFIG_PLAN_SLUGS,
  NOTEBOOK_BASIS_NAME,
  beltPlanBasis,
  beltPrepPlan,
} from '@/features/belt/belt-shopping';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { buildLessonPrep } from '@/features/prep/lesson-prep';
import { EMPTY_PROGRESS } from '@/features/progress/types';
import { resolveShoppingPlan } from '@/features/shopping/plan';
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

  it('nejnovější uložený pásek má přednost před zápisníkem', () => {
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

  it('bez uloženého pásku čísla ze zápisníku', () => {
    const basis = beltPlanBasis([entry(BELT_RECORD_IDS.width, 35)], SLUG);
    expect(basis).toMatchObject({ name: NOTEBOOK_BASIS_NAME, source: 'notebook' });
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

  it('45 mm × 4 mm: pás jen s ověřením, přezka bez ověřeného trnu, nýt 6,5 mm jen podle názvu', () => {
    const out = prepPlan([saved('Pracovní', { widthMm: 45, thicknessMm: 4, tip: 'hrot' })]);
    expect(lineOf(out.plan, 'belt-strap')).toEqual([]);
    expect(out.plan.skipped.find((s) => s.equipmentSlug === 'belt-strap')!.reason).toMatch(
      /Pás 45 mm, 4 mm .* Ověřte u prodejce/,
    );
    const buckle = lineOf(out.plan, 'belt-buckle');
    expect(buckle).toHaveLength(1);
    expect(buckle[0]!.purpose).toMatch(/typ trnu .* ověřte na fotce/);
    const screws = lineOf(out.plan, 'chicago-screws');
    expect(screws).toEqual([expect.objectContaining({ variant: '9,5 × 6,5 mm', quantity: 1 })]);
    expect(screws[0]!.purpose).toMatch(/dřík jen podle názvu, ověřte u prodejce/);
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
});
