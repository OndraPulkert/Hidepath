import { Link, useParams } from 'react-router';

import { routes } from '@/app/routes';
import { PriorityTag } from '@/components/equipment/equipment-tags';
import { ProductExamples } from '@/components/equipment/product-examples';
import { StatusSegment } from '@/components/equipment/status-segment';
import { MediaSlot } from '@/components/lessons/media-slot';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { NoticeBox } from '@/components/ui/notice-box';
import { equipmentCatalog, equipmentCategoryLabels } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { getEquipmentStatus } from '@/features/inventory/types';
import { useInventory, useUpdateInventoryItem } from '@/features/inventory/use-inventory';
import { NotFoundPage } from '@/pages/not-found-page';
import { formatCzkRange, typo } from '@/lib/utils/format';

export function ShoppingItemPage() {
  const { toolSlug = '' } = useParams<'toolSlug'>();
  const definition = equipmentCatalog[toolSlug];
  const requirement = cardHolderProject.equipment.find((e) => e.equipmentSlug === toolSlug);
  const inventory = useInventory();
  const update = useUpdateInventoryItem();

  if (!definition) return <NotFoundPage />;
  const status = getEquipmentStatus(inventory.data ?? {}, definition.slug);
  const [mainPhoto, ...otherPhotos] = definition.media;

  return (
    <>
      <Link to={routes.shopping} className="mb-6 inline-flex min-h-touch items-center text-body">
        ← Nákupní seznam
      </Link>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8">
        <div className="flex flex-col gap-4">
          {mainPhoto ? (
            <MediaSlot media={mainPhoto} aspect="auto" className="aspect-[4/3]" />
          ) : null}
          {otherPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {otherPhotos.map((m) => (
                <MediaSlot key={m.id} media={m} aspect="auto" className="aspect-[3/2]" />
              ))}
            </div>
          ) : null}
          <Card className="flex flex-col gap-2">
            <Kicker>Použijete také v</Kicker>
            <ul className="divide-y divide-dashed divide-line">
              {definition.alsoUsedFor.map((p) => (
                <li key={p} className="flex justify-between py-2 text-body">
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {requirement ? <PriorityTag priority={requirement.priority} /> : null}
              <span className="text-meta text-ink-2">
                {equipmentCategoryLabels[definition.category]}
              </span>
            </div>
            <h1 className="text-[clamp(30px,4vw,44px)]">{typo(definition.name)}</h1>
            <p className="mt-1 font-serif text-lead text-ink-2 italic">
              anglicky: {definition.englishName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <StatusSegment
              value={status}
              onChange={(s) =>
                update.mutate({ equipmentSlug: definition.slug, patch: { status: s } })
              }
              itemName={definition.name}
              disabled={inventory.isLoading}
            />
            <span className="text-body font-medium">
              {formatCzkRange(definition.priceRange.minCents, definition.priceRange.maxCents)}
              <span className="ml-2 text-meta font-normal text-ink-2">
                {definition.priceSource === 'verified' ? 'ověřený rozsah' : 'odhad'}
              </span>
            </span>
          </div>
          <p className="-mt-3 text-meta text-ink-2">{typo(definition.priceNote)}</p>

          <section>
            <h2 className="mb-2 text-h2">K čemu slouží</h2>
            <p className="max-w-prose text-body-lg">{typo(definition.purpose)}</p>
          </section>

          <section>
            <h2 className="mb-2 text-h2">
              Co koupit pro {cardHolderProject.title.toLocaleLowerCase('cs')}
            </h2>
            {requirement ? (
              <p className="mb-3 text-body text-ink-2">{requirement.specification}</p>
            ) : null}
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
              {definition.buyingGuide.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-ink-2">{row.label}</dt>
                  <dd>{typo(row.value)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {definition.cautions.length > 0 ? (
            <NoticeBox kind="safety" title="Na co si dát pozor">
              <ul>
                {definition.cautions.map((c) => (
                  <li key={c}>{typo(c)}</li>
                ))}
              </ul>
            </NoticeBox>
          ) : null}

          {definition.avoid.length > 0 ? (
            <section>
              <h2 className="mb-2 text-h2">Nekupujte</h2>
              <ul className="flex flex-col gap-2 text-body">
                {definition.avoid.map((a) => (
                  <li key={a.title} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-cognac-tint text-[12px] font-bold text-cognac-deep"
                    >
                      ×
                    </span>
                    <span>
                      <strong>{typo(a.title)}</strong> – {typo(a.reason)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {definition.alternatives.length > 0 ? (
            <section>
              <h2 className="mb-2 text-h2">Levnější nebo domácí alternativy</h2>
              <ul className="flex flex-col gap-2 text-body">
                {definition.alternatives.map((a) => (
                  <li key={a.title} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brass-tint text-[12px] font-bold text-brass"
                    >
                      ≈
                    </span>
                    <span>
                      <strong>{typo(a.title)}</strong> – {typo(a.reason)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <ProductExamples examples={definition.examples} />
        </div>
      </div>
    </>
  );
}
