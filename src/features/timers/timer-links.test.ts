import { cardHolderProject } from '@/content/projects/card-holder/project';
import { timerContext, timerNotice } from '@/features/timers/timer-links';
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
});
