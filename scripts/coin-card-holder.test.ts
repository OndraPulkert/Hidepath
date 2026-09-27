import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';
import {
  buildCoinHolderPaperModelSvg,
  buildCoinHolderPocketSvg,
  buildCoinHolderProcessSvg,
  buildCoinHolderSheetSvg,
  coinHolderFileStem,
  skiveZones,
} from './coin-card-holder.ts';

/** Generátor pouzdra s mincí mimo výchozí variantu (golden test hlídá jen verzované soubory). */
describe('generátor pouzdra s mincí – varianty', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const r3 = (n: number): string => String(Math.round(n * 1000) / 1000);

  it('název souboru odliší minci, okno i stranu jazyka', () => {
    expect(coinHolderFileStem(spec)).toBe('pouzdro-mince-sablona');
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: NAMED_COINS['50kc'] })).toBe(
      'pouzdro-mince-sablona-mince-27-5mm',
    );
    expect(coinHolderFileStem({ ...spec, windowDiameterMm: 30 })).toBe(
      'pouzdro-mince-sablona-okno-30mm',
    );
    expect(coinHolderFileStem({ ...spec, tabSide: 'left' })).toBe(
      'pouzdro-mince-sablona-jazyk-vlevo',
    );
  });

  it('jazyk vlevo: pás je zrcadlově, výřez a průchodka na opačné straně', () => {
    const left = { ...spec, tabSide: 'left' as const };
    const L = coinCardHolderLayout(left);
    const svg = buildCoinHolderSheetSvg(left);
    const m = 10;
    const X = (x: number): string => r3(m + L.stripLengthMm - x);
    const Y = (y: number): string => r3(m + L.tabLengthMm + y);
    const body = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1];
    // Začátek cesty je u pravého konce listu (zrcadlení) a oblouky mají opačný směr.
    expect(body.startsWith(`M${X(0)} ${Y(-L.tabLengthMm + L.tabEndRadiusMm)} A10 10 0 0 0 `)).toBe(
      true,
    );
    const S = L.scoopRadiusMm;
    expect(body).toContain(
      `L${X(L.scoopStartXMm)} ${Y(0)} A${L.backScoopRxMm} ${S} 0 0 1 ${X(L.backX1Mm)} ${Y(S)}`,
    );
    expect(svg).toContain(`<circle cx="${X(L.grommetXMm!)}" cy="${Y(L.grommetYMm!)}" r="2.5"`);
    // Tečky dna zůstanou na předním panelu (zrcadlení se nesmí použít dvakrát).
    const seamDots = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="0.45"/g)].map((q) =>
      Number(q[1]),
    );
    expect(seamDots.length).toBe(3 * L.bottomSeamHoles);
    const lo = m + L.stripLengthMm - L.frontX1Mm;
    const hi = m + L.stripLengthMm - L.frontX0Mm;
    const onFront = seamDots.filter((x) => x > lo && x < hi);
    expect(onFront.length).toBe(L.bottomSeamHoles);
    for (const x of onFront) {
      expect(x).toBeGreaterThanOrEqual(lo + spec.stitchOffsetMm - 0.01);
      expect(x).toBeLessThanOrEqual(hi - spec.stitchOffsetMm + 0.01);
    }
    // Popisky jazyka leží vně jazyka (vlevo od něj), ne přes řez.
    expect(svg).toContain(`<text x="${r3(m + L.stripLengthMm - L.tabX1Mm - 2)}"`);
    expect(svg).toContain('Jazyk vyjde zepředu vlevo');
  });

  it('bez vnitřního panelu kresba odmítne (jeden bok by zůstal otevřený)', () => {
    expect(() => buildCoinHolderSheetSvg({ ...spec, innerPanel: false })).toThrow(/otevřená/);
  });

  it('list postupu: pás v kroku 1, výřez předku vlevo, dno prošité skrz vrstvy', () => {
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderProcessSvg(spec);
    const pad = 8;
    const cellW = (297 - 2 * pad) / 4;
    const cellH = (210 - 2 * pad - 10) / 2;
    // Buňka 4 (přišití kapsy): přední panel začíná čtvrtkruhem výřezu v levém horním rohu.
    const k4 = Math.min(0.62, (cellH - 26) / L.panelHeightMm);
    const ox4 = pad + 3 * cellW + (cellW - L.panelWidthMm * k4) / 2;
    const oy4 = pad + 12;
    const S4 = L.scoopRadiusMm * k4;
    expect(svg).toContain(
      `M${r3(ox4)} ${r3(oy4 + S4)} A${r3(S4)} ${r3(S4)} 0 0 0 ${r3(ox4 + S4)} ${r3(oy4)}`,
    );
    expect(svg).toContain(`dno prošít skrz všechny vrstvy: ${L.bottomSeamHoles} otvorů`);
    expect(svg).toContain('obě boční hrany pouzdra jsou ohyby, nešijí se');
    // Hotovo zezadu: výřez je v pravém horním rohu (zrcadlově).
    const k8 = k4;
    const ox8 = pad + 3 * cellW + (cellW - L.panelWidthMm * k8) / 2;
    const oy8 = pad + cellH + 14;
    const W8 = L.panelWidthMm * k8;
    expect(svg).toContain(
      `L${r3(ox8 + W8 - S4)} ${r3(oy8)} A${r3(S4)} ${r3(S4)} 0 0 0 ${r3(ox8 + W8)} ${r3(oy8 + S4)}`,
    );
  });

  it('nulové poloměry kreslí rovné čáry, žádné degenerované oblouky', () => {
    const svg = buildCoinHolderSheetSvg({ ...spec, cornerRadiusMm: 0 });
    expect(svg).not.toMatch(/A0 0 /);
  });

  it('list postupu: kování a jazyk na správných stranách v buňkách 6 a 7', () => {
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderProcessSvg(spec);
    const pad = 8;
    const cellW = (297 - 2 * pad) / 4;
    const cellH = (210 - 2 * pad - 10) / 2;
    const k7 = Math.min(0.62, (cellH - 26) / L.panelHeightMm);
    const ox7 = pad + 2 * cellW + (cellW - L.panelWidthMm * k7) / 2;
    const oy7 = pad + cellH + 14;
    // průchodka vlevo nahoře (strana výřezu), jazyk vpravo
    expect(svg).toContain(
      `<circle cx="${r3(ox7 + spec.grommetFromEdgeMm * k7)}" cy="${r3(oy7 + spec.grommetFromEdgeMm * k7)}"`,
    );
    const S7 = L.scoopRadiusMm * k7;
    expect(svg).toContain(
      `M${r3(ox7)} ${r3(oy7 + S7)} A${r3(S7)} ${r3(S7)} 0 0 0 ${r3(ox7 + S7)} ${r3(oy7)}`,
    );
    const tx0 = ox7 + (L.panelWidthMm - spec.tabWidthMm) * k7;
    expect(svg).toContain(`M${r3(tx0)} ${r3(oy7)} L${r3(ox7 + L.panelWidthMm * k7)} ${r3(oy7)}`);
  });

  it('papírový model má stejný obrys jako list pásu, rámeček karty na švu dna a kontrolní seznam', () => {
    const L = coinCardHolderLayout(spec);
    const leather = buildCoinHolderSheetSvg(spec);
    const paper = buildCoinHolderPaperModelSvg(spec);
    const outline = (svg: string): string =>
      /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1]!;
    expect(outline(paper)).toBe(outline(leather));
    expect(paper).toContain('width="297mm" height="210mm"');
    // Bez otvorů stehu a perforací (papír se jen ohýbá).
    expect(paper).not.toMatch(/r="0.45"/);
    expect(paper).not.toMatch(/r="0.75"/);
    // Rámeček karty: šířka a výška karty, dolní hrana na švu dna, vystředěný na předním panelu.
    const m = 10;
    const Y0 = m + L.tabLengthMm;
    const cx0 = m + L.frontX0Mm + (L.panelWidthMm - spec.cardWidthMm) / 2;
    expect(paper).toContain(
      `M${r3(cx0)} ${r3(Y0 + L.bottomSeamYMm - spec.cardHeightMm)} h${spec.cardWidthMm} v${spec.cardHeightMm}`,
    );
    for (const t of [
      '① OHYB B',
      '② OHYB A',
      'klobouček',
      'patice',
      'průchodka',
      'KONTROLA MĚŘÍTKA',
      '☐',
    ]) {
      expect(paper).toContain(t);
    }
  });

  it('ztenčení v ohybech: šrafovaná pásma = pásmo ohybu ± okraj, ohyb A pod výkusem', () => {
    const L = coinCardHolderLayout(spec);
    const zones = skiveZones(L, spec);
    expect(zones.length).toBe(2);
    const mm = spec.foldSkiveMarginMm;
    expect(zones[0]!.x0).toBeCloseTo(L.backX1Mm - mm, 9);
    expect(zones[0]!.x1).toBeCloseTo(L.frontX0Mm + mm, 9);
    expect(zones[0]!.y0).toBe(L.scoopRadiusMm);
    expect(zones[1]!.x0).toBeCloseTo(L.frontX1Mm - mm, 9);
    expect(zones[1]!.y0).toBe(0);
    const svg = buildCoinHolderSheetSvg(spec);
    const rects = [
      ...svg.matchAll(
        /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="url\(#skive\)"/g,
      ),
    ];
    expect(rects.length).toBe(2);
    expect(Number(rects[0]![1])).toBeCloseTo(10 + zones[0]!.x0, 2);
    expect(Number(rects[0]![3])).toBeCloseTo(zones[0]!.x1 - zones[0]!.x0, 2);
    expect(svg).toContain('<pattern id="skive"');
    expect(svg).toContain(
      `ztenčit na ${String(spec.foldSkiveThicknessMm).replace('.', ',')} mm z rubu`,
    );
    // Bez ztenčení žádná šrafa; nesmyslná tloušťka neprojde kontrolou.
    expect(buildCoinHolderSheetSvg({ ...spec, foldSkiveThicknessMm: null })).not.toContain(
      'url(#skive)',
    );
    expect(() => buildCoinHolderSheetSvg({ ...spec, foldSkiveThicknessMm: 1.6 })).toThrow(
      /Ztenčení/,
    );
  });

  it('vlastní okno se propíše jen přes spec', () => {
    expect(buildCoinHolderPocketSvg({ ...spec, windowDiameterMm: 30 })).toContain('okno Ø 30');
    expect(buildCoinHolderPocketSvg(spec)).toContain('okno Ø 32');
  });
});
