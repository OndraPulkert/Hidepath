import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers';
import { LessonPrep } from '@/components/lessons/lesson-prep';
import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { type LessonDefinition, type ProjectDefinition } from '@/content/schema';
import { type Repositories } from '@/features/data/repositories';
import { useInventory } from '@/features/inventory/use-inventory';
import { createTestRepositories, renderApp } from '@/test/render';

const ordered = [...coinCardHolderProject.lessons].sort((a, b) => a.order - b.order);
const base = ordered[2]!;
const earlier = ordered[1]!;

const lesson: LessonDefinition = {
  ...base,
  prints: [
    { source: 'pattern-sheets', sheetId: 'kapsa', copies: 3, purpose: 'forma a šablona' },
    {
      source: 'pattern-sheets',
      sheetId: 'sablona-kuze-1-2',
      copies: 1,
      purpose: 'záloha',
      condition: 'jen když se první výtisk pomačká',
    },
  ],
  requires: [{ id: 'kapsa-suche', fromLesson: earlier.slug, label: 'Vyschlá kapsa' }],
  materials: ['potravinová fólie a houbička (lekce 2, 4, 6 a 7)', 'houbička a voda'],
  requiredEquipment: ['scratch-awl'],
  recommendedEquipment: ['mallet'],
};

const project: ProjectDefinition = {
  ...coinCardHolderProject,
  lessons: coinCardHolderProject.lessons.map((l) => (l.slug === lesson.slug ? lesson : l)),
};

/** Jako na stránce lekce: inventář z dotazu, aby se „Mám“ u nástroje promítlo zpět. */
function Harness() {
  const { data } = useInventory();
  return <LessonPrep project={project} lesson={lesson} inventory={data ?? {}} />;
}

function renderPrep(repositories: Repositories = createTestRepositories()) {
  const router = createMemoryRouter([{ path: '*', element: <Harness /> }], {
    initialEntries: ['/'],
  });
  const utils = render(
    <AppProviders repositories={repositories}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...utils, repositories };
}

describe('Připravte si', () => {
  it('ukáže oddíly a souhrn jen z povinných položek', async () => {
    renderPrep();
    await screen.findByRole('heading', { level: 2, name: 'Připravte si' });
    for (const title of ['Vytisknout', 'Nástroje', 'Materiál', 'Z předchozích lekcí']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
    // 1 výtisk + 1 nezbytný nástroj + 2 materiály + 1 díl (podmíněný tisk a doporučené ne)
    expect(screen.getByText('Připraveno 0/5')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Připraveno 0 z 5' })).toBeInTheDocument();
  });

  it('odkaz na tisk předvybere list a zobrazí počet výtisků i podmínku', async () => {
    renderPrep();
    const link = await screen.findByRole('link', { name: /Kapsa s.mincí a.otvor formy/ });
    expect(link).toHaveAttribute('href', `/projects/${project.slug}/template?list=kapsa`);
    expect(screen.getByText(/3 výtisky · forma a šablona/)).toBeInTheDocument();
    expect(screen.getByText('Jen když')).toBeInTheDocument();
  });

  it('„Mám“ u materiálu a dílu uloží zaškrtnutí, změní souhrn a přežije nové vykreslení', async () => {
    const user = userEvent.setup();
    const { repositories, unmount } = renderPrep();

    const toggle = await screen.findByRole('button', { name: 'Mám: Vyschlá kapsa' });
    await waitFor(() => expect(toggle).toBeEnabled());
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);

    expect(await screen.findByText('Připraveno 1/5')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await waitFor(async () => expect(await repositories.prepChecks.list()).toHaveLength(1));
    expect((await repositories.prepChecks.list())[0]).toMatchObject({
      projectSlug: project.slug,
      lessonSlug: lesson.slug,
      itemKey: 'req:kapsa-suche',
      checked: true,
    });

    await user.click(screen.getByRole('button', { name: 'Mám: houbička a voda' }));
    await screen.findByText('Připraveno 2/5');
    await waitFor(async () => expect(await repositories.prepChecks.list()).toHaveLength(2));
    unmount();

    renderPrep(repositories);
    expect(await screen.findByText('Připraveno 2/5')).toBeInTheDocument();
    const again = screen.getByRole('button', { name: 'Mám: Vyschlá kapsa' });
    expect(again).toHaveAttribute('aria-pressed', 'true');

    // Odškrtnutí = tentýž záznam s checked: false, ne druhý řádek.
    await user.click(again);
    await screen.findByText('Připraveno 1/5');
    await waitFor(async () => {
      const rows = await repositories.prepChecks.list();
      expect(rows).toHaveLength(2);
      expect(rows.find((r) => r.itemKey === 'req:kapsa-suche')?.checked).toBe(false);
    });
  });

  it('„Mám“ u nástroje přepíná inventář, ne zaškrtnutí přípravy', async () => {
    const user = userEvent.setup();
    const { repositories } = renderPrep();
    const name = `Mám: ${equipmentCatalog['scratch-awl']!.name}`;
    await user.click(await screen.findByRole('button', { name }));

    await waitFor(async () => {
      const inv = await repositories.inventory.list();
      expect(inv.find((i) => i.equipmentSlug === 'scratch-awl')?.status).toBe('owned');
    });
    await screen.findByText('Připraveno 1/5');
    expect(await repositories.prepChecks.list()).toEqual([]);

    await user.click(screen.getByRole('button', { name }));
    await waitFor(async () => {
      const inv = await repositories.inventory.list();
      expect(inv.find((i) => i.equipmentSlug === 'scratch-awl')?.status).toBe('want_to_buy');
    });
    await screen.findByText('Připraveno 0/5');
  });

  it('materiál z „Mějte doma“ nákupního plánu odkazuje na nákupní seznam, jiný ne', async () => {
    renderPrep();
    const links = await screen.findAllByRole('link', { name: 'Na nákupním seznamu' });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/shopping');
  });

  it('díl z dřívější lekce odkazuje na lekci a říká, že ještě není hotová', async () => {
    renderPrep();
    const link = await screen.findByRole('link', { name: new RegExp(earlier.title) });
    expect(link).toHaveAttribute('href', `/projects/${project.slug}/lessons/${earlier.slug}`);
    expect(screen.getByText('Lekce ještě není hotová')).toBeInTheDocument();
  });
});

describe('Připravte si na stránce lekce', () => {
  it('tisk z lekce předvybere list a řekne počet výtisků', async () => {
    const withPrint = cardHolderProject.lessons.find((l) =>
      l.prints?.some((p) => p.source === 'practice-sheets'),
    )!;
    const print = withPrint.prints!.find((p) => p.source === 'practice-sheets')!;
    renderApp(`/projects/${cardHolderProject.slug}/lessons/${withPrint.slug}`);
    const section = (
      await screen.findByRole('heading', { level: 2, name: 'Připravte si' })
    ).closest('section')!;
    expect(within(section).getByRole('heading', { name: 'Vytisknout' })).toBeInTheDocument();
    const sheet = cardHolderProject.practiceSheets!.sheets.find((s) => s.id === print.sheetId)!;
    expect(within(section).getByRole('link', { name: new RegExp(sheet.title) })).toHaveAttribute(
      'href',
      `/projects/${cardHolderProject.slug}/practice-sheets?list=${print.sheetId}`,
    );
    expect(within(section).getByText(/^1 výtisk · /)).toBeInTheDocument();
    expect(within(section).getByText(/^Připraveno 0\/\d+$/)).toBeInTheDocument();
  });
});
