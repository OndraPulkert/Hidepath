import { describe, expect, it } from 'vitest';

import {
  CONTENT_STATES,
  DEFAULT_LID_WALLET,
  LID_P1_FALLBACK_MM,
  LID_SKIVE_FALLBACK_MM,
  PRINT_SHEET,
  SHEET_FOOTER_MM,
  SHEET_HEADER_MM,
  billsThickness,
  checkLidWallet,
  dipoleFieldMilliTesla,
  hingeContent,
  hingePath,
  lidWalletLayout,
  lidWalletVariant,
  type LidWalletSpec,
} from './lid-wallet';

const spec = DEFAULT_LID_WALLET;
const L = lidWalletLayout(spec);
const st = (id: string) => L.states.find((s) => s.state.id === id)!;
const with_ = (patch: Partial<LidWalletSpec>): string[] => checkLidWallet({ ...spec, ...patch });

describe('peněženka VÍČKO – model střihu', () => {
  it('výchozí střih projde všemi kontrolami', () => {
    expect(checkLidWallet()).toEqual([]);
  });

  describe('šířky podle obsahu', () => {
    it('kapsa F–D2 = karta + (6 karet + D1 + 3 bankovky) + vůle → 93, šířka 101', () => {
      expect(billsThickness(spec, 3)).toBeCloseTo(1.1, 6);
      expect(L.contentCardsBillsCMm).toBeCloseTo(6 * 0.76 + 0.6 + 1.1, 6);
      expect(L.cardPocketNeedMm).toBeCloseTo(85.6 + 6.26 + 0.8, 6);
      expect(L.pocketMm).toBe(93);
      expect(L.widthMm).toBe(93 + 2 * (3 + 1));
      // kapsa karet mezi boky D1 (G2b) pojme 6 karet s vůlí
      expect(L.cardPocketX[1] - L.cardPocketX[0]).toBe(91);
      expect(91).toBeGreaterThanOrEqual(85.6 + 6 * 0.76 + 0.8);
    });

    it('šířka = větší z obálky F–D2 a kapsy karet mezi G2b + 2 pásy G2b: 5 karet → 100,5, 6 → 101', () => {
      // 6 karet: obálka 92,66 → 93; kapsa karet 90,96 → 91 + 2 = 93 (obě podmínky dají 93)
      expect(L.cardSlotNeedMm).toBeCloseTo(85.6 + 6 * 0.76 + 0.8, 6);
      const five = lidWalletLayout({ ...spec, cardsMax: 5 });
      // obálka 85,6 + (3,8 + 0,6 + 1,1) + 0,8 = 91,9 → 92 by dala šířku 100, ale kapsa karet mezi
      // G2b potřebuje 85,6 + 3,8 + 0,8 = 90,2 → 90,5 + 2 · 1 = 92,5
      expect(five.cardSlotNeedMm).toBeCloseTo(90.2, 6);
      expect(five.pocketMm).toBe(92.5);
      expect(five.widthMm).toBe(100.5);
      expect(five.cardPocketX[1] - five.cardPocketX[0]).toBeGreaterThanOrEqual(90.2);
      expect(checkLidWallet({ ...spec, cardsMax: 5 })).toEqual([]);
      expect(lidWalletLayout({ ...spec, cardsMax: 6 }).widthMm).toBe(101);
    });

    it('sloupec mincí obalí 50 Kč: c = Ø + t + vůle = 31, střed 31, švy x 36 a 65', () => {
      expect(L.columnMm).toBe(27.5 + 2.5 + 1);
      expect(L.columnLeft).toEqual([4, 35]);
      expect(L.columnRight).toEqual([66, 97]);
      expect(L.centerBandMm).toBe(31);
      expect(L.seamColumnX).toEqual([36, 65]);
    });

    it('magnet je od sloupců mincí ≥ 10 mm a leží v jazýčku i na plíšku', () => {
      expect(L.magnetX[0] - L.columnLeft[1]).toBeGreaterThanOrEqual(10);
      expect(L.columnRight[0] - L.magnetX[1]).toBeGreaterThanOrEqual(10);
      expect(L.plate.x0).toBeLessThanOrEqual(L.magnetX[0] - 3);
      expect(L.plate.x1).toBeGreaterThanOrEqual(L.magnetX[1] + 3);
      expect(L.tongueX[0]).toBeLessThanOrEqual(L.magnetX[0] - 5);
    });
  });

  describe('výšky', () => {
    it('dno karet, strop, výška, horní hrana F, dno mincí, D1 a D2', () => {
      // Kolo 6: ohyb dna 1,0 bez ztenčení posune rovnou část F na y 1,75 a s ní magnet ve stavu B;
      // plíšek musí obalit magnet i při k max (SF1), proto dno karet 25,5 → 26,0.
      expect(L.flatFromY).toBeCloseTo(0.75 + 1.0, 6);
      expect(L.cardFloorY).toBe(26);
      expect(L.s6Y).toBe(25);
      // strop: max(dno bankovek 2 + 74 + 3; dno karet + δ·6 karet + karta) → 82,26 → 82,5
      expect(L.ceilingY).toBe(82.5);
      // výška = strop + závěs 1,0 (bez ztenčení)
      expect(L.heightMm).toBeCloseTo(83.5, 6);
      expect(L.hingeStartY).toBe(81.5);
      expect(L.frontTopY).toBe(62);
      expect([L.coinFloorY, L.s1Y, L.d2BottomY]).toEqual([23, 22, 18]);
      expect([L.d1BottomY, L.d1TopY, L.d2TopY]).toEqual([2, 81.5, 82]);
    });

    it('bankovky: všechny ČNB napůl se vejdou, vysoká 74 má pod stropem 6,5 mm', () => {
      expect(L.billSidePlayMm).toEqual([93 - 85, 93 - 70]);
      expect(L.billTopClearanceMm).toBeCloseTo(6.5, 6);
      // mezera nad D2 menší než tloušťka 1 Kč → mince nepřeleze do bankovek
      expect(L.ceilingY - L.d2TopY).toBeLessThan(spec.coinThicknessMinMm);
    });

    it('okénko bankovek 15 × 45: tah 30, stokoruna vyčnívá ≥ 15, každá bankovka ho překryje', () => {
      expect(L.billWindow).toEqual({ cx: 50.5, y0: 25, y1: 70, width: 15 });
      expect(L.billPushMm).toBe(45 - 15);
      const mouthY = Math.max(L.d1TopY, L.d2TopY);
      expect(L.billProtrusionMm).toEqual([2 + 69 + 30 - mouthY, 2 + 74 + 30 - mouthY]);
      expect(L.billProtrusionMm[0]).toBeGreaterThanOrEqual(15);
      expect(L.billWindowCoverX[0]).toBeLessThanOrEqual(50.5 - 7.5);
      expect(L.billWindowCoverX[1]).toBeGreaterThanOrEqual(50.5 + 7.5);
      // mince 1 Kč Ø 20 okénkem neprojde (šířka ≤ Ø − 5)
      expect(L.billWindow.width).toBeLessThanOrEqual(spec.coinDiameterMinMm - 5);
    });

    it('mince: sloupec ≥ 2 × 27,5 + 1 i při horším klínu, horní mince vyčnívá ≥ 8', () => {
      expect(L.columnLengthMm).toBeCloseTo(L.ceilingY - (L.coinFloorY + 2.5), 6);
      expect(L.columnLengthMm).toBeGreaterThanOrEqual(56);
      expect(L.coinProtrusionMm).toBeGreaterThanOrEqual(8);
      expect(L.coinWindows.map((w) => [w.cx, w.y0, w.y1, w.width])).toEqual([
        [19.5, 28, 76, 12],
        [81.5, 28, 76, 12],
      ]);
      // samotná mince se nevyřeší za cenu velikosti – jen se spočte, kolik ujede (ověřit P2-8)
      expect(L.singleCoinTravelMm[0]).toBeCloseTo(L.ceilingY - (L.coinFloorY + 1.25) - 27.5, 6);
    });

    it('vějíř karet v kapse 91: 6,3° celá karta, 11,3° část v kapse', () => {
      expect(L.fanDeg[0]).toBeCloseTo(6.29, 1);
      expect(L.fanDeg[1]).toBeCloseTo(11.32, 1);
      const th = (L.fanDeg[0] * Math.PI) / 180;
      expect(85.6 * Math.cos(th) + 53.98 * Math.sin(th)).toBeCloseTo(91, 2);
    });
  });

  describe('závěs, magnet a proužek karty ve stavech A / B / C', () => {
    it('obsah pod závěsem počítá i horní minci sloupce (T_C = 9,36)', () => {
      const T = (id: string) =>
        hingeContent(
          spec,
          CONTENT_STATES.find((s) => s.id === id)!,
        );
      expect(T('A')).toBeCloseTo(1.2, 6);
      expect(T('B')).toBeCloseTo(1.2 + 1.52 + 0.7, 6);
      expect(T('Bm')).toBeCloseTo(3.42 + 2.5, 6);
      expect(T('C')).toBeCloseTo(1.2 + 4.56 + 1.1 + 2.5, 6);
    });

    it('plochý závěs 1,0 bez ztenčení: dva čtvrtoblouky r_m 1,5 + plochý vrch; tenký obsah = půlkruh', () => {
      expect(L.hingeMm).toBe(1);
      expect(L.hingeMidRadiusMm).toBeCloseTo(1.5, 6);
      expect(hingePath(spec, 3.42)).toBeCloseTo(3.42 + 1.0 + (Math.PI - 2) * 1.5, 6);
      expect(hingePath(spec, 1.2)).toBeCloseTo((Math.PI * 2.2) / 2, 6);
      expect(L.v.hingeLenB).toBeCloseTo(6.132, 3);
      // záloha B (ztenčení na 0,6): r_m 1,3 jako dřív
      expect(hingePath({ ...spec, hingeSkiveMm: 0.6 }, 3.42)).toBeCloseTo(
        3.42 + 0.6 + (Math.PI - 2) * 1.3,
        6,
      );
    });

    it('magnet se lepí ve stavu B v y 11,9 a ve všech stavech leží celý na plíšku 3,5–24 s rezervou 0,5 nahoře i dole, i při k max (SF1, Kolo 7)', () => {
      expect(L.magnetYB).toBe(11.9);
      expect(L.plate).toEqual({ x0: 43.5, x1: 57.5, y0: 3.5, y1: 24 });
      expect(L.plate.y1).toBeLessThanOrEqual(L.cardFloorY - 2);
      for (const s of L.states) {
        expect(s.onPlate, s.state.label).toBe(true);
        expect(s.onPlateKMax, s.state.label).toBe(true);
        expect(s.magnetY - 4).toBeGreaterThanOrEqual(L.plate.y0 + 0.5);
        expect(s.magnetTopY).toBeLessThanOrEqual(L.plate.y1 - 0.5);
        expect(s.magnetYkMax - 4).toBeGreaterThanOrEqual(L.plate.y0 + 0.5);
        expect(s.magnetTopYkMax).toBeLessThanOrEqual(L.plate.y1 - 0.5);
      }
      expect(st('A').magnetY).toBeCloseTo(11.9 - (6.132 - 3.456), 2);
      expect(st('C').magnetY).toBeCloseTo(11.9 + (12.072 - 6.132), 2);
      // mezera magnet – plíšek = L1 0,6 + F 1,0 (Kolo 6: L1 z usně 0,6)
      expect(L.magnetPlateGapMm).toBeCloseTo(1.6, 6);
    });

    it('špička jazýčku ve stavu A leží na rovné části F, i při k max nad dnem', () => {
      expect(st('A').tipY).toBeGreaterThanOrEqual(L.flatFromY);
      expect(st('A').tipYkMax).toBeGreaterThan(0.5);
    });

    it('vršek magnetu je ve stavu C ≥ 2,5 pod dnem karet (schod F nad svazkem karet)', () => {
      expect(st('C').stepMarginMm).toBeGreaterThanOrEqual(2.5);
      expect(st('C').stepMarginMm).toBeCloseTo(L.cardFloorY - st('C').magnetTopY, 2);
    });

    it('proužek karty je ≥ 7,9 mm od středu magnetu ve všech stavech, i při k 1,24', () => {
      for (const s of L.states.filter((q) => q.state.cards > 0)) {
        expect(s.stripeClearanceMm!, s.state.label).toBeGreaterThanOrEqual(7.9);
        expect(s.stripeClearanceKMaxMm!, s.state.label).toBeGreaterThanOrEqual(7.9);
      }
      // nejhorší: plná peněženka, karta sedí přímo na čáře dna (δ = 0)
      expect(st('C').stripeClearanceMm).toBeCloseTo(L.cardFloorY + 5.54 - st('C').magnetY, 2);
      expect(st('C').stripeClearanceKMaxMm).toBeCloseTo(12.27, 1);
    });

    it('odhad pole u proužku (dipól) je hluboko pod LoCo ~30 mT', () => {
      expect(st('C').fieldMilliTesla).toBeLessThan(10);
      expect(st('C').fieldKMaxMilliTesla).toBeLessThan(10);
      // dipól roste se 1/r³: poloviční vzdálenost = 8× pole (kontrola vzorce)
      expect(dipoleFieldMilliTesla(spec, 5, 0) / dipoleFieldMilliTesla(spec, 10, 0)).toBeCloseTo(
        8,
        6,
      );
    });

    it('karty se ve stavu C (δ nom) nedotýkají závěsu, hrana víčka je těsně nad F', () => {
      expect(st('C').cardShiftNomMm).toBeGreaterThanOrEqual(0);
      expect(st('C').bandEdgeY - L.frontTopY).toBeCloseTo(spec.lidGapAtFullMm, 6);
      // prázdná: pás víčka přesahuje F (nic nevyčnívá)
      expect(st('A').bandEdgeY).toBeLessThan(L.frontTopY);
    });
  });

  it('tloušťky: A 6,2 lokálně u magnetu (L1 0,6), B 7,92, plná 11,36 v pásu mincí', () => {
    expect(st('A').thicknessMaxMm).toBeCloseTo(6.2, 6);
    expect(st('A').thicknessZone).toBe('magnet');
    expect(st('B').thicknessMaxMm).toBeCloseTo(7.92, 6);
    expect(st('C').thicknessMaxMm).toBeCloseTo(11.36, 6);
    expect(L.thicknessMaxMm).toBeLessThanOrEqual(12);
  });

  it('švy: 21 + 13 + 13 + 18 + 18 + 16 + 8 = 107 otvorů, nejvýš 3 vrstvy 2,6 mm', () => {
    expect(L.seams.map((s) => [s.id, s.holes.length])).toEqual([
      ['S1', 21],
      ['S2', 13],
      ['S3', 13],
      ['S4', 18],
      ['S5', 18],
      ['S6', 16],
      ['S7', 8],
    ]);
    expect(L.holesTotal).toBe(107);
    expect(L.stitchesTotal).toBe(99);
    expect(L.maxSeamThicknessMm).toBeCloseTo(2.6, 6);
    const s4 = L.seams.find((s) => s.id === 'S4')!.holes.map((h) => h.y);
    // horní hrana F přesně mezi otvory, spodní hrana D2 mimo otvor
    expect(s4).toContain(L.frontTopY - 2);
    expect(s4).toContain(L.frontTopY + 2);
    expect(s4.every((y) => Math.abs(y - L.d2BottomY) >= 1.5)).toBe(true);
    // S6 vynechá plíšek a jazýček (x 38,5–62,5)
    const s6 = L.seams.find((s) => s.id === 'S6')!.holes.map((h) => h.x);
    expect(s6.every((x) => Math.abs(x - 50.5) >= 12)).toBe(true);
    expect(s6.every((x) => x < L.plate.x0 - 4 || x > L.plate.x1 + 4)).toBe(true);
    // poslední otvor ≥ 3 mm pod pásem ztenčení závěsu
    expect(Math.max(...s4)).toBeLessThanOrEqual(L.hingeBandStartY - 3);
  });

  it('rozvinutý P1: součet úseků = 231,7 a vejde se na tiskový list', () => {
    // oblouk ohybu dna 1,0 bez ztenčení: π · (0,75 + 0,5) = 3,93 (dřív se ztenčením 3,30)
    expect(L.v.foldArc).toBeCloseTo(3.927, 3);
    const sum =
      L.frontTopY -
      L.flatFromY +
      Math.PI * (0.75 + 0.5) +
      (L.hingeStartY - L.flatFromY) +
      L.v.hingeLenB +
      L.bandLenB +
      L.tongueLenB +
      spec.tongueReserveMm;
    expect(L.p1LengthMm).toBeCloseTo(sum, 2);
    expect(L.p1LengthMm).toBeCloseTo(231.66, 1);
    const printable =
      PRINT_SHEET.heightMm - 2 * PRINT_SHEET.marginMm - SHEET_HEADER_MM - SHEET_FOOTER_MM;
    expect(L.p1LengthMm).toBeLessThanOrEqual(printable);
  });

  it('lepení nesahá do přehybu závěsu a G2 končí na čáře dna karet', () => {
    expect(L.glue.every((g) => g.y1 <= L.hingeStartY)).toBe(true);
    expect(L.glue.find((g) => g.id === 'G2')!.y1).toBe(L.cardFloorY);
    expect(L.glue.filter((g) => g.id === 'G2b')).toHaveLength(2);
    expect(L.glue.find((g) => g.id === 'G3c')).toMatchObject({ x0: 35, x1: 66 });
  });

  describe('kontroly hlásí česky', () => {
    it('široké okénko bankovek', () => {
      expect(with_({ billWindowWidthMm: 20 }).join('\n')).toMatch(/Okénko bankovek 20 mm/);
    });
    it('úzký sloupec (vůle záporná)', () => {
      expect(with_({ coinColumnReserveMm: -3.5 }).join('\n')).toMatch(/Sloupec .* neobalí minci/);
    });
    it('k max 1,571: plíšek se sám prodlouží dolů, dno karet nahoru – P1 se pak nevejde na A4', () => {
      // Od Kola 7 se spodní hrana plíšku počítá z nejnižšího magnetu přes k max (SF1 nahoře,
      // Kolo 7 dole), takže magnet z plíšku nesjede; přepočet ale přeleze tiskovou plochu.
      const K = lidWalletLayout({ ...spec, kMax: 1.571 });
      expect(K.plate.y0).toBeLessThan(L.plate.y0);
      expect(K.states.every((q) => q.onPlate && q.onPlateKMax)).toBe(true);
      expect(with_({ kMax: 1.571 }).join('\n')).toMatch(/nevejde na tiskový list/);
    });
    it('poloha magnetu ve stavu B nikdy nepřeleze mez okna lepení', () => {
      for (const v of [{ cardsMax: 5, leatherMm: 0.8 }, { leatherMm: 0.8 }]) {
        const Lv = lidWalletLayout({ ...spec, ...v });
        expect(Lv.magnetYBOnGrid).toBe(true);
        expect(Lv.magnetYB).toBeLessThanOrEqual(Lv.magnetYBMax);
      }
    });
    it('návrh přímo pro k 1,571 zvedne dno karet a výšku – P1 se pak nevejde na A4', () => {
      const K = lidWalletLayout({ ...spec, kDesign: 1.571, kMax: 1.571 });
      expect(K.cardFloorY).toBeGreaterThan(L.cardFloorY + 3);
      expect(K.heightMm).toBeGreaterThan(L.heightMm + 3);
      expect(with_({ kDesign: 1.571, kMax: 1.571 }).join('\n')).toMatch(/nevejde na tiskový list/);
    });
    it('7 karet je mimo brief', () => {
      expect(with_({ cardsMax: 7 }).join('\n')).toMatch(/Brief chce 4–6 karet/);
    });
    it('vidličky jiné než 4 mm', () => {
      expect(with_({ stitchPitchMm: 3.85 }).join('\n')).toMatch(/přesně 4 mm/);
    });
    it('záporná tloušťka', () => {
      expect(with_({ leatherMm: 0 })).toEqual(['leatherMm musí být kladné číslo (je 0).']);
    });
    it('ztenčení špičky pod magnet', () => {
      expect(with_({ tipSkiveMm: 5 }).join('\n')).toMatch(/Ztenčení špičky zasahuje pod magnet/);
    });
  });

  describe('výřez pro palec v horní hraně F (kolo 4, ověřit na papírovém modelu P0)', () => {
    const n = L.thumbNotch;
    it('U 10 × 12 na ose: dno půlkruh Ø 10 (výsečník), střed y 55, dno y 50, rohy R1', () => {
      expect([n.cx, n.x0, n.x1, n.radius, n.depthMm]).toEqual([50.5, 45.5, 55.5, 5, 12]);
      expect([n.bottomY, n.centerY, n.topY, n.cornerRadiusMm]).toEqual([50, 55, 62, 1]);
      // rozměr výřezu je samostatný vstup, posun mince okénkem sloupce na něm nezávisí
      expect(n.depthMm).toBe(spec.thumbNotchDepthMm);
      expect(n.x1 - n.x0).toBe(spec.thumbNotchWidthMm);
      expect(lidWalletLayout({ ...spec, thumbNotchWidthMm: 8 }).coinProtrusionMm).toBe(
        L.coinProtrusionMm,
      );
      // přední karta je na ose vidět o hloubku výřezu víc (1 karta … plná)
      expect(n.exposedCardMm).toEqual([30.36, 32.26]);
    });
    it('leží celý pod jazýčkem i posunutým o boční toleranci 3, daleko od G2b/G4, S4/S5 a S6', () => {
      // rohy ústí x 44,5 a 56,5 jsou 4 mm od boků jazýčku 40,5 a 60,5 = tolerance 3 + rezerva 1
      expect(n.cornerToTongueMm).toBe(4);
      const min = spec.plateSideMarginMm + spec.thumbNotchSideReserveMm;
      expect(n.x0 - n.cornerRadiusMm - L.tongueX[0]).toBeGreaterThanOrEqual(min);
      expect(L.tongueX[1] - (n.x1 + n.cornerRadiusMm)).toBeGreaterThanOrEqual(min);
      const g2b = L.glue.filter((g) => g.id === 'G2b' || g.id === 'G4');
      for (const g of g2b) expect(g.x1 <= n.x0 - 30 || g.x0 >= n.x1 + 30).toBe(true);
      expect(n.bottomY).toBeGreaterThan(L.s6Y + 20);
      expect(n.bottomY - L.cardFloorY).toBeGreaterThanOrEqual(spec.cardPocketDepthMm / 2);
    });
    it('nezachytí víčko ani jazýček ve stavech A, B, C: magnet i špička jsou vždy hluboko pod ním', () => {
      for (const s of L.states) {
        expect(Math.max(s.magnetTopY, s.magnetTopYkMax), s.state.label).toBeLessThan(n.bottomY - 3);
        expect(Math.max(s.tipY, s.tipYkMax), s.state.label).toBeLessThan(n.bottomY);
      }
      // hrana pásu víčka existuje jen za vydutým napojením R4 (x < 36,5 a > 64,5), výřez je uvnitř
      expect(n.x0).toBeGreaterThan(L.tongueX[0]);
      expect(n.x1).toBeLessThan(L.tongueX[1]);
      // do výřezu může při zavírání klesnout jen konec špičky R10 užší než 10: 10 − √(10² − 5²) = 1,34
      // a to leží celé v ztenčeném klínu 2,5
      expect(n.tipNarrowerMm).toBeCloseTo(1.34, 6);
      expect(n.tipNarrowerMm).toBeLessThanOrEqual(spec.tipSkiveMm);
      // jazýček posunutý o 3: nad výřezem visí jedna strana konce na 10 − √(10² − 8²) = 4,0 (P0-4)
      expect(n.tipNarrowerShiftedMm).toBeCloseTo(4, 6);
    });
    it('kontrola hlásí výřez, který jazýček posunutý o boční toleranci nepřikryje', () => {
      // původní U 12 × 12 s rohy R2: rohy 2 mm od boků jazýčku < 3 + 1
      expect(with_({ thumbNotchWidthMm: 12, thumbNotchCornerRadiusMm: 2 }).join('\n')).toMatch(
        /nepřikryje jazýček/,
      );
      expect(with_({ thumbNotchWidthMm: 11 }).join('\n')).toMatch(/nepřikryje jazýček/);
      expect(with_({ thumbNotchWidthMm: 16, thumbNotchSideReserveMm: -5 }).join('\n')).toMatch(
        /užší než výřez pro palec/,
      );
    });
  });

  describe('R4: karta omylem v oddílu bankovek', () => {
    const m = L.misplacedCard;
    it('proužkem dolů leží přímo za magnetem, jen ~3,5 mm v tloušťce (otevřené riziko, V5)', () => {
      expect(m.dzMm).toBeCloseTo(0.75 + 0.6 + 1.0 + 0.5 + 0.6, 6);
      expect(m.stripeDownY).toEqual([2 + 5.54, 2 + 15.82]);
      expect(m.stripeDownOverlapsMagnet).toBe(true);
    });
    it('proužkem nahoru je proužek ≥ 19,9 mm nad magnetem, i když karta sama zvedne víčko', () => {
      // spodní hrana proužku = dno bankovek 2 + 53,98 − 15,82 = 40,16; magnet nejvýš C při k 1,24
      // (19,27) + zbloudilá karta pod závěsem 1,24 · 0,76 = 20,21
      expect(m.stripeUpY).toBeCloseTo(40.16, 6);
      const top = Math.max(...L.states.map((s) => s.magnetYkMax));
      expect(m.magnetHighWithCardY).toBeCloseTo(top + spec.kMax * spec.cardThicknessMm, 2);
      expect(m.stripeUpClearanceMm).toBeCloseTo(40.16 - m.magnetHighWithCardY, 2);
      expect(m.stripeUpClearanceMm).toBeGreaterThanOrEqual(19.9);
      // i při dně bankovek o 1 mm níž (tolerance 1,0–2,0, oddíl 4.4)
      expect(m.stripeUpClearanceLowFloorMm).toBeGreaterThanOrEqual(18.9);
      // v y 40 plíšek není (končí v 24): Δz = 0,75 + 0,6 + 1,0 + 0,6 = 2,95
      expect(m.stripeUpDzMm).toBeCloseTo(2.95, 6);
      expect(m.stripeUpFieldMilliTesla).toBeLessThan(1.2);
      // správně vložená karta proužkem nahoru je ještě dál
      expect(m.cardPocketStripeUpClearanceMm).toBeGreaterThan(44);
    });
  });

  it('plíšek 0,8 (varianta pro V4/V5): geometrie se nemění, jen tloušťka u magnetu a odstup R4 o 0,3', () => {
    const P = lidWalletLayout({ ...spec, plateThicknessMm: 0.8 });
    expect(checkLidWallet({ ...spec, plateThicknessMm: 0.8 })).toEqual([]);
    expect([P.cardFloorY, P.heightMm, P.widthMm, P.p1LengthMm]).toEqual([
      L.cardFloorY,
      L.heightMm,
      L.widthMm,
      L.p1LengthMm,
    ]);
    expect(P.plate).toEqual(L.plate);
    expect(P.states.find((s) => s.state.id === 'A')!.thicknessMaxMm).toBeCloseTo(6.5, 6);
    expect(P.thicknessMaxMm).toBeCloseTo(11.36, 6);
    expect(P.misplacedCard.dzMm).toBeCloseTo(L.misplacedCard.dzMm + 0.3, 6);
    expect(P.misplacedCard.stripeUpDzMm).toBe(L.misplacedCard.stripeUpDzMm);
  });

  it('záloha magnet Ø 10 × 2 se přepočte (výš dno karet a strop), ne jen vyměnit', () => {
    const m10 = { ...spec, magnetDiameterMm: 10, magnetThicknessMm: 2, magnetFromTipMm: 8 };
    const big = lidWalletLayout(m10);
    expect(big.cardFloorY).toBeGreaterThan(L.cardFloorY);
    expect(big.heightMm).toBeGreaterThan(L.heightMm);
    // Od Kola 6 (ohyb a závěs 1,0, šev S7) už jen výměna nestačí: vedle magnetu Ø 10 není
    // v jazýčku 20 místo na S7 a P1 237,7 přeleze tiskovou plochu 237 – kontrola to ohlásí.
    const problems = checkLidWallet(m10).join('\n');
    expect(problems).toMatch(/S7 kolem L1 nemá po stranách magnetu/);
    expect(problems).toMatch(/nevejde na tiskový list/);
    // s jazýčkem 24 už S7 vyjde, zbývá jen délka P1
    expect(
      checkLidWallet({ ...m10, tongueWidthMm: 24, liningBlankWidthMm: 28 }).join('\n'),
    ).not.toMatch(/S7/);
  });

  describe('Kolo 6: bez ztenčení, L1 0,6 obšitá, hranaté rohy, zálohy', () => {
    it('výchozí střih nic neztenčuje: ohyb dna i závěs mají tloušťku P1 1,0', () => {
      expect(spec.bottomFoldSkiveMm).toBeNull();
      expect(spec.hingeSkiveMm).toBeNull();
      expect([L.bottomFoldMm, L.hingeMm]).toEqual([1, 1]);
      expect(spec.liningMm).toBe(spec.dividerMm);
    });

    it('L1 přesahuje špičku a šev S7 obchází magnet do U: 8 otvorů, ≥ 2 mm od magnetu, ≥ 3 od hrany', () => {
      const ln = L.lining;
      expect(ln.topAboveTipMm).toBe(spec.magnetFromTipMm + spec.liningTopAboveMagnetMm);
      expect(ln.bottomAboveTipMm).toBeLessThan(0);
      expect(ln.seamHoles).toEqual([
        { u: -6, h: 6 },
        { u: -6, h: 10 },
        { u: -6, h: 14 },
        { u: -2, h: 14 },
        { u: 2, h: 14 },
        { u: 6, h: 14 },
        { u: 6, h: 10 },
        { u: 6, h: 6 },
      ]);
      expect(ln.seamToMagnetMm).toBeGreaterThanOrEqual(spec.liningSeamMagnetClearanceMm);
      expect(ln.seamToEdgeMm).toBeGreaterThanOrEqual(spec.seamOffsetMm);
      // rozteč 4 mezi sousedními otvory
      for (let i = 1; i < ln.seamHoles.length; i++) {
        const a = ln.seamHoles[i - 1]!;
        const b = ln.seamHoles[i]!;
        expect(Math.hypot(a.u - b.u, a.h - b.h)).toBeCloseTo(4, 6);
      }
      const s7 = L.seams.find((q) => q.id === 'S7')!;
      expect(s7.thicknessMm).toBeCloseTo(1.6, 6);
      // otvory leží na jazýčku ve stavu B (špička y 4,9), v šířce plíšku – šijí se jen jazýček + L1
      expect(s7.holes.every((h) => h.x > L.tongueX[0] && h.x < L.tongueX[1])).toBe(true);
    });

    it('rohy těla hranaté, vložka dna přesahuje boky (111 × 25)', () => {
      expect(spec.bodyCornerRadiusMm).toBe(0);
      expect([L.bottomSpacer.widthMm, L.bottomSpacer.depthMm]).toEqual([111, 25]);
    });

    it('záloha A: celý P1 z usně 0,8 bez ztenčení projde kontrolami', () => {
      const A08 = lidWalletVariant({ p1Mm: LID_P1_FALLBACK_MM });
      expect(checkLidWallet(A08)).toEqual([]);
      const LA = lidWalletLayout(A08);
      expect([LA.bottomFoldMm, LA.hingeMm, LA.hingeMidRadiusMm]).toEqual([0.8, 0.8, 1.4]);
      expect([LA.cardFloorY, LA.ceilingY, LA.frontTopY]).toEqual([25.5, 82, 61.5]);
      expect(LA.heightMm).toBeCloseTo(82.8, 6);
      expect(LA.widthMm).toBe(101);
      expect(LA.magnetYB).toBe(11.6);
      expect(LA.plate).toEqual({ x0: 43.5, x1: 57.5, y0: 3.5, y1: 23.5 });
      expect(LA.p1LengthMm).toBeCloseTo(230.23, 1);
      expect(LA.magnetPlateGapMm).toBeCloseTo(1.4, 6);
      expect(LA.thicknessMaxMm).toBeCloseTo(10.96, 6);
      for (const s of LA.states) {
        expect(s.onPlate && s.onPlateKMax, s.state.label).toBe(true);
        if (s.stripeClearanceKMaxMm !== null) {
          expect(s.stripeClearanceKMaxMm).toBeGreaterThanOrEqual(7.9);
        }
      }
    });

    it('záloha B: ztenčení ohybu dna nebo závěsu na 0,6 projde kontrolami a vrátí oblouk 3,30', () => {
      const fold = lidWalletVariant({ bottomFoldSkiveMm: LID_SKIVE_FALLBACK_MM });
      const hinge = lidWalletVariant({ hingeSkiveMm: LID_SKIVE_FALLBACK_MM });
      expect(checkLidWallet(fold)).toEqual([]);
      expect(checkLidWallet(hinge)).toEqual([]);
      expect(lidWalletLayout(fold).v.foldArc).toBeCloseTo(3.299, 3);
      expect(lidWalletLayout(hinge).heightMm).toBeCloseTo(82.5 + 0.6, 6);
    });

    it('plíšek obalí magnet v celém okně lepení ⟨y_m,B,min; y_m,B,max⟩ při k 1,0 i k max, s rezervou 0,5 (Kolo 7)', () => {
      const PA = hingePath(spec, L.hingeContentAMm);
      const PB = hingePath(spec, L.hingeContentBMm);
      const PC = hingePath(spec, L.hingeContentCMm);
      for (const yB of [L.magnetYBMin, L.magnetYB, L.magnetYBMax]) {
        for (const k of [spec.kDesign, spec.kMax]) {
          expect(yB + k * (PA - PB) - 4).toBeGreaterThanOrEqual(L.plate.y0 + 0.5 - 1e-6);
          expect(yB + k * (PC - PB) + 4).toBeLessThanOrEqual(L.plate.y1 - 0.5 + 1e-3);
        }
      }
      expect(L.plate.y0).toBeGreaterThanOrEqual(L.flatFromY);
    });

    it('4 karty s P1 0,8 i 0,9 a 5 karet s P1 0,8 projdou; poloha magnetu leží v okně na mřížce 0,05 (Kolo 7)', () => {
      for (const v of [
        { cardsMax: 4, leatherMm: 0.8 },
        { cardsMax: 4, leatherMm: 0.9 },
        { cardsMax: 5, leatherMm: 0.8 },
      ]) {
        const s = { ...spec, ...v };
        expect(checkLidWallet(s), JSON.stringify(v)).toEqual([]);
        const Lv = lidWalletLayout(s);
        expect(Lv.magnetYB).toBeGreaterThanOrEqual(Lv.magnetYBMin);
        expect(Lv.magnetYB).toBeLessThanOrEqual(Lv.magnetYBMax);
        expect(Math.abs(Lv.magnetYB * 20 - Math.round(Lv.magnetYB * 20))).toBeLessThan(1e-6);
      }
      expect(lidWalletLayout({ ...spec, cardsMax: 5, leatherMm: 0.8 }).magnetYB).toBe(11.55);
    });

    it('záloha B závěs: plné ztenčení pokryje oba přehyby i ve stavu C při k max, náběhy vně pásu (Kolo 8)', () => {
      expect(L.v.hingeBand[0]).toBeCloseTo(142.99, 1);
      expect(L.v.hingeBand[1]).toBeCloseTo(150.99, 1);
      for (const patch of [
        { hingeSkiveMm: LID_SKIVE_FALLBACK_MM },
        { hingeSkiveMm: LID_SKIVE_FALLBACK_MM, bottomFoldSkiveMm: LID_SKIVE_FALLBACK_MM },
      ]) {
        const s = lidWalletVariant(patch);
        const Lv = lidWalletLayout(s);
        const PC = hingePath(s, Lv.hingeContentCMm);
        const PB = Lv.v.hingeLenB;
        const PCkMax = PB + s.kMax * (PC - PB);
        const rm = s.hingeInnerRadiusMm + (s.hingeSkiveMm ?? s.leatherMm) / 2;
        // pás = zóna plného ztenčení (náběhy skiveTaperMm leží vně)
        const [b0, b1] = Lv.v.hingeBand;
        expect(b0, JSON.stringify(patch)).toBeLessThanOrEqual(Lv.v.hingeStart - 1 + 0.01);
        expect(b1, JSON.stringify(patch)).toBeGreaterThanOrEqual(
          Lv.v.hingeStart + PCkMax + 1 - 0.01,
        );
        // oba přehyby leží v plné zóně s rezervou ≥ 1, přední i ve stavu C při k max
        expect(Lv.v.rearCrease - b0).toBeGreaterThanOrEqual(1);
        const frontCreaseCkMax = Lv.v.hingeStart + PCkMax - (Math.PI / 4) * rm;
        expect(b1 - frontCreaseCkMax).toBeGreaterThanOrEqual(1);
        // spodní kraj pásu (lepení G3, poslední otvor S4/S5) se rozšířením neposune
        expect(b0).toBeCloseTo((Lv.v.hingeStart + Lv.v.hingeEnd) / 2 - 4, 2);
        expect(Lv.hingeBandStartY).toBeCloseTo(Lv.hingeStartY - (4 - Lv.v.hingeLenB / 2), 2);
        // spodní náběh (vně pásu) končí aspoň 1 mm nad posledním otvorem S4/S5
        const s4 = Lv.seams.find((q) => q.id === 'S4')!.holes.map((h) => h.y);
        expect(Lv.hingeBandStartY - s.skiveTaperMm - Math.max(...s4)).toBeGreaterThanOrEqual(1);
        expect(checkLidWallet(s)).toEqual([]);
      }
    });

    it('kontrola odmítne ztenčení tlustší než P1', () => {
      expect(with_({ hingeSkiveMm: 1.2 }).join('\n')).toMatch(/hingeSkiveMm musí být null/);
    });
  });

  describe('Kolo 9: závěs bez kopyta, hrana vložky dna, vložka z karet, změřené přepážky', () => {
    it('model nemá kopyto ani opěrku Z2, jen vložku dna', () => {
      expect(L).not.toHaveProperty('hingeJig');
      expect(L).not.toHaveProperty('supportBlock');
      expect(spec).not.toHaveProperty('hingeJigHandleMm');
      expect(spec).not.toHaveProperty('hingeJigSlideClearanceMm');
    });

    it('hrana vložky dna leží o půl oblouku za osou ohybu směrem k B (v 64,18, osa 62,21) – ověřit V12', () => {
      // vložka leží na rubu B a F se přes ni přehne: oblouk začíná u hrany vložky
      expect(L.v.insertEdge).toBeCloseTo(L.v.foldAxis + L.v.foldArc / 2, 2);
      expect(L.v.insertEdge).toBeCloseTo(L.v.backStart, 6);
      expect(L.v.insertEdge).toBeCloseTo(64.18, 2);
      expect(L.v.foldAxis).toBeCloseTo(62.21, 2);
      expect(L.v.insertEdge - L.v.foldAxis).toBeCloseTo(1.96, 2);
      // střed oblouku (osa) tak padne na rýhu; hrana je na B v y rovné části (1,75)
      expect(L.v.insertEdge - L.v.frontEnd).toBeCloseTo(L.v.foldArc, 6);
      expect(L.v.insertEdge).toBeLessThan(L.v.foldBand[1]);
      // se ztenčeným ohybem dna (záloha B) se hrana posune s obloukem
      const LB = lidWalletLayout(lidWalletVariant({ bottomFoldSkiveMm: LID_SKIVE_FALLBACK_MM }));
      expect(LB.v.insertEdge - LB.v.foldAxis).toBeCloseTo(LB.v.foldArc / 2, 2);
    });

    it('vložka ze 2 vrstev starých karet: 2 × 0,76 = 1,52, 2 karty vedle sebe 171,2 ≥ 111, výška 53,98 ≥ 25', () => {
      const fc = L.bottomSpacer.fromCards;
      expect(fc).toEqual({
        layers: 2,
        cardsPerLayer: 2,
        cards: 4,
        thicknessMm: 1.52,
        lengthMm: 171.2,
        heightMm: 53.98,
        edgeTrimMm: 4,
        excessMm: 60.2,
      });
      expect(fc.lengthMm).toBeGreaterThanOrEqual(L.bottomSpacer.widthMm);
      // i po odstřižení hrany do ohybu je karta dost vysoká
      expect(fc.heightMm - fc.edgeTrimMm).toBeGreaterThanOrEqual(L.bottomSpacer.depthMm);
      // vložka 1,52 místo 1,5 projde a posune čáry jen o setiny
      const s152 = { ...spec, bottomSpacerMm: fc.thicknessMm };
      expect(checkLidWallet(s152)).toEqual([]);
      const L152 = lidWalletLayout(s152);
      expect(Math.abs(L152.v.insertEdge - L.v.insertEdge)).toBeLessThan(0.03);
      expect(Math.abs(L152.v.foldAxis - L.v.foldAxis)).toBeLessThan(0.01);
      expect(Math.abs(L152.p1LengthMm - L.p1LengthMm)).toBeLessThan(0.02);
      expect([L152.cardFloorY, L152.heightMm, L152.magnetYB]).toEqual([
        L.cardFloorY,
        L.heightMm,
        L.magnetYB,
      ]);
    });

    it('změřené přepážky: do 0,9 projdou (plná 11,96), 1,0 dá 12,16 a kontrola ji odmítne česky', () => {
      const t = (d: number, l = d) => lidWalletVariant({ dividerMm: d, liningMm: l });
      for (const d of [0.6, 0.7, 0.8, 0.9]) expect(checkLidWallet(t(d)), String(d)).toEqual([]);
      expect(lidWalletLayout(t(0.9)).thicknessMaxMm).toBeCloseTo(11.96, 6);
      expect(lidWalletLayout(t(1.0)).thicknessMaxMm).toBeCloseTo(12.16, 6);
      expect(checkLidWallet(t(1.0)).join('\n')).toMatch(/Plná tloušťka 12,16 mm je nad/);
      // L1 plnou tloušťku v pásu mincí nemění, jen mezeru magnet–plíšek
      expect(checkLidWallet(t(0.9, 1.0))).toEqual([]);
      expect(lidWalletLayout(t(0.9, 1.0)).magnetPlateGapMm).toBeCloseTo(2.0, 6);
    });

    it('okno lepení magnetu má bod mřížky 0,05 pro přepážky 0,5–0,92 (dno karet se případně zvedne o krok)', () => {
      for (let d = 0.5; d <= 0.92 + 1e-9; d += 0.01) {
        const s = lidWalletVariant({ dividerMm: Math.round(d * 100) / 100 });
        expect(checkLidWallet(s), d.toFixed(2)).toEqual([]);
        expect(lidWalletLayout(s).magnetYBOnGrid).toBe(true);
      }
      // 0,70 by se zaokrouhlením dna karet na 25,5 mělo okno jen 11,61–11,63
      expect(lidWalletLayout(lidWalletVariant({ dividerMm: 0.7 })).cardFloorY).toBe(26);
    });
  });
});
