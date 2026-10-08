import { LEGACY_BELT_RECORD_IDS, BELT_TIP_CHOICES } from '@/content/projects';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { formatDecimal } from '@/features/notebook/values';
import {
  type SavedBelt,
  type SavedBeltExtras,
  savedBeltsFromRecords,
} from '@/features/belt/saved-belts';
import {
  type BeltConfigForm,
  type BeltConfigInput,
  type BeltTip,
  BELT_LIMITS,
  DEFAULT_BELT_FORM,
  type WaistSource,
  beltConfigToForm,
  parseBeltConfigForm,
} from '@/lib/patterns/belt-config';
import { isStrapColor } from '@/lib/patterns/belt-strap-offers';

/**
 * Předvyplnění formuláře „Váš pásek“. Jediný zdroj parametrů pásku je uložený pásek; tady je
 * jen pomůcka trn → Ø dírek a převod starých zápisů lekce 1 (šířka, tloušťka, obvod…) na
 * uložený pásek, aby se nic neztratilo. Čisté funkce bez Reactu.
 */

export interface BeltConfigPrefill {
  /** Formulář s hodnotami; co chybí, zůstává výchozí. */
  form: BeltConfigForm;
  /** Co se předvyplnilo, česky a v pořadí formuláře. */
  filled: string[];
  /** Co v zápisech nejde použít (např. trn moc silný na výsečníky), česky. */
  problems: string[];
}

/** Přídavek k trnu na Ø dírky (docs/zadani/opasek-postup.md: „trn u kořene + 0,5 mm“). */
export const PRONG_CLEARANCE_MM = 0.5;

/** Ø dírky pro trn: trn + 0,5 mm nahoru na výsečník po 0,5 mm, nejméně nejmenší výsečník. */
export interface ProngPunch {
  /** Ø výsečníku, mm. */
  punchMm: number;
  /** Jak se k číslu došlo, česky (do poznámky u pole). */
  how: string;
  /** Trn je na výsečníky moc silný; jinak `null`. */
  problem: string | null;
}

/**
 * Výsečníky jsou po 0,5 mm (meze formuláře): trn + 0,5 mm zaokrouhlit nahoru, ať dírka není
 * těsnější, než pravidlo chce (trn 4,2 → 4,7 → výsečník 5 mm). Pravidlo dává nejmenší dírku,
 * takže u tenkého trnu (≤ 3,5 mm) poslouží nejmenší výsečník 4,5 mm.
 */
export function punchForProngMm(prongMm: number): ProngPunch {
  const { min, max, step } = BELT_LIMITS.holeDiameterMm;
  const wanted = prongMm + PRONG_CLEARANCE_MM;
  const rounded = Math.ceil(wanted / step - 1e-9) * step;
  const punchMm = Math.max(min, rounded);
  const how =
    punchMm > rounded + 1e-9
      ? `trn + 0,5 mm, nejmenší výsečník ${formatDecimal(min)} mm`
      : Math.abs(punchMm - wanted) < 1e-9
        ? 'trn + 0,5 mm'
        : 'trn + 0,5 mm, nahoru na výsečník po 0,5 mm';
  const problem =
    punchMm > max + 1e-9
      ? `Trn ${formatDecimal(prongMm)} mm je na výsečníky ${formatDecimal(min)}–${formatDecimal(max)} mm moc silný (potřeba Ø ${formatDecimal(punchMm)} mm). Zkontrolujte měření trnu, nebo zvolte jinou přezku.`
      : null;
  return { punchMm, how, problem };
}

const isTip = (v: unknown): v is BeltTip =>
  v === BELT_TIP_CHOICES.hrot || v === BELT_TIP_CHOICES.zaobleny;

/**
 * Starší zápisy lekce 1 (šířka, tloušťka, obvod, konec, barva, trn) jako formulář „Váš pásek“.
 * `base` = formulář, do kterého se zápisy doplní (jinak výchozí); `since` = jen zápisy novější
 * než tento čas. `null`, když v zápisníku nic z toho není.
 */
export function legacyBeltPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  { base = DEFAULT_BELT_FORM, since }: { base?: BeltConfigForm; since?: string } = {},
): (BeltConfigPrefill & { prongMm?: number }) | null {
  const latest = latestEntriesByField(entries, projectSlug);
  const value = (fieldId: string) => {
    const entry = latest.get(fieldId);
    return entry && (since === undefined || entry.updatedAt > since) ? entry.value : undefined;
  };
  const num = (fieldId: string): number | undefined => {
    const v = value(fieldId);
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  };
  const ids = LEGACY_BELT_RECORD_IDS;
  const form: BeltConfigForm = { ...base };
  const filled: string[] = [];

  const width = num(ids.width);
  if (width !== undefined) {
    form.width = formatDecimal(width);
    filled.push('šířka');
  }
  const thickness = num(ids.thickness);
  if (thickness !== undefined) {
    form.thickness = formatDecimal(thickness);
    filled.push('tloušťka');
  }
  const waist = num(ids.waist);
  if (waist !== undefined) {
    form.waist = formatDecimal(waist);
    filled.push('obvod');
  }
  const tip = value(ids.tip);
  if (isTip(tip)) {
    form.tip = tip;
    filled.push('konec');
  }
  const color = value(ids.color);
  if (isStrapColor(color)) {
    form.color = color;
    filled.push('barva');
  }
  const problems: string[] = [];
  const prong = num(ids.prong);
  if (prong !== undefined) {
    const punch = punchForProngMm(prong);
    form.holeDiameter = formatDecimal(punch.punchMm);
    filled.push(`Ø dírky (${punch.how})`);
    if (punch.problem) problems.push(punch.problem);
  }
  if (filled.length === 0) return null;
  return { form, filled, problems, ...(prong !== undefined ? { prongMm: prong } : {}) };
}

/** Název pásku převedeného ze starých zápisů. */
export const LEGACY_BELT_NAME = 'Pásek ze zápisníku';

/** Pásek ze starých zápisů lekce 1, který se nabídne k uložení. */
export interface LegacyBeltOffer extends BeltConfigPrefill, SavedBeltExtras {
  name: string;
  waistSource: WaistSource;
  /** Zadání, když se z hodnot dá spočítat; jinak `null` (formulář ukáže, co opravit). */
  input: BeltConfigInput | null;
}

/**
 * Převod starých dat: zápisník má hodnoty z lekce 1, ale žádný uložený pásek. Pak se nabídne
 * uložit je jako pásek (jednou: jakmile je uložený nějaký pásek, nabídka zmizí). Do té doby
 * z nich počítá i nákup a lekce, ať se nic neztratí. `null` = není co převádět.
 */
export function legacyBeltOffer(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LegacyBeltOffer | null {
  if (savedBeltsFromRecords(entries, projectSlug).length > 0) return null;
  const prefill = legacyBeltPrefill(entries, projectSlug);
  if (!prefill) return null;
  const parsed = parseBeltConfigForm(prefill.form);
  const input = 'input' in parsed && prefill.problems.length === 0 ? parsed.input : null;
  return { ...prefill, name: LEGACY_BELT_NAME, waistSource: 'pasek', input };
}

/**
 * Zápisy lekce 1 novější než uložený pásek (např. tloušťka a trn změřené po dodání, když byl
 * pásek uložený dřív): doplněné do formuláře toho pásku, ať se neztratí. Zmizí, jakmile se
 * pásek znovu uloží. `null` = nic novějšího.
 */
export function newerLegacyPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  belt: Pick<SavedBelt, 'input' | 'waistSource' | 'updatedAt'>,
): (BeltConfigPrefill & { prongMm?: number }) | null {
  return legacyBeltPrefill(entries, projectSlug, {
    base: beltConfigToForm(belt.input, belt.waistSource),
    since: belt.updatedAt,
  });
}

/** Výchozí stav formuláře „Váš pásek“. */
export interface BeltFormInitial {
  form: BeltConfigForm;
  /** Trn přezky u kořene (pomůcka pro Ø dírek), jak se zobrazí v poli. */
  prong: string;
  scrapFromStrap: boolean;
  /** Načtený uložený pásek: „Uložit“ ho přepíše. */
  loadedFieldId: string | null;
  /** Název do pole „Název pásku“. */
  name: string;
  /** Předvyplněno ze starých zápisů lekce 1: co a co v nich neplatí. */
  legacy: { filled: string[]; problems: string[] } | null;
}

/**
 * Formulář „Váš pásek“ podle aktivního pásku (jediný zdroj); bez uloženého pásku ze starých
 * zápisů lekce 1 s nabídkou je uložit. `null` = výchozí formulář.
 */
export function beltFormInitial(state: {
  active: {
    source: 'saved' | 'notebook';
    fieldId: string | null;
    name: string;
    input: BeltConfigInput;
    waistSource: WaistSource;
    prongMm?: number | undefined;
    scrapFromStrap?: boolean | undefined;
  } | null;
  legacy: LegacyBeltOffer | null;
  /** Zápisy lekce 1 novější než aktivní uložený pásek (`newerLegacyPrefill`). */
  newerLegacy?: (BeltConfigPrefill & { prongMm?: number }) | null | undefined;
}): BeltFormInitial | null {
  const { active, legacy, newerLegacy } = state;
  if (active?.source === 'saved') {
    const prongMm = newerLegacy?.prongMm ?? active.prongMm;
    return {
      form: newerLegacy?.form ?? beltConfigToForm(active.input, active.waistSource),
      prong: prongMm === undefined ? '' : formatDecimal(prongMm),
      scrapFromStrap: active.scrapFromStrap === true,
      loadedFieldId: active.fieldId,
      name: active.name,
      legacy: newerLegacy ? { filled: newerLegacy.filled, problems: newerLegacy.problems } : null,
    };
  }
  if (legacy) {
    return {
      form: legacy.form,
      prong: legacy.prongMm === undefined ? '' : formatDecimal(legacy.prongMm),
      scrapFromStrap: false,
      loadedFieldId: null,
      name: legacy.name,
      legacy: { filled: legacy.filled, problems: legacy.problems },
    };
  }
  return null;
}
