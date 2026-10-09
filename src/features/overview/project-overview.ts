import {
  type LessonPrint,
  type OverviewPoint,
  type ProjectDefinition,
  type ProjectOverview,
} from '@/content/schema';

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
  purpose: string;
  paper?: string;
  condition?: string;
}

export interface OverviewPrintGroup {
  lessonSlug: string;
  lessonOrder: number;
  rows: OverviewPrintRow[];
}

type ProjectPrints = Pick<ProjectDefinition, 'lessons' | 'patternSheets' | 'practiceSheets'>;

function sheetLabel(project: ProjectPrints, print: LessonPrint): string {
  if (print.source === 'template') return 'Šablona';
  const sheets = print.source === 'pattern-sheets' ? project.patternSheets : project.practiceSheets;
  const title = sheets?.sheets.find((s) => s.id === print.sheetId)?.title ?? print.sheetId ?? '';
  const short = (t: string) => t.split(' – ')[0] ?? t;
  // Zkrácený název jen tehdy, když ho nemá i jiný list (jinak by „Kapsa – záložní okno Ø 18 mm“
  // a „Kapsa – mince 40 mm“ splynuly do „Kapsa“).
  const clash = (sheets?.sheets ?? []).filter((s) => short(s.title) === short(title)).length > 1;
  return clash ? title : short(title);
}

/** Výtisky lekcí z `printsFrom` bodu, v pořadí lekcí, převzaté z jejich „Vytisknout“. */
export function overviewPrints(
  project: ProjectPrints,
  lessonSlugs: readonly string[],
): OverviewPrintGroup[] {
  return project.lessons
    .filter((l) => lessonSlugs.includes(l.slug) && l.prints)
    .sort((a, b) => a.order - b.order)
    .map((lesson) => ({
      lessonSlug: lesson.slug,
      lessonOrder: lesson.order,
      rows: (lesson.prints ?? []).map((print) => ({
        sheetLabel: sheetLabel(project, print),
        sheetId: print.sheetId ?? 'template',
        copies: print.copies,
        purpose: print.purpose,
        ...(print.paper ? { paper: print.paper } : {}),
        ...(print.condition ? { condition: print.condition } : {}),
      })),
    }));
}

/** Součet výtisků po listech (bez podmíněných), v pořadí prvního výskytu. */
export function printTotals(
  groups: readonly OverviewPrintGroup[],
): { sheetLabel: string; sheetId: string; copies: number }[] {
  const totals: { sheetLabel: string; sheetId: string; copies: number }[] = [];
  for (const row of groups.flatMap((g) => g.rows)) {
    if (row.condition) continue;
    const total = totals.find((t) => t.sheetId === row.sheetId);
    if (total) total.copies += row.copies;
    else totals.push({ sheetLabel: row.sheetLabel, sheetId: row.sheetId, copies: row.copies });
  }
  return totals.sort((a, b) => a.sheetLabel.localeCompare(b.sheetLabel, 'cs', { numeric: true }));
}
