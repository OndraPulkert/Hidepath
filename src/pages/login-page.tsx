import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { routes } from '@/app/routes';
import { Brand } from '@/components/layout/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { buildEmailRedirectUrl } from '@/features/auth/magic-link';
import { readReturnTo } from '@/features/auth/session';
import { useSession } from '@/features/auth/session-provider';
import { supabase } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.email({ error: 'Zadejte platnou e-mailovou adresu.' }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SendState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string };

/**
 * Přihlášení magic linkem (Supabase Auth, PKCE). Návratová adresa cestuje přes `returnTo`
 * až do callbacku. Bez nakonfigurovaného Supabase stránka vysvětlí, že aplikace běží lokálně.
 */
export function LoginPage() {
  const location = useLocation();
  const { session, authAvailable } = useSession();
  const returnTo = readReturnTo(location.search, routes.dashboard);
  const [state, setState] = useState<SendState>({ kind: 'idle' });

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  if (session.status === 'authenticated') return <Navigate to={returnTo} replace />;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    if (!supabase) return;
    setState({ kind: 'sending' });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: buildEmailRedirectUrl(
          window.location.origin,
          routes.authCallback,
          returnTo,
        ),
        shouldCreateUser: true,
      },
    });
    if (error) {
      setState({ kind: 'error', message: describeOtpError(error.message) });
      return;
    }
    setState({ kind: 'sent', email });
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
          pošleme vám odkaz e-mailem a postup se uloží k vašemu účtu.
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
        ) : state.kind === 'sent' ? (
          <Card tone="forest" role="status">
            <h2 className="text-h2">Odkaz je na cestě</h2>
            <p className="mt-2 text-body">
              Poslali jsme ho na <strong>{state.email}</strong>. Otevřete ho ve stejném prohlížeči,
              ve kterém jste o něj požádali. Platí asi hodinu.
            </p>
            <p className="mt-3 text-meta text-ink-2">
              Nepřišel? Zkontrolujte spam, nebo{' '}
              <button
                type="button"
                className="inline-flex min-h-touch items-center underline"
                onClick={() => setState({ kind: 'idle' })}
              >
                pošlete odkaz znovu
              </button>
              .
            </p>
          </Card>
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
                {state.kind === 'sending' ? 'Odesíláme…' : 'Poslat přihlašovací odkaz'}
              </Button>
              <p className="text-meta text-ink-2">
                Účet vznikne automaticky s prvním odkazem. Postup uložený v tomto prohlížeči se po
                přihlášení přenese do vašeho účtu.
              </p>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

function describeOtpError(message: string): string {
  if (/rate limit|too many|security purposes|after \d+ seconds/i.test(message))
    return 'Odkaz jsme posílali před chvílí. Počkejte minutu a zkuste to znovu.';
  if (/invalid/i.test(message))
    return 'E-mailovou adresu se nepodařilo použít. Zkontrolujte ji a zkuste to znovu.';
  return 'Odkaz se nepodařilo odeslat. Zkuste to prosím za chvíli.';
}
