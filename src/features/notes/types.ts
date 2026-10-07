import { nextUpdatedAt } from '@/features/sync/merge';

/**
 * Poznámka od ponku k jedné lekci: „kde jsem se zasekl, co příště změním“.
 *
 * Je to nástroj na sběr toho, co portál nejvíc potřebuje – seznam míst, kde skutečný
 * začátečník při výrobě tápe. Z něj se odvíjí dělení lekcí, pomoc „nedaří se mi“
 * i to, které záběry natočit. Bez pole přímo v lekci ten seznam skončí na papírku
 * vedle lepidla.
 *
 * Bez účtu je jen v tomto prohlížeči; s účtem se ukládá lokálně a synchronizuje
 * (tabulka `lesson_notes`). Ven ji dostane i export do schránky.
 */
export interface LessonNoteRecord {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; bez účtu `null`. */
  userId: string | null;
  projectSlug: string;
  lessonSlug: string;
  /** Prázdný text = vymazaná poznámka (náhrobek, aby se při synchronizaci nevrátila). */
  text: string;
  createdAt: string;
  updatedAt: string;
}

/** Nejdelší poznámka ve znacích; stejný limit hlídá databáze (`lesson_notes_text_size`). */
export const LESSON_NOTE_MAX_LENGTH = 4000;

export function lessonNoteKey(projectSlug: string, lessonSlug: string): string {
  return `${projectSlug}/${lessonSlug}`;
}

/** Ořízne text na limit poznámky (po znacích, nerozdělí emoji ani diakritiku). */
export function clampNoteText(text: string): string {
  const chars = Array.from(text);
  return chars.length <= LESSON_NOTE_MAX_LENGTH
    ? text
    : chars.slice(0, LESSON_NOTE_MAX_LENGTH).join('');
}

/**
 * Úplný záznam poznámky nad existujícím (idempotentně podle projektu a lekce: zůstává id,
 * userId i createdAt). Vymazání je prázdný text, ne smazání řádku. `null` = nic se nemění
 * (vymazat nezapsanou poznámku, zapsat totéž). `updatedAt` je vždy pozdější než známý stav.
 */
export function buildLessonNote(
  existing: LessonNoteRecord | undefined,
  input: { projectSlug: string; lessonSlug: string; text: string },
  id: string,
  now: string,
): LessonNoteRecord | null {
  const text = input.text.trim().length === 0 ? '' : clampNoteText(input.text);
  if (text === (existing?.text ?? '')) return null;
  return {
    id: existing?.id ?? id,
    userId: existing?.userId ?? null,
    projectSlug: input.projectSlug,
    lessonSlug: input.lessonSlug,
    text,
    createdAt: existing?.createdAt ?? now,
    updatedAt: nextUpdatedAt(existing?.updatedAt, Date.parse(now)),
  };
}

/**
 * Poznámka z prohlížeče se přenáší do účtu, který už k téže lekci poznámku má (např. z jiného
 * zařízení). Nic se neztratí: obsahuje-li jeden text druhý, platí delší, jinak se spojí
 * (účet, prázdný řádek, prohlížeč). `null` = účet už vše má. Razítko je po stavu účtu.
 */
export function mergeNoteForMigration(
  device: LessonNoteRecord,
  account: LessonNoteRecord,
  now: string,
): LessonNoteRecord | null {
  const fromDevice = device.text.trim();
  const inAccount = account.text.trim();
  if (fromDevice.length === 0 || inAccount.includes(fromDevice)) return null;
  const text =
    inAccount.length === 0 || fromDevice.includes(inAccount)
      ? device.text
      : `${account.text.trimEnd()}\n\n${device.text.trim()}`;
  const latest = Math.max(Date.parse(now), Date.parse(device.updatedAt) || 0);
  return {
    ...account,
    text: clampNoteText(text),
    updatedAt: nextUpdatedAt(account.updatedAt, latest),
  };
}
