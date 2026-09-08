import { type PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { type CollectionRepository } from '@/features/data/local-collection';
import { type Repositories } from '@/features/data/repositories';
import { type InventoryItem } from '@/features/inventory/types';
import {
  type CheckpointProgressRecord,
  type EnrollmentRecord,
  type LessonProgressRecord,
} from '@/features/progress/types';
import { type AppSupabaseClient } from '@/lib/supabase/client';
import { type Database } from '@/lib/supabase/database.types';

/**
 * Repozitáře nad Supabase. Hranice mezi typovaným světem aplikace a PostgREST:
 * řádky z databáze se validují Zodem (žádné tiché `any`), zápisy jdou přes typy `Insert`
 * z generovaného schématu. Upsert jde přes primární klíč `id` (klientské UUID); kolizi
 * přirozeného klíče (stejná položka z druhého zařízení) sloučí do existujícího řádku.
 */

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Insert<T extends TableName> = Tables[T]['Insert'];

const UNIQUE_VIOLATION = '23505';

const base = {
  id: z.uuid(),
  user_id: z.uuid(),
  created_at: z.string(),
  updated_at: z.string(),
};

const rowSchemasDefinition = {
  inventory_items: z.object({
    ...base,
    equipment_slug: z.string(),
    status: z.enum(['want_to_buy', 'ordered', 'owned']),
    purchase_price_cents: z.number().int().nullable(),
    currency: z.string(),
    shop_name: z.string().nullable(),
    purchased_at: z.string().nullable(),
    notes: z.string().nullable(),
  }),
  project_enrollments: z.object({
    ...base,
    project_slug: z.string(),
    content_version: z.number().int(),
    status: z.enum(['active', 'completed', 'archived']),
    started_at: z.string(),
    completed_at: z.string().nullable(),
  }),
  lesson_progress: z.object({
    ...base,
    project_slug: z.string(),
    lesson_slug: z.string(),
    status: z.enum(['available', 'in_progress', 'completed']),
    started_at: z.string().nullable(),
    completed_at: z.string().nullable(),
  }),
  checkpoint_progress: z.object({
    ...base,
    project_slug: z.string(),
    lesson_slug: z.string(),
    checkpoint_slug: z.string(),
    completed: z.boolean(),
  }),
};

type RowSchemas = typeof rowSchemasDefinition;
type RowOf<T extends keyof RowSchemas> = z.infer<RowSchemas[T]>;

/** Stejná schémata indexovaná typem, který jde použít s generickým klíčem tabulky. */
const rowSchemas: { [K in keyof RowSchemas]: z.ZodType<RowOf<K>> } = rowSchemasDefinition;

/** Mapování řádků ↔ záznamů. Čisté funkce. */
export const mappers = {
  inventory: {
    fromRow(row: RowOf<'inventory_items'>): InventoryItem {
      return {
        id: row.id,
        userId: row.user_id,
        equipmentSlug: row.equipment_slug,
        status: row.status,
        purchasePriceCents: row.purchase_price_cents,
        currency: row.currency,
        shopName: row.shop_name,
        purchasedAt: row.purchased_at,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    toRow(record: InventoryItem, userId: string): Insert<'inventory_items'> {
      return {
        id: record.id,
        user_id: userId,
        equipment_slug: record.equipmentSlug,
        status: record.status,
        purchase_price_cents: record.purchasePriceCents,
        currency: record.currency,
        shop_name: record.shopName,
        purchased_at: record.purchasedAt,
        notes: record.notes,
        updated_at: record.updatedAt,
      };
    },
    naturalKey: (r: InventoryItem): Record<string, string> => ({ equipment_slug: r.equipmentSlug }),
  },
  enrollments: {
    fromRow(row: RowOf<'project_enrollments'>): EnrollmentRecord {
      return {
        id: row.id,
        userId: row.user_id,
        projectSlug: row.project_slug,
        contentVersion: row.content_version,
        status: row.status,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    toRow(record: EnrollmentRecord, userId: string): Insert<'project_enrollments'> {
      return {
        id: record.id,
        user_id: userId,
        project_slug: record.projectSlug,
        content_version: record.contentVersion,
        status: record.status,
        started_at: record.startedAt,
        completed_at: record.completedAt,
        updated_at: record.updatedAt,
      };
    },
    naturalKey: (r: EnrollmentRecord): Record<string, string> => ({ project_slug: r.projectSlug }),
  },
  lessonProgress: {
    fromRow(row: RowOf<'lesson_progress'>): LessonProgressRecord {
      return {
        id: row.id,
        userId: row.user_id,
        projectSlug: row.project_slug,
        lessonSlug: row.lesson_slug,
        status: row.status,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    toRow(record: LessonProgressRecord, userId: string): Insert<'lesson_progress'> {
      return {
        id: record.id,
        user_id: userId,
        project_slug: record.projectSlug,
        lesson_slug: record.lessonSlug,
        status: record.status,
        started_at: record.startedAt,
        completed_at: record.completedAt,
        updated_at: record.updatedAt,
      };
    },
    naturalKey: (r: LessonProgressRecord): Record<string, string> => ({
      project_slug: r.projectSlug,
      lesson_slug: r.lessonSlug,
    }),
  },
  checkpointProgress: {
    fromRow(row: RowOf<'checkpoint_progress'>): CheckpointProgressRecord {
      return {
        id: row.id,
        userId: row.user_id,
        projectSlug: row.project_slug,
        lessonSlug: row.lesson_slug,
        checkpointSlug: row.checkpoint_slug,
        completed: row.completed,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    toRow(record: CheckpointProgressRecord, userId: string): Insert<'checkpoint_progress'> {
      return {
        id: record.id,
        user_id: userId,
        project_slug: record.projectSlug,
        lesson_slug: record.lessonSlug,
        checkpoint_slug: record.checkpointSlug,
        completed: record.completed,
        updated_at: record.updatedAt,
      };
    },
    naturalKey: (r: CheckpointProgressRecord): Record<string, string> => ({
      project_slug: r.projectSlug,
      lesson_slug: r.lessonSlug,
      checkpoint_slug: r.checkpointSlug,
    }),
  },
};

export class SupabaseRepositoryError extends Error {
  constructor(operation: string, table: string, cause: PostgrestError | Error) {
    super(`${operation} ${table}: ${cause.message}`, { cause });
    this.name = 'SupabaseRepositoryError';
  }
}

interface TableMapper<T extends keyof RowSchemas, R extends { id: string }> {
  fromRow(row: RowOf<T>): R;
  toRow(record: R, userId: string): Insert<T>;
  naturalKey(record: R): Record<string, string>;
}

/** Netypovaný PostgREST builder: tvar dotazů je stejný pro všechny tabulky, typy hlídá Zod. */
interface PostgrestResult {
  data: unknown;
  error: PostgrestError | null;
}
interface Filterable {
  eq(column: string, value: string): Filterable;
  select(columns: string): Filterable;
  single(): PromiseLike<PostgrestResult>;
  maybeSingle(): PromiseLike<PostgrestResult>;
  then: PromiseLike<PostgrestResult>['then'];
}
interface TableApi {
  select(columns: string): Filterable;
  upsert(row: Record<string, unknown>, options: { onConflict: string }): Filterable;
  update(patch: Record<string, unknown>): Filterable;
  delete(): Filterable;
}

function tableApi(client: AppSupabaseClient, table: TableName): TableApi {
  // Jediné místo, kde se opouští generovaný typ Database – dál hlídá tvar dat Zod.
  const untyped = client as unknown as SupabaseClient<never, never, never>;
  return (untyped as unknown as { from(table: string): TableApi }).from(table);
}

function createTableRepository<T extends keyof RowSchemas, R extends { id: string }>(
  client: AppSupabaseClient,
  table: T,
  userId: string,
  mapper: TableMapper<T, R>,
): CollectionRepository<R> {
  const schema: z.ZodType<RowOf<T>> = rowSchemas[table];
  const parseRow = (data: unknown): R => {
    const parsed = schema.safeParse(data);
    if (!parsed.success)
      throw new SupabaseRepositoryError('parse', table, new Error(parsed.error.message));
    return mapper.fromRow(parsed.data);
  };

  return {
    async list() {
      const { data, error } = await tableApi(client, table).select('*').eq('user_id', userId);
      if (error) throw new SupabaseRepositoryError('select', table, error);
      return z
        .array(z.unknown())
        .parse(data ?? [])
        .map(parseRow);
    },

    async upsert(record) {
      const row = mapper.toRow(record, userId) as Record<string, unknown>;
      const first = await tableApi(client, table)
        .upsert(row, { onConflict: 'id' })
        .select('*')
        .single();
      if (!first.error) return parseRow(first.data);
      if (first.error.code !== UNIQUE_VIOLATION)
        throw new SupabaseRepositoryError('upsert', table, first.error);

      // Kolize přirozeného klíče: najdi existující řádek a aktualizuj ho pod jeho id.
      let query = tableApi(client, table).select('*').eq('user_id', userId);
      for (const [column, value] of Object.entries(mapper.naturalKey(record))) {
        query = query.eq(column, value);
      }
      const existing = await query.maybeSingle();
      if (existing.error) throw new SupabaseRepositoryError('select', table, existing.error);
      if (!existing.data) throw new SupabaseRepositoryError('upsert', table, first.error);
      const existingId = z.object({ id: z.uuid() }).parse(existing.data).id;

      const { id: _id, user_id: _user, ...patch } = row;
      const updated = await tableApi(client, table)
        .update(patch)
        .eq('id', existingId)
        .eq('user_id', userId)
        .select('*')
        .single();
      if (updated.error) throw new SupabaseRepositoryError('update', table, updated.error);
      return parseRow(updated.data);
    },

    async remove(id) {
      const { error } = await tableApi(client, table).delete().eq('id', id).eq('user_id', userId);
      if (error) throw new SupabaseRepositoryError('delete', table, error);
    },

    async clear() {
      const { error } = await tableApi(client, table).delete().eq('user_id', userId);
      if (error) throw new SupabaseRepositoryError('delete', table, error);
    },
  };
}

export function createSupabaseRepositories(
  client: AppSupabaseClient,
  userId: string,
): Repositories {
  return {
    inventory: createTableRepository(client, 'inventory_items', userId, mappers.inventory),
    enrollments: createTableRepository(client, 'project_enrollments', userId, mappers.enrollments),
    lessonProgress: createTableRepository(
      client,
      'lesson_progress',
      userId,
      mappers.lessonProgress,
    ),
    checkpointProgress: createTableRepository(
      client,
      'checkpoint_progress',
      userId,
      mappers.checkpointProgress,
    ),
  };
}
