import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  apexToMiddleHoleMm,
  doubledPerimeterMm,
  keeperGapMm,
  keeperPocketClearMm,
  keeperStripLengthMm,
  ligamentMm,
  tipLengthMm,
} from '@/lib/geometry/belt-end.ts';

/**
 * Regrese: v titulku vygenerované šablony byla zadrátovaná šířka „Opasek 40 mm“,
 * takže výstup pro `--width 35` tvrdil 40 mm. Test čte verzovaná SVG v docs/generated
 * a ověřuje, že každý údaj v popiskách odpovídá modelu pro šířku z názvu souboru.
 */
const svgs: Record<string, string> = import.meta.glob('/docs/generated/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Číslo tak, jak ho šablona píše: desetinná čárka, bez nul na konci. */
const cz = (n: number): string => (Math.round(n * 1000) / 1000).toString().replace('.', ',');
const cz1 = (n: number): string => cz(Math.round(n * 10) / 10);

const sheets = Object.entries(svgs)
  .map(([path, svg]) => {
    const width = Number(/-(\d+(?:\.\d+)?)mm-/.exec(path)?.[1]);
    const page = path.includes('prezka') ? 1 : path.includes('spicka') ? 2 : 0;
    return { path, svg, width, page };
  })
  .filter((s) => Number.isFinite(s.width) && s.page > 0);

describe('vygenerované šablony opasku', () => {
  it('nějaké šablony existují a mají rozpoznatelnou šířku i stranu', () => {
    expect(sheets.length).toBeGreaterThan(0);
    expect(sheets.some((s) => s.page === 1)).toBe(true);
    expect(sheets.some((s) => s.page === 2)).toBe(true);
  });

  it('šířka v titulku odpovídá šířce v názvu souboru', () => {
    for (const { path, svg, width } of sheets) {
      expect(svg, path).toContain(`Opasek ${cz(width)} mm`);
    }
  });

  it('každá šablona nese kalibrační čtverec, měřítko 1:1 a rozměr A4', () => {
    for (const { path, svg } of sheets) {
      expect(svg, path).toContain('KALIBRAČNÍ ČTVEREC');
      expect(svg, path).toContain('50 × 50 mm');
      expect(svg, path).toContain('1:1');
      expect(svg, path).toContain('width="210mm"');
      expect(svg, path).toContain('height="297mm"');
    }
  });

  it('popisky konce u přezky odpovídají modelu pro danou šířku', () => {
    for (const { path, svg, width } of sheets.filter((s) => s.page === 1)) {
      const end = { ...DEFAULT_BELT_END, beltWidthMm: width };
      const [near, far] = end.rivetOffsetsMm;
      expect(svg, path).toContain(`nýt ± ${cz(far)} mm od ohybu`);
      expect(svg, path).toContain(`nýt ± ${cz(near)} mm od ohybu`);
      expect(svg, path).toContain(`drážka ${cz(end.slotLengthMm)} × ${cz(end.slotWidthMm)} mm`);
      expect(svg, path).toContain(`můstek u drážky ${cz1(ligamentMm(end))} mm`);
      expect(svg, path).toContain(
        `kapsa pro poutko ${cz(keeperGapMm(end))} mm (světlá ${cz(keeperPocketClearMm(end))} mm)`,
      );
      expect(svg, path).toContain(`konec pásu ${cz(end.tailLengthMm)} mm od ohybu`);
      // Poutko závisí na šířce i tloušťce pásu – právě tady by se zadrátovaná hodnota poznala.
      expect(svg, path).toContain(
        `pásek ${keeperStripLengthMm(end)} × ${end.keeperWidthMm} mm (obvod zdvojené části ${cz(doubledPerimeterMm(end))} mm`,
      );
    }
  });

  it('popisky špičky odpovídají modelu pro danou šířku', () => {
    for (const { path, svg, width } of sheets.filter((s) => s.page === 2)) {
      const tip = { ...DEFAULT_BELT_TIP, beltWidthMm: width };
      // Délka hrotu je odvozená ze šířky – u 40 mm 38,5 mm, u 35 mm 32,9 mm.
      expect(svg, path).toContain(`hrot ${cz1(tipLengthMm(tip))} mm`);
      expect(svg, path).toContain(`vrchol zaoblený r = ${cz(tip.noseRadiusMm)} mm`);
      expect(svg, path).toContain(`rozteč ${cz(tip.holeSpacingMm)} mm`);
      expect(svg, path).toContain(`${cz(apexToMiddleHoleMm(tip))} mm od hrotu`);
      expect(svg, path).toContain(`Dírky Ø ${cz(tip.holeDiameterMm)} mm, ${tip.holeCount} kusů`);
      const total = apexToMiddleHoleMm(tip) + DEFAULT_BELT_END.tailLengthMm;
      expect(svg, path).toContain(`naměřený obvod + ${cz(total)} mm`);
    }
  });
});
