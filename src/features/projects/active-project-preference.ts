import { useSyncExternalStore } from 'react';

/**
 * Volba aktivního projektu je vlastnost zařízení (jako poznámky od ponku), ne účtu: přepínač
 * na přehledu jen říká, na čem teď pracuji tady. Úložiště může chybět nebo vyhodit výjimku
 * (anonymní okno, plná kvóta) – pak platí hodnota v paměti, i když čtení z úložiště funguje.
 */
const STORAGE_KEY = 'hidepath.v1.activeProject';

let memoryValue: string | null = null;
/** Poslední zápis do úložiště selhal → úložiště je zastaralé, platí paměť. */
let preferMemory = false;
const listeners = new Set<() => void>();

function read(): string | null {
  if (preferMemory) return memoryValue;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryValue;
  }
}

export function setActiveProjectPreference(slug: string | null): void {
  memoryValue = slug;
  try {
    if (slug === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, slug);
    preferMemory = false;
  } catch {
    preferMemory = true;
  }
  listeners.forEach((l) => l());
}

export function readActiveProjectPreference(): string | null {
  return read();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useActiveProjectPreference(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
