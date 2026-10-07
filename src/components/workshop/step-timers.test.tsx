import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers';
import { StepTimers } from '@/components/workshop/step-timers';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { type LessonStep } from '@/content/schema';
import { resetPermissionListenersForTests } from '@/features/timers/use-timers';
import { createTestRepositories, renderWithProviders } from '@/test/render';

const lesson = cardHolderProject.lessons[0]!;
const MIN = 60_000;

function renderStep(waits: LessonStep['waits']) {
  const step: LessonStep = { ...lesson.steps[0]!, waits };
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  renderWithProviders(<StepTimers project={cardHolderProject} lesson={lesson} step={step} />);
  return { user };
}

function stubNotification(permission: NotificationPermission) {
  const requestPermission = vi.fn(async () => Promise.resolve('granted' as const));
  vi.stubGlobal('Notification', { permission, requestPermission });
  return requestPermission;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date(2026, 9, 7, 20, 0, 0) });
  localStorage.clear();
  resetPermissionListenersForTests();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('StepTimers', () => {
  it('krok bez čekání nevykreslí nic', () => {
    renderWithProviders(
      <StepTimers project={cardHolderProject} lesson={lesson} step={lesson.steps[0]!} />,
    );
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('pevná doba z lekce nejde měnit', async () => {
    renderStep([{ id: 'set', label: 'Zatuhnutí', minutes: 60, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zatuhnutí/i });
    expect(within(card).getByText(/^Podle lekce: 1\sh$/)).toBeInTheDocument();
    expect(within(card).queryByRole('button', { name: 'Delší' })).not.toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Spustit 1\u00a0h' })).toBeInTheDocument();
  });

  it('rozsah z lekce jde měnit jen uvnitř rozsahu', async () => {
    const { user } = renderStep([
      { id: 'tack', label: 'Zavadnutí', minutes: 10, maxMinutes: 12, basis: 'text' },
    ]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    const shorter = within(card).getByRole('button', { name: 'Kratší' });
    const longer = within(card).getByRole('button', { name: 'Delší' });
    expect(shorter).toBeDisabled();
    await user.click(longer);
    await user.click(longer);
    expect(longer).toBeDisabled();
    expect(within(card).getByRole('button', { name: /spustit 12/i })).toBeInTheDocument();
  });

  it('doba podle návodu je orientační a jde upravit', async () => {
    const { user } = renderStep([
      { id: 'cure', label: 'Vytvrzení lepidla', minutes: 15, basis: 'manufacturer' },
    ]);
    const card = await screen.findByRole('region', { name: /vytvrzení/i });
    expect(
      within(card).getByText('Výchozí doba je jen orientační – nastavte ji podle návodu na obalu.'),
    ).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Kratší' }));
    expect(within(card).getByRole('button', { name: /spustit 14/i })).toBeInTheDocument();
  });

  it('odhad bez čísla v lekci (přes noc) neříká „Podle lekce“ a jde zkrátit', async () => {
    const { user } = renderStep([
      { id: 'night', label: 'Schnutí přes noc', minutes: 720, basis: 'estimate' },
    ]);
    const card = await screen.findByRole('region', { name: /schnutí/i });
    expect(within(card).queryByText(/Podle lekce/)).not.toBeInTheDocument();
    expect(within(card).getByText(/Orientační doba/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Kratší' }));
    expect(within(card).getByRole('button', { name: /spustit 11\sh/i })).toBeInTheDocument();
  });

  it('výchozí doba ze zápisníku (initialFromField) má přednost před dobou z obsahu', async () => {
    const coin = coinCardHolderProject;
    const l5 = coin.lessons.find((l) => l.steps.some((s) => s.id === 'dye-burnish-and-seal'))!;
    const step = l5.steps.find((s) => s.id === 'dye-burnish-and-seal')!;
    const repositories = createTestRepositories();
    await repositories.lessonRecords.upsert({
      id: crypto.randomUUID(),
      userId: null,
      projectSlug: coin.slug,
      lessonSlug: 'x',
      fieldId: 'edge-paint-dry-minutes',
      value: 60,
      contentVersion: coin.contentVersion,
      createdAt: '2026-10-07T10:00:00.000Z',
      updatedAt: '2026-10-07T10:00:00.000Z',
    });
    const router = createMemoryRouter(
      [{ path: '*', element: <StepTimers project={coin} lesson={l5} step={step} /> }],
      { initialEntries: ['/'] },
    );
    render(
      <AppProviders repositories={repositories}>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    const card = await screen.findByRole('region', { name: /barvy na hrany/i });
    expect(
      await within(card).findByRole('button', { name: 'Spustit 1\u00a0h' }),
    ).toBeInTheDocument();
    expect(within(card).getByText(/Podle vašeho zápisu: 1\sh/)).toBeInTheDocument();
  });

  it('běžící časovač jde zrušit', async () => {
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    expect(within(card).getByRole('timer')).toHaveTextContent('10:00');
    expect(within(card).getByText(/hotovo v\s20:10/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Zrušit časovač' }));
    expect(within(card).queryByRole('timer')).not.toBeInTheDocument();
    expect(localStorage.getItem('hidepath.v1.timers')).toBeNull();
  });

  it('doběhlý časovač ukáže hotovo a „Rozumím“ ho zavře', async () => {
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    act(() => vi.advanceTimersByTime(12 * MIN));
    expect(within(card).getByRole('status')).toHaveTextContent('✓ Hotovo · doběhlo před 2');
    await user.click(within(card).getByRole('button', { name: 'Rozumím' }));
    expect(within(card).getByRole('button', { name: /spustit/i })).toBeInTheDocument();
  });

  it('čekání přes noc nabídne kalendář', async () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const { user } = renderStep([
      { id: 'night', label: 'Schnutí přes noc', minutes: 720, maxMinutes: 1440, basis: 'text' },
    ]);
    const card = await screen.findByRole('region', { name: /schnutí/i });
    expect(within(card).getByText(/^Podle lekce: 12–24\sh$/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: /spustit 12/i }));
    expect(within(card).getByText(/hotovo zítra v\s8:00/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Přidat do kalendáře' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('o povolení notifikací žádá jen tlačítko „Upozornit mě“', async () => {
    const requestPermission = stubNotification('default');
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    // Před spuštěním časovače se nenabízí.
    expect(screen.queryByRole('button', { name: /upozornit mě/i })).not.toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    expect(requestPermission).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /upozornit mě/i }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('po doběhnutí už nenabízí „Upozornit mě“', async () => {
    stubNotification('default');
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    expect(screen.getByRole('button', { name: /upozornit mě/i })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(11 * MIN));
    expect(within(card).getByRole('status')).toHaveTextContent('✓ Hotovo');
    expect(screen.queryByRole('button', { name: /upozornit mě/i })).not.toBeInTheDocument();
  });

  it('kalendář u čekání přes noc vede na krok, kterým se pokračuje', async () => {
    let blob: Blob | undefined;
    const createObjectURL = vi.fn((b: Blob) => {
      blob = b;
      return 'blob:x';
    });
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const bend = lidWalletProject.lessons.find((l) => l.steps.some((s) => s.id === 'inspect'))!;
    const dry = bend.steps.find((s) => s.id === 'dry')!;
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    renderWithProviders(<StepTimers project={lidWalletProject} lesson={bend} step={dry} />);
    const card = await screen.findByRole('region', { name: /schnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit 12/i }));
    await user.click(within(card).getByRole('button', { name: 'Přidat do kalendáře' }));
    const inspect = bend.steps.findIndex((s) => s.id === 'inspect') + 1;
    const text = (await blob!.text()).replace(/\r\n /g, '');
    expect(text).toContain(`/lessons/${bend.slug}/focus?krok=${inspect}`);
    expect(text).not.toContain(`focus?krok=${inspect - 1}`);
  });

  it('bez notifikací vysvětlí, že pípne jen otevřený Hidepath', async () => {
    stubNotification('denied');
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    expect(screen.getByText(/pípne jen otevřený hidepath/i)).toBeInTheDocument();
  });
});
