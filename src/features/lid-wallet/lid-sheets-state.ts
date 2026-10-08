import { z } from 'zod';

import {
  LEGACY_LID_RECORD_IDS,
  LEGACY_LID_SHEETS_LIMITS,
  LID_RECORD_IDS,
  LID_SHEETS_FIELD_ID,
  LID_V12_RESULTS,
  LID_Z2_RESULTS,
} from '@/content/projects';
import { type LidSheetRecallKey } from '@/content/schema';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { formatDecimal } from '@/features/notebook/values';
import { fmt } from '@/lib/geometry/lid-wallet';
import {
  DEFAULT_LID_GENERATOR_FORM,
  EMPTY_LID_P0_FIELDS,
  LID_FORM_FIELD_MAX_LENGTH,
  type LidGeneratorForm,
  type LidP0Fields,
  lidDividerLimit,
  lidMagnetWindow,
  lidP0ModelValues,
  lidP1Text,
  parseMm,
} from '@/lib/patterns/lid-wallet-input';

/**
 * „Listy pro vaši kůži“ (peněženka Víčko): jediný zdroj tlouštěk P1/D1/D2/L1, výsledků P0, k,
 * magnetu a záloh. Stav formuláře je jeden zápis zápisníku (`lid-sheets-input`) s hodnotou
 * JSON, takže se synchronizuje s účtem bez migrace. Lekce ho jen zobrazují (`lidSheetFact`)
 * a meze (přepážky, okno magnetu) počítají z něj. Staré zápisy lekcí se jednou převedou
 * (`legacyLidOffer`) a nic se nemaže. Čisté funkce bez Reactu.
 */

const MODEL = lidP0ModelValues();

/* ------------------------------------------------------------------------- */
/* Uložený stav                                                               */
/* ------------------------------------------------------------------------- */

export interface LidSheetsSaved {
  form: LidGeneratorForm;
  /**
   * Poslední listy byly vygenerované mimo ověřené meze (jen zkušební kus); `false` = v mezích,
   * `null` = zatím nevygenerované. Zapíše se samo při generování.
   */
  trialOutsideLimits: boolean | null;
  updatedAt: string;
}

/** Pole formuláře: krátký text (číslo tak, jak ho uživatel napsal). */
const text = z.string().max(LID_FORM_FIELD_MAX_LENGTH);

const p0Schema = z.object({
  k: text,
  cardLift: text,
  coinLift: text,
  billSheet: text,
  billHeightMin: text,
  billHeightMax: text,
  billHalfWidthMin: text,
  billHalfWidthMax: text,
  magnetThickness: text,
}) satisfies z.ZodType<LidP0Fields>;

const savedValueSchema = z.object({
  v: z.literal(1),
  form: z.object({
    p1: text,
    backupA: z.boolean(),
    p1BackupA: text,
    d1: text,
    d2: text,
    lining: text,
    skiveFold: z.boolean(),
    skiveHinge: z.boolean(),
    p0: p0Schema,
  }) satisfies z.ZodType<LidGeneratorForm>,
  /** Chybí = listy zatím nevygenerované. */
  trial: z.boolean().optional(),
});

/**
 * Hodnota zápisu (JSON, pod 2000 znaků i s nejdelšími poli). Pole bez mezer na krajích; delší
 * než `LID_FORM_FIELD_MAX_LENGTH` formulář neuloží (`lidFormInvalidFields`).
 */
export function serializeLidSheets(form: LidGeneratorForm, trialOutsideLimits: boolean | null) {
  const value: z.input<typeof savedValueSchema> = {
    v: 1,
    form: normalize(form),
    ...(trialOutsideLimits === null ? {} : { trial: trialOutsideLimits }),
  };
  return JSON.stringify(value);
}

/** Přečte hodnotu zápisu; `null`, když chybí nebo je poškozená. */
export function parseLidSheetsValue(raw: unknown): Omit<LidSheetsSaved, 'updatedAt'> | null {
  if (typeof raw !== 'string') return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = savedValueSchema.safeParse(json);
  if (!parsed.success) return null;
  return { form: parsed.data.form, trialOutsideLimits: parsed.data.trial ?? null };
}

/** Uložený stav formuláře projektu, nebo `null`. */
export function savedLidSheets(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LidSheetsSaved | null {
  const entry = latestEntriesByField(entries, projectSlug).get(LID_SHEETS_FIELD_ID);
  const value = entry ? parseLidSheetsValue(entry.value) : null;
  return entry && value ? { ...value, updatedAt: entry.updatedAt } : null;
}

/* ------------------------------------------------------------------------- */
/* Převod starých zápisů lekcí                                                */
/* ------------------------------------------------------------------------- */

/** Tloušťky aspoň na jedno desetinné místo, jako ve formuláři („1,0“, ne „1“). */
const mmText = (n: number): string =>
  Number.isInteger(n) ? formatDecimal(n, 1) : formatDecimal(n);

/** Zálohy, na které ukazují výsledky zkoušek V12 (lekce 3) a Z-2 (lekce 12). */
export interface LidBackupSuggestion {
  backupA: boolean;
  skiveFold: boolean;
  skiveHinge: boolean;
  /** Krátce česky, odkud to plyne, např. „zkouška V12 (lekce 3): líc popraskal“. */
  reason: string;
}

/**
 * Záloha podle výsledků zkoušek: Z-2 (lekce 12) má přednost před V12 (lekce 3). Praskliny
 * i v záloze A → B2 s P1 z usně 1,0 a byla-li záloha A kvůli V12, i B1 (lekce 5). `null` =
 * zkoušky zatím nic nezapsaly.
 */
export function suggestedLidBackup(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LidBackupSuggestion | null {
  const latest = latestEntriesByField(entries, projectSlug);
  const v12 = latest.get(LID_RECORD_IDS.v12Result)?.value;
  const z2 = latest.get(LID_RECORD_IDS.z2Result)?.value;
  if (z2 === LID_Z2_RESULTS.cracksAgain) {
    const afterA = v12 === LID_V12_RESULTS.cracked;
    return {
      backupA: false,
      skiveFold: afterA,
      skiveHinge: true,
      reason: afterA
        ? 'zkouška Z-2 (lekce 12): praskliny i v záloze A, a V12 vybrala zálohu A'
        : 'zkouška Z-2 (lekce 12): praskliny i v záloze A',
    };
  }
  if (z2 === LID_Z2_RESULTS.cracks) {
    return {
      backupA: true,
      skiveFold: false,
      skiveHinge: false,
      reason: 'zkouška Z-2 (lekce 12): praskliny v závěsu',
    };
  }
  if (v12 === LID_V12_RESULTS.cracked) {
    return {
      backupA: true,
      skiveFold: false,
      skiveHinge: false,
      reason: 'zkouška V12 (lekce 3): líc popraskal',
    };
  }
  if (v12 === LID_V12_RESULTS.crackedAgain) {
    return {
      backupA: false,
      skiveFold: true,
      skiveHinge: false,
      reason: 'zkouška V12 (lekce 3): popraskala i useň 0,8, nebo nejde sehnat',
    };
  }
  if (v12 === LID_V12_RESULTS.ok) {
    return {
      backupA: false,
      skiveFold: false,
      skiveHinge: false,
      reason: 'zkouška V12 (lekce 3): líc nepopraskal',
    };
  }
  return null;
}

/** Název zálohy, např. „A (P1 z usně 0,8)“, „B1 + B2“, „výchozí střih“. */
export function lidBackupLabel(
  b: Pick<LidGeneratorForm, 'backupA' | 'skiveFold' | 'skiveHinge'>,
): string {
  const parts = [
    b.backupA ? 'A (P1 z usně 0,8)' : null,
    b.skiveFold ? 'B1 (ztenčený ohyb dna)' : null,
    b.skiveHinge ? 'B2 (ztenčený závěs)' : null,
  ].filter((p): p is string => p !== null);
  return parts.length === 0 ? 'výchozí střih' : `záloha ${parts.join(' + ')}`;
}

/**
 * Upozornění, když výsledek zkoušky ukazuje na jinou zálohu, než je ve formuláři; `null` =
 * sedí, nebo zkoušky nic nezapsaly.
 */
export function lidBackupMismatch(
  form: Pick<LidGeneratorForm, 'backupA' | 'skiveFold' | 'skiveHinge'>,
  suggestion: LidBackupSuggestion | null,
): string | null {
  if (!suggestion) return null;
  const same =
    form.backupA === suggestion.backupA &&
    form.skiveFold === suggestion.skiveFold &&
    form.skiveHinge === suggestion.skiveHinge;
  return same
    ? null
    : `Podle výsledku zkoušky (${suggestion.reason}) platí ${lidBackupLabel(suggestion)}, ve formuláři je ${lidBackupLabel(form)}.`;
}

export interface LidLegacyPrefill {
  /** Formulář s hodnotami; co v zápisech není, zůstává z `base`. */
  form: LidGeneratorForm;
  /** Co se převzalo, česky a v pořadí formuláře. */
  filled: string[];
  /** Stará volba „Listy zkušebního kusu“ (lekce 1), když byla zapsaná. */
  trialOutsideLimits: boolean | null;
}

/**
 * Staré zápisy lekcí 1, 2, 3, 10 a 11 jako formulář listů:
 * - tloušťky P1, D1, D2, L1 a useň 0,8 v záloze A,
 * - zálohy z výsledků V12 a Z-2 (`suggestedLidBackup`, jen při prvním převodu bez `since`),
 * - k z lekce 10 přednostně před P0-3 z lekce 2, zvednutí, bankovky a magnet,
 * - stará volba „Listy zkušebního kusu“.
 * `base` = formulář, do kterého se zápisy doplní; `since` = jen zápisy novější než tento čas.
 * `null`, když v zápisníku nic z toho není.
 */
export function legacyLidPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  { base = DEFAULT_LID_GENERATOR_FORM, since }: { base?: LidGeneratorForm; since?: string } = {},
): LidLegacyPrefill | null {
  const latest = latestEntriesByField(entries, projectSlug);
  const value = (fieldId: string) => {
    const entry = latest.get(fieldId);
    return entry && (since === undefined || entry.updatedAt > since) ? entry.value : undefined;
  };
  const num = (fieldId: string): number | undefined => {
    const v = value(fieldId);
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  };
  const ids = LEGACY_LID_RECORD_IDS;
  const form: LidGeneratorForm = { ...base, p0: { ...base.p0 } };
  const filled: string[] = [];
  const thickness = (
    key: 'p1' | 'p1BackupA' | 'd1' | 'd2' | 'lining',
    id: string,
    label: string,
  ) => {
    const v = num(id);
    if (v === undefined) return;
    form[key] = mmText(v);
    filled.push(`${label} ${mmText(v)}`);
  };
  thickness('p1', ids.p1Thickness, 'P1');
  thickness('p1BackupA', ids.p1BackupAThickness, 'useň 0,8 (záloha A)');
  thickness('d1', ids.d1Thickness, 'D1');
  thickness('d2', ids.d2Thickness, 'D2');
  thickness('lining', ids.liningThickness, 'L1');

  if (since === undefined) {
    const backup = suggestedLidBackup(entries, projectSlug);
    if (backup && (backup.backupA || backup.skiveFold || backup.skiveHinge)) {
      form.backupA = backup.backupA;
      form.skiveFold = backup.skiveFold;
      form.skiveHinge = backup.skiveHinge;
      filled.push(lidBackupLabel(backup));
    }
  }

  const k10 = num(ids.kMeasured);
  // k z lekce 10 má přednost i tehdy, když je starší než uložený formulář (`since`): novější
  // k z papírového modelu ho nepřepíše.
  const k10Recorded = typeof latest.get(ids.kMeasured)?.value === 'number';
  const k2 = k10Recorded && k10 === undefined ? undefined : num(ids.p0K);
  if (k10 !== undefined || k2 !== undefined) {
    form.p0.k = formatDecimal((k10 ?? k2)!);
    filled.push(
      k10 !== undefined && k2 !== undefined
        ? `k ${formatDecimal(k10)} z lekce 10 (z papírového modelu bylo ${formatDecimal(k2)})`
        : k10 !== undefined
          ? `k ${formatDecimal(k10)} (lekce 10)`
          : `k ${formatDecimal(k2!)} (papírový model)`,
    );
  }
  const p0: [keyof LidP0Fields, string, string][] = [
    ['cardLift', ids.cardLift, 'zvednutí karet'],
    ['coinLift', ids.coinLift, 'zvednutí mincí'],
    ['billHeightMin', ids.billHeightMin, 'výška bankovky nejmenší'],
    ['billHeightMax', ids.billHeightMax, 'výška bankovky největší'],
    ['billSheet', ids.billSheet, 'tloušťka bankovky'],
    ['billHalfWidthMin', ids.billHalfWidthMin, 'šířka napůl nejmenší'],
    ['billHalfWidthMax', ids.billHalfWidthMax, 'šířka napůl největší'],
    ['magnetThickness', ids.magnetThickness, 'tloušťka magnetu'],
  ];
  for (const [key, id, label] of p0) {
    const v = num(id);
    if (v === undefined) continue;
    form.p0[key] = formatDecimal(v);
    filled.push(`${label} ${formatDecimal(v)}`);
  }

  const limits = value(ids.sheetsOutsideLimits);
  const trialOutsideLimits =
    limits === LEGACY_LID_SHEETS_LIMITS.outside
      ? true
      : limits === LEGACY_LID_SHEETS_LIMITS.within
        ? false
        : null;
  if (trialOutsideLimits !== null) {
    filled.push(trialOutsideLimits ? 'listy mimo ověřené meze' : 'listy v ověřených mezích');
  }
  return filled.length > 0 ? { form, filled, trialOutsideLimits } : null;
}

/**
 * Převod starých dat: hodnoty z lekcí, ale formulář ještě neuložený. Formulář je převezme
 * k uložení a do té doby z nich počítají i lekce. Jakmile je formulář uložený, nabídka zmizí.
 */
export function legacyLidOffer(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LidLegacyPrefill | null {
  if (savedLidSheets(entries, projectSlug)) return null;
  return legacyLidPrefill(entries, projectSlug);
}

/**
 * Zápisy lekcí novější než uložený formulář (stará verze aplikace v jiném zařízení): doplněné
 * do uloženého formuláře, ať se neztratí. Zmizí po dalším uložení. `null` = nic novějšího.
 */
export function newerLegacyLidPrefill(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  saved: Pick<LidSheetsSaved, 'form' | 'updatedAt'>,
): LidLegacyPrefill | null {
  return legacyLidPrefill(entries, projectSlug, { base: saved.form, since: saved.updatedAt });
}

/* ------------------------------------------------------------------------- */
/* Stav pro lekce a formulář                                                  */
/* ------------------------------------------------------------------------- */

export interface LidSheetsState {
  /** Formulář, podle kterého lekce počítají: uložený, jinak převzatý ze starých zápisů. */
  form: LidGeneratorForm | null;
  /** `saved` = uložený formulář; `notebook` = staré zápisy, ještě neuložené. */
  source: 'saved' | 'notebook' | null;
  trialOutsideLimits: boolean | null;
  /** Staré zápisy k převodu (jen bez uloženého formuláře). */
  legacy: LidLegacyPrefill | null;
  /** Zápisy lekcí novější než uložený formulář. */
  newerLegacy: LidLegacyPrefill | null;
  /** Záloha podle výsledků zkoušek V12 a Z-2. */
  suggestion: LidBackupSuggestion | null;
  /** Přeměřená značka magnetu z lekce 11, mm (měření, porovná se s oknem lepení). */
  magnetMarkY: number | null;
}

export function resolveLidSheets(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): LidSheetsState {
  const saved = savedLidSheets(entries, projectSlug);
  const suggestion = suggestedLidBackup(entries, projectSlug);
  const mark = latestEntriesByField(entries, projectSlug).get(LID_RECORD_IDS.magnetMarkY)?.value;
  const magnetMarkY = typeof mark === 'number' && Number.isFinite(mark) ? mark : null;
  if (saved) {
    return {
      form: saved.form,
      source: 'saved',
      trialOutsideLimits: saved.trialOutsideLimits,
      legacy: null,
      newerLegacy: newerLegacyLidPrefill(entries, projectSlug, saved),
      suggestion,
      magnetMarkY,
    };
  }
  const legacy = legacyLidPrefill(entries, projectSlug);
  return {
    form: legacy?.form ?? null,
    source: legacy ? 'notebook' : null,
    trialOutsideLimits: legacy?.trialOutsideLimits ?? null,
    legacy,
    newerLegacy: null,
    suggestion,
    magnetMarkY,
  };
}

/** Výchozí stav formuláře na stránce listů. */
export interface LidFormInitial {
  form: LidGeneratorForm;
  /** Uložený formulář: stránka z něj rovnou vygeneruje listy. */
  saved: boolean;
  trialOutsideLimits: boolean | null;
  /** Převzato ze zápisníku (`legacy` = neuložené staré zápisy, `newer` = novější než uložené). */
  takeover: { kind: 'legacy' | 'newer'; filled: string[] } | null;
}

/** Formulář podle uloženého stavu (jediný zdroj), jinak ze starých zápisů. `null` = výchozí. */
export function lidFormInitial(state: LidSheetsState): LidFormInitial | null {
  if (state.source === 'saved' && state.form) {
    return {
      form: state.newerLegacy?.form ?? state.form,
      saved: state.newerLegacy === null,
      trialOutsideLimits: state.trialOutsideLimits,
      takeover: state.newerLegacy ? { kind: 'newer', filled: state.newerLegacy.filled } : null,
    };
  }
  if (state.legacy) {
    return {
      form: state.legacy.form,
      saved: false,
      trialOutsideLimits: state.legacy.trialOutsideLimits,
      takeover: { kind: 'legacy', filled: state.legacy.filled },
    };
  }
  return null;
}

/** Stejné hodnoty formuláře (porovnání před uložením). */
export function sameLidForm(a: LidGeneratorForm, b: LidGeneratorForm): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

const normalize = (f: LidGeneratorForm): LidGeneratorForm => ({
  p1: f.p1.trim(),
  backupA: f.backupA,
  p1BackupA: f.p1BackupA.trim(),
  d1: f.d1.trim(),
  d2: f.d2.trim(),
  lining: f.lining.trim(),
  skiveFold: f.skiveFold,
  skiveHinge: f.skiveHinge,
  p0: Object.fromEntries(
    (Object.keys(EMPTY_LID_P0_FIELDS) as (keyof LidP0Fields)[]).map((k) => [k, f.p0[k].trim()]),
  ) as unknown as LidP0Fields,
});

/* ------------------------------------------------------------------------- */
/* Hodnoty pro lekce                                                          */
/* ------------------------------------------------------------------------- */

/** Jedna hodnota z formuláře listů k zobrazení v lekci. */
export interface LidSheetFact {
  key: LidSheetRecallKey;
  label: string;
  /** `null` = ve formuláři chybí. */
  value: string | null;
  /**
   * Mez spočítaná z formuláře: `ok: true` = hodnota v ní, `false` = upozornění, `null` = jen mez
   * (hodnota k porovnání ještě chybí, takže se nic netvrdí).
   */
  check: { ok: boolean | null; text: string } | null;
}

const num = (raw: string): number | undefined => parseMm(raw);
const cz = (raw: string): string | null => {
  const v = num(raw);
  return v === undefined ? null : formatDecimal(v);
};
/** Hodnota z pole, jinak hodnota modelu s poznámkou. */
const orModel = (raw: string, model: number): string => cz(raw) ?? `${fmt(model)} (model)`;

/**
 * Hodnota formuláře pro klíč `key` a mez spočítaná z formuláře (přepážky podle P1, okno lepení
 * magnetu, k). Bez formuláře `value: null`.
 */
export function lidSheetFact(key: LidSheetRecallKey, state: LidSheetsState): LidSheetFact {
  const { form } = state;
  const fact = (label: string, value: string | null, check: LidSheetFact['check'] = null) => ({
    key,
    label,
    value,
    check,
  });
  switch (key) {
    case 'thicknesses': {
      if (!form) return fact('Vaše tloušťky', null);
      const part = (label: string, raw: string) => {
        const v = num(raw);
        return `${label} ${v === undefined ? '–' : mmText(v)}`;
      };
      // V záloze A se počítá s usní 0,8, ale změřená useň 1,0 zůstává vidět (lekce 1).
      const value = [
        part('P1', form.p1),
        ...(form.backupA ? [part('P1 v záloze A', lidP1Text(form))] : []),
        part('D1', form.d1),
        part('D2', form.d2),
        part('L1', form.lining),
      ].join(' · ');
      return fact('Vaše tloušťky', `${value} mm`, dividerCheck(form));
    }
    case 'bills': {
      if (!form) return fact('Bankovky (P0-1)', null);
      const p = form.p0;
      return fact(
        'Bankovky (P0-1)',
        `výška ${orModel(p.billHeightMin, MODEL.billHeightMinMm)}–${orModel(p.billHeightMax, MODEL.billHeightMaxMm)} · napůl ${orModel(p.billHalfWidthMin, MODEL.billHalfWidthMinMm)}–${orModel(p.billHalfWidthMax, MODEL.billHalfWidthMaxMm)} · list ${orModel(p.billSheet, MODEL.billSheetMm)} mm`,
      );
    }
    case 'lifts': {
      if (!form) return fact('Zvednutí karet / mincí (P0-6)', null);
      return fact(
        'Zvednutí karet / mincí (P0-6)',
        `${orModel(form.p0.cardLift, MODEL.cardLiftMm)} / ${orModel(form.p0.coinLift, MODEL.coinLiftMm)} mm`,
      );
    }
    case 'k': {
      if (!form) return fact('Vaše k', null);
      const k = num(form.p0.k);
      if (k === undefined) {
        return fact('Vaše k', `nezadané – listy počítají s k do ${fmt(MODEL.kMax)}`);
      }
      return fact(
        'Vaše k',
        formatDecimal(k),
        k <= MODEL.kMax + 1e-9
          ? { ok: true, text: `do ${fmt(MODEL.kMax)} listy platí` }
          : {
              ok: false,
              text: `nad ${fmt(MODEL.kMax)}: listy se přepočítají (dno karet a výška), vygenerujte je znovu`,
            },
      );
    }
    case 'magnet': {
      if (!form) return fact('Magnet Ø 8', null);
      const t = num(form.p0.magnetThickness);
      return fact(
        'Magnet Ø 8',
        t === undefined
          ? `× ${fmt(MODEL.magnetThicknessMm)} mm (výchozí)`
          : `× ${formatDecimal(t)} mm`,
      );
    }
    case 'magnetWindow': {
      const window = form ? lidMagnetWindow(form) : null;
      if (!window) return fact('Okno lepení magnetu', null);
      const value = `y ${fmt(window.minMm)}–${fmt(window.maxMm)} mm, značka ${fmt(window.markMm)}`;
      const mark = state.magnetMarkY;
      if (mark === null) return fact('Okno lepení magnetu', value);
      const ok = mark >= window.minMm - 1e-9 && mark <= window.maxMm + 1e-9;
      return fact('Okno lepení magnetu', value, {
        ok,
        text: ok
          ? `vaše značka ${formatDecimal(mark)} je v okně`
          : `vaše značka ${formatDecimal(mark)} je mimo okno – přeměřte ji`,
      });
    }
    case 'variant': {
      if (!form) return fact('Záloha', null);
      const label =
        form.backupA && cz(form.p1BackupA)
          ? `${lidBackupLabel(form)}, useň 0,8 ${cz(form.p1BackupA)} mm`
          : lidBackupLabel(form);
      const mismatch = lidBackupMismatch(form, state.suggestion);
      return fact('Záloha', label, mismatch ? { ok: false, text: mismatch } : null);
    }
    case 'sheets': {
      if (!form) return fact('Listy', null);
      const t = state.trialOutsideLimits;
      if (t === null) return fact('Listy', 'zatím nevygenerované');
      return fact(
        'Listy',
        t ? 'mimo ověřené meze – jen zkušební kus' : 'v ověřených mezích',
        t ? { ok: false, text: 'finální kus jen z listů v mezích' } : null,
      );
    }
  }
}

/**
 * Hranice přepážek pro P1 z formuláře (1,0 → 0,92; 1,1 → 0,80) a jestli D1 a D2 projdou.
 * `null`, když P1 chybí.
 */
export function dividerCheck(form: LidGeneratorForm): LidSheetFact['check'] {
  const limit = lidDividerLimit(form);
  if (!limit) return null;
  const at = `při P1 ${mmText(limit.p1Mm)}`;
  if (limit.maxMm === null) return { ok: false, text: `${at} střih nevyjde` };
  const dividers = [
    ['D1', num(form.d1)],
    ['D2', num(form.d2)],
  ] as const;
  const over = dividers.filter(([, v]) => v !== undefined && v > limit.maxMm! + 1e-9);
  const text = `přepážky max ${formatDecimal(limit.maxMm, 2)} mm (${at})`;
  if (over.length === 0) {
    // „V pořádku“ jen, když jsou zadané obě přepážky; jinak jen mez, nic se netvrdí.
    const missing = dividers.filter(([, v]) => v === undefined).map(([n]) => n);
    return missing.length === 0
      ? { ok: true, text }
      : { ok: null, text: `${text}, ${missing.join(' a ')} zatím nezadané` };
  }
  return {
    ok: false,
    text: `${text}: ${over.map(([n, v]) => `${n} ${formatDecimal(v!)}`).join(' a ')} nad hranicí`,
  };
}
