import { type TemplateDefinition } from '@/content/schema';
import { piecePath } from '@/lib/geometry/piece-path';
import { prickPoints, stitchLinePath, templateMarks } from '@/lib/geometry/template-marks';

export interface TemplateIllustrationProps {
  template: TemplateDefinition;
  title: string;
  /** `preview` = přizpůsobí se šířce; `print` = fyzické milimetry pro tisk 1:1. */
  mode?: 'preview' | 'print';
  /** Legenda uvnitř SVG – v náhledu je na mobilu nečitelná, proto ji stránka kreslí jako HTML. */
  legend?: boolean;
}

/** Texty legendy, sdílené s HTML legendou náhledu na stránce projektu. */
export const TEMPLATE_LEGEND = {
  outline: 'plná čára = obrys dílu, řežte podle ní',
  stitch: 'čárkovaná = linie stehu, neřezat ani nerýsovat',
  glue: 'tečkovaná = okraj lepeného pásu na zadním dílu (lekce 6)',
  tick: 'čárka u výřezu = konec řezu, dno na oblouku, nepropichovat',
  prick: 'kroužek na tečkované = propíchněte šídlem na líc (lekce 6)',
  punch: 'kroužek na čárkované = začátek a konec řady (lekce 6)',
} as const;

const PRICK_R = 0.7;
const GLUE_STROKE = '#6B5F57';
const STITCH_STROKE = '#A85F32';

/**
 * Bezpečný okraj tiskové stránky šablony (`@page margin`): HP DeskJet 2700 netiskne 12,7 mm
 * u spodní hrany A4 na výšku, proto nic nesmí ležet blíž než 13 mm k žádné hraně papíru.
 */
export const TEMPLATE_PRINT_MARGIN_MM = 13;

/** Text šablony v milimetrech (levý okraj `x`, účaří `y`). */
export interface TemplateSheetText {
  key: string;
  x: number;
  y: number;
  sizeMm: number;
  font: 'sans' | 'mono';
  bold?: boolean;
  fill: string;
  text: string;
}

/** Obdélník, který zabírá nakreslený prvek (bez textů). */
export interface TemplateSheetBox {
  what: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const FONT = {
  sans: 'Albert Sans, system-ui, sans-serif',
  mono: 'ui-monospace, Menlo, monospace',
} as const;
const MUTED = '#6B5F57';
const INK = '#2B211C';

/**
 * Rozložení šablony: rozměr SVG, umístění dílů, všechny texty a plochy značek, legendy a kontrolní
 * úsečky. Z toho kreslí `TemplateIllustration` a test hlídá, že nic nepřesahuje SVG ani tiskovou
 * stránku s okrajem `TEMPLATE_PRINT_MARGIN_MM`.
 */
export function templateSheetLayout(template: TemplateDefinition, legend: boolean) {
  const gap = 10;
  const margin = 12;
  const pieces = template.pieces;
  const contentWidth = Math.max(...pieces.map((p) => p.widthMm));
  const contentHeight = pieces.reduce((s, p) => s + p.heightMm, 0) + gap * (pieces.length - 1);
  const width = contentWidth + margin * 2;
  const height = contentHeight + margin * 2 + 54;

  const placed = pieces.map((p, index) => ({
    ...p,
    x: margin,
    y: margin + pieces.slice(0, index).reduce((sum, prev) => sum + prev.heightMm + gap, 0),
    // Popisky nesmí ležet v místě výřezu ani přes značku výšky, jinak text prochází čarou.
    labelOffset: p.thumbCutout
      ? p.thumbCutout.depthMm
      : p.heightMark
        ? p.heightMm - p.heightMark.fromBottomMm + 3
        : 0,
    // Lepený pás leží na dílu pod kapsou; popisky začínají až za jeho tečkovanou čarou.
    glueBand: p.openEdge === 'top' && p.stitchUpToMm ? template.glueBandMm : undefined,
  }));

  const texts: TemplateSheetText[] = [];
  const boxes: TemplateSheetBox[] = [];
  for (const p of placed) {
    // Popisky začínají 2,5 mm za vnitřní čárou (lepený pás nebo linie stehu), ne na ní.
    const x = p.x + (p.glueBand ?? p.stitchOffsetMm) + 2.5;
    const y = p.y + p.labelOffset;
    const note = (dy: number, text: string) =>
      texts.push({
        key: `${p.id}-${dy}`,
        x,
        y: y + dy,
        sizeMm: 2.6,
        font: 'mono',
        fill: MUTED,
        text,
      });
    texts.push({
      key: `${p.id}-name`,
      x,
      y: y + 6,
      sizeMm: 3.2,
      font: 'sans',
      bold: true,
      fill: INK,
      text: p.name,
    });
    note(
      10.5,
      `${mm(p.widthMm)} × ${mm(p.heightMm)} mm · ${p.quantity}× · steh ${mm(p.stitchOffsetMm)} mm od hrany` +
        (p.openEdge === 'top' && !p.stitchUpToMm ? ' · vrch bez stehu' : ''),
    );
    if (p.stitchUpToMm) {
      note(14.5, `vrch bez stehu, boky šité jen pod kapsou (výška ${mm(p.stitchUpToMm)} mm)`);
    }
    if (p.heightMark) {
      note(18.5, `čárky na bocích = horní hrana kapsy (${mm(p.heightMark.fromBottomMm)} mm)`);
    }
    if (p.glueBand) note(22.5, `lepený pás ${mm(p.glueBand)} mm: zdrsnit jen pod horní kroužky`);
    if (p.thumbCutout) {
      note(14.5, `výřez na palec ${mm(p.thumbCutout.widthMm)} × ${mm(p.thumbCutout.depthMm)} mm`);
    }
    if (p.openEdge === 'top' && !p.stitchUpToMm) {
      note(18.5, 'děrujte skrz papír přilepený na líci (lekce 6)');
    }
    boxes.push({ what: p.name, x0: p.x, y0: p.y, x1: p.x + p.widthMm, y1: p.y + p.heightMm });
    for (const m of templateMarks(p)) {
      boxes.push({
        what: `${p.name}: ${m.kind}`,
        x0: Math.min(m.x1, m.x2),
        y0: Math.min(m.y1, m.y2),
        x1: Math.max(m.x1, m.x2),
        y1: Math.max(m.y1, m.y2),
      });
    }
  }

  const legendOrigin = { x: margin, y: height - 46 };
  if (legend) {
    const rows: [keyof typeof TEMPLATE_LEGEND, number, string][] = [
      ['outline', 1, INK],
      ['stitch', 6, '#7E4423'],
      ['glue', 11, GLUE_STROKE],
      ['tick', 16, INK],
      ['prick', 21, INK],
      ['punch', 26, '#7E4423'],
    ];
    for (const [id, dy, fill] of rows) {
      texts.push({
        key: `legend-${id}`,
        x: legendOrigin.x + 10,
        y: legendOrigin.y + dy,
        sizeMm: 2.6,
        font: 'mono',
        fill,
        text: TEMPLATE_LEGEND[id],
      });
    }
    boxes.push({
      what: 'značky legendy',
      x0: legendOrigin.x,
      y0: legendOrigin.y - 0.2,
      x1: legendOrigin.x + 8,
      y1: legendOrigin.y + 25 + PRICK_R + 0.1,
    });
  }

  const calibration = { x: margin, y: height - 14 };
  boxes.push({
    what: 'kontrolní úsečka',
    x0: calibration.x - 0.25,
    y0: calibration.y - 2,
    x1: calibration.x + template.calibrationMm + 0.25,
    y1: calibration.y + 2,
  });
  texts.push(
    {
      key: 'calibration',
      x: calibration.x,
      y: calibration.y + 6,
      sizeMm: 2.8,
      font: 'mono',
      fill: INK,
      text: `kontrolní úsečka ${template.calibrationMm} mm`,
    },
    {
      key: 'stitching',
      x: calibration.x + contentWidth - 58,
      y: calibration.y + 6,
      sizeMm: 2.8,
      font: 'mono',
      fill: MUTED,
      text: `${template.stitchSpacingLabel} · ${template.threadLabel}`,
    },
  );

  return { width, height, contentWidth, placed, texts, boxes, legendOrigin, calibration };
}

/**
 * Šablona 1:1 vykreslená v milimetrech. V režimu print má SVG rozměr přímo v `mm`,
 * takže při tisku na 100 % odpovídá skutečné velikosti. Kontrolní úsečka slouží k ověření.
 */
export function TemplateIllustration({
  template,
  title,
  mode = 'preview',
  legend = mode === 'print',
}: TemplateIllustrationProps) {
  const { width, height, placed, texts, legendOrigin, calibration } = templateSheetLayout(
    template,
    legend,
  );

  const sizeProps =
    mode === 'print'
      ? { width: `${width}mm`, height: `${height}mm`, style: { breakInside: 'avoid' as const } }
      : { className: 'h-auto w-full' };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} {...sizeProps}>
      <rect width={width} height={height} fill={mode === 'print' ? '#FFFFFF' : '#F4EFE6'} />
      {placed.map((p) => (
        <g key={p.id}>
          <path
            d={piecePath({
              x: p.x,
              y: p.y,
              widthMm: p.widthMm,
              heightMm: p.heightMm,
              cornerRadiusMm: p.cornerRadiusMm,
              thumbCutout: p.thumbCutout,
            })}
            fill="#FBF8F2"
            stroke="#2B211C"
            strokeWidth={0.4}
          />
          <path
            d={stitchLinePath({
              x: p.x,
              y: p.y,
              widthMm: p.widthMm,
              heightMm: p.heightMm,
              cornerRadiusMm: p.cornerRadiusMm,
              offsetMm: p.stitchOffsetMm,
              openTop: p.openEdge === 'top',
              upToMm: p.stitchUpToMm,
            })}
            fill="none"
            stroke="#A85F32"
            strokeWidth={0.3}
            strokeDasharray="1.2 0.8"
          />
          {p.glueBand ? (
            <path
              data-mark="glue-band"
              d={stitchLinePath({
                x: p.x,
                y: p.y,
                widthMm: p.widthMm,
                heightMm: p.heightMm,
                cornerRadiusMm: p.cornerRadiusMm,
                offsetMm: p.glueBand,
                openTop: true,
                upToMm: p.stitchUpToMm,
              })}
              fill="none"
              stroke={GLUE_STROKE}
              strokeWidth={0.35}
              strokeDasharray="0.1 0.9"
              strokeLinecap="round"
            />
          ) : null}
          {prickPoints(p, p.glueBand).map((pt) => (
            <circle
              key={`${pt.kind}-${pt.x}-${pt.y}`}
              data-mark={pt.kind}
              cx={pt.x}
              cy={pt.y}
              r={PRICK_R}
              fill="none"
              stroke={pt.kind.startsWith('stitch') ? STITCH_STROKE : '#2B211C'}
              strokeWidth={0.2}
            />
          ))}
          {templateMarks(p).map((m) => (
            <path
              key={`${m.kind}-${m.x1}-${m.y1}`}
              data-mark={m.kind}
              d={`M${m.x1} ${m.y1} L${m.x2} ${m.y2}`}
              stroke="#2B211C"
              strokeWidth={0.35}
            />
          ))}
        </g>
      ))}
      {texts.map((t) => (
        <text
          key={t.key}
          x={t.x}
          y={t.y}
          fontFamily={FONT[t.font]}
          fontSize={t.sizeMm}
          fill={t.fill}
          fontWeight={t.bold ? 600 : undefined}
        >
          {t.text}
        </text>
      ))}
      {/* legenda */}
      {legend ? (
        <g transform={`translate(${legendOrigin.x} ${legendOrigin.y})`}>
          <path d="M0 0 L8 0" stroke="#2B211C" strokeWidth={0.4} />
          <path d="M0 5 L8 5" stroke="#A85F32" strokeWidth={0.3} strokeDasharray="1.2 0.8" />
          <path
            d="M0 10 L8 10"
            stroke={GLUE_STROKE}
            strokeWidth={0.35}
            strokeDasharray="0.1 0.9"
            strokeLinecap="round"
          />
          <path d="M4 13 L4 17" stroke="#2B211C" strokeWidth={0.35} />
          <circle cx={4} cy={20} r={PRICK_R} fill="none" stroke="#2B211C" strokeWidth={0.2} />
          <circle cx={4} cy={25} r={PRICK_R} fill="none" stroke={STITCH_STROKE} strokeWidth={0.2} />
        </g>
      ) : null}
      {/* kontrolní úsečka */}
      <g transform={`translate(${calibration.x} ${calibration.y})`}>
        <path d={`M0 0 L${template.calibrationMm} 0`} stroke="#2B211C" strokeWidth={0.5} />
        <path d="M0 -2 L0 2" stroke="#2B211C" strokeWidth={0.5} />
        <path
          d={`M${template.calibrationMm} -2 L${template.calibrationMm} 2`}
          stroke="#2B211C"
          strokeWidth={0.5}
        />
      </g>
    </svg>
  );
}

const mm = (value: number) => value.toLocaleString('cs-CZ');
