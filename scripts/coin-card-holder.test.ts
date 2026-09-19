import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';
import {
  buildCoinHolderProcessSvg,
  buildCoinHolderSheetSvg,
  coinHolderFileStem,
} from './coin-card-holder.ts';

/** Generátor pouzdra s mincí mimo výchozí variantu (golden test hlídá jen verzované soubory). */
describe('generátor pouzdra s mincí – varianty', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;

  it('název souboru odliší minci, okno i dělicí panel, aby varianta nepřepsala verzovaný střih', () => {
    expect(coinHolderFileStem(spec)).toBe('pouzdro-mince-sablona');
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: NAMED_COINS['50kc'] })).toBe(
      'pouzdro-mince-sablona-mince-27-5mm',
    );
    expect(coinHolderFileStem({ ...spec, windowDiameterMm: 30 })).toBe(
      'pouzdro-mince-sablona-okno-30mm',
    );
    expect(
      coinHolderFileStem({
        ...spec,
        coinDiameterMm: 27.5,
        dividerPanel: true,
        windowDiameterMm: 20,
      }),
    ).toBe('pouzdro-mince-sablona-mince-27-5mm-okno-20mm-delici-panel');
  });

  it('jazyk vlevo: konec začíná na levé hraně, výřez v pravém dolním rohu, průchodka vpravo', () => {
    const left = { ...spec, tabSide: 'left' as const };
    const L = coinCardHolderLayout(left);
    const svg = buildCoinHolderSheetSvg(left);
    const m = 12;
    const y0 = m + L.tabLengthMm;
    const r2 = (n: number): number => Math.round(n * 100) / 100;
    const body = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1];
    expect(body.startsWith(`M${m} ${r2(y0 - L.tabLengthMm + L.tabEndRadiusMm)} A10 10 0 0 1`)).toBe(
      true,
    );
    const Rs = L.scoopRadiusMm;
    const W = L.panelWidthMm;
    expect(body).toContain(
      `L${m + W} ${r2(y0 + L.frontTopMm - Rs)} A${Rs} ${Rs} 0 0 0 ${m + W - Rs} ${r2(y0 + L.frontTopMm)}`,
    );
    expect(svg).toContain(`<circle cx="${m + L.grommetXMm}" cy="${r2(y0 + L.grommetYMm)}" r="2.5"`);
    expect(L.grommetXMm).toBeGreaterThan(L.tabX1Mm);
    expect(svg).toContain('jazyk zepředu vlevo a výřez s průchodkou vpravo');
    // Postup se také vykreslí (bez chyby) a zmiňuje stejné rozměry.
    expect(buildCoinHolderProcessSvg(left)).toContain(
      `tělo 66 × ${String(L.bodyLengthMm).replace('.', ',')} mm`,
    );
  });

  it('konec jazyka se kreslí jako dva rohy a rovná hrana ve správné délce (i plný půlkruh)', () => {
    const s = { ...spec, tabEndRadiusMm: 6 };
    const L = coinCardHolderLayout(s);
    const svg = buildCoinHolderSheetSvg(s);
    const body = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(svg)![1];
    const m = 12;
    const top = m; // vrchol jazyka leží na okraji stránky (y = m)
    expect(body).toContain(
      `A6 6 0 0 1 ${m + L.tabX0Mm + 6} ${top} L${m + L.tabX1Mm - 6} ${top} A6 6 0 0 1 ${m + L.tabX1Mm} ${top + 6}`,
    );
    // Nejmenší y v cestě = okraj stránky, tedy jazyk není o nic delší než tabLengthMm.
    const ys = [...body.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((q) => Number(q[2]));
    expect(Math.min(...ys)).toBeCloseTo(top, 6);
    // Plný půlkruh (R = půl šířky) je jeden oblouk přes celou šířku jazyka.
    const half = { ...spec, tabEndRadiusMm: null };
    const Lh = coinCardHolderLayout(half);
    const bh = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(
      buildCoinHolderSheetSvg(half),
    )![1];
    expect(bh).toContain(
      `A${Lh.tabEndRadiusMm} ${Lh.tabEndRadiusMm} 0 0 1 ${m + Lh.tabX1Mm} ${top + Lh.tabEndRadiusMm}`,
    );
  });

  it('list postupu: výřez předku ve správném rohu, švy u výřezu kratší, jazyk zepředu vpravo', () => {
    const L = coinCardHolderLayout(spec);
    const svg = buildCoinHolderProcessSvg(spec);
    const pad = 8;
    const cellW = (297 - 2 * pad) / 4;
    const cellH = (210 - 2 * pad - 10) / 2;
    // Generátor zapisuje souřadnice na 3 desetinná místa.
    const r2 = (n: number): string => String(Math.round(n * 1000) / 1000);
    const Rs = L.scoopRadiusMm;
    // Buňka 4 (přišití kapsy): přední panel začíná čtvrtkruhem výřezu v levém horním rohu.
    const k4 = 0.62;
    const ox4 = pad + 3 * cellW + (cellW - L.panelWidthMm * k4) / 2;
    const oy4 = pad + 12;
    expect(svg).toContain(
      `M${r2(ox4)} ${r2(oy4 + Rs * k4)} A${r2(Rs * k4)} ${r2(Rs * k4)} 0 0 0 ${r2(ox4 + Rs * k4)} ${r2(oy4)}`,
    );
    // Buňka 7 (hotovo zepředu): jazyk začíná na x jazyka z modelu (vpravo); stehy vlevo = kratší řada.
    const k7 = 0.62;
    const ox7 = pad + 2 * cellW + (cellW - L.panelWidthMm * k7) / 2;
    const oy7 = pad + cellH + 14;
    expect(svg).toContain(
      `M${r2(ox7 + L.tabX0Mm * k7)} ${r2(oy7)} L${r2(ox7 + L.tabX1Mm * k7)} ${r2(oy7)}`,
    );
    const threadRuns = (x: number): number => {
      const paths = [...svg.matchAll(/<path d="(M[^"]+)" stroke="#efe3c2"/g)].map((m) => m[1]);
      const col = paths.find((d) => d.startsWith(`M${r2(x)} `));
      return col ? [...col.matchAll(/M/g)].length : -1;
    };
    const so = spec.stitchOffsetMm;
    expect(threadRuns(ox7 + so * k7)).toBe(
      Math.floor(L.seamLengthScoopSideMm / spec.stitchPitchMm),
    );
    expect(threadRuns(ox7 + (L.panelWidthMm - so) * k7)).toBe(
      Math.floor(L.seamLengthTabSideMm / spec.stitchPitchMm),
    );
  });

  it('vlastní okno se propíše do kapsy i postupu jen přes spec, výchozí soubory zůstávají', () => {
    const s = { ...spec, windowDiameterMm: 30 };
    expect(buildCoinHolderSheetSvg(s)).toContain('okno Ø 30');
    expect(buildCoinHolderSheetSvg(spec)).toContain('okno Ø 32');
  });
});
