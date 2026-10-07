import { z } from 'zod';

import { type StepWait } from '@/content/schema';

/**
 * Časovač čekání v kroku lekce (schnutí lepidla, přes noc pod zátěží…). Žije jen na zařízení
 * (`hidepath.v1.timers`), čas je v epoch ms. Všechny funkce jsou čisté a čas dostávají zvenku,
 * aby šly testovat bez skutečných hodin.
 */
export interface TimerRecord {
  id: string;
  projectSlug: string;
  lessonSlug: string;
  stepId: string;
  waitId: string;
  label: string;
  startedAt: number;
  endsAt: number;
  durationMin: number;
  /** Kdy aplikace ohlásila doběhnutí (zvuk / notifikace). Brání dvojímu ohlášení. */
  firedAt: number | null;
  /** Kdy uživatel hotový časovač zavřel. */
  dismissedAt: number | null;
}

export type TimerStatus = 'running' | 'done' | 'dismissed';

export interface WaitRef {
  projectSlug: string;
  lessonSlug: string;
  stepId: string;
  waitId: string;
}

const MINUTE = 60_000;
/** Nejdelší čekání, které jde nastavit (týden) – ochrana proti překlepu. */
export const MAX_TIMER_MINUTES = 7 * 24 * 60;
/** Zavřené časovače se po této době z úložiště smažou. */
export const DISMISSED_RETENTION_MS = 24 * 60 * MINUTE;

const timerRecordSchema = z.object({
  id: z.string().min(1),
  projectSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
  stepId: z.string().min(1),
  waitId: z.string().min(1),
  label: z.string().min(1),
  startedAt: z.number(),
  endsAt: z.number(),
  durationMin: z.number().positive(),
  firedAt: z.number().nullable(),
  dismissedAt: z.number().nullable(),
});

/**
 * Načte časovače z neznámých dat (localStorage). Neplatné položky vynechá, ostatní ponechá –
 * jeden poškozený záznam nesmí smazat ostatní běžící časovače.
 */
export function parseTimers(raw: unknown): TimerRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: TimerRecord[] = [];
  for (const item of raw) {
    const parsed = timerRecordSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function sameWait(timer: WaitRef, ref: WaitRef): boolean {
  return (
    timer.projectSlug === ref.projectSlug &&
    timer.lessonSlug === ref.lessonSlug &&
    timer.stepId === ref.stepId &&
    timer.waitId === ref.waitId
  );
}

/** Nezavřený časovač daného čekání (běžící nebo hotový), jinak undefined. */
export function findTimer(timers: readonly TimerRecord[], ref: WaitRef): TimerRecord | undefined {
  return timers.find((t) => t.dismissedAt === null && sameWait(t, ref));
}

export interface StartTimerInput extends WaitRef {
  label: string;
  durationMin: number;
}

/**
 * Spustí časovač. Jedno čekání má nejvýš jeden časovač: dřívější časovač téhož čekání
 * (i zavřený) nahradí.
 */
export function startTimer(
  timers: readonly TimerRecord[],
  input: StartTimerInput,
  now: number,
  id: string,
): TimerRecord[] {
  const durationMin = clampMinutes(input.durationMin);
  const timer: TimerRecord = {
    id,
    projectSlug: input.projectSlug,
    lessonSlug: input.lessonSlug,
    stepId: input.stepId,
    waitId: input.waitId,
    label: input.label,
    startedAt: now,
    endsAt: now + durationMin * MINUTE,
    durationMin,
    firedAt: null,
    dismissedAt: null,
  };
  return [...timers.filter((t) => !sameWait(t, input)), timer];
}

/** Zruší časovač (odstraní ho úplně). */
export function cancelTimer(timers: readonly TimerRecord[], id: string): TimerRecord[] {
  return timers.filter((t) => t.id !== id);
}

/** Zavře hotový časovač („Rozumím“); zůstane v úložišti do úklidu. */
export function dismissTimer(
  timers: readonly TimerRecord[],
  id: string,
  now: number,
): TimerRecord[] {
  return timers.map((t) =>
    t.id === id && t.dismissedAt === null ? { ...t, dismissedAt: now } : t,
  );
}

export function remainingMs(timer: TimerRecord, now: number): number {
  return Math.max(0, timer.endsAt - now);
}

export function timerStatus(timer: TimerRecord, now: number): TimerStatus {
  if (timer.dismissedAt !== null) return 'dismissed';
  return timer.endsAt <= now ? 'done' : 'running';
}

/** Nezavřené časovače seřazené podle konce (nejbližší první). */
export function activeTimers(timers: readonly TimerRecord[]): TimerRecord[] {
  return timers.filter((t) => t.dismissedAt === null).sort((a, b) => a.endsAt - b.endsAt);
}

/** Doběhlé časovače, které ještě nebyly ohlášené. */
export function dueUnfired(timers: readonly TimerRecord[], now: number): TimerRecord[] {
  return timers.filter((t) => t.firedAt === null && timerStatus(t, now) === 'done');
}

/** Označí časovače jako ohlášené. Už ohlášené nechá beze změny. */
export function markFired(
  timers: readonly TimerRecord[],
  ids: readonly string[],
  now: number,
): TimerRecord[] {
  const set = new Set(ids);
  return timers.map((t) => (set.has(t.id) && t.firedAt === null ? { ...t, firedAt: now } : t));
}

/** Nejbližší konec běžícího časovače (pro naplánování kontroly), nebo null. */
export function nextEndsAt(timers: readonly TimerRecord[], now: number): number | null {
  let next: number | null = null;
  for (const t of timers) {
    if (timerStatus(t, now) !== 'running') continue;
    if (next === null || t.endsAt < next) next = t.endsAt;
  }
  return next;
}

/** Smaže zavřené časovače starší než `DISMISSED_RETENTION_MS`. */
export function pruneTimers(timers: readonly TimerRecord[], now: number): TimerRecord[] {
  return timers.filter(
    (t) => t.dismissedAt === null || now - t.dismissedAt < DISMISSED_RETENTION_MS,
  );
}

function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 1;
  return Math.min(MAX_TIMER_MINUTES, Math.max(1, Math.round(minutes)));
}

// ---------------------------------------------------------------------------
// Doba čekání z obsahu

export interface WaitDurationBounds {
  /** Výchozí doba při spuštění (dolní mez rozsahu z textu). */
  initial: number;
  min: number;
  max: number;
  /** Zda jde dobu před spuštěním upravit. */
  adjustable: boolean;
}

/**
 * Meze doby čekání. Doba z textu lekce (`basis: 'text'`) jde měnit jen uvnitř rozsahu, který
 * text uvádí; pevnou dobu z textu měnit nejde. Doba „podle návodu“ (`manufacturer`) je jen
 * orientační, uživatel ji upraví podle návodu na obalu.
 */
export function waitDurationBounds(wait: StepWait): WaitDurationBounds {
  if (wait.basis === 'manufacturer') {
    return { initial: wait.minutes, min: 1, max: MAX_TIMER_MINUTES, adjustable: true };
  }
  const max = wait.maxMinutes ?? wait.minutes;
  return { initial: wait.minutes, min: wait.minutes, max, adjustable: max > wait.minutes };
}

/** Krok tlačítek ± podle velikosti doby: minuty, pět minut, hodiny. */
export function adjustStepMinutes(minutes: number): number {
  if (minutes < 30) return 1;
  if (minutes < 180) return 5;
  return 60;
}

/** Upraví dobu o jeden krok nahoru (+1) nebo dolů (−1) a ořízne ji do mezí. */
export function adjustMinutes(
  minutes: number,
  direction: 1 | -1,
  bounds: Pick<WaitDurationBounds, 'min' | 'max'>,
): number {
  const step = adjustStepMinutes(direction === 1 ? minutes : Math.max(1, minutes - 1));
  // Po kroku zarovnat na násobek kroku, aby hodnoty zůstaly „kulaté“ (65 → 70, ne 70 → 75 → …).
  const raw = direction === 1 ? minutes + step : minutes - step;
  const aligned = step > 1 ? Math.round(raw / step) * step : raw;
  return Math.min(bounds.max, Math.max(bounds.min, aligned));
}

/** Čekání přes noc nebo déle – nabídnout „Přidat do kalendáře“, zavřená aplikace nepípne. */
export const CALENDAR_THRESHOLD_MINUTES = 6 * 60;

export function offersCalendar(durationMin: number): boolean {
  return durationMin >= CALENDAR_THRESHOLD_MINUTES;
}

// ---------------------------------------------------------------------------
// České formáty

const NBSP = '\u00a0';

/** Odpočet „4:05“, „12:00“, „1:02:03“. Zaokrouhluje nahoru, aby 0:00 znamenalo hotovo. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Doba v minutách česky: „15 min“, „2 h“, „1 h 30 min“. */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}${NBSP}min`;
  if (m === 0) return `${h}${NBSP}h`;
  return `${h}${NBSP}h ${m}${NBSP}min`;
}

/** Doba čekání z obsahu: „10–15 min“, „12–24 h“, „60 min“. */
export function formatWaitRange(wait: Pick<StepWait, 'minutes' | 'maxMinutes'>): string {
  const { minutes, maxMinutes } = wait;
  if (maxMinutes === undefined || maxMinutes === minutes) return formatMinutes(minutes);
  if (minutes % 60 === 0 && maxMinutes % 60 === 0) {
    return `${minutes / 60}–${maxMinutes / 60}${NBSP}h`;
  }
  if (minutes < 60 && maxMinutes < 60) return `${minutes}–${maxMinutes}${NBSP}min`;
  return `${formatMinutes(minutes)} – ${formatMinutes(maxMinutes)}`;
}

/** Jak dávno časovač doběhl: „právě teď“, „před 5 min“, „před 2 h“. */
export function formatAgo(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60_000);
  if (minutes < 1) return 'právě teď';
  if (minutes < 60) return `před ${minutes}${NBSP}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `před ${hours}${NBSP}h`;
  return `před ${Math.floor(hours / 24)} dny`;
}

/** Čas konce „v 14:05“ (místní čas), u konce v jiný den „zítra v 7:30“. */
export function formatEndsAt(endsAt: number, now: number): string {
  const end = new Date(endsAt);
  const time = `${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')}`;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(end) - startOfDay(new Date(now))) / (24 * 60 * MINUTE));
  if (days <= 0) return `v${NBSP}${time}`;
  if (days === 1) return `zítra v${NBSP}${time}`;
  return `${end.getDate()}.${NBSP}${end.getMonth() + 1}. v${NBSP}${time}`;
}
