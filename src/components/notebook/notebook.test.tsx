import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers';
import { routes } from '@/app/routes';
import { StepExtras } from '@/components/lessons/step-extras';
import { ProjectFindings } from '@/components/notebook/project-findings';
import { type Repositories } from '@/features/data/repositories';
import { isUuid } from '@/features/data/local-collection';
import { notebookProject, projectWithoutNotebook, recordEntry } from '@/test/notebook-fixtures';
import { createTestRepositories } from '@/test/render';

function renderUi(ui: ReactElement, repositories: Repositories = createTestRepositories()) {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: ['/'] });
  return {
    repositories,
    router,
    ...render(
      <AppProviders repositories={repositories}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}

const lessonBySlug = (slug: string) => notebookProject.lessons.find((l) => l.slug === slug)!;
const stepOf = (lessonSlug: string, stepId: string) =>
  lessonBySlug(lessonSlug).steps.find((s) => s.id === stepId)!;

function extras(lessonSlug: string, stepId: string) {
  return (
    <StepExtras
      project={notebookProject}
      lesson={lessonBySlug(lessonSlug)}
      step={stepOf(lessonSlug, stepId)}
    />
  );
}

const L5 = '05-transfer-and-cut';
const L4 = '04-saddle-stitch';

describe('zápisník v kroku', () => {
  it('číslo uloží při opuštění pole, upozorní mimo cíl a po opravě potvrdí cíl', async () => {
    const user = userEvent.setup();
    const { repositories } = renderUi(extras(L5, 'print-check'));

    const field = await screen.findByLabelText('Kontrolní úsečka');
    expect(field).toHaveAttribute('inputmode', 'decimal');
    await user.type(field, '51');
    await user.tab();

    await waitFor(async () => expect(await repositories.lessonRecords.list()).toHaveLength(1));
    const [saved] = await repositories.lessonRecords.list();
    expect(saved).toMatchObject({
      projectSlug: notebookProject.slug,
      lessonSlug: L5,
      fieldId: 'print-line',
      value: 51,
      contentVersion: notebookProject.contentVersion,
    });
    expect(isUuid(saved!.id)).toBe(true);
    expect(await screen.findByText(/Mimo cíl \(cíl 50/)).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, '50,2{Enter}');
    expect(await screen.findByText(/V cíli \(cíl 50/)).toBeInTheDocument();
    const after = await repositories.lessonRecords.list();
    expect(after).toHaveLength(1);
    expect(after[0]).toMatchObject({ id: saved!.id, value: 50.2, createdAt: saved!.createdAt });
  });

  it('co dopíšete během ukládání, v poli zůstane', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    let release: (() => void) | undefined;
    const upsert = repositories.lessonRecords.upsert.bind(repositories.lessonRecords);
    repositories.lessonRecords.upsert = async (record) => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return upsert(record);
    };
    renderUi(extras(L5, 'print-check'), repositories);

    const field = await screen.findByLabelText('Kontrolní úsečka');
    await user.type(field, '50{Enter}');
    await screen.findByText('Ukládám…');
    await user.type(field, ',5');
    release?.();
    await waitFor(async () => expect(await repositories.lessonRecords.list()).toHaveLength(1));
    await waitFor(() => expect(screen.queryByText('Ukládám…')).not.toBeInTheDocument());
    expect(field).toHaveValue('50,5');
  });

  it('nesmyslné číslo neuloží a řekne proč', async () => {
    const user = userEvent.setup();
    const { repositories } = renderUi(extras(L5, 'print-check'));
    const field = await screen.findByLabelText('Kontrolní úsečka');
    await user.type(field, 'padesát');
    await user.tab();
    expect(await screen.findByText('Zadejte číslo, např. 0,85.')).toBeInTheDocument();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(await repositories.lessonRecords.list()).toHaveLength(0);
  });

  it('vymazání zapíše náhrobek (null), ne smazání řádku', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    await repositories.lessonRecords.upsert(recordEntry('print-note', 'tiskárna zmenšuje'));
    renderUi(extras(L5, 'print-check'), repositories);
    const field = await screen.findByLabelText('Poznámka k tisku');
    await waitFor(() => expect(field).toHaveValue('tiskárna zmenšuje'));
    await user.clear(field);
    await user.tab();
    await waitFor(async () =>
      expect((await repositories.lessonRecords.list())[0]?.value).toBeNull(),
    );
    expect(await repositories.lessonRecords.list()).toHaveLength(1);
  });

  it('volba se uloží klepnutím a druhým klepnutím zruší', async () => {
    const user = userEvent.setup();
    const { repositories } = renderUi(extras(L4, 'glue'));
    const group = await screen.findByRole('group', { name: 'Jak drží spoj' });
    const better = within(group).getByRole('button', { name: 'Líp' });
    await user.click(better);
    await waitFor(async () =>
      expect((await repositories.lessonRecords.list())[0]?.value).toBe('better'),
    );
    expect(better).toHaveAttribute('aria-pressed', 'true');
    await user.click(better);
    await waitFor(async () =>
      expect((await repositories.lessonRecords.list())[0]?.value).toBeNull(),
    );
    expect(better).toHaveAttribute('aria-pressed', 'false');
  });

  it('krok bez zápisníku, připomínek a čekání nevykreslí nic', () => {
    const { container } = renderUi(extras(L5, 'choose-area'));
    expect(container).toBeEmptyDOMElement();
  });
});

describe('připomínky v kroku', () => {
  it('nezapsané hodnoty: odkaz na dřívější lekci, v téže lekci číslo kroku', async () => {
    renderUi(extras(L5, 'transfer'));
    const list = await screen.findByRole('list', { name: 'Z vašeho zápisníku' });
    const link = within(list).getByRole('link', { name: 'lekce 1 →' });
    expect(link).toHaveAttribute(
      'href',
      routes.lesson(notebookProject.slug, '01-prepare-workspace'),
    );
    expect(within(list).getByText(/zatím nezapsáno – krok 1 této lekce/)).toBeInTheDocument();
  });

  it('zapsané hodnoty ukáže i s upozorněním mimo cíl', async () => {
    const repositories = createTestRepositories();
    await repositories.lessonRecords.upsert(recordEntry('chisel-pitch', 3.85));
    await repositories.lessonRecords.upsert(recordEntry('print-line', 48));
    renderUi(extras(L5, 'transfer'), repositories);
    const list = await screen.findByRole('list', { name: 'Z vašeho zápisníku' });
    expect(within(list).getByText(/^3,85\smm$/)).toBeInTheDocument();
    expect(within(list).getByText(/^48\smm$/)).toBeInTheDocument();
    expect(within(list).getByText(/mimo cíl/)).toBeInTheDocument();
  });

  it('volba zapsaná o krok dřív se připomene popiskem', async () => {
    const repositories = createTestRepositories();
    await repositories.lessonRecords.upsert(recordEntry('glue-hold', 'worse'));
    renderUi(extras(L4, 'punch-two-layers'), repositories);
    expect(await screen.findByText('Hůř')).toBeInTheDocument();
  });
});

describe('Co jsem zjistil', () => {
  it('projekt bez polí zápisníku kartu nemá', async () => {
    const { container } = renderUi(<ProjectFindings project={projectWithoutNotebook} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(container).toBeEmptyDOMElement();
  });

  it('bez zápisů řekne, kde se zapisuje', async () => {
    renderUi(<ProjectFindings project={notebookProject} />);
    expect(await screen.findByText(/Zatím nic nezapsáno/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zkopírovat zápisník' })).toBeDisabled();
  });

  it('ukáže zápisy po lekcích s odkazem na krok a zkopíruje je', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const repositories = createTestRepositories();
    await repositories.lessonRecords.upsert(recordEntry('chisel-pitch', 3.85));
    await repositories.lessonRecords.upsert(recordEntry('print-line', 51));
    await repositories.lessonRecords.upsert(recordEntry('glue-hold', null));
    renderUi(<ProjectFindings project={notebookProject} />, repositories);

    const card = (await screen.findByRole('heading', { name: 'Co jsem zjistil' })).parentElement!;
    const lessons = await within(card).findAllByRole('heading', { level: 3 });
    expect(lessons.map((h) => h.textContent?.replace(/\u00a0/g, ' '))).toEqual([
      '01 · Příprava pracovního místa a seznámení s nástroji',
      '05 · Přenesení šablony a řezání dílů',
    ]);
    expect(within(card).getByText(/^3,85\smm$/)).toBeInTheDocument();
    expect(within(card).getByText(/mimo cíl \(cíl 50/)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /^Krok 3:/ })).toHaveAttribute(
      'href',
      routes.lessonFocus(notebookProject.slug, '01-prepare-workspace', 3),
    );
    expect(within(card).getByText('2 zápisy')).toBeInTheDocument();

    await user.click(within(card).getByRole('button', { name: 'Zkopírovat zápisník' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]![0]).toContain('Rozteč vidlice: 3,85 mm – krok 3');
    expect(await within(card).findByText('Zkopírováno do schránky.')).toBeInTheDocument();
  });
});
