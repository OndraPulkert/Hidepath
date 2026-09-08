import { type EquipmentStatus } from '@/content/schema';
import { Segment, SegmentButton } from '@/components/ui/segment';

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  want_to_buy: 'Chci koupit',
  ordered: 'Objednáno',
  owned: 'Mám',
};

const activeClasses: Record<EquipmentStatus, string> = {
  want_to_buy: 'bg-cognac text-white',
  ordered: 'bg-brass text-leather',
  owned: 'bg-forest text-white',
};

const order: readonly EquipmentStatus[] = ['want_to_buy', 'ordered', 'owned'];

export interface StatusSegmentProps {
  value: EquipmentStatus;
  onChange: (status: EquipmentStatus) => void;
  /** Název položky pro čtečky. */
  itemName: string;
  disabled?: boolean | undefined;
}

/** Přepínač stavu položky. Aktivní stav má vždy prefix ✓ – stav nikdy jen barvou. */
export function StatusSegment({ value, onChange, itemName, disabled }: StatusSegmentProps) {
  return (
    <Segment role="group" aria-label={`Stav položky ${itemName}`}>
      {order.map((status) => (
        <SegmentButton
          key={status}
          active={value === status}
          activeClassName={activeClasses[status]}
          onClick={() => onChange(status)}
          disabled={disabled}
        >
          {value === status ? <span aria-hidden>✓</span> : null}
          {equipmentStatusLabels[status]}
        </SegmentButton>
      ))}
    </Segment>
  );
}
