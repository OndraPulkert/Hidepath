import { type StepWait } from '@/content/schema';
import {
  activeTimers,
  adjustMinutes,
  cancelTimer,
  DISMISSED_RETENTION_MS,
  dismissTimer,
  dueUnfired,
  findTimer,
  formatAgo,
  formatEndsAt,
  formatMinutes,
  formatRemaining,
  formatWaitRange,
  markFired,
  MAX_TIMER_MINUTES,
  nextEndsAt,
  offersCalendar,
  parseTimers,
  pruneTimers,
  remainingMs,
  startTimer,
  timerStatus,
  waitDurationBounds,
  type StartTimerInput,
  type TimerRecord,
} from '@/features/timers/timers';

const NB = '\u00a0';
const T0 = Date.UTC(2026, 9, 7, 10, 0, 0);
const MIN = 60_000;

const glue: StartTimerInput = {
  projectSlug: 'card-holder',
  lessonSlug: '04-glue',
  stepId: 'glue',
  waitId: 'tack',
  label: 'Zavadnutí lepidla',
  durationMin: 10,
};

function start(input: Partial<StartTimerInput> = {}, now = T0, id = 'a') {
  return startTimer([], { ...glue, ...input }, now, id);
}

const wait = (w: Partial<StepWait>): StepWait => ({
  id: 'w',
  label: 'Čekání',
  minutes: 10,
  basis: 'text',
  ...w,
});

describe('startTimer / cancelTimer / dismissTimer', () => {
  it('spustí časovač s koncem za danou dobu', () => {
    const [t] = start();
    expect(t).toMatchObject({
      id: 'a',
      startedAt: T0,
      endsAt: T0 + 10 * MIN,
      durationMin: 10,
      firedAt: null,
      dismissedAt: null,
      label: 'Zavadnutí lepidla',
    });
  });

  it('jedno čekání má nejvýš jeden časovač – nové spuštění starý nahradí', () => {
    const first = start();
    const second = startTimer(first, { ...glue, durationMin: 15 }, T0 + MIN, 'b');
    expect(second).toHaveLength(1);
    expect(second[0]).toMatchObject({ id: 'b', endsAt: T0 + MIN + 15 * MIN });
  });

  it('nahradí i zavřený časovač téhož čekání, jiná čekání nechá', () => {
    const other = startTimer([], { ...glue, waitId: 'other' }, T0, 'x');
    const dismissed = dismissTimer(startTimer(other, glue, T0, 'a'), 'a', T0 + 20 * MIN);
    const next = startTimer(dismissed, glue, T0 + 30 * MIN, 'b');
    expect(next.map((t) => t.id).sort()).toEqual(['b', 'x']);
  });

  it('ořízne dobu na 1 min až týden a zaokrouhlí ji', () => {
    expect(start({ durationMin: 0 })[0]!.durationMin).toBe(1);
    expect(start({ durationMin: 2.6 })[0]!.durationMin).toBe(3);
    expect(start({ durationMin: 99_999 })[0]!.durationMin).toBe(MAX_TIMER_MINUTES);
    expect(start({ durationMin: Number.NaN })[0]!.durationMin).toBe(1);
  });

  it('zrušení časovač odstraní', () => {
    expect(cancelTimer(start(), 'a')).toEqual([]);
    expect(cancelTimer(start(), 'nic')).toHaveLength(1);
  });

  it('zavření nastaví dismissedAt jen jednou', () => {
    const once = dismissTimer(start(), 'a', T0 + 11 * MIN);
    const twice = dismissTimer(once, 'a', T0 + 50 * MIN);
    expect(twice[0]!.dismissedAt).toBe(T0 + 11 * MIN);
  });
});

describe('stav a zbývající čas', () => {
  const [t] = start();

  it('běží do konce, pak je hotový, zavřený je zavřený', () => {
    expect(timerStatus(t!, T0)).toBe('running');
    expect(timerStatus(t!, T0 + 10 * MIN - 1)).toBe('running');
    expect(timerStatus(t!, T0 + 10 * MIN)).toBe('done');
    expect(timerStatus({ ...t!, dismissedAt: T0 }, T0 + 5 * MIN)).toBe('dismissed');
  });

  it('remainingMs nikdy není záporný', () => {
    expect(remainingMs(t!, T0 + 4 * MIN)).toBe(6 * MIN);
    expect(remainingMs(t!, T0 + 60 * MIN)).toBe(0);
  });

  it('findTimer přehlíží zavřené časovače', () => {
    const ref = { ...glue };
    expect(findTimer(start(), ref)?.id).toBe('a');
    expect(findTimer(dismissTimer(start(), 'a', T0), ref)).toBeUndefined();
    expect(findTimer(start(), { ...ref, stepId: 'jiny' })).toBeUndefined();
  });

  it('activeTimers vynechá zavřené a řadí podle konce', () => {
    let timers = startTimer([], { ...glue, waitId: 'long', durationMin: 60 }, T0, 'long');
    timers = startTimer(timers, { ...glue, waitId: 'short', durationMin: 5 }, T0, 'short');
    timers = startTimer(timers, { ...glue, waitId: 'gone', durationMin: 1 }, T0, 'gone');
    timers = dismissTimer(timers, 'gone', T0);
    expect(activeTimers(timers).map((x) => x.id)).toEqual(['short', 'long']);
  });

  it('nextEndsAt vrátí nejbližší konec běžícího časovače', () => {
    let timers = startTimer([], { ...glue, waitId: 'a', durationMin: 30 }, T0, 'a');
    timers = startTimer(timers, { ...glue, waitId: 'b', durationMin: 5 }, T0, 'b');
    expect(nextEndsAt(timers, T0)).toBe(T0 + 5 * MIN);
    expect(nextEndsAt(timers, T0 + 6 * MIN)).toBe(T0 + 30 * MIN);
    expect(nextEndsAt(timers, T0 + 31 * MIN)).toBeNull();
  });
});

describe('ohlášení (dueUnfired / markFired)', () => {
  it('doběhlý časovač je k ohlášení právě jednou', () => {
    const timers = start();
    expect(dueUnfired(timers, T0 + 9 * MIN)).toEqual([]);
    const due = dueUnfired(timers, T0 + 10 * MIN);
    expect(due.map((t) => t.id)).toEqual(['a']);
    const fired = markFired(timers, ['a'], T0 + 10 * MIN);
    expect(fired[0]!.firedAt).toBe(T0 + 10 * MIN);
    expect(dueUnfired(fired, T0 + 20 * MIN)).toEqual([]);
  });

  it('markFired nepřepíše dřívější firedAt', () => {
    const fired = markFired(start(), ['a'], T0 + 10 * MIN);
    expect(markFired(fired, ['a'], T0 + 99 * MIN)[0]!.firedAt).toBe(T0 + 10 * MIN);
  });

  it('zavřený časovač se neohlašuje', () => {
    const timers = dismissTimer(start(), 'a', T0 + MIN);
    expect(dueUnfired(timers, T0 + 20 * MIN)).toEqual([]);
  });
});

describe('pruneTimers', () => {
  it('smaže zavřené starší než den, běžící a hotové nechá', () => {
    let timers = startTimer([], { ...glue, waitId: 'old' }, T0, 'old');
    timers = startTimer(timers, { ...glue, waitId: 'new' }, T0, 'new');
    timers = startTimer(timers, { ...glue, waitId: 'run' }, T0, 'run');
    timers = dismissTimer(timers, 'old', T0);
    timers = dismissTimer(timers, 'new', T0 + DISMISSED_RETENTION_MS);
    const pruned = pruneTimers(timers, T0 + DISMISSED_RETENTION_MS + 1);
    expect(pruned.map((t) => t.id).sort()).toEqual(['new', 'run']);
  });
});

describe('parseTimers', () => {
  const valid: TimerRecord = start()[0]!;

  it('vrátí platné záznamy a neplatné vynechá', () => {
    const parsed = parseTimers([valid, { ...valid, id: '' }, { foo: 1 }, null, 'x']);
    expect(parsed).toEqual([valid]);
  });

  it('cokoli jiného než pole je prázdný seznam', () => {
    expect(parseTimers(null)).toEqual([]);
    expect(parseTimers({ timers: [valid] })).toEqual([]);
  });

  it('odmítne nečíselný čas', () => {
    expect(parseTimers([{ ...valid, endsAt: '2026-10-07' }])).toEqual([]);
  });
});

describe('doba čekání z obsahu', () => {
  it('pevná doba z textu nejde měnit', () => {
    expect(waitDurationBounds(wait({ minutes: 60 }))).toEqual({
      initial: 60,
      min: 60,
      max: 60,
      adjustable: false,
    });
  });

  it('rozsah z textu jde měnit jen uvnitř rozsahu, začíná dolní mezí', () => {
    expect(waitDurationBounds(wait({ minutes: 10, maxMinutes: 15 }))).toEqual({
      initial: 10,
      min: 10,
      max: 15,
      adjustable: true,
    });
  });

  it('doba podle návodu je orientační a jde volně upravit', () => {
    const b = waitDurationBounds(wait({ minutes: 15, basis: 'manufacturer' }));
    expect(b).toMatchObject({ initial: 15, min: 1, adjustable: true });
    expect(b.max).toBe(MAX_TIMER_MINUTES);
  });

  it('± krokuje po minutě, pěti minutách a hodině a drží meze', () => {
    const wide = { min: 1, max: 10_000 };
    expect(adjustMinutes(10, 1, wide)).toBe(11);
    expect(adjustMinutes(29, 1, wide)).toBe(30);
    expect(adjustMinutes(30, 1, wide)).toBe(35);
    expect(adjustMinutes(30, -1, wide)).toBe(29);
    expect(adjustMinutes(177, 1, wide)).toBe(180);
    expect(adjustMinutes(180, 1, wide)).toBe(240);
    expect(adjustMinutes(240, -1, wide)).toBe(180);
    expect(adjustMinutes(180, -1, wide)).toBe(175);
    expect(adjustMinutes(1, -1, wide)).toBe(1);
    expect(adjustMinutes(15, 1, { min: 10, max: 15 })).toBe(15);
    expect(adjustMinutes(10, -1, { min: 10, max: 15 })).toBe(10);
    expect(adjustMinutes(720, 1, { min: 720, max: 1440 })).toBe(780);
  });

  it('kalendář nabízí jen u čekání od 6 h', () => {
    expect(offersCalendar(359)).toBe(false);
    expect(offersCalendar(360)).toBe(true);
    expect(offersCalendar(1440)).toBe(true);
  });
});

describe('české formáty', () => {
  it('formatRemaining', () => {
    expect(formatRemaining(0)).toBe('0:00');
    expect(formatRemaining(-5)).toBe('0:00');
    expect(formatRemaining(1)).toBe('0:01');
    expect(formatRemaining(65_000)).toBe('1:05');
    expect(formatRemaining(10 * MIN)).toBe('10:00');
    expect(formatRemaining(3_723_000)).toBe('1:02:03');
    expect(formatRemaining(24 * 60 * MIN)).toBe('24:00:00');
  });

  it('formatMinutes', () => {
    expect(formatMinutes(15)).toBe(`15${NB}min`);
    expect(formatMinutes(60)).toBe(`1${NB}h`);
    expect(formatMinutes(90)).toBe(`1${NB}h 30${NB}min`);
    expect(formatMinutes(1440)).toBe(`24${NB}h`);
  });

  it('formatWaitRange', () => {
    expect(formatWaitRange({ minutes: 60 })).toBe(`1${NB}h`);
    expect(formatWaitRange({ minutes: 10, maxMinutes: 15 })).toBe(`10–15${NB}min`);
    expect(formatWaitRange({ minutes: 720, maxMinutes: 1440 })).toBe(`12–24${NB}h`);
    expect(formatWaitRange({ minutes: 45, maxMinutes: 90 })).toBe(
      `45${NB}min – 1${NB}h 30${NB}min`,
    );
    expect(formatWaitRange({ minutes: 20, maxMinutes: 20 })).toBe(`20${NB}min`);
  });

  it('formatAgo', () => {
    expect(formatAgo(10_000)).toBe('právě teď');
    expect(formatAgo(5 * MIN)).toBe(`před 5${NB}min`);
    expect(formatAgo(125 * MIN)).toBe(`před 2${NB}h`);
    expect(formatAgo(3 * 24 * 60 * MIN)).toBe('před 3 dny');
  });

  it('formatEndsAt – dnes, zítra, později (místní čas)', () => {
    const now = new Date(2026, 9, 7, 13, 0).getTime();
    expect(formatEndsAt(new Date(2026, 9, 7, 14, 5).getTime(), now)).toBe(`v${NB}14:05`);
    expect(formatEndsAt(new Date(2026, 9, 8, 7, 30).getTime(), now)).toBe(`zítra v${NB}7:30`);
    expect(formatEndsAt(new Date(2026, 9, 10, 9, 0).getTime(), now)).toBe(`10.${NB}10. v${NB}9:00`);
  });
});
