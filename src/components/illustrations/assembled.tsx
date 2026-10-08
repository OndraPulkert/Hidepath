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
  // Karta leží na lepeném pásu u spodku (širší než linie stehu), jinak na stehu.
  const cardRestMm = Math.max(back.stitchOffsetMm, template.glueBandMm ?? 0);
  const cardY = oy + h - cardRestMm * s - cardH;
  // Steh vede po bocích a dole stále `o` od hrany, v rozích po zaoblení (poloměr r − o),
  // a začíná pod zaoblením horního rohu kapsy, kde je bok už rovný.
  const fr = front.cornerRadiusMm * s;
  const ri = Math.max(fr - o, 0);
  const left = ox + o;
  const right = ox + w - o;
  const bottom = oy + h - o;
  const sideTop = oy + h - fh + Math.max(fr, o);
  const corner = (cx: number, from: number, to: number) => (t: number) => {
    const a = from + (to - from) * t;
    return [cx + ri * Math.cos(a), bottom - ri + ri * Math.sin(a)] as const;
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => (t: number) =>
    [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t] as const;
  const segments = [
    { len: bottom - ri - sideTop, at: line(left, sideTop, left, bottom - ri) },
    { len: (Math.PI / 2) * ri, at: corner(left + ri, Math.PI, Math.PI / 2) },
    { len: right - left - 2 * ri, at: line(left + ri, bottom, right - ri, bottom) },
    { len: (Math.PI / 2) * ri, at: corner(right - ri, Math.PI / 2, 0) },
    { len: bottom - ri - sideTop, at: line(right, bottom - ri, right, sideTop) },
  ];
  const total = segments.reduce((sum, seg) => sum + seg.len, 0);
  const n = Math.round(total / (4 * s));
  const stitch = Array.from({ length: n + 1 }, (_, i) => {
    let d = (total * i) / n;
    for (const seg of segments) {
      if (d <= seg.len || seg === segments[segments.length - 1]) {
        return seg.at(seg.len === 0 ? 0 : Math.min(d / seg.len, 1));
      }
      d -= seg.len;
    }
    return segments[0]!.at(0);
  });
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
              exposedCardHeightMm(front.heightMm, 54 + cardRestMm, front.thumbCutout),
            )} mm karty`
          : `karta vyčnívá ≈ ${Math.round(exposedCardHeightMm(front.heightMm, 54 + cardRestMm))} mm`}
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
