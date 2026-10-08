import { appLinkHref } from '@/app/app-links';
import { routes } from '@/app/routes';
import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';

describe('odkazy pod krokem', () => {
  it('„Váš pásek“ má vlastní stránku a listy střihu pásku se tisknou z ní', () => {
    expect(routes.beltConfig('belt')).toBe('/projects/belt/vas-pasek');
    expect(routes.beltConfig('belt', 'prezka')).toBe('/projects/belt/vas-pasek?list=prezka');
    expect(appLinkHref('belt-config', beltProject)).toBe('/projects/belt/vas-pasek');
    expect(appLinkHref('pattern-sheets', beltProject)).toBe('/projects/belt/vas-pasek');
  });

  it('ostatní projekty: listy, šablona, cvičné listy a stránky aplikace', () => {
    expect(appLinkHref('pattern-sheets', coinCardHolderProject)).toBe(
      routes.template(coinCardHolderProject.slug),
    );
    expect(appLinkHref('template', cardHolderProject)).toBe(
      routes.template(cardHolderProject.slug),
    );
    expect(appLinkHref('practice-sheets', cardHolderProject)).toBe(
      routes.practiceSheets(cardHolderProject.slug),
    );
    expect(appLinkHref('shopping', cardHolderProject)).toBe(routes.shopping);
    expect(appLinkHref('account', cardHolderProject)).toBe(routes.account);
    expect(appLinkHref('workshop', cardHolderProject)).toBe(routes.workshop);
    expect(appLinkHref('dashboard', cardHolderProject)).toBe(routes.dashboard);
  });
});
