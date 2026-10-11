import { screen } from '@testing-library/react';

import { routes } from '@/app/routes';
import { ProjectOverviewCard } from '@/components/projects/project-overview';
import { projects } from '@/content/projects';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { type ProjectDefinition } from '@/content/schema';
import { hasOverview } from '@/features/overview/project-overview';
import { mountText, sheetMounts } from '@/features/prep/print-mount';
import { typo } from '@/lib/utils/format';
import { renderApp, renderWithProviders } from '@/test/render';

/** Výtisky s podkladem (`mount`) napříč lekcemi projektu. */
function mountedPrints(project: ProjectDefinition) {
  return project.lessons.flatMap((lesson) =>
    (lesson.prints ?? []).flatMap((print) =>
      print.mount ? [{ lesson, print, text: typo(mountText(print.mount)) }] : [],
    ),
  );
}

const badgeTexts = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-print-mount]')].map((el) => el.textContent);

const withMounts = projects.filter((p) => mountedPrints(p).length > 0);

describe('štítek podkladu výtisku (tenký karton)', () => {
  it('podklad mají projekty 02, 03 a pásek; 01 tiskne na obyčejný papír', () => {
    expect(withMounts.map((p) => p.slug).sort()).toEqual([
      'belt',
      'coin-card-holder',
      'lid-wallet',
    ]);
  });

  describe.each(withMounts.map((p) => [p.slug, p] as const))('%s', (_slug, project) => {
    const prints = mountedPrints(project);
    const lessons = [...new Set(prints.map((p) => p.lesson))];

    it.each(lessons.map((l) => [l.order, l] as const))(
      'Připravte si, lekce %i: štítek u každého podloženého výtisku',
      async (_order, lesson) => {
        renderApp(routes.lesson(project.slug, lesson.slug));
        const prep = (
          await screen.findByRole('heading', { level: 2, name: 'Připravte si' })
        ).closest('section')!;
        const expected = prints.filter((p) => p.lesson === lesson).map((p) => p.text);
        expect(badgeTexts(prep)).toEqual(expected);
      },
    );

    it('tisková stránka: štítek u listu každého podloženého výtisku', async () => {
      renderApp(routes.template(project.slug));
      const fieldset = (await screen.findByText('Co vytisknout')).closest('fieldset')!;
      for (const { print, text } of prints) {
        const box = fieldset.querySelector<HTMLInputElement>(`#sheet-${print.sheetId}`)!;
        expect(box, print.sheetId).not.toBeNull();
        expect(badgeTexts(box.closest('label')!), print.sheetId).toContain(text);
      }
    });

    it('Postup v kostce: štítek u každého podloženého výtisku', () => {
      if (!hasOverview(project)) throw new Error('projekt bez přehledu');
      const listed = new Set(
        project.overview.sections.flatMap((s) => s.points.flatMap((p) => p.printsFrom ?? [])),
      );
      // Každá lekce s podloženým výtiskem je ve výpisu tisku přehledu.
      for (const lesson of lessons) expect(listed.has(lesson.slug), lesson.slug).toBe(true);
      const { container } = renderWithProviders(<ProjectOverviewCard project={project} />);
      expect(badgeTexts(container).sort()).toEqual(prints.map((p) => p.text).sort());
    });
  });

  it('tisková stránka pouzdra s mincí: povinné se součtem, podmíněné zvlášť mimo součet', async () => {
    renderApp(routes.template(coinCardHolderProject.slug));
    const plan = (await screen.findByText('Kolik vytisknout')).closest('[data-print-plan]')!;
    const flat = (el: Element) => (el.textContent ?? '').replace(/\s/g, ' ');
    expect(flat(plan)).toContain(
      'Celkem vytisknout: Papírový model 1×, Kapsa s mincí a otvor formy 3×, Pás (šablona) 2×',
    );
    const extra = plan.querySelector('[data-print-conditional]')!;
    expect(flat(extra)).toMatch(/^Jen v případě potřeby \(do součtu se nepočítá\)Jen když /);
    expect(flat(extra)).toContain('Jen když výtisk na značky nemáte z lekce 2:');
    // Cvičný proužek je na stránce cvičných listů, ne tady.
    expect(plan.textContent).not.toContain('Cvičný proužek');
  });

  it('variantu listu (mince 40 mm, kůže 1,5 mm) tisková stránka značí jako výchozí list', () => {
    const sheets = coinCardHolderProject.patternSheets!.sheets;
    const sheet = (id: string) => sheets.find((s) => s.id === id)!;
    const text = (id: string) =>
      sheetMounts(coinCardHolderProject, 'pattern-sheets', sheet(id))?.groups.map((g) => g.text);
    expect(text('kapsa-40mm')).toEqual(text('kapsa'));
    expect(text('papirovy-model')).toEqual([
      'Nalepit na tenký karton (krabice od cereálií) – model musí po složení a naplnění držet tvar',
    ]);
    // PÁS: 1. výtisk se rozřeže (papír), 2. je šablona s okénkem (na kartonu).
    expect(text('sablona')).toEqual(text('sablona-kuze-1-2'));
    expect(text('sablona-kuze-1-2')).toEqual([
      'Nalepit na tenký karton (krabice od cereálií) – okénko je doraz pro polohu kapsy',
    ]);
  });
});
