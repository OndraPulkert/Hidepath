import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import {
  type CollectionRepository,
  createMemoryStorage,
  type StorageLike,
} from '@/features/data/local-collection';
import { createLocalRepositories, type Repositories } from '@/features/data/repositories';
import { createUserSync } from '@/features/sync/synced-collection';
import { enrollment, item } from '@/test/factories';
import { createTestRepositories, renderApp, setOnline } from '@/test/render';

const USER_ID = '00000000-0000-4000-8000-000000000001';

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

/**
 * Zápisník, příprava a dílenský režim nad skutečným obsahem. „Reload“ = odmontovat aplikaci
 * a vykreslit ji znovu nad týmž úložištěm (nové repozitáře, nový QueryClient).
 */
describe('hlavní cesta: zápisník, příprava a dílenský režim', () => {
  const coin = coinCardHolderProject;
  const coinL3 = coin.lessons.find((l) => l.slug === '03-skiving-and-hardware')!;
  const coinL8 = coin.lessons.find((l) => l.slug === '08-snap-cap-tongue-edges')!;
  const failingRemote = <T extends { id: string }>(): CollectionRepository<T> => ({
    list: () => Promise.reject(new Error('Failed to fetch')),
    upsert: () => Promise.reject(new Error('Failed to fetch')),
    remove: () => Promise.reject(new Error('Failed to fetch')),
    clear: () => Promise.reject(new Error('Failed to fetch')),
  });

  /** Účet bez sítě: zápisník a příprava jdou do lokální kopie a outboxu, server je nedostupný. */
  function offlineAccountRepositories(storage: StorageLike, online: () => boolean) {
    const sync = createUserSync({
      storage,
      userId: USER_ID,
      remote: { lessonRecords: failingRemote(), prepChecks: failingRemote() },
      isOnline: online,
    });
    const repositories: Repositories = {
      ...createLocalRepositories(storage),
      lessonRecords: sync.lessonRecords,
      prepChecks: sync.prepChecks,
    };
    return { repositories, sync };
  }

  afterEach(() => setOnline(true));

  it('zápis offline přežije reload a ukáže se v „Co jsem zjistil“ i v připomínce lekce 8', async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    setOnline(false);
    const first = offlineAccountRepositories(storage, () => false);

    // Lekce 3: který výsečník sedl pro klobouček.
    const lesson3 = renderApp(routes.lesson(coin.slug, coinL3.slug), {
      repositories: first.repositories,
    });
    const group = await screen.findByRole('group', {
      name: /Otvor pro klobouček: který výsečník sedl/,
    });
    await user.click(within(group).getByRole('button', { name: /^3.mm$/ }));
    await waitFor(() =>
      expect(within(group).getByRole('button', { name: /^3.mm$/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    await waitFor(() => expect(within(group).getByRole('status')).toHaveTextContent('Uloženo'));
    // Bez sítě zápis čeká v outboxu, nic se neztratilo.
    expect(first.sync.controller.getSnapshot().pendingCount).toBe(1);
    lesson3.unmount();

    // Reload: nové repozitáře nad týmž úložištěm, stále offline.
    const second = offlineAccountRepositories(storage, () => false);
    const projectPage = renderApp(routes.project(coin.slug), { repositories: second.repositories });
    const findings = await screen.findByRole('region', { name: 'Co jsem zjistil' });
    await waitFor(() =>
      expect(findings).toHaveTextContent(/Otvor pro klobouček: který výsečník sedl\s*3.mm/),
    );
    expect(
      within(findings).getByRole('link', { name: /^Krok \d+: Osaďte kloboučkovou/ }),
    ).toHaveAttribute('href', expect.stringContaining(`/lessons/${coinL3.slug}/focus?krok=`));
    projectPage.unmount();

    renderApp(routes.lesson(coin.slug, coinL8.slug), { repositories: second.repositories });
    const capRecall = /Výsečník pro klobouček, který vám sedl v.lekci 3: 3.mm/;
    const recalls = await screen.findAllByRole('list', { name: 'Z vašeho zápisníku' });
    expect(recalls.filter((r) => capRecall.test(r.textContent ?? ''))).toHaveLength(1);
    expect(second.sync.controller.getSnapshot().pendingCount).toBe(1);
  });

  it('zaškrtnutí přípravy v lekci 2 přežije reload a odkaz na tisk předvybere list', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const coinL2 = coin.lessons.find((l) => l.slug === '02-wet-forming-coin')!;
    const first = renderApp(routes.lesson(coin.slug, coinL2.slug), { repositories });

    const prep = (await screen.findByRole('heading', { level: 2, name: 'Připravte si' })).closest(
      'section',
    )!;
    const toggle = within(prep).getByRole('button', { name: 'Mám: Kapsa s mincí a otvor formy' });
    await waitFor(() => expect(toggle).toBeEnabled());
    const before = within(prep).getByText(/^Připraveno \d+\/\d+$/).textContent;
    await user.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'));
    expect(within(prep).getByText(/^Připraveno \d+\/\d+$/).textContent).not.toBe(before);
    first.unmount();

    const { router } = renderApp(routes.lesson(coin.slug, coinL2.slug), { repositories });
    const again = (await screen.findByRole('heading', { level: 2, name: 'Připravte si' })).closest(
      'section',
    )!;
    await waitFor(() =>
      expect(
        within(again).getByRole('button', { name: 'Mám: Kapsa s mincí a otvor formy' }),
      ).toHaveAttribute('aria-pressed', 'true'),
    );

    // Tisk začíná nahoře stránky, ne v místě, kde byl seznam v lekci.
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await user.click(within(again).getByRole('link', { name: /^Kapsa s.mincí a.otvor formy/ }));
    await waitFor(() => expect(scrollTo).toHaveBeenLastCalledWith(0, 0));
    scrollTo.mockRestore();
    await waitFor(() => expect(router.state.location.pathname).toBe(routes.template(coin.slug)));
    expect(router.state.location.search).toBe('?list=kapsa');
    const fieldset = (await screen.findByText('Co vytisknout')).closest('fieldset')!;
    const checked = within(fieldset)
      .getAllByRole('checkbox')
      .filter((c) => (c as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
    expect(checked[0]!.closest('label')).toHaveTextContent(/Kapsa s.mincí a.otvor formy/);
  });

  it('časovač spuštěný v dílenském režimu běží dál po reloadu', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date(2026, 9, 7, 10, 0, 0) });
    try {
      localStorage.clear();
      const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
      const lesson4 = cardHolderProject.lessons.find((l) => l.slug === '04-saddle-stitch')!;
      const glueStep = lesson4.steps.findIndex((s) => s.waits) + 1;
      const url = routes.lessonFocus(cardHolderProject.slug, lesson4.slug, glueStep);

      const first = renderApp(url);
      const card = await screen.findByRole('region', { name: /odvětrání lepidla/i });
      expect(card).toHaveTextContent(
        'Výchozí doba je jen orientační – nastavte ji podle návodu na obalu.',
      );
      await user.click(within(card).getByRole('button', { name: /^Spustit 10/ }));
      expect(within(card).getByRole('timer')).toHaveTextContent('10:00');
      act(() => vi.advanceTimersByTime(3 * 60_000));
      first.unmount();

      act(() => vi.advanceTimersByTime(60_000));
      renderApp(url);
      const again = await screen.findByRole('region', { name: /odvětrání lepidla/i });
      expect(within(again).getByRole('timer')).toHaveTextContent('6:00');
      act(() => vi.advanceTimersByTime(60_000));
      expect(within(again).getByRole('timer')).toHaveTextContent('5:00');
    } finally {
      vi.useRealTimers();
      localStorage.clear();
    }
  });

  it('tisk listů Víčka předvyplní hodnoty zapsané v lekcích 1, 2 a 11', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    const lid = lidWalletProject;
    const lessonOf = (order: number) => lid.lessons.find((l) => l.order === order)!;

    const type = async (label: RegExp, value: string) => {
      const input = await screen.findByLabelText(label);
      await user.clear(input);
      await user.type(input, `${value}{Enter}`);
      await waitFor(() =>
        expect(
          screen.getAllByRole('status').some((s) => /Uloženo|cíl/.test(s.textContent ?? '')),
        ).toBe(true),
      );
    };

    const l1 = renderApp(routes.lesson(lid.slug, lessonOf(1).slug), { repositories });
    await type(/^P1 \(kaštan\)/, '1,1');
    await type(/^D1 \(nebarvená kozinka\)/, '0,7');
    await type(/^D2 \(čokoládová kozinka\)/, '0,85');
    await type(/^L1 \(nebarvená kozinka\)/, '0,6');
    l1.unmount();

    const l2 = renderApp(routes.lesson(lid.slug, lessonOf(2).slug), { repositories });
    await type(/^Zvednutí svazku 6 karet nad G2/, '2,4');
    l2.unmount();

    const l11 = renderApp(routes.lesson(lid.slug, lessonOf(11).slug), { repositories });
    await type(/^Tloušťka vybraného magnetu Ø 8/, '2');
    l11.unmount();

    await waitFor(async () => expect(await repositories.lessonRecords.list()).toHaveLength(6));

    renderApp(routes.template(lid.slug), { repositories });
    const note = await screen.findByText(/Předvyplněno ze zápisníku:/);
    expect(note.parentElement).toHaveTextContent(
      'P1, přepážky (větší z D1 a D2), podšívka L1, zvednutí karet, tloušťka magnetu',
    );
    expect(screen.getByLabelText('P1 (kaštan), mm')).toHaveValue('1,1');
    expect(screen.getByLabelText('Přepážky D1/D2, mm')).toHaveValue('0,85');
    expect(screen.getByLabelText('Podšívka L1, mm')).toHaveValue('0,6');
    expect(screen.getByLabelText('Zvednutí karet nad G2 (P0-6), mm')).toHaveValue('2,4');
    expect(screen.getByLabelText('Tloušťka magnetu Ø 8, mm (lekce 11)')).toHaveValue('2');
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
