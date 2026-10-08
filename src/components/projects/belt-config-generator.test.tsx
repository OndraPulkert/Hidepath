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

  it('u tloušťky pásu odkazuje na animaci měření posuvkou', async () => {
    setup();
    await screen.findByRole('table', { name: /Vaše čísla/ });
    expect(screen.getByRole('link', { name: 'Jak měřit posuvkou' })).toHaveAttribute(
      'href',
      '/animace/posuvka.html',
    );
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
        color: 'prirodni',
      },
      prong: '5,8',
      scrapFromStrap: false,
      loadedFieldId: null,
      name: 'Pásek ze zápisníku',
      legacy: {
        filled: ['šířka', 'Ø dírky (trn + 0,5 mm)'],
        problems: ['Trn 5,8 mm je na výsečníky 4,5–6 mm moc silný (potřeba Ø 6,5 mm).'],
      },
    });
    // Hlásí to předvyplnění i pole trnu pod „Dírky (pokročilé)“.
    expect(await screen.findAllByText(/Trn 5,8\smm je na výsečníky/)).toHaveLength(2);
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

  it('barva: výchozí přírodní; barevný chce vybrat barvu, černý ukáže černé nabídky a barvu na hrany', async () => {
    const { user } = setup();
    expect(screen.getByRole('button', { name: 'Přírodní' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('group', { name: 'Barva pásu (vyberte)' })).toBeNull();
    expect(screen.queryByText(/Barva na hrany/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Barevný' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Vyberte barvu pásu.');
    expect(screen.getByRole('button', { name: 'Vygenerovat listy A4' })).toBeDisabled();
    const colors = screen.getByRole('group', { name: 'Barva pásu (vyberte)' });
    expect(
      within(colors)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual([
      'Světle hnědá',
      'Hnědá',
      'Tmavě hnědá',
      'Koňak',
      'Tabák',
      'Černá',
      'Modrá',
      'Bordó',
      'Tmavě zelená',
    ]);

    await user.click(within(colors).getByRole('button', { name: 'Černá' }));
    await user.type(field(/Obvod, cm/), '95');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('table', { name: /Vaše čísla/ })).toHaveTextContent(/· černá/);
    expect(screen.getByText(/Barevný pás \(černá\) 40\smm/)).toBeInTheDocument();
    expect(screen.getByText(/Výchozí:/).querySelector('a')).toHaveAttribute(
      'href',
      'https://craft-point.cz/products/remen-z-prave-kuze-3-0-3-5mm-140cm-15-80mm-cerny',
    );
    // Přírodní pás mezi nabídkami černého není.
    expect(screen.getAllByRole('link').map((l) => l.getAttribute('href'))).not.toContain(
      'https://craft-point.cz/products/remen-z-prirodni-kuze-3-35mm-140cm-15-80mm',
    );
    expect(screen.getByText(/Barva na hrany, černá/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Přírodní' }));
    expect(screen.queryByRole('group', { name: 'Barva pásu (vyberte)' })).toBeNull();
    expect(screen.queryByText(/Barva na hrany/)).toBeNull();
  });

  it('tabák: pás bez uvedeného činění se nevybere, nabídka je jen „ověřte u prodejce“', async () => {
    const { user } = setup();
    await user.clear(field(/Šířka = přezka/));
    await user.type(field(/Šířka = přezka/), '32');
    await user.click(screen.getByRole('button', { name: 'Barevný' }));
    await user.click(screen.getByRole('button', { name: 'Tabák' }));
    expect(screen.queryByText(/Výchozí:/)).toBeNull();
    expect(screen.getByText('Kde koupit (ověřte u prodejce)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dva pásovci' })).toHaveAttribute(
      'href',
      'https://www.dvapasovci.cz/prirezy-kuze-na-opasky-tabak/',
    );
    expect(screen.getByText(/činění neuvedeno/)).toBeInTheDocument();
  });

  it('barva se uloží do Mých pásků a načte zpátky', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Barevný' }));
    await user.click(screen.getByRole('button', { name: 'Tmavě hnědá' }));
    await user.type(field('Název pásku'), 'Do kanceláře');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(await within(section).findByText('Do kanceláře')).toBeInTheDocument();
    expect(within(section).getByText(/· tmavě hnědá/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Přírodní' }));
    await user.click(screen.getByRole('button', { name: 'Načíst pásek Do kanceláře' }));
    expect(screen.getByRole('button', { name: 'Barevný' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Tmavě hnědá' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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

  it('načtený pásek: „Uložit“ ho přepíše i s novým názvem, „Uložit jako nový“ založí další', async () => {
    const { user } = setup();
    await user.type(field('Název pásku'), 'Hnědý');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(await within(section).findByText('Hnědý')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Načíst pásek Hnědý' }));
    expect(within(section).getByText(/Upravujete pásek „Hnědý“/)).toBeInTheDocument();
    await user.clear(field(/Šířka = přezka/));
    await user.type(field(/Šířka = přezka/), '35');
    await user.clear(field('Název pásku'));
    await user.type(field('Název pásku'), 'Hnědý 35');
    await user.click(within(section).getByRole('button', { name: 'Uložit' }));
    expect(await within(section).findByText(/Změny pásku „Hnědý 35“ uloženy/)).toBeInTheDocument();
    // Přejmenovaný na místě: starý název zmizel, nový záznam nevznikl.
    expect(within(section).queryByText('Hnědý')).toBeNull();
    expect(within(section).getAllByRole('button', { name: /^Načíst pásek/ })).toHaveLength(1);
    expect(within(section).getByText(/35 mm/)).toBeInTheDocument();

    await user.clear(field('Název pásku'));
    await user.type(field('Název pásku'), 'Černý');
    await user.click(within(section).getByRole('button', { name: 'Uložit jako nový' }));
    expect(await within(section).findByText(/Pásek „Černý“ uložen/)).toBeInTheDocument();
    expect(within(section).getAllByRole('button', { name: /^Načíst pásek/ })).toHaveLength(2);
  });

  it('název jiného pásku: zeptá se na stránce, „Zrušit“ nic nezmění, „Přepsat“ ho nahradí', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const { user } = setup();
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    await user.type(field('Název pásku'), 'Hnědý');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    await within(section).findByText('Hnědý');
    await user.clear(field('Název pásku'));
    await user.type(field('Název pásku'), 'Černý');
    await user.click(within(section).getByRole('button', { name: 'Uložit jako nový' }));
    await within(section).findByText('Černý');

    // Načtený „Černý“ přejmenovat na „hnědý“ = název, který už má jiný pásek.
    await user.click(screen.getByRole('button', { name: 'Načíst pásek Černý' }));
    await user.clear(field('Název pásku'));
    await user.type(field('Název pásku'), 'hnědý');
    await user.click(within(section).getByRole('button', { name: 'Uložit' }));
    const ask = within(section).getByRole('alertdialog');
    expect(ask).toHaveTextContent('Pásek „Hnědý“ už máte. Přepsat ho?');
    await user.click(within(ask).getByRole('button', { name: 'Zrušit' }));
    expect(within(section).queryByRole('alertdialog')).toBeNull();
    expect(within(section).getAllByRole('button', { name: /^Načíst pásek/ })).toHaveLength(2);

    await user.click(within(section).getByRole('button', { name: 'Uložit' }));
    await user.click(
      within(within(section).getByRole('alertdialog')).getByRole('button', { name: 'Přepsat' }),
    );
    expect(await within(section).findByText(/Pásek „hnědý“ přepsán/)).toBeInTheDocument();
    expect(within(section).getAllByRole('button', { name: /^Načíst pásek/ })).toHaveLength(1);
    expect(within(section).getByRole('button', { name: 'Načíst pásek hnědý' })).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('staré zápisy lekce 1: ukáže, co se vzalo, a nabídne je uložit jako pásek', async () => {
    const { user } = setup({
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
        color: 'prirodni',
      },
      prong: '',
      scrapFromStrap: false,
      loadedFieldId: null,
      name: 'Pásek ze zápisníku',
      legacy: { filled: ['šířka', 'tloušťka'], problems: [] },
    });
    expect((await screen.findByText(/Předvyplněno ze zápisníku:/)).closest('p')).toHaveTextContent(
      /uložte do „Mých pásků“/,
    );
    expect(field(/Šířka = přezka/)).toHaveValue('35');
    expect(field('Název pásku')).toHaveValue('Pásek ze zápisníku');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(await within(section).findByText('Pásek ze zápisníku')).toBeInTheDocument();
    expect(within(section).getByText('aktivní')).toBeInTheDocument();
  });

  it('souhrn „Koupit“ nahoře: délka, kterou objednat, přezka, šrouby, výsečníky a obchod', async () => {
    const { user } = setup();
    const summary = screen.getByRole('region', { name: 'Koupit' });
    expect(summary).toHaveTextContent(/délka: zadejte obvod/);
    await user.type(field(/Obvod, cm/), '95');
    expect(summary).toHaveTextContent(
      /Řemen: 40\smm široký, tloušťka 3,5\smm \(postup: 3–4\smm\), délka aspoň 119\scm → objednejte 130\scm/,
    );
    expect(summary).toHaveTextContent(/Přezka: 40\smm, jednotrnová/);
    expect(summary).toHaveTextContent(/Šrouby chicago: 2 ks, dřík 6\smm/);
    expect(summary).toHaveTextContent(/Výsečník: Ø 5 a Ø 6\smm/);
    expect(summary).toHaveTextContent(/Doporučeno: CraftPoint, 130\scm, 284\sKč/);
    expect(within(summary).getByRole('link', { name: 'další obchody níže' })).toBeInTheDocument();

    // Trénink na odřezku téhož řemene: + 15 cm. CraftPoint (130 cm) nestačí a skladem
    // s ověřeným činěním nic delšího pro 3,5 mm není: poctivě bez „objednejte“.
    await user.click(screen.getByRole('checkbox', { name: /Trénink na odřezku téhož řemene/ }));
    expect(summary).toHaveTextContent(/aspoň 119\scm \+ 15\scm na odřezek = 134\scm/);
    expect(summary).not.toHaveTextContent(/objednejte/);
    expect(summary).toHaveTextContent(/Doporučený obchod není/);

    // Pás 3,9 mm (Leatory řeže 130 / 140 / 150 cm): objedná se nejbližší delší, 140 cm.
    await user.clear(field(/Tloušťka/));
    await user.type(field(/Tloušťka/), '3,9');
    expect(summary).toHaveTextContent(/= 134\scm → objednejte 140\scm/);
    expect(summary).toHaveTextContent(/Doporučeno: Leatory, 140\scm/);
  });

  it('trn přezky vyplní Ø dírky (trn + 0,5 mm nahoru na výsečník)', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Dírky (pokročilé)'));
    await user.type(field(/Trn přezky/), '4,2');
    expect(field(/Ø dírky/)).toHaveValue('5');
    expect(
      screen.getByText(/Ø dírky 5\smm \(trn \+ 0,5\smm, nahoru na výsečník/),
    ).toBeInTheDocument();
  });
});
