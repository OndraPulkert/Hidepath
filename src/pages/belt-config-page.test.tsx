import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import { BELT_ACTIVE_FIELD_ID, LEGACY_BELT_RECORD_IDS } from '@/content/projects';
import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { resolveActiveBelt } from '@/features/belt/active-belt';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type Repositories } from '@/features/data/repositories';
import { setActiveProjectPreference } from '@/features/projects/active-project-preference';
import { type BeltConfigInput } from '@/lib/patterns/belt-config';
import { enrollment } from '@/test/factories';
import { createTestRepositories, renderApp } from '@/test/render';

const SLUG = beltProject.slug;
const NOW = '2026-10-08T10:00:00.000Z';

async function record(
  repositories: Repositories,
  fieldId: string,
  value: string | number,
  updatedAt = NOW,
) {
  await repositories.lessonRecords.upsert({
    id: crypto.randomUUID(),
    userId: null,
    projectSlug: SLUG,
    lessonSlug: 'vas-pasek',
    fieldId,
    value,
    contentVersion: beltProject.contentVersion,
    createdAt: updatedAt,
    updatedAt,
  });
}

async function saveBelt(
  repositories: Repositories,
  name: string,
  input: BeltConfigInput,
  updatedAt = NOW,
): Promise<string> {
  const fieldId = newSavedBeltFieldId();
  await record(repositories, fieldId, serializeSavedBelt(name, input, 'pasek'), updatedAt);
  return fieldId;
}

async function beltRepos() {
  const repositories = createTestRepositories();
  await repositories.enrollments.upsert({ ...enrollment(SLUG), id: crypto.randomUUID() });
  setActiveProjectPreference(SLUG);
  return repositories;
}

const field = (name: string | RegExp) => screen.getByRole('textbox', { name });
/** Text bez ohledu na druh mezer (`typo` vkládá nezlomitelné). */
const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ');

afterEach(() => setActiveProjectPreference(null));

describe('stránka „Váš pásek“', () => {
  it('nahoře souhrn „Koupit“, pod ním zadání s Mými pásky a listy A4 k tisku', async () => {
    renderApp(routes.beltConfig(SLUG));
    expect(await screen.findByRole('heading', { level: 1, name: 'Váš pásek' })).toBeInTheDocument();
    const summary = await screen.findByRole('region', { name: 'Koupit' });
    const form = screen.getByRole('heading', { name: 'Zadání pásku' });
    // Souhrn je v dokumentu před formulářem.
    expect(summary.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Moje pásky' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Listy A4 k tisku' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /List 1 – konec u\spřezky/ })).toBeChecked();
  });

  it('jen u pásku: jiný projekt stránku nemá', async () => {
    renderApp(routes.beltConfig(cardHolderProject.slug));
    expect(
      await screen.findByRole('heading', { name: 'Tuhle stránku nemáme' }),
    ).toBeInTheDocument();
  });

  it('listy střihu pásku formulář nemají, jen odkaz na „Váš pásek“', async () => {
    renderApp(routes.template(SLUG));
    expect(await screen.findByRole('heading', { name: 'Listy pro váš pásek' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Otevřít Váš pásek/ })).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
    expect(screen.queryByRole('region', { name: 'Moje pásky' })).toBeNull();
    // Výchozí listy jdou vytisknout dál.
    expect(screen.getByRole('checkbox', { name: /List 1 – konec u\spřezky/ })).toBeChecked();
  });

  it('formulář se předvyplní z aktivního pásku a „Uložit“ ho přepíše', async () => {
    const repositories = await beltRepos();
    await saveBelt(
      repositories,
      'Starý',
      { widthMm: 35, thicknessMm: 3.5, tip: 'hrot' },
      '2026-10-01T10:00:00.000Z',
    );
    const chosen = await saveBelt(repositories, 'Do obleku', {
      widthMm: 30,
      thicknessMm: 3.6,
      tip: 'zaobleny',
      waistMm: 920,
    });
    await record(repositories, BELT_ACTIVE_FIELD_ID, chosen);
    const user = userEvent.setup();
    renderApp(routes.beltConfig(SLUG), { repositories });
    await screen.findByRole('region', { name: 'Moje pásky' });
    await waitFor(() => expect(field(/Šířka = přezka/)).toHaveValue('30'));
    expect(field(/Obvod, cm/)).toHaveValue('92');
    expect(field('Název pásku')).toHaveValue('Do obleku');
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(within(section).getByText('aktivní').closest('li')).toHaveTextContent('Do obleku');

    await user.clear(field(/Obvod, cm/));
    await user.type(field(/Obvod, cm/), '95');
    await user.click(within(section).getByRole('button', { name: 'Uložit' }));
    expect(await within(section).findByText(/Změny pásku „Do obleku“ uloženy/)).toBeInTheDocument();
    const state = resolveActiveBelt(await repositories.lessonRecords.list(), SLUG);
    expect(state.belts).toHaveLength(2);
    expect(state.active).toMatchObject({ name: 'Do obleku', input: { waistMm: 950 } });
  });

  it('načtení jiného pásku ho nastaví jako aktivní', async () => {
    const repositories = await beltRepos();
    await saveBelt(
      repositories,
      'Starý',
      { widthMm: 35, thicknessMm: 3.5, tip: 'hrot' },
      '2026-10-01T10:00:00.000Z',
    );
    await saveBelt(repositories, 'Nový', { widthMm: 40, thicknessMm: 3.5, tip: 'hrot' });
    const user = userEvent.setup();
    renderApp(routes.beltConfig(SLUG), { repositories });
    const section = await screen.findByRole('region', { name: 'Moje pásky' });
    await user.click(await within(section).findByRole('button', { name: 'Načíst pásek Starý' }));
    expect(await within(section).findByText(/Pásek „Starý“ je aktivní/)).toBeInTheDocument();
    expect(field(/Šířka = přezka/)).toHaveValue('35');
    await waitFor(async () =>
      expect(resolveActiveBelt(await repositories.lessonRecords.list(), SLUG).active?.name).toBe(
        'Starý',
      ),
    );
  });

  it('převod starých dat: zápisy lekce 1 předvyplní formulář a uloží se jako pásek', async () => {
    const repositories = await beltRepos();
    await record(repositories, LEGACY_BELT_RECORD_IDS.width, 35);
    await record(repositories, LEGACY_BELT_RECORD_IDS.waist, 95);
    const user = userEvent.setup();
    renderApp(routes.beltConfig(SLUG), { repositories });
    const note = (await screen.findByText(/Předvyplněno ze zápisníku:/)).closest('p')!;
    expect(note).toHaveTextContent(/šířka, obvod/);
    expect(field(/Šířka = přezka/)).toHaveValue('35');
    await user.click(screen.getByRole('button', { name: 'Uložit do Mých pásků' }));
    const section = screen.getByRole('region', { name: 'Moje pásky' });
    expect(await within(section).findByText('Pásek ze zápisníku')).toBeInTheDocument();
    const state = resolveActiveBelt(await repositories.lessonRecords.list(), SLUG);
    expect(state.legacy).toBeNull();
    expect(state.active).toMatchObject({ source: 'saved', input: { widthMm: 35, waistMm: 950 } });
  });

  it('odkaz na list s uloženým páskem: nejdřív vygenerovat, pak se list vybere sám', async () => {
    const repositories = await beltRepos();
    await saveBelt(repositories, 'Úzký', { widthMm: 30, thicknessMm: 3.5, tip: 'hrot' });
    const user = userEvent.setup();
    renderApp(routes.beltConfig(SLUG, 'prezka'), { repositories });
    expect(
      await screen.findByText(
        (_, el) => el?.tagName === 'P' && norm(el.textContent).includes('Nejdřív nahoře stiskněte'),
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy A4' }));
    const generated = await screen.findAllByRole('checkbox', { name: /List 1/ });
    expect(generated.filter((c) => (c as HTMLInputElement).checked)).toHaveLength(1);
    expect(screen.getByText(/Váš pásek: 30 mm/)).toBeInTheDocument();
  });
});

describe('vstupy do „Váš pásek“', () => {
  it('stránka projektu: nahoře „Začněte tady: Váš pásek“', async () => {
    const repositories = await beltRepos();
    renderApp(routes.project(SLUG), { repositories });
    const card = await screen.findByRole('region', { name: 'Začněte tady: Váš pásek' });
    expect(within(card).getByRole('link', { name: /Otevřít Váš pásek/ })).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
  });

  it('přehled s aktivním páskem ukáže kartu pásku', async () => {
    const repositories = await beltRepos();
    await saveBelt(repositories, 'Do obleku', { widthMm: 30, thicknessMm: 3.5, tip: 'hrot' });
    renderApp(routes.dashboard, { repositories });
    const card = await screen.findByRole('region', { name: 'Do obleku' });
    expect(card).toHaveTextContent(/30 mm · 3,5 mm · hrot · 5 dírek/);
    expect(within(card).getByRole('link', { name: /Upravit Váš pásek/ })).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
  });

  it('lekce 1: první krok odkazuje na „Váš pásek“', async () => {
    renderApp(routes.lesson(SLUG, '01-design-and-measure'));
    await screen.findByRole('heading', { name: 'Změřte obvod' });
    expect(screen.getAllByRole('link', { name: /Začněte tady: Váš pásek/ })[0]).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
    expect(screen.getByRole('link', { name: 'Co koupit' })).toHaveAttribute(
      'href',
      routes.shopping,
    );
  });

  it('lekce: bez pásku vyzve k zadání', async () => {
    renderApp(routes.lesson(SLUG, '04-buckle-end'));
    const card = await screen.findByRole('region', { name: 'Aktivní pásek' });
    expect(card).toHaveTextContent(/Pásek zatím není zadaný/);
    expect(within(card).getByRole('link', { name: /Zadat Váš pásek/ })).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
  });

  it('lekce: souhrn aktivního pásku, volba mezi pásky a „Změnit“', async () => {
    const repositories = await beltRepos();
    await saveBelt(
      repositories,
      'Úzký',
      { widthMm: 30, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 },
      '2026-10-01T10:00:00.000Z',
    );
    await saveBelt(repositories, 'Široký', {
      widthMm: 40,
      thicknessMm: 3.5,
      tip: 'hrot',
      waistMm: 950,
    });
    const user = userEvent.setup();
    renderApp(routes.lesson(SLUG, '04-buckle-end'), { repositories });
    const card = await screen.findByRole('region', { name: 'Aktivní pásek' });
    await within(card).findByText('Široký', { selector: 'p' });
    expect(card).toHaveTextContent(/Poutko\s*120 × 12\smm/);
    expect(card).toHaveTextContent(/Pás\s*aspoň 119\scm/);
    expect(within(card).getByRole('link', { name: /Změnit/ })).toHaveAttribute(
      'href',
      routes.beltConfig(SLUG),
    );
    await user.selectOptions(
      within(card).getByRole('combobox', { name: 'Pracuji na pásku' }),
      'Úzký',
    );
    expect(await within(card).findByText(/30 mm · 3,5 mm · hrot/)).toBeInTheDocument();
    const records = await repositories.lessonRecords.list();
    expect(resolveActiveBelt(records, SLUG).active?.name).toBe('Úzký');
    // Krok s poutkem bere číslo z aktivního pásku.
    const recalls = screen.getAllByRole('list', { name: 'Z aktivního pásku: Úzký' });
    expect(
      recalls.some((l) => /Poutko \(Váš pásek\):\s*100\s×\s12\smm/.test(l.textContent ?? '')),
    ).toBe(true);
  });

  it('„Připravte si“: list k tisku vede na „Váš pásek“', async () => {
    renderApp(routes.lesson(SLUG, '04-buckle-end'));
    const link = await screen.findByRole('link', { name: /List 1 – konec u\spřezky/ });
    expect(link).toHaveAttribute('href', routes.beltConfig(SLUG, 'prezka'));
  });
});
