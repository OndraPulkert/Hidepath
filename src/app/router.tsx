import { createBrowserRouter, type RouteObject } from 'react-router';

import { routePatterns, routes } from '@/app/routes';
import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/features/auth/require-auth';
import { AuthCallbackPage } from '@/pages/auth-callback-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { HomeRoute } from '@/pages/home-route';
import { LessonPage } from '@/pages/lesson-page';
import { LoginPage } from '@/pages/login-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { OfflinePage } from '@/pages/offline-page';
import { OnboardingPage } from '@/pages/onboarding-page';
import { ProjectPage } from '@/pages/project-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { ShoppingItemPage } from '@/pages/shopping-item-page';
import { ShoppingPage } from '@/pages/shopping-page';
import { TemplatePrintPage } from '@/pages/template-print-page';
import { WorkshopPage } from '@/pages/workshop-page';

/**
 * Trasy podle IMPLEMENTATION.md §6. Veřejné: /login, /auth/callback, /offline a onboarding –
 * uživatel si nejdřív vybere projekt (§2 krok 1) a teprve pak se přihlašuje; lokálně pořízený
 * výběr se po přihlášení přenese do účtu. Kořen a aplikační shell jsou chráněné.
 */
export const appRoutes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: routes.login, element: <LoginPage /> },
      { path: routes.authCallback, element: <AuthCallbackPage /> },
      { path: routes.offline, element: <OfflinePage /> },
      { path: routes.onboarding, element: <OnboardingPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: routes.home, element: <HomeRoute /> },
          {
            element: <AppShell />,
            children: [
              { path: routes.dashboard, element: <DashboardPage /> },
              { path: routes.shopping, element: <ShoppingPage /> },
              { path: routePatterns.shoppingItem, element: <ShoppingItemPage /> },
              { path: routes.workshop, element: <WorkshopPage /> },
              { path: routePatterns.project, element: <ProjectPage /> },
              { path: routePatterns.lesson, element: <LessonPage /> },
              { path: routePatterns.template, element: <TemplatePrintPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
