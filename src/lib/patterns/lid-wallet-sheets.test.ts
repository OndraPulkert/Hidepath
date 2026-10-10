import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LID_WALLET,
  type LidWalletSpec,
  PRINT_SHEET,
  checkLidWallet,
} from '@/lib/geometry/lid-wallet';
import { type LidMeasuredInput, lidSpecFromMeasured } from '@/lib/patterns/lid-wallet-input';
import {
  LID_P1_RANGE_MM,
  LID_THIN_LEATHER_RANGE_MM,
  type LidDrawnBox,
  type LidSheetOptions,
  buildLidSheets,
  lidSheetBoxes,
  textWidthMm,
} from '@/lib/patterns/lid-wallet-sheets';

/**
 * Bezpečný okraj 13 mm: tiskárna (HP DeskJet 2700) netiskne 12,7 mm u jedné kratší hrany A4,
 * proto nic z listu (obrysy, značky, texty, legenda, úsečka 50 mm) nesmí ležet blíž než 13 mm
 * k žádné hraně papíru. Hlídá se podle obdélníků, které si generátor pamatuje u každého
 * nakresleného prvku (cesty i s oblouky, šířka písma podle Helvetiky, tloušťka čáry, bílý lem).
 */
const SAFE = PRINT_SHEET.marginMm;
const W = PRINT_SHEET.widthMm;
const H = PRINT_SHEET.heightMm;

/** Dlouhý varovný pruh (víc položek, než se vejde na 3 řádky). */
const MANY_LIMITS = [
  'šev S4/S5 3,4 mm (max 3,0)',
  'plná tloušťka 12,95 mm (max 12,0)',
  'přepážky 1,2 mm (při P1 1,4 max 0,52)',
  'šev S1 3,3 mm (max 3,0)',
  'šev S6 3,25 mm (max 3,0)',
  'šev S7 3,1 mm (max 3,0)',
];

interface Variant {
  label: string;
  spec: LidWalletSpec;
  options: LidSheetOptions;
}

const base: LidMeasuredInput = {
  p1Mm: 1,
  dividerMm: 0.6,
  liningMm: 0.6,
  skiveFold: false,
  skiveHinge: false,
};

/**
 * Varianty z formuláře v aplikaci a přepínačů generátoru: tloušťky P1, přepážek a podšívky po
 * celém rozsahu, zálohy B1/B2 a hodnoty z P0. Listy, které neprojdou jen mezemi tloušťky, mají
 * (jako v aplikaci) varovný pruh; ostatní neplatné sestavy generátor odmítne, ty se přeskočí.
 */
function variants(): Variant[] {
  const out: Variant[] = [{ label: 'výchozí', spec: DEFAULT_LID_WALLET, options: {} }];
  const [p1Min, p1Max] = LID_P1_RANGE_MM;
  const [thinMin, thinMax] = LID_THIN_LEATHER_RANGE_MM;
  const inputs: LidMeasuredInput[] = [];
  for (const p1Mm of [p1Min, 0.8, 1, 1.2, p1Max]) {
    for (const dividerMm of [thinMin, 0.6, 0.9, thinMax]) {
      for (const liningMm of [thinMin, thinMax]) {
        for (const [skiveFold, skiveHinge] of [
          [false, false],
          [true, false],
          [false, true],
          [true, true],
        ] as const) {
          inputs.push({ p1Mm, dividerMm, liningMm, skiveFold, skiveHinge });
        }
      }
    }
  }
  inputs.push(
    { ...base, p0: { k: 1.6 } },
    { ...base, p0: { k: 2.2, cardLiftMm: 3, coinLiftMm: 2 } },
    { ...base, p0: { billHeightMaxMm: 80, billHalfWidthMaxMm: 85, billSheetMm: 0.12 } },
    { ...base, p0: { billHeightMinMm: 62, billHalfWidthMinMm: 62 } },
    { ...base, magnetThicknessMm: 3 },
  );
  for (const input of inputs) {
    const parsed = lidSpecFromMeasured(input);
    if ('problems' in parsed) continue;
    const { spec } = parsed;
    if (checkLidWallet(spec, { allowThickness: true }).length > 0) continue;
    const trial = checkLidWallet(spec).length > 0;
    out.push({
      label: JSON.stringify(input),
      spec,
      options: trial ? { outsideLimits: MANY_LIMITS } : {},
    });
  }
  out.push({
    label: 'výchozí s dlouhým varovným pruhem',
    spec: DEFAULT_LID_WALLET,
    options: { outsideLimits: MANY_LIMITS },
  });
  out.push({
    label: 'výchozí s krátkým varovným pruhem',
    spec: DEFAULT_LID_WALLET,
    options: { outsideLimits: ['šev S4/S5 3,1 mm (max 3,0)'] },
  });
  return out;
}

const fmtBox = (b: LidDrawnBox): string =>
  `${b.zone} [${b.x0.toFixed(2)}, ${b.y0.toFixed(2)}]–[${b.x1.toFixed(2)}, ${b.y1.toFixed(2)}] ${b.what}`;

const intersects = (a: LidDrawnBox, b: LidDrawnBox): boolean =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

describe('listy VÍČKA: bezpečný okraj 13 mm na každé straně', () => {
  const all = variants();

  it('variant je dost a jsou mezi nimi zálohy i listy mimo meze', () => {
    expect(all.length).toBeGreaterThan(40);
    expect(all.some((v) => v.spec.hingeSkiveMm !== null)).toBe(true);
    expect(all.some((v) => (v.options.outsideLimits ?? []).length > 0)).toBe(true);
  });

  it('každý nakreslený prvek leží v [13, W − 13] × [13, H − 13]', () => {
    const bad: string[] = [];
    for (const { label, spec, options } of all) {
      for (const { name, boxes } of lidSheetBoxes(spec, options)) {
        for (const b of boxes) {
          if (b.x0 < SAFE || b.y0 < SAFE || b.x1 > W - SAFE || b.y1 > H - SAFE) {
            bad.push(`${label} · ${name}: ${fmtBox(b)}`);
          }
        }
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });

  it('hlavička a pata (úsečka 50 mm, tisk) se nepřekrývají s ničím na listu', () => {
    const bad: string[] = [];
    for (const { label, spec, options } of all) {
      for (const { name, boxes } of lidSheetBoxes(spec, options)) {
        const body = boxes.filter((b) => b.zone === 'body');
        for (const h of boxes.filter((b) => b.zone !== 'body')) {
          for (const b of body.filter((q) => intersects(h, q))) {
            bad.push(`${label} · ${name}: ${fmtBox(h)} × ${fmtBox(b)}`);
          }
        }
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });

  it('obdélník má každý prvek SVG (nic se nekreslí mimo kontrolu) a úsečka je celá', () => {
    const svgs = buildLidSheets();
    const boxes = lidSheetBoxes();
    svgs.forEach(({ svg }, i) => {
      const drawn = svg.match(/<(path|rect|circle|text)\b/g)!.length;
      const clipPaths = svg.match(/<clipPath /g)?.length ?? 0;
      // Bílé pozadí listu a cesty ořezových masek se nekreslí.
      expect(boxes[i]!.boxes).toHaveLength(drawn - 1 - clipPaths);
      const cal = boxes[i]!.boxes.find((b) => b.what.includes('class="calibration"'))!;
      // Úsečka 50 mm a polovina tloušťky čáry 0,01 na každém konci.
      expect(cal.x1 - cal.x0).toBeCloseTo(50.01, 6);
      expect(cal.zone).toBe('footer');
    });
  });

  it('šířka písma odpovídá Helvetice (Arial) s rezervou', () => {
    // 10 × „0“ = 10 × 0,556 em; tučné „W“ 0,944 em; háček nemění šířku.
    expect(textWidthMm('0000000000', 2)).toBeCloseTo(10 * 0.556 * 2 * 1.03, 6);
    expect(textWidthMm('W', 3, true)).toBeCloseTo(0.944 * 3 * 1.03, 6);
    expect(textWidthMm('č', 2)).toBeCloseTo(textWidthMm('c', 2), 9);
  });
});
