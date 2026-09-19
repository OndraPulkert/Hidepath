/**
 * Pouzdro na karty s vsazenou mincí – geometrie střihu v milimetrech.
 *
 * Předloha: produkt a video Red Forest Leather (rozbor v docs/content/notes-vybaveni.md,
 * „Námět: pouzdro s vsazenou mincí“, a docs/zadani/pouzdro-mince.md). Co je z předlohy
 * ověřeno na fotkách a záběrech (v3, 2026-09-18 večer):
 * - dva **stejně vysoké panely**, karty jsou celé schované;
 * - z horní hrany zadního panelu vybíhá u jedné hrany **jazyk** (asi polovina šířky, konec
 *   zaoblený obdélník), přehne se přes karty a zapne drukem na přední panel;
 * - v horním rohu **předního** panelu na druhé straně je **čtvrtkruhový výřez na prst**, kterým
 *   je vidět zadní panel s **průchodkou** na šňůrku; zadní panel má horní hranu rovnou;
 * - na předku je přišitá **kapsa s mincí** (důlek tvarovaný za mokra, okno vyseknuté), mince se
 *   zasouvá shora; vnitřek je jedna kapsa na karty a složené bankovky.
 *
 * Co je v modelu **jinak než u předlohy** (vědomá odchylka pro ruční výrobu začátečníka):
 * předloha je zřejmě ovinutá přes boky (boční hrany jsou ohyby, dno prošité, boční řady dírek
 * ozdobné) a u průchodky má víc vrstev. Model používá **jeden díl přeložený ve spodní hraně
 * a sešitý po bocích** – zepředu i zezadu vypadá jako předloha, jen zadní panel je celý (bez
 * výřezu v druhé vrstvě) a boční švy nesou nit.
 *
 * Rozměry NEJSOU odměřené z cizího střihu (ten nemáme). Odvozují se z rozměru platební karty,
 * průměru mince a přídavků na steh; poměry (šířka jazyka, poloměr výřezu, poloha druku) jsou
 * odhad z fotek. Hodnoty označené „volba“ ověřit na papírovém modelu a odřezku.
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
  /** O kolik panely přečnívají nad karty (karty jsou celé schované) – volba. */
  backOverCardMm: number;
  /** O kolik je horní hrana předního panelu níž než zadního. Předloha: 0 (hrany lícují). */
  frontTopDropMm: number;
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
  /**
   * Jazyk: u které hrany zadního panelu vybíhá v kresbě střihu, tj. při pohledu na rozložené
   * tělo RUBEM nahoru (šablona se obkresluje na rub). Po přeložení lícem ven je pak zepředu
   * jazyk na téže straně: předloha má zepředu jazyk vpravo a výřez s průchodkou vlevo → `right`.
   */
  tabSide: 'left' | 'right';
  /** Jazyk: šířka (předloha ≈ polovina šířky pouzdra), zaoblení konce (`null` = plný půlkruh). */
  tabWidthMm: number;
  tabEndRadiusMm: number | null;
  /** Vzdálenost středu druku od horní hrany předního panelu a přesah jazyka za druk – volba. */
  snapFromFrontTopMm: number;
  tabBeyondSnapMm: number;
  /**
   * Rezerva délky jazyka na zkoušku s kartami: skutečná délka oblouku závisí na tuhosti kůže
   * a počtu karet (±3 mm), jazyk se řeže delší a zkracuje až po osazení kloboučku.
   */
  tabFitReserveMm: number;
  /** Průměr kloboučku druku (běžný druk 12,5 mm) a rezerva kolem něj. */
  snapDiameterMm: number;
  snapClearanceMm: number;
  /**
   * Čtvrtkruhový výřez na prst v horním rohu PŘEDNÍHO panelu na straně průchodky (naproti
   * jazyku); poloměr se středem v rohu. `null` = šířka panelu − šířka jazyka (s mincí 40 mm už
   * tlačí kapsu do pásma ohybu – kontrola to odmítne). Předloha ≈ 30.
   */
  scoopRadiusMm: number | null;
  /** Průchodka na šňůrku v horním rohu zadního panelu na opačné straně než jazyk (vidět výřezem): průměr a odstup od hran. */
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
  /**
   * Vůle otvoru formy kolem mince obalené kůží: otvor = mince + 2·kůže kapsy + vůle. Kůže po
   * vyschnutí o 1–2 % sedne, vůle pod 1 mm může minci sevřít – volba 1,6.
   */
  formHoleClearanceMm: number;
  /** Tloušťka desky formy: musí pojmout minci (≈ 3 mm) i kůži a nechat důlek dosednout – volba. */
  formPlateThicknessMm: number;
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
  backOverCardMm: 2,
  frontTopDropMm: 0,
  stitchOffsetMm: 3.5,
  stitchPitchMm: 4,
  seamInnerMarginMm: 1,
  bodyThicknessMm: 1.5,
  pocketThicknessMm: 1.2,
  dividerPanel: false,
  foldAllowanceMm: null,
  tabSide: 'right',
  tabWidthMm: 33,
  tabEndRadiusMm: 10,
  snapFromFrontTopMm: 10,
  tabBeyondSnapMm: 11,
  tabFitReserveMm: 5,
  snapDiameterMm: 12.5,
  snapClearanceMm: 2,
  scoopRadiusMm: 30,
  grommetHoleMm: 5,
  grommetFromEdgeMm: 9,
  cornerRadiusMm: 6,
  coinDiameterMm: 40,
  windowDiameterMm: null,
  minCoinRingMm: 4,
  formHoleClearanceMm: 1.6,
  formPlateThicknessMm: 8,
  pocketFlatMm: 2,
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
/** Svislé mezery pravého sloupce střihu (nadpis nad dílem, popisky pod dílem) – sdílí kontrola i kresba. */
export const SHEET_TITLE_GAP_MM = 4;
export const SHEET_CAPTION_MM = 10;

/**
 * Odvozené rozměry. Rozložené tělo se kreslí jako jeden díl v soustavě, kde y = 0 je horní
 * hrana zadního panelu (bez jazyka) a y roste k ohybu a dál po předním panelu; jazyk zasahuje
 * do záporných y. x = 0 je levá hrana, jazyk je u ní.
 */
export interface CoinCardHolderLayout {
  /** Šířka panelů. */
  panelWidthMm: number;
  /** Výška zadního panelu (karta + přesah) a předního (zadní − frontTopDropMm). */
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
  /** Jazyk: délka řezu nad horní hranou zadního panelu (včetně rezervy), délka bez rezervy, x-rozsah, poloměr konce. */
  tabLengthMm: number;
  tabNominalLengthMm: number;
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
  /** Kam na předním panelu dopadne konec jazyka (s rezervou, před zkrácením), od horní hrany předku. */
  tabEndOnFrontMm: number;
  /** Výřez na prst: poloměr a x rohu předního panelu, ve kterém má střed (0 nebo šířka panelu). */
  scoopRadiusMm: number;
  scoopCornerXMm: number;
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
  /** Kolik karty odkryje výřez (poloměr − přesah panelu nad kartou − snížení předku). */
  cardExposedMm: number;
  /**
   * Boční švy, tečky počítané od ohybu na obou panelech: na straně jazyka od `stitchOffsetMm`
   * nad ohybem po `stitchOffsetMm` pod horní hranou předku; na straně výřezu končí pod výřezem.
   */
  seamLengthTabSideMm: number;
  seamHolesTabSide: number;
  seamLengthScoopSideMm: number;
  seamHolesScoopSide: number;
  /** Dělicí panel (jen když `dividerPanel`). */
  dividerHeightMm: number | null;
}

export function coinCardHolderLayout(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): CoinCardHolderLayout {
  const seam = spec.stitchOffsetMm + spec.seamInnerMarginMm;
  const panelWidth = round(spec.cardWidthMm + 2 * spec.cardSideClearanceMm + 2 * seam);
  const backHeight = round(spec.cardHeightMm + spec.backOverCardMm);
  const frontHeight = round(backHeight - spec.frontTopDropMm);

  const inner =
    spec.cardsCount * spec.cardThicknessMm + (spec.dividerPanel ? spec.bodyThicknessMm : 0);
  const foldAllowance =
    spec.foldAllowanceMm ?? round(Math.PI * (inner / 2 + spec.bodyThicknessMm / 2));
  // Soustava těla: y = 0 horní hrana zadního panelu, dolů přes ohyb na přední panel.
  const foldStart = backHeight;
  const foldEnd = round(backHeight + foldAllowance);
  const frontTop = round(foldEnd + frontHeight);

  // Jazyk: přes obsah (karty + horní hrana předního panelu, která s zadním lícuje) po neutrální
  // ose, pak dolů po předku k druku a přesah za druk; navíc rezerva na zkoušku s kartami.
  const tabWrap = round(Math.PI * ((inner + spec.bodyThicknessMm) / 2 + spec.bodyThicknessMm / 2));
  // Po oblouku klesá jazyk po předku o rozdíl výšek panelů (u předlohy 0) a dál k druku.
  const tabDrop = round(backHeight - frontHeight);
  const tabNominal = round(tabWrap + tabDrop + spec.snapFromFrontTopMm + spec.tabBeyondSnapMm);
  const tabLength = round(tabNominal + spec.tabFitReserveMm);
  const tabEndRadius = Math.min(spec.tabEndRadiusMm ?? spec.tabWidthMm / 2, spec.tabWidthMm / 2);
  const right = spec.tabSide === 'right';
  const snapX = round((right ? panelWidth - spec.tabWidthMm : 0) + spec.tabWidthMm / 2);
  const snapTabY = round(-(tabWrap + tabDrop + spec.snapFromFrontTopMm));
  const snapFrontY = round(frontTop - spec.snapFromFrontTopMm);
  const tabEndOnFront = round(
    spec.snapFromFrontTopMm + spec.tabBeyondSnapMm + spec.tabFitReserveMm,
  );

  const tabX0 = right ? round(panelWidth - spec.tabWidthMm) : 0;
  const tabX1 = right ? panelWidth : spec.tabWidthMm;
  // Výřez na prst v předním panelu v rohu na straně průchodky (naproti jazyku). Přední panel
  // je v rozloženém těle vzhůru nohama, ale x se ohybem nemění: roh je na stejné straně jako
  // průchodka zadního panelu, a po přeložení leží přes ni.
  const scoopRadius = round(spec.scoopRadiusMm ?? panelWidth - spec.tabWidthMm);
  const scoopCornerX = right ? 0 : panelWidth;
  const grommetX = right ? spec.grommetFromEdgeMm : round(panelWidth - spec.grommetFromEdgeMm);
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
  const pocketX = round((panelWidth - pocketWidth) / 2);
  // Horní roh kapsy na straně výřezu (zaoblený R) musí zůstat aspoň `minLigamentMm` od
  // oblouku výřezu: kapsa se posune níž, pokud vystředění v pásmu nestačí.
  const rp = spec.pocketTopRadiusMm;
  const reach = scoopRadius + spec.minLigamentMm + rp;
  const dx = pocketX + rp;
  const pocketYForScoop = reach > dx ? Math.sqrt(reach * reach - dx * dx) - rp : 0;
  const pocketY = round(Math.max(bandTop + Math.max(0, slack) / 2, pocketYForScoop));

  const holes = (len: number): number =>
    len < 0 ? 0 : Math.floor(len / spec.stitchPitchMm + 1e-9) + 1;
  const seamLengthTabSide = round(frontHeight - 2 * spec.stitchOffsetMm);
  const seamLengthScoopSide = round(frontHeight - scoopRadius - 2 * spec.stitchOffsetMm);

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
    tabNominalLengthMm: tabNominal,
    tabX0Mm: tabX0,
    tabX1Mm: tabX1,
    tabEndRadiusMm: round(tabEndRadius),
    tabWrapMm: tabWrap,
    tabDropMm: tabDrop,
    snapXMm: snapX,
    snapTabYMm: snapTabY,
    snapFrontYMm: snapFrontY,
    tabEndOnFrontMm: tabEndOnFront,
    scoopRadiusMm: scoopRadius,
    scoopCornerXMm: scoopCornerX,
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
    // Deska formy: 15 mm materiálu kolem otvoru, aby měly čelisti svěrek kam dosednout.
    formPlateMm: round(formHole + 30),
    pocketXMm: pocketX,
    pocketYMm: pocketY,
    pocketSeamTopMm: spec.pocketTopRadiusMm,
    cardExposedMm: round(scoopRadius - spec.backOverCardMm - spec.frontTopDropMm),
    seamLengthTabSideMm: seamLengthTabSide,
    seamHolesTabSide: holes(seamLengthTabSide),
    seamLengthScoopSideMm: seamLengthScoopSide,
    seamHolesScoopSide: holes(seamLengthScoopSide),
    dividerHeightMm: spec.dividerPanel ? frontHeight : null,
  };
}

/** Kontroly. Prázdný seznam = v pořádku. */
export function checkCoinCardHolder(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string[] {
  const p: string[] = [];
  for (const [k, v] of Object.entries(spec)) {
    if (typeof v !== 'number') continue;
    if (!Number.isFinite(v) || v < 0) p.push(`${k} musí být nezáporné číslo, je ${String(v)}.`);
  }
  if (spec.tabSide !== 'left' && spec.tabSide !== 'right') {
    p.push(`tabSide musí být 'left' nebo 'right', je ${String(spec.tabSide)}.`);
  }
  if (spec.cardsCount < 1 || !Number.isInteger(spec.cardsCount)) {
    p.push('cardsCount musí být celé číslo aspoň 1.');
  }
  // Rozměry, které dělí nebo určují měřítko, musí být kladné (nula by zacyklila kresbu stehu).
  for (const k of [
    'cardWidthMm',
    'cardHeightMm',
    'cardThicknessMm',
    'stitchPitchMm',
    'bodyThicknessMm',
    'pocketThicknessMm',
    'coinDiameterMm',
    'tabWidthMm',
    'grommetHoleMm',
    'snapDiameterMm',
  ] as const) {
    if (!(spec[k] > 0)) p.push(`${k} musí být kladné.`);
  }
  if (p.length > 0) return p;

  const L = coinCardHolderLayout(spec);
  const min = spec.minLigamentMm;
  const so = spec.stitchOffsetMm;

  if (spec.backOverCardMm < 1) {
    p.push('Panely musí přečnívat nad karty aspoň 1 mm, jinak se jazyk láme přes hranu karet.');
  }
  if (spec.frontTopDropMm > spec.cardHeightMm / 2) {
    p.push('frontTopDropMm je větší než půl karty – přední panel by karty nedržel.');
  }
  // Průchodka: můstek k hranám (nad předkem je zadní panel v rohu jednovrstvý – výřez předku).
  if (spec.grommetFromEdgeMm - spec.grommetHoleMm / 2 < min) {
    p.push(
      `Průchodka je moc blízko hrany (můstek ${(spec.grommetFromEdgeMm - spec.grommetHoleMm / 2).toFixed(1)} mm, minimum ${min}).`,
    );
  }
  // Výřez na prst: dost hluboký na palec, ne přes půl panelu, celý mimo jazyk a druk, a musí
  // odkrýt průchodku zadního panelu (včetně kroužku/přírubky ≈ +3 mm) s můstkem.
  const R = L.scoopRadiusMm;
  if (R < 20) {
    p.push(`Výřez na prst R${R} je mělký; předloha má ≈ 30 mm, pod 20 mm palec kartu nechytí.`);
  }
  if (R > L.frontHeightMm / 2) {
    p.push(`Výřez na prst R${R} je hlubší než půl předního panelu.`);
  }
  if (R > L.panelWidthMm - spec.tabWidthMm) {
    p.push(
      `Výřez na prst R${R} zasahuje pod jazyk (šířka mimo jazyk ${L.panelWidthMm - spec.tabWidthMm} mm).`,
    );
  }
  // Patice druku (střed snapX, snapFromFrontTop pod hranou) musí ležet mimo oblouk výřezu i s okrajem.
  const snapToCorner = Math.hypot(L.snapXMm - L.scoopCornerXMm, spec.snapFromFrontTopMm);
  if (snapToCorner < R + spec.snapDiameterMm / 2 + spec.snapClearanceMm) {
    p.push('Výřez na prst sahá k patici druku; zmenši scoopRadiusMm nebo posuň druk.');
  }
  // Zaoblení rohů nesmí být větší než rovné úseky, na kterých leží.
  if (
    spec.cornerRadiusMm > (L.panelWidthMm - spec.tabWidthMm) / 2 ||
    spec.cornerRadiusMm + R > L.panelWidthMm
  ) {
    p.push(`cornerRadiusMm ${spec.cornerRadiusMm} je moc velké pro šířku mimo jazyk a výřez.`);
  }
  const grommetFromCorner = Math.hypot(spec.grommetFromEdgeMm, spec.grommetFromEdgeMm);
  if (grommetFromCorner + spec.grommetHoleMm / 2 + 3 + min > R) {
    p.push(
      `Průchodka (kroužek do ${(grommetFromCorner + spec.grommetHoleMm / 2 + 3).toFixed(1)} mm od rohu) by výřezem R${R} nebyla celá vidět.`,
    );
  }
  if (L.seamLengthScoopSideMm < 3 * spec.stitchPitchMm) {
    p.push('Boční šev na straně výřezu je kratší než 3 rozteče; výřez je moc hluboký.');
  }
  // Jazyk musí pojmout druk s okrajem na šev/hranu z každé strany.
  if (spec.tabWidthMm < 2 * so + spec.snapDiameterMm) {
    p.push(
      `Jazyk ${spec.tabWidthMm} mm je užší než druk s okraji (${2 * so + spec.snapDiameterMm} mm).`,
    );
  }
  if (spec.tabEndRadiusMm !== null && spec.tabEndRadiusMm > spec.tabWidthMm / 2) {
    p.push(`tabEndRadiusMm ${spec.tabEndRadiusMm} je větší než půl šířky jazyka.`);
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
  const available = L.frontHeightMm - spec.pocketFromFoldMinMm - bandTop;
  if (L.pocketHeightMm > available + 1e-9) {
    p.push(
      `Kapsa s mincí (${L.pocketHeightMm} mm) se nevejde mezi jazyk a pásmo ohybu ` +
        `(k dispozici ${available.toFixed(1)} mm). Zmenši minci nebo tabBeyondSnapMm.`,
    );
  }
  // Kapsa posunutá kvůli výřezu (ne kvůli malému pásmu – to hlásí kontrola výš) nesmí spadnout do ohybu.
  else if (L.pocketYMm + L.pocketHeightMm > L.frontHeightMm - spec.pocketFromFoldMinMm + 1e-9) {
    p.push(
      `Kapsa s mincí končí ${(L.pocketYMm + L.pocketHeightMm).toFixed(1)} mm pod horní hranou předku, ` +
        `pásmo ohybu začíná v ${(L.frontHeightMm - spec.pocketFromFoldMinMm).toFixed(1)}; zmenši scoopRadiusMm nebo minci.`,
    );
  }
  if (spec.tabFitReserveMm < 3) {
    p.push('tabFitReserveMm pod 3 mm nepokryje nejistotu délky oblouku (±3 mm).');
  }
  if (spec.formHoleClearanceMm < 1) {
    p.push('formHoleClearanceMm pod 1 mm: kůže po vyschnutí sedne a minci sevře.');
  }
  if (spec.formPlateThicknessMm < 6) {
    p.push('formPlateThicknessMm pod 6 mm nepojme minci a kůži, důlek by nedosedl.');
  }
  // Kapsa a boční švy panelu.
  // Hrana kapsy aspoň 1 mm od bočního švu panelu a šev kapsy aspoň `min` od švu panelu.
  const pocketEdgeMin = Math.max(so + 1, min);
  if (L.pocketXMm < pocketEdgeMin) {
    p.push(
      `Hrana kapsy s mincí leží ${(L.pocketXMm - so).toFixed(1)} mm od bočního švu panelu ` +
        `(minimum ${(pocketEdgeMin - so).toFixed(1)}); zmenši minci nebo pocketFlatMm.`,
    );
  }
  if (L.windowDiameterMm >= spec.coinDiameterMm) {
    p.push(`Okno ${L.windowDiameterMm} mm musí být menší než mince ${spec.coinDiameterMm} mm.`);
  } else if (L.coinRingMm < spec.minCoinRingMm) {
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
  // Kapsa: nadpis + díl + popisky; mezera; forma: nadpis + díl + popisky (jako v kresbě).
  const rightColumn =
    (L.dividerHeightMm !== null ? L.dividerHeightMm + g : 0) +
    SHEET_TITLE_GAP_MM +
    L.pocketHeightMm +
    SHEET_CAPTION_MM +
    g +
    SHEET_TITLE_GAP_MM +
    L.formPlateMm +
    SHEET_CAPTION_MM;
  if (rightColumn > usable) {
    p.push(`Pravý sloupec střihu (${rightColumn.toFixed(1)} mm) se nevejde na A4 nad legendu.`);
  }
  if (L.panelWidthMm + Math.max(L.panelWidthMm, L.formPlateMm, L.pocketWidthMm) + 2 * m + g > W) {
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
