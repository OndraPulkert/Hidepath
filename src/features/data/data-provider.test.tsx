import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { DataProvider, useDataContext } from '@/features/data/data-provider';
import { createMemoryStorage } from '@/features/data/local-collection';
import { createLocalRepositories } from '@/features/data/repositories';
import type * as SupabaseRepositoriesModule from '@/features/data/supabase-repositories';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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
    return rest;
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
