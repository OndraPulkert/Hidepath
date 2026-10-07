import {
  createSupabaseRepositories,
  isMissingTableResponse,
  isRemoteTableMissingError,
  isStaleWriteError,
  mappers,
  StaleWriteError,
  SupabaseRepositoryError,
} from '@/features/data/supabase-repositories';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { type AppSupabaseClient } from '@/lib/supabase/client';
import { item } from '@/test/factories';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ID1 = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';
const AT = '2026-10-07T10:00:00.000Z';

interface Result {
  data: unknown;
  error: { code: string; message: string } | null;
  status?: number;
}

/**
 * Falešný PostgREST klient: každý dotaz (řetězec volání ukončený await/single/maybeSingle)
 * vezme další připravený výsledek. Zaznamená tabulky a operace.
 */
function fakeClient(results: Result[]) {
  const calls: string[] = [];
  const next = (): Promise<Result> =>
    Promise.resolve(results.shift() ?? { data: null, error: null });
  const builder = (table: string) => {
    const chain = {
      select: (cols: string) => {
        calls.push(`${table}.select(${cols})`);
        return chain;
      },
      eq: () => chain,
      upsert: () => {
        calls.push(`${table}.upsert`);
        return chain;
      },
      update: () => {
        calls.push(`${table}.update`);
        return chain;
      },
      delete: () => {
        calls.push(`${table}.delete`);
        return chain;
      },
      single: next,
      maybeSingle: next,
      then: (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) =>
        next().then(resolve, reject),
    };
    return chain;
  };
  const client = { from: builder } as unknown as AppSupabaseClient;
  return { client, calls };
}

const recordRow = {
  id: ID1,
  user_id: USER,
  project_slug: 'lid-wallet',
  lesson_slug: '01-measure',
  field_id: 'p1-thickness',
  value: 1.4,
  content_version: 1,
  created_at: AT,
  updated_at: AT,
};

const record: LessonRecordEntry = {
  id: ID1,
  userId: USER,
  projectSlug: 'lid-wallet',
  lessonSlug: '01-measure',
  fieldId: 'p1-thickness',
  value: 1.4,
  contentVersion: 1,
  createdAt: AT,
  updatedAt: AT,
};

const prep: PrepCheckRecord = {
  id: ID2,
  userId: USER,
  projectSlug: 'lid-wallet',
  lessonSlug: '01-measure',
  itemKey: 'print:pattern-sheets:sheet-1',
  checked: true,
  createdAt: AT,
  updatedAt: AT,
};

describe('mappers – zápisník a příprava', () => {
  it('lessonRecords: řádek ↔ záznam beze ztrát (číslo, text, náhrobek)', () => {
    expect(mappers.lessonRecords.fromRow(recordRow)).toEqual(record);
    for (const value of [1.4, 'záloha-a', null]) {
      const row = mappers.lessonRecords.toRow({ ...record, value }, USER);
      expect(row).toMatchObject({ value, user_id: USER, field_id: 'p1-thickness' });
      expect(row).not.toHaveProperty('created_at');
    }
    expect(mappers.lessonRecords.naturalKey(record)).toEqual({
      project_slug: 'lid-wallet',
      field_id: 'p1-thickness',
    });
  });

  it('prepChecks: řádek ↔ záznam', () => {
    const row = mappers.prepChecks.toRow(prep, USER);
    expect(row).toEqual({
      id: ID2,
      user_id: USER,
      project_slug: 'lid-wallet',
      lesson_slug: '01-measure',
      item_key: 'print:pattern-sheets:sheet-1',
      checked: true,
      updated_at: AT,
    });
    expect(
      mappers.prepChecks.fromRow({ ...row, checked: true, created_at: AT, updated_at: AT }),
    ).toEqual(prep);
    expect(mappers.prepChecks.naturalKey(prep)).toEqual({
      project_slug: 'lid-wallet',
      lesson_slug: '01-measure',
      item_key: 'print:pattern-sheets:sheet-1',
    });
  });
});

describe('createSupabaseRepositories – zápisník', () => {
  it('list validuje řádky: skalár projde, objekt v hodnotě ne', async () => {
    const ok = fakeClient([{ data: [recordRow, { ...recordRow, value: null }], error: null }]);
    const repos = createSupabaseRepositories(ok.client, USER);
    expect(await repos.lessonRecords?.list()).toEqual([record, { ...record, value: null }]);

    const bad = fakeClient([{ data: [{ ...recordRow, value: { a: 1 } }], error: null }]);
    await expect(
      createSupabaseRepositories(bad.client, USER).lessonRecords?.list(),
    ).rejects.toThrow(SupabaseRepositoryError);
  });

  it('upsert bez vráceného řádku (trigger zahodil starší zápis) = StaleWriteError', async () => {
    const { client } = fakeClient([{ data: null, error: { code: 'PGRST116', message: '0 rows' } }]);
    const promise = createSupabaseRepositories(client, USER).lessonRecords!.upsert(record);
    await expect(promise).rejects.toBeInstanceOf(StaleWriteError);
  });

  it('kolize přirozeného klíče → update; 0 řádků z update = StaleWriteError', async () => {
    const { client, calls } = fakeClient([
      { data: null, error: { code: '23505', message: 'duplicate' } },
      { data: { id: ID2 }, error: null },
      { data: null, error: { code: 'PGRST116', message: '0 rows' } },
    ]);
    const error: unknown = await createSupabaseRepositories(client, USER)
      .prepChecks!.upsert(prep)
      .catch((e: unknown) => e);
    expect(isStaleWriteError(error)).toBe(true);
    expect(calls).toContain('lesson_prep_checks.update');
  });

  it('úspěšný upsert vrátí záznam ze serveru', async () => {
    const { client } = fakeClient([{ data: recordRow, error: null }]);
    expect(await createSupabaseRepositories(client, USER).lessonRecords!.upsert(record)).toEqual(
      record,
    );
  });

  it('ostatní tabulky dál hlásí 0 řádků jako obyčejnou chybu, ne stale', async () => {
    const { client } = fakeClient([{ data: null, error: { code: 'PGRST116', message: '0 rows' } }]);
    const error: unknown = await createSupabaseRepositories(client, USER)
      .enrollments.upsert({
        id: ID1,
        userId: USER,
        projectSlug: 'card-holder',
        contentVersion: 1,
        status: 'active',
        startedAt: AT,
        completedAt: null,
        createdAt: AT,
        updatedAt: AT,
      })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SupabaseRepositoryError);
    expect(isStaleWriteError(error)).toBe(false);
  });

  it('inventář je chráněný před zastaralým zápisem: 0 řádků = StaleWriteError', async () => {
    const { client } = fakeClient([{ data: null, error: { code: 'PGRST116', message: '0 rows' } }]);
    const error: unknown = await createSupabaseRepositories(client, USER)
      .inventory.upsert({ ...item('mallet', 'owned'), id: ID1 })
      .catch((e: unknown) => e);
    expect(isStaleWriteError(error)).toBe(true);
  });
});

const noteRow = {
  id: ID1,
  user_id: USER,
  project_slug: 'lid-wallet',
  lesson_slug: '01-measure',
  text: 'krok 3 – lepidlo teklo',
  created_at: AT,
  updated_at: AT,
};

const noteRecord: LessonNoteRecord = {
  id: ID1,
  userId: USER,
  projectSlug: 'lid-wallet',
  lessonSlug: '01-measure',
  text: 'krok 3 – lepidlo teklo',
  createdAt: AT,
  updatedAt: AT,
};

describe('poznámky od ponku (lesson_notes)', () => {
  it('mapper: řádek ↔ záznam beze ztrát, přirozený klíč projekt + lekce', () => {
    expect(mappers.lessonNotes.fromRow(noteRow)).toEqual(noteRecord);
    expect(mappers.lessonNotes.toRow(noteRecord, USER)).toEqual({
      id: ID1,
      user_id: USER,
      project_slug: 'lid-wallet',
      lesson_slug: '01-measure',
      text: 'krok 3 – lepidlo teklo',
      updated_at: AT,
    });
    expect(mappers.lessonNotes.naturalKey(noteRecord)).toEqual({
      project_slug: 'lid-wallet',
      lesson_slug: '01-measure',
    });
  });

  it('list validuje řádky; upsert bez řádku = StaleWriteError', async () => {
    const ok = fakeClient([{ data: [noteRow], error: null }]);
    expect(await createSupabaseRepositories(ok.client, USER).lessonNotes?.list()).toEqual([
      noteRecord,
    ]);
    const bad = fakeClient([{ data: [{ ...noteRow, text: null }], error: null }]);
    await expect(createSupabaseRepositories(bad.client, USER).lessonNotes?.list()).rejects.toThrow(
      SupabaseRepositoryError,
    );
    const stale = fakeClient([{ data: null, error: { code: 'PGRST116', message: '0 rows' } }]);
    await expect(
      createSupabaseRepositories(stale.client, USER).lessonNotes!.upsert(noteRecord),
    ).rejects.toBeInstanceOf(StaleWriteError);
  });

  it.each([
    [
      'PGRST205 (tabulka není ve schema cache)',
      { code: 'PGRST205', message: 'Could not find' },
      404,
    ],
    ['42P01 (relation does not exist)', { code: '42P01', message: 'does not exist' }, 400],
    ['HTTP 404 bez kódu', { code: '', message: 'Not Found' }, 404],
  ])('chybějící tabulka – %s = RemoteTableMissingError', async (_label, error, status) => {
    const list = fakeClient([{ data: null, error, status }]);
    const listError: unknown = await createSupabaseRepositories(list.client, USER)
      .lessonNotes!.list()
      .catch((e: unknown) => e);
    expect(isRemoteTableMissingError(listError)).toBe(true);

    const upsert = fakeClient([{ data: null, error, status }]);
    const upsertError: unknown = await createSupabaseRepositories(upsert.client, USER)
      .lessonNotes!.upsert(noteRecord)
      .catch((e: unknown) => e);
    expect(isRemoteTableMissingError(upsertError)).toBe(true);
    expect(upsertError).toBeInstanceOf(SupabaseRepositoryError);
  });

  it('jiné chyby nejsou chybějící tabulka', () => {
    expect(isMissingTableResponse({ error: null, status: 404 })).toBe(false);
    expect(isMissingTableResponse({ error: { code: '42501' }, status: 403 })).toBe(false);
    expect(isMissingTableResponse({ error: { code: 'PGRST116' }, status: 406 })).toBe(false);
  });
});
