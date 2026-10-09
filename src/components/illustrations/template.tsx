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
 * Šablona 1:1 vykreslená v milimetrech. V režimu print má SVG rozměr přímo v `mm`,
 * takže při tisku na 100 % odpovídá skutečné velikosti. Kontrolní úsečka slouží k ověření.
 */
export function TemplateIllustration({
  template,
  title,
  mode = 'preview',
  legend = mode === 'print',
}: TemplateIllustrationProps) {
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
  // Popisky začínají 2,5 mm za vnitřní čárou (lepený pás nebo linie stehu), ne na ní.
  const textX = (p: (typeof placed)[number]) => p.x + (p.glueBand ?? p.stitchOffsetMm) + 2.5;

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
          <text
            x={textX(p)}
            y={p.y + 6 + p.labelOffset}
            fontFamily="Albert Sans, system-ui, sans-serif"
            fontSize={3.2}
            fill="#2B211C"
            fontWeight={600}
          >
            {p.name}
          </text>
          <text
            x={textX(p)}
            y={p.y + 10.5 + p.labelOffset}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={2.6}
            fill="#6B5F57"
          >
            {mm(p.widthMm)} × {mm(p.heightMm)} mm · {p.quantity}× · steh {mm(p.stitchOffsetMm)} mm
            od hrany
            {p.openEdge === 'top' && !p.stitchUpToMm ? ' · vrch bez stehu' : ''}
          </text>
          {p.stitchUpToMm ? (
            <text
              x={textX(p)}
              y={p.y + 14.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              vrch bez stehu, boky šité jen pod kapsou (výška {mm(p.stitchUpToMm)} mm)
            </text>
          ) : null}
          {p.heightMark ? (
            <text
              x={textX(p)}
              y={p.y + 18.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              čárky na bocích = horní hrana kapsy ({mm(p.heightMark.fromBottomMm)} mm)
            </text>
          ) : null}
          {p.glueBand ? (
            <text
              x={textX(p)}
              y={p.y + 22.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              lepený pás {mm(p.glueBand)} mm: zdrsnit jen pod horní kroužky
            </text>
          ) : null}
          {p.thumbCutout ? (
            <text
              x={textX(p)}
              y={p.y + 14.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              výřez na palec {mm(p.thumbCutout.widthMm)} × {mm(p.thumbCutout.depthMm)} mm
            </text>
          ) : null}
          {p.openEdge === 'top' && !p.stitchUpToMm ? (
            <text
              x={textX(p)}
              y={p.y + 18.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              děrujte skrz papír přilepený na líci (lekce 6)
            </text>
          ) : null}
        </g>
      ))}
      {/* legenda */}
      {legend ? (
        <g transform={`translate(${margin} ${height - 46})`}>
          <path d="M0 0 L8 0" stroke="#2B211C" strokeWidth={0.4} />
          <LegendText y={1} fill="#2B211C">
            {TEMPLATE_LEGEND.outline}
          </LegendText>
          <path d="M0 5 L8 5" stroke="#A85F32" strokeWidth={0.3} strokeDasharray="1.2 0.8" />
          <LegendText y={6} fill="#7E4423">
            {TEMPLATE_LEGEND.stitch}
          </LegendText>
          <path
            d="M0 10 L8 10"
            stroke={GLUE_STROKE}
            strokeWidth={0.35}
            strokeDasharray="0.1 0.9"
            strokeLinecap="round"
          />
          <LegendText y={11} fill={GLUE_STROKE}>
            {TEMPLATE_LEGEND.glue}
          </LegendText>
          <path d="M4 13 L4 17" stroke="#2B211C" strokeWidth={0.35} />
          <LegendText y={16} fill="#2B211C">
            {TEMPLATE_LEGEND.tick}
          </LegendText>
          <circle cx={4} cy={20} r={PRICK_R} fill="none" stroke="#2B211C" strokeWidth={0.2} />
          <LegendText y={21} fill="#2B211C">
            {TEMPLATE_LEGEND.prick}
          </LegendText>
          <circle cx={4} cy={25} r={PRICK_R} fill="none" stroke={STITCH_STROKE} strokeWidth={0.2} />
          <LegendText y={26} fill="#7E4423">
            {TEMPLATE_LEGEND.punch}
          </LegendText>
        </g>
      ) : null}
      {/* kontrolní úsečka */}
      <g transform={`translate(${margin} ${height - 14})`}>
        <path d={`M0 0 L${template.calibrationMm} 0`} stroke="#2B211C" strokeWidth={0.5} />
        <path d="M0 -2 L0 2" stroke="#2B211C" strokeWidth={0.5} />
        <path
          d={`M${template.calibrationMm} -2 L${template.calibrationMm} 2`}
          stroke="#2B211C"
          strokeWidth={0.5}
        />
        <text x={0} y={6} fontFamily="ui-monospace, Menlo, monospace" fontSize={2.8} fill="#2B211C">
          kontrolní úsečka {template.calibrationMm} mm
        </text>
        <text
          x={contentWidth - 58}
          y={6}
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={2.8}
          fill="#6B5F57"
        >
          {template.stitchSpacingLabel} · {template.threadLabel}
        </text>
      </g>
    </svg>
  );
}

function LegendText({ y, fill, children }: { y: number; fill: string; children: string }) {
  return (
    <text x={10} y={y} fontFamily="ui-monospace, Menlo, monospace" fontSize={2.6} fill={fill}>
      {children}
    </text>
  );
}

const mm = (value: number) => value.toLocaleString('cs-CZ');
