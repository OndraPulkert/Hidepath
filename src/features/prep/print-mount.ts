import {
  type LessonPrint,
  type PatternSheet,
  type PrintMount,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Podklad výtisku (`LessonPrint.mount`): výtisk se nalepí na tenký karton. Text štítku a přehled
 * podkladů k listu na tiskové stránce. Jediný zdroj je `mount` u výtisku v lekci, odsud se skládá
 * text pro „Připravte si“, tiskovou stránku i „Postup v kostce“. Tiskne se vždy na papír.
 */

/** Text štítku bez důvodu. */
export const MOUNT_LABEL = 'Nalepit na tenký karton (krabice od cereálií)';

/**
 * Co je tenký karton a jak výtisk nalepit. Jednou v „Připravte si“ první lekce, která karton
 * potřebuje, a v nápovědě štítku – v textech lekcí se neopakuje.
 */
export const CARDBOARD_NOTE =
  'Tenký karton = krabice od cereálií, čaje nebo sušenek; ne vlnitý karton z přepravních krabic. Výtisk natřete lepidlem v tyčince po celé ploše, nalepte, nechte zaschnout a pak vystřihněte.';

/** Text štítku: podklad a krátce proč („Nalepit na tenký karton (krabice od cereálií) – …“). */
export function mountText(mount: PrintMount): string {
  return `${MOUNT_LABEL} – ${mount.reason}`;
}

/**
 * Slug první lekce (podle pořadí), která má výtisk na kartonu – tam „Připravte si“ vysvětlí, co
 * je tenký karton ({@link CARDBOARD_NOTE}). Bez takové lekce `undefined`.
 */
export function firstCardboardLesson(
  project: Pick<ProjectDefinition, 'lessons'>,
): string | undefined {
  return [...project.lessons]
    .sort((a, b) => a.order - b.order)
    .find((l) => l.prints?.some((p) => p.mount))?.slug;
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
