import { screen } from '@testing-library/react';

import { renderApp } from '@/test/render';

describe('LessonPage', () => {
  it('má spodní lištu se třemi akcemi a odkaz zpět na projekt', async () => {
    renderApp('/projects/card-holder/lessons/03-stitching-chisels');

    const toolbar = await screen.findByRole('group', { name: 'Akce lekce' });
    expect(toolbar).toHaveTextContent('Zpět');
    expect(toolbar).toHaveTextContent('Na později');
    expect(toolbar).toHaveTextContent('Dokončit');

    expect(screen.getByRole('link', { name: /fáze projektu/i })).toHaveAttribute(
      'href',
      '/projects/card-holder',
    );
  });
});
