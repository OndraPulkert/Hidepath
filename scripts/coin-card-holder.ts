/**
 * Vykreslí 1:1 střih pouzdra na karty s vsazenou mincí na jednu stranu A4 (na šířku).
 *
 *   pnpm pattern:coin-holder                 # mince 40 mm (výchozí, „decision coin“ z předlohy)
 *   pnpm pattern:coin-holder --coin 50kc     # česká padesátikoruna (27,5 mm), dále 20kc/10kc/5kc
 *   pnpm pattern:coin-holder --coin 34       # libovolný průměr v mm
 *   pnpm pattern:coin-holder --window 30     # průměr okna = výsečník, který máš (jinak odvozeno)
 *
 * Varianty jdou do vlastních souborů (…-mince-27-5mm, …-okno-30mm); list postupu
 * se generuje jen pro výchozí střih. Neznámý přepínač je chyba, aby překlep nepřepsal verzované soubory.
 *
 * Výstup: docs/generated/pouzdro-mince-sablona.svg a .pdf (A4 NA ŠÍŘKU). Geometrie je celá
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
  GROMMET_FLANGE_MM,
  CALIBRATION_GAP_MM,
  SEAM_LABEL_GAP_MM,
  SHEET_CAPTION_MM,
  SHEET_TITLE_GAP_MM,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');

const INK = '#2b2b2b';
const GUIDE = '#7a7a7a';
const ACCENT = '#a2471f';
/** Značka otvoru stehu: poloměr tečky v mm. Testy podle něj tečky rozeznávají. */
const DOT_R = 0.45;

type Anchor = 'start' | 'middle' | 'end';

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
  return (
    `M${f(x + rt)} ${f(y)} L${f(x + w - rt)} ${f(y)} A${f(rt)} ${f(rt)} 0 0 1 ${f(x + w)} ${f(y + rt)} ` +
    `L${f(x + w)} ${f(y + h - rb)} A${f(rb)} ${f(rb)} 0 0 1 ${f(x + w - rb)} ${f(y + h)} ` +
    `L${f(x + rb)} ${f(y + h)} A${f(rb)} ${f(rb)} 0 0 1 ${f(x)} ${f(y + h - rb)} ` +
    `L${f(x)} ${f(y + rt)} A${f(rt)} ${f(rt)} 0 0 1 ${f(x + rt)} ${f(y)} Z`
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
  const rf = L.tabRootFilletMm;
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
    `L${P(L.tabX1Mm, -rf)} ` +
    (rf > 0 ? arc(rf, ccw, L.tabX1Mm + rf, 0) : '') +
    // Výkus: čtvrtkruhy se středem v rohu panelu na horní hraně (u ohybu A), tedy dovnitř pásu.
    `L${P(L.scoopStartXMm, 0)} ` +
    arc(S, ccw, L.backX1Mm, S) +
    `L${P(L.frontX0Mm, S)} ` +
    arc(S, ccw, L.scoopEndXMm, 0) +
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
      ? `L${f(ox + W - S)} ${f(oy)} A${f(S)} ${f(S)} 0 0 0 ${f(ox + W)} ${f(oy + S)} `
      : `L${f(ox + W - r)} ${f(oy)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W)} ${f(oy + r)} `;
  return (
    topLeft +
    topRight +
    `L${f(ox + W)} ${f(oy + H - r)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W - r)} ${f(oy + H)} ` +
    `L${f(ox + r)} ${f(oy + H)} A${f(r)} ${f(r)} 0 0 1 ${f(ox)} ${f(oy + H - r)} Z`
  );
}

/**
 * Střih 1:1 na A4 **na šířku**: rozložený pás (tři panely, jazyk, výřez), vpravo kapsa s mincí
 * a otvor formy. Soustava pásu: x = 0 levý konec (u jazyka), y = 0 horní otevřená hrana.
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
  }

  /* --- šev dna: čára přes celý pás, tečky jen na předním panelu --- */
  const seamY = L.bottomSeamYMm;
  out.push(guide(`M${f(X(0))} ${f(Y(seamY))} L${f(X(L.stripLengthMm))} ${f(Y(seamY))}`, '0.8 1.2'));
  const run = (L.bottomSeamHoles - 1) * spec.stitchPitchMm;
  const seamX0 = L.frontX0Mm + so;
  out.push(stitchDots(X(seamX0), Y(seamY), X(seamX0 + run), Y(seamY), spec.stitchPitchMm));
  out.push(
    text(
      X(L.frontX0Mm + L.panelWidthMm / 2),
      Y(L.panelHeightMm + SEAM_LABEL_GAP_MM),
      `ŠEV DNA ${cz(so)} mm od hrany · ${L.bottomSeamHoles} otvorů · sekat skrz všechny vrstvy`,
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
    text(labelX, Y(L.snapYTabMm) + 2.4, 'osadit až po zkoušce s kartami', 1.9, anchor, ACCENT),
  );
  const trimY = Y(-L.tabNominalLengthMm);
  out.push(guide(`M${f(X(L.tabX0Mm))} ${f(trimY)} L${f(X(L.tabX1Mm))} ${f(trimY)}`, '1 1'));
  out.push(text(labelX, trimY - 1.5, 'sem jazyk zkrátit po zkoušce', 1.9, anchor, GUIDE));
  out.push(
    text(
      labelX,
      trimY + 1.2,
      `(rezerva ${cz(spec.tabFitReserveMm)}, rohy znovu R${cz(L.tabEndRadiusMm)})`,
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
  out.push(
    text(
      pcx,
      pcy - 1.6,
      `${cz(L.pocketYMm)} mm od horní hrany, ${cz(L.pocketXMm)} mm od boků`,
      2.2,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(pcx, pcy + 2.4, 'otevřená hrana kapsy nahoru', 2.2, 'middle', GUIDE));

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

  /* --- perforace ohybů (jako předloha): řady Ø 1,5 přes pásmo ohybu --- */
  const perfR = 0.75;
  const perforate = (x0: number, x1: number, yTop: number): void => {
    const c = (x0 + x1) / 2;
    // Tři řady jen v pásmu, kde mezi otvory zůstane aspoň 1,5 mm kůže; v užším pásmu dvě.
    const wide = x1 - x0 >= 10;
    const off = wide ? Math.min(4, (x1 - x0) / 2 - 1.2) : Math.min(1.6, (x1 - x0) / 2 - 1.2);
    const n = Math.floor((L.bottomSeamYMm - 4 - yTop) / spec.stitchPitchMm) + 1;
    for (const dx of wide ? [-off, 0, off] : [-off, off]) {
      for (let i = 0; i < n; i++) {
        out.push(circle(X(c + dx), Y(yTop + i * spec.stitchPitchMm), perfR, GUIDE));
      }
    }
  };
  perforate(L.backX1Mm, L.frontX0Mm, S + 4);
  if (L.innerX0Mm !== null) perforate(L.frontX1Mm, L.innerX0Mm, 4);

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
  const front = spec.tabSide === 'right' ? 'vpravo' : 'vlevo';
  const back = spec.tabSide === 'right' ? 'vlevo' : 'vpravo';
  const legend = [
    `POUZDRO NA KARTY S VSAZENOU MINCÍ – LIST 1/2: PÁS. Tisk na A4 NA ŠÍŘKU na 100 % (bez „přizpůsobit stránce“). Kapsa s mincí a forma jsou na listu 2. NÁVRH k ověření na papíru.`,
    `Karty ${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)} (${spec.cardsCount} ks) vepředu, bankovky složené napůl vzadu, mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm.`,
    `Jeden pás: ZADNÍ + ohyb A + PŘEDNÍ + ohyb B + VNITŘNÍ panel. Po složení jsou obě boční hrany OHYBY, šije se jen dno (skrz všechny vrstvy), horní hrana zůstává otevřená.`,
    `PÁS OBKRESLIT NA LÍC – přední panel je nakreslený tak, jak bude vidět. Jazyk vyjde zepředu ${front} (zezadu ${back}), výřez na prst naproti němu.`,
    `Plná čára = řez, čárkovaně = ohyb, tečky = otvory stehu (rozteč ${cz(spec.stitchPitchMm)} mm, sekat až po složení), kroužky v ohybech = perforace Ø 1,5 (jako předloha; usnadní ohyb).`,
    `Pořadí: 1 pás · 2–3 kapsa (list 2) · 4 přišít kapsu, osadit patici druku a průchodku NAPLOCHO · 5 složit (vnitřní za přední, zadní přes vše) · 6 slepit a prošít dno`,
    `· 7 klobouček až po zkoušce s kartami i bankovkami, pak jazyk zkrátit a znovu zaoblit · 8 srazit a zaleštit hrany (i výřez a horní hranu vnitřního panelu – předem).`,
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
 * List 2/2 (A4 na výšku, 1:1): kapsa s mincí a otvor formy pro důlek.
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
  const ky = cy + SHEET_TITLE_GAP_MM;
  out.push(cut(roundedRect(kx, ky, L.pocketWidthMm, L.pocketHeightMm, spec.pocketTopRadiusMm, rc)));
  const seam = pocketSeam(
    kx + so,
    kx + L.pocketWidthMm - so,
    ky + L.pocketSeamTopMm,
    ky + L.pocketHeightMm - so,
    Math.max(0.5, rc - so),
    spec.stitchPitchMm,
  );
  out.push(guide(seam.path, '0.8 1.2'));
  out.push(seam.dots);
  const ccx = kx + L.coinCentreXMm;
  const ccy = ky + L.coinCentreYMm;
  out.push(ring(ccx, ccy, L.windowDiameterMm / 2));
  out.push(circle(ccx, ccy, spec.coinDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(circle(ccx, ccy, L.formHoleDiameterMm / 2, GUIDE, '0.8 1.2'));
  out.push(cross(ccx, ccy));
  const tx = kx + L.pocketWidthMm + 6;
  const lines = [
    `${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm`,
    `okno Ø ${cz(L.windowDiameterMm)} (plná čára)`,
    `mince Ø ${cz(spec.coinDiameterMm)} (čárkovaně)`,
    `pata důlku Ø ${cz(L.formHoleDiameterMm)} (tečkovaně)`,
    `šev ${seam.holes} otvorů od středu dna`,
    'otvory švu prosekat PŘED tvarováním,',
    'obrys vyříznout až po zaschnutí,',
    'okno vyseknout před přišitím',
    `na přední panel: ${cz(L.pocketYMm)} mm pod horní hranou,`,
    `${cz(L.pocketXMm)} mm od boků, otevřenou hranou nahoru`,
  ];
  lines.forEach((t, i) => out.push(text(tx, ky + 4 + i * 3.6, t, 2.4, 'start', GUIDE)));

  cy = ky + L.pocketHeightMm + SHEET_CAPTION_MM + A4_SHEET.gapMm;
  out.push(text(m, cy + 2.5, 'OTVOR FORMY PRO DŮLEK', 2.8, 'start'));
  const fy = cy + SHEET_TITLE_GAP_MM;
  const fcx = kx + L.formHoleDiameterMm / 2;
  const fcy = fy + L.formHoleDiameterMm / 2;
  out.push(ring(fcx, fcy, L.formHoleDiameterMm / 2));
  out.push(cross(fcx, fcy));
  const flines = [
    `Ø ${cz(L.formHoleDiameterMm)} = mince ${cz(spec.coinDiameterMm)} + 2 × kůže ${cz(spec.pocketThicknessMm)} + vůle ${cz(spec.formHoleClearanceMm)}`,
    `deska ≥ ${cz(L.formPlateMm)} × ${cz(L.formPlateMm)} mm, tloušťka ≥ ${cz(spec.formPlateThicknessMm)} mm`,
    'překližka, dřevo nebo HDPE; hranu otvoru zaoblit smirkem',
    'kůže LÍCEM DOLŮ na formu, mince na rub, přiklopit deskou, svěrky',
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
    'POUZDRO NA KARTY S VSAZENOU MINCÍ – LIST 2/2: KAPSA A FORMA.',
    'Tisk na A4 NA VÝŠKU na 100 % (bez „přizpůsobit stránce“).',
    `Kapsa z kůže ${cz(spec.pocketThicknessMm)} mm; odřezek ≥ ${cz(L.formPlateMm - 4)} × ${cz(L.formPlateMm - 4)} mm.`,
    'Plná čára = řez, tečky = otvory stehu, čárkovaně/tečkovaně = pomocné kružnice.',
  ];
  legend.forEach((t, i) =>
    out.push(text(m, H - m - LEGEND_HEIGHT_MM + 4 + i * 3.2, t, 2.2, 'start', GUIDE)),
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
        ox + (blank + 3) * k1,
        oy + (L.panelHeightMm + 6 + blank / 2) * k1,
        `odřezek na kapsu ≥ ${cz(blank)} × ${cz(blank)}`,
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      ...caption(0, [
        `pás ${cz(L.stripLengthMm)} × ${cz(L.panelHeightMm)} mm + jazyk ${cz(L.tabLengthMm)} (s rezervou ${cz(spec.tabFitReserveMm)})`,
        'obkreslit na LÍC, kapsu zatím jen jako odřezek',
      ]),
    );
    cell(0, 'Vyříznout pás', b);
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
        `otvor Ø ${cz(L.formHoleDiameterMm)} = mince ${cz(spec.coinDiameterMm)} + 2 × ${cz(spec.pocketThicknessMm)} + ${cz(spec.formHoleClearanceMm)}`,
        `navlhčit · kůže LÍCEM DOLŮ na formu (tl. ≥ ${cz(spec.formPlateThicknessMm)}) · mince na rub`,
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
        'po zaschnutí vyříznout obrys kapsy se středem na důlku',
        `okno Ø ${cz(L.windowDiameterMm)}: kapsa lícem dolů na formě, pod dno špalík`,
        `prstenec ${cz(L.coinRingMm)} mm drží minci`,
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
        'sedlářský steh po 3 stranách, horní hrana kapsy otevřená',
        `patice druku ${cz(spec.snapFromTopMm)} mm pod horní hranou, na ose jazyka`,
        'průchodku do vnitřního panelu osadit teď, naplocho',
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
    b.push(text(ox + w - 1.5, lay(1) - 1.6, 'VNITŘNÍ (průchodka)', 2, 'end', GUIDE));
    b.push(text(ox + w * 0.25, lay(1) + 4.4, 'karty', 2, 'middle', '#8a7a55'));
    b.push(text(ox + w / 2, lay(2) + 3.6, 'PŘEDNÍ (líc ven, kapsa s mincí)', 2.1, 'middle', GUIDE));
    b.push(text(ox + w / 2, lay(2) + 7, '↓ pohled zepředu ↓', 2, 'middle', ACCENT));
    b.push(
      ...caption(4, [
        'řez shora (dopředu = dolů): vnitřní se ohne za přední (ohyb B),',
        'zadní panel se přehne přes všechno (ohyb A)',
        'obě boční hrany pouzdra jsou ohyby, nešijí se',
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
    b.push(
      `<circle cx="${f(ox + spec.grommetFromEdgeMm * k6)}" cy="${f(oy + spec.grommetFromEdgeMm * k6)}" r="${f((spec.grommetHoleMm / 2 + GROMMET_FLANGE_MM) * k6)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
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
        `dno prošít skrz všechny vrstvy: ${L.bottomSeamHoles} otvorů, rozteč ${cz(spec.stitchPitchMm)} mm`,
        `slepit, orýsovat ${cz(so)} mm od hrany, otvory sekat až po složení`,
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
    const gx = ox + spec.grommetFromEdgeMm * k7;
    const gy = oy + spec.grommetFromEdgeMm * k7;
    b.push(
      `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<path d="M${f(gx)} ${f(gy)} q-6 -8 -10 -2" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
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
        'zepředu: jazyk zapnutý, výřezem vidět kartu a nad ní průchodku',
        `složené ≈ ${cz(L.panelWidthMm)} × ${cz(L.panelHeightMm)} mm`,
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
    const gx = ox + (L.panelWidthMm - spec.grommetFromEdgeMm) * k8;
    const gy = oy + spec.grommetFromEdgeMm * k8;
    b.push(
      `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k8)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<path d="M${f(gx)} ${f(gy)} q8 6 6 14 q-1 5 -4 8" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
    );
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
        'výřez s průchodkou a šňůrkou naproti jazyku',
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
/**
 * Název souboru podle odchylek od výchozího střihu, aby varianta nepřepsala verzovaný soubor:
 * jiná mince → „-mince-27-5mm“, vlastní okno → „-okno-30mm“, jazyk na druhé straně → „-jazyk-vlevo“.
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
  return parts.join('-');
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
): number | undefined {
  const raw = argValue(name);
  if (raw === undefined) return undefined;
  const names = named ? Object.keys(named).join(', ') : '';
  if (raw === '' || raw.startsWith('--')) {
    throw new Error(`${name} potřebuje hodnotu${named ? ` (číslo v mm nebo ${names})` : ' v mm'}.`);
  }
  const key = raw.toLowerCase();
  const namedValue = named && Object.hasOwn(named, key) ? named[key] : undefined;
  // Jen desetinné číslo s tečkou nebo čárkou (žádné 0x20, 1e1 apod.).
  const value =
    namedValue ?? (/^\d+([.,]\d+)?$/.test(raw) ? Number(raw.replace(',', '.')) : Number.NaN);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `${name} musí být mezi ${min} a ${max} mm${named ? ` nebo jedno z: ${names}` : ''}.`,
    );
  }
  return value;
}

async function main(): Promise<void> {
  const coin =
    readNumberArg('--coin', 15, 60, NAMED_COINS) ?? DEFAULT_COIN_CARD_HOLDER.coinDiameterMm;
  const window = readNumberArg('--window', 8, 60);
  // Neznámý přepínač = chyba: překlep by jinak potichu přegeneroval verzovaný výchozí střih.
  const known = ['--coin', '--window'];
  const args = process.argv.slice(2);
  const bad = args.filter((a, i) => {
    if (a.startsWith('--')) return !known.includes(a.split('=')[0] ?? a);
    const prev = args[i - 1];
    return !(prev === '--coin' || prev === '--window');
  });
  if (bad.length > 0) {
    throw new Error(`Neznámý přepínač: ${bad.join(' ')}. Povolené: ${known.join(', ')}.`);
  }
  for (const k of known) {
    if (args.filter((a) => a === k || a.startsWith(`${k}=`)).length > 1) {
      throw new Error(`Přepínač ${k} je zadaný víckrát.`);
    }
  }
  const spec: CoinCardHolderSpec = {
    ...DEFAULT_COIN_CARD_HOLDER,
    coinDiameterMm: coin,
    windowDiameterMm: window ?? null,
  };
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const stem = coinHolderFileStem(spec);
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
  // Postup skládání jen pro výchozí střih (jiná varianta by přepsala verzovaný soubor).
  if (stem === 'pouzdro-mince-sablona') {
    const proc = buildCoinHolderProcessSvg(spec);
    const procSvg = resolve(outDir, 'pouzdro-mince-postup.svg');
    writeFileSync(procSvg, proc, 'utf8');
    const pg = await browser.newPage();
    await pg.setContent(landscape(proc), { waitUntil: 'load' });
    await pg.pdf({
      path: resolve(outDir, 'pouzdro-mince-postup.pdf'),
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    console.log(`Zapsáno ${procSvg} + .pdf (postup skládání, ilustrace, ne 1:1)`);
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
