import {
  animationButtonText,
  animationLink,
  animationPages,
  animationStepTitle,
} from '@/content/animations';
import { projects } from '@/content/projects';
import { animationLinkSchema, lessonStepSchema, projectDefinitionSchema } from '@/content/schema';

/** Obsah statických stránek animací tak, jak je build zkopíruje do dist/. */
const pages: Record<string, string> = import.meta.glob('/public/animace/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function pageSource(href: string): string | undefined {
  return pages[`/public${href.split('#')[0]}`];
}

/**
 * Kroky stránky po částech v pořadí `add('B','název',…)` – tak je stránka čísluje (B1, B2…).
 * Stránky Víčka mají `add(` i s mezerami, na víc řádků a s dvojitými uvozovkami.
 */
function pageSteps(source: string): Record<string, string[]> {
  const steps: Record<string, string[]> = {};
  for (const [, , part, , title] of source.matchAll(
    /\badd\(\s*(['"])([A-Z])\1\s*,\s*(['"])((?:(?!\3).)*)\3/g,
  )) {
    (steps[part!] ??= []).push(title!);
  }
  return steps;
}

/**
 * Umí stránka otevřít kotvu? Kapsa má části A–E v `PARTS` a kroky (`B3`) z `add(…)`, umí je
 * otevřít přes `stepFromHash`; ostatní mají `id` v HTML.
 */
function hasAnchor(source: string, anchor: string): boolean {
  if (source.includes(`id="${anchor}"`)) return true;
  const parts = /const PARTS\s*=\s*\{([^}]*)\}/.exec(source)?.[1] ?? '';
  const step = /^([A-Z])([1-9][0-9]*)$/.exec(anchor);
  if (step) {
    return (
      source.includes('function stepFromHash()') &&
      new RegExp(`(^|,)\\s*${step[1]}\\s*:`).test(parts) &&
      (pageSteps(source)[step[1]!]?.length ?? 0) >= Number(step[2])
    );
  }
  return new RegExp(`(^|,)\\s*${anchor}\\s*:`).test(parts);
}

const allSteps = projects.flatMap((project) =>
  project.lessons.flatMap((lesson) =>
    lesson.steps.map((step) => ({ where: `${project.slug}/${lesson.slug}/${step.id}`, step })),
  ),
);

describe('animace postupu – schéma odkazu', () => {
  it('přijme odkaz na stránku v /animace s kotvou i bez ní', () => {
    expect(animationLinkSchema.safeParse(animationLink('kapsa', 'B')).success).toBe(true);
    expect(animationLinkSchema.safeParse(animationLink('threadLength')).success).toBe(true);
    expect(
      lessonStepSchema.safeParse({
        id: 'krok',
        title: 'Krok',
        body: 'Text',
        media: [],
        animationLinks: [animationLink('lidBends', 'A2')],
      }).success,
    ).toBe(true);
  });

  it('krok může mít víc odkazů, ale ne prázdné pole', () => {
    const step = { id: 'krok', title: 'Krok', body: 'Text', media: [] };
    expect(
      lessonStepSchema.safeParse({
        ...step,
        animationLinks: [animationLink('pocketAttach', 'C'), animationLink('threadLength')],
      }).success,
    ).toBe(true);
    expect(lessonStepSchema.safeParse({ ...step, animationLinks: [] }).success).toBe(false);
    expect(lessonStepSchema.safeParse(step).success).toBe(true);
  });

  it.each([
    'https://example.com/animace/kapsa-postup.html',
    '/animace/kapsa-postup',
    '/animace/../index.html',
    '/projects/x/lessons/y',
    '/animace/kapsa-postup.html#',
  ])('odmítne href %s', (href) => {
    expect(animationLinkSchema.safeParse({ href, label: 'x' }).success).toBe(false);
  });

  it('odmítne odkaz bez popisku', () => {
    expect(
      animationLinkSchema.safeParse({ href: '/animace/kapsa-postup.html', label: '' }).success,
    ).toBe(false);
  });

  it('animationLink skládá odkaz na krok s číslem a názvem kroku', () => {
    expect(animationLink('pouchFold', 'B3')).toEqual({
      href: '/animace/kapsa-skladani.html#B3',
      label: 'Krok B3 – Přeložte zadní panel ohybem A',
    });
    expect(animationLinkSchema.safeParse(animationLink('snap', 'A7')).success).toBe(true);
    expect(() => animationLink('snap', 'A8')).toThrow(/nemá kotvu #A8/);
    expect(() => animationLink('pouchFold', 'F1' as 'E1')).toThrow(/nemá kotvu #F1/);
    expect(animationStepTitle('snap', 'C5')).toBe('Zkraťte jazyk 11 mm za střed kloboučku');
    expect(animationStepTitle('snap', 'C0')).toBeUndefined();
    expect(animationStepTitle('lidBends', 'A1')).toBe('Výchozí stav: rýha na rubu');
    expect(animationStepTitle('lidBends', 'B8')).toBeUndefined();
    expect(animationStepTitle('threadLength', 'A1')).toBeUndefined();
  });

  it('animationLink s vlastním popiskem ověří kotvu a popisek nahradí', () => {
    expect(animationLink('drillForm', 'C1', 'Do vrtačky')).toEqual({
      href: '/animace/vrtani-formy.html#C1',
      label: 'Do vrtačky',
    });
    expect(() => animationLink('drillForm', 'C3', 'Do vrtačky')).toThrow(/nemá kotvu #C3/);
  });

  it('animationLink skládá href s kotvou a popisek části', () => {
    expect(animationLink('kapsa', 'C')).toEqual({
      href: '/animace/kapsa-postup.html#C',
      label: 'Část C – osy a šablona na rub',
    });
    expect(animationLink('threadLength')).toEqual({
      href: '/animace/delka-nite.html',
      label: 'Kolik nitě na šev',
    });
  });
});

describe('animace postupu – stránky v public/animace', () => {
  it.each(Object.entries(animationPages))(
    '%s: soubor existuje, je samostatný a umí všechny své kotvy',
    (_, page) => {
      const source = pageSource(page.path);
      expect(source, page.path).toBeDefined();
      // Offline v PWA: žádné fonty ani skripty z cizích serverů, jen self-hostované fonty aplikace.
      expect(source).not.toMatch(/(?:src|href)\s*=\s*["']?https?:|url\(\s*["']?https?:|@import/);
      expect(source).toContain('href="/fonts/fonts.css"');
      expect(source).toMatch(/^<!doctype html>\n<html lang="cs">/);
      expect(source).toMatch(/<meta charset="utf-8"\s*\/?>/);
      expect(source).toContain('← Zpět do lekce');
      for (const anchor of Object.keys(page.sections)) {
        expect(hasAnchor(source!, anchor), `${page.path}#${anchor}`).toBe(true);
      }
    },
  );

  it('přišití kapsy: samostatná stránka s návratem do lekce a kotvami #A–#D', () => {
    const source = pageSource('/animace/kapsa-prisiti.html');
    expect(source).toBeDefined();
    expect(source).not.toMatch(/googleapis|gstatic|Instrument Sans/);
    expect(source).not.toMatch(/(?:src|href)\s*=\s*["']?https?:|url\(\s*["']?https?:|@import/);
    expect(source).toContain('<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">');
    expect(source).toContain('<a class="backlink" href="/" data-back>← Zpět do lekce</a>');
    expect(Object.keys(animationPages.pocketAttach.sections)).toEqual(['A', 'B', 'C', 'D']);
    for (const anchor of ['A', 'B', 'C', 'D']) expect(hasAnchor(source!, anchor)).toBe(true);
    expect(hasAnchor(source!, 'E')).toBe(false);
  });

  it.each([
    ['kapsa-skladani', 'pouchFold', ['A', 'B', 'C', 'D', 'E'], 'F'],
    ['kapsa-druk', 'snap', ['A', 'B', 'C', 'D'], 'E'],
    ['pas-prenos-rez', 'stripTransfer', ['A', 'B', 'C', 'D'], 'E'],
    ['pas-otvory-dna', 'bottomHoles', ['A', 'B', 'C', 'D', 'E'], 'F'],
    ['sedlarsky-steh', 'saddleStitch', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'H'],
    ['hrany', 'edges', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 'I'],
    ['pasek-prezka', 'beltBuckleEnd', ['A', 'B', 'C', 'D', 'E'], 'F'],
    ['pasek-spicka', 'beltHolesTip', ['A', 'B', 'C', 'D', 'E', 'F'], 'G'],
    ['pasek-sirka-konec', 'beltWidthTip', ['A', 'B', 'C', 'D'], 'E'],
    ['vrtani-formy', 'drillForm', ['A', 'B', 'C', 'D', 'E'], 'F'],
  ] as const)(
    '%s: samostatná stránka s favicon, návratem do lekce a kotvami svých částí',
    (name, key, anchors, missing) => {
      const source = pageSource(`/animace/${name}.html`);
      expect(source).toBeDefined();
      expect(animationPages[key].path).toBe(`/animace/${name}.html`);
      expect(source).not.toMatch(/googleapis|gstatic|Instrument Sans/);
      expect(source).not.toMatch(/(?:src|href)\s*=\s*["']?https?:|url\(\s*["']?https?:|@import/);
      expect(source).toContain('<link rel="stylesheet" href="/fonts/fonts.css">');
      expect(source).toContain('<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">');
      expect(source).toContain('<a class="backlink" href="/" data-back>← Zpět do lekce</a>');
      expect(Object.keys(animationPages[key].sections)).toEqual(anchors);
      for (const anchor of anchors) expect(hasAnchor(source!, anchor)).toBe(true);
      expect(hasAnchor(source!, missing)).toBe(false);
    },
  );

  const steppedPages = Object.entries(animationPages).flatMap(([key, page]) =>
    'steps' in page ? [{ key, path: page.path, sections: page.sections, steps: page.steps }] : [],
  );

  it('kroky mají čtyři stránky kapsy, dvě stránky pásu, sedlářský steh, hrany, šest stránek Víčka, tři stránky pásku a vrtání formy', () => {
    expect(steppedPages.map((p) => p.key)).toEqual([
      'kapsa',
      'pocketAttach',
      'pouchFold',
      'snap',
      'stripTransfer',
      'bottomHoles',
      'saddleStitch',
      'edges',
      'lidBends',
      'lidMagnet',
      'lidP1Cut',
      'lidWindows',
      'lidBackD2',
      'lidBodySides',
      'beltBuckleEnd',
      'beltHolesTip',
      'beltWidthTip',
      'drillForm',
    ]);
  });

  it.each(steppedPages)('$key: seznam kroků odpovídá stránce a umí otevřít každý krok', (page) => {
    const source = pageSource(page.path)!;
    expect(pageSteps(source)).toEqual(page.steps);
    // Části s kroky jsou jednopísmenné; stránka může mít navíc kotvu rámečku (Víčko: #vymena).
    expect(Object.keys(page.steps)).toEqual(
      Object.keys(page.sections).filter((k) => /^[A-Z]$/.test(k)),
    );
    expect(source).toContain('function stepFromHash()');
    expect(source).not.toContain('partFromHash');
    for (const [part, titles] of Object.entries<readonly string[]>(page.steps)) {
      titles.forEach((_, i) => expect(hasAnchor(source, `${part}${i + 1}`)).toBe(true));
      expect(hasAnchor(source, `${part}${titles.length + 1}`), `${part}${titles.length + 1}`).toBe(
        false,
      );
    }
  });

  it.each(['kapsa-postup', 'kapsa-prisiti', 'kapsa-skladani', 'kapsa-druk'])(
    '%s: mince 50 Kč je měděné mezikruží a mosazný střed Ø 17',
    (name) => {
      const source = pageSource(`/animace/${name}.html`)!;
      expect(source).toContain('--coin-o:#c4683f;--coin-o-d:#7a3a1c;--coin-i:#dcb94f;');
      expect(source).not.toContain('#c3c7cb');
    },
  );
});

describe('animace postupu – odkazy z lekcí', () => {
  const links = allSteps.flatMap(({ where, step }) =>
    (step.animationLinks ?? []).map((link) => ({ where, href: link.href })),
  );

  it('všechny projekty s odkazy na animace odpovídají schématu', () => {
    for (const project of projects) {
      const result = projectDefinitionSchema.safeParse(project);
      expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
    }
  });

  it('každý odkaz míří na existující stránku a existující kotvu', () => {
    expect(links.length).toBeGreaterThan(0);
    for (const { where, href } of links) {
      const source = pageSource(href);
      expect(source, `${where}: ${href}`).toBeDefined();
      const anchor = href.split('#')[1];
      if (anchor) expect(hasAnchor(source!, anchor), `${where}: ${href}`).toBe(true);
    }
  });

  it('kroky lekcí 2 a 6 pouzdra s mincí otevírají správné kroky animace kapsy', () => {
    const hrefs = Object.fromEntries(
      allSteps
        .filter(({ where, step }) => where.startsWith('coin-card-holder/') && step.animationLinks)
        .map(({ where, step }) => [
          where.split('/').slice(1).join('/'),
          step.animationLinks!.map((l) => l.href),
        ]),
    );
    const kapsa = (anchor: string) => [`/animace/kapsa-postup.html#${anchor}`];
    const lessonOf = (n: number) =>
      projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!.slug;
    expect(hrefs).toMatchObject({
      [`${lessonOf(2)}/drill-form`]: [
        ...kapsa('A1'),
        '/animace/vrtani-formy.html#B1',
        '/animace/vrtani-formy.html#C1',
        '/animace/vrtani-formy.html#D1',
        '/animace/vrtani-formy.html#E1',
      ],
      [`${lessonOf(2)}/mark-outline`]: kapsa('B1'),
      [`${lessonOf(2)}/wet`]: kapsa('D1'),
      [`${lessonOf(2)}/press-and-clamp`]: kapsa('D2'),
      [`${lessonOf(2)}/dry-and-inspect`]: kapsa('D4'),
      [`${lessonOf(2)}/test-window-retention`]: kapsa('E1'),
      [`${lessonOf(6)}/trace-and-punch-pocket`]: kapsa('B1'),
      [`${lessonOf(6)}/form-dimple`]: kapsa('D1'),
      [`${lessonOf(6)}/cut-outline-and-window`]: kapsa('E1'),
    });
  });

  it('kroky lekcí 5 a 6 pouzdra s mincí otevírají správné kroky animace přišití kapsy', () => {
    const lessonOf = (n: number) =>
      projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!;
    const hrefOf = (n: number, stepId: string) =>
      lessonOf(n)
        .steps.find((s) => s.id === stepId)
        ?.animationLinks?.map((l) => l.href);
    const prisiti = (anchor: string) => `/animace/kapsa-prisiti.html#${anchor}`;
    // Všechny značky pásu ukazuje přenos pásu; rohy kapsy podrobně přišití kapsy.
    expect(hrefOf(5, 'transfer-marks-awl')).toEqual([
      '/animace/pas-prenos-rez.html#A3',
      prisiti('A2'),
    ]);
    expect(hrefOf(6, 'glue-pocket')).toEqual([prisiti('B1'), prisiti('B2')]);
    // Přišití kapsy: animace prosekání a šití a hned vedle návod, kolik nitě odměřit.
    expect(hrefOf(6, 'stitch-pocket')).toEqual([
      prisiti('C1'),
      '/animace/sedlarsky-steh.html#D1',
      '/animace/sedlarsky-steh.html#E2',
      animationPages.threadLength.path,
    ]);
  });
});

describe('animace postupu – složení pouzdra a druk v lekcích', () => {
  const lessonOf = (n: number) =>
    projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!;
  const hrefOf = (n: number, stepId: string) =>
    lessonOf(n)
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const skladani = (anchor: string) => `/animace/kapsa-skladani.html#${anchor}`;
  const druk = (anchor: string) => `/animace/kapsa-druk.html#${anchor}`;
  const thread = animationPages.threadLength.path;

  it('lekce 4 a 7: ohyby, lepení dna a šev otevírají přesný krok skládání', () => {
    expect(hrefOf(4, 'wet-fold-zones')).toEqual([skladani('B1')]);
    expect(hrefOf(4, 'fold-around-content')).toEqual([
      skladani('B2'),
      '/animace/pas-otvory-dna.html#E2',
    ]);
    expect(hrefOf(4, 'unfold-roughen-glue')).toEqual([skladani('C1')]);
    // Odřezek má krátký šev: krok šití, ne výpočet nitě pro šev dna 64 mm.
    expect(hrefOf(4, 'stitch-through-layers')).toEqual([
      skladani('D2'),
      '/animace/sedlarsky-steh.html#E2',
      '/animace/sedlarsky-steh.html#G2',
      thread,
    ]);
    // Skládání A2 popisuje už proseknutý finální pás; tečky proužku ukazuje stránka otvorů dna.
    expect(hrefOf(4, 'mark-mirrored-dots')).toEqual([
      '/animace/pas-otvory-dna.html#E1',
      '/animace/pas-otvory-dna.html#A2',
    ]);
    expect(hrefOf(7, 'wet-fold-zones')).toEqual([skladani('B1')]);
    expect(hrefOf(7, 'fold-inner-b')).toEqual([skladani('B2')]);
    expect(hrefOf(7, 'fold-back-a')).toEqual([skladani('B3')]);
    expect(hrefOf(7, 'press-and-clamp')).toEqual([skladani('B4')]);
    expect(hrefOf(7, 'roughen-and-glue-bottom')).toEqual([skladani('C1')]);
    // Krok lekce je šití dna (D2); nit k němu ukazuje návod „Kolik nitě na šev“, D1 je hned před ním.
    expect(hrefOf(7, 'stitch-bottom')).toEqual([
      skladani('D2'),
      '/animace/sedlarsky-steh.html#E2',
      thread,
    ]);
  });

  it('lekce 3, 6 a 8: každý krok druku otevírá svůj krok animace', () => {
    expect(hrefOf(3, 'why-scrap-first')).toEqual([druk('A1')]);
    expect(hrefOf(3, 'punch-post-hole')).toEqual([druk('A2')]);
    expect(hrefOf(3, 'set-snap-post')).toEqual([druk('A4')]);
    expect(hrefOf(3, 'practice-snap-cap')).toEqual([druk('A5')]);
    expect(hrefOf(3, 'measure-flange')).toEqual([druk('A7')]);
    expect(hrefOf(6, 'punch-post-hole')).toEqual([druk('B2')]);
    expect(hrefOf(6, 'set-snap-post')).toEqual([druk('B3')]);
    expect(hrefOf(8, 'insert-content')).toEqual([druk('C1')]);
    expect(hrefOf(8, 'imprint-cap-position')).toEqual([druk('C2')]);
    expect(hrefOf(8, 'punch-cap-hole')).toEqual([druk('C3')]);
    expect(hrefOf(8, 'set-cap')).toEqual([druk('C4')]);
    expect(hrefOf(8, 'shorten-tongue')).toEqual([druk('C5')]);
  });

  it('pouzdro s mincí odkazuje na kapsu jen kotvou kroku, ne celé části', () => {
    const coin = allSteps.filter(({ where }) => where.startsWith('coin-card-holder/'));
    for (const { where, step } of coin) {
      for (const { href } of step.animationLinks ?? []) {
        if (href.includes('#')) expect(href, where).toMatch(/#[A-G][1-9][0-9]*$/);
      }
    }
  });
});

describe('animace postupu – přenos, řez a otvory dna pásu v lekcích 4 a 5', () => {
  const lessonOf = (n: number) =>
    projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!;
  const hrefOf = (n: number, stepId: string) =>
    lessonOf(n)
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const prenos = (anchor: string) => `/animace/pas-prenos-rez.html#${anchor}`;
  const otvory = (anchor: string) => `/animace/pas-otvory-dna.html#${anchor}`;

  it.each([
    // Lekce 4: proužek se přenáší a řeže stejně jako pás, otvory proužku ukazuje část E.
    [4, 'cut-practice-strip', [prenos('A2'), prenos('A3'), prenos('B1'), prenos('D3')]],
    [4, 'punch-flat', [otvory('E1'), otvory('A3'), otvory('D2')]],
    // Lekce 5: každý krok přenosu, řezu, čar ohybů a otvorů dna.
    [5, 'transfer-face', [prenos('A2'), prenos('A1')]],
    [5, 'cut-strip', [prenos('B1'), prenos('C1'), prenos('C2'), prenos('C3'), prenos('B3')]],
    [5, 'peel-template', [prenos('D1')]],
    [5, 'draw-fold-lines', [prenos('D3'), prenos('D2')]],
    [5, 'punch-bottom-holes', [otvory('B1'), otvory('C1'), otvory('D1'), otvory('D2')]],
  ] as const)('lekce %i, krok %s', (order, stepId, expected) => {
    expect(hrefOf(order, stepId)).toEqual(expected);
  });

  it('popisky tlačítek nesou číslo a název kroku stránky', () => {
    expect(animationLink('stripTransfer', 'D3')).toEqual({
      href: prenos('D3'),
      label: 'Krok D3 – Spojte konce čar tužkou podle pravítka',
    });
    expect(animationLink('bottomHoles', 'E1').label).toBe(
      'Krok E1 – Prosekejte cvičný proužek stejně',
    );
    expect(() => animationLink('stripTransfer', 'D5')).toThrow(/nemá kotvu #D5/);
    expect(() => animationLink('bottomHoles', 'D3')).toThrow(/nemá kotvu #D3/);
    expect(animationButtonText(prenos('B1'))).toBe('Animace postupu');
  });
});

describe('animace postupu – sedlářský steh a hrany ve všech projektech', () => {
  const hrefsOf = (projectSlug: string, order: number, stepId: string) =>
    projects
      .find((p) => p.slug === projectSlug)!
      .lessons.find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const steh = (anchor: string) => `/animace/sedlarsky-steh.html#${anchor}`;
  const hrany = (anchor: string) => `/animace/hrany.html#${anchor}`;
  const magnet = (anchor: string) => `/animace/vicko-magnet.html#${anchor}`;
  const okenka = (...a: string[]) => a.map((x) => `/animace/vicko-okenka.html#${x}`);
  const zada = (...a: string[]) => a.map((x) => `/animace/vicko-d2-zada.html#${x}`);
  const telo = (...a: string[]) => a.map((x) => `/animace/vicko-telo-s4s5.html#${x}`);
  const thread = animationPages.threadLength.path;

  it.each([
    // Projekt 01: navlékání, uchycení, steh, ukončení, kontrola, šití pouzdra a hrany.
    ['card-holder', 1, 'thread-needles', [steh('A1')]],
    ['card-holder', 4, 'hold-work', [steh('B1')]],
    ['card-holder', 4, 'start-stitch', [steh('C1'), thread]],
    ['card-holder', 4, 'stitch-rhythm', [steh('D1')]],
    ['card-holder', 4, 'finish-stitch', [steh('E1'), steh('F1')]],
    ['card-holder', 4, 'compare', [steh('G1')]],
    ['card-holder', 6, 'stitch', [steh('E2'), steh('F2'), steh('F3')]],
    ['card-holder', 6, 'edges', [hrany('A2'), hrany('D1')]],
    // Projekt 02: steh a hrany lekcí 4–8 (šev dna a kapsa ověřují testy výše).
    ['coin-card-holder', 4, 'saddle-stitch-reminder', [steh('D1')]],
    ['coin-card-holder', 4, 'try-edge-paint', [hrany('C1'), hrany('D1')]],
    ['coin-card-holder', 5, 'dye-burnish-and-seal', [hrany('F1')]],
    ['coin-card-holder', 6, 'dye-burnish-pocket-edges', [hrany('F2')]],
    ['coin-card-holder', 8, 'sand-flat-bottom', [hrany('F3'), hrany('B1')]],
    ['coin-card-holder', 8, 'dye-and-burnish-edges', [hrany('F3'), hrany('C1')]],
    // Projekt 03: všechny švy (konce 2 otvory zpět) a hrany.
    ['lid-wallet', 5, 'd2-edge', [hrany('G4')]],
    ['lid-wallet', 5, 'coin-windows', [...okenka('A2', 'A3', 'A4', 'A5'), hrany('G4')]],
    ['lid-wallet', 5, 'edges', [hrany('G1')]],
    ['lid-wallet', 5, 'd1-paint', [hrany('G2')]],
    ['lid-wallet', 5, 'tokonole', [hrany('G2')]],
    ['lid-wallet', 6, 'bill-window', [...okenka('C2', 'C3', 'C4', 'C5'), hrany('G4')]],
    ['lid-wallet', 6, 'stitch-s1-s3', [...zada('D1', 'D2', 'D3', 'D4'), steh('E2'), thread]],
    ['lid-wallet', 8, 's6', [steh('E2'), thread]],
    [
      'lid-wallet',
      9,
      'punch-sew',
      [...telo('D1', 'D2', 'D3', 'D4', 'E2', 'E4'), steh('E2'), thread],
    ],
    ['lid-wallet', 9, 'edges', [hrany('G3')]],
    ['lid-wallet', 11, 'trim-tip', [magnet('B8'), magnet('B9'), hrany('G4')]],
    ['lid-wallet', 11, 's7', [steh('E2'), magnet('B10'), magnet('B11'), thread, hrany('G4')]],
    // Výměna magnetu ušije S7 znovu a hrany jazýčku dokončí stejně jako lekce 11.
    ['lid-wallet', 12, 'magnet-swap', [magnet('vymena'), steh('E2'), thread, hrany('G4')]],
  ] as const)('%s lekce %i, krok %s', (projectSlug, order, stepId, expected) => {
    expect(hrefsOf(projectSlug, order, stepId)).toEqual(expected);
  });

  it('každý šev Víčka (S1–S7) odkazuje na sedlářský steh', () => {
    const lid = allSteps.filter(({ where }) => where.startsWith('lid-wallet/'));
    const seams = lid.filter(({ step }) => step.body.includes('sedlovým stehem'));
    expect(seams.length).toBeGreaterThanOrEqual(3);
    // Přesný krok švu ze stránky Víčka může být před ním, sedlářský steh ale nechybí nikde.
    for (const { where, step } of seams) {
      expect(
        step.animationLinks?.some((l) => l.href.startsWith('/animace/sedlarsky-steh.html#')),
        where,
      ).toBe(true);
    }
  });
});

describe('animace postupu – magnet Víčka v lekcích 8, 11 a 12', () => {
  const hrefsOf = (order: number, stepId: string) =>
    projects
      .find((p) => p.slug === 'lid-wallet')!
      .lessons.find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href)
      .filter((href) => href.startsWith('/animace/vicko-magnet.html'));
  const magnet = (anchor: string) => `/animace/vicko-magnet.html#${anchor}`;

  it.each([
    [8, 'g1', [magnet('A1'), magnet('A2')]],
    [8, 'g2', [magnet('A3'), magnet('A4')]],
    [8, 'check-d1', [magnet('A5')]],
    [11, 'find-plate', [magnet('B1')]],
    [11, 'magnet-dry-test', [magnet('B2')]],
    [11, 'epoxy', [magnet('B3'), magnet('B4')]],
    [11, 'lining', [magnet('B5'), magnet('B6')]],
    [11, 'cure', [magnet('B7')]],
    [11, 'trim-tip', [magnet('B8'), magnet('B9')]],
    [11, 's7', [magnet('B10'), magnet('B11')]],
    [12, 'magnet-swap', [magnet('vymena')]],
  ] as const)('lekce %i, krok %s otevírá přesný krok animace', (order, stepId, expected) => {
    expect(hrefsOf(order, stepId)).toEqual(expected);
  });

  it('stará kotva #anim-… zůstává na stránce jako alias části a #vymena jako rámeček', () => {
    const source = pageSource(animationPages.lidMagnet.path)!;
    expect(source).toContain(`const PARTS={A:'anim-plisek',B:'anim-magnet'};`);
    expect(source).toContain('id="anim-plisek"');
    expect(source).toContain('id="anim-magnet"');
    expect(source).toContain('id="vymena"');
    expect(source).toContain('<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">');
    expect(animationLink('lidMagnet', 'B7')).toEqual({
      href: magnet('B7'),
      label: 'Krok B7 – Nechte 24 h vytvrdit',
    });
    expect(() => animationLink('lidMagnet', 'B13')).toThrow(/nemá kotvu #B13/);
    expect(() => animationLink('lidMagnet', 'A7')).toThrow(/nemá kotvu #A7/);
  });

  it('stránka nepoužívá čísla kroků zadání místo lekcí', () => {
    const source = pageSource(animationPages.lidMagnet.path)!;
    expect(source).not.toMatch(/\(krok(y)? 1[1-9]|krok(y)? 2[0-3]\b|5min/);
  });
});

describe('animationButtonText', () => {
  it('pojmenuje návod na délku nitě, steh a hrany jinak než animace', () => {
    expect(animationButtonText(animationPages.threadLength.path)).toBe('Jak odměřit nit');
    expect(animationButtonText(`${animationPages.kapsa.path}#B`)).toBe('Animace postupu');
    expect(animationButtonText(`${animationPages.saddleStitch.path}#D1`)).toBe(
      'Jak šít sedlářský steh',
    );
    expect(animationButtonText(`${animationPages.edges.path}#G4`)).toBe('Jak na hrany');
    expect(animationButtonText(animationPages.edges.path)).toBe('Jak na hrany');
  });
});

describe('animace postupu – ohyby Víčka v lekcích 5, 7 a 10', () => {
  const hrefsOf = (order: number, stepId: string) =>
    projects
      .find((p) => p.slug === 'lid-wallet')!
      .lessons.find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const ohyby = (anchor: string) => `/animace/vicko-ohyby.html#${anchor}`;

  it.each([
    [5, 'crease', ['A1']],
    [7, 'wet', ['A2', 'A3']],
    [7, 'place-spacer', ['A4']],
    [7, 'fold-clamp', ['A5', 'A6', 'A7', 'A8', 'A9']],
    [7, 'remove-spacer', ['A10']],
    [10, 'contents-b', ['B1']],
    [10, 'wet-close', ['B2', 'B3']],
    [10, 'overnight', ['B4', 'B5']],
    [10, 'lid-behaviour', ['B6', 'B7']],
  ] as const)('lekce %i, krok %s otevře kroky %j', (order, stepId, anchors) => {
    expect(hrefsOf(order, stepId)).toEqual(anchors.map(ohyby));
  });

  it('stránka ohybů bere staré kotvy #anim-dno a #anim-zaves jako části A a B', () => {
    const source = pageSource('/animace/vicko-ohyby.html')!;
    expect(source).toContain("const PARTS={A:'anim-dno',B:'anim-zaves'}");
    expect(source).toContain('id="anim-dno"');
    expect(source).toContain('id="anim-zaves"');
    expect(source).toContain('<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">');
    expect(source).toContain('<a class="backlink" href="/" data-back>← Zpět do lekce</a>');
  });

  it('závěs v animaci odpovídá lekci 10: obsah stavu B, fólie, lehká zátěž, bez kopyta', () => {
    const source = pageSource('/animace/vicko-ohyby.html')!;
    expect(source).toContain('papír asi 70 × 65');
    expect(source).toContain('Mezi vlhký závěs a knihu dejte potravinovou fólii');
    expect(source).toContain('kniha (lehká zátěž)');
    expect(source).toContain('Kopyto ani opěrka nejsou potřeba');
    expect(source).toContain('nepřeklápějte až na záda');
    expect(source).not.toMatch(
      /2–3 karty|pár bankovek|padá dozadu|nepokračovat|Záloha B \(|lidWalletLayout/,
    );
  });
});

describe('animace postupu – přenos P1, okénka, D2 na záda a boční švy Víčka', () => {
  const lid = projects.find((p) => p.slug === 'lid-wallet')!;
  const hrefsOf = (order: number, stepId: string) =>
    lid.lessons
      .find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const at = (page: string) => (anchor: string) => `/animace/${page}.html#${anchor}`;
  const rez = at('vicko-p1-rez');
  const okenka = at('vicko-okenka');
  const zada = at('vicko-d2-zada');
  const telo = at('vicko-telo-s4s5');
  const steh = at('sedlarsky-steh');
  const hrany = at('hrany');
  const thread = animationPages.threadLength.path;

  it.each([
    ['vicko-p1-rez', 'lidP1Cut', ['A', 'B', 'C', 'D', 'E'], 'F'],
    ['vicko-okenka', 'lidWindows', ['A', 'B', 'C', 'D'], 'E'],
    ['vicko-d2-zada', 'lidBackD2', ['A', 'B', 'C', 'D'], 'E'],
    ['vicko-telo-s4s5', 'lidBodySides', ['A', 'B', 'C', 'D', 'E'], 'F'],
  ] as const)(
    '%s: samostatná stránka s favicon, fonty aplikace, návratem do lekce a kotvami částí',
    (name, key, anchors, missing) => {
      const source = pageSource(`/animace/${name}.html`);
      expect(source).toBeDefined();
      expect(animationPages[key].path).toBe(`/animace/${name}.html`);
      expect(source).not.toMatch(/googleapis|gstatic|Instrument Sans/);
      expect(source).not.toMatch(/(?:src|href)\s*=\s*["']?https?:|url\(\s*["']?https?:|@import/);
      expect(source).not.toMatch(/<script[^>]*\ssrc=/);
      expect(source).toMatch(/<link rel="stylesheet" href="\/fonts\/fonts\.css"\s*\/?>/);
      expect(source).toMatch(
        /<link rel="icon" type="image\/svg\+xml" href="\/icons\/favicon\.svg"\s*\/?>/,
      );
      expect(source).toContain('<a class="backlink" href="/" data-back>← Zpět do lekce</a>');
      expect(Object.keys(animationPages[key].sections)).toEqual(anchors);
      for (const anchor of anchors) expect(hasAnchor(source!, anchor)).toBe(true);
      expect(hasAnchor(source!, missing)).toBe(false);
    },
  );

  it.each([
    // Lekce 4: přenos listu 1, propíchnutí, řez P1, sejmutí listu a značení rubu.
    [4, 'tape-sheet-1', [rez('A1'), rez('A2')]],
    [4, 'prick-p1', [rez('B1'), rez('B2')]],
    [4, 'cut-p1', [rez('C1'), rez('C2'), rez('C3'), rez('C4'), rez('C5'), rez('C6')]],
    [4, 'peel-p1', [rez('D1'), rez('D2')]],
    [4, 'mark-back', [rez('E1'), rez('E2'), rez('E3'), rez('E4'), rez('E5')]],
    // Lekce 5: okénka mincí a výřez pro palec; hrany až za nimi.
    [5, 'coin-windows', [okenka('A2'), okenka('A3'), okenka('A4'), okenka('A5'), hrany('G4')]],
    [5, 'thumb-notch', [okenka('B2'), okenka('B3'), okenka('B4'), okenka('B5'), okenka('D2')]],
    // Lekce 6: G3, okénko bankovek, značení a šití S1–S3.
    [6, 'g3', [zada('A1'), zada('A2'), zada('A3'), zada('A4'), zada('A5'), zada('A6')]],
    [6, 'bill-window', [okenka('C2'), okenka('C3'), okenka('C4'), okenka('C5'), hrany('G4')]],
    [6, 'mark-s1-s3', [zada('C1'), zada('C2'), zada('C3'), zada('C4')]],
    [6, 'stitch-s1-s3', [zada('D1'), zada('D2'), zada('D3'), zada('D4'), steh('E2'), thread]],
    // Lekce 9: nanečisto, G4, čára a otvory S4/S5, děrování a šití boků.
    [9, 'dry-fit', [telo('A2')]],
    [9, 'g4', [telo('B1'), telo('B2'), telo('B3'), telo('B4')]],
    [9, 'mark-side', [telo('C1'), telo('C2')]],
    [
      9,
      'punch-sew',
      [telo('D1'), telo('D2'), telo('D3'), telo('D4'), telo('E2'), telo('E4'), steh('E2'), thread],
    ],
  ] as const)('lekce %i, krok %s otevírá přesné kroky animace', (order, stepId, expected) => {
    expect(hrefsOf(order, stepId)).toEqual(expected);
  });

  it('popisky tlačítek nesou číslo a název kroku stránky', () => {
    expect(animationLink('lidP1Cut', 'C1')).toEqual({
      href: rez('C1'),
      label: 'Krok C1 – Vysekněte napojení jazýčku Ø 8',
    });
    expect(animationLink('lidWindows', 'B3').label).toBe('Krok B3 – Vysekněte Ø 10 přes šablonu');
    expect(animationLink('lidBackD2', 'D4').label).toBe(
      'Krok D4 – Šijte sedlovým stehem, konce 2 otvory zpět',
    );
    expect(animationLink('lidBodySides', 'E4').label).toBe('Krok E4 – Steh 60–64 zdvojte');
    expect(animationLink('lidBackD2', 'C3').label).toBe(
      'Krok C3 – Způsob (b): propíchněte konce čar',
    );
    expect(animationLink('lidBodySides', 'D3').label).toBe('Krok D3 – Děrujte y 56–68 po jednom');
    expect(() => animationLink('lidP1Cut', 'C7')).toThrow(/nemá kotvu #C7/);
    expect(() => animationLink('lidWindows', 'D4')).toThrow(/nemá kotvu #D4/);
    expect(() => animationLink('lidBackD2', 'B4')).toThrow(/nemá kotvu #B4/);
    expect(() => animationLink('lidBodySides', 'C3')).toThrow(/nemá kotvu #C3/);
    expect(animationButtonText(okenka('A2'))).toBe('Animace postupu');
  });
});

describe('animace postupu – pásek: konec s přezkou, dírky a špička', () => {
  const belt = projects.find((p) => p.slug === 'belt')!;
  const hrefsOf = (order: number, stepId: string) =>
    belt.lessons
      .find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const at = (page: string) => (anchor: string) => `/animace/${page}.html#${anchor}`;
  const prezka = at('pasek-prezka');
  const spicka = at('pasek-spicka');
  const hrany = at('hrany');
  const sirka = at('pasek-sirka-konec');

  it.each([
    // Lekce 1: šířka a konec – přezka, konec, destička a zadání ve „Váš pásek“.
    [1, 'width-and-tip', [sirka('A1'), sirka('B1'), sirka('C1'), sirka('D1')]],
    // Lekce 2: odřezek – značení, výsek, hrana, ohyb a zkouška nýtu.
    [2, 'mark', [prezka('B1'), prezka('B2')]],
    [2, 'punch', [prezka('C2'), prezka('C3')]],
    // Hrany pásku: vlastní část H (jedna vrstva 3–4 mm z líce i rubu), ne B2 Víčka.
    [2, 'edges-balm', [hrany('H1'), hrany('H2')]],
    [2, 'bend', [prezka('E1')]],
    [2, 'screw', [prezka('E3'), prezka('E4'), prezka('E6')]],
    // Lekce 3: dlouhé hrany.
    [3, 'bevel', [hrany('H1')]],
    [3, 'burnish', [hrany('H2'), hrany('D1'), hrany('D3')]],
    // Lekce 4: konec s přezkou.
    [4, 'plate-or-sheet', [prezka('A1'), prezka('A2')]],
    [4, 'secure', [prezka('B1')]],
    [4, 'mark', [prezka('B2'), prezka('B3'), prezka('B4'), prezka('B5'), prezka('B6')]],
    [4, 'first-pair', [prezka('C1')]],
    [4, 'oval', [prezka('C2'), prezka('C3'), prezka('C4')]],
    // Poutko se navléká před ohnutím (smyčka kolem obou vrstev, opasek-postup.md krok 7).
    [4, 'keeper', [prezka('D1'), prezka('D2')]],
    [4, 'bend', [prezka('D3'), prezka('E1')]],
    [4, 'second-pair', [prezka('E2'), prezka('E3')]],
    [4, 'screws', [prezka('E4'), prezka('E5'), prezka('E6'), prezka('E7')]],
    // Lekce 5: zkouška na těle.
    [5, 'try-on', [spicka('A1')]],
    [5, 'measure', [spicka('A2')]],
    [5, 'transfer', [spicka('A3')]],
    [5, 'length-check', [spicka('A4')]],
    // Lekce 6: dírky a konec.
    [6, 'row', [spicka('B1'), spicka('D1')]],
    [6, 'place', [spicka('B2'), spicka('C1'), spicka('D2')]],
    [6, 'mark', [spicka('B3'), spicka('C2'), spicka('D2')]],
    [6, 'punch-holes', [spicka('E1')]],
    [6, 'cut-tip', [spicka('E2'), spicka('E3'), spicka('E4')]],
    [6, 'finish', [spicka('F1'), spicka('F2'), hrany('H1'), hrany('H2')]],
    [6, 'try', [spicka('F3')]],
  ] as const)('lekce %i, krok %s otevírá přesné kroky animace', (order, stepId, expected) => {
    expect(hrefsOf(order, stepId)).toEqual(expected);
  });

  it('lekce 2: kroky, které kreslí poutko a celý konec pásku, říkají, že jde o pásek', () => {
    const labelsOf = (stepId: string) =>
      belt.lessons
        .find((l) => l.order === 2)!
        .steps.find((s) => s.id === stepId)
        ?.animationLinks?.map((l) => l.label);
    expect(labelsOf('mark')).toEqual([
      'Krok B1 – Upevněte pás a destičku',
      'Krok B2 – Přiložte řadu 3',
    ]);
    expect(labelsOf('punch')).toEqual(['Krok C2 – Konce oválu Ø 6', 'Krok C3 – Boky oválu nožem']);
    expect(labelsOf('bend')).toEqual([
      'Krok E1 – Ohněte konec kolem příčky (na pásku, poutko až v lekci 4)',
    ]);
    expect(labelsOf('screw')).toEqual([
      'Krok E3 – Označte druhou dvojici skrz otvory (na pásku, poutko až v lekci 4)',
      'Krok E4 – Vysekněte druhou dvojici (na pásku, poutko až v lekci 4)',
      'Krok E6 – Sešroubujte nýty (na pásku, poutko až v lekci 4)',
    ]);
    // Popisek začíná názvem kroku v animaci, ať odkaz říká, kam vede.
    for (const step of belt.lessons.find((l) => l.order === 2)!.steps) {
      for (const link of step.animationLinks ?? []) {
        if (!link.href.startsWith('/animace/pasek-prezka.html#')) continue;
        const anchor = link.href.split('#')[1] as 'E1';
        expect(link.label.startsWith(animationLink('beltBuckleEnd', anchor).label)).toBe(true);
      }
    }
  });

  it('každý krok lekcí 4–6 má odkaz na animaci', () => {
    for (const lesson of belt.lessons.filter((l) => l.order >= 4)) {
      for (const step of lesson.steps) {
        expect(step.animationLinks?.length ?? 0, `${lesson.order}/${step.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('popisky tlačítek nesou číslo a název kroku stránky', () => {
    expect(animationLink('beltBuckleEnd', 'E3')).toEqual({
      href: prezka('E3'),
      label: 'Krok E3 – Označte druhou dvojici skrz otvory',
    });
    expect(animationLink('beltHolesTip', 'E3').label).toBe('Krok E3 – Uřízněte vrchol R4');
    expect(() => animationLink('beltBuckleEnd', 'A3')).toThrow(/nemá kotvu #A3/);
    expect(() => animationLink('beltBuckleEnd', 'E8')).toThrow(/nemá kotvu #E8/);
    expect(() => animationLink('beltHolesTip', 'C3')).toThrow(/nemá kotvu #C3/);
    expect(animationButtonText(spicka('F1'))).toBe('Animace postupu');
  });

  it('lekce 1: odkazy na šířku a konec nesou číslo a název kroku animace', () => {
    const links = belt.lessons
      .find((l) => l.order === 1)!
      .steps.find((s) => s.id === 'width-and-tip')!.animationLinks!;
    expect(links.map((l) => l.label)).toEqual([
      'Krok A1 – Velikost přezky = vnitřní světlost',
      'Krok B1 – Hrot, nebo zaoblený',
      'Krok C1 – Co umí destička',
      'Krok D1 – Zadejte šířku a konec ve „Váš pásek“',
    ]);
  });

  it('šířka a konec: část D ukazuje stránku „Váš pásek“, ne zápisník', () => {
    const source = pageSource(animationPages.beltWidthTip.path)!;
    expect(source).not.toMatch(/zápisník|Zapište/);
    for (const text of ['Šířka = přezka, mm', 'Destička: ano', 'Destička: jen řada 3', 'Koupit']) {
      expect(source).toContain(text);
    }
  });

  it('stránky odkazují na čísla v tabulce „Váš pásek“, kresba je jen příklad', () => {
    for (const path of [
      animationPages.beltBuckleEnd.path,
      animationPages.beltHolesTip.path,
      animationPages.beltWidthTip.path,
    ]) {
      const source = pageSource(path)!;
      expect(source).toContain('„Váš pásek“');
      expect(source).toMatch(/Příklad pro 40 mm|příklad 40 × 3,5 mm/);
    }
  });
});
