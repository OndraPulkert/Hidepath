/**
 * Vykreslí 1:1 výrobní střih peněženky LUSK (docs/zadani/penezenka-navrh.md) do SVG a PDF.
 *
 *   pnpm pattern:wallet                    # výchozí střih (useň 1,2 mm)
 *   pnpm pattern:wallet --thickness 1.3    # jiná změřená tloušťka kůže (vlastní soubory)
 *
 * Listy (A4 na výšku, 1:1, v každém SVG vrstvy CUT / STITCH / FOLD / GLUE / GUIDE):
 * 1. penezenka-sablona – díl D1 z LÍCE: obrys, výřezy, švy s otvory, ohyb, značky,
 * 2. penezenka-rub – díl D1 z RUBU (x_rub = W − x): lepené pruhy a maskovací páska,
 * 3. penezenka-pripravky – zkušební lusk ZL, trn T1 (forma), podložky D2.
 * Všechny tři listy jsou i v penezenka-vse.pdf. Geometrie je celá v
 * src/lib/geometry/minimal-wallet.ts; tady se jen kreslí.
 *
 * NÁVRH k ověření na prototypu: nejdřív papírový model a zkušební lusk (oddíl 13 dokumentu).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  CALIBRATION_MM,
  DEFAULT_MINIMAL_WALLET,
  PRINT_SHEET,
  SHEET_FOOTER_MM,
  SHEET_HEADER_MM,
  type GlueStrip,
  type MinimalWalletLayout,
  type MinimalWalletSpec,
  type Seam,
  assertMinimalWallet,
  fmt,
  minimalWalletLayout,
} from '../src/lib/geometry/minimal-wallet.ts';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = fmt;
/** Číslo na 1 desetinné místo s čárkou (odhad „nahoře“ – doc 8.1 uvádí jen 1 des. místo, N3). */
const cz1 = (v: number): string => (Math.round(v * 10) / 10).toString().replace('.', ',');

export const COLORS = {
  CUT: '#1f1f1f',
  STITCH: '#b3261e',
  FOLD: '#1f5fa8',
  GLUE: '#2e7d32',
  GUIDE: '#6f6f6f',
} as const;
/** Poloměr tečky otvoru stehu v mm (testy podle něj otvory poznají). */
export const HOLE_R = 0.45;
/** Pořadí vrstev v každém SVG. */
export const LAYERS = ['CUT', 'STITCH', 'FOLD', 'GLUE', 'GUIDE'] as const;
type Layer = (typeof LAYERS)[number];
type Anchor = 'start' | 'middle' | 'end';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Kreslicí plátno s pěti vrstvami. */
class Sheet {
  private readonly layers: Record<Layer, string[]> = {
    CUT: [],
    STITCH: [],
    FOLD: [],
    GLUE: [],
    GUIDE: [],
  };
  private readonly defs: string[] = [];

  add(layer: Layer, s: string): void {
    this.layers[layer].push(s);
  }

  /** Zaregistruje ořezovou masku podle obrysu dílu (N4: lepené pruhy se nemají kreslit přes hranu). */
  clipPath(id: string, outlineD: string): void {
    this.defs.push(`<clipPath id="${id}"><path d="${outlineD}"/></clipPath>`);
  }

  path(layer: Layer, d: string, width: number, dash?: string, extra = ''): void {
    this.add(
      layer,
      `<path d="${d}" fill="none" stroke="${COLORS[layer]}" stroke-width="${f(width)}"` +
        (dash ? ` stroke-dasharray="${dash}"` : '') +
        extra +
        '/>',
    );
  }

  line(layer: Layer, x0: number, y0: number, x1: number, y1: number, width = 0.2, dash?: string) {
    this.path(layer, `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}`, width, dash);
  }

  circle(layer: Layer, cx: number, cy: number, r: number, width = 0.2, dash?: string): void {
    this.add(
      layer,
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${COLORS[layer]}" stroke-width="${f(width)}"` +
        (dash ? ` stroke-dasharray="${dash}"` : '') +
        '/>',
    );
  }

  hole(cx: number, cy: number): void {
    this.add(
      'STITCH',
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${HOLE_R}" fill="${COLORS.STITCH}"/>`,
    );
  }

  cross(layer: Layer, cx: number, cy: number, s = 1.5): void {
    this.path(
      layer,
      `M${f(cx - s)} ${f(cy)} L${f(cx + s)} ${f(cy)} M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy + s)}`,
      0.2,
    );
  }

  text(
    layer: Layer,
    x: number,
    y: number,
    s: string,
    size = 2.4,
    anchor: Anchor = 'start',
    opts: { bold?: boolean; rotate?: number; fill?: string } = {},
  ): void {
    const rot = opts.rotate ? ` transform="rotate(${opts.rotate} ${f(x)} ${f(y)})"` : '';
    this.add(
      layer,
      `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}"` +
        `${opts.bold ? ' font-weight="bold"' : ''} text-anchor="${anchor}" fill="${opts.fill ?? COLORS[layer]}"${rot}>${esc(s)}</text>`,
    );
  }

  /** Šrafa pod 45° oříznutá na obdélník (vzor <pattern> se v PDF z Chromia rastruje). */
  hatch(layer: Layer, x0: number, y0: number, w: number, h: number, cls: string): void {
    const step = 1.2;
    const segs: string[] = [];
    for (let c = x0 - (y0 + h); c <= x0 + w - y0; c += step) {
      const ya = Math.max(y0, x0 - c);
      const yb = Math.min(y0 + h, x0 + w - c);
      if (yb - ya > 0.05) segs.push(`M${f(ya + c)} ${f(ya)} L${f(yb + c)} ${f(yb)}`);
    }
    this.add(
      layer,
      `<path d="${segs.join(' ')}" stroke="${COLORS[layer]}" stroke-width="0.15" stroke-opacity="0.7" fill="none"/>`,
    );
    this.add(
      layer,
      `<rect class="${cls}" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="${COLORS[layer]}" stroke-width="0.25"/>`,
    );
  }

  render(title: string): string {
    const { widthMm: W, heightMm: H } = PRINT_SHEET;
    const groups = LAYERS.map(
      (id) =>
        `<g id="${id}" inkscape:groupmode="layer" inkscape:label="${id}">${this.layers[id].join('')}</g>`,
    ).join('');
    const defs = this.defs.length > 0 ? `<defs>${this.defs.join('')}</defs>` : '';
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
      `width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
      `<title>${esc(title)}</title>` +
      defs +
      `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
      groups +
      '</svg>\n'
    );
  }
}

/** Mapování souřadnic dílu (x, u, stěna) na list. `mirror` = pohled na rub (x_rub = W − x). */
interface Frame {
  X: (x: number) => number;
  Y: (u: number, wall: 'front' | 'back') => number;
  /** Směr oblouku: při zrcadlení se obrací. */
  sweep: (s: 0 | 1) => 0 | 1;
}

function frame(ox: number, oy: number, W: number, H: number, F: number, mirror: boolean): Frame {
  return {
    X: (x) => ox + (mirror ? W - x : x),
    Y: (u, wall) => (wall === 'front' ? oy + H - u : oy + H + F + u),
    sweep: (s) => (mirror ? ((1 - s) as 0 | 1) : s),
  };
}

/**
 * Obrys D1 (jedna uzavřená cesta po směru hodinových ručiček při pohledu na líc): přední stěna
 * nahoře (rohy R4, výkus na palec, vydutý schod R6), pravý bok přes ohyb, zadní stěna dole
 * (výkus na bankovky, schod), levý bok zpět.
 */
export function bodyOutline(L: MinimalWalletLayout, spec: MinimalWalletSpec, fr: Frame): string {
  const { X, Y, sweep } = fr;
  const Ro = spec.outerCornerRadiusMm;
  const Rs = spec.stepRadiusMm;
  const rv = spec.notchCornerRadiusMm;
  const W = L.widthMm;
  const Hc = L.cardHeightMm;
  const Hl = L.podHeightMm;
  const tn = L.thumbNotch;
  const bn = L.billNotch;
  const P = (x: number, u: number, w: 'front' | 'back'): string => `${f(X(x))} ${f(Y(u, w))}`;
  const A = (r: number, s: 0 | 1, x: number, u: number, w: 'front' | 'back'): string =>
    `A${f(r)} ${f(r)} 0 0 ${sweep(s)} ${P(x, u, w)} `;
  const stepX1 = L.stepCenterX + Rs;
  return (
    `M${P(0, Hc - Ro, 'front')} ` +
    A(Ro, 1, Ro, Hc, 'front') +
    `L${P(tn.x0 - rv, Hc, 'front')} ` +
    A(rv, 1, tn.x0, Hc - rv, 'front') +
    `L${P(tn.x0, tn.centerU, 'front')} ` +
    A(tn.r, 0, tn.x1, tn.centerU, 'front') +
    `L${P(tn.x1, Hc - rv, 'front')} ` +
    A(rv, 1, tn.x1 + rv, Hc, 'front') +
    `L${P(L.stepCenterX, Hc, 'front')} ` +
    A(Rs, 0, stepX1, Hl, 'front') +
    `L${P(W - Ro, Hl, 'front')} ` +
    A(Ro, 1, W, Hl - Ro, 'front') +
    `L${P(W, Hl - Ro, 'back')} ` +
    A(Ro, 1, W - Ro, Hl, 'back') +
    `L${P(stepX1, Hl, 'back')} ` +
    A(Rs, 0, L.stepCenterX, Hc, 'back') +
    `L${P(bn.x1 + rv, Hc, 'back')} ` +
    A(rv, 1, bn.x1, Hc - rv, 'back') +
    `L${P(bn.x1, bn.centerU, 'back')} ` +
    A(bn.r, 0, bn.x0, bn.centerU, 'back') +
    `L${P(bn.x0, Hc - rv, 'back')} ` +
    A(rv, 1, bn.x0 - rv, Hc, 'back') +
    `L${P(Ro, Hc, 'back')} ` +
    A(Ro, 1, 0, Hc - Ro, 'back') +
    'Z'
  );
}

/** Průzor: štěrbina se dvěma půlkruhovými konci (výsečník Ø w). */
function slotPath(
  fr: Frame,
  cx: number,
  u0: number,
  u1: number,
  w: number,
  wall: 'front' | 'back',
) {
  const r = w / 2;
  const { X, Y } = fr;
  const xa = Math.min(X(cx - r), X(cx + r));
  const xb = Math.max(X(cx - r), X(cx + r));
  const top = Math.min(Y(u1, wall), Y(u0, wall));
  const bottom = Math.max(Y(u1, wall), Y(u0, wall));
  return (
    `M${f(xa)} ${f(top)} A${f(r)} ${f(r)} 0 0 1 ${f(xb)} ${f(top)} L${f(xb)} ${f(bottom)} ` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(xa)} ${f(bottom)} Z`
  );
}

function drawSeams(s: Sheet, fr: Frame, seams: Seam[], pitch: number): void {
  for (const q of seams) {
    const x = fr.X(q.x);
    s.line('STITCH', x, fr.Y(q.uTop, 'front'), x, fr.Y(q.uBottom, 'front'), 0.15, '0.8 0.6');
    for (let i = 0; i < q.holes; i++) s.hole(x, fr.Y(q.uTop - i * pitch, 'front'));
  }
}

/** Kontrolní úsečka 50 mm, texty o tisku a měřítku (na každém listu). */
function footer(s: Sheet, note: string): void {
  const { heightMm: H, marginMm: m } = PRINT_SHEET;
  const y = H - m - SHEET_FOOTER_MM + 8;
  const x0 = m;
  s.line('GUIDE', x0, y, x0 + CALIBRATION_MM, y, 0.4);
  s.line('GUIDE', x0, y - 2.5, x0, y + 2.5, 0.3);
  s.line('GUIDE', x0 + CALIBRATION_MM, y - 2.5, x0 + CALIBRATION_MM, y + 2.5, 0.3);
  s.add(
    'GUIDE',
    `<path class="calibration" d="M${f(x0)} ${f(y)} L${f(x0 + CALIBRATION_MM)} ${f(y)}" stroke="${COLORS.GUIDE}" stroke-width="0.01"/>`,
  );
  s.text('GUIDE', x0 + CALIBRATION_MM / 2, y - 3.2, 'KONTROLNÍ ÚSEČKA 50 mm', 2.4, 'middle', {
    bold: true,
    fill: COLORS.CUT,
  });
  s.text('GUIDE', x0 + CALIBRATION_MM + 6, y - 1.5, 'PRINT AT 100% / ACTUAL SIZE', 3.4, 'start', {
    bold: true,
    fill: COLORS.CUT,
  });
  s.text(
    'GUIDE',
    x0 + CALIBRATION_MM + 6,
    y + 2.5,
    'Tisk na 100 % (skutečná velikost), vypnout „přizpůsobit stránce“ · měřítko 1:1',
    2.3,
    'start',
    { fill: COLORS.CUT },
  );
  s.text(
    'GUIDE',
    x0,
    y + 8,
    'Po tisku změř úsečku pravítkem: musí mít přesně 50 mm, jinak střih nepoužívej.',
    2.3,
  );
  s.text('GUIDE', x0, y + 12, note, 2.3);
  // Legenda vrstev.
  const ly = y + 18;
  const items: [Layer, string, string | undefined][] = [
    ['CUT', 'CUT řez', undefined],
    ['STITCH', 'STITCH šev a otvory', '0.8 0.6'],
    ['FOLD', 'FOLD ohyb', '3 1.5'],
    ['GLUE', 'GLUE lepení', undefined],
    ['GUIDE', 'GUIDE značky, osy', '1.5 1'],
  ];
  items.forEach(([layer, label, dash], i) => {
    const x = x0 + i * 38;
    // Vzorek čáry je ve své vrstvě (ukazuje styl), popisek je vždy v GUIDE – CUT smí obsahovat
    // jen řeznou geometrii, žádný text (N6).
    s.line(layer, x, ly, x + 7, ly, layer === 'CUT' ? 0.3 : 0.25, dash);
    s.text('GUIDE', x + 8.5, ly + 0.8, label, 2.2, 'start', { fill: COLORS[layer] });
  });
}

function header(s: Sheet, title: string, sub: string): void {
  const m = PRINT_SHEET.marginMm;
  s.text('GUIDE', m, m + 5, title, 5, 'start', { bold: true, fill: COLORS.CUT });
  s.text('GUIDE', m, m + 10.5, sub, 2.6, 'start', { fill: COLORS.CUT });
  s.text('GUIDE', PRINT_SHEET.widthMm - m, m + 5, 'NÁVRH – ověřit na prototypu', 2.6, 'end', {
    bold: true,
    fill: COLORS.STITCH,
  });
}

/** Sloupec textu vpravo od dílu. */
function column(s: Sheet, x: number, y: number, lines: string[], size = 2.3, gap = 3.5): number {
  let yy = y;
  for (const ln of lines) {
    if (ln === '') {
      yy += gap * 0.6;
      continue;
    }
    const bold = ln.startsWith('# ');
    s.text('GUIDE', x, yy, bold ? ln.slice(2) : ln, bold ? size + 0.3 : size, 'start', {
      bold,
      fill: COLORS.CUT,
    });
    yy += gap;
  }
  return yy;
}

const PIECE_X = PRINT_SHEET.marginMm;
const PIECE_Y = PRINT_SHEET.marginMm + SHEET_HEADER_MM;

/** List 1: díl D1 z líce. */
export function buildWalletSheetSvg(spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET): string {
  assertMinimalWallet(spec);
  const L = minimalWalletLayout(spec);
  const s = new Sheet();
  const W = L.widthMm;
  const Hl = L.podHeightMm;
  const F = L.foldMm;
  const fr = frame(PIECE_X, PIECE_Y, W, Hl, F, false);
  const { X, Y } = fr;
  header(
    s,
    'LUSK · D1 TĚLO · LÍC',
    `1 ks · useň ${cz(L.t)} mm · přířez ${cz(W)} × ${cz(L.lengthMm)} mm · list 1/3`,
  );

  /* CUT */
  const outlineD1 = bodyOutline(L, spec, fr);
  s.path('CUT', outlineD1, 0.3, undefined, ' class="outline"');
  s.clipPath('clip-outline-1', outlineD1);
  for (const wall of ['front', 'back'] as const) {
    s.path(
      'CUT',
      slotPath(
        fr,
        L.podCenterX,
        L.windowCenterBottomU,
        L.windowCenterTopU,
        spec.windowWidthMm,
        wall,
      ),
      0.3,
      undefined,
      ' class="window"',
    );
  }

  /* STITCH – jen na přední stěně, děruje se skrz obě slepené vrstvy. */
  drawSeams(s, fr, L.seams, spec.stitchPitchMm);
  for (const q of L.seams) {
    s.text(
      'STITCH',
      X(q.x) + (q.id === 'L' ? 1 : q.id === 'P' ? -1 : 0),
      Y(q.uBottom, 'front') + 3,
      `${q.id} ${q.holes}`,
      1.8,
      q.id === 'L' ? 'start' : q.id === 'P' ? 'end' : 'middle',
    );
  }
  s.text(
    'STITCH',
    X(L.cardCenterX),
    Y(28, 'front'),
    'otvory přenést až na slepený kus',
    1.7,
    'middle',
  );
  s.text(
    'STITCH',
    X(L.cardCenterX),
    Y(25.6, 'front'),
    'z líce přední stěny (krok 12)',
    1.7,
    'middle',
  );

  /* FOLD */
  const yf0 = Y(0, 'front');
  const yf1 = Y(0, 'back');
  s.line('FOLD', X(0), yf0, X(W), yf0, 0.25, '3 1.5');
  s.line('FOLD', X(0), yf1, X(W), yf1, 0.25, '3 1.5');
  s.line('FOLD', X(0), (yf0 + yf1) / 2, X(W), (yf0 + yf1) / 2, 0.15, '6 1.5 1 1.5');
  s.text(
    'FOLD',
    X(L.cardCenterX),
    (yf0 + yf1) / 2 - 0.8,
    `OHYB DNA F = ${cz(F)} · lícem ven, nelámat`,
    2,
    'middle',
  );
  s.text(
    'FOLD',
    X(L.cardCenterX),
    (yf0 + yf1) / 2 + 2.6,
    `R_i ${cz(L.foldInnerRadiusMm)} · tvaruje se na trnu až po šití`,
    1.8,
    'middle',
  );

  /* GLUE – jen obrys pruhů; nanáší se na rubu (list 2). Ořezáno obrysem dílu, aby krajní pruhy
   * nepřekreslovaly zaoblené rohy R4 (N4). */
  s.add('GLUE', '<g clip-path="url(#clip-outline-1)">');
  for (const wall of ['front', 'back'] as const) {
    for (const g of L.glue) {
      const x0 = X(g.x0);
      const y0 = Math.min(Y(g.u1, wall), Y(g.u0, wall));
      s.add(
        'GLUE',
        `<rect class="glue-outline" x="${f(x0)}" y="${f(y0)}" width="${f(g.x1 - g.x0)}" height="${f(g.u1 - g.u0)}" fill="none" stroke="${COLORS.GLUE}" stroke-width="0.15" stroke-dasharray="0.6 0.6"/>`,
      );
    }
  }
  s.add('GLUE', '</g>');
  s.text('GLUE', X(L.cardCenterX), Y(50, 'back'), 'lepené pruhy = na RUBU, list 2', 1.8, 'middle');

  /* GUIDE */
  for (const wall of ['front', 'back'] as const) {
    // výsečníky: konce průzoru a schod (plné kružnice nástroje)
    s.circle(
      'GUIDE',
      X(L.podCenterX),
      Y(L.windowCenterTopU, wall),
      spec.windowWidthMm / 2,
      0.15,
      '1 0.8',
    );
    s.circle(
      'GUIDE',
      X(L.podCenterX),
      Y(L.windowCenterBottomU, wall),
      spec.windowWidthMm / 2,
      0.15,
      '1 0.8',
    );
    s.cross('GUIDE', X(L.podCenterX), Y(L.windowCenterTopU, wall), 1);
    s.cross('GUIDE', X(L.podCenterX), Y(L.windowCenterBottomU, wall), 1);
    s.circle('GUIDE', X(L.stepCenterX), Y(L.stepCenterU, wall), spec.stepRadiusMm, 0.15, '1 0.8');
    // podložka prahu – nepropichovat
    s.circle(
      'GUIDE',
      X(L.podCenterX),
      Y(L.washerU, wall),
      spec.washerDiameterMm / 2,
      0.15,
      '0.5 0.5',
    );
    // osy zón (krátce u horní hrany a u ohybu)
    s.line(
      'GUIDE',
      X(L.cardCenterX),
      Y(L.thumbNotch.bottomU - 4, wall),
      X(L.cardCenterX),
      Y(L.thumbNotch.bottomU - 9, wall),
      0.15,
      '1.5 1',
    );
    s.line(
      'GUIDE',
      X(L.podCenterX),
      Y(L.windowCenterBottomU - 10, wall),
      X(L.podCenterX),
      Y(L.windowCenterBottomU - 16, wall),
      0.15,
      '1.5 1',
    );
    // zarovnávací značky vně obrysu: konce ohybu na bocích, středy zón nad hranami
    const tick = 3;
    const yEnd = Y(0, wall);
    s.line('GUIDE', X(0) - tick - 0.5, yEnd, X(0) - 0.5, yEnd, 0.3);
    s.line('GUIDE', X(W) + 0.5, yEnd, X(W) + tick + 0.5, yEnd, 0.3);
    const up = wall === 'front' ? -1 : 1;
    s.line(
      'GUIDE',
      X(L.cardCenterX),
      Y(L.cardHeightMm, wall) + up * 0.8,
      X(L.cardCenterX),
      Y(L.cardHeightMm, wall) + up * (0.8 + tick),
      0.3,
    );
    s.line(
      'GUIDE',
      X(L.podCenterX),
      Y(Hl, wall) + up * 0.8,
      X(L.podCenterX),
      Y(Hl, wall) + up * (0.8 + tick),
      0.3,
    );
  }
  for (const wall of ['front', 'back'] as const) {
    const wx = X(L.podCenterX + spec.washerDiameterMm / 2 + 1);
    s.text('GUIDE', wx, Y(L.washerU, wall) - 0.4, 'D2', 1.6);
    s.text('GUIDE', wx, Y(L.washerU, wall) + 1.8, 'nepropichovat', 1.6);
    const mid = Y((L.windowCenterBottomU + L.windowCenterTopU) / 2, wall);
    s.text('GUIDE', X(L.podCenterX), mid, 'PRŮZOR', 1.7, 'middle', { rotate: -90 });
  }
  const m2 = spec.markSizeMm / 2;
  s.path(
    'GUIDE',
    `M${f(X(spec.markXMm - m2))} ${f(Y(spec.markUMm + m2, 'front'))} h${f(2 * m2)} v${f(2 * m2)} h${f(-2 * m2)} Z`,
    0.15,
    '0.8 0.6',
  );
  s.text('GUIDE', X(spec.markXMm), Y(spec.markUMm, 'front') + 0.8, 'ZNAČKA', 1.6, 'middle');
  s.text('GUIDE', X(L.cardCenterX), Y(45, 'front'), 'PŘEDNÍ STĚNA · karty', 2.6, 'middle', {
    bold: true,
  });
  s.text('GUIDE', X(L.podCenterX), Y(14, 'front'), 'LUSK', 2.6, 'middle', { bold: true });
  s.text('GUIDE', X(L.cardCenterX), Y(40, 'back'), 'ZADNÍ STĚNA', 2.6, 'middle', { bold: true });
  s.text('GUIDE', X(L.podCenterX), Y(14, 'back'), 'LUSK', 2.6, 'middle', { bold: true });
  s.text(
    'GUIDE',
    X(L.cardCenterX),
    Y(L.thumbNotch.bottomU - 13, 'front'),
    'výkus na palec',
    1.8,
    'middle',
  );
  s.text(
    'GUIDE',
    X(L.cardCenterX),
    Y(L.billNotch.bottomU - 4, 'back'),
    'výkus na bankovky',
    1.8,
    'middle',
  );
  // trn T1 v lusku (přední stěna): od u = −R_i do u = H_l, zužuje se ke dnu
  const b = L.mandrelWidthMm;
  const be = L.mandrelEndWidthMm;
  const uEnd = -L.foldInnerRadiusMm;
  s.path(
    'GUIDE',
    `M${f(X(L.podCenterX - b / 2))} ${f(Y(Hl, 'front'))} L${f(X(L.podCenterX - be / 2))} ${f(Y(uEnd, 'front'))} ` +
      `L${f(X(L.podCenterX + be / 2))} ${f(Y(uEnd, 'front'))} L${f(X(L.podCenterX + b / 2))} ${f(Y(Hl, 'front'))}`,
    0.12,
    '0.4 1',
  );
  // kóty celkových rozměrů (pod dílem, nad ním jsou kružnice výsečníku schodu)
  const dimY = Y(Hl, 'back') + 10;
  s.line('GUIDE', X(0), dimY, X(W), dimY, 0.15);
  s.line('GUIDE', X(0), dimY - 1.2, X(0), dimY + 1.2, 0.15);
  s.line('GUIDE', X(W), dimY - 1.2, X(W), dimY + 1.2, 0.15);
  s.text('GUIDE', X(W / 2), dimY + 3.2, `W = ${cz(W)} mm`, 2.2, 'middle', { fill: COLORS.CUT });
  const dimX = X(W) + 6;
  s.line('GUIDE', dimX, Y(Hl, 'front'), dimX, Y(Hl, 'back'), 0.15);
  s.line('GUIDE', dimX - 1.2, Y(Hl, 'front'), dimX + 1.2, Y(Hl, 'front'), 0.15);
  s.line('GUIDE', dimX - 1.2, Y(Hl, 'back'), dimX + 1.2, Y(Hl, 'back'), 0.15);
  s.text(
    'GUIDE',
    dimX + 3,
    (Y(Hl, 'front') + Y(Hl, 'back')) / 2,
    `L = ${cz(L.lengthMm)} mm`,
    2.2,
    'middle',
    {
      rotate: -90,
      fill: COLORS.CUT,
    },
  );

  const x = X(W) + 12;
  column(s, x, PIECE_Y + 2, [
    '# D1 TĚLO – 1 ks',
    `useň ${cz(L.t)} mm, třísločiněná, pevná`,
    `přířez ${cz(W)} × ${cz(L.lengthMm)} mm`,
    'pohled na LÍC, ohyb dna lícem ven',
    'nahoře přední stěna, dole zadní',
    'obě stěny mají stejné x',
    '',
    '# Šířky x od levé hrany líce',
    `levý šev ${cz(L.seamLeftX)}`,
    `karty ${cz(L.cardZoneX0)}–${cz(L.cardZoneX1)} (S_c ${cz(L.cardZoneMm)})`,
    `dělicí šev ${cz(L.seamDividerX)}`,
    `lusk ${cz(L.podX0)}–${cz(L.podX1)} (S_l ${cz(L.podZoneMm)})`,
    `střed lusku ${cz(L.podCenterX)}`,
    `pravý šev ${cz(L.seamRightX)}`,
    '',
    '# Výšky u od konce ohybu',
    `lusk ${cz(Hl)} · karty ${cz(L.cardHeightMm)}`,
    `ohyb F ${cz(F)} (osa uprostřed)`,
    '',
    '# Výřezy',
    `průzor obě stěny: Ø ${cz(spec.windowWidthMm)},`,
    `  x ${cz(L.windowX0)}–${cz(L.windowX1)}, u ${cz(L.windowBottomU)}–${cz(L.windowTopU)}`,
    `palec (přední): ${cz(spec.thumbNotchWidthMm)} × ${cz(spec.thumbNotchDepthMm)}, dno R${cz(L.thumbNotch.r)}`,
    `bankovky (zadní): ${cz(spec.billNotchWidthMm)} × ${cz(spec.billNotchDepthMm)}, dno R${cz(L.billNotch.r)}`,
    `schod R${cz(spec.stepRadiusMm)} (Ø ${cz(2 * spec.stepRadiusMm)}), střed (${cz(L.stepCenterX)}; ${cz(L.stepCenterU)})`,
    `rohy R${cz(spec.outerCornerRadiusMm)}, rohy výkusů R${cz(spec.notchCornerRadiusMm)}`,
    '',
    '# Šití',
    `${L.seams.map((q) => q.holes).join(' + ')} = ${L.holesTotal} otvorů,`,
    `${L.stitchesTotal} stehů, rozteč ${cz(spec.stitchPitchMm)} mm,`,
    `${cz(spec.seamOffsetMm)} mm od hrany, skrz ${L.maxLayersInSeam} × ${cz(L.t)} mm`,
    '',
    '# Tloušťka hotového kusu',
    `lusk ${cz(L.thicknessPodMm)} · B ${cz(L.thicknessB.card)} · C ${cz(L.thicknessC.card)}`,
    '',
    '# Hotový rozměr',
    `u dna ${cz(W)} (šířka W)`,
    `nahoře ≈ ${cz1(L.topWidthC)}–${cz1(L.topWidthA)}`,
    `výška ${cz(L.finishedHeightMm)} (lusk)`,
    '',
    '# Značky',
    'čárky vně obrysu: konce ohybu,',
    'středy zón – přenést tužkou,',
    'nezařezávat do hrany',
    'kroužek D2: podložka prahu,',
    'NEpropichovat (krok 16)',
  ]);

  footer(
    s,
    'D1 z LÍCE. Lepené pruhy se značí na RUBU podle listu 2 (x zrcadlené). Díl D2, trn a zkušební lusk: list 3.',
  );
  return s.render('LUSK – D1 tělo, líc');
}

/** Lepené pruhy v pohledu na rub (x_rub = W − x) a hrany maskovací pásky. */
function mirroredGlue(
  glue: GlueStrip[],
  widthMm: number,
): { strip: GlueStrip; x0: number; x1: number }[] {
  return glue.map((g) => ({
    strip: g,
    x0: Math.round((widthMm - g.x1) * 1000) / 1000,
    x1: Math.round((widthMm - g.x0) * 1000) / 1000,
  }));
}

export function backSideGlue(
  L: MinimalWalletLayout,
): { strip: GlueStrip; x0: number; x1: number }[] {
  return mirroredGlue(L.glue, L.widthMm);
}

/** List 2: díl D1 z rubu s lepenými pruhy. */
export function buildWalletBackSvg(spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET): string {
  assertMinimalWallet(spec);
  const L = minimalWalletLayout(spec);
  const s = new Sheet();
  const W = L.widthMm;
  const Hl = L.podHeightMm;
  const fr = frame(PIECE_X, PIECE_Y, W, Hl, L.foldMm, true);
  const { X, Y } = fr;
  header(
    s,
    'LUSK · D1 TĚLO · RUB (lepení)',
    `pohled na rub: x_rub = W − x = ${cz(W)} − x · list 2/3`,
  );

  const outlineD2 = bodyOutline(L, spec, fr);
  s.path('CUT', outlineD2, 0.3, undefined, ' class="outline"');
  s.clipPath('clip-outline-2', outlineD2);
  for (const wall of ['front', 'back'] as const) {
    s.path(
      'CUT',
      slotPath(
        fr,
        L.podCenterX,
        L.windowCenterBottomU,
        L.windowCenterTopU,
        spec.windowWidthMm,
        wall,
      ),
      0.3,
    );
  }
  const yf0 = Y(0, 'front');
  const yf1 = Y(0, 'back');
  s.line('FOLD', X(0), yf0, X(W), yf0, 0.25, '3 1.5');
  s.line('FOLD', X(0), yf1, X(W), yf1, 0.25, '3 1.5');
  s.line('FOLD', X(0), (yf0 + yf1) / 2, X(W), (yf0 + yf1) / 2, 0.15, '6 1.5 1 1.5');
  s.text('FOLD', PIECE_X + W / 2, (yf0 + yf1) / 2 - 1.2, 'ohyb dna – NElepit', 2, 'middle');

  // Ořezáno obrysem dílu, aby krajní pruhy a hrany pásky nepřekreslovaly zaoblené rohy R4 (N4).
  s.add('GLUE', '<g clip-path="url(#clip-outline-2)">');
  for (const wall of ['front', 'back'] as const) {
    for (const { strip, x0, x1 } of backSideGlue(L)) {
      const y0 = Math.min(Y(strip.u1, wall), Y(strip.u0, wall));
      s.hatch('GLUE', PIECE_X + x0, y0, x1 - x0, strip.u1 - strip.u0, `glue glue-${strip.id}`);
      // hrany maskovací pásky na vnitřních okrajích pruhů
      for (const xe of [x0, x1]) {
        if (xe > 0.01 && xe < W - 0.01) {
          s.line(
            'GLUE',
            PIECE_X + xe,
            y0 - 2,
            PIECE_X + xe,
            y0 + strip.u1 - strip.u0 + 2,
            0.12,
            '2 0.8',
          );
        }
      }
    }
  }
  s.add('GLUE', '</g>');
  const bs = backSideGlue(L);
  const dv = bs.find((q) => q.strip.id === 'D')!;
  s.text(
    'GLUE',
    PIECE_X + (dv.x0 + dv.x1) / 2,
    Y(Hl, 'front') - 1.5,
    `${cz(dv.x0)}–${cz(dv.x1)}`,
    1.9,
    'middle',
  );
  s.text(
    'GLUE',
    PIECE_X + (dv.x0 + dv.x1) / 2,
    Y(Hl, 'back') + 3.5,
    `${cz(dv.x0)}–${cz(dv.x1)}`,
    1.9,
    'middle',
  );
  s.text(
    'GLUE',
    PIECE_X + dv.x1 + 2,
    Y(30, 'front'),
    'dělicí pruh: odměřit od hrany LUSKU (L)',
    1.8,
    'start',
    { rotate: -90 },
  );
  // Značka hrany na straně lusku (na rubu vlevo).
  for (const wall of ['front', 'back'] as const) {
    s.text('GUIDE', PIECE_X + 7.5, Y(24, wall) + 1.4, 'L', 4, 'middle', {
      bold: true,
      fill: COLORS.CUT,
    });
    s.text('GUIDE', PIECE_X + 10, Y(24, wall) + 0.6, '← hrana LUSKU', 1.9, 'start', {
      fill: COLORS.CUT,
    });
  }
  s.text('GUIDE', X(L.cardCenterX), Y(40, 'front'), 'RUB · přední stěna', 2.6, 'middle', {
    bold: true,
  });
  s.text('GUIDE', X(L.cardCenterX), Y(40, 'back'), 'RUB · zadní stěna', 2.6, 'middle', {
    bold: true,
  });
  s.text('GUIDE', X(L.podCenterX), Y(12, 'front'), 'LUSK', 2.6, 'middle', { bold: true });
  s.text('GUIDE', X(L.podCenterX), Y(12, 'back'), 'LUSK', 2.6, 'middle', { bold: true });
  for (const wall of ['front', 'back'] as const) {
    s.circle(
      'GUIDE',
      X(L.podCenterX),
      Y(L.washerU, wall),
      spec.washerDiameterMm / 2,
      0.15,
      '0.5 0.5',
    );
  }
  for (const wall of ['front', 'back'] as const) {
    const wx = X(L.podCenterX) + spec.washerDiameterMm / 2 + 1;
    s.text('GUIDE', wx, Y(L.washerU, wall) - 0.4, 'D2 lepit až', 1.6);
    s.text('GUIDE', wx, Y(L.washerU, wall) + 1.8, 'po tvarování', 1.6);
  }
  // S1: pásmo zapečetění rubu v ústí lusku (krok 9), x 69,5–107,5, u 80–94 na obou stěnách.
  // Přesné rozměry jsou i v pravém sloupci textu (nepřekrývají se s D2), tady jen krátký popisek.
  for (const wall of ['front', 'back'] as const) {
    const zx0 = X(L.podX0);
    const zx1 = X(L.podX1);
    const zy0 = Math.min(Y(L.windowTopU, wall), Y(L.podHeightMm, wall));
    const zy1 = Math.max(Y(L.windowTopU, wall), Y(L.podHeightMm, wall));
    s.add(
      'GUIDE',
      `<rect x="${f(Math.min(zx0, zx1))}" y="${f(zy0)}" width="${f(Math.abs(zx1 - zx0))}" height="${f(zy1 - zy0)}" fill="none" stroke="${COLORS.GUIDE}" stroke-width="0.15" stroke-dasharray="1.5 1"/>`,
    );
    // Popisek posunutý od středu lusku (mimo kroužek D2 i obě hrany lepených pruhů).
    s.text(
      'GUIDE',
      X(L.podX1 - 6),
      (zy0 + zy1) / 2,
      `ZAPEČETIT RUB (krok 9), x ${cz(L.podX0)}–${cz(L.podX1)}, u ${cz(L.windowTopU)}–${cz(L.podHeightMm)}`,
      1.5,
      'middle',
      { rotate: -90 },
    );
  }
  // N5: zarovnávací značky vně obrysu (konce ohybu na bocích, středy zón nad hranami) – stejné
  // jako na listu 1, chybí tu, protože je rub taky potřeba přenést značky tužkou (krok 7).
  // Pohled je zrcadlený (mirror = true), takže X(0) padne na PRAVÝ okraj listu a X(W) na LEVÝ –
  // značky proto míří ven opačně než na listu 1.
  for (const wall of ['front', 'back'] as const) {
    const tick = 3;
    const yEnd = Y(0, wall);
    s.line('GUIDE', X(0) + tick + 0.5, yEnd, X(0) + 0.5, yEnd, 0.3);
    s.line('GUIDE', X(W) - 0.5, yEnd, X(W) - tick - 0.5, yEnd, 0.3);
    const up = wall === 'front' ? -1 : 1;
    s.line(
      'GUIDE',
      X(L.cardCenterX),
      Y(L.cardHeightMm, wall) + up * 0.8,
      X(L.cardCenterX),
      Y(L.cardHeightMm, wall) + up * (0.8 + tick),
      0.3,
    );
    s.line(
      'GUIDE',
      X(L.podCenterX),
      Y(Hl, wall) + up * 0.8,
      X(L.podCenterX),
      Y(Hl, wall) + up * (0.8 + tick),
      0.3,
    );
  }
  // kóta šířky
  const dimY = Y(Hl, 'back') + 10;
  s.line('GUIDE', PIECE_X, dimY, PIECE_X + W, dimY, 0.15);
  s.text('GUIDE', PIECE_X + W / 2, dimY + 3.2, `W = ${cz(W)} mm (rub)`, 2.2, 'middle', {
    fill: COLORS.CUT,
  });

  const x = PIECE_X + W + 8;
  const lines = [
    '# Lepení – rub na rub',
    'kontaktní lepidlo, oba povrchy,',
    'jen šrafované pruhy na obou stěnách',
    '',
    '# Pruhy x_rub od levé hrany rubu',
    ...bs.map(
      ({ strip, x0, x1 }) =>
        `${strip.id === 'L' ? 'levý (líc)' : strip.id === 'D' ? 'dělicí' : 'pravý (líc)'}: ${cz(x0)}–${cz(x1)}, u ${cz(strip.u0)}–${cz(strip.u1)}`,
    ),
    `(líc: ${L.glue.map((g) => `${cz(g.x0)}–${cz(g.x1)}`).join(' · ')})`,
    '',
    '# Postup',
    '1. hned po vyříznutí napsat tužkou',
    '   na rub „L“ k hraně lusku',
    '2. hrany pruhů olepit papírovou',
    '   maskovací páskou (čárkovaně)',
    '3. nanést lepidlo, pásku strhnout,',
    '   nechat zavadnout',
    `4. kulatá tyčka Ø ${cz(L.foldSpacerDiameterMm)} mm do`,
    '   ohybu (NE trn T1!), mezi pruhy',
    '   separační papír, zarovnat,',
    '   papír vytahovat od ohybu nahoru',
    '',
    '# Nelepí se',
    `ohyb a spodních ${cz(spec.glueStartMm)} mm pruhů,`,
    'plochy zón, podložky D2 (až krok 16)',
    '',
    '# Pozor na zrcadlení',
    `dělicí pruh je na rubu ${cz(dv.x0)}–${cz(dv.x1)}`,
    'od hrany LUSKU, ne od hrany karet',
  ];
  column(s, x, PIECE_Y + 2, lines);
  footer(
    s,
    'D1 z RUBU. Obrys je zrcadlený; řeže se podle listu 1 (líc). Na rubu se jen značí lepení.',
  );
  return s.render('LUSK – D1 tělo, rub');
}

/** List 3: zkušební lusk ZL, trn T1 (forma) a podložky D2. */
export function buildWalletJigsSvg(spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET): string {
  assertMinimalWallet(spec);
  const L = minimalWalletLayout(spec);
  const T = L.test;
  const s = new Sheet();
  header(
    s,
    'LUSK · ZKUŠEBNÍ LUSK, TRN, PODLOŽKY',
    `ZL ${cz(T.widthMm)} × ${cz(T.lengthMm)} · T1 ${cz(L.mandrelWidthMm)}/${cz(L.mandrelEndWidthMm)} × ${cz(L.cavityMm)} × ${cz(L.mandrelLengthMm)} · D2 Ø ${cz(spec.washerDiameterMm)} · list 3/3`,
  );

  /* Zkušební lusk (líc). */
  const Ht = T.wallHeightMm;
  const fr = frame(PIECE_X, PIECE_Y, T.widthMm, Ht, L.foldMm, false);
  const { X, Y } = fr;
  const Ro = spec.outerCornerRadiusMm;
  const Wt = T.widthMm;
  const P = (x: number, u: number, w: 'front' | 'back'): string => `${f(X(x))} ${f(Y(u, w))}`;
  const outlineD3 =
    `M${P(0, Ht - Ro, 'front')} A${Ro} ${Ro} 0 0 1 ${P(Ro, Ht, 'front')} L${P(Wt - Ro, Ht, 'front')} ` +
    `A${Ro} ${Ro} 0 0 1 ${P(Wt, Ht - Ro, 'front')} L${P(Wt, Ht - Ro, 'back')} ` +
    `A${Ro} ${Ro} 0 0 1 ${P(Wt - Ro, Ht, 'back')} L${P(Ro, Ht, 'back')} A${Ro} ${Ro} 0 0 1 ${P(0, Ht - Ro, 'back')} Z`;
  s.path('CUT', outlineD3, 0.3, undefined, ' class="test-outline"');
  s.clipPath('clip-outline-3', outlineD3);
  // Ořezáno obrysem zkušebního lusku, aby krajní pruhy nepřekreslovaly zaoblené rohy R4 (N4).
  s.add('GLUE', '<g clip-path="url(#clip-outline-3)">');
  for (const wall of ['front', 'back'] as const) {
    s.path(
      'CUT',
      slotPath(
        fr,
        T.podCenterX,
        T.windowCenterBottomU,
        T.windowCenterTopU,
        spec.windowWidthMm,
        wall,
      ),
      0.3,
    );
    s.circle(
      'GUIDE',
      X(T.podCenterX),
      Y(T.washerU, wall),
      spec.washerDiameterMm / 2,
      0.15,
      '0.5 0.5',
    );
    for (const g of T.glue) {
      s.add(
        'GLUE',
        `<rect class="glue-outline" x="${f(X(g.x0))}" y="${f(Math.min(Y(g.u1, wall), Y(g.u0, wall)))}" width="${f(g.x1 - g.x0)}" height="${f(g.u1 - g.u0)}" fill="none" stroke="${COLORS.GLUE}" stroke-width="0.15" stroke-dasharray="0.6 0.6"/>`,
      );
    }
  }
  s.add('GLUE', '</g>');
  drawSeams(s, fr, T.seams, spec.stitchPitchMm);
  const yf0 = Y(0, 'front');
  const yf1 = Y(0, 'back');
  s.line('FOLD', X(0), yf0, X(Wt), yf0, 0.25, '3 1.5');
  s.line('FOLD', X(0), yf1, X(Wt), yf1, 0.25, '3 1.5');
  s.line('FOLD', X(0), (yf0 + yf1) / 2, X(Wt), (yf0 + yf1) / 2, 0.15, '6 1.5 1 1.5');
  s.text('FOLD', X(Wt / 2), (yf0 + yf1) / 2 + 0.7, `ohyb F ${cz(L.foldMm)}`, 1.9, 'middle');
  s.text('GUIDE', X(T.seams[0].x + 9), Y(40, 'front'), 'kus karet', 1.8, 'middle');
  s.text('GUIDE', X(T.podCenterX), Y(20, 'front'), 'LUSK', 2.4, 'middle', { bold: true });
  s.text('GUIDE', X(T.podCenterX), Y(20, 'back'), 'LUSK', 2.4, 'middle', { bold: true });
  s.text(
    'GUIDE',
    X(Wt / 2),
    PIECE_Y - 2,
    `ZL ZKUŠEBNÍ LUSK · useň ${cz(L.t)} mm · ${cz(Wt)} × ${cz(T.lengthMm)}`,
    2.2,
    'middle',
    {
      bold: true,
      fill: COLORS.CUT,
    },
  );
  s.text(
    'GLUE',
    X(Wt / 2),
    Y(Ht, 'back') + 4,
    `lepení na rubu zrcadlově: x_rub = ${cz(Wt)} − x`,
    1.8,
    'middle',
  );
  s.text(
    'STITCH',
    X(Wt / 2),
    Y(Ht, 'back') + 7,
    `švy ${T.seams.map((q) => q.holes).join(' + ')} otvorů, děrovat až po slepení`,
    1.8,
    'middle',
  );

  /* Trn T1 – půdorys (zužuje se ke dnu) a bok (konec R = c/2). */
  const tx = PIECE_X + Wt + 14;
  const ty = PIECE_Y + 4;
  const b = L.mandrelWidthMm;
  const be = L.mandrelEndWidthMm;
  const len = L.mandrelLengthMm;
  const mouth = spec.mandrelHandleMm; // ústí lusku od horního konce trnu
  const cxT = tx + b / 2;
  s.path(
    'CUT',
    `M${f(tx)} ${f(ty)} L${f(tx + b)} ${f(ty)} L${f(tx + b)} ${f(ty + mouth)} ` +
      `L${f(cxT + be / 2)} ${f(ty + len)} L${f(cxT - be / 2)} ${f(ty + len)} L${f(tx)} ${f(ty + mouth)} Z`,
    0.3,
    undefined,
    ' class="mandrel"',
  );
  s.line('GUIDE', tx - 2, ty + mouth, tx + b + 2, ty + mouth, 0.2, '1.5 1');
  s.text('GUIDE', cxT, ty + mouth - 1.2, 'ústí lusku', 1.8, 'middle');
  s.text('GUIDE', cxT, ty + 8, 'T1 TRN', 2.4, 'middle', { bold: true, fill: COLORS.CUT });
  s.text('GUIDE', cxT, ty + 11.5, `překližka ${cz(L.cavityMm)}`, 1.8, 'middle');
  s.text('GUIDE', cxT, ty + 15, 'poutko pod fólii', 1.8, 'middle');
  s.text('GUIDE', cxT, ty + mouth + 8, `${cz(b)} u ústí`, 1.9, 'middle');
  s.text('GUIDE', cxT, ty + len - 4, `${cz(be)} u konce`, 1.9, 'middle');
  s.text(
    'GUIDE',
    cxT,
    ty + len + 4,
    `délka ${cz(len)} (hloubka ${cz(L.mandrelDepthMm)})`,
    1.9,
    'middle',
    {
      fill: COLORS.CUT,
    },
  );
  s.cross('GUIDE', cxT, ty + mouth + (len - mouth) / 2, 1.2);
  // bok trnu
  const px = tx + b + 8;
  const c = L.cavityMm;
  s.path(
    'CUT',
    `M${f(px)} ${f(ty)} L${f(px + c)} ${f(ty)} L${f(px + c)} ${f(ty + len - c / 2)} ` +
      `A${f(c / 2)} ${f(c / 2)} 0 0 1 ${f(px)} ${f(ty + len - c / 2)} Z`,
    0.3,
    undefined,
    ' class="mandrel-side"',
  );
  s.text('GUIDE', px + c / 2, ty - 1.5, 'bok', 1.8, 'middle');
  s.text('GUIDE', px + c + 1.5, ty + len - 2, `konec R${cz(c / 2)}`, 1.8);
  s.text('GUIDE', px + c + 1.5, ty + len - 30, `hrany R${cz(spec.mandrelEdgeRadiusMm)}`, 1.8);

  /* D2 podložky. */
  const dx = px + c + 16;
  const dy = ty + 6;
  s.text('GUIDE', dx, dy - 4, `D2 PODLOŽKA PRAHU Ø ${cz(spec.washerDiameterMm)}`, 2.2, 'start', {
    bold: true,
    fill: COLORS.CUT,
  });
  for (let i = 0; i < 6; i++) {
    const cx = dx + 5 + (i % 3) * 11;
    const cy = dy + 5 + Math.floor(i / 3) * 11;
    s.circle('CUT', cx, cy, spec.washerDiameterMm / 2, 0.3);
    s.cross('GUIDE', cx, cy, 0.8);
  }
  column(s, dx, dy + 27, [
    'useň 1,0 nebo 1,2 mm, výsečník Ø 8,',
    '4 ks + 2 náhradní; líc do dutiny,',
    'lepí se až po tvarování (krok 16).',
    `mezera prahu h = t_min − 0,5…0,8`,
    `p₁ + p₂ = c − h = ${cz(L.cavityMm)} − h`,
    '',
    '# Trn T1 = forma lusku',
    `překližka tl. c = ${cz(L.cavityMm)} (změřit),`,
    `šířka ${cz(b)} u ústí → ${cz(be)} u konce,`,
    `délka ${cz(len)} = ${cz(L.mandrelDepthMm)} + ${cz(spec.mandrelHandleMm)} na držení,`,
    `podélné hrany R${cz(spec.mandrelEdgeRadiusMm)}, konec R${cz(c / 2)} přes tloušťku,`,
    'obalit fólií, poutko na horní konec.',
    `nejširší trn, který lusk pojme: ${cz(L.mandrelMaxWidthMm)}`,
    '',
    '# Zkušební lusk ZL',
    `${cz(Wt)} × ${cz(T.lengthMm)}, 3 švy (dělicí uvnitř),`,
    `stěna ${cz(Ht)} = 2 × ${cz(spec.coinDiameterMaxMm)} + ${cz(spec.coinBelowWasherMm)} + ${cz(spec.washerFromTopMm)} + ${cz(spec.washerDiameterMm / 2)},`,
    `průzor u ${cz(T.windowCenterBottomU - spec.windowWidthMm / 2)}–${cz(T.windowCenterTopU + spec.windowWidthMm / 2)} na obou stěnách,`,
    'postup jako kroky 7–16 celého kusu.',
    '',
    '# ZL – lepení na rubu (x_rub od hrany L)',
    ...mirroredGlue(T.glue, Wt).map(
      ({ strip, x0, x1 }) =>
        `${strip.id === 'L' ? 'levý (líc)' : strip.id === 'D' ? 'dělicí' : 'pravý (líc)'}: ${cz(x0)}–${cz(x1)}, u ${cz(strip.u0)}–${cz(strip.u1)}`,
    ),
    '',
    '# Mince (výpočet, ověřit)',
    `po posunu palcem vyčnívá D − a_p:`,
    `  Ø ${cz(spec.coinDiameterMaxMm)} → ${cz(L.coinProtrusionMaxMm)} mm, Ø ${cz(spec.coinDiameterMinMm)} → ${cz(L.coinProtrusionMinMm)} mm`,
    `vrácení: stáhnout pod práh o ${cz(L.coinPullDownMm)} mm`,
    '',
    '# Maketa karetní zóny',
    `4 karty + papír ${cz(spec.billsThicknessMm)} ve fólii = ${cz(L.contentBMm)} mm`,
    '(tenčí: 3 karty + papír, 13.4 #14)',
  ]);
  footer(
    s,
    'ZL, T1 a D2. Trn je forma lusku: jeho tloušťka určuje dutinu c, podle ní se počítají podložky.',
  );
  return s.render('LUSK – zkušební lusk, trn, podložky');
}

/** Název souboru: výchozí „penezenka“, jiná tloušťka kůže „penezenka-kuze-1-3mm“. */
export function walletFileStem(spec: MinimalWalletSpec): string {
  const parts = ['penezenka'];
  if (spec.leatherMm !== DEFAULT_MINIMAL_WALLET.leatherMm) {
    parts.push(`kuze-${f(spec.leatherMm).replace('.', '-')}mm`);
  }
  return parts.join('-');
}

/** Všechny listy s názvy souborů (bez přípony). */
export function buildWalletSheets(
  spec: MinimalWalletSpec = DEFAULT_MINIMAL_WALLET,
): { name: string; svg: string }[] {
  const stem = walletFileStem(spec);
  return [
    { name: `${stem}-sablona`, svg: buildWalletSheetSvg(spec) },
    { name: `${stem}-rub`, svg: buildWalletBackSvg(spec) },
    { name: `${stem}-pripravky`, svg: buildWalletJigsSvg(spec) },
  ];
}

function parseArgs(argv: string[]): MinimalWalletSpec {
  const known = ['--thickness'];
  let thickness: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [name, inline] = a.split('=') as [string, string | undefined];
    if (!known.includes(name)) {
      throw new Error(`Neznámý přepínač: ${a}. Povolené: ${known.join(', ')}.`);
    }
    if (thickness !== undefined) throw new Error(`Přepínač ${name} je zadaný víckrát.`);
    const raw = inline ?? argv[++i] ?? '';
    if (!/^\d+([.,]\d+)?$/.test(raw)) throw new Error(`${name} potřebuje číslo v mm.`);
    const v = Number(raw.replace(',', '.'));
    if (v < 0.8 || v > 2) throw new Error(`${name} musí být mezi 0,8 a 2 mm.`);
    thickness = v;
  }
  return { ...DEFAULT_MINIMAL_WALLET, leatherMm: thickness ?? DEFAULT_MINIMAL_WALLET.leatherMm };
}

async function main(): Promise<void> {
  const spec = parseArgs(process.argv.slice(2));
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const sheets = buildWalletSheets(spec);
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const pageCss =
    '<style>@page{size:A4 portrait;margin:0}html,body{margin:0;padding:0}' +
    '.s{width:210mm;height:297mm;overflow:hidden;page-break-after:always;break-after:page}</style>';
  const pdf = async (html: string, path: string): Promise<void> => {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path,
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
  };
  for (const { name, svg } of sheets) {
    writeFileSync(resolve(outDir, `${name}.svg`), svg, 'utf8');
    await pdf(`${pageCss}<div class="s">${svg}</div>`, resolve(outDir, `${name}.pdf`));
    console.log(`Zapsáno docs/generated/${name}.svg + .pdf (A4 na výšku, 100 %)`);
  }
  const allName = `${walletFileStem(spec)}-vse.pdf`;
  await pdf(
    pageCss + sheets.map(({ svg }) => `<div class="s">${svg}</div>`).join(''),
    resolve(outDir, allName),
  );
  console.log(`Zapsáno docs/generated/${allName} (všechny listy)`);
  await browser.close();
  const L = minimalWalletLayout(spec);
  console.log(
    `D1 ${cz(L.widthMm)} × ${cz(L.lengthMm)} mm (S_c ${cz(L.cardZoneMm)}, S_l ${cz(L.podZoneMm)}, F ${cz(L.foldMm)}), ` +
      `${L.holesTotal} otvorů; ZL ${cz(L.test.widthMm)} × ${cz(L.test.lengthMm)}; trn ${cz(L.mandrelWidthMm)}/${cz(L.mandrelEndWidthMm)} × ${cz(L.cavityMm)} × ${cz(L.mandrelLengthMm)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
