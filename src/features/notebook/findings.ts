import {
  type LessonDefinition,
  type LessonStep,
  type ProjectDefinition,
  type RecordField,
  type StepRecall,
} from '@/content/schema';
import { type LessonRecordEntry } from '@/features/notebook/types';
import {
  evaluateTarget,
  formatRecordValue,
  type RecordValue,
  type TargetStatus,
} from '@/features/notebook/values';

/**
 * „Co jsem zjistil“: zápisy ze zápisníku seřazené po lekcích a krocích podle obsahu projektu,
 * a připomínky dřívějších zápisů v pozdějších krocích. Čisté funkce bez Reactu.
 */

type ProjectLike = Pick<ProjectDefinition, 'slug' | 'title' | 'lessons'>;

/** Kde pole zápisníku v obsahu je. `stepIndex` od 0. */
export interface FieldLocation {
  field: RecordField;
  lesson: LessonDefinition;
  step: LessonStep;
  stepIndex: number;
  /** Pořadí pole v kroku (pro řazení). */
  fieldIndex: number;
}

/** Všechna pole zápisníku projektu podle id (id je v projektu unikátní – hlídá schéma). */
export function indexRecordFields(
  project: Pick<ProjectDefinition, 'lessons'>,
): Map<string, FieldLocation> {
  const index = new Map<string, FieldLocation>();
  for (const lesson of project.lessons) {
    lesson.steps.forEach((step, stepIndex) => {
      (step.records ?? []).forEach((field, fieldIndex) => {
        index.set(field.id, { field, lesson, step, stepIndex, fieldIndex });
      });
    });
  }
  return index;
}

/** Má projekt v obsahu aspoň jedno pole zápisníku? */
export function projectHasRecordFields(project: Pick<ProjectDefinition, 'lessons'>): boolean {
  return project.lessons.some((l) => l.steps.some((s) => (s.records?.length ?? 0) > 0));
}

/**
 * Poslední zápis každého pole projektu (podle `updatedAt`). Přirozený klíč je
 * projekt/pole, takže zápis bývá jeden; nejnovější vyhraje i po nepovedeném sloučení.
 */
export function latestEntriesByField(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): Map<string, LessonRecordEntry> {
  const latest = new Map<string, LessonRecordEntry>();
  for (const entry of entries) {
    if (entry.projectSlug !== projectSlug) continue;
    const prev = latest.get(entry.fieldId);
    if (!prev || entry.updatedAt > prev.updatedAt) latest.set(entry.fieldId, entry);
  }
  return latest;
}

export interface Finding {
  fieldId: string;
  label: string;
  value: RecordValue;
  /** Hodnota k zobrazení, např. „0,85 mm“. */
  display: string;
  target: TargetStatus;
  /** Popisek cíle z obsahu („cíl 50 mm“), jen u polí s cílem. */
  targetLabel: string | null;
  stepId: string;
  stepTitle: string;
  /** Číslo kroku od 1 (jako v lekci). */
  stepNumber: number;
  updatedAt: string;
}

export interface LessonFindings {
  lessonSlug: string;
  lessonOrder: number;
  lessonTitle: string;
  items: Finding[];
}

/**
 * Zápisy projektu po lekcích (v pořadí lekcí, kroků a polí v kroku). Vynechá vymazané zápisy
 * (`null`), zápisy polí, která v obsahu už nejsou, a hodnoty, které k poli nepasují.
 * Lekce bez zápisu ve výsledku nejsou.
 */
export function buildProjectFindings(
  project: ProjectLike,
  entries: readonly LessonRecordEntry[],
): LessonFindings[] {
  const fields = indexRecordFields(project);
  const latest = latestEntriesByField(entries, project.slug);
  const byLesson = new Map<string, { loc: FieldLocation; finding: Finding }[]>();
  for (const [fieldId, entry] of latest) {
    const loc = fields.get(fieldId);
    if (!loc) continue;
    const display = formatRecordValue(loc.field, entry.value);
    if (display === null) continue;
    const finding: Finding = {
      fieldId,
      label: loc.field.label,
      value: entry.value,
      display,
      target: evaluateTarget(loc.field, entry.value),
      targetLabel: loc.field.kind === 'number' ? (loc.field.target?.label ?? null) : null,
      stepId: loc.step.id,
      stepTitle: loc.step.title,
      stepNumber: loc.stepIndex + 1,
      updatedAt: entry.updatedAt,
    };
    const list = byLesson.get(loc.lesson.slug) ?? [];
    list.push({ loc, finding });
    byLesson.set(loc.lesson.slug, list);
  }
  return [...project.lessons]
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson) => {
      const list = byLesson.get(lesson.slug);
      if (!list) return [];
      list.sort((a, b) => a.loc.stepIndex - b.loc.stepIndex || a.loc.fieldIndex - b.loc.fieldIndex);
      return [
        {
          lessonSlug: lesson.slug,
          lessonOrder: lesson.order,
          lessonTitle: lesson.title,
          items: list.map((x) => x.finding),
        },
      ];
    });
}

/** Kolik zápisů je ve „Co jsem zjistil“ celkem. */
export function countFindings(findings: readonly LessonFindings[]): number {
  return findings.reduce((n, l) => n + l.items.length, 0);
}

/**
 * Zápisy jako prostý text ke zkopírování (stejně jako poznámky od ponku). Prázdný řetězec,
 * když zápis žádný není.
 */
export function formatFindingsText(
  project: Pick<ProjectDefinition, 'title'>,
  findings: readonly LessonFindings[],
  now: Date = new Date(),
): string {
  if (countFindings(findings) === 0) return '';
  const sections = findings.map((lesson) => {
    const lines = lesson.items.map((f) => {
      const warn =
        f.target === 'warn' ? ` (mimo cíl${f.targetLabel ? `: ${f.targetLabel}` : ''})` : '';
      return `- ${f.label}: ${f.display}${warn} – krok ${f.stepNumber}`;
    });
    return [`${String(lesson.lessonOrder).padStart(2, '0')} ${lesson.lessonTitle}`, ...lines].join(
      '\n',
    );
  });
  // Místní datum (ne UTC – po půlnoci by jinak vyšel včerejšek).
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return [`Co jsem zjistil – ${project.title} (${date})`, ...sections].join('\n\n');
}

export type RecallResolution =
  | {
      status: 'recorded';
      recall: StepRecall;
      location: FieldLocation;
      display: string;
      target: TargetStatus;
    }
  | { status: 'missing'; recall: StepRecall; location: FieldLocation }
  | { status: 'unknown'; recall: StepRecall };

/**
 * Připomínka dřívějšího zápisu: zapsaná hodnota, nebo „zatím nezapsáno“ s místem, kde se
 * zapisuje. `unknown`, když pole v obsahu není (schéma to u platného obsahu nepustí).
 */
export function resolveRecall(
  project: ProjectLike,
  recall: StepRecall,
  entries: readonly LessonRecordEntry[],
  fields: Map<string, FieldLocation> = indexRecordFields(project),
): RecallResolution {
  const location = fields.get(recall.fieldId);
  if (!location) return { status: 'unknown', recall };
  const entry = latestEntriesByField(entries, project.slug).get(recall.fieldId);
  const display = entry ? formatRecordValue(location.field, entry.value) : null;
  if (!entry || display === null) return { status: 'missing', recall, location };
  return {
    status: 'recorded',
    recall,
    location,
    display,
    target: evaluateTarget(location.field, entry.value),
  };
}
