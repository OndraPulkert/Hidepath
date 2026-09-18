import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  checkCoinCardHolder,
  coinCardHolderLayout,
} from './coin-card-holder';

describe('pouzdro s vsazenou mincí – model', () => {
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

  it('karta vyčnívá nad přední panel o cardGripMm a chlopeň ji zakryje', () => {
    expect(L.cardExposedMm).toBeCloseTo(spec.cardGripMm, 9);
    // Chlopeň sahá na předním panelu až k druku + přesah, tedy pod vršek karty.
    expect(spec.snapFromFrontTopMm + spec.flapBeyondSnapMm).toBeGreaterThan(0);
    expect(L.flapLengthMm).toBeCloseTo(spec.snapFromFrontTopMm + spec.flapBeyondSnapMm, 9);
  });

  it('tělo = přední + ohyb + zadní + chlopeň a zadní panel je o přídavek přes obsah vyšší', () => {
    expect(L.bodyLengthMm).toBeCloseTo(
      L.frontHeightMm + spec.foldAllowanceMm + L.backHeightMm + L.flapLengthMm,
      6,
    );
    expect(L.backHeightMm - L.frontHeightMm).toBeCloseTo(spec.flapStackAllowanceMm, 9);
  });

  it('druk na chlopni dopadne po přehnutí na druk na předním panelu', () => {
    // Chlopeň se láme přes horní hranu obsahu (backHeight nad ohybem) a jde dolů po
    // předním panelu: vzdálenost druku od zlomu = vzdálenost patice od horní hrany předu.
    const flapStart = L.foldEndMm + L.backHeightMm;
    expect(L.snapFlapYMm - flapStart).toBeCloseTo(L.snapFrontYMm, 9);
    expect(L.snapFrontXMm).toBeCloseTo(L.panelWidthMm / 2, 9);
  });

  it('boční švy: stejná délka na předním i zadním panelu, tečky od ohybu', () => {
    expect(L.sideSeamLengthMm).toBeCloseTo(L.frontHeightMm - 2 * spec.stitchOffsetMm, 9);
    expect(L.sideSeamHoles).toBe(Math.floor(L.sideSeamLengthMm / spec.stitchPitchMm) + 1);
    // Šev nesmí přesáhnout horní hranu zadního panelu.
    expect(spec.stitchOffsetMm + L.sideSeamLengthMm).toBeLessThan(L.backHeightMm);
  });

  it('mince sedí v kapse s vůlí, okno je menší o dva prstence', () => {
    expect(L.windowDiameterMm).toBeCloseTo(spec.coinDiameterMm - 2 * spec.coinRingMm, 9);
    const innerW = L.pocketWidthMm - 2 * (spec.stitchOffsetMm + spec.seamInnerMarginMm);
    expect(innerW).toBeCloseTo(spec.coinDiameterMm + 2 * spec.coinSideClearanceMm, 9);
    // Mince celá uvnitř kapsy: horní okraj mince pod horní hranou kapsy o přesah.
    expect(L.coinCentreYMm - spec.coinDiameterMm / 2).toBeCloseTo(spec.coinTopOverlapMm, 9);
    // Okno celé uvnitř stehu kapsy.
    expect(L.coinCentreXMm - L.windowDiameterMm / 2).toBeGreaterThan(
      spec.stitchOffsetMm + spec.minLigamentMm,
    );
  });

  it('kapsa s mincí leží na předním panelu mezi drukem a ohybem', () => {
    expect(L.pocketYMm + L.pocketHeightMm).toBeCloseTo(L.frontHeightMm - spec.pocketFromFoldMm, 9);
    expect(L.pocketYMm).toBeGreaterThan(
      L.snapFrontYMm + spec.snapDiameterMm / 2 + spec.snapClearanceMm,
    );
    expect(L.pocketXMm).toBeCloseTo((L.panelWidthMm - L.pocketWidthMm) / 2, 9);
  });

  it('dělicí panel je stejně vysoký jako přední, aby poslední otvor nebyl u jeho hrany', () => {
    expect(L.dividerHeightMm).toBe(L.frontHeightMm);
  });

  it('forma pro důlek: otvor o oversize větší než mince', () => {
    expect(L.formHoleDiameterMm).toBeCloseTo(spec.coinDiameterMm + spec.formHoleOversizeMm, 9);
  });

  it('kontroly odhalí kolizi chlopně s kapsou i příliš úzký prstenec', () => {
    const longFlap = { ...spec, flapBeyondSnapMm: 30 };
    expect(checkCoinCardHolder(longFlap).join(' ')).toMatch(/Konec chlopně/);
    const thinRing = { ...spec, coinRingMm: 1 };
    expect(checkCoinCardHolder(thinRing).join(' ')).toMatch(/Prstenec/);
    const bigCoin = { ...spec, coinDiameterMm: 58 };
    expect(checkCoinCardHolder(bigCoin).length).toBeGreaterThan(0);
    const lowSnap = { ...spec, snapFromFrontTopMm: 18 };
    expect(checkCoinCardHolder(lowSnap).join(' ')).toMatch(/drukem|chlopně/);
  });

  it('jiná mince přepočítá kapsu, okno i formu, tělo zůstává', () => {
    const small = coinCardHolderLayout({ ...spec, coinDiameterMm: 30 });
    expect(small.windowDiameterMm).toBeCloseTo(21, 9);
    expect(small.pocketWidthMm).toBeCloseTo(L.pocketWidthMm - 10, 9);
    expect(small.formHoleDiameterMm).toBeCloseTo(31, 9);
    expect(small.bodyLengthMm).toBe(L.bodyLengthMm);
    expect(checkCoinCardHolder({ ...spec, coinDiameterMm: 30 })).toEqual([]);
  });

  it('všechny pojmenované mince dají platný střih', () => {
    for (const [name, d] of Object.entries(NAMED_COINS)) {
      expect(checkCoinCardHolder({ ...spec, coinDiameterMm: d }), name).toEqual([]);
    }
    expect(NAMED_COINS['50kc']).toBe(27.5);
    expect(NAMED_COINS.decision).toBe(spec.coinDiameterMm);
  });
});
