import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  apexToMiddleHoleMm,
  doubledPerimeterMm,
  keeperGapMm,
  keeperPocketClearMm,
  keeperStripLengthMm,
  holeOffsetsFromApexMm,
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

const lasers = Object.entries(svgs)
  .map(([path, svg]) => ({
    path,
    svg,
    width: Number(/-(\d+(?:\.\d+)?)mm-laser/.exec(path)?.[1]),
  }))
  .filter((s) => Number.isFinite(s.width));

const sheets = Object.entries(svgs)
  .filter(([path]) => !path.includes('-laser'))
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

describe('řezací soubor pro laser', () => {
  it('existuje pro každou vygenerovanou šířku', () => {
    expect(lasers.length).toBeGreaterThan(0);
  });

  it('je čistě řezový: jedna vrstva, žádný text, žádná výplň, uzavřené kontury', () => {
    for (const { path, svg } of lasers) {
      expect(svg, path).toContain('<g id="cut">');
      // Živý text s fontem je pro řezárnu důvod k odmítnutí souboru.
      expect(svg, `${path}: žádný text`).not.toContain('<text');
      expect(svg, `${path}: jen jedna vrstva`).toBe(
        svg.replace(/<g id="engrave">[\s\S]*?<\/g>/, ''),
      );
      expect([...svg.matchAll(/fill="(?!none)/g)].length, `${path}: žádná výplň`).toBe(0);
      const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!);
      expect(paths.length, path).toBeGreaterThan(0);
      for (const d of paths) {
        // Otevřená cesta ležící na obrysu = dvojí řez. Zářezy proto patří do kontury.
        expect(d.trim().endsWith('Z'), `${path}: neuzavřená cesta ${d.slice(0, 40)}…`).toBe(true);
      }
      expect(svg, path).toContain('width="210mm"');
    }
  });

  it('obsahuje jen značicí otvory Ø 2 mm, ne otvory v plné velikosti', () => {
    for (const { path, svg } of lasers) {
      const radii = [...svg.matchAll(/<circle[^>]*r="([\d.]+)"/g)].map((m) => Number(m[1]));
      // 4 otvory pro nýty + 5 dírek pro trn; drážka pro trn je vyříznutá, ne značená.
      const marks = radii.filter((r) => r === 1);
      expect(marks.length, `${path}: značicí otvory`).toBe(9);
      // Dva závěsné otvory Ø 4 mm, jeden na každém hlavním dílu.
      const hangs = radii.filter((r) => r === 2);
      expect(hangs.length, `${path}: závěsné otvory`).toBe(2);
      expect(
        radii.length,
        `${path}: žádné otvory v plné velikosti, poloměry ${radii.join(',')}`,
      ).toBe(marks.length + hangs.length);
    }
  });

  it('otvory konce u přezky leží symetricky k zářezu ohybu', () => {
    for (const { path, svg, width } of lasers) {
      const end = { ...DEFAULT_BELT_END, beltWidthMm: width };
      const axis = 10 + width / 2; // střednice prvního dílu podle rozvržení
      const ys = [...svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)]
        .filter((m) => Number(m[1]) === axis && Number(m[3]) === 1)
        .map((m) => Number(m[2]))
        .sort((a, b) => a - b);
      expect(ys.length, path).toBe(4);
      const fold = (ys[0]! + ys[3]!) / 2;
      const expected = [
        -end.rivetOffsetsMm[1],
        -end.rivetOffsetsMm[0],
        end.rivetOffsetsMm[0],
        end.rivetOffsetsMm[1],
      ];
      ys.forEach((y, i) => {
        expect(y - fold, `${path}: otvor ${i + 1}`).toBeCloseTo(expected[i]!, 6);
      });
    }
  });

  it('dírky pro trn mají správné rozestupy od hrotu', () => {
    for (const { path, svg, width } of lasers) {
      const tip = { ...DEFAULT_BELT_TIP, beltWidthMm: width };
      const axis = 10 + width + 20 + width / 2; // střednice druhého dílu
      const ys = [...svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)]
        .filter((m) => Number(m[1]) === axis && Number(m[3]) === 1)
        .map((m) => Number(m[2]))
        .sort((a, b) => a - b);
      expect(ys.length, path).toBe(tip.holeCount);
      const apex = 10; // horní okraj rozvržení
      holeOffsetsFromApexMm(tip).forEach((off, i) => {
        expect(ys[i]! - apex, `${path}: dírka ${i + 1}`).toBeCloseTo(off, 6);
      });
    }
  });

  it('pásek na poutko má délku podle šířky a tloušťky pásu', () => {
    for (const { path, svg, width } of lasers) {
      const end = { ...DEFAULT_BELT_END, beltWidthMm: width };
      const rect = /<rect[^>]*width="([\d.]+)" height="([\d.]+)"/.exec(svg);
      expect(rect, path).not.toBeNull();
      expect(Number(rect![1]), path).toBeCloseTo(keeperStripLengthMm(end), 6);
      expect(Number(rect![2]), path).toBeCloseTo(end.keeperWidthMm, 6);
    }
  });

  it('drážka pro trn je vyříznutá 25 × 6 mm a ohyb ji půlí', () => {
    for (const { path, svg, width } of lasers) {
      const end = { ...DEFAULT_BELT_END, beltWidthMm: width };
      const cut = svg.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
      // Stadion: dva oblouky a jedna spojnice.
      const slot = [...cut.matchAll(/<path d="([^"]+)"/g)]
        .map((m) => m[1]!)
        .find((d) => (d.match(/A/g) ?? []).length === 2 && (d.match(/L/g) ?? []).length === 1);
      expect(slot, `${path}: drážka pro trn nenalezena`).toBeDefined();
      const n = [...slot!.matchAll(/[-\d.]+/g)].map((m) => Number(m[0]));
      const [x1, y1, r, y3] = [n[0]!, n[1]!, n[2]!, n[10]!];
      expect(2 * r, `${path}: šířka drážky`).toBeCloseTo(end.slotWidthMm, 6);
      expect(y3 - y1 + 2 * r, `${path}: délka drážky`).toBeCloseTo(end.slotLengthMm, 6);
      const axis = 10 + width / 2;
      expect(x1 + r, `${path}: drážka na střednici`).toBeCloseTo(axis, 6);
      // Ohyb je uprostřed drážky a zároveň uprostřed mezi krajními otvory pro nýty.
      const rivetYs = [...svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)]
        .filter((m) => Number(m[1]) === axis && Number(m[3]) === 1)
        .map((m) => Number(m[2]))
        .sort((a, b) => a - b);
      expect(rivetYs.length, path).toBe(4);
      expect((rivetYs[0]! + rivetYs[3]!) / 2, `${path}: ohyb`).toBeCloseTo((y1 + y3) / 2, 6);
    }
  });
});
