import { animationButtonText, animationLink, animationPages } from '@/content/animations';
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

/** Umí stránka otevřít kotvu? Kapsa má části A–E v `PARTS`, ostatní mají `id` v HTML. */
function hasAnchor(source: string, anchor: string): boolean {
  if (source.includes(`id="${anchor}"`)) return true;
  const parts = /const PARTS=\{([^}]*)\}/.exec(source)?.[1] ?? '';
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

  it('kroky lekcí 2 a 6 pouzdra s mincí otevírají správné části animace kapsy', () => {
    const hrefs = Object.fromEntries(
      allSteps
        .filter(({ where, step }) => where.startsWith('coin-card-holder/') && step.animationLinks)
        .map(({ where, step }) => [
          where.split('/').slice(1).join('/'),
          step.animationLinks!.map((l) => l.href),
        ]),
    );
    const kapsa = (part: string) => [`/animace/kapsa-postup.html#${part}`];
    const lessonOf = (n: number) =>
      projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!.slug;
    expect(hrefs).toMatchObject({
      [`${lessonOf(2)}/drill-form`]: kapsa('A'),
      [`${lessonOf(2)}/mark-outline`]: kapsa('B'),
      [`${lessonOf(2)}/press-and-clamp`]: kapsa('D'),
      [`${lessonOf(2)}/test-window-retention`]: kapsa('E'),
      [`${lessonOf(6)}/trace-and-punch-pocket`]: kapsa('B'),
      [`${lessonOf(6)}/form-dimple`]: kapsa('D'),
      [`${lessonOf(6)}/cut-outline-and-window`]: kapsa('E'),
    });
  });

  it('kroky lekcí 5 a 6 pouzdra s mincí otevírají správné části animace přišití kapsy', () => {
    const lessonOf = (n: number) =>
      projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!;
    const hrefOf = (n: number, stepId: string) =>
      lessonOf(n)
        .steps.find((s) => s.id === stepId)
        ?.animationLinks?.map((l) => l.href);
    const prisiti = (part: string) => `/animace/kapsa-prisiti.html#${part}`;
    expect(hrefOf(5, 'transfer-marks-awl')).toEqual([prisiti('A')]);
    expect(hrefOf(6, 'glue-pocket')).toEqual([prisiti('B')]);
    // Přišití kapsy: animace prosekání a šití a hned vedle návod, kolik nitě odměřit.
    expect(hrefOf(6, 'stitch-pocket')).toEqual([prisiti('C'), animationPages.threadLength.path]);
  });
});

describe('animace postupu – složení pouzdra a druk v lekcích', () => {
  const lessonOf = (n: number) =>
    projects.find((p) => p.slug === 'coin-card-holder')!.lessons.find((l) => l.order === n)!;
  const hrefOf = (n: number, stepId: string) =>
    lessonOf(n)
      .steps.find((s) => s.id === stepId)
      ?.animationLinks?.map((l) => l.href);
  const skladani = (part: string) => `/animace/kapsa-skladani.html#${part}`;
  const druk = (part: string) => `/animace/kapsa-druk.html#${part}`;

  it('lekce 4 a 7: ohyby, lepení dna a šev otevírají správné části skládání', () => {
    expect(hrefOf(4, 'wet-fold-zones')).toEqual([skladani('B')]);
    expect(hrefOf(4, 'fold-around-content')).toEqual([skladani('B')]);
    expect(hrefOf(4, 'unfold-roughen-glue')).toEqual([skladani('C')]);
    for (const id of ['wet-fold-zones', 'fold-inner-b', 'fold-back-a', 'press-and-clamp']) {
      expect(hrefOf(7, id), id).toEqual([skladani('B')]);
    }
    expect(hrefOf(7, 'roughen-and-glue-bottom')).toEqual([skladani('C')]);
    // Šití: animace švu a hned vedle návod, kolik nitě odměřit.
    const thread = animationPages.threadLength.path;
    expect(hrefOf(4, 'stitch-through-layers')).toEqual([skladani('D'), thread]);
    expect(hrefOf(7, 'stitch-bottom')).toEqual([skladani('D'), thread]);
  });

  it('lekce 3, 6 a 8: zkouška druku, dřík naplocho a klobouček podle obtisku', () => {
    for (const id of ['punch-post-hole', 'set-snap-post', 'practice-snap-cap', 'measure-flange']) {
      expect(hrefOf(3, id), id).toEqual([druk('A')]);
    }
    for (const id of ['punch-post-hole', 'set-snap-post']) {
      expect(hrefOf(6, id), id).toEqual([druk('B')]);
    }
    for (const id of [
      'insert-content',
      'imprint-cap-position',
      'punch-cap-hole',
      'set-cap',
      'shorten-tongue',
    ]) {
      expect(hrefOf(8, id), id).toEqual([druk('C')]);
    }
  });
});

describe('animationButtonText', () => {
  it('pojmenuje návod na délku nitě jinak než animace', () => {
    expect(animationButtonText(animationPages.threadLength.path)).toBe('Jak odměřit nit');
    expect(animationButtonText(`${animationPages.kapsa.path}#B`)).toBe('Animace postupu');
  });
});
