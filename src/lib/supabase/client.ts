import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { appConfig } from '@/app/config';
import { type Database } from '@/lib/supabase/database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

/**
 * Veřejný Supabase klient (URL + anon key). Bez konfigurace je `null` a aplikace běží
 * v lokálním režimu bez účtu. Service-role key sem nikdy nepatří.
 */
export const supabase: AppSupabaseClient | null = appConfig.supabase.configured
  ? createClient<Database>(appConfig.supabase.url, appConfig.supabase.anonKey, {
      auth: {
        // Magic link (PKCE): kód v URL po návratu z e-mailu vymění klient za relaci sám.
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
