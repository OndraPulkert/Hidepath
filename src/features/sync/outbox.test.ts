import { createMemoryStorage } from '@/features/data/local-collection';
import {
  acknowledge,
  backoffMs,
  createOutboxStore,
  dueMutations,
  enqueue,
  markAttempt,
  markFailed,
  type NewMutation,
  nextRetryDelay,
  parseOutbox,
  type PendingMutation,
  recoverInterrupted,
  summarizeOutbox,
  SYNCING_TIMEOUT_MS,
} from '@/features/sync/outbox';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function mutation(entityId: string, id = `m-${entityId}`, payload: unknown = {}): NewMutation {
  return {
    id,
    userId: USER,
    entity: 'lesson_records',
    entityId,
    operation: 'upsert',
    payload,
    createdAt: '2026-10-07T10:00:00.000Z',
  };
}

describe('outbox – čisté funkce', () => {
  it('enqueue přidá novou změnu jako pending s nulou pokusů', () => {
    const queue = enqueue([], mutation('lid-wallet/p1-thickness'));
    expect(queue).toEqual([
      expect.objectContaining({ id: 'm-lid-wallet/p1-thickness', status: 'pending', attempts: 0 }),
    ]);
  });

  it('nová změna téhož klíče nahradí starší na stejném místě (i selhanou)', () => {
    let queue = enqueue([], mutation('a', 'm1', { v: 1 }));
    queue = enqueue(queue, mutation('b', 'm2'));
    queue = markFailed(markAttempt(queue, 'm1'), 'm1', 'síť', 0);
    queue = enqueue(queue, mutation('a', 'm3', { v: 2 }));
    expect(queue.map((m) => m.id)).toEqual(['m3', 'm2']);
    expect(queue[0]).toMatchObject({ payload: { v: 2 }, status: 'pending', attempts: 0 });
    expect(queue[0]?.lastError).toBeUndefined();
  });

  it('stejný klíč u jiné entity je jiná změna', () => {
    let queue = enqueue([], mutation('x'));
    queue = enqueue(queue, { ...mutation('x', 'other'), entity: 'lesson_prep_checks' });
    expect(queue).toHaveLength(2);
  });

  it('markAttempt zvýší pokusy a nastaví syncing; markFailed uloží chybu a čas dalšího pokusu', () => {
    let queue = enqueue([], mutation('a', 'm1'));
    queue = markAttempt(queue, 'm1');
    expect(queue[0]).toMatchObject({ status: 'syncing', attempts: 1 });
    queue = markFailed(queue, 'm1', 'Failed to fetch', 1_000);
    expect(queue[0]).toMatchObject({
      status: 'failed',
      lastError: 'Failed to fetch',
      nextAttemptAt: 1_000 + backoffMs(1),
    });
  });

  it('acknowledge odstraní jen změnu s daným id (nahrazená novější zůstane)', () => {
    let queue = enqueue([], mutation('a', 'm1'));
    queue = enqueue(queue, mutation('a', 'm2'));
    expect(acknowledge(queue, 'm1').map((m) => m.id)).toEqual(['m2']);
    expect(acknowledge(queue, 'm2')).toEqual([]);
  });

  it('backoff roste exponenciálně a má strop 5 minut', () => {
    expect(backoffMs(0)).toBe(2_000);
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
    expect(backoffMs(50)).toBe(5 * 60_000);
  });

  it('dueMutations: pending vždy, failed až po uplynutí čekání, syncing nikdy; force ignoruje čekání', () => {
    let queue = enqueue([], mutation('a', 'm1'));
    queue = enqueue(queue, mutation('b', 'm2'));
    queue = enqueue(queue, mutation('c', 'm3'));
    queue = markFailed(markAttempt(queue, 'm2'), 'm2', 'x', 0); // další pokus za 2 s
    queue = markAttempt(queue, 'm3');
    expect(dueMutations(queue, 1_000).map((m) => m.id)).toEqual(['m1']);
    expect(dueMutations(queue, 2_000).map((m) => m.id)).toEqual(['m1', 'm2']);
    expect(dueMutations(queue, 1_000, { force: true }).map((m) => m.id)).toEqual(['m1', 'm2']);
    expect(dueMutations(queue, 5_000, { entity: 'lesson_prep_checks' })).toEqual([]);
  });

  it('odesílání přerušené zavřenou záložkou je po vypršení znovu na řadě (i pro jinou záložku)', () => {
    const queue = markAttempt(enqueue([], mutation('a', 'm1')), 'm1', 0);
    expect(dueMutations(queue, SYNCING_TIMEOUT_MS - 1)).toEqual([]);
    expect(dueMutations(queue, SYNCING_TIMEOUT_MS - 1, { force: true })).toEqual([]);
    expect(dueMutations(queue, SYNCING_TIMEOUT_MS).map((m) => m.id)).toEqual(['m1']);
    expect(nextRetryDelay(queue, 1_000)).toBe(SYNCING_TIMEOUT_MS - 1_000);
  });

  it('nextRetryDelay vrátí nejbližší opakování nebo null', () => {
    let queue = enqueue([], mutation('a', 'm1'));
    expect(nextRetryDelay(queue, 0)).toBeNull();
    queue = markFailed(markAttempt(queue, 'm1'), 'm1', 'x', 0);
    expect(nextRetryDelay(queue, 500)).toBe(1_500);
    expect(nextRetryDelay(queue, 10_000)).toBe(0);
  });

  it('recoverInterrupted vrátí přerušené odesílání do fronty', () => {
    const queue = markAttempt(enqueue([], mutation('a', 'm1')), 'm1');
    expect(recoverInterrupted(queue)[0]?.status).toBe('pending');
  });

  it('summarizeOutbox počítá čekající a selhané', () => {
    let queue = enqueue(enqueue([], mutation('a', 'm1')), mutation('b', 'm2'));
    queue = markFailed(queue, 'm2', 'x', 0);
    expect(summarizeOutbox(queue)).toEqual({ pendingCount: 2, failedCount: 1 });
  });

  it('parseOutbox zahodí poškozený JSON i neplatné položky', () => {
    expect(parseOutbox(null)).toEqual([]);
    expect(parseOutbox('{')).toEqual([]);
    expect(parseOutbox('{"a":1}')).toEqual([]);
    const valid: PendingMutation = { ...mutation('a', 'm1'), attempts: 0, status: 'pending' };
    expect(parseOutbox(JSON.stringify([valid, { id: 'x' }, 42]))).toEqual([valid]);
  });
});

describe('createOutboxStore', () => {
  it('ukládá do úložiště, hlásí změny a prázdnou frontu klíč smaže', () => {
    const storage = createMemoryStorage();
    const store = createOutboxStore(storage, 'k');
    const listener = vi.fn();
    const off = store.subscribe(listener);

    store.update((q) => enqueue(q, mutation('a', 'm1')));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(parseOutbox(storage.getItem('k'))).toHaveLength(1);
    expect(store.summary()).toEqual({ pendingCount: 1, failedCount: 0 });

    store.update((q) => acknowledge(q, 'm1'));
    expect(storage.getItem('k')).toBeNull();

    off();
    store.notifyExternalChange();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('čte vždy z úložiště – vidí změny jiné záložky', () => {
    const storage = createMemoryStorage();
    const tabA = createOutboxStore(storage, 'k');
    const tabB = createOutboxStore(storage, 'k');
    tabA.update((q) => enqueue(q, mutation('a', 'm1')));
    expect(tabB.list()).toHaveLength(1);
  });

  it('při startu vrátí přerušené „syncing“ na „pending“', () => {
    const storage = createMemoryStorage();
    storage.setItem('k', JSON.stringify(markAttempt(enqueue([], mutation('a', 'm1')), 'm1')));
    expect(createOutboxStore(storage, 'k').list()[0]?.status).toBe('pending');
  });

  it('selhání zápisu do úložiště nahlásí StorageWriteError', () => {
    const storage = createMemoryStorage();
    const store = createOutboxStore(
      {
        ...storage,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      },
      'k',
    );
    expect(() => store.update((q) => enqueue(q, mutation('a')))).toThrow(/Zápis do úložiště/);
  });
});
