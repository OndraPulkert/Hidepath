import { type CheckpointDefinition } from '@/content/schema';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

export interface CheckpointListProps {
  /** Prefix pro id checkboxů – unikátní i při více lekcích na stránce. */
  lessonSlug: string;
  checkpoints: readonly CheckpointDefinition[];
  isCompleted: (slug: string) => boolean;
  onToggle: (slug: string, completed: boolean) => void;
  disabled?: boolean;
}

/** Kontrolní body: box forest-tint, checkbox 28 px, řádek min-h 44. */
export function CheckpointList({
  lessonSlug,
  checkpoints,
  isCompleted,
  onToggle,
  disabled,
}: CheckpointListProps) {
  return (
    <ul className="flex flex-col divide-y divide-forest/20">
      {checkpoints.map((cp) => {
        const done = isCompleted(cp.slug);
        const id = `cp-${lessonSlug}-${cp.slug}`;
        return (
          <li key={cp.slug} className="flex min-h-touch items-start gap-3 py-2.5">
            <input
              id={id}
              type="checkbox"
              checked={done}
              disabled={disabled}
              onChange={(e) => onToggle(cp.slug, e.target.checked)}
              className={cn(
                'mt-0.5 size-7 shrink-0 appearance-none rounded-control border-[1.5px] border-forest bg-paper',
                'checked:bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Cpath fill=%27none%27 stroke=%27%23fff%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M5 10.5l3.5 3.5L15 7%27/%3E%3C/svg%3E")] checked:bg-forest checked:bg-center checked:bg-no-repeat',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cognac disabled:opacity-45',
              )}
            />
            <label htmlFor={id} className={cn('flex-1 pt-0.5 text-body', disabled && 'opacity-70')}>
              <span className={cn(done && 'text-forest')}>{typo(cp.title)}</span>
              {!cp.required ? <span className="ml-2 text-meta text-ink-2">nepovinné</span> : null}
              {cp.description ? (
                <span className="mt-0.5 block text-meta text-ink-2">{cp.description}</span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
