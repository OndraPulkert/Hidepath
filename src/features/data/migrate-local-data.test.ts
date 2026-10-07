import { createMemoryStorage } from '@/features/data/local-collection';
import { hasLocalData, migrateLocalData, planMigration } from '@/features/data/migrate-local-data';
import { createLocalRepositories } from '@/features/data/repositories';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { createUserSync, userSyncKeys } from '@/features/sync/synced-collection';
import { item } from '@/test/factories';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

describe('planMigration', () => {
  it('nahraje lokální záznamy, které v účtu nejsou', () => {
    const plan = planMigration(
      [{ id: A, updatedAt: '2026-09-07T10:00:00Z', key: 'knife' }],
      [],
      (r) => r.key,
    );
    expect(plan.toUpload).toHaveLength(1);
    expect(plan.skipped).toHaveLength(0);
  });

  it('při kolizi vyhraje novější (last-write-wins) a použije id vzdáleného řádku', () => {
    const local = [{ id: A, updatedAt: '2026-09-07T12:00:00Z', key: 'knife' }];
    const remote = [{ id: B, updatedAt: '2026-09-07T10:00:00Z', key: 'knife' }];
    const plan = planMigration(local, remote, (r) => r.key);
    expect(plan.toUpload).toEqual([{ id: B, updatedAt: '2026-09-07T12:00:00Z', key: 'knife' }]);
  });

  it('starší lokální záznam se přeskočí', () => {
    const local = [{ id: A, updatedAt: '2026-09-07T09:00:00Z', key: 'knife' }];
    const remote = [{ id: B, updatedAt: '2026-09-07T10:00:00Z', key: 'knife' }];
    const plan = planMigration(local, remote, (r) => r.key);
    expect(plan.toUpload).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
  });
});

describe('migrateLocalData', () => {
  it('přenese lokální data do „účtu“ a lokální úložiště vyprázdní', async () => {
    const local = createLocalRepositories(createMemoryStorage());
    const remote = createLocalRepositories(createMemoryStorage());
    await local.inventory.upsert({ ...item('knife', 'owned'), id: A });
    await local.inventory.upsert({ ...item('ruler', 'ordered'), id: B });

    const summary = await migrateLocalData(local, remote);
    expect(summary).toEqual({ uploaded: 2, skipped: 0 });
    expect(await remote.inventory.list()).toHaveLength(2);
    expect(await local.inventory.list()).toHaveLength(0);
  });

  it('bez lokálních dat nic nedělá', async () => {
    const local = createLocalRepositories(createMemoryStorage());
    const remote = createLocalRepositories(createMemoryStorage());
    expect(await migrateLocalData(local, remote)).toEqual({ uploaded: 0, skipped: 0 });
  });
});

const NOW = '2026-10-07T10:00:00.000Z';

function recordEntry(fieldId: string, id: string, value: number | null = 1.1): LessonRecordEntry {
  return {
    id,
    userId: null,
    projectSlug: 'lid-wallet',
    lessonSlug: '01-measure',
    fieldId,
    value,
    contentVersion: 1,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function prepCheck(itemKey: string, id: string): PrepCheckRecord {
  return {
    id,
    userId: null,
    projectSlug: 'lid-wallet',
    lessonSlug: '01-measure',
    itemKey,
    checked: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe('zápisník a příprava v lokálních kolekcích', () => {
  it('zápis téhož pole přepíše řádek a nechá původní id (přirozený klíč projekt/pole)', async () => {
    const repos = createLocalRepositories(createMemoryStorage());
    await repos.lessonRecords.upsert(recordEntry('p1-thickness', A, 1.1));
    const saved = await repos.lessonRecords.upsert(recordEntry('p1-thickness', B, null));
    expect(saved.id).toBe(A);
    expect(await repos.lessonRecords.list()).toEqual([{ ...recordEntry('p1-thickness', A, null) }]);
  });

  it('zaškrtnutí téže položky přípravy je jeden řádek', async () => {
    const repos = createLocalRepositories(createMemoryStorage());
    await repos.prepChecks.upsert(prepCheck('print:template', A));
    await repos.prepChecks.upsert(prepCheck('print:template', B));
    await repos.prepChecks.upsert(prepCheck('req:spacer', B));
    expect(await repos.prepChecks.list()).toHaveLength(2);
  });

  it('bez cloudových kolekcí zůstanou v zařízení a nespustí přenos', async () => {
    const local = createLocalRepositories(createMemoryStorage());
    const {
      lessonRecords: _r,
      prepChecks: _p,
      lessonNotes: _n,
      ...remote
    } = createLocalRepositories(createMemoryStorage());
    await local.lessonRecords.upsert(recordEntry('p1-thickness', A));
    await local.prepChecks.upsert(prepCheck('print:template', B));

    expect(await hasLocalData(local, remote)).toBe(false);
    expect(await migrateLocalData(local, remote)).toEqual({
      uploaded: 0,
      skipped: 0,
    });
    expect(await local.lessonRecords.list()).toHaveLength(1);
    expect(await local.prepChecks.list()).toHaveLength(1);
  });

  it('když je cloud má, přenesou se a lokální kopie se vyprázdní', async () => {
    const local = createLocalRepositories(createMemoryStorage());
    const remote = createLocalRepositories(createMemoryStorage());
    await local.lessonRecords.upsert(recordEntry('p1-thickness', A));
    await local.prepChecks.upsert(prepCheck('print:template', B));

    expect(await hasLocalData(local, remote)).toBe(true);
    expect(await migrateLocalData(local, remote)).toEqual({ uploaded: 2, skipped: 0 });
    expect(await remote.lessonRecords.list()).toHaveLength(1);
    expect(await remote.prepChecks.list()).toHaveLength(1);
    expect(await local.lessonRecords.list()).toHaveLength(0);
    expect(await local.prepChecks.list()).toHaveLength(0);
  });
});

describe('přenos zápisníku a přípravy do synchronizované kolekce účtu', () => {
  const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  function cloudWithSync(online: { value: boolean }) {
    const storage = createMemoryStorage();
    const server = createLocalRepositories(createMemoryStorage());
    const sync = createUserSync({
      storage,
      userId: USER,
      remote: { lessonRecords: server.lessonRecords, prepChecks: server.prepChecks },
      isOnline: () => online.value,
    });
    const { lessonNotes: _n, ...rest } = createLocalRepositories(createMemoryStorage());
    const remote = { ...rest, lessonRecords: sync.lessonRecords, prepChecks: sync.prepChecks };
    return { storage, server, sync, remote };
  }

  it('offline: anonymní zápisy se přenesou do lokální kopie účtu a outboxu, po připojení odejdou', async () => {
    const online = { value: false };
    const { storage, server, sync, remote } = cloudWithSync(online);
    const local = createLocalRepositories(createMemoryStorage());
    await local.lessonRecords.upsert(recordEntry('p1-thickness', A, 1.4));
    await local.prepChecks.upsert(prepCheck('print:template', B));

    expect(await hasLocalData(local, remote)).toBe(true);
    expect(await migrateLocalData(local, remote)).toEqual({ uploaded: 2, skipped: 0 });
    expect(await local.lessonRecords.list()).toEqual([]);
    expect(storage.getItem(userSyncKeys(USER).lessonRecords)).toContain('p1-thickness');
    expect(sync.controller.getSnapshot().pendingCount).toBe(2);
    expect(await server.lessonRecords.list()).toEqual([]);

    online.value = true;
    await sync.controller.sync();
    expect(sync.controller.getSnapshot().pendingCount).toBe(0);
    expect(await server.lessonRecords.list()).toEqual([
      expect.objectContaining({ fieldId: 'p1-thickness', value: 1.4, userId: USER }),
    ]);
    expect(await server.prepChecks.list()).toHaveLength(1);
  });

  it('starší anonymní zápis nepřepíše novější hodnotu, kterou už účet v zařízení má', async () => {
    const { sync, remote } = cloudWithSync({ value: false });
    await sync.lessonRecords.upsert({
      ...recordEntry('p1-thickness', B, 1.6),
      updatedAt: '2026-10-07T12:00:00.000Z',
    });
    const local = createLocalRepositories(createMemoryStorage());
    await local.lessonRecords.upsert(recordEntry('p1-thickness', A, 1.1));

    expect(await migrateLocalData(local, remote)).toEqual({ uploaded: 0, skipped: 1 });
    expect((await sync.lessonRecords.list())[0]?.value).toBe(1.6);
  });
});
