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
  beltPlateLayout,
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

/** Řezací soubor destičky. Vysvětlivky mají text a záměrně se sem nesmí připlést. */
const plate = Object.entries(svgs).find(
  ([path]) => path.includes('opasek-desticka') && !path.includes('vysvetlivky'),
)?.[1];

const legend = Object.entries(svgs).find(([path]) => path.includes('vysvetlivky'))?.[1];

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

describe('destička na opasek', () => {
  const L = beltPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP);
  const circles = (svg: string, r: number): { x: number; y: number }[] =>
    [...svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)]
      .filter((m) => Number(m[3]) === r)
      .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));

  it('soubor existuje a je čistě řezový', () => {
    expect(plate, 'docs/generated/opasek-desticka.svg').toBeDefined();
    expect(plate!).toContain('<g id="cut">');
    expect(plate!, 'žádný živý text – číslice jsou tahy').not.toContain('<text');
    expect([...plate!.matchAll(/fill="(?!none)/g)].length, 'žádná výplň').toBe(0);
    const cutLayer = plate!.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
    for (const d of [...cutLayer.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
      expect(d.trim().endsWith('Z'), `neuzavřená cesta v řezu ${d.slice(0, 40)}…`).toBe(true);
    }
    expect(plate!).toContain(`width="${L.plateWidthMm}mm"`);
    expect(plate!).toContain(`height="${L.plateHeightMm}mm"`);
  });

  it('má vodicí linky šířek s číslicemi, a to jako tahy, ne jako text', () => {
    // Vodicí linky jsou způsob vyrovnání: srovnáním obou hran pásu na pár linek
    // se destička sama vystředí a nemusí se rýsovat střednice.
    const eng = plate!.split('<g id="engrave">')[1]?.split('</g>')[0] ?? '';
    expect(eng, 'vrstva gravírování').not.toBe('');
    expect(eng, 'žádný živý text ani ve gravírování').not.toContain('<text');
    const lines = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/g)]
      .filter((m) => Math.abs(Number(m[2]) - Number(m[4])) < 0.001)
      .map((m) => Number(m[2]));
    for (const rowY of [L.tipRowY, L.buckleRowY]) {
      for (const g of L.guides) {
        for (const sign of [-1, 1]) {
          const want = rowY + sign * g.offsetMm;
          expect(
            lines.some((y) => Math.abs(y - want) < 0.001),
            `linka pro ${g.beltWidthMm} mm na y ${want}`,
          ).toBe(true);
        }
      }
    }
    // Číslice jsou samostatné tahy, ne <text>.
    expect([...eng.matchAll(/<path/g)].length).toBeGreaterThan(2 * 2 * L.guides.length);
  });

  it('má příčnou milimetrovou stupnici, aby šla vystředit i šířka bez linky', () => {
    // Linky pokrývají jen čtyři šířky (sousední musí být ≥ 4 mm od sebe, jinak jsou
    // linky < 2 mm od sebe). Stupnice pokryje jakoukoli šířku: pás 38 mm → obě hrany na 19.
    const eng = plate!.split('<g id="engrave">')[1]?.split('</g>')[0] ?? '';
    const segs = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)].map((m) => ({
      x1: Number(m[1]),
      y1: Number(m[2]),
      x2: Number(m[3]),
      y2: Number(m[4]),
    }));
    for (const rowY of [L.tipRowY, L.buckleRowY]) {
      for (let k = 1; k <= 22; k++) {
        for (const sign of [-1, 1]) {
          const want = rowY + sign * k;
          expect(
            segs.some((g) => Math.abs(g.y1 - want) < 0.001 && Math.abs(g.y2 - want) < 0.001),
            `dílek stupnice ${k} mm na y ${want}`,
          ).toBe(true);
        }
      }
    }
  });

  it('žádné gravírování nezasahuje do značicího ani závěsného otvoru', () => {
    // Regrese: číslo „30“ u levého okraje se dotýkalo rozlišovacího otvoru
    // u prostřední dírky. Popisky proto sedí na konci linek.
    const cut = plate!.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
    const eng = plate!.split('<g id="engrave">')[1]?.split('</g>')[0] ?? '';
    const holes = [...cut.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)].map(
      (m) => ({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) }),
    );
    const segs = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)].map((m) => ({
      x1: Number(m[1]),
      y1: Number(m[2]),
      x2: Number(m[3]),
      y2: Number(m[4]),
    }));
    const clashes: string[] = [];
    for (const h of holes) {
      for (const g of segs) {
        const dx = g.x2 - g.x1;
        const dy = g.y2 - g.y1;
        const len2 = dx * dx + dy * dy;
        const t =
          len2 === 0 ? 0 : Math.max(0, Math.min(1, ((h.x - g.x1) * dx + (h.y - g.y1) * dy) / len2));
        const d = Math.hypot(h.x - (g.x1 + t * dx), h.y - (g.y1 + t * dy));
        if (d < h.r + 0.3)
          clashes.push(`otvor (${h.x}, ${h.y}) r=${h.r} vs tah ve ${d.toFixed(2)} mm`);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('vodicí linky nezajíždějí do vyříznuté špičky ani do závěsného otvoru', () => {
    const eng = plate!.split('<g id="engrave">')[1]?.split('</g>')[0] ?? '';
    // Jen dlouhé tahy: krátké dílky stupnice sem nepatří.
    const horiz = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/g)]
      .filter((m) => Math.abs(Number(m[2]) - Number(m[4])) < 0.001)
      .filter((m) => Number(m[3]) - Number(m[1]) > 50);
    for (const m of horiz) {
      const y = Number(m[2]);
      const x1 = Number(m[3]);
      if (Math.abs(y - L.tipRowY) < L.tipCutoutHalfMm) {
        expect(x1, `linka na y ${y} nesmí dosáhnout k vrcholu špičky`).toBeLessThan(L.tipApexX);
      }
      if (Math.abs(y - L.hangHoleY) < L.hangHoleMm) {
        expect(x1, `linka na y ${y} nesmí dosáhnout k závěsnému otvoru`).toBeLessThan(
          L.hangHoleX - L.hangHoleMm / 2,
        );
      }
    }
  });

  it('nemá žádnou drážku na značení – jen otvory a vyříznuté tvary', () => {
    // Značení skrz drážku 1,2 mm má přesnost ±0,6 mm; obtažení hrany ±0,1 mm.
    // Jediné dva vyříznuté tvary jsou špička a ovál pro trn.
    const cut = plate!.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
    const shapes = [...cut.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!);
    expect(shapes.length, 'obrys + špička + ovál').toBe(3);
  });

  it('řada se špičkou: 5 dírek na ose a 2 rozlišovací u prostřední', () => {
    const marks = circles(plate!, L.markHoleMm / 2);
    const onTipRow = marks.filter((c) => c.y === L.tipRowY).map((c) => c.x);
    onTipRow.sort((a, b) => b - a);
    expect(onTipRow.length).toBe(L.tipHoleXs.length);
    onTipRow.forEach((x, i) => {
      expect(x, `dírka ${i + 1}`).toBeCloseTo(L.tipHoleXs[i]!, 3);
    });
    const flanking = marks.filter((c) => c.x === L.middleHoleX && c.y !== L.tipRowY);
    expect(flanking.length).toBe(2);
    for (const c of flanking) {
      expect(Math.abs(c.y - L.tipRowY)).toBeCloseTo(L.offAxisMarkMm, 6);
    }
  });

  it('řada s přezkou: 4 nýty na ose a 2 značky linie ohybu', () => {
    const marks = circles(plate!, L.markHoleMm / 2);
    const onBuckleRow = marks.filter((c) => c.y === L.buckleRowY).map((c) => c.x);
    expect(onBuckleRow.length).toBe(4);
    onBuckleRow.sort((a, b) => a - b);
    onBuckleRow.forEach((x, i) => {
      expect(x, `nýt ${i + 1}`).toBeCloseTo(L.rivetXs[i]!, 3);
    });
    const foldMarks = marks.filter((c) => c.x === L.foldX && c.y !== L.buckleRowY);
    expect(foldMarks.length).toBe(2);
  });

  it('obrys má zkosený levý horní roh jako značku konce pásu', () => {
    const cutL = plate!.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
    const outline = [...cutL.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)[0]!;
    expect(outline, 'zkosení v obrysu').toContain(
      `M0 ${L.strapEndChamferMm} L${L.strapEndChamferMm} 0`,
    );
  });

  it('má podélné pravítko u horní hrany na měření délky pásku na poutko', () => {
    const eng = plate!.split('<g id="engrave">')[1]?.split('</g>')[0] ?? '';
    // Svislé dílky pravítka: stejné x, malý rozdíl y, nahoře nad pásmem obou řad.
    const ticks = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)]
      .map((m) => ({ x1: Number(m[1]), y1: Number(m[2]), x2: Number(m[3]), y2: Number(m[4]) }))
      .filter((g) => Math.abs(g.x1 - g.x2) < 0.001 && g.y1 < L.tipRowY - L.maxBeltWidthMm / 2);
    // Pravítko musí pokrýt aspoň délku pásku na poutko pro nejširší pás.
    const xs = ticks.map((t) => t.x1);
    const span = Math.max(...xs) - Math.min(...xs);
    expect(ticks.length, 'dílky pravítka').toBeGreaterThan(200);
    expect(span, 'rozsah pravítka').toBeGreaterThan(2 * (L.maxBeltWidthMm + 2 * 5) + 15);
  });

  it('vysvětlivky jsou samostatný soubor a nejsou určené řezárně', () => {
    expect(legend, 'docs/generated/opasek-desticka-vysvetlivky.svg').toBeDefined();
    // Vysvětlivky text MÍT mají – proto se nesmí posílat řezárně a nesmí se plést s řezem.
    expect(legend!).toContain('<text');
    expect(legend!).toContain('Vysvětlivky');
    expect(plate!, 'řezací soubor zůstává bez textu').not.toContain('<text');
  });

  it('má jeden závěsný otvor v rohu', () => {
    const hangs = circles(plate!, L.hangHoleMm / 2);
    expect(hangs.length).toBe(1);
    expect(hangs[0]!.x).toBeCloseTo(L.hangHoleX, 6);
    expect(hangs[0]!.y).toBeCloseTo(L.hangHoleY, 6);
  });

  it('ovál pro trn je 25 × 6 mm a leží na ohybu', () => {
    const cutO = plate!.split('<g id="cut">')[1]?.split('</g>')[0] ?? '';
    const oval = [...cutO.matchAll(/<path d="([^"]+)"/g)]
      .map((m) => m[1]!)
      .find((d) => (d.match(/A/g) ?? []).length === 2);
    expect(oval).toBeDefined();
    const n = [...oval!.matchAll(/[-\d.]+/g)].map((m) => Number(m[0]));
    const r = n[4]!;
    expect(2 * r).toBeCloseTo(DEFAULT_BELT_END.slotWidthMm, 6);
    const x0 = n[0]! - r;
    const x1 = n[2]! + r;
    expect(x1 - x0).toBeCloseTo(DEFAULT_BELT_END.slotLengthMm, 6);
    expect((x0 + x1) / 2).toBeCloseTo(L.foldX, 6);
  });
});
