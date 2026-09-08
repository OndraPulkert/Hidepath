import {
  isNavItemActive,
  primaryNavItems,
  resolveHomeRoute,
  routes,
  CARD_HOLDER_SLUG,
} from './routes';

describe('routes', () => {
  it('sestaví dynamické cesty s parametry', () => {
    expect(routes.shoppingItem('stitching-chisels')).toBe('/shopping/stitching-chisels');
    expect(routes.project(CARD_HOLDER_SLUG)).toBe('/projects/card-holder');
    expect(routes.lesson(CARD_HOLDER_SLUG, '02-straight-cut')).toBe(
      '/projects/card-holder/lessons/02-straight-cut',
    );
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
  const [dashboard, shopping, , project] = primaryNavItems;

  it('zvýrazní Nákupy i na detailu položky', () => {
    expect(isNavItemActive(shopping!, '/shopping')).toBe(true);
    expect(isNavItemActive(shopping!, '/shopping/veg-tan-leather')).toBe(true);
    expect(isNavItemActive(shopping!, '/shoppingx')).toBe(false);
  });

  it('zvýrazní Projekt a lekce i v detailu lekce', () => {
    expect(isNavItemActive(project!, '/projects/card-holder/lessons/02-straight-cut')).toBe(true);
  });

  it('přehled není aktivní na jiných trasách', () => {
    expect(isNavItemActive(dashboard!, '/workshop')).toBe(false);
  });
});
