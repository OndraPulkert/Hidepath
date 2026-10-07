/**
 * Zápis do zápisníku: hodnota jednoho pole (`RecordField`) z kroku lekce, např. naměřená
 * tloušťka kůže nebo zvolená varianta. Přirozený klíč je `projectSlug/fieldId` – id pole je
 * unikátní v projektu, takže každé pole má nejvýš jeden zápis.
 *
 * Záznam má stejný tvar jako ostatní kolekce (id, userId, časy). Zatím je **jen v tomto
 * zařízení**; synchronizaci s účtem (tabulka `lesson_records`) doplní balík synchronizace.
 */
export interface LessonRecordEntry {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; dokud se zápisy nesynchronizují, `null`. */
  userId: string | null;
  projectSlug: string;
  /** Lekce, ve které pole je (pro „Co jsem zjistil“ a odkaz na krok). */
  lessonSlug: string;
  fieldId: string;
  /** Číslo, hodnota volby nebo text; `null` = vymazáno (náhrobek kvůli synchronizaci). */
  value: number | string | null;
  /** Verze obsahu projektu, ve které se zapsalo. */
  contentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export function lessonRecordKey(projectSlug: string, fieldId: string): string {
  return `${projectSlug}/${fieldId}`;
}
