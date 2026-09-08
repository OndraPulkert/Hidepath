import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Kicker } from '@/components/ui/kicker';
import { LoadingNotice } from '@/components/ui/loading-notice';
import { equipmentCatalog, equipmentCategoryLabels } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { type EquipmentCategory, type EquipmentDefinition } from '@/content/schema';
import { type InventoryItem } from '@/features/inventory/types';
import { useUpdateInventoryItem } from '@/features/inventory/use-inventory';
import { useProjectState } from '@/features/projects/use-project-state';
import { formatCzk, pluralizeCs, typo } from '@/lib/utils/format';

const categories: readonly EquipmentCategory[] = [
  'material',
  'cutting',
  'stitching',
  'gluing',
  'finishing',
];

export function WorkshopPage() {
  const project = cardHolderProject;
  const { inventory, costs, isLoading } = useProjectState(project);
  const owned = Object.values(inventory).filter((i) => i.status === 'owned');

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <Kicker className="mb-1.5">Co vlastním</Kicker>
          <h1 className="text-[clamp(28px,3.5vw,40px)]">Moje dílna</h1>
        </div>
        <p className="text-right text-meta text-ink-2">
          <span className="block text-body">
            {pluralizeCs(costs.ownedCount, ['položka', 'položky', 'položek'])} ·{' '}
            {costs.label.toLocaleLowerCase('cs')}{' '}
            <strong className="text-leather">{formatCzk(costs.recordedCents)}</strong>
          </span>
          {costs.withoutPriceCount > 0 ? (
            <span className="block">
              U {pluralizeCs(costs.withoutPriceCount, ['položky', 'položek', 'položek'])} není
              zadaná cena.
            </span>
          ) : null}
        </p>
      </header>

      {isLoading ? <LoadingNotice /> : null}
      {!isLoading && owned.length === 0 ? (
        <Card tone="dashed" className="max-w-prose">
          <p className="text-body">
            Zatím nic. Až v nákupním seznamu označíte položku jako „Mám“, objeví se tady a půjde k
            ní doplnit cenu, obchod a datum.
          </p>
        </Card>
      ) : null}

      {categories.map((category) => {
        const items = owned
          .map((item) => ({ item, def: equipmentCatalog[item.equipmentSlug] }))
          .filter(
            (x): x is { item: InventoryItem; def: EquipmentDefinition } =>
              x.def?.category === category,
          );
        if (items.length === 0) return null;
        return (
          <section key={category} className="mt-8" aria-labelledby={`ws-${category}`}>
            <h2
              id={`ws-${category}`}
              className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 text-h2"
            >
              {equipmentCategoryLabels[category]}{' '}
              <span className="font-sans text-meta text-ink-2">{items.length} pol.</span>
            </h2>
            <ul className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-4">
              {items.map(({ item, def }) => (
                <WorkshopCard key={item.id} item={item} definition={def} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

const purchaseSchema = z.object({
  price: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d+([,.]\d{1,2})?$/.test(v), 'Zadejte částku v Kč, např. 690.'),
  shopName: z.string().trim().max(80, 'Nejvýš 80 znaků.'),
  purchasedAt: z.string().trim(),
});
type PurchaseValues = z.infer<typeof purchaseSchema>;

function WorkshopCard({
  item,
  definition,
}: {
  item: InventoryItem;
  definition: EquipmentDefinition;
}) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateInventoryItem();
  const form = useForm<PurchaseValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      price: item.purchasePriceCents != null ? String(item.purchasePriceCents / 100) : '',
      shopName: item.shopName ?? '',
      purchasedAt: item.purchasedAt ?? '',
    },
  });

  const submit = form.handleSubmit((values) => {
    const cents =
      values.price === '' ? null : Math.round(Number(values.price.replace(',', '.')) * 100);
    update.mutate({
      equipmentSlug: item.equipmentSlug,
      patch: {
        purchasePriceCents: cents,
        shopName: values.shopName === '' ? null : values.shopName,
        purchasedAt: values.purchasedAt === '' ? null : values.purchasedAt,
      },
    });
    setEditing(false);
  });

  const hasDetails =
    item.purchasePriceCents != null || item.shopName !== null || item.purchasedAt !== null;
  const photo = definition.media[0];

  return (
    <li>
      <Card className="flex h-full flex-col gap-3">
        <div className="flex gap-4">
          <div
            role="img"
            aria-label={photo ? `Fotka (připravuje se): ${photo.caption}` : definition.name}
            className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-line-strong bg-parchment/60 text-[11px] text-ink-2"
          >
            Foto
          </div>
          <div className="min-w-0">
            <h3 className="text-step font-semibold">{typo(definition.name)}</h3>
            <p className="text-meta text-ink-2">{definition.englishName}</p>
            <p className="mt-1 text-meta text-ink-2">
              Použitelné: {definition.alsoUsedFor.join(', ')}
            </p>
          </div>
        </div>

        {editing ? (
          <form
            onSubmit={(e) => void submit(e)}
            noValidate
            className="mt-auto flex flex-col gap-3 border-t border-dashed border-line pt-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`price-${item.id}`}>Cena (Kč)</Label>
                <Input
                  id={`price-${item.id}`}
                  inputMode="decimal"
                  placeholder="např. 690"
                  {...form.register('price')}
                  aria-invalid={form.formState.errors.price ? true : undefined}
                />
                {form.formState.errors.price ? (
                  <p role="alert" className="mt-1 text-meta text-cognac-deep">
                    {form.formState.errors.price.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor={`date-${item.id}`}>Datum nákupu</Label>
                <Input id={`date-${item.id}`} type="date" {...form.register('purchasedAt')} />
              </div>
            </div>
            <div>
              <Label htmlFor={`shop-${item.id}`}>Obchod</Label>
              <Input
                id={`shop-${item.id}`}
                placeholder="název obchodu"
                autoComplete="off"
                {...form.register('shopName')}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="md">
                Uložit
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Zrušit
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-body">
            <span className="text-ink-2">
              {hasDetails
                ? [
                    item.purchasePriceCents != null ? formatCzk(item.purchasePriceCents) : null,
                    item.shopName,
                    item.purchasedAt
                      ? new Date(item.purchasedAt).toLocaleDateString('cs-CZ')
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : 'Bez ceny a obchodu'}
            </span>
            <Button
              variant="ghost"
              size="nav"
              className="min-h-touch px-2"
              onClick={() => setEditing(true)}
            >
              {hasDetails ? 'Upravit' : '+ Přidat cenu, obchod, datum'}
            </Button>
          </div>
        )}
      </Card>
    </li>
  );
}
