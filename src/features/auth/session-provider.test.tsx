import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SessionProvider, useSession } from '@/features/auth/session-provider';
import { userSyncKeys } from '@/features/sync/synced-collection';
import { TIMERS_STORAGE_KEY, timerStore } from '@/features/timers/timer-store';

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const auth = vi.hoisted(() => ({
  signOut: vi.fn(async () => Promise.resolve({ error: null as Error | null })),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signOut: auth.signOut,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));

function SignOutButton() {
  const { signOut } = useSession();
  return (
    <button type="button" onClick={() => void signOut()}>
      Odhlásit
    </button>
  );
}

function seed(userId: string) {
  for (const key of Object.values(userSyncKeys(userId))) localStorage.setItem(key, '[]');
}

describe('SessionProvider – odhlášení', () => {
  beforeEach(() => {
    localStorage.clear();
    auth.signOut.mockClear();
    auth.signOut.mockResolvedValue({ error: null });
  });

  it('smaže z prohlížeče zápisník, přípravu, outbox a časovače odhlášeného uživatele', async () => {
    seed(USER);
    seed(OTHER);
    timerStore.update(() => [
      {
        id: 't1',
        projectSlug: 'card-holder',
        lessonSlug: '04-saddle-stitch',
        stepId: 'glue',
        waitId: 'glue-open',
        label: 'Odvětrání lepidla',
        startedAt: Date.now(),
        endsAt: Date.now() + 600_000,
        durationMin: 10,
        firedAt: null,
        dismissedAt: null,
      },
    ]);
    render(
      <SessionProvider
        initialSession={{ status: 'authenticated', user: { id: USER, email: null } }}
      >
        <SignOutButton />
      </SessionProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Odhlásit' }));

    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    for (const key of Object.values(userSyncKeys(USER)))
      expect(localStorage.getItem(key)).toBeNull();
    for (const key of Object.values(userSyncKeys(OTHER)))
      expect(localStorage.getItem(key)).toBe('[]');
    expect(localStorage.getItem(TIMERS_STORAGE_KEY)).toBeNull();
    expect(timerStore.getSnapshot()).toEqual([]);
  });

  it('když odhlášení selže, data nechá', async () => {
    seed(USER);
    auth.signOut.mockResolvedValue({ error: new Error('offline') });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <SessionProvider
        initialSession={{ status: 'authenticated', user: { id: USER, email: null } }}
      >
        <SignOutButton />
      </SessionProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'Odhlásit' }).click();
      await Promise.resolve();
    });
    expect(localStorage.getItem(userSyncKeys(USER).outbox)).toBe('[]');
  });
});
