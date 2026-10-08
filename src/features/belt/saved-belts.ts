import { z } from 'zod';

import { BELT_CONFIG_FIELD_PREFIX } from '@/content/projects';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { type BeltConfigInput, type WaistSource } from '@/lib/patterns/belt-config';

/**
 * „Moje pásky“: pojmenované sestavy pásku. Každá je jeden zápis zápisníku s id
 * `belt-config-<uuid>` a hodnotou JSON. Zápisník se synchronizuje s účtem (lokál + outbox),
 * takže pásky jsou i v dalším zařízení – bez nové tabulky a migrace. Smazání = náhrobek
 * (`value: null`), stejně jako u ostatních polí. Čisté funkce bez Reactu.
 */

/** Nejdelší název; JSON se musí vejít do 2000 znaků (`lesson_records_value_size`). */
export const SAVED_BELT_NAME_MAX = 60;

export interface SavedBelt {
  /** Id pole zápisníku (`belt-config-<uuid>`). */
  fieldId: string;
  name: string;
  input: BeltConfigInput;
  waistSource: WaistSource;
  updatedAt: string;
}

const optionalNumber = z.number().optional();

const savedBeltValueSchema = z.object({
  v: z.literal(1),
  name: z.string().trim().min(1).max(SAVED_BELT_NAME_MAX),
  widthMm: z.number(),
  thicknessMm: z.number(),
  waistMm: optionalNumber,
  tip: z.enum(['hrot', 'zaobleny']),
  holeCount: optionalNumber,
  holeSpacingMm: optionalNumber,
  apexToFirstHoleMm: optionalNumber,
  holeDiameterMm: optionalNumber,
  waistSource: z.enum(['pasek', 'metr']),
});

/** Je to id pole uloženého pásku? */
export function isSavedBeltFieldId(fieldId: string): boolean {
  return fieldId.startsWith(BELT_CONFIG_FIELD_PREFIX);
}

/** Nové id pole pro další pásek. UUID je malými písmeny, takže projde kontrolou slugu. */
export function newSavedBeltFieldId(uuid: string = crypto.randomUUID()): string {
  return `${BELT_CONFIG_FIELD_PREFIX}${uuid.toLowerCase()}`;
}

/** Hodnota zápisu (JSON). Vynechá pole bez hodnoty. */
export function serializeSavedBelt(
  name: string,
  input: BeltConfigInput,
  waistSource: WaistSource,
): string {
  const value: z.input<typeof savedBeltValueSchema> = {
    v: 1,
    name: name.trim(),
    widthMm: input.widthMm,
    thicknessMm: input.thicknessMm,
    tip: input.tip,
    waistSource,
    ...(input.waistMm !== undefined ? { waistMm: input.waistMm } : {}),
    ...(input.holeCount !== undefined ? { holeCount: input.holeCount } : {}),
    ...(input.holeSpacingMm !== undefined ? { holeSpacingMm: input.holeSpacingMm } : {}),
    ...(input.apexToFirstHoleMm !== undefined
      ? { apexToFirstHoleMm: input.apexToFirstHoleMm }
      : {}),
    ...(input.holeDiameterMm !== undefined ? { holeDiameterMm: input.holeDiameterMm } : {}),
  };
  return JSON.stringify(value);
}

/** Přečte hodnotu zápisu; `null`, když to uložený pásek není nebo je poškozený. */
export function parseSavedBeltValue(raw: unknown): Omit<SavedBelt, 'fieldId' | 'updatedAt'> | null {
  if (typeof raw !== 'string') return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = savedBeltValueSchema.safeParse(json);
  if (!parsed.success) return null;
  const { name, waistSource, v: _v, ...input } = parsed.data;
  return { name, waistSource, input };
}

/** Uložené pásky projektu (bez smazaných), seřazené podle názvu. */
export function savedBeltsFromRecords(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): SavedBelt[] {
  const belts: SavedBelt[] = [];
  for (const [fieldId, entry] of latestEntriesByField(entries, projectSlug)) {
    if (!isSavedBeltFieldId(fieldId)) continue;
    const value = parseSavedBeltValue(entry.value);
    if (!value) continue;
    belts.push({ fieldId, updatedAt: entry.updatedAt, ...value });
  }
  return belts.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
}

/** Kontrola názvu před uložením; `null` = v pořádku. */
export function savedBeltNameProblem(name: string): string | null {
  const t = name.trim();
  if (t === '') return 'Zadejte název pásku, např. „Hnědý 40 mm do džínů“.';
  if (t.length > SAVED_BELT_NAME_MAX) return `Název nejvýš ${SAVED_BELT_NAME_MAX} znaků.`;
  return null;
}
