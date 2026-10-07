import { LID_RECORD_IDS, LID_V12_VARIANTS } from '@/content/projects';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { formatDecimal } from '@/features/notebook/values';
import {
  DEFAULT_LID_GENERATOR_FORM,
  type LidGeneratorForm,
  type LidP0Fields,
} from '@/lib/patterns/lid-wallet-input';

/**
 * Tloušťka P1 v záloze A: lekce 3, krok `decide` – „záloha A – celý P1 z usně 0,8 mm
 * (v aplikaci zadejte P1 0,8)“.
 */
const BACKUP_A_P1 = '0,8';

export interface LidGeneratorPrefill {
  /** Formulář s hodnotami ze zápisníku; co v zápisníku není, zůstává výchozí. */
  form: LidGeneratorForm;
  /** Co se předvyplnilo, česky a v pořadí formuláře (do poznámky nad formulářem). */
  filled: string[];
}

/**
 * Předvyplní formulář „Listy pro vaši kůži“ ze zápisníku peněženky VÍČKO:
 * - P1 z lekce 1; při záloze A z lekce 3 P1 0,8 (podle textu lekce),
 * - přepážky = větší z D1 a D2 (jen když jsou zapsané obě, jinak by mohla chybět ta větší),
 * - podšívka L1, záloha B1 z rozhodnutí V12 (B2 rozhoduje až zkouška Z-2, nepředvyplňuje se),
 * - k: z lekce 10 (hotový ohyb) přednostně před P0-3 z lekce 2,
 * - zvednutí karet a mincí, bankovky (P0) a tloušťka magnetu (lekce 11).
 * Bere jen zápisy projektu `projectSlug` (projekt s generátorem `lid-wallet-thickness`).
 * Vrací `null`, když v zápisníku není nic, co by formulář použil.
 */
export function lidGeneratorPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LidGeneratorPrefill | null {
  const latest = latestEntriesByField(entries, projectSlug);
  const num = (fieldId: string): number | undefined => {
    const v = latest.get(fieldId)?.value;
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  };
  // Tloušťky aspoň na jedno desetinné místo, jako ve formuláři („1,0“, ne „1“).
  const mm = (n: number): string => (Number.isInteger(n) ? formatDecimal(n, 1) : formatDecimal(n));
  const text = (n: number | undefined): string | undefined => (n === undefined ? undefined : mm(n));
  const variant = latest.get(LID_RECORD_IDS.v12Variant)?.value;

  const form: LidGeneratorForm = {
    ...DEFAULT_LID_GENERATOR_FORM,
    p0: { ...DEFAULT_LID_GENERATOR_FORM.p0 },
  };
  const filled: string[] = [];

  if (variant === LID_V12_VARIANTS.backupA) {
    form.p1 = BACKUP_A_P1;
    filled.push('P1 0,8 (záloha A)');
  } else {
    const p1 = text(num(LID_RECORD_IDS.p1Thickness));
    if (p1 !== undefined) {
      form.p1 = p1;
      filled.push('P1');
    }
  }
  const d1 = num(LID_RECORD_IDS.d1Thickness);
  const d2 = num(LID_RECORD_IDS.d2Thickness);
  if (d1 !== undefined && d2 !== undefined) {
    form.divider = mm(Math.max(d1, d2));
    filled.push('přepážky (větší z D1 a D2)');
  }
  const lining = text(num(LID_RECORD_IDS.liningThickness));
  if (lining !== undefined) {
    form.lining = lining;
    filled.push('podšívka L1');
  }
  if (variant === LID_V12_VARIANTS.backupB1) {
    form.skiveFold = true;
    filled.push('záloha B1');
  }

  const p0: [keyof LidP0Fields, number | undefined, string][] = [
    ['k', num(LID_RECORD_IDS.kMeasured) ?? num(LID_RECORD_IDS.p0K), 'k'],
    ['cardLift', num(LID_RECORD_IDS.cardLift), 'zvednutí karet'],
    ['coinLift', num(LID_RECORD_IDS.coinLift), 'zvednutí mincí'],
    ['billHeightMin', num(LID_RECORD_IDS.billHeightMin), 'výška bankovky nejmenší'],
    ['billHeightMax', num(LID_RECORD_IDS.billHeightMax), 'výška bankovky největší'],
    ['billSheet', num(LID_RECORD_IDS.billSheet), 'tloušťka bankovky'],
    ['billHalfWidthMin', num(LID_RECORD_IDS.billHalfWidthMin), 'šířka napůl nejmenší'],
    ['billHalfWidthMax', num(LID_RECORD_IDS.billHalfWidthMax), 'šířka napůl největší'],
    ['magnetThickness', num(LID_RECORD_IDS.magnetThickness), 'tloušťka magnetu'],
  ];
  for (const [key, value, label] of p0) {
    if (value === undefined) continue;
    form.p0[key] = formatDecimal(value);
    filled.push(label);
  }

  return filled.length > 0 ? { form, filled } : null;
}
