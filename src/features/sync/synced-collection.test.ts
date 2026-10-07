import {
  type CollectionRepository,
  createMemoryStorage,
  createStorageCollection,
  type StorageLike,
} from '@/features/data/local-collection';
import { naturalKeys } from '@/features/data/repositories';
import { StaleWriteError } from '@/features/data/supabase-repositories';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import {
  createOutboxStore,
  enqueue,
  markAttempt,
  parseOutbox,
  SYNCING_TIMEOUT_MS,
} from '@/features/sync/outbox';
import { nextUpdatedAt } from '@/features/sync/merge';
import {
  createStorageCache,
  createSyncedCollection,
  createUserSync,
  userSyncKeys,
} from '@/features/sync/synced-collection';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ID1 = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';

function entry(
  fieldId: string,
  value: number | string | null,
  at: string,
  id = ID1,
): LessonRecordEntry {
  return {
    id,
    userId: null,
    projectSlug: 'lid-wallet',
    lessonSlug: '01-measure',
    fieldId,
    value,
    contentVersion: 1,
    createdAt: '2026-10-07T08:00:00.000Z',
    updatedAt: `2026-10-07T${at}:00.000Z`,
  };
}

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}
function deferred(): Deferred {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** Falešný server: uloží řádek pod existujícím id, starší zápis odmítne jako stale. */
function createFakeRemote() {
  const inner = createStorageCollection<LessonRecordEntry>(
    createMemoryStorage(),
    'server',
    naturalKeys.lessonRecords,
  );
  const state = {
    fail: null as Error | null,
    upserts: 0,
    gate: null as Promise<void> | null,
    /** Odpověď na list() se zdrží: snímek serveru je z doby dotazu, dorazí až po bráně. */
    listGate: null as Promise<void> | null,
  };
  const remote: CollectionRepository<LessonRecordEntry> = {
    async list() {
      if (state.fail) throw state.fail;
      const snapshot = await inner.list();
      if (state.listGate) await state.listGate;
      return snapshot;
    },
    async upsert(record) {
      state.upserts += 1;
      if (state.gate) await state.gate;
      if (state.fail) throw state.fail;
      const existing = (await inner.list()).find(
        (r) => naturalKeys.lessonRecords(r) === naturalKeys.lessonRecords(record),
      );
      if (existing && Date.parse(existing.updatedAt) > Date.parse(record.updatedAt)) {
        throw new StaleWriteError('lesson_records');
      }
      return inner.upsert({ ...record, userId: USER });
    },
    async remove(id) {
      if (state.fail) throw state.fail;
      return inner.remove(id);
    },
    async clear() {
      if (state.fail) throw state.fail;
      return inner.clear();
    },
  };
  return { remote, server: inner, state };
}

function setup(
  options: { storage?: StorageLike; online?: { value: boolean }; now?: () => number } = {},
) {
  const storage = options.storage ?? createMemoryStorage();
  const online = options.online ?? { value: true };
  const fake = createFakeRemote();
  const outbox = createOutboxStore(storage, 'outbox');
  const onChange = vi.fn();
  const collection = createSyncedCollection<LessonRecordEntry>({
    entity: 'lesson_records',
    userId: USER,
    local: createStorageCache(storage, 'cache', naturalKeys.lessonRecords),
    remote: fake.remote,
    outbox,
    naturalKey: naturalKeys.lessonRecords,
    onChange,
    isOnline: () => online.value,
    now: options.now,
  });
  return { storage, online, outbox, collection, onChange, ...fake };
}

describe('createSyncedCollection', () => {
  it('zápis se hned uloží lokálně (s userId) a po odeslání zmizí z outboxu', async () => {
    const { collection, outbox, server } = setup();
    const saved = await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    expect(saved.userId).toBe(USER);
    expect(await collection.list()).toEqual([saved]);

    await collection.flush();
    expect(outbox.list()).toEqual([]);
    expect(await server.list()).toEqual([expect.objectContaining({ value: 1.4, userId: USER })]);
  });

  it('offline: zápis zůstane v outboxu a odejde po návratu připojení', async () => {
    const { collection, outbox, server, online, state } = setup({ online: { value: false } });
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    expect(state.upserts).toBe(0);
    expect(outbox.summary()).toEqual({ pendingCount: 1, failedCount: 0 });

    online.value = true;
    await collection.flush();
    expect(outbox.list()).toEqual([]);
    expect(await server.list()).toHaveLength(1);
  });

  it('více zápisů téhož pole offline odešle jen poslední stav', async () => {
    const { collection, outbox, server, online, state } = setup({ online: { value: false } });
    await collection.upsert(entry('p1-thickness', 1.2, '10:00'));
    await collection.upsert(entry('p1-thickness', 1.3, '10:01'));
    await collection.upsert(entry('p1-thickness', 1.4, '10:02'));
    expect(outbox.list()).toHaveLength(1);

    online.value = true;
    await collection.flush();
    expect(state.upserts).toBe(1);
    expect((await server.list())[0]?.value).toBe(1.4);
  });

  it('selhání: změna zůstane jako failed s chybou, před uplynutím čekání se neopakuje, force ano', async () => {
    let time = 1_000;
    const { collection, outbox, server, state } = setup({ now: () => time });
    state.fail = new Error('Failed to fetch');
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    expect(outbox.list()[0]).toMatchObject({
      status: 'failed',
      attempts: 1,
      lastError: 'Failed to fetch',
    });
    expect(await collection.list()).toHaveLength(1); // lokální data se neztratí

    state.fail = null;
    const before = state.upserts;
    await collection.flush();
    expect(state.upserts).toBe(before); // čeká na backoff

    time += 2_000;
    await collection.flush();
    expect(outbox.list()).toEqual([]);
    expect(await server.list()).toHaveLength(1);
  });

  it('force odešle selhanou změnu hned (tlačítko „Zkusit znovu“)', async () => {
    const { collection, outbox, state } = setup({ now: () => 0 });
    state.fail = new Error('500');
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    state.fail = null;
    await collection.flush({ force: true });
    expect(outbox.list()).toEqual([]);
  });

  it('stale: server má novější verzi → změna se zahodí a lokál převezme stav serveru', async () => {
    const { collection, outbox, server, online, onChange } = setup({ online: { value: false } });
    await server.upsert({ ...entry('p1-thickness', 1.6, '12:00', ID2), userId: USER });
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));

    online.value = true;
    const result = await collection.flush();
    expect(result.stale).toBe(1);
    expect(outbox.list()).toEqual([]);
    expect(await collection.list()).toEqual([
      expect.objectContaining({ id: ID2, value: 1.6, userId: USER }),
    ]);
    expect(onChange).toHaveBeenCalled();
    expect((await server.list())[0]?.value).toBe(1.6);
  });

  it('kolize klíče s jiným zařízením: lokální záznam převezme id serveru', async () => {
    const { collection, server, online } = setup({ online: { value: false } });
    await server.upsert({ ...entry('p1-thickness', 1.2, '09:00', ID2), userId: USER });
    await collection.upsert(entry('p1-thickness', 1.4, '10:00', ID1));

    online.value = true;
    await collection.flush();
    expect(await collection.list()).toEqual([expect.objectContaining({ id: ID2, value: 1.4 })]);
    expect(await server.list()).toEqual([expect.objectContaining({ id: ID2, value: 1.4 })]);
  });

  it('novější lokální zápis během odesílání nepřepíše potvrzení starší verze', async () => {
    const { collection, outbox, server, state } = setup();
    const gate = deferred();
    state.gate = gate.promise;

    await collection.upsert(entry('p1-thickness', 1.2, '10:00'));
    const second = collection.upsert(entry('p1-thickness', 1.5, '10:05'));
    await second;
    state.gate = null;
    gate.resolve();
    await collection.flush();

    expect((await collection.list())[0]?.value).toBe(1.5);
    expect((await server.list())[0]?.value).toBe(1.5);
    expect(outbox.list()).toEqual([]);
  });

  it('pull: přidá data z jiného zařízení, čekající lokální změnu nepřepíše a ohlásí změnu', async () => {
    const { collection, server, online, onChange } = setup({ online: { value: false } });
    await server.upsert({ ...entry('d1-thickness', 1.0, '12:00', ID2), userId: USER });
    await server.upsert({
      ...entry('p1-thickness', 9.9, '12:00', '33333333-3333-4333-8333-333333333333'),
      userId: USER,
    });
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));

    online.value = true;
    const { changed } = await collection.pull();
    expect(changed).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    const list = await collection.list();
    expect(list.find((r) => r.fieldId === 'p1-thickness')?.value).toBe(1.4);
    expect(list.find((r) => r.fieldId === 'd1-thickness')?.value).toBe(1.0);
  });

  it('pull beze změn nevolá onChange', async () => {
    const { collection, onChange } = setup();
    expect(await collection.pull()).toEqual({ changed: false });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('náhrobek (value null) se odešle jako běžný upsert', async () => {
    const { collection, server } = setup();
    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    await collection.upsert(entry('p1-thickness', null, '10:10'));
    await collection.flush();
    expect((await server.list())[0]?.value).toBeNull();
  });

  it('remove smaže lokálně a pošle delete na server', async () => {
    const { collection, server } = setup();
    const saved = await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    await collection.remove(saved.id);
    await collection.flush();
    expect(await collection.list()).toEqual([]);
    expect(await server.list()).toEqual([]);
  });

  it('čekající smazání: pull serverový řádek lokálně neobnoví', async () => {
    const { collection, server, state } = setup();
    const saved = await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    state.fail = new Error('Failed to fetch');
    await collection.remove(saved.id);
    await collection.flush();
    state.fail = null;

    await collection.pull();
    expect(await collection.list()).toEqual([]);
    await collection.flush({ force: true });
    expect(await server.list()).toEqual([]);
  });

  it('starší snímek ze serveru nesmaže zápis, který se mezitím odeslal', async () => {
    const { collection, outbox, state, onChange } = setup();
    const gate = deferred();
    state.listGate = gate.promise;
    const pulling = collection.pull(); // snímek serveru je ještě prázdný

    await collection.upsert(entry('p1-thickness', 1.4, '10:00'));
    await collection.flush();
    expect(outbox.list()).toEqual([]);

    state.listGate = null;
    gate.resolve();
    await pulling;
    expect(await collection.list()).toEqual([expect.objectContaining({ value: 1.4 })]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('změnu, jejíž odesílání přerušilo zavření jiné záložky, odešle po vypršení tato záložka', async () => {
    let time = 0;
    const { collection, outbox, server, storage } = setup({ now: () => time });
    const record = { ...entry('p1-thickness', 1.4, '10:00'), userId: USER };
    // Jiná záložka zapsala, začala odesílat a zavřela se uprostřed požadavku.
    storage.setItem('cache', JSON.stringify([record]));
    const queue = enqueue([], {
      id: 'm1',
      userId: USER,
      entity: 'lesson_records',
      entityId: naturalKeys.lessonRecords(record),
      operation: 'upsert',
      payload: record,
      createdAt: '2026-10-07T10:00:00.000Z',
    });
    storage.setItem('outbox', JSON.stringify(markAttempt(queue, 'm1', 0)));

    await collection.flush();
    expect(outbox.list()).toHaveLength(1); // ještě může běžet

    time = SYNCING_TIMEOUT_MS;
    await collection.flush();
    expect(outbox.list()).toEqual([]);
    expect(await server.list()).toEqual([expect.objectContaining({ value: 1.4 })]);
  });

  it('fronta přežije „reload“: nová instance nad stejným úložištěm ji odešle', async () => {
    const storage = createMemoryStorage();
    const first = setup({ storage, online: { value: false } });
    await first.collection.upsert(entry('p1-thickness', 1.4, '10:00'));

    const second = setup({ storage });
    expect(await second.collection.list()).toHaveLength(1);
    await second.collection.flush();
    expect(second.outbox.list()).toEqual([]);
    expect(await second.server.list()).toHaveLength(1);
  });
});

/**
 * Server přesně podle SQL: reject_stale_update (starší updated_at → 0 řádků) a set_updated_at
 * (stejné updated_at → now() serveru). Volitelně ztratí odpověď na už potvrzený zápis.
 */
function createSqlLikeRemote(serverNow: () => number) {
  const inner = createStorageCollection<LessonRecordEntry>(
    createMemoryStorage(),
    'server',
    naturalKeys.lessonRecords,
  );
  const state = { dropNextResponse: false };
  const remote: CollectionRepository<LessonRecordEntry> = {
    list: () => inner.list(),
    async upsert(record) {
      const old = (await inner.list()).find(
        (r) => naturalKeys.lessonRecords(r) === naturalKeys.lessonRecords(record),
      );
      let row = { ...record, id: old?.id ?? record.id, userId: USER };
      if (old) {
        if (Date.parse(record.updatedAt) < Date.parse(old.updatedAt))
          throw new StaleWriteError('lesson_records');
        if (Date.parse(record.updatedAt) === Date.parse(old.updatedAt))
          row = { ...row, updatedAt: new Date(serverNow()).toISOString() };
      }
      const saved = await inner.upsert(row);
      if (state.dropNextResponse) {
        state.dropNextResponse = false;
        throw new Error('network: response lost after commit');
      }
      return saved;
    },
    remove: (id) => inner.remove(id),
    clear: () => inner.clear(),
  };
  return { remote, server: inner, state };
}

function syncedDevice(
  remote: CollectionRepository<LessonRecordEntry>,
  options: { storage?: StorageLike; isOnline?: () => boolean } = {},
) {
  const storage = options.storage ?? createMemoryStorage();
  const outbox = createOutboxStore(storage, 'outbox');
  const collection = createSyncedCollection<LessonRecordEntry>({
    entity: 'lesson_records',
    userId: USER,
    local: createStorageCache(storage, 'cache', naturalKeys.lessonRecords),
    remote,
    outbox,
    naturalKey: naturalKeys.lessonRecords,
    isOnline: options.isOnline ?? (() => true),
  });
  /** Úprava jako v useSaveLessonRecord: razítko z hodin zařízení, monotónně vůči známému stavu. */
  const edit = async (value: number, deviceClock: string) => {
    const existing = (await collection.list()).find((r) => r.fieldId === 'p1-thickness');
    return collection.upsert({
      ...entry('p1-thickness', value, '00:00', existing?.id ?? ID1),
      updatedAt: nextUpdatedAt(existing?.updatedAt, Date.parse(deviceClock)),
    });
  };
  return { collection, outbox, storage, edit };
}

describe('hodiny zařízení a ztracené odpovědi (LWW podle klientského času)', () => {
  const REAL_NOW = Date.parse('2026-10-07T12:00:00.000Z');

  it('pozdější úprava ze zařízení se správnými hodinami přebije zápis z hodin „napřed“', async () => {
    const { remote, server } = createSqlLikeRemote(() => REAL_NOW);
    const phone = syncedDevice(remote); // hodiny +10 min
    const laptop = syncedDevice(remote); // správné hodiny

    await phone.edit(2, '2026-10-07T12:10:00.000Z');
    await phone.collection.flush();
    await laptop.collection.pull();
    await laptop.edit(1.6, '2026-10-07T12:05:00.000Z');
    const result = await laptop.collection.flush();

    expect(result).toEqual({ sent: 1, failed: 0, stale: 0, deferred: 0 });
    expect((await server.list())[0]?.value).toBe(1.6);
    expect((await laptop.collection.list())[0]?.value).toBe(1.6);
  });

  it('hodiny pozadu + opakování po ztracené odpovědi: další úprava se neztratí jako stale', async () => {
    const { remote, server, state } = createSqlLikeRemote(() => REAL_NOW);
    const phone = syncedDevice(remote); // hodiny −5 min
    await phone.edit(2, '2026-10-07T11:50:00.000Z');
    await phone.collection.flush();
    state.dropNextResponse = true; // zápis projde, odpověď se ztratí
    await phone.edit(3, '2026-10-07T11:55:00.000Z');
    await phone.collection.flush();
    await phone.collection.flush({ force: true }); // stejné updated_at → server dá now() = 12:00

    await phone.edit(4, '2026-10-07T11:56:00.000Z');
    const result = await phone.collection.flush();
    expect(result.stale).toBe(0);
    expect((await server.list())[0]?.value).toBe(4);
  });

  it('nový záznam, jehož zápis do outboxu selhal, pull lokálně nesmaže a odešle ho', async () => {
    const { remote, server } = createSqlLikeRemote(() => REAL_NOW);
    const base = createMemoryStorage();
    let failOutbox = false;
    const storage: StorageLike = {
      getItem: (k) => base.getItem(k),
      removeItem: (k) => base.removeItem(k),
      setItem: (k, v) => {
        if (failOutbox && k === 'outbox') throw new DOMException('quota', 'QuotaExceededError');
        base.setItem(k, v);
      },
    };
    const d = syncedDevice(remote, { storage });
    failOutbox = true;
    await expect(d.edit(2, '2026-10-07T12:00:00.000Z')).rejects.toThrow();
    failOutbox = false;
    expect(await d.collection.list()).toHaveLength(1);

    await d.collection.pull();
    expect(await d.collection.list()).toEqual([expect.objectContaining({ value: 2 })]);
    await d.collection.flush();
    expect(await server.list()).toEqual([expect.objectContaining({ value: 2 })]);
  });

  it('smazání záznamu vytvořeného offline pod jiným id smaže serverový řádek se stejným klíčem', async () => {
    const { remote, server } = createSqlLikeRemote(() => REAL_NOW);
    await server.upsert({ ...entry('p1-thickness', 1, '10:00', ID2), userId: USER });
    const online = { value: false };
    const d = syncedDevice(remote, { isOnline: () => online.value });
    await d.collection.upsert(entry('p1-thickness', 2, '11:00', ID1));
    await d.collection.remove(ID1);

    online.value = true;
    await d.collection.flush();
    await d.collection.pull();
    expect(await server.list()).toEqual([]);
    expect(await d.collection.list()).toEqual([]);
  });
});

describe('createUserSync', () => {
  function emptyRemote<T extends { id: string }>(): CollectionRepository<T> {
    return createStorageCollection<T>(createMemoryStorage(), 'r');
  }
  function emptyRemotes() {
    return {
      lessonRecords: emptyRemote<LessonRecordEntry>(),
      prepChecks: emptyRemote<PrepCheckRecord>(),
      inventory: emptyRemote<InventoryItem>(),
      lessonNotes: emptyRemote<LessonNoteRecord>(),
    };
  }

  it('lokální klíče jsou per uživatel a oddělené od anonymních dat', () => {
    expect(userSyncKeys(USER)).toEqual({
      lessonRecords: `hidepath.v1.u.${USER}.lesson_records`,
      prepChecks: `hidepath.v1.u.${USER}.lesson_prep_checks`,
      inventory: `hidepath.v1.u.${USER}.inventory_items`,
      lessonNotes: `hidepath.v1.u.${USER}.lesson_notes`,
      outbox: `hidepath.v1.u.${USER}.outbox`,
    });
    expect(userSyncKeys(OTHER).outbox).not.toBe(userSyncKeys(USER).outbox);
  });

  it('data jednoho uživatele druhý v tomtéž prohlížeči nevidí', async () => {
    const storage = createMemoryStorage();
    const offline = () => false;
    const a = createUserSync({
      storage,
      userId: USER,
      remote: emptyRemotes(),
      isOnline: offline,
    });
    const b = createUserSync({
      storage,
      userId: OTHER,
      remote: emptyRemotes(),
      isOnline: offline,
    });
    await a.lessonRecords.upsert(entry('p1-thickness', 1.4, '10:00'));
    expect(await b.lessonRecords.list()).toEqual([]);
    expect(b.controller.getSnapshot().pendingCount).toBe(0);
    expect(a.controller.getSnapshot().pendingCount).toBe(1);
    expect(storage.getItem('hidepath.v1.lesson_records')).toBeNull();
  });

  it('ovladač: stabilní snímek, počet čekajících za obě kolekce, odběr a sync', async () => {
    const storage = createMemoryStorage();
    const online = { value: false };
    const lessonRemote = emptyRemote<LessonRecordEntry>();
    const prepRemote = emptyRemote<PrepCheckRecord>();
    const sync = createUserSync({
      storage,
      userId: USER,
      remote: { ...emptyRemotes(), lessonRecords: lessonRemote, prepChecks: prepRemote },
      isOnline: () => online.value,
    });
    const listener = vi.fn();
    sync.controller.subscribe(listener);
    const first = sync.controller.getSnapshot();
    expect(sync.controller.getSnapshot()).toBe(first);

    await sync.lessonRecords.upsert(entry('p1-thickness', 1.4, '10:00'));
    await sync.prepChecks.upsert({
      id: ID2,
      userId: null,
      projectSlug: 'lid-wallet',
      lessonSlug: '01-measure',
      itemKey: 'print:template',
      checked: true,
      createdAt: '2026-10-07T08:00:00.000Z',
      updatedAt: '2026-10-07T10:00:00.000Z',
    });
    expect(listener).toHaveBeenCalled();
    expect(sync.controller.getSnapshot()).toEqual({ pendingCount: 2, failedCount: 0 });

    online.value = true;
    await sync.controller.sync();
    expect(sync.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(await lessonRemote.list()).toHaveLength(1);
    expect(await prepRemote.list()).toHaveLength(1);
    expect(sync.controller.retryDelay()).toBeNull();
  });

  it('storage událost z jiné záložky ohlásí změnu fronty i kolekce', () => {
    const storage = createMemoryStorage();
    const onRemoteChange = vi.fn();
    const sync = createUserSync({
      storage,
      userId: USER,
      remote: emptyRemotes(),
      onRemoteChange,
    });
    const listener = vi.fn();
    sync.controller.subscribe(listener);
    const keys = userSyncKeys(USER);

    sync.controller.handleStorageEvent(keys.outbox);
    expect(listener).toHaveBeenCalledTimes(1);
    sync.controller.handleStorageEvent(keys.prepChecks);
    expect(onRemoteChange).toHaveBeenCalledWith('lesson_prep_checks');
    sync.controller.handleStorageEvent('hidepath.v1.inventory');
    expect(onRemoteChange).toHaveBeenCalledTimes(1);
    sync.controller.handleStorageEvent(null);
    expect(onRemoteChange).toHaveBeenLastCalledWith(null);
  });

  it('outbox je čitelný JSON pod per-user klíčem', async () => {
    const storage = createMemoryStorage();
    const sync = createUserSync({
      storage,
      userId: USER,
      remote: emptyRemotes(),
      isOnline: () => false,
    });
    await sync.lessonRecords.upsert(entry('p1-thickness', 1.4, '10:00'));
    expect(parseOutbox(storage.getItem(userSyncKeys(USER).outbox))).toEqual([
      expect.objectContaining({
        userId: USER,
        entity: 'lesson_records',
        entityId: 'lid-wallet/p1-thickness',
        operation: 'upsert',
      }),
    ]);
  });
});
