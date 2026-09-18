/**
 * Vykreslí 1:1 střih pouzdra na karty s vsazenou mincí na jednu stranu A4 (na výšku).
 *
 *   pnpm pattern:coin-holder                 # mince 40 mm (výchozí, „decision coin“ z předlohy)
 *   pnpm pattern:coin-holder --coin 50kc     # česká padesátikoruna (27,5 mm), dále 20kc/10kc/5kc
 *   pnpm pattern:coin-holder --coin 34       # libovolný průměr v mm
 *   pnpm pattern:coin-holder --window 30     # průměr okna = výsečník, který máš (jinak odvozeno)
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
  type CoinCardHolderSpec,
  assertCoinCardHolder,
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
  const tw = L.tabX1Mm;
  const rt = L.tabEndRadiusMm;
  const nr = L.notchRadiusMm;
  const notchEndX = L.notchCentreXMm + nr;
  out.push(
    cut(
      // Levá hrana od dolního rohu předku nahoru až na jazyk, půlkruh konce jazyka (po směru
      // hodin), pravá hrana jazyka dolů k horní hraně zadního panelu, výřez na prst (proti
      // směru, tj. dovnitř), rovná horní hrana, pravý horní roh, pravá hrana dolů, oba dolní rohy
      // předku, zpět po levé hraně.
      `M${f(bx)} ${f(Y(-L.tabLengthMm + rt))} ` +
        `A${f(rt)} ${f(rt)} 0 0 1 ${f(bx + tw)} ${f(Y(-L.tabLengthMm + rt))} ` +
        `L${f(bx + tw)} ${f(Y(0))} ` +
        `A${f(nr)} ${f(nr)} 0 0 0 ${f(bx + notchEndX)} ${f(Y(0))} ` +
        `L${f(bx + bw - rc)} ${f(Y(0))} A${f(rc)} ${f(rc)} 0 0 1 ${f(bx + bw)} ${f(Y(rc))} ` +
        `L${f(bx + bw)} ${f(Y(L.frontTopMm - rc))} ` +
        `A${f(rc)} ${f(rc)} 0 0 1 ${f(bx + bw - rc)} ${f(Y(L.frontTopMm))} ` +
        `L${f(bx + rc)} ${f(Y(L.frontTopMm))} ` +
        `A${f(rc)} ${f(rc)} 0 0 1 ${f(bx)} ${f(Y(L.frontTopMm - rc))} Z`,
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
  // Horní hrana zadního panelu = kde se jazyk láme přes karty.
  out.push(guide(`M${f(bx + notchEndX)} ${f(Y(0))} L${f(bx + tw)} ${f(Y(0))}`, '1 1.5'));
  out.push(
    text(bx + bw / 2, Y(nr) + 8, 'jazyk se láme přes karty na této hraně', 2.1, 'middle', GUIDE),
  );
  // Boční švy jen tam, kde se panely překrývají (od ohybu po horní hranu předku): tečky od ohybu
  // na obou panelech, stejný počet, aby si po přeložení odpovídaly otvor na otvor.
  for (const x of [bx + so, bx + bw - so]) {
    const backBottom = Y(L.foldStartMm - so);
    const backTop = backBottom - L.sideSeamLengthMm;
    out.push(guide(`M${f(x)} ${f(backTop)} L${f(x)} ${f(backBottom)}`, '0.8 1.2'));
    out.push(stitchDots(x, backBottom, x, backTop, spec.stitchPitchMm));
    const frontBottom = Y(L.foldEndMm + so);
    const frontTop = frontBottom + L.sideSeamLengthMm;
    out.push(guide(`M${f(x)} ${f(frontBottom)} L${f(x)} ${f(frontTop)}`, '0.8 1.2'));
    out.push(stitchDots(x, frontBottom, x, frontTop, spec.stitchPitchMm));
  }
  // Druk: klobouček na jazyku, patice na předním panelu. Poloha na jazyku je výpočet přes
  // tloušťku obsahu – před osazením ověřit s vloženými kartami (obtisknout patici).
  const sr = spec.snapDiameterMm / 2;
  out.push(circle(bx + L.snapXMm, Y(L.snapTabYMm), sr, ACCENT, '1.5 1'));
  out.push(cross(bx + L.snapXMm, Y(L.snapTabYMm)));
  out.push(
    text(
      bx + L.snapXMm + sr + 1.5,
      Y(L.snapTabYMm) - 0.5,
      'druk – klobouček',
      2.1,
      'start',
      ACCENT,
    ),
  );
  out.push(
    text(
      bx + L.snapXMm + sr + 1.5,
      Y(L.snapTabYMm) + 2.4,
      'ověřit s kartami',
      1.9,
      'start',
      ACCENT,
    ),
  );
  out.push(circle(bx + L.snapXMm, Y(L.snapFrontYMm), sr, ACCENT, '1.5 1'));
  out.push(cross(bx + L.snapXMm, Y(L.snapFrontYMm)));
  out.push(
    text(bx + L.snapXMm + sr + 1.5, Y(L.snapFrontYMm) + 1, 'druk – patice', 2.1, 'start', ACCENT),
  );
  // Průchodka v pravém horním rohu zadního panelu.
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
  out.push(
    text(
      pcx,
      pcy - 2.5,
      `${cz(bw)} × ${cz(L.frontHeightMm)} mm · karta vyčnívá ${cz(L.cardExposedMm)} mm`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(pcx, pcy + 3, 'sem přišít kapsu s mincí', 2.4, 'middle', GUIDE));
  out.push(text(pcx, pcy + 6.2, '(otevřená hrana k druku)', 2.1, 'middle', GUIDE));
  // Popisky dílů.
  out.push(text(bx + tw / 2, Y(L.snapTabYMm + sr + 4), 'JAZYK', 2.2, 'middle'));
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
  out.push(
    text(bx + L.notchCentreXMm, Y(nr) + 3.5, `výřez na prst R${cz(nr)}`, 1.9, 'middle', GUIDE),
  );

  /* --- pravý sloupec: (dělicí panel), kapsa s mincí, forma --- */
  const dx = bx + bw + gap;
  let cy = m;
  if (L.dividerHeightMm !== null) {
    out.push(cut(roundedRect(dx, cy, bw, L.dividerHeightMm, rc)));
    for (const x of [dx + so, dx + bw - so]) {
      const bottom = cy + L.dividerHeightMm - so;
      const top = bottom - L.sideSeamLengthMm;
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
  const ky = cy + 4;
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
  cy = ky + L.pocketHeightMm + 10 + gap;

  const fx = dx;
  const fy = cy + 4;
  const fs = L.formPlateMm;
  out.push(guide(`M${f(fx)} ${f(fy)} h${f(fs)} v${f(fs)} h${f(-fs)} Z`, '1.5 1.5'));
  out.push(circle(fx + fs / 2, fy + fs / 2, L.formHoleDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(cross(fx + fs / 2, fy + fs / 2));
  out.push(text(fx + fs / 2, fy - 2, 'FORMA PRO DŮLEK (dřevo / HDPE, ne kůže)', 2.6, 'middle'));
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 3.5,
      `otvor Ø ${cz(L.formHoleDiameterMm)} = mince + 2 × kůže ${cz(spec.pocketThicknessMm)} + ${cz(spec.formHoleClearanceMm)} · deska ${cz(fs)} × ${cz(fs)}`,
      2.1,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 6.6,
      'kůže LÍCEM DOLŮ na formu, mince na rub, přiklopit deskou, stáhnout svěrkami',
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
    text(
      calX + 25,
      calY - 3,
      'KONTROLA MĚŘÍTKA: tato úsečka musí měřit přesně 50 mm',
      2.4,
      'middle',
    ),
  );
  const legend = [
    `POUZDRO NA KARTY S VSAZENOU MINCÍ – střih 1:1, tisk na A4 na 100 % (bez „přizpůsobit stránce“). NÁVRH k ověření na papíru a odřezku.`,
    `Karta ${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)} (${spec.cardsCount} ks), mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm, kapsa ${cz(spec.pocketThicknessMm)} mm. Jazyk ${cz(L.tabLengthMm)} mm od horní hrany zadního panelu.`,
    `Plná čára = řez. Tečky = otvory stehu, rozteč ${cz(spec.stitchPitchMm)} mm, ${cz(so)} mm od hrany; boční švy ${L.sideSeamHoles} otvorů na stranu, počítané od ohybu na obou panelech.`,
    `Pořadí: 1 tělo · 2 kapsa: navlhčit, LÍCEM DOLŮ na formu, mince, přiklopit, svěrky, nechat zaschnout · 3 vyříznout obrys kapsy · 4 vyseknout OKNO (kapsa lícem dolů na formě,`,
    `pod dno špalík) · 5 přišít kapsu na předek (3 strany) · 6 přeložit, prošít boky · 7 průchodka · 8 druk: klobouček na jazyku až po zkoušce s kartami · 9 hrany.`,
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

/** Název souboru pro daný průměr mince (výchozí mince bez přípony; 27,5 → „-mince-27-5mm“). */
export function coinHolderFileStem(coinMm: number): string {
  return coinMm === DEFAULT_COIN_CARD_HOLDER.coinDiameterMm
    ? 'pouzdro-mince-sablona'
    : `pouzdro-mince-sablona-mince-${f(coinMm).replace('.', '-')}mm`;
}

function readNumberArg(
  name: string,
  min: number,
  max: number,
  named?: Record<string, number>,
): number | undefined {
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  const raw = process.argv[i + 1];
  const names = named ? Object.keys(named).join(', ') : '';
  if (raw === undefined || raw.startsWith('--')) {
    throw new Error(`${name} potřebuje hodnotu${named ? ` (číslo v mm nebo ${names})` : ' v mm'}.`);
  }
  const key = raw.toLowerCase();
  const namedValue = named && Object.hasOwn(named, key) ? named[key] : undefined;
  const value = namedValue ?? Number(raw.replace(',', '.'));
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
  const spec: CoinCardHolderSpec = {
    ...DEFAULT_COIN_CARD_HOLDER,
    coinDiameterMm: coin,
    windowDiameterMm: window ?? null,
    dividerPanel: process.argv.includes('--divider'),
  };
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const stem = coinHolderFileStem(coin);
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
  await browser.close();
  console.log(`Zapsáno ${pdfPath} (A4 na výšku, 100 %)`);
  const L = coinCardHolderLayout(spec);
  console.log(
    `Panely ${cz(L.panelWidthMm)} × ${cz(L.frontHeightMm)} / ${cz(L.backHeightMm)} mm, ohyb ${cz(L.foldAllowanceMm)}, jazyk ${cz(L.tabLengthMm)}, tělo ${cz(L.bodyLengthMm)} mm; ` +
      `kapsa ${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm, okno Ø ${cz(L.windowDiameterMm)} (prstenec ${cz(L.coinRingMm)}), forma Ø ${cz(L.formHoleDiameterMm)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
