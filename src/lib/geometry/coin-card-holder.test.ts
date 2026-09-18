import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  checkCoinCardHolder,
  coinCardHolderLayout,
} from './coin-card-holder';

describe('pouzdro s vsazenou mincí – model (tvar L podle předlohy)', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const L = coinCardHolderLayout(spec);

  it('výchozí střih projde všemi kontrolami', () => {
    expect(checkCoinCardHolder(spec)).toEqual([]);
  });

  it('karta se vejde na šířku s vůlí a nedře o steh', () => {
    const inner = L.panelWidthMm - 2 * (spec.stitchOffsetMm + spec.seamInnerMarginMm);
    expect(inner).toBeCloseTo(spec.cardWidthMm + 2 * spec.cardSideClearanceMm, 9);
    expect(inner).toBeGreaterThan(spec.cardWidthMm);
  });

  it('přední panel je nižší než karta o úchop, zadní vyšší o přesah', () => {
    expect(L.frontHeightMm).toBeCloseTo(spec.cardHeightMm - spec.cardGripMm, 9);
    expect(L.backHeightMm).toBeCloseTo(spec.cardHeightMm + spec.backOverCardMm, 9);
    expect(L.cardExposedMm).toBeCloseTo(spec.cardGripMm, 9);
  });

  it('ohyb má přídavek π·(obsah/2 + kůže/2) bez dělicího panelu', () => {
    const inner = spec.cardsCount * spec.cardThicknessMm;
    expect(L.innerThicknessMm).toBeCloseTo(inner, 6);
    expect(L.foldAllowanceMm).toBeCloseTo(Math.PI * (inner / 2 + spec.bodyThicknessMm / 2), 2);
    expect(L.foldEndMm - L.foldStartMm).toBeCloseTo(L.foldAllowanceMm, 6);
    expect(L.frontTopMm).toBeCloseTo(L.backHeightMm + L.foldAllowanceMm + L.frontHeightMm, 6);
    // S dělicím panelem je ohyb o π·kůže/2 delší.
    const withDivider = coinCardHolderLayout({ ...spec, dividerPanel: true });
    expect(withDivider.foldAllowanceMm - L.foldAllowanceMm).toBeCloseTo(
      (Math.PI * spec.bodyThicknessMm) / 2,
      2,
    );
    expect(withDivider.dividerHeightMm).toBe(L.frontHeightMm);
    expect(L.dividerHeightMm).toBeNull();
  });

  it('jazyk: oblouk přes obsah, pokles po předku, k druku a přesah – vše nezávisle spočtené', () => {
    // Obsah pod jazykem = karty + přední panel; neutrální osa jazyka v polovině jeho kůže.
    const content = spec.cardsCount * spec.cardThicknessMm + spec.bodyThicknessMm;
    const wrap = Math.PI * (content / 2 + spec.bodyThicknessMm / 2);
    const drop = spec.backOverCardMm + spec.cardGripMm; // zadní − přední výška
    expect(L.tabWrapMm).toBeCloseTo(wrap, 2);
    expect(L.tabDropMm).toBeCloseTo(drop, 6);
    expect(L.tabLengthMm).toBeCloseTo(
      wrap + drop + spec.snapFromFrontTopMm + spec.tabBeyondSnapMm,
      1,
    );
    // Druk na jazyku měřený od zlomu = oblouk + pokles + vzdálenost patice od horní hrany předku.
    expect(-L.snapTabYMm).toBeCloseTo(wrap + drop + spec.snapFromFrontTopMm, 1);
    // Patice na předku: od horní hrany předku (v soustavě těla je předek vzhůru nohama).
    expect(L.frontTopMm - L.snapFrontYMm).toBeCloseTo(spec.snapFromFrontTopMm, 6);
    // Druk sedí na ose jazyka a jazyk je u levé hrany, konec jazyka je plný půlkruh.
    expect(L.snapXMm).toBeCloseTo((L.tabX0Mm + L.tabX1Mm) / 2, 9);
    expect(L.tabEndRadiusMm).toBeCloseTo(spec.tabWidthMm / 2, 9);
    expect(L.bodyLengthMm).toBeCloseTo(L.tabLengthMm + L.frontTopMm, 6);
  });

  it('jazyk vpravo (jako předloha), výřez hned za ním, průchodka v levém rohu, mezi nimi můstek', () => {
    expect(spec.tabSide).toBe('right');
    expect(L.tabX1Mm).toBeCloseTo(L.panelWidthMm, 9);
    expect(L.tabX0Mm).toBeCloseTo(L.panelWidthMm - spec.tabWidthMm, 9);
    expect(L.notchCentreXMm + L.notchRadiusMm).toBeCloseTo(L.tabX0Mm, 9);
    expect(L.grommetXMm).toBeCloseTo(spec.grommetFromEdgeMm, 9);
    const notchFar = L.notchCentreXMm - L.notchRadiusMm;
    expect(notchFar - (L.grommetXMm + spec.grommetHoleMm / 2)).toBeGreaterThanOrEqual(
      spec.minLigamentMm,
    );
    // Zrcadlová varianta: totéž vlevo.
    const left = coinCardHolderLayout({ ...spec, tabSide: 'left' });
    expect(left.tabX0Mm).toBe(0);
    expect(left.notchCentreXMm - left.notchRadiusMm).toBeCloseTo(spec.tabWidthMm, 9);
    expect(left.grommetXMm).toBeCloseTo(L.panelWidthMm - spec.grommetFromEdgeMm, 9);
    expect(checkCoinCardHolder({ ...spec, tabSide: 'left' })).toEqual([]);
    // Výřez odkryje kartu: hlubší než přesah panelu nad kartou.
    expect(L.notchRadiusMm).toBeGreaterThan(spec.backOverCardMm + 5);
  });

  it('boční švy jen v překryvu panelů, stejná délka na obou, tečky od ohybu', () => {
    expect(L.sideSeamLengthMm).toBeCloseTo(L.frontHeightMm - 2 * spec.stitchOffsetMm, 9);
    expect(L.sideSeamHoles).toBe(Math.floor(L.sideSeamLengthMm / spec.stitchPitchMm) + 1);
    expect(spec.stitchOffsetMm + L.sideSeamLengthMm).toBeLessThan(L.backHeightMm);
  });

  it('kapsa: rovná plocha mezi patou důlku a stehem, okno = výsečník po celých mm', () => {
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
    expect(L.coinCentreXMm - L.formHoleDiameterMm / 2 - spec.stitchOffsetMm).toBeCloseTo(
      spec.pocketFlatMm,
      6,
    );
    expect(
      L.pocketHeightMm - L.coinCentreYMm - L.formHoleDiameterMm / 2 - spec.stitchOffsetMm,
    ).toBeCloseTo(spec.pocketFlatMm, 6);
    expect(Number.isInteger(L.windowDiameterMm)).toBe(true);
    expect(L.coinRingMm).toBeGreaterThanOrEqual(spec.minCoinRingMm);
    expect(L.windowDiameterMm).toBe(32);
    const own = coinCardHolderLayout({ ...spec, windowDiameterMm: 30 });
    expect(own.windowDiameterMm).toBe(30);
    expect(own.coinRingMm).toBeCloseTo(5, 9);
  });

  it('kapsa leží na předku pod jazykem a drukem a nad pásmem ohybu, vystředěná', () => {
    const bandTop =
      Math.max(spec.snapFromFrontTopMm + spec.snapDiameterMm / 2, L.tabEndOnFrontMm) +
      spec.snapClearanceMm;
    expect(L.pocketYMm).toBeGreaterThanOrEqual(bandTop - 1e-9);
    expect(L.pocketYMm + L.pocketHeightMm).toBeLessThanOrEqual(
      L.frontHeightMm - spec.pocketFromFoldMinMm + 1e-9,
    );
    expect(L.pocketXMm).toBeCloseTo((L.panelWidthMm - L.pocketWidthMm) / 2, 9);
    const small = coinCardHolderLayout({ ...spec, coinDiameterMm: 23 });
    const bandBottom = L.frontHeightMm - spec.pocketFromFoldMinMm;
    expect(small.pocketYMm - bandTop).toBeCloseTo(
      bandBottom - (small.pocketYMm + small.pocketHeightMm),
      1,
    );
  });

  it('kontroly odhalí kolize a špatné parametry', () => {
    expect(checkCoinCardHolder({ ...spec, tabBeyondSnapMm: 3 }).join(' ')).toMatch(/blízko druku/);
    expect(checkCoinCardHolder({ ...spec, notchRadiusMm: 22 }).join(' ')).toMatch(
      /výřezem|průchodk/,
    );
    expect(checkCoinCardHolder({ ...spec, windowDiameterMm: 36 }).join(' ')).toMatch(/Prstenec/);
    expect(checkCoinCardHolder({ ...spec, coinDiameterMm: 50 }).length).toBeGreaterThan(0);
    expect(checkCoinCardHolder({ ...spec, cardGripMm: 3 }).join(' ')).toMatch(/vyčnívá/);
    expect(checkCoinCardHolder({ ...spec, backOverCardMm: 0 }).join(' ')).toMatch(/Zadní panel/);
    expect(checkCoinCardHolder({ ...spec, cardsCount: 0 }).join(' ')).toMatch(/cardsCount/);
    expect(checkCoinCardHolder({ ...spec, windowDiameterMm: 60 }).join(' ')).toMatch(
      /menší než mince/,
    );
    expect(checkCoinCardHolder({ ...spec, tabEndRadiusMm: 20 }).join(' ')).toMatch(/půl šířky/);
    // Menší poloměr konce jazyka je platný (kreslí se jako dva rohy + rovná hrana).
    expect(checkCoinCardHolder({ ...spec, tabEndRadiusMm: 6 })).toEqual([]);
    expect(coinCardHolderLayout({ ...spec, tabEndRadiusMm: 6 }).tabEndRadiusMm).toBe(6);
    // Dělicí panel se s mincí 40 mm na A4 nevejde – dokumentovaná mez; s 50 Kč ano.
    expect(checkCoinCardHolder({ ...spec, dividerPanel: true }).join(' ')).toMatch(/Pravý sloupec/);
    expect(
      checkCoinCardHolder({ ...spec, dividerPanel: true, coinDiameterMm: NAMED_COINS['50kc'] }),
    ).toEqual([]);
    // Neplatná strana jazyka.
    expect(checkCoinCardHolder({ ...spec, tabSide: 'top' as unknown as 'left' }).join(' ')).toMatch(
      /tabSide/,
    );
  });

  it('všechny pojmenované mince dají platný střih a přepočítají jen kapsu, okno a formu', () => {
    for (const [name, d] of Object.entries(NAMED_COINS)) {
      const s = { ...spec, coinDiameterMm: d };
      expect(checkCoinCardHolder(s), name).toEqual([]);
      const l = coinCardHolderLayout(s);
      expect(l.bodyLengthMm, name).toBe(L.bodyLengthMm);
      expect(l.formHoleDiameterMm, name).toBeCloseTo(
        d + 2 * spec.pocketThicknessMm + spec.formHoleClearanceMm,
        6,
      );
    }
    expect(NAMED_COINS['50kc']).toBe(27.5);
    expect(NAMED_COINS.decision).toBe(spec.coinDiameterMm);
  });
});
