import {
  type LessonPrint,
  type PatternSheet,
  type PrintMount,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Tužší podklad výtisku (`LessonPrint.mount`): text štítku a přehled podkladů k listu na tiskové
 * stránce. Jediný zdroj je `mount` u výtisku v lekci, odsud se skládá text pro „Připravte si“,
 * tiskovou stránku i „Postup v kostce“.
 */

const MATERIAL_ACCUSATIVE: Record<PrintMount['material'], string> = {
  lepenka: 'tenkou lepenku',
  ctvrtka: 'čtvrtku',
  'tvrdy-papir': 'tvrdý papír',
};

const METHOD_VERB: Record<PrintMount['method'], string> = {
  nalepit: 'Nalepit na',
  tisknout: 'Tisknout na',
};

/** „Nalepit na tenkou lepenku“, „Tisknout na čtvrtku“. */
export function mountLabel(mount: PrintMount): string {
  return `${METHOD_VERB[mount.method]} ${MATERIAL_ACCUSATIVE[mount.material]}`;
}

/** Text štítku: podklad a krátce proč („Nalepit na tenkou lepenku – podle ní…“). */
export function mountText(mount: PrintMount): string {
  return mount.reason ? `${mountLabel(mount)} – ${mount.reason}` : mountLabel(mount);
}

export interface SheetMountUse {
  lessonOrder: number;
  copies: number;
  purpose: string;
  condition?: string;
}

export interface SheetMountGroup {
  /** Text štítku ({@link mountText}). */
  text: string;
  /** Výtisky lekcí s tímto podkladem, v pořadí lekcí. */
  uses: SheetMountUse[];
}

export interface SheetMounts {
  groups: SheetMountGroup[];
  /** List se v jiné lekci (nebo jiným výtiskem) tiskne i na obyčejný papír. */
  plainToo: boolean;
}

type MountProject = Pick<ProjectDefinition, 'lessons'>;
type SheetSource = Exclude<LessonPrint['source'], 'template'>;

/**
 * Podklady výtisků jednoho listu ze všech lekcí, seskupené podle textu štítku. Varianta listu
 * (`variantOf`) přebírá podklady výchozího listu. Bez podloženého výtisku `null`.
 */
export function sheetMounts(
  project: MountProject,
  source: SheetSource,
  sheet: Pick<PatternSheet, 'id' | 'variantOf'>,
): SheetMounts | null {
  const sheetId = sheet.variantOf ?? sheet.id;
  const prints = [...project.lessons]
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson) =>
      (lesson.prints ?? [])
        .filter((p) => p.source === source && p.sheetId === sheetId)
        .map((print) => ({ lessonOrder: lesson.order, print })),
    );
  const groups: SheetMountGroup[] = [];
  for (const { lessonOrder, print } of prints) {
    if (!print.mount) continue;
    const text = mountText(print.mount);
    const use: SheetMountUse = {
      lessonOrder,
      copies: print.copies,
      purpose: print.purpose,
      ...(print.condition ? { condition: print.condition } : {}),
    };
    const group = groups.find((g) => g.text === text);
    if (group) group.uses.push(use);
    else groups.push({ text, uses: [use] });
  }
  if (groups.length === 0) return null;
  return { groups, plainToo: prints.some((p) => !p.print.mount) };
}
