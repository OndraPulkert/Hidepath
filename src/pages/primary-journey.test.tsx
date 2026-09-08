import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cardHolderProject } from '@/content/projects/card-holder/project';
import { enrollment, item } from '@/test/factories';
import { createTestRepositories, renderApp } from '@/test/render';

/**
 * Hlavní cesta v paměti: onboarding → nákupní seznam → odemknutí lekce → kontrolní body →
 * dokončení. Ověřuje propojení UI s doménovými pravidly, ne pravidla samotná.
 */
describe('hlavní cesta (lokální data)', () => {
  it('onboarding zapíše projekt a věci z domova označí jako Mám', async () => {
    const user = userEvent.setup();
    const { router, repositories } = renderApp('/');

    await screen.findByRole('heading', { level: 1, name: /první kožený výrobek/i });
    await user.click(screen.getByRole('button', { name: /pouzdro na karty/i }));

    await screen.findByRole('heading', { level: 1, name: 'Co už máte doma?' });
    await user.click(screen.getByRole('button', { name: /odlamovací nůž/i }));
    expect(screen.getByText(/máte 1 z/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Připravit můj plán' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));

    const enrollments = await repositories.enrollments.list();
    expect(enrollments).toHaveLength(1);
    expect(enrollments[0]).toMatchObject({
      projectSlug: 'card-holder',
      status: 'active',
      contentVersion: 1,
    });
    const inventory = await repositories.inventory.list();
    expect(inventory.find((i) => i.equipmentSlug === 'utility-knife')?.status).toBe('owned');
  });

  it('bez vybavení přehled radí projít nákupní seznam a je ve fázi Vybavení', async () => {
    const repositories = createTestRepositories();
    await repositories.enrollments.upsert({
      ...enrollment('card-holder'),
      id: crypto.randomUUID(),
    });
    renderApp('/dashboard', { repositories });
    expect(await screen.findByRole('link', { name: 'Otevřít nákupní seznam' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vybavení');
  });

  it('bez zapsaného projektu přehled nabízí výběr projektu', async () => {
    renderApp('/dashboard');
    expect(await screen.findByRole('link', { name: 'Vybrat projekt' })).toHaveAttribute(
      'href',
      '/onboarding',
    );
  });

  it('přepnutí položky na Mám v nákupním seznamu se propíše do dílny i rozpočtu', async () => {
    const user = userEvent.setup();
    const { repositories } = renderApp('/shopping');

    const group = await screen.findByRole('group', { name: /stav položky Děrovací vidličky/i });
    await user.click(within(group).getByRole('button', { name: 'Objednáno' }));
    expect(within(group).getByRole('button', { name: /Objednáno/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(group).getByRole('button', { name: 'Mám' }));

    await waitFor(async () => {
      const items = await repositories.inventory.list();
      expect(items.find((i) => i.equipmentSlug === 'stitching-chisels')?.status).toBe('owned');
    });
    expect(await screen.findByRole('button', { name: 'Mám (1)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('lekce se odemkne, až jsou všechny nezbytné položky Mám; body jdou odškrtat a lekci dokončit', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const lesson1 = cardHolderProject.lessons[0]!;

    // Zamčená lekce bez vybavení
    const first = renderApp(`/projects/card-holder/lessons/${lesson1.slug}`, { repositories });
    expect(await screen.findByText('Zamčeno')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Lekce je zamčená' }).closest('[role=note]'),
    ).toHaveTextContent(/čeká na/i);
    expect(screen.getByRole('button', { name: /^Dokončit/ })).toBeDisabled();
    first.unmount();

    // Doplnit vše nezbytné
    for (const req of cardHolderProject.equipment.filter((e) => e.priority === 'required')) {
      await repositories.inventory.upsert({
        ...item(req.equipmentSlug, 'owned'),
        id: crypto.randomUUID(),
      });
    }

    const { router } = renderApp(`/projects/card-holder/lessons/${lesson1.slug}`, { repositories });
    expect(await screen.findByText('Aktuální krok')).toBeInTheDocument();
    const done = screen.getByRole('button', { name: /^Dokončit/ });
    expect(done).toBeDisabled();

    for (const cp of lesson1.checkpoints.filter((c) => c.required)) {
      await user.click(
        screen.getByRole('checkbox', { name: new RegExp(escapeRegExp(cp.title.slice(0, 30))) }),
      );
    }
    await waitFor(() => expect(screen.getByRole('button', { name: /^Dokončit/ })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /^Dokončit/ }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/projects/card-holder/lessons/${cardHolderProject.lessons[1]!.slug}`,
      ),
    );
    const stored = await repositories.lessonProgress.list();
    expect(stored.find((l) => l.lessonSlug === lesson1.slug)?.status).toBe('completed');
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
