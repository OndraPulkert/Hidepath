import { type LessonStep } from '@/content/schema';
import { formatRemaining, startTimer, dismissTimer } from '@/features/timers/timers';
import {
  describeBlocker,
  isTypingTarget,
  parseStepParam,
  stepBlockers,
  stepNeighbors,
  stepPositionCount,
} from '@/features/workshop/workshop-nav';

const step = (id: string, extra: Partial<LessonStep> = {}): LessonStep => ({
  id,
  title: id,
  body: 'text',
  media: [],
  ...extra,
});

const lesson = {
  slug: '06-glue',
  steps: [
    step('glue', {
      waits: [
        { id: 'tack', label: 'Zavadnutí lepidla', minutes: 10, maxMinutes: 15, basis: 'text' },
        {
          id: 'set',
          label: 'Zatuhnutí spoje',
          minutes: 60,
          basis: 'text',
          blocksStepId: 'punch',
        },
      ],
    }),
    step('press'),
    step('punch'),
  ],
};
const T0 = Date.UTC(2026, 9, 7, 10, 0, 0);
const MIN = 60_000;
const setRef = {
  projectSlug: 'lid-wallet',
  lessonSlug: '06-glue',
  stepId: 'glue',
  waitId: 'set',
  label: 'Zatuhnutí spoje',
  durationMin: 60,
};

describe('pozice kroku', () => {
  it('parseStepParam: chybějící nebo neplatné = 0, za koncem = poslední', () => {
    expect(parseStepParam(null, lesson)).toBe(0);
    expect(parseStepParam('', lesson)).toBe(0);
    expect(parseStepParam('abc', lesson)).toBe(0);
    expect(parseStepParam('-1', lesson)).toBe(0);
    expect(parseStepParam('1.5', lesson)).toBe(0);
    expect(parseStepParam('0', lesson)).toBe(0);
    expect(parseStepParam('2', lesson)).toBe(2);
    expect(parseStepParam(' 3 ', lesson)).toBe(3);
    expect(parseStepParam('99', lesson)).toBe(3);
  });

  it('stepNeighbors a počet pozic (včetně „Než začnete“)', () => {
    expect(stepPositionCount(lesson)).toBe(4);
    expect(stepNeighbors(0, lesson)).toEqual({ prev: null, next: 1 });
    expect(stepNeighbors(2, lesson)).toEqual({ prev: 1, next: 3 });
    expect(stepNeighbors(3, lesson)).toEqual({ prev: 2, next: null });
  });
});

describe('stepBlockers', () => {
  it('nespuštěné čekání blokuje cílový krok, jiné kroky ne', () => {
    const b = stepBlockers(lesson, 'lid-wallet', 3, [], T0);
    expect(b).toEqual([
      expect.objectContaining({ state: 'not-started', fromPosition: 1, fromStepId: 'glue' }),
    ]);
    expect(b[0]!.wait.id).toBe('set');
    expect(stepBlockers(lesson, 'lid-wallet', 2, [], T0)).toEqual([]);
    expect(stepBlockers(lesson, 'lid-wallet', 0, [], T0)).toEqual([]);
  });

  it('běžící časovač blokuje se zbývajícím časem, doběhlý ani zavřený ne', () => {
    const timers = startTimer([], setRef, T0, 'a');
    const running = stepBlockers(lesson, 'lid-wallet', 3, timers, T0 + 15 * MIN);
    expect(running).toEqual([expect.objectContaining({ state: 'running', remainingMs: 45 * MIN })]);
    expect(stepBlockers(lesson, 'lid-wallet', 3, timers, T0 + 60 * MIN)).toEqual([]);
    const dismissed = dismissTimer(timers, 'a', T0 + 61 * MIN);
    expect(stepBlockers(lesson, 'lid-wallet', 3, dismissed, T0 + 62 * MIN)).toEqual([]);
  });

  it('časovač jiného projektu se nepočítá', () => {
    const timers = startTimer([], { ...setRef, projectSlug: 'jiny' }, T0, 'a');
    expect(stepBlockers(lesson, 'lid-wallet', 3, timers, T0 + MIN)[0]!.state).toBe('not-started');
  });

  it('describeBlocker mluví česky', () => {
    const [notStarted] = stepBlockers(lesson, 'lid-wallet', 3, [], T0);
    expect(describeBlocker(notStarted!, formatRemaining)).toBe(
      'Nejdřív spusťte a nechte doběhnout „Zatuhnutí spoje“ v kroku 1.',
    );
    const [running] = stepBlockers(
      lesson,
      'lid-wallet',
      3,
      startTimer([], setRef, T0, 'a'),
      T0 + 15 * MIN,
    );
    expect(describeBlocker(running!, formatRemaining)).toBe(
      'Počkejte, až doběhne „Zatuhnutí spoje“ (ještě 45:00).',
    );
  });
});

describe('isTypingTarget', () => {
  it('pole formuláře ano, tlačítko a nic ne', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const button = document.createElement('button');
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(textarea)).toBe(true);
    expect(isTypingTarget(button)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(window)).toBe(false);
  });
});
