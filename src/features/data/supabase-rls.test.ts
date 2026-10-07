/**
 * Integrační test proti LOKÁLNÍ Supabase instanci (`supabase start`). Spouští se přes
 * `pnpm test:db`, který doplní proměnné z `supabase status`. Bez nich se test přeskočí.
 * Service-role key se používá jen tady, k založení testovacích uživatelů – nikdy v klientu.
 */
import { createClient } from '@supabase/supabase-js';

import {
  createSupabaseRepositories,
  isStaleWriteError,
} from '@/features/data/supabase-repositories';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type LessonNoteRecord } from '@/features/notes/types';
import { type Database } from '@/lib/supabase/database.types';
import { item } from '@/test/factories';

const url = import.meta.env.HIDEPATH_TEST_SUPABASE_URL ?? '';
const anonKey = import.meta.env.HIDEPATH_TEST_SUPABASE_ANON_KEY ?? '';
const serviceKey = import.meta.env.HIDEPATH_TEST_SUPABASE_SERVICE_KEY ?? '';
const isLocal = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url);
const allowRemote = import.meta.env.HIDEPATH_TEST_ALLOW_REMOTE === '1';
const enabled = url !== '' && anonKey !== '' && serviceKey !== '' && (isLocal || allowRemote);

const describeDb = enabled ? describe : describe.skip;

const createdUserIds: string[] = [];

async function signedInClient(email: string, password: string) {
  const admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error && !/already/i.test(created.error.message)) throw created.error;
  if (created.data.user) createdUserIds.push(created.data.user.id);
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, userId: data.user.id, admin };
}

describeDb('Supabase – RLS a repozitáře (lokální instance)', () => {
  const run = crypto.randomUUID().slice(0, 8);
  // Náhodné heslo per běh – nikdy pevné heslo v repozitáři.
  const password = `Hp-${crypto.randomUUID()}-Aa1`;

  // Testovací účty po sobě uklidíme (kaskáda smaže i jejich řádky).
  afterAll(async () => {
    const admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
    for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
  });

  it('uživatel vidí a zapisuje jen svá data; cizí user_id RLS odmítne', async () => {
    const a = await signedInClient(`rls-a-${run}@example.com`, password);
    const b = await signedInClient(`rls-b-${run}@example.com`, password);
    const reposA = createSupabaseRepositories(a.client, a.userId);
    const reposB = createSupabaseRepositories(b.client, b.userId);

    const knife = { ...item('utility-knife', 'owned'), id: crypto.randomUUID() };
    const saved = await reposA.inventory.upsert(knife);
    expect(saved).toMatchObject({
      equipmentSlug: 'utility-knife',
      status: 'owned',
      userId: a.userId,
    });
    expect(saved.createdAt).toBeTruthy();

    expect(await reposB.inventory.list()).toHaveLength(0);
    expect((await reposA.inventory.list()).map((i) => i.equipmentSlug)).toEqual(['utility-knife']);

    // Pokus B zapsat řádek s user_id uživatele A → RLS (with check) ho odmítne.
    const forged = await b.client.from('inventory_items').insert({
      id: crypto.randomUUID(),
      user_id: a.userId,
      equipment_slug: 'mallet',
      status: 'owned',
    });
    expect(forged.error).not.toBeNull();

    // Pokus B upravit řádek A → nula změněných řádků, žádný únik.
    const tampered = await b.client
      .from('inventory_items')
      .update({ status: 'want_to_buy' })
      .eq('id', knife.id)
      .select();
    expect(tampered.data).toEqual([]);
    expect((await reposA.inventory.list())[0]?.status).toBe('owned');
  });

  it('upsert je idempotentní podle id a kolize přirozeného klíče se sloučí do existujícího řádku', async () => {
    const a = await signedInClient(`rls-c-${run}@example.com`, password);
    const repos = createSupabaseRepositories(a.client, a.userId);

    const first = { ...item('waxed-thread', 'ordered'), id: crypto.randomUUID() };
    await repos.inventory.upsert(first);
    await repos.inventory.upsert({ ...first, status: 'owned' });
    let list = await repos.inventory.list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: first.id, status: 'owned' });

    // Jiné zařízení vytvořilo tutéž položku pod jiným id → sloučí se, id zůstane původní.
    // Novější čas: druhý zápis se stejným časem dostal čas serveru a starší zápis by
    // trigger reject_stale_update zahodil (migrace 20261008120000).
    const fromOtherDevice = {
      ...item('waxed-thread', 'want_to_buy'),
      id: crypto.randomUUID(),
      shopName: 'jinde',
      updatedAt: new Date(Date.now() + 60_000).toISOString(),
    };
    const merged = await repos.inventory.upsert(fromOtherDevice);
    expect(merged.id).toBe(first.id);
    expect(merged.status).toBe('want_to_buy');
    list = await repos.inventory.list();
    expect(list).toHaveLength(1);
  });

  it('zápis do projektu, lekce a kontrolní body procházejí přes RLS a trigger plní updated_at', async () => {
    const a = await signedInClient(`rls-d-${run}@example.com`, password);
    const repos = createSupabaseRepositories(a.client, a.userId);
    const now = new Date().toISOString();

    const enrollment = await repos.enrollments.upsert({
      id: crypto.randomUUID(),
      userId: a.userId,
      projectSlug: 'card-holder',
      contentVersion: 1,
      status: 'active',
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    expect(enrollment.status).toBe('active');

    const lesson = await repos.lessonProgress.upsert({
      id: crypto.randomUUID(),
      userId: a.userId,
      projectSlug: 'card-holder',
      lessonSlug: '01-prepare-workspace',
      status: 'in_progress',
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    const cp = await repos.checkpointProgress.upsert({
      id: crypto.randomUUID(),
      userId: a.userId,
      projectSlug: 'card-holder',
      lessonSlug: '01-prepare-workspace',
      checkpointSlug: 'table-ready',
      completed: true,
      createdAt: now,
      updatedAt: now,
    });
    expect(lesson.status).toBe('in_progress');
    expect(cp.completed).toBe(true);

    // `locked` do databáze nepatří – CHECK constraint ho odmítne.
    const locked = await a.client.from('lesson_progress').insert({
      id: crypto.randomUUID(),
      user_id: a.userId,
      project_slug: 'card-holder',
      lesson_slug: '02-straight-cut',
      status: 'locked',
    });
    expect(locked.error?.code).toBe('23514');

    // Profil vznikl triggerem.
    const profile = await a.client.from('profiles').select('id').eq('id', a.userId).maybeSingle();
    expect(profile.data?.id).toBe(a.userId);
  });

  describe('zápisník a příprava (lesson_records, lesson_prep_checks)', () => {
    const entry = (userId: string, patch: Partial<LessonRecordEntry> = {}): LessonRecordEntry => ({
      id: crypto.randomUUID(),
      userId,
      projectSlug: 'lid-wallet',
      lessonSlug: '01-measure',
      fieldId: 'p1-thickness',
      value: 1.4,
      contentVersion: 1,
      createdAt: '2026-10-07T10:00:00.000Z',
      updatedAt: '2026-10-07T10:00:00.000Z',
      ...patch,
    });

    it('B nevidí zápisy A, cizí user_id RLS odmítne a anon nemá přístup', async () => {
      const a = await signedInClient(`rls-e-${run}@example.com`, password);
      const b = await signedInClient(`rls-f-${run}@example.com`, password);
      const reposA = createSupabaseRepositories(a.client, a.userId);
      const reposB = createSupabaseRepositories(b.client, b.userId);

      await reposA.lessonRecords!.upsert(entry(a.userId));
      await reposA.prepChecks!.upsert({
        id: crypto.randomUUID(),
        userId: a.userId,
        projectSlug: 'lid-wallet',
        lessonSlug: '01-measure',
        itemKey: 'print:template',
        checked: true,
        createdAt: '2026-10-07T10:00:00.000Z',
        updatedAt: '2026-10-07T10:00:00.000Z',
      });
      expect(await reposB.lessonRecords!.list()).toEqual([]);
      expect(await reposB.prepChecks!.list()).toEqual([]);

      const forged = await b.client.from('lesson_records').insert({
        id: crypto.randomUUID(),
        user_id: a.userId,
        project_slug: 'lid-wallet',
        lesson_slug: '01-measure',
        field_id: 'd1-thickness',
        value: 1,
        content_version: 1,
      });
      expect(forged.error).not.toBeNull();

      const anon = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
      // anon nemá na tabulky žádná práva (permission denied), natož řádky.
      const anonRead = await anon.from('lesson_records').select('*');
      expect(anonRead.error).not.toBeNull();
      const anonPrep = await anon.from('lesson_prep_checks').select('*');
      expect(anonPrep.error).not.toBeNull();
    });

    it('hodnota musí být skalár (číslo, text, null) do 2000 znaků; item_key 1..120', async () => {
      const a = await signedInClient(`rls-g-${run}@example.com`, password);
      const insert = (field: string, value: unknown) =>
        a.client.from('lesson_records').insert({
          id: crypto.randomUUID(),
          user_id: a.userId,
          project_slug: 'lid-wallet',
          lesson_slug: '01-measure',
          field_id: field,
          value: value as never,
          content_version: 1,
        });
      expect((await insert('f-number', 1.25)).error).toBeNull();
      expect((await insert('f-text', 'záloha-a')).error).toBeNull();
      expect((await insert('f-null', null)).error).toBeNull();
      expect((await insert('f-bool', true)).error?.code).toBe('23514');
      expect((await insert('f-object', { a: 1 })).error?.code).toBe('23514');
      expect((await insert('f-array', [1])).error?.code).toBe('23514');
      expect((await insert('f-big', 'x'.repeat(2100))).error?.code).toBe('23514');
      // Limit je ve znacích: 1000 znaků s diakritikou a zalomením (víc než 2000 bajtů) projde.
      expect((await insert('f-czech', 'ěščřžýáíé\n'.repeat(100))).error).toBeNull();
      expect((await insert('Neplatne_ID', 1)).error?.code).toBe('23514');

      const longKey = await a.client.from('lesson_prep_checks').insert({
        id: crypto.randomUUID(),
        user_id: a.userId,
        project_slug: 'lid-wallet',
        lesson_slug: '01-measure',
        item_key: 'x'.repeat(121),
        checked: true,
      });
      expect(longKey.error?.code).toBe('23514');
    });

    it('starší zápis nepřepíše novější (reject_stale_update) a repozitář hlásí stale', async () => {
      const a = await signedInClient(`rls-h-${run}@example.com`, password);
      const repos = createSupabaseRepositories(a.client, a.userId);
      const newer = entry(a.userId, { value: 1.6, updatedAt: '2026-10-07T12:00:00.000Z' });
      await repos.lessonRecords!.upsert(newer);

      // Stejné id, starší čas → trigger zápis zahodí.
      const sameId: unknown = await repos
        .lessonRecords!.upsert({ ...newer, value: 1.1, updatedAt: '2026-10-07T09:00:00.000Z' })
        .catch((e: unknown) => e);
      expect(isStaleWriteError(sameId)).toBe(true);

      // Jiné zařízení (jiné id, stejný přirozený klíč), starší čas → také zahozeno.
      const otherDevice: unknown = await repos
        .lessonRecords!.upsert(
          entry(a.userId, { value: 1.2, updatedAt: '2026-10-07T09:30:00.000Z' }),
        )
        .catch((e: unknown) => e);
      expect(isStaleWriteError(otherDevice)).toBe(true);

      const list = await repos.lessonRecords!.list();
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ id: newer.id, value: 1.6 });

      // Novější zápis projde.
      const later = await repos.lessonRecords!.upsert({
        ...newer,
        value: 1.8,
        updatedAt: '2026-10-07T13:00:00.000Z',
      });
      expect(later.value).toBe(1.8);
    });
  });

  describe('poznámky od ponku a inventář (lesson_notes, trigger reject_stale na inventory_items)', () => {
    const note = (userId: string, patch: Partial<LessonNoteRecord> = {}): LessonNoteRecord => ({
      id: crypto.randomUUID(),
      userId,
      projectSlug: 'lid-wallet',
      lessonSlug: '01-measure',
      text: 'krok 3',
      createdAt: '2026-10-07T10:00:00.000Z',
      updatedAt: '2026-10-07T10:00:00.000Z',
      ...patch,
    });

    it('RLS: B nevidí poznámky A, cizí user_id odmítne, anon nemá přístup; limit 4000 znaků', async () => {
      const a = await signedInClient(`rls-i-${run}@example.com`, password);
      const b = await signedInClient(`rls-j-${run}@example.com`, password);
      const reposA = createSupabaseRepositories(a.client, a.userId);
      const reposB = createSupabaseRepositories(b.client, b.userId);

      await reposA.lessonNotes!.upsert(note(a.userId));
      expect(await reposB.lessonNotes!.list()).toEqual([]);
      const forged = await b.client.from('lesson_notes').insert({
        id: crypto.randomUUID(),
        user_id: a.userId,
        project_slug: 'lid-wallet',
        lesson_slug: '02-cut',
        text: 'cizí',
      });
      expect(forged.error).not.toBeNull();
      const anon = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
      expect((await anon.from('lesson_notes').select('*')).error).not.toBeNull();

      const insert = (lessonSlug: string, text: string) =>
        a.client.from('lesson_notes').insert({
          id: crypto.randomUUID(),
          user_id: a.userId,
          project_slug: 'lid-wallet',
          lesson_slug: lessonSlug,
          text,
        });
      // Limit je ve znacích: 4000 znaků s diakritikou projde, 4001 ne.
      expect((await insert('03-a', 'ěščřžýáíé\n'.repeat(400))).error).toBeNull();
      expect((await insert('03-b', 'x'.repeat(4001))).error?.code).toBe('23514');
      expect((await insert('Neplatne_ID', 'x')).error?.code).toBe('23514');
    });

    it('starší poznámka ani starší stav inventáře nepřepíšou novější (stale)', async () => {
      const a = await signedInClient(`rls-k-${run}@example.com`, password);
      const repos = createSupabaseRepositories(a.client, a.userId);
      const newer = note(a.userId, { text: 'novější', updatedAt: '2026-10-07T12:00:00.000Z' });
      await repos.lessonNotes!.upsert(newer);
      const older: unknown = await repos
        .lessonNotes!.upsert(
          note(a.userId, { text: 'starší', updatedAt: '2026-10-07T09:00:00.000Z' }),
        )
        .catch((e: unknown) => e);
      expect(isStaleWriteError(older)).toBe(true);
      expect(await repos.lessonNotes!.list()).toEqual([
        expect.objectContaining({ id: newer.id, text: 'novější' }),
      ]);

      const owned = {
        ...item('mallet', 'owned'),
        id: crypto.randomUUID(),
        updatedAt: '2026-10-07T12:00:00.000Z',
      };
      await repos.inventory.upsert(owned);
      const stale: unknown = await repos.inventory
        .upsert({
          ...item('mallet', 'want_to_buy'),
          id: crypto.randomUUID(),
          updatedAt: '2026-10-07T09:00:00.000Z',
        })
        .catch((e: unknown) => e);
      expect(isStaleWriteError(stale)).toBe(true);
      expect(await repos.inventory.list()).toEqual([
        expect.objectContaining({ id: owned.id, status: 'owned' }),
      ]);
    });
  });
});
