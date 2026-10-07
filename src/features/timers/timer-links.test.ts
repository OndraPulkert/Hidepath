import { cardHolderProject } from '@/content/projects/card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { timerContext, timerContinueUrl, timerNotice } from '@/features/timers/timer-links';
import { startTimer } from '@/features/timers/timers';

const lesson = cardHolderProject.lessons.find((l) => l.steps.length >= 2)!;
const step = lesson.steps[1]!;

describe('timer-links', () => {
  it('časovač vede na svůj krok v dílenském režimu', () => {
    const ctx = timerContext({
      projectSlug: cardHolderProject.slug,
      lessonSlug: lesson.slug,
      stepId: step.id,
    });
    expect(ctx).toEqual({
      lessonTitle: lesson.title,
      position: 2,
      url: `/projects/${cardHolderProject.slug}/lessons/${lesson.slug}/focus?krok=2`,
    });
  });

  it('zmizelý krok nebo projekt vede na začátek dílenského režimu', () => {
    const ctx = timerContext({ projectSlug: 'nic', lessonSlug: 'nic', stepId: 'nic' });
    expect(ctx).toEqual({ lessonTitle: '', position: 0, url: '/projects/nic/lessons/nic/focus' });
  });

  it('text ohlášení', () => {
    const [timer] = startTimer(
      [],
      {
        projectSlug: cardHolderProject.slug,
        lessonSlug: lesson.slug,
        stepId: step.id,
        waitId: 'w',
        label: 'Zavadnutí lepidla',
        durationMin: 10,
      },
      0,
      'id-1',
    );
    expect(timerNotice(timer!)).toEqual({
      id: 'id-1',
      title: 'Hotovo: Zavadnutí lepidla',
      body: `Krok 2 · ${lesson.title}`,
      url: `/projects/${cardHolderProject.slug}/lessons/${lesson.slug}/focus?krok=2`,
    });
    expect(timerNotice({ ...timer!, projectSlug: 'nic' }).body).toBe('Čekání skončilo.');
  });

  it('časovač spuštěný v běžné lekci vede na krok v lekci, ne do dílenského režimu', () => {
    const ctx = timerContext({
      projectSlug: cardHolderProject.slug,
      lessonSlug: lesson.slug,
      stepId: step.id,
      origin: 'lesson',
    });
    expect(ctx.url).toBe(`/projects/${cardHolderProject.slug}/lessons/${lesson.slug}#krok-2`);
  });

  it('pokračování po čekání: krok blokovaný čekáním, jinak následující krok', () => {
    const bend = lidWalletProject.lessons.find((l) => l.steps.some((s) => s.id === 'inspect'))!;
    const dry = bend.steps.findIndex((s) => s.id === 'dry');
    const inspect = bend.steps.findIndex((s) => s.id === 'inspect') + 1;
    const ref = { projectSlug: 'lid-wallet', lessonSlug: bend.slug };
    expect(timerContinueUrl({ ...ref, stepId: 'dry', waitId: 'overnight' })).toBe(
      `/projects/lid-wallet/lessons/${bend.slug}/focus?krok=${inspect}`,
    );
    expect(timerContinueUrl({ ...ref, stepId: 'dry', waitId: 'jine' })).toBe(
      `/projects/lid-wallet/lessons/${bend.slug}/focus?krok=${dry + 2}`,
    );
  });
});
