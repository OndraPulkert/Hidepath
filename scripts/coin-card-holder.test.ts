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
    // Jiný počet karet / tloušťka kůže nesmí přepsat verzovaný výchozí střih.
    expect(coinHolderFileStem({ ...spec, cardsCount: 6 })).toBe('pouzdro-mince-sablona-karty-6');
    expect(coinHolderFileStem({ ...spec, bodyThicknessMm: 1.2 })).toBe(
      'pouzdro-mince-sablona-kuze-1-2mm',
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
    expect(svg).toContain('nejdřív vnitřní za přední (B), pak zadní přes vše (A)');
    // Hotovo zezadu: výřez je v pravém horním rohu jako čtvrtelipsa zadního panelu
    // (šířka backScoopRx od hrany jazyka, hloubka R) – stejně jako na šabloně.
    const k8 = k4;
    const ox8 = pad + 3 * cellW + (cellW - L.panelWidthMm * k8) / 2;
    const oy8 = pad + cellH + 14;
    const W8 = L.panelWidthMm * k8;
    const RX8 = L.backScoopRxMm * k8;
    expect(svg).toContain(
      `L${r3(ox8 + W8 - RX8)} ${r3(oy8)} A${r3(RX8)} ${r3(S4)} 0 0 0 ${r3(ox8 + W8)} ${r3(oy8 + S4)}`,
    );
  });

  it('čára švu dna končí uvnitř zaoblených rohů (nevyčnívá za řez)', () => {
    const L = coinCardHolderLayout(spec);
    const rc = spec.cornerRadiusMm;
    const d = rc - spec.stitchOffsetMm;
    const inset = rc - Math.sqrt(rc * rc - d * d);
    expect(inset).toBeGreaterThan(0.5);
    const y = r3(10 + L.tabLengthMm + L.bottomSeamYMm);
    const line = `M${r3(10 + inset)} ${y} L${r3(10 + L.stripLengthMm - inset)} ${y}`;
    expect(buildCoinHolderSheetSvg(spec)).toContain(line);
    expect(buildCoinHolderPaperModelSvg(spec)).toContain(line);
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
      /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1];
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
    // Výchozí: ztenčuje se jen užší ohyb B; s 'AB' i ohyb A (pod výkusem).
    expect(zones.length).toBe(1);
    const mm = spec.foldSkiveMarginMm;
    expect(zones[0].x0).toBeCloseTo(L.frontX1Mm - mm, 9);
    expect(zones[0].x1).toBeCloseTo(L.innerX0Mm! + mm, 9);
    expect(zones[0].y0).toBe(0);
    const both = skiveZones(coinCardHolderLayout({ ...spec, foldSkiveBands: 'AB' }), {
      ...spec,
      foldSkiveBands: 'AB',
    });
    expect(both.length).toBe(2);
    expect(both[0].y0).toBe(L.scoopRadiusMm);
    // Ztenčení prodlouží ohyb B o π·(t − s)/2 (posun neutrální osy).
    const plain = coinCardHolderLayout({ ...spec, foldSkiveThicknessMm: null });
    expect(L.foldFrontInnerMm - plain.foldFrontInnerMm).toBeCloseTo(
      (Math.PI * (spec.bodyThicknessMm - spec.foldSkiveThicknessMm!)) / 2,
      1,
    );
    const svg = buildCoinHolderSheetSvg(spec);
    const rects = [
      ...svg.matchAll(
        /<rect class="skive-zone" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g,
      ),
    ];
    expect(rects.length).toBe(1);
    const z = zones[0];
    const r0 = rects[0];
    expect(Number(r0[1])).toBeCloseTo(10 + z.x0, 2);
    expect(Number(r0[2])).toBeCloseTo(10 + L.tabLengthMm + z.y0, 2);
    expect(Number(r0[3])).toBeCloseTo(z.x1 - z.x0, 2);
    expect(Number(r0[4])).toBeCloseTo(z.y1 - z.y0, 2);
    expect(zones[0].x1).toBeCloseTo(L.innerX0Mm! + mm, 9);
    // Šrafa je vektor (čáry), ne <pattern> – Chromium by vzor v PDF rastroval.
    expect(svg).not.toContain('<pattern');
    // Každá čára šrafy leží uvnitř svého obdélníku (ořez nesmí přetéct do panelů).
    for (const sv of [
      svg,
      buildCoinHolderSheetSvg({ ...spec, tabSide: 'left', foldSkiveBands: 'AB' }),
    ]) {
      const boxes = [
        ...sv.matchAll(
          /<rect class="skive-zone" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g,
        ),
      ].map((m) => m.slice(1, 5).map(Number) as [number, number, number, number]);
      const hatches = [...sv.matchAll(/<path d="([^"]+)" stroke="#b9c3bc" stroke-width="0.3"/g)];
      expect(hatches.length).toBe(boxes.length);
      hatches.forEach((h, i) => {
        const [bx, by, bw, bh] = boxes[i];
        const nums = [...h[1].matchAll(/-?[\d.]+/g)].map((n) => Number(n[0]));
        expect(nums.length).toBeGreaterThan(8);
        for (let k = 0; k < nums.length; k += 2) {
          expect(nums[k]).toBeGreaterThanOrEqual(bx - 1e-3);
          expect(nums[k]).toBeLessThanOrEqual(bx + bw + 1e-3);
          expect(nums[k + 1]).toBeGreaterThanOrEqual(by - 1e-3);
          expect(nums[k + 1]).toBeLessThanOrEqual(by + bh + 1e-3);
        }
      });
    }
    expect(svg).toContain(
      `ztenčit na ${String(spec.foldSkiveThicknessMm).replace('.', ',')} mm z rubu`,
    );
    // Zrcadlená varianta: pás je otočený, zóna leží na zrcadlové pozici.
    const left = { ...spec, tabSide: 'left' as const };
    const lsvg = buildCoinHolderSheetSvg(left);
    const lr = /<rect class="skive-zone" x="([\d.]+)"/.exec(lsvg)!;
    expect(Number(lr[1])).toBeCloseTo(10 + L.stripLengthMm - z.x1, 2);
    // Bez ztenčení žádná šrafa; nesmyslné hodnoty neprojdou kontrolou.
    expect(buildCoinHolderSheetSvg({ ...spec, foldSkiveThicknessMm: null })).not.toContain(
      'skive-zone',
    );
    expect(() => buildCoinHolderSheetSvg({ ...spec, foldSkiveThicknessMm: 1.4 })).toThrow(
      /Ztenčení/,
    );
    expect(() => buildCoinHolderSheetSvg({ ...spec, foldSkiveThicknessMm: 0.5 })).toThrow(
      /Ztenčení/,
    );
    expect(() => buildCoinHolderSheetSvg({ ...spec, foldSkiveMarginMm: 9 })).toThrow(
      /foldSkiveMarginMm/,
    );
  });

  it('papírový model zrcadleně: obrys shodný se zrcadleným pásem, rámeček karty zrcadlený', () => {
    const left = { ...spec, tabSide: 'left' as const };
    const L = coinCardHolderLayout(left);
    const outline = (svg: string): string =>
      /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1];
    expect(outline(buildCoinHolderPaperModelSvg(left))).toBe(
      outline(buildCoinHolderSheetSvg(left)),
    );
    const cardX0 = L.frontX0Mm + (L.panelWidthMm - spec.cardWidthMm) / 2;
    const xLeftEdge = 10 + L.stripLengthMm - (cardX0 + spec.cardWidthMm);
    expect(buildCoinHolderPaperModelSvg(left)).toContain(
      `M${r3(xLeftEdge)} ${r3(10 + L.tabLengthMm + L.bottomSeamYMm - spec.cardHeightMm)} h${spec.cardWidthMm}`,
    );
    // Skloňování v kontrolním seznamu.
    expect(buildCoinHolderPaperModelSvg(spec)).toContain('vložit 4 karty');
    expect(buildCoinHolderPaperModelSvg({ ...spec, cardsCount: 5 })).toContain('vložit 5 karet');
  });

  it('vlastní okno se propíše jen přes spec', () => {
    expect(buildCoinHolderPocketSvg({ ...spec, windowDiameterMm: 30 })).toContain('okno Ø 30');
    expect(buildCoinHolderPocketSvg(spec)).toContain('okno Ø 32');
  });
});
