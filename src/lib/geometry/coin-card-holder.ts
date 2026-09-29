/**
 * Pouzdro na karty s vsazenou mincí – geometrie střihu v milimetrech (v4).
 *
 * Předloha: produkt a video Red Forest Leather (rozbor v docs/content/notes-vybaveni.md,
 * „Námět: pouzdro s vsazenou mincí“, zadání a historie v docs/zadani/pouzdro-mince.md).
 *
 * Konstrukce odečtená ze záběrů skládání, papírové šablony na kůži a fotek hotového kusu:
 * **jeden vodorovný pás tří panelů, ohýbaný na obou bocích, sešitý jen ve dně.**
 *
 *   [JAZYK]                                            (vystupuje z horní hrany)
 *   [ZADNÍ panel][ohyb A][PŘEDNÍ panel][ohyb B][VNITŘNÍ panel]
 *
 * - Ohyb A (mezi zadním a předním) obepíná vnitřní panel i celý obsah, ohyb B (mezi předním
 *   a vnitřním) jen karty. Po složení jsou **obě boční hrany ohyby**, dno je prošité skrz
 *   všechny vrstvy a horní hrana zůstává otevřená.
 * - Vnitřní panel dělí obsah na **dvě kapsy** (karty vepředu, složené bankovky vzadu) – proto
 *   výrobce uvádí „two main compartments“.
 * - Velký **výřez na prst** je jeden oblouk ve tvaru U přes pásmo ohybu A: po složení z něj
 *   vznikne čtvrtkruh v rohu předního panelu a čtvrtelipsa v rohu zadního (hrana jazyka do ní
 *   přechází plynule), mezi nimi je vidět vnitřní panel. Předloha má v jeho rohu **průchodku**
 *   na šňůrku; od v4.11 je průchodka jen volitelná (`grommet: true`, přepínač `--grommet`).
 * - **Jazyk** vybíhá z horní hrany zadního panelu na opačné straně, přehne se přes celý obsah
 *   a zapne drukem na přední panel; na předním panelu je přišitá **kapsa s mincí**.
 *
 * Střih se obkresluje na **líc** (jako to dělá výrobce), proto je kresba pohled zvenku:
 * přední panel je vidět tak, jak bude na hotovém kusu.
 *
 * Rozměry NEJSOU odměřené z cizího střihu. Odvozují se z rozměru platební karty, průměru mince
 * a přídavků; poměry (šířka jazyka, poloměr výřezu, poloha druku) jsou odhad z fotek s mincí
 * 40 mm jako měřítkem. Výchozí mince je od v4.10 česká padesátikoruna (27,5 mm; od v4.11 okno Ø 20 mm),
 * mince 40 mm z předlohy zůstává jako varianta (`--coin 40`). Hodnoty označené „volba“ ověřit
 * na papírovém modelu a odřezku.
 */

export interface CoinCardHolderSpec {
  /** Rozměr platební karty ISO/IEC 7810 ID-1: 85,6 × 53,98 mm (šířka zaokrouhlena na 54). */
  cardWidthMm: number;
  cardHeightMm: number;
  /** Tloušťka karty (ISO/IEC 7810: 0,76 mm) a kolik karet nese přední kapsa. */
  cardThicknessMm: number;
  cardsCount: number;
  /** Tloušťka složených bankovek v zadní kapse (za vnitřním panelem) – volba. */
  billsThicknessMm: number;
  /** Vůle karty na každé straně – volba. */
  cardSideClearanceMm: number;
  /**
   * Kůže za vůlí karty k boční hraně (hrana je ohyb, ne šev) – volba. Předloha je široká
   * ≈ 72 mm, aby se vešly bankovky složené napůl (69–74 mm napříč); karty mají vůli.
   */
  sideMarginMm: number;
  /**
   * O kolik panely přečnívají nad karty – volba. Předloha ≈ 15 mm: průchodka a dřík druku
   * pak leží nad kartami, ne na nich.
   */
  topOverCardMm: number;
  /** Odsazení stehu dna od hrany a rozteč vidličky. */
  stitchOffsetMm: number;
  stitchPitchMm: number;
  /** Tloušťka kůže těla; kapsa s mincí je tenčí, aby šla tvarovat. */
  bodyThicknessMm: number;
  pocketThicknessMm: number;
  /**
   * Vnitřní panel (dělicí stěna mezi kartami a bankovkami). `true` = jako předloha (dvě kapsy),
   * `false` = jen zadní a přední panel a jedna kapsa (kratší pás, jednodušší šev dna).
   */
  innerPanel: boolean;
  /**
   * Přídavky na oba ohyby. Neutrální osa leží v polovině tloušťky kůže, půlkruh kolem obsahu
   * potřebuje π · (obsah/2 + kůže/2). `null` = spočítat, číslo = přebít oba ohyby stejně.
   */
  foldAllowanceMm: number | null;
  /**
   * Vůle pro obsah každé kapsy: odstup vrstev se zvětší o 2·foldEase/π, takže ohyb B je delší
   * o foldEase a ohyb A (obepíná obě kapsy) o 2·foldEase (předloha má pásma ohybů ≈ 11–13 mm) – volba.
   */
  foldEaseMm: number;
  /**
   * Ztenčení kůže v pásmech ohybů (skiving): na kolik mm a o kolik mm za čáry ohybu na každou
   * stranu. Ohyb B má u kůže 1,5 mm poloměr jen ≈ 3 mm a líc by mohl praskat. `null` = neztenčovat.
   */
  foldSkiveThicknessMm: number | null;
  foldSkiveMarginMm: number;
  /**
   * Který ohyb ztenčit. Ohyb B má poloměr ≈ 3 mm (protažení lícu ≈ 26 % bez ztenčení, ≈ 16 % se
   * ztenčením na 1 mm), ohyb A ≈ 5 mm (≈ 14 %) – ztenčení tam není potřeba a u výkusu by zeslabilo
   * hranu. Ohyby se neperforují (v4.9: perforace nebyly doložené na předloze).
   */
  foldSkiveBands: 'B' | 'AB';
  /** Zaoblení rohu, kde výřez na předním panelu potkává horní hranu (tam pracuje palec). */
  scoopCornerRadiusMm: number;
  /**
   * Strana jazyka při pohledu na hotové pouzdro **zepředu**. Předloha má jazyk vpravo a výřez
   * s průchodkou vlevo → `right`. V kresbě pásu je pak jazyk u levého konce (zadní panel se
   * při složení otočí).
   */
  tabSide: 'left' | 'right';
  /** Jazyk: šířka (předloha ≈ polovina šířky pouzdra), zaoblení konce (`null` = plný půlkruh). */
  tabWidthMm: number;
  tabEndRadiusMm: number | null;
  /** Vzdálenost středu druku od horní hrany předního panelu a přesah jazyka za druk – volba. */
  snapFromTopMm: number;
  tabBeyondSnapMm: number;
  /**
   * Rezerva délky jazyka na zkoušku: skutečná délka oblouku závisí na tuhosti kůže a na obsahu
   * (±3 mm), jazyk se řeže delší a zkracuje až po osazení kloboučku.
   */
  tabFitReserveMm: number;
  /**
   * Průměr kloboučku druku a rezerva kolem něj. Výchozí od v4.11 12 mm (Prym Anorak 12 mm);
   * model projde i s 13,5 mm (Stoklasa, WUK 5/6) a 15 mm (WUK 15 mm, od horní hrany zbydou jen
   * 2 mm) – rozložení se nemění, jen se zmenší odstupy kloboučku od hran.
   */
  snapDiameterMm: number;
  snapClearanceMm: number;
  /**
   * Výřez na prst: poloměr čtvrtkruhu v rohu předního panelu (a hloubka čtvrtelipsy v rohu
   * zadního, viz backScoopRxMm). V rozloženém pásu je to jeden oblouk U přes pásmo ohybu A.
   * Předloha ≈ 30–34.
   */
  scoopRadiusMm: number;
  /**
   * Volitelná průchodka na šňůrku ve vnitřním panelu (vidět výřezem). Od v4.11 je výchozí střih
   * **bez průchodky** (`false`); `true` ji vrátí se stejnou geometrií jako dřív: průměr otvoru
   * a odstup středu od horní a volné boční hrany vnitřního panelu.
   */
  grommet: boolean;
  grommetHoleMm: number;
  grommetFromEdgeMm: number;
  /** Poloměr zaoblení volných rohů pásu. */
  cornerRadiusMm: number;
  /** Průměr mince. Výchozí 27,5 mm = česká padesátikoruna (mince 40 mm z předlohy jako varianta). */
  coinDiameterMm: number;
  /**
   * Průměr okna = průměr kruhového výsečníku, který máš. `null` = odvodit z mince tak, aby
   * prstenec kůže kolem okna byl aspoň `minCoinRingMm`, zaokrouhleno na celé mm dolů.
   * Nejmenší prstenec je od v4.11 3,75 mm (dřív 4): u mince 50 Kč z něj vyjde okno Ø 20 mm
   * (rozhodnutí autora, výsečník 20 mm je běžně k dostání), u mince 40 mm dál Ø 32 (prstenec 4).
   * Že prstenec 3,75 mm minci udrží, je nutné ověřit na odřezku z tvarovací zkoušky.
   */
  windowDiameterMm: number | null;
  minCoinRingMm: number;
  /**
   * Vůle otvoru formy kolem mince obalené kůží: otvor = mince + 2·kůže kapsy + vůle. Kůže po
   * vyschnutí o 1–2 % sedne, vůle pod 1 mm může minci sevřít – volba 1,6.
   */
  formHoleClearanceMm: number;
  /** Tloušťka desky formy: musí pojmout minci i kůži a nechat důlek dosednout – volba. */
  formPlateThicknessMm: number;
  /** Rovná plocha kůže mezi patou důlku (= otvor formy) a stehem kapsy – volba. */
  pocketFlatMm: number;
  /** Kolik kůže zůstane nad mincí k horní (otevřené) hraně kapsy – volba (předloha ≈ 8–10). */
  coinTopOverlapMm: number;
  /** Poloměr horních rohů kapsy s mincí – volba. */
  pocketTopRadiusMm: number;
  /** Nejmenší odstup spodní hrany kapsy od stehu dna – volba. */
  pocketFromBottomMinMm: number;
  /** Nejmenší přijatelný můstek kůže mezi otvory a mezi otvorem a hranou. */
  minLigamentMm: number;
}

export const DEFAULT_COIN_CARD_HOLDER: CoinCardHolderSpec = {
  cardWidthMm: 54,
  cardHeightMm: 85.6,
  cardThicknessMm: 0.76,
  cardsCount: 4,
  billsThicknessMm: 2,
  cardSideClearanceMm: 1.5,
  sideMarginMm: 7.5,
  topOverCardMm: 15,
  stitchOffsetMm: 3.5,
  stitchPitchMm: 4,
  bodyThicknessMm: 1.5,
  pocketThicknessMm: 1.2,
  innerPanel: true,
  foldAllowanceMm: null,
  foldEaseMm: 2,
  foldSkiveThicknessMm: 1,
  foldSkiveMarginMm: 3,
  foldSkiveBands: 'B',
  scoopCornerRadiusMm: 2.5,
  tabSide: 'right',
  tabWidthMm: 33,
  tabEndRadiusMm: 10,
  snapFromTopMm: 9.5,
  tabBeyondSnapMm: 11,
  tabFitReserveMm: 5,
  snapDiameterMm: 12,
  snapClearanceMm: 2,
  scoopRadiusMm: 34,
  grommet: false,
  grommetHoleMm: 5,
  grommetFromEdgeMm: 9,
  cornerRadiusMm: 6,
  coinDiameterMm: 27.5,
  windowDiameterMm: null,
  minCoinRingMm: 3.75,
  formHoleClearanceMm: 1.6,
  formPlateThicknessMm: 8,
  pocketFlatMm: 2,
  coinTopOverlapMm: 5,
  pocketTopRadiusMm: 10,
  pocketFromBottomMinMm: 2.5,
  minLigamentMm: 3,
};

/**
 * Pojmenované mince pro `--coin`. Průměry českých mincí podle ČNB (technické parametry,
 * ověřeno 2026-09-18): 50 Kč 27,5 mm (bimetal), 20 Kč 26 mm (třináctihran – v kulatém okně
 * budou vidět rohy), 10 Kč 24,5 mm, 5 Kč 23 mm. Výchozí střih je pro 50 Kč. „decision“ je
 * mince z předlohy Red Forest (40 mm podle popisu produktu), stejně jako `--coin 40`.
 */
export const NAMED_COINS = {
  decision: 40,
  '50kc': 27.5,
  '20kc': 26,
  '10kc': 24.5,
  '5kc': 23,
} as const satisfies Record<string, number>;

/** List pásu: A4 na šířku (pás je přes 200 mm dlouhý), okraj a mezera mezi díly. */
export const A4_SHEET = { widthMm: 297, heightMm: 210, marginMm: 10, gapMm: 6 } as const;
/** Výška legendy pod díly, se kterou kontrola rozvržení počítá. */
export const LEGEND_HEIGHT_MM = 25;
/** Svislé mezery pravého sloupce střihu (nadpis nad dílem, popisky pod dílem). */
export const SHEET_TITLE_GAP_MM = 4;
export const SHEET_CAPTION_MM = 10;
/** List kapsy s mincí a otvoru formy: A4 na výšku. */
export const A4_PORTRAIT = { widthMm: 210, heightMm: 297, marginMm: 10 } as const;
/** Kalibrační úsečka na listu pásu: kolik mm nad legendou (její y = H − m − legenda − tato hodnota). */
export const CALIBRATION_GAP_MM = 4;
/** Popisek šva dna pod pásem: odsazení od dolní hrany pásu. */
export const SEAM_LABEL_GAP_MM = 5;
/**
 * Poloměr patice druku na rubu předního panelu, se kterým model počítá (≈ Ø 10; u Prym Anorak
 * 12 mm neuvedeno – změřit po nákupu), a přírůstek příruby průchodky nad poloměr otvoru.
 * Skutečná příruba smí mít nejvýš `snapFlangeMaxMm` z rozvržení (u výchozího střihu Ø 11 mm).
 */
export const SNAP_POST_RADIUS_MM = 5;
export const GROMMET_FLANGE_MM = 2.5;

/**
 * Odvozené rozměry. Rozložený pás se kreslí v soustavě, kde x = 0 je levý konec pásu (u jazyka),
 * y = 0 horní (otevřená) hrana a y roste dolů ke dnu; jazyk zasahuje do záporných y.
 */
export interface CoinCardHolderLayout {
  /** Šířka jednoho panelu a výška pásu. */
  panelWidthMm: number;
  panelHeightMm: number;
  /** Obsah kapes: karty (vepředu) a bankovky (vzadu). */
  cardsThicknessMm: number;
  billsThicknessMm: number;
  /** Přídavky na ohyby: A = zadní↔přední (obepíná vnitřní panel i obsah), B = přední↔vnitřní. */
  foldBackFrontMm: number;
  foldFrontInnerMm: number;
  /** Hranice panelů v soustavě pásu (zleva): zadní, ohyb A, přední, ohyb B, vnitřní. */
  backX0Mm: number;
  backX1Mm: number;
  frontX0Mm: number;
  frontX1Mm: number;
  innerX0Mm: number | null;
  innerX1Mm: number | null;
  stripLengthMm: number;
  /** Jazyk: x-rozsah u levého konce pásu, délka řezu (s rezervou) a bez rezervy, poloměr konce. */
  tabX0Mm: number;
  tabX1Mm: number;
  tabLengthMm: number;
  tabNominalLengthMm: number;
  tabEndRadiusMm: number;
  /** Oblouk jazyka přes celý obsah a kam na předním panelu dopadne jeho konec (s rezervou). */
  tabWrapMm: number;
  /**
   * Šířka hotového složeného pouzdra: panel + vnější poloměr obou ohybů (neutrální poloměr
   * ohyb/π + půl tloušťky kůže v ohybu, u ztenčeného ohybu půl ztenčené tloušťky).
   */
  foldedWidthMm: number;
  tabEndOnFrontMm: number;
  /**
   * Největší průměr příruby patice druku na rubu předního panelu, aby nesahala na karty:
   * 2 · (topOverCard − snapFromTop). U výchozího střihu 11 mm – po nákupu druku změřit.
   */
  snapFlangeMaxMm: number;
  /** Druk: klobouček na jazyku (y záporné) a patice na předním panelu. */
  snapXTabMm: number;
  snapYTabMm: number;
  snapXFrontMm: number;
  snapYFrontMm: number;
  /**
   * Výřez na prst: poloměr (hloubka a šířka na předním panelu) a x, kde oblouk U začíná a končí
   * na horní hraně. Na zadním panelu začíná oblouk přímo na hraně jazyka (plynulý přechod bez
   * schodku, jako na šabloně předlohy), proto je tam výkus širší: vodorovná poloosa backScoopRx.
   */
  scoopRadiusMm: number;
  backScoopRxMm: number;
  /** Zaoblení rohu výřezu na předním panelu u horní hrany a kde na horní hraně končí. */
  scoopCornerRadiusMm: number;
  scoopCornerEndXMm: number;
  scoopStartXMm: number;
  scoopEndXMm: number;
  /** Volitelná průchodka ve vnitřním panelu (null bez průchodky nebo bez vnitřního panelu). */
  grommetXMm: number | null;
  grommetYMm: number | null;
  /** Šev dna: y stehu a počet otvorů na jeden panel (sekají se skrz všechny vrstvy najednou). */
  bottomSeamYMm: number;
  bottomSeamHoles: number;
  /** Horní hranice pásma kapsy (pod jazykem a drukem). */
  pocketBandTopMm: number;
  /** Kolik karty odkryje výřez a jak hluboko karta sedí pod horní hranou (karta stojí na švu dna). */
  cardBelowRimMm: number;
  cardExposedMm: number;
  /** Kapsa s mincí (vlastní soustava, 0,0 = levý horní roh kapsy). */
  pocketWidthMm: number;
  pocketHeightMm: number;
  coinCentreXMm: number;
  coinCentreYMm: number;
  windowDiameterMm: number;
  coinRingMm: number;
  formHoleDiameterMm: number;
  formPlateMm: number;
  /** Poloha kapsy na předním panelu: levý horní roh od levé hrany panelu a od horní hrany. */
  pocketXMm: number;
  pocketYMm: number;
  /** Kde na kapse začíná šev (pod zaoblením horních rohů), od její horní hrany. */
  pocketSeamTopMm: number;
}

export function coinCardHolderLayout(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): CoinCardHolderLayout {
  const t = spec.bodyThicknessMm;
  const panelWidth = round(spec.cardWidthMm + 2 * spec.cardSideClearanceMm + 2 * spec.sideMarginMm);
  const panelHeight = round(spec.stitchOffsetMm + spec.cardHeightMm + spec.topOverCardMm);

  const cards = round(spec.cardsCount * spec.cardThicknessMm);
  const bills = spec.innerPanel ? spec.billsThicknessMm : 0;
  // Ohyby z potřebných odstupů neutrálních os vrstev: ohyb dlouhý L ohnutý o 180° odsune další
  // panel o 2·L/π. Každá kapsa dostane stejnou vůli g = 2·foldEase/π (ověřeno virtuálním
  // složením – dřív se vůle ohybu A spotřebovala na posun vnitřního panelu a bankovkám nezbyla).
  const g = (2 * spec.foldEaseMm) / Math.PI;
  const sepB = t + cards + g; // přední ↔ vnitřní
  const sepA = spec.innerPanel ? sepB + t + bills + g : t + cards + g; // přední ↔ zadní
  // Ztenčení z rubu posune neutrální osu každého ramene ohybu o (t − s)/2 ven: ohyb potřebuje
  // o π·(t − s)/2 víc, jinak by ztenčením přišla kapsa o vůli.
  const skiveExtra =
    spec.foldSkiveThicknessMm === null ? 0 : (Math.PI * (t - spec.foldSkiveThicknessMm)) / 2;
  const extraB = spec.foldSkiveThicknessMm === null ? 0 : skiveExtra;
  const extraA = spec.foldSkiveBands === 'AB' ? skiveExtra : 0;
  const foldB = spec.innerPanel
    ? (spec.foldAllowanceMm ?? round((Math.PI * sepB) / 2 + extraB))
    : 0;
  const foldA = spec.foldAllowanceMm ?? round((Math.PI * sepA) / 2 + extraA);

  const backX0 = 0;
  const backX1 = panelWidth;
  const frontX0 = round(backX1 + foldA);
  const frontX1 = round(frontX0 + panelWidth);
  const innerX0 = spec.innerPanel ? round(frontX1 + foldB) : null;
  const innerX1 = innerX0 === null ? null : round(innerX0 + panelWidth);
  const stripLength = innerX1 ?? frontX1;
  const outerRadius = (fold: number, skived: boolean): number =>
    fold / Math.PI + (skived ? (spec.foldSkiveThicknessMm ?? t) : t) / 2;
  const skivedA = spec.foldSkiveThicknessMm !== null && spec.foldSkiveBands === 'AB';
  const foldedWidth = round(
    panelWidth +
      outerRadius(foldA, skivedA) +
      (spec.innerPanel ? outerRadius(foldB, spec.foldSkiveThicknessMm !== null) : 0),
  );

  // Jazyk: u levého konce pásu; po složení dopadne na pravou hranu předního panelu.
  const tabX0 = 0;
  const tabX1 = spec.tabWidthMm;
  // Jazyk jde od neutrální osy zadního panelu k neutrální ose jazyka ležícího na předním panelu:
  // půlkruh o průměru = skutečný odstup zadního a předního panelu (2·ohyb A/π) + tloušťka kůže.
  // Přídavek za ztenčení ohybu A odstup panelů nezvětší (jen vrací posun neutrální osy), proto
  // se do obvodu jazyka nepočítá.
  const foldAGap = foldA - (spec.foldAllowanceMm === null ? extraA : 0);
  const tabWrap = round((Math.PI * ((2 * foldAGap) / Math.PI + t)) / 2);
  const tabNominal = round(tabWrap + spec.snapFromTopMm + spec.tabBeyondSnapMm);
  const tabLength = round(tabNominal + spec.tabFitReserveMm);
  const tabEndRadius = Math.min(spec.tabEndRadiusMm ?? spec.tabWidthMm / 2, spec.tabWidthMm / 2);
  const tabEndOnFront = round(spec.snapFromTopMm + spec.tabBeyondSnapMm + spec.tabFitReserveMm);

  const snapXTab = round(spec.tabWidthMm / 2);
  const snapYTab = round(-(tabWrap + spec.snapFromTopMm));
  const snapXFront = round(frontX1 - spec.tabWidthMm / 2);
  const snapYFront = spec.snapFromTopMm;

  // Výřez na prst: oblouk U přes pásmo ohybu A (čtvrtkruh + dno + čtvrtkruh).
  const scoop = spec.scoopRadiusMm;
  // Zadní panel: výkus od hrany jazyka k ohybu A (elipsa s poloosami backScoopRx × scoop).
  const backScoopRx = round(backX1 - spec.tabWidthMm);
  const scoopStartX = round(backX1 - backScoopRx);
  const scoopEndX = round(frontX0 + scoop);

  const hasGrommet = spec.grommet && innerX1 !== null;
  const grommetX = hasGrommet ? round(innerX1 - spec.grommetFromEdgeMm) : null;
  const grommetY = hasGrommet ? spec.grommetFromEdgeMm : null;

  const bottomSeamY = round(panelHeight - spec.stitchOffsetMm);
  const seamRun = round(panelWidth - 2 * spec.stitchOffsetMm);
  const bottomSeamHoles = Math.floor(seamRun / spec.stitchPitchMm + 1e-9) + 1;

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

  // Kapsa na předku: pod drukem a koncem jazyka, nad stehem dna, vystředěná v panelu; když je
  // třeba, posune se níž, aby její horní roh nezasahoval do oblouku výřezu v levém rohu.
  const bandTop =
    Math.max(spec.snapFromTopMm + spec.snapDiameterMm / 2, tabEndOnFront) + spec.snapClearanceMm;
  const bandBottom = bottomSeamY - spec.pocketFromBottomMinMm;
  const pocketX = round((panelWidth - pocketWidth) / 2);
  const rp = spec.pocketTopRadiusMm;
  const reach = scoop + spec.minLigamentMm + rp;
  const dx = pocketX + rp;
  const pocketYForScoop = reach > dx ? Math.sqrt(reach * reach - dx * dx) - rp : 0;
  const slack = bandBottom - bandTop - pocketHeight;
  const pocketY = round(Math.max(bandTop + Math.max(0, slack) / 2, pocketYForScoop));

  return {
    panelWidthMm: panelWidth,
    panelHeightMm: panelHeight,
    cardsThicknessMm: cards,
    billsThicknessMm: bills,
    foldBackFrontMm: foldA,
    foldFrontInnerMm: foldB,
    backX0Mm: backX0,
    backX1Mm: backX1,
    frontX0Mm: frontX0,
    frontX1Mm: frontX1,
    innerX0Mm: innerX0,
    innerX1Mm: innerX1,
    stripLengthMm: stripLength,
    tabX0Mm: tabX0,
    tabX1Mm: tabX1,
    tabLengthMm: tabLength,
    tabNominalLengthMm: tabNominal,
    tabEndRadiusMm: round(tabEndRadius),
    tabWrapMm: tabWrap,
    foldedWidthMm: foldedWidth,
    tabEndOnFrontMm: tabEndOnFront,
    snapFlangeMaxMm: round(2 * (spec.topOverCardMm - spec.snapFromTopMm)),
    snapXTabMm: snapXTab,
    snapYTabMm: snapYTab,
    snapXFrontMm: snapXFront,
    snapYFrontMm: snapYFront,
    scoopRadiusMm: scoop,
    backScoopRxMm: backScoopRx,
    scoopCornerRadiusMm: spec.scoopCornerRadiusMm,
    // Zaoblení je kružnice tečná k horní hraně a vně tečná ke kružnici výřezu.
    scoopCornerEndXMm: round(
      frontX0 + Math.sqrt(scoop * scoop + 2 * scoop * spec.scoopCornerRadiusMm),
    ),
    scoopStartXMm: scoopStartX,
    scoopEndXMm: scoopEndX,
    grommetXMm: grommetX,
    grommetYMm: grommetY,
    bottomSeamYMm: bottomSeamY,
    bottomSeamHoles,
    pocketBandTopMm: round(bandTop),
    cardBelowRimMm: spec.topOverCardMm,
    cardExposedMm: round(scoop - spec.topOverCardMm),
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
  };
}

/** Kontroly. Prázdný seznam = v pořádku. */
export function checkCoinCardHolder(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string[] {
  const p: string[] = [];
  for (const [k, v] of Object.entries(spec)) {
    if (typeof v !== 'number') continue;
    if (!Number.isFinite(v) || v < 0) p.push(`${k} musí být nezáporné číslo, je ${String(v)}.`);
  }
  if (typeof spec.grommet !== 'boolean') {
    p.push(`grommet musí být true nebo false, je ${String(spec.grommet)}.`);
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
    'scoopRadiusMm',
  ] as const) {
    if (!(spec[k] > 0)) p.push(`${k} musí být kladné.`);
  }
  if (p.length > 0) return p;

  const L = coinCardHolderLayout(spec);
  const min = spec.minLigamentMm;
  const so = spec.stitchOffsetMm;

  if (spec.topOverCardMm < 1) {
    p.push('Panely musí přečnívat nad karty aspoň 1 mm, jinak karta kouká z pouzdra.');
  }
  if (!spec.innerPanel) {
    p.push(
      'Bez vnitřního panelu by jedna boční strana zůstala otevřená (šije se jen dno) a karty by vypadly.',
    );
  }
  // Kování nad kartami: dřík druku a příruba průchodky nesmí ležet v kapse na kartách. Počítá se
  // s přírubou patice ≈ Ø 10 (SNAP_POST_RADIUS_MM); skutečná smí mít nejvýš snapFlangeMaxMm (11).
  if (spec.snapFromTopMm + SNAP_POST_RADIUS_MM > spec.topOverCardMm) {
    p.push(
      `Dřík druku sahá ${fmt(spec.snapFromTopMm + SNAP_POST_RADIUS_MM)} mm pod horní hranu, karty začínají v ${fmt(spec.topOverCardMm)} – ležel by na kartách; zvětši topOverCardMm.`,
    );
  }
  if (
    spec.grommet &&
    spec.innerPanel &&
    spec.grommetFromEdgeMm + spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM > spec.topOverCardMm
  ) {
    p.push(
      `Příruba průchodky sahá ${fmt(spec.grommetFromEdgeMm + spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM)} mm pod horní hranu, karty začínají v ${fmt(spec.topOverCardMm)} – ležela by na kartách.`,
    );
  }
  if (spec.sideMarginMm < 2) {
    p.push('sideMarginMm pod 2 mm: u ohybu by kůže na hraně praskala.');
  }
  // Výřez na prst: dost hluboký na palec, ne přes půl panelu, a nesmí sahat k druku ani k jazyku.
  const R = L.scoopRadiusMm;
  if (R < 20) {
    p.push(`Výřez na prst R${R} je mělký; předloha má ≈ 28–30 mm, pod 20 mm palec kartu nechytí.`);
  }
  if (R > L.panelHeightMm / 2) {
    p.push(`Výřez na prst R${R} je hlubší než půl výšky panelu.`);
  }
  // Přebitý přídavek na ohyb nesmí být menší, než kolik potřebuje obsah (jinak se pouzdro nezavře).
  if (spec.foldAllowanceMm !== null) {
    const t = spec.bodyThicknessMm;
    const needB = Math.PI * (L.cardsThicknessMm / 2 + t / 2);
    const needA = Math.PI * ((L.cardsThicknessMm + t + L.billsThicknessMm) / 2 + t / 2);
    if (spec.foldAllowanceMm < Math.max(needA, needB)) {
      p.push(
        `foldAllowanceMm ${fmt(spec.foldAllowanceMm)} je méně, než obsah potřebuje (ohyb A ${fmt(needA)} mm).`,
      );
    }
  }
  if (spec.foldSkiveThicknessMm !== null) {
    const body = spec.bodyThicknessMm;
    if (spec.foldSkiveThicknessMm > body - 0.3 || spec.foldSkiveThicknessMm < 0.6) {
      p.push(
        `Ztenčení ohybů na ${fmt(spec.foldSkiveThicknessMm)} mm nedává smysl (0,6 mm až o 0,3 mm méně než kůže ${fmt(body)} mm; u tenké kůže ztenčení vypni).`,
      );
    }
    if (spec.foldSkiveMarginMm > 8) {
      p.push('foldSkiveMarginMm nad 8 mm by ztenčil i plochu panelů.');
    }
  }
  if (spec.stitchPitchMm < 3) {
    p.push('stitchPitchMm je menší než 3 mm – otvory stehu by splývaly.');
  }
  // Na zadním panelu přechází hrana jazyka plynule do výkusu. Výkus tam nesmí být užší než na
  // předku (jinak by jazyk zasahoval pod výřez) a nemá být o moc širší (tvar by se rozešel).
  if (L.backScoopRxMm < R) {
    p.push(
      `Jazyk ${fmt(spec.tabWidthMm)} mm a výřez R${fmt(R)} se na zadním panelu (šířka ${fmt(L.panelWidthMm)}) nevejdou vedle sebe; zmenši scoopRadiusMm nebo tabWidthMm.`,
    );
  } else if (L.backScoopRxMm > R + 12) {
    p.push(
      `Výkus na zadním panelu (${fmt(L.backScoopRxMm)} mm) je o moc širší než na předku (R${fmt(R)}); zvětši tabWidthMm nebo scoopRadiusMm.`,
    );
  }
  if (spec.snapFromTopMm - spec.snapDiameterMm / 2 < spec.snapClearanceMm) {
    p.push('Druk na předním panelu zasahuje k horní hraně; zvětši snapFromTopMm.');
  }
  if (spec.tabWidthMm < 2 * min + spec.snapDiameterMm) {
    p.push(
      `Jazyk ${spec.tabWidthMm} mm je užší než druk s okraji (${2 * min + spec.snapDiameterMm} mm).`,
    );
  }
  if (spec.tabEndRadiusMm !== null && spec.tabEndRadiusMm > spec.tabWidthMm / 2) {
    p.push(`tabEndRadiusMm ${spec.tabEndRadiusMm} je větší než půl šířky jazyka.`);
  }
  if (spec.tabBeyondSnapMm < spec.snapDiameterMm / 2 + spec.snapClearanceMm) {
    p.push('Konec jazyka je moc blízko druku; tabBeyondSnapMm zvětši.');
  }
  if (spec.tabFitReserveMm < 3) {
    p.push('tabFitReserveMm pod 3 mm nepokryje nejistotu délky oblouku (±3 mm).');
  }
  if (spec.cornerRadiusMm > spec.sideMarginMm + spec.cardSideClearanceMm + 2) {
    p.push(`cornerRadiusMm ${spec.cornerRadiusMm} je moc velké pro okraj panelu.`);
  }
  // Průchodka: musí být celá vidět výřezem (i s kroužkem ≈ +3 mm) a nechat můstek k hranám.
  if (L.grommetXMm !== null) {
    if (spec.grommetFromEdgeMm - spec.grommetHoleMm / 2 < min) {
      p.push(
        `Průchodka je moc blízko hrany (můstek ${fmt(spec.grommetFromEdgeMm - spec.grommetHoleMm / 2)} mm, minimum ${fmt(min)}).`,
      );
    }
    const fromCorner = Math.hypot(spec.grommetFromEdgeMm, spec.grommetFromEdgeMm);
    if (fromCorner + spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM + min > R) {
      p.push(
        `Průchodka (kroužek do ${fmt(fromCorner + spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM)} mm od rohu) by výřezem R${R} nebyla celá vidět.`,
      );
    }
  }
  // Kapsa s mincí na předním panelu.
  const limit = L.bottomSeamYMm - spec.pocketFromBottomMinMm;
  const available = limit - L.pocketBandTopMm;
  if (L.pocketHeightMm > available + 1e-9) {
    p.push(
      `Kapsa s mincí (${L.pocketHeightMm} mm) se nevejde mezi jazyk a šev dna ` +
        `(k dispozici ${fmt(available)} mm). Zmenši minci nebo tabBeyondSnapMm.`,
    );
  } else if (L.pocketYMm + L.pocketHeightMm > limit + 1e-9) {
    p.push(
      `Kapsa s mincí končí ${fmt(L.pocketYMm + L.pocketHeightMm)} mm pod horní hranou, ` +
        `smí nejvýš do ${fmt(limit)}; zmenši scoopRadiusMm nebo minci.`,
    );
  }
  if (L.pocketXMm < min) {
    p.push(
      `Kapsa s mincí je od boční hrany jen ${fmt(L.pocketXMm)} mm (minimum ${min}); ` +
        'zmenši minci nebo pocketFlatMm.',
    );
  }
  if (L.windowDiameterMm >= spec.coinDiameterMm) {
    p.push(
      `Okno ${fmt(L.windowDiameterMm)} mm musí být menší než mince ${fmt(spec.coinDiameterMm)} mm.`,
    );
  } else if (L.coinRingMm < spec.minCoinRingMm) {
    p.push(
      `Prstenec kolem okna je ${fmt(L.coinRingMm)} mm, minimum ${fmt(spec.minCoinRingMm)} mm – minci by neudržel.`,
    );
  }
  if (L.windowDiameterMm < 10) {
    p.push(`Okno ${L.windowDiameterMm} mm je moc malé, z mince by nebylo nic vidět.`);
  }
  if (spec.pocketTopRadiusMm < so) {
    p.push('pocketTopRadiusMm musí být aspoň stitchOffsetMm, jinak šev začíná v oblouku.');
  }
  // List pásu (A4 na šířku): jazyk + pás + popisek šva musí skončit nad kalibrační úsečkou.
  const { heightMm: H, widthMm: W, marginMm: m } = A4_SHEET;
  const calY = H - m - LEGEND_HEIGHT_MM - CALIBRATION_GAP_MM;
  const stripBottom = m + L.tabLengthMm + L.panelHeightMm + SEAM_LABEL_GAP_MM + 1;
  if (stripBottom > calY - 3) {
    p.push(
      `Pás s jazykem končí v ${fmt(stripBottom)} mm, kalibrační úsečka je v ${fmt(calY)} – na A4 na šířku se nevejde.`,
    );
  }
  if (L.stripLengthMm + 2 * m > W) {
    p.push(`Pás ${fmt(L.stripLengthMm)} mm se nevejde na šířku A4 (${W} mm).`);
  }
  // List kapsy (A4 na výšku): kapsa, pod ní otvor formy, popisky.
  const pocketColumn =
    SHEET_TITLE_GAP_MM +
    L.pocketHeightMm +
    SHEET_CAPTION_MM +
    A4_SHEET.gapMm +
    SHEET_TITLE_GAP_MM +
    L.formHoleDiameterMm +
    SHEET_CAPTION_MM;
  if (pocketColumn > A4_PORTRAIT.heightMm - 2 * A4_PORTRAIT.marginMm - LEGEND_HEIGHT_MM) {
    p.push(`Kapsa a forma (${fmt(pocketColumn)} mm) se nevejdou na A4 na výšku.`);
  }
  return p;
}

/**
 * Ztenčení ohybu pro danou tloušťku kůže těla: výchozí 1 mm, ale jen když z kůže ubere aspoň
 * 0,3 mm (tenčí kůže se ohne i bez něj); jinak null = neztenčovat.
 */
export function foldSkiveFor(bodyThicknessMm: number): number | null {
  const s = DEFAULT_COIN_CARD_HOLDER.foldSkiveThicknessMm;
  return s !== null && Math.round((bodyThicknessMm - s) * 1000) >= 300 ? s : null;
}

export function assertCoinCardHolder(spec: CoinCardHolderSpec): void {
  const problems = checkCoinCardHolder(spec);
  if (problems.length > 0) {
    throw new Error(`Neplatný střih pouzdra s mincí:\n- ${problems.join('\n- ')}`);
  }
}

/** Číslo s desetinnou čárkou pro hlášky kontrol. */
function fmt(v: number): string {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
