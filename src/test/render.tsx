import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { AppProviders } from '@/app/providers';
import { appRoutes } from '@/app/router';
import { createMemoryStorage } from '@/features/data/local-collection';
import { createLocalRepositories, type Repositories } from '@/features/data/repositories';

/** Nové in-memory repozitáře pro každý test – žádný sdílený stav mezi testy. */
export function createTestRepositories(): Repositories {
  return createLocalRepositories(createMemoryStorage());
}

/** Vykreslí celou aplikaci (skutečné trasy) na zadané adrese. */
export function renderApp(
  initialUrl: string,
  options: { repositories?: Repositories; routes?: RouteObject[] } = {},
) {
  const repositories = options.repositories ?? createTestRepositories();
  const router = createMemoryRouter(options.routes ?? appRoutes, { initialEntries: [initialUrl] });
  return {
    router,
    repositories,
    ...render(
      <AppProviders repositories={repositories}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}

/** Vykreslí izolovanou komponentu uvnitř routeru a providerů. */
export function renderWithProviders(
  ui: ReactElement,
  { initialUrl = '/', ...options }: RenderOptions & { initialUrl?: string } = {},
) {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [initialUrl] });
  return render(
    <AppProviders repositories={createTestRepositories()}>
      <RouterProvider router={router} />
    </AppProviders>,
    options,
  );
}

/** Nastaví `navigator.onLine` pro test a vyvolá odpovídající událost. */
export function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}
