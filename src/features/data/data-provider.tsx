import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSession } from '@/features/auth/session-provider';
import { resolveBrowserStorage, type StorageLike } from '@/features/data/local-collection';
import {
  hasLocalData,
  migrateLocalData,
  type MigrationSummary,
} from '@/features/data/migrate-local-data';
import { LOCAL_SCOPE } from '@/features/data/query-keys';
import {
  createLocalRepositories,
  type Repositories,
  STORAGE_KEYS,
} from '@/features/data/repositories';
import { createSupabaseRepositories } from '@/features/data/supabase-repositories';
import { type SyncEntity } from '@/features/sync/outbox';
import { createUserSync, type SyncController } from '@/features/sync/synced-collection';
import { useSyncDriver } from '@/features/sync/use-sync-driver';
import { supabase } from '@/lib/supabase/client';

export type DataMode = 'local' | 'cloud';

export type MigrationState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; summary: MigrationSummary }
  | { status: 'failed'; message: string };

export interface DataContextValue {
  repositories: Repositories;
  /** Rozsah dat pro klíče dotazů: `local` bez účtu, jinak id uživatele. */
  scope: string;
  /** `false` = data jsou jen v paměti (úložiště prohlížeče není dostupné). */
  persistent: boolean;
  /** local = bez účtu v tomto prohlížeči; cloud = účet Supabase. */
  mode: DataMode;
  /** Přenos lokálně pořízených dat do účtu po přihlášení. */
  migration: MigrationState;
  retryMigration: () => void;
  /**
   * Synchronizace zápisníku a přípravy (outbox) v cloud režimu; bez účtu `null`.
   * Volitelné kvůli zpětné kompatibilitě testovacích kontextů.
   */
  sync?: SyncController | null;
}

/** Segment klíče dotazu (`query-keys.ts`) pro synchronizovanou entitu. */
const queryKeySegment: Record<SyncEntity, string> = {
  lesson_records: 'lesson-records',
  lesson_prep_checks: 'prep-checks',
};

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Vybere zdroj dat podle relace: přihlášený uživatel se Supabase → cloud, jinak lokální
 * úložiště. Klíče dotazů jsou prefixované rozsahem (`scope`), takže se data dvou uživatelů
 * v cache nikdy nepotkají; při přepnutí se dotazy starého rozsahu odstraní.
 * Po prvním přihlášení se lokálně pořízená data jednorázově přenesou do účtu; výsledek
 * i případná chyba jsou viditelné ve stavovém pruhu.
 */
export function DataProvider({
  children,
  repositories,
}: {
  children: ReactNode;
  repositories?: Repositories | undefined;
}) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const userId = session.status === 'authenticated' ? session.user?.id : undefined;

  const local = useMemo(() => {
    if (repositories)
      return { repositories, persistent: true, storage: null as StorageLike | null };
    const resolved = resolveBrowserStorage();
    return {
      repositories: createLocalRepositories(resolved.storage),
      persistent: resolved.persistent,
      storage: resolved.storage,
    };
  }, [repositories]);

  const cloud = useMemo(() => {
    if (!userId || !supabase) return null;
    const remote = createSupabaseRepositories(supabase, userId);
    if (!remote.lessonRecords || !remote.prepChecks) return { repositories: remote, sync: null };
    // Zápisník a příprava: lokálně nejdřív (per-user klíče) + outbox, server dostává změny
    // na pozadí. Ostatní kolekce zůstávají přímo na serveru.
    const userSync = createUserSync({
      storage: local.storage ?? resolveBrowserStorage().storage,
      userId,
      remote: { lessonRecords: remote.lessonRecords, prepChecks: remote.prepChecks },
      onRemoteChange: (entity) => {
        void queryClient.invalidateQueries({
          queryKey: entity ? [userId, queryKeySegment[entity]] : [userId],
        });
      },
    });
    return {
      repositories: {
        ...remote,
        lessonRecords: userSync.lessonRecords,
        prepChecks: userSync.prepChecks,
      },
      sync: userSync.controller,
    };
  }, [userId, local, queryClient]);
  useSyncDriver(cloud?.sync ?? null);
  const scope = cloud && userId ? userId : LOCAL_SCOPE;

  const previousScope = useRef(scope);
  useEffect(() => {
    if (previousScope.current !== scope) {
      queryClient.removeQueries({ queryKey: [previousScope.current] });
      previousScope.current = scope;
    }
  }, [queryClient, scope]);

  const [migration, setMigration] = useState<MigrationState>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const retryMigration = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!cloud || !userId) return;
    const remote = cloud.repositories;
    const flagKey = `${STORAGE_KEYS.migrated}.${userId}`;
    const controller = new AbortController();

    const run = async () => {
      if (local.storage?.getItem(flagKey) === '1' && attempt === 0) return;
      if (!(await hasLocalData(local.repositories, remote))) {
        local.storage?.setItem(flagKey, '1');
        return;
      }
      setMigration({ status: 'running' });
      let lastError: unknown;
      for (let i = 0; i < 3; i += 1) {
        if (controller.signal.aborted) return;
        try {
          const summary = await migrateLocalData(local.repositories, remote, controller.signal);
          if (controller.signal.aborted) return;
          local.storage?.setItem(flagKey, '1');
          setMigration({ status: 'done', summary });
          if (summary.uploaded > 0) void queryClient.invalidateQueries({ queryKey: [userId] });
          return;
        } catch (error) {
          lastError = error;
          await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        }
      }
      if (controller.signal.aborted) return;
      console.error('[data] Přenos lokálních dat do účtu selhal', lastError);
      setMigration({
        status: 'failed',
        message:
          'Přenos postupu z tohoto prohlížeče do účtu se nezdařil. Data zůstávají uložená v prohlížeči.',
      });
    };

    void run();
    return () => controller.abort();
  }, [cloud, userId, local, queryClient, attempt]);

  const value = useMemo<DataContextValue>(
    () => ({
      // Poznámky od ponku zůstávají v zařízení i s účtem: cloud pro ně tabulku nemá.
      // Zápisník a příprava jdou přes synchronizovanou kolekci (lokální kopie per uživatel
      // + outbox). Ostatní kolekce jdou přímo do účtu.
      repositories: cloud
        ? {
            ...cloud.repositories,
            lessonNotes: local.repositories.lessonNotes,
            lessonRecords: cloud.repositories.lessonRecords ?? local.repositories.lessonRecords,
            prepChecks: cloud.repositories.prepChecks ?? local.repositories.prepChecks,
          }
        : local.repositories,
      scope,
      // I s účtem: poznámky, zápisník, příprava a neodeslané změny (outbox) leží v úložišti
      // prohlížeče – když je jen v paměti, po zavření záložky zmizí.
      persistent: local.persistent,
      mode: cloud ? 'cloud' : 'local',
      migration,
      retryMigration,
      sync: cloud?.sync ?? null,
    }),
    [cloud, local, migration, retryMigration, scope],
  );

  return <DataContext value={value}>{children}</DataContext>;
}

export function useRepositories(): Repositories {
  return useDataContext().repositories;
}

export function useDataContext(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useDataContext musí být uvnitř DataProvider.');
  return value;
}
