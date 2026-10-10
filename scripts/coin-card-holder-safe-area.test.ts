import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  PRINT_SAFE_MM,
  type CoinCardHolderSpec,
  checkCoinCardHolder,
  foldSkiveFor,
} from '../src/lib/geometry/coin-card-holder.ts';
import { PRACTICE_THICKNESSES } from '../src/lib/geometry/coin-card-holder-practice.ts';
import { buildCoinHolderPracticeSvg } from './coin-card-holder-practice.ts';
import {
  drawnBoxes,
  estimateTextWidthMm,
  outsideSafeArea,
  pathPoints,
} from './coin-card-holder-safe-area.ts';
import {
  buildCoinHolderPaperModelSvg,
  buildCoinHolderPocketSvg,
  buildCoinHolderProcessSvg,
  buildCoinHolderSheetSvg,
} from './coin-card-holder.ts';

/**
 * Tiskárna uživatele (HP DeskJet 2700) netiskne 12,7 mm u dolní hrany listu na výšku – na šířku
 * ten pruh padne vlevo nebo vpravo. Proto všechno nakreslené na každém tištěném listu pouzdra
 * s mincí (čáry včetně poloviny tloušťky, kroužky, text, legenda, úsečka 50 mm) leží aspoň
 * 13 mm od každé hrany A4, pro každou variantu, kterou generátor přijme.
 */
const report = (svg: string): string[] =>
  outsideSafeArea(svg, PRINT_SAFE_MM).map(
    (b) =>
      `${b.what} [${b.x0.toFixed(2)}–${b.x1.toFixed(2)}] × [${b.y0.toFixed(2)}–${b.y1.toFixed(2)}]`,
  );

/** Varianty v mezích přepínačů generátoru (--coin 15–60, --window, --thickness 1–2, --cards 1–6, --grommet). */
function variants(): CoinCardHolderSpec[] {
  const d = DEFAULT_COIN_CARD_HOLDER;
  const coins = [...new Set([15, 20, ...Object.values(NAMED_COINS), 30, 35, 45, 50, 60])];
  const out: CoinCardHolderSpec[] = [];
  for (const coin of coins)
    for (const window of [null, 18])
      for (const t of [1, 1.2, 1.5, 1.8, 2])
        for (const cards of [1, 4, 6])
          for (const grommet of [false, true]) {
            const spec: CoinCardHolderSpec = {
              ...d,
              coinDiameterMm: coin,
              windowDiameterMm: window,
              bodyThicknessMm: t,
              foldSkiveThicknessMm: foldSkiveFor(t),
              cardsCount: cards,
              grommet,
            };
            if (checkCoinCardHolder(spec).length === 0) out.push(spec);
          }
  return out;
}

describe('tištěné listy pouzdra s mincí: nic blíž než 13 mm k hraně A4', () => {
  const specs = variants();
  const name = (s: CoinCardHolderSpec): string =>
    `mince ${s.coinDiameterMm}, okno ${s.windowDiameterMm ?? 'auto'}, kůže ${s.bodyThicknessMm}, ${s.cardsCount} karty${s.grommet ? ', průchodka' : ''}`;

  it('generátor přijme dost variant, aby test něco hlídal (výchozí mezi nimi)', () => {
    expect(specs.length).toBeGreaterThan(50);
    expect(specs.some((s) => s.coinDiameterMm === 40 && s.bodyThicknessMm === 1.2)).toBe(true);
    expect(checkCoinCardHolder(DEFAULT_COIN_CARD_HOLDER)).toEqual([]);
  });

  it.each([
    ['PÁS (šablona)', buildCoinHolderSheetSvg],
    ['papírový model', buildCoinHolderPaperModelSvg],
    ['KAPSA a forma', buildCoinHolderPocketSvg],
  ] as const)('%s – všechny varianty', (_, build) => {
    const bad: string[] = [];
    for (const spec of specs) {
      for (const r of report(build(spec))) bad.push(`${name(spec)}: ${r}`);
    }
    expect(bad).toEqual([]);
  });

  it('postup skládání – výchozí střih a jeho varianty kůže, mince a průchodky', () => {
    const bad: string[] = [];
    for (const spec of specs.filter((s) => s.cardsCount === DEFAULT_COIN_CARD_HOLDER.cardsCount)) {
      for (const r of report(buildCoinHolderProcessSvg(spec))) bad.push(`${name(spec)}: ${r}`);
    }
    expect(bad).toEqual([]);
  });

  it('cvičný proužek – obě tloušťky z lekce i krajní 1 a 2 mm', () => {
    for (const t of [...PRACTICE_THICKNESSES, 1, 2]) {
      expect(report(buildCoinHolderPracticeSvg(t)), `kůže ${t} mm`).toEqual([]);
    }
  });

  it('kontrolní úsečka 50 mm je na každém listu celá (dvě zarážky 50 mm od sebe)', () => {
    const spec = DEFAULT_COIN_CARD_HOLDER;
    for (const svg of [
      buildCoinHolderSheetSvg(spec),
      buildCoinHolderPaperModelSvg(spec),
      buildCoinHolderPocketSvg(spec),
      buildCoinHolderPracticeSvg(1.5),
    ]) {
      const bars = drawnBoxes(svg).boxes.filter(
        (b) => b.what.startsWith('<path>') && Math.abs(b.x1 - b.x0 - 50.3) < 0.2,
      );
      expect(bars.length).toBeGreaterThan(0);
    }
  });
});

describe('měření obalu kresby (pomocník testu)', () => {
  it('oblouk se počítá celý, ne jen koncové body', () => {
    // Půlkruh R10 z (0,10) přes vrchol (10,0) do (20,10): vrchol leží 10 mm nad konci.
    const ys = pathPoints('M0 10 A10 10 0 0 1 20 10').map((p) => p[1]);
    expect(Math.min(...ys)).toBeCloseTo(0, 2);
  });

  it('relativní h/v a Z se sledují', () => {
    expect(pathPoints('M5 5 h10 v20 h-10 Z')).toEqual([
      [5, 5],
      [15, 5],
      [15, 25],
      [5, 25],
    ]);
  });

  it('text: šířka z metrik, zarovnání na střed a konec', () => {
    const w = estimateTextWidthMm('KONTROLA MĚŘÍTKA: 50 mm', 2.4);
    expect(w).toBeGreaterThan(30);
    expect(w).toBeLessThan(40);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<text x="50" y="50" font-size="2" text-anchor="end">abc</text></svg>';
    const [b] = drawnBoxes(svg).boxes;
    expect(b.x1).toBeCloseTo(50, 6);
    expect(b.y0).toBeCloseTo(47.96, 6);
  });

  it('prvek s transformací test odmítne (souřadnice by nesouhlasily)', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<g transform="scale(2)"><circle cx="1" cy="1" r="1"/></g></svg>';
    expect(() => drawnBoxes(svg)).toThrow(/transform/);
  });
});
