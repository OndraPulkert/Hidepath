/**
 * Vykreslí 1:1 střih pouzdra na karty s vsazenou mincí na jednu stranu A4 (na výšku).
 *
 *   pnpm pattern:coin-holder              # mince 40 mm (výchozí, „decision coin“ z předlohy)
 *   pnpm pattern:coin-holder --coin 50kc  # česká padesátikoruna (27,5 mm), dále 20kc/10kc/5kc
 *   pnpm pattern:coin-holder --coin 34    # libovolný průměr v mm
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
  DEFAULT_COIN_CARD_HOLDER,
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
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${stroke}" stroke-width="0.3"` +
  (dash ? ` stroke-dasharray="${dash}"` : '') +
  '/>';
const text = (x: number, y: number, s: string, size = 3, anchor = 'start', fill = INK): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" ` +
  `text-anchor="${anchor}" fill="${fill}">${s}</text>`;
const cross = (cx: number, cy: number, s = 1.5): string =>
  `<path d="M${f(cx - s)} ${f(cy)} L${f(cx + s)} ${f(cy)} M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy + s)}" stroke="${INK}" stroke-width="0.25"/>`;

/** Tečky stehu podél úsečky od (x0,y0) k (x1,y1) s roztečí `pitch`, první tečka v bodě 0. */
function stitchDots(x0: number, y0: number, x1: number, y1: number, pitch: number): string {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.floor(len / pitch + 1e-9);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const out: string[] = [];
  for (let i = 0; i <= n; i++) {
    out.push(
      `<circle cx="${f(x0 + ux * i * pitch)}" cy="${f(y0 + uy * i * pitch)}" r="0.45" fill="${INK}"/>`,
    );
  }
  return out.join('');
}

export function buildCoinHolderSheetSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const W = 210;
  const H = 297;
  const m = 12;
  const gap = 12;
  const so = spec.stitchOffsetMm;
  const out: string[] = [];

  /* --- tělo: přední panel nahoře, ohyb, zadní panel, chlopeň --- */
  const bx = m;
  const by = m;
  const bw = L.panelWidthMm;
  // Přední horní hrana s rohy R, konec chlopně s větším R: kreslím jako jeden obrys.
  out.push(
    roundedRectCut(bx, by, bw, L.bodyLengthMm, spec.cornerRadiusMm, spec.flapCornerRadiusMm),
  );
  // Ohyb: dvě čárkované linky ohraničující přídavek.
  out.push(
    guide(`M${f(bx)} ${f(by + L.foldStartMm)} L${f(bx + bw)} ${f(by + L.foldStartMm)}`, '3 2'),
  );
  out.push(guide(`M${f(bx)} ${f(by + L.foldEndMm)} L${f(bx + bw)} ${f(by + L.foldEndMm)}`, '3 2'));
  out.push(text(bx + bw / 2, by + L.foldStartMm + 4.2, 'OHYB', 2.6, 'middle', GUIDE));
  // Horní hrana zadního panelu = kde začíná chlopeň (jen orientační linka).
  const flapStart = by + L.foldEndMm + L.backHeightMm;
  out.push(guide(`M${f(bx)} ${f(flapStart)} L${f(bx + bw)} ${f(flapStart)}`, '1 1.5'));
  out.push(
    text(
      bx + bw / 2,
      flapStart - 1.5,
      'zde se chlopeň láme přes horní hranu',
      2.2,
      'middle',
      GUIDE,
    ),
  );
  // Boční švy: na předním panelu od horní hrany (odsazení) k ohybu, na zadním od ohybu
  // nahoru stejnou délkou. Tečky začínají u ohybu, aby si obě strany odpovídaly.
  for (const x of [bx + so, bx + bw - so]) {
    // Šev začíná `so` nad ohybem a končí `so` pod horní hranou; tečky od ohybu, aby si
    // přední a zadní panel (i dělicí panel) po přeložení odpovídaly otvor na otvor.
    const frontBottom = by + L.foldStartMm - so;
    const frontTop = frontBottom - L.sideSeamLengthMm;
    out.push(guide(`M${f(x)} ${f(frontTop)} L${f(x)} ${f(frontBottom)}`, '0.8 1.2'));
    out.push(stitchDots(x, frontBottom, x, frontTop, spec.stitchPitchMm));
    const backBottom = by + L.foldEndMm + so;
    const backTop = backBottom + L.sideSeamLengthMm;
    out.push(guide(`M${f(x)} ${f(backBottom)} L${f(x)} ${f(backTop)}`, '0.8 1.2'));
    out.push(stitchDots(x, backBottom, x, backTop, spec.stitchPitchMm));
  }
  // Druk: přední panel (patice) a chlopeň (klobouček).
  out.push(
    circle(bx + L.snapFrontXMm, by + L.snapFrontYMm, spec.snapDiameterMm / 2, ACCENT, '1.5 1'),
  );
  out.push(cross(bx + L.snapFrontXMm, by + L.snapFrontYMm));
  out.push(
    circle(bx + L.snapFrontXMm, by + L.snapFlapYMm, spec.snapDiameterMm / 2, ACCENT, '1.5 1'),
  );
  out.push(cross(bx + L.snapFrontXMm, by + L.snapFlapYMm));
  out.push(
    text(
      bx + L.snapFrontXMm + spec.snapDiameterMm / 2 + 1.5,
      by + L.snapFrontYMm + 1,
      'druk – patice',
      2.2,
      'start',
      ACCENT,
    ),
  );
  out.push(
    text(
      bx + L.snapFrontXMm + spec.snapDiameterMm / 2 + 1.5,
      by + L.snapFlapYMm + 1,
      'druk – klobouček',
      2.2,
      'start',
      ACCENT,
    ),
  );
  // Obrys kapsy s mincí na předním panelu (kam se přišije) – jen vodicí linka.
  const px = bx + L.pocketXMm;
  const py = by + L.pocketYMm;
  out.push(
    guide(
      roundedRect(
        px,
        py,
        L.pocketWidthMm,
        L.pocketHeightMm,
        spec.pocketTopRadiusMm,
        spec.cornerRadiusMm,
      ),
      '1 1',
    ),
  );
  out.push(
    text(
      px + L.pocketWidthMm / 2,
      py + L.pocketHeightMm / 2 - 1,
      'sem přišít',
      2.4,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      px + L.pocketWidthMm / 2,
      py + L.pocketHeightMm / 2 + 2.4,
      'kapsu s mincí',
      2.4,
      'middle',
      GUIDE,
    ),
  );
  // Popisky dílu.
  out.push(text(bx + bw / 2, by + L.frontHeightMm / 2 - 12, 'TĚLO – PŘEDNÍ PANEL', 2.8, 'middle'));
  out.push(
    text(
      bx + bw / 2,
      by + L.frontHeightMm / 2 - 8.5,
      `${cz(bw)} × ${cz(L.frontHeightMm)} mm`,
      2.4,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(bx + bw / 2, by + L.foldEndMm + L.backHeightMm / 2, 'ZADNÍ PANEL', 2.8, 'middle'));
  out.push(
    text(
      bx + bw / 2,
      by + L.foldEndMm + L.backHeightMm / 2 + 3.5,
      `${cz(bw)} × ${cz(L.backHeightMm)} mm · rub = ražení / motiv`,
      2.2,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(bx + 3, flapStart + 5, 'CHLOPEŇ', 2.6, 'start'));

  /* --- dělicí panel --- */
  const dx = bx + bw + gap;
  const dy = by;
  out.push(cut(roundedRect(dx, dy, bw, L.dividerHeightMm, spec.cornerRadiusMm)));
  for (const x of [dx + so, dx + bw - so]) {
    // Dělicí panel sedí spodní hranou na ohybu: jeho tečky jsou tytéž jako na těle,
    // měřeno od ohybu, jen o `so` výš než jeho spodní hrana.
    const bottom = dy + L.dividerHeightMm - so;
    const top = bottom - L.sideSeamLengthMm;
    out.push(guide(`M${f(x)} ${f(top)} L${f(x)} ${f(bottom)}`, '0.8 1.2'));
    out.push(stitchDots(x, bottom, x, top, spec.stitchPitchMm));
  }
  out.push(text(dx + bw / 2, dy + L.dividerHeightMm / 2 - 2, 'DĚLICÍ PANEL', 2.8, 'middle'));
  out.push(
    text(
      dx + bw / 2,
      dy + L.dividerHeightMm / 2 + 2,
      `${cz(bw)} × ${cz(L.dividerHeightMm)} mm · vložit před šitím`,
      2.2,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      dx + bw / 2,
      dy + L.dividerHeightMm / 2 + 5.5,
      'spodní hranou na ohyb',
      2.2,
      'middle',
      GUIDE,
    ),
  );

  /* --- kapsa s mincí --- */
  const kx = dx;
  const ky = dy + L.dividerHeightMm + gap;
  out.push(
    cut(
      roundedRect(
        kx,
        ky,
        L.pocketWidthMm,
        L.pocketHeightMm,
        spec.pocketTopRadiusMm,
        spec.cornerRadiusMm,
      ),
    ),
  );
  // Šev po třech stranách (levá, spodní, pravá), horní hrana otevřená.
  const sx0 = kx + so;
  const sx1 = kx + L.pocketWidthMm - so;
  const syTop = ky + so;
  const syBot = ky + L.pocketHeightMm - so;
  const rIn = Math.max(0.5, spec.cornerRadiusMm - so);
  out.push(
    guide(
      `M${f(sx0)} ${f(syTop)} L${f(sx0)} ${f(syBot - rIn)} A${f(rIn)} ${f(rIn)} 0 0 0 ${f(sx0 + rIn)} ${f(syBot)} ` +
        `L${f(sx1 - rIn)} ${f(syBot)} A${f(rIn)} ${f(rIn)} 0 0 0 ${f(sx1)} ${f(syBot - rIn)} L${f(sx1)} ${f(syTop)}`,
      '0.8 1.2',
    ),
  );
  // Okno (řez) a mince (vodicí kružnice pro tvarování).
  const ccx = kx + L.coinCentreXMm;
  const ccy = ky + L.coinCentreYMm;
  out.push(circle(ccx, ccy, L.windowDiameterMm / 2));
  out.push(circle(ccx, ccy, spec.coinDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(cross(ccx, ccy));
  out.push(
    text(kx + L.pocketWidthMm / 2, ky - 2, 'KAPSA S MINCÍ (horní hrana otevřená)', 2.6, 'middle'),
  );
  out.push(
    text(
      ccx,
      ky + L.pocketHeightMm + 3.5,
      `okno Ø ${cz(L.windowDiameterMm)} řezat AŽ PO přišití · mince Ø ${cz(spec.coinDiameterMm)} čárkovaně`,
      2.1,
      'middle',
      GUIDE,
    ),
  );

  /* --- forma pro důlek --- */
  const fx = dx;
  const fy = ky + L.pocketHeightMm + gap + 4;
  const fs = L.formPlateMm;
  out.push(guide(`M${f(fx)} ${f(fy)} h${f(fs)} v${f(fs)} h${f(-fs)} Z`, '1.5 1.5'));
  out.push(circle(fx + fs / 2, fy + fs / 2, L.formHoleDiameterMm / 2, GUIDE, '2 1.5'));
  out.push(cross(fx + fs / 2, fy + fs / 2));
  out.push(text(fx + fs / 2, fy - 2, 'FORMA PRO DŮLEK (dřevo / HDPE, ne kůže)', 2.6, 'middle'));
  out.push(
    text(
      fx + fs / 2,
      fy + fs + 3.5,
      `otvor Ø ${cz(L.formHoleDiameterMm)} = mince + ${cz(spec.formHoleOversizeMm)} · deska ${cz(fs)} × ${cz(fs)} mm`,
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
  const lx = bx;
  let ly = H - m - 34;
  const legend = [
    `POUZDRO NA KARTY S VSAZENOU MINCÍ – střih 1:1, tisk na A4 na 100 % (bez „přizpůsobit stránce“).`,
    `NÁVRH k ověření na papíru a odřezku. Karta ${cz(spec.cardWidthMm)} × ${cz(spec.cardHeightMm)}, mince Ø ${cz(spec.coinDiameterMm)}, kůže tělo ${cz(spec.bodyThicknessMm)} mm, kapsa ${cz(spec.pocketThicknessMm)} mm.`,
    `Plná čára = řez. Tečky = otvory stehu, rozteč ${cz(spec.stitchPitchMm)} mm, ${cz(so)} mm od hrany; boční švy začínají u ohybu, aby díly lícovaly (${L.sideSeamHoles} otvorů na stranu).`,
    `Pořadí: 1 vyříznout tělo a dělicí panel · 2 kapsu: navlhčit, vytvarovat důlek ve formě přes minci, nechat zaschnout, PAK vyříznout obrys ·`,
    `3 přišít kapsu na přední panel (3 strany) · 4 vyříznout okno · 5 vložit dělicí panel, přeložit, prošít boky · 6 druk · 7 hrany. Karta vyčnívá ${cz(L.cardExposedMm)} mm.`,
  ];
  for (const line of legend) {
    out.push(text(lx, ly, line, 2.3, 'start', GUIDE));
    ly += 3.4;
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Pouzdro na karty s vsazenou mincí – střih 1:1. Mince ${cz(spec.coinDiameterMm)} mm. NÁVRH, ověřit na papíru. -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    ...out,
    '</svg>',
  ].join('\n');
}

/** Tělo: horní rohy R obrysu, dolní (konec chlopně) větší R. */
function roundedRectCut(
  x: number,
  y: number,
  w: number,
  h: number,
  rTop: number,
  rBottom: number,
): string {
  return cut(roundedRect(x, y, w, h, rTop, rBottom));
}

async function main(): Promise<void> {
  // --coin 40 | --coin 27,5 | --coin 50kc (pojmenované mince viz NAMED_COINS)
  const coinArg = process.argv.indexOf('--coin');
  const raw = coinArg >= 0 ? process.argv[coinArg + 1] : undefined;
  const coin =
    raw === undefined
      ? DEFAULT_COIN_CARD_HOLDER.coinDiameterMm
      : (NAMED_COINS[raw.toLowerCase()] ?? Number(raw.replace(',', '.')));
  if (!Number.isFinite(coin) || coin < 15 || coin > 60) {
    throw new Error(
      `--coin musí být průměr mince v mm mezi 15 a 60 nebo jedno z: ${Object.keys(NAMED_COINS).join(', ')}.`,
    );
  }
  const spec: CoinCardHolderSpec = { ...DEFAULT_COIN_CARD_HOLDER, coinDiameterMm: coin };
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  // V názvu souboru bez čárky: 27,5 → 27-5.
  const suffix =
    coin === DEFAULT_COIN_CARD_HOLDER.coinDiameterMm ? '' : `-mince-${f(coin).replace('.', '-')}mm`;
  const svg = buildCoinHolderSheetSvg(spec);
  const svgPath = resolve(outDir, `pouzdro-mince-sablona${suffix}.svg`);
  writeFileSync(svgPath, svg, 'utf8');
  console.log(`Zapsáno ${svgPath}`);

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(
    `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}.s{width:210mm;height:297mm;overflow:hidden}</style><div class="s">${svg}</div>`,
    { waitUntil: 'load' },
  );
  const pdfPath = resolve(outDir, `pouzdro-mince-sablona${suffix}.pdf`);
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
    `Panel ${cz(L.panelWidthMm)} × ${cz(L.frontHeightMm)} mm, tělo ${cz(L.bodyLengthMm)} mm, kapsa ${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm, okno Ø ${cz(L.windowDiameterMm)}, forma Ø ${cz(L.formHoleDiameterMm)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) await main();
