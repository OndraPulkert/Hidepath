/**
 * Vygeneruje 1:1 šablonu konce opasku u přezky se čtyřmi otvory pro nýty
 * (dva páry symetrické k ohybu), takže mezi nýty vznikne kapsa pro poutko.
 *
 * Výstup: docs/generated/opasek-konec-u-prezky.svg + .pdf (A4, tisk na 100 %).
 * Spuštění: pnpm pattern:belt-end
 *
 * Zdroje rozměrů (viz docs/content/sablony-zdroje.md):
 *  - šířka pásu, drážka 40 × 8 mm půlená ohybem, otvor pro nýt Ø 6 mm
 *    = odměřeno z PDF generátoru CraftPoint 2026-09-10,
 *  - polohy nýtů ±25,5 a ±73,2 mm a délka přehnutého konce 90 mm
 *    = odměřeno ze šablony Black Flag Leather Goods 2026-09-10,
 *  - zaoblení konce a rozměry poutka = volba této šablony, viz DEFAULTS.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface BeltEndSpec {
  /** Šířka pásu v mm. */
  beltWidthMm: number;
  /** Tloušťka pásu v mm – jen pro výpočet délky poutka. */
  beltThicknessMm: number;
  /** Délka drážky pro trn (ohyb ji půlí). */
  slotLengthMm: number;
  /** Šířka drážky pro trn = průměr průbojníku na její konce. */
  slotWidthMm: number;
  /** Průměr otvoru pro šroubovací nýt. */
  rivetHoleMm: number;
  /** Vzdálenosti obou nýtů od ohybu. */
  rivetOffsetsMm: [number, number];
  /** Délka přehnutého konce od ohybu. */
  tailLengthMm: number;
  /** Kolik hlavního pásu nad ohybem šablona zobrazuje. */
  bodyShownMm: number;
  /** Šířka pásku poutka. */
  keeperWidthMm: number;
  /** Přídavek na přeplátování poutka. */
  keeperOverlapMm: number;
}

export const DEFAULTS: BeltEndSpec = {
  beltWidthMm: 40,
  beltThicknessMm: 4,
  slotLengthMm: 40,
  slotWidthMm: 8,
  rivetHoleMm: 6,
  rivetOffsetsMm: [25.5, 73.2],
  tailLengthMm: 90,
  bodyShownMm: 90,
  keeperWidthMm: 12,
  keeperOverlapMm: 15,
};

/** Světlá mezera mezi nýty – tam se zachytí poutko. */
export function keeperGapMm(spec: BeltEndSpec): number {
  const [near, far] = spec.rivetOffsetsMm;
  return Math.abs(far - near);
}

/**
 * Délka pásku na poutko: obvod zdvojené části plus přeplátování.
 * Zdvojená část má tloušťku 2× tloušťka pásu.
 */
export function keeperStripLengthMm(spec: BeltEndSpec): number {
  const perimeter = 2 * (spec.beltWidthMm + 2 * spec.beltThicknessMm);
  return Math.round(perimeter + spec.keeperOverlapMm);
}

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();

/** Číslo do popisky s českou desetinnou čárkou. */
const cz = (n: number): string => f(n).replace('.', ',');

interface Layout {
  strapX: number;
  foldY: number;
}

function piece(spec: BeltEndSpec, { strapX, foldY }: Layout): string[] {
  const w = spec.beltWidthMm;
  const r = w / 2;
  const cx = strapX + r;
  const topY = foldY - spec.bodyShownMm;
  const endY = foldY + spec.tailLengthMm;
  const out: string[] = [];

  // Obrys: nahoře otevřený (pás pokračuje), dole půlkruhové zakončení.
  out.push(
    `<path d="M${f(strapX)} ${f(topY)} L${f(strapX)} ${f(endY - r)} ` +
      `A${f(r)} ${f(r)} 0 0 0 ${f(strapX + w)} ${f(endY - r)} ` +
      `L${f(strapX + w)} ${f(topY)}" fill="none" stroke="#2b2b2b" stroke-width="0.3"/>`,
  );
  // Střednice pro kontrolu souososti.
  out.push(
    `<line x1="${f(cx)}" y1="${f(topY)}" x2="${f(cx)}" y2="${f(endY)}" ` +
      `stroke="#b0b0b0" stroke-width="0.15" stroke-dasharray="3 3"/>`,
  );
  // Linie ohybu.
  out.push(
    `<line x1="${f(strapX - 6)}" y1="${f(foldY)}" x2="${f(strapX + w + 6)}" y2="${f(foldY)}" ` +
      `stroke="#c0392b" stroke-width="0.4" stroke-dasharray="4 2.5"/>`,
  );

  // Drážka pro trn: stadion půlený ohybem.
  const half = spec.slotLengthMm / 2;
  const sr = spec.slotWidthMm / 2;
  out.push(
    `<path d="M${f(cx - sr)} ${f(foldY - half + sr)} ` +
      `A${f(sr)} ${f(sr)} 0 0 1 ${f(cx + sr)} ${f(foldY - half + sr)} ` +
      `L${f(cx + sr)} ${f(foldY + half - sr)} ` +
      `A${f(sr)} ${f(sr)} 0 0 1 ${f(cx - sr)} ${f(foldY + half - sr)} Z" ` +
      `fill="none" stroke="#2b2b2b" stroke-width="0.3"/>`,
  );
  for (const sign of [-1, 1]) {
    const y = foldY + sign * (half - sr);
    out.push(cross(cx, y, sr, '#2b2b2b', 0.2));
  }

  // Čtyři otvory pro nýty: dva páry symetrické k ohybu.
  const hr = spec.rivetHoleMm / 2;
  for (const off of spec.rivetOffsetsMm) {
    for (const sign of [-1, 1]) {
      const y = foldY + sign * off;
      out.push(
        `<circle cx="${f(cx)}" cy="${f(y)}" r="${f(hr)}" fill="none" stroke="#2b2b2b" stroke-width="0.3"/>`,
      );
      out.push(cross(cx, y, hr, '#2b2b2b', 0.2));
    }
  }

  // Kóta kapsy pro poutko (na přehnutém konci).
  const [near, far] = spec.rivetOffsetsMm;
  const gy1 = foldY + near;
  const gy2 = foldY + far;
  const gx = strapX + w + 4;
  out.push(
    `<line x1="${f(gx)}" y1="${f(gy1)}" x2="${f(gx)}" y2="${f(gy2)}" stroke="#1f6f43" stroke-width="0.3"/>`,
  );
  for (const y of [gy1, gy2]) {
    out.push(
      `<line x1="${f(gx - 2)}" y1="${f(y)}" x2="${f(gx + 2)}" y2="${f(y)}" stroke="#1f6f43" stroke-width="0.3"/>`,
    );
  }
  return out;
}

function cross(cx: number, cy: number, r: number, color: string, sw: number): string {
  return (
    `<path d="M${f(cx - r * 1.3)} ${f(cy)} H${f(cx + r * 1.3)} M${f(cx)} ${f(cy - r * 1.3)} ` +
    `V${f(cy + r * 1.3)}" stroke="${color}" stroke-width="${f(sw)}" fill="none"/>`
  );
}

function keeperStrip(spec: BeltEndSpec, x: number, y: number): string[] {
  const len = keeperStripLengthMm(spec);
  const h = spec.keeperWidthMm;
  const out: string[] = [
    `<rect x="${f(x)}" y="${f(y)}" width="${f(len)}" height="${f(h)}" fill="none" stroke="#2b2b2b" stroke-width="0.3"/>`,
  ];
  for (let mm = 0; mm <= len; mm += 10) {
    out.push(
      `<line x1="${f(x + mm)}" y1="${f(y + h)}" x2="${f(x + mm)}" y2="${f(y + h + 2)}" stroke="#7a7a7a" stroke-width="0.2"/>`,
    );
    out.push(
      `<text x="${f(x + mm)}" y="${f(y + h + 5.2)}" font-family="Helvetica, Arial, sans-serif" font-size="2.6" fill="#7a7a7a" text-anchor="middle">${mm}</text>`,
    );
  }
  return out;
}

function label(x: number, y: number, text: string, size = 3.2, color = '#2b2b2b'): string {
  return `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}" fill="${color}">${text}</text>`;
}

export function buildSvg(spec: BeltEndSpec): string {
  const strapX = 22;
  const foldY = 132;
  const [near, far] = spec.rivetOffsetsMm;
  const gap = keeperGapMm(spec);
  /** Sloupec popisek vpravo od dílu. */
  const textX = strapX + spec.beltWidthMm + 14;
  /** Kalibrační čtverec až za sloupcem popisek, aby se text nekřížil s rámem. */
  const calX = 150;
  const calY = 30;
  const parts: string[] = [];

  parts.push(
    label(strapX, 16, 'Konec opasku u přezky — 4 otvory pro nýty (kapsa pro poutko)', 4.6),
  );
  parts.push(
    label(
      strapX,
      22,
      `Šířka pásu ${spec.beltWidthMm} mm · měřítko 1:1 · tisk na A4 na 100 %, bez „přizpůsobit stránce“`,
      3,
      '#6a6a6a',
    ),
  );

  parts.push(label(calX, calY - 6, 'KALIBRAČNÍ ČTVEREC', 3, '#c0392b'));
  parts.push(label(calX, calY - 2, 'po vytištění přeměř 50 × 50 mm', 3, '#c0392b'));
  parts.push(
    `<rect x="${f(calX)}" y="${f(calY)}" width="50" height="50" fill="none" stroke="#c0392b" stroke-width="0.4"/>`,
  );

  parts.push(...piece(spec, { strapX, foldY }));

  // Popisky. Díl je k ohybu symetrický, proto se každý pár značí jednou s ±.
  const callouts: [number, string, string?][] = [
    [foldY - far, `nýt ± ${cz(far)} mm od ohybu`],
    [foldY - near, `nýt ± ${cz(near)} mm od ohybu`],
    [foldY - near + 9.5, `drážka ${spec.slotLengthMm} × ${spec.slotWidthMm} mm, ohyb ji půlí`],
    [foldY, 'OHYB (příčka přezky)', '#c0392b'],
    [foldY + (near + far) / 2, `kapsa pro poutko ${cz(gap)} mm`, '#1f6f43'],
    [foldY + spec.tailLengthMm, `konec pásu ${spec.tailLengthMm} mm od ohybu`],
  ];
  for (const [y, text, color] of callouts) {
    parts.push(label(textX, y + 1, text, 3.2, color ?? '#2b2b2b'));
  }
  parts.push(
    label(
      strapX,
      foldY - spec.bodyShownMm - 3,
      'sem pokračuje hlavní pás (nahoře neřezat)',
      3,
      '#6a6a6a',
    ),
  );

  // Poutko.
  const keeperY = 232;
  parts.push(
    label(
      strapX,
      keeperY - 4,
      `Poutko — pásek ${keeperStripLengthMm(spec)} × ${spec.keeperWidthMm} mm (obvod zdvojené části ${2 * (spec.beltWidthMm + 2 * spec.beltThicknessMm)} mm + ${spec.keeperOverlapMm} mm přeplátování)`,
      3,
    ),
  );
  parts.push(...keeperStrip(spec, strapX, keeperY));
  parts.push(
    label(
      strapX,
      keeperY + spec.keeperWidthMm + 11,
      'Délku odměř na SLOŽENÉM pásku, stupnice je na zkrácení. Kůže na poutko tenčí než pás (1,2–2 mm).',
      2.9,
      '#6a6a6a',
    ),
  );

  const notes = [
    '1. Přenes značky na rub pásu: ohyb, drážku i všechny čtyři otvory.',
    `2. Vysekni ${spec.rivetHoleMm}mm otvory pro nýty, konce drážky ${spec.slotWidthMm}mm průbojníkem a drážku mezi nimi vyřízni nožem.`,
    '3. Navlékni poutko na přehnutý konec. Teprve pak ohni konec kolem přezky.',
    '4. Sešroubuj oba nýty. Poutko zůstane uvězněné v kapse mezi nimi.',
    `Nýty: 2 kusy, každý prochází oběma vrstvami — proto jsou otvory čtyři.`,
    'Rozměry: drážka a Ø otvorů podle generátoru CraftPoint, polohy nýtů a délka konce podle šablony BFLG.',
    'Zaoblení konce a rozměry poutka jsou volba této šablony — před řezáním ověř na odřezku.',
  ];
  notes.forEach((n, i) => parts.push(label(strapX, 262 + i * 4.4, n, 3)));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">',
    '<rect width="210" height="297" fill="#ffffff"/>',
    ...parts,
    '</svg>',
  ].join('\n');
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const svgPath = resolve(outDir, 'opasek-konec-u-prezky.svg');
  const pdfPath = resolve(outDir, 'opasek-konec-u-prezky.pdf');
  const svg = buildSvg(DEFAULTS);
  writeFileSync(svgPath, svg, 'utf8');

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(
    `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}</style>${svg}`,
    { waitUntil: 'load' },
  );
  await page.pdf({
    path: pdfPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  await browser.close();

  console.log(`Zapsáno ${svgPath}`);
  console.log(`Zapsáno ${pdfPath}`);
  console.log(
    `Kapsa pro poutko ${keeperGapMm(DEFAULTS)} mm, pásek na poutko ${keeperStripLengthMm(DEFAULTS)} mm.`,
  );
}

await main();
