/**
 * Vykreslí 1:1 střih pouzdra na karty s vsazenou mincí na jednu stranu A4 (na výšku).
 *
 *   pnpm pattern:coin-holder                 # mince 40 mm (výchozí, „decision coin“ z předlohy)
 *   pnpm pattern:coin-holder --coin 50kc     # česká padesátikoruna (27,5 mm), dále 20kc/10kc/5kc
 *   pnpm pattern:coin-holder --coin 34       # libovolný průměr v mm
 *   pnpm pattern:coin-holder --window 30     # průměr okna = výsečník, který máš (jinak odvozeno)
 *   pnpm pattern:coin-holder --divider       # dělicí panel (s formou se nevejde na jeden A4)
 *
 * Varianty jdou do vlastních souborů (…-mince-27-5mm, …-okno-30mm, …-delici-panel); list postupu
 * se generuje jen pro výchozí střih. Neznámý přepínač je chyba, aby překlep nepřepsal verzované soubory.
 *
 * Výstup: docs/generated/pouzdro-mince-sablona.svg a .pdf. Geometrie je celá
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
 * Obrys těla (nebo jen zadního panelu, když `bottomY` = výška zadního panelu) v soustavě těla:
 * y = 0 horní hrana zadního panelu, jazyk do záporných y, přední panel dole (vzhůru nohama).
 * Souřadnice mapují `X`, `Y`, `R` (posun, měřítko, případně zrcadlení – pak `mirror` prohodí
 * směr oblouků). `scoop` přidá čtvrtkruhový výřez na prst do dolního rohu na straně průchodky
 * (jen pro celé tělo, kde dolní hrana = horní hrana předku).
 */
function lOutline(
  L: CoinCardHolderLayout,
  rc: number,
  X: (x: number) => string,
  Y: (y: number) => string,
  R: (r: number) => string,
  bottomY: number,
  tabLen: number,
  mirror = false,
  scoop = false,
): string {
  const cw = mirror ? 0 : 1; // po směru hodin na obrazovce
  const ccw = mirror ? 1 : 0;
  const W = L.panelWidthMm;
  const rt = L.tabEndRadiusMm;
  const tabRight = tabIsRight(L);
  // Vydutý oblouček v kořeni jazyka (aby tam nebyl ostrý vnitřní roh): menší z rc a půl šířky mimo jazyk.
  const rf = Math.min(rc, (W - (L.tabX1Mm - L.tabX0Mm)) / 2, tabLen / 2);
  const Rs = scoop ? L.scoopRadiusMm : 0;
  // Kam sahá rovná boční hrana jazyka: po začátek zaoblení, u krátkého pahýlu až na konec.
  const tabSideY = tabLen < rt ? -tabLen : -tabLen + rt;
  /** Konec jazyka z x0 do x1 (zleva doprava): plný půlkruh, dva rohy R + rovná hrana, nebo
   * jen rovný pahýl, když je kreslená délka menší než poloměr (pohled zezadu v postupu). */
  const tabEnd = (x0: number, x1: number): string =>
    tabLen < rt
      ? `L${X(x1)} ${Y(-tabLen)}`
      : rt >= (x1 - x0) / 2 - 1e-9
        ? `A${R(rt)} ${R(rt)} 0 0 ${cw} ${X(x1)} ${Y(-tabLen + rt)}`
        : `A${R(rt)} ${R(rt)} 0 0 ${cw} ${X(x0 + rt)} ${Y(-tabLen)} L${X(x1 - rt)} ${Y(-tabLen)} ` +
          `A${R(rt)} ${R(rt)} 0 0 ${cw} ${X(x1)} ${Y(-tabLen + rt)}`;
  // Dolní hrana zprava doleva: pravý roh (nebo výřez při levém jazyku), levý roh (nebo výřez při pravém).
  const rightCorner =
    Rs > 0 && !tabRight
      ? `L${X(W)} ${Y(bottomY - Rs)} A${R(Rs)} ${R(Rs)} 0 0 ${ccw} ${X(W - Rs)} ${Y(bottomY)} `
      : `L${X(W)} ${Y(bottomY - rc)} A${R(rc)} ${R(rc)} 0 0 ${cw} ${X(W - rc)} ${Y(bottomY)} `;
  const leftCorner =
    Rs > 0 && tabRight
      ? `L${X(Rs)} ${Y(bottomY)} A${R(Rs)} ${R(Rs)} 0 0 ${ccw} ${X(0)} ${Y(bottomY - Rs)} `
      : `L${X(rc)} ${Y(bottomY)} A${R(rc)} ${R(rc)} 0 0 ${cw} ${X(0)} ${Y(bottomY - rc)} `;
  const bottom = rightCorner + leftCorner;
  if (tabRight) {
    // Levý horní roh, rovná hrana ke kořeni jazyka, vydutý oblouček, levá hrana jazyka vzhůru,
    // konec jazyka, pravá hrana dolů, dolní hrana zprava doleva, levá hrana vzhůru.
    return (
      `M${X(rc)} ${Y(0)} L${X(L.tabX0Mm - rf)} ${Y(0)} ` +
      (rf > 0 ? `A${R(rf)} ${R(rf)} 0 0 ${ccw} ${X(L.tabX0Mm)} ${Y(-rf)} ` : '') +
      `L${X(L.tabX0Mm)} ${Y(tabSideY)} ${tabEnd(L.tabX0Mm, W)} ` +
      bottom +
      `L${X(0)} ${Y(rc)} A${R(rc)} ${R(rc)} 0 0 ${cw} ${X(rc)} ${Y(0)} Z`
    );
  }
  return (
    `M${X(0)} ${Y(tabSideY)} ${tabEnd(0, L.tabX1Mm)} ` +
    `L${X(L.tabX1Mm)} ${Y(-rf)} ` +
    (rf > 0 ? `A${R(rf)} ${R(rf)} 0 0 ${ccw} ${X(L.tabX1Mm + rf)} ${Y(0)} ` : '') +
    `L${X(W - rc)} ${Y(0)} A${R(rc)} ${R(rc)} 0 0 ${cw} ${X(W)} ${Y(rc)} ` +
    bottom +
    'Z'
  );
}

/** Jazyk je u pravé hrany ⇔ výřez (a průchodka) v levém rohu. Jediný zdroj pravdy pro kresbu. */
const tabIsRight = (L: CoinCardHolderLayout): boolean => L.scoopCornerXMm === 0;

/** Délky (mm) a počty otvorů bočních švů zleva doprava v soustavě těla: u výřezu kratší řada. */
function seamSides(L: CoinCardHolderLayout): {
  left: { lengthMm: number; holes: number };
  right: { lengthMm: number; holes: number };
} {
  const scoopSide = { lengthMm: L.seamLengthScoopSideMm, holes: L.seamHolesScoopSide };
  const tabSide = { lengthMm: L.seamLengthTabSideMm, holes: L.seamHolesTabSide };
  return tabIsRight(L) ? { left: scoopSide, right: tabSide } : { left: tabSide, right: scoopSide };
}

/**
 * Přední panel při pohledu zepředu (hotové pouzdro / přišívání kapsy): obdélník se zaoblenými
 * rohy a čtvrtkruhovým výřezem na prst v horním rohu na straně průchodky. Počátek = levý horní roh.
 */
function frontPanelPath(
  L: CoinCardHolderLayout,
  rc: number,
  ox: number,
  oy: number,
  k: number,
): string {
  const W = L.panelWidthMm * k;
  const H = L.frontHeightMm * k;
  const r = rc * k;
  const Rs = L.scoopRadiusMm * k;
  const scoopLeft = L.scoopCornerXMm === 0;
  const topLeft = scoopLeft
    ? `M${f(ox)} ${f(oy + Rs)} A${f(Rs)} ${f(Rs)} 0 0 0 ${f(ox + Rs)} ${f(oy)} `
    : `M${f(ox)} ${f(oy + r)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + r)} ${f(oy)} `;
  const topRight = scoopLeft
    ? `L${f(ox + W - r)} ${f(oy)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W)} ${f(oy + r)} `
    : `L${f(ox + W - Rs)} ${f(oy)} A${f(Rs)} ${f(Rs)} 0 0 0 ${f(ox + W)} ${f(oy + Rs)} `;
  return (
    topLeft +
    topRight +
    `L${f(ox + W)} ${f(oy + H - r)} A${f(r)} ${f(r)} 0 0 1 ${f(ox + W - r)} ${f(oy + H)} ` +
    `L${f(ox + r)} ${f(oy + H)} A${f(r)} ${f(r)} 0 0 1 ${f(ox)} ${f(oy + H - r)} Z`
  );
}

export function buildCoinHolderSheetSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const { widthMm: W, heightMm: H, marginMm: m, gapMm: gap } = A4_SHEET;
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const out: string[] = [];

  /* --- tělo (tvar L): jazyk nahoře, zadní panel, ohyb, přední panel --- */
  const bx = m;
  // Soustava těla má y = 0 na horní hraně zadního panelu; jazyk sahá do záporných y.
  const by = m + L.tabLengthMm;
  const bw = L.panelWidthMm;
  const Y = (yBody: number): number => by + yBody;
  const tabRight = tabIsRight(L);
  const Rs = L.scoopRadiusMm;
  out.push(
    cut(
      lOutline(
        L,
        rc,
        (x) => f(bx + x),
        (y) => f(Y(y)),
        (r) => f(r),
        L.frontTopMm,
        L.tabLengthMm,
        false,
        true,
      ),
    ),
  );
  // Ohyb: dvě čárkované linky ohraničující přídavek.
  out.push(guide(`M${f(bx)} ${f(Y(L.foldStartMm))} L${f(bx + bw)} ${f(Y(L.foldStartMm))}`, '3 2'));
  out.push(guide(`M${f(bx)} ${f(Y(L.foldEndMm))} L${f(bx + bw)} ${f(Y(L.foldEndMm))}`, '3 2'));
  out.push(
    text(
      bx + bw / 2,
      Y(L.foldStartMm + L.foldAllowanceMm / 2) + 0.9,
      `OHYB ${cz(L.foldAllowanceMm)} mm`,
      2.6,
      'middle',
      GUIDE,
    ),
  );
  // Horní hrana zadního panelu pod jazykem = kde se jazyk láme přes karty.
  out.push(guide(`M${f(bx + L.tabX0Mm)} ${f(Y(0))} L${f(bx + L.tabX1Mm)} ${f(Y(0))}`, '1 1.5'));
  out.push(
    text(bx + bw / 2, Y(0) + 8, 'jazyk se láme přes karty na této hraně', 2.1, 'middle', GUIDE),
  );
  // Konec jazyka bez rezervy: sem se jazyk zkrátí až po zkoušce s kartami a osazení kloboučku.
  const trimY = Y(-L.tabNominalLengthMm);
  out.push(guide(`M${f(bx + L.tabX0Mm)} ${f(trimY)} L${f(bx + L.tabX1Mm)} ${f(trimY)}`, '1 1'));
  // Boční švy jen tam, kde se panely překrývají (od ohybu po horní hranu předku): tečky od ohybu
  // na obou panelech, stejný počet, aby si po přeložení odpovídaly otvor na otvor. Na straně
  // výřezu končí řada pod výřezem (nad ním přední panel není).
  const sides = seamSides(L);
  for (const [x, n] of [
    [bx + so, sides.left.holes],
    [bx + bw - so, sides.right.holes],
  ] as const) {
    // Vodicí čára jen po poslední tečku (řada teček je o zbytek rozteče kratší než překryv).
    const run = (n - 1) * spec.stitchPitchMm;
    const backBottom = Y(L.foldStartMm - so);
    const backTop = backBottom - run;
    out.push(guide(`M${f(x)} ${f(backTop)} L${f(x)} ${f(backBottom)}`, '0.8 1.2'));
    out.push(stitchDots(x, backBottom, x, backTop, spec.stitchPitchMm));
    const frontBottom = Y(L.foldEndMm + so);
    const frontTop = frontBottom + run;
    out.push(guide(`M${f(x)} ${f(frontBottom)} L${f(x)} ${f(frontTop)}`, '0.8 1.2'));
    out.push(stitchDots(x, frontBottom, x, frontTop, spec.stitchPitchMm));
  }
  // Druk: klobouček na jazyku, patice na předním panelu. Poloha na jazyku je výpočet přes
  // tloušťku obsahu – před osazením ověřit s vloženými kartami (obtisknout patici).
  const sr = spec.snapDiameterMm / 2;
  // Popisky druků mimo jazyk: u pravého jazyka vlevo od jeho hrany, u levého vpravo od ní.
  const snapLabelX = tabRight ? bx + L.tabX0Mm - 1.5 : bx + L.tabX1Mm + 1.5;
  const snapAnchor: Anchor = tabRight ? 'end' : 'start';
  out.push(circle(bx + L.snapXMm, Y(L.snapTabYMm), sr, ACCENT, '1.5 1'));
  out.push(cross(bx + L.snapXMm, Y(L.snapTabYMm)));
  out.push(text(snapLabelX, Y(L.snapTabYMm) - 0.5, 'druk – klobouček', 2.1, snapAnchor, ACCENT));
  out.push(text(snapLabelX, Y(L.snapTabYMm) + 2.4, 'ověřit s kartami', 1.9, snapAnchor, ACCENT));
  out.push(text(snapLabelX, trimY - 2.2, 'zkrátit po zkoušce s kartami', 1.7, snapAnchor, GUIDE));
  out.push(
    text(
      snapLabelX,
      trimY + 0.2,
      `(rezerva ${cz(spec.tabFitReserveMm)}, rohy znovu R${cz(L.tabEndRadiusMm)})`,
      1.7,
      snapAnchor,
      GUIDE,
    ),
  );
  out.push(circle(bx + L.snapXMm, Y(L.snapFrontYMm), sr, ACCENT, '1.5 1'));
  out.push(cross(bx + L.snapXMm, Y(L.snapFrontYMm)));
  // Popisek patice pod kružnicí (vedle ní by křížil oblouk výřezu).
  out.push(
    text(bx + L.snapXMm, Y(L.snapFrontYMm) + sr + 3, 'druk – patice', 2.1, 'middle', ACCENT),
  );
  // Průchodka v horním rohu zadního panelu na opačné straně než jazyk.
  out.push(circle(bx + L.grommetXMm, Y(L.grommetYMm), spec.grommetHoleMm / 2));
  out.push(cross(bx + L.grommetXMm, Y(L.grommetYMm), 1));
  out.push(
    text(
      bx + L.grommetXMm,
      Y(L.grommetYMm) + spec.grommetHoleMm / 2 + 3,
      `průchodka Ø ${cz(spec.grommetHoleMm)}`,
      1.9,
      'middle',
      GUIDE,
    ),
  );
  // Kam přišít kapsu s mincí: na předním panelu, který je v rozloženém těle vzhůru nohama –
  // otevřená hrana kapsy směřuje k horní hraně předku (= k většímu y).
  const pxs = bx + L.pocketXMm;
  const pysTop = Y(L.frontTopMm - L.pocketYMm - L.pocketHeightMm);
  out.push(
    guide(
      roundedRect(pxs, pysTop, L.pocketWidthMm, L.pocketHeightMm, rc, spec.pocketTopRadiusMm),
      '1 1',
    ),
  );
  const pcx = pxs + L.pocketWidthMm / 2;
  const pcy = pysTop + L.pocketHeightMm / 2;
  out.push(text(pcx, pcy - 6, 'PŘEDNÍ PANEL', 2.8, 'middle'));
  out.push(text(pcx, pcy - 2.5, `${cz(bw)} × ${cz(L.frontHeightMm)} mm`, 2.1, 'middle', GUIDE));
  out.push(
    text(
      pcx,
      pcy + 0.5,
      `výřez R${cz(Rs)} odkryje ${cz(L.cardExposedMm)} mm karty`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(pcx, pcy + 4.5, 'sem přišít kapsu s mincí (na LÍC)', 2.4, 'middle', GUIDE));
  out.push(
    text(
      pcx,
      pcy + 7.7,
      `${cz(L.pocketYMm)} mm pod horní hranou předku, ${cz(L.pocketXMm)} mm od boků`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      pcx,
      pcy + 10.6,
      'rohy propíchnout šídlem na líc · otevřená hrana k druku',
      2.1,
      'middle',
      GUIDE,
    ),
  );
  // Popisky dílů.
  out.push(
    text(bx + (L.tabX0Mm + L.tabX1Mm) / 2, Y(L.snapTabYMm + sr + 4), 'JAZYK', 2.2, 'middle'),
  );
  out.push(text(bx + bw / 2, Y(L.backHeightMm / 2 - 3), 'TĚLO – ZADNÍ PANEL', 2.8, 'middle'));
  out.push(
    text(
      bx + bw / 2,
      Y(L.backHeightMm / 2 + 0.5),
      `${cz(bw)} × ${cz(L.backHeightMm)} mm · kryje karty celé`,
      2.2,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      bx + bw / 2,
      Y(L.backHeightMm / 2 + 4),
      'motiv / ražení na tuto stranu',
      2.2,
      'middle',
      GUIDE,
    ),
  );
  // Výřez na prst v dolním rohu předku (v soustavě těla); po přeložení leží nad průchodkou.
  const scoopLabelX = tabRight ? bx + Rs / 2 : bx + bw - Rs / 2;
  out.push(text(scoopLabelX, Y(L.frontTopMm) - Rs / 2 - 1, 'výřez na prst', 1.9, 'middle', GUIDE));
  out.push(
    text(
      scoopLabelX,
      Y(L.frontTopMm) - Rs / 2 + 1.6,
      `R${cz(Rs)} · odkryje průchodku`,
      1.9,
      'middle',
      GUIDE,
    ),
  );

  /* --- pravý sloupec: (dělicí panel), kapsa s mincí, forma --- */
  const dx = bx + bw + gap;
  let cy = m;
  if (L.dividerHeightMm !== null) {
    out.push(cut(roundedRect(dx, cy, bw, L.dividerHeightMm, rc)));
    for (const x of [dx + so, dx + bw - so]) {
      const bottom = cy + L.dividerHeightMm - so;
      const top = bottom - L.seamLengthTabSideMm;
      out.push(guide(`M${f(x)} ${f(top)} L${f(x)} ${f(bottom)}`, '0.8 1.2'));
      out.push(stitchDots(x, bottom, x, top, spec.stitchPitchMm));
    }
    out.push(
      text(dx + bw / 2, cy + L.dividerHeightMm / 2, 'DĚLICÍ PANEL (volitelný)', 2.6, 'middle'),
    );
    out.push(
      text(
        dx + bw / 2,
        cy + L.dividerHeightMm / 2 + 3.5,
        `${cz(bw)} × ${cz(L.dividerHeightMm)} mm · slícovat horní hranou s předkem`,
        2.1,
        'middle',
        GUIDE,
      ),
    );
    cy += L.dividerHeightMm + gap;
  }

  const kx = dx;
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
  out.push(circle(ccx, ccy, L.windowDiameterMm / 2));
  out.push(circle(ccx, ccy, spec.coinDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(circle(ccx, ccy, L.formHoleDiameterMm / 2, GUIDE, '0.8 1.2'));
  out.push(cross(ccx, ccy));
  out.push(
    text(kx + L.pocketWidthMm / 2, ky - 2, 'KAPSA S MINCÍ (horní hrana otevřená)', 2.6, 'middle'),
  );
  out.push(
    text(
      ccx,
      ky + L.pocketHeightMm + 3.5,
      `${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm · okno Ø ${cz(L.windowDiameterMm)} (plná) · mince Ø ${cz(spec.coinDiameterMm)} (čárkovaně)`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      ccx,
      ky + L.pocketHeightMm + 6.6,
      `pata důlku Ø ${cz(L.formHoleDiameterMm)} (tečkovaně) · šev ${seam.holes} otvorů od středu dna`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  cy = ky + L.pocketHeightMm + SHEET_CAPTION_MM + gap;

  const fx = dx;
  const fy = cy + SHEET_TITLE_GAP_MM;
  const fs = L.formPlateMm;
  out.push(guide(`M${f(fx)} ${f(fy)} h${f(fs)} v${f(fs)} h${f(-fs)} Z`, '1.5 1.5'));
  out.push(circle(fx + fs / 2, fy + fs / 2, L.formHoleDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(cross(fx + fs / 2, fy + fs / 2));
  out.push(text(fx + fs / 2, fy - 2, 'FORMA PRO DŮLEK (dřevo / HDPE, ne kůže)', 2.6, 'middle'));
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 3.5,
      `otvor Ø ${cz(L.formHoleDiameterMm)} = mince + 2 × kůže ${cz(spec.pocketThicknessMm)} + vůle ${cz(spec.formHoleClearanceMm)} · deska ${cz(fs)} × ${cz(fs)}, tl. ≥ ${cz(spec.formPlateThicknessMm)}`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 6.6,
      'kůže LÍCEM DOLŮ na formu, mince na rub,',
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 9.4,
      'hranu otvoru zaoblit (R1), přiklopit deskou, stáhnout svěrkami',
      2.1,
      'middle',
      GUIDE,
    ),
  );

  /* --- kalibrace a legenda --- */
  const calX = m;
  const calY = H - m - 6;
  out.push(
    `<path d="M${f(calX)} ${f(calY - 2)} V${f(calY + 2)} M${f(calX)} ${f(calY)} H${f(calX + 50)} M${f(calX + 50)} ${f(calY - 2)} V${f(calY + 2)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(
    text(calX, calY - 3, 'KONTROLA MĚŘÍTKA: tato úsečka musí měřit přesně 50 mm', 2.4, 'start'),
  );
  const legend = [
    `POUZDRO NA KARTY S VSAZENOU MINCÍ – střih 1:1, tisk na A4 na 100 % (bez „přizpůsobit stránce“). NÁVRH k ověření na papíru a odřezku.`,
    `Karta ${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)} (${spec.cardsCount} ks), mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm, kapsa ${cz(spec.pocketThicknessMm)} mm. Jazyk ${cz(L.tabLengthMm)} mm od horní hrany zadního panelu.`,
    `Plná čára = řez. Tečky = otvory stehu, rozteč ${cz(spec.stitchPitchMm)} mm, ${cz(so)} mm od hrany; boční švy ${L.seamHolesTabSide} otvorů na straně jazyka, ${L.seamHolesScoopSide} na straně výřezu, počítané od ohybu.`,
    `TĚLO OBKRESLIT NA RUB (masnou stranu) kůže – lícem ven pak vyjde jazyk zepředu ${tabRight ? 'vpravo' : 'vlevo'} a výřez s průchodkou ${tabRight ? 'vlevo' : 'vpravo'}, jako u předlohy. Kapsu obkreslit na LÍC (až po vytvarování, střed na důlku).`,
    `Tečky bočních švů = POČET a poloha od ohybu; otvory nepředsekávat na rubu – po přeložení a slepení boků orýsovat ${cz(so)} mm od hrany na líci předku a prosekat obě vrstvy najednou, počítat od ohybu.`,
    `Pořadí: 1 tělo · 2 kapsa: navlhčit, LÍCEM DOLŮ na formu, mince, přiklopit, svěrky, nechat zaschnout · 3 vyříznout obrys kapsy · 4 vyseknout OKNO (kapsa lícem dolů na formě,`,
    `pod dno špalík) · 5 přišít kapsu na předek (3 strany) · 6 přeložit, prošít boky · 7 průchodka · 8 druk: klobouček na jazyku až po zkoušce s kartami, pak jazyk zkrátit · 9 hrany.`,
  ];
  const legendLine = 3.4;
  let ly = H - m - LEGEND_HEIGHT_MM + (LEGEND_HEIGHT_MM - 12 - legend.length * legendLine) / 2 + 3;
  for (const line of legend) {
    out.push(text(bx, ly, line, 2.2, 'start', GUIDE));
    ly += legendLine;
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Pouzdro na karty s vsazenou mincí – střih 1:1 (tvar L podle předlohy Red Forest). Mince ${cz(spec.coinDiameterMm)} mm, okno ${cz(L.windowDiameterMm)} mm. NÁVRH, ověřit na papíru. -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/**
 * Postup skládání a šití jako list A4 na šířku: osm kroků od vyříznutí po hotové pouzdro
 * zepředu a zezadu. Geometrie dílů je z modelu (zmenšená), takže proporce odpovídají střihu;
 * mince, nit a motiv jsou ilustrativní. Není to výrobní soubor.
 */
export function buildCoinHolderProcessSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const W = 297;
  const H = 210;
  const cols = 4;
  const rows = 2;
  const pad = 8;
  const cellW = (W - 2 * pad) / cols;
  const cellH = (H - 2 * pad - 10) / rows;
  const LEATHER = '#3f6b4f';
  const LEATHER_DARK = '#2f5240';
  const THREAD = '#efe3c2';
  const METAL = '#9a9a9a';
  const FLESH = '#8fae97'; // rub kůže (světlejší, vidět výřezem)
  const out: string[] = [];
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const rt = L.tabEndRadiusMm;

  /** Obrys těla ve tvaru L, měřítko `k`, počátek (ox, oy) = horní hrana zadního panelu vlevo. */
  const bodyPath = (ox: number, oy: number, k: number): string =>
    lOutline(
      L,
      rc,
      (x) => f(ox + x * k),
      (y) => f(oy + y * k),
      (r) => f(r * k),
      L.frontTopMm,
      L.tabLengthMm,
      false,
      true,
    );
  /** Zadní panel s jazykem (rovná horní hrana); `mirror` = pohled zezadu (zrcadlově). */
  const backPanelPath = (
    ox: number,
    oy: number,
    k: number,
    mirror: boolean,
    tabLen: number = L.tabLengthMm,
  ): string =>
    lOutline(
      L,
      rc,
      (x) => f(ox + (mirror ? L.panelWidthMm - x : x) * k),
      (y) => f(oy + y * k),
      (r) => f(r * k),
      L.backHeightMm,
      tabLen,
      mirror,
    );
  const pocketPath = (ox: number, oy: number, k: number): string =>
    roundedRect(
      ox,
      oy,
      L.pocketWidthMm * k,
      L.pocketHeightMm * k,
      spec.pocketTopRadiusMm * k,
      rc * k,
    );
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
  const cell = (i: number, title: string, body: string[]): void => {
    const cx = pad + (i % cols) * cellW;
    const cy = pad + Math.floor(i / cols) * cellH;
    out.push(
      `<rect x="${f(cx + 1)}" y="${f(cy + 1)}" width="${f(cellW - 2)}" height="${f(cellH - 2)}" rx="2" fill="#fbfaf7" stroke="#ddd" stroke-width="0.3"/>`,
    );
    out.push(text(cx + 4, cy + 6.5, `${i + 1}`, 6, 'start', ACCENT));
    out.push(text(cx + 10, cy + 6.5, title, 3.2, 'start'));
    out.push(...body);
  };
  const k = 0.3; // měřítko dílů v buňkách
  const cellOrigin = (i: number): [number, number] => [
    pad + (i % cols) * cellW,
    pad + Math.floor(i / cols) * cellH,
  ];

  /* 1 – vyříznout díly */
  {
    const [cx, cy] = cellOrigin(0);
    const ox = cx + 8;
    const oy = cy + 10 + L.tabLengthMm * k;
    const b: string[] = [];
    b.push(
      `<path d="${bodyPath(ox, oy, k)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      guide(
        `M${f(ox)} ${f(oy + L.foldStartMm * k)} H${f(ox + L.panelWidthMm * k)} M${f(ox)} ${f(oy + L.foldEndMm * k)} H${f(ox + L.panelWidthMm * k)}`,
        '1.5 1',
      ),
    );
    // Kapsa se v tomto kroku NEŘEŽE na míru: jen odřezek s přídavkem, obrys až po vytvarování (krok 3).
    const blank = L.formPlateMm - 4;
    const px = ox + L.panelWidthMm * k + 8;
    const py = cy + 24;
    b.push(
      `<rect x="${f(px)}" y="${f(py)}" width="${f(blank * k)}" height="${f(blank * k)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4" stroke-dasharray="1 0.8"/>`,
    );
    b.push(
      guide(
        pocketPath(
          px + ((blank - L.pocketWidthMm) / 2) * k,
          py + ((blank - L.pocketHeightMm) / 2) * k,
          k,
        ),
        '0.8 0.8',
      ),
    );
    b.push(
      text(
        px + (blank * k) / 2,
        py + blank * k + 3.5,
        `odřezek ≥ ${cz(blank)} × ${cz(blank)}`,
        2.1,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + 4,
        cy + cellH - 8,
        `tělo ${cz(L.panelWidthMm)} × ${cz(L.bodyLengthMm)} mm (pohled na rub; jazyk + rezerva ${cz(spec.tabFitReserveMm)})`,
        2.3,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + 4,
        cy + cellH - 4.5,
        'tělo podle šablony 1:1; kapsa zatím jen odřezek s přídavkem',
        2.3,
        'start',
        GUIDE,
      ),
    );
    cell(0, 'Vyříznout tělo, odřezek na kapsu', b);
  }
  /* 2 – tvarování důlku (řez formou) */
  {
    const [cx, cy] = cellOrigin(1);
    const b: string[] = [];
    const s2 = Math.min(0.9, 52 / L.formPlateMm); // deska formy musí zůstat v buňce
    const ox = cx + 8;
    const oy = cy + 34;
    const plateW = L.formPlateMm * s2;
    const hole = L.formHoleDiameterMm * s2;
    const t = 6; // tloušťka formy v kresbě
    // spodní deska s otvorem
    b.push(
      `<path d="M${f(ox)} ${f(oy)} h${f((plateW - hole) / 2)} v${f(t)} h${f(-(plateW - hole) / 2)} Z M${f(ox + (plateW + hole) / 2)} ${f(oy)} h${f((plateW - hole) / 2)} v${f(t)} h${f(-(plateW - hole) / 2)} Z" fill="#d9c7a0" stroke="#8a7a55" stroke-width="0.4"/>`,
    );
    // kůže: lícem dolů, prohnutá do otvoru
    const lx0 = ox + 4;
    const lx1 = ox + plateW - 4;
    const hx0 = ox + (plateW - hole) / 2;
    const hx1 = ox + (plateW + hole) / 2;
    const depth = 2.6; // ilustrační hloubka důlku = tloušťka mince (deska dosedne na minci)
    b.push(
      `<path d="M${f(lx0)} ${f(oy)} L${f(hx0)} ${f(oy)} Q${f(hx0 + 1)} ${f(oy + depth)} ${f(hx0 + 3)} ${f(oy + depth)} L${f(hx1 - 3)} ${f(oy + depth)} Q${f(hx1 - 1)} ${f(oy + depth)} ${f(hx1)} ${f(oy)} L${f(lx1)} ${f(oy)} v-1.4 L${f(hx1)} ${f(oy - 1.4)} Q${f(hx1 - 1)} ${f(oy + depth - 1.4)} ${f(hx1 - 3)} ${f(oy + depth - 1.4)} L${f(hx0 + 3)} ${f(oy + depth - 1.4)} Q${f(hx0 + 1)} ${f(oy + depth - 1.4)} ${f(hx0)} ${f(oy - 1.4)} L${f(lx0)} ${f(oy - 1.4)} Z" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    // mince na rubu (nahoře)
    const coinW = spec.coinDiameterMm * s2;
    b.push(
      `<rect x="${f(ox + plateW / 2 - coinW / 2)}" y="${f(oy + depth - 1.4 - 2.4)}" width="${f(coinW)}" height="2.4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    // horní deska
    b.push(
      `<rect x="${f(ox)}" y="${f(oy + depth - 1.4 - 2.4 - 3)}" width="${f(plateW)}" height="3" fill="#cfd8dc" stroke="#78909c" stroke-width="0.4"/>`,
    );
    // svěrky (šipky)
    for (const sx of [ox + 6, ox + plateW - 6]) {
      b.push(
        `<path d="M${f(sx)} ${f(oy - 14)} v6 M${f(sx - 1.5)} ${f(oy - 10)} l1.5 2 l1.5 -2" stroke="${ACCENT}" stroke-width="0.5" fill="none"/>`,
      );
    }
    b.push(
      text(
        ox + plateW / 2,
        oy + t + 5,
        `otvor Ø ${cz(L.formHoleDiameterMm)} = mince ${cz(spec.coinDiameterMm)} + 2 × ${cz(spec.pocketThicknessMm)} + ${cz(spec.formHoleClearanceMm)}`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + plateW / 2,
        oy + t + 9,
        `navlhčit · kůže LÍCEM DOLŮ na formu (tl. ≥ ${cz(spec.formPlateThicknessMm)}) · mince na rub`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + plateW / 2,
        oy + t + 13,
        'přiklopit deskou, stáhnout svěrkami, nechat zaschnout',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + plateW / 2,
        oy - 16,
        'horní deska · mince · kůže (rub nahoře) · forma',
        2.1,
        'middle',
        GUIDE,
      ),
    );

    cell(1, 'Vytvarovat důlek za mokra', b);
  }
  /* 3 – kapsa: obrys a okno */
  {
    const [cx, cy] = cellOrigin(2);
    const k3 = 0.8;
    const ox = cx + (cellW - L.pocketWidthMm * k3) / 2;
    const oy = cy + 14;
    const b: string[] = [];
    b.push(
      `<path d="${pocketPath(ox, oy, k3)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    const ccx = ox + L.coinCentreXMm * k3;
    const ccy = oy + L.coinCentreYMm * k3;
    // důlek: světlejší prstenec (vystouplý líc), okno černé
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.formHoleDiameterMm / 2) * k3)}" fill="${LEATHER_DARK}" opacity="0.35"/>`,
    );
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((spec.coinDiameterMm / 2) * k3)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.windowDiameterMm / 2) * k3)}" fill="#fbfaf7" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.pocketHeightMm * k3 + 5,
        `po zaschnutí vyříznout obrys se středem na důlku`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.pocketHeightMm * k3 + 8.5,
        `okno Ø ${cz(L.windowDiameterMm)}: kapsa lícem dolů na formě, pod dno špalík`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.pocketHeightMm * k3 + 12,
        `prstenec ${cz(L.coinRingMm)} mm drží minci`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    cell(2, 'Vyříznout kapsu a vyseknout okno', b);
  }
  /* 4 – přišít kapsu na přední panel */
  {
    const [cx, cy] = cellOrigin(3);
    const k4 = 0.62;
    const ox = cx + (cellW - L.panelWidthMm * k4) / 2;
    const oy = cy + 12;
    const b: string[] = [];
    b.push(
      `<path d="${frontPanelPath(L, rc, ox, oy, k4)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    const px = ox + L.pocketXMm * k4;
    const py = oy + L.pocketYMm * k4;
    b.push(
      `<path d="${pocketPath(px, py, k4)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    const ccx = px + L.coinCentreXMm * k4;
    const ccy = py + L.coinCentreYMm * k4;
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((spec.coinDiameterMm / 2) * k4)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.windowDiameterMm / 2) * k4)}" fill="${LEATHER_DARK}" opacity="0.5"/>`,
    );
    // šev kapsy: U od 10 mm pod horní hranou
    const sx0 = px + so * k4;
    const sx1 = px + (L.pocketWidthMm - so) * k4;
    const syT = py + L.pocketSeamTopMm * k4;
    const syB = py + (L.pocketHeightMm - so) * k4;
    b.push(stitches(sx0, syT, sx0, syB, k4));
    b.push(stitches(sx0, syB, sx1, syB, k4));
    b.push(stitches(sx1, syB, sx1, syT, k4));
    // patice druku
    b.push(
      `<circle cx="${f(ox + L.snapXMm * k4)}" cy="${f(oy + spec.snapFromFrontTopMm * k4)}" r="${f((spec.snapDiameterMm / 2) * k4)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k4 + 5,
        'sedlářský steh po 3 stranách, horní hrana kapsy otevřená',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k4 + 8.5,
        `patice druku ${cz(spec.snapFromFrontTopMm)} mm pod horní hranou předku, na ose jazyka`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    cell(3, 'Přišít kapsu, osadit patici druku', b);
  }
  /* 5 – přeložit a prošít boky */
  {
    const [cx, cy] = cellOrigin(4);
    const k5 = 0.5;
    const ox = cx + (cellW - L.panelWidthMm * k5) / 2;
    const oy = cy + 12 + (L.tabLengthMm + L.backHeightMm - L.frontHeightMm) * k5;
    const b: string[] = [];
    // zadní panel (za předním): rub kůže je vidět výřezem předku, jazyk stojí vzpřímený
    const backTop = oy - (L.backHeightMm - L.frontHeightMm) * k5;
    b.push(
      `<path d="${backPanelPath(ox, backTop, k5, false)}" fill="${FLESH}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // přední panel s výřezem
    b.push(
      `<path d="${frontPanelPath(L, rc, ox, oy, k5)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // boční švy: na straně výřezu jen pod výřezem
    const sides5 = seamSides(L);
    for (const [x, len] of [
      [ox + so * k5, sides5.left.lengthMm],
      [ox + (L.panelWidthMm - so) * k5, sides5.right.lengthMm],
    ] as const) {
      const yb = oy + (L.frontHeightMm - so) * k5;
      b.push(stitches(x, yb, x, yb - len * k5, k5));
    }
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k5 + 5,
        `prošít boky skrz 2 vrstvy: ${L.seamHolesTabSide} otvorů u jazyka, ${L.seamHolesScoopSide} u výřezu`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k5 + 8.5,
        'tečky od ohybu lícují · výřezem předku je vidět rub zadního panelu',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    cell(4, 'Přeložit tělo a prošít boky', b);
  }
  /* 6 – průchodka, klobouček druku po zkoušce */
  {
    const [cx, cy] = cellOrigin(5);
    const k6 = 0.5;
    const ox = cx + 8;
    const oy = cy + 12 + L.tabLengthMm * k6;
    const b: string[] = [];
    b.push(
      `<path d="${backPanelPath(ox, oy, k6, false)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      `<circle cx="${f(ox + L.grommetXMm * k6)}" cy="${f(oy + L.grommetYMm * k6)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k6)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<circle cx="${f(ox + L.grommetXMm * k6)}" cy="${f(oy + L.grommetYMm * k6)}" r="${f((spec.grommetHoleMm / 2) * k6)}" fill="#fbfaf7"/>`,
    );
    b.push(
      `<circle cx="${f(ox + L.snapXMm * k6)}" cy="${f(oy + L.snapTabYMm * k6)}" r="${f((spec.snapDiameterMm / 2) * k6)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      text(
        ox + L.panelWidthMm * k6 + 4,
        oy + L.snapTabYMm * k6 + 1,
        'klobouček druku',
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + L.panelWidthMm * k6 + 4,
        oy + L.snapTabYMm * k6 + 4.5,
        'až po zkoušce s kartami',
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + L.panelWidthMm * k6 + 4,
        oy + L.grommetYMm * k6 + 1,
        `průchodka Ø ${cz(spec.grommetHoleMm)}`,
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        ox + L.panelWidthMm * k6 + 4,
        oy + (L.grommetYMm + 6) * k6 + 1,
        '+ šňůrka',
        2.1,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k6 + 5,
        'vložit karty, přehnout jazyk, obtisknout patici,',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k6 + 8.5,
        'teprve pak osadit klobouček · nakonec srazit a zaleštit hrany',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    cell(5, 'Průchodka a druk', b);
  }
  /* 7 – hotovo zepředu */
  {
    const [cx, cy] = cellOrigin(6);
    const k7 = 0.62;
    const ox = cx + (cellW - L.panelWidthMm * k7) / 2;
    const oy = cy + 14; // horní hrana předku (= horní hrana zadního panelu, jsou stejně vysoké)
    const b: string[] = [];
    const backTop = oy - (L.backHeightMm - L.frontHeightMm) * k7;
    // zadní panel vzadu: rubem dopředu, vidět jen výřezem předku
    b.push(
      `<path d="${roundedRect(ox, backTop, L.panelWidthMm * k7, L.backHeightMm * k7, rc * k7)}" fill="${FLESH}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // karty uvnitř: horní hrana těsně pod hranou panelů, ve výřezu je vidět jejich roh
    const cardX = ox + ((L.panelWidthMm - spec.cardWidthMm) / 2) * k7;
    b.push(
      `<rect x="${f(cardX)}" y="${f(oy + spec.backOverCardMm * k7)}" width="${f(spec.cardWidthMm * k7)}" height="${f((L.scoopRadiusMm + 4) * k7)}" rx="1" fill="#f4efe6" stroke="#bbb" stroke-width="0.3"/>`,
    );
    // přední panel s výřezem
    b.push(
      `<path d="${frontPanelPath(L, rc, ox, oy, k7)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    const sides7 = seamSides(L);
    for (const [x, len] of [
      [ox + so * k7, sides7.left.lengthMm],
      [ox + (L.panelWidthMm - so) * k7, sides7.right.lengthMm],
    ] as const) {
      const yb = oy + (L.frontHeightMm - so) * k7;
      b.push(stitches(x, yb, x, yb - len * k7, k7));
    }
    // kapsa s mincí
    const px = ox + L.pocketXMm * k7;
    const py = oy + L.pocketYMm * k7;
    b.push(
      `<path d="${pocketPath(px, py, k7)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    const ccx = px + L.coinCentreXMm * k7;
    const ccy = py + L.coinCentreYMm * k7;
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((spec.coinDiameterMm / 2) * k7)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.3"/>`,
    );
    b.push(
      `<circle cx="${f(ccx)}" cy="${f(ccy)}" r="${f((L.windowDiameterMm / 2) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(text(ccx, ccy + 1, 'MINCE', 2.4, 'middle', '#fff'));
    const sx0 = px + so * k7;
    const sx1 = px + (L.pocketWidthMm - so) * k7;
    const syT = py + L.pocketSeamTopMm * k7;
    const syB = py + (L.pocketHeightMm - so) * k7;
    b.push(stitches(sx0, syT, sx0, syB, k7));
    b.push(stitches(sx0, syB, sx1, syB, k7));
    b.push(stitches(sx1, syB, sx1, syT, k7));
    // jazyk přehnutý přes horní hranu na předek, už zkrácený (bez rezervy), konec s kloboučkem
    const tabDown = (spec.snapFromFrontTopMm + spec.tabBeyondSnapMm) * k7;
    const rtk = Math.min(rt * k7, ((L.tabX1Mm - L.tabX0Mm) * k7) / 2);
    const tx0 = ox + L.tabX0Mm * k7;
    const tx1 = ox + L.tabX1Mm * k7;
    b.push(
      `<path d="M${f(tx0)} ${f(backTop)} L${f(tx1)} ${f(backTop)} L${f(tx1)} ${f(oy + tabDown - rtk)} A${f(rtk)} ${f(rtk)} 0 0 1 ${f(tx1 - rtk)} ${f(oy + tabDown)} L${f(tx0 + rtk)} ${f(oy + tabDown)} A${f(rtk)} ${f(rtk)} 0 0 1 ${f(tx0)} ${f(oy + tabDown - rtk)} Z" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    b.push(
      `<circle cx="${f(ox + L.snapXMm * k7)}" cy="${f(oy + spec.snapFromFrontTopMm * k7)}" r="${f((spec.snapDiameterMm / 2) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    // průchodka v zadním panelu, vidět výřezem, se šňůrkou ven
    const gx = ox + L.grommetXMm * k7;
    const gy = backTop + L.grommetYMm * k7;
    b.push(
      `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    const lanyardDir = tabIsRight(L) ? -1 : 1;
    b.push(
      `<path d="M${f(gx)} ${f(gy)} q${f(6 * lanyardDir)} -8 ${f(10 * lanyardDir)} -2" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k7 + 5,
        'zepředu: jazyk zapnutý, karty schované, výřezem vidět průchodku',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k7 + 8.5,
        `složené ≈ ${cz(L.panelWidthMm)} × ${cz(L.backHeightMm)} mm`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    cell(6, 'Hotovo – zepředu', b);
  }
  /* 8 – hotovo zezadu */
  {
    const [cx, cy] = cellOrigin(7);
    const k8 = 0.62;
    const ox = cx + (cellW - L.panelWidthMm * k8) / 2;
    const oy = cy + 14 + 4;
    const b: string[] = [];
    // zezadu je zadní panel zrcadlově (při jazyku vpravo zepředu je tu jazyk vlevo, průchodka vpravo)
    b.push(
      `<path d="${backPanelPath(ox, oy, k8, true, 5)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // motiv (ilustrativní)
    b.push(
      `<rect x="${f(ox + 12 * k8)}" y="${f(oy + 22 * k8)}" width="${f(42 * k8)}" height="${f(30 * k8)}" rx="2" fill="none" stroke="${LEATHER_DARK}" stroke-width="0.4" stroke-dasharray="1 1"/>`,
    );
    b.push(text(ox + 33 * k8, oy + 39 * k8, 'motiv / ražení', 2.3, 'middle', LEATHER_DARK));
    // zrcadlově: řada u výřezu (kratší) je na straně průchodky
    const sides8 = seamSides(L); // zrcadlově: levá řada kresby = pravá strana těla
    for (const [x, len] of [
      [ox + so * k8, sides8.right.lengthMm],
      [ox + (L.panelWidthMm - so) * k8, sides8.left.lengthMm],
    ] as const) {
      const yb = oy + (L.backHeightMm - so) * k8;
      b.push(stitches(x, yb, x, yb - len * k8, k8));
    }
    const gx = ox + (L.panelWidthMm - L.grommetXMm) * k8;
    const gy = oy + L.grommetYMm * k8;
    b.push(
      `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k8)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<path d="M${f(gx)} ${f(gy)} q${f(-8 * (tabIsRight(L) ? -1 : 1))} 6 ${f(-6 * (tabIsRight(L) ? -1 : 1))} 14 q1 5 4 8" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k8 + 5,
        'zezadu: motiv, průchodka se šňůrkou v rohu naproti jazyku',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k8 + 8.5,
        'jazyk odchází přes hranu dopředu · zadní panel celý (odchylka)',
        2.2,
        'middle',
        GUIDE,
      ),
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
    `<!-- Postup skládání pouzdra s mincí (ilustrace, ne 1:1). Mince ${cz(spec.coinDiameterMm)} mm. -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/**
 * Název souboru podle odchylek od výchozího střihu, aby varianta nepřepsala verzovaný soubor:
 * jiná mince → „-mince-27-5mm“, vlastní okno → „-okno-30mm“, dělicí panel → „-delici-panel“.
 */
export function coinHolderFileStem(spec: CoinCardHolderSpec): string {
  const d = DEFAULT_COIN_CARD_HOLDER;
  const parts = ['pouzdro-mince-sablona'];
  if (spec.coinDiameterMm !== d.coinDiameterMm) {
    parts.push(`mince-${f(spec.coinDiameterMm).replace('.', '-')}mm`);
  }
  if (spec.windowDiameterMm !== null)
    parts.push(`okno-${f(spec.windowDiameterMm).replace('.', '-')}mm`);
  if (spec.dividerPanel) parts.push('delici-panel');
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
  const known = ['--coin', '--window', '--divider'];
  const args = process.argv.slice(2);
  const bad = args.filter((a, i) => {
    if (a.startsWith('--')) return !known.includes(a.split('=')[0] ?? a);
    const prev = args[i - 1];
    return !(prev === '--coin' || prev === '--window');
  });
  if (bad.length > 0) {
    throw new Error(`Neznámý přepínač: ${bad.join(' ')}. Povolené: ${known.join(', ')}.`);
  }
  const spec: CoinCardHolderSpec = {
    ...DEFAULT_COIN_CARD_HOLDER,
    coinDiameterMm: coin,
    windowDiameterMm: window ?? null,
    dividerPanel: process.argv.includes('--divider'),
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
  const page = await browser.newPage();
  await page.setContent(
    `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}.s{width:210mm;height:297mm;overflow:hidden}</style><div class="s">${svg}</div>`,
    { waitUntil: 'load' },
  );
  const pdfPath = resolve(outDir, `${stem}.pdf`);
  await page.pdf({
    path: pdfPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  console.log(`Zapsáno ${pdfPath} (A4 na výšku, 100 %)`);
  // Postup skládání jen pro výchozí střih (jiná varianta by přepsala verzovaný soubor).
  if (stem === 'pouzdro-mince-sablona') {
    const proc = buildCoinHolderProcessSvg(spec);
    const procSvg = resolve(outDir, 'pouzdro-mince-postup.svg');
    writeFileSync(procSvg, proc, 'utf8');
    const pg = await browser.newPage();
    await pg.setContent(
      `<style>@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0}.s{width:297mm;height:210mm;overflow:hidden}</style><div class="s">${proc}</div>`,
      { waitUntil: 'load' },
    );
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
    `Panely ${cz(L.panelWidthMm)} × ${cz(L.frontHeightMm)} / ${cz(L.backHeightMm)} mm, ohyb ${cz(L.foldAllowanceMm)}, jazyk ${cz(L.tabLengthMm)}, tělo ${cz(L.bodyLengthMm)} mm; ` +
      `kapsa ${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm, okno Ø ${cz(L.windowDiameterMm)} (prstenec ${cz(L.coinRingMm)}), forma Ø ${cz(L.formHoleDiameterMm)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
