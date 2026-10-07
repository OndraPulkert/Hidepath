import { screen, within } from '@testing-library/react';

import { StepList } from '@/components/lessons/step-list';
import { animationLink } from '@/content/animations';
import { projects } from '@/content/projects';
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

  it('Víčko: šev a hrana vykreslí tlačítka sedlářského stehu a hran s vlastním textem', () => {
    const lid = projects.find((p) => p.slug === 'lid-wallet')!;
    const lidSteps = lid.lessons
      .flatMap((l) => l.steps)
      .filter((s) => s.id === 's7' || s.id === 'd1-paint');
    renderWithProviders(<StepList steps={lidSteps} template={undefined} projectSlug={lid.slug} />);

    const [steh, thread] = within(stepItem('Šev S7 kolem magnetu')).getAllByRole('link');
    expect(steh).toHaveAccessibleName(/Jak šít sedlářský steh/);
    expect(steh).toHaveAttribute('href', '/animace/sedlarsky-steh.html#E2');
    expect(steh).toHaveTextContent('Krok E2 – Zpětné stehy na začátku i na konci švu');
    expect(thread).toHaveAccessibleName(/Jak odměřit nit/);

    const [hrany] = within(stepItem('Barevná horní hrana D1')).getAllByRole('link');
    expect(hrany).toHaveAccessibleName(/Jak na hrany/);
    expect(hrany).toHaveAttribute('href', '/animace/hrany.html#G2');
  });
});
