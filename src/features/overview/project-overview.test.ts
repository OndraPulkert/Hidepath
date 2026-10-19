import { routes } from '@/app/routes';
import { projects } from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { projectDefinitionSchema } from '@/content/schema';
import {
  flatOverview,
  formatNumberRanges,
  hasOverview,
  numberOverview,
  overviewAroundLesson,
  overviewPrints,
  pointNumbersForLesson,
  printTotals,
  splitPrintList,
} from '@/features/overview/project-overview';
import { conditionLead } from '@/features/prep/lesson-prep';
import { CARDBOARD_NOTE } from '@/features/prep/print-mount';

describe('Postup v kostce – pomocné funkce', () => {
  it('souvislé úseky čísel', () => {
    expect(formatNumberRanges([3])).toBe('3');
    expect(formatNumberRanges([1, 2, 3, 4])).toBe('1–4');
    expect(formatNumberRanges([6, 2, 5])).toBe('2, 5–6');
    expect(formatNumberRanges([])).toBe('');
  });

  it('schéma odmítne bod s neznámou lekcí, krokem nebo tiskem z lekce bez tisku', () => {
    const base = lidWalletProject;
    const withPoint = (point: Record<string, unknown>) => ({
      ...base,
      overview: { sections: [{ title: 'X', points: [{ id: 'x', text: 'Něco.', ...point }] }] },
    });
    const messages = (p: unknown) =>
      projectDefinitionSchema.safeParse(p).error?.issues.map((i) => i.message) ?? [];
    expect(messages(withPoint({ lessonSlug: 'neni' })).join()).toContain('neznámou lekci');
    expect(
      messages(withPoint({ lessonSlug: base.lessons[0]!.slug, stepId: 'neni' })).join(),
    ).toContain('neznámý krok');
    const noPrints = base.lessons.find((l) => !l.prints)!;
    expect(
      messages(withPoint({ lessonSlug: noPrints.slug, printsFrom: [noPrints.slug] })).join(),
    ).toContain('žádný nemá');
  });
});

describe('Postup v kostce – obsah všech projektů', () => {
  for (const project of projects.filter(hasOverview)) {
    const sections = numberOverview(project.overview, project);
    const points = flatOverview(sections);

    it(`${project.slug}: každý bod míří na existující lekci (a krok), body jdou po pořadí lekcí`, () => {
      for (const p of points) {
        const lesson = project.lessons.find((l) => l.slug === p.point.lessonSlug);
        expect(lesson, p.point.id).toBeDefined();
        if (p.point.stepId) expect(p.stepNumber, p.point.id).toBeGreaterThan(0);
      }
      const orders = points.map((p) => p.lessonOrder);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(points.map((p) => p.number)).toEqual(points.map((_, i) => i + 1));
    });

    it(`${project.slug}: každá lekce má v přehledu aspoň jeden bod`, () => {
      for (const lesson of project.lessons) {
        expect(pointNumbersForLesson(sections, lesson.slug), lesson.slug).not.toEqual([]);
      }
    });

    it(`${project.slug}: výpis tisku pokrývá všechny lekce s „Vytisknout“ a počty sedí s lekcemi`, () => {
      const printsFrom = points.flatMap((p) => p.point.printsFrom ?? []);
      const lessonsWithPrints = project.lessons.filter((l) => l.prints).map((l) => l.slug);
      expect([...printsFrom].sort()).toEqual([...lessonsWithPrints].sort());

      const groups = overviewPrints(project, printsFrom);
      for (const g of groups) {
        const lesson = project.lessons.find((l) => l.slug === g.lessonSlug)!;
        expect(
          g.rows.map((r) => [r.sheetId, r.copies]),
          lesson.slug,
        ).toEqual(lesson.prints!.map((p) => [p.sheetId ?? 'template', p.copies]));
      }
      // Součet po listech = součet výtisků všech lekcí (bez podmíněných).
      const expected = new Map<string, number>();
      for (const print of project.lessons.flatMap((l) => l.prints ?? [])) {
        if (print.condition) continue;
        const id = print.sheetId ?? 'template';
        expected.set(id, (expected.get(id) ?? 0) + print.copies);
      }
      expect(new Map(printTotals(groups).map((t) => [t.sheetId, t.copies]))).toEqual(expected);
    });
  }
});

describe('Postup v kostce – Víčko', () => {
  const project = lidWalletProject;
  if (!hasOverview(project)) throw new Error('Víčko nemá přehled');
  const sections = numberOverview(project.overview, project);
  const points = flatOverview(sections);
  const text = (id: string) => points.find((p) => p.point.id === id)!.point;

  it('15–25 krátkých bodů, bod 1 je tisk z lekcí 1, 2, 4 a 12', () => {
    expect(points.length).toBeGreaterThanOrEqual(15);
    expect(points.length).toBeLessThanOrEqual(25);
    expect(points[0]!.point.printsFrom).toEqual([
      '01-measure-and-sheets',
      '02-paper-model',
      '04-cut-and-mark',
      '12-finish-and-tests',
    ]);
    for (const p of points) {
      const sentences = p.point.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.point.id).toBeLessThanOrEqual(3);
    }
  });

  it('výtisky: list 1 5×, list 2 2×, list 3 4×, list 4 3×; řez z prvního výtisku, šablona z druhého, finální kus v lekci 12', () => {
    const groups = overviewPrints(project, points[0]!.point.printsFrom!);
    expect(printTotals(groups).map((t) => `${t.sheetLabel} ${t.copies}×`)).toEqual([
      'List 1 5×',
      'List 2 2×',
      'List 3 4×',
      'List 4 3×',
    ]);
    const cut = groups.find((g) => g.lessonOrder === 4)!;
    // První výtisk listů 1 a 3 na řez (papír), druhý jako šablona nalepená na tenkém kartonu.
    for (const id of ['sablona', 'dily']) {
      expect(cut.rows.filter((r) => r.sheetId === id).map((r) => [r.copies, r.mount])).toEqual([
        [1, undefined],
        [
          1,
          'Nalepit na tenký karton (krabice od cereálií) – šablonu přikládáte opakovaně, musí držet tvar',
        ],
      ]);
    }
    expect(text('tape-sheet-1').text).toContain('První výtisk listu 1');
    expect(text('cut-prints').text).toContain('Druhý výtisk listů 1 a 3');
  });

  it('teď × později: propichování a řez teď, švy, okénka a špička později', () => {
    expect(text('prick-p1').later).toContain('S1–S3 a S6');
    expect(text('cut-p1').later).toMatch(/okénka mincí.*okénko bankovek.*špička/);
    expect(text('mark-back').later).toContain('otvory švů');
  });

  it('zkušební kus napřed, finální kus opakuje lekce 4–12', () => {
    expect(sections.map((s) => s.title)).toEqual(['Příprava', 'Zkušební kus', 'Finální kus']);
    expect(sections[1]!.note).toContain('Lekce 4–12 nejdřív celé na zkušebním kuse');
    expect(text('final-piece').text).toContain('Lekce 4–12 zopakujte');
  });

  it('výřez kolem lekce: body lekce a po jednom před a za', () => {
    const around = flatOverview(overviewAroundLesson(sections, '04-cut-and-mark'));
    const own = pointNumbersForLesson(sections, '04-cut-and-mark');
    expect(around.map((p) => p.number)).toEqual([own[0]! - 1, ...own, own[own.length - 1]! + 1]);
    expect(flatOverview(overviewAroundLesson(sections, '01-measure-and-sheets'))[0]!.number).toBe(
      1,
    );
  });

  it('kůže u dílů: useň P1, nebarvená kozinka D1 a L1, čokoládová D2', () => {
    expect(text('measure').text).toContain(
      'P1 (useň), D1 a L1 (nebarvená kozinka) a D2 (čokoládová kozinka)',
    );
    expect(text('cut-parts').text).toContain(
      'D1 a přířez L1 z nebarvené kozinky a D2 z čokoládové',
    );
  });
});

describe('Postup v kostce – pouzdro s mincí', () => {
  const project = coinCardHolderProject;
  if (!hasOverview(project)) throw new Error('Pouzdro s mincí nemá přehled');
  const sections = numberOverview(project.overview, project);
  const points = flatOverview(sections);
  const text = (id: string) => points.find((p) => p.point.id === id)!.point;
  const stepBody = (id: string) => {
    const p = text(id);
    return project.lessons
      .find((l) => l.slug === p.lessonSlug)!
      .steps.find((s) => s.id === p.stepId)!.body;
  };

  it('15–22 krátkých bodů, bod 1 je tisk ze všech lekcí s „Vytisknout“', () => {
    expect(points.length).toBeGreaterThanOrEqual(15);
    expect(points.length).toBeLessThanOrEqual(22);
    expect(points[0]!.point.printsFrom).toEqual([
      '01-paper-model',
      '02-wet-forming-coin',
      '04-fold-and-stitch-scrap',
      '05-strip-and-skive-marks',
      '06-coin-pocket-and-hardware',
    ]);
    for (const p of points) {
      const sentences = p.point.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.point.id).toBeLessThanOrEqual(3);
    }
  });

  it('výtisky: KAPSA 3×, PÁS 2× (na kůži a okénko), ostatní listy 1×; lekce 6 tiskne jen podmíněně', () => {
    const groups = overviewPrints(project, points[0]!.point.printsFrom!);
    expect(printTotals(groups).map((t) => `${t.sheetLabel} ${t.copies}×`)).toEqual([
      'Papírový model 1×',
      'Kapsa s mincí a otvor formy 3×',
      'Cvičný proužek pro lekci 4 1×',
      'Pás (šablona) 2×',
    ]);
    const l6 = groups.find((g) => g.lessonOrder === 6)!;
    expect(l6.rows.every((r) => r.condition)).toBe(true);
    // Záložní list nesmí splynout s hlavním listem KAPSA pod zkráceným názvem „Kapsa“.
    const backup = groups.flatMap((g) => g.rows).filter((r) => r.sheetId === 'kapsa-okno-20');
    expect(backup.length).toBeGreaterThan(0);
    for (const r of backup) expect(r.sheetLabel).toBe('Kapsa – záložní okno Ø 20 mm');
    expect(text('prints').text).toContain('schovejte na kapsu v lekci 6');
  });

  it('oddíly: příprava, trénink na odřezcích, výroba', () => {
    expect(sections.map((s) => s.title)).toEqual([
      'Příprava',
      'Trénink na odřezcích',
      'Výroba pouzdra',
    ]);
    expect(sections[2]!.note).toContain('kapsa vždy z kůže 1,2 mm');
  });

  it('lepení sedí s lekcemi: G1 líc předního a rub kapsy, G2 a G3 dno, strany podle listu PÁS', () => {
    expect(text('pocket-glue').text).toContain('G1');
    expect(text('pocket-glue').text).toContain('na líc předního panelu a na rub kapsy');
    expect(text('pocket-glue').text).toContain('Horní hranu nelepte');
    expect(stepBody('pocket-glue')).toContain('pruh G1');
    expect(stepBody('pocket-glue')).toContain('Horní hranu kapsy nelepte');
    // Vnitřní hranici G1 na líci předního panelu dávají vpichy skrz otvory švu kapsy.
    expect(text('pocket-glue').text).toContain('od okénka po vpichy');
    expect(stepBody('pocket-glue')).toContain('propíchněte všemi jejími otvory švu');

    const bottom = text('bottom-glue-stitch').text;
    expect(bottom).toContain('0–3,5 mm od dolní hrany');
    expect(bottom).toContain('G2 rub předního s rubem vnitřního');
    expect(bottom).toContain('G3 líc vnitřního s rubem zadního');
    expect(stepBody('bottom-glue-stitch')).toMatch(
      /spoj G2, přední s vnitřním: .*rub předního a rub vnitřního/,
    );
    expect(stepBody('bottom-glue-stitch')).toMatch(
      /spoj G3, vnitřní se zadním: líc vnitřního a rub zadního/,
    );

    expect(text('strip-seal').text).toContain('pruh G2');
    expect(stepBody('strip-seal')).toContain('šrafa G2');
  });

  it('teď × později: obrys a okno po zaschnutí, jazyk a klobouček v lekci 8', () => {
    expect(text('scrap-marks').later).toContain('po zaschnutí důlku');
    expect(text('pocket-form').later).toContain('po zaschnutí');
    expect(text('strip-cut').later).toContain('lekce 8');
    expect(text('pocket-stitch').later).toContain('klobouček');
  });
});

describe('Postup v kostce – pásek', () => {
  const project = beltProject;
  if (!hasOverview(project)) throw new Error('Pásek nemá přehled');
  const sections = numberOverview(project.overview, project);
  const points = flatOverview(sections);
  const point = (id: string) => points.find((p) => p.point.id === id)!.point;

  it('15–28 krátkých bodů ve třech povinných oddílech a volitelný oddíl, nejvýš 3 věty na bod', () => {
    const required = sections.filter((s) => !s.title.startsWith('Volitelně'));
    const requiredPoints = required.flatMap((s) => s.points);
    expect(requiredPoints.length).toBeGreaterThanOrEqual(15);
    expect(requiredPoints.length).toBeLessThanOrEqual(28);
    expect(sections.map((s) => s.title)).toEqual([
      'Příprava',
      'Trénink na odřezku',
      'Stavba pásku',
      'Volitelně: ozdobný steh',
    ]);
    for (const p of points) {
      const sentences = p.point.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.point.id).toBeLessThanOrEqual(3);
    }
  });

  it('volitelný oddíl: jen lekce 7 (volitelná), s poznámkou, že pásek je hotový po lekci 6', () => {
    const optional = sections.at(-1)!;
    expect(optional.note).toBe('Lekce 7, jen když chcete šít; pásek je hotový po lekci 6.');
    const lesson7 = project.lessons.find((l) => l.order === 7)!;
    expect(lesson7.optional).toBe(true);
    expect(optional.points.map((p) => [p.point.id, p.point.lessonSlug, p.point.stepId])).toEqual([
      ['stitch-scrap', lesson7.slug, 'scrap-test'],
      ['stitch-mark', lesson7.slug, 'endpoints'],
      ['stitch-groove-punch', lesson7.slug, 'punch'],
      ['stitch-sew', lesson7.slug, 'sew'],
      ['stitch-set', lesson7.slug, 'set'],
      ['stitch-reassemble', lesson7.slug, 'reassemble'],
    ]);
    // Povinné oddíly do volitelné lekce nevedou.
    for (const s of sections.slice(0, -1)) {
      for (const p of s.points) expect(p.point.lessonSlug, p.point.id).not.toBe(lesson7.slug);
    }
  });

  it('začíná obvodem, uložením pásku, nákupem podle „Koupit“ a tiskem listů', () => {
    expect(points.slice(0, 6).map((p) => p.point.stepId)).toEqual([
      'waist',
      'your-belt',
      'order',
      'measure-strap',
      'plate-check',
      'plate-or-sheets',
    ]);
    expect(point('order').text).toContain('souhrnu „Koupit“');
    expect(point('order').appLinks?.map((l) => l.to)).toEqual(['belt-config', 'shopping']);
    expect(point('sheets').printsFrom).toEqual(['02-scrap-training', '06-holes-and-tip']);
    expect(point('sheets').text).toContain('Vygenerovat listy A4');
  });

  it('čísla podle pásku neopisuje: žádné cm ani délky, jen odkaz na „Váš pásek“', () => {
    for (const p of points) {
      // Pevné míry postupu (Ø 6 mm, 30 cm, 15 cm, 12 mm, 3,5 mm, 50 × 50 mm) smí; délka pásu,
      // dírky, poutko a dřík nýtu ne.
      expect(p.point.text, p.point.id).not.toMatch(/10\/6|130 cm|144,3|\b120 mm|Ø 5 mm|106,5/);
      if (p.point.text.includes('ve „Váš pásek“') || p.point.text.includes('z „Váš pásek“')) {
        expect(
          p.point.appLinks?.some((l) => l.to === 'belt-config'),
          p.point.id,
        ).toBe(true);
      }
    }
  });

  it('výtisky: listy z „Váš pásek“, jen za podmínky, list 1 jednou (lekce 2, znovu v 3 a 4) a list 2 1×', () => {
    const groups = overviewPrints(project, point('sheets').printsFrom!);
    expect(groups.map((g) => g.lessonOrder)).toEqual([2, 6]);
    const rows = groups.flatMap((g) => g.rows);
    expect(rows.map((r) => r.sheetLabel)).toEqual(['List 1', 'List 2']);
    // Název listu se v účelu neopakuje („List 1: …“ → „…“).
    expect(rows[0]!.purpose).toBe('značení odřezku místo řady 3 destičky');
    expect(rows[1]!.href).toBe(routes.beltConfig(project.slug, 'spicka'));
    // Všechny listy jsou jen za podmínky: povinné nic, celé „Jen v případě potřeby“ s jednou
    // společnou podmínkou.
    const list = splitPrintList(groups);
    expect(list.required).toEqual([]);
    expect(list.totals).toEqual([]);
    expect(list.conditional).toHaveLength(1);
    expect(list.conditional[0]!.condition).toContain('neprošla kontrolou');
    expect(
      list.conditional[0]!.rows.map((r) => `${r.sheetLabel} · lekce ${r.lessonOrder}`),
    ).toEqual(['List 1 · lekce 2', 'List 2 · lekce 6']);
  });

  it('teď × později: obvod teď, tloušťka po dodání; konec, 30 cm a druhá dvojice později', () => {
    expect(point('waist').later).toContain('až pás přijde');
    expect(point('square-end').later).toContain('lekci 6');
    expect(point('long-edges').later).toContain('posledních 30 cm');
    expect(point('first-pair').later).toContain('skrz vyseknuté otvory');
  });

  it('„Kde jste v postupu“ najde body v každé lekci pásku', () => {
    for (const lesson of project.lessons) {
      expect(overviewAroundLesson(sections, lesson.slug).length, lesson.slug).toBeGreaterThan(0);
    }
    expect(formatNumberRanges(pointNumbersForLesson(sections, '01-design-and-measure'))).toBe(
      '1–6',
    );
  });
});

describe('Postup v kostce – pouzdro na karty', () => {
  const project = cardHolderProject;
  if (!hasOverview(project)) throw new Error('Pouzdro na karty nemá přehled');
  const sections = numberOverview(project.overview, project);
  const points = flatOverview(sections);
  const point = (id: string) => points.find((p) => p.point.id === id)!.point;

  it('12–24 krátkých bodů ve třech oddílech podle fází, nejvýš 3 věty na bod', () => {
    expect(points.length).toBeGreaterThanOrEqual(12);
    expect(points.length).toBeLessThanOrEqual(24);
    expect(sections.map((s) => s.title)).toEqual([
      'Příprava',
      'Trénink na odřezku',
      'Výroba pouzdra',
    ]);
    for (const p of points) {
      const sentences = p.point.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.point.id).toBeLessThanOrEqual(3);
    }
  });

  it('bod 1 je tisk z lekcí 2, 4 a 5: cvičná šablona 1×, šablona 1×, v lekci 5 jen podmíněně', () => {
    expect(points[0]!.point.id).toBe('prints');
    expect(points[0]!.point.printsFrom).toEqual([
      '02-straight-cut',
      '05-transfer-and-cut',
      '06-assemble-card-holder',
    ]);
    const groups = overviewPrints(project, points[0]!.point.printsFrom!);
    expect(printTotals(groups).map((t) => `${t.sheetLabel} ${t.copies}×`)).toEqual([
      'Cvičná šablona: řez podle přilepené šablony 1×',
      'Šablona 1:1 1×',
    ]);
    const l5 = groups.find((g) => g.lessonOrder === 5)!;
    expect(l5.rows.every((r) => r.condition)).toBe(true);
    expect(point('prints').text).toContain('Oba papírové díly z lekce 4 si schovejte');
    expect(point('peel-template').text).toContain('Oba papírové díly si schovejte na lekci 5');
  });

  it('teď × později: nástroje až doma, kapsa v lekci 3, výřez po obvodu, zpětné stehy v lekci 5', () => {
    expect(point('tools').text).toMatch(/^Až budete mít vidličky, jehly a nit doma/);
    expect(point('tools').text).toContain('roh');
    expect(point('tools').text).toContain('druhé tréninkové A5');
    expect(point('tools').text).toContain('pokračujte lekcí 2');
    expect(point('practice-template').later).toContain('lekci 3 do kapsy');
    expect(point('cut-parts').later).toContain('výřez na palec');
    expect(point('stitch-practice').later).toContain('lekci 5');
  });

  it('míry sedí s lekcemi a šablonou', () => {
    const stepBody = (id: string) => {
      const p = point(id);
      return project.lessons
        .find((l) => l.slug === p.lessonSlug)!
        .steps.find((s) => s.id === p.stepId)!.body;
    };
    expect(point('tools').text).toContain('3,85–4 mm');
    expect(stepBody('tools')).toContain('3,85–4 mm');
    expect(point('glue-area').text).toContain('asi 5 mm');
    expect(project.template?.glueBandMm).toBe(5);
    expect(point('glue-area').text).toContain('50 mm od spodku');
    expect(stepBody('glue-area')).toContain('50 mm od spodku');
    expect(point('glue-area').text).toContain('kroužky');
    expect(point('punch-sides').text).toContain('horního kroužku, 6 mm pod její horní hranou');
    expect(stepBody('punch-sides')).toContain(
      'horního kroužku na linii stehu, 6 mm pod horní hranou',
    );
    const l5 = project.lessons.find((l) => l.slug === point('glue-parts').lessonSlug)!;
    const wait = l5.steps.find((s) => s.id === 'glue-parts')!.waits![0]!;
    expect(wait.minutes).toBe(60);
    expect(point('glue-parts').text).toContain('děrujte nejdřív za 1 h');
    expect(point('stitch').text).toContain('asi 1 m nitě');
    expect(l5.materials).toContain('nit asi 1 m');
    expect(point('stitch').text).toContain('ve třetím otvoru od horního konce');
    expect(stepBody('stitch')).toContain('ve třetím otvoru od horního konce');
    expect(point('edges').text).toContain('boky zadního dílu nad kapsou');
    expect(stepBody('edges')).toContain('boky zadního dílu nad kapsou');
    expect(point('thumb-cutout').text).toContain('12 mm');
    expect(point('peel-template').text).toContain('12 mm');
    expect(project.template?.pieces.find((p) => p.id === 'front')?.thumbCutout?.depthMm).toBe(12);
  });

  it('„Kde jste v postupu“ najde body v každé lekci pouzdra', () => {
    for (const lesson of project.lessons) {
      expect(overviewAroundLesson(sections, lesson.slug).length, lesson.slug).toBeGreaterThan(0);
    }
    expect(formatNumberRanges(pointNumbersForLesson(sections, '01-prepare-workspace'))).toBe('1–3');
  });
});

describe('Postup v kostce – výtisky a odkazy', () => {
  it('výpis tisku pouzdra s mincí: povinné po lekcích se součtem, podmíněné zvlášť mimo součet', () => {
    const lessons = coinCardHolderProject.lessons.map((l) => l.slug);
    const list = splitPrintList(overviewPrints(coinCardHolderProject, lessons));
    expect(list.required.map((g) => g.lessonOrder)).toEqual([1, 2, 4, 5]);
    for (const g of list.required) for (const r of g.rows) expect(r.condition).toBeUndefined();
    expect(list.totals.map((t) => `${t.sheetLabel} ${t.copies}×`)).toEqual([
      'Papírový model 1×',
      'Kapsa s mincí a otvor formy 3×',
      'Cvičný proužek pro lekci 4 1×',
      'Pás (šablona) 2×',
    ]);
    // Každá podmínka zvlášť, v pořadí lekcí; záložní okno 20 mm z lekce 2 je mezi nimi.
    expect(list.conditional.map((c) => c.rows.map((r) => [r.lessonOrder, r.sheetId]))).toEqual([
      [[2, 'kapsa-okno-20']],
      [[6, 'kapsa']],
      [[6, 'kapsa']],
      [[6, 'kapsa-okno-20']],
      [[6, 'sablona-kuze-1-2']],
    ]);
    expect(conditionLead('výtisk na značky nemáte z lekce 2')).toBe(
      'Jen když výtisk na značky nemáte z lekce 2:',
    );
  });

  it('výpis tisku s výběrem zdroje (tisková stránka): jen listy z toho zdroje', () => {
    const lessons = coinCardHolderProject.lessons.map((l) => l.slug);
    const practice = overviewPrints(coinCardHolderProject, lessons, { source: 'practice-sheets' });
    expect(practice.flatMap((g) => g.rows).map((r) => r.sheetId)).toEqual([
      'cvicny-prouzek-kuze-1-2',
    ]);
    const pattern = overviewPrints(coinCardHolderProject, lessons, { source: 'pattern-sheets' });
    expect(pattern.map((g) => g.lessonOrder)).toEqual([1, 2, 5, 6]);
    expect(pattern.flatMap((g) => g.rows).map((r) => r.sheetId)).not.toContain(
      'cvicny-prouzek-kuze-1-2',
    );
  });

  it('schéma odmítne odkaz bodu na stránku, kterou projekt nemá', () => {
    const base = beltProject;
    const withLink = {
      ...base,
      overview: {
        sections: [
          {
            title: 'X',
            points: [
              {
                id: 'x',
                text: 'Něco.',
                lessonSlug: base.lessons[0]!.slug,
                appLinks: [{ to: 'lid-sheets', label: 'Listy' }],
              },
            ],
          },
        ],
      },
    };
    const messages =
      projectDefinitionSchema.safeParse(withLink).error?.issues.map((i) => i.message) ?? [];
    expect(messages.join()).toContain('kterou projekt nemá');
  });
});

describe('výpis tisku – vysvětlení tenkého kartonu', () => {
  it('jen když má některý výtisk štítek podkladu', () => {
    const all = (p: typeof coinCardHolderProject) =>
      splitPrintList(
        overviewPrints(
          p,
          p.lessons.map((l) => l.slug),
        ),
      );
    expect(all(coinCardHolderProject).cardboardNote).toBe(CARDBOARD_NOTE);
    expect(all(cardHolderProject).cardboardNote).toBeUndefined();
  });
});
