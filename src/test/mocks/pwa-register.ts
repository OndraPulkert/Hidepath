/**
 * Náhrada virtuálního modulu `virtual:pwa-register/react` pro Vitest.
 * Service worker se v testech neregistruje; hook vrací klidový stav.
 */
import { vi } from 'vitest';

export function useRegisterSW() {
  return {
    needRefresh: [false, vi.fn()] as const,
    offlineReady: [false, vi.fn()] as const,
    updateServiceWorker: vi.fn(() => Promise.resolve()),
  };
}
