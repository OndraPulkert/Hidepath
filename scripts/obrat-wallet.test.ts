import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildObratDrawing, buildObratSheets } from './obrat-wallet';

describe('OBRAT R11 – generátor listů', () => {
  const { telo, dily } = buildObratSheets();

  it('listy jsou A4 1:1 s oběma kontrolními úsečkami a legendou', () => {
    for (const svg of [telo, dily]) {
      expect(svg).toContain('width="210mm" height="297mm" viewBox="0 0 210 297"');
      expect(svg).toContain('Kontrola 50 mm vodorovně');
      expect(svg).toContain('svisle 50');
      expect(svg).toContain('Legenda');
    }
  });

  it('každý díl říká, kterou stranou přiložit', () => {
    expect(telo).toContain('RUB nahoru');
    expect(dily).toMatch(/T2[\s\S]*LÍC nahoru/);
    expect(dily).toContain('RUB nahoru · zadní díl + víčko');
    expect(dily).toMatch(/T3[\s\S]*LÍC nahoru/);
    expect(dily).toContain('K – kryt patice C, Ø 17');
    expect(dily).toContain('B – patice');
    expect(dily).toContain('C – patice');
    expect(dily).not.toMatch(/A – patice|závěs/);
  });

  it('uložené soubory odpovídají generátoru', () => {
    const root = resolve(__dirname, '..');
    expect(readFileSync(resolve(root, 'docs/generated/obrat-list-1-telo.svg'), 'utf8')).toBe(telo);
    expect(readFileSync(resolve(root, 'docs/generated/obrat-list-2-dily.svg'), 'utf8')).toBe(dily);
    expect(readFileSync(resolve(root, 'public/projekty/obrat/konstrukce.svg'), 'utf8')).toBe(
      buildObratDrawing(),
    );
  });
});
