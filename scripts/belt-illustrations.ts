/**
 * Návodné ilustrace k projektu 04 (pásek, docs/zadani/opasek-postup.md, krok 1 „změř si obvod“).
 * Schematické nákresy, ne v měřítku: pásek je mezi ohybem a dírkami zkrácený (přerušení).
 * Co kreslí, stojí v zadání: obvod se měří od ohybu u přezky (ne od konce trnu) k dírce, kterou
 * používáte; bez pásku krejčovským metrem provlečeným poutky kalhot. Pět dírek po 25 mm a
 * používaná prostřední odpovídají výchozímu pásku (`totalStrapLengthMm` počítá od prostřední).
 *
 *   pnpm pattern:belt-illustrations
 *
 * Výstup: docs/generated/opasek-ilustrace-<name>.svg (bílé pozadí, čitelné i na mobilu 390 px).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();

/* Paleta aplikace (src/styles/globals.css) a přírodní kůže. */
const INK = '#2b211c';
const INK_2 = '#6b5f57';
const FOREST = '#33483b';
const COGNAC_DEEP = '#7e4423';
const LEATHER = '#d2a878';
const LEATHER_EDGE = '#7e4423';
const LEATHER_WORN = '#a9784c';
const METAL = '#8a8580';
const TAPE = '#f2d16b';
const TAPE_EDGE = '#b08a57';
const CLOTH = '#5d6b78';
const CLOTH_DARK = '#46525d';

const FONT = 'Helvetica, Arial, sans-serif';

type Anchor = 'start' | 'middle' | 'end';

const text = (
  x: number,
  y: number,
  s: string,
  size: number,
  anchor: Anchor = 'start',
  fill = INK,
  weight: 'normal' | 'bold' = 'normal',
): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${FONT}" font-size="${f(size)}" ` +
  `font-weight="${weight}" text-anchor="${anchor}" fill="${fill}">${s}</text>`;

const line = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stroke: string,
  width: number,
  dash?: string,
): string =>
  `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${stroke}" stroke-width="${f(width)}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

type Pt = [number, number];

const poly = (pts: Pt[], fill: string, stroke = 'none', width = 0.4): string =>
  `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ')} Z" fill="${fill}" stroke="${stroke}" stroke-width="${f(width)}" stroke-linejoin="round"/>`;

const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke = 'none',
  width = 0.4,
): string =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${stroke}" stroke-width="${f(width)}"/>`;

/** Šipka s hrotem v (x1, y1). */
function arrow(x0: number, y0: number, x1: number, y1: number, color: string, width = 0.5): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const l = 2.4;
  const s = 1.1;
  const bx = x1 - l * Math.cos(a);
  const by = y1 - l * Math.sin(a);
  const head: Pt[] = [
    [x1, y1],
    [bx + s * Math.sin(a), by - s * Math.cos(a)],
    [bx - s * Math.sin(a), by + s * Math.cos(a)],
  ];
  return line(x0, y0, bx, by, color, width) + poly(head, color);
}

/** Zubaté přerušení (pásek je delší, než je nakreslený). */
function zigzag(x: number, y0: number, y1: number, amp = 1.2, n = 4): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    pts.push([x + (i % 2 === 0 ? -amp / 2 : amp / 2), y0 + ((y1 - y0) * i) / n]);
  }
  return pts;
}

const svgWrap = (w: number, h: number, title: string, body: string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" role="img">`,
    `<title>${title}</title>`,
    `<rect width="${w}" height="${h}" fill="#ffffff"/>`,
    ...body,
    '</svg>',
  ].join('\n');

/** Svinovací metr: žlutý pruh s dílky a nulou na začátku, s přerušením na `breakX`. */
function tape(x0: number, x1: number, y: number, h: number, breakX: number): string[] {
  const out: string[] = [];
  const top = y;
  const bot = y + h;
  const left = zigzag(breakX - 1.5, top, bot, 1.2, 3);
  const right = zigzag(breakX + 1.5, top, bot, 1.2, 3);
  out.push(poly([[x0, top], ...left, [x0, bot]], TAPE, TAPE_EDGE));
  out.push(poly([...right, [x1, bot], [x1, top]], TAPE, TAPE_EDGE));
  for (let x = x0, i = 0; x <= x1 + 1e-6; x += 2, i++) {
    if (Math.abs(x - breakX) < 2.6) continue;
    const long = i % 5 === 0;
    out.push(line(x, top, x, top + (long ? h * 0.55 : h * 0.3), INK, 0.2));
  }
  out.push(text(x0 + 0.8, bot - 0.9, '0', 2.6, 'start', INK, 'bold'));
  return out;
}

/** Pět dírek po 10 jednotkách, používaná je prostřední (jako u výchozího pásku). */
const HOLE_XS = [64, 74, 84, 94, 104] as const;
const USED_HOLE = 2;

/**
 * Varianta 1: pásek, který vám sedí, položený rovně lícem nahoru. Metr od místa ohybu kolem
 * příčky přezky ke středu dírky, kterou používáte; ne od špičky trnu a ne k první dírce.
 * Nadpis a vysvětlení nese popisek obrázku (figcaption), v obrázku jsou jen štítky.
 */
export function buildObvodNaPaskuSvg(): string {
  const W = 120;
  const H = 82;
  const out: string[] = [];

  const beltTop = 32;
  const beltBot = 46;
  const beltMid = (beltTop + beltBot) / 2;
  const foldX = 22;
  const breakX = 46;
  const tipX = 118;
  const usedX = HOLE_XS[USED_HOLE];

  // Přezka: rám; jeho pravá strana je příčka, kolem které se kůže ohýbá.
  out.push(
    `<rect x="5" y="${f(beltTop - 5)}" width="${f(foldX - 5)}" height="${f(beltBot - beltTop + 10)}" rx="3" fill="none" stroke="${METAL}" stroke-width="1.6" stroke-linejoin="round"/>`,
  );

  // Pásek: kůže obepíná příčku, takže nejlevější hrana pásku je místo ohybu. Pak přerušení,
  // dírky a hrot.
  const lz = zigzag(breakX - 2, beltTop, beltBot, 1.6, 4);
  const rz = zigzag(breakX + 2, beltTop, beltBot, 1.6, 4);
  const r = 2;
  const x0 = foldX - 1;
  out.push(
    `<path d="M${f(x0 + r)} ${f(beltTop)} ${lz
      .map(([x, y]) => `L${f(x)} ${f(y)}`)
      .join(' ')} L${f(x0 + r)} ${f(beltBot)} Q ${f(x0)} ${f(beltBot)} ${f(x0)} ${f(
      beltBot - r,
    )} L${f(x0)} ${f(beltTop + r)} Q ${f(x0)} ${f(beltTop)} ${f(x0 + r)} ${f(beltTop)} Z" fill="${LEATHER}" stroke="${LEATHER_EDGE}" stroke-width="0.5"/>`,
  );
  out.push(
    poly(
      [...rz, [tipX - 7, beltBot], [tipX, beltMid], [tipX - 7, beltTop]],
      LEATHER,
      LEATHER_EDGE,
      0.5,
    ),
  );
  // Trn: od příčky (pod ohybem) dopředu na rám.
  out.push(line(x0, beltMid, 6.5, beltMid, METAL, 1.4));
  // Poutko kousek za přezkou.
  out.push(
    `<rect x="28" y="${f(beltTop - 1.4)}" width="5" height="${f(beltBot - beltTop + 2.8)}" rx="1" fill="${LEATHER_WORN}" stroke="${LEATHER_EDGE}" stroke-width="0.5"/>`,
  );

  // Dírky: nepoužívané světle, používaná vytahaná a s otlakem kolem.
  HOLE_XS.forEach((x, i) => {
    if (i === USED_HOLE) {
      out.push(ellipse(x + 0.5, beltMid, 3.2, 3.6, LEATHER_WORN));
      out.push(ellipse(x + 0.5, beltMid, 1.9, 1.3, INK, LEATHER_EDGE, 0.3));
    } else {
      out.push(ellipse(x, beltMid, 1.3, 1.3, '#efe0cc', '#b08a57', 0.3));
    }
  });

  // Metr nad páskem: nula v místě ohybu, konec až za používanou dírku.
  out.push(...tape(foldX, usedX + 5, 23.5, 6, breakX));

  // Svislé pomocné čáry: místo ohybu a střed používané dírky.
  out.push(line(foldX, 8, foldX, beltBot + 3, FOREST, 0.45, '1.6 1.2'));
  out.push(line(usedX, 8, usedX, beltBot + 3, FOREST, 0.45, '1.6 1.2'));

  // Kóta „obvod“ s popiskem uprostřed.
  const dimY = 13;
  out.push(arrow(breakX - 9, dimY, foldX + 0.3, dimY, FOREST, 0.6));
  out.push(arrow(breakX + 25, dimY, usedX - 0.3, dimY, FOREST, 0.6));
  out.push(text(breakX + 8, dimY + 2.1, 'obvod', 6.4, 'middle', FOREST, 'bold'));

  // Popisky pod páskem.
  out.push(text(foldX, beltBot + 12, 'místo ohybu', 5.4, 'middle', FOREST, 'bold'));
  out.push(text(foldX, beltBot + 18, '(kolem příčky)', 4.6, 'middle', INK_2));

  out.push(line(usedX, beltMid + 3.8, usedX + 3, beltBot + 5, INK, 0.35));
  out.push(text(usedX + 5, beltBot + 10, 'dírka, kterou', 5.4, 'middle', FOREST, 'bold'));
  out.push(text(usedX + 5, beltBot + 16, 'používáte', 5.4, 'middle', FOREST, 'bold'));
  out.push(text(usedX + 5, beltBot + 22, '(bývá vytahaná)', 4.6, 'middle', INK_2));

  // Na co neměřit.
  const first = HOLE_XS[0];
  out.push(line(first - 0.4, beltMid + 1.6, first - 2, beltBot + 27.5, COGNAC_DEEP, 0.35));
  out.push(text(first - 4, beltBot + 32.5, '✕ ne k první dírce', 5, 'middle', COGNAC_DEEP));
  out.push(line(6.6, beltMid + 0.8, 3.5, beltBot + 21, COGNAC_DEEP, 0.35));
  out.push(text(2, beltBot + 25.5, '✕ ne od špičky trnu', 5, 'start', COGNAC_DEEP));

  return svgWrap(
    W,
    H,
    'Obvod na pásku: od místa ohybu u přezky ke středu dírky, kterou používáte',
    out,
  );
}

/**
 * Varianta 2: bez pásku. Krejčovský metr provlečený poutky kalhot, ve kterých pásek nosíte,
 * utažený na pohodlí; odečte se tam, kde se metr potká s nulou. Pohled zepředu.
 */
export function buildObvodMetremSvg(): string {
  const W = 120;
  const H = 66;
  const out: string[] = [];

  const top = 16;
  const bot = 32;
  // Pas kalhot a kus předního dílu se zipem a knoflíkem.
  out.push(
    poly(
      [
        [4, top + 2],
        [116, top + 2],
        [116, bot],
        [4, bot],
      ],
      CLOTH,
      CLOTH_DARK,
      0.5,
    ),
  );
  out.push(
    poly(
      [
        [4, bot],
        [116, bot],
        [114, bot + 12],
        [6, bot + 12],
      ],
      '#7d8a96',
      CLOTH_DARK,
      0.5,
    ),
  );
  out.push(line(60, bot, 60, bot + 12, CLOTH_DARK, 0.5));
  out.push(ellipse(60, top + 9, 1.8, 1.8, METAL, INK_2, 0.3));

  // Metr vede kolem pasu; konec s nulou leží navrch přes pokračování metru.
  const ty = top + 6;
  const th = 6;
  out.push(
    poly(
      [
        [4, ty],
        [116, ty],
        [116, ty + th],
        [4, ty + th],
      ],
      TAPE,
      TAPE_EDGE,
    ),
  );
  for (let x = 6; x <= 114; x += 2) {
    out.push(line(x, ty, x, ty + ((x - 6) % 10 === 0 ? th * 0.55 : th * 0.3), INK, 0.2));
  }
  const zeroX = 50;
  out.push(
    poly(
      [
        [zeroX, ty - 1.2],
        [zeroX + 14, ty - 1.2],
        [zeroX + 14, ty + th + 1.2],
        [zeroX, ty + th + 1.2],
      ],
      TAPE,
      INK,
      0.5,
    ),
  );
  out.push(text(zeroX + 1, ty + th - 0.6, '0', 3.4, 'start', INK, 'bold'));

  // Poutka přes metr.
  for (const x of [14, 34, 86, 106]) {
    out.push(
      `<rect x="${f(x - 2.5)}" y="${f(top - 1)}" width="5" height="${f(bot - top + 3)}" rx="1" fill="${CLOTH_DARK}" stroke="${INK}" stroke-width="0.3"/>`,
    );
  }

  out.push(arrow(zeroX - 6, 8, zeroX - 0.3, ty - 0.6, FOREST, 0.6));
  out.push(text(zeroX - 7, 8.5, 'odečtěte u nuly', 5.4, 'end', FOREST, 'bold'));
  out.push(arrow(22, bot + 17, 15, bot + 1, INK_2, 0.45));
  out.push(text(24, bot + 20, 'metr vede všemi poutky', 5, 'start', INK_2));
  out.push(text(24, bot + 27, 'utáhněte na pohodlí', 5, 'start', INK_2));

  return svgWrap(
    W,
    H,
    'Obvod bez pásku: krejčovský metr provlečený poutky kalhot, míra se odečte u nuly',
    out,
  );
}

const illustrations: [string, () => string][] = [
  ['obvod-na-pasku', buildObvodNaPaskuSvg],
  ['obvod-metrem', buildObvodMetremSvg],
];

function main(): void {
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  for (const [name, build] of illustrations) {
    const path = resolve(outDir, `opasek-ilustrace-${name}.svg`);
    writeFileSync(path, build(), 'utf8');
    console.log(`Zapsáno ${path}`);
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) main();
