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
const pocketSheet = Object.entries(svgs).find(([k]) => k.endsWith('/pouzdro-mince-kapsa.svg'))?.[1];
const cz = (n: number): string => (Math.round(n * 1000) / 1000).toString().replace('.', ',');
const near = (a: number, b: number, tol = 0.01): boolean => Math.abs(a - b) <= tol;
/** Stejné zaokrouhlení jako generátor (3 desetinná místa, bez koncových nul). */
const fmt = (n: number): string => (Math.round(n * 1000) / 1000).toString();

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

describe('střih pouzdra s mincí (pás tří panelů)', () => {
  const spec = DEFAULT_COIN_CARD_HOLDER;
  const L = coinCardHolderLayout(spec);
  const m = A4_SHEET.marginMm;
  // Soustava pásu v listu: x = m + xStrip (jazyk vpravo = bez zrcadlení), y = m + tabLength + y.
  const X = (x: number): number => m + x;
  const Y = (y: number): number => m + L.tabLengthMm + y;
  const P = (x: number, y: number): string => `${fmt(X(x))} ${fmt(Y(y))}`;

  it('existuje a je to A4 na šířku v milimetrech', () => {
    expect(sheet).toBeDefined();
    expect(sheet).toContain('width="297mm" height="210mm" viewBox="0 0 297 210"');
  });

  it('popisky dílů a legenda odpovídají modelu', () => {
    expect(sheet).toContain(`${cz(L.panelWidthMm)} × ${cz(L.panelHeightMm)} mm`);
    expect(sheet).toContain(`OHYB A ${cz(L.foldBackFrontMm)}`);
    expect(sheet).toContain(`OHYB B ${cz(L.foldFrontInnerMm)}`);
    expect(sheet).toContain(`VÝŘEZ NA PRST R${cz(L.scoopRadiusMm)}`);
    expect(sheet).toContain(`${L.bottomSeamHoles} otvorů`);
    expect(sheet).toContain('PÁS OBKRESLIT NA LÍC');
    expect(sheet).toContain('ZADNÍ PANEL');
    expect(sheet).toContain('PŘEDNÍ PANEL');
    expect(sheet).toContain('VNITŘNÍ PANEL');
  });

  it('obrys pásu: jazyk, výřez U přes ohyb A, rozsah a rohy podle modelu', () => {
    const body = /<path d="(M[^"]+)" fill="none" stroke="#2b2b2b" stroke-width="0.3"/.exec(
      sheet ?? '',
    )?.[1];
    expect(body).toBeDefined();
    const rt = L.tabEndRadiusMm;
    const S = L.scoopRadiusMm;
    const rc = spec.cornerRadiusMm;
    // Konec jazyka: dva rohy R a rovná hrana, u levého konce pásu.
    expect(body).toContain(
      `M${P(0, -L.tabLengthMm + rt)} A${rt} ${rt} 0 0 1 ${P(rt, -L.tabLengthMm)}`,
    );
    expect(body).toContain(
      `L${P(L.tabX1Mm - rt, -L.tabLengthMm)} A${rt} ${rt} 0 0 1 ${P(L.tabX1Mm, -L.tabLengthMm + rt)}`,
    );
    // Hrana jazyka jde rovně dolů až do výkusu (žádný schodek ani zub mezi jazykem a výřezem).
    expect(rc).toBeGreaterThan(0);
    expect(L.scoopStartXMm).toBeCloseTo(L.tabX1Mm, 9);
    const rx = L.backScoopRxMm;
    // Výřez U: čtvrtelipsa na zadním, dno přes pásmo ohybu A, čtvrtkruh na předku.
    expect(body).toContain(
      `L${P(L.tabX1Mm, 0)} A${rx} ${S} 0 0 0 ${P(L.backX1Mm, S)} ` +
        `L${P(L.frontX0Mm, S)} A${S} ${S} 0 0 0 `,
    );
    // Roh výřezu na předku je zaoblený: kružnice r tečná k horní hraně a vně tečná k výřezu.
    const r = spec.scoopCornerRadiusMm;
    const xc = L.frontX0Mm + Math.sqrt(S * S + 2 * S * r);
    expect(L.scoopCornerEndXMm).toBeCloseTo(xc, 2);
    const px = L.frontX0Mm + ((L.scoopCornerEndXMm - L.frontX0Mm) * S) / (S + r);
    const py = (r * S) / (S + r);
    expect(body).toContain(
      `A${S} ${S} 0 0 0 ${P(px, py)} A${r} ${r} 0 0 1 ${P(L.scoopCornerEndXMm, 0)}`,
    );
    // Výkus (ne zaoblený roh): oblouk má střed v rohu panelu na horní hraně u ohybu A, takže
    // odebere celý čtvrtkruh R×R·π/4. Směr oblouku 0 (proti směru hodin) to v SVG určuje
    // jednoznačně; zaoblený roh by měl směr 1 a odebral by jen R²·(1 − π/4).
    expect(body).not.toContain(`A${S} ${S} 0 0 1 ${P(L.backX1Mm, S)}`);
    // Rozsah cesty: vrchol jazyka nahoře, dno pásu dole, celá délka pásu.
    const pts: [number, number][] = [];
    for (const cmd of body!.matchAll(/([MLA])([^MLAZ]*)/g)) {
      const n = [...cmd[2]!.matchAll(/-?[\d.]+/g)].map((v) => Number(v[0]));
      pts.push([n[n.length - 2]!, n[n.length - 1]!]);
    }
    const xs = pts.map(([x]) => x);
    const ys = pts.map(([, y]) => y);
    expect(Math.min(...ys)).toBeCloseTo(Y(-L.tabLengthMm), 2);
    expect(Math.max(...ys)).toBeCloseTo(Y(L.panelHeightMm), 2);
    expect(Math.min(...xs)).toBeCloseTo(X(0), 2);
    expect(Math.max(...xs)).toBeCloseTo(X(L.stripLengthMm), 2);
  });

  it('ohyby: čárkované čáry na hranicích panelů, ohyb A až pod výřezem', () => {
    const line = (x: number, y0: number, y1: number): string =>
      `M${fmt(X(x))} ${fmt(Y(y0))} L${fmt(X(x))} ${fmt(Y(y1))}`;
    expect(sheet).toContain(line(L.backX1Mm, L.scoopRadiusMm, L.panelHeightMm));
    expect(sheet).toContain(line(L.frontX0Mm, L.scoopRadiusMm, L.panelHeightMm));
    expect(sheet).toContain(line(L.frontX1Mm, 0, L.panelHeightMm));
    expect(sheet).toContain(line(L.innerX0Mm!, 0, L.panelHeightMm));
  });

  it('druky a čára zkrácení jazyka sedí na ose jazyka', () => {
    const snaps = circles(sheet ?? '').filter((c) => near(c.r, spec.snapDiameterMm / 2));
    expect(snaps.length).toBe(2);
    const cap = snaps.find((c) => c.cy < Y(0))!;
    const socket = snaps.find((c) => c.cy > Y(0))!;
    expect(cap.cx).toBeCloseTo(X(L.snapXTabMm), 2);
    expect(cap.cy).toBeCloseTo(Y(L.snapYTabMm), 2);
    expect(socket.cx).toBeCloseTo(X(L.snapXFrontMm), 2);
    expect(socket.cy).toBeCloseTo(Y(L.snapYFrontMm), 2);
    const trimY = Y(-L.tabNominalLengthMm);
    expect(sheet).toContain(`M${fmt(X(0))} ${fmt(trimY)} L${fmt(X(L.tabX1Mm))} ${fmt(trimY)}`);
  });

  it('průchodka je ve vnitřním panelu a po složení padne do výřezu', () => {
    const g = circles(sheet ?? '').find((c) => near(c.r, spec.grommetHoleMm / 2));
    expect(g).toBeDefined();
    expect(g!.cx).toBeCloseTo(X(L.grommetXMm!), 2);
    expect(g!.cy).toBeCloseTo(Y(L.grommetYMm!), 2);
    expect(L.grommetXMm!).toBeGreaterThan(L.frontX1Mm);
  });

  it('šev dna: čára přes celý pás (uvnitř rohů), tečky na předním panelu s roztečí z modelu', () => {
    const seamY = Y(L.bottomSeamYMm);
    const rc = spec.cornerRadiusMm;
    const inset = rc - Math.sqrt(rc * rc - (rc - spec.stitchOffsetMm) ** 2);
    expect(sheet).toContain(
      `M${fmt(X(inset))} ${fmt(seamY)} L${fmt(X(L.stripLengthMm - inset))} ${fmt(seamY)}`,
    );
    const dots = circles(sheet ?? '')
      .filter((c) => near(c.r, 0.45) && near(c.cy, seamY))
      .map((c) => c.cx)
      .sort((a, b) => a - b);
    expect(dots.length).toBe(3 * L.bottomSeamHoles);
    const run = (L.bottomSeamHoles - 1) * spec.stitchPitchMm;
    const front = dots.filter((x) => x > X(L.frontX0Mm) && x < X(L.frontX1Mm));
    expect(front.length).toBe(L.bottomSeamHoles);
    // Na předním panelu vystředěné, rozteč přesně podle modelu, nejméně 3,5 mm od ohybu.
    expect(front[0]! - X(L.frontX0Mm)).toBeCloseTo((L.panelWidthMm - run) / 2, 2);
    expect(front[0]! - X(L.frontX0Mm)).toBeGreaterThanOrEqual(spec.stitchOffsetMm);
    for (let i = 1; i < front.length; i++) {
      expect(front[i]! - front[i - 1]!).toBeCloseTo(spec.stitchPitchMm, 6);
    }
    // Po přeložení přes oba ohyby padnou otvory zadního a vnitřního panelu na otvory předku.
    const cA = X((L.backX1Mm + L.frontX0Mm) / 2);
    const cB = X((L.frontX1Mm + L.innerX0Mm!) / 2);
    for (const x of front) {
      expect(dots.some((d) => near(d, 2 * cA - x, 0.01))).toBe(true);
      expect(dots.some((d) => near(d, 2 * cB - x, 0.01))).toBe(true);
    }
  });

  it('kapsa na předním panelu: vodicí obrys v poloze z modelu, mimo výřez', () => {
    const gx = X(L.frontX0Mm + L.pocketXMm) + spec.pocketTopRadiusMm;
    const gy = Y(L.pocketYMm);
    expect(sheet).toMatch(
      new RegExp(
        `d="M${fmt(gx)} ${fmt(gy)} [^"]*" fill="none" stroke="#7a7a7a" stroke-width="0.2" stroke-dasharray="1 1"`,
      ),
    );
  });

  it('perforace jen v ohybu A (tři řady), ohyb B se místo nich ztenčuje', () => {
    const perf = circles(sheet ?? '').filter((c) => near(c.r, 0.75));
    const inBand = (x0: number, x1: number): Circle[] =>
      perf.filter((c) => c.cx > X(x0) && c.cx < X(x1));
    expect(inBand(L.frontX1Mm, L.innerX0Mm!).length).toBe(0);
    expect(sheet).toContain('class="skive-zone"');
    for (const [x0, x1, n] of [[L.backX1Mm, L.frontX0Mm, 3]] as const) {
      const band = inBand(x0, x1);
      const cols = [...new Set(band.map((c) => c.cx))].sort((a, b) => a - b);
      expect(cols.length).toBe(n);
      // Mezi sousedními otvory i k čáře ohybu zůstane aspoň 1 mm kůže.
      for (let i = 1; i < cols.length; i++)
        expect(cols[i]! - cols[i - 1]! - 1.5).toBeGreaterThan(1);
      expect(cols[0]! - 0.75 - X(x0)).toBeGreaterThan(0.4);
      expect(Math.max(...band.map((c) => c.cy))).toBeLessThan(Y(L.bottomSeamYMm));
    }
    // Pásmo ohybu A začíná pod výkusem.
    expect(Math.min(...inBand(L.backX1Mm, L.frontX0Mm).map((c) => c.cy))).toBeGreaterThan(
      Y(L.scoopRadiusMm),
    );
  });

  it('list kapsy: A4 na výšku, okno, mince a pata důlku soustředné, šev od středu dna', () => {
    expect(pocketSheet).toBeDefined();
    expect(pocketSheet).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
    const cs = circles(pocketSheet ?? '');
    const coin = cs.filter((c) => near(c.r, spec.coinDiameterMm / 2));
    const foot = cs.filter((c) => near(c.r, L.formHoleDiameterMm / 2));
    expect(coin.length).toBe(1);
    expect(foot.length).toBe(1);
    const rw = L.windowDiameterMm / 2;
    const window = new RegExp(`<path d="M([\\d.]+) ([\\d.]+) A${rw} ${rw} `).exec(
      pocketSheet ?? '',
    );
    expect(window).not.toBeNull();
    expect(Number(window![1]) - coin[0]!.cx).toBeCloseTo(rw, 2);
    expect(Number(window![2])).toBeCloseTo(coin[0]!.cy, 2);
    // Střed mince v kapse podle modelu (kapsa začíná na okraji listu pod nadpisem).
    const m2 = 10;
    expect(coin[0]!.cx).toBeCloseTo(m2 + L.coinCentreXMm, 2);
    expect(coin[0]!.cy).toBeCloseTo(m2 + 4 + L.coinCentreYMm, 2);
    const seamHoles = Number(/šev (\d+) otvorů od středu dna/.exec(pocketSheet ?? '')?.[1]);
    expect(seamHoles % 2).toBe(1);
    expect(cs.filter((c) => near(c.r, 0.45)).length).toBe(seamHoles);
    // Pás na listu 1 má tečky jen ve švu dna.
    expect(circles(sheet ?? '').filter((c) => near(c.r, 0.45)).length).toBe(3 * L.bottomSeamHoles);
  });

  it('kalibrační úsečka měří 50 mm', () => {
    const c = /M([\d.]+) ([\d.]+) V[\d.]+ M\1 ([\d.]+) H([\d.]+)/.exec(sheet ?? '');
    expect(c).not.toBeNull();
    expect(Number(c![4]) - Number(c![1])).toBeCloseTo(50, 6);
  });

  it('žádný prvek nevystupuje ze stránky (souřadnice čtené po příkazech)', () => {
    const pts: [number, number][] = [];
    for (const m of (sheet ?? '').matchAll(/ d="([^"]+)"/g)) {
      let cx = 0;
      let cy = 0;
      for (const cmd of m[1]!.matchAll(/([MLAHV])([^MLAHVZ]*)/g)) {
        const n = [...cmd[2]!.matchAll(/-?[\d.]+/g)].map((v) => Number(v[0]));
        if (cmd[1] === 'H') cx = n[n.length - 1] ?? cx;
        else if (cmd[1] === 'V') cy = n[n.length - 1] ?? cy;
        else {
          cx = n[n.length - 2] ?? cx;
          cy = n[n.length - 1] ?? cy;
        }
        pts.push([cx, cy]);
      }
    }
    for (const m of (sheet ?? '').matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
      const r = Number(m[3]);
      pts.push([Number(m[1]) - r, Number(m[2]) - r], [Number(m[1]) + r, Number(m[2]) + r]);
    }
    const xs = pts.map(([x]) => x);
    const ys = pts.map(([, y]) => y);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(A4_SHEET.widthMm);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(A4_SHEET.heightMm);
  });
});
