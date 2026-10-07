import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import {
  type AuthErrorLike,
  clearPendingLogin,
  describeSendError,
  describeVerifyError,
  isValidCode,
  normalizeCode,
  type PendingLogin,
  readPendingLogin,
  resolvePendingLoginStorage,
  savePendingLogin,
  secondsUntil,
  startPendingLogin,
} from '@/features/auth/email-code';
import { buildEmailRedirectUrl } from '@/features/auth/magic-link';
import { readReturnTo } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';
import { supabase } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.email({ error: 'Zadejte platnou e-mailovou adresu.' }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SendState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string };

/** Odešle e-mail s kódem i odkazem. Odkaz dál funguje v prohlížeči, kód v instalované PWA. */
async function sendLoginEmail(email: string, returnTo: string): Promise<AuthErrorLike | null> {
  if (!supabase) return { message: 'Supabase není nastavený.' };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildEmailRedirectUrl(window.location.origin, routes.authCallback, returnTo),
      shouldCreateUser: true,
    },
  });
  return error;
}

/**
 * Přihlášení bez hesla (Supabase Auth). E-mail nese odkaz (PKCE, návrat přes `returnTo` do
 * callbacku) i kód. Kód se opisuje do aplikace – na iPhonu se odkaz z instalované PWA otevře
 * v Safari s odděleným úložištěm. Rozpracovaný krok s kódem drží localStorage, aby přežil
 * přepnutí do Mailu a zpět. Bez nakonfigurovaného Supabase stránka vysvětlí lokální režim.
 */
export function LoginPage() {
  const location = useLocation();
  const { session, authAvailable } = useSession();
  const returnTo = readReturnTo(location.search, routes.dashboard);
  const [storage] = useState(resolvePendingLoginStorage);
  const [pending, setPending] = useState<PendingLogin | null>(() =>
    authAvailable ? readPendingLogin(storage, Date.now()) : null,
  );
  const [state, setState] = useState<SendState>({ kind: 'idle' });

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: pending?.email ?? '' },
  });

  const authenticated = session.status === 'authenticated';
  useEffect(() => {
    if (authenticated) clearPendingLogin(storage);
  }, [authenticated, storage]);

  if (authenticated) return <Navigate to={returnTo} replace />;

  const updatePending = (next: PendingLogin | null) => {
    if (next) savePendingLogin(storage, next);
    else clearPendingLogin(storage);
    setPending(next);
  };

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setState({ kind: 'sending' });
    const error = await sendLoginEmail(email, returnTo);
    if (error) {
      setState({ kind: 'error', message: describeSendError(error).message });
      return;
    }
    setState({ kind: 'idle' });
    updatePending(startPendingLogin(email));
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[520px] flex-1 animate-hp-in px-page pt-[clamp(24px,6vw,72px)] pb-24">
        <div className="mb-8">
          <Brand asText />
        </div>
        <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Přihlášení</h1>
        <p className="mb-6 text-lead text-ink-2">
          Hidepath vás krok za krokem provede prvním koženým výrobkem. Přihlášení je bez hesla:
          pošleme vám e-mail s kódem a odkazem a postup se uloží k vašemu účtu.
        </p>

        {!authAvailable ? (
          <Card tone="dashed">
            <p className="text-body">
              Přihlášení není v tomto prostředí nastavené. Aplikace ukládá postup jen v tomto
              prohlížeči.
            </p>
            <Button className="mt-4" asChild>
              <Link to={routes.dashboard} className="text-white no-underline hover:text-white">
                Pokračovat bez účtu
              </Link>
            </Button>
          </Card>
        ) : pending ? (
          <CodeStep
            pending={pending}
            onPendingChange={updatePending}
            onResend={async (email) => sendLoginEmail(email, returnTo)}
            onChangeEmail={() => {
              form.reset({ email: pending.email });
              updatePending(null);
            }}
          />
        ) : (
          <Card>
            <form
              onSubmit={(event) => void onSubmit(event)}
              noValidate
              className="flex flex-col gap-4"
            >
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="jmeno@priklad.cz"
                  aria-invalid={form.formState.errors.email ? true : undefined}
                  aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                  {...form.register('email')}
                />
                {form.formState.errors.email ? (
                  <p id="email-error" role="alert" className="mt-1.5 text-meta text-cognac-deep">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              {state.kind === 'error' ? (
                <p role="alert" className="text-body text-cognac-deep">
                  {state.message}
                </p>
              ) : null}
              <Button type="submit" disabled={state.kind === 'sending'} className="w-full">
                {state.kind === 'sending' ? 'Odesíláme…' : 'Poslat přihlašovací e-mail'}
              </Button>
              <p className="text-meta text-ink-2">
                Účet vznikne automaticky s prvním přihlášením. Postup uložený v tomto prohlížeči se
                po přihlášení přenese do vašeho účtu.
              </p>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

type CodeState =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'resending' }
  | { kind: 'resent' }
  | { kind: 'error'; message: string };

function CodeStep({
  pending,
  onPendingChange,
  onResend,
  onChangeEmail,
}: {
  pending: PendingLogin;
  onPendingChange: (next: PendingLogin) => void;
  onResend: (email: string) => Promise<AuthErrorLike | null>;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<CodeState>({ kind: 'idle' });
  const [now, setNow] = useState(() => Date.now());
  // Pojistka proti dvojímu odeslání (dvojí ťuknutí, Enter + tlačítko) dřív, než se překreslí.
  const inFlight = useRef(false);
  const cooldown = secondsUntil(pending.resendAt, now);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = normalizeCode(code);
    if (!isValidCode(token)) {
      setState({ kind: 'error', message: 'Opište celý kód z e-mailu, jen číslice.' });
      return;
    }
    if (!supabase || inFlight.current) return;
    inFlight.current = true;
    setState({ kind: 'verifying' });
    const { error } = await supabase.auth.verifyOtp({
      email: pending.email,
      token,
      type: 'email',
    });
    inFlight.current = false;
    // Úspěch: Supabase uloží relaci, SessionProvider ji zachytí (onAuthStateChange) a stránka
    // přesměruje na návratovou adresu – stejně jako po návratu z odkazu. Do té doby zůstává
    // „Ověřujeme…“, aby nešlo kód odeslat znovu.
    if (error) {
      setState({ kind: 'error', message: describeVerifyError(error, pending.sentAt, Date.now()) });
    }
  };

  const resend = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState({ kind: 'resending' });
    const error = await onResend(pending.email);
    inFlight.current = false;
    const at = Date.now();
    setNow(at);
    if (!error) {
      setCode('');
      onPendingChange(startPendingLogin(pending.email, at));
      setState({ kind: 'resent' });
      return;
    }
    const failure = describeSendError(error);
    if (failure.kind === 'cooldown') {
      onPendingChange({ ...pending, resendAt: at + failure.retryAfterSeconds * 1000 });
    }
    setState({ kind: 'error', message: failure.message });
  };

  const busy = state.kind === 'verifying' || state.kind === 'resending';

  return (
    <Card>
      <form onSubmit={(event) => void verify(event)} noValidate className="flex flex-col gap-4">
        <div role="status">
          <h2 className="text-h2">Opište kód z e-mailu</h2>
          <p className="mt-2 text-body">
            Poslali jsme ho na <strong>{pending.email}</strong>. Kód i odkaz platí asi hodinu.
          </p>
        </div>
        <p className="text-meta text-ink-2">
          Používáte Hidepath z plochy iPhonu? Opište kód – odkaz se otevře v Safari. V prohlížeči
          stačí kliknout na odkaz.
        </p>
        <div>
          <Label htmlFor="login-code">Kód z e-mailu</Label>
          <Input
            id="login-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="123456"
            className="font-mono tracking-[0.2em]"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-invalid={state.kind === 'error' ? true : undefined}
            aria-describedby={state.kind === 'error' ? 'code-error' : undefined}
          />
        </div>
        {state.kind === 'error' ? (
          <p id="code-error" role="alert" className="text-body text-cognac-deep">
            {state.message}
          </p>
        ) : null}
        {state.kind === 'resent' ? (
          <p role="status" className="text-body text-forest">
            Poslali jsme nový kód. Platí jen ten z posledního e-mailu.
          </p>
        ) : null}
        <Button type="submit" disabled={busy} className="w-full">
          {state.kind === 'verifying' ? 'Ověřujeme…' : 'Přihlásit'}
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busy || cooldown > 0}
            onClick={() => void resend()}
          >
            {state.kind === 'resending'
              ? 'Odesíláme…'
              : cooldown > 0
                ? `Poslat nový kód (za ${cooldown} s)`
                : 'Poslat nový kód'}
          </Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={onChangeEmail}>
            Změnit e-mail
          </Button>
        </div>
        <p className="text-meta text-ink-2">Nepřišel? Zkontrolujte spam.</p>
      </form>
    </Card>
  );
}
