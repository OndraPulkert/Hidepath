import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { setActiveProjectPreference } from '@/features/projects/active-project-preference';

afterEach(() => {
  cleanup();
  // Volba aktivního projektu žije v modulu i v localStorage – nesmí přetéct do dalšího testu.
  setActiveProjectPreference(null);
});
