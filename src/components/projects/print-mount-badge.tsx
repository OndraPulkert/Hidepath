import { Tag } from '@/components/ui/tag';
import { CARDBOARD_NOTE } from '@/features/prep/print-mount';
import { cn } from '@/lib/utils/cn';
import { typo } from '@/lib/utils/format';

/**
 * Štítek podkladu výtisku („Nalepit na tenký karton (krabice od cereálií) – …“). Text skládá
 * `mountText` z `mount` výtisku v lekci; tady se jen zobrazí, zalomený na úzkém displeji.
 * Nápověda vysvětlí, co je tenký karton.
 */
export function PrintMountBadge({ text, className }: { text: string; className?: string }) {
  return (
    <Tag
      tone="ordered"
      data-print-mount=""
      title={typo(CARDBOARD_NOTE)}
      className={cn('self-start px-2 py-0.5 text-left whitespace-normal', className)}
    >
      {typo(text)}
    </Tag>
  );
}
