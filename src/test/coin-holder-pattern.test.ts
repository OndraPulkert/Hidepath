import { describe, expect, it } from 'vitest';

import {
  A4_SHEET,
  DEFAULT_COIN_CARD_HOLDER,
  coinCardHolderLayout,
} from '@/lib/geometry/coin-card-holder';

/**
 * Verzovaný střih pouzdra s mincí (docs/generated/pouzdro-mince-sablona.svg) musí odpovídat
 * modelu. Testy čtou geometrii ze souboru (cesty, kružnice, tečky), ne jen popisky, aby
 * odhalily kresbu, která se od modelu odchýlí, i když golden soubor někdo přegeneruje.
 */
const svgs: Record<string, string> = import.meta.glob('/docs/generated/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const sheet = Object.entries(svgs).find(([k]) => k.endsWith('/pouzdro-mince-sablona.svg'))?.[1];
const cz = (n: number): string => (Math.round(n * 1000) / 1000).toString().replace('.', ',');
const near = (a: number, b: number, tol = 0.01): boolean => Math.abs(a - b) <= tol;
/** Stejné zaokrouhlení jako generátor (2 desetinná místa, bez koncových nul). */
const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

interface Circle {
  cx: number;
  cy: number;
  r: number;
}
const circles = (s: string): Circle[] =>
  [...s.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) => ({
    cx: Number(m[1]),
    cy: Number(m[2]),
    r: Number(m[3]),
  }));

describe('střih pouzdra s mincí (tvar L)', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const L = coinCardHolderLayout(spec);
  const m = A4_SHEET.marginMm;
  // Soustava těla v listu: x = m + xBody, y = m + tabLength + yBody.
  const X = (x: number): number => m + x;
  const Y = (y: number): number => m + L.tabLengthMm + y;

  it('existuje a je to A4 na výšku v milimetrech', () => {
    expect(sheet).toBeDefined();
    expect(sheet).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
  });

  it('popisky dílů odpovídají modelu', () => {
    expect(sheet).toContain(`${cz(L.panelWidthMm)} × ${cz(L.backHeightMm)} mm · kryje karty celé`);
    expect(sheet).toContain(
      `výřez R${cz(L.scoopRadiusMm)} odkryje ${cz(L.cardExposedMm)} mm karty`,
    );
    expect(sheet).toContain(`OHYB ${cz(L.foldAllowanceMm)} mm`);
    expect(sheet).toContain(
      `${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm · okno Ø ${cz(L.windowDiameterMm)}`,
    );
    expect(sheet).toContain(`otvor Ø ${cz(L.formHoleDiameterMm)}`);
    expect(sheet).toContain(
      `${L.seamHolesTabSide} otvorů na straně jazyka, ${L.seamHolesScoopSide} na straně výřezu`,
    );
    expect(sheet).toContain('OBKRESLIT NA RUB');
    expect(sheet).toContain(`Jazyk ${cz(L.tabLengthMm)} mm`);
    expect(sheet).not.toContain('DĚLICÍ PANEL');
  });

  it('obrys těla: jazyk, výřez v předku, rohy a délka odpovídají modelu (souřadnice z cesty)', () => {
    const body = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(
      sheet ?? '',
    )?.[1];
    expect(body).toBeDefined();
    // Koncové body příkazů M/L/A (u oblouku poslední dvojice), bez poloměrů a příznaků.
    const pts: [number, number][] = [];
    for (const cmd of body!.matchAll(/([MLA])([^MLAZ]*)/g)) {
      const n = [...cmd[2]!.matchAll(/-?[\d.]+/g)].map((v) => Number(v[0]));
      pts.push([n[n.length - 2]!, n[n.length - 1]!]);
    }
    const p = (x: number, y: number): string => `${fmt(X(x))} ${fmt(Y(y))}`;
    const rt = L.tabEndRadiusMm;
    const tabTopY = -L.tabLengthMm + rt;
    // Konec jazyka: dva rohy R a rovná hrana (po směru hodin), končí na pravé hraně jazyka.
    expect(body).toContain(
      `A${rt} ${rt} 0 0 1 ${p(L.tabX0Mm + rt, -L.tabLengthMm)} L${p(L.tabX1Mm - rt, -L.tabLengthMm)} ` +
        `A${rt} ${rt} 0 0 1 ${p(L.tabX1Mm, tabTopY)}`,
    );
    // Zadní panel má rovnou horní hranu od levého rohu ke kořeni jazyka (bez výřezu).
    expect(body).toMatch(
      new RegExp(`^M${p(spec.cornerRadiusMm, 0)} L${p(L.tabX0Mm - spec.cornerRadiusMm, 0)} A`),
    );
    // Výřez na prst: čtvrtkruh (proti směru, dovnitř) v dolním levém rohu = horní roh předku
    // na straně průchodky; po přeložení leží nad průchodkou zadního panelu.
    const Rs = L.scoopRadiusMm;
    expect(L.scoopCornerXMm).toBe(0);
    expect(body).toContain(`L${p(Rs, L.frontTopMm)} A${Rs} ${Rs} 0 0 0 ${p(0, L.frontTopMm - Rs)}`);
    expect(Math.hypot(L.grommetXMm, L.grommetYMm) + spec.grommetHoleMm / 2).toBeLessThan(Rs);
    // Jazyk je u pravé hrany (věrně předloze při pohledu zepředu).
    expect(spec.tabSide).toBe('right');
    expect(L.tabX1Mm).toBeCloseTo(L.panelWidthMm, 9);
    // Rozsah: nejvyšší bod = vrchol jazyka, nejnižší = horní hrana předku, šířka = panel.
    const xs = pts.map(([x]) => x);
    const ys = pts.map(([, y]) => y);
    expect(Math.min(...ys)).toBeCloseTo(Y(-L.tabLengthMm), 2);
    expect(Math.max(...ys)).toBeCloseTo(Y(L.frontTopMm), 2);
    expect(Math.max(...xs)).toBeCloseTo(X(L.panelWidthMm), 2);
    expect(Math.min(...xs)).toBeCloseTo(X(0), 2);
    expect(Y(L.frontTopMm) - Y(-L.tabLengthMm)).toBeCloseTo(L.bodyLengthMm, 2);
  });

  it('druky: klobouček na jazyku a patice na předku sedí na ose jazyka', () => {
    const snaps = circles(sheet ?? '').filter((c) => near(c.r, spec.snapDiameterMm / 2));
    expect(snaps.length).toBe(2);
    for (const c of snaps) expect(c.cx).toBeCloseTo(X(L.snapXMm), 2);
    const ys = snaps.map((c) => c.cy).sort((a, b) => a - b);
    expect(ys[0]).toBeCloseTo(Y(L.snapTabYMm), 2);
    expect(ys[1]).toBeCloseTo(Y(L.snapFrontYMm), 2);
  });

  it('průchodka v horním rohu zadního panelu naproti jazyku', () => {
    const g = circles(sheet ?? '').find((c) => near(c.r, spec.grommetHoleMm / 2));
    expect(g).toBeDefined();
    expect(g!.cx).toBeCloseTo(X(L.grommetXMm), 2);
    expect(g!.cy).toBeCloseTo(Y(L.grommetYMm), 2);
    // Naproti jazyku: průchodka vlevo, jazyk vpravo.
    expect(L.grommetXMm).toBeLessThan(L.tabX0Mm);
    // Čára zkrácení jazyka (bez rezervy) je v listu.
    const trimY = Y(-L.tabNominalLengthMm);
    expect(sheet).toContain(
      `M${fmt(X(L.tabX0Mm))} ${fmt(trimY)} L${fmt(X(L.tabX1Mm))} ${fmt(trimY)}`,
    );
  });

  it('boční švy: 4 řady, u výřezu kratší, rozteč přesně podle modelu, první tečka od ohybu', () => {
    const dots = circles(sheet ?? '').filter((c) => near(c.r, 0.45));
    const so = spec.stitchOffsetMm;
    for (const [x, n] of [
      [X(so), L.seamHolesScoopSide],
      [X(L.panelWidthMm - so), L.seamHolesTabSide],
    ] as const) {
      const col = dots
        .filter((c) => near(c.cx, x))
        .map((c) => c.cy)
        .sort((a, b) => a - b);
      expect(col.length, `sloupec x=${x}`).toBe(2 * n);
      const back = col.slice(0, n);
      const front = col.slice(n);
      // Řada u výřezu končí pod výřezem (žádná tečka v místě, kde přední panel není).
      if (n === L.seamHolesScoopSide) {
        expect(front[front.length - 1]).toBeLessThan(Y(L.frontTopMm - L.scoopRadiusMm));
      }
      // Zadní panel: poslední tečka `so` nad ohybem; přední: první tečka `so` pod koncem ohybu.
      expect(back[back.length - 1]).toBeCloseTo(Y(L.foldStartMm - so), 2);
      expect(front[0]).toBeCloseTo(Y(L.foldEndMm + so), 2);
      for (let i = 1; i < back.length; i++)
        expect(back[i]! - back[i - 1]!).toBeCloseTo(spec.stitchPitchMm, 2);
      for (let i = 1; i < front.length; i++)
        expect(front[i]! - front[i - 1]!).toBeCloseTo(spec.stitchPitchMm, 2);
    }
  });

  it('kapsa s mincí: okno, mince a pata důlku jsou soustředné, kapsa má šev od středu dna', () => {
    const cs = circles(sheet ?? '');
    const window = cs.filter((c) => near(c.r, L.windowDiameterMm / 2));
    const coin = cs.filter((c) => near(c.r, spec.coinDiameterMm / 2));
    const foot = cs.filter((c) => near(c.r, L.formHoleDiameterMm / 2));
    expect(window.length).toBe(1);
    expect(coin.length).toBe(1);
    // Pata důlku je na kapse i na formě.
    expect(foot.length).toBe(2);
    expect(window[0]!.cx).toBeCloseTo(coin[0]!.cx, 3);
    expect(window[0]!.cy).toBeCloseTo(coin[0]!.cy, 3);
    const seamHoles = Number(/šev (\d+) otvorů od středu dna/.exec(sheet ?? '')?.[1]);
    expect(seamHoles % 2).toBe(1);
    // Všech teček dohromady: 4 boční řady + šev kapsy.
    const dots = cs.filter((c) => near(c.r, 0.45));
    expect(dots.length).toBe(2 * (L.seamHolesTabSide + L.seamHolesScoopSide) + seamHoles);
  });

  it('čáry ohybu leží přesně na začátku a konci přídavku', () => {
    const line = (y: number): string =>
      `M${fmt(X(0))} ${fmt(Y(y))} L${fmt(X(L.panelWidthMm))} ${fmt(Y(y))}`;
    expect(sheet).toContain(`d="${line(L.foldStartMm)}" fill="none" stroke="#7a7a7a"`);
    expect(sheet).toContain(`d="${line(L.foldEndMm)}" fill="none" stroke="#7a7a7a"`);
  });

  it('kapsa: obrys, okno a šev sedí k sobě, počet otvorů švu vychází z délky U', () => {
    const cs = circles(sheet ?? '');
    const window = cs.find((c) => near(c.r, L.windowDiameterMm / 2))!;
    // Druhá řezaná cesta je díl kapsy; začíná v (kx + R horního rohu, ky).
    const cuts = [
      ...(sheet ?? '').matchAll(
        /<path d="M([\d.]+) ([\d.]+)[^"]*" fill="none" stroke="#2b2b2b" stroke-width="0.3"/g,
      ),
    ];
    expect(cuts.length).toBeGreaterThanOrEqual(2);
    const kx = Number(cuts[1]![1]) - spec.pocketTopRadiusMm;
    const ky = Number(cuts[1]![2]);
    expect(window.cx - kx).toBeCloseTo(L.coinCentreXMm, 2);
    expect(window.cy - ky).toBeCloseTo(L.coinCentreYMm, 2);
    // Šev U: od středu dna na obě strany po rozteči; délka poloviny nezávisle spočtená.
    const rIn = Math.max(0.5, spec.cornerRadiusMm - spec.stitchOffsetMm);
    const so = spec.stitchOffsetMm;
    const half =
      L.pocketWidthMm / 2 -
      so -
      rIn +
      (Math.PI / 2) * rIn +
      (L.pocketHeightMm - so - rIn - L.pocketSeamTopMm);
    const seamHoles = Number(/šev (\d+) otvorů od středu dna/.exec(sheet ?? '')?.[1]);
    expect(seamHoles).toBe(2 * Math.floor(half / spec.stitchPitchMm + 1e-9) + 1);
    // Krajní tečky švu leží na svislých hranách U ve výšce podle zbytku délky.
    const seamDots = cs.filter((c) => near(c.r, 0.45) && Math.abs(c.cx - (kx + so)) < 0.01);
    expect(seamDots.length).toBe(
      Math.floor(half / spec.stitchPitchMm + 1e-9) -
        Math.floor(
          (L.pocketWidthMm / 2 - so - rIn + (Math.PI / 2) * rIn) / spec.stitchPitchMm + 1e-9,
        ),
    );
  });

  it('kapsa na předku: vodicí obrys začíná v poloze z modelu (předek je vzhůru nohama)', () => {
    const gx = X(L.pocketXMm) + spec.cornerRadiusMm;
    const gy = Y(L.frontTopMm - L.pocketYMm - L.pocketHeightMm);
    expect(sheet).toContain(`d="M${fmt(gx)} ${fmt(gy)} L`);
    expect(sheet).toMatch(
      new RegExp(
        `d="M${fmt(gx)} ${fmt(gy)} [^"]*" fill="none" stroke="#7a7a7a" stroke-width="0.2" stroke-dasharray="1 1"`,
      ),
    );
  });

  it('kalibrační úsečka měří 50 mm', () => {
    const c = /M([\d.]+) ([\d.]+) V[\d.]+ M\1 ([\d.]+) H([\d.]+)/.exec(sheet ?? '');
    expect(c).not.toBeNull();
    expect(Number(c![4]) - Number(c![1])).toBeCloseTo(50, 6);
    expect(Number(c![3]) - Number(c![2])).toBeCloseTo(2, 6);
  });

  it('žádný prvek nevystupuje ze stránky (včetně souřadnic v cestách)', () => {
    const paths = [...(sheet ?? '').matchAll(/ d="([^"]+)"/g)].map((p) => p[1]!);
    const coords = paths.flatMap((d) =>
      [...d.matchAll(/([MLAHV]|\s)(-?[\d.]+)[ ,](-?[\d.]+)/g)].map(
        (q) => [Number(q[2]), Number(q[3])] as const,
      ),
    );
    const xs = coords
      .map(([x]) => x)
      .concat([...(sheet ?? '').matchAll(/ cx="([\d.]+)"/g)].map((q) => Number(q[1])));
    const ys = coords
      .map(([, y]) => y)
      .concat([...(sheet ?? '').matchAll(/ cy="([\d.]+)"/g)].map((q) => Number(q[1])));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(A4_SHEET.widthMm);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(A4_SHEET.heightMm);
  });
});
