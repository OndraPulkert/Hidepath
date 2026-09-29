import {
  DEFAULT_LID_WALLET,
  type LidWalletSpec,
  checkLidWallet,
  fmt,
  lidWalletVariant,
} from '../geometry/lid-wallet';
import { LID_P1_RANGE_MM, LID_THIN_LEATHER_RANGE_MM, buildLidSheets } from './lid-wallet-sheets';

/**
 * Listy peněženky VÍČKO pro změřenou kůži přímo v aplikaci (bez repozitáře). Dělá totéž co
 * `pnpm pattern:wallet-lid --divider … --lining … [--p1 …] [--skive-fold 0.6] [--skive-hinge 0.6]`
 * (docs/zadani/penezenka-vicko.md, krok 0(a) a krok 1): stejné meze, stejné kontroly modelu,
 * stejné kreslení. Hodnoty z papírového modelu P0 (k, zvednutí na klínu, bankovky) sem nepatří,
 * ty mění výchozí hodnoty modelu; zapíšou se a střih přepočítá ten, kdo ho udržuje (oddíl 12.1).
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
}

export interface LidGeneratedSheet {
  /** Název souboru bez přípony, stejný jako z generátoru (`penezenka-vicko-sablona`). */
  name: string;
  svg: string;
}

export type LidSheetsResult =
  | { ok: true; spec: LidWalletSpec; label: string; sheets: LidGeneratedSheet[] }
  | { ok: false; problems: string[] };

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
  const spec = lidWalletVariant({
    p1Mm: p1,
    dividerMm: input.dividerMm,
    liningMm: input.liningMm,
    ...(input.skiveFold ? { bottomFoldSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
    ...(input.skiveHinge ? { hingeSkiveMm: LID_SKIVE_BACKUP_MM } : {}),
  });
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
  return parts.join(' · ');
}

/**
 * Vygeneruje 4 listy (SVG 1:1) pro změřenou kůži. Když zadání nebo kontroly modelu neprojdou,
 * vrátí česky, co neplatí – stejně jako generátor, který v tom případě nic nezapíše.
 */
export function lidSheetsForMeasured(input: LidMeasuredInput): LidSheetsResult {
  const parsed = lidSpecFromMeasured(input);
  if ('problems' in parsed) return { ok: false, problems: parsed.problems };
  const { spec } = parsed;
  const problems = checkLidWallet(spec);
  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, spec, label: lidVariantLabel(spec), sheets: buildLidSheets(spec) };
}
