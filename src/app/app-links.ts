import { routes } from '@/app/routes';
import { type AppLink, type ProjectDefinition } from '@/content/schema';

/**
 * Adresa odkazu pod krokem (`step.appLinks`). Obsah říká jen klíč stránky, adresu skládá
 * aplikace. Listy střihu pásku se tisknou ze stránky „Váš pásek“ (tam jsou listy pro váš
 * pásek), proto `pattern-sheets` u pásku vede tam.
 */
export function appLinkHref(
  to: AppLink['to'],
  project: Pick<ProjectDefinition, 'slug' | 'patternSheets'>,
): string {
  const slug = project.slug;
  switch (to) {
    case 'belt-config':
      return routes.beltConfig(slug);
    case 'lid-sheets':
      return routes.lidSheets(slug);
    case 'pattern-sheets':
      return project.patternSheets?.browserGenerator === 'belt-config'
        ? routes.beltConfig(slug)
        : routes.template(slug);
    case 'template':
      return routes.template(slug);
    case 'practice-sheets':
      return routes.practiceSheets(slug);
    case 'shopping':
      return routes.shopping;
    case 'workshop':
      return routes.workshop;
    case 'account':
      return routes.account;
    case 'dashboard':
      return routes.dashboard;
  }
}
