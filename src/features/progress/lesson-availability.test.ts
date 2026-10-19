import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import {
  computeLessonViews,
  findCurrentLesson,
  findNextUnfinishedLesson,
} from '@/features/progress/lesson-availability';
import { checkpointKey, EMPTY_PROGRESS, type ProgressState } from '@/features/progress/types';
import { checkpointDone, inventoryOf, item, lessonDone } from '@/test/factories';

const project = cardHolderProject;
const allRequired = project.equipment
  .filter((e) => e.priority === 'required')
  .map((e) => e.equipmentSlug);
const ownedAll = inventoryOf(...allRequired.map((s) => item(s, 'owned')));

function completed(...lessonSlugs: string[]): ProgressState {
  const lessons = Object.fromEntries(
    lessonSlugs.map((slug) => [slug, lessonDone(project.slug, slug)]),
  );
  const checkpoints = Object.fromEntries(
    lessonSlugs.flatMap((slug) =>
      project.lessons
        .find((l) => l.slug === slug)!
        .checkpoints.map((c) => [
          checkpointKey(slug, c.slug),
          checkpointDone(project.slug, slug, c.slug),
        ]),
    ),
  );
  return { lessons, checkpoints };
}

describe('computeLessonViews – zámky podle vybavení', () => {
  it('bez vybavení je zamčená už první lekce a uvádí, co chybí', () => {
    const views = computeLessonViews(project, {}, EMPTY_PROGRESS);
    expect(views[0]!.status).toBe('locked');
    expect(views[0]!.blockers.missingEquipment.map((m) => m.equipmentSlug)).toEqual([
      'cutting-mat',
      'punching-board',
    ]);
    expect(findCurrentLesson(views)).toBeUndefined();
  });

  it('lekce 1 nevyžaduje vidličky – s podložkami je dostupná i s vidličkami na cestě', () => {
    const inventory = inventoryOf(
      item('cutting-mat', 'owned'),
      item('punching-board', 'owned'),
      item('stitching-chisels', 'ordered'),
    );
    expect(computeLessonViews(project, inventory, EMPTY_PROGRESS)[0]!.status).toBe('available');
  });

  it('objednané vybavení lekci neodemkne, ale hlásí stav ordered', () => {
    const inventory = inventoryOf(
      ...allRequired.map((s) => item(s, s === 'stitching-chisels' ? 'ordered' : 'owned')),
    );
    const views = computeLessonViews(
      project,
      inventory,
      completed('01-prepare-workspace', '02-straight-cut'),
    );
    const l3 = views.find((v) => v.slug === '04-saddle-stitch')!;
    expect(l3.status).toBe('locked');
    expect(l3.blockers.missingEquipment).toEqual([
      { equipmentSlug: 'stitching-chisels', status: 'ordered' },
    ]);
  });

  it('doporučené vybavení nikdy neblokuje', () => {
    const views = computeLessonViews(project, ownedAll, EMPTY_PROGRESS);
    expect(views.every((v) => v.blockers.missingEquipment.length === 0)).toBe(true);
  });
});

describe('computeLessonViews – prerekvizity a aktuální lekce', () => {
  it('se vším vybavením je dostupná jen první lekce, ostatní čekají na prerekvizity', () => {
    const views = computeLessonViews(project, ownedAll, EMPTY_PROGRESS);
    expect(views.map((v) => v.status)).toEqual([
      'available',
      'locked',
      'locked',
      'locked',
      'locked',
    ]);
    expect(views[1]!.blockers.incompletePrerequisites).toEqual(['01-prepare-workspace']);
    expect(findCurrentLesson(views)?.slug).toBe('01-prepare-workspace');
  });

  it('po dokončení lekce se odemkne následující a stane se aktuální', () => {
    const views = computeLessonViews(project, ownedAll, completed('01-prepare-workspace'));
    expect(views[0]!.status).toBe('completed');
    expect(views[1]!.status).toBe('available');
    expect(findCurrentLesson(views)?.slug).toBe('02-straight-cut');
  });

  it('lekce 4 vyžaduje hotové lekce 2 i 3', () => {
    const views = computeLessonViews(
      project,
      ownedAll,
      completed('01-prepare-workspace', '02-straight-cut'),
    );
    const l4 = views.find((v) => v.slug === '05-transfer-and-cut')!;
    expect(l4.status).toBe('locked');
    expect(l4.blockers.incompletePrerequisites).toEqual(['04-saddle-stitch']);
  });

  it('dokončená lekce zůstane hotová, i když uživatel později položku odznačí', () => {
    const views = computeLessonViews(project, {}, completed('01-prepare-workspace'));
    expect(views[0]!.status).toBe('completed');
  });
});

describe('computeLessonViews – kontrolní body a canComplete', () => {
  it('zamčenou lekci nelze dokončit ani se všemi body', () => {
    const progress = completed('01-prepare-workspace');
    const withoutLessonRecord: ProgressState = { lessons: {}, checkpoints: progress.checkpoints };
    const views = computeLessonViews(project, {}, withoutLessonRecord);
    expect(views[0]!.completedRequiredCheckpoints).toBe(views[0]!.totalRequiredCheckpoints);
    expect(views[0]!.canComplete).toBe(false);
  });

  it('dostupnou lekci lze dokončit až se všemi povinnými body, nepovinné nerozhodují', () => {
    const l1 = project.lessons[0]!;
    const required = l1.checkpoints.filter((c) => c.required);
    const partial: ProgressState = {
      lessons: {},
      checkpoints: Object.fromEntries(
        required
          .slice(0, -1)
          .map((c) => [
            checkpointKey(l1.slug, c.slug),
            checkpointDone(project.slug, l1.slug, c.slug),
          ]),
      ),
    };
    expect(computeLessonViews(project, ownedAll, partial)[0]!.canComplete).toBe(false);

    const full: ProgressState = {
      lessons: {},
      checkpoints: Object.fromEntries(
        required.map((c) => [
          checkpointKey(l1.slug, c.slug),
          checkpointDone(project.slug, l1.slug, c.slug),
        ]),
      ),
    };
    const view = computeLessonViews(project, ownedAll, full)[0]!;
    expect(view.canComplete).toBe(true);
    expect(view.completedCheckpoints).toBe(required.length);
    expect(view.totalCheckpoints).toBe(l1.checkpoints.length);
  });
});

describe('computeLessonViews – volitelná lekce (pásek, lekce 7)', () => {
  const belt = beltProject;
  const beltOwned = inventoryOf(
    ...belt.equipment
      .filter((e) => e.priority === 'required')
      .map((e) => item(e.equipmentSlug, 'owned')),
  );
  const required = belt.lessons.filter((l) => !l.optional).map((l) => l.slug);
  const optional = belt.lessons.find((l) => l.optional)!;
  const beltDone = (...slugs: string[]): ProgressState => ({
    lessons: Object.fromEntries(slugs.map((s) => [s, lessonDone(belt.slug, s)])),
    checkpoints: {},
  });

  it('volitelná lekce je poslední (7) a nikdy není aktuální', () => {
    expect(optional.order).toBe(7);
    const views = computeLessonViews(belt, beltOwned, beltDone(...required.slice(0, 5)));
    expect(views.find((v) => v.slug === optional.slug)!.optional).toBe(true);
    expect(findCurrentLesson(views)?.order).toBe(6);
    const after = computeLessonViews(belt, beltOwned, beltDone(...required));
    expect(after.find((v) => v.slug === optional.slug)!.status).toBe('available');
    expect(findCurrentLesson(after)).toBeUndefined();
    expect(findNextUnfinishedLesson(after)).toBeUndefined();
  });

  it('rozpracovaná volitelná lekce také není aktuální', () => {
    const progress: ProgressState = {
      lessons: {
        ...beltDone(...required).lessons,
        [optional.slug]: { ...lessonDone(belt.slug, optional.slug), status: 'in_progress' },
      },
      checkpoints: {},
    };
    const views = computeLessonViews(belt, beltOwned, progress);
    expect(views.find((v) => v.slug === optional.slug)!.status).toBe('in_progress');
    expect(findCurrentLesson(views)).toBeUndefined();
  });
});
