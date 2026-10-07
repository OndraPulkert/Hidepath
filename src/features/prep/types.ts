/**
 * Zaškrtnutá položka „Připravte si“ (vytištěný list, díl z dřívější lekce, materiál).
 * Nástroje se tu neukládají – „Mám“ u nástroje je stav inventáře.
 *
 * `itemKey`: `print:<source>:<sheetId>` (u šablony `print:template`), `req:<id>`,
 * `mat:<slug textu>`. Zatím **jen v tomto zařízení**; synchronizaci s účtem
 * (tabulka `lesson_prep_checks`) doplní balík synchronizace.
 */
export interface PrepCheckRecord {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; dokud se příprava nesynchronizuje, `null`. */
  userId: string | null;
  projectSlug: string;
  lessonSlug: string;
  itemKey: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export function prepCheckKey(projectSlug: string, lessonSlug: string, itemKey: string): string {
  return `${projectSlug}/${lessonSlug}/${itemKey}`;
}
