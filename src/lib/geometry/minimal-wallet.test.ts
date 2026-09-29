import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MINIMAL_WALLET,
  LEATHER_SHEET,
  checkMinimalWallet,
  minimalWalletLayout,
  roundTo,
  roundUpTo,
  toBackSide,
  type MinimalWalletSpec,
} from './minimal-wallet';

const spec = DEFAULT_MINIMAL_WALLET;
const L = minimalWalletLayout(spec);
const t = spec.leatherMm;
const with_ = (patch: Partial<MinimalWalletSpec>): string[] =>
  checkMinimalWallet({ ...spec, ...patch });

describe('peněženka LUSK – model střihu', () => {
  it('výchozí střih projde všemi kontrolami', () => {
    expect(checkMinimalWallet()).toEqual([]);
  });

  it('karetní zóna: karta + obsah stavu C + κ′ + rezerva na toleranci', () => {
    const kappa = Math.PI * t - 2 * t;
    expect(L.kappaMm).toBeCloseTo(kappa, 3);
    expect(L.needCardZoneCMm).toBeCloseTo(spec.cardWidthMm + 6 * 0.76 + 2 + kappa, 2);
    expect(L.cardZoneMm).toBe(63);
    // rezerva ve stavu C pokrývá ±0,5 řez/čára a stažení stehy
    expect(L.reserveCMm).toBeGreaterThanOrEqual(1);
    // i po přetoku lepidla 0,5 mm z obou okrajů se stav C vejde
    expect(L.cardZoneMm - 2 * spec.glueOverflowMm).toBeGreaterThanOrEqual(L.needCardZoneCMm);
    expect(L.reserveBMm).toBeCloseTo(2.61, 2);
    expect(L.reserve4Mm).toBeCloseTo(4.61, 2);
    // zóna nikdy není „přesně na kartu“ (brief kap. 6)
    expect(L.cardZoneMm).toBeGreaterThan(spec.cardWidthMm + 5);
  });

  it('lusk: polovina obvodu trnu po neutrální ose + rezerva 2 mm na zasunutí', () => {
    const P = 29 - 2 + (6 - 2) + Math.PI * (1 + t / 2);
    expect(L.halfPerimeterMm).toBeCloseTo(P, 3);
    expect(L.podZoneMm).toBe(38);
    expect(L.podZoneMm - L.halfPerimeterMm).toBeGreaterThan(1.9);
    expect(L.mandrelMaxWidthMm).toBeCloseTo(29 + 38 - P, 2);
    expect(L.mandrelEndWidthMm).toBe(28.5);
    expect(L.mandrelEndWidthMm).toBeGreaterThan(spec.coinDiameterMaxMm + 0.5);
    expect(L.mandrelDepthMm).toBe(97);
    expect(L.mandrelLengthMm).toBe(122);
  });

  it('šířka dílu je součet okrajů, zón a lepení', () => {
    expect(L.seamLeftX).toBe(3.5);
    expect(L.cardZoneX1).toBe(67.5);
    expect(L.seamDividerX).toBe(68.5);
    expect([L.podX0, L.podX1]).toEqual([69.5, 107.5]);
    expect(L.seamRightX).toBe(108.5);
    expect(L.widthMm).toBe(3.5 + 1 + 63 + 2 + 38 + 1 + 3.5);
    expect(L.podCenterX).toBe(88.5);
    expect(L.cardCenterX).toBe(36);
  });

  it('délka: dvě stěny lusku + přídavek ohybu π/2 · (c + t)', () => {
    expect(L.foldMm).toBeCloseTo((Math.PI / 2) * 7.2, 2);
    expect(L.podHeightMm).toBe(94);
    expect(L.cardHeightMm).toBe(88);
    expect(L.lengthMm).toBeCloseTo(2 * 94 + (Math.PI / 2) * 7.2, 2);
    expect(L.foldInnerRadiusMm).toBe(3);
    expect(L.finishedHeightMm).toBe(98.2);
    // distanční tyčka do ohybu (kroky 11, 13): Ø = 2 × R_i, čouhá jen R_i nad plochu, tedy
    // musí zůstat pod začátkem lepení u_g, jinak by bránila lepeným pruhům i děrování (B1).
    expect(L.foldSpacerDiameterMm).toBe(2 * L.foldInnerRadiusMm);
    expect(L.foldSpacerDiameterMm / 2).toBeLessThan(spec.glueStartMm);
  });

  it('tloušťky ve stavech A / B / C', () => {
    expect(L.thicknessPodMm).toBe(8.4);
    expect(L.thicknessA).toEqual({ cardMin: 2.4, cardMax: 7.44, max: 8.4 });
    expect(L.thicknessB).toEqual({ card: 7.44, max: 8.4 });
    expect(L.thicknessC).toEqual({ card: 8.96, max: 8.96 });
    // ve švech a na hranách nejvýš dvě vrstvy
    expect(L.maxLayersInSeam * t).toBe(2.4);
    // mince tloušťku nezvětšují: lusk je tenčí než karetní zóna ve stavu C
    expect(L.thicknessPodMm).toBeLessThan(L.thicknessC.card);
  });

  it('šířka u dna je vždy W, nahoře menší podle stavu', () => {
    expect(L.podProjectionMm).toBeCloseTo(35.48, 1);
    expect(L.topWidthA).toBeLessThanOrEqual(L.widthMm);
    expect(L.topWidthC).toBeLessThan(L.topWidthB);
    expect(L.topWidthB).toBeLessThan(L.topWidthA);
  });

  it('švy: počty otvorů, horní a dolní otvor, stehy', () => {
    expect(L.seams.map((s) => [s.id, s.x, s.uTop, s.holes, s.uBottom])).toEqual([
      ['L', 3.5, 84.5, 20, 8.5],
      ['D', 68.5, 90.5, 22, 6.5],
      ['P', 108.5, 90.5, 22, 6.5],
    ]);
    expect(L.holesTotal).toBe(64);
    expect(L.stitchesTotal).toBe(61);
    for (const s of L.seams) {
      expect(s.uTop - (s.holes - 1) * spec.stitchPitchMm).toBeCloseTo(s.uBottom, 6);
      expect(s.uBottom).toBeGreaterThanOrEqual(spec.lowestHoleMm);
    }
  });

  it('švy lícují po složení: každý šev leží uvnitř svého lepeného pruhu na obou stěnách', () => {
    // Obě stěny mají stejné x (ohyb zrcadlí jen y), děruje se skrz obě – otvory lícují.
    for (const s of L.seams) {
      const g = L.glue.find((q) => q.id === s.id)!;
      expect(s.x).toBeGreaterThan(g.x0);
      expect(s.x).toBeLessThan(g.x1);
      expect(s.uBottom).toBeGreaterThan(g.u0);
      expect(s.uTop).toBeLessThan(g.u1);
    }
    // Na rubu je x zrcadlené: dělicí pruh 67,5–69,5 leží na rubu 42,5–44,5 od hrany lusku.
    const d = L.glue.find((q) => q.id === 'D')!;
    expect([toBackSide(d.x1, L.widthMm), toBackSide(d.x0, L.widthMm)]).toEqual([42.5, 44.5]);
  });

  it('práh a průzor: pevný můstek, vyčnívání mince D − a_p, dotažení pod práh', () => {
    expect(L.washerBottomU).toBe(84);
    expect(L.coinColumnTopU + spec.coinBelowWasherMm).toBe(L.washerBottomU);
    expect(L.windowTopU).toBe(80);
    expect(L.washerBottomU - L.windowTopU).toBe(4);
    expect([L.windowBottomU, L.windowTopU]).toEqual([30, 80]);
    expect([L.windowX0, L.windowX1]).toEqual([82.5, 94.5]);
    expect(L.coinProtrusionMaxMm).toBe(13.5);
    expect(L.coinProtrusionMinMm).toBe(6);
    expect(L.coinPullDownMm).toBe(10);
    expect(spec.windowWidthMm).toBeLessThan(spec.coinDiameterMinMm);
  });

  it('karty a bankovky ve výkusech', () => {
    expect(L.cardBelowEdgeMm).toBeCloseTo(2.4, 6);
    expect(L.cardBelowEdgeCMm).toBeCloseTo(1.96, 2);
    expect(L.cardProtrusionMaxMm).toBeCloseTo(15.6, 6);
    expect(L.cardProtrusionMinMm).toBeCloseTo(13.6, 1);
    expect([L.billProtrusionMinMm, L.billProtrusionMaxMm]).toEqual([9, 14]);
    // zadní výkus je užší než přední (karta je víc podepřená zadní stěnou)
    expect(L.billNotch.x1 - L.billNotch.x0).toBeLessThan(L.thumbNotch.x1 - L.thumbNotch.x0);
  });

  it('zkušební lusk má tři švy s dělicím uvnitř a vejde se na arch A4 vedle D1', () => {
    expect(L.test.widthMm).toBe(69);
    expect(L.test.lengthMm).toBeCloseTo(144.31, 2);
    expect(L.test.seams.map((s) => s.x)).toEqual([3.5, 25.5, 65.5]);
    expect(L.widthMm + L.test.widthMm).toBeLessThanOrEqual(LEATHER_SHEET.widthMm);
    expect(L.lengthMm).toBeLessThanOrEqual(LEATHER_SHEET.heightMm);
  });

  it('roundTo zaokrouhluje na nejbližší 0,5, roundUpTo nahoru', () => {
    expect(roundUpTo(62.91, 0.5)).toBe(63);
    expect(roundUpTo(63.02, 0.5)).toBe(63.5);
    expect(roundUpTo(63, 0.5)).toBe(63);
    expect(roundTo(62.91, 0.5)).toBe(63);
    expect(roundTo(38.027, 0.5)).toBe(38);
    expect(roundTo(62.75, 0.5)).toBe(63);
  });

  describe('kontroly hlásí problémy česky', () => {
    it('karetní zóna bez rezervy', () => {
      expect(with_({ cardZoneReserveMm: 0 }).join('\n')).toMatch(
        /Karetní zóna S_c|Rezerva karetní/,
      );
    });
    it('lusk, kterým trn po přetoku lepidla neprojde', () => {
      expect(with_({ insertReserveMm: 0 }).join('\n')).toMatch(/trn neprojde/);
    });
    it('distanční tyčka v ohybu by čněla do pásma lepení (B1)', () => {
      expect(with_({ coinThicknessMaxMm: 5 }).join('\n')).toMatch(/[Dd]istanční tyčka/);
    });
    it('průzor u podložky', () => {
      expect(with_({ windowFromTopMm: 12 }).join('\n')).toMatch(/pod podložkou/);
    });
    it('průzor širší než mince', () => {
      expect(with_({ windowWidthMm: 21 }).join('\n')).toMatch(/širší než nejmenší mince/);
    });
    it('sloupec mincí v prahu', () => {
      expect(with_({ coinBelowWasherMm: 0.5 }).join('\n')).toMatch(/sahá skoro do prahu/);
    });
    it('šev mimo 3–4 mm od hrany a rozteč mimo 3–5 mm', () => {
      expect(with_({ seamOffsetMm: 5 }).join('\n')).toMatch(/od hrany je mimo 3–4 mm/);
      expect(with_({ stitchPitchMm: 6 }).join('\n')).toMatch(/Rozteč stehů/);
    });
    it('díl, který se nevejde na A4', () => {
      expect(with_({ coinsPerRow: 4 }).join('\n')).toMatch(/A4/);
    });
    it('neplatné vstupy', () => {
      expect(with_({ leatherMm: 0 })).toEqual(['leatherMm musí být kladné číslo (je 0).']);
      expect(with_({ cardsC: 8 }).join('\n')).toMatch(/4–6 karet/);
    });
    it('silná kůže: šev skrz víc než 3 mm', () => {
      expect(with_({ leatherMm: 1.6 }).join('\n')).toMatch(/Šev jde skrz 3,2 mm/);
    });
  });
});
