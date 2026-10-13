import { describe, expect, it, vi } from 'vitest';

import { applyUpdate } from './apply-update';

function fakeWorker() {
  const listeners: (() => void)[] = [];
  const sw = {
    state: 'installed',
    addEventListener: (_: string, fn: () => void) => listeners.push(fn),
  };
  const activate = (state = 'activated') => {
    sw.state = state;
    listeners.forEach((fn) => fn());
  };
  return { sw: sw as unknown as ServiceWorker, activate };
}

describe('aktualizace aplikace', () => {
  it('pošle SKIP_WAITING, počká na aktivaci a obnoví stránku i bez controllerchange', async () => {
    const { sw, activate } = fakeWorker();
    const reload = vi.fn();
    const skipWaiting = vi.fn(() => {
      setTimeout(() => activate(), 10);
      return Promise.resolve();
    });
    await applyUpdate({ getWaiting: () => Promise.resolve(sw), skipWaiting, reload });
    expect(skipWaiting).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('neobnoví dřív, než se nová verze aktivuje', async () => {
    const { sw, activate } = fakeWorker();
    const reload = vi.fn();
    const pending = applyUpdate({
      getWaiting: () => Promise.resolve(sw),
      skipWaiting: () => Promise.resolve(),
      reload,
      timeoutMs: 10_000,
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(reload).not.toHaveBeenCalled();
    activate();
    await pending;
    expect(reload).toHaveBeenCalledOnce();
  });

  it('když se worker neaktivuje, obnoví po časovém limitu', async () => {
    const { sw } = fakeWorker();
    const reload = vi.fn();
    await applyUpdate({
      getWaiting: () => Promise.resolve(sw),
      skipWaiting: () => Promise.resolve(),
      reload,
      timeoutMs: 20,
    });
    expect(reload).toHaveBeenCalledOnce();
  });

  it('bez čekajícího workeru stránku rovnou obnoví', async () => {
    const reload = vi.fn();
    const skipWaiting = vi.fn(() => Promise.resolve());
    await applyUpdate({ getWaiting: () => Promise.resolve(null), skipWaiting, reload });
    expect(skipWaiting).not.toHaveBeenCalled();
    expect(reload).toHaveBeenCalledOnce();
  });
});
