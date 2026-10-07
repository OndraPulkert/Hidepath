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

/** Kroky stránky po částech v pořadí `add('B','název',…)` – tak je stránka čísluje (B1, B2…). */
function pageSteps(source: string): Record<string, string[]> {
  const steps: Record<string, string[]> = {};
  for (const [, part, title] of source.matchAll(/\badd\('([A-Z])','([^']*)'/g)) {
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
  const parts = /const PARTS=\{([^}]*)\}/.exec(source)?.[1] ?? '';
  const step = /^([A-Z])([1-9][0-9]*)$/.exec(anchor);
  if (step) {
    return (
      source.includes('function stepFromHash()') &&
      new RegExp(`(^|,)${step[1]}:`).test(parts) &&
      (pageSteps(source)[step[1]!]?.length ?? 0) >= Number(step[2])
    );
  }
  return new RegExp(`(^|,)${anchor}:`).test(parts);
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
        animationLinks: [animationLink('lidBends', 'anim-dno')],
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
      label: 'Krok B3 – Bankovky na líc vnitřního, zadní ohybem A přes všechno',
    });
    expect(animationLinkSchema.safeParse(animationLink('snap', 'A7')).success).toBe(true);
    expect(() => animationLink('snap', 'A8')).toThrow(/nemá kotvu #A8/);
    expect(() => animationLink('pouchFold', 'F1' as 'E1')).toThrow(/nemá kotvu #F1/);
    expect(animationStepTitle('snap', 'C5')).toBe('Zkraťte jazyk 11 mm za střed kloboučku');
    expect(animationStepTitle('snap', 'C0')).toBeUndefined();
    expect(animationStepTitle('lidBends', 'A1')).toBeUndefined();
  });

  it('animationLink skládá href s kotvou a popisek části', () => {
    expect(animationLink('kapsa', 'C')).toEqual({
      href: '/animace/kapsa-postup.html#C',
      label: 'Část C – osy a 2. výtisk na rub',
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
      expect(source).toContain('<meta charset="utf-8">');
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
    ['sedlarsky-steh', 'saddleStitch', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'H'],
    ['hrany', 'edges', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'H'],
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

  it('kroky mají čtyři stránky kapsy, sedlářský steh a hrany', () => {
    expect(steppedPages.map((p) => p.key)).toEqual([
      'kapsa',
      'pocketAttach',
      'pouchFold',
      'snap',
      'saddleStitch',
      'edges',
    ]);
  });

  it.each(steppedPages)('$key: seznam kroků odpovídá stránce a umí otevřít každý krok', (page) => {
    const source = pageSource(page.path)!;
    expect(pageSteps(source)).toEqual(page.steps);
    expect(Object.keys(page.steps)).toEqual(Object.keys(page.sections));
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
      [`${lessonOf(2)}/drill-form`]: kapsa('A1'),
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
    expect(hrefOf(5, 'transfer-marks-awl')).toEqual([prisiti('A2')]);
    expect(hrefOf(6, 'glue-pocket')).toEqual([prisiti('B2')]);
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
    expect(hrefOf(4, 'fold-around-content')).toEqual([skladani('B2')]);
    expect(hrefOf(4, 'unfold-roughen-glue')).toEqual([skladani('C1')]);
    // Odřezek má krátký šev: krok šití, ne výpočet nitě pro šev dna 64 mm.
    expect(hrefOf(4, 'stitch-through-layers')).toEqual([
      skladani('D2'),
      '/animace/sedlarsky-steh.html#E2',
      '/animace/sedlarsky-steh.html#G2',
      thread,
    ]);
    // A2 popisuje už proseknutý finální pás (lekce 5, 17 otvorů), ne značení na odřezku.
    expect(hrefOf(4, 'mark-mirrored-dots')).toBeUndefined();
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

describe('animace postupu – sedlářský steh a hrany ve všech projektech', () => {
  const hrefsOf = (projectSlug: string, order: number, stepId: string) =>
    projects
      .find((p) => p.slug === projectSlug)!
      .lessons.find((l) => l.order === order)!
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const steh = (anchor: string) => `/animace/sedlarsky-steh.html#${anchor}`;
  const hrany = (anchor: string) => `/animace/hrany.html#${anchor}`;
  const thread = animationPages.threadLength.path;

  it.each([
    // Projekt 01: navlékání, uchycení, steh, ukončení, kontrola, šití pouzdra a hrany.
    ['card-holder', 1, 'thread-needles', [steh('A1')]],
    ['card-holder', 4, 'hold-work', [steh('B1')]],
    ['card-holder', 4, 'start-stitch', [steh('C1'), thread]],
    ['card-holder', 4, 'stitch-rhythm', [steh('D1')]],
    ['card-holder', 4, 'finish-stitch', [steh('E1'), steh('F1')]],
    ['card-holder', 4, 'compare', [steh('G1')]],
    ['card-holder', 6, 'stitch', [steh('E2'), steh('F2')]],
    ['card-holder', 6, 'edges', [hrany('A2'), hrany('D1')]],
    // Projekt 02: steh a hrany lekcí 4–8 (šev dna a kapsa ověřují testy výše).
    ['coin-card-holder', 4, 'saddle-stitch-reminder', [steh('D1')]],
    ['coin-card-holder', 5, 'dye-burnish-and-seal', [hrany('F1')]],
    ['coin-card-holder', 6, 'dye-burnish-pocket-edges', [hrany('F2')]],
    ['coin-card-holder', 8, 'sand-flat-bottom', [hrany('F3'), hrany('B1')]],
    ['coin-card-holder', 8, 'dye-and-burnish-edges', [hrany('F3'), hrany('C1')]],
    // Projekt 03: všechny švy (konce 2 otvory zpět) a hrany.
    ['lid-wallet', 5, 'd2-edge', [hrany('G4')]],
    ['lid-wallet', 5, 'coin-windows', [hrany('G4')]],
    ['lid-wallet', 5, 'edges', [hrany('G1')]],
    ['lid-wallet', 5, 'd1-paint', [hrany('G2')]],
    ['lid-wallet', 5, 'tokonole', [hrany('G2')]],
    ['lid-wallet', 6, 'bill-window', [hrany('G4')]],
    ['lid-wallet', 6, 'stitch-s1-s3', [steh('E2'), thread]],
    ['lid-wallet', 8, 's6', [steh('E2'), thread]],
    ['lid-wallet', 9, 'punch-sew', [steh('E2'), thread]],
    ['lid-wallet', 9, 'edges', [hrany('G3')]],
    ['lid-wallet', 11, 'trim-tip', [hrany('G4')]],
    ['lid-wallet', 11, 's7', [steh('E2'), thread, hrany('G4')]],
    // Výměna magnetu ušije S7 znovu a hrany jazýčku dokončí stejně jako lekce 11.
    ['lid-wallet', 12, 'magnet-swap', [steh('E2'), thread, hrany('G4')]],
  ] as const)('%s lekce %i, krok %s', (projectSlug, order, stepId, expected) => {
    expect(hrefsOf(projectSlug, order, stepId)).toEqual(expected);
  });

  it('každý šev Víčka (S1–S7) odkazuje na sedlářský steh', () => {
    const lid = allSteps.filter(({ where }) => where.startsWith('lid-wallet/'));
    const seams = lid.filter(({ step }) => step.body.includes('sedlovým stehem'));
    expect(seams.length).toBeGreaterThanOrEqual(3);
    for (const { where, step } of seams) {
      expect(step.animationLinks?.[0]?.href, where).toMatch(/^\/animace\/sedlarsky-steh\.html#/);
    }
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
