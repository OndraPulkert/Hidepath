import { animationPages, type AnimationPageKey } from '@/content/animations';
import { type ProjectDefinition } from '@/content/schema';

/**
 * Rejstřík animací pro stránku Návody: názvy stránek, částí a kroků z `animationPages`
 * a místa v lekcích, která na stránku odkazují. Nic se nezadává podruhé – vše se skládá
 * z registru animací a z obsahu projektů.
 */

export interface GuideStep {
  /** Kotva kroku, např. `B3`. */
  anchor: string;
  title: string;
  /** Název části, do které krok patří („Část B – tah“). */
  section: string;
  href: string;
}

export interface GuideSection {
  anchor: string;
  label: string;
  href: string;
}

export interface GuideLessonUse {
  projectSlug: string;
  projectTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonOrder: number;
  /** Číslo kroku lekce od 1. */
  stepNumber: number;
  stepTitle: string;
}

export interface GuidePage {
  key: AnimationPageKey;
  title: string;
  href: string;
  technique: boolean;
  sections: readonly GuideSection[];
  steps: readonly GuideStep[];
  /** Kroky lekcí, které na stránku odkazují, v pořadí projektů a lekcí. */
  uses: readonly GuideLessonUse[];
}

export function buildGuideIndex(projects: readonly ProjectDefinition[]): GuidePage[] {
  return (Object.keys(animationPages) as AnimationPageKey[]).map((key) => {
    const def = animationPages[key];
    const sectionLabels: Readonly<Record<string, string>> = def.sections;
    const sections = Object.entries(sectionLabels)
      .filter(([anchor]) => /^[A-Z]$/.test(anchor))
      .map(([anchor, label]) => ({ anchor, label, href: `${def.path}#${anchor}` }));
    const stepMap: Readonly<Record<string, readonly string[]>> = 'steps' in def ? def.steps : {};
    const steps = Object.entries(stepMap).flatMap(([part, titles]) =>
      titles.map((title, i) => ({
        anchor: `${part}${i + 1}`,
        title,
        section: sectionLabels[part] ?? `Část ${part}`,
        href: `${def.path}#${part}${i + 1}`,
      })),
    );
    const uses: GuideLessonUse[] = [];
    for (const project of projects) {
      for (const lesson of [...project.lessons].sort((a, b) => a.order - b.order)) {
        lesson.steps.forEach((step, i) => {
          if (step.animationLinks?.some((link) => link.href.split('#')[0] === def.path)) {
            uses.push({
              projectSlug: project.slug,
              projectTitle: project.title,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              lessonOrder: lesson.order,
              stepNumber: i + 1,
              stepTitle: step.title,
            });
          }
        });
      }
    }
    return {
      key,
      title: def.title,
      href: def.path,
      technique: 'technique' in def && def.technique,
      sections,
      steps,
      uses,
    };
  });
}

export interface GuideGroup {
  /** `techniques`, nebo slug projektu. */
  id: string;
  title: string;
  pages: readonly GuidePage[];
}

/**
 * Skupiny pro výpis bez hledání: nejdřív obecné techniky, pak projekty (aktivní první).
 * Stránka mimo techniky patří k prvnímu projektu, který na ni odkazuje.
 */
export function groupGuides(
  pages: readonly GuidePage[],
  projects: readonly ProjectDefinition[],
  activeProjectSlug?: string,
): GuideGroup[] {
  const ordered = [...projects].sort(
    (a, b) => Number(b.slug === activeProjectSlug) - Number(a.slug === activeProjectSlug),
  );
  const groups: GuideGroup[] = [
    { id: 'techniques', title: 'Obecné techniky', pages: pages.filter((p) => p.technique) },
    ...ordered.map((project) => ({
      id: project.slug,
      title: project.title,
      pages: pages.filter(
        (p) => !p.technique && (p.uses[0]?.projectSlug ?? projects[0]?.slug) === project.slug,
      ),
    })),
  ];
  return groups.filter((g) => g.pages.length > 0);
}

/** Malá písmena bez diakritiky: „Kružítko“ i „kruzitko“ se najdou stejně. */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export interface GuideMatch {
  page: GuidePage;
  /** Shoda v názvu stránky, jejích částí nebo projektu: stránka odpovídá celá. */
  pageMatch: boolean;
  steps: readonly GuideStep[];
  /** Kroky lekcí, které sem odkazují a jejichž název obsahuje hledané slovo. */
  uses: readonly GuideLessonUse[];
}

/**
 * Hrubé zkrácení české koncovky, aby „kružítko“ našlo „kružítkem“ a „kapsa“ „kapsy“.
 * Zkracuje jen slova, kterým zůstanou aspoň 3 znaky.
 */
const CS_ENDINGS = [
  'ami',
  'emi',
  'ech',
  'ich',
  'ych',
  'em',
  'ou',
  'ho',
  'mu',
  'mi',
  'a',
  'e',
  'i',
  'o',
  'u',
  'y',
];
export function stemCs(word: string): string {
  const ending = CS_ENDINGS.find((e) => word.endsWith(e) && word.length - e.length >= 3);
  return ending ? word.slice(0, -ending.length) : word;
}

/**
 * Hledání: každé slovo dotazu musí být v textu (bez diakritiky, i jako část slova).
 * Slova se mohou rozdělit mezi stránku a krok („kružítko roh“ najde krok o rohu na stránce
 * kružítka). Pořadí: shoda v názvu stránky, pak podle počtu nalezených kroků.
 */
export function searchGuides(pages: readonly GuidePage[], query: string): GuideMatch[] {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean).map(stemCs);
  if (tokens.length === 0) return [];
  const hasAll = (text: string) => tokens.every((t) => text.includes(t));
  const results: (GuideMatch & { score: number })[] = [];
  for (const page of pages) {
    const pageText = normalizeSearch(
      [
        page.title,
        ...page.sections.map((s) => s.label),
        ...new Set(page.uses.map((u) => u.projectTitle)),
        page.technique ? 'obecne techniky' : '',
      ].join(' '),
    );
    const pageMatch = hasAll(pageText);
    // Krok se ukáže, když sám obsahuje některé slovo a spolu se stránkou obsahují všechna.
    const stepHit = (title: string) => {
      const text = normalizeSearch(title);
      return tokens.some((t) => text.includes(t)) && hasAll(`${pageText} ${text}`);
    };
    const steps = page.steps.filter((s) => stepHit(s.title));
    const uses = page.uses.filter((u) => stepHit(u.stepTitle));
    if (!pageMatch && steps.length === 0 && uses.length === 0) continue;
    const titleHit = tokens.some((t) => normalizeSearch(page.title).includes(t));
    results.push({
      page,
      pageMatch,
      steps,
      uses,
      score: (pageMatch ? 1000 : 0) + (titleHit ? 500 : 0) + steps.length * 10 + uses.length,
    });
  }
  return results
    .sort((a, b) => b.score - a.score)
    .map((r) => ({ page: r.page, pageMatch: r.pageMatch, steps: r.steps, uses: r.uses }));
}
