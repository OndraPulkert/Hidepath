import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/**
 * Štítek tužšího podkladu výtisku („Nalepit na tenkou lepenku – …“). Text skládá
 * `mountText` z `mount` výtisku v lekci; tady se jen zobrazí, zalomený na úzkém displeji.
 */
export function PrintMountBadge({ text, className }: { text: string; className?: string }) {
  return (
    <Tag
      tone="ordered"
      data-print-mount=""
      className={cn('self-start px-2 py-0.5 text-left whitespace-normal', className)}
    >
      {typo(text)}
    </Tag>
  );
}
