/**
 * Zaškrtnutá položka „Připravte si“ (vytištěný list, díl z dřívější lekce, materiál).
 * Nástroje se tu neukládají – „Mám“ u nástroje je stav inventáře.
 *
 * `itemKey`: `print:<source>:<sheetId>` (u šablony `print:template`), `req:<id>`,
 * `mat:<slug textu>`. Bez účtu v prohlížeči, s účtem se synchronizuje (`lesson_prep_checks`).
 */
export interface PrepCheckRecord {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; bez účtu `null`. */
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
