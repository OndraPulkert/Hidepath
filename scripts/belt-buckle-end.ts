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
  DEFAULT_BELT_PLATE,
  type BeltPlateSpec,
  adjustmentRangeMm,
  apexToMiddleHoleMm,
  assertBeltEndSpec,
  assertBeltTipSpec,
  doubledPerimeterMm,
  keeperGapMm,
  keeperPocketClearMm,
  beltPlateLayout,
  checkBeltPlate,
  keeperStripLengthMm,
  ligamentMm,
  middleHoleIndex,
  holeOffsetsFromApexMm,
  tipLengthMm,
  tipTangentPoint,
} from '../src/lib/geometry/belt-end.ts';

/** Řezací soubor pro laser: řez černě, gravírování modře (běžná konvence řezáren). */
const LASER = {
  cutColor: '#000000',
  /** Gravírování: vodicí linky a číslice jako tahy. Žádný živý text. */
  engraveColor: '#0000ff',
  /** Značicí otvor: poloha se skrz šablonu přenáší šídlem, otvor do kůže dělá průbojník. */
  markHoleMm: 2,
  /** Zářez na hraně místo nakreslené linie – čáru uvnitř plastu není jak obtáhnout. */
  notchWidthMm: 3,
  notchDepthMm: 2,
  /** Otvor na zavěšení šablony na hřebík; zároveň jednoznačně určuje, kde je horní konec. */
  hangHoleMm: 4,
  hangHoleFromEdgeMm: 11,
  marginMm: 10,
  gapMm: 20,
} as const;

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

  out.push(text(strapX, 16, `Opasek ${cz(w)} mm — strana 1: konec u přezky`, 4.6));
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

  // Obrys: nahoře otevřený, dole rovný konec.
  // Rovný, ne zaoblený: kupovaný pás má konec už seříznutý na kolmo, zaoblovat
  // skrytý konec je práce navíc – a destička (`--multi`) používá právě tuhle rovnou
  // hranu jako referenci. CraftPoint má konec také rovný (ověřeno měřením jejich PDF).
  out.push(
    `<path d="M${f(strapX)} ${f(topY)} L${f(strapX)} ${f(endY)} ` +
      `L${f(strapX + w)} ${f(endY)} L${f(strapX + w)} ${f(topY)}" ` +
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

  out.push(text(strapX, 16, `Opasek ${cz(w)} mm — strana 2: konec se špičkou`, 4.6));
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

/* ------------------------------ řezací soubor pro laser ------------------------------ */

/** Značicí otvor Ø LASER.markHoleMm na střednici. */
function markHole(cx: number, cy: number): string {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(LASER.markHoleMm / 2)}" fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`;
}

/** Otvor na zavěšení. Větší než značicí, aby se nedaly zaměnit. */
function hangHole(cx: number, cy: number): string {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(LASER.hangHoleMm / 2)}" fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`;
}

/**
 * Zářez v boční hraně jako **součást obrysové cesty**, ne samostatná čára.
 * Otevřená cesta ležící na obrysu by v laserovém softwaru znamenala dvojí řez
 * nebo chybu; proto se zářez vkládá přímo do kontury.
 * `side` = 'left' jde po hraně dolů, 'right' nahoru.
 */
function notchSegment(edgeX: number, y: number, side: 'left' | 'right'): string {
  const hw = LASER.notchWidthMm / 2;
  const d = LASER.notchDepthMm;
  const inward = side === 'left' ? edgeX + d : edgeX - d;
  const first = side === 'left' ? y - hw : y - hw;
  const last = side === 'left' ? y + hw : y + hw;
  return side === 'left'
    ? `L${f(edgeX)} ${f(first)} L${f(inward)} ${f(y)} L${f(edgeX)} ${f(last)} `
    : `L${f(edgeX)} ${f(last)} L${f(inward)} ${f(y)} L${f(edgeX)} ${f(first)} `;
}

/**
 * Jeden řezací soubor se všemi třemi díly: konec u přezky, konec se špičkou a poutko.
 * Bez kót, bez kalibračního čtverce, bez čárkovaných linií – jen obrysy, značicí otvory
 * a zářezy. Popis je v samostatné vrstvě k gravírování.
 */
export function buildLaserSvg(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  slotStyle: SlotStyle = 'cutout',
): string {
  const w = end.beltWidthMm;
  const r = w / 2;
  const m = LASER.marginMm;
  const cut: string[] = [];

  /* --- díl 1: konec u přezky --- */
  const b1x = m;
  const bodyAbove = Math.ceil(
    end.rivetOffsetsMm[1] +
      end.rivetHoleMm / 2 +
      end.minLigamentMm +
      LASER.hangHoleFromEdgeMm +
      LASER.hangHoleMm / 2,
  );
  const foldY = m + bodyAbove;
  const b1EndY = foldY + end.tailLengthMm;
  const c1 = b1x + r;
  cut.push(
    `<path d="M${f(b1x)} ${f(m)} ` +
      notchSegment(b1x, foldY, 'left') +
      `L${f(b1x)} ${f(b1EndY - r)} ` +
      `A${f(r)} ${f(r)} 0 0 0 ${f(b1x + w)} ${f(b1EndY - r)} ` +
      notchSegment(b1x + w, foldY, 'right') +
      `L${f(b1x + w)} ${f(m)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );
  const slotEnd = end.slotLengthMm / 2 - end.slotWidthMm / 2;
  if (slotStyle === 'cutout') {
    // Stadion 25 × 6 mm půlený ohybem. Zaoblené konce mají poloměr Ø drážky / 2,
    // tedy přesně ty dva otvory, které se do kůže vysekávají.
    const sr = end.slotWidthMm / 2;
    cut.push(
      `<path d="M${f(c1 - sr)} ${f(foldY - slotEnd)} ` +
        `A${f(sr)} ${f(sr)} 0 0 1 ${f(c1 + sr)} ${f(foldY - slotEnd)} ` +
        `L${f(c1 + sr)} ${f(foldY + slotEnd)} ` +
        `A${f(sr)} ${f(sr)} 0 0 1 ${f(c1 - sr)} ${f(foldY + slotEnd)} Z" ` +
        `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
    );
  } else {
    for (const sign of [-1, 1]) cut.push(markHole(c1, foldY + sign * slotEnd));
  }
  for (const off of end.rivetOffsetsMm) {
    for (const sign of [-1, 1]) cut.push(markHole(c1, foldY + sign * off));
  }
  cut.push(hangHole(c1, m + LASER.hangHoleFromEdgeMm));

  /* --- díl 2: konec se špičkou --- */
  const b2x = b1x + w + LASER.gapMm;
  const apexY = m;
  const tanPt = tipTangentPoint(tip);
  const baseY = apexY + tipLengthMm(tip);
  const offsets = holeOffsetsFromApexMm(tip);
  const lastY = apexY + offsets[offsets.length - 1];
  const b2EndY = lastY + 2 * LASER.hangHoleFromEdgeMm;
  const c2 = b2x + w / 2;
  const midY = apexY + apexToMiddleHoleMm(tip);
  cut.push(
    `<path d="M${f(b2x)} ${f(b2EndY)} ` +
      notchSegment(b2x, midY, 'right') +
      `L${f(b2x)} ${f(baseY)} ` +
      `L${f(c2 - tanPt.halfWidthMm)} ${f(apexY + tanPt.fromApexMm)} ` +
      `A${f(tip.noseRadiusMm)} ${f(tip.noseRadiusMm)} 0 0 1 ${f(c2 + tanPt.halfWidthMm)} ${f(apexY + tanPt.fromApexMm)} ` +
      `L${f(b2x + w)} ${f(baseY)} ` +
      notchSegment(b2x + w, midY, 'left') +
      `L${f(b2x + w)} ${f(b2EndY)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );
  for (const off of offsets) cut.push(markHole(c2, apexY + off));
  cut.push(hangHole(c2, b2EndY - LASER.hangHoleFromEdgeMm));

  /* --- díl 3: poutko --- */
  const kLen = keeperStripLengthMm(end);
  const kx = m;
  const ky = Math.max(b1EndY, b2EndY) + LASER.gapMm;
  cut.push(
    `<rect x="${f(kx)}" y="${f(ky)}" width="${f(kLen)}" height="${f(end.keeperWidthMm)}" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );

  const height = Math.ceil(ky + end.keeperWidthMm + 20);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- REZACI SOUBOR. Merítko 1:1, 1 jednotka = 1 mm, list 210 mm siroky.',
    '     Vse v jedne vrstve "cut", vse jsou uzavrene kontury, zadny text, zadna vypln.',
    `     Zarezy v bocnich hranach jsou soucasti obrysu (zamerne, nejsou to vady).`,
    `     Otvory Ø ${LASER.markHoleMm} mm jsou znacici - neslucovat a nezvetsovat.`,
    `     Otvor Ø ${LASER.hangHoleMm} mm je na zaveseni sablony.`,
    '     Kompenzaci kerfu neresit. Neprepocitavat merítko. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="${height}mm" viewBox="0 0 210 ${height}">`,
    '<g id="cut">',
    ...cut,
    '</g>',
    '</svg>',
  ].join('\n');
}

/* --------------------- plochá destička pro všechny šířky --------------------- */

/**
 * Sedmisegmentové číslice kreslené jako tahy, ne jako text.
 * Živý text s fontem je pro řezárnu důvod k odmítnutí souboru; tahy jsou vektory.
 * Souřadnice v jednotkovém rámci 0..0,6 × 0..1.
 */
const DIGIT_SEGMENTS: Record<string, [number, number, number, number][]> = (() => {
  const top: [number, number, number, number] = [0, 0, 0.6, 0];
  const mid: [number, number, number, number] = [0, 0.5, 0.6, 0.5];
  const bot: [number, number, number, number] = [0, 1, 0.6, 1];
  const ul: [number, number, number, number] = [0, 0, 0, 0.5];
  const ur: [number, number, number, number] = [0.6, 0, 0.6, 0.5];
  const ll: [number, number, number, number] = [0, 0.5, 0, 1];
  const lr: [number, number, number, number] = [0.6, 0.5, 0.6, 1];
  return {
    '0': [top, ul, ur, ll, lr, bot],
    '1': [ur, lr],
    '2': [top, ur, mid, ll, bot],
    '3': [top, ur, mid, lr, bot],
    '4': [ul, ur, mid, lr],
    '5': [top, ul, mid, lr, bot],
    '6': [top, ul, mid, ll, lr, bot],
    '7': [top, ur, lr],
    '8': [top, ul, ur, mid, ll, lr, bot],
    '9': [top, ul, ur, mid, lr, bot],
  };
})();

/** Vygravíruje číslice jako tahy. `x`,`y` je levý horní roh prvního znaku. */
function engraveNumber(x: number, y: number, value: number, height: number): string[] {
  const out: string[] = [];
  const advance = height * 0.6 + height * 0.25;
  [...String(value)].forEach((ch, i) => {
    const segs = DIGIT_SEGMENTS[ch];
    if (!segs) return;
    const ox = x + i * advance;
    const d = segs
      .map(
        ([x1, y1, x2, y2]) =>
          `M${f(ox + x1 * height)} ${f(y + y1 * height)} L${f(ox + x2 * height)} ${f(y + y2 * height)}`,
      )
      .join(' ');
    out.push(`<path d="${d}" fill="none" stroke="${LASER.engraveColor}" stroke-width="0.15"/>`);
  });
  return out;
}

/** Vodorovný stadion (obdélník se zaoblenými konci) jako uzavřená kontura. */
function stadiumH(cy: number, x0: number, x1: number, height: number): string {
  const r = height / 2;
  return (
    `<path d="M${f(x0 + r)} ${f(cy - r)} L${f(x1 - r)} ${f(cy - r)} ` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(x1 - r)} ${f(cy + r)} ` +
    `L${f(x0 + r)} ${f(cy + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} ${f(cy - r)} Z" ` +
    `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`
  );
}

/**
 * Jedna plochá destička pro pásky do `maxBeltWidthMm`, řezový soubor.
 *
 * Rozvržení podle průchodu prací (viz BeltPlateSpec v src/lib/geometry/belt-end.ts):
 * horní řada = špička a dírky pro trn (umisťuje se podle prostřední dírky),
 * dolní řada = konec u přezky (umisťuje se podle **levé hrany destičky** = konec pásu).
 *
 * Poutko tu není: jeho délka závisí na šířce i tloušťce pásu a měří se na složeném pásku.
 */
export function buildBeltPlateSvg(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): string {
  const problems = checkBeltPlate(end, tip, plate);
  if (problems.length > 0) {
    throw new Error(`Neplatné rozvržení destičky:\n- ${problems.join('\n- ')}`);
  }
  const L = beltPlateLayout(end, tip, plate);
  const W = L.plateWidthMm;
  const H = L.plateHeightMm;
  const cut: string[] = [];

  // Obrys destičky. Zkosený levý horní roh značí, že levá krátká hrana je konec pásu.
  const ch = L.strapEndChamferMm;
  cut.push(
    `<path d="M0 ${f(ch)} L${f(ch)} 0 L${f(W)} 0 L${f(W)} ${f(H)} L0 ${f(H)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );

  /* --- horní řada: špička a dírky pro trn --- */
  const ay = L.tipRowY;
  const tanPt = tipTangentPoint({ ...tip, beltWidthMm: 2 * L.tipCutoutHalfMm });
  // Vyříznutý tvar špičky: obtahuje se jeho vnitřní hrana, materiál drží kolem.
  cut.push(
    `<path d="M${f(L.tipFarX)} ${f(ay - L.tipCutoutHalfMm)} ` +
      `L${f(L.tipApexX + tanPt.fromApexMm)} ${f(ay - tanPt.halfWidthMm)} ` +
      `A${f(tip.noseRadiusMm)} ${f(tip.noseRadiusMm)} 0 0 0 ${f(L.tipApexX + tanPt.fromApexMm)} ${f(ay + tanPt.halfWidthMm)} ` +
      `L${f(L.tipFarX)} ${f(ay + L.tipCutoutHalfMm)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );
  for (const x of L.tipHoleXs) cut.push(markHole(x, ay));
  // Dva otvory po stranách prostřední dírky – ta je datum pro umístění řady.
  for (const sign of [-1, 1]) cut.push(markHole(L.middleHoleX, ay + sign * L.offAxisMarkMm));

  /* --- dolní řada: konec u přezky, levá hrana destičky = konec pásu --- */
  const by = L.buckleRowY;
  cut.push(stadiumH(by, L.slotX0, L.slotX1, L.slotWidthMm));
  for (const x of L.rivetXs) cut.push(markHole(x, by));
  // Linie ohybu dvěma značkami mimo osu; zářez v hraně by na užší pás nedosáhl.
  for (const sign of [-1, 1]) cut.push(markHole(L.foldX, by + sign * L.offAxisMarkMm));

  cut.push(hangHole(L.hangHoleX, L.hangHoleY));

  /* --- vyrovnání --- */
  const engrave: string[] = [];

  /**
   * Příčná milimetrová stupnice. Linky šířek pokrývají jen čtyři velikosti (linka leží
   * ve w/2, takže sousední šířky musí být aspoň 4 mm od sebe – 38 a 40 mm proto na jedné
   * destičce být nemohou). Stupnice pokryje **jakoukoli** šířku: přečte se, kde hrana
   * pásu na ní leží. Pás 38 mm → obě hrany na 19, pás 32 mm → obě hrany na 16.
   */
  // x zvolené tak, aby stupnice ani její čísla nekolidovaly se značicími otvory
  // (nejlevější otvory řad jsou na x = 10 a 16,8, další až na 35).
  const scaleX = 24;
  for (const rowY of [ay, by]) {
    for (let k = 0; k <= Math.floor(L.tipCutoutHalfMm); k += 1) {
      const len = k % 10 === 0 ? 7 : k % 5 === 0 ? 5 : 3;
      for (const sign of k === 0 ? [1] : [-1, 1]) {
        const sy = rowY + sign * k;
        engrave.push(
          `<path d="M${f(scaleX)} ${f(sy)} L${f(scaleX + len)} ${f(sy)}" ` +
            `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.12"/>`,
        );
        // Čísla vlevo od stupnice, aby nezasahovala do pásma značicích otvorů.
        if (k > 0 && k % 10 === 0) {
          const wNum = String(k).length * L.guideLabelHeightMm * 0.85;
          engrave.push(
            ...engraveNumber(
              scaleX - 2 - wNum,
              sy - L.guideLabelHeightMm / 2,
              k,
              L.guideLabelHeightMm,
            ),
          );
        }
      }
    }
  }

  /**
   * Podélné milimetrové pravítko u horní hrany. Slouží k měření přímo na pásu –
   * hlavně na **délku pásku na poutko**, která se odečítá na složeném konci
   * (obvod zdvojené části + přeplátování) a závisí na šířce i tloušťce pásu.
   */
  const rulerY = 6;
  const rulerX0 = L.strapEndChamferMm + 2;
  const rulerX1 = W - LASER.marginMm;
  for (let mm = 0; rulerX0 + mm <= rulerX1; mm += 1) {
    const len = mm % 50 === 0 ? 7 : mm % 10 === 0 ? 5 : mm % 5 === 0 ? 3.5 : 2;
    engrave.push(
      `<path d="M${f(rulerX0 + mm)} ${f(rulerY)} L${f(rulerX0 + mm)} ${f(rulerY + len)}" ` +
        `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.12"/>`,
    );
    if (mm > 0 && mm % 50 === 0) {
      engrave.push(...engraveNumber(rulerX0 + mm + 1.5, rulerY + 1, mm, L.guideLabelHeightMm));
    }
  }

  /* --- vodicí linky šířek: srovnáním obou hran pásu se destička sama vystředí --- */
  const lineX0 = scaleX + 7 + 3;
  // Linky nesmí zajet do vyříznuté špičky ani do závěsného otvoru: laser by
  // gravíroval do prázdna a linka by byla přerušená.
  const tipRowX1 = L.tipApexX - 4;
  const buckleRowX1 = L.hangHoleX - L.hangHoleMm / 2 - 3;
  L.guides.forEach((g, i) => {
    for (const rowY of [ay, by]) {
      const lineX1 = rowY === ay ? tipRowX1 : buckleRowX1;
      // Čísla na konci linek, ve volné části řady: u levého okraje kolidovala
      // s rozlišovacím otvorem u prostřední dírky. Odstup v x, aby se u linek
      // 2,5 mm od sebe nepřekrývala.
      const labelX = lineX1 - 6 - i * (L.guideLabelHeightMm * 2.4);
      for (const sign of [-1, 1]) {
        const ly = rowY + sign * g.offsetMm;
        engrave.push(
          `<path d="M${f(lineX0)} ${f(ly)} L${f(lineX1)} ${f(ly)}" ` +
            `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.15"/>`,
        );
      }
      // Popis jen nad horní linkou páru, uvnitř pásma.
      engrave.push(
        ...engraveNumber(labelX, rowY - g.offsetMm + 0.6, g.beltWidthMm, L.guideLabelHeightMm),
      );
    }
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- REZACI SOUBOR - DESTICKA NA OPASEK ${L.minBeltWidthMm}-${L.maxBeltWidthMm} mm.`,
    `     Merítko 1:1, 1 jednotka = 1 mm, destička ${W} x ${H} mm.`,
    '     Vse v jedne vrstve "cut", uzavrene kontury, zadny text, zadna vypln.',
    '     MATERIAL: CIRY akrylat 3 mm - pres desticku se dívá na narysovanou strednici pasu.',
    `     Otvory Ø ${L.markHoleMm} mm = znacici, neslucovat a nezvetsovat.`,
    `     Otvor Ø ${L.hangHoleMm} mm v rohu = zaveseni.`,
    `     Vrstva "cut" (${LASER.cutColor}) = REZ, vrstva "engrave" (${LASER.engraveColor}) = GRAVIROVANI.`,
    '     V gravirovani jsou pricna mm stupnice, vodici linky sirek a cisla;',
    '     cisla jsou TAHY, ne zivy text.',
    '     Kompenzaci kerfu neresit. Neprepocitavat merítko. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    '<g id="cut">',
    ...cut,
    '</g>',
    '<g id="engrave">',
    ...engrave,
    '</g>',
    '</svg>',
  ].join('\n');
}

/**
 * Vysvětlivky k destičce: tentýž tvar s popisky, k pochopení a k vytištění na stěnu.
 * **Není to řezací soubor** – obsahuje živý text a nesmí se posílat řezárně.
 */
export function buildPlateLegendSvg(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): string {
  const L = beltPlateLayout(end, tip, plate);
  const base = buildBeltPlateSvg(end, tip, plate);
  const inner = base.slice(base.indexOf('<g id="cut">'), base.lastIndexOf('</svg>'));
  const W = L.plateWidthMm;
  const H = L.plateHeightMm;
  const padL = 6;
  const padR = 96;
  const padT = 16;
  const padB = 10;

  const note = (x: number, y: number, s: string, size = 3.4, color = INK): string =>
    `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="${f(size)}" fill="${color}">${s}</text>`;
  const leader = (x1: number, y1: number, x2: number, y2: number): string =>
    `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" fill="none" stroke="#999" stroke-width="0.2"/>`;

  const parts: string[] = [
    note(0, -8, `Destička na opasek ${L.minBeltWidthMm}–${L.maxBeltWidthMm} mm — co je co`, 6),
    note(0, -3, 'Vysvětlivky. Řezárně posílej opasek-desticka.svg, ne tento soubor.', 3, GREY),
  ];

  const callouts: [number, number, number, number, string][] = [
    [
      L.tipApexX,
      L.tipRowY,
      W + 4,
      L.tipRowY - 14,
      'vyříznutý tvar ŠPIČKY — obtáhni jeho vnitřní hranu',
    ],
    [
      L.middleHoleX,
      L.tipRowY,
      W + 4,
      L.tipRowY - 8,
      'PROSTŘEDNÍ dírka = tvoje míra, podle ní řadu umístíš',
    ],
    [
      L.middleHoleX,
      L.tipRowY - L.offAxisMarkMm,
      W + 4,
      L.tipRowY - 2,
      'dva otvory označují, která dírka je prostřední',
    ],
    [
      L.tipHoleXs[0],
      L.tipRowY,
      W + 4,
      L.tipRowY + 4,
      `5 dírek pro trn, rozteč ${cz(tip.holeSpacingMm)} mm`,
    ],
    [W - LASER.marginMm - 20, 6, W + 4, 10, 'podélné PRAVÍTKO — délka pásku na poutko'],
    [
      L.tipRowY > 0 ? 40 : 40,
      L.tipRowY - L.maxBeltWidthMm / 2,
      W + 4,
      L.tipRowY + 10,
      'linky ŠÍŘEK: srovnej obě hrany pásu na svou šířku',
    ],
    [
      24 + 4,
      L.tipRowY + 16,
      W + 4,
      L.tipRowY + 16,
      'příčná STUPNICE: pro šířku bez linky (38 mm → hrany na 19)',
    ],
    [
      L.foldX,
      L.buckleRowY,
      W + 4,
      L.buckleRowY - 12,
      `OVÁL pro trn ${cz(end.slotLengthMm)} × ${cz(end.slotWidthMm)} mm, ohyb ho půlí`,
    ],
    [
      L.foldX,
      L.buckleRowY - L.offAxisMarkMm,
      W + 4,
      L.buckleRowY - 6,
      'dva otvory = LINIE OHYBU, spoj je pravítkem',
    ],
    [
      L.rivetXs[3],
      L.buckleRowY,
      W + 4,
      L.buckleRowY,
      `4 otvory = 2 NÝTY (± ${cz(end.rivetOffsetsMm[0])} a ± ${cz(end.rivetOffsetsMm[1])} mm od ohybu)`,
    ],
    [
      L.rivetXs[1],
      L.buckleRowY,
      W + 4,
      L.buckleRowY + 6,
      `mezi nýty je KAPSA PRO POUTKO ${cz(keeperGapMm(end))} mm`,
    ],
    [
      0,
      L.buckleRowY,
      W + 4,
      L.buckleRowY + 12,
      `levá hrana = KONEC PÁSU (ohyb ${cz(end.tailLengthMm)} mm od ní)`,
    ],
    [
      L.strapEndChamferMm / 2,
      L.strapEndChamferMm / 2,
      W + 4,
      L.buckleRowY + 18,
      'zkosený roh značí, která hrana je konec pásu',
    ],
    [L.hangHoleX, L.hangHoleY, W + 4, L.buckleRowY + 24, 'závěsný otvor'],
  ];
  for (const [fx, fy, tx, ty, text] of callouts) {
    parts.push(leader(fx, fy, tx - 1, ty - 1));
    parts.push(note(tx, ty, text, 3.1));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- VYSVETLIVKY, ne rezaci soubor. Obsahuje zivy text. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(W + padL + padR)}mm" height="${f(H + padT + padB)}mm" ` +
      `viewBox="${f(-padL)} ${f(-padT)} ${f(W + padL + padR)} ${f(H + padT + padB)}">`,
    `<rect x="${f(-padL)}" y="${f(-padT)}" width="${f(W + padL + padR)}" height="${f(H + padT + padB)}" fill="#ffffff"/>`,
    inner,
    ...parts,
    '</svg>',
  ].join('\n');
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

/**
 * Jak řešit drážku pro trn v řezacím souboru.
 * `cutout` = drážka je v šabloně vyříznutá v plné velikosti, obtáhne se celý tvar;
 *   její zaoblené konce jsou zároveň ty dva Ø 6 mm otvory, takže značky navíc nejsou potřeba.
 * `marks` = jen dva značicí otvory ve středech konců drážky; šablona zůstane celistvější,
 *   ale tvar drážky z ní není vidět.
 */
type SlotStyle = 'cutout' | 'marks';

function slotStyleFromArgs(): SlotStyle {
  const arg = process.argv.find((a) => a.startsWith('--slot'));
  if (!arg) return 'cutout';
  const v = arg.includes('=') ? arg.split('=')[1] : process.argv[process.argv.indexOf(arg) + 1];
  if (v === 'marks' || v === 'cutout') return v;
  throw new Error('--slot musí být "cutout" nebo "marks".');
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
  const laserOnly = process.argv.includes('--laser');
  const slotStyle = slotStyleFromArgs();
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

  if (process.argv.includes('--multi')) {
    const platePath = resolve(outDir, 'opasek-desticka.svg');
    const svg = buildBeltPlateSvg(end, tip);
    writeFileSync(platePath, svg, 'utf8');
    const L = beltPlateLayout(end, tip);
    console.log(`Zapsáno ${platePath}`);

    // Papírová kontrola před objednáním akrylátu: vytisknout na A4 na šířku na 100 %
    // a přeměřit obrys. Obrys sám je kalibrace, jiná značka není potřeba.
    const legendPath = resolve(outDir, 'opasek-desticka-vysvetlivky.svg');
    writeFileSync(legendPath, buildPlateLegendSvg(end, tip), 'utf8');
    console.log(`Zapsáno ${legendPath} (vysvětlivky – NEposílat řezárně)`);

    const platePdf = resolve(outDir, 'opasek-desticka-kontrolni-tisk.pdf');
    const { chromium: cr } = await import('@playwright/test');
    const br = await cr.launch({ channel: 'chrome' });
    const pg2 = await br.newPage();
    await pg2.setContent(
      `<style>@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0}` +
        `.s{width:297mm;height:210mm;overflow:hidden}</style><div class="s">${svg}</div>`,
      { waitUntil: 'load' },
    );
    await pg2.pdf({
      path: platePdf,
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    await br.close();
    console.log(`Zapsáno ${platePdf} (kontrolní tisk na A4 na šířku, 100 %)`);
    console.log(
      `Destička ${L.plateWidthMm} × ${L.plateHeightMm} mm pro pásky ${L.minBeltWidthMm}–${L.maxBeltWidthMm} mm, čirý akryl 3 mm.`,
    );
    console.log(
      'Horní řada: špička + 5 dírek (umisťuje se podle prostřední dírky). ' +
        'Dolní řada: konec u přezky (levá hrana destičky = konec pásu).',
    );
    console.log(
      `Před objednáním vytiskni kontrolní PDF na A4 na šířku na 100 % a přeměř obrys: musí být ${L.plateWidthMm} × ${L.plateHeightMm} mm.`,
    );
    return;
  }

  const laserPath = resolve(outDir, `opasek-sablona-${beltWidthMm}mm-laser.svg`);
  writeFileSync(laserPath, buildLaserSvg(end, tip, slotStyle), 'utf8');
  console.log(
    `Zapsáno ${laserPath} (řezací soubor, 1:1, mm; drážka pro trn: ${slotStyle === 'cutout' ? 'vyříznutá' : 'jen značky'})`,
  );
  if (laserOnly) {
    console.log('Režim --laser: tisková PDF se nepřegenerovala.');
    return;
  }

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
