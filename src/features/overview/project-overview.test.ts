import { projects } from '@/content/projects';
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
} from '@/features/overview/project-overview';

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

  it('15–25 krátkých bodů, bod 1 je tisk z lekcí 1, 2 a 4', () => {
    expect(points.length).toBeGreaterThanOrEqual(15);
    expect(points.length).toBeLessThanOrEqual(25);
    expect(points[0]!.point.printsFrom).toEqual([
      '01-measure-and-sheets',
      '02-paper-model',
      '04-cut-and-mark',
    ]);
    for (const p of points) {
      const sentences = p.point.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.point.id).toBeLessThanOrEqual(3);
    }
  });

  it('výtisky: list 1 4×, list 2 2×, list 3 3×, list 4 3×; řez z prvního výtisku, šablona z druhého', () => {
    const groups = overviewPrints(project, points[0]!.point.printsFrom!);
    expect(printTotals(groups).map((t) => `${t.sheetLabel} ${t.copies}×`)).toEqual([
      'List 1 4×',
      'List 2 2×',
      'List 3 3×',
      'List 4 3×',
    ]);
    const cut = groups.find((g) => g.lessonOrder === 4)!;
    expect(cut.rows.find((r) => r.sheetId === 'sablona')).toMatchObject({ copies: 2 });
    expect(cut.rows.find((r) => r.sheetId === 'dily')).toMatchObject({ copies: 2 });
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

  it('kůže u dílů: kaštan P1, nebarvená kozinka D1 a L1, čokoládová D2', () => {
    expect(text('measure').text).toContain(
      'P1 (kaštan), D1 a L1 (nebarvená kozinka) a D2 (čokoládová kozinka)',
    );
    expect(text('cut-parts').text).toContain(
      'D1 a přířez L1 z nebarvené kozinky a D2 z čokoládové',
    );
  });
});
