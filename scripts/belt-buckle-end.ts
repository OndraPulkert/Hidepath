/**
 * Vykreslí 1:1 šablonu obou konců opasku na dvě strany A4.
 *
 * Strana 1: konec u přezky se čtyřmi otvory pro nýty (dva nýty) a kapsou pro poutko.
 * Strana 2: konec se špičkou a pěti dírkami pro trn.
 *
 * Veškerá geometrie a kontroly jsou v src/lib/geometry/belt-end.ts, aby byly testovatelné.
 * Tento skript jen kreslí. Výstup: docs/generated/opasek-sablona.svg + .pdf
 * Spuštění: pnpm pattern:belt-end
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type BeltEndSpec,
  type BeltTipSpec,
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  adjustmentRangeMm,
  apexToMiddleHoleMm,
  assertBeltEndSpec,
  assertBeltTipSpec,
  doubledPerimeterMm,
  keeperGapMm,
  keeperPocketClearMm,
  keeperStripLengthMm,
  ligamentMm,
  middleHoleIndex,
  holeOffsetsFromApexMm,
  tipLengthMm,
  tipTangentPoint,
} from '../src/lib/geometry/belt-end.ts';

const INK = '#2b2b2b';
const RED = '#c0392b';
const GREEN = '#1f6f43';
const GREY = '#6a6a6a';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');

const text = (
  x: number,
  y: number,
  s: string,
  size = 3.2,
  color = INK,
  anchor: 'start' | 'end' | 'middle' = 'start',
): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}" ` +
  `fill="${color}" text-anchor="${anchor}">${s}</text>`;

const cross = (cx: number, cy: number, r: number, color = INK): string =>
  `<path d="M${f(cx - r * 1.3)} ${f(cy)} H${f(cx + r * 1.3)} M${f(cx)} ${f(cy - r * 1.3)} V${f(cy + r * 1.3)}" stroke="${color}" stroke-width="0.2" fill="none"/>`;

const hole = (cx: number, cy: number, d: number, color = INK, sw = 0.3): string =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d / 2)}" fill="none" stroke="${color}" stroke-width="${f(sw)}"/>` +
  cross(cx, cy, d / 2, color);

const centreLine = (cx: number, y1: number, y2: number): string =>
  `<line x1="${f(cx)}" y1="${f(y1)}" x2="${f(cx)}" y2="${f(y2)}" stroke="#b8b8b8" stroke-width="0.15" stroke-dasharray="3 3"/>`;

function dimension(x: number, y1: number, y2: number, color = GREEN): string {
  return (
    `<line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}" stroke="${color}" stroke-width="0.3"/>` +
    [y1, y2]
      .map(
        (y) =>
          `<line x1="${f(x - 2)}" y1="${f(y)}" x2="${f(x + 2)}" y2="${f(y)}" stroke="${color}" stroke-width="0.3"/>`,
      )
      .join('')
  );
}

function calibration(x: number, y: number): string[] {
  return [
    text(x, y - 6, 'KALIBRAČNÍ ČTVEREC', 3, RED),
    text(x, y - 2, 'po vytištění přeměř 50 × 50 mm', 3, RED),
    `<rect x="${f(x)}" y="${f(y)}" width="50" height="50" fill="none" stroke="${RED}" stroke-width="0.4"/>`,
  ];
}

function notes(x: number, y0: number, lines: string[]): string[] {
  return lines.map((l, i) => text(x, y0 + i * 4.2, l, 3));
}

/* -------------------------- strana 1: konec u přezky -------------------------- */

function buckleEndPage(spec: BeltEndSpec): string[] {
  const strapX = 22;
  const w = spec.beltWidthMm;
  const r = w / 2;
  const cx = strapX + r;
  const foldY = 132;
  const topY = foldY - spec.bodyShownMm;
  const endY = foldY + spec.tailLengthMm;
  const textX = strapX + w + 14;
  const [near, far] = spec.rivetOffsetsMm;
  const out: string[] = [];

  out.push(text(strapX, 16, 'Opasek 40 mm — strana 1: konec u přezky', 4.6));
  out.push(
    text(
      strapX,
      22,
      'Měřítko 1:1 · tisk na A4 na 100 %, bez „přizpůsobit stránce“ · 4 otvory = 2 nýty',
      3,
      GREY,
    ),
  );
  out.push(...calibration(150, 30));

  // Obrys: nahoře otevřený, dole půlkruh.
  out.push(
    `<path d="M${f(strapX)} ${f(topY)} L${f(strapX)} ${f(endY - r)} ` +
      `A${f(r)} ${f(r)} 0 0 0 ${f(strapX + w)} ${f(endY - r)} L${f(strapX + w)} ${f(topY)}" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  out.push(centreLine(cx, topY, endY));
  out.push(
    `<line x1="${f(strapX - 6)}" y1="${f(foldY)}" x2="${f(strapX + w + 6)}" y2="${f(foldY)}" ` +
      `stroke="${RED}" stroke-width="0.4" stroke-dasharray="4 2.5"/>`,
  );

  // Drážka pro trn: stadion půlený ohybem.
  const half = spec.slotLengthMm / 2;
  const sr = spec.slotWidthMm / 2;
  out.push(
    `<path d="M${f(cx - sr)} ${f(foldY - half + sr)} A${f(sr)} ${f(sr)} 0 0 1 ${f(cx + sr)} ${f(foldY - half + sr)} ` +
      `L${f(cx + sr)} ${f(foldY + half - sr)} A${f(sr)} ${f(sr)} 0 0 1 ${f(cx - sr)} ${f(foldY + half - sr)} Z" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  for (const sign of [-1, 1]) out.push(cross(cx, foldY + sign * (half - sr), sr));

  // Čtyři otvory pro nýty.
  for (const off of spec.rivetOffsetsMm) {
    for (const sign of [-1, 1]) out.push(hole(cx, foldY + sign * off, spec.rivetHoleMm));
  }

  out.push(dimension(strapX + w + 4, foldY + near, foldY + far));

  const callouts: [number, string, string][] = [
    [foldY - far, `nýt ± ${cz(far)} mm od ohybu`, INK],
    [foldY - near, `nýt ± ${cz(near)} mm od ohybu`, INK],
    [
      foldY - near + 9.5,
      `drážka ${cz(spec.slotLengthMm)} × ${cz(spec.slotWidthMm)} mm, ohyb ji půlí`,
      INK,
    ],
    [foldY, 'OHYB (příčka přezky)', RED],
    [foldY + near - 9.5, `můstek u drážky ${cz(Math.round(ligamentMm(spec) * 10) / 10)} mm`, GREEN],
    [
      foldY + (near + far) / 2,
      `kapsa pro poutko ${cz(keeperGapMm(spec))} mm (světlá ${cz(keeperPocketClearMm(spec))} mm)`,
      GREEN,
    ],
    [endY, `konec pásu ${cz(spec.tailLengthMm)} mm od ohybu`, INK],
  ];
  for (const [y, s, color] of callouts) out.push(text(textX, y + 1, s, 3.2, color));
  out.push(text(strapX, topY - 3, 'sem pokračuje hlavní pás (nahoře neřezat)', 3, GREY));

  // Poutko.
  const keeperY = 232;
  const len = keeperStripLengthMm(spec);
  out.push(
    text(
      strapX,
      keeperY - 4,
      `Poutko — pásek ${len} × ${spec.keeperWidthMm} mm (obvod zdvojené části ${cz(doubledPerimeterMm(spec))} mm + ${spec.keeperOverlapMm} mm přeplátování)`,
      3,
    ),
  );
  out.push(
    `<rect x="${f(strapX)}" y="${f(keeperY)}" width="${f(len)}" height="${f(spec.keeperWidthMm)}" fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  for (let mm = 0; mm <= len; mm += 10) {
    out.push(
      `<line x1="${f(strapX + mm)}" y1="${f(keeperY + spec.keeperWidthMm)}" x2="${f(strapX + mm)}" y2="${f(keeperY + spec.keeperWidthMm + 2)}" stroke="#7a7a7a" stroke-width="0.2"/>`,
    );
    out.push(
      `<text x="${f(strapX + mm)}" y="${f(keeperY + spec.keeperWidthMm + 5.2)}" font-family="Helvetica, Arial, sans-serif" font-size="2.6" fill="#7a7a7a" text-anchor="middle">${mm}</text>`,
    );
  }

  out.push(
    ...notes(strapX, 258, [
      '1. Přenes značky na rub pásu: ohyb, drážku i všechny čtyři otvory.',
      `2. Vysekni ${cz(spec.rivetHoleMm)}mm otvory pro nýty i konce drážky (stejný průbojník), drážku mezi nimi vyřízni nožem.`,
      '3. Navlékni poutko na přehnutý konec. Teprve pak ohni konec kolem přezky.',
      '4. Sešroubuj oba nýty. Poutko zůstane uvězněné v kapse mezi nimi.',
      'Nýty: 2 kusy, každý prochází oběma vrstvami — proto jsou otvory čtyři.',
      'Rozměry z šablony Black Flag Leather Goods (jeden zdroj, ať se nemíchají rozteče).',
      'Délka poutka a zaoblení konce jsou spočítané, ne ověřené — vyzkoušej na odřezku.',
    ]),
  );
  return out;
}

/* --------------------------- strana 2: konec se špičkou --------------------------- */

function tipPage(tip: BeltTipSpec, end: BeltEndSpec): string[] {
  const strapX = 22;
  const w = tip.beltWidthMm;
  const cx = strapX + w / 2;
  const apexY = 45;
  const tipLen = tipLengthMm(tip);
  const baseY = apexY + tipLen;
  const offsets = holeOffsetsFromApexMm(tip);
  const lastY = apexY + offsets[offsets.length - 1];
  const strapEndY = lastY + 12;
  const textX = strapX + w + 14;
  const mid = middleHoleIndex(tip);
  const out: string[] = [];

  out.push(text(strapX, 16, 'Opasek 40 mm — strana 2: konec se špičkou', 4.6));
  out.push(
    text(
      strapX,
      22,
      'Měřítko 1:1 · tisk na A4 na 100 % · rozvržení nezávisí na obvodu pasu',
      3,
      GREY,
    ),
  );
  out.push(...calibration(150, 30));

  // Obrys s anglickou špičkou, dole otevřený.
  // Vrchol je zaoblený obloukem r; boky jsou na oblouk tečné (viz tipTangentPoint).
  const tan = tipTangentPoint(tip);
  const r = tip.noseRadiusMm;
  const tanY = apexY + tan.fromApexMm;
  out.push(
    `<path d="M${f(strapX)} ${f(strapEndY)} L${f(strapX)} ${f(baseY)} ` +
      `L${f(cx - tan.halfWidthMm)} ${f(tanY)} ` +
      `A${f(r)} ${f(r)} 0 0 1 ${f(cx + tan.halfWidthMm)} ${f(tanY)} ` +
      `L${f(strapX + w)} ${f(baseY)} L${f(strapX + w)} ${f(strapEndY)}" ` +
      `fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );
  out.push(centreLine(cx, apexY, strapEndY));

  offsets.forEach((off, i) => {
    const y = apexY + off;
    const isMid = i === mid;
    out.push(hole(cx, y, tip.holeDiameterMm, isMid ? RED : INK, isMid ? 0.5 : 0.3));
  });

  // Kóty.
  out.push(dimension(strapX - 6, apexY, apexY + offsets[0], GREEN));
  out.push(text(strapX - 9, (2 * apexY + offsets[0]) / 2, `${cz(offsets[0])} mm`, 3, GREEN, 'end'));
  out.push(dimension(strapX + w + 4, apexY + offsets[0], apexY + offsets[1], GREEN));

  const midY = apexY + offsets[mid];
  out.push(text(textX, apexY + tipLen / 2, `hrot ${cz(Math.round(tipLen * 10) / 10)} mm`, 3.2));
  out.push(text(textX, apexY + 4, `vrchol zaoblený r = ${cz(r)} mm (není ostrý hrot)`, 3.2, RED));
  out.push(
    text(
      textX,
      apexY + (offsets[0] + offsets[1]) / 2,
      `rozteč ${cz(tip.holeSpacingMm)} mm`,
      3.2,
      GREEN,
    ),
  );
  out.push(text(textX, midY - 3, 'PROSTŘEDNÍ DÍRKA = tvoje míra', 3.4, RED));
  out.push(text(textX, midY + 2, `${cz(apexToMiddleHoleMm(tip))} mm od hrotu`, 3, RED));
  out.push(
    text(
      textX,
      midY + 6.5,
      `nastavení ± ${cz(adjustmentRangeMm(tip))} mm (2 dírky sem i tam)`,
      3,
      RED,
    ),
  );
  out.push(
    text(textX, lastY + 1, `poslední dírka ${cz(offsets[offsets.length - 1])} mm od hrotu`, 3),
  );
  out.push(text(strapX, strapEndY + 5, 'sem pokračuje hlavní pás (dole neřezat)', 3, GREY));

  const total = apexToMiddleHoleMm(tip) + end.tailLengthMm;
  out.push(
    ...notes(strapX, strapEndY + 10, [
      `Dírky Ø ${cz(tip.holeDiameterMm)} mm, ${tip.holeCount} kusů, rozteč ${cz(tip.holeSpacingMm)} mm.`,
      `Vrchol je oblouk r = ${cz(r)} mm, boky jsou na něj tečné — odměřeno z PDF CraftPoint, ne ostrý hrot.`,
      `CELKOVÁ DÉLKA PÁSU = naměřený obvod + ${cz(total)} mm`,
      `   (${cz(end.tailLengthMm)} mm přehnutý konec u přezky + ${cz(apexToMiddleHoleMm(tip))} mm od hrotu k prostřední dírce)`,
      'Obvod měř na stávajícím opasku od ohybu u přezky k dírce, kterou nosíš.',
      'Bez opasku: provlékni poutky kalhot krejčovský metr a utáhni na pohodlí.',
      'Dírky děruj až po zkoušce na těle. Špičku odřízni jako poslední krok.',
      'Rozvržení odměřeno z PDF generátoru CraftPoint; shodné pro obvod 85 i 95 cm.',
    ]),
  );
  return out;
}

function page(body: string[]): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">',
    '<rect width="210" height="297" fill="#ffffff"/>',
    ...body,
    '</svg>',
  ].join('\n');
}

export function buildPages(end: BeltEndSpec, tip: BeltTipSpec): [string, string] {
  return [page(buckleEndPage(end)), page(tipPage(tip, end))];
}

function widthFromArgs(): number {
  const i = process.argv.indexOf('--width');
  if (i < 0) return DEFAULT_BELT_END.beltWidthMm;
  const v = Number(process.argv[i + 1]);
  if (!Number.isFinite(v) || v < 15 || v > 80) {
    throw new Error('--width musí být šířka pásu v mm mezi 15 a 80.');
  }
  return v;
}

async function main(): Promise<void> {
  const beltWidthMm = widthFromArgs();
  const end: BeltEndSpec = { ...DEFAULT_BELT_END, beltWidthMm };
  const tip: BeltTipSpec = { ...DEFAULT_BELT_TIP, beltWidthMm };
  assertBeltEndSpec(end);
  assertBeltTipSpec(tip);

  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const [p1, p2] = buildPages(end, tip);
  writeFileSync(
    resolve(outDir, `opasek-sablona-${beltWidthMm}mm-1-prezka.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>\n${p1}`,
    'utf8',
  );
  writeFileSync(
    resolve(outDir, `opasek-sablona-${beltWidthMm}mm-2-spicka.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>\n${p2}`,
    'utf8',
  );

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const pg = await browser.newPage();
  await pg.setContent(
    `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}
     .sheet{width:210mm;height:297mm;page-break-after:always;overflow:hidden}
     .sheet:last-child{page-break-after:auto}</style>` +
      `<div class="sheet">${p1}</div><div class="sheet">${p2}</div>`,
    { waitUntil: 'load' },
  );
  const pdfPath = resolve(outDir, `opasek-sablona-${beltWidthMm}mm.pdf`);
  await pg.pdf({
    path: pdfPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  await browser.close();

  console.log(`Zapsáno ${pdfPath} (2 strany)`);
  console.log(
    `Konec u přezky: můstek ${ligamentMm(end).toFixed(1)} mm, kapsa pro poutko ` +
      `${keeperGapMm(end)} mm (světlá ${keeperPocketClearMm(end)} mm), ` +
      `poutko ${keeperStripLengthMm(end)} mm.`,
  );
  console.log(
    `Špička: dírky ${holeOffsetsFromApexMm(tip).map(cz).join(' / ')} mm od hrotu, ` +
      `prostřední ${cz(apexToMiddleHoleMm(tip))} mm.`,
  );
  console.log(`Celková délka pásu = obvod + ${cz(apexToMiddleHoleMm(tip) + end.tailLengthMm)} mm.`);
}

await main();
