import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import { TopNav } from '@/components/layout/top-nav';
import { type SyncController } from '@/features/sync/synced-collection';

const signOut = vi.fn(async () => Promise.resolve());
const state: { pendingCount: number; unsentCount?: number } = { pendingCount: 0 };
const sync: SyncController = {
  flush: vi.fn(async () => Promise.resolve()),
  sync: vi.fn(async () => Promise.resolve()),
  getSnapshot: () => ({ pendingCount: state.pendingCount, failedCount: 0 }),
  subscribe: () => () => undefined,
  retryDelay: () => null,
  unsentCount: () => state.unsentCount ?? state.pendingCount,
  handleStorageEvent: vi.fn(),
};

vi.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({
    session: { status: 'authenticated', user: { id: 'u1', email: 'a@b.cz' } },
    authAvailable: true,
    signOut,
  }),
}));
vi.mock('@/features/data/data-provider', () => ({ useDataContext: () => ({ sync }) }));
vi.mock('@/features/projects/use-active-project', () => ({
  useActiveProject: () => ({ slug: 'card-holder' }),
}));

function renderNav() {
  render(
    <MemoryRouter>
      <TopNav />
    </MemoryRouter>,
  );
}

describe('TopNav – odhlášení', () => {
  beforeEach(() => {
    delete state.unsentCount;
    signOut.mockClear();
    vi.mocked(sync.flush).mockClear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('před odhlášením odešle čekající změny; když nic nečeká, odhlásí bez ptaní', async () => {
    state.pendingCount = 0;
    const confirm = vi.spyOn(window, 'confirm');
    renderNav();
    await userEvent.click(screen.getByRole('button', { name: /Odhlásit/ }));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(sync.flush).toHaveBeenCalledWith({ force: true });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('odložené poznámky (server nemá tabulku) se taky počítají: bez nich by se tiše smazaly', async () => {
    state.pendingCount = 0;
    state.unsentCount = 1;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderNav();
    await userEvent.click(screen.getByRole('button', { name: /Odhlásit/ }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(confirm.mock.calls[0]?.[0]).toBe(
      '1 změna ještě není odeslaná do účtu. Po odhlášení se z tohoto zařízení smažou. Přesto odhlásit?',
    );
    expect(signOut).not.toHaveBeenCalled();
  });

  it('neodeslané změny: zeptá se a při zrušení neodhlásí', async () => {
    state.pendingCount = 2;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderNav();
    await userEvent.click(screen.getByRole('button', { name: /Odhlásit/ }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(confirm.mock.calls[0]?.[0]).toMatch(/2 změny/);
    expect(signOut).not.toHaveBeenCalled();
  });
});
