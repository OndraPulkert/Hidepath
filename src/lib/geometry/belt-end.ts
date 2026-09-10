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
  /**
   * Sklon boku špičky: o kolik mm přiroste poloviční šířka na 1 mm délky.
   * Odměřeno z PDF CraftPoint pro šířky 40 mm (0,452) i 35 mm (0,454) – tedy
   * konstanta nezávislá na šířce pásu. Délka hrotu z ní vychází, není vstupem.
   */
  taperSlope: number;
  /**
   * Poloměr zaoblení samotného vrcholu. Anglická špička není ostrý hrot:
   * odměřeno z PDF CraftPoint jako oblouk r ≈ 4 mm, na který jsou boky tečné.
   * Ostrý hrot z kůže se navíc krabatí a třepí.
   */
  noseRadiusMm: number;
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
  taperSlope: 0.453,
  noseRadiusMm: 4,
  holeDiameterMm: 4.5,
  holeCount: 5,
  holeSpacingMm: 25,
  apexToFirstHoleMm: 94.3,
  minLigamentMm: 6,
};

/**
 * Bod, ve kterém se rovný bok dotýká oblouku vrcholu.
 * Z podmínky tečnosti: pro oblouk r a sklon s je poloviční šířka v bodě dotyku
 * r / √(1 + s²) a leží s·(ta šířka) pod středem oblouku.
 */
export function tipTangentPoint(spec: BeltTipSpec): { halfWidthMm: number; fromApexMm: number } {
  const r = spec.noseRadiusMm;
  const s = spec.taperSlope;
  const halfWidthMm = r / Math.sqrt(1 + s * s);
  return { halfWidthMm, fromApexMm: r - s * halfWidthMm };
}

/**
 * Délka hrotu od vrcholu k místu, kde pás nabývá plné šířky.
 * Odvozená hodnota: vychází ze šířky pásu, sklonu boku a zaoblení vrcholu.
 */
export function tipLengthMm(spec: BeltTipSpec): number {
  const tan = tipTangentPoint(spec);
  return tan.fromApexMm + (spec.beltWidthMm / 2 - tan.halfWidthMm) / spec.taperSlope;
}

/**
 * Poloviční šířka špičky ve dané vzdálenosti od vrcholu.
 * Do bodu dotyku jde o oblouk, dál o rovný bok.
 */
export function tipHalfWidthAtMm(spec: BeltTipSpec, fromApexMm: number): number {
  if (fromApexMm <= 0) return 0;
  if (fromApexMm >= tipLengthMm(spec)) return spec.beltWidthMm / 2;
  const tan = tipTangentPoint(spec);
  const r = spec.noseRadiusMm;
  if (fromApexMm <= tan.fromApexMm) {
    return Math.sqrt(Math.max(r * r - (r - fromApexMm) ** 2, 0));
  }
  return tan.halfWidthMm + spec.taperSlope * (fromApexMm - tan.fromApexMm);
}

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
  const afterTip = spec.apexToFirstHoleMm - tipLengthMm(spec) - spec.holeDiameterMm / 2;
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
  if (spec.noseRadiusMm <= 0) {
    problems.push('noseRadiusMm musí být kladné – ostrý hrot se v kůži krabatí a třepí.');
  }
  if (spec.taperSlope <= 0) {
    problems.push('taperSlope musí být kladný.');
  }
  if (spec.noseRadiusMm > 0 && spec.taperSlope > 0) {
    const tan = tipTangentPoint(spec);
    if (tan.halfWidthMm >= spec.beltWidthMm / 2) {
      problems.push(
        `Zaoblení vrcholu ${spec.noseRadiusMm} mm je na šířku pásu ${spec.beltWidthMm} mm příliš velké.`,
      );
    }
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

/* ------------------------------------------------------------------------- */
/* Jedna univerzální deska pro všechny šířky                                  */
/* ------------------------------------------------------------------------- */

/**
 * Univerzální šablona: jedna deska pro pásky do `plateWidthMm`.
 *
 * Funguje proto, že podle měření (viz docs/content/sablony-zdroje.md):
 *  - polohy všech otvorů podél pásu na šířce nezávisí,
 *  - sklon boku špičky je konstantní, takže koncové body zkosení pro všechny
 *    šířky leží na **jedné a téže přímce** – jeden pár boků obsahuje každou šířku
 *    a stop určuje hrana kupovaného pásu.
 *
 * Tři věci, které jedna deska musí řešit jinak než šablona na míru:
 *  1. Deska je širší než pás, takže **zářez v hraně by na pás nedosáhl**. Linie ohybu
 *     se proto značí dvěma otvory mimo osu (`offAxisMarkMm`), které leží na pásu
 *     i u nejužší podporované šířky.
 *  2. Vystředění: deska je z čirého akrylátu a má **vyrovnávací drážku na ose**,
 *     kterou se dívá na narýsovanou střednici pásu.
 *  3. Prostřední dírku ze pěti odliší **dva otvory po stranách** na téže výšce.
 */
export interface MultiPlateSpec {
  /** Šířka desky = největší podporovaná šířka pásu. */
  plateWidthMm: number;
  /** Od vrcholu špičky k začátku vyrovnávací drážky. */
  apexToAlignSlotMm: number;
  alignSlotLengthMm: number;
  alignSlotWidthMm: number;
  /** Od vrcholu špičky k linii ohybu na druhém konci desky. */
  apexToFoldMm: number;
  /** Vzdálenost značek mimo osu od střednice. */
  offAxisMarkMm: number;
  hangHoleMm: number;
}

export const DEFAULT_MULTI_PLATE: MultiPlateSpec = {
  plateWidthMm: 45,
  apexToAlignSlotMm: 205,
  alignSlotLengthMm: 25,
  alignSlotWidthMm: 1.5,
  apexToFoldMm: 315,
  offAxisMarkMm: 12,
  hangHoleMm: 4,
};

export interface MultiPlateLayout {
  plateWidthMm: number;
  plateLengthMm: number;
  /** Dírky pro trn, od vrcholu špičky. */
  tipHoleYs: number[];
  /** Výška prostřední dírky a odsazení jejích dvou rozlišovacích otvorů. */
  middleHoleY: number;
  offAxisMarkMm: number;
  alignSlotY0: number;
  alignSlotY1: number;
  alignSlotWidthMm: number;
  hangHoleX: number;
  hangHoleY: number;
  hangHoleMm: number;
  foldY: number;
  rivetYs: number[];
  /** Vnější obálka vyříznuté drážky pro trn. */
  slotY0: number;
  slotY1: number;
  slotWidthMm: number;
  /** Spodní hrana desky = konec pásu, dá se podle ní označit odříznutí. */
  bottomY: number;
  /** Délka hrotu při využití celé šířky desky. */
  tipLengthAtPlateWidthMm: number;
}

export function multiPlateLayout(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: MultiPlateSpec = DEFAULT_MULTI_PLATE,
): MultiPlateLayout {
  const widest: BeltTipSpec = { ...tip, beltWidthMm: plate.plateWidthMm };
  const fold = plate.apexToFoldMm;
  return {
    plateWidthMm: plate.plateWidthMm,
    plateLengthMm: fold + end.tailLengthMm,
    tipHoleYs: holeOffsetsFromApexMm(tip),
    middleHoleY: apexToMiddleHoleMm(tip),
    offAxisMarkMm: plate.offAxisMarkMm,
    alignSlotY0: plate.apexToAlignSlotMm,
    alignSlotY1: plate.apexToAlignSlotMm + plate.alignSlotLengthMm,
    alignSlotWidthMm: plate.alignSlotWidthMm,
    hangHoleX: -(plate.plateWidthMm / 2 - plate.hangHoleMm / 2 - end.minLigamentMm),
    hangHoleY: plate.apexToAlignSlotMm + plate.alignSlotLengthMm / 2,
    hangHoleMm: plate.hangHoleMm,
    foldY: fold,
    rivetYs: [
      fold - end.rivetOffsetsMm[1],
      fold - end.rivetOffsetsMm[0],
      fold + end.rivetOffsetsMm[0],
      fold + end.rivetOffsetsMm[1],
    ],
    slotY0: fold - end.slotLengthMm / 2,
    slotY1: fold + end.slotLengthMm / 2,
    slotWidthMm: end.slotWidthMm,
    bottomY: fold + end.tailLengthMm,
    tipLengthAtPlateWidthMm: tipLengthMm(widest),
  };
}

/** Nejmenší šířka pásu, na které značky mimo osu ještě leží s rezervou 2 mm. */
export function multiPlateMinBeltWidthMm(plate: MultiPlateSpec): number {
  return 2 * (plate.offAxisMarkMm + 2);
}

/** Kontroly rozvržení univerzální desky. Prázdný seznam = v pořádku. */
export function checkMultiPlate(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: MultiPlateSpec = DEFAULT_MULTI_PLATE,
): string[] {
  const L = multiPlateLayout(end, tip, plate);
  const min = end.minLigamentMm;
  const problems: string[] = [];
  const gap = (label: string, value: number): void => {
    if (value < min) problems.push(`${label}: ${value.toFixed(2)} mm, minimum ${min} mm.`);
  };
  const markR = 1;
  const lastTip = L.tipHoleYs[L.tipHoleYs.length - 1]!;
  gap('Mezi poslední dírkou pro trn a vyrovnávací drážkou', L.alignSlotY0 - lastTip - markR);
  gap(
    'Mezi vyrovnávací drážkou a nejvzdálenějším otvorem pro nýt',
    L.rivetYs[0]! - L.alignSlotY1 - markR,
  );
  gap('Mezi otvorem pro nýt a drážkou pro trn', L.slotY0 - L.rivetYs[1]! - markR);
  gap('Mezi drážkou pro trn a otvorem pro nýt', L.rivetYs[2]! - L.slotY1 - markR);
  gap('Za posledním otvorem pro nýt do konce desky', L.bottomY - L.rivetYs[3]! - markR);
  gap('Od značek mimo osu k hraně desky', L.plateWidthMm / 2 - L.offAxisMarkMm - markR);
  gap('Mezi značkou mimo osu a drážkou pro trn', L.offAxisMarkMm - markR - L.slotWidthMm / 2);
  gap('Od závěsného otvoru k hraně desky', L.plateWidthMm / 2 + L.hangHoleX - L.hangHoleMm / 2);
  if (L.tipLengthAtPlateWidthMm >= L.alignSlotY0) {
    problems.push('Zkosení špičky zasahuje až do vyrovnávací drážky.');
  }
  if (plate.plateWidthMm < tip.beltWidthMm) {
    problems.push(
      `Deska ${plate.plateWidthMm} mm je užší než pás ${tip.beltWidthMm} mm, na který se má použít.`,
    );
  }
  return problems;
}
