/**
 * Linie stehu a značky na obdélníkové šabloně (projekt 01). Čisté funkce
 * v milimetrech, kreslí je `TemplateIllustration`; testy hlídají přesné souřadnice.
 */
import { type ThumbCutout } from '@/lib/geometry/piece-path';

export interface StitchLineInput {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  /** Vzdálenost linie stehu od hrany. */
  offsetMm: number;
  /** Horní hrana bez stehu (otvor kapsy). */
  openTop: boolean;
  /**
   * Výška otevřeného dílu nad tímto, např. přední kapsy na zadním dílu: boky končí stejně
   * jako na něm, pod zaoblením jeho horního rohu.
   */
  upToMm?: number | undefined;
}

/**
 * Linie stehu ve stálé vzdálenosti od hrany, i v zaoblených rozích: roh linie má poloměr
 * `cornerRadiusMm − offsetMm` se stejným středem jako roh dílu. Průsečík rovných linií by
 * v rohu R6 ležel jen asi 2,5 mm od hrany místo 3,5 mm. U otevřeného vrchu začíná linie tam,
 * kde je bok pod zaoblením horního rohu (dílu, nebo kapsy výšky `upToMm`) už rovný.
 */
export function stitchLinePath({
  x,
  y,
  widthMm: w,
  heightMm: h,
  cornerRadiusMm,
  offsetMm: o,
  openTop,
  upToMm,
}: StitchLineInput): string {
  const r = Math.min(cornerRadiusMm, w / 2, h / 2);
  const ri = Math.max(r - o, 0);
  const left = x + o;
  const right = x + w - o;
  const top = y + o;
  const bottom = y + h - o;
  const arc = (toX: number, toY: number) =>
    ri > 0 ? [`A${round(ri)} ${round(ri)} 0 0 0 ${round(toX)} ${round(toY)}`] : [];

  const bottomPart = [
    `L${round(left)} ${round(bottom - ri)}`,
    ...arc(left + ri, bottom),
    `L${round(right - ri)} ${round(bottom)}`,
    ...arc(right, bottom - ri),
  ];

  if (openTop) {
    const sideTop = (upToMm ? y + h - upToMm : y) + Math.max(r, o);
    return [
      `M${round(left)} ${round(sideTop)}`,
      ...bottomPart,
      `L${round(right)} ${round(sideTop)}`,
    ].join(' ');
  }
  return [
    `M${round(left)} ${round(top + ri)}`,
    ...bottomPart,
    `L${round(right)} ${round(top + ri)}`,
    ...arc(right - ri, top),
    `L${round(left + ri)} ${round(top)}`,
    ...arc(left, top + ri),
    'Z',
  ].join(' ');
}

export interface MarkInput {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  thumbCutout?: ThumbCutout | undefined;
  /** Značka výšky (např. horní hrany kapsy) na obou bocích, krátká čárka dovnitř dílu. */
  heightMark?: { fromBottomMm: number; lengthMm: number } | undefined;
}

/**
 * Úsečka značky, `x1 y1` leží na obrysu. Nic z toho se nepropichuje (vpich na čáře řezu by v hraně
 * nechal zoubek): konce výřezu ukazují, kam až vede rovný řez horní hrany, dno výřezu, kam dát
 * jeden roh mezi řezy (lekce 5), výška kapsy je orientační čárka horní hrany kapsy.
 */
export interface TemplateMark {
  kind: 'thumb-cutout-end' | 'thumb-cutout-bottom' | 'height';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Délka čárky u konců výřezu, vede nad horní hranu do okraje papíru. */
export const CUTOUT_TICK_MM = 3;

/**
 * Čárky jen na papíře: konce oblouku výřezu na palec (svislá čárka nad horní hranou do okraje
 * papíru, stejné místo jako v `piecePath`), dno oblouku (čárka nahoru do výřezu) a výška kapsy na
 * obou bocích (vodorovná čárka dovnitř).
 */
export function templateMarks({
  x,
  y,
  widthMm: w,
  heightMm: h,
  cornerRadiusMm,
  thumbCutout,
  heightMark,
}: MarkInput): TemplateMark[] {
  const marks: TemplateMark[] = [];
  const r = Math.min(cornerRadiusMm, w / 2, h / 2);
  if (thumbCutout && thumbCutout.widthMm > 0 && thumbCutout.depthMm > 0) {
    const cw = Math.min(thumbCutout.widthMm, w - 2 * r);
    const start = x + (w - cw) / 2;
    for (const cx of [start, start + cw]) {
      marks.push({
        kind: 'thumb-cutout-end',
        x1: round(cx),
        y1: round(y),
        x2: round(cx),
        y2: round(y - CUTOUT_TICK_MM),
      });
    }
    // Dno oblouku (vrchol křivky v `piecePath`): čárka vede nahoru do odpadu výřezu.
    const bottom = y + thumbCutout.depthMm;
    marks.push({
      kind: 'thumb-cutout-bottom',
      x1: round(x + w / 2),
      y1: round(bottom),
      x2: round(x + w / 2),
      y2: round(bottom - CUTOUT_TICK_MM),
    });
  }
  if (heightMark) {
    const my = round(y + h - heightMark.fromBottomMm);
    marks.push(
      { kind: 'height', x1: round(x), y1: my, x2: round(x + heightMark.lengthMm), y2: my },
      {
        kind: 'height',
        x1: round(x + w),
        y1: my,
        x2: round(x + w - heightMark.lengthMm),
        y2: my,
      },
    );
  }
  return marks;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Kroužek na šabloně (lekce 6). `glue-*` na hranici lepeného pásu zadního dílu se propichuje šídlem
 * na líc, kapsa ho zakryje. `stitch-*` na linii stehu přední kapsy se nepropichuje: je to cíl pro
 * vidličky při děrování skrz papír přilepený na líci (vpich mimo otvor by zůstal vidět).
 * `*-end` = horní konec boku, `*-corner` = bod v zaobleném spodním rohu.
 */
export interface PrickPoint {
  kind: 'stitch-end' | 'stitch-corner' | 'glue-end' | 'glue-corner';
  x: number;
  y: number;
}

/**
 * Body na otevřené linii odsazené o `offsetMm` (stejná geometrie jako `stitchLinePath`): horní
 * konce obou boků a v každém spodním rohu začátek, střed a konec oblouku. Je-li oblouk kratší
 * než 2 mm poloměru, jen jeho střed (body by splynuly). Ostrý roh = jeden bod v rohu linie.
 */
export function openLinePoints({
  x,
  y,
  widthMm: w,
  heightMm: h,
  cornerRadiusMm,
  offsetMm: o,
  upToMm,
}: Omit<StitchLineInput, 'openTop'>): { ends: [number, number][]; corners: [number, number][] } {
  const r = Math.min(cornerRadiusMm, w / 2, h / 2);
  const ri = Math.max(r - o, 0);
  const left = x + o;
  const right = x + w - o;
  const bottom = y + h - o;
  const sideTop = (upToMm ? y + h - upToMm : y) + Math.max(r, o);
  const ends: [number, number][] = [
    [left, sideTop],
    [right, sideTop],
  ];
  const d = ri * Math.SQRT1_2;
  const corners: [number, number][] = [];
  if (ri === 0) {
    corners.push([left, bottom], [right, bottom]);
  } else {
    const cy = bottom - ri;
    const lcx = left + ri;
    const rcx = right - ri;
    const full = ri >= 2;
    if (full) corners.push([left, cy]);
    corners.push([lcx - d, cy + d]);
    if (full) corners.push([lcx, bottom], [rcx, bottom]);
    corners.push([rcx + d, cy + d]);
    if (full) corners.push([right, cy]);
  }
  const rp = ([px, py]: [number, number]): [number, number] => [round(px), round(py)];
  return { ends: ends.map(rp), corners: corners.map(rp) };
}

export interface PrickInput {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  stitchOffsetMm: number;
  openEdge: 'top' | 'none';
  stitchUpToMm?: number | undefined;
}

/**
 * Kroužky pro lekci 6, jen u dílů s otevřeným vrchem. Díl, na kterém leží kapsa (`stitchUpToMm`),
 * nese hranici lepeného pásu `glueBandMm` k propíchnutí: konce na bocích (konec zdrsnění pod
 * zaoblením rohu kapsy) a rohy. Kapsa sama nese body linie stehu pro děrování skrz papír: horní
 * konce (první a poslední otvor) a v rozích tři body oblouku.
 */
export function prickPoints(p: PrickInput, glueBandMm?: number): PrickPoint[] {
  if (p.openEdge !== 'top') return [];
  const base = {
    x: p.x,
    y: p.y,
    widthMm: p.widthMm,
    heightMm: p.heightMm,
    cornerRadiusMm: p.cornerRadiusMm,
    upToMm: p.stitchUpToMm,
  };
  const toPoints = (
    { ends, corners }: ReturnType<typeof openLinePoints>,
    end: PrickPoint['kind'],
    corner: PrickPoint['kind'],
  ): PrickPoint[] => [
    ...ends.map(([px, py]) => ({ kind: end, x: px, y: py })),
    ...corners.map(([px, py]) => ({ kind: corner, x: px, y: py })),
  ];
  if (p.stitchUpToMm) {
    if (!glueBandMm) return [];
    return toPoints(openLinePoints({ ...base, offsetMm: glueBandMm }), 'glue-end', 'glue-corner');
  }
  return toPoints(
    openLinePoints({ ...base, offsetMm: p.stitchOffsetMm }),
    'stitch-end',
    'stitch-corner',
  );
}
