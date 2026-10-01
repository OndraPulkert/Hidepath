/**
 * Jediné místo s definicí URL. Komponenty i testy používají tyto buildery,
 * nikdy ručně psané řetězce.
 */
export const routes = {
  home: '/',
  login: '/login',
  authCallback: '/auth/callback',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  shopping: '/shopping',
  workshop: '/workshop',
  offline: '/offline',
  /** S `projectSlug` detail ukáže požadavek toho projektu (např. z lekce neaktivního projektu). */
  shoppingItem: (toolSlug: string, projectSlug?: string) =>
    `/shopping/${encodeURIComponent(toolSlug)}${projectSlug ? `?projekt=${encodeURIComponent(projectSlug)}` : ''}`,
  project: (projectSlug: string) => `/projects/${encodeURIComponent(projectSlug)}`,
  lesson: (projectSlug: string, lessonSlug: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
  template: (projectSlug: string) => `/projects/${encodeURIComponent(projectSlug)}/template`,
  /** Cvičné listy 1:1 (trénink na odřezku), vlastní tisková stránka vedle šablony. */
  practiceSheets: (projectSlug: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/practice-sheets`,
} as const;

/** Vzory tras pro React Router (s parametry). */
export const routePatterns = {
  shoppingItem: '/shopping/:toolSlug',
  project: '/projects/:projectSlug',
  lesson: '/projects/:projectSlug/lessons/:lessonSlug',
  template: '/projects/:projectSlug/template',
  practiceSheets: '/projects/:projectSlug/practice-sheets',
} as const;

/**
 * Kam poslat uživatele z kořenové adresy: bez aktivního projektu na onboarding,
 * jinak na přehled.
 */
export function resolveHomeRoute(hasActiveEnrollment: boolean): string {
  return hasActiveEnrollment ? routes.dashboard : routes.onboarding;
}

export interface NavItem {
  to: string;
  /** Cesty, při kterých je položka zvýrazněná jako aktivní (kromě přesné shody). */
  matchPrefixes: readonly string[];
  label: string;
}

/**
 * Hlavní navigace shellu – čtyři položky podle schváleného prototypu. „Projekt a lekce“
 * vede na aktivní projekt (volba z přehledu), proto se položky skládají podle jeho slugu.
 */
export function primaryNavItemsFor(activeProjectSlug: string): readonly NavItem[] {
  return [
    { to: routes.dashboard, label: 'Přehled', matchPrefixes: [routes.dashboard] },
    { to: routes.shopping, label: 'Nákupy', matchPrefixes: [routes.shopping] },
    { to: routes.workshop, label: 'Dílna', matchPrefixes: [routes.workshop] },
    {
      to: routes.project(activeProjectSlug),
      label: 'Projekt a lekce',
      matchPrefixes: ['/projects'],
    },
  ];
}

/** Zda je položka navigace aktivní pro danou cestu. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
