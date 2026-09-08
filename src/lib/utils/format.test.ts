import {
  formatCzk,
  formatCzkRange,
  formatDateCs,
  formatOrdinalCode,
  formatPercent,
  pluralizeCs,
  typo,
} from './format';

describe('formatCzk', () => {
  it('formátuje haléře jako celé koruny s českým oddělovačem tisíců', () => {
    expect(formatCzk(185_000)).toBe('1 850 Kč');
    expect(formatCzk(0)).toBe('0 Kč');
  });

  it('zaokrouhluje haléře', () => {
    expect(formatCzk(19_950)).toBe('200 Kč');
  });
});

describe('formatCzkRange', () => {
  it('spojí rozsah pomlčkou s jednotkou jen na konci', () => {
    expect(formatCzkRange(35_000, 60_000)).toBe('350–600\u00a0Kč');
    expect(formatCzkRange(34_000, 120_000)).toBe('340–1\u00a0200\u00a0Kč');
  });

  it('shodné hodnoty vrátí jako jednu částku', () => {
    expect(formatCzkRange(10_000, 10_000)).toBe('100 Kč');
  });
});

describe('formatPercent', () => {
  it('používá český zápis s nezlomitelnou mezerou před znakem procenta', () => {
    expect(formatPercent(0.666)).toBe('67\u00a0%');
  });

  it('ořízne hodnotu do rozsahu 0–100', () => {
    expect(formatPercent(-0.2)).toBe('0\u00a0%');
    expect(formatPercent(1.4)).toBe('100\u00a0%');
  });
});

describe('formatOrdinalCode', () => {
  it('doplní nulu na dvě místa', () => {
    expect(formatOrdinalCode(1)).toBe('01');
    expect(formatOrdinalCode(12)).toBe('12');
  });
});

describe('pluralizeCs', () => {
  const forms = ['položka', 'položky', 'položek'] as const;

  it('skloňuje podle českých pravidel', () => {
    expect(pluralizeCs(1, forms)).toBe('1 položka');
    expect(pluralizeCs(3, forms)).toBe('3 položky');
    expect(pluralizeCs(0, forms)).toBe('0 položek');
    expect(pluralizeCs(8, forms)).toBe('8 položek');
  });
});

describe('typo', () => {
  it('spojí číslo s jednotkou a rozměry nezlomitelnou mezerou', () => {
    expect(typo('Děrovací vidličky 3,85–4 mm')).toBe('Děrovací vidličky 3,85–4\u00a0mm');
    expect(typo('proužek 20 × 100 mm')).toBe('proužek 20\u00a0×\u00a0100\u00a0mm');
    expect(typo('asi 20 min')).toBe('asi 20\u00a0min');
  });

  it('nezlomí za jednopísmennou předložkou', () => {
    expect(typo('Kůže – třísločiněná hovězina v přírodní barvě')).toBe(
      'Kůže – třísločiněná hovězina v\u00a0přírodní barvě',
    );
  });

  it('nemění text bez čísel a předložek', () => {
    expect(typo('Palička')).toBe('Palička');
  });
});

describe('formatDateCs', () => {
  it('vrací české datum s nezlomitelnými mezerami bez posunu časové zóny', () => {
    expect(formatDateCs('2026-09-07')).toBe('7.\u00a09.\u00a02026');
    expect(formatDateCs('2026-09-07T22:30:00.000Z')).toBe('7.\u00a09.\u00a02026');
  });
});
