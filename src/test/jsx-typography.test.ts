/**
 * Regrese: escape sekvence pro nezlomitelnou mezeru napsaná přímo v textu JSX není escape,
 * ale sedm znaků, které se vykreslí doslova (objevilo se to v tiskové šabloně). V JSX se
 * nezlomitelná mezera píše jako `&nbsp;` nebo `{'...'}`, nikdy jako holá escape sekvence.
 */
const sources: Record<string, string> = import.meta.glob('/src/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('JSX texty', () => {
  it('neobsahují doslovnou escape sekvenci nezlomitelné mezery', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !path.includes('.test.'))
      .filter(([, code]) => code.includes('\\u00' + 'a0'))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it('kontroluje smysluplný počet souborů', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });
});
