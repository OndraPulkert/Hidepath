/**
 * Vykreslí cvičný list k projektu 02 Pouzdro s vsazenou mincí (lekce 4 Skládání a šev tří vrstev
 * na odřezku) do SVG, pro kůži těla 1,2 mm (výchozí sestava) i 1,5 mm (se ztenčením ohybu B).
 *
 *   pnpm pattern:coin-holder-practice
 *
 * List A4 na výšku, 1:1: obrys cvičného proužku (tři panely po 30 mm, ohyby A a B z modelu pásu
 * pro danou tloušťku), čáry ohybů, u 1,5 mm šrafa ztenčení ohybu B, čára švu dna 3,5 mm od hrany,
 * zrcadlené tečky otvorů (6 na panel), kroužky k propíchnutí šídlem za čarou řezu v odpadu
 * (na prodloužení čar ohybů, u 1,5 mm i okrajů šrafy), kontrolní úsečka 50 mm.
 * Přenos stejně jako list PÁS v lekci 5: vystřihnout nahrubo, přilepit páskou na líc, propíchnout,
 * na rubu spojit kroužky, pak řezat skrz papír po čáře; vpichy odejdou s odpadem. Kus kůže je proto
 * o 5 mm nahoře i dole vyšší než proužek. Geometrie je v src/lib/geometry/coin-card-holder-practice.ts.
 *
 * Výstup: docs/generated/pouzdro-mince-cvicny-prouzek.svg (kůže 1,5 mm, stejně jako bez přípony
 * u listů pásu) a pouzdro-mince-cvicny-prouzek-kuze-1-2mm.svg.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  PRACTICE_STRIP,
  PRACTICE_THICKNESSES,
  practiceStripLayout,
  type PracticeStripLayout,
} from '../src/lib/geometry/coin-card-holder-practice.ts';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');
/** Na jedno desetinné místo, jak čísla uvádí text lekce 4 („asi 15,7 mm“). */
const cz1 = (n: number): string => (Math.round(n * 10) / 10).toString().replace('.', ',');
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const PRACTICE_SHEET = { widthMm: 210, heightMm: 297, marginMm: 10 } as const;
export const CALIBRATION_MM = 50;
/**
 * Papír na vystřižení = kus kůže z lekce 4 (`PRACTICE_STRIP.pieceLengthMm × pieceHeightMm`), proužek
 * v něm vystředěný. Papír větší než kůže by páska ke kůži nepřidržela: list se položí na líc
 * hranami na hrany a páska se na koncích přehne přes hranu na rub.
 */
export const PIECE_MM = {
  w: PRACTICE_STRIP.pieceLengthMm,
  h: PRACTICE_STRIP.pieceHeightMm,
} as const;
/**
 * Kroužky k propíchnutí: kolik mm za čarou řezu (v odpadu) leží na prodloužení čar ohybů a okrajů
 * šrafy. Stejně na listu PÁS (lekce 5) i tady: vpichy odejdou s odpadem, na líci dílu nezůstanou.
 */
export const PRICK_OUTSIDE_MM = 2;
/** Poloměr tečky otvoru stehu (jako list PÁS) a kroužku k propíchnutí. */
export const DOT_R = 0.45;
export const PRICK_R = 0.8;

const INK = '#2b2b2b';
const GUIDE = '#7a7a7a';
const SKIVE = '#b9c3bc';

type Anchor = 'start' | 'middle' | 'end';

/** Levý horní roh čárkovaného obdélníku (= kus kůže) na vystřižení. */
export const BLOCK_ORIGIN = { x: (PRACTICE_SHEET.widthMm - PIECE_MM.w) / 2, y: 70 } as const;

/** Levý horní roh obrysu proužku: vystředěný v kusu kůže. */
export function stripOrigin(P: PracticeStripLayout): { x: number; y: number } {
  return {
    x: BLOCK_ORIGIN.x + (PIECE_MM.w - P.stripLengthMm) / 2,
    y: BLOCK_ORIGIN.y + (PIECE_MM.h - P.heightMm) / 2,
  };
}
/** y kontrolní úsečky (patička). */
export const CALIBRATION_Y = PRACTICE_SHEET.heightMm - PRACTICE_SHEET.marginMm - 22;

export function practiceFileStem(bodyThicknessMm: number): string {
  return bodyThicknessMm === 1.5
    ? 'pouzdro-mince-cvicny-prouzek'
    : `pouzdro-mince-cvicny-prouzek-kuze-${f(bodyThicknessMm).replace('.', '-')}mm`;
}

function text(
  x: number,
  y: number,
  s: string,
  size = 2.3,
  anchor: Anchor = 'start',
  opts: { bold?: boolean; fill?: string } = {},
): string {
  return (
    `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}"` +
    `${opts.bold ? ' font-weight="bold"' : ''} text-anchor="${anchor}" fill="${opts.fill ?? INK}">${esc(s)}</text>`
  );
}

function column(
  out: string[],
  x: number,
  y: number,
  lines: string[],
  size = 2.3,
  gap = 3.4,
): number {
  let yy = y;
  for (const ln of lines) {
    const bold = ln.startsWith('# ');
    out.push(
      text(x, yy, bold ? ln.slice(2) : ln, bold ? size + 0.3 : size, 'start', {
        bold,
        fill: bold ? INK : GUIDE,
      }),
    );
    yy += bold ? gap + 0.6 : gap;
  }
  return yy;
}

/** Nad a pod proužkem v odpadu na prodloužení svislice x. */
const outsideEnds = (x: number, H: number): { x: number; y: number }[] => [
  { x, y: -PRICK_OUTSIDE_MM },
  { x, y: H + PRICK_OUTSIDE_MM },
];

/** Kroužky k propíchnutí v soustavě proužku: prodloužení čar obou ohybů za čarou řezu. */
export function prickPoints(P: PracticeStripLayout): { x: number; y: number }[] {
  return [P.backX1Mm, P.frontX0Mm, P.frontX1Mm, P.innerX0Mm].flatMap((x) =>
    outsideEnds(x, P.heightMm),
  );
}

/**
 * Kroužky na prodloužení okrajů pásma ztenčení (jen kůže 1,5 mm), stejně jako u čar ohybů:
 * na rubu se jen spojí, 3 mm se neodměřují.
 */
export function skivePrickPoints(P: PracticeStripLayout): { x: number; y: number }[] {
  const zone = practiceSkiveZone(P);
  if (!zone) return [];
  return [zone.x0, zone.x1].flatMap((x) => outsideEnds(x, P.heightMm));
}

/** Pásmo ztenčení ohybu B (pásmo ± okraj) v soustavě proužku, nebo null. */
export function practiceSkiveZone(
  P: PracticeStripLayout,
): { x0: number; x1: number; y0: number; y1: number } | null {
  if (P.foldSkiveThicknessMm === null) return null;
  return {
    x0: P.frontX1Mm - P.foldSkiveMarginMm,
    x1: P.innerX0Mm + P.foldSkiveMarginMm,
    y0: 0,
    y1: P.heightMm,
  };
}

export function buildCoinHolderPracticeSvg(bodyThicknessMm = 1.2): string {
  const P = practiceStripLayout(bodyThicknessMm);
  const { widthMm: W, heightMm: H, marginMm: m } = PRACTICE_SHEET;
  const { x: ox, y: oy } = stripOrigin(P);
  const X = (x: number): number => ox + x;
  const Y = (y: number): number => oy + y;
  const SL = P.stripLengthMm;
  const SH = P.heightMm;
  const skived = P.foldSkiveThicknessMm !== null;
  const out: string[] = [];

  /* --- hlavička a postup --- */
  out.push(
    text(m, m + 5, 'CVIČNÝ PROUŽEK PRO LEKCI 4 – SKLÁDÁNÍ A ŠEV TŘÍ VRSTEV', 4.4, 'start', {
      bold: true,
    }),
  );
  out.push(
    text(
      m,
      m + 10.5,
      `Pouzdro s vsazenou mincí · KŮŽE TĚLA ${cz(P.bodyThicknessMm)} mm${skived ? ` · ohyb B se ztenčuje na ${cz(P.foldSkiveThicknessMm ?? 0)} mm` : ' · ohyby se neztenčují'} · cvičný odřezek, ne díl pouzdra`,
      2.6,
    ),
  );
  column(out, m, m + 17, [
    '# Postup (lekce 4) – stejně jako u pásu v lekci 5',
    '1. Tiskněte na 100 % a změřte kontrolní úsečku dole: přesně 50 mm. Tloušťka kůže v nadpisu musí sedět na vaši kůži.',
    `2. List vystřihněte nůžkami po čárkované čáře – je velký jako kus kůže (${cz(PIECE_MM.w)} × ${cz(PIECE_MM.h)} mm).`,
    '3. Položte ho na LÍC kůže hranami na hrany (u většího kusu obrys vystřeďte – kroužky musí ležet na kůži).',
    '4. Na obou koncích přelepte maskovací páskou hranu papíru i kůže a pásku přehněte na rub – mimo plnou čáru a kroužky.',
    `5. Šídlem propíchněte skrz papír i kůži všechny kroužky (za čarou řezu, v odpadu) a všechny tečky dna – musí být vidět i na rubu.`,
    `6. Kůži i s listem otočte. Na RUBU spojte kroužky tužkou podle pravítka: čáry ohybů${skived ? ' a okraje šrafy (pásmo ztenčení)' : ''} vedou přes celý proužek.`,
    '7. Otočte zpět a řežte nožem skrz papír i kůži po plné čáře, s ocelovým pravítkem. Vpichy odejdou s odpadem.',
    '8. Pásku strhávejte pomalu.',
  ]);

  /* --- okraj na vystřižení --- */
  const bw = PIECE_MM.w;
  const bh = PIECE_MM.h;
  out.push(
    `<path class="rough-margin" d="M${f(BLOCK_ORIGIN.x)} ${f(BLOCK_ORIGIN.y)} H${f(BLOCK_ORIGIN.x + bw)} V${f(BLOCK_ORIGIN.y + bh)} H${f(BLOCK_ORIGIN.x)} Z" fill="none" stroke="${GUIDE}" stroke-width="0.25" stroke-dasharray="3 2"/>`,
  );
  out.push(
    text(
      BLOCK_ORIGIN.x,
      BLOCK_ORIGIN.y - 1.5,
      `vystřihnout po čárkované čáře = kus kůže ${cz(PIECE_MM.w)} × ${cz(PIECE_MM.h)} mm · LÍC`,
      2,
      'start',
      { fill: GUIDE },
    ),
  );

  /* --- šrafa ztenčení ohybu B (jen 1,5 mm) --- */
  const zone = practiceSkiveZone(P);
  if (zone) {
    const x0 = X(zone.x0);
    const y0 = Y(zone.y0);
    const w = zone.x1 - zone.x0;
    const h = zone.y1 - zone.y0;
    const segs: string[] = [];
    for (let c = x0 - (y0 + h); c <= x0 + w - y0; c += 2) {
      const ya = Math.max(y0, x0 - c);
      const yb = Math.min(y0 + h, x0 + w - c);
      if (yb - ya > 0.05) segs.push(`M${f(ya + c)} ${f(ya)} L${f(yb + c)} ${f(yb)}`);
    }
    out.push(`<path d="${segs.join(' ')}" stroke="${SKIVE}" stroke-width="0.3" fill="none"/>`);
    out.push(
      `<rect class="skive-zone" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="${SKIVE}" stroke-width="0.2"/>`,
    );
  }

  /* --- obrys proužku (řez) --- */
  out.push(
    `<path class="outline" d="M${f(X(0))} ${f(Y(0))} H${f(X(SL))} V${f(Y(SH))} H${f(X(0))} Z" fill="none" stroke="${INK}" stroke-width="0.3"/>`,
  );

  /* --- ohyby --- */
  for (const x of [P.backX1Mm, P.frontX0Mm, P.frontX1Mm, P.innerX0Mm]) {
    out.push(
      `<path class="fold" d="M${f(X(x))} ${f(Y(0))} L${f(X(x))} ${f(Y(SH))}" fill="none" stroke="${GUIDE}" stroke-width="0.2" stroke-dasharray="3 2"/>`,
    );
  }
  out.push(
    text(X((P.backX1Mm + P.frontX0Mm) / 2), Y(-9), `OHYB A ${cz(P.foldAMm)}`, 2.2, 'middle', {
      fill: GUIDE,
    }),
  );
  out.push(
    text(X((P.frontX1Mm + P.innerX0Mm) / 2), Y(-9), `OHYB B ${cz(P.foldBMm)}`, 2.2, 'middle', {
      fill: GUIDE,
    }),
  );

  /* --- šev dna a otvory --- */
  out.push(
    `<path class="seam" d="M${f(X(0))} ${f(Y(P.seamYMm))} L${f(X(SL))} ${f(Y(P.seamYMm))}" fill="none" stroke="${GUIDE}" stroke-width="0.2" stroke-dasharray="0.8 1.2"/>`,
  );
  for (const row of P.holeXsMm) {
    for (const x of row) {
      out.push(
        `<circle class="hole" cx="${f(X(x))}" cy="${f(Y(P.seamYMm))}" r="${DOT_R}" fill="${INK}"/>`,
      );
    }
  }
  for (const p of [...prickPoints(P), ...skivePrickPoints(P)]) {
    out.push(
      `<circle class="prick" cx="${f(X(p.x))}" cy="${f(Y(p.y))}" r="${PRICK_R}" fill="none" stroke="${INK}" stroke-width="0.25"/>`,
    );
  }

  /* --- panely: popisky --- */
  const panels: [number, string, string][] = [
    [0, 'ZADNÍ', 'otvory z RUBU'],
    [P.frontX0Mm, 'PŘEDNÍ', 'otvory z LÍCE'],
    [P.innerX0Mm, 'VNITŘNÍ', 'otvory z RUBU'],
  ];
  for (const [x0, name, side] of panels) {
    const cx = X(x0 + P.panelWidthMm / 2);
    out.push(text(cx, Y(13), name, 2.8, 'middle', { bold: true }));
    out.push(text(cx, Y(17.5), `${cz(P.panelWidthMm)} mm`, 2.2, 'middle', { fill: GUIDE }));
    out.push(text(cx, Y(22), side, 2.2, 'middle', { fill: GUIDE }));
  }
  out.push(
    text(
      X(SL / 2),
      Y(SH + 9),
      `PROUŽEK ${cz(SL)} × ${cz(SH)} mm · šev ${cz(P.stitchOffsetMm)} mm od dolní hrany · ${P.holesPerPanel} otvorů na panel`,
      2.2,
      'middle',
      { fill: GUIDE },
    ),
  );
  out.push(
    text(
      X(SL / 2),
      Y(SH + 12.5),
      `rozteč ${cz(P.stitchPitchMm)} mm, krajní otvor ${cz(P.endHoleOffsetMm)} mm od čáry ohybu i od konce`,
      2.2,
      'middle',
      { fill: GUIDE },
    ),
  );

  /* --- vysvětlení pod proužkem --- */
  const holesCalc = (P.panelWidthMm - 2 * P.stitchOffsetMm) / P.stitchPitchMm;
  const lines = [
    `# Čísla z modelu pásu pro kůži ${cz(P.bodyThicknessMm)} mm`,
    `Tři panely po ${cz(P.panelWidthMm)} mm, ohyb A ${cz(P.foldAMm)} mm (mezi zadním a předním), ohyb B ${cz(P.foldBMm)} mm (mezi předním a vnitřním).`,
    `Ohyby jsou stejně široké jako na listu PÁS pro kůži ${cz(P.bodyThicknessMm)} mm – závisí na tloušťce kůže a obsahu, ne na délce panelu.`,
    `Dohromady ${cz(SL)} mm (lekce 4: asi ${Math.round(SL)} mm = ${cz(3 * P.panelWidthMm)} + ${cz1(P.foldAMm)} + ${cz1(P.foldBMm)}).`,
    `Otvory: (${cz(P.panelWidthMm)} − 2 × ${cz(P.stitchOffsetMm)}) / ${cz(P.stitchPitchMm)} = ${cz(Math.round(holesCalc * 100) / 100)} → ${P.holesPerPanel - 1} celých mezer, ${P.holesPerPanel} otvorů; řada vystředěná na panelu, krajní ${cz(P.endHoleOffsetMm)} mm od čáry ohybu i od konce.`,
    'Tečky na sousedních panelech jsou zrcadlené přes střed ohybu, takže po složení lícují.',
    'Prosekat naplocho: PŘEDNÍ panel z LÍCE, ZADNÍ a VNITŘNÍ z RUBU (ohyb panel převrátí).',
    skived
      ? `Šrafa = ohyb B ${cz(P.foldBMm)} mm a ${cz(P.foldSkiveMarginMm)} mm na obě strany (asi ${Math.round(P.foldBMm + 2 * P.foldSkiveMarginMm)} mm): ztenčit z rubu na ${cz(P.foldSkiveThicknessMm ?? 0)} mm jako v lekci 3.`
      : 'Kůže 1,2 mm: ohyby se neztenčují, kroky ztenčení v lekci 4 přeskočte.',
    `Kus kůže asi ${cz(PRACTICE_STRIP.pieceLengthMm)} × ${cz(PRACTICE_STRIP.pieceHeightMm)} mm (lekce 4) = čárkovaný obdélník: nahoře i dole zbude ${cz1(P.pieceReserveTopBottomMm)} mm na kroužky, na každém konci asi`,
    `${cz1(P.pieceReserveEachEndMm)} mm na pásku přehnutou na rub; odřezky z konců se hodí na zkoušku barvy na hrany (lekce 4).`,
  ];
  column(out, m, BLOCK_ORIGIN.y + bh + 14, lines, 2.3, 3.5);

  /* --- patička: kontrolní úsečka, legenda --- */
  const y = CALIBRATION_Y;
  out.push(
    `<path d="M${f(m)} ${f(y - 2.5)} V${f(y + 2.5)} M${f(m + CALIBRATION_MM)} ${f(y - 2.5)} V${f(y + 2.5)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(
    `<path class="calibration" d="M${f(m)} ${f(y)} L${f(m + CALIBRATION_MM)} ${f(y)}" stroke="${INK}" stroke-width="0.4" fill="none"/>`,
  );
  out.push(
    text(m + CALIBRATION_MM / 2, y - 3.2, 'KONTROLNÍ ÚSEČKA 50 mm', 2.4, 'middle', { bold: true }),
  );
  out.push(
    text(
      m + CALIBRATION_MM + 6,
      y + 1,
      'KONTROLA MĚŘÍTKA: tato úsečka musí měřit přesně 50 mm',
      2.4,
    ),
  );
  out.push(
    text(
      m,
      y + 8,
      'Tisk na A4 na výšku na 100 % (skutečná velikost), vypnout „přizpůsobit stránce“ · měřítko 1:1',
      2.3,
    ),
  );
  const ly = y + 14;
  out.push(
    `<path d="M${f(m)} ${f(ly)} L${f(m + 7)} ${f(ly)}" stroke="${INK}" stroke-width="0.3" fill="none"/>`,
  );
  out.push(text(m + 8.5, ly + 0.8, 'řez', 2.2));
  out.push(
    `<path d="M${f(m + 18)} ${f(ly)} L${f(m + 25)} ${f(ly)}" stroke="${GUIDE}" stroke-width="0.2" stroke-dasharray="3 2" fill="none"/>`,
  );
  out.push(text(m + 26.5, ly + 0.8, 'ohyb / okraj papíru', 2.2, 'start', { fill: GUIDE }));
  out.push(`<circle cx="${f(m + 60)}" cy="${f(ly)}" r="${DOT_R}" fill="${INK}"/>`);
  out.push(text(m + 61.5, ly + 0.8, 'otvor dna', 2.2, 'start', { fill: GUIDE }));
  out.push(
    `<circle cx="${f(m + 82)}" cy="${f(ly)}" r="${PRICK_R}" fill="none" stroke="${INK}" stroke-width="0.25"/>`,
  );
  out.push(
    text(
      m + 84,
      ly + 0.8,
      'kroužky za čarou řezu = propíchnout do odpadu, na rubu spojit před řezem',
      2.2,
      'start',
      { fill: GUIDE },
    ),
  );
  if (skived) {
    const sy = ly + 5;
    out.push(
      `<rect x="${f(m)}" y="${f(sy - 1.5)}" width="6" height="3" fill="none" stroke="${SKIVE}" stroke-width="0.6"/>`,
    );
    out.push(text(m + 7.5, sy + 0.8, 'ztenčit z rubu', 2.2, 'start', { fill: GUIDE }));
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
    `<title>${esc(`Cvičný proužek pro lekci 4 – pouzdro s vsazenou mincí, kůže ${cz(P.bodyThicknessMm)} mm`)}</title>` +
    `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
    out.join('') +
    '</svg>\n'
  );
}

function main(): void {
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  for (const t of PRACTICE_THICKNESSES) {
    const stem = practiceFileStem(t);
    writeFileSync(resolve(outDir, `${stem}.svg`), buildCoinHolderPracticeSvg(t), 'utf8');
    const P = practiceStripLayout(t);
    console.log(
      `Zapsáno docs/generated/${stem}.svg (A4 na výšku, 100 %): proužek ${cz(P.stripLengthMm)} × ${cz(P.heightMm)} mm, ` +
        `ohyb A ${cz(P.foldAMm)}, ohyb B ${cz(P.foldBMm)}, ${P.holesPerPanel} otvorů na panel.`,
    );
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) {
  try {
    main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}
