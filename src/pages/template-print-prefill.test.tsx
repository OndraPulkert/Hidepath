import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/routes';
import { LID_RECORD_IDS, LID_V12_VARIANTS } from '@/content/projects/lid-wallet/record-ids';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { type LessonRecordEntry } from '@/features/notebook/types';
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

describe('tisk listů Víčka – předvyplnění ze zápisníku', () => {
  it('předvyplní tloušťky, zálohu a P0 a vygeneruje stejné listy jako ruční zadání', async () => {
    const user = userEvent.setup();
    const repositories = createTestRepositories();
    for (const e of [
      entry(LID_RECORD_IDS.p1Thickness, 1.0),
      entry(LID_RECORD_IDS.d1Thickness, 0.75),
      entry(LID_RECORD_IDS.d2Thickness, 0.8),
      entry(LID_RECORD_IDS.liningThickness, 0.9),
      entry(LID_RECORD_IDS.v12Variant, LID_V12_VARIANTS.backupB1),
      entry(LID_RECORD_IDS.kMeasured, 1.3),
    ]) {
      await repositories.lessonRecords.upsert(e);
    }
    renderApp(routes.template(lidWalletProject.slug), { repositories });

    const note = await screen.findByText(/Předvyplněno ze zápisníku:/);
    expect(note.parentElement).toHaveTextContent(
      'P1, přepážky (větší z D1 a D2), podšívka L1, záloha B1, k',
    );
    expect(screen.getByLabelText('P1 (kaštan), mm')).toHaveValue('1,0');
    expect(screen.getByLabelText('Přepážky D1/D2, mm')).toHaveValue('0,8');
    expect(screen.getByLabelText('Podšívka L1, mm')).toHaveValue('0,9');
    expect(screen.getByRole('checkbox', { name: /B1 – ztenčit pás ohybu dna/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /B2 – ztenčit pás závěsu/ })).not.toBeChecked();
    expect(screen.getByLabelText('k (P0-3, lekce 10)')).toHaveValue('1,3');

    await user.click(screen.getByRole('button', { name: 'Vygenerovat listy' }));
    expect(await screen.findByText(/jsou připravené níže a zaškrtnuté k tisku/)).toHaveTextContent(
      /P1 1,0 · přepážky 0,8 · L1 0,9 · ohyb dna ztenčený na 0,6 · k 1,3/,
    );
  });

  it('bez zápisů formulář nepředvyplní a poznámku neukáže', async () => {
    renderApp(routes.template(lidWalletProject.slug));
    expect(await screen.findByLabelText('P1 (kaštan), mm')).toHaveValue('1,0');
    expect(screen.getByLabelText('Přepážky D1/D2, mm')).toHaveValue('');
    expect(screen.queryByText(/Předvyplněno ze zápisníku/)).not.toBeInTheDocument();
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

  it('neznámé id listu ponechá výchozí výběr', async () => {
    renderApp(routes.template(lidWalletProject.slug, 'neni'));
    const fieldset = (await screen.findByText('Co vytisknout')).closest('fieldset')!;
    expect(within(fieldset).getByRole('checkbox', { name: /^List 1/ })).toBeChecked();
    expect(within(fieldset).getByRole('checkbox', { name: /^List 2/ })).toBeChecked();
  });
});
