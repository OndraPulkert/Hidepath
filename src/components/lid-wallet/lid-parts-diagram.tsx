import { useMemo } from 'react';

import {
  lidPartsDiagram,
  type DiagramRect,
  type PartsDiagramPart,
} from '@/lib/patterns/lid-wallet-parts-diagram';

const C = {
  leather: 'var(--color-cognac-tint)',
  bend: 'var(--color-parchment)',
  outline: 'var(--color-cognac-deep)',
  divider: 'var(--color-forest)',
  metal: 'var(--color-ink-2)',
  lining: 'var(--color-brass)',
  text: 'var(--color-leather)',
  muted: 'var(--color-ink-2)',
} as const;

const rectProps = (r: DiagramRect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });

/**
 * Schéma dílů Víčka (výchozí střih): rozvinutý pás P1 z rubu s úseky a polohou D1, D2, K1, K2
 * a L1. Geometrie je z modelu (`lidPartsDiagram`), komponenta ji jen kreslí.
 */
export function LidPartsDiagram({ className }: { className?: string }) {
  const d = useMemo(() => lidPartsDiagram(), []);
  const fs = d.fontSize;
  const vb = d.viewBox;
  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
      role="img"
      aria-label="Schéma: pás P1 rozložený, pohled na rub. Shora přední stěna F s přepážkou D1 a plíškem K2, ohyb dna, záda B s přepážkou D2, závěs, pás víčka a jazýček s magnetem K1 pod podšívkou L1."
      className={className}
    >
      {d.zones.map((z) => (
        <rect
          key={z.id}
          {...rectProps(z.rect)}
          fill={z.kind === 'bend' ? C.bend : C.leather}
          stroke={C.outline}
          strokeWidth={0.6}
        />
      ))}
      {d.parts.map((p) => (
        <PartShape key={p.id} part={p} fontSize={fs} />
      ))}
      <circle
        cx={d.magnet.cx}
        cy={d.magnet.cy}
        r={d.magnet.r}
        fill={C.metal}
        stroke={C.text}
        strokeWidth={0.4}
      />
      {d.zones.map((z) =>
        z.label ? (
          <text
            key={z.id}
            x={z.rect.x + z.rect.width / 2}
            y={z.id === 'F' ? z.rect.y + fs * 1.6 : z.rect.y + fs * 1.4}
            fontSize={fs}
            textAnchor="middle"
            fill={C.text}
            fontWeight={600}
          >
            {z.label}
          </text>
        ) : null,
      )}
      {d.callouts.map((c) => (
        <g key={c.text}>
          <polyline
            points={`${c.target.x},${c.target.y} ${d.calloutX - 2},${c.labelY} ${d.calloutX},${c.labelY}`}
            fill="none"
            stroke={C.muted}
            strokeWidth={0.35}
          />
          <circle cx={c.target.x} cy={c.target.y} r={0.9} fill={C.muted} />
          <text x={d.calloutX + 1} y={c.labelY + fs * 0.35} fontSize={fs} fill={C.text}>
            {c.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PartShape({ part, fontSize }: { part: PartsDiagramPart; fontSize: number }) {
  const common = { ...rectProps(part.rect), strokeWidth: 0.6 };
  const shape =
    part.kind === 'divider' ? (
      <rect {...common} fill="none" stroke={C.divider} strokeDasharray="3 1.6" />
    ) : part.kind === 'metal' ? (
      <rect {...common} fill={C.metal} fillOpacity={0.35} stroke={C.metal} />
    ) : (
      <rect {...common} fill={C.lining} fillOpacity={0.45} stroke={C.lining} />
    );
  return (
    <g>
      {shape}
      {part.label ? (
        <text
          x={part.label.x}
          y={part.label.y + fontSize * 0.35}
          fontSize={fontSize}
          textAnchor="middle"
          fill={C.divider}
          fontWeight={700}
        >
          {part.label.text}
        </text>
      ) : null}
    </g>
  );
}
