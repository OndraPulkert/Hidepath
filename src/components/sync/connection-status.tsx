import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { useDataContext } from '@/features/data/data-provider';
import { describeSyncStatus, type SyncTone } from '@/features/sync/sync-status';
import { type SyncController, type SyncSnapshot } from '@/features/sync/synced-collection';
import { useAppUpdateState } from '@/lib/pwa/app-update-context';
import { useOnlineStatus } from '@/lib/pwa/use-online-status';
import { cn } from '@/lib/utils/cn';

const toneClasses: Record<SyncTone, string> = {
  ok: '',
  offline: 'bg-parchment text-leather',
  pending: 'bg-brass-tint text-leather',
  error: 'bg-cognac-tint text-cognac-deep',
  volatile: 'bg-cognac-tint text-cognac-deep',
  update: 'bg-forest-tint text-leather',
};

const EMPTY_SNAPSHOT: SyncSnapshot = { pendingCount: 0, failedCount: 0 };
const noopUnsubscribe = () => undefined;

/** Počet čekajících a selhaných změn v outboxu (bez účtu vždy 0). */
function useOutboxSnapshot(sync: SyncController | null): SyncSnapshot {
  const subscribe = useCallback(
    (listener: () => void) => (sync ? sync.subscribe(listener) : noopUnsubscribe),
    [sync],
  );
  const getSnapshot = useCallback(() => (sync ? sync.getSnapshot() : EMPTY_SNAPSHOT), [sync]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Viditelný stav připojení, zápisu, přenosu dat a aktualizace aplikace. Stav „Vše
 * synchronizováno“ je jen pro čtečky. Chyba zápisu platí, dokud po ní žádný zápis neuspěje.
 */
export function ConnectionStatus() {
  const online = useOnlineStatus();
  const update = useAppUpdateState();
  const queryClient = useQueryClient();
  const { persistent, migration, retryMigration, mode, sync = null } = useDataContext();
  const outbox = useOutboxSnapshot(sync);
  const mutations = useMutationState({
    select: (m) => ({ status: m.state.status, at: m.state.submittedAt }),
  });
  const lastError = Math.max(0, ...mutations.filter((m) => m.status === 'error').map((m) => m.at));
  const lastSuccess = Math.max(
    0,
    ...mutations.filter((m) => m.status === 'success').map((m) => m.at),
  );

  const view = describeSyncStatus({
    online,
    pendingCount: outbox.pendingCount,
    hasFailed: lastError > 0 && lastError > lastSuccess,
    syncFailed: outbox.failedCount > 0,
    updateAvailable: update.updateAvailable,
    storagePersistent: persistent,
    migration: migration.status,
    mode,
  });

  const retryFailedMutations = () => {
    if (sync) void sync.flush({ force: true });
    for (const mutation of queryClient.getMutationCache().getAll()) {
      if (mutation.state.status === 'error') {
        void mutation.execute(mutation.state.variables).catch(() => {
          /* výsledek se projeví ve stavu mutace */
        });
      }
    }
  };

  if (view.tone === 'ok') {
    return (
      <p className="sr-only" role="status">
        {view.label}
      </p>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-line px-page py-2 text-meta font-medium print:hidden',
        toneClasses[view.tone],
      )}
    >
      <span>{view.label}</span>
      {view.hint ? <span className="font-normal text-ink-2">{view.hint}</span> : null}
      {view.action === 'update' ? (
        <Button
          variant="ghost"
          size="nav"
          className="min-h-11 text-cognac-deep"
          onClick={() => void update.applyUpdate()}
        >
          Aktualizovat
        </Button>
      ) : null}
      {view.action === 'retry' ? (
        <Button
          variant="ghost"
          size="nav"
          className="min-h-11 text-cognac-deep"
          onClick={retryFailedMutations}
        >
          Zkusit znovu
        </Button>
      ) : null}
      {view.action === 'retry-migration' ? (
        <Button
          variant="ghost"
          size="nav"
          className="min-h-11 text-cognac-deep"
          onClick={retryMigration}
        >
          Zkusit přenos znovu
        </Button>
      ) : null}
    </div>
  );
}
