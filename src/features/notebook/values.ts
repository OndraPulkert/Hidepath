import { type RecordField } from '@/content/schema';

/**
 * Hodnoty polí zápisníku: čtení z pole formuláře, zobrazení a porovnání s cílem z lekce.
 * Čisté funkce bez Reactu.
 */

const NBSP = ' ';

/** Nejdelší text, který se do zápisníku uloží, když pole nemá vlastní `maxLength`. */
export const RECORD_TEXT_MAX_LENGTH = 1000;

export type RecordValue = number | string | null;

export type ParseRecordResult = { ok: true; value: RecordValue } | { ok: false; error: string };

/**
 * Číslo v českém i anglickém zápisu („0,85“, „0.85“, „ 2 “); `undefined`, když to číslo není.
 * Jednotku ani mezery uvnitř čísla nebere – „0,8 mm“ by mohlo být i „0,8 cm“.
 */
export function parseDecimal(raw: string): number | undefined {
  const t = raw.trim().replace(',', '.').replace('−', '-');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return undefined;
  const v = Number(t);
  return Number.isFinite(v) ? v : undefined;
}

/** Číslo česky: desetinná čárka, `decimals` míst (bez nich nejvýš 3 a bez koncových nul). */
export function formatDecimal(value: number, decimals?: number): string {
  const text =
    decimals !== undefined
      ? value.toFixed(decimals)
      : String(Math.round(value * 1000) / 1000).replace(/^-0$/, '0');
  return text.replace('.', ',');
}

const unitSuffix = (unit: Extract<RecordField, { kind: 'number' }>['unit']): string =>
  unit === '' ? '' : unit === '×' ? '×' : `${NBSP}${unit}`;

/**
 * Přečte text z pole formuláře. Prázdné pole = `null` (zápis se vymaže). Číslo se zaokrouhlí
 * na `decimals` míst a musí být v mezích pole (bez `min` aspoň 0), u `decimals: 0` celé;
 * volba jen z nabídky; text nejvýš
 * `maxLength` znaků. Chyby jsou krátké a česky, rovnou k zobrazení pod polem.
 */
export function parseRecordInput(field: RecordField, raw: string): ParseRecordResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { ok: true, value: null };
  switch (field.kind) {
    case 'number': {
      const parsed = parseDecimal(trimmed);
      if (parsed === undefined) return { ok: false, error: 'Zadejte číslo, např. 0,85.' };
      if (field.decimals === 0 && !Number.isInteger(parsed)) {
        return { ok: false, error: 'Zadejte celé číslo.' };
      }
      // Uložit s přesností pole: zobrazení (`decimals`), pole formuláře i cíl pak pracují
      // se stejným číslem (jinak „0,92 mm“ mimo cíl „nejvýš 0,92 mm“ kvůli uloženým 0,921).
      const v = field.decimals === undefined ? parsed : Number(parsed.toFixed(field.decimals));
      const min = field.min ?? 0;
      const max = field.max;
      const unit = unitSuffix(field.unit);
      if (v < min || (max !== undefined && v > max)) {
        return {
          ok: false,
          error:
            max !== undefined
              ? `Zadejte číslo od ${formatDecimal(min)} do ${formatDecimal(max)}${unit}.`
              : `Zadejte číslo ${formatDecimal(min)}${unit} nebo větší.`,
        };
      }
      return { ok: true, value: v };
    }
    case 'choice':
      return field.options.some((o) => o.value === trimmed)
        ? { ok: true, value: trimmed }
        : { ok: false, error: 'Vyberte jednu z možností.' };
    case 'text': {
      const max = field.maxLength ?? RECORD_TEXT_MAX_LENGTH;
      return trimmed.length > max
        ? { ok: false, error: `Nejvýš ${max} znaků.` }
        : { ok: true, value: trimmed };
    }
  }
}

/** Uložená hodnota jako text do pole formuláře (číslo bez jednotky, s desetinnou čárkou). */
export function recordInputText(field: RecordField, value: RecordValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (field.kind === 'number') return typeof value === 'number' ? formatDecimal(value) : '';
  return typeof value === 'string' ? value : '';
}

/**
 * Hodnota k zobrazení („0,85 mm“, „3 ks“, „2×“, popisek volby, text). `null`, když nic
 * zapsáno není nebo hodnota k poli nepasuje (např. text v číselném poli po změně obsahu).
 */
export function formatRecordValue(
  field: RecordField,
  value: RecordValue | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  switch (field.kind) {
    case 'number':
      return typeof value === 'number'
        ? `${formatDecimal(value, field.decimals)}${unitSuffix(field.unit)}`
        : null;
    case 'choice': {
      if (typeof value !== 'string') return null;
      return field.options.find((o) => o.value === value)?.label ?? value;
    }
    case 'text':
      return typeof value === 'string' && value.trim() !== '' ? value : null;
  }
}

export type TargetStatus = 'ok' | 'warn' | 'unknown';

/**
 * Porovná číslo s cílovým rozmezím z lekce (`target`). `unknown`, když pole cíl nemá nebo
 * hodnota není číslo; jinak `ok` uvnitř rozmezí (včetně mezí) a `warn` mimo něj.
 */
export function evaluateTarget(field: RecordField, value: RecordValue | undefined): TargetStatus {
  if (field.kind !== 'number' || !field.target || typeof value !== 'number') return 'unknown';
  const { min, max } = field.target;
  const eps = 1e-9;
  if (min !== undefined && value < min - eps) return 'warn';
  if (max !== undefined && value > max + eps) return 'warn';
  return 'ok';
}
