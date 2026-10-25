/**
 * OBRAT R11 – přišitá kapsa na mince (docs/design/obrat/iterace-11-prisita-kapsa.md), vychází
 * z R10 (iterace-09-zjednoduseni.md, iterace-10-rezervy.md).
 *
 * Souřadnice „zavřeného předku“: x zleva, y shora od ohybu klopy, mm. Jedna useň 1,2 mm.
 * Díly: T1 záda + klopa (jeden ohyb), T2 přední stěna, P zadní díl kapsy na mince s víčkem
 * (ohnutý horní okraj), T3 předek kapsy, K kryt patice C. P a T3 jsou přes celou šířku těla
 * a všijí se do jednoho U-švu těla (jedna nit). Dva dělicí švy dělají dvě krajní dutiny, mezi
 * nimi je slepené pole s paticí B. Víčko (P přehnutý dopředu přes ústí T3) má oba konce šikmé
 * a zavírá ho B uprostřed. Karty a bankovky zavírá C na klopě. Druk Prym Anorak 12 mm
 * (katalog `snap-fastener`), každá polovina v jedné vrstvě, objímky podle obtisku. Klopa i víčko
 * se řežou s rezervou a seříznou se přes skutečný obsah. Rozměry mincí ČNB (ověřeno
 * 18. 10. 2026). Fyzicky NEOVĚŘENO.
 */
export const OBRAT_REVISION = 'R11';

export const OBRAT_COINS = {
  '1': { diameter: 20, thickness: 1.85, diameterTolerance: 0.1, thicknessTolerance: 0.13 },
  '2': { diameter: 21.5, thickness: 1.85, diameterTolerance: 0.1, thicknessTolerance: 0.13 },
  '5': { diameter: 23, thickness: 1.85, diameterTolerance: 0.1, thicknessTolerance: 0.13 },
  '10': { diameter: 24.5, thickness: 2.55, diameterTolerance: 0.1, thicknessTolerance: 0.05 },
  '20': { diameter: 26, thickness: 2.55, diameterTolerance: 0.1, thicknessTolerance: 0.05 },
  '50': { diameter: 27.5, thickness: 2.55, diameterTolerance: 0.1, thicknessTolerance: 0.05 },
} as const;
export type ObratCoin = keyof typeof OBRAT_COINS;

/** Bankovka ČNB 5000 Kč 170 × 74 (±1,5) přeložená napůl; karta ISO 85,60 × 53,98 × 0,76. */
const NOTE_FOLDED = { width: 85.75, height: 75.5 };
const CARD = { width: 85.6, height: 53.98, thickness: 0.76 };
const SMALLEST_COIN = Math.min(...Object.values(OBRAT_COINS).map((c) => c.diameter));
/** Rozteč vidliček (mm). */
export const STITCH_PITCH = 4;
/** Předpoklad: film lepidla na jeden spoj (mm). */
const GLUE_FILM = 0.1;

export interface Point {
  x: number;
  y: number;
}

export interface ObratSpec {
  width: number;
  height: number;
  leather: number;
  /** Největší změřená tloušťka usně (screening, přeměřit). */
  measuredLeatherMax: number;
  seamOffset: number;
  /** První díra švu nejméně tak daleko od volné hrany. */
  seamEndGap: number;
  bodyCornerR: number;
  flapCornerR: number;
  lidCornerR: number;
  /** Spodní hrana zavřené klopy vlevo (po seříznutí) a vzestup doprava. */
  flapEndY: number;
  flapRise: number;
  /** Odhad délky klopy spotřebované přehybem přes obsah. */
  flapFoldAllowance: number;
  /** Rezerva klopy navíc; seřízne se v lekci 9 přes skutečný obsah. */
  flapTrimReserve: number;
  /** Horní hrana přední stěny (ramena) a výkus pro palec. */
  frontTopY: number;
  notch: { start: number; bottomStart: number; bottomEnd: number; end: number; bottomY: number };
  /** Ohyb víčka (hřbet) na zadním dílu P. */
  lidFoldY: number;
  /** Horní hrana T3 (ústí dutin) = horní hrana P vedle víčka. */
  coinMouthY: number;
  /** Svislé dělicí švy (zleva); vnějším bokem dutin je boční šev těla. */
  dividerSeams: readonly [number, number];
  /**
   * Dělicí šev končí tolik nad linií dna (samostatný šev, bez společné díry s U-švem);
   * délka švu od ústí + seamEndGap musí vyjít na celé rozteče vidliček.
   */
  dividerBottomGap: number;
  /** První díra U-linie modulu (P + T3) pod ústím. */
  moduleSeamTopGap: number;
  /** Konec víčka u ohybu od hrany těla (oba konce, zrcadlově). */
  lidInset: number;
  /** O kolik je každý konec víčka kratší na volné hraně po seříznutí (šikmý konec). */
  lidEndTaper: number;
  /** Spodní hrana zavřeného víčka (volná hrana po seříznutí). */
  lidBottomY: number;
  /** Přídavek víčka na ohyb; seřízne se v lekci 6. */
  lidFoldAllowance: number;
  reliefHoleDiameter: number;
  /** Lepený pás P–T3 (rub na rub) u boků a dna; pole mezi dutinami se lepí celé. */
  glueBand: number;
  /** Lepený pás těla: T1–T2 a P–T2 (líc na líc) podél boků a dna. */
  bodyGlue: number;
  /** Horní lepený pás P–T2 za kapsou; přerušený kolem příruby B o `flangeGap`. */
  topGlue: { top: number; bottom: number; flangeGap: number };
  /** Klobouček druku (Prym Anorak 12 mm) a největší dovolená příruba patice. */
  snapCap: number;
  snapFlangeMax: number;
  hardwareGap: number;
  snapB: Point;
  snapC: Point;
  /** Kryt K patice C (rub T2). */
  coverRadius: number;
  /** Lepidlo, které zasáhne za linii švu do dutiny (glueBand − seamOffset). */
  glueIntrusion: number;
  cavityLoss: number;
  handlingAllowance: number;
  billFoldedThickness: number;
}

export const OBRAT: ObratSpec = {
  width: 108,
  height: 90,
  leather: 1.2,
  measuredLeatherMax: 1.3,
  seamOffset: 3.5,
  seamEndGap: 3,
  bodyCornerR: 6,
  flapCornerR: 8,
  lidCornerR: 4,
  flapEndY: 42,
  flapRise: 4,
  flapFoldAllowance: 8,
  flapTrimReserve: 6,
  frontTopY: 15,
  notch: { start: 30, bottomStart: 40, bottomEnd: 68, end: 78, bottomY: 38 },
  lidFoldY: 48,
  coinMouthY: 50,
  dividerSeams: [40.5, 67.5],
  dividerBottomGap: 5.5,
  moduleSeamTopGap: 2,
  lidInset: 7.5,
  lidEndTaper: 2.5,
  lidBottomY: 68,
  lidFoldAllowance: 4,
  reliefHoleDiameter: 2,
  glueBand: 4,
  bodyGlue: 5,
  topGlue: { top: 52, bottom: 57, flangeGap: 2.5 },
  snapCap: 12,
  snapFlangeMax: 11,
  hardwareGap: 2,
  snapB: { x: 54, y: 58 },
  snapC: { x: 88, y: 25.5 },
  coverRadius: 8.5,
  glueIntrusion: 0.5,
  cavityLoss: 1,
  handlingAllowance: 2,
  billFoldedThickness: 1.1,
};

const round = (n: number): number => Math.round(n * 1000) / 1000;

export function fmt(v: number): string {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

/** Spodní hrana zavřené klopy v místě x (stoupá doprava). */
export function flapEdgeY(spec: ObratSpec, x: number): number {
  return spec.flapEndY - (spec.flapRise * x) / spec.width;
}

/** Délka klopy od ohybu po volnou hranu po seříznutí (rozvinutá) v místě x. */
export function flapLength(spec: ObratSpec, x: number): number {
  return spec.flapFoldAllowance + flapEdgeY(spec, x);
}

/** Levý konec víčka ve výšce y (zavřené víčko, od ohybu dolů); pravý je zrcadlově W − x. */
export function obratLidEndX(spec: ObratSpec, y: number): number {
  const len = spec.lidBottomY - spec.lidFoldY;
  return spec.lidInset + (spec.lidEndTaper * (y - spec.lidFoldY)) / len;
}

/** Lepené pole mezi dutinami (P–T3): 0,5 mm za dělicí švy. */
export function obratGlueField(spec: ObratSpec): [number, number] {
  const [d0, d1] = spec.dividerSeams;
  return [round(d0 - spec.glueIntrusion), round(d1 + spec.glueIntrusion)];
}

/** Úseky horního lepeného pásu P–T2 (x od–do), přerušené kolem příruby B. */
export function obratTopGlueSpans(spec: ObratSpec): [number, number][] {
  const half = spec.snapFlangeMax / 2 + spec.topGlue.flangeGap;
  return [
    [spec.bodyGlue, round(spec.snapB.x - half)],
    [round(spec.snapB.x + half), spec.width - spec.bodyGlue],
  ];
}

/** Dvě krajní dutiny: vnějším bokem je linie bočního švu těla, vnitřním dělicí šev. */
export function obratCells(spec: ObratSpec) {
  const [d0, d1] = spec.dividerSeams;
  const s = spec.seamOffset;
  const usableDepth = round(
    spec.height - s - spec.coinMouthY - spec.glueIntrusion - spec.cavityLoss,
  );
  return [
    [s, d0],
    [d1, spec.width - s],
  ].map(([left, right]) => ({
    left: left!,
    right: right!,
    seamSpan: round(right! - left!),
    usableWidth: round(right! - left! - 2 * spec.glueIntrusion - spec.cavityLoss),
    usableDepth,
  }));
}

/** Obálka D + tloušťka stohu + manipulační vůle; heuristika, ne simulace usně. */
export function obratCoinFit(spec: ObratSpec, cellIndex: number, stack: readonly ObratCoin[]) {
  const cell = obratCells(spec)[cellIndex];
  if (!cell || stack.length === 0)
    throw new Error('Vyberte existující dutinu a nejméně jednu minci.');
  const diameter = Math.max(
    ...stack.map((id) => OBRAT_COINS[id].diameter + OBRAT_COINS[id].diameterTolerance),
  );
  const thickness = stack.reduce(
    (sum, id) => sum + OBRAT_COINS[id].thickness + OBRAT_COINS[id].thicknessTolerance,
    0,
  );
  const need = round(diameter + thickness + spec.handlingAllowance);
  return {
    need,
    stackThickness: round(thickness),
    widthReserve: round(cell.usableWidth - need),
    depthReserve: round(cell.usableDepth - need),
    passesEnvelope: cell.usableWidth >= need && cell.usableDepth >= need,
    physicallyVerified: false as const,
  };
}

/** Všechny skladby `count` mincí s opakováním; projde, když jde rozdělit do dvou dutin. */
export function obratCapacityAudit(spec: ObratSpec, count: number, maxPerCell = 2) {
  const ids = Object.keys(OBRAT_COINS) as ObratCoin[];
  const rows: { coins: ObratCoin[]; split: [ObratCoin[], ObratCoin[]] | null }[] = [];
  const visit = (coins: ObratCoin[], first: number) => {
    if (coins.length === count) {
      let split: [ObratCoin[], ObratCoin[]] | null = null;
      for (let mask = 1; mask < (1 << count) - 1 && !split; mask++) {
        const a = coins.filter((_, i) => mask & (1 << i));
        const b = coins.filter((_, i) => !(mask & (1 << i)));
        if (a.length > maxPerCell || b.length > maxPerCell) continue;
        if (obratCoinFit(spec, 0, a).passesEnvelope && obratCoinFit(spec, 1, b).passesEnvelope)
          split = [a, b];
      }
      rows.push({ coins: [...coins], split });
      return;
    }
    for (let i = first; i < ids.length; i++) visit([...coins, ids[i]!], i);
  };
  visit([], 0);
  return rows;
}

/** Doporučené zkušební skladby (lekce 1, 6 a 9). */
export const OBRAT_TEST_SETS: readonly { label: string; cells: [ObratCoin[], ObratCoin[]] }[] = [
  { label: '3 mince s 50 Kč', cells: [['50'], ['20', '10']] },
  {
    label: '4 mince',
    cells: [
      ['20', '10'],
      ['5', '1'],
    ],
  },
  {
    label: '4 drobné',
    cells: [
      ['2', '1'],
      ['2', '1'],
    ],
  },
];

/**
 * Nominální lokální součty (mm): useň + obsah. Výška zapnutého druku `null` = neznámá, změřit
 * v lekci 4. Lepidlo, nit a vyklenutí nejsou zahrnuté (kromě `withGlueMm` u švů, předpoklad
 * 0,1 mm na spoj); maximum peněženky se měří v lekci 10.
 */
export function obratLayerStacks(spec: ObratSpec, coins: readonly ObratCoin[]) {
  const l = spec.leather;
  const lMax = spec.measuredLeatherMax;
  const cards = 4 * CARD.thickness;
  const notes = spec.billFoldedThickness;
  const coinT = coins.reduce((s, id) => s + OBRAT_COINS[id].thickness, 0);
  const seam = (layers: number) => ({
    leatherLayers: layers,
    nominalMm: round(layers * l),
    maxLeatherMm: round(layers * lMax),
    withGlueMm: round(layers * lMax + (layers - 1) * GLUE_FILM),
  });
  return {
    /** záda, T2, P, T3, víčko + karty + bankovky + mince (pod víčkem, y 50–68) */
    coinZone: { leatherLayers: 5, nominalMm: round(5 * l + cards + notes + coinT) },
    /** záda, T2, P, T3 + karty + bankovky + mince (pod víčkem níž, y 68–86) */
    coinZoneBelowLid: { leatherLayers: 4, nominalMm: round(4 * l + cards + notes + coinT) },
    /** záda, T2, P, T3, víčko + karty + bankovky + zapnutý B (pole mezi dutinami) */
    snapB: { leatherLayers: 5, nominalMm: round(5 * l + cards + notes), snapHeightMm: null },
    /** záda, T2, kryt K, klopa + bankovky (karty začínají níž) + zapnutý C */
    snapC: { leatherLayers: 4, nominalMm: round(4 * l + notes), snapHeightMm: null },
    /** U-šev těla: dno a boky kapsy (T1, T2, P, T3) */
    pocketSeam: seam(4),
    /** U-šev těla: boky nad kapsou (T1, T2) */
    sideSeamAbovePocket: seam(2),
    /** modul P + T3 při proražení U-linie v lekci 6 */
    moduleSeam: seam(2),
    measuredMaximum: null,
  };
}

// ---------------------------------------------------------------------------------------------
// Díly ve vlastních souřadnicích (mm, počátek vlevo nahoře obalového obdélníku).

export interface PartLine {
  d: string;
  kind: 'seam' | 'fold' | 'position' | 'glue' | 'trim';
  label?: string;
}
export interface PartMark {
  x: number;
  y: number;
  kind: 'stud-hole' | 'relief-hole';
  label: string;
}
export interface ObratPart {
  id: 'T1' | 'T2' | 'P' | 'T3' | 'K';
  name: string;
  /** Kterou stranou nahoru se list přikládá na kůži. */
  face: 'líc' | 'rub';
  width: number;
  height: number;
  outline: string;
  lines: PartLine[];
  marks: PartMark[];
  count: number;
}

const n = (v: number) => String(round(v));

/** Uzavřený obrys se zaoblenými rohy (kvadratická křivka, tečné body ve vzdálenosti r). */
function roundedPolygon(pts: readonly Point[], radii: readonly number[]): string {
  const k = pts.length;
  const parts: string[] = [];
  for (let i = 0; i < k; i++) {
    const p = pts[i]!;
    const prev = pts[(i + k - 1) % k]!;
    const next = pts[(i + 1) % k]!;
    const r = radii[i] ?? 0;
    const toward = (q: Point, d: number): Point => {
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      return { x: p.x + ((q.x - p.x) * d) / len, y: p.y + ((q.y - p.y) * d) / len };
    };
    if (r <= 0) {
      parts.push(`${i === 0 ? 'M' : 'L'}${n(p.x)} ${n(p.y)}`);
      continue;
    }
    const a = toward(prev, r);
    const b = toward(next, r);
    parts.push(
      `${i === 0 ? 'M' : 'L'}${n(a.x)} ${n(a.y)}`,
      `Q${n(p.x)} ${n(p.y)} ${n(b.x)} ${n(b.y)}`,
    );
  }
  return parts.join(' ') + ' Z';
}

/** Otevřená lomená čára se zaoblenými vnitřními vrcholy (pro švy kolem zaoblených rohů). */
function roundedPolyline(pts: readonly Point[], radii: readonly number[]): string {
  const parts = [`M${n(pts[0]!.x)} ${n(pts[0]!.y)}`];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const r = radii[i - 1] ?? 0;
    const toward = (q: Point): Point => {
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      return { x: p.x + ((q.x - p.x) * r) / len, y: p.y + ((q.y - p.y) * r) / len };
    };
    if (r <= 0) {
      parts.push(`L${n(p.x)} ${n(p.y)}`);
      continue;
    }
    const a = toward(pts[i - 1]!);
    const b = toward(pts[i + 1]!);
    parts.push(`L${n(a.x)} ${n(a.y)}`, `Q${n(p.x)} ${n(p.y)} ${n(b.x)} ${n(b.y)}`);
  }
  const last = pts[pts.length - 1]!;
  parts.push(`L${n(last.x)} ${n(last.y)}`);
  return parts.join(' ');
}

const rect = (x: number, y: number, w: number, h: number) =>
  `M${n(x)} ${n(y)} H${n(x + w)} V${n(y + h)} H${n(x)} Z`;

/** U-šev od výšky `top` (souřadnice zavřeného předku) dolů; `dy` posune souřadnice. */
function uSeam(spec: ObratSpec, top: number, dy: number): string {
  const s = spec.seamOffset;
  const yb = dy + spec.height - s;
  const r = Math.max(spec.bodyCornerR - s, 0.5);
  return roundedPolyline(
    [
      { x: s, y: dy + top },
      { x: s, y: yb },
      { x: spec.width - s, y: yb },
      { x: spec.width - s, y: dy + top },
    ],
    [r, r],
  );
}

/** U-šev těla (od ramen T2). */
const bodyUSeam = (spec: ObratSpec, dy: number) =>
  uSeam(spec, spec.frontTopY + spec.seamEndGap, dy);
/** U-linie modulu P + T3 (proráží se v lekci 6, šije se až s tělem). */
const moduleUSeam = (spec: ObratSpec, dy: number) =>
  uSeam(spec, spec.coinMouthY + spec.moduleSeamTopGap, dy);

/** Dělicí švy dutin (souřadnice zavřeného předku posunuté o dy). */
function dividerSeams(spec: ObratSpec, dy: number): string {
  const top = dy + spec.coinMouthY + spec.seamEndGap;
  const bottom = dy + spec.height - spec.seamOffset - spec.dividerBottomGap;
  return spec.dividerSeams.map((x) => `M${n(x)} ${n(top)} V${n(bottom)}`).join(' ');
}

/** Lepený pás podél boků (od výšky `top`) a dna, šířka g; `dy` posune souřadnice. */
function glueU(spec: ObratSpec, top: number, g: number, dy: number): string {
  const W = spec.width;
  const t = dy + top;
  const yb = dy + spec.height;
  return `M0 ${n(t)} V${n(yb)} H${n(W)} V${n(t)} H${n(W - g)} V${n(yb - g)} H${n(g)} V${n(t)} Z`;
}

/** Konec víčka u ohybu s rezervou na seříznutí: šikmá hrana prodloužená za volnou hranu. */
function lidCutEndX(spec: ObratSpec): number {
  return obratLidEndX(spec, spec.lidBottomY + spec.lidFoldAllowance);
}

export function obratParts(spec: ObratSpec): ObratPart[] {
  const W = spec.width;
  const H = spec.height;

  // T1 – RUB nahoru, klopa rozložená nahoru, řez s rezervou. Ohyb na y = fold.
  const fold = flapLength(spec, 0) + spec.flapTrimReserve;
  const rightTop = flapEdgeY(spec, 0) - flapEdgeY(spec, W);
  const trim = spec.flapTrimReserve;
  const T1: ObratPart = {
    id: 'T1',
    name: 'Záda a klopa',
    face: 'rub',
    width: W,
    height: fold + H,
    outline: roundedPolygon(
      [
        { x: 0, y: 0 },
        { x: W, y: rightTop },
        { x: W, y: fold + H },
        { x: 0, y: fold + H },
      ],
      [spec.flapCornerR, spec.flapCornerR, spec.bodyCornerR, spec.bodyCornerR],
    ),
    lines: [
      { d: glueU(spec, spec.frontTopY, spec.bodyGlue, fold), kind: 'glue' },
      { d: `M0 ${n(fold)} H${n(W)}`, kind: 'fold', label: 'ohyb klopy' },
      { d: bodyUSeam(spec, fold), kind: 'seam' },
      {
        d: `M0 ${n(trim)} L${n(W)} ${n(trim + rightTop)}`,
        kind: 'trim',
        label: 'orientační hrana po seříznutí',
      },
    ],
    marks: [],
    count: 1,
  };

  // T2 – LÍC nahoru, souřadnice zavřeného předku posunuté o frontTopY. Na líci rámeček pro P.
  const t = spec.frontTopY;
  const nb = spec.notch.bottomY - t;
  const N = spec.notch;
  const tg = spec.topGlue;
  const T2: ObratPart = {
    id: 'T2',
    name: 'Přední stěna',
    face: 'líc',
    width: W,
    height: H - t,
    outline: [
      `M0 0 H${n(N.start)}`,
      `C${n(N.start + 6)} 0 ${n(N.bottomStart - 6)} ${n(nb)} ${n(N.bottomStart)} ${n(nb)}`,
      `H${n(N.bottomEnd)}`,
      `C${n(N.bottomEnd + 6)} ${n(nb)} ${n(N.end - 6)} 0 ${n(N.end)} 0`,
      `H${n(W)}`,
      `V${n(H - t - spec.bodyCornerR)} Q${n(W)} ${n(H - t)} ${n(W - spec.bodyCornerR)} ${n(H - t)}`,
      `H${n(spec.bodyCornerR)} Q0 ${n(H - t)} 0 ${n(H - t - spec.bodyCornerR)} Z`,
    ].join(' '),
    lines: [
      {
        d: [
          glueU(spec, spec.coinMouthY, spec.bodyGlue, -t),
          ...obratTopGlueSpans(spec).map(([a, b]) =>
            rect(a, tg.top - t, b - a, tg.bottom - tg.top),
          ),
        ].join(' '),
        kind: 'glue',
        label: 'P: zdrsnit + lepidlo',
      },
      { d: bodyUSeam(spec, -t), kind: 'seam' },
    ],
    marks: [{ x: spec.snapC.x, y: spec.snapC.y - t, kind: 'stud-hole', label: 'C – patice' }],
    count: 1,
  };

  // P – RUB nahoru, x jako na zavřeném předku. Víčko rozložené nahoru: y = 0 je volná hrana
  // víčka s rezervou, py(y) převádí souřadnice zavřeného předku pod ohybem.
  const lidCut = spec.lidBottomY - spec.lidFoldY + spec.lidFoldAllowance;
  const py = (y: number) => lidCut + y - spec.lidFoldY;
  const li = spec.lidInset;
  const cutEnd = lidCutEndX(spec);
  const g = spec.glueBand;
  const [f0, f1] = obratGlueField(spec);
  const rh = spec.reliefHoleDiameter / 2;
  const P: ObratPart = {
    id: 'P',
    name: 'Zadní díl kapsy a víčko',
    face: 'rub',
    width: W,
    height: lidCut + H - spec.lidFoldY,
    outline: roundedPolygon(
      [
        { x: cutEnd, y: 0 },
        { x: W - cutEnd, y: 0 },
        { x: W - li, y: py(spec.lidFoldY) },
        { x: W - li, y: py(spec.coinMouthY) },
        { x: W, y: py(spec.coinMouthY) },
        { x: W, y: py(H) },
        { x: 0, y: py(H) },
        { x: 0, y: py(spec.coinMouthY) },
        { x: li, y: py(spec.coinMouthY) },
        { x: li, y: py(spec.lidFoldY) },
      ],
      [spec.lidCornerR, spec.lidCornerR, 0, 0, 1, spec.bodyCornerR, spec.bodyCornerR, 1, 0, 0],
    ),
    lines: [
      {
        d: [
          glueU(spec, spec.coinMouthY, g, py(0)),
          rect(f0, py(spec.coinMouthY), f1 - f0, H - spec.coinMouthY - g),
        ].join(' '),
        kind: 'glue',
        label: 'T3',
      },
      { d: `M${n(li)} ${n(py(spec.lidFoldY))} H${n(W - li)}`, kind: 'fold', label: 'ohyb víčka' },
      {
        d: `M${n(li + rh)} ${n(py(spec.coinMouthY))} H${n(W - li - rh)}`,
        kind: 'position',
        label: 'ústí T3',
      },
      { d: moduleUSeam(spec, py(0)), kind: 'seam' },
      { d: dividerSeams(spec, py(0)), kind: 'seam' },
    ],
    marks: [li, W - li].map((x) => ({
      x,
      y: py(spec.coinMouthY),
      kind: 'relief-hole' as const,
      label: 'odlehčení',
    })),
    count: 1,
  };

  // T3 – LÍC nahoru, x jako na zavřeném předku, y od ústí.
  const ly = (y: number) => y - spec.coinMouthY;
  const T3: ObratPart = {
    id: 'T3',
    name: 'Předek kapsy na mince',
    face: 'líc',
    width: W,
    height: H - spec.coinMouthY,
    outline: roundedPolygon(
      [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: ly(H) },
        { x: 0, y: ly(H) },
      ],
      [1, 1, spec.bodyCornerR, spec.bodyCornerR],
    ),
    lines: [
      { d: moduleUSeam(spec, -spec.coinMouthY), kind: 'seam' },
      { d: dividerSeams(spec, -spec.coinMouthY), kind: 'seam' },
    ],
    marks: [{ x: spec.snapB.x, y: ly(spec.snapB.y), kind: 'stud-hole', label: 'B – patice' }],
    count: 1,
  };

  const K: ObratPart = {
    id: 'K',
    name: 'Kryt patice C',
    face: 'rub',
    width: 2 * spec.coverRadius,
    height: 2 * spec.coverRadius,
    outline: circlePath(spec.coverRadius, spec.coverRadius, spec.coverRadius),
    lines: [],
    marks: [],
    count: 1,
  };
  return [T1, T2, P, T3, K];
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${n(cx - r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)} Z`;
}

/** Rozložení dílů na jednu A4 kůže (210 × 297, mezera 4 mm). */
export function obratLeatherLayout(spec: ObratSpec) {
  const parts = obratParts(spec);
  const by = Object.fromEntries(parts.map((p) => [p.id, p])) as Record<ObratPart['id'], ObratPart>;
  const gap = 4;
  const sheet = { width: 210, height: 297 };
  const column = by.T1.height + by.T2.height + by.P.height + 2 * gap;
  const side = sheet.width - Math.max(by.T1.width, by.T2.width, by.P.width) - gap;
  // T3 na výšku (40 mm široký) vedle sloupce, pod ním kryt K.
  const sideColumn = by.T3.width + gap + by.K.height;
  const fits = column <= sheet.height && by.T3.height <= side && sideColumn <= sheet.height;
  return {
    sheet,
    gap,
    columnHeight: round(column),
    sideWidth: round(side),
    sideColumnHeight: round(sideColumn),
    fits,
  };
}

// ---------------------------------------------------------------------------------------------

/** Vůle R11 (mm) – tabulka „Kolize a vůle“ v iteraci 11; kontroly je porovnávají s požadavky. */
export function obratClearances(spec: ObratSpec) {
  const s = spec.seamOffset;
  const r = spec.snapCap / 2;
  const fl = spec.snapFlangeMax / 2;
  const W = spec.width;
  const b = spec.snapB;
  const c = spec.snapC;
  const rh = spec.reliefHoleDiameter / 2;
  const [f0, f1] = obratGlueField(spec);
  const capLid = obratLidEndX(spec, b.y + r);
  const spans = obratTopGlueSpans(spec);
  return {
    lidFoldToSeam: round(spec.lidInset - s),
    lidFreeEdgeToSeam: round(obratLidEndX(spec, spec.lidBottomY) - s),
    lidFreeEdgeWidth: round(W - 2 * obratLidEndX(spec, spec.lidBottomY)),
    uncoveredMouthAtSide: round(obratLidEndX(spec, spec.coinMouthY) - s),
    reliefToSeam: round(spec.lidInset - rh - s),
    reliefToModuleGlue: round(spec.lidInset - rh - spec.glueBand),
    reliefToBodyGlue: round(spec.lidInset - rh - spec.bodyGlue),
    reliefToTopGlue: round(spec.topGlue.top - spec.coinMouthY - rh),
    capToMouth: round(b.y - r - spec.coinMouthY),
    capToLidFreeEdge: round(spec.lidBottomY - b.y - r),
    capToDivider: round(Math.min(...spec.dividerSeams.map((d) => Math.abs(d - b.x))) - r),
    capToLidEnd: round(Math.min(b.x - r - capLid, W - capLid - (b.x + r))),
    capToFlapEdge: round(b.y - r - flapEdgeY(spec, b.x)),
    flangeToGlueField: round(Math.min(b.x - fl - f0, f1 - (b.x + fl))),
    flangeToMouth: round(b.y - fl - spec.coinMouthY),
    topGlueGap: round(spans[1]![0] - spans[0]![1]),
    dividerToMouth: spec.seamEndGap,
    dividerToBottomSeam: spec.dividerBottomGap,
    dividerLength: round(
      spec.height - s - spec.dividerBottomGap - spec.coinMouthY - spec.seamEndGap,
    ),
    lidFoldToFlapLeft: round(spec.lidFoldY - flapEdgeY(spec, 0)),
    lidFoldToFlap15: round(spec.lidFoldY - flapEdgeY(spec, 15)),
    lidFoldToFlapRight: round(spec.lidFoldY - flapEdgeY(spec, W)),
    coverCToBodyGlue: round(W - spec.bodyGlue - (c.x + spec.coverRadius)),
    coverCToShoulder: round(c.y - spec.coverRadius - spec.frontTopY),
    cardEdgeToBodyGlue: round((W - CARD.width) / 2 - spec.bodyGlue),
    pocketClearWidth: round(W - 2 * spec.bodyGlue),
  };
}

export function checkObrat(spec: ObratSpec): string[] {
  const e: string[] = [];
  const values: number[] = Object.values(spec).flatMap((v: unknown) => {
    if (typeof v === 'number') return [v];
    if (v && typeof v === 'object')
      return Object.values(v as Record<string, unknown>).filter(
        (x): x is number => typeof x === 'number',
      );
    return [];
  });
  if (values.some((x) => !Number.isFinite(x) || x < 0))
    return ['Hodnoty musejí být konečné a nezáporné.'];
  const eps = 1e-9;
  const lt = (a: number, b: number) => a < b - eps;
  const s = spec.seamOffset;
  const r = spec.snapCap / 2;
  const fl = spec.snapFlangeMax / 2;
  const g = spec.hardwareGap;
  const W = spec.width;
  const H = spec.height;
  const k = obratClearances(spec);
  const [d0, d1] = spec.dividerSeams;

  if (spec.measuredLeatherMax < spec.leather)
    e.push('Změřené maximum usně je menší než jmenovitá tloušťka.');
  if (spec.coverRadius < fl + 1) e.push('Kryt K nepřekryje přírubu patice o 1 mm.');
  if (Math.abs(spec.glueBand - s - spec.glueIntrusion) > 0.01)
    e.push('Lepený pás P–T3 nesouhlasí s průnikem lepidla do dutin.');

  // Kapsa na karty a bankovky (světlost mezi lepenými pásy těla)
  if (lt(k.pocketClearWidth, NOTE_FOLDED.width + 4))
    e.push('Kapsa nemá šířkovou rezervu 4 mm pro bankovky.');
  if (lt(k.pocketClearWidth, CARD.width + 4)) e.push('Kapsa nemá šířkovou rezervu 4 mm pro karty.');
  if (H - s - NOTE_FOLDED.height < 4) e.push('Bankovka napůl nemá 4 mm pod ohybem klopy.');
  const cardTop = H - s - CARD.height;
  if (spec.notch.bottomY - cardTop < 5) e.push('Výkus neodkrývá kartu alespoň o 5 mm.');
  const notchCover = Math.min(
    ...[spec.notch.bottomStart, spec.notch.bottomEnd, spec.notch.end].map(
      (x) => flapEdgeY(spec, x) - spec.notch.bottomY,
    ),
  );
  if (notchCover < 1) e.push('Výkus přední stěny není zakrytý klopou.');
  if (flapEdgeY(spec, W) - cardTop < 4) e.push('Klopa nepřekrývá horní hranu karet o 4 mm.');

  // Klopa a C
  if (lt(k.lidFoldToFlapLeft, 6)) e.push('Mezi klopou a ohybem víčka chybí 6 mm.');
  const c = spec.snapC;
  if (c.y - r < spec.frontTopY + g) e.push('C je moc blízko horní hrany přední stěny.');
  if (c.x - r < spec.notch.end + g) e.push('C zasahuje do výkusu.');
  if (lt(k.coverCToBodyGlue, 0)) e.push('Kryt C zasahuje do lepeného pásu.');
  if (c.x - spec.coverRadius < spec.notch.end + 1) e.push('Kryt C zasahuje do výkusu.');
  if (lt(k.coverCToShoulder, 1)) e.push('Kryt C přečnívá horní hranu přední stěny.');
  if (c.y + r + g > flapEdgeY(spec, c.x) - s) e.push('C nemá rezervu od švu klopy.');

  // Dutiny a dělicí švy
  if (!(s < d0 && d0 < d1 && d1 < W - s)) e.push('Dělicí švy nejsou mezi boky těla.');
  if (lt(spec.dividerBottomGap, 3)) e.push('Dělicí šev nemá 3 mm od linie dna.');
  const dividerLength = spec.height - s - spec.dividerBottomGap - spec.coinMouthY - spec.seamEndGap;
  if (Math.abs(dividerLength / STITCH_PITCH - Math.round(dividerLength / STITCH_PITCH)) > 0.01)
    e.push('Dělicí šev nevychází na celé rozteče vidliček.');
  if (lt(spec.moduleSeamTopGap, 1.5)) e.push('Horní díra U-linie modulu je moc blízko ústí.');
  for (const cell of obratCells(spec))
    if (cell.usableWidth <= 0 || cell.usableDepth <= 0) e.push('Dutina nemá kladný prostor.');
  for (const set of OBRAT_TEST_SETS)
    set.cells.forEach((stack, i) => {
      if (!obratCoinFit(spec, i, stack).passesEnvelope)
        e.push(`Zkušební skladba „${set.label}“ neprojde obálkou.`);
    });

  // B v poli mezi dutinami
  const b = spec.snapB;
  if (!(d0 < b.x && b.x < d1)) e.push('B není v poli mezi dutinami.');
  else if (lt(k.capToDivider, g + s / 2)) e.push('B zasahuje k dělicímu švu.');
  if (lt(k.flangeToGlueField, 1) || lt(k.flangeToMouth, 1))
    e.push('Příruba patice B není celá v lepeném poli pod T3.');
  if (lt(k.capToMouth, g)) e.push('B je moc blízko ústí T3.');
  if (lt(k.capToLidFreeEdge, 3)) e.push('Víčko nepřesahuje objímku B o 3 mm.');
  if (lt(k.capToLidEnd, g)) e.push('B je moc blízko konce víčka.');
  if (lt(k.capToFlapEdge, g)) e.push('Klopa zasahuje ke kloboučku B.');

  // Víčko
  if (spec.lidBottomY - spec.coinMouthY < 12) e.push('Víčko nepřekrývá ústí alespoň o 12 mm.');
  if (spec.lidBottomY <= spec.lidFoldY || spec.coinMouthY <= spec.lidFoldY)
    e.push('Ohyb víčka musí být nad ústím i nad volnou hranou víčka.');
  if (lt(k.lidFoldToSeam, 3.5)) e.push('Konec víčka u ohybu je blíž než 3,5 mm k linii švu.');
  if (k.lidFreeEdgeWidth < 2 * spec.lidCornerR + 10)
    e.push('Volná hrana víčka je kvůli šikmým koncům moc krátká.');
  if (!lt(k.uncoveredMouthAtSide, SMALLEST_COIN / 2))
    e.push('Víčko nechává u boku nekryté ústí, kudy projde mince.');
  if (lt(k.reliefToSeam, 2)) e.push('Odlehčovací otvor je blíž než 2 mm k linii švu.');
  if (lt(k.reliefToModuleGlue, 1) || lt(k.reliefToBodyGlue, 1))
    e.push('Odlehčovací otvor zasahuje k lepenému pásu.');

  // Horní lepený pás P–T2
  const tg = spec.topGlue;
  if (tg.bottom <= tg.top) e.push('Horní lepený pás nemá kladnou výšku.');
  if (lt(k.reliefToTopGlue, 1)) e.push('Horní lepený pás zasahuje k odlehčovacímu otvoru.');
  if (lt(tg.flangeGap, 2)) e.push('Horní lepený pás je blíž než 2 mm k přírubě B.');
  if (!lt(k.topGlueGap, SMALLEST_COIN)) e.push('Mezerou v horním lepeném pásu projde mince.');

  if (!obratLeatherLayout(spec).fits) e.push('Díly se nevejdou na jednu A4 kůže.');
  return e;
}

export function obratReview(spec: ObratSpec) {
  const four = obratCapacityAudit(spec, 4);
  const three = obratCapacityAudit(spec, 3);
  return {
    revision: OBRAT_REVISION,
    status: 'pattern-unverified',
    physicalVerification: 'not-performed',
    material: { nominalMm: spec.leather, screeningMaxMm: spec.measuredLeatherMax, types: 1 },
    closed: { width: spec.width, height: spec.height },
    parts: obratParts(spec).map((p) => ({
      id: p.id,
      name: p.name,
      face: p.face,
      width: round(p.width),
      height: round(p.height),
      count: p.count,
    })),
    snaps: { B: spec.snapB, C: spec.snapC },
    lid: {
      atFold: [spec.lidInset, round(spec.width - spec.lidInset)],
      atFreeEdge: [
        round(obratLidEndX(spec, spec.lidBottomY)),
        round(spec.width - obratLidEndX(spec, spec.lidBottomY)),
      ],
      atCutEdgeWithAllowance: [round(lidCutEndX(spec)), round(spec.width - lidCutEndX(spec))],
    },
    glue: {
      bodyMm: spec.bodyGlue,
      moduleMm: spec.glueBand,
      field: obratGlueField(spec),
      topBand: { y: [spec.topGlue.top, spec.topGlue.bottom], x: obratTopGlueSpans(spec) },
    },
    cells: obratCells(spec),
    clearances: obratClearances(spec),
    testSets: OBRAT_TEST_SETS.map((s) => ({
      ...s,
      fits: s.cells.map((stack, i) => obratCoinFit(spec, i, stack)),
    })),
    capacity: {
      threeCoins: { total: three.length, pass: three.filter((r) => r.split).length },
      fourCoins: { total: four.length, pass: four.filter((r) => r.split).length },
    },
    layers: {
      with50: obratLayerStacks(spec, ['50']),
      with20and10: obratLayerStacks(spec, ['20', '10']),
    },
    leatherLayout: obratLeatherLayout(spec),
    errors: checkObrat(spec),
    openPhysicalChecks: [
      'délka klopy přes obsah: seříznutí v lekci 9',
      'druk Prym Anorak 12 mm v jedné vrstvě 1,2 mm a výška zapnutého druku (lekce 4)',
      'prorážení U-švu vidličkami přes 4 vrstvy (≈ 5,5 mm s lepidlem): délka hrotů, vytažení, posun vrstev (lekce 3 a 8)',
      'lepení líc na líc: P na zdrsněný líc T2 (lekce 3)',
      'ohyb víčka navlhko a 50× otevření na 90° bez praskání u odlehčovacích otvorů (lekce 3 a 6)',
      'retence mincí pod víčkem s B uprostřed, konce víčka neodstávají; zkouška s pomocnou nití v předem proražených dírách (lekce 6)',
      'víčko otevřené za 90°: klobouček B může otlačit klopu (lekce 9)',
      'skutečná tloušťka a nošení (lekce 10)',
    ],
  };
}
