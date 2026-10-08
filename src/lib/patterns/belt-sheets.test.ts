import { describe, expect, it } from 'vitest';

import { DEFAULT_BELT_END, DEFAULT_BELT_TIP } from '../geometry/belt-end';
import {
  TIP_LANDSCAPE_MAX_REACH_MM,
  TIP_PORTRAIT_MAX_REACH_MM,
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
    expect(TIP_PORTRAIT_MAX_REACH_MM).toBeCloseTo(195.6, 1);
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
    ).toBeNull();
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

  it('list 2 na výšku: žádný text nezačíná v nepotisknutelném okraji (< 8 mm)', () => {
    // Regrese: kóta „94,3 mm“ byla zarovnaná doprava na x = 13 a začínala na 1,4 mm, tiskárna
    // ji ořízla (např. na „4,3 mm“). Šířka textu odhadem 0,6 × velikost písma na znak.
    const MIN_X = 8;
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
