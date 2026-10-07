import { type TemplateDefinition } from '@/content/schema';
import { piecePath } from '@/lib/geometry/piece-path';
import { stitchLinePath, templateMarks } from '@/lib/geometry/template-marks';

export interface TemplateIllustrationProps {
  template: TemplateDefinition;
  title: string;
  /** `preview` = přizpůsobí se šířce; `print` = fyzické milimetry pro tisk 1:1. */
  mode?: 'preview' | 'print';
  /** Legenda uvnitř SVG – v náhledu je na mobilu nečitelná, proto ji stránka kreslí jako HTML. */
  legend?: boolean;
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
  const gap = 10;
  const margin = 12;
  const pieces = template.pieces;
  const contentWidth = Math.max(...pieces.map((p) => p.widthMm));
  const contentHeight = pieces.reduce((s, p) => s + p.heightMm, 0) + gap * (pieces.length - 1);
  const width = contentWidth + margin * 2;
  const height = contentHeight + margin * 2 + 39;

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
  }));

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
            x={p.x + 4}
            y={p.y + 6 + p.labelOffset}
            fontFamily="Albert Sans, system-ui, sans-serif"
            fontSize={3.2}
            fill="#2B211C"
            fontWeight={600}
          >
            {p.name}
          </text>
          <text
            x={p.x + 4}
            y={p.y + 10.5 + p.labelOffset}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={2.6}
            fill="#6B5F57"
          >
            {mm(p.widthMm)} × {mm(p.heightMm)} mm · {p.quantity}× · steh {mm(p.stitchOffsetMm)} mm
            od hrany
            {p.openEdge === 'top' ? ' · vrch bez stehu' : ''}
          </text>
          {p.stitchUpToMm ? (
            <text
              x={p.x + 4}
              y={p.y + 14.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              boky šité jen pod přední kapsou (výška {mm(p.stitchUpToMm)} mm)
            </text>
          ) : null}
          {p.heightMark ? (
            <text
              x={p.x + 4}
              y={p.y + 18.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              čárky na bocích = horní hrana kapsy ({mm(p.heightMark.fromBottomMm)} mm), lekce 6
            </text>
          ) : null}
          {p.thumbCutout ? (
            <text
              x={p.x + 4}
              y={p.y + 14.5 + p.labelOffset}
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={2.6}
              fill="#6B5F57"
            >
              výřez na palec {mm(p.thumbCutout.widthMm)} × {mm(p.thumbCutout.depthMm)} mm
            </text>
          ) : null}
        </g>
      ))}
      {/* legenda */}
      {legend ? (
        <g transform={`translate(${margin} ${height - 31})`}>
          <path d="M0 0 L8 0" stroke="#2B211C" strokeWidth={0.4} />
          <text
            x={10}
            y={1}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={2.6}
            fill="#2B211C"
          >
            plná čára = obrys dílu, řežte podle ní
          </text>
          <path d="M0 5 L8 5" stroke="#A85F32" strokeWidth={0.3} strokeDasharray="1.2 0.8" />
          <text
            x={10}
            y={6}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={2.6}
            fill="#7E4423"
          >
            čárkovaná = linie stehu, neřezat (rýsuje se na kůži)
          </text>
          <path d="M4 8 L4 12" stroke="#2B211C" strokeWidth={0.35} />
          <text
            x={10}
            y={11}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={2.6}
            fill="#2B211C"
          >
            krátká čárka = značka k propíchnutí šídlem (lekce 5 a 6)
          </text>
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

const mm = (value: number) => value.toLocaleString('cs-CZ');
