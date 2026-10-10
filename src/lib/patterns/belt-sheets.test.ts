import { describe, expect, it } from 'vitest';

import { type BeltTipShape, DEFAULT_BELT_END, DEFAULT_BELT_TIP } from '../geometry/belt-end';
import { BELT_LIMITS, type BeltConfigInput, beltSpecsFor, checkBeltConfig } from './belt-config';
import {
  BUCKLE_FOLD_Y_MM,
  BUCKLE_STRAP_X_MM,
  type InkBox,
  SHEET_SAFE_MARGIN_MM,
  TIP_LANDSCAPE_MAX_REACH_MM,
  TIP_PORTRAIT_MAX_REACH_MM,
  beltSheetInk,
  buildBeltSheets,
  buildPages,
  tipSheetOrientation,
} from './belt-sheets';

const at = (w: number) => ({
  end: { ...DEFAULT_BELT_END, beltWidthMm: w },
  tip: { ...DEFAULT_BELT_TIP, beltWidthMm: w },
});

describe('tiskové listy opasku', () => {
  it('výchozí hrot je stejný list jako ze skriptu (soubory v docs/generated)', () => {
    for (const w of [35, 40]) {
      const { end, tip } = at(w);
      const [p1, p2] = buildPages(end, tip);
      const [s1, s2] = buildBeltSheets(end, tip, 'point');
      expect(s1.svg).toBe(p1);
      expect(s2.svg).toBe(p2);
    }
  });

  it('výchozích 5 dírek se vejde na výšku, 7 dírek jde na šířku', () => {
    expect(TIP_PORTRAIT_MAX_REACH_MM).toBeCloseTo(199.6, 1);
    expect(TIP_LANDSCAPE_MAX_REACH_MM).toBe(258);
    expect(tipSheetOrientation(DEFAULT_BELT_TIP)).toBe('portrait');
    expect(tipSheetOrientation({ ...DEFAULT_BELT_TIP, holeCount: 7 })).toBe('landscape');
    expect(
      tipSheetOrientation({
        ...DEFAULT_BELT_TIP,
        holeCount: 7,
        holeSpacingMm: 30,
        apexToFirstHoleMm: 100,
      }),
    ).toBe('split');
    // Mimo meze formuláře (9 dírek): prostřední je dál, než pojme list 2a.
    expect(
      tipSheetOrientation({
        ...DEFAULT_BELT_TIP,
        holeCount: 9,
        holeSpacingMm: 50,
        apexToFirstHoleMm: 100,
      }),
    ).toBeNull();
  });

  it('list 1: dva červené kroužky ohybu na čáře ohybu, 2 mm od hran pásu', () => {
    for (const w of [28, 40, 45]) {
      const { end, tip } = at(w);
      const [p1] = buildPages(end, tip);
      const foldY = BUCKLE_FOLD_Y_MM;
      for (const x of [BUCKLE_STRAP_X_MM + 2, BUCKLE_STRAP_X_MM + w - 2]) {
        expect(p1).toContain(`<circle cx="${x}" cy="${foldY}" r="1" fill="none" stroke="#c0392b"`);
      }
      expect(p1).toContain('propíchněte oba kroužky');
    }
  });

  it('nevejde se na jeden list: 2a (konec) a 2b (zbytek), prostřední dírka na obou', () => {
    const { end, tip } = at(45);
    const long = { ...tip, holeCount: 7, holeSpacingMm: 30, apexToFirstHoleMm: 100 };
    const sheets = buildBeltSheets(end, long, 'point');
    expect(sheets.map((s) => [s.id, s.orientation])).toEqual([
      ['prezka', 'portrait'],
      ['spicka', 'landscape'],
      ['spicka-zbytek', 'landscape'],
    ]);
    const [, a, b] = sheets;
    const holes = (svg: string) => {
      const g = /<g transform="translate\(([\d.]+) ([\d.]+)\) rotate\(90\)">/.exec(svg)!;
      const apexX = Number(g[1]);
      return [
        ...svg.matchAll(/<circle cx="0" cy="([\d.]+)" r="2\.5" fill="none" stroke="([^"]+)"/g),
      ].map((m) => ({ off: Number(m[1]), x: apexX - Number(m[1]), red: m[2] === '#c0392b' }));
    };
    const ha = holes(a.svg);
    const hb = holes(b!.svg);
    expect(ha.map((h) => h.off)).toEqual([100, 130, 160, 190]);
    expect(hb.map((h) => h.off)).toEqual([190, 220, 250, 280]);
    // Prostřední (190 mm) je červená na obou listech.
    expect(ha.filter((h) => h.red).map((h) => h.off)).toEqual([190]);
    expect(hb.filter((h) => h.red).map((h) => h.off)).toEqual([190]);
    for (const h of [...ha, ...hb]) {
      expect(h.x).toBeGreaterThan(10);
      expect(h.x).toBeLessThanOrEqual(285);
    }
    expect(a.svg).toContain('strana 2a');
    expect(b!.svg).toContain('strana 2b');
    expect(b!.svg).toContain('Poslední dírka 280 mm od hrotu');
  });

  it('zaoblený konec kreslí půlkruh r = šířka/2 a jinak stejné dírky', () => {
    const { end, tip } = at(30);
    const [, round] = buildBeltSheets(end, tip, 'round');
    expect(round.svg).toContain('A15 15 0 0 1');
    expect(round.svg).toContain('strana 2: zaoblený konec');
    expect(round.svg).not.toContain('vrchol zaoblený r = 4');
    const holes = round.svg.match(/<circle [^>]*r="2\.5"/g) ?? [];
    expect(holes).toHaveLength(5);
  });

  it('list na šířku je A4 na šířku a všechny dírky leží na listu', () => {
    const { end, tip } = at(45);
    const [, s] = buildBeltSheets(end, { ...tip, holeCount: 7 }, 'point');
    expect([s.orientation, s.widthMm, s.heightMm]).toEqual(['landscape', 297, 210]);
    expect(s.svg).toContain('width="297mm" height="210mm" viewBox="0 0 297 210"');
    // Dírky se kreslí v otočené skupině: střed (0, off) → (apexX − off, cy).
    const group = /<g transform="translate\(([\d.]+) ([\d.]+)\) rotate\(90\)">/.exec(s.svg);
    expect(group).not.toBeNull();
    const apexX = Number(group![1]);
    const offs = [...s.svg.matchAll(/<circle cx="0" cy="([\d.]+)" r="2\.5"/g)].map((m) =>
      Number(m[1]),
    );
    expect(offs).toHaveLength(7);
    for (const off of offs) {
      expect(apexX - off).toBeGreaterThan(10);
      expect(apexX).toBeLessThanOrEqual(285);
    }
    expect(s.svg).toContain('nastavení ± 75 mm (3 dírky sem i tam)');
  });

  it('3 dírky: správné tvary slov', () => {
    const { end, tip } = at(40);
    const [, s] = buildBeltSheets(end, { ...tip, holeCount: 3 }, 'point');
    expect(s.svg).toContain('(1 dírka sem i tam)');
    expect(s.svg).toContain('3 kusy');
  });

  it('tloušťka mění délku poutka na listu 1', () => {
    const { end, tip } = at(40);
    const [thin] = buildBeltSheets({ ...end, beltThicknessMm: 3 }, tip, 'point');
    const [thick] = buildBeltSheets({ ...end, beltThicknessMm: 4 }, tip, 'point');
    // 3 vrstvy (zdvojený konec + volný konec) + π × 1,2 mm + 15 mm přeplátování.
    expect(thin.svg).toContain('pásek 117 × 12 mm');
    expect(thick.svg).toContain('pásek 123 × 12 mm');
    expect(thin.svg).toContain('obepíná 3 vrstvy');
    expect(thin.svg).toContain('obvod 3 vrstev 98 mm');
  });
});

describe('tiskové listy opasku – nálezy kontroly (2026-10-08)', () => {
  const textY = (svg: string, needle: string): number => {
    const m = new RegExp(`<text x="[\\d.]+" y="([\\d.]+)"[^>]*>${needle}`).exec(svg);
    if (!m) throw new Error(`text ${needle} chybí`);
    return Number(m[1]);
  };

  it('zaoblený konec: listy neříkají „od hrotu“ ani „Špičku“', () => {
    const { end, tip } = at(30);
    const [, portrait] = buildBeltSheets(end, tip, 'round');
    const [, landscape] = buildBeltSheets(end, { ...tip, holeCount: 7 }, 'round');
    for (const s of [portrait, landscape]) {
      expect(s.svg).not.toMatch(/od hrotu|Špičku/);
    }
    expect(portrait.svg).toContain('144,3 mm od konce');
  });

  it('3 dírky s malou roztečí: popis rozteče se nepřekrývá s prostřední dírkou', () => {
    const { end, tip } = at(28);
    const [, s] = buildBeltSheets(
      end,
      { ...tip, holeCount: 3, holeSpacingMm: 11, apexToFirstHoleMm: 23, holeDiameterMm: 4.5 },
      'round',
    );
    const spacing = textY(s.svg, 'rozteč 11 mm');
    const middle = textY(s.svg, 'PROSTŘEDNÍ DÍRKA');
    expect(Math.abs(middle - spacing)).toBeGreaterThanOrEqual(6);
  });

  it('list 2 na výšku: žádný text nezačíná v nepotisknutelném okraji (< 13 mm)', () => {
    // Regrese: kóta „94,3 mm“ byla zarovnaná doprava na x = 13 a začínala na 1,4 mm, tiskárna
    // ji ořízla (např. na „4,3 mm“). Šířka textu odhadem 0,6 × velikost písma na znak.
    const MIN_X = SHEET_SAFE_MARGIN_MM;
    for (const [w, shape] of [
      [40, 'point'],
      [35, 'round'],
      [30, 'round'],
      [28, 'point'],
    ] as const) {
      const { end, tip } = at(w);
      const apex = w === 30 ? 89.3 : 94.3;
      const [, s] = buildBeltSheets(end, { ...tip, apexToFirstHoleMm: apex }, shape);
      for (const m of s.svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)) {
        const attrs = m[1]!;
        const x = Number(/\bx="([-\d.]+)"/.exec(attrs)![1]);
        const size = Number(/font-size="([\d.]+)"/.exec(attrs)![1]);
        const width = 0.6 * size * m[2]!.length;
        const rotated = attrs.includes('transform="rotate(-90 ');
        const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start';
        const left = rotated
          ? x - size
          : anchor === 'end'
            ? x - width
            : anchor === 'middle'
              ? x - width / 2
              : x;
        expect(left, `${w}/${shape}: ${m[2]}`).toBeGreaterThanOrEqual(MIN_X);
      }
      // Kóta vrchol → první dírka je na listu pořád (svisle podél kóty).
      expect(s.svg).toMatch(new RegExp(`rotate\\(-90 [^>]*>${String(apex).replace('.', ',')} mm<`));
    }
  });

  it('list na šířku: popis kalibračního čtverce není nalepený na hraně pásu 45 mm', () => {
    const { end, tip } = at(45);
    const [, s] = buildBeltSheets(end, { ...tip, holeCount: 7 }, 'point');
    const cy = Number(/<g transform="translate\([\d.]+ ([\d.]+)\) rotate\(90\)">/.exec(s.svg)![1]);
    const label = textY(s.svg, 'KALIBRAČNÍ ČTVEREC');
    // Účaří popisu minus výška písma (3 mm) musí být aspoň 3 mm pod spodní hranou pásu.
    expect(label - 3 - (cy + 22.5)).toBeGreaterThanOrEqual(3);
  });
});

describe('texty listů opasku', () => {
  const texts = (svg: string): string[] =>
    [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
  const all = (): string[] => {
    const { end, tip } = at(40);
    const out: string[] = [];
    for (const shape of ['point', 'round'] as const) {
      for (const holeCount of [3, 5, 7]) {
        for (const s of buildBeltSheets(end, { ...tip, holeCount }, shape))
          out.push(...texts(s.svg));
      }
    }
    return out;
  };

  it('vykají: žádné tykání (tvoje, ohni, označ, změř…)', () => {
    const tykani =
      /(?<!\p{L})(tvoj\p{L}*|tvá|tvé|tvůj|tvou|ohni|označ|změř|přeměř|vysekni|obtáhni|uřízni|navlékni|přilož|sešroubuj|vytiskni|měř|provleč|utáhni|zkontroluj|máš|použij)(?!\p{L})/iu;
    for (const t of all()) expect(t, t).not.toMatch(tykani);
  });

  it('list 1: poutko se navléká před ohnutím, pak druhá dvojice a nýty', () => {
    const { end, tip } = at(40);
    const [p1] = buildPages(end, tip);
    const t = texts(p1);
    const keeper = t.findIndex((s) =>
      /Navlékněte poutko na pás, ohněte konec .*a poutko posuňte přes přehnutý konec/.test(s),
    );
    const screws = t.findIndex((s) => s.includes('sešroubujte nýty'));
    expect(keeper).toBeGreaterThan(-1);
    expect(screws).toBeGreaterThan(keeper);
  });
});

describe('list 1: značky jen tam, kde jsou potřeba', () => {
  it('druhá dvojice je šedá bez křížku, propichuje se jen první; poutko má šrafy přeplátování', () => {
    const [p1] = buildPages(DEFAULT_BELT_END, DEFAULT_BELT_TIP);
    const [near, far] = DEFAULT_BELT_END.rivetOffsetsMm;
    for (const off of [near, far]) {
      expect(p1).toContain(
        `cy="${Math.round((BUCKLE_FOLD_Y_MM - off) * 1000) / 1000}" r="3" fill="none" stroke="#6a6a6a"`,
      );
      expect(p1).toContain(
        `cy="${Math.round((BUCKLE_FOLD_Y_MM + off) * 1000) / 1000}" r="3" fill="none" stroke="#2b2b2b"`,
      );
    }
    expect(p1).toContain('šedé: 2. dvojice, značí se až skrz 1. dvojici');
    expect(p1).toContain('propíchněte 2 černé otvory u konce');
    expect(p1).toContain(`šrafy: přeplátování ${DEFAULT_BELT_END.keeperOverlapMm} mm`);
  });
});

describe('bezpečná plocha listů: 13 mm od každé hrany A4', () => {
  // HP DeskJet 2700 nepotiskne 12,7 mm u jedné kratší hrany A4; list na šířku ji má vlevo
  // nebo vpravo. Obdélníky prvků dává generátor sám (`beltSheetInk`), text odhaduje z metrik
  // Helvetiky s rezervou (porovnáno s getBBox v Chrome).
  const shapes: Record<BeltConfigInput['tip'], BeltTipShape> = { hrot: 'point', zaobleny: 'round' };
  const variants = (): { name: string; input: BeltConfigInput }[] => {
    const out: { name: string; input: BeltConfigInput }[] = [];
    for (const widthMm of [BELT_LIMITS.widthMm.min, 31, 35, 40, BELT_LIMITS.widthMm.max])
      for (const thicknessMm of [BELT_LIMITS.thicknessMm.min, BELT_LIMITS.thicknessMm.max])
        for (const tip of ['hrot', 'zaobleny'] as const)
          for (const holeCount of BELT_LIMITS.holeCounts)
            for (const holeSpacingMm of [10.5, 15, 25, 27, 40, BELT_LIMITS.holeSpacingMaxMm])
              for (const apexToFirstHoleMm of [undefined, 31, 60, BELT_LIMITS.apexToFirstHoleMaxMm])
                for (const holeDiameterMm of [
                  BELT_LIMITS.holeDiameterMm.min,
                  BELT_LIMITS.holeDiameterMm.max,
                ]) {
                  const input = {
                    widthMm,
                    thicknessMm,
                    tip,
                    holeCount,
                    holeSpacingMm,
                    apexToFirstHoleMm,
                    holeDiameterMm,
                  };
                  if (checkBeltConfig(input).length > 0) continue;
                  out.push({ name: JSON.stringify(input), input });
                }
    return out;
  };

  const all = variants();
  const sheets = all.flatMap(({ name, input }) => {
    const { end, tip } = beltSpecsFor(input);
    return beltSheetInk(end, tip, shapes[input.tip]).map((sheet) => ({ name, ...sheet }));
  });

  it('varianty pokrývají list na výšku, na šířku i rozdělený na 2a a 2b', () => {
    const kinds = new Set(
      all.map(({ input }) => tipSheetOrientation(beltSpecsFor(input).tip) ?? 'null'),
    );
    expect([...kinds].sort()).toEqual(['landscape', 'portrait', 'split']);
    expect(all.length).toBeGreaterThan(300);
  });

  it('všechno nakreslené leží v [13, šířka − 13] × [13, výška − 13]', () => {
    const M = SHEET_SAFE_MARGIN_MM;
    const outside: string[] = [];
    for (const sheet of sheets) {
      expect(sheet.boxes.length).toBeGreaterThan(10);
      for (const b of sheet.boxes) {
        if (b.x0 < M || b.y0 < M || b.x1 > sheet.widthMm - M || b.y1 > sheet.heightMm - M) {
          outside.push(
            `${sheet.name} ${sheet.id}: ${b.label} [${b.x0.toFixed(1)}, ${b.y0.toFixed(1)} – ${b.x1.toFixed(1)}, ${b.y1.toFixed(1)}]`,
          );
        }
      }
    }
    expect(outside).toEqual([]);
  });

  it('každý list má celý kalibrační čtverec 50 × 50 mm a texty se nepřekrývají', () => {
    // Obdélník textu je o rezervu vyšší než písmo; za překryv se bere průnik vyšší než 0,5 mm
    // (řádky po 4 mm se tak nepočítají). Kóty mají popis těsně nad sebou, ty se vynechávají.
    const overlap = (a: InkBox, b: InkBox): boolean =>
      a.x0 < b.x1 && b.x0 < a.x1 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 0.5;
    const problems: string[] = [];
    for (const sheet of sheets) {
      const where = `${sheet.name} ${sheet.id}`;
      const calibration = sheet.boxes.filter((b) => b.kind === 'calibration');
      const c = calibration[0];
      if (
        calibration.length !== 1 ||
        !c ||
        Math.abs(c.x1 - c.x0 - 50.4) > 1e-9 ||
        Math.abs(c.y1 - c.y0 - 50.4) > 1e-9
      ) {
        problems.push(`${where}: kalibrační čtverec`);
      }
      const texts = sheet.boxes.filter((b) => b.kind === 'text');
      const others = sheet.boxes.filter((b) => b.kind !== 'text' && b.label !== 'kóta');
      texts.forEach((a, i) => {
        for (const b of [...texts.slice(i + 1), ...others]) {
          if (overlap(a, b)) problems.push(`${where}: „${a.label}“ × „${b.label}“`);
        }
      });
    }
    expect(problems).toEqual([]);
  });

  it('listy pro výchozí 35 a 40 mm: list 1 i list 2 na výšku', () => {
    for (const w of [35, 40]) {
      const { end, tip } = at(w);
      const sheets = buildBeltSheets(end, tip, 'point');
      expect(sheets.map((s) => s.orientation)).toEqual(['portrait', 'portrait']);
    }
  });
});
