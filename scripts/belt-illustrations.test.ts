import { describe, expect, it } from 'vitest';

import { buildObvodMetremSvg, buildObvodNaPaskuSvg } from './belt-illustrations.ts';

describe('ilustrace pásku – měření obvodu (opasek-postup.md, krok 1)', () => {
  it('na pásku: od místa ohybu ke středu používané dírky, ne od trnu ani k první dírce', () => {
    const svg = buildObvodNaPaskuSvg();
    expect(svg).toContain('>místo ohybu<');
    expect(svg).toContain('>obvod<');
    expect(svg).toContain('>dírka, kterou<');
    expect(svg).toContain('>používáte<');
    expect(svg).toContain('ne k první dírce');
    expect(svg).toContain('ne od špičky trnu');
    expect(svg).toContain('ke středu dírky, kterou používáte');
    expect(svg).toContain('kolem příčky');
    expect(svg).toContain('fill="#ffffff"');
  });

  it('na pásku: kóta i metr začínají v místě ohybu a kóta končí na středu prostřední dírky', () => {
    const svg = buildObvodNaPaskuSvg();
    // Pomocné čáry (čárkované) stojí na ohybu x = 22 a na středu používané dírky x = 84.
    expect(svg).toContain('d="M22 8 L22 49"');
    expect(svg).toContain('d="M84 8 L84 49"');
    // Pět dírek, používaná (prostřední) je vytahaná – jediná elipsa s rx ≠ ry v řadě dírek.
    expect(svg.match(/rx="1.3" ry="1.3"/g)).toHaveLength(4);
    expect(svg).toContain('cx="84.5" cy="39" rx="1.9" ry="1.3"');
  });

  it('metrem: poutky kalhot, utáhnout na pohodlí, tatáž míra', () => {
    const svg = buildObvodMetremSvg();
    expect(svg).toContain('poutky kalhot');
    expect(svg).toContain('metr vede všemi poutky');
    expect(svg).toContain('utáhněte na pohodlí');
    expect(svg).toContain('odečtěte u nuly');
  });
});
