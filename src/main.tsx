import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers';
import { createAppRouter } from '@/app/router';

import '@/styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Chybí element #root.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={createAppRouter()} />
    </AppProviders>
  </StrictMode>,
);
