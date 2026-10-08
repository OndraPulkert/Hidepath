import { type ReactNode } from 'react';

import { LESSON_ANCHORS } from '@/app/routes';
import { GlossaryText } from '@/components/glossary/glossary-term';
import { MediaSlot } from '@/components/lessons/media-slot';
import { StepLinks } from '@/components/lessons/step-links';
import { Button } from '@/components/ui/button';
import { animationButtonText, animationPages } from '@/content/animations';
import {
  type Glossary,
  type LessonStep,
  type ProjectDefinition,
  type TemplateDefinition,
} from '@/content/schema';
import { typo } from '@/lib/utils/format';

export function StepList({
  steps,
  template,
  projectSlug,
  patternSheets,
  renderStepExtras,
  glossary,
}: {
  steps: readonly LessonStep[];
  template: TemplateDefinition | undefined;
  projectSlug: string;
  /** Listy střihu projektu: u pásku vedou odkazy na tisk na „Váš pásek“. */
  patternSheets?: ProjectDefinition['patternSheets'];
  /** Doplňky pod textem kroku (časovače, zápisník, připomínky); `index` od 0. */
  renderStepExtras?: (step: LessonStep, index: number) => ReactNode;
  /** Slovníček projektu: zkratky v textu kroku dostanou vysvětlivku (první výskyt v kroku). */
  glossary?: Glossary | undefined;
}) {
  return (
    <ol className="flex flex-col gap-6">
      {steps.map((step, index) => (
        <li key={step.id} id={LESSON_ANCHORS.step(index + 1)} className="flex scroll-mt-24 gap-4">
          <span
            aria-hidden
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-leather font-serif text-[18px] font-medium"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h3 className="text-step font-semibold">{typo(step.title)}</h3>
            <p className="text-body text-ink-2">
              <GlossaryText text={typo(step.body)} entries={glossary?.entries} />
            </p>
            <StepLinks step={step} project={{ slug: projectSlug, patternSheets }} />
            {step.animationLinks ? (
              // Obyčejné odkazy, ne router <Link>: animace jsou statické stránky mimo SPA
              // (public/animace, offline z precache service workeru).
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
                        <span aria-hidden>{isThreadGuide(link.href) ? '📏 ' : '▶ '}</span>
                        {animationButtonText(link.href)}
                      </span>
                      <span className="text-[14px] font-normal text-ink-2">{typo(link.label)}</span>
                    </a>
                  </Button>
                ))}
              </div>
            ) : null}
            {renderStepExtras?.(step, index)}
            {step.media.map((m) => (
              <MediaSlot
                key={m.id}
                media={m}
                template={template}
                aspect={m.kind === 'video' ? 'video' : m.kind === 'photo' ? 'photo' : 'auto'}
              />
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

const isThreadGuide = (href: string) => href.startsWith(animationPages.threadLength.path);
