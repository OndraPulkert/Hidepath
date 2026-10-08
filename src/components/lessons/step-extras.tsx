import { StepBeltRecalls } from '@/components/belt/step-belt-recalls';
import { StepLidSheetRecalls } from '@/components/lid-wallet/step-lid-sheet-recalls';
import { StepRecalls } from '@/components/notebook/step-recalls';
import { StepRecordFields } from '@/components/notebook/step-record-fields';
import { StepTimers } from '@/components/workshop/step-timers';
import { type LessonDefinition, type LessonStep, type ProjectDefinition } from '@/content/schema';
import { type TimerOrigin } from '@/features/timers/timers';

/** Společné props doplňků pod krokem (časovače, zápisník, připomínky). */
export interface StepExtrasProps {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  step: LessonStep;
  /** Odkud se spouští časovače (kam pak vedou odkazy „Ke kroku“); výchozí dílenský režim. */
  timerOrigin?: TimerOrigin;
}

/**
 * Doplňky pod krokem lekce: hodnoty aktivního pásku nebo formuláře listů Víčka, připomínky
 * dřívějších zápisů, časovače čekání a pole zápisníku (v tomto pořadí – co se zapisuje, se
 * obvykle zjistí až po čekání). Krok bez `beltRecalls`, `lidSheetRecalls`, `recalls`,
 * `records` i `waits` nevykreslí nic. Používá ho běžná lekce (`StepList` → `renderStepExtras`)
 * i dílenský režim.
 */
export function StepExtras({ project, lesson, step, timerOrigin }: StepExtrasProps) {
  if (!step.recalls && !step.beltRecalls && !step.lidSheetRecalls && !step.records && !step.waits) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3">
      {step.beltRecalls ? <StepBeltRecalls project={project} keys={step.beltRecalls} /> : null}
      {step.lidSheetRecalls ? (
        <StepLidSheetRecalls project={project} keys={step.lidSheetRecalls} />
      ) : null}
      <StepRecalls project={project} lesson={lesson} step={step} />
      <StepTimers
        project={project}
        lesson={lesson}
        step={step}
        {...(timerOrigin ? { timerOrigin } : {})}
      />
      <StepRecordFields project={project} lesson={lesson} step={step} />
    </div>
  );
}
