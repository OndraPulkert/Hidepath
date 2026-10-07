import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Segment, SegmentButton } from '@/components/ui/segment';
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
import { describeSignInError } from '@/features/auth/password';
import { readReturnTo } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';
import { supabase } from '@/lib/supabase/client';

const emailSchema = z.email({ error: 'Zadejte platnou e-mailovou adresu.' });

type Method = 'password' | 'link';
type FormState =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'error'; message: string; field?: 'email' | 'password' };

/** Odešle e-mail s odkazem (a s kódem, když ho šablona obsahuje). Odkaz funguje v prohlížeči. */
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

async function signInWithPassword(email: string, password: string): Promise<AuthErrorLike | null> {
  if (!supabase) return { message: 'Supabase není nastavený.' };
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  } catch {
    return { message: 'network', name: 'AuthRetryableFetchError' };
  }
}

/**
 * Přihlášení (Supabase Auth) dvěma způsoby:
 * - **E-mail a heslo** (výchozí) – funguje i v instalované PWA na iPhonu, kde se odkaz z e-mailu
 *   otevře v Safari s odděleným úložištěm. Heslo si člověk nastaví v Účtu po přihlášení odkazem.
 * - **Odkaz e-mailem** – zakládá účet (registrace heslem tu záměrně není). Návrat přes `returnTo`
 *   do callbacku. Volitelný krok s kódem z e-mailu zapíná `VITE_AUTH_EMAIL_CODE=1` (výchozí vypnuto).
 * Bez nakonfigurovaného Supabase stránka vysvětlí lokální režim.
 */
export function LoginPage() {
  const location = useLocation();
  const { session, authAvailable } = useSession();
  const returnTo = readReturnTo(location.search, routes.dashboard);
  // Přímé porovnání (ne volání funkce), aby Vite/minifier při vypnutém příznaku krok s kódem
  // z produkčního buildu úplně vypustil. Pravidlo je stejné jako `isEmailCodeEnabled`.
  const codeEnabled = import.meta.env.VITE_AUTH_EMAIL_CODE === '1';
  const [storage] = useState(resolvePendingLoginStorage);
  const [pending, setPending] = useState<PendingLogin | null>(() =>
    authAvailable && codeEnabled ? readPendingLogin(storage, Date.now()) : null,
  );
  const [method, setMethod] = useState<Method>(pending ? 'link' : 'password');
  const [email, setEmail] = useState(pending?.email ?? '');
  const [password, setPassword] = useState('');
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  // Pojistka proti dvojímu odeslání (dvojí ťuknutí, Enter + tlačítko) dřív, než se překreslí.
  const inFlight = useRef(false);

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

  const switchMethod = (next: Method) => {
    setMethod(next);
    setState({ kind: 'idle' });
  };

  const checkEmail = (): string | null => {
    const parsed = emailSchema.safeParse(email.trim());
    if (parsed.success) return parsed.data;
    setState({ kind: 'error', field: 'email', message: 'Zadejte platnou e-mailovou adresu.' });
    return null;
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = checkEmail();
    if (!address || inFlight.current) return;
    if (password.length === 0) {
      setState({ kind: 'error', field: 'password', message: 'Zadejte heslo.' });
      return;
    }
    inFlight.current = true;
    setState({ kind: 'busy' });
    const error = await signInWithPassword(address, password);
    inFlight.current = false;
    // Úspěch: SessionProvider zachytí relaci (onAuthStateChange) a stránka přesměruje na
    // návratovou adresu. Do té doby zůstává „Přihlašujeme…“.
    if (error) setState({ kind: 'error', message: describeSignInError(error) });
  };

  const submitLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = checkEmail();
    if (!address || inFlight.current) return;
    inFlight.current = true;
    setState({ kind: 'busy' });
    const error = await sendLoginEmail(address, returnTo);
    inFlight.current = false;
    if (error) {
      setState({ kind: 'error', message: describeSendError(error, codeEnabled).message });
      return;
    }
    setState({ kind: 'idle' });
    if (codeEnabled) updatePending(startPendingLogin(address));
    else setLinkSentTo(address);
  };

  const busy = state.kind === 'busy';
  const emailError = state.kind === 'error' && state.field === 'email' ? state.message : null;
  const passwordError = state.kind === 'error' && state.field === 'password' ? state.message : null;
  const formError = state.kind === 'error' && !state.field ? state.message : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[520px] flex-1 animate-hp-in px-page pt-[clamp(24px,6vw,72px)] pb-24">
        <div className="mb-8">
          <Brand asText />
        </div>
        <h1 className="mb-3 text-[clamp(28px,4vw,40px)]">Přihlášení</h1>
        <p className="mb-6 text-lead text-ink-2">
          Hidepath vás krok za krokem provede prvním koženým výrobkem. Postup se uloží k vašemu
          účtu.
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
        ) : codeEnabled && pending ? (
          <CodeStep
            pending={pending}
            onPendingChange={updatePending}
            onResend={async (address) => sendLoginEmail(address, returnTo)}
            onChangeEmail={() => {
              setEmail(pending.email);
              updatePending(null);
            }}
          />
        ) : linkSentTo ? (
          <Card tone="forest" role="status">
            <h2 className="text-h2">Odkaz jsme poslali</h2>
            <p className="mt-2 text-body">
              Poslali jsme ho na <strong>{linkSentTo}</strong>. Otevřete ho ve stejném prohlížeči,
              ve kterém jste o něj požádali. Platí asi hodinu.
            </p>
            <p className="mt-3 text-meta text-ink-2">
              Nepřišel? Zkontrolujte spam, nebo{' '}
              <button
                type="button"
                className="inline-flex min-h-touch items-center underline"
                onClick={() => setLinkSentTo(null)}
              >
                pošlete odkaz znovu
              </button>
              .
            </p>
          </Card>
        ) : (
          <Card>
            <Segment role="group" aria-label="Způsob přihlášení" className="mb-5 flex w-full">
              <SegmentButton
                active={method === 'password'}
                className="flex-1"
                onClick={() => switchMethod('password')}
              >
                E-mail a heslo
              </SegmentButton>
              <SegmentButton
                active={method === 'link'}
                className="flex-1"
                onClick={() => switchMethod('link')}
              >
                Poslat odkaz e-mailem
              </SegmentButton>
            </Segment>
            <form
              onSubmit={(event) =>
                void (method === 'password' ? submitPassword(event) : submitLink(event))
              }
              noValidate
              className="flex flex-col gap-4"
            >
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete={method === 'password' ? 'username' : 'email'}
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="jmeno@priklad.cz"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError ? (
                  <p id="email-error" role="alert" className="mt-1.5 text-meta text-cognac-deep">
                    {emailError}
                  </p>
                ) : null}
              </div>
              {method === 'password' ? (
                <div>
                  <Label htmlFor="password">Heslo</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={passwordError ? true : undefined}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  {passwordError ? (
                    <p
                      id="password-error"
                      role="alert"
                      className="mt-1.5 text-meta text-cognac-deep"
                    >
                      {passwordError}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {formError ? (
                <p role="alert" className="text-body text-cognac-deep">
                  {formError}
                </p>
              ) : null}
              {method === 'password' ? (
                <>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? 'Přihlašujeme…' : 'Přihlásit'}
                  </Button>
                  <p className="text-meta text-ink-2">
                    Poprvé tady? Zvolte „Poslat odkaz e-mailem“ – účet vznikne s prvním odkazem.
                  </p>
                </>
              ) : (
                <>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? 'Odesíláme…' : 'Poslat odkaz'}
                  </Button>
                  <p className="text-meta text-ink-2">
                    Na iPhonu v aplikaci na ploše použijte heslo – odkaz se otevře v Safari. Heslo
                    si nastavíte po přihlášení odkazem (Účet → Heslo).
                  </p>
                  <p className="text-meta text-ink-2">
                    Účet vznikne automaticky s prvním odkazem. Postup uložený v tomto prohlížeči se
                    po přihlášení přenese do vašeho účtu.
                  </p>
                </>
              )}
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
