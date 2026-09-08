import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { type EquipmentStatus } from '@/content/schema';
import { useDataContext } from '@/features/data/data-provider';
import { newId, nowIso } from '@/features/data/local-collection';
import { mutationScopes, queryKeys } from '@/features/data/query-keys';
import { type InventoryItem, type InventoryState } from '@/features/inventory/types';

function toState(items: readonly InventoryItem[]): InventoryState {
  return Object.fromEntries(items.map((i) => [i.equipmentSlug, i]));
}

export function useInventory() {
  const { repositories: repos, scope } = useDataContext();
  return useQuery({
    queryKey: queryKeys.inventory(scope),
    queryFn: async () => toState(await repos.inventory.list()),
  });
}

export interface InventoryPatch {
  status?: EquipmentStatus;
  purchasePriceCents?: number | null;
  shopName?: string | null;
  purchasedAt?: string | null;
  notes?: string | null;
}

/** Sloučí patch nad aktuálním záznamem (nebo prázdným výchozím) do úplného záznamu. */
export function applyInventoryPatch(
  current: InventoryItem | undefined,
  equipmentSlug: string,
  patch: InventoryPatch,
  id: string,
  now: string,
): InventoryItem {
  return {
    id,
    userId: current?.userId ?? null,
    equipmentSlug,
    status: patch.status ?? current?.status ?? 'want_to_buy',
    purchasePriceCents:
      patch.purchasePriceCents !== undefined
        ? patch.purchasePriceCents
        : (current?.purchasePriceCents ?? null),
    currency: current?.currency ?? 'CZK',
    shopName: patch.shopName !== undefined ? patch.shopName : (current?.shopName ?? null),
    purchasedAt:
      patch.purchasedAt !== undefined ? patch.purchasedAt : (current?.purchasedAt ?? null),
    notes: patch.notes !== undefined ? patch.notes : (current?.notes ?? null),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
}

interface UpdateVariables {
  equipmentSlug: string;
  patch: InventoryPatch;
}

/**
 * Zapíše stav položky. Úplný záznam (včetně skutečného UUID) vzniká před spuštěním mutace nad
 * NAČTENÝM stavem (`ensureQueryData` dotáhne data, pokud cache ještě není naplněná), takže
 * zápis nikdy nepřepíše cenu nebo obchod prázdnými hodnotami a nezaloží duplicitní řádek.
 */
export function useUpdateInventoryItem() {
  const { repositories: repos, scope } = useDataContext();
  const queryClient = useQueryClient();
  const key = queryKeys.inventory(scope);

  const mutation = useMutation({
    scope: mutationScopes.inventory(scope),
    mutationFn: (record: InventoryItem) => repos.inventory.upsert(record),
    onMutate: (record) => {
      const previous = queryClient.getQueryData<InventoryState>(key) ?? {};
      queryClient.setQueryData<InventoryState>(key, {
        ...previous,
        [record.equipmentSlug]: record,
      });
      return { previous };
    },
    onError: (_error, _record, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<InventoryState>(key, (prev) => ({
        ...(prev ?? {}),
        [saved.equipmentSlug]: saved,
      }));
    },
  });

  const buildRecord = useCallback(
    async ({ equipmentSlug, patch }: UpdateVariables): Promise<InventoryItem> => {
      const state = await queryClient.ensureQueryData<InventoryState>({
        queryKey: key,
        queryFn: async () => toState(await repos.inventory.list()),
      });
      const current = state[equipmentSlug];
      return applyInventoryPatch(current, equipmentSlug, patch, current?.id ?? newId(), nowIso());
    },
    [key, queryClient, repos],
  );

  const mutateAsync = useCallback(
    async (vars: UpdateVariables) => mutation.mutateAsync(await buildRecord(vars)),
    [buildRecord, mutation],
  );

  return {
    mutate: (vars: UpdateVariables) => {
      void mutateAsync(vars).catch(() => {
        /* chyba je v mutation.error a ve stavovém pruhu */
      });
    },
    mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
