import { screen, within } from '@testing-library/react';

import { StepList } from '@/components/lessons/step-list';
import { animationLink } from '@/content/animations';
import { type LessonStep } from '@/content/schema';
import { renderWithProviders } from '@/test/render';

const steps: LessonStep[] = [
  {
    id: 'mark-outline',
    title: 'Orýsujte obrys',
    body: 'Text kroku.',
    media: [],
    animationLinks: [animationLink('kapsa', 'B')],
  },
  { id: 'wrap-coin', title: 'Zabalte minci', body: 'Text kroku.', media: [] },
  {
    id: 'stitch-pocket',
    title: 'Přišijte kapsu',
    body: 'Text kroku.',
    media: [],
    animationLinks: [animationLink('pocketAttach', 'C'), animationLink('threadLength')],
  },
];

function stepItem(title: string): HTMLElement {
  return screen.getByRole('heading', { name: title }).closest('li')!;
}

describe('StepList – odkazy na animace postupu', () => {
  it('pod krokem s jedním odkazem vykreslí odkaz na statickou stránku animace', () => {
    renderWithProviders(<StepList steps={steps} template={undefined} projectSlug="p" />);

    const links = within(stepItem('Orýsujte obrys')).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(/Animace postupu/);
    expect(links[0]).toHaveAttribute('href', '/animace/kapsa-postup.html#B');
    expect(links[0]).toHaveTextContent('Část B – 1. výtisk na líc');
    // Krok bez odkazů nedostane žádné tlačítko.
    expect(within(stepItem('Zabalte minci')).queryAllByRole('link')).toHaveLength(0);
  });

  it('krok se dvěma odkazy vykreslí dvě tlačítka v pořadí, každé s vlastním textem', () => {
    renderWithProviders(<StepList steps={steps} template={undefined} projectSlug="p" />);

    const links = within(stepItem('Přišijte kapsu')).getAllByRole('link');
    expect(links).toHaveLength(2);
    const [animation, thread] = links;
    expect(animation).toHaveAccessibleName(/Animace postupu/);
    expect(animation).toHaveAttribute('href', '/animace/kapsa-prisiti.html#C');
    expect(animation).toHaveTextContent('Část C – prosekání skrz obě vrstvy');
    expect(thread).toHaveAccessibleName(/Jak odměřit nit/);
    expect(thread).toHaveAttribute('href', '/animace/delka-nite.html');
    expect(thread).toHaveTextContent('Kolik nitě na šev');
  });
});
