import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type * as ProjectsModule from '@/content/projects';
import { appBeeper } from '@/features/timers/notify';
import { TIMERS_STORAGE_KEY } from '@/features/timers/timer-store';
import { renderApp } from '@/test/render';

/**
 * Obsah zatím čekání nemá (doplní ho obsahové balíky), proto test přidá dvě čekání do
 * kroku „glue“ lekce 4 pouzdra na karty. Druhé blokuje krok „hold-work“ (krok 3).
 */
vi.mock('@/content/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof ProjectsModule>();
  const { addTestWaits } = await import('@/test/timer-fixtures');
  const projects = actual.projects.map(addTestWaits);
  return {
    ...actual,
    projects,
    startingProject: projects.find((p) => p.slug === actual.startingProject.slug)!,
    findProject: (slug: string) => projects.find((p) => p.slug === slug),
  };
});

const LESSON = '/projects/card-holder/lessons/04-saddle-stitch';
const focusUrl = (step?: number) => `${LESSON}/focus${step === undefined ? '' : `?krok=${step}`}`;
const MIN = 60_000;

function setup(url: string) {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  const result = renderApp(url);
  return { user, ...result };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date(2026, 9, 7, 10, 0, 0) });
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LessonFocusPage', () => {
  it('bez ?krok začne „Než začnete“ s přípravou, Další a šipky přepínají kroky', async () => {
    const { user, router } = setup(focusUrl());
    expect(await screen.findByRole('heading', { level: 2, name: 'Než začnete' })).toBeVisible();
    expect(screen.getByText('Než začnete', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zpět/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /začít/i }));
    expect(router.state.location.search).toBe('?krok=1');
    const heading = await screen.findByRole('heading', {
      level: 2,
      name: /^krok 1:\s*slepte díly podél hrany$/i,
    });
    expect(heading).toHaveFocus();
    expect(screen.getByText('Krok 1 / 7')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(router.state.location.search).toBe('?krok=2');
    await user.keyboard('{ArrowLeft}');
    expect(router.state.location.search).toBe('?krok=1');
  });

  it('?krok=N otevře přímo daný krok; poslední krok vede ke kontrolním bodům', async () => {
    setup(focusUrl(7));
    expect(await screen.findByText('Krok 7 / 7')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ke kontrolním bodům' })).toHaveAttribute(
      'href',
      LESSON,
    );
    expect(screen.getByRole('link', { name: /ukončit/i })).toHaveAttribute('href', LESSON);
  });

  it('šipky nepřebíjí psaní do pole', async () => {
    const { user, router } = setup(focusUrl(1));
    await screen.findByText('Krok 1 / 7');
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    await user.keyboard('{ArrowRight}');
    expect(router.state.location.search).toBe('?krok=1');
    input.remove();
  });

  it('bez Wake Lock API řekne, že obrazovku rozsvícenou neudrží', async () => {
    setup(focusUrl(1));
    expect(
      await screen.findByText(/tento prohlížeč neumí nechat obrazovku rozsvícenou/i),
    ).toBeInTheDocument();
  });

  it('s Wake Lock API potvrdí rozsvícenou obrazovku', async () => {
    const release = vi.fn(async () => Promise.resolve());
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: async () =>
          Promise.resolve({ released: false, release, addEventListener: () => undefined }),
      },
    });
    try {
      const { unmount } = setup(focusUrl(1));
      expect(await screen.findByText('Obrazovka zůstane rozsvícená.')).toBeInTheDocument();
      unmount();
      expect(release).toHaveBeenCalled();
    } finally {
      delete (navigator as { wakeLock?: unknown }).wakeLock;
    }
  });

  it('spuštěný časovač odpočítává a přežije remount (reload)', async () => {
    const first = setup(focusUrl(1));
    const card = await screen.findByRole('region', { name: /test: zavadnutí lepidla/i });
    expect(within(card).getByText(/podle lekce: 10–15/i)).toBeInTheDocument();

    await first.user.click(within(card).getByRole('button', { name: 'Delší' }));
    await first.user.click(within(card).getByRole('button', { name: /spustit 11/i }));
    expect(within(card).getByRole('timer')).toHaveTextContent('11:00');

    act(() => vi.advanceTimersByTime(4 * MIN));
    expect(within(card).getByRole('timer')).toHaveTextContent('7:00');
    first.unmount();

    act(() => vi.advanceTimersByTime(2 * MIN));
    setup(focusUrl(1));
    const again = await screen.findByRole('region', { name: /test: zavadnutí lepidla/i });
    expect(within(again).getByRole('timer')).toHaveTextContent('5:00');
    expect(JSON.parse(localStorage.getItem(TIMERS_STORAGE_KEY)!)).toHaveLength(1);
  });

  it('doběhlý časovač ohlásí jednou (i po remountu), upozornění zmizí po „Rozumím“', async () => {
    const beep = vi.spyOn(appBeeper, 'beep').mockImplementation(() => undefined);
    const first = setup(focusUrl(1));
    const card = await screen.findByRole('region', { name: /test: zavadnutí lepidla/i });
    await first.user.click(within(card).getByRole('button', { name: /spustit 10/i }));

    act(() => vi.advanceTimersByTime(10 * MIN + 100));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Hotovo: Test: zavadnutí lepidla');
    expect(alert).toHaveTextContent('Krok 1');
    expect(beep).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(5 * MIN));
    expect(beep).toHaveBeenCalledTimes(1);

    first.unmount();
    const second = setup(focusUrl(1));
    const again = await screen.findByRole('alert');
    expect(again).toHaveTextContent(/doběhlo před 5/);
    expect(beep).toHaveBeenCalledTimes(1);

    await second.user.click(within(again).getByRole('button', { name: 'Rozumím' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: /test: zavadnutí lepidla/i })).getByRole('button', {
        name: /spustit 10/i,
      }),
    ).toBeInTheDocument();
  });

  it('časovač končící mimo takt odpočtu po ohlášení ukáže Hotovo, nezamrzne na 0:01', async () => {
    vi.spyOn(appBeeper, 'beep').mockImplementation(() => undefined);
    const now = Date.now();
    // Spuštěný dřív (např. před reloadem): konec nepadá na sekundový tik odpočtu.
    localStorage.setItem(
      TIMERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'mimo-takt',
          projectSlug: 'card-holder',
          lessonSlug: '04-saddle-stitch',
          stepId: 'glue',
          waitId: 'tack',
          label: 'Test: zavadnutí lepidla',
          startedAt: now - 500,
          endsAt: now + 10 * MIN - 500 + 700,
          durationMin: 10,
          firedAt: null,
          dismissedAt: null,
        },
      ]),
    );
    setup(focusUrl(1));
    const card = await screen.findByRole('region', { name: /test: zavadnutí lepidla/i });
    act(() => vi.advanceTimersByTime(10 * MIN + 400));
    expect(await screen.findByRole('alert')).toHaveTextContent('Hotovo: Test: zavadnutí lepidla');
    expect(within(card).queryByRole('timer')).not.toBeInTheDocument();
    expect(within(card).getByRole('status')).toHaveTextContent('Hotovo');
  });

  it('časovač doběhlý při zavřené aplikaci se ohlásí po návratu', async () => {
    const beep = vi.spyOn(appBeeper, 'beep').mockImplementation(() => undefined);
    const first = setup(focusUrl(1));
    const card = await screen.findByRole('region', { name: /test: zavadnutí lepidla/i });
    await first.user.click(within(card).getByRole('button', { name: /spustit 10/i }));
    first.unmount();

    act(() => vi.advanceTimersByTime(30 * MIN));
    expect(beep).not.toHaveBeenCalled();
    setup(focusUrl(2));
    expect(await screen.findByRole('alert')).toHaveTextContent(/doběhlo před 20/);
    expect(beep).toHaveBeenCalledTimes(1);
  });

  it('krok blokovaný čekáním upozorní a nabídne cestu zpět ke kroku s čekáním', async () => {
    const { user, router } = setup(focusUrl(2));
    expect(await screen.findByText(/další krok čeká na „test: zatuhnutí spoje“/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /další/i }));
    const note = screen.getByRole('note', { name: 'Ještě se čeká' });
    expect(note).toHaveTextContent(
      'Nejdřív spusťte a nechte doběhnout „Test: zatuhnutí spoje“ v kroku 1.',
    );
    await user.click(within(note).getByRole('button', { name: 'Ke kroku 1' }));
    expect(router.state.location.search).toBe('?krok=1');

    const card = await screen.findByRole('region', { name: /test: zatuhnutí spoje/i });
    await user.click(within(card).getByRole('button', { name: /spustit 1/i }));
    await user.click(screen.getByRole('button', { name: /další/i }));
    await user.click(screen.getByRole('button', { name: /další/i }));
    expect(screen.getByRole('note', { name: 'Ještě se čeká' })).toHaveTextContent(
      /počkejte, až doběhne „test: zatuhnutí spoje“ \(ještě (1:00:00|59:\d\d)\)/i,
    );
  });

  it('neznámá lekce ukáže stránku nenalezeno', async () => {
    setup('/projects/card-holder/lessons/neni/focus');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Tuhle stránku nemáme',
    );
  });
});

describe('Dílenský režim z lekce a pruh časovačů v aplikaci', () => {
  it('lekce má tlačítko Dílenský režim a pod krokem časovač', async () => {
    const { user } = setup(LESSON);
    expect(await screen.findByRole('link', { name: /dílenský režim/i })).toHaveAttribute(
      'href',
      `${LESSON}/focus`,
    );
    const card = screen.getByRole('region', { name: /test: zavadnutí lepidla/i });
    await user.click(within(card).getByRole('button', { name: /spustit 10/i }));
    // Běžící časovač je vidět i v pruhu aplikace s odkazem na krok.
    const bar = screen.getByRole('navigation', { name: 'Běžící časovače' });
    expect(within(bar).getByRole('link')).toHaveAttribute('href', `${LESSON}/focus?krok=1`);
    expect(bar).toHaveTextContent('10:00');
  });
});
