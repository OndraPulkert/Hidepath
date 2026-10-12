import { describe, expect, it } from 'vitest';

import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import {
  lessonCountLabel,
  lessonCounts,
  nextLessonAfterFinish,
} from '@/features/progress/lesson-count';

describe('počet lekcí a další lekce po dokončení', () => {
  it('pásek: 6 povinných lekcí + volitelná lekce 7, čas projektu popisuje jen povinné', () => {
    expect(lessonCounts(beltProject)).toEqual({ required: 6, optional: 1 });
    expect(lessonCountLabel(beltProject)).toBe('6 lekcí + 1 volitelná');
    const requiredMinutes = beltProject.lessons
      .filter((l) => !l.optional)
      .reduce((sum, l) => sum + l.estimatedMinutes, 0);
    expect(requiredMinutes).toBeLessThanOrEqual(beltProject.estimatedHours.max * 60);
  });

  it('projekt bez volitelných lekcí ukáže jen počet', () => {
    expect(lessonCountLabel(cardHolderProject)).toBe(`${cardHolderProject.lessons.length} lekcí`);
  });

  it('po poslední povinné lekci nevede dokončení do volitelné lekce', () => {
    const slug = (order: number) => beltProject.lessons.find((l) => l.order === order)!.slug;
    expect(nextLessonAfterFinish(beltProject.lessons, slug(5))?.slug).toBe(slug(6));
    expect(nextLessonAfterFinish(beltProject.lessons, slug(6))).toBeUndefined();
    expect(nextLessonAfterFinish(beltProject.lessons, slug(7))).toBeUndefined();
  });
});
