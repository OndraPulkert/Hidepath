import { prickPoints, stitchLinePath, templateMarks } from '@/lib/geometry/template-marks';

const front = { x: 0, y: 0, widthMm: 100, heightMm: 56, cornerRadiusMm: 6 };
const back = { x: 0, y: 0, widthMm: 100, heightMm: 70, cornerRadiusMm: 6 };

describe('stitchLinePath – linie stehu 3,5 mm od hrany', () => {
  it('přední kapsa: začíná 6 mm pod vrchem a v rozích jde po zaoblení R 2,5', () => {
    expect(stitchLinePath({ ...front, offsetMm: 3.5, openTop: true })).toBe(
      'M3.5 6 L3.5 50 A2.5 2.5 0 0 0 6 52.5 L94 52.5 A2.5 2.5 0 0 0 96.5 50 L96.5 6',
    );
  });

  it('zadní díl: boky končí jako na kapse 56 mm, 6 mm pod její horní hranou (50 mm od spodku)', () => {
    expect(stitchLinePath({ ...back, offsetMm: 3.5, openTop: true, upToMm: 56 })).toBe(
      'M3.5 20 L3.5 64 A2.5 2.5 0 0 0 6 66.5 L94 66.5 A2.5 2.5 0 0 0 96.5 64 L96.5 20',
    );
  });

  it('bod v rohu linie leží 3,5 mm od zaoblené hrany, průsečík rovných linií jen asi 2,5 mm', () => {
    // Střed rohu R6 je (6, 50); linie má poloměr 2,5 → od hrany 6 − 2,5 = 3,5.
    const cornerCenterToCrossing = Math.hypot(6 - 3.5, 50 - 52.5);
    expect(6 - cornerCenterToCrossing).toBeCloseTo(2.46, 2);
  });

  it('ostré rohy (poloměr ≤ odsazení) kreslí rovné linie bez oblouku', () => {
    const d = stitchLinePath({ ...front, cornerRadiusMm: 0, offsetMm: 3.5, openTop: false });
    expect(d).toBe('M3.5 3.5 L3.5 52.5 L96.5 52.5 L96.5 3.5 L3.5 3.5 Z');
  });

  it('uzavřená linie objede všechny čtyři rohy obloukem', () => {
    const d = stitchLinePath({ ...front, offsetMm: 3.5, openTop: false });
    expect(d.match(/A2\.5 2\.5/g)).toHaveLength(4);
    expect(d.endsWith('Z')).toBe(true);
  });
});

describe('templateMarks – značky k propíchnutí', () => {
  it('výřez 40 × 12 mm: konce čárkou 3 mm nad horní hranou na x 30 a 70, dno čárkou do výřezu', () => {
    expect(templateMarks({ ...front, thumbCutout: { widthMm: 40, depthMm: 12 } })).toEqual([
      { kind: 'thumb-cutout-end', x1: 30, y1: 0, x2: 30, y2: -3 },
      { kind: 'thumb-cutout-end', x1: 70, y1: 0, x2: 70, y2: -3 },
      { kind: 'thumb-cutout-bottom', x1: 50, y1: 12, x2: 50, y2: 9 },
    ]);
  });

  it('výška kapsy 56 mm na zadním dílu: čárky 8 mm dovnitř z obou boků, 14 mm pod vrchem', () => {
    expect(
      templateMarks({ ...back, x: 12, y: 78, heightMark: { fromBottomMm: 56, lengthMm: 8 } }),
    ).toEqual([
      { kind: 'height', x1: 12, y1: 92, x2: 20, y2: 92 },
      { kind: 'height', x1: 112, y1: 92, x2: 104, y2: 92 },
    ]);
  });

  it('díl bez výřezu a bez značky výšky nemá žádné značky', () => {
    expect(templateMarks(back)).toEqual([]);
  });
});

describe('prickPoints – kroužky k propíchnutí na líc (lekce 6)', () => {
  const piece = { stitchOffsetMm: 3.5, openEdge: 'top' as const };

  it('přední kapsa: horní konce linie stehu 6 mm pod vrchem a tři body oblouku R 2,5 v rozích', () => {
    const pts = prickPoints({ ...front, ...piece });
    expect(pts.filter((p) => p.kind === 'stitch-end')).toEqual([
      { kind: 'stitch-end', x: 3.5, y: 6 },
      { kind: 'stitch-end', x: 96.5, y: 6 },
    ]);
    expect(pts.filter((p) => p.kind === 'stitch-corner').map((p) => [p.x, p.y])).toEqual([
      [3.5, 50],
      [4.23, 51.77],
      [6, 52.5],
      [94, 52.5],
      [95.77, 51.77],
      [96.5, 50],
    ]);
    // Každý bod rohu leží 3,5 mm od zaoblené hrany (střed rohu R6 je 6, 50).
    for (const p of pts.filter((q) => q.kind === 'stitch-corner' && q.x < 50)) {
      expect(6 - Math.hypot(p.x - 6, p.y - 50)).toBeCloseTo(3.5, 1);
    }
  });

  it('zadní díl: lepený pás 5 mm končí na bocích 50 mm od spodku, v rohu jen střed oblouku R 1', () => {
    expect(prickPoints({ ...back, ...piece, stitchUpToMm: 56 }, 5)).toEqual([
      { kind: 'glue-end', x: 5, y: 20 },
      { kind: 'glue-end', x: 95, y: 20 },
      { kind: 'glue-corner', x: 5.29, y: 64.71 },
      { kind: 'glue-corner', x: 94.71, y: 64.71 },
    ]);
  });

  it('bez lepeného pásu nebo s uzavřenou linií žádné kroužky', () => {
    expect(prickPoints({ ...back, ...piece, stitchUpToMm: 56 })).toEqual([]);
    expect(prickPoints({ ...front, ...piece, openEdge: 'none' })).toEqual([]);
  });
});
