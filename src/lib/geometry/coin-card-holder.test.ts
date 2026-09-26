import { describe, expect, it } from 'vitest';

import {
  A4_SHEET,
  CALIBRATION_GAP_MM,
  SEAM_LABEL_GAP_MM,
  DEFAULT_COIN_CARD_HOLDER,
  LEGEND_HEIGHT_MM,
  NAMED_COINS,
  checkCoinCardHolder,
  coinCardHolderLayout,
} from './coin-card-holder';

describe('pouzdro s vsazenou mincí – model (pás tří panelů, ohyby na bocích)', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const L = coinCardHolderLayout(spec);

  it('výchozí střih projde všemi kontrolami', () => {
    expect(checkCoinCardHolder(spec)).toEqual([]);
  });

  it('panel: karta s vůlí a okraj k ohybu, výška z karty a stehu dna', () => {
    expect(L.panelWidthMm).toBeCloseTo(
      spec.cardWidthMm + 2 * spec.cardSideClearanceMm + 2 * spec.sideMarginMm,
      9,
    );
    expect(L.panelHeightMm).toBeCloseTo(
      spec.stitchOffsetMm + spec.cardHeightMm + spec.topOverCardMm,
      9,
    );
    // Karta se vejde mezi boční ohyby s vůlí na obou stranách.
    expect(L.panelWidthMm - 2 * spec.sideMarginMm).toBeGreaterThan(spec.cardWidthMm);
    // Šev dna je pod kartou, karta sedí pod horní hranou o přesah + půl tloušťky obsahu.
    expect(L.bottomSeamYMm).toBeCloseTo(L.panelHeightMm - spec.stitchOffsetMm, 9);
    expect(L.cardBelowRimMm).toBe(spec.topOverCardMm);
    // Kování je nad kartami: dřík druku (≈ Ø 5) i příruba průchodky končí nad horní hranou karet.
    expect(spec.snapFromTopMm + 2.5).toBeLessThanOrEqual(L.cardBelowRimMm);
    expect(spec.grommetFromEdgeMm + spec.grommetHoleMm / 2 + 2.5).toBeLessThanOrEqual(
      L.cardBelowRimMm,
    );
    // Rozměr předlohy ≈ 72 × 104 mm, bankovky složené napůl (69–74 napříč) se vejdou.
    expect(L.panelWidthMm).toBeGreaterThanOrEqual(70);
    expect(L.panelHeightMm).toBeGreaterThan(100);
  });

  it('pás: tři panely a dva ohyby, ohyb A obepíná vnitřní panel i obsah', () => {
    const t = spec.bodyThicknessMm;
    const cards = spec.cardsCount * spec.cardThicknessMm;
    expect(L.cardsThicknessMm).toBeCloseTo(cards, 6);
    // Ohyb B jen kolem karet, ohyb A kolem karet + vnitřní panel + bankovky.
    expect(L.foldFrontInnerMm).toBeCloseTo(Math.PI * (cards / 2 + t / 2), 2);
    expect(L.foldBackFrontMm).toBeCloseTo(
      Math.PI * ((cards + t + spec.billsThicknessMm) / 2 + t / 2),
      2,
    );
    expect(L.foldBackFrontMm).toBeGreaterThan(L.foldFrontInnerMm);
    // Hranice panelů na sebe navazují a pás je jejich součet.
    expect(L.backX1Mm - L.backX0Mm).toBeCloseTo(L.panelWidthMm, 9);
    expect(L.frontX0Mm - L.backX1Mm).toBeCloseTo(L.foldBackFrontMm, 6);
    expect(L.frontX1Mm - L.frontX0Mm).toBeCloseTo(L.panelWidthMm, 9);
    expect(L.innerX0Mm! - L.frontX1Mm).toBeCloseTo(L.foldFrontInnerMm, 6);
    expect(L.stripLengthMm).toBeCloseTo(
      3 * L.panelWidthMm + L.foldBackFrontMm + L.foldFrontInnerMm,
      6,
    );
    // Bez vnitřního panelu zbydou dva panely a jeden ohyb kolem karet.
    const simple = coinCardHolderLayout({ ...spec, innerPanel: false });
    expect(simple.innerX0Mm).toBeNull();
    expect(simple.grommetXMm).toBeNull();
    expect(simple.foldFrontInnerMm).toBe(0);
    expect(simple.foldBackFrontMm).toBeCloseTo(Math.PI * (cards / 2 + t / 2), 2);
    expect(simple.stripLengthMm).toBeCloseTo(2 * L.panelWidthMm + simple.foldBackFrontMm, 6);
    // Bez vnitřního panelu by jeden bok zůstal otevřený – kontrola to odmítne.
    expect(checkCoinCardHolder({ ...spec, innerPanel: false }).join(' ')).toMatch(/otevřená/);
  });

  it('jazyk: oblouk přes celý obsah, k druku, přesah a rezerva na zkoušku', () => {
    const t = spec.bodyThicknessMm;
    // Od neutrální osy zadního panelu k neutrální ose jazyka na předku je celá tloušťka stohu.
    const stack = 2 * t + spec.cardsCount * spec.cardThicknessMm + t + spec.billsThicknessMm;
    expect(L.tabWrapMm).toBeCloseTo((Math.PI * stack) / 2, 1);
    expect(L.tabNominalLengthMm).toBeCloseTo(
      L.tabWrapMm + spec.snapFromTopMm + spec.tabBeyondSnapMm,
      6,
    );
    expect(L.tabLengthMm).toBeCloseTo(L.tabNominalLengthMm + spec.tabFitReserveMm, 6);
    // Jazyk je u levého konce pásu (po složení dopadne na pravou hranu předku).
    expect(L.tabX0Mm).toBe(0);
    expect(L.tabX1Mm).toBe(spec.tabWidthMm);
    expect(spec.tabWidthMm / L.panelWidthMm).toBeGreaterThan(0.45);
    expect(spec.tabWidthMm / L.panelWidthMm).toBeLessThan(0.55);
    // Klobouček na ose jazyka, patice na předku pod jeho dráhou.
    expect(L.snapXTabMm).toBeCloseTo(spec.tabWidthMm / 2, 9);
    expect(-L.snapYTabMm).toBeCloseTo(L.tabWrapMm + spec.snapFromTopMm, 6);
    expect(L.snapXFrontMm).toBeCloseTo(L.frontX1Mm - spec.tabWidthMm / 2, 9);
    expect(L.snapYFrontMm).toBe(spec.snapFromTopMm);
    expect(L.tabEndRadiusMm).toBe(spec.tabEndRadiusMm);
  });

  it('výřez na prst: jeden oblouk U přes pásmo ohybu A, po složení čtvrtkruh v obou panelech', () => {
    expect(L.scoopStartXMm).toBeCloseTo(L.backX1Mm - L.scoopRadiusMm, 9);
    expect(L.scoopEndXMm).toBeCloseTo(L.frontX0Mm + L.scoopRadiusMm, 9);
    expect(L.scoopEndXMm - L.scoopStartXMm).toBeCloseTo(2 * L.scoopRadiusMm + L.foldBackFrontMm, 6);
    // Mezi kořenem jazyka a začátkem výřezu zbývá můstek.
    expect(L.scoopStartXMm - L.tabX1Mm).toBeGreaterThanOrEqual(spec.minLigamentMm);
    // Výřez odkryje karty a je hlubší než přesah panelu nad nimi.
    expect(L.cardExposedMm).toBeCloseTo(L.scoopRadiusMm - L.cardBelowRimMm, 6);
    expect(L.cardExposedMm).toBeGreaterThanOrEqual(15);
  });

  it('průchodka je ve vnitřním panelu naproti jazyku a celá se vejde do výřezu', () => {
    expect(L.grommetXMm).toBeCloseTo(L.innerX1Mm! - spec.grommetFromEdgeMm, 9);
    expect(L.grommetYMm).toBeCloseTo(spec.grommetFromEdgeMm, 9);
    // Po složení leží roh vnitřního panelu přesně v rohu s výřezem.
    const foldBCentre = L.frontX1Mm + L.foldFrontInnerMm / 2;
    expect(2 * foldBCentre - L.innerX1Mm!).toBeCloseTo(L.frontX0Mm, 6);
    const fromCorner = Math.hypot(spec.grommetFromEdgeMm, spec.grommetFromEdgeMm);
    expect(fromCorner + spec.grommetHoleMm / 2 + 3 + spec.minLigamentMm).toBeLessThanOrEqual(
      L.scoopRadiusMm,
    );
  });

  it('šev dna: jedna řada na panel, rozteč ze specifikace, tečky se sekají po složení', () => {
    const run = L.panelWidthMm - 2 * spec.stitchOffsetMm;
    expect(L.bottomSeamHoles).toBe(Math.floor(run / spec.stitchPitchMm) + 1);
    expect(L.bottomSeamYMm + spec.stitchOffsetMm).toBeCloseTo(L.panelHeightMm, 9);
  });

  it('kapsa: rovná plocha kolem důlku, okno po celých mm, pod jazykem a nad švem dna', () => {
    const formHole = spec.coinDiameterMm + 2 * spec.pocketThicknessMm + spec.formHoleClearanceMm;
    expect(L.formHoleDiameterMm).toBeCloseTo(formHole, 6);
    expect(L.pocketWidthMm).toBeCloseTo(
      formHole + 2 * (spec.pocketFlatMm + spec.stitchOffsetMm),
      6,
    );
    expect(L.pocketHeightMm).toBeCloseTo(
      spec.stitchOffsetMm + spec.pocketFlatMm + formHole + spec.coinTopOverlapMm,
      6,
    );
    expect(Number.isInteger(L.windowDiameterMm)).toBe(true);
    expect(L.coinRingMm).toBeGreaterThanOrEqual(spec.minCoinRingMm);
    expect(L.pocketXMm).toBeCloseTo((L.panelWidthMm - L.pocketWidthMm) / 2, 9);
    // Pod koncem jazyka i s rezervou a nad švem dna.
    expect(L.pocketYMm).toBeGreaterThanOrEqual(L.tabEndOnFrontMm + spec.snapClearanceMm - 1e-9);
    expect(L.pocketYMm + L.pocketHeightMm).toBeLessThanOrEqual(
      L.bottomSeamYMm - spec.pocketFromBottomMinMm + 1e-9,
    );
    // Horní roh kapsy nechá můstek od oblouku výřezu (v soustavě předního panelu je výřez vlevo).
    const rp = spec.pocketTopRadiusMm;
    const d = Math.hypot(L.pocketXMm + rp, L.pocketYMm + rp) - rp;
    expect(d).toBeGreaterThanOrEqual(L.scoopRadiusMm + spec.minLigamentMm - 0.05);
  });

  it('všechny pojmenované mince dají platný střih a mění jen kapsu, okno a formu', () => {
    for (const [name, d] of Object.entries(NAMED_COINS)) {
      const s = { ...spec, coinDiameterMm: d };
      expect(checkCoinCardHolder(s), name).toEqual([]);
      const l = coinCardHolderLayout(s);
      expect(l.stripLengthMm, name).toBe(L.stripLengthMm);
      expect(l.tabLengthMm, name).toBe(L.tabLengthMm);
      expect(l.formHoleDiameterMm, name).toBeCloseTo(
        d + 2 * spec.pocketThicknessMm + spec.formHoleClearanceMm,
        6,
      );
    }
    expect(NAMED_COINS['50kc']).toBe(27.5);
    expect(NAMED_COINS.decision).toBe(spec.coinDiameterMm);
  });

  it('pás se vejde na A4 na šířku nad kalibrační úsečku, kapsa na A4 na výšku', () => {
    const { widthMm: W, heightMm: H, marginMm: m } = A4_SHEET;
    expect(W).toBe(297);
    const calY = H - m - LEGEND_HEIGHT_MM - CALIBRATION_GAP_MM;
    expect(m + L.tabLengthMm + L.panelHeightMm + SEAM_LABEL_GAP_MM + 1).toBeLessThanOrEqual(
      calY - 3,
    );
    expect(L.stripLengthMm + 2 * m).toBeLessThanOrEqual(W);
    // Delší rezerva jazyka se na list nevejde – kontrola to musí hlásit.
    expect(checkCoinCardHolder({ ...spec, tabFitReserveMm: 20 }).join(' ')).toMatch(/A4/);
  });

  it('kontroly odhalí kolize a špatné parametry', () => {
    expect(checkCoinCardHolder({ ...spec, scoopRadiusMm: 45 }).join(' ')).toMatch(/Mezi jazykem/);
    expect(checkCoinCardHolder({ ...spec, scoopRadiusMm: 15 }).join(' ')).toMatch(/mělký/);
    expect(checkCoinCardHolder({ ...spec, tabWidthMm: 36 }).join(' ')).toMatch(/Mezi jazykem/);
    expect(checkCoinCardHolder({ ...spec, topOverCardMm: 10 }).join(' ')).toMatch(/Dřík druku/);
    expect(checkCoinCardHolder({ ...spec, topOverCardMm: 10 }).join(' ')).toMatch(
      /Příruba průchodky/,
    );
    expect(checkCoinCardHolder({ ...spec, grommetFromEdgeMm: 20 }).join(' ')).toMatch(
      /nebyla celá vidět/,
    );
    expect(checkCoinCardHolder({ ...spec, coinDiameterMm: 50 }).length).toBeGreaterThan(0);
    expect(checkCoinCardHolder({ ...spec, windowDiameterMm: 60 }).join(' ')).toMatch(
      /menší než mince/,
    );
    expect(checkCoinCardHolder({ ...spec, tabFitReserveMm: 0 }).join(' ')).toMatch(
      /tabFitReserveMm/,
    );
    expect(checkCoinCardHolder({ ...spec, sideMarginMm: 1 }).join(' ')).toMatch(/sideMarginMm/);
    expect(checkCoinCardHolder({ ...spec, topOverCardMm: 0 }).join(' ')).toMatch(/Panely/);
    expect(checkCoinCardHolder({ ...spec, stitchPitchMm: 0 }).join(' ')).toMatch(/kladné/);
    expect(checkCoinCardHolder({ ...spec, cardsCount: 2.5 }).join(' ')).toMatch(/celé číslo/);
    expect(checkCoinCardHolder({ ...spec, cardsCount: 0 }).join(' ')).toMatch(/cardsCount/);
    expect(checkCoinCardHolder({ ...spec, tabSide: 'top' as unknown as 'left' }).join(' ')).toMatch(
      /tabSide/,
    );
  });
});
