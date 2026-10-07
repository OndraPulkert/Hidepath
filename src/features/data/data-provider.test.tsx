import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import { type DataContextValue, DataProvider, useDataContext } from '@/features/data/data-provider';
import { createMemoryStorage } from '@/features/data/local-collection';
import { createLocalRepositories, STORAGE_KEYS } from '@/features/data/repositories';
import type * as SupabaseRepositoriesModule from '@/features/data/supabase-repositories';
import { type LessonNoteRecord } from '@/features/notes/types';
import { parseOutbox } from '@/features/sync/outbox';
import { userSyncKeys } from '@/features/sync/synced-collection';
import { createFakeSyncServer, type FakeSyncServer } from '@/test/fake-sync-server';
import { item } from '@/test/factories';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ID1 = '11111111-1111-4111-8111-111111111111';

/** Falešný server pro aktuální test; bez něj vrací cloud jen lokální kolekce v paměti. */
const fake = vi.hoisted(() => ({ server: null as FakeSyncServer | null }));

vi.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({
    session: { status: 'authenticated', user: { id: USER, email: null } },
    authAvailable: true,
    signOut: async () => Promise.resolve(),
  }),
}));
vi.mock('@/lib/supabase/client', () => ({ supabase: {} }));
vi.mock('@/features/data/supabase-repositories', async (importOriginal) => ({
  ...(await importOriginal<typeof SupabaseRepositoriesModule>()),
  createSupabaseRepositories: () => {
    const { lessonNotes: _notes, ...rest } = createLocalRepositories(createMemoryStorage());
    return fake.server ? { ...rest, ...fake.server.remoteFor(USER) } : rest;
  },
}));

function Probe() {
  const { mode, persistent } = useDataContext();
  return <p>{`${mode} persistent=${String(persistent)}`}</p>;
}

describe('DataProvider – trvalost dat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('s účtem a bez úložiště prohlížeče hlásí persistent=false (outbox je jen v paměti)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DataProvider>
          <Probe />
        </DataProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('cloud persistent=false')).toBeInTheDocument();
  });

  it('s účtem a funkčním úložištěm hlásí persistent=true', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DataProvider>
          <Probe />
        </DataProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText('cloud persistent=true')).toBeInTheDocument();
  });
});

describe('DataProvider – synchronizace inventáře a poznámek s účtem', () => {
  const captured: { current: DataContextValue | null } = { current: null };
  function Capture() {
    const value = useDataContext();
    useEffect(() => {
      captured.current = value;
    });
    const snapshot = value.sync?.getSnapshot();
    return (
      <p>{`${value.mode} migration=${value.migration.status} pending=${String(snapshot?.pendingCount)}`}</p>
    );
  }
  const context = () => captured.current!;
  const renderProvider = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DataProvider>
          <Capture />
        </DataProvider>
      </QueryClientProvider>,
    );
  const deviceNote: LessonNoteRecord = {
    id: ID1,
    userId: null,
    projectSlug: 'lid-wallet',
    lessonSlug: '01-measure',
    text: 'krok 3 – z doby, kdy poznámky byly jen v zařízení',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    captured.current = null;
  });
  afterEach(() => {
    fake.server = null;
    localStorage.clear();
  });

  it('inventář a poznámky jdou do lokální kopie účtu + outboxu a odejdou na server', async () => {
    const server = createFakeSyncServer();
    fake.server = server;
    renderProvider();
    await screen.findByText(/^cloud /);

    server.network.online = false;
    await context().repositories.inventory.upsert({ ...item('mallet', 'owned'), id: ID1 });
    await context().repositories.lessonNotes.upsert(deviceNote);
    const keys = userSyncKeys(USER);
    expect(localStorage.getItem(keys.inventory)).toContain('mallet');
    expect(localStorage.getItem(keys.lessonNotes)).toContain('krok 3');
    expect(
      parseOutbox(localStorage.getItem(keys.outbox))
        .map((m) => m.entity)
        .sort(),
    ).toEqual(['inventory_items', 'lesson_notes']);
    expect(localStorage.getItem(STORAGE_KEYS.lessonNotes)).toBeNull();

    // Síť neodpověděla → změny čekají jako selhané s backoffem; „Zkusit znovu“ je odešle.
    await waitFor(() =>
      expect(context().sync!.getSnapshot()).toEqual({ pendingCount: 2, failedCount: 2 }),
    );
    server.network.online = true;
    await context().sync!.flush({ force: true });
    expect(context().sync!.getSnapshot()).toEqual({ pendingCount: 0, failedCount: 0 });
    expect(server.inventory.rows()).toEqual([expect.objectContaining({ equipmentSlug: 'mallet' })]);
    expect(server.lessonNotes.rows()).toEqual([expect.objectContaining({ text: deviceNote.text })]);
  });

  it('už přenesený účet: poznámky z doby „jen v zařízení“ se přenesou při první synchronizaci', async () => {
    const server = createFakeSyncServer();
    fake.server = server;
    localStorage.setItem(`${STORAGE_KEYS.migrated}.${USER}`, '1');
    localStorage.setItem(STORAGE_KEYS.lessonNotes, JSON.stringify([deviceNote]));
    // Ostatní data prohlížeče (pořízená po odhlášení) se do účtu znovu nepřenášejí.
    localStorage.setItem(
      STORAGE_KEYS.inventory,
      JSON.stringify([{ ...item('mallet', 'owned'), id: ID1 }]),
    );

    renderProvider();
    await waitFor(() =>
      expect(server.lessonNotes.rows()).toEqual([
        expect.objectContaining({ text: deviceNote.text, userId: USER }),
      ]),
    );
    await screen.findByText(/migration=done/);
    expect(localStorage.getItem(STORAGE_KEYS.lessonNotes)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.inventory)).toContain('mallet');
    expect(server.inventory.rows()).toEqual([]);
  });

  it('jednorázový přenos poznámek: poznámky psané bez účtu po odhlášení se při dalším přihlášení nepřenesou', async () => {
    const server = createFakeSyncServer();
    fake.server = server;
    localStorage.setItem(`${STORAGE_KEYS.migrated}.${USER}`, '1');
    localStorage.setItem(`${STORAGE_KEYS.migrated}.notes.${USER}`, '1');
    // Např. jiný člověk na sdíleném zařízení psal bez účtu – do tohoto účtu nepatří.
    localStorage.setItem(STORAGE_KEYS.lessonNotes, JSON.stringify([deviceNote]));

    renderProvider();
    await screen.findByText(/migration=idle/);
    await waitFor(() => expect(server.lessonNotes.state.requests).toBeGreaterThan(0));
    expect(server.lessonNotes.rows()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEYS.lessonNotes)).toContain(deviceNote.text);
  });

  it('server tabulku lesson_notes nemá: poznámky zůstanou v zařízení, bez chyby a bez čekání', async () => {
    const server = createFakeSyncServer({ lessonNotes: { missing: true } });
    fake.server = server;
    localStorage.setItem(`${STORAGE_KEYS.migrated}.${USER}`, '1');
    localStorage.setItem(STORAGE_KEYS.lessonNotes, JSON.stringify([deviceNote]));

    renderProvider();
    await screen.findByText(/migration=done/);
    await waitFor(() => expect(server.lessonNotes.state.requests).toBeGreaterThan(0));
    await screen.findByText(/pending=0/);
    expect(await context().repositories.lessonNotes.list()).toEqual([
      expect.objectContaining({ text: deviceNote.text }),
    ]);
    expect(parseOutbox(localStorage.getItem(userSyncKeys(USER).outbox))).toEqual([
      expect.objectContaining({ entity: 'lesson_notes', status: 'deferred' }),
    ]);
    expect(server.lessonNotes.rows()).toEqual([]);
  });
});
