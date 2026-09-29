import { describe, expect, it } from 'vitest';

import {
  buildJazycekMagnetSvg,
  buildRezSvg,
  buildVlozkaDnaSvg,
  buildVyrezProPalecSvg,
  buildZadaOkenkaSvg,
  buildZavesPresObsahSvg,
} from './lid-wallet-illustrations.ts';
import { lidWalletLayout, lidWalletVariant } from '../src/lib/geometry/lid-wallet.ts';

const all = [
  buildRezSvg,
  buildVlozkaDnaSvg,
  buildZavesPresObsahSvg,
  buildJazycekMagnetSvg,
  buildZadaOkenkaSvg,
  buildVyrezProPalecSvg,
];

describe('ilustrace peněženky Víčko – klíčová fakta', () => {
  it('všech šest ilustrací má viewBox 160 × 100 mm', () => {
    for (const build of all) {
      expect(build()).toContain('width="160mm" height="100mm" viewBox="0 0 160 100"');
    }
  });

  it('vložka dna: hrana vložky 1,96 mm za rýhou (62,21 → 64,18), rýha na vrcholu ohybu', () => {
    const svg = buildVlozkaDnaSvg();
    expect(svg).toContain('rýha v 62,21');
    expect(svg).toContain('hrana vložky v 64,18');
    expect(svg).toContain('>1,96 mm<');
    expect(svg).toContain('rýha (na rubu) = vrchol ohybu');
    expect(svg).toContain('skutečný střed ohybu ověří V12');
    expect(svg).toContain('111 × 25 × 1,5');
  });

  it('vložka dna se přepočítá s tloušťkou přepážek (0,8: osa 61,71, hrana 63,68)', () => {
    const spec = lidWalletVariant({ dividerMm: 0.8 });
    const L = lidWalletLayout(spec);
    const svg = buildVlozkaDnaSvg(spec);
    expect(svg).toContain(
      `rýha v ${String(Math.round(L.v.foldAxis * 100) / 100).replace('.', ',')}`,
    );
    expect(svg).toContain('61,71');
    expect(svg).toContain('63,68');
  });

  it('závěs: zavřený přes obsah stavu B přes noc pod knihou, jen pás závěsu navlhčený', () => {
    const svg = buildZavesPresObsahSvg();
    expect(svg).toContain('kniha');
    expect(svg).toContain('fólie');
    expect(svg).toContain('přes noc');
    expect(svg).toContain('navlhčit jen pás závěsu');
    expect(svg).toContain('2 staré karty');
    expect(svg).toContain('T = 3,42 mm');
    expect(svg).toContain('samo nestojí');
  });

  it('jazýček: magnet 7 mm nad špičkou, L1 10 mm nad magnetem, 8 otvorů S7, mezera 1,6', () => {
    const svg = buildJazycekMagnetSvg();
    expect(svg).toContain('>7 mm<');
    expect(svg).toContain('>10 mm<');
    expect(svg).toContain('S7: 8 otvorů do U');
    expect(svg.match(/r="0.75" fill="#a2471f"/g)).toHaveLength(8);
    expect(svg).toContain('mezera magnet–plíšek 1,6 mm');
    expect(svg).toContain('klín jen posl. 2,5 mm');
    // Stejně jako list 4: odstup se nezaokrouhluje nahoru („≥ 2,08“, ne „≥ 2,1“).
    expect(svg).toContain('S7 ≥ 2,08 mm od magnetu');
  });

  it('záda: okénko bankovek 14 × 45 výsečníkem Ø 14, okénka mincí 12 × 48, dva sloupce', () => {
    const svg = buildZadaOkenkaSvg();
    expect(svg).toContain('okénko bankovek 14 × 45');
    expect(svg).toContain('výsečník Ø 14, středy y 32 a 63');
    expect(svg).toContain('okénka mincí 12 × 48 (výsečník Ø 12)');
    expect(svg).toContain('sloupec 31 × 57');
    expect(svg).not.toContain('Ø 15');
  });

  it('výřez pro palec: U 10 × 12 výsečníkem Ø 10, jazýček 20 mm, rohy 4 mm od boků jazýčku', () => {
    const svg = buildVyrezProPalecSvg();
    expect(svg).toContain('U 10 × 12');
    expect(svg).toContain('výsečník Ø 10');
    expect(svg).toContain('jazýček 20 mm');
    expect(svg).toContain('Rohy výřezu jsou 4 mm od boků jazýčku');
  });

  it('řez: karty proužkem k horní hraně (k víčku), do štěrbiny bankovek nikdy kartu', () => {
    const svg = buildRezSvg();
    expect(svg).toContain('proužkem k horní hraně (k víčku)');
    expect(svg).toContain('Do štěrbiny 2 nikdy kartu');
    expect(svg).toContain('plíšek na rubu F');
  });
});
