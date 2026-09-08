import { type Session as SupabaseSession } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { type Session, type SessionUser } from '@/features/auth/session';
import { supabase } from '@/lib/supabase/client';

export interface SessionContextValue {
  session: Session;
  /** Přihlášení je k dispozici (Supabase je nakonfigurovaný). */
  authAvailable: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function toUser(s: SupabaseSession | null): SessionUser | null {
  return s ? { id: s.user.id, email: s.user.email ?? null } : null;
}

/**
 * Relace ze Supabase Auth. Jediným zdrojem pravdy je `onAuthStateChange` (včetně události
 * INITIAL_SESSION), takže se stav nikdy nepřepíše starší odpovědí z `getSession()`.
 * Bez konfigurace je uživatel trvale `anonymous` a ochrana tras vypnutá.
 */
export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: Session | undefined;
}) {
  const [session, setSession] = useState<Session>(
    () => initialSession ?? { status: supabase ? 'loading' : 'anonymous', user: null },
  );

  useEffect(() => {
    if (!supabase || initialSession) return;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession({ status: s ? 'authenticated' : 'anonymous', user: toUser(s) });
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [initialSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      authAvailable: supabase !== null,
      signOut: async () => {
        if (!supabase) return;
        // Odhlásit jen toto zařízení – telefon v dílně zůstane přihlášený (§10 offline použití).
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) console.error('[auth] Odhlášení selhalo', error);
      },
    }),
    [session],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession musí být uvnitř SessionProvider.');
  return value;
}
