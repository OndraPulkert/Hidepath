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
  tipHalfWidthAtMm,
  tipLengthMm,
  tipTangentPoint,
} from '../src/lib/geometry/belt-end.ts';

/** Řezací soubor pro laser: řez černě, gravírování modře (běžná konvence řezáren). */
const LASER = {
  // Červená = řez je nejrozšířenější konvence; u černé má část strojů defaultně
  // raster-gravírování a hrozilo by prohození operací.
  cutColor: '#ff0000',
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
  `<line x1="${f(cx)}" y1="${f(y1)}" x2="${f(cx)}" y2="${f(y2)}" stroke="#b8b8b8" stroke-width="0.1" stroke-dasharray="3 3"/>`;

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
 *
 * `edge` říká, na které hraně zářez je (a tedy kam míří dovnitř materiálu),
 * `travel` kterým směrem se po hraně jede. To jsou **dvě nezávislé věci** –
 * když se sloučily do jednoho parametru, vyšly na dílu se špičkou místo zářezů
 * ostny mimo materiál (nález revize 2026-09-10).
 */
function notchSegment(
  edgeX: number,
  y: number,
  edge: 'left' | 'right',
  travel: 'down' | 'up',
): string {
  const hw = LASER.notchWidthMm / 2;
  const inward = edge === 'left' ? edgeX + LASER.notchDepthMm : edgeX - LASER.notchDepthMm;
  const [a, b] = travel === 'down' ? [y - hw, y + hw] : [y + hw, y - hw];
  return `L${f(edgeX)} ${f(a)} L${f(inward)} ${f(y)} L${f(edgeX)} ${f(b)} `;
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
      notchSegment(b1x, foldY, 'left', 'down') +
      // Konec pásu je rovný, stejně jako na tiskové šabloně a jako ho má CraftPoint.
      // Dřív tu byl půlkruh, takže dva výstupy téhož dílu měly jiný tvar.
      `L${f(b1x)} ${f(b1EndY)} L${f(b1x + w)} ${f(b1EndY)} ` +
      notchSegment(b1x + w, foldY, 'right', 'up') +
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
      notchSegment(b2x, midY, 'left', 'up') +
      `L${f(b2x)} ${f(baseY)} ` +
      `L${f(c2 - tanPt.halfWidthMm)} ${f(apexY + tanPt.fromApexMm)} ` +
      `A${f(tip.noseRadiusMm)} ${f(tip.noseRadiusMm)} 0 0 1 ${f(c2 + tanPt.halfWidthMm)} ${f(apexY + tanPt.fromApexMm)} ` +
      `L${f(b2x + w)} ${f(baseY)} ` +
      notchSegment(b2x + w, midY, 'right', 'down') +
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
    out.push(`<path d="${d}" fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`);
  });
  return out;
}

/**
 * Slot ve tvaru polokruhu (zaoblený konec pásu), jako uzavřená kontura.
 * Polokruh míří vpravo: začíná nad středem, jde přes +x a končí pod středem.
 */
function arcSlot(cx: number, cy: number, r: number, width: number): string {
  const ro = r + width / 2;
  const ri = r - width / 2;
  return (
    `<path d="M${f(cx)} ${f(cy - ro)} A${f(ro)} ${f(ro)} 0 0 1 ${f(cx)} ${f(cy + ro)} ` +
    `A${f(width / 2)} ${f(width / 2)} 0 0 0 ${f(cx)} ${f(cy + ri)} ` +
    `A${f(ri)} ${f(ri)} 0 0 0 ${f(cx)} ${f(cy - ri)} ` +
    `A${f(width / 2)} ${f(width / 2)} 0 0 0 ${f(cx)} ${f(cy - ro)} Z" ` +
    `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`
  );
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
  const r = L.cornerRadiusMm;
  cut.push(
    // Levý horní roh zkosený (orientační značka), ostatní tři zaoblené: ostrý roh
    // je na 3mm akrylátu iniciátor odštípnutí a destička se nosí a padá.
    `<path d="M0 ${f(ch)} L${f(ch)} 0 L${f(W - r)} 0 A${f(r)} ${f(r)} 0 0 1 ${f(W)} ${f(r)} ` +
      `L${f(W)} ${f(H - r)} A${f(r)} ${f(r)} 0 0 1 ${f(W - r)} ${f(H)} ` +
      `L${f(r)} ${f(H)} A${f(r)} ${f(r)} 0 0 1 0 ${f(H - r)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );

  /* --- horní řada: špička a dírky pro trn --- */
  const ay = L.tipRowY;
  const tanPt = tipTangentPoint({ ...tip, beltWidthMm: 2 * L.tipCutoutHalfMm });
  // Vyříznutý tvar špičky: obtahuje se jeho vnitřní hrana, materiál drží kolem.
  // Vrchol vpravo, široký konec vlevo (k dírkám): pás se od dírek k vrcholu zužuje.
  cut.push(
    `<path d="M${f(L.tipFarX)} ${f(ay - L.tipCutoutHalfMm)} ` +
      `L${f(L.tipApexX - tanPt.fromApexMm)} ${f(ay - tanPt.halfWidthMm)} ` +
      `A${f(tip.noseRadiusMm)} ${f(tip.noseRadiusMm)} 0 0 1 ${f(L.tipApexX - tanPt.fromApexMm)} ${f(ay + tanPt.halfWidthMm)} ` +
      `L${f(L.tipFarX)} ${f(ay + L.tipCutoutHalfMm)} Z" ` +
      `fill="none" stroke="${LASER.cutColor}" stroke-width="0.1"/>`,
  );
  for (const x of L.tipHoleXs) cut.push(markHole(x, ay));

  /* --- prostřední řada: zaoblený konec a dírky pro trn --- */
  const ry = L.roundedRowY;
  for (const arc of L.roundedArcs) {
    cut.push(arcSlot(arc.centreX, ry, arc.radiusMm, L.roundedSlotWidthMm));
  }
  for (const x of L.tipHoleXs) cut.push(markHole(x, ry));

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
  for (const rowY of [ay, ry, by]) {
    // Rozsah jen na nejširší podporovaný pás (+0,5 mm), ne na půlku výřezu špičky:
    // se ±27 mm se stupnice sousedních řad k sobě přiblížily na 2 mm a v náhledu
    // vypadaly jako jedna průběžná žebřina přes celou destičku. Teď je mezi nimi 11 mm.
    for (let k = 0; k <= Math.ceil(L.maxBeltWidthMm / 2) + 1; k += 1) {
      // Drobné rysky kratší (2 mm): se 3 mm splývaly s vodicími linkami vedle.
      const len = k % 10 === 0 ? 7 : k % 5 === 0 ? 4 : 2;
      for (const sign of k === 0 ? [1] : [-1, 1]) {
        const sy = rowY + sign * k;
        engrave.push(
          `<path d="M${f(scaleX)} ${f(sy)} L${f(scaleX + len)} ${f(sy)}" ` +
            `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
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
  const rulerY = L.rulerYMm;
  const rulerX0 = L.rulerX0Mm;
  const rulerX1 = L.rulerEndXMm;
  // Čísla leží DOVNITŘ pásma pravítka, vpravo od své rysky (nad základnou byla „0“
  // ve zkoseném rohu a laser by ji vyřezal napůl). Proto se nejdřív spočítají jejich
  // obálky a rysky, které do nich zasahují, se zkrátí — jinak přes číslo osm rysek
  // projede naskrz a gravíruje se dvakrát. Milimetrová mřížka zůstane celá.
  const rulerLabelY = rulerY + 1.6;
  const rulerLabelH = L.guideLabelHeightMm;
  const rulerLabels: { mm: number; x0: number; x1: number }[] = [];
  for (let mm = 0; rulerX0 + mm <= rulerX1; mm += 50) {
    const x0 = rulerX0 + mm + 1.2;
    rulerLabels.push({ mm, x0, x1: x0 + String(mm).length * rulerLabelH * 0.85 });
  }
  const shortTickMm = 1.2;
  for (let mm = 1; rulerX0 + mm <= rulerX1; mm += 1) {
    // Nula je sama levá hrana destičky, o kterou se měřený pásek opře. Rysku na ni
    // nekreslím: ležela by na řezné linii a kerf by z ní odebral první desetinky.
    const x = rulerX0 + mm;
    const underLabel = rulerLabels.some((l) => x >= l.x0 - 0.05 && x <= l.x1 + 0.05);
    const len = underLabel
      ? shortTickMm
      : mm % 50 === 0
        ? L.rulerLongTickMm
        : mm % 10 === 0
          ? 5
          : mm % 5 === 0
            ? 3.5
            : 2;
    engrave.push(
      `<path d="M${f(x)} ${f(rulerY)} L${f(x)} ${f(rulerY + len)}" ` +
        `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
    );
  }
  for (const l of rulerLabels) {
    engrave.push(...engraveNumber(l.x0, rulerLabelY, l.mm, rulerLabelH));
  }

  /* --- vodicí linky šířek: srovnáním obou hran pásu se destička sama vystředí --- */
  // 8 mm mezera od stupnice: se 3 mm to v náhledu čtlo jako jedna žebřina
  // přecházející do vodicích linek.
  const lineX0 = scaleX + 7 + 8;
  // Linky nesmí zajet do vyříznuté špičky ani do závěsného otvoru: laser by
  // gravíroval do prázdna a linka by byla přerušená.
  const tipRowX1 = L.tipFarX - 4;
  const buckleRowX1 = L.hangHoleX - L.hangHoleMm / 2 - 3;
  L.guides.forEach((g, i) => {
    for (const rowY of [ay, ry, by]) {
      const lineX1 =
        // V řadě se zaobleným koncem dotahuji linku až ke středové svislici oblouků:
        // konec oblouku o poloměru r leží přesně na lince šířky 2r, takže se linky
        // a oblouky označují navzájem a nejsou potřeba čísla u oblouků.
        rowY === ay ? tipRowX1 : rowY === ry ? L.roundedArcs[0].centreX : buckleRowX1;
      // Čísla na konci linek, ve volné části řady: u levého okraje kolidovala
      // s rozlišovacím otvorem u prostřední dírky. Odstup v x, aby se u linek
      // 2,5 mm od sebe nepřekrývala.
      // Popisek nižší než rozestup linek (2,5 mm) a vycentrovaný na výšku SVÉ linky:
      // dřív jím procházela linka sousední šířky a přiřazení bylo dvojznačné.
      const labelH = 2;
      // 10 mm od konce linky, ne 6: u řady 2 končí linka na středové svislici
      // oblouků a za mezerou pro popisek musí zůstat dost linky, aby byl vidět
      // dotyk oblouku s ní.
      const labelX = lineX1 - 10 - i * (labelH * 2.4);
      const labelW = String(g.beltWidthMm).length * labelH * 0.85;
      for (const sign of [-1, 1]) {
        const ly = rowY + sign * g.offsetMm;
        // Popisek je u KAŽDÉ linky páru (dolní hranu pásu se nemá srovnávat na
        // linku, kterou si člověk musí dopočítat zrcadlením) a je **vycentrovaný
        // na svou linku, ve které se pro něj udělá mezera**. Dvě předchozí varianty
        // byly obě špatné: na lince se příčné tahy číslic gravírovaly dvakrát,
        // a odsazený do mezery ležel přesně v půli mezi svou a vedlejší linkou,
        // tedy 1,25 mm od každé – u řady 2 by to znamenalo oblouk pro o 5 mm jinou
        // šířku. Přerušená linka je jednoznačná: popisek v ní přímo leží.
        const gapFrom = labelX - 0.6;
        const gapTo = labelX + labelW + 0.6;
        for (const [x0, x1] of [
          [lineX0, gapFrom],
          [gapTo, lineX1],
        ] as const) {
          if (x1 - x0 < 0.2) continue;
          engrave.push(
            `<path d="M${f(x0)} ${f(ly)} L${f(x1)} ${f(ly)}" ` +
              `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
          );
        }
        engrave.push(...engraveNumber(labelX, ly - labelH / 2, g.beltWidthMm, labelH));
      }
    }
  });

  // Rozlišení prostřední dírky: gravírované rysky, ne vyříznuté otvory. Vyříznutými
  // by se dalo omylem značit šídlem přímo do viditelné plochy pásu.
  for (const rowY of [ay, ry]) {
    for (const sign of [-1, 1]) {
      const my = rowY + sign * L.offAxisMarkMm;
      engrave.push(
        `<path d="M${f(L.middleHoleX - 3)} ${f(my)} L${f(L.middleHoleX + 3)} ${f(my)} ` +
          `M${f(L.middleHoleX)} ${f(my - 2)} L${f(L.middleHoleX)} ${f(my + 2)}" ` +
          `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
      );
    }
  }

  // Čísla řad 1/2/3 u levého okraje. Bez nich se destička o sobě nedá nijak
  // přečíst: dokumentace mluví o „řadě 1/2/3“ a na dílu to slovo nebylo.
  // Písmena nejde gravírovat (tahový font zná jen číslice), čísla ano a stačí.
  [ay, ry, by].forEach((rowY, i) => {
    engrave.push(...engraveNumber(4, rowY - 1.5, i + 1, 3));
  });

  // Čárkovaná linie ohybu na řadě s přezkou: vede přesně mezi oběma značicími
  // otvory ohybu a ukazuje, že ohyb ovál půlí. Přes ovál se nekreslí – gravírovat
  // do výřezu nejde.
  {
    const halfBand = L.maxBeltWidthMm / 2;
    const slotHalf = L.slotWidthMm / 2 + 0.5;
    for (const [y0, y1] of [
      [by - halfBand, by - slotHalf],
      [by + slotHalf, by + halfBand],
    ] as const) {
      for (let y = y0; y < y1 - 0.01; y += 3) {
        const yEnd = Math.min(y + 1.8, y1);
        // Čárka se nesmí dotknout značicího otvoru ohybu, jinak by se do něj
        // gravírovalo a šídlo by mělo v otvoru nečistou hranu.
        const clash = [by - L.offAxisMarkMm, by + L.offAxisMarkMm].some(
          (my) => yEnd > my - L.markHoleMm / 2 - 0.5 && y < my + L.markHoleMm / 2 + 0.5,
        );
        if (clash) continue;
        engrave.push(
          `<path d="M${f(L.foldX)} ${f(y)} L${f(L.foldX)} ${f(yEnd)}" ` +
            `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
        );
      }
    }
  }

  // Kalibrační kóta 50 mm: na hotovém dílu i na obrazovce je přeškálování hned vidět.
  const calY = H - 4;
  // Odsazeno od pravého okraje o závěsný otvor: jeho pravá koncová ryska
  // dřív procházela přesně středem otvoru.
  const calX = W - LASER.marginMm - 50 - (L.hangHoleMm + 6);
  engrave.push(
    `<path d="M${f(calX)} ${f(calY - 2)} L${f(calX)} ${f(calY + 2)} M${f(calX)} ${f(calY)} ` +
      `L${f(calX + 50)} ${f(calY)} M${f(calX + 50)} ${f(calY - 2)} L${f(calX + 50)} ${f(calY + 2)}" ` +
      `fill="none" stroke="${LASER.engraveColor}" stroke-width="0.1"/>`,
  );
  engrave.push(...engraveNumber(calX + 22, calY - 4.6, 50, L.guideLabelHeightMm));

  const pad = 5;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- REZACI SOUBOR - DESTICKA NA OPASEK ${L.minBeltWidthMm}-${L.maxBeltWidthMm} mm.`,
    `     Merítko 1:1, 1 jednotka = 1 mm, destička ${W} x ${H} mm.`,
    '     Uzavrene kontury, zadny zivy text, zadna vypln, zadny transform.',
    '     MATERIAL: LITY (GS) CIRY akrylat 3 mm. Zebra mezi vnorenymi sloty',
    `     jsou ${cz(L.roundedArcs.length > 1 ? 1.5 : 0)} mm - je to zamer, stejne jako u komercnich desticek.`,
    `     Otvory Ø ${L.markHoleMm} mm = znacici, neslucovat a nezvetsovat.`,
    `     Otvor Ø ${L.hangHoleMm} mm v rohu = zaveseni.`,
    `     Vrstva "cut" (${LASER.cutColor}) = REZ, vrstva "engrave" (${LASER.engraveColor}) = GRAVIROVANI.`,
    '     V gravirovani jsou pricna mm stupnice, vodici linky sirek a cisla;',
    '     cisla jsou TAHY, ne zivy text.',
    '     POSTUP: nejdriv GRAVIROVANI, pak vnitrni geometrie, OBRYS AZ NAKONEC.',
    '     Gravirovani vektorove jednim pruchodem, nizky vykon - ne rastrem.',
    '     Rez na strednici, kerf nekompenzovat (roztece otvoru zustanou dle souboru).',
    '     Zebra mezi oblouky 1,5 mm: pri kerfu nad 0,25 mm se prosim ozvete.',
    '     BEZ dokonceni: nebrousit, nelestit plamenem, nebubnovat. Folii ponechte.',
    '     Neprepocitavat merítko: 1 jednotka = 1 mm, kontrolni kota 50 mm je dole. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
      `width="${f(W + 2 * pad)}mm" height="${f(H + 2 * pad)}mm" ` +
      `viewBox="${f(-pad)} ${f(-pad)} ${f(W + 2 * pad)} ${f(H + 2 * pad)}">`,
    '<g id="cut" inkscape:groupmode="layer" inkscape:label="REZ">',
    ...cut,
    '</g>',
    '<g id="engrave" inkscape:groupmode="layer" inkscape:label="GRAVIROVANI">',
    ...engrave,
    '</g>',
    '</svg>',
  ].join('\n');
}

/**
 * Vysvětlivky k destičce: tentýž tvar s popisky, k pochopení a k vytištění na stěnu.
 * **Není to řezací soubor** – obsahuje živý text a nesmí se posílat řezárně.
 */
/**
 * Převod destičky do DXF R12. Proč vůbec: české zakázkové řezárny běžně chtějí
 * Corel/AutoCAD/Illustrator a software na většině levných CO2 strojů (RDWorks)
 * bere SVG špatně nebo vůbec. Export z Inkscape není řešení – ten oblouky
 * rozseká na polyliny, což je přesně to, co u oblouků r = 4 až 22,5 mm nechceme.
 *
 * Emituje se jen podmnožina, kterou generátor kreslí: LINE, ARC, CIRCLE.
 * DXF má **osu Y nahoru**, SVG dolů, takže se y zrcadlí (`y' = H − y`).
 * Směr oblouku se neurčuje úvahou o znaménkách, ale numericky: ARC v DXF jde
 * vždy proti směru hodinových ručiček, takže se otestuje, jestli cesta proti
 * směru ze startu do konce prochází skutečným středem oblouku.
 */
type DxfEntity =
  | { kind: 'line'; layer: string; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'arc'; layer: string; cx: number; cy: number; r: number; a0: number; a1: number }
  | { kind: 'circle'; layer: string; cx: number; cy: number; r: number };

/**
 * Střed oblouku z SVG zápisu `A rx ry rot laf sf x y`.
 *
 * Středy jsou vždy dva, symetricky po stranách tětivy. **Nevybírám je znaménkem
 * podle tabulky** – to jsem si jednou spletl a rohy destičky se v DXF vydouvaly
 * ven místo zaoblení. Vybírá se z **významu příznaků**, který se nedá splést:
 * `largeArc = 0` znamená kratší oblouk, tedy rozsah ≤ 180°, `largeArc = 1` delší.
 * Oba kandidáti dávají rozsahy, které se doplňují do 360°, takže podmínka
 * „≤ 180° ⇔ largeArc = 0" jednoznačně určí, který střed je ten pravý.
 */
function svgArcToCentre(
  x0: number,
  y0: number,
  r: number,
  largeArc: boolean,
  sweep: boolean,
  x1: number,
  y1: number,
): { cx: number; cy: number } {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.hypot(dx, dy);
  // Poloměr menší než polovina tětivy by neexistoval; generátor takový nekreslí,
  // ale kdyby zaokrouhlení sáhlo pod, vezme se mez.
  const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2));
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const candidates = [1, -1].map((sign) => ({
    cx: mx + (sign * h * -dy) / d,
    cy: my + (sign * h * dx) / d,
  }));
  const spanFor = (c: { cx: number; cy: number }): number => {
    const a0 = Math.atan2(y0 - c.cy, x0 - c.cx);
    const a1 = Math.atan2(y1 - c.cy, x1 - c.cx);
    let da = a1 - a0;
    if (sweep && da < 0) da += 2 * Math.PI;
    if (!sweep && da > 0) da -= 2 * Math.PI;
    return Math.abs(da);
  };
  const wanted = candidates.find((c) => spanFor(c) <= Math.PI === !largeArc);
  if (!wanted) throw new Error('DXF: střed oblouku nejde určit.');
  return wanted;
}

function svgLayerToDxf(svg: string, layerId: string, layer: string, H: number): DxfEntity[] {
  const start = svg.indexOf(`<g id="${layerId}"`);
  if (start < 0) throw new Error(`DXF: vrstva ${layerId} v SVG chybí.`);
  const body = svg.slice(start, svg.indexOf('</g>', start));
  const out: DxfEntity[] = [];
  const flip = (y: number): number => H - y;

  for (const m of body.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)) {
    out.push({
      kind: 'circle',
      layer,
      cx: Number(m[1]),
      cy: flip(Number(m[2])),
      r: Number(m[3]),
    });
  }

  for (const pm of body.matchAll(/<path d="([^"]+)"/g)) {
    const d = pm[1];
    const tokens = [...d.matchAll(/([MLAZ])([^MLAZ]*)/g)];
    let cur: [number, number] | null = null;
    let first: [number, number] | null = null;
    for (const t of tokens) {
      const cmd = t[1];
      const nums = [...t[2].matchAll(/-?[\d.]+/g)].map((n) => Number(n[0]));
      if (cmd === 'M') {
        cur = [nums[0], nums[1]];
        first = cur;
      } else if (cmd === 'L') {
        for (let i = 0; i + 1 < nums.length; i += 2) {
          const next: [number, number] = [nums[i], nums[i + 1]];
          if (cur) {
            out.push({
              kind: 'line',
              layer,
              x1: cur[0],
              y1: flip(cur[1]),
              x2: next[0],
              y2: flip(next[1]),
            });
          }
          cur = next;
        }
      } else if (cmd === 'A') {
        if (!cur) throw new Error('DXF: oblouk bez počátku.');
        const [rx, , , laf, sf, x1, y1] = nums;
        const c = svgArcToCentre(cur[0], cur[1], rx, laf === 1, sf === 1, x1, y1);
        // Do DXF souřadnic (y nahoru) a pak úhly.
        const cy = flip(c.cy);
        const sA = Math.atan2(flip(cur[1]) - cy, cur[0] - c.cx);
        const eA = Math.atan2(flip(y1) - cy, x1 - c.cx);
        // Skutečný střed oblouku v SVG: bod na kružnici v polovině rozsahu.
        const midSvg = (() => {
          const a0 = Math.atan2(cur[1] - c.cy, cur[0] - c.cx);
          const a1 = Math.atan2(y1 - c.cy, x1 - c.cx);
          let da = a1 - a0;
          if (sf === 1 && da < 0) da += 2 * Math.PI;
          if (sf === 0 && da > 0) da -= 2 * Math.PI;
          const am = a0 + da / 2;
          return [c.cx + rx * Math.cos(am), c.cy + rx * Math.sin(am)] as const;
        })();
        const midAngle = Math.atan2(flip(midSvg[1]) - cy, midSvg[0] - c.cx);
        const inCcw = (a0: number, a1: number, a: number): boolean => {
          const norm = (v: number): number => ((v % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const span = norm(a1 - a0);
          return norm(a - a0) <= span + 1e-9;
        };
        const [a0, a1] = inCcw(sA, eA, midAngle) ? [sA, eA] : [eA, sA];
        out.push({ kind: 'arc', layer, cx: c.cx, cy, r: rx, a0, a1 });
        cur = [x1, y1];
      } else if (cmd === 'Z') {
        if (cur && first && (cur[0] !== first[0] || cur[1] !== first[1])) {
          out.push({
            kind: 'line',
            layer,
            x1: cur[0],
            y1: flip(cur[1]),
            x2: first[0],
            y2: flip(first[1]),
          });
        }
        cur = first;
      }
    }
  }
  return out;
}

const DXF_LAYERS: { name: string; colour: number }[] = [
  { name: 'REZ', colour: 1 },
  { name: 'GRAVIROVANI', colour: 5 },
];

function dxfDocument(entities: DxfEntity[]): string {
  const g = (code: number, value: string | number): string => `${code}\n${value}\n`;
  const num = (v: number): string => v.toFixed(4);
  const deg = (rad: number): string => (((rad * 180) / Math.PI + 360) % 360).toFixed(4);
  let out = '';
  out += g(0, 'SECTION') + g(2, 'HEADER');
  // $INSUNITS 4 = milimetry, $MEASUREMENT 1 = metrická soustava.
  out += g(9, '$INSUNITS') + g(70, 4);
  out += g(9, '$MEASUREMENT') + g(70, 1);
  out += g(0, 'ENDSEC');
  out +=
    g(0, 'SECTION') + g(2, 'TABLES') + g(0, 'TABLE') + g(2, 'LAYER') + g(70, DXF_LAYERS.length);
  for (const l of DXF_LAYERS) {
    out += g(0, 'LAYER') + g(2, l.name) + g(70, 0) + g(62, l.colour) + g(6, 'CONTINUOUS');
  }
  out += g(0, 'ENDTAB') + g(0, 'ENDSEC');
  out += g(0, 'SECTION') + g(2, 'ENTITIES');
  for (const e of entities) {
    if (e.kind === 'line') {
      out +=
        g(0, 'LINE') +
        g(8, e.layer) +
        g(10, num(e.x1)) +
        g(20, num(e.y1)) +
        g(30, '0.0') +
        g(11, num(e.x2)) +
        g(21, num(e.y2)) +
        g(31, '0.0');
    } else if (e.kind === 'circle') {
      out +=
        g(0, 'CIRCLE') +
        g(8, e.layer) +
        g(10, num(e.cx)) +
        g(20, num(e.cy)) +
        g(30, '0.0') +
        g(40, num(e.r));
    } else {
      out +=
        g(0, 'ARC') +
        g(8, e.layer) +
        g(10, num(e.cx)) +
        g(20, num(e.cy)) +
        g(30, '0.0') +
        g(40, num(e.r)) +
        g(50, deg(e.a0)) +
        g(51, deg(e.a1));
    }
  }
  out += g(0, 'ENDSEC') + g(0, 'EOF');
  return out;
}

/**
 * DXF destičky. `cutOnly` je pro automatické kalkulačky, které chtějí „pouze tvar
 * výpalku v měřítku 1:1, bez textů" – ty gravírování naceňovat neumí.
 */
export function buildBeltPlateDxf(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
  cutOnly = false,
): string {
  const L = beltPlateLayout(end, tip, plate);
  const svg = buildBeltPlateSvg(end, tip, plate);
  const H = L.plateHeightMm;
  const entities = [
    ...svgLayerToDxf(svg, 'cut', 'REZ', H),
    ...(cutOnly ? [] : svgLayerToDxf(svg, 'engrave', 'GRAVIROVANI', H)),
  ];
  return dxfDocument(entities);
}

/**
 * Realistický náhled hotového konce pásku. **Není to výrobní soubor** a nekreslí se
 * z něj nic – je to odpověď na otázku „jak to bude ve skutečnosti vypadat".
 *
 * Geometrie je přesná: obrys se vzorkuje z `tipHalfWidthAtMm` po 0,25 mm a dírky
 * sedí na `holeOffsetsFromApexMm`. Ilustrativní je jen povrch (odstín, zrno, sražená
 * hrana). Záměrně **bez šití** – tenhle pásek se nešije, drží na dvou šroubovacích
 * nýtech, takže nakreslený steh by lhal.
 */
export function buildBeltTipPreviewSvg(tip: BeltTipSpec, style: 'point' | 'round'): string {
  const w = tip.beltWidthMm;
  const half = w / 2;
  const holes = holeOffsetsFromApexMm(tip);
  const shownMm = Math.ceil(holes[holes.length - 1] + 18);
  const pad = 8;
  const cy = pad + half;
  const apexX = pad + shownMm;
  const bodyLeft = pad;

  /**
   * Obrys se skládá ze tří částí: rovná horní hrana, tvar konce, rovná dolní hrana.
   * `inset` > 0 kreslí tentýž obrys zmenšený dovnitř – tím vzniká sražená
   * a zaleštěná hrana. (Napoprvé jsem body konce vzal v obráceném pořadí a z pásku
   * se stala šipka, takže tady na směru záleží.)
   */
  const outlinePath = (inset: number): string => {
    const hEdge = half - inset;
    const xEnd = apexX - inset;
    if (style === 'round') {
      const r = hEdge;
      const xArc = xEnd - r;
      return (
        `M${f(bodyLeft)} ${f(cy - hEdge)} L${f(xArc)} ${f(cy - hEdge)} ` +
        `A${f(r)} ${f(r)} 0 0 1 ${f(xArc)} ${f(cy + hEdge)} ` +
        `L${f(bodyLeft)} ${f(cy + hEdge)} Z`
      );
    }
    const len = tipLengthMm(tip);
    // d = vzdálenost od vrcholu; hw = poloviční šířka pásu v tom místě.
    const pts: [number, number][] = [];
    for (let d = 0; d <= len + 1e-9; d += 0.25) {
      pts.push([xEnd - d, Math.max(0, tipHalfWidthAtMm(tip, Math.min(d, len)) - inset)]);
    }
    const topRun = [...pts]
      .reverse()
      .map(([x, hw]) => `L${f(x)} ${f(cy - hw)}`)
      .join(' ');
    const bottomRun = pts.map(([x, hw]) => `L${f(x)} ${f(cy + hw)}`).join(' ');
    return (
      `M${f(bodyLeft)} ${f(cy - hEdge)} L${f(xEnd - len)} ${f(cy - hEdge)} ` +
      `${topRun} ${bottomRun} ` +
      `L${f(xEnd - len)} ${f(cy + hEdge)} L${f(bodyLeft)} ${f(cy + hEdge)} Z`
    );
  };

  const outline = outlinePath(0);
  const inner = outlinePath(1.3);

  const holeCircles = holes
    .map(
      (o) =>
        `<circle cx="${f(apexX - o)}" cy="${f(cy)}" r="${f(tip.holeDiameterMm / 2)}" fill="url(#hole)"/>` +
        `<circle cx="${f(apexX - o)}" cy="${f(cy)}" r="${f(tip.holeDiameterMm / 2)}" ` +
        `fill="none" stroke="#3a2413" stroke-width="0.25" opacity="0.6"/>`,
    )
    .join('\n');

  const W = shownMm + 2 * pad;
  const H = w + 2 * pad;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- NAHLED, ne vyrobni soubor. Geometrie z modelu, povrch ilustrativni. -->',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(W)}mm" height="${f(H)}mm" viewBox="0 0 ${f(W)} ${f(H)}">`,
    '<defs>',
    '<linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#8f5f36"/>',
    '<stop offset="0.42" stop-color="#b98452"/>',
    '<stop offset="0.6" stop-color="#a97445"/>',
    '<stop offset="1" stop-color="#75492a"/>',
    '</linearGradient>',
    '<radialGradient id="hole" cx="0.5" cy="0.35" r="0.8">',
    '<stop offset="0" stop-color="#17100a"/>',
    '<stop offset="0.75" stop-color="#241708"/>',
    '<stop offset="1" stop-color="#5a3a1d"/>',
    '</radialGradient>',
    '<filter id="grain">',
    '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="4" seed="11" result="n"/>',
    '<feColorMatrix in="n" type="saturate" values="0"/>',
    '</filter>',
    '<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">',
    '<feGaussianBlur stdDeviation="0.7"/>',
    '</filter>',
    '<clipPath id="body"><path d="' + outline + '"/></clipPath>',
    '</defs>',
    `<rect width="${f(W)}" height="${f(H)}" fill="#efece7"/>`,
    `<path d="${outline}" fill="#000" opacity="0.2" transform="translate(0.9 1.2)" filter="url(#soft)"/>`,
    `<path d="${outline}" fill="url(#leather)"/>`,
    // Zrno: šum přes tělo pásku, jen slabě.
    `<g clip-path="url(#body)"><rect width="${f(W)}" height="${f(H)}" filter="url(#grain)" opacity="0.13"/></g>`,
    // Sražená hrana: světlý pruh dovnitř a tmavý obvod.
    `<path d="${inner}" fill="none" stroke="#e6c295" stroke-width="0.45" opacity="0.4"/>`,
    `<path d="${outline}" fill="none" stroke="#services"/>`.replace(
      '#services',
      '#4a2f18" stroke-width="1.2" opacity="0.85',
    ),
    `<path d="${outline}" fill="none" stroke="#2b1a0c" stroke-width="0.35"/>`,
    holeCircles,
    '</svg>',
  ].join('\n');
}

/**
 * Varianta pro řezárny, které gravírují **rastrem** a potřebují uzavřené plochy,
 * ne čáry. Každá gravírovaná úsečka se převede na obdélník o šířce `widthMm`.
 *
 * Proč to není výchozí: tahle destička chce **vektorové** gravírování jedním
 * průchodem, protože vodicí linky slouží k srovnání hrany pásu a šířka linky je
 * sama o sobě nepřesnost. Plochy jsou ústupek konkrétnímu provozu, ne vylepšení.
 *
 * Konce obdélníků jsou „na tupo", tedy přesně jako u původního tahu s butt cap —
 * převod tím nemění délku ani polohu žádné linky, jen jí dá šířku.
 */
function engraveSegments(svg: string): [number, number, number, number][] {
  const start = svg.indexOf('<g id="engrave"');
  if (start < 0) throw new Error('Plochy: gravírovací vrstva v SVG chybí.');
  const body = svg.slice(start, svg.indexOf('</g>', start));
  const out: [number, number, number, number][] = [];
  for (const m of body.matchAll(/<path d="([^"]+)"/g)) {
    for (const sub of m[1].split('M').slice(1)) {
      const n = [...sub.matchAll(/-?[\d.]+/g)].map((v) => Number(v[0]));
      for (let i = 0; i + 3 < n.length; i += 2) {
        const seg: [number, number, number, number] = [n[i], n[i + 1], n[i + 2], n[i + 3]];
        if (Math.hypot(seg[2] - seg[0], seg[3] - seg[1]) > 1e-9) out.push(seg);
      }
    }
  }
  return out;
}

/** Rohy obdélníku kolem úsečky: A±n·w/2, B±n·w/2. */
function segmentRect(
  [x1, y1, x2, y2]: [number, number, number, number],
  widthMm: number,
): [number, number][] {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * (widthMm / 2);
  const ny = ((x2 - x1) / len) * (widthMm / 2);
  return [
    [x1 + nx, y1 + ny],
    [x2 + nx, y2 + ny],
    [x2 - nx, y2 - ny],
    [x1 - nx, y1 - ny],
  ];
}

export function buildBeltPlateAreaSvg(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
  widthMm = 0.25,
): string {
  const base = buildBeltPlateSvg(end, tip, plate);
  const cutFrom = base.indexOf('<g id="cut"');
  const cutTo = base.indexOf('</g>', cutFrom) + 4;
  const header = base.slice(0, cutFrom);
  const cutLayer = base.slice(cutFrom, cutTo);
  const rects = engraveSegments(base).map((seg) => {
    const d = segmentRect(seg, widthMm)
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`)
      .join(' ');
    return `<path d="${d} Z" fill="${LASER.engraveColor}" stroke="none"/>`;
  });
  return [
    header.replace(
      'REZACI SOUBOR',
      `REZACI SOUBOR - VARIANTA S GRAVIROVANIM JAKO PLOCHY (sirka ${f(widthMm)} mm)\n     REZ`,
    ),
    cutLayer,
    `<g id="engrave" inkscape:groupmode="layer" inkscape:label="GRAVIROVANI">`,
    ...rects,
    '</g>',
    '</svg>',
  ].join('\n');
}

/** Totéž v DXF: gravírování jako uzavřené polyliny (R12 POLYLINE/VERTEX/SEQEND). */
export function buildBeltPlateAreaDxf(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
  widthMm = 0.25,
): string {
  const L = beltPlateLayout(end, tip, plate);
  const H = L.plateHeightMm;
  const base = buildBeltPlateSvg(end, tip, plate);
  const cutOnly = buildBeltPlateDxf(end, tip, plate, true);
  const g = (code: number, value: string | number): string => `${code}\n${value}\n`;
  const num = (v: number): string => v.toFixed(4);
  const polys = engraveSegments(base)
    .map((seg) => {
      const pts = segmentRect(seg, widthMm);
      let out = g(0, 'POLYLINE') + g(8, 'GRAVIROVANI') + g(66, 1) + g(70, 1);
      for (const [x, y] of pts) {
        out +=
          g(0, 'VERTEX') + g(8, 'GRAVIROVANI') + g(10, num(x)) + g(20, num(H - y)) + g(30, '0.0');
      }
      return out + g(0, 'SEQEND') + g(8, 'GRAVIROVANI');
    })
    .join('');
  // Vložit před ENDSEC sekce ENTITIES řezu.
  const marker = `0\nENDSEC\n0\nEOF\n`;
  if (!cutOnly.endsWith(marker)) throw new Error('Plochy: neočekávaný konec DXF.');
  return cutOnly.slice(0, -marker.length) + polys + marker;
}

export function buildPlateLegendSvg(
  end: BeltEndSpec,
  tip: BeltTipSpec,
  plate: BeltPlateSpec = DEFAULT_BELT_PLATE,
): string {
  const L = beltPlateLayout(end, tip, plate);
  const base = buildBeltPlateSvg(end, tip, plate);
  // Bere se celý obsah obou vrstev z řezacího souboru, ať vysvětlivky ukazují přesně
  // tentýž tvar. Hledá se `<g id="cut"` bez `>` – ta vrstva nese ještě inkscape atributy.
  const from = base.indexOf('<g id="cut"');
  const to = base.lastIndexOf('</svg>');
  if (from < 0 || to <= from) {
    throw new Error('Vysvětlivky: v řezacím souboru nejde najít vrstva řezu.');
  }
  // Vrstvy se přejmenují a přebarví do šedé. Důvod: vrstva řezu je tady bajtově
  // totožná s výrobním souborem, včetně #ff0000, a jediné varování „není řezací
  // soubor“ je XML komentář (ten CAM nezobrazí) a živý text (ten CAM zahodí).
  // Kdo tenhle soubor pošle na laser, dostane destičku proškrtanou odkazovými
  // linkami. Šedá a jména NEREZAT/NEGRAVIROVAT to udělají viditelným i v CAMu.
  const inner = base
    .slice(from, to)
    .replaceAll(LASER.cutColor, '#8a8a8a')
    .replaceAll(LASER.engraveColor, '#b0b0b0')
    .replace('id="cut"', 'id="nerezat"')
    .replace('inkscape:label="REZ"', 'inkscape:label="NEREZAT"')
    .replace('id="engrave"', 'id="negravirovat"')
    .replace('inkscape:label="GRAVIROVANI"', 'inkscape:label="NEGRAVIROVAT"');
  const W = L.plateWidthMm;
  const H = L.plateHeightMm;
  const padL = 6;
  const padR = 112;
  const padT = 16;
  const padB = 10;

  const note = (x: number, y: number, s: string, size = 3.4, color = INK): string =>
    `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="${f(size)}" fill="${color}">${s}</text>`;
  const leader = (x1: number, y1: number, x2: number, y2: number): string =>
    `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" fill="none" stroke="#999" stroke-width="0.2"/>`;

  const parts: string[] = [
    note(0, -8, `Destička na opasek ${L.minBeltWidthMm}–${L.maxBeltWidthMm} mm — co je co`, 6),
    note(
      0,
      -3,
      'Vysvětlivky, NE 1:1 (zmenšeno na A4) – neměř z nich. Řezárně posílej opasek-desticka.svg.',
      3,
      GREY,
    ),
    // Praktická past: tužka je kužel a do 2mm otvoru ve 3mm akrylu nedosáhne na kůži.
    note(
      0,
      H + 6,
      'Značí se kulatým rýsovacím šídlem, ne tužkou: ořezaná tužka má ve 3 mm nad hrotem 2,3–3,3 mm ' +
        'a do otvoru Ø 2 mm nedosáhne. U dírek krouži šídlem po stěně otvoru – střed prstence je střed dírky.',
      2.8,
      GREY,
    ),
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
      'dva gravírované křížky NAD a POD prostřední dírkou',
    ],
    [
      L.tipHoleXs[0],
      L.tipRowY,
      W + 4,
      L.tipRowY + 4,
      `5 dírek pro trn, rozteč ${cz(tip.holeSpacingMm)} mm`,
    ],
    [60, 9, W + 4, 10, 'PRAVÍTKO, nula = levá hrana; měří pásek na poutko'],
    [4, L.tipRowY, W + 4, 16, 'čísla 1 / 2 / 3 u levé hrany = číslo řady'],
    [
      L.roundedArcs[0].centreX,
      L.roundedRowY - L.roundedArcs[0].radiusMm,
      W + 4,
      L.roundedRowY - 10,
      '4 OBLOUKY: ber ten, který končí na tvé lince šířky',
    ],
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
      'dva otvory = LINIE OHYBU (čárkovaná linka), spoj pravítkem',
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
      `KAPSA POUTKA: ${cz(keeperGapMm(end))} mm, světlých ${cz(keeperPocketClearMm(end))} mm`,
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
    // Výstup je A4 na šířku, aby se vysvětlivky daly vytisknout na běžné tiskárně.
    // Není to 1:1 – je to popisný obrázek, měřítko si bere viewBox.
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
      `width="297mm" height="210mm" ` +
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
    // DXF: české zakázkové řezárny chtějí Corel/AutoCAD/Illustrator a automatické
    // kalkulačky přímo DXF. `-rez` je varianta bez gravírování pro kalkulačky,
    // které naceňují jen řezané kontury.
    // Varianta pro řezárny, které gravírují rastrem a chtějí uzavřené plochy.
    // Šířku lze přebít: --engrave-width 0.3
    const areaWidth = (() => {
      const i = process.argv.indexOf('--engrave-width');
      if (i < 0) return 0.25;
      const v = Number(process.argv[i + 1]);
      // Horní mez 0,4 mm není libovolná: nejbližší gravírovaná linka je 0,5 mm od
      // řezané geometrie, takže při šířce w zbývá rohu plochy 0,5 − w/2·√2.
      // Pro 0,25 mm je odstup 0,375 mm (změřeno), pro 0,4 mm 0,22 mm, nad 0,7 mm
      // by plochy začaly lézt do vyříznutých otvorů.
      if (!Number.isFinite(v) || v < 0.1 || v > 0.4) {
        throw new Error(
          '--engrave-width musí být v mm mezi 0,1 a 0,4; širší plochy by zasahovaly ' +
            'do řezané geometrie (nejbližší linka je 0,5 mm od ní).',
        );
      }
      return v;
    })();
    const areaSvg = resolve(outDir, 'opasek-desticka-plochy.svg');
    writeFileSync(areaSvg, buildBeltPlateAreaSvg(end, tip, DEFAULT_BELT_PLATE, areaWidth), 'utf8');
    const areaDxf = resolve(outDir, 'opasek-desticka-plochy.dxf');
    writeFileSync(areaDxf, buildBeltPlateAreaDxf(end, tip, DEFAULT_BELT_PLATE, areaWidth), 'utf8');
    console.log(`Zapsáno ${areaSvg} a ${areaDxf} (gravírování jako plochy ${areaWidth} mm)`);

    const dxfPath = resolve(outDir, 'opasek-desticka.dxf');
    writeFileSync(dxfPath, buildBeltPlateDxf(end, tip), 'utf8');
    console.log(`Zapsáno ${dxfPath} (2 vrstvy, mm, oblouky jako ARC)`);
    const dxfCutPath = resolve(outDir, 'opasek-desticka-rez.dxf');
    writeFileSync(dxfCutPath, buildBeltPlateDxf(end, tip, DEFAULT_BELT_PLATE, true), 'utf8');
    console.log(`Zapsáno ${dxfCutPath} (jen řez, pro automatické kalkulačky)`);

    // Náhledy hotového konce: odpověď na „jak to bude ve skutečnosti vypadat".
    // Geometrie z modelu, povrch ilustrativní. Nejsou to výrobní soubory.
    for (const [style, name] of [
      ['point', 'opasek-nahled-hrot.svg'],
      ['round', 'opasek-nahled-zaobleny.svg'],
    ] as const) {
      const previewPath = resolve(outDir, name);
      writeFileSync(previewPath, buildBeltTipPreviewSvg(tip, style), 'utf8');
      console.log(`Zapsáno ${previewPath} (náhled, ne výrobní soubor)`);
    }

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
    console.log(`Zapsáno ${platePdf} (kontrolní tisk na A4 na šířku, 100 %)`);

    // Záložní formát pro řezárnu: PDF v křivkách, 1:1, stránka přesně velká jako
    // list v SVG. Většina levných CO2 strojů (RDWorks/LaserWork) bere SVG špatně
    // nebo vůbec, jedna z oslovených provozoven chce Corel/AutoCAD/Illustrator.
    // Bez tohohle by slib „pošlu PDF v křivkách“ nebylo čím splnit.
    const cutPdf = resolve(outDir, 'opasek-desticka-1-1.pdf');
    const sheetW = L.plateWidthMm + 10;
    const sheetH = L.plateHeightMm + 10;
    const pg3 = await br.newPage();
    await pg3.setContent(
      `<style>@page{size:${sheetW}mm ${sheetH}mm;margin:0}html,body{margin:0;padding:0}</style>` +
        `<div style="width:${sheetW}mm;height:${sheetH}mm;overflow:hidden">${svg}</div>`,
      { waitUntil: 'load' },
    );
    await pg3.pdf({
      path: cutPdf,
      width: `${sheetW}mm`,
      height: `${sheetH}mm`,
      printBackground: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    await br.close();
    console.log(`Zapsáno ${cutPdf} (1:1 v křivkách, ${sheetW} × ${sheetH} mm – záložní formát)`);
    console.log(
      `Destička ${L.plateWidthMm} × ${L.plateHeightMm} mm pro pásky ${L.minBeltWidthMm}–${L.maxBeltWidthMm} mm, čirý akryl 3 mm.`,
    );
    console.log(
      'Řada 1: HROT + 5 dírek · Řada 2: ZAOBLENÝ konec + 5 dírek ' +
        '(obě se umisťují podle prostřední dírky) · Řada 3: konec u přezky ' +
        '(levá hrana destičky = konec pásu).',
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
