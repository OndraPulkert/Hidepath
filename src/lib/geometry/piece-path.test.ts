import { exposedCardHeightMm, piecePath } from '@/lib/geometry/piece-path';

const base = { x: 0, y: 0, widthMm: 100, heightMm: 56, cornerRadiusMm: 6 };

describe('piecePath', () => {
  it('bez výřezu vede horní hrana rovně mezi zaoblenými rohy', () => {
    const d = piecePath(base);
    expect(d.startsWith('M6 0')).toBe(true);
    expect(d).toContain('L94 0');
    expect(d).not.toContain('Q');
    expect(d.endsWith('Z')).toBe(true);
  });

  it('výřez vloží kvadratickou křivku uprostřed horní hrany', () => {
    const d = piecePath({ ...base, thumbCutout: { widthMm: 40, depthMm: 12 } });
    // Výřez 40 mm na dílu 100 mm začíná na 30 a končí na 70; řídicí bod má dvojnásobnou hloubku.
    expect(d).toContain('L30 0');
    expect(d).toContain('Q50 24 70 0');
  });

  it('výřez širší než díl se ořízne na rovnou část hrany', () => {
    const d = piecePath({ ...base, thumbCutout: { widthMm: 500, depthMm: 10 } });
    expect(d).toContain('L6 0');
    expect(d).toContain('Q50 20 94 0');
  });

  it('nulová hloubka výřez nevykreslí', () => {
    expect(piecePath({ ...base, thumbCutout: { widthMm: 40, depthMm: 0 } })).not.toContain('Q');
  });
});

describe('exposedCardHeightMm', () => {
  it('bez výřezu je vidět jen to, co přečnívá nad kapsu', () => {
    expect(exposedCardHeightMm(42, 57.5)).toBeCloseTo(15.5);
    expect(exposedCardHeightMm(56, 57.5)).toBeCloseTo(1.5);
  });

  it('s výřezem se odkryje karta až po dno výřezu', () => {
    expect(exposedCardHeightMm(56, 57.5, { widthMm: 40, depthMm: 12 })).toBeCloseTo(13.5);
  });

  it('nikdy nevrací zápornou hodnotu', () => {
    expect(exposedCardHeightMm(70, 57.5)).toBe(0);
  });
});
