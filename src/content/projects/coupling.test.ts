import { describe, expect, it } from 'vitest';

/**
 * Aplikace nesmí být zadrátovaná na jeden projekt. Definici pouzdra dřív přímo
 * importovalo sedm souborů mimo obsah (routy, onboarding, přehled, lekce, dílna,
 * nákupy) a druhý projekt by znamenal zásah do každého z nich. Jediné místo, které
 * pouzdro smí jmenovat, je registr projektů v `src/content/projects`.
 */
const sources: Record<string, string> = import.meta.glob(
  ['/src/app/**/*.{ts,tsx}', '/src/pages/**/*.{ts,tsx}', '/src/features/**/*.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
);

describe('vazba aplikace na konkrétní projekt', () => {
  it('nic mimo registr projektů neimportuje pouzdro přímo', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !path.includes('.test.'))
      .filter(([, src]) => /from ['"]@\/content\/projects\/card-holder\//.test(src))
      .map(([path]) => path);
    expect(offenders, 'soubory, které jmenují pouzdro přímo').toEqual([]);
  });

  it('nic mimo registr nezná slug pouzdra jako literál', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !path.includes('.test.'))
      .filter(([, src]) => /['"]card-holder['"]/.test(src))
      .map(([path]) => path);
    expect(offenders, 'soubory se zadrátovaným slugem').toEqual([]);
  });
});
