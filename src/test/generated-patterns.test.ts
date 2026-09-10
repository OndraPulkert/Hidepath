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
      expect(svg, path).toContain('<g id="cut"');
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
      const cut = svg.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
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

describe('řezací soubory: každý bod cesty leží v obrysu dílu', () => {
  /**
   * Regrese: na dílu se špičkou vyšly místo zářezů 2 mm ostny mimo materiál,
   * protože `notchSegment` slučovalo „na které hraně" a „kterým směrem se jede".
   * Uzavřenost cesty to nezachytila – osten je uzavřený stejně jako zářez.
   */
  const files = Object.entries(svgs).filter(
    ([path]) => path.includes('-laser') || path.includes('opasek-desticka'),
  );

  it('nějaké řezací soubory existují', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('zářezy míří dovnitř materiálu, ne ven', () => {
    const problems: string[] = [];
    for (const [path, svg] of files) {
      if (path.includes('vysvetlivky') || path.includes('desticka')) continue;
      const cut = svg.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
      for (const d of [...cut.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
        const xs = [...d.matchAll(/[ML]([-\d.]+) /g)].map((m) => Number(m[1]));
        if (xs.length < 6) continue;
        // Hrany dílu jsou dvě nejčastější x; cokoli za nimi je osten.
        const counts = new Map<number, number>();
        for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
        const edges = [...counts.entries()]
          .filter(([, n]) => n >= 2)
          .map(([x]) => x)
          .sort((a, b) => a - b);
        if (edges.length < 2) continue;
        const left = edges[0]!;
        const right = edges[edges.length - 1]!;
        const outside = xs.filter((x) => x < left - 1e-6 || x > right + 1e-6);
        if (outside.length > 0) {
          problems.push(`${path}: body ${outside.join(', ')} mimo hrany ${left}–${right}`);
        }
      }
    }
    expect(problems).toEqual([]);
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
    expect(plate!).toContain('<g id="cut"');
    expect(plate!, 'žádný živý text – číslice jsou tahy').not.toContain('<text');
    expect([...plate!.matchAll(/fill="(?!none)/g)].length, 'žádná výplň').toBe(0);
    const cutLayer = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    for (const d of [...cutLayer.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
      expect(d.trim().endsWith('Z'), `neuzavřená cesta v řezu ${d.slice(0, 40)}…`).toBe(true);
    }
    // List má 5 mm rezervu kolem dílu, aby se tah obrysu neodsekával v náhledech.
    expect(plate!).toContain(`width="${L.plateWidthMm + 10}mm"`);
    expect(plate!).toContain(`height="${L.plateHeightMm + 10}mm"`);
    expect(plate!, 'skutečné vrstvy, ne jen skupiny').toContain('inkscape:label="REZ"');
    expect(plate!, 'červená = řez').toContain('stroke="#ff0000"');
  });

  it('má vodicí linky šířek s číslicemi, a to jako tahy, ne jako text', () => {
    // Vodicí linky jsou způsob vyrovnání: srovnáním obou hran pásu na pár linek
    // se destička sama vystředí a nemusí se rýsovat střednice.
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
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
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
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
    const cut = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
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
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
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
    const cut = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    const shapes = [...cut.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!);
    // obrys + vyříznutá špička + 4 sloty zaobleného konce + ovál pro trn
    expect(shapes.length, 'obrys + špička + 4 oblouky + ovál').toBe(3 + L.roundedArcs.length);
  });

  it('řada se špičkou: 5 dírek na ose a 2 rozlišovací u prostřední', () => {
    const marks = circles(plate!, L.markHoleMm / 2);
    const onTipRow = marks.filter((c) => c.y === L.tipRowY).map((c) => c.x);
    onTipRow.sort((a, b) => b - a);
    expect(onTipRow.length).toBe(L.tipHoleXs.length);
    onTipRow.forEach((x, i) => {
      expect(x, `dírka ${i + 1}`).toBeCloseTo(L.tipHoleXs[i]!, 3);
    });
    // Rozlišení prostřední dírky je GRAVÍROVANÉ, ne vyříznuté: vyříznutými otvory
    // by se dalo omylem značit šídlem do viditelné plochy pásu.
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    const cutFlanking = marks.filter(
      (c) =>
        Math.abs(c.x - L.middleHoleX) < 1e-6 &&
        Math.abs(c.y - L.tipRowY) > 1e-6 &&
        Math.abs(c.y - L.tipRowY) <= L.offAxisMarkMm + 2,
    );
    expect(cutFlanking.length, 'rozlišovací značky nesmí být v řezu').toBe(0);
    for (const sign of [-1, 1]) {
      const my = L.tipRowY + sign * L.offAxisMarkMm;
      expect(eng, `gravírovaná ryska u prostřední dírky na y ${my}`).toContain(
        `M${L.middleHoleX - 3} ${my} L${L.middleHoleX + 3} ${my}`,
      );
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

  it('vyříznutá špička míří vrcholem od dírek a nic do ní nezasahuje', () => {
    const cut = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    const tipPath = [...cut.matchAll(/<path d="([^"]+)"/g)]
      .map((m) => m[1]!)
      .find((d) => (d.match(/A/g) ?? []).length === 1);
    expect(tipPath).toBeDefined();
    const n = [...tipPath!.matchAll(/[-\d.]+/g)].map((m) => Number(m[0]));
    const farX = n[0]!;
    expect(farX, 'široký konec je vlevo od vrcholu').toBeLessThan(L.tipApexX);
    expect(farX, 'široký konec je vpravo od nejbližší dírky').toBeGreaterThan(
      Math.max(...L.tipHoleXs),
    );
    // Do pásma výřezu nesmí zajít žádné gravírování.
    const intruding = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)]
      .map((m) => [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] as const)
      .filter(
        ([x1, y1, x2, y2]) =>
          Math.max(x1, x2) > farX + 0.01 &&
          Math.min(y1, y2) >= L.tipRowY - L.tipCutoutHalfMm &&
          Math.max(y1, y2) <= L.tipRowY + L.tipCutoutHalfMm,
      );
    expect(intruding).toEqual([]);
  });

  it('obrys má zkosený levý horní roh jako značku konce pásu', () => {
    const cutL = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    const outline = [...cutL.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)[0]!;
    expect(outline, 'zkosení v obrysu').toContain(
      `M0 ${L.strapEndChamferMm} L${L.strapEndChamferMm} 0`,
    );
  });

  it('řada se zaobleným koncem: čtyři soustředné sloty a linky k nim dotažené', () => {
    const cut = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    // Slot oblouku: dva oblouky a jedna spojnice, začíná i končí na svislici středu.
    const arcs = [...cut.matchAll(/<path d="([^"]+)"/g)]
      .map((m) => m[1]!)
      .filter((d) => (d.match(/A/g) ?? []).length === 4);
    expect(arcs.length, 'čtyři sloty zaobleného konce').toBe(L.roundedArcs.length);
    for (const slotD of arcs) {
      const n = [...slotD.matchAll(/[-\d.]+/g)].map((x) => Number(x[0]));
      // Slot má zaoblené konce, takže cesta má čtyři oblouky: vnější r, malý r/2,
      // vnitřní r a malý r/2. Poloměry proto beru jako množinu, ne pozičně.
      const radii = [...new Set([...slotD.matchAll(/A([\d.]+) /g)].map((m) => Number(m[1])))].sort(
        (a, b) => b - a,
      );
      const ro = radii[0]!;
      const ri = radii[1]!;
      expect(ro - ri, 'šířka slotu').toBeCloseTo(L.roundedSlotWidthMm, 3);
      const r = (ro + ri) / 2;
      const arc = L.roundedArcs.find((a) => Math.abs(a.radiusMm - r) < 0.01);
      expect(arc, `oblouk r=${r}`).toBeDefined();
      expect(n[0]!, 'střed oblouku').toBeCloseTo(arc!.centreX, 3);
      // Linka šířky musí být dotažená až ke svislici středu, aby oblouk označila.
      for (const sign of [-1, 1]) {
        const y = L.roundedRowY + sign * arc!.radiusMm;
        const line = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/g)]
          .map((m) => [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] as const)
          .find(
            ([x1, y1, x2, y2]) =>
              Math.abs(y1 - y) < 0.001 && Math.abs(y2 - y) < 0.001 && x2 - x1 > 50,
          );
        expect(line, `linka pro ${arc!.beltWidthMm} mm na y ${y}`).toBeDefined();
        expect(line![2], `linka pro ${arc!.beltWidthMm} mm dotažená k oblouku`).toBeCloseTo(
          arc!.centreX,
          3,
        );
      }
    }
  });

  it('má podélné pravítko u horní hrany na měření délky pásku na poutko', () => {
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    // Svislé dílky pravítka: stejné x, malý rozdíl y, nahoře nad pásmem obou řad.
    const ticks = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)]
      .map((m) => ({ x1: Number(m[1]), y1: Number(m[2]), x2: Number(m[3]), y2: Number(m[4]) }))
      .filter((g) => Math.abs(g.x1 - g.x2) < 0.001 && g.y1 < L.tipRowY - L.maxBeltWidthMm / 2);
    // Pravítko musí pokrýt aspoň délku pásku na poutko pro nejširší pás.
    const xs = ticks.map((t) => t.x1);
    const span = Math.max(...xs) - Math.min(...xs);
    expect(ticks.length, 'dílky pravítka').toBeGreaterThan(100);
    expect(span, 'rozsah pravítka').toBeGreaterThanOrEqual(L.maxKeeperStripMm);
    // Model musí popisovat TUTO kresbu. Dřív si každý počítal po svém: model
    // 135,3 mm, nakreslených 143 mm, a nic to nehlídalo. Nula je levá hrana
    // destičky, takže první ryska je na 1 mm a poslední na rulerLengthMm.
    expect(Math.min(...xs), 'první ryska').toBeCloseTo(L.rulerX0Mm + 1, 6);
    expect(Math.max(...xs), 'poslední ryska').toBeCloseTo(L.rulerX0Mm + L.rulerLengthMm, 6);
  });

  it('gravírování celé leží uvnitř obrysu destičky (regrese)', () => {
    // „0“ pravítka ležela v zkoseném rohu, takže by ji laser vyřezal napůl.
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    const ch = L.strapEndChamferMm;
    const outside: string[] = [];
    for (const d of [...eng.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
      const nums = [...d.matchAll(/-?[\d.]+/g)].map((m) => Number(m[0]));
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = nums[i]!;
        const y = nums[i + 1]!;
        if (x < 0 || y < 0 || x > L.plateWidthMm || y > L.plateHeightMm || x + y < ch) {
          outside.push(`${x} ${y}`);
        }
      }
    }
    expect(outside, 'gravírované body mimo obrys').toEqual([]);
  });

  it('žádnou gravírovanou číslicí neprochází jiný tah (regrese)', () => {
    // Obecná verze dvou už opravených chyb: příčné tahy číslic šířek byly
    // kolineární se svou vodicí linkou a rysky pravítka procházely jeho čísly.
    // Každá číslice je jeden `<path>` s několika podcestami a malou obálkou;
    // test hledá jakýkoli cizí tah, který tou obálkou projde.
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    type Seg = { x1: number; y1: number; x2: number; y2: number };
    const perPath: { box: [number, number, number, number]; segs: Seg[] }[] = [];
    for (const d of [...eng.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
      const segs: Seg[] = [];
      for (const sub of d.split('M').slice(1)) {
        const n = [...sub.matchAll(/-?[\d.]+/g)].map((m) => Number(m[0]));
        for (let i = 0; i + 3 < n.length; i += 2) {
          segs.push({ x1: n[i]!, y1: n[i + 1]!, x2: n[i + 2]!, y2: n[i + 3]! });
        }
      }
      if (segs.length === 0) continue;
      const xs = segs.flatMap((g) => [g.x1, g.x2]);
      const ys = segs.flatMap((g) => [g.y1, g.y2]);
      perPath.push({
        box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
        segs,
      });
    }
    // Číslice: malá obálka a víc než jedna podcesta.
    const glyphs = perPath.filter(
      (p) => p.segs.length >= 2 && p.box[2] - p.box[0] <= 4 && p.box[3] - p.box[1] <= 4,
    );
    expect(glyphs.length, 'gravírované číslice').toBeGreaterThan(20);
    const crossings: string[] = [];
    for (const g of glyphs) {
      const [gx0, gy0, gx1, gy1] = g.box;
      for (const other of perPath) {
        if (other === g) continue;
        for (const sg of other.segs) {
          // Vzorkování úsečky: stačí hrubé, jde o průchod obálkou, ne o dotyk.
          for (let t = 0; t <= 1; t += 0.02) {
            const x = sg.x1 + (sg.x2 - sg.x1) * t;
            const y = sg.y1 + (sg.y2 - sg.y1) * t;
            if (x > gx0 + 1e-9 && x < gx1 - 1e-9 && y > gy0 + 1e-9 && y < gy1 - 1e-9) {
              crossings.push(`${gx0.toFixed(1)},${gy0.toFixed(1)} × tah ${sg.x1},${sg.y1}`);
              t = 2;
              break;
            }
          }
        }
      }
    }
    expect([...new Set(crossings)], 'tahy procházející číslicí').toEqual([]);
  });

  it('žádný tah číslice neleží na vodicí lince (regrese)', () => {
    // Příčné tahy číslic 4 a 5 byly kolineární se svou linkou: 2 × 1,2 mm
    // gravírované dvakrát a linka procházela číslem naskrz.
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const d of [...eng.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!)) {
      // Po podcestách: skok mezi `M` není úsečka, jinak by test hlásil tahy,
      // které v souboru nejsou.
      for (const sub of d.split('M').slice(1)) {
        const n = [...sub.matchAll(/-?[\d.]+/g)].map((m) => Number(m[0]));
        for (let i = 0; i + 3 < n.length; i += 2) {
          segs.push({ x1: n[i]!, y1: n[i + 1]!, x2: n[i + 2]!, y2: n[i + 3]! });
        }
      }
    }
    const lines = segs.filter((g) => Math.abs(g.y1 - g.y2) < 1e-9 && Math.abs(g.x2 - g.x1) > 20);
    expect(lines.length, 'vodicí linky').toBeGreaterThan(20);
    const onLine = segs.filter(
      (g) =>
        Math.abs(g.y1 - g.y2) < 1e-9 &&
        Math.abs(g.x2 - g.x1) > 0.4 &&
        Math.abs(g.x2 - g.x1) < 3 &&
        lines.some(
          (l) =>
            Math.abs(l.y1 - g.y1) < 1e-9 &&
            Math.min(l.x1, l.x2) <= Math.min(g.x1, g.x2) &&
            Math.max(g.x1, g.x2) <= Math.max(l.x1, l.x2),
        ),
    );
    expect(
      onLine.map((g) => `${g.x1}..${g.x2} @ ${g.y1}`),
      'tahy číslic na lince',
    ).toEqual([]);
  });

  it('nese gravírovaná čísla řad 1/2/3 a čárkovanou linii ohybu', () => {
    const eng = plate!.split('<g id="engrave"')[1]?.split('</g>')[0] ?? '';
    // Čísla řad jsou 3 mm vysoké tahy u levého okraje, každé na své ose.
    for (const rowY of [L.tipRowY, L.roundedRowY, L.buckleRowY]) {
      const near = [...eng.matchAll(/M([\d.]+) ([\d.]+)/g)].filter((m) => {
        const x = Number(m[1]);
        const y = Number(m[2]);
        return x < 10 && Math.abs(y - rowY) <= 1.6;
      });
      expect(near.length, `číslo řady u osy ${rowY}`).toBeGreaterThan(0);
    }
    // Čárkovaná linie ohybu: svislé úseky na foldX, mimo ovál.
    const dashes = [...eng.matchAll(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/g)]
      .map((m) => ({ x: Number(m[1]), y1: Number(m[2]), x2: Number(m[3]), y2: Number(m[4]) }))
      .filter((g) => Math.abs(g.x - L.foldX) < 1e-9 && Math.abs(g.x2 - L.foldX) < 1e-9);
    expect(dashes.length, 'úseky čárkované linie ohybu').toBeGreaterThan(8);
    for (const d of dashes) {
      const dy = Math.min(Math.abs(d.y1 - L.buckleRowY), Math.abs(d.y2 - L.buckleRowY));
      expect(dy, 'čárka zasahuje do oválu').toBeGreaterThanOrEqual(L.slotWidthMm / 2);
    }
  });

  it('vysvětlivky jsou samostatný soubor a nejsou určené řezárně', () => {
    expect(legend, 'docs/generated/opasek-desticka-vysvetlivky.svg').toBeDefined();
    // Vysvětlivky text MÍT mají – proto se nesmí posílat řezárně a nesmí se plést s řezem.
    expect(legend!).toContain('<text');
    expect(legend!).toContain('Vysvětlivky');
    expect(plate!, 'řezací soubor zůstává bez textu').not.toContain('<text');
  });

  it('vysvětlivky ukazují celý tvar destičky, nejen popisky (regrese)', () => {
    // Geometrie se do vysvětlivek vyřezává z řezacího souboru podle `<g id="cut"`.
    // Když se do té značky přidal atribut, hledání selhalo a zůstaly jen popisky
    // s odkazovými linkami mířícími do prázdna.
    const plateGeom = (plate!.match(/<(path|circle)\b/g) ?? []).length;
    const legendGeom = (legend!.match(/<(path|circle)\b/g) ?? []).length;
    expect(plateGeom).toBeGreaterThan(300);
    // Vysvětlivky mají navíc odkazové linky, nikdy ale méně prvků než řez.
    expect(legendGeom).toBeGreaterThanOrEqual(plateGeom);
    // Vrstvy jsou přejmenované a přebarvené, aby se soubor nedal poslat na laser.
    expect(legend!, 'vrstva geometrie ve vysvětlivkách').toContain('<g id="nerezat"');
    expect(legend!, 'nesmí nést barvu řezu').not.toContain('#ff0000');
    expect(legend!, 'nesmí nést barvu gravírování').not.toContain('#0000ff');
    expect(legend!, 'vrstva se nesmí jmenovat REZ').not.toContain('inkscape:label="REZ"');
    // Tiskne se na A4 na šířku.
    expect(legend!).toContain('width="297mm"');
    expect(legend!).toContain('height="210mm"');
    // A skutečně tentýž obrys: obvodová kontura řezu se ve vysvětlivkách najde slovo od slova.
    // Obrys začíná ve zkoseném rohu, tedy na levé hraně pod ním.
    const outline = /<path d="M0 [\d.]+ L[^"]*Z\s*"/.exec(plate!)?.[0];
    expect(outline, 'obrys destičky v řezacím souboru').toBeDefined();
    expect(legend!).toContain(outline!);
  });

  it('žádný popisek vysvětlivek nepřetéká z listu (regrese)', () => {
    // Šířka textu se odhaduje z počtu znaků. Faktor 0,53 em/znak není odhad:
    // změřeno přes getComputedTextLength na vyrenderovaných vysvětlivkách, kde
    // nejširší popisek vyšel na 0,524 em/znak a nejužší na 0,429. Jde jen o to
    // zachytit popisek, který po prodloužení textu vyleze z listu.
    const view = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(legend!);
    expect(view, 'viewBox vysvětlivek').not.toBeNull();
    const right = Number(view![1]) + Number(view![3]);
    const bottom = Number(view![2]) + Number(view![4]);
    const texts = [
      ...legend!.matchAll(
        /<text x="([-\d.]+)" y="([-\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)</g,
      ),
    ];
    expect(texts.length, 'popisky ve vysvětlivkách').toBeGreaterThan(10);
    for (const m of texts) {
      const x = Number(m[1]);
      const y = Number(m[2]);
      const size = Number(m[3]);
      const width = m[4]!.length * size * 0.53;
      expect(x + width, `popisek "${m[4]!.slice(0, 30)}…" vpravo`).toBeLessThanOrEqual(right);
      expect(y, `popisek "${m[4]!.slice(0, 30)}…" dole`).toBeLessThanOrEqual(bottom);
    }
  });

  it('každá řada je zrcadlově symetrická, takže lze pracovat z líce i z rubu', () => {
    // Praktický důsledek: pás se může položit pod destičku kteroukoli stranou nahoru.
    // Kdyby některá značka ležela mimo osu bez svého protějšku, obrácením pásu by se
    // celý konec u přezky zrcadlil a nýty by sedly jinam.
    const marks = circles(plate!, L.markHoleMm / 2);
    expect(marks.length, 'značicí otvory').toBeGreaterThan(10);
    const rows = [L.tipRowY, L.roundedRowY, L.buckleRowY];
    for (const m of marks) {
      const axis = rows.reduce((a, b) => (Math.abs(b - m.y) < Math.abs(a - m.y) ? b : a));
      const off = m.y - axis;
      if (Math.abs(off) < 1e-6) continue;
      const twin = marks.some(
        (o) => Math.abs(o.x - m.x) < 1e-6 && Math.abs(o.y - (axis - off)) < 1e-6,
      );
      expect(twin, `značka x=${m.x} y=${m.y} nemá protějšek na druhé straně osy`).toBe(true);
    }
  });

  it('má jeden závěsný otvor v rohu', () => {
    const hangs = circles(plate!, L.hangHoleMm / 2);
    expect(hangs.length).toBe(1);
    expect(hangs[0]!.x).toBeCloseTo(L.hangHoleX, 6);
    expect(hangs[0]!.y).toBeCloseTo(L.hangHoleY, 6);
  });

  it('ovál pro trn je 25 × 6 mm a leží na ohybu', () => {
    const cutO = plate!.split('<g id="cut"')[1]?.split('</g>')[0] ?? '';
    // Ovál pro trn: dva oblouky a jedna spojnice, na rozdíl od slotů zaobleného
    // konce se jeho začátek a konec liší v x (leží vodorovně).
    const oval = [...cutO.matchAll(/<path d="([^"]+)"/g)]
      .map((m) => m[1]!)
      .filter((d) => (d.match(/A/g) ?? []).length === 2)
      .find((d) => {
        const n = [...d.matchAll(/[-\d.]+/g)].map((x) => Number(x[0]));
        return Math.abs(n[0]! - n[9]!) > 1;
      });
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
