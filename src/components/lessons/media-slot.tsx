import { AssembledIllustration } from '@/components/illustrations/assembled';
import { BladeAngleIllustration } from '@/components/illustrations/blade-angle';
import { SaddleStitchIllustration } from '@/components/illustrations/saddle-stitch';
import { StitchOffsetIllustration } from '@/components/illustrations/stitch-offset';
import { TemplateIllustration } from '@/components/illustrations/template';
import { type MediaSlot as MediaSlotDefinition, type TemplateDefinition } from '@/content/schema';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

export interface MediaSlotProps {
  media: MediaSlotDefinition;
  /** Pro ilustrace šablony a sestavení. */
  template?: TemplateDefinition | undefined;
  aspect?: 'video' | 'photo' | 'auto';
  className?: string;
}

const kindLabels = { photo: 'Fotka', video: 'Video', illustration: 'Ilustrace' } as const;

function renderIllustration(media: MediaSlotDefinition, template: TemplateDefinition | undefined) {
  switch (media.illustration) {
    case 'template':
      return template ? <TemplateIllustration template={template} title={media.caption} /> : null;
    case 'assembled':
      return template ? <AssembledIllustration template={template} title={media.caption} /> : null;
    case 'stitch-offset':
      return <StitchOffsetIllustration title={media.caption} />;
    case 'saddle-stitch':
      return <SaddleStitchIllustration title={media.caption} />;
    case 'blade-angle':
      return <BladeAngleIllustration title={media.caption} />;
    default:
      return null;
  }
}

/**
 * Slot média (ADR 001). Dostupná ilustrace se vykreslí inline, dostupné video jako odkaz
 * (video jen online), plánovaný záběr jako čárkovaný rámeček s popiskem, co má zachytit.
 * Nikdy nevykreslí prázdný rámeček: když ilustraci nelze sestavit, propadne na placeholder.
 */
export function MediaSlot({ media, template, aspect = 'photo', className }: MediaSlotProps) {
  const illustration =
    media.status === 'available' && media.kind === 'illustration'
      ? renderIllustration(media, template)
      : null;
  if (illustration) {
    return (
      <figure className={cn('overflow-hidden rounded-md border border-line bg-paper', className)}>
        {illustration}
        <figcaption className="border-t border-line px-3 py-2 text-meta text-ink-2">
          {typo(media.caption)}
        </figcaption>
      </figure>
    );
  }

  if (media.status === 'available' && media.kind === 'photo' && media.src) {
    return (
      <figure className={cn('overflow-hidden rounded-md border border-line bg-paper', className)}>
        <img src={media.src} alt={media.caption} loading="lazy" className="w-full washed" />
        <figcaption className="px-3 py-2 text-meta text-ink-2">{typo(media.caption)}</figcaption>
      </figure>
    );
  }

  if (media.status === 'available' && media.kind === 'video' && media.src) {
    return (
      <a
        href={media.src}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          'flex min-h-touch items-center gap-3 rounded-md border border-line bg-paper px-4 py-3 no-underline',
          className,
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full bg-leather text-canvas"
        >
          ▶
        </span>
        <span className="text-body font-medium text-leather">
          Video postupu{media.durationSeconds ? ` · ${formatDuration(media.durationSeconds)}` : ''}
        </span>
        <span className="ml-auto text-meta text-ink-2">externí zdroj · jen online</span>
        <span className="sr-only">(otevře se v novém okně)</span>
      </a>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${kindLabels[media.kind]} (připravuje se): ${media.caption}`}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-parchment/50 px-6 py-8 text-center',
        aspect === 'video' && 'aspect-video',
        aspect === 'photo' && 'aspect-[3/2]',
        className,
      )}
    >
      <span className="kicker">{kindLabels[media.kind]} · připravuje se</span>
      <p className="max-w-[36ch] text-meta text-ink-2">{typo(media.caption)}</p>
      {media.kind === 'video' && media.durationSeconds ? (
        <span className="text-meta text-ink-2">
          plánovaná délka {formatDuration(media.durationSeconds)}
        </span>
      ) : null}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
