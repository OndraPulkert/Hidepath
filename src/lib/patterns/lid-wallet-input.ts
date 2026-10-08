import {
  DEFAULT_LID_WALLET,
  LID_FULL_THICKNESS_MAX_MM,
  LID_SEAM_MAX_MM,
  type LidWalletSpec,
  checkLidWallet,
  fmt,
  lidWalletLayout,
  lidWalletThicknessExceeded,
  lidWalletVariant,
} from '../geometry/lid-wallet';
import { LID_P1_RANGE_MM, LID_THIN_LEATHER_RANGE_MM, buildLidSheets } from './lid-wallet-sheets';

/**
 * Listy peněženky VÍČKO pro změřenou kůži přímo v aplikaci (bez repozitáře). Dělá totéž co
 * `pnpm pattern:wallet-lid --divider … --lining … [--p1 …] [--skive-fold 0.6] [--skive-hinge 0.6]`
 * (docs/zadani/penezenka-vicko.md, krok 0(a) a krok 1): stejné meze, stejné kontroly modelu,
 * stejné kreslení. Navíc umí hodnoty z papírového modelu P0 (k, zvednutí na klínu, bankovky)
 * a jinou tloušťku magnetu: dosadí je do vstupů modelu z oddílu 12.1 (`kDesign`, `kMax`,
 * `wedgeLiftNom`, `wedgeLiftMax`, `billSheetMm`, `billHeight…`, `billHalfWidth…`,
 * `magnetThicknessMm`), které generátor bere z `DEFAULT_LID_WALLET`.
 */

/** Tloušťka po ztenčení v záloze B (oddíl 5.8: pás ohybu nebo závěsu z 1,0 na 0,6). */
export const LID_SKIVE_BACKUP_MM = 0.6;

/**
 * P1 se od 1,0 zadává, až když se liší o 0,05 mm a víc (krok 0(a)); menší rozdíl je výchozí
 * střih. Mez je v modelu i v textu lekce 1.
 */
export const LID_P1_TOLERANCE_MM = 0.05;

export interface LidMeasuredInput {
  /** Změřená tloušťka P1 (v záloze A změřená useň 0,8). */
  p1Mm: number;
  /** Větší ze změřených tlouštěk přepážek D1 a D2. */
  dividerMm: number;
  /** Změřená tloušťka podšívky L1. */
  liningMm: number;
  /** Záloha B1: ztenčit pás ohybu dna na 0,6 (`--skive-fold 0.6`). */
  skiveFold: boolean;
  /** Záloha B2: ztenčit pás závěsu na 0,6 (`--skive-hinge 0.6`). */
  skiveHinge: boolean;
  /** Výsledky P0 (lekce 2) a k z lekce 10; chybějící hodnota = hodnota modelu. */
  p0?: LidP0Input;
  /** Tloušťka zvoleného magnetu Ø 8 (lekce 11); chybí = 1,5 z modelu. */
  magnetThicknessMm?: number;
}

/** Naměřené hodnoty z P0 a lekce 10. Každá je volitelná, chybějící platí podle modelu. */
export interface LidP0Input {
  /** k = (y_C − y_A) / (P(C) − P(A)) z P0-3 nebo z lekce 10. */
  k?: number;
  /** Δ_k: o kolik výš nad lepením G2 sedí spodní hrana svazku karet (P0-6), mm. */
  cardLiftMm?: number;
  /** Δ_c: o kolik výš nad lepením G3a sedí sloupec mincí (P0-6), mm. */
  coinLiftMm?: number;
  /** Tloušťka jedné (nesložené) bankovky, nejtlustší z měřených (P0-1). */
  billSheetMm?: number;
  /** Výška bankovky, nejmenší a největší z měřených (P0-1). */
  billHeightMinMm?: number;
  billHeightMaxMm?: number;
  /** Šířka bankovky složené napůl, nejmenší a největší z měřených (P0-1). */
  billHalfWidthMinMm?: number;
  billHalfWidthMaxMm?: number;
}

/** Hodnoty modelu, se kterými se P0 porovnává (do formuláře jako „model počítá s …“). */
export function lidP0ModelValues(base: LidWalletSpec = DEFAULT_LID_WALLET): Required<LidP0Input> & {
  kMax: number;
  magnetThicknessMm: number;
} {
  return {
    k: base.kDesign,
    kMax: base.kMax,
    cardLiftMm: round2(base.wedgeLiftNom * base.cardsMax * base.cardThicknessMm),
    coinLiftMm: round2(base.wedgeLiftNom * base.coinThicknessMaxMm),
    billSheetMm: base.billSheetMm,
    billHeightMinMm: base.billHeightMinMm,
    billHeightMaxMm: base.billHeightMaxMm,
    billHalfWidthMinMm: base.billHalfWidthMinMm,
    billHalfWidthMaxMm: base.billHalfWidthMaxMm,
    magnetThicknessMm: base.magnetThicknessMm,
  };
}

const round2 = (v: number): number => Math.round(v * 100) / 100;
const round3 = (v: number): number => Math.round(v * 1000) / 1000;

/**
 * Výchozí model s dosazenými výsledky P0 a tloušťkou magnetu (oddíl 12.1 a 12.3):
 * - k do k max (1,24) listy nemění; nad ním `kDesign` = `kMax` = změřené k (oddíl 12.3).
 * - Δ_k a Δ_c se převedou na δ (Δ_k = δ · n_k · t_k, Δ_c = δ · t_c). Model má jedno δ, proto
 *   bere větší z obou (chybějící = δ modelu); `wedgeLiftMax` zůstává, jen když je δ větší, zvedne se.
 * - Rozměry a tloušťka bankovek a tloušťka magnetu se dosadí přímo.
 */
export function lidBaseWithP0(
  p0: LidP0Input = {},
  magnetThicknessMm?: number,
  base: LidWalletSpec = DEFAULT_LID_WALLET,
): LidWalletSpec {
  const spec: LidWalletSpec = { ...base };
  if (p0.k !== undefined && p0.k > base.kMax + 1e-9) {
    spec.kDesign = p0.k;
    spec.kMax = p0.k;
  }
  if (p0.cardLiftMm !== undefined || p0.coinLiftMm !== undefined) {
    const deltaCards =
      p0.cardLiftMm !== undefined
        ? round3(p0.cardLiftMm / (base.cardsMax * base.cardThicknessMm))
        : base.wedgeLiftNom;
    const deltaCoins =
      p0.coinLiftMm !== undefined
        ? round3(p0.coinLiftMm / base.coinThicknessMaxMm)
        : base.wedgeLiftNom;
    spec.wedgeLiftNom = Math.max(deltaCards, deltaCoins);
    spec.wedgeLiftMax = Math.max(base.wedgeLiftMax, spec.wedgeLiftNom);
  }
  if (p0.billSheetMm !== undefined) spec.billSheetMm = p0.billSheetMm;
  if (p0.billHeightMinMm !== undefined) spec.billHeightMinMm = p0.billHeightMinMm;
  if (p0.billHeightMaxMm !== undefined) spec.billHeightMaxMm = p0.billHeightMaxMm;
  if (p0.billHalfWidthMinMm !== undefined) spec.billHalfWidthMinMm = p0.billHalfWidthMinMm;
  if (p0.billHalfWidthMaxMm !== undefined) spec.billHalfWidthMaxMm = p0.billHalfWidthMaxMm;
  if (magnetThicknessMm !== undefined) spec.magnetThicknessMm = magnetThicknessMm;
  return spec;
}

/** Textová pole formuláře pro P0 a magnet (prázdné = hodnota modelu). */
export interface LidP0Fields {
  k: string;
  cardLift: string;
  coinLift: string;
  billSheet: string;
  billHeightMin: string;
  billHeightMax: string;
  billHalfWidthMin: string;
  billHalfWidthMax: string;
  magnetThickness: string;
}

export const EMPTY_LID_P0_FIELDS: LidP0Fields = {
  k: '',
  cardLift: '',
  coinLift: '',
  billSheet: '',
  billHeightMin: '',
  billHeightMax: '',
  billHalfWidthMin: '',
  billHalfWidthMax: '',
  magnetThickness: '',
};

/**
 * Přečte pole P0 a magnetu. Prázdné pole = hodnota modelu. Vrací česky, co není číslo nebo
 * nedává smysl (nula, nejmenší větší než největší); meze střihu pak hlídají kontroly modelu.
 */
export function parseLidP0Fields(
  fields: LidP0Fields,
  base: LidWalletSpec = DEFAULT_LID_WALLET,
): { p0: LidP0Input; magnetThicknessMm?: number } | { problems: string[] } {
  const problems: string[] = [];
  const read = (raw: string, name: string, zeroOk = false): number | undefined => {
    if (raw.trim() === '') return undefined;
    const v = parseMm(raw);
    if (v === undefined || (!zeroOk && v <= 0)) {
      problems.push(`${name}: zadejte ${zeroOk ? 'číslo 0 nebo větší' : 'kladné číslo'}.`);
      return undefined;
    }
    return v;
  };
  const p0: LidP0Input = {};
  const set = <K extends keyof LidP0Input>(key: K, v: number | undefined) => {
    if (v !== undefined) p0[key] = v;
  };
  set('k', read(fields.k, 'k'));
  set('cardLiftMm', read(fields.cardLift, 'Zvednutí karet', true));
  set('coinLiftMm', read(fields.coinLift, 'Zvednutí mincí', true));
  set('billSheetMm', read(fields.billSheet, 'Tloušťka bankovky'));
  set('billHeightMinMm', read(fields.billHeightMin, 'Nejmenší výška bankovky'));
  set('billHeightMaxMm', read(fields.billHeightMax, 'Největší výška bankovky'));
  set('billHalfWidthMinMm', read(fields.billHalfWidthMin, 'Nejmenší šířka bankovky napůl'));
  set('billHalfWidthMaxMm', read(fields.billHalfWidthMax, 'Největší šířka bankovky napůl'));
  const magnet = read(fields.magnetThickness, 'Tloušťka magnetu');
  if (problems.length > 0) return { problems };
  const hMin = p0.billHeightMinMm ?? base.billHeightMinMm;
  const hMax = p0.billHeightMaxMm ?? base.billHeightMaxMm;
  if (hMin > hMax) {
    problems.push(`Nejmenší výška bankovky ${fmt(hMin)} mm je větší než největší ${fmt(hMax)} mm.`);
  }
  const wMin = p0.billHalfWidthMinMm ?? base.billHalfWidthMinMm;
  const wMax = p0.billHalfWidthMaxMm ?? base.billHalfWidthMaxMm;
  if (wMin > wMax) {
    problems.push(
      `Nejmenší šířka bankovky napůl ${fmt(wMin)} mm je větší než největší ${fmt(wMax)} mm.`,
    );
  }
  if (problems.length > 0) return { problems };
  return magnet !== undefined ? { p0, magnetThicknessMm: magnet } : { p0 };
}

export interface LidGeneratedSheet {
  /** Název souboru bez přípony, stejný jako z generátoru (`penezenka-vicko-sablona`). */
  name: string;
  svg: string;
}

/**
 * Překročená mez modelu, kterou lze pro zkušební kus obejít: `label` je krátký popis do pruhu
 * na listu, `consequence` co z toho podle návrhu plyne (jen to, co návrh uvádí).
 */
export interface LidLimitExceeded {
  id: 'seam' | 'full' | 'divider';
  /** Např. „šev S4/S5 3,1 mm (max 3,0)“. */
  label: string;
  consequence: string;
}

/**
 * - `ok: true` – listy jsou hotové; s `outsideLimits` jsou mimo ověřené meze (jen zkušební kus).
 * - `kind: 'invalid'` – zadání mimo rozsah generátoru nebo nesmyslné; blokuje vždy.
 * - `kind: 'limits'` – neprošly jen meze tloušťky (švy, plná tloušťka, z nich hranice přepážek);
 *   listy jde přesto vygenerovat pro zkušební kus (`lidSheetsForMeasured(…, { trial: true })`).
 * - `kind: 'model'` – neprošly i jiné kontroly modelu; blokuje vždy.
 */
export type LidSheetsResult =
  | {
      ok: true;
      spec: LidWalletSpec;
      label: string;
      sheets: LidGeneratedSheet[];
      outsideLimits?: LidLimitExceeded[];
    }
  | { ok: false; kind: 'invalid' | 'model'; problems: string[] }
  | { ok: false; kind: 'limits'; problems: string[]; exceeded: LidLimitExceeded[] };

/** Číslo v mm z pole formuláře: desetinná čárka i tečka; `undefined`, když to číslo není. */
export function parseMm(raw: string): number | undefined {
  const t = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return undefined;
  const v = Number(t);
  return Number.isFinite(v) ? v : undefined;
}

/** Spec pro zadané tloušťky, nebo seznam, co v zadání neplatí (meze jako u generátoru). */
export function lidSpecFromMeasured(
  input: LidMeasuredInput,
): { spec: LidWalletSpec } | { problems: string[] } {
  const problems: string[] = [];
  const inRange = (name: string, v: number, [min, max]: readonly [number, number]) => {
    if (!Number.isFinite(v) || v < min || v > max) {
      problems.push(`${name} musí být mezi ${fmt(min)} a ${fmt(max)} mm.`);
    }
  };
  inRange('Tloušťka P1', input.p1Mm, LID_P1_RANGE_MM);
  inRange('Tloušťka přepážek', input.dividerMm, LID_THIN_LEATHER_RANGE_MM);
  inRange('Tloušťka podšívky L1', input.liningMm, LID_THIN_LEATHER_RANGE_MM);
  if (problems.length > 0) return { problems };
  const p1 =
    Math.abs(input.p1Mm - DEFAULT_LID_WALLET.leatherMm) < LID_P1_TOLERANCE_MM - 1e-9
      ? DEFAULT_LID_WALLET.leatherMm
      : input.p1Mm;
  const spec = lidWalletVariant(
    {
      p1Mm: p1,
      dividerMm: input.dividerMm,
      liningMm: input.liningMm,
      ...(input.skiveFold ? { bottomFoldSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
      ...(input.skiveHinge ? { hingeSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
    },
    lidBaseWithP0(input.p0, input.magnetThicknessMm),
  );
  return { spec };
}

/** Krátký popis sestavy pro nadpis skupiny listů, např. „P1 1,0 · přepážky 0,8 · L1 0,9“. */
export function lidVariantLabel(spec: LidWalletSpec): string {
  const t = (v: number) => v.toFixed(2).replace(/0$/, '').replace('.', ',');
  const parts = [
    `P1 ${t(spec.leatherMm)}`,
    `přepážky ${t(spec.dividerMm)}`,
    `L1 ${t(spec.liningMm)}`,
  ];
  if (spec.bottomFoldSkiveMm !== null)
    parts.push(`ohyb dna ztenčený na ${t(spec.bottomFoldSkiveMm)}`);
  if (spec.hingeSkiveMm !== null) parts.push(`závěs ztenčený na ${t(spec.hingeSkiveMm)}`);
  const d = DEFAULT_LID_WALLET;
  const differs = (a: number, b: number) => Math.abs(a - b) > 1e-9;
  if (differs(spec.kDesign, d.kDesign) || differs(spec.kMax, d.kMax)) {
    parts.push(`k ${fmt(spec.kDesign)}`);
  }
  if (differs(spec.wedgeLiftNom, d.wedgeLiftNom) || differs(spec.wedgeLiftMax, d.wedgeLiftMax)) {
    const m = lidP0ModelValues(spec);
    parts.push(`zvednutí karet ${fmt(m.cardLiftMm)} a mincí ${fmt(m.coinLiftMm)}`);
  }
  if (
    differs(spec.billSheetMm, d.billSheetMm) ||
    differs(spec.billHeightMinMm, d.billHeightMinMm) ||
    differs(spec.billHeightMaxMm, d.billHeightMaxMm) ||
    differs(spec.billHalfWidthMinMm, d.billHalfWidthMinMm) ||
    differs(spec.billHalfWidthMaxMm, d.billHalfWidthMaxMm)
  ) {
    parts.push(
      `bankovky v ${fmt(spec.billHeightMinMm)}–${fmt(spec.billHeightMaxMm)}, napůl ${fmt(spec.billHalfWidthMinMm)}–${fmt(spec.billHalfWidthMaxMm)}, list ${fmt(spec.billSheetMm)}`,
    );
  }
  if (differs(spec.magnetThicknessMm, d.magnetThicknessMm)) {
    parts.push(`magnet Ø ${fmt(spec.magnetDiameterMm)} × ${fmt(spec.magnetThicknessMm)}`);
  }
  return parts.join(' · ');
}

/** Co se stane mimo mez – jen podle návrhu (docs/zadani/penezenka-vicko.md, 5.6 a 10.1). */
const CONSEQUENCE = {
  seam: 'Model pouští švy nejvýš 3,0 mm. Co tlustší šev udělá s děrováním a šitím, návrh neuvádí – ověřte na zkušebním kuse.',
  full: 'Hranice ≈ 12 mm je podle návrhu přijatá a měkká. Jak se tlustší peněženka zavírá a nosí, návrh neuvádí – ověřte na zkušebním kuse.',
  divider:
    'Hranice přepážek plyne z obou mezí tloušťky; návrh tlustší přepážku nepouští. Ověřte na zkušebním kuse.',
} as const;

/**
 * Překročené meze tloušťky pro listy zkušebního kusu: švy se stejnou tloušťkou spojí
 * (S4/S5), z obou sestav (zaokrouhlená P1 a skutečná P1) vezme větší hodnotu.
 */
export function lidLimitsExceeded(
  specs: readonly LidWalletSpec[],
  divider: { mm: number; maxMm: number | null; p1Mm: number },
): LidLimitExceeded[] {
  const seams = new Map<string, number>();
  let full: number | null = null;
  for (const spec of specs) {
    for (const t of lidWalletThicknessExceeded(spec)) {
      if (t.kind === 'full') full = Math.max(full ?? 0, t.valueMm);
      else if (t.seamId !== null)
        seams.set(t.seamId, Math.max(seams.get(t.seamId) ?? 0, t.valueMm));
    }
  }
  const out: LidLimitExceeded[] = [];
  const byValue = new Map<string, string[]>();
  for (const [id, v] of seams) byValue.set(fmt(v), [...(byValue.get(fmt(v)) ?? []), id]);
  for (const [v, ids] of byValue) {
    out.push({
      id: 'seam',
      label: `šev ${ids.join('/')} ${v} mm (max ${LID_SEAM_MAX_MM.toFixed(1).replace('.', ',')})`,
      consequence: CONSEQUENCE.seam,
    });
  }
  if (full !== null) {
    out.push({
      id: 'full',
      label: `plná tloušťka ${fmt(full)} mm (hranice ≈ ${fmt(LID_FULL_THICKNESS_MAX_MM)})`,
      consequence: CONSEQUENCE.full,
    });
  }
  if (divider.maxMm !== null && divider.mm > divider.maxMm + 1e-9) {
    out.push({
      id: 'divider',
      label: `přepážky ${fmt(divider.mm)} mm (při P1 ${fmt(divider.p1Mm)} max ${fmt(divider.maxMm)})`,
      consequence: CONSEQUENCE.divider,
    });
  }
  return out;
}

/**
 * Vygeneruje 4 listy (SVG 1:1) pro změřenou kůži. Když zadání nebo kontroly modelu neprojdou,
 * vrátí česky, co neplatí – stejně jako generátor, který v tom případě nic nezapíše. Když
 * neprojdou jen meze tloušťky (`kind: 'limits'`), `trial: true` listy přesto vygeneruje pro
 * zkušební kus: geometrie se počítá normálně, listy nesou varovný pruh s překročenými mezemi.
 */
export function lidSheetsForMeasured(
  input: LidMeasuredInput,
  options: { trial?: boolean } = {},
): LidSheetsResult {
  const parsed = lidSpecFromMeasured(input);
  if ('problems' in parsed) return { ok: false, kind: 'invalid', problems: parsed.problems };
  const { spec } = parsed;
  const problems = checkLidWallet(spec);
  // Se skutečnou P1 se kontroluje i tehdy, když se P1 v toleranci zaokrouhlila na výchozí 1,0
  // (P1 1,04 s přepážkami 0,92 dá plnou tloušťku 12,08 a šev S4 3,0).
  const measured = { ...spec, leatherMm: input.p1Mm };
  const sameP1 = measured.leatherMm === spec.leatherMm;
  const measuredProblems = sameP1 ? problems : checkLidWallet(measured);
  if (problems.length === 0 && measuredProblems.length === 0) {
    return { ok: true, spec, label: lidVariantLabel(spec), sheets: buildLidSheets(spec) };
  }
  // Přepážky nad hranicí: řekněte rovnou, jak tlusté projdou (hlášky modelu mluví o plné
  // tloušťce a švech S4/S5, ne o přepážkách).
  const max = lidMaxDividerMm(measured);
  const shown = problems.length > 0 ? problems : measuredProblems;
  const tooThick = max !== null && input.dividerMm > max + 1e-9;
  const messages = tooThick
    ? [
        `Přepážky ${fmt(input.dividerMm)} mm jsou při P1 ${fmt(input.p1Mm)} mm moc tlusté: projdou nejvýš ${fmt(max)} mm. Vyřízněte je z tenčího místa kozinky, nebo kupte tenčí.`,
        ...shown,
      ]
    : shown;
  // Obejít jde jen meze tloušťky: ostatní kontroly musí projít i bez nich.
  const onlyThickness =
    checkLidWallet(spec, { allowThickness: true }).length === 0 &&
    (sameP1 || checkLidWallet(measured, { allowThickness: true }).length === 0);
  if (!onlyThickness) return { ok: false, kind: 'model', problems: messages };
  const exceeded = lidLimitsExceeded(sameP1 ? [spec] : [spec, measured], {
    mm: input.dividerMm,
    maxMm: max,
    p1Mm: input.p1Mm,
  });
  if (!options.trial) return { ok: false, kind: 'limits', problems: messages, exceeded };
  const sheets = buildLidSheets(spec, { outsideLimits: exceeded.map((e) => e.label) });
  return { ok: true, spec, label: lidVariantLabel(spec), sheets, outsideLimits: exceeded };
}

/**
 * Nejtlustší přepážky D1/D2 (po 0,01 mm), se kterými střih pro danou sestavu (P1, L1, zálohy,
 * P0) ještě projde kontrolami; `null`, když neprojdou ani nejtenčí. Hranici dává plná tloušťka
 * (≈ 12) a švy S4/S5 (2 × P1 + přepážka): při P1 1,0 je to 0,92, tlustší P1 ji snižuje
 * (1,05 → 0,87, 1,1 → 0,80, 1,2 → 0,60), tenčí zvyšuje (0,9 → 1,02).
 */
export function lidMaxDividerMm(spec: LidWalletSpec): number | null {
  const [min, maxRange] = LID_THIN_LEATHER_RANGE_MM;
  let best: number | null = null;
  for (let i = Math.round(min * 100); i <= Math.round(maxRange * 100); i++) {
    const d = i / 100;
    if (checkLidWallet({ ...spec, dividerMm: d }).length > 0) break;
    best = d;
  }
  return best;
}

/**
 * Stav formuláře „Listy pro vaši kůži“: textová pole tak, jak je uživatel napsal. Je to jediný
 * zdroj tlouštěk, výsledků P0, k, magnetu a záloh peněženky Víčko (ukládá se do zápisníku jako
 * JSON, lekce ho jen zobrazují).
 */
export interface LidGeneratorForm {
  /** Změřená P1 z usně 1,0 (kaštan). */
  p1: string;
  /** Záloha A: celý P1 z usně 0,8 (do listů jde `p1BackupA`). */
  backupA: boolean;
  /** Změřená useň 0,8 na P1 (jen záloha A). */
  p1BackupA: string;
  /** Změřená přepážka D1 (nebarvená kozinka). */
  d1: string;
  /** Změřená přepážka D2 (čokoládová kozinka). */
  d2: string;
  lining: string;
  skiveFold: boolean;
  skiveHinge: boolean;
  p0: LidP0Fields;
}

/** Tloušťka usně 0,8 v záloze A, dokud není změřená. */
export const LID_BACKUP_A_NOMINAL = '0,8';

/** Prázdný formulář: P1 předvyplněná výchozí 1,0 (useň 0,8 v záloze A 0,8), bez záloh. */
export const DEFAULT_LID_GENERATOR_FORM: LidGeneratorForm = {
  p1: '1,0',
  backupA: false,
  p1BackupA: LID_BACKUP_A_NOMINAL,
  d1: '',
  d2: '',
  lining: '',
  skiveFold: false,
  skiveHinge: false,
  p0: EMPTY_LID_P0_FIELDS,
};

/** Tloušťka P1, se kterou se počítá: v záloze A změřená useň 0,8, jinak useň 1,0. */
export const lidP1Text = (form: Pick<LidGeneratorForm, 'p1' | 'backupA' | 'p1BackupA'>): string =>
  form.backupA ? form.p1BackupA : form.p1;

/**
 * Povolené kombinace záloh: useň 0,8 (záloha A) se neztenčuje, B1 i B2 jsou na usni 1,0
 * (lekce 3 a 5, zkouška V6(c)). `null` = v pořádku.
 */
export function lidBackupProblem(
  form: Pick<LidGeneratorForm, 'backupA' | 'skiveFold' | 'skiveHinge'>,
): string | null {
  if (form.backupA && (form.skiveFold || form.skiveHinge)) {
    return 'Záloha A (useň 0,8) se neztenčuje: B1 ani B2 s ní nejdou. V záloze B2 je P1 zase z usně 1,0 – zálohu A zrušte.';
  }
  return null;
}

/**
 * Nejdelší text pole formuláře listů (bez mezer na krajích). Uložený stav je JSON v jednom
 * zápisu zápisníku, který se musí vejít do 2000 znaků (`lesson_records_value_size`).
 */
export const LID_FORM_FIELD_MAX_LENGTH = 16;

/**
 * Textová pole, která jsou vyplněná, ale nejsou číslo (česky), nebo jsou delší než
 * `LID_FORM_FIELD_MAX_LENGTH`. Takový formulář se neuloží; prázdné pole uložit jde (doplní se
 * později).
 */
export function lidFormInvalidFields(form: LidGeneratorForm): string[] {
  const out: string[] = [];
  const check = (raw: string, name: string) => {
    if (raw.trim().length > LID_FORM_FIELD_MAX_LENGTH) {
      out.push(`${name}: zadejte kratší číslo (nejvýš ${LID_FORM_FIELD_MAX_LENGTH} znaků).`);
    } else if (raw.trim() !== '' && parseMm(raw) === undefined) {
      out.push(`${name}: zadejte číslo v mm.`);
    }
  };
  check(form.p1, 'P1');
  check(form.p1BackupA, 'P1 z usně 0,8');
  check(form.d1, 'D1');
  check(form.d2, 'D2');
  check(form.lining, 'Podšívka L1');
  for (const key of Object.keys(form.p0) as (keyof LidP0Fields)[]) {
    const raw = form.p0[key];
    if (raw.trim().length > LID_FORM_FIELD_MAX_LENGTH) check(raw, key);
  }
  if (out.length > 0) return out;
  const p0 = parseLidP0Fields(form.p0);
  if ('problems' in p0) out.push(...p0.problems);
  return out;
}

/**
 * Přečte celý formulář na vstup generátoru. Chybějící tloušťka, nesmyslná hodnota P0 nebo
 * nepovolená kombinace záloh vrátí česky, co opravit; meze střihu a kontroly modelu hlídá až
 * `lidSheetsForMeasured`. Přepážky = větší z D1 a D2 (vybírá aplikace, ne uživatel).
 */
export function parseLidGeneratorForm(
  form: LidGeneratorForm,
): { input: LidMeasuredInput } | { problems: string[] } {
  const p1 = parseMm(lidP1Text(form));
  const d1 = parseMm(form.d1);
  const d2 = parseMm(form.d2);
  const lining = parseMm(form.lining);
  const problems = [
    p1 === undefined
      ? form.backupA
        ? 'Zadejte změřenou tloušťku usně 0,8 v mm (záloha A, např. 0,82).'
        : 'Zadejte tloušťku P1 v mm (např. 0,95).'
      : null,
    d1 === undefined ? 'Zadejte tloušťku přepážky D1 v mm (např. 0,7).' : null,
    d2 === undefined ? 'Zadejte tloušťku přepážky D2 v mm (např. 0,8).' : null,
    lining === undefined ? 'Zadejte tloušťku podšívky L1 v mm (např. 0,9).' : null,
    lidBackupProblem(form),
  ].filter((m): m is string => m !== null);
  const p0 = parseLidP0Fields(form.p0);
  if ('problems' in p0) problems.push(...p0.problems);
  if (
    problems.length > 0 ||
    'problems' in p0 ||
    p1 === undefined ||
    d1 === undefined ||
    d2 === undefined ||
    lining === undefined
  ) {
    return { problems };
  }
  return {
    input: {
      p1Mm: p1,
      dividerMm: Math.max(d1, d2),
      liningMm: lining,
      skiveFold: form.skiveFold,
      skiveHinge: form.skiveHinge,
      p0: p0.p0,
      ...(p0.magnetThicknessMm !== undefined ? { magnetThicknessMm: p0.magnetThicknessMm } : {}),
    },
  };
}

const inRange = (v: number | undefined, [min, max]: readonly [number, number]) =>
  v !== undefined && v >= min - 1e-9 && v <= max + 1e-9;

/**
 * Hranice přepážek pro zadanou sestavu (P1 podle zálohy, L1, zálohy B, P0 a magnet): nejtlustší
 * D1/D2, se kterými střih projde (`lidMaxDividerMm`). Při P1 1,0 je to 0,92, při 1,1 jen 0,80.
 * Chybějící L1 nebo P0 = hodnota modelu. `null`, když P1 není zadaná nebo je mimo rozsah.
 */
export function lidDividerLimit(
  form: LidGeneratorForm,
): { p1Mm: number; maxMm: number | null } | null {
  const p1Mm = parseMm(lidP1Text(form));
  if (p1Mm === undefined || !inRange(p1Mm, LID_P1_RANGE_MM)) return null;
  const lining = parseMm(form.lining);
  const p0 = parseLidP0Fields(form.p0);
  const base = 'problems' in p0 ? DEFAULT_LID_WALLET : lidBaseWithP0(p0.p0, p0.magnetThicknessMm);
  const spec = lidWalletVariant(
    {
      p1Mm,
      ...(lining !== undefined && inRange(lining, LID_THIN_LEATHER_RANGE_MM)
        ? { liningMm: lining }
        : {}),
      ...(form.skiveFold ? { bottomFoldSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
      ...(form.skiveHinge ? { hingeSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
    },
    base,
  );
  return { p1Mm, maxMm: lidMaxDividerMm(spec) };
}

/**
 * Okno lepení magnetu a jeho značka (výška od spodní hrany ve stavu B) pro listy z formuláře,
 * stejně jako v rámečku na listu 4. `null`, když z formuláře listy spočítat nejdou.
 */
export function lidMagnetWindow(
  form: LidGeneratorForm,
): { minMm: number; maxMm: number; markMm: number } | null {
  const parsed = parseLidGeneratorForm(form);
  if ('problems' in parsed) return null;
  const spec = lidSpecFromMeasured(parsed.input);
  if ('problems' in spec) return null;
  const layout = lidWalletLayout(spec.spec);
  return { minMm: layout.magnetYBMin, maxMm: layout.magnetYBMax, markMm: layout.magnetYB };
}
