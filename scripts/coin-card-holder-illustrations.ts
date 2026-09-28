/**
 * Pět instruktážních ilustrací pro lekce projektu 02 (pouzdro na karty s vsazenou mincí).
 * Nejsou to střihy 1:1 jako `coin-card-holder.ts` – jde o schematické nákresy, které ale
 * poměry (rozměry panelů, poloha kapsy, druku a průchodky) berou z modelu
 * `coinCardHolderLayout(DEFAULT_COIN_CARD_HOLDER)` v `src/lib/geometry/coin-card-holder.ts`.
 *
 *   pnpm pattern:coin-holder-illustrations
 *
 * Výstup: docs/generated/pouzdro-mince-ilustrace-<name>.svg (160 × 100 mm, čitelné i na mobilu).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  DEFAULT_COIN_CARD_HOLDER,
  type CoinCardHolderSpec,
  assertCoinCardHolder,
  coinCardHolderLayout,
} from '../src/lib/geometry/coin-card-holder.ts';

/* --- drobné pomocníky (zkopírované z coin-card-holder.ts, tam nejsou exportované) --- */
const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = (n: number): string => f(n).replace('.', ',');

const INK = '#2b2b2b';
const GUIDE = '#7a7a7a';
const ACCENT = '#a2471f';
const LEATHER = '#3f6b4f';
const LEATHER_DARK = '#2f5240';
const FLESH = '#8fae97';
const METAL = '#9a9a9a';

type Anchor = 'start' | 'middle' | 'end';

const text = (
  x: number,
  y: number,
  s: string,
  size = 3.2,
  anchor: Anchor = 'start',
  fill = INK,
): string =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" ` +
  `text-anchor="${anchor}" fill="${fill}">${s}</text>`;

const cross = (cx: number, cy: number, s = 1.8): string =>
  `<path d="M${f(cx - s)} ${f(cy)} L${f(cx + s)} ${f(cy)} M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy + s)}" stroke="${ACCENT}" stroke-width="0.4"/>`;

/** Šikmý zářez sekáčkem: délka `len`, sklon `dir` (1 = „/“, -1 = „\“). */
const slit = (
  cx: number,
  cy: number,
  len: number,
  dir: 1 | -1,
  colour = INK,
  width = 0.6,
): string =>
  `<path d="M${f(cx - (dir * len) / 2)} ${f(cy + len / 2)} L${f(cx + (dir * len) / 2)} ${f(cy - len / 2)}" stroke="${colour}" stroke-width="${width}" stroke-linecap="round"/>`;

/** Řada šikmých zářezů podél vodorovné čáry švu (silné, barevně odlišené podle strany). */
function slitRow(
  x0: number,
  x1: number,
  y: number,
  pitch: number,
  dir: 1 | -1,
  colour: string,
): string {
  const n = Math.max(1, Math.round((x1 - x0) / pitch));
  const out: string[] = [];
  for (let i = 0; i <= n; i++) out.push(slit(x0 + ((x1 - x0) * i) / n, y, 5, dir, colour, 1.1));
  return out.join('');
}

/** Šipka s popiskem u konce úsečky (odkaz na detail). */
const leader = (x0: number, y0: number, x1: number, y1: number): string =>
  `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${GUIDE}" stroke-width="0.3" fill="none"/>`;

const svgWrap = (body: string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="160mm" height="100mm" viewBox="0 0 160 100">',
    '<rect width="160" height="100" fill="#ffffff"/>',
    ...body,
    '</svg>',
  ].join('\n');

/**
 * 1/5 – Ze které strany prosekat otvory dna. Nahoře rozložený pás (tři panely, šikmé zářezy),
 * dole dvě vsuvky ukazující tři vrstvy po složení (správně vs. špatně).
 */
export function buildProsekavaniDnaSvg(
  spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER,
): string {
  assertCoinCardHolder(spec);
  const out: string[] = [];
  out.push(text(80, 6, 'Ze které strany prosekat otvory dna', 4, 'middle'));

  const panelY = 16;
  const panelH = 26;
  const panelW = 34;
  const gap = 9;
  const xs = [8, 8 + panelW + gap, 8 + 2 * (panelW + gap)];
  const names = ['ZADNÍ', 'PŘEDNÍ', 'VNITŘNÍ'] as const;
  // Pás je nakreslený tak, jak se obkresluje – pohled na líc. Přední se prosekává přímo z líce
  // („/“, vidět tak, jak je), zadní a vnitřní z rubu – z líce je pak jejich zářez zrcadlený („\“).
  const dirs: (1 | -1)[] = [-1, 1, -1];
  const sides = ['z rubu', 'z líce', 'z rubu'];
  // Barva zářezu podle strany, ať je rozdíl na první pohled zřejmý (ne jen sklon čar).
  const slitColours = [INK, ACCENT, INK];

  xs.forEach((x, i) => {
    out.push(
      `<rect x="${f(x)}" y="${f(panelY)}" width="${f(panelW)}" height="${f(panelH)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
    );
    out.push(text(x + panelW / 2, panelY - 3, names[i], 3.6, 'middle', INK));
    out.push(
      text(x + panelW / 2, panelY + panelH + 5, sides[i], 3.4, 'middle', i === 1 ? ACCENT : GUIDE),
    );
    out.push(slitRow(x + 4, x + panelW - 4, panelY + panelH - 4, 5, dirs[i], slitColours[i]));
  });
  // Ohyby mezi panely (svislý popisek uprostřed úzké mezery).
  const ohybLabel = (x: number, s: string): string =>
    `<text x="${f(x)}" y="${f(panelY + panelH / 2)}" font-family="Helvetica, Arial, sans-serif" font-size="3" text-anchor="middle" fill="${GUIDE}" transform="rotate(-90 ${f(x)} ${f(panelY + panelH / 2)})">${s}</text>`;
  out.push(
    ohybLabel(xs[0] + panelW + gap / 2, 'ohyb A'),
    ohybLabel(xs[1] + panelW + gap / 2, 'ohyb B'),
  );
  out.push(
    text(
      80,
      panelY + panelH + 12,
      'oranžový zářez „/“ = z líce, tmavý „\\“ = z rubu (ohyb panel zrcadlově otočí)',
      3,
      'middle',
      GUIDE,
    ),
  );

  /* --- dvě vsuvky: pohled na tři vrstvy po složení --- */
  const insetY = 58;
  const insetH = 32;
  const insetW = 62;
  const insetX = [8, 90];
  const titles = ['správně – otvory lícují', 'špatně – vše z líce, otvory se zkříží'];
  insetX.forEach((ix, k) => {
    out.push(
      `<rect x="${f(ix)}" y="${f(insetY)}" width="${f(insetW)}" height="${f(insetH)}" rx="2" fill="#fbfaf7" stroke="#ddd" stroke-width="0.3"/>`,
    );
    out.push(
      text(ix + insetW / 2, insetY + 5, titles[k], 3.2, 'middle', k === 0 ? LEATHER_DARK : ACCENT),
    );
    const cx = ix + 20;
    const cy = insetY + 20;
    const labels = ['P', 'V', 'Z'];
    const colours = [INK, LEATHER_DARK, INK];
    if (k === 0) {
      // Správně: tři rovnoběžné zářezy vedle sebe – po přeložení lícují.
      [0, 1, 2].forEach((r) => {
        const x = cx - 6 + r * 6;
        out.push(slit(x, cy, 8, 1, colours[r]));
        out.push(text(x, cy + 8, labels[r], 3, 'middle', GUIDE));
      });
    } else {
      // Špatně: všechny prosekané z líce → zadní a vnitřní vyjdou po přeložení zrcadlené a kříží
      // se s předním ve stejném místě.
      out.push(slit(cx, cy, 9, 1, colours[0]));
      out.push(slit(cx, cy, 9, -1, colours[1]));
      out.push(slit(cx + 1.2, cy - 1.2, 9, -1, colours[2]));
      out.push(
        `<circle cx="${f(cx)}" cy="${f(cy)}" r="6" fill="none" stroke="${ACCENT}" stroke-width="0.3" stroke-dasharray="0.8 0.8"/>`,
      );
      // Legenda P/V/Z s barevnými značkami místo popisků na zářezech (ty by se překrývaly).
      const legend = ix + 44;
      labels.forEach((lab, r) => {
        out.push(
          `<rect x="${f(legend)}" y="${f(insetY + 12 + r * 6 - 2.4)}" width="3" height="3" fill="${colours[r]}"/>`,
        );
        out.push(text(legend + 5, insetY + 12 + r * 6, lab, 3, 'start', GUIDE));
      });
    }
  });
  out.push(
    text(
      80,
      96,
      'P = přední, V = vnitřní, Z = zadní panel (pohled zepředu po přeložení)',
      3,
      'middle',
      GUIDE,
    ),
  );

  return svgWrap(out);
}

/**
 * 2/5 – Pořadí ohybů při skládání, pohled shora v řezu (jako u postupu skládání): ① ohyb B
 * (vnitřní za přední), ② ohyb A (zadní přes všechno).
 */
export function buildPoradiOhybuSvg(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string {
  assertCoinCardHolder(spec);
  const out: string[] = [];
  out.push(text(80, 6, 'Pořadí ohybů (pohled shora, v řezu)', 4, 'middle'));

  // Na pásu jsou ohyby na OPAČNÝCH stranách předního panelu: zadní–ohyb A–PŘEDNÍ–ohyb B–vnitřní.
  // Ohyb B (vpravo) spojuje přední a vnitřní, ohyb A (vlevo) spojuje přední a zadní a obepíná
  // přitom i vnitřní panel s bankovkami.
  const boxY0 = 14;
  const boxH = 56;
  const boxW = 74;
  const boxXs = [4, 4 + boxW + 4];
  const leftPad = 13;
  const rightPad = 9;
  const w = boxW - leftPad - rightPad;
  const gapY = 8;
  const oy = 32;
  const lay = (n: number): number => oy + n * gapY;

  const stepBox = (bx: number, title: string, withBack: boolean): void => {
    const ox = bx + leftPad;
    out.push(
      `<rect x="${f(bx)}" y="${f(boxY0)}" width="${f(boxW)}" height="${f(boxH)}" rx="2" fill="#fbfaf7" stroke="#ddd" stroke-width="0.3"/>`,
    );
    out.push(text(bx + boxW / 2, boxY0 + 6, title, 3.4, 'middle', ACCENT));
    const layer = (n: number, colour: string, x0 = ox): string =>
      `<path d="M${f(x0)} ${f(lay(n))} L${f(ox + w)} ${f(lay(n))}" stroke="${colour}" stroke-width="2.4" stroke-linecap="round"/>`;

    const rA = gapY; // (lay(2)-lay(0))/2
    if (withBack) {
      // Zadní panel navrch (motiv ven): ohyb A vlevo spojuje zadní přímo s předním (dole) –
      // obě čáry jsou proto stejně tmavé, jedna souvislá ohnutá páska. Vnitřní panel do ohybu A
      // nepatří, proto jeho čára zůstává kratší a nedotýká se smyčky (viz níž).
      out.push(layer(0, LEATHER_DARK));
      out.push(
        `<path d="M${f(ox)} ${f(lay(0))} A${f(rA)} ${f(rA)} 0 0 0 ${f(ox)} ${f(lay(2))}" fill="none" stroke="${LEATHER_DARK}" stroke-width="2.4"/>`,
      );
      out.push(text(ox + w / 2, lay(0) - 3, 'zadní (motiv ven)', 3, 'middle', GUIDE));
      out.push(text(ox + w * 0.25, (lay(0) + lay(1)) / 2 + 1, 'bankovky', 3, 'middle', '#8a7a55'));
    } else {
      // Zadní zatím leží rovně, v prodloužení předku vlevo (ohyb A ještě nevznikl).
      const ext = 9;
      out.push(
        `<path d="M${f(ox)} ${f(lay(2))} L${f(ox - ext)} ${f(lay(2))}" stroke="${LEATHER_DARK}" stroke-width="2.4" stroke-linecap="round"/>`,
      );
      out.push(
        `<path d="M${f(ox - ext / 2)} ${f(lay(2) - 2)} L${f(ox - ext / 2)} ${f(lay(0) + 3)}" stroke="${GUIDE}" stroke-width="0.3" stroke-dasharray="1 1"/>`,
      );
      out.push(text(ox + w / 2, lay(0), 'zadní (zatím rovně)', 3, 'middle', GUIDE));
    }
    // V kroku ② zkrátit vnitřní čáru zleva, ať zůstane jasně uvnitř smyčky ohybu A a nedotýká se
    // jí (jinak to vypadá, že smyčka vede k vnitřnímu, ne k přednímu).
    out.push(layer(1, FLESH, withBack ? ox + rA + 3 : ox));
    // Přední v kroku ② stejně tmavá jako zadní a smyčka – je to jedna souvislá ohnutá páska.
    out.push(layer(2, withBack ? LEATHER_DARK : LEATHER));
    // Ohyb B vpravo spojuje přední a vnitřní panel.
    const rB = gapY / 2;
    out.push(
      `<path d="M${f(ox + w)} ${f(lay(1))} A${f(rB)} ${f(rB)} 0 0 1 ${f(ox + w)} ${f(lay(2))}" fill="none" stroke="${LEATHER_DARK}" stroke-width="2.4"/>`,
    );
    out.push(text(ox + w - 1, lay(1) - 2, 'vnitřní (průchodka)', 3, 'end', GUIDE));
    out.push(text(ox + w * 0.25, (lay(1) + lay(2)) / 2 + 1, 'karty', 3, 'middle', '#8a7a55'));
    out.push(text(ox + w / 2, lay(2) + 4.5, 'přední (líc ven)', 3, 'middle', GUIDE));
    out.push(
      `<path d="M${f(ox + w / 2)} ${f(lay(2) + 6)} L${f(ox + w / 2)} ${f(lay(2) + 10)} M${f(ox + w / 2 - 1.5)} ${f(lay(2) + 8.5)} L${f(ox + w / 2)} ${f(lay(2) + 10)} L${f(ox + w / 2 + 1.5)} ${f(lay(2) + 8.5)}" stroke="${ACCENT}" stroke-width="0.5" fill="none"/>`,
    );
    out.push(text(ox + w / 2, lay(2) + 14, 'pohled zepředu ↓', 3, 'middle', ACCENT));
  };

  stepBox(boxXs[0], '① OHYB B: vnitřní za přední', false);
  stepBox(boxXs[1], '② OHYB A: zadní přes vše', true);
  out.push(
    text(
      80,
      92,
      'Ohyb B (vpravo) spojuje přední s vnitřním, ohyb A (vlevo) přední se zadním.',
      3,
      'middle',
      GUIDE,
    ),
  );
  out.push(
    text(
      80,
      97,
      'Nejdřív vnitřní za přední (ohyb B), pak zadní přes všechno (ohyb A).',
      3,
      'middle',
      GUIDE,
    ),
  );

  return svgWrap(out);
}

/**
 * 3/5 – Druk je čtyřdílný: klobouček + zdířka na jazyku, patice (dřík) + hlavička na předním
 * panelu. Rozstřelený boční pohled, každá polovina svírá jednu vrstvu kůže.
 */
export function buildDrukSvg(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string {
  assertCoinCardHolder(spec);
  const out: string[] = [];
  out.push(text(80, 6, 'Druk je čtyřdílný (rozstřelený boční pohled)', 4, 'middle'));

  const cx = 80;
  const stripW = 70;
  const stripH = 6;
  const tabY = 26;
  const panelY = 66;

  // JAZYK (nahoře): klobouček na líci (nad páskem), zdířka na rubu (pod páskem).
  out.push(
    `<rect x="${f(cx - stripW / 2)}" y="${f(tabY)}" width="${f(stripW)}" height="${f(stripH)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
  );
  out.push(text(cx - stripW / 2 - 2, tabY + stripH / 2 + 1, 'JAZYK', 3.4, 'end', INK));
  out.push(
    `<circle cx="${f(cx)}" cy="${f(tabY - 3.5)}" r="4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
  );
  out.push(
    `<circle cx="${f(cx)}" cy="${f(tabY + stripH + 3.5)}" r="2.4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
  );

  // PŘEDNÍ PANEL (dole): hlavička na líci (nad páskem, směrem k zdířce), patice/dřík na rubu.
  out.push(
    `<rect x="${f(cx - stripW / 2)}" y="${f(panelY)}" width="${f(stripW)}" height="${f(stripH)}" fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
  );
  out.push(text(cx - stripW / 2 - 2, panelY + stripH / 2 + 1, 'PŘEDNÍ PANEL', 3.4, 'end', INK));
  out.push(
    `<circle cx="${f(cx)}" cy="${f(panelY - 3.5)}" r="2.4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
  );
  out.push(
    `<circle cx="${f(cx)}" cy="${f(panelY + stripH + 3.5)}" r="3.4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
  );
  out.push(
    `<rect x="${f(cx - 1.4)}" y="${f(panelY + stripH + 3.5)}" width="2.8" height="4" fill="${METAL}" stroke="#666" stroke-width="0.3"/>`,
  );

  // Šipka „cvakne“ mezi zdířkou a hlavičkou.
  out.push(
    `<path d="M${f(cx)} ${f(tabY + stripH + 6)} L${f(cx)} ${f(panelY - 6)}" stroke="${ACCENT}" stroke-width="0.5" stroke-dasharray="1.4 1.2" marker-end="url(#arrowD)"/>`,
  );
  out.push(
    `<defs><marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${ACCENT}"/></marker></defs>`,
  );
  out.push(text(cx + 3, (tabY + stripH + 6 + panelY - 6) / 2 + 1, 'cvakne', 3.2, 'start', ACCENT));

  // Popisky čtyř dílů.
  const labelR = (x: number, y: number, s: string): string[] => [
    leader(x, y, x + 18, y),
    text(x + 19, y + 1, s, 3.2, 'start', INK),
  ];
  out.push(...labelR(cx + 4, tabY - 3.5, 'klobouček – na líci jazyku'));
  out.push(...labelR(cx + 2.4, tabY + stripH + 3.5, 'zdířka – na rubu jazyku'));
  out.push(...labelR(cx + 2.4, panelY - 3.5, 'hlavička – na líci předku'));
  out.push(...labelR(cx + 3.4, panelY + stripH + 3.5, 'patice (dřík) – na rubu předku'));

  // Vyznačit, že každá polovina svírá jednu vrstvu 1,5 mm.
  out.push(
    text(cx - stripW / 2 - 2, tabY - stripH, `${cz(spec.bodyThicknessMm)} mm`, 3, 'end', GUIDE),
  );
  out.push(
    text(cx - stripW / 2 - 2, panelY - stripH, `${cz(spec.bodyThicknessMm)} mm`, 3, 'end', GUIDE),
  );
  out.push(
    text(
      80,
      panelY + stripH + 14,
      'každá polovina svírá jen jednu vrstvu kůže (ne dvě)',
      3,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(80, 94, 'osazovat na kovadlince ze sady', 3.2, 'middle', ACCENT));

  return svgWrap(out);
}

/**
 * 4/5 – Lepení dna po jednom spoji. Zaschlý ohyb se rozevře jen asi do pravého úhlu (ne naplocho),
 * lepidlo jde na pruh 0–3,5 mm od hrany, tečky švu jsou v 3,5 mm.
 */
export function buildLepeniDnaSvg(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string {
  assertCoinCardHolder(spec);
  const so = spec.stitchOffsetMm;
  const out: string[] = [];
  out.push(text(80, 6, 'Lepení dna – po jednom spoji, ohyb jen do pravého úhlu', 3.8, 'middle'));

  const ang = 45; // od svislice na obě strany = pravý úhel mezi chlopněmi
  const rad = (Math.PI / 180) * ang;

  /** Šrafovaný pruh lepidla 0–3,5 mm od hrany + tečka švu, kolmo na směr chlopně (dirX, dirY). */
  const hatchAndDot = (
    tipX: number,
    tipY: number,
    dirX: number,
    dirY: number,
    normX: number,
    normY: number,
    glueLen: number,
    thickness: number,
  ): { svg: string; edge: [number, number] } => {
    const edge: [number, number] = [tipX + dirX * glueLen, tipY + dirY * glueLen];
    const segs: string[] = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = tipX + (edge[0] - tipX) * t;
      const py = tipY + (edge[1] - tipY) * t;
      segs.push(
        `M${f(px)} ${f(py)} L${f(px + normX * thickness * 0.8)} ${f(py + normY * thickness * 0.8)}`,
      );
    }
    const dot = `<circle cx="${f(edge[0])}" cy="${f(edge[1])}" r="0.7" fill="${INK}"/>`;
    return {
      svg: `<path d="${segs.join(' ')}" stroke="${ACCENT}" stroke-width="0.5"/>${dot}`,
      edge,
    };
  };

  /** Rozevřený ohyb do ~90°: dvě chlopně visící šikmo dolů z oblého ohybu nahoře. */
  const foldJoint = (
    cx: number,
    hingeY: number,
    flapLen: number,
    thickness: number,
    labelLeft: string,
    labelRight: string,
    scale: number,
  ): string[] => {
    const b: string[] = [];
    const dx = Math.sin(rad) * flapLen;
    const dy = Math.cos(rad) * flapLen;
    const nx = Math.cos(rad) * thickness;
    const ny = -Math.sin(rad) * thickness;
    // Levá chlopeň (jde šikmo dolů doleva) a pravá (šikmo dolů doprava), spojené obloukem ohybu.
    const leftOuter: [number, number] = [cx - dx, hingeY + dy];
    const rightOuter: [number, number] = [cx + dx, hingeY + dy];
    b.push(
      `<path d="M${f(leftOuter[0])} ${f(leftOuter[1])} L${f(cx - thickness * 0.3)} ${f(hingeY - thickness)} ` +
        `A${f(thickness * 1.3)} ${f(thickness * 1.3)} 0 0 1 ${f(cx + thickness * 0.3)} ${f(hingeY - thickness)} ` +
        `L${f(rightOuter[0])} ${f(rightOuter[1])} L${f(rightOuter[0] - nx)} ${f(rightOuter[1] - ny)} ` +
        `L${f(cx + thickness * 0.3)} ${f(hingeY - thickness + thickness * 0.7)} ` +
        `L${f(cx - thickness * 0.3)} ${f(hingeY - thickness + thickness * 0.7)} ` +
        `L${f(leftOuter[0] + nx)} ${f(leftOuter[1] - ny)} Z" ` +
        `fill="${LEATHER}" stroke="${LEATHER_DARK}" stroke-width="0.4"/>`,
    );
    // Šrafovaný pruh lepidla 0–3,5 mm od hrany na vnitřní (líc k líci) straně obou chlopní.
    const glueLen = so * scale;
    const left = hatchAndDot(
      leftOuter[0],
      leftOuter[1],
      dx / flapLen,
      -dy / flapLen,
      nx / thickness,
      -ny / thickness,
      glueLen,
      thickness,
    );
    const right = hatchAndDot(
      rightOuter[0],
      rightOuter[1],
      -dx / flapLen,
      -dy / flapLen,
      -nx / thickness,
      -ny / thickness,
      glueLen,
      thickness,
    );
    b.push(left.svg, right.svg);
    // Jehla přes otvory (zarovnání) – tečkovaná spojnice mezi tečkami.
    b.push(
      `<path d="M${f(left.edge[0])} ${f(left.edge[1])} L${f(right.edge[0])} ${f(right.edge[1])}" stroke="${GUIDE}" stroke-width="0.3" stroke-dasharray="0.8 0.8"/>`,
    );
    b.push(text(leftOuter[0] - 2, leftOuter[1] + 3, labelLeft, 3, 'end', GUIDE));
    b.push(text(rightOuter[0] + 2, rightOuter[1] + 3, labelRight, 3, 'start', GUIDE));
    return b;
  };

  out.push(...foldJoint(45, 24, 30, 4.5, 'přední', 'vnitřní', 1.6));
  out.push(text(45, 54, 'SPOJ 1: přední ↔ vnitřní', 3.6, 'middle', ACCENT));
  out.push(text(45, 59, '(ohyb B)', 3, 'middle', GUIDE));

  /*
   * SPOJ 2 – po slepení spoje 1 tvoří přední a vnitřní jeden slepený pár (dvě tenké rovnoběžné
   * čáry). Ohyb A je připojený jen k vnějšímu líci páru (přední) a vede k zadnímu; lepidlo jde
   * mezi druhou stranou páru (rub vnitřního) a zadním, ne mezi vnitřním a zadním ohybem.
   */
  {
    const cx = 118;
    const hingeY = 26;
    const flapLen = 20;
    const scale = 1.6;
    const dx = Math.sin(rad) * flapLen;
    const dy = Math.cos(rad) * flapLen;
    const pairGap = 2.4;
    const perpX = Math.cos(rad);
    const perpY = Math.sin(rad);
    const pairTop: [number, number] = [cx, hingeY];
    const pairOuterTip: [number, number] = [cx - dx, hingeY + dy];
    const innerStartT = 0.22;
    const pairInnerTop: [number, number] = [
      cx - dx * innerStartT + perpX * pairGap,
      hingeY + dy * innerStartT + perpY * pairGap,
    ];
    const pairInnerTip: [number, number] = [
      pairOuterTip[0] + perpX * pairGap,
      pairOuterTip[1] + perpY * pairGap,
    ];
    const zadTip: [number, number] = [cx + dx, hingeY + dy];

    // Slepený pár: přední (vnější, u ohybu) + vnitřní (vnitřní čára, začíná kousek pod ohybem).
    out.push(
      `<path d="M${f(pairTop[0])} ${f(pairTop[1])} L${f(pairOuterTip[0])} ${f(pairOuterTip[1])}" stroke="${LEATHER_DARK}" stroke-width="3" stroke-linecap="round"/>`,
    );
    out.push(
      `<path d="M${f(pairInnerTop[0])} ${f(pairInnerTop[1])} L${f(pairInnerTip[0])} ${f(pairInnerTip[1])}" stroke="${LEATHER}" stroke-width="2.2" stroke-linecap="round"/>`,
    );
    // Zadní, samostatná chlopeň na druhé straně ohybu A.
    out.push(
      `<path d="M${f(pairTop[0])} ${f(pairTop[1])} L${f(zadTip[0])} ${f(zadTip[1])}" stroke="${LEATHER}" stroke-width="3" stroke-linecap="round"/>`,
    );
    // Ohyb (oblý vrchol) mezi přední a zadní chlopní.
    out.push(
      `<path d="M${f(pairTop[0] - 1)} ${f(pairTop[1] + 0.3)} A1.4 1.4 0 0 1 ${f(pairTop[0] + 1)} ${f(pairTop[1] + 0.3)}" fill="none" stroke="${LEATHER_DARK}" stroke-width="1"/>`,
    );

    const glueLen = so * scale;
    // Lepidlo na vnitřní (rub vnitřního, „druhá strana páru“) – tečky směrem k zadní chlopni.
    const innerGlue = hatchAndDot(
      pairInnerTip[0],
      pairInnerTip[1],
      dx / flapLen,
      -dy / flapLen,
      perpX,
      perpY,
      glueLen,
      2.2,
    );
    // Lepidlo na zadní – tečky směrem k páru.
    const zadGlue = hatchAndDot(
      zadTip[0],
      zadTip[1],
      -dx / flapLen,
      -dy / flapLen,
      -Math.cos(rad),
      Math.sin(rad),
      glueLen,
      3,
    );
    out.push(innerGlue.svg, zadGlue.svg);
    out.push(
      `<path d="M${f(innerGlue.edge[0])} ${f(innerGlue.edge[1])} L${f(zadGlue.edge[0])} ${f(zadGlue.edge[1])}" stroke="${GUIDE}" stroke-width="0.3" stroke-dasharray="0.8 0.8"/>`,
    );
    out.push(text(pairOuterTip[0] - 2, pairOuterTip[1] + 3, 'přední+vnitřní', 3, 'end', GUIDE));
    out.push(text(zadTip[0] + 2, zadTip[1] + 3, 'zadní', 3, 'start', GUIDE));
  }
  out.push(text(118, 52, 'SPOJ 2: (přední+vnitřní) ↔ zadní', 3.2, 'middle', ACCENT));
  out.push(text(118, 57, '(ohyb A spojuje přední a zadní; vnitřní je uvnitř)', 3, 'middle', GUIDE));

  out.push(
    text(
      80,
      80,
      `lepidlo jen na pruh 0–${cz(so)} mm od hrany, tečky švu v ${cz(so)} mm`,
      3,
      'middle',
      INK,
    ),
  );
  out.push(
    text(
      80,
      85,
      'rozevřít asi do pravého úhlu, ne naplocho – suchý líc by mohl prasknout',
      3,
      'middle',
      GUIDE,
    ),
  );
  out.push(text(80, 90, 'před přitlačením zarovnat jehlami přes otvory', 3, 'middle', GUIDE));
  out.push(text(80, 96, 'lepit po jednom spoji, druhý spoj počká', 3, 'middle', GUIDE));

  return svgWrap(out);
}

/**
 * 5/5 – Přenos značek šídlem z listu na kůži: konce čar ohybů, rohy kapsy, střed patice
 * a průchodky, tečky dna.
 */
export function buildPrenosZnacekSvg(spec: CoinCardHolderSpec = DEFAULT_COIN_CARD_HOLDER): string {
  assertCoinCardHolder(spec);
  const L = coinCardHolderLayout(spec);
  const out: string[] = [];
  out.push(text(80, 6, 'Přenos značek šídlem z listu na kůži', 4, 'middle'));

  const originX = 9;
  const originY = 16;
  const k = 132 / L.stripLengthMm;
  const X = (x: number): number => originX + x * k;
  const Y = (y: number): number => originY + y * k;

  // Zjednodušený obrys pásu: obdélník s náznakem výřezu na prst (bez jazyku, jen tři panely).
  out.push(
    `<rect x="${f(X(0))}" y="${f(Y(0))}" width="${f(L.stripLengthMm * k)}" height="${f(L.panelHeightMm * k)}" fill="${LEATHER}" fill-opacity="0.55" stroke="${LEATHER_DARK}" stroke-width="0.5"/>`,
  );
  // Náznak výřezu (jen orientační oblouk, ne přesný tvar).
  out.push(
    `<path d="M${f(X(L.backX1Mm))} ${f(Y(0))} Q${f(X((L.backX1Mm + L.frontX0Mm) / 2))} ${f(Y(L.scoopRadiusMm))} ${f(X(L.frontX0Mm))} ${f(Y(0))}" fill="#fbfaf7" stroke="${LEATHER_DARK}" stroke-width="0.3" stroke-dasharray="1 1"/>`,
  );
  // Ohyby A a B.
  [L.backX1Mm, L.frontX0Mm].forEach((x) => {
    out.push(
      `<path d="M${f(X(x))} ${f(Y(0))} L${f(X(x))} ${f(Y(L.panelHeightMm))}" stroke="${GUIDE}" stroke-width="0.3" stroke-dasharray="1.4 1"/>`,
    );
  });
  [L.frontX1Mm, L.innerX0Mm ?? L.frontX1Mm].forEach((x) => {
    out.push(
      `<path d="M${f(X(x))} ${f(Y(0))} L${f(X(x))} ${f(Y(L.panelHeightMm))}" stroke="${GUIDE}" stroke-width="0.3" stroke-dasharray="1.4 1"/>`,
    );
  });

  const mark = (x: number, y: number): string => cross(X(x), Y(y), 1.4);

  // Konce čar ohybů A a B (nahoře a dole).
  [L.backX1Mm, L.frontX0Mm, L.frontX1Mm, L.innerX0Mm ?? L.frontX1Mm].forEach((x) => {
    out.push(mark(x, 0), mark(x, L.panelHeightMm));
  });
  // Rohy kapsy na předním panelu.
  const pxs = L.frontX0Mm + L.pocketXMm;
  const pys = L.pocketYMm;
  [
    [pxs, pys],
    [pxs + L.pocketWidthMm, pys],
    [pxs, pys + L.pocketHeightMm],
    [pxs + L.pocketWidthMm, pys + L.pocketHeightMm],
  ].forEach(([x, y]) => out.push(mark(x, y)));
  // Střed patice a průchodky.
  out.push(mark(L.snapXFrontMm, L.snapYFrontMm));
  if (L.grommetXMm !== null && L.grommetYMm !== null) out.push(mark(L.grommetXMm, L.grommetYMm));
  // Tečky dna – zjednodušeně pár na každém panelu.
  const seamY = L.bottomSeamYMm;
  [
    [L.backX0Mm + spec.stitchOffsetMm, L.backX1Mm - spec.stitchOffsetMm],
    [L.frontX0Mm + spec.stitchOffsetMm, L.frontX1Mm - spec.stitchOffsetMm],
    [
      (L.innerX0Mm ?? L.frontX1Mm) + spec.stitchOffsetMm,
      (L.innerX1Mm ?? L.frontX1Mm) - spec.stitchOffsetMm,
    ],
  ].forEach(([x0, x1]) => {
    for (let i = 0; i <= 4; i++) out.push(mark(x0 + ((x1 - x0) * i) / 4, seamY));
  });

  // Popisky s odkazovými čarami.
  const callout = (
    x: number,
    y: number,
    lx: number,
    ly: number,
    s: string,
    anchor: Anchor,
  ): void => {
    out.push(leader(X(x), Y(y), lx, ly));
    out.push(text(lx + (anchor === 'end' ? -1.5 : 1.5), ly + 1, s, 3, anchor, INK));
  };
  callout(L.frontX0Mm, 0, X(L.frontX0Mm) - 2, 12, 'konce čar ohybů', 'end');
  callout(pxs, pys, X(pxs) - 2, Y(pys) - 3, 'rohy kapsy', 'end');
  callout(
    L.snapXFrontMm,
    L.snapYFrontMm,
    X(L.snapXFrontMm) + 2,
    Y(L.snapYFrontMm) - 4,
    'střed patice',
    'start',
  );
  if (L.grommetXMm !== null && L.grommetYMm !== null) {
    callout(
      L.grommetXMm,
      L.grommetYMm,
      X(L.grommetXMm) - 3,
      Y(L.grommetYMm) - 5,
      'střed průchodky',
      'end',
    );
  }
  out.push(text(80, 88, 'tečky dna (propíchnout skrz)', 3.2, 'middle', INK));
  out.push(
    text(80, 93, 'u zadního a vnitřního panelu se otvory prosekávají z rubu', 3, 'middle', GUIDE),
  );
  out.push(text(80, 98, 'ZADNÍ · OHYB A · PŘEDNÍ · OHYB B · VNITŘNÍ', 3, 'middle', GUIDE));

  return svgWrap(out);
}

const illustrations: [string, () => string][] = [
  ['prosekavani-dna', buildProsekavaniDnaSvg],
  ['poradi-ohybu', buildPoradiOhybuSvg],
  ['druk', buildDrukSvg],
  ['lepeni-dna', buildLepeniDnaSvg],
  ['prenos-znacek', buildPrenosZnacekSvg],
];

function main(): void {
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  for (const [name, build] of illustrations) {
    const svg = build();
    const path = resolve(outDir, `pouzdro-mince-ilustrace-${name}.svg`);
    writeFileSync(path, svg, 'utf8');
    console.log(`Zapsáno ${path}`);
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) main();
