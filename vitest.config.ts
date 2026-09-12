import { fileURLToPath, URL } from 'node:url';

import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [{ enforce: 'pre', ...mdx() }, react()],
  test: {
    environment: 'jsdom',
    // Unit testy běží bez Supabase (lokální režim); integrační test RLS má vlastní proměnné (pnpm test:db).
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      HIDEPATH_TEST_SUPABASE_URL: process.env.HIDEPATH_TEST_SUPABASE_URL ?? '',
      HIDEPATH_TEST_SUPABASE_ANON_KEY: process.env.HIDEPATH_TEST_SUPABASE_ANON_KEY ?? '',
      HIDEPATH_TEST_SUPABASE_SERVICE_KEY: process.env.HIDEPATH_TEST_SUPABASE_SERVICE_KEY ?? '',
      HIDEPATH_TEST_ALLOW_REMOTE: process.env.HIDEPATH_TEST_ALLOW_REMOTE ?? '',
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // `scripts/` je tu proto, že kreslicí skript potřebuje typy Node a v projektu
    // aplikace se importovat nedá. Bez toho ho žádný test neimportoval.
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.{test,spec}.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Virtuální modul vite-plugin-pwa v testech neexistuje – nahrazujeme stubem.
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/mocks/pwa-register.ts', import.meta.url),
      ),
    },
  },
});
