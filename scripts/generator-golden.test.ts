import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BELT_END,
  DEFAULT_BELT_PLATE,
  DEFAULT_BELT_TIP,
  type BeltEndSpec,
  type BeltTipSpec,
} from '../src/lib/geometry/belt-end.ts';
import {
  buildBeltPlateAreaDxf,
  buildBeltPlateAreaSvg,
  buildBeltPlateDxf,
  buildBeltPlateSvg,
  buildBeltTipPreviewSvg,
  buildLaserSvg,
  buildPages,
  buildPlateLegendSvg,
} from './belt-buckle-end.ts';

/**
 * Zapsané soubory v `docs/generated/` slouží jako golden files a zbytek sady je
 * čte. Jenže kreslicí skript **nikdo neimportoval**, takže mutace v kreslení byla
 * zelená, dokud soubory někdo ručně nepřegeneroval — a rozbitý generátor, který
 * při běhu spadne, byl od zdravého k nerozeznání (staré soubory zůstaly ležet).
 *
 * Tenhle test zavolá buildery a porovná návratovou hodnotu se souborem na disku.
 * Nekontroluje, jestli je obsah správný (od toho jsou ostatní testy), ale že
 * zapsané soubory **odpovídají aktuálnímu kódu**.
 */
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');

const read = (name: string): string | undefined => {
  const path = resolve(outDir, name);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
};

const width = (mm: number): { end: BeltEndSpec; tip: BeltTipSpec } => ({
  end: { ...DEFAULT_BELT_END, beltWidthMm: mm },
  tip: { ...DEFAULT_BELT_TIP, beltWidthMm: mm },
});

describe('zapsané soubory odpovídají generátoru', () => {
  const { end, tip } = width(DEFAULT_BELT_END.beltWidthMm);

  const cases: [string, () => string][] = [
    ['opasek-desticka.svg', () => buildBeltPlateSvg(end, tip)],
    ['opasek-desticka.dxf', () => buildBeltPlateDxf(end, tip)],
    ['opasek-desticka-rez.dxf', () => buildBeltPlateDxf(end, tip, DEFAULT_BELT_PLATE, true)],
    ['opasek-desticka-plochy.svg', () => buildBeltPlateAreaSvg(end, tip)],
    ['opasek-desticka-plochy.dxf', () => buildBeltPlateAreaDxf(end, tip)],
    ['opasek-desticka-vysvetlivky.svg', () => buildPlateLegendSvg(end, tip)],
    ['opasek-nahled-hrot.svg', () => buildBeltTipPreviewSvg(tip, 'point')],
    ['opasek-nahled-zaobleny.svg', () => buildBeltTipPreviewSvg(tip, 'round')],
  ];

  for (const [name, build] of cases) {
    it(`${name} je aktuální`, () => {
      const onDisk = read(name);
      expect(onDisk, `docs/generated/${name} chybí`).toBeDefined();
      expect(
        build(),
        `${name} se rozešel s generátorem – spusť pnpm pattern:belt-end --multi`,
      ).toBe(onDisk);
    });
  }

  for (const mm of [35, 40]) {
    const w = width(mm);
    it(`tiskové listy pro ${mm} mm jsou aktuální`, () => {
      // Tiskové listy se na disk zapisují s XML prologem, buildPages ho nevrací.
      const prolog = '<?xml version="1.0" encoding="UTF-8"?>\n';
      const [prezka, spicka] = buildPages(w.end, w.tip);
      expect(read(`opasek-sablona-${mm}mm-1-prezka.svg`)).toBe(prolog + prezka);
      expect(read(`opasek-sablona-${mm}mm-2-spicka.svg`)).toBe(prolog + spicka);
    });

    it(`řezací soubor pro ${mm} mm je aktuální`, () => {
      expect(read(`opasek-sablona-${mm}mm-laser.svg`)).toBe(buildLaserSvg(w.end, w.tip, 'cutout'));
    });
  }
});
