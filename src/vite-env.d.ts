/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Veřejná URL Supabase projektu (doplní se v Milníku 3). */
  readonly VITE_SUPABASE_URL?: string;
  /** Veřejný anon key Supabase. Service-role key sem nikdy nepatří. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Jen pro integrační testy (pnpm test:db); nikdy v klientském buildu. */
  readonly HIDEPATH_TEST_SUPABASE_URL?: string;
  readonly HIDEPATH_TEST_SUPABASE_ANON_KEY?: string;
  readonly HIDEPATH_TEST_SUPABASE_SERVICE_KEY?: string;
  readonly HIDEPATH_TEST_ALLOW_REMOTE?: string;
}
