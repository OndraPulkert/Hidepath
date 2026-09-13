import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cardHolderProject } from '@/content/projects/card-holder/project';
import { isUuid } from '@/features/data/local-collection';
import { createTestRepositories, renderApp } from '@/test/render';

const lesson = cardHolderProject.lessons[0]!;
const url = `/projects/${cardHolderProject.slug}/lessons/${lesson.slug}`;

describe('poznámky od ponku', () => {
  it('uloží poznámku při opuštění pole, idempotentně k lekci, a přežije reload', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const first = renderApp(url, { repositories });

    const field = await screen.findByLabelText('Poznámka k této lekci');
    await user.type(field, 'krok 3 – nevěděl jsem, kterou stranou otočit');
    await user.tab();

    await waitFor(async () => expect(await repositories.lessonNotes.list()).toHaveLength(1));
    const [saved] = await repositories.lessonNotes.list();
    expect(saved).toMatchObject({
      projectSlug: cardHolderProject.slug,
      lessonSlug: lesson.slug,
      text: 'krok 3 – nevěděl jsem, kterou stranou otočit',
    });
    expect(isUuid(saved!.id)).toBe(true);
    await screen.findByText(/^Uloženo /);

    // Druhý zápis do téže lekce = tentýž záznam, ne druhý řádek.
    await user.type(field, ' a lepidlo teklo');
    await user.tab();
    await waitFor(async () =>
      expect((await repositories.lessonNotes.list())[0]?.text).toContain('lepidlo teklo'),
    );
    expect(await repositories.lessonNotes.list()).toHaveLength(1);
    expect((await repositories.lessonNotes.list())[0]?.id).toBe(saved!.id);
    first.unmount();

    renderApp(url, { repositories });
    const again = await screen.findByLabelText('Poznámka k této lekci');
    await waitFor(() => expect((again as HTMLTextAreaElement).value).toContain('lepidlo teklo'));
  });

  it('vymazaný text záznam odstraní', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    renderApp(url, { repositories });
    const field = await screen.findByLabelText('Poznámka k této lekci');
    await user.type(field, 'x');
    await user.tab();
    await waitFor(async () => expect(await repositories.lessonNotes.list()).toHaveLength(1));
    await user.clear(field);
    await user.tab();
    await waitFor(async () => expect(await repositories.lessonNotes.list()).toHaveLength(0));
  });

  it('zkopíruje všechny poznámky k projektu do schránky', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderApp(url, { repositories });

    const copy = await screen.findByRole('button', { name: 'Zkopírovat všechny poznámky' });
    expect(copy).toBeDisabled();

    await user.type(await screen.findByLabelText('Poznámka k této lekci'), 'stůl je moc nízko');
    await user.tab();
    await waitFor(() => expect(copy).toBeEnabled());
    await user.click(copy);

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const text = writeText.mock.calls[0]![0];
    expect(text).toContain(cardHolderProject.title);
    expect(text).toContain(lesson.title);
    expect(text).toContain('stůl je moc nízko');
    await screen.findByText('Zkopírováno do schránky.');
  });
});
