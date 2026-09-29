import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MINIMAL_WALLET,
  PRINT_SHEET,
  SHEET_HEADER_MM,
  fmt as cz,
  minimalWalletLayout,
} from '../src/lib/geometry/minimal-wallet.ts';
import {
  HOLE_R,
  LAYERS,
  backSideGlue,
  buildWalletBackSvg,
  buildWalletJigsSvg,
  buildWalletSheetSvg,
  buildWalletSheets,
  walletFileStem,
} from './minimal-wallet.ts';

const spec = DEFAULT_MINIMAL_WALLET;
const L = minimalWalletLayout(spec);
const sheet = buildWalletSheetSvg();
const back = buildWalletBackSvg();
const jigs = buildWalletJigsSvg();
const ox = PRINT_SHEET.marginMm;
const oy = PRINT_SHEET.marginMm + SHEET_HEADER_MM;
const near = (a: number, b: number, tol = 0.01): boolean => Math.abs(a - b) <= tol;

/** Obsah vrstvy `<g id="…">` (vrstvy nejsou vnořené). */
function layer(svg: string, id: string): string {
  const m = new RegExp(`<g id="${id}"[^>]*>(.*?)</g>`, 's').exec(svg);
  if (!m) throw new Error(`Vrstva ${id} chybí`);
  return m[1];
}
const nums = (s: string): number[] => [...s.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

/** Souřadnice listu → (x, u, stěna) dílu D1 na listu 1 (líc). */
const Hl = L.podHeightMm;
const F = L.foldMm;
function toPiece(X: number, Y: number): { x: number; u: number; wall: 'front' | 'back' } {
  const x = X - ox;
  if (Y <= oy + Hl) return { x, u: oy + Hl - Y, wall: 'front' };
  return { x, u: Y - (oy + Hl + F), wall: 'back' };
}

describe('generátor peněženky LUSK', () => {
  it('každý list má vrstvy CUT, STITCH, FOLD, GLUE, GUIDE v tomto pořadí a rozměr A4 v mm', () => {
    for (const svg of [sheet, back, jigs]) {
      const ids = [...svg.matchAll(/<g id="([A-Z]+)"/g)].map((m) => m[1]);
      expect(ids).toEqual([...LAYERS]);
      expect(svg).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
    }
  });

  it('každý list má text o tisku 1:1 a kontrolní úsečku přesně 50 mm', () => {
    for (const svg of [sheet, back, jigs]) {
      expect(svg).toContain('PRINT AT 100% / ACTUAL SIZE');
      expect(svg).toContain('Tisk na 100 %');
      expect(svg).toContain('měřítko 1:1');
      const cal = /class="calibration" d="M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/.exec(svg)!;
      expect(Number(cal[3]) - Number(cal[1])).toBeCloseTo(50, 6);
      expect(cal[2]).toBe(cal[4]);
    }
  });

  it('list 1 obsahuje ID dílu, tloušťku kůže a rozměry', () => {
    expect(sheet).toContain('D1 TĚLO');
    expect(sheet).toContain('useň 1,2 mm');
    expect(sheet).toContain('přířez 112 × 199,31 mm');
    expect(jigs).toContain('D2 PODLOŽKA PRAHU Ø 8');
    expect(jigs).toContain('T1 TRN');
    expect(jigs).toContain('ZL ZKUŠEBNÍ LUSK');
  });

  it('otvory stehu jsou jen ve vrstvě STITCH, jen na přední stěně a sedí na čarách švů', () => {
    const holes = [
      ...layer(sheet, 'STITCH').matchAll(
        new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="${HOLE_R}"`, 'g'),
      ),
    ].map((m) => toPiece(Number(m[1]), Number(m[2])));
    expect(holes).toHaveLength(L.holesTotal);
    expect(holes.every((h) => h.wall === 'front')).toBe(true);
    for (const s of L.seams) {
      const on = holes.filter((h) => near(h.x, s.x)).map((h) => h.u);
      expect(on).toHaveLength(s.holes);
      expect(Math.max(...on)).toBeCloseTo(s.uTop, 2);
      expect(Math.min(...on)).toBeCloseTo(s.uBottom, 2);
    }
    for (const id of ['CUT', 'FOLD', 'GLUE', 'GUIDE']) {
      expect(layer(sheet, id)).not.toContain(`r="${HOLE_R}"`);
    }
  });

  it('ohyb: dvě čáry konce ohybu F od sebe a osa uprostřed', () => {
    const lines = [...layer(sheet, 'FOLD').matchAll(/<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2"/g)]
      // jen čáry přes celý díl (legenda dole má vzorek čáry také ve vrstvě FOLD)
      .filter((m) => Number(m[1]) === ox && near(Number(m[3]), ox + L.widthMm))
      .map((m) => Number(m[2]));
    expect(lines).toHaveLength(3);
    const [a, mid, b] = lines.sort((p, q) => p - q) as [number, number, number];
    expect(b - a).toBeCloseTo(F, 2);
    expect(mid).toBeCloseTo((a + b) / 2, 2);
    expect(a).toBeCloseTo(oy + Hl, 2);
  });

  describe('virtuální složení (bod zadní stěny padne po přeložení na stejné x, u)', () => {
    const slots = [...layer(sheet, 'CUT').matchAll(/<path d="([^"]+)"[^>]*class="window"/g)].map(
      (m) => nums(m[1]),
    );
    it('průzor je na obou stěnách a po složení se kryje', () => {
      expect(slots).toHaveLength(2);
      const box = (d: number[]) => {
        // M x y A r r 0 0 1 x y L x y A r r 0 0 1 x y Z → body jsou na indexech 0,1 / 7,8 / 9,10 / 16,17
        const pts = [
          [d[0], d[1]],
          [d[7], d[8]],
          [d[9], d[10]],
          [d[16], d[17]],
        ].map(([X, Y]) => toPiece(X, Y));
        return {
          wall: pts[0].wall,
          x0: Math.min(...pts.map((p) => p.x)),
          x1: Math.max(...pts.map((p) => p.x)),
          u0: Math.min(...pts.map((p) => p.u)),
          u1: Math.max(...pts.map((p) => p.u)),
        };
      };
      const [a, b] = slots.map(box) as [ReturnType<typeof box>, ReturnType<typeof box>];
      expect(new Set([a.wall, b.wall])).toEqual(new Set(['front', 'back']));
      expect([a.x0, a.x1, a.u0, a.u1]).toEqual([b.x0, b.x1, b.u0, b.u1]);
      expect(a.x0).toBeCloseTo(L.windowX0, 2);
      expect(a.u0).toBeCloseTo(L.windowCenterBottomU, 2);
      expect(a.u1).toBeCloseTo(L.windowCenterTopU, 2);
    });

    it('obrys: rohy R4, schod a boky přední a zadní stěny se po složení kryjí', () => {
      const d = /<path d="([^"]+)"[^>]*class="outline"/.exec(layer(sheet, 'CUT'))![1];
      // koncové body segmentů (M, L a konec A)
      const pts: { x: number; u: number; wall: string }[] = [];
      for (const m of d.matchAll(/([MLA])([^MLAZ]+)/g)) {
        const v = nums(m[2]);
        const [X, Y] = m[1] === 'A' ? [v[5], v[6]] : [v[0], v[1]];
        pts.push(toPiece(X, Y));
      }
      const key = (p: { x: number; u: number }): string => `${p.x.toFixed(2)};${p.u.toFixed(2)}`;
      const front = new Set(pts.filter((p) => p.wall === 'front').map(key));
      const backPts = pts.filter((p) => p.wall === 'back');
      const shared = [
        { x: 0, u: L.cornerLeft.u },
        { x: L.cornerLeft.x, u: L.cardHeightMm },
        { x: L.stepCenterX, u: L.cardHeightMm },
        { x: L.stepCenterX + spec.stepRadiusMm, u: Hl },
        { x: L.cornerRight.x, u: Hl },
        { x: L.widthMm, u: L.cornerRight.u },
      ];
      for (const p of shared) {
        expect(front.has(key(p)), `přední ${key(p)}`).toBe(true);
        expect(backPts.map(key), `zadní ${key(p)}`).toContain(key(p));
      }
      // výkus na bankovky je jen vzadu, na palec jen vpředu, oba uvnitř karetní zóny
      expect(backPts.some((p) => near(p.u, L.billNotch.centerU) && near(p.x, L.billNotch.x0))).toBe(
        true,
      );
      expect(front.has(key({ x: L.thumbNotch.x0, u: L.thumbNotch.centerU }))).toBe(true);
      for (const n of [L.thumbNotch, L.billNotch]) {
        expect(n.x0).toBeGreaterThan(L.cardZoneX0);
        expect(n.x1).toBeLessThan(L.cardZoneX1);
      }
    });

    it('podložky D2 a jejich protějšky leží po složení proti sobě na ose lusku', () => {
      const ws = [
        ...layer(sheet, 'GUIDE').matchAll(
          new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="${spec.washerDiameterMm / 2}"`, 'g'),
        ),
      ].map((m) => toPiece(Number(m[1]), Number(m[2])));
      expect(ws).toHaveLength(2);
      expect(ws.map((w) => w.wall).sort()).toEqual(['back', 'front']);
      for (const w of ws) {
        expect(w.x).toBeCloseTo(L.podCenterX, 2);
        expect(w.u).toBeCloseTo(L.washerU, 2);
      }
    });

    it('lepení na rubu je zrcadlené a po otočení kryje všechny otvory švů', () => {
      const rects = [
        ...layer(back, 'GLUE').matchAll(
          /<rect class="glue glue-([LDP])" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g,
        ),
      ].map((m) => ({
        id: m[1],
        // rub → líc: x = W − x_rub
        x0: L.widthMm - (Number(m[2]) - ox + Number(m[4])),
        x1: L.widthMm - (Number(m[2]) - ox),
        y: Number(m[3]),
        h: Number(m[5]),
      }));
      expect(rects).toHaveLength(6);
      for (const s of L.seams) {
        const mine = rects.filter((r) => r.id === s.id);
        expect(mine).toHaveLength(2);
        for (const r of mine) {
          expect(s.x).toBeGreaterThan(r.x0);
          expect(s.x).toBeLessThan(r.x1);
          const top = toPiece(ox, r.y);
          const bottom = toPiece(ox, r.y + r.h);
          const [u0, u1] = [Math.min(top.u, bottom.u), Math.max(top.u, bottom.u)];
          expect(s.uBottom).toBeGreaterThan(u0);
          expect(s.uTop).toBeLessThan(u1);
        }
      }
      // dělicí pruh je na rubu 42,5–44,5 od hrany lusku
      const d = backSideGlue(L).find((q) => q.strip.id === 'D')!;
      expect([d.x0, d.x1]).toEqual([42.5, 44.5]);
      expect(back).toContain('42,5–44,5');
    });
  });

  it('trn T1: 29 u ústí, 28,5 u konce, délka 122', () => {
    const d = /<path d="([^"]+)"[^>]*class="mandrel"/.exec(layer(jigs, 'CUT'))![1];
    const v = nums(d);
    const xs = [v[0], v[2], v[4], v[6], v[8], v[10]] as number[];
    const ys = [v[1], v[3], v[5], v[7], v[9], v[11]] as number[];
    expect(xs[1] - xs[0]).toBeCloseTo(29, 6);
    expect(xs[3] - xs[4]).toBeCloseTo(28.5, 6);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(122, 6);
  });

  it('podložky D2 na listu 3 mají Ø 8 a je jich 6 (4 + 2 náhradní)', () => {
    const c = [...layer(jigs, 'CUT').matchAll(/<circle [^>]*r="4"/g)];
    expect(c).toHaveLength(6);
  });

  it('názvy souborů', () => {
    expect(walletFileStem(spec)).toBe('penezenka');
    expect(walletFileStem({ ...spec, leatherMm: 1.3 })).toBe('penezenka-kuze-1-3mm');
    expect(buildWalletSheets().map((s) => s.name)).toEqual([
      'penezenka-sablona',
      'penezenka-rub',
      'penezenka-pripravky',
    ]);
  });

  it('neplatný střih generátor odmítne', () => {
    expect(() => buildWalletSheetSvg({ ...spec, windowWidthMm: 25 })).toThrow(/Neplatný střih/);
  });

  it('jiná tloušťka kůže přepočítá šířky', () => {
    const svg = buildWalletSheetSvg({ ...spec, leatherMm: 1.3 });
    const L13 = minimalWalletLayout({ ...spec, leatherMm: 1.3 });
    expect(L13.widthMm).toBeGreaterThanOrEqual(L.widthMm);
    expect(svg).toContain(`useň 1,3 mm`);
  });

  it('vrstva CUT neobsahuje žádný text – jen řeznou geometrii (N6)', () => {
    for (const svg of [sheet, back, jigs]) {
      expect(layer(svg, 'CUT')).not.toContain('<text');
    }
  });

  it('list 2 (rub) má vyznačené pásmo zapečetění ústí lusku x 69,5–107,5, u 80–94 (S1)', () => {
    expect(back).toContain('ZAPEČETIT RUB');
    expect(back).toContain(`${cz(L.podX0)}–${cz(L.podX1)}`);
    expect(back).toContain(`${cz(L.windowTopU)}–${cz(L.podHeightMm)}`);
    // dvě zóny (přední i zadní stěna) ve vrstvě GUIDE, ne v CUT.
    const sealRects = [...layer(back, 'GUIDE').matchAll(/<rect x="[\d.]+" y="[\d.]+"/g)];
    expect(sealRects.length).toBeGreaterThanOrEqual(2);
  });

  it('list 2 (rub) má zarovnávací značky konců ohybu mimo obrys, na obou stranách (N5)', () => {
    // krátké čárky u = 0 (konec ohybu), na obou stěnách, kreslené vně obrysu (mimo x ∈ [ox, ox+W]).
    const endTicks = (svg: string): number[][] =>
      [...layer(svg, 'GUIDE').matchAll(/<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2"/g)]
        .filter((m) => Number(m[2]) === oy + Hl || Number(m[2]) === oy + Hl + F)
        .map((m) => [Number(m[1]), Number(m[3])]);
    for (const svg of [sheet, back]) {
      const ticks = endTicks(svg);
      expect(ticks.length).toBeGreaterThanOrEqual(4);
      for (const [xa, xb] of ticks) {
        expect(Math.min(xa, xb) < ox || Math.max(xa, xb) > ox + L.widthMm).toBe(true);
      }
    }
  });

  it('krok 11/13 (list 2): kulatá distanční tyčka Ø 6 mm, ne plochý trn T1 napříč (B1)', () => {
    expect(back).not.toContain('trn napříč do ohybu');
    expect(back).toContain(`kulatá tyčka Ø ${cz(L.foldSpacerDiameterMm)} mm do`);
    expect(back).toContain('NE trn T1');
    expect(L.foldSpacerDiameterMm).toBe(6);
  });

  it('list 1: hotová šířka nahoře na 1 desetinné místo, shoduje se s dokumentem (N3)', () => {
    expect(sheet).toContain('nahoře ≈ 106,1–109,5');
  });

  it('list 3: zkušební lusk má na rubu mirrored pozice lepených pruhů, ne jen vzorec (S3)', () => {
    expect(jigs).toContain('ZL – lepení na rubu');
    // dělicí pruh zkušebního lusku vyjde na rubu na stejná čísla jako u celého kusu (13.2 – dělicí
    // šev leží ve stejné vzdálenosti od hrany LUSKU), ale je dopočtený z T.glue, ne opsaný.
    expect(jigs).toContain('dělicí: 42,5–44,5, u 5–66,5');
    expect(jigs).toContain('levý (líc): 64,5–69, u 5–66,5');
    expect(jigs).toContain('pravý (líc): 0–4,5, u 5–66,5');
  });

  it('GLUE pruhy jsou ořezané obrysem dílu, aby nepřekreslovaly rohy R4 (N4)', () => {
    for (const svg of [sheet, back, jigs]) {
      expect(svg).toMatch(/<clipPath id="clip-outline-\d">/);
      expect(layer(svg, 'GLUE')).toContain('clip-path="url(#clip-outline-');
    }
  });
});
