import { PasswordForm } from '@/components/account/password-form';
import { Card } from '@/components/ui/card';
import { type AuthErrorLike } from '@/features/auth/auth-errors';
import { useSession } from '@/features/auth/session-provider';
import { supabase } from '@/lib/supabase/client';

async function savePassword(password: string): Promise<AuthErrorLike | null> {
  if (!supabase) return { message: 'Supabase není nastavený.' };
  try {
    const { error } = await supabase.auth.updateUser({ password });
    return error;
  } catch {
    return { message: 'network', name: 'AuthRetryableFetchError' };
  }
}

/** Účet přihlášeného uživatele: e-mail a nastavení hesla pro přihlášení v aplikaci na ploše. */
export function AccountPage() {
  const { session } = useSession();
  const email = session.status === 'authenticated' ? (session.user?.email ?? '') : '';

  return (
    <div className="mx-auto max-w-[640px] py-10">
      <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Účet</h1>
      {email ? (
        <p className="mb-6 text-lead text-ink-2">
          Přihlášeni jako <strong className="text-leather">{email}</strong>.
        </p>
      ) : null}
      <Card>
        <h2 className="text-h2">Heslo</h2>
        <p className="mt-2 mb-5 text-body text-ink-2">
          S heslem se přihlásíte i v aplikaci na ploše iPhonu, kde odkaz z e-mailu nefunguje.
        </p>
        <PasswordForm email={email} onSave={savePassword} />
      </Card>
    </div>
  );
}
