import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { MediaSlot } from '@/components/lessons/media-slot';
import { Button } from '@/components/ui/button';
import { animationButtonText, animationPages } from '@/content/animations';
import { type LessonStep, type TemplateDefinition } from '@/content/schema';
import { typo } from '@/lib/utils/format';

/** Text odkazu pod krokem podle `printLink`. */
const printLinkLabels: Record<NonNullable<LessonStep['printLink']>, string> = {
  'practice-sheets': 'Vytisknout cvičnou šablonu 1:1',
  'pattern-sheets': 'Listy střihu 1:1 k tisku',
  template: 'Vytisknout šablonu 1:1',
};

/** Kam vede odkaz pod krokem podle `printLink`. */
const printLinkRoutes: Record<NonNullable<LessonStep['printLink']>, (slug: string) => string> = {
  'practice-sheets': routes.practiceSheets,
  'pattern-sheets': routes.template,
  template: routes.template,
};

export function StepList({
  steps,
  template,
  projectSlug,
}: {
  steps: readonly LessonStep[];
  template: TemplateDefinition | undefined;
  projectSlug: string;
}) {
  return (
    <ol className="flex flex-col gap-6">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4">
          <span
            aria-hidden
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-leather font-serif text-[18px] font-medium"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h3 className="text-step font-semibold">{typo(step.title)}</h3>
            <p className="text-body text-ink-2">{typo(step.body)}</p>
            {step.printLink ? (
              <Link
                to={printLinkRoutes[step.printLink](projectSlug)}
                className="inline-flex min-h-touch items-center self-start text-body text-leather hover:text-cognac"
              >
                {printLinkLabels[step.printLink]} →
              </Link>
            ) : null}
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
