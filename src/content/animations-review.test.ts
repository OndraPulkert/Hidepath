import { animationPages } from '@/content/animations';
import { beltEquipment } from '@/content/equipment/belt';
import { projects } from '@/content/projects';

/**
 * Regrese z kontroly animací proti lekcím: texty kroků animací musí říkat totéž co lekce,
 * na které odkazují (projekt, čísla, podmínky pro barevný pásek).
 */
const pages: Record<string, string> = import.meta.glob('/public/animace/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const page = (name: string) => pages[`/public/animace/${name}.html`]!;

/** Zdroj kroku `part``n` stránky: od jeho `add(` po další `add(` (název, text i kresba). */
function stepSource(source: string, part: string, n: number): string {
  const starts = [...source.matchAll(/\badd\(\s*(['"])([A-Z])\1/g)];
  const own = starts.filter((m) => m[2] === part);
  const start = own[n - 1]!.index;
  const next = starts.find((m) => m.index > start)?.index ?? source.length;
  return source.slice(start, next);
}

const stepOf = (slug: string, order: number, id: string) =>
  projects
    .find((p) => p.slug === slug)!
    .lessons.find((l) => l.order === order)!
    .steps.find((s) => s.id === id)!;

describe('kontrola animací proti lekcím', () => {
  it('vrtání formy: první strana končí, až projde středicí vrták, ne pevně v půlce', () => {
    const e2 = stepSource(page('vrtani-formy'), 'E', 2);
    expect(e2).toContain('dokud špička středicího vrtáku nevyjde zespodu');
    expect(e2).not.toMatch(/do půlky|v půlce přestaňte/);
    // Kresba: hloubka 1. strany + výsuvník vrtáku musí projít deskou, jinak není dírka na E3.
    const src = page('vrtani-formy');
    const bt = Number(/const BT=(\d+)/.exec(src)![1]);
    const prot = Number(/const P_OK=XT\+(\d+)/.exec(src)![1]);
    expect(src).toContain('const CUT1=BT-(P_OK-XT)+2');
    expect(bt - prot + 2 + prot).toBeGreaterThan(bt);
    expect(stepSource(page('kapsa-postup'), 'A', 4).split('const st')[0]).not.toContain('do půlky');
    expect(stepOf('coin-card-holder', 2, 'drill-form').body).not.toContain('do půlky');
    expect(stepOf('coin-card-holder', 2, 'drill-form').body).not.toContain('Forstner');
  });

  it('skládání D2: počet otvorů platí pro pouzdro i cvičný proužek', () => {
    const d2 = stepSource(page('kapsa-skladani'), 'D', 2);
    expect(d2).toContain('na pouzdře 17 otvorů');
    expect(d2).toContain('na cvičném proužku 6');
  });

  it('pásek odkazuje na hrany jen v části H (jedna vrstva pásu), barva má vlastní krok H2', () => {
    const beltProject = projects.find((p) => p.slug === 'belt')!;
    const edgeAnchors = beltProject.lessons.flatMap((l) =>
      l.steps.flatMap((s) =>
        (s.animationLinks ?? [])
          .filter((a) => a.href.startsWith(animationPages.edges.path))
          .map((a) => a.href.split('#')[1]!),
      ),
    );
    expect(edgeAnchors.filter((a) => !/^[HD]/.test(a))).toEqual([]);
    expect(animationPages.edges.steps.H[1]).toBe('Obarvěte hrany pásu (jen barevný pásek)');
  });

  it('sedlářský steh: čísla lekcí v G2, E1 a G3 platí jen s projektem 01', () => {
    const src = page('sedlarsky-steh');
    expect(stepSource(src, 'G', 2)).not.toContain('(lekce 3)');
    expect(stepSource(src, 'E', 1)).toContain('projekt 01,');
    expect(stepSource(src, 'G', 3)).toContain('V projektu 01 pak');
  });

  it('přezka: rolnová s jedním trnem je v pořádku, jako v animaci a ve zdroji', () => {
    const buckle = beltEquipment.find((i) => i.slug === 'belt-buckle')!;
    const type = buckle.buyingGuide.find((r) => r.label === 'Typ')!.value;
    expect(type).not.toContain('ani rolnová');
    expect(stepSource(page('pasek-sirka-konec'), 'A', 3)).toContain('Rolnová přezka');
  });

  it('pásek: animace odkazují na čísla pod krokem jako lekce a mají podmínky barevného pásku', () => {
    const spicka = page('pasek-spicka');
    expect(stepSource(spicka, 'A', 2)).toContain('obvodem aktivního pásku pod krokem');
    expect(stepSource(spicka, 'A', 2)).not.toContain('obvod z lekce 1');
    expect(stepSource(spicka, 'A', 4)).toContain('vaše číslo je pod krokem');
    expect(stepSource(spicka, 'E', 1)).toContain('Ø dírek z aktivního pásku');
    expect(stepSource(spicka, 'B', 1)).toContain('nevejde');
    expect(stepSource(spicka, 'D', 1)).toContain('nevejde');
    expect(stepSource(spicka, 'F', 1)).toContain('U barevného pásku je obarvěte');
    expect(stepSource(spicka, 'F', 2)).toContain('jen, když balzám na odřezku vyhověl');
    const prezka = page('pasek-prezka');
    expect(stepSource(prezka, 'C', 4)).toContain('u barevného pásku obarvěte');
    expect(stepSource(prezka, 'D', 1)).toContain('délkou poutka aktivního pásku pod krokem');
    expect(stepSource(page('pasek-sirka-konec'), 'D', 1)).toContain('U „Barva“ zvolte');
  });

  it('Víčko: magnet B2 říká, kam zadat tloušťku; závěs kreslí papír mezi D1 a D2', () => {
    expect(stepSource(page('vicko-magnet'), 'B', 2)).toContain('„Listy pro vaši kůži“');
    const ohyby = page('vicko-ohyby');
    expect(ohyby).not.toContain('animace ho kreslí před D1');
    expect(ohyby).toContain('BX = [-M.tD - PAP + 0.02, -M.tD - 0.02]');
  });

  it('odkazy na krok posunou stránku tak, aby byl vidět popisek kroku', () => {
    expect(page('vicko-p1-rez')).toContain('id="anim"');
    expect(page('vicko-p1-rez')).toMatch(/toAnim\(\);/);
    expect(page('vicko-magnet')).toContain("querySelector('.abtn')");
    expect(page('vicko-ohyby')).toContain("querySelector('.abtn')");
  });
});

describe('animace – rozhodnutí autora 8. 10. 2026', () => {
  it('hrany G4: klín D2 z líce, bez „ověřte stranu“; skládání B4 bez odřezku z lekce 4', () => {
    const g4 = stepSource(page('hrany'), 'G', 4);
    expect(g4).toContain('z líce D2');
    expect(g4).not.toContain('stranu klínu ověřte');
    const b4 = stepSource(page('kapsa-skladani'), 'B', 4);
    expect(b4).not.toContain('odřezku z lekce 4');
    expect(b4).toContain('novém cvičném proužku');
    expect(stepSource(page('kapsa-postup'), 'A', 4)).toContain('korunkou Ø 32 mm na unášeči');
  });

  it('posuvka: krok D1 platí pro všechny projekty, Víčko je jen příklad shodný s lekcí 1', () => {
    const d1 = stepSource(page('posuvka'), 'D', 1);
    expect(d1).toContain('Průměr zadejte tam, kam vás poslal krok lekce.');
    expect(d1).toContain('Příklad z Víčka');
    expect(d1).toContain('0,92 mm');
    expect(stepOf('lid-wallet', 1, 'measure').body).toContain('0,92 mm');
    expect(d1).not.toContain("'P1 (kaštan), mm'");
  });

  it('posuvka: odkazují na ni kroky, kde se posuvkou měří tloušťka kůže', () => {
    const hrefs = (slug: string, order: number, id: string) =>
      (stepOf(slug, order, id).animationLinks ?? []).map((a) => a.href);
    const p = animationPages.caliper.path;
    expect(hrefs('lid-wallet', 1, 'measure')).toEqual([`${p}#A1`, `${p}#B1`, `${p}#D1`]);
    expect(hrefs('lid-wallet', 3, 'decide')).toEqual([`${p}#B1`, `${p}#D1`]);
    expect(hrefs('belt', 1, 'measure-strap')).toEqual([`${p}#A1`, `${p}#B1`, `${p}#D1`]);
    expect(hrefs('coin-card-holder', 3, 'skive')).toEqual([`${p}#B1`]);
  });
});
