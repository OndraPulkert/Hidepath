import { type ProjectDefinition } from '@/content/schema';

/**
 * Testovací čekání pro dílenský režim: obsah je zatím nemá. Přidá do kroku „glue“ lekce
 * `04-saddle-stitch` pouzdra na karty dvě čekání (rozsah 10–15 min a 60 min blokující
 * krok „hold-work“). Ostatní projekty vrátí beze změny.
 */
export function addTestWaits(project: ProjectDefinition): ProjectDefinition {
  if (project.slug !== 'card-holder') return project;
  return {
    ...project,
    lessons: project.lessons.map((lesson) =>
      lesson.slug !== '04-saddle-stitch'
        ? lesson
        : {
            ...lesson,
            steps: lesson.steps.map((step) =>
              step.id !== 'glue'
                ? step
                : {
                    ...step,
                    waits: [
                      {
                        id: 'tack',
                        label: 'Test: zavadnutí lepidla',
                        minutes: 10,
                        maxMinutes: 15,
                        basis: 'text' as const,
                      },
                      {
                        id: 'set',
                        label: 'Test: zatuhnutí spoje',
                        minutes: 60,
                        basis: 'text' as const,
                        blocksStepId: 'hold-work',
                      },
                    ],
                  },
            ),
          },
    ),
  };
}
