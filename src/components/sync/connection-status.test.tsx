import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectionStatus } from '@/components/sync/connection-status';
import { type DataContextValue } from '@/features/data/data-provider';
import { type SyncController, type SyncSnapshot } from '@/features/sync/synced-collection';
import { setOnline } from '@/test/render';

const context: { value: Partial<DataContextValue> } = { value: {} };

vi.mock('@/features/data/data-provider', () => ({
  useDataContext: () => context.value,
}));

function fakeSync(initial: SyncSnapshot) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  const controller: SyncController = {
    flush: vi.fn(async () => Promise.resolve()),
    sync: vi.fn(async () => Promise.resolve()),
    getSnapshot: () => snapshot,
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    retryDelay: () => null,
    handleStorageEvent: vi.fn(),
  };
  const set = (next: SyncSnapshot) => {
    snapshot = next;
    for (const l of listeners) l();
  };
  return { controller, set };
}

function renderStatus(sync: SyncController | null | undefined) {
  context.value = {
    persistent: true,
    migration: { status: 'idle' },
    retryMigration: vi.fn(),
    ...(sync === undefined ? {} : { sync }),
  };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ConnectionStatus />
    </QueryClientProvider>,
  );
}

describe('ConnectionStatus – outbox', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('bez účtu (sync chybí) hlásí vše synchronizováno', () => {
    renderStatus(undefined);
    expect(screen.getByRole('status')).toHaveTextContent('Vše synchronizováno');
  });

  it('ukazuje skutečný počet čekajících změn a reaguje na jeho změnu', () => {
    const { controller, set } = fakeSync({ pendingCount: 2, failedCount: 0 });
    renderStatus(controller);
    expect(screen.getByRole('status')).toHaveTextContent('2 změny čekají na synchronizaci');

    act(() => set({ pendingCount: 0, failedCount: 0 }));
    expect(screen.getByRole('status')).toHaveTextContent('Vše synchronizováno');
  });

  it('offline s čekajícími změnami řekne, že odejdou po připojení', () => {
    setOnline(false);
    const { controller } = fakeSync({ pendingCount: 1, failedCount: 0 });
    renderStatus(controller);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Offline');
    expect(status).toHaveTextContent('1 změna čeká na odeslání po připojení.');
  });

  it('selhaná synchronizace nabídne „Zkusit znovu“, které vynutí odeslání', async () => {
    const user = userEvent.setup();
    const { controller } = fakeSync({ pendingCount: 1, failedCount: 1 });
    renderStatus(controller);
    expect(screen.getByRole('status')).toHaveTextContent('Synchronizace se nezdařila');
    await user.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
    expect(controller.flush).toHaveBeenCalledWith({ force: true });
  });
});
