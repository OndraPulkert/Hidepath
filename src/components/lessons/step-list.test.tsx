import { screen } from '@testing-library/react';

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
    animationLink: animationLink('kapsa', 'B'),
  },
  { id: 'wrap-coin', title: 'Zabalte minci', body: 'Text kroku.', media: [] },
];

describe('StepList – odkaz na animaci postupu', () => {
  it('pod krokem s animationLink vykreslí odkaz na statickou stránku animace', () => {
    renderWithProviders(<StepList steps={steps} template={undefined} projectSlug="p" />);

    const link = screen.getByRole('link', { name: /Animace postupu/ });
    expect(link).toHaveAttribute('href', '/animace/kapsa-postup.html#B');
    expect(link).toHaveTextContent('Část B – 1. výtisk na líc');
    // Jen jeden krok má animaci – druhý odkaz nedostane.
    expect(screen.getAllByRole('link', { name: /Animace postupu/ })).toHaveLength(1);
  });
});
