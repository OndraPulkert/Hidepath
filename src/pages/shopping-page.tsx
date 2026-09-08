import { useState } from 'react';

import { EquipmentRow } from '@/components/equipment/equipment-row';
import { prioritySubtitles, priorityLabels } from '@/components/equipment/equipment-tags';
import { ReadinessSummary } from '@/components/equipment/readiness-summary';
import { equipmentStatusLabels } from '@/components/equipment/status-segment';
import { Kicker } from '@/components/ui/kicker';
import { LoadingNotice } from '@/components/ui/loading-notice';
import { Segment, SegmentButton } from '@/components/ui/segment';
import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { type EquipmentPriority, type EquipmentStatus } from '@/content/schema';
import { getEquipmentStatus } from '@/features/inventory/types';
import { useUpdateInventoryItem } from '@/features/inventory/use-inventory';
import { useProjectState } from '@/features/projects/use-project-state';

type Filter = 'all' | EquipmentStatus;
const filters: readonly Filter[] = ['all', 'want_to_buy', 'ordered', 'owned'];
const priorities: readonly EquipmentPriority[] = ['required', 'recommended', 'later'];

export function ShoppingPage() {
  const project = cardHolderProject;
  const { inventory, readiness, budget, isLoading } = useProjectState(project);
  const update = useUpdateInventoryItem();
  const [filter, setFilter] = useState<Filter>('all');

  const counts: Record<EquipmentStatus, number> = {
    want_to_buy: readiness.wantToBuy,
    ordered: readiness.ordered,
    owned: readiness.owned,
  };
  const visible = project.equipment.filter(
    (req) => filter === 'all' || getEquipmentStatus(inventory, req.equipmentSlug) === filter,
  );

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <Kicker className="mb-1.5">{project.title} · Vybavení</Kicker>
          <h1 className="text-[clamp(28px,3.5vw,40px)]">Nákupní seznam</h1>
        </div>
        <Segment role="group" aria-label="Filtr podle stavu">
          {filters.map((f) => (
            <SegmentButton key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Vše' : `${equipmentStatusLabels[f]} (${counts[f]})`}
            </SegmentButton>
          ))}
        </Segment>
      </header>

      {isLoading ? <LoadingNotice /> : <ReadinessSummary readiness={readiness} budget={budget} />}

      {priorities.map((priority) => {
        const items = visible.filter((req) => req.priority === priority);
        if (items.length === 0) return null;
        return (
          <section key={priority} className="mt-8" aria-labelledby={`group-${priority}`}>
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
              <h2 id={`group-${priority}`} className="text-h2">
                {priorityLabels[priority]}
              </h2>
              <span className="text-meta text-ink-2">{prioritySubtitles[priority]}</span>
            </div>
            <ul>
              {items.map((req) => {
                const def = equipmentCatalog[req.equipmentSlug];
                if (!def) return null;
                return (
                  <EquipmentRow
                    key={req.equipmentSlug}
                    definition={def}
                    status={getEquipmentStatus(inventory, req.equipmentSlug)}
                    onChange={(status) =>
                      update.mutate({ equipmentSlug: req.equipmentSlug, patch: { status } })
                    }
                    disabled={isLoading}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}

      {visible.length === 0 ? (
        <p className="mt-8 text-body text-ink-2">V tomto filtru nic není.</p>
      ) : null}
    </>
  );
}
