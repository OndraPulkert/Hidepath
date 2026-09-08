import { type TemplateDefinition } from '@/content/schema';
import { exposedCardHeightMm, piecePath } from '@/lib/geometry/piece-path';

/**
 * Hotové pouzdro: pohled zepředu (přední kapsa na zadním dílu, karta se vysouvá výřezem) a řez z boku.
 * Kreslí se ze stejných dat šablony, takže odpovídá tomu, co uživatel vyřízl.
 */
export function AssembledIllustration({
  template,
  title,
}: {
  template: TemplateDefinition;
  title: string;
}) {
  const back = template.pieces.find((p) => p.id === 'back') ?? template.pieces[0]!;
  const front = template.pieces.find((p) => p.id === 'front') ?? template.pieces[1] ?? back;
  const s = 2.2; // px na mm
  const ox = 20;
  const oy = 30;
  const w = back.widthMm * s;
  const h = back.heightMm * s;
  const fh = front.heightMm * s;
  const r = back.cornerRadiusMm * s;
  const o = back.stitchOffsetMm * s;
  const cardW = 85.6 * s;
  const cardH = 54 * s;
  const cardX = ox + (w - cardW) / 2;
  const cardY = oy + h - o - cardH;
  const holes = (x1: number, y1: number, x2: number, y2: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.floor(len / (4 * s));
    return Array.from({ length: n + 1 }, (_, i) => {
      const t = n === 0 ? 0 : i / n;
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t] as const;
    });
  };
  const stitch = [
    ...holes(ox + o, oy + h - fh + 2, ox + o, oy + h - o),
    ...holes(ox + o, oy + h - o, ox + w - o, oy + h - o),
    ...holes(ox + w - o, oy + h - o, ox + w - o, oy + h - fh + 2),
  ];
  const width = ox * 2 + w + 170;
  const height = oy + h + 44;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full">
      <rect width={width} height={height} fill="#FBF8F2" />
      <text
        x={ox}
        y={18}
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize={11}
        fontWeight={600}
        fill="#2B211C"
      >
        Zepředu
      </text>
      {/* zadní díl */}
      <rect
        x={ox}
        y={oy}
        width={w}
        height={h}
        rx={r}
        fill="#C98A5B"
        stroke="#2B211C"
        strokeWidth={1.2}
      />
      {/* karta */}
      <rect
        x={cardX}
        y={cardY}
        width={cardW}
        height={cardH}
        rx={6}
        fill="#FBF8F2"
        stroke="#6B5F57"
        strokeWidth={1}
      />
      {/* přední kapsa (spodní rohy zaoblené, horní hrana s výřezem na palec) */}
      <path
        d={piecePath({
          x: ox,
          y: oy + h - fh,
          widthMm: w,
          heightMm: fh,
          cornerRadiusMm: r,
          thumbCutout: front.thumbCutout
            ? { widthMm: front.thumbCutout.widthMm * s, depthMm: front.thumbCutout.depthMm * s }
            : undefined,
        })}
        fill="#A85F32"
        stroke="#2B211C"
        strokeWidth={1.2}
      />
      {stitch.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 2} ${y + 1.6} L${x + 2} ${y - 1.6}`}
          stroke="#F4EFE6"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ))}
      {/* kóty */}
      <path
        d={`M${ox + w + 12} ${oy} L${ox + w + 12} ${oy + h}`}
        stroke="#33483B"
        strokeWidth={1}
      />
      <text
        x={ox + w + 17}
        y={oy + h / 2}
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={9}
        fill="#33483B"
      >
        {back.heightMm} mm
      </text>
      <path
        d={`M${ox + w + 12} ${oy + h - fh} L${ox + w + 12} ${oy + h}`}
        stroke="#A85F32"
        strokeWidth={3}
      />
      <text
        x={ox + w + 17}
        y={oy + h - fh / 2 + 3}
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={9}
        fill="#7E4423"
      >
        kapsa {front.heightMm} mm
      </text>
      <text
        x={ox}
        y={oy + h + 20}
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize={9}
        fill="#6B5F57"
      >
        steh po bocích a dole, vrch otevřený · kartu vysunete palcem ve výřezu
      </text>
      <text
        x={ox}
        y={oy + h + 34}
        fontFamily="Albert Sans, system-ui, sans-serif"
        fontSize={9}
        fill="#6B5F57"
      >
        karta 85,6 × 54 mm ·{' '}
        {front.thumbCutout
          ? `výřez ${front.thumbCutout.widthMm} × ${front.thumbCutout.depthMm} mm odkryje ≈ ${Math.round(
              exposedCardHeightMm(front.heightMm, 54 + back.stitchOffsetMm, front.thumbCutout),
            )} mm karty`
          : `karta vyčnívá ≈ ${Math.round(exposedCardHeightMm(front.heightMm, 54 + back.stitchOffsetMm))} mm`}
      </text>
      {/* řez z boku */}
      <g transform={`translate(${ox + w + 95} ${oy})`}>
        <text
          x={-14}
          y={-12}
          fontFamily="Albert Sans, system-ui, sans-serif"
          fontSize={11}
          fontWeight={600}
          fill="#2B211C"
        >
          Řez z boku
        </text>
        <rect x={0} y={0} width={5} height={h} fill="#C98A5B" stroke="#2B211C" strokeWidth={1} />
        <rect
          x={9}
          y={h - fh}
          width={5}
          height={fh}
          fill="#A85F32"
          stroke="#2B211C"
          strokeWidth={1}
        />
        <rect
          x={5.5}
          y={h - o - cardH}
          width={3}
          height={cardH}
          fill="#FBF8F2"
          stroke="#6B5F57"
          strokeWidth={0.8}
        />
        <path
          d={`M-4 ${h - o} L18 ${h - o}`}
          stroke="#2B211C"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <text
          x={-14}
          y={h + 12}
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={8}
          fill="#6B5F57"
        >
          zadní · karta · kapsa
        </text>
      </g>
    </svg>
  );
}
