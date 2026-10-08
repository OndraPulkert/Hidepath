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
    expect(links[0]).toHaveTextContent('Část B – značky na líc');
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

    const s7Links = within(stepItem('Šev S7 kolem magnetu')).getAllByRole('link');
    const [steh, magnet] = s7Links;
    expect(steh).toHaveAccessibleName(/Jak šít sedlářský steh/);
    expect(steh).toHaveAttribute('href', '/animace/sedlarsky-steh.html#E2');
    expect(steh).toHaveTextContent('Krok E2 – Zajistěte začátek i konec švu');
    expect(magnet).toHaveAccessibleName(/Animace postupu/);
    expect(magnet).toHaveAttribute('href', '/animace/vicko-magnet.html#B10');
    const thread = s7Links.find((l) => l.getAttribute('href') === '/animace/delka-nite.html');
    expect(thread).toHaveAccessibleName(/Jak odměřit nit/);

    const [hrany] = within(stepItem('Barevná horní hrana D1')).getAllByRole('link');
    expect(hrany).toHaveAccessibleName(/Jak na hrany/);
    expect(hrany).toHaveAttribute('href', '/animace/hrany.html#G2');
  });
});

describe('StepList – doplňky pod krokem', () => {
  it('vykreslí renderStepExtras pod každým krokem s indexem od 0', () => {
    renderWithProviders(
      <StepList
        steps={steps}
        template={undefined}
        projectSlug="p"
        renderStepExtras={(step, index) => <p>{`doplněk ${index}: ${step.id}`}</p>}
      />,
    );
    expect(within(stepItem('Orýsujte obrys')).getByText('doplněk 0: mark-outline')).toBeVisible();
    expect(within(stepItem('Přišijte kapsu')).getByText('doplněk 2: stitch-pocket')).toBeVisible();
  });
});

describe('StepList – odkazy na stránky aplikace', () => {
  it('pod krokem vykreslí tisk i další stránky v pořadí printLink → appLinks', () => {
    const linked: LessonStep[] = [
      {
        id: 'order',
        title: 'Objednejte',
        body: 'Text kroku (odkaz pod krokem).',
        media: [],
        printLink: 'pattern-sheets',
        appLinks: [
          { to: 'shopping', label: 'Co koupit' },
          { to: 'account', label: 'Účet' },
        ],
      },
    ];
    renderWithProviders(<StepList steps={linked} template={undefined} projectSlug="p" />);
    const links = within(stepItem('Objednejte')).getAllByRole('link');
    expect(links.map((l) => [l.textContent?.replace(/\s*→$/, ''), l.getAttribute('href')])).toEqual(
      [
        ['Listy střihu 1:1 k tisku', '/projects/p/template'],
        ['Co koupit', '/shopping'],
        ['Účet', '/account'],
      ],
    );
  });

  it('u pásku vede tisk listů na „Váš pásek“', () => {
    const belt = projects.find((p) => p.slug === 'belt')!;
    const step = belt.lessons[3]!.steps.find((s) => s.id === 'plate-or-sheet')!;
    renderWithProviders(
      <StepList
        steps={[step]}
        template={undefined}
        projectSlug={belt.slug}
        patternSheets={belt.patternSheets}
      />,
    );
    expect(screen.getByRole('link', { name: 'Váš pásek: listy A4 k tisku' })).toHaveAttribute(
      'href',
      '/projects/belt/vas-pasek',
    );
  });
});
