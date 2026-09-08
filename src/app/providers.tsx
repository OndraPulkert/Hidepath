import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { type Session } from '@/features/auth/session';
import { SessionProvider } from '@/features/auth/session-provider';
import { DataProvider } from '@/features/data/data-provider';
import { type Repositories } from '@/features/data/repositories';
import { AppUpdateProvider } from '@/lib/pwa/app-update-context';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function AppProviders({
  children,
  repositories,
  initialSession,
}: {
  children: ReactNode;
  repositories?: Repositories;
  /** Pro testy: pevná relace místo Supabase Auth. */
  initialSession?: Session | undefined;
}) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initialSession={initialSession}>
        <DataProvider repositories={repositories}>
          <AppUpdateProvider>{children}</AppUpdateProvider>
        </DataProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
