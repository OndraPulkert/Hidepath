import { cardHolderProject } from '@/content/projects/card-holder/project';
import { type LessonDefinition, type LessonStep, type ProjectDefinition } from '@/content/schema';
import { type LessonRecordEntry } from '@/features/notebook/types';

/**
 * Jen pro testy: projekt 01 bez polí zápisníku a připomínek, aby testy nezávisely na obsahu.
 */
export const projectWithoutNotebook: ProjectDefinition = {
  ...cardHolderProject,
  lessons: cardHolderProject.lessons.map((l) => ({
    ...l,
    steps: l.steps.map(({ records: _r, recalls: _c, ...s }) => s),
  })),
};

/**
 * Jen pro testy: projekt 01 s testovacími poli zápisníku a připomínkami (místo těch z obsahu).
 * Popisky jsou testovací, ne obsah lekcí.
 */
const withStep = (
  lesson: LessonDefinition,
  stepId: string,
  extra: Pick<LessonStep, 'records' | 'recalls'>,
): LessonDefinition => ({
  ...lesson,
  steps: lesson.steps.map((s) => (s.id === stepId ? { ...s, ...extra } : s)),
});

const [l1, l2, l3, l4, l5, ...rest] = projectWithoutNotebook.lessons as [
  LessonDefinition,
  LessonDefinition,
  LessonDefinition,
  LessonDefinition,
  LessonDefinition,
  ...LessonDefinition[],
];

export const notebookProject: ProjectDefinition = {
  ...cardHolderProject,
  lessons: [
    withStep(l1, 'check-chisels', {
      records: [
        { kind: 'number', id: 'chisel-pitch', label: 'Rozteč vidlice', unit: 'mm', decimals: 2 },
      ],
    }),
    l2,
    l3,
    withStep(
      withStep(l4, 'glue', {
        records: [
          {
            kind: 'choice',
            id: 'glue-hold',
            label: 'Jak drží spoj',
            options: [
              { value: 'better', label: 'Líp' },
              { value: 'same', label: 'Stejně' },
              { value: 'worse', label: 'Hůř' },
            ],
          },
        ],
      }),
      'punch-two-layers',
      { recalls: [{ fieldId: 'glue-hold', label: 'Spoj z kroku 1' }] },
    ),
    withStep(
      withStep(l5, 'print-check', {
        records: [
          {
            kind: 'number',
            id: 'print-line',
            label: 'Kontrolní úsečka',
            unit: 'mm',
            target: { min: 49.5, max: 50.5, label: 'cíl 50 mm' },
          },
          { kind: 'text', id: 'print-note', label: 'Poznámka k tisku', maxLength: 200 },
        ],
      }),
      'transfer',
      {
        recalls: [
          { fieldId: 'chisel-pitch', label: 'Rozteč vidlice z lekce 1' },
          { fieldId: 'print-line', label: 'Úsečka z kroku 1' },
        ],
      },
    ),
    ...rest,
  ],
};

const NOW = '2026-10-07T10:00:00.000Z';

export function recordEntry(
  fieldId: string,
  value: number | string | null,
  extra: Partial<LessonRecordEntry> = {},
): LessonRecordEntry {
  return {
    id: crypto.randomUUID(),
    userId: null,
    projectSlug: notebookProject.slug,
    lessonSlug: 'x',
    fieldId,
    value,
    contentVersion: 1,
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}
