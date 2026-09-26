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
    // Vydutý oblouček v kořeni jazyka (proti směru), pak rovná horní hrana k výřezu.
    const rf = Math.min(rc, L.scoopStartXMm - L.tabX1Mm);
    expect(body).toContain(`A${rf} ${rf} 0 0 0 ${P(L.tabX1Mm + rf, 0)}`);
    // Výřez U: čtvrtkruh dolů, dno přes pásmo ohybu A, čtvrtkruh nahoru.
    expect(body).toContain(
      `L${P(L.scoopStartXMm, 0)} A${S} ${S} 0 0 0 ${P(L.backX1Mm, S)} ` +
        `L${P(L.frontX0Mm, S)} A${S} ${S} 0 0 0 ${P(L.scoopEndXMm, 0)}`,
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

  it('šev dna: čára přes celý pás, tečky na předním panelu s roztečí z modelu', () => {
    const seamY = Y(L.bottomSeamYMm);
    expect(sheet).toContain(
      `M${fmt(X(0))} ${fmt(seamY)} L${fmt(X(L.stripLengthMm))} ${fmt(seamY)}`,
    );
    const dots = circles(sheet ?? '')
      .filter((c) => near(c.r, 0.45) && near(c.cy, seamY))
      .map((c) => c.cx)
      .sort((a, b) => a - b);
    expect(dots.length).toBe(L.bottomSeamHoles);
    expect(dots[0]).toBeCloseTo(X(L.frontX0Mm + spec.stitchOffsetMm), 2);
    for (let i = 1; i < dots.length; i++) {
      expect(dots[i]! - dots[i - 1]!).toBeCloseTo(spec.stitchPitchMm, 6);
    }
    expect(dots[dots.length - 1]).toBeLessThanOrEqual(X(L.frontX1Mm - spec.stitchOffsetMm) + 0.01);
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

  it('kapsa s mincí: okno, mince a pata důlku soustředné, šev od středu dna', () => {
    const cs = circles(sheet ?? '');
    const coin = cs.filter((c) => near(c.r, spec.coinDiameterMm / 2));
    const foot = cs.filter((c) => near(c.r, L.formHoleDiameterMm / 2));
    expect(coin.length).toBe(1);
    // Pata důlku je na kapse i jako otvor formy.
    expect(foot.length).toBe(1);
    const window = /<path d="M([\d.]+) ([\d.]+) A16 16 /.exec(sheet ?? '');
    expect(window).not.toBeNull();
    expect(Number(window![1]) - coin[0]!.cx).toBeCloseTo(L.windowDiameterMm / 2, 2);
    expect(Number(window![2])).toBeCloseTo(coin[0]!.cy, 2);
    const seamHoles = Number(/šev (\d+) otvorů od středu dna/.exec(sheet ?? '')?.[1]);
    expect(seamHoles % 2).toBe(1);
    const dots = cs.filter((c) => near(c.r, 0.45));
    expect(dots.length).toBe(L.bottomSeamHoles + seamHoles);
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
