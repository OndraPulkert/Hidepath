import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StepTimers } from '@/components/workshop/step-timers';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { type LessonStep } from '@/content/schema';
import { resetPermissionListenersForTests } from '@/features/timers/use-timers';
import { renderWithProviders } from '@/test/render';

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
    expect(within(card).getByText('Orientačně, řiďte se návodem na obalu.')).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Kratší' }));
    expect(within(card).getByRole('button', { name: /spustit 14/i })).toBeInTheDocument();
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

  it('bez notifikací vysvětlí, že pípne jen otevřený Hidepath', async () => {
    stubNotification('denied');
    const { user } = renderStep([{ id: 'tack', label: 'Zavadnutí', minutes: 10, basis: 'text' }]);
    const card = await screen.findByRole('region', { name: /zavadnutí/i });
    await user.click(within(card).getByRole('button', { name: /spustit/i }));
    expect(screen.getByText(/pípne jen otevřený hidepath/i)).toBeInTheDocument();
  });
});
