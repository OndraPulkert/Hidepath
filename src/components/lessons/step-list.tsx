import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { MediaSlot } from '@/components/lessons/media-slot';
import { type LessonStep, type TemplateDefinition } from '@/content/schema';
import { typo } from '@/lib/utils/format';

/** Text odkazu pod krokem podle `printLink`. */
const printLinkLabels: Record<NonNullable<LessonStep['printLink']>, string> = {
  'practice-sheets': 'Vytisknout cvičnou šablonu 1:1',
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
            {step.printLink === 'practice-sheets' ? (
              <Link
                to={routes.practiceSheets(projectSlug)}
                className="inline-flex min-h-touch items-center self-start text-body text-leather hover:text-cognac"
              >
                {printLinkLabels[step.printLink]} →
              </Link>
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
