import { act, fireEvent, renderHook, waitFor } from '@testing-library/react';

import { appBeeper } from '@/features/timers/notify';
import { timerStore } from '@/features/timers/timer-store';
import { startTimer } from '@/features/timers/timers';
import { useTimerActions, useTimerDriver } from '@/features/timers/use-timers';

const input = {
  projectSlug: 'card-holder',
  lessonSlug: '04-saddle-stitch',
  stepId: 'glue',
  waitId: 'glue-open',
  label: 'Odvětrání lepidla',
  durationMin: 10,
};

describe('useTimerDriver – odemčení zvuku po reloadu', () => {
  afterEach(() => {
    timerStore.update(() => []);
    vi.restoreAllMocks();
  });

  it('když běží časovač, první klepnutí kamkoli na stránku odemkne zvuk (jednou)', () => {
    const unlock = vi.spyOn(appBeeper, 'unlock').mockImplementation(() => undefined);
    // Časovač přežil reload (localStorage), AudioContext ne – „Spustit“ se znovu neklepne.
    timerStore.update((t) => startTimer(t, input, Date.now(), 'a'));
    renderHook(() => useTimerDriver());

    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(unlock).toHaveBeenCalledTimes(1);
  });

  it('bez běžícího časovače klepnutí zvuk neodemyká', () => {
    const unlock = vi.spyOn(appBeeper, 'unlock').mockImplementation(() => undefined);
    renderHook(() => useTimerDriver());
    fireEvent.pointerDown(document.body);
    expect(unlock).not.toHaveBeenCalled();
  });
});

describe('useTimerActions – systémová notifikace', () => {
  afterEach(() => {
    timerStore.update(() => []);
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('„Rozumím“ v aplikaci zavře už zobrazenou notifikaci časovače', async () => {
    const close = vi.fn();
    const getNotifications = vi.fn(async () => Promise.resolve([{ close }]));
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration: async () => Promise.resolve({ getNotifications }) },
    });
    timerStore.update((t) => startTimer(t, input, Date.now() - 20 * 60_000, 'a'));
    const { result } = renderHook(() => useTimerActions());
    act(() => result.current.dismiss('a'));
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(getNotifications).toHaveBeenCalledWith({ tag: 'hidepath-timer-a' });
  });
});
