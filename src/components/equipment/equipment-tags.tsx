import { type EquipmentPriority, type EquipmentStatus } from '@/content/schema';
import { Tag } from '@/components/ui/tag';

export const priorityLabels: Record<EquipmentPriority, string> = {
  required: 'Nezbytné',
  recommended: 'Doporučené',
  later: 'Kup později',
};

export const prioritySubtitles: Record<EquipmentPriority, string> = {
  required: 'bez nich nelze začít · seřazeno podle toho, kdy je v lekcích potřebujete',
  recommended: 'usnadní práci, jde odložit',
  later: 'až na další projekty',
};

export function PriorityTag({ priority }: { priority: EquipmentPriority }) {
  return (
    <Tag tone={priority === 'required' ? 'missing' : 'optional'}>{priorityLabels[priority]}</Tag>
  );
}

/** Štítek připravenosti položky: Připraveno · Objednáno · na cestě · Chybí (· volitelné). */
export function ReadinessTag({
  status,
  priority,
}: {
  status: EquipmentStatus;
  priority: EquipmentPriority;
}) {
  if (status === 'owned') return <Tag tone="ready">✓ Připraveno</Tag>;
  if (status === 'ordered') return <Tag tone="ordered">Objednáno · na cestě</Tag>;
  if (priority === 'required') return <Tag tone="missing">Chybí</Tag>;
  return <Tag tone="optional">Chybí · volitelné</Tag>;
}
