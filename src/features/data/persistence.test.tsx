import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cardHolderProject } from '@/content/projects/card-holder/project';
import { isUuid } from '@/features/data/local-collection';
import { createTestRepositories, renderApp } from '@/test/render';
import { enrollment, item } from '@/test/factories';

/**
 * Regresní testy zápisů: dvě různé položky = dva řádky s různými UUID, kontrolní body se
 * ukládají každý zvlášť a stav přežije „reload“ (nový render nad stejným úložištěm).
 */
describe('persistence zápisů', () => {
  it('přepnutí dvou různých položek uloží dva záznamy s vlastními UUID', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    renderApp('/shopping', { repositories });

    const knife = await screen.findByRole('group', { name: /stav položky Odlamovací nůž/i });
    await user.click(within(knife).getByRole('button', { name: 'Mám' }));
    const ruler = screen.getByRole('group', { name: /stav položky Kovové pravítko/i });
    await user.click(within(ruler).getByRole('button', { name: 'Objednáno' }));

    await waitFor(async () => {
      const items = await repositories.inventory.list();
      expect(items).toHaveLength(2);
    });
    const items = await repositories.inventory.list();
    expect(new Set(items.map((i) => i.id)).size).toBe(2);
    expect(items.every((i) => isUuid(i.id))).toBe(true);
    expect(items.find((i) => i.equipmentSlug === 'utility-knife')?.status).toBe('owned');
    expect(items.find((i) => i.equipmentSlug === 'steel-ruler')?.status).toBe('ordered');
  });

  it('opakované přepnutí stejné položky zachová její id a createdAt', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    renderApp('/shopping', { repositories });

    const group = await screen.findByRole('group', { name: /stav položky Palička/i });
    await user.click(within(group).getByRole('button', { name: 'Objednáno' }));
    await waitFor(async () => expect(await repositories.inventory.list()).toHaveLength(1));
    const [first] = await repositories.inventory.list();
    await user.click(within(group).getByRole('button', { name: 'Mám' }));
    await waitFor(async () =>
      expect((await repositories.inventory.list())[0]?.status).toBe('owned'),
    );
    const [second] = await repositories.inventory.list();
    expect(second?.id).toBe(first?.id);
    expect(second?.createdAt).toBe(first?.createdAt);
  });

  it('každý kontrolní bod je vlastní záznam, lekce dostane jediný záznam in_progress a stav přežije reload', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const lesson = cardHolderProject.lessons[0]!;
    await repositories.enrollments.upsert({
      ...enrollment('card-holder'),
      id: crypto.randomUUID(),
    });
    for (const slug of lesson.requiredEquipment) {
      await repositories.inventory.upsert({ ...item(slug, 'owned'), id: crypto.randomUUID() });
    }

    const first = renderApp(`/projects/card-holder/lessons/${lesson.slug}`, { repositories });
    const boxes = await screen.findAllByRole('checkbox');
    await user.click(boxes[0]!);
    await user.click(boxes[1]!);
    await user.click(boxes[2]!);

    await waitFor(async () => expect(await repositories.checkpointProgress.list()).toHaveLength(3));
    const checkpoints = await repositories.checkpointProgress.list();
    expect(new Set(checkpoints.map((c) => c.id)).size).toBe(3);
    expect(checkpoints.every((c) => isUuid(c.id))).toBe(true);

    const lessons = await repositories.lessonProgress.list();
    expect(lessons).toHaveLength(1);
    expect(lessons[0]).toMatchObject({ lessonSlug: lesson.slug, status: 'in_progress' });
    expect(lessons.every((l) => (l.status as string) !== 'locked')).toBe(true);
    first.unmount();

    renderApp(`/projects/card-holder/lessons/${lesson.slug}`, { repositories });
    const after = await screen.findAllByRole('checkbox');
    await waitFor(() =>
      expect(after.filter((b) => (b as HTMLInputElement).checked)).toHaveLength(3),
    );
  });

  it('úložiště odmítne záznam bez UUID', async () => {
    const repositories = createTestRepositories();
    await expect(
      repositories.inventory.upsert(item('x', 'owned', { id: 'optimistic' })),
    ).rejects.toThrow(/UUID/);
  });

  it('zápis dřív, než se načte inventář, nezahodí cenu ani obchod a nezaloží duplicitu', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    await repositories.inventory.upsert({
      ...item('mallet', 'owned', {
        purchasePriceCents: 51_000,
        shopName: 'CraftPoint',
        purchasedAt: '2026-09-01',
      }),
      id: crypto.randomUUID(),
    });
    // Pomalé načtení: první dotaz na seznam se zdrží, klik přijde dřív.
    const originalList = repositories.inventory.list.bind(repositories.inventory);
    let delayed = false;
    repositories.inventory.list = async () => {
      if (!delayed) {
        delayed = true;
        await new Promise((r) => setTimeout(r, 150));
      }
      return originalList();
    };

    renderApp('/shopping', { repositories });
    const group = await screen.findByRole('group', { name: /stav položky Palička/i });
    const orderedButton = within(group).getByRole('button', { name: 'Objednáno' });
    // Během načítání je přepínač vypnutý; po načtení se odemkne a zápis proběhne nad skutečným záznamem.
    expect(orderedButton).toBeDisabled();
    await waitFor(() => expect(orderedButton).toBeEnabled());
    await user.click(orderedButton);

    await waitFor(async () => {
      const items = await repositories.inventory.list();
      expect(items.find((i) => i.equipmentSlug === 'mallet')?.status).toBe('ordered');
    });
    const items = await repositories.inventory.list();
    expect(items.filter((i) => i.equipmentSlug === 'mallet')).toHaveLength(1);
    expect(items[0]).toMatchObject({
      purchasePriceCents: 51_000,
      shopName: 'CraftPoint',
      purchasedAt: '2026-09-01',
    });
  });
});
