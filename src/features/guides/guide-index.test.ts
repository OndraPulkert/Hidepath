import { animationPages } from '@/content/animations';
import { projects } from '@/content/projects';

import { buildGuideIndex, groupGuides, normalizeSearch, searchGuides, stemCs } from './guide-index';

const index = buildGuideIndex(projects);
const page = (key: keyof typeof animationPages) => index.find((p) => p.key === key)!;

describe('buildGuideIndex', () => {
  it('obsahuje každou animaci právě jednou, s kroky a odkazy na kotvy', () => {
    expect(index.map((p) => p.key)).toEqual(Object.keys(animationPages));
    const divider = page('wingDivider');
    expect(divider.href).toBe('/animace/kruzitko.html');
    expect(divider.steps[0]).toEqual({
      anchor: 'A1',
      title: 'Nastavte rozteč',
      section: 'Část A – příprava',
      href: '/animace/kruzitko.html#A1',
    });
    expect(divider.sections.map((s) => s.href)).toEqual([
      '/animace/kruzitko.html#A',
      '/animace/kruzitko.html#B',
      '/animace/kruzitko.html#C',
    ]);
  });

  it('zná kroky lekcí, které na animaci odkazují', () => {
    const uses = page('wingDivider').uses;
    expect(uses.every((u) => u.projectSlug === 'obrat-wallet')).toBe(true);
    expect(uses.map((u) => u.stepTitle)).toContain('Narýsujte U-linii a připravte vidličky');
  });
});

describe('groupGuides', () => {
  it('obecné techniky jsou zvlášť a každá animace je právě v jedné skupině', () => {
    const groups = groupGuides(index, projects);
    expect(groups[0]!.id).toBe('techniques');
    expect(groups[0]!.pages.map((p) => p.key)).toContain('wingDivider');
    expect(groups[0]!.pages.map((p) => p.key)).toContain('saddleStitch');
    const all = groups.flatMap((g) => g.pages.map((p) => p.key));
    expect([...all].sort()).toEqual(Object.keys(animationPages).sort());
  });

  it('aktivní projekt je hned za technikami; stránka projektu patří k projektu, který ji používá', () => {
    const groups = groupGuides(index, projects, 'belt');
    expect(groups[1]!.id).toBe('belt');
    expect(groups.find((g) => g.id === 'obrat-wallet')!.pages.map((p) => p.key)).toContain(
      'obratAssembly',
    );
  });
});

describe('searchGuides', () => {
  it('nehledí na diakritiku ani velikost písmen', () => {
    expect(normalizeSearch('Kružítko ŘEZ')).toBe('kruzitko rez');
    expect(stemCs('kruzitko')).toBe('kruzitk');
    expect(stemCs('roh')).toBe('roh');
    expect(searchGuides(index, 'kruzitko')[0]!.page.key).toBe('wingDivider');
  });

  it('slova se dělí mezi stránku a krok: „kružítko roh“ najde krok o oblouku', () => {
    const [first] = searchGuides(index, 'kružítko roh');
    expect(first!.page.key).toBe('wingDivider');
    expect(first!.steps.map((s) => s.anchor)).toEqual(['C1']);
  });

  it('najde krok podle jeho názvu na jakékoli stránce', () => {
    const hits = searchGuides(index, 'ujede');
    expect(hits.map((h) => h.page.key)).toContain('wingDivider');
    expect(hits.find((h) => h.page.key === 'wingDivider')!.steps[0]!.title).toBe('Když hrot ujede');
  });

  it('najde animaci i přes název kroku lekce, který na ni odkazuje', () => {
    const hit = searchGuides(index, 'U-linii').find((h) => h.page.key === 'wingDivider');
    expect(hit?.uses.map((u) => u.stepTitle)).toContain('Narýsujte U-linii a připravte vidličky');
  });

  it('prázdný dotaz nic nevrací, nesmysl taky ne', () => {
    expect(searchGuides(index, '   ')).toEqual([]);
    expect(searchGuides(index, 'xyzqw')).toEqual([]);
  });
});
