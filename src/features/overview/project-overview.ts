import {
  type LessonPrint,
  type OverviewPoint,
  type ProjectDefinition,
  type ProjectOverview,
} from '@/content/schema';
import { printHref } from '@/features/prep/lesson-prep';
import { CARDBOARD_NOTE, mountText } from '@/features/prep/print-mount';

/**
 * „Postup v kostce“: číslování bodů, cíl odkazu do lekce a výtisky převzaté z `prints` lekcí.
 * Bez Reactu, aby to šlo testovat proti obsahu.
 */

export type OverviewProject = ProjectDefinition & { overview: ProjectOverview };

/** Projekt s „Postupem v kostce“ (zúžení typu pro stránky). */
export function hasOverview(project: ProjectDefinition): project is OverviewProject {
  return project.overview !== undefined;
}

export interface NumberedPoint {
  /** Pořadí bodu od 1, napříč oddíly. */
  number: number;
  point: OverviewPoint;
  lessonOrder: number;
  /** Krok lekce od 1, na který bod míří (kotva `krok-N`); bez `stepId` chybí. */
  stepNumber?: number;
}

export interface NumberedSection {
  title: string;
  note?: string;
  points: NumberedPoint[];
}

type ProjectLessons = Pick<ProjectDefinition, 'lessons'>;

/** Oddíly s body očíslovanými od 1 a s číslem lekce a kroku. */
export function numberOverview(
  overview: ProjectOverview,
  project: ProjectLessons,
): NumberedSection[] {
  let number = 0;
  return overview.sections.map((section) => ({
    title: section.title,
    ...(section.note ? { note: section.note } : {}),
    points: section.points.map((point) => {
      number += 1;
      const lesson = project.lessons.find((l) => l.slug === point.lessonSlug);
      const stepIndex =
        point.stepId === undefined
          ? -1
          : (lesson?.steps.findIndex((s) => s.id === point.stepId) ?? -1);
      return {
        number,
        point,
        lessonOrder: lesson?.order ?? 0,
        ...(stepIndex >= 0 ? { stepNumber: stepIndex + 1 } : {}),
      };
    }),
  }));
}

/** Všechny body za sebou. */
export function flatOverview(sections: readonly NumberedSection[]): NumberedPoint[] {
  return sections.flatMap((s) => s.points);
}

/** Čísla bodů, které patří k lekci. */
export function pointNumbersForLesson(
  sections: readonly NumberedSection[],
  lessonSlug: string,
): number[] {
  return flatOverview(sections)
    .filter((p) => p.point.lessonSlug === lessonSlug)
    .map((p) => p.number);
}

/**
 * Výřez přehledu kolem lekce: její body a po jednom bodu před a za nimi (souvislost). Oddíly
 * bez bodu ve výřezu vynechá; bez bodů lekce vrátí prázdný seznam.
 */
export function overviewAroundLesson(
  sections: readonly NumberedSection[],
  lessonSlug: string,
): NumberedSection[] {
  const numbers = pointNumbersForLesson(sections, lessonSlug);
  if (numbers.length === 0) return [];
  const from = Math.min(...numbers) - 1;
  const to = Math.max(...numbers) + 1;
  return sections
    .map((s) => ({ ...s, points: s.points.filter((p) => p.number >= from && p.number <= to) }))
    .filter((s) => s.points.length > 0);
}

/** „3“, „1–4“, „2, 5–6“: souvislé úseky čísel. */
export function formatNumberRanges(numbers: readonly number[]): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = start;
  for (const n of [...sorted.slice(1), undefined]) {
    if (n !== undefined && prev !== undefined && n === prev + 1) {
      prev = n;
      continue;
    }
    if (start !== undefined && prev !== undefined) {
      parts.push(start === prev ? String(start) : `${start}–${prev}`);
    }
    start = n;
    prev = n;
  }
  return parts.join(', ');
}

/** Řádek výpisu tisku: jeden list z „Vytisknout“ jedné lekce. */
export interface OverviewPrintRow {
  /** Krátký název listu, např. „List 1“ (z titulku listu před „ – “). */
  sheetLabel: string;
  sheetId: string;
  copies: number;
  /** K čemu výtisk je, bez opakovaného názvu listu na začátku („List 1: …“). */
  purpose: string;
  /** Kde se list tiskne (u pásku „Váš pásek“ s listy pro uložený pásek). */
  href: string;
  paper?: string;
  /** Štítek podkladu (tenký karton) z `mount` výtisku. */
  mount?: string;
  condition?: string;
}

export interface OverviewPrintGroup {
  lessonSlug: string;
  lessonOrder: number;
  rows: OverviewPrintRow[];
}

type ProjectPrints = Pick<
  ProjectDefinition,
  'slug' | 'lessons' | 'patternSheets' | 'practiceSheets'
>;

/** „List 1: značení odřezku“ u listu „List 1“ → „značení odřezku“. */
function purposeWithoutLabel(purpose: string, label: string): string {
  const prefix = `${label}: `;
  return purpose.startsWith(prefix) ? purpose.slice(prefix.length) : purpose;
}

function sheetLabel(project: ProjectPrints, print: LessonPrint): string {
  if (print.source === 'template') return 'Šablona 1:1';
  const sheets = print.source === 'pattern-sheets' ? project.patternSheets : project.practiceSheets;
  const title = sheets?.sheets.find((s) => s.id === print.sheetId)?.title ?? print.sheetId ?? '';
  const short = (t: string) => t.split(' – ')[0] ?? t;
  // Zkrácený název jen tehdy, když ho nemá i jiný list (jinak by „Kapsa – záložní okno Ø 20 mm“
  // a „Kapsa – mince 40 mm“ splynuly do „Kapsa“).
  const clash = (sheets?.sheets ?? []).filter((s) => short(s.title) === short(title)).length > 1;
  return clash ? title : short(title);
}

/**
 * Výtisky lekcí (u bodu přehledu z `printsFrom`), v pořadí lekcí, převzaté z jejich „Vytisknout“.
 * Se `source` jen výtisky z jednoho zdroje (tisková stránka listů střihu, cvičných listů, šablony).
 */
export function overviewPrints(
  project: ProjectPrints,
  lessonSlugs: readonly string[],
  { source }: { source?: LessonPrint['source'] } = {},
): OverviewPrintGroup[] {
  return project.lessons
    .filter((l) => lessonSlugs.includes(l.slug) && l.prints)
    .sort((a, b) => a.order - b.order)
    .map((lesson) => ({
      lessonSlug: lesson.slug,
      lessonOrder: lesson.order,
      rows: (lesson.prints ?? [])
        .filter((print) => source === undefined || print.source === source)
        .map((print) => {
          const label = sheetLabel(project, print);
          return {
            sheetLabel: label,
            sheetId: print.sheetId ?? 'template',
            copies: print.copies,
            purpose: purposeWithoutLabel(print.purpose, label),
            href: printHref(
              project,
              print.source,
              print.source === 'template' ? undefined : print.sheetId,
            ),
            ...(print.paper ? { paper: print.paper } : {}),
            ...(print.mount ? { mount: mountText(print.mount) } : {}),
            ...(print.condition ? { condition: print.condition } : {}),
          };
        }),
    }))
    .filter((g) => g.rows.length > 0);
}

export interface PrintTotal {
  sheetLabel: string;
  sheetId: string;
  copies: number;
}

/** Součet výtisků po listech v pořadí prvního výtisku (pořadí lekcí). Podmíněné se nepočítají. */
export function printTotals(groups: readonly OverviewPrintGroup[]): PrintTotal[] {
  const totals: PrintTotal[] = [];
  for (const row of groups.flatMap((g) => g.rows)) {
    if (row.condition) continue;
    const total = totals.find((t) => t.sheetId === row.sheetId);
    if (total) total.copies += row.copies;
    else totals.push({ sheetLabel: row.sheetLabel, sheetId: row.sheetId, copies: row.copies });
  }
  return totals;
}

/** Podmíněný výtisk s číslem lekce (výpis „Jen v případě potřeby“ lekce neseskupuje). */
export type ConditionalPrintRow = OverviewPrintRow & { condition: string; lessonOrder: number };

/** Podmíněné výtisky se stejnou podmínkou (u pásku mají všechny listy jednu). */
export interface ConditionalPrintGroup {
  condition: string;
  rows: ConditionalPrintRow[];
}

export interface PrintList {
  /** Výtisky, které jsou potřeba vždy, po lekcích (lekce jen s podmíněnými výtisky chybí). */
  required: OverviewPrintGroup[];
  /** Součet povinných výtisků po listech („Celkem vytisknout“). */
  totals: PrintTotal[];
  /** Výtisky jen za podmínky, seskupené podle podmínky v pořadí lekcí; do součtu se nepočítají. */
  conditional: ConditionalPrintGroup[];
  /** Co je tenký karton ({@link CARDBOARD_NOTE}), když má některý výtisk štítek podkladu. */
  cardboardNote?: string;
}

/**
 * Výpis tisku rozdělený na povinné výtisky (po lekcích, se součtem) a výtisky jen v případě
 * potřeby (s podmínkou). Stejně pro „Postup v kostce“ i tiskovou stránku.
 */
export function splitPrintList(groups: readonly OverviewPrintGroup[]): PrintList {
  const required = groups
    .map((g) => ({ ...g, rows: g.rows.filter((r) => !r.condition) }))
    .filter((g) => g.rows.length > 0);
  const conditional: ConditionalPrintGroup[] = [];
  for (const g of groups) {
    for (const row of g.rows) {
      if (!row.condition) continue;
      const item: ConditionalPrintRow = {
        ...row,
        condition: row.condition,
        lessonOrder: g.lessonOrder,
      };
      const group = conditional.find((c) => c.condition === row.condition);
      if (group) group.rows.push(item);
      else conditional.push({ condition: row.condition, rows: [item] });
    }
  }
  const mounted = groups.some((g) => g.rows.some((r) => r.mount));
  return {
    required,
    totals: printTotals(groups),
    conditional,
    ...(mounted ? { cardboardNote: CARDBOARD_NOTE } : {}),
  };
}
