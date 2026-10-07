/**
 * Linie stehu a značky k propíchnutí na obdélníkové šabloně (projekt 01). Čisté funkce
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
 * Úsečka značky, `x1 y1` leží na obrysu. Konec výřezu se propichuje na obrysu, výška kapsy
 * těsně pod vnitřním koncem `x2 y2` (lekce 6), kde ji kapsa zakryje i u zaobleného rohu.
 */
export interface TemplateMark {
  kind: 'thumb-cutout-end' | 'height';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Délka čárky u konců výřezu, vede nad horní hranu do okraje papíru. */
export const CUTOUT_TICK_MM = 3;

/**
 * Značky k propíchnutí šídlem: konce oblouku výřezu na palec (svislá čárka nad horní hranou,
 * stejné místo jako v `piecePath`) a výška kapsy na obou bocích (vodorovná čárka dovnitř).
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
