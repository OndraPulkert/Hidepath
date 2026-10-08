import { BELT_RECORD_IDS, BELT_TIP_CHOICES } from '@/content/projects';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { formatDecimal } from '@/features/notebook/values';
import {
  type BeltConfigForm,
  type BeltConfigOutcome,
  type BeltTip,
  BELT_LIMITS,
  DEFAULT_BELT_FORM,
  deriveBeltConfig,
  parseBeltConfigForm,
} from '@/lib/patterns/belt-config';
import { isStrapColor } from '@/lib/patterns/belt-strap-offers';

export interface BeltConfigPrefill {
  /** Formulář s hodnotami ze zápisníku; co v zápisníku není, zůstává výchozí. */
  form: BeltConfigForm;
  /** Co se předvyplnilo, česky a v pořadí formuláře. */
  filled: string[];
  /** Co v zápisech nejde použít (např. trn moc silný na výsečníky), česky. */
  problems: string[];
}

/** Přídavek k trnu na Ø dírky (docs/zadani/opasek-postup.md: „trn u kořene + 0,5 mm“). */
const PRONG_CLEARANCE_MM = 0.5;

const isTip = (v: unknown): v is BeltTip =>
  v === BELT_TIP_CHOICES.hrot || v === BELT_TIP_CHOICES.zaobleny;

/**
 * Předvyplní formulář „Váš pásek“ ze zápisníku projektu `projectSlug`: šířka, tloušťka,
 * obvod, konec, barva a Ø dírky z trnu přezky (trn + 0,5 mm). Vrací `null`, když v zápisníku nic
 * z toho není.
 */
export function beltConfigPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): BeltConfigPrefill | null {
  const latest = latestEntriesByField(entries, projectSlug);
  const num = (fieldId: string): number | undefined => {
    const v = latest.get(fieldId)?.value;
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  };
  const form: BeltConfigForm = { ...DEFAULT_BELT_FORM };
  const filled: string[] = [];

  const width = num(BELT_RECORD_IDS.width);
  if (width !== undefined) {
    form.width = formatDecimal(width);
    filled.push('šířka');
  }
  const thickness = num(BELT_RECORD_IDS.thickness);
  if (thickness !== undefined) {
    form.thickness = formatDecimal(thickness);
    filled.push('tloušťka');
  }
  const waist = num(BELT_RECORD_IDS.waist);
  if (waist !== undefined) {
    form.waist = formatDecimal(waist);
    filled.push('obvod');
  }
  const tip = latest.get(BELT_RECORD_IDS.tip)?.value;
  if (isTip(tip)) {
    form.tip = tip;
    filled.push('konec');
  }
  const color = latest.get(BELT_RECORD_IDS.color)?.value;
  if (isStrapColor(color)) {
    form.color = color;
    filled.push('barva');
  }
  const problems: string[] = [];
  const prong = num(BELT_RECORD_IDS.prong);
  if (prong !== undefined) {
    // Výsečníky jsou po 0,5 mm (meze formuláře): trn + 0,5 mm zaokrouhlit nahoru, ať dírka
    // není těsnější, než pravidlo chce (trn 4,2 → 4,7 → výsečník 5 mm). Pravidlo dává
    // nejmenší dírku, takže u tenkého trnu (≤ 3,5 mm) poslouží nejmenší výsečník 4,5 mm.
    const { min, max, step } = BELT_LIMITS.holeDiameterMm;
    const wanted = prong + PRONG_CLEARANCE_MM;
    const rounded = Math.ceil(wanted / step - 1e-9) * step;
    const punch = Math.max(min, rounded);
    form.holeDiameter = formatDecimal(punch);
    filled.push(
      punch > rounded + 1e-9
        ? `Ø dírky (trn + 0,5 mm, nejmenší výsečník ${formatDecimal(min)} mm)`
        : Math.abs(punch - wanted) < 1e-9
          ? 'Ø dírky (trn + 0,5 mm)'
          : 'Ø dírky (trn + 0,5 mm, nahoru na výsečník po 0,5 mm)',
    );
    if (punch > max + 1e-9) {
      problems.push(
        `Trn ${formatDecimal(prong)} mm je na výsečníky ${formatDecimal(min)}–${formatDecimal(max)} mm moc silný (potřeba Ø ${formatDecimal(punch)} mm). Zkontrolujte měření trnu, nebo zvolte jinou přezku.`,
      );
    }
  }
  return filled.length > 0 ? { form, filled, problems } : null;
}

/**
 * „Vaše čísla“ ze zápisníku pro lekce: zápisy → formulář → výpočet. `null`, když zápisník
 * nic nemá; jinak výsledek, nebo seznam, co v zápisech neplatí.
 */
export function beltNumbersFromNotebook(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): BeltConfigOutcome | null {
  const prefill = beltConfigPrefill(entries, projectSlug);
  if (!prefill) return null;
  if (prefill.problems.length > 0) return { ok: false, problems: prefill.problems };
  const parsed = parseBeltConfigForm(prefill.form);
  if ('problems' in parsed) return { ok: false, problems: parsed.problems };
  return deriveBeltConfig(parsed.input);
}
