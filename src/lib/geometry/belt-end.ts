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
  /**
   * Průměr hlavičky šroubovacího nýtu. O hlavičky se poutko opírá, ne o otvory,
   * takže světlá kapsa pro poutko se počítá z nich. (Revize 2026-09-10: dřív se
   * počítala z průměru otvoru a vycházela o 4 mm větší, než skutečnost.)
   */
  rivetHeadMm: number;
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
  rivetHeadMm: 10,
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

/**
 * Světlá délka kapsy pro poutko: mezi **hlavičkami** obou nýtů.
 * Poutko se opírá o hlavičky, ne o otvory.
 */
export function keeperPocketClearMm(spec: BeltEndSpec): number {
  return keeperGapMm(spec) - spec.rivetHeadMm;
}

/**
 * Potřebná délka dříku šroubovacího nýtu pro přehnutý konec.
 * Pravidlo z praxe (blog.pethardware.com, ověřeno 2026-09-10): dřík o 1–1,5 mm
 * kratší než celková tloušťka spoje. Spoj jsou dvě vrstvy pásu.
 */
export function rivetPostRangeMm(spec: BeltEndSpec): { minMm: number; maxMm: number } {
  const stack = 2 * spec.beltThicknessMm;
  return { minMm: stack - 1.5, maxMm: stack - 1 };
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
  if (!(far > near)) {
    problems.push('rivetOffsetsMm musí být vzestupné (bližší nýt první).');
  }
  const lig = ligamentMm(spec);
  if (lig < spec.minLigamentMm) {
    problems.push(
      `Můstek mezi drážkou a otvorem pro nýt je ${lig.toFixed(2)} mm, minimum ${spec.minLigamentMm} mm. ` +
        'Zkrať drážku (slotLengthMm) nebo posuň nýty dál od ohybu (rivetOffsetsMm).',
    );
  }
  if (spec.slotWidthMm > spec.slotLengthMm) {
    problems.push(
      `Drážka ${spec.slotLengthMm} × ${spec.slotWidthMm} mm: šířka je větší než délka, ` +
        'stadion by se protnul sám sebou. Šířka je průměr průbojníku, délka musí být aspoň taková.',
    );
  }
  for (const [label, value] of [
    ['beltWidthMm', spec.beltWidthMm],
    ['beltThicknessMm', spec.beltThicknessMm],
    ['slotLengthMm', spec.slotLengthMm],
    ['slotWidthMm', spec.slotWidthMm],
    ['rivetHoleMm', spec.rivetHoleMm],
    ['rivetHeadMm', spec.rivetHeadMm],
    ['tailLengthMm', spec.tailLengthMm],
    ['keeperWidthMm', spec.keeperWidthMm],
    ['keeperOverlapMm', spec.keeperOverlapMm],
    ['bodyShownMm', spec.bodyShownMm],
    ['minLigamentMm', spec.minLigamentMm],
    // Dvě nejhlasitější kóty tiskové šablony; bez tohohle projde NaN až do SVG.
    ['rivetOffsetsMm[0]', spec.rivetOffsetsMm[0]],
    ['rivetOffsetsMm[1]', spec.rivetOffsetsMm[1]],
  ] as const) {
    if (!(value > 0)) problems.push(`${label} musí být kladné, je ${String(value)}.`);
  }
  if (spec.rivetHeadMm <= spec.rivetHoleMm) {
    problems.push('rivetHeadMm musí být větší než rivetHoleMm, jinak hlavička neprodrží.');
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
  // Validace vstupu musí být první: z neplatného sklonu nebo zaoblení vyjdou
  // odvozené hodnoty Infinity/NaN a chybová hlášení pak míří úplně jinam.
  // `!(x > 0)`, ne `x <= 0`: `NaN <= 0` je false, takže by NaN propadl dál
  // a odvozené hodnoty by z něj vyšly NaN bez jediného hlášení.
  if (!(spec.noseRadiusMm > 0)) {
    problems.push('noseRadiusMm musí být kladné – ostrý hrot se v kůži krabatí a třepí.');
  }
  if (!(spec.taperSlope > 0)) {
    problems.push('taperSlope musí být kladný.');
  }
  if (!Number.isInteger(spec.holeCount) || spec.holeCount < 1) {
    problems.push(`holeCount musí být celé kladné číslo, je ${spec.holeCount}.`);
  }
  for (const [label, value] of [
    ['holeSpacingMm', spec.holeSpacingMm],
    ['holeDiameterMm', spec.holeDiameterMm],
    ['beltWidthMm', spec.beltWidthMm],
    ['apexToFirstHoleMm', spec.apexToFirstHoleMm],
    // Záporné minimum by tiše vypnulo všechny kontroly můstků v této funkci.
    ['minLigamentMm', spec.minLigamentMm],
  ] as const) {
    if (!(value > 0)) problems.push(`${label} musí být kladné, je ${String(value)}.`);
  }
  if (problems.length > 0) return problems;

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
  {
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
/* Jedna plochá destička pro všechny šířky                                    */
/* ------------------------------------------------------------------------- */

/**
 * Univerzální destička: jeden plochý kus pro pásky do `maxBeltWidthMm`.
 *
 * Návrh vyšel z průchodu prací u stolu, ne z kreslení:
 *  1. Narýsovat střednici pásu.
 *  2. **Konec u přezky** – destička se umístí podle **konce pásu**, proto je referencí
 *     levá krátká **hrana destičky**, ne vnitřní značka.
 *  3. Složit přezku, vyzkoušet na sobě, označit kam padne trn = **prostřední dírka**.
 *  4. **Špička** – destička se umístí podle **prostřední dírky**. Špička a všech pět dírek
 *     proto musí být v jedné řadě: jedno přiložení, žádná kumulace chyby.
 *
 * Z toho plynou tři rozhodnutí, která opravují první verzi:
 *  - **Žádná vyrovnávací drážka.** Osu určují samy otvory a ovál; přes čirý akrylát je
 *    narýsovaná střednice vidět. Drážka byla nadbytečná.
 *  - **Špička je vyříznutý tvar, ne drážka ani výřez v hraně.** Značení skrz drážku 1,2 mm
 *    má přesnost ±0,6 mm, obtažení hrany ±0,1 mm. Výřez v krátké hraně by navíc vytvořil
 *    tenký jazyk, který se v akrylátu odlomí; uzavřený výřez drží materiál kolem.
 *  - **Konec pásu = krátká hrana destičky.** Žádná další značka není potřeba.
 */
export interface BeltPlateSpec {
  /** Největší šířka pásu, pro kterou je destička určená. */
  maxBeltWidthMm: number;
  /** Okraj destičky bez značek. */
  marginMm: number;
  /** Rozestup os obou řad. */
  rowPitchMm: number;
  /** Vzdálenost značek mimo osu od střednice (linie ohybu, rozlišení prostřední dírky). */
  offAxisMarkMm: number;
  markHoleMm: number;
  hangHoleMm: number;
  /**
   * O kolik je vyříznutý tvar špičky na širokém konci širší než nejširší pás.
   * Jeho příčná uzavírací hrana pak leží mimo kůži, takže se nedá omylem obtáhnout.
   */
  tipCutoutOversizeMm: number;
  /**
   * Šířky pásů, pro které destička nese gravírovaný pár vodicích linek.
   * Linky nejsou na řezání pruhu z kůže – jsou to **způsob vyrovnání**: srovnáním
   * obou hran pásu na pár linek se destička sama vystředí a nemusí se rýsovat střednice.
   * Rozestup sousedních linek musí zůstat čitelný, proto ne víc než čtyři šířky.
   */
  guideWidthsMm: number[];
  /**
   * Výška gravírovaných číslic u **pravítka a kalibrační kóty**. Popisky vodicích
   * linek jsou nižší (2 mm), protože rozestup linek je 2,5 mm a musí se vejít do
   * mezery mezi nimi – tahle hodnota by tam nesedla.
   */
  guideLabelHeightMm: number;
  /**
   * Šířka slotu pro zaoblený konec. Značí se zevnitř slotu, přesnost je tedy
   * ± polovina šířky — u oblouku, který se stejně řeže a brousí, to nevadí.
   * Užší slot znamená silnější žebra mezi vnořenými sloty, což je u 3mm akrylátu
   * to podstatné.
   */
  roundedSlotWidthMm: number;
  /** Nejmenší přijatelné žebro mezi vnořenými sloty zaobleného konce. */
  minRoundedRibMm: number;
  /** Největší tloušťka pásu, se kterou destička (a délka jejího pravítka) počítá. */
  maxBeltThicknessMm: number;
  /**
   * Kde začíná podélné pravítko. Nula musí ležet na **levé hraně destičky**, aby se
   * o ni dal opřít měřený pásek — proto 0. Model i kresba si tuhle hodnotu berou
   * odsud, dřív ji každý měl vlastní a délka pravítka v modelu neodpovídala kresbě.
   */
  rulerX0Mm: number;
  /** Svislá poloha základny pravítka a délka nejdelší rysky. */
  rulerYMm: number;
  rulerLongTickMm: number;
  /**
   * Nejmenší šířka slotu, do kterého se ještě dostane rýsovací šídlo.
   * Dřík šídla má ve výšce rovné tloušťce destičky průměr `2 · t · tg α`;
   * pro běžné kulaté šídlo (Ø 3 mm ve 15 mm od hrotu) a destičku 3 mm je to 0,6 mm.
   * Tupé šídlo (Ø 4 mm v 10 mm) má 1,2 mm a do slotu 1 mm se už nevejde.
   */
  minSlotForAwlMm: number;
  /**
   * Předpokládaná šířka řezné mezery laseru (kerf). Laser řeže **na střednici**
   * kontury, takže z každé strany odebere `kerf/2`: vyříznutý slot vyjde o kerf
   * **širší** a žebro mezi dvěma sousedními sloty o kerf **užší**. Rozteč
   * středních poloměrů je konstantní, takže `slot + žebro` je vždy 2,5 mm —
   * nelze mít současně slot 1,0 a žebro 1,5 mm na hotovém díle.
   * Kontroly žeber i slotů proto běží na **as-cut** rozměry, ne na nominální.
   * Rozteče středů otvorů kerf neposune, ty zůstávají podle souboru.
   */
  kerfMm: number;
  /**
   * Zaoblení tří pravých rohů obrysu. Ostrý roh je na 3mm akrylátu iniciátor
   * odštípnutí a destička se nosí a padá; obě komerční destičky, které jsem měřil,
   * rohy zaoblené mají. Na laseru to nic nestojí a nezasahuje do žádné funkční kóty.
   * Levý horní roh má místo zaoblení zkosení – je to orientační značka.
   */
  cornerRadiusMm: number;
  /**
   * Zkosení levého **horního** rohu: značí, že tahle krátká hrana je konec pásu.
   * Nahoře proto, že dole by zasáhlo do pásma, kde na destičce leží pás
   * (kontrola `checkBeltPlate` to odhalila).
   */
  strapEndChamferMm: number;
}

export const DEFAULT_BELT_PLATE: BeltPlateSpec = {
  maxBeltWidthMm: 45,
  marginMm: 10,
  rowPitchMm: 57,
  offAxisMarkMm: 12,
  markHoleMm: 2,
  hangHoleMm: 4,
  tipCutoutOversizeMm: 5,
  guideWidthsMm: [30, 35, 40, 45],
  roundedSlotWidthMm: 1,
  // As-cut limit: s kerfem 0,2 mm vyjde žebro 1,3 mm. 1,2 mm je dolní hranice,
  // pod kterou už bych 3mm litý akrylát vedle svěží tepelně ovlivněné zóny nechtěl.
  minRoundedRibMm: 1.2,
  maxBeltThicknessMm: 5,
  minSlotForAwlMm: 1,
  guideLabelHeightMm: 2.6,
  // Typický kerf CO2 laseru ve 3mm PMMA. Není to naměřená hodnota konkrétní
  // řezárny – proto se na ni v poptávce výslovně ptáme.
  kerfMm: 0.2,
  // Nula pravítka leží na levé hraně, aby se o ni dal opřít měřený pásek.
  rulerX0Mm: 0,
  rulerYMm: 6,
  rulerLongTickMm: 7,
  cornerRadiusMm: 3,
  // 5 mm, ne 8: zkosení musí zůstat nepřehlédnutelnou orientační značkou, ale
  // nesmí zasahovat do nuly pravítka ani do jejího popisku.
  strapEndChamferMm: 5,
};

export interface BeltPlateLayout {
  plateWidthMm: number;
  plateHeightMm: number;
  /** Osa řady se špičkou a dírkami pro trn. */
  tipRowY: number;
  /** Osa řady se zaobleným koncem a dírkami pro trn. */
  roundedRowY: number;
  /** Osa řady s koncem u přezky. */
  buckleRowY: number;
  /**
   * Vnořené sloty zaobleného konce. Polokruh o poloměru `w/2` je k hranám pásu tečný,
   * takže na každou šířku patří vlastní oblouk.
   *
   * Oblouky jsou **soustředné**, tedy mají společný střed. Varianta se společným
   * vrcholem (aby konec pásu ležel u všech šířek na stejném x) se na renderu ukázala
   * jako nepoužitelná: všechny sloty se v tom vrcholu sbíhaly a žebra mezi nimi tam
   * měla nulovou šířku. Se společným středem jsou žebra konstantní. Cenou je, že konec
   * pásu leží u každé šířky o něco jinde – rozptyl 7,5 mm, což je dobře uvnitř tolerance,
   * kterou pro odstup hrotu od první dírky uvádějí komerční šablony (25–100 mm).
   */
  roundedArcs: { beltWidthMm: number; radiusMm: number; centreX: number }[];
  /** Nominální šířka slotu v souboru. */
  roundedSlotWidthMm: number;
  /** Šířka slotu na hotovém díle: nominál + kerf (laser řeže na střednici). */
  roundedSlotAsCutMm: number;
  kerfMm: number;
  /** Vrchol vyříznuté špičky. */
  tipApexX: number;
  /**
   * Kde vyříznutá špička dosáhne své plné šířky. Leží **vlevo od vrcholu**, směrem
   * k dírkám: pás se od dírek k vrcholu zužuje, ne naopak.
   */
  tipFarX: number;
  /** Poloviční šířka vyříznutého tvaru špičky na širokém konci. */
  tipCutoutHalfMm: number;
  /** Podélné pravítko: počátek, základna, délka nejdelší rysky, konec a čitelný rozsah. */
  rulerX0Mm: number;
  rulerYMm: number;
  rulerLongTickMm: number;
  rulerEndXMm: number;
  /** Použitelný rozsah pravítka, tedy kolik mm se na něm dá odečíst. */
  rulerLengthMm: number;
  /** Nejdelší pásek na poutko, který může být potřeba (nejširší pás, tloušťka 5 mm). */
  maxKeeperStripMm: number;
  /** Vodicí linky: šířka pásu a její odsazení od osy. */
  guides: { beltWidthMm: number; offsetMm: number }[];
  guideLabelHeightMm: number;
  strapEndChamferMm: number;
  cornerRadiusMm: number;
  /** Dírky pro trn, x od levé hrany. */
  tipHoleXs: number[];
  /** Prostřední dírka = datum pro umístění řady. */
  middleHoleX: number;
  offAxisMarkMm: number;
  /** Linie ohybu, x od levé hrany. Levá hrana destičky je konec pásu. */
  foldX: number;
  rivetXs: number[];
  slotX0: number;
  slotX1: number;
  slotWidthMm: number;
  hangHoleX: number;
  hangHoleY: number;
  markHoleMm: number;
  hangHoleMm: number;
  maxBeltWidthMm: number;
  minBeltWidthMm: number;
}

export function beltPlateLayout(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): BeltPlateLayout {
  const half = plate.maxBeltWidthMm / 2;
  const m = plate.marginMm;
  // Vyříznutý tvar je širší než nejširší pás, aby jeho příčná hrana ležela mimo kůži.
  const cutoutHalf = half + plate.tipCutoutOversizeMm;
  const tipLen = tipLengthMm({ ...tip, beltWidthMm: 2 * cutoutHalf });
  const offsets = holeOffsetsFromApexMm(tip);
  const lastOffset = offsets[offsets.length - 1]!;

  // Řada se špičkou: nejlevější dírka na `m` od hrany určí polohu vrcholu.
  // Vrchol je nejvíc vpravo, tedy nejdál od dírek – pás se k němu zužuje.
  const apexX = m + lastOffset;
  const farX = apexX - tipLen;
  const plateWidth = Math.ceil(apexX + m);

  const tipRowY = m + cutoutHalf;
  const roundedRowY = tipRowY + plate.rowPitchMm;
  const buckleRowY = roundedRowY + plate.rowPitchMm;
  const plateHeight = Math.ceil(buckleRowY + half + m);

  // Levá hrana destičky JE konec pásu, takže ohyb od ní leží přesně `tailLengthMm`.
  // Dřív to byla samostatná konstanta a nic nekontrolovalo, že se rovnají.
  const fold = end.tailLengthMm;
  return {
    plateWidthMm: plateWidth,
    plateHeightMm: plateHeight,
    tipRowY,
    roundedRowY,
    buckleRowY,
    roundedArcs: (() => {
      const sorted = [...plate.guideWidthsMm].sort((a, b) => b - a);
      const centreX = apexX - (sorted[0] ?? 0) / 2;
      return sorted.map((bw) => ({ beltWidthMm: bw, radiusMm: bw / 2, centreX }));
    })(),
    roundedSlotWidthMm: plate.roundedSlotWidthMm,
    roundedSlotAsCutMm: plate.roundedSlotWidthMm + plate.kerfMm,
    kerfMm: plate.kerfMm,
    tipApexX: apexX,
    tipFarX: farX,
    tipCutoutHalfMm: cutoutHalf,
    rulerX0Mm: plate.rulerX0Mm,
    rulerYMm: plate.rulerYMm,
    rulerLongTickMm: plate.rulerLongTickMm,
    // Konec pravítka: nesmí zajet do vyříznuté špičky, jinak by laser gravíroval
    // do prázdna. Kresba si tuhle hodnotu bere odsud, takže model a soubor nemohou
    // rozejít (dřív každý počítal po svém a lišily se o 7,7 mm).
    rulerEndXMm: Math.min(plateWidth - m, farX - 4),
    // Celé milimetry: rysky se kreslí po 1 mm, takže poslední ryska je na
    // floor(konec − počátek) a to je zároveň nejvyšší čitelná hodnota.
    rulerLengthMm: Math.floor(Math.min(plateWidth - m, farX - 4) - plate.rulerX0Mm),
    maxKeeperStripMm: keeperStripLengthMm({
      ...end,
      beltWidthMm: plate.maxBeltWidthMm,
      beltThicknessMm: plate.maxBeltThicknessMm,
    }),
    guides: [...plate.guideWidthsMm]
      .sort((a, b) => b - a)
      .map((bw) => ({ beltWidthMm: bw, offsetMm: bw / 2 })),
    guideLabelHeightMm: plate.guideLabelHeightMm,
    strapEndChamferMm: plate.strapEndChamferMm,
    cornerRadiusMm: plate.cornerRadiusMm,
    tipHoleXs: offsets.map((o) => apexX - o),
    middleHoleX: apexX - apexToMiddleHoleMm(tip),
    offAxisMarkMm: plate.offAxisMarkMm,
    foldX: fold,
    rivetXs: [
      fold - end.rivetOffsetsMm[1],
      fold - end.rivetOffsetsMm[0],
      fold + end.rivetOffsetsMm[0],
      fold + end.rivetOffsetsMm[1],
    ],
    slotX0: fold - end.slotLengthMm / 2,
    slotX1: fold + end.slotLengthMm / 2,
    slotWidthMm: end.slotWidthMm,
    hangHoleX: plateWidth - m,
    // Ne `plateHeight - marginMm`: to je shodou konstrukce přesně hrana pásma
    // nejširšího pásu na řadě 3, takže otvor ležel pod kůží. Posunutý o 2 mm níž
    // je 2 mm pod pásem a nechává ke spodní hraně 4 mm materiálu. To je na
    // zavěšení dost: 4 × 3 mm PMMA v tahu unese řádově stovky newtonů, destička
    // váží ~130 g. Limit `marginMm` je pro značky u kůže, ne pro tuhle pevnost —
    // proto má závěsný otvor vlastní, menší minimum.
    hangHoleY: buckleRowY + plate.maxBeltWidthMm / 2 + plate.hangHoleMm / 2 + 2,
    markHoleMm: plate.markHoleMm,
    hangHoleMm: plate.hangHoleMm,
    maxBeltWidthMm: plate.maxBeltWidthMm,
    minBeltWidthMm: 2 * (plate.offAxisMarkMm + 2),
  };
}

/** Kontroly rozvržení destičky. Prázdný seznam = v pořádku. */
export function checkBeltPlate(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): string[] {
  const L = beltPlateLayout(end, tip, plate);
  const min = end.minLigamentMm;
  const problems: string[] = [];
  const gap = (label: string, value: number, minOverride?: number): void => {
    const limit = minOverride ?? min;
    // NaN < min je false, takže bez téhle větve by se vygeneroval soubor plný NaN.
    if (!Number.isFinite(value)) {
      problems.push(`${label}: hodnota není číslo (${String(value)}) – chyba v rozvržení.`);
      return;
    }
    // Epsilon: kóta, která má vyjít přesně na minimum, nesmí spadnout kvůli 1e-15.
    if (value < limit - 1e-9) {
      problems.push(`${label}: ${value.toFixed(2)} mm, minimum ${limit} mm.`);
    }
  };
  const mr = L.markHoleMm / 2;
  const half = L.maxBeltWidthMm / 2;

  gap('Mezi širokým koncem špičky a nejbližší dírkou pro trn', L.tipFarX - L.tipHoleXs[0]! - mr);
  gap(
    'Mezi řadou se špičkou a řadou se zaobleným koncem',
    L.roundedRowY - half - (L.tipRowY + L.tipCutoutHalfMm),
  );
  gap(
    'Mezi řadou se zaobleným koncem a řadou s přezkou',
    L.buckleRowY - half - (L.roundedRowY + half),
  );
  if (L.roundedSlotAsCutMm < plate.minSlotForAwlMm) {
    problems.push(
      `Slot zaobleného konce vyjde po řezu ${L.roundedSlotAsCutMm.toFixed(2)} mm, do tak úzkého ` +
        `se nedostane rýsovací šídlo (minimum ${plate.minSlotForAwlMm} mm).`,
    );
  }
  const radii = L.roundedArcs.map((a) => a.radiusMm).sort((a, b) => a - b);
  for (let i = 1; i < radii.length; i++) {
    // As-cut: laser řeže na střednici, takže z každé strany žebra odebere kerf/2.
    const rib = radii[i]! - radii[i - 1]! - L.roundedSlotAsCutMm;
    if (rib < plate.minRoundedRibMm) {
      problems.push(
        `Žebro mezi sloty zaobleného konce pro ${2 * radii[i - 1]!} a ${2 * radii[i]!} mm je ` +
          `po řezu ${rib.toFixed(2)} mm, minimum ${plate.minRoundedRibMm} mm ` +
          `(kerf ${plate.kerfMm} mm).`,
      );
      break;
    }
  }
  const biggest = L.roundedArcs[0];
  if (biggest) {
    // Nejvzdálenější bod slotu vlevo je jeho konec na svislici středu.
    gap(
      'Od slotu zaobleného konce k nejbližší dírce pro trn',
      biggest.centreX - L.roundedSlotWidthMm / 2 - L.tipHoleXs[0]! - mr,
    );
    gap(
      'Od slotu zaobleného konce k pravé hraně destičky',
      L.plateWidthMm - (biggest.centreX + biggest.radiusMm + L.roundedSlotWidthMm / 2),
    );
    // Soustřednost oblouků drží konstrukce (`centreX` se počítá jednou před `.map()`),
    // takže runtime kontrola by nikdy nemohla selhat. Invariant hlídá test.
    // Poznámka: oblouky se odvozují ze stejného seznamu šířek jako vodicí linky,
    // takže konec každého oblouku leží vždy přesně na lince své šířky. Tím se
    // oblouky a linky označují navzájem a nepotřebují vlastní čísla. Invariant
    // drží konstrukce, ověřuje ho test, runtime kontrola by nikdy nemohla selhat.
  }
  // Pět dřívějších kontrol bylo algebraicky totožných s podmínkou níže (všechny
  // měřily jen `marginMm` mínus poloměr otvoru), takže daly falešný pocit pokrytí.
  if (plate.marginMm - L.markHoleMm / 2 < min) {
    problems.push(
      `Okraj destičky ${plate.marginMm} mm nechá u značicího otvoru jen ` +
        `${(plate.marginMm - L.markHoleMm / 2).toFixed(2)} mm materiálu, minimum ${min} mm.`,
    );
  }
  gap('Od nejlevějšího otvoru pro nýt k hraně destičky', L.rivetXs[0]! - mr);
  // Jen jedna z obou stran: nýty i ovál se konstruují symetricky kolem ohybu,
  // takže druhá kontrola byla algebraicky totožná.
  gap('Mezi otvorem pro nýt a drážkou pro trn', L.slotX0 - L.rivetXs[1]! - mr);
  gap(
    'Od značek mimo osu k hraně destičky (řada s přezkou)',
    L.plateHeightMm - (L.buckleRowY + L.offAxisMarkMm) - mr,
  );

  // Zkosení rohu nesmí zasáhnout do pásma, kde na destičce leží pás.
  gap(
    'Od zkosení levého horního rohu k pásu na řadě se špičkou',
    L.tipRowY - half - L.strapEndChamferMm,
  );
  // Pravítko musí pokrýt i nejdelší pásek na poutko, jinak nemá smysl.
  gap(
    'Od závěsného otvoru k pravé hraně destičky',
    L.plateWidthMm - L.hangHoleX - L.hangHoleMm / 2,
  );
  // Vlastní minimum 3 mm: nosnost, ne přesnost značení.
  gap(
    'Od závěsného otvoru ke spodní hraně destičky',
    L.plateHeightMm - L.hangHoleY - L.hangHoleMm / 2,
    3,
  );
  gap(
    'Od závěsného otvoru k pásmu, kde leží nejširší pás',
    L.hangHoleY - L.hangHoleMm / 2 - (L.buckleRowY + L.maxBeltWidthMm / 2),
    1,
  );
  if (L.rulerLengthMm < L.maxKeeperStripMm) {
    problems.push(
      `Pravítko má ${L.rulerLengthMm.toFixed(1)} mm, ale nejdelší pásek na poutko může být ` +
        `${L.maxKeeperStripMm} mm. Změř ho jinak nebo prodluž destičku.`,
    );
  }

  if (plate.guideWidthsMm.length === 0) {
    problems.push('guideWidthsMm je prázdné: destička by neměla ani vodicí linky, ani oblouky.');
  }
  if (plate.guideWidthsMm.length > 4) {
    problems.push(
      `guideWidthsMm má ${plate.guideWidthsMm.length} šířek, maximum jsou 4 – při víc už nejsou linky čitelné.`,
    );
  }

  // Vodicí linky musí být čitelně od sebe a vejít se na destičku.
  const offs = L.guides.map((g) => g.offsetMm).sort((a, b) => a - b);
  for (let i = 1; i < offs.length; i++) {
    if (offs[i]! - offs[i - 1]! < 2) {
      problems.push(
        `Vodicí linky pro ${2 * offs[i - 1]!} a ${2 * offs[i]!} mm jsou od sebe ` +
          `${(offs[i]! - offs[i - 1]!).toFixed(1)} mm – necitelné, minimum 2 mm.`,
      );
      break;
    }
  }
  if (offs.length > 0 && offs[offs.length - 1]! > half) {
    problems.push(
      `Vodicí linka pro ${2 * offs[offs.length - 1]!} mm je mimo nejširší podporovaný pás ${L.maxBeltWidthMm} mm.`,
    );
  }
  if (L.tipCutoutHalfMm <= half) {
    problems.push(
      'Vyříznutá špička není širší než nejširší pás; její příčná hrana by ležela na kůži.',
    );
  }
  if (L.offAxisMarkMm + 2 > half) {
    problems.push('Značky mimo osu leží mimo nejširší podporovaný pás.');
  }
  if (plate.maxBeltWidthMm < tip.beltWidthMm) {
    problems.push(`Destička pro ${plate.maxBeltWidthMm} mm je užší než pás ${tip.beltWidthMm} mm.`);
  }
  return problems;
}
