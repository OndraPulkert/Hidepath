import { type Ref } from 'react';

import { MediaSlot } from '@/components/lessons/media-slot';
import { StepExtras } from '@/components/lessons/step-extras';
import { Button } from '@/components/ui/button';
import { animationButtonText } from '@/content/animations';
import { type LessonDefinition, type LessonStep, type ProjectDefinition } from '@/content/schema';
import { typo } from '@/lib/utils/format';

/**
 * Jeden krok lekce ve velkém (dílenský režim): číslo, nadpis, text, animace, doplňky
 * (časovače, zápisník) a média. Nadpis dostane fokus při přechodu na krok.
 */
export function FocusStep({
  project,
  lesson,
  step,
  position,
  headingRef,
}: {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  step: LessonStep;
  /** Pozice kroku 1…N. */
  position: number;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <article className="flex flex-col gap-5">
      <header className="flex items-start gap-4">
        <span
          aria-hidden
          className="mt-1 inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-leather font-serif text-[22px] font-medium"
        >
          {position}
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-[clamp(26px,6.5vw,36px)] leading-tight focus-visible:outline-offset-4"
        >
          <span className="sr-only">Krok {position}: </span>
          {typo(step.title)}
        </h2>
      </header>
      <p className="max-w-prose text-[clamp(18px,4.6vw,21px)] leading-relaxed">{typo(step.body)}</p>
      {step.animationLinks ? (
        <div className="flex flex-wrap gap-2">
          {step.animationLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="secondary"
              className="h-auto flex-col items-start gap-0.5 py-2 text-left whitespace-normal"
            >
              <a href={link.href}>
                <span>
                  <span aria-hidden>▶ </span>
                  {animationButtonText(link.href)}
                </span>
                <span className="text-[14px] font-normal text-ink-2">{typo(link.label)}</span>
              </a>
            </Button>
          ))}
        </div>
      ) : null}
      <StepExtras project={project} lesson={lesson} step={step} />
      {step.media.map((m) => (
        <MediaSlot
          key={m.id}
          media={m}
          template={project.template}
          aspect={m.kind === 'video' ? 'video' : m.kind === 'photo' ? 'photo' : 'auto'}
        />
      ))}
    </article>
  );
}
