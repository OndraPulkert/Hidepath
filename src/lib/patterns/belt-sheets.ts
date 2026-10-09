/**
 * Tiskové listy opasku 1:1 na A4 (konec u přezky a konec s dírkami) do SVG. Čistý kód bez
 * Node API: používá ho generátor `scripts/belt-buckle-end.ts` (soubory v docs/generated)
 * i aplikace, která listy vygeneruje v prohlížeči pro zvolenou šířku, tloušťku, konec a dírky
 * (`src/lib/patterns/belt-config.ts`). Geometrie a kontroly jsou v src/lib/geometry/belt-end.ts;
 * tady se jen kreslí.
 *
 * Výchozí list 2 (hrot, 5 dírek) se kreslí přesně jako dřív – soubory pro 35 a 40 mm hlídá
 * `scripts/generator-golden.test.ts`. Zaoblený konec a list na šířku jsou doplněk.
 */
import {
  type BeltEndSpec,
  type BeltTipShape,
  type BeltTipSpec,
  adjustmentRangeMm,
  apexToMiddleHoleMm,
  holeOffsetsFromApexMm,
  keeperBendAllowanceMm,
  keeperGapMm,
  keeperPocketClearMm,
  keeperStripLengthMm,
  keeperWrapPerimeterMm,
  ligamentMm,
  middleHoleIndex,
  tipLengthMm,
  tipTangentPoint,
} from '../geometry/belt-end';

/* ------------------------------ kreslicí pomůcky ------------------------------ */

export const INK = '#2b2b2b';
export const RED = '#c0392b';
export const GREEN = '#1f6f43';
export const GREY = '#6a6a6a';

export const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
export const cz = (n: number): string => f(n).replace('.', ',');

const text = (
  x: number,
  y: number,
  s: string,
  size = 3.2,
  color = INK,
  anchor: 'start' | 'end' | 'middle' = 'start',
): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}" ` +
  `fill="${color}" text-anchor="${anchor}">${s}</text>`;

const cross = (cx: number, cy: number, r: number, color = INK): string =>
  `<path d="M${f(cx - r * 1.3)} ${f(cy)} H${f(cx + r * 1.3)} M${f(cx)} ${f(cy - r * 1.3)} V${f(cy + r * 1.3)}" stroke="${color}" stroke-width="0.2" fill="none"/>`;

const hole = (cx: number, cy: number, d: number, color = INK, sw = 0.3): string =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d / 2)}" fill="none" stroke="${color}" stroke-width="${f(sw)}"/>` +
  cross(cx, cy, d / 2, color);

const centreLine = (cx: number, y1: number, y2: number): string =>
  `<line x1="${f(cx)}" y1="${f(y1)}" x2="${f(cx)}" y2="${f(y2)}" stroke="#b8b8b8" stroke-width="0.1" stroke-dasharray="3 3"/>`;

function dimension(x: number, y1: number, y2: number, color = GREEN): string {
  return (
    `<line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}" stroke="${color}" stroke-width="0.3"/>` +
    [y1, y2]
      .map(
        (y) =>
          `<line x1="${f(x - 2)}" y1="${f(y)}" x2="${f(x + 2)}" y2="${f(y)}" stroke="${color}" stroke-width="0.3"/>`,
      )
      .join('')
  );
}

function calibration(x: number, y: number): string[] {
  return [
    text(x, y - 6, 'KALIBRAČNÍ ČTVEREC', 3, RED),
    text(x, y - 2, 'po vytištění přeměřte 50 × 50 mm', 3, RED),
    `<rect x="${f(x)}" y="${f(y)}" width="50" height="50" fill="none" stroke="${RED}" stroke-width="0.4"/>`,
  ];
}

function notes(x: number, y0: number, lines: string[]): string[] {
  return lines.map((l, i) => text(x, y0 + i * 4.2, l, 3));
}

/* -------------------------- strana 1: konec u přezky -------------------------- */

/**
 * Kroužky ohybu na listu 1: Ø jako značky ohybu na destičce (2 mm), střed 2 mm od hrany pásu,
 * aby kroužek celý zůstal na vystřiženém listu. Leží na čáře ohybu (`foldY`), ta je z modelu.
 */
const BEND_PRICK_MM = 2;
const BEND_PRICK_INSET_MM = 2;

function buckleEndPage(spec: BeltEndSpec): string[] {
  const strapX = 22;
  const w = spec.beltWidthMm;
  const r = w / 2;
  const cx = strapX + r;
  const foldY = 132;
  const topY = foldY - spec.bodyShownMm;
  const endY = foldY + spec.tailLengthMm;
  const textX = strapX + w + 14;
  const [near, far] = spec.rivetOffsetsMm;
  const out: string[] = [];

  out.push(text(strapX, 16, `Opasek ${cz(w)} mm — strana 1: konec u přezky`, 4.6));
  out.push(
    text(
      strapX,
      22,
      'Měřítko 1:1 · tisk na A4 na 100 %, bez „přizpůsobit stránce“ · 4 otvory = 2 nýty',
      3,
      GREY,
    ),
  );
  out.push(...calibration(150, 30));

  // Obrys: nahoře otevřený, dole rovný konec.
  // Rovný, ne zaoblený: kupovaný pás má konec už seříznutý na kolmo, zaoblovat
  // skrytý konec je práce navíc – a destička (`--multi`) používá právě tuhle rovnou
  // hranu jako referenci. CraftPoint má konec také rovný (ověřeno měřením jejich PDF).
  out.push(
    `<path d="M${f(strapX)} ${f(topY)} L${f(strapX)} ${f(endY)} ` +
      `L${f(strapX + w)} ${f(endY)} L${f(strapX + w)} ${f(topY)}" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  out.push(centreLine(cx, topY, endY));
  out.push(
    `<line x1="${f(strapX - 6)}" y1="${f(foldY)}" x2="${f(strapX + w + 6)}" y2="${f(foldY)}" ` +
      `stroke="${RED}" stroke-width="0.4" stroke-dasharray="4 2.5"/>`,
  );
  // Značky ohybu k propíchnutí: na čáře ohybu u obou hran pásu. List se stříhá po obrysu,
  // značka přímo na hraně by se odstřihla (a čárkovaná čára tam může mít mezeru).
  for (const x of [strapX + BEND_PRICK_INSET_MM, strapX + w - BEND_PRICK_INSET_MM]) {
    out.push(hole(x, foldY, BEND_PRICK_MM, RED));
  }

  // Drážka pro trn: stadion půlený ohybem.
  const half = spec.slotLengthMm / 2;
  const sr = spec.slotWidthMm / 2;
  out.push(
    `<path d="M${f(cx - sr)} ${f(foldY - half + sr)} A${f(sr)} ${f(sr)} 0 0 1 ${f(cx + sr)} ${f(foldY - half + sr)} ` +
      `L${f(cx + sr)} ${f(foldY + half - sr)} A${f(sr)} ${f(sr)} 0 0 1 ${f(cx - sr)} ${f(foldY + half - sr)} Z" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  for (const sign of [-1, 1]) out.push(cross(cx, foldY + sign * (half - sr), sr));

  // Čtyři otvory pro nýty. Propichuje se jen první dvojice (u konce pásu, pod ohybem): druhá
  // se značí až po ohnutí skrz vyseknutou první, proto je šedá, čárkovaná a bez křížku.
  for (const off of spec.rivetOffsetsMm) {
    out.push(hole(cx, foldY + off, spec.rivetHoleMm));
    out.push(
      `<circle cx="${f(cx)}" cy="${f(foldY - off)}" r="${f(spec.rivetHoleMm / 2)}" fill="none" ` +
        `stroke="${GREY}" stroke-width="0.3" stroke-dasharray="1 0.8"/>`,
    );
  }

  out.push(dimension(strapX + w + 4, foldY + near, foldY + far));

  const callouts: [number, string, string][] = [
    [foldY - far, `nýt ± ${cz(far)} mm od ohybu`, INK],
    [foldY - near, `nýt ± ${cz(near)} mm od ohybu`, INK],
    [
      foldY - near + 9.5,
      `drážka ${cz(spec.slotLengthMm)} × ${cz(spec.slotWidthMm)} mm, ohyb ji půlí`,
      INK,
    ],
    [foldY, 'OHYB (příčka přezky) · propíchněte oba kroužky', RED],
    [foldY + near - 9.5, `můstek u drážky ${cz(Math.round(ligamentMm(spec) * 10) / 10)} mm`, GREEN],
    [
      foldY + (near + far) / 2,
      `kapsa pro poutko ${cz(keeperGapMm(spec))} mm (světlá ${cz(keeperPocketClearMm(spec))} mm)`,
      GREEN,
    ],
    [endY, `konec pásu ${cz(spec.tailLengthMm)} mm od ohybu`, INK],
  ];
  for (const [y, s, color] of callouts) out.push(text(textX, y + 1, s, 3.2, color));
  out.push(
    text(
      textX,
      foldY - (near + far) / 2 + 1,
      'šedé: 2. dvojice, značí se až skrz 1. dvojici',
      3,
      GREY,
    ),
  );
  out.push(text(strapX, topY - 3, 'sem pokračuje hlavní pás (nahoře neřezat)', 3, GREY));

  // Poutko.
  const keeperY = 232;
  const len = keeperStripLengthMm(spec);
  out.push(
    text(
      strapX,
      keeperY - 4,
      `Poutko — pásek ${len} × ${spec.keeperWidthMm} mm, obepíná 3 vrstvy: přehnutý konec, pás pod ním a volný konec pásku`,
      3,
    ),
  );
  out.push(
    text(
      strapX,
      keeperY + spec.keeperWidthMm + 10,
      `obvod 3 vrstev ${cz(Math.round(keeperWrapPerimeterMm(spec) * 10) / 10)} mm + ${cz(Math.round(keeperBendAllowanceMm(spec) * 10) / 10)} mm na tloušťku poutka ${cz(spec.keeperThicknessMm)} mm + ${spec.keeperOverlapMm} mm přeplátování`,
      3,
    ),
  );
  // Přeplátování: šrafy na obou koncích (vlevo líc, vpravo rub). Hranice šraf se na kůži
  // neznačí: zbytek poutka se přelepí páskou a zdrsní a natře se jen volných 15 mm.
  const ov = spec.keeperOverlapMm;
  for (const x0 of [strapX, strapX + len - ov]) {
    let d = '';
    for (let k = 0; k <= ov + spec.keeperWidthMm; k += 2.5) {
      const xa = x0 + Math.max(0, k - spec.keeperWidthMm);
      const xb = x0 + Math.min(k, ov);
      const ya = keeperY + Math.min(k, spec.keeperWidthMm);
      const yb = keeperY + Math.max(0, k - ov);
      d += `M${f(xa)} ${f(ya)} L${f(xb)} ${f(yb)} `;
    }
    out.push(`<path d="${d.trim()}" stroke="${GREY}" stroke-width="0.2" fill="none"/>`);
  }
  out.push(
    `<rect x="${f(strapX)}" y="${f(keeperY)}" width="${f(len)}" height="${f(spec.keeperWidthMm)}" fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  out.push(text(strapX + len + 3, keeperY + 5, `šrafy: přeplátování ${ov} mm`, 2.8, GREY));
  out.push(text(strapX + len + 3, keeperY + 9.5, 'vlevo na líci, vpravo na rubu', 2.8, GREY));
  for (let mm = 0; mm <= len; mm += 10) {
    out.push(
      `<line x1="${f(strapX + mm)}" y1="${f(keeperY + spec.keeperWidthMm)}" x2="${f(strapX + mm)}" y2="${f(keeperY + spec.keeperWidthMm + 2)}" stroke="#7a7a7a" stroke-width="0.2"/>`,
    );
    out.push(
      `<text x="${f(strapX + mm)}" y="${f(keeperY + spec.keeperWidthMm + 5.2)}" font-family="Helvetica, Arial, sans-serif" font-size="2.6" fill="#7a7a7a" text-anchor="middle">${mm}</text>`,
    );
  }

  out.push(
    ...notes(strapX, 258, [
      '1. Na rub pásu propíchněte 2 černé otvory u konce, oba křížky drážky a 2 červené kroužky ohybu.',
      `2. Vysekněte Ø ${cz(spec.rivetHoleMm)} mm oba otvory a konce drážky, boky drážky řízněte nožem.`,
      '   Kroužky ohybu nesekejte: spojte je na rubu pravítkem, to je čára ohybu.',
      '3. Navlékněte poutko na pás, ohněte konec kolem příčky přezky a poutko posuňte přes přehnutý konec.',
      '4. Šedé otvory nepropichujte: označte je skrz vyseknuté, vysekněte, poutko vraťte mezi ně a sešroubujte nýty.',
      'Poutko: mimo šrafy přelepte páskou, šrafy zdrsněte (vlevo líc, vpravo rub), lepidlo jen do šraf. Nýty: 2, proto 4 otvory.',
      'Rozměry z šablony Black Flag Leather Goods (jeden zdroj, ať se nemíchají rozteče).',
      'Délka poutka je spočítaná, ne ověřená — ověřte na odřezku.',
    ]),
  );
  return out;
}

/* --------------------------- strana 2: konec s dírkami --------------------------- */

/** „2 dírky“, „1 dírka“, „5 dírek“. */
function holesWord(n: number): string {
  if (n === 1) return '1 dírka';
  if (n >= 2 && n <= 4) return `${n} dírky`;
  return `${n} dírek`;
}

/** Poloha listu 2 na výšku: vrchol 45 mm od horní hrany, pás končí 12 mm za poslední dírkou. */
const PORTRAIT_APEX_Y = 45;
const STRAP_PAST_LAST_HOLE_MM = 12;
/** Poznámky pod pásem: 8 řádků po 4,2 mm, první 10 mm pod koncem pásu. */
const TIP_NOTES_LINES = 8;
const LINE_MM = 4.2;
/** Nejnižší účaří textu na A4, které ještě vytiskne běžná tiskárna (okraj ~5 mm). */
const PORTRAIT_LAST_BASELINE_MM = 292;
/** List na šířku: levý okraj, kde začíná pás, a nejpravější místo pro vrchol. */
const LANDSCAPE_LEFT_MM = 15;
const LANDSCAPE_APEX_MAX_MM = 285;
/** Osa pásu na listu na šířku: pás 45 mm končí 3 mm nad popisem kalibračního čtverce. */
const LANDSCAPE_AXIS_Y_MM = 112;
/** Nejmenší svislá mezera mezi popisem rozteče a popisem prostřední dírky (list na výšku). */
const SPACING_LABEL_CLEARANCE_MM = 6;

/**
 * Délka od vrcholu k poslední dírce, kterou list 2 na výšku ještě pojme i s poznámkami
 * (výchozích 5 dírek: 194,3 mm).
 */
export const TIP_PORTRAIT_MAX_REACH_MM =
  PORTRAIT_LAST_BASELINE_MM -
  (TIP_NOTES_LINES - 1) * LINE_MM -
  10 -
  STRAP_PAST_LAST_HOLE_MM -
  PORTRAIT_APEX_Y;

/** Totéž pro list na šířku (pás vodorovně, poznámky pod ním). */
export const TIP_LANDSCAPE_MAX_REACH_MM =
  LANDSCAPE_APEX_MAX_MM - LANDSCAPE_LEFT_MM - STRAP_PAST_LAST_HOLE_MM;

/**
 * Jak se list 2 vejde na A4: na výšku, na šířku, na dva listy na šířku (`split`: 2a konec
 * a dírky k prostřední, 2b prostřední a zbylé dírky), nebo vůbec. V mezích formuláře
 * (nejvýš 7 dírek po 50 mm, odstup nejvýš 100 mm) vyjde vždy aspoň `split`.
 */
export function tipSheetOrientation(tip: BeltTipSpec): 'portrait' | 'landscape' | 'split' | null {
  const offsets = holeOffsetsFromApexMm(tip);
  const reach = offsets[offsets.length - 1] ?? 0;
  if (reach <= TIP_PORTRAIT_MAX_REACH_MM + 1e-9) return 'portrait';
  if (reach <= TIP_LANDSCAPE_MAX_REACH_MM + 1e-9) return 'landscape';
  const mid = offsets[middleHoleIndex(tip)] ?? 0;
  const restLen = reach - mid + 2 * STRAP_PAST_LAST_HOLE_MM;
  if (
    mid <= TIP_LANDSCAPE_MAX_REACH_MM + 1e-9 &&
    restLen <= LANDSCAPE_APEX_MAX_MM - LANDSCAPE_LEFT_MM + 1e-9
  ) {
    return 'split';
  }
  return null;
}

/** Obrys konce v souřadnicích listu na výšku: vrchol nahoře, pás pokračuje dolů. */
function tipOutlinePath(
  tip: BeltTipSpec,
  shape: BeltTipShape,
  strapX: number,
  apexY: number,
  strapEndY: number,
): string {
  const w = tip.beltWidthMm;
  const cx = strapX + w / 2;
  if (shape === 'round') {
    // Půlkruh r = w/2 tečný k oběma bokům: boky končí na výšce středu oblouku.
    const r = w / 2;
    return (
      `<path d="M${f(strapX)} ${f(strapEndY)} L${f(strapX)} ${f(apexY + r)} ` +
      `A${f(r)} ${f(r)} 0 0 1 ${f(strapX + w)} ${f(apexY + r)} ` +
      `L${f(strapX + w)} ${f(strapEndY)}" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`
    );
  }
  // Vrchol je zaoblený obloukem r; boky jsou na oblouk tečné (viz tipTangentPoint).
  const baseY = apexY + tipLengthMm(tip);
  const tan = tipTangentPoint(tip);
  const r = tip.noseRadiusMm;
  const tanY = apexY + tan.fromApexMm;
  return (
    `<path d="M${f(strapX)} ${f(strapEndY)} L${f(strapX)} ${f(baseY)} ` +
    `L${f(cx - tan.halfWidthMm)} ${f(tanY)} ` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(cx + tan.halfWidthMm)} ${f(tanY)} ` +
    `L${f(strapX + w)} ${f(baseY)} L${f(strapX + w)} ${f(strapEndY)}" ` +
    `fill="none" stroke="${INK}" stroke-width="0.3"/>`
  );
}

/** Popis tvaru konce do poznámek. */
function shapeNote(tip: BeltTipSpec, shape: BeltTipShape): string {
  return shape === 'round'
    ? `Konec je půlkruh r = ${cz(tip.beltWidthMm / 2)} mm (polovina šířky), na boky tečný.`
    : `Vrchol je oblouk r = ${cz(tip.noseRadiusMm)} mm, boky jsou na něj tečné — odměřeno z PDF CraftPoint, ne ostrý hrot.`;
}

/** Odkud se měří dírky: u hrotu „od hrotu“ (výchozí listy beze změny), u zaobleného „od konce“. */
const fromEnd = (shape: BeltTipShape): string => (shape === 'round' ? 'od konce' : 'od hrotu');

function tipNotes(tip: BeltTipSpec, end: BeltEndSpec, shape: BeltTipShape): string[] {
  const total = apexToMiddleHoleMm(tip) + end.tailLengthMm;
  return [
    `Dírky Ø ${cz(tip.holeDiameterMm)} mm, ${tip.holeCount} ${tip.holeCount >= 2 && tip.holeCount <= 4 ? 'kusy' : 'kusů'}, rozteč ${cz(tip.holeSpacingMm)} mm.`,
    shapeNote(tip, shape),
    `CELKOVÁ DÉLKA PÁSU = naměřený obvod + ${cz(total)} mm`,
    `   (${cz(end.tailLengthMm)} mm přehnutý konec u přezky + ${cz(apexToMiddleHoleMm(tip))} mm ${fromEnd(shape)} k prostřední dírce)`,
    'Obvod měřte na stávajícím opasku od ohybu u přezky k dírce, kterou nosíte.',
    'Bez opasku: krejčovský metr provlékněte poutky kalhot a utáhněte na pohodlí.',
    shape === 'round'
      ? 'Dírky vysekněte až po zkoušce na těle. Zaoblený konec uřízněte jako poslední.'
      : 'Dírky vysekněte až po zkoušce na těle. Špičku uřízněte jako poslední.',
    shape === 'round'
      ? 'Rozteč a odstup dírek jako u hrotu (CraftPoint); tvar konce zkuste nejdřív na odřezku.'
      : 'Rozvržení odměřeno z PDF generátoru CraftPoint; shodné pro obvod 85 i 95 cm.',
  ];
}

function tipPage(tip: BeltTipSpec, end: BeltEndSpec, shape: BeltTipShape = 'point'): string[] {
  const strapX = 22;
  const w = tip.beltWidthMm;
  const cx = strapX + w / 2;
  const apexY = PORTRAIT_APEX_Y;
  const tipLen = tipLengthMm(tip);
  const offsets = holeOffsetsFromApexMm(tip);
  const lastY = apexY + offsets[offsets.length - 1]!;
  const strapEndY = lastY + STRAP_PAST_LAST_HOLE_MM;
  const textX = strapX + w + 14;
  const mid = middleHoleIndex(tip);
  const midY = apexY + offsets[mid]!;
  const out: string[] = [];

  out.push(
    text(
      strapX,
      16,
      `Opasek ${cz(w)} mm — strana 2: ${shape === 'round' ? 'zaoblený konec' : 'konec se špičkou'}`,
      4.6,
    ),
  );
  out.push(
    text(
      strapX,
      22,
      'Měřítko 1:1 · tisk na A4 na 100 % · rozvržení nezávisí na obvodu pasu',
      3,
      GREY,
    ),
  );
  out.push(...calibration(150, 30));

  // Obrys konce, dole otevřený.
  out.push(tipOutlinePath(tip, shape, strapX, apexY, strapEndY));
  out.push(centreLine(cx, apexY, strapEndY));

  offsets.forEach((off, i) => {
    const y = apexY + off;
    const isMid = i === mid;
    out.push(hole(cx, y, tip.holeDiameterMm, isMid ? RED : INK, isMid ? 0.5 : 0.3));
  });

  // Kóty.
  out.push(dimension(strapX - 6, apexY, apexY + offsets[0]!, GREEN));
  // Popis kóty svisle podél ní: zarovnaný doprava na x = 13 začínal na 1,4 mm a tiskárna
  // (nepotisknutelný okraj 3–6 mm) ho ořízla. Otočený zabere jen x ≈ 10–13,6 mm.
  {
    const lx = strapX - 9;
    const ly = (2 * apexY + offsets[0]!) / 2;
    out.push(
      `<text x="${f(lx)}" y="${f(ly)}" transform="rotate(-90 ${f(lx)} ${f(ly)})" ` +
        `font-family="Helvetica, Arial, sans-serif" font-size="3" fill="${GREEN}" text-anchor="middle">${cz(offsets[0]!)} mm</text>`,
    );
  }
  if (offsets.length > 1) {
    out.push(dimension(strapX + w + 4, apexY + offsets[0]!, apexY + offsets[1]!, GREEN));
  }

  if (shape === 'round') {
    out.push(text(textX, apexY + 4, `konec zaoblený r = ${cz(w / 2)} mm`, 3.2, RED));
  } else {
    out.push(text(textX, apexY + tipLen / 2, `hrot ${cz(Math.round(tipLen * 10) / 10)} mm`, 3.2));
    out.push(
      text(
        textX,
        apexY + 4,
        `vrchol zaoblený r = ${cz(tip.noseRadiusMm)} mm (není ostrý hrot)`,
        3.2,
        RED,
      ),
    );
  }
  if (offsets.length > 1) {
    // Mezi první a druhou dírkou; když by se srazil s popisem prostřední dírky (3 dírky
    // s malou roztečí), jde nad první dírku. Výchozí listy se nemění.
    const between = apexY + (offsets[0]! + offsets[1]!) / 2;
    const clash = midY - 3 - between < SPACING_LABEL_CLEARANCE_MM;
    out.push(
      text(
        textX,
        clash ? apexY + offsets[0]! - 3 : between,
        `rozteč ${cz(tip.holeSpacingMm)} mm`,
        3.2,
        GREEN,
      ),
    );
  }
  out.push(text(textX, midY - 3, 'PROSTŘEDNÍ DÍRKA = vaše míra', 3.4, RED));
  out.push(text(textX, midY + 2, `${cz(apexToMiddleHoleMm(tip))} mm ${fromEnd(shape)}`, 3, RED));
  out.push(
    text(
      textX,
      midY + 6.5,
      `nastavení ± ${cz(adjustmentRangeMm(tip))} mm (${holesWord(mid)} sem i tam)`,
      3,
      RED,
    ),
  );
  out.push(
    text(
      textX,
      lastY + 1,
      `poslední dírka ${cz(offsets[offsets.length - 1]!)} mm ${fromEnd(shape)}`,
      3,
    ),
  );
  out.push(text(strapX, strapEndY + 5, 'sem pokračuje hlavní pás (dole neřezat)', 3, GREY));

  out.push(...notes(strapX, strapEndY + 10, tipNotes(tip, end, shape)));
  return out;
}

/** Vodorovná kóta (list na šířku). */
function dimensionH(y: number, x1: number, x2: number, color = GREEN): string {
  return (
    `<line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}" stroke="${color}" stroke-width="0.3"/>` +
    [x1, x2]
      .map(
        (x) =>
          `<line x1="${f(x)}" y1="${f(y - 2)}" x2="${f(x)}" y2="${f(y + 2)}" stroke="${color}" stroke-width="0.3"/>`,
      )
      .join('')
  );
}

/**
 * List 2 na šířku, když se dírky na výšku nevejdou (např. 7 dírek: pás by končil za spodní
 * hranou A4). Geometrie je stejná jako na výšku, jen otočená o 90° kolem vrcholu: vrchol
 * vpravo, pás pokračuje doleva. Text se neotáčí.
 */
function tipPageLandscape(tip: BeltTipSpec, end: BeltEndSpec, shape: BeltTipShape): string[] {
  const w = tip.beltWidthMm;
  const half = w / 2;
  const offsets = holeOffsetsFromApexMm(tip);
  const reach = offsets[offsets.length - 1]!;
  const strapLen = reach + STRAP_PAST_LAST_HOLE_MM;
  const apexX = LANDSCAPE_LEFT_MM + strapLen;
  // Pod záhlavím s místem pro kóty a popisy nad pásem; poznámky a kalibrace pod ním.
  const cy = LANDSCAPE_AXIS_Y_MM;
  const top = cy - half;
  const bottom = cy + half;
  const mid = middleHoleIndex(tip);
  const xOf = (fromApex: number): number => apexX - fromApex;
  const out: string[] = [];

  out.push(
    text(
      LANDSCAPE_LEFT_MM,
      16,
      `Opasek ${cz(w)} mm — strana 2: ${shape === 'round' ? 'zaoblený konec' : 'konec se špičkou'}`,
      4.6,
    ),
  );
  out.push(
    text(
      LANDSCAPE_LEFT_MM,
      22,
      'Měřítko 1:1 · tisk na A4 na šířku na 100 % · rozvržení nezávisí na obvodu pasu',
      3,
      GREY,
    ),
  );
  // Vpravo dole: nahoře by se srazil s popisem tvaru konce nad širokým pásem.
  out.push(...calibration(232, 150));

  // Geometrie v souřadnicích listu na výšku (vrchol v počátku, pás ve směru +y), otočená.
  const local: string[] = [];
  local.push(tipOutlinePath(tip, shape, -half, 0, strapLen));
  local.push(centreLine(0, 0, strapLen));
  offsets.forEach((off, i) => {
    const isMid = i === mid;
    local.push(hole(0, off, tip.holeDiameterMm, isMid ? RED : INK, isMid ? 0.5 : 0.3));
  });
  out.push(`<g transform="translate(${f(apexX)} ${f(cy)}) rotate(90)">`, ...local, '</g>');

  // Kóty nad pásem: vrchol → první dírka, a rozteč mezi dvěma posledními dírkami.
  const dimY = top - 6;
  out.push(dimensionH(dimY, xOf(offsets[0]!), apexX));
  out.push(
    text((xOf(offsets[0]!) + apexX) / 2, dimY - 2, `${cz(offsets[0]!)} mm`, 3, GREEN, 'middle'),
  );
  if (offsets.length > 1) {
    const a = offsets[offsets.length - 1]!;
    const b = offsets[offsets.length - 2]!;
    out.push(dimensionH(dimY, xOf(a), xOf(b)));
    out.push(
      text(
        (xOf(a) + xOf(b)) / 2,
        dimY - 2,
        `rozteč ${cz(tip.holeSpacingMm)} mm`,
        3,
        GREEN,
        'middle',
      ),
    );
  }
  const shapeLabel =
    shape === 'round'
      ? `konec zaoblený r = ${cz(half)} mm`
      : `hrot ${cz(Math.round(tipLengthMm(tip) * 10) / 10)} mm · vrchol r = ${cz(tip.noseRadiusMm)} mm`;
  out.push(text(apexX, top - 14, shapeLabel, 3.2, RED, 'end'));
  out.push(text(LANDSCAPE_LEFT_MM, top - 14, 'sem pokračuje hlavní pás (vlevo neřezat)', 3, GREY));

  // Pod pásem: prostřední dírka.
  const midX = xOf(offsets[mid]!);
  out.push(text(midX, bottom + 7, 'PROSTŘEDNÍ DÍRKA = vaše míra', 3.4, RED, 'middle'));
  out.push(
    text(
      midX,
      bottom + 11.5,
      `${cz(apexToMiddleHoleMm(tip))} mm od konce · nastavení ± ${cz(adjustmentRangeMm(tip))} mm (${holesWord(mid)} sem i tam)`,
      3,
      RED,
      'middle',
    ),
  );

  out.push(
    ...notes(LANDSCAPE_LEFT_MM, 160, [
      ...tipNotes(tip, end, shape).slice(0, 7),
      `Poslední dírka ${cz(reach)} mm od konce. List je na šířku, protože se dírky na výšku nevejdou.`,
    ]),
  );
  return out;
}

/**
 * List 2 na dvou listech A4 na šířku, když se dírky nevejdou ani na jeden list na šířku.
 * 2a: konec a dírky k prostřední; 2b: prostřední a zbylé dírky. Prostřední dírka je na obou
 * listech, takže se každý přikládá zvlášť propíchnutou prostřední dírkou na značku; listy se
 * neslepují. Geometrie a poloha pásu jsou jako u listu na šířku (`tipPageLandscape`).
 */
function tipPageSplit(
  tip: BeltTipSpec,
  end: BeltEndSpec,
  shape: BeltTipShape,
  part: 'a' | 'b',
): string[] {
  const w = tip.beltWidthMm;
  const half = w / 2;
  const offsets = holeOffsetsFromApexMm(tip);
  const mid = middleHoleIndex(tip);
  const midOff = offsets[mid]!;
  const lastOff = offsets[offsets.length - 1]!;
  // Úsek pásu na listu (od vrcholu): 2a od vrcholu, 2b od 12 mm před prostřední dírkou.
  const from = part === 'a' ? 0 : midOff - STRAP_PAST_LAST_HOLE_MM;
  const to = (part === 'a' ? midOff : lastOff) + STRAP_PAST_LAST_HOLE_MM;
  // Pás začíná vlevo na LANDSCAPE_LEFT_MM; vrchol (u 2b mimo list) je vpravo.
  const apexX = LANDSCAPE_LEFT_MM + to;
  const cy = LANDSCAPE_AXIS_Y_MM;
  const top = cy - half;
  const bottom = cy + half;
  const xOf = (fromApex: number): number => apexX - fromApex;
  const shown = offsets
    .map((off, i) => ({ off, i }))
    .filter(({ i }) => (part === 'a' ? i <= mid : i >= mid));
  const out: string[] = [];

  const endName = shape === 'round' ? 'zaoblený konec' : 'konec se špičkou';
  out.push(
    text(
      LANDSCAPE_LEFT_MM,
      16,
      part === 'a'
        ? `Opasek ${cz(w)} mm — strana 2a: ${endName} a dírky k prostřední`
        : `Opasek ${cz(w)} mm — strana 2b: prostřední a zbylé dírky`,
      4.6,
    ),
  );
  out.push(
    text(
      LANDSCAPE_LEFT_MM,
      22,
      'Měřítko 1:1 · tisk na A4 na šířku na 100 % · list 2 je na dvou listech, 2a a 2b',
      3,
      GREY,
    ),
  );
  out.push(...calibration(232, 150));

  const local: string[] = [];
  if (part === 'a') {
    local.push(tipOutlinePath(tip, shape, -half, 0, to));
  } else {
    local.push(
      `<path d="M${f(-half)} ${f(from)} L${f(-half)} ${f(to)} M${f(half)} ${f(from)} L${f(half)} ${f(to)}" ` +
        `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
    );
  }
  local.push(centreLine(0, from, to));
  for (const { off, i } of shown) {
    const isMid = i === mid;
    local.push(hole(0, off, tip.holeDiameterMm, isMid ? RED : INK, isMid ? 0.5 : 0.3));
  }
  out.push(`<g transform="translate(${f(apexX)} ${f(cy)}) rotate(90)">`, ...local, '</g>');

  // Kóty nad pásem: 2a vrchol → první dírka a rozteč u prostřední, 2b rozteč za prostřední.
  const dimY = top - 6;
  if (part === 'a') {
    out.push(dimensionH(dimY, xOf(offsets[0]!), apexX));
    out.push(
      text((xOf(offsets[0]!) + apexX) / 2, dimY - 2, `${cz(offsets[0]!)} mm`, 3, GREEN, 'middle'),
    );
  }
  const [a, b] = part === 'a' ? [midOff, offsets[mid - 1]] : [offsets[mid + 1], midOff];
  if (a !== undefined && b !== undefined && mid > 0) {
    out.push(dimensionH(dimY, xOf(a), xOf(b)));
    out.push(
      text(
        (xOf(a) + xOf(b)) / 2,
        dimY - 2,
        `rozteč ${cz(tip.holeSpacingMm)} mm`,
        3,
        GREEN,
        'middle',
      ),
    );
  }
  if (part === 'a') {
    const shapeLabel =
      shape === 'round'
        ? `konec zaoblený r = ${cz(half)} mm`
        : `hrot ${cz(Math.round(tipLengthMm(tip) * 10) / 10)} mm · vrchol r = ${cz(tip.noseRadiusMm)} mm`;
    out.push(text(apexX, top - 14, shapeLabel, 3.2, RED, 'end'));
    out.push(text(LANDSCAPE_LEFT_MM, top - 14, 'sem pokračuje list 2b (vlevo neřezat)', 3, GREY));
  } else {
    out.push(
      text(xOf(from), top - 14, 'sem pokračuje list 2a s koncem (vpravo neřezat)', 3, GREY, 'end'),
    );
    out.push(
      text(LANDSCAPE_LEFT_MM, bottom + 20, 'sem pokračuje hlavní pás (vlevo neřezat)', 3, GREY),
    );
  }

  // Prostřední dírka je u 2a vlevo, u 2b vpravo (12 mm od konce úseku): popis zarovnaný
  // ke konci úseku, aby nevyjel z listu.
  const [labelX, anchor] =
    part === 'a' ? [LANDSCAPE_LEFT_MM, 'start' as const] : [xOf(from), 'end' as const];
  out.push(text(labelX, bottom + 7, 'PROSTŘEDNÍ DÍRKA = vaše míra', 3.4, RED, anchor));
  out.push(
    text(
      labelX,
      bottom + 11.5,
      `${cz(apexToMiddleHoleMm(tip))} mm ${fromEnd(shape)} · tímto kroužkem přiložte list na značku`,
      3,
      RED,
      anchor,
    ),
  );

  const all = tipNotes(tip, end, shape);
  const twoSheets =
    'List 2 je na dvou listech: 2a (konec a dírky k prostřední) a 2b (prostřední a zbylé dírky).';
  const howTo = 'Každý list přiložte zvlášť: prostřední dírkou na značku, boky na hrany pásu.';
  out.push(
    ...notes(
      LANDSCAPE_LEFT_MM,
      160,
      part === 'a'
        ? [all[0]!, all[1]!, all[2]!, all[3]!, all[6]!, twoSheets, howTo]
        : [
            all[0]!,
            `Poslední dírka ${cz(lastOff)} mm ${fromEnd(shape)}, nastavení ± ${cz(adjustmentRangeMm(tip))} mm (${holesWord(mid)} sem i tam).`,
            twoSheets,
            howTo,
            all[6]!,
          ],
    ),
  );
  return out;
}

function page(body: string[], orientation: 'portrait' | 'landscape' = 'portrait'): string {
  const [w, h] = orientation === 'portrait' ? [210, 297] : [297, 210];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="#ffffff"/>`,
    ...body,
    '</svg>',
  ].join('\n');
}

/**
 * Oba listy (bez XML prologu) pro konec se špičkou na výšku – přesně to, co generátor zapisuje
 * do `opasek-sablona-<šířka>mm-1-prezka.svg` a `-2-spicka.svg`.
 */
export function buildPages(end: BeltEndSpec, tip: BeltTipSpec): [string, string] {
  return [page(buckleEndPage(end)), page(tipPage(tip, end))];
}

/** Id listů opasku v obsahu projektu (`patternSheets`) i ve vygenerované skupině. */
export const BELT_SHEET_IDS = {
  buckle: 'prezka',
  tip: 'spicka',
  /** List 2b, jen když se list 2 nevejde na jeden list A4 (`tipSheetOrientation` = `split`). */
  tipRest: 'spicka-zbytek',
} as const;

export interface BeltSheet {
  id: (typeof BELT_SHEET_IDS)[keyof typeof BELT_SHEET_IDS];
  title: string;
  orientation: 'portrait' | 'landscape';
  widthMm: number;
  heightMm: number;
  svg: string;
}

/**
 * Oba listy pro libovolnou platnou kombinaci (šířka, tloušťka, tvar konce, dírky). List 2
 * je na výšku, když se vejde, jinak na šířku; když se nevejde ani tak, vyhodí chybu (meze
 * hlídá `checkBeltConfig`). Rozměry musí projít kontrolami modelu – to hlídá volající.
 */
const a4 = (o: 'portrait' | 'landscape') =>
  o === 'portrait' ? { widthMm: 210, heightMm: 297 } : { widthMm: 297, heightMm: 210 };

/**
 * List 1 (konec u přezky a poutko). Na tvaru konce ani dírkách nezávisí, takže se tiskne
 * i tehdy, když se list 2 na A4 nevejde.
 */
export function buildBuckleSheet(end: BeltEndSpec): BeltSheet {
  return {
    id: BELT_SHEET_IDS.buckle,
    title: 'List 1 – konec u přezky a poutko',
    orientation: 'portrait',
    ...a4('portrait'),
    svg: page(buckleEndPage(end)),
  };
}

export function buildBeltSheets(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  shape: BeltTipShape,
): [BeltSheet, BeltSheet, ...BeltSheet[]] {
  const orientation = tipSheetOrientation(tip);
  if (orientation === null) {
    throw new Error('Dírky se nevejdou ani na dva listy A4 na šířku.');
  }
  if (orientation === 'split') {
    const endName = shape === 'round' ? 'zaoblený konec' : 'špička';
    return [
      buildBuckleSheet(end),
      {
        id: BELT_SHEET_IDS.tip,
        title: `List 2a – ${endName} a dírky k prostřední`,
        orientation: 'landscape',
        ...a4('landscape'),
        svg: page(tipPageSplit(tip, end, shape, 'a'), 'landscape'),
      },
      {
        id: BELT_SHEET_IDS.tipRest,
        title: 'List 2b – prostřední a zbylé dírky',
        orientation: 'landscape',
        ...a4('landscape'),
        svg: page(tipPageSplit(tip, end, shape, 'b'), 'landscape'),
      },
    ];
  }
  const tipBody =
    orientation === 'portrait' ? tipPage(tip, end, shape) : tipPageLandscape(tip, end, shape);
  return [
    buildBuckleSheet(end),
    {
      id: BELT_SHEET_IDS.tip,
      title: shape === 'round' ? 'List 2 – zaoblený konec a dírky' : 'List 2 – špička a dírky',
      orientation,
      ...a4(orientation),
      svg: page(tipBody, orientation),
    },
  ];
}
