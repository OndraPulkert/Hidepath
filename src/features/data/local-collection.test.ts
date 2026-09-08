import {
  createMemoryStorage,
  createStorageCollection,
  StorageWriteError,
} from '@/features/data/local-collection';

interface Rec {
  id: string;
  key: string;
  value: string;
}

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

describe('createStorageCollection', () => {
  it('upsert je idempotentní podle id a přepíše starší verzi', async () => {
    const col = createStorageCollection<Rec>(createMemoryStorage(), 'k');
    await col.upsert({ id: A, key: 'a', value: '1' });
    await col.upsert({ id: A, key: 'a', value: '2' });
    await col.upsert({ id: B, key: 'b', value: '3' });
    expect(await col.list()).toEqual([
      { id: A, key: 'a', value: '2' },
      { id: B, key: 'b', value: '3' },
    ]);
  });

  it('upsert je idempotentní i podle přirozeného klíče a zachová původní id', async () => {
    const col = createStorageCollection<Rec>(createMemoryStorage(), 'k', (r) => r.key);
    await col.upsert({ id: A, key: 'knife', value: 'owned' });
    const saved = await col.upsert({ id: B, key: 'knife', value: 'ordered' });
    expect(saved.id).toBe(A);
    expect(await col.list()).toEqual([{ id: A, key: 'knife', value: 'ordered' }]);
  });

  it('odmítne záznam, jehož id není UUID', async () => {
    const col = createStorageCollection<Rec>(createMemoryStorage(), 'k');
    await expect(col.upsert({ id: 'optimistic', key: 'x', value: '1' })).rejects.toThrow(/UUID/);
  });

  it('poškozený obsah úložiště přežije jako prázdný seznam', async () => {
    const storage = createMemoryStorage();
    storage.setItem('k', '{not json');
    const col = createStorageCollection<Rec>(storage, 'k');
    expect(await col.list()).toEqual([]);
  });

  it('selhání zápisu vyhodí StorageWriteError, ne tichou ztrátu', async () => {
    const storage = createMemoryStorage();
    storage.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError');
    };
    const col = createStorageCollection<Rec>(storage, 'k');
    await expect(col.upsert({ id: A, key: 'a', value: '1' })).rejects.toBeInstanceOf(
      StorageWriteError,
    );
  });

  it('remove a clear', async () => {
    const col = createStorageCollection<Rec>(createMemoryStorage(), 'k');
    await col.upsert({ id: A, key: 'a', value: '1' });
    await col.remove(A);
    expect(await col.list()).toEqual([]);
    await col.upsert({ id: B, key: 'b', value: '1' });
    await col.clear();
    expect(await col.list()).toEqual([]);
  });
});
