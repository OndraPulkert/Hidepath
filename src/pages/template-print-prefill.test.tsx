import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import {
  LEGACY_LID_RECORD_IDS as OLD,
  LID_RECORD_IDS,
  LID_SHEETS_FIELD_ID,
  LID_V12_RESULTS,
} from '@/content/projects/lid-wallet/record-ids';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { parseLidSheetsValue, serializeLidSheets } from '@/features/lid-wallet/lid-sheets-state';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { DEFAULT_LID_GENERATOR_FORM } from '@/lib/patterns/lid-wallet-input';
import { createTestRepositories, renderApp } from '@/test/render';

const entry = (fieldId: string, value: number | string): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: lidWalletProject.slug,
  lessonSlug: 'x',
  fieldId,
  value,
  contentVersion: lidWalletProject.contentVersion,
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
});

async function repositoriesWith(entries: LessonRecordEntry[]) {
  const repositories = createTestRepositories();
  for (const e of entries) await repositories.lessonRecords.upsert(e);
  return repositories;
}

/** Uložený stav formuláře listů v zápisníku. */
async function savedState(repositories: ReturnType<typeof createTestRepositories>) {
  const record = (await repositories.lessonRecords.list()).find(
    (r) => r.fieldId === LID_SHEETS_FIELD_ID,
  );
  return record ? parseLidSheetsValue(record.value) : null;
}

describe('tisk listů Víčka – formulář je jediný zdroj, staré zápisy se převedou', () => {
  it('převezme staré zápisy lekcí, po uložení je zapíše jako stav formuláře a staré nesmaže', async () => {
    const user = userEvent.setup();
    const old = [
      entry(OLD.p1Thickness, 1.0),
      entry(OLD.d1Thickness, 0.75),
      entry(OLD.d2Thickness, 0.8),
      entry(OLD.liningThickness, 0.9),
      entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.crackedAgain),
      entry(OLD.kMeasured, 1.3),
    ];
    const repositories = await repositoriesWith(old);
    renderApp(routes.template(lidWalletProject.slug), { repositories });

    const note = await screen.findByText(/Převzato ze zápisníku – zkontrolujte a uložte:/);
    expect(note.parentElement).toHaveTextContent(
      'P1 1,0, D1 0,75, D2 0,8, L1 0,9, záloha B1 (ztenčený ohyb dna), k 1,3 (lekce 10)',
    );
    expect(screen.getByLabelText('P1 (kaštan, useň 1,0), mm')).toHaveValue('1,0');
    expect(screen.getByLabelText('Přepážka D1, mm')).toHaveValue('0,75');
    expect(screen.getByLabelText('Přepážka D2, mm')).toHaveValue('0,8');
    expect(screen.getByLabelText('Podšívka L1, mm')).toHaveValue('0,9');
    expect(screen.getByRole('checkbox', { name: /B1 – ztenčit pás ohybu dna/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /B2 – ztenčit pás závěsu/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /celý P1/ })).not.toBeChecked();
    expect(screen.getByLabelText('k (P0-3, lekce 2 a 10)')).toHaveValue('1,3');
    expect(await savedState(repositories)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Uložit a vygenerovat listy' }));
    expect(
      await screen.findByText(
        /jsou vygenerované níže; tiskne se jen to, co je v seznamu listů zaškrtnuté/,
      ),
    ).toHaveTextContent(/P1 1,0 · přepážky 0,8 · L1 0,9 · ohyb dna ztenčený na 0,6 · k 1,3/);
    await waitFor(async () =>
      expect(await savedState(repositories)).toEqual({
        form: {
          ...DEFAULT_LID_GENERATOR_FORM,
          p1: '1,0',
          d1: '0,75',
          d2: '0,8',
          lining: '0,9',
          skiveFold: true,
          p0: { ...DEFAULT_LID_GENERATOR_FORM.p0, k: '1,3' },
        },
        trialOutsideLimits: false,
      }),
    );
    expect(screen.getByText('Uloženo. Lekce teď ukazují tyto hodnoty.')).toBeInTheDocument();
    // Staré zápisy zůstávají (bez náhrobků).
    const records = await repositories.lessonRecords.list();
    for (const e of old) {
      expect(records.find((r) => r.fieldId === e.fieldId)?.value, e.fieldId).toBe(e.value);
    }
  });

  it('z uloženého formuláře listy rovnou vygeneruje a nic nepřevádí', async () => {
    const form = { ...DEFAULT_LID_GENERATOR_FORM, d1: '0,7', d2: '0,8', lining: '0,9' };
    const repositories = await repositoriesWith([
      entry(LID_SHEETS_FIELD_ID, serializeLidSheets(form, false)),
      // Starší zápis lekce se neuplatní (není novější než uložený formulář).
      { ...entry(OLD.p1Thickness, 1.2), updatedAt: '2026-10-01T00:00:00.000Z' },
    ]);
    renderApp(routes.template(lidWalletProject.slug), { repositories });

    expect(
      await screen.findByText(
        /jsou vygenerované níže; tiskne se jen to, co je v seznamu listů zaškrtnuté/,
      ),
    ).toHaveTextContent(/P1 1,0 · přepážky 0,8 · L1 0,9/);
    expect(screen.getByLabelText('Přepážka D1, mm')).toHaveValue('0,7');
    expect(screen.queryByText(/Převzato ze zápisníku/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /^List střihu:/ })).toHaveLength(4);
  });

  it('výsledek zkoušky V12 s jinou zálohou než ve formuláři formulář ohlásí', async () => {
    const form = { ...DEFAULT_LID_GENERATOR_FORM, d1: '0,7', d2: '0,8', lining: '0,9' };
    const repositories = await repositoriesWith([
      entry(LID_SHEETS_FIELD_ID, serializeLidSheets(form, false)),
      entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked),
    ]);
    renderApp(routes.template(lidWalletProject.slug), { repositories });
    expect(
      await screen.findByText(/platí záloha A \(P1 z usně 0,8\), ve formuláři je výchozí střih/),
    ).toBeInTheDocument();
  });

  it('bez zápisů formulář nepředvyplní a poznámku neukáže', async () => {
    renderApp(routes.template(lidWalletProject.slug));
    expect(await screen.findByLabelText('P1 (kaštan, useň 1,0), mm')).toHaveValue('1,0');
    expect(screen.getByLabelText('Přepážka D1, mm')).toHaveValue('');
    expect(screen.queryByText(/Převzato ze zápisníku/)).not.toBeInTheDocument();
  });
});

describe('tisk listů Víčka – zkušební kus mimo meze se uloží a pamatuje', () => {
  it('potvrzené listy mimo meze uloží s příznakem a po otevření je vygeneruje znovu', async () => {
    const user = userEvent.setup();
    const repositories = await repositoriesWith([
      entry(OLD.p1Thickness, 1.1),
      entry(OLD.d1Thickness, 0.9),
      entry(OLD.d2Thickness, 0.8),
      entry(OLD.liningThickness, 0.9),
    ]);
    const first = renderApp(routes.template(lidWalletProject.slug), { repositories });

    await user.click(await screen.findByRole('button', { name: 'Uložit a vygenerovat listy' }));
    expect(await screen.findByText(/překračuje ověřené meze/)).toBeInTheDocument();
    // Hodnoty se uložily i bez listů (jsou naměřené); listy zatím nevznikly.
    await waitFor(async () => expect((await savedState(repositories))?.form.p1).toBe('1,1'));
    expect((await savedState(repositories))?.trialOutsideLimits).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Přesto vygenerovat pro zkušební kus' }));
    await user.click(screen.getByRole('button', { name: 'Ano, vygenerovat pro zkušební kus' }));
    expect(await screen.findByText(/Listy pro zkušební kus/)).toBeInTheDocument();
    expect(screen.queryByText(/V lekci 1 zapište/)).not.toBeInTheDocument();
    await waitFor(async () =>
      expect((await savedState(repositories))?.trialOutsideLimits).toBe(true),
    );
    first.unmount();

    renderApp(routes.template(lidWalletProject.slug), { repositories });
    const group = (
      await screen.findByText('Zkušební kus mimo ověřené meze: P1 1,1 · přepážky 0,9 · L1 0,9')
    ).parentElement!;
    expect(within(group).getAllByRole('checkbox')).toHaveLength(4);
  });
});

describe('tisk listů Víčka – příznak listů netvrdí „v mezích“ po změně', () => {
  it('uložené hodnoty, se kterými listy nevzniknou, smažou dřívější „v ověřených mezích“', async () => {
    const user = userEvent.setup();
    const form = { ...DEFAULT_LID_GENERATOR_FORM, d1: '0,7', d2: '0,8', lining: '0,9' };
    const repositories = await repositoriesWith([
      entry(LID_SHEETS_FIELD_ID, serializeLidSheets(form, false)),
    ]);
    renderApp(routes.template(lidWalletProject.slug), { repositories });
    const p1 = await screen.findByLabelText('P1 (kaštan, useň 1,0), mm');
    await user.clear(p1);
    await user.type(p1, '1,1');
    const d1 = screen.getByLabelText('Přepážka D1, mm');
    await user.clear(d1);
    await user.type(d1, '0,9');
    await user.click(screen.getByRole('button', { name: 'Uložit a vygenerovat listy' }));
    expect(await screen.findByText(/překračuje ověřené meze/)).toBeInTheDocument();
    await waitFor(async () => expect((await savedState(repositories))?.form.p1).toBe('1,1'));
    expect((await savedState(repositories))?.trialOutsideLimits).toBeNull();
  });
});

describe('tisk listů – předvýběr listu z odkazu', () => {
  it('?list=<id> zaškrtne jen ten list', async () => {
    renderApp(routes.template(lidWalletProject.slug, 'rub'));
    const fieldset = (await screen.findByText('Co vytisknout')).closest('fieldset')!;
    const rub = within(fieldset).getByRole('checkbox', { name: /^List 2/ });
    expect(rub).toBeChecked();
    expect(within(fieldset).getByRole('checkbox', { name: /^List 1/ })).not.toBeChecked();
    expect(screen.getAllByRole('img', { name: /^List střihu:/ })).toHaveLength(1);
  });

  it('s převzatou kůží nepředvybere výchozí list; po vygenerování vybere jen ten list', async () => {
    const user = userEvent.setup();
    const repositories = await repositoriesWith([
      entry(OLD.p1Thickness, 1.0),
      entry(OLD.d1Thickness, 0.75),
      entry(OLD.d2Thickness, 0.8),
      entry(OLD.liningThickness, 0.9),
    ]);
    renderApp(routes.template(lidWalletProject.slug, 'sablona'), { repositories });

    await screen.findByText(/Převzato ze zápisníku/);
    const fieldset = screen.getByText('Co vytisknout').closest('fieldset')!;
    expect(within(fieldset).getByRole('checkbox', { name: /^List 1/ })).not.toBeChecked();
    expect(screen.queryAllByRole('img', { name: /^List střihu:/ })).toHaveLength(0);
    expect(screen.getByRole('button', { name: /vytisknout/i })).toBeDisabled();
    expect(screen.getByText(/nejdřív vygenerujte listy pro svou kůži/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Uložit a vygenerovat listy' }));
    const images = await screen.findAllByRole('img', { name: /^List střihu:/ });
    expect(images).toHaveLength(1);
    const checked = within(fieldset)
      .getAllByRole('checkbox')
      .filter((c) => (c as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
    expect(checked[0]!.id).toBe('sheet-zmerena-sablona');
  });

  it('neznámé id listu ponechá výchozí výběr', async () => {
    renderApp(routes.template(lidWalletProject.slug, 'neni'));
    const fieldset = (await screen.findByText('Co vytisknout')).closest('fieldset')!;
    expect(within(fieldset).getByRole('checkbox', { name: /^List 1/ })).toBeChecked();
    expect(within(fieldset).getByRole('checkbox', { name: /^List 2/ })).toBeChecked();
  });
});
