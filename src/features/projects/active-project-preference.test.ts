import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  readActiveProjectPreference,
  setActiveProjectPreference,
} from './active-project-preference';

describe('volba aktivního projektu v zařízení', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setActiveProjectPreference(null);
  });

  it('uloží se do localStorage a přečte zpět', () => {
    setActiveProjectPreference('druhy-projekt');
    expect(readActiveProjectPreference()).toBe('druhy-projekt');
    expect(window.localStorage.getItem('hidepath.v1.activeProject')).toBe('druhy-projekt');
  });

  it('když zápis selže (plná kvóta), platí nová hodnota z paměti, ne stará z úložiště', () => {
    setActiveProjectPreference('prvni-projekt');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    setActiveProjectPreference('druhy-projekt');
    expect(readActiveProjectPreference()).toBe('druhy-projekt');
  });
});
