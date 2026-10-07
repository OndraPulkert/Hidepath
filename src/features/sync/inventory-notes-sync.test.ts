import { createMemoryStorage, type StorageLike } from '@/features/data/local-collection';
import { STORAGE_KEYS } from '@/features/data/repositories';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { DEFERRED_RETRY_MS, parseOutbox } from '@/features/sync/outbox';
import { clearUserSyncData, createUserSync, userSyncKeys } from '@/features/sync/synced-collection';
import { createFakeSyncServer } from '@/test/fake-sync-server';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ID1 = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';

function tool(status: InventoryItem['status'], at: string, id = ID1): InventoryItem {
  return {
    id,
    userId: null,
    equipmentSlug: 'stitching-chisels',
    status,
    purchasePriceCents: null,
    currency: 'CZK',
    shopName: null,
    purchasedAt: null,
    notes: null,
    createdAt: '2026-10-07T08:00:00.000Z',
    updatedAt: `2026-10-07T${at}:00.000Z`,
  };
}

function note(text: string, at: string, id = ID1, lessonSlug = '01-measure'): LessonNoteRecord {
  return {
    id,
    userId: null,
    projectSlug: 'lid-wallet',
    lessonSlug,
    text,
    createdAt: '2026-10-07T08:00:00.000Z',
    updatedAt: `2026-10-07T${at}:00.000Z`,
  };
}

function device(
  server: ReturnType<typeof createFakeSyncServer>,
  options: { storage?: StorageLike; userId?: string; online?: () => boolean; now?: () => number },
) {
  const storage = options.storage ?? createMemoryStorage();
  const userId = options.userId ?? USER;
  const sync = createUserSync({
    storage,
    userId,
    remote: server.remoteFor(userId),
    isOnline: options.online ?? (() => server.network.online),
    now: options.now,
  });
  return { storage, ...sync };
}

describe('inventář v synchronizované kolekci', () => {
  it('„Mám“ offline s účtem: uloží se hned lokálně a po připojení odejde do účtu', async () => {
    const server = createFakeSyncServer();
    server.network.online = false;
    const phone = device(server, {});

    const saved = await phone.inventory.upsert(tool('owned', '10:00'));
    expect(saved.userId).toBe(USER);
    expect(await phone.inventory.list()).toEqual([
      expect.objectContaining({ status: 'owned', userId: USER }),
    ]);
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 1, failedCount: 0 });
    expect(server.inventory.rows()).toEqual([]);

    server.network.online = true;
    await phone.controller.sync();
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(server.inventory.rows()).toEqual([
      expect.objectContaining({
        equipmentSlug: 'stitching-chisels',
        status: 'owned',
        userId: USER,
      }),
    ]);
  });

  it('výpadek sítě je chyba (failed) s opakováním, data zůstanou lokálně', async () => {
    const server = createFakeSyncServer();
    const phone = device(server, { online: () => true, now: () => 0 });
    server.network.online = false; // prohlížeč si myslí, že je online, ale síť neodpovídá
    await phone.inventory.upsert(tool('owned', '10:00'));
    await phone.inventory.flush();
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 1, failedCount: 1 });
    expect(await phone.inventory.list()).toHaveLength(1);

    server.network.online = true;
    await phone.inventory.flush({ force: true });
    expect(server.inventory.rows()).toHaveLength(1);
  });

  it('stale: novější stav z jiného zařízení vyhraje nad starším offline zápisem', async () => {
    const server = createFakeSyncServer();
    server.network.online = false;
    const phone = device(server, {});
    await phone.inventory.upsert(tool('owned', '10:00'));
    server.inventory.seed({ ...tool('ordered', '11:00', ID2), userId: USER });

    server.network.online = true;
    const result = await phone.inventory.flush();
    expect(result.stale).toBe(1);
    expect(server.inventory.rows()).toEqual([expect.objectContaining({ status: 'ordered' })]);
    expect(await phone.inventory.list()).toEqual([
      expect.objectContaining({ id: ID2, status: 'ordered' }),
    ]);
  });

  it('bez triggeru reject_stale (stav před migrací) by starší offline zápis přepsal novější', async () => {
    const server = createFakeSyncServer({ inventory: { staleGuard: false } });
    server.network.online = false;
    const phone = device(server, {});
    await phone.inventory.upsert(tool('owned', '10:00'));
    server.inventory.seed({ ...tool('ordered', '11:00', ID2), userId: USER });

    server.network.online = true;
    await phone.inventory.flush();
    // Proto migrace 20261008120000 přidává inventory_items_a_reject_stale.
    expect(server.inventory.rows()).toEqual([expect.objectContaining({ status: 'owned' })]);
  });

  it('kolize přirozeného klíče: lokální položka převezme id serveru (bez duplicity)', async () => {
    const server = createFakeSyncServer();
    server.inventory.seed({ ...tool('want_to_buy', '09:00', ID2), userId: USER });
    server.network.online = false;
    const phone = device(server, {});
    await phone.inventory.upsert(tool('owned', '10:00', ID1));

    server.network.online = true;
    await phone.controller.sync();
    expect(server.inventory.rows()).toEqual([
      expect.objectContaining({ id: ID2, status: 'owned' }),
    ]);
    expect(await phone.inventory.list()).toEqual([
      expect.objectContaining({ id: ID2, status: 'owned' }),
    ]);
  });

  it('přepnutí účtu: inventář druhého uživatele je oddělený a odhlášení ho smaže', async () => {
    const server = createFakeSyncServer();
    const storage = createMemoryStorage();
    server.network.online = false;
    const a = device(server, { storage, userId: USER });
    await a.inventory.upsert(tool('owned', '10:00'));

    const b = device(server, { storage, userId: OTHER });
    expect(await b.inventory.list()).toEqual([]);
    expect(b.controller.getSnapshot().pendingCount).toBe(0);
    expect(storage.getItem(STORAGE_KEYS.inventory)).toBeNull();

    clearUserSyncData(storage, USER);
    expect(storage.getItem(userSyncKeys(USER).inventory)).toBeNull();
    expect(storage.getItem(userSyncKeys(USER).outbox)).toBeNull();

    server.network.online = true;
    await b.controller.sync();
    expect(server.inventory.rows()).toEqual([]);
  });
});

describe('poznámky od ponku v synchronizované kolekci', () => {
  it('poznámka offline odejde po připojení a druhé zařízení ji stáhne', async () => {
    const server = createFakeSyncServer();
    server.network.online = false;
    const phone = device(server, {});
    await phone.lessonNotes.upsert(note('krok 3 – lepidlo teklo', '10:00'));
    expect(phone.controller.getSnapshot().pendingCount).toBe(1);

    server.network.online = true;
    await phone.controller.sync();
    const laptop = device(server, {});
    await laptop.controller.sync();
    expect(await laptop.lessonNotes.list()).toEqual([
      expect.objectContaining({ text: 'krok 3 – lepidlo teklo', userId: USER }),
    ]);
  });

  it('vymazání (prázdný text) se nevrátí z druhého zařízení', async () => {
    const server = createFakeSyncServer();
    const phone = device(server, {});
    const laptop = device(server, {});
    await phone.lessonNotes.upsert(note('stará poznámka', '10:00'));
    await phone.controller.sync();
    await laptop.controller.sync();

    const [current] = await phone.lessonNotes.list();
    await phone.lessonNotes.upsert({
      ...current!,
      text: '',
      updatedAt: '2026-10-07T11:00:00.000Z',
    });
    await phone.controller.sync();
    await laptop.controller.sync();
    expect(server.lessonNotes.rows()).toEqual([expect.objectContaining({ text: '' })]);
    expect(await laptop.lessonNotes.list()).toEqual([expect.objectContaining({ text: '' })]);
  });

  it('stale: starší poznámka z offline zařízení nepřepíše novější', async () => {
    const server = createFakeSyncServer();
    server.network.online = false;
    const phone = device(server, {});
    await phone.lessonNotes.upsert(note('starší', '10:00'));
    server.lessonNotes.seed({ ...note('novější', '12:00', ID2), userId: USER });

    server.network.online = true;
    expect((await phone.lessonNotes.flush()).stale).toBe(1);
    expect(await phone.lessonNotes.list()).toEqual([
      expect.objectContaining({ id: ID2, text: 'novější' }),
    ]);
  });
});

describe('chybějící tabulka lesson_notes (migrace ještě neproběhla)', () => {
  function setup() {
    let time = Date.parse('2026-10-08T10:00:00.000Z');
    const server = createFakeSyncServer({ lessonNotes: { missing: true }, now: () => time });
    const storage = createMemoryStorage();
    const phone = device(server, { storage, now: () => time });
    return {
      server,
      storage,
      phone,
      now: () => time,
      advance: (ms: number) => {
        time += ms;
      },
    };
  }

  it('poznámka zůstane lokálně, outbox se netočí a pruh nehlásí chybu ani čekání', async () => {
    const { server, phone } = setup();
    await phone.lessonNotes.upsert(note('krok 3', '10:00'));
    const result = await phone.lessonNotes.flush();

    expect(result).toEqual({ sent: 0, failed: 0, stale: 0, deferred: 1 });
    expect(await phone.lessonNotes.list()).toEqual([expect.objectContaining({ text: 'krok 3' })]);
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(parseOutbox(phone.storage.getItem(userSyncKeys(USER).outbox))).toEqual([
      expect.objectContaining({ entity: 'lesson_notes', status: 'deferred' }),
    ]);
    expect(server.lessonNotes.state.requests).toBe(1);

    // Další zápisy, opakované odeslání i stažení se na server neptají, dokud neuplyne odklad.
    await phone.lessonNotes.upsert(note('krok 4', '10:01', ID2, '02-cut'));
    await phone.lessonNotes.flush({ force: true });
    await phone.controller.sync();
    expect(server.lessonNotes.state.requests).toBe(1);
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(await phone.lessonNotes.list()).toHaveLength(2);
  });

  it('ostatní kolekce se synchronizují dál a nic se nehlásí jako chyba', async () => {
    const { server, phone } = setup();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await phone.lessonNotes.upsert(note('krok 3', '10:00'));
    await phone.inventory.upsert(tool('owned', '10:00'));
    await phone.controller.sync();

    expect(server.inventory.rows()).toHaveLength(1);
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('opakuje se později: po odkladu a nasazení migrace poznámky odejdou', async () => {
    const { server, phone, advance } = setup();
    await phone.lessonNotes.upsert(note('krok 3', '10:00'));
    await phone.controller.sync();
    // Ovladač naplánuje další pokus až po odkladu (žádné rychlé opakování).
    expect(phone.controller.retryDelay()).toBe(DEFERRED_RETRY_MS);

    server.lessonNotes.state.missing = false; // migrace schválena a nasazena
    advance(DEFERRED_RETRY_MS);
    await phone.controller.sync();
    expect(server.lessonNotes.rows()).toEqual([
      expect.objectContaining({ text: 'krok 3', userId: USER }),
    ]);
    expect(parseOutbox(phone.storage.getItem(userSyncKeys(USER).outbox))).toEqual([]);
    expect(phone.controller.retryDelay()).toBeNull();
  });

  it('nová instance (reload) se zeptá jednou, pak zase odloží', async () => {
    const { server, phone, storage, now } = setup();
    await phone.lessonNotes.upsert(note('krok 3', '10:00'));
    await phone.controller.sync();
    const before = server.lessonNotes.state.requests;

    const reloaded = device(server, { storage, now });
    await reloaded.controller.sync();
    await reloaded.controller.sync();
    // Odložená změna ještě není na řadě; jen stažení se jednou zeptá a zjistí, že tabulka chybí.
    expect(server.lessonNotes.state.requests - before).toBe(1);
    expect(await reloaded.lessonNotes.list()).toHaveLength(1);
  });

  it('odhlášení: odložené poznámky se nevrátí do poznámek prohlížeče (soukromí), před smazáním se počítají', async () => {
    const { phone, storage } = setup();
    await phone.lessonNotes.upsert(note('soukromá, neodeslaná', '10:00'));
    await phone.controller.sync();
    expect(phone.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    // Odhlášení se musí zeptat: odložená poznámka by se jinak smazala bez varování.
    expect(phone.controller.unsentCount()).toBe(1);

    clearUserSyncData(storage, USER);
    expect(storage.getItem(userSyncKeys(USER).lessonNotes)).toBeNull();
    expect(storage.getItem(userSyncKeys(USER).outbox)).toBeNull();
    // Další uživatel prohlížeče ji neuvidí a nepřenese do svého účtu.
    expect(storage.getItem(STORAGE_KEYS.lessonNotes)).toBeNull();
  });
});
