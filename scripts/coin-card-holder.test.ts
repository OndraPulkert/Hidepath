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
  const r3 = (n: number): string => String(Math.round(n * 1000) / 1000);

  it('název souboru odliší minci, okno i chybějící vnitřní panel', () => {
    expect(coinHolderFileStem(spec)).toBe('pouzdro-mince-sablona');
    expect(coinHolderFileStem({ ...spec, coinDiameterMm: NAMED_COINS['50kc'] })).toBe(
      'pouzdro-mince-sablona-mince-27-5mm',
    );
    expect(coinHolderFileStem({ ...spec, windowDiameterMm: 30 })).toBe(
      'pouzdro-mince-sablona-okno-30mm',
    );
    expect(coinHolderFileStem({ ...spec, innerPanel: false })).toBe(
      'pouzdro-mince-sablona-bez-vnitrniho-panelu',
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
      `L${X(L.scoopStartXMm)} ${Y(0)} A${S} ${S} 0 0 0 ${X(L.backX1Mm)} ${Y(S)}`,
    );
    expect(svg).toContain(`<circle cx="${X(L.grommetXMm!)}" cy="${Y(L.grommetYMm!)}" r="2.5"`);
    expect(svg).toContain('Jazyk pak vyjde zepředu vlevo');
  });

  it('bez vnitřního panelu: dva panely, jeden ohyb, bez průchodky', () => {
    const simple = { ...spec, innerPanel: false };
    const L = coinCardHolderLayout(simple);
    const svg = buildCoinHolderSheetSvg(simple);
    expect(svg).not.toContain('VNITŘNÍ PANEL');
    expect(svg).not.toContain('průchodka');
    expect(svg).toContain('ZADNÍ PANEL');
    expect(L.stripLengthMm).toBeLessThan(coinCardHolderLayout(spec).stripLengthMm);
    // Kružnice průchodky ve výkresu chybí.
    const holes = [...svg.matchAll(/<circle [^>]*r="2.5"/g)];
    expect(holes.length).toBe(0);
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

  it('vlastní okno se propíše jen přes spec', () => {
    expect(buildCoinHolderSheetSvg({ ...spec, windowDiameterMm: 30 })).toContain('okno Ø 30');
    expect(buildCoinHolderSheetSvg(spec)).toContain('okno Ø 32');
  });
});
