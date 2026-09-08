import { createMemoryStorage } from '@/features/data/local-collection';
import { migrateLocalData, planMigration } from '@/features/data/migrate-local-data';
import { createLocalRepositories } from '@/features/data/repositories';
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
