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
import { buildPracticeSheetSvg } from './card-holder-practice.ts';
import { buildCoinHolderPracticeSvg } from './coin-card-holder-practice.ts';
import {
  buildCoinHolderPaperModelSvg,
  buildCoinHolderPocketSvg,
  buildCoinHolderProcessStepSvg,
  buildCoinHolderProcessSvg,
  buildCoinHolderSheetSvg,
} from './coin-card-holder.ts';
import {
  buildDrukSvg,
  buildLepeniDnaSvg,
  buildPoradiOhybuSvg,
  buildPrenosZnacekSvg,
  buildProsekavaniDnaSvg,
} from './coin-card-holder-illustrations.ts';
import {
  buildLidBackSvg,
  buildLidJigsSvg,
  buildLidPartsSvg,
  buildLidSheetSvg,
} from './lid-wallet.ts';
import {
  buildJazycekMagnetSvg,
  buildRezSvg,
  buildVlozkaDnaSvg,
  buildVyrezProPalecSvg,
  buildZadaOkenkaSvg,
  buildZavesPresObsahSvg,
} from './lid-wallet-illustrations.ts';
import { buildWalletBackSvg, buildWalletJigsSvg, buildWalletSheetSvg } from './minimal-wallet.ts';
import {
  DEFAULT_COIN_CARD_HOLDER,
  foldSkiveFor,
  NAMED_COINS,
} from '../src/lib/geometry/coin-card-holder.ts';

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
    ['pouzdro-karty-cvicna-sablona.svg', () => buildPracticeSheetSvg()],
    ['pouzdro-mince-sablona.svg', () => buildCoinHolderSheetSvg()],
    ['pouzdro-mince-postup.svg', () => buildCoinHolderProcessSvg()],
    ...Array.from({ length: 8 }, (_, i): [string, () => string] => [
      `pouzdro-mince-postup-krok-${i + 1}.svg`,
      () => buildCoinHolderProcessStepSvg(i + 1),
    ]),
    ['pouzdro-mince-kapsa.svg', () => buildCoinHolderPocketSvg()],
    ['pouzdro-mince-papirovy-model.svg', () => buildCoinHolderPaperModelSvg()],
    [
      'pouzdro-mince-papirovy-model-mince-40mm.svg',
      () =>
        buildCoinHolderPaperModelSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          coinDiameterMm: NAMED_COINS.decision,
        }),
    ],
    [
      'pouzdro-mince-kapsa-mince-40mm.svg',
      () =>
        buildCoinHolderPocketSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          coinDiameterMm: NAMED_COINS.decision,
        }),
    ],
    [
      'pouzdro-mince-sablona-mince-40mm.svg',
      () =>
        buildCoinHolderSheetSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          coinDiameterMm: NAMED_COINS.decision,
        }),
    ],
    // Kůže 1,2 mm (Verde): bez ztenčení, jak ho nastaví --thickness 1.2.
    [
      'pouzdro-mince-sablona-kuze-1-2mm.svg',
      () =>
        buildCoinHolderSheetSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          bodyThicknessMm: 1.2,
          foldSkiveThicknessMm: foldSkiveFor(1.2),
        }),
    ],
    [
      'pouzdro-mince-sablona-mince-40mm-kuze-1-2mm.svg',
      () =>
        buildCoinHolderSheetSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          coinDiameterMm: NAMED_COINS.decision,
          bodyThicknessMm: 1.2,
          foldSkiveThicknessMm: foldSkiveFor(1.2),
        }),
    ],
    [
      'pouzdro-mince-papirovy-model-mince-40mm-kuze-1-2mm.svg',
      () =>
        buildCoinHolderPaperModelSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          coinDiameterMm: NAMED_COINS.decision,
          bodyThicknessMm: 1.2,
          foldSkiveThicknessMm: foldSkiveFor(1.2),
        }),
    ],
    [
      'pouzdro-mince-papirovy-model-kuze-1-2mm.svg',
      () =>
        buildCoinHolderPaperModelSvg({
          ...DEFAULT_COIN_CARD_HOLDER,
          bodyThicknessMm: 1.2,
          foldSkiveThicknessMm: foldSkiveFor(1.2),
        }),
    ],
    // Záložní okno Ø 18 mm (lekce 2 a 6), jak ho nastaví --window 18; v aplikaci jen list KAPSA.
    [
      'pouzdro-mince-kapsa-okno-18mm.svg',
      () => buildCoinHolderPocketSvg({ ...DEFAULT_COIN_CARD_HOLDER, windowDiameterMm: 18 }),
    ],
    // Cvičný proužek k lekci 4: kůže 1,5 mm bez přípony, 1,2 mm s příponou (jako listy pásu).
    ['pouzdro-mince-cvicny-prouzek.svg', () => buildCoinHolderPracticeSvg(1.5)],
    ['pouzdro-mince-cvicny-prouzek-kuze-1-2mm.svg', () => buildCoinHolderPracticeSvg(1.2)],
    ['pouzdro-mince-ilustrace-prosekavani-dna.svg', () => buildProsekavaniDnaSvg()],
    ['pouzdro-mince-ilustrace-poradi-ohybu.svg', () => buildPoradiOhybuSvg()],
    ['pouzdro-mince-ilustrace-druk.svg', () => buildDrukSvg()],
    ['pouzdro-mince-ilustrace-lepeni-dna.svg', () => buildLepeniDnaSvg()],
    ['pouzdro-mince-ilustrace-prenos-znacek.svg', () => buildPrenosZnacekSvg()],
    ['penezenka-sablona.svg', () => buildWalletSheetSvg()],
    ['penezenka-rub.svg', () => buildWalletBackSvg()],
    ['penezenka-pripravky.svg', () => buildWalletJigsSvg()],
    ['penezenka-vicko-sablona.svg', () => buildLidSheetSvg()],
    ['penezenka-vicko-rub.svg', () => buildLidBackSvg()],
    ['penezenka-vicko-dily.svg', () => buildLidPartsSvg()],
    ['penezenka-vicko-pripravky.svg', () => buildLidJigsSvg()],
    ['penezenka-vicko-ilustrace-rez-a-vlozeni.svg', () => buildRezSvg()],
    ['penezenka-vicko-ilustrace-vlozka-dna.svg', () => buildVlozkaDnaSvg()],
    ['penezenka-vicko-ilustrace-zaves-pres-obsah.svg', () => buildZavesPresObsahSvg()],
    ['penezenka-vicko-ilustrace-jazycek-magnet.svg', () => buildJazycekMagnetSvg()],
    ['penezenka-vicko-ilustrace-zada-okenka.svg', () => buildZadaOkenkaSvg()],
    ['penezenka-vicko-ilustrace-vyrez-pro-palec.svg', () => buildVyrezProPalecSvg()],
  ];

  for (const [name, build] of cases) {
    it(`${name} je aktuální`, () => {
      const onDisk = read(name);
      expect(onDisk, `docs/generated/${name} chybí`).toBeDefined();
      expect(
        build(),
        `${name} se rozešel s generátorem – spusť ${name.startsWith('pouzdro-karty') ? 'pnpm pattern:card-holder-practice' : name.startsWith('penezenka-vicko-ilustrace') ? 'pnpm pattern:wallet-lid-illustrations' : name.startsWith('penezenka-vicko') ? 'pnpm pattern:wallet-lid' : name.startsWith('penezenka') ? 'pnpm pattern:wallet' : name.startsWith('pouzdro-mince-ilustrace') ? 'pnpm pattern:coin-holder-illustrations' : name.startsWith('pouzdro-mince-cvicny') ? 'pnpm pattern:coin-holder-practice' : name.startsWith('pouzdro-mince') ? `pnpm pattern:coin-holder${`${name.includes('mince-40mm') ? ' --coin 40' : ''}${name.includes('okno-18mm') ? ' --window 18' : ''}${name.includes('kuze-1-2') ? ' --thickness 1.2' : ''}`}` : 'pnpm pattern:belt-end --multi'}`,
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
