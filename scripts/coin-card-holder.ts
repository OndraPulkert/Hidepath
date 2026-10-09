/**
 * Vykreslí 1:1 střih pouzdra na karty s vsazenou mincí: papírový model a pás (A4 na šířku), kapsa
 * s formou (A4 na výšku), postup skládání a všechno v jednom PDF.
 *
 *   pnpm pattern:coin-holder                 # mince 50 Kč, 27,5 mm (výchozí od v4.10)
 *   pnpm pattern:coin-holder --coin 40       # mince 40 mm z předlohy („decision coin“, i --coin decision)
 *   pnpm pattern:coin-holder --coin 20kc     # další české mince: 20kc/10kc/5kc, nebo průměr v mm
 *   pnpm pattern:coin-holder --window 18     # průměr okna = výsečník, který máš (jinak odvozeno)
 *   pnpm pattern:coin-holder --thickness 1.2 # kůže těla 1,2 mm (bez ztenčení ohybu)
 *   pnpm pattern:coin-holder --grommet       # volitelná průchodka ve vnitřním panelu (od v4.11 není ve výchozím)
 *
 * Varianty jdou do vlastních souborů (…-mince-40mm, …-okno-18mm, …-kuze-1-2mm, …-pruchodka); list postupu
 * se generuje jen pro výchozí střih a pro kůži 1,2 mm (pouzdro-mince-postup-kuze-1-2mm, výchozí v aplikaci). Neznámý přepínač je chyba, aby překlep nepřepsal verzované soubory.
 *
 * Výstup: docs/generated/pouzdro-mince-sablona.svg/.pdf (pás, A4 NA ŠÍŘKU),
 * pouzdro-mince-kapsa.svg/.pdf (kapsa a forma, A4 na výšku) a pouzdro-mince-postup.svg/.pdf. Geometrie je celá
 * v src/lib/geometry/coin-card-holder.ts; tady se jen kreslí.
 *
 * NÁVRH: rozměry odvozené z karty a mince, ne odměřené z hotového výrobku. Před řezáním kůže
 * vystřihnout z papíru, složit a zkusit důlek na odřezku (viz docs/zadani/pouzdro-mince.md).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  A4_SHEET,
  DEFAULT_COIN_CARD_HOLDER,
  LEGEND_HEIGHT_MM,
  NAMED_COINS,
  type CoinCardHolderLayout,
  type CoinCardHolderSpec,
  assertCoinCardHolder,
  A4_PORTRAIT,
  SNAP_POST_RADIUS_MM,
  foldSkiveFor,
  GROMMET_FLANGE_MM,
  CALIBRATION_GAP_MM,
  SEAM_LABEL_GAP_MM,
  SHEET_CAPTION_MM,
  SHEET_TITLE_GAP_MM,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';

import { PRICK_INSET_MM, PRICK_R } from './coin-card-holder-practice.ts';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');

const INK = '#2b2b2b';
const GUIDE = '#7a7a7a';
const ACCENT = '#a2471f';
/** Lepené plochy: zelená šrafa jako na listech Víčka. */
const GLUE = '#2e7d32';
/** Značka otvoru stehu: poloměr tečky v mm. Testy podle něj tečky rozeznávají. */
const DOT_R = 0.45;

type Anchor = 'start' | 'middle' | 'end';

/** „1 kartu“, „2–4 karty“, „5 karet“. */
const cardsWord = (n: number): string => `${n} ${n === 1 ? 'kartu' : n <= 4 ? 'karty' : 'karet'}`;

/** Obdélník se zaoblenými rohy; volitelně jiné poloměry nahoře a dole. */
function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rTop: number,
  rBottom: number = rTop,
): string {
  const rt = Math.min(rTop, w / 2, h / 2);
  const rb = Math.min(rBottom, w / 2, h / 2);
  /** Roh o poloměru r do bodu (x, y); nulový poloměr = rovná čára. */
  const corner = (r: number, x2: number, y2: number): string =>
    r > 0 ? `A${f(r)} ${f(r)} 0 0 1 ${f(x2)} ${f(y2)} ` : `L${f(x2)} ${f(y2)} `;
  return (
    `M${f(x + rt)} ${f(y)} L${f(x + w - rt)} ${f(y)} ${corner(rt, x + w, y + rt)}` +
    `L${f(x + w)} ${f(y + h - rb)} ${corner(rb, x + w - rb, y + h)}` +
    `L${f(x + rb)} ${f(y + h)} ${corner(rb, x, y + h - rb)}` +
    `L${f(x)} ${f(y + rt)} ${corner(rt, x + rt, y)}Z`
  );
}

const cut = (d: string): string =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="0.3"/>`;
const guide = (d: string, dash = '2 1.5'): string =>
  `<path d="${d}" fill="none" stroke="${GUIDE}" stroke-width="0.2" stroke-dasharray="${dash}"/>`;
const circle = (cx: number, cy: number, r: number, stroke = INK, dash?: string): string =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${stroke}" ` +
  `stroke-width="${stroke === INK ? 0.3 : 0.2}"` +
  (dash ? ` stroke-dasharray="${dash}"` : '') +
  '/>';
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
const cross = (cx: number, cy: number, s = 1.5): string =>
  `<path d="M${f(cx - s)} ${f(cy)} L${f(cx + s)} ${f(cy)} M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy + s)}" stroke="${INK}" stroke-width="0.25"/>`;
const dot = (x: number, y: number): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${DOT_R}" fill="${INK}"/>`;
/** Kroužek k propíchnutí šídlem – stejný symbol jako na cvičném proužku (lekce 4). */
const prick = (x: number, y: number, kind: string): string =>
  `<circle class="prick" data-mark="${kind}" cx="${f(x)}" cy="${f(y)}" r="${PRICK_R}" fill="none" stroke="${INK}" stroke-width="0.25"/>`;

/** Tečky stehu podél úsečky od (x0,y0) k (x1,y1) s roztečí `pitch`, první tečka v bodě 0. */
function stitchDots(x0: number, y0: number, x1: number, y1: number, pitch: number): string {
  if (!(pitch > 0)) throw new Error(`Rozteč stehu musí být kladná, je ${pitch}.`);
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.floor(len / pitch + 1e-9);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const out: string[] = [];
  for (let i = 0; i <= n; i++) out.push(dot(x0 + ux * i * pitch, y0 + uy * i * pitch));
  return out.join('');
}

/**
 * Šev kapsy s mincí ve tvaru U: svislé boky od `topY` dolů, zaoblené dolní rohy, rovné dno.
 * Tečky jsou rozmístěné **od středu dna** symetricky na obě strany, aby oba boky měly stejný
 * počet otvorů a poslední otvor na obou stranách ležel stejně vysoko.
 */
function pocketSeam(
  x0: number,
  x1: number,
  topY: number,
  bottomY: number,
  rIn: number,
  pitch: number,
): { path: string; dots: string; holes: number } {
  const path =
    `M${f(x0)} ${f(topY)} L${f(x0)} ${f(bottomY - rIn)} ` +
    `A${f(rIn)} ${f(rIn)} 0 0 0 ${f(x0 + rIn)} ${f(bottomY)} L${f(x1 - rIn)} ${f(bottomY)} ` +
    `A${f(rIn)} ${f(rIn)} 0 0 0 ${f(x1)} ${f(bottomY - rIn)} L${f(x1)} ${f(topY)}`;
  const cx = (x0 + x1) / 2;
  const straightBottom = cx - (x0 + rIn);
  const arc = (Math.PI / 2) * rIn;
  const side = bottomY - rIn - topY;
  const half = straightBottom + arc + side;
  const pointAt = (s: number, dir: 1 | -1): [number, number] => {
    if (s <= straightBottom) return [cx - dir * s, bottomY];
    if (s <= straightBottom + arc) {
      const a = (s - straightBottom) / rIn;
      const ccx = x0 + rIn;
      const ccy = bottomY - rIn;
      const px = ccx - rIn * Math.sin(a);
      const py = ccy + rIn * Math.cos(a);
      return dir === 1 ? [px, py] : [2 * cx - px, py];
    }
    const up = s - straightBottom - arc;
    return [dir === 1 ? x0 : x1, bottomY - rIn - up];
  };
  const n = Math.floor(half / pitch + 1e-9);
  const dots: string[] = [dot(cx, bottomY)];
  for (let i = 1; i <= n; i++) {
    const [ax, ay] = pointAt(i * pitch, 1);
    const [bx, by] = pointAt(i * pitch, -1);
    dots.push(dot(ax, ay), dot(bx, by));
  }
  return { path, dots: dots.join(''), holes: 2 * n + 1 };
}

/**
 * Zelená šrafa lepené plochy (vektorové čáry pod 45°, ne <pattern>, který Chromium v PDF rastruje),
 * oříznutá cestou `clipD`. Obrys plochy: `borderD` (výchozí = ořezová cesta).
 */
function glueHatch(
  id: string,
  clipD: string,
  box: { x: number; y: number; w: number; h: number },
  borderD: string = clipD,
): string {
  const { x: x0, y: y0, w, h } = box;
  const segs: string[] = [];
  for (let c = x0 - (y0 + h); c <= x0 + w - y0; c += 1.2) {
    const ya = Math.max(y0, x0 - c);
    const yb = Math.min(y0 + h, x0 + w - c);
    if (yb - ya > 0.05) segs.push(`M${f(ya + c)} ${f(ya)} L${f(yb + c)} ${f(yb)}`);
  }
  return (
    `<defs><clipPath id="${id}"><path d="${clipD}"/></clipPath></defs>` +
    `<g class="glue" clip-path="url(#${id})">` +
    `<path d="${segs.join(' ')}" stroke="${GLUE}" stroke-width="0.15" stroke-opacity="0.7" fill="none"/>` +
    `<path d="${borderD}" fill="none" stroke="${GLUE}" stroke-width="0.25"/>` +
    '</g>'
  );
}

/**
 * Lepený pruh kapsy G1 (tvar U): mezi obrysem kapsy a čárou švu, po bocích od začátku švu dolů
 * a přes dno. Nahoře (otevřená hrana, kudy se zasouvá mince) se nelepí. Stejná geometrie jako
 * `pocketSeam` (vnitřní poloměr max(0,5; R − odsazení švu)).
 */
export function pocketGlueBand(
  x0: number,
  y0: number,
  w: number,
  h: number,
  spec: CoinCardHolderSpec,
  seamTopMm: number,
): string {
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const ri = Math.max(0.5, rc - so);
  const ro = ri + so;
  const top = y0 + seamTopMm;
  const x1 = x0 + w;
  const yb = y0 + h;
  return (
    `M${f(x0)} ${f(top)} L${f(x0)} ${f(yb - ro)} A${f(ro)} ${f(ro)} 0 0 0 ${f(x0 + ro)} ${f(yb)} ` +
    `L${f(x1 - ro)} ${f(yb)} A${f(ro)} ${f(ro)} 0 0 0 ${f(x1)} ${f(yb - ro)} L${f(x1)} ${f(top)} ` +
    `L${f(x1 - so)} ${f(top)} L${f(x1 - so)} ${f(yb - so - ri)} ` +
    `A${f(ri)} ${f(ri)} 0 0 1 ${f(x1 - so - ri)} ${f(yb - so)} L${f(x0 + so + ri)} ${f(yb - so)} ` +
    `A${f(ri)} ${f(ri)} 0 0 1 ${f(x0 + so)} ${f(yb - so - ri)} L${f(x0 + so)} ${f(top)} Z`
  );
}

/** Text s bílým lemem, aby byl čitelný přes šrafu. */
const haloText = (x: number, y: number, s: string, size: number, fill = GLUE): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" ` +
  `text-anchor="middle" fill="${fill}" stroke="#ffffff" stroke-width="0.5" paint-order="stroke">${s}</text>`;

/** Vzorek šrafy do legendy (7 × 2,2 mm) s popiskem vpravo. */
function glueLegend(x: number, cy: number, label: string, size = 2.2): string {
  const d = `M${f(x)} ${f(cy - 1.1)} H${f(x + 7)} V${f(cy + 1.1)} H${f(x)} Z`;
  return (
    glueHatch(`glue-legend-${f(x).replace('.', '-')}-${f(cy).replace('.', '-')}`, d, {
      x,
      y: cy - 1.1,
      w: 7,
      h: 2.2,
    }) + text(x + 8.5, cy + 0.8, label, size, 'start', GLUE)
  );
}

/**
 * O kolik zkrátit čáru švu dna na každém konci, aby nevyčnívala za zaoblený roh pásu
 * (roh R, šev ve vzdálenosti stitchOffset od hrany).
 */
function seamLineInset(spec: CoinCardHolderSpec): number {
  const rc = spec.cornerRadiusMm;
  const so = spec.stitchOffsetMm;
  return so >= rc ? 0 : rc - Math.sqrt(rc * rc - (rc - so) * (rc - so));
}

/**
 * Obrys rozloženého pásu: jazyk u levého konce, výřez na prst jako oblouk U přes pásmo ohybu A,
 * zaoblené volné rohy. `X`, `Y` mapují soustavu pásu na stránku (včetně zrcadlení pro jazyk
 * vlevo), `k` je měřítko poloměrů, `mirror` prohodí směr oblouků.
 */
function stripOutline(
  L: CoinCardHolderLayout,
  rc: number,
  X: (x: number) => number,
  Y: (y: number) => number,
  k: number,
  mirror: boolean,
): string {
  const cw = mirror ? 0 : 1;
  const ccw = mirror ? 1 : 0;
  const P = (x: number, y: number): string => `${f(X(x))} ${f(Y(y))}`;
  /** Oblouk o poloměru r do bodu (x, y); nulový poloměr = rovná čára (žádné degenerované A0). */
  const arc = (r: number, sweep: number, x: number, y: number): string =>
    r > 0 ? `A${f(r * k)} ${f(r * k)} 0 0 ${sweep} ${P(x, y)} ` : `L${P(x, y)} `;
  const rt = L.tabEndRadiusMm;
  const S = L.scoopRadiusMm;
  const H = L.panelHeightMm;
  const SL = L.stripLengthMm;
  const top = -L.tabLengthMm;
  const straightEnd = rt < L.tabX1Mm / 2 - 1e-9;
  return (
    `M${P(0, top + rt)} ` +
    arc(rt, cw, rt, top) +
    (straightEnd ? `L${P(L.tabX1Mm - rt, top)} ` : '') +
    arc(rt, cw, L.tabX1Mm, top + rt) +
    // Hrana jazyka přejde plynule (svisle tečně) do výkusu zadního panelu: čtvrtelipsa se středem
    // v rohu u ohybu A, poloosy backScoopRx × R. Pak dno přes ohyb A a čtvrtkruh R na předku.
    `L${P(L.scoopStartXMm, 0)} ` +
    `A${f(L.backScoopRxMm * k)} ${f(S * k)} 0 0 ${ccw} ${P(L.backX1Mm, S)} ` +
    `L${P(L.frontX0Mm, S)} ` +
    (L.scoopCornerRadiusMm > 0
      ? (() => {
          // Výřez přejde do horní hrany zaoblením r: bod dotyku na kružnici výřezu, pak konvexní oblouk.
          const r = L.scoopCornerRadiusMm;
          const cx = L.scoopCornerEndXMm;
          const px = L.frontX0Mm + ((cx - L.frontX0Mm) * S) / (S + r);
          const py = (r * S) / (S + r);
          return arc(S, ccw, px, py) + arc(r, cw, cx, 0);
        })()
      : arc(S, ccw, L.scoopEndXMm, 0)) +
    `L${P(SL - rc, 0)} ` +
    arc(rc, cw, SL, rc) +
    `L${P(SL, H - rc)} ` +
    arc(rc, cw, SL - rc, H) +
    `L${P(rc, H)} ` +
    arc(rc, cw, 0, H - rc) +
    'Z'
  );
}

/**
 * Jeden panel při pohledu na hotové pouzdro: obdélník se zaoblenými rohy a čtvrtkruhovým
 * výřezem na prst v horním rohu (`scoop`: 'left' = zepředu, 'right' = zezadu, null = bez výřezu).
 */
function panelPath(
  L: CoinCardHolderLayout,
  rc: number,
  ox: number,
  oy: number,
  k: number,
  scoop: 'left' | 'right' | null,
): string {
  // Zepředu čtvrtkruh R, zezadu čtvrtelipsa backScoopRx × R (hrana jazyka přejde plynule).
  const RX = (scoop === 'right' ? L.backScoopRxMm : L.scoopRadiusMm) * k;
  const W = L.panelWidthMm * k;
  const H = L.panelHeightMm * k;
  const r = rc * k;
  const S = L.scoopRadiusMm * k;
  const topLeft =
    scoop === 'left'
      ? `M${f(ox)} ${f(oy + S)} A${f(S)} ${f(S)} 0 0 0 ${f(ox + S)} ${f(oy)} `
      : `M${f(ox)} ${f(oy + r)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + r)} ${f(oy)} `;
  const topRight =
    scoop === 'right'
      ? `L${f(ox + W - RX)} ${f(oy)} A${f(RX)} ${f(S)} 0 0 0 ${f(ox + W)} ${f(oy + S)} `
      : `L${f(ox + W - r)} ${f(oy)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W)} ${f(oy + r)} `;
  return (
    topLeft +
    topRight +
    `L${f(ox + W)} ${f(oy + H - r)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W - r)} ${f(oy + H)} ` +
    `L${f(ox + r)} ${f(oy + H)} A${f(r)} ${f(r)} 0 0 1 ${f(ox)} ${f(oy + H - r)} Z`
  );
}

/**
 * List PÁS (A4 **na šířku**, 1:1): rozložený pás (tři panely, jazyk, výřez,
 * šev dna); kapsa s mincí a otvor formy jsou na listu 2. Soustava pásu: x = 0 levý konec (u jazyka), y = 0 horní otevřená hrana.
 */
export function buildCoinHolderSheetSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const { widthMm: W, heightMm: H, marginMm: m } = A4_SHEET;
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const mirror = spec.tabSide === 'left';
  const out: string[] = [];

  const sx = m;
  const sy = m + L.tabLengthMm;
  const X = (x: number): number => sx + (mirror ? L.stripLengthMm - x : x);
  const Y = (y: number): number => sy + y;
  const S = L.scoopRadiusMm;

  /* --- ztenčení v ohybech (šrafa): pásmo ohybu + okraj na každou stranu --- */
  if (spec.foldSkiveThicknessMm !== null) {
    for (const z of skiveZones(L, spec)) {
      const x0 = Math.min(X(z.x0), X(z.x1));
      const y0 = Y(z.y0);
      const w = z.x1 - z.x0;
      const h = z.y1 - z.y0;
      // Šrafa jako skutečné čáry pod 45° oříznuté na obdélník (vzor <pattern> Chromium v PDF
      // rastruje a tiskne se rozmazaně).
      const step = 2;
      const segs: string[] = [];
      for (let c = x0 - (y0 + h); c <= x0 + w - y0; c += step) {
        const ya = Math.max(y0, x0 - c);
        const yb = Math.min(y0 + h, x0 + w - c);
        if (yb - ya > 0.05) segs.push(`M${f(ya + c)} ${f(ya)} L${f(yb + c)} ${f(yb)}`);
      }
      out.push(`<path d="${segs.join(' ')}" stroke="#b9c3bc" stroke-width="0.3" fill="none"/>`);
      out.push(
        `<rect class="skive-zone" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="#b9c3bc" stroke-width="0.2"/>`,
      );
    }
  }

  out.push(cut(stripOutline(L, rc, X, Y, 1, mirror)));

  /* --- ohyby --- */
  const foldLine = (x: number, y0: number, y1: number): void => {
    out.push(guide(`M${f(X(x))} ${f(Y(y0))} L${f(X(x))} ${f(Y(y1))}`, '3 2'));
  };
  foldLine(L.backX1Mm, S, L.panelHeightMm);
  foldLine(L.frontX0Mm, S, L.panelHeightMm);
  out.push(
    text(
      X((L.backX1Mm + L.frontX0Mm) / 2),
      Y(-3),
      `OHYB A ${cz(L.foldBackFrontMm)}`,
      2.2,
      'middle',
      GUIDE,
    ),
  );
  if (L.innerX0Mm !== null) {
    foldLine(L.frontX1Mm, 0, L.panelHeightMm);
    foldLine(L.innerX0Mm, 0, L.panelHeightMm);
    out.push(
      text(
        X((L.frontX1Mm + L.innerX0Mm) / 2),
        Y(-3),
        `OHYB B ${cz(L.foldFrontInnerMm)}`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    // Šablona leží na líci; na rub (kde se ztenčuje) se šrafa musí přenést.
    if (spec.foldSkiveThicknessMm !== null) {
      const cB = X((L.frontX1Mm + L.innerX0Mm) / 2);
      [
        `ztenčení z rubu na ${cz(spec.foldSkiveThicknessMm)} mm:`,
        'kroužky na okrajích šrafy propíchnout šídlem,',
        `na rubu spojit (ohyb + ${cz(spec.foldSkiveMarginMm)} mm na obě strany)`,
      ].forEach((t, i) => out.push(text(cB, Y(-16 + i * 3), t, 2.1, 'middle', GUIDE)));
    }
  }

  /* --- šev dna: čára přes celý pás, tečky na všech třech panelech (po přeložení lícují) --- */
  const seamY = L.bottomSeamYMm;
  const seamInset = seamLineInset(spec);
  out.push(
    guide(
      `M${f(X(seamInset))} ${f(Y(seamY))} L${f(X(L.stripLengthMm - seamInset))} ${f(Y(seamY))}`,
      '0.8 1.2',
    ),
  );
  const run = (L.bottomSeamHoles - 1) * spec.stitchPitchMm;
  // Na předním panelu vystředěné, na zadní a vnitřní panel zrcadlené přes střed ohybu: po složení
  // padnou otvor na otvor a dají se prosekat naplocho jako u předlohy.
  const seamX0 = L.frontX0Mm + (L.panelWidthMm - run) / 2;
  const cA = (L.backX1Mm + L.frontX0Mm) / 2;
  const seamPanels: [number, number][] = [
    [seamX0, seamX0 + run],
    [2 * cA - seamX0 - run, 2 * cA - seamX0],
  ];
  if (L.innerX0Mm !== null) {
    const cB = (L.frontX1Mm + L.innerX0Mm) / 2;
    seamPanels.push([2 * cB - seamX0 - run, 2 * cB - seamX0]);
  }
  for (const [a, b] of seamPanels) {
    out.push(stitchDots(X(a), Y(seamY), X(b), Y(seamY), spec.stitchPitchMm));
  }
  out.push(
    text(
      X(L.frontX0Mm + L.panelWidthMm / 2),
      Y(L.panelHeightMm + SEAM_LABEL_GAP_MM),
      `ŠEV DNA ${cz(so)} mm od hrany · ${L.bottomSeamHoles} otvorů na panel · prosekat naplocho, po složení lícují`,
      2.2,
      'middle',
      GUIDE,
    ),
  );

  /* --- výřez na prst (popisek v odpadu uvnitř U) --- */
  const scoopCx = X((L.backX1Mm + L.frontX0Mm) / 2);
  out.push(text(scoopCx, Y(4), `VÝŘEZ NA PRST R${cz(S)}`, 2.4, 'middle', GUIDE));
  out.push(text(scoopCx, Y(7.6), `odkryje ${cz(L.cardExposedMm)} mm karty`, 2.1, 'middle', GUIDE));

  /* --- jazyk: druk, čára zkrácení --- */
  const sr = spec.snapDiameterMm / 2;
  const labelX = X(L.tabX1Mm) + (mirror ? -2 : 2);
  const anchor: Anchor = mirror ? 'end' : 'start';
  out.push(circle(X(L.snapXTabMm), Y(L.snapYTabMm), sr, ACCENT, '1.5 1'));
  out.push(cross(X(L.snapXTabMm), Y(L.snapYTabMm)));
  out.push(text(labelX, Y(L.snapYTabMm) - 0.5, 'druk – klobouček', 2.1, anchor, ACCENT));
  out.push(
    text(
      labelX,
      Y(L.snapYTabMm) + 2.4,
      'poloha orientační – obtisknout z patice při zkoušce',
      1.9,
      anchor,
      ACCENT,
    ),
  );
  const trimY = Y(-L.tabNominalLengthMm);
  out.push(guide(`M${f(X(L.tabX0Mm))} ${f(trimY)} L${f(X(L.tabX1Mm))} ${f(trimY)}`, '1 1'));
  out.push(text(labelX, trimY - 1.5, 'orientační konec jazyka', 1.9, anchor, GUIDE));
  out.push(
    text(
      labelX,
      trimY + 1.2,
      `zkrátit ${cz(spec.tabBeyondSnapMm)} mm za střed osazeného kloboučku, rohy R${cz(L.tabEndRadiusMm)}`,
      1.9,
      anchor,
      GUIDE,
    ),
  );
  out.push(text(X(L.tabX1Mm / 2), Y(L.snapYTabMm + sr + 4.5), 'JAZYK', 2.4, 'middle'));

  /* --- panely: popisky --- */
  const label = (x: number, y: number, lines: [string, ...string[]], size = 2.8): void => {
    out.push(text(X(x), Y(y), lines[0], size, 'middle'));
    lines
      .slice(1)
      .forEach((t, i) => out.push(text(X(x), Y(y + 3.4 + i * 3), t, 2.2, 'middle', GUIDE)));
  };
  label(L.panelWidthMm / 2, L.panelHeightMm / 2, [
    'ZADNÍ PANEL',
    `${cz(L.panelWidthMm)} × ${cz(L.panelHeightMm)} mm`,
    'motiv / ražení na tuto stranu',
  ]);
  if (L.innerX0Mm !== null) {
    label(L.innerX0Mm + L.panelWidthMm / 2, L.panelHeightMm / 2, [
      'VNITŘNÍ PANEL',
      'dělí karty (vepředu)',
      'a bankovky (vzadu)',
    ]);
  }

  /* --- přední panel: druk, kapsa --- */
  out.push(circle(X(L.snapXFrontMm), Y(L.snapYFrontMm), sr, ACCENT, '1.5 1'));
  out.push(cross(X(L.snapXFrontMm), Y(L.snapYFrontMm)));
  out.push(
    text(X(L.snapXFrontMm), Y(L.snapYFrontMm + sr + 3), 'druk – patice', 2.1, 'middle', ACCENT),
  );
  const pxs = L.frontX0Mm + L.pocketXMm;
  const pys = L.pocketYMm;
  out.push(
    guide(
      roundedRect(
        Math.min(X(pxs), X(pxs + L.pocketWidthMm)),
        Y(pys),
        L.pocketWidthMm,
        L.pocketHeightMm,
        spec.pocketTopRadiusMm,
        rc,
      ),
      '1 1',
    ),
  );
  const pcx = X(pxs + L.pocketWidthMm / 2);
  const pcy = Y(pys + L.pocketHeightMm / 2);
  out.push(text(pcx, pcy - 8, 'PŘEDNÍ PANEL', 2.8, 'middle'));
  out.push(text(pcx, pcy - 4.6, 'sem přišít kapsu s mincí (na líc)', 2.2, 'middle', GUIDE));
  // Dva řádky: u mince 50 Kč je kapsa jen 42,5 mm široká a jeden řádek by přesahoval obrys.
  out.push(text(pcx, pcy - 1.6, `${cz(L.pocketYMm)} mm od horní hrany,`, 2.2, 'middle', GUIDE));
  out.push(text(pcx, pcy + 1.2, `${cz(L.pocketXMm)} mm od boků`, 2.2, 'middle', GUIDE));
  out.push(text(pcx, pcy + 4.6, 'otevřená hrana kapsy nahoru', 2.2, 'middle', GUIDE));

  /* --- lepení: G1 kapsa na líc předního panelu, G2 a G3 pruh dna (strana u pruhu) --- */
  const pocketLeft = Math.min(X(pxs), X(pxs + L.pocketWidthMm));
  const band = pocketGlueBand(
    pocketLeft,
    Y(pys),
    L.pocketWidthMm,
    L.pocketHeightMm,
    spec,
    L.pocketSeamTopMm,
  );
  out.push(
    glueHatch('glue-g1', band, {
      x: pocketLeft,
      y: Y(pys),
      w: L.pocketWidthMm,
      h: L.pocketHeightMm,
    }),
  );
  out.push(haloText(pcx, Y(pys + L.pocketHeightMm - so / 2) + 0.6, 'G1 · lepit na LÍC', 1.8));
  out.push(haloText(pcx, Y(pys) + 4, 'NElepit – sem se zasouvá mince', 1.8, GUIDE));
  // Pruh dna 0 až čára švu na každém panelu, oříznutý obrysem pásu (zaoblené rohy).
  const outline = stripOutline(L, rc, X, Y, 1, mirror);
  const bottomStrips: [number, number, string][] = [
    [0, L.backX1Mm, 'G3 · lepit na RUBU zadního'],
    [L.frontX0Mm, L.frontX1Mm, 'G2 · lepit na RUBU předního'],
  ];
  if (L.innerX0Mm !== null) {
    bottomStrips.push([L.innerX0Mm, L.stripLengthMm, 'G2 na RUBU · G3 na LÍCI vnitřního']);
  }
  bottomStrips.forEach(([a, b, t], i) => {
    const x0 = Math.min(X(a), X(b));
    const w = b - a;
    const y0 = Y(seamY);
    const h = L.panelHeightMm - seamY;
    out.push(
      glueHatch(
        `glue-dno-${i + 1}`,
        outline,
        { x: x0, y: y0, w, h },
        `M${f(x0)} ${f(y0)} H${f(x0 + w)} V${f(y0 + h)} H${f(x0)} Z`,
      ),
    );
    out.push(haloText(x0 + w / 2, y0 + h / 2 + 0.6, t, 1.8));
  });

  /* --- kroužky k propíchnutí (nad šrafami, aby byly vidět) --- */
  for (const p of bandPrickPoints(L, spec)) out.push(prick(X(p.x), Y(p.y), p.kind));
  out.push(
    text(
      pcx,
      Y(pys + L.pocketHeightMm) + 3.4,
      'kroužky v rozích = propíchnout, kapsa je zakryje',
      1.9,
      'middle',
      GUIDE,
    ),
  );

  /* --- průchodka --- */
  if (L.grommetXMm !== null && L.grommetYMm !== null) {
    out.push(circle(X(L.grommetXMm), Y(L.grommetYMm), spec.grommetHoleMm / 2));
    out.push(cross(X(L.grommetXMm), Y(L.grommetYMm), 1));
    out.push(
      text(
        X(L.grommetXMm),
        Y(L.grommetYMm + spec.grommetHoleMm / 2 + 3.5),
        `průchodka Ø ${cz(spec.grommetHoleMm)}`,
        1.9,
        'middle',
        GUIDE,
      ),
    );
  }

  /* --- kalibrace a legenda --- */
  const calX = m;
  const calY = H - m - LEGEND_HEIGHT_MM - CALIBRATION_GAP_MM;
  out.push(
    `<path d="M${f(calX)} ${f(calY - 2)} V${f(calY + 2)} M${f(calX)} ${f(calY)} H${f(calX + 50)} M${f(calX + 50)} ${f(calY - 2)} V${f(calY + 2)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(
    text(
      calX + 53,
      calY + 1,
      'KONTROLA MĚŘÍTKA: tato úsečka musí měřit přesně 50 mm',
      2.4,
      'start',
    ),
  );
  out.push(
    glueLegend(
      calX + 140,
      calY,
      `šrafa = kontaktní lepidlo jen sem: G1 kapsa (líc), G2 a G3 dno 0–${cz(so)} mm (strana je u pruhu)`,
      2.1,
    ),
  );
  const front = spec.tabSide === 'right' ? 'vpravo' : 'vlevo';
  const back = spec.tabSide === 'right' ? 'vlevo' : 'vpravo';
  const legend = [
    `POUZDRO NA KARTY S VSAZENOU MINCÍ – LIST PÁS. Tisk na A4 NA ŠÍŘKU na 100 % (bez „přizpůsobit stránce“). Kapsa s mincí a forma jsou na listu KAPSA. NÁVRH k ověření na papíru.`,
    `Karty ${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)} (${spec.cardsCount} ks) vepředu, bankovky složené napůl vzadu, mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm.`,
    `Jeden pás: ZADNÍ + ohyb A + PŘEDNÍ + ohyb B + VNITŘNÍ panel. Po složení jsou obě boční hrany OHYBY, šije se jen dno (skrz všechny vrstvy), horní hrana zůstává otevřená.`,
    `PÁS PŘILEPIT PÁSKOU NA LÍC, propíchnout značky a řezat skrz papír po čáře (lekce 5) – přední panel je nakreslený tak, jak bude vidět. Jazyk vyjde zepředu ${front} (zezadu ${back}), výřez na prst naproti němu.`,
    `Plná čára = řez, čárkovaně = ohyb, kroužky = propíchnout šídlem (na rubu spojit), tečky = otvory dna (vidličky přesně ${cz(spec.stitchPitchMm)} mm; naplocho: přední panel z líce, zadní a vnitřní z rubu)${spec.foldSkiveThicknessMm !== null ? `, šrafa = ztenčit na ${cz(spec.foldSkiveThicknessMm)} mm z rubu` : '; ohyby se neztenčují'}.`,
    `Pořadí: 1 pás · 2–3 kapsa (list KAPSA) · 4 přišít kapsu, osadit patici druku${L.grommetXMm !== null ? ' a průchodku' : ''} NAPLOCHO · 5 složit (vnitřní za přední, zadní přes vše) · 6 slepit a prošít dno`,
    `· 7 klobouček podle obtisku patice se vším obsahem, pak jazyk zkrátit ${cz(spec.tabBeyondSnapMm)} mm za klobouček a zaoblit · 8 srazit a zaleštit hrany (vnitřní předem).`,
  ];
  const legendLine = 3.2;
  let ly = H - m - LEGEND_HEIGHT_MM + 4;
  for (const line of legend) {
    out.push(text(m, ly, line, 2.2, 'start', GUIDE));
    ly += legendLine;
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/**
 * Pásma ke ztenčení v soustavě pásu: pásmo ohybu rozšířené o okraj na obě strany. Ohyb A začíná
 * pod výkusem (nad ním je výřez), ohyb B od horní hrany. Sdílí list pásu i papírový model a testy.
 */
export function skiveZones(
  L: CoinCardHolderLayout,
  spec: CoinCardHolderSpec,
): { x0: number; x1: number; y0: number; y1: number }[] {
  if (spec.foldSkiveThicknessMm === null) return [];
  const m = spec.foldSkiveMarginMm;
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  if (spec.foldSkiveBands === 'AB') {
    zones.push({
      x0: L.backX1Mm - m,
      x1: L.frontX0Mm + m,
      y0: L.scoopRadiusMm,
      y1: L.panelHeightMm,
    });
  }
  if (L.innerX0Mm !== null) {
    zones.push({ x0: L.frontX1Mm - m, x1: L.innerX0Mm + m, y0: 0, y1: L.panelHeightMm });
  }
  return zones;
}

/** Bod k propíchnutí v soustavě pásu a co označuje. */
export interface BandPrickPoint {
  x: number;
  y: number;
  kind: 'fold' | 'skive' | 'pocket';
}

/**
 * Kroužky k propíchnutí šídlem na listu PÁS (lekce 5), v soustavě pásu:
 * - konce čar ohybů A a B `PRICK_INSET_MM` od hrany (u ohybu A horní konec od dna výřezu),
 * - okraje pásma ztenčení (šrafy) stejně daleko od hran, aby se na rubu jen spojily,
 * - rohy místa pro kapsu na úhlopříčce zaobleného rohu `PRICK_INSET_MM` dovnitř od obrysu,
 *   takže je přiložená kapsa zakryje.
 */
export function bandPrickPoints(
  L: CoinCardHolderLayout,
  spec: CoinCardHolderSpec,
): BandPrickPoint[] {
  const i = PRICK_INSET_MM;
  const H = L.panelHeightMm;
  const S = L.scoopRadiusMm;
  const pts: BandPrickPoint[] = [];
  const ends = (x: number, y0: number, y1: number, kind: BandPrickPoint['kind']): void => {
    pts.push({ x, y: y0 + i, kind }, { x, y: y1 - i, kind });
  };
  ends(L.backX1Mm, S, H, 'fold');
  ends(L.frontX0Mm, S, H, 'fold');
  if (L.innerX0Mm !== null) {
    ends(L.frontX1Mm, 0, H, 'fold');
    ends(L.innerX0Mm, 0, H, 'fold');
  }
  for (const z of skiveZones(L, spec)) {
    ends(z.x0, z.y0, z.y1, 'skive');
    ends(z.x1, z.y0, z.y1, 'skive');
  }
  // Roh o poloměru r: bod oblouku na úhlopříčce je r·(1 − 1/√2) od obou hran, pak i dovnitř.
  const w = L.pocketWidthMm;
  const h = L.pocketHeightMm;
  const d = (r: number): number =>
    Math.min(r, w / 2, h / 2) * (1 - Math.SQRT1_2) + i * Math.SQRT1_2;
  const x0 = L.frontX0Mm + L.pocketXMm;
  const y0 = L.pocketYMm;
  const dt = d(spec.pocketTopRadiusMm);
  const db = d(spec.cornerRadiusMm);
  pts.push(
    { x: x0 + dt, y: y0 + dt, kind: 'pocket' },
    { x: x0 + w - dt, y: y0 + dt, kind: 'pocket' },
    { x: x0 + db, y: y0 + h - db, kind: 'pocket' },
    { x: x0 + w - db, y: y0 + h - db, kind: 'pocket' },
  );
  return pts;
}

/**
 * Papírový model (A4 na šířku, 1:1): stejný obrys pásu jako list 1, bez otvorů a perforací, s čísly
 * kroků u ohybů, rámečkem pro kartu a kontrolním seznamem. Vystřihnout z tvrdšího papíru, složit,
 * vložit karty a bankovky a ověřit jazyk a výřez (u varianty s průchodkou i ji) dřív, než se řeže kůže.
 */
export function buildCoinHolderPaperModelSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const { widthMm: W, heightMm: H, marginMm: m } = A4_SHEET;
  const rc = spec.cornerRadiusMm;
  const mirror = spec.tabSide === 'left';
  const out: string[] = [];
  const sx = m;
  const sy = m + L.tabLengthMm;
  const X = (x: number): number => sx + (mirror ? L.stripLengthMm - x : x);
  const Y = (y: number): number => sy + y;
  const S = L.scoopRadiusMm;
  out.push(cut(stripOutline(L, rc, X, Y, 1, mirror)));
  const fold = (x: number, y0: number): void => {
    out.push(guide(`M${f(X(x))} ${f(Y(y0))} L${f(X(x))} ${f(Y(L.panelHeightMm))}`, '3 2'));
  };
  fold(L.backX1Mm, S);
  fold(L.frontX0Mm, S);
  out.push(
    text(
      X((L.backX1Mm + L.frontX0Mm) / 2),
      Y(-3),
      '② OHYB A: zadní přes vše',
      2.4,
      'middle',
      ACCENT,
    ),
  );
  if (L.innerX0Mm !== null) {
    fold(L.frontX1Mm, 0);
    fold(L.innerX0Mm, 0);
    out.push(
      text(
        X((L.frontX1Mm + L.innerX0Mm) / 2),
        Y(-3),
        '① OHYB B: vnitřní za přední',
        2.4,
        'middle',
        ACCENT,
      ),
    );
  }
  // rámeček karty na předním panelu (karta stojí na švu dna)
  const cardX0 = L.frontX0Mm + (L.panelWidthMm - spec.cardWidthMm) / 2;
  const cardY0 = L.bottomSeamYMm - spec.cardHeightMm;
  out.push(
    guide(
      `M${f(Math.min(X(cardX0), X(cardX0 + spec.cardWidthMm)))} ${f(Y(cardY0))} h${f(spec.cardWidthMm)} v${f(spec.cardHeightMm)} h${f(-spec.cardWidthMm)} Z`,
      '1.5 1',
    ),
  );
  out.push(
    text(
      X(cardX0 + spec.cardWidthMm / 2),
      Y(cardY0 + spec.cardHeightMm / 2),
      'KARTA sem (za přední panel)',
      2.4,
      'middle',
      GUIDE,
    ),
  );
  // Dva řádky: jeden by u úzké kapsy (mince 50 Kč) přetínal její čárkovaný obrys.
  out.push(
    text(
      X(cardX0 + spec.cardWidthMm / 2),
      Y(cardY0 + spec.cardHeightMm / 2 + 3.4),
      `${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)} mm,`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      X(cardX0 + spec.cardWidthMm / 2),
      Y(cardY0 + spec.cardHeightMm / 2 + 6.2),
      `horní hrana ${cz(L.cardBelowRimMm)} mm pod okrajem`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  // druk (a volitelná průchodka níže)
  const sr = spec.snapDiameterMm / 2;
  // Křížek = střed k propíchnutí (jako na listu PÁS), popisek vedle kružnice.
  const side = mirror ? -1 : 1;
  const sideAnchor: Anchor = mirror ? 'end' : 'start';
  out.push(circle(X(L.snapXTabMm), Y(L.snapYTabMm), sr, ACCENT, '1.5 1'));
  out.push(cross(X(L.snapXTabMm), Y(L.snapYTabMm)));
  out.push(
    text(X(L.tabX1Mm) + side * 2, Y(L.snapYTabMm) + 0.8, 'klobouček', 2.1, sideAnchor, ACCENT),
  );
  // Patice: model počítá s přírubou ≈ Ø 10, smí mít nejvýš Ø snapFlangeMax (klobouček je na jazyku venku).
  out.push(circle(X(L.snapXFrontMm), Y(L.snapYFrontMm), SNAP_POST_RADIUS_MM, ACCENT, '1.5 1'));
  out.push(cross(X(L.snapXFrontMm), Y(L.snapYFrontMm)));
  out.push(
    text(
      X(L.snapXFrontMm) + side * (SNAP_POST_RADIUS_MM + 1.5),
      Y(L.snapYFrontMm) + 0.8,
      'patice',
      2.1,
      sideAnchor,
      ACCENT,
    ),
  );
  // Kde bude kapsa s mincí a šev dna (páskou slepit podél něj).
  out.push(
    guide(
      roundedRect(
        Math.min(X(L.frontX0Mm + L.pocketXMm), X(L.frontX0Mm + L.pocketXMm + L.pocketWidthMm)),
        Y(L.pocketYMm),
        L.pocketWidthMm,
        L.pocketHeightMm,
        spec.pocketTopRadiusMm,
        rc,
      ),
      '1 1',
    ),
  );
  out.push(
    text(
      X(L.frontX0Mm + L.pocketXMm + L.pocketWidthMm / 2),
      Y(L.pocketYMm + 5),
      'místo pro kapsu s mincí',
      2,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    guide(
      `M${f(X(seamLineInset(spec)))} ${f(Y(L.bottomSeamYMm))} L${f(X(L.stripLengthMm - seamLineInset(spec)))} ${f(Y(L.bottomSeamYMm))}`,
      '0.8 1.2',
    ),
  );
  // Co si při zkoušce zapsat (sloupec vpravo od pásu). Položky se číslují až tady, aby bez
  // průchodky nevznikla díra v číslování.
  const nx = m + L.stripLengthMm + 5;
  const notes: string[][] = [
    ['klobouček: kolik mm od značky,', '+kterým směrem, kolik jazyka zbývá', '+(cíl 11 + rezerva)'],
    [`karta ve výřezu (cíl ${cz(L.cardExposedMm)} mm)`],
    ...(L.grommetXMm !== null ? [['průchodka celá vidět', '+zepředu i zezadu?']] : []),
    ['bankovky: které jdou napůl', '+a kolik přečnívají (mm)'],
    ['konec jazyka ↔ kapsa (mm)'],
    ['počet karet a tloušťka bankovek'],
  ];
  [
    'ZAPSAT PŘI ZKOUŠCE',
    ...notes.flatMap((lines, n) => lines.map((t, j) => (j === 0 ? `${n + 1} ${t}` : t))),
  ].forEach((t, i) => {
    // „+“ = pokračování řádku: odsadit posunem x (mezery na začátku SVG text zahodí).
    const cont = t.startsWith('+');
    out.push(
      text(
        nx + (cont ? 2.5 : 0),
        sy + 4 + i * 3.6,
        cont ? t.slice(1) : t,
        i === 0 ? 2.3 : 2.1,
        'start',
        i === 0 ? INK : GUIDE,
      ),
    );
  });
  if (L.grommetXMm !== null && L.grommetYMm !== null) {
    out.push(circle(X(L.grommetXMm), Y(L.grommetYMm), spec.grommetHoleMm / 2));
    out.push(
      text(
        X(L.grommetXMm) + (mirror ? 5 : -5),
        Y(L.grommetYMm) + 0.8,
        'průchodka – propíchnout',
        1.9,
        mirror ? 'start' : 'end',
        GUIDE,
      ),
    );
  }
  const label = (x: number, name: string, side: string): void => {
    out.push(text(X(x), Y(L.panelHeightMm - 12), name, 2.8, 'middle'));
    out.push(text(X(x), Y(L.panelHeightMm - 8.6), side, 2.1, 'middle', GUIDE));
  };
  label(L.panelWidthMm / 2, 'ZADNÍ PANEL', 'tahle strana ven (zezadu)');
  label(L.frontX0Mm + L.panelWidthMm / 2, 'PŘEDNÍ PANEL', 'tahle strana ven (zepředu)');
  if (L.innerX0Mm !== null)
    label(L.innerX0Mm + L.panelWidthMm / 2, 'VNITŘNÍ PANEL', 'dělí karty a bankovky');

  const calY = H - m - LEGEND_HEIGHT_MM - CALIBRATION_GAP_MM;
  out.push(
    `<path d="M${f(m)} ${f(calY - 2)} V${f(calY + 2)} M${f(m)} ${f(calY)} H${f(m + 50)} M${f(m + 50)} ${f(calY - 2)} V${f(calY + 2)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(text(m + 53, calY + 1, 'KONTROLA MĚŘÍTKA: 50 mm', 2.4, 'start'));
  const legend = [
    `PAPÍROVÝ MODEL – NE z kůže. Tisk na A4 NA ŠÍŘKU na 100 %, obrys je stejný jako list pásu. Vytisknout na papír 160 g a nalepit na tenkou lepenku (krabice od cereálií), aby byl tuhý.`,
    // Stejný údaj jako na listu PÁS: výtisky pro 1,5 a 1,2 mm se liší jen o pár mm a na stole by nešly rozlišit.
    `Model pro: mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm${spec.foldSkiveThicknessMm !== null ? ` (ohyb B ztenčit na ${cz(spec.foldSkiveThicknessMm)} mm)` : ' (bez ztenčení)'}.`,
    `Prokáže: polohu jazyka a kloboučku, výřez, ${L.grommetXMm !== null ? 'průchodku, ' : ''}vytahování karty a místo pro kapsu. Neprokáže přídavky ohybů (papír je tenčí než kůže): ohyby jen přehnout do smyčky, nepřekládat na ostro.`,
    `☐ ① vnitřní panel dozadu za přední (ohyb B)   ☐ ② zadní přes všechno (ohyb A)   ☐ dno slepit páskou podél čáry švu   ☐ vložit ${cardsWord(spec.cardsCount)} vpředu a bankovky napůl vzadu`,
    `☐ přehnout jazyk přes horní hranu, patici propíchnout do jazyka a změřit odchylku od kloboučku${L.grommetXMm !== null ? '   ☐ průchodka je celá ve výřezu zepředu i zezadu' : ''}`,
    '☐ palcem vysunout kartu výřezem   ☐ konec jazyka je nad místem pro kapsu   → výsledky zapsat vpravo, teprve pak řezat kůži (listy PÁS a KAPSA).',
  ];
  legend.forEach((t, i) =>
    out.push(text(m, H - m - LEGEND_HEIGHT_MM + 4 + i * 3.4, t, 2.3, 'start', GUIDE)),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/** O kolik konce os na listu KAPSA přesahují obrys kapsy (mm). */
export const POCKET_AXIS_OVERRUN_MM = 4;

/**
 * List KAPSA (A4 na výšku, 1:1): kapsa s mincí a otvor formy pro důlek.
 */
export function buildCoinHolderPocketSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const { widthMm: W, heightMm: H, marginMm: m } = A4_PORTRAIT;
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const out: string[] = [];
  const ring = (cx: number, cy: number, r: number): string =>
    cut(
      `M${f(cx + r)} ${f(cy)} A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)} A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)} Z`,
    );

  let cy = m;
  out.push(text(m, cy + 2.5, 'KAPSA S MINCÍ (horní hrana otevřená)', 2.8, 'start'));
  const kx = m;
  // Kapsa je o přesah os níž, aby horní konec svislé osy (nad obrysem) nepřeškrtl nadpis.
  const ky = cy + SHEET_TITLE_GAP_MM + POCKET_AXIS_OVERRUN_MM;
  out.push(cut(roundedRect(kx, ky, L.pocketWidthMm, L.pocketHeightMm, spec.pocketTopRadiusMm, rc)));
  const seam = pocketSeam(
    kx + so,
    kx + L.pocketWidthMm - so,
    ky + L.pocketSeamTopMm,
    ky + L.pocketHeightMm - so,
    Math.max(0.5, rc - so),
    spec.stitchPitchMm,
  );
  // G1: lepený pruh na RUBU kapsy (boky a dno po čáru švu); nahoře se nelepí.
  out.push(
    glueHatch(
      'glue-g1-kapsa',
      pocketGlueBand(kx, ky, L.pocketWidthMm, L.pocketHeightMm, spec, L.pocketSeamTopMm),
      { x: kx, y: ky, w: L.pocketWidthMm, h: L.pocketHeightMm },
    ),
  );
  out.push(guide(seam.path, '0.8 1.2'));
  out.push(seam.dots);
  const ccx = kx + L.coinCentreXMm;
  const ccy = ky + L.coinCentreYMm;
  out.push(ring(ccx, ccy, L.windowDiameterMm / 2));
  out.push(circle(ccx, ccy, spec.coinDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(circle(ccx, ccy, L.formHoleDiameterMm / 2, GUIDE, '0.8 1.2'));
  out.push(cross(ccx, ccy));
  // Osy přes celý díl až za obrys: na kůži se protáhnou k okraji a podle nich se kůže vystředí
  // na formě (křížek sám je pod kůží schovaný) a vystředí výsečník okna. Všechny 4 konce leží
  // POCKET_AXIS_OVERRUN_MM za obrysem: propichují se na líci a musí odpadnout s odřezkem
  // (konec na hraně by nechal zářez v otevřené horní hraně kapsy).
  const ov = POCKET_AXIS_OVERRUN_MM;
  out.push(
    guide(
      `M${f(kx - ov)} ${f(ccy)} H${f(kx + L.pocketWidthMm + ov)} M${f(ccx)} ${f(ky - ov)} V${f(ky + L.pocketHeightMm + ov)}`,
      '3 1 0.6 1',
    ),
  );
  const tx = kx + L.pocketWidthMm + 6;
  const lines = [
    `${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm`,
    `okno Ø ${cz(L.windowDiameterMm)} (plná čára)`,
    `prstenec ${cz(L.coinRingMm)} mm – držení ověřit na odřezku`,
    `mince Ø ${cz(spec.coinDiameterMm)} (čárkovaně)`,
    'čerchovaně osy – na líci jen propíchnout konce,',
    'na RUBU spojit a protáhnout až k okraji kůže',
    `pata důlku Ø ${cz(L.formHoleDiameterMm)} (tečkovaně)`,
    `šev ${seam.holes} otvorů od středu dna`,
    'otvory švu prosekat PŘED tvarováním,',
    'na formě vystředit podle os, obrys',
    'vyříznout po zaschnutí podle orýsování,',
    'okno vyseknout před přišitím',
    `na přední panel: ${cz(L.pocketYMm)} mm pod horní hranou,`,
    `${cz(L.pocketXMm)} mm od boků, otevřenou hranou nahoru`,
  ];
  lines.forEach((t, i) => out.push(text(tx, ky + 4 + i * 3.6, t, 2.4, 'start', GUIDE)));
  [
    `šrafa G1 = lepit na RUBU kapsy: pruh ${cz(so)} mm`,
    'od okraje po čáru švu, boky a dno;',
    'stejný pruh na líci předního panelu (list PÁS)',
  ].forEach((t, i) => out.push(text(tx, ky + 4 + (lines.length + i) * 3.6, t, 2.4, 'start', GLUE)));
  out.push(
    haloText(
      kx + L.pocketWidthMm / 2,
      ky + L.pocketHeightMm - so / 2 + 0.6,
      'G1 · lepit na RUBU',
      1.8,
    ),
  );
  out.push(
    haloText(kx + L.pocketWidthMm / 2, ky - 1.2, 'NElepit – sem se zasouvá mince', 1.8, GUIDE),
  );

  cy = ky + L.pocketHeightMm + SHEET_CAPTION_MM + A4_SHEET.gapMm;
  out.push(text(m, cy + 2.5, 'OTVOR FORMY PRO DŮLEK', 2.8, 'start'));
  const fy = cy + SHEET_TITLE_GAP_MM;
  const fcx = kx + L.formHoleDiameterMm / 2;
  const fcy = fy + L.formHoleDiameterMm / 2;
  out.push(ring(fcx, fcy, L.formHoleDiameterMm / 2));
  out.push(cross(fcx, fcy));
  const fr = L.formHoleDiameterMm / 2 + 4;
  // Svislá osa nahoře končí těsně nad kružnicí, aby nepřeškrtla nadpis „OTVOR FORMY“ nad ní.
  const frTop = L.formHoleDiameterMm / 2 + 0.5;
  out.push(
    guide(
      `M${f(fcx - fr)} ${f(fcy)} H${f(fcx + fr)} M${f(fcx)} ${f(fcy - frTop)} V${f(fcy + fr)}`,
      '3 1 0.6 1',
    ),
  );
  const flines = [
    `Ø ${cz(L.formHoleDiameterMm)} = mince ${cz(spec.coinDiameterMm)} + 2 × kůže ${cz(spec.pocketThicknessMm)} + vůle ${cz(spec.formHoleClearanceMm)}`,
    `deska ≥ ${cz(L.formPlateMm)} × ${cz(L.formPlateMm)} mm, tloušťka ≥ ${cz(spec.formPlateThicknessMm)} mm`,
    'překližka, dřevo nebo HDPE; hranu otvoru zaoblit smirkem',
    'osy otvoru narýsovat na desce až k jejím okrajům',
    'kůže LÍCEM DOLŮ na formu, osy na rubu na osy desky,',
    'mince na rub, přiklopit deskou, svěrky',
  ];
  flines.forEach((t, i) =>
    out.push(text(kx + L.formHoleDiameterMm + 6, fy + 6 + i * 3.6, t, 2.4, 'start', GUIDE)),
  );

  const calY = H - m - LEGEND_HEIGHT_MM - CALIBRATION_GAP_MM;
  out.push(
    `<path d="M${f(m)} ${f(calY - 2)} V${f(calY + 2)} M${f(m)} ${f(calY)} H${f(m + 50)} M${f(m + 50)} ${f(calY - 2)} V${f(calY + 2)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(text(m + 53, calY + 1, 'KONTROLA MĚŘÍTKA: 50 mm', 2.4, 'start'));
  const legend = [
    'POUZDRO NA KARTY S VSAZENOU MINCÍ – LIST KAPSA A FORMA.',
    'Tisk na A4 na 100 % (bez „přizpůsobit stránce“); samostatný list na výšku.',
    `Kapsa ze samostatné kůže ${cz(spec.pocketThicknessMm)} mm (i když je pás silnější); kus ≥ ${cz(L.formPlateMm - 4)} × ${cz(L.formPlateMm - 4)} mm.`,
    'Plná čára = řez, tečky = otvory stehu, čárkovaně/tečkovaně = pomocné kružnice.',
  ];
  legend.forEach((t, i) =>
    out.push(text(m, H - m - LEGEND_HEIGHT_MM + 4 + i * 3.2, t, 2.2, 'start', GUIDE)),
  );
  out.push(
    glueLegend(
      m,
      H - m - LEGEND_HEIGHT_MM + 4 + legend.length * 3.2 - 0.8,
      'šrafa = kontaktní lepidlo jen sem (G1, rub kapsy), horní hranu nelepit',
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/**
 * Postup skládání a šití jako list A4 na šířku: osm kroků od vyříznutí po hotové pouzdro
 * zepředu a zezadu. Proporce dílů jsou z modelu (zmenšené); mince, nit a motiv jsou
 * ilustrativní. Není to výrobní soubor.
 */
export function buildCoinHolderProcessSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const W = 297;
  const H = 210;
  const cols = 4;
  const pad = 8;
  const cellW = (W - 2 * pad) / cols;
  const cellH = (H - 2 * pad - 10) / 2;
  const LEATHER = '#3f6b4f';
  const LEATHER_DARK = '#2f5240';
  const FLESH = '#8fae97';
  const THREAD = '#efe3c2';
  const METAL = '#9a9a9a';
  const out: string[] = [];
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;

  const cellOrigin = (i: number): [number, number] => [
    pad + (i % cols) * cellW,
    pad + Math.floor(i / cols) * cellH,
  ];
  const cell = (i: number, title: string, body: string[]): void => {
    const [cx, cy] = cellOrigin(i);
    out.push(
      `<rect x="${f(cx + 1)}" y="${f(cy + 1)}" width="${f(cellW - 2)}" height="${f(cellH - 2)}" rx="2" fill="#fbfaf7" stroke="#ddd" stroke-width="0.3"/>`,
    );
    out.push(text(cx + 4, cy + 6.5, `${i + 1}`, 6, 'start', ACCENT));
    out.push(text(cx + 10, cy + 6.5, title, 3.1, 'start'));
    out.push(...body);
  };
  const caption = (i: number, lines: string[]): string[] => {
    const [cx, cy] = cellOrigin(i);
    return lines.map((t, n) =>
      text(cx + cellW / 2, cy + cellH - 4 - (lines.length - 1 - n) * 3.4, t, 2.2, 'middle', GUIDE),
    );
  };
  const stitches = (x0: number, y0: number, x1: number, y1: number, k: number): string => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.floor(len / (spec.stitchPitchMm * k));
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = i * spec.stitchPitchMm * k + 0.6 * k;
      const b = a + 2.8 * k;
      parts.push(`M${f(x0 + ux * a)} ${f(y0 + uy * a)} L${f(x0 + ux * b)} ${f(y0 + uy * b)}`);
    }
    return `<path d="${parts.join(' ')}" stroke="${THREAD}" stroke-width="${f(1.1 * k)}" stroke-linecap="round" fill="none"/>`;
  };
  const pocketPath = (ox: number, oy: number, k: number): string =>
    roundedRect(
      ox,
      oy,
      L.pocketWidthMm * k,
      L.pocketHeightMm * k,
      spec.pocketTopRadiusMm * k,
      rc * k,
    );
  /** Kapsa s mincí nakreslená na panelu: obrys, mince v okně, šev po třech stranách. */
  const pocketOnPanel = (ox: number, oy: number, k: number): string[] => {
    const px = ox + L.pocketXMm * k;
    const py = oy + L.pocketYMm * k;
    const ccx = px + L.coinCentreXMm * k;
    const ccy = py + L.coinCentreYMm * k;
    const b = [
      `<path d="${pocketPath(px, py, k)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((spec.coinDiameterMm / 2) * k)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.windowDiameterMm / 2) * k)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    ];
    const sx0 = px + so * k;
    const sx1 = px + (L.pocketWidthMm - so) * k;
    const syT = py + L.pocketSeamTopMm * k;
    const syB = py + (L.pocketHeightMm - so) * k;
    b.push(
      stitches(sx0, syT, sx0, syB, k),
      stitches(sx0, syB, sx1, syB, k),
      stitches(sx1, syB, sx1, syT, k),
    );
    return b;
  };

  /* 1 – vyříznout pás a odřezek na kapsu */
  {
    const [cx, cy] = cellOrigin(0);
    const k1 = (cellW - 16) / L.stripLengthMm;
    const ox = cx + 8;
    const oy = cy + 14 + L.tabLengthMm * k1;
    const b: string[] = [];
    b.push(
      `<path d="${stripOutline(
        L,
        rc,
        (x) => ox + x * k1,
        (y) => oy + y * k1,
        k1,
        false,
      )}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    for (const x of [L.backX1Mm, L.frontX0Mm, L.frontX1Mm, L.innerX0Mm ?? L.frontX1Mm]) {
      b.push(
        guide(
          `M${f(ox + x * k1)} ${f(oy + (x <= L.frontX0Mm ? L.scoopRadiusMm : 0) * k1)} L${f(ox + x * k1)} ${f(oy + L.panelHeightMm * k1)}`,
          '1.2 1',
        ),
      );
    }
    const blank = L.formPlateMm - 4;
    b.push(
      `<rect x="${f(ox)}" y="${f(oy + (L.panelHeightMm + 6) * k1)}" width="${f(blank * k1)}" height="${f(blank * k1)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4" stroke-dasharray="1 0.8"/>`,
    );
    b.push(
      text(
        ox + blank * k1 + 2,
        oy + (L.panelHeightMm + 6 + blank / 2) * k1,
        `kůže ${cz(spec.pocketThicknessMm)} mm na kapsu ≥ ${cz(blank)} × ${cz(blank)}`,
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      ...caption(0, [
        `pás ${cz(L.stripLengthMm)} × ${cz(L.panelHeightMm)} mm + jazyk ${cz(L.tabLengthMm)} (s rezervou ${cz(spec.tabFitReserveMm)})`,
        'po zkoušce na papíře: přilepit na LÍC, řezat skrz papír,',
        spec.foldSkiveThicknessMm !== null
          ? 'ohyb B ztenčit z rubu (jen u 1,5 mm), prosekat otvory dna,'
          : `kůže ${cz(spec.bodyThicknessMm)} mm: ohyby neztenčovat, prosekat otvory dna,`,
        'zapečetit rub vnitřního panelu',
      ]),
    );
    cell(0, 'Papír, pak pás z kůže', b);
  }

  /* 2 – tvarování důlku */
  {
    const [cx, cy] = cellOrigin(1);
    const b: string[] = [];
    const s2 = Math.min(0.9, (cellW - 16) / L.formPlateMm);
    const ox = cx + (cellW - L.formPlateMm * s2) / 2;
    const oy = cy + 34;
    const plateW = L.formPlateMm * s2;
    const hole = L.formHoleDiameterMm * s2;
    const t = 6;
    const depth = 2.6;
    b.push(
      `<path d="M${f(ox)} ${f(oy)} h${f((plateW - hole) / 2)} v${f(t)} h${f(-(plateW - hole) / 2)} Z M${f(ox + (plateW + hole) / 2)} ${f(oy)} h${f((plateW - hole) / 2)} v${f(t)} h${f(-(plateW - hole) / 2)} Z" fill="#d9c7a0" stroke="#8a7a55" stroke-width="0.4"/>`,
    );
    const lx0 = ox + 4;
    const lx1 = ox + plateW - 4;
    const hx0 = ox + (plateW - hole) / 2;
    const hx1 = ox + (plateW + hole) / 2;
    b.push(
      `<path d="M${f(lx0)} ${f(oy)} L${f(hx0)} ${f(oy)} Q${f(hx0 + 1)} ${f(oy + depth)} ${f(hx0 + 3)} ${f(oy + depth)} L${f(hx1 - 3)} ${f(oy + depth)} Q${f(hx1 - 1)} ${f(oy + depth)} ${f(hx1)} ${f(oy)} L${f(lx1)} ${f(oy)} v-1.4 L${f(hx1)} ${f(oy - 1.4)} Q${f(hx1 - 1)} ${f(oy + depth - 1.4)} ${f(hx1 - 3)} ${f(oy + depth - 1.4)} L${f(hx0 + 3)} ${f(oy + depth - 1.4)} Q${f(hx0 + 1)} ${f(oy + depth - 1.4)} ${f(hx0)} ${f(oy - 1.4)} L${f(lx0)} ${f(oy - 1.4)} Z" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    const coinW = spec.coinDiameterMm * s2;
    b.push(
      `<rect x="${f(ox + plateW / 2 - coinW / 2)}" y="${f(oy + depth - 1.4 - 2.4)}" width="${f(coinW)}" height="2.4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<rect x="${f(ox)}" y="${f(oy + depth - 1.4 - 2.4 - 3)}" width="${f(plateW)}" height="3" fill="#cfd8dc" stroke="#78909c" stroke-width="0.4"/>`,
    );
    for (const sx of [ox + 6, ox + plateW - 6]) {
      b.push(
        `<path d="M${f(sx)} ${f(oy - 18)} v6 M${f(sx - 1.5)} ${f(oy - 14)} l1.5 2 l1.5 -2" stroke="${ACCENT}" stroke-width="0.5" fill="none"/>`,
      );
    }
    b.push(
      text(
        cx + cellW / 2,
        oy - 20,
        'horní deska · mince · kůže (rub nahoře) · forma',
        2.1,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      ...caption(1, [
        // Čtyři kratší řádky: jeden dlouhý přetékal přes okraj buňky.
        `otvor Ø ${cz(L.formHoleDiameterMm)} = mince ${cz(spec.coinDiameterMm)} + 2 × ${cz(spec.pocketThicknessMm)} + ${cz(spec.formHoleClearanceMm)}`,
        'otvory švu prosekat předem · navlhčit',
        `kůže LÍCEM DOLŮ na formu (tl. ≥ ${cz(spec.formPlateThicknessMm)}) · mince na rub`,
        'přiklopit deskou, stáhnout svěrkami, nechat zaschnout',
      ]),
    );
    cell(1, 'Vytvarovat důlek za mokra', b);
  }

  /* 3 – obrys kapsy a okno */
  {
    const [cx, cy] = cellOrigin(2);
    const k3 = Math.min(0.85, (cellH - 34) / L.pocketHeightMm);
    const ox = cx + (cellW - L.pocketWidthMm * k3) / 2;
    const oy = cy + 12;
    const b: string[] = [];
    b.push(
      `<path d="${pocketPath(ox, oy, k3)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    const ccx = ox + L.coinCentreXMm * k3;
    const ccy = oy + L.coinCentreYMm * k3;
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.formHoleDiameterMm / 2) * k3)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.windowDiameterMm / 2) * k3)}" fill="#fbfaf7" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      ...caption(2, [
        'po zaschnutí vyříznout obrys kapsy podle orýsování',
        `okno Ø ${cz(L.windowDiameterMm)}: kapsa lícem dolů na formě, pod dno špalík`,
        `prstenec ${cz(L.coinRingMm)} mm drží minci – ověřit na odřezku`,
      ]),
    );
    cell(2, 'Vyříznout kapsu a vyseknout okno', b);
  }

  /* 4 – přišít kapsu na přední panel */
  {
    const [cx, cy] = cellOrigin(3);
    const k4 = Math.min(0.62, (cellH - 26) / L.panelHeightMm);
    const ox = cx + (cellW - L.panelWidthMm * k4) / 2;
    const oy = cy + 12;
    const b: string[] = [];
    b.push(
      `<path d="${panelPath(L, rc, ox, oy, k4, 'left')}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(...pocketOnPanel(ox, oy, k4));
    b.push(
      `<circle cx="${f(ox + (L.snapXFrontMm - L.frontX0Mm) * k4)}" cy="${f(oy + spec.snapFromTopMm * k4)}" r="${f((spec.snapDiameterMm / 2) * k4)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      ...caption(3, [
        'kapsu přilepit na značky, vidličkami projet její otvory',
        'i předním panelem a přišít (horní hrana zůstane otevřená)',
        `patice ${cz(spec.snapFromTopMm)} mm pod hranou na ose jazyka${L.grommetXMm !== null ? ', průchodka' : ''} – naplocho`,
      ]),
    );
    cell(3, 'Přišít kapsu, osadit kování', b);
  }

  /* 5 – složení pásu (řez shora) */
  {
    const [cx, cy] = cellOrigin(4);
    const b: string[] = [];
    const k5 = (cellW - 34) / L.panelWidthMm;
    const ox = cx + 17;
    const oy = cy + 32;
    const gapY = 7;
    const w = L.panelWidthMm * k5;
    const lay = (n: number): number => oy + n * gapY;
    const layer = (n: number, colour: string): string =>
      `<path d="M${f(ox)} ${f(lay(n))} L${f(ox + w)} ${f(lay(n))}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>`;
    // Řez shora, dopředu = dolů: zadní nahoře, vnitřní uprostřed, přední dole.
    b.push(layer(0, LEATHER_DARK), layer(1, FLESH), layer(2, LEATHER));
    // ohyb B vpravo spojuje přední a vnitřní panel, ohyb A vlevo obepíná všechno
    b.push(
      `<path d="M${f(ox + w)} ${f(lay(2))} q${f(gapY)} 0 ${f(gapY)} ${f(-gapY / 2)} q0 ${f(-gapY / 2)} ${f(-gapY)} ${f(-gapY / 2)}" fill="none" stroke="${LEATHER_DARK}" stroke-width="1.6"/>`,
    );
    b.push(
      `<path d="M${f(ox)} ${f(lay(2))} q${f(-gapY * 1.6)} 0 ${f(-gapY * 1.6)} ${f(-gapY)} q0 ${f(-gapY)} ${f(gapY * 1.6)} ${f(-gapY)}" fill="none" stroke="${LEATHER_DARK}" stroke-width="1.6"/>`,
    );
    b.push(text(ox + w / 2, lay(0) - 8, 'vlevo ohyb A · vpravo ohyb B', 2.1, 'middle', ACCENT));
    b.push(text(ox + w / 2, lay(0) - 3, 'ZADNÍ (motiv ven)', 2.1, 'middle', GUIDE));
    b.push(text(ox + w * 0.25, lay(0) + 4.4, 'bankovky', 2, 'middle', '#8a7a55'));
    b.push(
      text(
        ox + w - 1.5,
        lay(1) - 1.6,
        L.grommetXMm !== null ? 'VNITŘNÍ (průchodka)' : 'VNITŘNÍ',
        2,
        'end',
        GUIDE,
      ),
    );
    b.push(text(ox + w * 0.25, lay(1) + 4.4, 'karty', 2, 'middle', '#8a7a55'));
    b.push(text(ox + w / 2, lay(2) + 3.6, 'PŘEDNÍ (líc ven, kapsa s mincí)', 2.1, 'middle', GUIDE));
    b.push(text(ox + w / 2, lay(2) + 7, '↓ pohled zepředu ↓', 2, 'middle', ACCENT));
    b.push(
      ...caption(4, [
        'ohyby navlhčit, ohnout kolem obsahu zabaleného ve fólii,',
        'sepnout sponkami přes podložku a nechat zaschnout',
        'nejdřív vnitřní za přední (B), pak zadní přes vše (A)',
      ]),
    );
    cell(4, 'Složit pás', b);
  }
  /* 6 – prošít dno */
  {
    const [cx, cy] = cellOrigin(5);
    const k6 = Math.min(0.62, (cellH - 36) / L.panelHeightMm);
    const ox = cx + (cellW - L.panelWidthMm * k6) / 2;
    const oy = cy + 20;
    const b: string[] = [];
    // jazyk ještě stojí (klobouček není osazený), za předním panelem je vnitřní stěna
    const tw6 = spec.tabWidthMm * k6;
    const tr6 = L.tabEndRadiusMm * k6;
    const tx6 = ox + L.panelWidthMm * k6 - tw6;
    const th6 = 10;
    b.push(
      `<path d="M${f(tx6)} ${f(oy)} L${f(tx6)} ${f(oy - th6 + tr6)} A${f(tr6)} ${f(tr6)} 0 0 1 ${f(tx6 + tr6)} ${f(oy - th6)} L${f(tx6 + tw6 - tr6)} ${f(oy - th6)} A${f(tr6)} ${f(tr6)} 0 0 1 ${f(tx6 + tw6)} ${f(oy - th6 + tr6)} L${f(tx6 + tw6)} ${f(oy)} Z" fill="${LEATHER_DARK}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k6, L.panelHeightMm * k6, rc * k6)}" fill="${FLESH}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    if (L.grommetXMm !== null) {
      b.push(
        `<circle cx="${f(ox + spec.grommetFromEdgeMm * k6)}" cy="${f(oy + spec.grommetFromEdgeMm * k6)}" r="${f((spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM) * k6)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
      );
    }
    b.push(
      `<path d="${panelPath(L, rc, ox, oy, k6, 'left')}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(...pocketOnPanel(ox, oy, k6));
    b.push(
      stitches(
        ox + so * k6,
        oy + L.bottomSeamYMm * k6,
        ox + (L.panelWidthMm - so) * k6,
        oy + L.bottomSeamYMm * k6,
        k6,
      ),
    );
    b.push(
      ...caption(5, [
        `dno prošít skrz všechny vrstvy: ${L.bottomSeamHoles} otvorů na panel, rozteč ${cz(spec.stitchPitchMm)} mm`,
        'lepidlo jen pod čáru švu, zarovnat jehlami přes otvory',
      ]),
    );
    cell(5, 'Prošít dno', b);
  }

  /* 7 – hotovo zepředu */
  {
    const [cx, cy] = cellOrigin(6);
    const k7 = Math.min(0.62, (cellH - 26) / L.panelHeightMm);
    const ox = cx + (cellW - L.panelWidthMm * k7) / 2;
    const oy = cy + 14;
    const b: string[] = [];
    // vnitřní panel vzadu (vidět výřezem), pak přední panel s výřezem
    b.push(
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k7, L.panelHeightMm * k7, rc * k7)}" fill="${FLESH}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    if (L.grommetXMm !== null) {
      const gx = ox + spec.grommetFromEdgeMm * k7;
      const gy = oy + spec.grommetFromEdgeMm * k7;
      b.push(
        `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
      );
      b.push(
        `<path d="M${f(gx)} ${f(gy)} q-6 -8 -10 -2" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
      );
    }
    // karta v přední kapse: horní hrana pod rohem vnitřního panelu, vidět ve výřezu
    const cardX = ox + ((L.panelWidthMm - spec.cardWidthMm) / 2) * k7;
    b.push(
      `<rect x="${f(cardX)}" y="${f(oy + L.cardBelowRimMm * k7)}" width="${f(spec.cardWidthMm * k7)}" height="${f((L.scoopRadiusMm - L.cardBelowRimMm + 4) * k7)}" rx="1" fill="#f4efe6" stroke="#bbb" stroke-width="0.3"/>`,
    );
    b.push(
      `<path d="${panelPath(L, rc, ox, oy, k7, 'left')}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(...pocketOnPanel(ox, oy, k7));
    b.push(
      stitches(
        ox + so * k7,
        oy + L.bottomSeamYMm * k7,
        ox + (L.panelWidthMm - so) * k7,
        oy + L.bottomSeamYMm * k7,
        k7,
      ),
    );
    // jazyk přes horní hranu na předek (už zkrácený)
    const tabDown = (spec.snapFromTopMm + spec.tabBeyondSnapMm) * k7;
    const rtk = Math.min(L.tabEndRadiusMm * k7, (spec.tabWidthMm * k7) / 2);
    const tx1 = ox + L.panelWidthMm * k7;
    const tx0 = tx1 - spec.tabWidthMm * k7;
    b.push(
      `<path d="M${f(tx0)} ${f(oy)} L${f(tx1)} ${f(oy)} L${f(tx1)} ${f(oy + tabDown - rtk)} A${f(rtk)} ${f(rtk)} 0 0 1 ${f(tx1 - rtk)} ${f(oy + tabDown)} L${f(tx0 + rtk)} ${f(oy + tabDown)} A${f(rtk)} ${f(rtk)} 0 0 1 ${f(tx0)} ${f(oy + tabDown - rtk)} Z" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    b.push(
      `<circle cx="${f(ox + (L.snapXFrontMm - L.frontX0Mm) * k7)}" cy="${f(oy + spec.snapFromTopMm * k7)}" r="${f((spec.snapDiameterMm / 2) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      ...caption(6, [
        `klobouček podle obtisku patice, jazyk zkrátit ${cz(spec.tabBeyondSnapMm)} mm za ním, R${cz(L.tabEndRadiusMm)}`,
        `výřezem vidět kartu${L.grommetXMm !== null ? ' a průchodku' : ''} · složené ≈ ${cz(Math.round(L.foldedWidthMm))} × ${cz(Math.round(L.panelHeightMm))} mm`,
      ]),
    );
    cell(6, 'Hotovo – zepředu', b);
  }

  /* 8 – hotovo zezadu */
  {
    const [cx, cy] = cellOrigin(7);
    const k8 = Math.min(0.62, (cellH - 26) / L.panelHeightMm);
    const ox = cx + (cellW - L.panelWidthMm * k8) / 2;
    const oy = cy + 14;
    const b: string[] = [];
    b.push(
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k8, L.panelHeightMm * k8, rc * k8)}" fill="#5a8a6b" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    if (L.grommetXMm !== null) {
      const gx = ox + (L.panelWidthMm - spec.grommetFromEdgeMm) * k8;
      const gy = oy + spec.grommetFromEdgeMm * k8;
      b.push(
        `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM) * k8)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
      );
      b.push(
        `<path d="M${f(gx)} ${f(gy)} q8 6 6 14 q-1 5 -4 8" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
      );
    }
    b.push(
      `<path d="${panelPath(L, rc, ox, oy, k8, 'right')}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      `<rect x="${f(ox + 12 * k8)}" y="${f(oy + 26 * k8)}" width="${f(40 * k8)}" height="${f(30 * k8)}" rx="2" fill="none" stroke="${LEATHER_DARK}" stroke-width="0.4" stroke-dasharray="1 1"/>`,
    );
    b.push(text(ox + 32 * k8, oy + 43 * k8, 'motiv / ražení', 2.3, 'middle', LEATHER_DARK));
    b.push(
      stitches(
        ox + so * k8,
        oy + L.bottomSeamYMm * k8,
        ox + (L.panelWidthMm - so) * k8,
        oy + L.bottomSeamYMm * k8,
        k8,
      ),
    );
    const tw = spec.tabWidthMm * k8;
    b.push(
      `<path d="M${f(ox)} ${f(oy)} L${f(ox + tw)} ${f(oy)} L${f(ox + tw)} ${f(oy + 4)} L${f(ox)} ${f(oy + 4)} Z" fill="${LEATHER_DARK}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    b.push(
      ...caption(7, [
        'zezadu: motiv, jazyk odchází přes horní hranu dopředu,',
        L.grommetXMm !== null
          ? 'výřez s průchodkou a šňůrkou naproti jazyku'
          : 'výřez naproti jazyku, vidět roh vnitřního panelu',
        'nakonec hrany srazit a zaleštit',
      ]),
    );
    cell(7, 'Hotovo – zezadu', b);
  }

  out.push(
    text(
      W / 2,
      H - 4,
      'POUZDRO NA KARTY S VSAZENOU MINCÍ – postup skládání. Proporce dílů z modelu (zmenšeno), mince/nit/motiv ilustrativní. NENÍ výrobní soubor, není 1:1.',
      2.4,
      'middle',
      GUIDE,
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/** Počet buněk listu postupu (a tedy obrázků kroků pro lekce). */
export const PROCESS_STEP_COUNT = 8;

/**
 * Jedna buňka listu postupu jako samostatný obrázek pro lekci: stejná kresba, jen výřez
 * (viewBox) na buňku `step` (1–8). Geometrie buněk je stejná jako v `buildCoinHolderProcessSvg`.
 */
export function buildCoinHolderProcessStepSvg(
  step: number,
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  if (!Number.isInteger(step) || step < 1 || step > PROCESS_STEP_COUNT) {
    throw new Error(`Krok postupu musí být 1–${PROCESS_STEP_COUNT}, ne ${step}.`);
  }
  const W = 297;
  const H = 210;
  const pad = 8;
  const cellW = (W - 2 * pad) / 4;
  const cellH = (H - 2 * pad - 10) / 2;
  const i = step - 1;
  const x = pad + (i % 4) * cellW + 1;
  const y = pad + Math.floor(i / 4) * cellH + 1;
  const w = cellW - 2;
  const h = cellH - 2;
  const full = buildCoinHolderProcessSvg(spec);
  const root = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`;
  if (!full.includes(root)) throw new Error('List postupu změnil kořen SVG – uprav výřez kroků.');
  return full.replace(
    root,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}mm" height="${f(h)}mm" viewBox="${f(x)} ${f(y)} ${f(w)} ${f(h)}">`,
  );
}

/**
 * Název souboru podle odchylek od výchozího střihu, aby varianta nepřepsala verzovaný soubor:
 * jiná mince než 50 Kč → „-mince-40mm“, vlastní okno → „-okno-18mm“, jazyk na druhé straně → „-jazyk-vlevo“,
 * volitelná průchodka → „-pruchodka“.
 */
export function coinHolderFileStem(spec: CoinCardHolderSpec): string {
  const d = DEFAULT_COIN_CARD_HOLDER;
  const parts = ['pouzdro-mince-sablona'];
  if (spec.coinDiameterMm !== d.coinDiameterMm) {
    parts.push(`mince-${f(spec.coinDiameterMm).replace('.', '-')}mm`);
  }
  if (spec.windowDiameterMm !== null)
    parts.push(`okno-${f(spec.windowDiameterMm).replace('.', '-')}mm`);
  if (spec.tabSide !== d.tabSide)
    parts.push(`jazyk-${spec.tabSide === 'left' ? 'vlevo' : 'vpravo'}`);
  if (spec.cardsCount !== d.cardsCount) parts.push(`karty-${spec.cardsCount}`);
  if (spec.bodyThicknessMm !== d.bodyThicknessMm)
    parts.push(`kuze-${f(spec.bodyThicknessMm).replace('.', '-')}mm`);
  if (spec.grommet !== d.grommet) parts.push(spec.grommet ? 'pruchodka' : 'bez-pruchodky');
  return parts.join('-');
}

/**
 * Název listu postupu, nebo null, když se pro tuto variantu list postupu nekreslí: jen výchozí
 * střih (pouzdro-mince-postup) a varianty lišící se jen tloušťkou kůže těla
 * (pouzdro-mince-postup-kuze-1-2mm).
 */
export function coinHolderProcessFileStem(spec: CoinCardHolderSpec): string | null {
  const d = DEFAULT_COIN_CARD_HOLDER;
  const base = coinHolderFileStem({
    ...spec,
    bodyThicknessMm: d.bodyThicknessMm,
    foldSkiveThicknessMm: d.foldSkiveThicknessMm,
  });
  if (base !== 'pouzdro-mince-sablona') return null;
  return coinHolderFileStem(spec).replace('pouzdro-mince-sablona', 'pouzdro-mince-postup');
}

/** Hodnota přepínače `--name value` nebo `--name=value`; undefined, když přepínač chybí. */
function argValue(name: string): string | undefined {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq !== undefined) return eq.slice(name.length + 1);
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  return process.argv[i + 1] ?? '';
}

function readNumberArg(
  name: string,
  min: number,
  max: number,
  named?: Record<string, number>,
  unit = ' mm',
): number | undefined {
  const raw = argValue(name);
  if (raw === undefined) return undefined;
  const names = named ? Object.keys(named).join(', ') : '';
  if (raw === '' || raw.startsWith('--')) {
    throw new Error(
      `${name} potřebuje hodnotu${named ? ` (číslo v mm nebo ${names})` : unit ? ` v${unit}` : ''}.`,
    );
  }
  const key = raw.toLowerCase();
  const namedValue = named && Object.hasOwn(named, key) ? named[key] : undefined;
  // Jen desetinné číslo s tečkou nebo čárkou (žádné 0x20, 1e1 apod.).
  const value =
    namedValue ?? (/^\d+([.,]\d+)?$/.test(raw) ? Number(raw.replace(',', '.')) : Number.NaN);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `${name} musí být mezi ${min} a ${max}${unit}${named ? ` nebo jedno z: ${names}` : ''}.`,
    );
  }
  return value;
}

async function main(): Promise<void> {
  const coin =
    readNumberArg('--coin', 15, 60, NAMED_COINS) ?? DEFAULT_COIN_CARD_HOLDER.coinDiameterMm;
  const window = readNumberArg('--window', 8, 60);
  // Víc než 6 karet už se pás nevejde na A4 na šířku (kontrola modelu by to odmítla).
  const cards = readNumberArg('--cards', 1, 6, undefined, '');
  const thickness = readNumberArg('--thickness', 1, 2);
  // Neznámý přepínač = chyba: překlep by jinak potichu přegeneroval verzovaný výchozí střih.
  const known = ['--coin', '--window', '--cards', '--thickness'];
  // Přepínače bez hodnoty: za nimi nesmí stát hodnota ani „=“.
  const flags = ['--grommet'];
  const args = process.argv.slice(2);
  const bad = args.filter((a, i) => {
    if (a.startsWith('--')) {
      const name = a.split('=')[0] ?? a;
      if (flags.includes(name)) return a !== name;
      return !known.includes(name);
    }
    const prev = args[i - 1];
    return !(prev !== undefined && known.includes(prev));
  });
  if (bad.length > 0) {
    throw new Error(
      `Neznámý přepínač: ${bad.join(' ')}. Povolené: ${[...known, ...flags].join(', ')} (${flags.join(', ')} bez hodnoty).`,
    );
  }
  const grommet = args.includes('--grommet');
  for (const k of [...known, ...flags]) {
    if (args.filter((a) => a === k || a.startsWith(`${k}=`)).length > 1) {
      throw new Error(`Přepínač ${k} je zadaný víckrát.`);
    }
  }
  if (cards !== undefined && !Number.isInteger(cards)) {
    throw new Error('--cards musí být celé číslo (počet karet v přední kapse).');
  }
  const d = DEFAULT_COIN_CARD_HOLDER;
  const body = thickness ?? d.bodyThicknessMm;
  // U tenké kůže (např. Verde 1,2 mm) ztenčení ohybu na 1 mm nemá smysl – vypne se.
  const skive = foldSkiveFor(body);
  if (skive === null && d.foldSkiveThicknessMm !== null) {
    console.log(`Kůže ${cz(body)} mm: ztenčení ohybu vypnuto (rozdíl pod 0,3 mm).`);
  }
  const spec: CoinCardHolderSpec = {
    ...d,
    coinDiameterMm: coin,
    windowDiameterMm: window ?? null,
    cardsCount: cards ?? d.cardsCount,
    bodyThicknessMm: body,
    foldSkiveThicknessMm: skive,
    grommet,
  };
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const stem = coinHolderFileStem(spec);
  // Postup skládání jen pro výchozí střih a jeho variantu s jinou tloušťkou kůže těla (výchozí
  // v aplikaci je 1,2 mm); jiná varianta by přepsala verzovaný soubor.
  const procStem = coinHolderProcessFileStem(spec);
  const svg = buildCoinHolderSheetSvg(spec);
  const svgPath = resolve(outDir, `${stem}.svg`);
  writeFileSync(svgPath, svg, 'utf8');
  console.log(`Zapsáno ${svgPath}`);

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const landscape = (content: string): string =>
    `<style>@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0}.s{width:297mm;height:210mm;overflow:hidden}</style><div class="s">${content}</div>`;
  const page = await browser.newPage();
  await page.setContent(landscape(svg), { waitUntil: 'load' });
  const pdfPath = resolve(outDir, `${stem}.pdf`);
  await page.pdf({
    path: pdfPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  console.log(`Zapsáno ${pdfPath} (A4 na šířku, 100 %)`);
  const pocketStem = stem.replace('pouzdro-mince-sablona', 'pouzdro-mince-kapsa');
  const pocketSvg = buildCoinHolderPocketSvg(spec);
  // Kapsa je vždycky z kůže 1,2 mm: když se varianta liší jen tloušťkou těla, list kapsy je stejný
  // jako u výchozí tloušťky a samostatný soubor by byl jen bajtová kopie.
  const baseThickness = {
    ...spec,
    bodyThicknessMm: d.bodyThicknessMm,
    foldSkiveThicknessMm: d.foldSkiveThicknessMm,
  };
  const basePocketStem = coinHolderFileStem(baseThickness).replace(
    'pouzdro-mince-sablona',
    'pouzdro-mince-kapsa',
  );
  if (basePocketStem !== pocketStem && buildCoinHolderPocketSvg(baseThickness) === pocketSvg) {
    console.log(
      `List kapsy je stejný jako ${basePocketStem}.svg – samostatný soubor se nezapisuje.`,
    );
  } else {
    writeFileSync(resolve(outDir, `${pocketStem}.svg`), pocketSvg, 'utf8');
    const pp = await browser.newPage();
    await pp.setContent(
      `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}.s{width:210mm;height:297mm;overflow:hidden}</style><div class="s">${pocketSvg}</div>`,
      { waitUntil: 'load' },
    );
    await pp.pdf({
      path: resolve(outDir, `${pocketStem}.pdf`),
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    console.log(`Zapsáno ${pocketStem}.svg + .pdf (A4 na výšku, 100 %)`);
  }
  const paperStem = stem.replace('pouzdro-mince-sablona', 'pouzdro-mince-papirovy-model');
  const paperSvg = buildCoinHolderPaperModelSvg(spec);
  writeFileSync(resolve(outDir, `${paperStem}.svg`), paperSvg, 'utf8');
  const pm = await browser.newPage();
  await pm.setContent(landscape(paperSvg), { waitUntil: 'load' });
  await pm.pdf({
    path: resolve(outDir, `${paperStem}.pdf`),
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  console.log(`Zapsáno ${paperStem}.svg + .pdf (papírový model, A4 na šířku)`);
  // Všechno v jednom PDF (A4 na šířku; kapsa otočená o 90°, měřítko 1:1 zůstává).
  const allPages = [paperSvg, svg];
  const rotated = `<div style="width:210mm;height:297mm;transform:translate(297mm,0) rotate(90deg);transform-origin:0 0">${pocketSvg}</div>`;
  const pagesHtml =
    `<style>@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0}.s{width:297mm;height:210mm;overflow:hidden;page-break-after:always;break-after:page}</style>` +
    [...allPages.map((c) => `<div class="s">${c}</div>`), `<div class="s">${rotated}</div>`].join(
      '',
    ) +
    (procStem !== null ? `<div class="s">${buildCoinHolderProcessSvg(spec)}</div>` : '');
  const pa = await browser.newPage();
  await pa.setContent(pagesHtml, { waitUntil: 'load' });
  const allPath = resolve(
    outDir,
    `${stem.replace('pouzdro-mince-sablona', 'pouzdro-mince-vse')}.pdf`,
  );
  await pa.pdf({
    path: allPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  console.log(`Zapsáno ${allPath} (všechny listy v jednom PDF)`);
  if (procStem !== null) {
    const proc = buildCoinHolderProcessSvg(spec);
    const procSvg = resolve(outDir, `${procStem}.svg`);
    writeFileSync(procSvg, proc, 'utf8');
    const pg = await browser.newPage();
    await pg.setContent(landscape(proc), { waitUntil: 'load' });
    await pg.pdf({
      path: resolve(outDir, `${procStem}.pdf`),
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    console.log(`Zapsáno ${procSvg} + .pdf (postup skládání, ilustrace, ne 1:1)`);
    for (let step = 1; step <= PROCESS_STEP_COUNT; step++) {
      writeFileSync(
        resolve(outDir, `${procStem}-krok-${step}.svg`),
        buildCoinHolderProcessStepSvg(step, spec),
        'utf8',
      );
    }
    console.log(`Zapsáno ${procStem}-krok-1…${PROCESS_STEP_COUNT}.svg (kroky pro lekce)`);
  }
  await browser.close();
  const L = coinCardHolderLayout(spec);
  console.log(
    `Pás ${cz(L.stripLengthMm)} × ${cz(L.panelHeightMm)} mm (panel ${cz(L.panelWidthMm)}, ohyby ${cz(L.foldBackFrontMm)} a ${cz(L.foldFrontInnerMm)}), jazyk ${cz(L.tabLengthMm)} mm; ` +
      `kapsa ${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm, okno Ø ${cz(L.windowDiameterMm)} (prstenec ${cz(L.coinRingMm)}), forma Ø ${cz(L.formHoleDiameterMm)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
