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
        animationLink: animationLink('lidBends', 'anim-dno'),
      }).success,
    ).toBe(true);
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
});

describe('animace postupu – odkazy z lekcí', () => {
  const linked = allSteps.filter(({ step }) => step.animationLink);

  it('všechny projekty s odkazy na animace odpovídají schématu', () => {
    for (const project of projects) {
      const result = projectDefinitionSchema.safeParse(project);
      expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
    }
  });

  it('každý odkaz míří na existující stránku a existující kotvu', () => {
    expect(linked.length).toBeGreaterThan(0);
    for (const { where, step } of linked) {
      const href = step.animationLink!.href;
      const source = pageSource(href);
      expect(source, `${where}: ${href}`).toBeDefined();
      const anchor = href.split('#')[1];
      if (anchor) expect(hasAnchor(source!, anchor), `${where}: ${href}`).toBe(true);
    }
  });

  it('kroky lekcí 2 a 6 pouzdra s mincí otevírají správné části animace kapsy', () => {
    const hrefs = Object.fromEntries(
      linked
        .filter(({ where }) => where.startsWith('coin-card-holder/'))
        .map(({ where, step }) => [where.split('/').slice(1).join('/'), step.animationLink!.href]),
    );
    const kapsa = (part: string) => `/animace/kapsa-postup.html#${part}`;
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
});

describe('animationButtonText', () => {
  it('pojmenuje návod na délku nitě jinak než animace', () => {
    expect(animationButtonText(animationPages.threadLength.path)).toBe('Jak odměřit nit');
    expect(animationButtonText(`${animationPages.kapsa.path}#B`)).toBe('Animace postupu');
  });
});
