import { beltProject } from '@/content/projects/belt/project';
import { equipmentCatalog } from '@/content/equipment';
import { projects } from '@/content/projects';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { type LessonDefinition, type ProjectDefinition } from '@/content/schema';
import {
  type BuildLessonPrepInput,
  buildLessonPrep,
  materialItemKeys,
  PREP_ITEM_KEY_MAX,
  printHref,
  printItemKey,
  slugifyMaterial,
} from '@/features/prep/lesson-prep';
import { type PrepCheckRecord } from '@/features/prep/types';
import { EMPTY_PROGRESS } from '@/features/progress/types';
import { inventoryOf, item, lessonDone } from '@/test/factories';

const NOW = '2026-10-07T10:00:00.000Z';

function check(
  lessonSlug: string,
  itemKey: string,
  checked = true,
  projectSlug = coinCardHolderProject.slug,
): PrepCheckRecord {
  return {
    id: `c-${lessonSlug}-${itemKey}`,
    userId: null,
    projectSlug,
    lessonSlug,
    itemKey,
    checked,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const coinLessons = [...coinCardHolderProject.lessons].sort((a, b) => a.order - b.order);
// Lekce 1 bez `prints`, aby testy náhrady z `printLink` nezávisely na obsahu.
const { prints: _firstPrints, ...first } = coinLessons[0]!;
const second = coinLessons[1]!;
const third = coinLessons[2]!;

/** Lekce 3 projektu s mincí s doplněnými poli přípravy (obsah je zatím nemá). */
const lesson: LessonDefinition = {
  ...third,
  prints: [
    { source: 'pattern-sheets', sheetId: 'kapsa', copies: 3, purpose: 'forma a šablona' },
    {
      source: 'practice-sheets',
      sheetId: 'cvicny-prouzek-kuze-1-2',
      copies: 1,
      purpose: 'proužek',
      paper: 'obyčejný papír A4',
      condition: 'jen když proužek z lekce 2 chybí',
    },
  ],
  requires: [
    { id: 'tvarovana-kapsa', fromLesson: second.slug, label: 'Vyschlá kapsa', note: 'přes noc' },
    { id: 'model', fromLesson: first.slug, label: 'Papírový model' },
  ],
  materials: [
    'potravinová fólie a houbička (lekce 2, 4, 6 a 7)',
    'Houbička a voda',
    'houbička a voda',
  ],
  requiredEquipment: ['veg-tan-leather', 'safety-skiver', 'scratch-awl'],
  recommendedEquipment: ['scratch-awl', 'mallet'],
};

const project: ProjectDefinition = {
  ...coinCardHolderProject,
  lessons: coinCardHolderProject.lessons.map((l) => (l.slug === lesson.slug ? lesson : l)),
};

const input = (over: Partial<BuildLessonPrepInput> = {}): BuildLessonPrepInput => ({
  project,
  lesson,
  catalog: equipmentCatalog,
  inventory: {},
  progress: EMPTY_PROGRESS,
  checks: [],
  ...over,
});

describe('buildLessonPrep – Vytisknout', () => {
  it('vezme výtisky z lekce: název listu, počet, papír, podmínka a odkaz s ?list=', () => {
    const { prints } = buildLessonPrep(input());
    expect(prints).toHaveLength(2);
    expect(prints[0]).toMatchObject({
      key: 'print:pattern-sheets:kapsa',
      title: 'Kapsa s mincí a otvor formy',
      copies: 3,
      purpose: 'forma a šablona',
      href: `/projects/${project.slug}/template?list=kapsa`,
      checked: false,
      optional: false,
    });
    expect(prints[1]).toMatchObject({
      key: 'print:practice-sheets:cvicny-prouzek-kuze-1-2',
      title: 'Cvičný proužek pro lekci 4',
      paper: 'obyčejný papír A4',
      condition: 'jen když proužek z lekce 2 chybí',
      href: `/projects/${project.slug}/practice-sheets?list=cvicny-prouzek-kuze-1-2`,
      optional: true,
    });
  });

  it('šablona má klíč print:template a odkaz bez předvýběru', () => {
    const cardLesson: LessonDefinition = {
      ...cardHolderProject.lessons[0]!,
      prints: [{ source: 'template', copies: 1, purpose: 'šablona' }],
    };
    const { prints } = buildLessonPrep(
      input({ project: cardHolderProject, lesson: cardLesson, checks: [] }),
    );
    expect(prints).toEqual([
      expect.objectContaining({
        key: 'print:template',
        title: 'Šablona 1:1',
        href: `/projects/${cardHolderProject.slug}/template`,
      }),
    ]);
  });

  it('bez prints vezme odkazy pod kroky – jeden řádek za zdroj, s čísly kroků', () => {
    const steps = first.steps.map((s, i) => ({
      ...s,
      printLink:
        i === 0
          ? ('pattern-sheets' as const)
          : i === 2
            ? ('pattern-sheets' as const)
            : i === 3
              ? ('practice-sheets' as const)
              : undefined,
    }));
    const noPrints: LessonDefinition = { ...first, steps };
    const { prints } = buildLessonPrep(input({ lesson: noPrints }));
    expect(prints).toEqual([
      expect.objectContaining({
        key: 'print:pattern-sheets',
        title: 'Listy střihu 1:1',
        fromSteps: [1, 3],
        href: `/projects/${project.slug}/template`,
        optional: false,
      }),
      expect.objectContaining({
        key: 'print:practice-sheets',
        title: 'Cvičné listy 1:1',
        fromSteps: [4],
        href: `/projects/${project.slug}/practice-sheets`,
      }),
    ]);
    expect(prints[0]).not.toHaveProperty('copies');
  });

  it('lekce bez prints i bez odkazů pod kroky nemá co tisknout', () => {
    const plain: LessonDefinition = {
      ...first,
      steps: first.steps.map(({ printLink: _p, ...s }) => s),
    };
    expect(buildLessonPrep(input({ lesson: plain })).prints).toEqual([]);
  });

  it('zaškrtnutí výtisku čte z checks téže lekce a projektu', () => {
    const { prints } = buildLessonPrep(
      input({
        checks: [
          check(lesson.slug, 'print:pattern-sheets:kapsa'),
          check(first.slug, 'print:practice-sheets:cvicny-prouzek-kuze-1-2'),
          check(lesson.slug, 'print:practice-sheets:cvicny-prouzek-kuze-1-2', true, 'jiny'),
        ],
      }),
    );
    expect(prints.map((p) => p.checked)).toEqual([true, false]);
  });
});

describe('buildLessonPrep – Nástroje', () => {
  it('„Mám“ je stav inventáře owned; objednané není hotové', () => {
    const { equipment } = buildLessonPrep(
      input({
        inventory: inventoryOf(item('scratch-awl', 'owned'), item('safety-skiver', 'ordered')),
      }),
    );
    const bySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));
    expect(bySlug['scratch-awl']).toMatchObject({ checked: true, status: 'owned' });
    expect(bySlug['safety-skiver']).toMatchObject({ checked: false, status: 'ordered' });
    expect(bySlug['veg-tan-leather']).toMatchObject({ checked: false, status: 'want_to_buy' });
  });

  it('doporučené je volitelné a duplicita s nezbytným se nezobrazí dvakrát', () => {
    const { equipment } = buildLessonPrep(input());
    expect(equipment.map((e) => [e.slug, e.priority, e.optional])).toEqual([
      ['veg-tan-leather', 'required', false],
      ['safety-skiver', 'required', false],
      ['scratch-awl', 'required', false],
      ['mallet', 'recommended', true],
    ]);
  });

  it('přidá řádky nákupního plánu, důvod vynechání, název z katalogu a odkaz na detail', () => {
    const { equipment } = buildLessonPrep(input());
    const leather = equipment.find((e) => e.slug === 'veg-tan-leather')!;
    const planLines = coinCardHolderProject.shoppingPlan!.lines.filter(
      (l) => l.equipmentSlug === 'veg-tan-leather',
    );
    expect(leather.planLines).toHaveLength(planLines.length);
    expect(leather.planLines[0]).toMatchObject({
      quantity: 1,
      variant: 'A4 (30 × 21 cm)',
      purpose: planLines[0]!.purpose,
    });
    expect(leather.planLines[0]!.lineCents).toBeGreaterThan(0);
    expect(leather.planLines[0]!.shop.length).toBeGreaterThan(0);
    expect(leather.name).toBe(equipmentCatalog['veg-tan-leather']!.name);
    expect(leather.href).toBe(`/shopping/veg-tan-leather?projekt=${project.slug}`);

    const skiver = equipment.find((e) => e.slug === 'safety-skiver')!;
    expect(skiver.planLines).toEqual([]);
    expect(skiver.skippedReason).toBe('Kůže těla 1,2 mm – ztenčení ohybu B odpadá.');
  });

  it('projekt bez nákupního plánu nemá řádky plánu', () => {
    const { shoppingPlan: _plan, ...noPlan } = project;
    const { equipment } = buildLessonPrep(input({ project: noPlan }));
    expect(equipment.every((e) => e.planLines.length === 0 && !e.skippedReason)).toBe(true);
  });

  it('nástroje se neukládají jako zaškrtnutí přípravy', () => {
    const { equipment } = buildLessonPrep(input({ checks: [check(lesson.slug, 'scratch-awl')] }));
    expect(equipment.find((e) => e.slug === 'scratch-awl')?.checked).toBe(false);
  });
});

describe('buildLessonPrep – Materiál', () => {
  it('klíč mat:<slug>, odkaz jen při přesné shodě s alsoNeeded', () => {
    const { materials } = buildLessonPrep(input());
    expect(materials.map((m) => m.key)).toEqual([
      'mat:potravinova-folie-a-houbicka-lekce-2-4-6-a-7',
      'mat:houbicka-a-voda',
      'mat:houbicka-a-voda-2',
    ]);
    expect(materials[0]!.shoppingHref).toBe('/shopping');
    expect(materials[1]).not.toHaveProperty('shoppingHref');
  });

  it('jen přesná shoda: drobná změna textu odkaz nedá', () => {
    const changed: LessonDefinition = {
      ...lesson,
      materials: ['potravinová fólie a houbička'],
    };
    expect(buildLessonPrep(input({ lesson: changed })).materials[0]).not.toHaveProperty(
      'shoppingHref',
    );
  });

  it('odškrtnutý záznam (checked: false) se nepočítá', () => {
    const { materials } = buildLessonPrep(
      input({
        checks: [
          check(lesson.slug, 'mat:houbicka-a-voda'),
          check(lesson.slug, 'mat:houbicka-a-voda-2', false),
        ],
      }),
    );
    expect(materials.map((m) => m.checked)).toEqual([false, true, false]);
  });
});

describe('buildLessonPrep – Z předchozích lekcí', () => {
  it('odkáže na lekci a řekne, zda je hotová', () => {
    const { requires } = buildLessonPrep(
      input({
        progress: {
          lessons: { [second.slug]: lessonDone(project.slug, second.slug) },
          checkpoints: {},
        },
        checks: [check(lesson.slug, 'req:model')],
      }),
    );
    expect(requires).toEqual([
      expect.objectContaining({
        key: 'req:tvarovana-kapsa',
        label: 'Vyschlá kapsa',
        note: 'přes noc',
        fromLesson: {
          slug: second.slug,
          title: second.title,
          order: second.order,
          href: `/projects/${project.slug}/lessons/${second.slug}`,
        },
        fromLessonCompleted: true,
        checked: false,
      }),
      expect.objectContaining({ key: 'req:model', fromLessonCompleted: false, checked: true }),
    ]);
  });

  it('neznámou lekci vynechá (chyba obsahu, hlídá ji schéma)', () => {
    const broken: LessonDefinition = {
      ...lesson,
      requires: [{ id: 'x', fromLesson: 'neexistuje', label: 'X' }],
    };
    expect(buildLessonPrep(input({ lesson: broken })).requires).toEqual([]);
  });
});

describe('buildLessonPrep – souhrn', () => {
  it('počítá jen povinné položky; volitelné ani zaškrtnuté nezvyšují celkem', () => {
    const empty = buildLessonPrep(input());
    // 1 výtisk (druhý je s podmínkou) + 3 nezbytné nástroje + 3 materiály + 2 díly z lekcí
    expect(empty.summary).toEqual({ done: 0, total: 9 });

    const some = buildLessonPrep(
      input({
        inventory: inventoryOf(item('scratch-awl', 'owned'), item('mallet', 'owned')),
        checks: [
          check(lesson.slug, 'print:pattern-sheets:kapsa'),
          check(lesson.slug, 'print:practice-sheets:cvicny-prouzek-kuze-1-2'),
          check(lesson.slug, 'req:model'),
        ],
      }),
    );
    expect(some.summary).toEqual({ done: 3, total: 9 });
  });
});

describe('klíče položek', () => {
  it('printItemKey a printHref', () => {
    expect(printItemKey('template', 'x')).toBe('print:template');
    expect(printItemKey('pattern-sheets', 'kapsa')).toBe('print:pattern-sheets:kapsa');
    expect(printItemKey('practice-sheets')).toBe('print:practice-sheets');
    expect(printHref({ slug: 'p' }, 'template', 'x')).toBe('/projects/p/template?list=x');
    expect(printHref({ slug: 'p' }, 'practice-sheets')).toBe('/projects/p/practice-sheets');
    expect(printHref({ slug: 'p' }, 'pattern-sheets', 'x')).toBe('/projects/p/template?list=x');
    // Pásek: listy pro uložený pásek se tisknou ze stránky „Váš pásek“.
    expect(printHref(beltProject, 'pattern-sheets', 'prezka')).toBe(
      '/projects/belt/vas-pasek?list=prezka',
    );
  });

  it('stejný list dvakrát v lekci dostane různé klíče a zaškrtnutí se nepletou', () => {
    const twice: LessonDefinition = {
      ...first,
      prints: [
        { source: 'pattern-sheets', sheetId: 'kapsa', copies: 1, purpose: 'forma' },
        {
          source: 'pattern-sheets',
          sheetId: 'kapsa',
          copies: 1,
          purpose: 'záloha',
          condition: 'jen když se pomačká',
        },
      ],
    };
    const view = buildLessonPrep({
      project: coinCardHolderProject,
      lesson: twice,
      catalog: equipmentCatalog,
      inventory: {},
      progress: EMPTY_PROGRESS,
      checks: [check(first.slug, 'print:pattern-sheets:kapsa')],
    });
    expect(view.prints.map((p) => [p.key, p.checked])).toEqual([
      ['print:pattern-sheets:kapsa', true],
      ['print:pattern-sheets:kapsa-2', false],
    ]);
  });

  it('slugifyMaterial odstraní diakritiku a zkrátí dlouhý text', () => {
    expect(slugifyMaterial('Tužka HB nebo 2B – na rub kůže!')).toBe('tuzka-hb-nebo-2b-na-rub-kuze');
    expect(slugifyMaterial('Ø 32 mm')).toBe('32-mm');
    expect(slugifyMaterial('–––')).toBe('material');
    const long = slugifyMaterial('kůže '.repeat(60));
    expect(long.length).toBeLessThanOrEqual(100);
    expect(long.endsWith('-')).toBe(false);
  });

  it('materialItemKeys rozliší texty se stejným slugem', () => {
    expect(materialItemKeys(['A b', 'a  B', 'a-b', 'c'])).toEqual([
      'mat:a-b',
      'mat:a-b-2',
      'mat:a-b-3',
      'mat:c',
    ]);
  });

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s: každá lekce se sestaví, klíče jsou unikátní a vejdou se do sloupce',
    (_slug, p) => {
      for (const l of p.lessons) {
        const view = buildLessonPrep({
          project: p,
          lesson: l,
          catalog: equipmentCatalog,
          inventory: {},
          progress: EMPTY_PROGRESS,
          checks: [],
        });
        const keys = [...view.prints, ...view.materials, ...view.requires].map((i) => i.key);
        expect(new Set(keys).size).toBe(keys.length);
        for (const key of keys) expect(key.length).toBeLessThanOrEqual(PREP_ITEM_KEY_MAX);
        for (const e of view.equipment) expect(e.name.length).toBeGreaterThan(0);
        expect(view.summary.done).toBe(0);
      }
    },
  );
});
