import { type ComponentType } from 'react';

import { lessonBodies as cardHolderLessonBodies } from '@/content/projects/card-holder/lesson-bodies';
import { cardHolderProject } from '@/content/projects/card-holder/project';

/**
 * Dlouhé texty lekcí (MDX) podle projektu. Stránka lekce si je bere odsud podle
 * slugu z trasy, ne importem konkrétního projektu – druhý projekt se přidá jedním
 * řádkem tady, ne úpravou stránky.
 */
const registry: Readonly<Record<string, Readonly<Record<string, ComponentType>>>> = {
  [cardHolderProject.slug]: cardHolderLessonBodies,
};

export function lessonBodiesFor(projectSlug: string): Readonly<Record<string, ComponentType>> {
  return registry[projectSlug] ?? {};
}
