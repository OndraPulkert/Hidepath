import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LID_WALLET,
  PRINT_SHEET,
  SHEET_HEADER_MM,
  fmt as cz,
  lidWalletLayout,
} from '../src/lib/geometry/lid-wallet.ts';
import {
  HOLE_R,
  LAYERS,
  buildLidBackSvg,
  buildLidJigsSvg,
  buildLidPartsSvg,
  buildLidSheetSvg,
  buildLidSheets,
  lidSpecFromArgs,
} from './lid-wallet.ts';

const spec = DEFAULT_LID_WALLET;
const L = lidWalletLayout(spec);
const sheet = buildLidSheetSvg();
const back = buildLidBackSvg();
const parts = buildLidPartsSvg();
const jigs = buildLidJigsSvg();
const all = [sheet, back, parts, jigs];
const ox = PRINT_SHEET.marginMm;
const oy = PRINT_SHEET.marginMm + SHEET_HEADER_MM;

function layer(svg: string, id: string): string {
  const m = new RegExp(`<g id="${id}"[^>]*>(.*?)</g>(?=<g id=|</svg>)`, 's').exec(svg);
  if (!m) throw new Error(`Vrstva ${id} chybí`);
  return m[1];
}
const nums = (s: string): number[] => [...s.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
/** List → (x, v) na P1 (líc). */
const toP1 = (X: number, Y: number) => ({ x: X - ox, v: Y - oy });
const near = (a: number, b: number, tol = 0.01): boolean => Math.abs(a - b) <= tol;

describe('generátor peněženky VÍČKO', () => {
  it('každý list má vrstvy CUT, STITCH, FOLD, GLUE, GUIDE v tomto pořadí a rozměr A4', () => {
    for (const svg of all) {
      expect([...svg.matchAll(/<g id="([A-Z]+)"/g)].map((m) => m[1])).toEqual([...LAYERS]);
      expect(svg).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
    }
  });

  it('každý list má „PRINT AT 100% / ACTUAL SIZE“ a kontrolní úsečku přesně 50 mm', () => {
    for (const svg of all) {
      expect(svg).toContain('PRINT AT 100% / ACTUAL SIZE');
      expect(svg).toContain('měřítko 1:1');
      const cal = /class="calibration" d="M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)"/.exec(svg)!;
      expect(Number(cal[3]) - Number(cal[1])).toBeCloseTo(50, 6);
      expect(cal[2]).toBe(cal[4]);
    }
  });

  it('text je jen ve vrstvě GUIDE, STITCH, FOLD, GLUE – nikdy v CUT', () => {
    for (const svg of all) expect(layer(svg, 'CUT')).not.toContain('<text');
  });

  it('obrys P1 je 101 × 231,7 a jazýček 20 mm široký uprostřed', () => {
    const d = /<path d="([^"]+)"[^>]*class="outline"/.exec(layer(sheet, 'CUT'))![1];
    const v = nums(d);
    const xs: number[] = [];
    const ys: number[] = [];
    for (const m of d.matchAll(/([ML])([\d.]+) ([\d.]+)/g)) {
      xs.push(Number(m[2]));
      ys.push(Number(m[3]));
    }
    expect(v.length).toBeGreaterThan(10);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(L.widthMm, 2);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(L.p1LengthMm, 2);
    const tongue = [...d.matchAll(/L([\d.]+) ([\d.]+)/g)]
      .map((m) => toP1(Number(m[1]), Number(m[2])))
      .filter((p) => near(p.v, L.v.cutEnd));
    expect(tongue.map((p) => p.x).sort((a, b) => a - b)).toEqual(L.tongueX);
  });

  it('výřez pro palec je v obrysu P1 (CUT) na listu 1 i 2: dno R5 na ose, hloubka 12', () => {
    const n = L.thumbNotch;
    for (const svg of [sheet, back]) {
      const d = /<path d="([^"]+)"[^>]*class="outline"/.exec(layer(svg, 'CUT'))![1];
      const arc = new RegExp(
        `L([\\d.]+) ([\\d.]+) A${n.radius} ${n.radius} 0 0 [01] ([\\d.]+) \\2 `,
      ).exec(d)!;
      expect(arc).not.toBeNull();
      const xs = [Number(arc[1]), Number(arc[3])].map((X) => X - ox).sort((a, b) => a - b);
      const x0 = svg === back ? L.widthMm - xs[1] : xs[0];
      expect(xs[1] - xs[0]).toBeCloseTo(n.x1 - n.x0, 6);
      expect(x0).toBeCloseTo(n.x0, 6);
      // střed oblouku v = hloubka − poloměr, dno v = hloubka pod horní hranou F
      expect(Number(arc[2]) - oy).toBeCloseTo(n.depthMm - n.radius, 6);
      expect(svg).toContain(`výřez pro palec Ø ${2 * n.radius} + nůž`);
    }
    expect(sheet).toContain('ověřit na papírovém modelu P0');
  });

  it('otvory na P1: S1 + S2 + S3 + S6 = 63, sedí na švech (S4/S5 až po složení)', () => {
    const holes = [
      ...layer(sheet, 'STITCH').matchAll(
        new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="${HOLE_R}"`, 'g'),
      ),
    ].map((m) => toP1(Number(m[1]), Number(m[2])));
    expect(holes).toHaveLength(21 + 13 + 13 + 16);
    const vB = (y: number) => L.v.backStart + (y - L.flatFromY);
    const vF = (y: number) => L.frontTopY - y;
    expect(holes.filter((h) => near(h.v, vB(L.s1Y)))).toHaveLength(21);
    expect(holes.filter((h) => near(h.v, vF(L.s6Y)))).toHaveLength(16);
    expect(holes.filter((h) => near(h.x, 36))).toHaveLength(13);
    expect(holes.filter((h) => near(h.x, 65))).toHaveLength(13);
    for (const id of ['CUT', 'FOLD', 'GLUE', 'GUIDE']) {
      expect(layer(sheet, id)).not.toContain(`r="${HOLE_R}"`);
    }
  });

  it('okénka mincí jsou v CUT (12 × 48 na B), okénko bankovek jen v GUIDE (řeže se po G3)', () => {
    const coin = [
      ...layer(sheet, 'CUT').matchAll(/<path d="([^"]+)"[^>]*class="coin-window"/g),
    ].map((m) => nums(m[1]));
    expect(coin).toHaveLength(2);
    for (const d of coin) {
      // M xa top A r r 0 0 1 xb top L xb bottom A … xa bottom
      const w = d[7] - d[0];
      const len = d[10] - d[1] + w;
      expect(w).toBeCloseTo(12, 6);
      expect(len).toBeCloseTo(48, 6);
    }
    expect(layer(sheet, 'CUT')).not.toContain('bill-window');
    expect(layer(sheet, 'GUIDE')).toContain('class="bill-window"');
    // Kolo 11: okénko bankovek 14 × 45, konce R7 výsečníkem Ø 14 (Ø 15 CraftPoint nemá)
    const bill = [
      ...layer(sheet, 'GUIDE').matchAll(/<path d="([^"]+)"[^>]*class="bill-window"/g),
    ].map((m) => nums(m[1]));
    expect(bill).toHaveLength(1);
    expect(bill[0][7] - bill[0][0]).toBeCloseTo(14, 6);
    expect(bill[0][2]).toBeCloseTo(7, 6);
    expect(bill[0][10] - bill[0][1] + 14).toBeCloseTo(45, 6);
    expect(sheet).toContain('okénko bankovek 14 × 45');
    expect(sheet).toContain('x 43,5–57,5, y 25–70');
    expect(sheet).toContain('výsečník Ø 14, řezat po G3 skrz D2 + B');
    expect(sheet).toContain('výsečníky Ø 8, 10, 12, 14');
  });

  it('ohyb dna a dva přehyby závěsu jsou ve FOLD přes celou šířku', () => {
    const full = [
      ...layer(sheet, 'FOLD').matchAll(/<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2"/g),
    ].filter((m) => Number(m[1]) === ox && near(Number(m[3]), ox + L.widthMm));
    const vs = full.map((m) => Number(m[2]) - oy);
    for (const v of [L.v.foldAxis, L.v.rearCrease, L.v.frontCrease]) {
      expect(vs.some((q) => near(q, v))).toBe(true);
    }
  });

  it('lepení na rubu je šrafované, oříznuté obrysem a G2 končí na dně karet', () => {
    expect(back).toMatch(/<clipPath id="clip-p1-rub">/);
    expect(layer(back, 'GLUE')).toContain('clip-path="url(#clip-p1-rub)"');
    const rects = [
      ...layer(back, 'GLUE').matchAll(
        /<rect class="glue glue-(G[\w]+)" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g,
      ),
    ];
    expect(rects).toHaveLength(L.glue.length);
    const g2 = rects.find((m) => m[1] === 'G2')!;
    // G2 na F: v od (y_F − y_dna) do (y_F − y_dna_bankovek)
    expect(Number(g2[3]) - oy).toBeCloseTo(L.frontTopY - L.cardFloorY, 2);
    expect(Number(g2[5])).toBeCloseTo(L.cardFloorY - L.d1BottomY, 2);
    expect(back).toContain('závěs – NElepit, NEšít');
    // značky „L“ zvlášť na rubu F a B
    expect(back).toContain('rub F');
    expect(back).toContain('rub B');
  });

  it('list 3: D1 93 × 79, D2 103 × 64 a plíšek 14 × 19,5', () => {
    expect(parts).toContain(`D1 ${cz(L.d1.x1 - L.d1.x0)} × ${cz(L.d1.y1 - L.d1.y0)} · D2 103 × 64`);
    const d2 = /<path d="M([\d.]+) ([\d.]+) h([\d.]+) v([\d.]+)[^"]*"[^>]*class="d2"/.exec(
      layer(parts, 'CUT'),
    )!;
    expect([Number(d2[3]), Number(d2[4])]).toEqual([103, 64]);
    expect(parts).toContain(`K2 plíšek 14 × ${cz(L.plate.y1 - L.plate.y0)} × 0,5`);
  });

  it('list 4: šablona jazýčku má magnet 7 nad špičkou a R10', () => {
    const t = /<path d="M([\d.]+) ([\d.]+) L[\d.]+ [\d.]+ L[\d.]+ ([\d.]+) A10 10/.exec(
      layer(jigs, 'CUT'),
    )!;
    const top = Number(t[2]);
    const tip = top + 24;
    const mag = /<circle class="magnet" cx="([\d.]+)" cy="([\d.]+)" r="4"/.exec(
      layer(jigs, 'GUIDE'),
    )!;
    expect(tip - Number(mag[2])).toBeCloseTo(spec.magnetFromTipMm, 6);
    expect(jigs).toContain('střed oblouku 10 nad špičkou');
    expect(jigs).toContain('PROUŽEK S4/S5');
  });

  it('názvy souborů', () => {
    expect(buildLidSheets().map((s) => s.name)).toEqual([
      'penezenka-vicko-sablona',
      'penezenka-vicko-rub',
      'penezenka-vicko-dily',
      'penezenka-vicko-pripravky',
    ]);
  });

  it('Kolo 6: bez ztenčení, hranaté rohy těla, S7 kolem L1 na šabloně jazýčku (list 4)', () => {
    // výchozí střih nic neztenčuje – na listu 1 není „ztenčit“, jen rýha ohybu a pás závěsu
    expect(sheet).not.toContain('ztenčit 0,6');
    expect(sheet).toContain('rýha z rubu na ose ohybu');
    expect(sheet).toContain('pás závěsu – nelepit, nešít');
    expect(sheet).toContain('spodní rohy těla hranaté');
    // S7: 8 otvorů ve STITCH na listu 4, na listu 1 jen odkaz (otvory S1–S3, S6 zůstávají 63)
    const holes = [
      ...layer(jigs, 'STITCH').matchAll(
        new RegExp(`<circle cx="[\\d.]+" cy="[\\d.]+" r="${HOLE_R}"`, 'g'),
      ),
    ];
    expect(holes).toHaveLength(L.lining.seamHoles.length);
    expect(sheet).toContain('S7 obšití L1 · 8 otvorů');
    expect(parts).toContain('useň 0,6');
  });

  it('přepínače záloh: --p1 0.8 a --skive-hinge 0,6 dají platný střih s vlastním jménem', () => {
    expect(lidSpecFromArgs([])).toEqual({ spec, suffix: '' });
    const a = lidSpecFromArgs(['--p1', '0.8']);
    expect(a.suffix).toBe('-p1-0-8');
    expect(a.spec.leatherMm).toBe(0.8);
    expect(() => buildLidSheets(a.spec)).not.toThrow();
    const b = lidSpecFromArgs(['--skive-hinge=0,6', '--skive-fold', '0.6']);
    expect(b.suffix).toBe('-ohyb-0-6-zaves-0-6');
    expect([b.spec.bottomFoldSkiveMm, b.spec.hingeSkiveMm]).toEqual([0.6, 0.6]);
    expect(buildLidSheetSvg(b.spec)).toContain('ztenčit 0,6 na plno · závěs');
    expect(buildLidSheetSvg(b.spec)).toContain('ztenčit 0,6 · ohyb dna (záloha)');
    expect(() => lidSpecFromArgs(['--p1'])).toThrow(/--p1 potřebuje číslo/);
    expect(() => lidSpecFromArgs(['--tloustka', '1'])).toThrow(/Neznámý přepínač/);
  });

  it('přepínače: samotné „--“ z pnpm se ignoruje, opakovaný přepínač se odmítne, výchozí hodnota je bez přípony', () => {
    expect(lidSpecFromArgs(['--', '--p1', '0.8'])).toEqual(lidSpecFromArgs(['--p1', '0.8']));
    expect(() => lidSpecFromArgs(['--p1', '0.8', '--p1', '1.0'])).toThrow(/víckrát: --p1/);
    expect(() => lidSpecFromArgs(['--p1=0.8', '--p1', '1.0'])).toThrow(/víckrát/);
    expect(lidSpecFromArgs(['--p1', '1'])).toEqual({ spec, suffix: '' });
    expect(lidSpecFromArgs(['--p1', '1', '--skive-fold', '0.6']).suffix).toBe('-ohyb-0-6');
  });

  it('list 1: tloušťka usně vždy na jedno desetinné místo (1,0 / 0,8)', () => {
    const sheet = buildLidSheetSvg(spec);
    expect(sheet).toContain('ohyb dna 1,0 bez ztenčení');
    expect(sheet).toContain('závěs 1,0 bez ztenčení');
    expect(sheet).toContain('useň 1,0 mm');
    expect(buildLidSheetSvg(lidSpecFromArgs(['--p1', '0.8']).spec)).toContain('useň 0,8 mm');
  });

  it('Kolo 9: přepínače --divider a --lining (změřená useň) s příponou, rozsah a kontroly česky', () => {
    const a = lidSpecFromArgs(['--divider', '0.8', '--lining=0,9']);
    expect(a.suffix).toBe('-d-0-8-l1-0-9');
    expect([a.spec.dividerMm, a.spec.liningMm]).toEqual([0.8, 0.9]);
    expect(buildLidSheets(a.spec)).toHaveLength(4);
    expect(buildLidPartsSvg(a.spec)).toContain('useň 0,8');
    expect(lidSpecFromArgs(['--divider', '0.6', '--lining', '0.6'])).toEqual({ spec, suffix: '' });
    expect(lidSpecFromArgs(['--p1', '0.8', '--divider', '0.9']).suffix).toBe('-p1-0-8-d-0-9');
    expect(() => lidSpecFromArgs(['--divider', '2'])).toThrow(
      /--divider potřebuje číslo mezi 0,3 a 1,2 mm/,
    );
    expect(() => lidSpecFromArgs(['--lining', 'x'])).toThrow(/--lining potřebuje číslo/);
    expect(() => lidSpecFromArgs(['--divider', '0.8', '--divider', '0.9'])).toThrow(/víckrát/);
    // přepážky 1,0: plná tloušťka nad 12 – generátor odmítne česky
    expect(() => buildLidSheets(lidSpecFromArgs(['--divider', '1.0']).spec)).toThrow(
      /Plná tloušťka 12,16 mm je nad přijatou hranicí/,
    );
  });

  it('Kolo 9: hrana vložky dna je na listu 1 i 2 (FOLD, s popiskem), list 4 bez kopyta a Z2', () => {
    for (const svg of [sheet, back]) {
      const fold = layer(svg, 'FOLD');
      expect(fold).toContain('class="insert-edge"');
      expect(fold).toContain(`hrana vložky dna v ${cz(L.v.insertEdge)}`);
      expect(fold).toContain('ověřit V12');
      // čára přes celou šířku na v hrany vložky (splývá s koncem oblouku ohybu)
      const full = [...fold.matchAll(/<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2"/g)].map(
        (m) => Number(m[2]) - oy,
      );
      expect(full.some((v) => near(v, L.v.insertEdge))).toBe(true);
    }
    expect(jigs).not.toMatch(/Kopyto závěsu|Opěrka|Z2|Z1/);
    expect(sheet).not.toContain('kopyt');
    expect(jigs).toContain('2 vrstvy starých karet');
    expect(jigs).toContain('otevřené víčko samo nestojí');
  });

  it('list 4: čísla pro postup a okno lepení magnetu dané varianty', () => {
    expect(jigs).toContain(`Značka magnetu y_m,B (krok 17): ${cz(L.magnetYB)}`);
    expect(jigs).toContain(`okno lepení ${cz(L.magnetYBMin)}–${cz(L.magnetYBMax)}`);
    expect(jigs).toContain(
      `hrana vložky dna (krok 11): v ${cz(L.v.insertEdge)} (${cz(L.v.insertEdge - L.v.foldAxis)} za rýhou)`,
    );
    expect(jigs).toContain('(1,96 za rýhou)');
    expect(jigs).toContain(`plíšek y ${cz(L.plate.y0)}–${cz(L.plate.y1)}`);
    // přepážky 0,8: jiná čísla a úzké okno (0,13 mm) s upozorněním
    const d8 = lidSpecFromArgs(['--divider', '0.8']).spec;
    const L8 = lidWalletLayout(d8);
    const j8 = buildLidJigsSvg(d8);
    expect(L8.magnetYB).toBe(11.6);
    expect(j8).toContain('Značka magnetu y_m,B (krok 17): 11,6');
    expect(j8).toContain('okno lepení 11,5–11,63');
    expect(j8).toContain('úzké okno');
    expect(j8).toContain(`kóta P1 na listu 1 (krok 0, 2): ${cz(L8.p1LengthMm)}`);
  });

  it('neplatný střih generátor odmítne', () => {
    expect(() => buildLidSheetSvg({ ...spec, billWindowWidthMm: 20 })).toThrow(
      /Neplatný střih peněženky VÍČKO/,
    );
  });
});
