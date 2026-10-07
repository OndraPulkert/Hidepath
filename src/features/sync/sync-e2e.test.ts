import { createMemoryStorage, type StorageLike } from '@/features/data/local-collection';
import { naturalKeys, STORAGE_KEYS } from '@/features/data/repositories';
import { type InventoryItem } from '@/features/inventory/types';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { buildLessonNote } from '@/features/notes/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { DEFERRED_RETRY_MS, parseOutbox } from '@/features/sync/outbox';
import {
  clearUserSyncData,
  createUserSync,
  type UserSync,
  userSyncKeys,
} from '@/features/sync/synced-collection';
import { startSyncDriver, type SyncDriverEnv } from '@/features/sync/use-sync-driver';
import { createFakeSyncServer, type FakeSyncServer } from '@/test/fake-sync-server';

/**
 * Simulovaná synchronizace od začátku do konce nad falešným serverem (SQL pravidla ze
 * `supabase/migrations`): dvě zařízení jednoho účtu, druhý účet v tomtéž prohlížeči, výpadky
 * sítě, souběžné úpravy (stale) a chybějící tabulka poznámek – všechny čtyři kolekce.
 */
const USER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const T0 = Date.parse('2026-10-08T10:00:00.000Z');

interface Clock {
  now: number;
}

function iso(clock: Clock, offsetMs = 0) {
  return new Date(clock.now + offsetMs).toISOString();
}

interface Device {
  storage: StorageLike;
  sync: UserSync;
  online: { value: boolean };
}

function openDevice(
  server: FakeSyncServer,
  clock: Clock,
  userId: string,
  storage: StorageLike = createMemoryStorage(),
): Device {
  const online = { value: true };
  const sync = createUserSync({
    storage,
    userId,
    remote: server.remoteFor(userId),
    isOnline: () => online.value && server.network.online,
    now: () => clock.now,
  });
  return { storage, sync, online };
}

/** Úpravy přesně jako hooky v UI: nad aktuální lokální kopií, razítko po známém stavu. */
const edit = {
  async record(d: Device, clock: Clock, fieldId: string, value: number | string | null) {
    const existing = (await d.sync.lessonRecords.list()).find((r) => r.fieldId === fieldId);
    const record: LessonRecordEntry = {
      id: existing?.id ?? crypto.randomUUID(),
      userId: null,
      projectSlug: 'lid-wallet',
      lessonSlug: '01-measure',
      fieldId,
      value,
      contentVersion: 1,
      createdAt: existing?.createdAt ?? iso(clock),
      updatedAt: iso(clock),
    };
    if (existing && Date.parse(existing.updatedAt) >= clock.now) {
      record.updatedAt = new Date(Date.parse(existing.updatedAt) + 1).toISOString();
    }
    return d.sync.lessonRecords.upsert(record);
  },
  async prep(d: Device, clock: Clock, itemKey: string, checked: boolean) {
    const existing = (await d.sync.prepChecks.list()).find((r) => r.itemKey === itemKey);
    const record: PrepCheckRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      userId: null,
      projectSlug: 'lid-wallet',
      lessonSlug: '01-measure',
      itemKey,
      checked,
      createdAt: existing?.createdAt ?? iso(clock),
      updatedAt: iso(clock),
    };
    return d.sync.prepChecks.upsert(record);
  },
  async tool(d: Device, clock: Clock, slug: string, status: InventoryItem['status']) {
    const existing = (await d.sync.inventory.list()).find((r) => r.equipmentSlug === slug);
    const record: InventoryItem = {
      id: existing?.id ?? crypto.randomUUID(),
      userId: null,
      equipmentSlug: slug,
      status,
      purchasePriceCents: existing?.purchasePriceCents ?? null,
      currency: 'CZK',
      shopName: null,
      purchasedAt: null,
      notes: null,
      createdAt: existing?.createdAt ?? iso(clock),
      updatedAt: iso(clock),
    };
    return d.sync.inventory.upsert(record);
  },
  async note(d: Device, clock: Clock, lessonSlug: string, text: string) {
    const existing = (await d.sync.lessonNotes.list()).find((n) => n.lessonSlug === lessonSlug);
    const record = buildLessonNote(
      existing,
      { projectSlug: 'lid-wallet', lessonSlug, text },
      crypto.randomUUID(),
      iso(clock),
    );
    return record ? d.sync.lessonNotes.upsert(record) : existing;
  },
};

/** Obsah všech čtyř kolekcí bez id/časů – pro porovnání zařízení se serverem. */
async function contentOf(d: Device) {
  const sortBy = <T>(items: T[], key: (t: T) => string) =>
    [...items].sort((a, b) => key(a).localeCompare(key(b)));
  return {
    records: sortBy(await d.sync.lessonRecords.list(), naturalKeys.lessonRecords).map(
      (r) => `${r.fieldId}=${String(r.value)}`,
    ),
    prep: sortBy(await d.sync.prepChecks.list(), naturalKeys.prepChecks).map(
      (r) => `${r.itemKey}=${String(r.checked)}`,
    ),
    inventory: sortBy(await d.sync.inventory.list(), naturalKeys.inventory).map(
      (r) => `${r.equipmentSlug}=${r.status}`,
    ),
    notes: sortBy(await d.sync.lessonNotes.list(), naturalKeys.lessonNotes).map(
      (r) => `${r.lessonSlug}=${r.text}`,
    ),
  };
}

function serverContent(server: FakeSyncServer, userId: string) {
  const mine = <T extends { userId: string | null }>(rows: T[]) =>
    rows.filter((r) => r.userId === userId);
  const sortBy = <T>(items: T[], key: (t: T) => string) =>
    [...items].sort((a, b) => key(a).localeCompare(key(b)));
  return {
    records: sortBy(mine(server.lessonRecords.rows()), naturalKeys.lessonRecords).map(
      (r) => `${r.fieldId}=${String(r.value)}`,
    ),
    prep: sortBy(mine(server.prepChecks.rows()), naturalKeys.prepChecks).map(
      (r) => `${r.itemKey}=${String(r.checked)}`,
    ),
    inventory: sortBy(mine(server.inventory.rows()), naturalKeys.inventory).map(
      (r) => `${r.equipmentSlug}=${r.status}`,
    ),
    notes: sortBy(mine(server.lessonNotes.rows()), naturalKeys.lessonNotes).map(
      (r) => `${r.lessonSlug}=${r.text}`,
    ),
  };
}

describe('simulovaná synchronizace (falešný server, všechny čtyři kolekce)', () => {
  it('dvě zařízení, offline úpravy, souběžné změny a návrat sítě: vše se sejde', async () => {
    const clock: Clock = { now: T0 };
    const server = createFakeSyncServer({ now: () => clock.now });
    const phone = openDevice(server, clock, USER_A);
    const laptop = openDevice(server, clock, USER_A);

    // Výchozí stav z notebooku (online).
    await edit.tool(laptop, clock, 'mallet', 'ordered');
    await edit.prep(laptop, clock, 'print:template', true);
    await laptop.sync.controller.sync();
    await phone.sync.controller.sync();
    expect(await contentOf(phone)).toEqual(serverContent(server, USER_A));

    // Telefon v dílně bez signálu: všechny čtyři kolekce.
    clock.now += 60_000;
    phone.online.value = false;
    await edit.record(phone, clock, 'p1-thickness', 1.4);
    await edit.prep(phone, clock, 'print:template', false); // později přebije notebook
    await edit.tool(phone, clock, 'mallet', 'owned'); // „Mám“
    await edit.tool(phone, clock, 'scratch-awl', 'owned');
    await edit.note(phone, clock, '01-measure', 'krok 3 – lepidlo teklo');
    expect(phone.sync.controller.getSnapshot()).toEqual({ pendingCount: 5, failedCount: 0 });

    // Mezitím notebook (online) – novější úpravy téhož.
    clock.now += 60_000;
    await edit.prep(laptop, clock, 'print:template', true);
    await edit.note(laptop, clock, '02-cut', 'nůž tupý, nabrousit');
    await laptop.sync.controller.flush();

    // Telefon se připojí: jeho starší zaškrtnutí je stale, ostatní odejde.
    clock.now += 60_000;
    phone.online.value = true;
    await phone.sync.controller.sync();
    expect(phone.sync.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    await laptop.sync.controller.sync();

    const expected = {
      records: ['p1-thickness=1.4'],
      prep: ['print:template=true'],
      inventory: ['mallet=owned', 'scratch-awl=owned'],
      notes: ['01-measure=krok 3 – lepidlo teklo', '02-cut=nůž tupý, nabrousit'],
    };
    expect(serverContent(server, USER_A)).toEqual(expected);
    expect(await contentOf(phone)).toEqual(expected);
    expect(await contentOf(laptop)).toEqual(expected);
    // Žádné duplicity přirozených klíčů na serveru.
    expect(server.inventory.rows()).toHaveLength(2);

    // Vymazání poznámky na telefonu se na notebooku nevrátí (náhrobek).
    clock.now += 60_000;
    await edit.note(phone, clock, '02-cut', '');
    await phone.sync.controller.sync();
    await laptop.sync.controller.sync();
    await phone.sync.controller.sync();
    expect((await contentOf(laptop)).notes).toEqual([
      '01-measure=krok 3 – lepidlo teklo',
      '02-cut=',
    ]);
    expect((await contentOf(phone)).notes).toEqual((await contentOf(laptop)).notes);
  });

  it('přepnutí účtu v tomtéž prohlížeči: data se nepotkají, odhlášení uklidí jen svůj účet', async () => {
    const clock: Clock = { now: T0 };
    const server = createFakeSyncServer({ now: () => clock.now });
    const storage = createMemoryStorage();
    const a = openDevice(server, clock, USER_A, storage);
    await edit.tool(a, clock, 'mallet', 'owned');
    await edit.note(a, clock, '01-measure', 'poznámka A');
    a.online.value = false;
    await edit.record(a, clock, 'p1-thickness', 1.1); // zůstane neodeslané

    clearUserSyncData(storage, USER_A); // odhlášení A
    const b = openDevice(server, clock, USER_B, storage);
    await b.sync.controller.sync();
    expect(await contentOf(b)).toEqual({ records: [], prep: [], inventory: [], notes: [] });
    await edit.tool(b, clock, 'mallet', 'want_to_buy');
    await edit.prep(b, clock, 'req:spacer', true);
    await b.sync.controller.sync();

    expect(serverContent(server, USER_A)).toEqual({
      records: [],
      prep: [],
      inventory: ['mallet=owned'],
      notes: ['01-measure=poznámka A'],
    });
    expect(serverContent(server, USER_B).inventory).toEqual(['mallet=want_to_buy']);
    for (const key of Object.values(userSyncKeys(USER_A))) expect(storage.getItem(key)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.lessonNotes)).toBeNull();

    // A se znovu přihlásí: dostane svá data ze serveru, ne data B.
    const again = openDevice(server, clock, USER_A, storage);
    await again.sync.controller.sync();
    expect(await contentOf(again)).toEqual(serverContent(server, USER_A));
  });

  it('chybějící tabulka lesson_notes: ostatní kolekce běží, poznámky čekají v zařízení a po migraci odejdou', async () => {
    const clock: Clock = { now: T0 };
    const server = createFakeSyncServer({ now: () => clock.now, lessonNotes: { missing: true } });
    const phone = openDevice(server, clock, USER_A);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await edit.record(phone, clock, 'p1-thickness', 1.4);
    await edit.prep(phone, clock, 'print:template', true);
    await edit.tool(phone, clock, 'mallet', 'owned');
    await edit.note(phone, clock, '01-measure', 'krok 3');
    await phone.sync.controller.sync();

    expect(serverContent(server, USER_A)).toEqual({
      records: ['p1-thickness=1.4'],
      prep: ['print:template=true'],
      inventory: ['mallet=owned'],
      notes: [],
    });
    expect(phone.sync.controller.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect((await contentOf(phone)).notes).toEqual(['01-measure=krok 3']);

    // Ovladač s časovači: během odkladu se na tabulku poznámek neptá (outbox se netočí).
    const timers: { at: number; fn: () => void }[] = [];
    const env: SyncDriverEnv = {
      addWindowListener: () => () => undefined,
      addVisibilityListener: () => () => undefined,
      isVisible: () => true,
      isOnline: () => true,
      setTimeout: (fn, ms) => {
        const timer = { at: clock.now + ms, fn };
        timers.push(timer);
        return timer;
      },
      clearTimeout: (handle) => {
        const index = timers.indexOf(handle as (typeof timers)[number]);
        if (index !== -1) timers.splice(index, 1);
      },
    };
    const settle = async () => {
      for (let i = 0; i < 20; i += 1) await Promise.resolve();
    };
    const advance = async (ms: number) => {
      const until = clock.now + ms;
      for (;;) {
        timers.sort((x, y) => x.at - y.at);
        const next = timers[0];
        if (!next || next.at > until) break;
        timers.shift();
        clock.now = next.at;
        next.fn();
        await settle();
      }
      clock.now = until;
    };
    const requestsBefore = server.lessonNotes.state.requests;
    const stop = startSyncDriver(phone.sync.controller, env);
    await settle();
    await advance(DEFERRED_RETRY_MS - 60_000);
    expect(server.lessonNotes.state.requests).toBe(requestsBefore);
    expect(timers.length).toBeLessThanOrEqual(1);

    // Migrace schválena a nasazena; po odkladu ovladač poznámky sám odešle.
    server.lessonNotes.state.missing = false;
    await advance(10 * 60_000);
    stop();
    expect(serverContent(server, USER_A).notes).toEqual(['01-measure=krok 3']);
    expect(parseOutbox(phone.storage.getItem(userSyncKeys(USER_A).outbox))).toEqual([]);

    // Druhé zařízení teď stáhne všechny čtyři kolekce.
    const laptop = openDevice(server, clock, USER_A);
    await laptop.sync.controller.sync();
    expect(await contentOf(laptop)).toEqual(serverContent(server, USER_A));
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('chybějící tabulka a odhlášení: neodeslané poznámky A se nedostanou k dalšímu uživateli', async () => {
    const clock: Clock = { now: T0 };
    const server = createFakeSyncServer({ now: () => clock.now, lessonNotes: { missing: true } });
    const storage = createMemoryStorage();
    const a = openDevice(server, clock, USER_A, storage);
    await edit.note(a, clock, '01-measure', 'soukromá poznámka A');
    await a.sync.controller.sync();
    expect(a.sync.controller.unsentCount()).toBe(1);

    clearUserSyncData(storage, USER_A);
    expect(storage.getItem(STORAGE_KEYS.lessonNotes)).toBeNull();
    server.lessonNotes.state.missing = false;
    const b = openDevice(server, clock, USER_B, storage);
    await b.sync.controller.sync();
    expect(await b.sync.lessonNotes.list()).toEqual([]);
    expect(server.lessonNotes.rows()).toEqual([]);
  });
});
