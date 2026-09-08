import { cardHolderProject } from '@/content/projects/card-holder/project';
import { computeJourney } from '@/features/progress/journey';
import {
  checkpointKey,
  EMPTY_PROGRESS,
  type EnrollmentRecord,
  type ProgressState,
} from '@/features/progress/types';
import {
  checkpointDone,
  enrollment as enrollmentOf,
  inventoryOf,
  item,
  lessonDone,
} from '@/test/factories';

const project = cardHolderProject;
const enrollment: EnrollmentRecord = enrollmentOf(project.slug);
const requiredSlugs = project.equipment
  .filter((e) => e.priority === 'required')
  .map((e) => e.equipmentSlug);
const ownedAll = inventoryOf(...requiredSlugs.map((s) => item(s, 'owned')));

function progressWithLessonsDone(...slugs: string[]): ProgressState {
  return {
    lessons: Object.fromEntries(slugs.map((s) => [s, lessonDone(project.slug, s)])),
    checkpoints: checkpointsDone(...slugs),
  };
}

function checkpointsDone(...slugs: string[]): ProgressState['checkpoints'] {
  return Object.fromEntries(
    slugs.flatMap((s) =>
      project.lessons
        .find((l) => l.slug === s)!
        .checkpoints.map((c) => [
          checkpointKey(s, c.slug),
          checkpointDone(project.slug, s, c.slug),
        ]),
    ),
  );
}

describe('computeJourney', () => {
  it('bez zápisu do projektu je vše na nule a aktuální je Výběr projektu', () => {
    const j = computeJourney(project, {
      enrollment: null,
      inventory: {},
      progress: EMPTY_PROGRESS,
    });
    expect(j.overallRatio).toBe(0);
    expect(j.currentPhase.slug).toBe('choose-project');
    expect(j.currentPhaseNumber).toBe(1);
  });

  it('po výběru projektu je aktuální fáze Vybavení a ukazuje počet nezbytných', () => {
    const j = computeJourney(project, { enrollment, inventory: {}, progress: EMPTY_PROGRESS });
    expect(j.currentPhase.slug).toBe('equipment');
    expect(j.currentPhase.detail).toBe(`0 z ${requiredSlugs.length} nezbytných`);
    expect(j.phases[0]!.isComplete).toBe(true);
  });

  it('objednané položky do postupu fáze Vybavení nepočítá', () => {
    const inventory = inventoryOf(...requiredSlugs.map((s) => item(s, 'ordered')));
    const j = computeJourney(project, { enrollment, inventory, progress: EMPTY_PROGRESS });
    expect(j.phases[1]!.done).toBe(0);
  });

  it('celá cesta se počítá z povinných úkolů, ne z navštívených obrazovek', () => {
    const j = computeJourney(project, {
      enrollment,
      inventory: ownedAll,
      progress: EMPTY_PROGRESS,
    });
    const totalRequiredCheckpoints = project.lessons
      .flatMap((l) => l.checkpoints)
      .filter((c) => c.required).length;
    const totalTasks = 1 + requiredSlugs.length + totalRequiredCheckpoints + 1;
    expect(j.overallRatio).toBeCloseTo((1 + requiredSlugs.length) / totalTasks);
    expect(j.currentPhase.slug).toBe('workspace');
  });

  it('fáze lekcí ukazuje dílčí postup z kontrolních bodů a hotové lekce', () => {
    const progress = progressWithLessonsDone('01-prepare-workspace', '02-straight-cut');
    const j = computeJourney(project, { enrollment, inventory: ownedAll, progress });
    const practice = j.phases.find((p) => p.slug === 'practice')!;
    expect(practice.isCurrent).toBe(true);
    expect(practice.detail).toBe('1 ze 3 lekcí');
    expect(practice.ratio).toBeGreaterThan(0);
    expect(practice.ratio).toBeLessThan(1);
    expect(j.completedLessons).toBe(2);
    expect(j.totalLessons).toBe(6);
  });

  it('odškrtané body bez stisknutí Dokončit fázi lekcí neuzavřou', () => {
    const allChecked: ProgressState = {
      lessons: {},
      checkpoints: checkpointsDone(...project.lessons.map((l) => l.slug)),
    };
    const j = computeJourney(project, { enrollment, inventory: ownedAll, progress: allChecked });
    expect(j.currentPhase.kind).not.toBe('completion');
    expect(j.currentPhase.slug).toBe('workspace');
    expect(j.phases.find((p) => p.slug === 'build')!.isComplete).toBe(false);
    expect(j.completedLessons).toBe(0);
  });

  it('aktuální fáze sleduje dostupnou lekci, i když ve fázi Vybavení něco chybí', () => {
    const inventory = inventoryOf(
      ...requiredSlugs.map((s) => item(s, s === 'stitching-chisels' ? 'ordered' : 'owned')),
    );
    const j = computeJourney(project, {
      enrollment,
      inventory,
      progress: progressWithLessonsDone('01-prepare-workspace'),
    });
    expect(j.currentPhase.slug).toBe('practice');
    expect(j.phases.find((p) => p.slug === 'equipment')!.isComplete).toBe(false);
  });

  it('po všech lekcích zbývá Hodnocení; po označení projektu za hotový je 100 %', () => {
    const allDone = progressWithLessonsDone(...project.lessons.map((l) => l.slug));
    const j = computeJourney(project, { enrollment, inventory: ownedAll, progress: allDone });
    expect(j.currentPhase.slug).toBe('review');
    expect(j.overallRatio).toBeLessThan(1);

    const finished = computeJourney(project, {
      enrollment: { ...enrollment, status: 'completed', completedAt: 'x' },
      inventory: ownedAll,
      progress: allDone,
    });
    expect(finished.overallRatio).toBe(1);
    expect(finished.currentPhase.slug).toBe('review');
    expect(finished.currentPhaseNumber).toBe(6);
  });
});
