/**
 * Jediné místo s definicí URL. Komponenty i testy používají tyto buildery,
 * nikdy ručně psané řetězce.
 */
/** Parametr dotazu s číslem kroku v dílenském režimu. */
export const LESSON_FOCUS_STEP_PARAM = 'krok';
/** Parametr dotazu na stránce tisku: id listu, který se má předvybrat (lze opakovat). */
export const PRINT_SHEET_PARAM = 'list';
/** Kotvy na stránce lekce (`routes.lesson(…, kotva)`). */
export const LESSON_ANCHORS = {
  checkpoints: 'kontrolni-body',
  /** Krok `n` od 1. */
  step: (n: number) => `krok-${n}`,
} as const;

export const routes = {
  home: '/',
  login: '/login',
  authCallback: '/auth/callback',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  /** Účet přihlášeného uživatele (nastavení hesla). */
  account: '/account',
  shopping: '/shopping',
  workshop: '/workshop',
  offline: '/offline',
  /** S `projectSlug` detail ukáže požadavek toho projektu (např. z lekce neaktivního projektu). */
  shoppingItem: (toolSlug: string, projectSlug?: string) =>
    `/shopping/${encodeURIComponent(toolSlug)}${projectSlug ? `?projekt=${encodeURIComponent(projectSlug)}` : ''}`,
  project: (projectSlug: string) => `/projects/${encodeURIComponent(projectSlug)}`,
  /** `anchor` = kotva na stránce (`LESSON_ANCHORS`), stránka se na ni posune. */
  lesson: (projectSlug: string, lessonSlug: string, anchor?: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/lessons/${encodeURIComponent(lessonSlug)}${
      anchor ? `#${anchor}` : ''
    }`,
  /**
   * Dílenský režim lekce na celou obrazovku. `step` = číslo kroku od 1 (`?krok=N`);
   * 0 = „Než začnete“ (příprava). Bez `step` začne stránka od začátku.
   */
  lessonFocus: (projectSlug: string, lessonSlug: string, step?: number) =>
    `/projects/${encodeURIComponent(projectSlug)}/lessons/${encodeURIComponent(lessonSlug)}/focus${
      step === undefined ? '' : `?${LESSON_FOCUS_STEP_PARAM}=${step}`
    }`,
  /** Šablona / listy střihu k tisku; `sheetId` předvybere list (`?list=<id>`). */
  template: (projectSlug: string, sheetId?: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/template${printSheetQuery(sheetId)}`,
  /** Cvičné listy 1:1 (trénink na odřezku), vlastní tisková stránka vedle šablony. */
  practiceSheets: (projectSlug: string, sheetId?: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/practice-sheets${printSheetQuery(sheetId)}`,
  /**
   * „Váš pásek“ (projekt s `browserGenerator: 'belt-config'`): zadání pásku, Moje pásky,
   * nákup a listy A4 k tisku; `sheetId` předvybere list k tisku.
   */
  beltConfig: (projectSlug: string, sheetId?: string) =>
    `/projects/${encodeURIComponent(projectSlug)}/vas-pasek${printSheetQuery(sheetId)}`,
} as const;

function printSheetQuery(sheetId: string | undefined): string {
  return sheetId ? `?${PRINT_SHEET_PARAM}=${encodeURIComponent(sheetId)}` : '';
}

/** Vzory tras pro React Router (s parametry). */
export const routePatterns = {
  shoppingItem: '/shopping/:toolSlug',
  project: '/projects/:projectSlug',
  lesson: '/projects/:projectSlug/lessons/:lessonSlug',
  lessonFocus: '/projects/:projectSlug/lessons/:lessonSlug/focus',
  template: '/projects/:projectSlug/template',
  practiceSheets: '/projects/:projectSlug/practice-sheets',
  beltConfig: '/projects/:projectSlug/vas-pasek',
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
