import { matchPath } from 'react-router';

import { startingProject } from '@/content/projects';

import {
  isNavItemActive,
  primaryNavItemsFor,
  resolveHomeRoute,
  routePatterns,
  routes,
} from './routes';

// Trasy se testují proti skutečnému slugu prvního projektu, ne proti kopii řetězce.
const CARD_HOLDER_SLUG = startingProject.slug;

describe('routes', () => {
  it('sestaví dynamické cesty s parametry', () => {
    expect(routes.shoppingItem('stitching-chisels')).toBe('/shopping/stitching-chisels');
    expect(routes.project(CARD_HOLDER_SLUG)).toBe('/projects/card-holder');
    expect(routes.lesson(CARD_HOLDER_SLUG, '02-straight-cut')).toBe(
      '/projects/card-holder/lessons/02-straight-cut',
    );
  });

  it('dílenský režim lekce s volitelným krokem', () => {
    expect(routes.lessonFocus(CARD_HOLDER_SLUG, '02-straight-cut')).toBe(
      '/projects/card-holder/lessons/02-straight-cut/focus',
    );
    expect(routes.lessonFocus(CARD_HOLDER_SLUG, '02-straight-cut', 3)).toBe(
      '/projects/card-holder/lessons/02-straight-cut/focus?krok=3',
    );
    expect(routes.lessonFocus(CARD_HOLDER_SLUG, '02-straight-cut', 0)).toBe(
      '/projects/card-holder/lessons/02-straight-cut/focus?krok=0',
    );
  });

  it('vzor trasy dílenského režimu odpovídá builderu', () => {
    const match = matchPath(
      routePatterns.lessonFocus,
      routes.lessonFocus(CARD_HOLDER_SLUG, '02-straight-cut'),
    );
    expect(match?.params).toEqual({ projectSlug: 'card-holder', lessonSlug: '02-straight-cut' });
  });

  it('escapuje nebezpečné znaky ve slugu', () => {
    expect(routes.shoppingItem('a/b')).toBe('/shopping/a%2Fb');
  });
});

describe('resolveHomeRoute', () => {
  it('bez aktivního projektu vede na onboarding', () => {
    expect(resolveHomeRoute(false)).toBe(routes.onboarding);
  });

  it('s aktivním projektem vede na přehled', () => {
    expect(resolveHomeRoute(true)).toBe(routes.dashboard);
  });
});

describe('isNavItemActive', () => {
  const [dashboard, shopping, , project] = primaryNavItemsFor(CARD_HOLDER_SLUG);

  it('zvýrazní Nákupy i na detailu položky', () => {
    expect(isNavItemActive(shopping!, '/shopping')).toBe(true);
    expect(isNavItemActive(shopping!, '/shopping/veg-tan-leather')).toBe(true);
    expect(isNavItemActive(shopping!, '/shoppingx')).toBe(false);
  });

  it('zvýrazní Projekt a lekce i v detailu lekce', () => {
    expect(isNavItemActive(project!, '/projects/card-holder/lessons/02-straight-cut')).toBe(true);
  });

  it('Projekt a lekce vede na aktivní projekt', () => {
    expect(primaryNavItemsFor('coin-card-holder')[3]!.to).toBe(routes.project('coin-card-holder'));
  });

  it('přehled není aktivní na jiných trasách', () => {
    expect(isNavItemActive(dashboard!, '/workshop')).toBe(false);
  });
});

describe('předvýběr listů k tisku', () => {
  it('jeden list i víc listů jako opakovaný ?list=', () => {
    expect(routes.template('lid-wallet', 'sablona')).toBe(
      '/projects/lid-wallet/template?list=sablona',
    );
    expect(routes.template('lid-wallet', ['sablona', 'dily'])).toBe(
      '/projects/lid-wallet/template?list=sablona&list=dily',
    );
    expect(routes.template('lid-wallet')).toBe('/projects/lid-wallet/template');
  });
});
