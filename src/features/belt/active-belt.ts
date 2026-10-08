import { BELT_ACTIVE_FIELD_ID } from '@/content/projects';
import { type BeltRecallKey, type ProjectDefinition } from '@/content/schema';
import {
  type BeltConfigPrefill,
  type LegacyBeltOffer,
  legacyBeltOffer,
  newerLegacyPrefill,
} from '@/features/belt/belt-prefill';
import { SCRAP_ALLOWANCE_CM } from '@/features/belt/belt-purchase';
import {
  type SavedBelt,
  type SavedBeltExtras,
  savedBeltsFromRecords,
} from '@/features/belt/saved-belts';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { formatDecimal } from '@/features/notebook/values';
import {
  BELT_TIP_LABELS,
  type BeltConfigInput,
  type BeltConfigOutcome,
  type BeltConfigResult,
  DEFAULT_HOLE_DIAMETER_MM,
  type WaistSource,
  deriveBeltConfig,
} from '@/lib/patterns/belt-config';
import { STRAP_COLOR_LABELS } from '@/lib/patterns/belt-strap-offers';

/**
 * Aktivní pásek: jediný zdroj parametrů pásku pro lekce, „Připravte si“, „Co koupit“
 * a rozpočet. Pravidlo: zvolený pásek (zápis `belt-active`), jinak naposledy uložený, jinak
 * staré zápisy lekce 1, dokud je uživatel neuloží jako pásek. Čisté funkce bez Reactu.
 */

/** Projekt, jehož pásek se zadává ve „Váš pásek“ (`browserGenerator: 'belt-config'`). */
export const isBeltConfigProject = (project: Pick<ProjectDefinition, 'patternSheets'>): boolean =>
  project.patternSheets?.browserGenerator === 'belt-config';

export interface ActiveBelt extends SavedBeltExtras {
  /** `saved` = uložený pásek; `notebook` = staré zápisy lekce 1, ještě neuložené. */
  source: 'saved' | 'notebook';
  /** Id pole uloženého pásku; u `notebook` `null`. */
  fieldId: string | null;
  name: string;
  input: BeltConfigInput;
  waistSource: WaistSource;
}

export interface ActiveBeltState {
  /** Uložené pásky (bez smazaných), podle názvu. */
  belts: SavedBelt[];
  active: ActiveBelt | null;
  /** Staré zápisy k převodu na uložený pásek (jen když žádný uložený není). */
  legacy: LegacyBeltOffer | null;
  /**
   * Zápisy lekce 1 novější než aktivní uložený pásek (např. tloušťka změřená po dodání):
   * „Váš pásek“ je doplní do formuláře k uložení. Jen u uloženého pásku.
   */
  newerLegacy: (BeltConfigPrefill & { prongMm?: number }) | null;
}

const fromSaved = (b: SavedBelt): ActiveBelt => ({
  source: 'saved',
  fieldId: b.fieldId,
  name: b.name,
  input: b.input,
  waistSource: b.waistSource,
  ...(b.prongMm !== undefined ? { prongMm: b.prongMm } : {}),
  ...(b.scrapFromStrap ? { scrapFromStrap: true } : {}),
});

/** Id zvoleného pásku ze zápisu `belt-active` (bez ověření, že pásek existuje). */
export function chosenBeltFieldId(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): string | null {
  const value = latestEntriesByField(entries, projectSlug).get(BELT_ACTIVE_FIELD_ID)?.value;
  return typeof value === 'string' && value !== '' ? value : null;
}

/** Aktivní pásek podle pravidla nahoře a k tomu seznam pásků a nabídka převodu. */
export function resolveActiveBelt(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): ActiveBeltState {
  const belts = savedBeltsFromRecords(entries, projectSlug);
  const chosenId = chosenBeltFieldId(entries, projectSlug);
  const chosen = belts.find((b) => b.fieldId === chosenId);
  const newest = [...belts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const saved = chosen ?? newest;
  if (saved) {
    return {
      belts,
      active: fromSaved(saved),
      legacy: null,
      newerLegacy: newerLegacyPrefill(entries, projectSlug, saved),
    };
  }
  const legacy = legacyBeltOffer(entries, projectSlug);
  const active: ActiveBelt | null = legacy?.input
    ? {
        source: 'notebook',
        fieldId: null,
        name: legacy.name,
        input: legacy.input,
        waistSource: legacy.waistSource,
        ...(legacy.prongMm !== undefined ? { prongMm: legacy.prongMm } : {}),
      }
    : null;
  return { belts, active, legacy, newerLegacy: null };
}

/** Aktivní pásek a jeho výpočet (nebo co v něm neplatí). */
export function activeBeltOutcome(active: ActiveBelt | null): BeltConfigOutcome | null {
  return active ? deriveBeltConfig(active.input) : null;
}

/** Jedna hodnota aktivního pásku k zobrazení (souhrn v lekci, připomínka v kroku). */
export interface BeltFact {
  key: BeltRecallKey;
  label: string;
  /** `null` = hodnota chybí (obvod nezadaný, pásek nejde spočítat). */
  value: string | null;
}

const mm = (v: number) => `${formatDecimal(v)} mm`;

/**
 * Hodnota aktivního pásku pro klíč `key`. Zadání (šířka, obvod…) je vždy; spočítaná čísla
 * (délka pásu, poutko…) jen s platným výpočtem `result`.
 */
export function beltFact(
  key: BeltRecallKey,
  active: ActiveBelt,
  result: BeltConfigResult | null,
): BeltFact {
  const { input } = active;
  switch (key) {
    case 'waist':
      return {
        key,
        label: 'Obvod',
        value: input.waistMm === undefined ? null : `${formatDecimal(input.waistMm / 10)} cm`,
      };
    case 'width':
      return { key, label: 'Šířka = přezka', value: mm(input.widthMm) };
    case 'thickness':
      return { key, label: 'Tloušťka pásu', value: mm(input.thicknessMm) };
    case 'tip':
      return { key, label: 'Konec', value: BELT_TIP_LABELS[input.tip] };
    case 'color':
      return { key, label: 'Barva pásu', value: STRAP_COLOR_LABELS[input.color ?? 'prirodni'] };
    case 'holeDiameter': {
      const d = input.holeDiameterMm ?? DEFAULT_HOLE_DIAMETER_MM;
      const prong = active.prongMm === undefined ? '' : ` (trn ${mm(active.prongMm)})`;
      return { key, label: 'Ø dírek pro trn', value: `${mm(d)}${prong}` };
    }
    case 'strapLength': {
      const min = result?.strap.minLengthCm ?? null;
      const scrap = active.scrapFromStrap ? ` + ${SCRAP_ALLOWANCE_CM} cm na odřezek` : '';
      return { key, label: 'Pás', value: min === null ? null : `aspoň ${min} cm${scrap}` };
    }
    case 'keeper':
      return {
        key,
        label: 'Poutko',
        value: result
          ? `${formatDecimal(result.keeper.lengthMm)} × ${mm(result.keeper.widthMm)}`
          : null,
      };
    case 'rivet': {
      if (!result) return { key, label: 'Šrouby chicago', value: null };
      const { rivet } = result;
      const range = `${formatDecimal(rivet.minMm)}–${mm(rivet.maxMm)}`;
      return {
        key,
        label: 'Šrouby chicago',
        value:
          rivet.postMm === null
            ? `2 ks, dřík ${range} (ověřte u prodejce)`
            : `2 ks, dřík ${mm(rivet.postMm)} (rozsah ${range}${rivet.verified === null ? ', ověřte u prodejce' : ''})`,
      };
    }
    case 'holes':
      return {
        key,
        label: 'Dírky od konce',
        value: result
          ? `${result.holes.fromApexMm.map((v) => formatDecimal(v)).join(' / ')} mm · ${result.holes.count} × Ø ${mm(result.holes.diameterMm)}`
          : null,
      };
    case 'middleHole':
      return {
        key,
        label: 'Prostřední dírka od konce',
        value: result ? mm(result.holes.middleFromApexMm) : null,
      };
  }
}

/** Co ukáže souhrn „Aktivní pásek“ v lekci. */
export const ACTIVE_BELT_SUMMARY_KEYS: readonly BeltRecallKey[] = [
  'waist',
  'strapLength',
  'keeper',
  'rivet',
  'holes',
];
