/**
 * Pouzdro na karty s vsazenou mincí – geometrie střihu v milimetrech.
 *
 * Konstrukce podle produktu a videa Red Forest Leather (viz docs/content/notes-vybaveni.md,
 * „Námět: pouzdro s vsazenou mincí“): jeden dlouhý díl přeložený ve spodní hraně tvoří
 * přední a zadní panel, zadní panel pokračuje chlopní s drukem přes horní hranu na přední
 * stranu. Uvnitř je vložený dělicí panel, takže po prošití obou boků vzniknou dvě kapsy
 * (karty na výšku, přeložené bankovky). Na předním panelu je přišitá kapsa s kruhovým oknem;
 * mince se do ní zasune shora a sedne do důlku vytvarovaného za mokra.
 *
 * Rozměry NEJSOU odměřené z cizího střihu (ten nemáme). Odvozují se z rozměru platební
 * karty, průměru mince a přídavků na steh – tedy stejně, jako by je počítal generátor
 * CraftPoint. Hodnoty označené „volba“ jsou návrh k ověření na papírovém modelu a odřezku;
 * vše je tady, aby se daly měnit na jednom místě a kontroly hlídaly, že se díly pořád
 * vejdou a nekolidují.
 */

export interface CoinCardHolderSpec {
  /** Rozměr platební karty ISO/IEC 7810 ID-1: 85,6 × 53,98 mm (šířka zaokrouhlena na 54). */
  cardWidthMm: number;
  cardHeightMm: number;
  /** Vůle karty na každé straně kapsy – volba. */
  cardSideClearanceMm: number;
  /** Kolik mm karty má vyčnívat nad přední panel, aby šla vytáhnout – volba. */
  cardGripMm: number;
  /** Odsazení stehu od hrany a rozteč vidličky. */
  stitchOffsetMm: number;
  stitchPitchMm: number;
  /** Rezerva mezi stehem a vůlí karty, aby se karta nedřela o nit – volba. */
  seamInnerMarginMm: number;
  /** Tloušťka kůže těla a kapsy s mincí (kapsa tenčí, aby šla tvarovat). */
  bodyThicknessMm: number;
  pocketThicknessMm: number;
  /**
   * Přídavek na ohyb ve spodní hraně: přes ohyb jde tloušťka dělicího panelu a dvou
   * karet, kůže se kolem nich musí obtočit. Volba, ověřit na papíru.
   */
  foldAllowanceMm: number;
  /** O kolik je chlopeň delší, než kde na předním panelu sedí druk (zaoblený konec). */
  flapBeyondSnapMm: number;
  /** Tloušťka obsahu, kterou chlopeň překonává přes horní hranu (karty + panely). */
  flapStackAllowanceMm: number;
  /** Poloměr zaoblení rohů dílů a konce chlopně. */
  cornerRadiusMm: number;
  flapCornerRadiusMm: number;
  /** Průměr kloboučku druku (běžný druk 12,5 mm) a rezerva kolem něj k hranám a kapse. */
  snapDiameterMm: number;
  snapClearanceMm: number;
  /** Vzdálenost středu druku od horní hrany předního panelu – volba. */
  snapFromFrontTopMm: number;
  /** Mince: průměr a šířka prstence kůže, který ji v okně drží (okno = mince − 2·prstenec). */
  coinDiameterMm: number;
  coinRingMm: number;
  /** Vůle mince v kapse na každé straně a nad mincí, aby šla zasunout – volba. */
  coinSideClearanceMm: number;
  coinTopOverlapMm: number;
  /** Poloměr horních rohů kapsy s mincí („náhrobkový“ tvar) – volba. */
  pocketTopRadiusMm: number;
  /** Poloha kapsy na předním panelu: odstup její spodní hrany od ohybu – volba. */
  pocketFromFoldMm: number;
  /** Otvor forma pro důlek: o kolik je větší než mince (kůže + vůle) – volba. */
  formHoleOversizeMm: number;
  /** Nejmenší přijatelný můstek kůže mezi otvory a mezi otvorem a hranou. */
  minLigamentMm: number;
}

export const DEFAULT_COIN_CARD_HOLDER: CoinCardHolderSpec = {
  cardWidthMm: 54,
  cardHeightMm: 85.6,
  cardSideClearanceMm: 1.5,
  cardGripMm: 10,
  stitchOffsetMm: 3.5,
  stitchPitchMm: 4,
  seamInnerMarginMm: 1,
  bodyThicknessMm: 1.5,
  pocketThicknessMm: 1.2,
  foldAllowanceMm: 6,
  flapBeyondSnapMm: 9,
  flapStackAllowanceMm: 3,
  cornerRadiusMm: 6,
  flapCornerRadiusMm: 12,
  snapDiameterMm: 12.5,
  snapClearanceMm: 2,
  snapFromFrontTopMm: 9,
  coinDiameterMm: 40,
  coinRingMm: 4.5,
  coinSideClearanceMm: 1,
  coinTopOverlapMm: 4,
  pocketTopRadiusMm: 10,
  pocketFromFoldMm: 6,
  formHoleOversizeMm: 1,
  minLigamentMm: 3,
};

/**
 * Pojmenované mince pro `--coin`. Průměry českých mincí podle ČNB (technické parametry,
 * ověřeno 2026-09-18): 50 Kč 27,5 mm (bimetal), 20 Kč 26 mm (třináctihran – v kulatém okně
 * budou vidět rohy), 10 Kč 24,5 mm, 5 Kč 23 mm. „decision“ je mince z předlohy Red Forest
 * (40 mm podle popisu produktu).
 */
export const NAMED_COINS: Readonly<Record<string, number>> = {
  decision: 40,
  '50kc': 27.5,
  '20kc': 26,
  '10kc': 24.5,
  '5kc': 23,
};

/** Odvozené rozměry. Všechny díly kreslené ve vlastní soustavě (0,0 = levý horní roh dílu). */
export interface CoinCardHolderLayout {
  /** Šířka všech panelů. */
  panelWidthMm: number;
  /** Výška předního panelu od ohybu k horní hraně. */
  frontHeightMm: number;
  /** Výška zadního panelu od ohybu k počátku chlopně (= výška předního + přídavek přes obsah). */
  backHeightMm: number;
  /** Délka chlopně nad zadním panelem (přes horní hranu a dolů k druku + přesah). */
  flapLengthMm: number;
  /** Celé tělo rozložené: přední panel + ohyb + zadní panel + chlopeň. */
  bodyLengthMm: number;
  /** Poloha ohybu v rozloženém těle: střed pásu přídavku (od horní hrany předního panelu). */
  foldStartMm: number;
  foldEndMm: number;
  /** Dělicí panel. */
  dividerHeightMm: number;
  /** Kapsa s mincí. */
  pocketWidthMm: number;
  pocketHeightMm: number;
  /** Střed mince v soustavě kapsy (od jejího levého horního rohu). */
  coinCentreXMm: number;
  coinCentreYMm: number;
  windowDiameterMm: number;
  /** Poloha kapsy na předním panelu (levý horní roh kapsy v soustavě předního panelu). */
  pocketXMm: number;
  pocketYMm: number;
  /** Druk: střed na předním panelu a na chlopni (v soustavě rozloženého těla). */
  snapFrontXMm: number;
  snapFrontYMm: number;
  snapFlapYMm: number;
  /** Boční švy: od `stitchOffsetMm` nad ohybem k `stitchOffsetMm` pod horní hranou předního panelu. */
  sideSeamLengthMm: number;
  sideSeamHoles: number;
  /** Kolik karty vyčnívá nad přední panel. */
  cardExposedMm: number;
  /** Forma pro důlek: otvor a doporučená deska. */
  formHoleDiameterMm: number;
  formPlateMm: number;
}

export function coinCardHolderLayout(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): CoinCardHolderLayout {
  const seam = spec.stitchOffsetMm + spec.seamInnerMarginMm;
  const panelWidth = round(spec.cardWidthMm + 2 * spec.cardSideClearanceMm + 2 * seam);
  const frontHeight = round(spec.cardHeightMm - spec.cardGripMm);
  const backHeight = round(frontHeight + spec.flapStackAllowanceMm);
  const flapLength = round(spec.snapFromFrontTopMm + spec.flapBeyondSnapMm);
  const bodyLength = round(frontHeight + spec.foldAllowanceMm + backHeight + flapLength);

  const pocketWidth = round(spec.coinDiameterMm + 2 * (spec.coinSideClearanceMm + seam));
  const pocketHeight = round(
    seam + spec.coinSideClearanceMm + spec.coinDiameterMm + spec.coinTopOverlapMm,
  );
  const coinCentreX = pocketWidth / 2;
  const coinCentreY = round(
    pocketHeight - seam - spec.coinSideClearanceMm - spec.coinDiameterMm / 2,
  );
  const windowDiameter = round(spec.coinDiameterMm - 2 * spec.coinRingMm);

  const pocketX = round((panelWidth - pocketWidth) / 2);
  const pocketY = round(frontHeight - spec.pocketFromFoldMm - pocketHeight);

  const sideSeamLength = round(frontHeight - 2 * spec.stitchOffsetMm);
  const sideSeamHoles = Math.floor(sideSeamLength / spec.stitchPitchMm) + 1;

  return {
    panelWidthMm: panelWidth,
    frontHeightMm: frontHeight,
    backHeightMm: backHeight,
    flapLengthMm: flapLength,
    bodyLengthMm: bodyLength,
    foldStartMm: frontHeight,
    foldEndMm: round(frontHeight + spec.foldAllowanceMm),
    // Stejně vysoký jako přední panel: šev prochází všemi vrstvami, takže poslední otvor
    // musí být i v dělicím panelu dost daleko od jeho horní hrany (kratší panel by měl
    // poslední otvor 1,5 mm od hrany). Chlopeň ho přes horní hranu stejně zakryje.
    dividerHeightMm: frontHeight,
    pocketWidthMm: pocketWidth,
    pocketHeightMm: pocketHeight,
    coinCentreXMm: coinCentreX,
    coinCentreYMm: coinCentreY,
    windowDiameterMm: windowDiameter,
    pocketXMm: pocketX,
    pocketYMm: pocketY,
    snapFrontXMm: panelWidth / 2,
    snapFrontYMm: spec.snapFromFrontTopMm,
    // Chlopeň leží po přehnutí na předním panelu zrcadlově: bod, který je na chlopni
    // `d` za horní hranou obsahu, dopadne na přední panel `d` pod jeho horní hranu.
    snapFlapYMm: round(frontHeight + spec.foldAllowanceMm + backHeight + spec.snapFromFrontTopMm),
    sideSeamLengthMm: sideSeamLength,
    sideSeamHoles,
    cardExposedMm: round(spec.cardHeightMm - frontHeight),
    formHoleDiameterMm: round(spec.coinDiameterMm + spec.formHoleOversizeMm),
    formPlateMm: round(spec.coinDiameterMm + 30),
  };
}

/** Kontroly. Prázdný seznam = v pořádku. */
export function checkCoinCardHolder(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string[] {
  const L = coinCardHolderLayout(spec);
  const p: string[] = [];
  const min = spec.minLigamentMm;

  for (const [k, v] of Object.entries(spec)) {
    if (!Number.isFinite(v) || v < 0) p.push(`${k} musí být nezáporné číslo, je ${String(v)}.`);
  }
  if (p.length > 0) return p;

  if (spec.coinRingMm < min) {
    p.push(
      `Prstenec kolem okna ${spec.coinRingMm} mm je užší než minimum ${min} mm – minci by neudržel.`,
    );
  }
  if (L.windowDiameterMm < 10) {
    p.push(`Okno ${L.windowDiameterMm} mm je moc malé, z mince by nebylo nic vidět.`);
  }
  if (spec.cardGripMm < 6 || spec.cardGripMm > 15) {
    p.push(
      `Karta vyčnívá ${spec.cardGripMm} mm; pod 6 mm nejde chytit, nad 15 mm ji chlopeň nezakryje.`,
    );
  }
  // Druk na předním panelu musí sedět v pásu mezi horní hranou a kapsou s mincí.
  const snapTop = L.snapFrontYMm - spec.snapDiameterMm / 2;
  const snapBottom = L.snapFrontYMm + spec.snapDiameterMm / 2;
  if (snapTop < spec.snapClearanceMm) {
    p.push(
      `Druk zasahuje k horní hraně předního panelu (${snapTop.toFixed(1)} mm, minimum ${spec.snapClearanceMm}).`,
    );
  }
  if (L.pocketYMm - snapBottom < spec.snapClearanceMm) {
    p.push(
      `Mezi drukem a horní hranou kapsy s mincí je jen ${(L.pocketYMm - snapBottom).toFixed(1)} mm ` +
        `(minimum ${spec.snapClearanceMm}). Zmenši cardGripMm, snapFromFrontTopMm nebo pocketFromFoldMm.`,
    );
  }
  if (L.pocketYMm < 0) p.push('Kapsa s mincí je vyšší než přední panel.');
  if (L.pocketXMm < spec.stitchOffsetMm) {
    p.push(
      `Kapsa s mincí je širší než panel minus boční švy (odsazení ${L.pocketXMm.toFixed(1)} mm).`,
    );
  }
  // Boční šev předního panelu nesmí procházet kapsou: kapsa má vlastní šev uvnitř.
  if (L.pocketXMm <= spec.stitchOffsetMm + min) {
    p.push(
      `Šev kapsy s mincí by splynul s bočním švem panelu (mezera ${(L.pocketXMm - spec.stitchOffsetMm).toFixed(1)} mm).`,
    );
  }
  // Můstek mezi oknem a stehem kapsy.
  const windowToSeam = L.coinCentreXMm - L.windowDiameterMm / 2 - spec.stitchOffsetMm;
  if (windowToSeam < min)
    p.push(`Můstek mezi oknem a stehem kapsy je ${windowToSeam.toFixed(1)} mm, minimum ${min}.`);
  // Chlopeň: druk musí být uvnitř a konec chlopně nesmí zasáhnout do kapsy.
  const flapEndOnFront = spec.snapFromFrontTopMm + spec.flapBeyondSnapMm;
  if (flapEndOnFront > L.pocketYMm - 1) {
    p.push(
      `Konec chlopně dopadne ${flapEndOnFront} mm pod horní hranu, ale kapsa začíná v ${L.pocketYMm} mm.`,
    );
  }
  if (spec.flapBeyondSnapMm < spec.snapDiameterMm / 2 + spec.snapClearanceMm) {
    p.push('Konec chlopně je moc blízko druku; flapBeyondSnapMm zvětši.');
  }
  // Na A4 1:1: tělo na výšku, vedle dělicí panel a kapsa.
  if (L.bodyLengthMm > 297 - 2 * 12) p.push(`Tělo ${L.bodyLengthMm} mm se nevejde na A4 na výšku.`);
  if (2 * L.panelWidthMm + 3 * 12 > 210) p.push('Dva panely vedle sebe se nevejdou na šířku A4.');
  return p;
}

export function assertCoinCardHolder(spec: CoinCardHolderSpec): void {
  const problems = checkCoinCardHolder(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatný střih pouzdra s mincí:\n- ${problems.join('\n- ')}`);
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
