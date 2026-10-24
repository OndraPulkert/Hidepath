/**
 * OBRAT R10 – zjednodušená konstrukce pro začátečníka (docs/design/obrat/iterace-09-zjednoduseni.md)
 * s rezervami z kontroly vyrobitelnosti (docs/design/obrat/iterace-10-rezervy.md).
 *
 * Souřadnice „zavřeného předku“: x zleva, y shora od ohybu klopy, mm. Jedna useň 1,2 mm.
 * Díly: T1 záda + klopa (jeden ohyb), T2 přední stěna, P pás + víčko (ohyb), T3 předek mincí
 * s jazýčkem pro patici B, K kryty patic. Pás P je pravým koncem všitý do pravého švu těla
 * a otevírá se doprava (A); víčko je ohnutý horní okraj pásu a zavírá ho B na volném konci.
 * Karty a bankovky zavírá C na klopě. Druk Prym Anorak 12 mm (katalog `snap-fastener`), každá
 * polovina v jedné vrstvě, objímky podle obtisku. Klopa se řeže s rezervou a na délku se
 * seřízne přes skutečný obsah. Rozměry mincí ČNB (ověřeno 18. 10. 2026). Fyzicky NEOVĚŘENO.
 */
export const OBRAT_REVISION = 'R10';

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
  /** Horní hrana pásu = ohyb víčka. */
  bandTopY: number;
  /** Horní hrana předku mincí (ústí dutin). */
  coinMouthY: number;
  /** Svislé švy dutin (zleva): levý, dělicí, pravý. */
  cellSeams: readonly [number, number, number];
  /** Jazýček T3 vlevo od dutin pro patici B (lepí se celý na P). */
  coinTab: { left: number; bottomY: number };
  /** Víčko sahá od volného konce (x 0) po tuto souřadnici; dál je pás bez víčka (závěs). */
  lidEndX: number;
  /** O kolik je konec víčka u závěsu kratší na volné hraně víčka (šikmý konec, aby nedrhl při zavírání). */
  lidEndTaper: number;
  /** Spodní hrana zavřeného víčka. */
  lidBottomY: number;
  /** Přídavek víčka na ohyb přes předek mincí. */
  lidFoldAllowance: number;
  reliefHoleDiameter: number;
  /** Pás P je u volného konce delší o tento přídavek na vyboulení přes mince. */
  bandEndAllowance: number;
  /** Šířka lepeného pásu na okraji dílů (těla i T3); pás se ohýbá na jeho kraji. */
  glueBand: number;
  /** Klobouček druku (Prym Anorak 12 mm) a největší dovolená příruba patice. */
  snapCap: number;
  snapFlangeMax: number;
  hardwareGap: number;
  snapA: Point;
  snapB: Point;
  snapC: Point;
  /** Kryt K patice A (uvnitř kapsy u lepeného rohu) a větší kryt patice C. */
  coverRadius: number;
  coverRadiusC: number;
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
  bandTopY: 48,
  coinMouthY: 50,
  cellSeams: [24, 60, 96],
  coinTab: { left: 4, bottomY: 68 },
  lidEndX: 100.5,
  lidEndTaper: 2.5,
  lidBottomY: 68,
  lidFoldAllowance: 4,
  reliefHoleDiameter: 2,
  bandEndAllowance: 2,
  glueBand: 4,
  snapCap: 12,
  snapFlangeMax: 11,
  hardwareGap: 2,
  snapA: { x: 12, y: 77.25 },
  snapB: { x: 12, y: 58 },
  snapC: { x: 88, y: 25.5 },
  coverRadius: 6.5,
  coverRadiusC: 8.5,
  glueIntrusion: 0.5,
  cavityLoss: 1,
  handlingAllowance: 2,
  billFoldedThickness: 1.1,
};

/** Šířka lepeného pásu konce P na líci T2 a pravého boku těla (pás se ohýbá na jeho kraji). */
export const HINGE_GLUE = 6;
/** Lepený pás těla u levého boku a dna (užší, aby kryt K patice A nezasahoval do lepidla). */
export const BODY_GLUE = 5;

const round = (n: number): number => Math.round(n * 1000) / 1000;

export function fmt(v: number): string {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

/** Spodní hrana zavřené klopy v místě x (stoupá doprava). */
export function flapEdgeY(spec: ObratSpec, x: number): number {
  return spec.flapEndY - (spec.flapRise * x) / spec.width;
}

export function obratCells(spec: ObratSpec) {
  const [a, b, c] = spec.cellSeams;
  const usableDepth = round(
    spec.height - spec.seamOffset - spec.coinMouthY - spec.glueIntrusion - spec.cavityLoss,
  );
  return [
    [a, b],
    [b, c],
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
 * v lekci 4. Lepidlo, nit a vyklenutí nejsou zahrnuté; maximum peněženky se měří v lekci 10.
 */
export function obratLayerStacks(spec: ObratSpec, coins: readonly ObratCoin[]) {
  const l = spec.leather;
  const cards = 4 * CARD.thickness;
  const notes = spec.billFoldedThickness;
  const coinT = coins.reduce((s, id) => s + OBRAT_COINS[id].thickness, 0);
  return {
    /** záda, T2, víčko, T3, pás + obsah + mince */
    coinZone: { leatherLayers: 5, nominalMm: round(5 * l + cards + notes + coinT) },
    /** záda, T2, víčko, jazýček T3, pás + karty + bankovky + zapnutý B */
    snapB: { leatherLayers: 5, nominalMm: round(5 * l + cards + notes), snapHeightMm: null },
    /** záda, T2, kryt K, pás + karty + bankovky + zapnutý A */
    snapA: { leatherLayers: 4, nominalMm: round(4 * l + cards + notes), snapHeightMm: null },
    /** záda, T2, kryt K, klopa + bankovky (karty začínají níž) + zapnutý C */
    snapC: { leatherLayers: 4, nominalMm: round(4 * l + notes), snapHeightMm: null },
    /** pravý šev se závěsem pásu */
    hingeSeam: { leatherLayers: 3, nominalMm: round(3 * l) },
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
  id: 'T1' | 'T2' | 'P' | 'T3' | 'K' | 'KC';
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

/** U-šev těla (levý bok, dno, pravý bok); `dy` posune souřadnice zavřeného předku. */
function bodyUSeam(spec: ObratSpec, dy: number): string {
  const s = spec.seamOffset;
  const top = dy + spec.frontTopY + spec.seamEndGap;
  const yb = dy + spec.height - s;
  const r = Math.max(spec.bodyCornerR - s, 0.5);
  return roundedPolyline(
    [
      { x: s, y: top },
      { x: s, y: yb },
      { x: spec.width - s, y: yb },
      { x: spec.width - s, y: top },
    ],
    [r, r],
  );
}

/** Lepené pásy podél U-švu těla. */
function glueU(spec: ObratSpec, dy: number): string {
  const g = BODY_GLUE;
  const gr = HINGE_GLUE;
  const W = spec.width;
  const t = dy + spec.frontTopY;
  const yb = dy + spec.height;
  return `M0 ${n(t)} V${n(yb)} H${n(W)} V${n(t)} H${n(W - gr)} V${n(yb - g)} H${n(g)} V${n(t)} Z`;
}

/** Délka klopy od ohybu po volnou hranu po seříznutí (rozvinutá) v místě x. */
export function flapLength(spec: ObratSpec, x: number): number {
  return spec.flapFoldAllowance + flapEdgeY(spec, x);
}

/** Obrys T3 v souřadnicích zavřeného předku (jazýček vlevo nahoře). */
function coinFrontPoints(spec: ObratSpec): Point[] {
  const s = spec.seamOffset;
  const [c0, , c2] = spec.cellSeams;
  const tab = spec.coinTab;
  return [
    { x: tab.left, y: spec.coinMouthY },
    { x: c2 + s, y: spec.coinMouthY },
    { x: c2 + s, y: spec.height },
    { x: c0 - s, y: spec.height },
    { x: c0 - s, y: tab.bottomY },
    { x: tab.left, y: tab.bottomY },
  ];
}

export function obratParts(spec: ObratSpec): ObratPart[] {
  const W = spec.width;
  const H = spec.height;
  const s = spec.seamOffset;

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
      { d: glueU(spec, fold), kind: 'glue' },
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

  // T2 – LÍC nahoru, souřadnice zavřeného předku posunuté o frontTopY.
  const t = spec.frontTopY;
  const nb = spec.notch.bottomY - t;
  const N = spec.notch;
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
      { d: rect(W - HINGE_GLUE, spec.bandTopY - t, HINGE_GLUE, H - spec.bandTopY), kind: 'glue' },
      { d: bodyUSeam(spec, -t), kind: 'seam' },
    ],
    marks: [
      { x: spec.snapA.x, y: spec.snapA.y - t, kind: 'stud-hole', label: 'A – patice' },
      { x: spec.snapC.x, y: spec.snapC.y - t, kind: 'stud-hole', label: 'C – patice' },
    ],
    count: 1,
  };

  // P – RUB nahoru, rozložený doprava: u = W − x (závěs vlevo, volný konec vpravo).
  const lid = spec.lidBottomY - spec.bandTopY + spec.lidFoldAllowance;
  const bandH = H - spec.bandTopY;
  const slitU = W - spec.lidEndX;
  const u = (x: number) => W - x;
  const v = (y: number) => lid + y - spec.bandTopY;
  const [c0, c1, c2] = spec.cellSeams;
  const g = spec.glueBand;
  const t3 = coinFrontPoints(spec).map((p) => ({ x: u(p.x), y: v(p.y) }));
  const t3Left = u(c2 + s);
  const t3Right = u(spec.coinTab.left);
  const pEnd = W + spec.bandEndAllowance;
  const P: ObratPart = {
    id: 'P',
    name: 'Pás a víčko',
    face: 'rub',
    width: pEnd,
    height: lid + bandH,
    outline: roundedPolygon(
      [
        { x: 0, y: lid },
        { x: slitU, y: lid },
        { x: slitU + spec.lidEndTaper, y: 0 },
        { x: pEnd, y: 0 },
        { x: pEnd, y: lid + bandH },
        { x: 0, y: lid + bandH },
      ],
      [1, 0, spec.lidCornerR, spec.lidCornerR, spec.bodyCornerR, spec.bodyCornerR],
    ),
    lines: [
      { d: rect(0, lid, HINGE_GLUE, bandH), kind: 'glue', label: 'na T2' },
      // Lepidlo pod T3: pásy u boků a dna dutin + celý jazýček s paticí B.
      { d: rect(t3Left, v(spec.coinMouthY), g, bandH - 3), kind: 'glue' },
      { d: rect(t3Left, lid + bandH - g, u(c0 - s) - t3Left, g), kind: 'glue' },
      { d: rect(u(c0 - s) - g, v(spec.coinMouthY), g, bandH - 3), kind: 'glue' },
      {
        d: rect(
          u(c0 - s) - g,
          v(spec.coinMouthY),
          t3Right - u(c0 - s) + g,
          spec.coinTab.bottomY - spec.coinMouthY,
        ),
        kind: 'glue',
        label: 'jazýček B',
      },
      { d: `M${n(slitU)} ${n(lid)} H${n(pEnd)}`, kind: 'fold', label: 'ohyb víčka' },
      {
        d: `M${n(s)} ${n(v(spec.bandTopY + spec.seamEndGap))} V${n(v(H - s))}`,
        kind: 'seam',
        label: 'závěs = pravý šev těla',
      },
      {
        d: `M${t3.map((p) => `${n(p.x)} ${n(p.y)}`).join(' L')} Z`,
        kind: 'position',
        label: 'T3',
      },
    ],
    marks: [
      {
        x: slitU,
        y: lid - spec.reliefHoleDiameter / 2,
        kind: 'relief-hole',
        label: 'odlehčení',
      },
    ],
    count: 1,
  };

  // T3 – LÍC nahoru, stejné otočení jako P (u). Jazýček vpravo nahoře.
  const t3W = t3Right - t3Left;
  const t3H = H - spec.coinMouthY;
  const lx = (x: number) => u(x) - t3Left;
  const ly = (y: number) => y - spec.coinMouthY;
  const seamTop = spec.seamEndGap;
  const T3: ObratPart = {
    id: 'T3',
    name: 'Předek mincí',
    face: 'líc',
    width: t3W,
    height: t3H,
    outline: roundedPolygon(
      coinFrontPoints(spec).map((p) => ({ x: lx(p.x), y: ly(p.y) })),
      [1, 1, 2, 2, 2, 2],
    ),
    lines: [
      {
        d: `M${n(lx(c2))} ${n(seamTop)} V${n(ly(H - s))} H${n(lx(c0))} V${n(seamTop)}`,
        kind: 'seam',
      },
      { d: `M${n(lx(c1))} ${n(seamTop)} V${n(ly(H - s))}`, kind: 'seam' },
    ],
    marks: [{ x: lx(spec.snapB.x), y: ly(spec.snapB.y), kind: 'stud-hole', label: 'B – patice' }],
    count: 1,
  };

  const K: ObratPart = {
    id: 'K',
    name: 'Kryt patice A',
    face: 'rub',
    width: 2 * spec.coverRadius,
    height: 2 * spec.coverRadius,
    outline: circlePath(spec.coverRadius, spec.coverRadius, spec.coverRadius),
    lines: [],
    marks: [],
    count: 1,
  };
  const KC: ObratPart = {
    id: 'KC',
    name: 'Kryt patice C',
    face: 'rub',
    width: 2 * spec.coverRadiusC,
    height: 2 * spec.coverRadiusC,
    outline: circlePath(spec.coverRadiusC, spec.coverRadiusC, spec.coverRadiusC),
    lines: [],
    marks: [],
    count: 1,
  };
  return [T1, T2, P, T3, K, KC];
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${n(cx - r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)} Z`;
}

/**
 * Pracovní odhad, o kolik se volný konec pásu přitáhne k závěsu, když pás přechází přes vyboulení:
 * u závěsu vystoupá o T3 + víčko + mince na předpokládaném vodorovném úseku 6 mm (přímka, ne
 * mechanika ohybu). Úsek 6 mm není změřený; skutečný konec pásu změří papírový model (lekce 5)
 * a rozhodne kožený kus.
 */
export function obratBandRetraction(spec: ObratSpec, coins: readonly ObratCoin[]): number {
  const rise = 2 * spec.leather + coins.reduce((sum, id) => sum + OBRAT_COINS[id].thickness, 0);
  const run = 6;
  return round(Math.hypot(run, rise) - run);
}

/** Rozložení dílů na jednu A4 kůže (210 × 297, mezera 4 mm). */
export function obratLeatherLayout(spec: ObratSpec) {
  const parts = obratParts(spec);
  const by = Object.fromEntries(parts.map((p) => [p.id, p])) as Record<ObratPart['id'], ObratPart>;
  const gap = 4;
  const sheet = { width: 210, height: 297 };
  const column = by.T1.height + by.T2.height + by.P.height + 2 * gap;
  const side = sheet.width - Math.max(by.T1.width, by.T2.width, by.P.width) - gap;
  // T3 na výšku (40 mm široký) vedle sloupce, pod ním kryty.
  const fits =
    column <= sheet.height &&
    by.T3.height <= side &&
    by.T3.width + gap + by.K.height + gap + by.KC.height + gap <= sheet.height;
  return { sheet, gap, columnHeight: round(column), sideWidth: round(side), fits };
}

// ---------------------------------------------------------------------------------------------

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
  const s = spec.seamOffset;
  const r = spec.snapCap / 2;
  const fl = spec.snapFlangeMax / 2;
  const g = spec.hardwareGap;
  const W = spec.width;
  const H = spec.height;
  if (spec.measuredLeatherMax < spec.leather)
    e.push('Změřené maximum usně je menší než jmenovitá tloušťka.');
  if (spec.coverRadius < fl + 1) e.push('Kryt K nepřekryje přírubu patice o 1 mm.');
  if (Math.abs(spec.glueBand - s - spec.glueIntrusion) > 0.01)
    e.push('Lepený pás T3 nesouhlasí s průnikem lepidla do dutin.');

  // Hlavní kapsa
  if (W - 2 * s < NOTE_FOLDED.width + 4) e.push('Kapsa nemá šířkovou rezervu 4 mm pro bankovky.');
  if (W - 2 * s < CARD.width + 4) e.push('Kapsa nemá šířkovou rezervu 4 mm pro karty.');
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
  if (spec.bandTopY - spec.flapEndY < 6) e.push('Mezi klopou a pásem chybí 6 mm.');
  const c = spec.snapC;
  if (c.y - r < spec.frontTopY + g) e.push('C je moc blízko horní hrany přední stěny.');
  if (c.x - r < spec.notch.end + g) e.push('C zasahuje do výkusu.');
  if (c.x + spec.coverRadiusC > W - HINGE_GLUE) e.push('Kryt C zasahuje do lepeného pásu.');
  if (c.x - spec.coverRadiusC < spec.notch.end + 1) e.push('Kryt C zasahuje do výkusu.');
  if (c.y - spec.coverRadiusC < spec.frontTopY + 1)
    e.push('Kryt C přečnívá horní hranu přední stěny.');
  if (c.y + r + g > flapEdgeY(spec, c.x) - s) e.push('C nemá rezervu od švu klopy.');

  // A na volném konci pásu
  const a = spec.snapA;
  if (a.x - r < s) e.push('A přečnívá levý okraj.');
  const shrinkEmpty = obratBandRetraction(spec, []);
  const shrinkFull = Math.max(
    ...OBRAT_TEST_SETS.flatMap((set) => set.cells.map((c) => obratBandRetraction(spec, c))),
  );
  if (spec.bandEndAllowance - shrinkEmpty > 2) e.push('Prázdný pás přečnívá tělo o víc než 2 mm.');
  if (shrinkFull - spec.bandEndAllowance > 2) e.push('Plný pás nedosáhne do 2 mm od levé hrany.');
  if (a.x - r - (shrinkFull - spec.bandEndAllowance) < 2)
    e.push('Objímka A je u plného pásu blíž než 2 mm k jeho konci.');
  if (a.x + r + g > spec.cellSeams[0] - s) e.push('A zasahuje do předku mincí.');
  if (a.y - r < Math.max(spec.lidBottomY, spec.coinTab.bottomY) + g)
    e.push('A koliduje s víčkem nebo jazýčkem.');
  if (a.y + spec.coverRadius > H - BODY_GLUE) e.push('Kryt A zasahuje do lepeného pásu dna.');
  if (a.x - spec.coverRadius < BODY_GLUE) e.push('Kryt A zasahuje do lepeného pásu boku.');

  // B v jazýčku T3 na volném konci
  const b = spec.snapB;
  const tab = spec.coinTab;
  if (b.x - r < tab.left + g / 2) e.push('B přečnívá jazýček vlevo.');
  if (b.x + r + g > spec.cellSeams[0] - s / 2) e.push('B zasahuje k levému švu dutin.');
  if (b.x - fl < tab.left + 1 || b.y + fl > tab.bottomY - 1)
    e.push('Příruba patice B není celá pod jazýčkem.');
  if (b.y - r < spec.coinMouthY + g) e.push('B je moc blízko horní hrany jazýčku.');
  if (b.y + r + 3 > spec.lidBottomY) e.push('Víčko nepřesahuje objímku B o 3 mm.');
  if (spec.lidBottomY - spec.coinMouthY < 12) e.push('Víčko nepřekrývá ústí alespoň o 12 mm.');

  // Závěs pásu: ohýbá se na kraji lepeného pásu
  const flex = W - HINGE_GLUE;
  if (spec.lidEndX > flex - 1) e.push('Víčko zasahuje do ohybu závěsu.');
  if (spec.lidEndX < spec.cellSeams[2] + s + 0.5) e.push('Víčko nepřekrývá pravý okraj T3.');
  if (spec.lidEndX - spec.lidEndTaper < spec.cellSeams[2] + 1.5)
    e.push('Šikmý konec víčka nekryje pravý šev dutin.');
  if (spec.cellSeams[2] + s > flex - 2) e.push('Předek mincí je moc blízko ohybu závěsu.');

  for (const cell of obratCells(spec))
    if (cell.usableWidth <= 0 || cell.usableDepth <= 0) e.push('Dutina nemá kladný prostor.');
  for (const set of OBRAT_TEST_SETS)
    set.cells.forEach((stack, i) => {
      if (!obratCoinFit(spec, i, stack).passesEnvelope)
        e.push(`Zkušební skladba „${set.label}“ neprojde obálkou.`);
    });
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
    cells: obratCells(spec),
    testSets: OBRAT_TEST_SETS.map((s) => ({
      ...s,
      fits: s.cells.map((stack, i) => obratCoinFit(spec, i, stack)),
    })),
    capacity: {
      threeCoins: { total: three.length, pass: three.filter((r) => r.split).length },
      fourCoins: { total: four.length, pass: four.filter((r) => r.split).length },
      fourWith50: four.filter((r) => r.coins.includes('50')).every((r) => !r.split)
        ? 'žádná čtveřice s 50 Kč (nejvýš 2 mince v dutině)'
        : 'některé projdou',
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
      'retence mincí pod ohnutým víčkem s B na volném konci, i při otevřeném A (lekce 6)',
      'lepený jazýček B při opakovaném rozepínání (lekce 6)',
      'ohyb závěsu pásu a víčka v konkrétní usni (lekce 3 a 8)',
      'skutečná tloušťka a nošení (lekce 10)',
    ],
  };
}
