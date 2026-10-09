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

  it('výřez pro palec je čárkovaně v CUT (řez až v lekci 5), obrys P1 jde horem rovně: dno R5 na ose, hloubka 12', () => {
    const n = L.thumbNotch;
    for (const svg of [sheet, back]) {
      const outline = /<path d="([^"]+)"[^>]*class="outline"/.exec(layer(svg, 'CUT'))![1];
      // horní hrana F rovně přes výřez (lekce 4): obrys nemá oblouk výsečníku
      expect(outline).not.toMatch(new RegExp(`A${n.radius} ${n.radius} `));
      const m = /<path class="thumb-notch" d="([^"]+)"([^>]*)\/>/.exec(layer(svg, 'CUT'))!;
      expect(m[2]).toContain('stroke-dasharray');
      const d = m[1];
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
    // šablona výřezu pro palec (lekce 2) jen na listu 1
    expect(layer(sheet, 'CUT')).toContain('class="thumb-template"');
    expect(layer(back, 'CUT')).not.toContain('class="thumb-template"');
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

  it('okénka mincí (12 × 48 na B) i okénko bankovek jsou v CUT čárkovaně – řez později (lekce 5 a 6)', () => {
    const coin = [
      ...layer(sheet, 'CUT').matchAll(
        /<path class="coin-window" d="([^"]+)" [^>]*stroke-dasharray/g,
      ),
    ].map((m) => nums(m[1]));
    expect(coin).toHaveLength(2);
    for (const d of coin) {
      // M xa top A r r 0 0 1 xb top L xb bottom A … xa bottom
      const w = d[7] - d[0];
      const len = d[10] - d[1] + w;
      expect(w).toBeCloseTo(12, 6);
      expect(len).toBeCloseTo(48, 6);
    }
    expect(layer(sheet, 'GUIDE')).not.toContain('bill-window');
    // Kolo 11: okénko bankovek 14 × 45, konce R7 výsečníkem Ø 14 (Ø 15 CraftPoint nemá)
    const bill = [
      ...layer(sheet, 'CUT').matchAll(
        /<path class="bill-window" d="([^"]+)" [^>]*stroke-dasharray/g,
      ),
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

  it('list 1: křížky na středech všech výsečníků (okénka mincí, okénko bankovek, výřez, napojení jazýčku)', () => {
    const crosses = [
      ...layer(sheet, 'GUIDE').matchAll(
        /<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2 M([\d.]+) ([\d.]+) L\4 ([\d.]+)"/g,
      ),
    ].map((m) => toP1(Number(m[4]), Number(m[2])));
    const at = (x: number) => crosses.filter((c) => near(c.x, x));
    // okénka mincí: 2 křížky na každém (Ø 12 na obou koncích)
    for (const w of L.coinWindows) expect(at(w.cx)).toHaveLength(2);
    // osa: okénko bankovek 2, výřez pro palec 1 (magnet se na listu 1 nekreslí, lekce 11)
    expect(at(L.axisX)).toHaveLength(3);
    expect(layer(sheet, 'GUIDE')).not.toContain('class="magnet"');
    // napojení jazýčku: střed Ø 8 vedle jazýčku, rj pod koncem pásu víčka
    const rj = spec.tongueJoinRadiusMm;
    for (const x of [L.tongueX[0] - rj, L.tongueX[1] + rj]) {
      expect(at(x).some((c) => near(c.v, L.v.bandEnd + rj))).toBe(true);
    }
  });

  it('listy 1 a 2 odkazují na lekce, ne na kroky zadání; švy S1–S3 a S6 se na rub neznačí', () => {
    for (const svg of [sheet, back]) {
      expect(svg).not.toMatch(/\bkrok(u|y)? \d/);
      expect(svg).not.toContain('oddíl 9');
    }
    expect(sheet).toContain('až po ořezu (lekce 11)');
    expect(back).toContain('pravidlo v lekci 6');
    expect(back).toContain('Švy S1–S3 a S6 se na rub neznačí');
    expect(layer(back, 'STITCH')).not.toContain('<circle');
  });

  it('list 4: proužek S4/S5 má čáru švu 3,0 od levé hrany', () => {
    const line = /class="side-seam-line" d="M([\d.]+) ([\d.]+) L\1 ([\d.]+)"/.exec(
      layer(jigs, 'STITCH'),
    )!;
    const strip = [
      ...layer(jigs, 'CUT').matchAll(
        /<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2 L\3 ([\d.]+) L\1 \4 Z"/g,
      ),
    ].find(
      (m) => near(Number(m[3]) - Number(m[1]), 10) && near(Number(m[4]) - Number(m[2]), L.heightMm),
    )!;
    expect(Number(line[1]) - Number(strip[1])).toBeCloseTo(L.seamSideX[0], 6);
    expect(L.seamSideX[0]).toBe(3);
    expect(jigs).toContain('čára švu 3,0 od levé hrany');
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
    expect(jigs).toContain(`Značka magnetu y_m,B (lekce 11): ${cz(L.magnetYB)}`);
    expect(jigs).toContain(`okno lepení ${cz(L.magnetYBMin)}–${cz(L.magnetYBMax)}`);
    expect(jigs).toContain(
      `hrana vložky dna (lekce 3, 4, 7): v ${cz(L.v.insertEdge)} (${cz(L.v.insertEdge - L.v.foldAxis)} za rýhou)`,
    );
    expect(jigs).toContain('(1,96 za rýhou)');
    expect(jigs).toContain(`plíšek y ${cz(L.plate.y0)}–${cz(L.plate.y1)}`);
    // přepážky 0,8: jiná čísla a úzké okno (0,13 mm) s upozorněním
    const d8 = lidSpecFromArgs(['--divider', '0.8']).spec;
    const L8 = lidWalletLayout(d8);
    const j8 = buildLidJigsSvg(d8);
    expect(L8.magnetYB).toBe(11.6);
    expect(j8).toContain('Značka magnetu y_m,B (lekce 11): 11,6');
    expect(j8).toContain('okno lepení 11,5–11,63');
    expect(j8).toContain('úzké okno');
    expect(j8).toContain(`kóta P1 na listu 1 (lekce 1, 4): ${cz(L8.p1LengthMm)}`);
    // list 4 odkazuje na lekce, ne na čísla kroků zadání
    expect(jigs).toContain('hrana víčka A / B / C (lekce 10)');
    expect(jigs).not.toMatch(/\bkrok(u|y)? \d/);
  });

  it('list 4: rámeček má i výšky, které se ve variantách posouvají (lekce 5, 6, 9)', () => {
    for (const [args, rows] of [
      [
        [],
        [
          'okénka mincí, středy konců (lekce 5): y 34 a 70',
          'G3 dno mincí y 18–23, spodní hrana D2 y 18 (lekce 6)',
          'S1 y 22 · S2/S3 y 28–76 (lekce 6)',
          'horní hrana F (lekce 9, 10): y 62',
          'G4 (lekce 9): F–D2 y 18–62, F–B y 1,75–18',
          'S4/S5 (lekce 9): y 76 až 8, úseky 8–52 /',
          '56–68 / 72–76, zdvojit 60–64',
        ],
      ],
      [
        ['--divider', '0.8'],
        [
          'okénka mincí, středy konců (lekce 5): y 33,5 a 69,5',
          'G3 dno mincí y 17,5–22,5, spodní hrana D2 y 17,5 (lekce 6)',
          'S1 y 21,5 · S2/S3 y 27,5–75,5 (lekce 6)',
          'horní hrana F (lekce 9, 10): y 61,5',
          'G4 (lekce 9): F–D2 y 17,5–61,5, F–B y 1,75–17,5',
          'S4/S5 (lekce 9): y 75,5 až 7,5, úseky 7,5–51,5 /',
          '55,5–67,5 / 71,5–75,5, zdvojit 59,5–63,5',
        ],
      ],
    ] as const) {
      const j = buildLidJigsSvg(lidSpecFromArgs([...args]).spec);
      for (const row of rows) expect(j, row).toContain(row);
    }
    // Rámeček se vejde nad vložku dna (nepřekryje ji).
    const ys = [...jigs.matchAll(/<text[^>]*y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)];
    const yOf = (t: string) => Number(ys.find((m) => m[2].startsWith(t))![1]);
    expect(yOf('značku přeměřit')).toBeLessThan(yOf('VLOŽKA DNA') - 10);
  });

  it('list 3: osa x 50,5 má značku u horní i spodní hrany D1 a D2 (lekce 4 propichuje oba konce)', () => {
    const X = ox + L.axisX;
    const marks = [
      ...layer(parts, 'GUIDE').matchAll(new RegExp(`M${X} (-?[\\d.]+) L${X} (-?[\\d.]+)`, 'g')),
    ];
    expect(marks).toHaveLength(4);
    for (const m of marks) expect(Math.abs(Number(m[2]) - Number(m[1]))).toBeCloseTo(3, 5);
  });

  it('každý list má legendu značek se stejnými popisy', () => {
    for (const svg of all) {
      expect(svg).toContain('ZNAČKY NA TOMTO LISTU');
      expect(svg).not.toContain('GUIDE značky, osy');
      for (const label of ['řez nožem po čáře', 'propíchnout jehlou skrz papír']) {
        expect(svg, label).toContain(label);
      }
    }
    expect(back).toContain('lepit kontaktním lepidlem (tato strana)');
    expect(parts).toContain('lepí se druhá strana (líc D2): zdrsnit');
    expect(sheet).toContain('řez později – lekce je u popisku');
  });

  it('značky k propíchnutí: konce os a přehybů (list 1, 2), rohy lepení (list 2), osa D1/D2 (list 3), ryska L1 (list 4)', () => {
    const pricks = (svg: string) =>
      [...layer(svg, 'GUIDE').matchAll(/<circle class="prick"/g)].length;
    // osa ohybu, hrana vložky, 2 přehyby × 2 boky (+ 2 kroužky v legendě: 1 vzorek)
    expect(pricks(sheet)).toBe(8 + 1);
    expect(pricks(back)).toBeGreaterThan(8 + 1);
    // osa D1/D2 (4) + G2/G2b na D1 (4) + rohy G3 na D2 (10) + klín D2 (2) + horní hrana G4 (4)
    expect(pricks(parts)).toBe(4 + 4 + 10 + 2 + 4 + 1);
    // ryska L1 (2) + střed magnetu (1) + klín špičky (2) + konce čáry švu na proužku (2)
    // + proužek V12 (4) + vzorek v legendě
    expect(pricks(jigs)).toBe(2 + 1 + 2 + 2 + 4 + 1);
  });

  /** Kroužky „propíchnout“ na listu jako body (x, y) v mm listu. */
  const prickPts = (svg: string) =>
    [...layer(svg, 'GUIDE').matchAll(/<circle class="prick" cx="([\d.]+)" cy="([\d.]+)"/g)].map(
      (m) => ({ x: Number(m[1]), y: Number(m[2]) }),
    );
  const hasPrick = (svg: string, x: number, y: number): boolean =>
    prickPts(svg).some((q) => near(q.x, x) && near(q.y, y));

  it('list 3: kroužky hranic lepení G2/G2b (D1), G3 (D2), klínu D2 a horní hrany G4 z modelu', () => {
    // Stejné mapování jako buildLidPartsSvg: D1 a D2 z rubu, y nahoru.
    const px = ox + 4;
    const oy1 = oy + 6;
    const X1 = (x: number) => px + (x - L.d1.x0);
    const Y1 = (y: number) => oy1 + (L.d1.y1 - y);
    const oy2 = oy1 + (L.d1.y1 - L.d1.y0) + 12;
    const X2 = (x: number) => px - 5 + (x - L.d2.x0);
    const Y2 = (y: number) => oy2 + (L.d2.y1 - y);
    const [g2bL, g2bR] = L.glue.filter((g) => g.id === 'G2b');
    for (const x of [g2bL.x1, g2bR.x0]) {
      for (const y of [g2bL.y0, g2bL.y1])
        expect(hasPrick(parts, X1(x), Y1(y)), `D1 ${x} ${y}`).toBe(true);
    }
    const g3 = L.glue.filter((g) => g.id === 'G3b' || g.id === 'G3c');
    for (const g of g3) {
      for (const x of [g.x0, g.x1].filter((v) => v > 0 && v < L.widthMm)) {
        for (const y of [g.y0, g.y1])
          expect(hasPrick(parts, X2(x), Y2(y)), `G3 ${x} ${y}`).toBe(true);
      }
    }
    // horní hrana G3b na boku: kroužek 1,5 mm od hrany D2
    expect(hasPrick(parts, X2(L.d2.x0 + 1.5), Y2(L.topGlueY))).toBe(true);
    const yw = Y2(L.d2.y0 + spec.d2SkiveWedgeMm);
    expect(hasPrick(parts, X2(L.d2.x0 + 1.5), yw)).toBe(true);
    expect(hasPrick(parts, X2(L.d2.x1 - 1.5), yw)).toBe(true);
    // G4 na líci D2: horní hrana ve výšce horní hrany F, vnitřní hranice = hranice G3b (x 4)
    const g4 = L.glue.find((g) => g.id === 'G4' && g.what.includes('líc D2'))!;
    expect(g4.x1).toBe(g3[0].x1);
    expect(hasPrick(parts, X2(g4.x1), Y2(g4.y1))).toBe(true);
    expect(hasPrick(parts, X2(L.d2.x0 + 1.5), Y2(g4.y1))).toBe(true);
    expect(parts).toContain('kroužky přes šablonu na líci');
  });

  it('list 2: konce hranice Tokonole mají kroužky (1,5 mm od boků jazýčku)', () => {
    const y = oy + L.v.bandEnd;
    const [t0, t1] = L.tongueX;
    // List 2 je zrcadlený: x_rub = W − x.
    for (const x of [t0 + 1.5, t1 - 1.5]) {
      expect(hasPrick(back, ox + L.widthMm - x, y), `${x}`).toBe(true);
    }
  });

  it('list 4: šablona konce jazýčku má kroužek středu magnetu a kroužky klínu, proužek V12 rýhu a hranu vložky', () => {
    const tx = ox + 4;
    const tipY = oy + 6 + 24;
    const cx = tx + spec.tongueWidthMm / 2;
    expect(hasPrick(jigs, cx, tipY - spec.magnetFromTipMm)).toBe(true);
    const wedge = prickPts(jigs).filter((q) => near(q.y, tipY - spec.tipSkiveMm));
    expect(wedge).toHaveLength(2);
    expect(near(wedge[0].x + wedge[1].x, 2 * cx)).toBe(true);
    expect(jigs).toContain('(kroužek)');
    expect(jigs).not.toContain('křížek');
    // proužek V12: kroužky na dvou čarách vzdálených o hranu vložky za rýhou
    const strip = /<path d="M([\d.]+) ([\d.]+)[^"]*"[^>]*class="v12-strip"/.exec(
      layer(jigs, 'CUT'),
    )!;
    const sy = Number(strip[2]);
    const sx = Number(strip[1]);
    const inStrip = prickPts(jigs).filter(
      (q) => q.y > sy && q.y < sy + 14 && q.x > sx && q.x < sx + 30,
    );
    const ys = [...new Set(inStrip.map((q) => q.y))].sort((a, b) => a - b);
    expect(inStrip).toHaveLength(4);
    expect(ys).toHaveLength(2);
    expect(ys[1] - ys[0]).toBeCloseTo(L.v.insertEdge - L.v.foldAxis, 3);
    expect(jigs).toContain(`za ní hrana vložky (${cz(L.v.insertEdge - L.v.foldAxis)} mm)`);
  });

  it('list 2: osa x 50,5 má kroužky na rubu F (2) i rubu B (2), lekce 6 a 8 na ni přikládají D2 a D1', () => {
    // List 2 je zrcadlený, osa leží uprostřed šířky – x je stejné jako na listu 1.
    const axisPricks = [
      ...layer(back, 'GUIDE').matchAll(/<circle class="prick" cx="([\d.]+)" cy="([\d.]+)"/g),
    ].filter((m) => Math.abs(Number(m[1]) - (ox + L.axisX)) < 0.01);
    expect(axisPricks.length).toBe(4);
  });

  it('list 3: šablona D2 má otvory S1–S3 (způsob (b) v lekci 6); list 4: proužek má 18 otvorů a úseky děrování', () => {
    const holes = [
      ...layer(parts, 'STITCH').matchAll(
        new RegExp(`<circle cx="[\\d.]+" cy="[\\d.]+" r="${HOLE_R}"`, 'g'),
      ),
    ];
    expect(holes).toHaveLength(21 + 13 + 13);
    expect(parts).toContain('brousit z LÍCE D2');
    const strip = [...layer(jigs, 'STITCH').matchAll(/<circle class="strip-hole"/g)];
    expect(strip).toHaveLength(L.seams.find((q) => q.id === 'S4')!.holes.length);
    for (const t of [
      'šít od 76 ↓',
      'konec 8',
      '① z líce F,',
      '56, 60 z líce F',
      '64, 68 z líce D2',
      'zdvojit 60–64',
      '③ z líce D2',
      'nad F 4,0 od D2',
      'S5 rub nahoru',
    ]) {
      expect(jigs, t).toContain(t);
    }
    expect(jigs).not.toContain('první 8');
  });

  it('list 2: hranice Tokonole (pás víčka ano, jazýček ne) a pořadí podle lekce 8', () => {
    expect(back).toContain('Tokonole jen nad touto čarou');
    expect(back).toContain('jazýček: BEZ');
    expect(back).not.toContain('odklopená');
    expect(back).toContain('F rubem nahoru na desce');
    // G4 rub F ↔ rub B je jeden řádek pro obě stěny
    expect(back).not.toContain('rub B ↔ rub F');
    expect(back).toContain('(F i B)');
  });

  it('neplatný střih generátor odmítne', () => {
    expect(() => buildLidSheetSvg({ ...spec, billWindowWidthMm: 20 })).toThrow(
      /Neplatný střih peněženky VÍČKO/,
    );
  });
});
