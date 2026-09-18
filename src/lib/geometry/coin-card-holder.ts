/**
 * Pouzdro na karty s vsazenou mincí – geometrie střihu v milimetrech.
 *
 * Konstrukce podle produktu a videa Red Forest Leather (viz docs/content/notes-vybaveni.md,
 * „Námět: pouzdro s vsazenou mincí“): **jeden díl ve tvaru L**. Pás kůže přeložený ve spodní
 * hraně tvoří dva stejně vysoké panely; z horní hrany jednoho z nich (zadní, s motivem) vybíhá
 * u kraje **úzký jazyk**, který se přehne přes karty a zapne drukem na druhý panel (přední,
 * s kapsou na minci). Vedle jazyka je v horní hraně **půlkruhový výřez na prst**, kterým se
 * karty berou; v protilehlém horním rohu zadního panelu je **průchodka** na šňůrku. Přední
 * panel je nižší než karta (karty vyčnívají a dají se chytit), zadní panel karty kryje celé
 * a jazyk se láme až nad nimi. Vnitřek je jedna kapsa (karty a bankovky složené na čtvrt);
 * dělicí panel předloha nemá, v modelu je jen jako volba.
 *
 * Kapsa s mincí je samostatný díl: důlek se tvaruje za mokra ve formě, pak se vyřízne obrys,
 * vysekne okno a kapsa se přišije po třech stranách na přední panel; mince se zasouvá shora.
 *
 * Rozměry NEJSOU odměřené z cizího střihu (ten nemáme). Odvozují se z rozměru platební
 * karty, průměru mince a přídavků na steh. Hodnoty označené „volba“ jsou návrh k ověření
 * na papírovém modelu a odřezku. Revize 2026-09-18 po dvou nezávislých posudcích a po
 * záběrech na skutečný střih předlohy.
 */

export interface CoinCardHolderSpec {
  /** Rozměr platební karty ISO/IEC 7810 ID-1: 85,6 × 53,98 mm (šířka zaokrouhlena na 54). */
  cardWidthMm: number;
  cardHeightMm: number;
  /** Tloušťka karty (ISO/IEC 7810: 0,76 mm) a kolik karet pouzdro nosí. */
  cardThicknessMm: number;
  cardsCount: number;
  /** Vůle karty na každé straně kapsy – volba. */
  cardSideClearanceMm: number;
  /** Kolik mm karty vyčnívá nad přední panel (úchop) – volba (8–12 běžné). */
  cardGripMm: number;
  /** O kolik zadní panel přečnívá nad karty; jazyk se láme až tam – volba. */
  backOverCardMm: number;
  /** Odsazení stehu od hrany a rozteč vidličky. */
  stitchOffsetMm: number;
  stitchPitchMm: number;
  /** Rezerva mezi stehem a vůlí karty, aby se karta nedřela o nit – volba. */
  seamInnerMarginMm: number;
  /** Tloušťka kůže těla; kapsa s mincí je tenčí, aby šla tvarovat. */
  bodyThicknessMm: number;
  pocketThicknessMm: number;
  /** Vložený dělicí panel (dvě vnitřní kapsy). Předloha ho nemá; `false` = věrně předloze. */
  dividerPanel: boolean;
  /**
   * Přídavek na ohyb ve spodní hraně. Neutrální osa ohybu leží v polovině tloušťky kůže,
   * půlkruh kolem obsahu tedy potřebuje π · (obsah/2 + kůže/2). `null` = spočítat, číslo = přebít.
   */
  foldAllowanceMm: number | null;
  /** Jazyk: šířka, zaoblení konce (`null` = plný půlkruh) – volba podle předlohy. */
  tabWidthMm: number;
  tabEndRadiusMm: number | null;
  /** Vzdálenost středu druku od horní hrany předního panelu a přesah jazyka za druk – volba. */
  snapFromFrontTopMm: number;
  tabBeyondSnapMm: number;
  /** Průměr kloboučku druku (běžný druk 12,5 mm) a rezerva kolem něj. */
  snapDiameterMm: number;
  snapClearanceMm: number;
  /** Výřez na prst v horní hraně zadního panelu hned vedle jazyka: poloměr – volba. */
  notchRadiusMm: number;
  /** Průchodka na šňůrku v horním rohu zadního panelu: průměr otvoru a odstup od hran. */
  grommetHoleMm: number;
  grommetFromEdgeMm: number;
  /** Poloměr zaoblení rohů panelů. */
  cornerRadiusMm: number;
  /** Průměr mince. */
  coinDiameterMm: number;
  /**
   * Průměr okna = průměr kruhového výsečníku, který máš. `null` = odvodit z mince tak, aby
   * prstenec kůže kolem okna byl aspoň `minCoinRingMm`, zaokrouhleno na celé mm dolů.
   */
  windowDiameterMm: number | null;
  minCoinRingMm: number;
  /** Vůle otvoru formy kolem mince obalené kůží: otvor = mince + 2·kůže kapsy + vůle. */
  formHoleClearanceMm: number;
  /** Rovná plocha kůže mezi patou důlku (= otvor formy) a stehem kapsy – volba. */
  pocketFlatMm: number;
  /** Kolik kůže zůstane nad mincí k horní (otevřené) hraně kapsy – volba. */
  coinTopOverlapMm: number;
  /** Poloměr horních rohů kapsy s mincí – volba. */
  pocketTopRadiusMm: number;
  /** Nejmenší odstup spodní hrany kapsy od ohybu – volba. */
  pocketFromFoldMinMm: number;
  /** Nejmenší přijatelný můstek kůže mezi otvory a mezi otvorem a hranou. */
  minLigamentMm: number;
}

export const DEFAULT_COIN_CARD_HOLDER: CoinCardHolderSpec = {
  cardWidthMm: 54,
  cardHeightMm: 85.6,
  cardThicknessMm: 0.76,
  cardsCount: 4,
  cardSideClearanceMm: 1.5,
  cardGripMm: 8,
  backOverCardMm: 2,
  stitchOffsetMm: 3.5,
  stitchPitchMm: 4,
  seamInnerMarginMm: 1,
  bodyThicknessMm: 1.5,
  pocketThicknessMm: 1.2,
  dividerPanel: false,
  foldAllowanceMm: null,
  tabWidthMm: 26,
  tabEndRadiusMm: null,
  snapFromFrontTopMm: 10,
  tabBeyondSnapMm: 9,
  snapDiameterMm: 12.5,
  snapClearanceMm: 2,
  notchRadiusMm: 12,
  grommetHoleMm: 5,
  grommetFromEdgeMm: 9,
  cornerRadiusMm: 6,
  coinDiameterMm: 40,
  windowDiameterMm: null,
  minCoinRingMm: 4,
  formHoleClearanceMm: 0.6,
  pocketFlatMm: 3.5,
  coinTopOverlapMm: 3,
  pocketTopRadiusMm: 10,
  pocketFromFoldMinMm: 3,
  minLigamentMm: 3,
};

/**
 * Pojmenované mince pro `--coin`. Průměry českých mincí podle ČNB (technické parametry,
 * ověřeno 2026-09-18): 50 Kč 27,5 mm (bimetal), 20 Kč 26 mm (třináctihran – v kulatém okně
 * budou vidět rohy), 10 Kč 24,5 mm, 5 Kč 23 mm. „decision“ je mince z předlohy Red Forest
 * (40 mm podle popisu produktu).
 */
export const NAMED_COINS = {
  decision: 40,
  '50kc': 27.5,
  '20kc': 26,
  '10kc': 24.5,
  '5kc': 23,
} as const satisfies Record<string, number>;

/** Stránka střihu: A4 na výšku, okraj a mezera mezi díly. Sdílí model (kontroly) i kresba. */
export const A4_SHEET = { widthMm: 210, heightMm: 297, marginMm: 12, gapMm: 12 } as const;
/** Výška legendy pod díly, se kterou kontrola rozvržení počítá. */
export const LEGEND_HEIGHT_MM = 40;

/**
 * Odvozené rozměry. Rozložené tělo se kreslí jako jeden díl v soustavě, kde y = 0 je horní
 * hrana zadního panelu (bez jazyka) a y roste k ohybu a dál po předním panelu; jazyk zasahuje
 * do záporných y. x = 0 je levá hrana, jazyk je u ní.
 */
export interface CoinCardHolderLayout {
  /** Šířka panelů. */
  panelWidthMm: number;
  /** Výška předního panelu (karta − úchop) a zadního (karta + přesah). */
  frontHeightMm: number;
  backHeightMm: number;
  /** Obsah, kolem kterého se tělo ohýbá (karty, případně dělicí panel). */
  innerThicknessMm: number;
  /** Použitý přídavek na ohyb a jeho hranice v soustavě těla. */
  foldAllowanceMm: number;
  foldStartMm: number;
  foldEndMm: number;
  /** Horní hrana předního panelu (konec těla) v soustavě těla. */
  frontTopMm: number;
  /** Jazyk: délka nad horní hranou zadního panelu, jeho x-rozsah, poloměr konce. */
  tabLengthMm: number;
  tabX0Mm: number;
  tabX1Mm: number;
  tabEndRadiusMm: number;
  /** Oblouk jazyka přes obsah (karty + přední panel) a pokles po předku k jeho horní hraně. */
  tabWrapMm: number;
  tabDropMm: number;
  /** Střed druku na jazyku (y záporné) a na předním panelu (v soustavě těla). */
  snapXMm: number;
  snapTabYMm: number;
  snapFrontYMm: number;
  /** Kam na předním panelu dopadne konec jazyka, od horní hrany předku. */
  tabEndOnFrontMm: number;
  /** Výřez na prst: střed na horní hraně zadního panelu a poloměr. */
  notchCentreXMm: number;
  notchRadiusMm: number;
  /** Průchodka: střed v soustavě těla. */
  grommetXMm: number;
  grommetYMm: number;
  /** Celková délka rozloženého těla včetně jazyka. */
  bodyLengthMm: number;
  /** Kapsa s mincí (vlastní soustava, 0,0 = levý horní roh kapsy). */
  pocketWidthMm: number;
  pocketHeightMm: number;
  coinCentreXMm: number;
  coinCentreYMm: number;
  windowDiameterMm: number;
  coinRingMm: number;
  formHoleDiameterMm: number;
  formPlateMm: number;
  /** Poloha kapsy na předním panelu: levý horní roh, měřeno od horní hrany předku. */
  pocketXMm: number;
  pocketYMm: number;
  /** Kde na kapse začíná šev (pod zaoblením horních rohů), od její horní hrany. */
  pocketSeamTopMm: number;
  /** Kolik karty vyčnívá nad přední panel. */
  cardExposedMm: number;
  /** Boční švy: od `stitchOffsetMm` nad ohybem k `stitchOffsetMm` pod horní hranou předku (stejně na obou panelech). */
  sideSeamLengthMm: number;
  sideSeamHoles: number;
  /** Dělicí panel (jen když `dividerPanel`). */
  dividerHeightMm: number | null;
}

export function coinCardHolderLayout(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): CoinCardHolderLayout {
  const seam = spec.stitchOffsetMm + spec.seamInnerMarginMm;
  const panelWidth = round(spec.cardWidthMm + 2 * spec.cardSideClearanceMm + 2 * seam);
  const frontHeight = round(spec.cardHeightMm - spec.cardGripMm);
  const backHeight = round(spec.cardHeightMm + spec.backOverCardMm);

  const inner =
    spec.cardsCount * spec.cardThicknessMm + (spec.dividerPanel ? spec.bodyThicknessMm : 0);
  const foldAllowance =
    spec.foldAllowanceMm ?? round(Math.PI * (inner / 2 + spec.bodyThicknessMm / 2));
  // Soustava těla: y = 0 horní hrana zadního panelu, dolů přes ohyb na přední panel.
  const foldStart = backHeight;
  const foldEnd = round(backHeight + foldAllowance);
  const frontTop = round(foldEnd + frontHeight);

  // Jazyk: přes obsah (karty + přední panel) po neutrální ose, pak dolů po předku k druku
  // a přesah za druk. Konec = půlkruh o poloměru půl šířky, pokud není zadáno jinak.
  const tabWrap = round(Math.PI * ((inner + spec.bodyThicknessMm) / 2 + spec.bodyThicknessMm / 2));
  // Po oblouku klesá jazyk po předku o (zadní − přední) k horní hraně předku a dál k druku.
  const tabDrop = round(backHeight - frontHeight);
  const tabLength = round(tabWrap + tabDrop + spec.snapFromFrontTopMm + spec.tabBeyondSnapMm);
  const tabEndRadius = Math.min(spec.tabEndRadiusMm ?? spec.tabWidthMm / 2, spec.tabWidthMm / 2);
  const snapX = round(spec.tabWidthMm / 2);
  const snapTabY = round(-(tabWrap + tabDrop + spec.snapFromFrontTopMm));
  const snapFrontY = round(frontTop - spec.snapFromFrontTopMm);
  const tabEndOnFront = round(spec.snapFromFrontTopMm + spec.tabBeyondSnapMm);

  const notchCentreX = round(spec.tabWidthMm + spec.notchRadiusMm);
  const grommetX = round(panelWidth - spec.grommetFromEdgeMm);
  const grommetY = spec.grommetFromEdgeMm;

  // Okno, forma, kapsa.
  const windowDiameter =
    spec.windowDiameterMm ?? Math.floor(spec.coinDiameterMm - 2 * spec.minCoinRingMm);
  const coinRing = round((spec.coinDiameterMm - windowDiameter) / 2);
  const formHole = round(
    spec.coinDiameterMm + 2 * spec.pocketThicknessMm + spec.formHoleClearanceMm,
  );
  const pocketWidth = round(formHole + 2 * (spec.pocketFlatMm + spec.stitchOffsetMm));
  const pocketHeight = round(
    spec.stitchOffsetMm + spec.pocketFlatMm + formHole + spec.coinTopOverlapMm,
  );
  const coinCentreX = round(pocketWidth / 2);
  const coinCentreY = round(pocketHeight - spec.stitchOffsetMm - spec.pocketFlatMm - formHole / 2);
  // Kapsa na předku: pod drukem/koncem jazyka (+ rezerva) a nad pásmem ohybu; vystředit.
  const bandTop =
    Math.max(spec.snapFromFrontTopMm + spec.snapDiameterMm / 2, tabEndOnFront) +
    spec.snapClearanceMm;
  const bandBottom = frontHeight - spec.pocketFromFoldMinMm;
  const slack = bandBottom - bandTop - pocketHeight;
  const pocketY = round(bandTop + Math.max(0, slack) / 2);
  const pocketX = round((panelWidth - pocketWidth) / 2);

  const sideSeamLength = round(frontHeight - 2 * spec.stitchOffsetMm);
  const sideSeamHoles = Math.floor(sideSeamLength / spec.stitchPitchMm + 1e-9) + 1;

  return {
    panelWidthMm: panelWidth,
    frontHeightMm: frontHeight,
    backHeightMm: backHeight,
    innerThicknessMm: round(inner),
    foldAllowanceMm: foldAllowance,
    foldStartMm: foldStart,
    foldEndMm: foldEnd,
    frontTopMm: frontTop,
    tabLengthMm: tabLength,
    tabX0Mm: 0,
    tabX1Mm: spec.tabWidthMm,
    tabEndRadiusMm: round(tabEndRadius),
    tabWrapMm: tabWrap,
    tabDropMm: tabDrop,
    snapXMm: snapX,
    snapTabYMm: snapTabY,
    snapFrontYMm: snapFrontY,
    tabEndOnFrontMm: tabEndOnFront,
    notchCentreXMm: notchCentreX,
    notchRadiusMm: spec.notchRadiusMm,
    grommetXMm: grommetX,
    grommetYMm: grommetY,
    bodyLengthMm: round(tabLength + frontTop),
    pocketWidthMm: pocketWidth,
    pocketHeightMm: pocketHeight,
    coinCentreXMm: coinCentreX,
    coinCentreYMm: coinCentreY,
    windowDiameterMm: windowDiameter,
    coinRingMm: coinRing,
    formHoleDiameterMm: formHole,
    // Deska formy: 10 mm materiálu kolem otvoru stačí, aby se přes ni dala stáhnout svěrka.
    formPlateMm: round(formHole + 20),
    pocketXMm: pocketX,
    pocketYMm: pocketY,
    pocketSeamTopMm: spec.pocketTopRadiusMm,
    cardExposedMm: round(spec.cardHeightMm - frontHeight),
    sideSeamLengthMm: sideSeamLength,
    sideSeamHoles,
    dividerHeightMm: spec.dividerPanel ? frontHeight : null,
  };
}

/** Kontroly. Prázdný seznam = v pořádku. */
export function checkCoinCardHolder(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string[] {
  const p: string[] = [];
  for (const [k, v] of Object.entries(spec)) {
    if (v === null || typeof v === 'boolean') continue;
    if (!Number.isFinite(v) || v < 0) p.push(`${k} musí být nezáporné číslo, je ${String(v)}.`);
  }
  if (spec.cardsCount < 1) p.push('cardsCount musí být aspoň 1.');
  if (p.length > 0) return p;

  const L = coinCardHolderLayout(spec);
  const min = spec.minLigamentMm;
  const so = spec.stitchOffsetMm;

  if (spec.cardGripMm < 6 || spec.cardGripMm > 15) {
    p.push(`Karta vyčnívá ${spec.cardGripMm} mm; pod 6 mm nejde chytit, nad 15 mm je moc volná.`);
  }
  if (spec.backOverCardMm < 1) {
    p.push(
      'Zadní panel musí přečnívat nad karty aspoň 1 mm, jinak se jazyk láme přes hranu karet.',
    );
  }
  // Jazyk a výřez musí ležet v šířce panelu a nechat místo na průchodku.
  const notchEnd = L.notchCentreXMm + L.notchRadiusMm;
  const grommetLeft = L.grommetXMm - spec.grommetHoleMm / 2;
  if (notchEnd + min > grommetLeft) {
    p.push(
      `Výřez na prst končí v x = ${notchEnd} mm, průchodka začíná v ${grommetLeft.toFixed(1)} mm ` +
        `(minimum můstku ${min}). Zmenši notchRadiusMm nebo tabWidthMm.`,
    );
  }
  if (L.grommetXMm + spec.grommetHoleMm / 2 + 1 > L.panelWidthMm - so) {
    p.push('Průchodka zasahuje do bočního švu; zvětši grommetFromEdgeMm.');
  }
  if (spec.grommetFromEdgeMm - spec.grommetHoleMm / 2 < min) {
    p.push(
      `Průchodka je moc blízko hrany (můstek ${(spec.grommetFromEdgeMm - spec.grommetHoleMm / 2).toFixed(1)} mm, minimum ${min}).`,
    );
  }
  // Výřez nesmí odkrýt víc než ~1/3 karty a musí být hlubší než přesah panelu, aby šlo kartu chytit.
  if (L.notchRadiusMm <= spec.backOverCardMm + 5) {
    p.push(
      `Výřez na prst hluboký ${L.notchRadiusMm} mm odkryje z karty jen ${(L.notchRadiusMm - spec.backOverCardMm).toFixed(1)} mm – nejde chytit.`,
    );
  }
  if (L.notchRadiusMm > L.backHeightMm / 3) {
    p.push('Výřez na prst je hlubší než třetina panelu.');
  }
  // Boční šev vlevo prochází pod jazykem: jazyk musí být širší než 2·so, aby šev zůstal v panelu.
  if (spec.tabWidthMm < 2 * so + spec.snapDiameterMm) {
    p.push(
      `Jazyk ${spec.tabWidthMm} mm je užší než druk s okraji (${2 * so + spec.snapDiameterMm} mm).`,
    );
  }
  if (spec.tabBeyondSnapMm < spec.snapDiameterMm / 2 + spec.snapClearanceMm) {
    p.push('Konec jazyka je moc blízko druku; tabBeyondSnapMm zvětši.');
  }
  // Druk na předku: pod horní hranou, nad kapsou.
  const snapFromTop = spec.snapFromFrontTopMm;
  if (snapFromTop - spec.snapDiameterMm / 2 < spec.snapClearanceMm) {
    p.push('Druk na předním panelu zasahuje k horní hraně; zvětši snapFromFrontTopMm.');
  }
  const bandTop =
    Math.max(snapFromTop + spec.snapDiameterMm / 2, L.tabEndOnFrontMm) + spec.snapClearanceMm;
  if (L.pocketYMm + 1e-9 < bandTop) {
    p.push(
      `Kapsa s mincí začíná v ${L.pocketYMm} mm, jazyk a druk sahají do ${bandTop.toFixed(1)} mm.`,
    );
  }
  const available = L.frontHeightMm - spec.pocketFromFoldMinMm - bandTop;
  if (L.pocketHeightMm > available + 1e-9) {
    p.push(
      `Kapsa s mincí (${L.pocketHeightMm} mm) se nevejde mezi jazyk a pásmo ohybu ` +
        `(k dispozici ${available.toFixed(1)} mm). Zmenši minci nebo tabBeyondSnapMm.`,
    );
  }
  // Kapsa a boční švy panelu.
  if (L.pocketXMm - so < 1) {
    p.push(
      `Hrana kapsy s mincí leží ${(L.pocketXMm - so).toFixed(1)} mm od bočního švu panelu (minimum 1).`,
    );
  }
  if (L.pocketXMm < min) {
    p.push(
      `Šev kapsy a boční šev panelu jsou jen ${L.pocketXMm.toFixed(1)} mm od sebe (minimum ${min}).`,
    );
  }
  if (L.coinRingMm < spec.minCoinRingMm) {
    p.push(
      `Prstenec kolem okna je ${L.coinRingMm} mm, minimum ${spec.minCoinRingMm} mm – minci by neudržel.`,
    );
  }
  if (L.windowDiameterMm < 10) {
    p.push(`Okno ${L.windowDiameterMm} mm je moc malé, z mince by nebylo nic vidět.`);
  }
  if (spec.pocketTopRadiusMm < so) {
    p.push('pocketTopRadiusMm musí být aspoň stitchOffsetMm, jinak šev začíná v oblouku.');
  }
  // A4: levý sloupec tělo (s jazykem), pravý sloupec kapsa + forma (+ dělicí panel).
  const { heightMm: H, widthMm: W, marginMm: m, gapMm: g } = A4_SHEET;
  const usable = H - 2 * m - LEGEND_HEIGHT_MM;
  if (L.bodyLengthMm > usable) {
    p.push(`Tělo ${L.bodyLengthMm} mm se nevejde na A4 na výšku (max ${usable}).`);
  }
  const rightColumn =
    (L.dividerHeightMm !== null ? L.dividerHeightMm + g : 0) +
    L.pocketHeightMm +
    10 +
    g +
    4 +
    L.formPlateMm +
    8;
  if (rightColumn > usable) {
    p.push(`Pravý sloupec střihu (${rightColumn.toFixed(1)} mm) se nevejde na A4 nad legendu.`);
  }
  if (2 * L.panelWidthMm + 2 * m + g > W) {
    p.push('Dva díly vedle sebe se nevejdou na šířku A4.');
  }
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
