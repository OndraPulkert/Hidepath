import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { StatusSegment } from '@/components/equipment/status-segment';
import { type EquipmentDefinition, type EquipmentStatus } from '@/content/schema';
import { formatCzkRange, typo } from '@/lib/utils/format';

export interface EquipmentRowProps {
  definition: EquipmentDefinition;
  status: EquipmentStatus;
  onChange: (status: EquipmentStatus) => void;
  /** Během načítání dat se stav nesmí měnit (zápis nad neznámým stavem). */
  disabled?: boolean;
}

/** Řádek nákupního seznamu podle styleguidu: foto 84 px, název + EN, popis, cena + detail, segment. */
export function EquipmentRow({ definition, status, onChange, disabled }: EquipmentRowProps) {
  const photo = definition.media[0];
  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-dashed border-line py-5 last:border-b-0">
      <div
        role="img"
        aria-label={photo ? `Fotka (připravuje se): ${photo.caption}` : definition.name}
        className="flex size-thumb shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-line-strong bg-parchment/60 p-1 text-center text-[11px] leading-tight text-ink-2"
      >
        Foto · připravuje se
      </div>
      <div className="min-w-[220px] flex-1">
        <h3 className="flex flex-wrap items-baseline gap-x-2 text-row font-semibold">
          <span>{typo(definition.name)}</span>
          <span className="font-serif text-[15px] font-normal text-ink-2 italic">
            {definition.englishName}
          </span>
        </h3>
        <p className="mt-0.5 max-w-prose text-body text-ink-2">
          {typo(definition.shortDescription)}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-body">
          <span className="font-medium">
            {formatCzkRange(definition.priceRange.minCents, definition.priceRange.maxCents)}
            <span className="ml-1.5 text-meta font-normal text-ink-2">
              {definition.priceSource === 'verified' ? 'ověřený rozsah' : 'odhad'}
            </span>
          </span>
          <Link
            to={routes.shoppingItem(definition.slug)}
            className="inline-flex min-h-touch items-center"
          >
            detail →
          </Link>
        </p>
      </div>
      <StatusSegment
        value={status}
        onChange={onChange}
        itemName={definition.name}
        disabled={disabled}
      />
    </li>
  );
}
