import { describe, expect, it } from 'vitest';

import {
  A4_SHEET,
  DEFAULT_COIN_CARD_HOLDER,
  GROMMET_FLANGE_MM,
  NAMED_COINS,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';
import {
  buildCoinHolderPaperModelSvg,
  buildCoinHolderPocketSvg,
  buildCoinHolderProcessSvg,
  bandPrickPoints,
  stripTopEdgeYMm,
  buildCoinHolderSheetSvg,
  PROCESS_GRID,
  coinHolderFileStem,
  coinHolderProcessFileStem,
  pocketGlueBand,
  skiveZones,
} from './coin-card-holder.ts';

/** Okraj listu PÁS a papírového modelu (bezpečný okraj tisku 13 mm + 0,5 mm). */
const M = A4_SHEET.marginMm;

/** Generátor pouzdra s mincí mimo výchozí variantu (golden test hlídá jen verzované soubory). */
describe('generátor pouzdra s mincí – varianty', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const r3 = (n: number): string => String(Math.round(n * 1000) / 1000);

  it('název souboru odliší minci, okno i stranu jazyka', () => {
    expect(coinHolderFileStem(spec)).toBe('pouzdro-mince-sablona');
    // Výchozí mince je 50 Kč (bez přípony), mince 40 mm z předlohy dostane příponu.
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: NAMED_COINS['50kc'] })).toBe(
      'pouzdro-mince-sablona',
    );
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: NAMED_COINS.decision })).toBe(
      'pouzdro-mince-sablona-mince-40mm',
    );
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: 40, bodyThicknessMm: 1.2 })).toBe(
      'pouzdro-mince-sablona-mince-40mm-kuze-1-2mm',
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
    // Volitelná průchodka (od v4.11 není ve výchozím střihu) jde do vlastního souboru.
    expect(coinHolderFileStem({ ...spec, grommet: true })).toBe('pouzdro-mince-sablona-pruchodka');
  });

  it('list postupu jen pro výchozí střih a kůži 1,2 mm (výchozí v aplikaci), ne pro jiné varianty', () => {
    expect(coinHolderProcessFileStem(spec)).toBe('pouzdro-mince-postup');
    expect(coinHolderProcessFileStem({ ...spec, bodyThicknessMm: 1.2 })).toBe(
      'pouzdro-mince-postup-kuze-1-2mm',
    );
    expect(coinHolderProcessFileStem({ ...spec, coinDiameterMm: NAMED_COINS.decision })).toBeNull();
    expect(coinHolderProcessFileStem({ ...spec, windowDiameterMm: 18 })).toBeNull();
    expect(coinHolderProcessFileStem({ ...spec, grommet: true })).toBeNull();
  });

  it('výchozí listy jsou bez průchodky, --grommet ji vrátí se stejnou geometrií', () => {
    const G = { ...spec, grommet: true };
    const L = coinCardHolderLayout(G);
    const X = (x: number): string => r3(M + x);
    const Y = (y: number): string => r3(M + L.tabLengthMm + y);
    const hole = `<circle cx="${X(L.grommetXMm!)}" cy="${Y(L.grommetYMm!)}" r="2.5"`;
    expect(buildCoinHolderSheetSvg(G)).toContain(hole);
    expect(buildCoinHolderSheetSvg(G)).toContain('průchodka Ø 5');
    expect(buildCoinHolderPaperModelSvg(G)).toContain('průchodka – propíchnout');
    expect(buildCoinHolderSheetSvg(spec)).not.toContain(hole);
    for (const svg of [
      buildCoinHolderSheetSvg(spec),
      buildCoinHolderPaperModelSvg(spec),
      buildCoinHolderProcessSvg(spec),
    ]) {
      expect(svg).not.toMatch(/průchod/i);
    }
    // Virtuální složení listu s průchodkou: vnitřní panel se otočí kolem středu ohybu B, kroužek
    // (otvor + příruba) musí padnout do výřezu R na předku s rezervou 3 mm a nad karty.
    const sheet = buildCoinHolderSheetSvg(G);
    const folds = [
      ...sheet.matchAll(
        /<path d="M([\d.]+) ([\d.]+) L\1 ([\d.]+)" fill="none" stroke="#7a7a7a" stroke-width="0.2" stroke-dasharray="3 2"/g,
      ),
    ]
      .map((q) => ({ x: Number(q[1]), y0: Number(q[2]) }))
      .sort((a, b) => a.x - b.x);
    expect(folds.length).toBe(4);
    const [, a1, b0, b1] = folds.map((q) => q.x) as [number, number, number, number];
    const top = folds[2].y0;
    const g = [...sheet.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="2.5"/g)].map((q) => ({
      x: Number(q[1]),
      y: Number(q[2]),
    }));
    expect(g.length).toBe(1);
    const gx = b0 - (g[0].x - b1) - a1;
    const gy = g[0].y - top;
    const R = Number(/VÝŘEZ NA PRST R(\d+(?:,\d+)?)/.exec(sheet)![1].replace(',', '.'));
    const flange = spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM;
    expect(Math.hypot(gx, gy) + flange).toBeLessThanOrEqual(R - 3);
    expect(gy + flange).toBeLessThanOrEqual(spec.topOverCardMm);
    // Seznam k zapsání se bez průchodky čísluje souvisle 1–5.
    const paper = buildCoinHolderPaperModelSvg(spec);
    expect(paper).toContain('>5 počet karet a tloušťka bankovek<');
    expect(buildCoinHolderPaperModelSvg(G)).toContain('>6 počet karet a tloušťka bankovek<');
  });

  it('jazyk vlevo: pás je zrcadlově, výřez a průchodka na opačné straně', () => {
    const left = { ...spec, tabSide: 'left' as const, grommet: true };
    const L = coinCardHolderLayout(left);
    const svg = buildCoinHolderSheetSvg(left);
    const m = M;
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
    const { pad, cellW, cellH } = PROCESS_GRID;
    // Buňka 4 (přišití kapsy): přední panel začíná čtvrtkruhem výřezu v levém horním rohu.
    const k4 = Math.min(0.62, (cellH - 28) / L.panelHeightMm);
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
    const y = r3(M + L.tabLengthMm + L.bottomSeamYMm);
    const line = `M${r3(M + inset)} ${y} L${r3(M + L.stripLengthMm - inset)} ${y}`;
    expect(buildCoinHolderSheetSvg(spec)).toContain(line);
    expect(buildCoinHolderPaperModelSvg(spec)).toContain(line);
  });

  it('nulové poloměry kreslí rovné čáry, žádné degenerované oblouky', () => {
    const svg = buildCoinHolderSheetSvg({ ...spec, cornerRadiusMm: 0 });
    expect(svg).not.toMatch(/A0 0 /);
  });

  it('list postupu: kování a jazyk na správných stranách v buňkách 6 a 7', () => {
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderProcessSvg({ ...spec, grommet: true });
    const { pad, cellW, cellH } = PROCESS_GRID;
    const k7 = Math.min(0.62, (cellH - 28) / L.panelHeightMm);
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
    const m = M;
    const Y0 = m + L.tabLengthMm;
    const cx0 = m + L.frontX0Mm + (L.panelWidthMm - spec.cardWidthMm) / 2;
    expect(paper).toContain(
      `M${r3(cx0)} ${r3(Y0 + L.bottomSeamYMm - spec.cardHeightMm)} h${spec.cardWidthMm} v${spec.cardHeightMm}`,
    );
    for (const t of ['① OHYB B', '② OHYB A', 'klobouček', 'patice', 'KONTROLA MĚŘÍTKA', '☐']) {
      expect(paper).toContain(t);
    }
  });

  it('papírový model uvádí minci a kůži těla (výtisky pro 1,5 a 1,2 mm se jinak nerozliší)', () => {
    expect(buildCoinHolderPaperModelSvg(spec)).toContain(
      'Model pro: mince Ø 27,5, kůže tělo 1,5 mm (ohyb B ztenčit na 1 mm).',
    );
    const thin = { ...spec, bodyThicknessMm: 1.2, foldSkiveThicknessMm: null };
    expect(buildCoinHolderPaperModelSvg(thin)).toContain(
      'Model pro: mince Ø 27,5, kůže tělo 1,2 mm (bez ztenčení).',
    );
  });

  it('list PÁS: kroužky ohybů a okrajů šrafy 2 mm za čarou řezu v odpadu, bez kroužků kapsy', () => {
    const L = coinCardHolderLayout(spec);
    const pts = bandPrickPoints(L, spec);
    const of = (k: string) => pts.filter((p) => p.kind === k);
    // 4 čáry ohybů × 2 kroužky na prodloužení čáry: nahoře nad hranou (ohyb A nad dnem výřezu
    // na prst, tedy ve výřezu), dole pod dolní hranou.
    expect(of('fold')).toHaveLength(8);
    const S = L.scoopRadiusMm;
    expect(of('fold').map((p) => r3(p.y))).toEqual(
      [S - 2, 106.1, S - 2, 106.1, -2, 106.1, -2, 106.1].map(r3),
    );
    expect(stripTopEdgeYMm(L, L.backX1Mm)).toBe(S);
    expect(stripTopEdgeYMm(L, L.frontX0Mm)).toBe(S);
    expect(stripTopEdgeYMm(L, L.frontX1Mm)).toBe(0);
    // Okraje šrafy ohybu B (± 3 mm), také za čarou.
    expect(of('skive').map((p) => [r3(p.x), r3(p.y)])).toEqual([
      [r3(L.frontX1Mm - 3), '-2'],
      [r3(L.frontX1Mm - 3), '106.1'],
      [r3(L.innerX0Mm! + 3), '-2'],
      [r3(L.innerX0Mm! + 3), '106.1'],
    ]);
    // Místo pro kapsu se nepropichuje (okénko z 2. výtisku, lekce 6).
    expect(pts.every((p) => p.kind === 'fold' || p.kind === 'skive')).toBe(true);
    // U ztenčení obou ohybů leží i kroužky okrajů šrafy A nahoře ve výřezu (nad obrysem).
    const ab = { ...spec, foldSkiveBands: 'AB' as const };
    const LAB = coinCardHolderLayout(ab);
    for (const p of bandPrickPoints(LAB, ab).filter((q) => q.y < LAB.panelHeightMm)) {
      expect(stripTopEdgeYMm(LAB, p.x) - p.y).toBeCloseTo(2, 9);
    }
    // Kroužky jsou na listu (12 u 1,5 mm), u 1,2 mm bez šrafy jen 8; legenda je vysvětluje.
    const svg = buildCoinHolderSheetSvg(spec);
    expect(svg.match(/<circle class="prick"/g)).toHaveLength(12);
    expect(svg).toContain(
      'Kroužky za čarou řezu = propíchnout do odpadu, na rubu spojit před řezem',
    );
    expect(svg).toContain('okénko: vystřihnout z 2. výtisku (lekce 6)');
    expect(svg).toContain('Tisk 2× na A4');
    expect(svg).not.toContain('kapsa je zakryje');
    const thin = { ...spec, bodyThicknessMm: 1.2, foldSkiveThicknessMm: null };
    expect(buildCoinHolderSheetSvg(thin).match(/<circle class="prick"/g)).toHaveLength(8);
  });

  it('papírový model: patice i klobouček mají křížek ve středu', () => {
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderPaperModelSvg(spec);
    const crosses = [...svg.matchAll(/<path d="M([\d.]+) ([\d.]+) L[\d.]+ [\d.]+ M/g)].map(
      ([, x, y]) => [Number(x) + 1.5, Number(y)],
    );
    const sx = M;
    const sy = M + L.tabLengthMm;
    for (const [x, y] of [
      [L.snapXTabMm, L.snapYTabMm],
      [L.snapXFrontMm, L.snapYFrontMm],
    ]) {
      expect(
        crosses.some(
          ([cx, cy]) => Math.abs(cx - (sx + x)) < 1e-3 && Math.abs(cy - (sy + y)) < 1e-3,
        ),
      ).toBe(true);
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
    expect(Number(r0[1])).toBeCloseTo(M + z.x0, 2);
    expect(Number(r0[2])).toBeCloseTo(M + L.tabLengthMm + z.y0, 2);
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
    expect(Number(lr[1])).toBeCloseTo(M + L.stripLengthMm - z.x1, 2);
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
    const xLeftEdge = M + L.stripLengthMm - (cardX0 + spec.cardWidthMm);
    expect(buildCoinHolderPaperModelSvg(left)).toContain(
      `M${r3(xLeftEdge)} ${r3(M + L.tabLengthMm + L.bottomSeamYMm - spec.cardHeightMm)} h${spec.cardWidthMm}`,
    );
    // Skloňování v kontrolním seznamu.
    expect(buildCoinHolderPaperModelSvg(spec)).toContain('vložit 4 karty');
    expect(buildCoinHolderPaperModelSvg({ ...spec, cardsCount: 5 })).toContain('vložit 5 karet');
  });

  it('vlastní okno se propíše jen přes spec', () => {
    expect(buildCoinHolderPocketSvg({ ...spec, windowDiameterMm: 18 })).toContain('okno Ø 18');
    expect(buildCoinHolderPocketSvg(spec)).toContain('okno Ø 20');
    expect(buildCoinHolderPocketSvg(spec)).toContain('prstenec');
    expect(buildCoinHolderPocketSvg({ ...spec, coinDiameterMm: 40 })).toContain('okno Ø 32');
  });
});

/** Lepené plochy (zelená šrafa jako u Víčka): G1 kapsa, G2 a G3 pruh dna. */
describe('generátor pouzdra s mincí – lepené plochy', () => {
  const variants = [
    DEFAULT_COIN_CARD_HOLDER,
    { ...DEFAULT_COIN_CARD_HOLDER, coinDiameterMm: NAMED_COINS.decision },
    { ...DEFAULT_COIN_CARD_HOLDER, bodyThicknessMm: 1.2, foldSkiveThicknessMm: null },
    {
      ...DEFAULT_COIN_CARD_HOLDER,
      coinDiameterMm: NAMED_COINS.decision,
      bodyThicknessMm: 1.2,
      foldSkiveThicknessMm: null,
    },
  ];

  it('pruh G1 kapsy je mezi obrysem a čárou švu, od začátku švu dolů (nahoře nic)', () => {
    for (const spec of variants) {
      const L = coinCardHolderLayout(spec);
      const so = spec.stitchOffsetMm;
      const d = pocketGlueBand(0, 0, L.pocketWidthMm, L.pocketHeightMm, spec, L.pocketSeamTopMm);
      const nums = [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [
        Number(m[1]),
        Number(m[2]),
      ]);
      const xs = nums.map(([x]) => x);
      const ys = nums.map(([, y]) => y);
      // Vnější hrana = obrys kapsy, vnitřní = čára švu (o odsazení švu dovnitř).
      expect(Math.min(...xs)).toBeCloseTo(0, 6);
      expect(Math.max(...xs)).toBeCloseTo(L.pocketWidthMm, 6);
      expect(xs).toContain(so);
      expect(xs).toContain(L.pocketWidthMm - so);
      expect(ys).toContain(L.pocketHeightMm - so);
      // Nic nad začátkem švu (horní hrana se nelepí).
      expect(Math.min(...ys)).toBeCloseTo(L.pocketSeamTopMm, 6);
    }
  });

  it('list PÁS: G1 na líci předního panelu, G2 a G3 na pruhu dna s napsanou stranou, legenda', () => {
    for (const spec of variants) {
      const svg = buildCoinHolderSheetSvg(spec);
      expect(svg).toContain('clipPath id="glue-g1"');
      expect(svg).toContain('G1 · lepit na LÍC');
      expect(svg).toContain('NElepit – sem se zasouvá mince');
      expect(svg).toContain('G3 · lepit na RUBU zadního');
      expect(svg).toContain('G2 · lepit na RUBU předního');
      expect(svg).toContain('G2 na RUBU · G3 na LÍCI vnitřního');
      expect(svg).toContain('šrafa = kontaktní lepidlo jen sem');
      expect(svg.match(/clipPath id="glue-dno-\d"/g)).toHaveLength(3);
    }
  });

  it('pruh dna sahá od čáry švu k dolní hraně pásu (výška = odsazení švu)', () => {
    const spec = DEFAULT_COIN_CARD_HOLDER;
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderSheetSvg(spec);
    const borders = [
      ...svg.matchAll(
        /<path d="M([\d.]+) ([\d.]+) H([\d.]+) V([\d.]+) H[\d.]+ Z" fill="none" stroke="#2e7d32"/g,
      ),
    ]
      .map((m) => [Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])] as const)
      // Bez vzorku šrafy v legendě (7 mm).
      .filter(([w]) => w > 10);
    expect(borders).toHaveLength(3);
    for (const [w, h] of borders) {
      expect(w).toBeCloseTo(L.panelWidthMm, 3);
      expect(h).toBeCloseTo(L.panelHeightMm - L.bottomSeamYMm, 6);
      expect(h).toBeCloseTo(spec.stitchOffsetMm, 6);
    }
  });

  it('list KAPSA: G1 na RUBU kapsy, horní hrana nelepit, legenda', () => {
    for (const spec of variants) {
      const svg = buildCoinHolderPocketSvg(spec);
      expect(svg).toContain('clipPath id="glue-g1-kapsa"');
      expect(svg).toContain('G1 · lepit na RUBU');
      expect(svg).toContain('NElepit – sem se zasouvá mince');
      expect(svg).toContain(`pruh ${String(spec.stitchOffsetMm).replace('.', ',')} mm`);
      expect(svg).toContain('šrafa = kontaktní lepidlo jen sem');
    }
  });
});
