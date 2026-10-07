import { StepRecalls } from '@/components/notebook/step-recalls';
import { StepRecordFields } from '@/components/notebook/step-record-fields';
import { StepTimers } from '@/components/workshop/step-timers';
import { type LessonDefinition, type LessonStep, type ProjectDefinition } from '@/content/schema';

/** Společné props doplňků pod krokem (časovače, zápisník, připomínky). */
export interface StepExtrasProps {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  step: LessonStep;
}

/**
 * Doplňky pod krokem lekce: připomínky dřívějších zápisů, časovače čekání a pole zápisníku
 * (v tomto pořadí – co se zapisuje, se obvykle zjistí až po čekání).
 * Krok bez `recalls`, `records` i `waits` nevykreslí nic. Používá ho běžná lekce
 * (`StepList` → `renderStepExtras`) i dílenský režim.
 */
export function StepExtras({ project, lesson, step }: StepExtrasProps) {
  if (!step.recalls && !step.records && !step.waits) return null;
  return (
    <div className="flex flex-col gap-3">
      <StepRecalls project={project} lesson={lesson} step={step} />
      <StepTimers project={project} lesson={lesson} step={step} />
      <StepRecordFields project={project} lesson={lesson} step={step} />
    </div>
  );
}
