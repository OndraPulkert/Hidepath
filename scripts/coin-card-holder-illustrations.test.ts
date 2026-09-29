import { describe, expect, it } from 'vitest';

import {
  buildDrukSvg,
  buildLepeniDnaSvg,
  buildPoradiOhybuSvg,
  buildPrenosZnacekSvg,
  buildProsekavaniDnaSvg,
} from './coin-card-holder-illustrations.ts';
import { DEFAULT_COIN_CARD_HOLDER } from '../src/lib/geometry/coin-card-holder.ts';

describe('ilustrace pouzdra s mincí – klíčová fakta', () => {
  it('prosekávání dna: přední panel z líce, zadní a vnitřní z rubu', () => {
    const svg = buildProsekavaniDnaSvg();
    expect(svg).toContain('PŘEDNÍ');
    expect(svg).toContain('ZADNÍ');
    expect(svg).toContain('VNITŘNÍ');
    // Popisek panelu „z líce“ patří jen k jednomu panelu (předku), zbylé dva mají „z rubu“
    // (uzavřené v <text>…</text>, aby se nepočítala i věta v legendě pod obrázkem).
    expect(svg.match(/>z líce</g)?.length).toBe(1);
    expect(svg.match(/>z rubu</g)?.length).toBe(2);
  });

  it('pořadí ohybů: nejdřív ohyb B, pak ohyb A', () => {
    const svg = buildPoradiOhybuSvg();
    expect(svg).toContain('OHYB B');
    expect(svg).toContain('OHYB A');
    expect(svg.indexOf('OHYB B')).toBeLessThan(svg.indexOf('OHYB A'));
  });

  it('druk: obsahuje všechny čtyři díly', () => {
    const svg = buildDrukSvg();
    expect(svg).toContain('klobouček');
    expect(svg).toContain('zdířka');
    expect(svg).toContain('hlavička');
    expect(svg).toContain('patice');
  });

  it('lepení dna: pruh lepidla 0–3,5 mm od hrany', () => {
    const svg = buildLepeniDnaSvg();
    expect(svg).toContain('3,5');
    expect(svg).toContain('SPOJ 1');
    expect(svg).toContain('SPOJ 2');
  });

  it('přenos značek: popisuje konce čar ohybů, rohy kapsy, patici a tečky dna; průchodku jen u varianty', () => {
    const svg = buildPrenosZnacekSvg();
    expect(svg).toContain('konce čar ohybů');
    expect(svg).toContain('rohy kapsy');
    expect(svg).toContain('střed patice');
    expect(svg).toContain('tečky dna');
    // Od v4.11 je průchodka volitelná: výchozí ilustrace ji nemá, varianta ano.
    expect(svg).not.toContain('průchod');
    expect(buildPrenosZnacekSvg({ ...DEFAULT_COIN_CARD_HOLDER, grommet: true })).toContain(
      'střed průchodky',
    );
    expect(buildPoradiOhybuSvg()).not.toContain('průchod');
  });

  it('všech pět ilustrací má viewBox 160 × 100 mm', () => {
    for (const build of [
      buildProsekavaniDnaSvg,
      buildPoradiOhybuSvg,
      buildDrukSvg,
      buildLepeniDnaSvg,
      buildPrenosZnacekSvg,
    ]) {
      const svg = build();
      expect(svg).toContain('width="160mm" height="100mm" viewBox="0 0 160 100"');
    }
  });
});
