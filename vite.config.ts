import { fileURLToPath, URL } from 'node:url';

import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Produkční build bez Supabase by tiše nasadil aplikaci bez účtu a ochrany tras; build
  // mířící na lokální Supabase by v produkci nefungoval. Oboje zastavíme už při buildu.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (
    command === 'build' &&
    mode === 'production' &&
    process.env.HIDEPATH_ALLOW_LOCAL_BUILD !== '1'
  ) {
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      throw new Error(
        'Produkční build vyžaduje VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY (nebo HIDEPATH_ALLOW_LOCAL_BUILD=1 pro lokální ukázku bez účtu).',
      );
    }
    if (/localhost|127\.0\.0\.1/.test(env.VITE_SUPABASE_URL)) {
      throw new Error(
        'Produkční build míří na lokální Supabase. Pro lokální ověření buildu nastavte HIDEPATH_ALLOW_LOCAL_BUILD=1.',
      );
    }
  }

  return {
    plugins: [
      // MDX musí předběhnout React plugin (enforce: 'pre'), aby JSX z MDX prošlo stejnou transformací.
      { enforce: 'pre', ...mdx() },
      react(),
      tailwindcss(),
      VitePWA({
        // Aktualizace service workeru je explicitní UX stav („nová verze“), ne tichý reload.
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['icons/*.svg', 'icons/*.png'],
        manifest: {
          id: '/',
          name: 'Hidepath',
          short_name: 'Hidepath',
          description:
            'Průvodce prvním koženým výrobkem. Krok za krokem od nákupu nástrojů po poslední steh.',
          lang: 'cs',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#F4EFE6',
          theme_color: '#F4EFE6',
          categories: ['education', 'lifestyle'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // App shell: JS, CSS, HTML, self-hostované fonty (public/fonts) a ikony se precachují.
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // SPA fallback – všechny navigace obslouží precachovaný index.html,
          // včetně explicitní stránky /offline.
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: false,
          skipWaiting: false,
        },
        devOptions: {
          // Ve vývoji SW vypnutý; PWA chování se ověřuje na produkčním buildu (pnpm build && pnpm preview).
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});
