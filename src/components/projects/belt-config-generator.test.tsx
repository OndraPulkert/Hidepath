import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { BeltConfigGenerator } from '@/components/projects/belt-config-generator';
import { type GeneratedPatternSheet } from '@/components/projects/generated-sheet';
import { renderWithProviders } from '@/test/render';

const project = { slug: 'pasek-test', contentVersion: 1 };

function setup(initial?: Parameters<typeof BeltConfigGenerator>[0]['initial']) {
  const onGenerated = vi.fn<(sheets: GeneratedPatternSheet[]) => void>();
  renderWithProviders(
    <BeltConfigGenerator
      project={project}
      baseSheets={[]}
      onGenerated={onGenerated}
      initial={initial}
    />,
  );
  return { user: userEvent.setup(), onGenerated };
}

const field = (name: string | RegExp) => screen.getByRole('textbox', { name });

describe('Váš pásek', () => {
  it('výchozí 40 × 3,5 mm: čísla z podkladů a destička ano', async () => {
    setup();
    const table = await screen.findByRole('table', { name: /Vaše čísla/ });
    expect(table).toHaveTextContent(/Poutko\s*109\smm\s×\s12\smm/);
    expect(table).toHaveTextContent(/94,3 \/ 119,3 \/ 144,3 \/ 169,3 \/ 194,3\smm/);
    expect(table).toHaveTextContent(/dřík\s6\smm/);
    expect(screen.getByText('Destička: ano')).toBeInTheDocument();
  });

  it('obvod spočítá délku pásu a nabídky z podkladů', async () => {
    const { user } = setup();
    await user.type(field(/Obvod, cm/), '95');
    expect(screen.getByRole('table', { name: /Vaše čísla/ })).toHaveTextContent(
      /aspoň 119\scm \(obvod \+ 234,3\smm\)/,
    );
    expect(screen.getByRole('link', { name: /CraftPoint/ })).toHaveAttribute(
      'href',
      'https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm',
    );
  });

  it('zaoblený 45 mm: destička jen pro řadu 3, důvod u řady 2; přezku ověřte', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Zaoblený' }));
    await user.clear(field(/Šířka = přezka/));
    await user.type(field(/Šířka = přezka/), '45');
    expect(screen.getByText('Destička: jen řada 3')).toBeInTheDocument();
    expect(screen.getByText('Za řadu 2 vytiskněte list 2.')).toBeInTheDocument();
    expect(
      screen.getByText(/Řada 2 – zaoblený konec: ne \(oblouk je jen pro 30 a 40\smm\)/),
    ).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Přezka' }).closest('tr')).toHaveTextContent(
      /ověřte u prodejce/,
    );
  });

  it('neplatná tloušťka: hlášení a listy nejdou vygenerovat', async () => {
    const { user } = setup();
    await user.clear(field(/Tloušťka/));
    await user.type(field(/Tloušťka/), '3,6');
    expect(screen.getByRole('alert')).toHaveTextContent(/po 0,25/);
    expect(screen.getByRole('button', { name: 'Vygenerovat listy A4' })).toBeDisabled();
  });

  it('vygeneruje oba listy; 7 dírek dá list 2 na šířku', async () => {
    const { user, onGenerated } = setup();
    await user.click(screen.getByText('Dírky (pokročilé)'));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy A4' }));
    const sheets = onGenerated.mock.calls[0]![0];
    expect(sheets.map((s) => [s.id, s.orientation])).toEqual([
      ['zmerena-prezka', 'portrait'],
      ['zmerena-spicka', 'landscape'],
    ]);
    expect(sheets[0]!.variant).toBe('Váš pásek: 40 mm · 3,5 mm · hrot · 7 dírek');
    expect(sheets[0]!.url).toMatch(/^data:image\/svg\+xml/);
    expect(await screen.findByRole('status')).toHaveTextContent(/jsou připravené níže/);
  });

  it('uloží pásek do Mých pásků a načte ho zpátky', async () => {
    const { user } = setup();
    await user.clear(field(/Šířka = přezka/));
    await user.type(field(/Šířka = přezka/), '30');
    await user.type(field(/Obvod, cm/), '92');
    await user.type(field('Název pásku'), 'Společenský');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    expect(await screen.findByText(/Pásek „Společenský“ uložen/)).toBeInTheDocument();
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(within(section).getByText('Společenský')).toBeInTheDocument();

    await user.clear(field(/Šířka = přezka/));
    await user.type(field(/Šířka = přezka/), '45');
    await user.click(screen.getByRole('button', { name: 'Načíst pásek Společenský' }));
    expect(field(/Šířka = přezka/)).toHaveValue('30');
    expect(field(/Obvod, cm/)).toHaveValue('92');

    await user.click(screen.getByRole('button', { name: 'Smazat pásek Společenský' }));
    expect(await within(section).findByText(/Zatím nic/)).toBeInTheDocument();
  });

  it('předvyplnění ze zápisníku ukáže, co se vzalo', async () => {
    setup({
      form: {
        width: '35',
        thickness: '3,75',
        waist: '',
        waistSource: 'pasek',
        tip: 'hrot',
        holeCount: '5',
        holeSpacing: '',
        apexToFirst: '',
        holeDiameter: '',
      },
      filled: ['šířka', 'tloušťka'],
    });
    expect(await screen.findByText(/Předvyplněno ze zápisníku:/)).toBeInTheDocument();
    expect(field(/Šířka = přezka/)).toHaveValue('35');
  });
});
