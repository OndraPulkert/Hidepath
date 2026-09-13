/**
 * Poznámka od ponku k jedné lekci: „kde jsem se zasekl, co příště změním“.
 *
 * Je to nástroj na sběr toho, co portál nejvíc potřebuje – seznam míst, kde skutečný
 * začátečník při výrobě tápe. Z něj se odvíjí dělení lekcí, pomoc „nedaří se mi“
 * i to, které záběry natočit. Bez pole přímo v lekci ten seznam skončí na papírku
 * vedle lepidla.
 *
 * Záznam má stejný tvar jako ostatní kolekce (id, userId, časy), aby šel v Milníku 4
 * beze změny zařadit do synchronizace. Do té doby je **jen v tomto zařízení**;
 * ven ho dostane export do schránky.
 */
export interface LessonNoteRecord {
  /** UUID generované klientem. */
  id: string;
  /** Vlastník; dokud se poznámky nesynchronizují, `null`. */
  userId: string | null;
  projectSlug: string;
  lessonSlug: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export function lessonNoteKey(projectSlug: string, lessonSlug: string): string {
  return `${projectSlug}/${lessonSlug}`;
}
