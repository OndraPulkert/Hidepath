/**
 * Rozměry konce opasku u přezky se dvěma nýty (tedy čtyřmi otvory) a poutkem.
 *
 * Čistá geometrie bez závislosti na vykreslování: kreslí se z ní 1:1 šablona
 * (`scripts/belt-buckle-end.ts`), ale všechna pravidla a kontroly jsou tady,
 * aby se daly testovat.
 *
 * Zdroje rozměrů – viz docs/content/sablony-zdroje.md:
 *  - drážka 25 × 6 mm a nýty ±25,5 / ±73,2 mm a konec 90 mm = odměřeno ze šablony
 *    Black Flag Leather Goods (jeden konzistentní zdroj, proto se nemíchá s CraftPointem),
 *  - Ø otvoru pro nýt 6 mm = shodně CraftPoint (6mm otvory pro nýty) i BFLG (odměřeno 5,7 mm),
 *  - poutko a zaoblení konce = volba této šablony, spočítané, ne ověřené praxí.
 */

export interface BeltEndSpec {
  /** Šířka pásu. */
  beltWidthMm: number;
  /** Tloušťka pásu – vstupuje do délky poutka (zdvojená část má 2×). */
  beltThicknessMm: number;
  /** Délka drážky pro trn; ohyb ji půlí, takže složený otvor je poloviční. */
  slotLengthMm: number;
  /** Šířka drážky = průměr průbojníku na její konce. */
  slotWidthMm: number;
  /** Průměr otvoru pro šroubovací nýt. */
  rivetHoleMm: number;
  /** Vzdálenosti obou nýtů od ohybu, vzestupně. */
  rivetOffsetsMm: [number, number];
  /** Délka přehnutého konce od ohybu. */
  tailLengthMm: number;
  /** Kolik hlavního pásu nad ohybem šablona zobrazuje. */
  bodyShownMm: number;
  /** Šířka pásku poutka. */
  keeperWidthMm: number;
  /** Přídavek na přeplátování poutka. */
  keeperOverlapMm: number;
  /**
   * Nejmenší přijatelný můstek kůže mezi otvory a mezi otvorem a hranou.
   * Volba této šablony: jeden průměr otvoru. Ohyb je nejzatíženější místo pásku,
   * takže tenký můstek je právě tam, kde by se pásek utrhl.
   */
  minLigamentMm: number;
}

export const DEFAULT_BELT_END: BeltEndSpec = {
  beltWidthMm: 40,
  beltThicknessMm: 4,
  slotLengthMm: 25,
  slotWidthMm: 6,
  rivetHoleMm: 6,
  rivetOffsetsMm: [25.5, 73.2],
  tailLengthMm: 90,
  bodyShownMm: 90,
  keeperWidthMm: 12,
  keeperOverlapMm: 15,
  minLigamentMm: 6,
};

/** Můstek mezi koncem drážky a hranou bližšího otvoru pro nýt. */
export function ligamentMm(spec: BeltEndSpec): number {
  return spec.rivetOffsetsMm[0] - spec.rivetHoleMm / 2 - spec.slotLengthMm / 2;
}

/** Vzdálenost středů obou nýtů. */
export function keeperGapMm(spec: BeltEndSpec): number {
  return spec.rivetOffsetsMm[1] - spec.rivetOffsetsMm[0];
}

/** Světlá délka kapsy pro poutko, tedy mezi hranami obou otvorů. */
export function keeperPocketClearMm(spec: BeltEndSpec): number {
  return keeperGapMm(spec) - spec.rivetHoleMm;
}

/** Kolik kůže zbývá za vzdálenějším nýtem do konce pásu. */
export function tailAfterFarRivetMm(spec: BeltEndSpec): number {
  return spec.tailLengthMm - (spec.rivetOffsetsMm[1] + spec.rivetHoleMm / 2);
}

/** Můstek od otvoru nebo drážky k boční hraně pásu. */
export function sideMarginMm(spec: BeltEndSpec): number {
  const widest = Math.max(spec.rivetHoleMm, spec.slotWidthMm);
  return spec.beltWidthMm / 2 - widest / 2;
}

/** Délka otvoru pro trn po složení – drážku půlí ohyb. */
export function foldedSlotOpeningMm(spec: BeltEndSpec): number {
  return spec.slotLengthMm / 2;
}

/** Obvod zdvojené části, kolem které se ovíjí poutko. */
export function doubledPerimeterMm(spec: BeltEndSpec): number {
  return 2 * (spec.beltWidthMm + 2 * spec.beltThicknessMm);
}

/** Délka pásku na poutko včetně přeplátování. */
export function keeperStripLengthMm(spec: BeltEndSpec): number {
  return Math.round(doubledPerimeterMm(spec) + spec.keeperOverlapMm);
}

/**
 * Ověří, že se rozměry nezkombinovaly do slabého nebo nesmyslného místa.
 * Vrací seznam problémů; prázdný seznam znamená v pořádku.
 */
export function checkBeltEndSpec(spec: BeltEndSpec): string[] {
  const problems: string[] = [];
  const [near, far] = spec.rivetOffsetsMm;
  if (far <= near) {
    problems.push('rivetOffsetsMm musí být vzestupné (bližší nýt první).');
  }
  const lig = ligamentMm(spec);
  if (lig < spec.minLigamentMm) {
    problems.push(
      `Můstek mezi drážkou a otvorem pro nýt je ${lig.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm. ` +
        'Zkrať drážku (slotLengthMm) nebo posuň nýty dál od ohybu (rivetOffsetsMm).',
    );
  }
  const behind = tailAfterFarRivetMm(spec);
  if (behind < spec.minLigamentMm) {
    problems.push(
      `Za vzdálenějším nýtem zbývá ${behind.toFixed(2)} mm do konce pásu, minimum ${spec.minLigamentMm} mm. ` +
        'Prodluž přehnutý konec (tailLengthMm).',
    );
  }
  const side = sideMarginMm(spec);
  if (side < spec.minLigamentMm) {
    problems.push(
      `Můstek k boční hraně je ${side.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm.`,
    );
  }
  const pocket = keeperPocketClearMm(spec);
  if (spec.keeperWidthMm > pocket) {
    problems.push(
      `Poutko ${spec.keeperWidthMm} mm se nevejde do kapsy ${pocket.toFixed(2)} mm mezi nýty.`,
    );
  }
  return problems;
}

/** Jako `checkBeltEndSpec`, ale vyhodí chybu. Pro použití ve skriptu. */
export function assertBeltEndSpec(spec: BeltEndSpec): void {
  const problems = checkBeltEndSpec(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatné rozměry konce opasku:\n- ${problems.join('\n- ')}`);
  }
}

/* ------------------------------------------------------------------------- */
/* Konec se špičkou a dírkami pro trn                                         */
/* ------------------------------------------------------------------------- */

/**
 * Rozměry konce opasku se špičkou. Všechny hodnoty jsou odměřené z PDF
 * generátoru CraftPoint (viz docs/content/sablony-zdroje.md) a jsou nezávislé
 * na obvodu pasu – ověřeno porovnáním dvou konfigurací (85 a 95 cm), kde
 * rozvržení špičky vyšlo shodně. Obvod mění jen hladkou část mezi konci.
 */
export interface BeltTipSpec {
  beltWidthMm: number;
  /** Délka hrotu od vrcholu k místu, kde pás nabývá plné šířky. */
  tipLengthMm: number;
  /** Průměr dírky pro trn. */
  holeDiameterMm: number;
  /** Počet dírek; musí být nepárový, aby existovala prostřední. */
  holeCount: number;
  /** Rozteč dírek. */
  holeSpacingMm: number;
  /** Vzdálenost od vrcholu hrotu k první dírce. */
  apexToFirstHoleMm: number;
  /** Nejmenší přijatelný můstek mezi dírkami a k hranám. */
  minLigamentMm: number;
}

export const DEFAULT_BELT_TIP: BeltTipSpec = {
  beltWidthMm: 40,
  tipLengthMm: 38,
  holeDiameterMm: 4.5,
  holeCount: 5,
  holeSpacingMm: 25,
  apexToFirstHoleMm: 94.3,
  minLigamentMm: 6,
};

/** Vzdálenosti všech dírek od vrcholu hrotu. */
export function holeOffsetsFromApexMm(spec: BeltTipSpec): number[] {
  return Array.from(
    { length: spec.holeCount },
    (_, i) => spec.apexToFirstHoleMm + i * spec.holeSpacingMm,
  );
}

/** Index prostřední dírky (0 = první). */
export function middleHoleIndex(spec: BeltTipSpec): number {
  return (spec.holeCount - 1) / 2;
}

/** Vzdálenost od vrcholu hrotu k prostřední dírce – ta odpovídá naměřené míře. */
export function apexToMiddleHoleMm(spec: BeltTipSpec): number {
  return spec.apexToFirstHoleMm + middleHoleIndex(spec) * spec.holeSpacingMm;
}

/** Rozsah nastavení pásku od prostřední dírky na obě strany. */
export function adjustmentRangeMm(spec: BeltTipSpec): number {
  return middleHoleIndex(spec) * spec.holeSpacingMm;
}

/** Celková délka tohoto konce od vrcholu hrotu k poslední dírce. */
export function apexToLastHoleMm(spec: BeltTipSpec): number {
  return spec.apexToFirstHoleMm + (spec.holeCount - 1) * spec.holeSpacingMm;
}

export function checkBeltTipSpec(spec: BeltTipSpec): string[] {
  const problems: string[] = [];
  if (spec.holeCount % 2 === 0) {
    problems.push(`holeCount ${spec.holeCount} je párový, prostřední dírka by neexistovala.`);
  }
  const between = spec.holeSpacingMm - spec.holeDiameterMm;
  if (between < spec.minLigamentMm) {
    problems.push(
      `Můstek mezi dírkami je ${between.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm.`,
    );
  }
  const afterTip = spec.apexToFirstHoleMm - spec.tipLengthMm - spec.holeDiameterMm / 2;
  if (afterTip < spec.minLigamentMm) {
    problems.push(
      `Mezi koncem hrotu a první dírkou je ${afterTip.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm.`,
    );
  }
  const side = spec.beltWidthMm / 2 - spec.holeDiameterMm / 2;
  if (side < spec.minLigamentMm) {
    problems.push(
      `Můstek k boční hraně je ${side.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm.`,
    );
  }
  return problems;
}

export function assertBeltTipSpec(spec: BeltTipSpec): void {
  const problems = checkBeltTipSpec(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatné rozměry špičky opasku:\n- ${problems.join('\n- ')}`);
  }
}

/**
 * Celková délka pásu potřebná pro naměřený obvod.
 * Obvod se měří od ohybu u přezky k dírce, kterou nosíš – tedy k prostřední.
 * Délka = obvod + přehnutý konec za ohybem + zbytek za prostřední dírkou.
 */
export function totalStrapLengthMm(waistMm: number, end: BeltEndSpec, tip: BeltTipSpec): number {
  const behindMiddle = apexToMiddleHoleMm(tip);
  return waistMm + end.tailLengthMm + behindMiddle;
}
