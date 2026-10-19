import { screen } from '@testing-library/react';

import { renderApp } from '@/test/render';

describe('LessonPage', () => {
  it('má spodní lištu se třemi akcemi a odkaz zpět na projekt', async () => {
    renderApp('/projects/card-holder/lessons/04-saddle-stitch');

    const toolbar = await screen.findByRole('group', { name: 'Akce lekce' });
    expect(toolbar).toHaveTextContent('Zpět');
    expect(toolbar).toHaveTextContent('Na později');
    expect(toolbar).toHaveTextContent('Dokončit');

    expect(screen.getByRole('link', { name: /fáze projektu/i })).toHaveAttribute(
      'href',
      '/projects/card-holder',
    );
  });

  it('volitelná lekce pásku má pruh „Volitelná lekce“ a říká, po které lekci je pásek hotový', async () => {
    renderApp('/projects/belt/lessons/07-decorative-stitch');
    const note = (await screen.findByText('Volitelná lekce.')).closest('[role="note"]');
    expect(note).toHaveTextContent(
      'Volitelná lekce. Pásek je hotový po lekci 6; přeskočte ji, když nešijete.',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ozdobný steh');
  });

  it('povinná lekce pruh volitelné lekce nemá', async () => {
    renderApp('/projects/belt/lessons/06-holes-and-tip');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/Volitelná lekce\./)).not.toBeInTheDocument();
  });
});
