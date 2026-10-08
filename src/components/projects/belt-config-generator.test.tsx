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
    expect(table).toHaveTextContent(/Poutko\s*120\smm\s×\s12\smm/);
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

  it('změřená tloušťka 3,6 s čárkou: dřík z přesné hodnoty, 10/6 sedí', async () => {
    const { user } = setup();
    await user.clear(field(/Tloušťka/));
    await user.type(field(/Tloušťka/), '3,6');
    const row = screen.getByRole('rowheader', { name: 'Nýty' }).closest('tr')!;
    expect(row).toHaveTextContent(/dřík\s6\smm/);
    expect(row).toHaveTextContent(/5,7–6,2\smm/);
    expect(row).toHaveTextContent(/CraftPoint 10\/6/);
    expect(screen.getByRole('button', { name: 'Vygenerovat listy A4' })).toBeEnabled();
  });

  it('tloušťka 3,4: rozsah dříku bez ověřeného nýtu, poctivě řečeno', async () => {
    const { user } = setup();
    await user.clear(field(/Tloušťka/));
    await user.type(field(/Tloušťka/), '3,4');
    const row = screen.getByRole('rowheader', { name: 'Nýty' }).closest('tr')!;
    expect(row).toHaveTextContent(/5,3–5,8\smm; ověřený nýt s takovým dříkem nemáme/);
  });

  it('neplatná tloušťka: hlášení a listy nejdou vygenerovat', async () => {
    const { user } = setup();
    await user.clear(field(/Tloušťka/));
    await user.type(field(/Tloušťka/), '4,2');
    expect(screen.getByRole('alert')).toHaveTextContent(/3,0–4,0\smm/);
    expect(screen.getByRole('button', { name: 'Vygenerovat listy A4' })).toBeDisabled();
  });

  it('7 dírek po 30 mm: list 2 se na A4 nevejde, list 1 se pořád vytiskne', async () => {
    const { user, onGenerated } = setup();
    await user.click(screen.getByText('Dírky (pokročilé)'));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.type(field(/Rozteč/), '30');
    await user.type(field(/Konec → první dírka/), '100');
    const table = screen.getByRole('table', { name: /Vaše čísla/ });
    expect(table).toHaveTextContent(/100 \/ 130 \/ 160 \/ 190 \/ 220 \/ 250 \/ 280\smm/);
    expect(table).toHaveTextContent(/nevejde se na A4/);
    expect(screen.getByText(/^List 2 se na A4 nevejde/)).toHaveTextContent(
      /Dírky a konec značte podle čísel v tabulce. List 1 \(konec u přezky a poutko\) se vytiskne/,
    );
    expect(screen.queryByText(/vytiskněte list 2/)).toBeNull();
    expect(
      screen.getByText(/^Za řadu 1 značte dírky a konec podle čísel v tabulce/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    // Regrese: dřív se tlačítko schovalo a nešel ani list 1.
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy A4' }));
    const sheets = onGenerated.mock.calls[0]![0];
    expect(sheets.map((s) => s.id)).toEqual(['zmerena-prezka']);
    expect(await screen.findByRole('status')).toHaveTextContent(/List 1 pro .* je připravený/);
  });

  it('předvyplněný Ø dírky mimo meze: rozbalí „Dírky (pokročilé)“ a řekne proč', async () => {
    setup({
      form: {
        width: '40',
        thickness: '3,5',
        waist: '',
        waistSource: 'pasek',
        tip: 'hrot',
        holeCount: '5',
        holeSpacing: '',
        apexToFirst: '',
        holeDiameter: '6,5',
      },
      filled: ['šířka', 'Ø dírky (trn + 0,5 mm)'],
      problems: ['Trn 5,8 mm je na výsečníky 4,5–6 mm moc silný (potřeba Ø 6,5 mm).'],
    });
    expect(await screen.findByText(/Trn 5,8\smm je na výsečníky/)).toBeInTheDocument();
    expect(screen.getByText('Dírky (pokročilé)').closest('details')).toHaveAttribute('open');
    expect(field(/Ø dírky/)).toHaveValue('6,5');
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
    // Regrese: smazání bylo hned a bez cesty zpět.
    expect(within(section).getByText(/Pásek „Společenský“ smazán/)).toBeInTheDocument();
    await user.click(within(section).getByRole('button', { name: 'Vrátit pásek Společenský' }));
    expect(await within(section).findByText('Společenský')).toBeInTheDocument();
    expect(within(section).getByText(/Pásek „Společenský“ vrácen/)).toBeInTheDocument();
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
      problems: [],
    });
    expect(await screen.findByText(/Předvyplněno ze zápisníku:/)).toBeInTheDocument();
    expect(field(/Šířka = přezka/)).toHaveValue('35');
  });
});
