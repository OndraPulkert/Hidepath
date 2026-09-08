/**
 * Čistý popis stavu synchronizace pro stavový pruh. Počet čekajících změn dodá v Milníku 4
 * outbox v IndexedDB; chyby zápisu, přenos lokálních dat, online/offline a aktualizace
 * aplikace fungují už teď.
 */
export interface SyncStatusInput {
  online: boolean;
  pendingCount: number;
  /** Poslední zápis selhal a od té doby žádný neuspěl. */
  hasFailed: boolean;
  updateAvailable: boolean;
  /** `false` = data jsou jen v paměti prohlížeče a po zavření záložky zmizí. */
  storagePersistent: boolean;
  /** Přenos lokálně pořízených dat do účtu po přihlášení. */
  migration: 'idle' | 'running' | 'failed' | 'done';
}

export type SyncTone = 'ok' | 'offline' | 'pending' | 'error' | 'update' | 'volatile';

export interface SyncStatusView {
  tone: SyncTone;
  label: string;
  /** Doplňující věta pro uživatele. */
  hint: string | null;
  /** Zda má pruh nabídnout akci. */
  action: 'none' | 'retry' | 'update' | 'retry-migration';
}

const pendingForms = ['změna čeká', 'změny čekají', 'změn čeká'] as const;

export function describeSyncStatus(input: SyncStatusInput): SyncStatusView {
  if (input.updateAvailable) {
    return {
      tone: 'update',
      label: 'Nová verze aplikace je k dispozici',
      hint: null,
      action: 'update',
    };
  }
  if (!input.storagePersistent) {
    return {
      tone: 'volatile',
      label: 'Data se v tomto prohlížeči neukládají',
      hint: 'Úložiště není dostupné (např. privátní režim). Postup po zavření záložky zmizí.',
      action: 'none',
    };
  }
  if (!input.online) {
    return {
      tone: 'offline',
      label: 'Offline',
      hint: input.hasFailed
        ? 'Poslední změna se bez připojení neuložila. Po připojení ji zopakujte.'
        : 'Stažený obsah je dostupný, změny se uloží po připojení.',
      action: 'none',
    };
  }
  if (input.migration === 'running') {
    return { tone: 'pending', label: 'Přenášíme váš postup do účtu…', hint: null, action: 'none' };
  }
  if (input.migration === 'failed') {
    return {
      tone: 'error',
      label: 'Přenos postupu do účtu se nezdařil',
      hint: 'Data zůstávají uložená v tomto prohlížeči.',
      action: 'retry-migration',
    };
  }
  if (input.hasFailed) {
    return {
      tone: 'error',
      label: 'Uložení změny se nezdařilo',
      hint: 'Zkuste to znovu. Pokud se to opakuje, může být plné úložiště prohlížeče nebo výpadek služby.',
      action: 'retry',
    };
  }
  if (input.pendingCount > 0) {
    return {
      tone: 'pending',
      label: `${pluralPending(input.pendingCount)} na synchronizaci`,
      hint: null,
      action: 'none',
    };
  }
  return { tone: 'ok', label: 'Vše synchronizováno', hint: null, action: 'none' };
}

function pluralPending(count: number): string {
  const form = count === 1 ? pendingForms[0] : count <= 4 ? pendingForms[1] : pendingForms[2];
  return `${count} ${form}`;
}
