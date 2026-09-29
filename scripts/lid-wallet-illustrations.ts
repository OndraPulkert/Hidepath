/**
 * Instruktážní ilustrace pro lekce projektu 03 (peněženka Víčko, docs/zadani/penezenka-vicko.md).
 * Nejsou to střihy 1:1 jako `lid-wallet.ts` – jsou to schematické nákresy, ale všechny polohy
 * (výšky y, šířky x, délky podél pásu v) berou z modelu `lidWalletLayout(spec)` v
 * `src/lib/geometry/lid-wallet.ts`. Tloušťky vrstev jsou v řezech zvětšené, aby byly vidět.
 *
 *   pnpm pattern:wallet-lid-illustrations
 *
 * Výstup: docs/generated/penezenka-vicko-ilustrace-<name>.svg (160 × 100 mm, čitelné i na mobilu).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  DEFAULT_LID_WALLET,
  type LidWalletLayout,
  type LidWalletSpec,
  type StateResult,
  assertLidWallet,
  lidWalletLayout,
} from '../src/lib/geometry/lid-wallet.ts';

/* --- drobní pomocníci (styl jako u ilustrací projektu 02) --- */
const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
/** Číslo do popisku: zaokrouhlené na setiny, desetinná čárka. */
const cz = (n: number, digits = 2): string =>
  (Math.round(n * 10 ** digits) / 10 ** digits).toString().replace('.', ',');

const INK = '#2b2b2b';
const GUIDE = '#7a7a7a';
const ACCENT = '#a2471f';
const P1 = '#9c6b43';
const P1_DARK = '#6e4a2c';
const D1_LIGHT = '#e8d6b0';
const D2_DARK = '#4e3322';
const METAL = '#9a9a9a';
const MAGNET = '#444444';
const CARD = '#dfe8f0';
const PAPER = '#f4f1e8';
const WOOD = '#c9a878';
const WRAP = '#7fb2d6';

type Anchor = 'start' | 'middle' | 'end';

const text = (
  x: number,
  y: number,
  s: string,
  size = 3,
  anchor: Anchor = 'start',
  fill = INK,
): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" ` +
  `text-anchor="${anchor}" fill="${fill}">${s}</text>`;

const line = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stroke = GUIDE,
  width = 0.3,
  dash?: string,
): string =>
  `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${stroke}" stroke-width="${width}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke = 'none',
  width = 0.3,
  extra = '',
): string =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${extra}/>`;

const circle = (
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke = 'none',
  width = 0.3,
  extra = '',
): string =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${extra}/>`;

type Pt = [number, number];

const poly = (
  pts: Pt[],
  fill: string,
  stroke = 'none',
  width = 0.3,
  closed = true,
  extra = '',
): string =>
  `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ')}${closed ? ' Z' : ''}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${extra}/>`;

/** Body oblouku (úhly ve stupních, matematicky: 0 = doprava, 90 = nahoru v souřadnicích s osou y nahoru). */
function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** Kóta: úsečka se zarážkami a popiskem uprostřed (vodorovná nebo svislá). */
function dim(x0: number, y0: number, x1: number, y1: number, label: string, size = 2.6): string {
  const vertical = Math.abs(x1 - x0) < Math.abs(y1 - y0);
  const t = 1.2;
  const ticks = vertical
    ? line(x0 - t, y0, x0 + t, y0, ACCENT, 0.3) + line(x1 - t, y1, x1 + t, y1, ACCENT, 0.3)
    : line(x0, y0 - t, x0, y0 + t, ACCENT, 0.3) + line(x1, y1 - t, x1, y1 + t, ACCENT, 0.3);
  const lx = (x0 + x1) / 2;
  const ly = (y0 + y1) / 2;
  const lab = vertical
    ? text(lx + 1.8, ly + 1, label, size, 'start', ACCENT)
    : text(lx, ly - 1.4, label, size, 'middle', ACCENT);
  return line(x0, y0, x1, y1, ACCENT, 0.3) + ticks + lab;
}

const svgWrap = (body: string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="160mm" height="100mm" viewBox="0 0 160 100">',
    '<rect width="160" height="100" fill="#ffffff"/>',
    ...body,
    '</svg>',
  ].join('\n');

function stateB(L: LidWalletLayout): StateResult {
  const s = L.states.find((x) => x.state.id === 'B');
  if (!s) throw new Error('Model nemá stav B.');
  return s;
}

/**
 * Pomocník pro řez peněženkou (pohled zboku, zepředu vlevo): y peněženky nahoru, z (tloušťka)
 * doprava, tloušťky zvětšené `zs`krát. Vrstvy jsou pásy s proměnnou polohou líce z0(y).
 */
interface Section {
  X: (z: number) => number;
  Y: (y: number) => number;
  zs: number;
}

/** Vrstva v řezu: mezi y0 a y1 s předním lícem z0(y) (lineárně mezi body) a tloušťkou t. */
function layer(sec: Section, pts: [number, number][], t: number, fill: string, stroke = 'none') {
  // pts = [y, z0] seřazené podle y
  const front: Pt[] = pts.map(([y, z]) => [sec.X(z), sec.Y(y)]);
  const back: Pt[] = [...pts].reverse().map(([y, z]) => [sec.X(z + t), sec.Y(y)]);
  return poly([...front, ...back], fill, stroke, 0.2);
}

/* ------------------------------------------------------------------------------------------ */

/**
 * 1/6 – Řez peněženkou a pořadí vkládání. Vlevo řez v ose (tloušťky zvětšené): jazýček s magnetem
 * pod L1, přední stěna F, plíšek, D1, karty proužkem k horní hraně, bankovky, D2 a záda B; vpravo
 * pohled shora do ústí se třemi štěrbinami.
 */
export function buildRezSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const B = stateB(L);
  const out: string[] = [];
  out.push(text(80, 5.5, 'Co kam patří: řez v ose a pohled shora do ústí', 3.8, 'middle'));

  // --- levý panel: řez ---
  const s = 0.86;
  const base = 94;
  const zs = 2.6;
  const zOrigin = 22; // X líce F (z = 0)
  const sec: Section = { X: (z) => zOrigin + z * zs, Y: (y) => base - y * s, zs };
  const tP = spec.leatherMm;
  const tD = spec.dividerMm;
  const tL = spec.liningMm;
  const tM = spec.magnetThicknessMm;
  const tPl = spec.plateThicknessMm;
  const cardsT = spec.cardsB * spec.cardThicknessMm;
  const billT = 0.7;
  // Polohy líců v tloušťce (schéma): dole jen F, D1, bankovky a B; nad dnem karet karty před D1.
  const zD1Low = tP + tPl;
  const zD1High = tP + cardsT;
  const zBillLow = zD1Low + tD;
  const zBillHigh = zD1High + tD;
  const zD2High = zBillHigh + billT;
  const zBLow = zBillLow + billT;
  const zBHigh = zD2High + tD;
  const yT0 = L.cardFloorY; // přechod dna karet
  const yT1 = L.cardFloorY + 2;

  // záda B (s okénkem bankovek v ose); nad spodní hranou D2 leží B za D2
  const yBStep = L.d2BottomY - 3;
  const bPts = (y0: number, y1: number): [number, number][] => {
    const zAt = (y: number) =>
      y <= yBStep
        ? zBLow
        : y >= L.d2BottomY
          ? zBHigh
          : zBLow + ((y - yBStep) / 3) * (zBHigh - zBLow);
    const ys = [y0, yBStep, L.d2BottomY, y1].filter((y) => y >= y0 && y <= y1);
    return [...new Set(ys)].sort((p, q) => p - q).map((y): [number, number] => [y, zAt(y)]);
  };
  out.push(layer(sec, bPts(L.flatFromY, L.billWindow.y0), tP, P1, P1_DARK));
  out.push(layer(sec, bPts(L.billWindow.y1, L.hingeStartY), tP, P1, P1_DARK));
  // D2 (v ose přilepená k B, okénko bankovek skrz obě vrstvy)
  out.push(
    layer(
      sec,
      [
        [L.d2BottomY, zD2High],
        [L.billWindow.y0, zD2High],
      ],
      tD,
      D2_DARK,
    ),
  );
  out.push(
    layer(
      sec,
      [
        [L.billWindow.y1, zD2High],
        [L.d2TopY, zD2High],
      ],
      tD,
      D2_DARK,
    ),
  );
  // bankovka 69 mm na dně bankovek
  out.push(
    layer(
      sec,
      [
        [spec.billFloorMm, zBillLow],
        [yT0, zBillLow],
        [yT1, zBillHigh],
        [spec.billFloorMm + spec.billHeightMinMm, zBillHigh],
      ],
      billT,
      PAPER,
      GUIDE,
    ),
  );
  // D1
  out.push(
    layer(
      sec,
      [
        [L.d1BottomY, zD1Low],
        [yT0, zD1Low],
        [yT1, zD1High],
        [L.d1TopY, zD1High],
      ],
      tD,
      D1_LIGHT,
      GUIDE,
    ),
  );
  // barevná horní hrana D1
  out.push(rect(sec.X(zD1High), sec.Y(L.d1TopY), tD * zs, 1.4 * s, ACCENT));
  // plíšek na rubu F
  out.push(
    rect(sec.X(tP), sec.Y(L.plate.y1), tPl * zs, (L.plate.y1 - L.plate.y0) * s, METAL, INK, 0.2),
  );
  // karty (stav B: 2 karty) s proužkem u horní hrany
  const cardBottom = B.cardBottomNomY ?? L.cardFloorY;
  const cardTop = cardBottom + spec.cardHeightMm;
  for (let i = 0; i < spec.cardsB; i++) {
    const z = tP + i * spec.cardThicknessMm;
    out.push(
      rect(
        sec.X(z),
        sec.Y(cardTop),
        spec.cardThicknessMm * zs,
        spec.cardHeightMm * s,
        CARD,
        INK,
        0.2,
      ),
    );
    out.push(
      rect(
        sec.X(z),
        sec.Y(cardTop - spec.stripeNearMm),
        spec.cardThicknessMm * zs,
        (spec.stripeFarMm - spec.stripeNearMm) * s,
        INK,
      ),
    );
  }
  // přední stěna F
  out.push(
    layer(
      sec,
      [
        [L.flatFromY, 0],
        [L.frontTopY, 0],
      ],
      tP,
      P1,
      P1_DARK,
    ),
  );
  // ohyb dna: půlkruh mezi F a B
  const rOut = (zBLow + tP) / 2;
  const cz0 = rOut;
  const bend = [
    ...arcPts(cz0, L.flatFromY, rOut, 180, 360).map(([z, y]): Pt => [sec.X(z), sec.Y(y)]),
    ...arcPts(cz0, L.flatFromY, rOut - tP, 360, 180).map(([z, y]): Pt => [sec.X(z), sec.Y(y)]),
  ];
  // střed je v L.flatFromY; spodní líc tedy leží v y = flatFromY − rOut (schéma, zvětšené)
  out.push(poly(bend, P1, P1_DARK, 0.2));
  // závěs přes horní hrany a víčko s jazýčkem vpředu
  const zLidFront = -(tL + tM + tP); // jazýček u magnetu: jazýček + magnet + L1 před F
  const zLid = -tP;
  const yTop = L.heightMm - tP;
  // vrch závěsu (plochý) jako pás tloušťky P1 nad stropem
  out.push(
    poly(
      [
        [sec.X(zLid), sec.Y(L.heightMm)],
        [sec.X(zBHigh + tP), sec.Y(L.heightMm)],
        [sec.X(zBHigh + tP), sec.Y(L.hingeStartY)],
        [sec.X(zBHigh), sec.Y(L.hingeStartY)],
        [sec.X(zBHigh), sec.Y(yTop)],
        [sec.X(zLid + tP), sec.Y(yTop)],
        [sec.X(zLid + tP), sec.Y(L.frontTopY + 1)],
        [sec.X(zLid), sec.Y(L.frontTopY + 1)],
      ],
      P1,
      P1_DARK,
      0.2,
    ),
  );
  // pás víčka a jazýček vpředu (osa: pás plynule pokračuje do jazýčku)
  const yL1Top = B.tipY + L.lining.topAboveTipMm;
  out.push(
    layer(
      sec,
      [
        [B.tipY, zLidFront],
        [yL1Top, zLidFront],
        [yL1Top + 3, zLid],
        [L.frontTopY + 1, zLid],
      ],
      tP,
      P1,
      P1_DARK,
    ),
  );
  // magnet a L1 na rubu jazýčku
  const yM = L.magnetYB;
  out.push(
    rect(
      sec.X(zLidFront + tP),
      sec.Y(yM + spec.magnetDiameterMm / 2),
      tM * zs,
      spec.magnetDiameterMm * s,
      MAGNET,
    ),
  );
  // L1 je přilepená na rub jazýčku kolem magnetu a přes magnet se vyklene k F
  const zTb = zLidFront + tP;
  const yMb = yM - spec.magnetDiameterMm / 2;
  const yMt = yM + spec.magnetDiameterMm / 2;
  out.push(
    layer(
      sec,
      [
        [B.tipY, zTb],
        [yMb - 0.8, zTb],
        [yMb, zTb + tM],
        [yMt, zTb + tM],
        [yMt + 0.8, zTb],
        [yL1Top, zTb],
      ],
      tL,
      D1_LIGHT,
      GUIDE,
    ),
  );

  // popisky vlevo a vpravo od řezu
  const lx = 3;
  const labelsL: [number, string][] = [
    [L.heightMm + 1.5, 'závěs'],
    [70, 'víčko'],
    [yL1Top - 2, 'L1'],
    [yM, 'magnet'],
    [B.tipY + 1, 'jazýček'],
  ];
  for (const [y, t] of labelsL) out.push(text(lx, sec.Y(y) + 1, t, 2.6, 'start', GUIDE));
  out.push(
    line(lx + 10, sec.Y(yM), sec.X(zLidFront + tP), sec.Y(yM), GUIDE, 0.2),
    line(lx + 5, sec.Y(yL1Top - 2), sec.X(zLidFront + tP), sec.Y(yL1Top - 2), GUIDE, 0.2),
  );
  const rx = sec.X(zBHigh + tP) + 3;
  const labelsR: [number, number, string, string][] = [
    [
      (cardTop - spec.stripeNearMm + cardTop - spec.stripeFarMm) / 2,
      tP + cardsT / 2,
      'karty, proužek k horní hraně',
      INK,
    ],
    [L.d1TopY, zD1High + tD / 2, 'D1, barevná hrana', ACCENT],
    [60, zBillHigh + billT / 2, 'bankovka napůl', INK],
    [(L.billWindow.y0 + L.billWindow.y1) / 2 - 6, zD2High, 'okénko bankovek', INK],
    [L.plate.y0 + 6, tP + tPl / 2, 'plíšek na rubu F', INK],
    [L.flatFromY + 4, 0, 'F · ohyb dna · B', INK],
  ];
  for (const [y, z, t, c] of labelsR) {
    out.push(line(sec.X(z), sec.Y(y), rx, sec.Y(y), GUIDE, 0.2));
    out.push(text(rx + 0.8, sec.Y(y) + 1, t, 2.6, 'start', c));
  }
  out.push(text(3, 99, 'řez v ose, stav B; tloušťky zvětšené', 2.4, 'start', GUIDE));

  // --- pravý panel: pohled shora do ústí ---
  const px0 = 96;
  const pw = 58;
  const sx = pw / L.widthMm;
  const pz = 2.8;
  const py0 = 70; // líc F (dole = vpředu)
  const X = (x: number) => px0 + x * sx;
  const Z = (z: number) => py0 - z * pz;
  out.push(text(px0 + pw / 2, 16, 'Pohled shora do ústí', 3.2, 'middle'));
  out.push(text(px0 + pw / 2, 20.5, 'vpředu (strana jazýčku) je dole', 2.4, 'middle', GUIDE));
  // F
  out.push(rect(X(0), Z(tP), pw, tP * pz, P1, P1_DARK, 0.2));
  // karty
  out.push(
    rect(
      X(L.cardPocketX[0] + (L.cardPocketX[1] - L.cardPocketX[0] - spec.cardWidthMm) / 2),
      Z(tP + cardsT),
      spec.cardWidthMm * sx,
      cardsT * pz,
      CARD,
      INK,
      0.2,
    ),
  );
  // D1
  out.push(rect(X(L.d1.x0), Z(zD1High + tD), (L.d1.x1 - L.d1.x0) * sx, tD * pz, ACCENT));
  // bankovky
  out.push(
    rect(
      X(L.pocketX0 + 4),
      Z(zBillHigh + billT),
      (L.pocketMm - 8) * sx,
      billT * pz,
      PAPER,
      GUIDE,
      0.2,
    ),
  );
  // D2
  out.push(rect(X(0), Z(zD2High + tD), pw, tD * pz, D2_DARK));
  // mince v obou sloupcích
  const coinT = spec.coinThicknessMaxMm;
  for (const [c0, c1] of [L.columnLeft, L.columnRight]) {
    const cx = (c0 + c1) / 2;
    out.push(
      rect(
        X(cx - spec.coinDiameterMaxMm / 2),
        Z(zD2High + tD + coinT),
        spec.coinDiameterMaxMm * sx,
        coinT * pz,
        METAL,
        INK,
        0.2,
      ),
    );
  }
  // střed: D2 přilepená k B (mezi sloupci žádná štěrbina)
  out.push(
    rect(
      X(L.centerBand[0]),
      Z(zD2High + tD + coinT),
      (L.centerBand[1] - L.centerBand[0]) * sx,
      coinT * pz,
      D2_DARK,
      'none',
      0,
      ' fill-opacity="0.35"',
    ),
  );
  out.push(text(X(L.axisX), Z(zD2High + tD + coinT / 2) + 1, 'slepeno', 2.3, 'middle', '#ffffff'));
  // B
  out.push(rect(X(0), Z(zD2High + tD + coinT + tP), pw, tP * pz, P1, P1_DARK, 0.2));
  // čísla štěrbin
  const slots: [number, string][] = [
    [tP + cardsT / 2, '1 karty'],
    [zBillHigh + billT / 2, '2 bankovky'],
    [zD2High + tD + coinT / 2, '3 mince L / P'],
  ];
  slots.forEach(([z], i) => {
    out.push(circle(px0 - 3, Z(z), 1.7, '#ffffff', ACCENT, 0.3));
    out.push(text(px0 - 3, Z(z) + 1, String(i + 1), 2.4, 'middle', ACCENT));
  });
  out.push(text(px0 + pw / 2, Z(-1) + 4, 'F – líc vpředu', 2.4, 'middle', GUIDE));
  out.push(
    text(px0 + pw / 2, Z(zD2High + tD + coinT + tP) - 2, 'B – záda s okénky', 2.4, 'middle', GUIDE),
  );
  const legendY = 80;
  out.push(text(px0 - 5, legendY, '1  karty do první štěrbiny u přední stěny,', 2.5, 'start'));
  out.push(
    text(px0 - 1, legendY + 3.6, 'kartu s proužkem proužkem k horní hraně (k víčku)', 2.5, 'start'),
  );
  out.push(text(px0 - 5, legendY + 7.8, '2  bankovky napůl za barevnou hranu D1', 2.5, 'start'));
  out.push(
    text(
      px0 - 5,
      legendY + 12,
      '3  mince za tmavou D2, do levého nebo pravého sloupce',
      2.5,
      'start',
    ),
  );
  out.push(
    text(
      px0 - 5,
      legendY + 16.2,
      'Do štěrbiny 2 nikdy kartu: ležela by u magnetu.',
      2.5,
      'start',
      ACCENT,
    ),
  );

  return svgWrap(out);
}

/**
 * 2/6 – Vložka dna a rýha ohybu: hrana vložky leží o půl oblouku ohybu (1,96 mm ve výchozím
 * střihu) za rýhou směrem k zádům B, aby střed ohybu padl na rýhu.
 */
export function buildVlozkaDnaSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const out: string[] = [];
  const half = L.v.insertEdge - L.v.foldAxis;
  out.push(text(80, 5.5, 'Vložka dna: hrana vložky leží za rýhou, ne na ní', 3.8, 'middle'));

  // --- horní panel: rozvinutý P1 z rubu kolem ohybu dna ---
  const v0 = L.v.foldAxis - 14;
  const v1 = L.v.foldAxis + 20;
  const k = 4.2; // mm → jednotky
  const X = (v: number) => 8 + (v - v0) * k;
  const top = 14;
  const hgt = 30;
  out.push(rect(X(v0), top, (v1 - v0) * k, hgt, '#efe2cf', P1_DARK, 0.3));
  // pás oblouku ohybu
  out.push(
    rect(X(L.v.frontEnd), top, L.v.foldArc * k, hgt, '#e2c9a6', 'none', 0, ' fill-opacity="0.9"'),
  );
  // vložka na B, hranou na čáře
  out.push(
    rect(
      X(L.v.insertEdge),
      top - 3,
      (v1 - L.v.insertEdge) * k,
      hgt + 6,
      CARD,
      INK,
      0.3,
      ' fill-opacity="0.85"',
    ),
  );
  out.push(line(X(L.v.foldAxis), top - 2, X(L.v.foldAxis), top + hgt + 2, ACCENT, 0.5, '1.2 0.8'));
  out.push(line(X(L.v.insertEdge), top - 3, X(L.v.insertEdge), top + hgt + 3, INK, 0.6));
  out.push(text(X(v0) + 2, top + 5, 'F (přední stěna)', 2.8, 'start', P1_DARK));
  out.push(text(X(v1) - 2, top + 5, 'B (záda) – vložka leží tady', 2.8, 'end', INK));
  out.push(
    text(
      X(v1) - 2,
      top + 9,
      `vložka ${cz(L.bottomSpacer.widthMm)} × ${cz(L.bottomSpacer.depthMm)} × ${cz(spec.bottomSpacerMm)}`,
      2.6,
      'end',
      GUIDE,
    ),
  );
  out.push(
    text(
      X(v1) - 2,
      top + 12.6,
      `(${L.bottomSpacer.fromCards.cards} staré karty, ${L.bottomSpacer.fromCards.layers} vrstvy)`,
      2.6,
      'end',
      GUIDE,
    ),
  );
  out.push(
    text(X(L.v.foldAxis) - 1, top + hgt - 8, `rýha v ${cz(L.v.foldAxis)}`, 2.7, 'end', ACCENT),
  );
  out.push(
    text(
      X(L.v.insertEdge) + 1,
      top + hgt - 8,
      `hrana vložky v ${cz(L.v.insertEdge)}`,
      2.7,
      'start',
      INK,
    ),
  );
  out.push(dim(X(L.v.foldAxis), top + hgt + 8, X(L.v.insertEdge), top + hgt + 8, `${cz(half)} mm`));
  out.push(
    text(
      X(L.v.frontEnd) - 1,
      top + hgt - 2,
      `pás oblouku ${cz(L.v.foldArc)} mm`,
      2.4,
      'end',
      P1_DARK,
    ),
  );
  out.push(
    text(8, top + hgt + 13, 'rub nahoře; čáry i rysky na obou bocích dílu', 2.6, 'start', GUIDE),
  );

  // --- dolní panel: řez po přehnutí ---
  const kk = 6;
  const baseY = 86;
  const nx = 30; // X hrany vložky (tečný bod)
  const tIns = spec.bottomSpacerMm;
  const tP = L.bottomFoldMm;
  const rIn = tIns / 2;
  const cy = baseY - (tP + rIn) * kk; // střed nosu vložky
  // B dole (useň pod vložkou)
  out.push(rect(nx, baseY - tP * kk, 110, tP * kk, P1, P1_DARK, 0.3));
  // vložka
  out.push(rect(nx, cy - rIn * kk, 100, tIns * kk, CARD, INK, 0.3));
  out.push(text(nx + 60, cy + 1, 'vložka (rovná hrana)', 2.6, 'middle'));
  // F nahoře (useň nad vložkou)
  out.push(rect(nx, cy - (rIn + tP) * kk, 110, tP * kk, P1, P1_DARK, 0.3));
  // oblouk kolem nosu
  const outer = arcPts(nx, cy, (rIn + tP) * kk, 90, 270).map(([x, y]): Pt => [x, y]);
  const inner = arcPts(nx, cy, rIn * kk, 270, 90);
  out.push(poly([...outer, ...inner], P1, P1_DARK, 0.3));
  // Rýha je vytlačená z rubu, po přehnutí lícem ven leží na vnitřní ploše oblouku (na rubu) ve
  // vrcholu ohybu. Schéma má půlkulatý nos; skutečný střed ohybu přes vložku z karet ověří V12.
  const apexX = nx - rIn * kk;
  out.push(circle(apexX, cy, 0.9, ACCENT));
  out.push(line(apexX - 8, cy - 12, apexX - 0.6, cy - 0.8, ACCENT, 0.3));
  out.push(text(apexX - 10, cy - 13, 'rýha (na rubu) = vrchol ohybu', 2.7, 'start', ACCENT));
  out.push(text(nx + 30, baseY + 5, 'schéma; skutečný střed ohybu ověří V12', 2.3, 'start', GUIDE));
  out.push(line(nx, cy - 12, nx, baseY + 2, INK, 0.3, '1 0.8'));
  out.push(text(nx + 1, baseY + 5, 'hrana vložky', 2.6, 'start'));
  out.push(text(nx + 112, baseY - tP * kk + 3, 'B', 2.8, 'start', P1_DARK));
  out.push(text(nx + 112, cy - (rIn + tP) * kk + 3, 'F', 2.8, 'start', P1_DARK));
  out.push(text(nx + 108, cy - (rIn + tP) * kk - 1.2, 'líc', 2.4, 'end', GUIDE));
  out.push(text(nx + 108, baseY + 3.2, 'líc', 2.4, 'end', GUIDE));
  out.push(
    text(
      80,
      97,
      'Vložku položte na rub B hranou na čáru, F přehněte přes ni lícem ven, fólie mezi líc a prkénka, přes noc.',
      2.5,
      'middle',
      GUIDE,
    ),
  );
  return svgWrap(out);
}

/**
 * 3/6 – Tvarování závěsu přes obsah stavu B: peněženka leží na zádech, víčko zavřené přes 2 karty
 * a papír místo bankovky, fólie a kniha, přes noc.
 */
export function buildZavesPresObsahSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const B = stateB(L);
  const out: string[] = [];
  out.push(
    text(80, 5.5, 'Závěs se tvaruje zavřený přes obsah, přes noc pod knihou', 3.8, 'middle'),
  );

  // Peněženka leží na zádech: y peněženky doprava, z (tloušťka) nahoru, zvětšeno.
  const s = 1.2;
  const x0 = 22;
  const zs = 3.2;
  const table = 70;
  const tP = spec.leatherMm;
  const tD = spec.dividerMm;
  const cardsT = spec.cardsB * spec.cardThicknessMm;
  const paper = 0.7;
  const X = (y: number) => x0 + y * s;
  const Z = (z: number) => table - z * zs; // z od stolu nahoru
  // vrstvy odspodu: B, D2, papír (místo bankovky), D1, karty, F, pás víčka
  const zB = 0;
  const zD2 = tP;
  const zPaper = zD2 + tD;
  const zD1 = zPaper + paper;
  const zCards = zD1 + tD;
  const zF = zCards + cardsT;
  const zLid = zF + tP;
  out.push(rect(4, table, 152, 3, WOOD));
  out.push(text(6, table + 7.5, 'stůl', 2.6, 'start', GUIDE));
  const band = (y0: number, y1: number, z: number, t: number, fill: string, stroke = 'none') =>
    rect(X(y0), Z(z + t), (y1 - y0) * s, t * zs, fill, stroke, 0.2);
  out.push(band(L.flatFromY, L.hingeStartY, zB, tP, P1, P1_DARK));
  out.push(band(L.d2BottomY, L.d2TopY, zD2, tD, D2_DARK));
  out.push(band(spec.billFloorMm, spec.billFloorMm + 65, zPaper, paper, PAPER, GUIDE));
  out.push(band(L.d1BottomY, L.d1TopY, zD1, tD, D1_LIGHT, GUIDE));
  const cb = B.cardBottomNomY ?? L.cardFloorY;
  out.push(band(cb, cb + spec.cardHeightMm, zCards, cardsT, CARD, INK));
  out.push(band(L.flatFromY, L.frontTopY, zF, tP, P1, P1_DARK));
  // ohyb dna vlevo (půlkruh v měřítku tloušťky) a závěs vpravo (přes obsah)
  const arcBand = (cx: number, cyTop: number, cyBot: number, t: number, a0: number, a1: number) => {
    const r = (cyBot - cyTop) / 2;
    const cy = (cyTop + cyBot) / 2;
    return poly([...arcPts(cx, cy, r, a0, a1), ...arcPts(cx, cy, r - t, a1, a0)], P1, P1_DARK, 0.2);
  };
  out.push(arcBand(X(L.flatFromY), Z(zF + tP), Z(zB), tP * zs, 90, 270));
  const hx = X(L.hingeStartY);
  const hTop = Z(zF + tP);
  const hBot = Z(zB);
  const hr = (hBot - hTop) / 2;
  out.push(arcBand(hx, hTop, hBot, tP * zs, -90, 90));
  // pás víčka a jazýček nahoře (leží na F)
  out.push(band(B.tipY, L.frontTopY, zLid, tP, P1, P1_DARK));
  out.push(
    poly(
      [
        [X(L.frontTopY), Z(zLid + tP)],
        [X(L.frontTopY + 3), Z(zF + tP)],
        [X(L.hingeStartY), Z(zF + tP)],
        [X(L.hingeStartY), Z(zF)],
        [X(L.frontTopY + 3), Z(zF)],
        [X(L.frontTopY), Z(zLid)],
      ],
      P1,
      P1_DARK,
      0.2,
    ),
  );
  // navlhčený pás závěsu
  out.push(
    rect(
      hx - 6,
      hTop - 1.2,
      hr * 0.9 + 7,
      hBot - hTop + 2.4,
      WRAP,
      'none',
      0,
      ' fill-opacity="0.18"',
    ),
  );
  // fólie a kniha
  const bookBottom = Z(zLid + tP) - 1.4;
  // kniha leží na jazýčku a pásu víčka
  out.push(
    `<path d="M${f(X(0) - 4)} ${f(bookBottom + 0.6)} L${f(hx + hr + 6)} ${f(bookBottom + 0.6)}" stroke="${WRAP}" stroke-width="0.8" fill="none"/>`,
  );
  out.push(rect(X(0) - 8, bookBottom - 17, (L.heightMm + 16) * s, 17, '#8a3f3f', '#5e2a2a', 0.4));
  out.push(
    text(X(L.heightMm / 2), bookBottom - 7, 'kniha (lehká zátěž)', 3.2, 'middle', '#ffffff'),
  );
  out.push(text(hx + hr + 7, bookBottom + 1.6, 'fólie', 2.6, 'start', WRAP));

  // popisky
  const lab = (y: number, z: number, t: string, c = INK, dy = 0) => {
    const x = X(y);
    const yy = Z(z);
    out.push(line(x, yy, x, 82 + dy, GUIDE, 0.2));
    out.push(text(x, 85 + dy, t, 2.6, 'middle', c));
  };
  lab(cb + 30, zCards + cardsT / 2, `${spec.cardsB} staré karty`, INK, 0);
  lab(20, zPaper + paper / 2, `papír ≈ ${cz(paper, 1)} mm místo bankovky`, INK, 5);
  lab(B.tipY + 6, zLid + tP / 2, 'jazýček po přední stěně', INK, 0);
  out.push(text(hx + 2, 77, 'navlhčit jen pás závěsu', 2.6, 'start', ACCENT));
  out.push(
    text(
      80,
      97,
      'Zavřené přes noc (12–24 h, ne u topení). Magnet ještě není. Potom otevřené víčko samo nestojí – tak to má být.',
      2.5,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(4, 14, `obsah pod závěsem T = ${cz(L.hingeContentBMm)} mm (stav B)`, 2.6, 'start', GUIDE),
  );
  return svgWrap(out);
}

/**
 * 4/6 – Konec jazýčku z rubu: magnet 7 mm nad špičkou, podšívka L1 s horní hranou 10 mm nad
 * středem magnetu, šev S7 do U kolem magnetu (ke špičce otevřený), klín posledních 2,5 mm; vedle
 * vrstvy v tloušťce a mezera magnet–plíšek.
 */
export function buildJazycekMagnetSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const out: string[] = [];
  out.push(text(80, 5.5, 'Konec jazýčku: magnet, podšívka L1 a šev S7 do U', 3.8, 'middle'));
  const k = 2.6;
  const cx = 64;
  const tipY = 80;
  const U = (u: number) => cx + u * k;
  const H = (h: number) => tipY - h * k;
  const w2 = spec.tongueWidthMm / 2;
  const R = spec.tongueTipRadiusMm;
  const hTopShow = 24;
  const tipArc = (n = 24): Pt[] => arcPts(0, R, R, 180, 360, n).map(([u, h]): Pt => [U(u), H(h)]);
  // přířez L1 před ořezem (čárkovaně)
  const bw = spec.liningBlankWidthMm / 2;
  out.push(
    rect(
      U(-bw),
      H(L.lining.topAboveTipMm),
      spec.liningBlankWidthMm * k,
      (L.lining.topAboveTipMm - L.lining.bottomAboveTipMm) * k,
      'none',
      GUIDE,
      0.3,
      ' stroke-dasharray="1 0.8"',
    ),
  );
  // obrys jazýčku (konec R10 = půlkruh při šířce 20)
  out.push(
    poly([[U(-w2), H(hTopShow)], ...tipArc(), [U(w2), H(hTopShow)]], P1, P1_DARK, 0.4, false),
  );
  // magnet na rubu jazýčku, přes něj L1 (L1 je nahoře, magnet pod ní)
  const hM = spec.magnetFromTipMm;
  out.push(circle(U(0), H(hM), (spec.magnetDiameterMm / 2) * k, MAGNET));
  out.push(
    poly(
      [[U(-w2), H(L.lining.topAboveTipMm)], ...tipArc(), [U(w2), H(L.lining.topAboveTipMm)]],
      D1_LIGHT,
      GUIDE,
      0.3,
      true,
      ' fill-opacity="0.72"',
    ),
  );
  out.push(
    circle(
      U(0),
      H(hM),
      (spec.magnetDiameterMm / 2) * k,
      'none',
      INK,
      0.35,
      ' stroke-dasharray="1 0.6"',
    ),
  );
  out.push(text(U(0), H(hM) + 1, 'magnet pod L1', 2.4, 'middle', INK));
  // klín špičky
  const wedge = tipArc(48).filter(([, y]) => y >= H(spec.tipSkiveMm) - 1e-9);
  if (wedge.length > 1) out.push(poly(wedge, '#b89c70', 'none', 0, true, ' fill-opacity="0.8"'));
  out.push(
    line(U(-bw - 1), H(spec.tipSkiveMm), U(bw + 1), H(spec.tipSkiveMm), ACCENT, 0.3, '0.8 0.6'),
  );
  // otvory S7
  for (const hole of L.lining.seamHoles) out.push(circle(U(hole.u), H(hole.h), 0.75, ACCENT));
  // kóty
  out.push(dim(U(bw + 2), H(0), U(bw + 2), H(hM), `${cz(hM, 1)} mm`));
  out.push(line(U(0), H(0), U(bw + 3), H(0), GUIDE, 0.2, '0.6 0.5'));
  out.push(line(U(0), H(hM), U(bw + 8), H(hM), GUIDE, 0.2, '0.6 0.5'));
  out.push(
    dim(
      U(bw + 7),
      H(hM),
      U(bw + 7),
      H(L.lining.topAboveTipMm),
      `${cz(spec.liningTopAboveMagnetMm, 1)} mm`,
    ),
  );
  out.push(
    dim(U(-w2), H(hTopShow) - 3, U(w2), H(hTopShow) - 3, `jazýček ${cz(spec.tongueWidthMm, 0)} mm`),
  );
  out.push(text(U(0), H(hTopShow) - 8.5, 'pohled na rub jazýčku', 2.5, 'middle', GUIDE));
  // popisky vlevo
  const lx = 2;
  const labels: [number, string, string][] = [
    [L.lining.topAboveTipMm, 'ryska horní hrany L1', INK],
    [L.lining.seamHoles[3].h, 'S7: 8 otvorů do U', ACCENT],
    [spec.tipSkiveMm / 2, `klín jen posl. ${cz(spec.tipSkiveMm, 1)} mm`, ACCENT],
    [
      L.lining.bottomAboveTipMm + 1,
      `přířez L1 ${spec.liningBlankWidthMm} × ${spec.liningBlankHeightMm}`,
      GUIDE,
    ],
  ];
  for (const [h, t, c] of labels) out.push(text(lx, H(h) + 1, t, 2.5, 'start', c));
  out.push(
    text(
      U(0),
      97,
      'U je ke špičce otevřené; jazýček a L1 se ořežou najednou po nalepení',
      2.4,
      'middle',
      GUIDE,
    ),
  );

  // vrstvy v tloušťce (zavřené víčko)
  const sx0 = 124;
  const ly = 20;
  out.push(text(sx0 + 14, ly - 5, 'Vrstvy u magnetu', 3, 'middle'));
  const zs = 5;
  const rows: [string, number, string][] = [
    ['jazýček', spec.leatherMm, P1],
    ['magnet', spec.magnetThicknessMm, MAGNET],
    ['L1', spec.liningMm, D1_LIGHT],
    ['F', spec.leatherMm, P1],
    ['plíšek', spec.plateThicknessMm, METAL],
    ['D1', spec.dividerMm, D1_LIGHT],
  ];
  let y = ly;
  for (const [name, t, c] of rows) {
    out.push(rect(sx0, y, 9, t * zs, c, INK, 0.2));
    out.push(text(sx0 + 11, y + (t * zs) / 2 + 1, `${name} ${cz(t)}`, 2.5, 'start'));
    y += t * zs;
  }
  const gapTop = ly + (spec.leatherMm + spec.magnetThicknessMm) * zs;
  const gapBot = gapTop + L.magnetPlateGapMm * zs;
  out.push(line(sx0 - 2, gapTop, sx0 - 2, gapBot, ACCENT, 0.5));
  out.push(text(sx0 - 3, (gapTop + gapBot) / 2 + 1, cz(L.magnetPlateGapMm, 1), 2.5, 'end', ACCENT));
  const notes: [string, string][] = [
    [`mezera magnet–plíšek ${cz(L.magnetPlateGapMm, 1)} mm`, ACCENT],
    ['= L1 + F', ACCENT],
    [`S7 ≥ ${cz(L.lining.seamToMagnetMm)} mm od magnetu`, GUIDE],
    [`a ≥ ${cz(L.lining.seamToEdgeMm, 1)} mm od hrany`, GUIDE],
    ['magnet epoxidem, L1 až po', GUIDE],
    ['ztuhnutí; přes magnet', ACCENT],
    ['paličkou netlouct', ACCENT],
  ];
  notes.forEach(([t, c], i) => out.push(text(sx0 - 8, y + 16 + i * 3.9, t, 2.4, 'start', c)));
  return svgWrap(out);
}

/**
 * 5/6 – Záda B zvenku: dva sloupce mincí s okénky 12 × 48, uprostřed okénko bankovek 14 × 45
 * (výsečník Ø 14), švy S1–S5 a skrytá spodní hrana D2.
 */
export function buildZadaOkenkaSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const out: string[] = [];
  out.push(text(80, 5.5, 'Záda: sloupce mincí a okénko bankovek', 3.8, 'middle'));
  const s = 0.86;
  const x0 = 6;
  const base = 94;
  const X = (x: number) => x0 + x * s;
  const Y = (y: number) => base - y * s;
  out.push(rect(X(0), Y(L.hingeStartY), L.widthMm * s, (L.hingeStartY - 0) * s, P1, P1_DARK, 0.4));
  // skrytá spodní hrana D2
  out.push(line(X(0), Y(L.d2BottomY), X(L.widthMm), Y(L.d2BottomY), '#f5e6d0', 0.3, '1.2 0.8'));
  // sloupce mincí (skryté, čárkovaně) a mince
  for (const [c0, c1] of [L.columnLeft, L.columnRight]) {
    out.push(
      rect(
        X(c0),
        Y(L.hingeStartY),
        (c1 - c0) * s,
        (L.hingeStartY - L.coinFloorY) * s,
        'none',
        '#f5e6d0',
        0.3,
        ' stroke-dasharray="1 0.8"',
      ),
    );
    const cx = (c0 + c1) / 2;
    const r = spec.coinDiameterMaxMm / 2;
    const y0 = L.coinFloorY + spec.wedgeLiftMax * spec.coinThicknessMaxMm * 0.5;
    for (let i = 0; i < spec.coinsPerColumn; i++) {
      out.push(
        circle(
          X(cx),
          Y(y0 + r + i * 2 * r),
          r * s,
          'none',
          '#f5e6d0',
          0.3,
          ' stroke-dasharray="0.8 0.6"',
        ),
      );
    }
  }
  // okénka
  const slotPath = (cx: number, y0: number, y1: number, w: number) => {
    const r = w / 2;
    const pts: Pt[] = [
      ...arcPts(cx, y1 - r, r, 0, 180).map(([x, y]): Pt => [X(x), Y(y)]),
      ...arcPts(cx, y0 + r, r, 180, 360).map(([x, y]): Pt => [X(x), Y(y)]),
    ];
    return poly(pts, '#ffffff', INK, 0.4);
  };
  for (const w of L.coinWindows) out.push(slotPath(w.cx, w.y0, w.y1, w.width));
  const bw = L.billWindow;
  out.push(slotPath(bw.cx, bw.y0, bw.y1, bw.width));
  // středy výseků okénka bankovek
  for (const yc of [bw.y0 + bw.width / 2, bw.y1 - bw.width / 2]) {
    out.push(circle(X(bw.cx), Y(yc), 0.5, ACCENT));
  }
  // švy
  const hole = (x: number, y: number) => circle(X(x), Y(y), 0.45, INK);
  for (const seam of L.seams) {
    if (seam.where === 'F' || seam.where === 'tongue') continue;
    for (const h of seam.holes) out.push(hole(h.x, h.y));
  }
  // popisky vpravo
  const rx = X(L.widthMm) + 4;
  const put = (x: number, y: number, ty: number, t: string, c = INK) => {
    out.push(line(X(x), Y(y), rx - 1, ty, GUIDE, 0.2));
    out.push(text(rx, ty + 1, t, 2.6, 'start', c));
  };
  const cw = L.coinWindows[1];
  put(
    cw.cx,
    cw.y1 - 3,
    22,
    `okénka mincí ${cz(cw.width, 0)} × ${cz(cw.y1 - cw.y0, 0)} (výsečník Ø ${cz(cw.width, 0)})`,
  );
  put(
    L.columnRight[1] - 2,
    L.coinFloorY + 40,
    30,
    `sloupec ${cz(L.columnMm, 0)} × ${cz(L.columnLengthMm, 0)}: 2 mince nad sebou`,
  );
  put(
    bw.cx + bw.width / 2,
    bw.y1 - 8,
    40,
    `okénko bankovek ${cz(bw.width, 0)} × ${cz(bw.y1 - bw.y0, 0)}`,
    ACCENT,
  );
  out.push(
    text(
      rx,
      44.6,
      `(výsečník Ø ${cz(bw.width, 0)}, středy y ${cz(bw.y0 + bw.width / 2, 0)} a ${cz(bw.y1 - bw.width / 2, 0)})`,
      2.5,
      'start',
      GUIDE,
    ),
  );
  out.push(
    text(
      rx,
      48.8,
      `tah prstem ${cz(L.billPushMm, 0)} mm, bankovka pak vyčnívá ${cz(L.billProtrusionMm[0], 0)}–${cz(L.billProtrusionMm[1], 0)} mm`,
      2.5,
      'start',
      GUIDE,
    ),
  );
  put(
    L.seamColumnX[1],
    50,
    58,
    `švy sloupců S2 / S3 (x ${cz(L.seamColumnX[0], 0)} a ${cz(L.seamColumnX[1], 0)})`,
  );
  put(70, L.s1Y, 68, `S1 dno mincí (y ${cz(L.s1Y, 0)})`);
  put(L.seamSideX[1], 12, 76, `boční švy S4 / S5 (${cz(L.seamSideX[0], 0)} mm od hrany)`);
  put(90, L.d2BottomY, 84, `spodní hrana D2 (y ${cz(L.d2BottomY, 0)}, zevnitř)`, GUIDE);
  out.push(
    text(
      X(L.widthMm / 2),
      Y(L.hingeStartY) - 2.5,
      'pohled na líc zad zvenku',
      2.5,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      X(L.widthMm / 2),
      99,
      `mince 1 Kč (Ø ${cz(spec.coinDiameterMinMm, 0)}) okénkem nepropadne`,
      2.5,
      'middle',
      GUIDE,
    ),
  );
  return svgWrap(out);
}

/**
 * 6/6 – Výřez pro palec U 10 × 12 v horní hraně přední stěny: vlevo otevřené víčko (výsečník Ø 10,
 * rovné řezy nožem k tečnám, rohy R1 brusným papírem, přední karta ve výřezu), vpravo zavřené
 * víčko – jazýček 20 mm výřez přikryje i posunutý o 3 mm.
 */
export function buildVyrezProPalecSvg(spec: LidWalletSpec = DEFAULT_LID_WALLET): string {
  assertLidWallet(spec);
  const L = lidWalletLayout(spec);
  const B = stateB(L);
  const n = L.thumbNotch;
  const out: string[] = [];
  out.push(
    text(
      80,
      5.5,
      `Výřez pro palec U ${cz(n.x1 - n.x0, 0)} × ${cz(n.depthMm, 0)} v horní hraně přední stěny`,
      3.8,
      'middle',
    ),
  );
  const s = 1.3;
  const xa = 28; // x peněženky na levém okraji panelu
  const xb = 73;
  const y0 = 38; // y peněženky u spodního okraje panelu
  const base = 92;
  const panel = (px: number) => ({
    X: (x: number) => px + (x - xa) * s,
    Y: (y: number) => base - (y - y0) * s,
  });
  const fOutline = (X: (x: number) => number, Y: (y: number) => number): Pt[] => {
    const r1 = n.cornerRadiusMm;
    return [
      [X(xa), Y(y0)],
      [X(xa), Y(n.topY)],
      [X(n.x0 - r1), Y(n.topY)],
      ...arcPts(n.x0 - r1, n.topY - r1, r1, 90, 0, 8).map(([x, y]): Pt => [X(x), Y(y)]),
      [X(n.x0), Y(n.centerY)],
      ...arcPts(n.cx, n.centerY, n.radius, 180, 360, 24).map(([x, y]): Pt => [X(x), Y(y)]),
      [X(n.x1), Y(n.topY - r1)],
      ...arcPts(n.x1 + r1, n.topY - r1, r1, 180, 90, 8).map(([x, y]): Pt => [X(x), Y(y)]),
      [X(xb), Y(n.topY)],
      [X(xb), Y(y0)],
    ];
  };
  const cardX0 = L.cardPocketX[0] + (L.cardPocketX[1] - L.cardPocketX[0] - spec.cardWidthMm) / 2;
  const cardTopY = n.bottomY + n.exposedCardMm[0];

  // --- levý panel: otevřené víčko ---
  {
    const { X, Y } = panel(10);
    out.push(text(X((xa + xb) / 2), 14, 'víčko otevřené', 3, 'middle', GUIDE));
    // přední karta za F
    out.push(
      rect(
        X(Math.max(xa, cardX0)),
        Y(cardTopY),
        (xb - Math.max(xa, cardX0)) * s,
        (cardTopY - y0) * s,
        CARD,
        INK,
        0.3,
      ),
    );
    out.push(text(X(n.cx + 6), Y(cardTopY - 4), 'přední karta (1 karta)', 2.5, 'start'));
    out.push(poly(fOutline(X, Y), P1, P1_DARK, 0.4));
    // výsečník Ø 10 a tečné řezy
    out.push(
      circle(X(n.cx), Y(n.centerY), n.radius * s, 'none', ACCENT, 0.4, ' stroke-dasharray="1 0.7"'),
    );
    out.push(circle(X(n.cx), Y(n.centerY), 0.5, ACCENT));
    out.push(dim(X(n.x0), Y(n.topY) - 3, X(n.x1), Y(n.topY) - 3, `${cz(n.x1 - n.x0, 0)} mm`));
    out.push(dim(X(n.x1) + 12, Y(n.topY), X(n.x1) + 12, Y(n.bottomY), `${cz(n.depthMm, 0)} mm`));
    out.push(line(X(n.x1), Y(n.topY), X(n.x1) + 13.5, Y(n.topY), GUIDE, 0.2, '0.6 0.5'));
    out.push(line(X(n.cx), Y(n.bottomY), X(n.x1) + 13.5, Y(n.bottomY), GUIDE, 0.2, '0.6 0.5'));
    out.push(
      dim(X(xa + 4), Y(n.bottomY), X(xa + 4), Y(cardTopY), `${cz(n.exposedCardMm[0], 1)} mm`),
    );
    out.push(line(X(xa + 3), Y(n.bottomY), X(n.cx), Y(n.bottomY), GUIDE, 0.2, '0.6 0.5'));
    out.push(
      text(
        X(xa) + 1,
        Y(y0 + 9),
        `výsečník Ø ${cz(2 * n.radius, 0)}, boky nožem k tečnám,`,
        2.5,
        'start',
        '#ffffff',
      ),
    );
    out.push(
      text(
        X(xa) + 1,
        Y(y0 + 9) + 3.6,
        `rohy R${cz(n.cornerRadiusMm, 0)} brusným papírem`,
        2.5,
        'start',
        '#ffffff',
      ),
    );
    out.push(text(X(xa) + 1, Y(y0 + 2), 'F (přední stěna)', 2.5, 'start', '#ffffff'));
  }

  // --- pravý panel: zavřené víčko, jazýček přes výřez ---
  {
    const { X, Y } = panel(90);
    out.push(text(X((xa + xb) / 2), 14, 'víčko zavřené (stav B)', 3, 'middle', GUIDE));
    out.push(poly(fOutline(X, Y), P1, P1_DARK, 0.4));
    // pás víčka nad hranou pásu a jazýček s vydutým napojením R4
    const edge = B.bandEdgeY;
    const rj = spec.tongueJoinRadiusMm;
    const [t0, t1] = L.tongueX;
    const lid: Pt[] = [
      [X(xa), Y(L.heightMm)],
      [X(xa), Y(edge)],
      [X(t0 - rj), Y(edge)],
      ...arcPts(t0 - rj, edge - rj, rj, 90, 0, 10).map(([x, y]): Pt => [X(x), Y(y)]),
      [X(t0), Y(y0)],
      [X(t1), Y(y0)],
      [X(t1), Y(edge - rj)],
      ...arcPts(t1 + rj, edge - rj, rj, 180, 90, 10).map(([x, y]): Pt => [X(x), Y(y)]),
      [X(xb), Y(edge)],
      [X(xb), Y(L.heightMm)],
    ];
    out.push(poly(lid, '#b98a5f', P1_DARK, 0.4, true, ' fill-opacity="0.93"'));
    // výřez pod jazýčkem čárkovaně
    out.push(
      poly(fOutline(X, Y).slice(2, -2), 'none', '#ffffff', 0.4, false, ' stroke-dasharray="1 0.7"'),
    );
    out.push(
      dim(
        X(t0),
        Y(n.topY + 2.5),
        X(n.x0 - n.cornerRadiusMm),
        Y(n.topY + 2.5),
        `${cz(n.cornerToTongueMm, 0)}`,
      ),
    );
    out.push(
      dim(
        X(n.x1 + n.cornerRadiusMm),
        Y(n.topY + 2.5),
        X(t1),
        Y(n.topY + 2.5),
        `${cz(n.cornerToTongueMm, 0)}`,
      ),
    );
    out.push(
      text(
        X((t0 + t1) / 2),
        Y(y0 + 9),
        `jazýček ${cz(spec.tongueWidthMm, 0)} mm`,
        2.6,
        'middle',
        '#ffffff',
      ),
    );
    out.push(text(X(xa) + 1, Y(edge) + 4, 'hrana pásu víčka', 2.4, 'start', '#ffffff'));
  }
  out.push(
    text(
      80,
      96.5,
      `Rohy výřezu jsou ${cz(n.cornerToTongueMm, 0)} mm od boků jazýčku (boční tolerance 3 + rezerva 1): jazýček výřez přikryje i posunutý o 3 mm.`,
      2.5,
      'middle',
      GUIDE,
    ),
  );
  return svgWrap(out);
}

const illustrations: [string, () => string][] = [
  ['rez-a-vlozeni', buildRezSvg],
  ['vlozka-dna', buildVlozkaDnaSvg],
  ['zaves-pres-obsah', buildZavesPresObsahSvg],
  ['jazycek-magnet', buildJazycekMagnetSvg],
  ['zada-okenka', buildZadaOkenkaSvg],
  ['vyrez-pro-palec', buildVyrezProPalecSvg],
];

function main(): void {
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  for (const [name, build] of illustrations) {
    const svg = build();
    const path = resolve(outDir, `penezenka-vicko-ilustrace-${name}.svg`);
    writeFileSync(path, svg, 'utf8');
    console.log(`Zapsáno ${path}`);
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) main();
