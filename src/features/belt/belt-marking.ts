import {
  BELT_PLATE_CHECK,
  BELT_PLATE_CHECK_ID,
  LEGACY_BELT_MARKING,
  LEGACY_BELT_MARKING_ID,
} from '@/content/projects';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type BeltConfigResult } from '@/lib/patterns/belt-config';

/**
 * Čím se značí (destička, nebo listy): odvozené z výsledku kontroly destičky (lekce 1) a z tabulky
 * „Váš pásek“ (aktivní pásek). Nic dalšího se nezapisuje. Čisté funkce bez Reactu.
 */

/** Výsledek kontroly destičky; `null` = zatím nezapsaný. */
export type PlateCheck = 'ok' | 'deviation' | null;

/**
 * Kontrola destičky ze zápisníku. Starý zápis „Čím budete značit: jen listy“ bez zapsané kontroly
 * se čte jako odchylka destičky (zápisy se nemažou).
 */
export function plateCheckFromRecords(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): PlateCheck {
  const latest = latestEntriesByField(entries, projectSlug);
  const check = latest.get(BELT_PLATE_CHECK_ID)?.value;
  if (check === BELT_PLATE_CHECK.ok) return 'ok';
  if (check === BELT_PLATE_CHECK.deviation) return 'deviation';
  const legacy = latest.get(LEGACY_BELT_MARKING_ID)?.value;
  return legacy === LEGACY_BELT_MARKING.sheets ? 'deviation' : null;
}

/**
 * Čím značit kterou řadu, česky, např. „řada 3 destičkou · řada 1 list 2“. `null`, když pásek
 * nejde spočítat (tabulka neví, co destička pokryje).
 */
export function beltMarking(plate: PlateCheck, result: BeltConfigResult | null): string | null {
  if (plate === 'deviation') return 'jen listy 1 a 2 (destička neprošla kontrolou)';
  if (!result) return null;
  const [buckle, end] = result.plate.rows;
  const endSheet = result.sheets.printable ? 'list 2' : 'čísla z tabulky (list 2 se na A4 nevejde)';
  const rows = `řada 3 ${buckle.ok ? 'destičkou' : 'list 1'} · řada ${end.row} ${end.ok ? 'destičkou' : endSheet}`;
  return plate === null && (buckle.ok || end.ok)
    ? `${rows} – destičku nejdřív zkontrolujte (lekce 1)`
    : rows;
}
