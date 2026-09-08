const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Veřejná konfigurace klienta. Sem patří jen hodnoty, které smí být v prohlížeči.
 */
export const appConfig = {
  name: 'Hidepath',
  tagline: 'From first cut to finished craft.',
  /**
   * Ochrana tras je zapnutá, jakmile je nakonfigurovaný Supabase (účet + magic link).
   * Bez konfigurace běží aplikace lokálně bez přihlášení (vývoj, ukázka).
   */
  authGuardEnabled: supabaseConfigured,
  supabase: {
    configured: supabaseConfigured,
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  },
} as const;
