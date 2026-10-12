import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { computeEquipmentReadiness } from '@/features/inventory/readiness';
import {
  checkpointDone,
  enrollment as enrollmentOf,
  inventoryOf,
  item,
  lessonDone,
} from '@/test/factories';
import { type InventoryState } from '@/features/inventory/types';
import { computeJourney } from '@/features/progress/journey';
import { computeNextAction } from '@/features/progress/next-action';
import {
  checkpointKey,
  EMPTY_PROGRESS,
  type EnrollmentRecord,
  type ProgressState,
} from '@/features/progress/types';

const project = cardHolderProject;
const enrollment: EnrollmentRecord = enrollmentOf(project.slug);
const required = project.equipment
  .filter((e) => e.priority === 'required')
  .map((e) => e.equipmentSlug);

function done(...slugs: string[]): ProgressState {
  return {
    lessons: Object.fromEntries(slugs.map((s) => [s, lessonDone(project.slug, s)])),
    checkpoints: Object.fromEntries(
      slugs.flatMap((s) =>
        project.lessons
          .find((l) => l.slug === s)!
          .checkpoints.map((c) => [
            checkpointKey(s, c.slug),
            checkpointDone(project.slug, s, c.slug),
          ]),
      ),
    ),
  };
}

function next(
  inventory: InventoryState,
  progress: ProgressState,
  enr: EnrollmentRecord | null = enrollment,
) {
  const journey = computeJourney(project, { enrollment: enr, inventory, progress });
  return computeNextAction(
    project,
    journey,
    computeEquipmentReadiness(project, inventory),
    enr !== null,
  );
}

describe('computeNextAction', () => {
  it('bez zápisu → výběr projektu', () => {
    expect(next({}, EMPTY_PROGRESS, null)).toEqual({ kind: 'choose_project' });
  });

  it('bez jakéhokoli nezbytného vybavení → projít nákupní seznam', () => {
    expect(next({}, EMPTY_PROGRESS)).toEqual({
      kind: 'review_equipment',
      missingRequired: required.length,
    });
  });

  it('dostupná lekce → pokračovat lekcí, včetně upozornění na objednanou položku dál v cestě', () => {
    const inventory = inventoryOf(
      ...required.map((s) => item(s, s === 'stitching-chisels' ? 'ordered' : 'owned')),
    );
    const action = next(inventory, done('01-prepare-workspace'));
    expect(action).toMatchObject({
      kind: 'continue_lesson',
      lessonSlug: '02-straight-cut',
      order: 2,
      blockerAhead: {
        equipmentSlug: 'stitching-chisels',
        status: 'ordered',
        unlocksLessonOrder: 3,
      },
    });
  });

  it('žádná dostupná lekce, část vybavení mám → čekání na konkrétní položku', () => {
    const inventory = inventoryOf(
      ...required.map((s) => item(s, s === 'stitching-chisels' ? 'ordered' : 'owned')),
    );
    const action = next(inventory, done('01-prepare-workspace', '02-straight-cut'));
    expect(action).toMatchObject({
      kind: 'wait_for_equipment',
      lessonSlug: '03-stitching-chisels',
      missing: [{ equipmentSlug: 'stitching-chisels', status: 'ordered' }],
    });
  });

  it('všechny lekce hotové → označit projekt za hotový; po označení → hotovo', () => {
    const inventory = inventoryOf(...required.map((s) => item(s, 'owned')));
    const all = done(...project.lessons.map((l) => l.slug));
    expect(next(inventory, all)).toEqual({ kind: 'complete_project' });
    expect(next(inventory, all, { ...enrollment, status: 'completed' })).toEqual({
      kind: 'project_completed',
    });
  });
});

describe('computeNextAction – volitelná lekce (pásek, lekce 7)', () => {
  const belt = beltProject;
  const owned = inventoryOf(
    ...belt.equipment
      .filter((e) => e.priority === 'required')
      .map((e) => item(e.equipmentSlug, 'owned')),
  );
  const doneBelt = (...orders: number[]): ProgressState => {
    const lessons = belt.lessons.filter((l) => orders.includes(l.order));
    return {
      lessons: Object.fromEntries(lessons.map((l) => [l.slug, lessonDone(belt.slug, l.slug)])),
      checkpoints: Object.fromEntries(
        lessons.flatMap((l) =>
          l.checkpoints.map((c) => [
            checkpointKey(l.slug, c.slug),
            checkpointDone(belt.slug, l.slug, c.slug),
          ]),
        ),
      ),
    };
  };
  const nextBelt = (progress: ProgressState) => {
    const enr = enrollmentOf(belt.slug);
    const journey = computeJourney(belt, { enrollment: enr, inventory: owned, progress });
    return computeNextAction(belt, journey, computeEquipmentReadiness(belt, owned), true);
  };

  it('po hotové lekci 6 je další krok dokončit projekt, ne volitelná lekce 7', () => {
    expect(nextBelt(doneBelt(1, 2, 3, 4, 5))).toMatchObject({ kind: 'continue_lesson', order: 6 });
    expect(nextBelt(doneBelt(1, 2, 3, 4, 5, 6))).toEqual({ kind: 'complete_project' });
  });
});
