import { lidWalletGlossary } from '@/content/projects/lid-wallet/parts';
import { type GlossaryEntry } from '@/content/schema';
import {
  glossaryTermsIn,
  groupGlossary,
  splitGlossaryTerms,
} from '@/features/glossary/glossary-text';

const entries = lidWalletGlossary.entries;
const terms = (text: string) => glossaryTermsIn(text, entries);

describe('slovníček – vyhledání zkratek v textu', () => {
  it('najde zkratky jako celá slova, ne uvnitř jiných slov', () => {
    expect(terms('D2 lepte na rub B, pak S1 a G2b.')).toEqual(['D2', 'B', 'S1', 'G2b']);
    expect(terms('G3a a G3 jsou dvě hesla')).toEqual(['G3a', 'G3']);
    // „Kč“ není K, „y_m,B“ ani „P(A)“ nejsou díly.
    expect(terms('4 × 50 Kč, značka y_m,B, P(C) − P(A)')).toEqual([]);
  });

  it('samotné B jsou záda, ne stav ani záloha', () => {
    expect(terms('Ve stavech A, B a C víčko zavřete.')).toEqual(['stav A, B, C']);
    expect(terms('ve stavu A (prázdná), B (2 karty) a C')).toEqual(['stav A, B, C']);
    expect(terms('hrana víčka A / B / C')).toEqual([]);
    expect(terms('V záloze B ztenčení, pak záloha A a B1 i B2.')).toEqual([
      'záloha B',
      'záloha A',
      'B1',
      'B2',
    ]);
    expect(terms('díl položte lícem B nahoru, F i B')).toEqual(['B', 'F']);
  });

  it('k je posun víčka, předložka k ne', () => {
    expect(terms('Změřte k')).toEqual(['k']);
    expect(terms('Vyjde-li k nad 1,24, vygenerujte listy.')).toEqual(['k']);
    expect(terms('P0, k, magnet')).toEqual(['P0', 'k']);
    expect(terms('vraťte se k P1 a přiložte k hraně')).toEqual(['P1']);
  });

  it('funguje i s nezlomitelnými mezerami po typografii', () => {
    expect(terms('ve stavu B a k nad 1,24')).toEqual(['stav A, B, C', 'k']);
  });

  it('vyznačí jen první výskyt hesla, zbytek textu zachová', () => {
    const text = 'D1 na F, pak D1 znovu a P0-3.';
    const segments = splitGlossaryTerms(text, entries);
    expect(segments.map((s) => s.text).join('')).toBe(text);
    expect(segments.filter((s) => s.entry).map((s) => s.text)).toEqual(['D1', 'F', 'P0']);
  });

  it('heslo s inline: false se v textu nehledá', () => {
    const only: GlossaryEntry[] = [
      { term: 'závěs', name: 'závěs', description: 'x', where: 'y', group: 'parts', inline: false },
    ];
    expect(glossaryTermsIn('závěs se nelepí', only)).toEqual([]);
  });

  it('skupiny jdou v pořadí Díly · Lepení · Švy · Zkoušky a zálohy', () => {
    expect(groupGlossary(entries).map((g) => g.label)).toEqual([
      'Díly',
      'Lepení',
      'Švy',
      'Zkoušky a zálohy',
    ]);
  });
});
