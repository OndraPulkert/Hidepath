import { describeSyncStatus, type SyncStatusInput } from '@/features/sync/sync-status';

const base: SyncStatusInput = {
  online: true,
  pendingCount: 0,
  hasFailed: false,
  updateAvailable: false,
  storagePersistent: true,
  migration: 'idle',
};

describe('describeSyncStatus', () => {
  it('online bez čekajících změn hlásí vše synchronizováno', () => {
    expect(describeSyncStatus(base)).toMatchObject({
      tone: 'ok',
      label: 'Vše synchronizováno',
      action: 'none',
    });
  });

  it('offline má přednost před čekajícími změnami i před chybou zápisu', () => {
    expect(describeSyncStatus({ ...base, online: false, pendingCount: 3 }).label).toBe('Offline');
    const failedOffline = describeSyncStatus({ ...base, online: false, hasFailed: true });
    expect(failedOffline.tone).toBe('offline');
    expect(failedOffline.hint).toMatch(/bez připojení/);
  });

  it('skloňuje počet čekajících změn', () => {
    expect(describeSyncStatus({ ...base, pendingCount: 1 }).label).toBe(
      '1 změna čeká na synchronizaci',
    );
    expect(describeSyncStatus({ ...base, pendingCount: 3 }).label).toBe(
      '3 změny čekají na synchronizaci',
    );
    expect(describeSyncStatus({ ...base, pendingCount: 7 }).label).toBe(
      '7 změn čeká na synchronizaci',
    );
  });

  it('chyba zápisu online nabízí opakování', () => {
    expect(describeSyncStatus({ ...base, hasFailed: true })).toMatchObject({
      tone: 'error',
      action: 'retry',
    });
  });

  it('přenos dat do účtu je viditelný včetně selhání s opakováním', () => {
    expect(describeSyncStatus({ ...base, migration: 'running' })).toMatchObject({
      tone: 'pending',
    });
    expect(describeSyncStatus({ ...base, migration: 'failed' })).toMatchObject({
      tone: 'error',
      action: 'retry-migration',
    });
  });

  it('paměťové úložiště varuje, že data zmizí', () => {
    expect(describeSyncStatus({ ...base, storagePersistent: false })).toMatchObject({
      tone: 'volatile',
    });
  });

  it('nová verze aplikace má nejvyšší prioritu', () => {
    expect(
      describeSyncStatus({
        ...base,
        updateAvailable: true,
        hasFailed: true,
        online: false,
        storagePersistent: false,
      }),
    ).toMatchObject({ tone: 'update', action: 'update' });
  });
});
