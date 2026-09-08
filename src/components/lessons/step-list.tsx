import { MediaSlot } from '@/components/lessons/media-slot';
import { type LessonStep, type TemplateDefinition } from '@/content/schema';
import { typo } from '@/lib/utils/format';

export function StepList({
  steps,
  template,
}: {
  steps: readonly LessonStep[];
  template: TemplateDefinition;
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
