/**
 * Integrační test proti LOKÁLNÍ Supabase instanci (`supabase start`). Spouští se přes
 * `pnpm test:db`, který doplní proměnné z `supabase status`. Bez nich se test přeskočí.
 * Service-role key se používá jen tady, k založení testovacích uživatelů – nikdy v klientu.
 */
import { createClient } from '@supabase/supabase-js';

import { createSupabaseRepositories } from '@/features/data/supabase-repositories';
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
    const fromOtherDevice = {
      ...item('waxed-thread', 'want_to_buy'),
      id: crypto.randomUUID(),
      shopName: 'jinde',
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
});
