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
  const out: string[] = [];
  const so = spec.stitchOffsetMm;
  const rc = spec.cornerRadiusMm;
  const tw = L.tabX1Mm;
  const rt = L.tabEndRadiusMm;
  const nr = L.notchRadiusMm;

  /** Obrys těla ve tvaru L v soustavě těla (y = 0 horní hrana zadního panelu), měřítko `k`. */
  const bodyPath = (ox: number, oy: number, k: number): string => {
    const X = (x: number): string => f(ox + x * k);
    const Y = (y: number): string => f(oy + y * k);
    const R = (r: number): string => f(r * k);
    return (
      `M${X(0)} ${Y(-L.tabLengthMm + rt)} A${R(rt)} ${R(rt)} 0 0 1 ${X(tw)} ${Y(-L.tabLengthMm + rt)} ` +
      `L${X(tw)} ${Y(0)} A${R(nr)} ${R(nr)} 0 0 0 ${X(L.notchCentreXMm + nr)} ${Y(0)} ` +
      `L${X(L.panelWidthMm - rc)} ${Y(0)} A${R(rc)} ${R(rc)} 0 0 1 ${X(L.panelWidthMm)} ${Y(rc)} ` +
      `L${X(L.panelWidthMm)} ${Y(L.frontTopMm - rc)} A${R(rc)} ${R(rc)} 0 0 1 ${X(L.panelWidthMm - rc)} ${Y(L.frontTopMm)} ` +
      `L${X(rc)} ${Y(L.frontTopMm)} A${R(rc)} ${R(rc)} 0 0 1 ${X(0)} ${Y(L.frontTopMm - rc)} Z`
    );
  };
  /** Zadní panel s jazykem a výřezem (jen horní část těla po ohyb), pohled zezadu = zrcadlově. */
  const backPanelPath = (
    ox: number,
    oy: number,
    k: number,
    mirror: boolean,
    tabLen: number = L.tabLengthMm,
  ): string => {
    const X = (x: number): string => f(ox + (mirror ? L.panelWidthMm - x : x) * k);
    const Y = (y: number): string => f(oy + y * k);
    const R = (r: number): string => f(r * k);
    const sw = mirror ? 0 : 1;
    const swN = mirror ? 1 : 0;
    return (
      `M${X(0)} ${Y(-tabLen + rt)} A${R(rt)} ${R(rt)} 0 0 ${sw} ${X(tw)} ${Y(-tabLen + rt)} ` +
      `L${X(tw)} ${Y(0)} A${R(nr)} ${R(nr)} 0 0 ${swN} ${X(L.notchCentreXMm + nr)} ${Y(0)} ` +
      `L${X(L.panelWidthMm - rc)} ${Y(0)} A${R(rc)} ${R(rc)} 0 0 ${sw} ${X(L.panelWidthMm)} ${Y(rc)} ` +
      `L${X(L.panelWidthMm)} ${Y(L.backHeightMm - rc)} A${R(rc)} ${R(rc)} 0 0 ${sw} ${X(L.panelWidthMm - rc)} ${Y(L.backHeightMm)} ` +
      `L${X(rc)} ${Y(L.backHeightMm)} A${R(rc)} ${R(rc)} 0 0 ${sw} ${X(0)} ${Y(L.backHeightMm - rc)} Z`
    );
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
    const px = ox + L.panelWidthMm * k + 8;
    const py = cy + 24;
    b.push(
      `<path d="${pocketPath(px, py, k)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    b.push(
      text(
        cx + 4,
        cy + cellH - 8,
        `tělo ${cz(L.panelWidthMm)} × ${cz(L.bodyLengthMm)} mm (tvar L), kapsa ${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm`,
        2.3,
        'start',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + 4,
        cy + cellH - 4.5,
        'řez podle šablony 1:1, srazit hrany mimo švy',
        2.3,
        'start',
        GUIDE,
      ),
    );
    cell(0, 'Vyříznout tělo a kapsu', b);
  }
  /* 2 – tvarování důlku (řez formou) */
  {
    const [cx, cy] = cellOrigin(1);
    const b: string[] = [];
    const s2 = 0.9;
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
    const depth = spec.coinDiameterMm > 0 ? 2.6 : 2;
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
      `<rect x="${f(ox)}" y="${f(oy - 1.4 - 2.4 - 3)}" width="${f(plateW)}" height="3" fill="#cfd8dc" stroke="#78909c" stroke-width="0.4"/>`,
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
        'navlhčit · kůže LÍCEM DOLŮ na formu · mince na rub',
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
        oy - 12,
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
        `okno Ø ${cz(L.windowDiameterMm)} výsečníkem, kapsa lícem dolů na formě, pod dno špalík`,
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
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k4, L.frontHeightMm * k4, rc * k4)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
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
        'sedlářský steh po třech stranách, horní hrana kapsy zůstává otevřená',
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
    cell(3, 'Přišít kapsu na přední panel, patice druku', b);
  }
  /* 5 – přeložit a prošít boky */
  {
    const [cx, cy] = cellOrigin(4);
    const k5 = 0.5;
    const ox = cx + (cellW - L.panelWidthMm * k5) / 2;
    const oy = cy + 12 + (L.tabLengthMm + L.backHeightMm - L.frontHeightMm) * k5;
    const b: string[] = [];
    // zadní panel (za předním) – vidíme jeho horní část nad předkem včetně jazyka vzpřímeného
    const backTop = oy - (L.backHeightMm - L.frontHeightMm) * k5;
    b.push(
      `<path d="${backPanelPath(ox, backTop, k5, false)}" fill="${LEATHER_DARK}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // přední panel
    b.push(
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k5, L.frontHeightMm * k5, rc * k5)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // boční švy
    for (const x of [ox + so * k5, ox + (L.panelWidthMm - so) * k5]) {
      b.push(stitches(x, oy + L.frontHeightMm * k5 - so * k5, x, oy + so * k5, k5));
    }
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k5 + 5,
        `přeložit v ohybu, prošít oba boky skrz 2 vrstvy (${L.sideSeamHoles} otvorů na stranu)`,
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k5 + 8.5,
        'tečky od ohybu lícují · nad předkem zůstává zadní panel bez stehu',
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
    const cardTop = cy + 14;
    const oy = cardTop + spec.cardGripMm * k7; // horní hrana předku
    const b: string[] = [];
    // zadní panel vzadu (jeho horní hrana ještě výš než karty)
    const backTop = oy - (L.backHeightMm - L.frontHeightMm) * k7;
    b.push(
      `<path d="${roundedRect(ox, backTop, L.panelWidthMm * k7, L.backHeightMm * k7, rc * k7)}" fill="${LEATHER_DARK}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // karty vyčnívající
    b.push(
      `<rect x="${f(ox + ((L.panelWidthMm - spec.cardWidthMm) / 2) * k7)}" y="${f(cardTop)}" width="${f(spec.cardWidthMm * k7)}" height="${f((spec.cardGripMm + 6) * k7)}" rx="1" fill="#f4efe6" stroke="#bbb" stroke-width="0.3"/>`,
    );
    // přední panel
    b.push(
      `<path d="${roundedRect(ox, oy, L.panelWidthMm * k7, L.frontHeightMm * k7, rc * k7)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    for (const x of [ox + so * k7, ox + (L.panelWidthMm - so) * k7]) {
      b.push(stitches(x, oy + L.frontHeightMm * k7 - so * k7, x, oy + so * k7, k7));
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
    // jazyk přehnutý přes horní hranu na předek, konec s kloboučkem
    const tabDown = L.tabEndOnFrontMm * k7;
    b.push(
      `<path d="M${f(ox)} ${f(backTop)} L${f(ox + tw * k7)} ${f(backTop)} L${f(ox + tw * k7)} ${f(oy + tabDown - rt * k7)} A${f(rt * k7)} ${f(rt * k7)} 0 0 1 ${f(ox)} ${f(oy + tabDown - rt * k7)} Z" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    b.push(
      `<circle cx="${f(ox + L.snapXMm * k7)}" cy="${f(oy + spec.snapFromFrontTopMm * k7)}" r="${f((spec.snapDiameterMm / 2) * k7)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    // šňůrka z průchodky (na zadním panelu vpravo nahoře, vidět za předkem)
    b.push(
      `<path d="M${f(ox + (L.panelWidthMm - spec.grommetFromEdgeMm) * k7)} ${f(backTop + spec.grommetFromEdgeMm * k7)} q6 -8 10 -2" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.frontHeightMm * k7 + 5,
        `zepředu: jazyk zapnutý na předku, karty vyčnívají ${cz(L.cardExposedMm)} mm, mince v okně`,
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
    // zezadu je zadní panel zrcadlově: jazyk vpravo, průchodka vlevo; jazyk odchází přes hranu dopředu
    b.push(
      `<path d="${backPanelPath(ox, oy, k8, true, 5)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // motiv (ilustrativní)
    b.push(
      `<rect x="${f(ox + 12 * k8)}" y="${f(oy + 22 * k8)}" width="${f(42 * k8)}" height="${f(30 * k8)}" rx="2" fill="none" stroke="${LEATHER_DARK}" stroke-width="0.4" stroke-dasharray="1 1"/>`,
    );
    b.push(text(ox + 33 * k8, oy + 39 * k8, 'motiv / ražení', 2.3, 'middle', LEATHER_DARK));
    for (const x of [ox + so * k8, ox + (L.panelWidthMm - so) * k8]) {
      b.push(
        stitches(
          x,
          oy + L.backHeightMm * k8 - so * k8,
          x,
          oy + (L.backHeightMm - L.frontHeightMm + so) * k8,
          k8,
        ),
      );
    }
    const gx = ox + spec.grommetFromEdgeMm * k8;
    const gy = oy + L.grommetYMm * k8;
    b.push(
      `<circle cx="${f(gx)}" cy="${f(gy)}" r="${f((spec.grommetHoleMm / 2 + 1.5) * k8)}" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
    );
    b.push(
      `<path d="M${f(gx)} ${f(gy)} q-8 6 -6 14 q1 5 4 8" stroke="${LEATHER_DARK}" stroke-width="1" fill="none"/>`,
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k8 + 5,
        'zezadu: motiv, průchodka se šňůrkou, výřez na prst u jazyka',
        2.2,
        'middle',
        GUIDE,
      ),
    );
    b.push(
      text(
        cx + cellW / 2,
        oy + L.backHeightMm * k8 + 8.5,
        'jazyk odchází přes horní hranu dopředu',
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
  console.log(`Zapsáno ${pdfPath} (A4 na výšku, 100 %)`);
  if (coin === DEFAULT_COIN_CARD_HOLDER.coinDiameterMm && !spec.dividerPanel) {
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
