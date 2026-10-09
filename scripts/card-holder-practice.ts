/**
 * Vykreslí cvičnou šablonu k projektu 01 Pouzdro na karty (lekce 2 Rovný řez kůže) do SVG a PDF.
 *
 *   pnpm pattern:card-holder-practice
 *
 * List A4 na výšku, 1:1, vrstvy CUT (plná čára řezu) a GUIDE (okraj na vystřižení, čárky konců,
 * popisky, kontrolní úsečka 50 mm). Tři malé tvary na vyzkoušení hlavního způsobu přenosu šablony
 * z lekce 5 (vystřihnout nahrubo, přilepit páskou na rub, řezat skrz papír po čáře, nic
 * nepropichovat) na odřezku, ne na pouzdru:
 * 1. obdélník 60 × 40 mm – rovné řezy s pravítkem po vytištěné čáře,
 * 2. obdélník 60 × 40 mm s jedním rohem R10 – přechod z rovné do vypuklého oblouku bez pravítka,
 * 3. obdélník 60 × 40 mm s výřezem tvaru U na delší straně (20 × 12 mm, dno R10, vydutý oblouk)
 *    a dvěma krátkými čárkami nad hranou, kam až vede rovný řez (vpich na čáře by nechal zoubek).
 *
 * Výstup: docs/generated/pouzdro-karty-cvicna-sablona.svg + .pdf.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const PRACTICE_FILE_STEM = 'pouzdro-karty-cvicna-sablona';
export const PRACTICE_SHEET = { widthMm: 210, heightMm: 297, marginMm: 8 } as const;
export const CALIBRATION_MM = 50;
export const LAYERS = ['CUT', 'GUIDE'] as const;
type Layer = (typeof LAYERS)[number];
type Anchor = 'start' | 'middle' | 'end';

export const COLORS = { CUT: '#1f1f1f', GUIDE: '#6f6f6f' } as const;

/** Tvar cvičení: obdélník a jeho úpravy. */
export const PRACTICE_SHAPE = {
  widthMm: 60,
  heightMm: 40,
  /** Zaoblený roh tvaru 2. */
  cornerRadiusMm: 10,
  /** Výřez tvaru 3 uprostřed horní (delší) hrany. */
  notch: { widthMm: 20, depthMm: 12, bottomRadiusMm: 10 },
} as const;
/** Okraj papíru kolem obrysu, po kterém se tvar vystřihne nůžkami nahrubo. */
export const ROUGH_MARGIN_MM = 15;

/**
 * Rozložení na odřezku: tvary vedle sebe po delší straně, 5 mm od kraje a 10 mm od sebe. Dělají se
 * jeden po druhém, takže papírové okraje sousedů se nemusí vejít vedle sebe najednou.
 */
export const OFFCUT_LAYOUT = { edgeMm: 5, gapMm: 10 } as const;
export function offcutFootprint(): { widthMm: number; heightMm: number; paperHeightMm: number } {
  const n = 3;
  return {
    widthMm: n * PRACTICE_SHAPE.widthMm + (n - 1) * OFFCUT_LAYOUT.gapMm + 2 * OFFCUT_LAYOUT.edgeMm,
    heightMm: PRACTICE_SHAPE.heightMm,
    paperHeightMm: PRACTICE_SHAPE.heightMm + 2 * ROUGH_MARGIN_MM,
  };
}

const HEADER_MM = 14;
const STEPS_MM = 21;
const FOOTER_MM = 30;
const BLOCK_GAP_MM = 3;
/** Šířka bloku s okrajem na vystřižení. */
export const BLOCK_W = PRACTICE_SHAPE.widthMm + 2 * ROUGH_MARGIN_MM;
export const BLOCK_H = PRACTICE_SHAPE.heightMm + 2 * ROUGH_MARGIN_MM;
/** Levý horní roh okraje (čárkovaného obdélníku) bloku i = 0, 1, 2. */
export function blockOrigin(i: number): { x: number; y: number } {
  const m = PRACTICE_SHEET.marginMm;
  return { x: m, y: m + HEADER_MM + STEPS_MM + i * (BLOCK_H + BLOCK_GAP_MM) };
}
/** Horní hrana patičky (úsečka, legenda); bloky musí skončit nad ní. */
export const FOOTER_TOP = PRACTICE_SHEET.heightMm - PRACTICE_SHEET.marginMm - FOOTER_MM;
const TEXT_X = PRACTICE_SHEET.marginMm + BLOCK_W + 5;

class Sheet {
  private readonly layers: Record<Layer, string[]> = { CUT: [], GUIDE: [] };

  add(layer: Layer, s: string): void {
    this.layers[layer].push(s);
  }

  path(layer: Layer, d: string, width: number, dash?: string, cls?: string): void {
    this.add(
      layer,
      `<path${cls ? ` class="${cls}"` : ''} d="${d}" fill="none" stroke="${COLORS[layer]}" stroke-width="${f(width)}"` +
        (dash ? ` stroke-dasharray="${dash}"` : '') +
        '/>',
    );
  }

  line(layer: Layer, x0: number, y0: number, x1: number, y1: number, width = 0.2, dash?: string) {
    this.path(layer, `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}`, width, dash);
  }

  text(
    x: number,
    y: number,
    s: string,
    size = 2.3,
    anchor: Anchor = 'start',
    opts: { bold?: boolean; fill?: string } = {},
  ): void {
    this.add(
      'GUIDE',
      `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}"` +
        `${opts.bold ? ' font-weight="bold"' : ''} text-anchor="${anchor}" fill="${opts.fill ?? COLORS.CUT}">${esc(s)}</text>`,
    );
  }

  render(title: string): string {
    const { widthMm: W, heightMm: H } = PRACTICE_SHEET;
    const groups = LAYERS.map(
      (id) =>
        `<g id="${id}" inkscape:groupmode="layer" inkscape:label="${id}">${this.layers[id].join('')}</g>`,
    ).join('');
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
      `width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
      `<title>${esc(title)}</title>` +
      `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
      groups +
      '</svg>\n'
    );
  }
}

/** Obrys obdélníku; `cornerR` zaoblí pravý horní roh, `notch` vyřízne U uprostřed horní hrany. */
export function shapeOutline(
  x0: number,
  y0: number,
  opts: { cornerR?: number; notch?: boolean } = {},
): string {
  const { widthMm: w, heightMm: h } = PRACTICE_SHAPE;
  const x1 = x0 + w;
  const y1 = y0 + h;
  const r = opts.cornerR ?? 0;
  let top = `M${f(x0)} ${f(y0)} `;
  if (opts.notch) {
    const { widthMm: nw, depthMm: nd, bottomRadiusMm: nr } = PRACTICE_SHAPE.notch;
    const xc = x0 + w / 2;
    const xl = xc - nw / 2;
    const xr = xc + nw / 2;
    const ys = y0 + nd - nr;
    // Rovné boky výřezu do hloubky (nd − nr), pak půlkruh R dnem dolů (vydutý oblouk) a zpět nahoru.
    top +=
      `L${f(xl)} ${f(y0)} L${f(xl)} ${f(ys)} ` +
      `A${f(nr)} ${f(nr)} 0 0 0 ${f(xr)} ${f(ys)} L${f(xr)} ${f(y0)} `;
  }
  top +=
    r > 0
      ? `L${f(x1 - r)} ${f(y0)} A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y0 + r)} `
      : `L${f(x1)} ${f(y0)} `;
  return `${top}L${f(x1)} ${f(y1)} L${f(x0)} ${f(y1)} Z`;
}

/** Konce výřezu u tvaru 3 na horní hraně: sem dojde rovný řez, čárka vede nahoru do okraje. */
export function notchEndPoints(x0: number, y0: number): { x: number; y: number }[] {
  const xc = x0 + PRACTICE_SHAPE.widthMm / 2;
  const half = PRACTICE_SHAPE.notch.widthMm / 2;
  return [
    { x: xc - half, y: y0 },
    { x: xc + half, y: y0 },
  ];
}

function column(s: Sheet, x: number, y: number, lines: string[], size = 2.3, gap = 3.3): number {
  let yy = y;
  for (const ln of lines) {
    const bold = ln.startsWith('# ');
    s.text(x, yy, bold ? ln.slice(2) : ln, bold ? size + 0.3 : size, 'start', { bold });
    yy += bold ? gap + 0.6 : gap;
  }
  return yy;
}

interface Block {
  label: string;
  lines: string[];
  cornerR?: number;
  notch?: boolean;
}

const { widthMm: SW, heightMm: SH, cornerRadiusMm: CR, notch: N } = PRACTICE_SHAPE;

const BLOCKS: Block[] = [
  {
    label: `# 1 · Obdélník ${SW} × ${SH} mm – rovné řezy`,
    lines: [
      'Všechny čtyři strany řežte s ocelovým pravítkem',
      'položeným hranou přesně na plnou čáru.',
      'Pravítko leží na tvaru (na dílu, který zůstane),',
      'ne na odpadu – když nůž ujede, poškodí odpad.',
      'Nůž kolmo k podložce, 2–3 lehké tahy,',
      'řez veďte směrem od volné ruky.',
    ],
  },
  {
    label: `# 2 · Obdélník ${SW} × ${SH} mm, roh R${CR} – oblouk`,
    lines: [
      'Rovné strany s pravítkem po čáru oblouku',
      '(krátké čárky vně obrysu = začátek a konec oblouku).',
      'Oblouk řežte pomalu bez pravítka, krátkými tahy,',
      'volná ruka otáčí kůží, ne nožem.',
      'Přechod z rovné do oblouku má být plynulý,',
      'bez zubu; 2–3 lehké tahy jako u rovných stran.',
    ],
    cornerR: CR,
  },
  {
    label: `# 3 · Obdélník ${SW} × ${SH} mm s výřezem ${N.widthMm} × ${N.depthMm} mm`,
    lines: [
      `Výřez na delší straně, dno R${N.bottomRadiusMm} (vydutý oblouk).`,
      'Krátké čárky nad hranou = konce výřezu: rovný řez',
      'horní hrany veďte s pravítkem jen k nim.',
      'Nic nepropichujte: vpich na čáře nechá v hraně zoubek.',
      'Výřez až nakonec, nasekejte ho na',
      'krátké rovné řezy, každý od čáry k čáře (lekce 5).',
    ],
    notch: true,
  },
];

const STEPS = [
  '# Postup – stejně jako u šablony pouzdra v lekci 5',
  '1. Tiskněte na 100 % a změřte kontrolní úsečku dole: přesně 50 mm.  2. Každý tvar vystřihněte nůžkami',
  'nahrubo po čárkované čáře.  3. Položte ho na rub odřezku a přilepte maskovací páskou na okraji, mimo plnou čáru,',
  'z několika stran.  4. Řežte nožem skrz papír i kůži po plné čáře, 2–3 lehké tahy: rovné strany s pravítkem,',
  'roh bez pravítka, výřez nakonec krátkými rovnými řezy od čáry k čáře.  5. Pásku strhávejte pomalu. Nic nepropichujte.',
];

export function buildPracticeSheetSvg(): string {
  const s = new Sheet();
  const m = PRACTICE_SHEET.marginMm;

  s.text(m, m + 5, 'CVIČNÁ ŠABLONA – ŘEZ PODLE PŘILEPENÉ ŠABLONY', 4.6, 'start', { bold: true });
  s.text(
    m,
    m + 10,
    'Pouzdro na karty · lekce 2 Rovný řez kůže · tři tvary na odřezek, ne díly pouzdra',
    2.5,
  );
  column(s, m, m + HEADER_MM + 3, STEPS, 2.3, 3.6);

  BLOCKS.forEach((b, i) => {
    const o = blockOrigin(i);
    const x0 = o.x + ROUGH_MARGIN_MM;
    const y0 = o.y + ROUGH_MARGIN_MM;
    // Okraj na vystřižení nůžkami (GUIDE, čárkovaně) a jeho popisek v rohu okraje.
    s.path(
      'GUIDE',
      `M${f(o.x)} ${f(o.y)} H${f(o.x + BLOCK_W)} V${f(o.y + BLOCK_H)} H${f(o.x)} Z`,
      0.25,
      '3 2',
      'rough-margin',
    );
    s.text(o.x + 2, o.y + 4.5, 'okraj na vystřižení ~1,5 cm', 2, 'start', { fill: COLORS.GUIDE });
    s.path('CUT', shapeOutline(x0, y0, b), 0.3, undefined, 'outline');
    s.text(x0 + SW / 2, y0 + SH / 2 + 1, String(i + 1), 7, 'middle', {
      bold: true,
      fill: COLORS.GUIDE,
    });
    s.text(x0 + SW / 2, y0 + SH / 2 + 7, `${SW} × ${SH} mm`, 2.2, 'middle', {
      fill: COLORS.GUIDE,
    });
    if (b.cornerR) {
      // Krátké čárky vně obrysu na začátku a konci oblouku (tečné body).
      const x1 = x0 + SW;
      s.line('GUIDE', x1 - b.cornerR, y0 - 1, x1 - b.cornerR, y0 - 4, 0.25);
      s.line('GUIDE', x1 + 1, y0 + b.cornerR, x1 + 4, y0 + b.cornerR, 0.25);
    }
    if (b.notch) {
      // Krátké čárky vně obrysu nad konci výřezu, jako u oblouku tvaru 2: jen na papíře.
      for (const p of notchEndPoints(x0, y0)) {
        s.path(
          'GUIDE',
          `M${f(p.x)} ${f(p.y - 1)} L${f(p.x)} ${f(p.y - 4)}`,
          0.25,
          undefined,
          'notch-end',
        );
      }
      const [pl] = notchEndPoints(x0, y0);
      s.text(pl.x - 2, y0 - 2, 'konec rovného řezu', 2, 'end', { fill: COLORS.GUIDE });
    }
    column(s, TEXT_X, o.y + 8, [b.label, ...b.lines]);
  });

  // Patička: kontrolní úsečka 50 mm, tisk 1:1, rozložení na odřezku, legenda vrstev.
  const y = FOOTER_TOP + 8.5;
  s.line('GUIDE', m, y, m + CALIBRATION_MM, y, 0.4);
  s.line('GUIDE', m, y - 2.5, m, y + 2.5, 0.3);
  s.line('GUIDE', m + CALIBRATION_MM, y - 2.5, m + CALIBRATION_MM, y + 2.5, 0.3);
  s.add(
    'GUIDE',
    `<path class="calibration" d="M${f(m)} ${f(y)} L${f(m + CALIBRATION_MM)} ${f(y)}" stroke="${COLORS.GUIDE}" stroke-width="0.01"/>`,
  );
  s.text(m + CALIBRATION_MM / 2, y - 3.2, 'KONTROLNÍ ÚSEČKA 50 mm', 2.4, 'middle', { bold: true });
  s.text(m + CALIBRATION_MM + 6, y - 1.5, 'PRINT AT 100% / ACTUAL SIZE', 3.4, 'start', {
    bold: true,
  });
  s.text(
    m + CALIBRATION_MM + 6,
    y + 2.5,
    'Tisk na 100 % (skutečná velikost), vypnout „přizpůsobit stránce“ · měřítko 1:1',
    2.3,
  );
  const fp = offcutFootprint();
  s.text(
    m,
    y + 7.5,
    `Na zbytek juchtové A5 (asi 210 × 80 mm): tvary vedle sebe po delší straně, ${cz(OFFCUT_LAYOUT.edgeMm)} mm od kraje,`,
    2.3,
  );
  s.text(
    m,
    y + 11.5,
    `${cz(OFFCUT_LAYOUT.gapMm)} mm od sebe = ${cz(fp.widthMm)} × ${cz(fp.heightMm)} mm kůže (s papírovým okrajem ${cz(fp.paperHeightMm)} mm na výšku); jeden tvar po druhém.`,
    2.3,
  );
  const ly = y + 17;
  s.line('CUT', m, ly, m + 7, ly, 0.3);
  s.text(m + 8.5, ly + 0.8, 'CUT řez nožem', 2.2, 'start');
  s.line('GUIDE', m + 45, ly, m + 52, ly, 0.25, '3 2');
  s.text(m + 53.5, ly + 0.8, 'GUIDE okraj na vystřižení nůžkami', 2.2, 'start', {
    fill: COLORS.GUIDE,
  });
  s.line('GUIDE', m + 125, ly - 1.5, m + 125, ly + 1.5, 0.25);
  s.text(m + 127.5, ly + 0.8, 'krátká čárka = konec řezu, nepropichovat', 2.2, 'start', {
    fill: COLORS.GUIDE,
  });
  return s.render('Cvičná šablona – pouzdro na karty, lekce 2');
}

async function main(): Promise<void> {
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  const svg = buildPracticeSheetSvg();
  writeFileSync(resolve(outDir, `${PRACTICE_FILE_STEM}.svg`), svg, 'utf8');
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(
    '<style>@page{size:A4 portrait;margin:0}html,body{margin:0;padding:0}' +
      `.s{width:210mm;height:297mm;overflow:hidden}</style><div class="s">${svg}</div>`,
    { waitUntil: 'load' },
  );
  await page.pdf({
    path: resolve(outDir, `${PRACTICE_FILE_STEM}.pdf`),
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });
  await browser.close();
  const fp = offcutFootprint();
  console.log(
    `Zapsáno docs/generated/${PRACTICE_FILE_STEM}.svg + .pdf (A4 na výšku, 100 %). ` +
      `Na odřezku ${cz(fp.widthMm)} × ${cz(fp.heightMm)} mm (s okrajem papíru ${cz(fp.paperHeightMm)} mm na výšku).`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) {
  try {
    await main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}
