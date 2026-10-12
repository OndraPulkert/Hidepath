/**
 * Poutko pásku (projekt 04): délka proužku, kus pásu na poutko, ztenčení konců a rozpis pro
 * kalkulačku v lekci 4. Čisté funkce bez Reactu; vzorec délky je jeden, z modelu
 * `src/lib/geometry/belt-end.ts` (3 vrstvy pásu + π × tloušťka poutka + přeplátování).
 *
 * Poutko je buď z téhož řemene (výchozí: proužek 12 mm uříznutý podélně ze zbytku pásu, tloušťka
 * poutka = tloušťka pásu), nebo z jiné, tenčí kůže (zadaná tloušťka, výchozí 1,2 mm). Ztenčení
 * konců a čísla klínu nikdo zatím nevyzkoušel: ověřte na odřezku.
 */
import {
  type BeltEndSpec,
  DEFAULT_BELT_END,
  keeperBendAllowanceMm,
  keeperWrapPerimeterMm,
} from '../geometry/belt-end';
import { cz } from './belt-sheets';

/** Tloušťka poutka z jiné kůže, když ji uživatel nezadá (odřezek 1,2 mm z pouzdra na karty). */
export const KEEPER_OTHER_LEATHER_MM = DEFAULT_BELT_END.keeperThicknessMm;

/** Meze tloušťky poutka z jiné kůže: jen pojistka proti překlepu. */
export const KEEPER_THICKNESS_LIMITS = { min: 0.8, max: 4 } as const;

/** Rezerva na kus pásu pro poutko (kolmý řez a srovnání konců), mm. */
export const KEEPER_PIECE_MARGIN_MM = 10;

/**
 * Ztenčení konců poutka z pásu: klín 15 mm (= přeplátování) od plné tloušťky na 0,5–1 mm
 * na samém konci. Horní (vnější) konec se ztenčuje z rubu, spodní z líce.
 */
export const KEEPER_SKIVE = { wedgeMm: 15, endMinMm: 0.5, endMaxMm: 1 } as const;

/**
 * Změřený obvod 3 vrstev se použije, jen když se od spočítaného liší nejvýš o 15 %: pojistka
 * proti překlepu a proti obvodu změřenému na jiném pásku (zápis není vázaný na pásek).
 */
export const MEASURED_WRAP_TOLERANCE = 0.15;

/** Špalík do poutka (lepení a steh přeplátování) je o tolik užší než pás, mm. */
export const KEEPER_BLOCK_NARROWER_MM = 5;

const r1 = (v: number): number => Math.round(v * 10) / 10;
const floor1 = (v: number): number => Math.floor(v * 10 + 1e-9) / 10;

/** Klín na koncích poutka z pásu. */
export interface KeeperSkive {
  wedgeMm: number;
  /** Tloušťka na samém konci (od–do). */
  endMm: [number, number];
  /** Tloušťka v polovině klínu (asi), při konci 1 mm. */
  midMm: number;
  /**
   * Spoj na sucho: oba klíny proti sobě dají plnou tloušťku + tloušťku konce, nejvýš tedy
   * tloušťka pásu + 1 mm.
   */
  jointMaxMm: number;
}

/**
 * Špalík vsunutý do poutka pod přeplátování: užší než pás a nejvýš tak silný jako vnitřek
 * poutka (3 vrstvy pásu), jinak se dovnitř nevejde.
 */
export interface KeeperBlock {
  /** Asi šířka pásu − 5 mm. */
  widthMm: number;
  /** Nejvýš 3 × tloušťka pásu, dolů na celé mm. */
  maxThicknessMm: number;
}

export interface KeeperCalculation {
  /** Šířka pásu, mm. */
  beltWidthMm: number;
  /** Tloušťka pásu, mm. */
  beltThicknessMm: number;
  /** Poutko z téhož řemene. */
  fromStrap: boolean;
  /** Tloušťka poutka, mm (z pásu = tloušťka pásu). */
  thicknessMm: number;
  /** Obvod 3 vrstev pásu ze vzorce 2 × (šířka + 3 × tloušťka). */
  computedWrapMm: number;
  /** Obvod změřený papírovým proužkem, když je zadaný; jinak `null`. */
  measuredWrapMm: number | null;
  /**
   * Zapsaný obvod, který se od spočítaného liší o víc než 15 % (překlep, jiný pásek): kalkulačka
   * s ním nepočítá a řekne proč; jinak `null`.
   */
  measuredIgnoredMm: number | null;
  /** Obvod, se kterým se počítá (změřený má přednost). */
  wrapMm: number;
  /** Přídavek na tloušťku poutka v ohybech: π × tloušťka poutka. */
  bendMm: number;
  /** Přeplátování konců. */
  overlapMm: number;
  /** Délka proužku na poutko, celé mm. */
  lengthMm: number;
  /** Šířka proužku. */
  widthMm: number;
  /** Kus pásu na poutko (délka proužku + rezerva, nahoru na cm); u jiné kůže 0. */
  pieceCm: number;
  /** Ztenčení konců (jen poutko z pásu), jinak `null`. */
  skive: KeeperSkive | null;
  /** Spoj v přeplátování: z pásu nejvýš tloušťka pásu + 1 mm, z jiné kůže 2 × tloušťka poutka. */
  jointMm: number;
  /** Špalík do poutka pro lepení a steh. */
  block: KeeperBlock;
}

export interface KeeperInput {
  beltWidthMm: number;
  beltThicknessMm: number;
  /** Chybí = ano (poutko z téhož řemene). */
  fromStrap?: boolean | undefined;
  /** Tloušťka poutka z jiné kůže; chybí = 1,2 mm. Při poutku z pásu se nepoužije. */
  otherThicknessMm?: number | undefined;
  /** Obvod 3 vrstev změřený proužkem, mm; přepíše spočítaný obvod. */
  measuredWrapMm?: number | null | undefined;
}

/** Tloušťka poutka: z pásu = tloušťka pásu, jinak zadaná (výchozí 1,2 mm). */
export function keeperThicknessFor(input: KeeperInput): number {
  return input.fromStrap === false
    ? (input.otherThicknessMm ?? KEEPER_OTHER_LEATHER_MM)
    : input.beltThicknessMm;
}

/** Kus pásu na poutko: délka proužku + 10 mm rezervy, nahoru na celé cm. */
export function keeperPieceCm(lengthMm: number): number {
  return Math.ceil((lengthMm + KEEPER_PIECE_MARGIN_MM) / 10 - 1e-9);
}

/** Klín pro poutko z pásu tloušťky `t`. */
export function keeperSkive(t: number): KeeperSkive {
  const { wedgeMm, endMinMm, endMaxMm } = KEEPER_SKIVE;
  return {
    wedgeMm,
    endMm: [endMinMm, endMaxMm],
    midMm: floor1((t + endMaxMm) / 2),
    jointMaxMm: r1(t + endMaxMm),
  };
}

/** Špalík do poutka pro pás šířky `w` a tloušťky `t`. */
export function keeperBlock(w: number, t: number): KeeperBlock {
  return {
    widthMm: w - KEEPER_BLOCK_NARROWER_MM,
    maxThicknessMm: Math.floor(3 * t + 1e-9),
  };
}

/** Změřený obvod je věrohodný: kladný a nejvýš o 15 % jiný než spočítaný. */
export function isPlausibleWrap(measuredMm: number, computedMm: number): boolean {
  return (
    Number.isFinite(measuredMm) &&
    measuredMm > 0 &&
    Math.abs(measuredMm - computedMm) <= computedMm * MEASURED_WRAP_TOLERANCE + 1e-9
  );
}

/**
 * Délka poutka a rozpis. Spočítaný obvod je z modelu (`keeperWrapPerimeterMm`); změřený obvod
 * (proužek kolem 3 vrstev) ho přepíše. Délka = obvod + π × tloušťka poutka + přeplátování,
 * zaokrouhleno na celé mm jako v modelu (`keeperStripLengthMm`).
 */
export function keeperCalculation(
  input: KeeperInput,
  base: BeltEndSpec = DEFAULT_BELT_END,
): KeeperCalculation {
  const fromStrap = input.fromStrap !== false;
  const thicknessMm = keeperThicknessFor(input);
  const spec: BeltEndSpec = {
    ...base,
    beltWidthMm: input.beltWidthMm,
    beltThicknessMm: input.beltThicknessMm,
    keeperThicknessMm: thicknessMm,
  };
  const computedExact = keeperWrapPerimeterMm(spec);
  const computedWrapMm = r1(computedExact);
  const entered =
    input.measuredWrapMm !== undefined &&
    input.measuredWrapMm !== null &&
    Number.isFinite(input.measuredWrapMm) &&
    input.measuredWrapMm > 0
      ? input.measuredWrapMm
      : null;
  const measured = entered !== null && isPlausibleWrap(entered, computedExact) ? entered : null;
  const wrapExact = measured ?? computedExact;
  const bendExact = keeperBendAllowanceMm(spec);
  const lengthMm = Math.round(wrapExact + bendExact + spec.keeperOverlapMm);
  return {
    beltWidthMm: input.beltWidthMm,
    beltThicknessMm: input.beltThicknessMm,
    fromStrap,
    thicknessMm,
    computedWrapMm,
    measuredWrapMm: measured,
    measuredIgnoredMm: entered !== null && measured === null ? entered : null,
    wrapMm: r1(wrapExact),
    bendMm: r1(bendExact),
    overlapMm: spec.keeperOverlapMm,
    lengthMm,
    widthMm: spec.keeperWidthMm,
    pieceCm: fromStrap ? keeperPieceCm(lengthMm) : 0,
    skive: fromStrap ? keeperSkive(input.beltThicknessMm) : null,
    jointMm: fromStrap ? keeperSkive(input.beltThicknessMm).jointMaxMm : r1(2 * thicknessMm),
    block: keeperBlock(input.beltWidthMm, input.beltThicknessMm),
  };
}

/**
 * Proč kalkulačka zapsaný obvod nepoužila; `null`, když ho použila nebo žádný není.
 */
export function measuredIgnoredText(c: KeeperCalculation): string | null {
  if (c.measuredIgnoredMm === null) return null;
  const pct = Math.round(MEASURED_WRAP_TOLERANCE * 100);
  return `Zapsaný obvod ${mm(c.measuredIgnoredMm)} se od spočítaného ${mm(c.computedWrapMm)} liší o víc než ${pct}\u00a0%: počítám se spočítaným. Překlep, nebo obvod z jiného pásku? Změřte znovu a zapište.`;
}

/**
 * Změřený obvod dá jiný proužek než nákup, list 1 a lekce 2 (ty počítají se spočítaným
 * obvodem). `base` = výpočet aktivního pásku bez změřeného obvodu; `null`, když se neliší.
 */
export function measuredDiffText(c: KeeperCalculation, base: KeeperCalculation): string | null {
  if (c.measuredWrapMm === null || c.lengthMm === base.lengthMm) return null;
  const piece =
    c.fromStrap && c.pieceCm !== base.pieceCm
      ? c.pieceCm > base.pieceCm
        ? ` Kus pásu ${c.pieceCm} cm je delší než ${base.pieceCm} cm v nákupu a v lekci 2: ověřte, že vám pás stačí.`
        : ` Kus pásu ${c.pieceCm} cm je kratší než ${base.pieceCm} cm v nákupu a v lekci 2.`
      : '';
  return `Se změřeným obvodem je proužek ${keeperStripText(c)}. Nákup, list 1 a lekce 2 počítají se spočítaným obvodem (${keeperStripText(base)}).${piece} Proužek řežte podle změřeného.`;
}

/** Špalík slovy: „asi 35 mm široký (užší než pás), nejvýš 10 mm silný“. */
export function keeperBlockText(c: KeeperCalculation): string {
  return `asi ${mm(c.block.widthMm)} široký (užší než pás), nejvýš ${mm(c.block.maxThicknessMm)} silný (vnitřek poutka jsou 3 vrstvy pásu); spoj asi ${mm(c.jointMm)}`;
}

/** Řádek rozpisu: co a kolik. */
export interface KeeperBreakdownLine {
  label: string;
  value: string;
}

const mm = (v: number): string => `${cz(v)} mm`;

/** Rozpis délky poutka pro kalkulačku: obvod + přídavek na tloušťku + přeplátování = délka. */
export function keeperBreakdown(c: KeeperCalculation): KeeperBreakdownLine[] {
  const wrap =
    c.measuredWrapMm === null
      ? `${mm(c.wrapMm)} (spočítaný: 2 × (${cz(c.beltWidthMm)} + 3 × ${cz(c.beltThicknessMm)}))`
      : `${mm(c.wrapMm)} (změřený proužkem; spočítaný ${mm(c.computedWrapMm)})`;
  return [
    { label: 'Obvod 3 vrstev', value: wrap },
    {
      label: 'Přídavek na tloušťku',
      value: `+ ${mm(c.bendMm)} (π × ${cz(c.thicknessMm)} mm, tloušťka poutka)`,
    },
    { label: 'Přeplátování', value: `+ ${mm(c.overlapMm)}` },
    { label: 'Délka proužku', value: `= ${mm(c.lengthMm)} (na celé mm)` },
  ];
}

/** „Proužek 12 × 127 mm“. */
export const keeperStripText = (c: KeeperCalculation): string =>
  `${cz(c.widthMm)} × ${mm(c.lengthMm)}`;

/** Klín slovy: „klín 15 mm, na konci 0,5–1 mm, v polovině asi 2,2 mm; spoj na sucho nejvýš asi 4,5 mm“. */
export function keeperSkiveText(s: KeeperSkive): string {
  return `klín ${mm(s.wedgeMm)}, na samém konci ${cz(s.endMm[0])}–${mm(s.endMm[1])}, v polovině asi ${mm(s.midMm)}; spoj na sucho nejvýš asi ${mm(s.jointMaxMm)}`;
}

/** Příklad pod kalkulačkou: pás 40 × 3,5 mm, poutko z téhož řemene, obvod spočítaný. */
export const KEEPER_EXAMPLE_INPUT: KeeperInput = {
  beltWidthMm: 40,
  beltThicknessMm: 3.5,
  fromStrap: true,
};

/** Příklad výpočtu jednou větou (čísla z `keeperCalculation`, ne opsaná). */
export function keeperExampleText(
  c: KeeperCalculation = keeperCalculation(KEEPER_EXAMPLE_INPUT),
): string {
  return `Příklad: pás ${cz(c.beltWidthMm)} × ${mm(c.beltThicknessMm)}, poutko z téhož řemene. Obvod 2 × (${cz(c.beltWidthMm)} + 3 × ${cz(c.beltThicknessMm)}) = ${mm(c.wrapMm)}, přídavek π × ${cz(c.thicknessMm)} = ${mm(c.bendMm)}, přeplátování ${mm(c.overlapMm)}: ${cz(c.wrapMm)} + ${cz(c.bendMm)} + ${cz(c.overlapMm)} = ${cz(r1(c.wrapMm + c.bendMm + c.overlapMm))}, tedy proužek ${keeperStripText(c)}. Z pásu na něj uřízněte kus ${c.pieceCm} cm.`;
}
